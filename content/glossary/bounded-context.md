+++
title = "Bounded Context"
weight = 23
[extra]
category = "architecture"
subcategory = "domain-modeling"
description = "Explicit boundary within which a domain model is defined and consistent, enabling context-specific modeling in complex systems"
keywords = ["domain-driven-design", "bounded-context", "context-mapping", "ubiquitous-language", "anti-corruption-layer", "context-boundaries"]
related_terms = ["domain-driven-design", "cqrs", "message-passing", "pubsub", "behaviour", "adapter-pattern", "event-sourcing", "process-isolation"]
complexity = "advanced"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["large-system-decomposition", "team-autonomy", "model-isolation", "context-communication"]
prerequisites = ["domain-driven-design", "elixir-otp", "umbrella-projects", "system-design"]
learning_path = ["domain-modeling", "strategic-ddd", "context-mapping", "tactical-patterns"]
difficulty = "advanced"
time_to_learn = "2-3 weeks"
industry_usage = "high"
pattern_type = "strategic-design"
architecture_layer = "domain"
quality_gates = ["model-consistency", "context-isolation", "interface-clarity"]
testing_approach = ["context-boundary-testing", "integration-testing", "contract-testing"]
monitoring = ["cross-context-communication", "context-health", "boundary-violations"]
scalability = "high"
design_principles = ["model-isolation", "context-autonomy", "explicit-boundaries", "ubiquitous-language"]
communication_patterns = ["published-interface", "anti-corruption-layer", "context-map"]
evolution_support = "high"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1103
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "architecture", "bounded-context", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Bounded Context - Prismatic Platform"
+++

## Definition

A bounded context is a strategic [Domain-Driven Design](/glossary/domain-driven-design/) pattern that defines an explicit boundary around a domain model where all terms, rules, and relationships are internally consistent. Within the boundary, every concept has a precise, unambiguous meaning. Across boundaries, the same word may mean entirely different things -- and this is not a defect but a deliberate design choice that allows each context to model its domain with maximum fidelity without being constrained by the modeling decisions of other contexts. The bounded context is DDD's primary tool for managing complexity in large systems: rather than attempting a single unified model of an entire business (which inevitably becomes an inconsistent compromise), the system is decomposed into contexts that each own their piece of the domain.

The concept addresses a fundamental problem in software design: as systems grow, a single data model becomes a source of coupling and confusion. When the marketing team, the security team, and the infrastructure team all need to refer to a "customer," they mean different things. Marketing's customer has demographics and engagement scores. Security's customer has risk ratings and compliance postures. Infrastructure's customer has resource quotas and billing tiers. A bounded context allows each team (and each subsystem) to model "customer" as they understand it, with communication between contexts happening through well-defined interfaces rather than shared internal models.

In the Prismatic Platform, each umbrella app functions as a bounded context. The `prismatic_perimeter` context defines "asset" as an external attack surface element (a domain, IP address, certificate, or service exposed to the internet), while `prismatic_storage_core` defines it as a storable entity conforming to the `Storable` trait. These are not competing definitions -- they are context-appropriate definitions. Communication between these contexts flows through Elixir [protocols](/glossary/plug/) and [behaviours](/glossary/behaviour/) defined in `prismatic_storage_core`, which acts as the shared kernel providing traits and contracts without imposing domain-specific semantics.

## Context Boundaries in the Prismatic Platform

### Umbrella Apps as Bounded Contexts

The Prismatic Platform's 90+ umbrella apps map directly to bounded contexts. Each app has:

- **Its own `mix.exs`**: Declaring explicit dependencies on other contexts
- **Its own namespace**: `PrismaticPerimeter.*`, `PrismaticAgents.*`, `PrismaticSafety.*`
- **Its own `CLAUDE.md`**: Documenting the context's ubiquitous language and responsibilities
- **Its own tests**: Verifying context-internal behavior independently
- **Its own quality DNA**: Tracking quality metrics within the context boundary

