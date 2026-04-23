+++
title = "/debug-investigation"
weight = 2130
[extra]
category = "Development"
description = "Comprehensive debugging investigation for systematic root cause identification"
syntax = "/debug-investigation [options]"
authority = "L2+"
agent = "debug-investigation-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 815
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["debug-investigation", "Comprehensive", "commands", "Development", "Prismatic Platform", "Scope", "GenServer"]
tags = ["commands", "development", "debug-investigation", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/debug-investigation - Prismatic Platform"
+++

## Overview

**/debug-investigation** is a production command in the **Development** category of the Prismatic Platform that provides comprehensive debugging investigation through systematic analysis, root cause identification, and resolution of complex bugs and issues. The command implements a structured five-phase investigation methodology -- reproduction, isolation, hypothesis formation, testing, and resolution -- that transforms ad-hoc debugging into a repeatable, evidence-based diagnostic process.

When developers encounter complex bugs -- GenServer timeouts, memory leaks, intermittent test failures, compilation warnings from deep dependency chains -- the natural tendency is to jump to the most obvious explanation and start fixing. The `/debug-investigation` command resists this impulse by enforcing a systematic approach: first reproduce consistently, then isolate to the minimal failing case, form multiple hypotheses ranked by probability, test each hypothesis against evidence, and only then implement a fix with mandatory regression tests.

This command operates under the **L2+** authority level and is executed by the `debug-investigation-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command supports three investigation depths (quick, standard, deep) and optional auto-fix capability that implements the identified solution with regression test generation.

The investigation output follows a standardized report format that documents the complete diagnostic journey from initial symptom through root cause to resolution. This report serves as both documentation for the current fix and a knowledge base entry for future similar issues.

## Architecture

The investigation system follows a clinical diagnostic model with five sequential phases.

```
Issue Description
    |
    v
PHASE 1: REPRODUCTION
    |-- Identify reproduction steps
    |-- Create minimal test case
    |-- Verify consistent failure
    |
PHASE 2: ISOLATION
    |-- Binary search for fault location
    |-- Identify affected modules
    |-- Trace execution path
    |-- Narrow scope to root cause
    |
PHASE 3: HYPOTHESIS FORMATION
    |-- Generate candidate causes
    |-- Rank by probability
    |-- Identify evidence needed per hypothesis
    |
PHASE 4: HYPOTHESIS TESTING
    |-- Test each hypothesis systematically
    |-- Gather confirming/disconfirming evidence
    |-- Eliminate false hypotheses
    |-- Confirm root cause
    |
PHASE 5: RESOLUTION
    |-- Implement fix
    |-- Generate regression test
    |-- Verify fix resolves issue
    |-- Document prevention strategy
```

### Investigation Depths

| Depth | Duration | Scope | Best For |
|-------|----------|-------|----------|
| **quick** | 5-15 min | Targeted, single module | Simple bugs with obvious symptoms |
| **standard** | 15-45 min | Multi-module analysis | Most debugging scenarios |
| **deep** | 1-3 hours | Platform-wide investigation | Complex, intermittent, or multi-root-cause issues |

## Usage

### Standard Investigations

```bash
# Investigate a GenServer timeout
/debug-investigation "GenServer timeout in orchestrator module"

# Investigate test failure
/debug-investigation "test failure in storage adapter" --depth quick

# Deep investigation with auto-fix
/debug-investigation "memory leak in LiveView process" --depth deep --fix

# Scoped investigation
/debug-investigation "compilation warning" --scope apps/prismatic_web
```

### Error-Driven Investigations

```bash
# Investigate from error message
/debug-investigation "** (FunctionClauseError) no function clause matching in PrismaticAgents.LLMClient.run/3"

# Investigate from stack trace
/debug-investigation "** (MatchError) no match of right hand side value: {:error, :timeout}" --depth standard

# Investigate compilation warning
/debug-investigation "warning: function init/1 required by behaviour GenServer is not implemented" --scope apps/prismatic_agents
```

### Performance Investigations

```bash
# Slow query investigation
/debug-investigation "ETS adapter query takes >500ms for large result sets" --depth deep

# Memory investigation
/debug-investigation "BEAM memory growing unbounded after 24 hours" --depth deep --fix
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `issue` | string | required | Issue description or error message |
| `--scope` | string | auto-detected | Scope: module path, app name, or `platform` |
| `--depth` | string | `standard` | Investigation depth: quick, standard, deep |
| `--fix` | boolean | false | Auto-fix if solution is identified |
| `--evidence` | boolean | false | Save evidence artifacts |
| `--history` | boolean | false | Check investigation history for similar issues |

## Execution Flow

```
PHASE 1: REPRODUCTION (2-10 min)
    |-- Parse issue description
    |-- Identify potential reproduction steps
    |-- Create minimal test case
    |-- Execute test case to verify failure
    |-- Record failure characteristics
    |-- If intermittent: establish failure rate
    |
PHASE 2: ISOLATION (5-15 min)
    |-- Identify entry point module
    |-- Trace call chain from entry to failure
    |-- Apply binary search on call chain
    |-- Identify the minimal set of modules involved
    |-- Check for environmental dependencies
    |-- Record isolation findings
    |
PHASE 3: HYPOTHESIS FORMATION (3-10 min)
    |-- Generate candidate root causes:
    |     - Race condition
    |     - Type mismatch
    |     - Missing error handling
    |     - Configuration issue
    |     - Dependency conflict
    |     - State corruption
    |-- Rank hypotheses by probability
    |-- Identify evidence needed per hypothesis
    |
PHASE 4: HYPOTHESIS TESTING (5-30 min)
    |-- For each hypothesis (highest probability first):
    |     - Identify confirming evidence
    |     - Identify disconfirming evidence
    |     - Run targeted tests
    |     - Analyze source code
    |     - Check git blame for recent changes
    |-- Confirm or eliminate each hypothesis
    |-- If all eliminated: expand hypothesis set
    |
PHASE 5: RESOLUTION (5-20 min)
    |-- Implement fix for confirmed root cause
    |-- Generate regression test(s)
    |-- Verify regression test fails before fix
    |-- Verify regression test passes after fix
    |-- Run full test suite to check for side effects
    |-- Document root cause and prevention strategy
```

## Investigation Report Format

```
DEBUG INVESTIGATION REPORT

Issue: [Original description]
Depth: [quick/standard/deep]
Duration: [total investigation time]
Status: RESOLVED / IN PROGRESS / NEEDS ESCALATION

REPRODUCTION:
  Steps: [numbered reproduction steps]
  Test Case: [minimal test file path]
  Failure Rate: [consistent / intermittent with rate]

ISOLATION:
  Root Module: [module where fault originates]
  Call Chain: [entry -> ... -> fault]
  Affected Modules: [list of impacted modules]

HYPOTHESES:
  1. [Hypothesis A] - CONFIRMED
     Evidence: [supporting evidence]
  2. [Hypothesis B] - ELIMINATED
     Reason: [disconfirming evidence]
  3. [Hypothesis C] - ELIMINATED
     Reason: [disconfirming evidence]

ROOT CAUSE:
  [Detailed root cause explanation]
  Location: [file:line]
  Category: [race condition / type mismatch / missing handling / etc.]

FIX:
  Change: [description of fix]
  Files Modified: [list of changed files]
  Regression Test: [test file path and name]
  Verification: Test fails before fix, passes after fix

PREVENTION:
  [Recommendations to prevent similar issues]
  Pattern: [anti-pattern to avoid]
  Quality Gate: [suggested gate addition if applicable]
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `debug-investigation-specialist` | Primary investigation agent |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation | Fix verification gates |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) | Investigation event tracking |
| Git Integration | `git blame`, `git log` for change history | Recent change analysis |
| Test Framework | ExUnit test generation | Regression test creation |
| Mandatory Regression Protocol | P0 enforcement | Every fix must have regression tests |

## Best Practices

1. **Describe Symptoms, Not Assumptions**: Provide the error message, behavior, or symptom rather than your theory about the cause. Let the investigation process form hypotheses objectively.

2. **Use Standard Depth for Most Issues**: Quick depth skips important isolation steps. Deep depth may be overkill for straightforward bugs. Standard depth covers the critical phases.

3. **Enable Auto-Fix for Well-Understood Patterns**: When the issue description clearly maps to a known bug pattern, use `--fix` to streamline the resolution process.

4. **Review the Full Report**: Even when the fix resolves the immediate issue, review the Prevention section for systemic improvements that could prevent entire categories of similar bugs.

5. **Check Investigation History**: Use `--history` to search for previous investigations of similar issues. Prior investigations may contain relevant insights or patterns.

6. **Scope for Performance**: For slow investigations, narrow the scope with `--scope` to focus the search on the most likely affected area.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `REPRODUCTION_FAILED` | Cannot reproduce the issue | Provide more specific details, check environment |
| `ISOLATION_TIMEOUT` | Isolation phase exceeded time limit | Narrow scope or use quick depth |
| `ALL_HYPOTHESES_ELIMINATED` | No hypothesis confirmed | Expand investigation, consider unknown factors |
| `FIX_REGRESSION` | Fix introduces new failures | Rollback, investigate side effects |
| `TEST_GENERATION_FAILED` | Cannot create regression test | Manual test creation required |

## Advanced Usage

### Integration with Coordinate Command

For complex multi-root-cause issues, combine with `/coordinate`:

```bash
# First investigate
/debug-investigation "Multiple test failures after storage refactoring" --depth deep

# Then coordinate a multi-agent fix
/coordinate "Fix identified root causes: type mismatch in adapter + missing pattern in client"
```

### Knowledge Base Building

Each investigation report contributes to the platform's debugging knowledge base. Over time, common patterns emerge:
- Race conditions in GenServer callbacks
- Type mismatches in protocol implementations
- Missing error handling in external API calls
- Configuration drift between environments

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Quick Investigation | 5-15 minutes | Targeted, single module |
| Standard Investigation | 15-45 minutes | Multi-module analysis |
| Deep Investigation | 1-3 hours | Platform-wide investigation |
| Regression Test Generation | 1-3 minutes | Automated test creation |
| Fix Verification | 30s - 5 min | Compile + test cycle |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Every bug fix must include regression tests. No fix is delivered without verification that the regression test fails before the fix and passes after. The Mandatory Regression Test Protocol is non-bypassable.
- **NO DOUBTS**: Full investigation through systematic hypothesis testing before action. Root causes are confirmed through evidence, not assumed through intuition.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/debug-types](/commands/debug-types/) - Troubleshoot [Dialyzer](/glossary/dialyzer/) type inference issues
- [/coordinate](/commands/coordinate/) - Orchestrate complex multi-agent operations
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)