+++
title = "system-metrics-specialist"
weight = 391
[extra]
domain = "infrastructure"
level = "L3"
description = "System resource monitoring and capacity planning expert providing comprehensive telemetry aggregation, anomaly detection, and performance optimization guidance."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["system-metrics-specialist", "System", "agents", "agent", "Prismatic Platform", "BEAM", "PostgreSQL"]
tags = ["agents", "agent", "system-metrics-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "system-metrics-specialist - Prismatic Platform"
+++

## Overview

The System Metrics Specialist is an L3 strategic command agent operating within the Prismatic Platform's infrastructure domain, serving as the primary authority for system resource monitoring, capacity planning, and performance observability. In a platform comprising over 90 applications running on the [BEAM](@/glossary/beam.md) virtual machine, comprehensive metrics collection and analysis is essential for maintaining operational health, predicting capacity requirements, and detecting performance anomalies before they impact system reliability.

This agent aggregates telemetry data from every layer of the platform stack, from BEAM scheduler utilization and [ETS](@/glossary/ets.md) memory consumption to [PostgreSQL](@/glossary/postgresql.md) query performance and network throughput. It transforms raw metrics into actionable intelligence that guides operational decisions, capacity planning, and performance optimization efforts. Operating under the [AIAD](@/glossary/aiad.md) standard and the [No Mercy, No Doubts](@/glossary/no-mercy.md) doctrine, the agent maintains zero tolerance for unmonitored system components and undetected performance degradation.

## Theoretical Foundations

System metrics and observability draw from control theory, statistical process control, and information theory. Control theory provides the conceptual framework for understanding system behavior as a feedback loop where metrics serve as the feedback signal, enabling corrective actions that maintain system performance within desired bounds.

Statistical process control, originating from Walter Shewhart's work at Bell Laboratories, provides the mathematical foundation for distinguishing between normal variation and anomalous behavior in system metrics. Control charts, capability indices, and run rules enable the agent to detect performance deviations that require investigation while avoiding false alarms triggered by normal statistical variation.

The USE (Utilization, Saturation, Errors) methodology, developed by Brendan Gregg, provides a structured approach to system performance analysis. For every resource, the agent monitors utilization (how busy the resource is), saturation (how much queued work exists), and errors (how many error events occur). This methodology ensures comprehensive coverage of performance-relevant metrics without overwhelming operators with irrelevant data.

The RED (Rate, Errors, Duration) methodology complements USE by focusing on service-level metrics rather than resource-level metrics. For every service, the agent tracks request rate, error rate, and request duration distribution, providing a user-centric view of system performance.

The [BEAM](@/glossary/beam.md) virtual machine introduces platform-specific observability requirements. The agent monitors BEAM-specific metrics including scheduler utilization across all available schedulers, process count and message queue depths, [ETS](@/glossary/ets.md) table memory consumption, garbage collection frequency and duration, and atom table utilization. These BEAM-specific metrics reveal performance characteristics that are invisible to generic system monitoring tools.

## Core Capabilities

**Comprehensive Telemetry Aggregation** collects metrics from all platform layers through the Prismatic Telemetry subsystem. The agent processes thousands of metric data points per second, aggregating them into meaningful summaries at configurable time granularities. Aggregation preserves statistical properties such as percentile distributions, enabling accurate representation of tail latency and outlier behavior.

**Anomaly Detection** applies statistical methods to identify metric values that deviate significantly from established baselines. The agent maintains adaptive baselines that account for cyclical patterns (time-of-day, day-of-week) and trend components (gradual growth in data volume). Anomalies are classified by severity and automatically trigger investigation workflows when thresholds are exceeded.

**Capacity Planning** projects future resource requirements based on historical consumption trends, growth forecasts, and planned feature additions. The agent produces capacity models that predict when current resources will be exhausted under various growth scenarios, enabling proactive scaling decisions rather than reactive emergency responses.

**Performance Optimization Guidance** analyzes metric patterns to identify optimization opportunities. The agent detects common performance anti-patterns such as N+1 query problems, excessive garbage collection pressure, hot ETS tables, and inefficient message passing patterns. Each detection produces specific, actionable remediation guidance.

**Health Scoring** synthesizes individual metrics into composite health scores for applications, domains, and the platform as a whole. Health scores provide an at-a-glance assessment of system status that supports rapid operational decision-making.

## Architecture and Implementation

The System Metrics Specialist is implemented as a supervised [OTP](@/glossary/otp.md) process with a pipeline architecture optimized for high-throughput metric processing.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Metric Collector | Receive telemetry events from all sources | GenServer with flow control |
| Aggregation Engine | Compute statistical summaries at multiple granularities | ETS-backed sliding window |
| Anomaly Detector | Identify statistical deviations from baselines | Adaptive threshold engine |
| Capacity Modeler | Project resource requirements over planning horizons | Time-series forecasting |
| Health Calculator | Synthesize composite health scores | Weighted multi-metric scoring |
| Alert Manager | Route anomaly notifications to appropriate handlers | Priority-based dispatch |

The metric collection pipeline implements backpressure mechanisms that prevent metric ingestion from consuming excessive system resources during metric storms. A [circuit breaker](@/glossary/circuit-breaker.md) pattern protects the agent from cascading failures if downstream metric storage becomes unavailable.

ETS tables serve as the primary storage for recent metric data, providing microsecond-level read access for real-time queries. Historical metric data is periodically flushed to PostgreSQL for long-term retention and trend analysis. This tiered storage approach balances real-time query performance with historical data availability.

## Metric Categories

The agent monitors metrics organized into hierarchical categories that cover the full platform stack.

| Category | Key Metrics | Source |
|----------|------------|--------|
| BEAM Runtime | Scheduler utilization, process count, memory allocation | :erlang.statistics/1 |
| OTP Processes | [GenServer](@/glossary/genserver.md) message queue depth, call latency, crash rate | Telemetry events |
| ETS Tables | Memory per table, read/write rates, table count | :ets.info/1 |
| Database | Query duration, connection pool utilization, lock contention | Ecto telemetry |
| HTTP | Request rate, response latency distribution, error rate | Phoenix telemetry |
| Application | Domain-specific business metrics | Custom telemetry |

Each metric category includes defined baselines, warning thresholds, and critical thresholds that are calibrated against historical data. The threshold calibration process runs periodically to adapt to changing system behavior and prevents alert fatigue from static thresholds that become inappropriate as the system evolves.

## Capacity Planning Methodology

The agent's capacity planning methodology combines statistical forecasting with scenario modeling.

**Trend Analysis** fits growth models to historical metric data, extrapolating resource consumption trajectories. The agent supports multiple forecasting models (linear, exponential, logistic) and selects the best-fitting model based on historical prediction accuracy.

**Scenario Modeling** evaluates the resource impact of planned changes such as new feature deployments, traffic growth, and data volume increases. Each scenario produces a projected resource consumption profile that is compared against available capacity.

**Threshold Projection** determines when resource utilization will reach warning and critical thresholds under each scenario, providing lead time estimates for capacity expansion decisions.

**Cost-Benefit Analysis** evaluates the economic trade-offs between proactive capacity expansion and the risk of capacity-related service degradation, supporting budget allocation decisions for infrastructure investment.

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent lifecycle and performance monitoring | Bidirectional |
| Prismatic Telemetry | Primary metric data source | Inbound streaming |
| [PostgreSQL](@/glossary/postgresql.md) | Historical metric storage | Write (flush) |
| [AIAD Registry](@/glossary/registry-otp.md) | Agent specification and discovery | Read |
| [SEADF](@/glossary/seadf.md) | Platform health assessment integration | Bidirectional |
| [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) | Monitoring worker management | Process lifecycle |

## Quality Assurance

Metric accuracy is validated through cross-validation between independent measurement sources. The agent compares its internally computed metrics against external monitoring tools and operating system counters to detect measurement drift or systematic errors. Anomaly detection accuracy is evaluated through precision and recall metrics maintained against a corpus of known anomalous events.

The agent's capacity forecasts are validated retrospectively by comparing predictions against actual consumption, enabling continuous calibration of forecasting models and improvement of prediction accuracy over time.

## Related Agents

The System Metrics Specialist provides observability data that supports multiple other agents. The [system-architecture-specialist](@/agents/system-architecture-specialist.md) uses architectural health metrics for design decisions. The [tech-debt-analyst](@/agents/tech-debt-analyst.md) correlates performance metrics with technical debt indicators. The [test-specialist](@/agents/test-specialist.md) uses performance baselines for regression detection in test suites.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)