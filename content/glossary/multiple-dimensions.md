+++
title = "Multiple Dimensions"
weight = 50
[extra]
description = "Multi-dimensional analysis and data modeling across orthogonal axes of concern in complex software platforms, enabling holistic system understanding through concurrent evaluation of security, performance, quality, compliance, and behavioral dimensions"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
abbreviation = "MD"
related_terms = ["observability", "telemetry", "analytics", "knowledge-graph", "graph-database", "architecture", "quality-measurement-system", "monitoring", "metrics", "system-analysis"]
keywords = ["multi-dimensional analysis", "dimensional modeling software", "orthogonal concerns architecture", "multi-axis evaluation", "holistic system analysis", "dimensional decomposition", "cross-cutting concerns", "multi-dimensional data modeling", "platform dimensionality", "OLAP dimensional analysis"]
tags = ["architecture", "analysis", "data-modeling", "observability", "quality"]
date_created = "2026-02-22"
use_cases = ["security posture assessment", "quality scoring", "performance profiling", "compliance evaluation", "risk analysis", "system health monitoring"]
technologies = ["Elixir", "ETS", "PostgreSQL", "KuzuDB", "Telemetry"]
word_count = 1898
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Multiple Dimensions - Prismatic Platform"
+++

## Definition

Multiple Dimensions refers to the practice of analyzing, modeling, and evaluating complex software systems across several orthogonal axes of concern simultaneously. Rather than reducing system state to a single scalar metric or examining one property in isolation, multi-dimensional analysis maintains distinct measurement planes -- security, performance, quality, compliance, behavioral, temporal, and structural -- and reasons about their intersections, correlations, and tensions. In the context of the Prismatic Platform, multiple dimensions is a foundational architectural principle that governs how agents, quality gates, and intelligence pipelines produce holistic assessments of system health, code quality, threat posture, and operational fitness.

The concept draws from dimensional analysis in physics and mathematics, where understanding a phenomenon requires simultaneous measurement along independent axes. In software engineering, the analogous insight is that no single metric captures the full state of a system. Code coverage tells you nothing about performance. Security scores ignore maintainability. Latency measurements are silent about compliance. A multi-dimensional approach treats these concerns as independent but correlated dimensions that must be evaluated together to produce actionable intelligence.

## Overview

The evolution of software quality assessment has moved through several paradigms. Early approaches relied on single metrics: lines of code, cyclomatic complexity, or defect counts. The limitations of these one-dimensional views became apparent as systems grew in complexity. A module with perfect test coverage could still harbor security vulnerabilities. A service with excellent latency could be accumulating technical debt at an unsustainable rate.

Dimensional modeling originated in data warehousing with Ralph Kimball's work on star and snowflake schemas, where facts are measured along multiple independent dimensions (time, geography, product, customer). The Prismatic Platform adapts this concept to software system analysis. Instead of business facts measured along business dimensions, the platform measures system properties along engineering dimensions.

The key insight is that dimensions are orthogonal but not independent. A change that improves performance (Dimension A) might degrade security (Dimension B) or increase complexity (Dimension C). Understanding these trade-offs requires maintaining all dimensions simultaneously and analyzing their correlations. This is fundamentally different from the common approach of optimizing one dimension at a time and hoping the others remain stable.

In modern platform engineering, multiple dimensions manifest in several concrete patterns: multi-axis quality scoring (the Prismatic quality system evaluates 13 distinct quality domains), multi-signal intelligence analysis (OSINT pipelines correlate signals across source types), multi-criteria decision making (agent orchestration weighs multiple objectives), and multi-layer security assessment (the Perimeter system rates security across network, application, certificate, and compliance dimensions).

## Technical Details

### Dimensional Decomposition Architecture

The Prismatic Platform implements multi-dimensional analysis through a decomposition pattern where each dimension has its own evaluation pipeline, scoring function, and storage layer, with a composition layer that merges results into unified assessments.

