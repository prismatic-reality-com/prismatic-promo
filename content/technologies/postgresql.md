+++
title = "PostgreSQL"
weight = 30
[extra]
category = "database"
description = "Advanced open-source relational database with rich extension ecosystem and enterprise-grade reliability"
url = "https://www.postgresql.org"
version = "16+"
icon = "postgres"
color = "blue"
status = "active"
reading_time = "9 min"
keywords = ["PostgreSQL database platform", "JSONB column indexing", "TimescaleDB time-series data", "Ecto PostgreSQL integration", "relational database ACID", "PostgreSQL full-text search", "pgvector AI embeddings", "enterprise database reliability"]
tags = ["postgresql", "database", "sql", "persistence"]
author = "Tomas Korcak (korczis)"
word_count = 1080
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "PostgreSQL - Prismatic Platform"
+++

## Overview

PostgreSQL is the primary persistent data store for the Prismatic Platform, handling all relational data including user accounts, security assessments, compliance records, agent configurations, and intelligence analysis results. PostgreSQL's advanced features -- JSONB columns, full-text search, window functions, CTEs, and its rich extension ecosystem -- make it the ideal foundation for the platform's complex data requirements that span structured relational data, semi-structured JSON documents, and time-series telemetry.

The Prismatic Platform leverages PostgreSQL's ACID compliance and row-level security for multi-tenant data isolation, its LISTEN/NOTIFY mechanism for real-time event propagation to [Phoenix PubSub](/technologies/pubsub/), and its extensive indexing options (B-tree, GIN, GiST, BRIN) for query performance optimization across millions of intelligence records. The database serves as the single source of truth for all persistent platform state, with [ETS](/technologies/ets/) and [Redis](/technologies/redis/) serving as caching layers that derive their data from PostgreSQL.

PostgreSQL's extension ecosystem is critical to the platform: [TimescaleDB](/technologies/timescaledb/) adds time-series capabilities for metrics and telemetry, pgvector enables AI embedding storage for semantic search, and PostGIS supports geospatial intelligence operations. These extensions integrate transparently through the standard SQL interface, allowing [Ecto](/technologies/ecto/) to interact with them using native query fragments.

## Key Features

- **ACID Compliance**: Full transactional integrity with serializable isolation level support, ensuring data consistency even under concurrent writes from multiple platform services
- **JSONB**: Binary JSON storage with GIN indexing and query operators (`@>`, `?`, `#>>`) for flexible semi-structured data alongside relational schemas
- **Full-Text Search**: Built-in text search with `tsvector`/`tsquery`, ranking, stemming, and language-specific dictionaries for multi-lingual intelligence data
- **Extensions**: TimescaleDB (time-series), pgvector (AI embeddings), PostGIS (geospatial), pg_stat_statements (query analysis), and more
- **Window Functions**: Advanced analytical queries with `ROW_NUMBER()`, `LAG()`, `LEAD()`, `RANK()` over result partitions for trend analysis
- **Table Partitioning**: Declarative range and list partitioning for managing large datasets with automatic partition pruning
- **Logical Replication**: Selective data replication across instances for read replicas, analytics databases, and cross-region availability
- **CTEs and Recursive Queries**: Common table expressions for complex hierarchical queries traversing agent dependency trees and organizational structures

## Platform Integration

PostgreSQL stores all persistent data through [Ecto](/technologies/ecto/) repositories. The platform uses both simple CRUD operations and complex analytical queries that leverage PostgreSQL-specific features.

```elixir
defmodule PrismaticPerimeter.Queries.AssetRisk do
  import Ecto.Query

  @doc "Find high-risk assets for a domain with vulnerability aggregation"
  def high_risk_assets(domain, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, 7.0)

    from(a in Asset,
      join: v in assoc(a, :vulnerabilities),
      where: a.domain == ^domain and v.cvss_score >= ^threshold,
      group_by: a.id,
      select: %{
        asset: a,
        vuln_count: count(v.id),
        max_severity: max(v.cvss_score),
        avg_severity: avg(v.cvss_score)
      },
      order_by: [desc: max(v.cvss_score)]
    )
    |> Repo.all()
  end

  @doc "Security rating trend using window functions"
  def rating_trend(domain, days \\ 30) do
    from(r in Rating,
      where: r.domain == ^domain and r.assessed_at > ago(^days, "day"),
      windows: [ordered: [order_by: r.assessed_at]],
      select: %{
        date: r.assessed_at,
        score: r.score,
        grade: r.grade,
        change: r.score - lag(r.score) |> over(:ordered)
      }
    )
    |> Repo.all()
  end

  @doc "JSONB query for assets with specific metadata attributes"
  def assets_with_metadata(domain, key, value) do
    from(a in Asset,
      where: a.domain == ^domain,
      where: fragment("metadata @> ?", ^%{key => value}),
      order_by: [desc: a.discovered_at]
    )
    |> Repo.all()
  end
end
```

