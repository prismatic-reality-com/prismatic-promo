+++
title = "Sequential Coordinator Agent"
weight = 365
[extra]
domain = "general"
level = "L3"
description = "Manages sequential multi-phase deployment pipelines ensuring ordered execution from source through QA to performance validation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Sequential", "Coordinator", "Agent", "Manages", "agents", "Prismatic Platform", "Gate", "Pipeline", "Typically"]
tags = ["agents", "agent", "sequential-coordinator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Sequential Coordinator Agent - Prismatic Platform"
+++

## Overview

The Sequential Coordinator Agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's general domain, managing multi-phase deployment and execution pipelines that require strict sequential ordering. While many platform operations benefit from parallelism, certain workflows demand that phases execute in a precise, ordered sequence where each phase's successful completion is a prerequisite for the next. This agent ensures that source compilation, QA validation, performance benchmarking, and deployment stages execute in their required order with proper gate verification between each transition.

In an [OTP](@/glossary/otp.md)-based platform with 90 umbrella applications, the complexity of sequential coordination is substantial. A deployment pipeline that must compile all applications, run all test suites, verify performance benchmarks, and then deploy to staging before production requires careful orchestration to handle partial failures, timeout conditions, and rollback scenarios. The Sequential Coordinator Agent manages this complexity through a state-machine architecture implemented as a [GenServer](@/glossary/genserver.md) that tracks pipeline progress and enforces phase transition gates.

## Operational Domain

The general domain for sequential coordination encompasses any workflow that requires ordered phase execution with inter-phase validation. This includes deployment pipelines (compile, test, benchmark, deploy), quality gate sequences (static analysis, type checking, test execution, coverage verification), evolution cycles (scan, analyze, propose, validate, execute, verify), and release management workflows (version bump, changelog, build, publish). The agent does not execute the work within each phase -- it coordinates the ordering, gate checking, and transition management that ensures phases execute correctly.

The domain also covers recovery coordination when a sequential pipeline encounters a failure mid-execution. The agent must determine whether to retry the failed phase, roll back to a previous checkpoint, or abort the entire pipeline, based on the failure type and the pipeline's rollback policy.

## Key Capabilities

- **Phase transition management** -- Implements strict gate checking between sequential phases, verifying that each phase's exit criteria are met before the next phase begins. Exit criteria can include test pass rates, compilation success, performance benchmark thresholds, and quality scores
- **Pipeline state tracking** -- Maintains a persistent state machine for each active pipeline execution, enabling recovery from process crashes without losing pipeline progress. State is persisted to [ETS](@/glossary/ets.md) with optional disk backup for long-running pipelines
- **Failure recovery orchestration** -- Implements configurable recovery strategies including automatic retry with exponential backoff, checkpoint-based rollback, and graceful pipeline abortion with cleanup. Recovery strategy selection is based on failure classification
- **Dependency-aware scheduling** -- Understands inter-application dependencies within the umbrella and schedules compilation and testing in topological order to maximize efficiency while maintaining correctness
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-recovering pipeline management that handles infrastructure transients without human intervention
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing phase transition events and pipeline metrics under the `:prismatic, :sequential_coordinator` namespace

## Pipeline Architecture

The Sequential Coordinator Agent manages pipelines as directed acyclic graphs (DAGs) where nodes represent phases and edges represent transition gates. While the overall structure is sequential (each phase follows the previous), individual phases may internally spawn parallel work that must complete before the gate check.

```
Source Phase          QA Phase           Performance Phase      Deploy Phase
[Compile All]  --->  [Run Tests]  --->  [Benchmark Suite]  --->  [Stage Deploy]
[Deps Check]         [Credo]            [Load Test]              [Smoke Tests]
[Dialyzer]           [Coverage]         [Memory Profile]         [Prod Deploy]
     |                    |                    |                       |
  Gate 1              Gate 2               Gate 3                  Gate 4
  (zero warnings)     (100% pass)          (< 250ms P95)          (health check)
```

Each gate defines specific criteria that must be satisfied for transition. Gate failures trigger the configured recovery strategy and emit telemetry events for monitoring.

## Phase Gate Specifications

| Gate | Phase Transition | Required Criteria | Failure Action |
|------|-----------------|-------------------|----------------|
| **Gate 1** | Source to QA | Zero compilation warnings, all deps resolved, Dialyzer clean | Abort pipeline |
| **Gate 2** | QA to Performance | All tests pass, Credo clean, coverage above threshold | Abort pipeline |
| **Gate 3** | Performance to Deploy | P95 latency below 250ms, memory within budget, no regressions | Block deploy, alert |
| **Gate 4** | Stage to Production | Health checks pass, smoke tests pass, no error rate elevation | Rollback staging |

## State Machine Implementation

The pipeline state machine tracks the current execution state and manages transitions according to the pipeline specification.

| State | Description | Valid Transitions |
|-------|-------------|-------------------|
| **:initialized** | Pipeline created, not yet started | :running, :cancelled |
| **:running** | Active phase executing | :gate_checking, :failed |
| **:gate_checking** | Evaluating phase exit criteria | :running (next phase), :failed |
| **:failed** | Phase or gate failure detected | :recovering, :aborted |
| **:recovering** | Executing recovery strategy | :running (retry), :aborted |
| **:aborted** | Pipeline terminated, cleanup executing | :completed |
| **:completed** | All phases finished successfully | Terminal state |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority for sequential pipeline management with the ability to coordinate across application boundaries and enforce phase gates that affect deployment progression.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pipeline status` | Display active pipeline states and progress | L3+ |
| `/pipeline start <spec>` | Initiate a sequential pipeline from specification | L3+ |
| `/pipeline abort <id>` | Abort a running pipeline and execute cleanup | L3+ |
| `/pipeline history` | Show recent pipeline executions with outcomes | L2+ |
| `/pipeline gates` | Display gate configurations and recent evaluation results | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [seadf-ecosystem-commander](@/agents/seadf-ecosystem-commander.md) | SEADF evolution cycles use sequential coordination for ordered execution |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality gate criteria defined by the quality commander |
| [scripts-infrastructure-supreme](@/agents/scripts-infrastructure-supreme.md) | Infrastructure scripts provide the atomic operations within pipeline phases |
| [session-debrief-specialist](@/agents/session-debrief-specialist.md) | Pipeline outcomes recorded in session context for continuity |

## Performance Characteristics

The Sequential Coordinator Agent is designed for minimal overhead in the coordination layer, ensuring that pipeline execution time is dominated by actual phase work rather than coordination overhead.

| Metric | Target | Measured |
|--------|--------|----------|
| Gate evaluation time | < 100ms | Typically < 50ms |
| State transition overhead | < 10ms | Typically < 5ms |
| Pipeline initialization | < 50ms | Typically < 20ms |
| Recovery detection time | < 1 second | Typically < 500ms |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that sequential pipelines execute with complete fidelity to their specifications. No phase may be skipped, no gate may be bypassed, and no failure may be silently ignored. Every pipeline execution maintains a complete audit trail including phase durations, gate evaluations, failure details, and recovery actions. This audit trail satisfies [NABLA Infinity](@/glossary/nabla-infinity.md) provenance requirements and enables forensic analysis of pipeline behavior.

## Related Agents

Agents in the **general** domain collaborate with the Sequential Coordinator Agent to manage ordered workflows that span multiple platform domains. The agent ensures that complex multi-phase operations execute reliably, maintaining correctness guarantees even in the presence of transient failures and partial system degradation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)