```elixir
defmodule Prismatic.Dimensions.Analyzer do
  @moduledoc """
  Multi-dimensional system analyzer that evaluates across orthogonal
  axes and produces composite assessments with per-dimension detail.
  """

  @type dimension :: :security | :performance | :quality | :compliance |
                     :behavioral | :temporal | :structural

  @type dimension_result :: %{
    dimension: dimension(),
    score: float(),
    confidence: float(),
    evidence: [map()],
    timestamp: DateTime.t()
  }

  @type composite_assessment :: %{
    overall_score: float(),
    dimensions: %{dimension() => dimension_result()},
    correlations: [{dimension(), dimension(), float()}],
    tensions: [{dimension(), dimension(), String.t()}],
    recommendation: String.t()
  }

  @dimensions [
    :security, :performance, :quality,
    :compliance, :behavioral, :temporal, :structural
  ]

  @spec analyze(target :: term(), opts :: keyword()) ::
          {:ok, composite_assessment()} | {:error, term()}
  def analyze(target, opts \\ []) do
    dimensions = Keyword.get(opts, :dimensions, @dimensions)
    timeout = Keyword.get(opts, :timeout, 30_000)

    dimension_results =
      dimensions
      |> Task.async_stream(
        fn dim -> {dim, evaluate_dimension(target, dim)} end,
        max_concurrency: length(dimensions),
        timeout: timeout
      )
      |> Enum.reduce(%{}, fn
        {:ok, {dim, {:ok, result}}}, acc -> Map.put(acc, dim, result)
        {:ok, {dim, {:error, reason}}}, acc ->
          Map.put(acc, dim, %{dimension: dim, score: 0.0, confidence: 0.0,
                               evidence: [%{error: reason}], timestamp: DateTime.utc_now()})
        {:exit, _reason}, acc -> acc
      end)

    correlations = compute_correlations(dimension_results)
    tensions = detect_tensions(dimension_results)
    overall = compute_overall_score(dimension_results)

    {:ok, %{
      overall_score: overall,
      dimensions: dimension_results,
      correlations: correlations,
      tensions: tensions,
      recommendation: generate_recommendation(dimension_results, tensions)
    }}
  end

  defp evaluate_dimension(target, :security) do
    Prismatic.Dimensions.Security.evaluate(target)
  end

  defp evaluate_dimension(target, :performance) do
    Prismatic.Dimensions.Performance.evaluate(target)
  end

  defp evaluate_dimension(target, :quality) do
    Prismatic.Dimensions.Quality.evaluate(target)
  end

  defp evaluate_dimension(target, dimension) do
    Prismatic.Dimensions.Generic.evaluate(target, dimension)
  end

  defp compute_correlations(results) do
    dimensions = Map.keys(results)

    for d1 <- dimensions, d2 <- dimensions, d1 < d2 do
      correlation = pearson_correlation(
        extract_score_history(d1),
        extract_score_history(d2)
      )
      {d1, d2, correlation}
    end
  end

  defp detect_tensions(results) do
    results
    |> Enum.flat_map(fn {dim, result} ->
      results
      |> Enum.filter(fn {other_dim, other_result} ->
        other_dim != dim and
        abs(result.score - other_result.score) > 0.3 and
        result.confidence > 0.7 and
        other_result.confidence > 0.7
      end)
      |> Enum.map(fn {other_dim, _} ->
        {dim, other_dim,
         "Significant divergence detected between #{dim} and #{other_dim}"}
      end)
    end)
    |> Enum.uniq()
  end

  defp compute_overall_score(results) do
    {weighted_sum, weight_total} =
      results
      |> Enum.reduce({0.0, 0.0}, fn {_dim, result}, {sum, total} ->
        weight = result.confidence
        {sum + result.score * weight, total + weight}
      end)

    if weight_total > 0, do: weighted_sum / weight_total, else: 0.0
  end

  defp pearson_correlation(_history_a, _history_b), do: 0.0
  defp extract_score_history(_dimension), do: []
  defp generate_recommendation(_results, _tensions), do: "No specific recommendation"
end
```

### Dimension Storage with ETS

Multi-dimensional results require efficient storage that supports fast lookups along any single dimension as well as cross-dimensional queries.

