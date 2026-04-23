+++
title = "IQR (Interquartile Range)"
weight = 50
[extra]
description = "Statistical measure of variability representing the range between the 25th and 75th percentiles, robust against outliers."
category = "data-analysis"
related_terms = ["outlier", "percentile", "standard-deviation", "median"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IQR", "interquartile range", "statistics", "outlier detection", "data analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "IQR - Prismatic Platform"
+++

## Definition & Overview

The Interquartile Range (IQR) is a measure of statistical dispersion that represents the spread of the middle 50% of a dataset. It is calculated as the difference between the 75th percentile (Q3) and the 25th percentile (Q1): IQR = Q3 - Q1. Unlike the range (max - min) or standard deviation, the IQR is robust against outliers because it ignores the extreme values in both tails of the distribution.

IQR is fundamental to exploratory data analysis and is the basis for the Tukey fence method of outlier detection: values below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR are classified as outliers. This method is widely used because it requires no distributional assumptions and works well for both symmetric and skewed distributions. Box plots, one of the most common data visualization tools, directly display the IQR as the box height with whiskers extending to the fences.

In the Prismatic Platform, IQR is used extensively in performance monitoring, benchmark analysis, and OSINT data quality assessment. When analyzing response times from OSINT adapters, the IQR reveals the typical variation in performance, while outliers (detected via the IQR fence method) may indicate API throttling, network issues, or data anomalies requiring investigation.

## Technical Deep Dive

Computing the IQR requires sorting the dataset and finding the quartile boundaries. For small datasets, this is straightforward. For streaming data or very large datasets, approximate methods like t-digest or HDR histogram can estimate percentiles without sorting the entire dataset, trading a small accuracy loss for dramatically reduced memory and computation requirements.

The choice between IQR and standard deviation depends on the data characteristics. Standard deviation assumes approximately normal distribution and is sensitive to outliers. IQR makes no distributional assumptions and is stable regardless of outlier presence. For performance metrics in production systems, where occasional extreme values are common (garbage collection pauses, network retransmissions), IQR provides a more reliable measure of typical variation.

```elixir
defmodule PrismaticAnalytics.Statistics do
  @moduledoc """
  Statistical functions for performance analysis and data quality
  assessment in the Prismatic Platform.
  """

  @type quartiles :: %{
    q1: number(),
    median: number(),
    q3: number(),
    iqr: number()
  }

  @spec quartiles([number()]) :: {:ok, quartiles()} | {:error, :insufficient_data}
  def quartiles(values) when length(values) < 4 do
    {:error, :insufficient_data}
  end

  def quartiles(values) do
    sorted = Enum.sort(values)
    n = length(sorted)

    q1 = percentile(sorted, n, 0.25)
    median = percentile(sorted, n, 0.50)
    q3 = percentile(sorted, n, 0.75)
    iqr = q3 - q1

    {:ok, %{q1: q1, median: median, q3: q3, iqr: iqr}}
  end

  @spec detect_outliers([number()]) :: {:ok, %{outliers: [number()], normal: [number()]}}
  def detect_outliers(values) do
    case quartiles(values) do
      {:ok, %{q1: q1, q3: q3, iqr: iqr}} ->
        lower_fence = q1 - 1.5 * iqr
        upper_fence = q3 + 1.5 * iqr

        {outliers, normal} =
          Enum.split_with(values, fn v ->
            v < lower_fence or v > upper_fence
          end)

        {:ok, %{
          outliers: outliers,
          normal: normal,
          lower_fence: lower_fence,
          upper_fence: upper_fence,
          outlier_count: length(outliers),
          outlier_pct: length(outliers) / length(values) * 100
        }}

      error ->
        error
    end
  end

  @spec percentile([number()], pos_integer(), float()) :: number()
  defp percentile(sorted, n, p) do
    rank = p * (n - 1)
    lower = Enum.at(sorted, floor(rank))
    upper = Enum.at(sorted, ceil(rank))
    frac = rank - floor(rank)

    lower + frac * (upper - lower)
  end
end
```

The IQR is also used to compute the coefficient of quartile deviation (CQD = IQR / (Q1 + Q3)), which provides a normalized measure of dispersion comparable across datasets with different scales. This is useful when comparing variability across OSINT sources that return data in different ranges.

## Architecture & Implementation

The platform integrates IQR computation into several analytical workflows. The performance monitoring system computes rolling IQR for response times, using it to set dynamic alert thresholds that adapt to the system's normal operating range. Rather than static thresholds (alert if latency exceeds 500ms), the system alerts when latency exceeds Q3 + 3 * IQR, which automatically adjusts for changes in baseline performance.

Benchmark analysis uses IQR to assess measurement quality. A benchmark run with a narrow IQR relative to the median indicates consistent, reliable measurements. A wide IQR suggests measurement noise from system interference, requiring longer benchmark runs or better isolation.

The DD pipeline uses IQR-based outlier detection when analyzing entity attributes. For example, when loading financial data, entities with revenue figures outside the IQR fences are flagged for manual review, as they may indicate data quality issues in the source rather than genuinely extreme values. This statistical approach to data quality is more robust than fixed-threshold validation.

## Usage in Prismatic Platform

Performance monitoring with adaptive IQR-based thresholds:

```elixir
defmodule PrismaticMonitoring.AdaptiveThresholds do
  @moduledoc """
  IQR-based adaptive alerting for platform performance monitoring.
  Automatically adjusts thresholds based on observed distributions.
  """

  alias PrismaticAnalytics.Statistics

  @type threshold_config :: %{
    metric: atom(),
    window_size: pos_integer(),
    multiplier: float()
  }

  @spec compute_thresholds([number()], threshold_config()) ::
    {:ok, %{lower: number(), upper: number()}} | {:error, term()}
  def compute_thresholds(recent_values, config) do
    case Statistics.quartiles(recent_values) do
      {:ok, %{q1: q1, q3: q3, iqr: iqr}} ->
        multiplier = Map.get(config, :multiplier, 1.5)

        {:ok, %{
          lower: q1 - multiplier * iqr,
          upper: q3 + multiplier * iqr,
          q1: q1,
          q3: q3,
          iqr: iqr
        }}

      error ->
        error
    end
  end

  @spec should_alert?(number(), %{lower: number(), upper: number()}) :: boolean()
  def should_alert?(current_value, %{lower: lower, upper: upper}) do
    current_value < lower or current_value > upper
  end

  @spec analyze_osint_response_times(String.t(), [number()]) :: map()
  def analyze_osint_response_times(tool_slug, response_times) do
    {:ok, stats} = Statistics.quartiles(response_times)
    {:ok, outlier_info} = Statistics.detect_outliers(response_times)

    %{
      tool: tool_slug,
      typical_range_ms: {stats.q1, stats.q3},
      median_ms: stats.median,
      variability_iqr_ms: stats.iqr,
      outlier_count: outlier_info.outlier_count,
      outlier_pct: outlier_info.outlier_pct,
      stability: classify_stability(stats.iqr, stats.median)
    }
  end

  defp classify_stability(iqr, median) when median > 0 do
    cqd = iqr / median

    cond do
      cqd < 0.1 -> :excellent
      cqd < 0.25 -> :good
      cqd < 0.5 -> :moderate
      true -> :poor
    end
  end

  defp classify_stability(_iqr, _median), do: :unknown
end
```

This IQR-based approach to monitoring provides self-calibrating alert thresholds that reduce false positives during peak load and increase sensitivity during quiet periods, making operational monitoring more intelligent and less noisy.

## Cross-References

- **Outlier** - Data points identified using IQR fences
- **P95** - Related percentile metric for latency analysis
- **P99** - Tail latency metric often analyzed alongside IQR
- **Pearson** - Correlation measure complementing IQR for bivariate analysis
- **Moving Average** - Time-series smoothing often paired with IQR

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
