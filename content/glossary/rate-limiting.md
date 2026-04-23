+++
title = "Rate Limiting"
weight = 40
[extra]
category = "security"
description = "Technique controlling the frequency of requests to prevent abuse and ensure fair resource usage"
related_terms = ["api-gateway", "rest-api", "load-balancing", "circuit-breaker", "backpressure", "plug", "shodan"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1068
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Rate", "Limiting", "Technique", "glossary", "security", "Prismatic Platform", "API Gateway"]
tags = ["glossary", "security", "rate-limiting", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Rate Limiting - Prismatic Platform"
+++

## Definition

Rate limiting is a technique that controls the number of requests a client can make to a service within a defined time window. It serves as a critical defense mechanism against abuse, denial-of-service attacks, resource exhaustion, and unfair resource monopolization by individual clients. By enforcing request quotas, rate limiting ensures that no single client can overwhelm the system, preserving service availability and fairness for all users.

Rate limiting operates on a fundamentally different principle than [load balancing](@/glossary/load-balancing.md) and [backpressure](@/glossary/backpressure.md), though all three manage traffic flow. Load balancing distributes traffic across multiple servers to maximize throughput. Backpressure propagates flow control signals upstream to slow producers when consumers are overwhelmed. Rate limiting, by contrast, enforces hard ceilings on request frequency regardless of available capacity -- even if the system could handle more requests, the limit is enforced to prevent abuse and ensure fairness.

In API-centric architectures, rate limiting is typically enforced at the [API Gateway](@/glossary/api-gateway.md) level, where it can be applied consistently across all endpoints before requests reach backend services. This centralized enforcement prevents rate limit bypass through direct backend access and ensures that all clients, whether human users, automated scripts, or third-party integrations, are subject to the same policies.

## Rate Limiting Algorithms

Several algorithms exist for implementing rate limiting, each with different characteristics regarding burst handling, memory efficiency, and fairness:

### Token Bucket

The token bucket algorithm maintains a bucket with a fixed capacity that refills at a constant rate. Each request consumes one token. If the bucket is empty, the request is rejected. This algorithm naturally allows short bursts up to the bucket capacity while enforcing a sustained rate.

| Property | Value |
|----------|-------|
| **Burst handling** | Allows bursts up to bucket capacity |
| **Sustained rate** | Enforced by refill rate |
| **Memory per client** | O(1) -- counter + timestamp |
| **Fairness** | Good (refill is constant regardless of usage) |
| **Prismatic usage** | Primary algorithm for API gateway |

```elixir
# Token bucket implementation
defmodule PrismaticWeb.RateLimiter.TokenBucket do
  @moduledoc "Token bucket rate limiter with ETS-backed state"

  @type bucket :: %{
    tokens: float(),
    last_refill: integer(),
    capacity: pos_integer(),
    refill_rate: float()
  }

  @doc "Check if a request is allowed and consume a token"
  @spec check_rate(String.t(), pos_integer(), float()) ::
    {:allow, remaining :: non_neg_integer()} | {:deny, retry_after :: pos_integer()}
  def check_rate(client_id, capacity, refill_rate_per_second) do
    now = System.monotonic_time(:millisecond)

    case :ets.lookup(:rate_limiter_buckets, client_id) do
      [{^client_id, tokens, last_refill}] ->
        elapsed = (now - last_refill) / 1_000
        new_tokens = min(capacity, tokens + elapsed * refill_rate_per_second)

        if new_tokens >= 1.0 do
          :ets.insert(:rate_limiter_buckets, {client_id, new_tokens - 1.0, now})
          {:allow, trunc(new_tokens - 1.0)}
        else
          retry_after = trunc((1.0 - new_tokens) / refill_rate_per_second * 1_000)
          {:deny, retry_after}
        end

      [] ->
        :ets.insert(:rate_limiter_buckets, {client_id, capacity - 1.0, now})
        {:allow, capacity - 1}
    end
  end
end
```

### Sliding Window Log

The sliding window log algorithm maintains a timestamped log of recent requests. When a new request arrives, expired entries are removed, and the request is allowed if the log size is below the limit. This provides precise rate limiting but requires more memory.

| Property | Value |
|----------|-------|
| **Burst handling** | No burst allowance (strict window) |
| **Precision** | Exact (no boundary effects) |
| **Memory per client** | O(n) where n = limit (stores timestamps) |
| **Fairness** | Excellent (precise per-window enforcement) |
| **Prismatic usage** | Used for high-security endpoints |

### Sliding Window Counter

A hybrid approach combining fixed window counters with interpolation to approximate a sliding window. It uses two fixed window counters (current and previous) and interpolates based on the current position within the window.

| Property | Value |
|----------|-------|
| **Burst handling** | Limited (smoothed by interpolation) |
| **Precision** | Approximate (good enough for most use cases) |
| **Memory per client** | O(1) -- two counters + timestamps |
| **Fairness** | Good (eliminates fixed window boundary spikes) |
| **Prismatic usage** | Used for general API endpoints |

### Algorithm Comparison

| Algorithm | Memory | Precision | Burst | Complexity | Best For |
|-----------|--------|-----------|-------|------------|----------|
| **Token Bucket** | O(1) | Good | Allows controlled bursts | Low | General purpose, API gateway |
| **Sliding Window Log** | O(n) | Exact | No bursts | Medium | High-security, audit-sensitive |
| **Sliding Window Counter** | O(1) | Approximate | Limited | Low | High-throughput APIs |
| **Fixed Window** | O(1) | Low (boundary issues) | Allows 2x burst at boundary | Lowest | Simple use cases only |
| **Leaky Bucket** | O(1) | Good | Smooths all bursts | Low | Queue-based systems |

## Multi-Level Enforcement

The Prismatic Platform implements rate limiting at multiple levels, each protecting a different boundary:

| Level | Scope | Limit Example | Purpose |
|-------|-------|---------------|---------|
| **API Gateway** | Per-client, per-endpoint | 100 req/min, 5000 req/hr | Protect backend services |
| **Per-User** | Per authenticated user | 1000 req/hr across all endpoints | Fair usage enforcement |
| **Per-Endpoint** | Per specific API route | POST /scans: 10 req/hr | Protect expensive operations |
| **Per-Role** | Per [RBAC](@/glossary/rbac.md) role | Admin: 10000/hr, Viewer: 1000/hr | Tiered access |
| **External API** | Per third-party provider | [Shodan](@/glossary/shodan.md): calibrated to tier | Respect provider quotas |
| **OSINT Pipeline** | Per data source in Broadway | Configured per provider | Prevent API ban |
| **Global** | System-wide safety limit | 50000 req/min total | System protection |

```elixir
# Multi-level rate limiting plug
defmodule PrismaticWeb.Plugs.RateLimiter do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, opts) do
    client_id = extract_client_id(conn, opts[:by])

    limits = opts[:limits] || default_limits()

    case check_all_limits(client_id, limits) do
      {:allow, remaining} ->
        conn
        |> put_resp_header("x-ratelimit-remaining", to_string(remaining))
        |> put_resp_header("x-ratelimit-limit", to_string(hd(limits) |> elem(2)))

      {:deny, retry_after} ->
        conn
        |> put_resp_header("retry-after", to_string(div(retry_after, 1000)))
        |> put_resp_header("x-ratelimit-remaining", "0")
        |> put_status(429)
        |> Phoenix.Controller.json(%{
          error: "Rate limit exceeded",
          retry_after_ms: retry_after
        })
        |> halt()
    end
  end

  defp extract_client_id(conn, :token_sub) do
    case conn.assigns[:current_user] do
      %{id: id} -> "user:#{id}"
      _ -> conn.remote_ip |> :inet.ntoa() |> to_string()
    end
  end

  defp extract_client_id(conn, :ip) do
    conn.remote_ip |> :inet.ntoa() |> to_string()
  end

  defp default_limits do
    [{60, :second, 100}, {3600, :second, 5000}]
  end
end
```

## Response Headers

Rate-limited APIs communicate quota status through standardized HTTP response headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window | `100` |
| `X-RateLimit-Remaining` | Requests remaining in the current window | `42` |
| `X-RateLimit-Reset` | Unix timestamp when the window resets | `1706745600` |
| `Retry-After` | Seconds to wait before retrying (on 429) | `30` |

The HTTP 429 (Too Many Requests) status code indicates that rate limiting has been applied. Well-behaved clients should check the `Retry-After` header and implement exponential backoff rather than immediately retrying.

## External API Rate Limiting

The Prismatic Platform manages rate limits for external OSINT data sources used in the [EASM](@/glossary/easm.md) pipeline. Each provider has different quotas, and exceeding them can result in temporary or permanent API key revocation:

| Provider | Rate Limit | Algorithm | Prismatic Strategy |
|----------|-----------|-----------|-------------------|
| **[Shodan](@/glossary/shodan.md)** | 1 req/sec (free), varies by tier | Token bucket | Calibrated to subscription tier |
| **[Censys](@/glossary/censys.md)** | Varies by tier (0.4-10 req/sec) | Sliding window | Conservative with retry backoff |
| **[GreyNoise](@/glossary/greynoise.md)** | 100 req/day (community), varies | Token bucket | Bulk lookups to minimize requests |
| **Certificate Transparency** | Varies by log operator | Per-log limiting | Round-robin across CT logs |
| **DNS resolvers** | Provider-dependent | Leaky bucket | Distributed across resolvers |

```elixir
# External API rate limiter with provider-specific configuration
defmodule PrismaticPerimeter.RateLimiter.External do
  @moduledoc "Rate limiter for external OSINT API integrations"

  @provider_limits %{
    shodan: {1, :second},        # 1 request per second
    censys: {2, :second},        # 2 requests per second
    greynoise: {100, :day},      # 100 requests per day (community)
    virustotal: {4, :minute}     # 4 requests per minute (free)
  }

  @spec with_rate_limit(atom(), (-> result)) :: result when result: term()
  def with_rate_limit(provider, fun) do
    {limit, window} = Map.fetch!(@provider_limits, provider)

    case TokenBucket.check_rate("external:#{provider}", limit, rate_per_second(limit, window)) do
      {:allow, _remaining} ->
        fun.()

      {:deny, retry_after} ->
        Process.sleep(retry_after)
        with_rate_limit(provider, fun)
    end
  end
end
```

## Context in Prismatic

The Prismatic Platform implements rate limiting at multiple levels through the Plug middleware system. The [API Gateway](@/glossary/api-gateway.md) enforces per-client request limits through `PrismaticWeb.Plugs.RateLimiter`, protecting backend services from excessive load. External OSINT API integrations ([Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), [GreyNoise](@/glossary/greynoise.md)) use provider-specific rate limiters to respect quotas. [Broadway](@/glossary/broadway.md) pipelines use [backpressure](@/glossary/backpressure.md)-aware rate limiting to control throughput in data processing operations.

The Hammer library provides the underlying rate limiting implementation with ETS-backed state for single-node deployments and pluggable backends (Redis, Mnesia) for distributed configurations. This aligns with the platform's pattern of using ETS for development and distributed backends for production.

## Integration with Other Patterns

Rate limiting works in concert with several other traffic management patterns:

| Pattern | Relationship | Combined Behavior |
|---------|-------------|-------------------|
| **[Circuit Breaker](@/glossary/circuit-breaker.md)** | Complementary | Rate limit prevents overload; circuit breaker handles failures |
| **[Backpressure](@/glossary/backpressure.md)** | Layered | Rate limit at edges; backpressure within pipelines |
| **[Load Balancing](@/glossary/load-balancing.md)** | Complementary | Load balancer distributes; rate limiter caps per-client |
| **Retry with Backoff** | Client-side | Rate limit enforces server policy; client respects it |
| **Bulkhead Isolation** | Complementary | Rate limit per-client; bulkhead per-resource pool |

## Related Terms

- [API Gateway](@/glossary/api-gateway.md) - Primary enforcement point for API rate limits
- [REST API](@/glossary/rest-api.md) - HTTP interface protected by rate limiting
- [Load Balancing](@/glossary/load-balancing.md) - Complementary traffic distribution technique
- [Backpressure](@/glossary/backpressure.md) - Internal flow control coordinating with rate limits
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Failure-triggered traffic halt complementing rate limits
- [Plug](@/glossary/plug.md) - Elixir middleware implementing rate limit enforcement
- [Shodan](@/glossary/shodan.md) - External API with provider-specific rate limits
- [Censys](@/glossary/censys.md) - External API with tier-based rate limits
- [RBAC](@/glossary/rbac.md) - Per-role rate limit tiers
- [Observability](@/glossary/observability.md) - Monitoring rate limit metrics and rejections

## See Also

- [Architecture](@/architecture/_index.md) - Traffic management architecture
- [Apps](@/apps/_index.md) - Prismatic API gateway application
- [Technologies](@/technologies/_index.md) - Hammer library and rate limiting infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)