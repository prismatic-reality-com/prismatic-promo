+++
title = "Process Restart"
weight = 50
[extra]
tags = ["glossary", "otp", "fault-tolerance", "supervision", "erlang", "beam", "resilience"]
description = "Process restart is the OTP mechanism by which a supervisor detects a terminated child process and starts a fresh replacement, restoring the system to a known good state without affecting other processes or requiring human intervention."
category = "otp"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["supervisor", "supervision-tree", "let-it-crash", "fault-tolerance", "genserver", "process-isolation", "circuit-breaker", "self-healing", "beam-vm", "otp"]
key_concepts = ["restart strategies", "restart intensity", "child specifications", "transient processes", "permanent processes", "backoff"]
use_cases = ["fault recovery", "state corruption repair", "connection re-establishment", "graceful degradation"]
prerequisites = ["genserver", "supervisor", "otp"]
version = "1.0.0"
schema_type = "DefinedTerm"
date_created = "2026-02-22"
word_count = 1942
date_modified = "2026-02-23"
keywords = ["Process", "Restart", "glossary", "otp", "Prismatic Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Process Restart - Prismatic Platform"
+++

## Definition

Process restart is the fundamental fault recovery mechanism in OTP (Open Telecom Platform) whereby a supervisor detects the abnormal or expected termination of a child process and automatically starts a fresh replacement instance. The restarted process begins with clean, known-good initial state, effectively eliminating whatever corruption, deadlock, or resource exhaustion caused the original process to fail. This mechanism is the runtime implementation of the "let it crash" philosophy -- rather than attempting to handle every conceivable error condition within a process, the system allows processes to fail and relies on supervisors to restore service.

In the BEAM virtual machine, processes are extraordinarily lightweight (approximately 2KB of initial memory) and fully isolated from one another. A process crash cannot corrupt another process's memory, cannot leak resources held by other processes, and cannot destabilize the VM. This isolation guarantee is what makes automatic restart both safe and practical. When a supervisor restarts a child, the rest of the system continues operating without interruption.

The Prismatic Platform relies on process restart as its primary resilience mechanism across all 115 umbrella applications. Every stateful component -- from agent registries to storage adapters to web socket handlers -- is supervised with explicit restart strategies, ensuring that transient failures self-heal within milliseconds.

## Overview

Process restart operates within the broader OTP supervision framework. A supervisor is a specialized process whose sole responsibility is monitoring its children and reacting to their failures. When a child process terminates, the supervisor receives an exit signal (because it is linked to the child with the `:trap_exit` flag enabled) and consults the child's specification to determine whether and how to restart it.

The restart decision is governed by three parameters: the restart type (`:permanent`, `:transient`, or `:temporary`), the restart strategy (`:one_for_one`, `:one_for_all`, `:rest_for_one`), and the restart intensity (maximum restarts within a time window). Together, these parameters give the supervisor precise control over recovery behavior.

The power of process restart lies in its composability. Supervisors can supervise other supervisors, creating a tree structure where failures are handled at the appropriate level. A low-level storage connection might be restarted by its immediate supervisor. If repeated restarts indicate a systemic problem (exceeding the restart intensity), the supervisor itself terminates, escalating the failure to its parent supervisor, which may restart the entire subtree or propagate further up the tree. This hierarchical escalation ensures that transient glitches are handled locally while persistent failures trigger progressively broader recovery actions.

Unlike exception handling in most programming languages, process restart does not attempt to continue from the point of failure. The process starts fresh, re-executing its `init/1` callback, re-establishing connections, and rebuilding state from durable sources. This clean-slate approach eliminates an entire class of bugs related to partially recovered state, dangling references, and corrupted invariants.

## Technical Details

### Child Specifications

Every supervised process is defined by a child specification that tells the supervisor how to start, identify, and restart the process:

```elixir
defmodule PrismaticAgents.AgentPool do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    pool_size = Keyword.get(opts, :pool_size, 10)

    children =
      for i <- 1..pool_size do
        %{
          id: {PrismaticAgents.Worker, i},
          start: {PrismaticAgents.Worker, :start_link, [%{id: i}]},
          restart: :permanent,
          shutdown: 5_000,
          type: :worker
        }
      end

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### Restart Types

The `:restart` field in the child specification controls when the supervisor restarts a terminated child:

```elixir
defmodule RestartTypeExamples do
  @moduledoc """
  Demonstrates the three restart types and their semantics.
  """

  # :permanent - Always restart, regardless of exit reason.
  # Use for long-running services that must always be available.
  @permanent_child %{
    id: :critical_service,
    start: {CriticalService, :start_link, [[]]},
    restart: :permanent
  }

  # :transient - Restart only on abnormal exit (not :normal or :shutdown).
  # Use for task-like processes that should complete but may fail.
  @transient_child %{
    id: :data_migration,
    start: {DataMigration, :start_link, [[]]},
    restart: :transient
  }

  # :temporary - Never restart.
  # Use for one-shot operations where failure is acceptable.
  @temporary_child %{
    id: :one_shot_report,
    start: {ReportGenerator, :start_link, [[]]},
    restart: :temporary
  }
end
```

### Restart Strategies

The supervisor's strategy determines how sibling processes are affected when one child fails:

```elixir
defmodule PrismaticStorage.Supervisor do
  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticStorage.Repo, []},
      {PrismaticStorage.Cache, []},
      {PrismaticStorage.SearchIndex, []}
    ]

    # :one_for_one - Only restart the failed child.
    # Best when children are independent.
    Supervisor.init(children, strategy: :one_for_one)
  end
