+++
title = "microservices-architecture-specialist"
weight = 255
[extra]
domain = "architecture"
level = "L3"
description = "Microservices design patterns, service boundaries, and inter-service communication"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2300
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["microservices-architecture-specialist", "Microservices", "agents", "agent", "Prismatic Platform", "BEAM"]
tags = ["agents", "agent", "microservices-architecture-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "microservices-architecture-specialist - Prismatic Platform"
+++

## Overview

The microservices-architecture-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's architecture domain, responsible for designing service boundaries, defining inter-service communication contracts, and ensuring that the platform's [umbrella application](/glossary/umbrella-application/) structure follows [microservices](/glossary/microservices/) best practices while leveraging the unique strengths of the [BEAM](/glossary/beam/) virtual machine. Unlike traditional microservices that rely on network boundaries for isolation, this agent architects "micro-applications" within the Elixir umbrella -- achieving the modularity benefits of microservices without the operational complexity of distributed deployments.

Built on the [AIAD](/glossary/aiad/) standard, this agent governs the decomposition of the platform's 90+ applications into cohesive, loosely coupled units with well-defined public APIs and explicit dependency graphs. The [NO MERCY](/glossary/no-mercy/) doctrine is enforced on service boundaries: no circular dependencies, no shared mutable state between applications, and no bypassing of public interfaces through internal module access.

## Operational Domain

The microservices architecture domain covers the structural organization of the Prismatic Platform's umbrella applications, their dependency relationships, communication patterns, and deployment boundaries. The agent maintains a living architecture model that maps application responsibilities, API surfaces, data ownership, and message flow paths. This model is continuously validated against the actual codebase to detect architectural drift.

| Architecture Concern | Scope | Enforcement |
|---------------------|-------|-------------|
| Service Boundaries | Application-level isolation | Dependency graph validation |
| API Contracts | Public module interfaces | Compile-time boundary checks |
| Data Ownership | Schema per application | Migration isolation |
| Communication | Message passing, PubSub | No direct cross-app DB access |
| Fault Isolation | Supervision tree boundaries | Process group isolation |
| Deployment Units | Release configuration | Independent scaling capability |

## Key Capabilities

- **Service boundary analysis** -- Evaluates application cohesion and coupling metrics to identify when an application should be split, merged, or restructured, using dependency graph analysis and change frequency correlation
- **API contract enforcement** -- Ensures that inter-application communication occurs exclusively through defined public interfaces, detecting and blocking internal module access that violates encapsulation boundaries
- **Dependency graph management** -- Maintains and validates the directed acyclic graph (DAG) of application dependencies, preventing circular references and minimizing coupling depth
- **Data ownership governance** -- Enforces the principle that each application owns its data schemas and [Ecto](/glossary/ecto/) migrations, preventing cross-application database coupling
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed architecture analysis and drift detection cycles
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing architectural health metrics and dependency violation alerts

## Architecture Patterns

### Umbrella Application as Microservices

```elixir
defmodule Prismatic.Architecture.BoundaryChecker do
  @moduledoc """
  Validates that umbrella applications respect service boundaries.
  Detects unauthorized cross-application module access.
  """

  @spec validate_boundaries(atom()) :: {:ok, report()} | {:error, [violation()]}
  def validate_boundaries(app) do
    allowed_deps = fetch_declared_dependencies(app)
    actual_calls = analyze_module_references(app)

    violations =
      actual_calls
      |> Enum.reject(fn {target_app, _module} ->
        target_app in allowed_deps or target_app == app
      end)
      |> Enum.map(fn {target_app, module} ->
        %{
          type: :boundary_violation,
          source_app: app,
          target_app: target_app,
          module: module,
          severity: :high
        }
      end)

    case violations do
      [] -> {:ok, %{app: app, status: :clean, dependencies: allowed_deps}}
      _ -> {:error, violations}
    end
  end

  defp fetch_declared_dependencies(app) do
    app
    |> Application.spec(:applications)
    |> Kernel.||([])
    |> Enum.filter(&String.starts_with?(Atom.to_string(&1), "prismatic"))
  end
end
```

### Service Communication Contract

```elixir
defmodule Prismatic.Architecture.ServiceContract do
  @moduledoc """
  Defines and validates service-to-service communication contracts.
  Ensures backward-compatible API evolution.
  """

  @type contract :: %{
    provider: atom(),
    consumer: atom(),
    interface: module(),
    version: String.t(),
    functions: [function_spec()]
  }

  @spec register_contract(contract()) :: :ok
  def register_contract(contract) do
    :ets.insert(:service_contracts, {
      {contract.provider, contract.consumer},
      contract
    })

    :telemetry.execute(
      [:prismatic, :architecture, :contract_registered],
      %{count: 1},
      %{provider: contract.provider, consumer: contract.consumer}
    )

    :ok
  end

  @spec validate_compatibility(atom(), atom()) :: :compatible | {:breaking, [change()]}
  def validate_compatibility(provider, consumer) do
    case :ets.lookup(:service_contracts, {provider, consumer}) do
      [{_, contract}] -> check_interface_compatibility(contract)
      [] -> {:error, :no_contract}
    end
  end
end
```

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to define service boundaries, approve dependency additions, and enforce architectural standards across all platform applications.

## Architectural Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Coupling Index | Average inter-app dependencies per application | < 5 direct dependencies |
| Cohesion Score | Functional relatedness within each application | > 0.8 (high cohesion) |
| Boundary Violations | Unauthorized cross-application module access | 0 (zero tolerance) |
| Circular Dependencies | Dependency cycles in the application graph | 0 (zero tolerance) |
| API Surface Stability | Breaking change frequency per release | < 1% of interfaces |
| Deployment Independence | Ability to deploy applications independently | > 90% of applications |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/architecture boundaries` | Validate service boundaries across all applications | L3+ |
| `/architecture dependencies` | Display dependency graph with coupling metrics | L3+ |
| `/architecture contracts` | Audit service contract compatibility | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [event-driven-architecture-specialist](/agents/event-driven-architecture-specialist/) | Coordinates on event-based inter-service communication patterns |
| [service-mesh-specialist](/agents/service-mesh-specialist/) | Manages service discovery and routing for distributed deployments |
| [database-architecture-specialist](/agents/database-architecture-specialist/) | Enforces per-service data ownership and migration isolation |
| [code-quality-commander](/agents/code-quality-commander/) | Quality standards applied to architectural boundary enforcement code |

## BEAM-Native Microservices Philosophy

The Prismatic Platform's approach to microservices differs fundamentally from the traditional containerized-services model. In conventional microservices architectures, services communicate over HTTP or message queues, deploy as independent Docker containers, and rely on service meshes for observability and resilience. The Prismatic Platform achieves the same modularity benefits -- independent development, clear boundaries, fault isolation -- through the [BEAM](/glossary/beam/) virtual machine's native process isolation and the Elixir [umbrella application](/glossary/umbrella-application/) structure.

Each umbrella application functions as a logical microservice: it owns its modules, schemas, and public API, and it communicates with other applications through well-defined interfaces. The critical difference is that inter-application calls are function calls within the same VM, not network requests. This eliminates the latency, serialization overhead, and partial failure modes inherent in distributed architectures while preserving the organizational benefits of service decomposition.

The microservices-architecture-specialist enforces a strict rule: applications may only depend on other applications' public facade modules. Internal modules (those not exported through the application's public API) are invisible to other applications at the architectural level. This is enforced through compile-time boundary checking using the `BoundaryChecker` module, which statically analyzes module references across the dependency graph.

### Data Ownership Pattern

Each application owns its [Ecto](/glossary/ecto/) schemas and database migrations exclusively. Cross-application data access occurs through the owning application's public API, never through direct database queries. This pattern ensures that schema changes within one application cannot break other applications, and that each application can evolve its data model independently. The microservices-architecture-specialist validates this pattern by detecting any cross-application Ecto repo calls that bypass the owning application's facade.

### Fault Isolation Boundaries

[OTP](/glossary/otp/) [supervision trees](/glossary/supervision-tree/) provide natural fault isolation boundaries between applications. Each application runs under its own supervision tree, meaning that a crash in one application's processes does not propagate to other applications. The microservices-architecture-specialist validates that supervision tree boundaries align with application boundaries, ensuring that no supervisor crosses application lines and that each application's processes are fully contained within its supervision hierarchy.

## Architecture Drift Detection

Architecture drift occurs when the implemented code structure diverges from the designed architecture. The microservices-architecture-specialist runs continuous drift detection by comparing the declared dependency graph (in each application's `mix.exs`) against the actual module reference graph (extracted through compile-time analysis). Any undeclared dependency detected through actual module references triggers an immediate architecture violation alert. This detection runs as part of the platform's pre-commit quality gates, preventing drift from entering the codebase.

Drift detection also monitors for "creeping coupling" -- the gradual increase in inter-application dependencies over time. The specialist tracks the coupling index (average number of direct dependencies per application) across development history and raises alerts when the trend indicates increasing coupling, even if individual dependency additions appear justified.

## Enforcement

All architectural decisions comply with the [NO MERCY](/glossary/no-mercy/) doctrine: circular dependencies trigger immediate build failures, boundary violations block commits, and undeclared cross-application access is rejected at compile time. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every service boundary decision is backed by cohesion and coupling analysis. Architecture drift detection runs continuously through the [SEADF](/glossary/seadf/) evolutionary framework, ensuring that the implemented architecture matches the designed architecture.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)