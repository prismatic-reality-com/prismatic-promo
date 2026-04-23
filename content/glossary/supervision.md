+++
title = "Supervision"
weight = 38
[extra]
description = "The OTP design pattern of monitoring processes through hierarchical supervisors that automatically detect failures and apply configurable restart strategies to maintain system availability."
category = "elixir"
related_terms = ["supervision-tree", "supervisor", "genserver", "otp", "beam", "process-isolation", "self-healing", "fault-tolerance", "dynamic-supervisor", "circuit-breaker"]
keywords = ["OTP supervision pattern", "Elixir process supervision", "fault-tolerant supervision", "let it crash philosophy", "automatic process restart", "supervisor restart strategy", "BEAM process monitoring", "Erlang supervision design", "process failure recovery", "hierarchical process management"]
tags = ["supervision", "otp", "fault-tolerance", "elixir"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1373
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Supervision - Prismatic Platform"
+++

## Definition and Overview

Supervision is the OTP design pattern of monitoring processes through hierarchical supervisors that automatically detect failures and apply configurable restart strategies to maintain system availability without human intervention. It is the practical implementation of the "let it crash" philosophy -- the principle that software systems should be designed to detect and recover from failures rather than trying to prevent every possible failure through defensive programming.

The fundamental insight behind supervision is that unanticipated failures are inevitable in production systems. No amount of defensive coding can prevent every possible error condition -- hardware failures, network partitions, memory corruption, and logic errors in rarely-exercised code paths will eventually cause process crashes. Rather than adding layers of error handling that increase complexity and often mask the underlying problem, supervision separates the concerns of "doing work" (worker processes) from "handling failure" (supervisor processes). Workers are kept simple -- they perform their function and crash if something goes wrong. Supervisors are kept focused -- they monitor workers, detect crashes, and restart failed processes according to configured strategies.

Within the Prismatic Platform, supervision is a mandatory architectural requirement enforced through the platform's Elixir Best Practices policy. The mandate states: "Process for every stateful entity" and "Supervision tree documented before code." Every one of the platform's 115 umbrella applications defines its own [Supervision Tree](/glossary/supervision-tree/), and the meta-rule "If the same solution could be written identically in Node.js, it's WRONG" ensures that developers leverage OTP supervision rather than falling back to try-catch error handling patterns that would be at home in any runtime.

The concept of supervision extends beyond individual process monitoring. The Prismatic Platform applies supervisory principles at multiple levels: process-level supervision through OTP supervisors, application-level supervision through the [PrismaticSupervisor](/glossary/supervisor/) with dependency-aware startup, quality-level supervision through the [Quality Floor Guardian](/glossary/quality-floor-guardian/), and strategic-level supervision through agent hierarchy monitoring. At each level, the pattern is the same: observe, detect failure, apply recovery strategy.

## Technical Deep Dive

### The Supervision Model

OTP supervision follows a hierarchical model where every process is either a supervisor or a worker, and every worker has exactly one supervisor:

```
Supervisor A (root)
    |
    +-- Worker 1 (stateless computation)
    |
    +-- Supervisor B (sub-supervisor)
    |       +-- Worker 2 (stateful GenServer)
    |       +-- Worker 3 (stateful GenServer)
    |
    +-- Supervisor C (sub-supervisor)
            +-- DynamicSupervisor D
            |       +-- Worker 4 (on-demand)
            |       +-- Worker 5 (on-demand)
            +-- Worker 6 (event handler)
```

The hierarchy creates natural failure isolation boundaries. When Worker 2 crashes, Supervisor B handles it without affecting Worker 1 or Supervisor C. When Supervisor B itself crashes (perhaps due to exceeding restart intensity limits), Supervisor A handles the recovery, potentially restarting Supervisor B and all its children.

### Restart Strategies

OTP provides three restart strategies that define how a supervisor responds when one of its children crashes:

```elixir
defmodule PrismaticStorage.Supervisor do
  @moduledoc """
  Supervisor for storage subsystem processes.
  Uses :rest_for_one because workers have ordered dependencies.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # ETS table manager - no dependencies
      {PrismaticStorage.EtsManager, []},

      # Connection pool - depends on ETS for config
      {PrismaticStorage.ConnectionPool, []},

      # Query executor - depends on connection pool
      {PrismaticStorage.QueryExecutor, []},

      # Cache warmer - depends on query executor
      {PrismaticStorage.CacheWarmer, []}
    ]

    # rest_for_one: if ConnectionPool crashes, restart it AND
    # QueryExecutor AND CacheWarmer (everything started after it)
    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

| Strategy | Behavior | When to Use |
|----------|----------|-------------|
| `:one_for_one` | Restart only the crashed child | Children are independent with no shared state |
| `:one_for_all` | Restart all children when any one crashes | Children are tightly coupled and share state |
| `:rest_for_one` | Restart the crashed child and all children started after it | Children have ordered dependencies |

### Restart Intensity

Supervisors protect against infinite restart loops through restart intensity configuration:

```elixir
defmodule PrismaticPerimeter.Scanner.Supervisor do
  @moduledoc """
  Supervisor for scanner workers with conservative restart limits.
  Allows max 3 restarts in 60 seconds before escalating to parent.
  """

  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticPerimeter.Scanner.DnsEnumerator, []},
      {PrismaticPerimeter.Scanner.PortScanner, []},
      {PrismaticPerimeter.Scanner.CertificateChecker, []},
      {PrismaticPerimeter.Scanner.WebCrawler, []}
    ]

    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 3,
      max_seconds: 60
    )
  end
