+++
title = "/find-lowfruit"
weight = 1210
[extra]
category = "Documentation"
description = "Identify low-hanging fruit improvements across codebase"
syntax = "/find-lowfruit [options]"
authority = "L2+"
agent = "lowfruit-finder"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1240
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["find-lowfruit", "Identify", "commands", "Documentation", "Prismatic Platform", "Findings", "NABLA", "Scanner", "Code Quality"]
tags = ["commands", "documentation", "find-lowfruit", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/find-lowfruit - Prismatic Platform"
+++

## Overview

**/find-lowfruit** is a production command in the **Documentation** category of the Prismatic Platform that systematically identifies low-hanging fruit improvements across the entire codebase. Rather than relying on manual code review or ad-hoc observation, this command applies structured analysis to discover improvements that deliver maximum value with minimal effort -- the proverbial "low-hanging fruit" that accumulates in any large-scale software system.

The command operates under the **L2+** authority level and is executed by the `lowfruit-finder` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The lowfruit-finder agent employs a multi-dimensional scanning approach that evaluates code quality, documentation completeness, test coverage gaps, performance bottlenecks, and architectural debt simultaneously, producing a prioritized list of actionable improvements ranked by effort-to-impact ratio.

In practice, `/find-lowfruit` serves as the entry point for continuous improvement workflows. When a development session begins without a specific objective, or when the platform operator seeks the highest-impact work items, this command provides a data-driven answer. It integrates with the platform's [quality gates](@/glossary/quality-gates.md) infrastructure, [telemetry](@/glossary/telemetry.md) system, and [NABLA](@/glossary/nabla-infinity.md) epistemic framework to ensure that every recommendation is backed by evidence rather than opinion.

The command's philosophy is rooted in the Pareto principle: roughly 80% of improvement value comes from 20% of possible changes. By algorithmically identifying that critical 20%, `/find-lowfruit` accelerates platform evolution while minimizing wasted effort on marginal improvements.

## Architecture

The `/find-lowfruit` command is implemented as a multi-phase scanning pipeline that leverages existing platform infrastructure for analysis.

```
Input (codebase) --> Scanner Pipeline --> Analyzer --> Ranker --> Report
                         |                   |           |
                    Phase Scanners      Evidence     Impact/Effort
                    (6 dimensions)      Collection    Scoring
```

### Scanner Dimensions

| Dimension | Scanner | What It Finds |
|-----------|---------|---------------|
| **Code Quality** | `QualityScanner` | Missing typespecs, Credo violations, anti-patterns |
| **Documentation** | `DocScanner` | Missing `@doc`, incomplete CLAUDE.md, stale comments |
| **Test Coverage** | `CoverageScanner` | Untested modules, missing edge cases, stub tests |
| **Performance** | `PerfScanner` | N+1 queries, missing indexes, inefficient patterns |
| **Architecture** | `ArchScanner` | Circular dependencies, god modules, coupling violations |
| **Security** | `SecScanner` | Unsafe map access, missing input validation, hardcoded values |

Each scanner operates independently, producing a list of `Finding` structs that include the file path, line number, category, estimated effort (in minutes), and projected impact score (0-100). The Ranker then sorts all findings by their impact-to-effort ratio, surfacing the items where a small investment yields the greatest platform improvement.

## Usage

### Basic Usage

```bash
# Scan entire codebase for low-hanging fruit
/find-lowfruit

# Scan specific application
/find-lowfruit --app prismatic_web

# Scan with minimum impact threshold
/find-lowfruit --min-impact 50

# Scan specific dimension only
/find-lowfruit --dimension documentation
```

### Filtered Scanning

```bash
# Find only quick wins (under 30 minutes effort)
/find-lowfruit --max-effort 30

# Focus on a specific umbrella app
/find-lowfruit --app prismatic_perimeter --max-effort 60

# Find improvements in test coverage only
/find-lowfruit --dimension test-coverage --min-impact 30

# Export results as JSON for CI integration
/find-lowfruit --format json --output lowfruit-report.json
```

### Batch Processing

```bash
# Find and automatically fix trivial improvements
/find-lowfruit --auto-fix --max-effort 5

# Generate a session plan from findings
/find-lowfruit --plan --max-items 10

# Compare findings against previous scan
/find-lowfruit --diff --baseline .claude/lowfruit/last-scan.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | all | Target specific umbrella application |
| `--dimension` | string | all | Scanner dimension to use (quality, docs, coverage, perf, arch, security) |
| `--min-impact` | integer | 0 | Minimum impact score threshold (0-100) |
| `--max-effort` | integer | unlimited | Maximum effort in minutes per finding |
| `--max-items` | integer | 50 | Maximum number of findings to report |
| `--format` | string | table | Output format: table, json, markdown |
| `--output` | string | stdout | Write results to file path |
| `--auto-fix` | boolean | false | Automatically apply trivial fixes |
| `--plan` | boolean | false | Generate a structured session plan |
| `--diff` | boolean | false | Compare against previous scan baseline |
| `--baseline` | string | auto | Path to baseline scan for diff comparison |
| `--verbose` | boolean | false | Include detailed reasoning for each finding |

## Execution Flow

The command executes through a well-defined pipeline that ensures comprehensive analysis while maintaining performance on the platform's 6,652+ Elixir source files.

1. **Initialization**: Load scanner configurations, connect to [telemetry](@/glossary/telemetry.md) system, resolve target scope (all apps or specific app).

2. **File Discovery**: Use [git-trees](@/commands/git-trees.md) for high-performance file enumeration (~80ms for 37,000 files), filtering by the specified scope and file types.

3. **Parallel Scanning**: Execute all six dimension scanners concurrently using `Task.async_stream/3`, with each scanner analyzing its respective concern across the target files.

4. **Evidence Collection**: Each scanner produces `Finding` structs with file paths, line numbers, categories, and evidence. Evidence is collected in compliance with [NABLA](@/glossary/nabla-infinity.md) signal plurality requirements.

5. **Impact Scoring**: The Ranker assigns impact scores based on platform-wide heuristics: how many other files depend on the target, how frequently the file is modified, whether it is in a critical path, and the severity of the finding.

6. **Effort Estimation**: Effort is estimated using historical data from previous fix operations, calibrated against the platform's quality DNA records.

7. **Ranking & Filtering**: Findings are sorted by impact-to-effort ratio (descending), then filtered by any user-specified thresholds.

8. **Report Generation**: The final report is rendered in the requested format and emitted to stdout or the specified output file.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `lowfruit-finder` agent with full platform context |
| [Quality Gates](@/glossary/quality-gates.md) | Data Source | Quality gate results feed into the Code Quality scanner |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Emits `[:prismatic, :lowfruit, :scan_complete]` events with finding counts |
| [Git Trees](@/commands/git-trees.md) | File Discovery | Uses git-tree based enumeration for ~100x faster file listing |
| [Quality DNA](@/glossary/quality-dna.md) | Historical Data | References quality DNA records for effort estimation calibration |
| [SEADF](@/glossary/seadf.md) | Evolution Pipeline | Findings feed into the Self-Evolving Autonomous Development Framework |
| [Credo](@/glossary/credo.md) | Static Analysis | Credo check results are consumed by the Code Quality scanner |
| Session Context | Planning | Findings can be written as session context for structured work sessions |

## Best Practices

**Run at session start.** Execute `/find-lowfruit` at the beginning of each development session to identify the highest-value work items. This practice aligns with the platform's Universal Autonomous Evolution Protocol and ensures every session produces measurable improvement.

**Set effort thresholds for time-boxed sessions.** When working within a fixed time window, use `--max-effort` to filter findings to items that can be completed within the available time. A 30-minute session benefits from `--max-effort 15` to leave room for testing and verification.

**Combine with `/fix` for complete workflows.** After identifying a low-hanging fruit item, use [/fix](@/commands/fix.md) to implement the improvement with mandatory regression tests. This ensures that every improvement is verified and protected against future regressions.

**Track improvement velocity.** Use `--diff` mode to compare current findings against previous scans. A decreasing count of findings indicates healthy platform evolution; a steady or increasing count suggests that new code is introducing issues faster than they are being resolved.

**Focus on high-impact dimensions first.** The security and architecture dimensions typically yield the highest-impact findings. Prioritize these over documentation improvements unless documentation gaps are actively causing confusion or errors.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :no_files_found}` | Target app or scope matches no files | Verify the `--app` value matches an existing umbrella application |
| `{:error, :scanner_timeout}` | Individual scanner exceeded time limit | Use `--dimension` to run scanners individually on large codebases |
| `{:error, :baseline_not_found}` | Specified baseline file does not exist | Run a scan without `--diff` first to establish the baseline |
| `{:error, :git_trees_unavailable}` | Git tree index not available | Ensure the repository has a valid git index; run `git status` to verify |
| `{:error, :quality_gates_unreachable}` | Quality gate service not responding | Check that the Prismatic application is running for full analysis |

All errors follow the standard `{:ok, result} | {:error, reason}` pattern mandated by the platform's Elixir best practices policy. Scanner failures are isolated -- a single scanner failure does not prevent other scanners from completing their analysis.

## Advanced Usage

### Custom Scanner Profiles

Operators can define custom scanner profiles that combine specific dimensions with tailored thresholds for recurring use cases:

```bash
# Create a pre-release scan profile
/find-lowfruit --dimension security,performance --min-impact 70 --max-effort 120 --format json

# Create a documentation sprint profile
/find-lowfruit --dimension documentation --min-impact 20 --auto-fix --max-items 100
```

### CI/CD Integration

The command supports non-interactive execution for CI/CD pipelines:

```bash
# Fail CI if high-impact items exceed threshold
/find-lowfruit --format json --min-impact 80 | jq '.count' | xargs -I {} test {} -lt 5
```

### Combining with Evolution Commands

For autonomous platform improvement, chain `/find-lowfruit` with evolution commands:

```bash
# Find, fix, and evolve in a single workflow
/find-lowfruit --max-effort 10 --auto-fix && /genetic-evolve --target quality
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every finding must include actionable evidence; vague suggestions are rejected by the Ranker.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Findings are backed by file paths, line numbers, and measurable impact scores -- never by subjective assessment alone.

The command also enforces [NABLA](@/glossary/nabla-infinity.md) axiom compliance: every finding must satisfy signal plurality (at least two indicators supporting the recommendation) and provenance (traceable to specific source files and analysis methods).

## Related Commands

- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/optimize](@/commands/optimize.md) - Performance optimization with measurement validation
- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/propagate-pattern](@/commands/propagate-pattern.md) - Propagate successful patterns across the ecosystem
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/genetic-evolve](@/commands/genetic-evolve.md) - Genetic evolution targeting spec-coverage, test-coverage and documentation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)