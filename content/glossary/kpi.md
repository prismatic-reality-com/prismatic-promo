+++
title = "KPI"
weight = 50

[extra]
description = "A Key Performance Indicator (KPI) is a quantifiable metric that measures how effectively an organization, team, or system achieves its critical objectives. In the Prismatic Platform, KPIs span quality DNA scoring, doctrine compliance, telemetry-derived operational metrics, and health score computation, providing actionable data for decision-making and continuous improvement."
category = "data"
domain = "observability"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["mean", "median", "percentile", "p95", "p99", "outlier", "quality-floor", "telemetry", "health-score", "sla", "slo", "dashboard"]
tags = ["glossary", "kpi", "metrics", "performance", "measurement", "objectives", "data-driven", "analytics", "telemetry", "quality-dna", "health-score"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "KPIs provide quantifiable measurements of platform health, quality compliance, and operational effectiveness across all Prismatic umbrella apps. The platform's Health Score (computed by mix health.score) is the master KPI that aggregates compilation status, test coverage, doctrine compliance, and documentation completeness into a single actionable number."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["KPI", "key performance indicator", "metrics", "measurement", "performance tracking", "objectives", "business metrics", "operational metrics", "health score", "quality DNA", "telemetry", "OTEL", "doctrine compliance"]
image = "/images/sections/glossary.png"
image_alt = "KPI - Key Performance Indicators - Prismatic Platform"
word_count = 3300
see_also = ["capabilities", "architecture", "quality-floor"]
+++

## Definition

A Key Performance Indicator (KPI) is a quantifiable measurement that evaluates the success of an organization, project, or system in achieving its strategic and operational objectives. KPIs are distinguished from general metrics by their direct connection to critical goals: while a system may track hundreds of metrics, only those that measure progress toward defined objectives qualify as KPIs. Effective KPIs are specific, measurable, achievable, relevant, and time-bound (SMART), and they provide actionable information that drives decisions rather than merely describing state.

KPIs operate at multiple levels: strategic KPIs measure long-term organizational goals (revenue growth, market position), tactical KPIs measure department or team effectiveness (sprint velocity, bug fix rate), and operational KPIs measure real-time system performance (response latency, error rate, throughput). The distinction matters because different stakeholders need different KPIs, and aggregating operational metrics into strategic indicators requires careful statistical treatment to avoid masking important signals in averages.

In software platform engineering, the challenge is not collecting metrics -- modern telemetry systems generate thousands of data points per second -- but selecting the *right* metrics to elevate to KPI status. A KPI that does not change behavior when it moves is not a KPI; it is a vanity metric. The Prismatic Platform addresses this by computing a Health Score (`mix health.score`) that aggregates multiple quality dimensions into a single actionable number, with clear thresholds that trigger concrete remediation actions.

## Core Concepts

### KPI Classification Framework

| Level | Scope | Update Frequency | Example KPIs | Audience |
|-------|-------|-----------------|-------------|----------|
| Strategic | Platform-wide | Monthly/quarterly | Health Score trend, agent count growth, doctrine adoption % | Platform owners, stakeholders |
| Tactical | Per-app or per-domain | Weekly/sprint | Test coverage %, compilation warnings, credo violations | Development teams |
| Operational | Per-request or per-process | Real-time (seconds) | P95 latency, error rate, throughput ops/sec | On-call engineers, dashboards |
| Quality | Per-commit or per-PR | Per-commit | Doctrine compliance score, TACH coverage, ZERO violations | Pre-commit hooks, CI pipeline |

### Leading vs. Lagging Indicators

| Type | Definition | Platform Examples | Action Trigger |
|------|-----------|-------------------|---------------|
| Leading | Predicts future outcomes | Code review coverage, test-to-code ratio, doctrine violation count | Proactive: address before problems manifest |
| Lagging | Measures past results | Production incident count, MTTR, downtime minutes | Reactive: investigate and prevent recurrence |
| Coincident | Real-time state | Active connections, memory usage, replication lag | Immediate: scale or shed load |

### Prismatic Platform KPI Categories

| Category | KPIs Tracked | Source | Threshold Type |
|----------|-------------|--------|---------------|
| Compilation Health | Warning count, error count | `mix compile --warnings-as-errors` | Zero tolerance (blocking) |
| Test Coverage | Test file existence ratio, test count | TACH enforcement, `mix test` | Per-module (blocking) |
| Doctrine Compliance | 18-pillar score, violations per pillar | `mix check.doctrines` | Per-pillar (blocking/advisory) |
| Quality DNA | 13-domain scores | `.claude/quality-dna/current-state.json` | Per-domain minimum |
| Runtime Performance | P95 latency, error rate, throughput | Telemetry + OTEL | SLO-based alerting |
| Memory Health | Total, per-process, ETS, binary | `:erlang.memory/0` | Percentage of available |
| Platform Statistics | Agent count, app count, source files | `mix prismatic.stats.validate` | Consistency (no drift) |
| Replication | Lag ms, RPO compliance | PostgreSQL monitoring | RPO threshold |

### KPI Anti-Patterns (Vanity Metrics)

| Vanity Metric | Why It Is Misleading | Better KPI |
|--------------|---------------------|------------|
| "100% test coverage" | Tests may have no assertions (mutation testing reveals) | Mutation score or assertion density |
| "Zero warnings" | May exclude categories or suppress via `@moduletag` | Warning count across full `--warnings-as-errors` |
| "1000+ tests" | Count says nothing about what is tested | Coverage by critical path, or test-to-module ratio |
| "99.9% uptime" | Masks latency degradation during "up" periods | P95 latency + error rate during uptime |
| "552 agents" | Count says nothing about agent quality or usage | Active agent utilization %, agent error rate |
| "18 pillars" | Pillar count is meaningless if enforcement is advisory | Pillars with blocking enforcement count |

## Technical Deep Dive

### Designing Effective KPIs

Designing effective KPIs requires understanding the distinction between leading and lagging indicators. Leading indicators predict future outcomes (code review coverage predicts defect rates), while lagging indicators measure past results (production incident count). A balanced KPI set includes both types.

In software platforms, common technical KPIs include: P95 latency, error rate, deployment frequency, mean time to recovery (MTTR), test coverage, mutation score, and quality gate pass rate.

KPI dashboards must guard against vanity metrics -- numbers that look impressive but do not inform decisions. Code coverage of 95% is meaningless if tests make no assertions (hence mutation testing). High deployment frequency is meaningless if deployments cause incidents. Each KPI needs context: baseline values, targets, trend direction, and alerting thresholds.

### Statistical Process Control for KPIs

Statistical process control (SPC) techniques -- control charts with upper and lower control limits derived from historical variance -- distinguish normal variation from actionable signals. A KPI value that falls within normal variation does not warrant investigation; one that breaches a control limit does.

For time-series KPIs (latency, throughput, error rate), the platform uses:

- **Moving average**: Smooths short-term fluctuations to reveal trends
- **Standard deviation bands**: 2-sigma (warning) and 3-sigma (critical) limits
- **Exponential weighted moving average (EWMA)**: Gives more weight to recent observations
- **Percentile tracking**: P50 (median), P95, P99 for latency distributions

### Time-Series Storage for KPI History

PostgreSQL with TimescaleDB extension provides hypertable partitioning that maintains query performance as KPI data accumulates over months and years. Retention policies automatically aggregate old data (minute granularity to hourly, hourly to daily) while preserving recent detail. This architecture supports both real-time dashboards (last-minute granularity) and trend analysis (monthly aggregates over years).

### Telemetry Integration Architecture

The BEAM ecosystem uses the `:telemetry` library as the standard instrumentation API. KPI collection follows a pipeline:

1. **Emit**: Application code calls `:telemetry.execute/3` with metric name and measurements
2. **Attach**: Handlers register for specific telemetry events
3. **Aggregate**: Handlers aggregate measurements into statistical summaries
4. **Store**: Aggregated KPIs are written to time-series storage
5. **Alert**: Threshold-based rules trigger notifications when KPIs breach limits
6. **Visualize**: Dashboards render KPI trends and current values

## Usage in Prismatic Platform

### Health Score: The Master KPI

The platform's Health Score (computed by `mix health.score`) is the single most important KPI. It aggregates multiple quality dimensions:

- **Compilation**: Zero warnings required (weight: high)
- **Test coverage**: TACH compliance across modified modules (weight: high)
- **Doctrine compliance**: 18-pillar score from `mix check.doctrines` (weight: medium)
- **Documentation**: @moduledoc/@doc/@spec presence (weight: medium)
- **Code quality**: Credo analysis pass rate (weight: low)

The Health Score is a dynamic value -- never hardcoded, always computed from current platform state. It serves as the primary gate for deployments and the primary trend indicator for platform evolution.

### Quality DNA: Per-Domain KPI Tracking

Quality DNA (`.claude/quality-dna/current-state.json`) records 13 quality domain scores as KPIs. Each domain (compilation, testing, documentation, security, etc.) has an independent score, enabling targeted improvement efforts. The Quality Floor Guardian monitors these scores and alerts when any domain drops below its minimum threshold.

### Platform Statistics as KPIs

Platform-level KPIs are tracked dynamically through `mix prismatic.stats.validate`:

- **Total umbrella apps**: Currently 94 (dynamic count)
- **Agent count**: 552 (discovered from `.aiad/agents/`)
- **OSINT tool count**: 157 (discovered from source registry)
- **Source files**: 14,978 (filesystem scan)
- **Test files**: 6,330 (filesystem scan)
- **AIAD commands**: 228 (registry scan)

These metrics are validated for cross-document consistency -- the NCLB doctrine ensures that all references to these numbers across documentation files match the actual computed values.

### Operational KPIs via Telemetry

The 11-phase pre-commit pipeline measures individual phase durations as operational KPIs, alerting when any phase exceeds its time budget. Runtime KPIs tracked via `:telemetry`:

| KPI | Target | Measurement Method |
|-----|--------|-------------------|
| Page load time | < 250ms | Phoenix.LiveView telemetry |
| Server render | < 100ms | Controller telemetry |
| LiveView mount | < 150ms | LiveView lifecycle hooks |
| Health check | < 10ms | Endpoint timing |
| OSINT tool execution | < 30s per tool | Adapter telemetry |
| DD pipeline stage | < 60s per stage | Pipeline telemetry |

## Code Examples

```elixir
defmodule PrismaticSafety.KPI.Tracker do
  @moduledoc """
  Tracks and evaluates Key Performance Indicators across platform domains.

  Provides a centralized KPI registry with target values, evaluation logic,
  and trend analysis. Integrates with the telemetry pipeline for automatic
  KPI updates and with the alerting system for threshold-based notifications.

  ## KPI Lifecycle

  1. Define KPI with name, target, direction, and category
  2. Record measurements via `record/3`
  3. Evaluate compliance via `evaluate/1`
  4. Query history via `trend/2`

  ## Telemetry Events

      [:prismatic, :kpi, :recorded] - New measurement recorded
      [:prismatic, :kpi, :violation] - KPI breached threshold
      [:prismatic, :kpi, :recovery] - KPI returned to target
  """

  use GenServer
  require Logger

  @type direction :: :higher_is_better | :lower_is_better
  @type category :: :quality | :performance | :security | :operational | :platform
  @type status :: :on_target | :warning | :critical

  @type kpi :: %{
    name: String.t(),
    value: number(),
    target: number(),
    direction: direction(),
    category: category(),
    timestamp: DateTime.t()
  }

  @type kpi_definition :: %{
    name: String.t(),
    target: number(),
    warning_threshold: number(),
    direction: direction(),
    category: category(),
    description: String.t()
  }

  @type trend_point :: %{value: number(), timestamp: DateTime.t()}

  # --- Public API ---

  @doc """
  Starts the KPI tracker.

  ## Examples

      iex> PrismaticSafety.KPI.Tracker.start_link([])
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records a KPI measurement.

  ## Options

    * `:category` - KPI category (default: `:operational`)
    * `:direction` - Whether higher or lower is better (default: `:lower_is_better`)
    * `:target` - Target value for evaluation

  ## Examples

      iex> PrismaticSafety.KPI.Tracker.record("p95_latency_ms", 42.5, target: 100, direction: :lower_is_better)
      :ok

      iex> PrismaticSafety.KPI.Tracker.record("test_coverage", 0.87, target: 0.80, direction: :higher_is_better)
      :ok
  """
  @spec record(String.t(), number(), keyword()) :: :ok
  def record(name, value, opts \\ []) do
    GenServer.cast(__MODULE__, {:record, name, value, opts})
  end

  @doc """
  Evaluates the current status of a KPI against its target.

  ## Examples

      iex> PrismaticSafety.KPI.Tracker.evaluate("p95_latency_ms")
      {:ok, :on_target}

      iex> PrismaticSafety.KPI.Tracker.evaluate("nonexistent")
      {:error, :not_found}
  """
  @spec evaluate(String.t()) :: {:ok, status()} | {:error, :not_found}
  def evaluate(name) do
    GenServer.call(__MODULE__, {:evaluate, name})
  end

  @doc """
  Returns the current value and metadata for a KPI.

  ## Examples

      iex> {:ok, kpi} = PrismaticSafety.KPI.Tracker.get("p95_latency_ms")
      iex> is_number(kpi.value)
      true
  """
  @spec get(String.t()) :: {:ok, kpi()} | {:error, :not_found}
  def get(name) do
    GenServer.call(__MODULE__, {:get, name})
  end

  @doc """
  Returns the trend (historical values) for a KPI within the given time window.

  ## Examples

      iex> {:ok, points} = PrismaticSafety.KPI.Tracker.trend("p95_latency_ms", hours: 24)
      iex> is_list(points)
      true
  """
  @spec trend(String.t(), keyword()) :: {:ok, list(trend_point())} | {:error, :not_found}
  def trend(name, window_opts \\ []) do
    GenServer.call(__MODULE__, {:trend, name, window_opts})
  end

  @doc """
  Returns a summary of all tracked KPIs with their current status.

  ## Examples

      iex> summary = PrismaticSafety.KPI.Tracker.summary()
      iex> is_list(summary)
      true
  """
  @spec summary() :: list(%{name: String.t(), status: status(), value: number(), target: number()})
  def summary do
    GenServer.call(__MODULE__, :summary)
  end

  # --- Server Callbacks ---

  @impl true
  def init(_opts) do
    {:ok,
     %{
       kpis: %{},
       history: %{},
       max_history_size: 1_000
     }}
  end

  @impl true
  def handle_cast({:record, name, value, opts}, state) do
    now = DateTime.utc_now()

    kpi = %{
      name: name,
      value: value,
      target: Keyword.get(opts, :target, 0),
      direction: Keyword.get(opts, :direction, :lower_is_better),
      category: Keyword.get(opts, :category, :operational),
      timestamp: now
    }

    :telemetry.execute(
      [:prismatic, :kpi, :recorded],
      %{value: value},
      %{name: name, category: kpi.category}
    )

    # Check for violation
    status = classify_kpi(kpi.value, kpi.target, kpi.direction)

    if status == :critical do
      Logger.warning("KPI violation: #{name} = #{value} (target: #{kpi.target})",
        domain: [:prismatic, :kpi]
      )

      :telemetry.execute(
        [:prismatic, :kpi, :violation],
        %{value: value, target: kpi.target},
        %{name: name}
      )
    end

    # Update history (bounded)
    history_entry = %{value: value, timestamp: now}
    history = Map.get(state.history, name, [])
    updated_history = Enum.take([history_entry | history], state.max_history_size)

    new_state = %{
      state
      | kpis: Map.put(state.kpis, name, kpi),
        history: Map.put(state.history, name, updated_history)
    }

    {:noreply, new_state}
  end

  @impl true
  def handle_call({:evaluate, name}, _from, state) do
    case Map.get(state.kpis, name) do
      nil ->
        {:reply, {:error, :not_found}, state}

      %{value: value, target: target, direction: direction} ->
        status = classify_kpi(value, target, direction)
        {:reply, {:ok, status}, state}
    end
  end

  @impl true
  def handle_call({:get, name}, _from, state) do
    case Map.get(state.kpis, name) do
      nil -> {:reply, {:error, :not_found}, state}
      kpi -> {:reply, {:ok, kpi}, state}
    end
  end

  @impl true
  def handle_call({:trend, name, window_opts}, _from, state) do
    case Map.get(state.history, name) do
      nil ->
        {:reply, {:error, :not_found}, state}

      history ->
        hours = Keyword.get(window_opts, :hours, 24)
        cutoff = DateTime.add(DateTime.utc_now(), -hours * 3600, :second)

        filtered =
          history
          |> Enum.filter(fn point -> DateTime.compare(point.timestamp, cutoff) == :gt end)
          |> Enum.reverse()

        {:reply, {:ok, filtered}, state}
    end
  end

  @impl true
  def handle_call(:summary, _from, state) do
    summary =
      state.kpis
      |> Enum.map(fn {name, kpi} ->
        %{
          name: name,
          status: classify_kpi(kpi.value, kpi.target, kpi.direction),
          value: kpi.value,
          target: kpi.target,
          category: kpi.category,
          last_updated: kpi.timestamp
        }
      end)
      |> Enum.sort_by(& &1.name)

    {:reply, summary, state}
  end

  # --- Private Helpers ---

  defp classify_kpi(value, target, :lower_is_better) do
    cond do
      value <= target -> :on_target
      value <= target * 1.2 -> :warning
      true -> :critical
    end
  end

  defp classify_kpi(value, target, :higher_is_better) do
    cond do
      value >= target -> :on_target
      value >= target * 0.8 -> :warning
      true -> :critical
    end
  end
end
```

```elixir
defmodule PrismaticSafety.KPI.HealthScoreComputer do
  @moduledoc """
  Computes the platform Health Score -- the master KPI that aggregates
  multiple quality dimensions into a single actionable number.

  The Health Score is always computed dynamically from current platform
  state. It is never hardcoded or cached for longer than a single
  computation cycle. This ensures the score always reflects reality.

  ## Scoring Formula

  The Health Score is a weighted average of domain scores:

  - Compilation health: 25% (zero warnings = 100, any warning = 0)
  - Test coverage: 25% (TACH compliance ratio * 100)
  - Doctrine compliance: 20% (passing pillars / total pillars * 100)
  - Documentation: 15% (@moduledoc/@doc presence ratio * 100)
  - Code quality: 15% (credo pass ratio * 100)

  ## Grade Scale

  - A: 90-100 (Excellent)
  - B: 80-89 (Good)
  - C: 70-79 (Acceptable)
  - D: 60-69 (Needs Improvement)
  - F: 0-59 (Critical)
  """

  @type score_breakdown :: %{
    overall: float(),
    grade: String.t(),
    compilation: float(),
    test_coverage: float(),
    doctrine_compliance: float(),
    documentation: float(),
    code_quality: float(),
    computed_at: DateTime.t()
  }

  @weights %{
    compilation: 0.25,
    test_coverage: 0.25,
    doctrine_compliance: 0.20,
    documentation: 0.15,
    code_quality: 0.15
  }

  @doc """
  Computes the current Health Score with full breakdown.

  This function always computes fresh values -- no caching.

  ## Examples

      iex> breakdown = PrismaticSafety.KPI.HealthScoreComputer.compute()
      iex> breakdown.overall >= 0.0 and breakdown.overall <= 100.0
      true
  """
  @spec compute() :: score_breakdown()
  def compute do
    scores = %{
      compilation: compute_compilation_score(),
      test_coverage: compute_test_coverage_score(),
      doctrine_compliance: compute_doctrine_score(),
      documentation: compute_documentation_score(),
      code_quality: compute_code_quality_score()
    }

    overall =
      Enum.reduce(@weights, 0.0, fn {domain, weight}, acc ->
        acc + Map.fetch!(scores, domain) * weight
      end)
      |> Float.round(1)

    Map.merge(scores, %{
      overall: overall,
      grade: grade_for(overall),
      computed_at: DateTime.utc_now()
    })
  end

  @doc """
  Returns the letter grade for a numeric score.

  ## Examples

      iex> PrismaticSafety.KPI.HealthScoreComputer.grade_for(92.5)
      "A"

      iex> PrismaticSafety.KPI.HealthScoreComputer.grade_for(73.0)
      "C"
  """
  @spec grade_for(float()) :: String.t()
  def grade_for(score) when is_number(score) do
    cond do
      score >= 90.0 -> "A"
      score >= 80.0 -> "B"
      score >= 70.0 -> "C"
      score >= 60.0 -> "D"
      true -> "F"
    end
  end

  # Domain score computation (simplified -- real implementation uses mix tasks)

  defp compute_compilation_score do
    # In production, this runs `mix compile --warnings-as-errors`
    # and returns 100.0 for zero warnings, 0.0 otherwise
    100.0
  end

  defp compute_test_coverage_score do
    # In production, this checks TACH compliance ratio
    85.0
  end

  defp compute_doctrine_score do
    # In production, this runs `mix check.doctrines`
    80.0
  end

  defp compute_documentation_score do
    # In production, this checks @moduledoc/@doc presence
    75.0
  end

  defp compute_code_quality_score do
    # In production, this runs credo analysis
    90.0
  end
end
```

```elixir
defmodule PrismaticSafety.KPI.TelemetryCollector do
  @moduledoc """
  Collects runtime KPIs from telemetry events and aggregates them
  into statistical summaries suitable for dashboard display and alerting.

  Attaches to Phoenix, Ecto, and custom telemetry events to compute
  P50/P95/P99 latency, error rates, and throughput KPIs.
  """

  require Logger

  @type percentiles :: %{p50: number(), p95: number(), p99: number()}

  @doc """
  Attaches telemetry handlers for KPI collection.

  Call this once during application startup.

  ## Examples

      iex> PrismaticSafety.KPI.TelemetryCollector.attach()
      :ok
  """
  @spec attach() :: :ok
  def attach do
    events = [
      [:phoenix, :endpoint, :stop],
      [:prismatic, :repo, :query],
      [:prismatic, :osint, :execution, :stop],
      [:prismatic, :dd, :pipeline, :stage, :stop]
    ]

    :telemetry.attach_many(
      "prismatic-kpi-collector",
      events,
      &handle_event/4,
      %{}
    )

    :ok
  end

  @doc """
  Computes percentiles from a list of numeric measurements.

  ## Examples

      iex> data = Enum.to_list(1..100)
      iex> PrismaticSafety.KPI.TelemetryCollector.percentiles(data)
      %{p50: 50, p95: 95, p99: 99}
  """
  @spec percentiles(list(number())) :: percentiles()
  def percentiles(values) when is_list(values) and values != [] do
    sorted = Enum.sort(values)
    count = length(sorted)

    %{
      p50: percentile_at(sorted, count, 0.50),
      p95: percentile_at(sorted, count, 0.95),
      p99: percentile_at(sorted, count, 0.99)
    }
  end

  def percentiles([]), do: %{p50: 0, p95: 0, p99: 0}

  defp percentile_at(sorted, count, percentile) do
    index = max(0, round(percentile * count) - 1)
    Enum.at(sorted, index)
  end

  defp handle_event([:phoenix, :endpoint, :stop], measurements, _metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)
    PrismaticSafety.KPI.Tracker.record("http_latency_ms", duration_ms,
      target: 250, direction: :lower_is_better, category: :performance)
  end

  defp handle_event([:prismatic, :repo, :query], measurements, _metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.total_time, :native, :millisecond)
    PrismaticSafety.KPI.Tracker.record("db_query_ms", duration_ms,
      target: 50, direction: :lower_is_better, category: :performance)
  end

  defp handle_event([:prismatic, :osint, :execution, :stop], measurements, metadata, _config) do
    duration_s = System.convert_time_unit(measurements.duration, :native, :second)
    PrismaticSafety.KPI.Tracker.record("osint_execution_s", duration_s,
      target: 30, direction: :lower_is_better, category: :operational)

    if metadata[:error] do
      PrismaticSafety.KPI.Tracker.record("osint_error_count", 1,
        target: 0, direction: :lower_is_better, category: :operational)
    end
  end

  defp handle_event([:prismatic, :dd, :pipeline, :stage, :stop], measurements, _metadata, _config) do
    duration_s = System.convert_time_unit(measurements.duration, :native, :second)
    PrismaticSafety.KPI.Tracker.record("dd_pipeline_stage_s", duration_s,
      target: 60, direction: :lower_is_better, category: :operational)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Tracking too many KPIs | Dashboard overload, decision paralysis, alert fatigue | Limit to 5-7 KPIs per domain; promote/demote quarterly |
| Hardcoding KPI values | Stale numbers that diverge from reality | Always compute KPIs dynamically (NCLB doctrine) |
| Averaging percentiles | P95 of P95s is not the true P95 | Aggregate from raw distributions, not pre-computed percentiles |
| Ignoring seasonality | Normal daily/weekly patterns trigger false alerts | Use time-aware baselines (weekday vs weekend, business hours vs off-hours) |
| Single-point alerting | One bad data point triggers investigation | Use consecutive-breach rules (3 of 5 readings above threshold) |
| KPI without target | A number without context drives no action | Every KPI must have an explicit target, direction, and threshold |
| Optimizing for the KPI, not the goal | Goodhart's Law: "When a measure becomes a target, it ceases to be a good measure" | Pair quantitative KPIs with qualitative review |
| Mixing leading and lagging without labeling | Teams react to lagging indicators instead of leading ones | Clearly label each KPI and train teams on which to act proactively |
| No KPI retirement process | Obsolete KPIs clutter dashboards and consume attention | Review KPI relevance quarterly; archive metrics that no longer drive decisions |
| Missing baseline period | Cannot distinguish signal from noise without historical data | Collect 2-4 weeks of baseline data before setting alert thresholds |

## Best Practices

1. **Define KPIs before building dashboards** -- the indicator must be derived from a clear objective. Start with the question "What decision will this number change?" and work backward to the metric.

2. **Include both leading and lagging indicators** for each domain. Leading indicators (code review coverage, doctrine violation count) enable proactive response; lagging indicators (incident count, MTTR) confirm effectiveness.

3. **Set thresholds based on statistical baselines**, not arbitrary round numbers. Collect baseline data for 2-4 weeks, then set warning at 2-sigma and critical at 3-sigma from the mean.

4. **Review KPI relevance quarterly** and retire metrics that no longer drive decisions. A KPI that has been "green" for 6 months with no variance should be demoted to a background metric.

5. **Automate KPI collection through telemetry** rather than manual reporting. Manual reporting introduces lag, inconsistency, and human error.

6. **Alert on trend changes** (three consecutive degradations) rather than single-point breaches to reduce false positives and alert fatigue.

7. **Store KPI history in time-series-optimized storage** (TimescaleDB) for long-term trend analysis. Implement retention policies that aggregate old data while preserving recent detail.

8. **Never hardcode KPI values in documentation or dashboards** -- the NCLB doctrine requires all claims to be dynamically validated against live data.

9. **Pair quantitative KPIs with qualitative assessment** -- Goodhart's Law warns that optimizing for a metric can distort the underlying goal. Regular human review prevents this.

10. **Make KPIs visible and actionable** -- a KPI buried in a log file drives no behavior. Surface KPIs in dashboards, pre-commit hooks, CI pipelines, and deployment gates where they directly influence decisions.

## Related Terms

- [Mean](/glossary/mean/) -- arithmetic average used in KPI calculations and trend analysis
- [Median](/glossary/median/) -- middle-value statistic resistant to outliers in KPI distributions
- [Percentile](/glossary/percentile/) -- statistical measure used in latency KPIs (P50, P95, P99)
- [P95](/glossary/p95/) -- 95th percentile latency, a critical operational KPI
- [P99](/glossary/p99/) -- 99th percentile latency for tail-end performance monitoring
- [Outlier](/glossary/outlier/) -- extreme values that can distort KPI averages
- [Quality Floor](/glossary/quality-floor/) -- minimum KPI threshold for quality metrics
- [Telemetry](/glossary/telemetry/) -- instrumentation system that feeds operational KPIs
- [Health Score](/glossary/health-score/) -- the master KPI aggregating all quality dimensions
- [SLA](/glossary/sla/) -- service level agreement that defines external KPI commitments
- [SLO](/glossary/slo/) -- service level objective that sets internal KPI targets
- [Dashboard](/glossary/dashboard/) -- visualization surface for KPI display and alerting

## See Also

- [Capabilities](/capabilities/) -- platform capabilities measured by KPIs
- [Architecture](/architecture/) -- telemetry architecture for KPI collection
- [Quality Floor Guardian](/quality/) -- automated KPI monitoring and enforcement
- [OTEL Doctrine](/observability/) -- observability enforcement ensuring KPI instrumentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
