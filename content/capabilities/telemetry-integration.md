+++
title = "Telemetry Integration"
weight = 12
[extra]
icon = "shield"
color = "blue"
description = "Comprehensive instrumentation layer built on Erlang :telemetry for agent operations, system health, and quality metrics"
category = "observability"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 926
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Telemetry", "Integration", "Comprehensive", "Erlang", "capabilities", "observability", "Prismatic Platform", "Duration", "Phoenix LiveView", "Real"]
tags = ["capabilities", "observability", "telemetry-integration", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Telemetry Integration - Prismatic Platform"
+++

## Overview

Telemetry Integration provides the foundational instrumentation layer for the entire Prismatic Platform. Every agent operation, system event, and quality metric is tracked through the [Elixir](/technologies/elixir/) `:telemetry` library with custom handlers and [ETS](/technologies/ets/)-backed aggregation. This is not bolted-on monitoring -- telemetry is woven into the platform's execution fabric, emitting structured events at every significant state transition across all 99 umbrella applications.

The Erlang `:telemetry` library provides the event emission and handler attachment mechanism. The Prismatic Platform extends this foundation with domain-specific event schemas, hierarchical handler chains, multi-backend aggregation, and [Phoenix LiveView](/technologies/phoenix-liveview/)-powered real-time visualization. The result is a telemetry system where adding observability to a new module requires a single `:telemetry.execute/3` call, with all downstream aggregation, storage, and visualization handled automatically.

Telemetry Integration serves as the data backbone for [Real-Time Monitoring](/capabilities/real-time-monitoring/), [Autonomous Self-Healing](/capabilities/autonomous-self-healing/), and [Quality Gates](/capabilities/quality-gates/) -- providing the raw signal data that these systems consume, analyze, and act upon. Without telemetry, the platform would be flying blind; with it, every operation is observable, measurable, and traceable.

## Erlang Telemetry Library Foundation

The `:telemetry` library (maintained by the [BEAM](/technologies/beam/) community) provides a lightweight, composable instrumentation API. The Prismatic Platform uses it as the universal event bus for all observable operations.

### Core Concepts

| Concept | Description | Platform Usage |
|---------|-------------|----------------|
| **Event** | Named list identifying what happened | `[:prismatic, :agent, :execute, :stop]` |
| **Measurements** | Numeric values (duration, count, size) | `%{duration: 142, result_count: 5}` |
| **Metadata** | Context (who, what, where) | `%{agent: "red-commander", domain: :security}` |
| **Handler** | Function called when event fires | ETS aggregation, PubSub broadcast, logging |
| **Span** | Start/stop event pair for duration tracking | Agent operation timing, HTTP request duration |

### Event Lifecycle

The telemetry event lifecycle follows a simple three-step pattern: emit, handle, aggregate. The `:telemetry.span/3` function provides automatic start/stop/exception event emission for duration-tracked operations:

```elixir
# Span-based instrumentation (automatic start/stop/exception events)
:telemetry.span(
  [:prismatic, :agent, :execute],
  %{agent: agent_name},
  fn ->
    result = Agent.execute(agent_name, operation)
    {result, %{result_count: length(result.findings)}}
  end
)
# Automatically emits:
#   [:prismatic, :agent, :execute, :start]     - with metadata
#   [:prismatic, :agent, :execute, :stop]       - with duration + metadata
#   [:prismatic, :agent, :execute, :exception]  - on failure, with kind + reason
```

### Design Principles

The platform's telemetry implementation follows several design principles that ensure consistency and maintainability:

| Principle | Description | Benefit |
|-----------|-------------|---------|
| **Zero-cost when unobserved** | Events with no attached handlers are no-ops | No performance penalty for unused events |
| **Consistent naming** | All events follow `[:app, :domain, :operation, :phase]` pattern | Predictable, discoverable event names |
| **Rich metadata** | Every event includes full operational context | Complete information for debugging |
| **Immutable events** | Events are emitted once and never modified | Reliable audit trail |
| **Handler isolation** | Handler failures do not affect the emitting process | Fault-tolerant observability |

## Telemetry Event Hierarchy

The platform organizes telemetry events in a hierarchical namespace that mirrors the application structure:

| Category | Event Pattern | Measurements | Metadata |
|----------|---------------|-------------|----------|
| **Agent Operations** | `[:prismatic, :agent, :execute, :*]` | Duration, result count | Agent name, tier, domain, result |
| **Quality Metrics** | `[:prismatic, :quality, :check, :*]` | Score, violation count | Domain, check type, severity |
| **Session Lifecycle** | `[:prismatic_claude, :session_lifecycle, :*]` | Duration, hook count | Phase, session ID, hook results |
| **Stack Conversation** | `[:prismatic_claude, :stack_conversation, :*]` | Frame count, depth | Operation type, frame ID |
| **HTTP Requests** | `[:prismatic_web, :request, :*]` | Duration, response size | Path, method, status code |
| **Storage Operations** | `[:prismatic_storage, :operation, :*]` | Duration, record count | Adapter, operation type, table |
| **OSINT Collection** | `[:prismatic_osint, :collect, :*]` | Duration, source count | Provider, query type, result count |
| **EASM Scanning** | `[:prismatic_perimeter, :scan, :*]` | Duration, asset count | Target, scan type, findings |
| **Healing Operations** | `[:prismatic_safety, :autoheal, :*]` | Duration, fix count | Level, pattern type, outcome |

## Handler Implementation

Telemetry handlers are the bridge between raw event emission and actionable data. The Prismatic Platform implements domain-specific handlers that aggregate events into [ETS](/technologies/ets/) tables and broadcast updates to [Phoenix LiveView](/technologies/phoenix-liveview/) dashboards.

### Agent Operations Handler

```elixir
defmodule PrismaticTelemetry.AgentHandler do
  @moduledoc """
  Handles telemetry events from agent operations.
  Aggregates metrics into ETS and broadcasts to LiveView dashboards.
  """

  require Logger

  def handle_event(
    [:prismatic, :agent, :execute, :stop],
    %{duration: duration},
    %{agent: agent_name, result: result},
    _config
  ) do
    # Update ETS counters (atomic, lock-free, concurrent-safe)
    :ets.update_counter(:agent_metrics, {agent_name, :total_ops}, 1)
    :ets.update_counter(:agent_metrics, {agent_name, :total_duration}, duration)

    # Track success/failure ratio
    result_key = if result == :ok, do: :success, else: :failure
    :ets.update_counter(:agent_metrics, {agent_name, result_key}, 1)

    # Broadcast to LiveView dashboards via PubSub
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "telemetry:agents",
      {:agent_metric, agent_name, duration, result}
    )
  end

  def handle_event(
    [:prismatic, :agent, :execute, :exception],
    %{duration: duration},
    %{agent: agent_name, kind: kind, reason: reason},
    _config
  ) do
    :ets.update_counter(:agent_metrics, {agent_name, :exceptions}, 1)
    Logger.error("Agent #{agent_name} exception: #{kind} - #{inspect(reason)}")

    # Trigger self-healing assessment via Quality Floor Guardian
    PrismaticSafety.QualityFloorGuardian.report_anomaly(agent_name, :exception, reason)
  end
end
```

### Handler Registration

All telemetry handlers are registered during application startup, establishing the complete observability pipeline before any monitored operations begin:

```elixir
defmodule PrismaticTelemetry.Application do
  @moduledoc """
  Registers all telemetry handlers at application startup.
  Establishes the complete observability pipeline.
  """

  def start(_type, _args) do
    # Agent operation handlers
    :telemetry.attach_many("prismatic-agent-handlers", [
      [:prismatic, :agent, :execute, :start],
      [:prismatic, :agent, :execute, :stop],
      [:prismatic, :agent, :execute, :exception]
    ], &PrismaticTelemetry.AgentHandler.handle_event/4, %{})

    # Quality metric handlers
    :telemetry.attach_many("prismatic-quality-handlers", [
      [:prismatic, :quality, :check, :stop],
      [:prismatic, :quality, :gate, :stop]
    ], &PrismaticTelemetry.QualityHandler.handle_event/4, %{})

    # Storage operation handlers
    :telemetry.attach_many("prismatic-storage-handlers", [
      [:prismatic_storage, :operation, :stop],
      [:prismatic_storage, :operation, :exception]
    ], &PrismaticTelemetry.StorageHandler.handle_event/4, %{})

    # HTTP request handlers
    :telemetry.attach_many("prismatic-http-handlers", [
      [:prismatic_web, :request, :stop]
    ], &PrismaticTelemetry.HttpHandler.handle_event/4, %{})

    # Session lifecycle handlers
    :telemetry.attach_many("prismatic-session-handlers", [
      [:prismatic_claude, :session_lifecycle, :start],
      [:prismatic_claude, :session_lifecycle, :end]
    ], &PrismaticTelemetry.SessionHandler.handle_event/4, %{})

    Supervisor.start_link([], strategy: :one_for_one)
  end
end
```

## Multi-Backend Aggregation Architecture

Raw telemetry events are processed through a tiered storage architecture optimized for different query patterns and retention requirements:

| Backend | Purpose | Retention | Query Pattern |
|---------|---------|-----------|---------------|
| **[ETS](/technologies/ets/)** | Real-time counters, gauges, recent events | Session lifetime | Current state, live dashboards |
| **[PostgreSQL](/technologies/postgresql/)** | Historical metrics, time-series rollups | 90 days | Trend analysis, capacity planning |
| **[Phoenix LiveView](/technologies/phoenix-liveview/)** | Dashboard visualization | Real-time | Human monitoring and investigation |
| **Structured Logs** | Full event trace with context | 30 days | Incident investigation, debugging |

### Time-Series Rollup Pipeline

```
Raw Events (ETS) --> 1-min Rollup (ETS) --> 5-min Rollup (PG) --> Hourly (PG) --> Daily (PG)
     |                    |                      |                    |              |
  Instant            Counters              Aggregates          Summaries       Long-term
  Access             + Rates               + Percentiles       + Trends        Archives
```

### ETS Table Structure

```elixir
# Real-time agent metrics table (created at application startup)
:ets.new(:agent_metrics, [:named_table, :public, :set, read_concurrency: true])

# Table entries follow a consistent key structure:
# {{"blue-commander", :total_ops}, 15234}        # Total operations
# {{"blue-commander", :success}, 15201}           # Successful operations
# {{"blue-commander", :failure}, 33}              # Failed operations
# {{"blue-commander", :total_duration}, 2145000}  # Cumulative duration (microseconds)
# {{"blue-commander", :last_duration}, 142}       # Most recent duration (microseconds)
# {{"blue-commander", :exceptions}, 0}            # Exception count
```

## Metrics Collection Patterns

The platform standardizes four telemetry collection patterns, each suited to different measurement scenarios:

### Counter Pattern

Tracks cumulative counts of discrete events:

```elixir
# Increment counter on event occurrence
:telemetry.execute(
  [:prismatic, :osint, :query],
  %{count: 1},
  %{source: "shodan", query_type: :domain_lookup}
)
```

### Gauge Pattern

Reports the current value of a continuously changing metric:

```elixir
# Report current memory usage
:telemetry.execute(
  [:prismatic, :system, :memory],
  %{bytes: :erlang.memory(:total)},
  %{node: Node.self()}
)
```

### Histogram Pattern

Reports individual values for distribution analysis (percentiles, averages):

```elixir
# Report query duration for latency distribution
:telemetry.execute(
  [:prismatic, :storage, :query],
  %{duration: query_duration_native},
  %{adapter: :ecto, table: "assets", operation: :select}
)
```

### Summary Pattern

Reports multiple measurements from a single operation:

```elixir
# Report pipeline stage with multiple metrics
:telemetry.execute(
  [:prismatic, :pipeline, :stage],
  %{
    duration: stage_duration_native,
    input_count: input_count,
    output_count: output_count,
    error_count: error_count,
    filtered_count: input_count - output_count - error_count
  },
  %{stage: :normalization, pipeline: :osint, batch_id: batch_id}
)
```

## Dashboard Integration

The LiveView dashboards subscribe to PubSub topics and update in real time as telemetry events flow through the system:

| Dashboard | Telemetry Source | Update Frequency | Key Metrics |
|-----------|-----------------|-------------------|-------------|
| **Quality Overview** | `[:prismatic, :quality, :*]` | Per quality check | Score, violations, domain status |
| **Agent Operations** | `[:prismatic, :agent, :*]` | Per agent operation | Op count, latency, success rate |
| **System Health** | `[:prismatic, :system, :*]` | Every 10 seconds | Memory, CPU, processes, schedulers |
| **Perimeter** | `[:prismatic_perimeter, :*]` | Per scan cycle | Assets, ratings, compliance status |
| **OSINT Pipeline** | `[:prismatic_osint, :*]` | Per collection | Sources, entities, freshness |

### Performance Monitoring Thresholds

| Metric | Collection Method | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|--------------------|
| **Agent p95 latency** | `:telemetry.span` duration | > 500ms | > 1s |
| **Quality gate duration** | Span-based timing | > 30s | > 60s |
| **ETS table size** | `:ets.info/2` periodic | > 1M entries | > 5M entries |
| **Process count** | `:erlang.system_info(:process_count)` | > 100K | > 250K |
| **Scheduler utilization** | `:scheduler_wall_time` | > 80% sustained | > 95% sustained |
| **Memory usage** | `:erlang.memory/0` | > 70% of system | > 85% of system |
| **GC frequency** | Process GC telemetry | > 100/s per process | > 500/s per process |

## Custom Instrumentation Guide

Adding telemetry to a new module follows a consistent pattern across the platform:

```elixir
defmodule Prismatic.Perimeter.Scanner do
  @moduledoc """
  Example of properly instrumented module.
  All public operations emit telemetry events.
  """

  @spec scan(domain :: String.t(), opts :: keyword()) :: {:ok, map()} | {:error, term()}
  def scan(domain, opts \\ []) do
    # Use :telemetry.span for automatic duration tracking
    :telemetry.span(
      [:prismatic_perimeter, :scan],
      %{domain: domain, scan_type: Keyword.get(opts, :type, :full)},
      fn ->
        case do_scan(domain, opts) do
          {:ok, results} ->
            {{:ok, results}, %{
              asset_count: length(results.assets),
              finding_count: length(results.findings),
              status: :ok
            }}

          {:error, reason} = error ->
            {error, %{status: :error, reason: reason}}
        end
      end
    )
  end

  defp do_scan(domain, opts) do
    # Actual scanning implementation
    {:ok, %{assets: [], findings: []}}
  end
end
```

## Integration Points

Telemetry Integration serves as the data backbone connecting all observability capabilities:

- Powers [Real-Time Monitoring](/capabilities/real-time-monitoring/) with event-driven metric data
- Feeds [Quality Gates](/capabilities/quality-gates/) with metrics for automated pass/fail decisions
- Tracked by [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) for anomaly detection and response
- Governed by [NO MERCY](/capabilities/no-mercy/) completeness requirements -- no uninstrumented public operations
- Supports [AIAD Standard](/capabilities/aiad-standard/) through comprehensive agent operation tracking
- Enables [Intelligence Synthesis](/capabilities/intelligence-synthesis/) pipeline performance monitoring
- Feeds [Color Teams](/capabilities/color-teams/) Blue Team drift detection with behavioral baselines
- Validated by [NO DOUBTS](/capabilities/no-doubts/) evidence requirements through measurable metrics
- Visualized through [Phoenix LiveView](/technologies/phoenix-liveview/) dashboards with [TailwindCSS](/technologies/tailwindcss/) styling
- Session events tracked per [Session Discipline](/capabilities/session-discipline/) protocol

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/telemetry status` | Display current telemetry handler status | Universal |
| `/telemetry events` | List all registered telemetry events | Universal |
| `/telemetry metrics` | Display current metric values | Universal |
| `/telemetry handlers` | List attached handlers with configuration | System |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)