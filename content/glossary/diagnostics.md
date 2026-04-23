+++
title = "Diagnostics"
weight = 50

[extra]
description = "Tools and techniques for examining the internal state of running BEAM systems, including process inspection, memory profiling, message queue analysis, distributed tracing, and production-safe introspection"
category = "platform"
domain = "operations"
complexity = "advanced"
stability = "mature"
beam_related = true
related_terms = ["telemetry", "distributed-tracing", "genserver", "process", "supervision-strategy", "pubsub", "introspection", "health-check", "benchmark", "performance-testing", "p95", "scalability"]
tags = ["glossary", "diagnostics", "observer", "telemetry", "debugging", "beam", "profiling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "BEAM diagnostics provide unparalleled runtime introspection through :observer, :dbg, :sys.get_state, :recon, and :erlang.process_info, enabling live debugging of production systems without restarts or redeployments."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Diagnostics", "BEAM", "observer", "recon", "profiling", "debugging", "process inspection", "memory analysis", "message queue", "system_info", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Diagnostics - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "architecture", "technologies"]
+++

## Definition

Diagnostics in the BEAM ecosystem refers to the comprehensive set of tools and techniques for examining the internal state of running Erlang/Elixir systems. Unlike most runtime environments where production debugging requires log analysis or external APM tools, the BEAM provides built-in introspection capabilities that allow developers to inspect process states, trace function calls, analyze memory usage, and profile execution paths on live production systems without restarts or performance degradation.

This diagnostic capability is a fundamental design principle of the BEAM, reflecting its telecom heritage where systems must be debuggable while running -- Ericsson's telephone switches could not be taken offline for debugging. The BEAM's process isolation model means that diagnostic operations on one process do not affect others, making it safe to inspect individual processes in a system handling millions of concurrent operations.

Diagnostics spans three domains: **introspection** (reading system state without modification), **tracing** (observing function calls and message flows), and **profiling** (measuring resource consumption and execution timing). Each domain has tools ranging from zero-overhead (reading process info) to high-overhead (full CPU profiling), and choosing the right tool for the diagnostic scenario is critical -- especially in production.

The Prismatic Platform builds on BEAM diagnostics with platform-specific tooling: process health monitors, ETS memory auditors, GenServer state inspectors, message queue depth alerts, and a diagnostics LiveView dashboard that surfaces critical system metrics in real time.

---

## Core Concepts

### Diagnostic Tool Comparison

| Diagnostic Tool | Purpose | Production Impact | Granularity | Prismatic Integration |
|----------------|---------|-------------------|-------------|----------------------|
| **:observer** | Visual process/memory explorer | Low (GUI overhead) | System-wide | Dev environment only |
| **:observer_cli** | Terminal-based observer | Negligible | System-wide | Remote node inspection |
| **:dbg** | Function call tracing (OTP 25+) | Low-Medium | Per-function | Targeted debugging |
| **:sys.get_state/1** | GenServer state inspection | Negligible | Per-process | State debugging |
| **:sys.get_status/1** | GenServer status with formatting | Negligible | Per-process | Health checks |
| **:erlang.process_info/2** | Process metadata reading | Negligible | Per-process | Monitoring agents |
| **:erlang.system_info/1** | VM-level metrics | Negligible | System-wide | Health dashboard |
| **:recon** | Production-safe diagnostics | Low | System-wide | Production debugging |
| **:recon_trace** | Rate-limited production tracing | Low | Per-function | Production tracing |
| **:fprof** | Full CPU profiling | High | Per-function | Dev benchmarks only |
| **:eprof** | Time-based profiling | Medium | Per-function | Performance analysis |
| **:cprof** | Call count profiling | Low | Per-function | Hot path detection |
| **:msacc** | Microstate accounting | Negligible | Per-scheduler | Scheduler analysis |
| **Telemetry** | Custom event metrics | Negligible | Per-event | All dashboards |

### Diagnostic Safety Levels

| Safety Level | Tools | Production Use | Overhead |
|-------------|-------|----------------|----------|
| **Safe (always-on)** | `process_info/2`, `system_info/1`, Telemetry | Yes | Negligible |
| **Safe (bounded)** | `:recon`, `:recon_trace`, `:cprof` | Yes (with limits) | Low |
| **Caution** | `:dbg`, `:eprof`, `:observer_cli` | Short sessions only | Medium |
| **Development Only** | `:fprof`, `:observer` (GUI), `:cover` | Never in production | High |

