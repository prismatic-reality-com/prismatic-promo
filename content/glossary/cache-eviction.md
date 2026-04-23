+++
title = "Cache Eviction"
weight = 50

[extra]
description = "The process of removing entries from a cache to free memory or maintain data freshness, using strategies like TTL, LRU, LFU, size-based eviction, and event-driven invalidation in ETS, Cachex, and Nebulex caches."
category = "architecture"
domain = "infrastructure"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["cache", "configuration", "consistency", "benchmark", "batch-processing", "ets", "telemetry", "retry", "throughput", "memory-management", "response-distribution", "logging", "supervision-strategy"]
tags = ["glossary", "cache-eviction", "caching", "ttl", "lru", "lfu", "memory-management", "ets", "beam", "cachex", "nebulex", "eviction-policy"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Cache eviction policies prevent unbounded memory growth while maintaining data freshness, critical for the Prismatic Platform's ETS-backed registries, OSINT data caches, and Cachex-managed application caches across 110 umbrella apps."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["cache eviction", "TTL", "LRU", "LFU", "eviction policy", "memory management", "cache invalidation", "expiration", "cache size", "data freshness", "ETS", "Cachex", "Nebulex", "BEAM", "OTP"]
image = "/images/sections/glossary.png"
image_alt = "Cache Eviction - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "agents", "telemetry"]
+++

## Definition

Cache eviction is the process of selecting and removing entries from a cache to reclaim memory, maintain data freshness, or enforce size constraints. Since caches have finite capacity, an eviction policy determines which entries to remove when the cache reaches its limits or when cached data becomes stale. The choice of eviction policy directly impacts cache hit rates, memory usage, and data consistency.

Every cache eviction decision is fundamentally a trade-off: removing entries too aggressively wastes the work invested in populating the cache (reducing hit rates and increasing origin load), while removing entries too conservatively risks serving stale data and consuming excessive memory. The optimal eviction strategy depends on access patterns, data volatility, memory budget, and consistency requirements.

In the Prismatic Platform, cache eviction operates across multiple layers: ETS tables use TTL-based cleanup with periodic sweeps, Cachex provides built-in LRU eviction with configurable limits, and application-level PubSub notifications enable event-driven invalidation when source data changes. This multi-layer approach ensures that each cache tier uses the eviction strategy best suited to its access patterns and consistency requirements.

## Core Concepts

### Eviction Policy Comparison

| Policy | Selection Criteria | Hit Rate | Complexity | Memory Overhead | Prismatic Usage |
|--------|-------------------|----------|------------|-----------------|-----------------|
| **TTL (Time-To-Live)** | Time since insertion/update | Good | O(1) insert, O(n) sweep | Timestamp per entry | OSINT feed cache, session cache |
| **LRU (Least Recently Used)** | Least recently accessed entry | Excellent | O(1) with hash+linked list | Pointer per entry | API response cache, Cachex default |
| **LFU (Least Frequently Used)** | Least access count | Very Good | O(log n) with min-heap | Counter per entry | Not currently used |
| **FIFO (First In, First Out)** | Oldest insertion time | Fair | O(1) with queue | Minimal | Telemetry event buffers |
| **Size-Based** | Cache exceeds max entry count | Varies | O(1) check | Counter only | ETS table limits |
| **Random** | Randomly selected entry | Fair | O(1) | None | Fallback under memory pressure |
| **Event-Based** | External trigger invalidates | Perfect freshness | O(1) per event | PubSub subscription | Quality DNA, entity updates |
| **ARC (Adaptive Replacement)** | Balances recency and frequency | Excellent | O(1) | Two LRU lists | Nebulex adapter option |

### TTL Strategy Variants

| Variant | Behavior | Pros | Cons | Use Case |
|---------|----------|------|------|----------|
| **Absolute TTL** | Entry expires N seconds after creation | Predictable, simple | Stale reads possible until expiry | External API response cache |
| **Sliding TTL** | Expiry resets on each access | Keeps hot entries alive | Stale data persists if accessed | Session cache, user preferences |
| **Lazy TTL** | Check expiry only on read | Zero background overhead | Stale entries consume memory | Low-traffic caches |
| **Active TTL** | Background sweep removes expired | Memory reclaimed promptly | Sweep cost (O(n) per cycle) | High-volume caches |
| **Hybrid TTL** | Lazy check on read + periodic sweep | Balanced memory and latency | More complex implementation | Prismatic Platform default |

### Cache Warming Strategies

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| **Cold Start** | Cache starts empty, fills on demand | Slow initial performance, no wasted memory |
| **Pre-Warm on Boot** | Load frequently accessed data at startup | Fast initial requests, longer boot time |
| **Background Refresh** | Refresh entries before TTL expires | Never serves stale data, constant background load |
| **Predictive Warm** | Pre-load based on anticipated access patterns | Optimal hit rate, complex prediction logic |
| **Cascade Warm** | Higher-tier cache warms lower tiers | Reduces origin load, tiered complexity |

## Technical Deep Dive

### ETS-Based Cache Eviction in BEAM/OTP

ETS (Erlang Term Storage) is the foundation of most BEAM caching. ETS tables provide concurrent read/write access from any process, but they have no built-in eviction mechanism -- entries persist until explicitly deleted or the table is destroyed. This means eviction must be implemented as application-level logic.

The standard pattern for TTL-based ETS eviction stores each entry as `{key, value, expiry_timestamp}` where `expiry_timestamp` is computed as `System.monotonic_time(:millisecond) + ttl_ms` at insertion time. Eviction runs in two complementary phases:

1. **Lazy eviction on read**: When a value is fetched, its timestamp is checked. If expired, the entry is deleted and a cache miss is returned. This ensures no stale data is ever served, at zero background cost.

2. **Active eviction via periodic sweep**: A GenServer or `:timer.send_interval/2` triggers periodic scans of the ETS table using `:ets.select/2` with match specifications to find expired entries. The sweep interval balances memory reclamation speed against CPU cost.

The critical implementation detail is using `System.monotonic_time/1` rather than `System.system_time/1` for timestamps. Monotonic time is immune to NTP clock adjustments, preventing entries from suddenly appearing expired (or unexpectedly extended) after a time correction.

### Cachex Integration

Cachex is the primary structured caching library used in the Prismatic Platform. It provides:

- **Built-in TTL**: Configurable default and per-entry TTL with automatic expiration.
- **Size limits**: Maximum entry count with LRU eviction when the limit is reached.
- **Warming**: Cache warming hooks for pre-population on startup.
- **Stats**: Built-in hit/miss/eviction counters for monitoring.
- **Fallback**: Automatic fallback functions that populate cache on miss.
- **Transactions**: Atomic get-or-set operations preventing cache stampede.

Cachex uses ETS internally but adds the eviction, TTL, and coordination layers that raw ETS lacks. For the Prismatic Platform, Cachex is the recommended choice for any cache that needs TTL, size limits, or both.

### Nebulex for Distributed Caching

For caches that must span multiple nodes (e.g., in a clustered BEAM deployment), Nebulex provides a distributed caching framework with pluggable adapters:

- **Local adapter**: Single-node cache (similar to Cachex).
- **Partitioned adapter**: Distributes entries across cluster nodes by key hash.
- **Replicated adapter**: Full copy on every node, eventual consistency.
- **Multilevel adapter**: Tiered caching (L1 local, L2 distributed).

Each adapter supports its own eviction configuration. The multilevel adapter is particularly relevant for the Prismatic Platform's tiered caching architecture, where L1 (ETS/process-local) provides sub-microsecond access and L2 (Cachex/Nebulex) provides millisecond access with persistence across process restarts.

### Cache Stampede Prevention

When a popular cache entry expires, multiple concurrent requests may simultaneously attempt to regenerate it, creating a "thundering herd" against the origin. Prevention strategies include:

- **Probabilistic early expiration**: Each access has a small probability of triggering a background refresh before the actual TTL expires, spreading regeneration load.
- **Lock-based regeneration**: A single process acquires a lock to regenerate the entry while others wait or receive the stale value.
- **Stale-while-revalidate**: Serve the expired value while a background process fetches a fresh one.

Cachex provides `Cachex.fetch/3` which atomically checks for the entry and calls a fallback function only if missing, preventing stampede at the library level.

### Memory Pressure Detection

In production BEAM systems, cache eviction should respond to system-wide memory pressure, not just per-cache limits. The BEAM VM provides `:erlang.memory/0` for real-time memory reporting. An adaptive eviction strategy monitors total memory usage and becomes more aggressive when the system approaches its memory budget:

- **Normal (< 70% memory)**: Standard TTL/LRU eviction.
- **Elevated (70-85% memory)**: Reduce TTL by 50%, more aggressive size limits.
- **Critical (> 85% memory)**: Emergency eviction of low-priority caches, alert triggered.

## Usage in Prismatic Platform

The platform implements cache eviction across multiple tiers and domains:

| Cache | Technology | Eviction Strategy | TTL | Max Size | Purpose |
|-------|-----------|-------------------|-----|----------|---------|
| **OSINT Feed Cache** | Cachex | TTL + size limit | 15 min | 10,000 entries | External API response caching |
| **ASN Lookup Cache** | ETS | Absolute TTL | 24-72 hours | Unlimited | Network intelligence data |
| **API Response Cache** | Cachex | LRU + size limit | 5 min | 5,000 entries | REST API response caching |
| **Session Cache** | ETS | Sliding TTL | 30 min | Unlimited | User session state |
| **Quality DNA** | Cachex | Event-driven | None | Per-app | Quality score caching |
| **Telemetry Buffer** | ETS | FIFO + size limit | None | 50,000 events | Telemetry event buffering |
| **Agent Registry** | ETS | Event-driven | None | Unlimited | AIAD agent metadata |
| **Glossary Content** | Cachex | TTL + pre-warm | 1 hour | 2,000 entries | Rendered glossary pages |
| **Markdown Render** | ETS | LRU + size limit | 30 min | 1,000 entries | Cached markdown HTML output |
| **OSINT Tool Registry** | ETS | Event-driven (compile) | None | Unlimited | Self-registering tool metadata |

The HierarchicalCache shared utility implements a 3-level caching strategy (ETS -> Cachex -> external source) with configurable eviction at each level. This provides sub-50ms response times for cached content while ensuring eventual consistency through TTL and event-driven invalidation.

PubSub-driven invalidation is used for consistency-critical data. When a quality score changes, the Quality Floor Guardian broadcasts on the `"quality:updated"` topic, and all caches holding quality data evict the affected entries immediately rather than waiting for TTL expiry.

## Code Examples

### Comprehensive ETS Cache with TTL and Size-Based Eviction

```elixir
defmodule PrismaticCache.EvictionManager do
  @moduledoc """
  Manages cache eviction across multiple ETS-backed caches with support
  for TTL-based, size-based, and event-driven eviction strategies.

  Each managed cache is registered with its eviction configuration, and
  the manager runs periodic sweeps to enforce TTL and size constraints.
  Telemetry events are emitted for all eviction operations.

  ## Architecture

  The manager supervises a periodic timer that sweeps all registered
  caches. Each sweep:

    1. Checks TTL: removes entries where `expiry < now`
    2. Checks size: removes oldest entries if count exceeds max_size
    3. Emits telemetry: `[:prismatic, :cache, :evicted]` with count and table

  ## Example

      iex> PrismaticCache.EvictionManager.register(:my_cache, %{
      ...>   strategy: :ttl_and_size,
      ...>   ttl_ms: 300_000,
      ...>   max_size: 5_000,
      ...>   check_interval_ms: 30_000
      ...> })
      :ok
  """

  use GenServer

  require Logger

  @type eviction_strategy :: :ttl | :size | :ttl_and_size | :event
  @type eviction_config :: %{
          strategy: eviction_strategy(),
          max_size: non_neg_integer() | :unlimited,
          ttl_ms: non_neg_integer() | nil,
          check_interval_ms: non_neg_integer()
        }

  @default_check_interval_ms 30_000

  @doc """
  Starts the eviction manager GenServer.
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Registers a cache table for managed eviction with the given config.
  """
  @spec register(atom(), eviction_config()) :: :ok
  def register(table, config) do
    GenServer.call(__MODULE__, {:register, table, config})
  end

  @doc """
  Immediately evicts all expired entries from the given ETS table.

  Entries must be stored as `{key, value, expiry_monotonic_ms}` tuples.
  Returns the count of evicted entries.

  ## Example

      iex> PrismaticCache.EvictionManager.evict_expired(:osint_cache)
      42
  """
  @spec evict_expired(atom()) :: non_neg_integer()
  def evict_expired(table) do
    now = System.monotonic_time(:millisecond)

    match_spec = [{{:"$1", :_, :"$2"}, [{:<, :"$2", now}], [:"$1"]}]
    expired_keys = :ets.select(table, match_spec)

    Enum.each(expired_keys, &:ets.delete(table, &1))

    count = length(expired_keys)

    if count > 0 do
      :telemetry.execute(
        [:prismatic, :cache, :evicted],
        %{count: count},
        %{table: table, strategy: :ttl}
      )

      Logger.debug("Cache eviction completed",
        table: table,
        evicted_count: count,
        strategy: :ttl
      )
    end

    count
  end

  @doc """
  Evicts entries to bring the table size within `max_size`.

  Uses FIFO ordering (earliest inserted entries evicted first) when
  the table is an `:ordered_set`, otherwise evicts by iteration order.
  Returns the count of evicted entries.

  ## Example

      iex> PrismaticCache.EvictionManager.evict_by_size(:api_cache, 5_000)
      150
  """
  @spec evict_by_size(atom(), non_neg_integer()) :: non_neg_integer()
  def evict_by_size(table, max_size) do
    current_size = :ets.info(table, :size)

    if current_size > max_size do
      to_remove = current_size - max_size

      keys =
        :ets.select(table, [{{:"$1", :_, :_}, [], [:"$1"]}], to_remove)
        |> case do
          {matched, _continuation} -> matched
          :"$end_of_table" -> []
        end

      Enum.each(keys, &:ets.delete(table, &1))

      evicted = length(keys)

      if evicted > 0 do
        :telemetry.execute(
          [:prismatic, :cache, :evicted],
          %{count: evicted},
          %{table: table, strategy: :size, max_size: max_size}
        )
      end

      evicted
    else
      0
    end
  end

  @doc """
  Inserts a value into an ETS cache with automatic TTL calculation.

  ## Example

      iex> PrismaticCache.EvictionManager.put_with_ttl(:my_cache, "key1", "value1", 60_000)
      true
  """
  @spec put_with_ttl(atom(), term(), term(), non_neg_integer()) :: true
  def put_with_ttl(table, key, value, ttl_ms) do
    expiry = System.monotonic_time(:millisecond) + ttl_ms
    :ets.insert(table, {key, value, expiry})
  end

  @doc """
  Fetches a value from an ETS cache, performing lazy TTL check.

  Returns `{:ok, value}` if found and not expired, `:error` otherwise.
  Automatically deletes expired entries on access.

  ## Example

      iex> PrismaticCache.EvictionManager.get_with_ttl(:my_cache, "key1")
      {:ok, "value1"}
  """
  @spec get_with_ttl(atom(), term()) :: {:ok, term()} | :error
  def get_with_ttl(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value, expiry}] ->
        now = System.monotonic_time(:millisecond)

        if now < expiry do
          {:ok, value}
        else
          :ets.delete(table, key)
          :error
        end

      [] ->
        :error
    end
  end

  # --- GenServer Callbacks ---

  @impl true
  def init(_opts) do
    {:ok, %{caches: %{}}}
  end

  @impl true
  def handle_call({:register, table, config}, _from, state) do
    interval = Map.get(config, :check_interval_ms, @default_check_interval_ms)
    :timer.send_interval(interval, {:sweep, table})
    new_caches = Map.put(state.caches, table, config)
    {:reply, :ok, %{state | caches: new_caches}}
  end

  @impl true
  def handle_info({:sweep, table}, state) do
    case Map.get(state.caches, table) do
      nil ->
        {:noreply, state}

      config ->
        if config.strategy in [:ttl, :ttl_and_size] and config.ttl_ms do
          evict_expired(table)
        end

        if config.strategy in [:size, :ttl_and_size] and config.max_size != :unlimited do
          evict_by_size(table, config.max_size)
        end

        {:noreply, state}
    end
  end
end
```

### Cachex-Based Application Cache with Warming and Fallback

```elixir
defmodule PrismaticCache.ApplicationCache do
  @moduledoc """
  High-level application cache built on Cachex with automatic warming,
  fallback functions, and telemetry integration.

  Provides a declarative API for defining caches with eviction policies
  that are automatically enforced by Cachex.

  ## Example

      iex> PrismaticCache.ApplicationCache.get_or_fetch(:glossary, "elixir", fn ->
      ...>   PrismaticWeb.Glossary.load_term("elixir")
      ...> end)
      {:ok, %{title: "Elixir", ...}}
  """

  require Logger

  @type cache_name :: atom()
  @type cache_opts :: [
          ttl: non_neg_integer(),
          limit: non_neg_integer(),
          warmers: [module()]
        ]

  @doc """
  Retrieves a cached value or populates it using the fallback function.

  Uses Cachex.fetch/3 for atomic get-or-set semantics, preventing
  cache stampede when multiple processes request the same missing key.

  ## Example

      iex> PrismaticCache.ApplicationCache.get_or_fetch(:api_cache, "/health", fn ->
      ...>   {:ok, %{status: "healthy"}}
      ...> end)
      {:ok, %{status: "healthy"}}
  """
  @spec get_or_fetch(cache_name(), term(), (() -> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, term()}
  def get_or_fetch(cache, key, fallback_fn) do
    case Cachex.fetch(cache, key, fn _key ->
      case fallback_fn.() do
        {:ok, value} -> {:commit, value}
        {:error, _} = error -> {:ignore, error}
      end
    end) do
      {:ok, value} -> {:ok, value}
      {:commit, value} ->
        :telemetry.execute(
          [:prismatic, :cache, :miss],
          %{count: 1},
          %{cache: cache, key: key}
        )
        {:ok, value}
      {:ignore, error} -> error
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Invalidates a specific cache entry, triggering re-fetch on next access.

  ## Example

      iex> PrismaticCache.ApplicationCache.invalidate(:glossary, "elixir")
      :ok
  """
  @spec invalidate(cache_name(), term()) :: :ok
  def invalidate(cache, key) do
    Cachex.del(cache, key)

    :telemetry.execute(
      [:prismatic, :cache, :invalidated],
      %{count: 1},
      %{cache: cache, key: key}
    )

    :ok
  end

  @doc """
  Returns cache statistics including hit rate, miss rate, and eviction count.

  ## Example

      iex> PrismaticCache.ApplicationCache.stats(:glossary)
      %{hits: 4521, misses: 89, evictions: 12, hit_rate: 0.98, size: 1243}
  """
  @spec stats(cache_name()) :: map()
  def stats(cache) do
    case Cachex.stats(cache) do
      {:ok, stats} ->
        total = Map.get(stats, :hits, 0) + Map.get(stats, :misses, 0)
        hit_rate = if total > 0, do: Map.get(stats, :hits, 0) / total, else: 0.0

        %{
          hits: Map.get(stats, :hits, 0),
          misses: Map.get(stats, :misses, 0),
          evictions: Map.get(stats, :evictions, 0),
          hit_rate: Float.round(hit_rate, 4),
          size: Cachex.size!(cache)
        }

      {:error, _} ->
        %{hits: 0, misses: 0, evictions: 0, hit_rate: 0.0, size: 0}
    end
  end
end
```

### PubSub-Driven Cache Invalidation

```elixir
defmodule PrismaticCache.EventInvalidator do
  @moduledoc """
  Listens for PubSub events and invalidates corresponding cache entries.

  Maps event topics to cache names and key extraction functions, providing
  automatic event-driven cache invalidation without polling or TTL delays.

  ## Configuration

  Invalidation rules are defined as a list of `{topic, cache, key_fn}` tuples:

      rules = [
        {"quality:updated", :quality_cache, fn event -> event.app_name end},
        {"entity:changed", :entity_cache, fn event -> event.entity_id end}
      ]

  ## Example

      iex> PrismaticCache.EventInvalidator.start_link(rules: [
      ...>   {"quality:updated", :quality_cache, &Map.get(&1, :app_name)}
      ...> ])
      {:ok, pid}
  """

  use GenServer

  require Logger

  @type invalidation_rule :: {String.t(), atom(), (map() -> term())}

  @doc """
  Starts the event invalidator with the given invalidation rules.
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    rules = Keyword.get(opts, :rules, [])

    Enum.each(rules, fn {topic, _cache, _key_fn} ->
      Phoenix.PubSub.subscribe(Prismatic.PubSub, topic)
    end)

    {:ok, %{rules: rules}}
  end

  @impl true
  def handle_info({topic, event_data}, state) when is_binary(topic) do
    state.rules
    |> Enum.filter(fn {rule_topic, _cache, _key_fn} -> rule_topic == topic end)
    |> Enum.each(fn {_topic, cache, key_fn} ->
      key = key_fn.(event_data)
      PrismaticCache.ApplicationCache.invalidate(cache, key)

      Logger.debug("Event-driven cache invalidation",
        topic: topic,
        cache: cache,
        key: key
      )
    end)

    {:noreply, state}
  end

  def handle_info(_msg, state), do: {:noreply, state}
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Unbounded cache growth** | ETS table consumes all available memory, causing OOM crash | Always configure max_size limits; monitor `:ets.info(table, :memory)` |
| **Wall-clock TTL timestamps** | NTP adjustments cause entries to expire early or persist beyond TTL | Use `System.monotonic_time/1` for all TTL calculations |
| **Cache stampede** | Many concurrent requests regenerate the same expired entry simultaneously | Use `Cachex.fetch/3` for atomic get-or-set; implement locking or stale-while-revalidate |
| **Sweep blocking** | Full-table ETS scan blocks the sweep process for large tables | Use `:ets.select/3` with continuation for chunked sweeps; run sweeps in dedicated process |
| **Over-aggressive eviction** | TTL too short or max_size too small causes excessive cache misses | Monitor hit rates; tune TTL and size based on access patterns |
| **Stale reads in event-driven** | PubSub message delay allows brief window of stale data | Accept eventual consistency or combine event-driven with short TTL as safety net |
| **Missing eviction telemetry** | Cannot diagnose cache performance without eviction metrics | Emit `:telemetry.execute/3` for every eviction operation |
| **Process-local cache loss** | Caching in process state means cache is lost on process restart | Use ETS (survives process restart within node) or Cachex for durable caching |
| **Ignoring memory pressure** | Per-cache limits do not account for total system memory consumption | Implement adaptive eviction that monitors `:erlang.memory(:total)` |
| **TTL without lazy check** | Periodic sweep alone means stale data can be served between sweeps | Always check TTL on read (lazy eviction) in addition to periodic sweeps |

## Best Practices

1. **Match eviction policy to access patterns** -- use LRU for request caches with temporal locality, TTL for time-sensitive external data, and event-driven invalidation for consistency-critical application data.

2. **Monitor eviction rates and hit ratios** -- high eviction rates indicate the cache is too small or TTL is too short. Target hit rates above 90% for application caches and above 95% for hot-path caches.

3. **Use lazy eviction with periodic sweeps** -- check TTL on every read (lazy) to prevent serving stale data, plus run periodic background sweeps to reclaim memory from entries that are never re-accessed.

4. **Set reasonable size limits on every cache** -- unbounded caches will eventually consume all available memory. Even if you trust the TTL, set a size limit as a safety net against memory exhaustion.

5. **Emit telemetry events on every eviction** -- use `[:prismatic, :cache, :evicted]` events with table name, strategy, and count metadata for cache tuning and capacity planning.

6. **Use Cachex for application caches** -- raw ETS requires implementing TTL, size limits, and stampede prevention manually. Cachex provides all of these out of the box with proven correctness.

7. **Prevent cache stampede with atomic operations** -- use `Cachex.fetch/3` or implement lock-based regeneration to ensure only one process regenerates an expired entry.

8. **Use monotonic time for all TTL calculations** -- `System.monotonic_time/1` is immune to NTP adjustments, preventing unexpected expiration behavior.

9. **Implement adaptive eviction under memory pressure** -- monitor system memory and become more aggressive with eviction when total memory usage exceeds 70-80% of available capacity.

10. **Warm critical caches on application startup** -- for caches where cold-start latency is unacceptable, implement cache warmers that pre-populate entries from the data source during boot.

## Related Terms

- [Cache](@/glossary/cache.md) -- the storage layer being managed by eviction policies
- [Configuration](@/glossary/configuration.md) -- eviction policy configuration and tuning parameters
- [Consistency](@/glossary/consistency.md) -- data freshness guarantees affected by eviction timing
- [Benchmark](@/glossary/benchmark.md) -- measuring eviction impact on cache hit rates and system performance
- [Telemetry](@/glossary/telemetry.md) -- the event system for monitoring eviction metrics
- [Response Distribution](@/glossary/response-distribution.md) -- cache hit/miss ratio directly affects response time distribution shape
- [Retry](@/glossary/retry.md) -- retry policies interact with cache TTL when retrying cached responses
- [Logging](@/glossary/logging.md) -- eviction events should be logged for operational visibility
- [Batch Processing](@/glossary/batch-processing.md) -- batch cache warming and eviction strategies
- [Memory Management](/glossary/memory-management/) -- cache eviction is a key component of system memory management
- [Throughput](@/glossary/throughput.md) -- cache hit rates directly impact system throughput
- [Supervision Strategy](@/glossary/supervision-strategy.md) -- cache processes require proper OTP supervision for reliability

## See Also

- [ETS Documentation](https://www.erlang.org/doc/man/ets.html) -- Erlang Term Storage, the foundation for BEAM caches
- [Cachex Library](https://hexdocs.pm/cachex/) -- full-featured caching library for Elixir
- [Nebulex Library](https://hexdocs.pm/nebulex/) -- distributed caching framework with pluggable adapters
- [Cache Design Patterns](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html) -- industry caching patterns and strategies
- [Shared Utilities Guide](@/architecture/_index.md) -- HierarchicalCache implementation in Prismatic Platform

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
