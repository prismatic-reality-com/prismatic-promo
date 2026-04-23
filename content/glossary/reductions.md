+++
title = "Reductions"
weight = 50

[extra]
description = "The BEAM virtual machine's unit of work measurement for process scheduling, where each process receives a reduction budget before being preempted, ensuring fair CPU distribution."
category = "platform"
domain = "runtime"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["scheduler", "run-queue", "runtime", "beam", "process-isolation", "throughput", "genserver", "nif", "dirty-scheduler", "garbage-collection", "telemetry", "profiling"]
tags = ["reductions", "beam", "scheduler", "preemption", "otp", "erlang", "elixir", "concurrency", "profiling", "dirty-scheduler", "nif", "fair-scheduling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Reductions are the BEAM's fundamental scheduling unit -- each process gets ~4000 reductions before preemption, enabling soft real-time guarantees across millions of concurrent processes."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Reductions", "BEAM", "scheduler", "preemption", "process", "glossary", "Prismatic Platform", "dirty scheduler", "NIF", "profiling", "recon"]
image = "/images/sections/glossary.png"
image_alt = "Reductions - Prismatic Platform"
word_count = 3400
see_also = ["architecture", "capabilities", "performance-testing", "telemetry"]
+++

## Definition

**Reductions** are the BEAM virtual machine's abstract unit of computational work. Every BEAM process is allocated a reduction budget (approximately 4,000 reductions by default) before the scheduler preempts it and moves to the next runnable process. A reduction roughly corresponds to a function call, but the exact mapping varies by operation -- some BIFs (built-in functions) consume multiple reductions, while simple arithmetic uses one.

This reduction-based preemptive scheduling is what gives Erlang and Elixir their soft real-time characteristics. Unlike cooperative scheduling (where processes must voluntarily yield), BEAM processes are forcibly context-switched after exhausting their reduction budget. This prevents any single process from monopolizing CPU time, regardless of what it is doing -- even infinite loops are safely preempted.

The reduction model is fundamental to understanding BEAM performance characteristics. When profiling Elixir applications, reductions serve as a CPU-time proxy that is independent of system load, clock speed, and scheduling delays. Two processes consuming the same number of reductions have done the same amount of computational work, regardless of when or on which core they executed.

## Core Concepts

### Reduction Budget and Preemption

Each BEAM process receives a budget of approximately 4,000 reductions per scheduling quantum. When a process exhausts its budget, the scheduler saves its state (instruction pointer, registers, stack pointer) and switches to the next runnable process. This context switch is measured in nanoseconds because BEAM processes are userspace constructs -- there is no kernel-level context switch, no TLB flush, no cache invalidation.

The budget value of ~4,000 is not configurable at runtime and represents a balance between fairness (smaller budgets = more frequent preemption = fairer scheduling) and throughput (larger budgets = less context-switch overhead = higher throughput). In practice, 4,000 reductions translate to roughly 1-2 milliseconds of CPU time per quantum, which provides adequate responsiveness for soft real-time systems.

### Reduction Costs by Operation

Different BEAM operations consume different numbers of reductions. Understanding these costs is essential for predicting scheduling behavior:

| Operation | Approximate Reduction Cost | Notes |
|-----------|--------------------------|-------|
| Function call | 1 | The baseline unit |
| Pattern match | 1 per clause tried | Multiple clauses = multiple reductions |
| `Enum.map/2` | 1 per element + function cost | Proportional to collection size |
| `Enum.reduce/3` | 1 per element + accumulator cost | Same proportionality |
| `binary_to_term/2` | Proportional to term size | Prevents large deserializations from blocking |
| `:lists.sort/1` | ~n log n | Bumped proportionally to prevent sort-blocking |
| `ets:lookup/2` | 1 (small result) | ETS operations are BIFs with controlled costs |
| `ets:insert/2` | 1-few | Depends on table type and key count |
| `binary:match/2` | Proportional to search size | Prevents long string searches from blocking |
| `io:format/2` | Variable | I/O operations yield at driver level |
| `receive` (match found) | Proportional to messages scanned | Scanning N messages before match costs ~N |
| `receive` (no match) | Yields immediately | Process suspends, removed from run queue |
| `Process.sleep/1` | 0 (yields immediately) | Timer-based, not reduction-based |

### Scheduler Architecture

The BEAM maintains one run queue per scheduler thread. By default, one scheduler is created per CPU core (controllable via `+S` flag). Each scheduler independently pulls processes from its run queue and executes them until they exhaust reductions, perform I/O, or enter a receive wait.

| Scheduler Type | Purpose | Reduction Accounting | Thread Count |
|---------------|---------|---------------------|-------------|
| **Normal** | Regular Erlang/Elixir code | Full tracking | 1 per core (default) |
| **Dirty CPU** | Long-running CPU-bound NIFs | No tracking | 1 per core (default) |
| **Dirty I/O** | Blocking I/O NIFs | No tracking | 10 (default, configurable) |

Work stealing occurs when a scheduler's run queue is empty: it steals processes from busy schedulers' queues. The migration logic balances load across schedulers while minimizing cache-unfriendly migrations.

## Technical Deep Dive

### NIF Challenges and Dirty Schedulers

NIFs (Native Implemented Functions) execute C/Rust code directly on the scheduler thread. Because NIF code runs outside the BEAM's instruction dispatch loop, reductions are not counted during NIF execution. A NIF that runs for 100ms will block its scheduler thread for the entire duration, preventing all other processes on that scheduler from executing.

Three solutions exist, each with different tradeoffs:

**1. Yielding NIFs** -- The NIF periodically calls `enif_consume_timeslice()` to report progress and voluntarily yield:

```c
// C NIF that yields every ~1ms of work
static ERL_NIF_TERM my_nif(ErlNifEnv* env, int argc, const ERL_NIF_TERM argv[]) {
    int percent = 0;
    while (work_remaining()) {
        do_chunk_of_work();
        percent += 10;
        if (enif_consume_timeslice(env, percent)) {
            // Reschedule - scheduler can run other processes
            return enif_schedule_nif(env, "my_nif", 0, my_nif_continue, argc, argv);
        }
    }
    return result;
}
```

**2. Dirty CPU Schedulers** -- Mark the NIF as dirty-CPU to run on a dedicated thread pool:

```c
static ErlNifFunc nif_funcs[] = {
    {"heavy_computation", 1, heavy_computation_nif, ERL_NIF_DIRTY_JOB_CPU_BOUND}
};
```

**3. Dirty I/O Schedulers** -- For NIFs that block on I/O (file, network, FFI to blocking libraries):

```c
static ErlNifFunc nif_funcs[] = {
    {"blocking_http_call", 1, blocking_http_nif, ERL_NIF_DIRTY_JOB_IO_BOUND}
};
```

The Prismatic Platform uses dirty schedulers for KuzuDB graph operations and Meilisearch NIF bindings, ensuring these potentially long-running operations do not block normal scheduler threads.

### Profiling with :recon

The `:recon` library provides production-safe profiling tools that leverage reduction counting:

```elixir
# Top 10 processes by reduction count (CPU usage proxy)
:recon.proc_count(:reductions, 10)
# Returns: [{pid, reduction_count, [registered_name | initial_call]}]

# Top 10 processes by reduction rate (current CPU consumers)
:recon.proc_window(:reductions, 10, 5000)
# Samples over 5000ms, returns processes with highest reduction delta

# Specific process info
:recon.info(pid, [:reductions, :message_queue_len, :memory, :current_function])
```

### Scheduler Utilization Monitoring

Scheduler utilization measures what fraction of time each scheduler spends executing code vs. waiting for work. This directly reflects reduction throughput:

```elixir
# Sample scheduler utilization
:scheduler.sample()
Process.sleep(1000)
result = :scheduler.utilization(:scheduler.sample())
# Returns: [{:total, 0.42, ""}, {:normal, 1, 0.55, ""}, {:normal, 2, 0.38, ""}, ...]
```

A scheduler at 90%+ utilization indicates potential saturation. At 100%, processes accumulate in run queues and latency increases. The BEAM's work-stealing mechanism helps, but persistent imbalance suggests either a hot process or uneven load distribution.

### Garbage Collection and Reductions

Each BEAM process has its own heap and garbage collector. GC runs are triggered by heap growth thresholds and consume reductions proportional to the live data size. This means:

- GC never stops the entire system (unlike JVM stop-the-world)
- A process with a large heap pays more reductions for GC
- Processes that accumulate large state (e.g., GenServers with big maps) spend more reductions on GC, reducing their throughput

The `Process.info(pid, :garbage_collection)` call reveals GC statistics including minor and major collection counts and total reclaimed bytes.

## Advanced Topics

### Reduction Count Overflow and Long-Running Processes

Reduction counts are stored as unsigned integers and can overflow on extremely long-lived processes. The `Process.info(pid, :reductions)` value wraps at 2^64 on 64-bit systems, which at typical rates would take centuries. However, when computing reduction deltas for monitoring, always use unsigned subtraction to handle potential wrap-around.

### Scheduler Collapse Scenarios

In pathological cases, all normal schedulers can become blocked simultaneously:

1. **NIF storm**: Many processes call a long-running non-dirty NIF simultaneously
2. **Driver bottleneck**: A port driver blocks in a synchronous callback
3. **Lock contention**: ETS table with heavy write contention causes scheduler spin-locks

The BEAM's `+sbwt` (scheduler busy wait threshold) parameter controls how long a scheduler spins before sleeping, affecting latency-throughput tradeoff under contention.

### Process Priority and Reduction Allocation

BEAM processes have four priority levels: `low`, `normal`, `high`, and `max`. Higher-priority processes are scheduled more frequently but still receive the same reduction budget per quantum. The effect is that high-priority processes get more scheduling quanta per unit time, not more reductions per quantum:

| Priority | Scheduling Frequency | Reduction Budget | Use Case |
|----------|---------------------|-----------------|----------|
| `max` | Always runs first | ~4,000 | Internal BEAM processes only |
| `high` | Before normal/low | ~4,000 | Time-critical GenServers |
| `normal` | Standard round-robin | ~4,000 | Default for all processes |
| `low` | Only when no normal+ ready | ~4,000 | Background batch processing |

## Usage in Prismatic Platform

Reduction monitoring is used in Prismatic Platform's performance analysis. The Quality Floor Guardian tracks reduction counts for critical GenServers (ToolRegistry, TopicRegistry, SourceRegistry) to detect computational regressions. A sudden increase in reductions per operation indicates an algorithm change or data growth that needs attention.

The platform avoids long-running synchronous operations in GenServers precisely because of reduction semantics -- a GenServer call that consumes millions of reductions would create tail latency for all other callers waiting in the GenServer's mailbox. Instead, expensive operations are delegated to Task processes supervised by TaskSupervisor.

The OSINT adapter execution pipeline uses `Task.async_stream` with `max_concurrency` limits. Each adapter execution task consumes reductions independently, and the BEAM's fair scheduling ensures that no single adapter monopolizes CPU even if it processes a large result set. Telemetry events track per-adapter reduction counts to identify adapters that are disproportionately expensive.

The platform's OTEL doctrine requires GenServer telemetry instrumentation. Reduction-based metrics complement wall-clock timing by revealing whether latency comes from CPU work (high reductions) or waiting (low reductions, high wall-clock time).

## Code Examples

### Reduction Tracker with Telemetry Integration

```elixir
defmodule PrismaticMonitor.ReductionTracker do
  @moduledoc """
  Tracks BEAM reduction counts for performance monitoring.
  Detects computational regressions in critical GenServers
  and emits telemetry events for observability dashboards.
  """

  require Logger

  @type measurement :: %{
    result: term(),
    reductions: non_neg_integer(),
    duration_us: non_neg_integer()
  }

  @doc """
  Measures the reduction cost and wall-clock time of a function.
  Useful for comparing CPU work vs. wait time.

  ## Examples

      iex> {result, stats} = ReductionTracker.measure(fn -> Enum.sum(1..1000) end)
      iex> stats.reductions > 0
      true

  """
  @spec measure((() -> term())) :: {term(), measurement()}
  def measure(fun) when is_function(fun, 0) do
    {:reductions, before_red} = Process.info(self(), :reductions)
    before_time = System.monotonic_time(:microsecond)

    result = fun.()

    after_time = System.monotonic_time(:microsecond)
    {:reductions, after_red} = Process.info(self(), :reductions)

    stats = %{
      result: result,
      reductions: after_red - before_red,
      duration_us: after_time - before_time
    }

    {result, stats}
  end

  @doc """
  Returns the total reduction count for a process.
  Returns `{:error, :not_alive}` if the process has terminated.
  """
  @spec process_reductions(pid()) :: {:ok, non_neg_integer()} | {:error, :not_alive}
  def process_reductions(pid) do
    case Process.info(pid, :reductions) do
      {:reductions, count} -> {:ok, count}
      nil -> {:error, :not_alive}
    end
  end

  @doc """
  Samples scheduler utilization over a time window.
  Returns per-scheduler utilization as a percentage.
  """
  @spec scheduler_utilization(pos_integer()) :: list({pos_integer(), float()})
  def scheduler_utilization(sample_ms \\ 1000) do
    sample1 = :scheduler.sample()
    Process.sleep(sample_ms)
    sample2 = :scheduler.sample()

    :scheduler.utilization(sample1, sample2)
    |> Enum.flat_map(fn
      {:normal, id, percent, _} -> [{id, percent}]
      _ -> []
    end)
  end

  @doc """
  Detects reduction-based regression against a baseline.
  Returns `:ok` if within threshold, `{:regression, ratio}` otherwise.
  """
  @spec detect_regression(non_neg_integer(), non_neg_integer(), float()) ::
          :ok | {:regression, float()}
  def detect_regression(current, baseline, threshold \\ 1.5) do
    ratio = current / max(baseline, 1)

    if ratio > threshold do
      Logger.warning("Reduction regression detected: #{ratio}x baseline",
        current: current,
        baseline: baseline,
        ratio: ratio
      )

      :telemetry.execute(
        [:prismatic, :monitor, :reduction_regression],
        %{ratio: ratio, current: current, baseline: baseline},
        %{}
      )

      {:regression, ratio}
    else
      :ok
    end
  end
end
```

### GenServer with Reduction-Aware Monitoring

```elixir
defmodule PrismaticMonitor.WatchedGenServer do
  @moduledoc """
  A GenServer wrapper that tracks reduction costs per callback.
  Emits telemetry for each handle_call/handle_cast with reduction counts.
  Used to detect computational regressions in critical platform services.
  """

  defmacro __using__(opts) do
    quote do
      use GenServer

      @before_compile PrismaticMonitor.WatchedGenServer
      @watched_name Keyword.get(unquote(opts), :name, __MODULE__)
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      defoverridable handle_call: 3, handle_cast: 2

      @impl GenServer
      def handle_call(msg, from, state) do
        {result, stats} =
          PrismaticMonitor.ReductionTracker.measure(fn ->
            super(msg, from, state)
          end)

        :telemetry.execute(
          [:prismatic, :genserver, :handle_call],
          %{
            reductions: stats.reductions,
            duration_us: stats.duration_us
          },
          %{
            module: @watched_name,
            message_type: elem(msg, 0)
          }
        )

        result
      end

      @impl GenServer
      def handle_cast(msg, state) do
        {result, stats} =
          PrismaticMonitor.ReductionTracker.measure(fn ->
            super(msg, state)
          end)

        :telemetry.execute(
          [:prismatic, :genserver, :handle_cast],
          %{reductions: stats.reductions, duration_us: stats.duration_us},
          %{module: @watched_name, message_type: elem(msg, 0)}
        )

        result
      end
    end
  end
end
```

### Production Diagnostics with :recon

```elixir
defmodule PrismaticMonitor.Diagnostics do
  @moduledoc """
  Production-safe diagnostic functions using :recon.
  Identifies CPU-heavy processes, scheduler bottlenecks,
  and memory pressure through reduction and process analysis.
  """

  @doc """
  Returns the top N processes by reduction rate over a sampling window.
  This identifies currently active CPU consumers.
  """
  @spec top_cpu_consumers(pos_integer(), pos_integer()) :: list(map())
  def top_cpu_consumers(count \\ 10, window_ms \\ 5000) do
    :recon.proc_window(:reductions, count, window_ms)
    |> Enum.map(fn {pid, delta, info} ->
      %{
        pid: pid,
        reduction_delta: delta,
        info: format_process_info(info)
      }
    end)
  end

  @doc """
  Checks for scheduler saturation.
  Returns `:healthy` if all schedulers < 80%, `:warning` if any > 80%,
  `:critical` if any > 95%.
  """
  @spec scheduler_health() :: :healthy | :warning | :critical
  def scheduler_health do
    utilizations =
      PrismaticMonitor.ReductionTracker.scheduler_utilization(2000)
      |> Enum.map(fn {_id, pct} -> pct end)

    max_util = Enum.max(utilizations, fn -> 0.0 end)

    cond do
      max_util > 0.95 -> :critical
      max_util > 0.80 -> :warning
      true -> :healthy
    end
  end

  @spec format_process_info(list()) :: String.t()
  defp format_process_info([name]) when is_atom(name), do: Atom.to_string(name)

  defp format_process_info([{module, function, arity}]),
    do: "#{module}.#{function}/#{arity}"

  defp format_process_info(other), do: inspect(other)
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Long-running NIF | Blocks scheduler thread, breaks real-time guarantees | Use dirty schedulers or yielding NIF pattern |
| Large GenServer state | GC consumes excessive reductions, high tail latency | Offload large data to ETS; keep GenServer state small |
| Mailbox flooding | `receive` scanning costs reductions proportional to queue depth | Use selective receive patterns; monitor mailbox length |
| Wall-clock profiling only | Misattributes wait time as CPU time | Profile with reductions alongside wall-clock for accurate picture |
| Process.sleep in GenServer | Blocks message processing for entire sleep duration | Use `Process.send_after` + `handle_info` for delayed work |
| Ignoring scheduler balance | All work on one scheduler, others idle | Check `scheduler.utilization/1`; avoid registered-name pinning |
| Uncontrolled Task spawning | Thousands of tasks saturate all schedulers | Use `Task.async_stream` with `max_concurrency` |
| ETS write contention | `:write_concurrency` false causes scheduler spin-locking | Use `write_concurrency: true` for high-write tables |
| Binary heap accumulation | Large binaries deferred to GC, inflating reduction costs | Use `:erlang.garbage_collect/1` for binary-heavy processes |
| Ignoring dirty scheduler pool size | Default 10 dirty I/O threads insufficient for many blocking calls | Tune `+SDio` flag for workloads with many blocking NIFs |

## Best Practices

1. **Profile with reductions, not wall-clock time** -- reductions measure actual CPU work independent of system load and scheduling delays. A process with high wall-clock time but low reductions is waiting; one with high reductions is computing.

2. **Avoid long-running NIF calls** -- use dirty schedulers or yielding NIFs to prevent scheduler blocking. Any NIF exceeding 1ms should be on a dirty scheduler.

3. **Delegate expensive work to Task processes** -- keep GenServer reduction counts low to maintain responsive mailbox processing. A GenServer should orchestrate, not compute.

4. **Monitor reduction growth** -- track reductions per operation over time to catch algorithmic regressions early. A 2x increase in reductions for the same logical operation indicates a problem.

5. **Set reduction budgets for batch operations** -- process large datasets in chunks, yielding between chunks to allow fair scheduling. `Task.async_stream` with bounded `max_concurrency` is the standard pattern.

6. **Use `:recon.proc_window/3` in production** -- it is safe for production use and identifies CPU-hot processes without the overhead of full tracing.

7. **Monitor scheduler utilization continuously** -- emit scheduler utilization as a telemetry metric. Alert when any scheduler exceeds 85% sustained utilization.

8. **Keep GenServer state small** -- large state increases GC reduction costs. Store bulk data in ETS and keep only keys/metadata in GenServer state.

9. **Understand the reduction/latency relationship** -- high per-call reductions in a GenServer directly translate to tail latency for subsequent callers waiting in the mailbox queue.

10. **Test NIF reduction accounting** -- when writing or updating NIFs, verify that `enif_consume_timeslice` is called at appropriate intervals to maintain scheduling fairness.

## Related Terms

- [Scheduler](/glossary/scheduler/) -- the BEAM component that uses reductions for preemptive scheduling
- [Run Queue](/glossary/run-queue/) -- the queue of processes waiting for scheduler time
- [Runtime](/glossary/runtime/) -- the execution environment where reductions are counted
- [BEAM](/glossary/beam/) -- the virtual machine implementing reduction-based scheduling
- [Process Isolation](/glossary/process-isolation/) -- memory isolation enabling safe preemption
- [GenServer](/glossary/genserver/) -- stateful processes where reduction monitoring is critical
- [NIF](/glossary/nif/) -- native code that bypasses reduction accounting
- [Dirty Scheduler](/glossary/dirty-scheduler/) -- dedicated threads for long-running NIFs
- [Garbage Collection](/glossary/garbage-collection/) -- per-process GC that consumes reductions
- [Telemetry](/glossary/telemetry/) -- observability framework for emitting reduction metrics
- [Throughput](/glossary/throughput/) -- system capacity measured through reduction processing rates
- [Profiling](/glossary/profiling/) -- performance analysis using reduction counts

## See Also

- [BEAM Architecture](/architecture/) -- how reductions fit into the virtual machine design
- [Performance Monitoring](/capabilities/) -- reduction-based performance tracking
- [Telemetry Dashboard](/hub/system) -- live scheduler utilization visualization
- [Erlang Efficiency Guide](https://www.erlang.org/doc/efficiency_guide/processes.html) -- official reduction documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
