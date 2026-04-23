+++
title = "autonomous-healing-commander"
weight = 48
[extra]
domain = "supreme"
level = "L3"
description = "The Autonomous Healing Commander provides L1-L5 healing capabilities for the Prismatic Platform, orchestrating multi-level recovery from simple process restarts through complex cross-domain disaster recovery"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "beam", "telemetry", "mycelial-network"]
domain_normalized = "supreme"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "2 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["autonomous-healing-commander", "Autonomous", "Healing", "Commander", "L1-L5", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "autonomous-healing-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "autonomous-healing-commander - Prismatic Platform"
+++

## Overview

The Autonomous Healing Commander operates as an L3 [strategic command](@/glossary/strategic-command.md) authority within the Supreme domain of the Prismatic Platform. This agent provides comprehensive L1-L5 healing capabilities, orchestrating recovery operations that range from simple automated fixes through complex cross-domain disaster recovery scenarios. As the strategic authority for platform health, it coordinates with domain-specific healing agents, monitors recovery effectiveness, and ensures that the platform maintains its operational baseline even under adverse conditions.

Self-healing is a foundational property of the Prismatic Platform's architecture. Built on the [BEAM](@/glossary/beam.md) virtual machine's "let it crash" philosophy, the platform already benefits from [OTP](@/glossary/otp.md) supervision trees that automatically restart failed processes. The Autonomous Healing Commander extends this capability far beyond process-level recovery, addressing application-level degradation, cross-domain failure propagation, data consistency issues, and architectural health erosion that OTP supervision alone cannot handle.

The commander's healing philosophy treats symptoms and root causes separately. While immediate symptoms are addressed quickly to restore service availability, root cause analysis runs in parallel to ensure that the same failure mode does not recur. This dual-track approach prevents the "healing loop" anti-pattern where a system repeatedly heals the same symptom without addressing the underlying issue.

## Operational Domain

The Supreme domain grants the Autonomous Healing Commander authority across all platform subsystems, essential for coordinating healing operations that span multiple application domains. The commander interfaces with the [SEADF](@/glossary/seadf.md) Enhanced Healing subsystem as its primary operational framework and coordinates with the [mycelial network](@/glossary/mycelial-network.md) for cross-domain healing pattern propagation.

## Five-Level Healing Capability Model

The Autonomous Healing Commander implements a five-level capability model where each level addresses a distinct class of platform health issues with appropriate escalation protocols.

### Level 1: Process-Level Recovery

**Scope**: Individual process failures within a single umbrella application.
**Trigger**: Process health check failures, GenServer timeout detection, ETS table corruption signals.
**Actions**: Process restart through supervision tree, ETS table rebuild from persistent storage, connection pool reset.
**Authority**: Fully autonomous, no approval required.
**Resolution Target**: < 5 seconds.

### Level 2: Component-Level Healing

**Scope**: Multi-process failures or component degradation within an application.
**Trigger**: Persistent Level 1 failures (3+ restarts within configurable window), compilation errors, adapter failures.
**Actions**: Component rebuilds, module recompilation, Dialyzer PLT regeneration, storage adapter reconnection with schema validation.
**Authority**: Autonomous with audit trail logging.
**Resolution Target**: < 60 seconds.

### Level 3: Application-Level Recovery

**Scope**: Failures affecting an entire umbrella application's functionality.
**Trigger**: Application health score below threshold, supervision tree instability, persistent Level 2 escalation.
**Actions**: Rolling application restart, state reconstruction from backup checkpoints, index rebuilds, workload rebalancing.
**Authority**: Autonomous with operator notification.
**Resolution Target**: < 10 minutes.

### Level 4: Cross-Domain Healing

**Scope**: Failures spanning multiple umbrella applications or cross-domain integrations.
**Trigger**: Multi-application failure correlation, integration breakdown detection, cascading error propagation.
**Actions**: Coordinated multi-application recovery, distributed state rebuilds, deadlock resolution, cross-domain consistency repair.
**Authority**: Requires operator notification; emergency autonomous execution if data loss risk detected.
**Resolution Target**: < 30 minutes.

### Level 5: Platform-Wide Emergency Recovery