```elixir
defmodule Prismatic.Dimensions.Store do
  @moduledoc """
  ETS-backed dimensional data store with multi-axis indexing.
  Supports efficient queries along any single dimension or
  cross-dimensional correlation lookups.
  """

  use GenServer

  @table_name :dimension_store
  @index_prefix :dim_idx_

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table_name, [
      :set, :public, :named_table, read_concurrency: true
    ])

    dimension_indexes =
      [:security, :performance, :quality, :compliance, :behavioral]
      |> Enum.map(fn dim ->
        index_name = :"#{@index_prefix}#{dim}"
        :ets.new(index_name, [
          :ordered_set, :public, :named_table, read_concurrency: true
        ])
        {dim, index_name}
      end)
      |> Map.new()

    {:ok, %{table: table, indexes: dimension_indexes}}
  end

  @spec store_assessment(String.t(), map()) :: :ok
  def store_assessment(target_id, assessment) do
    GenServer.call(__MODULE__, {:store, target_id, assessment})
  end

  @spec query_dimension(atom(), float(), float()) :: [map()]
  def query_dimension(dimension, min_score, max_score) do
    index_name = :"#{@index_prefix}#{dimension}"

    :ets.select(index_name, [
      {{{:"$1", :"$2"}, :"$3"},
       [{:>=, :"$1", min_score}, {:"=<", :"$1", max_score}],
       [:"$3"]}
    ])
  end

  @impl true
  def handle_call({:store, target_id, assessment}, _from, state) do
    :ets.insert(@table_name, {target_id, assessment, DateTime.utc_now()})

    Enum.each(assessment.dimensions, fn {dim, result} ->
      case Map.get(state.indexes, dim) do
        nil -> :ok
        index_name ->
          :ets.insert(index_name, {{result.score, target_id}, assessment})
      end
    end)

    {:reply, :ok, state}
  end
end
```

### Time-Series Dimensional Tracking

Dimensions evolve over time. Tracking this evolution enables trend analysis, anomaly detection, and predictive modeling.

```elixir
defmodule Prismatic.Dimensions.TimeSeries do
  @moduledoc """
  Tracks dimensional scores over time, enabling trend analysis
  and drift detection across measurement axes.
  """

  @type trend :: :improving | :stable | :degrading | :volatile

  @spec track(String.t(), atom(), float(), DateTime.t()) :: :ok
  def track(target_id, dimension, score, timestamp \\ DateTime.utc_now()) do
    key = {target_id, dimension}
    entry = {timestamp, score}

    case :ets.lookup(:dimension_timeseries, key) do
      [{^key, history}] ->
        updated = [entry | history] |> Enum.take(1000)
        :ets.insert(:dimension_timeseries, {key, updated})

      [] ->
        :ets.insert(:dimension_timeseries, {key, [entry]})
    end

    :ok
  end

  @spec trend(String.t(), atom(), pos_integer()) ::
          {:ok, trend()} | {:error, :insufficient_data}
  def trend(target_id, dimension, window_size \\ 10) do
    key = {target_id, dimension}

    case :ets.lookup(:dimension_timeseries, key) do
      [{^key, history}] when length(history) >= window_size ->
        recent = Enum.take(history, window_size)
        scores = Enum.map(recent, &elem(&1, 1))
        slope = linear_regression_slope(scores)
        variance = compute_variance(scores)

        trend = cond do
          variance > 0.1 -> :volatile
          slope > 0.01 -> :improving
          slope < -0.01 -> :degrading
          true -> :stable
        end

        {:ok, trend}

      _ ->
        {:error, :insufficient_data}
    end
  end

  defp linear_regression_slope(scores) do
    n = length(scores)
    xs = Enum.to_list(0..(n - 1))
    x_mean = Enum.sum(xs) / n
    y_mean = Enum.sum(scores) / n

    numerator =
      Enum.zip(xs, scores)
      |> Enum.reduce(0.0, fn {x, y}, acc ->
        acc + (x - x_mean) * (y - y_mean)
      end)

    denominator =
      Enum.reduce(xs, 0.0, fn x, acc ->
        acc + (x - x_mean) * (x - x_mean)
      end)

    if denominator > 0, do: numerator / denominator, else: 0.0
  end

  defp compute_variance(scores) do
    n = length(scores)
    mean = Enum.sum(scores) / n

    Enum.reduce(scores, 0.0, fn s, acc ->
      acc + (s - mean) * (s - mean)
    end) / n
  end
end
```

## Implementation in the Prismatic Platform

The Prismatic Platform operationalizes multi-dimensional analysis at several architectural layers.

### Quality Domain System

The quality measurement system evaluates code across 13 independent dimensions, each with its own detection pipeline, scoring function, and remediation guidance. These dimensions include Dialyzer compliance, Credo violations, compilation warnings, DateTime precision, guard function usage, @impl coverage, memory safety, performance patterns, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access. The overall quality score is a weighted composite of all 13 dimensions, but each dimension retains its individual score and trend. This allows precise diagnosis: a drop in overall quality can be traced to the specific dimension(s) responsible.

