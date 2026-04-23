+++
title = "Telemetry-Driven Development: Observability from Day One"
date = 2026-03-14
description = "How to build observable Elixir systems using :telemetry from the start, covering event design, span patterns, custom metrics, and the OTEL doctrine pillar."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["telemetry", "observability", "elixir", "otel", "metrics"]
reading_time = "10 min"
keywords = ["elixir telemetry", "observability", "otel doctrine", "telemetry events", "metrics"]
image = "/images/blog/telemetry-driven-development.png"
word_count = 1320
date_created = "2026-03-14"
date_modified = "2026-03-14"
quality_score = 89
see_also = ["architecture", "developers", "genserver-patterns"]
image_alt = "Telemetry-Driven Development - Prismatic Platform"
+++

Adding observability after the fact is painful. Retrofitting metrics into a mature codebase means touching hundreds of files, understanding call paths, and hoping you instrument the right places. The alternative: emit telemetry events from the start and attach handlers when you need them.

The Elixir ecosystem's `:telemetry` library provides the foundation. This post covers how to design telemetry events, build span patterns, create custom metrics, and comply with the OTEL doctrine pillar.

## Telemetry Fundamentals

The `:telemetry` library is deliberately minimal. It has two core operations:

1. **Execute**: Emit a named event with measurements and metadata
2. **Attach**: Register a handler function for specific events

```elixir
# Emitting an event
:telemetry.execute(
  [:prismatic, :dd, :case, :created],          # Event name (list of atoms)
  %{duration: 42_000_000},                      # Measurements (numeric values)
  %{case_id: "abc123", user_id: "user_1"}       # Metadata (context)
)

# Attaching a handler
:telemetry.attach(
  "dd-case-logger",                              # Unique handler ID
  [:prismatic, :dd, :case, :created],            # Event to handle
  &MyApp.Telemetry.handle_event/4,               # Handler function
  %{log_level: :info}                            # Handler config
)
```

Events are synchronous. The handler runs in the caller's process. This means handlers must be fast; slow handlers block the emitting code.

## Event Naming Conventions

The Prismatic Platform uses a consistent four-level naming hierarchy:

```
[:app, :domain, :entity, :action]
```

| Event Name | Domain | Purpose |
|---|---|---|
| `[:prismatic, :dd, :case, :created]` | Due Diligence | New case created |
| `[:prismatic, :dd, :scoring, :completed]` | Due Diligence | Scoring engine finished |
| `[:prismatic, :osint, :adapter, :query]` | OSINT | Adapter query executed |
| `[:prismatic, :osint, :adapter, :error]` | OSINT | Adapter query failed |
| `[:prismatic, :web, :request, :stop]` | Web | HTTP request completed |
| `[:prismatic, :auth, :login, :success]` | Auth | Successful authentication |
| `[:prismatic, :auth, :login, :failure]` | Auth | Failed authentication |

This naming makes it trivial to attach handlers at different granularities:

```elixir
# Handle all DD events
:telemetry.attach_many("dd-metrics", [
  [:prismatic, :dd, :case, :created],
  [:prismatic, :dd, :case, :updated],
  [:prismatic, :dd, :scoring, :completed]
], &DDMetrics.handle/4, nil)

# Handle all OSINT adapter events
:telemetry.attach_many("osint-metrics", [
  [:prismatic, :osint, :adapter, :query],
  [:prismatic, :osint, :adapter, :error]
], &OSINTMetrics.handle/4, nil)
```

## Span Pattern

For operations with measurable duration, use the span pattern:

```elixir
defmodule Prismatic.DD.ScoringEngine do
  @spec score_entity(Entity.t(), keyword()) :: {:ok, Score.t()} | {:error, term()}
  def score_entity(entity, opts \\ []) do
    :telemetry.span(
      [:prismatic, :dd, :scoring, :entity],
      %{entity_id: entity.id, entity_type: entity.type},
      fn ->
        case compute_score(entity, opts) do
          {:ok, score} = result ->
            {result, %{score: score.value, source_count: length(score.sources)}}

          {:error, _reason} = error ->
            {error, %{error: true}}
        end
      end
    )
  end
end
```

`:telemetry.span/3` automatically emits two events:
- `[:prismatic, :dd, :scoring, :entity, :start]` with the initial metadata
- `[:prismatic, :dd, :scoring, :entity, :stop]` with duration and the returned metadata
- `[:prismatic, :dd, :scoring, :entity, :exception]` if the function raises

## Custom Metrics with Telemetry.Metrics

`Telemetry.Metrics` defines metric types that reporters translate to their backend format (Prometheus, StatsD, Datadog):

