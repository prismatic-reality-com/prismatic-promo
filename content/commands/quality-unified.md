+++
title = "/quality-unified"
weight = 320
[extra]
category = "Quality"
description = "Unified quality command with quick, full, pre-commit and CI modes"
syntax = "/quality-unified [options]"
authority = "L3"
agent = "quality-unified-supreme"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 989
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-unified", "Unified", "commands", "Quality", "Prismatic Platform", "Credo", "Phase", "Compilation"]
tags = ["commands", "quality", "quality-unified", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quality-unified - Prismatic Platform"
+++

## Overview

**/quality-unified** is a production command in the **Quality** category of the Prismatic Platform. It serves as the single entry point for all quality assessment operations, unifying the platform's 13 quality domains under one command with multiple execution modes optimized for different contexts. Instead of remembering and running separate commands for compilation checks, [Credo](/glossary/credo/) analysis, Dialyzer verification, test execution, and pattern verification, developers invoke `/quality-unified` with the appropriate mode and receive a comprehensive quality report.

This command operates under the **L3** authority level and is executed by the `quality-unified-supreme` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The quality-unified-supreme agent coordinates with domain-specific quality agents to execute checks in parallel where possible, minimizing total execution time.

The unified approach eliminates the common problem of partial quality checking. When quality is fragmented across multiple commands, developers tend to run only the checks relevant to their immediate concern, missing cross-domain regressions. `/quality-unified` ensures comprehensive coverage every time, with mode-based optimization to keep execution times practical for each development context.

## Architecture

The unified quality system orchestrates all domain-specific quality tools through a central dispatcher.

### Dispatcher Architecture

```
             /quality-unified
                    |
            Mode Selector
                    |
    +-------+-------+-------+-------+
    |       |       |       |       |
  Quick    Full  Pre-Commit   CI
  Mode     Mode    Mode      Mode
    |       |       |       |
    v       v       v       v
  Domain Dispatcher (parallel execution)
    |
    +---+---+---+---+---+---+---+
    | D | C | G | M | T | P | R |  ... (13 domains)
    +---+---+---+---+---+---+---+
                    |
           Result Aggregator
                    |
           Quality Report
           (Score: 0-100)
```

### Execution Modes

| Mode | Domains Checked | Parallel | Typical Duration | Use Case |
|------|----------------|----------|------------------|----------|
| **Quick** | Compilation, Credo (fast), Critical patterns | Yes | 15-30s | After every file change |
| **Full** | All 13 domains, full depth | Yes | 2-5 min | Before merge request |
| **Pre-Commit** | Compilation, Credo, Patterns, Memory Safety | Yes | 30-60s | Git pre-commit hook |
| **CI** | All 13 domains, performance benchmarks | Yes | 3-8 min | CI/CD pipeline |
| **Custom** | User-selected domains | Configurable | Varies | Specific investigation |

### Domain Execution Order

Domains execute in dependency order to enable early termination:

1. **Compilation** (blocking) -- Must pass before any other check
2. **Parallel Group A**: Credo, Guard Functions, DateTime, Timing, TODO
3. **Parallel Group B**: Dialyzer, Typespec, @impl, Memory Safety
4. **Sequential**: Tests, Performance
5. **Meta**: Quality Score, Quality DNA

If compilation fails, all subsequent groups are skipped and the command reports the compilation failure immediately.

## Usage

```bash
# Quick quality check (default mode)
/quality-unified

# Full comprehensive check
/quality-unified --mode full

# Pre-commit hook mode
/quality-unified --mode pre-commit

# CI pipeline mode
/quality-unified --mode ci

# Quick check for specific app
/quality-unified --app prismatic_web

# Custom domain selection
/quality-unified --domains compilation,credo,dialyzer

# Quality status overview (no checks, just scores)
/quality-unified --status

# Generate quality report
/quality-unified --mode full --report ./quality-report.md

# Auto-fix mode (fix what can be fixed automatically)
/quality-unified --fix

# Verbose with per-file details
/quality-unified --verbose
```

### Practical Examples

```bash
# Quick check after editing a LiveView module
/quality-unified --app prismatic_web --verbose

# Full validation before submitting merge request
/quality-unified --mode full --report ./mr-quality-report.md

# CI pipeline integration with JSON output
/quality-unified --mode ci --format json --exit-code

# Check and auto-fix Credo and typespec issues
/quality-unified --domains credo,typespec --fix

# Compare quality against baseline
/quality-unified --mode full --compare-baseline
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--mode` | `enum` | `quick` | Execution mode: `quick`, `full`, `pre-commit`, `ci`, `custom` |
| `--app` | `string` | all | Specific application to check |
| `--domains` | `string` | mode-dependent | Comma-separated domain list for custom mode |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--verbose` | `flag` | false | Per-file and per-check details |
| `--fix` | `flag` | false | Auto-fix violations where possible |
| `--status` | `flag` | false | Show scores without running checks |
| `--report` | `path` | none | Export quality report |
| `--exit-code` | `flag` | true | Non-zero exit on failure |
| `--compare-baseline` | `flag` | false | Compare against quality baseline |
| `--parallel` | `flag` | true | Enable parallel domain execution |
| `--timeout` | `duration` | mode-dependent | Maximum execution time |
| `--skip-domain` | `string` | none | Skip specific domain (requires justification) |

## Execution Flow

### Phase 1: Mode Resolution

The command resolves the execution mode and determines which domains, parallelism settings, and timeout values to use. Custom mode uses explicitly provided domains; named modes use predefined configurations.

### Phase 2: Prerequisite Checks

Before running quality checks, the system verifies prerequisites:
- Dependencies are compiled
- Required tools are available (Credo, Dialyzer PLTs)
- Sufficient disk space for temporary artifacts

### Phase 3: Domain Dispatch

Domains are dispatched to their respective checking tools. Independent domains run in parallel, while dependent domains wait for prerequisites. Each domain reports its results through a standardized interface.

### Phase 4: Result Collection

As domain checks complete, results are collected and normalized:

| Result Field | Description |
|-------------|-------------|
| `domain` | Quality domain name |
| `status` | PASS, FAIL, WARN, SKIP |
| `violations` | Count of violations found |
| `details` | Per-violation location and description |
| `duration` | Check execution time |
| `fixable` | Count of auto-fixable violations |

### Phase 5: Score Computation

The composite quality score is computed from individual domain scores:

```
Quality Score = sum(domain_weight[i] * domain_score[i]) / sum(domain_weight[i])
```

Each domain has equal weight in the default configuration, resulting in a score from 0 to 100.

### Phase 6: Report Generation

The final report includes: overall score, per-domain scores, violation details, recommended actions, and comparison with baseline (if requested).

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-gates](/commands/quality-gates/) | Delegation | Unified delegates to gate infrastructure |
| [/quality-evolve](/commands/quality-evolve/) | Consumer | Evolution uses unified scores as fitness metrics |
| [/quality-hbfs](/commands/quality-hbfs/) | Peer | HBFS rankings inform unified priority display |
| [/regression-check](/commands/regression-check/) | Component | Regression checks run as part of unified pipeline |
| [/verify-patterns](/commands/verify-patterns/) | Component | Pattern verification is a unified domain |
| [Pre-commit Hook](/glossary/pre-commit-hooks/) | Caller | Hook invokes `--mode pre-commit` |
| [CI/CD Pipeline](/glossary/gitlab-ci/) | Caller | Pipeline invokes `--mode ci` |
| [Telemetry](/glossary/telemetry/) | Monitoring | Quality metrics and execution timing |
| [Quality DNA](/glossary/quality-dna/) | State | Cross-session quality continuity |

## Best Practices

### Mode Selection Guide

Use the right mode for the right context. Running `--mode full` after every file change wastes time; running `--mode quick` before a merge request misses issues.

### Auto-Fix Usage

The `--fix` flag can automatically resolve approximately 60-70% of Credo violations, 40% of typespec gaps, and 80% of formatting issues. Always review auto-fixes before committing, especially for Credo complexity refactors.

### Baseline Comparison

Enable `--compare-baseline` when preparing merge requests. This shows the exact quality delta introduced by your changes, making it easy to verify that you have not introduced regressions.

### Domain Skip Policy

The `--skip-domain` option exists for exceptional circumstances (e.g., a domain checker has a known bug). Every skip requires a text justification that is logged. Skips should be temporary and tracked.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `MODE_INVALID` | Unknown execution mode specified | Use: quick, full, pre-commit, ci, custom |
| `COMPILATION_BLOCKED` | Compilation failed, blocking all checks | Fix compilation errors first |
| `DOMAIN_TIMEOUT` | Individual domain check exceeded timeout | Check for infinite loops or increase timeout |
| `PARALLEL_FAILURE` | Parallel execution crashed | Retry with `--no-parallel`; report bug if consistent |
| `PLT_MISSING` | Dialyzer PLT not built | Run `mix dialyzer --plt` first |
| `QUALITY_REGRESSION` | Score decreased from baseline | Investigate violations introduced by recent changes |

## Advanced Usage

### Quality Trend Reporting

Track quality over time with periodic full checks:

```bash
/quality-unified --mode full --format json --report ./quality/$(date +%Y-%m-%d).json
```

### Integration with Editor

Configure editor integration for real-time quality feedback:

```bash
# Run on file save (editor hook)
/quality-unified --app prismatic_web --domains compilation,credo --timeout 15s
```

### Multi-App Comparison

Compare quality scores across umbrella applications:

```bash
/quality-unified --mode full --per-app --format json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every mode runs its full domain set without shortcuts.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Scores are computed from objective tool outputs, not estimates.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-evolve](/commands/quality-evolve/) - Quality-focused evolution targeting specific quality domains
- [/quality-hbfs](/commands/quality-hbfs/) - Hottest-bug-first search for quality assessment prioritization
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/verify-patterns](/commands/verify-patterns/) - Pattern matching audit for file, module or entire codebase
- [/code](/commands/code/) - Core coding implementation and feature development
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)