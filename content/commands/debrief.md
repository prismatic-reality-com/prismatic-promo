+++
title = "/debrief"
weight = 1500
[extra]
category = "Session"
description = "Comprehensive session debrief with platform state analysis and changelog detection"
syntax = "/debrief [options]"
authority = "L2+"
agent = "session-debrief-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 843
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["debrief", "Comprehensive", "commands", "Session", "Prismatic Platform", "AskUserQuestion", "Platform"]
tags = ["commands", "session", "debrief", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/debrief - Prismatic Platform"
+++

## Overview

**/debrief** is a production command in the **Session** category of the Prismatic Platform that provides comprehensive session debriefing with platform state analysis, changelog detection, session history summarization, and interactive next-steps selection. The command automatically executes at the start of every Claude Code session as part of the Automatic Startup Context Protocol, ensuring that every development session begins with full situational awareness of the platform's current state.

In a platform with 90+ applications, 400+ agents, and continuous evolution across multiple development sessions, context loss between sessions is a critical productivity risk. The `/debrief` command systematically addresses this by analyzing five dimensions of platform state: current quality metrics, recent git activity, session history with achievements and deliverables, recommended next steps, and interactive action selection. The result is a concise briefing that restores full context in under 30 seconds.

This command operates under the **L2+** authority level and is executed by the `session-debrief-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Version 2.0.0 introduced changelog detection through git log analysis, an interactive next-steps selector using the AskUserQuestion tool, and a recommendation engine that cross-references platform state with session history to suggest optimal next actions.

The debrief system treats session continuity as a first-class engineering concern. Without systematic debriefing, developers waste 10-15 minutes at the start of each session manually reconstructing context. With `/debrief`, this is reduced to a 30-second automated briefing followed by an interactive action selector.

## Architecture

The debrief system uses a five-phase analysis pipeline that aggregates data from multiple platform subsystems into a unified situational awareness report.

```
Session Start
    |
    v
PHASE 1: Platform State Analysis (10s)
    |-- Compilation status
    |-- Quality gate scores
    |-- Test suite status
    |-- File/agent/command counts
    |
PHASE 2: Changelog Detection (5s)
    |-- Git log analysis (configurable days)
    |-- Conventional commit categorization
    |-- Notable commit highlighting
    |-- Staged change detection
    |
PHASE 3: Session Context Loading (5s)
    |-- Find recent session files
    |-- Extract missions and achievements
    |-- Identify deliverables
    |-- Summarize key decisions
    |
PHASE 4: Recommendation Engine (5s)
    |-- Analyze uncommitted changes
    |-- Check quality violations
    |-- Review pending TODOs
    |-- Cross-reference session history
    |
PHASE 5: Interactive Selection (user-driven)
    |-- Present prioritized action list
    |-- Await user decision
    |-- Execute selected action
```

### Debrief Scopes

| Scope | Content | Duration | Best For |
|-------|---------|----------|----------|
| **full** | All five phases | 30-45 seconds | Session start (default) |
| **quick** | Platform state only | ~10 seconds | Mid-session sanity check |
| **changelog** | Git activity focus | ~15 seconds | After pulling changes |
| **context** | Session history focus | ~15 seconds | Context recovery |
| **suggest** | Recommendations focus | ~15 seconds | Decision support |

## Usage

### Standard Debrief

```bash
# Full debrief (default, auto-executed at session start)
/debrief

# Quick status check
/debrief quick

# Changelog focus (last 14 days)
/debrief changelog --days 14

# Session context (last 10 sessions)
/debrief context --sessions 10

# Recommendations with interactive selector
/debrief suggest
```

### Advanced Options

```bash
# Specific session file analysis
/debrief 2025-12-11-archer-supreme-session.md

# Full details without interactive prompt
/debrief full --interactive false

# Minimal output mode
/debrief full --quiet

# Extended changelog analysis
/debrief changelog --days 30 --full
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `full` | Scope: full, quick, changelog, context, suggest |
| `--days` | integer | 7 | Days for changelog analysis |
| `--sessions` | integer | 5 | Number of recent sessions to summarize |
| `--interactive` | boolean | true | Enable interactive next-steps selector |
| `--full` | boolean | false | Show full session details |
| `--quiet` | boolean | false | Minimal output mode |

## Output Sections

### 1. Platform State

```
PLATFORM STATE

Quality Score: 100/100 (ABSOLUTE PERFECTION)
Compilation: 0 warnings
Tests: All passing
Credo: 0 violations

| Metric       | Value  | Change |
|--------------|--------|--------|
| Files        | 6,652  | +15    |
| Agents       | 404    | +5     |
| Commands     | 210    | +2     |
| Apps         | 90     | -      |
| Quality      | 13/13  | PERFECT|
```

### 2. Changelog (Git Activity)

```
RECENT CHANGES (Last 7 Days)

Commits by Category:
| Type     | Count | Description       |
|----------|-------|-------------------|
| feat     | 12    | New features      |
| fix      | 8     | Bug fixes         |
| refactor | 5     | Code improvements |
| docs     | 3     | Documentation     |
| test     | 2     | Test additions    |

Notable Commits:
1. bcb6bc90c feat(issues): Add colored CLI output and extended filtering
2. 38424db59 feat(aiad): Implement AIAD-enforced GitLab sync
3. bd9aa00a6 fix(osint): Email Intelligence rate-limited adapter fixes

Staged Changes (Not Committed):
- 16 staged files (presales app integration)
- 4 modified tracked files
```

### 3. Session History

```
RECENT SESSIONS (Last 5)

1. 2025-12-13 - ARCHER SUPREME Orchestrator Self-Improvement
   Mission: ML-enhanced LearningSystem for orchestration
   Key Achievement: First AI meta-orchestration self-improvement
   Deliverables: LearningSystem GenServer (500+ LOC)

2. 2025-12-13 - MCP Service Rock-Solid Completion
   Mission: MCP service stability
   Key Achievement: 100% service reliability via launchd

3. 2025-12-11 - ARCHER SUPREME Phase 3 Absolute Perfection
   Mission: 100/100 quality score achievement
   Key Achievement: LEGENDARY - First platform with perfect quality
```

### 4. Recommendations

```
RECOMMENDED NEXT STEPS

High Priority:
1. Commit staged presales files - 16 files ready for commit
2. Run full test suite - Verify after recent LearningSystem changes

Medium Priority:
3. Update LATEST_SESSION.md - Current state not documented
4. Run /evolve - Propagate patterns from recent changes

Low Priority:
5. Review GitLab sync - Verify bidirectional sync working
6. Clean up memory files - Temporary files in root
```

### 5. Interactive Selector

```
What would you like to do next?

[1] Commit staged presales changes (16 files ready)
[2] Run full test suite
[3] Execute /evolve for pattern propagation
[4] Continue previous session work
[5] Start new task
```

## Execution Flow

```
PHASE 1: PLATFORM STATE ANALYSIS (10s)
    |-- mix compile status (warnings count)
    |-- mix quality.gates (quality score)
    |-- mix test --dry-run (test count)
    |-- mix credo --strict (violation count)
    |-- File/agent/command counts via git ls-tree
    |
PHASE 2: CHANGELOG DETECTION (5s)
    |-- git log --oneline --since="N days ago"
    |-- Categorize by conventional commit type
    |-- Identify notable commits (significant changes)
    |-- git status (staged/unstaged changes)
    |
PHASE 3: SESSION CONTEXT LOADING (5s)
    |-- ls -t .claude/session-context/*.md
    |-- Parse top N session files
    |-- Extract mission, achievements, deliverables
    |-- Identify key decisions and patterns
    |
PHASE 4: RECOMMENDATION ENGINE (5s)
    |-- Analyze git status for uncommitted work
    |-- Check for quality violations
    |-- Review TODO items
    |-- Cross-reference with session priorities
    |-- Generate prioritized action list
    |
PHASE 5: INTERACTIVE SELECTION (if --interactive)
    |-- Present options via AskUserQuestion
    |-- Parse user selection
    |-- Execute selected action
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `session-debrief-specialist` | Primary debrief agent |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](@/glossary/quality-gates.md) | Platform state assessment | Gate results for scoring |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Debrief event tracking |
| Git Integration | Changelog detection | `git log`, `git status`, `git diff` |
| Session Context | History loading | `.claude/session-context/` files |
| AIAD Bootstrap | Auto-execution | Phase 6 (Activation) integration |
| AskUserQuestion | Interactive selection | User action selector tool |

## Auto-Execution Protocol

The `/debrief` command is automatically executed at the start of every Claude Code session as part of the Automatic Startup Context Protocol defined in CLAUDE.md:

1. Execute `mix autoheal.baseline`
2. Check `.claude/session-context/` for latest session
3. Load most recent session context
4. Execute `/debrief` (or `mix autoevolve status --brief`)
5. Display brief debrief (200-300 words)
6. Recommend 3-5 next steps
7. Wait for user directive

## Best Practices

1. **Use Full Debrief at Session Start**: Always begin sessions with `/debrief full` for complete situational awareness. The 30-second investment prevents much larger context-recovery costs.

2. **Check Changelog After Pulls**: After pulling remote changes, run `/debrief changelog` to understand what teammates have contributed since your last session.

3. **Use Interactive Mode for Decision Support**: When unsure what to work on next, `/debrief suggest` provides prioritized recommendations based on platform state analysis.

4. **Review Session History for Continuity**: Before continuing previous work, use `/debrief context` to review what was accomplished and what was planned as next steps.

5. **Quick Check Mid-Session**: Use `/debrief quick` for rapid platform health verification without the overhead of full analysis.

6. **Save Session Context Before Ending**: The debrief system is only as good as the session context it reads. Always save session context at session end.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `NO_SESSION_FILES` | No session context files found | Normal for first session |
| `GIT_LOG_EMPTY` | No commits in specified timeframe | Increase `--days` parameter |
| `QUALITY_GATES_ERROR` | Mix task compilation failure | Run `mix compile` first |
| `CONTEXT_PARSE_ERROR` | Malformed session context file | Regenerate session context |
| `INTERACTIVE_UNAVAILABLE` | AskUserQuestion tool not available | Use `--interactive false` |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Full Debrief | 25-45 seconds | All 5 phases |
| Quick Debrief | ~10 seconds | Platform state only |
| Changelog | ~15 seconds | Git analysis |
| Context Loading | ~15 seconds | Session file parsing |
| Interactive Selection | User-dependent | Awaits input |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for context loss between sessions. Every session must begin with full situational awareness. Session context must be saved at session end without exception.
- **NO DOUBTS**: Full investigation of platform state before action. The debrief provides evidence-based situational awareness across five dimensions before any development work begins.

## Related Commands

- [/rebrief](@/commands/rebrief.md) - Retrospective analysis of development activity across multiple sessions
- [/session-compress](@/commands/session-compress.md) - Advanced session context compression with multi-session pattern detection
- [/session-track](@/commands/session-track.md) - Session tracking actions for GitLab integration and progress monitoring
- [/check](@/commands/check.md) - Verification and integrity checking command
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/compress](@/commands/compress.md) - Intelligent document compression with 4-level ratios

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)