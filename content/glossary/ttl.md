+++
title = "TTL"
weight = 50
[extra]
description = "Time-To-Live value that defines the maximum lifespan of cached data, DNS records, or process state before automatic expiry"
category = "infrastructure"
related_terms = ["cache", "ets", "invalidation", "expiry"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TTL", "time to live", "cache expiry", "data lifecycle", "invalidation", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "TTL - Prismatic Platform"
+++

## Definition & Overview

Time-To-Live (TTL) is a mechanism that assigns a maximum lifespan to data, after which the data is considered stale and is either automatically removed or refreshed from its authoritative source. TTL is fundamental to caching systems, DNS resolution, network protocols, and any system where data freshness must be balanced against the cost of retrieving or recomputing it.

In caching, TTL prevents serving indefinitely stale data. When data is cached with a TTL of 300 seconds, any request arriving after 300 seconds will trigger a cache miss, forcing a fresh fetch from the origin. This simple mechanism provides eventual consistency without requiring complex invalidation protocols. The trade-off is straightforward: shorter TTLs ensure fresher data at the cost of more origin requests, while longer TTLs reduce origin load at the cost of serving potentially outdated information.

The Prismatic Platform uses TTL extensively across its multi-tier caching architecture. ETS-cached OSINT tool configurations have long TTLs (hours) since they rarely change. API response caches use moderate TTLs (minutes) to balance freshness with performance. DNS-based service discovery uses short TTLs (seconds) to react quickly to infrastructure changes. Each TTL value is carefully tuned to the data's volatility and the cost of staleness.

## Technical Deep Dive

The platform implements TTL-aware caching in ETS with automatic expiry via periodic sweep:

```elixir
defmodule PrismaticCache.TTLStore do
  @moduledoc """
  ETS-backed cache with TTL support. Entries automatically
  expire after their configured TTL via periodic sweep.
  """

  use GenServer

  @sweep_interval_ms 10_000
  @default_ttl_ms 300_000

  defstruct [:table, :sweep_ref]

  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl true
  def init(opts) do
    table_name = Keyword.fetch!(opts, :table)

    table = :ets.new(table_name, [
      :set, :named_table, :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    sweep_ref = schedule_sweep()
    {:ok, %__MODULE__{table: table, sweep_ref: sweep_ref}}
  end

  @spec put(atom(), term(), term(), pos_integer()) :: :ok
  def put(table, key, value, ttl_ms \\ @default_ttl_ms) do
    expires_at = System.monotonic_time(:millisecond) + ttl_ms
    :ets.insert(table, {key, value, expires_at})
    :ok
  end

  @spec get(atom(), term()) :: {:ok, term()} | :miss
  def get(table, key) do
    now = System.monotonic_time(:millisecond)

    case :ets.lookup(table, key) do
      [{^key, value, expires_at}] when expires_at > now ->
        {:ok, value}

      [{^key, _value, _expired}] ->
        :ets.delete(table, key)
        :miss

      [] ->
        :miss
    end
  end

  @spec get_or_fetch(atom(), term(), pos_integer(), (() -> {:ok, term()})) :: {:ok, term()}
  def get_or_fetch(table, key, ttl_ms, fetch_fn) do
    case get(table, key) do
      {:ok, value} ->
        {:ok, value}

      :miss ->
        case fetch_fn.() do
          {:ok, value} ->
            put(table, key, value, ttl_ms)
            {:ok, value}

          error ->
            error
        end
    end
  end

  @impl true
  def handle_info(:sweep, %{table: table} = state) do
    now = System.monotonic_time(:millisecond)
    expired_count = sweep_expired(table, now)

    if expired_count > 0 do
      :telemetry.execute(
        [:prismatic, :cache, :ttl, :sweep],
        %{expired_count: expired_count},
        %{table: table}
      )
    end

    sweep_ref = schedule_sweep()
    {:noreply, %{state | sweep_ref: sweep_ref}}
  end

  defp sweep_expired(table, now) do
    :ets.foldl(fn
      {key, _value, expires_at}, count when expires_at <= now ->
        :ets.delete(table, key)
        count + 1

      _, count ->
        count
    end, 0, table)
  end

  defp schedule_sweep do
    Process.send_after(self(), :sweep, @sweep_interval_ms)
  end
end
```

For layered caching with different TTLs per tier:

```elixir
defmodule PrismaticCache.Layered do
  @moduledoc """
  Multi-tier cache with different TTLs per layer.
  L1 (ETS, short TTL) -> L2 (Redis, medium TTL) -> Origin.
  """

  @l1_ttl_ms 30_000
  @l2_ttl_ms 300_000

  @spec get(String.t()) :: {:ok, term()} | {:error, :not_found}
  def get(key) do
    case PrismaticCache.TTLStore.get(:l1_cache, key) do
      {:ok, value} ->
        {:ok, value}

      :miss ->
        case redis_get(key) do
          {:ok, value} ->
            PrismaticCache.TTLStore.put(:l1_cache, key, value, @l1_ttl_ms)
            {:ok, value}

          :miss ->
            {:error, :not_found}
        end
    end
  end

  @spec put(String.t(), term()) :: :ok
  def put(key, value) do
    PrismaticCache.TTLStore.put(:l1_cache, key, value, @l1_ttl_ms)
    redis_set(key, value, @l2_ttl_ms)
    :ok
  end

  defp redis_get(key) do
    case Redix.command(:prismatic_redis, ["GET", key]) do
      {:ok, nil} -> :miss
      {:ok, value} -> {:ok, Jason.decode!(value)}
      _ -> :miss
    end
  end

  defp redis_set(key, value, ttl_ms) do
    Redix.command(:prismatic_redis, ["SET", key, Jason.encode!(value), "PX", ttl_ms])
  end
end
```

## Architecture & Implementation

TTL management in the platform follows domain-specific policies:

**OSINT Tool Registry**: Tool configurations loaded from `@after_compile` hooks are effectively permanent (no TTL) since they only change on redeployment. However, tool execution results are cached with source-specific TTLs. Czech ARES data changes infrequently (TTL: 24 hours), while Shodan scan results change frequently (TTL: 1 hour).

**API Gateway**: The PrismaticAPI on port 4004 caches endpoint discovery results with a 5-minute TTL. This prevents redundant module introspection while ensuring newly deployed modules are discovered within 5 minutes.

**DD Pipeline**: Fetch records from the DD Client are cached with group-specific TTLs matching the Scheduler's refresh intervals. Forbes data refreshes every 168 hours, Parliament data every 24 hours. The TTL ensures the cache aligns with the expected data freshness.

**Security Ratings**: Perimeter security ratings are cached with a 1-hour TTL. Active scans invalidate the cache immediately through explicit deletion rather than waiting for TTL expiry, providing fresh ratings after discovery operations.

## Usage in Prismatic Platform

The OSINT toolbox uses TTL-based caching to avoid redundant API calls to external providers:

```elixir
defmodule PrismaticOsintCore.ResultCache do
  @moduledoc """
  TTL-aware result caching for OSINT tool executions.
  Per-provider TTL configuration respects data volatility.
  """

  @provider_ttls %{
    "ares-lookup" => 86_400_000,
    "shodan-search" => 3_600_000,
    "virustotal-scan" => 1_800_000,
    "companies-house" => 43_200_000
  }

  @default_ttl_ms 3_600_000

  @spec cached_execute(String.t(), map(), (() -> {:ok, map()})) :: {:ok, map()}
  def cached_execute(tool_slug, params, execute_fn) do
    cache_key = build_key(tool_slug, params)
    ttl = Map.get(@provider_ttls, tool_slug, @default_ttl_ms)

    PrismaticCache.TTLStore.get_or_fetch(:osint_results, cache_key, ttl, execute_fn)
  end

  defp build_key(slug, params) do
    hash = :crypto.hash(:sha256, Jason.encode!(params)) |> Base.hex_encode32(case: :lower, padding: false)
    "#{slug}:#{hash}"
  end
end
```

## Cross-References

- [Cache](@/glossary/cache.md) - Storage layer using TTL
- [ETS](@/glossary/ets.md) - In-memory storage with TTL support
- **Write-Through** - Cache write pattern
- [Throttling](@/glossary/throttling.md) - Rate limiting using TTL windows
- **Warmup** - Cache pre-population strategy

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
