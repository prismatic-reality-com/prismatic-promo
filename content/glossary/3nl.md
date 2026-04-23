+++
title = "3NL"
weight = 10
[extra]
category = "architecture"
description = "Three Nested Levels architecture organizing the platform into hierarchical layers of abstraction for agents, knowledge, and system operations."
acronym = "3NL"
related_terms = ["pvm", "nabla-infinity", "aiad", "three-nl", "bounded-context", "supervisor", "adapter-pattern", "epistemic-pipeline"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1407
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3NL", "Three", "Nested", "Levels", "glossary", "architecture", "Prismatic Platform", "Level", "Domain"]
tags = ["glossary", "architecture", "3nl", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "3NL - Prismatic Platform"
+++

## Definition

3NL (Three Nested Levels) is the Prismatic Platform's foundational architectural framework that organizes all platform components into three hierarchical levels of abstraction. Derived from systems theory and layered architecture principles, 3NL establishes a strict separation of concerns where each level encapsulates the complexity of the level below while exposing a clean, well-defined interface to the level above. The term "3NL" serves as the canonical shorthand for the full [Three Nested Levels](@/glossary/three-nl.md) framework, appearing throughout code, configuration files, agent specifications, and technical documentation. The etymological origin combines the numeral "3" with the abbreviation "NL" (Nested Levels), reflecting the framework's emphasis on exactly three tiers of nesting -- no more, no fewer -- as the structurally optimal decomposition for managing complexity at the scale of 90 umbrella applications, 434 agents, and over 2.8 million lines of code.

The three levels -- Strategic (L1), Tactical (L2), and Operational (L3) -- correspond to decreasing levels of abstraction and increasing levels of implementation detail. L1 defines what the system does (public APIs, agent commands, dashboard interfaces). L2 defines how components coordinate (inter-app protocols, pipeline orchestration, quality enforcement). L3 defines how things actually work (OTP processes, storage adapters, [BEAM](@/glossary/beam.md) primitives). This separation ensures that changes at one level do not cascade unnecessarily to others -- a storage adapter replacement at L3 does not affect the public API at L1.

## Overview

The conceptual lineage of 3NL draws from several established traditions in software architecture. The OSI seven-layer networking model demonstrated that complex communication protocols could be decomposed into layers with well-defined interfaces. Alistair Cockburn's Hexagonal Architecture (Ports and Adapters) showed that separating application logic from external interfaces enables testability and flexibility. Domain-Driven Design's strategic patterns (Bounded Contexts, Anti-Corruption Layers) established that organizational boundaries should align with software boundaries. 3NL synthesizes these insights into a three-tier framework specifically optimized for the Erlang/OTP ecosystem, where processes, supervision trees, and message passing provide natural enforcement mechanisms for layer boundaries.

The significance of 3NL within the Prismatic Platform cannot be overstated. It governs the structure of every umbrella application, the design of every agent, the flow of every quality check, and the propagation of every epistemic signal through the [NABLA Infinity](@/glossary/nabla-infinity.md) pipeline. Without 3NL, the platform's 90 applications would devolve into an unmanageable web of cross-cutting dependencies. With 3NL, each application exposes a clean facade at L1, coordinates through well-defined protocols at L2, and implements its internals freely at L3 -- enabling independent evolution without system-wide ripple effects.

The [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework operates at 3NL Level 3 integration, meaning it is embedded across all three levels with enforcement mechanisms at each. The [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) (16 levels, L0-L13 + Meta + Consciousness) maps onto 3NL: lower epistemic levels (L0-L4) correspond to 3NL L3, middle levels (L5-L9) to 3NL L2, and upper levels (L10-L13 + Meta) to 3NL L1.

## Technical Details

### Level 1: Strategic (Public Interface)

The outermost level visible to external consumers and high-level orchestration. L1 components define the platform's capabilities without exposing implementation mechanics.

| Component | L1 Manifestation | Example |
|-----------|-----------------|---------|
| **API** | [REST](@/glossary/rest-api.md) and [GraphQL](@/glossary/graphql.md) endpoints | `POST /api/v1/perimeter/discover` |
| **Agents** | Command interfaces | `/archer-supreme`, `/orchestrate` |
| **Dashboard** | [LiveView](@/glossary/liveview.md) pages | `/perimeter`, `/perimeter/assets` |
| **Quality** | Score display, grade output | Quality 100/100, 13/13 domains |
| **Integration** | External system adapters | [OpenAPI](@/glossary/openapi.md) spec, webhook endpoints |

### Level 2: Tactical (Internal Coordination)

The middle level handling coordination between platform components. L2 defines the protocols and patterns through which L1 capabilities are assembled from L3 primitives.

| Component | L2 Manifestation | Example |
|-----------|-----------------|---------|
| **Communication** | Inter-app messaging, [PubSub](@/glossary/pubsub.md) | Agent-to-agent event routing |
| **Pipelines** | [Data pipeline](@/glossary/data-pipeline.md) orchestration | OSINT source aggregation flow |
| **Quality** | Gate enforcement, QDP tracking | `mix quality.gates` pipeline |
| **Coordination** | [Domain-Driven Design](@/glossary/domain-driven-design.md) boundaries | [Bounded Context](@/glossary/bounded-context.md) protocols |
| **Evolution** | Autoevolve and autoheal cycles | `mix autoevolve.scan` |

### Level 3: Operational (Implementation)

The innermost level containing implementation details. L3 is where the actual work happens, using OTP primitives, storage operations, and BEAM capabilities.

| Component | L3 Manifestation | Example |
|-----------|-----------------|---------|
| **Processes** | GenServers, [Supervisors](@/glossary/supervisor.md), Tasks | Agent runtime processes |
| **Storage** | [Adapter pattern](@/glossary/adapter-pattern.md) implementations | ETS, Ecto, Meilisearch backends |
| **BEAM** | Process scheduling, message passing | [Message Passing](@/glossary/message-passing.md) |
| **Memory** | ETS tables, process heaps | O(1) pattern detection caches |
| **System** | OS interaction, file I/O, networking | Certificate transparency log queries |

### Integration Matrix

The following matrix shows how major platform subsystems manifest at each 3NL level:

| Subsystem | L1 (Strategic) | L2 (Tactical) | L3 (Operational) |
|-----------|----------------|----------------|-------------------|
| **Agents** | Command interface | Agent coordination | GenServer state |
| **Quality** | Quality score API | Gate pipeline | Credo/Dialyzer checks |
| **Storage** | Query API | [Adapter](@/glossary/adapter-pattern.md) routing | ETS/Ecto operations |
| **NABLA** | Confidence output | Axiom evaluation | Signal processing |
| **Perimeter** | EASM dashboard | Scanner orchestration | DNS/TLS probing |
| **Security** | Rating display (A-F) | [Color team](@/glossary/color-teams.md) coordination | Individual agent checks |
| **Evolution** | Status reporting | Evolution pipeline | Mutation/selection ops |

## Implementation in Prismatic Platform

3NL boundaries are enforced through Elixir's module system and architectural conventions. Each umbrella application follows a consistent pattern where the top-level module serves as the L1 facade, internal coordination modules handle L2 orchestration, and implementation modules operate at L3:

```elixir
# L1: Public facade -- the ONLY module external consumers call
defmodule PrismaticPerimeter do
  @moduledoc "L1 Strategic API for External Attack Surface Management."

  @spec discover(String.t()) :: {:ok, [map()]} | {:error, atom()}
  defdelegate discover(domain), to: PrismaticPerimeter.Orchestrator

  @spec security_rating(String.t()) :: {:ok, map()} | {:error, atom()}
  defdelegate security_rating(domain), to: PrismaticPerimeter.Rating.Calculator
end

# L2: Internal coordination -- coordinates L3 components
defmodule PrismaticPerimeter.Orchestrator do
  @moduledoc "L2 Tactical orchestration for discovery pipeline."
  use GenServer

  def discover(domain) do
    # Coordinates multiple L3 scanners
    with {:ok, dns} <- Scanner.DNS.scan(domain),
         {:ok, tls} <- Scanner.TLS.scan(domain),
         {:ok, ports} <- Scanner.Port.scan(domain) do
      {:ok, merge_results(dns, tls, ports)}
    end
  end
end

# L3: Implementation -- actual scanning logic
defmodule PrismaticPerimeter.Scanner.DNS do
  @moduledoc "L3 Operational DNS scanning implementation."

  @spec scan(String.t()) :: {:ok, [map()]} | {:error, atom()}
  def scan(domain) do
    # Direct DNS resolution, zone transfer attempts, etc.
    with {:ok, records} <- resolve_records(domain),
         {:ok, subdomains} <- enumerate_subdomains(domain) do
      {:ok, records ++ subdomains}
    end
  end
end
```

The AIAD agent standard follows 3NL structure. Every agent specification declares its level and the interfaces it exposes at each level:

```elixir
# Agent following 3NL structure
defmodule PrismaticAgents.PerimeterScanner do
  @moduledoc """
  L1: Command interface via /perimeter-scan
  L2: Coordinates with other security agents via PubSub
  L3: Implements scanning logic using GenServer state
  """
  use PrismaticAgents.Agent,
    tier: :l2,
    command: "/perimeter-scan",
    domain: :security

  # L1: Public command handler
  @impl true
  def handle_command("/perimeter-scan", args, state) do
    {:ok, initiate_scan(args, state)}
  end

  # L2: Inter-agent coordination
  @impl true
  def handle_info({:agent_event, :vulnerability_found, data}, state) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "security:findings", data)
    {:noreply, update_state(state, data)}
  end
end
```

## Comparison with Alternatives

| Architecture | Layers | Enforcement | Flexibility | Prismatic Fit |
|-------------|--------|-------------|-------------|---------------|
| **3NL** | 3 (Strategic/Tactical/Operational) | Module system + conventions | High within levels | Purpose-built |
| **Hexagonal** | 2 (Core + Ports/Adapters) | Port interfaces | High | Good for storage layer |
| **Clean Architecture** | 4 (Entity/Use Case/Interface/Framework) | Dependency rule | Medium | Overly granular for OTP |
| **Onion Architecture** | 4+ (Core/Domain/Application/Infrastructure) | Inward dependencies | Medium | Similar to Clean |
| **N-Tier** | N (typically 3: Presentation/Business/Data) | Deployment boundaries | Low | Too infrastructure-focused |
| **Microservices** | Per service | Service boundaries | Very High | Against OTP philosophy |

The key advantage of 3NL over alternatives is its alignment with OTP's natural process hierarchy. A GenServer (L3) is supervised by a Supervisor (L2-L3 boundary), which is started by an Application (L1-L2 boundary). 3NL codifies what OTP already encourages rather than imposing an alien structure.

## Best Practices

**Dependency Direction**: Dependencies must flow inward (L1 depends on L2 depends on L3, never reverse). An L3 module must never import or call an L1 module directly. If L3 needs to notify L1, it emits an event through L2's PubSub coordination layer.

**Single Level Crossing**: Components should only communicate with adjacent levels. An L1 facade should delegate to L2 coordinators, not reach directly into L3 implementations. This ensures that L3 can be freely refactored without breaking L1 contracts.

**Interface Stability**: L1 interfaces change rarely and follow semantic versioning. L2 protocols evolve with coordination requirements. L3 implementations can change freely as long as L2 contracts are maintained. This graduated stability enables rapid iteration where it matters (implementation) with stability where it is needed (public interfaces).

**Level-Appropriate Abstraction**: Each level uses vocabulary appropriate to its concerns. L1 speaks in domain terms ("discover attack surface", "assess compliance"). L2 speaks in coordination terms ("route to scanner", "aggregate results"). L3 speaks in implementation terms ("resolve DNS record", "parse TLS certificate").

**Encapsulation**: Each level hides complexity from the level above. An L1 consumer does not know whether L3 uses ETS or PostgreSQL for storage. An L2 coordinator does not know the specific DNS resolution algorithm used by L3.

## Use Cases

**New Application Design**: When adding a new umbrella application, the developer first defines the L1 public facade (what capabilities does this app expose?), then designs the L2 coordination layer (how does it interact with other apps?), and finally implements L3 (what OTP processes and storage does it need?). This top-down approach ensures the application's external contract is designed before implementation details are considered.

**Quality Enforcement**: The quality infrastructure operates across all three levels. L1 exposes quality scores through the dashboard and API. L2 coordinates quality gate execution across applications. L3 runs individual checks (Credo, Dialyzer, coverage). This separation means that adding a new L3 quality check requires no changes to L1 or L2.

**Agent Development**: Every AIAD agent follows 3NL. The agent's command interface (L1) is defined in its `.agent.md` specification. Its coordination with other agents (L2) uses PubSub and event protocols. Its internal logic (L3) uses GenServer state and OTP primitives.

**Storage Migration**: When migrating from one storage backend to another (e.g., ETS to Ecto for a specific domain), only L3 adapter code changes. L2 routing configuration points to the new adapter. L1 consumers experience zero changes. This isolation has been exercised repeatedly across the platform's multi-adapter storage architecture.

## Related Concepts

- [Three-NL](@/glossary/three-nl.md) - Full name of the Three Nested Levels framework
- [PVM](@/glossary/pvm.md) - Platform Virtual Machine organized by 3NL
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework at 3NL Level 3 integration
- [Bounded Context](@/glossary/bounded-context.md) - Domain boundaries aligned with 3NL levels
- [Adapter Pattern](@/glossary/adapter-pattern.md) - L3 pattern for pluggable implementations
- [Supervisor](@/glossary/supervisor.md) - OTP primitive at L3 providing process management
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) - Knowledge processing organized by 3NL
- [Domain-Driven Design](@/glossary/domain-driven-design.md) - Design methodology complementing 3NL
- [AIAD](@/glossary/aiad.md) - Agent standard following 3NL structure
- [REST API](@/glossary/rest-api.md) - L1 interface pattern for external access

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)