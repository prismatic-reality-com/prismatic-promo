+++
title = "Prismatic OSINT Monitoring"
weight = 35
[extra]
icon = "eye"
color = "indigo"
description = "Continuous OSINT monitoring with change detection and alerting"
category = "OSINT"
files = "170"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 815
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Monitoring", "Continuous", "apps", "Prismatic Platform", "PrismaticOsintMonitoring", "Prometheus", "Telemetry", "Supervisor"]
tags = ["apps", "osint", "prismatic-osint-monitoring", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Monitoring - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](/glossary/osint/) Monitoring provides comprehensive observability infrastructure for the platform's intelligence collection operations. The application implements health monitoring, telemetry aggregation, distributed tracing, alert management, and Prometheus metrics export -- ensuring that the platform's 121+ OSINT source adapters, processing pipelines, and storage systems operate reliably under production conditions. In a system that continuously collects, processes, and stores intelligence data from dozens of external sources, operational visibility is not a convenience but a fundamental requirement for maintaining data quality and system reliability.

The application is structured around three core subsystems: health checking, telemetry, and distributed tracing. The Health Check subsystem periodically probes all platform services, aggregates health status across components, and exposes a unified health endpoint for load balancer integration and operator dashboards. The Telemetry subsystem implements custom handlers that transform raw [Elixir telemetry](/glossary/telemetry/) events into structured metrics suitable for Prometheus scraping and dashboard visualization. The Distributed Tracing subsystem provides request-level observability across the platform's microservice-style umbrella applications, enabling operators to trace a single intelligence query from initial API request through OSINT source collection, data normalization, and storage -- identifying bottlenecks and failure points along the way.

The Alert Manager provides severity-based alert classification, deduplication, correlation, and multi-channel notification delivery. When health checks detect degraded services, latency thresholds are exceeded, or error rates spike, the Alert Manager classifies the situation by severity and routes notifications through configured channels (email, webhook, [PubSub](/glossary/pubsub/), Slack) with automatic escalation for unacknowledged critical alerts.

## Architecture

```
PrismaticOsintMonitoring.Application
+-- HealthCheck.Supervisor (:one_for_one)
|   +-- HealthCheck.Scheduler (GenServer)
|   |   +-- Configurable check intervals per service
|   |   +-- Priority-based scheduling queue
|   |   +-- Exponential backoff on repeated failures
|   |
|   +-- HealthCheck.Aggregator (GenServer)
|       +-- ETS: :health_status (per-service status cache)
|       +-- Composite health computation
|       +-- Trend analysis for degradation detection
|
+-- Telemetry.Supervisor (:one_for_one)
|   +-- Telemetry.Handlers (attached to :telemetry events)
|   |   +-- OSINT collection metrics
|   |   +-- Storage adapter metrics
|   |   +-- Pipeline throughput metrics
|   |
|   +-- Telemetry.MetricsRegistry (GenServer)
|       +-- Prometheus counter/gauge/histogram definitions
|       +-- Custom metric aggregation windows
|
+-- Tracing.Supervisor (:one_for_one)
|   +-- Tracing.Setup (initialization)
|   +-- Tracing.Instrumentation (span management)
|
+-- AlertManager (GenServer)
|   +-- Severity classification engine
|   +-- Deduplication and correlation
|   +-- Multi-channel notification dispatch
|   +-- Escalation timer management
|
+-- PrometheusExporter (Plug)
|   +-- /metrics endpoint for Prometheus scraping
|
+-- HealthEndpoint (Plug)
    +-- /health endpoint for load balancer probes
```

```
Platform Events --> Telemetry Handlers --> Metrics Registry --> Prometheus Exporter
                         |                                            |
                   Health Scheduler --> Health Aggregator --> Health Endpoint
                         |                     |
                   Tracing Setup --> Instrumentation --> Distributed Traces
                         |
                   Alert Manager --> Notification Channels --> Escalation
```

