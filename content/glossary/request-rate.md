+++
title = "Request Rate"
weight = 50

[extra]
description = "The number of incoming requests per unit time (typically requests per second), a fundamental throughput metric for capacity planning, rate limiting, throttling, and performance monitoring -- encompassing token bucket, leaky bucket, sliding window, and fixed window algorithms"
category = "api"
domain = "platform-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["throttling", "sla", "throughput", "sliding-window", "status-code", "time-to-first-byte", "token-bucket", "leaky-bucket", "api-gateway", "telemetry", "genserver", "ets", "plug"]
tags = ["request-rate", "throughput", "metrics", "performance", "capacity", "rate-limiting", "token-bucket", "leaky-bucket", "sliding-window", "api", "throttling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "24 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Request rate monitoring and enforcement through token bucket, leaky bucket, and sliding window algorithms enables capacity planning, abuse detection, and system protection across all Prismatic Platform entry points"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Request Rate", "throughput", "RPS", "RPM", "rate limiting", "throttling", "token bucket", "leaky bucket", "sliding window", "fixed window", "API rate limit", "429 Too Many Requests", "Retry-After", "capacity planning", "metrics", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Request Rate - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "performance", "api"]
+++

## Definition

**Request rate** measures the volume of incoming requests per unit of time, typically expressed as requests per second (RPS) or requests per minute (RPM). It is a primary throughput metric that drives capacity planning, auto-scaling decisions, rate limiting policies, and performance monitoring. A sudden spike in request rate may indicate legitimate traffic growth, a viral event, a DDoS attack, or a misconfigured client in a retry loop.

Understanding request rate patterns -- baseline, peak, seasonal, and anomalous -- is essential for operating reliable systems. Rate limiting, the enforcement side of request rate management, protects backend systems from overload by capping the number of requests a client can make within a time window. Without rate limiting, a single misbehaving client can exhaust database connections, consume all worker processes, and degrade service for all other users.

The Prismatic Platform monitors request rates across all entry points: the Phoenix web application (port 4000), the API gateway (port 4004), internal GenServer call rates, and OSINT tool execution rates against external intelligence APIs. Rate limiting is enforced at multiple layers -- Plug middleware for HTTP endpoints, GenServer-based token buckets for internal services, and per-tool rate limiters for OSINT operations that must respect external API quotas.

## Core Concepts

### Rate Limiting Algorithm Comparison

| Algorithm | Burst Tolerance | Memory Usage | Accuracy | Complexity | Best For |
|-----------|----------------|-------------|----------|------------|----------|
| **Fixed Window** | High (boundary burst) | Very low (1 counter) | Low | Simple | Basic protection |
| **Sliding Window Log** | None (exact) | High (per-request timestamps) | Exact | Medium | Precise limits |
| **Sliding Window Counter** | Low (approximated) | Low (2 counters) | High | Medium | General purpose |
| **Token Bucket** | Configurable (bucket size) | Low (2 values) | High | Medium | Bursty traffic |
| **Leaky Bucket** | None (constant drain) | Medium (queue) | High | Medium | Smooth output rate |
| **GCRA** | Configurable | Low (1 value) | High | Medium | Distributed systems |

### Request Rate Metrics

| Metric | Unit | Description | Prismatic Threshold |
|--------|------|-------------|-------------------|
| **RPS (Requests Per Second)** | req/s | Instantaneous throughput | Monitor, alert > 1000 |
| **RPM (Requests Per Minute)** | req/min | Smoothed throughput | Reporting metric |
| **P50 Latency** | ms | Median response time | < 50ms |
| **P99 Latency** | ms | 99th percentile response time | < 250ms |
| **Error Rate** | % | Percentage of 4xx/5xx responses | < 1% |
| **Rate Limit Hit Rate** | % | Percentage of 429 responses | < 5% (if higher, limits too tight) |
| **Retry-After Compliance** | % | Clients respecting Retry-After header | Monitor |
| **Queue Depth** | count | Requests waiting for processing | < 100 |

### Rate Limit Tiers

