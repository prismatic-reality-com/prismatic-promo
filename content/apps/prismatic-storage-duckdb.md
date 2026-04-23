+++
title = "Prismatic Storage DuckDB"
weight = 40
[extra]
icon = "table-cells"
color = "orange"
description = "DuckDB adapter for analytical queries and columnar data processing"
category = "Storage"
files = "75"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1214
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "DuckDB", "apps", "Prismatic Platform", "Parquet", "PrismaticStorage", "Prismatic Storage"]
tags = ["apps", "storage", "prismatic-storage-duckdb", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage DuckDB - Prismatic Platform"
+++

## Overview

[Prismatic Storage](/glossary/prismatic-storage/) [DuckDB](/glossary/duckdb/) implements the platform's storage adapter [protocol](/glossary/protocol/) using DuckDB, an embedded analytical database optimized for columnar storage and vectorized query execution. It serves analytical workloads such as log analysis, time-series aggregation, [OSINT](/glossary/osint/) data exploration, and large-scale security metric computation -- use cases where the columnar layout and parallel query engine deliver orders-of-magnitude performance improvements over row-oriented databases.

DuckDB fills a specific niche in the platform's storage architecture. Datasets that are too large for in-memory [ETS](/glossary/ets/) processing but do not warrant the operational overhead of a dedicated [PostgreSQL](/glossary/postgresql/) instance can be served efficiently by DuckDB's embedded engine. The adapter supports zero-copy integration with Parquet and CSV files, enabling direct analytical queries over data exports from other platform components without requiring explicit import steps. The `duckdbex` library provides native NIF bindings to the DuckDB C library, with query execution managed through a supervised [OTP](/glossary/otp/) process pool.

The adapter implements the Storable, Identifiable, Queryable, and Streamable traits defined in [Prismatic Storage Core](/apps/prismatic-storage-core/), making it interchangeable with other storage backends through the platform's [adapter pattern](/glossary/adapter-pattern/). Applications can switch between ETS, [Ecto](/glossary/ecto/)/PostgreSQL, and DuckDB storage by changing a configuration value, without modifying business logic.

## Architecture

```
Application Layer --> Storage Adapter Protocol --> DuckDB Adapter
        |                    |                       |
  Business Logic      Protocol Dispatch        DuckDB Engine (duckdbex NIF)
  Query Interface     Adapter Selection        Columnar Storage
  Result Mapping      Error Handling           Vectorized Execution
        |                                          |
  External Data <-- Zero-Copy Integration --> Parquet/CSV/Arrow
```

The adapter is implemented as an OTP application (`PrismaticStorage.DuckDB.Application`) with a supervised connection pool. The connection pool manages access to the embedded DuckDB database file, serializing write operations while allowing concurrent read access through DuckDB's MVCC isolation. The query engine translates both structured API calls and raw SQL queries into DuckDB operations, with results serialized back through the adapter protocol's standard `{:ok, result}` / `{:error, reason}` tuple pattern.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The DuckDB adapter follows the contract-first design mandated by [Prismatic Storage Core](/apps/prismatic-storage-core/). At the module level, it declares `use PrismaticStorageCore.Adapter, traits: [Storable, Identifiable, Queryable, Streamable]`, which triggers compile-time verification that all required callbacks are implemented. This declaration serves as both documentation and enforcement -- Dialyzer catches missing callbacks during compilation rather than allowing runtime failures.

The Storable trait implementation handles the translation between Elixir maps and DuckDB's columnar representation. Unlike row-oriented adapters where entities map naturally to individual records, the DuckDB adapter batches entities into column-oriented chunks for efficient insertion. The `to_storage/1` callback decomposes entity maps into column arrays, while `from_storage/2` reconstructs entities from columnar query results. This translation layer is invisible to application code, which continues to work with standard Elixir maps through the protocol interface.

The Queryable trait implementation deserves particular attention because DuckDB's SQL dialect supports analytical functions that other adapters cannot match. Window functions, common table expressions with recursive queries, and vectorized aggregations are exposed through the trait's `aggregate/3` and `query/2` callbacks. When application code requests aggregations through the standard trait interface, the DuckDB adapter generates optimized SQL that leverages the columnar engine's parallel execution capabilities.

The Streamable trait enables memory-efficient processing of large result sets. Rather than materializing entire query results into memory, the adapter returns lazy `Stream` values that fetch rows in configurable batch sizes. This is essential for analytical workloads where result sets may contain millions of rows -- the streaming interface allows downstream processing pipelines to consume results incrementally without memory pressure.

Contract compliance is verified through the shared test suite provided by `PrismaticStorageCore.ContractTest`. The DuckDB adapter's test module includes `use PrismaticStorageCore.ContractTest, adapter_module: PrismaticStorage.DuckDB`, which generates test cases for every callback in every declared trait. Additional backend-specific tests cover DuckDB-unique features such as Parquet integration, columnar compression, and vectorized execution performance.

## Columnar Storage and Vectorized Execution

DuckDB's columnar storage model fundamentally differs from the row-oriented storage used by PostgreSQL and ETS. In a row-oriented store, each record's fields are stored contiguously in memory, making individual record access fast but aggregation over many records slow due to poor cache utilization. In DuckDB's columnar model, values for each column are stored contiguously, enabling the CPU's SIMD (Single Instruction, Multiple Data) instructions to process entire columns in parallel.

This architectural difference has profound implications for query performance. Aggregation queries -- counting records, computing averages, finding minimums and maximums -- operate on contiguous memory regions that fit efficiently in CPU cache lines. For the Prismatic Platform's analytical workloads, which frequently involve computing statistics over millions of OSINT findings or security scan results, the columnar layout delivers 10-100x performance improvements compared to equivalent queries against PostgreSQL.

The vectorized execution engine processes data in batches of 1,024 values rather than one row at a time. Each operator in the query plan -- filter, project, aggregate, sort -- operates on these fixed-size vectors, maximizing CPU pipeline utilization and minimizing branch misprediction overhead. The adapter exposes this vectorized execution transparently through the standard query interface; application code benefits from the performance without awareness of the underlying execution model.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticStorage.DuckDB` | Main adapter module implementing Storage Core traits |
| `PrismaticStorage.DuckDB.Application` | OTP Application with supervised connection pool |
| `PrismaticStorage.DuckDB.Connection` | Managed DuckDB connection lifecycle |
| `PrismaticStorage.DuckDB.Query` | SQL query builder and result parser |
| `PrismaticStorage.DuckDB.Import` | Parquet/CSV import with schema detection |
| `PrismaticStorage.DuckDB.Export` | Query result export to Parquet/CSV formats |

## Configuration

```elixir
config :prismatic_storage_duckdb, PrismaticStorage.DuckDB,
  path: "priv/data/analytics.duckdb",
  memory_limit: "4GB",
  threads: 4,
  timeout: 15_000
```

## External Data Integration

One of DuckDB's most powerful features for the Prismatic Platform is its ability to query external files directly without importing them into the database. The `read_parquet()`, `read_csv()`, and `read_json()` functions enable zero-copy queries over data exports from other platform components. This means that OSINT collection results exported as Parquet files by the [Prismatic OSINT Core](/apps/prismatic-osint-core/) can be analyzed immediately without a separate ingestion step.

The Import module provides automatic schema detection for external files. When a Parquet file is first queried, DuckDB reads the file's embedded schema metadata and creates an appropriate virtual table. For CSV files without embedded schema, the Import module samples the first 10,000 rows to infer column types. This schema detection is cached in ETS for subsequent queries, avoiding repeated inference overhead.

Export capabilities complete the analytical pipeline. After computing aggregations, trend analyses, or statistical summaries, results can be exported to Parquet with configurable compression (Snappy, Zstd, or LZ4). These exports integrate with the platform's reporting infrastructure, where [Prismatic Web](/apps/prismatic-web/) dashboards visualize analytical results and [Prismatic API](/apps/prismatic-api/) endpoints serve them as downloadable reports.

## API Reference

```elixir
# Analytical query with aggregation
{:ok, results} = PrismaticStorageDuckdb.query("""
  SELECT date_trunc('day', created_at) as day,
         count(*) as signals,
         avg(severity_score) as avg_severity
  FROM signals
  WHERE entity = 'example.com'
  GROUP BY 1
  ORDER BY 1
""")

# Direct query over external Parquet without import
{:ok, results} = PrismaticStorageDuckdb.query("""
  SELECT * FROM read_parquet('exports/osint_*.parquet')
  WHERE severity >= 7
""")

# Import from Parquet file
{:ok, _} = PrismaticStorageDuckdb.import("signals.parquet", :signals)

# Export query results to Parquet with compression
{:ok, path} = PrismaticStorageDuckdb.export(:signals, "output.parquet",
  format: :parquet, compression: :zstd)

# Standard adapter protocol operations
:ok = PrismaticStorageDuckdb.put(adapter, "metrics:2024-01", %{visits: 10_000})
{:ok, data} = PrismaticStorageDuckdb.get(adapter, "metrics:2024-01")
```

## Testing

```bash
mix test apps/prismatic_storage_duckdb/test
mix test apps/prismatic_storage_duckdb/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | Storable, Identifiable, Queryable, Streamable compliance |
| SQL Queries | 12 | Aggregation, window functions, CTEs |
| Parquet I/O | 8 | Import/export correctness, compression |
| Concurrency | 6 | Read/write isolation under concurrent access |
| Schema Detection | 6 | Automatic type inference for CSV and JSON sources |
| Streaming | 4 | Memory-efficient iteration over large result sets |

## Integration Points

- **[Prismatic Storage Core](/apps/prismatic-storage-core/)** -- Implements the core storage adapter behaviour and trait contracts
- **[Prismatic Signals](/apps/prismatic-signals/)** -- Analytical queries over historical signal data
- **[Prismatic OSINT Core](/apps/prismatic-osint-core/)** -- Large-scale OSINT data exploration and aggregation
- **[Prismatic Monte Carlo](/apps/prismatic-monte-carlo/)** -- Simulation result storage and statistical analysis

## NABLA Compliance

DuckDB operations carry full provenance metadata through telemetry events. Query results include source file paths for Parquet-based queries and table identifiers for internal queries, satisfying the Provenance Mandatory axiom. The analytical nature of DuckDB queries inherently supports Signal Plurality by enabling aggregation across multiple data sources in a single query. Time Decay is naturally modeled through SQL temporal functions (`date_trunc`, window functions) that weight recent observations appropriately.

## Performance

| Metric | Value |
|--------|-------|
| Analytical queries vs row-based DBs | 10-100x faster |
| Data compression ratio | 5-10x |
| Parallel query threads | Configurable (default: 4) |
| Parquet read throughput | Hundreds of MB/s |
| Memory-efficient streaming | Constant memory for large datasets |
| Vectorized batch size | 1,024 values per operation |

## Related Resources

- [Prismatic Storage ETS](/apps/prismatic-storage-ets/) -- In-memory adapter for hot path data
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- PostgreSQL adapter for transactional workloads
- [Prismatic Storage](/apps/prismatic-storage/) -- Unified storage coordination layer

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)