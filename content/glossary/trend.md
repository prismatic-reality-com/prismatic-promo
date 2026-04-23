+++
title = "Trend"
weight = 50
[extra]
description = "Directional pattern in time series data indicating sustained upward, downward, or lateral movement over time"
category = "data"
related_terms = ["time-series", "anomaly-detection", "monitoring", "z-score"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["trend", "trend analysis", "time series", "directional pattern", "forecasting", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Trend - Prismatic Platform"
+++

## Definition & Overview

A trend is a sustained directional movement in time series data that persists over a meaningful time horizon, distinct from short-term fluctuations and noise. Trends can be upward (increasing values over time), downward (decreasing values), or lateral (no significant directional change). Identifying trends is fundamental to understanding whether a measured quantity is improving, degrading, or remaining stable, enabling informed decisions about resource allocation, alerting thresholds, and strategic planning.

Trend analysis goes beyond simple observation to employ statistical methods that separate signal from noise. Moving averages smooth out short-term volatility to reveal underlying direction. Linear regression quantifies the rate and significance of change. Seasonal decomposition isolates recurring patterns from the secular trend. These techniques transform raw time series data into actionable insights about system behavior.

In the Prismatic Platform, trend analysis serves multiple critical functions. Quality trends across platform generations (Gen 1 through Gen 19) reveal whether the development trajectory maintains its upward quality path. Security rating trends in the Perimeter module show whether an organization's attack surface is expanding or contracting. OSINT tool execution trends help with capacity planning by revealing usage patterns and growth rates. The platform's 100/100 quality score did not happen by accident; trend analysis of quality metrics guided the elimination of all 905 quality debt points.

## Technical Deep Dive

The platform implements trend detection using statistical methods that work well with the temporal data produced by telemetry and monitoring systems:

```elixir
defmodule PrismaticAnalytics.TrendDetector do
  @moduledoc """
  Statistical trend detection for time series data.
  Supports linear regression, moving averages, and
  directional strength indicators.
  """

  @type data_point :: {DateTime.t(), float()}
  @type trend_direction :: :up | :down | :flat
  @type trend_result :: %{
    direction: trend_direction(),
    slope: float(),
    r_squared: float(),
    confidence: float(),
    moving_avg: [float()]
  }

  @spec detect([data_point()], keyword()) :: {:ok, trend_result()} | {:error, term()}
  def detect(points, opts \\ []) when length(points) >= 3 do
    window = Keyword.get(opts, :window, 7)
    threshold = Keyword.get(opts, :threshold, 0.01)

    values = Enum.map(points, fn {_ts, v} -> v end)
    indices = Enum.to_list(0..(length(values) - 1))

    {slope, intercept} = linear_regression(indices, values)
    r_sq = r_squared(indices, values, slope, intercept)
    ma = moving_average(values, window)

    direction = cond do
      slope > threshold and r_sq > 0.3 -> :up
      slope < -threshold and r_sq > 0.3 -> :down
      true -> :flat
    end

    {:ok, %{
      direction: direction,
      slope: Float.round(slope, 6),
      r_squared: Float.round(r_sq, 4),
      confidence: r_sq,
      moving_avg: ma,
      forecast_next: slope * length(values) + intercept
    }}
  end

  def detect(_, _), do: {:error, :insufficient_data}

  defp linear_regression(xs, ys) do
    n = length(xs)
    sum_x = Enum.sum(xs)
    sum_y = Enum.sum(ys)
    sum_xy = xs |> Enum.zip(ys) |> Enum.map(fn {x, y} -> x * y end) |> Enum.sum()
    sum_x2 = xs |> Enum.map(&(&1 * &1)) |> Enum.sum()

    denominator = n * sum_x2 - sum_x * sum_x

    if denominator == 0 do
      {0.0, sum_y / n}
    else
      slope = (n * sum_xy - sum_x * sum_y) / denominator
      intercept = (sum_y - slope * sum_x) / n
      {slope, intercept}
    end
  end

  defp r_squared(xs, ys, slope, intercept) do
    y_mean = Enum.sum(ys) / length(ys)
    ss_res = xs |> Enum.zip(ys) |> Enum.map(fn {x, y} ->
      predicted = slope * x + intercept
      (y - predicted) * (y - predicted)
    end) |> Enum.sum()
    ss_tot = ys |> Enum.map(fn y -> (y - y_mean) * (y - y_mean) end) |> Enum.sum()

    if ss_tot == 0, do: 1.0, else: 1.0 - ss_res / ss_tot
  end

  defp moving_average(values, window) do
    values
    |> Enum.chunk_every(window, 1, :discard)
    |> Enum.map(fn chunk -> Enum.sum(chunk) / length(chunk) end)
  end
end
```

For multi-dimensional trend analysis, the platform tracks trends across multiple metrics simultaneously to detect correlated movements:

```elixir
defmodule PrismaticAnalytics.MultiTrend do
  @moduledoc """
  Multi-dimensional trend analysis for detecting
  correlated movements across metrics.
  """

  alias PrismaticAnalytics.TrendDetector

  @spec analyze_correlation([{String.t(), [TrendDetector.data_point()]}]) :: map()
  def analyze_correlation(metric_series) do
    trends =
      metric_series
      |> Enum.map(fn {name, points} ->
        case TrendDetector.detect(points) do
          {:ok, trend} -> {name, trend}
          {:error, _} -> {name, nil}
        end
      end)
      |> Enum.reject(fn {_, t} -> is_nil(t) end)
      |> Map.new()

    aligned_directions =
      trends
      |> Map.values()
      |> Enum.group_by(& &1.direction)
      |> Enum.map(fn {dir, group} -> {dir, length(group)} end)
      |> Map.new()

    %{
      individual_trends: trends,
      aligned_directions: aligned_directions,
      dominant_direction: dominant_direction(aligned_directions)
    }
  end

  defp dominant_direction(directions) do
    directions
    |> Enum.max_by(fn {_dir, count} -> count end, fn -> {:flat, 0} end)
    |> elem(0)
  end
end
```

## Architecture & Implementation

Trend analysis in the platform integrates with three major subsystems:

**Quality DNA Evolution**: The Quality DNA system tracks 13 quality domains across platform generations. Trend analysis on this data reveals whether quality improvements are sustainable or whether specific domains show signs of regression. The trend slope and R-squared values determine whether automated healing should be triggered.

**Perimeter Security Ratings**: The security rating history for monitored organizations is analyzed for trends. A downward trend in security score triggers escalated alerts, while an upward trend may trigger reduced monitoring frequency. Seasonal patterns (monthly vulnerability scan cycles) are decomposed to avoid false trend signals.

**OSINT Usage Analytics**: Tool execution volumes are trend-analyzed to forecast capacity needs. If Czech registry lookups show consistent week-over-week growth, the platform can proactively adjust rate limits and cache strategies before capacity becomes an issue.

The trend detector integrates with the platform's alerting system through configurable thresholds. A significant downward trend in any monitored metric can trigger alerts at different severity levels based on the slope magnitude and R-squared confidence.

## Usage in Prismatic Platform

The Quality Floor Guardian uses trend analysis to detect quality regression before scores drop below critical thresholds:

```elixir
defmodule PrismaticSafety.QualityTrendMonitor do
  @moduledoc """
  Monitors quality score trends and triggers alerts
  when negative trends are detected.
  """

  @spec check_quality_trend(keyword()) :: :ok | {:alert, map()}
  def check_quality_trend(opts \\ []) do
    lookback = Keyword.get(opts, :lookback_days, 30)
    quality_history = PrismaticSafety.QualityDNA.get_history(lookback)

    case PrismaticAnalytics.TrendDetector.detect(quality_history) do
      {:ok, %{direction: :down, slope: slope, confidence: conf}} when conf > 0.5 ->
        {:alert, %{
          type: :quality_regression,
          slope: slope,
          confidence: conf,
          projected_days_to_threshold: estimate_threshold_breach(slope)
        }}

      {:ok, _trend} ->
        :ok

      {:error, _} ->
        :ok
    end
  end

  defp estimate_threshold_breach(slope) when slope >= 0, do: :never
  defp estimate_threshold_breach(slope) do
    current = 100.0
    threshold = 95.0
    gap = current - threshold
    days = abs(gap / slope)
    Float.round(days, 1)
  end
end
```

## Cross-References

- [Time Series](@/glossary/time-series.md) - Temporal data underlying trends
- **Z-Score** - Statistical measure for anomaly detection
- [Monitoring](@/glossary/monitoring.md) - Observation systems generating trend data
- [Variance](@/glossary/variance.md) - Statistical dispersion in trend analysis
- **Visualization** - Graphical trend representation

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
