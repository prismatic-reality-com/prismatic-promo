+++
title = "Quantitative Measure"
weight = 52
[extra]
tags = ["glossary", "core", "metrics", "measurement", "analytics", "telemetry", "data-driven"]
description = "Numerical, objective metrics used to evaluate software quality, system performance, and platform health with precision, enabling data-driven decision-making and continuous improvement in the Prismatic Platform"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["quality-monitoring", "quality-dna", "quality-gates", "telemetry", "code-coverage", "confidence-scoring", "test-coverage", "system-monitoring", "quality-measurement-system", "static-analysis"]
key_concepts = ["objective measurement", "metric taxonomy", "threshold enforcement", "trend analysis", "leading vs lagging indicators", "statistical significance"]
use_cases = ["quality gate evaluation", "performance benchmarking", "regression detection", "evolution fitness tracking", "compliance scoring"]
prerequisites = ["telemetry", "quality-gates"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
word_count = 1160
date_modified = "2026-02-23"
keywords = ["Quantitative", "Measure", "Numerical", "Prismatic", "Platform", "glossary", "core", "Prismatic Platform", "Gate", "Quality DNA"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quantitative Measure - Prismatic Platform"
+++

## Definition and Overview

A Quantitative Measure is a numerical, objective metric that captures a specific dimension of software quality, system performance, or platform health with sufficient precision to enable comparison, threshold enforcement, trend analysis, and data-driven decision-making. In the Prismatic Platform, quantitative measures form the empirical foundation upon which the entire quality architecture is built -- every quality gate evaluation, every DNA score, every evolution fitness calculation, and every trend prediction operates on quantitative measures rather than subjective assessments or qualitative judgments.

The distinction between quantitative and qualitative measures is foundational to the platform's quality philosophy. A qualitative assessment such as "the code looks clean" is subjective, non-reproducible, and non-automatable. A quantitative measure such as "zero credo violations across 141 applications" is objective, reproducible, and mechanically enforceable. The Prismatic Platform's commitment to quantitative measurement reflects the broader NO MERCY, NO DOUBTS doctrine: claims about quality must be backed by evidence, and evidence must be numerical, traceable, and verifiable.

Quantitative measures in the Prismatic Platform span multiple dimensions: correctness measures (type violations, test failures), style measures (credo violations, formatting deviations), performance measures (response times, throughput), coverage measures (test coverage, typespec coverage), and meta-measures (quality scores, fitness values, generation numbers). Each measure has a defined collection method, a documented threshold, a historical baseline, and an automated enforcement mechanism. Together, these measures provide a comprehensive numerical portrait of platform health that is updated in real time and persisted across development sessions through Quality DNA.

## Taxonomy of Quantitative Measures

### Measure Classification

The platform organizes quantitative measures into a structured taxonomy based on what they measure and how they are used:

| Category | Measures | Collection | Threshold | Usage |
|----------|----------|-----------|-----------|-------|
| **Correctness** | Dialyzer violations, test failures, compilation warnings | `mix dialyzer`, `mix test`, `mix compile` | 0 (zero tolerance) | Gate blocking |
| **Style** | Credo violations, formatting deviations | `mix credo --strict`, `mix format --check-formatted` | 0 (zero tolerance) | Gate blocking |
| **Performance** | Page load time, render time, mount time, event time | Benchee, telemetry | 250ms / 100ms / 150ms / 50ms | Gate blocking |
| **Coverage** | Test coverage %, typespec coverage %, @impl coverage | ExCoveralls, custom analyzers | 80% / context / 100% | Warning + tracking |
| **Complexity** | Cyclomatic complexity, function length, module size | Credo, custom analyzers | Context-dependent | Advisory |
| **Meta** | Quality score, fitness value, generation number | Quality DNA, SEADF | 100/100, 0.99+, Gen 19 | Evolution tracking |
| **Debt** | QDP count, TODO count, forbidden patterns | Custom scanners | 0 (eliminated) | Gate blocking |
| **Security** | CVE count, vulnerability score, OWASP compliance | Dependency audit, SAST | 0 critical, 0 high | Gate blocking |

### Measure Properties

Every quantitative measure in the platform has a formal definition with the following properties:

```elixir
defmodule Prismatic.Quality.Measure do
  @moduledoc """
  Formal definition of a quantitative quality measure.
  Every measure in the platform conforms to this schema.
  """

  @type direction :: :lower_is_better | :higher_is_better | :exact_match
  @type aggregation :: :sum | :average | :max | :min | :percentile

  @type t :: %__MODULE__{
    name: atom(),
    description: String.t(),
    unit: String.t(),
    direction: direction(),
    threshold: number(),
    collection_method: mfa(),
    aggregation: aggregation(),
    retention_days: pos_integer(),
    alert_on_breach: boolean(),
    gate_blocking: boolean()
  }

  defstruct [
    :name,
    :description,
    :unit,
    :direction,
    :threshold,
    :collection_method,
    :aggregation,
    retention_days: 90,
    alert_on_breach: true,
    gate_blocking: false
  ]

  @spec breached?(t(), number()) :: boolean()
  def breached?(%__MODULE__{direction: :lower_is_better} = measure, value) do
    value > measure.threshold
  end

  def breached?(%__MODULE__{direction: :higher_is_better} = measure, value) do
    value < measure.threshold
  end

  def breached?(%__MODULE__{direction: :exact_match} = measure, value) do
    value != measure.threshold
  end
end
```

## Core Platform Measures

### Quality Score (100-Point Scale)

The aggregate quality score is the platform's most visible quantitative measure. It combines all 13 quality domain scores into a single number:

```elixir
defmodule Prismatic.Quality.Score do
  @moduledoc """
  Computes the aggregate quality score from individual domain measurements.
  The 100-point scale provides a single-number health indicator.
  """

  @domains [
    {:dialyzer, 10.0},
    {:credo, 10.0},
    {:compilation, 10.0},
    {:datetime_precision, 5.0},
    {:guard_functions, 5.0},
    {:impl_coverage, 7.5},
    {:memory_safety, 10.0},
    {:performance, 10.0},
    {:regression_prevention, 7.5},
    {:timing_patterns, 5.0},
    {:todo_management, 2.5},
    {:typespec_coverage, 7.5},
    {:unsafe_map_access, 10.0}
  ]

  @spec calculate(map()) :: float()
  def calculate(domain_results) do
    @domains
    |> Enum.reduce(0.0, fn {domain, weight}, acc ->
      result = Map.get(domain_results, domain, %{violations: 0})
      domain_score = if result.violations == 0, do: weight, else: 0.0
      acc + domain_score
    end)
  end

  @spec domain_breakdown(map()) :: [%{domain: atom(), weight: float(), score: float(), status: atom()}]
  def domain_breakdown(domain_results) do
    @domains
    |> Enum.map(fn {domain, weight} ->
      result = Map.get(domain_results, domain, %{violations: 0})
      score = if result.violations == 0, do: weight, else: 0.0
      status = if result.violations == 0, do: :passing, else: :failing

      %{domain: domain, weight: weight, score: score, status: status}
    end)
  end
end
```

### Evolution Fitness (0.0 - 1.0)

The fitness value quantifies how well the platform meets its evolutionary objectives:

```elixir
defmodule Prismatic.Quality.Fitness do
  @moduledoc """
  Computes evolutionary fitness from quality measures.
  Fitness represents the platform's adaptation to quality requirements.
  Range: 0.0 (non-viable) to 1.0 (perfect adaptation).
  """

  @type fitness_components :: %{
    quality_score: float(),
    test_coverage: float(),
    compilation_health: float(),
    evolution_velocity: float(),
    debt_burden: float()
  }

  @spec calculate(fitness_components()) :: float()
  def calculate(components) do
    weights = %{
      quality_score: 0.30,
      test_coverage: 0.20,
      compilation_health: 0.20,
      evolution_velocity: 0.15,
      debt_burden: 0.15
    }

    components
    |> Enum.reduce(0.0, fn {component, value}, acc ->
      weight = Map.fetch!(weights, component)
      normalized = normalize(component, value)
      acc + weight * normalized
    end)
    |> Float.round(4)
  end

  defp normalize(:quality_score, value), do: value / 100.0
  defp normalize(:test_coverage, value), do: min(value / 100.0, 1.0)
  defp normalize(:compilation_health, value), do: if(value == 0, do: 1.0, else: 1.0 / (1.0 + value))
  defp normalize(:evolution_velocity, value), do: min(value / 10.0, 1.0)
  defp normalize(:debt_burden, value), do: 1.0 / (1.0 + value * 0.01)
end
```

### Performance Measures

Performance quantitative measures enforce strict latency budgets across the platform:

```elixir
defmodule Prismatic.Quality.Measure.Performance do
  @moduledoc """
  Performance-specific quantitative measures with hard latency thresholds.
  All measures are in milliseconds unless otherwise specified.
  """

  @measures %{
    page_load: %Prismatic.Quality.Measure{
      name: :page_load,
      description: "Total page load time (browser to rendered)",
      unit: "ms",
      direction: :lower_is_better,
      threshold: 250,
      collection_method: {Prismatic.Quality.Monitor.PerformanceCollector, :page_load, []},
      gate_blocking: true
    },
    server_render: %Prismatic.Quality.Measure{
      name: :server_render,
      description: "Server-side render time",
      unit: "ms",
      direction: :lower_is_better,
      threshold: 100,
      collection_method: {Prismatic.Quality.Monitor.PerformanceCollector, :server_render, []},
      gate_blocking: true
    },
    liveview_mount: %Prismatic.Quality.Measure{
      name: :liveview_mount,
      description: "LiveView mount callback duration",
      unit: "ms",
      direction: :lower_is_better,
      threshold: 150,
      collection_method: {Prismatic.Quality.Monitor.PerformanceCollector, :liveview_mount, []},
      gate_blocking: true
    },
    handle_event: %Prismatic.Quality.Measure{
      name: :handle_event,
      description: "LiveView handle_event callback duration",
      unit: "ms",
      direction: :lower_is_better,
      threshold: 50,
      collection_method: {Prismatic.Quality.Monitor.PerformanceCollector, :handle_event, []},
      gate_blocking: true
    },
    health_check: %Prismatic.Quality.Measure{
      name: :health_check,
      description: "Health endpoint response time",
      unit: "ms",
      direction: :lower_is_better,
      threshold: 10,
      collection_method: {Prismatic.Quality.Monitor.PerformanceCollector, :health_check, []},
      gate_blocking: true
    }
  }

  @spec all_measures() :: map()
  def all_measures, do: @measures

  @spec evaluate_all(map()) :: [{atom(), :pass | :fail, number()}]
  def evaluate_all(measurements) do
    @measures
    |> Enum.map(fn {name, measure} ->
      value = Map.get(measurements, name, 0)
      result = if Prismatic.Quality.Measure.breached?(measure, value), do: :fail, else: :pass
      {name, result, value}
    end)
  end
end
```

## Statistical Analysis of Measures

### Trend Detection

Quantitative measures become most valuable when analyzed over time. The trend detection engine applies statistical methods to measure histories to identify emerging patterns:

```elixir
defmodule Prismatic.Quality.Measure.Statistics do
  @moduledoc """
  Statistical analysis of quantitative measure histories.
  Provides trend detection, anomaly identification, and forecasting.
  """

  @type time_series :: [{DateTime.t(), number()}]

  @spec linear_trend(time_series()) :: {:improving | :stable | :degrading, float()}
  def linear_trend(series) when length(series) < 3, do: {:stable, 0.0}

  def linear_trend(series) do
    {slope, _intercept} = linear_regression(series)

    trend = cond do
      slope > 0.05 -> :improving
      slope < -0.05 -> :degrading
      true -> :stable
    end

    {trend, slope}
  end

  @spec moving_average(time_series(), pos_integer()) :: time_series()
  def moving_average(series, window) do
    series
    |> Enum.chunk_every(window, 1, :discard)
    |> Enum.map(fn chunk ->
      {timestamp, _} = List.last(chunk)
      avg = chunk |> Enum.map(&elem(&1, 1)) |> Enum.sum() |> Kernel./(length(chunk))
      {timestamp, avg}
    end)
  end

  @spec detect_anomalies(time_series(), float()) :: [map()]
  def detect_anomalies(series, sigma_threshold \\ 2.0) do
    values = Enum.map(series, &elem(&1, 1))
    mean = Enum.sum(values) / length(values)
    std_dev = standard_deviation(values, mean)

    series
    |> Enum.filter(fn {_ts, value} ->
      abs(value - mean) > sigma_threshold * std_dev
    end)
    |> Enum.map(fn {ts, value} ->
      %{
        timestamp: ts,
        value: value,
        deviation: (value - mean) / max(std_dev, 0.001),
        direction: if(value > mean, do: :above, else: :below)
      }
    end)
  end

  defp standard_deviation(values, mean) do
    variance =
      values
      |> Enum.map(fn v -> (v - mean) * (v - mean) end)
      |> Enum.sum()
      |> Kernel./(max(length(values) - 1, 1))

    :math.sqrt(variance)
  end
end
```

### Leading vs Lagging Indicators

Quantitative measures can be classified as leading or lagging indicators:

| Type | Measures | Value | Example |
|------|----------|-------|---------|
| **Leading** | Code complexity, TODO count, dependency age | Predict future issues | Rising complexity predicts future bugs |
| **Lagging** | Bug count, test failures, production incidents | Confirm past issues | Test failures confirm existing defects |
| **Coincident** | Compilation warnings, credo violations | Show current state | Warnings indicate present code quality |

Leading indicators are more valuable for preventive quality management because they signal problems before they manifest as defects. The evolution engine prioritizes leading indicators when recommending improvement actions.

## Integration with Platform Systems

### Quality DNA Persistence

Every quantitative measure collected during a session is persisted into [Quality DNA](/glossary/quality-dna/) records, creating the historical dataset that enables trend analysis and cross-session continuity. The DNA stores both current values and historical snapshots.

### Quality Gate Evaluation

[Quality Gates](/glossary/quality-gates/) consume quantitative measures to make binary pass/fail decisions. Each gate defines which measures it evaluates and what thresholds must be met. Gate evaluation is fully deterministic -- given the same measure values, the gate always produces the same result.

### NABLA Infinity Confidence Scoring

The [confidence scoring](/glossary/confidence-scoring/) system within the NABLA infinity framework uses quantitative measures as evidence for belief strength. Higher-quality measures (more data points, lower variance, independent sources) produce higher confidence scores.

### Trinity Gate Verification

The [Trinity Gate](/glossary/trinity-gate/) uses quantitative measures as inputs to its three verification passes: structural consistency (measures form a valid DAG), logical consistency (measure values follow logical rules), and formal necessity (measures satisfy formal proofs).

## Usage in Prismatic Platform

### Commands and Workflows

```bash
# Collect all quantitative measures
mix quality.gates

# JSON output for machine consumption
mix quality.gates --format json

# Specific domain measures
mix credo --strict                    # Style measures
mix dialyzer                           # Type correctness measures
mix test --cover                       # Coverage measures
mix quality.forbidden_patterns --count-only  # Debt measures

# Performance measures
mix performance.check

# Evolution fitness
mix autoevolve status --brief

# Full measure collection with DNA update
mix autoheal.baseline
```

### Defining Custom Measures

Applications can define domain-specific quantitative measures:

```elixir
defmodule MyApp.Quality.CustomMeasures do
  @moduledoc """
  Custom quantitative measures for application-specific quality tracking.
  """

  @spec define_measures() :: [Prismatic.Quality.Measure.t()]
  def define_measures do
    [
      %Prismatic.Quality.Measure{
        name: :api_endpoint_coverage,
        description: "Percentage of API endpoints with OpenAPI documentation",
        unit: "%",
        direction: :higher_is_better,
        threshold: 100.0,
        collection_method: {__MODULE__, :measure_api_coverage, []},
        gate_blocking: true
      },
      %Prismatic.Quality.Measure{
        name: :adapter_contract_compliance,
        description: "Percentage of storage adapters passing contract tests",
        unit: "%",
        direction: :higher_is_better,
        threshold: 100.0,
        collection_method: {__MODULE__, :measure_adapter_compliance, []},
        gate_blocking: true
      }
    ]
  end
end
```

## Best Practices

1. **Measure what matters, not what is easy to measure**. Some critical quality dimensions (architectural coherence, developer experience, code readability) resist easy quantification. Use proxy measures thoughtfully and supplement with qualitative assessment where necessary.

2. **Set thresholds based on evidence, not aspiration**. Thresholds should reflect achievable standards backed by historical data. Unrealistic thresholds cause alert fatigue and encourage workarounds.

3. **Track trends, not just snapshots**. A measure value of 95% is meaningless without context. Is it improving from 90%? Degrading from 100%? Volatile between 80% and 100%? Trend data provides the context that point-in-time values lack.

4. **Distinguish leading from lagging indicators**. Invest in leading indicators that predict problems before they occur rather than lagging indicators that confirm problems after they manifest.

5. **Automate collection and evaluation**. Manual measure collection introduces inconsistency and delays. Every quantitative measure should be collected automatically by instrumented tooling.

6. **Preserve measure history**. Historical measure data is a strategic asset. Define retention policies that balance storage costs with analytical value, and never discard historical data without explicit justification.

## Common Pitfalls

- **Goodhart's Law**: When a measure becomes a target, it ceases to be a good measure. Teams optimize for the metric rather than the underlying quality dimension. Mitigate by using diverse, cross-cutting measures that resist narrow optimization.

- **False precision**: Reporting quality scores to four decimal places creates an illusion of precision that the underlying measurements do not support. Report measures at appropriate precision levels.

- **Measure inflation**: Adding new measures without retiring obsolete ones creates dashboard clutter and dilutes attention. Regularly review the measure portfolio and retire measures that no longer provide actionable information.

- **Ignoring measurement error**: All measures have error margins. Treating borderline values as definitive (99.9% vs 100.0%) without considering measurement uncertainty leads to false conclusions and unnecessary alarm.

- **Confusing correlation with causation**: Two measures trending together does not mean one causes the other. Use experimental methods (A/B testing, controlled changes) to establish causal relationships when needed.

## Related Concepts

- [Quality Monitoring](/glossary/quality-monitoring/) -- System that collects quantitative measures
- [Quality DNA](/glossary/quality-dna/) -- Persistence layer for measure history
- [Quality Gates](/glossary/quality-gates/) -- Decision points consuming measures
- [Telemetry](/glossary/telemetry/) -- Infrastructure for measure collection
- [Code Coverage](/glossary/code-coverage/) -- Specific coverage measure
- [Test Coverage](/glossary/test-coverage/) -- Test extent measurement
- [Confidence Scoring](/glossary/confidence-scoring/) -- Epistemic confidence quantification
- [Static Analysis](/glossary/static-analysis/) -- Source of correctness measures
- [Quality Measurement System](/glossary/quality-measurement-system/) -- The broader measurement framework
- [System Monitoring](/glossary/system-monitoring/) -- Production-level measure collection

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory with measure integration

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
