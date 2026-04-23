+++
title = "Z-Score"
weight = 50
[extra]
description = "Statistical measure expressing how many standard deviations a data point is from the mean, used for anomaly detection"
category = "data"
related_terms = ["variance", "standard-deviation", "anomaly-detection", "statistics"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["z-score", "standard score", "anomaly detection", "standard deviation", "statistics", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Z-Score - Prismatic Platform"
+++

## Definition & Overview

A z-score (also called a standard score) is a statistical measure that expresses how many standard deviations a data point is from the mean of its distribution. Calculated as z = (x - mean) / standard_deviation, the z-score transforms raw values into a standardized scale where the mean is 0 and the standard deviation is 1. This standardization enables meaningful comparison between values from different distributions, different scales, and different units.

Z-scores are fundamental to anomaly detection because they provide an objective, scale-independent measure of how unusual a particular observation is. In a normal distribution, approximately 68% of values fall within one standard deviation of the mean (z-score between -1 and 1), 95% within two standard deviations, and 99.7% within three. A z-score exceeding 3 (or below -3) therefore represents an observation that is highly unusual under the assumption of normality, making it a strong candidate for an anomaly.

The Prismatic Platform uses z-score calculations for multiple anomaly detection applications. In performance monitoring, response times with z-scores above 3 trigger automatic investigation. In OSINT signal analysis, confidence scores that are statistical outliers relative to their source's historical distribution receive additional scrutiny. In quality tracking, metric values that deviate significantly from historical baselines trigger quality alerts before absolute thresholds are breached, enabling proactive rather than reactive quality management.

## Technical Deep Dive

The platform implements z-score based anomaly detection with configurable thresholds:

```elixir
defmodule PrismaticAnalytics.ZScore do
  @moduledoc """
  Z-score calculation and anomaly detection with
  configurable thresholds and window sizes.
  """

  @type anomaly :: %{
    value: number(),
    z_score: float(),
    mean: float(),
    std_dev: float(),
    severity: :normal | :warning | :anomaly | :extreme,
    timestamp: DateTime.t() | nil
  }

  @warning_threshold 2.0
  @anomaly_threshold 3.0
  @extreme_threshold 4.0

  @spec calculate(number(), float(), float()) :: float()
  def calculate(value, mean, std_dev) when std_dev > 0 do
    Float.round((value - mean) / std_dev, 4)
  end

  def calculate(_value, _mean, _std_dev), do: 0.0

  @spec detect_anomaly(number(), [number()], keyword()) :: anomaly()
  def detect_anomaly(value, history, opts \\ []) when length(history) >= 2 do
    window = Keyword.get(opts, :window, length(history))
    recent = Enum.take(history, -window)

    mean = Enum.sum(recent) / length(recent)
    variance =
      recent
      |> Enum.map(fn x -> (x - mean) * (x - mean) end)
      |> Enum.sum()
      |> Kernel./(length(recent) - 1)

    std_dev = :math.sqrt(variance)
    z = calculate(value, mean, std_dev)

    %{
      value: value,
      z_score: z,
      mean: Float.round(mean, 4),
      std_dev: Float.round(std_dev, 4),
      severity: classify_severity(abs(z)),
      timestamp: Keyword.get(opts, :timestamp)
    }
  end

  @spec detect_anomalies([number()], keyword()) :: [anomaly()]
  def detect_anomalies(series, opts \\ []) when length(series) >= 10 do
    window = Keyword.get(opts, :window, 30)
    threshold = Keyword.get(opts, :threshold, @anomaly_threshold)

    series
    |> Enum.with_index()
    |> Enum.drop(window)
    |> Enum.map(fn {value, index} ->
      history = Enum.slice(series, max(0, index - window)..index - 1)
      detect_anomaly(value, history, timestamp: DateTime.utc_now())
    end)
    |> Enum.filter(fn result -> abs(result.z_score) >= threshold end)
  end

  defp classify_severity(abs_z) when abs_z >= @extreme_threshold, do: :extreme
  defp classify_severity(abs_z) when abs_z >= @anomaly_threshold, do: :anomaly
  defp classify_severity(abs_z) when abs_z >= @warning_threshold, do: :warning
  defp classify_severity(_abs_z), do: :normal
end
```

Modified z-score using median absolute deviation (MAD) for robustness against outliers:

```elixir
defmodule PrismaticAnalytics.ModifiedZScore do
  @moduledoc """
  Modified z-score using Median Absolute Deviation (MAD)
  for robust anomaly detection resistant to outliers.
  """

  @consistency_constant 0.6745

  @spec calculate(number(), [number()]) :: float()
  def calculate(value, dataset) when length(dataset) >= 3 do
    median = compute_median(dataset)
    mad = compute_mad(dataset, median)

    if mad > 0 do
      @consistency_constant * (value - median) / mad
    else
      0.0
    end
  end

  def calculate(_value, _dataset), do: 0.0

  @spec detect_outliers([number()], float()) :: [{non_neg_integer(), number(), float()}]
  def detect_outliers(dataset, threshold \\ 3.5) do
    dataset
    |> Enum.with_index()
    |> Enum.map(fn {value, index} ->
      z = calculate(value, dataset)
      {index, value, z}
    end)
    |> Enum.filter(fn {_, _, z} -> abs(z) > threshold end)
  end

  defp compute_median(values) do
    sorted = Enum.sort(values)
    n = length(sorted)
    mid = div(n, 2)

    if rem(n, 2) == 0 do
      (Enum.at(sorted, mid - 1) + Enum.at(sorted, mid)) / 2
    else
      Enum.at(sorted, mid)
    end
  end

  defp compute_mad(values, median) do
    values
    |> Enum.map(fn v -> abs(v - median) end)
    |> compute_median()
  end
end
```

## Architecture & Implementation

Z-score based anomaly detection in the platform operates through a streaming architecture:

**Online Z-Score Calculation**: Using Welford's online algorithm (from the Variance module), the platform maintains running mean and variance for each monitored metric. When a new data point arrives, the z-score is computed against the running statistics without recalculating from the full history.

**Sliding Window**: The window size determines how much history influences the baseline statistics. Short windows (30 data points) are sensitive to recent changes and detect anomalies quickly but may generate false positives during gradual shifts. Long windows (1000 data points) provide stable baselines but may miss anomalies during regime changes.

**Multi-Metric Correlation**: When multiple metrics simultaneously show anomalous z-scores, the platform treats this as a stronger signal than individual metric anomalies. For example, if both API latency and database query time show z-scores above 3 simultaneously, it strongly suggests a real performance issue rather than random variation.

**Adaptive Thresholds**: The platform adjusts anomaly thresholds based on the metric's characteristics. Metrics with naturally high variance (like OSINT tool response times, which depend on external APIs) use higher z-score thresholds (4.0) to avoid false alarms. Metrics with low natural variance (like health check response times) use standard thresholds (3.0).

## Usage in Prismatic Platform

The performance monitoring system uses z-scores to detect latency anomalies:

```elixir
defmodule PrismaticMonitoring.AnomalyDetector do
  @moduledoc """
  Real-time anomaly detection for platform metrics
  using z-score analysis with streaming updates.
  """

  use GenServer

  alias PrismaticAnalytics.ZScore
  alias PrismaticStatistics.OnlineVariance

  @check_interval_ms 10_000

  defstruct [:metrics, :thresholds]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %__MODULE__{metrics: %{}, thresholds: default_thresholds()}}
  end

  @spec report_value(String.t(), number()) :: :ok
  def report_value(metric, value) do
    GenServer.cast(__MODULE__, {:report, metric, value})
  end

  @impl true
  def handle_cast({:report, metric, value}, state) do
    online_stats =
      state.metrics
      |> Map.get(metric, OnlineVariance.new())
      |> OnlineVariance.update(value)

    z = ZScore.calculate(value, online_stats.mean, OnlineVariance.std_dev(online_stats))
    threshold = Map.get(state.thresholds, metric, 3.0)

    if abs(z) > threshold do
      :telemetry.execute(
        [:prismatic, :anomaly, :detected],
        %{z_score: z, value: value},
        %{metric: metric, severity: ZScore.classify_severity(abs(z))}
      )
    end

    {:noreply, %{state | metrics: Map.put(state.metrics, metric, online_stats)}}
  end

  @impl true
  def handle_info(:check, state) do
    schedule_check()
    {:noreply, state}
  end

  defp schedule_check do
    Process.send_after(self(), :check, @check_interval_ms)
  end

  defp default_thresholds do
    %{
      "api.latency_ms" => 3.0,
      "osint.execution_ms" => 4.0,
      "health.response_ms" => 2.5,
      "db.query_ms" => 3.0
    }
  end
end
```

Z-score anomaly detection integrates with the platform's triage system, where detected anomalies are automatically triaged by severity and routed to appropriate response channels.

## Cross-References

- [Variance](/glossary/variance/) - Statistical dispersion used in z-score calculation
- [Time Series](/glossary/time-series/) - Temporal data analyzed for anomalies
- [Trend](/glossary/trend/) - Directional patterns complementing anomaly detection
- [Monitoring](/glossary/monitoring/) - Observation systems generating z-score data
- [Triage](/glossary/triage/) - Prioritization of detected anomalies

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
