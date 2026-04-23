+++
title = "Correlation"
weight = 50
[extra]
description = "A statistical measure quantifying the strength and direction of the linear relationship between two variables, fundamental to OSINT signal analysis and intelligence correlation"
category = "data-analysis"
related_terms = ["covariance", "confidence-score", "cross-tabulation", "anomaly-detection", "chart"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["correlation", "Pearson", "statistical relationship", "signal correlation", "OSINT analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "statistics"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Correlation - Prismatic Platform"
+++

## Definition & Overview

Correlation is a statistical measure that quantifies the strength and direction of the relationship between two variables. The most common measure, Pearson's correlation coefficient (r), ranges from -1.0 (perfect negative correlation) through 0.0 (no linear correlation) to +1.0 (perfect positive correlation). A correlation of 0.85 between two OSINT signals means they tend to move together strongly, while -0.85 means they move in opposite directions. Critically, correlation does not imply causation -- two variables may be correlated due to a shared underlying cause rather than a direct causal relationship.

Beyond Pearson's linear correlation, other measures capture different relationship types: Spearman's rank correlation (monotonic relationships), Kendall's tau (concordance of ordinal data), mutual information (general dependency), and distance correlation (non-linear relationships). The choice of correlation measure depends on the data type, distribution assumptions, and the nature of the relationship being investigated.

In the Prismatic Platform, correlation analysis is fundamental to OSINT signal synthesis, security threat correlation, and data quality assessment. The Blue Team's `blue-signal-aggregator` agent performs cross-domain signal correlation to identify relationships between seemingly unrelated events. The NABLA Infinity framework's Signal Plurality axiom uses correlation to determine source independence -- highly correlated sources may share a common upstream, reducing their collective evidential value.

## Technical Deep Dive

### Correlation Measures

| Measure | Range | Assumptions | Best For |
|---------|-------|-------------|----------|
| **Pearson (r)** | [-1, 1] | Linear, continuous, normal | Continuous data |
| **Spearman (rho)** | [-1, 1] | Monotonic | Ordinal/ranked data |
| **Kendall (tau)** | [-1, 1] | Ordinal | Small samples, ties |
| **Point-Biserial** | [-1, 1] | One binary, one continuous | Binary + continuous |
| **Cramers V** | [0, 1] | Categorical | Categorical x categorical |
| **Mutual Information** | [0, inf) | None | Any dependency |

### Signal Correlation Engine

```elixir
defmodule PrismaticOsintCore.CorrelationEngine do
  @moduledoc """
  Computes statistical correlations between OSINT signals.
  Used by the Blue Team's signal-aggregator for cross-domain
  correlation and by NABLA for source independence assessment.
  """

  @type correlation_result :: %{
    signal_a: String.t(),
    signal_b: String.t(),
    pearson_r: float(),
    significance: float(),
    sample_size: non_neg_integer(),
    interpretation: atom()
  }

  @spec pearson([number()], [number()]) :: {:ok, float()} | {:error, atom()}
  def pearson(xs, ys) when length(xs) == length(ys) and length(xs) >= 3 do
    n = length(xs)
    mean_x = Enum.sum(xs) / n
    mean_y = Enum.sum(ys) / n

    covariance = Enum.zip(xs, ys)
    |> Enum.map(fn {x, y} -> (x - mean_x) * (y - mean_y) end)
    |> Enum.sum()

    std_x = :math.sqrt(Enum.map(xs, fn x -> (x - mean_x) ** 2 end) |> Enum.sum())
    std_y = :math.sqrt(Enum.map(ys, fn y -> (y - mean_y) ** 2 end) |> Enum.sum())

    if std_x > 0 and std_y > 0 do
      {:ok, covariance / (std_x * std_y)}
    else
      {:error, :zero_variance}
    end
  end

  def pearson(xs, ys) when length(xs) != length(ys), do: {:error, :length_mismatch}
  def pearson(_, _), do: {:error, :insufficient_data}

  @spec spearman([number()], [number()]) :: {:ok, float()} | {:error, atom()}
  def spearman(xs, ys) do
    ranked_x = rank(xs)
    ranked_y = rank(ys)
    pearson(ranked_x, ranked_y)
  end

  @spec correlate_signals(String.t(), String.t(), [map()]) :: {:ok, correlation_result()}
  def correlate_signals(signal_a_id, signal_b_id, time_series) do
    values_a = Enum.map(time_series, &Map.get(&1, signal_a_id, 0))
    values_b = Enum.map(time_series, &Map.get(&1, signal_b_id, 0))

    case pearson(values_a, values_b) do
      {:ok, r} ->
        {:ok, %{
          signal_a: signal_a_id,
          signal_b: signal_b_id,
          pearson_r: r,
          significance: approximate_p_value(r, length(values_a)),
          sample_size: length(values_a),
          interpretation: interpret_correlation(r)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp rank(values) do
    values
    |> Enum.with_index()
    |> Enum.sort_by(fn {v, _} -> v end)
    |> Enum.with_index(1)
    |> Enum.sort_by(fn {{_, orig_idx}, _} -> orig_idx end)
    |> Enum.map(fn {_, rank} -> rank * 1.0 end)
  end

  defp interpret_correlation(r) when abs(r) >= 0.8, do: :strong
  defp interpret_correlation(r) when abs(r) >= 0.5, do: :moderate
  defp interpret_correlation(r) when abs(r) >= 0.3, do: :weak
  defp interpret_correlation(_r), do: :negligible

  defp approximate_p_value(r, n) when n > 4 do
    t = r * :math.sqrt((n - 2) / (1 - r * r))
    2.0 * (1.0 - students_t_cdf(abs(t), n - 2))
  end
  defp approximate_p_value(_, _), do: 1.0

  defp students_t_cdf(t, _df) when t > 3.5, do: 0.999
  defp students_t_cdf(t, _df) when t > 2.5, do: 0.99
  defp students_t_cdf(t, _df) when t > 1.96, do: 0.975
  defp students_t_cdf(_t, _df), do: 0.5
end
```

### Correlation in Source Independence Assessment

| Correlation | Independence | NABLA Signal Plurality |
|-------------|-------------|----------------------|
| r < 0.3 | Independent | Full signal plurality credit |
| 0.3 <= r < 0.7 | Partially dependent | Reduced plurality credit |
| r >= 0.7 | Dependent | Treated as single signal source |

## Architecture & Implementation

The correlation engine is designed for two primary use cases within the platform. First, OSINT signal correlation identifies relationships between intelligence signals from different tools. When multiple tools report findings about the same entity, the correlation engine determines whether those findings are genuinely independent (supporting Signal Plurality) or derived from a shared upstream source (reducing their combined evidential value).

Second, the Blue Team's cross-domain signal aggregation uses correlation to detect attack patterns that span multiple observable dimensions. A correlation between unusual DNS queries and unusual authentication failures might indicate a coordinated attack, even if each signal individually falls below alert thresholds. The `blue-signal-aggregator` agent computes correlation matrices across all monitored signal channels in real time.

The engine supports both batch correlation (computing a full correlation matrix for historical analysis) and streaming correlation (updating correlation estimates as new signals arrive). Streaming correlation uses an exponentially weighted moving average approach, giving more weight to recent observations while maintaining a running estimate.

## Usage in Prismatic Platform

The OSINT toolbox uses correlation analysis when presenting multi-source investigation results. If two tools return highly correlated data about a target entity, the dashboard highlights this correlation and adjusts the composite confidence score accordingly -- highly correlated sources provide less incremental confidence than independent sources.

The Perimeter security rating computes correlation between security dimensions to identify organizations with systemic security weaknesses. An organization might have correlated failures across TLS configuration, DNS security, and email authentication, suggesting a common root cause (e.g., lack of security staff) rather than three independent issues.

The DD pipeline tracks entity attribute correlations over time. If an entity's financial data and public registry data become unexpectedly uncorrelated (after being historically correlated), this divergence is flagged as a potential data quality issue or a signal of changed circumstances worth investigating.

## Cross-References

- **Covariance** - unstandardized measure of joint variability
- [Confidence Score](@/glossary/confidence-score.md) - reliability metric informed by correlation
- **Cross-Tabulation** - categorical data analysis
- [Anomaly Detection](@/glossary/anomaly-detection.md) - detecting unexpected correlation changes
- [Chart](@/glossary/chart.md) - scatter charts for visualizing correlations
- **Livebooks**: `livebooks/domains/data_analysis/` - statistical analysis lab
- **Academy**: Statistical reasoning and OSINT signal analysis

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
