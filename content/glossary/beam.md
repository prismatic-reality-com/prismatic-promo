+++
title = "BEAM"
weight = 22
[extra]
category = "otp"
description = "Bogdan/Bjorn's Erlang Abstract Machine - the virtual machine that executes Erlang and Elixir code, providing lightweight processes, preemptive scheduling, and fault tolerance"
acronym = "BEAM"
domain = "runtime"
complexity = "advanced"
stability = "stable"
since_version = "1.0.0"
enforcement_level = "foundational"
related_terms = ["otp", "genserver", "supervision-tree", "pvm", "elixir", "hot-code-reload", "cluster", "ecto", "message-passing", "phoenix", "postgresql", "process-isolation", "umbrella", "liveview", "broadway", "genstage", "let-it-crash"]
platforms = ["erlang", "elixir", "gleam", "lfe"]
use_cases = ["concurrent-systems", "fault-tolerant-services", "real-time-dashboards", "distributed-computing", "telecom-switching"]
tags = ["virtual-machine", "concurrency", "fault-tolerance", "preemptive-scheduling", "distribution", "hot-code-loading"]
see_also = ["otp", "genserver", "supervision-tree", "process-isolation", "phoenix"]
difficulty = "advanced"
audience = ["platform-architects", "systems-engineers", "backend-engineers"]
prerequisites = ["operating-systems", "concurrency-fundamentals"]
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1960
date_modified = "2026-02-23"
keywords = ["BEAM", "BogdanBjorns", "Erlang", "Abstract", "Machine", "Elixir", "glossary", "otp", "Prismatic Platform"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "BEAM - Prismatic Platform"
+++

## Definition

BEAM (Bogdan/Bjorn's Erlang Abstract Machine) is the virtual machine at the heart of the Erlang and Elixir ecosystems. Originally developed at Ericsson in the late 1990s as a successor to the earlier JAM (Joe's Abstract Machine), BEAM provides the runtime environment that makes the entire [OTP](/glossary/otp/) framework possible. It was designed from the ground up for concurrency, fault tolerance, and soft real-time operation in telecommunications systems where downtime was measured in minutes per year, not hours.

BEAM's defining characteristic is its process model: it can run millions of lightweight, isolated processes simultaneously, each with its own heap and garbage collector. These processes communicate exclusively through [message passing](/glossary/message-passing/), eliminating shared-state concurrency bugs that plague thread-based runtimes. The scheduler is preemptive and reduction-based, ensuring no single process can monopolize CPU time -- a property that makes BEAM uniquely suited to building systems where responsiveness matters more than raw throughput.

Unlike the JVM or CPython, BEAM was never designed to be a general-purpose computing platform. Its architecture embodies a specific philosophy: processes are cheap, failures are expected, and the system must continue operating even when individual components crash. This philosophy, formalized in the [let it crash](/glossary/let-it-crash/) doctrine, means that BEAM applications are structured around [supervision trees](/glossary/supervision-tree/) that automatically restart failed processes rather than attempting to handle every possible error condition defensively.

## Historical Background

The story of BEAM begins at Ericsson's Computer Science Laboratory in the mid-1980s, where Joe Armstrong, Robert Virding, and Mike Williams set out to build a programming language suited to telecommunications switching systems. These systems demanded extreme reliability (five nines -- 99.999% uptime), concurrent handling of hundreds of thousands of simultaneous phone calls, and the ability to upgrade software without interrupting service.

The first Erlang implementation ran on a Prolog interpreter, which was far too slow for production use. The JAM (Joe's Abstract Machine) followed as the first compiled bytecode VM for Erlang. In 1998, Bogdan Hausman created BEAM as a complete reimplementation, incorporating a threaded code interpreter and native code compilation via HiPE (High Performance Erlang). The name "BEAM" originally stood for "Bogdan's Erlang Abstract Machine," later humorously reinterpreted as "Bjorn's Erlang Abstract Machine" after Bjorn Gustavsson took over its maintenance.

Ericsson deployed BEAM-based systems in production throughout the late 1990s, most famously in the AXD 301 ATM switch, which achieved nine nines of reliability (99.9999999% uptime). When Ericsson briefly banned Erlang internally in 1998, the language was open-sourced, enabling its adoption beyond telecommunications into messaging systems (WhatsApp, RabbitMQ), databases (CouchDB, Riak), and ultimately web applications through [Phoenix](/glossary/phoenix/) and Elixir.

The emergence of Elixir in 2012, created by Jose Valim, brought modern language features (macros, protocols, Mix tooling) to the BEAM while preserving full compatibility with Erlang libraries. This revitalized the BEAM ecosystem, attracting a new generation of developers and spawning frameworks like Phoenix, LiveView, and Broadway that exploit BEAM's concurrency model for web applications, real-time dashboards, and data processing pipelines.

## Architecture and Internals

BEAM's architecture consists of several cooperating subsystems that together deliver its unique runtime characteristics. Understanding these internals is essential for writing performant Elixir applications and diagnosing production issues.

### Scheduler Architecture

BEAM runs one scheduler per CPU core by default, with each scheduler managing its own run queue of processes. The schedulers use a work-stealing algorithm: when a scheduler's run queue is empty, it steals processes from other schedulers' queues. This provides automatic load balancing across cores without programmer intervention.

Each process receives a budget of approximately 4,000 "reductions" (roughly equivalent to function calls) before being preempted and placed at the back of the run queue. This reduction-based preemption is fundamentally different from time-based preemption used by OS thread schedulers -- it ensures that even long-running computations cannot starve other processes, providing bounded latency guarantees.

| Scheduler Component | Description |
|---------------------|-------------|
| **Run Queues** | Per-scheduler FIFO queues with priority levels (max, high, normal, low) |
| **Reduction Budget** | ~4,000 reductions per scheduling quantum |
| **Work Stealing** | Idle schedulers steal from busy schedulers' queues |
| **Dirty Schedulers** | Dedicated schedulers for CPU-intensive and I/O operations that would block normal schedulers |
| **Async Thread Pool** | Configurable thread pool for NIF-based I/O operations |

### Process Model

BEAM processes are not operating system threads. They are lightweight entities managed entirely within the VM, with a starting memory footprint of approximately 2-3 KB (including a small heap, a stack, a process control block, and a mailbox). A single BEAM instance can comfortably run millions of concurrent processes on commodity hardware.

```elixir
defmodule PrismaticRuntime.ProcessDemo do
  @moduledoc """
  Demonstrates BEAM's lightweight process model.
  Spawns processes with minimal overhead, each fully isolated
  with its own heap, stack, mailbox, and garbage collector.
  """

  @type process_info :: %{
    pid: pid(),
    memory: non_neg_integer(),
    status: :waiting | :running | :exiting,
    message_queue_len: non_neg_integer()
  }

  @spec spawn_many(non_neg_integer()) :: {:ok, list(pid())}
  def spawn_many(count) when is_integer(count) and count > 0 do
    pids =
      for _ <- 1..count do
        spawn(fn ->
          receive do
            :stop -> :ok
          end
        end)
      end

    {:ok, pids}
  end

  @spec inspect_process(pid()) :: {:ok, process_info()} | {:error, :not_alive}
  def inspect_process(pid) do
    case Process.alive?(pid) do
      true ->
        info = Process.info(pid, [:memory, :status, :message_queue_len])

        {:ok, %{
          pid: pid,
          memory: Keyword.get(info, :memory, 0),
          status: Keyword.get(info, :status, :unknown),
          message_queue_len: Keyword.get(info, :message_queue_len, 0)
        }}

      false ->
        {:error, :not_alive}
    end
  end
end
```

## Memory Model

BEAM's memory model is built around per-process heaps. Each process has its own heap that is garbage collected independently using a generational copying collector. This design has profound implications for system behavior.

| Memory Property | Consequence |
|----------------|-------------|
| **Per-Process GC** | Garbage collection pauses affect only one process, never the whole system |
| **Copy-on-Send** | Messages are deep-copied into the receiving process's heap (no shared references) |
| **Generational Collection** | Young generation collected frequently, old generation collected rarely |
| **Bounded Pause Times** | GC pauses are proportional to individual process heap size, not total system memory |
| **Large Binary Optimization** | Binaries over 64 bytes are stored in a shared reference-counted heap |
| **Process Termination** | All memory reclaimed instantly when a process terminates |

The copy-on-send semantics mean that processes truly share nothing. While this introduces a copying overhead for message passing, it eliminates an entire class of concurrency bugs and enables the [fault isolation](/glossary/process-isolation/) that BEAM is famous for: when a process crashes, only its own heap is affected.

### Memory Architecture Diagram

```
BEAM Memory Layout:
+--------------------------------------------------+
|  Shared Binary Heap (reference-counted)          |
|  - Binaries > 64 bytes stored here               |
|  - Shared across processes via references         |
+--------------------------------------------------+
|  Process 1          |  Process 2          |  ... |
|  +-- Young Heap     |  +-- Young Heap     |      |
|  +-- Old Heap       |  +-- Old Heap       |      |
|  +-- Stack          |  +-- Stack          |      |
|  +-- Mailbox        |  +-- Mailbox        |      |
|  +-- PCB            |  +-- PCB            |      |
+--------------------------------------------------+
|  ETS Tables (shared memory, no copying)          |
+--------------------------------------------------+
|  Atom Table (global, never garbage collected)    |
+--------------------------------------------------+
```

## Distribution and Clustering

BEAM includes built-in support for transparent distribution across networked nodes. When two BEAM nodes connect (typically over TCP), processes on different nodes can send messages to each other using the same syntax as local message passing. The distribution layer handles serialization, network transport, and node monitoring automatically.

```elixir
defmodule PrismaticCluster.NodeManager do
  @moduledoc """
  Manages BEAM node connections for distributed operation.
  Provides node discovery, connection management, and
  health monitoring for multi-node deployments.
  """

  @type node_status :: :connected | :disconnected | :unreachable

  @spec connect_node(atom()) :: {:ok, node_status()} | {:error, term()}
  def connect_node(node_name) when is_atom(node_name) do
    case Node.connect(node_name) do
      true -> {:ok, :connected}
      false -> {:error, :connection_failed}
      :ignored -> {:error, :not_alive}
    end
  end

  @spec send_remote(atom(), atom(), term()) :: :ok
  def send_remote(node_name, registered_name, message) do
    send({registered_name, node_name}, message)
    :ok
  end

  @spec monitor_remote(atom(), atom()) :: reference()
  def monitor_remote(node_name, registered_name) do
    Process.monitor({registered_name, node_name})
  end

  @spec cluster_status() :: {:ok, map()}
  def cluster_status do
    nodes = Node.list()

    status = %{
      self: Node.self(),
      connected_nodes: nodes,
      node_count: length(nodes) + 1,
      cookie: Node.get_cookie()
    }

    {:ok, status}
  end
end
```

Distribution is foundational for BEAM [clustering](/glossary/cluster/). In a cluster, [Phoenix PubSub](/glossary/pubsub/) messages propagate across nodes, [supervisors](/glossary/supervisor/) can manage processes on remote nodes, and libraries like Horde provide distributed process registries for automatic failover. The Prismatic Platform exploits this capability for multi-node deployments on [Fly.io](/glossary/fly-io/), where the WireGuard mesh network provides the transport layer for Erlang distribution.

## Hot Code Loading

One of BEAM's most distinctive features is its ability to replace running code without stopping the system. BEAM maintains two versions of each module simultaneously (the "current" and the "old" version), allowing processes executing the old version to finish while new processes use the updated code.

```elixir
defmodule PrismaticRuntime.CodeLoader do
  @moduledoc """
  Demonstrates BEAM's hot code loading capability.
  BEAM maintains two versions of each module simultaneously,
  enabling zero-downtime upgrades for long-running processes.
  """

  @spec current_version(module()) :: {:ok, non_neg_integer()} | {:error, term()}
  def current_version(module) do
    case :code.get_object_code(module) do
      {^module, _binary, _filename} ->
        {:ok, module.module_info(:attributes) |> Keyword.get(:vsn, [0]) |> hd()}

      :error ->
        {:error, :module_not_loaded}
    end
  end

  @spec loaded_modules() :: {:ok, list(module())}
  def loaded_modules do
    modules =
      :code.all_loaded()
      |> Enum.map(fn {mod, _path} -> mod end)
      |> Enum.filter(&String.starts_with?(Atom.to_string(&1), "Elixir.Prismatic"))

    {:ok, modules}
  end
end
```

This mechanism was originally designed for telecommunications systems that could never go offline. While modern deployment practices (blue-green deployments, rolling restarts) have reduced the need for in-place [hot code loading](/glossary/hot-code-reload/), it remains valuable for long-running BEAM processes that maintain important state, such as connection handlers or stateful [GenServer](/glossary/genserver/) agents.

## Why Prismatic Chose BEAM

The Prismatic Platform runs entirely on BEAM, which hosts all 115 umbrella applications, 530+ autonomous agents, and the complete supervision tree hierarchy. The choice of BEAM was driven by several architectural requirements that aligned precisely with BEAM's strengths.

| Requirement | BEAM Solution |
|-------------|---------------|
| **530+ concurrent agents** | Each agent is a BEAM process; millions possible without resource contention |
| **Fault isolation** | Agent crashes cannot corrupt other agents or the platform core |
| **Real-time dashboards** | [LiveView](/glossary/liveview/) processes maintain WebSocket connections with sub-millisecond event handling |
| **Zero-downtime deploys** | Hot code reload and rolling restarts via OTP releases |
| **Multi-node clustering** | Native distribution for [Fly.io](/glossary/fly-io/) edge deployment |
| **OSINT pipeline processing** | [GenStage](/glossary/genstage/) and [Broadway](/glossary/broadway/) pipelines with backpressure |
| **Soft real-time guarantees** | Preemptive scheduling ensures consistent response times under load |
| **120 OSINT tool integration** | Concurrent HTTP connections to external providers without thread exhaustion |

The per-process garbage collection model is particularly important for the platform's agent architecture. When one of the 530+ agents experiences a spike in memory usage due to processing a large OSINT dataset, the GC pause affects only that agent's process. All other agents, the web dashboard, and the API continue operating with their normal latency characteristics.

## Comparison with Other Runtimes

Understanding BEAM's trade-offs relative to other runtimes helps clarify when it is -- and is not -- the right choice.

| Property | BEAM | JVM | Go | Node.js |
|----------|------|-----|----|---------|
| **Concurrency Model** | Actor processes (millions) | OS threads + virtual threads | Goroutines (millions) | Event loop (single-threaded) |
| **Preemptive Scheduling** | Yes (reduction-based) | Yes (OS-level) | Yes (cooperative + preemptive) | No (cooperative) |
| **Fault Isolation** | Per-process | Per-thread (shared heap) | Per-goroutine (shared heap) | None (single process) |
| **GC Impact** | Per-process (microseconds) | Global stop-the-world (milliseconds) | Global (sub-millisecond) | Global (V8, milliseconds) |
| **Distribution** | Built-in | Libraries (Akka, Hazelcast) | Libraries (custom) | Libraries (custom) |
| **Hot Code Loading** | Native | Class reloading (limited) | No | No |
| **Raw CPU Throughput** | Moderate | High | High | Moderate |
| **Tail Call Optimization** | Full | Limited | No | No |
| **Pattern Matching** | Native (compiler-optimized) | Limited (switch/instanceof) | No | No |

BEAM sacrifices raw single-threaded performance for unmatched fault isolation, predictable latency, and built-in distribution. For CPU-bound workloads (matrix multiplication, cryptographic operations, image processing), BEAM processes can delegate to NIFs (Native Implemented Functions) or Dirty Schedulers to avoid blocking the normal schedulers.

## Diagnostic and Observability Tools

BEAM ships with powerful runtime introspection tools that are invaluable for debugging production systems.

```elixir
defmodule PrismaticRuntime.Diagnostics do
  @moduledoc """
  Runtime diagnostics leveraging BEAM's built-in introspection.
  Provides system health metrics, process analysis, and
  scheduler utilization tracking.
  """

  @type system_metrics :: %{
    process_count: non_neg_integer(),
    run_queue: non_neg_integer(),
    memory: map(),
    scheduler_count: non_neg_integer()
  }

  @spec system_metrics() :: {:ok, system_metrics()}
  def system_metrics do
    {:ok, %{
      process_count: :erlang.system_info(:process_count),
      run_queue: :erlang.statistics(:run_queue),
      memory: :erlang.memory() |> Enum.into(%{}),
      scheduler_count: :erlang.system_info(:schedulers_online)
    }}
  end

  @spec top_processes(non_neg_integer()) :: {:ok, list(map())}
  def top_processes(limit \\ 10) do
    processes =
      Process.list()
      |> Enum.map(fn pid ->
        info = Process.info(pid, [:memory, :message_queue_len, :reductions, :registered_name])

        %{
          pid: pid,
          name: Keyword.get(info, :registered_name),
          memory: Keyword.get(info, :memory, 0),
          message_queue: Keyword.get(info, :message_queue_len, 0),
          reductions: Keyword.get(info, :reductions, 0)
        }
      end)
      |> Enum.sort_by(& &1.memory, :desc)
      |> Enum.take(limit)

    {:ok, processes}
  end

  @spec scheduler_utilization() :: {:ok, list(float())}
  def scheduler_utilization do
    :erlang.statistics(:scheduler_wall_time_all)
    |> Enum.map(fn {_id, active, total} ->
      if total > 0, do: active / total, else: 0.0
    end)
    |> then(&{:ok, &1})
  end
end
```

The [Observer](/glossary/observer/) tool provides a graphical interface for examining process hierarchies, message queues, ETS tables, and memory allocation in real-time. The `:recon` library (often included in production deployments) adds advanced diagnostics including process leak detection, port analysis, and scheduler utilization tracking.

## BEAM Performance Tuning

While BEAM prioritizes latency and fault tolerance over raw throughput, several tuning parameters can significantly affect performance.

| Parameter | Default | Purpose | Tuning Guidance |
|-----------|---------|---------|-----------------|
| `+S` | CPU cores | Scheduler count | Match to physical cores, not hyperthreads |
| `+SDcpu` | CPU cores | Dirty CPU schedulers | Increase for NIF-heavy workloads |
| `+SDio` | 10 | Dirty I/O schedulers | Increase for heavy file/network I/O |
| `+P` | 262144 | Max processes | Increase for agent-heavy workloads |
| `+Q` | 65536 | Max ports | Increase for many network connections |
| `+MBas` | varies | Allocator settings | Tune for memory-intensive workloads |
| `+hms` | 233 | Default heap size | Increase for processes handling large data |

## Best Practices

1. **Design around processes, not modules.** BEAM applications should be decomposed into processes based on isolation requirements, not code organization. Each stateful entity should have its own process.

2. **Keep process heaps small.** Large process heaps increase GC pause times for that process. Stream data through processes rather than accumulating it.

3. **Use dirty schedulers for blocking operations.** NIFs and port operations that take more than 1ms should run on dirty schedulers to avoid blocking the normal reduction-based scheduling.

4. **Monitor scheduler utilization.** High scheduler utilization (> 80% sustained) indicates the system is approaching CPU saturation. Use `:erlang.statistics(:scheduler_wall_time)` to track this metric.

5. **Leverage distribution for horizontal scaling.** BEAM's built-in distribution makes adding nodes straightforward. Design GenServers with distribution in mind from the start.

## Common Pitfalls

- **Creating atoms dynamically from user input.** The atom table is never garbage collected and has a default limit of 1,048,576 entries. Use `String.to_existing_atom/1` instead of `String.to_atom/1` for user-supplied data.

- **Sending large messages between processes.** Messages are deep-copied into the receiving process's heap. For large data (> 64KB), consider using ETS as a shared storage and passing only the lookup key in the message.

- **Blocking normal schedulers with long-running NIFs.** NIFs that run for more than 1ms without yielding will block the scheduler, causing all processes on that scheduler's run queue to wait. Use dirty NIF scheduling or break long computations into yielding segments.

- **Ignoring process mailbox growth.** A process that receives messages faster than it can process them will accumulate messages in its mailbox, consuming unbounded memory. Monitor message_queue_len and implement backpressure.

## Related Terms

- [OTP](/glossary/otp/) - Framework of behaviors and design principles built on BEAM
- [GenServer](/glossary/genserver/) - Primary OTP behavior running as a BEAM process
- [Supervision Tree](/glossary/supervision-tree/) - Hierarchical process management on BEAM
- [PVM](/glossary/pvm/) - Prismatic's platform VM layer built atop BEAM
- [Process Isolation](/glossary/process-isolation/) - BEAM's per-process crash containment
- [Hot Code Reload](/glossary/hot-code-reload/) - Runtime module replacement without restart
- [Message Passing](/glossary/message-passing/) - Inter-process communication mechanism
- [Phoenix](/glossary/phoenix/) - Web framework leveraging BEAM's concurrency model
- [Cluster](/glossary/cluster/) - Multi-node BEAM deployment
- [Broadway](/glossary/broadway/) - Data processing pipelines on BEAM
- [GenStage](/glossary/genstage/) - Demand-driven pipeline stages on BEAM
- [Let It Crash](/glossary/let-it-crash/) - Error handling philosophy enabled by BEAM
- [LiveView](/glossary/liveview/) - Real-time UI leveraging BEAM process model
- [ETS](/glossary/ets/) - In-memory storage integrated with BEAM runtime

## See Also

- [Technologies](/technologies/) - Full technology stack
- [Architecture](/architecture/) - Platform architecture
- [Fault Tolerance](/glossary/fault-tolerance/) - System reliability through BEAM primitives
- [Distributed System](/glossary/distributed-system/) - Multi-node system design

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
