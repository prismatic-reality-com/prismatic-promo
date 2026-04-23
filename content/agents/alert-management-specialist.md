+++
title = "alert-management-specialist"
weight = 32
[extra]
domain = "infrastructure"
level = "L3"
description = "Intelligent alerting with contextual classification, notification routing, temporal correlation, escalation policy enforcement, and alert lifecycle management across the distributed platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["alert-management-specialist", "Intelligent", "agents", "agent", "Prismatic Platform", "Alert", "Routing", "Escalation"]
tags = ["agents", "agent", "alert-management-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "alert-management-specialist - Prismatic Platform"
+++

## Overview

The Alert Management Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Infrastructure domain of the Prismatic Platform. This agent is responsible for intelligent alert routing, notification escalation, and incident prioritization across the entire platform infrastructure. Rather than flooding operators with raw system events, it applies contextual filtering, deduplication, and severity classification to ensure that only actionable alerts reach the appropriate response teams.

In a [distributed system](@/glossary/distributed-system.md) with 90 [umbrella application](@/glossary/umbrella-application.md)s running on [BEAM](@/glossary/beam.md), alert fatigue is a genuine operational risk. The Alert Management Specialist addresses this by implementing multi-tier alert classification with configurable thresholds, temporal correlation of related events, and automatic suppression of known transient conditions. When a [PostgreSQL](@/glossary/postgresql.md) connection pool approaches exhaustion while a deployment is in progress, this agent correlates both signals and routes a single consolidated alert rather than generating separate notifications for each symptom.

The agent also manages the complete alert lifecycle from creation through acknowledgment, investigation, resolution, and post-incident analysis. Every alert is tracked with full provenance including the triggering telemetry events, classification rationale, routing decisions, and resolution actions. This lifecycle management transforms alerts from ephemeral notifications into durable incident records that feed into the platform's continuous improvement process.

## Architecture

The Alert Management Specialist is implemented as a [GenServer](@/glossary/genserver.md) process with dedicated [ETS](@/glossary/ets.md) tables for alert state management, correlation windows, and routing rules. The architecture separates three concerns: alert ingestion (receiving and classifying raw events), alert processing (correlation, deduplication, and enrichment), and alert dispatch (routing, notification, and escalation).

The ingestion layer subscribes to [telemetry](@/glossary/telemetry.md) events across the platform under `[:prismatic_*, :alert, *]` namespaces. Raw events are classified by severity (critical, high, medium, low, informational) based on configurable rules that account for system state, deployment windows, and historical patterns. Classification rules are stored in ETS and hot-reloadable without agent restart.

The processing layer implements a temporal correlation engine that groups related alerts occurring within configurable time windows. The correlation algorithm maintains a sliding window of recent alerts and matches incoming alerts against active correlation groups using event type, source domain, and temporal proximity. Correlated alerts are merged into unified incidents that capture the complete event sequence, reducing notification volume during cascading failure scenarios.

The dispatch layer maintains a routing table that maps alert categories to response teams based on domain ownership, on-call schedules, and alert severity. Routing decisions are logged for audit purposes and emit telemetry events for dashboard visualization.

```elixir
defmodule PrismaticAgents.AlertManager do
  use GenServer

  @correlation_window_ms 30_000
  @escalation_intervals %{critical: 300_000, high: 900_000, medium: 3_600_000}

  def ingest(event, metadata) do
    GenServer.cast(__MODULE__, {:ingest, event, metadata})
  end

  def acknowledge(alert_id, responder) do
    GenServer.call(__MODULE__, {:acknowledge, alert_id, responder})
  end

  def resolve(alert_id, resolution) do
    GenServer.call(__MODULE__, {:resolve, alert_id, resolution})
  end

  @impl true
  def handle_cast({:ingest, event, metadata}, state) do
    classified = classify_severity(event, metadata, state.system_context)
    case find_correlation_group(classified, state.active_groups) do
      {:correlated, group_id} ->
        merge_into_group(group_id, classified)
        {:noreply, state}
      :new ->
        alert = create_alert(classified, metadata)
        route_alert(alert, state.routing_table)
        schedule_escalation(alert)
        {:noreply, add_to_active(state, alert)}
    end
  end

  @impl true
  def handle_call({:acknowledge, alert_id, responder}, _from, state) do
    case get_alert(alert_id, state) do
      {:ok, alert} ->
        updated = %{alert | status: :acknowledged, responder: responder}
        cancel_escalation(alert_id)
        {:reply, {:ok, updated}, update_alert(state, updated)}
      {:error, :not_found} ->
        {:reply, {:error, :alert_not_found}, state}
    end
  end

  defp classify_severity(event, metadata, context) do
    base_severity = event_to_severity(event)
    adjusted = adjust_for_context(base_severity, context)
    %{event: event, severity: adjusted, metadata: metadata, timestamp: DateTime.utc_now()}
  end
end
```

## Core Capabilities

- **Contextual alert classification** with multi-tier severity levels that account for system state, deployment windows, and historical incident patterns to reduce false positives by correlating related events
- **Intelligent notification routing** that directs alerts to the appropriate response teams based on domain ownership, on-call schedules, and alert category, preventing notification overload
- **Temporal correlation engine** that groups related alerts occurring within configurable time windows into unified incidents, reducing duplicate notifications during cascading failure scenarios
- **Escalation policy enforcement** with automatic severity promotion when alerts remain unacknowledged beyond defined SLA thresholds, ensuring no critical issue goes unaddressed
- **Alert lifecycle management** tracking alerts from creation through acknowledgment, investigation, and resolution with full [audit trail](@/glossary/audit-trail.md) and post-incident analysis data
- **Suppression rule management** with documented justification and periodic review requirements, preventing alert suppression from becoming a vector for missed incidents

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [deployment-health-monitor](@/agents/deployment-health-monitor.md) | Signal Source | Receives deployment health signals for alert generation |
| [aiad-backup-manager](@/agents/aiad-backup-manager.md) | Infrastructure Peer | Coordinates backup failure alerts with recovery procedures |
| [compliance-auditing-specialist](@/agents/compliance-auditing-specialist.md) | Compliance Partner | Routes compliance-related alerts through regulatory notification channels |
| [aiad-dashboard-commander](@/agents/aiad-dashboard-commander.md) | Visualization | Displays alert timelines and escalation status on monitoring dashboards |
| [absolute-enforcement-commander-v6](@/agents/absolute-enforcement-commander-v6.md) | Quality Alert Source | Receives quality gate failure alerts for routing |
| [aiad-agent-session](@/agents/aiad-agent-session.md) | Session Alert Source | Receives session discipline violation alerts |

## Operational Workflow

The alert management workflow processes events through a structured pipeline from ingestion to resolution.

**Alert Ingestion.** Raw telemetry events arrive from across the platform. Each event is classified by severity based on configurable rules and current system context. Events during deployment windows receive adjusted severity (transient errors during deployment are downgraded; persistent errors are escalated).

**Correlation and Deduplication.** Classified events are matched against active correlation groups. Related events within the correlation window (default 30 seconds) are merged into unified incidents. Duplicate events (same source, same type, within deduplication window) are counted but do not generate new alerts.

**Routing and Notification.** New alerts are routed to the appropriate response team based on the routing table. Critical alerts generate immediate notifications through all configured channels (webhook, email, dashboard). Lower-severity alerts are batched and delivered on configurable schedules.

**Escalation Management.** Unacknowledged alerts are automatically escalated according to severity-specific SLA timers: critical alerts escalate after 5 minutes, high alerts after 15 minutes, medium alerts after 1 hour. Escalation promotes the alert to the next tier in the response chain.

**Resolution and Post-Incident.** Resolved alerts are archived with complete lifecycle metadata including triggering events, classification rationale, routing decisions, acknowledgment timing, and resolution actions. This data feeds into trend analysis for continuous improvement of alert classification rules.

## NABLA Compliance

The Alert Management Specialist operates under NABLA Infinity axiom compliance for alert classification and routing decisions.

**Signal Plurality.** Alert severity classification considers multiple independent signals: the triggering event severity, current system context (deployment status, load levels), historical incident patterns, and correlation with concurrent alerts. No single signal determines final severity classification.

**Contradiction Preservation.** When alert signals contradict (e.g., a service reports healthy via health check but generates error telemetry), both signals are preserved in the alert context. The alert includes the contradiction for responder awareness rather than resolving it through suppression.

**Provenance Mandatory.** Every alert includes complete provenance: the triggering telemetry event, the classification rule applied, the severity adjustment rationale, the routing decision, and all lifecycle state transitions. Responders can trace any alert back to its originating system event.

**Time Decay.** Alert correlation windows implement explicit time decay. Events outside the correlation window do not merge into existing groups, preventing stale correlations from accumulating indefinitely. Historical incident data used for classification carries freshness timestamps.

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.AlertManager,
  correlation_window_ms: 30_000,
  escalation_intervals: %{critical: 300_000, high: 900_000, medium: 3_600_000},
  deduplication_window_ms: 60_000,
  routing_table_path: ".aiad/config/alert-routing.yaml",
  notification_channels: [:webhook, :dashboard, :email],
  suppression_review_interval_days: 7,
  telemetry_prefix: [:prismatic_agents, :alert_manager]
```

The AIAD specification at `.aiad/agents/alert-management-specialist.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. The routing table is hot-reloadable through the AIAD Hot Reload Coordinator.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Alert classification latency** | < 50ms | < 100ms | Time from event ingestion to severity classification |
| **Correlation matching** | < 10ms | < 50ms | Time to match event against active correlation groups |
| **Routing dispatch** | < 100ms | < 200ms | Time from classification to notification dispatch |
| **Escalation accuracy** | 100% | 100% | Percentage of unacknowledged alerts correctly escalated |
| **Correlation reduction** | > 60% | > 50% | Reduction in notification volume through correlation |
| **Alert resolution tracking** | 100% | 100% | Percentage of alerts tracked through full lifecycle |

## Related Resources

- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Platform telemetry providing alert source events
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture including monitoring and alerting
- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard for alerting agents
- [Applications](@/apps/_index.md) -- Platform applications generating alert events
- [Color Teams](@/teams/_index.md) -- Security teams with dedicated alert channels
- [Glossary](@/glossary/_index.md) -- Technical terminology and concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)