+++
title = "Progress"
weight = 50
[extra]
description = "Learning completion tracking system measuring topic mastery and skill advancement across Academy paths"
category = "academy"
related_terms = ["prerequisite", "semantic-link", "semantic-linking", "quality-floor", "process"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["progress", "learning", "tracking", "completion", "academy", "mastery", "glossary", "Prismatic Platform"]
tags = ["glossary", "academy", "learning", "tracking"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Progress - Prismatic Platform"
+++

## Definition & Overview

Progress tracking in educational platforms refers to the systematic measurement and recording of a learner's advancement through a curriculum. Progress encompasses multiple dimensions: completion status (which topics have been finished), mastery level (how well the material was understood), time investment (how long was spent on each topic), and skill acquisition (which competencies have been demonstrated). Effective progress tracking transforms passive content consumption into active learning journeys with measurable outcomes.

In the Prismatic Academy, progress tracking serves three purposes. First, it gates access to advanced topics by verifying prerequisite completion. Second, it provides learners with a visual representation of their journey, motivating continued engagement. Third, it generates data for the platform to optimize learning paths -- identifying topics where learners struggle enables content improvement and adaptive sequencing.

The progress tracking system integrates with the Academy's self-registering topic architecture. When a topic registers itself via the `use PrismaticAcademy.Topic` macro, its metadata (duration, difficulty, prerequisites, learning objectives) becomes available to the ProgressTracker GenServer. The tracker maintains per-user progress state in ETS for fast reads and persists completed milestones to PostgreSQL for durability.

## Technical Deep Dive

The ProgressTracker is implemented as an OTP GenServer that manages learner state transitions. Each learner's progress is represented as a map of topic slugs to completion records, stored in ETS for sub-millisecond access and periodically flushed to PostgreSQL.

```elixir
defmodule PrismaticAcademy.ProgressTracker do
  @moduledoc """
  Tracks learner progress across Academy topics with ETS-backed
  fast reads and PostgreSQL persistence for durability.
  """

  use GenServer

  @ets_table :academy_progress
  @flush_interval 60_000

  @type progress_status :: :not_started | :in_progress | :completed
  @type completion_record :: %{
    status: progress_status(),
    started_at: DateTime.t() | nil,
    completed_at: DateTime.t() | nil,
    time_spent_seconds: non_neg_integer(),
    mastery_score: float() | nil
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :set, :public, read_concurrency: true])
    load_from_database()
    schedule_flush()
    {:ok, %{dirty_keys: MapSet.new()}}
  end

  @spec get_progress(binary(), String.t()) :: {:ok, completion_record()} | {:ok, nil}
  def get_progress(user_id, topic_slug) do
    case :ets.lookup(@ets_table, {user_id, topic_slug}) do
      [{_, record}] -> {:ok, record}
      [] -> {:ok, nil}
    end
  end

  @spec get_all_progress(binary()) :: {:ok, %{String.t() => completion_record()}}
  def get_all_progress(user_id) do
    pattern = [{{:"$1", :"$2"}, :"$3"}]
    guards = [{:==, :"$1", user_id}]
    results = :ets.select(@ets_table, [{{{:"$1", :"$2"}, :"$3"}, guards, [{{:"$2", :"$3"}}]}])
    {:ok, Map.new(results)}
  end

  @spec start_topic(binary(), String.t()) :: :ok
  def start_topic(user_id, topic_slug) do
    record = %{
      status: :in_progress,
      started_at: DateTime.utc_now(),
      completed_at: nil,
      time_spent_seconds: 0,
      mastery_score: nil
    }

    GenServer.call(__MODULE__, {:update, user_id, topic_slug, record})
  end

  @spec complete_topic(binary(), String.t(), float()) :: :ok | {:error, :prerequisites_not_met}
  def complete_topic(user_id, topic_slug, mastery_score) do
    GenServer.call(__MODULE__, {:complete, user_id, topic_slug, mastery_score})
  end

  @impl true
  def handle_call({:update, user_id, topic_slug, record}, _from, state) do
    key = {user_id, topic_slug}
    :ets.insert(@ets_table, {key, record})
    {:reply, :ok, %{state | dirty_keys: MapSet.put(state.dirty_keys, key)}}
  end

  @impl true
  def handle_call({:complete, user_id, topic_slug, score}, _from, state) do
    case check_prerequisites(user_id, topic_slug) do
      :ok ->
        record = %{
          status: :completed,
          started_at: get_started_at(user_id, topic_slug),
          completed_at: DateTime.utc_now(),
          time_spent_seconds: compute_time_spent(user_id, topic_slug),
          mastery_score: score
        }

        key = {user_id, topic_slug}
        :ets.insert(@ets_table, {key, record})

        Phoenix.PubSub.broadcast(
          PrismaticWeb.PubSub,
          "academy:progress:#{user_id}",
          {:topic_completed, topic_slug, score}
        )

        {:reply, :ok, %{state | dirty_keys: MapSet.put(state.dirty_keys, key)}}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end

  @impl true
  def handle_info(:flush, state) do
    flush_to_database(state.dirty_keys)
    schedule_flush()
    {:noreply, %{state | dirty_keys: MapSet.new()}}
  end

  defp check_prerequisites(user_id, topic_slug) do
    topic = PrismaticAcademy.TopicRegistry.get_by_slug(topic_slug)
    prerequisites = topic[:prerequisites] || []

    {:ok, user_progress} = get_all_progress(user_id)

    unmet =
      Enum.reject(prerequisites, fn prereq ->
        case Map.get(user_progress, prereq) do
          %{status: :completed} -> true
          _ -> false
        end
      end)

    case unmet do
      [] -> :ok
      missing -> {:error, {:prerequisites_not_met, missing}}
    end
  end

  defp get_started_at(user_id, topic_slug) do
    case :ets.lookup(@ets_table, {user_id, topic_slug}) do
      [{_, %{started_at: started_at}}] -> started_at
      _ -> DateTime.utc_now()
    end
  end

  defp compute_time_spent(user_id, topic_slug) do
    case get_started_at(user_id, topic_slug) do
      nil -> 0
      started_at -> DateTime.diff(DateTime.utc_now(), started_at)
    end
  end

  defp load_from_database do
    # Load persisted progress records into ETS on startup
  end

  defp flush_to_database(dirty_keys) do
    Enum.each(dirty_keys, fn {user_id, topic_slug} = key ->
      case :ets.lookup(@ets_table, key) do
        [{_, record}] ->
          PrismaticAcademy.Repo.upsert_progress(user_id, topic_slug, record)
        [] ->
          :ok
      end
    end)
  end

  defp schedule_flush, do: Process.send_after(self(), :flush, @flush_interval)
end
```

## Architecture & Implementation

The progress tracking architecture uses a dual-storage strategy: ETS for hot reads (every page load checks progress status) and PostgreSQL for durable persistence. The GenServer acts as a write-through cache, accepting progress updates via synchronous calls, storing them immediately in ETS, and batching writes to PostgreSQL at configurable intervals.

Progress events are broadcast via PubSub, enabling real-time UI updates. When a learner completes a topic, the LiveView dashboard receives a PubSub message and updates the progress display without requiring a page refresh. This reactive architecture provides immediate feedback that reinforces the learning accomplishment.

The progress system integrates with the prerequisite graph to compute available topics. When a topic is completed, the system recalculates which new topics have become available (their prerequisites are now satisfied), presenting them as recommended next steps in the UI.

## Usage in Prismatic Platform

The Academy dashboard displays progress as visual indicators on each topic card, with completion percentages, time spent, and mastery scores. The progress data also feeds into the platform's analytics, enabling identification of topics that have high dropout rates or low mastery scores.

```elixir
defmodule PrismaticWeb.Academy.ProgressComponent do
  use Phoenix.Component

  attr :user_id, :string, required: true
  attr :topics, :list, required: true

  def progress_overview(assigns) do
    {:ok, all_progress} = PrismaticAcademy.ProgressTracker.get_all_progress(assigns.user_id)
    total = length(assigns.topics)
    completed = Enum.count(all_progress, fn {_, r} -> r.status == :completed end)
    in_progress = Enum.count(all_progress, fn {_, r} -> r.status == :in_progress end)
    percentage = if total > 0, do: round(completed / total * 100), else: 0

    assigns =
      assigns
      |> assign(:completed, completed)
      |> assign(:in_progress, in_progress)
      |> assign(:total, total)
      |> assign(:percentage, percentage)

    ~H"""
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Learning Progress</h3>
      <div class="flex items-center gap-4">
        <div class="flex-1 bg-gray-700 rounded-full h-3">
          <div class="bg-indigo-500 h-3 rounded-full" style={"width: #{@percentage}%"}></div>
        </div>
        <span class="text-white font-medium"><%= @percentage %>%</span>
      </div>
      <div class="mt-3 flex gap-6 text-sm text-gray-400">
        <span><%= @completed %> completed</span>
        <span><%= @in_progress %> in progress</span>
        <span><%= @total - @completed - @in_progress %> remaining</span>
      </div>
    </div>
    """
  end
end
```

## Cross-References

- [Prerequisite](/glossary/prerequisite/) - Learning dependency validated by progress tracking
- **Semantic Link** - Knowledge graph connections enriching learning paths
- **Semantic Linking** - Topic interconnection engine supporting progress-based recommendations
- **Self-Registration** - Metaprogramming pattern that registers topics tracked by progress
- [Process](/glossary/process/) - GenServer process implementing the ProgressTracker

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
