+++
title = "Statistical Detection"
weight = 50
[extra]
description = "Anomaly and threat identification using statistical methods including z-scores, distribution analysis, and time-series decomposition"
category = "security"
related_terms = ["standard-deviation", "statistics", "anomaly-detection", "monitoring", "threshold", "telemetry", "drift"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["statistical detection", "anomaly detection", "z-score", "security", "monitoring", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "statistics"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Statistical Detection - Prismatic Platform"
+++

## Definition & Overview

Statistical detection is the practice of identifying anomalies, threats, or significant changes in system behavior by applying statistical methods to observed data. Rather than relying on static rules or signature-based matching, statistical detection learns the normal behavior of a system from historical data and flags deviations that exceed statistical thresholds. This approach detects novel threats that signature-based systems miss, adapts to changing baselines automatically, and reduces false positives by accounting for natural variability.

The core methods of statistical detection include z-score analysis (comparing individual values to the population mean in units of standard deviation), distribution fitting (determining whether observed data follows an expected probability distribution), time-series decomposition (separating trend, seasonality, and residual components), and change-point detection (identifying moments when the underlying data-generating process shifts).

In the Prismatic Platform, statistical detection operates across security monitoring, performance analysis, and quality assurance. The Blue Team drift detector uses statistical methods to identify behavioral anomalies in system operation. The performance monitoring system uses z-scores to detect latency regressions. The quality floor guardian uses distribution analysis to ensure that code quality metrics do not regress below established baselines.

## Technical Deep Dive

### Multi-Method Detection Engine

The platform implements a detection engine that combines multiple statistical methods for robust anomaly identification:

```elixir
defmodule PrismaticSecurity.StatisticalDetector do
  @moduledoc """
  Multi-method statistical anomaly detection engine.
  Combines z-score, MAD (Median Absolute Deviation),
  and EWMA (Exponentially Weighted Moving Average)
  for robust detection across different data distributions.
  """

  alias PrismaticMonitoring.Statistics

  @type detection_result :: %{
    method: atom(),
    is_anomaly: boolean(),
    score: float(),
    threshold: float(),
    confidence: float()
  }

  @spec detect(Statistics.t(), number(), keyword()) :: [detection_result()]
  def detect(baseline_stats, current_value, opts \\ []) do
    methods = Keyword.get(opts, :methods, [:z_score, :mad, :ewma])
    sigma = Keyword.get(opts, :sigma_threshold, 3.0)

    Enum.map(methods, fn method ->
      detect_with_method(method, baseline_stats, current_value, sigma)
    end)
  end

  @spec consensus_anomaly?([detection_result()], float()) :: boolean()
  def consensus_anomaly?(results, min_agreement \\ 0.5) do
    anomaly_count = Enum.count(results, & &1.is_anomaly)
    anomaly_count / length(results) >= min_agreement
  end

  defp detect_with_method(:z_score, stats, value, threshold) do
    z = Statistics.z_score(stats, value)
    %{
      method: :z_score,
      is_anomaly: abs(z) > threshold,
      score: abs(z),
      threshold: threshold,
      confidence: min(1.0, abs(z) / (threshold * 2))
    }
  end

  defp detect_with_method(:mad, stats, value, threshold) do
    # Median Absolute Deviation - more robust to outliers than z-score
    median = stats.mean  # approximation for streaming data
    mad = Statistics.standard_deviation(stats) * 0.6745  # MAD approximation
    modified_z = if mad == 0, do: 0.0, else: abs(value - median) / mad

    %{
      method: :mad,
      is_anomaly: modified_z > threshold,
      score: modified_z,
      threshold: threshold,
      confidence: min(1.0, modified_z / (threshold * 2))
    }
  end

  defp detect_with_method(:ewma, stats, value, threshold) do
    # EWMA is more sensitive to recent changes
    alpha = 0.3
    ewma_value = alpha * value + (1 - alpha) * stats.mean
    deviation = abs(ewma_value - stats.mean) / max(Statistics.standard_deviation(stats), 0.001)

    %{
      method: :ewma,
      is_anomaly: deviation > threshold,
      score: deviation,
      threshold: threshold,
      confidence: min(1.0, deviation / (threshold * 2))
    }
  end
end
```

### Time-Series Change Point Detection

For detecting shifts in system behavior over time:

```elixir
defmodule PrismaticSecurity.ChangePointDetector do
  @moduledoc """
  Detects points in time where the statistical properties
  of a metric series change significantly. Used for
  identifying gradual drift and sudden behavioral shifts.
  """

  @spec detect_changes([number()], keyword()) :: [{non_neg_integer(), float()}]
  def detect_changes(values, opts \\ []) do
    window_size = Keyword.get(opts, :window_size, 30)
    threshold = Keyword.get(opts, :threshold, 2.0)

    values
    |> Enum.with_index()
    |> Enum.chunk_every(window_size * 2, 1, :discard)
    |> Enum.filter(fn window ->
      {left, right} = Enum.split(window, window_size)
      left_values = Enum.map(left, fn {v, _} -> v end)
      right_values = Enum.map(right, fn {v, _} -> v end)

      t_statistic = two_sample_t_test(left_values, right_values)
      abs(t_statistic) > threshold
    end)
    |> Enum.map(fn window ->
      {_value, index} = Enum.at(window, div(length(window), 2))
      t_stat = compute_t_stat_at(window)
      {index, t_stat}
    end)
  end

  defp two_sample_t_test(left, right) do
    n1 = length(left)
    n2 = length(right)
    mean1 = Enum.sum(left) / n1
    mean2 = Enum.sum(right) / n2
    var1 = Enum.map(left, fn x -> (x - mean1) ** 2 end) |> Enum.sum() |> Kernel./(max(n1 - 1, 1))
    var2 = Enum.map(right, fn x -> (x - mean2) ** 2 end) |> Enum.sum() |> Kernel./(max(n2 - 1, 1))
    pooled_se = :math.sqrt(var1 / n1 + var2 / n2)

    if pooled_se == 0, do: 0.0, else: (mean1 - mean2) / pooled_se
  end

  defp compute_t_stat_at(window) do
    mid = div(length(window), 2)
    {left, right} = Enum.split(window, mid)
    two_sample_t_test(
      Enum.map(left, fn {v, _} -> v end),
      Enum.map(right, fn {v, _} -> v end)
    )
  end
end
```

## Architecture & Implementation

The statistical detection architecture uses a tiered approach. Real-time detection (z-score, EWMA) operates on streaming telemetry events with O(1) per-event cost. Near-real-time detection (MAD, change-point) operates on buffered windows of recent data. Historical detection (distribution fitting, seasonal decomposition) runs on batch schedules against archived metrics.

The Blue Team drift detector combines all three tiers. Real-time detection catches sudden spikes or drops. Near-real-time detection identifies gradual behavioral shifts that might indicate adversarial drift induction. Historical detection validates that long-term trends remain within expected bounds.

The consensus mechanism requires multiple detection methods to agree before triggering an alert. This reduces false positives from individual methods while maintaining sensitivity to genuine anomalies. A z-score anomaly alone might be a statistical fluke; when z-score, MAD, and EWMA all flag the same event, the confidence is substantially higher.

## Usage in Prismatic Platform

Statistical detection is integrated into monitoring, security, and quality subsystems:

```elixir
# Multi-method anomaly detection
results = PrismaticSecurity.StatisticalDetector.detect(baseline, current_latency)
if PrismaticSecurity.StatisticalDetector.consensus_anomaly?(results) do
  PrismaticMonitoring.Alert.emit(:latency_anomaly, results)
end

# Change point detection on historical data
changes = PrismaticSecurity.ChangePointDetector.detect_changes(latency_history)
```

## Cross-References

- [Standard Deviation](/glossary/standard-deviation/) - Core statistical measure used in detection
- [Statistics](/glossary/statistics/) - Mathematical foundation for detection methods
- [Monitoring](/glossary/monitoring/) - Infrastructure providing data for detection
- **Threshold** - Decision boundaries used in detection rules

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