```elixir
defmodule PrismaticWeb.Telemetry do
  use Supervisor
  import Telemetry.Metrics

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl true
  def init(_arg) do
    children = [
      {TelemetryMetricsPrometheus, metrics: metrics()}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  defp metrics do
    [
      # Counters - count events
      counter("prismatic.dd.case.created.count",
        tags: [:user_id]
      ),

      # Sums - aggregate measurements
      sum("prismatic.osint.adapter.query.count",
        tags: [:adapter_name]
      ),

      # Last value - latest measurement
      last_value("prismatic.dd.scoring.entity.stop.duration",
        unit: {:native, :millisecond},
        tags: [:entity_type]
      ),

      # Distribution - histogram of values
      distribution("prismatic.web.request.stop.duration",
        unit: {:native, :millisecond},
        tags: [:route],
        reporter_options: [
          buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000]
        ]
      ),

      # Summary - percentiles
      summary("prismatic.osint.adapter.query.stop.duration",
        unit: {:native, :millisecond},
        tags: [:adapter_name]
      )
    ]
  end
end
```

## GenServer Telemetry

The OTEL doctrine mandates telemetry in GenServers. Wrap critical operations:

```elixir
defmodule Prismatic.OSINT.AdapterWorker do
  use GenServer
  require Logger

  @impl true
  def handle_call({:query, params}, _from, state) do
    start_time = System.monotonic_time()
    result = execute_query(params, state)
    duration = System.monotonic_time() - start_time

    :telemetry.execute(
      [:prismatic, :osint, :adapter, :query],
      %{duration: duration},
      %{
        adapter: state.adapter_name,
        query_type: params.type,
        success: match?({:ok, _}, result)
      }
    )

    {:reply, result, update_stats(state, result)}
  end

  @impl true
  def handle_info(:health_check, state) do
    :telemetry.execute(
      [:prismatic, :osint, :adapter, :health],
      %{
        query_count: state.query_count,
        error_count: state.error_count,
        uptime_ms: System.monotonic_time(:millisecond) - state.started_at
      },
      %{adapter: state.adapter_name, status: state.status}
    )

    schedule_health_check()
    {:noreply, state}
  end
end
```

## LiveView Telemetry

Phoenix LiveView emits telemetry events automatically. Attach to them for page-level metrics:

```elixir
# LiveView lifecycle events
[:phoenix, :live_view, :mount, :start]
[:phoenix, :live_view, :mount, :stop]
[:phoenix, :live_view, :handle_event, :start]
[:phoenix, :live_view, :handle_event, :stop]

# Custom LiveView telemetry
defmodule PrismaticWeb.DDDashboardLive do
  @impl true
  def handle_event("filter_cases", params, socket) do
    :telemetry.span(
      [:prismatic, :web, :dd_dashboard, :filter],
      %{user_id: socket.assigns.current_user.id},
      fn ->
        cases = Prismatic.DD.filter_cases(params)
        {cases, %{result_count: length(cases)}}
      end
    )
    |> case do
      {cases, _meta} ->
        {:noreply, assign(socket, cases: cases)}
    end
  end
end
```

## Dashboard Integration

With metrics flowing, build a LiveView dashboard for real-time visibility:

```elixir
defmodule PrismaticWeb.Admin.TelemetryDashboardLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(5_000, :refresh_metrics)
    end

    {:ok, assign(socket, metrics: fetch_current_metrics())}
  end

  @impl true
  def handle_info(:refresh_metrics, socket) do
    {:noreply, assign(socket, metrics: fetch_current_metrics())}
  end

  defp fetch_current_metrics do
    %{
      adapter_queries: TelemetryMetricsPrometheus.scrape() |> parse_adapter_metrics(),
      request_latency: fetch_latency_percentiles(),
      active_investigations: count_active_investigations()
    }
  end
end
```

## The OTEL Doctrine Checklist

Every module in the Prismatic Platform must satisfy:

| Requirement | Scope | Enforcement |
|---|---|---|
| GenServer operations emit telemetry | All GenServers | CI advisory |
| Controller actions have request metrics | All controllers | Phoenix default + custom |
| Rescue blocks include Logger calls | All try/rescue | Pre-commit ZERO check |
| API calls are instrumented | External HTTP | Middleware |
| LiveView events tracked | User interactions | Span pattern |
| Background jobs emit completion | All workers | Span pattern |

The `mix validate-otel` command checks for GenServer modules without telemetry calls and controllers without logging, flagging gaps in observability coverage.

## Summary

Telemetry is not an afterthought. Design events alongside your modules, use the span pattern for anything with duration, and keep handlers fast. The cost of emitting events is negligible compared to the debugging time saved when something goes wrong in production at 3 AM.