| Context (App) | Domain | Core Entities | Ubiquitous Language |
|--------------|--------|---------------|---------------------|
| `prismatic_perimeter` | EASM | Asset, SecurityRating, ComplianceAssessment | "discover," "assess," "rate" |
| `prismatic_agents` | Agent Management | Agent, Tier, Mission, Capability | "deploy," "execute," "evolve" |
| `prismatic_safety` | Quality Enforcement | QualityGate, Violation, HealingCycle | "enforce," "detect," "heal" |
| `prismatic_storage_core` | Storage Contracts | Trait, Protocol, Behaviour | "store," "retrieve," "adapt" |
| `prismatic_storage_ets` | ETS Storage | Table, Cache, TTL | "cache," "lookup," "expire" |
| `prismatic_storage_ecto` | Database Storage | Repo, Migration, Changeset | "persist," "query," "migrate" |
| `prismatic_claude` | Session Intelligence | StackFrame, SessionLifecycle | "push," "pop," "checkpoint" |
| `prismatic_web` | User Interface | LiveView, Component, Route | "render," "navigate," "interact" |
| `prismatic_api` | API Gateway | Endpoint, Dispatch, Schema | "discover," "route," "dispatch" |

### Model Isolation in Practice

The same concept modeled differently across contexts:

```elixir
# In prismatic_perimeter: Asset is an attack surface element
defmodule PrismaticPerimeter.Domain.Asset do
  defstruct [
    :id, :type, :value, :risk_score,
    :first_discovered, :last_seen, :confidence,
    :vulnerabilities, :services
  ]
end

# In prismatic_storage_core: Asset is a storable entity
defmodule PrismaticStorageCore.Traits.Storable do
  @callback store(entity :: term()) :: {:ok, term()} | {:error, term()}
  @callback retrieve(id :: term()) :: {:ok, term()} | {:error, :not_found}
  @callback delete(id :: term()) :: :ok | {:error, term()}
end

# In prismatic_agents: Asset is not a concept at all
# Agents have Missions, Capabilities, and Tiers -- different domain
```

This isolation ensures that changes to how `prismatic_perimeter` models assets cannot accidentally break `prismatic_storage_core` or `prismatic_agents`, because they do not share an internal model.

## Context Communication Patterns

### Published Interface

Each bounded context exposes a public API -- its published interface -- through a facade module. Internal implementation details are hidden behind this interface.

```elixir
# prismatic_perimeter's public interface
defmodule PrismaticPerimeter do
  @moduledoc "Public facade for the EASM bounded context."

  @spec discover(String.t()) :: {:ok, AttackSurface.t()} | {:error, term()}
  def discover(domain), do: PrismaticPerimeter.Discovery.execute(domain)

  @spec security_rating(String.t()) :: {:ok, SecurityRating.t()} | {:error, term()}
  def security_rating(domain), do: PrismaticPerimeter.Rating.calculate(domain)

  @spec assess_compliance(String.t(), [atom()]) :: {:ok, Assessment.t()} | {:error, term()}
  def assess_compliance(domain, frameworks), do: PrismaticPerimeter.Compliance.assess(domain, frameworks)
end
```

### Cross-Context Communication via PubSub

Contexts communicate through [PubSub](/glossary/pubsub/) events rather than direct function calls, maintaining loose coupling:

```elixir
# prismatic_perimeter publishes an event when a rating changes
defmodule PrismaticPerimeter.Events do
  def publish_rating_change(domain, old_rating, new_rating) do
    Phoenix.PubSub.broadcast(
      PrismaticPubSub,
      "perimeter:ratings",
      {:rating_changed, %{
        domain: domain,
        old_grade: old_rating.grade,
        new_grade: new_rating.grade,
        changed_at: DateTime.utc_now()
      }}
    )
  end
end

# prismatic_web subscribes and updates the dashboard
defmodule PrismaticWeb.PerimeterDashboardLive do
  use PrismaticWeb, :live_view

  def mount(_params, _session, socket) do
    Phoenix.PubSub.subscribe(PrismaticPubSub, "perimeter:ratings")
    {:ok, assign(socket, ratings: load_current_ratings())}
  end

  def handle_info({:rating_changed, event}, socket) do
    {:noreply, update(socket, :ratings, &update_rating(&1, event))}
  end
end
```

### Anti-Corruption Layer

When consuming data from external systems (OSINT providers, third-party APIs), the platform uses anti-corruption layers to translate external models into the bounded context's internal model:

| External Source | External Model | Internal Model | Translation |
|----------------|---------------|----------------|-------------|
| [Shodan](/glossary/shodan/) | Shodan host record | `PrismaticPerimeter.Domain.Asset` | `ShodanAdapter.to_asset/1` |
| [Censys](/glossary/censys/) | Censys certificate | `PrismaticPerimeter.Domain.Certificate` | `CensysAdapter.to_certificate/1` |
| NIS2 regulation | Compliance framework spec | `PrismaticPerimeter.Domain.ComplianceFramework` | `NIS2Adapter.to_framework/1` |

