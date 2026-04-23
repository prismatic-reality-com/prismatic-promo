+++
title = "Database"
weight = 50
[extra]
tags = ["glossary", "database", "storage", "postgresql", "ets", "infrastructure", "persistence", "polyglot"]
description = "An organized collection of structured data stored and accessed electronically, with the Prismatic Platform employing a polyglot persistence strategy across PostgreSQL, ETS, Meilisearch, KuzuDB, Redis, and DuckDB for optimal workload distribution"
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Data Infrastructure & Storage"
related_concepts = ["postgresql", "ets", "meilisearch", "kuzudb", "redis", "ecto", "relational-database"]
implementation_status = "production"
authority_level = "L2 Operational"
difficulty_rating = 5
prerequisites = ["elixir", "ecto", "sql", "data-pipeline"]
learning_path = ["relational-database", "database", "postgresql", "ets", "ecto", "connection-pooling", "cap-theorem"]
interactive_demos = ["/labs/glossary/database"]
code_examples = ["Ecto schema definition with migrations", "ETS cache with TTL", "Multi-backend storage coordinator", "Meilisearch full-text integration"]
external_resources = ["https://hexdocs.pm/ecto/Ecto.html", "https://www.postgresql.org/docs/", "https://www.erlang.org/doc/man/ets", "https://docs.meilisearch.com/"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["multi-backend failover", "connection pool exhaustion recovery", "concurrent write conflict resolution", "cross-backend consistency verification"]
keywords = ["database", "polyglot persistence", "PostgreSQL", "ETS", "Meilisearch", "KuzuDB", "Redis", "DuckDB", "Ecto", "data storage", "persistence layer"]
related_terms = ["postgresql", "ets", "meilisearch", "kuzudb", "redis", "duckdb", "ecto", "relational-database", "connection-pooling", "cap-theorem", "event-sourcing", "data-pipeline"]
word_count = 1941
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Database - Prismatic Platform"
+++

## Definition

A database is an organized collection of structured, semi-structured, or unstructured data stored and accessed electronically through a database management system (DBMS). Databases provide mechanisms for defining data schemas, inserting and updating records, querying data efficiently, maintaining consistency under concurrent access, and recovering from failures. They are the foundational persistence layer of virtually every software system.

The Prismatic Platform employs a polyglot persistence strategy, using six distinct database technologies, each selected for specific workload characteristics: [PostgreSQL](/glossary/postgresql/) for relational data and ACID transactions, [ETS](/glossary/ets/) for in-memory caching and real-time state, [Meilisearch](/glossary/meilisearch/) for full-text search, [KuzuDB](/glossary/kuzudb/) for graph queries, [Redis](/glossary/redis/) for distributed caching and pub/sub, and [DuckDB](/glossary/duckdb/) for analytical queries. This approach ensures that each data access pattern is served by the technology best suited to it.

## Overview

The history of databases spans from flat files and hierarchical models in the 1960s through the relational model proposed by Edgar Codd in 1970, to the explosion of NoSQL databases in the 2000s and the current era of purpose-built databases optimized for specific workloads. Modern applications rarely rely on a single database; instead, they adopt polyglot persistence, choosing different databases for different access patterns.

The Prismatic Platform's 115-application umbrella architecture generates diverse data access patterns that no single database technology can optimally serve. Relational queries require PostgreSQL's query planner and ACID guarantees. Agent state requires ETS's microsecond-latency in-memory access. OSINT search requires Meilisearch's typo-tolerant full-text indexing. Entity relationship analysis requires KuzuDB's graph traversal. Session caching requires Redis's distributed key-value store. And analytical queries over historical data require DuckDB's columnar storage.

This polyglot approach is not complexity for complexity's sake. Each database was chosen through evidence-based evaluation against specific performance, consistency, and operational requirements. The platform's [Ecto](/glossary/ecto/) layer and custom storage adapters abstract the differences, providing a unified interface for application code while leveraging each engine's strengths.

Understanding databases is fundamental because every other platform capability -- from OSINT intelligence gathering to [security assessments](/glossary/security-assessment/) to [belief graph](/glossary/belief-graph/) construction -- ultimately depends on reliable, performant data persistence.

## Technical Details

### Relational Database Fundamentals

Relational databases organize data into tables (relations) with rows (tuples) and columns (attributes). They enforce schemas, support complex queries through SQL, and guarantee ACID properties: Atomicity (transactions are all-or-nothing), Consistency (data always satisfies constraints), Isolation (concurrent transactions don't interfere), and Durability (committed data survives failures).

PostgreSQL, the Prismatic Platform's primary relational database, extends the standard relational model with advanced features: JSONB for semi-structured data, full-text search with tsvector, range types for temporal data, and sophisticated indexing including B-tree, GiST, GIN, and BRIN indexes. The platform leverages these extensions extensively.

### In-Memory Databases

ETS (Erlang Term Storage) provides an in-memory key-value and tuple store built into the BEAM virtual machine. Unlike external databases, ETS is accessed through native Erlang/Elixir function calls with no serialization overhead, achieving sub-microsecond read latency. ETS tables can be configured as sets, ordered sets, bags, or duplicate bags, each optimized for different access patterns.

The platform uses ETS extensively for agent state, provenance caches, configuration registries, and hot data that would create unacceptable latency if stored in PostgreSQL. ETS data does not survive process crashes (unless the table owner is a dedicated process with a supervisor), so ETS is always backed by a durable store for data that must persist.

### Search Databases

Meilisearch provides typo-tolerant, instant full-text search with relevancy ranking. Unlike PostgreSQL's built-in full-text search, Meilisearch is optimized specifically for search workloads, providing sub-50ms query times even on large document collections. The platform indexes OSINT findings, glossary terms, agent documentation, and security reports for instant searchability.

### Graph Databases

KuzuDB provides an embedded graph database optimized for property graph queries with Cypher-like syntax. Graph databases excel at traversing relationships -- finding paths, detecting cycles, and computing graph metrics -- operations that would require expensive recursive CTEs or multiple joins in a relational database. The platform uses KuzuDB for entity relationship analysis, attack surface graph modeling, and knowledge graph construction.

### Columnar Analytics

DuckDB provides an embedded columnar analytics database optimized for OLAP workloads. While PostgreSQL handles transactional queries well, analytical queries (aggregations, window functions, joins over millions of rows) benefit from DuckDB's columnar storage format, vectorized execution, and automatic parallelization. The platform uses DuckDB for historical analysis, trend detection, and reporting.

## Implementation in Prismatic Platform

### Multi-Backend Storage Coordinator

The platform coordinates across all six database backends through a unified storage layer:

```elixir
defmodule Prismatic.Storage.Coordinator do
  @moduledoc """
  Coordinates data access across the Prismatic Platform's
  polyglot persistence backends.

  Routes operations to the optimal backend based on workload
  characteristics, handles cross-backend consistency, and
  provides failover when a backend is unavailable.
  """

  alias Prismatic.Storage.{EtsAdapter, EctoAdapter, SearchAdapter, GraphAdapter}

  @type backend :: :postgresql | :ets | :meilisearch | :kuzudb | :redis | :duckdb
  @type operation :: :read | :write | :search | :graph | :analytics | :cache

  @type routing_result :: %{
    backend: backend(),
    latency_budget_ms: non_neg_integer(),
    consistency: :strong | :eventual,
    fallback: backend() | nil
  }

  @spec route(operation(), keyword()) :: routing_result()
  def route(operation, opts \\ []) do
    case operation do
      :read ->
        if Keyword.get(opts, :hot, false) do
          %{backend: :ets, latency_budget_ms: 1, consistency: :eventual, fallback: :postgresql}
        else
          %{backend: :postgresql, latency_budget_ms: 50, consistency: :strong, fallback: nil}
        end

      :write ->
        %{backend: :postgresql, latency_budget_ms: 100, consistency: :strong, fallback: nil}

      :search ->
        %{backend: :meilisearch, latency_budget_ms: 50, consistency: :eventual, fallback: :postgresql}

      :graph ->
        %{backend: :kuzudb, latency_budget_ms: 200, consistency: :eventual, fallback: :postgresql}

      :analytics ->
        %{backend: :duckdb, latency_budget_ms: 5000, consistency: :eventual, fallback: :postgresql}

      :cache ->
        %{backend: :redis, latency_budget_ms: 5, consistency: :eventual, fallback: :ets}
    end
  end

  @spec execute(operation(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  def execute(operation, query, opts \\ []) do
    %{backend: backend, fallback: fallback} = route(operation, opts)

    case dispatch(backend, query, opts) do
      {:ok, result} ->
        emit_telemetry(:success, backend, operation)
        {:ok, result}

      {:error, reason} when not is_nil(fallback) ->
        emit_telemetry(:fallback, backend, operation)
        dispatch(fallback, query, opts)

      {:error, reason} ->
        emit_telemetry(:failure, backend, operation)
        {:error, reason}
    end
  end

  @spec dispatch(backend(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  defp dispatch(:ets, query, opts), do: EtsAdapter.execute(query, opts)
  defp dispatch(:postgresql, query, opts), do: EctoAdapter.execute(query, opts)
  defp dispatch(:meilisearch, query, opts), do: SearchAdapter.execute(query, opts)
  defp dispatch(:kuzudb, query, opts), do: GraphAdapter.execute(query, opts)
  defp dispatch(backend, _query, _opts), do: {:error, {:unsupported_backend, backend}}

  defp emit_telemetry(status, backend, operation) do
    :telemetry.execute(
      [:prismatic, :storage, :coordinator, status],
      %{count: 1},
      %{backend: backend, operation: operation}
    )
  end
end
```

### Ecto Schema with Multi-Backend Awareness

Ecto schemas in the platform include metadata for routing decisions:

```elixir
defmodule Prismatic.Schema.SecurityFinding do
  @moduledoc """
  Schema for security findings with multi-backend persistence.

  Primary storage in PostgreSQL via Ecto, with ETS caching
  for hot findings and Meilisearch indexing for search.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
    id: Ecto.UUID.t(),
    domain: String.t(),
    severity: atom(),
    category: String.t(),
    description: String.t(),
    evidence: map(),
    confidence: float(),
    discovered_at: DateTime.t(),
    resolved_at: DateTime.t() | nil
  }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "security_findings" do
    field :domain, :string
    field :severity, Ecto.Enum, values: [:critical, :high, :medium, :low, :info]
    field :category, :string
    field :description, :string
    field :evidence, :map, default: %{}
    field :confidence, :float, default: 1.0
    field :discovered_at, :utc_datetime_usec
    field :resolved_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields ~w(domain severity category description discovered_at)a
  @optional_fields ~w(evidence confidence resolved_at)a

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(%__MODULE__{} = finding, attrs) do
    finding
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:severity, [:critical, :high, :medium, :low, :info])
    |> validate_number(:confidence, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0)
  end
end
```

### ETS Cache with TTL and Write-Through

The platform implements write-through caching where writes go to both ETS and PostgreSQL:

```elixir
defmodule Prismatic.Storage.CacheLayer do
  @moduledoc """
  Write-through cache layer using ETS with configurable TTL.

  Provides sub-microsecond reads for hot data while maintaining
  PostgreSQL as the durable source of truth.
  """

  use GenServer

  @type cache_entry :: {key :: term(), value :: term(), expires_at :: integer()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec get(atom(), term()) :: {:ok, term()} | :miss
  def get(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value, expires_at}] ->
        if System.monotonic_time(:millisecond) < expires_at do
          {:ok, value}
        else
          :ets.delete(table, key)
          :miss
        end

      [] ->
        :miss
    end
  end

  @spec put(atom(), term(), term(), non_neg_integer()) :: :ok
  def put(table, key, value, ttl_ms \\ 300_000) do
    expires_at = System.monotonic_time(:millisecond) + ttl_ms
    :ets.insert(table, {key, value, expires_at})
    :ok
  end

  @impl true
  def init(opts) do
    table_name = Keyword.get(opts, :table, :prismatic_cache)
    table = :ets.new(table_name, [:set, :public, :named_table, read_concurrency: true])
    cleanup_interval = Keyword.get(opts, :cleanup_interval, :timer.minutes(1))

    Process.send_after(self(), :cleanup_expired, cleanup_interval)

    {:ok, %{table: table, cleanup_interval: cleanup_interval}}
  end

  @impl true
  def handle_info(:cleanup_expired, state) do
    now = System.monotonic_time(:millisecond)

    :ets.foldl(
      fn {key, _value, expires_at}, acc ->
        if expires_at < now, do: :ets.delete(state.table, key)
        acc
      end,
      :ok,
      state.table
    )

    Process.send_after(self(), :cleanup_expired, state.cleanup_interval)
    {:noreply, state}
  end
end
```

## Comparison with Alternatives

### Single Database vs. Polyglot Persistence

Many applications use a single database (typically PostgreSQL or MySQL) for all workloads. This simplifies operations but forces compromises: relational databases handle search, graphs, and analytics adequately but not optimally. The Prismatic Platform's polyglot approach adds operational complexity but ensures each workload is served by the best available technology. The complexity is managed through the Storage Coordinator abstraction layer.

### PostgreSQL vs. MySQL

PostgreSQL is the Prismatic Platform's choice for relational storage. Compared to MySQL, PostgreSQL offers superior JSON support (JSONB with indexing), advanced indexing (GiST, GIN, BRIN), better standards compliance, range types, materialized views, and more extensible type system. MySQL has advantages in simple read-heavy workloads and some replication scenarios, but PostgreSQL's feature set better matches the platform's complex query patterns.

### ETS vs. Redis for Caching

Both ETS and [Redis](/glossary/redis/) serve as caching layers, but their characteristics differ fundamentally. ETS is in-process, zero-serialization, sub-microsecond, and limited to a single BEAM node. Redis is networked, requires serialization, has microsecond-to-millisecond latency, but provides distributed access and persistence options. The platform uses ETS for node-local hot caching and Redis for shared state across a cluster.

### Meilisearch vs. Elasticsearch

Meilisearch was chosen over Elasticsearch for its dramatically simpler operational model, lower resource requirements, and faster out-of-box performance for the platform's search workloads. Elasticsearch offers more sophisticated aggregation and analytics capabilities, but Meilisearch's instant search with typo tolerance covers the platform's primary use case (OSINT search, documentation search) with far less operational overhead.

### KuzuDB vs. Neo4j

[KuzuDB](/glossary/kuzudb/) is an embedded graph database, while Neo4j is a client-server graph database. KuzuDB was chosen for its embeddability (no separate server process), high performance on relationship-heavy queries, and Elixir-friendly integration via NIFs. Neo4j would require a separate infrastructure component and network communication overhead that KuzuDB avoids.

## Best Practices

**Choose the right database for the workload.** Do not force all data into a single database. Evaluate each data access pattern -- read/write ratio, query complexity, latency requirements, consistency needs -- and select the technology that best serves it. The Storage Coordinator pattern makes this manageable.

**Use Ecto for all PostgreSQL access.** Never write raw SQL queries scattered through application code. Ecto's changesets provide validation, its query DSL is composable and type-safe, and its migration system ensures reproducible schema evolution. Raw SQL is acceptable only in hand-optimized performance-critical queries, encapsulated in dedicated modules.

**Implement connection pooling.** Database connections are expensive resources. The platform uses [connection pooling](/glossary/connection-pooling/) (via DBConnection) for PostgreSQL and HTTP connection pools for Meilisearch. Monitor pool utilization and adjust sizes based on actual load patterns, not guesses.

**Monitor query performance.** Enable PostgreSQL's `pg_stat_statements` extension and monitor slow queries. Use `EXPLAIN ANALYZE` for query optimization. Set up alerts for queries exceeding latency budgets. The platform's telemetry system tracks query latencies across all backends.

**Design for failure.** Every database can fail. The Storage Coordinator implements fallback routing so that if Meilisearch is down, search queries degrade gracefully to PostgreSQL's built-in full-text search. Critical data must be durably stored in PostgreSQL; ETS and Redis caches should be treated as lossy.

**Version your schemas.** Use Ecto migrations for all PostgreSQL schema changes. Never modify schemas manually in production. Migrations should be reversible when possible and thoroughly tested in staging before production deployment.

## Common Pitfalls

**N+1 query patterns.** The most common performance issue in Ecto-based applications is loading associations lazily in loops, generating N+1 queries. Use `Ecto.Query.preload/3` to eagerly load associations in a single query. The platform's Credo configuration includes custom checks for N+1 patterns.

**ETS table ownership issues.** ETS tables are owned by the process that created them. If that process crashes, the table is destroyed. Always create ETS tables in a dedicated process under a supervisor, never in transient processes. The platform uses named tables owned by long-lived GenServers.

**Ignoring connection pool exhaustion.** Under load, all database connections can be checked out, causing new requests to queue or fail. Monitor pool utilization with telemetry, set appropriate pool sizes in configuration, and implement circuit breakers to prevent cascade failures when a database is overwhelmed.

**Premature denormalization.** Denormalizing data for performance before measuring actual performance leads to data consistency issues and increased complexity. Start with normalized schemas, identify bottlenecks through profiling, and denormalize only where measurements prove it necessary.

**Missing indexes.** Queries without appropriate indexes perform full table scans, degrading exponentially as data grows. Index every column used in WHERE clauses, JOIN conditions, and ORDER BY expressions. But do not over-index -- each index slows writes and consumes storage.

**Treating DuckDB/Meilisearch as primary stores.** Specialized databases should be treated as derived views of the primary PostgreSQL data. If DuckDB data is lost, it should be reconstructable from PostgreSQL. If Meilisearch indexes are corrupted, they should be rebuildable from the source of truth.

## Use Cases

### Multi-Backend OSINT Intelligence Storage

OSINT findings from 120 adapters are stored in PostgreSQL for durability, cached in ETS for real-time dashboard rendering, indexed in Meilisearch for analyst search, and loaded into KuzuDB for entity relationship analysis. Each backend serves its specific access pattern optimally.

### Real-Time Agent State Management

The platform's 530+ agents maintain their state in ETS for sub-microsecond access during decision-making. State snapshots are periodically persisted to PostgreSQL for crash recovery. Redis provides distributed state sharing when agents need to coordinate across cluster nodes.

### Security Rating Analytics

Historical security scan data is loaded into DuckDB for analytical queries: trend analysis, percentile calculations, industry benchmarking. These analytical workloads would strain PostgreSQL's row-oriented storage but run efficiently on DuckDB's columnar engine.

### Full-Text Search Across Platform Knowledge

All glossary terms, agent documentation, command references, and OSINT findings are indexed in Meilisearch, providing instant typo-tolerant search across the entire platform knowledge base. The search index is rebuilt from PostgreSQL source data during deployments.

### Attack Surface Graph Analysis

Entity relationships discovered during EASM scanning -- domains pointing to IPs, IPs hosting services, services presenting certificates -- are modeled as a property graph in KuzuDB. Graph queries identify attack paths, shared infrastructure, and hidden dependencies that would require expensive recursive SQL in a relational database.

## Related Concepts

- [PostgreSQL](/glossary/postgresql/) -- The primary relational database for durable ACID storage across the platform
- [ETS](/glossary/ets/) -- BEAM-native in-memory storage for sub-microsecond agent state and caching
- [Meilisearch](/glossary/meilisearch/) -- Typo-tolerant full-text search engine for OSINT and documentation search
- [KuzuDB](/glossary/kuzudb/) -- Embedded graph database for entity relationship and attack surface analysis
- [Redis](/glossary/redis/) -- Distributed cache and pub/sub for cross-node state sharing
- [DuckDB](/glossary/duckdb/) -- Columnar analytics database for historical analysis and reporting
- [Ecto](/glossary/ecto/) -- Elixir database toolkit providing schemas, changesets, queries, and migrations
- [Relational Database](/glossary/relational-database/) -- The foundational database model used by PostgreSQL
- [Connection Pooling](/glossary/connection-pooling/) -- Resource management pattern critical for database performance
- [CAP Theorem](/glossary/cap-theorem/) -- The fundamental tradeoff governing distributed database design
- [Event Sourcing](/glossary/event-sourcing/) -- Alternative persistence pattern storing events rather than current state
- [Data Pipeline](/glossary/data-pipeline/) -- The data flow infrastructure that feeds all database backends

## See Also

- [ETS Table](/glossary/ets-table/) -- Detailed coverage of ETS table types and configuration
- [Distributed System](/glossary/distributed-system/) -- The architectural context in which polyglot persistence operates
- [Eventual Consistency](/glossary/eventual-consistency/) -- The consistency model used by ETS, Meilisearch, and Redis caches
- [Data Provenance](/glossary/data-provenance/) -- Provenance tracking that spans all database backends
- [Adapter Pattern](/glossary/adapter-pattern/) -- The pattern used to abstract differences between storage backends

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
