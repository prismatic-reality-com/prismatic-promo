+++
title = "/mycelialize-enforced"
weight = 520
[extra]
category = "Evolution"
description = "Mycelial operations with mandatory QDP reduction enforcement"
syntax = "/mycelialize-enforced [options]"
authority = "P0 ABSOLUTE"
agent = "mycelial-network-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1519
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mycelialize-enforced", "Mycelial", "commands", "Evolution", "Prismatic Platform", "Quality", "Pattern"]
tags = ["commands", "evolution", "mycelialize-enforced", "prismatic"]
quality_score = 90
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mycelialize-enforced - Prismatic Platform"
+++

## Overview

**/mycelialize-enforced** is a production command in the **Evolution** category of the Prismatic Platform that executes mycelial pattern propagation operations with mandatory Quality Debt Point ([QDP](@/glossary/qdp.md)) reduction enforcement. While the standard [/mycelialize](@/commands/mycelialize.md) command propagates patterns across the codebase using biologically-inspired network algorithms, the enforced variant adds a non-bypassable requirement that every mycelial operation must simultaneously reduce the platform's quality debt. This coupling of pattern propagation with quality improvement ensures that the platform's codebase becomes healthier with every evolution cycle.

This command operates under the **P0 ABSOLUTE** authority level and is executed by the `mycelial-network-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The P0 ABSOLUTE authority level is the highest enforcement priority in the platform, meaning that QDP reduction requirements cannot be overridden, bypassed, or deferred under any circumstances.

The mycelial metaphor comes from the biological mycelium networks that connect plants in forests, enabling nutrient transfer and communication across vast distances. In the Prismatic Platform, mycelial operations propagate proven patterns -- code structures, architectural decisions, quality improvements -- from one part of the codebase to all other applicable locations. When a pattern is proven effective in one umbrella application, mycelial propagation identifies all locations across the 90+ umbrella apps where that pattern could be applied and executes the transformation.

The enforced variant adds QDP reduction as a hard constraint. Before any pattern propagation begins, the system must identify and eliminate a minimum number of quality debt points. After propagation completes, the system verifies that the net quality debt has decreased. If quality debt increases for any reason during propagation (for example, if a propagated pattern introduces new warnings), the entire operation is rolled back. This enforcement loop ensures that the platform's quality trajectory is monotonically improving.

## Architecture

The enforced mycelial system operates as a dual-objective optimization engine that simultaneously propagates patterns and eliminates quality debt.

### Enforcement Architecture

```
/mycelialize-enforced -> QDP Scanner -> Pattern Propagator -> Quality Verifier
                              |                |                     |
                              v                v                     v
                        Debt Catalog     Mycelial Network      Pre/Post Check
                        Debt Priority    Pattern Matching      Compilation
                        Debt Eliminator  Transformation        Credo Check
                        Quota Tracker    Propagation Engine    Warning Count
                                                               Rollback Guard
```

### QDP Enforcement Model

| Phase | Action | Enforcement | Rollback |
|-------|--------|-------------|----------|
| **Pre-Scan** | Identify current QDP count | Count must be > 0 or no debt remains | N/A |
| **QDP Elimination** | Fix identified quality debt | Minimum quota must be met | Partial work reverted |
| **Pattern Propagation** | Propagate patterns across apps | Quality must not decrease | Full propagation reverted |
| **Post-Verification** | Verify net quality improvement | QDP count must decrease | Entire operation reverted |

### Quality Debt Categories

| Category | Priority | Examples | Detection Method |
|----------|----------|---------|------------------|
| **Compilation Warnings** | P0 | Unused variables, deprecated calls | `mix compile --warnings-as-errors` |
| **Credo Violations** | P1 | Style violations, complexity | `mix credo --strict` |
| **Missing Typespecs** | P2 | Public functions without `@spec` | Custom Credo check |
| **Unsafe Patterns** | P0 | Unsafe atom creation, nil access | Custom regression checks |
| **Dead Code** | P2 | Unused functions, unreachable clauses | Dialyzer + custom analysis |
| **TODO/FIXME** | P3 | Deferred work markers | Pattern matching scan |
| **Missing Tests** | P1 | Untested public functions | Coverage analysis |
| **Missing Docs** | P2 | Undocumented public functions | `@doc false` audit |

### Mycelial Network Topology

| Layer | Function | Speed | Coverage |
|-------|----------|-------|----------|
| **Spore Layer** | Pattern discovery and classification | < 1 second | Single module |
| **Hypha Layer** | Pattern matching across applications | 1-5 seconds | Single umbrella app |
| **Mycelium Layer** | Cross-application pattern propagation | 5-30 seconds | All umbrella apps |
| **Fruiting Layer** | Emergence detection and reporting | 1-5 seconds | Platform-wide |

## Usage

```bash
# Run enforced mycelial propagation with default quota
/mycelialize-enforced

