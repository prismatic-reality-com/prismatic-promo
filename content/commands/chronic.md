+++
title = "/chronic"
weight = 1200
[extra]
category = "Documentation"
description = "Chronic documentation scan and technical hygiene maintenance"
syntax = "/chronic [options]"
authority = "L2+"
agent = "chronic-scanner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 902
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chronic", "commands", "Documentation", "Prismatic Platform", "Every", "Cross", "Session"]
tags = ["commands", "documentation", "chronic", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chronic - Prismatic Platform"
+++

## Overview

**/chronic** is a production command in the **Documentation** category of the Prismatic Platform that performs chronic documentation scanning and technical hygiene maintenance across the entire platform ecosystem. The command goes beyond simple documentation linting -- it provides intelligent validation of platform statistics, cross-reference integrity checking, quality gate synchronization, and git activity correlation to ensure that documentation accurately reflects the living state of the codebase.

Documentation drift is one of the most insidious forms of technical debt. Claims about agent counts, quality scores, file statistics, and architectural patterns become stale as the platform evolves, creating a growing gap between documented state and actual state. The `/chronic` command systematically detects and resolves this drift through automated validation intelligence that reduces manual verification time from 45+ minutes to under 5 minutes.

This command operates under the **L2+** authority level and is executed by the `chronic-scanner` agent, coordinated by the `documentation-validation-commander` with support from the `session-context-coordinator` and `git-integration-specialist`. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Version 2.0.0 introduced automated validation intelligence based on learnings from ARCHER SUPREME documentation alignment sessions.

The chronic scanning approach treats documentation as a first-class engineering artifact subject to the same quality standards as production code. Every statistic cited in documentation is verified against the codebase. Every cross-reference link is validated for existence. Every quality score is confirmed against the latest gate execution results. This ensures that platform documentation maintains forensic-grade accuracy.

## Architecture

The chronic scanning system uses a multi-agent validation architecture with four specialized subsystems.

```
Chronic Scanner (orchestrator)
    |
    +-- Statistics Validator
    |       |-- File counts (git ls-tree)
    |       |-- Agent counts (AIAD registry)
    |       |-- Command counts (command registry)
    |       |-- Quality scores (mix quality.gates)
    |
    +-- Cross-Reference Checker
    |       |-- Internal link validation
    |       |-- External URL checking
    |       |-- Glossary reference consistency
    |       |-- Agent/command name validation
    |
    +-- Git Activity Correlator
    |       |-- Commit history vs documented changes
    |       |-- File modification dates vs claims
    |       |-- Branch state verification
    |
    +-- Quality Gate Synchronizer
            |-- Score verification
            |-- Domain status checking
            |-- Warning count validation
```

### Supporting Agents

| Agent | Role |
|-------|------|
| `documentation-validation-commander` | Primary orchestration and reporting |
| `session-context-coordinator` | Session file analysis and synthesis |
| `git-integration-specialist` | Git activity correlation |
| `quality-enforcement-commander` | Quality gate synchronization |

## Usage

### Basic Scanning

```bash
# Full documentation scan and validation
/chronic

# Automated validation with auto-fix and evidence report
/chronic validate --auto-fix --evidence-report

# Quick health check with maintenance suggestions
/chronic health-check --predict-discrepancies --maintenance-suggestions
```

### Validation Operations

```bash
# Validate all claims across documentation
/chronic validate-all --auto-correct --evidence-trail

# Test documentation links and references
/chronic test-docs --link-validation --claim-verification --consistency-check

# Documentation debt analysis
/chronic debt-analysis --cross-reference-complexity --maintenance-overhead
```

### Synchronization

```bash
# Sync documentation with platform state
/chronic sync-platform-state --live-update --cross-reference-check

# Git-aware documentation updates
/chronic git-sync --correlate-claims --evidence-generation

# Enhanced document synchronization
/chronic update --intelligent --scope breadth-first --auto-verify
```

### Session Integration

```bash
# Analyze session context files
/chronic integrate-sessions --date 2025-12-03 --auto-synthesis

# Session pattern recognition
/chronic analyze-session-patterns --identify-improvements --dx-enhancement

# Context-aware documentation evolution
/chronic evolve-docs --context-driven --session-intelligence
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `validate` | Operation: validate, sync, health-check, debt-analysis, test-docs |
| `--auto-fix` | boolean | false | Automatically fix detected discrepancies |
| `--auto-correct` | boolean | false | Apply corrections to documentation files |
| `--evidence-report` | boolean | false | Generate evidence trail for changes |
| `--evidence-trail` | boolean | false | Full provenance for each validation |
| `--link-validation` | boolean | false | Validate all internal and external links |
| `--claim-verification` | boolean | false | Verify statistical and metric claims |
| `--consistency-check` | boolean | false | Cross-document consistency analysis |
| `--scope` | string | `all` | Scan scope: all, breadth-first, specific path |
| `--live-update` | boolean | false | Real-time synchronization mode |
| `--predict-discrepancies` | boolean | false | Predict likely drift areas |
| `--date` | string | none | Target date for session integration |

## Execution Flow

```
PHASE 1: DISCOVERY
    |-- Enumerate all documentation files
    |-- Load current platform state (git ls-tree)
    |-- Load quality gate results
    |-- Load AIAD registry state
    |
PHASE 2: CLAIM EXTRACTION
    |-- Parse statistics from CLAUDE.md
    |-- Extract metrics from session files
    |-- Identify cross-reference links
    |-- Catalog agent and command references
    |
PHASE 3: EVIDENCE COLLECTION
    |-- Run mix git_trees for file counts
    |-- Query AIAD registry for agent counts
    |-- Execute quality gates for scores
    |-- Analyze git log for activity claims
    |
PHASE 4: CROSS-REFERENCE VALIDATION
    |-- Match claims against evidence
    |-- Validate internal links
    |-- Check glossary references
    |-- Verify agent/command name accuracy
    |
PHASE 5: DISCREPANCY RESOLUTION
    |-- Classify discrepancies by severity
    |-- Apply auto-fixes if enabled
    |-- Generate correction proposals
    |-- Create evidence report
    |
PHASE 6: REPORTING
    |-- Compile validation report
    |-- Record audit trail
    |-- Emit telemetry events
    |-- Save to .claude/reports/
```

## Validation Categories

| Category | What Is Validated | Evidence Source |
|----------|------------------|----------------|
| Platform Statistics | File counts, agent counts, LOC | `git ls-tree`, AIAD index |
| Quality Scores | Quality gate results, domain status | `mix quality.gates` |
| Cross-References | Internal links, glossary refs | File existence checks |
| Session Claims | Session achievements, deliverables | Git diff, file inspection |
| Architecture Claims | App structure, dependency claims | `mix deps.tree`, app configs |
| Git Activity | Commit claims, change descriptions | `git log`, `git diff` |

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `chronic-scanner` agent | Multi-agent validation |
| AIAD Registry | Command specification and discovery | Registry as evidence source |
| [Quality Gates](@/glossary/quality-gates.md) | Quality score verification | Gate results for claim validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Scan event tracking |
| Git Integration | Activity correlation | Change detection and verification |
| Session Context | Session file analysis | `.claude/session-context/` scanning |
| Mix Tasks | Metric verification | Various mix tasks for evidence |

## Best Practices

1. **Run Weekly**: Execute `/chronic validate-all` at least weekly to catch documentation drift before it compounds. The longer drift goes undetected, the harder it is to correct.

2. **Enable Auto-Fix for Minor Issues**: For discrepancies like outdated file counts or agent numbers, enable `--auto-fix` to automatically update documentation without manual intervention.

3. **Generate Evidence Reports for Audits**: Use `--evidence-report` when preparing for releases or compliance reviews to create a verifiable audit trail of documentation accuracy.

4. **Integrate Session Analysis**: After intensive development sessions, run `/chronic integrate-sessions` to extract patterns and improvements from session context files.

5. **Use Predictive Mode Proactively**: The `--predict-discrepancies` flag identifies areas likely to drift based on recent git activity patterns, enabling proactive maintenance.

6. **Cross-Reference After Refactoring**: Major refactoring operations often break documentation references. Run `/chronic test-docs --link-validation` after any significant code reorganization.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `QUALITY_GATES_UNAVAILABLE` | Mix task not compiled | Run `mix compile` first |
| `GIT_TREE_ERROR` | Git repository issues | Verify git status and HEAD |
| `LINK_BROKEN` | Referenced file does not exist | Update or remove broken reference |
| `METRIC_MISMATCH` | Documented number differs from actual | Update documentation or investigate cause |
| `SESSION_FILE_CORRUPT` | Malformed session context file | Regenerate session context |

## Advanced Usage

### Measurable Improvements from v2.0

| Metric | Before (v1.0) | After (v2.0) |
|--------|--------------|-------------|
| Validation Speed | 45+ minutes (manual) | < 5 minutes (automated) |
| Discrepancy Detection | Manual review | 100% automated detection |
| Cross-Reference Accuracy | 95% manual | 99.9% automated |
| Platform Sync | Daily manual | Real-time automated |
| Context Loading | 44-file manual analysis | Automated synthesis |

### Predictive Documentation Health

```bash
# Predict which documentation files are likely stale
/chronic health-check --predict-discrepancies

# Output example:
# HIGH RISK:
#   CLAUDE.md (last updated 7 days ago, 23 commits since)
#   AGENT_REGISTRY.md (3 new agents not documented)
# MEDIUM RISK:
#   apps/prismatic_web/CLAUDE.md (5 file changes undocumented)
# LOW RISK:
#   docs/architecture/storage.md (no recent changes)
```

### Documentation Testing Pipeline

```bash
# Full documentation test suite
/chronic test-docs --link-validation --claim-verification --consistency-check

# Output:
# Links: 1,247 validated, 3 broken
# Claims: 89 verified, 2 discrepancies
# Consistency: 45 cross-refs checked, 1 inconsistency
```

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Quick Health Check | < 30 seconds | Basic existence and syntax |
| Full Validation | 3-5 minutes | Complete cross-reference |
| Link Validation | 1-2 minutes | All internal links |
| Session Analysis | 30-60 seconds | Per session file |
| Auto-Fix Application | < 10 seconds | Per discrepancy |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for documentation drift. Discrepancies between documented and actual state are treated as defects that must be resolved immediately.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every validation is backed by concrete evidence from the codebase, git history, or runtime metrics.

The command implements the NABLA framework's Provenance Mandatory axiom: all documented claims must be traceable to verifiable evidence sources with forensic-grade accuracy.

## Related Commands

- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/propagate-pattern](@/commands/propagate-pattern.md) - Propagate successful patterns across the ecosystem
- [/check](@/commands/check.md) - Verification and integrity checking command
- [/compress](@/commands/compress.md) - Intelligent document compression with 4-level ratios
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)