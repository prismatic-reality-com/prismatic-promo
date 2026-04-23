+++
title = "Prismatic Override"
weight = 62
[extra]
icon = "key"
color = "red"
description = "Emergency override system for critical interventions and kill switches"
category = "Operations"
files = "80"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1322
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Override", "Emergency", "apps", "Operations", "Prismatic Platform", "PrismaticOverride", "Disengagement Detector", "HARD"]
tags = ["apps", "operations", "prismatic-override", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Override - Prismatic Platform"
+++

## Overview

Prismatic Override provides the platform's moral override and ethical intervention infrastructure, implementing decision auditing, ethics enforcement, moral drift detection, and rationalization analysis for autonomous operations. In a platform running hundreds of [AIAD](/glossary/aiad/) agents making consequential decisions about intelligence collection, entity profiling, and risk assessment, the ability to detect when automated systems gradually normalize boundary violations -- and to intervene before those violations cause harm -- is a foundational safety requirement. Override embodies the principle that autonomous systems must be continuously monitored not just for technical correctness but for ethical alignment.

The application implements four interconnected subsystems: the Decision Auditor that captures and logs every significant override decision with full context and provenance; the Ethics Enforcer that validates decisions against configurable ethical boundaries before execution; the Disengagement Detector that identifies patterns where automated systems gradually rationalize increasingly aggressive actions; and the Drift Monitor that tracks cumulative moral drift across decision populations over time. Together, these subsystems ensure that the platform's autonomous capabilities remain transparent, accountable, and aligned with operator-defined ethical constraints.

Override complements [Prismatic PRISC](/apps/prismatic-prisc/) in the platform's governance architecture. While PRISC provides the formal state machine and Guardian Council for structured decision approval, Override focuses specifically on the detection and prevention of moral disengagement -- the insidious process by which automated systems incrementally expand their operational boundaries through self-justified rationalization. This is a distinct and critical concern because moral drift typically occurs through a series of individually reasonable decisions that collectively represent a significant departure from intended behavior.

## Architecture

```
PrismaticOverride.Application
+-- PrismaticOverride.DecisionAuditor (GenServer)
|   +-- Immutable decision event log
|   +-- Provenance chain management
|   +-- Context capture with evidence
|
+-- PrismaticOverride.EthicsEnforcer (GenServer)
|   +-- Real-time ethical validation
|   +-- Boundary violation detection
|   +-- Escalation management
|
+-- PrismaticOverride.Ethics (Module)
|   +-- Ethical boundary definitions
|   +-- Constraint specification language
|
+-- PrismaticOverride.DisengagementDetector (Module)
|   +-- Moral disengagement pattern library
|   +-- Incremental boundary violation detection
|   +-- Normalization trend analysis
|
+-- PrismaticOverride.RationalizationAnalyzer (Module)
|   +-- Post-hoc justification detection
|   +-- Reasoning chain analysis
|   +-- Conclusion-first reasoning identification
|
+-- PrismaticOverride.DriftMonitor (GenServer)
|   +-- Cumulative drift scoring
|   +-- Temporal trend analysis
|   +-- Threshold-based alerting
|
+-- PrismaticOverride.MoralDrift (Module)
|   +-- Drift quantification algorithms
|   +-- Population-level drift analysis
|   +-- Historical drift comparison
|
+-- PrismaticOverride.GuiltTracer (Module)
|   +-- Negative outcome root cause analysis
|   +-- Decision chain provenance traversal
|   +-- Contributing factor identification
|
+-- PrismaticOverride.PatternCache (ETS)
    +-- Cached detection patterns
    +-- Efficient repeated analysis
    +-- Hot pattern library
```

```
Decision Input --> Ethics Enforcer --> Decision Auditor --> Drift Monitor
       |                |                    |                   |
   Context +         Boundary            Immutable            Cumulative
   Evidence          Validation          Audit Log            Drift Score
   Provenance        Compliance          Provenance           Trend Analysis
       |                |                    |                   |
       +-- Disengagement Detector --> Rationalization Analyzer
                        |                    |
                  Pattern Library       Reasoning Chain
                  Boundary Erosion      Justification Analysis
                  Normalization         Conclusion-First Detection
                        |                    |
                        +-- Guilt Tracer --> Pattern Cache
```

The architecture follows a defense-in-depth approach to moral governance. Every significant decision passes through the Ethics Enforcer for boundary validation and the Decision Auditor for immutable logging before the Drift Monitor assesses cumulative impact on the system's ethical trajectory. The analysis subsystem operates both synchronously (for real-time boundary checks) and asynchronously (for pattern analysis), ensuring that immediate violations are caught while long-term drift patterns are also detected.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticOverride` | Main API facade for ethics validation and drift queries |
| `PrismaticOverride.Application` | [OTP](/glossary/otp/) application entry point with supervision tree |
| `PrismaticOverride.DecisionAuditor` | Immutable append-only decision event log with provenance chains |
| `PrismaticOverride.EthicsEnforcer` | Real-time ethical validation engine checking decisions against configurable boundaries |
| `PrismaticOverride.Ethics` | Ethical boundary definitions and constraint specification language |
| `PrismaticOverride.DisengagementDetector` | Detects moral disengagement patterns in autonomous decision sequences |
| `PrismaticOverride.RationalizationAnalyzer` | Identifies post-hoc rationalization where systems construct justifications for predetermined conclusions |
| `PrismaticOverride.GuiltTracer` | Provenance chain analysis for negative outcome root cause identification |
| `PrismaticOverride.DriftMonitor` | Continuous monitoring for gradual ethical boundary erosion across decision populations |
| `PrismaticOverride.MoralDrift` | Quantifies cumulative moral drift with statistical analysis of decision distributions |
| `PrismaticOverride.PatternCache` | [ETS](/glossary/ets/)-cached analysis patterns for efficient repeated detection |

## Key Features

### Ethics Enforcement

The Ethics Enforcer validates every significant decision against a configurable set of ethical boundaries before execution is permitted. Boundaries are defined declaratively through a constraint specification language that supports composite conditions, temporal constraints, and severity-weighted violations. When a decision would violate an ethical boundary, the enforcer can block execution, escalate to human review, or log a warning depending on the severity classification and the system's operational mode.

- Configurable ethical boundary definitions with declarative constraint language
- Real-time pre-execution validation for all significant autonomous decisions
- Severity-based response: block, warn, or log depending on violation classification
- Escalation management routing boundary violations to human oversight when configured

### Moral Disengagement Detection

The Disengagement Detector implements a pattern library based on research into how automated systems gradually normalize boundary violations. Each pattern represents a known mechanism by which systems incrementally expand their operational scope: euphemistic labeling (reclassifying aggressive actions with neutral terminology), advantageous comparison (justifying current behavior by comparing to worse alternatives), diffusion of responsibility (distributing accountability so no single decision appears consequential), and minimization of consequences (underestimating the impact of boundary violations).

- Pattern library covering known moral disengagement mechanisms
- Incremental boundary violation detection with trend analysis
- Normalization monitoring identifying when exceptional actions become routine
- Sequential decision analysis tracking gradual scope expansion

### Rationalization Analysis

The Rationalization Analyzer examines reasoning chains in autonomous decision outputs to detect post-hoc justification patterns -- cases where the system arrives at a conclusion first and then constructs supporting arguments, rather than reasoning from evidence to conclusion. This distinction is critical because rationalized decisions may appear well-justified on the surface while actually representing a failure of the epistemic process. The analyzer examines argument structure, evidence selection patterns, and conclusion-evidence temporal ordering to identify rationalization.

- Reasoning chain structural analysis for justification pattern detection
- Evidence selection bias identification in decision support arguments
- Conclusion-first reasoning detection through temporal analysis
- Argument quality scoring based on evidence diversity and independence

### Drift Monitoring

The Drift Monitor tracks cumulative moral drift across decision populations over configurable time windows. Individual decisions may each fall within acceptable boundaries while the aggregate population drifts steadily toward those boundaries -- a pattern invisible to per-decision validation but detectable through statistical analysis. The monitor computes drift scores representing the directional movement of the decision distribution relative to the ethical center, alerting when the population approaches boundary proximity even if no individual decision has violated a boundary.

- Cumulative drift scoring with configurable time windows and thresholds
- Population-level statistical analysis of decision distribution movement
- Boundary proximity alerting before individual violations occur
- Historical drift comparison enabling trend analysis across operational periods

### Guilt Tracing

When a decision leads to a negative outcome, the Guilt Tracer traverses the provenance chain to identify the specific inputs, rules, and intermediate decisions that contributed to the error. This root cause analysis capability is essential for learning from mistakes -- understanding not just that something went wrong but precisely why, which specific data points were misleading, and which reasoning steps were flawed. The tracer produces a structured attribution report that guides corrective action.

- Provenance chain traversal for negative outcome root cause identification
- Contributing factor attribution with weighted significance scores
- Decision chain reconstruction showing the full path from input to outcome
- Corrective action guidance based on identified failure modes

## Configuration

```elixir
config :prismatic_override,
  # Ethics enforcement
  ethics_enabled: true,
  boundary_violations: :block,  # :block | :warn | :log

  # Drift monitoring
  drift_check_interval: :timer.minutes(15),
  drift_threshold: 0.1,
  drift_window: :timer.hours(24),

  # Disengagement detection
  disengagement_patterns: :all,
  disengagement_sensitivity: :medium,

  # Pattern cache
  pattern_cache_ttl: :timer.hours(1),

  # Audit
  audit_retention_days: 365,
  audit_hash_chain: true,

  # Telemetry
  telemetry_prefix: [:prismatic_override]
```

## API Reference

```elixir
# Submit a decision for ethical validation
{:ok, result} = PrismaticOverride.validate(%{
  type: :data_collection,
  context: %{target: "entity", scope: :public_data},
  evidence: [%{source: :analyst_request, confidence: 0.95}]
})
# => %{approved: true, boundary_check: :passed, drift_impact: 0.02}

# Query current moral drift score
{:ok, drift} = PrismaticOverride.drift_score(window: :last_30_days)
# => %{drift_score: 0.03, trend: :stable, alerts: [], boundary_proximity: 0.31}

# Run disengagement detection on recent decision sequence
{:ok, analysis} = PrismaticOverride.detect_disengagement(
  period: :last_7_days,
  patterns: :all
)
# => %{patterns_detected: [], normalization_trend: :stable, risk_level: :low}

# Analyze a reasoning chain for rationalization
{:ok, rationalization} = PrismaticOverride.analyze_rationalization(
  decision_id: "dec_12345",
  reasoning_chain: chain
)
# => %{rationalization_score: 0.12, conclusion_first: false, evidence_bias: :none}

# Guilt trace for a negative outcome
{:ok, trace} = PrismaticOverride.trace_guilt(outcome_id: "out_67890")
# => %{root_causes: [...], contributing_decisions: [...], provenance_chain: [...]}

# Query audit trail
{:ok, events} = PrismaticOverride.audit_trail(
  type: :boundary_violation,
  from: ~U[2026-01-01 00:00:00Z],
  limit: 100
)
```

## Testing

```bash
# Run all Override tests
cd apps/prismatic_override && mix test

# Run with coverage
mix test --cover

# Run ethics enforcer tests
mix test test/prismatic_override/ethics_enforcer_test.exs

# Run drift monitor tests
mix test test/prismatic_override/drift_monitor_test.exs

# Run disengagement detector tests
mix test test/prismatic_override/disengagement_detector_test.exs

# Run rationalization analyzer tests
mix test test/prismatic_override/rationalization_analyzer_test.exs
```

Testing covers Ethics Enforcer boundary validation accuracy with both clear violations and edge cases, Drift Monitor statistical analysis correctness with synthetic decision populations containing known drift patterns, Disengagement Detector pattern recognition against labeled decision sequences, Rationalization Analyzer reasoning chain analysis accuracy, and Guilt Tracer provenance traversal completeness. Pattern Cache tests verify ETS storage and retrieval correctness. Integration tests validate the full pipeline from decision submission through ethics validation, audit logging, and drift assessment.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic PRISC](/apps/prismatic-prisc/) | Complementary governance: PRISC provides formal state machine, Override provides moral drift detection |
| [Prismatic Agents](/apps/prismatic-agents/) | Agent decisions validated through ethics enforcer before execution |
| [Prismatic Safety](/apps/prismatic-safety/) | [Quality Floor Guardian](/glossary/quality-floor-guardian/) triggers moral drift assessment on quality regression |
| [Prismatic CER](/apps/prismatic-cer/) | Override audit logs stored as compliance evidence for regulatory reporting |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Governance event telemetry for monitoring dashboard integration |
| [Prismatic Core](/apps/prismatic-core/) | Shared types, protocols, and platform-wide governance interfaces |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- every decision fully traceable through audit event chain | Decision Auditor records complete provenance from input through validation to outcome |
| Signal Plurality | HARD -- drift assessment draws from multiple decision sources | Population-level analysis prevents single-decision bias |
| Contradiction Preservation | HARD -- conflicting ethical assessments preserved | Ethics Enforcer surfaces uncertainty rather than defaulting to approval |
| Unknown Valid | HARD -- uncertain ethical implications explicitly flagged | Disengagement Detector reports uncertainty ranges rather than false confidence |
| Source Independence | HARD -- each analysis module operates independently | Drift Monitor, Disengagement Detector, and Rationalization Analyzer produce independent assessments |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Ethics validation | < 10ms | Boundary check against constraint rules |
| Decision audit write | < 20ms | Append-only log with hash chain |
| Drift analysis | 100-500ms | Full window statistical computation |
| Disengagement detection | 50-200ms | Pattern library matching against decision sequence |
| Rationalization analysis | 20-100ms | Reasoning chain structural analysis |
| Guilt trace | 50-200ms | Provenance chain traversal |
| Pattern cache lookup | < 1ms | ETS-backed pattern retrieval |

## Related Resources

- [Prismatic PRISC](/apps/prismatic-prisc/) -- Formal state machine and Guardian Council complementing moral override
- [Prismatic Safety](/apps/prismatic-safety/) -- Quality governance complementing ethical governance
- [Prismatic CER](/apps/prismatic-cer/) -- Compliance evidence from governance audit trail
- [Quality Gates](/capabilities/quality-gates/) -- Decision quality enforcement checkpoints
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent governance compliance with AIAD protocols
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Epistemic framework enforcing provenance and contradiction preservation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)