+++
title = "Seasonality"
weight = 50
[extra]
description = "Recurring periodic patterns in time series data driven by calendar cycles, business rhythms, or environmental factors"
category = "data-analysis"
related_terms = ["percentile", "scatter-plot", "pivot-table", "precision", "profiling"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["seasonality", "time series", "periodic pattern", "trend", "decomposition", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "statistics", "time-series"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Seasonality - Prismatic Platform"
+++

## Definition & Overview

Seasonality refers to predictable, recurring patterns in time series data that repeat at regular intervals. These patterns are driven by calendar cycles (daily, weekly, monthly, annual), business rhythms (quarterly reporting, tax seasons), or environmental factors (weather-driven activity patterns). Seasonality is distinct from trends (long-term directional movement) and noise (random variation) -- together, these three components form the classical time series decomposition: observed = trend + seasonal + residual.

Understanding seasonality is essential for accurate forecasting, anomaly detection, and baseline comparison. A 20% traffic increase on a Monday morning is normal weekly seasonality, not an anomaly. Conversely, a 20% increase during a typically quiet Sunday midnight warrants investigation. Without seasonality awareness, monitoring systems generate false positives during predictable peaks and miss true anomalies during predictable troughs.

The Prismatic Platform encounters seasonality across multiple domains: web traffic patterns (diurnal and weekly cycles), OSINT tool usage (higher during business hours in European timezones), security incident frequency (quarterly spikes around reporting deadlines), and DD pipeline loads (synchronized with Czech registry update schedules). The platform's analytics subsystem decomposes time series data to separate seasonal components from trend and residual, enabling more accurate anomaly detection and capacity planning.

## Technical Deep Dive

Seasonal decomposition in Elixir uses a moving average approach to extract the trend component, then isolates the seasonal component by averaging the detrended values at each seasonal period position. The residual is the difference between the observed data and the sum of trend and seasonal components.

```elixir
defmodule PrismaticAnalytics.Seasonality do
  @moduledoc """
  Time series seasonal decomposition using additive model.
  Decomposes observed data into trend, seasonal, and residual
  components for anomaly detection and forecasting.
  """

  @type decomposition :: %{
    trend: [float() | nil],
    seasonal: [float()],
    residual: [float() | nil],
    period: pos_integer()
  }

  @spec decompose([number()], pos_integer()) :: {:ok, decomposition()} | {:error, term()}
  def decompose(series, period) when length(series) >= period * 2 do
    trend = moving_average(series, period)
    detrended = detrend(series, trend)
    seasonal = compute_seasonal_component(detrended, period)
    residual = compute_residual(series, trend, seasonal)

    {:ok, %{
      trend: trend,
      seasonal: seasonal,
      residual: residual,
      period: period
    }}
  end

  def decompose(_series, _period), do: {:error, :insufficient_data}

  @spec detect_anomalies([number()], pos_integer(), float()) :: [{non_neg_integer(), float()}]
  def detect_anomalies(series, period, threshold \\ 2.0) do
    case decompose(series, period) do
      {:ok, %{residual: residual}} ->
        non_nil = Enum.reject(residual, &is_nil/1)
        mean = Enum.sum(non_nil) / max(length(non_nil), 1)
        std = standard_deviation(non_nil, mean)

        residual
        |> Enum.with_index()
        |> Enum.filter(fn
          {nil, _} -> false
          {value, _} -> abs(value - mean) > threshold * std
        end)
        |> Enum.map(fn {value, index} -> {index, value} end)

      {:error, _} ->
        []
    end
  end

  defp moving_average(series, window) do
    half = div(window, 2)
    n = length(series)

    Enum.map(0..(n - 1), fn i ->
      if i >= half and i < n - half do
        slice = Enum.slice(series, (i - half)..(i + half))
        Enum.sum(slice) / length(slice)
      else
        nil
      end
    end)
  end

  defp detrend(series, trend) do
    Enum.zip(series, trend)
    |> Enum.map(fn
      {value, nil} -> nil
      {value, trend_val} -> value - trend_val
    end)
  end

  defp compute_seasonal_component(detrended, period) do
    period_averages =
      detrended
      |> Enum.with_index()
      |> Enum.reject(fn {v, _} -> is_nil(v) end)
      |> Enum.group_by(fn {_, i} -> rem(i, period) end)
      |> Map.new(fn {pos, values} ->
        vals = Enum.map(values, &elem(&1, 0))
        {pos, Enum.sum(vals) / length(vals)}
      end)

    grand_mean = Map.values(period_averages) |> Enum.sum() |> Kernel./(period)
    centered = Map.new(period_averages, fn {k, v} -> {k, v - grand_mean} end)

    n = length(detrended)
    Enum.map(0..(n - 1), fn i ->
      Map.get(centered, rem(i, period), 0.0)
    end)
  end

  defp compute_residual(series, trend, seasonal) do
    Enum.zip([series, trend, seasonal])
    |> Enum.map(fn
      {_, nil, _} -> nil
      {obs, tr, sea} -> obs - tr - sea
    end)
  end

  defp standard_deviation(values, mean) do
    variance = Enum.reduce(values, 0, fn v, acc -> acc + (v - mean) ** 2 end) / max(length(values) - 1, 1)
    :math.sqrt(variance)
  end
end
```

## Architecture & Implementation

The seasonality analysis module integrates with the platform's telemetry aggregation pipeline. Historical telemetry data (request counts, latency distributions, error rates) is stored in time-bucketed aggregates that enable seasonal decomposition over configurable windows. The analysis runs periodically as a background task, updating seasonal baselines that the anomaly detection system uses for alert evaluation.

The architecture separates seasonal model computation (batch, periodic) from anomaly detection (real-time, per-event). The seasonal model is recomputed hourly using the latest historical data, while anomaly detection compares each incoming telemetry event against the current model's expected value for the current seasonal position.

## Usage in Prismatic Platform

Seasonality analysis is used for performance baseline adjustment, capacity planning, and intelligent alerting. The monitoring dashboard displays seasonal decomposition charts showing trend, seasonal, and residual components for key platform metrics.

```elixir
defmodule PrismaticPerformance.SeasonalAlerting do
  @moduledoc """
  Seasonally-adjusted alerting that accounts for known periodic
  patterns to reduce false positive alerts.
  """

  @spec should_alert?(atom(), float(), pos_integer()) :: boolean()
  def should_alert?(metric, current_value, period \\ 24) do
    historical = get_historical_values(metric, period * 7)

    case PrismaticAnalytics.Seasonality.decompose(historical, period) do
      {:ok, %{seasonal: seasonal, trend: trend}} ->
        position = rem(current_hour(), period)
        expected = (List.last(Enum.reject(trend, &is_nil/1)) || 0) + Enum.at(seasonal, position, 0)
        deviation = abs(current_value - expected) / max(abs(expected), 1)
        deviation > 0.5

      {:error, _} ->
        current_value > get_static_threshold(metric)
    end
  end

  defp current_hour, do: DateTime.utc_now().hour
  defp get_historical_values(_metric, _count), do: []
  defp get_static_threshold(_metric), do: 100
end
```

## Cross-References

- [Percentile](/glossary/percentile/) - Statistical measure adjusted for seasonal baselines
- [Scatter Plot](/glossary/scatter-plot/) - Visualization revealing seasonal patterns in time-based data
- [Pivot Table](/glossary/pivot-table/) - Time-dimensioned pivots exposing seasonal aggregations
- [Precision](/glossary/precision/) - Classification accuracy affected by seasonal input distribution shifts
- [Profiling](/glossary/profiling/) - Performance measurement producing seasonally-varying metrics

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