The architecture follows [OTP](/glossary/otp/) supervision principles with each subsystem isolated under its own supervisor. Telemetry handlers are attached at application startup and process events asynchronously, ensuring zero impact on the critical path of intelligence operations. The Prometheus exporter runs as a Plug endpoint that Prometheus instances scrape at configured intervals, decoupling metric collection from metric storage.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticOsintMonitoring` | Main API facade for health, metrics, and alert operations |
| `PrismaticOsintMonitoring.Application` | OTP application entry point with supervision tree |
| `PrismaticOsintMonitoring.HealthCheck.Scheduler` | Configurable periodic health probes across all platform services |
| `PrismaticOsintMonitoring.HealthCheck.Aggregator` | Composite health status computation with trend detection |
| `PrismaticOsintMonitoring.HealthCheck.Supervisor` | Supervisor for health check processes |
| `PrismaticOsintMonitoring.Telemetry.Handlers` | Custom telemetry event handlers for OSINT-specific metrics |
| `PrismaticOsintMonitoring.Telemetry.MetricsRegistry` | Prometheus metric definitions and aggregation configuration |
| `PrismaticOsintMonitoring.Telemetry.Supervisor` | Supervisor for telemetry processes |
| `PrismaticOsintMonitoring.Tracing.Setup` | Distributed tracing initialization and configuration |
| `PrismaticOsintMonitoring.Tracing.Instrumentation` | Span creation, context propagation, and trace management |
| `PrismaticOsintMonitoring.Tracing.Supervisor` | Supervisor for tracing infrastructure |
| `PrismaticOsintMonitoring.AlertManager` | Alert classification, deduplication, and notification routing |
| `PrismaticOsintMonitoring.PrometheusExporter` | Plug-based `/metrics` endpoint for Prometheus scraping |
| `PrismaticOsintMonitoring.HealthEndpoint` | Plug-based `/health` endpoint for load balancer probes |

## Health Monitoring

The health check subsystem provides multi-level service health assessment.

### Health Check Types

| Check Type | Targets | Interval | Timeout |
|-----------|---------|----------|---------|
| **Liveness** | OSINT source API connectivity | 30s | 5s |
| **Readiness** | Storage adapter availability | 15s | 3s |
| **Deep Health** | End-to-end query execution | 60s | 10s |
| **Dependency** | External service reachability | 30s | 5s |

### Health Status Model

```elixir
# Check system-wide health
{:ok, health} = PrismaticOsintMonitoring.health()
# => %{
#   status: :healthy,
#   components: %{
#     osint_sources: %{status: :healthy, checked: 121, healthy: 119, degraded: 2},
#     storage: %{status: :healthy, adapters: [:ets, :ecto, :meilisearch, :kuzudb]},
#     pipeline: %{status: :healthy, throughput: 1247, latency_p99: 45}
#   },
#   timestamp: ~U[2026-02-15 10:30:00Z]
# }
```

## Telemetry and Metrics

### OSINT-Specific Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `osint.source.query.duration` | Histogram | Per-source query latency distribution |
| `osint.source.query.count` | Counter | Total queries per source |
| `osint.source.query.error` | Counter | Failed queries per source |
| `osint.source.quota.remaining` | Gauge | Remaining API quota per source |
| `osint.pipeline.throughput` | Counter | Events processed per pipeline stage |
| `osint.pipeline.backpressure` | Gauge | Current backpressure level |
| `osint.entity.resolution.matches` | Counter | Entity resolution match count |
| `osint.storage.write.duration` | Histogram | Storage write latency |

## Configuration

```elixir
config :prismatic_osint_monitoring,
  # Health check configuration
  health_check_interval: :timer.seconds(30),
  health_check_timeout: :timer.seconds(5),
  degraded_threshold: 3,  # consecutive failures before degraded

  # Telemetry
  telemetry_prefix: [:prismatic_osint_monitoring],
  prometheus_port: 9090,

  # Alert management
  alert_channels: [:email, :webhook, :pubsub],
  alert_dedup_window: :timer.minutes(5),
  escalation_timeout: :timer.minutes(15),

  # Tracing
  tracing_enabled: true,
  trace_sample_rate: 0.1  # 10% sampling in production
```

## API Reference

```elixir
# Get aggregated health status
{:ok, health} = PrismaticOsintMonitoring.health()

# Check specific source health
{:ok, status} = PrismaticOsintMonitoring.source_health(:shodan)
# => %{status: :healthy, latency_p50: 120, latency_p99: 450, error_rate: 0.01}

# Query monitoring metrics
{:ok, metrics} = PrismaticOsintMonitoring.metrics(
  sources: [:shodan, :censys],
  period: :last_1h,
  resolution: :minute)

# Manage alerts
{:ok, alerts} = PrismaticOsintMonitoring.active_alerts(severity: [:high, :critical])
:ok = PrismaticOsintMonitoring.acknowledge_alert(alert_id, note: "Investigating")

# Create a distributed trace span
PrismaticOsintMonitoring.Tracing.Instrumentation.with_span(
  "osint.query.shodan", %{source: :shodan, query: "example.com"},
  fn -> Shodan.query("example.com") end)
```

## Testing

```bash
# Run all monitoring tests
cd apps/prismatic_osint_monitoring && mix test

# Run with coverage
mix test --cover

# Run health check tests
mix test test/prismatic_osint_monitoring/health_check

# Run telemetry handler tests
mix test test/prismatic_osint_monitoring/telemetry

# Run alert manager tests
mix test test/prismatic_osint_monitoring/alert_manager_test.exs
```

Testing covers health check scheduling and aggregation logic, telemetry handler correctness for all metric types, alert deduplication and correlation accuracy, Prometheus metric export format compliance, and distributed tracing span propagation. Integration tests verify end-to-end monitoring from event emission through metric export to Prometheus-compatible output.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Core OSINT collection framework emitting telemetry events for monitoring |
| [Prismatic OSINT Network](/apps/prismatic-osint-network/) | Network intelligence source health tracking and quota monitoring |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Alert events feed into threat detection rule evaluation |
| [Prismatic Signals](/apps/prismatic-signals/) | Monitoring alerts emitted as signals for platform-wide consumption |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Platform-wide telemetry infrastructure that OSINT monitoring extends |
| [Prismatic Web](/apps/prismatic-web/) | LiveView dashboards consuming health and metric data for visualization |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- every alert traceable to specific health check or metric threshold | Alert provenance chain from telemetry event through classification to notification |
| Time Decay | HARD -- health status carries freshness metadata | Stale health checks flagged with last-checked timestamps |
| Signal Plurality | SOFT -- degraded status requires multiple consecutive failures | Configurable threshold before service marked degraded |
| Source Independence | HARD -- per-source health tracking independent of other sources | Each OSINT source has isolated health check state |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Health check cycle | 30s per service | Configurable interval |
| Health aggregation | < 5ms | ETS-backed status cache |
| Telemetry handler overhead | < 0.1ms | Per event, async processing |
| Prometheus export | < 50ms | Full metric set serialization |
| Alert classification | < 5ms | Rule-based severity assignment |
| Alert deduplication | < 1ms | Sliding window hash comparison |
| Distributed trace overhead | < 0.5ms | Per span creation |

## Related Resources

- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- [EASM](/glossary/easm/) uses monitoring for continuous attack surface tracking
- [Prismatic Crawler Core](/apps/prismatic-crawler-core/) -- Web crawling infrastructure health monitored by this application
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Platform-wide telemetry infrastructure
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous surveillance and adaptive frequency adjustment
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Semantic change significance scoring and cross-source alert correlation
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Collection health metrics and source performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)