### Key System Info Metrics

| Metric | Erlang Call | Meaning | Healthy Range |
|--------|------------|---------|---------------|
| **Process count** | `:erlang.system_info(:process_count)` | Active processes | Platform-dependent |
| **Process limit** | `:erlang.system_info(:process_limit)` | Max allowed processes | Should be 10x current |
| **Atom count** | `:erlang.system_info(:atom_count)` | Used atoms | Should not grow unbounded |
| **Atom limit** | `:erlang.system_info(:atom_limit)` | Max atoms before crash | Default 1,048,576 |
| **Port count** | `:erlang.system_info(:port_count)` | Open ports (files, sockets) | Below port_limit |
| **Scheduler count** | `:erlang.system_info(:schedulers_online)` | Active schedulers | Equal to CPU cores |
| **Memory total** | `:erlang.memory(:total)` | Total BEAM memory | Below OS limit |
| **Memory processes** | `:erlang.memory(:processes)` | Process heap memory | < 70% of total |
| **Memory ETS** | `:erlang.memory(:ets)` | ETS table memory | Monitor for growth |
| **Run queue length** | `:erlang.statistics(:run_queue)` | Waiting processes | Should be near 0 |

---

## Technical Deep Dive

### Process Inspection

Every BEAM process carries metadata accessible through `:erlang.process_info/2`. This function reads process state without modifying it and has negligible overhead -- it is safe to call on any process in production. The metadata includes memory usage, message queue length, reduction count (a proxy for CPU usage), current function, registered name, and process dictionary.

Message queue length is the single most important diagnostic metric for BEAM systems. A growing message queue indicates a process that is receiving messages faster than it can process them -- the classic BEAM performance bottleneck. When a process accumulates millions of messages, it consumes memory proportional to queue depth and performs increasingly poorly as the garbage collector must scan the entire queue.

### GenServer State Inspection

`:sys.get_state/1` sends a synchronous call to a GenServer (or any `:gen` behaviour process) requesting its current state. This is invaluable for debugging but has an important caveat: it sends a message to the target process and waits for a reply. If the target process is overloaded (long message queue), the diagnostic call itself may hang or timeout.

`:sys.get_status/1` provides a richer view that includes the process status, parent, and a formatted state representation. GenServers can customize this output by implementing `format_status/2`, which should redact sensitive data (credentials, API keys) from diagnostic output.

### Memory Diagnostics

BEAM memory analysis operates at three levels:

1. **VM level**: `:erlang.memory/0` returns total memory broken down by category (processes, atoms, binary, ETS, code, system)
2. **Process level**: `:erlang.process_info(pid, :memory)` returns per-process memory including heap, stack, and message queue
3. **ETS level**: `:ets.info(table, :memory)` returns per-table memory in words (multiply by word size for bytes)

Binary memory requires special attention. Large binaries (> 64 bytes) are stored on a shared reference-counted heap. Process-level memory reports may undercount binary usage because the binary is not "owned" by any single process. `:recon.bin_leak/1` helps identify processes holding references to large binaries that should have been garbage collected.

### Production Tracing with :recon_trace

`:recon_trace` is the production-safe tracing tool. Unlike raw `:dbg` or `:erlang.trace`, it applies automatic rate limiting to prevent trace message floods from overwhelming the system:

```erlang
%% Trace at most 100 calls per second for 30 seconds
:recon_trace.calls({MyModule, :my_function, :_}, 100, [{:scope, :local}])
```

The rate limit is critical. Without it, tracing a frequently-called function can generate millions of trace messages per second, causing the tracing process to consume all available memory and crash the node.

---

## Usage in Prismatic Platform

### Platform Diagnostics Module

