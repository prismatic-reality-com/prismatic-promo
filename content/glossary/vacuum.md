+++
title = "Vacuum"
weight = 50
[extra]
description = "PostgreSQL maintenance operation that reclaims storage from dead tuples and updates query planner statistics"
category = "database"
related_terms = ["postgresql", "dead-tuple", "autovacuum", "bloat"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["vacuum", "PostgreSQL", "dead tuples", "autovacuum", "table bloat", "MVCC", "glossary", "Prismatic Platform"]
tags = ["glossary", "database"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Vacuum - Prismatic Platform"
+++

## Definition & Overview

Vacuum is a PostgreSQL maintenance operation that reclaims disk space occupied by dead tuples (rows that have been deleted or updated but not yet physically removed) and updates the statistics used by the query planner. Due to PostgreSQL's Multi-Version Concurrency Control (MVCC) architecture, when a row is updated or deleted, the old version is not immediately removed. Instead, it is marked as dead and left in place until a vacuum operation cleans it up. Without regular vacuuming, tables accumulate dead tuples, causing bloat that wastes disk space and degrades query performance.

PostgreSQL provides two types of vacuum: standard VACUUM which marks dead tuples as reusable without returning space to the operating system, and VACUUM FULL which physically compacts the table by rewriting it entirely. Standard vacuum is lightweight and can run concurrently with normal operations, while VACUUM FULL requires an exclusive lock and is typically only used as a last resort for severely bloated tables.

In the Prismatic Platform, vacuuming is particularly important for the DD pipeline tables (`dd_entities`, `dd_fetch_records`, `dd_load_runs`) which undergo frequent upsert operations as the Scheduler periodically refreshes data from Czech registries. The OSINT tool execution history table also accumulates dead tuples as old executions are updated with results. Proper vacuum configuration ensures these high-write tables maintain optimal query performance.

## Technical Deep Dive

The platform monitors vacuum statistics and table bloat through Ecto queries against PostgreSQL system catalogs:

```elixir
defmodule PrismaticDatabase.VacuumMonitor do
  @moduledoc """
  Monitors PostgreSQL vacuum status and table bloat,
  alerting when maintenance is needed.
  """

  import Ecto.Query

  @bloat_threshold_percent 20
  @dead_tuple_threshold 10_000

  @spec check_vacuum_status(Ecto.Repo.t()) :: {:ok, [map()]} | {:error, term()}
  def check_vacuum_status(repo) do
    query = """
    SELECT
      schemaname,
      relname AS table_name,
      n_live_tup AS live_tuples,
      n_dead_tup AS dead_tuples,
      CASE WHEN n_live_tup > 0
        THEN round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0
      END AS dead_percentage,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze,
      vacuum_count,
      autovacuum_count
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 0
    ORDER BY n_dead_tup DESC
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: rows, columns: columns}} ->
        results =
          rows
          |> Enum.map(fn row ->
            columns
            |> Enum.zip(row)
            |> Map.new(fn {col, val} -> {String.to_atom(col), val} end)
          end)

        {:ok, results}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec tables_needing_vacuum(Ecto.Repo.t()) :: [map()]
  def tables_needing_vacuum(repo) do
    case check_vacuum_status(repo) do
      {:ok, tables} ->
        Enum.filter(tables, fn table ->
          table.dead_tuples > @dead_tuple_threshold or
          table.dead_percentage > @bloat_threshold_percent
        end)

      {:error, _} ->
        []
    end
  end

  @spec estimate_bloat(Ecto.Repo.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def estimate_bloat(repo, table_name) do
    query = """
    SELECT
      pg_size_pretty(pg_total_relation_size($1)) AS total_size,
      pg_size_pretty(pg_relation_size($1)) AS table_size,
      pg_size_pretty(pg_indexes_size($1)) AS index_size,
      (SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = $1) AS dead_tuples,
      (SELECT n_live_tup FROM pg_stat_user_tables WHERE relname = $1) AS live_tuples
    """

    case Ecto.Adapters.SQL.query(repo, query, [table_name]) do
      {:ok, %{rows: [[total, table, index, dead, live]]}} ->
        {:ok, %{
          total_size: total,
          table_size: table,
          index_size: index,
          dead_tuples: dead || 0,
          live_tuples: live || 0,
          estimated_bloat_percent:
            if((dead || 0) + (live || 0) > 0,
              do: Float.round(100.0 * (dead || 0) / ((dead || 0) + (live || 0)), 2),
              else: 0.0)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

Autovacuum configuration tuning for high-write tables:

```elixir
defmodule PrismaticDatabase.VacuumConfig do
  @moduledoc """
  Configures per-table autovacuum settings for optimal
  maintenance of high-write DD and OSINT tables.
  """

  @high_write_tables [
    "dd_entities",
    "dd_fetch_records",
    "dd_load_runs",
    "dd_entity_attributes",
    "osint_executions"
  ]

  @spec apply_optimized_settings(Ecto.Repo.t()) :: :ok | {:error, term()}
  def apply_optimized_settings(repo) do
    Enum.each(@high_write_tables, fn table ->
      statements = [
        "ALTER TABLE #{table} SET (autovacuum_vacuum_scale_factor = 0.05)",
        "ALTER TABLE #{table} SET (autovacuum_analyze_scale_factor = 0.02)",
        "ALTER TABLE #{table} SET (autovacuum_vacuum_cost_delay = 10)",
        "ALTER TABLE #{table} SET (autovacuum_vacuum_threshold = 500)"
      ]

      Enum.each(statements, fn sql ->
        Ecto.Adapters.SQL.query(repo, sql, [])
      end)
    end)

    :ok
  end
end
```

## Architecture & Implementation

Vacuum management in the platform operates on two levels:

**Autovacuum (Automated)**: PostgreSQL's autovacuum daemon runs continuously, monitoring each table's dead tuple count and triggering vacuum when thresholds are exceeded. The platform tunes autovacuum parameters per table based on write patterns. High-write DD tables use aggressive settings (5% scale factor instead of the default 20%) to prevent bloat accumulation.

**Scheduled Vacuum (Proactive)**: During low-traffic periods, the platform triggers explicit ANALYZE operations to ensure query planner statistics are current. This is particularly important after large batch operations like DD pipeline loads that dramatically change table row distributions.

**Monitoring Integration**: The VacuumMonitor runs as a periodic check within the platform's monitoring infrastructure. Tables exceeding the bloat threshold trigger alerts, and vacuum statistics are exported as time series data for trend analysis. A sustained increase in dead tuple accumulation rate signals either a workload change or an autovacuum configuration issue.

The platform's PostgreSQL configuration on Fly.io includes tuned autovacuum settings in the custom postgresql.conf, balancing maintenance overhead against query performance.

## Usage in Prismatic Platform

The DD pipeline's Scheduler triggers explicit ANALYZE after each load cycle to keep planner statistics current:

```elixir
defmodule PrismaticDd.PostLoadMaintenance do
  @moduledoc """
  Runs post-load maintenance operations to keep
  DD tables in optimal condition after data loads.
  """

  @dd_tables ["dd_entities", "dd_relationships", "dd_fetch_records", "dd_entity_attributes"]

  @spec run(Ecto.Repo.t()) :: :ok
  def run(repo) do
    Enum.each(@dd_tables, fn table ->
      Ecto.Adapters.SQL.query(repo, "ANALYZE #{table}", [])
    end)

    bloated = PrismaticDatabase.VacuumMonitor.tables_needing_vacuum(repo)

    Enum.each(bloated, fn table ->
      if table.dead_percentage > 30 do
        Ecto.Adapters.SQL.query(repo, "VACUUM ANALYZE #{table.table_name}", [])
      end
    end)

    :ok
  end
end
```

The monitoring dashboard displays vacuum health alongside other database metrics, providing operators with visibility into table maintenance state. This proactive approach ensures that the DD pipeline's upsert-heavy workload never causes performance degradation from unchecked table bloat.

## Cross-References

- [PostgreSQL](@/glossary/postgresql.md) - Database system requiring vacuum
- **WAL** - Write-Ahead Log related to MVCC
- **Dead Tuple** - Obsolete row versions cleaned by vacuum
- **Write Concurrency** - High-write patterns causing bloat
- [Monitoring](@/glossary/monitoring.md) - Vacuum health tracking

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
