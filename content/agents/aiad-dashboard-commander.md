+++
title = "aiad-dashboard-commander"
weight = 23
[extra]
domain = "domain"
level = "L3"
description = "Visual monitoring and real-time dashboard management for the AIAD agent ecosystem"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "hot-code-reload", "telemetry"]
domain_normalized = "general"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1750
quality_score = 92
keywords = ["dashboard monitoring", "real-time visualization", "LiveView", "telemetry aggregation", "agent health", "ecosystem observability"]
tags = ["prismatic", "agent", "monitoring", "dashboard", "observability"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "aiad-dashboard-commander - Prismatic Platform"
+++

## Overview

The [AIAD](/glossary/aiad/) Dashboard Commander operates as an L3 [strategic command](/glossary/strategic-command/) agent providing visual monitoring and operational oversight for the entire AIAD agent ecosystem within the Prismatic Platform. This agent manages real-time dashboards that display agent health status, execution [metrics](/glossary/metrics/), quality gate compliance, and inter-agent communication patterns. Operators use these dashboards to maintain situational awareness across 400+ autonomous agents operating simultaneously.

Effective monitoring of an autonomous agent ecosystem requires more than simple uptime checks. The AIAD Dashboard Commander aggregates [telemetry](/glossary/telemetry/) data from every active agent, correlates execution patterns across domains, and surfaces anomalies that indicate emerging issues before they escalate into failures. The dashboards render through [Phoenix LiveView](/glossary/phoenix-liveview/), providing real-time updates without page refreshes, and support drill-down navigation from ecosystem-wide overviews to individual agent execution traces.

## Operational Domain

The Dashboard Commander operates across all AIAD domains, serving as the primary [observability](/glossary/observability/) interface for the agent ecosystem. It collects metrics from agent registries, execution pipelines, [quality gates](/glossary/quality-gates/), and the [mycelial network](/glossary/mycelial-network/) to present a unified operational picture. This cross-cutting visibility makes it essential for both routine monitoring and [incident response](/glossary/incident-response/) coordination.

## Key Capabilities

- **Real-time agent health monitoring** displaying status, uptime, and execution metrics for all registered agents with automatic anomaly highlighting when agents deviate from baseline performance
- **Cross-domain correlation views** that map relationships between agent executions, showing how triggers in one domain propagate effects through the mycelial network to other domains
- **Quality gate compliance dashboards** tracking compilation warnings, test coverage, [Credo](/glossary/credo/) violations, and [Dialyzer](/glossary/dialyzer/) results across all platform applications in real-time
- **Historical trend analysis** with configurable time windows that reveal performance degradation patterns, quality drift, and resource utilization trends across evolution generations
- **Incident response coordination** providing focused views during crisis situations that filter noise and highlight only the agents and metrics relevant to the current incident

## Technical Architecture

The Dashboard Commander is implemented as a [Phoenix LiveView](/glossary/phoenix-liveview/) application backed by a [GenServer](/glossary/genserver/) that aggregates [telemetry](/glossary/telemetry/) events from across the agent ecosystem. The architecture separates data collection (telemetry subscription and aggregation) from data presentation (LiveView rendering), enabling the aggregation layer to operate independently of whether any dashboard clients are connected.

```elixir
defmodule PrismaticWeb.Live.DashboardLive do
  use PrismaticWeb, :live_view

  @refresh_interval_ms 1_000

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(@refresh_interval_ms, :refresh)
      PrismaticAgents.DashboardAggregator.subscribe()
    end
    {:ok, assign(socket, agents: load_agent_status(), metrics: load_metrics())}
  end

  @impl true
  def handle_info(:refresh, socket) do
    {:noreply, assign(socket,
      agents: load_agent_status(),
      metrics: load_metrics(),
      last_updated: DateTime.utc_now()
    )}
  end
end
```

The telemetry aggregation layer subscribes to events under the `[:prismatic_agents, :*, :*]` namespace pattern, capturing agent lifecycle events, execution metrics, quality gate results, and error conditions. Events are aggregated into rolling time windows (1 minute, 5 minutes, 1 hour) using [ETS](/glossary/ets/)-backed counters for O(1) increment operations. The aggregation layer maintains per-agent state maps that track health status, execution counts, error rates, and last-seen timestamps.

The LiveView rendering layer uses server-sent updates to push dashboard changes to connected clients without polling. When the aggregation layer detects a significant state change (agent health transition, quality gate failure, error spike), it broadcasts to all connected LiveView processes, ensuring real-time visibility across all monitoring consoles.

## Decision Framework

The Dashboard Commander makes presentation decisions about which information to surface and how to prioritize it based on operational context.

| Operational State | Dashboard Behavior | Priority View |
|------------------|-------------------|---------------|
| Normal operations | Full ecosystem overview | Health grid + metric trends |
| Quality gate failure | Highlight failing domains | Failing gates + affected agents |
| Agent health degradation | Anomaly spotlight | Degraded agents + correlation map |
| Deployment in progress | Deployment tracking | Canary metrics + rollback readiness |
| Incident response | Crisis focus mode | Affected systems + escalation status |
| Evolution cycle active | Evolution progress | Fitness changes + validation results |

Stale data detection activates automatically when a telemetry feed lapses beyond twice its expected interval. Stale indicators appear next to affected metrics, preventing operators from making decisions based on outdated information. This staleness detection is mandatory under the NO MERCY doctrine -- the dashboard must never present potentially stale data without explicit warning.

## Authority Level

**L3** - Strategic Command. The Dashboard Commander holds multi-domain coordination authority for monitoring and observability across the entire agent ecosystem. This authority permits read access to telemetry streams from all domains, enabling the cross-cutting visibility required for ecosystem-wide monitoring. The agent does not hold write authority -- it observes and displays but does not modify system state. The L3 designation enables coordination with other L3 agents to provide context-aware dashboard views during coordinated operations.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [aiad-hot-reload-coordinator](/agents/aiad-hot-reload-coordinator/) | Reload Monitor | Displays hot reload events and validates post-reload agent health |
| [alert-management-specialist](/agents/alert-management-specialist/) | Alert Visualizer | Renders alert timelines and escalation status on monitoring dashboards |
| [aiad-verification-engine](/agents/aiad-verification-engine/) | Verification Display | Shows verification results and specification compliance status |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Dashboard refresh rate** | 1s | < 2s | LiveView update interval for connected clients |
| **Telemetry processing latency** | < 50ms | < 100ms | Time from event emission to aggregation |
| **Agent status accuracy** | Real-time | Real-time | Freshness of displayed agent health status |
| **Concurrent dashboard clients** | > 20 | > 10 | Simultaneous LiveView connections supported |
| **Historical data depth** | 24hr rolling | 24hr | Time window for trend analysis views |
| **Stale data detection** | 2x interval | 2x interval | Staleness threshold relative to expected feed rate |

## Enforcement

All dashboard operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Dashboard data must reflect actual system state with no smoothing or averaging that could mask problems. Stale data indicators activate automatically when telemetry feeds lag beyond acceptable thresholds. No dashboard view may suppress error states, and all critical metric breaches trigger visual alerts that persist until the underlying condition is acknowledged and resolved. The dashboard code itself is subject to the same quality standards as any platform code: zero compilation warnings, comprehensive typespecs, and full test coverage of LiveView event handling.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/dashboard status` | Display current dashboard health and connected clients | L3 |
| `/dashboard refresh` | Force refresh of all telemetry aggregation data | L3 |
| `/dashboard crisis` | Switch to crisis mode focused views | L3 |
| `/dashboard export` | Export dashboard metrics for reporting | L3 |

## Related Resources

- [Telemetry Integration](/capabilities/telemetry-integration/) -- Platform-wide telemetry powering dashboard data
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent specification standard displayed on dashboards
- [Phoenix LiveView](/glossary/phoenix-liveview/) -- Technology powering real-time dashboard rendering
- [Architecture Overview](/architecture/) -- Platform architecture including observability layer
- [Applications](/apps/) -- Platform applications monitored on dashboards
- [Color Teams](/teams/) -- Security teams with dedicated dashboard views

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)