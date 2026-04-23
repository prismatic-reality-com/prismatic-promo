+++
title = "/leon"
weight = 1950
[extra]
category = "Maintenance"
description = "Scout, hit, clean, protect and status operations for codebase maintenance"
syntax = "/leon [options]"
authority = "L2+"
agent = "leon-cleaner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1172
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["leon", "Scout", "commands", "Maintenance", "Prismatic Platform", "Protection"]
tags = ["commands", "maintenance", "leon", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/leon - Prismatic Platform"
+++

## Overview

**/leon** is a production command in the **Maintenance** category of the Prismatic Platform that provides comprehensive codebase maintenance through five operational modes: **scout**, **hit**, **clean**, **protect**, and **status**. Named after the cinematic archetype of a methodical professional, this command approaches code maintenance with the same precision and thoroughness -- identifying targets, eliminating problems, cleaning residual artifacts, and protecting against recurrence.

Codebase maintenance in a platform with 99 umbrella applications and 2.8 million lines of code is not an occasional activity but a continuous discipline. Technical debt, dead code, stale dependencies, orphaned configuration, and accumulated artifacts degrade platform health if left unaddressed. The `/leon` command automates the detection, analysis, and remediation of these maintenance concerns through a structured operational workflow.

This command operates under the **L2+** authority level and is executed by the `leon-cleaner` agent, a specialist maintenance agent with deep knowledge of Elixir project structures, OTP conventions, and the Prismatic Platform's specific organizational patterns. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The leon-cleaner agent maintains an evolving knowledge base of maintenance patterns derived from the platform's quality history. Each maintenance operation produces structured findings that feed back into the knowledge base, continuously improving detection accuracy and remediation strategies. The agent also tracks maintenance debt over time, providing trend analysis that reveals whether the codebase is improving or degrading.

## Architecture

The maintenance system operates through a pipeline of five operational phases, each building on the previous.

```
+-------------------+     +-------------------+     +-------------------+
| Scout             | --> | Hit               | --> | Clean             |
| (Detect Targets)  |     | (Eliminate Issues) |    | (Remove Artifacts)|
+-------------------+     +-------------------+     +-------------------+
                                                            |
+-------------------+     +-------------------+             v
| Status            | <-- | Protect           | <-- +-------------------+
| (Health Report)   |     | (Guard Against)   |     | Verification      |
+-------------------+     +-------------------+     | (Post-Clean Check)|
                                                     +-------------------+
```

**Scout** scans the codebase for maintenance targets including dead code, unused dependencies, stale configuration, orphaned files, and anti-patterns. **Hit** applies targeted remediation to identified targets, removing dead code, updating dependencies, and fixing anti-patterns. **Clean** removes residual artifacts left by the remediation process, including empty directories, stale compiled artifacts, and orphaned test files. **Protect** installs guards (pre-commit hooks, quality rules, agent monitors) to prevent the same maintenance issues from recurring. **Status** provides a comprehensive health report of the codebase's maintenance posture.

## Usage

### Scout Operations

```bash
# Scout the entire codebase for maintenance targets
/leon scout

# Scout a specific application
/leon scout --app prismatic_web

# Scout for specific target types
/leon scout --type dead-code

# Scout with severity threshold
/leon scout --min-severity medium

# Scout and export findings
/leon scout --format json --output findings.json
```

### Hit Operations

```bash
# Eliminate all identified targets
/leon hit

# Eliminate specific target categories
/leon hit --type dead-code,unused-deps

# Hit with dry-run preview
/leon hit --dry-run

# Hit specific targets by ID from scout results
/leon hit --targets T001,T002,T003

# Hit with automatic backup
/leon hit --backup
```

### Clean Operations

```bash
# Clean residual artifacts after hit operations
/leon clean

# Clean specific artifact types
/leon clean --type compiled,empty-dirs,orphaned-tests

# Clean build artifacts across all apps
/leon clean --build-artifacts

# Deep clean including caches and temporary files
/leon clean --deep

# Clean with size reporting
/leon clean --report-size
```

### Protect Operations

```bash
# Install protection against all scouted categories
/leon protect

# Install specific protections
/leon protect --type dead-code,unused-deps

# Install pre-commit hook protection
/leon protect --hook pre-commit

# Install Credo rule protection
/leon protect --credo-rule

# List active protections
/leon protect --list
```

### Status Operations

```bash
# Show comprehensive maintenance health report
/leon status

# Show status for a specific application
/leon status --app prismatic_perimeter

# Show maintenance trend over time
/leon status --trend --period 30d

# Show status with detailed breakdown
/leon status --detailed

# Export status report
/leon status --format markdown --output maintenance-report.md
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| (subcommand) | string | status | Operation: `scout`, `hit`, `clean`, `protect`, `status` |
| `--app` | string | all | Target specific application |
| `--type` | string | all | Target type: `dead-code`, `unused-deps`, `stale-config`, `orphaned-files`, `anti-patterns`, `compiled`, `empty-dirs` |
| `--min-severity` | string | low | Minimum severity: `low`, `medium`, `high`, `critical` |
| `--dry-run` | boolean | false | Preview operations without applying |
| `--targets` | string | all | Specific target IDs to operate on |
| `--backup` | boolean | false | Create backup before destructive operations |
| `--deep` | boolean | false | Include deep scan/clean of caches and temp files |
| `--hook` | string | - | Git hook type for protection: `pre-commit`, `pre-push` |
| `--credo-rule` | boolean | false | Generate Credo rules for protection |
| `--trend` | boolean | false | Show maintenance trend over time |
| `--period` | string | 7d | Trend analysis period |
| `--detailed` | boolean | false | Show detailed breakdown in status reports |
| `--report-size` | boolean | false | Include size calculations in clean reports |
| `--format` | string | table | Output format: `table`, `json`, `markdown`, `csv` |
| `--output` | string | stdout | Output file for reports |
| `--verbose` | boolean | false | Show detailed operation progress |

## Target Categories

| Category | Detection Method | Severity | Auto-Fix |
|----------|-----------------|----------|----------|
| **dead-code** | AST analysis, call graph traversal | Medium | Yes |
| **unused-deps** | Dependency graph analysis vs actual usage | Low | Yes |
| **stale-config** | Config key usage analysis | Low | Yes (with review) |
| **orphaned-files** | File reference analysis, test coverage mapping | Medium | Yes |
| **anti-patterns** | Pattern matching against known anti-pattern database | High | Partial |
| **empty-modules** | Module content analysis | Low | Yes |
| **stale-docs** | Documentation freshness analysis | Low | No (manual) |
| **oversized-modules** | Line count and complexity analysis | Medium | No (manual) |

## Execution Flow

1. **Phase Selection**: The subcommand determines which operational phase to execute. Phases can be run independently or in sequence (scout -> hit -> clean -> protect).

2. **Scope Resolution**: The `--app` parameter narrows the operational scope. Without it, all 99 umbrella applications are included.

3. **Target Discovery** (scout): The scout engine performs parallel analysis across the codebase, running detectors for each enabled target category. Detection results are deduplicated and severity-classified.

4. **Remediation** (hit): Identified targets are remediated in dependency order -- targets that other code depends on are processed last to prevent cascading failures. Each remediation is applied atomically with automatic rollback on failure.

5. **Cleanup** (clean): Residual artifacts from remediation are removed. This includes empty directories left by deleted files, stale compiled artifacts in `_build/`, and orphaned test files.

6. **Protection** (protect): Guards are installed to prevent recurrence. This includes pre-commit hooks that detect the same patterns, Credo rules that flag violations, and agent monitors that alert on regression.

7. **Reporting** (status): A comprehensive health report is generated showing current maintenance posture, trend analysis, and recommendations for next actions.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Executed by the `leon-cleaner` agent |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Maintenance findings feed quality gate decisions |
| [Telemetry](/glossary/telemetry/) | Observability | Maintenance metrics tracked as platform telemetry |
| [Credo](/glossary/credo/) | Protection | Custom Credo rules generated for protection |
| [AIAD Registry](/glossary/aiad/) | Discovery | Command registered via AIAD standard |
| Git Hooks | Protection | Pre-commit hooks for recurrence prevention |
| Mix Compiler | Analysis | Compilation analysis for dead code detection |
| [ETS](/glossary/ets/) | Storage | Maintenance findings and trend data storage |

## Best Practices

**Run scout regularly.** Weekly scout runs prevent maintenance debt from accumulating. The scout operation is non-destructive and fast, making it suitable for routine execution. Set up a scheduled task or session start hook to automate scouting.

**Review hit operations before executing.** Always use `--dry-run` first to preview what will be changed. While the hit engine is designed for safe remediation, the human-in-the-loop review catches domain-specific considerations that automated analysis may miss.

**Install protections after every hit cycle.** The protect phase prevents the same issues from recurring. Without protection, remediated problems tend to reappear within weeks as new code is added without awareness of the previously identified patterns.

**Track trends over time.** The maintenance health trend reveals whether the codebase is improving or degrading. A declining trend warrants dedicated maintenance sprints. A stable or improving trend indicates that the scout/hit/clean/protect cycle is effective.

**Use `--backup` for large-scale hit operations.** For operations affecting more than 20 files, the backup provides a safety net that allows quick restoration if unexpected issues emerge after the operation completes.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Scout finds no targets | Reports clean bill of health | No action needed |
| Hit fails on specific target | Skips target, continues with others | Review failed target manually |
| Clean removes active file | Automatic detection via compilation check | Restore from backup |
| Protection hook conflicts | Reports conflict with existing hook | Merge hooks manually |
| Status data corruption | Regenerates from source analysis | Automatic recovery |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The leon-cleaner agent pursues maintenance targets with methodical thoroughness. Dead code is eliminated, not commented out. Unused dependencies are removed, not deprecated. Anti-patterns are fixed, not suppressed. The protection phase ensures that remediated issues cannot recur.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The scout phase performs exhaustive analysis before any remediation action. Every target identification includes evidence (reference counts, usage patterns, dependency analysis) that justifies the remediation. Hit operations use `--dry-run` by default for destructive actions.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/code](/commands/code/) - Core coding implementation and feature development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)