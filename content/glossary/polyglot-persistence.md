+++
title = "Polyglot Persistence"
weight = 50
[extra]
tags = ["glossary", "polyglot", "persistence", "database", "ets", "postgresql", "meilisearch", "kuzudb", "elixir", "storage", "architecture", "data-modeling", "adapter-pattern"]
description = "Comprehensive guide to polyglot persistence strategies covering multi-database architectures, the Prismatic Platform's ETS+PostgreSQL+Meilisearch+KuzuDB storage layer, adapter-based data access patterns, consistency models, and practical implementation of heterogeneous storage in Elixir/OTP umbrella applications"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["database", "ets", "ets-table", "postgresql", "meilisearch", "kuzudb", "kuzu-db", "graph-database", "relational-database", "vector-database", "adapter-pattern", "adapter", "acid-transactions", "architectural-pattern", "architecture"]
learning_outcomes = ["Understand the polyglot persistence principle and when to apply it", "Evaluate database technologies based on data model fit and access patterns", "Design adapter-based storage abstractions that decouple business logic from storage backends", "Implement cross-database consistency strategies in Elixir/OTP systems", "Configure and operate the Prismatic Platform's four-database storage layer", "Apply the trait-based storage architecture pattern to new umbrella applications"]
prerequisites = ["database", "adapter-pattern", "elixir", "genserver", "ets"]
use_cases = ["Building multi-model data platforms", "Migrating from single-database to polyglot architectures", "Implementing full-text search alongside relational storage", "Adding graph query capabilities to existing applications", "Designing high-performance caching layers"]
key_technologies = ["Elixir", "PostgreSQL", "ETS", "Meilisearch", "KuzuDB", "Ecto", "GenServer", "Adapter Pattern"]
complexity = "advanced"
see_also = ["database", "ets", "postgresql", "meilisearch", "kuzudb", "adapter-pattern", "acid-transactions"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 3000
date_modified = "2026-02-23"
keywords = ["Polyglot", "Persistence", "Comprehensive", "Prismatic", "Platforms", "ETSPostgreSQLMeilisearchKuzuDB", "ElixirOTP", "glossary", "core", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Polyglot Persistence - Prismatic Platform"
+++

## Definition

Polyglot persistence is an architectural approach in which a software system uses multiple database technologies, each selected for its optimal fit with a specific data model, access pattern, or operational requirement. Rather than forcing all data into a single database engine -- whether relational, document, graph, or key-value -- polyglot persistence recognizes that different types of data have fundamentally different characteristics and are best served by purpose-built storage engines.

The term was popularized by Martin Fowler and Pramod Sadalage in their 2012 work on NoSQL databases, but the underlying principle is older: use the right tool for the job. A relational database excels at structured data with complex joins and transactional guarantees. A full-text search engine excels at natural language queries with relevance ranking. A graph database excels at traversing relationships between entities. A key-value store excels at low-latency lookups by identifier. No single engine excels at all of these simultaneously, and the attempt to make one engine serve all purposes inevitably leads to suboptimal performance, contorted data models, or both.

Polyglot persistence introduces its own complexity -- operational overhead from managing multiple database systems, consistency challenges across stores, and the need for abstraction layers that prevent storage concerns from leaking into business logic. The value proposition is that this complexity, when properly managed, is less costly than the performance, scalability, and modeling compromises of a single-database approach.

## Historical Context

The evolution toward polyglot persistence reflects the broader maturation of database technology and the increasing diversity of data workloads.

### The Relational Monopoly (1970s-2000s)

For three decades, relational databases held a near-monopoly on application data storage. Oracle, DB2, SQL Server, and later PostgreSQL and MySQL served as the universal data store for virtually every application. The relational model's strengths -- ACID transactions, SQL's expressive power, mature tooling -- made it the safe default, and its weaknesses (poor fit for hierarchical data, expensive full-text search, limited graph traversal performance) were either tolerated or worked around.

### The NoSQL Revolution (2007-2015)

The emergence of web-scale applications at companies like Google, Amazon, and Facebook exposed the relational model's limitations at extreme scale. Google's Bigtable (2006), Amazon's Dynamo (2007), and Facebook's Cassandra (2008) demonstrated that purpose-built databases could achieve performance and scalability impossible with general-purpose relational engines.

The NoSQL movement initially positioned itself as a replacement for relational databases, but the industry quickly learned that abandoning ACID transactions and SQL's query expressiveness created as many problems as it solved. The pendulum swung toward a more nuanced position: use relational databases where they excel, and complement them with purpose-built engines where they do not.

### The Polyglot Era (2012-present)

The polyglot persistence approach emerged as the mature synthesis of the relational and NoSQL perspectives. Modern applications routinely combine PostgreSQL for transactional data, Redis or Memcached for caching, Elasticsearch or Meilisearch for search, Neo4j or KuzuDB for graph queries, and S3 or MinIO for blob storage. The challenge shifted from choosing the "best" database to designing abstractions that manage the complexity of multiple databases coherently.

## The Prismatic Platform Storage Architecture

The Prismatic Platform implements polyglot persistence through a trait-based adapter architecture that spans its 115-application umbrella. Four database engines serve distinct roles, each selected for its optimal fit with specific platform requirements.

### Storage Layer Overview

| Engine | Role | Access Pattern | Data Characteristics |
|--------|------|---------------|---------------------|
| **ETS** | In-process cache, agent state, configuration | Key-value lookup, pattern matching | Hot data, ephemeral state, sub-millisecond access |
| **PostgreSQL** | Transactional data, audit logs, user accounts | Complex queries, joins, transactions | Structured data with referential integrity requirements |
| **Meilisearch** | Full-text search, faceted filtering | Natural language queries, typo tolerance | Text-heavy content, search indexes |
| **KuzuDB** | Graph relationships, entity networks, OSINT | Graph traversals, path queries, pattern matching | Relationship-centric data, network analysis |

### Trait-Based Storage Architecture

The Prismatic Platform abstracts storage access behind behaviours (traits) defined in `prismatic_storage_core`. Each storage adapter implements a consistent interface, allowing business logic to operate against abstract storage capabilities rather than concrete database implementations.

```elixir
defmodule PrismaticStorageCore.StorageTrait do
  @moduledoc """
  Core trait (behaviour) for all Prismatic storage adapters.

  Defines the minimal interface that every storage backend must
  implement, regardless of the underlying database technology.
  This abstraction enables polyglot persistence by decoupling
  business logic from storage implementation details.

  ## Adapters

  - `PrismaticStorageEts` - ETS-backed in-memory storage
  - `PrismaticStorageEcto` - PostgreSQL via Ecto
  - `PrismaticStorageMeilisearch` - Meilisearch full-text search
  - `PrismaticStorageKuzu` - KuzuDB graph storage

  ## Design Principles

  1. **Capability-based**: Adapters declare which capabilities
     they support (CRUD, search, graph traversal, transactions)
  2. **Composable**: Multiple adapters can be combined for a
     single domain entity (e.g., PostgreSQL for persistence +
     ETS for caching + Meilisearch for search)
  3. **Testable**: Contract tests verify adapter compliance

  ## Usage

      defmodule MyApp.Storage do
        @behaviour PrismaticStorageCore.StorageTrait

        @impl true
        def get(key, opts), do: # ...

        @impl true
        def put(key, value, opts), do: # ...

        @impl true
        def capabilities, do: [:get, :put, :delete, :list]
      end
  """

  @type key :: String.t() | atom() | tuple()
  @type value :: term()
  @type opts :: keyword()
  @type capability :: :get | :put | :delete | :list | :search
                    | :transaction | :graph_traverse | :full_text

  @callback get(key(), opts()) :: {:ok, value()} | {:error, term()}
  @callback put(key(), value(), opts()) :: {:ok, value()} | {:error, term()}
  @callback delete(key(), opts()) :: :ok | {:error, term()}
  @callback list(opts()) :: {:ok, [value()]} | {:error, term()}
  @callback capabilities() :: [capability()]
end
```

### ETS: The In-Memory Foundation

Erlang Term Storage (ETS) serves as the Prismatic Platform's primary in-memory data store. Unlike external caching systems (Redis, Memcached), ETS tables live in the same BEAM process space as the application, eliminating network roundtrip latency and serialization overhead.

```elixir
defmodule PrismaticStorageEts.Adapter do
  @moduledoc """
  ETS-backed storage adapter for the Prismatic Platform.

  Provides sub-millisecond key-value access with support for
  pattern matching, ordered traversal, and concurrent read/write
  access. Uses ETS write_concurrency and read_concurrency options
  for optimal performance under contention.

  ## Table Configuration

  Each domain gets its own ETS table with appropriate options:
  - Agent state: `:set` with `write_concurrency: true`
  - Configuration: `:set` with `read_concurrency: true`
  - Telemetry aggregates: `:set` with both concurrency options
  - Registry lookups: `:ordered_set` for range queries

  ## Performance Characteristics

  - Read: ~0.5 microseconds (single key lookup)
  - Write: ~1 microsecond (single key insert)
  - Pattern match: ~10-100 microseconds (depends on table size)
  - Memory: Approximately 200 bytes overhead per entry
  """

  @behaviour PrismaticStorageCore.StorageTrait

  @impl true
  @spec get(PrismaticStorageCore.StorageTrait.key(), keyword()) ::
          {:ok, term()} | {:error, :not_found}
  def get(key, opts \\ []) do
    table = Keyword.fetch!(opts, :table)

    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [{^key, value, _metadata}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  @spec put(
          PrismaticStorageCore.StorageTrait.key(),
          term(),
          keyword()
        ) :: {:ok, term()} | {:error, term()}
  def put(key, value, opts \\ []) do
    table = Keyword.fetch!(opts, :table)
    metadata = %{inserted_at: System.system_time(:microsecond)}

    true = :ets.insert(table, {key, value, metadata})
    {:ok, value}
  end

  @impl true
  @spec delete(PrismaticStorageCore.StorageTrait.key(), keyword()) :: :ok
  def delete(key, opts \\ []) do
    table = Keyword.fetch!(opts, :table)
    true = :ets.delete(table, key)
    :ok
  end

  @impl true
  @spec list(keyword()) :: {:ok, list()}
  def list(opts \\ []) do
    table = Keyword.fetch!(opts, :table)
    limit = Keyword.get(opts, :limit, 1000)

    results =
      :ets.tab2list(table)
      |> Enum.take(limit)
      |> Enum.map(fn
        {_key, value} -> value
        {_key, value, _meta} -> value
      end)

    {:ok, results}
  end

  @impl true
  @spec capabilities() :: [PrismaticStorageCore.StorageTrait.capability()]
  def capabilities do
    [:get, :put, :delete, :list]
  end
end
```

### PostgreSQL: The Transactional Backbone

PostgreSQL serves as the platform's system of record -- the authoritative source for data that requires ACID transactions, referential integrity, and complex query capabilities. The Prismatic Platform accesses PostgreSQL through Ecto, Elixir's database toolkit, which provides a composable query DSL, migration management, and connection pooling.

PostgreSQL's strengths align with specific platform requirements: user account management requires transactional guarantees, audit logs require immutable append-only tables with time-range queries, and compliance data requires referential integrity across entity relationships.

The platform leverages PostgreSQL extensions for specialized workloads: `pg_trgm` for trigram-based similarity search (faster than LIKE queries for fuzzy matching), `btree_gist` for exclusion constraints on temporal data, and JSONB columns for semi-structured data that does not warrant a full table schema.

### Meilisearch: The Search Layer

[Meilisearch](/glossary/meilisearch/) provides full-text search capabilities that complement PostgreSQL's `LIKE` and `ts_vector` functionality. Where PostgreSQL's full-text search is precise and SQL-integrated, Meilisearch offers typo tolerance, relevance ranking, faceted search, and sub-50ms query response times on large document collections.

The Prismatic Platform indexes several content types in Meilisearch: OSINT intelligence reports (enabling natural language search across investigation findings), glossary content (the 600+ term glossary with cross-references), agent documentation (searchable agent capabilities and specifications), and command documentation (searchable command registry).

The Meilisearch adapter handles index synchronization with PostgreSQL as the source of truth. A change event system detects writes to PostgreSQL and asynchronously updates the corresponding Meilisearch indexes, providing eventual consistency between the transactional store and the search index.

### KuzuDB: The Graph Engine

[KuzuDB](/glossary/kuzudb/) provides graph storage and query capabilities for relationship-centric data. The Prismatic Platform uses KuzuDB for corporate ownership networks (beneficial ownership chains), OSINT entity relationship mapping, dependency graphs between umbrella applications, and agent interaction networks.

Graph queries that would require recursive CTEs in PostgreSQL (expensive and complex to write) become natural Cypher traversals in KuzuDB. A query like "find all companies within three ownership hops of a sanctioned entity" is a straightforward path query in a graph database but a deeply nested recursive query in SQL.

The KuzuDB adapter maintains a graph that mirrors the entity relationships discovered through OSINT collection. When the OSINT pipeline discovers a new relationship (e.g., a person serves as a board member of a company), it creates both a PostgreSQL record (for transactional queries and audit trail) and a KuzuDB edge (for graph traversal queries).

## Cross-Database Consistency

Polyglot persistence introduces consistency challenges that do not exist in single-database architectures. When data is written to multiple databases, failures can create divergent state -- a record exists in PostgreSQL but not in Meilisearch, or a graph edge in KuzuDB references an entity that was deleted from PostgreSQL.

### Eventual Consistency Model

The Prismatic Platform adopts an eventual consistency model across its storage engines. PostgreSQL is the source of truth for all transactional data. Other databases are derived views that are eventually consistent with PostgreSQL through asynchronous synchronization.

```elixir
defmodule PrismaticStorageCore.SyncCoordinator do
  @moduledoc """
  Coordinates cross-database synchronization for polyglot persistence.

  Ensures that derived storage engines (Meilisearch indexes, KuzuDB
  graphs, ETS caches) are eventually consistent with the PostgreSQL
  source of truth.

  ## Synchronization Strategy

  1. Business logic writes to PostgreSQL (synchronous, transactional)
  2. Write success emits a telemetry event with the change
  3. SyncCoordinator consumes events and dispatches to derived stores
  4. Each derived store processes updates asynchronously
  5. Failed syncs are retried with exponential backoff
  6. Persistent failures trigger alerts via health monitoring

  ## Consistency Guarantees

  - PostgreSQL: Strong consistency (ACID)
  - ETS: Read-your-writes within the same node
  - Meilisearch: Eventual (typically < 500ms lag)
  - KuzuDB: Eventual (typically < 1s lag)
  """

  use GenServer

  @type sync_target :: :ets | :meilisearch | :kuzudb
  @type change_event :: %{
          entity_type: atom(),
          operation: :insert | :update | :delete,
          data: map(),
          timestamp: DateTime.t()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec notify_change(change_event()) :: :ok
  def notify_change(event) do
    GenServer.cast(__MODULE__, {:change, event})
  end

  @impl true
  def init(_opts) do
    state = %{
      pending: :queue.new(),
      retry_counts: %{},
      max_retries: 5
    }

    {:ok, state}
  end

  @impl true
  def handle_cast({:change, event}, state) do
    targets = targets_for_entity(event.entity_type)

    Enum.each(targets, fn target ->
      Task.Supervisor.start_child(
        PrismaticStorageCore.SyncTaskSupervisor,
        fn -> sync_to_target(target, event) end
      )
    end)

    {:noreply, state}
  end

  @spec sync_to_target(sync_target(), change_event()) :: :ok | {:error, term()}
  defp sync_to_target(:meilisearch, event) do
    PrismaticStorageMeilisearch.Sync.apply_change(event)
  end

  defp sync_to_target(:kuzudb, event) do
    PrismaticStorageKuzu.Sync.apply_change(event)
  end

  defp sync_to_target(:ets, event) do
    PrismaticStorageEts.Sync.apply_change(event)
  end

  @spec targets_for_entity(atom()) :: [sync_target()]
  defp targets_for_entity(:osint_entity), do: [:meilisearch, :kuzudb, :ets]
  defp targets_for_entity(:glossary_term), do: [:meilisearch, :ets]
  defp targets_for_entity(:agent_spec), do: [:meilisearch, :ets]
  defp targets_for_entity(_), do: [:ets]
end
```

### Conflict Resolution

When synchronization conflicts arise (typically due to concurrent writes during recovery from a sync failure), the platform applies a last-writer-wins strategy with PostgreSQL timestamps as the authoritative clock. Derived stores never override PostgreSQL data; they can only lag behind it.

## Operational Considerations

Operating a polyglot persistence architecture requires managing multiple database lifecycles, each with its own backup strategy, upgrade procedures, monitoring requirements, and failure modes.

**Backup coordination** ensures that point-in-time recovery produces consistent state across all databases. PostgreSQL's WAL-based backup provides the authoritative snapshot; derived stores are rebuilt from PostgreSQL during recovery rather than restored independently.

**Health monitoring** tracks the synchronization lag between PostgreSQL and derived stores. The platform's [health monitoring](/glossary/health-monitoring/) infrastructure checks Meilisearch index freshness and KuzuDB graph consistency as part of its regular health checks, alerting when lag exceeds configurable thresholds.

**Capacity planning** considers each engine's scaling characteristics independently. ETS scales with available memory on the BEAM node. PostgreSQL scales vertically (larger instances) or through read replicas. Meilisearch scales by index sharding. KuzuDB scales with available disk and memory for graph operations.

## When Polyglot Persistence Is Warranted

Polyglot persistence is not always the right choice. For applications with simple data models and straightforward access patterns, a single PostgreSQL database may serve all needs adequately. The overhead of managing multiple databases is justified only when the access pattern diversity is sufficient to produce measurable benefits.

**Indicators that polyglot persistence is warranted**: Full-text search queries that PostgreSQL's `ts_vector` handles too slowly. Graph traversal queries that require recursive CTEs beyond 3-4 levels. Sub-millisecond read latency requirements that network-attached databases cannot meet. Data volumes that exceed a single database engine's practical capacity.

**Indicators that a single database suffices**: All queries are simple CRUD operations. The data model is purely relational. The application has a single dominant access pattern. The team does not have operational expertise in multiple database technologies.

## Testing Polyglot Persistence

Testing polyglot persistence systems requires strategies that verify both individual adapter correctness and cross-database consistency.

The Prismatic Platform uses contract tests to verify that every storage adapter correctly implements the `StorageTrait` behaviour. Each adapter's test suite includes the shared contract tests plus adapter-specific tests for capabilities unique to that engine.

Integration tests verify cross-database consistency by writing data through the normal application path and verifying that all derived stores are eventually updated. These tests use polling with timeouts to account for asynchronous synchronization.

## Anti-Patterns in Polyglot Persistence

**The distributed monolith** occurs when all databases are tightly coupled through synchronous calls, negating the performance benefits of specialized engines. Each database interaction should be as independent as possible, with asynchronous synchronization rather than distributed transactions.

**Technology tourism** -- adopting a new database because it is trendy rather than because it solves a specific problem -- adds operational complexity without proportional benefit. Every database in the architecture must justify its presence with a concrete use case that the existing engines cannot adequately serve.

**Leaking abstractions** occur when business logic contains database-specific code rather than operating through the storage trait interface. This defeats the purpose of the abstraction layer and creates coupling that makes it difficult to change or upgrade storage backends.

## Cross-References

- [Database](/glossary/database/) -- General database concepts and terminology
- [ETS](/glossary/ets/) -- Erlang Term Storage in-memory data store
- [ETS Table](/glossary/ets-table/) -- ETS table types and configuration
- [PostgreSQL](/glossary/postgresql/) -- Primary relational database
- [Meilisearch](/glossary/meilisearch/) -- Full-text search engine
- [KuzuDB](/glossary/kuzudb/) -- Embedded graph database
- [Graph Database](/glossary/graph-database/) -- Graph storage concepts
- [Relational Database](/glossary/relational-database/) -- Relational model fundamentals
- [ACID Transactions](/glossary/acid-transactions/) -- Transactional consistency guarantees
- [Adapter Pattern](/glossary/adapter-pattern/) -- Design pattern for storage abstraction
- [Adapter](/glossary/adapter/) -- Adapter implementation concepts
- [Vector Database](/glossary/vector-database/) -- Vector storage for embeddings

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
