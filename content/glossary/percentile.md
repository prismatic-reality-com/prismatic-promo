+++
title = "Percentile"
weight = 50
[extra]
description = "Statistical measure indicating the value below which a given percentage of observations fall in a distribution"
category = "data-analysis"
related_terms = ["precision", "scatter-plot", "seasonality", "pivot-table", "accuracy", "telemetry"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["percentile", "statistics", "distribution", "P95", "P99", "latency", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "performance", "statistics"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Percentile - Prismatic Platform"
+++

## Definition & Overview

A percentile is a statistical measure that indicates the value below which a given percentage of observations in a dataset fall. The 95th percentile (P95), for example, is the value below which 95% of all observed data points lie. Percentiles provide a robust way to understand distribution characteristics without being skewed by extreme outliers, making them essential for performance monitoring, SLA definition, and security risk assessment.

In software engineering and platform operations, percentiles are the standard metric for latency reporting. While averages can hide problematic tail latency, percentiles expose the real user experience. A system with 10ms average latency but 500ms P99 latency has a fundamentally different quality profile than one with 15ms average and 20ms P99. The Prismatic Platform uses percentile-based metrics across its performance monitoring, security rating, and quality assessment subsystems.

Percentiles are computed using rank-based ordering. For a dataset of N values sorted in ascending order, the k-th percentile is the value at position ceil(k/100 * N). Interpolation methods (linear, lower, higher, nearest, midpoint) handle cases where the position falls between two data points. The choice of interpolation method matters for small sample sizes but converges for large datasets typical in production telemetry.

## Technical Deep Dive

The Prismatic Platform computes percentiles in several contexts: HTTP request latency monitoring (P50, P95, P99), security rating distribution (industry percentiles for Perimeter scores), OSINT tool response times, and quality score distributions across umbrella applications. Each context requires efficient online percentile computation that avoids storing every individual observation.

Exact percentile computation requires sorting all observations, which is O(N log N) in time and O(N) in space. For streaming data, approximate algorithms like t-digest, GK (Greenwald-Khanna), or DDSketch provide bounded-error percentile estimates with O(1) insertion and O(1) query after initial setup. The Prismatic Platform uses a t-digest inspired approach for telemetry data and exact computation for batch analytics.

```elixir
defmodule PrismaticPerformance.Percentile do
  @moduledoc """
  Percentile computation for performance metrics and risk scoring.
  Supports both exact and streaming approximate modes.
  """

  @type observation :: number()
  @type percentile_rank :: 1..99

  @spec compute([observation()], percentile_rank()) :: {:ok, float()} | {:error, :empty_dataset}
  def compute([], _rank), do: {:error, :empty_dataset}

  def compute(observations, rank) when rank >= 1 and rank <= 99 do
    sorted = Enum.sort(observations)
    n = length(sorted)
    position = rank / 100.0 * (n - 1)
    lower_index = floor(position)
    upper_index = ceil(position)
    fraction = position - lower_index

    value =
      if lower_index == upper_index do
        Enum.at(sorted, lower_index)
      else
        lower = Enum.at(sorted, lower_index)
        upper = Enum.at(sorted, upper_index)
        lower + fraction * (upper - lower)
      end

    {:ok, value}
  end

  @spec compute_multiple([observation()], [percentile_rank()]) ::
          {:ok, %{percentile_rank() => float()}}
  def compute_multiple(observations, ranks) do
    sorted = Enum.sort(observations)
    n = length(sorted)

    results =
      Map.new(ranks, fn rank ->
        position = rank / 100.0 * (n - 1)
        lower_index = floor(position)
        upper_index = min(ceil(position), n - 1)
        fraction = position - lower_index

        value =
          if lower_index == upper_index do
            Enum.at(sorted, lower_index)
          else
            lower = Enum.at(sorted, lower_index)
            upper = Enum.at(sorted, upper_index)
            lower + fraction * (upper - lower)
          end

        {rank, value}
      end)

    {:ok, results}
  end
end
```

For streaming percentile computation, the platform uses a digest structure that maintains a compact representation of the distribution, enabling O(1) percentile queries after each insertion.

```elixir
defmodule PrismaticPerformance.StreamingPercentile do
  @moduledoc """
  Approximate streaming percentile using a histogram-based approach.
  Suitable for high-throughput telemetry where exact computation is impractical.
  """

  defstruct [:buckets, :count, :min, :max]

  @bucket_count 1000

  @spec new() :: %__MODULE__{}
  def new do
    %__MODULE__{
      buckets: :atomics.new(@bucket_count, signed: false),
      count: 0,
      min: :infinity,
      max: :neg_infinity
    }
  end

  @spec add(%__MODULE__{}, number()) :: %__MODULE__{}
  def add(%__MODULE__{} = digest, value) do
    bucket = value_to_bucket(value)
    :atomics.add(digest.buckets, bucket, 1)

    %{digest |
      count: digest.count + 1,
      min: min(digest.min, value),
      max: max(digest.max, value)
    }
  end

  @spec query(%__MODULE__{}, 1..99) :: float()
  def query(%__MODULE__{count: count} = digest, percentile) do
    target = ceil(percentile / 100.0 * count)
    find_bucket(digest.buckets, target, 1, 0)
    |> bucket_to_value(digest.min, digest.max)
  end

  defp value_to_bucket(value) do
    min(max(round(value), 1), @bucket_count)
  end

  defp bucket_to_value(bucket, min_val, max_val) do
    range = max_val - min_val
    min_val + bucket / @bucket_count * range
  end

  defp find_bucket(buckets, target, index, cumulative) when index <= @bucket_count do
    new_cumulative = cumulative + :atomics.get(buckets, index)

    if new_cumulative >= target do
      index
    else
      find_bucket(buckets, target, index + 1, new_cumulative)
    end
  end
end
```

## Architecture & Implementation

Percentile computation in the Prismatic Platform is integrated with the telemetry subsystem. Phoenix and LiveView emit telemetry events for every request, and the platform aggregates these into percentile-based dashboards. The architecture separates collection (telemetry handlers), aggregation (sliding window buffers), and presentation (LiveView dashboards).

The security rating system in Prismatic Perimeter uses percentiles to express an organization's security posture relative to its industry. A score at the 72nd percentile means the organization scores better than 72% of peers. This relative positioning provides more actionable context than raw scores alone, as it accounts for industry-specific baselines and evolving threat landscapes.

Performance thresholds in the platform are defined in percentile terms: page load P95 must be under 250ms, LiveView mount P95 under 150ms, and health check P99 under 10ms. These percentile-based SLAs ensure that the vast majority of users experience acceptable performance, not just the average case.

## Usage in Prismatic Platform

The Prismatic Platform applies percentile analysis across performance monitoring, security ratings, and quality assessment. The telemetry pipeline computes percentiles over sliding windows, enabling real-time dashboards and alerting.

```elixir
defmodule PrismaticWeb.Telemetry.PercentileAggregator do
  @moduledoc """
  Aggregates telemetry events into percentile-based metrics
  over configurable sliding windows.
  """

  use GenServer

  @window_size_ms 60_000
  @percentiles [50, 90, 95, 99]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :telemetry.attach_many(
      "percentile-aggregator",
      [
        [:phoenix, :endpoint, :stop],
        [:prismatic, :osint, :tool, :stop],
        [:prismatic, :storage, :get]
      ],
      &handle_telemetry/4,
      nil
    )

    schedule_flush()
    {:ok, %{observations: %{}}}
  end

  defp handle_telemetry(event, measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)
    GenServer.cast(__MODULE__, {:observe, event, duration_ms, metadata})
  end

  @impl true
  def handle_cast({:observe, event, duration, _metadata}, state) do
    key = Enum.join(event, ".")
    observations = Map.update(state.observations, key, [duration], &[duration | &1])
    {:noreply, %{state | observations: observations}}
  end

  @impl true
  def handle_info(:flush, state) do
    Enum.each(state.observations, fn {key, values} ->
      {:ok, percentiles} = PrismaticPerformance.Percentile.compute_multiple(values, @percentiles)

      :telemetry.execute(
        [:prismatic, :percentile, :computed],
        percentiles,
        %{metric: key, window_ms: @window_size_ms, sample_size: length(values)}
      )
    end)

    schedule_flush()
    {:noreply, %{state | observations: %{}}}
  end

  defp schedule_flush, do: Process.send_after(self(), :flush, @window_size_ms)
end
```

## Cross-References

- **Precision** - ML metric often reported at percentile thresholds
- **Scatter Plot** - Visualization technique for percentile distributions
- **Seasonality** - Time series patterns affecting percentile baselines
- **Profiling** - Performance measurement producing percentile-analyzed data
- **Quality Floor** - Minimum threshold often defined using percentile metrics

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
