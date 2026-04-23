+++
title = "TimescaleDB"
weight = 12
[extra]
category = "infrastructure"
description = "PostgreSQL extension optimized for time-series data with automatic partitioning, compression, and continuous aggregates."
related_terms = ["postgresql", "metrics", "observability", "easm", "ecto", "timescaledb"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1234
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TimescaleDB", "PostgreSQL", "glossary", "infrastructure", "Prismatic Platform", "Continuous"]
tags = ["glossary", "infrastructure", "timescaledb", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "TimescaleDB - Prismatic Platform"
+++

## Definition

TimescaleDB is an open-source [PostgreSQL](/glossary/postgresql/) extension that transforms PostgreSQL into a high-performance time-series database. It introduces hypertables -- automatically partitioned tables that split data by time intervals (called chunks) -- while maintaining full PostgreSQL compatibility. Applications interact with hypertables using standard SQL (INSERT, SELECT, JOIN, CTE, window functions), but the underlying storage engine is optimized for the write-heavy, time-ordered, range-query patterns that characterize time-series workloads.

The core insight behind TimescaleDB is that time-series data has different access patterns than transactional data. Writes are predominantly inserts (append-only, monotonically increasing timestamps). Reads are predominantly range scans (last hour, last day, last month). Old data is rarely modified but frequently aggregated. These patterns enable aggressive optimizations: automatic chunk-based partitioning eliminates index bloat on large tables, native columnar compression achieves 90%+ space savings on historical data, and continuous aggregates provide materialized views that auto-refresh without manual maintenance.

Because TimescaleDB is a PostgreSQL extension rather than a separate database, it inherits all of PostgreSQL's strengths: ACID transactions, advanced indexing (B-tree, GiST, GIN, BRIN), full-text search, JSON support, PostGIS geospatial queries, and the entire PostgreSQL ecosystem of tools, drivers, and operational knowledge. Applications can join time-series hypertables with regular relational tables in a single query, eliminating the data integration challenges that arise when time-series data lives in a separate specialized database.

## Core Concepts

### Hypertables

A hypertable is a TimescaleDB table that is automatically partitioned into chunks by time:

```sql
-- Create a regular PostgreSQL table
CREATE TABLE security_ratings (
    time        TIMESTAMPTZ NOT NULL,
    domain      TEXT NOT NULL,
    score       FLOAT NOT NULL,
    grade       CHAR(1) NOT NULL,
    details     JSONB
);

-- Convert to a hypertable (automatic time-based partitioning)
SELECT create_hypertable('security_ratings', 'time',
    chunk_time_interval => INTERVAL '1 day'
);

-- Queries work with standard SQL -- TimescaleDB optimizes internally
SELECT domain, avg(score), count(*)
FROM security_ratings
WHERE time > NOW() - INTERVAL '7 days'
GROUP BY domain
ORDER BY avg(score) DESC;
```

| Concept | Description | Benefit |
|---------|-----------|---------|
| **Hypertable** | Virtual table spanning multiple chunks | Standard SQL interface, automatic partitioning |
| **Chunk** | Physical partition covering a time interval | Efficient pruning, parallel query, independent compression |
| **Chunk interval** | Time range per chunk (e.g., 1 day, 1 hour) | Tunable based on data volume and query patterns |
| **Space partitioning** | Optional secondary partitioning (e.g., by domain) | Multi-tenant workloads, parallel ingest |

### Chunk Interval Tuning

Choosing the right chunk interval is critical for performance. The interval determines the granularity of partition pruning, compression units, and retention operations:

| Data Volume | Recommended Interval | Reasoning |
|------------|---------------------|-----------|
| < 1M rows/day | 1 week | Fewer chunks, simpler management |
| 1M-10M rows/day | 1 day | Good balance of pruning and overhead |
| 10M-100M rows/day | 1 hour | Fine-grained pruning for range queries |
| > 100M rows/day | Custom (minutes) | Minimize per-chunk index size |

The guiding principle is that each chunk should contain roughly 1-10 million rows. Too few rows per chunk wastes overhead; too many reduces the benefit of partition pruning.

### Compression

TimescaleDB's native compression converts row-oriented chunks into columnar format, achieving dramatic space savings:

```sql
-- Enable compression on the hypertable
ALTER TABLE security_ratings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'domain',
    timescaledb.compress_orderby = 'time DESC'
);

-- Add a compression policy: compress chunks older than 7 days
SELECT add_compression_policy('security_ratings', INTERVAL '7 days');
```

| Aspect | Uncompressed | Compressed |
|--------|-------------|-----------|
| **Storage** | 100 GB | 5-10 GB (90-95% reduction) |
| **Write Speed** | Full speed | Read-only (must decompress to modify) |
| **Read Speed** | Standard PostgreSQL | Faster for analytical queries (columnar) |
| **Index Support** | All PostgreSQL indexes | Segment-based scanning |

The `compress_segmentby` parameter determines how compressed data is organized. Segmenting by `domain` means that queries filtering on a specific domain can skip segments belonging to other domains, dramatically reducing I/O for filtered queries on compressed data.

### Continuous Aggregates

Continuous aggregates are materialized views that automatically and incrementally refresh as new data arrives:

```sql
-- Create a continuous aggregate for hourly security score averages
CREATE MATERIALIZED VIEW security_ratings_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    domain,
    avg(score) AS avg_score,
    min(score) AS min_score,
    max(score) AS max_score,
    count(*) AS measurement_count
FROM security_ratings
GROUP BY bucket, domain;

-- Add a refresh policy: update every hour, covering the last 2 hours
SELECT add_continuous_aggregate_policy('security_ratings_hourly',
    start_offset => INTERVAL '2 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);

-- Query the aggregate (fast -- reads pre-computed data)
SELECT domain, avg_score
FROM security_ratings_hourly
WHERE bucket > NOW() - INTERVAL '24 hours'
ORDER BY avg_score DESC;
```

Continuous aggregates are incremental -- they only recompute buckets that have received new data since the last refresh. This makes them suitable for high-volume time-series workloads where recomputing the entire aggregate from raw data would be prohibitively expensive.

### Hierarchical Continuous Aggregates

TimescaleDB supports layering continuous aggregates on top of each other, creating a hierarchy of pre-computed summaries:

```sql
-- Hourly aggregate (base)
CREATE MATERIALIZED VIEW ratings_hourly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS bucket, domain,
       avg(score) AS avg_score, count(*) AS count
FROM security_ratings
GROUP BY bucket, domain;

-- Daily aggregate (built on hourly)
CREATE MATERIALIZED VIEW ratings_daily
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', bucket) AS bucket, domain,
       avg(avg_score) AS avg_score, sum(count) AS count
FROM ratings_hourly
GROUP BY time_bucket('1 day', bucket), domain;

-- Monthly aggregate (built on daily)
CREATE MATERIALIZED VIEW ratings_monthly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 month', bucket) AS bucket, domain,
       avg(avg_score) AS avg_score, sum(count) AS count
FROM ratings_daily
GROUP BY time_bucket('1 month', bucket), domain;
```

This hierarchy enables dashboards to serve different time ranges from appropriate aggregation levels -- last-hour data from the hypertable, last-day from hourly aggregates, last-month from daily, and last-year from monthly -- with consistent sub-second query performance regardless of the time range.

### Retention Policies

Automated data lifecycle management through retention policies:

```sql
-- Automatically drop chunks older than 1 year
SELECT add_retention_policy('security_ratings', INTERVAL '1 year');

-- Keep raw data for 30 days, aggregated data for 2 years
SELECT add_retention_policy('security_ratings', INTERVAL '30 days');
SELECT add_retention_policy('security_ratings_hourly', INTERVAL '2 years');
```

## TimescaleDB Functions

| Function | Purpose | Example |
|----------|---------|---------|
| **`time_bucket()`** | Group timestamps into fixed intervals | `time_bucket('5 minutes', time)` |
| **`first()` / `last()`** | First/last value in a time bucket | `first(score, time)` |
| **`time_bucket_gapfill()`** | Fill missing time intervals with values | Interpolation for dashboards |
| **`histogram()`** | Create histogram of values | Distribution analysis |
| **`approximate_row_count()`** | Fast approximate count | Dashboard counters |
| **`chunks_detailed_size()`** | Per-chunk storage statistics | Capacity planning |

## Implementation in Prismatic Platform

The Prismatic Platform uses TimescaleDB for all time-series data workloads, integrated through [Ecto](/glossary/ecto/) and the platform's storage adapter layer:

- **Security Rating History**: The [Perimeter](/glossary/easm/) module stores historical security ratings (A-F grades with numeric 300-900 scores) as time-series data. Each domain's rating is tracked over time, enabling trend analysis ("has example.com's score improved this quarter?") and regression detection ("alert when a score drops more than 50 points").
- **Compliance Assessment Snapshots**: NIS2 and ZKB compliance assessment results are stored as time-series records, providing an audit trail for regulatory reporting and enabling compliance trend visualization.
- **Quality [Metric](/glossary/metrics/) Trends**: Platform quality metrics (13 quality domains, QDP scores, test coverage) are stored in TimescaleDB for long-term trend analysis. Continuous aggregates power the quality dashboard's hourly, daily, and weekly trend views.
- **Telemetry Event Streams**: High-volume telemetry events (agent execution metrics, storage adapter latencies, API response times) are stored in hypertables with automatic compression for historical data.
- **Asset Discovery Timelines**: Attack surface changes over time -- new domains discovered, certificates expiring, services appearing or disappearing -- are tracked as time-series events for change detection and alerting.
- **[Observability](/glossary/observability/) Infrastructure**: TimescaleDB serves as the storage backend for the platform's metrics pillar, complementing [structured logging](/glossary/structured-logging/) (text-based) and [distributed tracing](/glossary/distributed-tracing/) (span-based) with efficient numeric time-series storage.

## Ecto Integration

TimescaleDB works seamlessly with Ecto through the standard PostgreSQL adapter:

```elixir
defmodule PrismaticStorage.SecurityRating do
  use Ecto.Schema
  import Ecto.Query

  schema "security_ratings" do
    field :time, :utc_datetime_usec
    field :domain, :string
    field :score, :float
    field :grade, :string
    field :details, :map
  end

  @doc "Get average scores per domain over the last N days"
  def average_scores(days \\ 7) do
    from(r in __MODULE__,
      where: r.time > ago(^days, "day"),
      group_by: r.domain,
      select: %{
        domain: r.domain,
        avg_score: avg(r.score),
        min_score: min(r.score),
        max_score: max(r.score),
        count: count(r.id)
      },
      order_by: [desc: avg(r.score)]
    )
  end

  @doc "Detect score regressions exceeding threshold"
  def detect_regressions(threshold \\ 50.0) do
    from(r in __MODULE__,
      join: prev in __MODULE__,
      on: r.domain == prev.domain,
      where: r.time > ago(1, "day"),
      where: prev.time > ago(2, "day") and prev.time <= ago(1, "day"),
      group_by: r.domain,
      having: avg(fragment("?", prev.score)) - avg(r.score) > ^threshold,
      select: %{
        domain: r.domain,
        current_avg: avg(r.score),
        previous_avg: avg(fragment("?", prev.score)),
        drop: avg(fragment("?", prev.score)) - avg(r.score)
      }
    )
  end
end
```

### Ecto Migrations for Hypertables

```elixir
defmodule PrismaticStorage.Repo.Migrations.CreateSecurityRatings do
  use Ecto.Migration

  def up do
    create table(:security_ratings, primary_key: false) do
      add :time, :utc_datetime_usec, null: false
      add :domain, :string, null: false
      add :score, :float, null: false
      add :grade, :string, size: 1, null: false
      add :details, :map
    end

    # Convert to TimescaleDB hypertable
    execute "SELECT create_hypertable('security_ratings', 'time', chunk_time_interval => INTERVAL '1 day')"

    # Create indexes optimized for time-series queries
    create index(:security_ratings, [:domain, :time])

    # Enable compression
    execute """
    ALTER TABLE security_ratings SET (
      timescaledb.compress,
      timescaledb.compress_segmentby = 'domain',
      timescaledb.compress_orderby = 'time DESC'
    )
    """

    # Add compression policy
    execute "SELECT add_compression_policy('security_ratings', INTERVAL '7 days')"
  end

  def down do
    drop table(:security_ratings)
  end
end
```

## TimescaleDB vs. Alternatives

| Feature | TimescaleDB | InfluxDB | Prometheus | Standard PostgreSQL |
|---------|------------|----------|-----------|-------------------|
| **SQL Support** | Full PostgreSQL SQL | InfluxQL / Flux | PromQL | Full SQL |
| **Joins** | Yes (with any PG table) | Limited | No | Yes |
| **Compression** | Native (90%+) | Native | TSDB format | Manual (TOAST) |
| **Continuous Agg** | Native | Continuous queries | Recording rules | Materialized views (manual refresh) |
| **Ecosystem** | PostgreSQL tools + extensions | Specialized | Specialized | Full PostgreSQL |
| **Scale** | Billions of rows | Billions of points | Millions of time series | Degrades at scale |
| **Learning Curve** | Low (SQL) | Medium (new query language) | Medium (PromQL) | Low (SQL) |

## Performance Characteristics

| Workload | Standard PostgreSQL | TimescaleDB | Improvement |
|----------|-------------------|-------------|------------|
| **Insert rate** | ~50K rows/sec | ~200K rows/sec | 4x (chunk-based parallel inserts) |
| **Time range query** | Full table scan or large index | Chunk pruning | 10-100x faster |
| **Aggregation (recent)** | Query raw data | Continuous aggregate | 100-1000x faster |
| **Storage (1 year)** | 100 GB | 5-10 GB | 10-20x smaller |
| **Old data deletion** | Row-by-row DELETE | DROP CHUNK | Near-instant |

## Best Practices

**Choose Chunk Intervals Based on Data Volume**: The chunk interval should produce chunks of 1-10 million rows each. Too-small chunks create management overhead; too-large chunks reduce partition pruning effectiveness. Monitor chunk sizes with `chunks_detailed_size()` and adjust as data volume changes.

**Use Continuous Aggregates for Dashboard Queries**: Never query raw hypertable data for dashboard visualizations that aggregate over time. Create continuous aggregates at the granularity each dashboard panel needs, and query the aggregate instead. This reduces query latency from seconds to milliseconds.

**Compress Historical Data Aggressively**: Enable compression for all data older than the write window (the period where data may still be modified). For most workloads, a 7-day compression lag provides sufficient write flexibility while capturing 90%+ of storage savings.

**Implement Tiered Retention**: Keep raw data for short-term debugging (7-30 days), hourly aggregates for medium-term analysis (90 days to 1 year), and daily/monthly aggregates for long-term trending (2-5 years). Use retention policies to automate data lifecycle management.

## Related Terms

- [PostgreSQL](/glossary/postgresql/) - Foundation database that TimescaleDB extends
- [Metrics](/glossary/metrics/) - Numeric measurements stored in TimescaleDB time series
- [Observability](/glossary/observability/) - TimescaleDB as metrics storage backend
- [EASM](/glossary/easm/) - Security data with time-series storage requirements
- [Ecto](/glossary/ecto/) - Elixir database library for TimescaleDB integration
- [Structured Logging](/glossary/structured-logging/) - Complementary text-based event storage
- [Distributed Tracing](/glossary/distributed-tracing/) - Complementary span-based request tracking
- [QDP](/glossary/qdp/) - Quality metrics tracked as time series for trend analysis
- [Autoheal](/glossary/autoheal/) - Healing operations informed by metric trends
- [Broadway](/glossary/broadway/) - Data pipeline producing time-series events for storage

## See Also

- [Architecture](/architecture/) - Platform data storage architecture
- [Technologies](/technologies/) - Database technology stack
- [Capabilities](/capabilities/) - Time-series analysis and trend detection capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)