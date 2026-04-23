+++
title = "Learning Analytics"
weight = 50

[extra]
description = "Learning Analytics is the measurement, collection, analysis, and reporting of data about learners and their contexts to understand and optimize learning and the environments in which it occurs, enabling personalized paths and evidence-based content improvement."
category = "learning"
domain = "education-technology"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["knowledge-check", "prerequisite", "progress", "learning-path", "kpi", "telemetry", "ets", "genserver", "interconnection-engine", "topic-registry", "academy", "adaptive-learning"]
tags = ["glossary", "learning-analytics", "education", "data-analysis", "academy", "learner-performance", "adaptive-learning", "telemetry", "progress-tracking", "knowledge-check", "personalization"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Learning analytics in Prismatic Academy uses real-time Telemetry events, GenServer-based progress tracking, and ETS-cached metrics to personalize learning paths, identify comprehension gaps, and calibrate content difficulty dynamically."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["learning analytics", "educational data mining", "learner performance", "adaptive learning", "learning optimization", "educational metrics", "comprehension tracking", "Academy", "progress tracking", "knowledge checks", "topic difficulty"]
image = "/images/sections/glossary.png"
image_alt = "Learning Analytics - Prismatic Platform"
word_count = 3400
see_also = ["academy", "capabilities", "architecture", "telemetry", "ets"]
+++

## Definition

Learning Analytics (LA) is the interdisciplinary field concerned with the measurement, collection, analysis, and reporting of data about learners and their contexts, with the purpose of understanding and optimizing learning and the environments in which it occurs. As defined by the Society for Learning Analytics Research (SoLAR), LA sits at the intersection of learning science, data science, and human-computer interaction. Unlike traditional educational assessment which measures outcomes at discrete points, LA operates continuously, capturing temporal patterns in learner behavior that reveal the process of learning, not just its results.

The core insight of learning analytics is that digital learning environments generate rich behavioral data -- click patterns, time on task, assessment responses, content navigation paths, collaboration patterns -- and this data, when properly analyzed, reveals actionable insights about learner engagement, comprehension, and risk of dropout that are invisible to instructors relying on periodic assessments alone.

In the Prismatic Platform, learning analytics powers the Academy subsystem's adaptive capabilities. Every learner interaction generates structured Telemetry events that feed into the ProgressTracker GenServer, the InterconnectionEngine for semantic linking, and the content difficulty calibration system. This creates a continuous feedback loop where learner behavior data directly improves content quality, prerequisite accuracy, and recommendation relevance -- all implemented through BEAM-native patterns (GenServers, ETS, PubSub) for real-time responsiveness.

## Core Concepts

| Concept | Description | Prismatic Usage |
|---------|-------------|-----------------|
| **Descriptive analytics** | What happened: completion rates, scores, time on task | Academy dashboard topic completion rates and average scores |
| **Diagnostic analytics** | Why it happened: correlation between behaviors and outcomes | Identifying topics where high time-on-task correlates with low scores |
| **Predictive analytics** | What will happen: dropout risk, performance forecasting | Risk assessment based on consecutive failures and activity gaps |
| **Prescriptive analytics** | What to do: personalized recommendations, intervention triggers | InterconnectionEngine weighted recommendations based on learner history |
| **Telemetry events** | Structured event streams capturing learner interactions | `[:prismatic_academy, :topic, :*]` namespace events |
| **Progress tracking** | Per-learner state: completed topics, scores, time, prerequisites | ProgressTracker GenServer maintaining learner state in ETS |
| **Knowledge checks** | In-topic assessments measuring comprehension at specific points | Multiple-choice and code-completion checks with immediate feedback |
| **Difficulty calibration** | Adjusting perceived difficulty based on aggregate learner data | Topics where avg time > 2x expected flagged for content review |
| **Learning velocity** | Rate of content mastery (topics per time unit) | Computed from learner progress to detect acceleration or stalling |
| **Engagement decay** | Decreasing interaction frequency within and across sessions | Session-level analytics tracking event density over time |
| **Prerequisite validation** | Verifying learners have completed required topics before advancing | Directed graph (`:digraph`) enforcing prerequisite dependencies |
| **Content recommendation** | Suggesting next topics based on learner profile and peer behavior | InterconnectionEngine edge weights derived from analytics data |

## Technical Deep Dive

### Four Levels of Learning Analytics

Learning analytics operates at four levels of increasing sophistication:

**Descriptive** (what happened): Completion rates, average scores, time distributions, and content popularity metrics. These are computed as simple aggregations over event streams and displayed on the Academy dashboard. In Prismatic Platform, descriptive analytics are cached in ETS for sub-millisecond dashboard rendering.

**Diagnostic** (why it happened): Correlation analysis between learner behaviors and outcomes. For example, learners who spend less than 3 minutes on a 10-minute topic consistently score below 60% on knowledge checks -- indicating skimming rather than reading. Diagnostic analytics identify content and behavior patterns that explain descriptive metrics.

**Predictive** (what will happen): Risk models that forecast learner dropout, topic failure, or certification readiness. Prismatic Academy implements a rule-based risk assessment: 3+ consecutive failures OR 14+ days of inactivity triggers "high risk" classification. More sophisticated ML-based prediction (logistic regression on historical learner features) is architecturally supported but not yet deployed.

**Prescriptive** (what to do): Actionable recommendations derived from predictive and diagnostic insights. The InterconnectionEngine uses analytics-derived edge weights to recommend next topics. Topics frequently completed after the current topic by successful learners score higher in recommendations than topics completed by struggling learners.

### Event Streaming Architecture

The technical infrastructure for learning analytics requires event streaming, time-series storage, and real-time aggregation. Events are captured as structured Telemetry measurements:

```
{learner_id, topic_id, event_type, timestamp, metadata}
```

Event types in the Academy system include:
- `topic_started` -- learner opens a topic
- `topic_completed` -- learner finishes reading all sections
- `check_attempted` -- learner submits a knowledge check answer
- `check_passed` / `check_failed` -- knowledge check result
- `section_viewed` -- learner navigates to a specific section
- `session_ended` -- learner closes the Academy tab or navigates away

Common metrics computed from raw events:
- **Dwell time**: Time between `topic_started` and next navigation event
- **Interaction density**: Events per minute within a topic session
- **Revision patterns**: Repeated `section_viewed` events for the same section
- **Assessment trajectory**: Score trends over sequential knowledge checks
- **Learning velocity**: Topics completed per hour/day/week

### Predictive Risk Assessment

Predictive models in learning analytics typically use logistic regression, decision trees, or neural networks trained on historical learner data to identify at-risk learners early. Feature engineering is domain-specific: in cybersecurity education (relevant to Prismatic Academy's security topics), hands-on lab completion is a stronger predictor of certification success than lecture attendance; in programming education, compile frequency predicts grade better than time-on-task.

Prismatic Academy's current risk model uses a deterministic rule-based approach:

| Condition | Risk Level | Intervention |
|-----------|-----------|--------------|
| 3+ consecutive check failures | High | Suggest prerequisite review, simplify next recommendations |
| 14+ days since last activity | High | Send engagement reminder, highlight new content |
| Average score < 60% | Medium | Recommend supplementary resources, adjust difficulty |
| Learning velocity declining | Medium | Suggest shorter topics, break recommendations into smaller units |
| All metrics normal | Low | Continue standard recommendation flow |

### Real-Time Aggregation with GenServer + ETS

The ProgressTracker GenServer maintains per-learner state in an ETS table for concurrent read access. Writes go through the GenServer to ensure serialization; reads bypass the GenServer by querying ETS directly. This pattern provides:

- **Write consistency**: GenServer serializes state updates, preventing race conditions
- **Read scalability**: Any process can read ETS directly without GenServer bottleneck
- **Crash recovery**: ETS table survives GenServer restart if owned by a supervisor
- **Sub-millisecond reads**: ETS lookup by learner_id is O(1) via hash table

The InterconnectionEngine uses a separate `:digraph`-based data structure for semantic linking. Analytics data feeds into edge weight adjustments: when analytics show that learners who complete Topic A frequently succeed at Topic B, the edge weight from A to B increases, making B a stronger recommendation after A.

### Content Difficulty Calibration

Difficulty calibration uses aggregate analytics to identify content that is too hard, too easy, or appropriately challenging:

- **Too hard**: Average score < 50% AND average time > 2x expected reading time. Indicates learners are struggling with both comprehension and pacing.
- **Too easy**: Average score > 95% AND average time < 0.5x expected reading time. Indicates content is trivial and may bore learners.
- **Appropriate**: Average score 60-90% AND average time 0.7-1.5x expected. The "desirable difficulty" zone where learning is challenging but achievable.

Topics outside the appropriate zone are flagged for content review on the Academy dashboard, with specific recommendations (add prerequisites, simplify language, add examples, increase depth).

## Usage in Prismatic Platform

### Academy ProgressTracker

Prismatic Academy implements learning analytics through its ProgressTracker GenServer and Telemetry system. Every learner interaction generates telemetry events tagged with `[:prismatic_academy, :topic, :*]` namespaces. The ProgressTracker maintains per-learner state: completed topics, knowledge check scores, time spent per topic, and prerequisite satisfaction.

### InterconnectionEngine Recommendations

The InterconnectionEngine (`:digraph`-based semantic linking GenServer) uses analytics data to weight recommendation edges. Topics that frequently follow successful completions of the current topic score higher in recommendations. This creates a peer-behavior-driven recommendation system that improves as more learners use the Academy.

### Dashboard Analytics Display

The Academy dashboard exposes analytics summaries: topic completion rates, average knowledge check scores, learner progression paths (visualized as Sankey diagrams), and content difficulty calibration (topics where average time exceeds expected reading time by more than 2x are flagged for content review). Session-level analytics track engagement decay curves to optimize topic length and knowledge check placement.

### Telemetry Integration

All analytics events flow through the standard Prismatic Telemetry pipeline. This means they are automatically available for:
- Dashboard display via LiveView subscriptions to PubSub topics
- Time-series storage for historical trend analysis
- Alerting when anomalies are detected (e.g., sudden completion rate drops)
- Cross-subsystem correlation (e.g., OSINT tool usage patterns alongside Academy progress)

## Code Examples

```elixir
defmodule PrismaticAcademy.Analytics do
  @moduledoc """
  Learning analytics engine for Prismatic Academy.

  Computes learner profiles, topic difficulty metrics, engagement
  analysis, and risk assessments from the ProgressTracker's event
  data. All computations are designed for real-time dashboard
  rendering with sub-100ms response times via ETS-cached data.

  ## Architecture

  Analytics operates in three modes:

  1. **Real-time**: LiveView dashboard subscribes to PubSub events
     for immediate metric updates as learners interact
  2. **On-demand**: Profile and difficulty calculations computed
     from ETS-cached progress data when requested
  3. **Batch**: Nightly aggregation of raw events into summary
     tables for historical trend analysis

  ## Metrics Computed

  - Learner profiles (completion, scores, velocity, risk)
  - Topic difficulty calibration (hard/easy/appropriate)
  - Engagement decay curves (within-session, cross-session)
  - Prerequisite effectiveness (correlation with downstream success)
  - Recommendation accuracy (click-through and completion rates)
  """

  alias PrismaticAcademy.ProgressTracker

  require Logger

  @type risk_level :: :low | :medium | :high
  @type difficulty_rating :: :too_hard | :too_easy | :appropriate | :insufficient_data

  @type learner_profile :: %{
    learner_id: String.t(),
    topics_completed: non_neg_integer(),
    topics_available: non_neg_integer(),
    avg_check_score: float(),
    total_time_minutes: non_neg_integer(),
    learning_velocity: float(),
    risk_level: risk_level(),
    consecutive_failures: non_neg_integer(),
    days_since_last_activity: non_neg_integer(),
    strongest_category: String.t() | nil,
    weakest_category: String.t() | nil
  }

  @type topic_analysis :: %{
    topic_id: String.t(),
    attempt_count: non_neg_integer(),
    unique_learners: non_neg_integer(),
    avg_score: float(),
    median_score: float(),
    avg_time_minutes: float(),
    expected_time_minutes: float(),
    completion_rate: float(),
    difficulty_rating: difficulty_rating(),
    prerequisite_satisfaction_rate: float(),
    recommendation_score: float()
  }

  @type engagement_metrics :: %{
    learner_id: String.t(),
    session_count: non_neg_integer(),
    avg_session_duration_minutes: float(),
    events_per_session: float(),
    engagement_trend: :increasing | :stable | :decreasing,
    last_active: DateTime.t() | nil
  }

  @doc """
  Builds a comprehensive learner profile from progress data.

  Aggregates all available metrics for a learner including
  completion status, assessment performance, learning velocity,
  risk assessment, and category-level strengths/weaknesses.

  ## Parameters

    * `learner_id` - Unique learner identifier

  ## Returns

    * `{:ok, profile}` - Complete learner profile map
    * `{:error, :not_found}` - Learner has no recorded progress

  ## Examples

      iex> {:ok, profile} = PrismaticAcademy.Analytics.build_profile("learner-123")
      iex> profile.risk_level in [:low, :medium, :high]
      true

  """
  @spec build_profile(String.t()) :: {:ok, learner_profile()} | {:error, :not_found}
  def build_profile(learner_id) do
    case ProgressTracker.get_progress(learner_id) do
      {:ok, progress} ->
        category_analysis = analyze_categories(progress.check_results)

        profile = %{
          learner_id: learner_id,
          topics_completed: length(progress.completed_topics),
          topics_available: ProgressTracker.total_topics(),
          avg_check_score: compute_avg_score(progress.check_results),
          total_time_minutes: compute_total_time(progress.sessions),
          learning_velocity: compute_velocity(progress),
          risk_level: assess_risk(progress),
          consecutive_failures: progress.consecutive_failures,
          days_since_last_activity: days_since(progress.last_activity),
          strongest_category: category_analysis.strongest,
          weakest_category: category_analysis.weakest
        }

        {:ok, profile}

      {:error, _} = error ->
        error
    end
  end

  @doc """
  Analyzes topic difficulty based on aggregate learner performance.

  Computes descriptive statistics and difficulty calibration for
  a specific topic. Topics with fewer than 5 attempts return
  `:insufficient_data` for difficulty rating to avoid premature
  conclusions from small samples.

  ## Parameters

    * `topic_id` - Unique topic identifier

  ## Returns

    * Topic analysis map with metrics and difficulty rating

  ## Examples

      iex> analysis = PrismaticAcademy.Analytics.topic_difficulty_analysis("elixir-basics")
      iex> analysis.difficulty_rating in [:too_hard, :too_easy, :appropriate, :insufficient_data]
      true

  """
  @spec topic_difficulty_analysis(String.t()) :: topic_analysis()
  def topic_difficulty_analysis(topic_id) do
    results = ProgressTracker.all_results_for_topic(topic_id)
    topic_meta = ProgressTracker.topic_metadata(topic_id)
    expected_time = Map.get(topic_meta, :expected_minutes, 10)

    avg_score = compute_avg_score(results)
    avg_time = compute_avg_time(results)
    unique_learners = results |> Enum.map(& &1.learner_id) |> Enum.uniq() |> length()

    %{
      topic_id: topic_id,
      attempt_count: length(results),
      unique_learners: unique_learners,
      avg_score: avg_score,
      median_score: compute_median_score(results),
      avg_time_minutes: avg_time,
      expected_time_minutes: expected_time,
      completion_rate: compute_completion_rate(results),
      difficulty_rating: calibrate_difficulty(results, avg_score, avg_time, expected_time),
      prerequisite_satisfaction_rate: compute_prereq_satisfaction(results),
      recommendation_score: compute_recommendation_score(results, avg_score)
    }
  end

  @doc """
  Computes engagement metrics for a learner across all sessions.

  Analyzes session patterns to determine engagement trend
  (increasing, stable, or decreasing) based on the slope of
  session duration over the last 10 sessions.

  ## Parameters

    * `learner_id` - Unique learner identifier

  ## Returns

    * `{:ok, metrics}` - Engagement metrics map
    * `{:error, :not_found}` - No sessions recorded

  ## Examples

      iex> {:ok, metrics} = PrismaticAcademy.Analytics.engagement_metrics("learner-123")
      iex> metrics.engagement_trend in [:increasing, :stable, :decreasing]
      true

  """
  @spec engagement_metrics(String.t()) :: {:ok, engagement_metrics()} | {:error, :not_found}
  def engagement_metrics(learner_id) do
    case ProgressTracker.get_sessions(learner_id) do
      {:ok, sessions} when sessions != [] ->
        durations = Enum.map(sessions, & &1.duration_min)
        events = Enum.map(sessions, & &1.event_count)

        {:ok, %{
          learner_id: learner_id,
          session_count: length(sessions),
          avg_session_duration_minutes: safe_avg(durations),
          events_per_session: safe_avg(events),
          engagement_trend: compute_trend(durations),
          last_active: sessions |> Enum.max_by(& &1.ended_at, DateTime) |> Map.get(:ended_at)
        }}

      _ ->
        {:error, :not_found}
    end
  end

  @doc """
  Generates a cohort comparison report.

  Compares analytics metrics across learner cohorts (grouped by
  start date, category focus, or risk level) to identify systemic
  patterns and content improvement opportunities.

  ## Parameters

    * `group_by` - Grouping criterion: `:start_date`, `:category`, or `:risk_level`
    * `opts` - Options:
      * `:min_cohort_size` - Minimum learners per cohort (default: 3)

  ## Examples

      iex> report = PrismaticAcademy.Analytics.cohort_report(:risk_level)
      iex> is_map(report)
      true

  """
  @spec cohort_report(atom(), keyword()) :: map()
  def cohort_report(group_by, opts \\ []) do
    min_size = Keyword.get(opts, :min_cohort_size, 3)

    ProgressTracker.all_learners()
    |> Enum.group_by(&cohort_key(&1, group_by))
    |> Enum.filter(fn {_key, learners} -> length(learners) >= min_size end)
    |> Enum.map(fn {key, learners} ->
      scores = Enum.map(learners, &compute_avg_score(&1.check_results))
      velocities = Enum.map(learners, &compute_velocity/1)

      {key, %{
        cohort_size: length(learners),
        avg_score: safe_avg(scores),
        avg_velocity: safe_avg(velocities),
        completion_rate: Enum.count(learners, &(&1.completed_topics != [])) / length(learners)
      }}
    end)
    |> Map.new()
  end

  # Private helper functions

  defp assess_risk(progress) do
    cond do
      progress.consecutive_failures >= 3 -> :high
      days_since(progress.last_activity) > 14 -> :high
      compute_avg_score(progress.check_results) < 0.6 -> :medium
      compute_velocity(progress) < 0.5 -> :medium
      true -> :low
    end
  end

  defp compute_avg_score([]), do: 0.0
  defp compute_avg_score(results) do
    scores = Enum.map(results, & &1.score)
    Enum.sum(scores) / length(scores)
  end

  defp compute_median_score([]), do: 0.0
  defp compute_median_score(results) do
    sorted = results |> Enum.map(& &1.score) |> Enum.sort()
    mid = div(length(sorted), 2)

    if rem(length(sorted), 2) == 0 do
      (Enum.at(sorted, mid - 1) + Enum.at(sorted, mid)) / 2
    else
      Enum.at(sorted, mid)
    end
  end

  defp compute_velocity(progress) do
    Map.get(progress, :topics_per_week, 0.0)
  end

  defp compute_total_time(sessions) do
    sessions |> Enum.map(& &1.duration_min) |> Enum.sum()
  end

  defp compute_avg_time([]), do: 0.0
  defp compute_avg_time(results) do
    times = Enum.map(results, & &1.time_minutes)
    Enum.sum(times) / length(times)
  end

  defp compute_completion_rate([]), do: 0.0
  defp compute_completion_rate(results) do
    Enum.count(results, & &1.completed) / length(results)
  end

  defp calibrate_difficulty(results, _avg_score, _avg_time, _expected_time) when length(results) < 5 do
    :insufficient_data
  end

  defp calibrate_difficulty(_results, avg_score, avg_time, expected_time) do
    cond do
      avg_score < 0.5 and avg_time > expected_time * 2 -> :too_hard
      avg_score > 0.95 and avg_time < expected_time * 0.5 -> :too_easy
      true -> :appropriate
    end
  end

  defp compute_prereq_satisfaction(results) do
    with_prereqs = Enum.filter(results, & &1.had_prerequisites)
    if with_prereqs == [], do: 1.0, else: Enum.count(with_prereqs, & &1.prereqs_met) / length(with_prereqs)
  end

  defp compute_recommendation_score([], _avg_score), do: 0.0
  defp compute_recommendation_score(results, avg_score) do
    completion = compute_completion_rate(results)
    # Higher score = better recommendation candidate
    # Balance between achievable (not too hard) and valuable (not trivial)
    completion * 0.4 + avg_score * 0.3 + min(length(results) / 100, 1.0) * 0.3
  end

  defp analyze_categories(check_results) do
    by_category =
      check_results
      |> Enum.group_by(& &1.category)
      |> Enum.map(fn {cat, results} -> {cat, compute_avg_score(results)} end)

    strongest = by_category |> Enum.max_by(&elem(&1, 1), fn -> {nil, 0} end) |> elem(0)
    weakest = by_category |> Enum.min_by(&elem(&1, 1), fn -> {nil, 0} end) |> elem(0)

    %{strongest: strongest, weakest: weakest}
  end

  defp days_since(nil), do: 999
  defp days_since(datetime) do
    DateTime.utc_now()
    |> DateTime.diff(datetime, :second)
    |> div(86_400)
  end

  defp safe_avg([]), do: 0.0
  defp safe_avg(values), do: Enum.sum(values) / length(values)

  defp compute_trend(values) when length(values) < 3, do: :stable
  defp compute_trend(values) do
    recent = values |> Enum.take(-5)
    earlier = values |> Enum.take(5)

    recent_avg = safe_avg(recent)
    earlier_avg = safe_avg(earlier)

    cond do
      recent_avg > earlier_avg * 1.15 -> :increasing
      recent_avg < earlier_avg * 0.85 -> :decreasing
      true -> :stable
    end
  end

  defp cohort_key(learner, :start_date) do
    case learner.first_activity do
      nil -> :unknown
      dt -> Date.beginning_of_week(DateTime.to_date(dt))
    end
  end

  defp cohort_key(learner, :risk_level), do: assess_risk(learner)
  defp cohort_key(learner, :category), do: learner.primary_category || :uncategorized
end
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **Pre-aggregating events too early** | Cannot reconstruct granular data from aggregated metrics | Store raw events; aggregate at query time or in batch jobs |
| **Small sample size conclusions** | 3 learners does not validate topic difficulty claims | Require minimum sample sizes (5+ for difficulty, 10+ for trends) |
| **Ignoring engagement decay** | Optimizing content length without understanding attention curves | Track event density within sessions to find attention drop-off points |
| **Correlation as causation** | Confusing "time spent correlates with low scores" with "spending time causes low scores" | Use A/B testing to validate causal hypotheses before acting on correlations |
| **Privacy violations in analytics** | Exposing individual learner data in aggregate dashboards | Anonymize learner data for aggregate reporting; require consent for personalization |
| **Stale cached metrics** | Dashboard shows outdated analytics after content changes | Set appropriate TTL on ETS-cached analytics; invalidate on content updates |
| **Ignoring prerequisite effectiveness** | Prerequisites that do not actually improve downstream performance | Measure correlation between prerequisite completion and downstream scores |
| **Over-personalizing recommendations** | Filter bubbles where learners never encounter challenging material | Include "exploration" recommendations alongside optimized paths |
| **Not accounting for assessment validity** | Knowledge checks that do not actually measure comprehension | Regularly review check item discrimination and difficulty statistics |
| **Missing cross-session analysis** | Analyzing only within-session metrics misses long-term patterns | Track learner trajectories across sessions for accurate velocity and risk |

## Best Practices

1. **Capture events at the finest granularity available and aggregate later** -- you cannot reconstruct granular data from pre-aggregated metrics; raw events are the source of truth.
2. **Anonymize learner data for aggregate reporting** while maintaining identifiable records only for personalized recommendations with explicit consent.
3. **Use A/B testing on content variations** and measure impact through analytics rather than subjective feedback to validate content improvement hypotheses.
4. **Alert content authors when topic analytics show anomalies** -- completion rate below 40%, average time 3x expected, or average score below 50% should trigger content review.
5. **Store analytics events in append-only time-series storage** for reproducible longitudinal analysis; never modify or delete raw event data.
6. **Separate real-time dashboards from analytical reports** -- real-time (last 24 hours, approximate via ETS) vs. analytical (full history, exact via PostgreSQL) balance latency and accuracy.
7. **Require minimum sample sizes before drawing conclusions** -- topic difficulty calibration needs 5+ attempts, trend analysis needs 10+ data points.
8. **Implement engagement-aware recommendation** -- account for learner energy levels by recommending shorter/easier topics after high-effort sessions.
9. **Validate knowledge check quality** -- use item response theory metrics (discrimination, difficulty, guessing parameters) to identify checks that do not differentiate learners.
10. **Build feedback loops between analytics and content** -- analytics should directly inform content authoring priorities, prerequisite adjustments, and topic ordering.

## Related Terms

- [Knowledge Check](/glossary/knowledge-check/) -- assessment mechanism that generates analytics data
- [Prerequisite](/glossary/prerequisite/) -- dependency that analytics helps optimize and validate
- [Progress](/glossary/progress/) -- learner advancement measured and tracked by analytics
- [Learning Path](/glossary/learning-path/) -- sequence of topics optimized using analytics data
- [KPI](/glossary/kpi/) -- key performance indicators derived from learning analytics
- [Telemetry](/glossary/telemetry/) -- event streaming infrastructure powering analytics data capture
- [ETS](/glossary/ets/) -- in-memory storage for real-time analytics caching
- [GenServer](/glossary/genserver/) -- process model for ProgressTracker and InterconnectionEngine
- [Academy](/glossary/academy/) -- the learning platform generating and consuming analytics
- [Adaptive Learning](/glossary/adaptive-learning/) -- personalization approach driven by analytics insights
- [Interconnection Engine](/glossary/interconnection-engine/) -- semantic linking system weighted by analytics
- [Topic Registry](/glossary/topic-registry/) -- self-registering topic metadata used in analytics context

## See Also

- [Academy](/academy/) -- the learning platform generating analytics data
- [Capabilities](/capabilities/) -- platform analytical capabilities
- [Architecture](/architecture/) -- telemetry and event streaming architecture
- [Telemetry](/telemetry/) -- event infrastructure powering analytics
- [OSINT Toolbox](/osint/) -- cross-subsystem analytics correlation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