### OSINT Intelligence Fusion

The OSINT subsystem collects intelligence across multiple source dimensions -- domain intelligence, certificate transparency, network scanning, registry data, social profiles, and financial filings. Each source dimension has different reliability characteristics, update frequencies, and coverage gaps. The intelligence fusion layer correlates findings across dimensions to produce high-confidence assessments. A domain flagged as suspicious in DNS records gains additional weight if certificate transparency logs show recently issued certificates for similar domains, and further weight if registry data shows the same beneficial owner across a network of flagged entities.

### Security Rating System

The Prismatic Perimeter EASM system rates external attack surfaces across multiple security dimensions: network exposure, application security, certificate hygiene, DNS configuration, email authentication (SPF/DKIM/DMARC), and compliance posture. The composite security rating (A-F, 300-900 numeric) is derived from all dimensions, but the per-dimension breakdown enables actionable remediation priorities. An organization might have excellent network security (A) but poor email authentication (D), producing an overall B rating that masks the specific vulnerability.

### Agent Fitness Evaluation

The 530+ AIAD agents are evaluated across behavioral dimensions: task completion rate, response quality, resource consumption, error rate, and adaptation speed. Multi-dimensional fitness scores drive the evolutionary selection process that governs agent promotion, demotion, and retirement across generations.

## Comparison with Alternative Approaches

### Single-Metric Reduction

The simplest alternative is reducing system state to a single number: an overall health score, a single quality grade, or a pass/fail gate. This approach is easy to communicate and compare but loses critical information. When a system scores 85/100, there is no way to determine whether it excels at security but fails at performance, or vice versa. Single-metric reduction is appropriate only for high-level executive dashboards where the audience needs a quick signal, not diagnostic detail.

### Weighted Scorecards

Weighted scorecards maintain multiple metrics but combine them through fixed weights into a single composite score. This preserves some dimensional information but introduces the problem of weight selection: who decides that security is worth 30% and performance 20%? Weight choices embed assumptions that may not hold across all contexts. The Prismatic approach uses confidence-weighted composition where the weight of each dimension is proportional to the confidence of its measurement, rather than fixed a priori weights.

### Radar and Spider Charts

Radar charts visualize multiple dimensions simultaneously but treat all axes as independent. The Prismatic approach goes further by computing correlations and detecting tensions between dimensions, surfacing trade-offs that radar charts leave implicit. When two dimensions are in tension (improving one necessarily degrades the other), this is a critical insight that static visualization cannot convey.

### OLAP Cubes

Online Analytical Processing (OLAP) cubes from data warehousing provide sophisticated multi-dimensional analysis but are designed for business metrics, not software system properties. The Prismatic dimensional analysis system borrows concepts from OLAP (slicing, dicing, drill-down, roll-up) but adapts them for engineering contexts where dimensions are measured by automated pipelines rather than business transactions.

## Best Practices

**Define dimensions explicitly.** Every dimension should have a clear definition, measurement method, scoring range, and confidence calculation. Ambiguous dimensions produce unreliable composite assessments.

**Preserve dimensional independence.** Dimensions should measure genuinely orthogonal concerns. If two dimensions are highly correlated (r > 0.9), consider whether they are truly independent or whether one should be absorbed into the other.

**Track dimensions over time.** Point-in-time dimensional snapshots are useful but trend analysis is more valuable. A dimension that scores 70 and is improving rapidly is in better shape than one that scores 80 and is degrading.

**Surface tensions explicitly.** When improving one dimension necessarily degrades another, this tension should be surfaced to decision-makers rather than hidden in a composite score. Architectural decisions often involve explicit trade-offs between dimensions.

**Use confidence-weighted composition.** When combining dimensions into overall scores, weight by measurement confidence rather than fixed weights. A dimension with high confidence should influence the composite more than one with low confidence.

**Provide drill-down capability.** Every composite score should be decomposable into its constituent dimensions, and each dimension should be decomposable into its constituent evidence. This enables root-cause analysis when scores change.

**Avoid dimension proliferation.** Adding dimensions has a cost: each requires a measurement pipeline, storage, and analysis logic. The marginal value of the 20th dimension is much lower than the 5th. Focus on dimensions that capture genuinely independent and actionable information.

## Common Pitfalls

**Dimension collapse.** Under pressure, teams often collapse multi-dimensional analysis back to a single number ("just tell me if it is good or bad"). This defeats the purpose of multi-dimensional analysis and should be resisted.

