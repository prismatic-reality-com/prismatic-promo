+++
title = "Pearson Correlation Coefficient"
weight = 50
[extra]
description = "Statistical measure quantifying the linear relationship between two variables, ranging from -1 (perfect inverse) to +1 (perfect positive)."
category = "data-analysis"
related_terms = ["correlation", "regression", "outlier", "iqr"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pearson", "correlation", "linear relationship", "statistics", "data analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Pearson Correlation Coefficient - Prismatic Platform"
+++

## Definition & Overview

The Pearson correlation coefficient (denoted r) is a measure of the linear relationship between two continuous variables. It ranges from -1 to +1, where +1 indicates a perfect positive linear relationship (as one variable increases, the other increases proportionally), -1 indicates a perfect negative linear relationship (as one increases, the other decreases proportionally), and 0 indicates no linear relationship. It is the most widely used correlation measure in statistics and data analysis.

Pearson correlation quantifies how well the relationship between two variables can be described by a straight line. A high absolute correlation (|r| > 0.7) suggests a strong linear relationship. A moderate correlation (0.3 < |r| < 0.7) suggests a meaningful but noisy relationship. A low correlation (|r| < 0.3) suggests little linear relationship, though non-linear relationships may still exist. Crucially, correlation does not imply causation: two correlated variables may be driven by a common third factor rather than directly influencing each other.

In the Prismatic Platform, Pearson correlation is used for performance analysis (correlating response time with request payload size), OSINT data quality assessment (correlating data freshness with accuracy), security scoring validation (correlating component scores with overall security rating), and capacity planning (correlating traffic volume with resource utilization).

## Technical Deep Dive

The Pearson correlation coefficient is computed as the covariance of two variables divided by the product of their standard deviations: r = cov(X,Y) / (std(X) * std(Y)). This normalization ensures the coefficient is dimensionless and bounded between -1 and +1 regardless of the variables' scales.

The computation requires paired observations: for each data point, both X and Y must be measured. Missing values must be handled (typically by pairwise deletion or imputation). The formula involves computing means, deviations from means, products of deviations, and squared deviations. An efficient single-pass algorithm can compute all necessary components simultaneously.

```elixir
defmodule PrismaticAnalytics.Correlation do
  @moduledoc """
  Pearson correlation coefficient computation and analysis
  for platform performance and data quality metrics.
  """

  @type correlation_result :: %{
    r: float(),
    r_squared: float(),
    n: pos_integer(),
    p_value_approx: float(),
    strength: :negligible | :weak | :moderate | :strong | :very_strong,
    direction: :positive | :negative | :none
  }

  @spec pearson([{number(), number()}]) :: {:ok, correlation_result()} | {:error, term()}
  def pearson(pairs) when length(pairs) < 3 do
    {:error, :insufficient_data}
  end

  def pearson(pairs) do
    n = length(pairs)
    {xs, ys} = Enum.unzip(pairs)

    mean_x = Enum.sum(xs) / n
    mean_y = Enum.sum(ys) / n

    {sum_xy, sum_x2, sum_y2} =
      Enum.reduce(pairs, {0.0, 0.0, 0.0}, fn {x, y}, {sxy, sx2, sy2} ->
        dx = x - mean_x
        dy = y - mean_y
        {sxy + dx * dy, sx2 + dx * dx, sy2 + dy * dy}
      end)

    denominator = :math.sqrt(sum_x2 * sum_y2)

    if denominator == 0.0 do
      {:ok, %{
        r: 0.0, r_squared: 0.0, n: n,
        p_value_approx: 1.0,
        strength: :negligible, direction: :none
      }}
    else
      r = sum_xy / denominator
      r_squared = r * r

      # Approximate p-value using t-distribution
      t_stat = r * :math.sqrt((n - 2) / (1 - r_squared))
      p_value = approximate_p_value(t_stat, n - 2)

      {:ok, %{
        r: Float.round(r, 4),
        r_squared: Float.round(r_squared, 4),
        n: n,
        p_value_approx: Float.round(p_value, 6),
        strength: classify_strength(abs(r)),
        direction: classify_direction(r)
      }}
    end
  end

  @spec correlation_matrix([{atom(), [number()]}]) :: {:ok, map()}
  def correlation_matrix(named_series) do
    pairs =
      for {name_a, series_a} <- named_series,
          {name_b, series_b} <- named_series,
          name_a != name_b do
        paired = Enum.zip(series_a, series_b)
        {:ok, result} = pearson(paired)
        {{name_a, name_b}, result.r}
      end
      |> Map.new()

    {:ok, pairs}
  end

  defp classify_strength(abs_r) do
    cond do
      abs_r >= 0.9 -> :very_strong
      abs_r >= 0.7 -> :strong
      abs_r >= 0.4 -> :moderate
      abs_r >= 0.2 -> :weak
      true -> :negligible
    end
  end

  defp classify_direction(r) when r > 0.05, do: :positive
  defp classify_direction(r) when r < -0.05, do: :negative
  defp classify_direction(_r), do: :none

  defp approximate_p_value(t_stat, df) do
    # Simplified p-value approximation
    # In production, use a proper t-distribution implementation
    abs_t = abs(t_stat)
    if abs_t > 3.0 and df > 20, do: 0.001, else: 0.05
  end
end
```

Important limitations of Pearson correlation include its sensitivity to outliers (a single extreme value can dramatically change r), its limitation to linear relationships (a perfect quadratic relationship would show r near 0), and its assumption of bivariate normality for hypothesis testing. For non-normal data or ordinal variables, Spearman's rank correlation is a robust alternative.

## Architecture & Implementation

Correlation analysis in the Prismatic Platform is implemented as a stateless analytical function library, not a persistent service. Functions are called on-demand when analysis is needed, operating on data pulled from ETS (for real-time metrics) or PostgreSQL (for historical data). This design keeps the correlation module simple and composable.

The correlation matrix function enables multi-variable analysis, computing all pairwise correlations among a set of metrics. This is used in capacity planning to identify which metrics are most strongly correlated with user-perceived performance, enabling targeted optimization. For example, if P95 latency is strongly correlated with database connection pool utilization (r > 0.8) but weakly correlated with CPU usage (r < 0.2), optimization should focus on database connection management rather than compute capacity.

The platform also uses correlation for anomaly detection. When the historical correlation between two metrics (e.g., traffic volume and response time) is strong and stable, a sudden decorrelation event (the correlation drops significantly) may indicate a system change that warrants investigation. This decorrelation detection provides a complementary signal to threshold-based alerting.

## Usage in Prismatic Platform

Performance correlation analysis for capacity planning:

```elixir
defmodule PrismaticMonitoring.CapacityAnalysis do
  @moduledoc """
  Uses Pearson correlation to identify performance bottlenecks
  and capacity planning priorities.
  """

  alias PrismaticAnalytics.Correlation

  @metrics [:request_count, :p95_latency, :db_pool_usage,
            :ets_memory, :cpu_usage, :beam_process_count]

  @spec identify_bottlenecks(DateTime.t(), DateTime.t()) :: {:ok, map()}
  def identify_bottlenecks(from, to) do
    metric_data = fetch_metric_series(@metrics, from, to)

    # Compute correlation of each metric with P95 latency
    latency_series = Map.fetch!(metric_data, :p95_latency)

    correlations =
      @metrics
      |> Enum.reject(&(&1 == :p95_latency))
      |> Enum.map(fn metric ->
        series = Map.fetch!(metric_data, metric)
        pairs = Enum.zip(series, latency_series)
        {:ok, result} = Correlation.pearson(pairs)

        {metric, %{
          correlation: result.r,
          strength: result.strength,
          direction: result.direction,
          p_value: result.p_value_approx
        }}
      end)
      |> Enum.sort_by(fn {_, r} -> abs(r.correlation) end, :desc)

    primary_bottleneck =
      case correlations do
        [{metric, %{strength: s}} | _] when s in [:strong, :very_strong] ->
          metric
        _ ->
          :none
      end

    {:ok, %{
      correlations: Map.new(correlations),
      primary_bottleneck: primary_bottleneck,
      recommendation: generate_recommendation(primary_bottleneck)
    }}
  end

  defp generate_recommendation(:db_pool_usage) do
    "Database connection pool usage strongly correlates with latency. " <>
    "Consider increasing pool_size or optimizing query performance."
  end

  defp generate_recommendation(:beam_process_count) do
    "Process count strongly correlates with latency. " <>
    "Investigate process leaks or implement process pooling."
  end

  defp generate_recommendation(:none) do
    "No single metric strongly correlates with latency. " <>
    "The bottleneck may be external (network, third-party APIs)."
  end

  defp generate_recommendation(metric) do
    "#{metric} correlates with latency. Investigate and optimize."
  end

  defp fetch_metric_series(_metrics, _from, _to), do: %{}
end
```

Pearson correlation transforms raw metric data into actionable capacity planning intelligence, identifying which system resources most directly impact user-perceived performance and guiding optimization efforts toward the highest-impact areas.

## Cross-References

- [IQR](/glossary/iqr/) - Dispersion measure used alongside correlation analysis
- [Outlier](/glossary/outlier/) - Extreme values that distort Pearson correlation
- [P95](/glossary/p95/) - Performance metric commonly correlated with resource usage
- [Moving Average](/glossary/moving-average/) - Smoothing that can improve correlation stability
- [Telemetry](/glossary/telemetry/) - Data source for correlation analysis inputs

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