```elixir
defmodule Prismatic.Diagnostics do
  @moduledoc """
  Production-safe diagnostic utilities for the Prismatic Platform.
  Provides process inspection, memory analysis, ETS auditing,
  and performance profiling without impacting system availability.

  All functions in this module are safe to call on production
  systems. Functions with higher overhead are clearly documented.

  ## Examples

      iex> reports = Prismatic.Diagnostics.top_processes(5, :memory)
      iex> length(reports) <= 5
      true

      iex> ets_report = Prismatic.Diagnostics.ets_memory_report()
      iex> is_list(ets_report)
      true
  """

  require Logger

  @type process_report :: %{
    pid: pid(),
    name: atom() | nil,
    module: term(),
    memory: non_neg_integer(),
    message_queue_len: non_neg_integer(),
    reductions: non_neg_integer(),
    status: atom()
  }

  @type ets_report :: %{
    name: atom(),
    size: non_neg_integer(),
    memory_bytes: non_neg_integer(),
    type: atom(),
    owner: pid()
  }

  @type system_snapshot :: %{
    process_count: non_neg_integer(),
    process_limit: non_neg_integer(),
    atom_count: non_neg_integer(),
    atom_limit: non_neg_integer(),
    port_count: non_neg_integer(),
    schedulers_online: non_neg_integer(),
    run_queue: non_neg_integer(),
    memory: map(),
    uptime_seconds: non_neg_integer()
  }

  @doc """
  Returns the top N processes sorted by the given metric.
  Safe for production use with negligible overhead.

  ## Parameters
    - `count` - number of processes to return (default 10)
    - `sort_by` - metric to sort by: `:memory`, `:message_queue_len`, or `:reductions`

  ## Examples

      iex> top = Prismatic.Diagnostics.top_processes(3, :memory)
      iex> length(top) <= 3
      true
  """
  @spec top_processes(pos_integer(), :memory | :message_queue_len | :reductions) ::
          list(process_report())
  def top_processes(count \\ 10, sort_by \\ :memory) do
    Process.list()
    |> Enum.map(&process_report/1)
    |> Enum.sort_by(&Map.get(&1, sort_by), :desc)
    |> Enum.take(count)
  end

  @doc """
  Inspects a GenServer's state and process metadata.
  Sends a synchronous message to the process -- may timeout
  if the process is overloaded.

  ## Examples

      iex> {:ok, info} = Prismatic.Diagnostics.inspect_genserver(MyApp.Registry)
      iex> Map.has_key?(info, :state)
      true
  """
  @spec inspect_genserver(GenServer.server()) :: {:ok, map()} | {:error, term()}
  def inspect_genserver(server) do
    try do
      state = :sys.get_state(server, 5_000)
      pid = GenServer.whereis(server)

      info =
        Process.info(pid, [
          :memory, :message_queue_len, :reductions, :current_function, :status
        ])

      {:ok, %{state: state, process_info: Map.new(info || [])}}
    catch
      :exit, reason -> {:error, {:exit, reason}}
    end
  end

  @doc """
  Reports memory usage of all ETS tables, sorted by memory
  consumption descending. Safe for production use.

  ## Examples

      iex> report = Prismatic.Diagnostics.ets_memory_report()
      iex> Enum.all?(report, &Map.has_key?(&1, :memory_bytes))
      true
  """
  @spec ets_memory_report() :: list(ets_report())
  def ets_memory_report do
    word_size = :erlang.system_info(:wordsize)

    :ets.all()
    |> Enum.map(fn table ->
      info = :ets.info(table)

      %{
        name: info[:name],
        size: info[:size],
        memory_bytes: info[:memory] * word_size,
        type: info[:type],
        owner: info[:owner]
      }
    end)
    |> Enum.sort_by(& &1.memory_bytes, :desc)
  end

  @doc """
  Captures a complete system snapshot with all critical VM metrics.
  Safe for production use with negligible overhead.

  ## Examples

      iex> snap = Prismatic.Diagnostics.system_snapshot()
      iex> snap.schedulers_online > 0
      true
  """
  @spec system_snapshot() :: system_snapshot()
  def system_snapshot do
    {uptime_ms, _} = :erlang.statistics(:wall_clock)

    %{
      process_count: :erlang.system_info(:process_count),
      process_limit: :erlang.system_info(:process_limit),
      atom_count: :erlang.system_info(:atom_count),
      atom_limit: :erlang.system_info(:atom_limit),
      port_count: :erlang.system_info(:port_count),
      schedulers_online: :erlang.system_info(:schedulers_online),
      run_queue: :erlang.statistics(:run_queue),
      memory: Map.new(:erlang.memory()),
      uptime_seconds: div(uptime_ms, 1_000)
    }
  end

  @doc """
  Identifies processes with message queue lengths exceeding
  the given threshold. Critical for detecting overloaded processes.

  ## Examples

      iex> overloaded = Prismatic.Diagnostics.overloaded_processes(1000)
      iex> is_list(overloaded)
      true
  """
  @spec overloaded_processes(non_neg_integer()) :: list(process_report())
  def overloaded_processes(threshold \\ 100) do
    Process.list()
    |> Enum.map(&process_report/1)
    |> Enum.filter(&(&1.message_queue_len > threshold))
    |> Enum.sort_by(& &1.message_queue_len, :desc)
  end

  @doc """
  Detects potential atom table exhaustion by comparing current
  atom count against the limit. Returns warning level.

  ## Examples

      iex> Prismatic.Diagnostics.atom_table_health()
      :healthy
  """
  @spec atom_table_health() :: :healthy | :warning | :critical
  def atom_table_health do
    count = :erlang.system_info(:atom_count)
    limit = :erlang.system_info(:atom_limit)
    usage_pct = count / limit * 100

    cond do
      usage_pct > 80 -> :critical
      usage_pct > 50 -> :warning
      true -> :healthy
    end
  end

  @doc """
  Identifies processes holding references to large binaries
  that may indicate binary memory leaks. Uses :recon when
  available, falls back to process_info scanning.

  ## Examples

      iex> suspects = Prismatic.Diagnostics.binary_leak_suspects(5)
      iex> is_list(suspects)
      true
  """
  @spec binary_leak_suspects(pos_integer()) :: list(map())
  def binary_leak_suspects(count \\ 10) do
    if Code.ensure_loaded?(:recon) do
      :recon.bin_leak(count)
      |> Enum.map(fn {pid, words, info} ->
        %{
          pid: pid,
          binary_memory_words: words,
          info: info
        }
      end)
    else
      Logger.info("Install :recon for advanced binary leak detection")

      Process.list()
      |> Enum.map(fn pid ->
        info = Process.info(pid, [:memory, :binary, :registered_name])
        binary_size = info[:binary] |> List.wrap() |> Enum.map(&elem(&1, 1)) |> Enum.sum()
        %{pid: pid, binary_memory_words: binary_size, name: info[:registered_name]}
      end)
      |> Enum.sort_by(& &1.binary_memory_words, :desc)
      |> Enum.take(count)
    end
  end

  defp process_report(pid) do
    info =
      Process.info(pid, [
        :registered_name, :memory, :message_queue_len,
        :reductions, :status, :dictionary
      ]) || []

    module =
      case Keyword.get(info, :dictionary, []) do
        dict when is_list(dict) ->
          Keyword.get(dict, :"$initial_call", :unknown)
        _ ->
          :unknown
      end

    %{
      pid: pid,
      name: Keyword.get(info, :registered_name),
      module: module,
      memory: Keyword.get(info, :memory, 0),
      message_queue_len: Keyword.get(info, :message_queue_len, 0),
      reductions: Keyword.get(info, :reductions, 0),
      status: Keyword.get(info, :status, :unknown)
    }
  end
end
```