```elixir
# Anti-corruption layer: translate Shodan response to internal model
defmodule PrismaticPerimeter.Adapters.ShodanAdapter do
  @behaviour PrismaticPerimeter.Ports.OsintProvider

  def to_asset(%{"ip_str" => ip, "ports" => ports, "hostnames" => hosts} = raw) do
    %PrismaticPerimeter.Domain.Asset{
      id: generate_asset_id(ip),
      type: :ip_address,
      value: ip,
      services: Enum.map(ports, &to_service/1),
      first_discovered: DateTime.utc_now(),
      confidence: calculate_confidence(raw)
    }
  end
end
```

## Context Mapping Patterns

DDD defines several relationship patterns between bounded contexts:

### Shared Kernel

A small, explicitly shared subset of the domain model that multiple contexts depend on. Changes to the shared kernel require agreement from all consuming contexts.

```
prismatic_storage_core (Shared Kernel)
    |
    +---> prismatic_storage_ets (implements traits)
    |
    +---> prismatic_storage_ecto (implements traits)
    |
    +---> prismatic_storage_meilisearch (implements traits)
    |
    +---> prismatic_storage_kuzudb (implements traits)
```

### Customer-Supplier

One context (supplier) provides data that another (customer) depends on. The supplier prioritizes the customer's needs in its interface design.

```
prismatic_perimeter (Supplier)
    |
    +---> prismatic_web (Customer: needs rating data for dashboard)
    |
    +---> prismatic_api (Customer: needs rating data for REST API)
```

### Separate Ways

Contexts with no integration needs operate independently. In the Prismatic Platform, utility apps like `prismatic_utils` and `prismatic_telemetry` operate largely independently of domain-specific contexts.

## Evolution and Refactoring

Bounded contexts are not fixed at design time -- they evolve as understanding of the domain deepens. The platform has undergone several context splits and merges through its 18 generations of evolution:

| Generation | Context Change | Motivation |
|------------|---------------|------------|
| Gen 3 | Split `prismatic` into `prismatic` + `prismatic_web` | Separate API from UI concerns |
| Gen 7 | Extract `prismatic_storage_core` from `prismatic_storage` | Isolate traits from implementations |
| Gen 12 | Create `prismatic_perimeter` | New EASM domain required dedicated context |
| Gen 15 | Create `prismatic_claude` | Session intelligence needed own domain model |
| Gen 17 | Create `prismatic_api` | Auto-introspecting API warranted dedicated context |

Each split follows a pattern: when a single context starts containing concepts with divergent lifecycles or different teams of stakeholders, it is a signal that two bounded contexts are masquerading as one.

## Process Isolation as Context Enforcement

[Process isolation](/glossary/process-isolation/) in the [BEAM](/glossary/beam/) virtual machine provides a runtime enforcement mechanism for bounded context boundaries. Each context's processes run in isolation -- a crash in `prismatic_perimeter` cannot corrupt the state of `prismatic_agents`, because they are separate OTP applications with separate supervision trees.

This is stronger than what most programming environments offer. In a typical microservices architecture, context boundaries are enforced by network calls (which can be bypassed with shared databases). In the BEAM, context boundaries are enforced by the VM itself -- processes cannot access each other's memory, and [message passing](/glossary/message-passing/) is the only communication mechanism.

## Advanced Context Design Patterns

### Hexagonal Architecture Within Contexts

Each bounded context in the Prismatic Platform follows hexagonal architecture (ports and adapters) to maintain clean boundaries between domain logic and technical concerns:

