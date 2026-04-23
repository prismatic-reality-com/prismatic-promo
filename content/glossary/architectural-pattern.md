+++
title = "Architectural Pattern"
weight = 50
[extra]
description = "A general, reusable solution to a commonly occurring problem in software architecture, providing proven structural templates for organizing components, communication, and data flow"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "software-architecture"
related_concepts = ["adapter-pattern", "circuit-breaker", "saga-pattern", "cqrs", "event-sourcing", "bulkhead-pattern", "software-architecture", "domain-driven-design"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["object-oriented design", "distributed systems basics", "Elixir/OTP fundamentals", "software design patterns"]
learning_path = ["software-architecture", "architectural-pattern", "adapter-pattern", "circuit-breaker", "cqrs", "event-sourcing"]
interactive_demos = ["pattern catalog browser", "architecture diagram generator"]
code_examples = ["adapter pattern implementation", "circuit breaker GenServer", "CQRS command handler", "saga orchestrator"]
external_resources = ["https://microservices.io/patterns/", "https://martinfowler.com/eaaCatalog/", "https://docs.microsoft.com/en-us/azure/architecture/patterns/"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["pattern compliance verification", "resilience testing", "fault injection", "load testing"]
keywords = ["architectural pattern", "design pattern", "adapter", "circuit breaker", "CQRS", "event sourcing", "saga", "bulkhead", "supervisor", "OTP"]
tags = ["glossary", "architecture", "patterns", "design"]
related_terms = ["adapter-pattern", "circuit-breaker", "saga-pattern", "cqrs", "event-sourcing", "bulkhead-pattern", "software-architecture", "domain-driven-design"]
word_count = 1648
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Architectural Pattern - Prismatic Platform"
+++

## Definition

An **Architectural Pattern** is a general, reusable solution to a commonly occurring problem in software architecture within a given context. Unlike design patterns (which address code-level structure) or idioms (which address language-specific conventions), architectural patterns operate at the system level, defining the fundamental structural organization of a software system -- its components, their relationships, the rules governing those relationships, and the quality attributes that the pattern optimizes.

Formally, an architectural pattern `P` can be described as a quadruple `(Problem, Context, Solution, Consequences)` where `Problem` defines the recurring challenge being addressed, `Context` specifies the constraints and forces under which the pattern applies, `Solution` provides the structural template including component types, connectors, and configuration rules, and `Consequences` enumerate the quality attribute trade-offs inherent in applying the pattern. A pattern is not an implementation -- it is a template that guides implementation decisions while allowing adaptation to specific requirements.

## Overview

Architectural patterns represent distilled wisdom from decades of software engineering practice. They encode solutions to problems that practitioners encounter repeatedly: how to decouple producers from consumers (pub/sub), how to prevent cascading failures (circuit breaker), how to handle complex distributed transactions (saga), how to separate read and write concerns (CQRS), how to adapt incompatible interfaces (adapter), and how to isolate failures (bulkhead).

The significance of architectural patterns lies in their role as a shared vocabulary. When an architect says "we will use the circuit breaker pattern for external API calls," the entire team immediately understands the structural approach, the quality attributes being optimized (reliability, fault tolerance), and the trade-offs being accepted (additional complexity, potential false positives during recovery). This shared vocabulary accelerates design discussions, reduces ambiguity, and enables code review at the architectural level.

The Prismatic Platform employs a comprehensive catalog of architectural patterns, many of which are deeply integrated with Elixir/OTP's native concurrency and fault-tolerance primitives. OTP supervision trees, GenServer state machines, and process-based isolation map naturally onto patterns like bulkhead, circuit breaker, and saga -- making Elixir a uniquely well-suited platform for pattern-rich architectures.

### Pattern Classification

| Category | Focus | Patterns | Prismatic Usage |
|----------|-------|----------|----------------|
| **Structural** | Component organization | Adapter, Facade, Umbrella | Storage abstraction, API gateway |
| **Behavioral** | Communication and coordination | Observer, Mediator, Command | Telemetry, agent orchestration |
| **Concurrency** | Parallel execution and state | Actor, Pipeline, Fan-out/Fan-in | OTP processes, Broadway |
| **Resilience** | Fault tolerance and recovery | Circuit Breaker, Bulkhead, Retry | External API calls, service isolation |
| **Data** | Information management | CQRS, Event Sourcing, Repository | Storage layer, audit trail |
| **Integration** | System interconnection | Saga, Gateway, Anti-Corruption Layer | Cross-app coordination, external APIs |

## Technical Details

### Adapter Pattern

The [Adapter Pattern](@/glossary/adapter-pattern.md) translates between incompatible interfaces, enabling components written against different contracts to work together. In the Prismatic Platform, this pattern is fundamental to the storage abstraction layer:

```elixir
defmodule PrismaticStorageCore.Traits.Repository do
  @moduledoc """
  Storage repository trait defining the contract that all
  storage adapters must implement. Enables swapping backends
  (ETS, Ecto, Meilisearch, KuzuDB) without changing business logic.
  """

  @type entity :: map()
  @type id :: String.t() | integer()
  @type query :: keyword()

  @callback get(id()) :: {:ok, entity()} | {:error, :not_found}
  @callback list(query()) :: {:ok, [entity()]} | {:error, term()}
  @callback create(entity()) :: {:ok, entity()} | {:error, term()}
  @callback update(id(), map()) :: {:ok, entity()} | {:error, term()}
  @callback delete(id()) :: {:ok, :deleted} | {:error, term()}
end

defmodule PrismaticStorageETS.Adapter do
  @moduledoc """
  ETS-backed storage adapter. Used in development and testing
  for fast, in-memory storage without external dependencies.
  """

  @behaviour PrismaticStorageCore.Traits.Repository

  @spec get(PrismaticStorageCore.Traits.Repository.id()) ::
          {:ok, map()} | {:error, :not_found}
  @impl true
  def get(id) do
    case :ets.lookup(:storage, id) do
      [{^id, entity}] -> {:ok, entity}
      [] -> {:error, :not_found}
    end
  end

  @spec list(keyword()) :: {:ok, [map()]} | {:error, term()}
  @impl true
  def list(_query) do
    entities = :ets.tab2list(:storage) |> Enum.map(&elem(&1, 1))
    {:ok, entities}
  end

  @spec create(map()) :: {:ok, map()} | {:error, term()}
  @impl true
  def create(entity) do
    id = Map.get(entity, :id, System.unique_integer([:positive]))
    entity = Map.put(entity, :id, id)
    :ets.insert(:storage, {id, entity})
    {:ok, entity}
  end

  @spec update(PrismaticStorageCore.Traits.Repository.id(), map()) ::
          {:ok, map()} | {:error, :not_found}
  @impl true
  def update(id, changes) do
    case get(id) do
      {:ok, entity} ->
        updated = Map.merge(entity, changes)
        :ets.insert(:storage, {id, updated})
        {:ok, updated}

      {:error, :not_found} = error ->
        error
    end
  end

  @spec delete(PrismaticStorageCore.Traits.Repository.id()) ::
          {:ok, :deleted} | {:error, :not_found}
  @impl true
  def delete(id) do
    case get(id) do
      {:ok, _} ->
        :ets.delete(:storage, id)
        {:ok, :deleted}

      {:error, :not_found} = error ->
        error
    end
  end
end
```

### Circuit Breaker Pattern

The [Circuit Breaker](@/glossary/circuit-breaker.md) pattern prevents cascading failures by wrapping calls to external services in a state machine that trips open when failure rates exceed a threshold:

```elixir
defmodule PrismaticResilience.CircuitBreaker do
  @moduledoc """
  GenServer-based circuit breaker implementation.
  States: :closed (normal), :open (failing), :half_open (testing recovery).
  Trips open after failure_threshold failures within window_ms.
  """

  use GenServer

  @type state :: :closed | :open | :half_open

  @type config :: %{
    failure_threshold: non_neg_integer(),
    reset_timeout_ms: non_neg_integer(),
    window_ms: non_neg_integer()
  }

  @default_config %{
    failure_threshold: 5,
    reset_timeout_ms: 30_000,
    window_ms: 60_000
  }

  defstruct [
    :name,
    :config,
    state: :closed,
    failure_count: 0,
    last_failure_at: nil,
    success_count: 0
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    config = Keyword.get(opts, :config, @default_config)
    GenServer.start_link(__MODULE__, %{name: name, config: config}, name: name)
  end

  @spec call(GenServer.server(), (() -> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, :circuit_open} | {:error, term()}
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @impl true
  @spec init(map()) :: {:ok, %__MODULE__{}}
  def init(%{name: name, config: config}) do
    {:ok, %__MODULE__{name: name, config: config}}
  end

  @impl true
  def handle_call({:execute, fun}, _from, %{state: :open} = state) do
    if recovery_timeout_elapsed?(state) do
      execute_in_half_open(fun, %{state | state: :half_open})
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  @impl true
  def handle_call({:execute, fun}, _from, %{state: :closed} = state) do
    execute_and_record(fun, state)
  end

  @impl true
  def handle_call({:execute, fun}, _from, %{state: :half_open} = state) do
    execute_in_half_open(fun, state)
  end

  @spec execute_and_record((() -> {:ok, term()} | {:error, term()}), %__MODULE__{}) ::
          {:reply, {:ok, term()} | {:error, term()}, %__MODULE__{}}
  defp execute_and_record(fun, state) do
    case fun.() do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | failure_count: 0}}

      {:error, reason} ->
        new_state = record_failure(state)
        {:reply, {:error, reason}, new_state}
    end
  end

  defp execute_in_half_open(fun, state) do
    case fun.() do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | state: :closed, failure_count: 0, success_count: 0}}

      {:error, reason} ->
        {:reply, {:error, reason}, %{state | state: :open, last_failure_at: System.monotonic_time(:millisecond)}}
    end
  end

  @spec record_failure(%__MODULE__{}) :: %__MODULE__{}
  defp record_failure(state) do
    new_count = state.failure_count + 1
    now = System.monotonic_time(:millisecond)

    if new_count >= state.config.failure_threshold do
      %{state | state: :open, failure_count: new_count, last_failure_at: now}
    else
      %{state | failure_count: new_count, last_failure_at: now}
    end
  end

  @spec recovery_timeout_elapsed?(%__MODULE__{}) :: boolean()
  defp recovery_timeout_elapsed?(%{last_failure_at: nil}), do: true
  defp recovery_timeout_elapsed?(state) do
    elapsed = System.monotonic_time(:millisecond) - state.last_failure_at
    elapsed >= state.config.reset_timeout_ms
  end
end
```

### CQRS (Command Query Responsibility Segregation)

[CQRS](@/glossary/cqrs.md) separates the read model from the write model, allowing each to be optimized independently:

| Aspect | Command Side (Write) | Query Side (Read) |
|--------|---------------------|-------------------|
| **Model** | Domain entities, aggregates | Denormalized views, projections |
| **Storage** | Normalized, append-only | Denormalized, read-optimized |
| **Consistency** | Strong (transactional) | Eventual (async projection) |
| **Scaling** | Vertical (single writer) | Horizontal (many readers) |
| **Prismatic Usage** | Domain operations, state changes | Dashboard queries, analytics |

### Event Sourcing

[Event Sourcing](@/glossary/event-sourcing.md) stores state as a sequence of events rather than as current state snapshots. Combined with CQRS, it provides a complete audit trail and enables temporal queries:

```elixir
defmodule PrismaticEventStore.Aggregate do
  @moduledoc """
  Base module for event-sourced aggregates.
  State is reconstructed by replaying events.
  Commands produce events; events modify state.
  """

  @type event :: %{
    type: String.t(),
    data: map(),
    metadata: map(),
    timestamp: DateTime.t()
  }

  @callback apply_event(state :: term(), event()) :: term()
  @callback handle_command(state :: term(), command :: term()) ::
              {:ok, [event()]} | {:error, term()}

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticEventStore.Aggregate

      @spec rebuild_state([PrismaticEventStore.Aggregate.event()]) :: term()
      def rebuild_state(events) do
        Enum.reduce(events, initial_state(), &apply_event(&2, &1))
      end

      @spec execute(term(), term()) ::
              {:ok, term(), [PrismaticEventStore.Aggregate.event()]} | {:error, term()}
      def execute(state, command) do
        case handle_command(state, command) do
          {:ok, events} ->
            new_state = Enum.reduce(events, state, &apply_event(&2, &1))
            {:ok, new_state, events}

          {:error, _reason} = error ->
            error
        end
      end

      defp initial_state, do: %{}
      defoverridable initial_state: 0
    end
  end
end
```

### Saga Pattern

The [Saga Pattern](@/glossary/saga-pattern.md) manages distributed transactions by breaking them into a sequence of local transactions, each with a compensating action for rollback:

| Step | Forward Action | Compensating Action | Prismatic Example |
|------|---------------|--------------------|--------------------|
| 1 | Create asset record | Delete asset record | EASM discovery |
| 2 | Scan asset | Cancel scan | Vulnerability scan |
| 3 | Generate report | Revoke report | Security report |
| 4 | Notify stakeholders | Send correction | Alert delivery |

### Bulkhead Pattern

The [Bulkhead Pattern](@/glossary/bulkhead-pattern.md) isolates components so that failure in one does not cascade to others. In Elixir/OTP, this is naturally achieved through process isolation and supervision trees:

```elixir
defmodule PrismaticResilience.BulkheadSupervisor do
  @moduledoc """
  Supervision tree implementing the bulkhead pattern.
  Each external service integration runs under its own
  supervisor with independent restart strategies.
  Failure in one bulkhead cannot affect others.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  @spec init(keyword()) :: {:ok, {Supervisor.sup_flags(), [Supervisor.child_spec()]}}
  def init(_opts) do
    children = [
      {DynamicSupervisor, name: :osint_bulkhead, strategy: :one_for_one, max_restarts: 10},
      {DynamicSupervisor, name: :scanning_bulkhead, strategy: :one_for_one, max_restarts: 5},
      {DynamicSupervisor, name: :reporting_bulkhead, strategy: :one_for_one, max_restarts: 3},
      {DynamicSupervisor, name: :notification_bulkhead, strategy: :one_for_one, max_restarts: 10}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### Pattern Selection Matrix

| Problem | Primary Pattern | Supporting Patterns | Quality Attributes Optimized |
|---------|----------------|--------------------|-----------------------------|
| Multiple storage backends | Adapter | Repository, Strategy | Flexibility, testability |
| External API reliability | Circuit Breaker | Retry, Timeout, Bulkhead | Reliability, availability |
| Complex distributed transactions | Saga | Compensating Transaction, Outbox | Consistency, reliability |
| Read/write scaling mismatch | CQRS | Event Sourcing, Materialized View | Performance, scalability |
| Audit and temporal queries | Event Sourcing | CQRS, Snapshot | Auditability, traceability |
| Failure isolation | Bulkhead | Supervision Tree, Process Isolation | Availability, fault tolerance |
| Incompatible system integration | Anti-Corruption Layer | Adapter, Facade | Maintainability, independence |
| Request routing and composition | API Gateway | Load Balancer, Service Mesh | Manageability, security |

## Implementation in Prismatic Platform

The Prismatic Platform applies architectural patterns at multiple levels:

**Storage Layer**: The trait-based storage abstraction (`PrismaticStorageCore.Traits`) implements the Adapter pattern, enabling seamless switching between ETS (development), Ecto/PostgreSQL (production), Meilisearch (search), and KuzuDB (graph queries).

**Resilience Layer**: External OSINT API integrations (120+ providers) are wrapped in circuit breakers and bulkheads, preventing a single provider's failure from affecting the entire intelligence pipeline.

**Agent Ecosystem**: The 530+ AIAD agents communicate through patterns including observer (telemetry events), mediator (agent orchestration), and command (structured task execution).

**API Gateway**: The auto-introspecting API gateway implements the Gateway pattern, centralizing authentication, rate limiting, and request routing for all platform services.

**OTP Native Patterns**: Elixir/OTP provides built-in support for many architectural patterns -- GenServer for state machines, Supervisor for bulkhead/restart patterns, Registry for service discovery, and Task for fan-out/fan-in concurrency.

## Comparison with Alternatives

| Level | Pattern Type | Scope | Abstraction | Example |
|-------|-------------|-------|-------------|---------|
| **Architectural** | Architectural Pattern | System-wide | Highest | CQRS, Event Sourcing, Microservices |
| **Design** | Design Pattern (GoF) | Class/module | Medium | Observer, Strategy, Factory |
| **Idiom** | Language Idiom | Function/expression | Lowest | Pattern matching, pipe operator |
| **Framework** | Framework Convention | Application | Medium-High | Phoenix contexts, Ecto schemas |

Architectural patterns differ from design patterns in scope (system vs. module), from frameworks in flexibility (templates vs. prescriptions), and from idioms in abstraction level (structural organization vs. coding conventions). The Prismatic Platform leverages all four levels, with architectural patterns providing the overall system structure, design patterns organizing modules, OTP idioms guiding process design, and Phoenix conventions structuring web interactions.

## Best Practices

1. **Understand the problem before selecting a pattern**: Patterns are solutions to specific problems. Applying CQRS to a simple CRUD application adds complexity without benefit. Start from the quality attributes you need to optimize.

2. **Combine patterns thoughtfully**: Patterns often work in concert. Circuit Breaker + Bulkhead + Retry form a resilience stack. CQRS + Event Sourcing form a data management stack. Understand the interactions between combined patterns.

3. **Leverage OTP's native patterns**: In Elixir, many architectural patterns map directly to OTP primitives. Do not reinvent supervision trees, process isolation, or message passing -- use the BEAM VM's built-in capabilities.

4. **Start simple, add patterns as needed**: Begin with the simplest architecture that meets current requirements. Add patterns when specific quality attribute needs emerge, not speculatively.

5. **Document pattern application**: Record which patterns are used, where they are applied, and why they were chosen. This is essential for onboarding and maintenance. Use [architectural decisions](@/glossary/architectural-decision.md) for significant pattern selections.

6. **Test pattern implementations**: Each pattern has specific failure modes. Circuit breakers need tests for state transitions. Sagas need tests for compensation. Event sourcing needs tests for replay correctness.

7. **Monitor pattern health**: Patterns have runtime characteristics that should be monitored. Circuit breaker state transitions, saga completion rates, CQRS projection lag, and bulkhead utilization are all operational metrics.

## Common Pitfalls

1. **Pattern overuse**: Applying patterns everywhere "just in case." Every pattern adds complexity. The [CQRS](@/glossary/cqrs.md) pattern, for example, doubles the number of models and adds eventual consistency challenges. Apply it only where read/write asymmetry justifies the cost.

2. **Cargo cult patterns**: Copying pattern implementations from other systems without understanding the underlying problem they solve. A circuit breaker is pointless if the downstream service has a 99.999% SLA and sub-millisecond latency.

3. **Ignoring Elixir/OTP's native strengths**: Implementing Java-style patterns in Elixir when OTP already provides superior alternatives. Process isolation is a better bulkhead than thread pools. Supervision trees are more powerful than manual retry loops.

4. **Incomplete pattern application**: Implementing the happy path of a saga without the compensating transactions, or a circuit breaker without the half-open recovery state. Partial pattern implementation is often worse than no pattern at all.

5. **Pattern name confusion**: Using pattern names inconsistently or incorrectly. A module called "CircuitBreaker" that does not implement state machine semantics creates confusion. Ensure implementations faithfully reflect the pattern's intent.

6. **Mixing abstraction levels**: Applying architectural patterns at the wrong level (e.g., using saga for in-memory object coordination) or design patterns at the architectural level (e.g., using Observer for cross-service communication without proper infrastructure).

## Use Cases

**OSINT Provider Integration**: Each of the 120+ OSINT providers is wrapped in an adapter (normalizing diverse APIs), protected by a circuit breaker (handling provider outages), and isolated in a bulkhead (preventing cascade from one provider to another).

**Security Rating Calculation**: The Prismatic Perimeter security rating pipeline uses [event sourcing](@/glossary/event-sourcing.md) to maintain a complete audit trail of all assessment data, enabling temporal queries ("what was this domain's rating last month?") and regulatory compliance.

**Platform Quality Gates**: The 13-layer quality gate pipeline applies the pipeline pattern, with each stage (compilation, Credo, Dialyzer, tests, etc.) processing independently and reporting results to a central aggregator.

**Agent Orchestration**: The AIAD agent ecosystem uses the mediator pattern for agent coordination, the command pattern for task dispatch, and the observer pattern for telemetry-based monitoring.

## Related Concepts

- [Adapter Pattern](@/glossary/adapter-pattern.md) -- structural pattern for interface translation between incompatible components
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- resilience pattern preventing cascading failures from downstream services
- [Saga Pattern](@/glossary/saga-pattern.md) -- distributed transaction management through compensating local transactions
- [CQRS](@/glossary/cqrs.md) -- separation of read and write models for independent optimization
- [Event Sourcing](@/glossary/event-sourcing.md) -- persistence of state as an append-only sequence of domain events
- [Bulkhead Pattern](@/glossary/bulkhead-pattern.md) -- failure isolation through resource partitioning
- [Software Architecture](@/glossary/software-architecture.md) -- the overarching discipline within which patterns are applied
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- methodology that informs pattern selection at bounded context level
- [Architectural Decision](@/glossary/architectural-decision.md) -- formal recording of pattern selection rationale

## See Also

- [Microservices Patterns](https://microservices.io/patterns/) -- comprehensive catalog of distributed system patterns
- [Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) -- Microsoft's cloud architecture pattern catalog
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) -- Hohpe and Woolf's integration pattern catalog
- [Elixir/OTP Design Patterns](https://hexdocs.pm/elixir/design-patterns.html) -- language-specific patterns for the BEAM ecosystem

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
