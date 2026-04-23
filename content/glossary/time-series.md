+++
title = "Time Series"
weight = 50
[extra]
description = "Temporal data sequence indexed by timestamps, fundamental for monitoring, trend analysis, and anomaly detection"
category = "data"
related_terms = ["trend", "telemetry", "timescaledb", "monitoring"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["time series", "temporal data", "timestamps", "monitoring", "trend analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Time Series - Prismatic Platform"
+++

## Definition & Overview

A time series is an ordered sequence of data points collected or recorded at successive points in time, typically at uniform intervals. Each observation consists of a timestamp and one or more associated values, forming a temporal dataset that captures how a measured quantity changes over time. Time series data is fundamentally different from regular tabular data because the ordering of observations carries significant meaning.

Time series analysis is central to monitoring, forecasting, and anomaly detection across virtually every domain of the Prismatic Platform. From tracking OSINT tool response times and API gateway throughput to measuring quality score evolution across generations, temporal data provides the foundation for understanding system behavior, detecting drift, and making predictions about future states.

The mathematical properties of time series data, including stationarity, autocorrelation, seasonality, and trend, require specialized storage, indexing, and query strategies that differ significantly from general-purpose relational databases. This is why platforms handling high-volume temporal data often employ dedicated time-series databases or extensions like TimescaleDB that optimize for time-partitioned writes and range-based queries.

## Technical Deep Dive

Time series data in Elixir can be modeled as streams of timestamped events, leveraging the language's powerful enumeration and streaming capabilities. The key operations on time series data are ingestion, aggregation, windowing, and querying.

```elixir
defmodule PrismaticTimeSeries.DataPoint do
  @moduledoc """
  Represents a single time series observation with
  metadata support for multi-dimensional analysis.
  """

  @type t :: %__MODULE__{
    timestamp: DateTime.t(),
    metric: String.t(),
    value: float(),
    tags: map(),
    metadata: map()
  }

  @enforce_keys [:timestamp, :metric, :value]
  defstruct [:timestamp, :metric, :value, tags: %{}, metadata: %{}]
end

defmodule PrismaticTimeSeries.Window do
  @moduledoc """
  Sliding and tumbling window operations for time series
  aggregation with configurable granularity.
  """

  @spec tumbling_aggregate([DataPoint.t()], pos_integer(), (list() -> float())) :: [map()]
  def tumbling_aggregate(points, window_seconds, agg_fn) do
    points
    |> Enum.group_by(fn %{timestamp: ts} ->
      unix = DateTime.to_unix(ts)
      div(unix, window_seconds) * window_seconds
    end)
    |> Enum.sort_by(fn {window_start, _} -> window_start end)
    |> Enum.map(fn {window_start, window_points} ->
      values = Enum.map(window_points, & &1.value)
      %{
        window_start: DateTime.from_unix!(window_start),
        count: length(values),
        aggregate: agg_fn.(values)
      }
    end)
  end

  @spec moving_average([DataPoint.t()], pos_integer()) :: [DataPoint.t()]
  def moving_average(points, window_size) do
    points
    |> Enum.chunk_every(window_size, 1, :discard)
    |> Enum.map(fn chunk ->
      avg = chunk |> Enum.map(& &1.value) |> then(&(Enum.sum(&1) / length(&1)))
      last = List.last(chunk)
      %{last | value: avg, metadata: Map.put(last.metadata, :smoothed, true)}
    end)
  end
end
```

For high-volume ingestion, the platform uses batched writes with configurable flush intervals. Points are buffered in an ETS table and periodically flushed to PostgreSQL/TimescaleDB in bulk, amortizing the cost of individual inserts across hundreds or thousands of data points.

Downsampling strategies reduce storage requirements for historical data. Recent data retains full resolution (per-second), while older data is progressively aggregated into 1-minute, 5-minute, and 1-hour buckets. This continuous aggregation is handled by TimescaleDB's materialized views.

## Architecture & Implementation

The Prismatic Platform's time series architecture follows a three-tier model optimized for different access patterns:

**Hot Tier (ETS)**: The most recent data points (last 5 minutes) are held in ETS tables with `ordered_set` type for efficient range queries. This tier serves real-time dashboards and alerting with sub-millisecond latency. Data is structured as `{metric_key, timestamp, value}` tuples.

**Warm Tier (PostgreSQL/TimescaleDB)**: Data from the past 30 days lives in TimescaleDB hypertables, automatically partitioned by time. This tier handles analytical queries, aggregations, and trend analysis. Chunk intervals are tuned per metric based on write volume and typical query ranges.

**Cold Tier (Compressed Archives)**: Data older than 30 days is compressed using TimescaleDB's native compression, achieving 90-95% space reduction while remaining queryable. Access patterns shift from point lookups to range aggregations at this tier.

```sql
-- TimescaleDB hypertable for platform telemetry
CREATE TABLE platform_metrics (
  time        TIMESTAMPTZ NOT NULL,
  metric      TEXT NOT NULL,
  value       DOUBLE PRECISION NOT NULL,
  tags        JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable('platform_metrics', 'time',
  chunk_time_interval => INTERVAL '1 day');

-- Continuous aggregate for hourly rollups
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS bucket,
       metric,
       avg(value) AS avg_value,
       max(value) AS max_value,
       min(value) AS min_value,
       count(*) AS sample_count
FROM platform_metrics
GROUP BY bucket, metric;
```

## Usage in Prismatic Platform

Time series data flows through every major subsystem of the Prismatic Platform. The telemetry infrastructure built on `:telemetry` emits timestamped measurements for every significant operation, from OSINT tool execution latency to GenServer message queue depths.

```elixir
defmodule PrismaticTimeSeries.Collector do
  @moduledoc """
  Collects telemetry events and writes them as time series
  data points for historical analysis and alerting.
  """

  use GenServer

  @flush_interval_ms 5_000
  @batch_size 1_000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    buffer = :ets.new(:ts_buffer, [:ordered_set, :public, write_concurrency: true])
    attach_telemetry_handlers()
    schedule_flush()
    {:ok, %{buffer: buffer, pending: 0}}
  end

  defp attach_telemetry_handlers do
    :telemetry.attach_many("ts-collector", [
      [:prismatic, :osint, :tool, :execute],
      [:prismatic, :api, :request, :stop],
      [:prismatic, :perimeter, :scan, :complete]
    ], &handle_event/4, nil)
  end

  defp handle_event(event_name, measurements, metadata, _config) do
    point = %{
      timestamp: DateTime.utc_now(),
      metric: Enum.join(event_name, "."),
      value: Map.get(measurements, :duration, 0) / 1_000_000,
      tags: Map.take(metadata, [:tool_slug, :endpoint, :status])
    }

    :ets.insert(:ts_buffer, {{point.metric, point.timestamp}, point})
  end
end
```

The Quality DNA system tracks quality scores as time series across platform generations (Gen 1 through Gen 19), enabling trend analysis that reveals whether the platform's quality trajectory is improving, plateauing, or regressing. The Prismatic Perimeter module stores security rating histories as time series, allowing organizations to visualize their security posture evolution over time.

## Cross-References

- **Trend** - Directional pattern in time series data
- [Telemetry](/glossary/telemetry/) - Event emission framework
- [Monitoring](/glossary/monitoring/) - Operational observation systems
- [TimescaleDB](/glossary/timescaledb/) - Time series database extension
- **Z-Score** - Statistical measure for anomaly detection

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