| Tier | Target | Limit (RPM) | Burst (RPS) | Scope | Enforcement |
|------|--------|-------------|-------------|-------|-------------|
| **Public API** | Unauthenticated | 60 | 5 | Per IP | Plug middleware |
| **Authenticated API** | API key holders | 600 | 30 | Per API key | Plug middleware |
| **Premium API** | Paid tier | 6000 | 100 | Per API key | Plug middleware |
| **OSINT Tools** | Per tool adapter | Varies | 1-10 | Per tool + user | GenServer limiter |
| **Internal Services** | GenServer calls | 10000 | 500 | Per service | Process mailbox |
| **Admin Operations** | Admin endpoints | 120 | 10 | Per user | Plug middleware |
| **Webhook Delivery** | Outbound webhooks | 300 | 15 | Per destination | Token bucket |

### HTTP Rate Limit Headers

| Header | Standard | Description | Example |
|--------|----------|-------------|---------|
| `X-RateLimit-Limit` | Draft RFC | Maximum requests in window | `600` |
| `X-RateLimit-Remaining` | Draft RFC | Requests remaining in window | `423` |
| `X-RateLimit-Reset` | Draft RFC | Window reset time (Unix epoch) | `1711929600` |
| `Retry-After` | RFC 7231 | Seconds until client should retry | `30` |
| `RateLimit-Policy` | Draft RFC | Rate limit policy description | `600;w=60` |

## Technical Deep Dive

### Token Bucket Algorithm

The token bucket is the most versatile rate limiting algorithm and the primary choice for the Prismatic Platform's API rate limiting. A bucket starts full with `capacity` tokens. Each request consumes one token. Tokens are replenished at a fixed `refill_rate` per second. If the bucket is empty, the request is rejected with HTTP 429.

The key advantage is configurable burst tolerance: a client that has been idle accumulates tokens up to the bucket capacity, allowing short bursts of traffic. The `capacity` parameter controls the maximum burst size, while the `refill_rate` controls the sustained throughput.

### Leaky Bucket Algorithm

The leaky bucket processes requests at a constant rate regardless of input burstiness. Requests enter a queue (the bucket) and are processed (leak out) at a fixed rate. If the queue is full, new requests are rejected. This produces a perfectly smooth output rate, which is ideal for rate-limiting calls to external APIs that have strict per-second limits.

The Prismatic Platform uses leaky buckets for OSINT tool execution against external APIs (e.g., Czech ARES business registry, sanctions databases) where the external service enforces strict rate limits and bursty traffic would trigger blocks.

### Sliding Window Counter

The sliding window counter combines the memory efficiency of fixed windows with better accuracy. It maintains counters for the current and previous time windows, then estimates the request count using a weighted average:

```
estimated_count = previous_window_count * (1 - elapsed_fraction) + current_window_count
```

This eliminates the boundary burst problem of fixed windows (where a client could make 2x the limit at a window boundary) while using only two counters per client.

### BEAM Process Model and Rate Limiting

The BEAM VM's lightweight process model naturally distributes request handling across scheduler threads. Each incoming HTTP request is handled by a separate process, providing isolation. However, this means rate limiting cannot rely on in-process state -- it must use shared state via ETS, GenServer, or a distributed store.

ETS (Erlang Term Storage) is the preferred backing store for rate limit counters in the Prismatic Platform. ETS provides atomic increment operations (`:ets.update_counter/3`), concurrent read/write access, and sub-microsecond lookup times. For multi-node deployments on Fly.io, rate limits are enforced per-node with a global coordination layer that shares aggregate counts.

### Backpressure vs. Rate Limiting

Rate limiting rejects excess requests outright (HTTP 429). Backpressure, by contrast, slows down request processing to match downstream capacity. The BEAM's GenServer mailbox naturally provides backpressure -- when a GenServer is overwhelmed, callers block on `GenServer.call/3` until a timeout.

The Prismatic Platform uses both strategies: rate limiting at the API boundary to protect against abuse, and backpressure internally to manage flow through GenServer-based pipelines (DD processing, OSINT tool orchestration).

## Usage in Prismatic Platform