```elixir
defmodule PrismaticPerimeter.Architecture do
  @moduledoc """
  Hexagonal architecture implementation within the EASM bounded context.

  Domain Core (hexagon center):
  - Domain models: Asset, SecurityRating, ComplianceAssessment
  - Domain services: RatingCalculator, ComplianceAnalyzer
  - Domain events: AssetDiscovered, RatingChanged, ComplianceUpdated

  Ports (hexagon edges):
  - Primary ports: AssetDiscovery, SecurityRating, ComplianceAssessment
  - Secondary ports: OsintProvider, NotificationService, StorageRepository

  Adapters (outside hexagon):
  - Primary adapters: REST API controllers, GraphQL resolvers
  - Secondary adapters: Shodan, Censys, Ecto repositories, email services
  """

  # Primary port - what the context offers to the outside world
  defmodule Ports.AssetDiscovery do
    @moduledoc "Port for external asset discovery operations."

    @callback discover_assets(String.t()) :: {:ok, [Asset.t()]} | {:error, term()}
    @callback track_asset_changes(Asset.t()) :: :ok | {:error, term()}
    @callback get_discovery_status(String.t()) :: {:ok, DiscoveryStatus.t()} | {:error, term()}
  end

  # Secondary port - what the context needs from external systems
  defmodule Ports.OsintProvider do
    @moduledoc "Port for OSINT data sources."

    @callback search_hosts(String.t()) :: {:ok, [HostData.t()]} | {:error, term()}
    @callback get_certificates(String.t()) :: {:ok, [CertificateData.t()]} | {:error, term()}
    @callback enumerate_services(String.t()) :: {:ok, [ServiceData.t()]} | {:error, term()}
  end

  # Domain service - pure business logic
  defmodule Domain.AssetDiscoveryService do
    @moduledoc "Core domain service for asset discovery logic."

    alias PrismaticPerimeter.Domain.{Asset, DiscoveryContext, RiskAnalyzer}

    @spec discover_and_analyze(String.t(), DiscoveryContext.t()) ::
            {:ok, [Asset.t()]} | {:error, term()}
    def discover_and_analyze(target, context) do
      with {:ok, raw_assets} <- gather_raw_assets(target, context),
           {:ok, analyzed_assets} <- analyze_assets(raw_assets, context),
           {:ok, risk_assessed} <- assess_risks(analyzed_assets, context) do
        {:ok, risk_assessed}
      end
    end

    defp gather_raw_assets(target, context) do
      # Coordinate multiple OSINT providers through ports
      providers = context.enabled_providers

      results = Enum.map(providers, fn provider ->
        Task.async(fn ->
          provider.search_hosts(target)
        end)
      end)
      |> Task.await_many(30_000)

      # Aggregate results while maintaining provenance
      assets = results
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.flat_map(fn {:ok, data} -> data end)
      |> deduplicate_assets()

      {:ok, assets}
    end

    defp analyze_assets(assets, context) do
      analyzed = Enum.map(assets, fn asset ->
        %Asset{asset |
          risk_score: RiskAnalyzer.calculate_risk(asset, context.risk_model),
          confidence: calculate_confidence(asset),
          analyzed_at: DateTime.utc_now()
        }
      end)

      {:ok, analyzed}
    end
  end

  # Primary adapter - REST API
  defmodule Adapters.RestApi do
    @moduledoc "REST API adapter for the EASM context."

    use PrismaticApi.Controller
    alias PrismaticPerimeter.Ports.AssetDiscovery

    @impl true
    def discover(conn, %{"target" => target}) do
      case AssetDiscovery.discover_assets(target) do
        {:ok, assets} ->
          conn
          |> put_status(:ok)
          |> json(%{
            status: "success",
            target: target,
            assets_discovered: length(assets),
            assets: serialize_assets(assets)
          })

        {:error, reason} ->
          conn
          |> put_status(:unprocessable_entity)
          |> json(%{status: "error", reason: inspect(reason)})
      end
    end

    defp serialize_assets(assets) do
      Enum.map(assets, &serialize_asset/1)
    end

    defp serialize_asset(asset) do
      %{
        id: asset.id,
        type: asset.type,
        value: asset.value,
        risk_score: asset.risk_score,
        confidence: asset.confidence,
        discovered_at: asset.first_discovered,
        services: serialize_services(asset.services)
      }
    end
  end

  # Secondary adapter - Shodan integration
  defmodule Adapters.ShodanProvider do
    @moduledoc "Shodan OSINT provider adapter."

    @behaviour PrismaticPerimeter.Ports.OsintProvider

    alias PrismaticPerimeter.External.ShodanClient

    @impl true
    def search_hosts(target) do
      with {:ok, response} <- ShodanClient.search(target),
           {:ok, normalized} <- normalize_shodan_response(response) do
        {:ok, normalized}
      end
    end

    defp normalize_shodan_response(%{"matches" => matches}) do
      hosts = Enum.map(matches, &normalize_shodan_host/1)
      {:ok, hosts}
    end

    defp normalize_shodan_host(shodan_host) do
      # Anti-corruption layer: translate Shodan's model to our domain model
      %PrismaticPerimeter.Domain.HostData{
        ip_address: shodan_host["ip_str"],
        port: shodan_host["port"],
        protocol: shodan_host["transport"],
        service: shodan_host["product"],
        version: shodan_host["version"],
        banner: shodan_host["data"],
        country: get_in(shodan_host, ["location", "country_code"]),
        organization: shodan_host["org"],
        asn: shodan_host["asn"],
        hostnames: shodan_host["hostnames"] || [],
        timestamp: parse_shodan_timestamp(shodan_host["timestamp"])
      }
    end
  end
end
```

