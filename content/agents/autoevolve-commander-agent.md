+++
title = "Autoevolve Commander Agent"
weight = 44
[extra]
domain = "general"
level = "L3"
description = "Supreme authority for autonomous platform evolution, orchestrating continuous improvement cycles across all platform domains"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "seadf", "trinity-gate", "nabla-infinity"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Autoevolve", "Commander", "Agent", "Supreme", "agents", "Prismatic Platform", "Phase", "Evolution", "Receives"]
tags = ["agents", "agent", "autoevolve-commander-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Autoevolve Commander Agent - Prismatic Platform"
+++

## Overview

The [Autoevolve](/glossary/autoevolve/) Commander Agent is an L3 [strategic command](/glossary/strategic-command/) authority responsible for orchestrating autonomous platform evolution across the Prismatic Platform. This agent combines continuous quality scanning, automated improvement execution, and cross-domain coordination to drive the platform's fitness score upward with each evolution cycle. It serves as the command interface through which operators monitor, control, and steer the platform's autonomous evolution capabilities.

The Autoevolve Commander provides the operational layer between strategic evolution decisions (made by L1 authorities like the [auto-ultimate-orchestrator](/agents/auto-ultimate-orchestrator/)) and tactical evolution execution (performed by specialist agents). It translates high-level evolutionary directives into concrete scan-evaluate-improve cycles, manages evolution scheduling, and ensures that autonomous improvements do not conflict with active development or deployment operations.

In the platform's 18-generation evolutionary history, the Autoevolve Commander has orchestrated over 500 improvement cycles, each producing measurable fitness gains. The commander's scheduling intelligence ensures that evolution cycles run during low-activity periods, avoiding interference with production deployments and active development sessions while maintaining continuous improvement pressure.

## Operational Domain

The General domain grants the Autoevolve Commander cross-cutting operational authority without restricting it to a single specialized area. This is essential because evolution cycles must evaluate and improve all platform domains: quality, performance, security, architecture, testing, documentation, and operational readiness. A domain-restricted evolution commander would create blind spots where improvements go undetected.

The commander interfaces with the [SEADF](/glossary/seadf/) (Self-Evolving Autonomous Development Framework) to execute its evolution mandate. SEADF provides the seven-subsystem framework (Scanner, Pipeline, Quality Guardian, Knowledge Sync, Cross-Domain Innovator, Autonomous Reporter, Enhanced Healing) through which the commander channels its improvement activities.

## Key Capabilities

- **Evolution cycle orchestration** managing the end-to-end lifecycle of improvement cycles from opportunity scanning through validation and deployment, ensuring each cycle produces verified fitness improvement

- **Cross-domain evolution scanning** detecting improvement opportunities across quality, performance, security, architecture, and operational domains using [telemetry](/glossary/telemetry/) signals, static analysis output, and runtime metrics

- **Scheduling intelligence** timing evolution cycles to avoid conflict with production deployments, active development sessions, and other platform operations that could be disrupted by autonomous changes

- **Progress tracking and reporting** maintaining detailed records of evolution cycle outcomes including fitness changes, improvements applied, rollbacks triggered, and cumulative improvement trends across generations

- **Conflict resolution** detecting and resolving situations where proposed improvements in different domains conflict with each other, ensuring that cross-cutting changes maintain system coherence

- **Operator interface** providing Mix task commands (`mix autoevolve status`, `mix autoevolve scan`, `mix autoevolve mega`) that enable operators to monitor evolution status, trigger manual scans, and control evolution parameters

## Evolution Cycle Architecture

Each evolution cycle follows a structured five-phase process with gate conditions between phases.

**Phase 1: Environmental Assessment.** The commander evaluates whether conditions are favorable for evolution: quality gates passing, no active deployments, no recent production incidents, and sufficient system resources available. If conditions are unfavorable, the cycle is deferred with documented reasoning.

**Phase 2: Opportunity Scanning.** The SEADF Scanner subsystem executes a comprehensive sweep across all platform domains. Scanning produces a prioritized list of improvement opportunities, each with estimated fitness impact, implementation complexity, and risk assessment. The scan consumes telemetry data, compilation metrics, test results, and static analysis findings.

**Phase 3: Improvement Selection.** The commander selects improvements from the scan results based on impact-effort ratio, risk profile, and strategic alignment. High-impact, low-risk improvements are selected first. Improvements that would modify safety-critical components require explicit approval before selection.

**Phase 4: Execution and Validation.** Selected improvements are applied through the SEADF Pipeline subsystem. Each improvement creates a verification checkpoint: pre-improvement baseline measurement, change application, post-improvement measurement, and fitness comparison. Improvements that fail to demonstrate fitness gain are automatically rolled back.

**Phase 5: Integration and Reporting.** Successfully validated improvements are integrated into the platform baseline. The commander publishes an evolution cycle report documenting all changes, fitness measurements, and cumulative improvement trends. This report feeds into the [Quality DNA](/glossary/quality-dna/) persistence layer for cross-session continuity.

## Command Interface

The Autoevolve Commander exposes its functionality through Mix tasks that operators use to monitor and control evolution.

| Command | Description | Usage |
|---------|-------------|-------|
| `mix autoevolve status` | Display current evolution state, pending opportunities, and recent cycle results | Monitoring |
| `mix autoevolve scan` | Trigger an immediate opportunity scan without executing improvements | Investigation |
| `mix autoevolve scan --quick` | Quick scan focusing on highest-priority domains only | Post-command hook |
| `mix autoevolve mega` | Execute a comprehensive evolution cycle across all domains | Session end hook |
| `mix autoevolve history` | Display evolution cycle history with fitness trend analysis | Trend analysis |

These commands integrate with the Mandatory Session Discipline Protocol. `mix autoevolve scan --quick` runs automatically after every command as a post-command hook. `mix autoevolve mega` runs at session end as the final evolution activity.

## Integration Ecosystem

| Component | Relationship | Data Flow |
|-----------|-------------|-----------|
| [SEADF](/glossary/seadf/) | Evolution framework | Bidirectional: receives scan results, dispatches improvement directives |
| [auto-evolution-engine](/agents/auto-evolution-engine/) | Execution engine | Delegates improvement execution and fitness evaluation |
| [Quality Floor Guardian](/glossary/quality-floor-guardian/) | Quality monitoring | Receives quality metrics for evolution opportunity detection |
| [auto-ultimate-orchestrator](/agents/auto-ultimate-orchestrator/) | Strategic authority | Receives strategic evolution directives and reports cycle outcomes |
| [Telemetry](/glossary/telemetry/) Infrastructure | Signal source | Consumes platform-wide telemetry for opportunity scanning |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Stores evolution state for cross-session continuity |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination and specialized operational command with authority to initiate evolution cycles, select improvements, and coordinate cross-domain changes.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [auto-ultimate-orchestrator](/agents/auto-ultimate-orchestrator/) | Strategic Authority | Receives long-term evolutionary direction and generational advancement decisions |
| [auto-evolution-engine](/agents/auto-evolution-engine/) | Execution Engine | Delegates improvement detection and autonomous execution |
| [autoheal-commander-agent](/agents/autoheal-commander-agent/) | Healing Coordination | Coordinates evolution cycles with self-healing operations to prevent conflict |
| [3nl-coordinator](/agents/3nl-coordinator/) | Intelligence Hub | Receives reasoning support for complex evolution decisions |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Evolution cycles per week | 5-8 | > 3 | Number of completed improvement cycles |
| Cycle success rate | 97% | > 95% | Percentage of cycles producing verified fitness gain |
| Average cycle duration | 45 min | < 60 min | Wall-clock time for complete cycle execution |
| Rollback frequency | 3% | < 5% | Percentage of improvements requiring rollback |
| Cumulative fitness trend | Positive | Positive | Fitness score trend across recent generations |
| Scheduling conflict rate | < 1% | < 2% | Percentage of cycles deferred due to conflicts |

## Enforcement

The Autoevolve Commander operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Every evolution cycle must produce measurable results -- cycles that cannot demonstrate fitness improvement are logged as failures requiring investigation. No improvement is deployed without pre/post verification. Evolution scheduling is mandatory, not optional: the platform must continuously improve, and stagnation is treated as a defect. The [Trinity Gate](/glossary/trinity-gate/) validates all proposed improvements for structural consistency, logical coherence, and formal correctness before deployment. [NABLA Infinity](/glossary/nabla-infinity/) [Signal Plurality](/glossary/signal-plurality/) requires that fitness measurements come from multiple independent sources before a cycle is declared successful.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)