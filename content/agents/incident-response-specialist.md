+++
title = "Incident Response Specialist"
weight = 209
[extra]
domain = "infrastructure,-incident-management"
level = "L3"
description = "Manages the complete incident lifecycle from detection through resolution to post-mortem analysis with automated coordination and MTTR optimization"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry", "incident-response"]
domain_normalized = "infrastructure"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 1980
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Incident", "Response", "Specialist", "Manages", "MTTR", "agents", "agent", "Prismatic Platform", "Post", "Infrastructure"]
tags = ["agents", "agent", "incident-response-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Incident Response Specialist - Prismatic Platform"
+++

## Overview

The [Incident Response](@/glossary/incident-response.md) Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent manages the complete incident lifecycle from detection through resolution to post-mortem analysis, ensuring that production incidents are handled with speed, precision, and thoroughness. When a service degradation, outage, or security event occurs, the Incident Response Specialist coordinates the response effort, assigns investigation tasks, and tracks resolution progress in real time.

Production incidents in a 90-app [umbrella architecture](@/glossary/umbrella-application.md) require systematic coordination. A failure in one application can cascade through dependent services if not contained quickly. The Incident Response Specialist maintains runbooks for common failure scenarios, implements automated detection through health check monitoring, and coordinates human and agent responders to minimize mean time to resolution (MTTR). Every incident produces a blameless post-mortem that identifies root causes, documents timeline, and generates actionable improvement items to prevent recurrence.

## Incident Lifecycle Model

The Specialist manages incidents through a structured lifecycle with defined phases, each with clear objectives and exit criteria.

**Detection.** Incidents are detected through multiple channels: automated health check failures, error rate threshold breaches, latency anomaly detection, and manual reports. The detection phase correlates multiple signals to distinguish genuine incidents from transient noise, reducing false positive incident declarations that waste response resources. Detection uses the platform's [telemetry](@/glossary/telemetry.md) infrastructure to correlate signals across application boundaries, identifying cascading failures that may appear as independent issues in individual applications.

**Triage.** Confirmed incidents are triaged to determine severity, blast radius, and initial response requirements. Triage classifies incidents on a four-level severity scale: SEV-1 (total service outage), SEV-2 (significant feature degradation), SEV-3 (minor feature impact), and SEV-4 (cosmetic or non-user-facing issue). Triage also identifies the incident's likely blast radius -- which applications, services, and user populations are affected.

**Containment.** The immediate priority after triage is containing the incident to prevent further spread. Containment actions may include traffic rerouting, feature flag disabling, connection pool isolation, or process group termination. The Specialist maintains containment playbooks for common failure modes that enable rapid containment without requiring deep investigation of root cause.

**Investigation.** With containment established, the investigation phase identifies the root cause through systematic analysis of logs, metrics, deployment history, and configuration changes. Investigation follows a structured methodology: establish timeline, identify what changed, correlate changes with incident onset, and validate the causal hypothesis through targeted experiments or log analysis.

**Resolution.** Root cause identification enables targeted resolution through code fixes, configuration changes, infrastructure adjustments, or data repairs. Resolution actions are validated through health check verification and metric recovery confirmation before the incident is declared resolved.

**Post-Mortem.** Every incident produces a structured post-mortem report within 48 hours. Post-mortems follow a blameless methodology that focuses on systemic improvements rather than individual attribution. Post-mortem reports include timeline reconstruction, root cause analysis, impact assessment, contributing factors, and actionable improvement items with assigned owners and deadlines.

## Core Capabilities

The Incident Response Specialist provides six primary capabilities for comprehensive incident management.

**Automated Incident Detection.** Correlating signals from health checks, error rate monitors, latency measurements, and supervision tree crash reports to identify incidents before user impact. Detection algorithms analyze metric combinations rather than individual thresholds, reducing false positives from single-metric spikes.

**Incident Coordination.** Managing multi-agent response efforts with clear role assignments, communication protocols, and escalation paths for incidents that exceed initial containment capacity. Coordination includes status update distribution, resource allocation for investigation, and stakeholder communication management.

**Root Cause Analysis.** Systematically investigating incident causes through log correlation, deployment timeline analysis, dependency chain examination, and configuration change audit. The Specialist maintains investigation templates for common failure categories that guide investigators through relevant data sources.

**Blameless Post-Mortem Execution.** Producing structured post-incident reports that focus on systemic improvements rather than individual blame, with tracked action items that have assigned owners and completion deadlines.

**Runbook Management.** Maintaining and updating incident response procedures based on historical incident patterns and post-mortem findings. Runbooks are version-controlled and validated through periodic tabletop exercises.

**MTTR Optimization.** Analyzing historical incident data to identify response bottlenecks and implement automation that reduces mean time to resolution. Optimization focuses on the phases that contribute most to total resolution time, typically detection-to-triage and investigation-to-resolution.

## Technical Implementation

The Incident Response Specialist is implemented as a supervised [OTP](@/glossary/otp.md) application that maintains incident state machines for all active incidents. Each incident is modeled as a state machine with defined phase transitions, timeout thresholds, and escalation triggers.

Incident detection integrates with the platform's telemetry infrastructure through subscription to health check events, error rate measurements, and supervision tree restart notifications. Detection logic uses sliding window analysis with configurable window sizes and threshold levels per metric type.

Incident state is maintained in [ETS](@/glossary/ets.md) tables for real-time access during active incidents and persisted to [PostgreSQL](@/glossary/postgresql.md) through [Ecto](@/glossary/ecto.md) for post-mortem analysis and trend detection. The database schema models the full incident lifecycle including timeline events, investigation findings, containment actions, and resolution steps.

Communication during incidents uses structured message protocols that distribute status updates, investigation findings, and action requests to all involved agents. Communication is logged immutably to ensure accurate timeline reconstruction during post-mortem analysis.

## Coordination Model

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [alert-management-specialist](@/agents/alert-management-specialist.md) | Receives alert signals that trigger incident response activation | Infrastructure |
| [deployment-rollback-specialist](@/agents/deployment-rollback-specialist.md) | Coordinates emergency rollbacks when incidents are deployment-related | Infrastructure |
| [health-monitoring-specialist](@/agents/health-monitoring-specialist.md) | Provides continuous health [telemetry](@/glossary/telemetry.md) for incident detection and resolution verification | Infrastructure |
| [infrastructure-as-code-specialist](@/agents/infrastructure-as-code-specialist.md) | Coordinates infrastructure-level changes during incident containment and resolution | Infrastructure |
| [gitlab-cicd-specialist-agent](@/agents/gitlab-cicd-specialist-agent.md) | Coordinates emergency hotfix deployment pipelines during incident resolution | DevOps |

## Incident Metrics

The Specialist tracks key metrics that measure incident management effectiveness and drive continuous improvement.

| Metric | Description | Target |
|--------|-------------|--------|
| MTTD | Mean time to detection | Under 5 minutes |
| MTTT | Mean time to triage | Under 10 minutes |
| MTTC | Mean time to containment | Under 30 minutes |
| MTTR | Mean time to resolution | Under 4 hours for SEV-1 |
| Post-Mortem Completion | Within deadline | 100% within 48 hours |
| Action Item Completion | Post-mortem items resolved | 100% within 30 days |
| Recurrence Rate | Incidents with same root cause | Under 5% |

## Enforcement

The Incident Response Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every production incident must produce a post-mortem within 48 hours. Every post-mortem must include at least one actionable improvement item with an assigned owner and deadline. No incident is closed without verified resolution and [regression test](@/glossary/regression-test.md) coverage. Recurring incidents without root cause remediation trigger L3 escalation. Post-mortem action items are tracked to completion with zero tolerance for overdue items.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)