end

defmodule PrismaticStorage.Pipeline do
  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticStorage.Producer, []},
      {PrismaticStorage.Consumer, []},
      {PrismaticStorage.Acknowledger, []}
    ]

    # :rest_for_one - Restart the failed child and all children
    # started after it. Use when later children depend on earlier ones.
    Supervisor.init(children, strategy: :rest_for_one)
  end
end

defmodule PrismaticStorage.ReplicaSet do
  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticStorage.Primary, []},
      {PrismaticStorage.Replica1, []},
      {PrismaticStorage.Replica2, []}
    ]

    # :one_for_all - Restart ALL children when any one fails.
    # Use when children share critical state that becomes
    # inconsistent if one process restarts alone.
    Supervisor.init(children, strategy: :one_for_all)
  end
end
```

### Restart Intensity and Backoff

The restart intensity limits how many restarts a supervisor tolerates within a time window. If the limit is exceeded, the supervisor itself terminates, escalating to its parent:

```elixir
defmodule PrismaticWeb.SocketSupervisor do
  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticWeb.SocketHandler, []}
    ]

    # Allow at most 3 restarts in 5 seconds.
    # If exceeded, supervisor crashes and escalates.
    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 3,
      max_seconds: 5
    )
  end
end
```

For processes that connect to external services, exponential backoff prevents restart storms:

```elixir
defmodule PrismaticStorage.ReconnectWorker do
  use GenServer

  @initial_backoff_ms 100
  @max_backoff_ms 30_000
  @backoff_multiplier 2

  defstruct [:connection, :backoff_ms, :attempt]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      connection: nil,
      backoff_ms: @initial_backoff_ms,
      attempt: 0
    }

    {:ok, state, {:continue, :connect}}
  end

  @impl true
  def handle_continue(:connect, state) do
    case establish_connection(state) do
      {:ok, conn} ->
        {:noreply, %{state | connection: conn, backoff_ms: @initial_backoff_ms, attempt: 0}}

      {:error, _reason} ->
        Process.send_after(self(), :retry_connect, state.backoff_ms)

        next_backoff = min(state.backoff_ms * @backoff_multiplier, @max_backoff_ms)
        {:noreply, %{state | backoff_ms: next_backoff, attempt: state.attempt + 1}}
    end
  end

  @impl true
  def handle_info(:retry_connect, state) do
    {:noreply, state, {:continue, :connect}}
  end

  defp establish_connection(_state) do
    # Backend-specific connection logic
    {:error, :not_implemented}
  end
end
```

### Graceful Shutdown

The `:shutdown` specification controls how long a supervisor waits for a child to terminate gracefully before killing it:

```elixir
defmodule PrismaticAgents.GracefulWorker do
  use GenServer

  @impl true
  def init(state) do
    Process.flag(:trap_exit, true)
    {:ok, state}
  end

  @impl true
  def terminate(reason, state) do
    # Flush pending writes, close connections, release resources.
    # This runs when the supervisor sends a shutdown signal.
    flush_pending_operations(state)
    release_resources(state)
    :ok
  end

  defp flush_pending_operations(_state), do: :ok
  defp release_resources(_state), do: :ok
