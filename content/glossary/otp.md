+++
title = "OTP"
weight = 40
[extra]
description = "Open Telecom Platform - Erlang/Elixir application framework for fault-tolerant systems"
category = "elixir"
abbreviation = "OTP"
related_terms = ["genserver", "supervision-tree", "ets", "behaviour", "elixir", "hot-code-reload", "3nl", "agent", "backpressure", "beam", "broadway", "circuit-breaker", "dynamic-supervisor", "ecto", "genstage", "hex", "liveview", "message-passing", "mix-task", "ollama", "openapi", "phoenix", "postgresql", "process-isolation", "protocol", "pvm", "release", "supervisor", "telemetry", "umbrella", "umbrella-application"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1822
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OTP", "Open", "Telecom", "Platform", "ErlangElixir", "glossary", "elixir", "Prismatic Platform", "GenServer", "BEAM"]
tags = ["glossary", "elixir", "otp", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OTP - Prismatic Platform"
+++

## Definition and Overview

The Open Telecom Platform (OTP) is a collection of libraries, design principles, middleware, and tools for building fault-tolerant, concurrent, distributed systems in Erlang and Elixir. Originally developed by Ericsson for telephone switching systems in the 1980s, OTP encodes decades of distributed systems engineering experience into standardized abstractions called behaviours -- reusable patterns for common process types including generic servers (GenServer), supervisors, state machines (GenStatem), and event handlers. Combined with the BEAM virtual machine's lightweight process model, OTP enables systems that run continuously, self-heal from failures, and scale horizontally across nodes.

The name "Open Telecom Platform" is historical and somewhat misleading. While OTP was created for telecommunications infrastructure, its principles and abstractions are universally applicable to any system requiring high availability, fault tolerance, and concurrent processing. Web servers, databases, message brokers, real-time analytics engines, IoT platforms, and AI agent systems all benefit from OTP's patterns. The platform's design philosophy -- "let it crash" combined with supervision-based recovery -- produces systems that are more reliable than those built with defensive programming techniques, because failure handling is structural rather than conditional.

OTP's architecture is built on a fundamental insight: in complex systems, failures are inevitable. Rather than trying to prevent all failures (an impossible goal), OTP focuses on containing failures (through process isolation), detecting failures (through monitors and links), and recovering from failures (through supervisors and restart strategies). This approach produces systems where individual components may fail frequently but the system as a whole maintains its availability guarantees. Ericsson's AXD 301 telephone switch, built on OTP, achieved nine nines of availability (99.9999999%) -- approximately 31 milliseconds of downtime per year.

The OTP application model organizes code into self-contained applications, each with its own supervision tree, configuration, and lifecycle. Applications can depend on other applications, forming a dependency graph that OTP manages automatically. This model maps naturally to microservice architectures but with significant advantages: applications share a single BEAM VM, communicate through fast message passing rather than network protocols, and benefit from unified supervision and monitoring.

## Historical Context

OTP's development began at Ericsson's Computer Science Laboratory in the late 1980s, driven by the need to build highly reliable telephone switching systems. The team, led by Joe Armstrong, Robert Virding, and Mike Williams, recognized that telecommunications systems required a fundamentally different approach to error handling than conventional software. A telephone switch serving millions of subscribers cannot afford to crash entirely when a single call encounters an error.

The initial implementation was in Prolog before the team designed Erlang as a purpose-built language for concurrent, fault-tolerant systems. The first commercial OTP release shipped in 1998 as part of the AXD 301 ATM switch. Ericsson open-sourced Erlang/OTP in 1998, enabling its adoption beyond telecommunications.

Key milestones in OTP's evolution include the introduction of the `gen_server` behaviour (early 1990s), the formalization of supervision trees (mid-1990s), the addition of distributed Erlang (late 1990s), and the creation of [Elixir](/glossary/elixir/) by Jose Valim in 2011, which brought modern language features and developer ergonomics to the [BEAM](/glossary/beam/) ecosystem while preserving full OTP compatibility. Today, OTP powers systems at WhatsApp (handling 2 million connections per server), Discord (handling millions of concurrent users), and the Prismatic Platform (managing 1,090 autonomous agents across 141 umbrella applications).

## Technical Deep Dive

### OTP Behaviours

Behaviours are the core abstraction of OTP. A behaviour defines a set of callback functions that a module must implement, providing a standardized interface for common patterns:

| Behaviour | Purpose | Key Callbacks | Use Case |
|-----------|---------|---------------|----------|
| **GenServer** | Generic server process | `init/1`, `handle_call/3`, `handle_cast/2`, `handle_info/2` | Stateful services, caches, coordinators |
| **Supervisor** | Process monitoring and restart | `init/1` (child specification) | Fault tolerance, process lifecycle |
| **Application** | Application lifecycle | `start/2`, `stop/1` | Top-level application management |
| **GenStatem** | Finite state machine | `init/1`, state callbacks, `handle_event/4` | Protocols, connection management, workflows |
| **GenStage** | Producer-consumer pipeline | `init/1`, `handle_demand/2`, `handle_events/3` | Data processing, back-pressure |
| **DynamicSupervisor** | On-demand child supervision | `init/1`, `start_child/2` | Per-request workers, connection pools |

### The Supervision Tree

The supervision tree is OTP's central architectural concept. Every long-running process in an OTP application exists within a supervision tree -- a hierarchical structure where supervisor processes monitor worker processes:

```
Application
└── Top-Level Supervisor
    ├── Worker: ConfigStore (GenServer)
    ├── Supervisor: AgentSupervisor
    │   ├── Worker: AgentCoordinator (GenServer)
    │   ├── Worker: AgentRegistry (GenServer)
    │   └── DynamicSupervisor: AgentPool
    │       ├── Worker: Agent#1 (GenServer)
    │       ├── Worker: Agent#2 (GenServer)
    │       └── Worker: Agent#N (GenServer)
    ├── Supervisor: StorageSupervisor
    │   ├── Worker: ETSManager (GenServer)
    │   └── Worker: PostgresPool (DBConnection)
    └── Worker: HealthMonitor (GenServer)
```

Restart strategies determine how supervisors respond to child failures:

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `:one_for_one` | Restart only the failed child | Independent workers |
| `:one_for_all` | Restart all children when one fails | Interdependent workers |
| `:rest_for_one` | Restart the failed child and all children started after it | Ordered dependencies |

```elixir
defmodule PrismaticPlatform.Supervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Start order matters: dependencies first
      {PrismaticStorage.Supervisor, []},
      {PrismaticAgents.Supervisor, []},
      {PrismaticWeb.Endpoint, []},
      {PrismaticSafety.QualityFloorGuardian, interval: 30_000}
    ]

    # rest_for_one: if Storage fails, restart Agents and Web too
    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

### Process Isolation and Failure Domains

BEAM processes provide complete memory isolation. Each process has its own heap, garbage collector, and mailbox. A crash in one process cannot corrupt another process's memory:

```
Process A                    Process B                    Process C
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│ Heap: 512KB      │        │ Heap: 128KB      │        │ Heap: 2MB        │
│ Stack: 8KB       │        │ Stack: 4KB       │        │ Stack: 16KB      │
│ Mailbox: 3 msgs  │        │ Mailbox: empty   │        │ Mailbox: 100 msgs│
│ GC: independent  │        │ GC: independent  │        │ GC: independent  │
│                  │        │                  │        │                  │
│ CRASH: Process A │        │ Unaffected       │        │ Unaffected       │
│ terminates,      │        │ continues        │        │ continues        │
│ memory reclaimed │        │ normally         │        │ normally         │
└──────────────────┘        └──────────────────┘        └──────────────────┘
        │
        v
Supervisor: detects exit, restarts Process A with fresh state
```

This isolation model means that even catastrophic errors (division by zero, pattern match failures, out-of-memory conditions) are contained to the single process where they occur. The supervisor detects the process exit and starts a fresh replacement, typically within microseconds.

### OTP Application Model

An OTP application is a self-contained component with its own supervision tree, configuration, and dependency declarations:

```elixir
defmodule PrismaticPerimeter.Application do
  @moduledoc """
  OTP Application for Prismatic Perimeter EASM module.
  Manages discovery pipeline, rating engine, and compliance assessment.
  """
  use Application

  @impl Application
  def start(_type, _args) do
    children = [
      # ETS tables for caching
      {PrismaticPerimeter.Cache, []},
      # Discovery pipeline
      {PrismaticPerimeter.Discovery.Supervisor, []},
      # Rating engine
      {PrismaticPerimeter.Rating.Engine, []},
      # Compliance assessor
      {PrismaticPerimeter.Compliance.Assessor, []},
      # Telemetry
      PrismaticPerimeter.Telemetry
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl Application
  def stop(_state) do
    :ok
  end
end
```

### Message Passing and Concurrency

OTP processes communicate exclusively through asynchronous message passing. There is no shared memory, no locks, no mutexes:

```elixir
defmodule PrismaticAgents.Coordinator do
  @moduledoc """
  Coordinates agent operations through OTP message passing.
  Demonstrates the actor model pattern.
  """
  use GenServer

  # Client API (sends messages)
  def assign_task(agent_id, task) do
    GenServer.call(__MODULE__, {:assign, agent_id, task})
  end

  def broadcast_update(update) do
    GenServer.cast(__MODULE__, {:broadcast, update})
  end

  # Server callbacks (receives messages)
  @impl GenServer
  def handle_call({:assign, agent_id, task}, _from, state) do
    case Map.get(state.agents, agent_id) do
      nil ->
        {:reply, {:error, :agent_not_found}, state}

      agent_pid ->
        # Send task to agent process
        GenServer.cast(agent_pid, {:execute_task, task})
        new_state = track_assignment(state, agent_id, task)
        {:reply, :ok, new_state}
    end
  end

  @impl GenServer
  def handle_cast({:broadcast, update}, state) do
    # Fan-out to all agents concurrently
    Enum.each(state.agents, fn {_id, pid} ->
      GenServer.cast(pid, {:update, update})
    end)

    {:noreply, state}
  end

  @impl GenServer
  def handle_info({:agent_completed, agent_id, result}, state) do
    :telemetry.execute(
      [:prismatic, :agent, :task_complete],
      %{duration_ms: result.duration},
      %{agent_id: agent_id}
    )

    {:noreply, update_completion(state, agent_id, result)}
  end
end
```

### Hot Code Reloading

OTP supports replacing running code without stopping the system. The BEAM maintains two versions of each module simultaneously, allowing active processes to finish their current function call in the old version before migrating to the new version:

```
Version N (current)                Version N+1 (new)
┌──────────────────────┐          ┌──────────────────────┐
│ Module.function/2    │          │ Module.function/2    │
│   (executing now)    │   ──>   │   (next call uses    │
│                      │          │    this version)     │
└──────────────────────┘          └──────────────────────┘
```

GenServer's `code_change/3` callback supports state migration between versions:

```elixir
@impl GenServer
def code_change(_old_vsn, state, _extra) do
  # Migrate state from old format to new format
  new_state = case state do
    %{version: 1} -> migrate_v1_to_v2(state)
    %{version: 2} -> state
    _ -> %{version: 2, data: state}
  end
  {:ok, new_state}
end
```

## Architecture and Implementation

### OTP in Umbrella Architecture

The Prismatic Platform's 90-application umbrella leverages OTP's application model. Each umbrella app is a separate OTP application with its own supervision tree:

```elixir
# mix.exs -- umbrella root
defp deps do
  [
    {:prismatic_storage_core, in_umbrella: true},
    {:prismatic_storage_ets, in_umbrella: true},
    {:prismatic_storage_ecto, in_umbrella: true},
    {:prismatic, in_umbrella: true},
    {:prismatic_web, in_umbrella: true},
    {:prismatic_agents, in_umbrella: true},
    {:prismatic_perimeter, in_umbrella: true},
    {:prismatic_api, in_umbrella: true}
    # ... 82 more applications
  ]
end
```

OTP's dependency management ensures applications start in the correct order and propagates failures appropriately. If `prismatic_storage_ecto` fails to start (e.g., database unavailable), applications depending on it will not start, preventing cascading failures from missing infrastructure.

### Distribution and Clustering

OTP includes built-in distribution primitives for building clustered systems:

| Primitive | Purpose | Usage |
|-----------|---------|-------|
| **Node.connect/1** | Connect BEAM nodes | Cluster formation |
| **:global** | Global name registration | Singleton processes across cluster |
| **:pg** | Process groups | Publish-subscribe across nodes |
| **:rpc** | Remote procedure calls | Cross-node function execution |
| **Horde** | Distributed supervisor/registry | Fault-tolerant distributed processes |

```elixir
defmodule PrismaticCluster.Formation do
  @moduledoc """
  OTP-based cluster formation for distributed deployment.
  Uses libcluster for automatic node discovery on Fly.io.
  """

  def topology do
    [
      prismatic: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          polling_interval: 5_000,
          query: "prismatic-prod.internal",
          node_basename: "prismatic"
        ]
      ]
    ]
  end
end
```

## ETS Integration Patterns

[ETS](/glossary/ets-table/) (Erlang Term Storage) is an OTP component that provides in-memory key-value storage with constant-time lookups. ETS tables are owned by processes but can be read concurrently by any process on the same node. The most common OTP pattern combines a GenServer for write serialization with direct ETS reads for concurrent access:

```elixir
defmodule PrismaticCache.ETSStore do
  @moduledoc """
  ETS-backed cache with GenServer write serialization.
  Reads bypass the GenServer for concurrent access;
  writes go through GenServer for consistency.
  """

  use GenServer

  @spec get(atom(), term()) :: {:ok, term()} | :not_found
  def get(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> :not_found
    end
  end

  @spec put(atom(), term(), term()) :: :ok
  def put(table, key, value) do
    GenServer.call(via(table), {:put, key, value})
  end

  @impl GenServer
  def init(table_name) do
    table = :ets.new(table_name, [
      :set,
      :named_table,
      :protected,
      read_concurrency: true,
      write_concurrency: false
    ])

    {:ok, %{table: table, size: 0}}
  end

  @impl GenServer
  def handle_call({:put, key, value}, _from, state) do
    :ets.insert(state.table, {key, value})
    {:reply, :ok, %{state | size: state.size + 1}}
  end
end
```

This pattern provides the best of both worlds: reads are lock-free and concurrent (leveraging BEAM's read-concurrency optimization), while writes are serialized through the GenServer to maintain consistency. The Prismatic Platform uses this pattern extensively for caching OSINT adapter results, API introspection metadata, and quality gate status.

## Usage in Prismatic Platform

The Prismatic Platform is built OTP-first, meaning every architectural decision starts with OTP patterns. The mandatory meta-rule -- "If the same solution could be written identically in Node.js, it's WRONG" -- ensures idiomatic OTP usage throughout.

### OTP-First Decision Framework

| Design Decision | Non-OTP Approach | OTP Approach |
|----------------|-----------------|--------------|
| **Mutable state** | Module-level variable | GenServer process |
| **Background work** | setTimeout/setInterval | GenServer + Process.send_after |
| **Concurrent requests** | Promise.all | Task.async_stream |
| **Error recovery** | try/catch everywhere | Supervisor restart strategies |
| **Shared cache** | Global variable/singleton | ETS table owned by GenServer |
| **Pipeline processing** | Callback chains | Broadway/GenStage |
| **State machine** | Switch/case with status field | GenStatem with explicit states |
| **Service discovery** | External registry (Consul) | OTP Registry or :global |

### Platform OTP Statistics

| Metric | Count | Purpose |
|--------|-------|---------|
| **OTP Applications** | 90 | Umbrella apps with supervision trees |
| **GenServer processes** | 500+ at runtime | Stateful services and agents |
| **Supervisors** | 150+ | Fault tolerance hierarchies |
| **ETS Tables** | 50+ | Concurrent read caches |
| **DynamicSupervisors** | 20+ | On-demand process pools |

### Key Platform OTP Patterns

```elixir
# Pattern: GenServer with ETS backing (read-heavy cache)
defmodule PrismaticCache.Store do
  use GenServer

  def get(key), do: :ets.lookup(:cache, key)          # Direct ETS read (concurrent)
  def put(key, val), do: GenServer.call(__MODULE__, {:put, key, val})  # Serialized write

  @impl GenServer
  def init(_) do
    table = :ets.new(:cache, [:set, :protected, :named_table, read_concurrency: true])
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_call({:put, key, val}, _from, state) do
    :ets.insert(:cache, {key, val})
    {:reply, :ok, state}
  end
end

# Pattern: Circuit Breaker (fault containment)
defmodule PrismaticResilience.CircuitBreaker do
  use GenServer

  @failure_threshold 3
  @reset_timeout :timer.seconds(60)

  defstruct circuit: :closed, failures: 0, last_failure: nil

  @impl GenServer
  def handle_call({:execute, fun}, _from, %{circuit: :open} = state) do
    if time_to_reset?(state),
      do: try_half_open(fun, state),
      else: {:reply, {:error, :circuit_open}, state}
  end

  def handle_call({:execute, fun}, _from, state) do
    case fun.() do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | circuit: :closed, failures: 0}}

      {:error, reason} ->
        new_failures = state.failures + 1
        new_circuit = if new_failures >= @failure_threshold, do: :open, else: :closed
        {:reply, {:error, reason}, %{state | failures: new_failures, circuit: new_circuit, last_failure: DateTime.utc_now()}}
    end
  end
