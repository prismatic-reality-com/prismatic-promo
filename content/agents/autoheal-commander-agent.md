+++
title = "Autoheal Commander Agent"
weight = 45
[extra]
domain = "general"
level = "L3"
description = "Autonomous self-healing commander providing 5 escalating levels of platform recovery and remediation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "seadf", "trinity-gate", "self-healing", "circuit-breaker"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Autoheal", "Commander", "Agent", "Autonomous", "agents", "Prismatic Platform", "Level", "Triggered", "Autoheal Commander", "Healing"]
tags = ["agents", "agent", "autoheal-commander-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Autoheal Commander Agent - Prismatic Platform"
+++

## Overview

The [Autoheal](@/glossary/autoheal.md) Commander Agent is an L3 [strategic command](@/glossary/strategic-command.md) authority responsible for autonomous [self-healing](@/glossary/self-healing.md) across the Prismatic Platform. This agent provides five escalating levels of healing capability, from simple automated fixes at Level 1 through complex cross-domain recovery operations at Level 5. It serves as the command interface through which operators monitor, control, and audit the platform's self-healing operations.

Self-healing in the Prismatic Platform is not reactive error handling -- it is a proactive system that continuously monitors platform health, detects degradation before it becomes failure, and applies targeted remediation without human intervention. The Autoheal Commander coordinates this process across all 90 [umbrella application](@/glossary/umbrella-application.md)s, ensuring that healing operations do not conflict with each other and that the platform maintains its quality baseline even as individual components experience issues.

The five healing levels represent escalating complexity and authority requirements. Level 1 handles routine fixes like clearing stale caches and restarting unhealthy processes. Level 5 handles severe scenarios like cascading failures across multiple applications that require coordinated cross-domain intervention. Each level has defined trigger conditions, execution protocols, and verification requirements.

## Operational Domain

The General domain grants the Autoheal Commander cross-cutting authority necessary for platform-wide health management. Healing operations frequently span domain boundaries: a performance degradation in the storage layer may manifest as errors in the web layer, requiring coordinated remediation across both domains. A domain-restricted healing commander would be unable to execute these cross-cutting recovery operations.

The commander interfaces with the [SEADF](@/glossary/seadf.md) Enhanced Healing subsystem, which provides the framework for escalating healing operations through progressively more aggressive remediation strategies. SEADF's continuous monitoring pipeline feeds health signals to the Autoheal Commander, which evaluates them against threshold configurations to determine when healing intervention is required.

## Five-Level Healing Architecture

The Autoheal Commander implements five escalating levels of healing capability, each with defined authority scope and verification requirements.

**Level 1: Automated Quick Fix.** Handles routine issues that have well-known remediation procedures: clearing stale ETS caches, restarting processes that have entered error states, regenerating corrupted configuration files, and resetting connection pools. Level 1 healing requires no human approval and executes within seconds. Triggered by: process health check failures, cache corruption detection, configuration drift.

**Level 2: Component Recovery.** Addresses individual component failures that require more than a simple restart: rebuilding ETS table state from persistent storage, re-establishing failed database connections with schema validation, recompiling modules that failed to load correctly, and clearing Dialyzer PLT caches that have become corrupted. Level 2 healing operates autonomously but logs detailed audit trails. Triggered by: persistent process failures after Level 1 intervention, compilation errors, storage adapter failures.

**Level 3: Application-Level Healing.** Handles failures that affect an entire umbrella application: performing rolling restarts of application supervision trees, rebuilding application state from backup checkpoints, re-indexing Meilisearch indices, and rebalancing workload distribution across application processes. Level 3 healing may cause brief service interruption for the affected application. Triggered by: application health score below threshold, supervision tree instability, persistent Level 2 failures.

**Level 4: Cross-Domain Recovery.** Addresses failures that span multiple umbrella applications or affect cross-domain integrations: coordinating simultaneous recovery of interconnected applications, rebuilding distributed state that spans storage adapters, and resolving deadlock situations between communicating processes. Level 4 healing requires notification of platform operators. Triggered by: multi-application failure correlation, cross-domain integration breakdowns, cascading error propagation.

**Level 5: Platform-Wide Emergency Healing.** Reserved for severe scenarios that threaten overall platform stability: orchestrating platform-wide restart sequences with dependency-aware ordering, performing emergency database recovery from backup, and executing disaster recovery procedures. Level 5 healing requires explicit operator approval except in cases where automated detection identifies imminent data loss risk. Triggered by: platform fitness score below emergency threshold, database corruption detection, infrastructure failure.

## Healing Cycle Architecture

Each healing intervention follows a structured four-phase process regardless of its level.

**Phase 1: Health Assessment.** The commander evaluates current platform health by consuming [telemetry](@/glossary/telemetry.md) signals, quality metrics, and process health checks. This assessment produces a health score and identifies specific degradation vectors. The assessment distinguishes between acute failures (immediate intervention needed) and chronic degradation (scheduled intervention appropriate).

**Phase 2: Remediation Selection.** Based on the health assessment, the commander selects the appropriate healing level and specific remediation procedure. Selection considers the failure scope, affected components, available recovery resources, and historical effectiveness of similar interventions. The selected procedure is validated against the [Trinity Gate](@/glossary/trinity-gate.md) before execution.

**Phase 3: Healing Execution.** The selected remediation is applied with continuous monitoring. Each healing action is atomic and reversible where possible. Progress is tracked through telemetry events, and the commander monitors for both successful recovery and potential side effects of the healing intervention itself.

**Phase 4: Verification and Learning.** Post-healing verification confirms that the platform has returned to healthy state. Health metrics are compared against pre-failure baselines. The outcome is recorded for future healing optimization, and the healing procedure's effectiveness score is updated. Failed healings trigger escalation to the next level.

## Command Interface

| Command | Description | Usage |
|---------|-------------|-------|
| `mix autoheal.baseline` | Capture current platform health baseline for comparison | Session start hook |
| `mix autoheal.cycle` | Execute a healing cycle scanning for and remediating issues | Session end hook |
| `mix autoheal.status` | Display current healing state, active interventions, and health scores | Monitoring |
| `mix autoheal.history` | Display healing intervention history with outcome analysis | Trend analysis |

These commands integrate with the Mandatory Session Discipline Protocol. `mix autoheal.baseline` runs automatically at session start, and `mix autoheal.cycle` runs at session end to ensure continuous health monitoring.

## Integration Ecosystem

| Component | Relationship | Data Flow |
|-----------|-------------|-----------|
| [SEADF](@/glossary/seadf.md) | Enhanced Healing subsystem | Receives health monitoring signals and healing framework |
| Prismatic Safety | [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) integration | Health threshold monitoring and quality metric feedback |
| [Telemetry](@/glossary/telemetry.md) Infrastructure | Health signal source | Consumes process health checks, performance metrics, error rates |
| [autoevolve-commander-agent](@/agents/autoevolve-commander-agent.md) | Evolution coordination | Ensures healing and evolution cycles do not conflict |
| [autonomous-healing-commander](@/agents/autonomous-healing-commander.md) | Strategic healing | Receives strategic healing directives for complex recovery scenarios |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to execute healing operations across all platform domains up to Level 3 autonomously and Levels 4-5 with appropriate notification or approval.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [autonomous-healing-commander](@/agents/autonomous-healing-commander.md) | Strategic Authority | Receives strategic healing directives and escalates complex scenarios |
| [autoevolve-commander-agent](@/agents/autoevolve-commander-agent.md) | Evolution Coordination | Synchronizes healing with evolution to prevent operational conflicts |
| [backup-restore-specialist](@/agents/backup-restore-specialist.md) | Recovery Support | Coordinates backup restoration for Level 4-5 healing scenarios |
| [3nl-coordinator](@/agents/3nl-coordinator.md) | Reasoning Support | Receives analytical support for complex failure diagnosis |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Level 1 resolution time | < 5s | < 10s | Time to resolve routine health issues |
| Level 2 resolution time | < 30s | < 60s | Time to resolve component-level failures |
| Level 3 resolution time | < 5 min | < 10 min | Time to resolve application-level issues |
| Healing success rate | 98% | > 95% | Percentage of interventions restoring healthy state |
| False positive rate | < 2% | < 5% | Percentage of unnecessary healing interventions |
| Escalation rate | < 5% | < 10% | Percentage of interventions requiring level escalation |

## Enforcement

The Autoheal Commander operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every healing intervention must produce verifiable health improvement. Healing operations that fail to restore healthy state trigger immediate escalation -- there is no "wait and see" for platform health degradation. The [Trinity Gate](@/glossary/trinity-gate.md) validates all healing procedures before execution to ensure structural, logical, and formal consistency of the remediation approach. Health baselines are mandatory and non-negotiable: the platform must always know what "healthy" looks like in order to detect and remediate deviation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)