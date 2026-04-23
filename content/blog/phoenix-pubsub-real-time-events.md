+++
title = "Phoenix PubSub at Scale: Topic Design and Fan-Out Patterns"
date = 2026-03-02
description = "Deep dive into Phoenix PubSub architecture for real-time event distribution at scale, covering topic design, fan-out patterns, message batching, and production conventions."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["phoenix", "pubsub", "real-time", "elixir", "distributed-systems"]
reading_time = "10 min"
keywords = ["phoenix pubsub", "real-time events", "elixir pubsub", "fan-out pattern", "message batching"]
image = "/images/blog/phoenix-pubsub-real-time-events.png"
word_count = 1350
date_created = "2026-03-02"
date_modified = "2026-03-02"
quality_score = 92
see_also = ["architecture", "developers", "genserver-patterns"]
image_alt = "Phoenix PubSub at Scale - Prismatic Platform"
+++

Phoenix PubSub is deceptively simple on the surface: subscribe to a topic, broadcast a message, receive it in your process. But building a platform with hundreds of concurrent subscribers, dozens of topic hierarchies, and strict latency requirements demands a disciplined approach to topic design, fan-out control, and message structure.

This post documents the patterns we use in the Prismatic Platform to handle real-time events across 94 umbrella applications, thousands of LiveView processes, and multiple distributed nodes.

## Topic Architecture

The first decision in any PubSub system is topic naming. A flat namespace quickly becomes unmanageable. We use a hierarchical convention with colon-separated segments:

```
domain:entity:action
domain:entity:id:action
```

Concrete examples from the platform:

| Topic Pattern | Example | Purpose |
|---|---|---|
| `system_events` | `system_events` | Platform-wide broadcasts (health, config changes) |
| `error_patterns` | `error_patterns` | Error intelligence feed for pattern detection |
| `dd:pipeline` | `dd:pipeline` | Due diligence pipeline status updates |
| `dd:case:{id}` | `dd:case:abc123` | Per-case DD updates for subscribers |
| `osint:adapter:{name}` | `osint:adapter:shodan` | Per-adapter OSINT result streaming |
| `investigation:{id}` | `investigation:inv_42` | Investigation progress for a specific run |

The key principle: **generic topics for system-wide events, specific topics for entity-scoped updates**. A LiveView showing a single DD case subscribes to `dd:case:#{case_id}`, not to a firehose of all DD events.

## Subscribing and Broadcasting

The standard pattern wraps PubSub operations in domain-specific modules rather than calling `Phoenix.PubSub` directly throughout the codebase:

```elixir
defmodule Prismatic.Events.DDPipeline do
  @moduledoc """
  PubSub interface for DD pipeline events.
  Centralizes topic naming and message structure.
  """

  @pubsub Prismatic.PubSub
  @topic "dd:pipeline"

  @spec subscribe() :: :ok | {:error, term()}
  def subscribe do
    Phoenix.PubSub.subscribe(@pubsub, @topic)
  end

  @spec subscribe_case(String.t()) :: :ok | {:error, term()}
  def subscribe_case(case_id) when is_binary(case_id) do
    Phoenix.PubSub.subscribe(@pubsub, "dd:case:#{case_id}")
  end

  @spec broadcast_stage_complete(String.t(), atom(), map()) :: :ok | {:error, term()}
  def broadcast_stage_complete(case_id, stage, metadata) do
    message = %{
      event: :stage_complete,
      case_id: case_id,
      stage: stage,
      metadata: metadata,
      timestamp: System.monotonic_time(:millisecond)
    }

    Phoenix.PubSub.broadcast(@pubsub, @topic, {:dd_pipeline, message})
    Phoenix.PubSub.broadcast(@pubsub, "dd:case:#{case_id}", {:dd_case, message})
  end
end
```

This gives us three guarantees: topic names are never string-interpolated inline, message shapes are consistent, and we can add telemetry or filtering at a single point.

## Fan-Out Control

The most common performance problem with PubSub is uncontrolled fan-out. If 500 LiveView processes subscribe to `system_events` and you broadcast a large payload, you are copying that payload 500 times in memory. Two strategies mitigate this.

### Strategy 1: Payload Minimization

Never broadcast full entities. Send references and let subscribers fetch what they need:

```elixir
# Bad: broadcasting the entire case struct to all subscribers
Phoenix.PubSub.broadcast(pubsub, "dd:pipeline", {:case_updated, full_case_struct})

# Good: broadcast a reference, let subscribers decide what to fetch
Phoenix.PubSub.broadcast(pubsub, "dd:pipeline", {:case_updated, %{
  case_id: case.id,
  field: :status,
  new_value: :completed,
  timestamp: System.monotonic_time(:millisecond)
}})
```

### Strategy 2: Topic Granularity

Instead of one topic with filtering, use granular topics so processes only receive what they care about:

```elixir
# Instead of one topic with all events:
Phoenix.PubSub.broadcast(pubsub, "osint:results", {:result, adapter, data})

# Use per-adapter topics:
Phoenix.PubSub.broadcast(pubsub, "osint:adapter:shodan", {:result, data})
Phoenix.PubSub.broadcast(pubsub, "osint:adapter:virustotal", {:result, data})
```

