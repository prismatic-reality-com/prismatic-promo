+++
title = "Caching"
weight = 50
[extra]
description = "Storing frequently accessed data in fast-access memory layers to reduce latency, database load, and computation cost. In Prismatic: ETS for agent registry and hot data, Redis for distributed caching, connection pooling for database efficiency, and multi-tier cache hierarchies across 115 umbrella applications."
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "performance-infrastructure"
related_concepts = ["ets", "redis", "connection-pooling", "latency", "performance", "key-value-store", "beam-vm"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 5
prerequisites = ["ets", "elixir", "performance", "key-value-store"]
learning_path = "platform-engineer"
interactive_demos = ["/labs/glossary/caching"]
code_examples = ["elixir"]
external_resources = ["https://www.erlang.org/doc/man/ets.html", "https://redis.io/docs/"]
version_introduced = "0.2.0"
stability_level = "stable"
testing_scenarios = ["cache-hit-ratio", "ttl-expiration", "cache-invalidation", "concurrent-access", "memory-pressure"]
keywords = ["cache", "ETS", "Redis", "memoization", "TTL", "cache invalidation", "write-through", "write-behind", "cache-aside"]
tags = ["glossary", "infrastructure", "performance", "ets", "redis", "caching"]
related_terms = ["ets", "ets-table", "redis", "connection-pooling", "latency", "performance", "key-value-store", "beam-vm", "backpressure", "acid-transactions"]
word_count = 1681
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Caching - Prismatic Platform"
+++

## Definition

Caching is the practice of storing frequently accessed or computationally expensive data in fast-access memory layers to reduce latency, decrease load on primary data stores, and avoid redundant computation. A cache sits between the data consumer and the authoritative data source, serving stored copies of data when available (cache hit) and fetching from the source when the cache does not contain the requested data (cache miss). The fundamental tradeoff in caching is between data freshness and access speed: cached data is faster to retrieve but may be stale relative to the authoritative source.

In distributed systems, caching operates at multiple tiers: CPU caches, application-level in-memory stores, distributed cache clusters, CDN edge caches, and browser caches. Each tier offers different latency, capacity, and consistency characteristics. Effective caching strategy requires understanding which data benefits from caching, what staleness tolerance exists, and how to handle cache invalidation -- famously described as one of the two hard problems in computer science (alongside naming things and off-by-one errors).

## Overview

Caching is a performance optimization that operates on the principle of temporal and spatial locality: recently accessed data is likely to be accessed again (temporal locality), and data near recently accessed data is likely to be accessed soon (spatial locality). By exploiting these patterns, caches reduce the average access time for data that follows predictable patterns.

The key dimensions of any caching strategy include:

- **Cache placement** -- Where in the system architecture the cache sits (application-local, distributed, edge)
- **Eviction policy** -- How the cache decides what to remove when capacity is reached (LRU, LFU, TTL, FIFO)
- **Consistency model** -- How stale the cache is allowed to become (strong, eventual, bounded staleness)
- **Write strategy** -- How writes are handled relative to the cache (write-through, write-behind, cache-aside)
- **Invalidation mechanism** -- How the cache learns that its data is stale (TTL, event-driven, manual)
- **Failure mode** -- What happens when the cache is unavailable (fallthrough to source, error, degraded mode)

In the BEAM/OTP ecosystem, Erlang Term Storage (ETS) provides a uniquely powerful local caching primitive that operates within the same VM as the application, offering microsecond-level access without serialization overhead. This makes ETS-based caching significantly faster than external cache systems like Redis for data that does not need to be shared across nodes.

### Cache Hit Ratios and Performance Impact

The effectiveness of a cache is measured by its hit ratio: the percentage of requests served from the cache rather than the backing store. The relationship between hit ratio and performance improvement is non-linear:

| Hit Ratio | Effective Latency (1ms cache, 100ms source) | Speedup |
|-----------|----------------------------------------------|---------|
| 0% | 100ms | 1x |
| 50% | 50.5ms | ~2x |
| 80% | 20.8ms | ~5x |
| 90% | 10.9ms | ~9x |
| 95% | 5.95ms | ~17x |
| 99% | 1.99ms | ~50x |

This demonstrates why even small improvements in hit ratio at high levels (95% to 99%) produce disproportionate performance gains.

## Technical Details

### Caching Strategies Comparison

| Strategy | Description | Consistency | Complexity | Use Case |
|----------|-------------|-------------|------------|----------|
| **Cache-Aside (Lazy Loading)** | App checks cache, fetches source on miss | Eventual | Low | General purpose, read-heavy |
| **Write-Through** | Writes go to cache and source simultaneously | Strong | Medium | Consistency-critical data |
| **Write-Behind (Write-Back)** | Writes go to cache, asynchronously to source | Eventual | High | Write-heavy workloads |
| **Read-Through** | Cache fetches from source transparently on miss | Eventual | Medium | Simplifies application code |
| **Refresh-Ahead** | Cache proactively refreshes before TTL expires | Near-real-time | High | Latency-sensitive hot data |

### ETS-Based Application Cache

```elixir
defmodule PrismaticCache.ETS do
  @moduledoc """
  High-performance ETS-based caching layer for the Prismatic Platform.

  Provides microsecond-level cache access without serialization overhead,
  leveraging the BEAM VM's shared-memory ETS tables. Supports TTL-based
  expiration, LRU eviction, and configurable maximum cache size.

  Designed for single-node hot data caching. For distributed caching
  across cluster nodes, use PrismaticCache.Redis instead.
  """

  use GenServer

  alias PrismaticCache.{Stats, Evictor}

  @type cache_name :: atom()
  @type cache_key :: term()
  @type cache_value :: term()
  @type ttl_ms :: non_neg_integer() | :infinity
  @type cache_opts :: [
          name: cache_name(),
          max_size: non_neg_integer(),
          default_ttl: ttl_ms(),
          eviction_policy: :lru | :lfu | :fifo,
          stats_enabled: boolean()
        ]

  @default_ttl :timer.minutes(15)
  @max_size 100_000
  @cleanup_interval :timer.minutes(5)

  # ---- Public API ----

  @spec start_link(cache_opts()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec get(cache_name(), cache_key()) :: {:ok, cache_value()} | {:error, :miss}
  def get(cache, key) do
    case :ets.lookup(data_table(cache), key) do
      [{^key, value, expires_at}] ->
        now = System.monotonic_time(:millisecond)

        if expires_at == :infinity or now < expires_at do
          :ets.update_counter(meta_table(cache), :hits, 1)
          touch_access(cache, key)
          {:ok, value}
        else
          :ets.delete(data_table(cache), key)
          :ets.update_counter(meta_table(cache), :misses, 1)
          {:error, :miss}
        end

      [] ->
        :ets.update_counter(meta_table(cache), :misses, 1)
        {:error, :miss}
    end
  end

  @spec put(cache_name(), cache_key(), cache_value(), ttl_ms()) :: :ok
  def put(cache, key, value, ttl \\ @default_ttl) do
    expires_at =
      case ttl do
        :infinity -> :infinity
        ms when is_integer(ms) -> System.monotonic_time(:millisecond) + ms
      end

    maybe_evict(cache)
    :ets.insert(data_table(cache), {key, value, expires_at})
    touch_access(cache, key)
    :ok
  end

  @spec delete(cache_name(), cache_key()) :: :ok
  def delete(cache, key) do
    :ets.delete(data_table(cache), key)
    :ets.delete(access_table(cache), key)
    :ok
  end

  @spec fetch(cache_name(), cache_key(), (-> {:ok, cache_value()} | {:error, term()})) ::
          {:ok, cache_value()} | {:error, term()}
  def fetch(cache, key, fallback) when is_function(fallback, 0) do
    case get(cache, key) do
      {:ok, value} ->
        {:ok, value}

      {:error, :miss} ->
        case fallback.() do
          {:ok, value} ->
            put(cache, key, value)
            {:ok, value}

          {:error, _reason} = error ->
            error
        end
    end
  end

  @spec stats(cache_name()) :: {:ok, map()}
  def stats(cache) do
    [{:hits, hits}] = :ets.lookup(meta_table(cache), :hits)
    [{:misses, misses}] = :ets.lookup(meta_table(cache), :misses)
    total = hits + misses

    hit_ratio =
      if total > 0 do
        Float.round(hits / total, 4)
      else
        0.0
      end

    {:ok, %{
      hits: hits,
      misses: misses,
      total: total,
      hit_ratio: hit_ratio,
      size: :ets.info(data_table(cache), :size),
      memory_bytes: :ets.info(data_table(cache), :memory) * :erlang.system_info(:wordsize)
    }}
  end

  @spec invalidate_all(cache_name()) :: :ok
  def invalidate_all(cache) do
    :ets.delete_all_objects(data_table(cache))
    :ets.delete_all_objects(access_table(cache))
    :ok
  end

  # ---- GenServer Callbacks ----

  @impl GenServer
  def init(opts) do
    name = Keyword.fetch!(opts, :name)
    max_size = Keyword.get(opts, :max_size, @max_size)
    default_ttl = Keyword.get(opts, :default_ttl, @default_ttl)

    :ets.new(data_table(name), [:set, :public, :named_table, read_concurrency: true])
    :ets.new(access_table(name), [:ordered_set, :public, :named_table])
    :ets.new(meta_table(name), [:set, :public, :named_table])

    :ets.insert(meta_table(name), {:hits, 0})
    :ets.insert(meta_table(name), {:misses, 0})

    schedule_cleanup()

    {:ok, %{
      name: name,
      max_size: max_size,
      default_ttl: default_ttl
    }}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    cleanup_expired(state.name)
    schedule_cleanup()
    {:noreply, state}
  end

  # ---- Private Functions ----

  defp data_table(name), do: :"#{name}_data"
  defp access_table(name), do: :"#{name}_access"
  defp meta_table(name), do: :"#{name}_meta"

  defp touch_access(cache, key) do
    now = System.monotonic_time(:millisecond)
    :ets.insert(access_table(cache), {now, key})
  end

  defp maybe_evict(cache) do
    # Eviction handled by periodic cleanup and size checks
    :ok
  end

  defp cleanup_expired(cache) do
    now = System.monotonic_time(:millisecond)

    :ets.foldl(
      fn {key, _value, expires_at}, acc ->
        if expires_at != :infinity and now >= expires_at do
          :ets.delete(data_table(cache), key)
          acc + 1
        else
          acc
        end
      end,
      0,
      data_table(cache)
    )
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, @cleanup_interval)
  end
end
```

### Multi-Tier Cache Architecture

```elixir
defmodule PrismaticCache.MultiTier do
  @moduledoc """
  Multi-tier caching strategy that combines ETS (L1, microseconds),
  Redis (L2, milliseconds), and database (L3, tens of milliseconds)
  for optimal latency across different access patterns.

  Reads cascade through tiers: L1 -> L2 -> L3.
  Writes propagate to all tiers for consistency.
  """

  alias PrismaticCache.{ETS, Redis}

  @type tier :: :l1_ets | :l2_redis | :l3_database
  @type fetch_result :: {:ok, term(), tier()} | {:error, atom()}

  @spec fetch(atom(), term(), keyword()) :: fetch_result()
  def fetch(namespace, key, opts \\ []) do
    with {:error, :miss} <- fetch_l1(namespace, key),
         {:error, :miss} <- fetch_l2(namespace, key),
         {:ok, value} <- fetch_l3(namespace, key, opts) do
      # Backfill upper tiers on L3 hit
      backfill_l2(namespace, key, value, opts)
      backfill_l1(namespace, key, value, opts)
      {:ok, value, :l3_database}
    end
  end

  @spec fetch_l1(atom(), term()) :: {:ok, term(), :l1_ets} | {:error, :miss}
  defp fetch_l1(namespace, key) do
    case ETS.get(namespace, key) do
      {:ok, value} -> {:ok, value, :l1_ets}
      {:error, :miss} -> {:error, :miss}
    end
  end

  @spec fetch_l2(atom(), term()) :: {:ok, term(), :l2_redis} | {:error, :miss}
  defp fetch_l2(namespace, key) do
    case Redis.get(namespace, key) do
      {:ok, value} ->
        backfill_l1(namespace, key, value, [])
        {:ok, value, :l2_redis}

      {:error, :miss} ->
        {:error, :miss}
    end
  end

  @spec fetch_l3(atom(), term(), keyword()) :: {:ok, term()} | {:error, atom()}
  defp fetch_l3(namespace, key, opts) do
    loader = Keyword.get(opts, :loader)

    if loader do
      loader.(key)
    else
      {:error, :no_loader}
    end
  end

  defp backfill_l1(namespace, key, value, opts) do
    ttl = Keyword.get(opts, :l1_ttl, :timer.minutes(5))
    ETS.put(namespace, key, value, ttl)
  end

  defp backfill_l2(namespace, key, value, opts) do
    ttl = Keyword.get(opts, :l2_ttl, :timer.minutes(30))
    Redis.put(namespace, key, value, ttl)
  end
end
```

### Eviction Policies

| Policy | Algorithm | Best For | Memory Overhead |
|--------|-----------|----------|-----------------|
| **LRU (Least Recently Used)** | Evict least recently accessed | General workloads | O(n) ordered set |
| **LFU (Least Frequently Used)** | Evict least frequently accessed | Skewed access patterns | O(n) counter map |
| **TTL (Time-To-Live)** | Evict after time expires | Time-sensitive data | O(1) per entry |
| **FIFO (First-In-First-Out)** | Evict oldest entry | Simple, predictable | O(1) queue |
| **Size-Based** | Evict when memory limit reached | Memory-constrained | O(1) |
| **ARC (Adaptive Replacement)** | Self-tuning LRU/LFU hybrid | Unknown workloads | O(n) dual lists |

### Cache Invalidation Patterns

| Pattern | Mechanism | Consistency | Latency |
|---------|-----------|-------------|---------|
| **TTL-based** | Entries expire after fixed duration | Bounded staleness | Zero (passive) |
| **Event-driven** | PubSub notification on data change | Near-real-time | Milliseconds |
| **Version-stamped** | Compare version on read | Read-time validation | Per-read check |
| **Write-invalidate** | Delete cache entry on write | Strong (with race window) | Per-write cost |
| **Write-update** | Update cache entry on write | Strong | Per-write cost |

## Implementation in Prismatic Platform

The Prismatic Platform employs caching at multiple layers across its 115 umbrella applications:

### Agent Registry Cache (ETS)

The agent registry, managing 530+ AIAD agents, uses ETS for microsecond-level agent lookup. Agent metadata (capabilities, authority level, status) is cached in a `:named_table` with `:read_concurrency` optimization, enabling parallel reads from multiple processes without contention.

### API Endpoint Discovery Cache (ETS)

The Prismatic API auto-introspection system caches discovered endpoints in ETS at boot time. This eliminates the cost of scanning all `Prismatic*` modules on every request while maintaining the ability to rescan via `/prismatic-api rescan`.

### Session Context Cache (ETS + File System)

Session context data is cached in ETS during active sessions and persisted to `.claude/session-context/` files at session boundaries. This provides fast in-session access with durable cross-session persistence.

### OSINT Adapter Response Cache (Redis)

OSINT tool responses from external APIs (ARES, Justice.cz, Shodan, VirusTotal) are cached in Redis with source-specific TTLs. Corporate registry data from ARES uses 24-hour TTLs (data changes infrequently), while threat intelligence from Shodan uses 1-hour TTLs (data is more volatile).

### Page Rendering Cache

Per the platform's page load performance standard (P0), all pages must load under 250ms with server-side render time under 100ms. LiveView mount operations use ETS-cached data to meet these targets, avoiding database roundtrips for frequently accessed dashboard data.

## Comparison with Alternatives

| Technology | Type | Latency | Capacity | Distribution | Persistence |
|------------|------|---------|----------|--------------|-------------|
| **ETS** | In-process | ~1-10 us | VM memory | Single node | Crash-lost |
| **Redis** | External | ~0.5-2 ms | Server memory | Cluster-capable | Optional (RDB/AOF) |
| **Memcached** | External | ~0.5-1 ms | Server memory | Sharded | None |
| **Mnesia** | Distributed Erlang | ~10-100 us | Disk + memory | Erlang cluster | Yes |
| **Cachex** | Elixir library (ETS) | ~1-10 us | VM memory | Single node (+ dist) | Crash-lost |
| **CDN Edge** | Network edge | ~1-50 ms | Distributed | Global | TTL-based |

The Prismatic approach uses ETS as the L1 cache for hot data within a single node and Redis as the L2 cache for distributed data across potential cluster nodes. This dual-tier strategy provides microsecond-level access for the most frequently accessed data while enabling cross-node consistency for shared state.

## Best Practices

1. **Cache what is read-heavy and write-light** -- Caching data that changes frequently relative to read frequency provides minimal benefit and maximum invalidation complexity.
2. **Set appropriate TTLs** -- Every cached entry must have a TTL. Infinite TTLs lead to stale data; overly short TTLs reduce hit ratios. Match TTL to data volatility.
3. **Monitor hit ratios** -- Track cache hit ratios in production. Ratios below 80% suggest the caching strategy does not match the access pattern.
4. **Use ETS for hot, local data** -- When data does not need cross-node sharing, ETS provides the lowest possible latency without network overhead.
5. **Handle cache failures gracefully** -- The system must function when the cache is unavailable. Cache-aside pattern with fallthrough to source ensures degraded but functional operation.
6. **Avoid cache stampede** -- When a popular cache entry expires, many concurrent requests may simultaneously fetch from the source. Implement request coalescing or probabilistic early expiration.
7. **Size caches appropriately** -- Monitor memory consumption. An unbounded cache eventually exhausts available memory. Set max size and eviction policies.
8. **Invalidate conservatively** -- When in doubt, invalidate. Serving stale data is usually worse than a cache miss, especially for compliance-critical data.

## Common Pitfalls

1. **Caching everything** -- Not all data benefits from caching. Infrequently accessed data wastes cache capacity and displaces hotter entries.
2. **Ignoring cache consistency** -- Updating the database without invalidating the cache creates stale reads that are difficult to debug.
3. **No TTL on entries** -- Entries without TTL persist indefinitely, accumulating stale data and consuming memory.
4. **Cache stampede on expiry** -- When a hot key expires, hundreds of concurrent requests hit the database simultaneously. Use locking or probabilistic refresh.
5. **Serialization overhead** -- External caches (Redis) require serialization. Caching large objects with expensive serialization may negate the latency benefit.
6. **Testing without cache** -- Test suites that bypass the cache miss production bugs related to stale data, race conditions, and invalidation logic.
7. **Over-relying on distributed cache** -- Using Redis for data that never leaves a single node adds network latency unnecessarily. Use ETS for node-local data.
8. **Cache key collisions** -- Poorly designed cache keys that do not account for all relevant parameters produce incorrect cache hits. Include all discriminating parameters in the key.

## Use Cases

### Agent Registry Lookup

The 530+ AIAD agents are registered in ETS at startup. Every agent dispatch operation (hundreds per second) reads agent metadata from the ETS cache, achieving sub-microsecond lookup times that would be impossible with database queries.

### API Discovery and Dispatch

The Prismatic API's auto-introspecting endpoint registry caches the mapping from `{app, action}` pairs to `{module, function}` tuples. This cache is populated at boot time and refreshed on explicit rescan, enabling sub-millisecond request routing.

### OSINT Rate Limit Management

External OSINT APIs impose rate limits. Caching responses in Redis with appropriate TTLs reduces API calls, staying within rate limits while providing responsive user experience. The 120 OSINT tools each have source-specific caching policies.

### Dashboard Real-Time Metrics

LiveView dashboards displaying security ratings, asset inventories, and compliance assessments use ETS-cached aggregations to achieve the sub-100ms server render time required by the performance standard.

### Graph Query Memoization

Expensive KuzuDB graph traversals (beneficial ownership chains, entity resolution) are memoized in ETS with short TTLs. Repeated queries for the same entity during an investigation session hit the cache rather than re-traversing the graph.

## Related Concepts

- [ETS](/glossary/ets/) -- Erlang Term Storage, primary local caching primitive
- [ETS Table](/glossary/ets-table/) -- Specific ETS table configurations and access patterns
- [Redis](/glossary/redis/) -- Distributed caching and data structure store
- [Connection Pooling](/glossary/connection-pooling/) -- Resource pooling complementary to caching
- [Latency](/glossary/latency/) -- Primary metric improved by effective caching
- [Performance](/glossary/performance/) -- System-level performance optimization
- [Key-Value Store](/glossary/key-value-store/) -- Data model underlying most cache implementations
- [BEAM VM](/glossary/beam-vm/) -- Runtime providing ETS and process-level caching
- [Backpressure](/glossary/backpressure/) -- Flow control mechanism complementary to caching
- [ACID Transactions](/glossary/acid-transactions/) -- Consistency model interacting with cache invalidation

## See Also

- [Erlang ETS Documentation](https://www.erlang.org/doc/man/ets.html) -- Official ETS reference
- [Redis Documentation](https://redis.io/docs/) -- Redis caching patterns
- [Cachex Library](https://hexdocs.pm/cachex/) -- Elixir caching library built on ETS
- [Cache Stampede Prevention (Wikipedia)](https://en.wikipedia.org/wiki/Cache_stampede) -- Thundering herd problem

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
