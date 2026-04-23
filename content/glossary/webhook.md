+++
title = "Webhook"
weight = 50
[extra]
description = "HTTP callback notification mechanism that pushes event data to registered URLs when specific triggers occur"
category = "infrastructure"
related_terms = ["api", "event", "pubsub", "http"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["webhook", "HTTP callback", "event notification", "push notification", "API integration", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Webhook - Prismatic Platform"
+++

## Definition & Overview

A webhook is an HTTP callback mechanism where an application sends an HTTP POST request to a pre-configured URL whenever a specific event occurs. Unlike traditional polling where a client repeatedly asks "has anything changed?", webhooks push notifications to interested parties in real-time as events happen. This push-based architecture is more efficient, reduces latency, and eliminates wasteful polling requests.

Webhooks follow a simple pattern: a subscriber registers a URL with the event source, and when a triggering event occurs, the source constructs a JSON payload describing the event and sends it as an HTTP POST to the registered URL. The subscriber's server processes the payload and responds with a 2xx status code to acknowledge receipt. If delivery fails, the source typically retries with exponential backoff.

The Prismatic Platform uses webhooks in both directions. Outbound webhooks notify external systems when significant events occur: OSINT tool execution results, DD pipeline load completions, security rating changes, and quality gate violations. Inbound webhooks receive notifications from external services like GitHub (repository events), GitLab (CI/CD pipeline status), and monitoring services (alert notifications). This bidirectional webhook architecture enables the platform to participate in event-driven workflows without tight coupling.

## Technical Deep Dive

The platform implements a webhook delivery system with retry logic and signature verification:

```elixir
defmodule PrismaticWebhook.Delivery do
  @moduledoc """
  Webhook delivery system with retry logic, signature
  verification, and delivery tracking.
  """

  @max_retries 5
  @initial_backoff_ms 1_000
  @backoff_multiplier 2

  @type delivery_result :: %{
    webhook_id: String.t(),
    url: String.t(),
    status: :delivered | :failed | :retrying,
    attempts: non_neg_integer(),
    response_code: pos_integer() | nil,
    delivered_at: DateTime.t() | nil
  }

  @spec deliver(String.t(), map(), keyword()) :: {:ok, delivery_result()} | {:error, delivery_result()}
  def deliver(url, payload, opts \\ []) do
    secret = Keyword.get(opts, :secret)
    webhook_id = generate_webhook_id()
    body = Jason.encode!(payload)
    signature = if secret, do: compute_signature(body, secret), else: nil

    headers = build_headers(webhook_id, signature)

    deliver_with_retry(url, body, headers, webhook_id, 0)
  end

  defp deliver_with_retry(url, body, headers, webhook_id, attempt)
       when attempt >= @max_retries do
    {:error, %{
      webhook_id: webhook_id,
      url: url,
      status: :failed,
      attempts: attempt,
      response_code: nil,
      delivered_at: nil
    }}
  end

  defp deliver_with_retry(url, body, headers, webhook_id, attempt) do
    case Tesla.post(url, body, headers: headers) do
      {:ok, %{status: status}} when status in 200..299 ->
        {:ok, %{
          webhook_id: webhook_id,
          url: url,
          status: :delivered,
          attempts: attempt + 1,
          response_code: status,
          delivered_at: DateTime.utc_now()
        }}

      {:ok, %{status: status}} when status in 400..499 ->
        {:error, %{
          webhook_id: webhook_id,
          url: url,
          status: :failed,
          attempts: attempt + 1,
          response_code: status,
          delivered_at: nil
        }}

      _ ->
        backoff = @initial_backoff_ms * Integer.pow(@backoff_multiplier, attempt)
        Process.sleep(backoff)
        deliver_with_retry(url, body, headers, webhook_id, attempt + 1)
    end
  end

  defp build_headers(webhook_id, signature) do
    base = [
      {"content-type", "application/json"},
      {"x-webhook-id", webhook_id},
      {"x-webhook-timestamp", DateTime.utc_now() |> DateTime.to_iso8601()}
    ]

    if signature do
      [{"x-webhook-signature", "sha256=#{signature}"} | base]
    else
      base
    end
  end

  defp compute_signature(body, secret) do
    :crypto.mac(:hmac, :sha256, secret, body)
    |> Base.hex_encode32(case: :lower, padding: false)
  end

  defp generate_webhook_id do
    "whk_" <> (:crypto.strong_rand_bytes(12) |> Base.url_encode64(padding: false))
  end
end
```

Inbound webhook verification to prevent spoofed requests:

```elixir
defmodule PrismaticWebhook.Verification do
  @moduledoc """
  Verifies inbound webhook signatures to prevent
  spoofed or tampered payloads.
  """

  @spec verify_signature(String.t(), String.t(), String.t()) :: :ok | {:error, :invalid_signature}
  def verify_signature(body, signature_header, secret) do
    expected =
      :crypto.mac(:hmac, :sha256, secret, body)
      |> Base.hex_encode32(case: :lower, padding: false)

    provided =
      signature_header
      |> String.replace_prefix("sha256=", "")

    if Plug.Crypto.secure_compare(expected, provided) do
      :ok
    else
      {:error, :invalid_signature}
    end
  end
end
```

## Architecture & Implementation

The webhook architecture in the platform follows a publisher-subscriber model with persistent subscription storage:

**Subscription Registry**: Webhook subscriptions are stored in PostgreSQL with the target URL, event types to subscribe to, an optional secret for signature verification, and enabled/disabled status. The registry is cached in ETS for fast lookup when events fire.

**Event Dispatcher**: When a platform event occurs (tool execution complete, pipeline loaded, quality gate triggered), the event dispatcher queries the subscription registry for matching webhooks and enqueues delivery tasks. Delivery happens asynchronously through Task.Supervisor to avoid blocking the event source.

**Delivery Pipeline**: Each webhook delivery follows the retry pattern with exponential backoff. Failed deliveries are recorded in PostgreSQL for debugging and monitoring. After exhausting all retries, the subscription is flagged for review.

**Signature Security**: All outbound webhooks include HMAC-SHA256 signatures computed from the payload and the subscription's shared secret. Receivers verify signatures before processing payloads, preventing man-in-the-middle tampering.

```elixir
defmodule PrismaticWebhook.Dispatcher do
  @moduledoc """
  Dispatches webhook events to registered subscribers
  based on event type matching.
  """

  @spec dispatch(String.t(), map()) :: :ok
  def dispatch(event_type, payload) do
    subscriptions = PrismaticWebhook.Registry.get_subscriptions(event_type)

    Enum.each(subscriptions, fn sub ->
      Task.Supervisor.start_child(PrismaticWebhook.TaskSupervisor, fn ->
        enriched_payload = %{
          event: event_type,
          data: payload,
          timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
          platform: "prismatic"
        }

        case PrismaticWebhook.Delivery.deliver(sub.url, enriched_payload, secret: sub.secret) do
          {:ok, result} ->
            PrismaticWebhook.DeliveryLog.record(sub.id, result)

          {:error, result} ->
            PrismaticWebhook.DeliveryLog.record(sub.id, result)
            PrismaticWebhook.Registry.mark_failing(sub.id)
        end
      end)
    end)

    :ok
  end
end
```

## Usage in Prismatic Platform

The platform dispatches webhooks for key operational events:

```elixir
# OSINT tool execution webhook
PrismaticWebhook.Dispatcher.dispatch("osint.tool.completed", %{
  tool_slug: "ares-lookup",
  query: "12345678",
  status: :success,
  result_count: 1,
  execution_time_ms: 450
})

# DD pipeline load webhook
PrismaticWebhook.Dispatcher.dispatch("dd.pipeline.loaded", %{
  group: :forbes,
  entities_loaded: 100,
  relationships_created: 45,
  duration_ms: 12_500
})

# Quality gate webhook
PrismaticWebhook.Dispatcher.dispatch("quality.gate.triggered", %{
  domain: :compilation,
  previous_score: 100,
  current_score: 99,
  violation: "new warning in prismatic_web"
})
```

External services like GitLab CI send webhooks to the platform when pipeline events occur, enabling the platform to track deployment status and trigger post-deployment warmup sequences.

## Cross-References

- [API](@/glossary/api.md) - RESTful interface complementing webhooks
- [PubSub](@/glossary/pubsub.md) - Internal event distribution
- [Transport](@/glossary/transport.md) - Communication layer
- [Monitoring](@/glossary/monitoring.md) - Alert delivery via webhooks
- [Token](@/glossary/token.md) - Authentication for webhook endpoints

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
