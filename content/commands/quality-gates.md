+++
title = "/quality-gates"
weight = 270
[extra]
category = "Quality"
description = "Enforce quality gate checkpoints with zero-warning compilation validation"
syntax = "/quality-gates [options]"
authority = "BLOCKING"
agent = "quality-gate-enforcer"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 784
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-gates", "Enforce", "commands", "Quality", "Prismatic Platform", "Stage", "Credo", "Zero", "Type"]
tags = ["commands", "quality", "quality-gates", "prismatic"]
quality_score = 70
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quality-gates - Prismatic Platform"
+++

## Overview

**/quality-gates** is a production command in the **Quality** category of the Prismatic Platform. It enforces a comprehensive set of quality gate checkpoints that every code change must pass before being accepted into the codebase. The gates cover compilation warnings, [Credo](@/glossary/credo.md) static analysis, Dialyzer type checking, test execution, typespec coverage, memory safety patterns, and 13 total quality domains. The command operates at **BLOCKING** authority level, meaning it can halt commits, merge requests, and deployments when quality standards are not met.

This command is executed by the `quality-gate-enforcer` agent and represents the primary enforcement mechanism of the platform's quality infrastructure. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The BLOCKING authority level is the highest enforcement authority in the quality system, giving this command absolute veto power over any code change that fails to meet standards.

The quality gate system evolved from early compilation checks into a comprehensive 13-domain quality enforcement framework. Each domain has specific metrics, thresholds, and detection rules. The platform currently maintains a 100/100 quality score with zero violations across all domains, a state achieved through systematic application of quality gates over hundreds of evolution cycles.

## Architecture

The quality gate system operates as a multi-stage checkpoint pipeline where each stage must pass before the next begins.

### Gate Pipeline Architecture

```
              /quality-gates
                    |
           Gate Configuration
                    |
    +-------+-------+-------+-------+
    |       |       |       |       |
  Stage 1  Stage 2  Stage 3  Stage 4
  Compile  Static   Dynamic  Meta
    |       |       |       |
  Warnings Credo   Tests   Quality
  Dialyzer Pattern  Cover   Score
  Types    Safety   Perf    DNA
    |       |       |       |
    +-------+-------+-------+
                    |
           Gate Verdict
           (PASS/FAIL)
                    |
         +----+----+----+
         |    |         |
       Allow  Block   Report
```

### Quality Domains (13 Total)

| Domain | Gate Stage | Check Type | Current Status |
|--------|-----------|------------|----------------|
| **Compilation** | Stage 1 | Zero warnings (`--warnings-as-errors`) | 0 violations |
| **Dialyzer** | Stage 1 | Type consistency analysis | 0 violations |
| **Credo** | Stage 2 | Static code analysis (`--strict`) | 0 violations |
| **Guard Functions** | Stage 2 | Guard clause presence on public functions | 0 violations |
| **Memory Safety** | Stage 2 | Unsafe map access, nil handling | 0 violations |
| **Typespec Coverage** | Stage 2 | `@spec` annotation completeness | 0 violations |
| **`@impl` Coverage** | Stage 2 | Callback implementation annotations | 0 violations (709 total) |
| **DateTime Precision** | Stage 2 | Microsecond precision enforcement | 0 violations |
| **Timing Patterns** | Stage 2 | `Process.sleep` and timer anti-patterns | 0 violations |
| **TODO Management** | Stage 2 | TODO/FIXME tracking and lifecycle | 0 violations |
| **Performance** | Stage 3 | Page load (<250ms), render (<100ms) | 0 violations |
| **Regression Prevention** | Stage 3 | 25 custom Credo checks | 0 violations |
| **Quality Score** | Stage 4 | Composite 100-point score | 100/100 |

## Usage

```bash
# Run all quality gates (standard mode)
/quality-gates

# Run quick gates only (compilation + critical checks)
/quality-gates --quick

# Run full gates including performance benchmarks
/quality-gates --full

# Run gates for specific application
/quality-gates --app prismatic_web

# Run specific gate stage only
/quality-gates --stage 2

# Run gates with detailed output
/quality-gates --verbose

# Run gates in CI mode (optimized for pipelines)
/quality-gates --ci

# Pre-commit gate check (fastest)
/quality-gates --pre-commit

# Show gate configuration without running
/quality-gates --show-config

# Run gates and export report
/quality-gates --report ./gate-report.json
```

### Practical Examples

```bash
# Pre-commit quick validation
/quality-gates --pre-commit --app prismatic_perimeter

# Full validation before merge request
/quality-gates --full --verbose --report ./mr-quality.json

# CI/CD pipeline gate (exits non-zero on failure)
/quality-gates --ci --exit-code

# Check specific quality domain
/quality-gates --domain dialyzer --verbose

# Validate after refactoring
/quality-gates --full --app prismatic_api --verbose
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--quick` | `flag` | false | Run only Stage 1 gates (fastest) |
| `--full` | `flag` | false | Run all stages including performance |
| `--pre-commit` | `flag` | false | Optimized for pre-commit hook usage |
| `--ci` | `flag` | false | CI/CD pipeline optimized mode |
| `--app` | `string` | all | Specific application to gate |
| `--stage` | `integer` | all | Run specific gate stage (1-4) |
| `--domain` | `string` | all | Check specific quality domain |
| `--verbose` | `flag` | false | Detailed output per check |
| `--exit-code` | `flag` | true | Return non-zero on failure |
| `--report` | `path` | none | Export gate report to file |
| `--show-config` | `flag` | false | Display gate configuration |
| `--fix` | `flag` | false | Auto-fix violations where possible |
| `--parallel` | `flag` | true | Run independent checks in parallel |
| `--timeout` | `duration` | `300s` | Maximum total execution time |

## Execution Flow

