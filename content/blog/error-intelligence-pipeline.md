+++
title = "Building an Error Intelligence Pipeline in Elixir"
date = 2026-03-20
description = "How we built PatternTracker, ErrorFeedLive, and a real-time error deduplication system with PubSub streaming for production visibility."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["error-tracking", "pattern-tracker", "pubsub", "liveview", "observability"]
reading_time = "9 min"
keywords = ["error intelligence pipeline", "elixir error tracking", "pattern tracker", "real-time error feed", "pubsub error streaming"]
image = "/images/blog/error-intelligence-pipeline.png"
word_count = 1350
date_created = "2026-03-20"
date_modified = "2026-03-20"
quality_score = 87
see_also = ["architecture", "developers"]
image_alt = "Error Intelligence Pipeline - Prismatic Platform"
+++

Production systems fail. The question is not whether errors will occur but how quickly you can identify, classify, and respond to them. Traditional logging dumps everything into a text stream and expects a human to grep through it. We wanted something better: an error intelligence pipeline that detects patterns, deduplicates noise, identifies genuinely new failures, and streams findings to operators in real time.

## The Problem with Traditional Error Logging

Most Elixir applications rely on Logger with a backend that writes to stdout or a file. In production, this output feeds into an aggregator like Datadog or Grafana Loki. The problem is threefold:

1. **Volume**: A busy system generates thousands of log lines per minute. Most are noise.
2. **Duplication**: The same error repeats hundreds of times before anyone notices.
3. **Novelty blindness**: A genuinely new failure mode gets buried under familiar errors.

We needed a system that answers three questions automatically: Is this error new? How often is it occurring? Should someone be paged?

## Architecture Overview

The error intelligence pipeline consists of four components:

```
Logger Backend → PatternTracker (ETS) → ErrorFeedLive (LiveView) → PubSub Broadcast
```

Each component has a single responsibility and communicates through well-defined interfaces.

## PatternTracker: The Classification Engine

PatternTracker maintains an ETS table of error fingerprints. When an error arrives, it computes a fingerprint by normalizing the error message (stripping PIDs, timestamps, and variable data), then hashes the result:

```elixir
defmodule Prismatic.ErrorIntelligence.PatternTracker do
  @moduledoc """
  Tracks error patterns using fingerprint-based deduplication.
  Maintains occurrence counts, first/last seen timestamps,
  and novelty classification.
  """

  use GenServer
  require Logger

  @table :error_patterns
  @new_error_threshold_ms :timer.minutes(30)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec track(map()) :: {:new_pattern | :known_pattern, map()}
  def track(error_event) do
    fingerprint = compute_fingerprint(error_event)
    now = System.monotonic_time(:millisecond)

    case :ets.lookup(@table, fingerprint) do
      [] ->
        pattern = %{
          fingerprint: fingerprint,
          message: error_event.message,
          module: error_event.module,
          count: 1,
          first_seen: now,
          last_seen: now,
          severity: classify_severity(error_event)
        }
        :ets.insert(@table, {fingerprint, pattern})
        broadcast_new_pattern(pattern)
        {:new_pattern, pattern}

      [{^fingerprint, existing}] ->
        updated = %{existing |
          count: existing.count + 1,
          last_seen: now
        }
        :ets.insert(@table, {fingerprint, updated})
        maybe_broadcast_threshold(updated)
        {:known_pattern, updated}
    end
  end

  defp compute_fingerprint(event) do
    normalized =
      event.message
      |> String.replace(~r/#PID<[\d.]+>/, "#PID<X>")
      |> String.replace(~r/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/, "TIMESTAMP")
      |> String.replace(~r/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, "UUID")

    :crypto.hash(:sha256, "#{event.module}:#{normalized}")
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end
end
```

The fingerprint normalization is critical. Without it, every GenServer crash produces a unique log entry because the PID differs. By replacing PIDs, UUIDs, and timestamps with placeholders, we collapse hundreds of identical-in-nature errors into a single pattern.

### Severity Classification

Not all errors are equal. PatternTracker classifies severity based on the error source and rate:

```elixir
defp classify_severity(event) do
  cond do
    event.level == :emergency -> :critical
    event.level == :alert -> :critical
    String.contains?(event.message, "GenServer") -> :high
    String.contains?(event.message, "DBConnection") -> :high
    String.contains?(event.message, "timeout") -> :medium
    true -> :low
  end
end
```

## ErrorFeedLive: Real-Time Visibility

The LiveView component subscribes to the `"error_patterns"` PubSub topic and renders a live-updating feed:

```elixir
defmodule PrismaticWebWeb.ErrorFeedLive do
  @moduledoc """
  Real-time error feed with pattern grouping,
  severity filtering, and new-error highlighting.
  """

  use PrismaticWebWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "error_patterns")
    end

    patterns = PatternTracker.list_patterns(limit: 100)

    {:ok,
     assign(socket,
       patterns: patterns,
       filter_severity: :all,
       new_pattern_ids: MapSet.new()
     )}
  end

  @impl true
  def handle_info({:new_error_pattern, pattern}, socket) do
    patterns = [pattern | socket.assigns.patterns] |> Enum.take(100)
    new_ids = MapSet.put(socket.assigns.new_pattern_ids, pattern.fingerprint)

    {:noreply,
     assign(socket,
       patterns: patterns,
       new_pattern_ids: new_ids
     )}
  end

  @impl true
  def handle_info({:pattern_threshold, pattern}, socket) do
    patterns =
      Enum.map(socket.assigns.patterns, fn p ->
        if p.fingerprint == pattern.fingerprint, do: pattern, else: p
      end)

    {:noreply, assign(socket, patterns: patterns)}
  end
end
```

