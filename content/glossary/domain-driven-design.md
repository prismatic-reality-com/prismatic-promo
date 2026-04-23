+++
title = "Domain-Driven Design"
weight = 24
[extra]
category = "architecture"
description = "Software design approach aligning code structure with business domain boundaries"
related_terms = ["bounded-context", "cqrs", "event-sourcing", "adapter-pattern", "message-passing", "pubsub", "behaviour", "ecto", "agent"]
acronym = "DDD"
author = "Eric Evans"
year_introduced = "2003"
paradigm = "Strategic and Tactical Software Design"
difficulty = "Advanced"
platforms = ["Elixir/OTP", "BEAM", "Phoenix"]
use_cases = ["Complex business domains", "Microservices architecture", "Platform decomposition"]
prismatic_apps = ["prismatic_perimeter", "prismatic_agents", "prismatic_safety", "prismatic_storage_core", "prismatic_claude", "prismatic_web", "prismatic_api"]
key_patterns = ["Bounded Context", "Aggregate", "Entity", "Value Object", "Domain Event", "Repository", "Anti-Corruption Layer"]
strategic_patterns = ["Context Map", "Shared Kernel", "Customer-Supplier", "Published Language", "Conformist"]
tactical_patterns = ["Aggregate Root", "Domain Service", "Factory", "Specification"]
elixir_alignment = ["GenServer as Aggregate", "Umbrella as Bounded Context", "Protocol as Anti-Corruption Layer"]
quality_impact = "Foundational"
prerequisites = ["object-oriented-programming", "functional-programming", "message-passing"]
further_reading = ["Domain-Driven Design by Eric Evans", "Implementing Domain-Driven Design by Vaughn Vernon", "Domain Modeling Made Functional by Scott Wlaschin"]
reading_time = "9 min"
word_count = 1706
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Domain-Driven", "Design", "Software", "glossary", "architecture", "Prismatic Platform", "Elixir", "Domain"]
tags = ["glossary", "architecture", "domain-driven-design", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Domain-Driven Design - Prismatic Platform"
+++

## Definition

Domain-Driven Design (DDD) is a software design methodology, articulated by Eric Evans in his 2003 book of the same name, that places the core business domain at the center of architectural decisions. It emphasizes a ubiquitous language shared between developers and domain experts, strategic decomposition into bounded contexts, and tactical patterns like aggregates, entities, value objects, and domain events to model complex business logic faithfully. DDD is not a technology or a framework -- it is a way of thinking about software that prioritizes understanding the problem domain before choosing implementation strategies.

The methodology operates at two levels. Strategic DDD addresses the large-scale structure: how to decompose a complex domain into manageable [bounded contexts](@/glossary/bounded-context.md), how those contexts communicate, and where to invest modeling effort. Tactical DDD provides patterns for implementing domain logic within a bounded context: aggregates enforce transactional consistency boundaries, entities carry identity through state changes, value objects represent measurements or descriptions without identity, and domain events capture significant occurrences. The strategic level determines system architecture; the tactical level determines code structure within each component.

The Prismatic Platform's umbrella architecture directly reflects DDD principles. Each of the 115+ Elixir apps represents a bounded context with explicit boundaries: `prismatic_perimeter` owns the EASM domain, `prismatic_safety` owns quality enforcement, `prismatic_agents` owns the agent lifecycle, and `prismatic_storage_core` provides the shared kernel of traits and contracts. Cross-context communication uses well-defined protocols and [behaviours](@/glossary/behaviour.md) rather than shared mutable state, enforcing aggregate boundaries at the OTP process level. This alignment between DDD concepts and Elixir/OTP constructs is not coincidental -- both traditions prioritize explicit boundaries, message-based communication, and isolated state.

## Historical Context and Evolution

Eric Evans published "Domain-Driven Design: Tackling Complexity in the Heart of Software" in 2003, synthesizing patterns he observed in successful enterprise software projects. The book introduced the idea that software teams should invest heavily in understanding the problem domain before writing code, and that the resulting domain model should drive every architectural decision.

DDD gained renewed relevance with the rise of microservices architecture around 2014. The bounded context concept provided a principled approach to service decomposition -- instead of arbitrary microservice boundaries, teams could use domain analysis to identify natural seams. Vaughn Vernon's "Implementing Domain-Driven Design" (2013) bridged the gap between Evans's conceptual framework and practical implementation. Scott Wlaschin's "Domain Modeling Made Functional" (2018) demonstrated that DDD patterns are not inherently object-oriented and translate naturally to functional programming languages, which is particularly relevant for the Prismatic Platform's Elixir-based implementation.

The evolution from monolithic to distributed architectures has made DDD's strategic patterns more important than ever. In a monolith, poor domain boundaries create tangled code; in a distributed system, they create tangled services with cascading failures, performance problems, and deployment coupling. Getting the boundaries right is the single most impactful architectural decision in a distributed system.

## Strategic Patterns

### Bounded Contexts

The [bounded context](@/glossary/bounded-context.md) is the primary strategic pattern in DDD. It defines an explicit boundary within which a domain model is internally consistent. Different bounded contexts may use the same terminology with different meanings -- "asset" in `prismatic_perimeter` means an external attack surface element, while in `prismatic_storage_core` it means a storable entity.

| Prismatic App | Bounded Context | Core Domain Concept |
|--------------|-----------------|---------------------|
| `prismatic_perimeter` | External Attack Surface Management | Assets, security ratings, compliance |
| `prismatic_agents` | Agent Lifecycle Management | Agents, tiers, capabilities, missions |
| `prismatic_safety` | Quality Enforcement | Quality gates, violations, healing cycles |
| `prismatic_storage_core` | Storage Contracts | Traits, protocols, behaviours |
| `prismatic_claude` | Session Intelligence | Stack frames, conversation state, session lifecycle |
| `prismatic_web` | User Interface | LiveView pages, components, routes |
| `prismatic_api` | API Gateway | Endpoints, dispatch, OpenAPI specs |
| `prismatic_supervisor` | Compositional Supervision | Domain supervisors, health monitoring, dependency graphs |
| `prismatic_dark` | Security Operations | Color teams, adversarial simulation, epistemic defense |

### Context Mapping

Context mapping describes how bounded contexts relate to each other. DDD defines several relationship patterns:

| Relationship | Description | Prismatic Example |
|-------------|-------------|-------------------|
| **Shared Kernel** | Common code shared between contexts | `prismatic_storage_core` traits shared by all storage adapters |
| **Customer-Supplier** | Upstream context serves downstream | `prismatic_perimeter` supplies data to `prismatic_web` |
| **Anti-Corruption Layer** | Translation layer protecting context integrity | Storage adapters translating between domain and persistence models |
| **Published Language** | Documented interface contract | [OpenAPI](@/glossary/openapi.md) spec for `prismatic_api` |
| **Separate Ways** | Contexts with no integration | Independent utility apps |
| **Conformist** | Downstream adopts upstream model | External OSINT provider response schemas |
| **Open Host Service** | Context exposes a protocol for integration | [REST API](@/glossary/rest-api.md) gateway for external consumers |
| **Partnership** | Two contexts coordinate development | `prismatic_web` and `prismatic_api` sharing authentication |

### Ubiquitous Language

Ubiquitous language is the shared vocabulary between developers and domain experts within a bounded context. In the Prismatic Platform, this language is enforced through multiple mechanisms:

- **Module names**: `PrismaticPerimeter.SecurityRating`, not `PrismaticPerimeter.Score`
- **Function names**: `assess_compliance/2`, not `check/2`
- **AIAD agent definitions**: Agent specs use domain terminology (`security-scanner`, not `agent-42`)
- **Documentation**: CLAUDE.md files in each app document the bounded context's ubiquitous language
- **Glossary**: This glossary itself codifies the platform's ubiquitous language
- **Type names**: `@type security_grade :: :A | :B | :C | :D | :F`, not `@type grade :: integer()`

The ubiquitous language is not just a naming convention -- it is a design constraint. When the language used in code diverges from the language used by domain experts, it signals a modeling problem. The Prismatic Platform maintains language alignment through code review, naming standards enforced by [Credo](@/glossary/credo.md), and the AIAD agent specification format that requires domain-specific terminology.

## Tactical Patterns

### Aggregates

An aggregate is a cluster of domain objects treated as a unit for transactional consistency. External references should only point to the aggregate root; internal objects are accessed through the root.

```elixir
defmodule PrismaticPerimeter.Domain.AttackSurface do
  @moduledoc """
  Aggregate root for an organization's external attack surface.

  Encapsulates all discovered assets (domains, IPs, certificates, services)
  and enforces consistency rules for asset management. All modifications
  to the attack surface go through this aggregate root.
  """

  @type t :: %__MODULE__{
    organization: String.t(),
    domains: [Asset.t()],
    ip_addresses: [Asset.t()],
    certificates: [Asset.t()],
    services: [Asset.t()],
    assessed_at: DateTime.t() | nil,
    version: non_neg_integer()
  }

  defstruct [
    :organization,
    :domains,
    :ip_addresses,
    :certificates,
    :services,
    :assessed_at,
    :version
  ]

  @spec add_discovered_asset(t(), Asset.t()) :: {:ok, t()} | {:error, term()}
  def add_discovered_asset(%__MODULE__{} = surface, asset) do
    with :ok <- validate_asset(asset),
         :ok <- check_duplicate(surface, asset) do
      updated = %{surface |
        domains: maybe_add_domain(surface.domains, asset),
        ip_addresses: maybe_add_ip(surface.ip_addresses, asset),
        version: surface.version + 1
      }
      {:ok, updated}
    end
  end

  @spec remove_stale_assets(t(), DateTime.t()) :: {:ok, t()}
  def remove_stale_assets(%__MODULE__{} = surface, cutoff) do
    updated = %{surface |
      domains: Enum.reject(surface.domains, &stale?(&1, cutoff)),
      ip_addresses: Enum.reject(surface.ip_addresses, &stale?(&1, cutoff)),
      version: surface.version + 1
    }
    {:ok, updated}
  end
end
```

In OTP, aggregates map naturally to [GenServer](@/glossary/genserver.md) processes. Each aggregate instance has its own process with isolated state, enforcing the consistency boundary through the process mailbox -- only one message is processed at a time, providing serialized access without explicit locking. This is the defining insight of DDD on the BEAM: the aggregate pattern and the process model are isomorphic.

### Entities and Value Objects

| Concept | Identity | Mutability | Prismatic Example |
|---------|----------|------------|-------------------|
| **Entity** | Has unique identity; tracked through state changes | Mutable (through aggregate) | `Domain`, `IPAddress`, `Agent` |
| **Value Object** | Defined by attributes, not identity; two VOs with same attrs are equal | Immutable | `SecurityGrade`, `RiskScore`, `ComplianceLevel` |

```elixir
# Entity: has identity, tracked through changes
defmodule PrismaticPerimeter.Domain.Asset do
  @moduledoc "Entity representing a discoverable attack surface asset."

  @type t :: %__MODULE__{
    id: String.t(),
    type: atom(),
    value: String.t(),
    discovered_at: DateTime.t(),
    last_seen: DateTime.t(),
    confidence: float()
  }

  defstruct [:id, :type, :value, :discovered_at, :last_seen, :confidence]
end

# Value Object: defined by attributes, immutable
defmodule PrismaticPerimeter.Domain.SecurityGrade do
  @moduledoc "Value object representing a security assessment grade."

  @enforce_keys [:grade, :score]
  defstruct [:grade, :score]

  @spec new(atom(), non_neg_integer()) :: {:ok, t()} | {:error, :invalid_grade_score_combination}
  def new(:A, score) when score >= 800, do: {:ok, %__MODULE__{grade: :A, score: score}}
  def new(:B, score) when score >= 650, do: {:ok, %__MODULE__{grade: :B, score: score}}
  def new(:C, score) when score >= 500, do: {:ok, %__MODULE__{grade: :C, score: score}}
  def new(:D, score) when score >= 350, do: {:ok, %__MODULE__{grade: :D, score: score}}
  def new(:F, score) when score >= 0, do: {:ok, %__MODULE__{grade: :F, score: score}}
  def new(_, _), do: {:error, :invalid_grade_score_combination}
end
```

### Domain Events

Domain events represent significant occurrences within a bounded context. They are the primary mechanism for cross-context communication, enabling loose coupling between contexts.

| Event | Source Context | Consumer Contexts |
|-------|---------------|-------------------|
| `AssetDiscovered` | `prismatic_perimeter` | `prismatic_web` (dashboard), search index |
| `SecurityRatingCalculated` | `prismatic_perimeter` | `prismatic_web`, compliance engine |
| `QualityViolationDetected` | `prismatic_safety` | `prismatic_claude` (session tracking) |
| `AgentStateChanged` | `prismatic_agents` | `prismatic_web` (agent dashboard) |
| `SessionStarted` | `prismatic_claude` | `prismatic_safety` (baseline trigger) |
| `ComplianceAssessed` | `prismatic_perimeter` | `prismatic_web`, reporting engine |

Domain events flow between contexts through the platform's [PubSub](@/glossary/pubsub.md) system, maintaining the decoupling that DDD requires between bounded contexts.

### Domain Services

Domain services encapsulate operations that do not naturally belong to any entity or value object. They represent verbs in the ubiquitous language that operate across multiple aggregates:

```elixir
defmodule PrismaticPerimeter.Domain.ComplianceAssessmentService do
  @moduledoc """
  Domain service for assessing compliance of an attack surface
  against regulatory frameworks. Operates across the AttackSurface
  and ComplianceFramework aggregates.
  """

  @spec assess(AttackSurface.t(), [ComplianceFramework.t()]) ::
    {:ok, ComplianceReport.t()} | {:error, term()}
  def assess(%AttackSurface{} = surface, frameworks) do
    results = Enum.map(frameworks, fn framework ->
      {framework.name, evaluate_controls(surface, framework.controls)}
    end)

    {:ok, ComplianceReport.new(surface.organization, results)}
  end
end
```

### Repositories

The repository pattern provides an abstraction over data persistence, allowing the domain model to remain ignorant of storage details. In the Prismatic Platform, [Ecto](@/glossary/ecto.md) serves as the repository implementation for relational data:

```elixir
defmodule PrismaticPerimeter.Repository.AssetRepository do
  @moduledoc "Repository for persisting and retrieving attack surface assets."

  @spec find_by_organization(String.t()) :: {:ok, [Asset.t()]} | {:error, term()}
  def find_by_organization(org_id) do
    case PrismaticStorage.query(:assets, %{organization: org_id}) do
      {:ok, records} -> {:ok, Enum.map(records, &to_domain_entity/1)}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec persist(AttackSurface.t()) :: {:ok, AttackSurface.t()} | {:error, term()}
  def persist(%AttackSurface{} = surface) do
    with {:ok, _} <- PrismaticStorage.upsert(:attack_surfaces, to_record(surface)) do
      {:ok, surface}
    end
  end
end
```

## DDD and Elixir/OTP Alignment

The alignment between DDD concepts and Elixir/OTP constructs is remarkably tight:

| DDD Concept | Elixir/OTP Construct | Why It Fits |
|-------------|---------------------|-------------|
| Bounded Context | Umbrella app | Explicit dependency boundaries, separate compilation |
| Aggregate | GenServer process | Serialized state access, isolated failure domain |
| Entity | Struct with ID | [Pattern matching](@/glossary/pattern-matching.md), immutable updates via `%{struct \| field: value}` |
| Value Object | Struct without ID | Structural equality, immutability by default |
| Domain Event | [Message passing](@/glossary/message-passing.md) / PubSub | Asynchronous, location-transparent communication |
| Repository | [Ecto](@/glossary/ecto.md) Repo | Query/persistence abstraction, changesets for validation |
| Anti-Corruption Layer | Protocol / Behaviour | Explicit interface contracts, [adapter pattern](@/glossary/adapter-pattern.md) |
| Ubiquitous Language | Module naming | `PrismaticPerimeter.SecurityRating` reads as domain language |
| Domain Service | Module with pure functions | Stateless operations across aggregates |
| Factory | Constructor functions | `new/1`, `build/2` functions on domain structs |

This alignment means DDD patterns in Elixir are not forced abstractions but natural expressions of the language's design philosophy. A GenServer is not "used as" an aggregate -- it inherently provides the properties an aggregate requires.

## Hexagonal Architecture Integration

DDD is frequently combined with hexagonal (ports and adapters) architecture, where the domain model sits at the center and external concerns (databases, APIs, UI) connect through ports (interfaces) and adapters (implementations). The [adapter pattern](@/glossary/adapter-pattern.md) in the Prismatic Platform implements this directly:

```
+----------------------------------------------------------+
|                     Bounded Context                       |
|                                                           |
|  +---------------------------------------------------+   |
|  |              Domain Model (Core)                   |   |
|  |   Aggregates, Entities, Value Objects, Events      |   |
|  +---------------------------------------------------+   |
|         |              |              |                    |
|    [Port: Storage] [Port: Events] [Port: External]        |
|         |              |              |                    |
|  +------+------+  +---+---+  +-------+-------+           |
|  | Ecto Adapter|  | PubSub |  | OSINT Adapter |           |
|  | ETS Adapter |  | Broadway|  | API Adapter   |           |
|  +-------------+  +--------+  +---------------+           |
+----------------------------------------------------------+
```

The hexagonal architecture ensures that the domain model has no dependencies on infrastructure concerns. Storage adapters implement a [behaviour](@/glossary/behaviour.md) contract defined by the domain, not the other way around. This inversion of dependencies is what allows the Prismatic Platform to swap storage backends (ETS for development, Ecto for production, Meilisearch for search) without modifying any domain code.

## CQRS and Event Sourcing Synergies

DDD is frequently paired with [CQRS](@/glossary/cqrs.md) (Command Query Responsibility Segregation) and [Event Sourcing](@/glossary/event-sourcing.md). CQRS separates the write model (commands that change state) from the read model (queries that return data), allowing each to be optimized independently. Event sourcing persists the sequence of domain events rather than current state, providing a complete audit trail and enabling temporal queries.

In the Prismatic Platform, the event-driven architecture between bounded contexts naturally supports CQRS patterns: commands are processed within a bounded context's aggregate, while read models are built by consuming domain events in downstream contexts. The `prismatic_web` LiveView dashboard consumes events from `prismatic_perimeter` to build real-time read models for the UI, without the UI needing to understand the write model's internal structure.

## Common Anti-Patterns

| Anti-Pattern | Description | DDD Solution |
|-------------|-------------|--------------|
| **Anemic Domain Model** | Domain objects with no behavior, logic in services | Rich domain model with behavior on aggregates |
| **Big Ball of Mud** | No clear boundaries, everything coupled | Strategic decomposition into bounded contexts |
| **Shared Database** | Multiple contexts sharing tables | Each context owns its data; integration through events |
| **Leaky Abstraction** | Internal model exposed to consumers | Anti-corruption layer, published language |
| **God Object** | Single entity managing everything | Aggregate decomposition with clear responsibilities |
| **Smart UI** | Business logic in presentation layer | Domain model encapsulates all business rules |
| **Cargo Cult DDD** | Applying all patterns regardless of complexity | Use strategic DDD always; tactical DDD only for complex domains |

## Testing DDD Implementations

DDD implementations benefit from a layered testing strategy:

```elixir
defmodule PrismaticPerimeter.Domain.AttackSurfaceTest do
  @moduledoc false
  use ExUnit.Case, async: true

  describe "add_discovered_asset/2" do
    test "adds valid domain asset to attack surface" do
      surface = build_surface()
      asset = build_asset(:domain, "example.com")

      assert {:ok, updated} = AttackSurface.add_discovered_asset(surface, asset)
      assert length(updated.domains) == length(surface.domains) + 1
      assert updated.version == surface.version + 1
    end

    test "rejects duplicate assets" do
      surface = build_surface(domains: [build_asset(:domain, "example.com")])
      duplicate = build_asset(:domain, "example.com")

      assert {:error, :duplicate_asset} = AttackSurface.add_discovered_asset(surface, duplicate)
    end
  end
end
```

[Property-based testing](@/glossary/property-based-testing.md) is particularly valuable for DDD implementations, as it can verify aggregate invariants across thousands of random state transitions.

## Related Terms

- [Bounded Context](@/glossary/bounded-context.md) -- Primary decomposition unit in DDD, implemented as umbrella apps
- [CQRS](@/glossary/cqrs.md) -- Pattern frequently used within DDD architectures for read/write separation
- [Event Sourcing](@/glossary/event-sourcing.md) -- Persistence pattern aligned with domain events
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Hexagonal architecture implementation for storage and external services
- [Message Passing](@/glossary/message-passing.md) -- Cross-context communication mechanism implementing domain events
- [PubSub](@/glossary/pubsub.md) -- Event distribution system for cross-context integration
- [Behaviour](@/glossary/behaviour.md) -- Callback-based contracts defining port interfaces
- [Ecto](@/glossary/ecto.md) -- Repository pattern implementation for persistence
- [Agent](@/glossary/agent.md) -- AIAD agents modeled using DDD principles within their bounded contexts
- [Pattern Matching](@/glossary/pattern-matching.md) -- Elixir feature enabling expressive domain logic
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM property providing natural aggregate isolation
- [GenServer](@/glossary/genserver.md) -- OTP behaviour providing aggregate process semantics

## See Also

- [Architecture](@/architecture/_index.md) -- Platform domain architecture and strategic design decisions
- [Apps](@/apps/_index.md) -- Bounded context implementations across the umbrella

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
