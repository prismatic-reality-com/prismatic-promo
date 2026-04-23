+++
title = "/nabla-status"
weight = 1760
[extra]
category = "Formal Verification"
description = "NABLA Infinity epistemic framework status and health"
syntax = "/nabla-status [options]"
authority = "L2+"
agent = "nabla-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1124
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["nabla-status", "NABLA", "Infinity", "commands", "Formal Verification", "Prismatic Platform", "GREEN", "HARD", "Trinity Gate"]
tags = ["commands", "formal-verification", "nabla-status", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/nabla-status - Prismatic Platform"
+++

## Overview

**/nabla-status** is a production command in the **[Formal Verification](@/glossary/formal-verification.md)** category of the Prismatic Platform. It reports the current health, compliance state, and operational metrics of the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, which governs how the platform forms, evaluates, and maintains beliefs about its own state and the external systems it monitors. NABLA Infinity is the epistemic backbone of the Prismatic Platform, enforcing seven non-negotiable axioms that prevent the system from making unsupported claims, burying contradictions, or operating on stale information.

This command operates under the **L2+** authority level and is executed by the `nabla-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority allows any operational team member to inspect the epistemic framework's health, recognizing that epistemic integrity is a shared responsibility across all platform operations.

Understanding the NABLA framework's status is essential for maintaining confidence in the platform's outputs. When NABLA axioms are fully satisfied, every claim the platform makes can be traced to its sources, every contradiction is preserved for investigation, and every belief carries a timestamp and confidence score. When axioms are violated, the platform's outputs may be unreliable, and corrective action is required.

## Architecture

The `/nabla-status` command queries multiple subsystems to assemble a comprehensive view of epistemic health.

### Status Collection Architecture

```
              /nabla-status
                    |
           Status Aggregator
                    |
    +-------+-------+-------+-------+
    |       |       |       |       |
  Axiom   Trinity  Belief  Time    Source
  Monitor  Gate    Store   Decay   Registry
    |       |       |       |       |
    v       v       v       v       v
  7 Axiom  Gate    Belief  Stale   Source
  States   Health  Stats   Count   Count
    |       |       |       |       |
    +-------+-------+-------+-------+
                    |
            Status Report
```

### Monitored Subsystems

| Subsystem | Metrics Reported | Health Indicator |
|-----------|-----------------|------------------|
| **Axiom Monitor** | Per-axiom compliance (7 axioms) | GREEN/YELLOW/RED per axiom |
| **Trinity Gate** | Gate pass/fail rates, queue depth | GREEN if >99% pass rate |
| **Belief Store** | Total beliefs, active, archived, contradicted | GREEN if contradiction ratio <5% |
| **Time Decay** | Stale beliefs count, decay rate, refresh queue | GREEN if stale <1% |
| **Source Registry** | Independent sources count, diversity index | GREEN if diversity >0.7 |
| **Provenance Tracker** | Traceable beliefs %, orphaned beliefs | GREEN if traceable >99.9% |
| **Confidence Engine** | Average confidence, distribution histogram | GREEN if mean >0.8 |

## Usage

```bash
# Quick status overview
/nabla-status

# Detailed status with per-axiom breakdown
/nabla-status --detailed

# Status for specific axiom
/nabla-status --axiom signal-plurality

# Status in JSON format (for CI/CD integration)
/nabla-status --format json

# Historical status over time
/nabla-status --history 7d

# Check only Trinity Gate health
/nabla-status --component trinity-gate

# Verbose output with individual belief samples
/nabla-status --verbose

# Alert-only mode (output only if problems exist)
/nabla-status --alerts-only

# Export status report
/nabla-status --export ./nabla-report.md
```

### Practical Examples

```bash
# Pre-deployment epistemic health check
/nabla-status --detailed --format json | jq '.overall_health'

# Monitor axiom compliance trends over the past month
/nabla-status --history 30d --axiom contradiction-preservation

# CI/CD gate integration
/nabla-status --alerts-only --format json --exit-code

# Investigate stale beliefs before a critical operation
/nabla-status --component time-decay --verbose
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--detailed` | `flag` | false | Show per-axiom and per-component breakdown |
| `--axiom` | `string` | all | Filter to specific axiom: `signal-plurality`, `contradiction-preservation`, `absence-informative`, `time-decay`, `unknown-valid`, `source-independence`, `provenance-mandatory` |
| `--component` | `string` | all | Filter to specific component: `trinity-gate`, `belief-store`, `time-decay`, `source-registry`, `provenance-tracker`, `confidence-engine` |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--history` | `duration` | none | Show historical trends over specified period |
| `--verbose` | `flag` | false | Include sample data and detailed metrics |
| `--alerts-only` | `flag` | false | Output only if violations or warnings exist |
| `--exit-code` | `flag` | false | Return non-zero exit code on violations |
| `--export` | `path` | none | Export status report to file |
| `--threshold` | `float` | 0.95 | Confidence threshold for health assessment |

## Execution Flow

### Phase 1: Subsystem Polling

The command simultaneously queries all NABLA subsystems through their respective health endpoints. Each subsystem returns its current state, recent metrics, and any active violations. Polling is designed to be read-only and non-disruptive to ongoing epistemic operations.

### Phase 2: Axiom Compliance Evaluation

Each of the seven axioms is evaluated against current subsystem state:

| Axiom | Evaluation Criteria | Enforcement |
|-------|-------------------|-------------|
| **Signal Plurality** | Every active belief has >= 2 independent supporting signals | HARD |
| **Contradiction Preservation** | No contradictions resolved by deletion; both sides preserved | HARD |
| **Absence Informative** | Missing signals tracked as data points, not ignored | SOFT |
| **Time Decay** | All beliefs carry timestamps; stale beliefs flagged | HARD |
| **Unknown Valid** | "Unknown" states explicitly represented, not coerced to defaults | HARD |
| **Source Independence** | Source diversity measured; monoculture detected | SOFT |
| **Provenance Mandatory** | All beliefs traceable to their origins | HARD |

### Phase 3: Trinity Gate Health Assessment

The [Trinity Gate](@/glossary/trinity-gate.md) is evaluated across its four layers:

1. **Structural Consistency** -- Belief network forms a valid directed acyclic graph
2. **Logical Consistency** -- No logical contradictions in active beliefs
3. **Formal Necessity** -- Critical beliefs backed by formal proofs
4. **Epistemic Consciousness** -- Meta-awareness of framework limitations

### Phase 4: Health Score Computation

Individual component scores are aggregated into an overall health score using weighted combination:

```
Overall Health = 0.30 * Axiom Compliance
              + 0.25 * Trinity Gate Health
              + 0.20 * Belief Store Health
              + 0.15 * Provenance Coverage
              + 0.10 * Time Decay Management
```

### Phase 5: Report Generation

The final status report is formatted according to the requested format and output. Violations are highlighted with severity levels and recommended remediation actions.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/trinity](@/commands/trinity.md) | Peer | Shares Trinity Gate health data |
| [/trinity-3nl-fusion](@/commands/trinity-3nl-fusion.md) | Peer | Fusion pipeline status feeds into NABLA health |
| [/formal-verify](@/commands/formal-verify.md) | Upstream | Formal verification results update belief confidence |
| [/lean](@/commands/lean.md) | Upstream | Lean4 proof results contribute to Trinity Gate formal layer |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | NABLA health is a quality gate check |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Epistemic metrics streamed to telemetry |
| [Color Teams](@/glossary/color-teams.md) | Security | Blue team monitors epistemic defense posture via NABLA |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime | Agent decisions gated by NABLA confidence levels |