end
```

If the restart intensity is exceeded (more than `max_restarts` restarts within `max_seconds`), the supervisor itself terminates. This escalation to the parent supervisor is critical -- it prevents a fundamentally broken process from consuming resources through endless restart cycles and instead propagates the failure to a higher level where a different recovery strategy may be appropriate.

### Child Specifications

Every supervised process defines a child specification that tells the supervisor how to start, restart, and stop it:

```elixir
defmodule PrismaticAgents.Worker do
  @moduledoc """
  Agent worker with custom child specification.
  Uses transient restart - only restart on abnormal exit.
  """

  use GenServer, restart: :transient

  @type state :: %{
    agent_id: String.t(),
    domain: atom(),
    status: :initializing | :ready | :executing | :terminated
  }

  def child_spec(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)

    %{
      id: {__MODULE__, agent_id},
      start: {__MODULE__, :start_link, [opts]},
      restart: :transient,
      shutdown: 10_000,
      type: :worker
    }
  end

  def start_link(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    GenServer.start_link(__MODULE__, opts, name: via_registry(agent_id))
  end

  @impl true
  def init(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    domain = Keyword.fetch!(opts, :domain)

    state = %{
      agent_id: agent_id,
      domain: domain,
      status: :initializing
    }

    {:ok, state, {:continue, :initialize}}
  end

  @impl true
  def handle_continue(:initialize, state) do
    # Perform initialization - if this crashes, supervisor restarts us
    {:noreply, %{state | status: :ready}}
  end

  defp via_registry(agent_id) do
    {:via, Registry, {PrismaticAgents.Registry, agent_id}}
  end
end
```

The three restart types define different failure recovery behaviors:

| Restart Type | Behavior | Use Case |
|-------------|----------|----------|
| `:permanent` | Always restart, regardless of exit reason | Long-running services that should never stop |
| `:transient` | Restart only if exit reason is not `:normal` or `:shutdown` | Task-like processes that complete normally |
| `:temporary` | Never restart | One-off processes where failure means "give up" |

### Dynamic Supervision

For processes that are created and destroyed at runtime, [Dynamic Supervisor](/glossary/dynamic-supervisor/) provides on-demand child management:

```elixir
defmodule PrismaticPerimeter.ScanSupervisor do
  @moduledoc """
  Dynamic supervisor for on-demand scan worker processes.
  Workers are started per-scan and terminated on completion.
  """

  use DynamicSupervisor

  def start_link(opts) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    DynamicSupervisor.init(
      strategy: :one_for_one,
      max_restarts: 10,
      max_seconds: 60
    )
  end

  @spec start_scan(String.t(), keyword()) :: {:ok, pid()} | {:error, term()}
  def start_scan(domain, opts \\ []) do
    child_spec = {PrismaticPerimeter.ScanWorker, [domain: domain] ++ opts}
    DynamicSupervisor.start_child(__MODULE__, child_spec)
  end

  @spec stop_scan(pid()) :: :ok | {:error, :not_found}
  def stop_scan(pid) do
    DynamicSupervisor.terminate_child(__MODULE__, pid)
  end

  @spec active_scan_count() :: non_neg_integer()
  def active_scan_count do
    DynamicSupervisor.count_children(__MODULE__).active
  end

  @spec list_active_scans() :: [{:undefined, pid(), :worker, [module()]}]
  def list_active_scans do
    DynamicSupervisor.which_children(__MODULE__)
  end
end
```

## Architecture and Implementation

### Prismatic Platform Supervision Architecture

The platform implements a multi-layered supervision architecture where each umbrella application maintains its own supervision tree, and a root supervisor coordinates cross-application dependencies:

```elixir
defmodule PrismaticSupervisor do
  @moduledoc """
  Root supervisor for the entire Prismatic Platform.
  Coordinates startup ordering across 115 umbrella applications
  using dependency-aware resolution.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children =
      PrismaticSupervisor.DependencyResolver.resolve()
      |> Enum.map(&build_child_spec/1)

    Supervisor.init(children, strategy: :rest_for_one)
  end

  defp build_child_spec(%{module: module, config: config}) do
    {module, config}
  end
end
```

The dependency resolver ensures that applications start in the correct order. Storage applications start before business logic applications, which start before web applications. If a storage application crashes and is restarted, `:rest_for_one` ensures that all applications that depend on it are also restarted.

### Supervision at Multiple Levels

The Prismatic Platform applies supervisory principles at four distinct levels:

| Level | What is Supervised | Supervisor | Recovery Strategy |
|-------|-------------------|------------|-------------------|
| **Process** | Individual GenServers, Tasks | OTP Supervisor | Automatic restart per child_spec |
| **Application** | Umbrella app supervision trees | PrismaticSupervisor | Dependency-aware restart |
| **Quality** | Quality metrics across domains | Quality Floor Guardian | Auto-evolution trigger at threshold |
| **Strategic** | Platform-wide health indicators | Agent hierarchy (L1-L4) | Escalation through authority levels |

### Telemetry for Supervision Events

The platform instruments supervision events through telemetry for observability:

```elixir
defmodule PrismaticTelemetry.SupervisionHandler do
  @moduledoc """
  Telemetry handler for supervision events.
  Tracks process restarts, supervisor failures, and
  restart intensity threshold approaches.
  """

  @spec attach() :: :ok
  def attach do
    events = [
      [:prismatic, :supervisor, :child_restart],
      [:prismatic, :supervisor, :intensity_warning],
      [:prismatic, :supervisor, :failure]
    ]

    :telemetry.attach_many(
      "prismatic-supervision-handler",
      events,
      &handle_event/4,
      %{}
    )
  end

  @spec handle_event([atom()], map(), map(), map()) :: :ok
  def handle_event(
    [:prismatic, :supervisor, :child_restart],
    measurements,
    metadata,
    _config
  ) do
    # Log restart event with context
    Logger.info(
      "Process restarted",
      supervisor: metadata.supervisor,
      child_id: metadata.child_id,
      restart_count: measurements.restart_count,
      reason: metadata.reason
    )
  end

  def handle_event(
    [:prismatic, :supervisor, :intensity_warning],
    measurements,
    metadata,
    _config
  ) do
    # Alert when approaching restart intensity limit
    Logger.warning(
      "Restart intensity approaching limit",
      supervisor: metadata.supervisor,
      current: measurements.restart_count,
      limit: measurements.max_restarts,
      window_seconds: measurements.max_seconds
    )
  end

  def handle_event(
    [:prismatic, :supervisor, :failure],
    _measurements,
    metadata,
    _config
  ) do
    Logger.error(
      "Supervisor failure - escalating to parent",
      supervisor: metadata.supervisor,
      reason: metadata.reason,
      children_affected: metadata.children_count
    )
  end
end
```

### Graceful Shutdown

Supervision includes not just starting and restarting processes but also shutting them down gracefully:

```elixir
defmodule PrismaticStorage.ConnectionPool do
  @moduledoc """
  Database connection pool with graceful shutdown.
  On shutdown, drains active connections before terminating.
  """

  use GenServer

  @impl true
  def init(opts) do
    Process.flag(:trap_exit, true)
    pool_size = Keyword.get(opts, :pool_size, 10)

    state = %{
      connections: initialize_pool(pool_size),
      active_checkouts: %{},
      draining: false
    }

    {:ok, state}
  end

  @impl true
  def terminate(:shutdown, state) do
    # Graceful shutdown - drain active connections
    drain_connections(state.active_checkouts)
    close_all_connections(state.connections)
    :ok
  end

  @impl true
  def terminate(_reason, state) do
    # Abnormal termination - close immediately
    close_all_connections(state.connections)
    :ok
  end

  defp drain_connections(active) do
    if map_size(active) > 0 do
      Process.sleep(100)
      drain_connections(active)
    end
  end
end
```

## Usage in Prismatic Platform

### Per-Application Supervision

Each of the 115 umbrella applications defines its own Application module with a supervision tree root. The application callback `start/2` is the entry point for each application's supervision hierarchy:

```elixir
defmodule PrismaticWeb.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PrismaticWeb.Telemetry,
      {Phoenix.PubSub, name: PrismaticWeb.PubSub},
      PrismaticWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: PrismaticWeb.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Agent Runtime Supervision

The platform's 530 AIAD agents are supervised through a dedicated agent supervision subsystem that handles agent lifecycle, pool management, and command dispatch:

```elixir
defmodule PrismaticAgents.RuntimeSupervisor do
  @moduledoc """
  Supervises the agent runtime environment.
  Manages agent pools, command dispatchers, and telemetry.
  """

  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      # Agent registry (ETS-backed)
      {PrismaticAgents.Registry, []},

      # Static agent pool supervisor
      {PrismaticAgents.PoolSupervisor, []},

      # Dynamic supervisor for on-demand agents
      {DynamicSupervisor,
        name: PrismaticAgents.DynamicAgents,
        strategy: :one_for_one,
        max_restarts: 20,
        max_seconds: 60},

      # Command dispatch coordinator
      {PrismaticAgents.CommandDispatcher, []},

      # Telemetry reporter
      {PrismaticAgents.TelemetryReporter, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

### Supervision Introspection

The platform provides tools for inspecting the live supervision tree:

```elixir
# List all children of a supervisor
Supervisor.which_children(PrismaticWeb.Supervisor)
# => [{PrismaticWeb.Endpoint, #PID<0.123.0>, :worker, [PrismaticWeb.Endpoint]}, ...]

# Count children including dynamic ones
Supervisor.count_children(PrismaticAgents.DynamicAgents)
# => %{active: 42, specs: 42, supervisors: 0, workers: 42}

# Visual inspection with Observer
:observer.start()
```

## Supervision vs. Error Handling

| Approach | Philosophy | Failure Mode | Recovery |
|----------|-----------|--------------|----------|
| **Try-Catch** | Prevent every error | Missed cases cause crashes | Manual, per-callsite |
| **Supervision** | Accept failures, recover automatically | Expected -- processes crash | Automatic, configurable |
| **Circuit Breaker** | Prevent cascade failures | Open circuit stops calls | Automatic with backoff |
| **Supervision + Circuit Breaker** | Layered resilience | Comprehensive coverage | Multi-strategy automatic |

Supervision does not replace error handling -- it complements it. Expected, recoverable errors should be handled with pattern matching and `{:ok, _}` / `{:error, _}` tuples. Unexpected, unrecoverable errors should crash the process and let the supervisor restart it.

## Best Practices

1. **Design the supervision tree before writing business logic.** The supervision tree defines failure boundaries, restart behavior, and dependency ordering. These architectural decisions constrain what the business logic can assume about its runtime environment.

2. **Keep workers simple and supervisors focused.** Workers should do one thing. Supervisors should monitor workers. Do not combine business logic with supervision logic in the same module.

3. **Choose restart strategies based on process relationships, not convenience.** Using `:one_for_one` everywhere is easy but wrong when processes have dependencies. Using `:one_for_all` everywhere is safe but wasteful when processes are independent.

4. **Set restart intensity based on failure frequency expectations.** A process that crashes once per day and a process that crashes once per second require very different restart intensity settings. Configure based on observed failure patterns, not defaults.

5. **Use `:transient` restart for task-like processes.** Processes that are expected to complete and exit normally should not be permanently restarted. Use `:transient` to restart only on abnormal termination.

6. **Trap exits only when cleanup is necessary.** `Process.flag(:trap_exit, true)` changes termination semantics and adds complexity. Use it only when the process needs to perform cleanup (drain connections, flush buffers) before shutting down.

## Common Pitfalls

- **One giant supervisor with `:one_for_all`**: Every child crash restarts everything. Use hierarchy to isolate failure domains and minimize blast radius.

- **Ignoring restart intensity**: Without proper intensity limits, a fundamentally broken process can consume all system resources through infinite restart loops. Always configure `max_restarts` and `max_seconds`.

- **Using supervision as a crutch for bad code**: If a process crashes frequently and supervision masks the issue through rapid restarts, the root cause remains unfixed. Supervision handles transient failures, not persistent bugs.

- **Circular supervisor dependencies**: If Supervisor A depends on a process under Supervisor B and vice versa, no startup order is correct. Break circular dependencies through message passing or architectural redesign.

- **Not documenting the supervision tree**: The supervision tree is the most important architectural document for an OTP application. Future developers need to understand failure boundaries and recovery behavior.

## Related Terms

- [Supervision Tree](/glossary/supervision-tree/) -- Hierarchical organization of supervisors and workers
- [Supervisor](/glossary/supervisor/) -- OTP behaviour for monitoring child processes
- [GenServer](/glossary/genserver/) -- Primary worker process behaviour managed by supervisors
- [OTP](/glossary/otp/) -- Framework providing supervision behaviours and patterns
- [BEAM](/glossary/beam/) -- Virtual machine enabling lightweight process supervision
- [Process Isolation](/glossary/process-isolation/) -- BEAM isolation that makes supervision effective
- [Self-Healing](/glossary/self-healing/) -- Platform-level recovery complementing OTP supervision
- [Fault Tolerance](/glossary/fault-tolerance/) -- System property enabled by supervision
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime child management variant
- [Circuit Breaker](/glossary/circuit-breaker/) -- Complementary failure protection pattern

## See Also

- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Quality-level supervision in the platform
- [Application](/glossary/application/) -- OTP application module defining supervision tree roots
- [Telemetry](/glossary/telemetry/) -- Observability instrumentation for supervision events
- [Architecture](/architecture/) -- Platform architecture overview
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
