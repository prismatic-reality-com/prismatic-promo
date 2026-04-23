+++
title = "Lifecycle Management"
weight = 50
[extra]
tags = ["glossary", "operations", "process-management", "otp", "supervision", "genserver", "state-machine", "deployment", "elixir", "system-design"]
description = "Lifecycle Management encompasses the systematic orchestration of software entities through their complete existence -- from creation and initialization through active operation, state transitions, degradation handling, and graceful termination -- ensuring deterministic behavior at every phase."
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["supervision-tree", "genserver", "dynamic-supervisor", "state-machine", "fault-tolerance", "gen-statem", "process-isolation", "hot-code-reload", "releases-elixir", "health-monitoring"]
key_concepts = ["process lifecycle", "state transitions", "initialization", "graceful shutdown", "health checks", "upgrade strategies", "resource cleanup"]
use_cases = ["OTP application management", "agent lifecycle", "connection pooling", "deployment orchestration", "session management"]
see_also = ["process supervision", "state management", "deployment strategies", "resource management"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1788
date_modified = "2026-02-23"
keywords = ["Lifecycle", "Management", "glossary", "operations", "Prismatic Platform", "GenServer", "Elixir"]
image = "/images/sections/glossary.png"
image_alt = "Lifecycle Management - Prismatic Platform"
+++

## Definition

Lifecycle Management is the disciplined practice of governing every phase of a software entity's existence -- from initial creation and configuration through active operation, state transitions, error recovery, and eventual shutdown or replacement. In the context of Elixir and OTP, lifecycle management is deeply embedded in the platform's process model: every GenServer, Supervisor, Task, and Agent follows a well-defined lifecycle governed by OTP callbacks (`init/1`, `handle_call/3`, `handle_cast/2`, `handle_info/2`, `terminate/2`, `code_change/3`). The Prismatic Platform extends these primitives to manage the lifecycles of 530+ agents, 115 umbrella applications, storage adapters, web connections, background jobs, and the platform itself through structured supervision trees and deployment orchestration.

## Overview

Every software system is composed of entities that are born, live, and die. The question is whether those transitions happen chaotically or under explicit control. Lifecycle management provides the framework for ensuring the latter.

In traditional imperative programming, lifecycle management is often ad-hoc: objects are created with constructors, used through method calls, and garbage-collected when no references remain. Critical cleanup (closing file handles, releasing locks, flushing buffers) depends on developers remembering to call the right methods at the right time. This approach breaks down at scale, especially in concurrent and distributed systems where entities can fail at any point in their lifecycle.

Elixir and OTP take a fundamentally different approach. Every stateful entity lives in its own process with an explicit lifecycle defined by OTP behaviours. The `GenServer` behaviour provides `init/1` for setup, `terminate/2` for cleanup, and a family of `handle_*` callbacks for operation. The `Supervisor` behaviour manages the lifecycles of child processes, automatically restarting them according to configurable strategies when they fail. This makes lifecycle management a first-class architectural concern rather than an afterthought.

The Prismatic Platform applies lifecycle management at multiple scales:

- **Process level**: Individual GenServers managing agent state, storage connections, and web socket connections.
- **Application level**: OTP applications starting and stopping as coordinated units with dependency ordering.
- **Platform level**: The entire 115-application umbrella starting, operating, and upgrading as a cohesive system.
- **Content level**: Learning resources, glossary entries, and documentation pages transitioning through draft, review, published, deprecated, and archived states.
- **Deployment level**: Releases being built, deployed, health-checked, and either promoted or rolled back.

Each scale requires its own lifecycle management patterns, but all share common principles: explicit state transitions, deterministic initialization, graceful degradation, observable health, and clean termination.

## Technical Details

### GenServer Lifecycle

The most fundamental lifecycle in Elixir is the GenServer process lifecycle. Every agent, registry, cache, and stateful service in the Prismatic Platform follows this pattern:

```elixir
defmodule Prismatic.AgentRuntime do
  @moduledoc """
  Manages the lifecycle of a single AIAD agent process.
  Demonstrates the complete GenServer lifecycle with proper
  initialization, health monitoring, and graceful shutdown.
  """

  use GenServer
  require Logger

  @type state :: %{
    agent_id: String.t(),
    status: :initializing | :ready | :running | :paused | :shutting_down,
    started_at: DateTime.t(),
    last_heartbeat: DateTime.t(),
    task_count: non_neg_integer(),
    config: map()
  }

  @heartbeat_interval_ms 30_000

  # --- Lifecycle Phase 1: Creation ---

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    GenServer.start_link(__MODULE__, opts, name: via_tuple(agent_id))
  end

  # --- Lifecycle Phase 2: Initialization ---

  @impl GenServer
  def init(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    config = Keyword.get(opts, :config, %{})

    Logger.info("Agent #{agent_id} initializing")

    state = %{
      agent_id: agent_id,
      status: :initializing,
      started_at: DateTime.utc_now(),
      last_heartbeat: DateTime.utc_now(),
      task_count: 0,
      config: config
    }

    # Defer heavy initialization to avoid blocking supervisor
    {:ok, state, {:continue, :post_init}}
  end

  @impl GenServer
  def handle_continue(:post_init, state) do
    # Perform heavy initialization (load config, connect to deps)
    :telemetry.execute(
      [:prismatic, :agent, :lifecycle],
      %{duration: 0},
      %{agent_id: state.agent_id, phase: :initialized}
    )

    schedule_heartbeat()
    {:noreply, %{state | status: :ready}}
  end

  # --- Lifecycle Phase 3: Active Operation ---

  @impl GenServer
  def handle_call(:get_status, _from, state) do
    {:reply, {:ok, state.status}, state}
  end

  def handle_call({:execute_task, task}, _from, %{status: :ready} = state) do
    result = execute(task, state)
    {:reply, result, %{state | status: :ready, task_count: state.task_count + 1}}
  end

  def handle_call({:execute_task, _task}, _from, %{status: status} = state) do
    {:reply, {:error, {:unavailable, status}}, state}
  end

  # --- Lifecycle Phase 4: Health Monitoring ---

  @impl GenServer
  def handle_info(:heartbeat, state) do
    now = DateTime.utc_now()

    :telemetry.execute(
      [:prismatic, :agent, :heartbeat],
      %{task_count: state.task_count},
      %{agent_id: state.agent_id, status: state.status}
    )

    schedule_heartbeat()
    {:noreply, %{state | last_heartbeat: now}}
  end

  # --- Lifecycle Phase 5: Graceful Shutdown ---

  @impl GenServer
  def terminate(reason, state) do
    Logger.info("Agent #{state.agent_id} terminating: #{inspect(reason)}")

    :telemetry.execute(
      [:prismatic, :agent, :lifecycle],
      %{total_tasks: state.task_count, uptime_seconds: uptime(state)},
      %{agent_id: state.agent_id, phase: :terminated, reason: reason}
    )

    :ok
  end

  defp schedule_heartbeat do
    Process.send_after(self(), :heartbeat, @heartbeat_interval_ms)
  end

  defp uptime(state) do
    DateTime.diff(DateTime.utc_now(), state.started_at, :second)
  end

  defp via_tuple(agent_id) do
    {:via, Registry, {Prismatic.AgentRegistry, agent_id}}
  end

  defp execute(task, state) do
    # Task execution logic
    {:ok, %{agent_id: state.agent_id, task: task, result: :completed}}
  end
end
```

### State Machine Lifecycle with gen_statem

For entities with complex state transitions, `gen_statem` provides a formalized lifecycle model:

```elixir
defmodule Prismatic.Deployment.ReleasePipeline do
  @moduledoc """
  Manages the lifecycle of a deployment release through
  well-defined states: building, testing, staging, canary,
  rolling_out, and completed (or rolled_back).
  """

  @behaviour :gen_statem

  @type state ::
    :building
    | :testing
    | :staging
    | :canary
    | :rolling_out
    | :completed
    | :rolled_back

  @type data :: %{
    release_id: String.t(),
    version: String.t(),
    started_at: DateTime.t(),
    history: [{state(), DateTime.t()}],
    health_checks: [map()]
  }

  def start_link(opts) do
    release_id = Keyword.fetch!(opts, :release_id)
    :gen_statem.start_link({:local, :"release_#{release_id}"}, __MODULE__, opts, [])
  end

  @impl :gen_statem
  def callback_mode, do: :state_functions

  @impl :gen_statem
  def init(opts) do
    data = %{
      release_id: Keyword.fetch!(opts, :release_id),
      version: Keyword.fetch!(opts, :version),
      started_at: DateTime.utc_now(),
      history: [{:building, DateTime.utc_now()}],
      health_checks: []
    }

    {:ok, :building, data, [{:state_timeout, 300_000, :build_timeout}]}
  end

  # State: Building
  def building(:cast, :build_complete, data) do
    {:next_state, :testing, record_transition(data, :testing),
     [{:state_timeout, 600_000, :test_timeout}]}
  end

  def building(:state_timeout, :build_timeout, data) do
    {:next_state, :rolled_back, record_transition(data, :rolled_back)}
  end

  # State: Testing
  def testing(:cast, {:tests_passed, results}, data) do
    {:next_state, :staging, record_transition(%{data | health_checks: results}, :staging)}
  end

  def testing(:cast, {:tests_failed, _results}, data) do
    {:next_state, :rolled_back, record_transition(data, :rolled_back)}
  end

  # State: Canary
  def canary(:cast, {:health_check, :healthy}, data) do
    {:next_state, :rolling_out, record_transition(data, :rolling_out)}
  end

  def canary(:cast, {:health_check, :unhealthy}, data) do
    {:next_state, :rolled_back, record_transition(data, :rolled_back)}
  end

  # State: Rolling Out
  def rolling_out(:cast, :rollout_complete, data) do
    {:next_state, :completed, record_transition(data, :completed)}
  end

  defp record_transition(data, new_state) do
    %{data | history: [{new_state, DateTime.utc_now()} | data.history]}
  end
end
```

### Supervisor Lifecycle Strategies

Supervisors manage the lifecycles of their children according to configurable strategies:

```elixir
defmodule Prismatic.Platform.DomainSupervisor do
  @moduledoc """
  Supervises domain-level services with lifecycle-aware restart
  strategies. Uses rest_for_one to ensure dependent services
  restart when their dependencies fail.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Phase 1: Core infrastructure (must start first)
      {Prismatic.StorageCoordinator, []},

      # Phase 2: Domain services (depend on storage)
      {Prismatic.AgentOrchestrator, []},
      {Prismatic.QualityGuardian, []},

      # Phase 3: Integration services (depend on domain)
      {Prismatic.WebhookDispatcher, []},
      {Prismatic.TelemetryAggregator, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one, max_restarts: 5, max_seconds: 60)
  end
end
```

### Application Lifecycle Hooks

OTP applications have their own lifecycle with explicit start and stop phases:

```elixir
defmodule PrismaticPlatform.Application do
  @moduledoc """
  Root application module managing the platform lifecycle.
  Handles startup sequencing, health validation, and graceful shutdown.
  """

  use Application
  require Logger

  @impl Application
  def start(_type, _args) do
    Logger.info("Prismatic Platform starting (#{Mix.env()} environment)")

    # Pre-flight checks before starting supervision tree
    :ok = verify_system_requirements()
    :ok = initialize_telemetry()

    children = build_child_specs()

    opts = [
      strategy: :one_for_one,
      name: PrismaticPlatform.Supervisor,
      max_restarts: 10,
      max_seconds: 60
    ]

    case Supervisor.start_link(children, opts) do
      {:ok, pid} ->
        run_post_startup_checks()
        Logger.info("Prismatic Platform started successfully")
        {:ok, pid}

      {:error, reason} = error ->
        Logger.error("Prismatic Platform failed to start: #{inspect(reason)}")
        error
    end
  end

  @impl Application
  def stop(_state) do
    Logger.info("Prismatic Platform shutting down gracefully")
    :ok = flush_pending_operations()
    :ok = close_external_connections()
    Logger.info("Prismatic Platform shutdown complete")
    :ok
  end

  @impl Application
  def prep_stop(_state) do
    Logger.info("Prismatic Platform preparing to stop - draining in-flight requests")
    drain_connections(timeout: 30_000)
    :ok
  end
end
```

## Implementation

### Lifecycle Phases in Practice

Every managed entity in the Prismatic Platform transitions through these phases:

**Phase 1 -- Configuration**: The entity's parameters are validated before any resources are allocated. Invalid configuration fails fast with clear error messages. This happens in `start_link/1` argument validation.

**Phase 2 -- Initialization**: Resources are allocated, connections are established, and initial state is constructed. Heavy initialization is deferred using `{:continue, :post_init}` to avoid blocking the supervisor. The entity is not available for work until initialization completes.

**Phase 3 -- Ready**: The entity is fully initialized and available to process requests. Health check endpoints return positive status. The entity registers itself in the appropriate registry (agent registry, service registry, etc.).

**Phase 4 -- Active Operation**: The entity processes requests, emits telemetry, and maintains its state. Periodic health checks verify that the entity remains functional. Backpressure mechanisms protect against overload.

**Phase 5 -- Degraded Operation**: When dependencies become unavailable or resource limits are reached, the entity enters a degraded state. It may reject new requests, operate with reduced functionality, or queue work for later processing. Circuit breakers manage the transition.

**Phase 6 -- Shutdown**: Graceful shutdown drains in-flight requests, flushes buffers, closes connections, and releases resources. The `terminate/2` callback handles cleanup. Supervisors enforce shutdown timeouts to prevent hung processes from blocking platform shutdown.

### Hot Code Upgrade Lifecycle

Elixir/OTP supports upgrading running systems without downtime through the `code_change/3` callback:

```elixir
@impl GenServer
def code_change(old_vsn, state, extra) do
  Logger.info("Upgrading from version #{old_vsn}, extra: #{inspect(extra)}")

  # Transform state to new format
  new_state = migrate_state(state, old_vsn)

  {:ok, new_state}
end
```

This enables the Prismatic Platform to deploy new versions of agents, storage adapters, and services without interrupting ongoing operations -- a critical capability for a platform that manages real-time security monitoring and intelligence operations.

## Comparison

### OTP Lifecycle vs. Kubernetes Pod Lifecycle

Kubernetes manages container lifecycles through pod phases (Pending, Running, Succeeded, Failed, Unknown) and lifecycle hooks (postStart, preStop). OTP manages process lifecycles through supervision strategies and callbacks. The key difference is granularity: Kubernetes operates at the container level (seconds to minutes), while OTP operates at the process level (microseconds). The Prismatic Platform uses both, with Fly.io managing the container lifecycle and OTP managing the internal process lifecycle.

### GenServer vs. Actor Model (Akka)

Both GenServer and Akka actors manage entity lifecycles through message passing and supervision. GenServer's lifecycle is more explicit -- callbacks like `init/1` and `terminate/2` are first-class contracts, while Akka uses lifecycle hooks and context methods. Erlang's "let it crash" philosophy means GenServer lifecycle management focuses on recovery rather than prevention.

### State Machine vs. Workflow Engine

State machines (gen_statem) manage individual entity lifecycles with well-defined transitions. Workflow engines (like Broadway or Oban) manage the lifecycle of work items across multiple processing stages. The Prismatic Platform uses both: gen_statem for entity state management and Broadway for data pipeline lifecycle management.

### Manual vs. Automated Lifecycle Management

Manual lifecycle management requires developers to explicitly create, monitor, and destroy resources. Automated lifecycle management (through supervisors, garbage collectors, or container orchestrators) handles these transitions based on declarative policies. OTP supervision is the gold standard for automated lifecycle management in the Erlang/Elixir ecosystem.

## Best Practices

1. **Always use supervision**: Every long-running process should be supervised. Unsupervised processes are invisible to the platform's lifecycle management infrastructure and will silently leak resources when they fail.

2. **Defer heavy initialization**: Use `{:continue, :post_init}` in GenServer `init/1` to avoid blocking the supervisor startup sequence. This is especially important in large supervision trees where blocking initialization cascades into startup timeouts.

3. **Implement `terminate/2` for cleanup**: Any process that holds external resources (database connections, file handles, network sockets) must implement `terminate/2` to release them. Relying on process death to trigger cleanup is unreliable under normal shutdown conditions.

4. **Make state transitions explicit**: Use gen_statem for entities with more than three states. Ad-hoc state tracking in a GenServer's state map becomes error-prone as complexity grows.

5. **Emit telemetry at lifecycle transitions**: Every state change should emit a telemetry event. This enables monitoring dashboards to visualize lifecycle patterns and detect anomalies.

6. **Set shutdown timeouts**: Configure appropriate `:shutdown` values in child specs. The default `:infinity` for supervisors and `5000` for workers should be adjusted based on the expected cleanup time.

7. **Health checks at every phase**: Provide health check functions that report not just "up/down" but the current lifecycle phase. A process that is initializing is different from one that is actively serving requests.

8. **Test lifecycle transitions**: Write tests that exercise the full lifecycle: start, operate, degrade, recover, and stop. Property-based tests can verify that lifecycle invariants hold across random sequences of events.

## Common Pitfalls

1. **Ignoring shutdown order**: Starting services in dependency order but not shutting them down in reverse order. This causes dependent services to fail during shutdown, generating noise and potential data loss.

2. **Blocking in init/1**: Performing synchronous network calls, database queries, or disk I/O in `init/1`. This blocks the supervisor and can cascade into startup timeouts across the entire supervision tree.

3. **Missing terminate/2**: Assuming that process death automatically cleans up all resources. External connections, ETS tables owned by other processes, and published messages are not cleaned up by the garbage collector.

4. **Infinite restart loops**: Misconfigured supervisors that endlessly restart a process that immediately fails. The `max_restarts` and `max_seconds` settings must be tuned to prevent this.

5. **State corruption during upgrades**: Hot code upgrades that fail to properly migrate the process state. Always implement `code_change/3` when the state structure changes between versions.

6. **Orphaned processes**: Processes started outside of supervision trees that are never stopped. These accumulate over time, consuming memory and potentially holding resources.

7. **Health check lies**: Health check endpoints that return "healthy" before initialization is complete, during degraded operation, or when critical dependencies are unavailable. Health checks must accurately reflect the lifecycle phase.

8. **Timeout cascades**: Setting the same timeout value for processes at different levels of the supervision tree. Parent supervisors must have longer timeouts than their children to allow orderly shutdown propagation.

## Use Cases

### Agent Lifecycle Orchestration

The Prismatic Platform manages 530+ AIAD agents, each with its own lifecycle. Agents are started on demand, monitored for health, paused during maintenance windows, and shut down gracefully when no longer needed. The DynamicSupervisor enables adding and removing agents at runtime.

### Database Connection Pool Management

Ecto Repo connections follow a lifecycle managed by DBConnection and Poolboy/NimblePool: connections are established, validated, assigned to queries, returned to the pool, health-checked periodically, and replaced when they become stale or broken.

### Deployment Pipeline

Platform releases follow a lifecycle from build through test, staging, canary, full rollout, and either completion or rollback. Each phase has entry criteria, health checks, and rollback triggers managed through gen_statem.

### Session Management

Web sessions in Phoenix LiveView follow a lifecycle from connection through mount, active use, idle timeout, reconnection attempts, and eventual termination. The LiveView lifecycle callbacks (`mount/3`, `handle_event/3`, `terminate/2`) map directly to lifecycle management principles.

### Content Publication

Learning resources in the promo site follow a content lifecycle: drafted, reviewed, published, maintained, deprecated, and archived. Each transition requires specific criteria to be met, ensuring that published content always meets quality standards.

## Related Concepts

Lifecycle management connects deeply with core OTP and platform engineering concepts:

- [Supervision Tree](/glossary/supervision-tree/) -- the hierarchical structure that manages process lifecycles through automated restart strategies
- [GenServer](/glossary/genserver/) -- the primary OTP behaviour that provides the lifecycle callback framework for stateful processes
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- supervisor variant that manages lifecycles of processes created at runtime
- [State Machine](/glossary/state-machine/) -- formalism for defining explicit state transitions within an entity's lifecycle
- [Fault Tolerance](/glossary/fault-tolerance/) -- the system property that lifecycle management enables through supervised restart and recovery
- [Gen Statem](/glossary/gen-statem/) -- OTP behaviour specifically designed for complex lifecycle state management
- [Process Isolation](/glossary/process-isolation/) -- the BEAM property that ensures one process's lifecycle failure does not corrupt others
- [Hot Code Reload](/glossary/hot-code-reload/) -- Erlang/OTP capability to upgrade running processes without lifecycle interruption
- [Releases (Elixir)](/glossary/releases-elixir/) -- the deployment artifact format that manages platform-level lifecycle transitions
- [Health Monitoring](/glossary/health-monitoring/) -- continuous observation of lifecycle state to detect degradation and trigger recovery

## See Also

- [Circuit Breaker](/glossary/circuit-breaker/) -- pattern for managing dependency lifecycle failures through controlled degradation
- [Backpressure](/glossary/backpressure/) -- flow control mechanism that protects processes from lifecycle-threatening overload
- [Blue-Green Deployment](/glossary/blue-green-deployment/) -- deployment strategy that manages release lifecycle transitions with zero downtime
- [Telemetry](/glossary/telemetry/) -- observability framework that captures lifecycle transition events for monitoring and alerting
- [Let It Crash](/glossary/let-it-crash/) -- the Erlang philosophy that lifecycle management through supervision is preferable to defensive programming

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
