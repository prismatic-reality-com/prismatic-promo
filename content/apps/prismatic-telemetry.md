+++
title = "Prismatic Telemetry"
weight = 14
[extra]
icon = "activity"
color = "orange"
description = "Observability infrastructure with metrics, events, and distributed tracing"
category = "Infrastructure"
files = "180"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1031
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Telemetry", "Observability", "apps", "Infrastructure", "Prismatic Platform", "Quality", "Event"]
tags = ["apps", "infrastructure", "prismatic-telemetry", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Telemetry - Prismatic Platform"
+++

## Overview

Prismatic [Telemetry](/glossary/telemetry/) provides the platform's [observability](/glossary/observability/) infrastructure, built on the Erlang `:telemetry` library. It captures [metrics](/glossary/metrics/), events, and traces across all 90 applications in the umbrella, enabling [real-time monitoring](/capabilities/real-time-monitoring/), performance analysis, and operational intelligence.

Every significant operation in the platform emits telemetry events -- from [storage adapter](/apps/prismatic-storage/) operations to [agent executions](/apps/prismatic-agents/), [session lifecycle](/apps/prismatic-claude/) hooks, and [security team](/apps/prismatic-dark/) simulations. This creates a comprehensive observability layer without coupling application code to specific monitoring backends. The decoupled event model means that new monitoring backends can be added by registering handlers, without modifying any application code that emits events.

The telemetry infrastructure serves as the nervous system of the platform, providing the feedback loops that enable autonomous evolution, quality monitoring, performance optimization, and anomaly detection. Without comprehensive observability, the platform's self-healing and auto-evolution capabilities would operate blind.

## Architecture

```
Application Code --> :telemetry.execute/3
                        |
                   Event Router (registered handlers)
                        |
              +----+----+----+
              |         |         |
         Prometheus   StatsD   Console
         Reporter    Reporter  Reporter
              |         |         |
          Grafana    Datadog    Logs
```

The architecture follows the observer pattern through `:telemetry`'s handler registration mechanism. Application code emits events by calling `:telemetry.execute/3` with an event name, measurements map, and metadata map. Handlers registered for that event name receive the data and route it to the appropriate backend. This decoupling ensures that application code is free of monitoring concerns -- it emits events and moves on, with zero performance impact if no handlers are registered.

### OTP Integration

```elixir
# PrismaticTelemetry starts as part of the supervision tree
defmodule PrismaticTelemetry.Application do
  use Application

  def start(_type, _args) do
    children = [
      {PrismaticTelemetry.Supervisor, []},
      {TelemetryMetricsPrometheus, metrics: PrismaticTelemetry.Metrics.metrics()},
      PrismaticTelemetry.EventLogger
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

## Event Model and Naming Conventions

Telemetry events follow a hierarchical naming convention that enables both fine-grained and aggregate monitoring. Event names are lists of atoms, with the first element identifying the platform (`prismatic`), the second identifying the subsystem, and subsequent elements identifying the specific operation. This structure allows handlers to register for broad event categories (all storage events) or specific operations (ETS cache misses).

The event model distinguishes between three types of telemetry data: measurements (numeric values like duration, count, and size), metadata (contextual information like adapter name, query type, and user identifier), and span events (paired start/stop events that bracket an operation for distributed tracing). All three types use the same `:telemetry.execute/3` mechanism, with the event name suffix indicating the type (`:start`, `:stop`, `:exception` for spans).

### Platform Event Catalog

| Namespace | Events | Examples |
|-----------|--------|---------|
| `prismatic.osint.*` | [OSINT](/glossary/osint/) queries, results, errors | query duration, result count |
| `prismatic.storage.*` | Adapter operations | read/write latency, cache hits |
| `prismatic.agents.*` | Agent execution lifecycle | dispatch, completion, errors |
| `prismatic.claude.*` | Session and stack events | frame creation, hook execution |
| `prismatic.safety.*` | Quality monitoring | score changes, gate results |
| `prismatic.perimeter.*` | [EASM](/glossary/easm/) operations | discovery, rating, compliance |
| `prismatic.dark.*` | Security simulations | scenario execution, findings |
| `prismatic.web.*` | HTTP request lifecycle | latency, status codes |

## Metric Types and Definitions

The platform defines four metric types that map to standard monitoring system primitives. Each metric type serves a different analytical purpose and maps to appropriate storage and visualization strategies in the monitoring backend.

```elixir
defmodule PrismaticTelemetry.Metrics do
  import Telemetry.Metrics

  def metrics do
    [
      # Counters - monotonically increasing totals
      counter("prismatic.osint.query.count",
        tags: [:source],
        description: "Total OSINT queries"
      ),

      # Distributions (histograms) - value spread analysis
      distribution("prismatic.osint.query.duration",
        unit: {:native, :millisecond},
        tags: [:source],
        description: "OSINT query latency distribution"
      ),

      # Summaries - statistical summaries over time
      summary("prismatic.storage.operation.duration",
        unit: {:native, :microsecond},
        tags: [:adapter, :operation],
        description: "Storage operation latency"
      ),

      # Last value gauges - current state snapshots
      last_value("prismatic.safety.quality_score",
        description: "Current platform quality score"
      ),

      last_value("prismatic.agents.active_count",
        description: "Currently active agent count"
      )
    ]
  end
end
```

**Counters** track cumulative totals that only increase. They answer questions like "how many OSINT queries have been executed since startup?" and are used for throughput calculation when combined with time windows. **Distributions** capture the spread of values (typically latencies), enabling percentile analysis -- P50, P95, P99 latencies are derived from distribution metrics. **Summaries** provide pre-computed statistical summaries (min, max, mean, percentiles) over configurable time windows. **Gauges** capture point-in-time values that can increase or decrease, suitable for metrics like queue depth, active connection count, and quality scores.

## Reporter Integration

The telemetry system supports multiple reporter backends simultaneously, enabling different monitoring tools to consume the same event stream for different purposes.

```elixir
# Configuration for multiple reporter backends
config :prismatic_telemetry,
  reporters: [
    {TelemetryMetricsPrometheus, metrics: PrismaticTelemetry.Metrics.metrics()},
    {TelemetryMetricsStatsd, metrics: PrismaticTelemetry.Metrics.metrics()},
    {PrismaticTelemetry.ConsoleReporter, metrics: PrismaticTelemetry.Metrics.metrics()}
  ]
```

The Prometheus reporter exposes metrics at an HTTP endpoint for scraping by Prometheus servers. The StatsD reporter pushes metrics to StatsD-compatible aggregation services. The Console reporter logs metric summaries to the Elixir logger for development and debugging. All reporters receive the same events and apply their own aggregation and formatting logic.

Custom reporters can be added by implementing the `TelemetryMetrics.Reporter` behaviour, enabling integration with proprietary monitoring systems or custom dashboards without modifying the core telemetry infrastructure.

## Alert Rules and Anomaly Detection

The telemetry system includes a lightweight alerting layer that monitors metric trends and triggers notifications when thresholds are exceeded. Alert rules are defined declaratively and evaluated on a configurable interval.

```elixir
# Example alert configuration
%{
  name: "high_osint_latency",
  metric: "prismatic.osint.query.duration",
  condition: :p99_above,
  threshold: 5_000,  # 5 seconds
  window: :timer.minutes(5),
  action: :alert_ops_team
}
```

Alert conditions support threshold-based (static value exceeded), trend-based (rate of change exceeds threshold), and anomaly-based (deviation from historical baseline) detection. The anomaly detection uses a simple rolling standard deviation model -- metrics that deviate more than three standard deviations from the rolling mean trigger an anomaly alert. This statistical approach adapts to seasonal patterns and gradual trends without requiring manual threshold updates.

## Key Features

### Event-Based Metrics

```elixir
# Emit a custom telemetry event
:telemetry.execute(
  [:prismatic, :osint, :query],
  %{duration: 1_250_000, result_count: 42},
  %{source: :shodan, query: "org:Example"}
)

# Attach a handler for monitoring
:telemetry.attach(
  "osint-query-monitor",
  [:prismatic, :osint, :query],
  fn event, measurements, metadata, _config ->
    Logger.info("OSINT query to #{metadata.source}: #{measurements.duration}ns")
  end,
  nil
)
```

### Dashboards

Key operational metrics surfaced through the monitoring infrastructure:
- OSINT query throughput and latency per provider
- Storage adapter performance comparison across all 6 backends
- Agent execution success rates and average duration
- Quality score trends across 13 quality domains
- HTTP request performance with percentile breakdowns
- Active user sessions and concurrent connection counts

## Testing

```bash
mix test apps/prismatic_telemetry/test
mix test apps/prismatic_telemetry/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Event Emission | 12 | Correct event names, measurements, metadata |
| Handler Registration | 8 | Handler attachment, detachment, error isolation |
| Metric Aggregation | 10 | Counter, distribution, summary, gauge accuracy |
| Reporter Integration | 6 | Prometheus, StatsD, Console output correctness |
| Alert Rules | 8 | Threshold, trend, anomaly detection accuracy |

## Dependencies

| Application | Relationship |
|-------------|-------------|
| All 90 apps | Event emission from every application |
| [Prismatic Web](/apps/prismatic-web/) | Dashboard metric visualization |
| [Prismatic Safety](/apps/prismatic-safety/) | Quality score monitoring |
| [Prismatic Claude](/apps/prismatic-claude/) | Session lifecycle telemetry |

## NABLA Compliance

The telemetry system is the primary mechanism for satisfying the Provenance Mandatory axiom across the entire platform. Every storage operation, agent execution, and intelligence query emits events with timestamps, source identifiers, and operation metadata that constitute a comprehensive provenance trail. The Time Decay axiom is implemented through metric window configurations that weight recent observations more heavily in alerting calculations. Signal Plurality is supported by the multi-reporter architecture -- the same events can be analyzed independently by different monitoring backends, providing multiple perspectives on platform behavior.

## Related Agents

- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages metric-based alerting rules and anomaly detection
- [CI/CD Guardrails Enforcer](/agents/cicd-guardrails-enforcer/) -- Enforces telemetry coverage requirements in CI/CD pipelines
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews telemetry event design and reporter backend topology

## Related Capabilities

- [Telemetry Integration](/capabilities/telemetry-integration/) -- Platform-wide observability infrastructure spanning all 90 applications
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Sub-second event processing with multi-backend reporter integration
- [Quality Gates](/capabilities/quality-gates/) -- Quality score monitoring and performance regression detection via telemetry

## Production Status

**Status**: Production Core - Always Active
**Event Volume**: 10K+ events per minute
**Reporter Backends**: Prometheus, StatsD, Console
**Metric Coverage**: All 90 applications instrumented
**Alert Latency**: Sub-second event processing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)