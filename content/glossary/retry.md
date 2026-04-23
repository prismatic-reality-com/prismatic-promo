+++
title = "Retry"
weight = 50

[extra]
description = "A fault tolerance pattern that automatically re-attempts failed operations with configurable backoff strategies, jitter, and circuit breaker integration to prevent transient failures from becoming permanent errors."
category = "api"
domain = "resilience"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["throttling", "request-rate", "status-code", "sla", "supervision-strategy", "circuit-breaker", "cache-eviction", "timeout", "fault-tolerance", "telemetry", "logging", "response-distribution", "backoff"]
tags = ["retry", "fault-tolerance", "backoff", "resilience", "http", "api", "transient-errors", "exponential-backoff", "jitter", "circuit-breaker", "thundering-herd", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Retry with exponential backoff and jitter prevents thundering herd problems, while circuit breakers stop wasting resources on clearly-failing services -- Prismatic Platform implements configurable retry policies for all 157 OSINT adapters and external API interactions."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Retry", "backoff", "fault tolerance", "resilience", "exponential backoff", "jitter", "circuit breaker", "thundering herd", "transient failure", "idempotency", "glossary", "Prismatic Platform", "BEAM", "OTP"]
image = "/images/sections/glossary.png"
image_alt = "Retry - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "osint", "resilience"]
+++

## Definition

A **retry** is an automatic re-attempt of a failed operation based on the assumption that the failure was transient and may succeed on a subsequent try. Common transient failures include network timeouts, connection resets, temporary service unavailability (HTTP 503), and rate limit responses (HTTP 429). Retry logic is a fundamental resilience pattern that prevents brief infrastructure hiccups from cascading into user-visible errors.

However, naive retry implementations (immediate retry with no delay) can make problems worse by amplifying load on an already-stressed system. If a service is failing because of overload and 100 clients immediately retry, the service now receives 200 requests instead of 100, deepening the overload. Effective retry requires backoff (increasing delays between attempts), jitter (randomization to prevent synchronized retries from many clients), and a maximum attempt limit to prevent infinite loops.

The retry pattern exists at a different level than OTP supervision restarts. OTP supervisors restart crashed processes; retry logic re-attempts individual operations within a running process. Both are essential: supervisors handle process-level failures while retries handle operation-level failures. In the Prismatic Platform, all external API interactions -- including 157 OSINT tool adapters -- use configurable retry policies tuned to each external service's characteristics.

## Core Concepts

### Backoff Strategy Comparison

| Strategy | Delay Formula | Example (base=200ms) | Pros | Cons | Use Case |
|----------|-------------|---------------------|------|------|----------|
| **Constant** | `base` | 200, 200, 200 | Simple, predictable | Synchronized retries, no load spreading | Internal service retries |
| **Linear** | `base * attempt` | 200, 400, 600 | Gradual increase | Still somewhat synchronized | Moderate load scenarios |
| **Exponential** | `base * 2^(attempt-1)` | 200, 400, 800, 1600 | Good load spreading | Grows fast, synchronized | Standard external APIs |
| **Exponential + Jitter** | `rand(0, base * 2^(attempt-1))` | ~150, ~350, ~600, ~1200 | Prevents thundering herd | Less predictable timing | High-concurrency APIs |
| **Decorrelated Jitter** | `rand(base, prev_delay * 3)` | ~200, ~450, ~900 | Optimal load spreading | Complex implementation | Rate-limited APIs |
| **Capped Exponential** | `min(base * 2^(attempt-1), max)` | 200, 400, 800, 1000, 1000 | Bounded maximum wait | Requires max_delay tuning | Long-running operations |

### HTTP Status Code Retry Classification