### Stage 1: Compilation Gates

The first stage verifies that the codebase compiles cleanly:

1. **Zero-Warning Compilation** -- `mix compile --warnings-as-errors --force` must produce zero warnings
2. **Dialyzer Analysis** -- Type specifications are verified against actual function implementations
3. **Dependency Check** -- All dependencies are present and compatible

Stage 1 failures block all subsequent stages. Compilation must be clean before any further analysis.

### Stage 2: Static Analysis Gates

The second stage performs comprehensive static analysis:

1. **Credo Strict** -- `mix credo --strict` checks code style, readability, and complexity
2. **Pattern Verification** -- 25 custom Credo checks prevent regression of 700+ previously eliminated violations
3. **Memory Safety** -- Detects unsafe map access (`map.key` without guard), nil propagation risks
4. **Typespec Coverage** -- Ensures public functions have `@spec` annotations
5. **Guard Functions** -- Verifies guard clauses on public function heads
6. **`@impl` Annotations** -- Confirms callback implementations are annotated
7. **DateTime Precision** -- Enforces microsecond precision in all timestamp operations
8. **Timing Patterns** -- Detects `Process.sleep` usage and timer anti-patterns
9. **TODO Management** -- Tracks and enforces TODO lifecycle rules

### Stage 3: Dynamic Analysis Gates

The third stage runs tests and performance benchmarks:

1. **Test Suite** -- `mix test` with full coverage reporting
2. **Performance Checks** -- Page load times, render times, health check response times
3. **Regression Tests** -- Dedicated regression test suite for previously fixed bugs

### Stage 4: Meta-Quality Gates

The fourth stage evaluates overall quality health:

1. **Quality Score** -- Composite score across all 13 domains must be >= 100
2. **Quality DNA** -- Cross-session quality continuity verification
3. **Quality Floor** -- Guardian checks that quality has not regressed below floor

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-unified](@/commands/quality-unified.md) | Peer | Unified quality interface delegates to gates |
| [/quality-evolve](@/commands/quality-evolve.md) | Consumer | Evolution validated through gates |
| [/quality-hbfs](@/commands/quality-hbfs.md) | Peer | HBFS prioritization informs gate focus |
| [/quality-enforce](@/commands/quality-enforce.md) | Peer | Enforcement policies drive gate thresholds |
| [/regression-check](@/commands/regression-check.md) | Component | Regression checks are a gate stage 2 component |
| [Pre-commit Hook](@/glossary/pre-commit-hooks.md) | Caller | Git pre-commit invokes `--pre-commit` mode |
| [CI/CD Pipeline](@/glossary/gitlab-ci.md) | Caller | GitLab CI invokes `--ci` mode |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Gate execution metrics and trends |

## Best Practices

### Gate Mode Selection

Choose the appropriate gate mode for your context:

| Context | Recommended Mode | Typical Duration |
|---------|-----------------|------------------|
| Every file save | `--pre-commit --quick` | 10-30s |
| Before commit | `--pre-commit` | 30-60s |
| Before merge request | `--full` | 2-5 min |
| CI/CD pipeline | `--ci --full` | 3-8 min |
| After major refactor | `--full --verbose` | 5-10 min |

### Handling Gate Failures

When gates fail, the output identifies the specific domain, violation location, and suggested fix. Address violations in priority order:

1. Stage 1 failures (compilation) -- Must fix first; blocks everything
2. Stage 2 critical (memory safety, regression) -- High risk if ignored
3. Stage 2 standard (Credo, typespecs) -- Code quality
4. Stage 3 (tests, performance) -- Runtime behavior
5. Stage 4 (meta-quality) -- Systemic health

### Continuous Gate Compliance

Maintain continuous gate compliance rather than batch-fixing before merges. Running `--pre-commit --quick` after every significant change catches violations early when they are cheapest to fix.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `GATE_BLOCKED` | One or more gates failed, code change blocked | Fix violations shown in output |
| `COMPILATION_WARNING` | Zero-warning policy violated | Fix or suppress the specific warning |
| `DIALYZER_MISMATCH` | Type specification inconsistency | Correct `@spec` to match implementation |
| `CREDO_VIOLATION` | Static analysis rule violated | Follow Credo suggestion in output |
| `TEST_FAILURE` | One or more tests failed | Fix failing tests before proceeding |
| `PERFORMANCE_VIOLATION` | Page load or render time exceeded limit | Optimize slow paths; see profiling data |
| `QUALITY_REGRESSION` | Quality score decreased from baseline | Investigate which domain regressed |
| `TIMEOUT` | Gate execution exceeded time limit | Increase `--timeout` or narrow scope with `--app` |

## Advanced Usage

### Custom Gate Profiles

Create named gate profiles for different scenarios:

```bash
# Use a custom profile for experimental branches
/quality-gates --profile experimental  # Relaxed thresholds
/quality-gates --profile production    # Strictest thresholds
```

### Selective Domain Override

Temporarily exempt specific domains (with documented justification):

```bash
# Skip Dialyzer for rapid prototyping (requires L3+ authority)
/quality-gates --skip-domain dialyzer --reason "prototyping phase, will add types before merge"
```

### Gate Trend Analysis

Analyze quality gate results over time:

```bash
/quality-gates --history 30d --format json --report ./gate-trends.json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Gate failures are absolute: no code passes through a failed gate.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every gate verdict includes specific evidence for the pass/fail decision.

## Related Commands

- [/quality-unified](@/commands/quality-unified.md) - Unified quality command with quick, full, pre-commit and CI modes
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/quality-hbfs](@/commands/quality-hbfs.md) - Hottest-bug-first search for quality assessment prioritization
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/verify-patterns](@/commands/verify-patterns.md) - Pattern matching audit for file, module or entire codebase
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)