### Context Event Sourcing

Bounded contexts in the Prismatic Platform use event sourcing to maintain audit trails and enable temporal queries:

```elixir
defmodule PrismaticPerimeter.EventSourcing do
  @moduledoc """
  Event sourcing implementation for the EASM bounded context.

  All state changes are captured as domain events, providing:
  - Complete audit trail of all operations
  - Ability to replay state at any point in time
  - Support for event-driven communication with other contexts
  - Basis for CQRS read model projections
  """

  # Domain events
  defmodule Events.AssetDiscovered do
    @derive Jason.Encoder
    defstruct [
      :asset_id, :domain, :asset_type, :asset_data,
      :discovery_method, :confidence, :discovered_at,
      :event_id, :event_version, :correlation_id
    ]
  end

  defmodule Events.SecurityRatingChanged do
    @derive Jason.Encoder
    defstruct [
      :asset_id, :domain, :old_rating, :new_rating,
      :rating_factors, :calculated_at, :changed_by,
      :event_id, :event_version, :correlation_id
    ]
  end

  defmodule Events.ComplianceViolationDetected do
    @derive Jason.Encoder
    defstruct [
      :asset_id, :framework, :violation_type, :severity,
      :requirement, :evidence, :detected_at,
      :event_id, :event_version, :correlation_id
    ]
  end

  # Event store
  defmodule EventStore do
    @moduledoc "Event storage and retrieval for the EASM context."

    use GenServer

    def start_link(opts) do
      GenServer.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @spec append_event(String.t(), term()) :: :ok | {:error, term()}
    def append_event(stream_id, event) do
      GenServer.call(__MODULE__, {:append_event, stream_id, event})
    end

    @spec read_events(String.t(), non_neg_integer()) :: {:ok, [term()]} | {:error, term()}
    def read_events(stream_id, from_version \\ 0) do
      GenServer.call(__MODULE__, {:read_events, stream_id, from_version})
    end

    @spec read_all_events(DateTime.t()) :: {:ok, [term()]} | {:error, term()}
    def read_all_events(from_timestamp) do
      GenServer.call(__MODULE__, {:read_all_events, from_timestamp})
    end

    def init(opts) do
      storage_adapter = Keyword.get(opts, :storage, :ets)

      state = case storage_adapter do
        :ets ->
          table = :ets.new(:event_store, [:ordered_set, :public, :named_table])
          %{adapter: :ets, table: table}
        :postgres ->
          %{adapter: :postgres, repo: PrismaticStorage.Repo}
      end

      {:ok, state}
    end

    def handle_call({:append_event, stream_id, event}, _from, state) do
      event_with_metadata = add_event_metadata(event, stream_id)

      case store_event(event_with_metadata, stream_id, state) do
        :ok ->
          publish_event(event_with_metadata)
          {:reply, :ok, state}
        error ->
          {:reply, error, state}
      end
    end

    def handle_call({:read_events, stream_id, from_version}, _from, state) do
      events = retrieve_events(stream_id, from_version, state)
      {:reply, {:ok, events}, state}
    end

    defp add_event_metadata(event, stream_id) do
      %{event |
        event_id: generate_event_id(),
        event_version: get_next_version(stream_id),
        correlation_id: get_correlation_id()
      }
    end

    defp publish_event(event) do
      # Publish to PubSub for other contexts to consume
      Phoenix.PubSub.broadcast(
        PrismaticPubSub,
        "easm:events",
        {:domain_event, event}
      )

      # Also publish specific event types
      event_type = event.__struct__ |> Module.split() |> List.last()
      Phoenix.PubSub.broadcast(
        PrismaticPubSub,
        "easm:#{event_type}",
        {:domain_event, event}
      )
    end
  end

  # Event-sourced aggregate
  defmodule Domain.AssetAggregate do
    @moduledoc "Event-sourced aggregate for EASM assets."

    defstruct [
      :id, :current_state, :version, :uncommitted_events
    ]

    def new(id) do
      %__MODULE__{
        id: id,
        current_state: %{},
        version: 0,
        uncommitted_events: []
      }
    end

    def load_from_history(id, events) do
      Enum.reduce(events, new(id), fn event, aggregate ->
        apply_event(aggregate, event)
      end)
    end

    def discover_asset(aggregate, asset_data, discovery_context) do
      event = %Events.AssetDiscovered{
        asset_id: aggregate.id,
        domain: asset_data.domain,
        asset_type: asset_data.type,
        asset_data: asset_data,
        discovery_method: discovery_context.method,
        confidence: asset_data.confidence,
        discovered_at: DateTime.utc_now()
      }

      add_event(aggregate, event)
    end

    def update_security_rating(aggregate, new_rating, rating_factors) do
      current_rating = get_in(aggregate.current_state, [:security_rating])

      if current_rating != new_rating do
        event = %Events.SecurityRatingChanged{
          asset_id: aggregate.id,
          domain: aggregate.current_state.domain,
          old_rating: current_rating,
          new_rating: new_rating,
          rating_factors: rating_factors,
          calculated_at: DateTime.utc_now()
        }

        add_event(aggregate, event)
      else
        aggregate
      end
    end

    defp add_event(aggregate, event) do
      %{aggregate |
        uncommitted_events: [event | aggregate.uncommitted_events]
      }
      |> apply_event(event)
    end

    defp apply_event(aggregate, %Events.AssetDiscovered{} = event) do
      new_state = %{
        domain: event.domain,
        type: event.asset_type,
        data: event.asset_data,
        discovered_at: event.discovered_at,
        confidence: event.confidence
      }

      %{aggregate |
        current_state: new_state,
        version: aggregate.version + 1
      }
    end

    defp apply_event(aggregate, %Events.SecurityRatingChanged{} = event) do
      new_state = Map.put(aggregate.current_state, :security_rating, event.new_rating)

      %{aggregate |
        current_state: new_state,
        version: aggregate.version + 1
      }
    end
  end
end
```

