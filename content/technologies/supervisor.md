+++
title = "Supervisor"
weight = 74
[extra]
category = "protocol"
description = "OTP behaviour for building fault-tolerant supervision trees that automatically restart failed processes"
url = "https://hexdocs.pm/elixir/Supervisor.html"
version = "OTP"
icon = "supervisor"
color = "blue"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 954
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Supervisor", "behaviour", "building", "fault-tolerant", "supervision", "trees", "automatically", "technologies", "protocol", "Prismatic Platform"]
tags = ["technologies", "protocol", "supervisor", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Supervisor - Prismatic Platform"
+++

## Overview

The Supervisor behaviour is the fault-tolerance mechanism that ensures the Prismatic Platform's 404+ agents and services keep running even when individual components fail. Supervisors monitor child processes and automatically restart them according to configurable strategies when crashes occur, implementing the [BEAM VM](/technologies/beam/)'s "let it crash" philosophy where processes are designed to fail fast and recover through supervision rather than defensive error handling.

The Prismatic Platform's supervision tree is hierarchical -- top-level supervisors manage application-level supervisors, which in turn manage domain-specific supervisors, which finally supervise individual [GenServer](/technologies/genserver/) processes. This tree structure isolates failures: a crash in one agent does not propagate to unrelated agents, and the supervision strategy determines whether siblings are restarted as well. The platform's `PrismaticSupervisor` application provides dependency-aware startup ordering and domain-based supervision grouping, ensuring that storage adapters start before the applications that depend on them.

DynamicSupervisor extends this pattern for the platform's agent system, where agents are started and stopped dynamically based on operational needs. Each agent runs under its own supervision with automatic restart on failure, and the `PrismaticAgents.AgentSupervisor` tracks all active agents through an [ETS](/technologies/ets/)-backed registry. This architecture means the platform can add, remove, and recover agents at runtime without affecting the rest of the system.

## Key Features

- **Restart Strategies**: `:one_for_one` (restart only the failed child), `:one_for_all` (restart all children when one fails), `:rest_for_one` (restart the failed child and those started after it)
- **Max Restarts**: Configurable restart intensity (`max_restarts` within `max_seconds`) to prevent infinite restart loops that would mask persistent failures
- **Child Specs**: Declarative child process configuration with start functions, shutdown timeouts, restart policies (`:permanent`, `:temporary`, `:transient`), and type declarations
- **DynamicSupervisor**: On-demand child process management for runtime-spawned agents and workers that cannot be known at compile time
- **Shutdown Ordering**: Graceful shutdown in reverse start order, ensuring dependent processes stop before their dependencies
- **Automatic Recovery**: Self-healing without manual intervention -- the platform recovers from transient failures (network timeouts, database disconnects) automatically
- **PartitionSupervisor**: Distributes children across multiple partitions to reduce contention in high-throughput scenarios
- **Telemetry Events**: Supervisor restart events emit telemetry for monitoring and alerting on process instability

## Platform Integration

Supervision trees provide automatic fault recovery across the platform. The agent supervisor manages the entire agent lifecycle through a combination of static and dynamic supervision.

```elixir
defmodule PrismaticAgents.Supervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {Registry, keys: :unique, name: PrismaticAgents.Registry},
      {DynamicSupervisor, name: PrismaticAgents.AgentSupervisor,
                          strategy: :one_for_one},
      PrismaticAgents.Coordinator,
      PrismaticAgents.HealthMonitor
    ]

    Supervisor.init(children, strategy: :one_for_one, max_restarts: 10, max_seconds: 60)
  end
end
```

Individual agents are started dynamically and supervised independently. If an agent crashes, only that agent restarts -- the coordinator and other agents continue unaffected:

```elixir
defmodule PrismaticAgents.AgentManager do
  @doc "Start a new agent under the dynamic supervisor"
  def start_agent(agent_spec) do
    child_spec = {PrismaticAgents.Agent, agent_spec}

    case DynamicSupervisor.start_child(PrismaticAgents.AgentSupervisor, child_spec) do
      {:ok, pid} ->
        Registry.register(PrismaticAgents.Registry, agent_spec.id, pid)
        {:ok, pid}

      {:error, {:already_started, pid}} ->
        {:ok, pid}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc "Gracefully stop an agent"
  def stop_agent(agent_id) do
    case Registry.lookup(PrismaticAgents.Registry, agent_id) do
      [{pid, _}] -> DynamicSupervisor.terminate_child(PrismaticAgents.AgentSupervisor, pid)
      [] -> {:error, :not_found}
    end
  end

  @doc "List all running agents with their PIDs and metadata"
  def list_agents do
    DynamicSupervisor.which_children(PrismaticAgents.AgentSupervisor)
    |> Enum.map(fn {_, pid, _, _} -> {pid, GenServer.call(pid, :get_state)} end)
  end
end
```

The `PrismaticSupervisor` application adds dependency resolution on top of standard supervision, ensuring correct startup ordering across the umbrella:

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc "Resolves startup dependencies between umbrella applications"

  @doc "Compute a valid startup order respecting all dependencies"
  def resolve_start_order(apps) do
    graph = build_dependency_graph(apps)
    case topological_sort(graph) do
      {:ok, ordered} -> {:ok, ordered}
      {:error, :cycle} -> {:error, :circular_dependency}
    end
  end

  @doc "Build a directed graph of application dependencies"
  defp build_dependency_graph(apps) do
    Enum.reduce(apps, %{}, fn app, graph ->
      deps = Application.spec(app, :applications) || []
      Map.put(graph, app, deps)
    end)
  end
end
```

## Architecture

The platform's supervision tree follows a hierarchical structure that maps to domain boundaries, with each layer providing isolation and recovery at its scope.

| Level | Supervisor | Strategy | Children |
|-------|-----------|----------|----------|
| **Root** | `PrismaticSupervisor` | `:one_for_one` | Domain supervisors |
| **Domain** | `PrismaticAgents.Supervisor` | `:one_for_one` | Registry, DynamicSupervisor, Coordinator |
| **Domain** | `PrismaticPerimeter.Supervisor` | `:rest_for_one` | Scanner, RatingEngine, ComplianceChecker |
| **Domain** | `PrismaticStorage.Supervisor` | `:one_for_one` | Ecto Repo, ETS tables, Meilisearch client |
| **Dynamic** | `PrismaticAgents.AgentSupervisor` | `:one_for_one` | Individual agent GenServers (404+) |
| **Worker** | Individual GenServers | N/A | Business logic processes |

The restart flow for a failed agent:

```
Agent crash -> DynamicSupervisor detects exit -> Restart agent process
                                                      |
                                              Agent.init/1 called
                                                      |
                                              State rebuilt from ETS/DB
                                                      |
                                              Agent operational again
                                              (typically < 100ms)
```

## Performance Characteristics

Supervision adds negligible overhead to the platform while providing automatic fault recovery.

| Metric | Value | Notes |
|--------|-------|-------|
| Supervisor process memory | ~2KB | Per supervisor process on the BEAM |
| Child monitoring overhead | ~0 | BEAM monitor is a lightweight flag |
| Restart latency | <100ms | From crash detection to new process running |
| Max restart detection | Configurable | `max_restarts` / `max_seconds` threshold |
| DynamicSupervisor capacity | 500+ children | Configurable `max_children` limit |
| Registry lookup | O(1) | ETS-backed unique name registry |
| Supervision tree depth | 4-5 levels | Root to worker process |
| Shutdown timeout | 5000ms default | Configurable per child spec |

## Configuration

```elixir
# Static supervision tree configuration
Supervisor.init(children,
  strategy: :one_for_one,   # Only restart the failed child
  max_restarts: 3,           # Max 3 restarts...
  max_seconds: 5             # ...within 5 seconds before supervisor crashes up
)

# DynamicSupervisor for runtime-managed processes
DynamicSupervisor.init(
  strategy: :one_for_one,
  max_restarts: 100,         # Higher tolerance for dynamic children
  max_seconds: 60,
  max_children: 500          # Limit total dynamic children
)

# Child spec with explicit configuration
%{
  id: MyWorker,
  start: {MyWorker, :start_link, [args]},
  restart: :permanent,       # Always restart (:permanent, :temporary, :transient)
  shutdown: 5_000,           # Milliseconds to wait for graceful shutdown
  type: :worker              # :worker or :supervisor
}
```

## Best Practices

- **Design the supervision tree before writing code** -- the tree structure determines failure isolation boundaries and must be planned deliberately
- **Use `:one_for_one` by default** -- most children are independent; `:one_for_all` should only be used when children share critical state that becomes inconsistent on partial restart
- **Set appropriate `max_restarts`** -- too low and transient failures crash the supervisor; too high and persistent failures cause restart storms that mask bugs
- **Use DynamicSupervisor for runtime-spawned processes** -- static Supervisor is for processes known at compile time; DynamicSupervisor handles processes created at runtime
- **Never link processes across supervision boundaries** -- a linked process crash propagates outside the supervisor's control, defeating isolation
- **Register supervised processes** -- use `Registry` or named processes so other parts of the system can find and communicate with supervised children
- **Use `:transient` restart for Task-like processes** -- processes that should only restart on abnormal exit (not when they complete successfully)
- **Monitor supervisor restarts with telemetry** -- frequent restarts indicate an underlying issue that supervision is masking rather than resolving

## Comparison with Alternatives

| Feature | OTP Supervisor | Kubernetes Pods | systemd | Docker restart policies |
|---------|---------------|-----------------|---------|----------------------|
| Granularity | Per-process | Per-container | Per-service | Per-container |
| Restart latency | <100ms | Seconds to minutes | Seconds | Seconds |
| Health checks | Process exit signals | Liveness/readiness probes | Watchdog timers | Health checks |
| Dependency ordering | Explicit child order | InitContainers | After/Before directives | depends_on |
| Dynamic scaling | DynamicSupervisor | HPA/VPA | N/A | N/A |
| Nested supervision | Native (tree structure) | N/A | Limited | N/A |
| State recovery | GenServer init | Pod restart | Service restart | Container restart |
| In-process fault isolation | Yes (process boundaries) | No (container boundary) | No (process boundary) | No (container boundary) |

OTP Supervisors provide process-level fault isolation within a single BEAM node, complementing container-level orchestration tools like Kubernetes. The Prismatic Platform uses both: OTP Supervisors for intra-node process management and [Docker](/technologies/docker/)/Fly.io for inter-node deployment orchestration.

The platform's PartitionSupervisor usage in high-throughput paths, such as the telemetry event processing pipeline, distributes work across multiple supervisor partitions to eliminate single-process bottlenecks while maintaining the fault isolation guarantees of standard supervision.

## Related Technologies

- [GenServer](/technologies/genserver/) - The primary supervised process implementation for stateful workers
- [Erlang/OTP](/technologies/erlang-otp/) - The supervision framework and OTP design principles that underpin the pattern
- [BEAM VM](/technologies/beam/) - Process lifecycle management and the "let it crash" philosophy
- [ETS](/technologies/ets/) - Registry storage for tracking supervised processes by name

## Related Apps

- All 90 Prismatic Platform applications use Supervisor trees
- [prismatic_web](/apps/prismatic-web/) - Web application supervision with endpoint and PubSub children
- [prismatic_agents](/apps/prismatic-agents/) - DynamicSupervisor-managed agent lifecycle for 404+ agents

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)