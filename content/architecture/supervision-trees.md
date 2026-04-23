+++
title = "Supervision Trees"
weight = 5
date = 2026-02-12


[extra]
icon = "cpu"
color = "blue"
description = "Self-healing process hierarchies powered by OTP supervisors"
date_created = "2025-06-15"
reading_time = "12 min"
difficulty = "advanced"
tags = ["otp", "fault-tolerance", "erlang", "supervision", "self-healing", "process-isolation"]
related_articles = ["event-sourcing", "telemetry", "umbrella-apps", "pubsub", "storage-adapters"]
author = "Tomas Korcak (korczis)"
word_count = 1592
date_modified = "2026-02-23"
keywords = ["Supervision", "Trees", "Self-healing", "architecture", "Prismatic Platform", "The Prismatic", "Platform"]
quality_score = 90
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Supervision Trees - Prismatic Platform"
+++

## Overview

[Supervision tree](@/glossary/supervision-tree.md)s represent the foundational fault-tolerance mechanism of the Prismatic Platform. Rooted in the Erlang/[OTP](@/glossary/otp.md) tradition that has powered telecommunications systems achieving 99.9999999% (nine nines) uptime since the 1980s, supervision trees provide a hierarchical process management structure where every running process is monitored by a parent [supervisor](@/glossary/supervisor.md). When a child process fails -- whether from an unexpected exception, a corrupted state, or a resource exhaustion scenario -- the supervisor detects the failure and applies a predefined restart strategy. This design eliminates the need for pervasive defensive error handling and instead embraces the principle that failure is not exceptional but routine, and that recovery should be automated, deterministic, and fast.

In the Prismatic Platform, which manages over 400 [AIAD agents](@/glossary/aiad.md) across 90 [umbrella applications](@/architecture/umbrella-apps.md), supervision trees are not merely an implementation detail but an architectural cornerstone. Every stateful process -- from agent executors to storage connection pools to [telemetry](@/architecture/telemetry.md) handlers -- lives within a supervision hierarchy. This architecture ensures that a single agent crash never cascades into a platform-wide failure, that storage connections are automatically re-established after network partitions, and that the system self-heals without human intervention.

## The "Let It Crash" Philosophy and Its Rationale

The "[let it crash](@/glossary/let-it-crash.md)" philosophy, pioneered by Joe Armstrong in his 2003 PhD thesis on reliable [distributed system](@/glossary/distributed-system.md)s, represents a fundamental departure from defensive programming. Traditional approaches attempt to anticipate every possible error condition and handle it inline, leading to code where error handling logic often exceeds the business logic it protects. This approach suffers from three critical weaknesses: it cannot anticipate truly unexpected errors, it conflates error detection with error recovery, and it makes code harder to reason about.

The [OTP](@/glossary/otp.md) approach inverts this pattern. Business logic is written for the "happy path" only. When an unexpected condition arises, the process crashes -- a clean, deterministic termination that releases all resources. The supervisor, running in a separate process with separate memory, detects the crash and restarts the child with a clean initial state. This separation of concerns yields several advantages:

1. **Simplicity**: Business logic remains uncluttered by error handling for conditions that cannot be meaningfully recovered from inline.
2. **Isolation**: The crash is contained to a single process. Other processes continue operating unaffected, thanks to [process isolation](@/glossary/process-isolation.md) guaranteed by the [BEAM virtual machine](@/glossary/beam.md).
3. **Recovery correctness**: Restarting with a known-good initial state is provably safer than attempting to repair corrupted state in-place.
4. **[Observability](@/glossary/observability.md)**: Every crash generates a crash report with full stack trace, making debugging straightforward via [telemetry](@/architecture/telemetry.md) integration.

The alternative -- defensive programming in languages without process isolation -- requires every function to handle every possible failure mode of its dependencies. In practice, this leads to "swallowed" exceptions, partially corrupted state, and systems that limp along in degraded modes that are harder to debug than clean crashes. Erlang's per-process garbage collection and share-nothing architecture make the "let it crash" approach both safe and efficient.

