+++
title = "/cascade"
weight = 310
[extra]
category = "Quality"
description = "Execute CASCADE pattern fix for systematic anti-pattern removal"
syntax = "/cascade [options]"
authority = "L3"
agent = "cascade-eliminator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1114
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cascade", "Execute", "commands", "Quality", "Prismatic Platform", "The CASCADE", "High", "Critical"]
tags = ["commands", "quality", "cascade", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/cascade - Prismatic Platform"
+++

## Overview

**/cascade** is a production command in the **Quality** category of the Prismatic Platform that executes systematic [CASCADE pattern](@/glossary/cascade-pattern.md) fixes for anti-pattern removal across the entire codebase. CASCADE -- an acronym representing Concentrated Anti-pattern Strike with Cascading Automated Detection and Elimination -- provides a surgical, file-by-file approach to quality debt that targets high-concentration violation hotspots for maximum production impact with zero regression risk.

Unlike traditional linting or static analysis tools that merely report violations, the `/cascade` command operates as a complete elimination pipeline: it detects anti-patterns, plans strike sequences, executes fixes with rollback safety, verifies compilation integrity, and generates comprehensive impact reports. The command has been battle-tested through real ARCHER SUPREME missions, where a single session eliminated 88 unsafe map access violations from 8 production-critical files with zero regressions.

This command operates under the **L3** authority level and is executed by the `cascade-eliminator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The CASCADE system covers 13 quality domains with 40 pattern definitions stored in a structured PatternDB, enabling detection of everything from unsafe atom creation to stale TODO comments.

The CASCADE approach represents a fundamental shift from reactive quality maintenance to proactive, systematic elimination. By focusing on files with the highest concentration of violations, each strike maximizes the ratio of quality improvement per unit of developer effort, delivering measurable production stability improvements.

## Architecture

The CASCADE system is built on three core components that work together to deliver zero-regression quality improvement.

### PatternDB

The PatternDB contains 40 anti-pattern definitions across 13 quality domains. Each pattern includes a detection regex, severity classification, confidence score, and an automated fix template. Patterns are organized by domain for targeted scanning.

### Scanner

The Scanner traverses specified scopes using `git ls-tree` for performance-optimized file discovery. It applies PatternDB patterns against each file, calculates violation concentrations, and ranks files by elimination priority. The scanner operates in read-only mode and never modifies source files.

### Fixer

The Fixer applies automated transformations based on PatternDB fix templates. Every fix is followed by mandatory compilation verification (`mix compile --warnings-as-errors`), test execution, and quality gate validation. If any safety check fails, the fixer automatically rolls back using `git checkout HEAD`.

```
PatternDB (40 patterns)
    |
    v
Scanner ──> Violation Report ──> Priority Ranking
    |                                    |
    v                                    v
Fixer ──> Apply Fix ──> Safety Verify ──> Commit or Rollback
```

## 13 Quality Domains

| Domain | ID | Patterns | Severity | Example Violations |
|--------|-----|----------|----------|--------------------|
| Dialyzer | D1 | 4 | High-Critical | Type mismatches, conflicting specs |
| Credo | D2 | 5 | Low-Medium | Code style, complexity |
| Compilation | D3 | 5 | Low-Critical | Unused variables, unreachable code |
| DateTime | D4 | 1 | Medium | Precision issues in timestamps |
| Guards | D5 | 4 | High | Invalid guard expressions |
| @impl | D6 | 4 | Low | Missing @impl annotations |
| Memory | D7 | 2 | Critical | String.to_atom, unbounded atom creation |
| Performance | D8 | 6 | Medium-High | O(n) patterns, unnecessary traversals |
| Regression | D9 | 1 | Critical | Breaking interface changes |
| Timing | D10 | 1 | High | Process.sleep in production code |
| TODO | D11 | 1 | Low | Stale TODO/FIXME comments |
| Typespec | D12 | 4 | Low-Medium | Missing @spec, vague term() types |
| Map Access | D13 | 2 | Medium-High | Unsafe bracket access on maps |

## Usage

### Basic Operations

```bash
# Scan entire codebase for quality violations
/cascade detect

# Scan with summary output only
/cascade detect --summary

# Focus on critical violations with high confidence
/cascade detect --critical --min-confidence 0.90

# Target specific pattern type
/cascade detect --pattern unsafe_map_access --scope apps/prismatic/

# Multi-pattern analysis across all domains
/cascade detect --pattern all --scope apps/ --min-concentration 3
```

### Planning and Execution

```bash
# Generate elimination plan
/cascade plan --scope apps/ --pattern unsafe_map_access

# Preview fixes without applying (dry run)
/cascade fix --dry-run

# Execute fixes with interactive review
/cascade fix --interactive

# Automated fix for high-confidence violations
/cascade fix

# Single file strike with safety verification
/cascade strike apps/prismatic/lib/error_ledger/event.ex --pattern unsafe_map_access --verify-safety
```

### Mix Task Interface

```bash
# Scan using mix task
mix cascade.scan

# Scan with summary
mix cascade.scan --summary

# Critical only with minimum confidence
mix cascade.scan --critical --min-confidence 0.90

# Fix with preview
mix cascade.fix --dry-run

# Install pre-commit hooks
./.githooks/install-cascade-hooks.sh
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `apps/` | Target directory scope for analysis |
| `pattern` | string | `unsafe_map_access` | Pattern type to target or `all` |
| `operation` | string | `detect` | Operation: detect, plan, strike, eliminate, verify, report |
| `safety_level` | string | `zero_tolerance` | Safety: standard, strict, zero_tolerance |
| `min_concentration` | integer | 5 | Minimum violations per file for targeting |
| `verify_safety` | boolean | true | Enforce zero-regression verification |
| `--dry-run` | boolean | false | Preview without applying changes |
| `--interactive` | boolean | false | Interactive fix review mode |
| `--critical` | boolean | false | Critical severity violations only |
| `--min-confidence` | float | 0.0 | Minimum confidence threshold for fixes |

## Execution Flow

The CASCADE command follows a six-phase execution pipeline, each phase gated by safety verification.

```
PHASE 1: DETECTION
    |-- Traverse scope using git ls-tree
    |-- Apply PatternDB patterns to each file
    |-- Calculate violation concentrations
    |-- Rank files by priority (concentration * severity)
    |
PHASE 2: PLANNING
    |-- Generate strike sequence (highest concentration first)
    |-- Estimate duration per file
    |-- Calculate total elimination potential
    |-- Present plan for approval
    |
PHASE 3: STRIKE EXECUTION
    |-- Process files in priority order
    |-- Apply fix template for each violation
    |-- Track changes with git diff
    |-- Log each transformation
    |
PHASE 4: SAFETY VERIFICATION (per file)
    |-- mix compile --warnings-as-errors --force
    |-- mix credo --strict
    |-- mix test (affected modules)
    |-- mix quality.gates
    |
PHASE 5: ROLLBACK OR COMMIT
    |-- If safety fails: git checkout HEAD -- <file>
    |-- If safety passes: stage changes
    |-- Record elimination metrics
    |
PHASE 6: REPORTING
    |-- Generate elimination report
    |-- Calculate production impact score
    |-- Emit telemetry events
    |-- Save to .claude/reports/cascade/
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `cascade-eliminator` agent | Primary execution agent |
| AIAD Registry | Command specification and discovery | Standard AIAD command interface |
| [Quality Gates](@/glossary/quality-gates.md) | Direct quality gate enforcement | Mandatory post-fix verification |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) and event tracking | Real-time progress telemetry |
| Pre-commit Hooks | `.githooks/pre-commit-cascade` | Automated cascade checks before commit |
| CI/CD Pipeline | GitLab CI integration | Merge request quality gating |
| ARCHER SUPREME | Strategic coordination | Can invoke CASCADE for impossible missions |
| Mycelial Propagation | Pattern distribution | CASCADE patterns propagate across domains |

### CI/CD Integration Example

```yaml
cascade_quality_check:
  stage: quality
  script:
    - mix cascade.scan --critical
    - mix cascade.scan --min-concentration 3
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

## Best Practices

1. **Start with Detection**: Always run `/cascade detect` before attempting fixes to understand the scope and distribution of violations across the codebase.

2. **Target High-Concentration Files First**: Files with 8 or more violations yield the best return on effort. Use `--min-concentration 8` to focus on these hotspots.

3. **Use Dry Run Mode**: Before executing fixes on production code, run `/cascade fix --dry-run` to preview all proposed changes without modification risk.

4. **Single Pattern Per Session**: Focus on one pattern type per CASCADE session for cleaner commits and easier review. Mixing patterns in a single session increases cognitive load.

5. **Verify Between Strikes**: The command automatically verifies after each file, but for critical codebases, consider running the full test suite between file groups.

6. **Document Elimination Decisions**: When a fix transforms code structure significantly, add inline comments explaining the safety rationale.

## Error Handling & Troubleshooting

| Error | Cause | Resolution |
|-------|-------|------------|
| `SAFETY VIOLATION - ROLLED BACK` | Fix caused compilation warning or test failure | Review the specific fix, adjust manually |
| `LOW CONFIDENCE` | Pattern match below threshold | Increase confidence with `--min-confidence 0.95` |
| `NO VIOLATIONS FOUND` | Pattern not present in scope | Verify scope path and pattern name |
| `COMPILATION TIMEOUT` | Large codebase compilation during verify | Increase timeout or narrow scope |
| `INSUFFICIENT CONCENTRATION` | File below `min_concentration` threshold | Lower threshold or target different files |

## Advanced Usage

### CASCADE Pattern Library

The five established CASCADE fix patterns cover the most common transformations:

```elixir
# Pattern 1: Simple Map Access
# Before: map["key"]
# After:  Map.get(map, "key")

# Pattern 2: Default Value
# Before: map["key"] || default
# After:  Map.get(map, "key", default)

# Pattern 3: Dual Key Support
# Before: map[:key] or map["key"]
# After:  Map.get(map, :key) with fallback

# Pattern 4: Test Assertions
# Before: assert result["field"] == value
# After:  assert Map.get(result, "field") == value

# Pattern 5: Nested Access
# Before: map["a"]["b"]["c"]
# After:  get_in(map, ["a", "b", "c"])
```

### Batch Elimination Across Domains

```bash
# Eliminate all memory-safety violations platform-wide
/cascade eliminate --pattern string_to_atom --scope apps/ --safety-level zero_tolerance

# Chain multiple pattern eliminations
/cascade eliminate --pattern unsafe_map_access --verify-safety
/cascade eliminate --pattern process_sleep --verify-safety
/cascade eliminate --pattern guard_violations --verify-safety
```

### Historical Results

The CASCADE system has demonstrated measurable impact in production sessions. In the ARCHER SUPREME session of 2025-11-30, the command eliminated 88 violations from 8 production files with zero regressions, directly preventing 88 potential runtime crashes. Total platform quality debt was reduced from 144 to 56 violations (61% reduction) in under 20 minutes.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Detection Speed | ~80ms per 1000 files | Uses git ls-tree optimization |
| Fix Application | ~200ms per violation | Including pattern matching and substitution |
| Safety Verification | ~10-30s per file | Full compile + test cycle |
| Total Session | 15-45 minutes | Depends on violation count and scope |
| Rollback Speed | <1s per file | Instant git checkout recovery |

## Doctrine Compliance

All CASCADE operations operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for quality violations. Every detected anti-pattern is either eliminated or explicitly documented with justification for deferral. No incomplete strikes are accepted.
- **NO DOUBTS**: Full investigation before action. Detection phase provides complete visibility before any fix is applied. Every fix is evidence-validated through compilation and testing.

The CASCADE system enforces the mandatory regression test protocol: every fix must pass safety verification, and any regression triggers automatic rollback with detailed failure analysis.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/darwinize](@/commands/darwinize.md) - Natural selection operation for evolutionary fitness optimization
- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)