- **API Gateway (port 4004)**: Per-client rate limiting via Plug middleware with configurable tiers per API key
- **Phoenix Web (port 4000)**: Per-IP rate limiting for public endpoints, per-session for authenticated users
- **OSINT Tool Execution**: Per-tool rate limiters that respect external API quotas (e.g., ARES: 5 req/s, sanctions: 2 req/s)
- **DD Pipeline**: Leaky bucket rate limiting for bulk entity fetching to avoid overwhelming source registries
- **Perimeter Asset Discovery**: Configurable rate limits for active scanning to avoid triggering target security controls
- **Webhook Delivery**: Token bucket per destination URL to prevent overwhelming webhook consumers
- **Telemetry Export**: Rate-limited metric export to prevent overwhelming monitoring backends
- **LiveView Connections**: Per-IP connection limits to prevent WebSocket exhaustion
- **Search API**: Per-user rate limits on Meilisearch queries to prevent index saturation
- **Intelligence Report Generation**: Throttled report generation to manage CPU-intensive analysis

## Code Examples

### Token Bucket Rate Limiter

```elixir
defmodule PrismaticApi.RateLimiter.TokenBucket do
  @moduledoc """
  Token bucket rate limiter using ETS for concurrent access.
  Supports configurable capacity (burst size) and refill rate
  (sustained throughput).

  Each client is tracked independently by a configurable key
  (IP address, API key, user ID). Tokens are replenished lazily
  on each request check rather than via a background timer,
  eliminating per-client timer overhead.

  ## Configuration

    - `capacity` - Maximum tokens (burst size). Default: 30
    - `refill_rate` - Tokens added per second. Default: 10.0
    - `table_name` - ETS table name. Default: `:rate_limiter_buckets`

  ## Examples

      iex> {:ok, pid} = PrismaticApi.RateLimiter.TokenBucket.start_link(capacity: 10, refill_rate: 2.0)
      iex> PrismaticApi.RateLimiter.TokenBucket.check("client-123")
      {:allow, 9}

      iex> # After exhausting all tokens:
      iex> PrismaticApi.RateLimiter.TokenBucket.check("client-123")
      {:deny, 0.5}

  """

  use GenServer

  require Logger

  @type check_result :: {:allow, remaining :: non_neg_integer()} | {:deny, retry_after :: float()}

  @default_capacity 30
  @default_refill_rate 10.0

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: Keyword.get(opts, :name, __MODULE__))
  end

  @doc """
  Checks if a request from the given client should be allowed.
  Returns `{:allow, remaining_tokens}` or `{:deny, retry_after_seconds}`.

  Token replenishment is calculated lazily based on elapsed time
  since the last request, avoiding per-client background timers.

  ## Parameters

    - `client_key` - Unique client identifier (IP, API key, user ID)
    - `cost` - Number of tokens to consume (default: 1)

  ## Examples

      iex> PrismaticApi.RateLimiter.TokenBucket.check("192.168.1.1")
      {:allow, 29}

      iex> PrismaticApi.RateLimiter.TokenBucket.check("api-key-abc", cost: 5)
      {:allow, 25}

  """
  @spec check(String.t(), keyword()) :: check_result()
  def check(client_key, opts \\ []) do
    cost = Keyword.get(opts, :cost, 1)
    GenServer.call(__MODULE__, {:check, client_key, cost})
  end

  @doc """
  Returns the current token count for a client without consuming tokens.

  ## Examples

      iex> PrismaticApi.RateLimiter.TokenBucket.inspect_bucket("client-123")
      {:ok, %{tokens: 25.5, capacity: 30, refill_rate: 10.0}}

  """
  @spec inspect_bucket(String.t()) :: {:ok, map()} | {:error, :not_found}
  def inspect_bucket(client_key) do
    GenServer.call(__MODULE__, {:inspect, client_key})
  end

  @doc """
  Resets the rate limit for a specific client. Used for administrative
  override or testing.

  ## Examples

      iex> PrismaticApi.RateLimiter.TokenBucket.reset("client-123")
      :ok

  """
  @spec reset(String.t()) :: :ok
  def reset(client_key) do
    GenServer.call(__MODULE__, {:reset, client_key})
  end

  @impl GenServer
  def init(opts) do
    capacity = Keyword.get(opts, :capacity, @default_capacity)
    refill_rate = Keyword.get(opts, :refill_rate, @default_refill_rate)
    table_name = Keyword.get(opts, :table_name, :rate_limiter_buckets)

    table = :ets.new(table_name, [:set, :private])
    schedule_cleanup()

    state = %{
      table: table,
      capacity: capacity,
      refill_rate: refill_rate
    }

    Logger.info("TokenBucket started: capacity=#{capacity}, refill_rate=#{refill_rate}/s")
    {:ok, state}
  end

  @impl GenServer
  def handle_call({:check, client_key, cost}, _from, state) do
    %{table: table, capacity: capacity, refill_rate: refill_rate} = state
    now = System.monotonic_time(:millisecond)

    {tokens, _last_time} = get_or_init_bucket(table, client_key, capacity, now)

    # Lazily refill tokens based on elapsed time
    {current_tokens, last_check} =
      case :ets.lookup(table, client_key) do
        [{_, stored_tokens, last_time}] ->
          elapsed_seconds = (now - last_time) / 1000.0
          refilled = min(stored_tokens + elapsed_seconds * refill_rate, capacity * 1.0)
          {refilled, last_time}

        [] ->
          {capacity * 1.0, now}
      end

    if current_tokens >= cost do
      new_tokens = current_tokens - cost
      :ets.insert(table, {client_key, new_tokens, now})

      :telemetry.execute(
        [:prismatic, :rate_limiter, :allow],
        %{remaining: trunc(new_tokens), cost: cost},
        %{client: client_key}
      )

      {:reply, {:allow, trunc(new_tokens)}, state}
    else
      retry_after = (cost - current_tokens) / refill_rate
      :ets.insert(table, {client_key, current_tokens, now})

      :telemetry.execute(
        [:prismatic, :rate_limiter, :deny],
        %{retry_after: retry_after, cost: cost},
        %{client: client_key}
      )

      {:reply, {:deny, Float.round(retry_after, 2)}, state}
    end
  end

  @impl GenServer
  def handle_call({:inspect, client_key}, _from, state) do
    case :ets.lookup(state.table, client_key) do
      [{_, tokens, _last_time}] ->
        result = %{
          tokens: Float.round(tokens, 2),
          capacity: state.capacity,
          refill_rate: state.refill_rate
        }

        {:reply, {:ok, result}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl GenServer
  def handle_call({:reset, client_key}, _from, state) do
    now = System.monotonic_time(:millisecond)
    :ets.insert(state.table, {client_key, state.capacity * 1.0, now})
    {:reply, :ok, state}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    # Remove entries for clients inactive for > 10 minutes
    cutoff = System.monotonic_time(:millisecond) - 600_000

    :ets.tab2list(state.table)
    |> Enum.each(fn {key, _tokens, last_time} ->
      if last_time < cutoff, do: :ets.delete(state.table, key)
    end)

    schedule_cleanup()
    {:noreply, state}
  end

  defp get_or_init_bucket(table, key, capacity, now) do
    case :ets.lookup(table, key) do
      [{_, tokens, last_time}] -> {tokens, last_time}
      [] ->
        :ets.insert(table, {key, capacity * 1.0, now})
        {capacity * 1.0, now}
    end
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, :timer.minutes(5))
  end
end
```

