+++
title = "PostgreSQL"
weight = 39
[extra]
category = "database"
description = "Advanced open-source relational database providing ACID transactions, extensible type system, full-text search, JSON support, and TimescaleDB extension for time-series data in the Prismatic Platform"
abbreviation = "PG"
related_terms = ["otp", "beam", "ecto", "timescaledb", "redis", "connection-pooling", "adapter-pattern", "data-pipeline", "encryption-at-rest", "event-sourcing"]
domain = "persistence"
complexity = "advanced"
platform_adoption = "universal"
version = "16+"
mvcc_model = "snapshot-isolation"
default_isolation = "read-committed"
extension_ecosystem = "PostGIS, TimescaleDB, pgvector, pg_trgm, Citus"
max_connections_default = 100
wal_mechanism = "write-ahead-log"
replication_modes = ["streaming", "logical", "synchronous"]
index_types = ["B-tree", "GIN", "GiST", "BRIN", "Hash", "SP-GiST"]
json_support = "JSONB"
full_text_search = true
prismatic_repositories = "multiple"
storage_adapter = "prismatic_storage_ecto"
elixir_driver = "postgrex"
connection_pool = "db_connection"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1794
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PostgreSQL", "Advanced", "ACID", "JSON", "TimescaleDB", "Prismatic", "Platform", "glossary", "database", "Prismatic Platform"]
tags = ["glossary", "database", "postgresql", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "PostgreSQL - Prismatic Platform"
+++

## Definition and Overview

PostgreSQL is an advanced, open-source object-relational database management system (ORDBMS) with over 35 years of active development, originating from the POSTGRES project at the University of California, Berkeley in 1986. It is widely regarded as the most feature-complete open-source relational database available, combining full SQL compliance with advanced capabilities that many commercial databases lack -- including native JSONB storage, full-text search, window functions, recursive CTEs, range types, array columns, and an extensible type system that allows developers to define custom data types, operators, and index methods.

PostgreSQL's architecture is built on Multi-Version Concurrency Control (MVCC), which enables high-throughput concurrent access by maintaining multiple versions of each row rather than using read locks. Writers never block readers, and readers never block writers, making PostgreSQL suitable for both OLTP (Online Transaction Processing) workloads with many concurrent short transactions and OLAP (Online Analytical Processing) workloads with complex long-running queries. The sophisticated query planner uses cost-based optimization with extensive statistics to choose execution strategies across nested loops, hash joins, merge joins, and parallel query execution.

The extension ecosystem is one of PostgreSQL's most distinguishing features. Extensions like PostGIS (geospatial), [TimescaleDB](/glossary/timescaledb/) (time-series), pg_trgm (trigram matching), pgvector (vector similarity search), and Citus (distributed tables) transform PostgreSQL into a specialized database for virtually any domain without sacrificing the core relational guarantees. This extensibility allows organizations to consolidate multiple specialized databases into a single PostgreSQL deployment, reducing operational complexity.

Within the Prismatic Platform, PostgreSQL is the authoritative data store for all persistent state, accessed through [Ecto](/glossary/ecto/) repositories in the `prismatic_storage_ecto` adapter. The platform leverages PostgreSQL's JSONB capabilities for semi-structured metadata, its full-text search for intelligence queries, its ACID transactions for data integrity, and its extension ecosystem -- particularly [TimescaleDB](/glossary/timescaledb/) -- for time-series telemetry storage.

## Historical Context and Significance

PostgreSQL's lineage traces back to 1986, when Michael Stonebraker at UC Berkeley began the POSTGRES project as a successor to the Ingres relational database. The project explored innovative concepts including user-defined types, complex objects, and rules systems -- ideas that were decades ahead of the mainstream database industry. The original POSTGRES used a postfix query language called QUEL; the SQL interface was added in 1995 when the project was renamed PostgreSQL (then Postgres95) and released as open-source software.

The decision to open-source PostgreSQL proved transformative. A global community of contributors emerged, driving development at a pace that commercial database vendors could not match. Major milestones included MVCC (1999), point-in-time recovery (2004), hot standby and streaming replication (2010), JSONB (2014), logical replication (2017), and declarative partitioning (2017). Each release added capabilities that expanded PostgreSQL from a pure relational database into a multi-model database supporting relational, document, key-value, time-series, graph, and vector workloads.

PostgreSQL's significance in the Elixir ecosystem is particularly pronounced. The Postgrex driver and Ecto ORM provide first-class PostgreSQL support, and many Elixir libraries are designed with PostgreSQL-specific features in mind. The [BEAM](/glossary/beam/) concurrency model (many lightweight processes sharing connections through a pool) aligns naturally with PostgreSQL's connection-based architecture, making the combination highly efficient for concurrent workloads.

## Advanced Query Features

PostgreSQL provides query capabilities that go far beyond standard SQL, enabling complex analytical and hierarchical data processing within the database engine itself.

**Common Table Expressions (CTEs)** allow breaking complex queries into named, reusable subqueries that execute as temporary result sets within a single statement. Recursive CTEs enable traversal of hierarchical and graph-structured data.

```sql
-- Recursive CTE for hierarchical agent dependencies
WITH RECURSIVE agent_tree AS (
  -- Base case: top-level agents with no parent
  SELECT id, name, parent_id, 0 AS depth
  FROM agents
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: agents with parents in the tree
  SELECT a.id, a.name, a.parent_id, at.depth + 1
  FROM agents a
  INNER JOIN agent_tree at ON a.parent_id = at.id
)
SELECT * FROM agent_tree ORDER BY depth, name;
```

**Window Functions** perform calculations across sets of rows related to the current row without collapsing them into groups, enabling running totals, rankings, moving averages, and percentile calculations.

```sql
-- Security score trends with moving average
SELECT
  asset_id,
  measured_at,
  score,
  AVG(score) OVER (
    PARTITION BY asset_id
    ORDER BY measured_at
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7day,
  RANK() OVER (PARTITION BY asset_id ORDER BY score DESC) AS score_rank
FROM security_scores;
```

**JSONB Operations** provide document-database capabilities within the relational model, supporting indexing, containment queries, and path-based access on binary JSON data.

| Feature | Description | Example |
|---------|-------------|---------|
| **Path Access** | Navigate nested JSON structures | `data->'config'->>'timeout'` |
| **Containment** | Check if JSONB contains another JSONB | `data @> '{"status": "active"}'` |
| **Existence** | Test key existence | `data ? 'email'` |
| **GIN Index** | Inverted index for fast JSONB queries | `CREATE INDEX ON t USING GIN (data)` |
| **jsonb_set** | Immutable update of nested paths | `jsonb_set(data, '{config,timeout}', '30')` |
| **jsonb_agg** | Aggregate rows into JSONB array | `SELECT jsonb_agg(row) FROM t` |

## Full-Text Search

PostgreSQL includes a built-in full-text search engine that converts text into searchable tokens (tsvector) and queries into search patterns (tsquery), with support for stemming, ranking, highlighting, and phrase matching across multiple languages.

```sql
-- Full-text search with ranking
SELECT
  id, title,
  ts_rank(search_vector, query) AS rank
FROM intelligence_reports,
  to_tsquery('english', 'vulnerability & critical & !patched') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- Create optimized search index
CREATE INDEX idx_reports_search ON intelligence_reports USING GIN (search_vector);
```

Unlike external search engines such as Elasticsearch, PostgreSQL's full-text search operates within the same transactional context as the rest of the data, guaranteeing that search results are always consistent with the current state of the database without synchronization delays. For the Prismatic Platform, this eliminates the complexity of maintaining a separate search infrastructure while providing sufficient search capability for intelligence reports, vulnerability descriptions, and compliance documentation.

## ACID Transactions and Isolation

PostgreSQL provides full ACID (Atomicity, Consistency, Isolation, Durability) transaction support with four isolation levels:

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Serialization Anomaly |
|-----------------|-----------|---------------------|--------------|----------------------|
| **Read Uncommitted** | Not possible | Possible | Possible | Possible |
| **Read Committed** (default) | Not possible | Possible | Possible | Possible |
| **Repeatable Read** | Not possible | Not possible | Not possible | Possible |
| **Serializable** | Not possible | Not possible | Not possible | Not possible |

Note that PostgreSQL's MVCC implementation means "Read Uncommitted" behaves identically to "Read Committed" -- dirty reads are never possible. The Serializable isolation level uses Serializable Snapshot Isolation (SSI) to detect and prevent all anomalies without the performance penalty of traditional lock-based serializable isolation.

## Indexing Strategies

PostgreSQL offers multiple index types, each optimized for different query patterns:

| Index Type | Best For | Example Use Case |
|------------|----------|------------------|
| **B-tree** (default) | Equality and range queries | `WHERE score BETWEEN 700 AND 900` |
| **GIN** | Containment queries, full-text, JSONB | `WHERE tags @> ARRAY['critical']` |
| **GiST** | Geometric, range, full-text | `WHERE tsrange @> now()` |
| **BRIN** | Large ordered datasets | Time-series data with natural ordering |
| **Hash** | Equality-only lookups | `WHERE uuid = '...'` |
| **SP-GiST** | Non-balanced tree structures | IP address ranges, phone numbers |

**Partial indexes** index only rows matching a condition, reducing index size and maintenance cost for frequently filtered queries:

```sql
-- Index only active assets (partial index)
CREATE INDEX idx_active_assets ON assets (domain, last_seen)
WHERE status = 'active';

-- Covering index for common query pattern
CREATE INDEX idx_scores_covering ON security_scores (asset_id, measured_at)
INCLUDE (score, grade);
```

## Migration Strategy

Database schema changes in PostgreSQL-backed applications require careful migration management to ensure zero-downtime deployments and reversibility. [Ecto](/glossary/ecto/) provides a migration framework that tracks applied migrations and executes them in order.

```elixir
defmodule PrismaticStorage.Repo.Migrations.AddSecurityRatings do
  @moduledoc """
  Migration adding security ratings table with JSONB factors,
  composite indexes, and GIN index for JSONB queries.
  """

  use Ecto.Migration

  def change do
    create table(:security_ratings) do
      add :asset_id, references(:assets, on_delete: :delete_all), null: false
      add :grade, :string, null: false
      add :score, :integer, null: false
      add :factors, :jsonb, default: "{}"
      add :measured_at, :utc_datetime_usec, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:security_ratings, [:asset_id, :measured_at])
    create index(:security_ratings, [:grade])
    create index(:security_ratings, [:factors], using: :gin)
  end
end
```

Key migration principles for zero-downtime deployments:

- **Additive changes first**: Add new columns as nullable, backfill data, then add constraints
- **Never rename columns**: Add new column, migrate data, update code, drop old column
- **Concurrent index creation**: Use `CREATE INDEX CONCURRENTLY` to avoid table locks
- **Reversible migrations**: Always implement both `up` and `down` (or use `change`)

## Elixir Integration via Ecto

The Prismatic Platform accesses PostgreSQL exclusively through [Ecto](/glossary/ecto/), which provides a composable query DSL, schema definitions, changesets for data validation, and migration management:

```elixir
defmodule PrismaticStorage.Ecto.AssetRepository do
  @moduledoc """
  Repository module for security asset queries.
  Combines JSONB, full-text search, and window functions
  through Ecto's fragment macro for PostgreSQL-specific features.
  """

  import Ecto.Query

  alias PrismaticStorage.Repo
  alias PrismaticStorage.Schema.Asset

  @spec search_assets(String.t(), map()) :: {:ok, [Asset.t()]} | {:error, term()}
  def search_assets(query_string, filters) do
    results =
      from(a in Asset,
        where: fragment("? @@ to_tsquery('english', ?)", a.search_vector, ^query_string),
        where: fragment("? @> ?", a.metadata, ^filters),
        order_by: [desc: fragment("ts_rank(?, to_tsquery('english', ?))",
          a.search_vector, ^query_string)],
        limit: 50
      )
      |> Repo.all()

    {:ok, results}
  rescue
    error in Postgrex.Error ->
      {:error, {:database_error, error.message}}
  end

  @spec assets_with_score_trend(binary(), pos_integer()) :: {:ok, [map()]} | {:error, term()}
  def assets_with_score_trend(asset_id, window_size) do
    query = from(sr in "security_ratings",
      where: sr.asset_id == ^asset_id,
      select: %{
        score: sr.score,
        measured_at: sr.measured_at,
        moving_avg: fragment(
          "AVG(?) OVER (ORDER BY ? ROWS BETWEEN ? PRECEDING AND CURRENT ROW)",
          sr.score, sr.measured_at, ^window_size
        )
      },
      order_by: [desc: sr.measured_at],
      limit: 100
    )

    {:ok, Repo.all(query)}
  rescue
    error in Postgrex.Error ->
      {:error, {:database_error, error.message}}
  end
end
```

## Context in Prismatic Platform

PostgreSQL is the Prismatic Platform's primary persistent data store, accessed through [Ecto](/glossary/ecto/) repositories in the `prismatic_storage_ecto` adapter. The platform employs PostgreSQL across multiple domains:

**Structured Intelligence Data**: All intelligence records, agent state snapshots, compliance assessments, security ratings (A-F grades with numeric scores 300-900), user accounts, and immutable audit logs reside in PostgreSQL tables with strict schema enforcement.

**Semi-Structured Storage**: JSONB columns store flexible metadata -- agent configuration, scan parameters, raw API responses, and evidence artifacts -- that varies by record type but still requires queryable access and transactional consistency.

**Full-Text Search**: Content queries across intelligence reports, vulnerability descriptions, and compliance documentation use PostgreSQL's native full-text search with GIN indexes, avoiding the operational complexity of a separate search infrastructure.

**Time-Series Telemetry**: The [TimescaleDB](/glossary/timescaledb/) extension partitions [telemetry](/glossary/telemetry/) data (security score histories, agent performance metrics, system health measurements) into time-based hypertables with automatic chunk management and compression.

**Multi-Repository Architecture**: The platform uses multiple Ecto repositories for workload isolation -- separating transactional OLTP queries from analytical OLAP queries and background job processing, each with its own [connection pool](/glossary/connection-pooling/) configuration.

## Performance Tuning

| Parameter | Purpose | Typical Setting |
|-----------|---------|-----------------|
| `shared_buffers` | Memory for caching data pages | 25% of system RAM |
| `effective_cache_size` | Planner estimate of OS cache | 50-75% of system RAM |
| `work_mem` | Memory per sort/hash operation | 64-256MB (per operation) |
| `maintenance_work_mem` | Memory for VACUUM, CREATE INDEX | 512MB-1GB |
| `max_connections` | Maximum concurrent connections | 100-200 (use pooling) |
| `random_page_cost` | Planner cost for random I/O | 1.1 (SSD) to 4.0 (HDD) |
| `wal_level` | WAL detail level for replication | replica or logical |
| `checkpoint_completion_target` | WAL checkpoint spread | 0.9 |

The `EXPLAIN ANALYZE` command reveals the query planner's chosen execution strategy and actual runtime statistics, essential for identifying performance bottlenecks:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT a.domain, sr.grade, sr.score
FROM assets a
JOIN security_ratings sr ON sr.asset_id = a.id
WHERE sr.measured_at > NOW() - INTERVAL '7 days'
ORDER BY sr.score DESC
LIMIT 100;
```

## PostgreSQL vs Redis

PostgreSQL and [Redis](/glossary/redis/) serve complementary roles in the Prismatic Platform:

| Aspect | PostgreSQL | Redis |
|--------|------------|-------|
| **Storage** | Disk-based with buffer cache | In-memory with optional persistence |
| **Data Model** | Relational with schemas | Key-value with data structures |
| **Transactions** | Full ACID with isolation levels | Limited (single-command atomic) |
| **Query Language** | Full SQL | Command-based |
| **Latency** | 1-10ms typical | <0.1ms typical |
| **Durability** | Guaranteed (WAL) | Configurable (RDB/AOF/none) |
| **Use Case** | Authoritative data, complex queries | Caching, sessions, real-time state |

The platform follows the principle that PostgreSQL is the source of truth for all persistent data, while Redis serves as an acceleration layer for frequently accessed data and ephemeral state.

## Best Practices

1. **Use Ecto Migrations for All Schema Changes**: Never apply manual DDL in production. All schema changes must go through versioned, reversible Ecto migrations that are tracked in the `schema_migrations` table.

2. **Index Strategically**: Create indexes based on actual query patterns revealed by `EXPLAIN ANALYZE`, not guesses. Over-indexing slows writes; under-indexing slows reads. Monitor `pg_stat_user_indexes` for unused indexes.

3. **Leverage JSONB for Flexible Metadata**: Use JSONB columns for data that varies by record type, but always define a schema for the critical, queryable fields. Do not store everything in JSONB -- use proper columns for frequently filtered or joined fields.

4. **Connection Pooling is Mandatory**: PostgreSQL creates a new process for each connection. Use [connection pooling](/glossary/connection-pooling/) (DBConnection/Postgrex pool) to limit connection count and reuse connections efficiently.

5. **Use Prepared Statements**: Ecto uses prepared statements by default through Postgrex, eliminating SQL injection risk and improving query planning cache hit rates.

6. **Monitor with pg_stat**: Regularly check `pg_stat_user_tables`, `pg_stat_user_indexes`, and `pg_stat_activity` for table bloat, index usage, and long-running queries.

## Common Pitfalls

- **N+1 Queries**: Loading associated records one-by-one instead of using preloads or joins. Ecto's `Repo.preload/2` and join-based queries eliminate this pattern.

- **Missing Indexes on Foreign Keys**: PostgreSQL does not automatically index foreign key columns. Always create indexes on columns used in JOIN conditions and WHERE clauses.

- **VACUUM Neglect**: Dead tuples from MVCC accumulate without regular VACUUM. Enable autovacuum and monitor vacuum statistics.

- **Oversized Transactions**: Long-running transactions hold row versions and prevent cleanup. Keep transactions as short as possible.

- **Connection Exhaustion**: Without pooling, peak load can exhaust `max_connections`. Always use a connection pool and set reasonable pool sizes.

## Related Terms

- [Ecto](/glossary/ecto/) - Elixir database wrapper providing the query DSL and migration framework for PostgreSQL
- [TimescaleDB](/glossary/timescaledb/) - Time-series extension adding hypertables, compression, and continuous aggregates
- [Connection Pooling](/glossary/connection-pooling/) - Pool management for PostgreSQL connections via DBConnection
- [Redis](/glossary/redis/) - In-memory cache complementing PostgreSQL for ephemeral data
- [BEAM](/glossary/beam/) - Virtual machine hosting Ecto processes that connect to PostgreSQL
- [Adapter Pattern](/glossary/adapter-pattern/) - Storage adapter abstraction allowing PostgreSQL swap with other backends
- [Data Pipeline](/glossary/data-pipeline/) - ETL processes loading data into PostgreSQL
- [Encryption at Rest](/glossary/encryption-at-rest/) - Data protection for PostgreSQL storage volumes
- [Event Sourcing](/glossary/event-sourcing/) - Pattern storing events in PostgreSQL append-only tables
- [Telemetry](/glossary/telemetry/) - Observability events tracked in TimescaleDB hypertables

## See Also

- [prismatic_storage_ecto](../../../apps/prismatic_storage_ecto/README.md) -- Ecto/PostgreSQL storage adapter
- [prismatic_storage_core](../../../apps/prismatic_storage_core/README.md) -- Storage behaviour definitions
- [prismatic_perimeter](../../../apps/prismatic_perimeter/README.md) -- EASM data persisted in PostgreSQL
- [prismatic_osint_core](../../../apps/prismatic_osint_core/README.md) -- OSINT records stored in PostgreSQL
- [prismatic_audit](../../../apps/prismatic_audit/README.md) -- Audit trail stored in PostgreSQL
- [Architecture](/architecture/) -- Platform data architecture and storage patterns
- [Apps](/apps/) -- Applications using PostgreSQL storage

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