end
```

## Implementation

### Designing Restart Strategies for a Platform

Implementing process restart effectively requires mapping each component's characteristics to the appropriate restart configuration:

**Step 1: Classify processes by criticality.**

| Process Type | Restart | Shutdown | Rationale |
|-------------|---------|----------|-----------|
| Database connection pool | `:permanent` | 10_000 | Must always be available; needs time to drain |
| Web socket handler | `:permanent` | 5_000 | Clients reconnect automatically |
| Background job worker | `:transient` | 5_000 | Should complete but failure is non-critical |
| One-shot report generator | `:temporary` | 5_000 | Failure is logged, not retried |
| Agent state process | `:permanent` | :infinity | Must save state before termination |

**Step 2: Choose strategy based on dependency relationships.**

If children are independent, use `:one_for_one`. If children form a pipeline where later stages depend on earlier ones, use `:rest_for_one`. If children share coupled state, use `:one_for_all`.

**Step 3: Set restart intensity based on failure modes.**

For processes connecting to local resources (ETS, files), high intensity is appropriate (10 restarts in 5 seconds) because failures are likely transient. For processes connecting to external services (APIs, remote databases), lower intensity with backoff is safer (3 restarts in 30 seconds) to avoid hammering a struggling service.

**Step 4: Instrument with telemetry.**

Every restart should emit a telemetry event for monitoring:

```elixir
defmodule PrismaticSupervisor.Instrumentation do
  @moduledoc """
  Attaches to supervisor events to emit telemetry on process restarts.
  """

  def attach do
    :telemetry.attach(
      "supervisor-restart-handler",
      [:prismatic, :supervisor, :restart],
      &handle_event/4,
      %{}
    )
  end

  def handle_event(
        [:prismatic, :supervisor, :restart],
        %{count: count},
        %{supervisor: supervisor, child_id: child_id, reason: reason},
        _config
      ) do
    Logger.warning(
      "Process restart: #{inspect(child_id)} under #{inspect(supervisor)}, " <>
        "reason: #{inspect(reason)}, total_restarts: #{count}"
    )
  end
