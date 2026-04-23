+++
title = "TimescaleDB"
weight = 35
[extra]
category = "database"
description = "Time-series database extension for PostgreSQL optimized for fast ingest and complex time-based queries"
url = "https://www.timescale.com"
version = "2.14+"
icon = "timescale"
color = "yellow"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 901
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TimescaleDB", "Time-series", "PostgreSQL", "technologies", "database", "Prismatic Platform", "Ecto", "Compression"]
tags = ["technologies", "database", "timescaledb", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "TimescaleDB - Prismatic Platform"
+++

## Overview

TimescaleDB is the time-series database extension used in the Prismatic Platform for storing and querying temporal data -- agent performance metrics, security scan histories, compliance score trends, and system telemetry. As a [PostgreSQL](@/technologies/postgresql.md) extension, it integrates seamlessly with [Ecto](@/technologies/ecto.md) and the platform's existing PostgreSQL infrastructure, requiring no separate database server, no new query language, and no additional operational overhead.

The Prismatic Platform generates vast amounts of time-series data: agent activity logs, security rating changes over time, vulnerability discovery timelines, API response latencies, and system resource utilization. Without specialized time-series handling, these tables would grow to hundreds of millions of rows and become increasingly expensive to query. TimescaleDB's hypertables automatically partition this data by time, enabling both high-speed ingestion (thousands of rows per second) and efficient range queries across months of historical data with consistent performance regardless of table size.

TimescaleDB's continuous aggregates pre-compute common rollups (hourly, daily, weekly averages) that power the platform's trend dashboards without expensive real-time aggregation queries. These materialized views update incrementally as new data arrives, ensuring that dashboard queries always hit pre-computed data while remaining current within seconds. The compression feature achieves 90%+ storage savings on older data, allowing the platform to retain years of historical metrics without proportional storage cost increases.

## Key Features

- **Hypertables**: Automatic time-based partitioning that transparently chunks data by time interval, enabling fast inserts and efficient range queries on tables with billions of rows
- **Continuous Aggregates**: Materialized views that update incrementally as new data arrives, providing pre-computed rollups for dashboard queries without scan overhead
- **Compression**: Column-oriented compression achieving 90-95% storage savings on historical data while maintaining full query support
- **Data Retention Policies**: Automated policies for archiving or dropping old data partitions based on configurable time windows
- **Real-Time Aggregation**: Efficient `time_bucket()` function for grouping data into time intervals with millisecond precision
- **Full SQL Compatibility**: Standard PostgreSQL SQL with all extensions, joins, window functions, and CTEs -- no proprietary query language
- **Chunk Exclusion**: Query planner automatically skips time chunks outside the query's time range, preventing full table scans
- **Tiered Storage**: Move cold data to cheaper storage while keeping hot data on fast SSDs

## Platform Integration

TimescaleDB stores all time-series metrics and telemetry data. The platform uses [Ecto](@/technologies/ecto.md) queries with PostgreSQL-specific fragments to access TimescaleDB functions.

```elixir
defmodule PrismaticStorage.Metrics.TimeSeriesRepo do
  import Ecto.Query

  @doc "Agent activity trend with time bucketing and error rate calculation"
  def agent_activity_trend(agent_id, period \\ "1 hour") do
    from(m in "agent_metrics",
      where: m.agent_id == ^agent_id,
      where: m.recorded_at > ago(7, "day"),
      select: %{
        bucket: fragment("time_bucket(?, recorded_at)", ^period),
        avg_latency: avg(m.response_time_ms),
        total_requests: count(m.id),
        error_rate: fragment("COUNT(*) FILTER (WHERE status = 'error')::float / COUNT(*)")
      },
      group_by: fragment("time_bucket(?, recorded_at)", ^period),
      order_by: fragment("time_bucket(?, recorded_at)", ^period)
    )
    |> Repo.all()
  end

  @doc "Security rating history for a domain over the past N days"
  def rating_history(domain, days \\ 90) do
    from(r in "security_ratings",
      where: r.domain == ^domain,
      where: r.assessed_at > ago(^days, "day"),
      select: %{
        day: fragment("time_bucket('1 day', assessed_at)"),
        avg_score: avg(r.score),
        min_score: min(r.score),
        max_score: max(r.score),
        assessments: count(r.id)
      },
      group_by: fragment("time_bucket('1 day', assessed_at)"),
      order_by: fragment("time_bucket('1 day', assessed_at)")
    )
    |> Repo.all()
  end

  @doc "System-wide telemetry summary for monitoring dashboards"
  def system_telemetry_summary(period \\ "5 minutes") do
    from(t in "system_telemetry",
      where: t.recorded_at > ago(1, "hour"),
      select: %{
        bucket: fragment("time_bucket(?, recorded_at)", ^period),
        avg_cpu: avg(t.cpu_percent),
        avg_memory_mb: avg(t.memory_mb),
        peak_connections: max(t.active_connections),
        avg_query_time_ms: avg(t.query_time_ms)
      },
      group_by: fragment("time_bucket(?, recorded_at)", ^period),
      order_by: fragment("time_bucket(?, recorded_at)", ^period)
    )
    |> Repo.all()
  end
end
```

Continuous aggregates provide pre-computed rollups for dashboard performance:

```sql
-- Continuous aggregate for daily security rating summary
CREATE MATERIALIZED VIEW security_rating_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', assessed_at) AS day,
    domain,
    avg(score) AS avg_score,
    min(score) AS min_score,
    max(score) AS max_score,
    count(*) AS assessment_count
FROM security_ratings
GROUP BY time_bucket('1 day', assessed_at), domain;

-- Refresh policy: update every hour, looking back 3 days
SELECT add_continuous_aggregate_policy('security_rating_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```

## Architecture

TimescaleDB operates as a transparent layer on top of PostgreSQL, partitioning hypertables into time-based chunks while presenting a single-table interface to the application.

| Component | Role | Configuration |
|-----------|------|---------------|
| **Hypertables** | Time-partitioned tables | `create_hypertable()` on regular tables |
| **Chunks** | Time-interval partitions | 7-day default intervals, auto-created |
| **Continuous Aggregates** | Incremental materialized views | Pre-computed rollups for dashboards |
| **Compression** | Column-oriented storage for old data | 90%+ compression on data older than 30 days |
| **Retention Policies** | Automated data lifecycle management | Drop or archive data older than N days |
| **Chunk Exclusion** | Query optimization | Skip irrelevant time chunks automatically |
| **Background Workers** | Policy execution | Compression, retention, aggregate refresh |

Data lifecycle flow:

```
Ingest -> Hypertable (hot, uncompressed) -> Continuous Aggregate (materialized)
                |                                      |
        After 30 days                          Refresh hourly
                |                                      |
        Compress chunks                        Dashboard queries
                |
        After 90 days
                |
        Drop/archive via retention policy
```

## Performance Characteristics

TimescaleDB delivers significant performance improvements over raw PostgreSQL for time-series workloads.

| Metric | TimescaleDB | Raw PostgreSQL | Improvement |
|--------|-------------|----------------|-------------|
| Insert throughput | 100K+ rows/s | 50K+ rows/s | 2x+ |
| Range query (7 days) | <10ms | 100ms+ (full scan) | 10x+ |
| Aggregation (hourly buckets) | <50ms | 500ms+ | 10x+ |
| Continuous aggregate query | <5ms | N/A (manual materialization) | Pre-computed |
| Storage (compressed) | ~5% of raw | 100% | 20x savings |
| Chunk exclusion | O(1) per irrelevant chunk | Full table scan | Proportional to data age |
| Data retention cleanup | Instant (drop chunk) | Slow (DELETE + VACUUM) | 100x+ |

## Configuration

```sql
-- TimescaleDB hypertable creation for agent metrics
CREATE TABLE agent_metrics (
    id BIGSERIAL,
    agent_id UUID NOT NULL,
    response_time_ms DOUBLE PRECISION,
    status TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT create_hypertable('agent_metrics', 'recorded_at',
    chunk_time_interval => INTERVAL '7 days');

-- Compression policy: compress data older than 30 days
ALTER TABLE agent_metrics SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'agent_id',
    timescaledb.compress_orderby = 'recorded_at DESC'
);

SELECT add_compression_policy('agent_metrics', INTERVAL '30 days');

-- Retention policy: drop data older than 90 days
SELECT add_retention_policy('agent_metrics', INTERVAL '90 days');
```

Ecto migration for creating TimescaleDB hypertables:

```elixir
defmodule PrismaticStorage.Repo.Migrations.CreateAgentMetrics do
  use Ecto.Migration

  def up do
    create table(:agent_metrics) do
      add :agent_id, :binary_id, null: false
      add :response_time_ms, :float
      add :status, :string
      add :recorded_at, :utc_datetime_usec, null: false, default: fragment("NOW()")
    end

    create index(:agent_metrics, [:agent_id, :recorded_at])

    execute "SELECT create_hypertable('agent_metrics', 'recorded_at')"
    execute "SELECT add_retention_policy('agent_metrics', INTERVAL '90 days')"
  end

  def down do
    drop table(:agent_metrics)
  end
end
```

## Best Practices

- **Choose the right chunk interval** -- 7-day chunks are a good default; use shorter intervals (1 day) for very high ingest rates and longer (30 days) for slow-moving data
- **Use continuous aggregates for dashboard queries** -- never run raw aggregation queries against hypertables for dashboard rendering; pre-compute the rollups
- **Enable compression on historical data** -- compressed chunks use 90%+ less storage while remaining fully queryable; configure compression for data older than 30 days
- **Set retention policies early** -- define data lifecycle policies when creating hypertables to prevent unbounded storage growth
- **Include `time_bucket()` in GROUP BY** -- this is the canonical way to aggregate time-series data; it handles timezone-aware bucketing correctly
- **Segment compression by high-cardinality columns** -- `compress_segmentby` on frequently filtered columns (like `agent_id`) enables efficient decompression of only relevant segments
- **Monitor chunk count** -- thousands of tiny chunks degrade query planning; adjust `chunk_time_interval` if the chunk count grows excessively

## Comparison with Alternatives

| Feature | TimescaleDB | InfluxDB | Prometheus | ClickHouse |
|---------|-------------|----------|------------|------------|
| Query language | SQL (PostgreSQL) | Flux/InfluxQL | PromQL | SQL-like |
| PostgreSQL integration | Native extension | Separate system | Separate system | Separate system |
| Ecto compatibility | Full (via fragments) | None (separate client) | None (HTTP API) | Limited |
| Compression | 90-95% savings | Good | Good | Excellent |
| Continuous aggregates | Built-in | Continuous queries | Recording rules | Materialized views |
| Joins with relational data | Native (same DB) | Not possible | Not possible | Limited |
| Learning curve | Low (existing SQL knowledge) | Medium (new query language) | Medium (PromQL) | Medium |
| Platform role | Primary time-series storage | Not used | Monitoring metrics only | Not used |

TimescaleDB was chosen because it runs as a PostgreSQL extension within the existing database, eliminating the operational overhead of a separate time-series database while providing all necessary time-series features through standard SQL.

## Related Technologies

- [PostgreSQL](@/technologies/postgresql.md) - The base database that TimescaleDB extends
- [Ecto](@/technologies/ecto.md) - Query interface for accessing TimescaleDB through fragments
- [Chart.js](@/technologies/chartjs.md) - Time-series visualization in dashboards
- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Real-time dashboards displaying time-series data

## Related Apps

- [prismatic_storage_ecto](@/apps/prismatic-storage-ecto.md) - TimescaleDB queries via Ecto repository
- [prismatic_telemetry](@/apps/prismatic-telemetry.md) - System telemetry data stored in TimescaleDB hypertables
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Security rating history stored as time-series data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)