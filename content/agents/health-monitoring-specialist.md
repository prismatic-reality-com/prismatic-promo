+++
title = "Health Monitoring Specialist"
weight = 206
[extra]
domain = "infrastructure,-monitoring,-observability"
level = "L3"
description = "Comprehensive system health monitoring with proactive alerting, OTP-native health signals, and automated remediation triggering across all platform layers"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry", "liveview"]
domain_normalized = "infrastructure"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 1980
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Health", "Monitoring", "Specialist", "Comprehensive", "OTP-native", "agents", "agent", "Prismatic Platform", "The Specialist", "Infrastructure"]
tags = ["agents", "agent", "health-monitoring-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Health Monitoring Specialist - Prismatic Platform"
+++

## Overview

The Health Monitoring Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent provides comprehensive system health monitoring with proactive alerting capabilities, continuously tracking the operational status of all platform components from [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md)s through database connections to external service dependencies. Its primary mission is to detect health degradation before it impacts users and trigger automated remediation or escalation responses.

In a [BEAM](@/glossary/beam.md)-based platform, health monitoring extends beyond simple uptime checks. The Health Monitoring Specialist tracks [GenServer](@/glossary/genserver.md) message queue depths, process memory consumption, [ETS](@/glossary/ets.md) table sizes, supervision tree restart frequencies, and inter-application communication latencies. These OTP-native health signals provide deep visibility into platform behavior that traditional HTTP health checks would miss, enabling detection of subtle degradation patterns that precede hard failures. The agent's multi-layer health assessment covers BEAM VM metrics, application-level indicators, database health, network connectivity, and external dependency availability, providing a comprehensive operational health picture.

## Health Model Architecture

The Specialist maintains a hierarchical health model that aggregates component-level health into progressively broader health assessments.

**Component Health.** Individual processes, GenServers, and service endpoints are monitored independently. Each component has defined health indicators, acceptable ranges, and degradation thresholds. Component health is evaluated continuously through both active probing (health check requests) and passive observation (telemetry stream analysis).

**Subsystem Health.** Related components are grouped into subsystems (database subsystem, OSINT subsystem, web subsystem) whose health is derived from the health of constituent components with weighted aggregation. A subsystem can be healthy even if individual components show minor degradation, but degradation of critical components triggers subsystem-level alerts regardless of aggregate score.

**Application Health.** Each of the 90 umbrella applications has an application-level health assessment that combines its subsystem health ratings with application-specific metrics such as request latency, error rate, and throughput. Application health feeds into the platform-level health dashboard.

**Platform Health.** The top-level health assessment aggregates all application health ratings into a unified platform health score. Platform health is the primary indicator for operational decisions such as deployment approval, scaling actions, and incident declaration.

## OTP-Native Health Signals

The BEAM virtual machine provides rich health signals that the Specialist leverages for deep platform monitoring.

**Supervision Tree Stability.** Monitoring restart frequencies across all supervision trees. A supervision tree that experiences frequent restarts may indicate a systemic issue even if individual process crashes are handled correctly. The Specialist detects restart cascades, identifies problematic child specifications, and alerts when restart intensity approaches supervisor tolerance limits.

**Message Queue Depth.** Tracking message queue sizes for GenServer processes across the platform. Growing message queues indicate that a process is receiving messages faster than it can process them, a condition that will eventually lead to memory exhaustion and process termination. The Specialist detects queue growth trends and triggers preventive action before queues reach critical sizes.

**Process Memory Consumption.** Monitoring per-process memory usage to detect memory leaks, unbounded data accumulation, and processes that are approaching system memory limits. Memory monitoring correlates with process type to distinguish between expected high-memory processes (caches, data accumulators) and unexpected memory growth in normally lightweight processes.

**ETS Table Health.** Tracking ETS table sizes, memory consumption, and access patterns. Tables that grow without bound, tables with deteriorating read performance, and tables approaching memory limits trigger health alerts.

**Scheduler Utilization.** Monitoring BEAM scheduler utilization to detect CPU saturation that could cause latency increases and process scheduling delays. Scheduler monitoring provides early warning of capacity constraints before they manifest as user-visible performance degradation.

## Core Capabilities

The Health Monitoring Specialist provides six primary capabilities for comprehensive platform health management.

**Proactive Degradation Detection.** Using trend analysis and anomaly detection to identify health degradation patterns before they cross critical thresholds. The Specialist maintains baseline health profiles for each component and subsystem, detecting deviations from expected behavior through statistical analysis of health metric time series.

**Multi-Layer Health Assessment.** Evaluating health across BEAM VM, application, database, network, and external dependency layers for comprehensive situational awareness. Each layer's health assessment uses metrics appropriate to that layer's characteristics.

**Automated Remediation Triggering.** Initiating [self-healing](@/glossary/self-healing.md) procedures such as process restarts, cache invalidation, connection pool recycling, or targeted garbage collection when specific health conditions are detected. Remediation actions are defined in runbooks that map health conditions to appropriate responses.

**Health Dashboard Integration.** Providing real-time health data to [LiveView](@/glossary/liveview.md) dashboards for operational visibility and historical trend analysis. Dashboards display health status at all hierarchy levels with drill-down capability from platform health to individual component metrics.

**Capacity Planning Support.** Tracking resource utilization trends over time to inform infrastructure scaling decisions before capacity limits are reached. The Specialist generates capacity forecasts based on growth trends and seasonal patterns.

**Dependency Health Tracking.** Monitoring the health and availability of external dependencies including database connections, API endpoints, DNS resolution, and certificate validity. Dependency health feeds into application and platform health assessments.

## Technical Implementation

The Specialist is implemented as a supervised OTP application with dedicated monitoring processes for each health layer. Monitoring processes operate on configurable polling intervals with event-driven alerting for threshold breaches.

Health data collection uses the platform's [telemetry](@/glossary/telemetry.md) infrastructure, subscribing to telemetry events emitted by monitored components. The Specialist aggregates telemetry data into health assessments using configurable evaluation functions that combine multiple metrics into health scores.

Health state is maintained in ETS tables for rapid access by dashboard queries and alerting evaluations. Historical health data is persisted to [PostgreSQL](@/glossary/postgresql.md) through [Ecto](@/glossary/ecto.md) for trend analysis and capacity planning.

The [circuit breaker](@/glossary/circuit-breaker.md) pattern protects the monitoring system itself from failures in monitored components. If a health check probe fails repeatedly, the circuit breaker opens, preventing the monitoring system from wasting resources on probes that consistently fail while logging the monitoring gap for investigation.

## Coordination Model

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [alert-management-specialist](@/agents/alert-management-specialist.md) | Routes health alert signals for notification and escalation processing | Infrastructure |
| [incident-response-specialist](@/agents/incident-response-specialist.md) | Provides health data during incident investigation and resolution verification | Infrastructure |
| [deployment-health-monitor](@/agents/deployment-health-monitor.md) | Coordinates deployment-specific health monitoring during [release](@/glossary/release.md) windows | Infrastructure |
| [infrastructure-as-code-specialist](@/agents/infrastructure-as-code-specialist.md) | Informs infrastructure scaling decisions based on capacity planning data | Infrastructure |
| [gitlab-cicd-specialist-agent](@/agents/gitlab-cicd-specialist-agent.md) | Provides health gate status for deployment pipeline decisions | DevOps |

## Alert Management

Health alerts are categorized by severity and routed through appropriate notification channels.

| Severity | Condition | Response | Notification |
|----------|-----------|----------|-------------|
| INFO | Minor deviation from baseline | Logged for trend analysis | Dashboard only |
| WARNING | Approaching threshold limits | Investigation triggered | Team notification |
| CRITICAL | Threshold breached, degradation confirmed | Automated remediation initiated | Immediate escalation |
| EMERGENCY | Multiple subsystem failure or cascade risk | Incident declaration | All-hands notification |

## Enforcement

The Health Monitoring Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Health claims must be backed by measurable [telemetry](@/glossary/telemetry.md) data from independent sources. No component is considered healthy without active verification. Monitoring gaps are treated as L2 violations requiring immediate coverage expansion. Health alert suppression without documented justification is forbidden. Automated remediation actions are logged with full context for post-incident review.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)