Database migrations use Ecto's migration system with PostgreSQL-specific extensions for features like hypertable creation and index types:

```elixir
defmodule PrismaticStorage.Repo.Migrations.CreateAssets do
  use Ecto.Migration

  def change do
    create table(:assets, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :domain, :string, null: false
      add :type, :string, null: false
      add :address, :string
      add :metadata, :map, default: %{}
      add :risk_score, :float, default: 0.0
      add :discovered_at, :utc_datetime_usec, null: false
      timestamps(type: :utc_datetime_usec)
    end

    create index(:assets, [:domain])
    create index(:assets, [:type])
    create index(:assets, [:metadata], using: :gin)
    create index(:assets, [:discovered_at], using: :brin)
  end
end
```

## Architecture

PostgreSQL serves as the persistence foundation of the platform's data architecture, with multiple layers of caching and access patterns built on top.

| Layer | Component | Access Pattern |
|-------|-----------|----------------|
| **Application** | [Ecto](/technologies/ecto/) queries | Structured queries via Ecto.Query DSL |
| **Connection Pool** | DBConnection + Postgrex | Connection pooling with queue management |
| **Cache** | [ETS](/technologies/ets/) / [Redis](/technologies/redis/) | Read-through cache for frequently accessed data |
| **Database** | PostgreSQL 16 | Primary storage with ACID guarantees |
| **Extensions** | TimescaleDB, pgvector | Specialized storage for time-series and embeddings |
| **Replication** | Logical replication | Read replicas for analytics workloads |

## LISTEN/NOTIFY and Real-Time Events

PostgreSQL's LISTEN/NOTIFY mechanism plays an important role in the platform's real-time architecture. When a security finding is inserted or a rating is updated, database triggers can emit notifications that the Elixir application receives through the Postgrex connection, bridging the gap between database changes and application-level event propagation via [Phoenix PubSub](/technologies/pubsub/).

This database-driven event system ensures that changes made by background jobs, migrations, or direct SQL operations are captured and broadcast to connected dashboard clients, providing a comprehensive event stream that does not depend on the application layer for completeness.

```elixir
defmodule PrismaticStorage.Listener do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    {:ok, pid} = Postgrex.Notifications.start_link(database: "prismatic_dev")
    Postgrex.Notifications.listen!(pid, "security_findings")
    Postgrex.Notifications.listen!(pid, "rating_updates")
    {:ok, %{pid: pid}}
  end

  def handle_info({:notification, _pid, _ref, channel, payload}, state) do
    event = Jason.decode!(payload)
    Phoenix.PubSub.broadcast!(PrismaticWeb.PubSub, channel, {:db_event, event})
    {:noreply, state}
  end
end
```

## Indexing Strategy

The platform employs a deliberate indexing strategy that matches index types to query patterns, ensuring optimal performance across the diverse access patterns of security intelligence data.

| Index Type | Use Case | Platform Example |
|-----------|----------|-----------------|
| **B-tree** | Equality and range queries | `domain`, `type`, `created_at` columns |
| **GIN** | JSONB containment, array inclusion | `metadata` JSONB column, `tags` array column |
| **GiST** | Full-text search, geometric data | `tsvector` columns for intelligence text search |
| **BRIN** | Naturally ordered data (timestamps) | `discovered_at`, `assessed_at` for time-range queries |
| **Partial** | Conditional queries on hot data | `WHERE status = 'active'` on large asset tables |
| **Composite** | Multi-column queries | `(domain, type)` for filtered asset listings |

## Performance Characteristics

The platform's PostgreSQL instance is tuned for a mixed workload of OLTP transactions and analytical queries, with connection pooling to prevent exhaustion under concurrent load.

| Metric | Value | Configuration |
|--------|-------|---------------|
| Connection pool size | 20 | Per-application Ecto repo |
| Simple query latency | <1ms | Indexed lookups |
| Complex join query | 5-50ms | Aggregation with GROUP BY |
| JSONB containment query | <5ms | GIN-indexed metadata |
| Full-text search | <10ms | tsvector with GIN index |
| Bulk insert (1000 rows) | ~50ms | Using `Repo.insert_all/3` |
| Database size | ~5GB | Development; grows with intelligence data |
| Index hit ratio | >99% | `pg_stat_user_indexes` monitoring |

## Configuration

