+++
title = "LRU"
weight = 50

[extra]
description = "Least Recently Used (LRU) is a cache eviction policy that discards the item that has not been accessed for the longest time, exploiting temporal locality to maintain high hit rates for real-world workloads in bounded-memory cache implementations."
category = "architecture"
domain = "performance-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["memory", "memory-leak", "process", "named-table", "page-load", "ets", "cachex", "genserver", "telemetry", "ttl", "eviction", "hot-path", "working-set"]
tags = ["glossary", "lru", "cache", "eviction-policy", "performance", "memory-management", "optimization", "ets", "beam", "concurrency"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "LRU caching in the Prismatic Platform provides sub-millisecond access to frequently used OSINT tool configurations, DD entity lookups, and API endpoint resolutions while bounding memory consumption through ETS-backed eviction with configurable TTL and size limits."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["LRU", "least recently used", "cache eviction", "caching strategy", "memory management", "temporal locality", "cache policy", "performance optimization", "ETS", "BEAM", "Cachex", "ConCache"]
image = "/images/sections/glossary.png"
image_alt = "LRU - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "performance-testing"]
+++

## Definition

Least Recently Used (LRU) is a cache eviction policy that, when the cache reaches its capacity limit, removes the item that has gone the longest without being accessed. LRU exploits temporal locality -- the empirical observation that data accessed recently is statistically more likely to be accessed again in the near future. Among cache eviction policies (FIFO, LFU, Random, CLOCK), LRU consistently provides near-optimal hit rates for real-world workloads, making it the default choice when no workload-specific information is available.

The fundamental operations of an LRU cache are: `get(key)` which returns the cached value and marks it as recently used, `put(key, value)` which inserts or updates an entry and evicts the least-recently-used entry if the cache is full, and optionally `delete(key)` for explicit invalidation. Both `get` and `put` must execute in O(1) time for the cache to be practical in hot paths. The canonical implementation achieves this through a combination of a hash map for key lookup and a doubly-linked list for recency ordering.

LRU caching is particularly effective in systems with skewed access patterns -- when a small fraction of items receive a disproportionate share of accesses (the "working set"). In the BEAM ecosystem, where processes are cheap and ETS tables provide concurrent lock-free reads, LRU caches can be deployed at multiple granularity levels: per-process, per-node, and distributed across a cluster.

## Core Concepts

### Cache Eviction Policy Comparison

| Policy | Mechanism | Hit Rate | Implementation Complexity | Best For |
|--------|-----------|----------|--------------------------|----------|
| **LRU** | Evict least recently accessed | High for temporal locality | O(1) with hash map + linked list | General-purpose, most workloads |
| **LFU** | Evict least frequently accessed | High for frequency-skewed | O(log n) with min-heap | Stable popular items (CDN, DNS) |
| **FIFO** | Evict oldest inserted | Moderate | O(1) with queue | Simple, insertion-order matters |
| **Random** | Evict random entry | Surprisingly competitive | O(1) trivially | When access patterns are unpredictable |
| **CLOCK** | Approximate LRU via reference bits | Near-LRU, lower overhead | O(1) amortized | OS page replacement, high-throughput |
| **LRU-K** | Evict by Kth-to-last access time | Superior for scan-heavy | O(log n) with sorted structure | Database buffer pools |
| **ARC** | Adaptive between LRU and LFU | Self-tuning | O(1) with 4 lists | Unknown or changing workloads |
| **SLRU** | Segmented hot/cold tiers | High for bimodal access | O(1) per segment | CPU L2/L3 caches, CDN tiers |

### ETS Table Options for Caching

| Option | Effect | When to Use |
|--------|--------|-------------|
| `:read_concurrency` | Optimizes for concurrent reads across schedulers | Multi-process read-heavy caches (most caching scenarios) |
| `:write_concurrency` | Reduces write contention with fine-grained locking | High write throughput (counters, rate limiters) |
| `:decentralized_counters` | Distributed size counters for `info(:size)` | When `size` is queried frequently under write load |
| `:compressed` | Compresses stored terms (CPU for memory tradeoff) | Large values, memory-constrained environments |
| `:set` | Unique keys, O(1) lookup | Standard key-value caching |
| `:ordered_set` | Sorted by key, O(log n) operations | Range queries, time-ordered data |

### Cache Metrics and Health Indicators

| Metric | Formula | Healthy Range | Action When Unhealthy |
|--------|---------|---------------|----------------------|
| **Hit Rate** | `hits / (hits + misses)` | > 85% | Increase cache size or review access patterns |
| **Eviction Rate** | `evictions / second` | Low relative to inserts | Cache too small for working set |
| **Memory Usage** | `ets:info(table, :memory) * word_size` | < 80% of allocation | Reduce max_size or enable compression |
| **Avg Latency** | `sum(response_times) / count` | < 1ms for ETS reads | Check for contention or GC pressure |
| **Stale Ratio** | `ttl_expired / total_entries` | < 10% | Reduce TTL or increase cleanup frequency |

## Technical Deep Dive

### O(1) LRU Implementation Strategy

The canonical O(1) LRU implementation combines a hash map (for key lookup) with a doubly-linked list (for recency ordering). On access, the entry is moved to the head of the list. On eviction, the tail entry is removed. This combination provides O(1) for all operations.

In the BEAM ecosystem, ETS tables serve as the hash map, while process state or additional ETS tables maintain recency ordering. The challenge is that BEAM processes do not have mutable doubly-linked lists -- instead, we use one of these strategies:

1. **Timestamp-based ordering**: Store `{key, value, monotonic_timestamp}` tuples. On access, update the timestamp. On eviction, scan for the minimum timestamp. This is O(n) for eviction but O(1) for reads, which is acceptable when evictions are infrequent relative to reads.

2. **Ordered-set index**: Maintain a secondary `:ordered_set` ETS table keyed by `{timestamp, key}`. This allows O(log n) eviction by deleting the first entry, but requires two ETS operations per access (delete old timestamp entry, insert new one).

3. **Generation-based**: Use two ETS tables (active and passive). Reads check active first, then passive (promoting to active on hit). When active fills up, swap: passive becomes active, old passive is dropped. This amortizes eviction cost and is used by Cachex.

### BEAM-Specific Considerations

ETS tables in BEAM have unique characteristics that affect LRU cache design:

- **Concurrent reads are lock-free** with `:read_concurrency` -- multiple schedulers can read simultaneously without contention
- **Writes acquire per-bucket locks** -- fine-grained but still serialized within a bucket
- **No garbage collection** -- ETS memory is freed immediately on delete, not subject to per-process GC
- **Cross-process access** -- any process can read/write a public ETS table, enabling shared caches without message passing
- **Term copying** -- data is copied on read from ETS (not zero-copy), so large values incur copy cost
- **`:ordered_set` uses AVL trees** -- O(log n) operations, not O(1) like `:set`

These characteristics make ETS ideal for read-heavy LRU caches where the working set fits in memory and most operations are reads.

### Distributed Cache Invalidation

In a multi-node BEAM cluster, LRU caches on each node are independent by default. Cache invalidation across nodes requires explicit coordination:

| Strategy | Consistency | Latency | Complexity |
|----------|-------------|---------|------------|
| **No invalidation** | Eventual (TTL-based) | Zero overhead | Simplest -- entries expire naturally |
| **PubSub broadcast** | Near-immediate | ~1-5ms per node | Moderate -- subscribe to invalidation topic |
| **Distributed Erlang** | Strong | ~1-10ms per node | Higher -- requires cluster membership |
| **External store** | Centralized | ~5-50ms | Highest -- Redis/Memcached as cache layer |

## Usage in Prismatic Platform

The Prismatic Platform uses LRU caching at multiple layers to optimize performance while bounding memory consumption.

The **OSINT ToolRegistry** uses ETS with LRU-style access patterns for tool configuration lookups. While the full registry of 157 adapters is memory-resident, query result caching for complex tool searches (category filtering, authentication status resolution, capability matching) uses LRU eviction to bound the result cache to a configurable maximum size.

The **DD SourceRegistry** caches resolved source configurations with LRU semantics. When the Decision Engine evaluates an entity, it may access dozens of source configurations; caching the resolved configurations avoids repeated resolution of source hierarchies and credential lookups.

The **Prismatic API gateway** caches endpoint resolution results (module + function + parameter mappings) in an LRU cache, avoiding repeated introspection of Prismatic facade modules on every request. This reduces the per-request overhead of the auto-introspecting API from ~5ms to ~0.1ms for cached endpoints.

The **glossary hover card system** on the promo site caches parsed TOML frontmatter in a browser-side LRU (JavaScript Map with size limit) to avoid re-parsing on repeated hovers. This keeps the hover card response time under 50ms even with hundreds of glossary terms.

**LiveView assigns** use ETS-backed LRU caches for expensive computations that should survive across socket reconnections. When a user's WebSocket reconnects (common on mobile), the cached assigns allow instant restoration of the previous view state without re-computing expensive queries.

## Code Examples

```elixir
defmodule PrismaticStorage.LRUCache do
  @moduledoc """
  ETS-backed LRU cache with configurable maximum size, TTL-based
  expiration, and telemetry instrumentation.

  Provides O(1) reads through direct ETS lookups with `:read_concurrency`
  and bounded memory through timestamp-based LRU eviction. Writes are
  serialized through a GenServer to ensure atomic size-check-and-evict
  operations.

  ## Architecture

  Uses a single `:set` ETS table storing `{key, value, monotonic_timestamp}`
  tuples. Reads update the timestamp atomically via `update_element/3`.
  When the table exceeds `max_size`, the entry with the oldest timestamp
  is evicted via a full table scan (acceptable because evictions are
  infrequent relative to reads in well-sized caches).

  ## Configuration

    - `:max_size` - Maximum number of entries (default: 1000)
    - `:ttl_ms` - Time-to-live in milliseconds (default: `:infinity`)
    - `:cleanup_interval_ms` - TTL cleanup interval (default: 60_000)

  ## Examples

      iex> {:ok, _pid} = PrismaticStorage.LRUCache.start_link(:my_cache, max_size: 100)
      iex> :ok = PrismaticStorage.LRUCache.put(:my_cache, "key1", "value1")
      iex> {:ok, "value1"} = PrismaticStorage.LRUCache.get(:my_cache, "key1")
      iex> :miss = PrismaticStorage.LRUCache.get(:my_cache, "nonexistent")
  """

  use GenServer

  require Logger

  @type opts :: [max_size: pos_integer(), ttl_ms: pos_integer() | :infinity, cleanup_interval_ms: pos_integer()]

  @doc """
  Starts a named LRU cache process with the given options.

  ## Parameters

    - `name` - Atom name for the cache (used for process registration and ETS table naming)
    - `opts` - Configuration options (see module documentation)

  ## Examples

      iex> {:ok, pid} = PrismaticStorage.LRUCache.start_link(:test_cache, max_size: 500)
      iex> is_pid(pid)
      true
  """
  @spec start_link(atom(), opts()) :: GenServer.on_start()
  def start_link(name, opts \\ []) do
    GenServer.start_link(__MODULE__, {name, opts}, name: name)
  end

  @doc """
  Retrieves a value from the cache by key.

  On hit, updates the entry's timestamp to mark it as recently used.
  Returns `{:ok, value}` on hit or `:miss` on miss.

  This operation reads directly from ETS without going through the
  GenServer, providing sub-microsecond latency.

  ## Examples

      iex> PrismaticStorage.LRUCache.get(:my_cache, "existing_key")
      {:ok, "cached_value"}

      iex> PrismaticStorage.LRUCache.get(:my_cache, "missing_key")
      :miss
  """
  @spec get(atom(), term()) :: {:ok, term()} | :miss
  def get(name, key) do
    table = table_name(name)

    case :ets.lookup(table, key) do
      [{^key, value, inserted_at}] ->
        now = System.monotonic_time(:millisecond)

        :ets.update_element(table, key, {3, now})

        :telemetry.execute(
          [:prismatic, :cache, :hit],
          %{latency_us: System.monotonic_time(:microsecond) - System.convert_time_unit(inserted_at, :millisecond, :microsecond)},
          %{cache: name, key: key}
        )

        {:ok, value}

      [] ->
        :telemetry.execute(
          [:prismatic, :cache, :miss],
          %{count: 1},
          %{cache: name, key: key}
        )

        :miss
    end
  end

  @doc """
  Inserts or updates a cache entry.

  If the cache is at capacity, evicts the least recently used entry
  before inserting. This operation goes through the GenServer to
  ensure atomic size-check-and-evict.

  ## Examples

      iex> :ok = PrismaticStorage.LRUCache.put(:my_cache, "key", "value")
  """
  @spec put(atom(), term(), term()) :: :ok
  def put(name, key, value) do
    GenServer.call(name, {:put, key, value})
  end

  @doc """
  Explicitly removes a cache entry.

  ## Examples

      iex> :ok = PrismaticStorage.LRUCache.delete(:my_cache, "key")
  """
  @spec delete(atom(), term()) :: :ok
  def delete(name, key) do
    :ets.delete(table_name(name), key)
    :ok
  end

  @doc """
  Returns cache statistics including size, hit rate, and memory usage.

  ## Examples

      iex> stats = PrismaticStorage.LRUCache.stats(:my_cache)
      iex> is_map(stats)
      true
  """
  @spec stats(atom()) :: map()
  def stats(name) do
    table = table_name(name)

    %{
      size: :ets.info(table, :size),
      memory_bytes: :ets.info(table, :memory) * :erlang.system_info(:wordsize),
      name: name
    }
  end

  @impl GenServer
  def init({name, opts}) do
    table = :ets.new(table_name(name), [:set, :public, :named_table, read_concurrency: true])
    max_size = Keyword.get(opts, :max_size, 1000)
    ttl_ms = Keyword.get(opts, :ttl_ms, :infinity)
    cleanup_interval = Keyword.get(opts, :cleanup_interval_ms, 60_000)

    if ttl_ms != :infinity do
      Process.send_after(self(), :cleanup_expired, cleanup_interval)
    end

    state = %{
      table: table,
      max_size: max_size,
      ttl_ms: ttl_ms,
      cleanup_interval: cleanup_interval,
      name: name
    }

    Logger.info("LRU cache started: name=#{name}, max_size=#{max_size}, ttl=#{inspect(ttl_ms)}")

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:put, key, value}, _from, state) do
    now = System.monotonic_time(:millisecond)

    current_size = :ets.info(state.table, :size)

    if current_size >= state.max_size and not :ets.member(state.table, key) do
      evict_lru(state.table)

      :telemetry.execute(
        [:prismatic, :cache, :eviction],
        %{count: 1},
        %{cache: state.name}
      )
    end

    :ets.insert(state.table, {key, value, now})
    {:reply, :ok, state}
  end

  @impl GenServer
  def handle_info(:cleanup_expired, state) do
    if state.ttl_ms != :infinity do
      cutoff = System.monotonic_time(:millisecond) - state.ttl_ms
      expired = cleanup_expired_entries(state.table, cutoff)

      if expired > 0 do
        Logger.debug("LRU cache #{state.name}: cleaned up #{expired} expired entries")
      end

      Process.send_after(self(), :cleanup_expired, state.cleanup_interval)
    end

    {:noreply, state}
  end

  @spec evict_lru(:ets.tid()) :: :ok
  defp evict_lru(table) do
    {lru_key, _} =
      :ets.foldl(
        fn {key, _val, ts}, {_k, min_ts} = acc ->
          if ts < min_ts, do: {key, ts}, else: acc
        end,
        {nil, System.monotonic_time(:millisecond)},
        table
      )

    if lru_key, do: :ets.delete(table, lru_key)
    :ok
  end

  @spec cleanup_expired_entries(:ets.tid(), integer()) :: non_neg_integer()
  defp cleanup_expired_entries(table, cutoff) do
    :ets.foldl(
      fn {key, _val, ts}, count ->
        if ts < cutoff do
          :ets.delete(table, key)
          count + 1
        else
          count
        end
      end,
      0,
      table
    )
  end

  @spec table_name(atom()) :: atom()
  defp table_name(name), do: :"#{name}_lru_data"
end
```

```elixir
defmodule PrismaticStorage.LRUCache.Warmer do
  @moduledoc """
  Cache warming utility for pre-populating LRU caches with frequently
  accessed data on application startup or after cache invalidation.

  Prevents cold-start latency spikes by loading the expected working
  set before the cache receives live traffic.

  ## Examples

      iex> PrismaticStorage.LRUCache.Warmer.warm(:api_endpoint_cache, &load_endpoints/0)
      {:ok, 42}
  """

  require Logger

  @doc """
  Warms a cache by invoking the loader function and inserting results.

  The loader function must return a list of `{key, value}` tuples.
  Entries are inserted in order, so the last entries will be the
  "most recently used" after warming.

  ## Parameters

    - `cache_name` - The name of the LRU cache to warm
    - `loader` - A zero-arity function returning `[{key, value}]`
    - `opts` - Options: `:batch_size` (default: 100)

  ## Examples

      iex> loader = fn -> [{"k1", "v1"}, {"k2", "v2"}] end
      iex> {:ok, 2} = PrismaticStorage.LRUCache.Warmer.warm(:test_cache, loader)
  """
  @spec warm(atom(), (-> list({term(), term()})), keyword()) :: {:ok, non_neg_integer()} | {:error, term()}
  def warm(cache_name, loader, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 100)

    try do
      entries = loader.()

      entries
      |> Enum.chunk_every(batch_size)
      |> Enum.each(fn batch ->
        Enum.each(batch, fn {key, value} ->
          PrismaticStorage.LRUCache.put(cache_name, key, value)
        end)
      end)

      count = Enum.count(entries)
      Logger.info("Cache warmed: #{cache_name} with #{count} entries")
      {:ok, count}
    rescue
      e in RuntimeError ->
        Logger.warning("Cache warming failed for #{cache_name}: #{Exception.message(e)}")
        {:error, Exception.message(e)}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Arbitrary cache size** | Choosing round numbers (1000, 10000) instead of measuring the working set leads to poor hit rates or wasted memory | Profile access patterns; set cache size to 1.2-1.5x the measured working set |
| **No TTL on mutable data** | Cached entries become stale when the source data changes, serving incorrect results indefinitely | Always pair LRU eviction with TTL expiration for mutable data |
| **O(n) eviction in hot path** | Timestamp-scan eviction during high write throughput blocks reads | Use generation-based eviction (Cachex) or amortize eviction with lazy cleanup |
| **Missing telemetry** | No visibility into hit rates, eviction frequency, or memory consumption | Instrument all cache operations with `:telemetry` events and monitor dashboards |
| **Cache stampede** | Multiple processes simultaneously miss the cache and all compute the same expensive result | Implement "dog-pile prevention" with a single-flight lock (only one process computes) |
| **ETS term copying overhead** | Large cached values are copied on every read, consuming CPU and memory | Store references or compressed binaries; consider `:persistent_term` for truly static data |
| **No cache warming** | Cold starts cause latency spikes until the cache reaches steady state | Pre-populate the cache with the expected working set on startup |
| **Distributed inconsistency** | Each node's cache diverges, leading to different results for the same query | Use PubSub invalidation for strong consistency or accept TTL-based eventual consistency |
| **Cache as data store** | Relying on the cache as the only copy of data, losing entries on eviction or restart | Caches are performance optimizations, not persistence layers; always have a backing store |
| **Ignoring memory pressure** | Cache grows to consume all available BEAM memory, triggering system-wide GC or OOM | Set hard memory limits and monitor via `:ets.info(table, :memory)` |

## Best Practices

1. **Size caches based on working set analysis** -- monitor hit rates and adjust capacity until diminishing returns; aim for > 90% hit rate for hot-path caches.
2. **Use TTL expiration alongside LRU eviction** -- data that becomes stale regardless of access recency must be expired proactively, not just evicted by displacement.
3. **Enable `:read_concurrency`** on ETS tables used for caching in multi-process environments -- this eliminates read-side lock contention across BEAM schedulers.
4. **Instrument cache hit/miss ratios** -- emit `:telemetry` events for hits, misses, and evictions; alert when hit rates drop below expected thresholds.
5. **Implement cache warming** on application startup -- pre-populate with the expected working set to avoid cold-start latency spikes.
6. **Use Cachex or ConCache for production** -- these libraries provide battle-tested LRU with TTL, statistics, distributed invalidation, and proper OTP supervision.
7. **Consider `:persistent_term`** for truly static configuration data -- it provides zero-copy reads at the cost of expensive (global GC) updates.
8. **Bound memory explicitly** -- set `max_size` based on `value_size * max_entries` and verify with `:ets.info(table, :memory)` in production.
9. **Implement dog-pile prevention** -- when multiple processes miss simultaneously, only one should compute the value while others wait for the result.
10. **Never use LRU caching as a substitute for proper data management** -- caches are performance optimizations, not data stores; always have a backing store that can reconstruct any evicted entry.

## Related Terms

- [Memory](/glossary/memory/) -- system resource managed by LRU eviction policies
- [ETS](/glossary/ets/) -- Erlang Term Storage, the primary backing store for BEAM LRU caches
- [Named Table](/glossary/named-table/) -- ETS tables used as LRU cache backing stores with atom-based access
- [Page Load](/glossary/page-load/) -- page performance improved by LRU caching of rendered content
- [Process](/glossary/process/) -- BEAM processes that own and access LRU caches
- [GenServer](/glossary/genserver/) -- OTP behavior used to manage cache state and coordinate evictions
- [Telemetry](/glossary/telemetry/) -- instrumentation framework for monitoring cache health metrics
- [TTL](/glossary/ttl/) -- time-to-live expiration complementing LRU eviction
- [Hot Path](/glossary/hot-path/) -- performance-critical code paths where LRU caching has highest impact
- [Cachex](/glossary/cachex/) -- production-ready Elixir caching library with LRU support
- [Working Set](/glossary/working-set/) -- the subset of data actively accessed, defining optimal cache size
- [Memory Leak](/glossary/memory-leak/) -- unbounded caches without eviction that grow until OOM

## See Also

- [Architecture](/architecture/) -- caching architecture patterns and multi-layer cache topology
- [Capabilities](/capabilities/) -- performance optimization capabilities in the Prismatic Platform
- [Performance Testing](/architecture/) -- benchmarking cache hit rates and latency under load

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
