+++
title = "performance-monitoring-specialist"
weight = 295
[extra]
domain = "infrastructure"
level = "L3"
description = "Application performance monitoring with latency and throughput analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["performance-monitoring-specialist", "Application", "agents", "agent", "Prismatic Platform", "LiveView", "BEAM", "HTTP", "Tracks"]
tags = ["agents", "agent", "performance-monitoring-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "performance-monitoring-specialist - Prismatic Platform"
+++

## Overview

The Performance Monitoring Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, providing continuous application performance monitoring with comprehensive latency and throughput analysis across the platform's 90 [umbrella application](@/glossary/umbrella-application.md)s. Unlike benchmarking agents that measure performance under controlled conditions, this specialist monitors live production performance, detecting anomalies, degradation trends, and capacity constraints in real-time operational environments.

Built on the [AIAD](@/glossary/aiad.md) standard and deeply integrated with the platform's [telemetry](@/glossary/telemetry.md) infrastructure, the agent ingests telemetry events from every platform subsystem, computing rolling performance statistics, maintaining historical baselines, and triggering alerts when metrics breach defined thresholds. The [NO DOUBTS](@/glossary/no-doubts.md) principle governs alert accuracy: alerts are issued only when statistical analysis confirms that observed anomalies represent genuine performance changes rather than transient variance, minimizing alert fatigue while ensuring that real issues are detected promptly.

## Theoretical Foundations

Application performance monitoring in a [BEAM](@/glossary/beam.md) runtime environment requires understanding of the runtime's distinctive performance characteristics. The BEAM scheduler's preemptive model based on reduction counts creates different performance profiles than thread-based runtimes: latency is generally more consistent under load due to fair scheduling, but garbage collection pauses and process mailbox buildup can create latency spikes that are unique to the BEAM ecosystem.

The agent's anomaly detection system employs multiple complementary statistical methods. Exponentially weighted moving averages (EWMA) provide baseline tracking that adapts to gradual legitimate performance changes while flagging sudden deviations. Seasonal decomposition separates periodic performance patterns (daily traffic cycles, batch job effects) from genuine anomalies. Quartile-based outlier detection identifies individual measurements that fall far outside normal distributions, while change-point detection algorithms identify systematic shifts in performance characteristics.

Alert suppression logic implements hysteresis to prevent flapping alerts when metrics oscillate near threshold boundaries. An alert is triggered when a metric exceeds its threshold for a configurable duration and cleared only when the metric drops below a lower recovery threshold, preventing rapid alert-clear-alert cycles during unstable periods.

## Operational Domain

The infrastructure domain for performance monitoring encompasses all platform components that produce measurable performance signals. This includes [Phoenix](@/glossary/phoenix.md) HTTP endpoint response times, [LiveView](@/glossary/liveview.md) mount and event handling durations, [GenServer](@/glossary/genserver.md) call latencies, [ETS](@/glossary/ets.md) table operation times, [PostgreSQL](@/glossary/postgresql.md) query execution times, inter-application message passing delays, and external service integration response times.

The monitoring scope extends to infrastructure-level metrics including [BEAM](@/glossary/beam.md) scheduler utilization, process count trends, memory consumption patterns, I/O throughput, and network latency. These infrastructure metrics provide context for application-level performance observations, enabling root cause analysis that connects application slowdowns to underlying resource constraints.

## Key Capabilities

- **Real-time latency monitoring** -- Tracks request latency distributions across all HTTP and WebSocket endpoints, computing rolling p50, p95, p99, and p99.9 percentiles with alerting when latencies breach defined service level objectives

- **Throughput analysis** -- Monitors request throughput (requests/second) and processing capacity across platform services, detecting capacity saturation and predicting when current growth trends will exceed available capacity

- **Anomaly detection** -- Applies multiple statistical methods (EWMA, seasonal decomposition, quartile analysis, change-point detection) to identify genuine performance anomalies while filtering measurement noise and expected periodic variations

- **Trend analysis and forecasting** -- Tracks performance metrics over extended periods to identify gradual degradation trends, projecting when current trajectories will breach service level objectives if left unaddressed

- **Correlation analysis** -- Cross-correlates performance anomalies across different metrics and services to identify root causes, detecting when latency increases in one service are caused by throughput changes in upstream dependencies

- **[Circuit breaker](@/glossary/circuit-breaker.md) monitoring** -- Tracks circuit breaker state transitions across all platform services, alerting when breakers trip and providing context for the triggering conditions

- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous monitoring that requires no manual intervention

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to issue performance alerts, trigger investigation workflows, and publish real-time performance dashboards across all platform domains.

## Monitoring Architecture

The monitoring infrastructure follows a three-layer architecture:

1. **Collection Layer** -- [Telemetry](@/glossary/telemetry.md) event handlers attached to all platform subsystems capture raw performance measurements with microsecond precision timestamps
2. **Aggregation Layer** -- Raw measurements are aggregated into time-windowed statistics (1-second, 1-minute, 5-minute, 1-hour windows) using [ETS](@/glossary/ets.md)-backed sliding window data structures
3. **Analysis Layer** -- Statistical analysis algorithms process aggregated data to detect anomalies, compute trends, and generate alerts

Each layer operates independently with its own [supervision tree](@/glossary/supervision-tree.md), ensuring that analysis failures do not impact data collection and that collection failures degrade gracefully with documented data gaps rather than silent metric loss.

## Alert Configuration

| Metric | Warning Threshold | Critical Threshold | Measurement Window |
|--------|-------------------|--------------------|--------------------|
| **HTTP p95 latency** | > 200ms | > 250ms | 5 minutes |
| **LiveView mount** | > 120ms | > 150ms | 5 minutes |
| **LiveView events** | > 40ms | > 50ms | 1 minute |
| **Database p95** | > 80ms | > 100ms | 5 minutes |
| **Health check** | > 8ms | > 10ms | 1 minute |
| **Scheduler utilization** | > 80% | > 90% | 5 minutes |
| **Process count** | > 100K | > 150K | 1 minute |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/perf-monitor status` | Display current performance status across all monitored services | L2+ |
| `/perf-monitor alerts` | List active and recent performance alerts | L2+ |
| `/perf-monitor trends` | Show performance trend analysis for specified metrics | L3+ |
| `/perf-monitor dashboard` | Launch real-time performance monitoring dashboard | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [Performance Benchmarking Agent](@/agents/performance-benchmarking-agent.md) | Benchmark baselines inform monitoring thresholds |
| [performance-profiling-agent](@/agents/performance-profiling-agent.md) | Monitoring alerts trigger profiling investigations |
| [performance-optimization-conductor](@/agents/performance-optimization-conductor.md) | Monitoring data drives optimization prioritization |
| [service-mesh-specialist](@/agents/service-mesh-specialist.md) | Infrastructure health context for cross-service correlation |
| [penetration-testing-specialist](@/agents/penetration-testing-specialist.md) | Performance impact monitoring during security assessments |

## Dashboard and Visualization

The agent publishes real-time performance data to [LiveView](@/glossary/liveview.md)-powered dashboards that provide at-a-glance visibility into platform performance health. Dashboard panels include latency distribution heatmaps, throughput time-series graphs, alert status indicators, and capacity utilization gauges. Dashboard updates are pushed through Phoenix PubSub at configurable intervals, providing near-real-time visibility without polling overhead.

## Enforcement

Performance monitoring enforcement follows the [NO MERCY](@/glossary/no-mercy.md) doctrine: the platform's P0 page load performance standard (all pages under 250ms, server-side render under 100ms) is continuously verified through production monitoring. Sustained violations trigger automatic escalation through the platform's incident response workflow. The [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that all alerts include sufficient diagnostic context to enable rapid root cause analysis without requiring additional investigation steps.

## Related Agents

Agents in the **infrastructure** domain collaborate to maintain platform health and availability, with the Performance Monitoring Specialist providing the continuous observability foundation that other infrastructure agents depend on for informed operational decisions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)