### Context Integration Patterns

Advanced patterns for integrating bounded contexts while maintaining their autonomy:

```elixir
defmodule PrismaticPlatform.ContextIntegration do
  @moduledoc """
  Integration patterns between bounded contexts in the Prismatic Platform.

  Provides infrastructure for:
  - Saga orchestration across contexts
  - Distributed transaction compensation
  - Event-driven process management
  - Cross-context query coordination
  """

  # Saga pattern for cross-context workflows
  defmodule Sagas.ComprehensiveAssessment do
    @moduledoc """
    Saga orchestrating a comprehensive security assessment across multiple contexts.

    Steps:
    1. Perimeter discovers assets
    2. Intelligence analyzes threats
    3. Agents execute targeted scans
    4. Safety validates results
    5. Web updates dashboard
    """

    use GenStateMachine

    def start_link(target_domain) do
      GenStateMachine.start_link(__MODULE__, %{target: target_domain})
    end

    def init(%{target: target}) do
      saga_id = generate_saga_id()

      initial_data = %{
        saga_id: saga_id,
        target: target,
        steps_completed: [],
        compensation_needed: [],
        results: %{}
      }

      {:ok, :started, initial_data, [{:next_event, :internal, :begin_discovery}]}
    end

    def handle_event(:internal, :begin_discovery, :started, data) do
      # Step 1: Discover assets via Perimeter context
      case PrismaticPerimeter.discover(data.target) do
        {:ok, assets} ->
          updated_data = %{data |
            steps_completed: [:discovery | data.steps_completed],
            results: Map.put(data.results, :assets, assets)
          }
          {:next_state, :discovery_complete, updated_data,
           [{:next_event, :internal, :analyze_threats}]}

        {:error, reason} ->
          # Saga fails, no compensation needed yet
          {:next_state, :failed, %{data | failure_reason: reason}}
      end
    end

    def handle_event(:internal, :analyze_threats, :discovery_complete, data) do
      # Step 2: Analyze threats via Intelligence context
      assets = data.results.assets

      case PrismaticIntelligence.analyze_threats(assets) do
        {:ok, threat_analysis} ->
          updated_data = %{data |
            steps_completed: [:threat_analysis | data.steps_completed],
            results: Map.put(data.results, :threats, threat_analysis)
          }
          {:next_state, :threats_analyzed, updated_data,
           [{:next_event, :internal, :execute_scans}]}

        {:error, reason} ->
          # Need to compensate discovery step
          compensate_discovery(data)
          {:next_state, :compensating, %{data |
            failure_reason: reason,
            compensation_needed: [:discovery]
          }}
      end
    end

    def handle_event(:internal, :execute_scans, :threats_analyzed, data) do
      # Step 3: Execute targeted scans via Agents context
      threats = data.results.threats
      high_risk_targets = filter_high_risk_targets(threats)

      case PrismaticAgents.execute_targeted_scans(high_risk_targets) do
        {:ok, scan_results} ->
          updated_data = %{data |
            steps_completed: [:scans | data.steps_completed],
            results: Map.put(data.results, :scans, scan_results)
          }
          {:next_state, :scans_complete, updated_data,
           [{:next_event, :internal, :validate_results}]}

        {:error, reason} ->
          # Compensate previous steps
          compensate_threat_analysis(data)
          compensate_discovery(data)
          {:next_state, :compensating, %{data |
            failure_reason: reason,
            compensation_needed: [:threat_analysis, :discovery]
          }}
      end
    end

    def handle_event(:internal, :validate_results, :scans_complete, data) do
      # Step 4: Validate results via Safety context
      all_results = data.results

      case PrismaticSafety.validate_assessment(all_results) do
        {:ok, validation} ->
          if validation.passed do
            updated_data = %{data |
              steps_completed: [:validation | data.steps_completed],
              results: Map.put(data.results, :validation, validation)
            }
            {:next_state, :validated, updated_data,
             [{:next_event, :internal, :update_dashboard}]}
          else
            # Validation failed, compensate all steps
            compensate_all_steps(data)
            {:next_state, :compensating, %{data |
              failure_reason: :validation_failed,
              compensation_needed: [:scans, :threat_analysis, :discovery]
            }}
          end

        {:error, reason} ->
          compensate_all_steps(data)
          {:next_state, :compensating, %{data |
            failure_reason: reason,
            compensation_needed: [:scans, :threat_analysis, :discovery]
          }}
      end
    end

    def handle_event(:internal, :update_dashboard, :validated, data) do
      # Step 5: Update dashboard via Web context
      case PrismaticWeb.update_assessment_dashboard(data.target, data.results) do
        :ok ->
          # Saga completed successfully
          publish_saga_completion(data)
          {:next_state, :completed, data}

        {:error, reason} ->
          # Dashboard update failed, but we don't compensate for this
          # The assessment is still valid, just not displayed
          Logger.warn("Dashboard update failed for saga #{data.saga_id}: #{inspect(reason)}")
          {:next_state, :completed, data}
      end
    end

    # Compensation functions
    defp compensate_discovery(data) do
      # Remove discovered assets from cache, cancel pending operations
      PrismaticPerimeter.cancel_discovery(data.target)
    end

    defp compensate_threat_analysis(data) do
      # Clear threat analysis cache, cancel analysis jobs
      PrismaticIntelligence.cancel_threat_analysis(data.results.assets)
    end

    defp compensate_all_steps(data) do
      compensate_discovery(data)
      compensate_threat_analysis(data)
      # Scans may have started external processes, need to cancel them
      if Map.has_key?(data.results, :scans) do
        PrismaticAgents.cancel_scans(data.results.scans)
      end
    end
  end

  # Context query coordinator for read operations
  defmodule QueryCoordinator do
    @moduledoc """
    Coordinates queries across multiple bounded contexts for complex read operations.
    """

    @spec get_comprehensive_security_overview(String.t()) :: {:ok, map()} | {:error, term()}
    def get_comprehensive_security_overview(domain) do
      # Parallel queries across contexts
      query_tasks = [
        Task.async(fn -> {"perimeter", PrismaticPerimeter.get_attack_surface(domain)} end),
        Task.async(fn -> {"intelligence", PrismaticIntelligence.get_threat_profile(domain)} end),
        Task.async(fn -> {"agents", PrismaticAgents.get_scan_history(domain)} end),
        Task.async(fn -> {"safety", PrismaticSafety.get_quality_metrics(domain)} end)
      ]

      # Await all queries with timeout
      results = Task.await_many(query_tasks, 30_000)

      # Combine results while maintaining context boundaries
      overview = Enum.reduce(results, %{}, fn {context, result}, acc ->
        case result do
          {:ok, data} -> Map.put(acc, context, data)
          {:error, reason} -> Map.put(acc, context, %{error: reason})
        end
      end)

      # Enhance with cross-context correlations
      enhanced_overview = add_cross_context_insights(overview)

      {:ok, enhanced_overview}
    end

    defp add_cross_context_insights(overview) do
      # Example: correlate perimeter findings with agent scan results
      case {overview["perimeter"], overview["agents"]} do
        {%{assets: assets}, %{scans: scans}} when is_list(assets) and is_list(scans) ->
          correlations = correlate_assets_with_scans(assets, scans)
          Map.put(overview, :correlations, correlations)
        _ ->
          overview
      end
    end

    defp correlate_assets_with_scans(assets, scans) do
      # Find assets that were also covered by agent scans
      Enum.flat_map(assets, fn asset ->
        matching_scans = Enum.filter(scans, fn scan ->
          asset_matches_scan_target?(asset, scan)
        end)

        if not Enum.empty?(matching_scans) do
          [%{
            asset_id: asset.id,
            asset_type: asset.type,
            matching_scans: length(matching_scans),
            scan_confirmation: determine_scan_confirmation(asset, matching_scans)
          }]
        else
          []
        end
      end)
    end
  end
end
```