## Supervision Hierarchy Architecture

The Prismatic Platform organizes its supervision trees in a layered hierarchy that mirrors the domain structure of the umbrella architecture. At the top level, each OTP application has its own `Application.start/2` callback that launches a root supervisor. These root supervisors then create domain-specific subtrees.

```
PrismaticPlatform.Application
    |
    +-- MainSupervisor (one_for_one)
    |       |
    |       +-- AgentSupervisor (one_for_one)
    |       |       +-- AgentRegistry (Registry)
    |       |       +-- AgentTaskSupervisor (Task.Supervisor)
    |       |       +-- AgentCoordinator (GenServer)
    |       |       +-- AgentDynamicSupervisor (DynamicSupervisor)
    |       |           +-- Agent:archer_001 (GenServer)
    |       |           +-- Agent:delta_force_002 (GenServer)
    |       |           +-- Agent:navy_seal_003 (GenServer)
    |       |
    |       +-- StorageSupervisor (rest_for_one)
    |       |       +-- ConnectionPool (DBConnection)
    |       |       +-- CacheWarmer (GenServer)
    |       |       +-- QueryProcessor (GenServer)
    |       |
    |       +-- PerimeterSupervisor (one_for_one)
    |       |       +-- DiscoveryEngine (GenServer)
    |       |       +-- ScanScheduler (GenServer)
    |       |       +-- RatingCalculator (GenServer)
    |       |
    |       +-- WebSupervisor (one_for_one)
    |               +-- Endpoint (Phoenix.Endpoint)
    |               +-- PubSub (Phoenix.PubSub)
    |               +-- Presence (Phoenix.Presence)
```

The choice of supervision hierarchy depth is deliberate. Deep trees provide fine-grained isolation: a crash in `Agent:archer_001` only triggers a restart of that specific agent, not the entire `AgentDynamicSupervisor`. Shallow trees are simpler but provide coarser isolation. The Prismatic Platform typically uses 3-4 levels of supervision depth, balancing isolation granularity against cognitive complexity.

## Restart Strategies: Selection Criteria and Tradeoffs

OTP provides four restart strategies, each suited to different dependency patterns among sibling processes. Choosing the correct strategy requires understanding the data and control flow dependencies between children.

| Strategy | Behavior | When to Use | Prismatic Usage |
|----------|----------|-------------|-----------------|
| `one_for_one` | Only restart the crashed child | Independent siblings with no shared state | Agent pools, web endpoints |
| `one_for_all` | Restart all children when any crashes | Tightly coupled siblings with shared invariants | Consensus groups, distributed locks |
| `rest_for_one` | Restart crashed child and all children started after it | Sequential dependency chain | Storage stack (pool -> cache -> query) |
| `DynamicSupervisor` | Dynamic children, same or varying specs | Runtime-spawned workers | Agent instances, scan workers |

The `rest_for_one` strategy for the `StorageSupervisor` deserves explanation. The `QueryProcessor` depends on the `CacheWarmer`, which depends on the `ConnectionPool`. If the `ConnectionPool` crashes, both the `CacheWarmer` and `QueryProcessor` must restart because their internal state (cached connections, prepared statements) is invalid. However, if only the `QueryProcessor` crashes, the pool and cache remain valid. The `rest_for_one` strategy precisely captures this asymmetric dependency.

