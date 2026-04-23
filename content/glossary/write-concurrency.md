+++
title = "Write Concurrency"
weight = 50
[extra]
description = "ETS table option enabling parallel write operations from multiple processes without global table-level locking"
category = "infrastructure"
related_terms = ["ets", "concurrency", "read-concurrency", "genserver"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["write concurrency", "ETS", "parallel writes", "lock-free", "BEAM concurrency", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Write Concurrency - Prismatic Platform"
+++

## Definition & Overview

Write concurrency is an ETS (Erlang Term Storage) table configuration option that enables multiple processes to perform write operations on the same table simultaneously without acquiring a global table-level lock. When `write_concurrency: true` is set during table creation, ETS uses fine-grained per-bucket locking instead of a single table-wide lock, dramatically reducing contention when many processes need to write to different keys concurrently.

Without write concurrency, all write operations to an ETS table serialize through a single lock. This means that even when processes are writing to completely different keys, they must wait for each other. With write concurrency enabled, writes to different hash buckets can proceed in parallel, with locking only occurring when two processes happen to write to keys that hash to the same bucket. For tables with good key distribution, this effectively eliminates write contention.

In the Prismatic Platform, write concurrency is critical for high-throughput ETS tables like the OSINT tool execution cache, telemetry event buffers, and throttle state stores. These tables receive concurrent writes from multiple LiveView processes, OSINT tool execution tasks, and telemetry handlers simultaneously. Without write concurrency, these concurrent writers would create a bottleneck that degrades platform responsiveness.

## Technical Deep Dive

ETS table creation with concurrency options:

```elixir
defmodule PrismaticETS.TableFactory do
  @moduledoc """
  Creates ETS tables with appropriate concurrency settings
  based on the table's expected access pattern.
  """

  @type access_pattern :: :read_heavy | :write_heavy | :balanced | :single_writer

  @spec create(atom(), access_pattern(), keyword()) :: :ets.tid()
  def create(name, access_pattern, opts \\ []) do
    type = Keyword.get(opts, :type, :set)
    access = Keyword.get(opts, :access, :public)

    concurrency_opts = concurrency_for_pattern(access_pattern)

    :ets.new(name, [
      type,
      :named_table,
      access
      | concurrency_opts ++ Keyword.get(opts, :extra, [])
    ])
  end

  defp concurrency_for_pattern(:read_heavy) do
    [read_concurrency: true, write_concurrency: false]
  end

  defp concurrency_for_pattern(:write_heavy) do
    [read_concurrency: false, write_concurrency: true]
  end

  defp concurrency_for_pattern(:balanced) do
    [read_concurrency: true, write_concurrency: true]
  end

  defp concurrency_for_pattern(:single_writer) do
    [read_concurrency: true, write_concurrency: false]
  end
end
```

Benchmarking write concurrency impact:

```elixir
defmodule PrismaticBenchmark.WriteConcurrency do
  @moduledoc """
  Benchmarks ETS write performance with and without
  write_concurrency to quantify the throughput benefit.
  """

  @spec run(pos_integer(), pos_integer()) :: :ok
  def run(num_writers \\ 100, writes_per_writer \\ 10_000) do
    table_without = :ets.new(:bench_no_wc, [:set, :public, :named_table])
    table_with = :ets.new(:bench_wc, [
      :set, :public, :named_table,
      write_concurrency: true
    ])

    without_time = measure_concurrent_writes(table_without, num_writers, writes_per_writer)
    with_time = measure_concurrent_writes(table_with, num_writers, writes_per_writer)

    speedup = without_time / max(with_time, 1)

    IO.puts("Without write_concurrency: #{without_time}ms")
    IO.puts("With write_concurrency:    #{with_time}ms")
    IO.puts("Speedup: #{Float.round(speedup, 2)}x")

    :ets.delete(table_without)
    :ets.delete(table_with)
    :ok
  end

  defp measure_concurrent_writes(table, num_writers, writes_per) do
    start = System.monotonic_time(:millisecond)

    tasks =
      1..num_writers
      |> Enum.map(fn writer_id ->
        Task.async(fn ->
          offset = writer_id * writes_per

          for i <- 1..writes_per do
            key = offset + i
            :ets.insert(table, {key, %{writer: writer_id, value: i}})
          end
        end)
      end)

    Task.await_many(tasks, 30_000)
    System.monotonic_time(:millisecond) - start
  end
end
```

Understanding the trade-offs:

```elixir
defmodule PrismaticETS.ConcurrencyGuide do
  @moduledoc """
  Documents the trade-offs between read_concurrency and
  write_concurrency for different ETS usage patterns.
  """

  @doc """
  Selection guide for ETS concurrency options:

  | Pattern | read_concurrency | write_concurrency | Use Case |
  |---------|-----------------|-------------------|----------|
  | Registry (read-heavy) | true | false | ToolRegistry, TopicRegistry |
  | Cache (balanced) | true | true | TTLStore, result cache |
  | Buffer (write-heavy) | false | true | Telemetry buffer, event log |
  | Config (single-writer) | true | false | Application config |

  Trade-offs:
  - write_concurrency adds ~10-20% overhead to individual writes
  - write_concurrency significantly reduces contention with >4 concurrent writers
  - Combining read_concurrency + write_concurrency has additive overhead
  - :ordered_set tables do NOT benefit from write_concurrency (tree structure)
  """
  def guide, do: :ok
end
```

## Architecture & Implementation

The platform's ETS tables are configured with concurrency options matched to their access patterns:

**Read-Heavy Tables** (`read_concurrency: true, write_concurrency: false`): The OSINT ToolRegistry, Academy TopicRegistry, and DD SourceRegistry are populated at boot time and read frequently by LiveView processes. Writes happen only during compilation/registration. Read concurrency optimizes the dominant access pattern.

**Balanced Tables** (`read_concurrency: true, write_concurrency: true`): TTL-based caches and session state tables receive both frequent reads (LiveView rendering) and frequent writes (cache updates, session modifications). Both concurrency options are enabled to optimize both access patterns, accepting the slight per-operation overhead.

**Write-Heavy Tables** (`write_concurrency: true`): Telemetry event buffers and throttle state counters receive high-volume concurrent writes from many processes with less frequent reads. Write concurrency is prioritized to prevent writer contention.

The `decentralized_counters` option (OTP 23+) further optimizes `:ets.update_counter/3` operations for write-heavy counters:

```elixir
# Optimized counter table for high-frequency updates
:ets.new(:telemetry_counters, [
  :set, :public, :named_table,
  write_concurrency: true,
  decentralized_counters: true
])
```

## Usage in Prismatic Platform

The throttling system demonstrates the importance of write concurrency for concurrent rate tracking:

```elixir
defmodule PrismaticThrottle.ConcurrentBuckets do
  @moduledoc """
  Token bucket implementation using ETS with write_concurrency
  for lock-free concurrent rate limiting.
  """

  def init do
    :ets.new(:throttle_buckets, [
      :set, :public, :named_table,
      write_concurrency: true,
      read_concurrency: true
    ])
  end

  @spec try_acquire(String.t()) :: :ok | :rate_limited
  def try_acquire(key) do
    case :ets.lookup(:throttle_buckets, key) do
      [{^key, tokens, _ts}] when tokens > 0 ->
        :ets.update_counter(:throttle_buckets, key, {2, -1, 0, 0})
        :ok

      [{^key, 0, _ts}] ->
        :rate_limited

      [] ->
        :ets.insert(:throttle_buckets, {key, 99, System.monotonic_time(:millisecond)})
        :ok
    end
  end
end
```

When 127 OSINT tools are being executed concurrently across multiple LiveView sessions, each tool execution checks and decrements its throttle counter. Write concurrency ensures these concurrent counter updates do not serialize, maintaining sub-millisecond throttle check latency even under heavy load.

## Cross-References

- [ETS](@/glossary/ets.md) - In-memory storage system
- [Concurrency](@/glossary/concurrency.md) - Parallel execution patterns
- [GenServer](@/glossary/genserver.md) - Process managing ETS tables
- [Throttling](@/glossary/throttling.md) - Rate limiting using concurrent ETS
- [Write-Through](@/glossary/write-through.md) - Cache write pattern

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