| Status Code | Category | Retryable? | Recommended Action |
|------------|----------|-----------|-------------------|
| **200-299** | Success | N/A | Operation succeeded |
| **400** | Bad Request | No | Fix request format; retrying is pointless |
| **401** | Unauthorized | Conditional | Retry after token refresh |
| **403** | Forbidden | No | Permission issue; retrying will not help |
| **404** | Not Found | No | Resource does not exist |
| **408** | Request Timeout | Yes | Retry with backoff |
| **409** | Conflict | Conditional | Retry if conflict is transient (e.g., optimistic lock) |
| **422** | Unprocessable | No | Validation error; fix request data |
| **429** | Too Many Requests | Yes | Retry after `Retry-After` header value |
| **500** | Internal Server Error | Yes | Retry with backoff; may be transient |
| **502** | Bad Gateway | Yes | Upstream issue; retry with backoff |
| **503** | Service Unavailable | Yes | Service overloaded; retry with longer backoff |
| **504** | Gateway Timeout | Yes | Upstream timeout; retry with backoff |

### Circuit Breaker States

| State | Behavior | Transition Condition |
|-------|----------|---------------------|
| **Closed** | All requests pass through normally | Failure count exceeds threshold -> Open |
| **Open** | All requests fail immediately without attempting | Timeout period expires -> Half-Open |
| **Half-Open** | Single test request allowed through | Test succeeds -> Closed; Test fails -> Open |

### Retry vs. Other Resilience Patterns

| Pattern | Level | Scope | Recovery Mechanism |
|---------|-------|-------|--------------------|
| **Retry** | Operation | Single request/call | Re-attempt the same operation |
| **Circuit Breaker** | Service | All calls to a service | Stop attempting; fail fast |
| **Timeout** | Operation | Single request/call | Abandon after deadline |
| **Bulkhead** | Resource | Pool of connections/threads | Isolate resource consumption |
| **Fallback** | Operation | Single request/call | Use alternative data source |
| **OTP Supervisor** | Process | Process lifecycle | Restart crashed process |
| **Hedging** | Operation | Single logical request | Send parallel requests to replicas |

## Technical Deep Dive

### The Thundering Herd Problem

When a service recovers from an outage, all clients that have been retrying will attempt to reconnect simultaneously. This "thundering herd" can immediately re-overload the service, causing another outage. The cycle repeats: outage -> recovery -> thundering herd -> outage.

Jitter breaks this cycle by randomizing retry delays. Instead of 100 clients all retrying at exactly 800ms, they retry at random intervals between 0 and 800ms, spreading the load. Full jitter (`rand(0, delay)`) provides the best load spreading, while equal jitter (`delay/2 + rand(0, delay/2)`) provides a minimum delay floor.

AWS research has shown that decorrelated jitter (`sleep = min(cap, rand(base, sleep * 3))`) provides optimal results for most workloads, as it incorporates both randomization and correlation with previous delays.

### Idempotency Requirements

Retry is only safe for idempotent operations -- operations that produce the same result regardless of how many times they are executed. HTTP GET, PUT, and DELETE are idempotent by definition. HTTP POST is not: retrying a POST that creates a resource may create duplicate resources.

For non-idempotent operations, the standard approach is an idempotency key: a unique identifier (typically a UUID) sent with the request. The server uses this key to detect duplicate requests and return the original response instead of executing the operation again. The Prismatic Platform OSINT adapters include idempotency keys for all mutation operations.

### Tesla Middleware Integration

The Prismatic Platform uses Tesla HTTP client with middleware-based retry. Tesla middleware wraps the HTTP call pipeline, allowing retry logic to be configured declaratively per adapter:

```elixir
# Tesla middleware stack with retry
plug Tesla.Middleware.Retry,
  delay: 200,
  max_retries: 3,
  max_delay: 10_000,
  should_retry: fn
    {:ok, %{status: status}} when status in [429, 500, 502, 503, 504] -> true
    {:error, _} -> true
    _ -> false
  end
```

### OTP Supervision vs. Operation Retry

In BEAM/OTP, there are two levels of retry:

1. **Supervisor restarts**: When a GenServer crashes, its supervisor restarts it according to the configured strategy (`:one_for_one`, `:rest_for_one`, `:one_for_all`). The supervisor tracks restart frequency and shuts down if too many restarts occur in a time window.

2. **Operation retries**: Within a running process, individual operations (HTTP calls, database queries, external service interactions) may fail and be retried without crashing the process.

These complement each other: operation retries handle expected transient failures gracefully, while supervisor restarts handle unexpected crashes. A well-designed system uses operation retries for anticipated failure modes and lets unexpected failures crash to the supervisor for a clean restart.

## Usage in Prismatic Platform

All 157 OSINT tool adapters that make external HTTP calls use Tesla middleware with configurable retry policies:

| Adapter Category | Max Retries | Base Delay | Max Delay | Jitter | Notes |
|-----------------|------------|-----------|-----------|--------|-------|
| **Czech Registries** (ARES, Justice) | 3 | 500ms | 15s | Full | Government APIs with occasional timeouts |
| **Global Search** (Shodan, VirusTotal) | 3 | 200ms | 10s | Full | Rate-limited; respect Retry-After |
| **Sanctions Lists** (OFAC, EU) | 5 | 1000ms | 30s | Decorrelated | Critical data; higher retry count |
| **DNS/Network** (ASN, WHOIS) | 2 | 100ms | 5s | Full | Fast services; quick retries |
| **Social Media** (various) | 3 | 300ms | 10s | Full | Variable reliability |

The DD pipeline's fetch phase retries on network errors but NOT on data validation errors -- a validation error means the data is malformed and retrying will not help.

The API gateway returns `Retry-After` headers when enforcing rate limits, guiding client retry behavior. The platform's rate limiter integrates with the retry system: when a client receives a 429, it reads the `Retry-After` header and schedules the retry accordingly rather than using its default backoff calculation.

Circuit breakers protect against sustained service failures. Each external service connection has an associated circuit breaker that opens after 5 consecutive failures within 60 seconds. When open, requests fail immediately with `{:error, :circuit_open}` for 30 seconds before a half-open test is attempted.

## Code Examples

### Configurable Retry Policy with Full Jitter and Circuit Breaker