```elixir
defmodule PrismaticAgents.Supervisor do
  @moduledoc """
  Root supervisor for the agent runtime subsystem.

  Uses rest_for_one because the Coordinator depends on the Registry
  and TaskSupervisor being available, but not vice versa.
  """
  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      {Registry, keys: :unique, name: PrismaticAgents.Registry},
      {Task.Supervisor, name: PrismaticAgents.TaskSupervisor},
      {PrismaticAgents.Coordinator, []},
      {DynamicSupervisor, name: PrismaticAgents.DynamicSupervisor, strategy: :one_for_one}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

### Restart Intensity and Period

Beyond strategy selection, supervisors configure `max_restarts` and `max_seconds` to prevent restart storms. If a child crashes more than `max_restarts` times within `max_seconds`, the supervisor itself terminates, propagating the failure upward to its own supervisor. This escalation mechanism prevents infinite restart loops when a persistent fault (such as a misconfigured dependency or a corrupted database) makes recovery impossible at the current level.

```elixir
# Conservative settings for storage (persistent faults should escalate quickly)
Supervisor.init(children,
  strategy: :rest_for_one,
  max_restarts: 3,
  max_seconds: 30
)

# Liberal settings for agents (transient faults are common and expected)
Supervisor.init(children,
  strategy: :one_for_one,
  max_restarts: 10,
  max_seconds: 60
)
```

The Prismatic Platform uses conservative restart limits (3 restarts in 30 seconds) for infrastructure processes like database connections and liberal limits (10 restarts in 60 seconds) for agent workers where transient failures from network timeouts or [rate limiting](@/glossary/rate-limiting.md) are expected and recoverable.

## Dynamic Supervision and Runtime Process Management

Static supervision trees defined at compile time handle processes with known, fixed lifecycles. However, [agents](@/apps/prismatic-agents.md) in the Prismatic Platform are spawned dynamically in response to user requests, scheduled tasks, or [event-sourced](@/architecture/event-sourcing.md) commands. `DynamicSupervisor` addresses this requirement by allowing children to be added and removed at runtime.

```elixir
defmodule PrismaticAgents.DynamicPool do
  @moduledoc """
  Manages the lifecycle of dynamically spawned agent workers.
  Provides backpressure through max_children configuration.
  """

  @max_concurrent_agents 500

  @spec start_agent(map()) :: {:ok, pid()} | {:error, :max_children | term()}
  def start_agent(agent_spec) do
    child_spec = {PrismaticAgents.Worker, agent_spec}

    case DynamicSupervisor.start_child(__MODULE__, child_spec) do
      {:ok, pid} ->
        :telemetry.execute(
          [:prismatic, :agents, :started],
          %{system_time: System.monotonic_time()},
          %{agent_id: agent_spec.id, type: agent_spec.type}
        )
        {:ok, pid}

      {:error, :max_children} ->
        {:error, :max_children}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec terminate_agent(pid()) :: :ok | {:error, :not_found}
  def terminate_agent(pid) do
    DynamicSupervisor.terminate_child(__MODULE__, pid)
  end

  @spec count_agents() :: non_neg_integer()
  def count_agents do
    DynamicSupervisor.count_children(__MODULE__).active
  end
end
```

The `max_children` option provides [backpressure](@/glossary/backpressure.md), preventing the system from spawning unbounded processes during traffic spikes. This is critical in the Prismatic Platform where a single [EASM](@/glossary/easm.md) discovery operation on [Prismatic Perimeter](@/apps/prismatic-perimeter.md) might trigger hundreds of concurrent scan agents.

## Process Registry and Service Discovery

In a system with thousands of dynamic processes, locating a specific process by name is essential. The Prismatic Platform uses the built-in `Registry` module, which provides O(1) lookups backed by [ETS tables](@/glossary/ets.md), supporting both unique and duplicate key registrations.

```elixir
# Registration with metadata at agent startup
defmodule PrismaticAgents.Worker do
  use GenServer

  def init(spec) do
    Registry.register(PrismaticAgents.Registry, {:agent, spec.id}, %{
      type: spec.type,
      started_at: DateTime.utc_now(),
      capabilities: spec.capabilities
    })

    {:ok, %{spec: spec, state: :initializing}}
  end
end