```elixir
# config/config.exs
config :prismatic, PrismaticStorage.Repo,
  username: System.get_env("DB_USER", "postgres"),
  password: System.get_env("DB_PASS", "postgres"),
  database: System.get_env("DB_NAME", "prismatic_dev"),
  hostname: System.get_env("DB_HOST", "localhost"),
  port: String.to_integer(System.get_env("DB_PORT", "5432")),
  pool_size: 20,
  queue_target: 5000,
  queue_interval: 1000

# config/prod.exs - Production with SSL and connection tuning
config :prismatic, PrismaticStorage.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE", "25")),
  ssl: true,
  ssl_opts: [
    verify: :verify_peer,
    cacertfile: CAStore.file_path(),
    server_name_indication: ~c"db.prismatic-prod.fly.dev"
  ],
  prepare: :named,
  socket_options: [:inet6]
```

## Advisory Locks and Distributed Coordination

The platform leverages PostgreSQL's advisory locks for coordinating distributed operations like scheduled scan execution across multiple cluster nodes. Advisory locks provide a lightweight locking mechanism that does not require creating physical lock records in a table, making them ideal for coordinating background jobs across the Fly.io cluster.

```elixir
defmodule PrismaticPerimeter.Scheduler do
  @doc "Acquire an advisory lock before running a scheduled scan"
  def run_if_leader(domain, scan_fn) do
    lock_key = :erlang.phash2(domain)

    Ecto.Adapters.SQL.query!(Repo, "SELECT pg_try_advisory_lock($1)", [lock_key])
    |> case do
      %{rows: [[true]]} ->
        try do
          scan_fn.()
        after
          Ecto.Adapters.SQL.query!(Repo, "SELECT pg_advisory_unlock($1)", [lock_key])
        end

      %{rows: [[false]]} ->
        {:ok, :skipped_another_node_running}
    end
  end
end
```

## Best Practices

- **Use appropriate index types** -- B-tree for equality/range queries, GIN for JSONB and array containment, GiST for geometric/full-text, BRIN for naturally ordered data like timestamps
- **Leverage JSONB for flexible metadata** -- store semi-structured data in JSONB columns with GIN indexes rather than creating wide tables with nullable columns
- **Monitor with `pg_stat_statements`** -- identify slow queries and missing indexes by analyzing query execution statistics in production
- **Use connection pooling** -- configure `pool_size` based on expected concurrent queries; too many connections waste PostgreSQL memory, too few cause queue timeouts
- **Write migrations that are reversible** -- always implement both `up` and `down` (or use `change` which auto-generates `down`) for safe rollbacks
- **Prefer CTEs for complex queries** -- common table expressions improve readability and allow PostgreSQL to optimize subquery execution
- **Set `queue_target` and `queue_interval`** -- these Ecto pool settings prevent requests from waiting indefinitely for a database connection under load

## Comparison with Alternatives

| Feature | PostgreSQL | MySQL | SQLite | MongoDB | CockroachDB |
|---------|-----------|-------|--------|---------|-------------|
| JSONB support | Excellent (indexed, queryable) | JSON type (limited indexing) | JSON functions | Native document store | JSONB compatible |
| Extensions | Rich ecosystem (TimescaleDB, pgvector) | Limited | Loadable extensions | None (built-in features) | Limited |
| Full-text search | Built-in (tsvector/tsquery) | Built-in (InnoDB) | FTS5 extension | Built-in ($text) | Not built-in |
| Ecto support | Primary adapter | Supported (MyXQL) | Supported (Exqlite) | Via ecto_mongo | Via postgrex |
| Horizontal scaling | Read replicas + Citus | Read replicas + vitess | N/A (embedded) | Native sharding | Native distributed |
| ACID compliance | Full | Full (InnoDB) | Full | Per-document only | Full (distributed) |
| Platform role | Primary data store | Not used | Not used | Not used | Not used |

PostgreSQL was chosen as the platform's primary database because of its extension ecosystem (enabling TimescaleDB, pgvector, and PostGIS within the same database), its JSONB capabilities for semi-structured intelligence data, and its mature integration with [Ecto](/technologies/ecto/) through the Postgrex adapter.

## Related Technologies

- [Ecto](/technologies/ecto/) - Database wrapper and query interface for all PostgreSQL access
- [TimescaleDB](/technologies/timescaledb/) - Time-series extension for metrics and telemetry
- [KuzuDB](/technologies/kuzudb/) - Graph database complement for entity relationship analysis
- [Redis](/technologies/redis/) - Caching layer for frequently accessed PostgreSQL data
- [ETS](/technologies/ets/) - In-process memory cache for hot data paths
- [Docker](/technologies/docker/) - PostgreSQL container in the development stack

## Related Apps

- [prismatic_storage_ecto](/apps/prismatic-storage-ecto/) - PostgreSQL adapter implementing the storage trait
- [prismatic_storage_core](/apps/prismatic-storage-core/) - Storage abstractions and repository protocols
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security data persistence for assets, ratings, and findings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)