## Context Testing Strategies

Testing bounded contexts requires specific approaches to maintain isolation while ensuring integration works:

```elixir
defmodule PrismaticPerimeter.ContextTest do
  @moduledoc """
  Testing strategies for bounded context isolation and integration.
  """

  use ExUnit.Case
  import ExUnit.CaptureLog

  # Context boundary testing
  describe "context boundary enforcement" do
    test "contexts cannot access each other's internal modules" do
      # Attempt to access internal module from another context should fail
      assert_raise UndefinedFunctionError, fn ->
        PrismaticAgents.Internal.SomeModule.private_function()
      end
    end

    test "contexts communicate only through published interfaces" do
      # Test that only facade modules are accessible
      assert function_exported?(PrismaticPerimeter, :discover, 1)
      assert function_exported?(PrismaticPerimeter, :security_rating, 1)

      # Internal modules should not be part of public API
      refute Code.ensure_loaded?(PrismaticPerimeter.Internal.DiscoveryEngine)
    end
  end

  # Contract testing between contexts
  describe "cross-context contracts" do
    test "perimeter context provides expected interface to web context" do
      # Test the contract that web context depends on
      assert {:ok, _rating} = PrismaticPerimeter.security_rating("example.com")
      assert {:ok, _assets} = PrismaticPerimeter.discover("example.com")
    end

    test "perimeter events match web context expectations" do
      # Test event structure compatibility
      Phoenix.PubSub.subscribe(PrismaticPubSub, "perimeter:ratings")

      # Trigger a rating change
      PrismaticPerimeter.update_security_rating("example.com", :B, %{reason: "test"})

      assert_receive {:rating_changed, event}
      assert Map.has_key?(event, :domain)
      assert Map.has_key?(event, :old_grade)
      assert Map.has_key?(event, :new_grade)
      assert Map.has_key?(event, :changed_at)
    end
  end

  # Integration testing with external systems
  describe "anti-corruption layer testing" do
    test "shodan adapter correctly translates external data" do
      external_data = %{
        "ip_str" => "93.184.216.34",
        "ports" => [80, 443],
        "hostnames" => ["example.com"],
        "org" => "Example Organization"
      }

      {:ok, asset} = PrismaticPerimeter.Adapters.ShodanAdapter.to_asset(external_data)

      assert asset.type == :ip_address
      assert asset.value == "93.184.216.34"
      assert length(asset.services) == 2
      assert asset.confidence > 0.0
    end
  end
end
```