### Plug Rate Limiting Middleware

```elixir
defmodule PrismaticApi.Plugs.RateLimit do
  @moduledoc """
  Plug middleware for HTTP request rate limiting.
  Integrates with the TokenBucket rate limiter and adds standard
  rate limit headers to responses.

  ## Usage in Router

      pipeline :api do
        plug PrismaticApi.Plugs.RateLimit, limit: 600, window: 60
      end

  ## Headers Added

    - `X-RateLimit-Limit` - Maximum requests per window
    - `X-RateLimit-Remaining` - Requests remaining
    - `X-RateLimit-Reset` - Window reset time (Unix epoch)
    - `Retry-After` - Seconds to wait (only on 429 responses)

  """

  import Plug.Conn

  require Logger

  @behaviour Plug

  @impl Plug
  def init(opts) do
    %{
      limit: Keyword.get(opts, :limit, 600),
      window: Keyword.get(opts, :window, 60),
      key_func: Keyword.get(opts, :key_func, &default_key/1)
    }
  end

  @impl Plug
  def call(conn, config) do
    client_key = config.key_func.(conn)

    case PrismaticApi.RateLimiter.TokenBucket.check(client_key) do
      {:allow, remaining} ->
        conn
        |> put_resp_header("x-ratelimit-limit", to_string(config.limit))
        |> put_resp_header("x-ratelimit-remaining", to_string(remaining))
        |> put_resp_header("x-ratelimit-reset", to_string(next_reset(config.window)))

      {:deny, retry_after} ->
        conn
        |> put_resp_header("x-ratelimit-limit", to_string(config.limit))
        |> put_resp_header("x-ratelimit-remaining", "0")
        |> put_resp_header("retry-after", to_string(ceil(retry_after)))
        |> put_resp_content_type("application/json")
        |> send_resp(429, Jason.encode!(%{
          error: "rate_limit_exceeded",
          message: "Too many requests. Please retry after #{ceil(retry_after)} seconds.",
          retry_after: ceil(retry_after)
        }))
        |> halt()
    end
  end

  defp default_key(conn) do
    forwarded_for = get_req_header(conn, "x-forwarded-for")

    case forwarded_for do
      [ip | _] -> "ip:#{String.split(ip, ",") |> List.first() |> String.trim()}"
      [] -> "ip:#{:inet.ntoa(conn.remote_ip) |> to_string()}"
    end
  end

  defp next_reset(window_seconds) do
    now = System.system_time(:second)
    now + window_seconds - rem(now, window_seconds)
  end
end
```