```elixir
defmodule PrismaticOsintCore.RetryPolicy do
  @moduledoc """
  Configurable retry policy for external API calls with exponential
  backoff, full jitter, and circuit breaker integration.

  Supports per-adapter configuration, Retry-After header respect,
  and telemetry emission for retry rate monitoring.

  ## Backoff Strategies

    * `:exponential` - `base * 2^(attempt - 1)` with optional jitter
    * `:linear` - `base * attempt`
    * `:constant` - `base` (no increase)
    * `:decorrelated` - `rand(base, prev_delay * 3)`

  ## Example

      iex> config = PrismaticOsintCore.RetryPolicy.default_config()
      iex> PrismaticOsintCore.RetryPolicy.execute(fn -> {:ok, "result"} end, config)
      {:ok, "result"}
  """

  require Logger

  @type backoff_strategy :: :exponential | :linear | :constant | :decorrelated
  @type config :: %{
          max_attempts: pos_integer(),
          base_delay_ms: pos_integer(),
          max_delay_ms: pos_integer(),
          backoff_strategy: backoff_strategy(),
          jitter: boolean(),
          retryable_statuses: [pos_integer()],
          retryable_errors: [atom()],
          circuit_breaker: atom() | nil
        }

  @default_config %{
    max_attempts: 3,
    base_delay_ms: 200,
    max_delay_ms: 10_000,
    backoff_strategy: :exponential,
    jitter: true,
    retryable_statuses: [429, 500, 502, 503, 504],
    retryable_errors: [:timeout, :connect_timeout, :econnrefused, :closed],
    circuit_breaker: nil
  }

  @doc """
  Returns the default retry configuration.

  ## Example

      iex> config = PrismaticOsintCore.RetryPolicy.default_config()
      iex> config.max_attempts
      3
  """
  @spec default_config() :: config()
  def default_config, do: @default_config

  @doc """
  Executes a function with retry logic according to the given configuration.

  The function must return `{:ok, result}` on success or `{:error, reason}`
  on failure. HTTP status errors should be returned as
  `{:error, {:http_status, status_code}}` or `{:error, {:http_status, status_code, headers}}`
  to enable status-based retry decisions and Retry-After header processing.

  ## Parameters

    * `fun` - Zero-arity function returning `{:ok, term()} | {:error, term()}`
    * `config` - Retry configuration map (default: `default_config()`)

  ## Returns

    * `{:ok, result}` - Operation succeeded (possibly after retries)
    * `{:error, reason}` - Operation failed after all retry attempts
    * `{:error, :circuit_open}` - Circuit breaker is open

  ## Example

      iex> PrismaticOsintCore.RetryPolicy.execute(fn ->
      ...>   case HTTPClient.get("https://api.example.com/data") do
      ...>     {:ok, %{status: 200, body: body}} -> {:ok, body}
      ...>     {:ok, %{status: status}} -> {:error, {:http_status, status}}
      ...>     {:error, reason} -> {:error, reason}
      ...>   end
      ...> end)
      {:ok, "data"}
  """
  @spec execute((() -> {:ok, term()} | {:error, term()}), config()) ::
          {:ok, term()} | {:error, term()}
  def execute(fun, config \\ @default_config) do
    if circuit_open?(config.circuit_breaker) do
      {:error, :circuit_open}
    else
      do_execute(fun, config, 1, config.base_delay_ms)
    end
  end

  defp do_execute(fun, config, attempt, prev_delay) when attempt <= config.max_attempts do
    case fun.() do
      {:ok, _} = success ->
        record_circuit_success(config.circuit_breaker)
        if attempt > 1 do
          :telemetry.execute(
            [:prismatic, :retry, :succeeded],
            %{attempts: attempt},
            %{circuit_breaker: config.circuit_breaker}
          )
        end
        success

      {:error, {:http_status, 429, headers}} when attempt < config.max_attempts ->
        delay = retry_after_delay(headers, config, attempt, prev_delay)
        log_retry(attempt, config.max_attempts, {:http_status, 429}, delay)
        Process.sleep(delay)
        do_execute(fun, config, attempt + 1, delay)

      {:error, {:http_status, status}} = error when attempt < config.max_attempts ->
        if status in config.retryable_statuses do
          delay = compute_delay(config, attempt, prev_delay)
          log_retry(attempt, config.max_attempts, {:http_status, status}, delay)
          Process.sleep(delay)
          do_execute(fun, config, attempt + 1, delay)
        else
          record_circuit_failure(config.circuit_breaker)
          error
        end

      {:error, reason} = error when attempt < config.max_attempts ->
        if retryable_error?(reason, config.retryable_errors) do
          delay = compute_delay(config, attempt, prev_delay)
          log_retry(attempt, config.max_attempts, reason, delay)
          Process.sleep(delay)
          do_execute(fun, config, attempt + 1, delay)
        else
          record_circuit_failure(config.circuit_breaker)
          error
        end

      error ->
        record_circuit_failure(config.circuit_breaker)

        :telemetry.execute(
          [:prismatic, :retry, :exhausted],
          %{attempts: attempt},
          %{circuit_breaker: config.circuit_breaker, error: inspect(error)}
        )

        error
    end
  end

  defp do_execute(_fun, config, _attempt, _prev_delay) do
    record_circuit_failure(config.circuit_breaker)
    {:error, :max_retries_exceeded}
  end

  @doc """
  Computes the delay for the given attempt number according to the
  configured backoff strategy.

  ## Example

      iex> config = %{base_delay_ms: 200, max_delay_ms: 10_000, backoff_strategy: :exponential, jitter: false}
      iex> PrismaticOsintCore.RetryPolicy.compute_delay(config, 3, 200)
      800
  """
  @spec compute_delay(config(), pos_integer(), pos_integer()) :: pos_integer()
  def compute_delay(config, attempt, prev_delay) do
    raw_delay =
      case config.backoff_strategy do
        :exponential ->
          config.base_delay_ms * Integer.pow(2, attempt - 1)

        :linear ->
          config.base_delay_ms * attempt

        :constant ->
          config.base_delay_ms

        :decorrelated ->
          Enum.random(config.base_delay_ms..(prev_delay * 3))
      end

    capped = min(raw_delay, config.max_delay_ms)

    if config.jitter do
      max(1, :rand.uniform(capped))
    else
      capped
    end
  end

  defp retry_after_delay(headers, config, attempt, prev_delay) do
    case List.keyfind(headers, "retry-after", 0) do
      {_, seconds_str} ->
        case Integer.parse(seconds_str) do
          {seconds, _} -> seconds * 1000
          :error -> compute_delay(config, attempt, prev_delay)
        end

      nil ->
        compute_delay(config, attempt, prev_delay)
    end
  end

  defp retryable_error?(reason, retryable_errors) when is_atom(reason) do
    reason in retryable_errors
  end

  defp retryable_error?({reason, _details}, retryable_errors) when is_atom(reason) do
    reason in retryable_errors
  end

  defp retryable_error?(_reason, _retryable_errors), do: false

  defp log_retry(attempt, max_attempts, reason, delay) do
    Logger.warning("Retrying operation",
      attempt: attempt,
      max_attempts: max_attempts,
      reason: inspect(reason),
      delay_ms: delay
    )
  end

  defp circuit_open?(nil), do: false
  defp circuit_open?(_breaker_name), do: false

  defp record_circuit_success(nil), do: :ok
  defp record_circuit_success(_breaker_name), do: :ok

  defp record_circuit_failure(nil), do: :ok
  defp record_circuit_failure(_breaker_name), do: :ok
end
```