**Weight gaming.** When composite scores determine outcomes (merge approval, deployment gates), teams may lobby for weight changes that favor their area rather than improving their dimensional score. Fixed, transparent weight policies prevent this.

**Correlation confusion.** Two dimensions that are correlated in measurement are not necessarily causally related. High security scores may correlate with high quality scores not because security causes quality, but because teams that invest in security also tend to invest in quality.

**Dimension drift.** Over time, the meaning of a dimension can shift as measurement methods evolve, making historical comparisons invalid. Versioning dimension definitions and scoring functions prevents silent drift.

**False precision.** Reporting dimensional scores to three decimal places suggests measurement precision that rarely exists. Appropriate rounding and confidence intervals communicate uncertainty honestly.

**Missing dimensions.** The most dangerous failure is not measuring a critical dimension at all. Regular dimension audits should ask: what aspects of system health are we not measuring? The Prismatic quality system was expanded from 8 to 13 dimensions over several generations as gaps were identified.

## Use Cases

**Platform quality assessment.** The Prismatic quality system evaluates all 115 umbrella apps across 13 dimensions, producing per-app dimensional profiles that drive remediation priorities. Apps with strong quality scores but weak performance scores receive different guidance than apps with the opposite profile.

**Due diligence analysis.** The OSINT-powered due diligence pipeline evaluates entities across financial, legal, reputational, and network dimensions. A company with strong financials but concerning beneficial ownership structures shows a characteristic dimensional pattern that would be invisible in a single-score assessment.

**Security posture monitoring.** The Perimeter EASM system continuously monitors attack surfaces across network, application, certificate, DNS, and compliance dimensions. Dimensional trend analysis detects slow degradation in specific areas before the composite score drops below threshold.

**Agent evolution.** Multi-dimensional fitness evaluation of AIAD agents enables nuanced evolutionary selection. An agent that excels at accuracy but consumes excessive resources occupies a different niche than one that is fast but less precise. The evolutionary process can maintain both if the platform benefits from specialized agents.

**Compliance mapping.** Regulatory frameworks (NIS2, GDPR, SOC2) map naturally to dimensional analysis where each compliance domain is a dimension. Gap analysis identifies which compliance dimensions need attention, and cross-dimensional correlation reveals areas where a single improvement addresses multiple compliance requirements simultaneously.

## Related Concepts

Multi-dimensional analysis intersects with several foundational concepts in the Prismatic Platform ecosystem:

- [Observability](@/glossary/observability.md) -- the practice of making system behavior visible, which provides the raw signals that dimensional analysis consumes
- [Telemetry](@/glossary/telemetry.md) -- the instrumentation layer that collects dimensional measurements from running systems
- [Analytics](@/glossary/analytics.md) -- the broader discipline of deriving insights from data, of which dimensional analysis is a specialized technique
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- graph-based knowledge representation that naturally supports multi-dimensional relationships between entities
- [Quality Measurement System](@/glossary/quality-measurement-system.md) -- the concrete implementation of multi-dimensional quality scoring in the Prismatic Platform
- [Monitoring](@/glossary/monitoring.md) -- continuous observation of system metrics, providing the time-series data that powers dimensional trend analysis
- [Metrics](@/glossary/metrics.md) -- the quantitative measurements that form the building blocks of dimensional scores
- [System Analysis](@/glossary/system-analysis.md) -- the discipline of understanding system behavior through structured investigation
- [Graph Database](@/glossary/graph-database.md) -- storage technology suited for multi-dimensional relationship queries (KuzuDB in the Prismatic Platform)
- [Architecture](@/glossary/architecture.md) -- the structural decisions that define which dimensions are relevant and how they interact

## See Also

- [Quality Gates](@/glossary/quality-gates.md) -- multi-dimensional quality enforcement at commit and merge boundaries
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- quantifying measurement certainty within individual dimensions
- [EASM](@/glossary/easm.md) -- External Attack Surface Management with multi-dimensional security ratings
- [Quality DNA](@/glossary/quality-dna.md) -- cross-session quality continuity that tracks dimensional evolution
- [Distributed Tracing](@/glossary/distributed-tracing.md) -- request-level observability across service dimensions

---

**Connect and Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Open Source under [GHL License](https://github.com/korczis/prismatic-platform/blob/main/LICENSE) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