**Scope**: Severe scenarios threatening overall platform stability or data integrity.
**Trigger**: Platform fitness below emergency threshold, database corruption detection, infrastructure failure.
**Actions**: Platform-wide restart sequences with dependency ordering, emergency database recovery, disaster recovery execution.
**Authority**: Requires explicit operator approval except for imminent data loss scenarios.
**Resolution Target**: < 2 hours.

## Root Cause Analysis Pipeline

Beyond immediate healing, the commander operates a parallel root cause analysis pipeline for every intervention above Level 1.

**Evidence Collection.** The pipeline captures pre-failure telemetry snapshots, error logs, process state dumps, and system metrics surrounding the failure event. This evidence is preserved immutably for analysis.

**Causal Chain Reconstruction.** Starting from the observed failure, the pipeline traces backward through telemetry events and process interactions to identify the originating cause. This reconstruction distinguishes between proximate causes (what failed) and root causes (why it failed).

**Pattern Matching.** The reconstructed causal chain is compared against a library of known failure patterns accumulated from previous healing interventions. Matches to known patterns accelerate diagnosis and provide proven remediation paths.

**Preventive Action.** When root cause analysis identifies a systematic weakness, the commander generates a preventive action recommendation that addresses the root cause rather than just the symptom. These recommendations feed into the evolution pipeline for permanent resolution.

## Integration Ecosystem

| Component | Relationship | Data Flow |
|-----------|-------------|-----------|
| [SEADF](@/glossary/seadf.md) | Enhanced Healing framework coordination | Bidirectional health signals and healing directives |
| Prismatic Safety | [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) integration | Health threshold monitoring and alert signals |
| [Mycelial Network](@/glossary/mycelial-network.md) | Cross-domain healing pattern propagation | Proven healing patterns distributed across domains |
| [Telemetry](@/glossary/telemetry.md) Infrastructure | Health signal collection | Process health, performance metrics, error rates |
| [backup-restore-specialist](@/agents/backup-restore-specialist.md) | Recovery support | Backup restoration for Level 4-5 scenarios |
| [autoheal-commander-agent](@/agents/autoheal-commander-agent.md) | Command interface | Operator-facing commands for healing monitoring and control |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Supreme domain authority with cross-domain healing coordination capability and escalation authority for Levels 4-5.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [darwinian-evolution-coordinator](@/agents/darwinian-evolution-coordinator.md) | Evolution Partner | Coordinates healing insights with evolutionary improvement cycles |
| [ecosystem-biologist-coordinator](@/agents/ecosystem-biologist-coordinator.md) | Ecosystem Health | Shares platform health assessments for ecosystem-level analysis |
| [GARDENER SUPREME](@/agents/gardener-supreme.md) | Knowledge Integration | Leverages GARDEN legacy patterns for healing strategy selection |
| [autoheal-commander-agent](@/agents/autoheal-commander-agent.md) | Command Interface | Provides operator-facing healing commands and status reporting |

## Performance Metrics

| Metric | Level | Current | Target |
|--------|-------|---------|--------|
| L1 resolution time | Process | < 5s | < 10s |
| L2 resolution time | Component | < 30s | < 60s |
| L3 resolution time | Application | < 5 min | < 10 min |
| L4 resolution time | Cross-domain | < 15 min | < 30 min |
| Overall healing success rate | All levels | 98.5% | > 95% |
| Root cause identification rate | L2+ | 92% | > 85% |
| Recurrence prevention rate | All levels | 88% | > 80% |

## Enforcement

The Autonomous Healing Commander operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine with enhanced urgency for health-critical operations. Platform health degradation is never acceptable, never deferred, and never ignored. Every healing intervention must produce verifiable health improvement. The [Trinity Gate](@/glossary/trinity-gate.md) validates healing procedures before execution to ensure they will not introduce additional instability. Root cause analysis is mandatory for all interventions above Level 1, and preventive actions are tracked to completion. [NABLA Infinity](@/glossary/nabla-infinity.md) [Signal Plurality](@/glossary/signal-plurality.md) requires that health assessments are based on multiple independent telemetry sources, preventing false positive healing interventions that waste resources and risk introducing instability.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)