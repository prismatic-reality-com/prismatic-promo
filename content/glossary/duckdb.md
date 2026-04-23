+++
title = "DuckDB"
weight = 48
[extra]
category = "storage"
description = "Embedded analytical database for columnar OLAP queries with vectorized execution and zero-configuration deployment."
related_terms = ["adapter-pattern", "ets", "kuzudb", "connection-pooling", "postgresql", "meilisearch", "broadway", "easm", "elixir", "beam"]
keywords = ["DuckDB", "OLAP", "columnar storage", "vectorized execution", "analytical database", "embedded database", "Parquet", "SQL analytics"]
use_cases = ["Security metrics aggregation", "OSINT dataset correlation", "Agent performance analytics", "Compliance reporting", "Quality metrics analysis", "Ad-hoc exploration"]
technologies = ["DuckDB", "SQL", "Parquet", "Arrow IPC", "CSV", "JSON", "SIMD", "columnar storage"]
difficulty = "intermediate"
importance = "high"
domain = "analytical-databases"
category_color = "orange"
version = "1.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
authors = ["Tomas Korcak"]
tags = ["database", "analytics", "OLAP", "columnar", "embedded", "SQL", "storage-adapter"]
prerequisites = ["SQL knowledge", "understanding of OLTP vs OLAP", "Elixir basics"]
estimated_reading_time = "13 minutes"
related_apps = ["prismatic_storage_duckdb", "prismatic_storage_core", "prismatic_dd", "prismatic_storage_ecto", "prismatic_perimeter"]
related_architectures = ["multi-store architecture", "adapter pattern", "analytical pipeline"]
storage_type = "embedded"
query_paradigm = "OLAP"
file_formats = ["Parquet", "CSV", "JSON", "Arrow IPC"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1418
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "DuckDB - Prismatic Platform"
+++

## Definition

DuckDB is an embedded analytical database engine optimized for Online Analytical Processing (OLAP) workloads. It uses columnar storage, vectorized query execution, and automatic parallelism to process analytical queries over large datasets with exceptional performance. As an in-process database, DuckDB requires no separate server, operates directly within the application process, and stores data in a single file or entirely in memory. DuckDB supports standard SQL with extensions for window functions, CTEs, lateral joins, and direct querying of external file formats including Parquet, CSV, JSON, and Arrow IPC. Its design philosophy prioritizes analytical query performance, developer ergonomics, and zero-configuration deployment.

DuckDB occupies a unique position in the database landscape: it provides the analytical query capabilities of column-oriented data warehouses (Snowflake, BigQuery, ClickHouse) in an embedded form factor similar to SQLite. This combination makes it ideal for analytical workloads that need to run alongside an application without the operational overhead of a separate database server. The project originated from research at CWI (Centrum Wiskunde & Informatica) in the Netherlands, where the same research group previously developed MonetDB, one of the pioneering columnar database systems.

## OLTP vs OLAP: Fundamental Architecture Differences

The relational database market has historically been divided between OLTP (Online Transaction Processing) systems optimized for high-concurrency point reads and writes, and OLAP systems optimized for complex analytical queries over large datasets. OLTP databases like [PostgreSQL](/glossary/postgresql/) store data row-by-row, which is efficient for reading or writing entire records but inefficient for aggregations that touch only a few columns across millions of rows. OLAP databases like DuckDB store data column-by-column, which is highly efficient for analytical aggregations but less suited for single-record operations.

| Characteristic | OLTP (PostgreSQL) | OLAP (DuckDB) |
|---------------|-------------------|---------------|
| **Storage layout** | Row-oriented | Column-oriented |
| **Optimized for** | Point reads/writes | Aggregations/scans |
| **Concurrency** | High (many users) | Low (few analysts) |
| **Query pattern** | SELECT * WHERE id = X | SELECT AVG(col) GROUP BY Y |
| **Transaction support** | Full ACID | Limited |
| **Data volume** | Moderate (GB) | Large (TB) |
| **Index strategy** | B-tree, hash, GIN | Min-max, zone maps |
| **Compression** | Row-level | Column-level (10-100x better) |

DuckDB's key innovation is bringing OLAP-grade analytical performance to an embedded, serverless form factor. Traditional OLAP databases require dedicated infrastructure, ETL pipelines, and operational expertise. DuckDB eliminates all of these requirements while delivering comparable analytical performance through three core technologies:

| Technology | Mechanism | Performance Impact |
|-----------|-----------|-------------------|
| **Columnar storage** | Data stored by column, not by row | 10-100x compression; only needed columns read from disk |
| **Vectorized execution** | Operations process batches of 1024+ values using SIMD | 5-20x faster than row-at-a-time processing |
| **Automatic parallelism** | Queries automatically parallelized across CPU cores | Near-linear scaling with core count |
| **Late materialization** | Defers row reconstruction until final result | Reduces memory usage and intermediate data size |
| **Adaptive indexing** | Automatically creates min-max indices on columnar segments | Skips irrelevant data segments during scans |
| **Zero-copy Parquet reading** | Directly queries Parquet files without import | Eliminates ETL latency and storage duplication |

## Columnar Storage Architecture

In a row-oriented database, a table with columns (id, domain, score, grade) stores data as complete rows:

```
Row 1: [1, "example.com", 780, "B"]
Row 2: [2, "test.org", 850, "A"]
Row 3: [3, "insecure.net", 350, "F"]
```

In DuckDB's columnar storage, the same data is organized by column:

```
id column:     [1, 2, 3]
domain column: ["example.com", "test.org", "insecure.net"]
score column:  [780, 850, 350]
grade column:  ["B", "A", "F"]
```

This layout provides dramatic advantages for analytical queries. A query like `SELECT AVG(score) FROM ratings WHERE grade = 'A'` reads only the score and grade columns, skipping the id and domain columns entirely. For wide tables with dozens of columns, this reduces I/O by 90% or more. Additionally, columnar storage enables superior compression because values in the same column tend to have similar types and distributions, allowing techniques like dictionary encoding, run-length encoding, and delta encoding to achieve 10-100x compression ratios.

## Vectorized Query Execution

DuckDB processes data in vectors (batches of values) rather than one row at a time. This enables modern CPUs to use SIMD (Single Instruction, Multiple Data) instructions that operate on multiple values simultaneously:

| Execution Model | Values per Operation | CPU Cache Utilization | Example |
|----------------|---------------------|----------------------|---------|
| **Row-at-a-time** | 1 | Poor (random access) | Traditional databases |
| **Vectorized** | 1024-2048 | Excellent (sequential) | DuckDB, Velox |
| **Compiled** | Full column | Excellent | Hyper, Umbra |

The vectorized execution model processes a pipeline of operators (scan, filter, project, aggregate) on batches of 1024-2048 values. Each operator receives a vector of values, processes the entire vector in a tight loop, and passes the result to the next operator. This eliminates the per-row overhead of virtual function calls and enables the CPU to prefetch sequential memory accesses, dramatically improving cache utilization.

## SQL Capabilities

DuckDB supports a rich SQL dialect that goes beyond standard SQL, including features from the latest SQL standards and pragmatic extensions:

```sql
-- Window functions for time-series analysis
SELECT
    domain,
    score,
    grade,
    LAG(score) OVER (PARTITION BY domain ORDER BY assessed_at) AS prev_score,
    score - LAG(score) OVER (PARTITION BY domain ORDER BY assessed_at) AS score_delta
FROM security_ratings
ORDER BY domain, assessed_at;

-- Direct Parquet file querying (no import needed)
SELECT domain, AVG(score) as avg_score
FROM read_parquet('easm_results/*.parquet')
GROUP BY domain
HAVING AVG(score) < 500;

-- Common Table Expressions with recursive queries
WITH RECURSIVE domain_hierarchy AS (
    SELECT domain, parent_domain, 1 AS depth
    FROM asset_inventory WHERE parent_domain IS NULL
    UNION ALL
    SELECT a.domain, a.parent_domain, h.depth + 1
    FROM asset_inventory a
    JOIN domain_hierarchy h ON a.parent_domain = h.domain
)
SELECT * FROM domain_hierarchy ORDER BY depth;

-- QUALIFY clause (DuckDB extension -- filter after window functions)
SELECT domain, score, RANK() OVER (ORDER BY score DESC) AS rank
FROM security_ratings
QUALIFY rank <= 10;

-- List/struct types for semi-structured data
SELECT domain, list_agg(vulnerability ORDER BY severity) AS vulns
FROM asset_vulnerabilities
GROUP BY domain;
```

## Implementation in Prismatic Platform

Within the Prismatic Platform, DuckDB is integrated through the storage [adapter pattern](/glossary/adapter-pattern/) via `prismatic_storage_duckdb` for analytical workloads that exceed PostgreSQL's OLTP-optimized performance profile:

```elixir
defmodule PrismaticStorage.DuckDB.Adapter do
  @moduledoc """
  DuckDB storage adapter for analytical queries.
  Implements the PrismaticStorage.Adapter behaviour for OLAP workloads.
  Provides zero-configuration embedded analytics with columnar storage,
  vectorized execution, and direct Parquet file querying.
  """

  @behaviour PrismaticStorage.Adapter

  @type query_result :: {:ok, [map()]} | {:error, term()}

  @spec query(String.t(), [term()]) :: query_result()
  def query(sql, params \\ []) do
    case Duckdbex.query(get_connection(), sql, params) do
      {:ok, result} ->
        {:ok, result_to_maps(result)}

      {:error, reason} ->
        {:error, {:duckdb_query_failed, reason}}
    end
  end

  @spec aggregate_security_metrics(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def aggregate_security_metrics(domain, opts \\ []) do
    time_range = Keyword.get(opts, :time_range, "30 days")

    sql = """
    SELECT
      domain,
      COUNT(*) as assessment_count,
      AVG(score) as avg_score,
      MIN(score) as min_score,
      MAX(score) as max_score,
      STDDEV(score) as score_stddev,
      MODE(grade) as most_common_grade,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY score) as p95_score
    FROM security_ratings
    WHERE domain = $1
      AND assessed_at >= CURRENT_TIMESTAMP - INTERVAL '#{time_range}'
    GROUP BY domain
    """

    query(sql, [domain])
  end

  @spec import_parquet(String.t(), String.t()) :: {:ok, non_neg_integer()} | {:error, term()}
  def import_parquet(table_name, parquet_path) do
    sql = "CREATE TABLE IF NOT EXISTS #{table_name} AS SELECT * FROM read_parquet($1)"
    query(sql, [parquet_path])
  end

  @spec export_parquet(String.t(), String.t()) :: {:ok, String.t()} | {:error, term()}
  def export_parquet(table_name, output_path) do
    sql = "COPY #{table_name} TO $1 (FORMAT PARQUET, COMPRESSION ZSTD)"
    case query(sql, [output_path]) do
      {:ok, _} -> {:ok, output_path}
      error -> error
    end
  end

  defp get_connection do
    case Process.get(:duckdb_conn) do
      nil ->
        {:ok, db} = Duckdbex.open(config_path())
        {:ok, conn} = Duckdbex.connection(db)
        Process.put(:duckdb_conn, conn)
        conn

      conn ->
        conn
    end
  end

  defp config_path do
    Application.get_env(:prismatic_storage_duckdb, :database_path, ":memory:")
  end

  defp result_to_maps({columns, rows}) do
    Enum.map(rows, fn row ->
      columns
      |> Enum.zip(row)
      |> Map.new()
    end)
  end
end
```

## Platform Use Cases

| Use Case | Query Pattern | Why DuckDB Over PostgreSQL |
|----------|--------------|---------------------------|
| Security metrics aggregation | `AVG`, `PERCENTILE`, `STDDEV` over thousands of assets | 10-50x faster for large aggregations |
| Trend analysis | Window functions over time-series rating history | Columnar storage optimal for time-series scans |
| OSINT correlation | Cross-source joins on large intelligence datasets | Parallel hash joins on multi-million row datasets |
| Agent analytics | Aggregating execution metrics for 530 agents | In-memory analytical queries without DB round-trip |
| Export analytics | Parquet/CSV export of analysis results | Native format support without serialization overhead |
| Ad-hoc exploration | Interactive SQL on collected [EASM](/glossary/easm/) data | Zero-setup analytical environment |
| Quality metrics | Historical quality score trends across 115 apps | Columnar scans across time-series data |

## Integration with Broadway Pipelines

DuckDB integrates with the platform's [Broadway](/glossary/broadway/) data processing pipelines for batch analytical ingestion:

```elixir
defmodule PrismaticAnalytics.DuckDBSink do
  @moduledoc """
  Broadway batch processor that sinks analytical data into DuckDB
  for downstream analytical queries. Receives batches from
  Broadway pipelines and bulk-inserts into DuckDB tables.
  """

  @spec process_batch(String.t(), [map()]) :: {:ok, non_neg_integer()} | {:error, term()}
  def process_batch(table_name, records) when is_list(records) do
    columns = records |> List.first() |> Map.keys()
    placeholders = Enum.map_join(1..length(columns), ", ", &"$#{&1}")

    sql = """
    INSERT INTO #{table_name} (#{Enum.join(columns, ", ")})
    VALUES (#{placeholders})
    """

    results =
      Enum.map(records, fn record ->
        values = Enum.map(columns, &Map.get(record, &1))
        PrismaticStorage.DuckDB.Adapter.query(sql, values)
      end)

    success_count = Enum.count(results, &match?({:ok, _}, &1))
    {:ok, success_count}
  end
end
```

## Memory Management and Resource Control

When DuckDB runs embedded within a [BEAM](/glossary/beam/) application, resource management requires careful configuration to prevent DuckDB from competing with Erlang processes for memory:

```elixir
defmodule PrismaticStorage.DuckDB.Config do
  @moduledoc """
  Configuration management for embedded DuckDB instances.
  Ensures DuckDB resource usage stays within bounds that
  allow healthy coexistence with the BEAM runtime.
  """

  @spec configure_resource_limits(Duckdbex.connection()) :: :ok | {:error, term()}
  def configure_resource_limits(conn) do
    limits = [
      {"SET memory_limit = '2GB'", []},
      {"SET threads = #{max(System.schedulers_online() - 2, 1)}", []},
      {"SET temp_directory = '/tmp/duckdb_temp'", []},
      {"SET max_temp_directory_size = '5GB'", []}
    ]

    Enum.each(limits, fn {sql, params} ->
      Duckdbex.query(conn, sql, params)
    end)

    :ok
  end
end
```

| Resource | Default | Recommended for BEAM | Rationale |
|----------|---------|---------------------|-----------|
| **Memory limit** | Unlimited | 2GB | Leave headroom for BEAM processes and ETS |
| **Threads** | All cores | Cores - 2 | Reserve cores for BEAM schedulers |
| **Temp directory** | Working dir | `/tmp/duckdb_temp` | Avoid polluting project directory |
| **Max temp size** | Unlimited | 5GB | Prevent disk exhaustion from large sorts |

## Performance Benchmarks

Typical performance comparisons between DuckDB and PostgreSQL for analytical workloads on the Prismatic Platform's data scale:

| Query Type | PostgreSQL | DuckDB | Speedup |
|-----------|-----------|--------|---------|
| COUNT(*) over 1M rows | 250ms | 15ms | 16.7x |
| AVG with GROUP BY (100K groups) | 800ms | 45ms | 17.8x |
| PERCENTILE_CONT (P95) | 1,200ms | 80ms | 15x |
| Window function (LAG) over 500K rows | 1,500ms | 120ms | 12.5x |
| Multi-table JOIN + aggregate | 3,000ms | 200ms | 15x |
| Parquet file scan (1GB) | N/A (requires import) | 500ms | N/A |

## Comparison with Alternatives

| Database | Type | Deployment | Best For | Prismatic Role |
|----------|------|------------|----------|---------------|
| **DuckDB** | Embedded OLAP | In-process | Analytical aggregations, ad-hoc queries | Analytical workloads |
| **PostgreSQL** | Server OLTP/OLAP | External server | Transactional data, ACID writes | Source of truth |
| **SQLite** | Embedded OLTP | In-process | Simple key-value, local storage | Not used (DuckDB preferred) |
| **ClickHouse** | Server OLAP | External server | High-volume time-series ingestion | Too heavy for platform scale |
| **ETS** | In-memory KV | BEAM native | Fast key-value lookups, caching | Real-time cache |
| **Meilisearch** | Search engine | External server | Full-text search, typo tolerance | Search workloads |
| **KuzuDB** | Graph database | Embedded | Relationship traversal, graph analytics | Graph queries |
| **Snowflake** | Cloud OLAP | SaaS | Petabyte-scale analytics | Overkill for platform needs |

## Best Practices

1. **Use DuckDB for Analytics, PostgreSQL for Transactions**: DuckDB excels at read-heavy analytical queries over large datasets. PostgreSQL remains the correct choice for ACID transactional writes, concurrent multi-user access, and primary data storage.

2. **Leverage Direct File Queries**: DuckDB can query Parquet, CSV, and JSON files directly without importing. Use this capability for ad-hoc analysis of exported data, log files, and external intelligence feeds.

3. **Configure Memory Limits**: DuckDB will use all available memory by default. In an embedded context alongside BEAM processes, configure explicit memory limits to prevent resource contention: `SET memory_limit = '2GB'`.

4. **Use In-Memory for Ephemeral Analytics**: For queries over data that exists in PostgreSQL or [ETS](/glossary/ets/), load into DuckDB in-memory tables rather than persisting to DuckDB storage. This avoids data synchronization complexity.

5. **Batch Ingestion for Performance**: When loading data into DuckDB, use bulk operations (COPY, INSERT...SELECT) rather than single-row inserts. DuckDB's columnar storage is optimized for batch writes.

6. **Index Strategy**: DuckDB automatically creates lightweight min-max indices on column segments. Unlike PostgreSQL, explicit index creation is rarely necessary and can be counterproductive for scan-heavy workloads.

7. **Prefer Parquet for Data Exchange**: When exporting analytical results or exchanging data between systems, use Parquet format for its columnar layout, compression, and schema preservation.

## Related Concepts

- [Adapter Pattern](/glossary/adapter-pattern/) - Unified storage interface including DuckDB as the OLAP adapter
- [ETS](/glossary/ets/) - Complementary in-memory storage for caching and fast key-value access
- [KuzuDB](/glossary/kuzudb/) - Graph database complementing DuckDB for relationship queries
- [PostgreSQL](/glossary/postgresql/) - Primary relational OLTP database that DuckDB supplements for analytics
- [Meilisearch](/glossary/meilisearch/) - Full-text search engine complementing DuckDB's analytical capabilities
- [EASM](/glossary/easm/) - Domain generating analytical workloads processed by DuckDB
- [Broadway](/glossary/broadway/) - Data pipeline feeding analytical data into DuckDB
- [Connection Pooling](/glossary/connection-pooling/) - Resource management pattern for database connections
- [BEAM](/glossary/beam/) - Virtual machine hosting the embedded DuckDB instances

## See Also

- [Architecture](/architecture/) -- Platform multi-store architecture
- [Technologies](/technologies/) -- Storage technology stack
- [Capabilities](/capabilities/) -- Analytical capabilities powered by DuckDB

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
