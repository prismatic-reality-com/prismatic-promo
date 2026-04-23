+++
title = "Domain Specialization"
description = "Domain Specialization - the architectural pattern of organizing software systems into focused, bounded domains with specialized agents, modules, and processes that possess deep expertise in their specific area of concern, enabling scalable and maintainable platform engineering."
weight = 50

[extra]
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "architecture-design"
related_concepts = ["bounded context", "domain-driven design", "agent tiers", "supervision trees", "modularity", "separation of concerns", "microservices"]
implementation_status = "production"
authority_level = "L3-strategic"
prerequisites = ["software architecture fundamentals", "domain-driven design basics", "Elixir/OTP concepts", "agent-based systems"]
learning_path = ["architecture fundamentals", "domain-driven design", "bounded contexts", "agent specialization", "platform domain architecture"]
interactive_demos = false
code_examples = true
external_resources = ["https://martinfowler.com/bliki/BoundedContext.html", "https://hexdocs.pm/elixir/GenServer.html", "https://www.domainlanguage.com/ddd/"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["domain boundary enforcement", "cross-domain communication validation", "agent specialization verification", "domain isolation testing"]
keywords = ["domain specialization", "bounded context", "domain-driven design", "agent domains", "separation of concerns", "modular architecture", "domain experts", "vertical slicing"]
tags = ["architecture", "design-patterns", "domain-driven-design", "agent-systems", "platform", "core"]
related_terms = ["domain-driven-design", "bounded-context", "agent", "modularity", "supervision-tree", "microservices", "composability", "adapter-pattern", "umbrella-application", "architecture"]
date_created = "2026-02-22"
word_count = 1902
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Domain Specialization - Prismatic Platform"
+++

## Definition

**Domain Specialization** is an architectural pattern and design philosophy in which software systems are organized into focused, bounded domains where each domain possesses deep expertise and specialized capabilities within its area of concern. Rather than building monolithic systems with broad but shallow capabilities, domain specialization advocates for creating distinct subsystems -- each with its own agents, data models, business rules, and operational characteristics -- that collectively compose into a comprehensive platform through well-defined interfaces and communication protocols.

In the context of the Prismatic Platform, domain specialization manifests as the 115-app umbrella architecture where each application owns a specific domain (security, intelligence, storage, web, quality, agents, and so on), and within the AIAD agent framework where 530+ agents are organized into hierarchical tiers with explicit domain boundaries. This pattern is deeply rooted in both Domain-Driven Design (DDD) principles and the Erlang/OTP tradition of building systems from small, focused, fault-isolated processes.

## Overview

The concept of domain specialization emerges from the recognition that complex systems cannot be effectively managed, evolved, or reasoned about as undifferentiated wholes. As systems grow in scope and complexity, the cognitive load required to understand, modify, and debug them exceeds human capacity. Domain specialization addresses this by decomposing the system along natural domain boundaries, creating subsystems that can be understood, developed, and deployed independently.

Domain specialization operates at multiple levels of granularity:

**Strategic Level**: The platform is divided into major domains such as security (Prismatic Perimeter), intelligence (OSINT toolbox), web presentation (Prismatic Web), storage (Prismatic Storage), and quality (quality gates and DNA). Each domain has its own strategic objectives, quality metrics, and evolution path.

**Tactical Level**: Within each domain, components are further specialized. For example, the security domain contains sub-domains for asset discovery, vulnerability assessment, compliance checking, and security rating. Each sub-domain has its own bounded context with explicit data models and business rules.

**Operational Level**: At the finest granularity, individual agents and processes are specialized for specific tasks. An L4 specialist agent handles a single concern (such as DNS enumeration or CVE lookup), while L3 strategic commanders coordinate multiple specialists within their domain.

The key principles underlying domain specialization include:

1. **Deep over Broad**: A specialized component that deeply understands its domain is more valuable than a generic component with superficial capabilities across many domains.

2. **Explicit Boundaries**: Domain boundaries must be explicitly defined through interfaces, protocols, and contracts -- never implicit or assumed.

3. **Independent Evolution**: Domains should be able to evolve independently, with changes in one domain not requiring cascading changes in others.

4. **Domain-Specific Languages**: Each domain may develop its own vocabulary, abstractions, and patterns that optimize for clarity within that domain.

5. **Ownership and Accountability**: Each domain has clear ownership, whether by a team, an agent tier, or an automated system.

## Technical Details

Domain specialization in Elixir/OTP has a particularly natural expression thanks to the language's process model, supervision trees, and umbrella application structure. Each domain can be implemented as an independent OTP application with its own supervision tree, configuration, and release profile.

### Domain Boundary Definition

```elixir
defmodule Prismatic.Domain do
  @moduledoc """
  Defines the structure and contract for a specialized domain
  within the Prismatic Platform.

  Each domain declares its capabilities, dependencies,
  and communication interfaces.
  """

  @type domain_spec :: %{
    name: atom(),
    description: String.t(),
    capabilities: [atom()],
    dependencies: [atom()],
    public_api: module(),
    event_types: [atom()],
    health_checks: [module()]
  }

  @callback domain_spec() :: domain_spec()
  @callback initialize(keyword()) :: {:ok, pid()} | {:error, term()}
  @callback health_check() :: :healthy | {:degraded, String.t()} | {:unhealthy, String.t()}

  defmacro __using__(opts) do
    domain_name = Keyword.fetch!(opts, :name)

    quote do
      @behaviour Prismatic.Domain

      @domain_name unquote(domain_name)

      def domain_name, do: @domain_name

      def __domain__(:name), do: @domain_name
      def __domain__(:module), do: __MODULE__
    end
  end
end
```

### Specialized Domain Implementation

```elixir
defmodule PrismaticPerimeter.Domain do
  @moduledoc """
  Security domain specialization for External Attack Surface Management.

  This domain owns all security-related concerns including asset discovery,
  vulnerability assessment, compliance checking, and security ratings.
  """

  use Prismatic.Domain, name: :security_perimeter

  alias PrismaticPerimeter.{
    AssetDiscovery,
    ComplianceEngine,
    RiskScoring,
    SecurityRating
  }

  @impl Prismatic.Domain
  def domain_spec do
    %{
      name: :security_perimeter,
      description: "External Attack Surface Management and Security Rating",
      capabilities: [
        :asset_discovery,
        :vulnerability_assessment,
        :compliance_checking,
        :security_rating,
        :risk_scoring
      ],
      dependencies: [:prismatic_storage, :prismatic_agents],
      public_api: PrismaticPerimeter,
      event_types: [
        :asset_discovered,
        :vulnerability_found,
        :rating_calculated,
        :compliance_assessed
      ],
      health_checks: [
        PrismaticPerimeter.HealthCheck.Discovery,
        PrismaticPerimeter.HealthCheck.Rating
      ]
    }
  end

  @impl Prismatic.Domain
  def initialize(opts) do
    children = [
      {AssetDiscovery.Supervisor, opts},
      {ComplianceEngine, opts},
      {RiskScoring.Engine, opts},
      {SecurityRating.Calculator, opts}
    ]

    Supervisor.start_link(children,
      strategy: :one_for_one,
      name: __MODULE__.Supervisor
    )
  end

  @impl Prismatic.Domain
  def health_check do
    checks = [
      AssetDiscovery.health_check(),
      ComplianceEngine.health_check(),
      RiskScoring.health_check()
    ]

    case Enum.find(checks, &match?({:unhealthy, _}, &1)) do
      nil ->
        case Enum.find(checks, &match?({:degraded, _}, &1)) do
          nil -> :healthy
          degraded -> degraded
        end

      unhealthy ->
        unhealthy
    end
  end
end
```

### Agent Domain Registry

```elixir
defmodule Prismatic.Agents.DomainRegistry do
  @moduledoc """
  Manages domain specialization for the agent ecosystem.

  Agents register with their domain, and the registry ensures
  that cross-domain communication follows defined protocols.
  """

  use GenServer

  @type agent_registration :: %{
    agent_id: String.t(),
    domain: atom(),
    tier: :l1 | :l2 | :l3 | :l4 | :l5,
    capabilities: [atom()],
    registered_at: DateTime.t()
  }

  defstruct registrations: %{}, domain_index: %{}, capability_index: %{}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec register_agent(String.t(), atom(), keyword()) :: :ok | {:error, term()}
  def register_agent(agent_id, domain, opts \\ []) do
    GenServer.call(__MODULE__, {:register, agent_id, domain, opts})
  end

  @spec find_specialist(atom(), atom()) :: {:ok, [agent_registration()]} | {:error, :not_found}
  def find_specialist(domain, capability) do
    GenServer.call(__MODULE__, {:find_specialist, domain, capability})
  end

  @spec domain_agents(atom()) :: [agent_registration()]
  def domain_agents(domain) do
    GenServer.call(__MODULE__, {:domain_agents, domain})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end

  @impl GenServer
  def handle_call({:register, agent_id, domain, opts}, _from, state) do
    registration = %{
      agent_id: agent_id,
      domain: domain,
      tier: Keyword.get(opts, :tier, :l1),
      capabilities: Keyword.get(opts, :capabilities, []),
      registered_at: DateTime.utc_now()
    }

    new_state =
      state
      |> put_in([Access.key(:registrations), agent_id], registration)
      |> update_domain_index(domain, agent_id)
      |> update_capability_index(registration.capabilities, agent_id)

    {:reply, :ok, new_state}
  end

  @impl GenServer
  def handle_call({:find_specialist, domain, capability}, _from, state) do
    domain_agents = Map.get(state.domain_index, domain, MapSet.new())
    capability_agents = Map.get(state.capability_index, capability, MapSet.new())

    specialists =
      MapSet.intersection(domain_agents, capability_agents)
      |> MapSet.to_list()
      |> Enum.map(&Map.get(state.registrations, &1))
      |> Enum.reject(&is_nil/1)

    case specialists do
      [] -> {:error, :not_found}
      found -> {:ok, found}
    end
    |> then(&{:reply, &1, state})
  end

  @impl GenServer
  def handle_call({:domain_agents, domain}, _from, state) do
    agents =
      state.domain_index
      |> Map.get(domain, MapSet.new())
      |> MapSet.to_list()
      |> Enum.map(&Map.get(state.registrations, &1))
      |> Enum.reject(&is_nil/1)

    {:reply, agents, state}
  end

  defp update_domain_index(state, domain, agent_id) do
    update_in(state, [Access.key(:domain_index)], fn index ->
      Map.update(index, domain, MapSet.new([agent_id]), &MapSet.put(&1, agent_id))
    end)
  end

  defp update_capability_index(state, capabilities, agent_id) do
    Enum.reduce(capabilities, state, fn cap, acc ->
      update_in(acc, [Access.key(:capability_index)], fn index ->
        Map.update(index, cap, MapSet.new([agent_id]), &MapSet.put(&1, agent_id))
      end)
    end)
  end
end
```

### Cross-Domain Communication

Domain specialization requires carefully designed communication patterns between domains. The Prismatic Platform uses event-driven communication to maintain loose coupling:

```elixir
defmodule Prismatic.Domain.EventBus do
  @moduledoc """
  Cross-domain event bus that enables specialized domains
  to communicate without direct coupling.

  Events are typed and validated against the publishing
  domain's declared event_types.
  """

  @spec publish(atom(), atom(), map()) :: :ok | {:error, :unauthorized_event_type}
  def publish(source_domain, event_type, payload) do
    if authorized_event?(source_domain, event_type) do
      :telemetry.execute(
        [:prismatic, :domain, :event],
        %{count: 1},
        %{
          source: source_domain,
          type: event_type,
          payload: payload,
          timestamp: System.monotonic_time()
        }
      )

      Phoenix.PubSub.broadcast(
        Prismatic.PubSub,
        "domain:#{event_type}",
        {:domain_event, source_domain, event_type, payload}
      )
    else
      {:error, :unauthorized_event_type}
    end
  end

  defp authorized_event?(domain, event_type) do
    case Prismatic.Domain.Registry.get_spec(domain) do
      {:ok, spec} -> event_type in spec.event_types
      {:error, _} -> false
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform is one of the most comprehensive implementations of domain specialization in the Elixir ecosystem, with 115 umbrella applications each owning a distinct domain:

**Storage Domain** (`prismatic_storage_*`): Seven specialized storage adapters (ETS, Ecto, Meilisearch, KuzuDB, Redis, and core traits) each optimized for their specific data access patterns. The storage core defines protocols and behaviours that all adapters implement, while each adapter specializes in its storage engine's strengths.

**Agent Domain** (`prismatic_agents`): The AIAD framework organizes 530+ agents into a five-tier hierarchy (L1 operational units through L5 supreme authority) with explicit domain assignments. Each agent is a domain specialist -- an L4 DNS enumeration agent does not attempt to perform compliance checking, and a security rating calculator does not attempt asset discovery.

**Security Domain** (`prismatic_perimeter`): Specializes exclusively in External Attack Surface Management, with sub-domains for asset discovery, vulnerability assessment, NIS2/ZKB compliance, and security rating. The domain boundary is strict: security-related computations happen within this domain and results are communicated via events.

**Quality Domain** (`prismatic_safety`, quality tasks): Specializes in code quality enforcement, including the Quality Floor Guardian, quality DNA tracking, forbidden pattern detection, and the 13-domain quality scoring system. This domain has supreme authority to block commits and merges that violate quality standards.

**Intelligence Domain** (OSINT tools): 120+ specialized adapters across 7 categories (Czech, Global, Sanctions, EU, UK, US, Universal), each deeply specialized in its data source. The Czech ARES adapter understands Czech business registry formats; the Shodan adapter understands internet-wide scanning data.

**Web Domain** (`prismatic_web`): Specializes in LiveView presentation, routing, and user interaction. This domain does not contain business logic -- it delegates to specialized domains through well-defined APIs.

## Comparison

| Characteristic | Domain Specialization | Monolithic | Microservices | Modular Monolith |
|---------------|----------------------|------------|---------------|------------------|
| **Granularity** | Domain-aligned | Single unit | Service-per-function | Module-per-domain |
| **Coupling** | Loose (events) | Tight | Loose (network) | Moderate (internal) |
| **Deployment** | Independent or unified | Single | Independent | Single |
| **Data Ownership** | Domain owns its data | Shared database | Database per service | Schema per module |
| **Expertise Depth** | Deep per domain | Shallow across | Variable | Moderate |
| **Prismatic Model** | Umbrella + AIAD agents | Not used | Inspired by | Primary pattern |

### Domain Specialization vs Generic Agents

| Aspect | Specialized Agents | Generic Agents |
|--------|-------------------|----------------|
| **Accuracy** | High (deep domain knowledge) | Moderate (broad but shallow) |
| **Maintenance** | Focused scope | Everything-everywhere burden |
| **Testing** | Domain-specific scenarios | Combinatorial explosion |
| **Evolution** | Independent improvement | Global regression risk |
| **Prismatic Choice** | 530+ specialized agents | Rejected |

## Best Practices

1. **Define domains by business capability, not technical layer**: Organize around what the system does (security assessment, asset discovery) rather than how it does it (database, HTTP, caching). This aligns with Conway's Law and produces more maintainable systems.

2. **Make domain boundaries explicit and enforced**: Use Elixir behaviours, protocols, and module naming conventions to make boundaries visible and compile-time checked. In the Prismatic Platform, each `apps/prismatic_*` directory represents an explicit domain boundary.

3. **Own your data**: Each domain should own its data models and storage. Cross-domain data access should happen through published APIs or events, never through direct database access. This ensures domains can evolve their storage strategies independently.

4. **Establish a ubiquitous language per domain**: Security speaks of "assets," "vulnerabilities," and "ratings." Quality speaks of "gates," "scores," and "DNA." These vocabularies should be precise within their domain and explicitly translated at domain boundaries.

5. **Use the agent tier hierarchy for specialization depth**: L1 agents handle simple operational tasks, L2 agents handle tactical specialization, L3 agents provide strategic domain coordination, L4 agents are deep specialists, and L5 agents provide supreme cross-domain authority. This hierarchy naturally expresses specialization depth.

6. **Design for independent testability**: Each domain should have its own test suite that can run independently. Domain boundaries should be mockable at the interface level (not at internal implementation details). The Prismatic Platform runs domain-specific test suites in parallel.

7. **Document domain contracts**: Every cross-domain interaction should be documented with its contract, expected behaviour, error conditions, and performance characteristics. Use typespecs and ExUnit contract tests to enforce these contracts.

8. **Evolve domains independently**: When a domain needs to change, it should be possible to make that change without coordinating with other domains (as long as the public API contract is maintained). This is the primary value proposition of domain specialization.

## Common Pitfalls

1. **Premature domain decomposition**: Splitting domains too early, before the problem space is well understood, leads to incorrect boundaries that are expensive to fix. Start with a modular monolith and extract domains as understanding deepens.

2. **Leaky abstractions across boundaries**: When domain internals leak through interfaces (exposing internal data structures, implementation-specific error types, or storage details), the benefits of specialization erode. Enforce clean boundaries through explicit API modules.

3. **Cross-domain data duplication without synchronization**: Domains may need copies of data from other domains, but without proper synchronization (events, eventual consistency), these copies diverge and cause subtle bugs.

4. **Domain too small or too large**: A domain with only one module is probably too granular; a domain with hundreds of modules probably needs further decomposition. Aim for domains that a single developer can understand completely.

5. **Ignoring the domain language**: Using generic programming terms instead of domain-specific vocabulary makes code harder to understand for domain experts and leads to models that do not accurately represent the problem space.

6. **Circular dependencies between domains**: If domain A depends on domain B which depends on domain A, the boundaries are incorrect. Extract the shared concern into a separate domain or redesign the interaction.

7. **Over-specialization leading to fragmentation**: Every specialization decision increases the number of components and the complexity of their interactions. Specialize where it adds value, but do not create domains for trivially simple concerns.

## Use Cases

**AIAD Agent Architecture**: The Prismatic Platform's 530+ agents demonstrate domain specialization at the individual agent level. Each agent is a specialist: the `red-epistemic-attacker` agent specializes in simulating truth distortion attacks, while the `blue-drift-detector` agent specializes in detecting behavioral, configuration, and dependency drift. Neither attempts the other's task.

**Umbrella Application Organization**: The 115-app umbrella structure physically enforces domain boundaries at the filesystem and compilation level. Each app has its own `mix.exs`, dependencies, configuration, and test suite. Cross-app dependencies must be explicitly declared and are checked at compile time.

**OSINT Provider Specialization**: Each of the 120+ OSINT adapters specializes in a single data source. The Czech ARES adapter understands Czech business registry XML formats. The Shodan adapter understands Shodan's JSON API. The WHOIS adapter understands WHOIS protocol variations. This deep specialization enables each adapter to extract maximum intelligence from its source.

**Quality Domain Independence**: The quality domain (gates, DNA, floor guardian) operates independently of all other domains. It can assess, score, and enforce quality standards without depending on the specific implementations being assessed. This independence is essential for the domain's authority.

**Storage Adapter Specialization**: Each storage adapter (ETS, Ecto, Meilisearch, KuzuDB) specializes in its storage engine's strengths. ETS for fast in-memory access, Ecto for relational data with transactions, Meilisearch for full-text search, KuzuDB for graph queries. The storage core defines the contract; adapters specialize the implementation.

## Related Concepts

Domain specialization intersects with many architectural and design concepts in the Prismatic Platform:

- [Domain-Driven Design](/glossary/domain-driven-design/) - The strategic design methodology that provides the theoretical foundation for domain specialization, including bounded contexts and ubiquitous language
- [Bounded Context](/glossary/bounded-context/) - The DDD pattern that defines explicit boundaries around domain models, directly implementing domain specialization at the model level
- [Agent](/glossary/agent/) - Autonomous software entities that embody domain specialization by possessing deep expertise in their assigned domain
- [Modularity](/glossary/modularity/) - The software design principle that enables domain specialization through well-defined interfaces and encapsulation
- [Supervision Tree](/glossary/supervision-tree/) - OTP supervision trees provide the fault isolation that allows specialized domains to fail independently without cascading
- [Microservices](/glossary/microservices/) - An architectural style that takes domain specialization to the deployment level, with each service owning its domain
- [Composability](/glossary/composability/) - The ability to compose specialized domains into larger capabilities through well-defined interfaces
- [Adapter Pattern](/glossary/adapter-pattern/) - Enables domain specialization in storage and external integrations by abstracting implementation details behind domain interfaces
- [Umbrella Application](/glossary/umbrella-application/) - Elixir's umbrella project structure that physically enforces domain boundaries at the application level
- [Architecture](/glossary/architecture/) - Domain specialization is a fundamental architectural decision that shapes the entire platform's structure

## See Also

- [Agent Tier](/glossary/agent-tier/) - The hierarchical organization of agents by specialization depth
- [AIAD](/glossary/aiad/) - The AI Agent Development framework that codifies domain specialization for agents
- [Layered Architecture](/glossary/layered-architecture/) - An alternative decomposition strategy that organizes by technical layer rather than domain
- [CQRS](/glossary/cqrs/) - Command Query Responsibility Segregation, a pattern that applies specialization to read and write operations
- [Event Sourcing](/glossary/event-sourcing/) - A pattern that supports domain specialization by decoupling domain events from their consumers

---

**Built with precision by the Prismatic Platform team.**

[GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
