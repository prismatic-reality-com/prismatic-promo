+++
title = "Index Scan"
weight = 50

[extra]
description = "Database query execution strategy that uses a pre-built index structure (B-tree, GIN, GiST, BRIN) to efficiently locate and retrieve matching rows without scanning entire tables -- including standard index scans, bitmap index scans, index-only scans, and covering indexes"
category = "database"
domain = "data-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = false
related_terms = ["sequential-scan", "query-optimization", "postgresql", "ecto", "b-tree", "bitmap-scan", "index-only-scan", "covering-index", "partial-index", "gin-index", "explain-analyze", "query-planner"]
tags = ["glossary", "database", "index-scan", "query-optimization", "PostgreSQL", "b-tree", "bitmap-scan", "covering-index", "ecto", "performance"]
complexity_level = "intermediate"
platform_integration = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "24 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "PostgreSQL", "BEAM/OTP"]
key_takeaway = "Index scans are the primary performance optimization for database queries in the Prismatic Platform, with PostgreSQL automatically selecting between B-tree, bitmap, index-only, and GIN scans based on cost estimation and table statistics"
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["index scan", "database", "query optimization", "PostgreSQL", "B-tree", "bitmap index scan", "index-only scan", "covering index", "partial index", "GIN index", "EXPLAIN ANALYZE", "query planner", "glossary", "Prismatic Platform", "Ecto"]
image = "/images/sections/glossary.png"
image_alt = "Index Scan - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "architecture", "performance", "postgresql"]
+++

## Definition

An index scan is a database query execution strategy where the database engine uses a pre-built index structure to locate matching rows efficiently, rather than reading every row in the table sequentially. When a query includes a WHERE clause that matches an indexed column, the query planner may choose an index scan to dramatically reduce the number of disk pages that need to be read. This is one of the most fundamental performance optimization techniques in relational database systems.

In PostgreSQL, which underpins the Prismatic Platform's persistent storage layer, the query planner automatically decides between sequential scans, index scans, index-only scans, and bitmap index scans based on table statistics, index availability, and estimated cost. The planner's decisions are driven by a sophisticated cost model that considers disk I/O patterns, memory availability, and data distribution. Understanding how and when the planner selects index scans is essential for building performant data-intensive applications.

The Prismatic Platform processes millions of OSINT records, DD entity records, intelligence findings, and security assessment data points. Efficient data retrieval through proper indexing strategy directly impacts whether queries complete in milliseconds or seconds. The platform's PERF doctrine mandates bounded queries with appropriate indexes, and the telemetry system monitors query execution times to detect missing or degraded indexes.

## Core Concepts

### Index Scan Type Comparison

| Scan Type | How It Works | Best For | Memory Usage | I/O Pattern |
|-----------|-------------|----------|-------------|------------|
| **Sequential Scan** | Reads every row in table order | Small tables, low selectivity | Minimal | Sequential (fast) |
| **Index Scan** | Traverses B-tree, fetches heap tuples | High selectivity (< 5-10% rows) | Low | Random (slow per page) |
| **Index-Only Scan** | Reads only from index, no heap access | Queries where index covers all columns | Low | Sequential on index |
| **Bitmap Index Scan** | Builds bitmap of matching pages, reads sequentially | Moderate selectivity (5-25% rows) | Medium (bitmap) | Sequential (batched) |
| **Bitmap AND/OR** | Combines multiple bitmap scans | Multi-column OR/AND filters | Medium | Sequential (batched) |

### PostgreSQL Index Types

| Index Type | Structure | Best For | Prismatic Usage |
|-----------|-----------|----------|-----------------|
| **B-tree** | Balanced tree | Equality, range, sorting, LIKE prefix | Most columns (default) |
| **Hash** | Hash table | Equality only (no range) | Exact match lookups |
| **GIN** | Generalized Inverted | JSONB containment, full-text, arrays | `attributes` JSONB columns |
| **GiST** | Generalized Search Tree | Geometric, range, nearest-neighbor | IP range queries |
| **BRIN** | Block Range | Large tables with physical correlation | Time-series data (timestamps) |
| **SP-GiST** | Space-Partitioned GiST | Non-balanced structures (trie, quad-tree) | IP address lookups |

### Cost Model Factors