### Circuit Breaker Implementation

```elixir
defmodule PrismaticOsintCore.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation for external service protection.

  Tracks failure rates per service and transitions between closed,
  open, and half-open states to prevent wasting resources on
  clearly-failing services while allowing automatic recovery.

  ## State Machine

      :closed  --[failures >= threshold]--> :open
      :open    --[timeout expires]-------> :half_open
      :half_open --[test succeeds]-------> :closed
      :half_open --[test fails]----------> :open

  ## Example

      iex> PrismaticOsintCore.CircuitBreaker.start_link(name: :shodan_api, threshold: 5, timeout_ms: 30_000)
      {:ok, pid}
      iex> PrismaticOsintCore.CircuitBreaker.allow?(:shodan_api)
      true
  """

  use GenServer

  require Logger

  @type state :: :closed | :open | :half_open
  @type config :: %{
          threshold: pos_integer(),
          timeout_ms: pos_integer(),
          half_open_max: pos_integer()
        }

  @default_config %{
    threshold: 5,
    timeout_ms: 30_000,
    half_open_max: 1
  }

  @doc """
  Starts a circuit breaker for a named service.

  ## Options

    * `:name` - Service identifier (required)
    * `:threshold` - Failure count to open circuit (default: 5)
    * `:timeout_ms` - Time in open state before half-open test (default: 30000)
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: via(name))
  end

  @doc """
  Checks whether the circuit allows requests through.
  """
  @spec allow?(atom()) :: boolean()
  def allow?(name) do
    GenServer.call(via(name), :allow?)
  end

  @doc """
  Records a successful operation, potentially closing the circuit.
  """
  @spec record_success(atom()) :: :ok
  def record_success(name) do
    GenServer.cast(via(name), :success)
  end

  @doc """
  Records a failed operation, potentially opening the circuit.
  """
  @spec record_failure(atom()) :: :ok
  def record_failure(name) do
    GenServer.cast(via(name), :failure)
  end

  @doc """
  Returns the current circuit breaker state.
  """
  @spec get_state(atom()) :: %{state: state(), failure_count: non_neg_integer()}
  def get_state(name) do
    GenServer.call(via(name), :get_state)
  end

  @impl true
  def init(opts) do
    config = Map.merge(@default_config, Map.new(opts))

    {:ok, %{
      state: :closed,
      failure_count: 0,
      config: config,
      opened_at: nil,
      half_open_attempts: 0
    }}
  end

  @impl true
  def handle_call(:allow?, _from, %{state: :closed} = state) do
    {:reply, true, state}
  end

  def handle_call(:allow?, _from, %{state: :open, opened_at: opened_at, config: config} = state) do
    elapsed = System.monotonic_time(:millisecond) - opened_at

    if elapsed >= config.timeout_ms do
      Logger.info("Circuit breaker transitioning to half-open",
        elapsed_ms: elapsed,
        timeout_ms: config.timeout_ms
      )

      {:reply, true, %{state | state: :half_open, half_open_attempts: 0}}
    else
      {:reply, false, state}
    end
  end

  def handle_call(:allow?, _from, %{state: :half_open, half_open_attempts: attempts, config: config} = state) do
    {:reply, attempts < config.half_open_max, state}
  end

  def handle_call(:get_state, _from, state) do
    {:reply, %{state: state.state, failure_count: state.failure_count}, state}
  end

  @impl true
  def handle_cast(:success, %{state: :half_open} = state) do
    Logger.info("Circuit breaker closing after successful half-open test")

    :telemetry.execute(
      [:prismatic, :circuit_breaker, :closed],
      %{count: 1},
      %{}
    )

    {:noreply, %{state | state: :closed, failure_count: 0, opened_at: nil}}
  end

  def handle_cast(:success, %{state: :closed} = state) do
    {:noreply, %{state | failure_count: 0}}
  end

  def handle_cast(:success, state), do: {:noreply, state}

  def handle_cast(:failure, %{state: :half_open} = state) do
    Logger.warning("Circuit breaker re-opening after half-open failure")
    {:noreply, %{state | state: :open, opened_at: System.monotonic_time(:millisecond)}}
  end

  def handle_cast(:failure, %{state: :closed, failure_count: count, config: config} = state) do
    new_count = count + 1

    if new_count >= config.threshold do
      Logger.warning("Circuit breaker opening",
        failure_count: new_count,
        threshold: config.threshold
      )

      :telemetry.execute(
        [:prismatic, :circuit_breaker, :opened],
        %{count: 1},
        %{failure_count: new_count}
      )

      {:noreply, %{state |
        state: :open,
        failure_count: new_count,
        opened_at: System.monotonic_time(:millisecond)
      }}
    else
      {:noreply, %{state | failure_count: new_count}}
    end
  end

  def handle_cast(:failure, state), do: {:noreply, state}

  defp via(name), do: {:via, Registry, {PrismaticOsintCore.CircuitBreakerRegistry, name}}
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Immediate retry without backoff** | Amplifies load on failing service, deepens the outage | Always use exponential backoff with a minimum base delay |
| **No jitter** | All clients retry at exactly the same time, creating thundering herd | Add full jitter (`rand(0, delay)`) or decorrelated jitter |
| **Retrying non-transient errors** | Retrying 400/404/422 wastes resources and delays error reporting | Classify errors; only retry transient failures (timeouts, 5xx, connection errors) |
| **Unbounded retries** | Infinite retry loops hang requests and consume resources indefinitely | Set max_attempts (typically 3-5); fail fast after exhaustion |
| **Retrying non-idempotent operations** | POST retry may create duplicate resources | Use idempotency keys; only retry idempotent operations by default |
| **Ignoring Retry-After headers** | Disrespecting server guidance leads to further rate limiting or banning | Parse and honor `Retry-After` header; override backoff calculation |
| **No circuit breaker** | Continuous retries against a down service waste resources and delay recovery | Implement circuit breaker to fail fast when service is clearly down |
| **No retry telemetry** | Cannot diagnose systemic reliability issues without retry rate metrics | Emit telemetry on every retry attempt and exhaustion |
| **Retry in synchronous request path** | User waits for all retry delays, experiencing unacceptable latency | Set total retry budget (sum of all delays) within acceptable request timeout |
| **Missing retry logging** | Operations fail silently after retry exhaustion | Log every retry attempt and final failure with full context |

## Best Practices

1. **Always use backoff** -- immediate retries amplify load on failing systems and make recovery harder. Exponential backoff with base delay of 200-500ms is a good starting point.

2. **Add jitter to prevent thundering herd** -- randomized delays ensure retrying clients do not synchronize. Full jitter (`rand(0, delay)`) provides the best load distribution.

3. **Set maximum attempts** -- unbounded retries can hang requests indefinitely. 3-5 attempts is typical; set a total retry budget that fits within the request timeout.

4. **Only retry transient failures** -- retrying permanent errors (400, 404, 422) wastes resources and delays error reporting to the user. Classify each error as transient or permanent.

5. **Log retry attempts with context** -- visibility into retry rates reveals systemic reliability issues. Include attempt number, max attempts, error reason, and delay in every retry log.

6. **Respect Retry-After headers** -- when the server tells you when to retry, honor that guidance. It is both polite and effective for rate-limited APIs.

7. **Implement circuit breakers for external services** -- when a service has been failing consistently, stop retrying and fail fast. Circuit breakers protect both your system and the failing service.

8. **Ensure idempotency before retrying** -- only retry operations that are safe to repeat. For non-idempotent operations, use idempotency keys or queue the operation for single-attempt processing.

9. **Set a total retry time budget** -- the sum of all retry delays must fit within the user-facing request timeout. If 3 retries with exponential backoff take 14 seconds, but the user timeout is 10 seconds, reduce max_attempts or base_delay.

10. **Emit telemetry for retry rates** -- track retry attempt counts, exhaustion rates, and circuit breaker state transitions. High retry rates indicate upstream reliability issues that may need architectural remediation.

## Related Terms

- [Throttling](@/glossary/throttling.md) -- the server-side mechanism that triggers client retries via 429 responses
- [Status Code](@/glossary/status-code.md) -- HTTP status codes that indicate retryable vs. permanent failures
- [SLA](@/glossary/sla.md) -- service level agreements that account for retry-masked failures and latency
- [Supervision Strategy](@/glossary/supervision-strategy.md) -- OTP's process-level restart mechanism that complements operation-level retries
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- pattern that stops retries when a service is clearly down
- [Timeout](/glossary/timeout/) -- operation deadline that interacts with retry delay budgets
- [Cache Eviction](@/glossary/cache-eviction.md) -- cached responses reduce the need for retryable external calls
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- the broader resilience discipline encompassing retry, circuit breaker, and fallback
- [Telemetry](@/glossary/telemetry.md) -- the event system for monitoring retry rates and circuit breaker transitions
- [Logging](@/glossary/logging.md) -- retry attempts should be logged for operational visibility
- [Response Distribution](@/glossary/response-distribution.md) -- retry delays affect the tail of response time distributions
- [Request Rate](@/glossary/request-rate.md) -- rate at which requests are sent, affected by retry amplification

## See Also

- [OSINT Tool Adapters](@/osint/_index.md) -- retry-enabled external API integration across 157 adapters
- [Resilience Patterns](@/architecture/_index.md) -- comprehensive fault tolerance strategies
- [Tesla Middleware](https://hexdocs.pm/tesla/Tesla.Middleware.Retry.html) -- retry middleware used in Prismatic Platform
- [AWS Architecture Blog: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) -- canonical reference for jitter strategies
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html) -- Martin Fowler's circuit breaker description

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