### Diagnostics LiveView Integration

The platform's diagnostics data feeds into the system health dashboards at `/system/cpu`, `/system/memory`, and `/system/storage`. The LiveView mounts subscribe to a periodic diagnostic snapshot PubSub topic that emits system snapshots every 5 seconds:

```elixir
defmodule PrismaticWeb.System.DiagnosticsPublisher do
  @moduledoc """
  Periodically captures diagnostic snapshots and broadcasts
  them via PubSub for consumption by LiveView dashboards
  and monitoring agents.
  """

  use GenServer

  require Logger

  @publish_interval_ms 5_000
  @pubsub_topic "diagnostics:snapshot"

  @doc false
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    schedule_snapshot()
    {:ok, %{}}
  end

  @impl GenServer
  def handle_info(:publish_snapshot, state) do
    snapshot = Prismatic.Diagnostics.system_snapshot()

    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      @pubsub_topic,
      {:diagnostics_snapshot, snapshot}
    )

    :telemetry.execute(
      [:prismatic, :diagnostics, :snapshot],
      %{
        process_count: snapshot.process_count,
        run_queue: snapshot.run_queue,
        memory_total: snapshot.memory.total
      },
      %{}
    )

    schedule_snapshot()
    {:noreply, state}
  end

  defp schedule_snapshot do
    Process.send_after(self(), :publish_snapshot, @publish_interval_ms)
  end
end
```

---

