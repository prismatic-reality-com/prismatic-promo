+++
title = "BEAM VM"
weight = 50
[extra]
description = "The Bogdan/Bjorn's Erlang Abstract Machine -- the virtual machine executing Elixir and Erlang code, providing lightweight processes, preemptive scheduling, and fault isolation for the Prismatic Platform"
category = "runtime"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "runtime-infrastructure"
related_concepts = ["beam", "elixir", "erlang", "otp", "process-isolation"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 6
prerequisites = ["elixir", "erlang", "otp"]
learning_path = ["erlang", "beam-vm", "elixir", "otp", "genserver", "supervision-tree"]
interactive_demos = ["/labs/glossary/beam-vm"]
code_examples = ["process creation and scheduling", "fault isolation demonstration", "hot code reload mechanism"]
external_resources = ["https://www.erlang.org/doc/system/spec_proc.html", "https://blog.stenmans.org/theBeamBook/", "https://hexdocs.pm/elixir/processes.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["process isolation under crash", "scheduler fairness validation", "memory per-process measurement", "hot code reload verification"]
keywords = ["BEAM virtual machine", "Erlang Abstract Machine", "BEAM VM processes", "preemptive scheduling BEAM", "fault isolation BEAM", "BEAM garbage collection", "hot code reload BEAM", "BEAM scheduler"]
tags = ["beam", "runtime", "erlang", "elixir", "otp", "concurrency", "fault-tolerance"]
related_terms = ["beam", "elixir", "erlang", "otp", "genserver", "process-isolation", "hot-code-reload", "virtual-machine", "fault-tolerance", "supervision-tree"]
word_count = 1758
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "BEAM VM - Prismatic Platform"
+++

## Definition

The **BEAM VM** (Bogdan/Bjorn's Erlang Abstract Machine) is the virtual machine that executes compiled Erlang and Elixir bytecode. Originally developed for the Erlang programming language by Ericsson in the 1980s for telecommunications systems, the BEAM provides a unique execution model built around massive concurrency through lightweight processes, preemptive scheduling with reduction-based fairness, per-process garbage collection, transparent distribution across networked nodes, and hot code reloading without service interruption.

Unlike the JVM or CLR which were designed for general-purpose computation, the BEAM was purpose-built for systems that must run continuously, handle millions of concurrent connections, tolerate hardware and software failures, and be upgraded without downtime. These properties, originally required by telephone switches, are equally essential for modern distributed platforms like the [Prismatic Platform](/glossary/elixir/).

## Overview

The BEAM occupies a unique position in the landscape of virtual machines. Where most VMs optimize for throughput on a single task (JVM's JIT compilation, V8's optimizing compiler), the BEAM optimizes for concurrency, latency consistency, and fault tolerance. A BEAM system running a million concurrent processes will exhibit remarkably consistent per-request latency, because the preemptive scheduler ensures no single process can monopolize a CPU core.

This design philosophy traces directly to its origins in telecommunications. A telephone switch must handle tens of thousands of simultaneous calls, any of which might fail at any time, while maintaining sub-second response times and achieving "five nines" (99.999%) uptime. The BEAM was designed from the ground up to meet these requirements, and these same properties make it an exceptional runtime for the Prismatic Platform's 115 umbrella applications, 530+ agents, and 120 OSINT tool integrations.

### Architectural Comparison

| Feature | BEAM | JVM | V8 (Node.js) | Go Runtime |
|---------|------|-----|--------------|------------|
| **Concurrency Model** | Lightweight processes | OS threads + virtual threads | Event loop + workers | Goroutines |
| **Process Cost** | ~2 KB per process | ~1 MB per thread | Single-threaded + workers | ~8 KB per goroutine |
| **Scheduling** | Preemptive (reduction-based) | OS-level (threads) / cooperative (virtual) | Cooperative (event loop) | Cooperative (goroutines) |
| **GC Strategy** | Per-process, incremental | Stop-the-world (G1/ZGC) | Generational, stop-the-world | Concurrent, tri-color |
| **Fault Isolation** | Process-level (crash boundaries) | Minimal (shared heap) | None (single process) | Minimal (shared heap) |
| **Hot Code Reload** | Native, built-in | Limited (JRebel, class reloading) | None native | None native |
| **Distribution** | Built-in transparent clustering | Manual (RMI, gRPC) | Manual (HTTP, gRPC) | Manual (gRPC) |
| **Latency Consistency** | Excellent (no global GC pauses) | Good (modern GC) | Poor (event loop blocking) | Good |

## Technical Details

### Process Model

The BEAM process is the fundamental unit of concurrency and isolation. Each process has its own:

- **Heap**: Private memory region for process data, garbage collected independently
- **Stack**: Execution stack for function calls
- **Mailbox**: FIFO message queue for inter-process communication
- **Process Dictionary**: Per-process key-value store (use discouraged in favor of state)
- **Reduction Counter**: Tracks computational work for fair scheduling

```elixir
defmodule Prismatic.Beam.ProcessDemo do
  @moduledoc """
  Demonstrates BEAM process characteristics: lightweight creation,
  isolation, and concurrent execution.
  """

  @spec spawn_workers(count :: pos_integer()) :: {:ok, %{pids: [pid()], memory_bytes: non_neg_integer()}}
  def spawn_workers(count) do
    memory_before = :erlang.memory(:total)

    pids =
      Enum.map(1..count, fn id ->
        spawn(fn ->
          # Each process has its own state, heap, and execution context
          state = %{id: id, created_at: System.monotonic_time()}
          process_work(state)
        end)
      end)

    memory_after = :erlang.memory(:total)
    per_process = (memory_after - memory_before) / count

    {:ok, %{
      pids: pids,
      memory_bytes: memory_after - memory_before,
      per_process_bytes: per_process
    }}
  end

  @spec process_info_snapshot(pid()) :: {:ok, map()} | {:error, :process_not_found}
  def process_info_snapshot(pid) do
    case Process.info(pid) do
      nil ->
        {:error, :process_not_found}

      info ->
        {:ok, %{
          heap_size: Keyword.get(info, :heap_size),
          stack_size: Keyword.get(info, :stack_size),
          message_queue_len: Keyword.get(info, :message_queue_len),
          reductions: Keyword.get(info, :reductions),
          memory: Keyword.get(info, :memory),
          status: Keyword.get(info, :status)
        }}
    end
  end

  defp process_work(state) do
    receive do
      {:work, payload} ->
        result = perform_computation(payload, state)
        process_work(%{state | last_result: result})

      :shutdown ->
        :ok
    after
      60_000 ->
        process_work(state)
    end
  end

  defp perform_computation(payload, _state) do
    # Domain-specific computation
    :crypto.hash(:sha256, :erlang.term_to_binary(payload))
  end
end
```

### Scheduler Architecture

The BEAM scheduler is a preemptive, reduction-based system. Each BEAM instance runs one scheduler per CPU core (configurable), and each scheduler manages its own run queue of processes:

```
┌──────────────────────────────────────────────────────┐
│                    BEAM Instance                      │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Scheduler 1│  │ Scheduler 2│  │ Scheduler N│    │
│  │ (CPU Core 1)│  │ (CPU Core 2)│  │ (CPU Core N)│    │
│  │            │  │            │  │            │    │
│  │ Run Queue: │  │ Run Queue: │  │ Run Queue: │    │
│  │ [P1,P2,P3] │  │ [P4,P5]   │  │ [P6,P7,P8] │    │
│  │            │  │            │  │            │    │
│  │ Reductions:│  │ Reductions:│  │ Reductions:│    │
│  │ 4000/proc  │  │ 4000/proc  │  │ 4000/proc  │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                      │
│  Work Stealing: Idle schedulers steal from busy ones │
│  IO Schedulers: Separate pool for blocking IO        │
└──────────────────────────────────────────────────────┘
```

A "reduction" is an abstract unit of work -- roughly one function call. Each process receives a budget of approximately 4,000 reductions before being preempted and moved to the back of the run queue. This ensures that no process, regardless of what it is doing, can monopolize a scheduler for more than a few milliseconds.

Key scheduler properties:

| Property | Description | Impact |
|----------|-------------|--------|
| **Preemptive** | Processes are interrupted after reduction budget | No single process can starve others |
| **Reduction-based** | Work measured in function calls, not wall time | Consistent scheduling granularity |
| **Work stealing** | Idle schedulers take work from busy ones | Load balancing across cores |
| **IO schedulers** | Separate pool handles blocking operations | IO does not block computation |
| **Dirty schedulers** | NIF-aware schedulers for long-running native code | Native interop without blocking |

### Per-Process Garbage Collection

One of the BEAM's most distinctive features is per-process garbage collection. Unlike the JVM's global GC which pauses all threads, the BEAM collects each process's heap independently:

```elixir
defmodule Prismatic.Beam.GCDemo do
  @moduledoc """
  Demonstrates BEAM per-process garbage collection characteristics.
  Each process has its own generational GC, independent of all others.
  """

  @spec gc_impact_comparison() :: {:ok, map()}
  def gc_impact_comparison do
    # Spawn a process that generates garbage
    garbage_pid = spawn(fn ->
      Enum.reduce(1..1_000_000, [], fn i, acc ->
        # Generates temporary allocations that need GC
        [Integer.to_string(i) | acc]
      end)
    end)

    # Spawn a latency-sensitive process
    latency_pid = spawn(fn ->
      measure_latency_loop(100, [])
    end)

    # The garbage-generating process's GC does NOT affect
    # the latency-sensitive process's response times
    Process.sleep(5_000)

    send(latency_pid, {:get_results, self()})

    receive do
      {:results, latencies} ->
        {:ok, %{
          max_latency_us: Enum.max(latencies),
          avg_latency_us: Enum.sum(latencies) / length(latencies),
          p99_latency_us: percentile(latencies, 0.99),
          garbage_pid: garbage_pid
        }}
    after
      10_000 -> {:error, :timeout}
    end
  end

  defp measure_latency_loop(0, results) do
    receive do
      {:get_results, caller} -> send(caller, {:results, results})
    end
  end

  defp measure_latency_loop(n, results) do
    start = System.monotonic_time(:microsecond)
    # Simulate a quick operation
    :crypto.hash(:sha256, "test")
    elapsed = System.monotonic_time(:microsecond) - start
    Process.sleep(50)
    measure_latency_loop(n - 1, [elapsed | results])
  end

  defp percentile(list, p) do
    sorted = Enum.sort(list)
    index = trunc(length(sorted) * p)
    Enum.at(sorted, index)
  end
end
```

### GC Implications for System Design

| Scenario | JVM Behavior | BEAM Behavior |
|----------|-------------|---------------|
| One process allocates heavily | Global GC pause affects all threads | Only that process pauses |
| Million idle processes | Contribute to heap scan time | Zero GC overhead (nothing to collect) |
| Real-time latency requirement | Requires GC tuning (G1/ZGC) | Naturally low-latency (per-process GC) |
| Process crash with large heap | Memory retained until GC cycle | Immediately reclaimed (process dies) |

### Hot Code Reloading

The BEAM supports replacing code in a running system without stopping processes. Each module can have two versions loaded simultaneously (current and old), allowing processes to transition gracefully:

```elixir
defmodule Prismatic.Beam.HotReload do
  @moduledoc """
  Demonstrates BEAM hot code reload mechanism.
  Two versions of a module can coexist, with processes
  transitioning from old to new at their next fully-qualified call.
  """

  @spec current_version(module()) :: {:ok, term()} | {:error, :not_loaded}
  def current_version(module) do
    case :code.get_object_code(module) do
      {^module, _binary, _filename} ->
        {:ok, module.module_info(:attributes) |> Keyword.get(:vsn, [:unknown]) |> hd()}

      :error ->
        {:error, :not_loaded}
    end
  end

  @spec loaded_modules_count() :: {:ok, non_neg_integer()}
  def loaded_modules_count do
    {:ok, length(:code.all_loaded())}
  end

  @spec reload_module(module()) :: {:ok, module()} | {:error, term()}
  def reload_module(module) do
    case :code.purge(module) do
      true ->
        case :code.load_file(module) do
          {:module, ^module} -> {:ok, module}
          {:error, reason} -> {:error, reason}
        end

      false ->
        {:error, :processes_still_running_old_code}
    end
  end
end
```

The transition mechanism works because the BEAM distinguishes between local calls (stay on current version) and fully-qualified calls (use latest loaded version). [GenServer](/glossary/genserver/) processes naturally transition to new code because the GenServer behaviour module dispatches callbacks via fully-qualified calls.

### Distribution and Clustering

The BEAM provides built-in transparent distribution. Processes on different nodes communicate using the same `send/2` and `GenServer.call/3` primitives as local processes:

```elixir
defmodule Prismatic.Beam.Distribution do
  @moduledoc """
  BEAM distribution primitives for transparent multi-node operation.
  Message passing, process monitoring, and name registration
  work identically across local and remote processes.
  """

  @spec cluster_status() :: {:ok, map()}
  def cluster_status do
    {:ok, %{
      self: Node.self(),
      connected_nodes: Node.list(),
      node_count: length(Node.list()) + 1,
      cookie: Node.get_cookie(),
      alive: Node.alive?()
    }}
  end

  @spec send_to_remote(node(), pid() | atom(), term()) :: :ok | {:error, :node_not_connected}
  def send_to_remote(node, target, message) do
    if node in Node.list() do
      send({target, node}, message)
      :ok
    else
      {:error, :node_not_connected}
    end
  end

  @spec monitor_remote_process(node(), pid()) :: {:ok, reference()} | {:error, term()}
  def monitor_remote_process(node, pid) do
    if node in Node.list() do
      ref = Process.monitor(pid)
      {:ok, ref}
    else
      {:error, :node_not_connected}
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform leverages every major BEAM capability across its 115 umbrella applications:

### Process Architecture

The platform runs thousands of concurrent BEAM processes in production:

| Component | Process Count | Purpose |
|-----------|--------------|---------|
| **AIAD Agents** | 530+ | Each agent is one or more BEAM processes |
| **OSINT Adapters** | 120 | Each adapter manages its own connection pool |
| **Quality Monitors** | ~50 | Background processes watching quality metrics |
| **Web Connections** | Thousands | Each LiveView/WebSocket = one BEAM process |
| **Supervisors** | ~200 | OTP supervision tree processes |
| **ETS Owners** | ~100 | GenServers owning ETS tables |

### Scheduler Configuration

Production deployments configure BEAM schedulers for the workload:

```elixir
# rel/env.sh.eex (Fly.io deployment)
# Match scheduler count to available vCPUs
# Enable dirty schedulers for NIF-heavy OSINT operations
# Bind schedulers to cores for cache locality

export ERL_FLAGS="+S 4:4 +SDcpu 4:4 +SDio 32 +sbwt very_long +swt very_low"
```

| Flag | Setting | Purpose |
|------|---------|---------|
| `+S 4:4` | 4 normal schedulers | Match vCPU count |
| `+SDcpu 4:4` | 4 dirty CPU schedulers | NIF operations (crypto, parsing) |
| `+SDio 32` | 32 dirty IO schedulers | Blocking IO (HTTP calls, file access) |
| `+sbwt very_long` | Long busy wait threshold | Reduce context switch overhead |
| `+swt very_low` | Low wake threshold | Fast wakeup for interactive workloads |

### Fault Isolation in Practice

The BEAM's process isolation is central to the platform's reliability. When an OSINT adapter crashes (network timeout, malformed response, API rate limit), only that adapter's process dies. The [supervision tree](/glossary/supervision-tree/) restarts it, and all other platform operations continue unaffected:

```elixir
defmodule Prismatic.Beam.FaultIsolation do
  @moduledoc """
  Demonstrates BEAM fault isolation in the context of OSINT operations.
  A crashing adapter does not affect other platform operations.
  """

  @spec demonstrate_isolation() :: {:ok, map()}
  def demonstrate_isolation do
    # Start a healthy process
    healthy = spawn_link(fn -> healthy_loop(0) end)

    # Start a process that will crash
    {:ok, _doomed} = Task.start(fn ->
      Process.sleep(100)
      raise "Simulated OSINT adapter crash"
    end)

    # The healthy process continues unaffected
    Process.sleep(200)

    case Process.info(healthy) do
      nil -> {:error, :healthy_process_died}
      info -> {:ok, %{healthy_alive: true, reductions: Keyword.get(info, :reductions)}}
    end
  end

  defp healthy_loop(count) do
    receive do
      :stop -> :ok
    after
      100 -> healthy_loop(count + 1)
    end
  end
end
```

## Comparison with Alternatives

| VM / Runtime | Best For | Weakness Relative to BEAM |
|-------------|---------|---------------------------|
| **JVM** | High-throughput computation, ecosystem breadth | Global GC pauses, heavy threads, no native distribution |
| **V8 / Node.js** | I/O-heavy web services, JavaScript ecosystem | Single-threaded, no fault isolation, no preemptive scheduling |
| **Go Runtime** | Network services, CLI tools | No hot code reload, cooperative scheduling, shared heap |
| **CLR (.NET)** | Windows ecosystem, enterprise apps | Global GC, no native distribution, heavy processes |
| **CPython** | Scripting, ML/data science | GIL prevents true concurrency, no fault isolation |
| **WebAssembly** | Portable sandboxed execution | No built-in concurrency model, no distribution |

The BEAM's combination of preemptive scheduling, per-process GC, built-in distribution, and hot code reload is unique among production runtimes. No other VM provides all four of these properties, which is why the BEAM remains the runtime of choice for systems requiring high availability and massive concurrency.

## Best Practices

**Design around processes, not threads.** Think of each independent activity as a process. The BEAM makes processes so cheap (~2 KB) that the correct design usually has more processes than you would initially expect. One process per connection, per agent, per monitored resource.

**Use [OTP behaviours](/glossary/otp-behaviour/) instead of raw processes.** GenServer, GenStatem, and Supervisor encode decades of distributed systems experience. Raw `spawn` should be used only for fire-and-forget tasks; stateful processes should always use OTP behaviours.

**Leverage per-process GC for latency-sensitive paths.** Place latency-sensitive code in processes with small heaps. Large allocations (bulk data processing, report generation) should happen in separate processes where GC pauses do not affect user-facing latency.

**Configure schedulers for your workload.** Match normal scheduler count to vCPUs. Allocate dirty IO schedulers proportional to concurrent external API calls. Monitor scheduler utilization via `:scheduler.utilization/1` and adjust.

**Use distribution for scaling, not for single-node performance.** BEAM distribution adds network latency to every cross-node message. Keep tightly-coupled processes on the same node and use distribution for geographic distribution, horizontal scaling, and fault domain separation.

## Common Pitfalls

**Long-running NIFs blocking schedulers.** Native Implemented Functions (NIFs) that run for more than 1 millisecond without yielding block the scheduler, preventing other processes from running. Use dirty schedulers for long NIFs, or break NIFs into yielding segments.

**Process mailbox overflow.** A process that receives messages faster than it can process them accumulates an unbounded mailbox, consuming memory until the system crashes. Monitor mailbox sizes and implement [backpressure](/glossary/backpressure/) mechanisms.

**Ignoring scheduler utilization.** An underloaded BEAM instance wastes resources; an overloaded one exhibits latency spikes. Monitor scheduler utilization and scale horizontally when sustained utilization exceeds 70%.

**Binary memory fragmentation.** Large binaries (>64 bytes) are stored in a shared heap and reference-counted. Processes that accumulate references to large binaries without releasing them prevent binary reclamation. Use `:erlang.garbage_collect/1` to force collection on suspect processes.

**Treating BEAM distribution as a service mesh.** BEAM distribution uses a full-mesh topology where every node connects to every other node. This scales to approximately 50-100 nodes before overhead becomes significant. For larger clusters, use a service mesh or partition the cluster.

## Use Cases

### High-Availability Platform Runtime

The Prismatic Platform runs on the BEAM to achieve continuous operation. Hot code reloading enables zero-downtime deployments, supervision trees automatically restart failed components, and per-process GC ensures consistent latency for LiveView dashboard interactions.

### Massive Agent Concurrency

With 530+ agents running concurrently, the BEAM's lightweight process model is essential. Each agent consumes approximately 2-10 KB of memory, allowing the entire agent population to run on a single machine. The preemptive scheduler ensures fair execution time across all agents.

### OSINT Tool Integration

Each of the 120 OSINT tool adapters runs in its own process with independent state (rate limits, authentication tokens, connection pools). When one adapter crashes due to an external API failure, the BEAM's fault isolation ensures all other adapters continue operating.

### Real-Time LiveView Dashboards

Each connected user's LiveView session is a BEAM process. The server can handle thousands of simultaneous dashboard sessions, each with independent state and real-time updates via WebSocket, without thread pool exhaustion or global GC pauses.

## Related Concepts

- [BEAM](/glossary/beam/) -- The broader BEAM ecosystem and community
- [Elixir](/glossary/elixir/) -- Primary language targeting the BEAM in Prismatic
- [Erlang](/glossary/erlang/) -- Original language and runtime for the BEAM
- [OTP](/glossary/otp/) -- Framework of behaviours and libraries built on the BEAM
- [GenServer](/glossary/genserver/) -- Core OTP behaviour for stateful BEAM processes
- [Process Isolation](/glossary/process-isolation/) -- BEAM's per-process fault boundaries
- [Hot Code Reload](/glossary/hot-code-reload/) -- BEAM's ability to update running code
- [Virtual Machine](/glossary/virtual-machine/) -- General concept of bytecode execution environments
- [Fault Tolerance](/glossary/fault-tolerance/) -- System resilience enabled by BEAM process model
- [Supervision Tree](/glossary/supervision-tree/) -- OTP restart strategy built on BEAM process monitoring

## See Also

- [ETS](/glossary/ets/) -- BEAM-native in-memory storage outside process heaps
- [GenStage](/glossary/genstage/) -- Demand-driven data processing on the BEAM
- [Broadway](/glossary/broadway/) -- Production-ready data pipelines on the BEAM
- [Backpressure](/glossary/backpressure/) -- Flow control for BEAM process mailboxes
- [Cluster](/glossary/cluster/) -- Multi-node BEAM deployments
- [Distributed System](/glossary/distributed-system/) -- Architecture patterns using BEAM distribution
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- 115 umbrella applications running on the BEAM

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
