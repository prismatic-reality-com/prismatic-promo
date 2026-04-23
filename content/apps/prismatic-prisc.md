+++
title = "Prismatic PRISC"
weight = 71
[extra]
category = "Core"
files = 18
description = "Platform Runtime Instruction Set Computer for agent execution"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 896
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "PRISC", "Platform", "Runtime", "Instruction", "Computer", "apps", "Core", "Prismatic Platform", "PrismaticPrisc"]
tags = ["apps", "core", "prismatic-prisc", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic PRISC - Prismatic Platform"
+++

## Overview

Prismatic PRISC (Platform Runtime Integrity and Safety Controller) provides a comprehensive ethical governance, decision auditing, and state machine framework for the Prismatic Platform. Rather than operating as a traditional instruction set computer, PRISC implements the platform's safety-critical decision oversight infrastructure -- ensuring that all autonomous operations, agent decisions, and system state transitions are auditable, ethically validated, and reversible. In a platform that operates hundreds of autonomous [AIAD](/glossary/aiad/) agents making consequential decisions about intelligence collection, risk assessment, and entity profiling, a rigorous governance layer is not optional but foundational.

The application implements three interconnected subsystems: the Decision Auditor that captures and logs every significant platform decision with full context and provenance; the Ethics Enforcer that validates decisions against configurable ethical boundaries before execution; and the State Machine framework that manages platform-wide state transitions through a formally specified finite automaton. Together, these subsystems ensure that the platform's autonomous capabilities remain transparent, accountable, and aligned with operator-defined ethical constraints.

PRISC also provides specialized analysis capabilities for detecting moral disengagement patterns (where automated systems gradually normalize boundary violations through incremental drift), rationalization analysis (identifying when system outputs construct justifications for predetermined conclusions rather than reasoning from evidence), and guilt tracing (tracking the provenance chain when a decision leads to a negative outcome to identify the specific inputs and rules that contributed to the error). These capabilities are essential for maintaining trust in autonomous intelligence systems that operate at scale.

## Architecture

```
PrismaticPrisc.Application
+-- PrismaticPrisc.StateMachine (GenServer)
|   +-- State transition management
|   +-- Formal state validation
|   +-- History and rollback
|
+-- PrismaticPrisc.Guardian.Council (GenServer)
|   +-- Multi-validator decision approval
|   +-- Quorum-based authorization
|   +-- Guardian vote recording
|
+-- PrismaticPrisc.Audit.EventStore (GenServer)
|   +-- Immutable decision event log
|   +-- Provenance chain management
|   +-- Schema-validated event storage
|
+-- PrismaticPrisc.Ethics (Module)
|   +-- Ethical boundary definitions
|   +-- Constraint validation engine
|
+-- PrismaticPrisc.EthicsEnforcer (GenServer)
|   +-- Real-time ethical validation
|   +-- Boundary violation detection
|   +-- Escalation management
|
+-- PrismaticPrisc.Vault.Vault (GenServer)
|   +-- Encrypted secret storage
|   +-- Release controller
|   +-- Access audit trail
|
+-- Analysis Subsystem
    +-- PrismaticPrisc.DisengagementDetector
    +-- PrismaticPrisc.RationalizationAnalyzer
    +-- PrismaticPrisc.GuiltTracer
    +-- PrismaticPrisc.DriftMonitor
    +-- PrismaticPrisc.PatternCache
```

```
Decision Input --> Guardian Council --> Ethics Enforcer --> State Machine --> Event Store
       |                |                    |                  |               |
   Context +        Quorum Vote          Boundary           Formal          Immutable
   Evidence         Guardian Votes       Validation         Transition       Audit Log
   Provenance       Approval/Reject      Compliance         History          Provenance
       |                |                    |                  |               |
       +-- Drift Monitor --> Disengagement Detector --> Guilt Tracer
                                    |
                          Rationalization Analyzer --> Pattern Cache
```

The architecture follows a defense-in-depth approach to decision governance. Every significant decision passes through the Guardian Council for quorum-based approval, the Ethics Enforcer for boundary validation, and the State Machine for formal transition verification before being recorded as an immutable event in the Event Store. The analysis subsystem operates asynchronously, continuously scanning decision patterns for drift, disengagement, and rationalization.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticPrisc` | Main API facade for decision submission and state queries |
| `PrismaticPrisc.Application` | [OTP](/glossary/otp/) application entry point with supervision tree |
| `PrismaticPrisc.StateMachine` | Formal state machine managing platform-wide state transitions with history |
| `PrismaticPrisc.Guardian.Council` | Multi-validator quorum-based decision approval framework |
| `PrismaticPrisc.Audit.EventStore` | Immutable append-only event log for decision auditing with provenance |
| `PrismaticPrisc.Ethics` | Ethical boundary definitions and constraint specification language |
| `PrismaticPrisc.EthicsEnforcer` | Real-time ethical validation engine checking decisions against boundaries |
| `PrismaticPrisc.DecisionInput` | Structured decision context with evidence and provenance metadata |
| `PrismaticPrisc.DisengagementDetector` | Detects moral disengagement patterns in autonomous decision sequences |
| `PrismaticPrisc.RationalizationAnalyzer` | Identifies post-hoc rationalization in system reasoning chains |
| `PrismaticPrisc.GuiltTracer` | Provenance chain analysis for negative outcome root cause identification |
| `PrismaticPrisc.DriftMonitor` | Continuous monitoring for gradual ethical boundary erosion |
| `PrismaticPrisc.MoralDrift` | Quantifies cumulative moral drift across decision populations |
| `PrismaticPrisc.PatternCache` | ETS-cached analysis patterns for efficient repeated detection |
| `PrismaticPrisc.Vault.Vault` | Encrypted secret storage with controlled release and audit |
| `PrismaticPrisc.Vault.ReleaseController` | Authorized secret access management with time-bounded releases |
| `PrismaticPrisc.Heartbeat` | Periodic system liveness verification ensuring governance is active |
| `PrismaticPrisc.GrandFinale.Executor` | Controlled system shutdown with complete audit trail preservation |

## Ecto Schemas

The application uses [Ecto](/glossary/ecto/) schemas for persistent storage of governance data in [PostgreSQL](/glossary/postgresql/).

| Schema | Purpose | Key Fields |
|--------|---------|-----------|
| `Schema.DecisionInput` | Decision context and evidence | type, context, evidence, requestor, priority |
| `Schema.Event` | Immutable audit event | type, payload, timestamp, provenance, hash_chain |
| `Schema.GuardianVote` | Council member vote record | guardian_id, decision_id, vote, reasoning, timestamp |
| `Schema.Heartbeat` | System liveness record | component, status, timestamp, metadata |
| `Schema.State` | State machine checkpoint | state_name, entered_at, trigger, previous_state |

## Guardian Council

The Guardian Council implements a multi-validator approval framework where significant decisions require quorum-based authorization before execution. Each guardian represents an independent validation perspective -- ethical compliance, legal compliance, operational safety, and epistemic integrity. Decisions are submitted to the council with full context and evidence, and each guardian votes independently with recorded reasoning.

```elixir
# Submit a decision to the Guardian Council
{:ok, ruling} = PrismaticPrisc.Guardian.Council.submit(%DecisionInput{
  type: :entity_risk_escalation,
  context: %{entity: "example.com", current_risk: :medium, proposed_risk: :critical},
  evidence: evidence_chain,
  requestor: :perimeter_scoring_engine
})
# => %{approved: true, votes: 3, quorum: 3, dissent: 0}
```

## Configuration

```elixir
config :prismatic_prisc,
  # Guardian Council
  quorum_size: 3,
  guardian_timeout: :timer.seconds(10),

  # Ethics enforcement
  ethics_enabled: true,
  boundary_violations: :block,  # :block | :warn | :log

  # State machine
  initial_state: :operational,
  state_history_limit: 1000,

  # Vault
  encryption_algorithm: :aes_256_gcm,
  secret_ttl: :timer.hours(24),

  # Drift monitoring
  drift_check_interval: :timer.minutes(15),
  drift_threshold: 0.1,

  # Heartbeat
  heartbeat_interval: :timer.seconds(30),

  # Ecto Repo
  repo: PrismaticPrisc.Repo
```

## API Reference

```elixir
# Submit a decision for ethical validation and audit
{:ok, result} = PrismaticPrisc.decide(%DecisionInput{
  type: :data_collection,
  context: %{target: "entity", scope: :public_data},
  evidence: [%{source: :analyst_request, confidence: 0.95}]
})
# => %{approved: true, state: :operational, audit_id: "evt_..."}

# Query current platform state
{:ok, state} = PrismaticPrisc.current_state()
# => %{state: :operational, since: ~U[...], transitions: 42}

# Audit trail query
{:ok, events} = PrismaticPrisc.Audit.EventStore.query(
  type: :entity_risk_escalation,
  from: ~U[2026-01-01 00:00:00Z],
  limit: 100)

# Moral drift analysis
{:ok, drift} = PrismaticPrisc.DriftMonitor.analyze(period: :last_30_days)
# => %{drift_score: 0.03, trend: :stable, alerts: []}

# Guilt trace for a negative outcome
{:ok, trace} = PrismaticPrisc.GuiltTracer.trace(outcome_id)
# => %{root_causes: [...], contributing_decisions: [...], provenance_chain: [...]}
```

## Testing

```bash
# Run all PRISC tests
cd apps/prismatic_prisc && mix test

# Run with coverage
mix test --cover

# Run guardian council tests
mix test test/prismatic_prisc/guardian

# Run ethics enforcement tests
mix test test/prismatic_prisc/ethics_enforcer_test.exs

# Run drift detection tests
mix test test/prismatic_prisc/drift_monitor_test.exs
```

Testing covers Guardian Council quorum logic with various vote combinations, Ethics Enforcer boundary validation accuracy, State Machine transition correctness and rollback verification, Event Store immutability and provenance chain integrity, and analysis subsystem pattern detection accuracy. Drift detection tests use synthetic decision sequences with known drift patterns to verify detector sensitivity and false positive rates.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Agents](/apps/prismatic-agents/) | Agent decisions submitted through Guardian Council for ethical validation |
| [Prismatic Core](/apps/prismatic-core/) | Shared types, protocols, and platform-wide governance interfaces |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Governance event telemetry for monitoring dashboard integration |
| [Prismatic Safety](/apps/prismatic-safety/) | Quality Floor Guardian triggers PRISC state transitions on quality violations |
| [Prismatic Override](/apps/prismatic-override/) | Emergency overrides recorded as audited state machine transitions |
| [Prismatic CER](/apps/prismatic-cer/) | Audit trail events stored as compliance evidence for regulatory reporting |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- every decision fully traceable through audit event chain | Event Store records complete provenance from input through validation to outcome |
| Signal Plurality | HARD -- Guardian Council requires multiple independent validator votes | Quorum-based approval prevents single-validator bias |
| Contradiction Preservation | HARD -- dissenting guardian votes preserved alongside approval | All votes recorded with individual reasoning, including dissent |
| Unknown Valid | HARD -- uncertain ethical implications explicitly flagged | Ethics Enforcer surfaces uncertainty rather than defaulting to approval |
| Source Independence | HARD -- each guardian operates independently | Isolated validation with no cross-guardian information sharing during voting |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Decision submission | < 50ms | Including Guardian Council vote |
| Ethics validation | < 10ms | Boundary check against rules |
| State transition | < 5ms | Formal verification + history write |
| Event Store write | < 20ms | PostgreSQL with hash chain |
| Drift analysis | 100-500ms | Full 30-day window scan |
| Guilt trace | 50-200ms | Provenance chain traversal |
| Heartbeat cycle | 30s | Periodic liveness check |

## Related Resources

- [Prismatic Safety](/apps/prismatic-safety/) -- Quality governance complementing ethical governance
- [Prismatic Override](/apps/prismatic-override/) -- Emergency interventions audited through PRISC
- [Prismatic CER](/apps/prismatic-cer/) -- Compliance evidence from governance audit trail
- [Quality Gates](/capabilities/quality-gates/) -- Decision quality enforcement checkpoints
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent governance compliance with AIAD protocols
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Governance event observability and monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)