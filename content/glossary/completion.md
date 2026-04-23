+++
title = "Completion"
weight = 50
[extra]
description = "A learning progress metric that tracks the percentage of educational content a learner has successfully finished within a topic, path, or certification program"
category = "education"
related_terms = ["competency", "certification", "assessment", "curriculum", "completeness"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["completion", "learning progress", "progress tracking", "education metrics", "topic completion", "glossary", "Prismatic Platform"]
tags = ["glossary", "education", "metrics"]
quality_score = 75
see_also = ["capabilities", "academy"]
image = "/images/sections/glossary.png"
image_alt = "Completion - Prismatic Platform"
+++

## Definition & Overview

Completion is a learning progress metric that quantifies the percentage of educational content a learner has successfully finished within a defined scope -- a single topic, a learning path, or an entire certification program. Unlike competency (which measures ability to apply knowledge), completion measures exposure and engagement. A learner can complete 100% of content without achieving competency if they did not internalize the material, making completion a necessary but insufficient condition for proficiency.

Completion tracking serves multiple purposes: it provides learners with progress visibility (motivation and orientation), enables systems to enforce prerequisites (gating advanced content behind completed prerequisites), supports certification eligibility checks (verifying all required topics are finished), and generates analytics for curriculum designers (identifying abandonment points and engagement patterns).

In the Prismatic Platform, completion is tracked by the Academy's `ProgressTracker` GenServer. When a learner interacts with a topic registered via the `PrismaticAcademy.Topic` behaviour, their progress is recorded against the topic's defined content units. The InterconnectionEngine uses completion data to recommend next steps, and the certification engine verifies completion of all prerequisite topics before allowing certification assessment attempts.

## Technical Deep Dive

### Completion Granularity Model

| Granularity | Scope | Measure | Example |
|-------------|-------|---------|---------|
| **Content Unit** | Single section/slide | Binary (done/not) | "Reading: Signal Types" |
| **Lab Exercise** | Hands-on activity | Score threshold | Lab score >= 70% |
| **Topic** | Full learning module | All units + labs | OSINT Signal Synthesis |
| **Path** | Ordered topic sequence | All topics complete | "OSINT Analyst" path |
| **Certification** | Path + assessment | Path complete + exam pass | "Certified OSINT Analyst" |

### Progress Tracking Implementation

```elixir
defmodule PrismaticAcademy.ProgressTracker do
  @moduledoc """
  Tracks learner completion progress across Academy topics.
  ETS-backed GenServer with PostgreSQL persistence for durability.
  Publishes progress events via PubSub for dashboard updates.
  """

  use GenServer

  @table :academy_progress
  @pubsub_topic "academy:progress"

  @type progress :: %{
    learner_id: String.t(),
    topic_slug: String.t(),
    completed_units: MapSet.t(String.t()),
    total_units: non_neg_integer(),
    completion_pct: float(),
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    last_activity: DateTime.t()
  }

  @spec get_progress(String.t(), String.t()) :: {:ok, progress()} | {:error, :not_found}
  def get_progress(learner_id, topic_slug) do
    case :ets.lookup(@table, {learner_id, topic_slug}) do
      [{_key, progress}] -> {:ok, progress}
      [] -> {:error, :not_found}
    end
  end

  @spec mark_unit_complete(String.t(), String.t(), String.t()) :: {:ok, progress()}
  def mark_unit_complete(learner_id, topic_slug, unit_id) do
    GenServer.call(__MODULE__, {:mark_complete, learner_id, topic_slug, unit_id})
  end

  @spec get_path_completion(String.t(), [String.t()]) :: float()
  def get_path_completion(learner_id, topic_slugs) do
    completions = Enum.map(topic_slugs, fn slug ->
      case get_progress(learner_id, slug) do
        {:ok, progress} -> progress.completion_pct
        {:error, :not_found} -> 0.0
      end
    end)

    if length(completions) > 0 do
      Enum.sum(completions) / length(completions)
    else
      0.0
    end
  end

  @impl GenServer
  def handle_call({:mark_complete, learner_id, topic_slug, unit_id}, _from, state) do
    key = {learner_id, topic_slug}

    progress = case :ets.lookup(@table, key) do
      [{^key, existing}] -> existing
      [] -> initialize_progress(learner_id, topic_slug)
    end

    updated_units = MapSet.put(progress.completed_units, unit_id)
    completion_pct = MapSet.size(updated_units) / max(progress.total_units, 1) * 100.0

    completed_at = if completion_pct >= 100.0, do: DateTime.utc_now(), else: nil

    updated = %{progress |
      completed_units: updated_units,
      completion_pct: min(completion_pct, 100.0),
      completed_at: completed_at,
      last_activity: DateTime.utc_now()
    }

    :ets.insert(@table, {key, updated})

    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      @pubsub_topic,
      {:progress_updated, updated}
    )

    {:reply, {:ok, updated}, state}
  end

  defp initialize_progress(learner_id, topic_slug) do
    total_units = PrismaticAcademy.TopicRegistry.get_unit_count(topic_slug)

    %{
      learner_id: learner_id,
      topic_slug: topic_slug,
      completed_units: MapSet.new(),
      total_units: total_units,
      completion_pct: 0.0,
      started_at: DateTime.utc_now(),
      completed_at: nil,
      last_activity: DateTime.utc_now()
    }
  end
end
```

## Architecture & Implementation

The completion tracking system follows the Prismatic Platform's standard architecture pattern: ETS for hot data access with PostgreSQL for durable persistence. The ProgressTracker GenServer maintains current progress in an ETS table for sub-millisecond reads (critical for dashboard rendering), while periodically flushing completed records to PostgreSQL for cross-session durability.

Progress events are published via Phoenix PubSub, enabling real-time dashboard updates without polling. When a learner completes a content unit, the LiveView dashboard at `/academy` receives a PubSub notification and updates the progress bar, completion percentage, and recommended next steps in real time.

The relationship between completion and competency is deliberately separated. Completion is objective and binary (a unit is either completed or not), while competency is subjective and graduated (assessed through weighted evidence from multiple sources). This separation allows the platform to distinguish between "has seen all the content" and "has demonstrated the ability to apply it" -- both are valuable metrics with different implications.

## Usage in Prismatic Platform

The Academy dashboard renders completion progress as visual progress bars for each topic and learning path. The InterconnectionEngine's directed graph ensures that prerequisite topics must reach 100% completion before dependent topics become available. This enforces a structured learning progression that builds knowledge cumulatively.

The certification engine queries the ProgressTracker to verify that all prerequisite topics are completed before allowing a certification assessment attempt. A learner cannot take the "Certified OSINT Analyst" exam until every topic in the OSINT learning path shows 100% completion.

Completion analytics feed into the Academy's curriculum improvement process. Topics with high abandonment rates (started but not completed) are flagged for content review. The Academy team analyzes which specific content units have the highest drop-off rates and restructures content to improve engagement and completion.

## Cross-References

- [Competency](/glossary/competency/) - skill proficiency built through completion
- [Certification](/glossary/certification/) - credential requiring topic completion
- [Completeness](/glossary/completeness/) - data quality dimension (distinct concept)
- [Curriculum](/glossary/curriculum/) - structured content that completion tracks
- [Assessment](/glossary/assessment/) - evaluation following completion
- **Livebooks**: `livebooks/domains/academy_learning/` - interactive progress tracking
- **Academy**: ProgressTracker GenServer manages all completion state

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
