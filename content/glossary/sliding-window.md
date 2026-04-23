+++
title = "Sliding Window"
weight = 50
[extra]
description = "Rate limiting and time-series analysis algorithm that tracks events within a continuously moving time frame"
category = "algorithms"
related_terms = ["rate-limiting", "throttling", "ets", "genserver", "telemetry", "sla", "monitoring"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["sliding window", "rate limiting", "algorithm", "time series", "glossary", "Prismatic Platform"]
tags = ["glossary", "algorithms", "rate-limiting"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Sliding Window - Prismatic Platform"
+++

## Definition & Overview

A sliding window is an algorithm that maintains a moving reference frame over a stream of events, counting or analyzing only those events that fall within the current window boundaries. Unlike fixed windows that reset at predetermined intervals (e.g., every minute on the clock), sliding windows continuously advance with time, providing a smooth, gap-free view of event rates. This eliminates the boundary effects that plague fixed-window approaches, where a burst of events straddling a window boundary might be undercounted.

The sliding window pattern appears in two primary contexts. In rate limiting, it restricts the number of operations a client can perform within any rolling time period (e.g., "100 API requests per 60-second rolling window"). In time-series analysis, it computes aggregate statistics (mean, percentile, sum) over a continuously shifting time range. Both applications share the same core mechanism: maintaining an ordered collection of timestamped events and efficiently evicting entries that have aged out of the window.

In the Prismatic Platform, sliding windows are the foundation of API rate limiting, SLA metric calculation, and anomaly detection. The OSINT toolbox uses sliding windows to enforce per-tool rate limits (preventing abuse of external APIs). The SLA tracker uses sliding windows to compute P95 latency over rolling hourly periods. The security monitoring system uses sliding windows to detect brute-force attacks by counting authentication failures over short time frames.

## Technical Deep Dive

### ETS-Based Sliding Window

The platform implements sliding windows using ordered ETS tables, which provide O(log n) range operations:

```elixir
defmodule PrismaticRateLimit.SlidingWindow do
  @moduledoc """
  ETS-backed sliding window rate limiter.
  Uses ordered_set ETS tables for efficient range queries.
  """

  @type window_key :: {String.t(), atom()}

  @spec check(window_key(), pos_integer(), pos_integer()) :: :ok | {:error, :rate_limited, pos_integer()}
  def check(key, max_requests, window_ms) do
    table = ensure_table()
    now = System.system_time(:millisecond)
    window_start = now - window_ms

    # Evict expired entries
    evict_before(table, key, window_start)

    # Count current window entries
    count = count_in_window(table, key, window_start, now)

    if count < max_requests do
      # Record this request
      :ets.insert(table, {{key, now, :erlang.unique_integer([:monotonic])}, true})
      :ok
    else
      # Calculate retry-after from oldest entry in window
      oldest = oldest_in_window(table, key, window_start)
      retry_after = oldest + window_ms - now
      {:error, :rate_limited, max(0, retry_after)}
    end
  end

  defp ensure_table do
    case :ets.whereis(:sliding_window_limiter) do
      :undefined ->
        :ets.new(:sliding_window_limiter, [
          :named_table,
          :ordered_set,
          :public,
          write_concurrency: true
        ])
      tid -> tid
    end
  end

  defp evict_before(table, key, cutoff) do
    match_spec = [{{{key, :"$1", :_}, :_}, [{:<, :"$1", cutoff}], [true]}]
    :ets.select_delete(table, match_spec)
  end

  defp count_in_window(table, key, from, to) do
    match_spec = [{{{key, :"$1", :_}, :_}, [{:>=, :"$1", from}, {:"=<", :"$1", to}], [true]}]
    :ets.select_count(table, match_spec)
  end

  defp oldest_in_window(table, key, from) do
    case :ets.select(table, [{{{key, :"$1", :_}, :_}, [{:>=, :"$1", from}], [:"$1"]}], 1) do
      {[timestamp], _} -> timestamp
      _ -> System.system_time(:millisecond)
    end
  end
end
```

### Sliding Window for Metrics Aggregation

For SLA tracking, the platform uses sliding windows to compute rolling percentiles:

```elixir
defmodule PrismaticMonitoring.SlidingMetrics do
  @moduledoc """
  Computes rolling statistical aggregates over sliding time windows.
  Used for SLA compliance tracking and anomaly detection.
  """

  @table :sliding_metrics

  @spec record(atom(), number()) :: :ok
  def record(metric_name, value) do
    now = System.system_time(:millisecond)
    :ets.insert(@table, {{metric_name, now, :erlang.unique_integer()}, value})
    :ok
  end

  @spec percentile(atom(), pos_integer(), float()) :: number() | nil
  def percentile(metric_name, window_ms, p) when p > 0 and p <= 100 do
    now = System.system_time(:millisecond)
    from = now - window_ms

    values =
      :ets.select(@table, [
        {{{metric_name, :"$1", :_}, :"$2"},
         [{:>=, :"$1", from}, {:"=<", :"$1", now}],
         [:"$2"]}
      ])
      |> Enum.sort()

    case values do
      [] -> nil
      sorted ->
        index = ceil(length(sorted) * p / 100) - 1
        Enum.at(sorted, max(0, index))
    end
  end

  @spec average(atom(), pos_integer()) :: number() | nil
  def average(metric_name, window_ms) do
    now = System.system_time(:millisecond)
    from = now - window_ms

    values =
      :ets.select(@table, [
        {{{metric_name, :"$1", :_}, :"$2"},
         [{:>=, :"$1", from}, {:"=<", :"$1", now}],
         [:"$2"]}
      ])

    case values do
      [] -> nil
      vals -> Enum.sum(vals) / length(vals)
    end
  end

  @spec count(atom(), pos_integer()) :: non_neg_integer()
  def count(metric_name, window_ms) do
    now = System.system_time(:millisecond)
    from = now - window_ms

    :ets.select_count(@table, [
      {{{metric_name, :"$1", :_}, :_},
       [{:>=, :"$1", from}, {:"=<", :"$1", now}],
       [true]}
    ])
  end
end
```

### OSINT Tool Rate Limiting

The OSINT toolbox applies per-tool rate limits to protect external API quotas:

```elixir
defmodule PrismaticOsintCore.RateLimiter do
  @moduledoc """
  Enforces per-tool rate limits using sliding windows.
  Each OSINT tool declares its rate limit in tool config.
  """

  alias PrismaticRateLimit.SlidingWindow

  @spec allow?(map(), String.t()) :: :ok | {:error, :rate_limited, pos_integer()}
  def allow?(tool_config, user_id) do
    key = {tool_config.slug, user_id}
    {max_requests, window_ms} = rate_limit_for(tool_config)
    SlidingWindow.check(key, max_requests, window_ms)
  end

  defp rate_limit_for(%{rate_limit: %{requests: r, window_seconds: w}}) do
    {r, w * 1_000}
  end

  defp rate_limit_for(%{requires_auth: true}) do
    {60, 60_000}
  end

  defp rate_limit_for(_) do
    {30, 60_000}
  end
end
```

## Architecture & Implementation

The sliding window implementation uses ETS ordered sets as the primary data structure. Ordered sets maintain entries sorted by key, enabling efficient range queries through `select/2` with guard-based filtering. The composite key `{identifier, timestamp, unique_integer}` ensures unique entries even for simultaneous events while maintaining chronological ordering.

Memory management uses lazy eviction: expired entries are cleaned up during the next `check/3` call rather than requiring a background sweeper. For high-throughput scenarios, a periodic GenServer sweeper supplements lazy eviction to prevent unbounded table growth during quiet periods.

The platform's sliding window implementation avoids the common pitfall of the "split window" approximation used by many rate limiters. Some implementations estimate the count by weighting the previous fixed window, introducing inaccuracy. The Prismatic implementation tracks individual events precisely, accepting slightly higher memory cost for exact counting.

## Usage in Prismatic Platform

Sliding windows appear throughout the platform's operational infrastructure. The API gateway uses them for per-client rate limiting. The OSINT toolbox uses them for per-tool quotas. The SLA tracker uses them for rolling metric computation. The security monitoring uses them for attack pattern detection.

```elixir
# Rate limit check for OSINT tool execution
case PrismaticOsintCore.RateLimiter.allow?(tool_config, user_id) do
  :ok -> execute_tool(tool_config, params)
  {:error, :rate_limited, retry_after_ms} ->
    {:error, "Rate limited. Retry after #{div(retry_after_ms, 1000)} seconds."}
end

# SLA compliance: P95 latency over last hour
p95 = PrismaticMonitoring.SlidingMetrics.percentile(:page_load, 3_600_000, 95.0)
```

## Cross-References

- [Rate Limiting](@/glossary/rate-limiting.md) - Primary use case for sliding window algorithms
- [ETS](@/glossary/ets.md) - Storage backend for high-performance sliding windows
- [SLA](@/glossary/sla.md) - Service agreements enforced via sliding window metrics
- [Telemetry](@/glossary/telemetry.md) - Event system feeding sliding window metrics

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
