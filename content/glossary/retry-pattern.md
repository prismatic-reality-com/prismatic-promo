+++
title = "Retry Pattern"
weight = 49
[extra]
category = "architecture"
description = "Transient failure recovery through configurable request retry strategies with exponential backoff, jitter, and budget management"
related_terms = ["circuit-breaker", "fault-tolerance", "idempotency", "backpressure", "rate-limiting", "genserver", "supervision-tree", "distributed-system"]
domain = "resilience"
complexity = "intermediate"
maturity = "production"
platform_adoption = "universal"
elixir_modules = ["Prismatic.Retry", "Prismatic.ResilientClient", "Prismatic.RetryBudget"]
otp_patterns = ["GenServer", "Process.sleep", "telemetry"]
key_strategies = ["fixed-delay", "linear-backoff", "exponential-backoff", "exponential-jitter", "decorrelated-jitter"]
prerequisites = ["idempotency", "circuit-breaker", "genserver"]
use_cases = ["API calls", "database connections", "AI inference", "EASM scanning", "search indexing"]
performance_impact = "low-to-moderate"
failure_modes = ["retry-storm", "amplification", "stale-connection", "non-idempotent-retry"]
enforcement_level = "mandatory"
testing_strategy = "property-based"
monitoring = "telemetry"
documentation_quality = "academic"
last_updated = "2026-02-22"
version = "2.0.0"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1723
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Retry", "Pattern", "Transient", "glossary", "architecture", "Prismatic Platform", "HTTP", "Exponential Backoff"]
tags = ["glossary", "architecture", "retry-pattern", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Retry Pattern - Prismatic Platform"
+++

## Definition and Overview

The Retry Pattern is a resilience pattern that handles transient failures by automatically re-attempting failed operations with configurable strategies. Transient failures -- network timeouts, temporary service unavailability, database connection drops, rate limit responses -- are by nature temporary and self-resolving. The Retry Pattern exploits this characteristic by delaying and re-attempting the operation, often succeeding on subsequent attempts without human intervention. In distributed systems where network partitions, resource contention, and ephemeral outages are facts of life rather than exceptions, retry logic is not an optimization but a fundamental requirement for delivering reliable service.

The pattern is foundational to building reliable distributed systems where failures are expected rather than exceptional. In any system that communicates over a network, makes external API calls, or depends on shared resources, some percentage of operations will fail transiently. Without retry logic, each transient failure surfaces as a user-visible error, degrading perceived reliability far below the actual system reliability. A system with 99.9% single-request success rate that makes 10 sequential external calls has only a 99.0% end-to-end success rate without retries, but with a single retry per call, the effective success rate rises to 99.9999%.

Effective retry implementations must balance several competing concerns: recovering from transient failures quickly (short delays, many attempts) versus avoiding overloading recovering services (long delays, few attempts) versus providing timely feedback to users (bounded total duration). The choice of retry strategy -- fixed delay, linear backoff, exponential backoff, or exponential backoff with jitter -- determines this balance. In the Prismatic Platform, retry patterns are deployed across every external interaction, from [Ollama](@/glossary/ollama.md) AI inference calls to [PostgreSQL](@/glossary/postgresql.md) database connections, governed by the platform's NO MERCY doctrine that demands complete resilience with zero compromise.

## Historical Context and Motivation

The Retry Pattern has roots in telecommunications engineering from the 1960s, where automatic retry mechanisms handled busy signals and connection failures in telephone switching systems. The pattern gained prominence in distributed computing through the work of Leslie Lamport and others who formalized failure models for networked systems. The exponential backoff algorithm was first described in the context of Ethernet collision resolution (the ALOHA protocol and subsequent IEEE 802.3 standard), where stations that detected collisions would wait an exponentially increasing random interval before retransmitting.

In modern cloud-native architectures, the retry pattern has evolved from a simple loop into a sophisticated resilience primitive. Google's Site Reliability Engineering (SRE) practices formalized retry budgets. Amazon Web Services documented the advantages of decorrelated jitter through empirical analysis of their production systems. Netflix's Hystrix library (now succeeded by Resilience4j) popularized the integration of retries with [circuit breakers](@/glossary/circuit-breaker.md). The Elixir/OTP ecosystem brings a unique perspective through its supervision tree model, where process restarts serve as a form of system-level retry with clean state initialization.

## Retry Strategy Mathematics

### Exponential Backoff

Exponential backoff calculates the delay for attempt `n` as:

```
delay(n) = min(base_delay * 2^n, max_delay)
```

This creates delays of 1s, 2s, 4s, 8s, 16s... capped at a maximum value. The exponential growth ensures that sustained failures receive progressively longer cooling-off periods, giving the target service increasing time to recover between attempts.

### Exponential Backoff with Full Jitter

Full jitter adds randomness to prevent synchronized retries across multiple clients:

```
delay(n) = random(0, min(base_delay * 2^n, max_delay))
```

### Decorrelated Jitter

Decorrelated jitter provides even better distribution of retry attempts:

```
delay(n) = min(max_delay, random(base_delay, delay(n-1) * 3))
```

AWS's empirical analysis demonstrated that decorrelated jitter provides the best throughput and latency characteristics under high contention, as it maximizes the spread of retry attempts across the time axis while maintaining a self-correcting property where long previous delays naturally lead to shorter subsequent ones.

| Strategy | Delay Pattern | Use Case | Thundering Herd Risk |
|----------|---------------|----------|---------------------|
| **Fixed Delay** | Constant wait between attempts | Simple retry, few clients | High |
| **Linear Backoff** | Linearly increasing delay | Moderate load systems | Medium |
| **Exponential Backoff** | Doubling delay each attempt | High-traffic distributed systems | Medium |
| **Exponential + Jitter** | Doubling delay + random offset | Production distributed systems | Low |
| **Decorrelated Jitter** | Randomized within exponential bounds | Highest contention scenarios | Lowest |

## Technical Deep Dive

### Idempotency Requirement

Retry patterns fundamentally require idempotent operations -- operations that produce the same result regardless of how many times they are executed. Non-idempotent operations (such as incrementing a counter or processing a payment) can produce duplicated effects when retried. Systems must either make operations naturally idempotent or implement [idempotency](@/glossary/idempotency.md) keys to deduplicate retried requests.

### Core Retry Implementation

```elixir
defmodule Prismatic.Retry do
  @moduledoc """
  Configurable retry mechanism with multiple backoff strategies.
  Supports exponential backoff with jitter, circuit breaker
  integration, and per-error-class retry policy.

  Implements five strategies: fixed, linear, exponential,
  exponential_jitter, and decorrelated_jitter. All strategies
  respect maximum delay bounds and emit telemetry events
  for monitoring and alerting.
  """

  @type strategy :: :fixed | :linear | :exponential | :exponential_jitter | :decorrelated_jitter
  @type opts :: [
    strategy: strategy(),
    max_attempts: pos_integer(),
    base_delay: pos_integer(),
    max_delay: pos_integer(),
    retryable: (term() -> boolean()),
    on_retry: (non_neg_integer(), term() -> :ok)
  ]

  @default_opts [
    strategy: :exponential_jitter,
    max_attempts: 5,
    base_delay: 1_000,
    max_delay: 30_000,
    retryable: &default_retryable/1,
    on_retry: fn _attempt, _error -> :ok end
  ]

  @spec with_retry(opts(), (-> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, term()}
  def with_retry(opts \\ [], operation) when is_function(operation, 0) do
    opts = Keyword.merge(@default_opts, opts)
    execute_with_retry(operation, opts, 1, nil)
  end

  @spec execute_with_retry(
          (-> {:ok, term()} | {:error, term()}),
          opts(),
          pos_integer(),
          term() | nil
        ) :: {:ok, term()} | {:error, term()}
  defp execute_with_retry(operation, opts, attempt, _last_error)
       when attempt <= opts[:max_attempts] do
    case operation.() do
      {:ok, result} ->
        {:ok, result}

      {:error, error} = failure ->
        if opts[:retryable].(error) and attempt < opts[:max_attempts] do
          delay = calculate_delay(opts[:strategy], attempt, opts[:base_delay], opts[:max_delay])
          opts[:on_retry].(attempt, error)

          :telemetry.execute(
            [:prismatic, :retry, :attempt],
            %{delay_ms: delay, attempt: attempt},
            %{error: error, strategy: opts[:strategy]}
          )

          Process.sleep(delay)
          execute_with_retry(operation, opts, attempt + 1, error)
        else
          failure
        end
    end
  end

  defp execute_with_retry(_operation, _opts, _attempt, last_error) do
    {:error, {:max_retries_exceeded, last_error}}
  end

  @spec calculate_delay(strategy(), pos_integer(), pos_integer(), pos_integer()) ::
          non_neg_integer()
  defp calculate_delay(:fixed, _attempt, base_delay, _max_delay), do: base_delay

  defp calculate_delay(:linear, attempt, base_delay, max_delay) do
    min(base_delay * attempt, max_delay)
  end

  defp calculate_delay(:exponential, attempt, base_delay, max_delay) do
    min(base_delay * Integer.pow(2, attempt - 1), max_delay)
  end

  defp calculate_delay(:exponential_jitter, attempt, base_delay, max_delay) do
    max_for_attempt = min(base_delay * Integer.pow(2, attempt - 1), max_delay)
    :rand.uniform(max_for_attempt)
  end

  defp calculate_delay(:decorrelated_jitter, 1, base_delay, max_delay) do
    min(max_delay, base_delay + :rand.uniform(base_delay * 2))
  end

  defp calculate_delay(:decorrelated_jitter, _attempt, base_delay, max_delay) do
    min(max_delay, :rand.uniform(base_delay * 3))
  end

  @spec default_retryable(term()) :: boolean()
  defp default_retryable(%DBConnection.ConnectionError{}), do: true
  defp default_retryable(%Mint.TransportError{}), do: true
  defp default_retryable(:timeout), do: true
  defp default_retryable(:econnrefused), do: true
  defp default_retryable(:closed), do: true
  defp default_retryable({:http_error, status}) when status in [429, 500, 502, 503, 504], do: true
  defp default_retryable(_), do: false
end
```

### Circuit Breaker Integration

The Retry Pattern works in conjunction with the [Circuit Breaker](@/glossary/circuit-breaker.md) pattern. While retries handle individual transient failures, circuit breakers detect sustained failures and stop retries entirely to prevent cascading overload:

```elixir
defmodule Prismatic.ResilientClient do
  @moduledoc """
  Combines retry logic with circuit breaker protection
  for resilient external service communication. This module
  serves as the standard entry point for all external calls
  in the Prismatic Platform, enforcing both retry discipline
  and circuit protection.
  """

  alias Prismatic.{Retry, CircuitBreaker}

  @spec call(atom(), (-> {:ok, term()} | {:error, term()}), keyword()) ::
          {:ok, term()} | {:error, term()}
  def call(service_name, operation, opts \\ []) do
    case CircuitBreaker.check(service_name) do
      :closed ->
        result = Retry.with_retry(opts, operation)

        case result do
          {:ok, _} = success ->
            CircuitBreaker.record_success(service_name)
            success

          {:error, _} = failure ->
            CircuitBreaker.record_failure(service_name)
            failure
        end

      :open ->
        {:error, {:circuit_open, service_name}}

      :half_open ->
        case operation.() do
          {:ok, _} = success ->
            CircuitBreaker.reset(service_name)
            success

          {:error, _} = failure ->
            CircuitBreaker.trip(service_name)
            failure
        end
    end
  end
end
```

## Architecture and Implementation

### Retry Budget Pattern

In high-throughput systems, per-request retry limits are insufficient. A retry budget limits the total percentage of requests that can be retries across all clients, preventing retry amplification from overwhelming recovering services. Google SRE recommends a retry budget of 10% -- meaning that at most 10% of all requests from a client can be retries at any point in time:

```elixir
defmodule Prismatic.RetryBudget do
  @moduledoc """
  Token-bucket based retry budget limiting the total retry
  rate across all clients to prevent retry storms. Implements
  a sliding window approach where the budget resets periodically.
  """
  use GenServer

  @type t :: %__MODULE__{
    budget_ratio: float(),
    window_ms: pos_integer(),
    request_count: non_neg_integer(),
    retry_count: non_neg_integer(),
    last_reset: integer()
  }

  defstruct budget_ratio: 0.1,
            window_ms: 10_000,
            request_count: 0,
            retry_count: 0,
            last_reset: 0

  @spec retry_allowed?(GenServer.server()) :: boolean()
  def retry_allowed?(server) do
    GenServer.call(server, :check_budget)
  end

  @spec record_request(GenServer.server()) :: :ok
  def record_request(server) do
    GenServer.cast(server, :record_request)
  end

  @spec record_retry(GenServer.server()) :: :ok
  def record_retry(server) do
    GenServer.cast(server, :record_retry)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      budget_ratio: Keyword.get(opts, :budget_ratio, 0.1),
      window_ms: Keyword.get(opts, :window_ms, 10_000),
      last_reset: System.monotonic_time(:millisecond)
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:check_budget, _from, state) do
    state = maybe_reset_window(state)

    allowed =
      state.request_count == 0 or
        state.retry_count / max(state.request_count, 1) < state.budget_ratio

    {:reply, allowed, state}
  end

  @impl true
  def handle_cast(:record_request, state) do
    {:noreply, %{state | request_count: state.request_count + 1}}
  end

  @impl true
  def handle_cast(:record_retry, state) do
    {:noreply, %{state | retry_count: state.retry_count + 1}}
  end

  @spec maybe_reset_window(t()) :: t()
  defp maybe_reset_window(state) do
    now = System.monotonic_time(:millisecond)

    if now - state.last_reset > state.window_ms do
      %{state | request_count: 0, retry_count: 0, last_reset: now}
    else
      state
    end
  end
end
```

### Retry Classification

Not all errors should trigger retries. The retry system must classify errors into retryable (transient) and non-retryable (permanent) categories. Misclassification in either direction is costly: retrying a permanent error wastes resources and delays error reporting, while failing to retry a transient error degrades availability unnecessarily.

| Error Category | Retryable? | Examples |
|---------------|-----------|----------|
| **Network Transient** | Yes | Connection timeout, DNS resolution failure |
| **Server Overload** | Yes | HTTP 429 (Too Many Requests), HTTP 503 |
| **Server Error** | Conditionally | HTTP 500 (may be permanent), HTTP 502/504 |
| **Client Error** | No | HTTP 400 (Bad Request), HTTP 401/403 |
| **Validation Error** | No | Invalid input, schema mismatch |
| **Not Found** | No | HTTP 404 (missing resource) |
| **Database Constraint** | No | Unique violation, foreign key violation |

## Usage in Prismatic Platform

The Prismatic Platform implements retry patterns across all external service interactions, governed by the NO MERCY doctrine that demands every external call be protected by retry logic:

**Ollama Inference**: AI inference requests to local [Ollama](@/glossary/ollama.md) models use exponential backoff with jitter, with a fallback chain to cloud providers after exhausting local retries. The retry budget limits total retry traffic to 10% of inference requests, preventing model overload during high-demand periods.

**Database Connections**: [Ecto](@/glossary/ecto.md) database connections through [PostgreSQL](@/glossary/postgresql.md) use configurable retry with backoff on transient connection failures. The connection pool (DBConnection) implements its own retry layer for checkout timeouts, creating a two-tier retry architecture.

**EASM Scanning**: [Prismatic Perimeter](@/glossary/easm.md)'s External Attack Surface Management scanner retries DNS queries, HTTP probes, and certificate fetches with per-target retry budgets. Each target maintains independent retry state, preventing one unresponsive target from consuming the retry budget for all targets.

**SessionLifecycle**: The [SessionLifecycle GenServer](@/glossary/session-discipline.md) integrates retry logic with its circuit breaker, opening after 3 consecutive failures and auto-resetting after 60 seconds for retry attempts.

**Meilisearch Indexing**: Document indexing to [Meilisearch](@/glossary/meilisearch.md) uses linear backoff with a maximum of 3 retries, as indexing operations are idempotent (re-indexing the same document produces the same result).

**OSINT Provider Calls**: The [OSINT](@/glossary/osint.md) intelligence collection pipeline retries provider API calls with per-provider retry configurations. Rate-limited providers (HTTP 429) receive longer backoff delays to respect the provider's throttling signals.

## Code Examples

### Practical Usage

```elixir
# Retry an Ollama inference call with exponential backoff
{:ok, response} =
  Prismatic.Retry.with_retry(
    [
      strategy: :exponential_jitter,
      max_attempts: 3,
      base_delay: 500,
      max_delay: 5_000,
      on_retry: fn attempt, error ->
        Logger.warning("Ollama retry attempt #{attempt}: #{inspect(error)}")
      end
    ],
    fn ->
      Prismatic.Ollama.generate("qwen3-coder", prompt)
    end
  )

# Retry with circuit breaker protection
{:ok, rating} =
  Prismatic.ResilientClient.call(:security_scanner, fn ->
    PrismaticPerimeter.Scanner.scan_domain("example.com")
  end, max_attempts: 5, strategy: :decorrelated_jitter)

# Budget-aware retry for high-throughput scenarios
if Prismatic.RetryBudget.retry_allowed?(:api_gateway) do
  Prismatic.RetryBudget.record_retry(:api_gateway)
  Prismatic.Retry.with_retry([max_attempts: 2], operation)
else
  {:error, :retry_budget_exhausted}
end
```

## Observability and Monitoring

Retry behavior is fully observable through [telemetry](@/glossary/telemetry.md) events emitted by the retry infrastructure. Every retry attempt, success after retry, and retry exhaustion emits structured telemetry that feeds into the platform's monitoring dashboards:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :retry, :attempt]` | `delay_ms`, `attempt` | `error`, `strategy`, `service` |
| `[:prismatic, :retry, :success]` | `total_attempts`, `total_delay_ms` | `service`, `strategy` |
| `[:prismatic, :retry, :exhausted]` | `max_attempts`, `total_delay_ms` | `last_error`, `service` |
| `[:prismatic, :retry, :budget_exceeded]` | `budget_ratio`, `retry_count` | `service`, `window_ms` |

These events enable alerting on retry rate spikes (indicating upstream degradation), retry budget exhaustion (indicating sustained failure), and retry latency distribution (indicating strategy tuning needs).

## Best Practices

1. **Default to Exponential Backoff with Jitter**: Full jitter provides the best characteristics for [distributed systems](@/glossary/distributed-system.md). Only use simpler strategies when profiling proves they are sufficient.

2. **Classify Errors Explicitly**: Define a clear retryable/non-retryable classification for every error type your system can encounter. Never retry authentication failures, validation errors, or resource-not-found responses.

3. **Set Total Timeout Budgets**: In addition to per-attempt limits, set a total wall-clock timeout for the entire retry sequence. Users should not wait indefinitely for retry resolution.

4. **Implement Retry Budgets**: In high-throughput systems, per-request retry limits are insufficient. A system-wide retry budget prevents retry amplification from overwhelming recovering services.

5. **Log Every Retry**: Emit structured telemetry for every retry attempt including the attempt number, delay, error classification, and target service. This data is essential for tuning retry parameters.

6. **Ensure Idempotency**: Before adding retry logic to any operation, verify that the operation is [idempotent](@/glossary/idempotency.md) or implement idempotency keys. Retrying non-idempotent operations causes data corruption.

7. **Combine with Circuit Breakers**: Retries handle individual transient failures; circuit breakers handle sustained failures. Always use both patterns together for comprehensive resilience.

8. **Respect Retry-After Headers**: When an HTTP response includes a `Retry-After` header, honor it. The server is explicitly communicating when it will be ready for the next attempt.

## Common Pitfalls

- **Retry Storms (Thundering Herd)**: Without jitter, multiple clients retry simultaneously after a service recovery, creating synchronized load spikes that re-trigger the original failure. Always use jitter in multi-client scenarios.

- **Infinite Retry Loops**: Missing maximum attempt limits or total timeout bounds allow retries to continue indefinitely, consuming resources and blocking other operations.

- **Retrying Non-Transient Errors**: Retrying authentication failures, validation errors, or business logic rejections wastes resources and delays error reporting. These errors will never succeed on retry.

- **Retry Amplification**: In a chain of services (A calls B calls C), each layer's retries multiply. Three retries at each of three layers produces up to 27 attempts for a single user request. Implement retry budgets at each layer.

- **Missing Idempotency**: Retrying a payment processing call without idempotency keys can charge a customer multiple times. Verify idempotency before enabling retries.

- **Stale Connection Retry**: Retrying on a stale connection handle produces the same error repeatedly. Ensure retry logic creates fresh connections for each attempt.

- **Ignoring Backpressure Signals**: When a service returns HTTP 429 with a Retry-After header, ignoring this signal and retrying with a shorter delay violates the service's rate limiting contract and may result in longer-term throttling or blocking.

## Testing Retry Logic

Retry logic requires dedicated testing strategies. Property-based testing with [StreamData](@/glossary/property-based-testing.md) can verify invariants like "total delay never exceeds max_delay * max_attempts" and "successful operations are never retried." Deterministic testing requires controlling the random number generator and time source:

```elixir
defmodule Prismatic.RetryTest do
  use ExUnit.Case, async: true

  @spec test_retry_succeeds_on_second_attempt() :: :ok
  test "succeeds on second attempt after transient failure" do
    call_count = :counters.new(1, [:atomics])

    result =
      Prismatic.Retry.with_retry(
        [strategy: :fixed, base_delay: 1, max_attempts: 3],
        fn ->
          :counters.add(call_count, 1, 1)

          if :counters.get(call_count, 1) == 1 do
            {:error, :timeout}
          else
            {:ok, :success}
          end
        end
      )

    assert {:ok, :success} = result
    assert :counters.get(call_count, 1) == 2
  end
end
```

## Related Concepts

- [Circuit Breaker](@/glossary/circuit-breaker.md) - Complementary pattern that stops retries when failure is sustained
- [Idempotency](@/glossary/idempotency.md) - Property ensuring retry safety for repeated operations
- [Fault Tolerance](@/glossary/fault-tolerance.md) - System resilience that retry patterns help achieve
- [Backpressure](@/glossary/backpressure.md) - Flow control preventing retry-induced overload
- [Rate Limiting](@/glossary/rate-limiting.md) - Request throttling that retry strategies must respect
- [GenServer](@/glossary/genserver.md) - Process abstraction implementing retry state machines
- [Supervision Tree](@/glossary/supervision-tree.md) - OTP hierarchy providing process-level retry via restart strategies
- [Distributed System](@/glossary/distributed-system.md) - Architecture context where retry patterns are essential
- [Telemetry](@/glossary/telemetry.md) - Observability framework for retry monitoring
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing methodology for verifying retry invariants

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
