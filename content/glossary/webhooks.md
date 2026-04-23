+++
title = "Webhooks"
weight = 50
[extra]
tags = ["glossary", "webhooks", "event-driven", "api-integration", "http-callbacks", "retry-strategies", "idempotency", "webhook-security", "hmac", "payload-delivery"]
description = "HTTP callback mechanism enabling event-driven integration between systems through push-based notification delivery. In Prismatic: webhook infrastructure for real-time event propagation across 115 umbrella applications, HMAC signature verification, exponential backoff retry strategies, idempotent delivery guarantees, and dead letter queue management."
category = "integration"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Integration & Communication"
related_concepts = ["HTTP callbacks", "event-driven architecture", "publish-subscribe", "push notifications", "server-sent events", "WebSocket", "message queues", "idempotency", "HMAC authentication", "retry policies"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["http", "api", "event-driven-architecture", "security"]
learning_path = ["http-basics", "api-design", "event-driven-architecture", "webhooks", "message-queues", "distributed-systems"]
interactive_demos = ["/labs/glossary/webhooks"]
code_examples = ["WebhookDispatcher", "WebhookReceiver", "SignatureVerifier", "RetryScheduler", "DeadLetterQueue", "PayloadSerializer"]
external_resources = ["https://webhooks.fyi/", "https://www.svix.com/resources/faq/what-are-webhooks/", "https://stripe.com/docs/webhooks", "https://docs.github.com/en/webhooks"]
version_introduced = "gen-6"
stability_level = "stable"
testing_scenarios = ["signature verification correctness", "retry backoff timing", "idempotent delivery deduplication", "dead letter queue overflow", "payload size limit enforcement", "concurrent delivery ordering"]
keywords = ["webhooks", "HTTP callbacks", "event-driven", "push notifications", "HMAC", "retry strategy", "idempotency", "dead letter queue", "webhook security", "payload delivery"]
related_terms = ["api-integration", "api-gateway", "api", "websocket", "event-driven-architecture", "authentication", "authorization", "structured-logging", "telemetry", "backpressure", "stream-processing", "distributed-systems"]
learning_outcomes = ["Design secure webhook delivery systems with HMAC signature verification", "Implement exponential backoff retry strategies with jitter", "Build idempotent webhook receivers that handle duplicate deliveries", "Configure dead letter queues for failed webhook deliveries", "Evaluate trade-offs between webhooks, polling, WebSockets, and SSE"]
word_count = 1576
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Webhooks - Prismatic Platform"
+++

## Definition

**Webhooks** are user-defined HTTP callbacks that enable event-driven communication between systems through push-based notification delivery. When a specific event occurs in a source system (e.g., a new commit is pushed, a payment is processed, a security alert triggers), the source system sends an HTTP POST request containing event data to a pre-configured URL on the receiving system. This inverts the traditional request-response pattern: instead of the consumer polling the producer for updates, the producer pushes updates to the consumer as they happen. Within the Prismatic Platform, webhooks serve as a primary integration mechanism for connecting the 115 umbrella [applications](@/glossary/application.md) with external systems, propagating [telemetry](@/glossary/telemetry.md) events to monitoring services, delivering security alerts from the [Perimeter](@/glossary/attack-surface.md) module, and enabling real-time synchronization with GitLab, GitHub, and third-party services. The platform's webhook infrastructure implements HMAC signature verification, exponential backoff retry with jitter, idempotent delivery guarantees, and dead letter queue management for undeliverable payloads.

## Overview

The webhook pattern emerged from the practical need for real-time inter-system communication without the overhead of persistent connections or continuous polling. The term "webhook" was coined by Jeff Lindsay in 2007, though the underlying pattern -- HTTP callbacks triggered by events -- predates the name. PayPal's Instant Payment Notification (IPN) system, introduced in 2000, is one of the earliest production implementations of the webhook concept.

Webhooks occupy a specific position in the spectrum of integration patterns:

| Pattern | Direction | Latency | Complexity | Connection |
|---------|-----------|---------|------------|------------|
| **Polling** | Pull | High (interval-dependent) | Low | Stateless |
| **Long Polling** | Pull | Medium | Medium | Semi-persistent |
| **Webhooks** | Push | Low (near real-time) | Medium | Stateless |
| **Server-Sent Events** | Push | Low | Medium | Persistent (one-way) |
| **WebSocket** | Bidirectional | Very Low | High | Persistent (two-way) |
| **Message Queue** | Push/Pull | Configurable | High | Broker-mediated |

Webhooks strike a balance between simplicity and real-time capability. They require no persistent connections (unlike [WebSocket](@/glossary/websocket.md)), no message broker infrastructure (unlike AMQP/Kafka), and no continuous resource expenditure (unlike polling). However, they introduce challenges around reliability (what happens when the receiver is down?), security (how do you verify the payload is authentic?), and ordering (how do you handle out-of-order delivery?).

The modern webhook ecosystem has converged on several best practices:

1. **HMAC Signature Verification** -- Every webhook payload is signed with a shared secret using HMAC-SHA256, allowing the receiver to verify authenticity and integrity.

2. **Exponential Backoff Retry** -- Failed deliveries are retried with exponentially increasing delays (1s, 2s, 4s, 8s, ...) plus random jitter to prevent thundering herd problems.

3. **Idempotent Delivery** -- Each event carries a unique identifier, allowing receivers to deduplicate retried deliveries and process each event exactly once.

4. **Dead Letter Queues** -- After exhausting retry attempts, undeliverable payloads are stored in a dead letter queue for manual investigation and reprocessing.

5. **Payload Signing with Timestamp** -- Including a timestamp in the signature prevents replay attacks where an attacker captures and re-sends a valid webhook payload.

## Historical Context

The evolution of webhooks reflects the broader shift from synchronous, request-response architectures to event-driven, reactive systems:

**2000-2005: Proto-Webhooks.** PayPal IPN, Amazon SNS precursors, and various "callback URL" patterns emerged as ad-hoc solutions for real-time notification. Each implementation was proprietary with no common standard.

**2007: The Term Emerges.** Jeff Lindsay coined "webhook" and advocated for them as a general-purpose integration pattern. His blog posts and talks promoted the idea that any web application should be able to send HTTP notifications to any other web application.

**2010-2015: Mainstream Adoption.** GitHub (2010), Stripe (2012), Twilio, Slack, and hundreds of SaaS platforms adopted webhooks as their primary integration mechanism. The pattern became the de facto standard for API event notification.

**2016-2020: Standardization Efforts.** The lack of a common webhook standard led to fragmentation: every provider implemented signing, retries, and payloads differently. Efforts like the CloudEvents specification (CNCF, 2018) and the Standard Webhooks initiative (Svix, 2023) began addressing this fragmentation.

**2020-Present: Enterprise-Grade Infrastructure.** Webhook delivery evolved from "fire and forget" HTTP calls to sophisticated infrastructure with guaranteed delivery, observability, fan-out, and transformation. Services like Svix, Hookdeck, and Convoy provide managed webhook infrastructure.

## Technical Details

### Webhook Dispatcher

The Prismatic Platform's webhook dispatcher handles outbound webhook delivery with retry logic, signature generation, and dead letter management:

```elixir
defmodule Prismatic.Webhooks.Dispatcher do
  @moduledoc """
  Dispatches webhook payloads to registered endpoints with HMAC-SHA256
  signature verification, exponential backoff retry, and dead letter
  queue management. Each delivery attempt is logged for observability.

  The dispatcher uses a GenServer-based architecture with a configurable
  pool of delivery workers to handle concurrent outbound webhooks without
  blocking the calling process.
  """

  use GenServer

  @type webhook_event :: %{
    id: String.t(),
    type: String.t(),
    timestamp: DateTime.t(),
    payload: map(),
    source: String.t()
  }
  @type delivery_config :: %{
    url: String.t(),
    secret: String.t(),
    max_retries: non_neg_integer(),
    timeout_ms: pos_integer(),
    headers: [{String.t(), String.t()}]
  }
  @type delivery_result ::
          {:ok, delivery_receipt()}
          | {:retry, non_neg_integer()}
          | {:dead_letter, String.t()}
  @type delivery_receipt :: %{
    event_id: String.t(),
    endpoint: String.t(),
    status_code: pos_integer(),
    delivered_at: DateTime.t(),
    attempt: pos_integer(),
    duration_ms: non_neg_integer()
  }

  @max_retries 8
  @base_delay_ms 1_000
  @max_delay_ms 300_000
  @request_timeout_ms 30_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec dispatch(webhook_event(), delivery_config()) :: delivery_result()
  def dispatch(event, config) do
    GenServer.call(__MODULE__, {:dispatch, event, config}, @request_timeout_ms * 2)
  end

  @spec dispatch_async(webhook_event(), delivery_config()) :: :ok
  def dispatch_async(event, config) do
    GenServer.cast(__MODULE__, {:dispatch_async, event, config})
  end

  @impl true
  def init(opts) do
    {:ok,
     %{
       max_retries: Keyword.get(opts, :max_retries, @max_retries),
       base_delay_ms: Keyword.get(opts, :base_delay_ms, @base_delay_ms),
       in_flight: %{},
       dead_letter_queue: :queue.new()
     }}
  end

  @impl true
  def handle_call({:dispatch, event, config}, _from, state) do
    result = attempt_delivery(event, config, 1, state.max_retries)
    {:reply, result, state}
  end

  @impl true
  def handle_cast({:dispatch_async, event, config}, state) do
    Task.start(fn -> attempt_delivery(event, config, 1, state.max_retries) end)
    {:noreply, state}
  end

  @spec attempt_delivery(webhook_event(), delivery_config(), pos_integer(), non_neg_integer()) ::
          delivery_result()
  defp attempt_delivery(event, config, attempt, max_retries) do
    payload = Jason.encode!(event.payload)
    timestamp = System.system_time(:second)
    signature = compute_signature(payload, timestamp, config.secret)

    headers = [
      {"Content-Type", "application/json"},
      {"X-Webhook-Id", event.id},
      {"X-Webhook-Timestamp", Integer.to_string(timestamp)},
      {"X-Webhook-Signature", "v1=#{signature}"},
      {"User-Agent", "Prismatic-Webhooks/1.0"}
      | config.headers
    ]

    start_time = System.monotonic_time(:millisecond)

    case Req.post(config.url, body: payload, headers: headers, receive_timeout: @request_timeout_ms) do
      {:ok, %{status: status}} when status in 200..299 ->
        duration = System.monotonic_time(:millisecond) - start_time

        {:ok,
         %{
           event_id: event.id,
           endpoint: config.url,
           status_code: status,
           delivered_at: DateTime.utc_now(),
           attempt: attempt,
           duration_ms: duration
         }}

      {:ok, %{status: status}} when attempt < max_retries ->
        delay = calculate_backoff(attempt)
        Process.sleep(delay)
        attempt_delivery(event, config, attempt + 1, max_retries)

      {:ok, %{status: status}} ->
        {:dead_letter, "HTTP #{status} after #{attempt} attempts"}

      {:error, reason} when attempt < max_retries ->
        delay = calculate_backoff(attempt)
        Process.sleep(delay)
        attempt_delivery(event, config, attempt + 1, max_retries)

      {:error, reason} ->
        {:dead_letter, "Error: #{inspect(reason)} after #{attempt} attempts"}
    end
  end

  @spec compute_signature(String.t(), integer(), String.t()) :: String.t()
  defp compute_signature(payload, timestamp, secret) do
    message = "#{timestamp}.#{payload}"

    :crypto.mac(:hmac, :sha256, secret, message)
    |> Base.encode16(case: :lower)
  end

  @spec calculate_backoff(pos_integer()) :: non_neg_integer()
  defp calculate_backoff(attempt) do
    base = @base_delay_ms * :math.pow(2, attempt - 1) |> trunc()
    jitter = :rand.uniform(div(base, 2))
    min(base + jitter, @max_delay_ms)
  end
end
```

### Webhook Receiver and Verification

The receiving side must verify webhook authenticity before processing:

```elixir
defmodule Prismatic.Webhooks.Receiver do
  @moduledoc """
  Receives and verifies inbound webhooks using HMAC-SHA256 signature
  validation, timestamp-based replay protection, and idempotent
  processing with event deduplication.

  Security features:
  - HMAC-SHA256 signature verification against shared secret
  - Timestamp validation (rejects payloads older than 5 minutes)
  - Event ID deduplication (prevents replay attacks)
  - Payload size limits (prevents DoS via oversized payloads)
  """

  @type verification_result :: {:ok, map()} | {:error, verification_error()}
  @type verification_error ::
          :invalid_signature
          | :expired_timestamp
          | :duplicate_event
          | :payload_too_large
          | :missing_headers

  @max_payload_bytes 1_048_576
  @timestamp_tolerance_seconds 300
  @dedup_ttl_seconds 86_400

  @spec verify_and_process(Plug.Conn.t(), String.t(), (map() -> term())) :: verification_result()
  def verify_and_process(conn, secret, handler_fn) do
    with {:ok, payload} <- read_body(conn),
         {:ok, headers} <- extract_headers(conn),
         :ok <- verify_payload_size(payload),
         :ok <- verify_timestamp(headers.timestamp),
         :ok <- verify_signature(payload, headers.timestamp, headers.signature, secret),
         :ok <- check_idempotency(headers.event_id) do
      event = Jason.decode!(payload)
      result = handler_fn.(event)
      record_processed(headers.event_id)
      {:ok, result}
    end
  end

  @spec verify_signature(String.t(), String.t(), String.t(), String.t()) ::
          :ok | {:error, :invalid_signature}
  defp verify_signature(payload, timestamp, signature, secret) do
    expected_signature = compute_expected_signature(payload, timestamp, secret)

    # Use constant-time comparison to prevent timing attacks
    if Plug.Crypto.secure_compare("v1=#{expected_signature}", signature) do
      :ok
    else
      {:error, :invalid_signature}
    end
  end

  @spec verify_timestamp(String.t()) :: :ok | {:error, :expired_timestamp}
  defp verify_timestamp(timestamp_str) do
    timestamp = String.to_integer(timestamp_str)
    current = System.system_time(:second)

    if abs(current - timestamp) <= @timestamp_tolerance_seconds do
      :ok
    else
      {:error, :expired_timestamp}
    end
  end

  @spec check_idempotency(String.t()) :: :ok | {:error, :duplicate_event}
  defp check_idempotency(event_id) do
    case :ets.lookup(:webhook_processed_events, event_id) do
      [] -> :ok
      [_] -> {:error, :duplicate_event}
    end
  end

  @spec compute_expected_signature(String.t(), String.t(), String.t()) :: String.t()
  defp compute_expected_signature(payload, timestamp, secret) do
    message = "#{timestamp}.#{payload}"

    :crypto.mac(:hmac, :sha256, secret, message)
    |> Base.encode16(case: :lower)
  end

  @spec record_processed(String.t()) :: true
  defp record_processed(event_id) do
    :ets.insert(:webhook_processed_events, {event_id, System.system_time(:second)})
  end
end
```

### Dead Letter Queue Management

When webhooks fail after exhausting all retry attempts, they are stored in a dead letter queue for manual investigation:

```elixir
defmodule Prismatic.Webhooks.DeadLetterQueue do
  @moduledoc """
  Manages undeliverable webhook payloads that have exhausted retry
  attempts. Provides storage, inspection, and replay capabilities
  for failed deliveries. Uses ETS for fast in-memory access with
  periodic persistence to disk.
  """

  use GenServer

  @type dead_letter :: %{
    id: String.t(),
    event: map(),
    endpoint: String.t(),
    failure_reason: String.t(),
    attempts: pos_integer(),
    first_attempt: DateTime.t(),
    last_attempt: DateTime.t(),
    status: :pending_review | :replaying | :abandoned
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec enqueue(map(), String.t(), String.t(), pos_integer()) :: :ok
  def enqueue(event, endpoint, reason, attempts) do
    GenServer.cast(__MODULE__, {:enqueue, event, endpoint, reason, attempts})
  end

  @spec list_pending(non_neg_integer()) :: [dead_letter()]
  def list_pending(limit \\ 100) do
    GenServer.call(__MODULE__, {:list_pending, limit})
  end

  @spec replay(String.t()) :: {:ok, term()} | {:error, term()}
  def replay(dead_letter_id) do
    GenServer.call(__MODULE__, {:replay, dead_letter_id}, 60_000)
  end

  @spec stats() :: %{pending: non_neg_integer(), replayed: non_neg_integer(), abandoned: non_neg_integer()}
  def stats do
    GenServer.call(__MODULE__, :stats)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:webhook_dead_letters, [:set, :protected])
    {:ok, %{table: table, counter: 0}}
  end

  @impl true
  def handle_cast({:enqueue, event, endpoint, reason, attempts}, state) do
    id = "dlq-#{state.counter + 1}-#{System.unique_integer([:positive])}"
    now = DateTime.utc_now()

    dead_letter = %{
      id: id,
      event: event,
      endpoint: endpoint,
      failure_reason: reason,
      attempts: attempts,
      first_attempt: now,
      last_attempt: now,
      status: :pending_review
    }

    :ets.insert(state.table, {id, dead_letter})
    {:noreply, %{state | counter: state.counter + 1}}
  end

  @impl true
  def handle_call({:list_pending, limit}, _from, state) do
    pending =
      :ets.tab2list(state.table)
      |> Enum.map(fn {_id, dl} -> dl end)
      |> Enum.filter(&(&1.status == :pending_review))
      |> Enum.sort_by(& &1.last_attempt, {:desc, DateTime})
      |> Enum.take(limit)

    {:reply, pending, state}
  end
end
```

### Retry Strategy Design

The choice of retry strategy significantly impacts webhook delivery reliability and system load:

```elixir
defmodule Prismatic.Webhooks.RetryStrategy do
  @moduledoc """
  Configurable retry strategies for webhook delivery. Supports
  exponential backoff, linear backoff, and fixed-interval strategies
  with optional jitter and circuit breaker integration.
  """

  @type strategy :: :exponential | :linear | :fixed
  @type config :: %{
    strategy: strategy(),
    base_delay_ms: pos_integer(),
    max_delay_ms: pos_integer(),
    max_retries: non_neg_integer(),
    jitter: boolean(),
    jitter_factor: float()
  }

  @spec default_config() :: config()
  def default_config do
    %{
      strategy: :exponential,
      base_delay_ms: 1_000,
      max_delay_ms: 300_000,
      max_retries: 8,
      jitter: true,
      jitter_factor: 0.5
    }
  end

  @spec next_delay(config(), pos_integer()) :: non_neg_integer()
  def next_delay(config, attempt) do
    base =
      case config.strategy do
        :exponential -> config.base_delay_ms * trunc(:math.pow(2, attempt - 1))
        :linear -> config.base_delay_ms * attempt
        :fixed -> config.base_delay_ms
      end

    capped = min(base, config.max_delay_ms)

    if config.jitter do
      jitter_range = trunc(capped * config.jitter_factor)
      capped + :rand.uniform(max(jitter_range, 1))
    else
      capped
    end
  end

  @doc """
  Calculates the total maximum time a retry sequence can take.
  Useful for SLA calculations and timeout configuration.
  """
  @spec max_total_duration(config()) :: non_neg_integer()
  def max_total_duration(config) do
    1..config.max_retries
    |> Enum.map(&next_delay(%{config | jitter: false}, &1))
    |> Enum.sum()
  end
end
```

## Security Considerations

Webhook security is a critical concern because webhooks involve accepting inbound HTTP requests from external systems. The primary threats are:

1. **Spoofing** -- An attacker sends forged webhook payloads to trigger unauthorized actions. Mitigated by HMAC signature verification with a shared secret known only to sender and receiver.

2. **Replay Attacks** -- An attacker captures a valid webhook payload and re-sends it. Mitigated by including a timestamp in the signature and rejecting payloads older than a tolerance window (typically 5 minutes).

3. **Payload Tampering** -- An attacker modifies a webhook payload in transit. Mitigated by HMAC signature verification (any modification invalidates the signature).

4. **Denial of Service** -- An attacker sends many large payloads to overwhelm the receiver. Mitigated by payload size limits, rate limiting, and [backpressure](@/glossary/backpressure.md) mechanisms.

5. **Information Disclosure** -- Webhook payloads may contain sensitive data transmitted over the network. Mitigated by using HTTPS exclusively and minimizing sensitive data in payloads (send event identifiers rather than full records).

The Prismatic Platform enforces HMAC-SHA256 signature verification on all webhook endpoints, with constant-time comparison to prevent timing side-channel attacks. Timestamps are validated within a 5-minute tolerance window. Event IDs are tracked in an ETS table for deduplication within a 24-hour window.

## Webhooks vs. Alternative Integration Patterns

### Webhooks vs. Polling

Polling requires the consumer to repeatedly query the producer for changes. This is simple but wasteful: most requests return "no changes." Webhooks eliminate this waste by pushing updates only when events occur. However, polling provides a natural consistency mechanism (you always get the latest state), while webhooks may arrive out of order or be lost.

### Webhooks vs. WebSockets

[WebSocket](@/glossary/websocket.md) provides persistent bidirectional communication. It excels for real-time interactive applications (chat, live updates) but requires maintaining open connections and managing connection state. Webhooks are stateless and work well for system-to-system integration where real-time latency is acceptable and bidirectional communication is not needed.

### Webhooks vs. Message Queues

Message queues (RabbitMQ, Kafka, SQS) provide guaranteed delivery, ordering, and fan-out capabilities that webhooks lack. However, they require additional infrastructure (broker deployment, queue management) and add complexity. Webhooks are often the right choice when integrating with external systems that cannot connect to your message broker.

## Platform Integration

The Prismatic Platform uses webhooks extensively:

- **GitLab/GitHub Integration** -- Receiving push events, merge request updates, and CI/CD pipeline notifications
- **Security Alerts** -- Delivering [Perimeter](@/glossary/attack-surface.md) findings to external security information and event management (SIEM) systems
- **Monitoring** -- Pushing [telemetry](@/glossary/telemetry.md) events to external observability platforms
- **Agent Notifications** -- Cross-system event propagation when AIAD [agents](@/glossary/agent.md) complete tasks
- **Compliance Reporting** -- Automated delivery of compliance assessment results to stakeholder systems

## Cross-References

- [API Integration](@/glossary/api-integration.md) -- The broader context of system-to-system communication that webhooks enable
- [API Gateway](@/glossary/api-gateway.md) -- The entry point that routes inbound webhooks to appropriate handlers
- [API](@/glossary/api.md) -- The foundational HTTP interface that webhooks build upon
- [WebSocket](@/glossary/websocket.md) -- The persistent bidirectional alternative to webhooks for real-time communication
- [Authentication](@/glossary/authentication.md) -- HMAC signature verification as a form of message authentication
- [Telemetry](@/glossary/telemetry.md) -- Event data that may be delivered via webhooks to external systems
- [Backpressure](@/glossary/backpressure.md) -- Flow control mechanisms for managing webhook delivery rates
- [Stream Processing](@/glossary/stream-processing.md) -- Processing webhook event streams at scale
- [Structured Logging](@/glossary/structured-logging.md) -- Logging webhook delivery attempts for observability
- [Audit Trail](@/glossary/audit-trail.md) -- Recording webhook deliveries for compliance and debugging

## Best Practices

1. **Always verify signatures.** Never process a webhook payload without verifying its HMAC signature. Use constant-time comparison to prevent timing attacks.

2. **Return 200 quickly.** Acknowledge receipt of the webhook immediately (return HTTP 200) and process the payload asynchronously. Long processing times trigger sender-side timeouts and unnecessary retries.

3. **Design for idempotency.** Webhook deliveries may be retried, delivering the same event multiple times. Use event IDs to deduplicate and ensure that processing the same event twice produces the same result.

4. **Implement dead letter queues.** Not all delivery failures are transient. After exhausting retries, store undeliverable webhooks for manual investigation rather than silently dropping them.

5. **Use exponential backoff with jitter.** Fixed retry intervals create thundering herd problems when many webhooks fail simultaneously. Exponential backoff spreads retries over time, and jitter prevents synchronized retry storms.

6. **Log everything.** Record every delivery attempt, response status, latency, and failure reason. Webhook debugging without logs is nearly impossible.

7. **Validate payloads strictly.** Even after signature verification, validate the payload structure and content before processing. Defense in depth prevents bugs from propagating through invalid data.

## Common Pitfalls

- **No signature verification.** Processing webhooks without verifying HMAC signatures opens the system to spoofing attacks.
- **Synchronous processing.** Processing webhooks synchronously in the HTTP handler causes timeouts and cascading failures.
- **No idempotency.** Assuming exactly-once delivery leads to duplicate processing and data inconsistency.
- **Unbounded retries.** Retrying forever against a permanently failing endpoint wastes resources and may violate rate limits.
- **Ignoring ordering.** Webhooks may arrive out of order. Designs that depend on strict ordering must implement sequence tracking.
- **Exposing secrets in logs.** Accidentally logging webhook secrets or full signed payloads creates security vulnerabilities.

## Further Reading

- Standard Webhooks Specification (webhooks.fyi) -- Emerging standard for webhook delivery, signing, and retry
- Stripe Webhook Best Practices -- Industry-leading documentation on webhook implementation patterns
- CloudEvents Specification (CNCF) -- Standardized event format compatible with webhook delivery
- Svix Webhook Documentation -- Comprehensive guide to webhook infrastructure design

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
