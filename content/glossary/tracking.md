+++
title = "Tracking"
weight = 50
[extra]
description = "Progress and analytics monitoring system that captures user interactions, learning advancement, and operational metrics"
category = "observability"
related_terms = ["telemetry", "monitoring", "trace", "analytics"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["tracking", "progress tracking", "analytics", "monitoring", "user activity", "glossary", "Prismatic Platform"]
tags = ["glossary", "observability"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Tracking - Prismatic Platform"
+++

## Definition & Overview

Tracking in the Prismatic Platform encompasses the systematic capture, storage, and analysis of user interactions, learning progress, operational metrics, and system events. It spans multiple contexts: Academy progress tracking monitors learning advancement through topics and tracks, OSINT execution tracking records tool usage patterns and result histories, quality tracking maintains the platform's 100/100 quality score across 13 domains, and session tracking preserves conversation context across Claude Code sessions.

Unlike passive logging which simply records events, tracking implies active state management and purpose-driven data collection. Each tracking subsystem maintains current state (what has been done), historical state (what was done previously), and derived insights (what should be done next). This active tracking model powers recommendations, alerts, and automated responses throughout the platform.

The platform employs a privacy-conscious tracking philosophy where all tracked data serves a direct functional purpose. User progress tracking enables prerequisite enforcement and personalized recommendations. Tool execution tracking enables caching, rate limit management, and audit trails. Quality tracking enables regression prevention and automated healing. No tracking data is collected without a clear operational justification.

## Technical Deep Dive

The Academy's ProgressTracker GenServer exemplifies the platform's tracking architecture, maintaining per-user state in ETS with PostgreSQL persistence:

```elixir
defmodule PrismaticAcademy.ProgressTracker do
  @moduledoc """
  Tracks user learning progress across Academy topics and
  tracks, with ETS for fast reads and PostgreSQL for durability.
  """

  use GenServer

  @table :academy_progress
  @flush_interval_ms 30_000

  defstruct [:table, pending_writes: []]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :public, read_concurrency: true])
    schedule_flush()
    {:ok, %__MODULE__{table: table}}
  end

  @spec record_completion(String.t(), String.t(), map()) :: :ok
  def record_completion(user_id, topic_slug, metadata \\ %{}) do
    GenServer.cast(__MODULE__, {:complete, user_id, topic_slug, metadata})
  end

  @spec get_progress(String.t()) :: map()
  def get_progress(user_id) do
    case :ets.lookup(@table, user_id) do
      [{^user_id, progress}] -> progress
      [] -> %{completed_topics: MapSet.new(), scores: %{}, last_active: nil}
    end
  end

  @spec get_activity(String.t()) :: map()
  def get_activity(user_id) do
    progress = get_progress(user_id)
    completed = MapSet.to_list(progress.completed_topics)

    categories =
      completed
      |> Enum.flat_map(fn slug ->
        case PrismaticAcademy.TopicRegistry.get_topic(slug) do
          {:ok, %{category: cat}} -> [cat]
          _ -> []
        end
      end)
      |> Enum.frequencies()

    %{
      user_id: user_id,
      completed_count: length(completed),
      active_categories: Map.keys(categories),
      category_distribution: categories,
      last_active: progress.last_active,
      knowledge_gaps: identify_gaps(progress)
    }
  end

  @impl true
  def handle_cast({:complete, user_id, topic_slug, metadata}, state) do
    progress = get_progress(user_id)

    updated = %{progress |
      completed_topics: MapSet.put(progress.completed_topics, topic_slug),
      scores: Map.put(progress.scores, topic_slug, metadata[:score]),
      last_active: DateTime.utc_now()
    }

    :ets.insert(@table, {user_id, updated})

    :telemetry.execute(
      [:prismatic, :academy, :topic, :completed],
      %{score: metadata[:score] || 0},
      %{user_id: user_id, topic_slug: topic_slug}
    )

    {:noreply, %{state | pending_writes: [{user_id, updated} | state.pending_writes]}}
  end

  @impl true
  def handle_info(:flush, state) do
    flush_to_postgres(state.pending_writes)
    schedule_flush()
    {:noreply, %{state | pending_writes: []}}
  end

  defp schedule_flush do
    Process.send_after(self(), :flush, @flush_interval_ms)
  end

  defp flush_to_postgres([]), do: :ok
  defp flush_to_postgres(writes) do
    Enum.each(writes, fn {user_id, progress} ->
      PrismaticAcademy.Repo.upsert_progress(user_id, progress)
    end)
  end

  defp identify_gaps(_progress) do
    # Analyzes completed topics against available tracks
    # to identify knowledge areas not yet covered
    []
  end
end
```

## Architecture & Implementation

The platform implements tracking through domain-specific GenServers, each optimized for its particular access patterns:

**Academy ProgressTracker**: Tracks topic completions, assessment scores, and learning paths. Uses ETS with `read_concurrency: true` for the LiveView dashboard's frequent progress reads, and batches PostgreSQL writes every 30 seconds to amortize persistence costs.

**OSINT ExecutionTracker**: Records every tool execution with input parameters, output results, timing, and status. Stored in PostgreSQL for audit trail compliance, with ETS caching of recent executions for the toolbox UI's run history display.

**Quality DNA Tracker**: Maintains the platform's quality score (currently 100/100) across 13 domains. Tracks metrics like Dialyzer violations, Credo warnings, compilation status, typespec coverage, and memory safety. The Quality Floor Guardian uses this tracking data to trigger automated healing when scores drop below thresholds.

**Session Context Tracker**: Preserves conversation context across Claude Code sessions in `.claude/session-context/`. Each session saves objectives, actions taken, files modified, decisions made, and recommended next steps. This enables session continuity where a new session can load the previous session's context and continue work seamlessly.

```elixir
defmodule PrismaticTracking.EventCollector do
  @moduledoc """
  Centralized tracking event collector that routes events
  to appropriate domain-specific trackers.
  """

  @spec track(atom(), String.t(), map()) :: :ok
  def track(domain, event_type, payload) do
    enriched = %{
      domain: domain,
      event_type: event_type,
      payload: payload,
      timestamp: DateTime.utc_now(),
      session_id: get_session_id()
    }

    :telemetry.execute(
      [:prismatic, :tracking, domain, String.to_atom(event_type)],
      %{count: 1},
      enriched
    )

    route_to_tracker(domain, enriched)
  end

  defp route_to_tracker(:academy, event), do: PrismaticAcademy.ProgressTracker.record(event)
  defp route_to_tracker(:osint, event), do: PrismaticOsintCore.ExecutionTracker.record(event)
  defp route_to_tracker(:quality, event), do: PrismaticSafety.QualityTracker.record(event)
  defp route_to_tracker(_, _event), do: :ok

  defp get_session_id do
    Process.get(:session_id) || "anonymous"
  end
end
```

## Usage in Prismatic Platform

Tracking data drives multiple platform features including the Academy dashboard, OSINT run history, and quality evolution visualization:

```elixir
defmodule PrismaticWeb.AcademyLive.ProgressDashboard do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, session, socket) do
    user_id = session["user_id"] || "default"
    activity = PrismaticAcademy.ProgressTracker.get_activity(user_id)
    tracks = PrismaticAcademy.TrackRegistry.list_tracks()

    track_progress =
      Enum.map(tracks, fn track ->
        progress = PrismaticAcademy.TrackProgress.get(user_id, track.slug)
        completion = PrismaticAcademy.TrackProgress.completion_percentage(progress, track)
        %{track: track, progress: progress, completion: completion}
      end)

    {:ok, assign(socket,
      activity: activity,
      track_progress: track_progress,
      total_completion: calculate_overall(track_progress)
    )}
  end

  defp calculate_overall(track_progress) do
    completions = Enum.map(track_progress, & &1.completion)
    if Enum.empty?(completions), do: 0.0, else: Enum.sum(completions) / length(completions)
  end
end
```

The Quality DNA tracking system visualizes platform quality evolution across all 19 generations, showing how the quality score progressed from initial implementation through the current 100/100 perfect score.

## Cross-References

- [Telemetry](/glossary/telemetry/) - Event measurement framework
- [Monitoring](/glossary/monitoring/) - Operational observation system
- [Trace](/glossary/trace/) - Distributed request tracking
- [Track](/glossary/track/) - Learning path sequence
- [Analytics](/glossary/analytics/) - Data-driven insights

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
