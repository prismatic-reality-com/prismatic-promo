+++
title = "System Monitoring"
weight = 50
[extra]
tags = ["glossary", "architecture", "operations", "monitoring", "observability", "Prometheus", "Grafana", "telemetry", "BEAM", "metrics"]
description = "Comprehensive guide to system monitoring infrastructure, Prometheus/Grafana integration, BEAM :observer diagnostics, and telemetry-driven observability in distributed Elixir/OTP platforms"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
audience = ["platform engineers", "SRE", "DevOps engineers", "senior developers"]
domain = "architecture"
related_patterns = ["three pillars of observability", "USE method", "RED method", "SLO-based alerting", "structured logging"]
see_also = ["performance-tracking", "quality-monitoring", "health-monitoring", "system-optimization"]
acronyms = ["SLO = Service Level Objective", "SLI = Service Level Indicator", "USE = Utilization Saturation Errors", "RED = Rate Errors Duration"]
standards = ["OpenTelemetry", "Prometheus exposition format", "JSON structured logging"]
tools = ["Prometheus", "Grafana", ":observer", ":etop", ":recon", "telemetry"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Fly.io"]
related_terms = ["monitoring", "telemetry", "health-monitoring", "beam-vm", "beam", "otp", "genserver", "performance", "performance-tracking", "quality-monitoring", "supervision-tree", "fault-tolerance", "circuit-breaker"]
learning_outcomes = ["Design comprehensive monitoring infrastructure for distributed Elixir/OTP systems", "Implement Prometheus metrics export with telemetry_metrics_prometheus_core", "Use BEAM :observer and :etop for runtime diagnostics", "Build custom telemetry handlers for business-specific metrics", "Establish alerting hierarchies and on-call escalation patterns"]
prerequisites = ["Basic understanding of Elixir/OTP processes and supervision", "Familiarity with time-series databases and metric concepts", "Knowledge of HTTP and network protocols"]
key_concepts = ["Three pillars of observability", "Telemetry event pipeline", "Prometheus metric types", "BEAM introspection tools", "Alert fatigue prevention", "Dashboard design principles"]
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
tldr = "System monitoring encompasses the continuous collection, aggregation, visualization, and alerting on metrics, logs, and traces across distributed Elixir/OTP systems, leveraging BEAM-native introspection and modern observability tooling."
word_count = 1683
date_modified = "2026-02-23"
keywords = ["System", "Monitoring", "Comprehensive", "PrometheusGrafana", "BEAM", "ElixirOTP", "glossary", "architecture", "Prismatic Platform", "Prometheus"]
image = "/images/sections/glossary.png"
image_alt = "System Monitoring - Prismatic Platform"
+++

## Definition

System monitoring is the practice of continuously collecting, aggregating, analyzing, and acting upon operational data from a running software system. In distributed Elixir/OTP platforms, monitoring encompasses three complementary domains: metrics (numerical measurements over time), logs (discrete event records), and traces (request-scoped execution paths). Together, these form the "three pillars of observability" that provide the operational visibility necessary for maintaining system reliability, diagnosing issues, and driving capacity planning.

The BEAM virtual machine distinguishes Elixir/OTP monitoring from other ecosystems through its rich built-in introspection capabilities. Where most language runtimes require external agents or instrumentation libraries to expose internal state, the BEAM provides native access to process statistics, scheduler utilization, memory allocation, garbage collection metrics, and message passing patterns. This intrinsic observability makes BEAM-based systems uniquely well-suited for deep monitoring without the overhead or blind spots common in other platforms.

## Historical Context and Evolution

System monitoring has evolved through four distinct generations. The first generation (1990s) relied on SNMP polling and simple threshold-based alerts -- ping a server, check if a metric exceeds a static limit, page someone. Tools like Nagios and Zabbix dominated this era.

The second generation (2000s-2010s) introduced time-series databases and statistical analysis. Graphite, StatsD, and later Prometheus brought metric collection and visualization to a new level of sophistication. The key innovation was moving from threshold-based alerting to statistical anomaly detection -- alerting when a metric deviates from its historical pattern rather than when it crosses a fixed limit.

The third generation (2010s) added distributed tracing and structured logging. Zipkin, Jaeger, and OpenTelemetry enabled request-scoped tracing across service boundaries. The ELK stack (Elasticsearch, Logstash, Kibana) and its successors brought structured log analysis into the monitoring fold.

The fourth generation (2020s-present) integrates all three pillars into unified observability platforms, adds machine learning for anomaly detection, and emphasizes developer experience through SLO-based alerting and context-rich dashboards. The Elixir ecosystem's `telemetry` library, released in 2019, established the standard for instrumentation-first monitoring in BEAM applications.

## Platform Context

The Prismatic Platform implements comprehensive monitoring across its 115 umbrella applications through a layered architecture.

At the foundation, the Elixir `:telemetry` library provides the event bus through which all platform components emit structured measurements. Every significant operation -- database queries, HTTP requests, GenServer calls, pipeline executions, agent operations -- emits telemetry events with standardized metadata.

The **Quality Floor Guardian** consumes these telemetry events to maintain its 13-domain quality assessment. When any domain degrades below its threshold, the guardian emits its own telemetry events that trigger alerts and automated healing cycles.

The platform's **Autoheal system** monitors for quality degradation patterns and automatically triggers corrective actions. The **Quality DNA** system tracks quality metrics across sessions, providing longitudinal monitoring that detects slow degradation trends invisible in point-in-time snapshots.

For production deployments on Fly.io, the platform exports Prometheus-format metrics consumed by external Grafana dashboards, providing the operational visibility needed for SRE practices.

## The Three Pillars of Observability

### Metrics: Numerical Measurements Over Time

Metrics are the most efficient observability signal -- they compress system behavior into numerical values that can be aggregated, compared, and alerted upon with minimal storage and computation. The Prismatic Platform tracks four types of metrics.

**Counters** record monotonically increasing values: total requests processed, total errors, total bytes transferred. Counters are the most fundamental metric type and form the basis for rate calculations.

**Gauges** record point-in-time values: current memory usage, current process count, current connection pool size. Gauges capture instantaneous state and are essential for capacity monitoring.

**Histograms** record value distributions: request latency percentiles, response size distributions, batch processing durations. Histograms enable percentile-based alerting (P95, P99) that captures tail latency invisible to averages.

**Summaries** precompute percentiles client-side, trading precision for efficiency. They are useful when the monitoring backend cannot compute percentiles from raw histograms.

### Logs: Discrete Event Records

Structured logging in the Prismatic Platform follows a JSON format with standardized fields: timestamp, level, module, function, message, and arbitrary metadata. The platform uses Elixir's built-in `Logger` with custom backends that add correlation IDs for request tracing and component identification for filtering.

### Traces: Request-Scoped Execution Paths

Distributed traces follow a request through multiple processes and applications, capturing the call graph with timing at each hop. The Prismatic Platform instruments inter-process calls, Ecto queries, and HTTP requests with trace context propagation, enabling end-to-end latency analysis.

## Telemetry-Driven Monitoring Architecture

The Elixir `:telemetry` library is the cornerstone of monitoring in the Prismatic Platform. It provides a lightweight, extensible event bus that decouples instrumentation from monitoring backends.

```elixir
defmodule Prismatic.Monitoring.TelemetryHandler do
  @moduledoc """
  Central telemetry handler that attaches to platform-wide telemetry events
  and routes measurements to appropriate monitoring backends. Handles
  Ecto queries, Phoenix requests, GenServer operations, and custom
  platform events with structured metric emission.
  """

  require Logger

  @type metric_backend :: :prometheus | :statsd | :console | :ets
  @type handler_config :: %{
          backend: metric_backend(),
          prefix: String.t(),
          tags: map()
        }

  @spec attach_all(handler_config()) :: :ok
  def attach_all(config \\ default_config()) do
    handlers = [
      {[:prismatic, :repo, :query], &handle_query/4, config},
      {[:prismatic, :endpoint, :stop], &handle_request/4, config},
      {[:prismatic, :pipeline, :stop], &handle_pipeline/4, config},
      {[:prismatic, :agent, :execute], &handle_agent/4, config},
      {[:prismatic, :health, :probe], &handle_health_probe/4, config},
      {[:prismatic, :migration, :phase_complete], &handle_migration/4, config},
      {[:prismatic, :cache, :hit], &handle_cache/4, config},
      {[:prismatic, :cache, :miss], &handle_cache/4, config}
    ]

    Enum.each(handlers, fn {event, handler_fn, cfg} ->
      handler_id = "prismatic_monitoring_#{Enum.join(event, "_")}"
      :telemetry.attach(handler_id, event, handler_fn, cfg)
    end)

    Logger.info("Attached #{length(handlers)} telemetry handlers")
    :ok
  end

  @spec handle_query(
          :telemetry.event_name(),
          :telemetry.event_measurements(),
          :telemetry.event_metadata(),
          handler_config()
        ) :: :ok
  def handle_query(_event, measurements, metadata, config) do
    duration_ms = System.convert_time_unit(
      measurements.total_time || 0, :native, :millisecond
    )

    emit_histogram(config, "ecto.query.duration_ms", duration_ms, %{
      source: metadata[:source] || "unknown",
      repo: metadata[:repo] |> to_string()
    })

    if duration_ms > 100 do
      Logger.warning(
        "Slow query detected: #{duration_ms}ms on #{metadata[:source]}",
        duration_ms: duration_ms,
        query: metadata[:query]
      )
    end

    :ok
  end

  @spec handle_request(
          :telemetry.event_name(),
          :telemetry.event_measurements(),
          :telemetry.event_metadata(),
          handler_config()
        ) :: :ok
  def handle_request(_event, measurements, metadata, config) do
    duration_ms = System.convert_time_unit(
      measurements.duration || 0, :native, :millisecond
    )

    emit_histogram(config, "http.request.duration_ms", duration_ms, %{
      method: metadata[:method] || "GET",
      route: metadata[:route] || "unknown",
      status: metadata[:status] || 200
    })

    emit_counter(config, "http.request.total", 1, %{
      status_class: div(metadata[:status] || 200, 100) * 100
    })

    :ok
  end

  @spec handle_pipeline(
          :telemetry.event_name(),
          :telemetry.event_measurements(),
          :telemetry.event_metadata(),
          handler_config()
        ) :: :ok
  def handle_pipeline(_event, measurements, metadata, config) do
    emit_histogram(config, "pipeline.execution.duration_ms",
      measurements[:duration_ms] || 0, %{
        pipeline: metadata[:pipeline_name] || "unknown",
        status: metadata[:status] || :ok
      })

    :ok
  end

  @spec handle_agent(
          :telemetry.event_name(),
          :telemetry.event_measurements(),
          :telemetry.event_metadata(),
          handler_config()
        ) :: :ok
  def handle_agent(_event, measurements, metadata, config) do
    emit_histogram(config, "agent.execution.duration_ms",
      measurements[:duration_ms] || 0, %{
        agent: metadata[:agent_name] || "unknown",
        tier: metadata[:tier] || "unknown"
      })

    emit_counter(config, "agent.execution.total", 1, %{
      result: metadata[:result] || :ok
    })

    :ok
  end

  defp handle_health_probe(_event, measurements, metadata, config) do
    emit_histogram(config, "health.probe.duration_us",
      measurements[:duration] || 0, %{
        probe: metadata[:probe],
        status: metadata[:status]
      })

    :ok
  end

  defp handle_migration(_event, measurements, metadata, config) do
    emit_counter(config, "migration.phase.complete", 1, %{
      name: metadata[:name],
      phase: metadata[:phase]
    })

    emit_histogram(config, "migration.phase.duration_ms",
      measurements[:duration_ms] || 0, %{
        name: metadata[:name],
        phase: metadata[:phase]
      })

    :ok
  end

  defp handle_cache(_event, _measurements, metadata, config) do
    event_type = if metadata[:hit], do: "hit", else: "miss"
    emit_counter(config, "cache.#{event_type}", 1, %{
      cache: metadata[:cache] || "default"
    })

    :ok
  end

  defp emit_histogram(config, name, value, tags) do
    full_name = "#{config.prefix}.#{name}"
    merged_tags = Map.merge(config.tags, tags)
    do_emit(config.backend, :histogram, full_name, value, merged_tags)
  end

  defp emit_counter(config, name, value, tags) do
    full_name = "#{config.prefix}.#{name}"
    merged_tags = Map.merge(config.tags, tags)
    do_emit(config.backend, :counter, full_name, value, merged_tags)
  end

  defp do_emit(:console, type, name, value, tags) do
    Logger.debug("Metric [#{type}] #{name}=#{value} #{inspect(tags)}")
  end

  defp do_emit(:ets, type, name, value, tags) do
    key = {name, tags}

    case type do
      :counter ->
        :ets.update_counter(:prismatic_metrics, key, {2, value}, {key, 0})

      :histogram ->
        :ets.insert(:prismatic_metrics, {key, value, System.monotonic_time()})
    end
  end

  defp do_emit(_backend, _type, _name, _value, _tags), do: :ok

  defp default_config do
    %{
      backend: :ets,
      prefix: "prismatic",
      tags: %{environment: "dev", node: node() |> to_string()}
    }
  end
end
```

## Prometheus Integration

Prometheus provides the industry-standard metric collection and storage backend for the Prismatic Platform's production monitoring.

### Metric Export Architecture

The platform uses `telemetry_metrics_prometheus_core` to transform Elixir telemetry events into Prometheus-format metrics. A dedicated `/metrics` endpoint serves the Prometheus scrape target, exposing all platform metrics in the standard exposition format.

Key metric families exported include: `prismatic_http_request_duration_milliseconds` (histogram), `prismatic_ecto_query_duration_milliseconds` (histogram), `prismatic_beam_memory_bytes` (gauge), `prismatic_beam_process_count` (gauge), `prismatic_agent_execution_total` (counter), `prismatic_pipeline_execution_duration_milliseconds` (histogram), and `prismatic_quality_score` (gauge).

### Grafana Dashboard Design

The Prismatic Platform's Grafana dashboards follow the USE method (Utilization, Saturation, Errors) and RED method (Rate, Errors, Duration) for different component types.

For infrastructure components (BEAM VM, database connections, ETS tables), USE dashboards show utilization (percentage of capacity in use), saturation (queue depths and waiting operations), and errors (failed operations and timeouts).

For service components (HTTP endpoints, pipeline executions, agent operations), RED dashboards show rate (requests per second), error rate (percentage of requests failing), and duration (latency percentiles at P50, P95, P99).

## BEAM :observer and Runtime Diagnostics

The BEAM virtual machine provides powerful built-in tools for runtime diagnostics that complement external monitoring.

### :observer

The `:observer` application provides a GUI for inspecting running BEAM systems. It displays system overview (CPU, memory, IO), process listing with sorting by memory, reductions, or message queue length, ETS table inspector, application tree visualizer, and tracing capabilities. While `:observer` is primarily used in development, it can connect to remote production nodes through Erlang distribution for live debugging.

### :etop

The `:etop` module provides a command-line interface similar to Unix `top` for BEAM processes. It shows per-process CPU usage, memory consumption, and message queue length, enabling quick identification of resource-heavy processes without GUI access.

### :recon

The `:recon` library (third-party but widely adopted) extends BEAM diagnostics with production-safe tools: `recon:proc_count/2` identifies top processes by attribute, `recon:bin_leak/1` detects binary memory leaks, `recon:info/1` provides detailed process inspection, and `recon_trace` offers production-safe tracing with rate limiting.

```elixir
defmodule Prismatic.Monitoring.BEAMIntrospector do
  @moduledoc """
  Collects BEAM VM metrics through native introspection functions.
  Provides periodic snapshots of VM health including memory allocation,
  process statistics, scheduler utilization, and atom table status.
  Emits telemetry events for integration with external monitoring.
  """

  use GenServer

  require Logger

  @type beam_snapshot :: %{
          memory: map(),
          process_count: non_neg_integer(),
          process_limit: non_neg_integer(),
          atom_count: non_neg_integer(),
          atom_limit: non_neg_integer(),
          port_count: non_neg_integer(),
          port_limit: non_neg_integer(),
          scheduler_count: non_neg_integer(),
          run_queue: non_neg_integer(),
          uptime_seconds: non_neg_integer(),
          timestamp: DateTime.t()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec snapshot() :: beam_snapshot()
  def snapshot do
    GenServer.call(__MODULE__, :snapshot)
  end

  @impl true
  def init(opts) do
    interval = Keyword.get(opts, :interval_ms, :timer.seconds(15))
    schedule_collection(interval)
    {:ok, %{interval: interval, last_snapshot: nil}}
  end

  @impl true
  def handle_call(:snapshot, _from, state) do
    snap = collect_snapshot()
    {:reply, snap, %{state | last_snapshot: snap}}
  end

  @impl true
  def handle_info(:collect, state) do
    snap = collect_snapshot()
    emit_telemetry(snap)
    schedule_collection(state.interval)
    {:noreply, %{state | last_snapshot: snap}}
  end

  defp collect_snapshot do
    memory = :erlang.memory() |> Map.new()
    {uptime_ms, _} = :erlang.statistics(:wall_clock)

    %{
      memory: memory,
      process_count: :erlang.system_info(:process_count),
      process_limit: :erlang.system_info(:process_limit),
      atom_count: :erlang.system_info(:atom_count),
      atom_limit: :erlang.system_info(:atom_limit),
      port_count: :erlang.system_info(:port_count),
      port_limit: :erlang.system_info(:port_limit),
      scheduler_count: :erlang.system_info(:schedulers_online),
      run_queue: :erlang.statistics(:run_queue),
      uptime_seconds: div(uptime_ms, 1_000),
      timestamp: DateTime.utc_now()
    }
  end

  defp emit_telemetry(snap) do
    :telemetry.execute(
      [:prismatic, :beam, :snapshot],
      %{
        total_memory: snap.memory[:total] || 0,
        process_memory: snap.memory[:processes] || 0,
        ets_memory: snap.memory[:ets] || 0,
        binary_memory: snap.memory[:binary] || 0,
        atom_memory: snap.memory[:atom] || 0,
        process_count: snap.process_count,
        atom_count: snap.atom_count,
        run_queue: snap.run_queue
      },
      %{node: node()}
    )
  end

  defp schedule_collection(interval) do
    Process.send_after(self(), :collect, interval)
  end
end
```

## Alerting Architecture

Monitoring without actionable alerting is merely data collection. The Prismatic Platform implements a tiered alerting architecture designed to prevent alert fatigue while ensuring critical issues receive immediate attention.

### Alert Severity Hierarchy

The platform defines four alert severity levels aligned with the Quality Floor Guardian's escalation model. **P1 (Critical)** alerts indicate service-impacting conditions requiring immediate human intervention: total system downtime, data corruption, security breach indicators. **P2 (High)** alerts signal significant degradation affecting user experience: elevated error rates, latency spikes, resource exhaustion approaching limits. **P3 (Medium)** alerts flag conditions that require attention during business hours: slow quality degradation, capacity approaching 70% utilization, non-critical service failures. **P4 (Low)** alerts record informational conditions: successful migrations, scaling events, planned maintenance transitions.

### Alert Fatigue Prevention

Alert fatigue -- the condition where operators become desensitized to alerts due to excessive volume -- is the primary failure mode of monitoring systems. The Prismatic Platform prevents alert fatigue through several mechanisms: alert deduplication suppresses identical alerts within a configurable window, alert grouping batches related alerts into a single notification, alert routing sends alerts only to the team responsible for the affected component, and SLO-based alerting replaces threshold-based alerts with error budget consumption rate alerts.

## Custom Business Metrics

Beyond infrastructure metrics, the Prismatic Platform monitors business-specific indicators that reflect the system's value delivery.

Quality metrics track the 13 quality domains (Dialyzer, Credo, compilation warnings, and so on) with historical trending. Agent metrics track execution counts, success rates, and performance across all 530+ AIAD agents. Pipeline metrics measure throughput, latency, and error rates for data processing pipelines. OSINT metrics track query volumes, provider availability, and result quality across 120 integrated tools.

These business metrics complement infrastructure metrics to provide a complete picture of system health: infrastructure metrics tell you the system is running, but business metrics tell you the system is delivering value.

## Monitoring Anti-Patterns

Several common mistakes undermine monitoring effectiveness. **Metric explosion** occurs when cardinality grows unbounded (one time series per user ID, per request ID), overwhelming storage and query performance. The solution is to use bounded label values and reserve high-cardinality data for logs and traces. **Dashboard sprawl** creates dozens of dashboards that no one looks at regularly. The solution is to maintain a small set of curated dashboards aligned with on-call workflows. **Alert on symptoms, not causes** leads to operators chasing secondary effects rather than root causes. The solution is to alert on user-facing symptoms (error rate, latency) rather than internal metrics (CPU usage, memory) when possible. **Missing baselines** makes it impossible to distinguish normal variation from anomalous behavior. The solution is to establish baselines during normal operation and alert on deviations from baseline rather than absolute thresholds.

## Production Monitoring Stack

The Prismatic Platform's production monitoring stack on Fly.io consists of several integrated components. Application telemetry events flow through `:telemetry` handlers to Prometheus-format metric endpoints. Prometheus scrapes these endpoints at 15-second intervals and stores time-series data with 30-day retention. Grafana connects to Prometheus for dashboard visualization and alerting. Structured logs flow to a centralized log aggregator for search and analysis. Health check endpoints serve Fly.io's built-in health monitoring for automated instance management.

This stack provides sub-minute detection latency for most failure modes, historical trending for capacity planning, and the rich diagnostic context needed for rapid incident resolution.

## Related Terms

- [Monitoring](@/glossary/monitoring.md) -- general monitoring concepts and patterns
- [Telemetry](@/glossary/telemetry.md) -- the Elixir telemetry event library
- [Health Monitoring](@/glossary/health-monitoring.md) -- health check specific monitoring
- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine providing native introspection
- [BEAM](@/glossary/beam.md) -- broader BEAM ecosystem context
- [Performance](@/glossary/performance.md) -- performance monitoring and optimization
- [Performance Tracking](@/glossary/performance-tracking.md) -- tracking performance metrics over time
- [Quality Monitoring](@/glossary/quality-monitoring.md) -- code quality dimension of monitoring
- [Supervision Tree](@/glossary/supervision-tree.md) -- supervision topology informing monitoring hierarchy
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- failure detection through monitoring
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- monitoring-triggered circuit breaking
- [GenServer](@/glossary/genserver.md) -- OTP behaviour for monitoring processes

## Further Reading

- Majors, Charity, Liz Fong-Jones, and George Miranda. "Observability Engineering." O'Reilly Media, 2022.
- Beyer, Betsy, et al. "Site Reliability Engineering." O'Reilly Media, 2016.
- Prometheus documentation: https://prometheus.io/docs/
- Elixir Telemetry documentation: https://hexdocs.pm/telemetry/
- Erlang :observer documentation: https://www.erlang.org/doc/apps/observer/observer_ug

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