## Related Terms

- [Domain-Driven Design](/glossary/domain-driven-design/) -- Strategic methodology that defines bounded contexts
- [CQRS](/glossary/cqrs/) -- Pattern applied within bounded contexts to separate read and write models
- [Event Sourcing](/glossary/event-sourcing/) -- Persistence pattern aligned with domain events crossing context boundaries
- [Message Passing](/glossary/message-passing/) -- Communication mechanism between contexts, enforced by BEAM process model
- [PubSub](/glossary/pubsub/) -- Event distribution system for loose coupling between contexts
- [Behaviour](/glossary/behaviour/) -- Callback-based contracts defining port interfaces at context boundaries
- [Adapter Pattern](/glossary/adapter-pattern/) -- Anti-corruption layer implementation for external system integration
- [Process Isolation](/glossary/process-isolation/) -- BEAM runtime enforcement of context boundaries
- [BEAM](/glossary/beam/) -- Virtual machine providing process-level isolation between contexts
- [Ecto](/glossary/ecto/) -- Repository pattern implementation within storage contexts
- [Agent](/glossary/agent/) -- AIAD agents operating within their respective bounded contexts
- [Umbrella Application](/glossary/umbrella-application/) -- Technical mechanism for implementing bounded contexts
- [Saga Pattern](/glossary/saga-pattern/) -- Cross-context workflow coordination pattern
- [Adapter](/glossary/adapter/) -- Port/adapter architectural pattern within bounded contexts

## See Also

- [Architecture](/architecture/) -- Context boundary design and platform decomposition strategy
- [Apps](/apps/) -- Individual bounded context implementations across the umbrella

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)