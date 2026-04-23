+++
title = "Track"
weight = 50
[extra]
description = "Ordered learning path sequence that guides users through interconnected Academy topics with prerequisite enforcement"
category = "academy"
related_terms = ["topic-registry", "academy", "learning-path", "tracking"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["track", "learning path", "academy", "curriculum", "course sequence", "glossary", "Prismatic Platform"]
tags = ["glossary", "academy"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Track - Prismatic Platform"
+++

## Definition & Overview

A track is an ordered sequence of learning topics within the Prismatic Academy that guides users through a structured educational path. Unlike standalone topics that can be studied independently, a track defines a deliberate progression where each topic builds upon knowledge established in preceding ones. Tracks enforce prerequisite relationships, ensuring learners have the foundational understanding required before advancing to more complex material.

The Prismatic Academy organizes its curriculum into multiple tracks aligned with the platform's core domains: OSINT fundamentals, security analysis, data engineering, AI/ML operations, and platform development. Each track has a defined difficulty progression (beginner through expert), estimated total duration, and measurable learning outcomes. A user's progress through a track is persisted across sessions, allowing interrupted learning to resume seamlessly.

Tracks serve as the primary recommendation unit for the Academy. When the InterconnectionEngine identifies a user's knowledge gaps based on their interaction patterns with OSINT tools or Perimeter dashboards, it recommends specific tracks rather than individual topics. This track-first approach ensures that recommendations provide coherent learning experiences rather than fragmented knowledge acquisition.

## Technical Deep Dive

Tracks are defined as ordered collections of topic slugs with metadata for progression management:

```elixir
defmodule PrismaticAcademy.Track do
  @moduledoc """
  Defines a learning path as an ordered sequence of
  Academy topics with prerequisite enforcement.
  """

  @type t :: %__MODULE__{
    slug: String.t(),
    name: String.t(),
    description: String.t(),
    topics: [String.t()],
    difficulty_range: {atom(), atom()},
    estimated_hours: float(),
    category: atom(),
    prerequisites: [String.t()],
    outcomes: [String.t()]
  }

  @enforce_keys [:slug, :name, :topics, :category]
  defstruct [
    :slug, :name, :description, :category,
    topics: [],
    difficulty_range: {:beginner, :intermediate},
    estimated_hours: 0.0,
    prerequisites: [],
    outcomes: []
  ]

  @spec build(map()) :: {:ok, t()} | {:error, term()}
  def build(attrs) do
    with :ok <- validate_topics_exist(attrs.topics),
         :ok <- validate_no_cycles(attrs) do
      track = struct!(__MODULE__, attrs)
      estimated = calculate_duration(track.topics)
      {:ok, %{track | estimated_hours: estimated}}
    end
  end

  defp validate_topics_exist(topic_slugs) do
    missing =
      topic_slugs
      |> Enum.filter(fn slug ->
        match?({:error, :not_found}, PrismaticAcademy.TopicRegistry.get_topic(slug))
      end)

    case missing do
      [] -> :ok
      slugs -> {:error, {:missing_topics, slugs}}
    end
  end

  defp validate_no_cycles(%{slug: slug, prerequisites: prereqs}) do
    if slug in prereqs do
      {:error, {:circular_prerequisite, slug}}
    else
      :ok
    end
  end

  defp calculate_duration(topic_slugs) do
    topic_slugs
    |> Enum.reduce(0, fn slug, acc ->
      case PrismaticAcademy.TopicRegistry.get_topic(slug) do
        {:ok, %{estimated_minutes: mins}} -> acc + mins
        _ -> acc
      end
    end)
    |> Kernel./(60.0)
    |> Float.round(1)
  end
end
```

Track progression is managed through a state machine that enforces topic ordering and completion requirements:

```elixir
defmodule PrismaticAcademy.TrackProgress do
  @moduledoc """
  Manages user progression through a learning track,
  enforcing prerequisite completion and tracking state.
  """

  @type progress_state :: :not_started | :in_progress | :completed

  @type t :: %__MODULE__{
    track_slug: String.t(),
    user_id: String.t(),
    current_topic_index: non_neg_integer(),
    completed_topics: MapSet.t(String.t()),
    state: progress_state(),
    started_at: DateTime.t() | nil,
    completed_at: DateTime.t() | nil
  }

  defstruct [:track_slug, :user_id, :started_at, :completed_at,
             current_topic_index: 0,
             completed_topics: MapSet.new(),
             state: :not_started]

  @spec advance(t(), PrismaticAcademy.Track.t()) :: {:ok, t()} | {:error, term()}
  def advance(%__MODULE__{} = progress, %PrismaticAcademy.Track{} = track) do
    current_topic = Enum.at(track.topics, progress.current_topic_index)

    if MapSet.member?(progress.completed_topics, current_topic) do
      next_index = progress.current_topic_index + 1

      if next_index >= length(track.topics) do
        {:ok, %{progress |
          state: :completed,
          completed_at: DateTime.utc_now()
        }}
      else
        {:ok, %{progress |
          current_topic_index: next_index,
          state: :in_progress
        }}
      end
    else
      {:error, {:topic_not_completed, current_topic}}
    end
  end

  @spec completion_percentage(t(), PrismaticAcademy.Track.t()) :: float()
  def completion_percentage(%__MODULE__{} = progress, %PrismaticAcademy.Track{} = track) do
    total = length(track.topics)
    completed = MapSet.size(progress.completed_topics)
    Float.round(completed / total * 100, 1)
  end
end
```

## Architecture & Implementation

The track system integrates with three Academy GenServers to provide a complete learning experience:

**TopicRegistry**: Supplies the topic metadata (name, description, difficulty, duration) for each topic in the track. The track builder validates that all referenced topic slugs exist in the registry before construction.

**InterconnectionEngine**: The directed graph maintained by the InterconnectionEngine represents semantic relationships between topics. Track builders can query the engine to discover natural topic orderings and ensure that tracks follow pedagogically sound progressions.

**ProgressTracker**: Persists per-user completion state for each track. When a user completes a topic within a track, the progress tracker updates the completion set and checks whether advancement to the next topic is possible. Progress data lives in ETS for fast reads with periodic persistence to PostgreSQL.

The Academy LiveView dashboard renders track progress as visual progress bars, showing completed topics in green, the current topic highlighted, and upcoming topics grayed out. Users can click on any completed topic to review its content or jump to the current topic to continue learning.

## Usage in Prismatic Platform

Tracks are defined in the Academy configuration and rendered through the LiveView dashboard:

```elixir
# Track definitions for the OSINT learning path
osint_fundamentals = %{
  slug: "osint-fundamentals",
  name: "OSINT Fundamentals",
  description: "Master open source intelligence from basics to advanced signal synthesis",
  category: :osint,
  topics: [
    "osint-signal-synthesis",
    "social-media-osint",
    "advanced-threat-hunting"
  ],
  difficulty_range: {:intermediate, :advanced},
  prerequisites: [],
  outcomes: [
    "Understand OSINT collection methodologies",
    "Apply GRACE framework for signal assessment",
    "Execute multi-source intelligence synthesis"
  ]
}

{:ok, track} = PrismaticAcademy.Track.build(osint_fundamentals)
```

The platform recommends tracks based on user activity. If a user frequently runs OSINT tools from the Czech category but shows low confidence scores in threat analysis, the Academy recommends the security analysis track to strengthen that capability gap:

```elixir
defmodule PrismaticAcademy.TrackRecommender do
  @spec recommend(String.t(), keyword()) :: [PrismaticAcademy.Track.t()]
  def recommend(user_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 3)
    user_activity = PrismaticAcademy.ProgressTracker.get_activity(user_id)
    all_tracks = PrismaticAcademy.TrackRegistry.list_tracks()

    all_tracks
    |> Enum.reject(fn track ->
      PrismaticAcademy.TrackProgress.completed?(user_id, track.slug)
    end)
    |> Enum.sort_by(fn track ->
      relevance_score(track, user_activity)
    end, :desc)
    |> Enum.take(limit)
  end

  defp relevance_score(track, activity) do
    category_match = if track.category in activity.active_categories, do: 10, else: 0
    gap_score = length(activity.knowledge_gaps -- track.outcomes)
    category_match - gap_score
  end
end
```

## Cross-References

- [Topic Registry](/glossary/topic-registry/) - Catalog backing track topic references
- **Academy** - Learning platform subsystem
- [Tracking](/glossary/tracking/) - Progress monitoring system
- [Learning Path](/glossary/learning-path/) - Alternative term for track
- [Tool](/glossary/tool/) - OSINT tools that inform track recommendations

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
