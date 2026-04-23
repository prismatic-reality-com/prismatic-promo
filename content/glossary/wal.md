+++
title = "WAL"
weight = 50
[extra]
description = "Write-Ahead Log in PostgreSQL that records all changes before they are applied, ensuring crash recovery and replication"
category = "database"
related_terms = ["postgresql", "replication", "crash-recovery", "vacuum"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["WAL", "write-ahead log", "PostgreSQL", "crash recovery", "replication", "durability", "glossary", "Prismatic Platform"]
tags = ["glossary", "database"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "WAL - Prismatic Platform"
+++

## Definition & Overview

The Write-Ahead Log (WAL) is PostgreSQL's mechanism for ensuring data durability and crash recovery. The fundamental principle is simple: before any change is written to the actual data files (tables, indexes), a record of that change is first written to the WAL. This "write ahead" guarantee means that if the system crashes at any point, PostgreSQL can replay the WAL to reconstruct all committed transactions and discard all uncommitted ones, restoring the database to a consistent state.

WAL serves a dual purpose beyond crash recovery. It provides the foundation for streaming replication, where WAL records are transmitted to standby servers that replay them to maintain synchronized copies of the database. This replication mechanism enables both high availability (failover to a standby if the primary crashes) and read scaling (directing read queries to standbys to reduce primary load).

The Prismatic Platform's PostgreSQL deployment on Fly.io relies on WAL for both data durability and replication. The DD pipeline's batch upsert operations into `dd_entities` and `dd_relationships` generate WAL records that are replayed on standby instances. Understanding WAL behavior is critical for tuning write performance, managing disk space (WAL segment accumulation), and configuring replication lag monitoring.

## Technical Deep Dive

While WAL is managed by PostgreSQL internally, the platform monitors WAL metrics for operational health:

```elixir
defmodule PrismaticDatabase.WALMonitor do
  @moduledoc """
  Monitors PostgreSQL WAL metrics for operational health,
  replication lag, and disk space management.
  """

  @spec wal_statistics(Ecto.Repo.t()) :: {:ok, map()} | {:error, term()}
  def wal_statistics(repo) do
    query = """
    SELECT
      pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') AS total_wal_bytes,
      pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS total_wal_size,
      (SELECT count(*) FROM pg_ls_waldir()) AS wal_file_count,
      (SELECT sum(size) FROM pg_ls_waldir()) AS wal_dir_bytes,
      pg_size_pretty((SELECT sum(size) FROM pg_ls_waldir())) AS wal_dir_size,
      current_setting('wal_level') AS wal_level,
      current_setting('max_wal_size') AS max_wal_size,
      current_setting('min_wal_size') AS min_wal_size,
      current_setting('wal_segment_size') AS segment_size
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: [row], columns: columns}} ->
        result =
          columns
          |> Enum.zip(row)
          |> Map.new(fn {col, val} -> {String.to_atom(col), val} end)

        {:ok, result}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec replication_lag(Ecto.Repo.t()) :: {:ok, [map()]} | {:error, term()}
  def replication_lag(repo) do
    query = """
    SELECT
      client_addr,
      application_name,
      state,
      sent_lsn,
      write_lsn,
      flush_lsn,
      replay_lsn,
      pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag_bytes,
      pg_size_pretty(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS replay_lag_size
    FROM pg_stat_replication
    ORDER BY replay_lag_bytes DESC
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

  @spec wal_write_rate(Ecto.Repo.t(), pos_integer()) :: {:ok, map()} | {:error, term()}
  def wal_write_rate(repo, interval_seconds \\ 10) do
    query = """
    SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') AS lsn_position
    """

    with {:ok, %{rows: [[pos1]]}} <- Ecto.Adapters.SQL.query(repo, query, []),
         :ok <- Process.sleep(interval_seconds * 1_000) || :ok,
         {:ok, %{rows: [[pos2]]}} <- Ecto.Adapters.SQL.query(repo, query, []) do
      bytes_written = pos2 - pos1
      rate_per_second = bytes_written / interval_seconds

      {:ok, %{
        bytes_written: bytes_written,
        interval_seconds: interval_seconds,
        rate_bytes_per_second: Float.round(rate_per_second, 0),
        rate_mb_per_minute: Float.round(rate_per_second * 60 / 1_048_576, 2)
      }}
    end
  end
end
```

WAL-related configuration tuning for the platform's workload:

```elixir
defmodule PrismaticDatabase.WALConfig do
  @moduledoc """
  WAL configuration recommendations based on workload
  analysis for the Prismatic Platform.
  """

  @spec recommended_settings(map()) :: map()
  def recommended_settings(%{write_rate_mb_min: rate, replication: has_replication}) do
    base = %{
      wal_level: if(has_replication, do: "replica", else: "minimal"),
      max_wal_size: calculate_max_wal(rate),
      min_wal_size: "80MB",
      wal_buffers: "64MB",
      checkpoint_completion_target: 0.9,
      checkpoint_timeout: "10min"
    }

    if has_replication do
      Map.merge(base, %{
        max_wal_senders: 5,
        wal_keep_size: "1GB",
        hot_standby: "on"
      })
    else
      base
    end
  end

  defp calculate_max_wal(rate_mb_min) when rate_mb_min < 10, do: "1GB"
  defp calculate_max_wal(rate_mb_min) when rate_mb_min < 50, do: "2GB"
  defp calculate_max_wal(rate_mb_min) when rate_mb_min < 100, do: "4GB"
  defp calculate_max_wal(_rate_mb_min), do: "8GB"
end
```

## Architecture & Implementation

WAL management in the Prismatic Platform addresses three operational concerns:

**Crash Recovery**: On Fly.io, if a PostgreSQL instance crashes (hardware failure, OOM kill, or deployment restart), WAL replay automatically recovers all committed transactions. The platform's checkpoint configuration (90% completion target, 10-minute timeout) balances recovery time against write performance.

**Replication**: The production deployment uses streaming replication to maintain a hot standby. WAL records stream continuously from the primary to the standby, with the monitoring system tracking replication lag. The DD pipeline's periodic bulk loads can cause temporary lag spikes, which the monitor detects and reports.

**Disk Management**: WAL segments accumulate between checkpoints. The `max_wal_size` setting controls how much WAL can accumulate before forcing a checkpoint. For the platform's workload, this is tuned to allow enough WAL for the DD pipeline's largest batch operations without triggering premature checkpoints that would degrade write throughput.

**Monitoring Integration**: WAL metrics (file count, directory size, write rate, replication lag) are collected by the monitoring system and visualized on the database health dashboard. Alerts fire when WAL directory size exceeds 80% of `max_wal_size` or when replication lag exceeds 100MB, indicating potential issues with checkpoint processing or standby performance.

## Usage in Prismatic Platform

The database monitoring system includes WAL health checks:

```elixir
defmodule PrismaticDatabase.HealthCheck do
  @moduledoc """
  Database health checks including WAL status for
  comprehensive PostgreSQL monitoring.
  """

  @wal_size_warning_bytes 1_073_741_824
  @replication_lag_warning_bytes 104_857_600

  @spec check_wal_health(Ecto.Repo.t()) :: {:ok, map()} | {:warning, map()} | {:error, term()}
  def check_wal_health(repo) do
    with {:ok, stats} <- PrismaticDatabase.WALMonitor.wal_statistics(repo),
         {:ok, replication} <- PrismaticDatabase.WALMonitor.replication_lag(repo) do
      warnings = []

      warnings =
        if (stats.wal_dir_bytes || 0) > @wal_size_warning_bytes do
          ["WAL directory size exceeds 1GB" | warnings]
        else
          warnings
        end

      warnings =
        replication
        |> Enum.filter(fn r -> (r.replay_lag_bytes || 0) > @replication_lag_warning_bytes end)
        |> Enum.reduce(warnings, fn r, acc ->
          ["Replication lag for #{r.application_name}: #{r.replay_lag_size}" | acc]
        end)

      result = %{
        wal_stats: stats,
        replication: replication,
        warnings: warnings
      }

      if Enum.empty?(warnings) do
        {:ok, result}
      else
        {:warning, result}
      end
    end
  end
end
```

Understanding WAL behavior is particularly important for the DD pipeline, where large batch upsert operations generate significant WAL volume. The Scheduler's configurable intervals (1h to 168h) are partly calibrated to avoid overlapping WAL-intensive operations that could exhaust disk space or cause excessive checkpoint activity.

## Cross-References

- [PostgreSQL](/glossary/postgresql/) - Database system using WAL
- [Vacuum](/glossary/vacuum/) - Maintenance operation interacting with WAL
- [Replication](/glossary/replication/) - Data synchronization via WAL streaming
- **Crash Recovery** - WAL-based state restoration
- **Write Concurrency** - Write patterns generating WAL

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
