+++
title = "/check"
weight = 360
[extra]
category = "Quality"
description = "Verification and integrity checking command"
syntax = "/check [options]"
authority = "L2+"
agent = "verification-integrity-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 914
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["check", "Verification", "commands", "Quality", "Prismatic Platform", "Full", "AIAD", "Commit"]
tags = ["commands", "quality", "check", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/check - Prismatic Platform"
+++

## Overview

**/check** is a production command in the **Quality** category of the Prismatic Platform that provides comprehensive verification and integrity checking across session claims, commit messages, report metrics, and platform state. The command ensures that every claim made during development sessions is backed by evidence, every commit accurately describes its changes, and every metric reported in documentation matches the actual platform state.

In a complex platform with hundreds of agents, thousands of files, and continuous evolution, drift between claimed state and actual state is inevitable without systematic verification. The `/check` command serves as the platform's truth arbiter, cross-referencing assertions against live evidence at three configurable depth levels: quick (syntax and existence), thorough (full cross-reference with tests), and forensic (deep historical analysis with reproducibility verification).

This command operates under the **L2+** authority level and is executed by the `verification-integrity-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command supports five verification scopes (session, commit, reports, claims, all) and produces structured verification reports with confidence scores and recommended actions.

The verification philosophy aligns with the NABLA framework's Provenance Mandatory axiom: all beliefs about platform state must be traceable to verifiable evidence. The `/check` command operationalizes this axiom by systematically validating that documented claims have concrete backing in the codebase, test results, and compilation output.

## Architecture

The verification system uses a multi-pass validation architecture where each scope runs independent verification pipelines that converge into a unified integrity report.

```
User Request (/check [scope] [depth])
    |
    v
Scope Router ──> Session | Commit | Reports | Claims | All
    |
    v
Verification Pipeline (per scope)
    |-- Evidence Collection
    |-- Cross-Reference Analysis
    |-- Discrepancy Detection
    |-- Confidence Scoring
    |
    v
Unified Integrity Report
    |-- VERIFIED / PARTIAL / FAILED
    |-- Discrepancy Details
    |-- Recommended Actions
```

### Verification Scopes

| Scope | What It Verifies | Evidence Sources |
|-------|-----------------|-----------------|
| **session** | Session context claims, completion status | `.claude/session-context/`, git log |
| **commit** | Commit messages vs actual changes | git diff, compilation, tests |
| **reports** | Report metrics and statistics | Mix tasks, file counts, test results |
| **claims** | Arbitrary claims about platform state | Codebase analysis, runtime checks |
| **all** | Comprehensive platform-wide verification | All sources combined |

## Usage

### Basic Verification

```bash
# Verify current session claims (default)
/check session

# Quick sanity check across all scopes
/check all quick

# Deep commit verification
/check commit thorough

# Full platform forensic check
/check all forensic
```

### Scope-Specific Verification

```bash
# Verify session context accuracy
/check session thorough

# Validate report metrics against reality
/check reports forensic

# Cross-reference all claims in documentation
/check claims thorough

# Quick compilation and test sanity check
/check quick
```

### Advanced Verification

```bash
# Verify specific session file
/check session --file 2025-12-13-archer-supreme-session.md

# Verify last N commits
/check commit --count 5 --depth thorough

# Verify claims in specific document
/check claims --file CLAUDE.md --depth forensic
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `session` | Verification scope: session, commit, reports, claims, all |
| `verification-type` | string | `thorough` | Depth: quick, thorough, forensic |
| `--file` | string | none | Specific file to verify |
| `--count` | integer | 1 | Number of commits to verify |
| `--output` | string | `terminal` | Output: terminal, file, json |

## Verification Levels

| Level | Duration | Coverage | Best For |
|-------|----------|----------|----------|
| **quick** | < 30 seconds | Syntax, existence, basic metrics | Pre-commit sanity check |
| **thorough** | 1-5 minutes | Full cross-reference, tests, analysis | Standard verification |
| **forensic** | 5-30 minutes | Deep analysis, history, reproducibility | Release validation |

### Quick Verification Checks

- File existence for all referenced paths
- Syntax validity of configuration files
- Basic metric ranges (file counts, agent counts)
- Compilation status (warnings-as-errors)

### Thorough Verification Checks

- All quick checks plus:
- Full cross-reference validation across documents
- Test suite execution and result verification
- Git log analysis against claimed changes
- Quality gate execution and scoring
- Agent registry integrity

### Forensic Verification Checks

- All thorough checks plus:
- Historical claim tracking across sessions
- Reproducibility testing of reported metrics
- Statistical anomaly detection in reported numbers
- Source code analysis for undocumented changes
- Dependency audit for security vulnerabilities

## Execution Flow

```
PHASE 1: SCOPE SELECTION
    |-- Parse scope and verification level
    |-- Load relevant evidence sources
    |-- Initialize verification pipeline
    |
PHASE 2: EVIDENCE COLLECTION
    |-- Gather claims from target scope
    |-- Collect supporting evidence
    |-- Load baseline metrics
    |
PHASE 3: CROSS-REFERENCE ANALYSIS
    |-- Match claims against evidence
    |-- Identify unsupported claims
    |-- Detect contradictions
    |-- Calculate confidence scores
    |
PHASE 4: DISCREPANCY DETECTION
    |-- Flag claims without evidence
    |-- Identify metric mismatches
    |-- Detect stale references
    |-- Classify severity of discrepancies
    |
PHASE 5: REPORT GENERATION
    |-- Compile verification results
    |-- Calculate overall integrity score
    |-- Generate recommended actions
    |-- Assign verification status
    |
PHASE 6: OUTPUT
    |-- Display formatted report
    |-- Save to verification history
    |-- Emit telemetry events
```

## Output Format

### Verification Report Structure

```
VERIFICATION REPORT
Status: VERIFIED | PARTIAL | FAILED

Claims Verified: 47/50 (94%)
Discrepancies Found: 3
Confidence Score: 0.94

DISCREPANCIES:
1. [MINOR] Agent count claimed 258, actual 255
   Source: CLAUDE.md line 42
   Evidence: mix git_trees find ".agent.md" | wc -l

2. [WARNING] Session file references non-existent path
   Source: session-context/2025-12-13-session.md
   Evidence: File not found at referenced path

3. [INFO] Quality score not verified (mix quality.gates not run)
   Action: Run mix quality.gates to verify

RECOMMENDED ACTIONS:
- Update CLAUDE.md agent count to 255
- Remove stale file reference from session context
- Run quality gates for score verification
```

### Status Levels

| Status | Meaning | Action Required |
|--------|---------|----------------|
| **VERIFIED** | All claims confirmed with evidence | None |
| **PARTIAL** | Some discrepancies found | Review and correct |
| **FAILED** | Significant integrity issues detected | Immediate investigation |

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `verification-integrity-commander` | Primary verification agent |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](/glossary/quality-gates/) | Direct quality gate enforcement | Gate results as evidence |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) | Verification event tracking |
| Git Integration | Commit and history analysis | Evidence for commit scope |
| Session Context | Session claim verification | `.claude/session-context/` files |
| Mix Tasks | Metric verification | `mix compile`, `mix test`, `mix quality.gates` |