| Factor | Impact on Scan Choice | How to Influence |
|--------|----------------------|-----------------|
| **Selectivity** | Low selectivity favors seq scan | Improve predicate specificity |
| **Table size** | Small tables favor seq scan | Partition large tables |
| **Index correlation** | High correlation favors index scan | CLUSTER table on index |
| **`random_page_cost`** | Higher value discourages index scan | Tune for SSD (1.1) vs HDD (4.0) |
| **`seq_page_cost`** | Higher value encourages index scan | Usually leave at 1.0 |
| **`effective_cache_size`** | Larger value favors index scan | Set to ~75% of total RAM |
| **Statistics freshness** | Stale stats cause bad plans | Run ANALYZE after bulk loads |
| **Column correlation** | Physical vs logical ordering | CLUSTER or use BRIN |
| **Visibility map** | Clean pages enable index-only scan | Regular VACUUM |

### Index Scan Performance Characteristics

| Metric | Sequential Scan | Index Scan | Index-Only Scan | Bitmap Scan |
|--------|----------------|------------|-----------------|-------------|
| **Startup cost** | Very low | Medium (tree traversal) | Medium | Medium (bitmap build) |
| **Per-row cost** | Low | High (random I/O) | Very low | Medium |
| **Best case rows** | All rows | < 5% of table | < 20% of table | 5-25% of table |
| **Memory overhead** | Buffer cache only | Buffer cache only | Buffer cache only | Bitmap + buffer cache |
| **Scales with table size** | Linearly | Logarithmically | Logarithmically | Sub-linearly |
| **Sensitive to caching** | Less | Very | Less | Moderate |

## Technical Deep Dive

### B-tree Index Scan Mechanics

The standard B-tree index scan is the most common index access method in PostgreSQL. The process works in two phases:

1. **Index traversal**: PostgreSQL traverses the B-tree from root to leaf nodes, following the search key to find matching index entries. Each index entry contains the indexed column values and a Tuple Identifier (TID) pointing to the heap tuple's physical location.

2. **Heap fetch**: For each matching TID, PostgreSQL fetches the corresponding row from the heap (the main table storage). This step involves random I/O because matching rows may be scattered across different pages.

The random I/O in the heap fetch phase is why index scans can be slower than sequential scans for queries that match a large fraction of the table. Sequential scans read pages in physical order, benefiting from operating system read-ahead and contiguous I/O. Index scans jump between random pages, which is expensive on spinning disks and still slower than sequential I/O on SSDs.

### Index-Only Scans and Covering Indexes

An index-only scan eliminates the heap fetch phase entirely by reading all required data directly from the index. This is possible when:

