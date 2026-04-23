+++
title = "CQRS"
weight = 26
[extra]
category = "architecture"
description = "Command Query Responsibility Segregation separates read and write models for independent optimization and scaling"
related_terms = ["event-sourcing", "domain-driven-design", "eventual-consistency", "rest-api", "ecto", "bounded-context", "adapter-pattern", "data-pipeline", "stream-processing", "broadway"]
platform_relevance = "high"
complexity = "advanced"
domain = "software-architecture"
layer = "application"
paradigm = "architectural-pattern"
origin = "Greg Young / Bertrand Meyer CQS"
first_described = "2010"
prismatic_usage = "api-gateway, multi-backend-storage, dashboard-optimization"
quality_impact = "high"
safety_level = "production"
documentation_required = true
testing_strategy = "integration-testing"
write_storage = "PostgreSQL"
read_storages = ["ETS", "Meilisearch", "KuzuDB", "TimescaleDB", "Redis"]
consistency_model = "eventual"
related_apps = ["prismatic_api", "prismatic_web", "prismatic_perimeter", "prismatic_storage_core"]
anti_patterns = ["premature-cqrs", "neglected-synchronization", "over-engineering"]
see_also = ["event-sourcing", "domain-driven-design", "bounded-context", "eventual-consistency", "adapter-pattern"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1830
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CQRS", "Command", "Query", "Responsibility", "Segregation", "glossary", "architecture", "Prismatic Platform", "Read"]
tags = ["glossary", "architecture", "cqrs", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "CQRS - Prismatic Platform"
+++

## Definition

Command Query Responsibility Segregation (CQRS) is an architectural pattern that separates the data model used for writing (commands) from the model used for reading (queries). This separation allows each side to be independently optimized, scaled, and evolved. Commands mutate state through validated operations while queries retrieve denormalized, read-optimized projections. The pattern was named by Greg Young, building on Bertrand Meyer's Command-Query Separation (CQS) principle, and elevates a method-level guideline ("a method should either change state or return a result, never both") into a system-level architecture where the write model and the read model are entirely separate data structures, potentially stored in different databases with different schemas.

The motivation for CQRS arises from a fundamental tension in traditional CRUD architectures: the data model that is optimal for enforcing business rules during writes is rarely the model that is optimal for serving complex queries. A normalized relational schema with referential integrity constraints is excellent for maintaining consistency during writes but requires expensive joins for reads. Conversely, a denormalized view optimized for dashboard queries would be a nightmare to keep consistent during writes. CQRS resolves this tension by accepting that these are two different problems requiring two different solutions.

The Prismatic Platform applies CQRS principles across its architecture. Write operations flow through validated command paths with full quality gate enforcement, while read-optimized views are served from [ETS](@/glossary/ets.md) caches and Meilisearch indices. The Prismatic API auto-discovers facade functions and routes GET requests to query paths and POST requests to command paths, embodying CQRS at the HTTP layer. The platform's multi-adapter storage layer -- spanning [PostgreSQL](@/glossary/postgresql.md), ETS, Redis, Meilisearch, and KuzuDB -- is itself a manifestation of CQRS, with each storage backend optimized for its specific read or write role.

## Historical Context and Theoretical Foundations

The intellectual lineage of CQRS begins with Bertrand Meyer's 1988 book "Object-Oriented Software Construction," which introduced the Command-Query Separation (CQS) principle. Meyer's principle states that every method should either be a command that performs an action (and changes state) or a query that returns data to the caller (and is free of side effects), but never both. This method-level principle was about function design: a function should either do something or answer something, not both.

Greg Young, working in the domain-driven design community around 2010, recognized that CQS could be elevated from a method-level pattern to a system-level architecture. If commands and queries have fundamentally different requirements -- commands need validation, consistency, and business rule enforcement while queries need speed, denormalization, and flexible access patterns -- then they should have different models. This insight, combined with the event sourcing pattern, gave birth to CQRS as an architectural pattern.

The connection to [Event Sourcing](@/glossary/event-sourcing.md) is important but not mandatory. Event sourcing stores the history of state changes as a sequence of events, and CQRS provides a natural way to project those events into read-optimized views. However, CQRS can be implemented without event sourcing (using traditional database writes on the command side) and event sourcing can be implemented without CQRS. The Prismatic Platform uses CQRS selectively, within bounded contexts where read/write characteristics justify the additional complexity, and combines it with event-driven synchronization rather than full event sourcing.

The pattern gained significant traction in the microservices era because it naturally aligns with service boundaries. A service can own its write model (the source of truth) while publishing events that allow other services to maintain their own read-optimized projections. This eliminates the need for shared databases between services, which is one of the most common coupling vectors in distributed systems.

## Command Side (Write Model)

### Command Validation and Processing

Commands represent intentions to change state. Before a command mutates any data, it must pass through validation that enforces business invariants, authorization rules, and quality constraints.

```elixir
defmodule PrismaticPerimeter.Commands.AssessSecurityRating do
  @moduledoc """
  Command to assess security rating for a domain.
  Validates input, checks authorization, executes discovery,
  calculates rating, and records audit trail. All mutation
  goes through this validated path.
  """

  defstruct [:domain, :requested_by, :assessment_type, :options]

  @type t :: %__MODULE__{
    domain: String.t(),
    requested_by: String.t(),
    assessment_type: :full | :quick | :compliance_only,
    options: keyword()
  }

  @spec execute(t()) :: {:ok, SecurityRating.t()} | {:error, term()}
  def execute(%__MODULE__{} = command) do
    with :ok <- validate_domain(command.domain),
         :ok <- authorize(command.requested_by, :assess_rating),
         {:ok, surface} <- discover_attack_surface(command.domain),
         {:ok, rating} <- calculate_rating(surface, command.options),
         {:ok, _audit} <- record_audit_trail(command, rating) do
      # Emit event for read model synchronization
      emit_event(:security_rating_calculated, %{
        domain: command.domain,
        rating: rating,
        timestamp: DateTime.utc_now()
      })

      {:ok, rating}
    end
  end

  defp validate_domain(domain) do
    if valid_domain?(domain), do: :ok, else: {:error, :invalid_domain}
  end

  defp authorize(user, action) do
    if PrismaticAuth.authorized?(user, action), do: :ok, else: {:error, :unauthorized}
  end

  defp valid_domain?(domain) do
    String.match?(domain, ~r/^[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)
  end
end
```

### Write Model Characteristics

| Property | Description |
|----------|-------------|
| **Normalized schema** | Third normal form for data integrity |
| **Referential integrity** | Foreign keys enforce relationship constraints |
| **Serializable transactions** | Strong consistency via [PostgreSQL](@/glossary/postgresql.md) |
| **Validation-heavy** | Business rules checked before every mutation |
| **Audit trail** | Every write produces an [audit event](@/glossary/audit-trail.md) |
| **Low read optimization** | Not designed for complex queries |
| **Event emission** | Every successful write emits an event for read model sync |

### Command Routing

```elixir
defmodule PrismaticAPI.CommandRouter do
  @moduledoc """
  Routes incoming API requests to the appropriate command handler.
  Enforces that all mutations go through validated command paths.
  """

  @spec route_command(String.t(), String.t(), map()) :: {:ok, term()} | {:error, term()}
  def route_command(app, action, params) do
    case {app, action} do
      {"perimeter", "assess"} ->
        command = %PrismaticPerimeter.Commands.AssessSecurityRating{
          domain: params["domain"],
          requested_by: params["user_id"],
          assessment_type: String.to_existing_atom(params["type"] || "full"),
          options: []
        }
        PrismaticPerimeter.Commands.AssessSecurityRating.execute(command)

      {"perimeter", "scan"} ->
        PrismaticPerimeter.Commands.ScanAssets.execute(params)

      {app, action} ->
        {:error, {:unknown_command, app, action}}
    end
  end
end
```

## Query Side (Read Model)

### Read-Optimized Projections

Queries are served from denormalized projections optimized for specific access patterns. Each projection maintains its own data structure, potentially in a different storage backend.

```elixir
defmodule PrismaticPerimeter.Projections.DashboardView do
  @moduledoc """
  Read-optimized projection for the Perimeter dashboard.
  Combines data from ETS cache, Meilisearch index, and
  pre-computed aggregates for sub-100ms response times.
  """

  @spec get_dashboard_data(String.t()) :: {:ok, map()} | {:error, term()}
  def get_dashboard_data(organization_id) do
    with {:ok, summary} <- get_cached_summary(organization_id),
         {:ok, ratings} <- get_recent_ratings(organization_id, limit: 10),
         {:ok, compliance} <- get_compliance_overview(organization_id),
         {:ok, distribution} <- get_risk_distribution(organization_id) do
      {:ok, %{
        summary: summary,
        recent_ratings: ratings,
        compliance_status: compliance,
        risk_distribution: distribution
      }}
    end
  end

  defp get_cached_summary(org_id) do
    PrismaticStorage.ETS.get_or_compute(
      {:dashboard_summary, org_id},
      fn -> compute_summary(org_id) end,
      ttl: :timer.minutes(5)
    )
  end

  defp get_recent_ratings(org_id, opts) do
    limit = Keyword.get(opts, :limit, 10)
    PrismaticStorage.ETS.get_or_compute(
      {:recent_ratings, org_id, limit},
      fn -> fetch_ratings_from_db(org_id, limit) end,
      ttl: :timer.minutes(2)
    )
  end
end
```

### Projection Storage Backends

| Projection | Storage Backend | Optimization | Staleness |
|------------|----------------|--------------|-----------|
| Dashboard metrics | [ETS](@/glossary/ets.md) | Sub-millisecond reads | 5 minutes |
| Full-text search | Meilisearch | Relevance ranking | Seconds |
| Knowledge graph queries | KuzuDB | Relationship traversal | Minutes |
| Time-series analytics | TimescaleDB | Continuous aggregates | Real-time |
| Session state | Redis | Shared across nodes | Immediate |

Each projection is purpose-built for its access pattern. The dashboard projection prioritizes latency and uses ETS with short TTLs. The search projection prioritizes relevance and uses Meilisearch's BM25 ranking. The graph projection prioritizes relationship queries and uses KuzuDB's Cypher-like query language. This heterogeneity is the core value of CQRS: each read concern gets its optimal storage backend.

## Synchronization Between Models

The critical challenge in CQRS is keeping the read models synchronized with the write model. The Prismatic Platform uses event-driven synchronization where write operations produce events that trigger read model updates.

```
Write Model (PostgreSQL)
    |
    | [Events emitted on write]
    |
    v
Event Bus (PubSub / Broadway)
    |
    +-----> ETS Projection (invalidate + recompute)
    |
    +-----> Meilisearch Projection (index document)
    |
    +-----> KuzuDB Projection (update graph)
    |
    +-----> TimescaleDB Projection (append metric)
```

### Consistency Between Models

The read models are [eventually consistent](@/glossary/eventual-consistency.md) with the write model. After a write completes, there is a brief window where the read models reflect the previous state. The platform manages this through several strategies.

| Strategy | Description | When Used |
|----------|-------------|-----------|
| **Read-your-writes** | After a command, redirect reads to write model | User-facing mutations |
| **Polling** | Periodically refresh read model from write model | Background dashboards |
| **Event-driven** | Update read model when event received | Real-time projections |
| **Cache invalidation** | Delete stale cache entry, lazily recompute on next read | General caching |
| **Versioned reads** | Include write model version in response for staleness detection | API responses |

```elixir
defmodule PrismaticPerimeter.Projections.EventHandler do
  @moduledoc """
  Processes events from the write model and updates all
  read-side projections. Uses Broadway for ordered, concurrent
  event processing with acknowledgment and retry.
  """

  use Broadway

  @impl true
  def handle_message(_, %{data: event}, _) do
    case event.type do
      :security_rating_calculated ->
        update_ets_dashboard(event)
        update_meilisearch_index(event)
        update_kuzudb_graph(event)

      :compliance_assessed ->
        update_compliance_projection(event)

      :asset_discovered ->
        update_asset_inventory_projection(event)
        update_meilisearch_index(event)
    end

    event
  end

  defp update_ets_dashboard(event) do
    # Invalidate cached dashboard data for affected organization
    org_id = event.data.organization_id
    PrismaticStorage.ETS.delete({:dashboard_summary, org_id})
    PrismaticStorage.ETS.delete({:recent_ratings, org_id, 10})
  end

  defp update_meilisearch_index(event) do
    PrismaticStorage.Meilisearch.index_document(
      "ratings",
      event.data.domain,
      Map.from_struct(event.data)
    )
  end
end
```

## CQRS at the HTTP Layer

The [Prismatic API](@/glossary/rest-api.md) embodies CQRS at the HTTP level. The auto-introspecting API gateway maps HTTP methods to the appropriate side of the CQRS boundary.

| HTTP Method | CQRS Side | Behavior |
|-------------|-----------|----------|
| `GET` | Query | Read from projection, never mutates |
| `POST` | Command | Validates and executes command |
| `PUT/PATCH` | Command | Updates through validated command path |
| `DELETE` | Command | Soft-delete through command validation |

```elixir
# API router reflecting CQRS
scope "/api/v1", PrismaticApi do
  # Query paths - served from read models
  get "/perimeter/ratings/:domain", PerimeterController, :get_rating
  get "/perimeter/dashboard", PerimeterController, :dashboard
  get "/perimeter/compliance/:domain", PerimeterController, :compliance
  get "/perimeter/search", PerimeterController, :search

  # Command paths - validated and processed
  post "/perimeter/assess", PerimeterController, :assess
  post "/perimeter/scan", PerimeterController, :scan
  put "/perimeter/assets/:id", PerimeterController, :update_asset
  delete "/perimeter/assets/:id", PerimeterController, :remove_asset
end
```

## Benefits for Complex Domains

CQRS provides particular value for the Prismatic Platform's [domain-driven design](@/glossary/domain-driven-design.md) architecture.

| Benefit | Description | Platform Example |
|---------|-------------|-----------------|
| **Independent scaling** | Read and write workloads scale separately | Read-heavy dashboards vs. batch-write scans |
| **Optimized storage** | Each side uses the best storage backend | PostgreSQL writes, ETS reads |
| **Schema independence** | Read models can restructure without affecting writes | Dashboard redesign without migration |
| **Multiple projections** | Same data projected into multiple optimized views | Dashboard + Search + Graph + Analytics |
| **[Bounded context](@/glossary/bounded-context.md) clarity** | Clear separation of command and query responsibilities | Each umbrella app has distinct command/query modules |
| **Testing clarity** | Commands and queries can be tested independently | Command validation isolated from projection logic |

## Trade-offs and Complexity

| Challenge | Mitigation |
|-----------|------------|
| **Eventual consistency** | Read-your-writes for critical paths; TTL-based caching elsewhere |
| **Increased codebase** | Code generation for projections; [adapter pattern](@/glossary/adapter-pattern.md) for storage backends |
| **Event ordering** | Monotonic event IDs; [Broadway](@/glossary/broadway.md) for ordered processing |
| **Projection failure** | Projections are disposable; replay from [event source](@/glossary/event-sourcing.md) to rebuild |
| **Debugging complexity** | Correlation IDs across command and query paths; distributed tracing |
| **Operational overhead** | Multiple storage backends to monitor and maintain |

## When to Apply CQRS

CQRS adds complexity and should be applied selectively. The Prismatic Platform applies CQRS within [bounded contexts](@/glossary/bounded-context.md) that meet specific criteria.

| Criterion | CQRS Justified | Simple CRUD Sufficient |
|-----------|---------------|----------------------|
| Read/write ratio | Heavily skewed (100:1 or more) | Balanced |
| Query complexity | Multiple join patterns, aggregations | Simple lookups |
| Scale requirements | Independent read/write scaling needed | Uniform scaling |
| Audit requirements | Complete history and temporal queries | Current state only |
| Storage diversity | Multiple backends beneficial | Single database adequate |
| Team structure | Separate read/write team ownership | Single team |

The critical mistake is applying CQRS everywhere. For simple CRUD operations where read and write patterns are balanced and a single database serves both adequately, CQRS adds complexity without proportional benefit. The Prismatic Platform reserves CQRS for its high-value domains: security assessment (read-heavy dashboards, write-intensive scanning), OSINT data collection (write-heavy ingestion, read-heavy analysis), and the API gateway (universal read/write routing).

## Implementation Patterns

### Command Bus Pattern

```elixir
defmodule PrismaticAPI.CommandBus do
  @moduledoc """
  Central command dispatching with middleware chain for
  validation, authorization, logging, and telemetry.
  """

  @spec dispatch(struct()) :: {:ok, term()} | {:error, term()}
  def dispatch(command) do
    command
    |> validate()
    |> authorize()
    |> execute()
    |> emit_events()
    |> record_audit()
  end

  defp validate({:ok, command}), do: command.__struct__.validate(command)
  defp validate(error), do: error

  defp authorize({:ok, command}), do: command.__struct__.authorize(command)
  defp authorize(error), do: error

  defp execute({:ok, command}), do: command.__struct__.execute(command)
  defp execute(error), do: error
end
```

### Query Dispatcher Pattern

```elixir
defmodule PrismaticAPI.QueryDispatcher do
  @moduledoc """
  Routes queries to the appropriate read model based on
  query type and staleness tolerance.
  """

  @spec query(atom(), map()) :: {:ok, term()} | {:error, term()}
  def query(query_type, params) do
    projection = resolve_projection(query_type)
    projection.execute(params)
  end

  defp resolve_projection(:dashboard), do: PrismaticPerimeter.Projections.DashboardView
  defp resolve_projection(:search), do: PrismaticPerimeter.Projections.SearchView
  defp resolve_projection(:graph), do: PrismaticPerimeter.Projections.GraphView
  defp resolve_projection(:analytics), do: PrismaticPerimeter.Projections.AnalyticsView
end
```

## Best Practices

1. **Apply Selectively**: CQRS adds complexity and should only be applied within bounded contexts where read/write patterns are heavily skewed (100:1 or more), query complexity justifies separate models, or independent scaling is required.

2. **Use Event-Driven Synchronization**: Keep read models synchronized through events rather than polling. [Broadway](@/glossary/broadway.md) pipelines provide ordered, concurrent event processing for updating projections.

3. **Accept Eventual Consistency**: Design user interfaces to handle brief staleness windows between write confirmation and read model update. Use read-your-writes consistency for critical user-facing mutations.

4. **Make Projections Disposable**: Read model projections should be rebuildable from the event log or write model at any time. This enables schema changes, new projection types, and recovery from corruption without data loss.

5. **Use Correlation IDs**: Every command should generate a correlation ID that follows through event emission, projection updates, and query responses. This enables end-to-end tracing across the CQRS boundary.

6. **Monitor Synchronization Lag**: Track the time between write model updates and read model convergence. Alert on lag exceeding acceptable thresholds for each projection type.

## Common Pitfalls

- **Premature CQRS adoption**: Applying CQRS to simple CRUD domains where a single database model serves both reads and writes adequately. Start with simple architecture and introduce CQRS when read/write asymmetry creates genuine pain.

- **Neglecting event ordering**: When multiple projections consume the same events, ordering guarantees matter. A projection that processes events out of order may produce incorrect state.

- **Shared read/write models**: Allowing query logic to read directly from the write model defeats the purpose of CQRS. Queries should always go through projections, even when the write model could serve the query.

- **Stale projection panic**: Occasional staleness in read models is expected and acceptable. Designing systems that fail when projections are briefly stale creates fragile architectures.

## Use Cases

- **Security Dashboards**: Read-heavy dashboard views served from ETS caches while security assessments write through validated command paths to PostgreSQL
- **Full-Text Search**: Meilisearch indices maintained as eventually consistent projections from the write model for fast relevance-ranked search
- **Graph Analytics**: KuzuDB graph projections built from relational data for relationship traversal and path analysis queries
- **Time-Series Analytics**: TimescaleDB continuous aggregates providing pre-computed trend data for historical analysis dashboards
- **API Gateway**: Auto-introspecting REST API mapping GET requests to read models and POST requests to command paths

## Related Concepts

- [Event Sourcing](@/glossary/event-sourcing.md) -- Natural companion pattern providing the event log that feeds projections
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- Strategic design approach that motivates CQRS boundaries
- [Bounded Context](@/glossary/bounded-context.md) -- Scope within which CQRS separation is applied
- [Eventual Consistency](@/glossary/eventual-consistency.md) -- Consistency model between write model and read projections
- [REST API](@/glossary/rest-api.md) -- HTTP interface reflecting command/query separation
- [Ecto](@/glossary/ecto.md) -- Elixir database layer powering the write model
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Storage adapter abstraction for multiple read model backends
- [Stream Processing](@/glossary/stream-processing.md) -- Pipeline processing connecting write events to read projections
- [Data Pipeline](@/glossary/data-pipeline.md) -- Infrastructure moving events from write to read side
- [Broadway](@/glossary/broadway.md) -- Elixir library for ordered, concurrent event processing
- [PostgreSQL](@/glossary/postgresql.md) -- Write-side storage with strong consistency guarantees
- [ETS](@/glossary/ets.md) -- Read-side in-memory cache for dashboard projections

## See Also

- [Architecture](@/architecture/_index.md) -- Platform design patterns and CQRS implementation
- [Apps](@/apps/_index.md) -- Umbrella application structure reflecting CQRS boundaries

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