# Lookup from any process in any umbrella app
defmodule PrismaticAgents.Locator do
  @spec find_agent(String.t()) :: {:ok, pid(), map()} | {:error, :not_found}
  def find_agent(agent_id) do
    case Registry.lookup(PrismaticAgents.Registry, {:agent, agent_id}) do
      [{pid, metadata}] -> {:ok, pid, metadata}
      [] -> {:error, :not_found}
    end
  end

  @spec agents_by_type(atom()) :: [{pid(), map()}]
  def agents_by_type(type) do
    Registry.select(PrismaticAgents.Registry, [
      {{{:agent, :_}, :"$1", %{type: type}}, [], [:"$1"]}
    ])
  end
end
```

The choice of `Registry` over alternatives like `:global` or `:pg` is deliberate. `:global` provides cluster-wide registration but uses a global lock that becomes a bottleneck under high registration churn. `:pg` (process groups) is designed for pub/sub patterns rather than unique lookups. `Registry` offers the best performance for the Prismatic Platform's primary use case: fast, node-local unique lookups with metadata.

## Failure Recovery Patterns

### Graceful Degradation

When a monitored process crashes, the monitoring process receives a `{:DOWN, ref, :process, pid, reason}` message. The Prismatic Platform uses this to maintain accurate internal bookkeeping while letting the supervisor handle the actual restart.

```elixir
defmodule PrismaticAgents.Coordinator do
  use GenServer

  def init(_) do
    {:ok, %{agents: %{}, monitors: %{}}}
  end

  def handle_info({:DOWN, ref, :process, pid, reason}, state) do
    case Map.get(state.monitors, ref) do
      nil ->
        {:noreply, state}

      agent_id ->
        :telemetry.execute(
          [:prismatic, :agents, :crashed],
          %{system_time: System.monotonic_time()},
          %{agent_id: agent_id, reason: reason}
        )

        new_state = %{state |
          agents: Map.delete(state.agents, agent_id),
          monitors: Map.delete(state.monitors, ref)
        }

        {:noreply, new_state}
    end
  end
