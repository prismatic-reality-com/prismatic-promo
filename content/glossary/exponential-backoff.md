+++
title = "Exponential Backoff"
weight = 50
[extra]
tags = ["glossary", "resilience", "distributed-systems", "retry", "fault-tolerance", "networking", "reliability", "otp"]
description = "Exponential backoff is a retry strategy where the delay between successive retry attempts increases exponentially, preventing thundering herd problems and allowing failing systems time to recover."
category = "resilience"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["circuit-breaker", "retry-pattern", "fault-tolerance", "backpressure", "rate-limiting", "distributed-systems", "reliability", "error-handling", "self-healing", "resilience"]
key_takeaway = "Exponential backoff prevents cascading failures in distributed systems by progressively increasing delay between retries, giving overloaded services time to recover while adding jitter to prevent synchronized retry storms."
version = "2.0.0"
word_count = 1822
date_modified = "2026-02-23"
keywords = ["Exponential", "Backoff", "glossary", "resilience", "Prismatic Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Exponential Backoff - Prismatic Platform"
+++

## Definition

Exponential backoff is a retry strategy in which the wait time between consecutive retry attempts grows exponentially -- typically doubling with each attempt. If the first retry waits 1 second, the second waits 2 seconds, the third waits 4 seconds, the fourth waits 8 seconds, and so on. This geometric progression serves two critical purposes: it gives failing systems progressively longer recovery windows, and it naturally reduces the load on an overloaded service by spacing out retry attempts.

The general formula for exponential backoff delay is:

```
delay = base_delay * multiplier^attempt + random_jitter
```

Where `base_delay` is the initial wait time, `multiplier` is typically 2, `attempt` is the zero-indexed retry count, and `random_jitter` is a random component added to prevent synchronized retries from multiple clients (the "thundering herd" problem).

## Overview

Exponential backoff emerged from early work on Ethernet collision management (the binary exponential backoff algorithm in the ALOHA protocol and later IEEE 802.3 Ethernet). When two stations on a shared medium detected a collision, they each waited a random time before retransmitting. The wait time was bounded by an exponentially growing window, ensuring that as congestion increased, stations backed off more aggressively.

The same principle applies perfectly to modern distributed systems. When a service becomes unavailable -- whether due to deployment, overload, network partition, or hardware failure -- the clients that depend on it must decide how to handle the failure. The naive approach of immediately retrying is catastrophic at scale: if a service goes down and all its clients retry simultaneously, the moment the service comes back up it is immediately overwhelmed by the retry storm, potentially causing it to fail again (a phenomenon known as a "retry storm" or "thundering herd").

Exponential backoff solves this by ensuring that retry attempts become progressively less frequent. Combined with jitter (randomization of the delay), it decorrelates the retry timing across clients, spreading the load over time rather than concentrating it at specific moments.

### The Mathematics of Backoff

Consider a system with 10,000 clients retrying against a recovering service:

- **Without backoff** (immediate retry): 10,000 requests per second continuously
- **With linear backoff** (1s, 2s, 3s...): Requests decrease linearly, still significant overlap
- **With exponential backoff** (1s, 2s, 4s, 8s...): After 5 retries, only clients that have been failing for 31+ seconds are still retrying, and their next attempt is 32 seconds away
- **With exponential backoff + jitter**: The remaining retries are randomly distributed across each exponential window, eliminating synchronized spikes entirely

The exponential growth means that even in pathological scenarios, the system naturally converges toward a sustainable retry rate. This is one of the rare cases in distributed systems where a simple local decision rule (each client independently doubles its wait time) produces globally optimal behavior.

## Technical Details

### Elixir Implementation

Elixir's functional nature and OTP's process model make exponential backoff both natural and powerful to implement. Here is a production-grade implementation:

```elixir
defmodule Prismatic.Resilience.ExponentialBackoff do
  @moduledoc """
  Production-grade exponential backoff with jitter, maximum delay caps,
  and configurable retry budgets. Designed for use across the Prismatic
  Platform's distributed service interactions.
  """

  @type config :: %{
    base_delay_ms: pos_integer(),
    max_delay_ms: pos_integer(),
    max_retries: pos_integer(),
    multiplier: float(),
    jitter_strategy: :full | :equal | :decorrelated
  }

  @default_config %{
    base_delay_ms: 100,
    max_delay_ms: 30_000,
    multiplier: 2.0,
    max_retries: 10,
    jitter_strategy: :full
  }

  @spec with_backoff(config(), (pos_integer() -> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, :max_retries_exceeded, term()}
  def with_backoff(config \\ @default_config, operation) do
    do_retry(config, operation, 0, nil)
  end

  defp do_retry(%{max_retries: max} = _config, _operation, attempt, last_error)
       when attempt >= max do
    {:error, :max_retries_exceeded, last_error}
  end

  defp do_retry(config, operation, attempt, _last_error) do
    delay = calculate_delay(config, attempt)

    if attempt > 0 do
      Process.sleep(delay)
    end

    case operation.(attempt) do
      {:ok, result} ->
        {:ok, result}

      {:error, reason} ->
        do_retry(config, operation, attempt + 1, reason)
    end
  end

  @spec calculate_delay(config(), non_neg_integer()) :: non_neg_integer()
  def calculate_delay(config, attempt) do
    raw_delay = round(config.base_delay_ms * :math.pow(config.multiplier, attempt))
    capped_delay = min(raw_delay, config.max_delay_ms)
    apply_jitter(capped_delay, config.jitter_strategy)
  end

  defp apply_jitter(delay, :full) do
    :rand.uniform(max(delay, 1))
  end

  defp apply_jitter(delay, :equal) do
    half = div(delay, 2)
    half + :rand.uniform(max(half, 1))
  end

  defp apply_jitter(delay, :decorrelated) do
    min(delay, :rand.uniform(max(delay * 3, 1)))
  end
end
```

### GenServer Integration

In OTP applications, exponential backoff is commonly integrated into GenServer processes that must maintain connections to external services:

```elixir
defmodule Prismatic.Resilience.BackoffWorker do
  @moduledoc """
  A GenServer that automatically applies exponential backoff when
  its connection to an external service fails. Integrates with
  the platform's telemetry and health monitoring systems.
  """

  use GenServer
  require Logger

  @initial_backoff_ms 500
  @max_backoff_ms 60_000
  @multiplier 2.0

  defstruct [
    :service_name,
    :connect_fn,
    :connection,
    attempt: 0,
    state: :disconnected,
    backoff_ref: nil
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      service_name: Keyword.fetch!(opts, :service_name),
      connect_fn: Keyword.fetch!(opts, :connect_fn)
    }

    {:ok, state, {:continue, :connect}}
  end

  @impl true
  def handle_continue(:connect, state) do
    attempt_connection(state)
  end

  @impl true
  def handle_info(:reconnect, state) do
    attempt_connection(%{state | backoff_ref: nil})
  end

  defp attempt_connection(state) do
    case state.connect_fn.() do
      {:ok, connection} ->
        Logger.info("#{state.service_name}: Connected (attempt #{state.attempt})")
        emit_telemetry(:connected, state)
        {:noreply, %{state | connection: connection, attempt: 0, state: :connected}}

      {:error, reason} ->
        delay = calculate_backoff(state.attempt)

        Logger.warning(
          "#{state.service_name}: Connection failed (attempt #{state.attempt}, " <>
            "reason: #{inspect(reason)}), retrying in #{delay}ms"
        )

        emit_telemetry(:retry_scheduled, state, %{delay_ms: delay, reason: reason})
        ref = Process.send_after(self(), :reconnect, delay)
        {:noreply, %{state | attempt: state.attempt + 1, state: :backoff, backoff_ref: ref}}
    end
  end

  defp calculate_backoff(attempt) do
    raw = round(@initial_backoff_ms * :math.pow(@multiplier, attempt))
    capped = min(raw, @max_backoff_ms)
    :rand.uniform(max(capped, 1))
  end

  defp emit_telemetry(event, state, metadata \\ %{}) do
    :telemetry.execute(
      [:prismatic, :resilience, :backoff, event],
      %{attempt: state.attempt},
      Map.merge(metadata, %{service: state.service_name})
    )
  end
end
```

### Jitter Strategies

The choice of jitter strategy significantly impacts retry distribution. AWS's analysis (published in their Architecture Blog) identified three primary strategies:

**Full Jitter** (`delay = random(0, capped_delay)`) provides the widest distribution and lowest collision probability. It is the recommended default for most scenarios.

**Equal Jitter** (`delay = capped_delay/2 + random(0, capped_delay/2)`) guarantees a minimum delay of half the computed backoff. Useful when some minimum spacing between retries is required.

**Decorrelated Jitter** (`delay = min(cap, random(base, previous_delay * 3))`) ties each delay to the previous one, creating smoother retry curves. Effective when retry timing should not vary too dramatically between attempts.

## Implementation

### Integration with Circuit Breakers

Exponential backoff and circuit breakers are complementary patterns that are most effective when used together. The circuit breaker prevents requests from reaching a known-failing service, while exponential backoff governs the timing of probe requests that test whether the service has recovered.

In the Prismatic Platform, the combination works as follows:

1. **Closed state**: Requests flow normally with no backoff.
2. **Open state**: All requests are immediately rejected. No backoff needed because no retries are attempted.
3. **Half-open state**: A single probe request is sent. If it fails, the circuit returns to open and the backoff delay increases exponentially before the next probe.

This integration prevents the common anti-pattern of exponential backoff operating independently of circuit state, which can lead to situations where backed-off retries are still hitting a service the circuit breaker has already determined to be down.

### Configuring Backoff Parameters

The choice of base delay, multiplier, maximum delay, and maximum retries depends on the specific use case:

| Parameter | API Calls | Database | Message Queue | External Service |
|-----------|-----------|----------|---------------|-----------------|
| Base delay | 100ms | 50ms | 200ms | 1000ms |
| Multiplier | 2.0 | 1.5 | 2.0 | 2.0 |
| Max delay | 30s | 10s | 60s | 300s |
| Max retries | 5 | 8 | 10 | 15 |
| Jitter | Full | Equal | Decorrelated | Full |

These values are guidelines. Production systems should measure actual failure patterns and tune parameters based on observed recovery times.

## Comparison

### Retry Strategies Compared

| Strategy | Delay Pattern | Advantages | Disadvantages | When to Use |
|----------|--------------|------------|---------------|-------------|
| **No retry** | N/A | Simplest, no amplification | Fails on transient errors | Idempotency-critical paths |
| **Immediate retry** | 0, 0, 0... | Fast recovery for brief glitches | Amplifies overload | Never in production |
| **Fixed delay** | 1s, 1s, 1s... | Predictable | Still synchronized | Simple internal services |
| **Linear backoff** | 1s, 2s, 3s... | Gradual increase | Too slow to spread load | Low-concurrency scenarios |
| **Exponential backoff** | 1s, 2s, 4s, 8s... | Good load spreading | Can be synchronized | Most distributed systems |
| **Exponential + jitter** | Random within exponential bounds | Best load distribution | Slightly less predictable | Production default |
| **Adaptive** | Based on observed load | Optimal in theory | Requires load signals | Advanced systems with feedback |

### Exponential Backoff vs. Rate Limiting

While both exponential backoff and rate limiting control request flow, they operate at different levels. Rate limiting is server-side enforcement ("I will only accept N requests per second"). Exponential backoff is client-side courtesy ("I will space my retries to avoid overwhelming you"). A well-designed system uses both: the server enforces rate limits, and the client uses exponential backoff to comply gracefully when limits are hit.

## Best Practices

1. **Always use jitter.** Exponential backoff without jitter still produces synchronized retry waves. Full jitter is the recommended default.

2. **Set a maximum delay cap.** Without a cap, exponential growth can produce absurdly long delays (2^20 base_delay). Cap the delay at a reasonable upper bound (typically 30-300 seconds depending on the service).

3. **Set a maximum retry count.** Infinite retries are appropriate only for critical connections that must eventually succeed (e.g., database connections in a GenServer). For request-level retries, cap at 3-10 attempts.

4. **Log every retry with context.** Include the attempt number, computed delay, error reason, and service identifier. This is essential for diagnosing retry storms in production.

5. **Emit telemetry on retries.** Integrate with the platform's telemetry system to track retry rates, success-after-retry counts, and max-retry-exceeded events. Rising retry rates are an early warning of service degradation.

6. **Distinguish retryable from non-retryable errors.** A 400 Bad Request should not trigger retries (the request is malformed and will always fail). A 503 Service Unavailable should. Classify errors before entering the retry loop.

7. **Consider retry budgets.** Instead of per-request retry limits, consider per-service retry budgets: "this service may consume at most 10% of its traffic as retries." This prevents scenarios where many requests simultaneously exhaust their individual retry limits, amplifying load.

8. **Reset backoff on success.** When a retry succeeds, reset the attempt counter to zero. Some implementations retain a "suspicion" counter that decays over time, preventing the system from being overly optimistic after a single success.

## Pitfalls

### Common Mistakes

1. **Retrying non-idempotent operations.** If the original request might have succeeded but the response was lost, retrying a non-idempotent operation (e.g., transferring money) can cause duplicate side effects. Ensure idempotency before enabling retries, or use idempotency keys.

2. **Ignoring total timeout.** A backoff sequence of 1s, 2s, 4s, 8s, 16s, 32s totals 63 seconds. If the caller has a 30-second timeout, half the retries will never execute. Always calculate the total time budget before configuring backoff parameters.

3. **Backoff in tight loops.** Using `Process.sleep/1` in a GenServer's main loop blocks the process. Instead, use `Process.send_after/3` and handle the retry message asynchronously, keeping the process responsive to other messages.

4. **Forgetting to propagate backoff state.** In microservice chains (A calls B calls C), if C is failing and B is backing off, A must be aware of B's increased latency. Without proper timeout propagation, A may time out and retry, creating cascading retry amplification.

5. **Applying backoff to bulk operations.** If a batch of 1,000 items is being processed and one item fails, backing off the entire batch wastes time on the 999 items that would succeed. Isolate backoff to the granularity of the failing operation.

6. **Not testing backoff behavior.** Backoff logic is rarely tested because it requires time manipulation. Use dependency injection or time abstraction to make backoff testable without actually waiting.

7. **Using the same backoff for all failure modes.** A network timeout and a rate-limit response require different backoff strategies. Rate-limited responses often include a `Retry-After` header that should be respected instead of using computed backoff.

## Use Cases

### Platform-Specific Applications

**External API Integration.** The Prismatic Platform's OSINT adapters connect to dozens of external services (Shodan, VirusTotal, Censys, ARES, etc.). Each adapter uses exponential backoff with service-specific parameters tuned to the provider's rate limits and typical recovery times.

**Database Connection Recovery.** When a PostgreSQL connection is lost (network blip, failover, maintenance), the Ecto pool uses exponential backoff to reconnect. The GenServer-based approach ensures the process remains responsive to health check queries during the backoff period.

**Agent Communication.** In the multi-agent system, when an agent fails to reach a delegated agent, the orchestration layer applies exponential backoff before retrying the delegation. This prevents cascading failures in the agent hierarchy.

**Webhook Delivery.** When delivering event notifications via webhooks, failed deliveries are retried with exponential backoff. The platform tracks per-endpoint retry history and disables consistently failing endpoints after a configurable threshold.

**CI/CD Pipeline Retries.** GitLab CI jobs that depend on external services (npm registry, Docker Hub, Hex.pm) use exponential backoff in their retry configuration to handle transient availability issues.

## Related Concepts

Exponential backoff integrates with several resilience patterns in the Prismatic Platform:

- [Circuit Breaker](/glossary/circuit-breaker/) works in tandem with backoff to prevent requests to known-failing services
- [Retry Pattern](/glossary/retry-pattern/) is the broader category of which exponential backoff is the most common implementation
- [Fault Tolerance](/glossary/fault-tolerance/) describes the system property that backoff strategies help achieve
- [Backpressure](/glossary/backpressure/) is a complementary flow control mechanism that operates at the producer-consumer boundary
- [Rate Limiting](/glossary/rate-limiting/) is the server-side counterpart to client-side exponential backoff
- [Self-Healing](/glossary/self-healing/) uses backoff timing to pace recovery attempts in autonomous systems
- [Error Handling](/glossary/error-handling/) provides the error classification that determines whether backoff should be applied
- [Distributed Systems](/glossary/distributed-systems/) is the architectural context where exponential backoff is most critical
- [Reliability](/glossary/reliability/) is the quality attribute that exponential backoff directly supports
- [Bulkhead Pattern](/glossary/bulkhead-pattern/) provides isolation that prevents backoff in one service from affecting others

## See Also

- [Let It Crash](/glossary/let-it-crash/) -- the Erlang/OTP philosophy that complements backoff-based recovery
- [GenServer](/glossary/genserver/) -- the OTP behavior commonly used to implement backoff workers
- [Telemetry](/glossary/telemetry/) -- the instrumentation layer for monitoring backoff behavior
- [Connection Pooling](/glossary/connection-pooling/) -- pool-level backoff for database connection recovery
- [Chaos Engineering](/glossary/chaos-engineering/) -- testing backoff behavior under controlled failure conditions

---

**Connect & Contribute**: Exponential backoff is a fundamental resilience pattern in the Prismatic Platform. Visit the [Prismatic Platform repository](https://github.com/korczis/prismatic-platform) to explore the production implementation, review the resilience module architecture, or connect with the community through [GitHub Discussions](https://github.com/korczis/prismatic-platform/discussions). Created by [Tomas Korcak (korczis)](https://github.com/korczis).
