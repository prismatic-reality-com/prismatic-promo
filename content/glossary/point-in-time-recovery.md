+++
title = "Point-in-Time Recovery"
weight = 50
[extra]
description = "PostgreSQL WAL-based database restore technique enabling recovery to any specific moment in time"
category = "database"
related_terms = ["schema-migration", "sequential-scan", "runtime", "secrets", "acid-transactions"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["PITR", "point-in-time recovery", "PostgreSQL", "WAL", "backup", "disaster recovery", "glossary", "Prismatic Platform"]
tags = ["glossary", "database", "disaster-recovery", "postgresql"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Point-in-Time Recovery - Prismatic Platform"
+++

## Definition & Overview

Point-in-Time Recovery (PITR) is a database disaster recovery technique that enables restoring a PostgreSQL database to its exact state at any specific moment in time. PITR works by combining a base backup (a full snapshot of the database files) with Write-Ahead Log (WAL) replay, where archived WAL segments are replayed up to the desired recovery target. This provides granular recovery capability far beyond simple backup/restore cycles, which can only recover to the exact moment the backup was taken.

The WAL is PostgreSQL's transaction journal -- every data modification is first written to the WAL before being applied to the actual data files. WAL archiving copies completed WAL segments to a separate storage location. During recovery, PostgreSQL replays these archived WAL segments sequentially, reconstructing the database state transaction by transaction. By specifying a recovery target (timestamp, transaction ID, or named restore point), the replay stops at the desired moment, producing a database in the exact state it was in at that point.

PITR is critical for the Prismatic Platform's data integrity requirements. The platform stores sensitive intelligence data (OSINT results, DD entity records, security assessments) that must be recoverable not just from hardware failures but from logical errors such as accidental deletions, corrupted data imports, or buggy migration scripts. PITR enables recovering from scenarios where the data itself is intact on disk but logically damaged, a situation that traditional backups cannot address unless the backup predates the corruption event.

## Technical Deep Dive

PITR requires three components: continuous WAL archiving, periodic base backups, and a recovery configuration. The Prismatic Platform configures these through PostgreSQL's `archive_command` for WAL shipping and `pg_basebackup` for base snapshots. The recovery process uses PostgreSQL's `recovery.conf` (or `postgresql.auto.conf` in newer versions) to specify the recovery target.

```elixir
defmodule PrismaticInfra.PITR.Manager do
  @moduledoc """
  Manages Point-in-Time Recovery configuration and execution
  for the platform's PostgreSQL databases.
  """

  @type recovery_target ::
    {:timestamp, DateTime.t()}
    | {:xid, pos_integer()}
    | {:name, String.t()}
    | :latest

  @spec create_restore_point(String.t()) :: {:ok, String.t()} | {:error, term()}
  def create_restore_point(name) do
    query = "SELECT pg_create_restore_point($1)"

    case Ecto.Adapters.SQL.query(PrismaticDd.Repo, query, [name]) do
      {:ok, %{rows: [[lsn]]}} ->
        {:ok, "Restore point '#{name}' created at LSN #{lsn}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec check_wal_archiving() :: {:ok, map()} | {:error, term()}
  def check_wal_archiving do
    queries = [
      {"archive_mode", "SHOW archive_mode"},
      {"archive_command", "SHOW archive_command"},
      {"wal_level", "SHOW wal_level"},
      {"archive_status", "SELECT archived_count, failed_count FROM pg_stat_archiver"}
    ]

    results =
      Enum.reduce_while(queries, {:ok, %{}}, fn {key, query}, {:ok, acc} ->
        case Ecto.Adapters.SQL.query(PrismaticDd.Repo, query, []) do
          {:ok, %{rows: [[value]]}} ->
            {:cont, {:ok, Map.put(acc, key, value)}}

          {:ok, %{rows: [[archived, failed]]}} ->
            {:cont, {:ok, Map.merge(acc, %{archived_count: archived, failed_count: failed})}}

          {:error, reason} ->
            {:halt, {:error, reason}}
        end
      end)

    results
  end

  @spec generate_recovery_config(recovery_target(), String.t()) :: String.t()
  def generate_recovery_config(target, wal_archive_path) do
    base = """
    restore_command = 'cp #{wal_archive_path}/%f %p'
    recovery_target_action = 'promote'
    """

    target_line =
      case target do
        {:timestamp, %DateTime{} = ts} ->
          "recovery_target_time = '#{DateTime.to_iso8601(ts)}'"

        {:xid, xid} ->
          "recovery_target_xid = '#{xid}'"

        {:name, name} ->
          "recovery_target_name = '#{name}'"

        :latest ->
          ""
      end

    base <> target_line <> "\n"
  end
end
```

The platform creates named restore points before potentially destructive operations such as schema migrations, bulk data imports, and DD pipeline batch loads. This enables precise recovery to the pre-operation state if the operation introduces data corruption.

```elixir
defmodule PrismaticDd.Pipeline.SafeLoader do
  @moduledoc """
  Wraps DD pipeline batch loads with PITR restore points,
  enabling rollback of corrupted data imports.
  """

  @spec safe_load(atom(), keyword()) :: {:ok, map()} | {:error, term()}
  def safe_load(source_group, opts \\ []) do
    restore_point = "dd_load_#{source_group}_#{System.system_time(:second)}"

    with {:ok, _} <- PrismaticInfra.PITR.Manager.create_restore_point(restore_point),
         {:ok, result} <- PrismaticDd.Loader.load_group(source_group, opts) do
      {:ok, Map.put(result, :restore_point, restore_point)}
    else
      {:error, reason} ->
        {:error, %{reason: reason, restore_point: restore_point}}
    end
  end
end
```

## Architecture & Implementation

The PITR architecture in the Prismatic Platform operates at the infrastructure level, below the application layer. WAL archiving is configured in PostgreSQL's `postgresql.conf` and runs continuously as a background process. Base backups are scheduled via `pg_basebackup` at configurable intervals (daily for production, weekly for staging).

The Fly.io production infrastructure uses volume snapshots as the base backup mechanism, combined with WAL streaming to a separate storage volume. This provides both physical redundancy (volume snapshots) and logical recovery capability (WAL-based PITR). The recovery time objective (RTO) depends on the WAL volume between the base backup and the recovery target, typically ranging from minutes for recent targets to hours for targets near the base backup boundary.

The platform's monitoring system tracks WAL archiving health, alerting on archive failures, excessive WAL accumulation (which could indicate archive command issues), and base backup age exceeding the configured threshold.

## Usage in Prismatic Platform

PITR is used operationally during schema migrations and data pipeline operations. Before every Ecto migration, the platform creates a named restore point, providing a guaranteed rollback target if the migration causes data issues that `Ecto.Migration.down/0` cannot reverse.

```elixir
defmodule PrismaticInfra.Migration.SafeRunner do
  @moduledoc """
  Executes Ecto migrations with PITR restore point protection.
  Creates a named restore point before each migration batch,
  enabling recovery from migrations that corrupt data.
  """

  @spec run_with_pitr(keyword()) :: {:ok, [integer()]} | {:error, term()}
  def run_with_pitr(opts \\ []) do
    repo = Keyword.get(opts, :repo, PrismaticDd.Repo)
    restore_point = "migration_#{DateTime.utc_now() |> DateTime.to_unix()}"

    with {:ok, _} <- PrismaticInfra.PITR.Manager.create_restore_point(restore_point) do
      try do
        result = Ecto.Migrator.run(repo, :up, opts)
        {:ok, result}
      rescue
        error ->
          {:error, %{
            error: error,
            restore_point: restore_point,
            recovery_hint: "Recover with: SELECT pg_wal_replay_resume(); using restore point '#{restore_point}'"
          }}
      end
    end
  end
end
```

## Cross-References

- **Schema Migration** - Database evolution operations that PITR protects against
- **Sequential Scan** - Database operation pattern affected during PITR replay
- **Secrets** - Encryption keys required for WAL archive security
- **Runtime** - Execution phase configuration for PITR parameters
- **Quality Floor** - Data integrity standards that PITR supports

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