# Run with specific QDP quota
/mycelialize-enforced --qdp-quota=10

# Run targeting specific quality category
/mycelialize-enforced --qdp-category=compilation-warnings

# Run targeting specific application
/mycelialize-enforced --app=prismatic_web

# Run targeting all applications
/mycelialize-enforced --app=all --qdp-quota=5

# Dry run to preview changes
/mycelialize-enforced --dry-run

# Run with specific pattern focus
/mycelialize-enforced --pattern="type-safety" --qdp-quota=5

# Run with cascade detection
/mycelialize-enforced --detect-cascades --cascade-threshold=3

# Run with verbose output
/mycelialize-enforced --verbose

# Export propagation report
/mycelialize-enforced --report --output=mycelial-report.md

# Run in CI mode (exit code reflects success/failure)
/mycelialize-enforced --ci --qdp-quota=3

# Run with maximum parallelism
/mycelialize-enforced --parallel=auto

# View propagation history
/mycelialize-enforced --history --period=7d

# View current QDP inventory
/mycelialize-enforced --inventory
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--qdp-quota` | integer | 3 | Minimum QDP reduction per execution |
| `--qdp-category` | string | auto | QDP category focus: compilation-warnings, credo, typespecs, unsafe-patterns, dead-code, todo, tests, docs |
| `--app` | string | auto | Target application or "all" |
| `--pattern` | string | auto | Pattern to propagate: type-safety, error-handling, supervision, testing, documentation |
| `--dry-run` | flag | false | Preview changes without executing |
| `--detect-cascades` | flag | true | Detect cascade improvement patterns |
| `--cascade-threshold` | integer | 3 | Minimum instances for cascade classification |
| `--verbose` | flag | false | Detailed output including per-file changes |
| `--report` | flag | false | Generate propagation report |
| `--output` | string | stdout | Report output path |
| `--ci` | flag | false | CI mode with exit codes |
| `--parallel` | integer | 4 | Parallel processing threads |
| `--history` | flag | false | View propagation history |
| `--period` | string | 30d | History period |
| `--inventory` | flag | false | Show current QDP inventory |
| `--rollback` | flag | false | Rollback last propagation |
| `--force-category` | string | none | Force specific QDP category elimination |
| `--max-files` | integer | 50 | Maximum files modified per execution |

## Execution Flow

1. **Quality Baseline Capture**: The current quality state is captured as a baseline. This includes compilation warning count, Credo violation count, typespec coverage, test coverage, and all other quality domain metrics. The baseline serves as the reference for post-execution verification.

2. **QDP Inventory Analysis**: The system scans the codebase to identify current quality debt points. QDP items are categorized, prioritized, and ranked by estimated fix difficulty and cross-application applicability.

3. **QDP Selection**: Based on the configured quota and category focus, the system selects specific QDP items to eliminate. Selection prioritizes items that are (a) quick to fix, (b) applicable across multiple applications (cascade potential), and (c) in the highest priority categories.

4. **QDP Elimination**: Selected QDP items are eliminated through automated code transformations. Compilation warnings are fixed by removing unused variables, updating deprecated function calls, and adding missing clauses. Credo violations are fixed by applying style corrections. Missing typespecs are added using inferred types from Dialyzer.

5. **Elimination Verification**: After QDP elimination, the affected code is compiled and checked to verify that fixes are correct and do not introduce new issues. If any fix introduces a new warning or error, it is reverted individually.

6. **Pattern Discovery**: The mycelial network scans the codebase for pattern propagation opportunities. Patterns successfully applied in one application are matched against all other applications for potential propagation.

7. **Pattern Propagation**: Identified patterns are propagated to matching locations across the codebase. Each propagation is a discrete, reversible transformation. Propagations are applied in dependency order to prevent intermediate compilation failures.

8. **Cascade Detection**: If `--detect-cascades` is enabled, the system identifies patterns that were propagated to three or more applications. These cascade patterns represent systematic improvements that have wide applicability and are recorded in the pattern library for future reference.

9. **Post-Verification**: After all changes are complete, the full quality baseline is recaptured. The post-execution quality metrics are compared against the pre-execution baseline. If net QDP count has not decreased by at least the configured quota, the entire operation is rolled back.

10. **Report Generation**: A propagation report is generated documenting all changes made, QDP items eliminated, patterns propagated, cascades detected, and net quality improvement achieved.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `mycelial-network-coordinator` | Orchestrates propagation and enforcement |
| [/mycelialize](@/commands/mycelialize.md) | Standard variant | Non-enforced pattern propagation |
| [/mycelialize-formal](@/commands/mycelialize-formal.md) | Formal variant | Lean4-verified propagation |
| [/evolve](@/commands/evolve.md) | Evolution system | Broader ecosystem evolution |
| [/quality-gates](@/commands/quality-gates.md) | Quality verification | Pre/post quality gate checking |
| [/quality-enforce](@/commands/quality-enforce.md) | QDP tracking | Quality debt inventory |
| [/regression-check](@/commands/regression-check.md) | Regression prevention | Ensures no regressions from propagation |
| [Quality Gates](@/glossary/quality-gates.md) | Gate enforcement | Quality criteria validation |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Propagation speed, QDP elimination rate |
| [SEADF](@/glossary/seadf.md) | Evolution framework | Mycelial system within SEADF ecosystem |

## Best Practices

**Run enforced mycelialize at least once per session.** The platform's mandatory session discipline requires continuous quality improvement. Running `/mycelialize-enforced` at least once per session ensures that quality debt never accumulates across sessions.

**Start with small QDP quotas.** A quota of 3-5 QDP per execution is manageable and sustainable. Large quotas risk introducing too many changes at once, making rollback more disruptive if post-verification fails.

**Use dry-run before production execution.** The `--dry-run` flag shows exactly what changes would be made without executing them. Review the dry-run output to verify that proposed changes are appropriate before committing.

**Focus on cascade patterns.** Patterns that propagate to 3+ applications (cascades) represent the highest-value improvements. Use `--detect-cascades` to identify these patterns and prioritize them for propagation.

**Monitor the QDP inventory trend.** Use `--inventory` to track the remaining QDP count over time. The trend should be monotonically decreasing. Any increase indicates that new quality debt is being introduced faster than it is being eliminated.

**Commit after each successful execution.** Each successful mycelialize-enforced run represents a verified quality improvement. Commit immediately to lock in the improvement and prevent drift.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `qdp_quota_not_met` | Could not eliminate enough QDP items | Increase target scope or reduce quota |
| `quality_regression` | Post-execution quality lower than baseline | Automatic rollback, investigate cause |
| `compilation_failed` | Propagated pattern caused compilation error | Automatic rollback of affected propagation |
| `credo_regression` | New Credo violations introduced | Automatic rollback, adjust transformation |
| `no_patterns_found` | No propagation opportunities identified | Normal -- all patterns already propagated |
| `rollback_failed` | Could not restore pre-execution state | Manual intervention required, check git status |
| `max_files_exceeded` | Changes would affect too many files | Reduce scope or increase `--max-files` |
| `zero_qdp_remaining` | No quality debt to eliminate | Success -- platform at zero debt |

## Advanced Usage

### Targeted Cascade Elimination

Focus on eliminating specific pattern categories across the entire codebase.

```bash
# Eliminate all unsafe map access patterns
/mycelialize-enforced --pattern="safe-map-access" --app=all --qdp-category=unsafe-patterns

