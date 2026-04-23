+++
title = "Prismatic Kernel"
weight = 4
[extra]
icon = "bolt"
color = "red"
description = "Platform kernel managing process supervision, lifecycle, and system coordination"
category = "Foundation"
files = "200"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 961
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Kernel", "Platform", "apps", "Foundation", "Prismatic Platform", "PrismaticKernel", "PubSub", "Alert"]
tags = ["apps", "foundation", "prismatic-kernel", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Kernel - Prismatic Platform"
+++

## Overview

Prismatic Kernel is the platform's foundational process management layer. It orchestrates application startup across the entire umbrella, manages [supervision trees](@/glossary/supervision-tree.md), coordinates inter-application communication, and provides system-level services including health aggregation, resource monitoring, and graceful shutdown coordination. The Kernel ensures all 90+ applications start in the correct dependency order and maintain operational health throughout their lifecycle.

As the lowest layer of the platform stack, the Kernel embodies [OTP](@/glossary/otp.md) design principles at every level. Each stateful concern runs in its own supervised process, inter-application messaging flows through [PubSub](@/glossary/pubsub.md) channels rather than direct function calls, and failure isolation is guaranteed through supervision boundaries. The Kernel does not contain business logic -- it provides the infrastructure on which all business logic runs.

The application [registry](@/glossary/registry-otp.md) tracks the health status of every running application, enabling platform-wide health queries that aggregate individual application states into a unified status. When an application enters a degraded state, the Kernel can trigger remediation actions including restart sequences, resource reallocation, or alert escalation to operators. The Kernel's position as the first application to start and the last to stop gives it unique authority over the platform's operational lifecycle, making it the single point of coordination for deployment, scaling, and recovery operations.

## Architecture

```
Prismatic Kernel
+-- SupervisorTree     # Top-level application supervision
|   +-- AppSupervisor  # Per-application supervisor management
|   +-- ServiceSupervisor  # Shared service supervision
+-- AppRegistry        # Application discovery, registration, health
+-- MessageRouter      # Inter-app PubSub and request-reply
+-- ResourceManager    # Memory, CPU, process count monitoring
+-- LifecycleManager   # Startup sequencing, shutdown drain, hot-reload
```

The Kernel starts first during platform boot and orchestrates the startup of all dependent applications through a topologically-sorted dependency graph. Each application's health is verified after startup before dependent applications are allowed to proceed, preventing cascading failures from partially-initialized dependencies.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticKernel` | Public facade: `health/0`, `cast/2`, `call/3`, `register/2`, `shutdown/2` |
| `PrismaticKernel.Application` | OTP application entry point, first process to start |
| `PrismaticKernel.SupervisorTree` | Top-level supervisor managing all application supervisors |
| `PrismaticKernel.AppRegistry` | ETS-backed application registry with health tracking |
| `PrismaticKernel.MessageRouter` | PubSub-based inter-application message routing |
| `PrismaticKernel.ResourceManager` | System resource monitoring (memory, CPU, processes) |
| `PrismaticKernel.LifecycleManager` | Startup sequencing and graceful shutdown coordination |
| `PrismaticKernel.DependencyGraph` | Topological sort of application dependencies |
| `PrismaticKernel.HealthAggregator` | Platform-wide health status computation |

## Key Features

### Supervision Management
- Application dependency graph resolution with cycle detection and topological sorting
- Ordered startup with post-boot health verification gates ensuring healthy dependencies
- Graceful shutdown with configurable drain timeouts per application for zero-downtime deployments
- Automatic restart with exponential backoff and failure budgets preventing restart storms

### Startup Sequencing

The startup sequence follows a strict topological order derived from the application dependency graph. Each application must pass its health check before dependents are started:

```elixir
defmodule PrismaticKernel.LifecycleManager do
  @spec boot_sequence() :: {:ok, list(atom())} | {:error, term()}
  def boot_sequence do
    with {:ok, graph} <- PrismaticKernel.DependencyGraph.build(),
         {:ok, order} <- topological_sort(graph),
         :ok <- start_in_order(order) do
      {:ok, order}
    end
  end

  defp start_in_order(apps) do
    Enum.reduce_while(apps, :ok, fn app, :ok ->
      case start_and_verify(app) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, {app, reason}}}
      end
    end)
  end

  defp start_and_verify(app) do
    with :ok <- Application.ensure_started(app),
         :ok <- wait_for_health(app, timeout: 30_000) do
      :ok
    end
  end
end
```

### Dependency Graph Construction

The dependency graph is constructed from each application's `mix.exs` dependencies and optional runtime dependency declarations. Cycle detection prevents circular dependency deadlocks:

```elixir
defmodule PrismaticKernel.DependencyGraph do
  @spec build() :: {:ok, Graph.t()} | {:error, :cycle_detected}
  def build do
    apps = Application.loaded_applications()
    graph = Enum.reduce(apps, Graph.new(), fn {app, _, _}, g ->
      deps = Application.spec(app, :applications) || []
      Enum.reduce(deps, Graph.add_vertex(g, app), fn dep, g2 ->
        Graph.add_edge(g2, dep, app)
      end)
    end)

    case Graph.topsort(graph) do
      false -> {:error, :cycle_detected}
      order when is_list(order) -> {:ok, %{graph: graph, order: order}}
    end
  end
end
```

### Inter-App Communication
- PubSub message routing between applications with topic filtering and pattern matching
- Request-reply patterns with configurable timeouts and fallbacks for synchronous operations
- Event broadcasting for system-wide notifications and alerts
- [Circuit breaker](@/glossary/circuit-breaker.md) protection for inter-app calls to failing services

### System Services
- Platform-wide health aggregation across all running applications with degradation detection
- Resource utilization monitoring (memory, CPU, process count, message queues) with alerting
- Process registry and service discovery for dynamic service location
- Configuration hot-reloading without application restart

### Resource Monitoring

The ResourceManager tracks system-level metrics and triggers alerts when thresholds are exceeded:

| Resource | Warning Threshold | Critical Threshold | Action |
|----------|------------------|-------------------|--------|
| Memory (per app) | 500 MB | 1 GB | Alert, investigate |
| Process count | 50,000 | 100,000 | Alert, scale down |
| Message queue depth | 10,000 | 50,000 | Alert, backpressure |
| CPU utilization | 80% sustained | 95% sustained | Alert, shed load |
| ETS table size | 100 MB | 500 MB | Alert, compaction |

### Graceful Shutdown

The shutdown coordinator ensures zero-downtime deployments by draining active connections before stopping application processes. Each application registers a drain handler that receives advance notice of pending shutdown:

| Phase | Duration | Action |
|-------|----------|--------|
| Signal received | 0s | Begin shutdown sequence |
| Drain period | 0-30s | Stop accepting new requests, complete in-flight |
| Grace period | 30-60s | Force-terminate remaining processes |
| Cleanup | 60-65s | Release resources, close connections |
| Exit | 65s | Process terminates |

## Usage

```elixir
# Check platform-wide health status
{:ok, health} = PrismaticKernel.health()
# => %{status: :healthy, apps: 90, processes: 12_450, uptime: "14d 3h"}

# Send inter-app message via PubSub
PrismaticKernel.cast(:prismatic_perimeter, {:scan_complete, results})

# Request-reply with timeout
{:ok, response} = PrismaticKernel.call(:prismatic_api, {:get_endpoints}, timeout: 5_000)

# Register a named service for discovery
PrismaticKernel.register(:security_rating_engine, self())

# Query application status
{:ok, status} = PrismaticKernel.app_status(:prismatic_api)
# => %{status: :running, uptime: "14d 3h", memory: "124 MB", processes: 47}

# Trigger graceful shutdown with drain
:ok = PrismaticKernel.shutdown(:prismatic_crawler, drain_timeout: 30_000)

# Get dependency graph for visualization
{:ok, graph} = PrismaticKernel.dependency_graph()
# => %{nodes: 90, edges: 234, layers: 7}
```

## NABLA Compliance

| NABLA Axiom | Kernel Enforcement | Implementation |
|-------------|-------------------|----------------|
| Provenance Mandatory | Every health status change carries timestamp and source | Health events include full context metadata |
| Signal Plurality | Health aggregation requires multiple process signals | Per-app health combines process, memory, and message queue signals |
| Source Independence | Each application's health checked independently | AppRegistry maintains independent health state per app |
| Time Decay | Health status timestamps enable freshness evaluation | Stale health data triggers re-check |
| Absence Informative | Missing health reports indicate application failure | AppRegistry detects absence and triggers investigation |

## Testing

Supervision tests verify dependency graph resolution, topological sort correctness, and startup ordering. Health aggregation tests verify correct status computation from individual application states including degraded and failing scenarios. Message routing tests verify PubSub delivery, request-reply patterns, and circuit breaker behavior.

Integration tests exercise the full startup sequence with mock applications to verify ordering and health gate enforcement. Property-based tests generate random dependency graphs to verify cycle detection and topological sort correctness invariants. Shutdown tests verify drain behavior using simulated in-flight requests to confirm zero-request-loss guarantees.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| Every platform application | All 90+ apps depend on Kernel for supervision and lifecycle |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | System [metrics](@/glossary/metrics.md) emitted through telemetry events |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Safety constraints on restart and shutdown operations |
| [Prismatic Core](@/apps/prismatic-core.md) | Higher-level platform coordination built on Kernel primitives |
| [Prismatic Resilience](@/apps/prismatic-resilience.md) | Resilience patterns coordinated with Kernel |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Health query | < 5ms | ETS-backed aggregation |
| PubSub message routing | < 1ms | In-memory message passing |
| Request-reply (local) | < 10ms | GenServer call with timeout |
| App status query | < 1ms | ETS registry lookup |
| Full platform health | < 50ms | Aggregation across 90+ apps |
| Startup sequence (full) | 30-60s | 90+ apps with health verification |
| Graceful shutdown | 30-65s | Drain + grace + cleanup |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :kernel, :app_started]`, `[:prismatic, :kernel, :health_changed]`, `[:prismatic, :kernel, :resource_alert]`.

## Related Resources

- [Prismatic Storage Core](@/apps/prismatic-storage-core.md) -- Storage infrastructure managed through Kernel supervision
- [Prismatic Agents](@/apps/prismatic-agents.md) -- Agent processes supervised by Kernel infrastructure
- [Elixir Architect](@/agents/elixir-architect.md) -- Ensures Kernel supervision trees follow OTP best practices
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews platform-wide process topology
- [Deployment Commander](@/agents/deployment-commander-agent.md) -- Coordinates deployment with Kernel startup ordering
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Kernel-driven automatic restart and recovery
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- System-level metrics emitted through health aggregation
- [Quality Gates](@/capabilities/quality-gates.md) -- Startup health verification gates enforced by Kernel

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)