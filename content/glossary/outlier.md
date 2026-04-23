+++
title = "Outlier"
weight = 50
[extra]
description = "A data point that significantly deviates from the expected pattern or distribution, potentially indicating errors, anomalies, or genuine extreme values."
category = "data-analysis"
related_terms = ["iqr", "standard-deviation", "anomaly-detection", "p99"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["outlier", "anomaly", "statistical deviation", "data quality", "detection", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Outlier - Prismatic Platform"
+++

## Definition & Overview

An outlier is a data point that lies significantly outside the expected range or pattern of a dataset. Outliers can result from measurement errors, data entry mistakes, system anomalies, or genuinely extreme values. The distinction matters: error-induced outliers should be corrected or removed, while genuine outliers may carry the most important information in the dataset (a 10x response time spike indicates a real system problem, not a measurement artifact).

Outlier detection is a fundamental analytical capability with applications across multiple domains. In performance monitoring, outliers in response time distributions indicate degradation events. In security, outlier network traffic patterns may indicate attacks or data exfiltration. In financial data, outlier transactions may indicate fraud. In OSINT data quality, outlier values in scraped datasets may indicate parsing errors or data source changes.

The Prismatic Platform implements multiple outlier detection methods, applied across performance monitoring (detecting response time spikes), OSINT data quality (flagging suspect scraped values), DD entity validation (identifying unusual financial figures), and security assessment (detecting anomalous scan results). The platform uses IQR-based, Z-score-based, and adaptive threshold methods depending on the data characteristics and detection requirements.

## Technical Deep Dive

Three primary methods dominate outlier detection. The IQR (Interquartile Range) method classifies points below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR as outliers. This method is robust (resistant to outlier contamination of the threshold itself) and distribution-free (requires no normality assumption). The Z-score method flags points more than a specified number of standard deviations from the mean (typically 2 or 3). This method assumes approximate normality and is sensitive to outlier contamination. The Modified Z-score method uses the median and MAD (Median Absolute Deviation) instead, providing robustness similar to the IQR method with more granular scoring.

For time series data, outlier detection must account for trends and seasonality. A value that is normal at peak hours may be an outlier at 3 AM. The platform uses Exponential Moving Average (EMA) based adaptive thresholds that track the expected range over time, flagging deviations from the recent baseline rather than a static threshold.

```elixir
defmodule PrismaticAnalytics.OutlierDetection do
  @moduledoc """
  Multi-method outlier detection for platform analytics.
  Supports IQR, Z-score, and adaptive threshold methods.
  """

  @type outlier_result :: %{
    value: number(),
    index: non_neg_integer(),
    method: :iqr | :zscore | :modified_zscore,
    severity: :mild | :moderate | :extreme,
    deviation: float()
  }

  @type detection_result :: %{
    outliers: [outlier_result()],
    normal_count: non_neg_integer(),
    outlier_count: non_neg_integer(),
    outlier_pct: float(),
    method: atom(),
    thresholds: map()
  }

  # IQR-based detection (robust, distribution-free)

  @spec detect_iqr([number()], float()) :: {:ok, detection_result()}
  def detect_iqr(values, multiplier \\ 1.5) do
    sorted = Enum.sort(values)
    n = length(sorted)
    q1 = percentile(sorted, n, 0.25)
    q3 = percentile(sorted, n, 0.75)
    iqr = q3 - q1

    lower = q1 - multiplier * iqr
    upper = q3 + multiplier * iqr
    extreme_lower = q1 - 3.0 * iqr
    extreme_upper = q3 + 3.0 * iqr

    outliers =
      values
      |> Enum.with_index()
      |> Enum.filter(fn {v, _} -> v < lower or v > upper end)
      |> Enum.map(fn {v, idx} ->
        severity = if v < extreme_lower or v > extreme_upper, do: :extreme, else: :mild
        median = percentile(sorted, n, 0.5)
        %{
          value: v,
          index: idx,
          method: :iqr,
          severity: severity,
          deviation: abs(v - median) / max(iqr, 0.001)
        }
      end)

    {:ok, %{
      outliers: outliers,
      normal_count: n - length(outliers),
      outlier_count: length(outliers),
      outlier_pct: if(n > 0, do: length(outliers) / n * 100, else: 0.0),
      method: :iqr,
      thresholds: %{lower: lower, upper: upper}
    }}
  end

  # Z-score based detection (assumes normality)

  @spec detect_zscore([number()], float()) :: {:ok, detection_result()}
  def detect_zscore(values, threshold \\ 3.0) do
    n = length(values)
    mean = Enum.sum(values) / n
    std = std_dev(values, mean)

    outliers =
      values
      |> Enum.with_index()
      |> Enum.filter(fn {v, _} -> abs(v - mean) > threshold * std end)
      |> Enum.map(fn {v, idx} ->
        z = abs(v - mean) / max(std, 0.001)
        severity = cond do
          z > 5.0 -> :extreme
          z > 3.0 -> :moderate
          true -> :mild
        end
        %{value: v, index: idx, method: :zscore, severity: severity, deviation: z}
      end)

    {:ok, %{
      outliers: outliers,
      normal_count: n - length(outliers),
      outlier_count: length(outliers),
      outlier_pct: if(n > 0, do: length(outliers) / n * 100, else: 0.0),
      method: :zscore,
      thresholds: %{lower: mean - threshold * std, upper: mean + threshold * std}
    }}
  end

  defp percentile(sorted, n, p) do
    rank = p * (n - 1)
    lower = Enum.at(sorted, floor(rank))
    upper = Enum.at(sorted, ceil(rank))
    frac = rank - floor(rank)
    lower + frac * (upper - lower)
  end

  defp std_dev(values, mean) do
    n = length(values)
    variance = Enum.reduce(values, 0, fn v, acc -> acc + (v - mean) ** 2 end) / n
    :math.sqrt(variance)
  end
end
```

The choice of detection method depends on the data characteristics. For performance metrics with heavy tails (common in distributed systems), the IQR method is preferred because it does not assume normality. For normally distributed metrics (like measurement noise), Z-score provides more statistical power. The platform's monitoring system defaults to IQR for operational metrics and offers method selection for analytical workloads.

## Architecture & Implementation

Outlier detection is integrated into three platform workflows. The real-time monitoring pipeline applies streaming outlier detection to telemetry events, triggering alerts when outlier rates exceed thresholds. The batch analytics pipeline runs outlier analysis on historical data for trend reports and capacity planning. The data quality pipeline screens incoming OSINT and DD data for outliers that may indicate source problems.

The platform's adaptive threshold system (described in the Moving Average entry) provides context-aware outlier detection for time series. Rather than comparing against a static distribution, each metric maintains a running EMA and standard deviation estimate. Outliers are defined relative to the current baseline, automatically adapting to legitimate changes in system behavior (like increased traffic during business hours).

Alert fatigue is a real concern with outlier detection. The platform addresses this through severity classification (only extreme outliers trigger alerts), rate limiting (alert on the pattern, not every individual outlier), and contextual suppression (known maintenance windows suppress alerts). This ensures that outlier detection provides actionable intelligence rather than noise.

## Usage in Prismatic Platform

OSINT data quality screening using outlier detection:

```elixir
defmodule PrismaticOsintCore.DataQuality.OutlierScreen do
  @moduledoc """
  Screens OSINT tool results for statistical outliers
  that may indicate data quality issues.
  """

  alias PrismaticAnalytics.OutlierDetection

  @spec screen_results(String.t(), [map()]) :: {:ok, map()}
  def screen_results(tool_slug, results) do
    numeric_fields = identify_numeric_fields(results)

    field_analyses =
      Enum.map(numeric_fields, fn field ->
        values = Enum.map(results, &Map.get(&1, field, 0))
        {:ok, analysis} = OutlierDetection.detect_iqr(values)

        flagged_indices =
          analysis.outliers
          |> Enum.filter(&(&1.severity in [:moderate, :extreme]))
          |> Enum.map(& &1.index)

        {field, %{
          outlier_count: analysis.outlier_count,
          outlier_pct: analysis.outlier_pct,
          flagged_indices: flagged_indices,
          thresholds: analysis.thresholds
        }}
      end)
      |> Map.new()

    all_flagged = field_analyses
    |> Enum.flat_map(fn {_, a} -> a.flagged_indices end)
    |> Enum.uniq()

    {:ok, %{
      tool_slug: tool_slug,
      total_results: length(results),
      field_analyses: field_analyses,
      flagged_result_count: length(all_flagged),
      flagged_indices: all_flagged,
      data_quality_score: compute_quality_score(field_analyses)
    }}
  end

  defp identify_numeric_fields(results) do
    case results do
      [first | _] ->
        first
        |> Enum.filter(fn {_k, v} -> is_number(v) end)
        |> Enum.map(&elem(&1, 0))
      [] -> []
    end
  end

  defp compute_quality_score(field_analyses) do
    if map_size(field_analyses) == 0 do
      100.0
    else
      avg_outlier_pct = field_analyses
      |> Enum.map(fn {_, a} -> a.outlier_pct end)
      |> then(&(Enum.sum(&1) / length(&1)))

      max(0.0, 100.0 - avg_outlier_pct * 2)
    end
  end
end
```

Outlier detection transforms raw data into actionable intelligence by automatically distinguishing normal variation from significant deviations, enabling the platform to surface important signals while filtering noise across all its analytical capabilities.

## Cross-References

- [IQR](@/glossary/iqr.md) - Primary statistical measure for outlier detection
- [P95](@/glossary/p95.md) - Percentile metric affected by outlier presence
- [P99](@/glossary/p99.md) - Tail metric most sensitive to outliers
- [Moving Average](@/glossary/moving-average.md) - Baseline estimation for adaptive outlier detection
- [Pearson](@/glossary/pearson.md) - Correlation measure affected by outlier presence

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
