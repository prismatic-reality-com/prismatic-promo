+++
title = "Statistics"
weight = 50
[extra]
description = "Mathematical discipline of data collection, analysis, and interpretation applied to system monitoring, quality assurance, and intelligence analysis"
category = "statistics"
related_terms = ["standard-deviation", "statistical-detection", "monitoring", "telemetry", "anomaly-detection", "confidence"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["statistics", "data analysis", "mathematical", "monitoring", "quality", "glossary", "Prismatic Platform"]
tags = ["glossary", "statistics", "analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Statistics - Prismatic Platform"
+++

## Definition & Overview

Statistics is the mathematical discipline concerned with the collection, organization, analysis, interpretation, and presentation of data. It provides the formal methods for drawing conclusions from data under uncertainty, distinguishing meaningful patterns from random noise, and quantifying the confidence in those conclusions. The field divides into descriptive statistics (summarizing observed data through measures like mean, median, and standard deviation) and inferential statistics (drawing conclusions about populations from samples).

In software engineering and platform operations, statistics transforms raw telemetry data into actionable insights. Without statistical methods, monitoring systems would produce either too many alerts (treating every fluctuation as significant) or too few (using arbitrary static thresholds that ignore natural variability). Statistics provides the rigorous framework for determining when a metric change is genuinely significant versus when it falls within the range of normal variation.

The Prismatic Platform applies statistical methods across multiple domains. Performance monitoring uses descriptive statistics (percentiles, means) and inferential methods (z-scores, hypothesis testing) to detect regressions. The NABLA epistemic framework uses statistical confidence to weight intelligence signals. Quality scoring uses distribution analysis to establish baselines and detect degradation. The Perimeter EASM module uses statistical aggregation to compute security ratings from individual vulnerability findings.

## Technical Deep Dive

### Descriptive Statistics Module

The platform provides a comprehensive descriptive statistics toolkit:

```elixir
defmodule PrismaticAnalytics.DescriptiveStats do
  @moduledoc """
  Descriptive statistical functions for data summarization.
  Used across monitoring, quality, and intelligence analysis.
  """

  @spec mean([number()]) :: float()
  def mean([]), do: 0.0
  def mean(values) do
    Enum.sum(values) / length(values)
  end

  @spec median([number()]) :: float()
  def median([]), do: 0.0
  def median(values) do
    sorted = Enum.sort(values)
    n = length(sorted)
    mid = div(n, 2)

    if rem(n, 2) == 0 do
      (Enum.at(sorted, mid - 1) + Enum.at(sorted, mid)) / 2.0
    else
      Enum.at(sorted, mid) * 1.0
    end
  end

  @spec percentile([number()], float()) :: float()
  def percentile([], _p), do: 0.0
  def percentile(values, p) when p > 0 and p <= 100 do
    sorted = Enum.sort(values)
    index = ceil(length(sorted) * p / 100) - 1
    Enum.at(sorted, max(0, index)) * 1.0
  end

  @spec variance([number()]) :: float()
  def variance(values) when length(values) < 2, do: 0.0
  def variance(values) do
    m = mean(values)
    sum_sq = Enum.reduce(values, 0.0, fn v, acc -> acc + (v - m) ** 2 end)
    sum_sq / (length(values) - 1)
  end

  @spec standard_deviation([number()]) :: float()
  def standard_deviation(values) do
    :math.sqrt(variance(values))
  end

  @spec summary([number()]) :: map()
  def summary([]), do: %{count: 0}
  def summary(values) do
    %{
      count: length(values),
      mean: mean(values),
      median: median(values),
      min: Enum.min(values),
      max: Enum.max(values),
      std_dev: standard_deviation(values),
      p95: percentile(values, 95),
      p99: percentile(values, 99),
      variance: variance(values)
    }
  end
end
```

### Statistical Hypothesis Testing

For determining whether observed differences are statistically significant:

```elixir
defmodule PrismaticAnalytics.HypothesisTest do
  @moduledoc """
  Statistical hypothesis testing for performance regression
  detection and A/B testing of system configurations.
  """

  alias PrismaticAnalytics.DescriptiveStats

  @type test_result :: %{
    test: atom(),
    statistic: float(),
    p_value_approx: float(),
    significant: boolean(),
    effect_size: float()
  }

  @spec two_sample_t_test([number()], [number()], float()) :: test_result()
  def two_sample_t_test(sample_a, sample_b, alpha \\ 0.05) do
    n_a = length(sample_a)
    n_b = length(sample_b)
    mean_a = DescriptiveStats.mean(sample_a)
    mean_b = DescriptiveStats.mean(sample_b)
    var_a = DescriptiveStats.variance(sample_a)
    var_b = DescriptiveStats.variance(sample_b)

    pooled_se = :math.sqrt(var_a / n_a + var_b / n_b)
    t_stat = if pooled_se == 0, do: 0.0, else: (mean_a - mean_b) / pooled_se

    # Approximate p-value using normal distribution for large samples
    p_approx = 2 * (1 - normal_cdf(abs(t_stat)))

    # Cohen's d effect size
    pooled_sd = :math.sqrt((var_a + var_b) / 2)
    effect_size = if pooled_sd == 0, do: 0.0, else: abs(mean_a - mean_b) / pooled_sd

    %{
      test: :welch_t_test,
      statistic: t_stat,
      p_value_approx: p_approx,
      significant: p_approx < alpha,
      effect_size: effect_size
    }
  end

  @spec regression_test([number()], [number()]) :: {:regression, map()} | :no_regression
  def regression_test(baseline, current) do
    result = two_sample_t_test(baseline, current, 0.01)

    if result.significant and DescriptiveStats.mean(current) > DescriptiveStats.mean(baseline) do
      {:regression, %{
        baseline_mean: DescriptiveStats.mean(baseline),
        current_mean: DescriptiveStats.mean(current),
        increase_pct: (DescriptiveStats.mean(current) - DescriptiveStats.mean(baseline)) / DescriptiveStats.mean(baseline) * 100,
        effect_size: result.effect_size,
        confidence: 1 - result.p_value_approx
      }}
    else
      :no_regression
    end
  end

  # Approximation of normal CDF using Abramowitz and Stegun formula
  defp normal_cdf(x) when x < 0, do: 1 - normal_cdf(-x)
  defp normal_cdf(x) do
    t = 1 / (1 + 0.2316419 * x)
    d = 0.3989422804014327
    p = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    1 - d * :math.exp(-x * x / 2) * p
  end
end
```

## Architecture & Implementation

The platform's statistical infrastructure operates at two levels. Real-time statistics use Welford's online algorithm (in `PrismaticMonitoring.Statistics`) for streaming computation. Batch statistics use the `DescriptiveStats` module for historical analysis on accumulated datasets.

The choice between online and batch computation depends on the use case. Telemetry monitoring uses online statistics because events arrive as a stream and immediate anomaly detection is required. Performance regression testing uses batch statistics because it compares two complete datasets (baseline and current benchmark results) after collection is complete.

Statistical methods integrate with the NABLA epistemic framework at the confidence level. When the signal aggregator computes belief confidence from multiple sources, it uses statistical weighting that accounts for source independence, temporal decay, and historical reliability. The formal confidence thresholds (0.95 for critical decisions, 0.80 for standard operations) are grounded in statistical significance levels.

## Usage in Prismatic Platform

Statistics are consumed by monitoring, quality, security, and intelligence subsystems:

```elixir
# Compute summary statistics for endpoint latency
summary = PrismaticAnalytics.DescriptiveStats.summary(latency_values)

# Test for performance regression
case PrismaticAnalytics.HypothesisTest.regression_test(baseline_latencies, current_latencies) do
  {:regression, details} -> raise "Performance regression detected: #{inspect(details)}"
  :no_regression -> :ok
end
```

## Cross-References

- [Standard Deviation](@/glossary/standard-deviation.md) - Key dispersion measure in statistics
- [Statistical Detection](@/glossary/statistical-detection.md) - Anomaly identification using statistical methods
- [Monitoring](@/glossary/monitoring.md) - Infrastructure producing data for statistical analysis
- [Telemetry](@/glossary/telemetry.md) - Event system that feeds statistical computations

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
