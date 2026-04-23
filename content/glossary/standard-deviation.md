+++
title = "Standard Deviation"
weight = 50
[extra]
description = "Statistical measure of data dispersion from the mean, used for anomaly detection, performance monitoring, and quality thresholds"
category = "statistics"
related_terms = ["statistics", "statistical-detection", "monitoring", "anomaly-detection", "telemetry", "threshold"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["standard deviation", "statistics", "dispersion", "anomaly detection", "glossary", "Prismatic Platform"]
tags = ["glossary", "statistics", "monitoring"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Standard Deviation - Prismatic Platform"
+++

## Definition & Overview

Standard deviation is a measure of the amount of variation or dispersion in a set of values. A low standard deviation indicates that values cluster closely around the mean, while a high standard deviation indicates that values are spread over a wide range. Mathematically, it is the square root of the variance (the average of the squared differences from the mean). Standard deviation is denoted by sigma and is expressed in the same units as the original data, making it directly interpretable.

In systems engineering, standard deviation is the foundation of anomaly detection. If a system's response time normally averages 50ms with a standard deviation of 10ms, then a response time of 100ms (5 sigma above the mean) is extremely unusual and warrants investigation. This statistical approach to monitoring avoids arbitrary thresholds by grounding alerting decisions in the system's actual observed behavior distribution.

The Prismatic Platform uses standard deviation in performance monitoring, quality scoring, and anomaly detection across all subsystems. Telemetry data from Phoenix endpoints, LiveView mounts, OSINT tool executions, and DD pipeline operations is continuously analyzed for statistical anomalies. When a metric deviates beyond configurable sigma thresholds, the monitoring system generates alerts proportional to the deviation magnitude.

## Technical Deep Dive

### Online Standard Deviation Computation

For streaming data, the platform uses Welford's online algorithm, which computes running mean and variance in a single pass without storing all values:

```elixir
defmodule PrismaticMonitoring.Statistics do
  @moduledoc """
  Online statistical computation using Welford's algorithm.
  Computes running mean, variance, and standard deviation
  from streaming telemetry data without storing all values.
  """

  @type t :: %__MODULE__{
    count: non_neg_integer(),
    mean: float(),
    m2: float(),
    min: float() | nil,
    max: float() | nil
  }

  defstruct count: 0, mean: 0.0, m2: 0.0, min: nil, max: nil

  @spec new() :: t()
  def new, do: %__MODULE__{}

  @spec update(t(), number()) :: t()
  def update(%__MODULE__{count: 0} = stats, value) do
    %{stats |
      count: 1,
      mean: value * 1.0,
      m2: 0.0,
      min: value * 1.0,
      max: value * 1.0
    }
  end

  def update(%__MODULE__{count: n, mean: mean, m2: m2, min: current_min, max: current_max}, value) do
    new_count = n + 1
    delta = value - mean
    new_mean = mean + delta / new_count
    delta2 = value - new_mean
    new_m2 = m2 + delta * delta2

    %__MODULE__{
      count: new_count,
      mean: new_mean,
      m2: new_m2,
      min: min(current_min, value * 1.0),
      max: max(current_max, value * 1.0)
    }
  end

  @spec variance(t()) :: float()
  def variance(%__MODULE__{count: n}) when n < 2, do: 0.0
  def variance(%__MODULE__{count: n, m2: m2}), do: m2 / (n - 1)

  @spec standard_deviation(t()) :: float()
  def standard_deviation(stats), do: :math.sqrt(variance(stats))

  @spec z_score(t(), number()) :: float()
  def z_score(%__MODULE__{} = stats, value) do
    sd = standard_deviation(stats)
    if sd == 0.0, do: 0.0, else: (value - stats.mean) / sd
  end

  @spec is_anomaly?(t(), number(), float()) :: boolean()
  def is_anomaly?(stats, value, sigma_threshold \\ 3.0) do
    abs(z_score(stats, value)) > sigma_threshold
  end
end
```

### Anomaly Detection with Standard Deviation

The monitoring system uses standard deviation to detect anomalous behavior:

```elixir
defmodule PrismaticMonitoring.AnomalyDetector do
  @moduledoc """
  Detects statistical anomalies in telemetry metrics
  using z-score (standard deviation) thresholds.
  """

  use GenServer

  alias PrismaticMonitoring.Statistics

  @check_interval :timer.seconds(10)

  defstruct metrics: %{}, alerts: []

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    attach_telemetry()
    schedule_check()
    {:ok, %__MODULE__{}}
  end

  @spec record(atom(), number()) :: :ok
  def record(metric_name, value) do
    GenServer.cast(__MODULE__, {:record, metric_name, value})
  end

  @impl true
  def handle_cast({:record, metric, value}, state) do
    stats = Map.get(state.metrics, metric, Statistics.new())
    updated = Statistics.update(stats, value)
    {:noreply, %{state | metrics: Map.put(state.metrics, metric, updated)}}
  end

  @impl true
  def handle_info(:check, state) do
    # Check last recorded values against statistical baselines
    schedule_check()
    {:noreply, state}
  end

  defp attach_telemetry do
    :telemetry.attach_many("anomaly-detector", [
      [:phoenix, :endpoint, :stop],
      [:prismatic, :osint, :tool, :stop],
      [:prismatic, :dd, :pipeline, :stop]
    ], &handle_event/4, nil)
  end

  def handle_event(event_name, %{duration: duration}, _metadata, _config) do
    metric = event_name |> Enum.join(".") |> String.to_atom()
    ms = System.convert_time_unit(duration, :native, :millisecond)
    record(metric, ms)
  end

  defp schedule_check, do: Process.send_after(self(), :check, @check_interval)
end
```

## Architecture & Implementation

Standard deviation computation in the platform uses Welford's online algorithm exclusively. This algorithm is numerically stable (avoiding catastrophic cancellation that affects naive sum-of-squares implementations) and memory-efficient (storing only three values regardless of data volume). The algorithm is particularly well-suited to telemetry data where values arrive as a continuous stream.

The monitoring architecture maintains per-metric statistics as GenServer state. Each metric (endpoint latency, tool execution time, pipeline duration) has its own running `Statistics` struct. When a new telemetry event arrives, the statistics are updated in O(1) time. Anomaly checks compare the latest values against the accumulated baseline.

Alert thresholds use sigma multiples: 2-sigma generates a warning, 3-sigma generates a critical alert, 4+ sigma generates an emergency. These thresholds are configurable per metric, as different metrics have different normal distributions. Response time latency might alert at 3-sigma, while error rate might alert at 2-sigma due to its higher operational impact.

## Usage in Prismatic Platform

Standard deviation is used for performance monitoring, quality scoring, and security anomaly detection:

```elixir
# Build statistics from historical data
stats = Enum.reduce(latency_history, Statistics.new(), &Statistics.update(&2, &1))

# Check if current value is anomalous
Statistics.is_anomaly?(stats, current_latency, 3.0)

# Get z-score for detailed analysis
z = Statistics.z_score(stats, current_latency)
```

## Cross-References

- **Statistics** - Broader mathematical discipline encompassing standard deviation
- **Statistical Detection** - Anomaly identification using statistical methods
- [Monitoring](@/glossary/monitoring.md) - Infrastructure consuming standard deviation calculations
- **Threshold** - Decision boundary configured using sigma multiples

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
