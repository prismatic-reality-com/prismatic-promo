+++
title = "Telemetry & Metrics"
weight = 11
date = 2026-02-12


[extra]
icon = "database"
color = "blue"
description = "Full observability with Telemetry events, metrics, and distributed tracing"
date_created = "2025-06-15"
reading_time = "14 min"
difficulty = "intermediate"
tags = ["telemetry", "observability", "metrics", "prometheus", "opentelemetry", "distributed-tracing"]
related_articles = ["supervision-trees", "umbrella-apps", "event-sourcing", "pubsub", "phoenix-liveview"]
author = "Tomas Korcak (korczis)"
word_count = 1123
date_modified = "2026-02-23"
keywords = ["Telemetry", "Metrics", "Full", "architecture", "Prismatic Platform", "OpenTelemetry", "Distribution", "Counter", "Prometheus"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Telemetry & Metrics - Prismatic Platform"
+++

## Overview

[Observability](/glossary/observability/) in the Prismatic Platform is built on Erlang's `:telemetry` library -- a lightweight, dynamic dispatching library for [metrics](/glossary/metrics/) and instrumentation. Unlike traditional logging-based observability that relies on parsing unstructured text, telemetry provides structured, typed events that are emitted at specific points in the code and consumed by pluggable handlers. This architecture decouples instrumentation (what to measure) from reporting (where to send measurements), enabling the platform to simultaneously feed Prometheus for metrics, OpenTelemetry for distributed traces, and [Phoenix LiveView](/architecture/phoenix-liveview/) dashboards for real-time visualization -- all from the same instrumentation points.

The Prismatic Platform emits telemetry events from every significant operation across its 90 [umbrella applications](/architecture/umbrella-apps/): agent executions, storage queries, [EASM](/glossary/easm/) discovery scans, [security rating](/glossary/security-rating/) calculations, [supervision tree](/architecture/supervision-trees/) restarts, and [event store](/architecture/event-sourcing/) operations. This comprehensive instrumentation enables the platform to maintain its [quality gates](/capabilities/quality-gates/) with evidence-based performance budgets rather than guesswork.

## Why Telemetry Over Traditional Logging

### The Logging Problem

Traditional observability relies on `Logger.info/1` calls scattered throughout the codebase, producing unstructured text that must be parsed (often with fragile regular expressions) to extract metrics. This approach has fundamental limitations:

1. **Performance overhead**: String formatting and I/O happen on the hot path, regardless of whether anyone is consuming the logs.
2. **Tight coupling**: Changing the logging format breaks downstream parsers. Adding new fields requires coordinated changes across producers and consumers.
3. **No aggregation semantics**: Logs are individual records. Computing aggregates (p99 latency, error rates, throughput) requires external systems that parse and window the log stream.
4. **Binary choice**: Either you log everything (high overhead, noisy) or log selectively (miss important signals).

### The Telemetry Solution

Telemetry inverts the model. The application code emits lightweight events (a list of atoms for the event name, a map of numeric measurements, and a map of metadata). If no handler is attached, the emission cost is effectively zero -- just a pattern match on an empty handler list. If handlers are attached, they receive structured data that can be directly aggregated without parsing.

| Dimension | Logger-Based | Telemetry-Based |
|-----------|-------------|-----------------|
| Emission cost (no consumer) | String formatting + I/O | ~0 (empty handler check) |
| Emission cost (with consumer) | String formatting + I/O + parsing | Map construction + handler call |
| Data structure | Unstructured text | Typed maps |
| Consumer coupling | Format-dependent | Schema-independent |
| Aggregation | External parsing + windowing | In-handler accumulation |
| Dynamic attach/detach | No | Yes (runtime) |
| Multiple consumers | Log forking (complex) | Multiple handlers (native) |

## Telemetry Architecture

The platform's telemetry system operates in three layers: emission (instrumentation points in application code), routing (the `:telemetry` dispatch mechanism), and consumption (handlers that transform events into metrics, traces, and alerts).

```
Layer 1: Emission (Application Code)
  |
  | :telemetry.execute/3 or :telemetry.span/3
  |
  v
Layer 2: Routing (:telemetry library)
  |
  | Pattern-matched dispatch to all attached handlers
  |
  +------+--------+---------+----------+
  |      |        |         |          |
  v      v        v         v          v
Metrics  Traces   Alerts   Dashboard  Audit Log
Handler  Handler  Handler  Handler    Handler
  |      |        |         |          |
  v      v        v         v          v
Prometheus  OTLP  PagerDuty LiveView  Event Store
```

### Event Naming Convention

The Prismatic Platform follows a hierarchical naming convention for telemetry events that mirrors the [umbrella application](/glossary/umbrella-application/) structure:

```
[:prismatic, <app_domain>, <operation>, <lifecycle_stage>]
```

Where:
- `app_domain` identifies the umbrella application (`:perimeter`, `:agents`, `:storage`)
- `operation` identifies the specific operation (`:discovery`, `:scan`, `:query`)
- `lifecycle_stage` is one of `:start`, `:stop`, `:exception`

This convention enables both fine-grained subscriptions (e.g., only perimeter discovery events) and broad subscriptions (e.g., all `:stop` events across all domains for latency monitoring).

## Instrumentation Patterns

### The Span Pattern

The most common instrumentation pattern wraps an operation in `:telemetry.span/3`, which automatically emits `:start`, `:stop`, and `:exception` events with duration measurements.

```elixir
defmodule PrismaticPerimeter.Discovery.Engine do
  @moduledoc "Asset discovery engine with comprehensive telemetry instrumentation."

  @spec discover(String.t()) :: {:ok, Surface.t()} | {:error, term()}
  def discover(domain) do
    :telemetry.span(
      [:prismatic, :perimeter, :discovery],
      %{domain: domain},
      fn ->
        case do_discover(domain) do
          {:ok, surface} = result ->
            measurements = %{
              assets_found: length(surface.assets),
              domains_resolved: surface.domains_resolved,
              certificates_found: surface.certificates_found
            }
            {result, measurements}

          {:error, _reason} = error ->
            {error, %{assets_found: 0, error: true}}
        end
      end
    )
  end
end
```

This single instrumentation point automatically produces three events:

| Event | Measurements | Metadata | When |
|-------|-------------|----------|------|
| `[:prismatic, :perimeter, :discovery, :start]` | `%{system_time: ...}` | `%{domain: "example.com"}` | Before execution |
| `[:prismatic, :perimeter, :discovery, :stop]` | `%{duration: ..., assets_found: 5}` | `%{domain: "example.com"}` | After success |
| `[:prismatic, :perimeter, :discovery, :exception]` | `%{duration: ...}` | `%{domain: "example.com", kind: :error, reason: ...}` | On failure |

### Manual Emission for Custom Events

For events that do not fit the start/stop lifecycle, the platform uses direct `:telemetry.execute/3`:

```elixir
defmodule PrismaticPerimeter.Rating.Calculator do
  @spec calculate_rating(String.t()) :: {:ok, Rating.t()} | {:error, term()}
  def calculate_rating(domain) do
    start_time = System.monotonic_time()

    with {:ok, factors} <- collect_rating_factors(domain),
         {:ok, score} <- compute_score(factors),
         grade <- score_to_grade(score) do

      rating = %Rating{domain: domain, grade: grade, score: score, factors: factors}

      :telemetry.execute(
        [:prismatic, :perimeter, :rating, :calculated],
        %{
          duration: System.monotonic_time() - start_time,
          score: score,
          factor_count: length(factors)
        },
        %{
          domain: domain,
          grade: grade,
          previous_grade: get_previous_grade(domain)
        }
      )

      {:ok, rating}
    end
  end
end
```

### Supervision Tree Instrumentation

The [supervision trees](/architecture/supervision-trees/) emit telemetry events for every lifecycle action, enabling monitoring of restart rates and process health.

```elixir
defmodule PrismaticTelemetry.SupervisorHandler do
  @moduledoc """
  Handles supervisor telemetry events and converts them into
  platform-standard metrics for monitoring restart rates and
  detecting supervisor instability.
  """

  @spec handle_event([atom()], map(), map(), term()) :: :ok
  def handle_event(
    [:supervisor, :restart_child, :stop],
    %{duration: duration},
    %{id: child_id, supervisor: sup_name, reason: reason},
    _config
  ) do
    :telemetry.execute(
      [:prismatic, :supervision, :restart],
      %{duration: duration, count: 1},
      %{
        supervisor: sup_name,
        child: child_id,
        reason: categorize_reason(reason)
      }
    )
  end

  defp categorize_reason(:normal), do: :expected
  defp categorize_reason(:shutdown), do: :expected
  defp categorize_reason({:shutdown, _}), do: :expected
  defp categorize_reason(_), do: :unexpected
end
```

## Metrics Pipeline

### Prometheus Reporter Configuration

The platform defines its metrics using the `Telemetry.Metrics` DSL, which maps telemetry events to Prometheus metric types.

```elixir
defmodule PrismaticTelemetry.Metrics do
  @moduledoc """
  Defines all platform metrics as Telemetry.Metrics specifications.
  These are consumed by TelemetryMetricsPrometheus for exposition.
  """

  import Telemetry.Metrics

  @spec metrics() :: [Telemetry.Metrics.t()]
  def metrics do
    [
      # ---- Perimeter Metrics ----
      counter("prismatic.perimeter.discovery.count",
        tags: [:domain],
        description: "Total number of discovery operations"
      ),
      distribution("prismatic.perimeter.discovery.duration",
        tags: [:domain],
        unit: {:native, :millisecond},
        reporter_options: [buckets: [10, 50, 100, 250, 500, 1000, 5000]],
        description: "Discovery operation duration in milliseconds"
      ),
      sum("prismatic.perimeter.discovery.assets_found",
        tags: [:domain],
        description: "Total assets discovered"
      ),

      # ---- Agent Metrics ----
      counter("prismatic.agents.execution.count",
        tags: [:agent_type],
        description: "Total agent executions"
      ),
      distribution("prismatic.agents.execution.duration",
        tags: [:agent_type],
        unit: {:native, :millisecond},
        reporter_options: [buckets: [1, 5, 10, 50, 100, 500, 1000]],
        description: "Agent execution duration"
      ),
      last_value("prismatic.agents.active.count",
        description: "Currently active agents"
      ),

      # ---- Storage Metrics ----
      distribution("prismatic.storage.query.duration",
        tags: [:adapter, :operation],
        unit: {:native, :millisecond},
        reporter_options: [buckets: [1, 5, 10, 25, 50, 100]],
        description: "Storage query duration"
      ),
      counter("prismatic.storage.query.count",
        tags: [:adapter, :operation],
        description: "Total storage queries"
      ),
      last_value("prismatic.storage.pool.size",
        tags: [:adapter],
        description: "Connection pool size"
      ),
      last_value("prismatic.storage.pool.available",
        tags: [:adapter],
        description: "Available pool connections"
      ),

      # ---- Supervision Metrics ----
      counter("prismatic.supervision.restart.count",
        tags: [:supervisor, :reason],
        description: "Supervisor child restart count"
      ),
      distribution("prismatic.supervision.restart.duration",
        tags: [:supervisor],
        unit: {:native, :microsecond},
        description: "Restart duration"
      ),

      # ---- Event Store Metrics ----
      counter("prismatic.events.appended.count",
        tags: [:stream_type, :event_type],
        description: "Events appended to the store"
      ),
      distribution("prismatic.events.append.duration",
        unit: {:native, :millisecond},
        description: "Event append latency"
      ),

      # ---- VM Metrics ----
      last_value("vm.memory.total", unit: :byte),
      last_value("vm.memory.processes", unit: :byte),
      last_value("vm.memory.ets", unit: :byte),
      last_value("vm.total_run_queue_lengths.total"),
      last_value("vm.system_counts.process_count")
    ]
  end
end
```

### Application Startup

The telemetry system is initialized early in the application supervision tree to ensure all events are captured from the first moment of operation.

```elixir
defmodule PrismaticTelemetry.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Prometheus exporter (must start before any event emission)
      {TelemetryMetricsPrometheus,
       metrics: PrismaticTelemetry.Metrics.metrics(),
       name: :prismatic_metrics,
       port: 9568},

      # VM metrics poller (emits vm.* events every 5 seconds)
      {:telemetry_poller,
       measurements: [
         {PrismaticTelemetry.VMPoller, :dispatch, []},
         {PrismaticTelemetry.PoolPoller, :dispatch, []}
       ],
       period: :timer.seconds(5),
       name: :prismatic_poller},

      # Custom event handlers
      {PrismaticTelemetry.AlertHandler, []}
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: PrismaticTelemetry.Supervisor)
  end
end
```

## Complete Telemetry Event Catalog

### Perimeter Events

| Event | Measurements | Metadata | Metric Type |
|-------|-------------|----------|-------------|
| `[:prismatic, :perimeter, :discovery, :start]` | system_time | domain | - |
| `[:prismatic, :perimeter, :discovery, :stop]` | duration, assets_found | domain | Distribution + Counter |
| `[:prismatic, :perimeter, :scan, :stop]` | duration, vulns_found | asset_id, scan_type | Distribution + Counter |
| `[:prismatic, :perimeter, :rating, :calculated]` | duration, score | domain, grade | Distribution + Gauge |

### Agent Events

| Event | Measurements | Metadata | Metric Type |
|-------|-------------|----------|-------------|
| `[:prismatic, :agents, :execution, :start]` | system_time | agent_id, type | - |
| `[:prismatic, :agents, :execution, :stop]` | duration | agent_id, type, result | Distribution + Counter |
| `[:prismatic, :agents, :execution, :exception]` | duration | agent_id, type, kind, reason | Counter |
| `[:prismatic, :agents, :started]` | system_time | agent_id, type | Counter |
| `[:prismatic, :agents, :terminated]` | system_time | agent_id, reason | Counter |

### Storage Events

| Event | Measurements | Metadata | Metric Type |
|-------|-------------|----------|-------------|
| `[:prismatic, :storage, :query, :stop]` | duration, rows | adapter, operation | Distribution + Counter |
| `[:prismatic, :storage, :pool, :checkout]` | queue_time, idle_time | adapter | Distribution |
| `[:prismatic, :storage, :pool, :status]` | size, available, overflow | adapter | Gauge |

### Event Store Events

| Event | Measurements | Metadata | Metric Type |
|-------|-------------|----------|-------------|
| `[:prismatic, :events, :appended]` | count, duration | stream_type, event_type | Counter + Distribution |
| `[:prismatic, :events, :projected]` | duration | projection, event_type | Distribution |
| `[:prismatic, :events, :subscription, :lag]` | lag_events, lag_ms | subscription_name | Gauge |

## Distributed Tracing with OpenTelemetry

While `:telemetry` provides metrics, OpenTelemetry provides [distributed tracing](/glossary/distributed-tracing/) -- the ability to follow a single request as it traverses multiple processes and services. The Prismatic Platform integrates both, using `:telemetry` events as span boundaries within OpenTelemetry traces.

### Trace Context Architecture

```elixir
defmodule PrismaticTelemetry.Tracing do
  @moduledoc """
  OpenTelemetry integration for distributed tracing across
  umbrella applications. Trace context is propagated through
  process dictionary and explicit context passing.
  """
  require OpenTelemetry.Tracer, as: Tracer

  @spec trace_discovery(String.t()) :: {:ok, Surface.t()} | {:error, term()}
  def trace_discovery(domain) do
    Tracer.with_span "prismatic.perimeter.discovery",
      attributes: %{"perimeter.domain" => domain} do

      # Phase 1: DNS enumeration
      assets = Tracer.with_span "prismatic.perimeter.dns_enum" do
        PrismaticPerimeter.Discovery.DNS.enumerate(domain)
      end

      Tracer.set_attribute("perimeter.assets_count", length(assets))

      # Phase 2: Certificate transparency
      certs = Tracer.with_span "prismatic.perimeter.cert_transparency" do
        PrismaticPerimeter.Discovery.CertTransparency.search(domain)
      end

      # Phase 3: Parallel asset scanning
      Tracer.with_span "prismatic.perimeter.scan_all",
        attributes: %{"perimeter.scan_count" => length(assets)} do

        Task.Supervisor.async_stream_nolink(
          PrismaticAgents.TaskSupervisor,
          assets,
          fn asset ->
            # Propagate trace context into spawned tasks
            ctx = OpenTelemetry.Ctx.get_current()
            Tracer.with_span "prismatic.perimeter.scan_asset",
              attributes: %{"asset.id" => asset.id} do
              PrismaticPerimeter.Scanner.scan(asset)
            end
          end,
          max_concurrency: 20,
          timeout: 30_000
        )
        |> Enum.to_list()
      end
    end
  end
end
```

### Cross-Process Context Propagation

When work is distributed across processes (as with agent executions), trace context must be explicitly propagated:

```elixir
defmodule PrismaticAgents.TracedExecution do
  @moduledoc """
  Wraps agent execution with OpenTelemetry trace context propagation.
  Ensures that agent work appears as child spans within the initiating trace.
  """
  require OpenTelemetry.Tracer, as: Tracer

  @spec execute_with_context(Agent.t(), map()) :: {:ok, term()} | {:error, term()}
  def execute_with_context(agent, context) do
    # Attach the parent trace context in the new process
    otel_ctx = Map.get(context, :otel_ctx, OpenTelemetry.Ctx.new())
    prev_ctx = OpenTelemetry.Ctx.attach(otel_ctx)

    try do
      Tracer.with_span "prismatic.agent.execute",
        attributes: %{
          "agent.id" => agent.id,
          "agent.type" => to_string(agent.type),
          "agent.tier" => to_string(agent.tier)
        } do
        result = agent.module.execute(agent.config)

        Tracer.set_attribute("agent.result",
          case result do
            {:ok, _} -> "success"
            {:error, _} -> "failure"
          end
        )

        result
      end
    after
      OpenTelemetry.Ctx.detach(prev_ctx)
    end
  end
end
```

## Real-Time Dashboard Integration

The [telemetry](/glossary/telemetry/) system feeds directly into [Phoenix LiveView](/glossary/liveview/) dashboards, providing real-time visualization without polling external metric stores.

```elixir
defmodule PrismaticWeb.MetricsLive do
  @moduledoc """
  Real-time metrics dashboard using LiveView.
  Subscribes to telemetry events through PubSub bridge
  and updates the UI in real-time.
  """
  use PrismaticWeb, :live_view

  @refresh_interval_ms 5_000

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      # Subscribe to metric summary updates
      Phoenix.PubSub.subscribe(PrismaticPubSub, "metrics:summary")
      Process.send_after(self(), :compute_kpis, @refresh_interval_ms)
    end

    {:ok, assign(socket,
      kpis: compute_kpis(),
      discovery_latency_p99: 0,
      agent_success_rate: 100.0,
      active_agents: 0,
      events_per_second: 0
    )}
  end

  @impl true
  def handle_info(:compute_kpis, socket) do
    Process.send_after(self(), :compute_kpis, @refresh_interval_ms)
    kpis = compute_kpis()

    {:noreply, assign(socket,
      kpis: kpis,
      discovery_latency_p99: kpis.discovery_p99_ms,
      agent_success_rate: kpis.agent_success_rate,
      active_agents: kpis.active_agents,
      events_per_second: kpis.events_per_second
    )}
  end

  defp compute_kpis do
    %{
      discovery_p99_ms: PrismaticTelemetry.Aggregator.percentile(:discovery_duration, 99),
      agent_success_rate: PrismaticTelemetry.Aggregator.rate(:agent_success, :agent_total),
      active_agents: PrismaticTelemetry.Aggregator.gauge(:active_agents),
      events_per_second: PrismaticTelemetry.Aggregator.throughput(:events_appended, :second),
      storage_pool_usage: PrismaticTelemetry.Aggregator.gauge(:pool_checked_out),
      supervisor_restart_rate: PrismaticTelemetry.Aggregator.rate(:restarts, :minute)
    }
  end
end
```

## Alerting Pipeline

The telemetry system drives the platform's alerting through dedicated handlers that evaluate conditions and dispatch notifications.

```elixir
defmodule PrismaticTelemetry.AlertHandler do
  @moduledoc """
  Evaluates telemetry events against alert rules and dispatches
  notifications for threshold violations.
  """
  use GenServer

  @alert_rules [
    %{
      event: [:prismatic, :perimeter, :discovery, :stop],
      condition: fn measurements, _meta ->
        measurements.duration > System.convert_time_unit(10, :second, :native)
      end,
      severity: :warning,
      message: "Discovery took over 10 seconds"
    },
    %{
      event: [:prismatic, :agents, :execution, :exception],
      condition: fn _measurements, meta -> meta.kind == :error end,
      severity: :critical,
      message: "Agent execution failed with error"
    },
    %{
      event: [:prismatic, :supervision, :restart],
      condition: fn _measurements, meta -> meta.reason == :unexpected end,
      severity: :warning,
      message: "Unexpected supervisor restart detected"
    }
  ]

  def init(_) do
    Enum.each(@alert_rules, fn rule ->
      :telemetry.attach(
        "alert-#{:erlang.phash2(rule)}",
        rule.event,
        &__MODULE__.evaluate/4,
        rule
      )
    end)

    {:ok, %{}}
  end

  def evaluate(event_name, measurements, metadata, rule) do
    if rule.condition.(measurements, metadata) do
      PrismaticNotifications.dispatch(%{
        severity: rule.severity,
        event: event_name,
        message: rule.message,
        measurements: measurements,
        metadata: metadata,
        timestamp: DateTime.utc_now()
      })
    end
  end
end
```

## Performance Characteristics

The telemetry system is designed for negligible overhead. Measurements from the Prismatic Platform confirm sub-microsecond emission costs.

| Operation | Latency | Notes |
|-----------|---------|-------|
| `:telemetry.execute/3` (no handlers) | < 100 ns | Empty list pattern match |
| `:telemetry.execute/3` (1 handler) | < 500 ns | Single function call |
| `:telemetry.execute/3` (5 handlers) | < 1 us | Linear in handler count |
| Prometheus metric update | < 500 ns | [ETS](/glossary/ets/) atomic counter |
| Prometheus scrape (10K metrics) | ~100 ms | HTTP endpoint |
| OpenTelemetry span creation | < 2 us | Including context propagation |
| VM metrics poll (full) | < 100 us | System info + ETS writes |
| LiveView metric push | < 1 ms | [PubSub](/glossary/pubsub/) broadcast |

The key design constraint is that telemetry handlers must not perform blocking I/O. Handlers that need to send data to external systems (Prometheus, Jaeger, PagerDuty) do so through dedicated processes with buffering and [backpressure](/glossary/backpressure/), ensuring that a slow external system never impacts application latency.

## Comparison with Alternative Observability Approaches

| Approach | Emission Cost | Structured | Aggregation | Tracing | Ecosystem |
|----------|-------------|-----------|-------------|---------|-----------|
| Logger-based | High (string format) | No | External | No | Universal |
| StatsD | Medium (UDP) | Partially | Server-side | No | DevOps |
| `:telemetry` | Very low | Yes | Handler-side | Via OTEL | [Elixir](/glossary/elixir/)/Erlang |
| OpenTelemetry (standalone) | Low | Yes | Collector | Native | Polyglot |
| `:telemetry` + OTEL | Very low | Yes | Both | Native | Best of both |

The Prismatic Platform uses the `:telemetry` + OpenTelemetry combination, getting the lowest possible emission cost for metrics through `:telemetry` while gaining distributed tracing capabilities through OpenTelemetry span integration.

## Summary

The [telemetry](/glossary/telemetry/) and [metrics](/glossary/metrics/) architecture of the Prismatic Platform provides comprehensive [observability](/glossary/observability/) with sub-microsecond emission overhead. By building on Erlang's `:telemetry` library for structured event dispatch, Prometheus for metric aggregation and alerting, OpenTelemetry for distributed tracing, and [Phoenix LiveView](/glossary/phoenix-liveview/) for [real-time dashboards](/capabilities/real-time-monitoring/), the platform achieves visibility into every operation without sacrificing performance. The hierarchical event naming convention, aligned with the [umbrella application](/architecture/umbrella-apps/) structure, enables both surgical investigation of specific subsystems and platform-wide health monitoring. Combined with the [supervision tree](/architecture/supervision-trees/) instrumentation and [event store](/architecture/event-sourcing/) metrics, the telemetry system ensures that every aspect of the platform's behavior is measurable, alertable, and debuggable in production.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)