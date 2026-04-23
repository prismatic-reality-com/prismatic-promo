+++
title = "Threshold"
weight = 50
[extra]
description = "Decision boundary value that triggers state transitions, alerts, or enforcement actions when a monitored metric crosses the defined limit"
category = "monitoring"
related_terms = ["monitoring", "alerting", "sla", "standard-deviation", "statistical-detection", "quality-gates", "confidence"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["threshold", "decision boundary", "alerting", "monitoring", "quality", "glossary", "Prismatic Platform"]
tags = ["glossary", "monitoring", "operations"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Threshold - Prismatic Platform"
+++

## Definition & Overview

A threshold is a predefined boundary value that, when crossed by a monitored metric, triggers a specific action -- an alert, a state transition, an enforcement block, or an automated response. Thresholds convert continuous measurements into discrete decisions: a response time of 249ms is "acceptable" while 251ms is "violation" when the threshold is 250ms. This binary decision-making is essential for automated systems that must act without human judgment at every decision point.

Thresholds operate across multiple domains. In monitoring, they trigger alerts when metrics exceed safe limits. In quality assurance, they block commits when code quality falls below required standards. In security, they escalate incidents when threat scores exceed acceptable risk. In the NABLA epistemic framework, confidence thresholds determine when a belief has sufficient evidence to transition from exploration to execution.

The Prismatic Platform is fundamentally threshold-driven. The page load performance standard (250ms), the quality score floor (100/100), the SLA targets (99.9% availability), the NABLA confidence levels (0.95 for critical decisions), and the pre-commit quality gates are all threshold-based enforcement mechanisms. Each threshold is explicitly defined, documented, and automatically enforced -- no subjective judgment, no exceptions, no "close enough" rationalizations.

## Technical Deep Dive

### Threshold Definition and Evaluation

The platform models thresholds as first-class configuration:

```elixir
defmodule PrismaticMonitoring.Threshold do
  @moduledoc """
  Defines and evaluates metric thresholds.
  Thresholds are the decision boundaries that trigger
  alerts, blocks, and automated responses.
  """

  @type operator :: :lt | :lte | :gt | :gte | :eq | :ne
  @type severity :: :info | :warning | :critical | :emergency

  @type t :: %__MODULE__{
    name: String.t(),
    metric: atom(),
    operator: operator(),
    value: number(),
    severity: severity(),
    action: atom(),
    description: String.t()
  }

  defstruct [:name, :metric, :operator, :value, :severity, :action, :description]

  @platform_thresholds [
    # Performance thresholds
    %__MODULE__{
      name: "page_load_time",
      metric: :page_load_ms,
      operator: :lt,
      value: 250,
      severity: :critical,
      action: :block_merge,
      description: "All pages must load under 250ms"
    },
    %__MODULE__{
      name: "server_render_time",
      metric: :server_render_ms,
      operator: :lt,
      value: 100,
      severity: :critical,
      action: :block_merge,
      description: "Server-side render under 100ms"
    },
    %__MODULE__{
      name: "liveview_mount_time",
      metric: :liveview_mount_ms,
      operator: :lt,
      value: 150,
      severity: :critical,
      action: :block_merge,
      description: "LiveView mount under 150ms"
    },

    # Quality thresholds
    %__MODULE__{
      name: "quality_score",
      metric: :quality_score,
      operator: :gte,
      value: 100,
      severity: :emergency,
      action: :block_commit,
      description: "Quality score must be 100/100"
    },
    %__MODULE__{
      name: "dialyzer_warnings",
      metric: :dialyzer_warning_count,
      operator: :eq,
      value: 0,
      severity: :critical,
      action: :block_commit,
      description: "Zero Dialyzer warnings"
    },

    # NABLA confidence thresholds
    %__MODULE__{
      name: "critical_decision_confidence",
      metric: :nabla_confidence,
      operator: :gte,
      value: 0.95,
      severity: :emergency,
      action: :block_execution,
      description: "Critical decisions require 0.95+ confidence"
    },
    %__MODULE__{
      name: "standard_operation_confidence",
      metric: :nabla_confidence,
      operator: :gte,
      value: 0.80,
      severity: :critical,
      action: :block_execution,
      description: "Standard operations require 0.80+ confidence"
    },

    # Security thresholds
    %__MODULE__{
      name: "security_rating_minimum",
      metric: :security_score,
      operator: :gte,
      value: 600,
      severity: :warning,
      action: :alert,
      description: "Security rating below 600 triggers investigation"
    }
  ]

  @spec platform_thresholds() :: [t()]
  def platform_thresholds, do: @platform_thresholds

  @spec evaluate(t(), number()) :: :ok | {:violation, t(), number()}
  def evaluate(%__MODULE__{operator: :lt, value: threshold} = t, actual) when actual >= threshold do
    {:violation, t, actual}
  end

  def evaluate(%__MODULE__{operator: :lte, value: threshold} = t, actual) when actual > threshold do
    {:violation, t, actual}
  end

  def evaluate(%__MODULE__{operator: :gt, value: threshold} = t, actual) when actual <= threshold do
    {:violation, t, actual}
  end

  def evaluate(%__MODULE__{operator: :gte, value: threshold} = t, actual) when actual < threshold do
    {:violation, t, actual}
  end

  def evaluate(%__MODULE__{operator: :eq, value: threshold} = t, actual) when actual != threshold do
    {:violation, t, actual}
  end

  def evaluate(%__MODULE__{operator: :ne, value: threshold} = t, actual) when actual == threshold do
    {:violation, t, actual}
  end

  def evaluate(_threshold, _actual), do: :ok
end
```

### Threshold-Driven Alerting

```elixir
defmodule PrismaticMonitoring.ThresholdEvaluator do
  @moduledoc """
  Evaluates all platform thresholds against current metrics
  and triggers appropriate actions for violations.
  """

  alias PrismaticMonitoring.Threshold

  @spec evaluate_all(map()) :: [map()]
  def evaluate_all(current_metrics) do
    Threshold.platform_thresholds()
    |> Enum.map(fn threshold ->
      actual = Map.get(current_metrics, threshold.metric)
      result = if actual, do: Threshold.evaluate(threshold, actual), else: :ok
      {threshold, result, actual}
    end)
    |> Enum.filter(fn {_, result, _} -> match?({:violation, _, _}, result) end)
    |> Enum.map(fn {threshold, {:violation, _, actual}, _} ->
      handle_violation(threshold, actual)
    end)
  end

  defp handle_violation(%{action: :block_commit} = threshold, actual) do
    %{
      threshold: threshold.name,
      severity: threshold.severity,
      expected: threshold.value,
      actual: actual,
      action: :blocked,
      message: "Commit blocked: #{threshold.description} (actual: #{actual})"
    }
  end

  defp handle_violation(%{action: :block_merge} = threshold, actual) do
    %{
      threshold: threshold.name,
      severity: threshold.severity,
      expected: threshold.value,
      actual: actual,
      action: :blocked,
      message: "Merge blocked: #{threshold.description} (actual: #{actual})"
    }
  end

  defp handle_violation(%{action: :alert} = threshold, actual) do
    %{
      threshold: threshold.name,
      severity: threshold.severity,
      expected: threshold.value,
      actual: actual,
      action: :alerted,
      message: "Alert: #{threshold.description} (actual: #{actual})"
    }
  end
end
```

### Adaptive Thresholds

For metrics with natural variability, the platform supports statistically-derived thresholds:

```elixir
defmodule PrismaticMonitoring.AdaptiveThreshold do
  @moduledoc """
  Computes thresholds dynamically from historical data
  using statistical methods (mean + N * sigma).
  """

  alias PrismaticMonitoring.Statistics

  @spec compute(Statistics.t(), float()) :: float()
  def compute(baseline_stats, sigma_multiplier \\ 3.0) do
    baseline_stats.mean + sigma_multiplier * Statistics.standard_deviation(baseline_stats)
  end

  @spec from_percentile(Statistics.t(), [number()], float()) :: float()
  def from_percentile(_stats, historical_values, percentile \\ 95.0) do
    sorted = Enum.sort(historical_values)
    index = ceil(length(sorted) * percentile / 100) - 1
    Enum.at(sorted, max(0, index))
  end
end
```

## Architecture & Implementation

Thresholds in the platform are classified by enforcement level. Hard thresholds (quality score, Dialyzer warnings) block operations immediately upon violation. Soft thresholds (security ratings) generate alerts that require human investigation. Adaptive thresholds (latency percentiles) compute their values from observed data, adjusting to natural system behavior while still detecting genuine anomalies.

The Quality Floor Guardian GenServer continuously evaluates quality thresholds. When the quality score drops from 100, the guardian escalates through four levels: OPTIMAL (monitor), WARNING (investigate), CRITICAL (auto-evolution), EMERGENCY (block commits). This graduated response ensures proportional action based on violation severity.

All threshold violations are logged with full context (metric name, expected value, actual value, timestamp, enforcement action) for audit and trend analysis. Historical violation data helps identify recurring issues and calibrate threshold values over time.

## Usage in Prismatic Platform

Thresholds govern every automated decision in the platform:

```elixir
# Evaluate all thresholds against current metrics
violations = PrismaticMonitoring.ThresholdEvaluator.evaluate_all(%{
  page_load_ms: 180,
  quality_score: 100,
  dialyzer_warning_count: 0,
  security_score: 780
})
# => [] (no violations)

# Compute adaptive threshold from baseline
adaptive = PrismaticMonitoring.AdaptiveThreshold.compute(baseline_stats, 3.0)
```

## Cross-References

- [SLA](@/glossary/sla.md) - Service agreements defined through threshold targets
- [Quality Gates](@/glossary/quality-gates.md) - Enforcement system using threshold evaluation
- [Standard Deviation](@/glossary/standard-deviation.md) - Statistical basis for adaptive thresholds
- [Monitoring](@/glossary/monitoring.md) - Infrastructure providing metrics for threshold evaluation

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
