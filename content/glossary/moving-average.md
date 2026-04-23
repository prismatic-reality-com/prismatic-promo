+++
title = "Moving Average"
weight = 50
[extra]
description = "Time series smoothing technique that calculates the average of a sliding window of data points to reveal trends by reducing noise."
category = "data-analysis"
related_terms = ["time-series", "iqr", "outlier", "telemetry"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["moving average", "time series", "smoothing", "trend analysis", "data analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Moving Average - Prismatic Platform"
+++

## Definition & Overview

A moving average is a statistical calculation that smooths time series data by computing the average of data points within a sliding window. As new data arrives, the window moves forward, dropping the oldest observation and including the newest. This technique filters out short-term fluctuations and noise, revealing the underlying trend in the data. Moving averages are among the most widely used tools in time series analysis, applied in financial markets, signal processing, performance monitoring, and operational analytics.

Three primary variants exist: the Simple Moving Average (SMA) gives equal weight to all observations in the window, the Weighted Moving Average (WMA) assigns linearly increasing weights to more recent observations, and the Exponential Moving Average (EMA) applies exponentially decaying weights. The EMA is particularly popular because it responds more quickly to recent changes while still smoothing noise, and it requires only constant memory regardless of window size.

In the Prismatic Platform, moving averages are used in performance monitoring (smoothing response time telemetry), OSINT data analysis (trend detection in intelligence feeds), and security scoring (computing rolling security ratings that dampen score volatility from transient events). The platform implements both SMA and EMA variants, choosing between them based on whether historical equality or recency bias is more appropriate for the specific use case.

## Technical Deep Dive

The Simple Moving Average over a window of size N is the arithmetic mean of the last N observations: SMA = (x1 + x2 + ... + xN) / N. It has a lag of approximately N/2 periods, meaning trend changes are detected with a delay proportional to the window size. Larger windows produce smoother output but greater lag; smaller windows are more responsive but noisier.

The Exponential Moving Average uses a smoothing factor alpha (0 < alpha < 1): EMA(t) = alpha * x(t) + (1 - alpha) * EMA(t-1). This recursive formulation means the EMA can be computed incrementally with O(1) time and memory per update, making it ideal for streaming data. A common convention sets alpha = 2 / (N + 1) to approximate an SMA of window size N.

```elixir
defmodule PrismaticAnalytics.MovingAverage do
  @moduledoc """
  Moving average implementations for time series smoothing.
  Supports SMA, EMA, and windowed variants with streaming updates.
  """

  @type ema_state :: %{
    value: float(),
    alpha: float(),
    count: non_neg_integer()
  }

  # Simple Moving Average (batch)

  @spec sma([number()], pos_integer()) :: [float()]
  def sma(values, window_size) when length(values) >= window_size do
    values
    |> Enum.chunk_every(window_size, 1, :discard)
    |> Enum.map(fn window ->
      Enum.sum(window) / window_size
    end)
  end

  def sma(_values, _window_size), do: []

  # Exponential Moving Average (streaming)

  @spec ema_init(pos_integer()) :: ema_state()
  def ema_init(window_equivalent) do
    alpha = 2.0 / (window_equivalent + 1)
    %{value: 0.0, alpha: alpha, count: 0}
  end

  @spec ema_update(ema_state(), number()) :: ema_state()
  def ema_update(%{count: 0} = state, observation) do
    %{state | value: observation * 1.0, count: 1}
  end

  def ema_update(%{value: prev, alpha: alpha, count: count} = state, observation) do
    new_value = alpha * observation + (1 - alpha) * prev
    %{state | value: new_value, count: count + 1}
  end

  @spec ema_value(ema_state()) :: float()
  def ema_value(%{value: value}), do: value

  # Batch EMA computation

  @spec ema([number()], pos_integer()) :: [float()]
  def ema(values, window_equivalent) do
    state = ema_init(window_equivalent)

    values
    |> Enum.scan(state, fn val, acc -> ema_update(acc, val) end)
    |> Enum.map(&ema_value/1)
  end

  # Windowed statistics (rolling window with full stats)

  @spec rolling_stats([number()], pos_integer()) :: [map()]
  def rolling_stats(values, window_size) do
    values
    |> Enum.chunk_every(window_size, 1, :discard)
    |> Enum.map(fn window ->
      sorted = Enum.sort(window)
      n = length(sorted)

      %{
        mean: Enum.sum(window) / n,
        min: hd(sorted),
        max: List.last(sorted),
        median: Enum.at(sorted, div(n, 2)),
        std_dev: std_dev(window)
      }
    end)
  end

  defp std_dev(values) do
    n = length(values)
    mean = Enum.sum(values) / n
    variance = Enum.reduce(values, 0, fn v, acc -> acc + (v - mean) ** 2 end) / n
    :math.sqrt(variance)
  end
end
```

Choosing the right window size is a bias-variance tradeoff. For performance monitoring, a 5-minute EMA provides responsive trend detection suitable for operational dashboards, while a 1-hour SMA is better for capacity planning reports. For security ratings, a 30-day moving average dampens the effect of transient scanning results that do not reflect persistent security posture changes.

## Architecture & Implementation

The platform's telemetry system integrates moving averages at the collection layer. Telemetry handlers compute running EMAs for key performance metrics (response times, queue depths, error rates) and store them alongside raw values. This avoids the need to recompute moving averages from historical data for dashboard rendering, enabling real-time visualization with sub-second update latency.

The EMA implementation's O(1) memory footprint makes it suitable for high-cardinality metrics. Each OSINT tool can have its own EMA tracker without significant memory overhead, enabling per-tool performance trend analysis across all 157 registered tools simultaneously. The SMA variant is reserved for batch analysis workflows where the full history is available in memory or database.

Anomaly detection combines moving averages with standard deviation bands. When a metric deviates from its EMA by more than a configurable number of standard deviations (typically 2-3), an anomaly alert is triggered. This approach adapts automatically to the metric's natural variability, reducing false positives compared to static thresholds.

## Usage in Prismatic Platform

Real-time performance monitoring with EMA-based trend detection:

```elixir
defmodule PrismaticMonitoring.PerformanceTrend do
  @moduledoc """
  EMA-based performance trend tracking for OSINT tool response times.
  Provides real-time trend detection with anomaly alerting.
  """

  use GenServer

  alias PrismaticAnalytics.MovingAverage

  @type tool_state :: %{
    ema: MovingAverage.ema_state(),
    ema_std: MovingAverage.ema_state(),
    recent_values: :queue.queue(),
    anomaly_count: non_neg_integer()
  }

  @ema_window 20
  @anomaly_threshold 3.0

  @impl GenServer
  def init(_opts) do
    :telemetry.attach(
      "perf-trend",
      [:prismatic, :osint, :external_api],
      &__MODULE__.handle_telemetry/4,
      nil
    )

    {:ok, %{tools: %{}}}
  end

  def handle_telemetry(_event, %{duration: duration}, %{endpoint: tool_slug}, _config) do
    duration_ms = System.convert_time_unit(duration, :native, :millisecond)
    GenServer.cast(__MODULE__, {:record, tool_slug, duration_ms})
  end

  @impl GenServer
  def handle_cast({:record, tool_slug, value}, state) do
    tool_state = Map.get(state.tools, tool_slug, init_tool_state())

    # Update EMA
    new_ema = MovingAverage.ema_update(tool_state.ema, value)
    ema_val = MovingAverage.ema_value(new_ema)

    # Update EMA of squared deviations for std estimation
    deviation_sq = (value - ema_val) ** 2
    new_ema_std = MovingAverage.ema_update(tool_state.ema_std, deviation_sq)
    std_est = :math.sqrt(MovingAverage.ema_value(new_ema_std))

    # Check for anomaly
    is_anomaly = abs(value - ema_val) > @anomaly_threshold * std_est

    updated = %{tool_state |
      ema: new_ema,
      ema_std: new_ema_std,
      anomaly_count: if(is_anomaly,
        do: tool_state.anomaly_count + 1,
        else: tool_state.anomaly_count)
    }

    {:noreply, %{state | tools: Map.put(state.tools, tool_slug, updated)}}
  end

  defp init_tool_state do
    %{
      ema: MovingAverage.ema_init(@ema_window),
      ema_std: MovingAverage.ema_init(@ema_window),
      recent_values: :queue.new(),
      anomaly_count: 0
    }
  end
end
```

The EMA-based approach provides lightweight, adaptive monitoring that tracks trends across all 157 OSINT tools with minimal memory overhead, alerting operators to performance degradation before it impacts user experience.

## Cross-References

- [Time Series](/glossary/time-series/) - Data type analyzed with moving averages
- [Telemetry](/glossary/telemetry/) - Platform metric collection feeding moving average calculations
- **Outlier** - Anomalies detected relative to moving average baselines
- [IQR](/glossary/iqr/) - Complementary statistical measure for variability
- **P95** - Percentile metric often tracked alongside moving averages

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