1. The index contains all columns referenced in the query (SELECT, WHERE, ORDER BY, GROUP BY)
2. The visibility map confirms that all tuples on the page are visible to the current transaction (no recent updates/deletes that haven't been vacuumed)

PostgreSQL 11+ supports `INCLUDE` columns in indexes, creating covering indexes that store additional columns in the index leaf pages without including them in the search key. This enables index-only scans for queries that need columns beyond the search predicate.

```sql
-- Covering index: search by entity_type, include name and status for index-only scan
CREATE INDEX idx_dd_entities_type_covering
ON dd_entities (entity_type)
INCLUDE (name, status);

-- This query can use an index-only scan:
SELECT name, status FROM dd_entities WHERE entity_type = 'person';
```

### Bitmap Index Scans

Bitmap index scans are PostgreSQL's answer to queries with moderate selectivity (too many rows for efficient random I/O, too few for a full sequential scan). The process works in three phases:

1. **Bitmap build**: Scan the index and build an in-memory bitmap where each bit represents a heap page (not a row). Set the bit for every page containing at least one matching row.
2. **Bitmap sort**: The bitmap naturally represents pages in physical order.
3. **Heap scan**: Read the marked pages sequentially, checking individual rows against the original predicate.

The key advantage is converting random I/O (index scan) into sequential I/O (bitmap heap scan). Additionally, multiple bitmap scans can be combined with BitmapAnd and BitmapOr operations, enabling efficient multi-column filtering without a composite index.

### Partial Indexes

Partial indexes include only rows that satisfy a predicate defined on the index. They are smaller, faster to scan, and cheaper to maintain than full indexes. They are particularly powerful for workloads that frequently query a subset of data:

```sql
-- Only index active entities (90% of queries filter on active)
CREATE INDEX idx_dd_entities_active_name
ON dd_entities (name)
WHERE status = 'active';

-- This query uses the partial index (smaller, faster):
SELECT * FROM dd_entities WHERE status = 'active' AND name LIKE 'Nav%';
```

### EXPLAIN ANALYZE: The Essential Diagnostic

`EXPLAIN ANALYZE` executes the query and reports the actual execution plan, timing, and row counts. It is indispensable for verifying that PostgreSQL actually uses your indexes:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, entity_type
FROM dd_entities
WHERE entity_type = 'person'
  AND status = 'active'
ORDER BY updated_at DESC
LIMIT 100;

-- Example output:
-- Limit (cost=0.42..125.30 rows=100 width=68) (actual time=0.052..0.431 rows=100 loops=1)
--   ->  Index Scan Backward using idx_dd_entities_type_status on dd_entities
--         Index Cond: (entity_type = 'person' AND status = 'active')
--         Buffers: shared hit=15
-- Planning Time: 0.15 ms
-- Execution Time: 0.48 ms
```

Key metrics to examine:
- **actual time**: Real execution time (first row..last row)
- **rows**: Actual vs estimated row count (large discrepancy = stale statistics)
- **Buffers: shared hit vs read**: Cache hit ratio (high hit = warmed cache)
- **Planning Time**: Should be < 1ms for simple queries

## Usage in Prismatic Platform

- **DD Entity Queries**: Composite indexes on `(entity_type, source_slug)` for source-specific entity retrieval
- **OSINT Tool History**: Indexes on `(tool_slug, executed_at)` for chronological execution lookups
- **Intelligence Findings**: GIN indexes on JSONB `attributes` columns for flexible attribute queries
- **Compliance Records**: Partial indexes on `status = 'active'` for NIS2/ZKB compliance checks
- **User Sessions**: B-tree index on `(user_id, created_at)` for session history
- **Search Indexing**: BRIN indexes on `inserted_at` for time-range-based data exports to Meilisearch
- **Graph Relationships**: Composite indexes on `(source_id, relationship_type, target_id)` for KuzuDB sync
- **Telemetry Events**: BRIN indexes on timestamp columns for time-series telemetry queries
- **ETS Cache Fallback**: PostgreSQL indexes serve as fallback when ETS caches are cold (system restart)
- **API Rate Limiting**: Index on `(client_id, window_start)` for rate limit counter lookups

## Code Examples

### Ecto Migration with Comprehensive Indexing

```elixir
defmodule PrismaticDd.Repo.Migrations.AddEntityIndexes do
  @moduledoc """
  Adds optimized indexes for DD entity queries. All indexes are created
  concurrently to avoid table locks in production.

  Index strategy:
  - Composite B-tree for multi-column equality filters
  - Partial index for frequently queried active subset
  - GIN index for JSONB attribute queries
  - Covering index for index-only scans on common projections
  - BRIN index for time-range queries on large tables
  """

  use Ecto.Migration

  @disable_ddl_transaction true
  @disable_migration_lock true

  def change do
    # Composite index for type + source filtering (most common query pattern)
    create index(:dd_entities, [:entity_type, :source_slug],
      concurrently: true,
      name: :idx_dd_entities_type_source
    )

    # Partial index for active entities only (90% of queries)
    create index(:dd_entities, [:name],
      where: "status = 'active'",
      concurrently: true,
      name: :idx_dd_entities_active_name
    )

    # GIN index for JSONB attribute containment queries
    create index(:dd_entities, [:attributes],
      using: :gin,
      concurrently: true,
      name: :idx_dd_entities_attributes_gin
    )

    # Composite index for status + type + updated_at (dashboard queries)
    create index(:dd_entities, [:status, :entity_type, :updated_at],
      concurrently: true,
      name: :idx_dd_entities_status_type_updated
    )

    # BRIN index for time-range queries on large tables
    create index(:dd_entities, [:inserted_at],
      using: :brin,
      concurrently: true,
      name: :idx_dd_entities_inserted_brin
    )

    # Unique index for deduplication
    create unique_index(:dd_entities, [:source_slug, :external_id],
      concurrently: true,
      name: :idx_dd_entities_source_external_unique
    )
  end
end
```

### Optimized Ecto Query Module

```elixir
defmodule PrismaticDd.Queries.EntityQuery do
  @moduledoc """
  Optimized entity queries leveraging PostgreSQL index scans.
  All queries are bounded (PERF doctrine) and designed to hit
  specific indexes for sub-millisecond execution.

  ## Index Usage Map

  | Function | Target Index | Scan Type |
  |----------|-------------|-----------|
  | `by_type_and_source/2` | `idx_dd_entities_type_source` | Index scan |
  | `active_by_name/1` | `idx_dd_entities_active_name` | Index scan (partial) |
  | `by_attributes/1` | `idx_dd_entities_attributes_gin` | GIN scan |
  | `recent_by_status/2` | `idx_dd_entities_status_type_updated` | Index scan |
  | `in_time_range/2` | `idx_dd_entities_inserted_brin` | BRIN scan |

  ## Examples

      iex> PrismaticDd.Queries.EntityQuery.by_type_and_source("person", "czech-ares")
      #Ecto.Query<...>

  """

  import Ecto.Query

  alias PrismaticDd.Schemas.EntityRecord

  @default_limit 100
  @max_limit 1000

  @doc """
  Queries entities by type and source, leveraging the composite
  `idx_dd_entities_type_source` index. Results are ordered by
  `updated_at` descending and bounded by the default limit.

  ## Examples

      iex> query = PrismaticDd.Queries.EntityQuery.by_type_and_source("person", "czech-ares")
      iex> PrismaticDd.Repo.all(query)
      [%EntityRecord{}, ...]

  """
  @spec by_type_and_source(String.t(), String.t(), keyword()) :: Ecto.Query.t()
  def by_type_and_source(entity_type, source_slug, opts \\ []) do
    limit = min(Keyword.get(opts, :limit, @default_limit), @max_limit)

    from(e in EntityRecord,
      where: e.entity_type == ^entity_type,
      where: e.source_slug == ^source_slug,
      order_by: [desc: e.updated_at],
      select: [:id, :name, :entity_type, :status, :attributes, :updated_at],
      limit: ^limit
    )
  end

  @doc """
  Queries active entities by name pattern, leveraging the partial
  `idx_dd_entities_active_name` index (only indexes active rows).

  ## Examples

      iex> query = PrismaticDd.Queries.EntityQuery.active_by_name("Navigara")
      iex> PrismaticDd.Repo.all(query)
      [%EntityRecord{status: "active", name: "Navigara s.r.o."}, ...]

  """
  @spec active_by_name(String.t(), keyword()) :: Ecto.Query.t()
  def active_by_name(name_pattern, opts \\ []) do
    limit = min(Keyword.get(opts, :limit, @default_limit), @max_limit)

    from(e in EntityRecord,
      where: e.status == "active",
      where: ilike(e.name, ^"%#{sanitize_like(name_pattern)}%"),
      order_by: [asc: e.name],
      limit: ^limit
    )
  end

  @doc """
  Queries entities by JSONB attribute containment, leveraging the
  GIN index on the `attributes` column.

  ## Examples

      iex> query = PrismaticDd.Queries.EntityQuery.by_attributes(%{"country" => "CZ"})
      iex> PrismaticDd.Repo.all(query)
      [%EntityRecord{attributes: %{"country" => "CZ", ...}}, ...]

  """
  @spec by_attributes(map(), keyword()) :: Ecto.Query.t()
  def by_attributes(attributes, opts \\ []) when is_map(attributes) do
    limit = min(Keyword.get(opts, :limit, @default_limit), @max_limit)

    from(e in EntityRecord,
      where: fragment("? @> ?::jsonb", e.attributes, ^attributes),
      order_by: [desc: e.updated_at],
      limit: ^limit
    )
  end

  @doc """
  Queries entities within a time range, leveraging the BRIN index
  on `inserted_at` for efficient range scans on large tables.

  ## Examples

      iex> query = PrismaticDd.Queries.EntityQuery.in_time_range(~U[2026-01-01 00:00:00Z], ~U[2026-04-01 00:00:00Z])
      iex> PrismaticDd.Repo.all(query)
      [%EntityRecord{}, ...]

  """
  @spec in_time_range(DateTime.t(), DateTime.t(), keyword()) :: Ecto.Query.t()
  def in_time_range(start_dt, end_dt, opts \\ []) do
    limit = min(Keyword.get(opts, :limit, @default_limit), @max_limit)

    from(e in EntityRecord,
      where: e.inserted_at >= ^start_dt,
      where: e.inserted_at <= ^end_dt,
      order_by: [desc: e.inserted_at],
      limit: ^limit
    )
  end

  @doc """
  Queries recent entities by status with pagination support.

  ## Examples

      iex> query = PrismaticDd.Queries.EntityQuery.recent_by_status("active", page: 2, per_page: 25)
      iex> PrismaticDd.Repo.all(query)
      [%EntityRecord{}, ...]

  """
  @spec recent_by_status(String.t(), keyword()) :: Ecto.Query.t()
  def recent_by_status(status, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = min(Keyword.get(opts, :per_page, 25), @max_limit)
    offset_val = (page - 1) * per_page

    from(e in EntityRecord,
      where: e.status == ^status,
      order_by: [desc: e.updated_at],
      limit: ^per_page,
      offset: ^offset_val
    )
  end

  # SEAL doctrine: sanitize LIKE patterns to prevent injection
  defp sanitize_like(pattern) do
    pattern
    |> String.replace("\\", "\\\\")
    |> String.replace("%", "\\%")
    |> String.replace("_", "\\_")
  end
end
```

### Index Health Monitor

```elixir
defmodule PrismaticDd.IndexHealthMonitor do
  @moduledoc """
  Monitors PostgreSQL index health and usage statistics.
  Detects unused indexes (wasting write performance), missing indexes
  (causing sequential scans), and bloated indexes (needing REINDEX).

  Emits telemetry events under `[:prismatic, :database, :index_health]`
  for dashboard visualization and alerting.

  ## Examples

      iex> PrismaticDd.IndexHealthMonitor.check_unused_indexes()
      {:ok, [%{index_name: "idx_unused", scan_count: 0, size_bytes: 1_048_576}]}

  """

  require Logger

  @doc """
  Identifies indexes that have never been scanned since the last
  statistics reset. These indexes waste write performance and disk space.

  ## Examples

      iex> {:ok, unused} = PrismaticDd.IndexHealthMonitor.check_unused_indexes()
      iex> Enum.each(unused, &IO.puts("Unused: #{&1.index_name}"))

  """
  @spec check_unused_indexes() :: {:ok, [map()]} | {:error, term()}
  def check_unused_indexes do
    query = """
    SELECT
      schemaname || '.' || indexrelname AS index_name,
      idx_scan AS scan_count,
      pg_relation_size(indexrelid) AS size_bytes,
      pg_size_pretty(pg_relation_size(indexrelid)) AS size_pretty
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
      AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%_unique%'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 50
    """

    case PrismaticDd.Repo.query(query) do
      {:ok, %{rows: rows, columns: columns}} ->
        results = Enum.map(rows, fn row -> Enum.zip(columns, row) |> Map.new() end)
        {:ok, results}

      {:error, reason} ->
        Logger.error("Failed to check unused indexes: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @doc """
  Identifies tables with sequential scans that would benefit from indexes.
  Returns tables sorted by the ratio of sequential scans to index scans.

  ## Examples

      iex> {:ok, candidates} = PrismaticDd.IndexHealthMonitor.check_missing_indexes()
      iex> Enum.each(candidates, &IO.puts("Needs index: #{&1.table_name}"))

  """
  @spec check_missing_indexes() :: {:ok, [map()]} | {:error, term()}
  def check_missing_indexes do
    query = """
    SELECT
      schemaname || '.' || relname AS table_name,
      seq_scan,
      idx_scan,
      CASE WHEN idx_scan > 0
        THEN round((seq_scan::numeric / idx_scan), 2)
        ELSE seq_scan
      END AS seq_to_idx_ratio,
      n_live_tup AS row_count,
      pg_size_pretty(pg_relation_size(relid)) AS table_size
    FROM pg_stat_user_tables
    WHERE seq_scan > 100
      AND n_live_tup > 10000
      AND (idx_scan = 0 OR seq_scan::numeric / GREATEST(idx_scan, 1) > 10)
    ORDER BY seq_scan DESC
    LIMIT 20
    """

    case PrismaticDd.Repo.query(query) do
      {:ok, %{rows: rows, columns: columns}} ->
        results = Enum.map(rows, fn row -> Enum.zip(columns, row) |> Map.new() end)
        {:ok, results}

      {:error, reason} ->
        Logger.error("Failed to check missing indexes: #{inspect(reason)}")
        {:error, reason}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Severity | Mitigation |
|---------|--------|----------|------------|
| **Creating indexes without CONCURRENTLY** | Table lock blocks all writes | Critical | Always use `concurrently: true` in production |
| **Not running ANALYZE after bulk loads** | Stale statistics, wrong scan choice | High | Run `ANALYZE` after bulk inserts/updates |
| **Over-indexing** | Slower writes, wasted disk space | Medium | Monitor unused indexes, remove them |
| **Missing composite index column order** | Index not used for query | High | Put equality columns first, range columns last |
| **Ignoring partial indexes** | Full index on sparse subsets | Medium | Use WHERE clause for common filters |
| **No VACUUM for index-only scans** | Heap fetches despite covering index | Medium | Regular VACUUM to update visibility map |
| **Using functions on indexed columns** | Index not used (`WHERE lower(name) = ...`) | High | Create expression index or use generated columns |
| **LIKE without prefix** | Index scan impossible (`WHERE name LIKE '%foo'`) | High | Use trigram GIN index for substring search |
| **Not limiting results (PERF violation)** | Unbounded index scan returns millions | Critical | Always apply `LIMIT` (PERF doctrine) |
| **Index on low-cardinality columns** | Index less efficient than seq scan | Low | Avoid indexing boolean or status-like columns alone |
| **Stale `random_page_cost` for SSDs** | Planner avoids index scans unnecessarily | Medium | Set `random_page_cost = 1.1` for SSDs |
| **Not checking EXPLAIN ANALYZE** | Assuming index is used without verification | High | Always verify with EXPLAIN ANALYZE |

## Best Practices

1. **Always create indexes with `CONCURRENTLY` in production**: Non-concurrent index creation acquires an exclusive table lock, blocking all writes until complete. Use `@disable_ddl_transaction true` in Ecto migrations.

2. **Run ANALYZE after bulk data loads**: PostgreSQL's cost-based optimizer relies on table statistics. After loading significant data, run `ANALYZE` to ensure the planner has accurate selectivity estimates.

3. **Use EXPLAIN ANALYZE to verify index usage**: Never assume an index is being used. Always check the actual execution plan with `EXPLAIN (ANALYZE, BUFFERS)` to confirm.

4. **Prefer partial indexes for common query subsets**: If 90% of queries filter on `status = 'active'`, a partial index with that WHERE clause will be smaller and faster than a full index.

5. **Order composite index columns for query patterns**: Place equality columns before range columns. `(entity_type, updated_at)` supports `WHERE entity_type = 'person' ORDER BY updated_at`.

6. **Use covering indexes (INCLUDE) for index-only scans**: Add frequently selected columns with `INCLUDE` to enable index-only scans, eliminating heap fetches entirely.

7. **Monitor and remove unused indexes**: Unused indexes waste write performance and disk space. Query `pg_stat_user_indexes` regularly to identify candidates for removal.

8. **Use GIN indexes for JSONB columns**: PostgreSQL's GIN index type efficiently supports `@>` containment queries on JSONB columns, essential for flexible attribute queries.

9. **Set `random_page_cost` appropriately for SSD storage**: The default value (4.0) assumes spinning disks. For SSDs, set to 1.1 to encourage the planner to use index scans more aggressively.

10. **Bound all queries with LIMIT (PERF doctrine)**: Even with indexes, unbounded queries can return millions of rows. Always apply explicit limits.

## Related Terms

- [PostgreSQL](@/glossary/postgresql.md) -- primary database engine using B-tree, GIN, and BRIN indexes
- [Ecto](@/glossary/ecto.md) -- Elixir database wrapper generating indexed queries via DSL
- [Sequential Scan](@/glossary/sequential-scan.md) -- full table scan alternative to index scan
- [Query Optimization](/glossary/query-optimization/) -- broader optimization strategies including indexing
- [ETS](@/glossary/ets.md) -- in-memory alternative for hot-path data access
- [Performance](@/glossary/performance.md) -- platform-wide performance standards and gates
- [B-tree](/glossary/b-tree/) -- balanced tree structure used by default PostgreSQL indexes
- [JSONB](/glossary/jsonb/) -- binary JSON storage type indexed by GIN
- [VACUUM](@/glossary/vacuum.md) -- maintenance operation enabling index-only scans
- [Telemetry](@/glossary/telemetry.md) -- query performance monitoring and alerting
- [Data Pipeline](@/glossary/data-pipeline.md) -- bulk data operations requiring index awareness
- [OSINT](@/glossary/osint.md) -- intelligence data stored with optimized indexes

## See Also

- [Architecture](@/architecture/_index.md) -- platform database architecture and indexing strategy
- [Capabilities](@/capabilities/_index.md) -- platform capability performance requirements
- [Performance](@/glossary/performance.md) -- platform performance standards (< 100ms server render)
- [PostgreSQL Documentation: Indexes](https://www.postgresql.org/docs/current/indexes.html) -- official reference

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