end
```

## Comparison

### Process Restart vs. Exception Handling

| Aspect | Process Restart (OTP) | Exception Handling (try/catch) |
|--------|----------------------|-------------------------------|
| State after recovery | Clean (fresh init) | Potentially corrupted |
| Scope of recovery | Entire process | Single call stack |
| Cascading failures | Isolated by process boundaries | Can propagate through callers |
| Resource cleanup | Guaranteed via terminate/2 | Requires explicit finally/after |
| Configuration | Declarative (child specs) | Imperative (code flow) |
| Monitoring | Built-in (supervisor) | Manual instrumentation |
| Escalation | Automatic (supervisor tree) | Manual re-raise |

### Process Restart vs. Kubernetes Pod Restart

Kubernetes restarts pods based on health checks, similar in concept to OTP supervision. However, pod restarts operate at a much coarser granularity (entire containers vs. individual processes), take seconds to minutes (vs. microseconds for BEAM processes), and lose all in-memory state. OTP process restarts are fine-grained, nearly instantaneous, and can be precisely targeted to the failed component while leaving the rest of the system untouched.

### Process Restart vs. Circuit Breaker

Process restart and circuit breakers serve complementary roles. Process restart recovers from internal failures (crashes, state corruption). Circuit breakers protect against external failures (unresponsive dependencies). A well-designed system uses both: the circuit breaker prevents a process from repeatedly crashing due to an unavailable external service, while the supervisor restarts the process if it crashes for other reasons.

## Best Practices

1. **Let processes crash rather than accumulating defensive code.** A process with 50 lines of business logic and 200 lines of error handling is harder to understand, test, and maintain than a process with 50 lines of business logic that crashes on unexpected input and gets restarted cleanly.

2. **Store recoverable state externally.** If a process needs state that must survive restarts, persist it in ETS, Mnesia, or a database. The restarted process reads its state from the durable source in `init/1`. Do not rely on process state surviving crashes.

3. **Use :transient for finite-lifetime processes.** Background jobs, data migrations, and report generators should use `:transient` restart so they are restarted on failure but not restarted after successful completion.

4. **Set shutdown timeouts proportional to cleanup needs.** A process that manages database connections needs longer shutdown time to drain the pool than a stateless computation worker. Setting `:shutdown` to `:brutal_kill` should be reserved for processes that hold no external resources.

5. **Monitor restart frequency in production.** Frequent restarts indicate an underlying problem that restart cannot fix. Use telemetry to track restart counts per supervisor and alert when rates exceed baseline.

6. **Design init/1 to be idempotent.** Since `init/1` runs on every restart, it must be safe to execute multiple times. Avoid side effects in `init/1` that are not idempotent (e.g., inserting a record without a uniqueness constraint).

7. **Test failure scenarios explicitly.** Write tests that kill supervised processes and verify that the system recovers correctly. Property-based testing with random failure injection provides strong confidence in restart behavior.

8. **Use DynamicSupervisor for variable-count children.** When the number of supervised processes changes at runtime (connection handlers, user sessions), DynamicSupervisor provides the flexibility to start and stop children without reconfiguring the supervisor.

## Pitfalls

**Restart loops.** If a process crashes during `init/1` (for example, because a required database is down), the supervisor will restart it immediately, causing another crash, another restart, and so on until the restart intensity is exceeded. Implement backoff delays for processes that depend on external resources to break the restart-crash cycle.

**State loss without recovery.** A process that accumulates in-memory state over time (counters, caches, aggregations) loses all that state on restart. If this state is not backed by a durable source, the restarted process starts empty. Design processes to either persist critical state periodically or reconstruct it from event logs on restart.

**Cascading restarts from shared dependencies.** If multiple processes depend on a shared resource (a database connection, a configuration service), and that resource fails, all dependent processes may crash and restart simultaneously, creating a thundering herd that overwhelms the resource when it recovers. Use circuit breakers and staggered reconnection to mitigate this pattern.

**Misusing :one_for_all.** The `:one_for_all` strategy restarts every child when any child fails. This is correct only when children share tightly coupled state. Using `:one_for_all` for independent processes causes unnecessary restarts, wasting resources and disrupting unrelated services.

**Ignoring terminate/2.** When a process traps exits, its `terminate/2` callback runs before the process dies. Failing to implement proper cleanup in `terminate/2` can leak file handles, database connections, or other external resources across restarts.

## Use Cases

### Database Connection Recovery

When a PostgreSQL connection drops due to network instability, the Ecto Repo process crashes. The supervisor detects the crash and starts a new Repo process, which re-establishes the connection pool in its `init/1`. The application experiences a brief pause in database operations (typically under 100ms) and then resumes normally. No application-level error handling code is required.

### Agent State Recovery in AIAD

The Prismatic Platform's 530+ AIAD agents each run as supervised GenServer processes. When an agent encounters corrupt input that causes a crash, its supervisor restarts it with clean state. The agent re-reads its specification from the filesystem and resumes accepting commands. The agent registry in ETS is updated to reflect the new PID, and pending messages in the agent's mailbox are lost (by design -- the caller receives an error and can retry).

### Web Socket Reconnection

Phoenix Channels manage WebSocket connections through supervised processes. When a client's connection process crashes (due to a malformed message, for example), the supervisor restarts the channel process. The client-side JavaScript detects the disconnection and automatically reconnects, re-joining the channel topic. From the user's perspective, the interruption is imperceptible.

### Self-Healing Storage Adapters

In the Prismatic Platform's polyglot storage layer, each storage adapter is supervised independently. If the Redis adapter crashes due to a connection timeout, it is restarted without affecting the PostgreSQL or ETS adapters. The restarted Redis adapter re-establishes its connection pool, and operations that were in flight receive error tuples that the calling code handles with retries.

## Related Concepts

Process restart is deeply embedded in the OTP ecosystem and connects to many related patterns:

- [Supervisor](@/glossary/supervisor.md) -- the OTP behaviour that implements process restart logic, monitoring children and executing restart strategies
- [Supervision Tree](@/glossary/supervision-tree.md) -- the hierarchical structure of supervisors that enables cascading failure recovery through the process restart mechanism
- [Let It Crash](@/glossary/let-it-crash.md) -- the philosophical foundation of process restart, advocating for clean failure over defensive error handling
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- the system property that process restart enables, allowing the platform to continue operating despite component failures
- [GenServer](@/glossary/genserver.md) -- the most common OTP behaviour for implementing supervised processes that benefit from automatic restart
- [Process Isolation](@/glossary/process-isolation.md) -- the BEAM guarantee that makes process restart safe by ensuring crashes cannot corrupt other processes
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- complementary pattern that prevents restart storms by breaking the connection to failing external dependencies
- [Self-Healing](@/glossary/self-healing.md) -- the emergent system property that arises from combining process restart with supervision trees
- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine whose lightweight process model makes sub-millisecond process restart practical
- [OTP](@/glossary/otp.md) -- the framework that provides the supervision and restart infrastructure used throughout the Prismatic Platform

## See Also

- [Backpressure](@/glossary/backpressure.md) -- flow control mechanism that complements restart by preventing processes from being overwhelmed
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- practice of deliberately inducing failures to verify that process restart behaves correctly under stress
- [Bulkhead Pattern](@/glossary/bulkhead-pattern.md) -- isolation pattern that limits the blast radius of failures, working alongside process restart
- [Telemetry](@/glossary/telemetry.md) -- observability framework for monitoring restart frequency and patterns
- [Monitoring](@/glossary/monitoring.md) -- the broader system property that process restart contributes to

---

*Built with precision by the Prismatic Platform team. This glossary entry is part of a living knowledge base that evolves with the platform.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis)