## Best Practices

1. **Run After Every Session**: Execute `/check session` at the end of each development session to ensure session context accurately reflects what was accomplished.

2. **Verify Before Deployment**: Use `/check all forensic` before production deployments to ensure all platform claims are accurate and no undocumented changes exist.

3. **Automate in Pre-Commit**: Add `/check commit quick` to pre-commit hooks for automated commit message validation.

4. **Cross-Reference Reports**: When writing session reports or documentation updates, run `/check reports thorough` to catch metric inaccuracies before they propagate.

5. **Track Verification History**: Maintain verification reports in `.claude/reports/verification/` for audit trail purposes and trend analysis.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `EVIDENCE_UNAVAILABLE` | Cannot access evidence source | Ensure mix tasks are available, git is accessible |
| `COMPILATION_REQUIRED` | Source needs compilation for verification | Run `mix compile` first |
| `TIMEOUT` | Forensic verification exceeded time limit | Use thorough level or narrow scope |
| `SCOPE_INVALID` | Unrecognized verification scope | Use: session, commit, reports, claims, all |

## Advanced Usage

### Automated Verification Pipeline

```bash
# Pre-release verification chain
/check all forensic
/check commit --count 20 --depth thorough
/check reports forensic --output json > verification-report.json
```

### Integration with Workflows

The `/check` command integrates with the AIAD workflow system:
- **Post-evolution**: Verify evolution claims after `/evolve` execution
- **Pre-commit**: Validate commit accuracy before staging
- **Release gate**: Forensic verification as deployment prerequisite

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Quick Check | < 30 seconds | Syntax and existence only |
| Thorough Check | 1-5 minutes | Full cross-reference |
| Forensic Check | 5-30 minutes | Deep analysis |
| Per-Claim Verification | ~2 seconds | Individual claim checking |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unverified claims. Every assertion about platform state must be backed by concrete evidence. Discrepancies are flagged immediately.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The verification system provides complete provenance for every claim validation.

The command directly implements the NABLA framework's Provenance Mandatory axiom: all beliefs must be traceable to verifiable evidence sources.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/debrief](/commands/debrief/) - Comprehensive session debrief with platform state analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)