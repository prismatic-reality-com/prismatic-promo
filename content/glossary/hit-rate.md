+++
title = "Hit Rate"
description = "The ratio of cache hits to total cache lookups, measuring cache effectiveness as a percentage -- higher hit rates indicate better cache utilization and fewer expensive backend operations."
weight = 50

[extra]
category = "performance"
tags = ["hit-rate", "cache", "performance", "ets", "miss-rate", "eviction", "warming", "optimization", "ratio", "metrics"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["developers", "performance-engineers", "architects", "sre"]
related_terms = ["ets-memory", "cache", "performance", "latency", "throughput", "eviction-policy"]
key_concepts = ["cache-hit", "cache-miss", "miss-penalty", "cache-warming", "eviction-strategy", "working-set"]
platforms = ["beam", "ets", "elixir", "redis", "meilisearch"]
prerequisites = ["caching-fundamentals", "performance-basics", "data-structures"]
use_cases = ["performance-monitoring", "cache-tuning", "capacity-planning", "cost-optimization"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1000
date_modified = "2026-02-23"
keywords = ["Hit Rate", "cache", "performance", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Hit Rate - Prismatic Platform"
+++

## Definition and Overview

Hit rate is the percentage of cache lookups that find the requested data in the cache (cache hits) versus the total number of lookups attempted. It is calculated as: hit_rate = cache_hits / (cache_hits + cache_misses) * 100%. A 95% hit rate means that 95 out of every 100 lookups are served from the cache without needing to access the slower backend data source (database, API, file system).

Hit rate is the single most important metric for evaluating cache effectiveness. A cache with a high hit rate (>90%) dramatically reduces load on backend systems and improves response times, since cache lookups (especially from ETS) are orders of magnitude faster than database queries or API calls. A cache with a low hit rate (<50%) provides little benefit while consuming memory and adding code complexity. Understanding and optimizing hit rate is essential for meeting the Prismatic Platform's performance requirements.

The relationship between hit rate and performance is non-linear. Improving hit rate from 0% to 50% halves backend load. Improving from 90% to 95% halves the remaining backend load again (from 10% to 5%). Improving from 95% to 99% reduces remaining load by 80%. Each percentage point of improvement at the high end has disproportionately large impact. This is why high-performance systems invest significant effort in achieving hit rates above 95%.

## Technical Deep Dive

### Hit Rate Impact Analysis

| Hit Rate | Miss Rate | Backend Load Factor | Effective Latency Reduction |
|----------|-----------|--------------------|-----------------------------|
| 0% | 100% | 1.0x (no cache) | None |
| 50% | 50% | 0.5x | Moderate |
| 80% | 20% | 0.2x | Significant |
| 90% | 10% | 0.1x | Large |
| 95% | 5% | 0.05x | Very large |
| 99% | 1% | 0.01x | Near-complete offload |
| 99.9% | 0.1% | 0.001x | Essentially zero backend |

### Factors Affecting Hit Rate

| Factor | Impact | Optimization |
|--------|--------|-------------|
| **Cache size** | Larger cache holds more data, fewer evictions | Size to fit working set |
| **TTL (Time to Live)** | Shorter TTL = more misses, fresher data | Balance freshness vs hit rate |
| **Eviction policy** | LRU, LFU, FIFO affect which entries are kept | Match policy to access pattern |
| **Working set size** | Smaller working set = higher hit rate | Identify hot data subset |
| **Access pattern** | Zipf (few hot keys) vs uniform affects hit rate | Zipf patterns cache well |
| **Cache warming** | Pre-loading cache reduces cold-start misses | Warm on boot or deployment |
| **Key distribution** | Hot spots vs even distribution | Shard if necessary |

### Eviction Policies

| Policy | Description | Best For |
|--------|-------------|----------|
| **LRU** (Least Recently Used) | Evict least recently accessed | General purpose, temporal locality |
| **LFU** (Least Frequently Used) | Evict least frequently accessed | Frequency-based access patterns |
| **FIFO** (First In First Out) | Evict oldest entries | Simple, predictable behavior |
| **TTL** (Time to Live) | Evict after fixed time | Data freshness requirements |
| **Random** | Evict random entry | Uniform access, simplest implementation |
| **ARC** (Adaptive Replacement) | Self-tuning LRU/LFU hybrid | Variable access patterns |

## Architecture and Implementation

Cache hit rate monitoring architecture consists of three components: instrumentation (counting hits and misses at cache lookup points), aggregation (computing rates over time windows), and alerting (notifying when rates drop below thresholds).

The instrumentation layer wraps cache operations with counters that track hits and misses. In the BEAM ecosystem, this is typically implemented using `:telemetry` events emitted on each cache access, or atomic counters in ETS. The aggregation layer computes rates over sliding time windows (1 minute, 5 minutes, 1 hour) to smooth out temporary fluctuations. The alerting layer triggers notifications when the hit rate drops below configured thresholds, indicating potential issues such as cache eviction storms, working set changes, or cache invalidation bugs.

## Usage in Prismatic Platform

The Prismatic Platform tracks hit rates for ETS-based caches across all registries and lookup services.

```elixir
defmodule Prismatic.Cache.HitRateTracker do
  @moduledoc """
  Tracks and reports cache hit rates across platform
  caches. Provides real-time monitoring and alerting
  when hit rates drop below acceptable thresholds.
  """

  use GenServer

  @type cache_stats :: %{
    cache_name: atom(),
    hits: non_neg_integer(),
    misses: non_neg_integer(),
    hit_rate: float(),
    window_seconds: pos_integer()
  }

  @alert_threshold 0.80
  @check_interval_ms 60_000

  @spec record_hit(atom()) :: :ok
  def record_hit(cache_name) do
    :telemetry.execute(
      [:prismatic, :cache, :hit],
      %{count: 1},
      %{cache: cache_name}
    )
  end

  @spec record_miss(atom()) :: :ok
  def record_miss(cache_name) do
    :telemetry.execute(
      [:prismatic, :cache, :miss],
      %{count: 1},
      %{cache: cache_name}
    )
  end

  @spec get_stats(atom()) :: cache_stats()
  def get_stats(cache_name) do
    GenServer.call(__MODULE__, {:get_stats, cache_name})
  end

  @spec get_all_stats() :: list(cache_stats())
  def get_all_stats do
    GenServer.call(__MODULE__, :get_all_stats)
  end

  @impl GenServer
  def init(_opts) do
    :telemetry.attach_many(
      "cache-hit-rate-tracker",
      [[:prismatic, :cache, :hit], [:prismatic, :cache, :miss]],
      &handle_telemetry_event/4,
      %{}
    )

    schedule_check()
    {:ok, %{counters: %{}}}
  end

  @impl GenServer
  def handle_call({:get_stats, cache_name}, _from, state) do
    stats = compute_stats(cache_name, state.counters)
    {:reply, stats, state}
  end

  @impl GenServer
  def handle_call(:get_all_stats, _from, state) do
    all_stats =
      state.counters
      |> Map.keys()
      |> Enum.map(fn cache -> compute_stats(cache, state.counters) end)
      |> Enum.sort_by(& &1.hit_rate)

    {:reply, all_stats, state}
  end

  @impl GenServer
  def handle_info(:check_rates, state) do
    Enum.each(state.counters, fn {cache, _} ->
      stats = compute_stats(cache, state.counters)
      if stats.hit_rate < @alert_threshold and stats.hits + stats.misses > 100 do
        :telemetry.execute(
          [:prismatic, :cache, :low_hit_rate],
          %{hit_rate: stats.hit_rate},
          %{cache: cache, threshold: @alert_threshold}
        )
      end
    end)

    schedule_check()
    {:noreply, state}
  end

  defp compute_stats(cache_name, counters) do
    {hits, misses} = Map.get(counters, cache_name, {0, 0})
    total = hits + misses
    rate = if total > 0, do: hits / total, else: 0.0

    %{cache_name: cache_name, hits: hits, misses: misses, hit_rate: rate, window_seconds: 60}
  end

  defp handle_telemetry_event([:prismatic, :cache, :hit], _measurements, metadata, _config) do
    GenServer.cast(__MODULE__, {:hit, metadata.cache})
  end

  defp handle_telemetry_event([:prismatic, :cache, :miss], _measurements, metadata, _config) do
    GenServer.cast(__MODULE__, {:miss, metadata.cache})
  end

  defp schedule_check, do: Process.send_after(self(), :check_rates, @check_interval_ms)
end
```

The platform monitors hit rates for the OSINT ToolRegistry ETS cache (target >99%), the Academy TopicRegistry (target >99%), the DD SourceRegistry (target >99%), and the Meilisearch query cache (target >90%). When hit rates drop below thresholds, telemetry alerts are emitted and displayed on the platform administration dashboard.

## Cross-References

- [ETS Memory](/glossary/ets-memory/) -- ETS tables as primary cache storage
- [Execution Time](/glossary/execution-time/) -- Cache impact on operation timing
- [Performance](/glossary/performance/) -- Broader performance optimization
- [Telemetry](/glossary/telemetry/) -- Metric collection for hit rate tracking
- **Livebooks**: `performance_monitoring/` notebooks include cache analysis tools
- **Academy**: Performance topics cover caching strategies and hit rate optimization

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