# Eliminate all missing @impl annotations
/mycelialize-enforced --pattern="impl-coverage" --app=all --qdp-category=typespecs

# Propagate error handling patterns
/mycelialize-enforced --pattern="error-handling" --app=all --cascade-threshold=5
```

### CI/CD Integration

Integrate enforced mycelial operations into the build pipeline.

```bash
# CI gate: require QDP reduction before merge
/mycelialize-enforced --ci --qdp-quota=1 --app=changed-apps

# Pre-commit quality improvement
/mycelialize-enforced --ci --qdp-quota=3 --max-files=10 --app=auto
```

### Historical Analysis

Analyze mycelial propagation effectiveness over time.

```bash
# View propagation history
/mycelialize-enforced --history --period=30d --format=json

# View cascade detection history
/mycelialize-enforced --history --cascades-only --period=90d

# QDP elimination rate over time
/mycelialize-enforced --history --metric=qdp-rate --period=90d
```

### Custom Pattern Definition

Define custom patterns for organization-specific propagation.

```bash
# Register custom pattern
/mycelialize-enforced --register-pattern --name="custom-telemetry" \
  --source-app=prismatic_telemetry --source-module=TelemetryEmitter \
  --pattern-type=structural

# Propagate custom pattern
/mycelialize-enforced --pattern="custom-telemetry" --app=all --qdp-quota=3
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The enforced variant is the doctrine made operational -- quality debt must decrease with every execution. No bypass, no exceptions, no deferrals. If quality regresses, the entire operation is rolled back.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every QDP elimination is verified through compilation and static analysis. Every pattern propagation is validated through quality gates. Results include complete before/after metrics.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)