+++
title = "Index"
description = "A database lookup optimization structure that maps search keys to data locations, enabling O(log n) or O(1) access patterns instead of O(n) full table scans for query acceleration."
weight = 50

[extra]
category = "database"
tags = ["index", "database", "btree", "hash-index", "gin", "gist", "postgresql", "performance", "query-optimization", "covering-index"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["developers", "database-engineers", "architects", "performance-engineers"]
related_terms = ["full-text-index", "btree", "postgresql", "query-optimization", "explain-analyze", "covering-index"]
key_concepts = ["btree", "hash-index", "gin", "gist", "covering-index", "partial-index", "composite-index", "index-scan"]
platforms = ["postgresql", "ecto", "elixir", "beam"]
prerequisites = ["database-fundamentals", "sql-basics", "data-structures"]
use_cases = ["query-optimization", "unique-constraint", "foreign-key-lookup", "full-text-search", "geospatial-search"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1150
date_modified = "2026-02-23"
keywords = ["Index", "database", "B-tree", "query optimization", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Index - Prismatic Platform"
+++

## Definition and Overview

A database index is a supplementary data structure that maintains a mapping from search key values to the physical locations of corresponding rows in a table. Without an index, a database must perform a sequential scan -- reading every row in the table -- to find rows matching a query predicate. With an appropriate index, the database can navigate directly to matching rows in logarithmic time (B-tree) or constant time (hash), reducing query time from milliseconds-to-seconds for large tables to sub-millisecond regardless of table size.

Indexes trade storage space and write performance for read performance. Every index occupies additional disk space (typically 10-30% of the indexed column's data) and must be updated on every INSERT, UPDATE, or DELETE operation affecting the indexed columns. This means that over-indexing a table can degrade write performance while under-indexing degrades read performance. The art of index design is finding the right balance for the application's read/write ratio and query patterns.

PostgreSQL -- the Prismatic Platform's primary relational database -- supports multiple index types, each optimized for different query patterns. B-tree indexes (the default) handle equality and range queries efficiently. Hash indexes optimize pure equality lookups. GIN (Generalized Inverted Index) indexes support full-text search, JSONB containment, and array operations. GiST (Generalized Search Tree) indexes enable geometric and spatial queries. BRIN (Block Range Index) indexes provide compact indexing for naturally ordered data like timestamps.

## Technical Deep Dive

### Index Types in PostgreSQL

| Type | Structure | Query Patterns | Best For |
|------|-----------|---------------|----------|
| **B-tree** | Balanced tree, O(log n) lookup | `=`, `<`, `>`, `<=`, `>=`, `BETWEEN`, `IN`, `IS NULL` | General purpose, default choice |
| **Hash** | Hash table, O(1) lookup | `=` only | Exact equality with no range queries |
| **GIN** | Inverted index | `@>`, `<@`, `&&`, `@@`, `?`, `?\|`, `?&` | Full-text, JSONB, arrays, trigrams |
| **GiST** | Generalized search tree | `<<`, `>>`, `<@`, `@>`, `~=`, `&&` | Geometric, spatial, range types |
| **BRIN** | Block range summaries | Range queries on correlated data | Large time-series tables |
| **SP-GiST** | Space-partitioned search tree | Various geometric operators | IP ranges, phone numbers, geospatial |

### Index Design Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| **Single-column** | Index on one column | `CREATE INDEX idx_name ON entities (name)` |
| **Composite** | Index on multiple columns | `CREATE INDEX idx_type_source ON entities (entity_type, source)` |
| **Covering** | Include extra columns to enable index-only scans | `CREATE INDEX ... INCLUDE (name, updated_at)` |
| **Partial** | Index only rows matching a condition | `CREATE INDEX ... WHERE status = 'active'` |
| **Expression** | Index on a computed expression | `CREATE INDEX idx_lower ON entities (lower(name))` |
| **Unique** | Enforce uniqueness constraint | `CREATE UNIQUE INDEX ... ON entities (external_id)` |
| **Concurrent** | Build without locking writes | `CREATE INDEX CONCURRENTLY ...` |

### Index Selection Guidelines

```
Decision tree for index type:
  1. Does the query use = only?
     -> Hash index (or B-tree for versatility)

  2. Does the query use range operators (>, <, BETWEEN)?
     -> B-tree

  3. Does the query search text content?
     -> GIN with tsvector

  4. Does the query search JSONB attributes?
     -> GIN

  5. Does the query involve geographic/geometric data?
     -> GiST (or SP-GiST)

  6. Is the data naturally ordered (timestamps) and the table very large?
     -> BRIN (minimal storage, good range performance)
```

### EXPLAIN ANALYZE

The primary tool for understanding index usage is `EXPLAIN ANALYZE`, which shows the actual execution plan and timing for a query:

```sql
EXPLAIN ANALYZE
SELECT * FROM dd_entities
WHERE entity_type = 'company' AND source = 'ares'
ORDER BY name
LIMIT 20;

-- With index on (entity_type, source, name):
-- Index Scan using idx_type_source_name on dd_entities
--   Index Cond: (entity_type = 'company' AND source = 'ares')
--   Rows Removed by Filter: 0
--   Planning Time: 0.15 ms
--   Execution Time: 0.42 ms

-- Without index:
-- Seq Scan on dd_entities
--   Filter: (entity_type = 'company' AND source = 'ares')
--   Rows Removed by Filter: 15432
--   Planning Time: 0.08 ms
--   Execution Time: 45.67 ms
```

## Architecture and Implementation

Index architecture consists of the index data structure itself, the index maintenance mechanism (updating the index on data changes), the query planner integration (choosing when to use indexes), and the storage management layer (index page layout, cache behavior).

B-tree indexes -- the workhorse of relational databases -- organize keys in a balanced tree structure where internal nodes contain key values and pointers to child nodes, and leaf nodes contain key values and pointers to table rows. The tree is balanced so that all leaf nodes are at the same depth, guaranteeing O(log n) lookup regardless of data distribution. PostgreSQL's B-tree implementation stores entries in 8KB pages with a fill factor (default 90%) that leaves room for future insertions.

Index maintenance is the hidden cost of indexes. On every INSERT, the database must add the new key to every index on the table. On every UPDATE affecting an indexed column, the database must update the corresponding index entries. On every DELETE, the database marks index entries as dead (to be cleaned up later by VACUUM). For write-heavy tables, index maintenance can become the dominant performance factor.

## Usage in Prismatic Platform

The Prismatic Platform uses strategic indexing across its PostgreSQL tables for the DD pipeline, OSINT tool execution logs, and the immutable audit log.

```elixir
defmodule Prismatic.Repo.Migrations.CreateOptimizedIndexes do
  @moduledoc """
  Creates performance-critical indexes for the platform's
  core tables. Each index is justified by query patterns
  identified through EXPLAIN ANALYZE profiling.
  """

  use Ecto.Migration

  def change do
    # DD entities: frequently queried by type + source
    create index(:dd_entities, [:entity_type, :source],
      name: :idx_dd_entities_type_source)

    # DD entities: unique constraint on external identifiers
    create unique_index(:dd_entities, [:source, :external_id],
      name: :idx_dd_entities_source_external_id)

    # DD entities: full-text search on name
    execute """
    CREATE INDEX idx_dd_entities_name_trgm ON dd_entities
    USING gin (name gin_trgm_ops)
    """

    # Event log: queried by aggregate type + ID for replay
    create index(:event_log, [:aggregate_type, :aggregate_id, :sequence],
      name: :idx_event_log_aggregate)

    # Event log: queried by event type for analytics
    create index(:event_log, [:event_type, :occurred_at],
      name: :idx_event_log_type_time)

    # Immutable audit log: queried by entry type and time range
    create index(:immutable_audit_log, [:entry_type, :created_at],
      name: :idx_audit_log_type_time)

    # OSINT tool runs: queried by tool slug + status
    create index(:osint_tool_runs, [:tool_slug, :status],
      name: :idx_osint_runs_tool_status)

    # Partial index: only active/pending runs (not completed)
    create index(:osint_tool_runs, [:created_at],
      name: :idx_osint_runs_active,
      where: "status IN ('running', 'pending')")
  end
end
```

```elixir
defmodule Prismatic.Database.IndexAnalyzer do
  @moduledoc """
  Analyzes index usage and identifies optimization
  opportunities across platform database tables.
  """

  @spec unused_indexes() :: list(map())
  def unused_indexes do
    query = """
    SELECT schemaname, tablename, indexname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) AS size
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
    ORDER BY pg_relation_size(indexrelid) DESC
    """

    case Prismatic.Repo.query(query) do
      {:ok, %{rows: rows, columns: columns}} ->
        Enum.map(rows, fn row -> Enum.zip(columns, row) |> Map.new() end)

      {:error, _} ->
        []
    end
  end

  @spec index_hit_rate() :: float()
  def index_hit_rate do
    query = """
    SELECT sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) AS ratio
    FROM pg_statio_user_indexes
    """

    case Prismatic.Repo.query(query) do
      {:ok, %{rows: [[ratio]]}} when not is_nil(ratio) -> Decimal.to_float(ratio)
      _ -> 0.0
    end
  end
end
```

The platform enforces index usage through the performance policy: queries that trigger sequential scans on tables with more than 10,000 rows are flagged for optimization. The quality gates include `EXPLAIN ANALYZE` checks for all new Ecto queries in critical code paths.

## Cross-References

- [Full-Text Index](@/glossary/full-text-index.md) -- GIN indexes for text search
- [Execution Time](@/glossary/execution-time.md) -- Query timing improved by indexes
- [ACID Transactions](@/glossary/acid-transactions.md) -- Transactional index maintenance
- [Hit Rate](@/glossary/hit-rate.md) -- Index cache hit rate in shared buffers
- **Livebooks**: `storage_data/` notebooks demonstrate query optimization with indexes
- **Academy**: Topics on database optimization cover index design

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
