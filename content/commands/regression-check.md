+++
title = "/regression-check"
weight = 290
[extra]
category = "Quality"
description = "Execute 25 custom Credo regression checks preventing 700+ violations"
syntax = "/regression-check [options]"
authority = "REGRESSION PREVENTION"
agent = "regression-guard"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1317
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["regression-check", "Execute", "Credo", "commands", "Quality", "Prismatic Platform", "Check"]
tags = ["commands", "quality", "regression-check", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/regression-check - Prismatic Platform"
+++

## Overview

**/regression-check** is a production command in the **Quality** category of the Prismatic Platform that executes 25 custom [Credo](@/glossary/credo.md) regression checks specifically designed to prevent the reintroduction of over 700 previously eliminated quality violations. This command represents the platform's active defense against quality regression, ensuring that patterns, anti-patterns, and violations that were eliminated through deliberate quality improvement campaigns cannot silently return to the codebase.

The 25 custom Credo checks were developed through the platform's quality evolution from a starting point of 700+ violations to the current state of zero violations across all 13 quality domains. Each check encodes the specific pattern that caused a category of violations, enabling automatic detection if that pattern reappears. Unlike generic linting rules, these checks are calibrated to the Prismatic Platform's specific architectural conventions, OTP patterns, and quality standards.

The regression guard operates as a mandatory quality gate in the development workflow. It runs automatically during pre-commit hooks, CI/CD pipelines, and on-demand via this command. No code can be committed, merged, or deployed without passing all 25 regression checks. This enforcement is absolute under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine and cannot be bypassed through any mechanism, including `--no-verify` flags (which are explicitly forbidden by platform policy).

This command operates under the **REGRESSION PREVENTION** authority level and is executed by the `regression-guard` agent, a specialized quality agent with blocking authority over all commit and merge operations. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The regression check system is built on a layered architecture that separates check definition, execution, and enforcement concerns.

```
Custom Credo Checks (25)
    |
    v
[Check Categories]
    +---> CASCADE Patterns (Type Mismatch, Dead Code, Empty Check,
    |                       Timer Replacement, Nuclear Cache)
    +---> Safety Patterns (Unsafe Map Access, Process.sleep,
    |                      String.to_integer, Atom creation)
    +---> Convention Patterns (Naming, @impl, @spec, DateTime)
    +---> Performance Patterns (length() > 0, N+1 queries)
    |
    v
[Execution Engine]
    +---> Parallel file scanning (Git Trees optimized)
    +---> AST-level pattern matching
    +---> Confidence scoring per finding
    |
    v
[Enforcement Layer]
    +---> Pre-commit hook integration
    +---> CI/CD pipeline gate
    +---> Quality Floor Guardian alerts
    |
    v
Pass/Fail with detailed violation report
```

Each custom check implements the Credo check behavior and operates on the Elixir AST (Abstract Syntax Tree) for precise pattern detection. This AST-level analysis avoids false positives from string matching and correctly handles macro expansions, pattern matching, and other Elixir-specific constructs.

## Usage

```bash
# Execute all 25 regression checks
/regression-check

# Execute checks against specific application
/regression-check --app=prismatic_perimeter

# Execute specific check category
/regression-check --category=cascade

# Execute with verbose output showing all scanned files
/regression-check --verbose

# Execute with JSON output for CI integration
/regression-check --format=json

# Execute checks against recent changes only
/regression-check --changed-only

# Execute with fix suggestions
/regression-check --suggest-fixes

# List all 25 checks with descriptions
/regression-check --list

# Execute single check by name
/regression-check --check=UnsafeMapAccess

# Execute with timing analysis per check
/regression-check --timing
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | all | Target specific umbrella application |
| `--category` | enum | all | Check category: `cascade`, `safety`, `convention`, `performance` |
| `--verbose` | boolean | false | Show all scanned files and check details |
| `--format` | enum | text | Output format: `text`, `json`, `junit` |
| `--changed-only` | boolean | false | Only check files modified since last commit |
| `--suggest-fixes` | boolean | false | Include fix suggestions for violations |
| `--list` | boolean | false | List all checks with descriptions |
| `--check` | string | - | Execute a specific check by name |
| `--timing` | boolean | false | Show execution time per check |
| `--strict` | boolean | true | Treat warnings as errors (always true in CI) |
| `--parallel` | integer | auto | Number of parallel check execution threads |
| `--baseline` | string | - | Compare against a baseline commit |
| `--exclude` | string | - | Comma-separated list of files or apps to exclude |

## The 25 Custom Regression Checks

The regression check suite comprises 25 custom Credo checks organized into four categories.

### CASCADE Pattern Checks

| Check | Violations Prevented | Description |
|-------|---------------------|-------------|
| TypeMismatchCheck | 89 | Detects type mismatches in function calls and pattern matches |
| DeadCodeCheck | 156 | Identifies unreachable code paths and unused functions |
| EmptyCheckCheck | 67 | Finds empty function clauses and redundant guard checks |
| TimerReplacementCheck | 23 | Enforces Process timer patterns over Process.sleep |
| NuclearCacheCheck | 12 | Prevents unsafe ETS cache patterns that cause data races |

### Safety Pattern Checks

| Check | Violations Prevented | Description |
|-------|---------------------|-------------|
| UnsafeMapAccessCheck | 78 | Blocks `map.field` syntax in favor of `Map.get/3` |
| ProcessSleepCheck | 34 | Prevents Process.sleep in production code |
| UnsafeAtomCreationCheck | 45 | Blocks String.to_atom and dynamic atom creation |
| UnsafeIntegerParseCheck | 19 | Enforces safe integer parsing over String.to_integer |
| NilAccessCheck | 42 | Detects patterns that can result in nil access errors |
| MemorySafetyCheck | 28 | Identifies unbounded data structures and memory leaks |

### Convention Pattern Checks

| Check | Violations Prevented | Description |
|-------|---------------------|-------------|
| NamingConventionCheck | 31 | Enforces prohibition of Manager/Handler/Utils naming |
| ImplCoverageCheck | 15 | Ensures @impl annotations on all callback implementations |
| SpecCoverageCheck | 22 | Enforces @spec on all public functions |
| DateTimePrecisionCheck | 8 | Mandates consistent DateTime precision across the platform |
| DocumentationCheck | 18 | Ensures @doc on all public modules and functions |
| ModuleStructureCheck | 11 | Validates module attribute ordering conventions |

### Performance Pattern Checks

| Check | Violations Prevented | Description |
|-------|---------------------|-------------|
| LengthComparisonCheck | 37 | Replaces `length(list) > 0` with `list != []` |
| NPlusOneCheck | 14 | Detects N+1 query patterns in Ecto operations |
| EagerLoadingCheck | 9 | Identifies missing preload optimizations |
| UnboundedQueryCheck | 7 | Prevents queries without LIMIT clauses |
| RedundantEnumCheck | 16 | Detects chained Enum operations that can be combined |
| PipelineEfficiencyCheck | 8 | Identifies inefficient pipeline constructions |
| CompileTimeCheck | 4 | Detects runtime operations that should be compile-time |
| TailCallCheck | 6 | Identifies recursive functions missing tail-call optimization |

## Execution Flow

The regression check execution follows an optimized flow designed for speed without sacrificing thoroughness.

**Step 1 - Scope Resolution**: The target files are determined based on the provided options. Full-scope execution scans all `.ex` files in the umbrella. Scoped execution (`--app` or `--changed-only`) filters to the relevant subset.

**Step 2 - File Loading**: Target files are loaded using the Git Trees optimized file discovery, which provides approximately 100x faster file enumeration compared to conventional filesystem scanning.

**Step 3 - Parallel Check Execution**: The 25 checks execute in parallel across the target files. Each check parses the file's AST and applies its pattern matching rules. The parallel execution leverages all available CPU cores for maximum throughput.

**Step 4 - Result Aggregation**: Results from all checks are aggregated into a unified report. Violations are grouped by file, check, and severity for clear presentation.

**Step 5 - Enforcement Decision**: If any violations are detected, the command returns a non-zero exit code, blocking the associated operation (commit, merge, or deploy). The violation report includes file paths, line numbers, check names, and fix suggestions when available.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `regression-guard` | Blocking authority over commits and merges |
| [Credo](@/glossary/credo.md) | Check framework | Custom checks extend Credo's check behavior |
| [Quality Gates](@/glossary/quality-gates.md) | Direct enforcement | Regression checks are a mandatory quality gate |
| Pre-commit hooks | Automatic execution | `.githooks/pre-commit` includes regression checks |
| [/quality-gates](@/commands/quality-gates.md) | Parent command | Quality gates include regression checks as a sub-gate |
| [/refactor](@/commands/refactor.md) | Post-refactoring validation | Regression checks verify refactoring safety |
| [Telemetry](@/glossary/telemetry.md) | Execution metrics | Check timings and violation counts tracked |
| Quality Floor Guardian | Alert integration | Violations trigger guardian alerts |

## Best Practices

Run regression checks locally before pushing to remote. While the CI/CD pipeline enforces regression checks as a blocking gate, discovering violations locally is faster and provides a better development experience than waiting for CI feedback.

Use `--changed-only` during iterative development to get rapid feedback on just the files you have modified. This mode typically completes in under a second, enabling a tight edit-check loop. Switch to full-scope checking before committing to ensure no transitive effects were missed.

When a regression check identifies a violation, investigate the root cause rather than simply fixing the symptom. If the violation represents a pattern that a developer might naturally produce, consider whether documentation, training, or tooling improvements could prevent the pattern from being written in the first place.

Monitor the `--timing` output periodically to identify checks that are becoming slow as the codebase grows. Check execution time should remain proportional to the number of scanned files, not the total codebase size.

## Error Handling

Regression check errors are reported with maximum detail to enable rapid resolution. Each violation includes the exact file path, line number, column number, check name, severity, and a human-readable explanation of why the pattern is problematic and how to fix it.

```
REGRESSION CHECK REPORT
Status: FAILED (3 violations)

[1/3] apps/prismatic_web/lib/prismatic_web/live/dashboard.ex:42
  Check: UnsafeMapAccessCheck
  Violation: Direct map field access `user.name` - use Map.get(user, :name) instead
  Fix: Replace `user.name` with `Map.get(user, :name)` or pattern match

[2/3] apps/prismatic_perimeter/lib/scanner.ex:89
  Check: ProcessSleepCheck
  Violation: Process.sleep(1000) detected in production code
  Fix: Use Process.send_after/3 or :timer.send_interval/2

[3/3] apps/prismatic_agents/lib/registry.ex:156
  Check: LengthComparisonCheck
  Violation: length(agents) > 0 - use agents != [] for O(1) check
  Fix: Replace `length(agents) > 0` with `agents != []`

Result: BLOCKED - 3 violations must be fixed before commit
```

## Advanced Usage

Advanced regression check operations support custom check development, baseline comparisons, and integration with the formal verification pipeline.

```bash
# Create regression check from a specific bug fix
/regression-check --create-from-fix --commit=abc123 --name=NewPatternCheck

# Compare violation counts between branches
/regression-check --baseline=main --compare

# Generate regression check coverage report
/regression-check --coverage-report --format=markdown

# Run checks with experimental new check (not yet enforced)
/regression-check --experimental=NewCustomCheck --warn-only
```

The `--create-from-fix` option automates the creation of new regression checks from bug fix commits. It analyzes the diff to extract the problematic pattern, generates a Credo check implementation, and adds it to the regression suite. This ensures that the mandatory regression test protocol extends beyond individual tests to platform-wide pattern prevention.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every regression check must pass. There is no mechanism to suppress, skip, or downgrade a violation. The REGRESSION PREVENTION authority level grants the regression-guard agent blocking power over all code integration paths.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Each custom check was developed from empirical evidence of actual violations in the codebase. The check descriptions and fix suggestions are grounded in documented patterns, not theoretical concerns.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/benchmark](@/commands/benchmark.md) - Comprehensive performance benchmarking with P95/P99 analysis
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)