+++
title = "/evolve-enforced"
weight = 510
[extra]
category = "Evolution"
description = "Evolution with mandatory QDP reduction ensuring quality debt decreases"
syntax = "/evolve-enforced [options]"
authority = "P0 ABSOLUTE"
agent = "evolution-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1289
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evolve-enforced", "Evolution", "commands", "Prismatic Platform", "Quality DNA", "Quality"]
tags = ["commands", "evolution", "evolve-enforced", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evolve-enforced - Prismatic Platform"
+++

## Overview

**/evolve-enforced** is a production command in the **Evolution** category of the Prismatic Platform. It implements evolution with mandatory [QDP](@/glossary/qdp.md) (Quality Debt Points) reduction, ensuring that every evolution cycle produces a measurable decrease in quality debt. Unlike the standard [/evolve](@/commands/evolve.md) command which allows evolution cycles to focus on capability expansion without debt reduction, `/evolve-enforced` operates under a hard constraint: the platform's quality debt score must decrease or the cycle is rejected.

Quality debt in the Prismatic Platform is quantified through a comprehensive scoring system spanning 13 quality domains. Each domain contributes debt points based on specific violation types: compilation warnings, missing type specifications, unsafe map access patterns, untested code paths, and deprecated API usage. At its peak, the platform carried over 905 QDP across multiple domains. Through systematic application of `/evolve-enforced`, quality debt has been driven to zero -- a state of complete elimination that the command now actively protects.

The P0 ABSOLUTE authority level reflects the criticality of this command. Quality debt elimination is not optional, not deferrable, and not subject to override by any agent below SUPREME authority. Every session that produces code changes is expected to maintain or improve the quality debt position. Regression -- any increase in QDP -- triggers an immediate L3 rejection with mandatory correction before the session can proceed.

This command is executed by the `evolution-orchestrator` agent and is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The enforced evolution system wraps the standard evolution pipeline with strict quality debt accounting:

```
Session Start --> QDP Baseline Snapshot --> Evolution Cycle --> QDP Measurement
                        |                       |                    |
                   Quality DNA              5-Phase Evolve      Delta Calculator
                        |                       |                    |
                  Current Score            Mutations Applied     Score Comparison
                        \                       |                    /
                         --> Enforcement Gate (QDP_new <= QDP_old) --> Accept/Reject
                                        |
                                  Rejection Handler
                                  (if QDP increased)
```

**QDP Baseline Snapshot**: At the start of every enforced evolution cycle, the current quality debt score is captured from the [Quality DNA](@/glossary/quality-dna.md) persistence layer. This snapshot serves as the floor that the post-evolution score must not exceed.

**Evolution Cycle**: The standard 5-phase evolution pipeline executes: scanning, analysis, mutation, selection, and validation. Mutations include code quality improvements, pattern applications, test additions, and architectural refinements.

**Delta Calculator**: After evolution completes, a new QDP measurement is taken and compared against the baseline. The delta (QDP_new - QDP_old) must be zero or negative. Any positive delta triggers rejection.

**Enforcement Gate**: The binary gate that determines whether the evolution cycle is accepted. This gate is non-negotiable and cannot be overridden by operator command. Only SUPREME authority can temporarily suspend enforcement, and such suspensions are logged and audited.

## Usage

### Standard Enforced Evolution

```bash
# Run enforced evolution cycle
/evolve-enforced

# Run with explicit QDP reduction target
/evolve-enforced --target-reduction=5

# Run with specific domain focus
/evolve-enforced --domain=dialyzer
```

### Monitoring and Reporting

```bash
# Check current QDP status
/evolve-enforced --status

# Show QDP reduction history
/evolve-enforced --history --last=10

# Generate QDP elimination report
/evolve-enforced --report --format=table
```

### Advanced Execution

```bash
# Run with aggressive reduction (all domains)
/evolve-enforced --aggressive --all-domains

# Run with verification pass (double-check QDP after evolution)
/evolve-enforced --verify --verbose

# Dry run showing potential QDP reductions without applying
/evolve-enforced --dry-run --verbose
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target-reduction` | integer | 1 | Minimum QDP points to reduce per cycle |
| `--domain` | string | all | Focus on specific quality domain |
| `--status` | flag | false | Show current QDP status without running evolution |
| `--history` | flag | false | Display QDP reduction history |
| `--last` | integer | 5 | Number of historical entries to display |
| `--aggressive` | flag | false | Target all domains simultaneously |
| `--all-domains` | flag | false | Include all 13 quality domains in scope |
| `--verify` | flag | false | Double-verify QDP after evolution completes |
| `--dry-run` | flag | false | Show potential reductions without applying changes |
| `--report` | flag | false | Generate comprehensive QDP report |
| `--format` | string | text | Output format (text, json, table) |
| `--verbose` | flag | false | Include detailed per-violation breakdown |
| `--cascade` | flag | false | Apply CASCADE pattern elimination (Type Mismatch, Dead Code, etc.) |

## Execution Flow

The `/evolve-enforced` command follows a strict 8-phase execution flow with embedded quality gates:

1. **Baseline Capture**: The current QDP score is captured from Quality DNA. All 13 quality domains are measured independently. The baseline is immutable once captured -- no retroactive adjustment is permitted.

2. **Domain Analysis**: Each quality domain is analyzed for reduction opportunities. The analyzer identifies specific violations, estimates the effort to resolve each, and ranks them by impact-to-effort ratio.

3. **Strategy Selection**: Based on the domain analysis, the evolution orchestrator selects reduction strategies. CASCADE patterns (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) are preferred for their high-impact, low-risk profiles.

4. **Mutation Application**: Selected quality improvements are applied to the codebase. Each mutation is atomic and independently reversible. Mutations include warning elimination, type specification addition, unsafe access pattern replacement, and test coverage expansion.

5. **Compilation Verification**: After mutations, the entire umbrella is compiled with `--warnings-as-errors` to verify that mutations did not introduce new issues. Any compilation failure triggers immediate rollback.

6. **Test Verification**: All affected test suites are executed to verify that mutations did not break existing functionality. Test failures trigger immediate rollback.

7. **QDP Remeasurement**: The quality debt score is remeasured across all domains. The new score is compared against the baseline.

8. **Enforcement Gate**: If QDP_new > QDP_old, the entire evolution cycle is rejected and rolled back. If QDP_new <= QDP_old, the cycle is accepted and the new score is persisted to Quality DNA.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Quality DNA](@/glossary/quality-dna.md) | Persistence | QDP score storage, baseline snapshots, history |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Pre/post evolution gate validation |
| [Evolution Engine](@/glossary/autoevolve.md) | Pipeline | Standard 5-phase evolution cycle |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Evolution-orchestrator agent drives the cycle |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | QDP reduction [metrics](@/glossary/metrics.md) and enforcement events |
| [Credo](@/glossary/credo.md) | Analysis | Static analysis for code quality violations |
| [Dialyzer](@/glossary/dialyzer.md) | Analysis | Type analysis for spec violations |
| Pre-commit Hooks | Enforcement | Commit-time QDP regression prevention |