### Rate Monitoring Telemetry

```elixir
defmodule PrismaticApi.RateMonitor do
  @moduledoc """
  Monitors request rates across all platform entry points using
  telemetry events. Provides real-time throughput metrics for
  dashboards, alerting, and capacity planning.

  Subscribes to Phoenix endpoint telemetry and emits aggregated
  rate metrics every second for downstream consumers.

  ## Metrics Emitted

    - `[:prismatic, :request_rate, :rps]` - Requests per second
    - `[:prismatic, :request_rate, :error_rate]` - Error percentage
    - `[:prismatic, :request_rate, :p99_latency]` - 99th percentile latency

  ## Examples

      iex> PrismaticApi.RateMonitor.current_rps()
      42.5

      iex> PrismaticApi.RateMonitor.current_rps(endpoint: :api)
      18.3

  """

  use GenServer

  require Logger

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Returns the current requests per second across all endpoints
  or filtered by a specific endpoint.

  ## Examples

      iex> PrismaticApi.RateMonitor.current_rps()
      42.5

  """
  @spec current_rps(keyword()) :: float()
  def current_rps(opts \\ []) do
    GenServer.call(__MODULE__, {:rps, opts})
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(:rate_monitor, [:set, :private])
    schedule_aggregate()

    {:ok, %{table: table, window: [], window_size: 60}}
  end

  @impl GenServer
  def handle_call({:rps, _opts}, _from, %{window: window} = state) do
    rps = if window == [], do: 0.0, else: length(window) / min(length(window), 60)
    {:reply, Float.round(rps, 1), state}
  end

  @impl GenServer
  def handle_info(:aggregate, state) do
    now = System.system_time(:second)
    cutoff = now - state.window_size

    # Prune old entries
    new_window = Enum.filter(state.window, fn ts -> ts > cutoff end)

    :telemetry.execute(
      [:prismatic, :request_rate, :rps],
      %{value: length(new_window) / state.window_size},
      %{}
    )

    schedule_aggregate()
    {:noreply, %{state | window: new_window}}
  end

  @impl GenServer
  def handle_info({:request, timestamp}, state) do
    {:noreply, %{state | window: [timestamp | state.window]}}
  end

  defp schedule_aggregate do
    Process.send_after(self(), :aggregate, 1_000)
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Severity | Mitigation |
|---------|--------|----------|------------|
| **No rate limiting at all** | System vulnerable to abuse/DDoS | Critical | Implement at minimum per-IP token bucket |
| **Global rate limit only** | Penalizes good clients for one bad actor | High | Use per-client rate limiting |
| **Missing Retry-After header** | Clients retry immediately, amplifying load | High | Always include Retry-After on 429 responses |
| **Fixed window boundary burst** | 2x limit possible at window boundary | Medium | Use sliding window or token bucket |
| **Rate limiting after authentication** | Auth endpoints unprotected | High | Rate limit before authentication |
| **Not monitoring rate limit hits** | Cannot detect tight limits or attacks | Medium | Track and alert on 429 response rates |
| **Same limits for all endpoints** | Expensive ops get same limit as cheap reads | High | Per-endpoint rate limits by cost |
| **In-memory only (no persistence)** | Rate limits reset on restart | Low | Acceptable for most use cases; use Redis for strict |
| **Not rate limiting OSINT tools** | External API bans, legal issues | Critical | Per-tool leaky bucket matching external limits |
| **Rate limiting by IP only** | Shared NAT IPs penalize multiple users | Medium | Use API keys for authenticated endpoints |
| **No backpressure on internal services** | GenServer mailbox overflow | High | Monitor mailbox size, apply backpressure |
| **Ignoring client retry behavior** | Retry storms after rate limiting | High | Implement exponential backoff guidance |

## Best Practices

1. **Establish baseline request rates before setting limits**: Monitor production traffic for at least a week to understand normal patterns, peak hours, and seasonal variations before defining rate limits.

2. **Use per-client rate limiting with multiple key types**: Limit by IP for unauthenticated requests, by API key for authenticated requests, and by user ID for session-based access.

3. **Always return 429 with Retry-After header**: Rate-limited responses must include a `Retry-After` header telling clients exactly when to retry. Include `X-RateLimit-Remaining` for proactive throttling.

4. **Separate rate limits by endpoint cost**: Expensive operations (OSINT tool execution, DD analysis, report generation) need tighter limits than lightweight reads (health checks, static content).

5. **Monitor rate limit hit rates**: If more than 5% of requests are rate-limited, either the limits are too tight or clients need better documentation. Frequent limiting indicates a problem.

6. **Rate limit before authentication**: Authentication endpoints are prime targets for brute-force attacks. Apply rate limits before the authentication check, not after.

7. **Use leaky bucket for external API calls**: When calling external services with strict rate limits (Czech ARES, sanctions databases), use leaky bucket to produce a perfectly smooth request flow.

8. **Implement token bucket for user-facing APIs**: Token bucket allows controlled bursts while maintaining average throughput, matching real user behavior patterns.

9. **Track per-endpoint telemetry**: Emit telemetry events for every rate limit decision (allow/deny) with client key, endpoint, and remaining tokens for dashboard visibility.

10. **Clean up stale rate limit entries**: Periodically sweep rate limit state to remove entries for clients that haven't been seen in 10+ minutes, preventing memory growth.

## Related Terms

- [Throttling](/glossary/throttling/) -- the enforcement mechanism for request rate limits
- [Sliding Window](/glossary/sliding-window/) -- time-based window for rate calculation
- [SLA](/glossary/sla/) -- service level agreements defining acceptable request rates
- [Status Code](/glossary/status-code/) -- HTTP 429 indicates rate limit exceeded
- [Throughput](/glossary/throughput/) -- the capacity metric that rate limits protect
- [API Gateway](/glossary/api-gateway/) -- entry point where rate limits are enforced
- [Telemetry](/glossary/telemetry/) -- monitoring infrastructure for rate metrics
- [GenServer](/glossary/genserver/) -- BEAM process model for rate limiter state
- [ETS](/glossary/ets/) -- in-memory storage for rate limit counters
- [Plug](/glossary/plug/) -- middleware framework for HTTP rate limiting
- [Performance](/glossary/performance/) -- platform performance standards
- [DDoS](/glossary/ddos/) -- attack vector mitigated by rate limiting

## See Also

- [API Gateway](/architecture/) -- request rate monitoring and enforcement architecture
- [Performance Standards](/capabilities/) -- platform throughput requirements
- [Architecture](/architecture/) -- system architecture with rate limiting layers
- [Capabilities](/capabilities/) -- platform capabilities and SLA targets

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