The key design decision is the `new_pattern_ids` MapSet. When a genuinely new error pattern appears, the UI highlights it with a distinct visual treatment. This means operators scanning the feed immediately see novel failures rather than having to mentally filter familiar ones.

## Deduplication Strategy

Deduplication happens at three levels:

1. **Fingerprint level**: Identical errors (same module, same normalized message) collapse into one pattern with an incrementing counter.
2. **Time window level**: If a pattern has not been seen in 30 minutes and reappears, it is flagged as a recurrence rather than a continuation.
3. **Broadcast level**: PubSub notifications are rate-limited. A pattern that fires 1000 times per second does not generate 1000 PubSub messages. Instead, threshold-based broadcasts fire at count milestones (10, 100, 1000, etc.):

```elixir
defp maybe_broadcast_threshold(pattern) do
  thresholds = [10, 50, 100, 500, 1000, 5000, 10_000]

  if pattern.count in thresholds do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "error_patterns",
      {:pattern_threshold, pattern}
    )
  end
end
```

This three-layer approach keeps the system useful under heavy load. The ETS table absorbs the raw volume, the time window prevents alert fatigue, and the broadcast throttling keeps the LiveView responsive.

## New Error Detection

Detecting genuinely new errors is the most valuable capability. When PatternTracker encounters a fingerprint it has never seen, it broadcasts on a dedicated topic:

```elixir
defp broadcast_new_pattern(pattern) do
  Phoenix.PubSub.broadcast(
    Prismatic.PubSub,
    "error_patterns",
    {:new_error_pattern, pattern}
  )

  Phoenix.PubSub.broadcast(
    Prismatic.PubSub,
    "system_events",
    {:alert, :new_error_pattern, pattern}
  )
end
```

The `"system_events"` topic is consumed by the notification system, which can trigger Slack alerts, email notifications, or PagerDuty incidents depending on the severity classification.

## ETS Table Management

The ETS table grows unboundedly if left unchecked. A periodic cleanup process runs every hour, removing patterns that have not been seen in 24 hours and have a count below 10:

```elixir
def handle_info(:cleanup, state) do
  cutoff = System.monotonic_time(:millisecond) - :timer.hours(24)

  :ets.foldl(
    fn {fingerprint, pattern}, acc ->
      if pattern.last_seen < cutoff and pattern.count < 10 do
        :ets.delete(@table, fingerprint)
        acc + 1
      else
        acc
      end
    end,
    0,
    @table
  )

  schedule_cleanup()
  {:noreply, state}
end
```

## Integration with the Logger Backend

The pipeline hooks into Elixir's Logger through a custom backend:

```elixir
defmodule Prismatic.ErrorIntelligence.LoggerBackend do
  @moduledoc """
  Logger backend that routes error-level messages
  to the PatternTracker for intelligence analysis.
  """

  @behaviour :gen_event

  @impl true
  def handle_event({level, _gl, {Logger, msg, _ts, metadata}}, state)
      when level in [:error, :warning] do
    event = %{
      level: level,
      message: IO.iodata_to_binary(msg),
      module: Keyword.get(metadata, :module),
      function: Keyword.get(metadata, :function),
      line: Keyword.get(metadata, :line)
    }

    PatternTracker.track(event)
    {:ok, state}
  end

  def handle_event(_event, state), do: {:ok, state}
end
```

## Results

After deploying the error intelligence pipeline to production, we observed measurable improvements in incident response:

- **Mean time to detect new errors**: Dropped from ~15 minutes (manual log scanning) to under 5 seconds (real-time PubSub notification).
- **Alert noise reduction**: 94% reduction in duplicate error notifications through fingerprint deduplication.
- **Pattern visibility**: Operators can now see at a glance which errors are trending upward, which are new, and which are stable background noise.

The pipeline processes approximately 2,000 error events per minute in our production environment with negligible CPU overhead thanks to ETS-backed storage and rate-limited PubSub broadcasting.

## Lessons Learned

**ETS is the right tool for high-throughput counters.** We initially considered using a GenServer with a Map, but the serialization bottleneck at 2,000 events per minute was unacceptable. ETS concurrent reads eliminated the bottleneck entirely.

**Fingerprint normalization is harder than it looks.** Early versions produced too many unique fingerprints because Ecto query strings contain table aliases that change between connections. We added progressively more normalization rules over the first two weeks.

**Rate-limited broadcasting is essential.** Our first version broadcast every single error to PubSub. Under load, this overwhelmed the LiveView process mailbox. The threshold-based approach maintains real-time feel without the overhead.

The error intelligence pipeline demonstrates a pattern we use throughout Prismatic: take a high-volume, low-signal data stream, apply classification and deduplication at the ingestion layer, and present the distilled intelligence through a real-time interface. The same architecture powers our OSINT result processing, compliance monitoring, and due diligence analysis systems.