end
```

### Circuit Breaker Pattern

For external dependencies that may experience prolonged outages, the Prismatic Platform implements the [circuit breaker](@/glossary/circuit-breaker.md) pattern as a complement to supervision. While supervision handles transient failures through restarts, the [circuit breaker](@/glossary/circuit-breaker.md) prevents repeated calls to a known-failing dependency, reducing latency and resource waste.

```elixir
defmodule PrismaticAgents.CircuitBreaker do
  @moduledoc """
  Three-state circuit breaker: closed (normal), open (failing), half-open (probing).
  Transitions: closed -> open after threshold failures, open -> half-open after
  cooldown, half-open -> closed on success or back to open on failure.
  """
  use GenServer

  @failure_threshold 5
  @cooldown_ms 30_000

  defstruct [:name, :state, :failure_count, :last_failure_at]

  @spec call(atom(), (-> term())) :: {:ok, term()} | {:error, :circuit_open}
  def call(name, fun) do
    GenServer.call(via(name), {:call, fun})
  end

  @impl true
  def handle_call({:call, fun}, _from, %{state: :closed} = state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | failure_count: 0}}

      {:error, reason} ->
        new_count = state.failure_count + 1
        new_state = if new_count >= @failure_threshold do
          %{state | state: :open, failure_count: new_count,
            last_failure_at: System.monotonic_time(:millisecond)}
        else
          %{state | failure_count: new_count}
        end
        {:reply, {:error, reason}, new_state}
    end
  end

  def handle_call({:call, _fun}, _from, %{state: :open} = state) do
    if System.monotonic_time(:millisecond) - state.last_failure_at > @cooldown_ms do
      {:reply, {:error, :circuit_open}, %{state | state: :half_open}}
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end
end
```

## Monitoring and Observability

Supervision trees integrate tightly with the [telemetry subsystem](@/architecture/telemetry.md) to provide [real-time monitoring](@/capabilities/real-time-monitoring.md) of process health. The Prismatic Platform emits telemetry events for every supervisor action, enabling dashboards that display restart rates, process counts, and memory consumption per supervision subtree.

```elixir
:telemetry.attach_many(
  "supervisor-metrics",
  [
    [:supervisor, :start_child, :stop],
    [:supervisor, :restart_child, :stop],
    [:supervisor, :terminate_child, :stop]
  ],
  &PrismaticTelemetry.SupervisorHandler.handle_event/4,
  nil
)
```

### Health Check Thresholds

| Check | Interval | Warning Threshold | Critical Threshold | Action |
|-------|----------|-------------------|-------------------|--------|
| Process count per supervisor | 10s | > 5,000 | > 10,000 | Alert + backpressure |
| Restart rate | 1 min | > 3/min | > 5/min | Alert + investigation |
| Memory per process | 30s | > 50 MB | > 100 MB | Alert + forced GC |
| Message queue depth | 5s | > 500 | > 1,000 | Alert + load shedding |
| Supervisor uptime | 60s | < 99.9% | < 99% | Escalation |

## Performance Characteristics

The overhead of supervision is minimal. Process spawning on the BEAM takes approximately 2-5 microseconds with ~2.5 KB of initial memory. Supervisor monitoring uses Erlang's built-in process linking mechanism, which adds zero runtime overhead for the happy path (no crashes). The cost is paid only on failure: crash detection takes less than 1 microsecond (kernel-level signal), and restart including state initialization typically completes in under 1 millisecond.

| Operation | Latency | Memory |
|-----------|---------|--------|
| Process spawn | 2-5 us | ~2.5 KB initial |
| Crash detection | < 1 us | 0 (kernel signal) |
| Restart (simple [GenServer](@/glossary/genserver.md)) | < 1 ms | ~2.5 KB |
| Restart (with ETS state recovery) | 1-5 ms | Varies |
| [Registry](@/glossary/registry-otp.md) lookup | < 1 us | O(1) ETS |
| DynamicSupervisor.start_child | 5-10 us | ~2.5 KB |

These numbers mean that the Prismatic Platform can sustain a restart rate of thousands of processes per second without measurable impact on overall system throughput. In practice, the [quality gates](@/capabilities/quality-gates.md) ensure restart rates stay well below these theoretical limits.

## Comparison with Alternative Approaches

### Supervision Trees vs. Kubernetes Pod Restarts

Kubernetes provides process-level restarts through liveness probes and pod recreation. However, pod restarts operate at a much coarser granularity (entire container) and higher latency (seconds to minutes). Supervision trees restart individual processes in microseconds, providing 1000x faster recovery with 1000x finer granularity.

### Supervision Trees vs. Try/Catch Error Handling

Languages without process isolation must use try/catch for error recovery. This conflates error detection, error handling, and error recovery into a single mechanism, leading to deeply nested code that is difficult to test and reason about. Supervision separates these concerns: business code detects errors by crashing, supervisors handle recovery, and monitoring systems report on failures.

### Supervision Trees vs. Actor Frameworks (Akka, Orleans)

Actor frameworks in the JVM and .NET ecosystems provide similar supervision capabilities. However, they operate within a shared-memory runtime where a single corrupted pointer can crash the entire VM. The BEAM's per-process heap and immutable [message passing](@/glossary/message-passing.md) provide stronger isolation guarantees, making supervision restarts truly safe rather than merely hopeful.

## Summary

Supervision trees in the Prismatic Platform provide the foundation for [fault tolerance](@/glossary/fault-tolerance.md) that scales from individual agent processes to platform-wide resilience. By embracing the [let it crash](@/glossary/let-it-crash.md) philosophy, separating error detection from error recovery, and using hierarchical restart strategies matched to dependency patterns, the platform achieves [self-healing](@/glossary/self-healing.md) behavior that requires zero human intervention. Combined with [dynamic supervision](@/glossary/dynamic-supervisor.md) for runtime process management, [circuit breakers](@/glossary/circuit-breaker.md) for external dependency protection, and deep [telemetry integration](@/architecture/telemetry.md) for observability, the supervision tree architecture ensures that the Prismatic Platform's 400+ agents and 90 applications operate with the reliability expected of mission-critical intelligence systems.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)