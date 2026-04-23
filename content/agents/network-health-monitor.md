+++
title = "Network Health Monitor"
weight = 274
[extra]
domain = "health-monitoring"
level = "L4"
description = "Real-time monitoring of mycelial network health including topology analysis, latency tracking, throughput measurement, and early warning detection"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["mycelial-network", "seadf", "aiad", "supervision-tree", "dynamic-supervisor", "process-isolation", "message-passing", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "ecosystem"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Network", "Health", "Monitor", "Real-time", "agents", "agent", "Prismatic Platform", "EWMA", "Domain Authority"]
tags = ["agents", "agent", "network-health-monitor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Network Health Monitor - Prismatic Platform"
+++

## Overview

The Network Health Monitor operates as an L4 Domain Authority within the Prismatic Platform's health-monitoring domain, providing continuous [real-time monitoring](/capabilities/real-time-monitoring/) of the [mycelial network](/glossary/mycelial-network/) -- the inter-agent communication topology that connects over 400 autonomous agents. This agent serves as the primary observational instrument for network health, continuously measuring connection latency, message throughput, error rates, topology stability, and capacity utilization across every link in the mycelial network. Without this monitor, degradation would go undetected until it caused operational failures, and the network's specialized management agents (healer, optimizer, evolution specialist) would operate without the health data they require to make informed decisions.

Built on the [AIAD](/glossary/aiad/) standard and integrated with the platform's [telemetry](/glossary/telemetry/) infrastructure, the monitor implements a comprehensive health assessment framework that combines real-time measurements with statistical analysis and predictive modeling. Health status is not a simple binary (healthy/unhealthy) but a multi-dimensional assessment across five health domains: connectivity (can agents communicate?), performance (how fast is communication?), reliability (do messages arrive correctly?), capacity (how much headroom remains?), and stability (how consistent are metrics over time?). The [NO DOUBTS](/glossary/no-doubts/) principle governs all health assessments: no health status is reported without supporting measurement data, and uncertainty in health assessments is explicitly quantified.

## Theoretical Foundations

Network health monitoring draws from network performance measurement theory, statistical process control, and time-series anomaly detection. The monitor implements a modified EWMA (Exponentially Weighted Moving Average) control chart approach adapted from manufacturing quality control. Each network health metric is tracked as a time series with EWMA smoothing that balances responsiveness to recent changes with stability against transient noise.

Control limits are established through baseline characterization during initial system deployment and updated through periodic recalibration. When a metric's EWMA value crosses a control limit, the monitor generates a health alert with severity proportional to the magnitude and duration of the excursion. This statistical approach provides principled thresholds that adapt to the network's normal operating characteristics rather than relying on manually configured static thresholds.

Predictive health modeling applies linear trend extrapolation and seasonal decomposition to identify metrics that are trending toward control limits. This enables early warning detection where the monitor can alert network management agents before a metric actually crosses into unhealthy territory, providing time for proactive intervention.

## Operational Domain

The health-monitoring domain covers all aspects of mycelial network observability. The monitor maintains measurement probes across every active connection in the network, with probe frequency adapting to connection criticality and recent health history. Critical connections (those carrying high-priority coordination traffic or serving as the sole path between agent clusters) are probed at higher frequencies than peripheral connections with redundant alternatives.

Health data is stored in [ETS](/glossary/ets/) tables optimized for time-series access patterns, with configurable retention periods that balance historical analysis depth against memory consumption. High-resolution data (per-probe measurements) is retained for short periods (hours to days), while aggregated summaries (per-connection hourly statistics) are retained for longer periods (days to weeks). The monitor publishes health events through the platform's [telemetry](/glossary/telemetry/) event bus, enabling other agents to subscribe to health notifications without polling.

## Key Capabilities

- **Connection latency tracking** -- Measures round-trip latency for every active mycelial network connection using lightweight probe messages, computing EWMA-smoothed latency estimates with percentile distributions (P50, P95, P99)
- **Throughput measurement** -- Tracks message throughput (messages per second) and data throughput (bytes per second) per connection, identifying capacity constraints and utilization trends
- **Error rate monitoring** -- Counts message delivery failures, timeout events, and protocol errors per connection, computing error rates and trend indicators that distinguish transient errors from systematic degradation
- **Topology stability analysis** -- Monitors connection creation and destruction events, measuring topology churn rate and identifying unstable regions of the network where connections are repeatedly failing and being repaired
- **Early warning detection** -- Applies predictive trend analysis to health metrics, generating advance warnings when metrics are trending toward degradation thresholds, enabling proactive intervention
- **Health score computation** -- Computes composite health scores per connection, per agent, and network-wide, combining connectivity, performance, reliability, capacity, and stability dimensions with configurable weights
- **Anomaly detection** -- Identifies abnormal health patterns using statistical control chart methods, flagging deviations from established baselines that may indicate emerging problems
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed monitoring that adapts probe frequency and analysis depth based on detected health conditions
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing health metrics including per-connection measurements, aggregate network health scores, alert events, and prediction outputs

## Authority Level

**L4** - Domain Authority - Specialized domain expertise with authority to configure monitoring parameters, set health thresholds, and publish health assessments that drive decisions by higher-authority network management agents.

## Monitoring Architecture

The monitor implements a three-tier measurement architecture. The **probe tier** generates and processes lightweight health check messages across network connections. Probes are implemented as minimal [message passing](/glossary/message-passing/) exchanges that measure latency without introducing significant load. The probe scheduler adapts measurement frequency based on connection criticality and recent health history.

The **analysis tier** processes raw probe measurements into health metrics. EWMA smoothing, percentile computation, error rate calculation, and trend analysis are performed in this tier. Analysis results are stored in ETS and published through telemetry. The analysis tier operates as an independent [GenServer](/glossary/genserver/) process, isolated from the probe tier through [process isolation](/glossary/process-isolation/) to ensure that analysis computation does not interfere with probe scheduling.

The **reporting tier** generates health summaries, alert events, and prediction outputs. Health summaries are produced on configurable schedules for routine consumption, while alerts are generated immediately when control limits are crossed or predictions indicate imminent degradation.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/network health` | Display comprehensive network health summary with per-domain breakdowns | L4+ |
| `/network latency` | Show latency statistics with percentile distributions and trend indicators | L4+ |
| `/network throughput` | Display throughput measurements with capacity utilization percentages | L4+ |
| `/network alerts` | List active health alerts with severity, duration, and affected components | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [mycelial-healer-specialist](/agents/mycelial-healer-specialist/) | Health alerts and degradation reports trigger healing interventions |
| [mycelial-network-coordinator](/agents/mycelial-network-coordinator/) | Network-wide health summaries inform coordination decisions and resource allocation |
| [mycelial-topology-optimizer-agent](/agents/mycelial-topology-optimizer-agent/) | Health data identifies performance bottlenecks that topology optimization can address |
| [mycelial-evolution-specialist](/agents/mycelial-evolution-specialist/) | Health metrics serve as fitness evaluation inputs for network evolution |
| [mycelial-emergence-sentinel-agent](/agents/mycelial-emergence-sentinel-agent/) | Health patterns help distinguish emergent behavior from stress-induced anomalies |

## Baseline Management

The monitor maintains health baselines that define normal operating characteristics for each connection and for the network as a whole. Baselines are established through initial characterization periods where the network operates under representative workloads, and EWMA parameters and control limits are computed from the collected measurements. Baselines are periodically recalibrated to account for legitimate changes in network operating characteristics (new agents, changed workloads, infrastructure updates). Recalibration requires explicit authorization to prevent baseline drift from masking gradual degradation.

## Enforcement

Health assessments comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no health degradation is suppressed or minimized, all measurements carry explicit uncertainty quantification, and health alerts trigger mandatory response from network management agents. The [NO DOUBTS](/glossary/no-doubts/) principle requires that health statuses are grounded in measured data with statistical significance, and the [Trinity Gate](/glossary/trinity-gate/) validates that health assessment methodologies maintain structural, logical, and formal consistency.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)