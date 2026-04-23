+++
title = "/evolve-quality-gates"
weight = 540
[extra]
category = "Evolution"
description = "Quality gate evolution for warnings, tests and static analysis"
syntax = "/evolve-quality-gates [options]"
authority = "L3"
agent = "evolution-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1340
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evolve-quality-gates", "Quality", "commands", "Evolution", "Prismatic Platform", "Gate", "Credo", "Dialyzer"]
tags = ["commands", "evolution", "evolve-quality-gates", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evolve-quality-gates - Prismatic Platform"
+++

## Overview

**/evolve-quality-gates** is a production command in the **Evolution** category of the Prismatic Platform. It drives the evolution of quality gate specifications for compilation warnings, test coverage, and static analysis standards. While the standard [/quality-gates](@/commands/quality-gates.md) command enforces existing gate thresholds, `/evolve-quality-gates` evolves the thresholds themselves, progressively tightening quality standards as the platform matures.

Quality gates in the Prismatic Platform are not static checkpoints. They are living specifications that adapt to the platform's evolving capabilities. When the platform first established quality gates, the thresholds reflected the existing codebase state -- tolerating a certain number of warnings, a certain level of test coverage, and a certain number of [Credo](@/glossary/credo.md) violations. As the codebase improved through systematic quality debt elimination, the gates tightened correspondingly: from "fewer than 50 warnings" to "fewer than 10" to the current absolute standard of zero warnings, zero Credo violations, and zero [Dialyzer](@/glossary/dialyzer.md) errors.

The `/evolve-quality-gates` command automates this progressive tightening process. It analyzes current gate pass rates across all quality domains, identifies domains where the platform consistently exceeds the current threshold by a significant margin, and proposes tighter thresholds that maintain the challenging-but-achievable balance. Gates that are too easy become meaningless; gates that are too hard block legitimate development. The evolution system finds the optimal tension point.

This command operates under the **L3** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The quality gate evolution system operates through a feedback loop between gate specifications and gate pass metrics:

```
Current Gate Specs --> Pass Rate Analyzer --> Evolution Candidate Generator
        |                    |                          |
   13 Quality Domains   Historical Pass Rates    Proposed New Thresholds
        |                    |                          |
   Threshold Values     Margin Analysis           Feasibility Check
        \                    |                          /
         --> Gate Evolution Evaluator --> Approval Gate --> Updated Specs
                      |
               Risk Assessor
               (regression probability)
```

**Pass Rate Analyzer**: Examines the historical pass rates for each quality gate across recent evolution cycles and commit histories. A gate that passes 100% of the time with wide margin is a candidate for tightening. A gate that fails intermittently is not a candidate and may actually need relaxation.

**Evolution Candidate Generator**: Proposes new threshold values for gates identified as evolution candidates. The generator uses a conservative tightening strategy -- reducing tolerance by 10-20% per evolution cycle rather than jumping to absolute zero, unless the current state already supports it.

**Gate Evolution Evaluator**: Validates proposed threshold changes against the current codebase state. For each proposed tightening, the evaluator simulates the new gate against the current codebase to verify that it would pass. Proposals that would cause immediate failure are rejected.

**Risk Assessor**: Evaluates the probability that a proposed gate tightening would cause regressions in normal development. Factors include the frequency of the violation type, the difficulty of fixing violations, and the likelihood that new code would introduce violations at the tightened threshold.

## Usage

### Standard Gate Evolution

```bash
# Run quality gate evolution cycle
/evolve-quality-gates

# Analyze evolution opportunities without applying
/evolve-quality-gates --analyze-only

# Evolve gates for specific domains
/evolve-quality-gates --domains=dialyzer,credo,compilation
```

### Threshold Management

```bash
# Show current gate thresholds across all domains
/evolve-quality-gates --show-thresholds

# Show evolution history for a specific gate
/evolve-quality-gates --history --domain=compilation

# Compare current vs proposed thresholds
/evolve-quality-gates --propose --format=table
```

### Advanced Evolution

```bash
# Aggressive evolution (tighten all eligible gates)
/evolve-quality-gates --aggressive

# Conservative evolution (only tighten gates with 100% pass rate)
/evolve-quality-gates --conservative --min-pass-rate=1.0

# Simulate gate evolution impact on recent commits
/evolve-quality-gates --simulate --commits=50

# Generate gate evolution report
/evolve-quality-gates --report --format=markdown --verbose
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--analyze-only` | flag | false | Analyze evolution opportunities without applying |
| `--domains` | string | all | Comma-separated quality domains to evolve |
| `--show-thresholds` | flag | false | Display current gate thresholds |
| `--history` | flag | false | Show gate evolution history |
| `--domain` | string | all | Specific domain for history/analysis |
| `--propose` | flag | false | Propose threshold changes without applying |
| `--aggressive` | flag | false | Tighten all eligible gates in one cycle |
| `--conservative` | flag | false | Only tighten gates with perfect pass rates |
| `--min-pass-rate` | float | 0.95 | Minimum pass rate for gate evolution eligibility |
| `--simulate` | flag | false | Simulate evolution impact on recent history |
| `--commits` | integer | 20 | Number of recent commits for simulation |
| `--report` | flag | false | Generate comprehensive evolution report |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--verbose` | flag | false | Include detailed per-gate analysis |
| `--tightening-rate` | float | 0.15 | Maximum threshold tightening per cycle (fraction) |
| `--rollback` | flag | false | Roll back last gate evolution if causing issues |

## Execution Flow

The `/evolve-quality-gates` command follows a structured 7-phase pipeline:

1. **Gate Inventory**: All 13 quality domain gates are enumerated with their current threshold specifications: zero-warning compilation, zero Credo violations, zero Dialyzer errors, complete type spec coverage, zero unsafe map access, and so on.

2. **Pass Rate Analysis**: Historical pass rates are computed for each gate across the last N evolution cycles and commits. Gates with 100% pass rate and wide margin (current state far exceeds the threshold) are flagged as evolution candidates.

3. **Candidate Generation**: For each candidate gate, a proposed tighter threshold is generated. The tightening rate is bounded by the `--tightening-rate` parameter to prevent overly aggressive evolution.

4. **Feasibility Simulation**: Each proposed threshold is simulated against the current codebase and recent commit history. The simulation verifies that the tightened gate would pass in the current state and estimates the probability of false failures in normal development.

5. **Risk Assessment**: The risk assessor evaluates each proposed tightening for regression potential. Gates protecting against common violation types (e.g., missing type specs in new code) receive higher risk scores than gates protecting against rare violation types.

6. **Approval Gate**: Proposed evolutions that pass feasibility simulation and risk assessment are approved. The approval gate requires that the tightened threshold would have passed in at least 95% of recent commits (configurable via `--min-pass-rate`).

7. **Threshold Update**: Approved threshold changes are applied to the gate specifications and persisted. The previous thresholds are archived for rollback capability.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Quality Gates](@/glossary/quality-gates.md) | Target | Gate specifications that are evolved |
| [Quality DNA](@/glossary/quality-dna.md) | Persistence | Gate threshold history and rollback data |
| [Credo](@/glossary/credo.md) | Analysis | Credo gate thresholds and violation counts |
| [Dialyzer](@/glossary/dialyzer.md) | Analysis | Dialyzer gate thresholds and type errors |
| [Evolution Engine](@/glossary/autoevolve.md) | Framework | Meta-evolution of quality standards |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Evolution-orchestrator drives gate evolution |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Gate evolution [metrics](@/glossary/metrics.md) and pass rate tracking |
| Pre-commit Hooks | Enforcement | Evolved gates enforced at commit time |
| CI/CD Pipeline | Enforcement | Evolved gates enforced in CI/CD stages |

## Best Practices

**Evolve gates after sustained quality improvement**: Gate evolution should follow demonstrated capability, not aspiration. Only tighten gates when the platform has consistently exceeded the current threshold over multiple cycles.

**Use conservative mode for production environments**: In production-facing environments, use `--conservative --min-pass-rate=1.0` to ensure that only gates with perfect historical pass rates are tightened. This eliminates false failure risk.

**Simulate before applying**: Always use `--simulate` with a representative commit sample before applying gate evolutions. This reveals whether the tightened gates would have caused legitimate development friction.

**Maintain rollback capability**: Gate evolutions can be rolled back with `--rollback`. Always verify that the previous threshold is archived before applying a new one.

**Evolve incrementally across domains**: Tightening multiple gates simultaneously increases the risk of compound failures. Evolve one or two domains per cycle and verify stability before proceeding.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `GATE_ALREADY_AT_ABSOLUTE` | Gate threshold is already at zero (absolute strictness) | No evolution possible; gate is at maximum strictness |
| `FEASIBILITY_SIMULATION_FAILED` | Proposed threshold would fail on current codebase | Reduce tightening rate or fix existing violations first |
| `ROLLBACK_DATA_MISSING` | Previous threshold data not available for rollback | Check Quality DNA persistence for archived thresholds |
| `PASS_RATE_INSUFFICIENT` | Gate pass rate below minimum for evolution eligibility | Improve code quality to achieve required pass rate |
| `CONCURRENT_EVOLUTION_CONFLICT` | Another gate evolution cycle is running | Wait for concurrent cycle to complete |

## Advanced Usage

### Gate Specification Export

```bash
# Export current gate specifications for external tools
/evolve-quality-gates --export-specs --format=json --output=gates.json

# Import gate specifications from another environment
/evolve-quality-gates --import-specs --file=gates.json --validate
```

### Cross-Application Gate Analysis

```bash
# Analyze gate pass rates per umbrella application
/evolve-quality-gates --per-app-analysis --format=table

# Identify applications blocking gate evolution
/evolve-quality-gates --blocking-apps --verbose
```

### Gate Evolution as CI/CD Stage

```bash
# CI/CD stage: verify gate evolutions are safe for current branch
/evolve-quality-gates --ci-check --branch=feature/new-module --fail-on-regression
```

The gate evolution system is designed to run as a periodic background process, gradually tightening quality standards as the platform improves. Over 18 generations, this progressive tightening has driven the Prismatic Platform from tolerant initial thresholds to absolute zero-tolerance standards across all 13 quality domains.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Quality gates only evolve in one direction -- tighter. Relaxation of gates is treated as a regression and requires SUPREME authority approval with explicit justification. The system enforces a ratchet effect: once a threshold is tightened, it becomes the new floor.
- **NO DOUBTS**: Gate evolution decisions are backed by comprehensive pass rate analysis and feasibility simulation. No threshold is tightened without statistical evidence that the platform can sustain the new standard.

Gate evolution is the mechanism by which the NO MERCY doctrine becomes progressively more demanding over time, ensuring that the platform's quality standards continuously rise to match its growing capabilities.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/evolve-enforced](@/commands/evolve-enforced.md) - Evolution with mandatory QDP reduction
- [/evolve-mycelialize](@/commands/evolve-mycelialize.md) - Unified evolution-propagation cycles
- [/evolve-patterns](@/commands/evolve-patterns.md) - Pattern evolution through meta-evolution analysis
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)