end
```

## Comparison with Alternative Approaches

| Approach | Concurrency Model | Fault Tolerance | State Management | Distribution |
|----------|------------------|-----------------|------------------|-------------|
| **OTP/BEAM** | Lightweight processes (millions) | Supervision trees | Per-process heap | Built-in (Erlang distribution) |
| **Go goroutines** | Green threads (thousands) | Manual error handling | Shared memory + channels | External (gRPC, etcd) |
| **Node.js** | Event loop (single-threaded) | Process manager (PM2) | Global state | External (Redis, message queues) |
| **JVM (Akka)** | Actor model (thousands) | Supervision (inspired by OTP) | Per-actor state | Akka Cluster |
| **Rust (Tokio)** | Async tasks (thousands) | Result types + panics | Ownership system | External |

OTP's advantage is the integration depth: processes, supervision, distribution, hot code reloading, and the application model are all built into the runtime, not bolted on as libraries. Akka explicitly acknowledges OTP as its inspiration but operates within the JVM's constraints (garbage collection pauses, thread pool limits). Go's goroutines provide excellent concurrency but lack OTP's structural fault tolerance -- a panicking goroutine crashes the entire program unless recovered explicitly.

## Best Practices

**Design supervision trees before writing code.** Draw the process hierarchy on paper or whiteboard before implementing. Identify which processes are independent (one_for_one), which are interdependent (one_for_all), and which have ordered dependencies (rest_for_one). The supervision tree is the architecture diagram for an OTP application.

**Use the right behaviour for the job.** GenServer for general stateful processes, GenStatem for processes with explicit state transitions, DynamicSupervisor for on-demand process creation, Broadway for data pipeline processing. Using GenServer for everything is a common mistake that produces unnecessarily complex code.

**Keep process state small.** Large state in a GenServer heap causes garbage collection pauses. Move large datasets to ETS, which has its own memory space. The GenServer should own the ETS table and manage write serialization, while reads bypass the GenServer entirely.

**Name processes for discoverability.** Use `name: __MODULE__` for singleton processes and `{:via, Registry, {MyRegistry, id}}` for multiple instances. Named processes can be found and monitored without tracking PIDs, making the system more debuggable and observable.

**Emit telemetry from all processes.** OTP processes should emit telemetry events for message processing latency, mailbox size, state size, and error rates. This instrumentation enables production monitoring and capacity planning.

## Common Pitfalls

**Bottlenecking through a single GenServer.** Routing all operations through one process serializes everything into a single mailbox. For read-heavy workloads, use ETS for concurrent reads. For write-heavy workloads, consider partitioning across multiple processes using Registry-based naming.

**Ignoring back-pressure signals.** When a GenServer's mailbox grows faster than it can process messages, memory consumption increases without bound. Monitor mailbox sizes and implement back-pressure through caller-side rate limiting, GenStage demand-driven processing, or Broadway-based pipelines.

**Starting processes outside supervision trees.** Processes started with `spawn` or `Task.start` are not supervised and will not be restarted on failure. Every long-running process must be started through a supervisor. Use `Task.Supervisor` for short-lived tasks.

**Synchronous calls in init/1.** Making GenServer.call to other processes during initialization creates startup ordering dependencies and potential deadlocks. Use `handle_continue/2` for initialization that depends on other processes.

**Treating OTP as optional.** In an Elixir application, OTP is not a library you choose to use -- it is the runtime environment. Ignoring OTP patterns and building with module-level state, global variables, or ad hoc concurrency forfeits the reliability, debuggability, and operational properties that justify choosing Elixir in the first place.

## Related Concepts

- [GenServer](/glossary/genserver/) -- Core OTP behaviour for stateful server processes
- [Supervision Tree](/glossary/supervision-tree/) -- Hierarchical fault tolerance pattern
- [ETS Table](/glossary/ets-table/) -- OTP in-memory storage for high-speed data access
- [Behaviour](/glossary/behaviour/) -- Callback mechanism defining OTP abstractions
- [BEAM](/glossary/beam/) -- Virtual machine providing process isolation and scheduling
- [GenStatem](/glossary/gen-statem/) -- State machine behaviour for protocol modeling
- [Elixir](/glossary/elixir/) -- The language built on top of OTP and BEAM
- [Umbrella Application](/glossary/umbrella-application/) -- Multi-app project structure using OTP applications
- [Telemetry](/glossary/telemetry/) -- Metrics and events for OTP process observability

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- OTP applications in the Prismatic umbrella

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)