## Common Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| **Using :fprof in production** | Significant CPU overhead, possible OOM | Use `:recon` or `:eprof` instead; `:fprof` is dev-only |
| **Unbounded tracing** | Trace messages flood the node, OOM crash | Always use `:recon_trace` with rate limits in production |
| **:sys.get_state on overloaded process** | Diagnostic call hangs or times out | Check `message_queue_len` first; use timeout parameter |
| **Ignoring binary memory** | Memory grows despite process memory looking fine | Use `:recon.bin_leak/1` to detect binary reference leaks |
| **Atom table exhaustion** | Node crashes with `system_limit` error | Monitor atom count; never use `String.to_atom/1` with user input |
| **Forgetting ETS memory** | `:erlang.memory(:processes)` misses ETS | Track `:erlang.memory(:ets)` separately in dashboards |
| **Tracing in production without limits** | System overwhelmed by trace output | Use `:recon_trace.calls/3` with explicit message count limits |
| **Reading process_info on dead process** | `nil` return causes match error | Pattern match on `nil` return from `Process.info/2` |
| **Observer GUI on remote node** | Opens X11 window, network overhead | Use `:observer_cli` for terminal-based inspection |
| **Missing run queue monitoring** | Scheduler saturation goes undetected | Track `:erlang.statistics(:run_queue)` continuously |
| **Diagnostic data in logs** | Sensitive state data in log output | Implement `format_status/2` to redact secrets from GenServer state |
| **Profiling the profiler** | Diagnostic overhead skews measurements | Profile in isolation; exclude diagnostic code from measurements |

---

## Best Practices

1. **Use :recon in production, :observer in development** -- :recon is designed for production safety with bounded resource usage and rate-limited tracing.
2. **Never use :fprof in production** -- full CPU profiling has significant overhead; use `:eprof` for time-based or `:cprof` for call-count profiling.
3. **Set trace limits** -- always use `:recon_trace` with match specifications and rate limits to prevent trace message floods.
4. **Monitor message queue lengths continuously** -- growing queues indicate processes falling behind, the most common cause of BEAM performance issues.
5. **Instrument with Telemetry** -- custom metrics provide ongoing visibility without the overhead of ad-hoc diagnostic sessions.
6. **Connect to remote nodes safely** -- use `--remsh` for remote shell connections with proper cookie authentication; never expose the distribution port.
7. **Implement format_status/2** -- redact sensitive data (credentials, API keys, PII) from GenServer state visible through diagnostic tools.
8. **Track atom table health** -- monitor `atom_count` vs `atom_limit` ratio; alert at 50% usage; this is the one BEAM resource that cannot be reclaimed.
9. **Automate diagnostic snapshots** -- periodic system snapshots published via PubSub enable historical analysis and trend detection.
10. **Check process info before sys calls** -- read `message_queue_len` via `Process.info/2` before calling `:sys.get_state/1` to avoid hanging on overloaded processes.

---

## Related Terms

- [Telemetry](@/glossary/telemetry.md) -- custom event metrics complementing built-in diagnostics
- [GenServer](@/glossary/genserver.md) -- primary process type inspected through diagnostic tools
- [Process](@/glossary/process.md) -- BEAM process model that diagnostics inspect
- [Supervision Strategy](@/glossary/supervision-strategy.md) -- supervision trees visible through diagnostic tools
- [Distributed Tracing](@/glossary/distributed-tracing.md) -- cross-node diagnostic correlation
- [PubSub](@/glossary/pubsub.md) -- event delivery for diagnostic data broadcasting
- [Introspection](@/glossary/introspection.md) -- runtime self-examination capability
- [Benchmark](@/glossary/benchmark.md) -- performance measurement using diagnostic data
- [Performance Testing](@/glossary/performance-testing.md) -- systematic performance validation
- [P95](@/glossary/p95.md) -- latency percentiles derived from diagnostic data
- [Scalability](@/glossary/scalability.md) -- system capacity measured through diagnostics
- [Health Check](@/glossary/health-check.md) -- automated diagnostic verification for deployed systems

---

## See Also

- [Technologies](@/technologies/_index.md) -- BEAM diagnostic tooling profiles
- [Architecture](@/architecture/_index.md) -- platform observability architecture
- [Capabilities](@/capabilities/_index.md) -- monitoring and health dashboard capabilities
- **Erlang Docs**: [:erlang.process_info/2](https://www.erlang.org/doc/man/erlang#process_info-2)
- **Recon**: [ferd/recon](https://github.com/ferd/recon) -- production-safe BEAM diagnostics library
- **Book**: "Erlang in Anger" by Fred Hebert -- production BEAM debugging guide

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