## Best Practices

**Run enforced evolution at session start**: The session lifecycle protocol mandates `mix autoheal.baseline` at session start. Pair this with `/evolve-enforced --status` to understand the current QDP position before beginning work.

**Focus on one domain at a time**: While `--all-domains` is available, focused domain reduction produces more reliable results. Target the domain with the highest QDP first, achieve zero, then move to the next.

**Use CASCADE patterns for efficient reduction**: The five CASCADE patterns (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) were specifically developed for high-impact QDP reduction. Apply them via `--cascade` for the most efficient debt elimination.

**Never bypass the enforcement gate**: The P0 ABSOLUTE authority level exists for a reason. Quality debt regression is a platform health emergency. If enforcement blocks your evolution cycle, fix the regression rather than seeking override.

**Archive QDP history for trend analysis**: Use `--history` regularly to verify that the platform's QDP trajectory remains at or near zero. Any upward trend should trigger immediate investigation.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `QDP_REGRESSION_DETECTED` | Evolution cycle increased quality debt | Rollback applied automatically; investigate and fix regressions |
| `BASELINE_CAPTURE_FAILED` | Quality DNA not accessible for baseline | Verify Quality DNA files in `.claude/quality-dna/` |
| `CASCADE_PATTERN_CONFLICT` | CASCADE mutation conflicts with existing code | Apply CASCADE patterns individually to isolate conflict |
| `COMPILATION_VERIFICATION_FAILED` | Mutations introduced compilation warnings | Rollback applied; review mutation strategy |
| `TEST_VERIFICATION_FAILED` | Mutations broke existing tests | Rollback applied; add regression tests before retrying |
| `ENFORCEMENT_GATE_TIMEOUT` | QDP remeasurement exceeded timeout | Increase timeout or reduce evolution scope |

## Advanced Usage

### QDP Zero Maintenance

With QDP at zero, the primary function of `/evolve-enforced` shifts from reduction to protection:

```bash
# Verify QDP zero status is maintained
/evolve-enforced --verify-zero

# Run protective evolution (prevent regression only)
/evolve-enforced --protect --no-mutations

# Generate QDP zero certification report
/evolve-enforced --certify --format=json
```

### Integration with CI/CD

```bash
# CI/CD pipeline stage for QDP enforcement
/evolve-enforced --ci-mode --strict --fail-on-regression

# Generate machine-readable QDP report for pipeline consumption
/evolve-enforced --report --format=json --output=qdp-report.json
```

### Cross-Session QDP Tracking

The enforced evolution system persists QDP state across sessions through Quality DNA. Each session contributes to a continuous QDP timeline that spans the platform's entire evolutionary history from Gen 1 (initial state with 905+ QDP) to Gen 18 (0 QDP, perfect quality).

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for quality debt regression. The P0 ABSOLUTE authority level means this enforcement cannot be bypassed, downgraded, or deferred. Quality debt increases are treated as platform health emergencies requiring immediate correction.
- **NO DOUBTS**: Full investigation before declaring QDP reduction. Every claimed reduction is verified through independent measurement. Baseline and post-evolution scores are computed independently and compared deterministically.

The `/evolve-enforced` command is the operational embodiment of the NO MERCY doctrine's "Zero Stubs/Mocks" and "Production-Ready" principles. Every line of code produced through enforced evolution is verified against all 13 quality domains before acceptance.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/evolve-mycelialize](@/commands/evolve-mycelialize.md) - Unified evolution-propagation cycles
- [/evolve-patterns](@/commands/evolve-patterns.md) - Pattern evolution through meta-evolution analysis
- [/evolve-quality-gates](@/commands/evolve-quality-gates.md) - Quality gate evolution for warnings, tests and static analysis
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)