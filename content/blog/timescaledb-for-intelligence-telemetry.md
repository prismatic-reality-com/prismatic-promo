+++
title = "TimescaleDB for Intelligence Telemetry: When Postgres Becomes a Time-Series Store"
date = 2026-04-09
description = "Storing OSINT run telemetry, decision calibration history, and detection counts in plain Postgres works — until you hit 500 million rows. TimescaleDB turns the same database into a time-series store without a new system to operate."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["timescaledb", "time-series", "postgresql", "telemetry", "storage"]
reading_time = "7 min"
keywords = ["TimescaleDB Elixir", "time-series Postgres", "intelligence telemetry", "hypertable"]
image = "/images/blog/timescaledb.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["timescaledb", "time-series", "postgresql", "telemetry", "metrics"]
image_alt = "TimescaleDB for Intelligence Telemetry"
+++

Prismatic writes a lot of [time-series](/glossary/time-series) data: OSINT run durations, decision engine calibration samples, error feed counts, EASM discovery events. At ~3,000 writes per second sustained, a plain Postgres table hits pain at ~100M rows — index maintenance dominates, `VACUUM` lags, query plans drift. [TimescaleDB](/glossary/timescaledb) is the "add one extension" fix that keeps the workload on [PostgreSQL](/glossary/postgresql) instead of forcing a new system into the stack.

## What a hypertable actually does

A TimescaleDB hypertable looks like a regular table but is transparently partitioned into chunks by time. Queries that filter on the time column only touch relevant chunks. Inserts go to the current chunk. Index size per chunk stays bounded. `VACUUM` on a chunk finishes in seconds, not hours.

```sql
CREATE TABLE osint_runs (
  ts timestamptz NOT NULL,
  adapter text NOT NULL,
  duration_ms int NOT NULL,
  status text NOT NULL,
  run_id uuid NOT NULL
);

SELECT create_hypertable('osint_runs', 'ts', chunk_time_interval => INTERVAL '1 day');
CREATE INDEX ON osint_runs (adapter, ts DESC);
```

That is it. Inserts use plain SQL. Ecto does not know or care. The Elixir side is identical to a regular Postgres table.

## Continuous aggregates: the killer feature

A dashboard that shows "average adapter duration per hour over the last 30 days" scans 30 days of raw rows each time unless you cache. TimescaleDB continuous aggregates cache for you — and refresh incrementally:

```sql
CREATE MATERIALIZED VIEW osint_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', ts) AS bucket,
  adapter,
  avg(duration_ms) AS avg_ms,
  count(*) AS runs,
  count(*) FILTER (WHERE status = 'error') AS errors
FROM osint_runs
GROUP BY bucket, adapter;

SELECT add_continuous_aggregate_policy('osint_hourly',
  start_offset => INTERVAL '7 days',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '10 minutes');
```

The dashboard now queries `osint_hourly` (thousands of rows) instead of `osint_runs` (hundreds of millions). Query time drops from seconds to milliseconds. Refresh is incremental and bounded.

## Retention without cron

```sql
SELECT add_retention_policy('osint_runs', INTERVAL '90 days');
```

Data older than 90 days is dropped chunk-by-chunk. No cron. No `DELETE` storm. No fragmented tables. Pair with a compression policy and rows older than 7 days are columnar-compressed — usually 10× smaller.

## When NOT to use TimescaleDB

- The data is not time-keyed. If your primary filter is not `ts`, a hypertable does not help.
- Volume is small. Under 10M rows, plain Postgres is fine and simpler.
- You already have a dedicated [metrics](/glossary/metrics) pipeline (Prometheus + long-term storage). Don't duplicate the stack.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — when hypertables belong in the mix
- **Glossary**: [TimescaleDB](/glossary/timescaledb), [Time Series](/glossary/time-series), [PostgreSQL](/glossary/postgresql), [Telemetry](/glossary/telemetry), [Metrics](/glossary/metrics)

Same database. New access pattern. No new operations surface.