## Best Practices

### Regular Health Checks

Run `/nabla-status` at the start of every development session and before every deployment. Epistemic health degrades subtly over time as new beliefs accumulate without corresponding source diversity or temporal refresh.

### Axiom Violation Response

**HARD axiom violations** require immediate attention. The platform may be making unsupported claims or hiding contradictions. Stop other work and resolve the violation before proceeding.

**SOFT axiom violations** are warnings. They indicate suboptimal epistemic hygiene but do not necessarily invalidate platform outputs. Address them within the current session when possible.

### CI/CD Integration

Use `--format json --exit-code` in CI/CD pipelines to gate deployments on epistemic health:

```bash
# Block deployment if NABLA health is degraded
/nabla-status --alerts-only --format json --exit-code || exit 1
```

### Historical Trend Analysis

Periodic `--history` checks reveal long-term trends in epistemic health. A slowly declining provenance coverage score, for example, might indicate that new features are being added without proper belief provenance tracking.

### Contradiction Monitoring

The contradiction preservation axiom is the most counterintuitive but among the most valuable. When the system reports contradictions, resist the urge to resolve them by deleting one side. Instead, investigate the sources, understand why they disagree, and document the resolution.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `AXIOM_HARD_VIOLATION` | Hard axiom violated, platform integrity at risk | Investigate immediately; see violation details |
| `AXIOM_SOFT_VIOLATION` | Soft axiom below threshold | Address within session; not blocking |
| `TRINITY_GATE_DEGRADED` | Trinity Gate pass rate below threshold | Review recent belief submissions for quality |
| `BELIEF_STORE_OVERFLOW` | Belief store approaching capacity | Archive old beliefs; increase store capacity |
| `STALE_BELIEF_THRESHOLD` | Too many stale beliefs (>5%) | Run belief refresh cycle |
| `PROVENANCE_GAP` | Beliefs without traceable provenance detected | Add provenance for orphaned beliefs |
| `SOURCE_MONOCULTURE` | Excessive reliance on single information source | Diversify information sources |
| `SUBSYSTEM_UNREACHABLE` | One or more subsystems failed to respond | Check subsystem health; restart if necessary |

## Advanced Usage

### Custom Axiom Thresholds

Override default compliance thresholds for specific operational contexts:

```bash
# Relaxed thresholds for exploratory analysis
/nabla-status --threshold 0.60 --context exploration

# Strict thresholds for production deployment
/nabla-status --threshold 0.99 --context production
```

### Belief Network Visualization

Export the belief network graph for visual inspection:

```bash
/nabla-status --export-graph ./belief-network.dot --format dot
```

### Automated Remediation

Enable automated remediation for common violations:

```bash
# Auto-refresh stale beliefs and re-evaluate source diversity
/nabla-status --auto-remediate --dry-run
```

### Cross-Session Tracking

Compare epistemic health across sessions:

```bash
/nabla-status --compare-session "2026-01-28" --format markdown
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Hard axiom violations block all downstream operations.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The status report provides evidence for every health assessment claim.

The `/nabla-status` command is itself a direct expression of the NO DOUBTS principle: it exists to ensure the platform maintains constant awareness of its own epistemic limitations and strengths.

## Related Commands

- [/trinity](@/commands/trinity.md) - Trinity system status and rigidity score verification
- [/trinity-3nl-fusion](@/commands/trinity-3nl-fusion.md) - Validate input through Trinity-3NL fusion pipeline
- [/lean](@/commands/lean.md) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/formal-verify](@/commands/formal-verify.md) - Formal verification of system properties and invariants
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)