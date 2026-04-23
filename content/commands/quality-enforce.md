+++
title = "/quality-enforce"
weight = 280
[extra]
category = "Quality"
description = "Mandatory progressive quality debt elimination with AIAD enforcement"
syntax = "/quality-enforce [options]"
authority = "P0 ABSOLUTE"
agent = "quality-enforcement-commander"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1082
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-enforce", "Mandatory", "AIAD", "commands", "Quality", "Prismatic Platform", "ABSOLUTE", "Domain"]
tags = ["commands", "quality", "quality-enforce", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quality-enforce - Prismatic Platform"
+++

## Overview

**/quality-enforce** is a production command in the **Quality** category of the Prismatic Platform that implements mandatory progressive [quality debt](/glossary/quality-debt/) elimination with [AIAD](/glossary/aiad/) enforcement. This is the platform's highest-authority quality command, operating at **P0 ABSOLUTE** -- a non-bypassable enforcement level that ensures every session, every commit, and every deployment contributes to maintaining the platform's quality score at 100/100 across all 13 quality domains.

The command scans the codebase for quality violations across all monitored domains, classifies them by severity and remediation cost, generates fix plans, and optionally auto-fixes violations that have safe, deterministic corrections. It operates on the fundamental platform principle that quality debt compounds exponentially -- a single tolerated violation creates precedent for more, eventually undermining the entire quality infrastructure. The platform's journey from an initial quality score to the current perfect 100/100 was driven primarily by this command's relentless enforcement.

This command operates under the **P0 ABSOLUTE** authority level and is executed by the `quality-enforcement-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard. The P0 ABSOLUTE authority means this command can block commits, reject deployments, and escalate violations to the highest platform authority levels without exception.

Quality enforcement is not a one-time activity -- it is woven into every phase of the development lifecycle. The command integrates with pre-commit hooks, CI/CD pipelines, session lifecycle events, and the autonomous evolution system to ensure that quality never regresses, even as the codebase grows. The current platform state of zero quality debt across 6,600+ Elixir source files is maintained through continuous enforcement by this command.

## Architecture

The quality enforcement system operates through a layered architecture of scanners, classifiers, and enforcers.

```
Quality Enforcement Command
         |
         v
+-------------------+
| Domain Scanner    |
| (13 domains)      |
+-------------------+
         |
         v
+-------------------+
| Violation         |
| Classifier        |
+-------------------+
         |
    +----+----+
    |         |
    v         v
+--------+ +--------+
| Auto   | | Manual |
| Fixer  | | Report |
+--------+ +--------+
    |         |
    v         v
+-------------------+
| Enforcement Gate  |
| (BLOCKING)        |
+-------------------+
```

### Quality Domains (13 Monitored)

| Domain | Scanner | Current Status |
|--------|---------|----------------|
| **Dialyzer** | Static type analysis | 0 violations |
| **Credo** | Code style and consistency | 0 violations |
| **Compilation** | Zero-warning compilation | 0 violations |
| **DateTime Precision** | Timestamp handling correctness | 0 violations |
| **Guard Functions** | Proper guard clause usage | 0 violations |
| **@impl Coverage** | Callback implementation annotations | 0 violations (709 annotations) |
| **Memory Safety** | Unsafe memory access patterns | 0 violations |
| **Performance** | Anti-pattern detection | 0 violations |
| **Regression Prevention** | Known-bad pattern detection | 0 violations |
| **Timing Patterns** | `Process.sleep` and timing anti-patterns | 0 violations |
| **TODO Management** | Stale TODO/FIXME tracking | 0 violations |
| **Typespec Coverage** | `@spec` annotation completeness | 0 violations |
| **Unsafe Map Access** | `map.field` vs `Map.get/2` patterns | 0 violations |

## Usage

### Comprehensive Enforcement

```bash
# Run full quality enforcement across all domains
/quality-enforce

# Run with auto-fix for safe violations
/quality-enforce --fix

# Run specific domain only
/quality-enforce --domain dialyzer

# Run for specific application
/quality-enforce --app prismatic_perimeter
```

### Progressive Elimination

```bash
# Show violations ordered by remediation cost (easiest first)
/quality-enforce --progressive

# Fix the N easiest violations
/quality-enforce --fix --limit 10

# Show the quality debt reduction plan
/quality-enforce --plan

# Execute the next planned elimination step
/quality-enforce --step
```

### CI/CD Integration

```bash
# Blocking check with exit code (0 = pass, 1 = fail)
/quality-enforce --check --exit-code

# JSON output for CI reporting
/quality-enforce --check --format json

# Check only changed files (fast)
/quality-enforce --changed-only

# Pre-commit mode (minimal, fast)
/quality-enforce --pre-commit
```

### Reporting

```bash
# Generate quality report
/quality-enforce --report

# Show quality trend over time
/quality-enforce --trend --window 30d

# Export violation details for tracking
/quality-enforce --export violations.json

# Show per-app quality scores
/quality-enforce --scores
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--fix` | `boolean` | `false` | Auto-fix safe violations |
| `--domain` | `string` | `all` | Specific quality domain to check |
| `--app` | `string` | `all` | Specific umbrella application to check |
| `--progressive` | `boolean` | `false` | Order violations by remediation cost |
| `--limit` | `integer` | `nil` | Maximum violations to fix in one run |
| `--plan` | `boolean` | `false` | Show the quality debt elimination plan |
| `--step` | `boolean` | `false` | Execute the next planned elimination step |
| `--check` | `boolean` | `false` | Check-only mode (no modifications) |
| `--exit-code` | `boolean` | `false` | Set exit code based on result |
| `--changed-only` | `boolean` | `false` | Check only files changed since last commit |
| `--pre-commit` | `boolean` | `false` | Fast pre-commit mode |
| `--report` | `boolean` | `false` | Generate quality report |
| `--trend` | `boolean` | `false` | Show quality trend over time |
| `--window` | `string` | `7d` | Time window for trend analysis |
| `--format` | `json \| text \| table` | `text` | Output format |
| `--scores` | `boolean` | `false` | Show per-app quality scores |
| `--verbose` | `boolean` | `false` | Detailed violation descriptions |

## Execution Flow

1. **Domain Initialization** -- All 13 quality domain scanners are initialized. Each scanner loads its configuration, including patterns to detect, severity levels, and auto-fix capabilities.

2. **File Discovery** -- The target file set is determined based on scope options (`--app`, `--changed-only`, `--domain`). Git tree optimization is used for fast file enumeration.

3. **Parallel Scanning** -- Domain scanners execute in parallel across the file set. Each scanner produces a list of violations with location, severity, description, and (where available) an auto-fix transformation.

4. **Violation Classification** -- Violations are classified by severity (critical, warning, info) and remediation cost (trivial, easy, moderate, complex). Critical violations from BLOCKING domains halt the pipeline.

5. **Auto-Fix Application** -- If `--fix` is enabled, violations with safe auto-fixes are applied. Each fix is validated by recompiling and running affected tests. Fixes that cause regressions are rolled back.

6. **Report Generation** -- A summary report is generated showing violations found, violations fixed, remaining violations, and quality score impact.

7. **Gate Enforcement** -- If violations remain and the command is running in `--check` or `--pre-commit` mode, the enforcement gate blocks the operation with a non-zero exit code.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [Quality Gates](/glossary/quality-gates/) | Direct quality gate enforcement | Gate authority |
| [Pre-commit Hooks](/glossary/pre-commit-hooks/) | Pre-commit quality validation | Commit blocking |
| CI/CD Pipeline | Quality check in deployment pipeline | Deployment blocking |
| [Quality DNA](/glossary/quality-dna/) | Quality state persistence across sessions | State tracking |
| [Quality Floor Guardian](/glossary/quality-floor-guardian/) | Autonomous quality monitoring | Monitoring |
| [SEADF](/glossary/seadf/) | Quality evolution tracking | Evolution |
| [Telemetry](/glossary/telemetry/) | Enforcement metrics and events | Observability |
| [Credo](/glossary/credo/) | Code style domain scanner | Domain input |
| [Dialyzer](/glossary/dialyzer/) | Type analysis domain scanner | Domain input |

## Best Practices

1. **Run before every commit** -- The pre-commit hook should invoke `/quality-enforce --pre-commit` automatically. This catches violations before they enter the repository.

2. **Fix progressively** -- When inheriting a codebase with quality debt, use `--progressive --fix --limit 10` to fix the easiest violations first, building momentum before tackling complex ones.

3. **Never bypass** -- The P0 ABSOLUTE authority means there is no legitimate reason to bypass quality enforcement. If a violation cannot be fixed, the approach needs to change, not the enforcement.

4. **Monitor trends** -- Use `--trend` weekly to ensure quality scores remain stable or improving. Any downward trend indicates enforcement gaps.

5. **Per-app focus** -- Use `--app` to focus enforcement on applications being actively developed. This provides faster feedback during development cycles.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :compilation_required}` | Codebase needs compilation before scanning | Run `mix compile` first |
| `{:error, :fix_regression}` | Auto-fix caused test failure | Fix is rolled back; manual intervention needed |
| `{:error, :domain_scanner_failed, domain}` | A domain scanner crashed | Check scanner configuration and dependencies |
| `{:error, :quality_gate_failed}` | Violations remain after enforcement | Fix remaining violations before proceeding |

## Advanced Usage

### CASCADE Pattern Detection

The enforcer detects CASCADE patterns -- categories of violations that tend to appear together and can be eliminated as a group:

```bash
# Detect and fix CASCADE patterns
/quality-enforce --cascade

# Known CASCADE patterns:
# - Type Mismatch (Dialyzer + Typespec)
# - Dead Code (Compilation warnings + Credo)
# - Empty Check (Guard Functions + Unsafe Map Access)
# - Timer Replacement (Timing Patterns + Performance)
# - Nuclear Cache (corrupted build artifacts)
```

### Quality DNA Integration

```elixir
# Check quality DNA state for an application
{:ok, dna} = QualityDNA.load("prismatic_perimeter")
# => %{score: 60, domains: %{dialyzer: 0, credo: 0, ...}}
```

### Custom Domain Registration

```elixir
# Register a custom quality domain
QualityEnforcement.register_domain(:custom_check, %{
  scanner: MyApp.CustomScanner,
  severity: :warning,
  auto_fixable: true,
  blocking: false
})
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. This command IS the NO MERCY doctrine in action. Every violation is detected, classified, and either fixed or blocked. No exceptions, no bypass, no deferred fixes.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every violation is reported with its exact location, root cause, and remediation path. Auto-fixes are validated by compilation and tests before acceptance.

The command enforces [NABLA](/glossary/nabla-infinity/) axioms through its multi-domain scanning approach (Signal Plurality), its refusal to suppress any violation category (Contradiction Preservation), and its traceability of every fix to its originating violation (Provenance Mandatory).

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-unified](/commands/quality-unified/) - Unified quality command with quick, full, pre-commit and CI modes
- [/quality-hbfs](/commands/quality-hbfs/) - Hottest-bug-first search for quality assessment prioritization
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/benchmark](/commands/benchmark/) - Comprehensive performance benchmarking with P95/P99 analysis
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)