+++
title = "Ordered Set (ETS)"
weight = 50
[extra]
description = "ETS table type that maintains entries sorted by key, enabling efficient range queries and ordered traversal at the cost of slower writes."
category = "elixir"
related_terms = ["ets", "named-table", "set", "binary-tree"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ordered set", "ETS", "sorted table", "range query", "Elixir", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Ordered Set - Prismatic Platform"
+++

## Definition & Overview

An ordered set is one of four ETS (Erlang Term Storage) table types in the BEAM virtual machine. Unlike the regular `:set` type that stores entries in a hash table with O(1) lookups but unordered traversal, `:ordered_set` stores entries in a balanced binary tree (AVL tree) that maintains entries sorted by key. This provides O(log N) lookups and insertions but enables efficient range queries, ordered traversal, and operations like "find the next key after X" that are impossible with hash-based tables.

The ordered set type is the natural choice when your access pattern requires sorted data: time-series data where you need to query ranges, leaderboards where you need top-N entries, priority queues where you process entries by key order, or any scenario where `first`, `last`, `next`, and `prev` operations are needed. The trade-off is clear: hash-based sets offer O(1) point lookups at the cost of no ordering; ordered sets offer O(log N) point lookups with full ordering support.

In the Prismatic Platform, ordered sets are used for time-indexed data (execution history sorted by timestamp), priority-ordered processing queues (OSINT tool execution scheduling), and sorted metric storage (telemetry aggregation windows). The platform's registry pattern typically uses regular `:set` tables for slug-based lookups, but supplementary ordered set indexes enable sorted access when needed.

## Technical Deep Dive

ETS supports four table types: `:set` (hash table, unique keys), `:ordered_set` (AVL tree, unique keys), `:bag` (hash table, duplicate keys allowed), and `:duplicate_bag` (hash table, full duplicates allowed). The ordered set is the only type that supports ordered traversal, making `:ets.first/1`, `:ets.last/1`, `:ets.next/2`, and `:ets.prev/2` meaningful operations.

Range queries in ordered sets use `:ets.select/2` with match specifications that exploit the tree ordering. A query for all entries with keys between A and B traverses only the relevant portion of the tree, achieving O(log N + K) complexity where K is the number of matching entries. This is significantly more efficient than scanning an entire hash-based set.

```elixir
defmodule PrismaticMonitoring.TimeSeriesStore do
  @moduledoc """
  ETS-backed time series storage using ordered_set for efficient
  range queries on timestamp-keyed performance metrics.
  """

  use GenServer

  @table_name :metric_time_series

  @type data_point :: %{
    timestamp: integer(),
    metric: atom(),
    value: number(),
    tags: map()
  }

  # Client API

  @spec record(atom(), number(), map()) :: :ok
  def record(metric, value, tags \\ %{}) do
    timestamp = System.monotonic_time(:millisecond)
    key = {metric, timestamp}
    data = %{value: value, tags: tags, wall_time: DateTime.utc_now()}

    :ets.insert(@table_name, {key, data})
    :ok
  end

  @spec query_range(atom(), integer(), integer()) :: [data_point()]
  def query_range(metric, from_ts, to_ts) do
    # Leverage ordered_set for efficient range scan
    match_spec = [
      {
        {{:"$1", :"$2"}, :"$3"},
        [
          {:==, :"$1", metric},
          {:>=, :"$2", from_ts},
          {:"=<", :"$2", to_ts}
        ],
        [{{:"$2", :"$3"}}]
      }
    ]

    @table_name
    |> :ets.select(match_spec)
    |> Enum.map(fn {ts, data} ->
      Map.merge(data, %{timestamp: ts, metric: metric})
    end)
  end

  @spec latest(atom(), pos_integer()) :: [data_point()]
  def latest(metric, count) do
    # Walk backwards from the end of the metric's key range
    last_key = :ets.prev(@table_name, {metric, :infinity})
    collect_backwards(@table_name, last_key, metric, count, [])
  end

  defp collect_backwards(_table, :"$end_of_table", _metric, _remaining, acc), do: acc
  defp collect_backwards(_table, _key, _metric, 0, acc), do: acc
  defp collect_backwards(table, {metric, _ts} = key, metric, remaining, acc) do
    [{^key, data}] = :ets.lookup(table, key)
    prev_key = :ets.prev(table, key)
    collect_backwards(table, prev_key, metric, remaining - 1, [data | acc])
  end
  defp collect_backwards(_table, _key, _metric, _remaining, acc), do: acc

  @spec prune_older_than(integer()) :: non_neg_integer()
  def prune_older_than(threshold_ts) do
    match_spec = [
      {
        {{:_, :"$1"}, :_},
        [{:<, :"$1", threshold_ts}],
        [true]
      }
    ]

    :ets.select_delete(@table_name, match_spec)
  end

  # Server Implementation

  @impl GenServer
  def init(_opts) do
    :ets.new(@table_name, [
      :ordered_set,
      :named_table,
      :public,
      write_concurrency: true,
      read_concurrency: true
    ])

    # Schedule periodic pruning
    schedule_prune()

    {:ok, %{}}
  end

  @impl GenServer
  def handle_info(:prune, state) do
    # Keep only last hour of data
    threshold = System.monotonic_time(:millisecond) - 3_600_000
    _deleted = prune_older_than(threshold)
    schedule_prune()
    {:noreply, state}
  end

  defp schedule_prune do
    Process.send_after(self(), :prune, 300_000)
  end
end
```

The composite key pattern `{metric, timestamp}` is particularly powerful with ordered sets. Because ETS sorts tuples lexicographically, all entries for a given metric are clustered together in the tree, and within each metric they are sorted by timestamp. This enables efficient metric-specific range queries without secondary indexes.

## Architecture & Implementation

The platform uses ordered sets strategically for access patterns that require ordering. The telemetry aggregation system stores raw data points in ordered sets keyed by `{metric_name, timestamp}`, enabling efficient windowed aggregation (compute the average of the last 5 minutes by querying the timestamp range). The OSINT execution history uses ordered sets for chronological browsing, where users navigate forwards and backwards through results.

Write performance for ordered sets is O(log N) compared to O(1) for hash-based sets. For write-heavy workloads, this difference matters. The platform mitigates this by using hash-based sets for the primary lookup path (slug-based access) and maintaining ordered set indexes only when range queries are actually needed. This dual-index pattern provides the best of both worlds at the cost of additional memory.

Memory management for ordered sets follows the same patterns as other ETS tables: the table is owned by a GenServer, pruning is performed periodically to prevent unbounded growth, and the data can be reconstructed from PostgreSQL if the owning process crashes.

## Usage in Prismatic Platform

Ordered set for prioritized task scheduling:

```elixir
defmodule PrismaticOsintCore.Execution.PriorityQueue do
  @moduledoc """
  Priority-based OSINT tool execution queue using ETS ordered_set.
  Lower priority values execute first (priority 1 before priority 10).
  """

  use GenServer

  @queue_table :osint_execution_queue

  @type queued_task :: %{
    priority: pos_integer(),
    tool_slug: String.t(),
    params: map(),
    queued_at: DateTime.t()
  }

  @spec enqueue(String.t(), map(), pos_integer()) :: :ok
  def enqueue(tool_slug, params, priority \\ 5) do
    key = {priority, System.monotonic_time(:nanosecond)}

    task = %{
      tool_slug: tool_slug,
      params: params,
      queued_at: DateTime.utc_now()
    }

    :ets.insert(@queue_table, {key, task})
    GenServer.cast(__MODULE__, :process_next)
    :ok
  end

  @spec dequeue() :: {:ok, queued_task()} | :empty
  def dequeue do
    case :ets.first(@queue_table) do
      :"$end_of_table" ->
        :empty

      key ->
        [{^key, task}] = :ets.lookup(@queue_table, key)
        :ets.delete(@queue_table, key)
        {:ok, task}
    end
  end

  @spec queue_size() :: non_neg_integer()
  def queue_size do
    :ets.info(@queue_table, :size)
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@queue_table, [
      :ordered_set,
      :named_table,
      :public,
      write_concurrency: true
    ])

    {:ok, %{processing: false}}
  end

  @impl GenServer
  def handle_cast(:process_next, %{processing: false} = state) do
    case dequeue() do
      {:ok, task} ->
        Task.start(fn -> execute_task(task) end)
        {:noreply, %{state | processing: true}}

      :empty ->
        {:noreply, state}
    end
  end

  def handle_cast(:process_next, state), do: {:noreply, state}

  defp execute_task(task) do
    PrismaticOsintCore.ToolRegistry.get(task.tool_slug)
    |> case do
      {:ok, _tool} -> :ok
      {:error, _} -> :error
    end
  end
end
```

Ordered sets provide natural priority queue semantics when using `{priority, timestamp}` composite keys, where `first/1` always returns the highest-priority (lowest value) oldest task, exactly the dequeue behavior needed for fair priority scheduling.

## Cross-References

- [ETS](/glossary/ets/) - The underlying in-memory storage system
- [Named Table](/glossary/named-table/) - Named access pattern for ETS tables
- [GenServer](/glossary/genserver/) - Process owning and managing ordered set tables
- [Index Scan](/glossary/index-scan/) - Database equivalent of ordered access
- [Time Series](/glossary/time-series/) - Common data type stored in ordered sets

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
