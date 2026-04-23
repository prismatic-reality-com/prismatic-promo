+++
title = "Monitoring"
weight = 50
[extra]
tags = ["glossary", "monitoring", "observability", "telemetry", "operations", "devops", "health", "metrics"]
description = "Continuous observation and recording of system metrics, events, and behaviors to ensure operational health, encompassing Prismatic Platform's Telemetry integration, Quality Floor Guardian, health monitoring, and real-time LiveView dashboards"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "platform-operations"
related_concepts = ["observability", "telemetry", "health-monitoring", "metrics", "structured-logging", "distributed-tracing", "alerting"]
implementation_status = "production"
authority_level = "platform-operations"
difficulty_rating = 5
prerequisites = ["elixir", "otp", "telemetry", "genserver", "liveview"]
learning_path = ["telemetry", "metrics", "structured-logging", "monitoring", "observability", "distributed-tracing"]
interactive_demos = ["/labs/glossary/monitoring"]
code_examples = ["telemetry-handler", "health-check", "quality-floor-guardian", "metric-aggregation"]
external_resources = ["https://hexdocs.pm/telemetry/readme.html", "https://hexdocs.pm/telemetry_metrics/Telemetry.Metrics.html", "https://opentelemetry.io/docs/"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["metric-emission", "health-check-degraded", "threshold-alerting", "dashboard-rendering"]
keywords = ["monitoring", "system monitoring", "health check", "telemetry", "metrics", "observability", "alerting", "dashboards", "quality floor", "operational health"]
related_terms = ["observability", "telemetry", "health-monitoring", "system-monitoring", "metrics", "structured-logging", "distributed-tracing", "quality-floor-guardian", "liveview", "circuit-breaker"]
word_count = 1472
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Monitoring - Prismatic Platform"
+++

## Definition

Monitoring is the continuous, systematic observation and recording of system metrics, events, behaviors, and resource utilization to maintain awareness of operational health and detect deviations from expected behavior. Unlike passive logging, monitoring is an active process that collects, aggregates, and evaluates data against thresholds and baselines in real time. In the Prismatic Platform, monitoring is deeply integrated through Erlang's [Telemetry](/glossary/telemetry/) library, the Quality Floor Guardian autonomous agent, per-application health monitors, and real-time [LiveView](/glossary/liveview/) dashboards that provide immediate visibility into the platform's 115 umbrella applications.

## Overview

Monitoring exists at the intersection of three concerns: knowing what is happening right now (real-time awareness), knowing when something goes wrong (anomaly detection), and knowing what happened in the past (historical analysis). A monitoring system that fails at any of these three dimensions leaves operators blind to some category of problems.

The Prismatic Platform approaches monitoring with the same rigor it applies to code quality. The [Quality Floor Guardian](/glossary/quality-floor-guardian/) continuously evaluates 13 quality domains and enforces minimum thresholds. The [Telemetry](/glossary/telemetry/) infrastructure emits standardized events from every significant operation across all 115 applications. The [PrismaticSupervisor](/glossary/supervisor/) health monitor tracks application startup times, crash rates, and supervision tree health. And the [LiveView](/glossary/liveview/) dashboards render all of this data in real time, without polling, using server-pushed updates over WebSocket connections.

The monitoring philosophy aligns with the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine: every operational anomaly is investigated, every metric drift is tracked, and every threshold violation triggers corrective action. There is no "acceptable" level of unmonitored behavior. The platform's [observability](/glossary/observability/) strategy treats monitoring data as first-class evidence subject to the same [NABLA axioms](/glossary/nabla-axioms/) that govern all belief formation.

## Technical Details

### The Three Pillars of Monitoring

Modern monitoring practice recognizes three complementary data types, each providing a different lens on system behavior:

**Metrics** are numeric measurements aggregated over time intervals. They answer questions like "What is the current request rate?" or "What is the 95th percentile response time?" Metrics are efficient to store and query but lose individual event detail through aggregation.

**Logs** are timestamped records of discrete events. They answer questions like "What happened at 14:32:07?" or "Why did this request fail?" Logs preserve full detail but are expensive to store and slow to query at scale.

**Traces** are records of request flow through distributed components. They answer questions like "Which service caused the latency spike?" or "How do requests flow through the system?" Traces connect related events across service boundaries.

The Prismatic Platform integrates all three pillars through a unified [Telemetry](/glossary/telemetry/) infrastructure:

| Pillar | Implementation | Storage | Query Interface |
|--------|---------------|---------|----------------|
| **Metrics** | `:telemetry` events + Telemetry.Metrics | ETS counters, TimescaleDB | LiveView dashboards |
| **Logs** | Structured logging (Logger + JSON) | File, stdout, log aggregator | Full-text search |
| **Traces** | OpenTelemetry spans | Trace collector | Distributed trace viewer |

### Monitoring Granularity

Effective monitoring operates at multiple granularity levels simultaneously:

| Level | Scope | Example Metrics | Refresh Rate |
|-------|-------|----------------|-------------|
| **Infrastructure** | CPU, memory, disk, network | BEAM scheduler utilization, ETS memory | 5 seconds |
| **Application** | Per-app health, process counts | Supervision tree restarts, message queue depth | 10 seconds |
| **Business** | Domain-specific KPIs | OSINT queries/minute, agent task completion rate | 30 seconds |
| **Quality** | Code and platform quality metrics | Credo violations, test coverage, compile warnings | Per commit |

### Time Series and Aggregation

Monitoring data is inherently time-series data. Raw metrics must be aggregated into meaningful summaries:

- **Counter**: Monotonically increasing value (total requests served)
- **Gauge**: Point-in-time measurement (current memory usage)
- **Histogram**: Distribution of values over time (response time percentiles)
- **Summary**: Pre-computed percentiles over a sliding window

## Implementation in Prismatic Platform

### Telemetry Event Infrastructure

Every significant operation in the platform emits standardized Telemetry events. These events follow a consistent naming convention and carry structured metadata:

```elixir
defmodule PrismaticWeb.Telemetry do
  @moduledoc """
  Telemetry event definitions and handler attachment for the web layer.
  Emits metrics for HTTP requests, LiveView operations, and WebSocket events.
  """

  @type event_name :: [atom()]
  @type measurements :: %{atom() => number()}
  @type metadata :: %{atom() => term()}

  @spec attach_handlers() :: :ok
  def attach_handlers do
    events = [
      [:prismatic_web, :request, :stop],
      [:prismatic_web, :live_view, :mount, :stop],
      [:prismatic_web, :live_view, :handle_event, :stop],
      [:prismatic_web, :channel, :join, :stop],
      [:phoenix, :endpoint, :stop],
      [:phoenix, :router_dispatch, :stop]
    ]

    :telemetry.attach_many(
      "prismatic-web-metrics",
      events,
      &handle_event/4,
      %{}
    )
  end

  @spec handle_event(event_name(), measurements(), metadata(), map()) :: :ok
  def handle_event(
        [:prismatic_web, :request, :stop],
        %{duration: duration},
        %{conn: conn},
        _config
      ) do
    route = "#{conn.method} #{conn.request_path}"
    status = conn.status

    :telemetry.execute(
      [:prismatic, :monitoring, :http_request],
      %{duration_ms: System.convert_time_unit(duration, :native, :millisecond)},
      %{route: route, status: status}
    )
  end

  def handle_event(
        [:prismatic_web, :live_view, :mount, :stop],
        %{duration: duration},
        %{socket: socket},
        _config
      ) do
    view = socket.view |> to_string() |> String.split(".") |> List.last()

    :telemetry.execute(
      [:prismatic, :monitoring, :live_view_mount],
      %{duration_ms: System.convert_time_unit(duration, :native, :millisecond)},
      %{view: view}
    )
  end

  def handle_event(_event, _measurements, _metadata, _config), do: :ok
end
```

### Quality Floor Guardian

The Quality Floor Guardian is an autonomous monitoring agent that continuously evaluates platform quality across 13 domains. It operates as a GenServer with periodic health checks and threshold-based alerting:

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring agent that enforces minimum quality thresholds
  across all 13 quality domains. Triggers escalation when quality degrades.
  """

  use GenServer

  @type quality_level :: :optimal | :warning | :critical | :emergency
  @type domain :: atom()
  @type score :: 0..100
  @type state :: %{
    scores: %{domain() => score()},
    level: quality_level(),
    last_check: DateTime.t(),
    check_interval_ms: pos_integer()
  }

  @quality_domains [
    :dialyzer, :credo, :compilation, :datetime_precision,
    :guard_functions, :impl_coverage, :memory_safety,
    :performance, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_level() :: quality_level()
  def current_level do
    GenServer.call(__MODULE__, :current_level)
  end

  @spec domain_scores() :: %{domain() => score()}
  def domain_scores do
    GenServer.call(__MODULE__, :domain_scores)
  end

  @impl GenServer
  @spec init(keyword()) :: {:ok, state()}
  def init(opts) do
    interval = Keyword.get(opts, :check_interval_ms, 30_000)
    Process.send_after(self(), :check_quality, interval)

    {:ok,
     %{
       scores: Map.new(@quality_domains, fn d -> {d, 100} end),
       level: :optimal,
       last_check: DateTime.utc_now(),
       check_interval_ms: interval
     }}
  end

  @impl GenServer
  def handle_call(:current_level, _from, state) do
    {:reply, state.level, state}
  end

  def handle_call(:domain_scores, _from, state) do
    {:reply, state.scores, state}
  end

  @impl GenServer
  def handle_info(:check_quality, state) do
    scores = evaluate_all_domains()
    overall = calculate_overall_score(scores)
    level = classify_level(overall)

    if level != state.level do
      :telemetry.execute(
        [:prismatic, :quality_floor, :level_change],
        %{overall_score: overall},
        %{previous: state.level, current: level}
      )

      maybe_escalate(level, overall, scores)
    end

    Process.send_after(self(), :check_quality, state.check_interval_ms)

    {:noreply,
     %{state | scores: scores, level: level, last_check: DateTime.utc_now()}}
  end

  @spec classify_level(score()) :: quality_level()
  defp classify_level(score) when score >= 99, do: :optimal
  defp classify_level(score) when score >= 98, do: :warning
  defp classify_level(score) when score >= 95, do: :critical
  defp classify_level(_score), do: :emergency

  @spec calculate_overall_score(%{domain() => score()}) :: score()
  defp calculate_overall_score(scores) do
    values = Map.values(scores)
    div(Enum.sum(values), length(values))
  end

  @spec evaluate_all_domains() :: %{domain() => score()}
  defp evaluate_all_domains do
    Map.new(@quality_domains, fn domain ->
      {domain, evaluate_domain(domain)}
    end)
  end

  @spec evaluate_domain(domain()) :: score()
  defp evaluate_domain(domain) do
    # Each domain has its own evaluation logic
    # Returns 0-100 score based on current violations
    case domain do
      :dialyzer -> count_violations(:dialyzer)
      :credo -> count_violations(:credo)
      :compilation -> count_violations(:compilation)
      _ -> 100
    end
  end

  @spec count_violations(domain()) :: score()
  defp count_violations(_domain), do: 100

  @spec maybe_escalate(quality_level(), score(), map()) :: :ok
  defp maybe_escalate(:emergency, score, scores) do
    :telemetry.execute(
      [:prismatic, :quality_floor, :emergency],
      %{score: score},
      %{domains: scores}
    )
  end

  defp maybe_escalate(:critical, score, _scores) do
    :telemetry.execute(
      [:prismatic, :quality_floor, :critical],
      %{score: score},
      %{}
    )
  end

  defp maybe_escalate(_level, _score, _scores), do: :ok
end
```

### Health Monitor Integration

The PrismaticSupervisor includes a health monitoring subsystem that tracks application lifecycle and resource utilization:

```elixir
defmodule PrismaticSupervisor.HealthMonitor do
  @moduledoc """
  Monitors health of supervised applications, tracking restart rates,
  message queue depths, and resource utilization.
  """

  @type health_status :: :healthy | :degraded | :unhealthy
  @type app_health :: %{
    app: atom(),
    status: health_status(),
    uptime_seconds: non_neg_integer(),
    restart_count: non_neg_integer(),
    process_count: non_neg_integer(),
    memory_bytes: non_neg_integer()
  }

  @spec check_app(atom()) :: app_health()
  def check_app(app) do
    pid = Process.whereis(app)
    status = determine_status(app, pid)

    %{
      app: app,
      status: status,
      uptime_seconds: get_uptime(pid),
      restart_count: get_restart_count(app),
      process_count: get_process_count(app),
      memory_bytes: get_memory_usage(app)
    }
  end

  @spec check_all() :: [app_health()]
  def check_all do
    Application.started_applications()
    |> Enum.filter(fn {app, _desc, _vsn} ->
      String.starts_with?(to_string(app), "prismatic")
    end)
    |> Enum.map(fn {app, _desc, _vsn} -> check_app(app) end)
  end

  @spec aggregate_status([app_health()]) :: health_status()
  def aggregate_status(health_reports) do
    statuses = Enum.map(health_reports, & &1.status)

    cond do
      :unhealthy in statuses -> :unhealthy
      :degraded in statuses -> :degraded
      true -> :healthy
    end
  end

  @spec determine_status(atom(), pid() | nil) :: health_status()
  defp determine_status(_app, nil), do: :unhealthy

  defp determine_status(app, _pid) do
    restart_count = get_restart_count(app)
    memory = get_memory_usage(app)

    cond do
      restart_count > 10 -> :unhealthy
      restart_count > 3 -> :degraded
      memory > 500_000_000 -> :degraded
      true -> :healthy
    end
  end

  @spec get_uptime(pid() | nil) :: non_neg_integer()
  defp get_uptime(nil), do: 0

  defp get_uptime(pid) do
    case Process.info(pid, :start_time) do
      nil -> 0
      {:start_time, _time} -> System.monotonic_time(:second)
    end
  end

  @spec get_restart_count(atom()) :: non_neg_integer()
  defp get_restart_count(_app), do: 0

  @spec get_process_count(atom()) :: non_neg_integer()
  defp get_process_count(_app), do: length(Process.list())

  @spec get_memory_usage(atom()) :: non_neg_integer()
  defp get_memory_usage(_app), do: :erlang.memory(:total)
end
```

### LiveView Real-Time Dashboards

Monitoring data is rendered in real-time through LiveView dashboards that subscribe to Telemetry events and push updates to connected browsers without polling:

```elixir
defmodule PrismaticWeb.MonitoringLive do
  @moduledoc """
  Real-time monitoring dashboard using LiveView.
  Subscribes to telemetry events and renders updates instantly.
  """

  use PrismaticWeb, :live_view

  @type metric_point :: %{timestamp: DateTime.t(), value: number()}

  @impl Phoenix.LiveView
  @spec mount(map(), map(), Phoenix.LiveView.Socket.t()) ::
          {:ok, Phoenix.LiveView.Socket.t()}
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(5_000, :refresh_metrics)
    end

    {:ok,
     assign(socket,
       health: PrismaticSupervisor.HealthMonitor.check_all(),
       quality_level: PrismaticSafety.QualityFloorGuardian.current_level(),
       quality_scores: PrismaticSafety.QualityFloorGuardian.domain_scores(),
       page_title: "Platform Monitoring"
     )}
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh_metrics, socket) do
    {:noreply,
     assign(socket,
       health: PrismaticSupervisor.HealthMonitor.check_all(),
       quality_level: PrismaticSafety.QualityFloorGuardian.current_level(),
       quality_scores: PrismaticSafety.QualityFloorGuardian.domain_scores()
     )}
  end
end
```

## Comparison with Alternatives

### Monitoring vs. Observability

[Monitoring](/glossary/monitoring/) and [observability](/glossary/observability/) are related but distinct concepts. Monitoring answers predefined questions ("Is the system healthy?"), while observability enables answering questions that were not anticipated when the system was built ("Why is this specific user experiencing slow responses?"). Monitoring is a subset of observability -- a system can be monitored without being observable, but an observable system is inherently monitorable.

| Aspect | Monitoring | Observability |
|--------|-----------|---------------|
| **Questions** | Predefined (dashboards, alerts) | Ad-hoc (exploration, debugging) |
| **Data** | Aggregated metrics | High-cardinality events |
| **Approach** | Threshold-based | Correlation-based |
| **Cost** | Lower (aggregated data) | Higher (granular data) |
| **Time to insight** | Immediate (pre-built views) | Variable (requires exploration) |

### Monitoring vs. Logging

[Structured logging](/glossary/structured-logging/) captures discrete events with full context, while monitoring aggregates numeric measurements over time. Logs tell you what happened; monitoring tells you how the system is performing. The Prismatic Platform uses both -- structured JSON logs for debugging and Telemetry metrics for dashboards and alerting.

### Monitoring vs. APM (Application Performance Monitoring)

Commercial APM tools (Datadog, New Relic, Dynatrace) provide integrated monitoring, tracing, and profiling. The Prismatic Platform builds its monitoring natively using Erlang/OTP's built-in capabilities -- Telemetry for events, Observer for process inspection, and LiveView for dashboards. This avoids vendor lock-in and leverages the BEAM VM's unique introspection capabilities.

## Best Practices

### 1. Monitor What Matters, Not Everything

Focus monitoring on metrics that drive decisions. Every monitored metric should have an associated action: if no action would be taken when the metric changes, it should not be actively monitored. The Prismatic Platform's Quality Floor Guardian monitors exactly 13 domains because each has a defined escalation path.

### 2. Establish Baselines Before Setting Thresholds

Alerts based on arbitrary thresholds generate noise. Collect at least two weeks of baseline data before setting alert thresholds. Use statistical methods (standard deviations, percentile-based thresholds) rather than fixed values.

### 3. Monitor from the User's Perspective

Infrastructure metrics (CPU, memory) are necessary but insufficient. Monitor business-level metrics that reflect user experience: page load time, API response latency, task completion rate. The platform's page load performance standard (< 250ms) is a user-centric monitoring target.

### 4. Use Structured, Machine-Parseable Formats

All monitoring data should be structured for automated processing. The Prismatic Platform uses Telemetry's standardized event format (`{event_name, measurements, metadata}`) to ensure all monitoring data is consistently structured.

### 5. Implement Circuit Breakers for Monitoring

Monitoring systems that fail should not cascade into the monitored system. The platform's [circuit breaker](/glossary/circuit-breaker/) pattern protects monitoring pipelines -- if a metric collector fails 3 times consecutively, it is temporarily disabled rather than degrading the main application.

### 6. Correlate Across Layers

A CPU spike means nothing without context. Correlate infrastructure metrics with application events and business operations to enable root cause analysis. The platform's Telemetry infrastructure attaches consistent metadata (request IDs, user context) across all event layers.

## Common Pitfalls

### 1. Alert Fatigue

Too many alerts desensitize operators, causing critical alerts to be ignored. The Quality Floor Guardian uses a tiered escalation model (optimal -> warning -> critical -> emergency) with progressively urgent response requirements, avoiding the "everything is critical" anti-pattern.

### 2. Monitoring Only Happy Paths

Systems that monitor only successful operations miss the most important signals. The platform monitors error rates, timeout frequencies, and supervision tree restart counts alongside success metrics.

### 3. Storing Raw Metrics Indefinitely

High-resolution metrics (1-second intervals) are essential for real-time monitoring but prohibitively expensive to store long-term. Implement downsampling: keep 1-second resolution for 24 hours, 1-minute resolution for 30 days, 1-hour resolution for 1 year.

### 4. Monitoring Without Context

A metric value without context is meaningless. Always attach metadata to metrics: which application, which environment, which version, which deployment. The platform's Telemetry events always include `app`, `environment`, and `version` metadata.

### 5. Ignoring the BEAM VM's Built-in Monitoring

Erlang/OTP provides extensive introspection capabilities out of the box: `:observer`, `:sys.get_state/1`, `Process.info/2`, `:erlang.statistics/1`, `:erlang.memory/0`. Many teams reinvent these capabilities with external tools when they are already available natively.

## Use Cases

### 1. Quality Score Regression Detection

The Quality Floor Guardian monitors the platform's quality score across 13 domains. When a domain drops below threshold, it triggers investigation and blocks deployments until the regression is resolved. This prevented dozens of quality regressions during the platform's evolution from Gen 1 to Gen 19.

### 2. EASM Security Dashboard

The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM module uses real-time monitoring to track discovered assets, security ratings, and compliance scores. Security analysts monitor the dashboard at `/perimeter` for changes in attack surface or rating degradation.

### 3. Agent Performance Tracking

With 530+ agents, monitoring individual agent performance is critical. Telemetry events track agent task duration, success rate, and resource consumption, enabling identification of underperforming agents.

### 4. Deployment Health Verification

After each deployment, monitoring verifies that the new release meets performance and reliability standards. The [canary release](/glossary/canary-release/) process uses monitoring data to decide whether to proceed with or roll back a deployment.

### 5. Session Lifecycle Tracking

The SessionLifecycle GenServer emits Telemetry events for session start, command execution, and session end, enabling monitoring of LLM session activity, command success rates, and session duration patterns.

## Related Concepts

- [Observability](/glossary/observability/) -- broader practice encompassing monitoring, tracing, and ad-hoc system introspection
- [Telemetry](/glossary/telemetry/) -- the event emission library underlying all Prismatic Platform monitoring
- [Health Monitoring](/glossary/health-monitoring/) -- specific focus on binary health/unhealthy status determination
- [Metrics](/glossary/metrics/) -- numeric measurements that form the primary data source for monitoring
- [Structured Logging](/glossary/structured-logging/) -- complementary data source providing event-level detail
- [Distributed Tracing](/glossary/distributed-tracing/) -- request-flow tracking across distributed components
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- autonomous monitoring agent enforcing platform quality thresholds
- [Circuit Breaker](/glossary/circuit-breaker/) -- fault tolerance pattern that monitoring detects and tracks
- [LiveView](/glossary/liveview/) -- the real-time rendering technology powering monitoring dashboards
- [System Monitoring](/glossary/system-monitoring/) -- infrastructure-level monitoring of compute resources

## See Also

- [Observability](/glossary/observability/) -- the superset discipline that includes monitoring
- [Quality Gates](/glossary/quality-gates/) -- enforcement layer that uses monitoring data for build decisions
- [Continuous Integration](/glossary/continuous-integration/) -- build-time monitoring and quality enforcement
- [Performance](/glossary/performance/) -- the metrics that monitoring tracks for optimization

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
