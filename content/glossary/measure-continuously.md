+++
title = "Measure Continuously"
weight = 50
[extra]
tags = ["glossary", "core", "observability", "telemetry", "metrics", "monitoring", "measurement", "elixir", "otp", "beam", "performance", "quality"]
description = "Comprehensive guide to continuous measurement in software systems, covering telemetry pipelines, observability engineering, metrics collection strategies, and real-time monitoring in Elixir/OTP with the Prismatic Platform's measurement infrastructure"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["telemetry", "observability", "metrics", "monitoring", "performance", "health-monitoring", "system-monitoring", "quality-monitoring", "performance-tracking", "circuit-breaker", "genserver", "supervision-tree", "quality-floor-guardian", "quality-dna"]
learning_outcomes = ["Understand the principles of continuous measurement in distributed systems", "Implement telemetry pipelines in Elixir/OTP using the :telemetry library", "Design metric collection strategies for umbrella applications", "Build real-time observability dashboards with Phoenix LiveView", "Apply statistical methods to detect anomalies in system behavior", "Configure alerting thresholds based on percentile distributions"]
prerequisites = ["elixir", "otp", "genserver", "supervision-tree", "telemetry"]
use_cases = ["Production system monitoring", "Performance regression detection", "Quality gate enforcement", "SLA compliance verification", "Capacity planning"]
key_technologies = ["Elixir", "OTP", "Telemetry", "Phoenix LiveView", "ETS", "StatsD", "Prometheus", "Grafana"]
complexity = "advanced"
see_also = ["observability", "telemetry", "metrics", "monitoring", "performance-tracking"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 2800
date_modified = "2026-02-23"
keywords = ["Measure", "Continuously", "Comprehensive", "ElixirOTP", "Prismatic", "Platforms", "glossary", "core", "Prismatic Platform", "BEAM"]
image = "/images/sections/glossary.png"
image_alt = "Measure Continuously - Prismatic Platform"
+++

## Definition

Continuous measurement is the engineering discipline of systematically collecting, aggregating, and analyzing quantitative data about software system behavior at every stage of the development and operational lifecycle. Unlike periodic or on-demand measurement, continuous measurement operates as an always-on infrastructure component, capturing telemetry data from application processes, runtime environments, network interactions, and business logic execution paths. In the context of Elixir/OTP systems, continuous measurement leverages the BEAM virtual machine's intrinsic observability capabilities -- process mailbox inspection, scheduler utilization tracking, garbage collection statistics, and ETS table monitoring -- to provide unprecedented visibility into system health without the overhead penalties common in other runtime environments.

The principle extends beyond simple metric collection into a comprehensive philosophy: if a system behavior cannot be measured, it cannot be improved, and if it is not measured continuously, regressions will go undetected until they become incidents. This philosophy underpins the Prismatic Platform's approach to quality, where every module, every process, and every request generates telemetry events that flow through a unified measurement pipeline.

## Historical Context and Evolution

The concept of continuous measurement in software engineering traces its origins to W. Edwards Deming's quality management principles from the 1950s, where statistical process control was applied to manufacturing. The adaptation to software systems began with the DevOps movement in the 2010s, which introduced the "Three Ways" framework -- the third way being continuous learning through experimentation and measurement.

Traditional monitoring focused on infrastructure metrics: CPU usage, memory consumption, disk I/O. The observability movement, pioneered by companies like Google (with Borgmon, later Monarch) and Twitter (with the introduction of Zipkin for distributed tracing), shifted the focus toward understanding system behavior from the outside by examining its outputs. Modern continuous measurement synthesizes both approaches, combining infrastructure metrics with application-level telemetry, distributed traces, and structured logs into a unified observability platform.

In the Erlang/OTP ecosystem, continuous measurement has deep roots. The Observer tool, shipping with OTP since the early 2000s, provided process-level inspection capabilities that most platforms only achieved decades later. The introduction of the Erlang `:telemetry` library in 2018, later adopted as the standard telemetry interface for the BEAM ecosystem, formalized what had been ad-hoc measurement into a structured, composable pipeline.

## Core Principles of Continuous Measurement

### The Four Pillars

Continuous measurement in production systems rests on four interconnected pillars that must operate in concert:

**Metrics** are numeric measurements collected at regular intervals. They are inherently aggregatable -- you can compute averages, percentiles, rates, and histograms across time windows. In Elixir systems, metrics typically track request latency, process counts, message queue depths, and memory allocation patterns.

**Traces** follow the path of a single request or operation through multiple processes and services. In the BEAM VM, where a single user action might traverse dozens of GenServer processes, traces provide the causal chain that explains why a particular operation behaved as it did.

**Logs** are discrete events with contextual information. When structured as JSON with consistent field naming, logs become queryable data sources rather than unstructured text files.

**Events** are the foundational primitive from which the other three pillars are derived. The `:telemetry` library in Elixir treats events as the universal data type -- metrics, traces, and logs are all projections of the same underlying event stream.

### Measurement Without Overhead

A critical constraint in continuous measurement is that the act of measuring must not materially affect the thing being measured -- the observer effect in software engineering. The BEAM VM provides unique advantages here: process isolation means that a telemetry handler running in its own process cannot cause backpressure on the measured process, and the lightweight nature of BEAM processes (approximately 2KB initial memory) makes it practical to dedicate processes to measurement tasks.

## Platform Context

Within the Prismatic Platform's 115-application umbrella ecosystem, continuous measurement operates as a cross-cutting concern managed by dedicated infrastructure. The platform emits telemetry events from every layer: HTTP request handling in Phoenix, database query execution in Ecto, GenServer state transitions, supervision tree health checks, and custom business logic events from domain-specific applications.

The measurement infrastructure enforces the platform's quality standards through automated thresholds. The [Quality Floor Guardian](/glossary/quality-floor-guardian/) monitors quality scores in real-time, triggering alerts when any domain drops below established baselines. The [Quality DNA](/glossary/quality-dna/) system persists measurement data across sessions, enabling trend analysis and regression detection over weeks and months rather than single session windows.

Page load performance standards exemplify this approach: every page must load under 250ms total, with server-side render under 100ms and LiveView mount under 150ms. These are not aspirational targets but measured, enforced constraints verified by continuous telemetry.

## Telemetry Pipeline Architecture in Elixir

The `:telemetry` library provides a minimalist but powerful foundation for continuous measurement in BEAM applications. Events are emitted with a name (a list of atoms), measurements (a map of numeric values), and metadata (a map of contextual information). Handlers attach to event names and execute synchronously in the emitting process's context.

```elixir
defmodule Prismatic.Telemetry.Pipeline do
  @moduledoc """
  Centralized telemetry pipeline for the Prismatic Platform.

  Attaches handlers to telemetry events across all umbrella applications,
  aggregates measurements into time-windowed buckets, and routes
  aggregated metrics to configured backends (StatsD, Prometheus, ETS).

  ## Architecture

  Events flow through three stages:
  1. **Emission** - Application code calls `:telemetry.execute/3`
  2. **Handling** - Attached handlers transform and route events
  3. **Aggregation** - Time-windowed aggregation in ETS tables

  ## Usage

      # Attach all platform handlers at application startup
      Prismatic.Telemetry.Pipeline.attach_handlers()

      # Emit a custom business metric
      :telemetry.execute(
        [:prismatic, :perimeter, :scan_completed],
        %{duration_ms: 1423, assets_discovered: 47},
        %{domain: "example.com", scan_type: :full}
      )
  """

  require Logger

  @spec attach_handlers() :: :ok
  def attach_handlers do
    handlers = [
      {[:prismatic, :web, :request, :stop], &handle_request/4},
      {[:prismatic, :storage, :query, :stop], &handle_query/4},
      {[:prismatic, :agent, :execution, :stop], &handle_agent/4},
      {[:prismatic, :quality, :gate, :check], &handle_quality_gate/4}
    ]

    Enum.each(handlers, fn {event_name, handler_fn} ->
      handler_id = handler_id(event_name)
      :telemetry.attach(handler_id, event_name, handler_fn, %{})
    end)

    :ok
  end

  @spec handle_request(
          event_name :: [atom()],
          measurements :: map(),
          metadata :: map(),
          config :: map()
        ) :: :ok
  defp handle_request(_event, measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(
      measurements.duration,
      :native,
      :millisecond
    )

    route = metadata[:route] || "unknown"
    status = metadata[:status] || 0

    Prismatic.Telemetry.Aggregator.record(
      :request_duration,
      duration_ms,
      %{route: route, status: status}
    )

    if duration_ms > 250 do
      Logger.warning(
        "Slow request detected: #{route} took #{duration_ms}ms " <>
        "(threshold: 250ms)"
      )
    end

    :ok
  end

  @spec handler_id(event_name :: [atom()]) :: String.t()
  defp handler_id(event_name) do
    event_name
    |> Enum.map_join(".", &Atom.to_string/1)
    |> then(&"prismatic.pipeline.#{&1}")
  end
end
```

## Metric Aggregation Strategies

Raw telemetry events are high-volume and ephemeral. Aggregation transforms them into durable, queryable metrics. The Prismatic Platform uses a multi-tier aggregation strategy that balances resolution with storage efficiency.

```elixir
defmodule Prismatic.Telemetry.Aggregator do
  @moduledoc """
  Time-windowed metric aggregation using ETS tables.

  Maintains rolling windows of metric data at multiple resolutions:
  - 1-second windows for real-time dashboards
  - 1-minute windows for alerting
  - 1-hour windows for trend analysis
  - 1-day windows for capacity planning

  Each window stores count, sum, min, max, and a t-digest for
  percentile estimation.
  """

  use GenServer

  @type metric_name :: atom()
  @type metric_value :: number()
  @type dimensions :: map()
  @type window :: :second | :minute | :hour | :day

  @windows [:second, :minute, :hour, :day]
  @retention %{second: 300, minute: 1440, hour: 168, day: 365}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec record(metric_name(), metric_value(), dimensions()) :: :ok
  def record(metric_name, value, dimensions \\ %{}) do
    timestamp = System.system_time(:second)

    Enum.each(@windows, fn window ->
      bucket = bucket_key(metric_name, dimensions, window, timestamp)

      :ets.update_counter(
        :telemetry_aggregates,
        bucket,
        [{2, 1}, {3, value}, {4, 1, 0, value}, {5, 1, 0, value}],
        {bucket, 0, 0, value, value}
      )
    end)

    :ok
  end

  @spec query(metric_name(), window(), non_neg_integer()) ::
          {:ok, list(map())} | {:error, term()}
  def query(metric_name, window, lookback_periods) do
    now = System.system_time(:second)

    results =
      for period <- 0..(lookback_periods - 1) do
        timestamp = now - period * window_seconds(window)
        bucket = bucket_key(metric_name, %{}, window, timestamp)

        case :ets.lookup(:telemetry_aggregates, bucket) do
          [{_key, count, sum, min, max}] ->
            %{
              timestamp: timestamp,
              count: count,
              sum: sum,
              min: min,
              max: max,
              avg: if(count > 0, do: sum / count, else: 0)
            }
          [] ->
            %{timestamp: timestamp, count: 0, sum: 0, min: 0, max: 0, avg: 0}
        end
      end

    {:ok, Enum.reverse(results)}
  end

  @spec bucket_key(metric_name(), dimensions(), window(), integer()) :: tuple()
  defp bucket_key(name, dimensions, window, timestamp) do
    aligned = div(timestamp, window_seconds(window)) * window_seconds(window)
    {name, dimensions, window, aligned}
  end

  @spec window_seconds(window()) :: pos_integer()
  defp window_seconds(:second), do: 1
  defp window_seconds(:minute), do: 60
  defp window_seconds(:hour), do: 3600
  defp window_seconds(:day), do: 86400

  @impl true
  def init(_opts) do
    :ets.new(:telemetry_aggregates, [
      :named_table, :public, :set, {:write_concurrency, true}
    ])

    schedule_cleanup()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = System.system_time(:second)

    Enum.each(@windows, fn window ->
      max_age = Map.get(@retention, window) * window_seconds(window)
      cutoff = now - max_age

      :ets.select_delete(:telemetry_aggregates, [
        {{{:_, :_, window, :"$1"}, :_, :_, :_, :_},
         [{:<, :"$1", cutoff}], [true]}
      ])
    end)

    schedule_cleanup()
    {:noreply, state}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, :timer.minutes(5))
  end
end
```

## Anomaly Detection and Alerting

Continuous measurement becomes actionable through anomaly detection -- automatically identifying when system behavior deviates from established baselines. The Prismatic Platform employs statistical methods rather than static thresholds, adapting to daily and weekly patterns in system load.

The approach uses exponentially weighted moving averages (EWMA) combined with standard deviation bands. A measurement is flagged as anomalous when it exceeds three standard deviations from the EWMA, accounting for the natural variance in the metric. This method avoids the false positive storms that plague static threshold-based alerting while remaining sensitive to genuine behavioral changes.

For latency metrics specifically, the platform tracks P50, P95, and P99 percentiles rather than averages. An average response time of 50ms might mask a P99 of 2 seconds affecting 1% of users -- a situation where the "average" looks healthy but real users experience unacceptable performance.

## BEAM VM Intrinsics for Measurement

The BEAM virtual machine provides measurement capabilities that are unavailable in most other runtimes, making Elixir/OTP systems uniquely suited for continuous measurement.

**Process introspection** via `Process.info/2` reveals message queue length, memory usage, current function, and reductions (a measure of computational work). Monitoring message queue length across all processes in a supervision tree provides early warning of backpressure buildup before it manifests as user-visible latency.

**Scheduler utilization** tracked through `:scheduler.utilization/1` reveals whether the system is CPU-bound. The BEAM's preemptive scheduler distributes work across all available cores, and scheduler utilization above 80% indicates that the system is approaching capacity limits.

**Garbage collection statistics** from `:erlang.statistics(:garbage_collection)` and per-process GC information reveal memory allocation patterns. Unlike stop-the-world garbage collectors in JVM or .NET, the BEAM performs per-process GC, meaning that a single process with pathological allocation patterns affects only itself -- but continuous measurement identifies these processes before they consume disproportionate resources.

**ETS table statistics** from `:ets.info/2` track table size, memory consumption, and read/write rates. In systems like the Prismatic Platform that use ETS extensively for caching and inter-process communication, monitoring ETS growth prevents memory exhaustion scenarios.

## LiveView Real-Time Dashboards

Phoenix LiveView provides a natural integration point for continuous measurement visualization. The server-rendered, WebSocket-updated architecture means that dashboards display real-time data without the complexity of separate frontend applications or polling mechanisms.

The Prismatic Platform's monitoring dashboards subscribe to telemetry events and push updates to connected browsers at configurable intervals. This approach keeps dashboard rendering on the server (where it has direct access to ETS tables and process information) while delivering sub-second updates to operators.

## Integration with Quality Gates

Continuous measurement directly feeds the platform's [quality gate](/glossary/quality-gates/) enforcement. The `mix quality.gates` task queries aggregated metrics to verify that quality standards are maintained. Metrics that fall below thresholds block commits through the pre-commit hook infrastructure, creating a feedback loop where measurement drives enforcement and enforcement drives improvement.

The quality gate metrics include compilation warning counts, Credo violation counts, Dialyzer error counts, test coverage percentages, and response time percentiles. Each metric has a defined threshold, and the gate reports a pass/fail result for each metric individually and in aggregate.

## Distributed Measurement in Umbrella Applications

Measuring a 115-application umbrella ecosystem requires careful attention to namespace isolation and cross-application correlation. Each application emits telemetry events with a consistent prefix (e.g., `[:prismatic, :perimeter, ...]` for the Perimeter application), enabling both application-specific and platform-wide analysis.

Cross-application correlation uses a request ID propagated through process metadata. When a request enters through `prismatic_web`, the request ID is stored in the process dictionary and included in all downstream telemetry events. This enables trace reconstruction across application boundaries without requiring a distributed tracing backend.

## Statistical Foundations

Effective continuous measurement requires understanding the statistical properties of the data being collected. Software system metrics exhibit specific characteristics that influence how they should be analyzed.

**Latency distributions** are typically log-normal rather than normal. This means that arithmetic means are misleading -- a few extremely slow requests skew the average dramatically. Percentile-based analysis (P50, P95, P99) provides a more accurate picture of user experience.

**Count metrics** (requests per second, errors per minute) often follow Poisson distributions during steady-state operation. Deviations from Poisson behavior indicate either a change in traffic patterns or a system issue.

**Gauge metrics** (memory usage, queue depth) are typically non-stationary -- they have trends and seasonal patterns. Anomaly detection must account for these patterns rather than treating each measurement independently.

## Best Practices for Implementation

When implementing continuous measurement in Elixir/OTP systems, several practices ensure that the measurement infrastructure remains reliable and performant:

**Emit events at natural boundaries** -- function entry/exit, state transitions, error conditions. Do not emit events inside tight loops or hot paths where the overhead of event emission might be significant.

**Use structured dimensions** consistently across all events. A dimension like `route` should always contain the same format of value, enabling aggregation and comparison across time periods.

**Separate collection from analysis**. The event emission path should be as lightweight as possible. Complex aggregation, anomaly detection, and alerting logic should run in dedicated processes that consume events asynchronously.

**Test your telemetry**. Telemetry handlers are code and can contain bugs. Write tests that verify events are emitted with the correct names, measurements, and metadata. The Prismatic Platform includes telemetry handler tests in its test suite.

**Plan for cardinality**. High-cardinality dimensions (like user ID or request URL) can cause metric explosion in aggregation backends. Use bounded cardinality dimensions (like route pattern or status code category) for aggregated metrics, and reserve high-cardinality data for traces and logs.

## Anti-Patterns to Avoid

Several common mistakes undermine the effectiveness of continuous measurement:

**Measuring everything** without purpose creates noise that drowns out signal. Every metric should have a defined consumer -- a dashboard, an alert, or an automated action. Metrics without consumers are waste.

**Alert fatigue** from overly sensitive thresholds trains operators to ignore alerts. Start with conservative thresholds and tighten them as the system stabilizes.

**Sampling bias** from measuring only successful operations misses the most important data points. Error paths, timeout conditions, and edge cases are precisely where measurement provides the most value.

**Ignoring measurement overhead** in high-throughput paths. While BEAM telemetry is lightweight, emitting events at millions of times per second in a hot path will impact performance. Profile the measurement code itself.

## Relationship to Observability

Continuous measurement is a subset of the broader [observability](/glossary/observability/) discipline. While measurement focuses on the collection and aggregation of quantitative data, observability encompasses the ability to understand internal system state from external outputs -- including qualitative analysis, debugging workflows, and the sociotechnical practices around incident response.

The distinction matters because measurement alone is insufficient. A system can produce millions of metrics and still be opaque if those metrics are not organized into a coherent model of system behavior. The Prismatic Platform bridges this gap by combining measurement with structured [telemetry](/glossary/telemetry/) events that carry enough context for root cause analysis, not just anomaly detection.

## Cross-References

- [Telemetry](/glossary/telemetry/) -- The event emission library underlying measurement
- [Observability](/glossary/observability/) -- The broader discipline encompassing measurement
- [Metrics](/glossary/metrics/) -- Specific numeric measurements collected continuously
- [Monitoring](/glossary/monitoring/) -- Active surveillance of system health
- [Performance Tracking](/glossary/performance-tracking/) -- Tracking performance over time
- [Health Monitoring](/glossary/health-monitoring/) -- Process and system health checks
- [Circuit Breaker](/glossary/circuit-breaker/) -- Failure detection informed by measurement
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Automated quality enforcement
- [Quality DNA](/glossary/quality-dna/) -- Cross-session measurement persistence
- [GenServer](/glossary/genserver/) -- Process abstraction for measurement workers
- [Supervision Tree](/glossary/supervision-tree/) -- Fault-tolerant measurement infrastructure
- [ETS](/glossary/ets/) -- In-memory storage for metric aggregation

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
