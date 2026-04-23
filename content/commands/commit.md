+++
title = "/commit"
weight = 870
[extra]
category = "Operations"
description = "Smart commit with quality gates and conventional format"
syntax = "/commit [options]"
authority = "L2+"
agent = "commit-coordinator"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 793
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["commit", "Smart", "commands", "Operations", "Prismatic Platform", "GitLab", "GitLab API"]
tags = ["commands", "operations", "commit", "prismatic"]
quality_score = 70
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/commit - Prismatic Platform"
+++

## Overview

**/commit** is a production command in the **Operations** category of the Prismatic Platform that provides intelligent git commit operations with automatic message generation, mandatory [quality gates](@/glossary/quality-gates.md), conventional commit format enforcement, and GitLab issue reference validation. Every commit processed through this command is guaranteed to pass compilation checks, static analysis, and test verification before being accepted.

The command goes far beyond a simple `git commit` wrapper. It analyzes staged changes to automatically determine the commit type (feat, fix, refactor, etc.), identifies the affected scope from changed file paths, drafts a concise message describing the changes, and validates that a GitLab issue reference is attached for traceability. Post-commit, it automatically synchronizes with GitLab to update the referenced issue with commit information.

This command operates under the **L2+** authority level and is executed by the `commit-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command enforces COSMIC CLEARANCE level GitLab issue tracking -- every commit must reference a valid GitLab issue, and this requirement cannot be bypassed.

The commit workflow implements the platform's Session Discipline Protocol, which mandates continuous, atomic commits with immediate push to remote. Batching multiple changes into single large commits is forbidden. Each commit represents a discrete, tested, and verified unit of work that can be independently reviewed and reverted.

## Architecture

The commit system operates through a five-phase pipeline with mandatory validation gates at each stage.

```
User Request (/commit --issue #XXXX [message or --auto])
    |
    v
PHASE 0: GITLAB ISSUE VALIDATION (mandatory)
    |-- Parse issue reference
    |-- Validate format (#XXXX)
    |-- Query GitLab API
    |-- BLOCK if invalid
    |
PHASE 1: CHANGE ANALYSIS
    |-- git status (untracked files)
    |-- git diff (staged/unstaged)
    |-- git log (recent commit style)
    |
PHASE 2: MESSAGE GENERATION (if --auto)
    |-- Analyze staged changes
    |-- Determine commit type
    |-- Identify scope
    |-- Draft message with issue footer
    |
PHASE 3: QUALITY VALIDATION
    |-- Pre-commit hooks
    |-- Compilation check
    |-- Test execution
    |-- Quality gates
    |-- Secret scanning
    |
PHASE 4: COMMIT EXECUTION
    |-- Stage relevant files
    |-- Create commit with message
    |-- Add co-author footer
    |-- Verify success
    |
PHASE 5: GITLAB SYNC (automatic)
    |-- Update issue with commit reference
    |-- Update issue status
    |-- Log sync result
```

### GitLab Issue Validation Flow

```
--issue #160
    |
    v
Parse Format Check (#XXXX)
    |
    +-- Valid Format --> GitLab API: GET /issues/{iid}
    |                       |
    |                   +---+---+
    |                   |       |
    |              Issue Exists  404 Not Found
    |              PROCEED       BLOCK
    |
    +-- Invalid Format --> BLOCK
```

## Usage

### Standard Commit Operations

```bash
# Auto-generate commit message with issue reference
/commit --issue #160 --auto

# Manual message with issue reference
/commit --issue #247 "feat(storage): add Redis caching layer"

# With explicit type and scope
/commit --issue #350 --type feat --scope storage "add Redis caching layer"

# Quick fix
/commit --issue #123 --type fix "resolve null pointer in auth module"
```

### Auto-Generated Messages

```bash
# Let the agent analyze changes and generate message
/commit --issue #160 --auto

# Output example:
# Analyzing staged changes...
# Detected: 3 new files, 2 modified files
# Scope: prismatic_perimeter
# Type: feat
# Generated: feat(perimeter): add security rating calculation engine
# Proceed? [Y/n]
```

### Blocked Operations

```bash
# BLOCKED - No issue reference
/commit --auto
# ERROR: GitLab issue reference is REQUIRED
# Usage: /commit --issue #XXXX [message or --auto]

# BLOCKED - Invalid issue format
/commit --issue issue-160 --auto
# ERROR: Invalid issue format. Expected #XXXX (e.g., #160, #247)

# BLOCKED - Issue does not exist
/commit --issue #99999 --auto
# ERROR: GitLab issue #99999 does not exist
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | none | Commit message or `--auto` for generation |
| `--issue` | string | **required** | GitLab issue reference (#XXXX format) |
| `--auto` | boolean | false | Auto-generate message from changes |
| `--type` | string | auto-detected | Commit type: feat, fix, docs, style, refactor, perf, test, chore, ci |
| `--scope` | string | auto-detected | Commit scope (e.g., storage, web, osint) |
| `--skip-hooks` | boolean | false | Skip pre-commit hooks (NOT recommended) |
| `--skip-sync` | boolean | false | Skip GitLab sync after commit (NOT recommended) |

## Commit Message Format

The command enforces conventional commit format with mandatory GitLab issue reference:

```
type(scope): subject

Body explaining the changes in detail.

Closes #XXXX

---
Generated with Claude Code

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(perimeter): add security rating engine` |
| `fix` | Bug fix | `fix(web): resolve LiveView socket leak` |
| `docs` | Documentation | `docs(api): update OpenAPI spec for v2 endpoints` |
| `style` | Formatting | `style(agents): apply mix format to all agent modules` |
| `refactor` | Code restructuring | `refactor(storage): extract adapter contract trait` |
| `perf` | Performance | `perf(ets): optimize query path for large result sets` |
| `test` | Test additions | `test(perimeter): add property-based rating tests` |
| `chore` | Maintenance | `chore(deps): update Phoenix to 1.8.0` |
| `ci` | CI/CD changes | `ci(gitlab): add cascade quality check stage` |

## Pre-Commit Checks

The following checks must pass before any commit is accepted:

| Check | Tool | Blocking | Order |
|-------|------|----------|-------|
| GitLab Issue Validation | GitLab API | Yes | 0 (first) |
| Compilation | `mix compile --warnings-as-errors` | Yes | 1 |
| Tests | `mix test` | Yes | 2 |
| Quality Gates | `mix quality.gates` | Yes | 3 |
| Static Analysis | `mix credo --strict` | Yes | 4 |
| Secret Scanning | Pattern-based | Yes | 5 |

## Execution Flow

```
PHASE 0: GITLAB ISSUE VALIDATION
    |-- Parse --issue parameter
    |-- Validate format: must match #[0-9]+
    |-- API call: GET /projects/{id}/issues/{iid}
    |-- BLOCK if 404 or API error
    |-- Warning if issue is closed (non-blocking)
    |
PHASE 1: CHANGE ANALYSIS
    |-- git status: identify untracked and modified files
    |-- git diff: analyze content of changes
    |-- git log: sample recent commit style for consistency
    |
PHASE 2: MESSAGE GENERATION (if --auto)
    |-- Categorize changes by type and scope
    |-- Draft subject line (< 50 chars)
    |-- Generate body with change details
    |-- Append issue reference footer
    |-- Append co-author footer
    |
PHASE 3: QUALITY VALIDATION
    |-- Execute all pre-commit hooks
    |-- Verify zero warnings compilation
    |-- Run test suite for affected modules
    |-- Execute quality gates
    |-- Scan for secrets and credentials
    |-- BLOCK if any check fails
    |
PHASE 4: COMMIT EXECUTION
    |-- Stage specified files (no `git add -A`)
    |-- Create commit with formatted message
    |-- Verify commit success
    |
PHASE 5: GITLAB SYNC
    |-- POST commit reference to GitLab issue
    |-- Update issue labels if applicable
    |-- Log sync result
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `commit-coordinator` | Primary orchestration |
| AIAD Registry | Command specification | Standard AIAD interface |
| [Quality Gates](@/glossary/quality-gates.md) | Pre-commit validation | Mandatory gate execution |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Commit tracking |
| GitLab API | Issue validation and sync | Bidirectional integration |
| Git Hooks | Pre-commit enforcement | `.githooks/pre-commit` |
| `brutal-gitlab-enforcer` | Enforcement agent | Issue tracking compliance |
| `gitlab-api-specialist` | API operations | Issue CRUD operations |

## Configuration

### Required Environment Variables

```bash
export GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxxx"
export GITLAB_PROJECT_ID="korczis/prismatic-platform"
export GITLAB_ENFORCEMENT_ENABLED="true"
```

## Best Practices

1. **Always Use Issue References**: Every commit must reference a GitLab issue. Create issues first, then commit against them. This creates a complete audit trail.

2. **Prefer --auto for Message Generation**: The auto-generated messages are consistent with conventional commit format and include proper scoping based on changed files.

3. **Atomic Commits**: Commit frequently with small, focused changes. One feature or fix per commit. Never batch unrelated changes.

4. **Never Skip Hooks**: The `--skip-hooks` flag exists for emergency use only. Hooks protect against regressions, compilation warnings, and secret leakage.

5. **Review Generated Messages**: When using `--auto`, review the generated message before confirming. The agent may occasionally misjudge the scope or type.

6. **Push Immediately**: Per the Session Discipline Protocol, push to remote immediately after committing. Unpushed work at session end is a protocol violation.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `ISSUE_REQUIRED` | Missing --issue parameter | Add `--issue #XXXX` to command |
| `INVALID_ISSUE_FORMAT` | Issue reference not in #XXXX format | Use format: `--issue #123` |
| `ISSUE_NOT_FOUND` | GitLab issue does not exist | Verify issue number at GitLab |
| `API_UNAVAILABLE` | GitLab API unreachable | Check network, use emergency override |
| `PRE_COMMIT_FAILED` | Quality gate or hook failure | Fix issues, do not use --no-verify |
| `SECRET_DETECTED` | Credentials in staged files | Remove sensitive files from staging |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Issue Validation | 1-2 seconds | GitLab API call |
| Change Analysis | < 5 seconds | Git operations |
| Message Generation | 2-5 seconds | AI-powered analysis |
| Quality Validation | 30s - 5 min | Depends on test suite size |
| GitLab Sync | 1-2 seconds | Post-commit API call |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Commits without issue references are BLOCKED. No bypass flags, no exceptions, no emergency workarounds without explicit supreme authority override with 1-hour timeout.
- **NO DOUBTS**: Issue existence is verified via GitLab API before any commit proceeds. Every claim about changes is validated through compilation, testing, and quality gates.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/debrief](@/commands/debrief.md) - Comprehensive session debrief with platform state analysis
- [/check](@/commands/check.md) - Verification and integrity checking command
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)