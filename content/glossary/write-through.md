+++
title = "Write-Through"
weight = 50
[extra]
description = "Cache write pattern that synchronously updates both the cache and the backing store on every write operation"
category = "infrastructure"
related_terms = ["cache", "ets", "write-back", "ttl"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["write-through", "cache pattern", "synchronous write", "consistency", "data integrity", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Write-Through - Prismatic Platform"
+++

## Definition & Overview

Write-through is a cache write strategy where every write operation updates both the cache and the underlying persistent storage synchronously before returning success to the caller. This guarantees that the cache and the backing store are always in sync, eliminating the risk of data loss from cache eviction or system crashes. The trade-off is higher write latency compared to write-back (lazy) strategies, since each write must complete two operations before the caller can proceed.

In contrast to write-back (also called write-behind), which defers persistence until later (batch flush, eviction, or periodic sync), write-through provides strong consistency guarantees. The caller knows that once a write returns, the data is safely persisted. This makes write-through the preferred pattern for data that cannot afford any risk of loss, such as financial records, audit logs, and critical configuration changes.

The Prismatic Platform uses write-through for critical data paths and write-back for performance-sensitive paths. OSINT tool execution records are written through to PostgreSQL because audit trail completeness is non-negotiable. Academy progress updates use a hybrid approach where ETS is updated immediately (for fast reads) and PostgreSQL writes are batched (write-back) for efficiency. This selective application of caching strategies optimizes the trade-off between consistency and performance per use case.

## Technical Deep Dive

The platform implements write-through as a generic cache middleware:

```elixir
defmodule PrismaticCache.WriteThrough do
  @moduledoc """
  Write-through cache that synchronously updates both
  ETS and PostgreSQL on every write operation.
  """

  @type cache_key :: term()
  @type cache_value :: term()

  @spec write(atom(), cache_key(), cache_value(), Ecto.Repo.t(), module(), map()) ::
    {:ok, term()} | {:error, term()}
  def write(ets_table, key, value, repo, schema_module, attrs) do
    changeset = schema_module.changeset(struct(schema_module), attrs)

    case repo.insert_or_update(changeset) do
      {:ok, record} ->
        :ets.insert(ets_table, {key, value, System.monotonic_time(:millisecond)})
        {:ok, record}

      {:error, changeset} ->
        {:error, {:persistence_failed, changeset}}
    end
  end

  @spec read(atom(), cache_key(), Ecto.Repo.t(), module()) ::
    {:ok, cache_value()} | {:error, :not_found}
  def read(ets_table, key, repo, schema_module) do
    case :ets.lookup(ets_table, key) do
      [{^key, value, _ts}] ->
        {:ok, value}

      [] ->
        case repo.get_by(schema_module, id: key) do
          nil ->
            {:error, :not_found}

          record ->
            value = schema_module.to_cache_value(record)
            :ets.insert(ets_table, {key, value, System.monotonic_time(:millisecond)})
            {:ok, value}
        end
    end
  end

  @spec delete(atom(), cache_key(), Ecto.Repo.t(), module()) :: :ok | {:error, term()}
  def delete(ets_table, key, repo, schema_module) do
    case repo.get_by(schema_module, id: key) do
      nil ->
        :ets.delete(ets_table, key)
        :ok

      record ->
        case repo.delete(record) do
          {:ok, _} ->
            :ets.delete(ets_table, key)
            :ok

          {:error, reason} ->
            {:error, reason}
        end
    end
  end
end
```

Comparison of write strategies:

```elixir
defmodule PrismaticCache.WriteStrategy do
  @moduledoc """
  Implements multiple cache write strategies with a
  unified interface for strategy selection.
  """

  @type strategy :: :write_through | :write_back | :write_around

  @spec write(strategy(), atom(), term(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  def write(:write_through, table, key, value, opts) do
    repo = Keyword.fetch!(opts, :repo)
    persist_fn = Keyword.fetch!(opts, :persist_fn)

    case persist_fn.(value) do
      {:ok, persisted} ->
        :ets.insert(table, {key, value})
        {:ok, persisted}

      {:error, reason} ->
        {:error, {:persist_failed, reason}}
    end
  end

  def write(:write_back, table, key, value, opts) do
    :ets.insert(table, {key, value, :dirty})

    buffer_name = Keyword.get(opts, :buffer, :write_back_buffer)
    GenServer.cast(buffer_name, {:enqueue, key, value})

    {:ok, value}
  end

  def write(:write_around, _table, _key, value, opts) do
    persist_fn = Keyword.fetch!(opts, :persist_fn)
    persist_fn.(value)
  end
end
```

## Architecture & Implementation

The platform applies different write strategies based on data criticality and access patterns:

**Write-Through (Critical Data)**:
- OSINT tool execution audit records: Every execution is persisted to PostgreSQL before the result is returned. The ETS cache for recent executions is updated simultaneously.
- DD entity upserts: When the Loader normalizes and persists entities, both `dd_entities` and the ETS entity cache are updated atomically.
- Security rating updates: Perimeter scan results update both the rating cache and PostgreSQL in the same operation.

**Write-Back (Performance-Sensitive Data)**:
- Academy progress tracking: ETS is updated immediately on topic completion, but PostgreSQL persistence is batched every 30 seconds through the ProgressTracker's flush cycle.
- Telemetry event collection: Events accumulate in ETS buffers and are flushed to TimescaleDB periodically.
- Session context auto-save: Updated every 30 minutes rather than on every interaction.

**Write-Around (Rarely-Read Data)**:
- Audit logs: Written directly to PostgreSQL without caching, since they are rarely read during normal operations.
- Error logs: Persisted directly without ETS caching.

The hybrid approach recognizes that no single strategy is optimal for all data. The platform's architecture makes the strategy explicit at the storage layer, preventing accidental misapplication of caching patterns.

## Usage in Prismatic Platform

The OSINT execution tracking demonstrates write-through for audit-critical data:

```elixir
defmodule PrismaticOsintCore.ExecutionStore do
  @moduledoc """
  Write-through storage for OSINT tool execution records,
  ensuring both fast reads and persistent audit trail.
  """

  @ets_table :osint_executions
  @max_cached_per_tool 100

  @spec record_execution(map()) :: {:ok, map()}
  def record_execution(execution) do
    case PrismaticOsintCore.Repo.insert(execution_changeset(execution)) do
      {:ok, record} ->
        cache_key = {execution.tool_slug, record.id}
        :ets.insert(@ets_table, {cache_key, record})
        trim_cache(execution.tool_slug)
        {:ok, record}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @spec recent_executions(String.t(), pos_integer()) :: [map()]
  def recent_executions(tool_slug, limit \\ 10) do
    pattern = {{tool_slug, :_}, :_}
    matches = :ets.match_object(@ets_table, pattern)

    matches
    |> Enum.map(fn {_key, record} -> record end)
    |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
    |> Enum.take(limit)
  end

  defp trim_cache(tool_slug) do
    pattern = {{tool_slug, :_}, :_}
    matches = :ets.match_object(@ets_table, pattern)

    if length(matches) > @max_cached_per_tool do
      matches
      |> Enum.sort_by(fn {_, r} -> r.inserted_at end)
      |> Enum.take(length(matches) - @max_cached_per_tool)
      |> Enum.each(fn {key, _} -> :ets.delete(@ets_table, key) end)
    end
  end

  defp execution_changeset(attrs) do
    # Returns Ecto changeset for the execution schema
    PrismaticOsintCore.Execution.changeset(%PrismaticOsintCore.Execution{}, attrs)
  end
end
```

This write-through pattern ensures that every OSINT tool execution is safely persisted to PostgreSQL for audit compliance while also being available in ETS for fast dashboard rendering of recent execution history.

## Cross-References

- [Cache](/glossary/cache/) - Storage layer implementing strategies
- [ETS](/glossary/ets/) - In-memory cache storage
- [TTL](/glossary/ttl/) - Cache expiry mechanism
- [Write Concurrency](/glossary/write-concurrency/) - ETS parallel write support
- [Vacuum](/glossary/vacuum/) - PostgreSQL cleanup from write operations

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
