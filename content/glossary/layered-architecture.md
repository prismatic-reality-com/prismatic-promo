+++
title = "Layered Architecture"
weight = 50
[extra]
tags = ["glossary", "architecture", "design-patterns", "clean-architecture", "hexagonal", "umbrella", "separation-of-concerns"]
description = "Layered architecture organizes software systems into hierarchical layers with strict dependency rules, where each layer provides services to the layer above and consumes services from the layer below, enabling separation of concerns, testability, and independent evolution"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["architecture", "domain-driven-design", "bounded-context", "adapter-pattern", "dependency-injection", "modularity", "umbrella-application", "composability", "protocol", "behaviour", "facade-modules", "software-architecture", "enterprise-architecture", "project-structure"]
learning_outcomes = ["Understand the principles and variants of layered architecture", "Apply hexagonal architecture patterns to Elixir umbrella applications", "Design dependency rules that enforce layer isolation", "Implement Prismatic Platform's multi-layer umbrella architecture", "Evaluate tradeoffs between strict and relaxed layering strategies"]
prerequisites = ["architecture", "modularity", "domain-driven-design", "adapter-pattern"]
key_concepts = ["dependency rule", "ports and adapters", "onion architecture", "clean architecture", "layer isolation", "inversion of control", "umbrella applications", "boundary protocols"]
see_also = ["architecture", "domain-driven-design", "bounded-context", "adapter-pattern", "umbrella-application"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
word_count = 1780
date_modified = "2026-02-23"
keywords = ["Layered", "Architecture", "glossary", "Prismatic Platform", "Layer", "Elixir", "Applications"]
image = "/images/sections/glossary.png"
image_alt = "Layered Architecture - Prismatic Platform"
+++

## Definition

Layered architecture is a software design pattern that organizes system components into hierarchical layers, each with a specific responsibility and a well-defined dependency relationship with adjacent layers. The fundamental principle is the **dependency rule**: each layer may only depend on layers below it, never above. This creates a unidirectional flow of dependencies from the outermost (most volatile) layers toward the innermost (most stable) layers, enabling independent development, testing, and evolution of each layer.

In the Prismatic Platform, layered architecture manifests through the 115-application Elixir umbrella structure, where applications are organized into architectural layers ranging from core storage traits at the bottom through domain logic in the middle to web presentation and API gateway at the top. This layering enforces compilation-time dependency checks, ensures that core business logic never depends on infrastructure details, and enables individual applications to evolve independently while maintaining system coherence.

## Historical Evolution of Layered Architecture

### Classical Three-Tier Architecture

The earliest formalization of layered architecture appeared as the three-tier model in the 1990s, separating systems into Presentation, Business Logic, and Data Access layers. While revolutionary for its time, this model suffered from tight coupling between layers, particularly between business logic and data access, where domain objects often mirrored database schemas directly.

### Hexagonal Architecture (Ports and Adapters)

Alistair Cockburn's hexagonal architecture (2005) reconceptualized layering by placing the application core at the center, surrounded by ports (interfaces) that define how the core communicates with the outside world. Adapters implement these ports for specific technologies. This inversion eliminated the assumption that data flows "down" to a database and "up" to a UI, recognizing that a system has many external interfaces, none inherently more important than others.

### Onion Architecture

Jeffrey Palermo's onion architecture (2008) extended hexagonal thinking with explicit concentric layers: Domain Model at the center, surrounded by Domain Services, then Application Services, then Infrastructure. The key insight was that all dependencies point inward -- infrastructure depends on the domain, never the reverse.

### Clean Architecture

Robert Martin's clean architecture (2012) synthesized hexagonal, onion, and earlier layered approaches into a unified framework with four layers: Entities, Use Cases, Interface Adapters, and Frameworks/Drivers. The dependency rule is absolute: source code dependencies point only inward.

### Elixir/OTP Evolution

The Elixir ecosystem adopted its own layered architecture approach through umbrella applications. Rather than using package-level dependency injection common in object-oriented languages, Elixir enforces layers through application boundaries, compilation dependencies declared in `mix.exs`, and [behaviours](/glossary/behaviour/) and [protocols](/glossary/protocol/) that define layer interfaces. This approach provides compile-time verification of the dependency rule -- a layer violation causes a compilation error.

## Prismatic Platform Layer Architecture

The Prismatic Platform organizes its 115 umbrella applications into seven architectural layers, each with specific responsibilities and dependency constraints.

### Layer 0: Core Traits and Protocols

The innermost layer defines abstract interfaces with zero concrete dependencies. These are pure Elixir [protocols](/glossary/protocol/), behaviours, and type specifications that establish contracts between layers.

```elixir
defmodule PrismaticStorageCore.Adapter do
  @moduledoc """
  Core adapter behaviour defining the contract that all storage
  implementations must satisfy. Lives in Layer 0 with zero
  infrastructure dependencies. This behaviour is the fundamental
  port in the hexagonal architecture sense.
  """

  @type key :: binary()
  @type value :: term()
  @type opts :: keyword()

  @callback get(key(), opts()) :: {:ok, value()} | {:error, term()}
  @callback put(key(), value(), opts()) :: :ok | {:error, term()}
  @callback delete(key(), opts()) :: :ok | {:error, term()}
  @callback list(opts()) :: {:ok, [key()]} | {:error, term()}

  @doc """
  Returns the adapter's capabilities, enabling layer-aware routing
  of storage operations to appropriate implementations.
  """
  @callback capabilities() :: [atom()]
end
```

**Applications**: `prismatic_storage_core`, `prismatic_types`, `prismatic_contracts`
**Dependencies**: None (pure Elixir standard library only)
**Stability**: Extremely stable -- changes here ripple through the entire system

### Layer 1: Domain Logic

Business rules, entity definitions, and domain services that encode the platform's core intelligence. This layer depends only on Layer 0 traits and the Elixir standard library.

```elixir
defmodule Prismatic.Domain.EntityResolution do
  @moduledoc """
  Core entity resolution logic operating purely on domain types.
  Performs entity matching, deduplication, and graph construction
  without any knowledge of storage implementation or web presentation.
  Layer 1: depends only on Layer 0 contracts and core Elixir types.
  """

  alias PrismaticStorageCore.Adapter, as: StoragePort

  @spec resolve(
    entities :: [Entity.t()],
    storage :: module(),
    opts :: keyword()
  ) :: {:ok, [ResolvedEntity.t()]} | {:error, term()}
  def resolve(entities, storage, opts \\ [])
      when is_list(entities) and is_atom(storage) do
    with :ok <- validate_adapter(storage),
         {:ok, existing} <- storage.list(Keyword.merge(opts, [type: :entity])),
         matches <- find_matches(entities, existing),
         resolved <- apply_resolution_rules(matches) do
      {:ok, resolved}
    end
  end

  @spec validate_adapter(module()) :: :ok | {:error, :invalid_adapter}
  defp validate_adapter(module) do
    if function_exported?(module, :capabilities, 0) and
       :entity_storage in module.capabilities() do
      :ok
    else
      {:error, :invalid_adapter}
    end
  end
end
```

**Applications**: `prismatic`, `prismatic_agents`, `prismatic_perimeter`, `prismatic_osint`
**Dependencies**: Layer 0 only
**Stability**: Stable -- represents core business value

### Layer 2: Application Services

Orchestration layer that coordinates domain operations, manages transactions, and implements use cases. This layer knows about domain concepts but not about specific infrastructure.

```elixir
defmodule Prismatic.Services.InvestigationService do
  @moduledoc """
  Application service coordinating OSINT investigation workflows.
  Orchestrates domain operations from Layer 1 and delegates
  infrastructure concerns to injected adapters. Layer 2: depends
  on Layer 0 (contracts) and Layer 1 (domain logic).
  """

  @spec run_investigation(
    target :: binary(),
    adapters :: keyword(),
    opts :: keyword()
  ) :: {:ok, Investigation.t()} | {:error, term()}
  def run_investigation(target, adapters, opts \\ []) do
    storage = Keyword.fetch!(adapters, :storage)
    intelligence = Keyword.fetch!(adapters, :intelligence)

    with {:ok, entity} <- Prismatic.Domain.EntityResolution.resolve_single(target, storage),
         {:ok, signals} <- intelligence.gather(entity, opts),
         {:ok, analysis} <- Prismatic.Domain.SignalAnalysis.analyze(signals),
         :ok <- storage.put("investigation:#{entity.id}", analysis) do
      {:ok, %Investigation{entity: entity, signals: signals, analysis: analysis}}
    end
  end
end
```

**Applications**: `prismatic_services`, `prismatic_workflows`, `prismatic_pipelines`
**Dependencies**: Layer 0 and Layer 1
**Stability**: Moderate -- changes with new use cases

### Layer 3: Infrastructure Adapters

Concrete implementations of Layer 0 ports that connect the application to external systems: databases, APIs, file systems, and message queues.

```elixir
defmodule PrismaticStorageEcto.Adapter do
  @moduledoc """
  Ecto-based storage adapter implementing the Layer 0 storage contract.
  Connects the platform to PostgreSQL through Ecto. Layer 3: depends
  on Layer 0 (contract) and external libraries (Ecto, Postgrex).
  """

  @behaviour PrismaticStorageCore.Adapter

  @impl PrismaticStorageCore.Adapter
  @spec get(binary(), keyword()) :: {:ok, term()} | {:error, term()}
  def get(key, opts \\ []) do
    repo = Keyword.get(opts, :repo, Prismatic.Repo)

    case repo.get(StorageRecord, key) do
      nil -> {:error, :not_found}
      record -> {:ok, decode_value(record.value)}
    end
  end

  @impl PrismaticStorageCore.Adapter
  @spec capabilities() :: [atom()]
  def capabilities do
    [:entity_storage, :transactional, :queryable, :persistent]
  end
end
```

**Applications**: `prismatic_storage_ecto`, `prismatic_storage_ets`, `prismatic_storage_meilisearch`, `prismatic_storage_kuzu`
**Dependencies**: Layer 0 plus external libraries
**Stability**: Variable -- changes with infrastructure evolution

### Layer 4: Web and API Presentation

The outermost application layer handling HTTP requests, WebSocket connections, [LiveView](/glossary/liveview/) interactions, and API serialization. This layer depends on all inner layers but is never depended upon by them.

```elixir
defmodule PrismaticWeb.PerimeterLive do
  @moduledoc """
  LiveView presentation for the Prismatic Perimeter EASM dashboard.
  Layer 4: the outermost layer, consuming services from all inner
  layers but never depended upon by them. Handles user interaction,
  real-time updates, and visual presentation.
  """

  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  @spec mount(map(), map(), Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:updates")
    end

    {:ok, assign(socket, :dashboard, load_dashboard_data())}
  end

  @spec load_dashboard_data() :: map()
  defp load_dashboard_data do
    # Calls Layer 2 service, which coordinates Layer 1 domain logic
    # with Layer 3 storage adapters. The LiveView never touches
    # storage or domain logic directly.
    Prismatic.Services.PerimeterService.dashboard_summary(
      storage: PrismaticStorageEcto.Adapter,
      cache: PrismaticStorageEts.Adapter
    )
  end
end
```

**Applications**: `prismatic_web`, `prismatic_api`
**Dependencies**: All inner layers
**Stability**: Most volatile -- changes with UI requirements

### Layer 5: Tooling and Development

Build tools, mix tasks, code generators, and development utilities. These depend on the entire application but are not part of the production runtime.

**Applications**: `prismatic_credo`, `prismatic_safety`, `prismatic_code_components`
**Dependencies**: All layers (development only)
**Stability**: Moderate

### Layer 6: AIAD Agent Infrastructure

The agent infrastructure layer sits alongside the main application layers, providing the meta-layer that governs how agents interact with all other layers.

**Applications**: `prismatic_claude`, `prismatic_agents`, agent definitions in `.aiad/`
**Dependencies**: Cross-cutting across all layers (governed by agent authority levels)

## Enforcing Layer Boundaries

### Compile-Time Enforcement

Elixir's umbrella application structure provides compile-time enforcement of the dependency rule. Each application's `mix.exs` declares its dependencies explicitly:

```elixir
# apps/prismatic_storage_ecto/mix.exs - Layer 3 adapter
defp deps do
  [
    # Layer 0 dependency (allowed)
    {:prismatic_storage_core, in_umbrella: true},
    # External library dependency (allowed at Layer 3)
    {:ecto_sql, "~> 3.11"},
    {:postgrex, "~> 0.18"},
    # Layer 4 dependency would FAIL compilation:
    # {:prismatic_web, in_umbrella: true}  # FORBIDDEN
  ]
end
```

If a Layer 3 application attempts to depend on a Layer 4 application, `mix compile` will either fail (if the dependency creates a cycle) or the violation will be caught by the platform's dependency analysis tooling.

### Static Analysis Enforcement

The platform's [Credo](/glossary/credo/) configuration and custom [static analysis](/glossary/static-analysis/) rules verify layer boundaries beyond compile-time checks. These rules detect runtime coupling (such as direct module references that bypass the declared dependency graph) and flag them as violations.

### Architectural Decision Records

Every layer boundary decision is documented in an Architectural Decision Record (ADR) stored in `docs/architecture/`. These records explain why specific dependencies are allowed or forbidden, providing context for future developers who may be tempted to take shortcuts across layer boundaries.

## Layer Communication Patterns

### Downward Calls (Standard)

The most common pattern: a higher layer calls a function defined in a lower layer. This is the natural flow of the dependency rule.

### Upward Notifications (Event-Based)

When a lower layer needs to inform a higher layer of a state change, it uses events rather than direct calls. The lower layer publishes an event through [PubSub](/glossary/pubsub/) or [telemetry](/glossary/telemetry/), and the higher layer subscribes to that event. This preserves the dependency rule because the lower layer has no knowledge of its subscribers.

### Cross-Layer Ports (Dependency Inversion)

When a domain service (Layer 1) needs to perform an infrastructure operation (Layer 3), it defines a behaviour (port) at its own layer and accepts an implementation (adapter) through function parameters or application configuration. The domain layer defines what it needs; the infrastructure layer provides it.

```
Layer 4 (Web)
  |-- calls --> Layer 2 (Service)
                  |-- calls --> Layer 1 (Domain)
                  |               |-- defines --> Layer 0 (Behaviour)
                  |               |                     ^
                  |-- injects --> Layer 3 (Adapter) --implements--|
```

## Benefits of Layered Architecture

### Testability

Each layer can be tested independently by providing mock implementations of its dependencies. Layer 1 domain logic can be tested without any database, HTTP server, or external API -- only Layer 0 contracts need to be satisfied. This enables comprehensive unit testing that runs in milliseconds.

### Independent Deployment

In the Prismatic Platform's umbrella structure, individual applications can be updated, recompiled, and even hot-code-reloaded independently. A change to a Layer 3 storage adapter does not require recompilation of Layer 1 domain logic.

### Team Scalability

Different teams can own different layers with clear interfaces between them. The team responsible for storage adapters needs only to satisfy the Layer 0 contracts; they do not need to understand the domain logic that consumes their adapters.

### Technology Migration

Changing infrastructure (e.g., migrating from PostgreSQL to a different database) affects only Layer 3 adapters. The domain logic, application services, and presentation layers are completely isolated from such changes.

## Common Pitfalls and Anti-Patterns

### Layer Skipping

When a higher layer bypasses intermediate layers to access a lower layer directly. For example, a LiveView component directly querying the database instead of going through the service and domain layers.

### Leaky Abstractions

When infrastructure concepts (Ecto schemas, HTTP headers, database column names) leak into domain entities. The domain layer should define its own types that are independent of any infrastructure representation.

### Circular Dependencies

When applications in different layers depend on each other, creating a cycle in the dependency graph. Elixir's compiler detects most of these, but runtime references through `Module.concat/1` or `apply/3` can escape compile-time detection.

### Over-Layering

Adding layers beyond what the complexity warrants. For simple CRUD operations, routing through seven layers of abstraction adds latency and complexity without proportional benefit. The Prismatic Platform addresses this by allowing "fast paths" for simple operations while maintaining full layering for complex workflows.

### God Layer

When a single layer accumulates too many responsibilities. In the Prismatic Platform, the original `prismatic` application evolved into a god application that was later decomposed into separate domain applications.

## Layered Architecture in Practice: Performance Impact

Layered architecture introduces function call overhead as data traverses layers. In the Prismatic Platform, this overhead is measured and kept within the [performance](/glossary/performance/) budget:

| Path | Layers Traversed | Overhead | Acceptable |
|------|-------------------|----------|------------|
| Health check | 1 (Web only) | < 1 ms | Yes |
| Dashboard page load | 4 (Web -> Service -> Domain -> Storage) | 3-8 ms | Yes |
| OSINT investigation | 5 (Web -> Service -> Domain -> Storage -> External API) | 10-50 ms | Yes |
| Agent orchestration | 6 (Agent -> Service -> Domain -> Storage -> External -> Agent) | 20-100 ms | Yes |

These measurements confirm that layer traversal overhead is negligible compared to actual computation and I/O costs.

## Comparison with Alternative Architectures

| Architecture | Strengths | Weaknesses | Best For |
|-------------|-----------|------------|----------|
| **Layered** | Clear dependencies, testable | Can be rigid, overhead | Enterprise applications |
| **Microservices** | Independent deployment, polyglot | Network overhead, complexity | Large distributed teams |
| **Monolith** | Simple, fast, no network calls | Coupling, scaling limits | Small teams, MVPs |
| **Event-Driven** | Loose coupling, scalable | Eventual consistency, debugging | Async workflows |
| **Prismatic Umbrella** | Compile-time enforcement, monolith speed, microservice boundaries | Learning curve | Complex platforms |

The Prismatic Platform's umbrella approach captures the best of layered and microservice architectures: it has the deployment simplicity and performance of a monolith with the boundary enforcement and modularity of microservices.

## Best Practices

1. **Define layers before writing code**: The layer structure should be an explicit architectural decision, not an emergent accident.

2. **Enforce boundaries with tooling**: Human discipline alone is insufficient. Use compile-time dependencies, static analysis, and CI/CD gates.

3. **Keep the dependency rule absolute**: Every exception to the dependency rule weakens the entire architecture. If an exception seems necessary, the layer structure may need revision.

4. **Define layer interfaces as behaviours**: Use Elixir behaviours and protocols at layer boundaries rather than concrete module references.

5. **Test each layer independently**: Layer 1 tests should not require Layer 3 infrastructure. Use behaviour implementations that operate in-memory.

6. **Document layer responsibilities**: Each layer should have a clear, one-sentence purpose statement that helps developers decide where new code belongs.

7. **Monitor layer health metrics**: Track compilation dependencies, cross-layer coupling metrics, and layer violation counts over time.

## Related Concepts

- [Architecture](/glossary/architecture/) -- The broader discipline encompassing layered design
- [Domain-Driven Design](/glossary/domain-driven-design/) -- Strategic design methodology aligned with layered architecture
- [Bounded Context](/glossary/bounded-context/) -- DDD concept mapping to application boundaries
- [Adapter Pattern](/glossary/adapter-pattern/) -- The pattern connecting layers to external systems
- [Umbrella Application](/glossary/umbrella-application/) -- Elixir's mechanism for implementing layered architecture
- [Modularity](/glossary/modularity/) -- The design principle underlying layer separation
- [Composability](/glossary/composability/) -- Building systems from independently layered components
- [Protocol](/glossary/protocol/) -- Elixir's polymorphism mechanism for layer interfaces
- [Behaviour](/glossary/behaviour/) -- Elixir's contract mechanism for layer boundaries
- [Facade Modules](/glossary/facade-modules/) -- Public APIs exposing layer functionality

## Further Reading

- Cockburn, Alistair. "Hexagonal Architecture." 2005.
- Martin, Robert C. "Clean Architecture: A Craftsman's Guide to Software Structure and Design." Prentice Hall, 2017.
- Evans, Eric. "Domain-Driven Design: Tackling Complexity in the Heart of Software." Addison-Wesley, 2003.
- Valim, Jose. "Elixir in Action." Manning Publications (umbrella applications chapter).
- Prismatic Platform Architecture Documentation: `docs/architecture/`

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