A LiveView monitoring Shodan results subscribes only to `osint:adapter:shodan` and never sees VirusTotal traffic.

## Message Batching

For high-throughput scenarios like OSINT adapter results or error pattern streams, individual messages per event can overwhelm subscribers. We batch using a GenServer accumulator:

```elixir
defmodule Prismatic.Events.BatchBroadcaster do
  @moduledoc """
  Accumulates events and broadcasts them in batches
  at configurable intervals.
  """
  use GenServer

  @flush_interval_ms 100
  @max_batch_size 50

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: opts[:name])
  end

  @spec enqueue(GenServer.server(), String.t(), term()) :: :ok
  def enqueue(server, topic, message) do
    GenServer.cast(server, {:enqueue, topic, message})
  end

  @impl true
  def init(opts) do
    schedule_flush()
    {:ok, %{buffer: %{}, pubsub: opts[:pubsub]}}
  end

  @impl true
  def handle_cast({:enqueue, topic, message}, state) do
    buffer = Map.update(state.buffer, topic, [message], fn msgs ->
      if length(msgs) >= @max_batch_size do
        flush_topic(state.pubsub, topic, [message | msgs])
        []
      else
        [message | msgs]
      end
    end)

    {:noreply, %{state | buffer: buffer}}
  end

  @impl true
  def handle_info(:flush, state) do
    Enum.each(state.buffer, fn {topic, messages} ->
      if messages != [] do
        flush_topic(state.pubsub, topic, messages)
      end
    end)

    schedule_flush()
    {:noreply, %{state | buffer: %{}}}
  end

  defp flush_topic(pubsub, topic, messages) do
    batch = %{
      event: :batch,
      messages: Enum.reverse(messages),
      count: length(messages),
      flushed_at: System.monotonic_time(:millisecond)
    }

    Phoenix.PubSub.broadcast(pubsub, topic, {:batch, batch})
  end

  defp schedule_flush do
    Process.send_after(self(), :flush, @flush_interval_ms)
  end
end
```

Subscribers receive batches of up to 50 messages every 100ms instead of individual messages. This reduces message passing overhead by an order of magnitude in high-throughput scenarios.

## LiveView Integration

On the LiveView side, handling PubSub messages follows a consistent pattern:

```elixir
defmodule PrismaticWeb.DDCaseLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(%{"id" => case_id}, _session, socket) do
    if connected?(socket) do
      Prismatic.Events.DDPipeline.subscribe_case(case_id)
    end

    {:ok, assign(socket, case_id: case_id, events: [])}
  end

  @impl true
  def handle_info({:dd_case, %{event: :stage_complete} = event}, socket) do
    events = [event | socket.assigns.events] |> Enum.take(100)
    {:noreply, assign(socket, events: events)}
  end

  def handle_info({:batch, %{messages: messages}}, socket) do
    events = (messages ++ socket.assigns.events) |> Enum.take(100)
    {:noreply, assign(socket, events: events)}
  end
end
```

The `connected?(socket)` guard ensures we only subscribe after the WebSocket connection is established, not during the static HTTP render.

## Distributed PubSub

Phoenix PubSub uses `Phoenix.PubSub.PG2` by default, which leverages Erlang's `:pg` module for distributed process groups. When running multiple nodes, messages broadcast on one node automatically reach subscribers on all nodes.

The configuration is straightforward:

```elixir
# In application.ex
children = [
  {Phoenix.PubSub, name: Prismatic.PubSub, adapter: Phoenix.PubSub.PG2}
]
```

For cross-node scenarios, keep payloads small. Large structs serialized across the distribution protocol add latency. The reference-based approach described above becomes even more critical in multi-node deployments.

## Telemetry Integration

Every broadcast in the platform emits telemetry events for the OTEL doctrine pillar:

```elixir
defp broadcast_with_telemetry(pubsub, topic, message) do
  start_time = System.monotonic_time()

  result = Phoenix.PubSub.broadcast(pubsub, topic, message)

  :telemetry.execute(
    [:prismatic, :pubsub, :broadcast],
    %{duration: System.monotonic_time() - start_time},
    %{topic: topic, result: result}
  )

  result
end
```

This feeds into dashboards showing broadcast frequency per topic, latency percentiles, and subscriber counts, which is essential for detecting fan-out problems before they impact users.

## Summary

| Pattern | When to Use | Benefit |
|---|---|---|
| Domain-specific PubSub modules | Always | Centralized topic naming, consistent message shapes |
| Granular topics | Entity-scoped updates | Reduced fan-out, less filtering |
| Payload minimization | Large entity updates | Lower memory pressure |
| Batch broadcasting | High-throughput streams | Order of magnitude fewer messages |
| Telemetry wrapping | Production systems | Observability into PubSub performance |

PubSub is the nervous system of any Phoenix application. Treating topic design with the same rigor as database schema design pays dividends as the system scales.
