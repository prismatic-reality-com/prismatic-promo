+++
title = "Understanding NO MERCY, NO DOUBTS"
weight = 3
[extra]
description = "Deep dive into the quality doctrine, enforcement levels, and violation protocols"
category = "beginner"
difficulty = "beginner"
duration = "40 min"
prerequisites = ["getting-started"]
glossary_terms = ["no-mercy", "no-doubts", "quality-dna", "cascade", "clean-run", "aiad"]
technologies = ["elixir", "credo", "dialyzer", "exunit"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1279
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Understanding", "MERCY", "DOUBTS", "Deep", "academy", "beginner", "Prismatic Platform", "CASCADE", "Every"]
tags = ["academy", "beginner", "understanding-no-mercy-no-doubts", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Understanding NO MERCY, NO DOUBTS - Prismatic Platform"
+++

## Overview

NO MERCY, NO DOUBTS is the foundational quality doctrine governing every line of code in the Prismatic Platform. It is not a suggestion or a guideline -- it is an absolute enforcement regime that blocks non-compliant code from entering the codebase. This guide explains what the doctrine demands, how it is enforced, and how to work within its constraints productively.

You will learn:

- The two pillars of the doctrine: NO MERCY (execution quality) and NO DOUBTS (decision quality)
- The 13 quality domains monitored by the [Quality Floor Guardian](@/glossary/quality-dna.md)
- How pre-commit hooks, CI gates, and automated scanning enforce compliance
- The violation protocol and how to recover from rejections
- How the [CASCADE](@/glossary/cascade.md) pattern eliminates entire categories of defects

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Basic understanding of Elixir compilation and testing
- Access to the platform repository with Git hooks installed

## Core Concepts

### NO MERCY: Execution Quality

The NO MERCY pillar defines what constitutes acceptable code. There are no exceptions, no deferrals, and no partial implementations:

| Requirement | What It Means |
|-------------|---------------|
| Zero Tolerance | No incomplete implementations reach any branch |
| Complete Execution | Finish entirely or do not deliver |
| Quality First | All quality gates must pass before merge |
| No Excuses | Fix immediately, never defer to "later" |
| 100% Test Coverage | All code has comprehensive tests |
| Zero Stubs/Mocks | No placeholders, TODOs, or FIXMEs in committed code |
| Production-Ready | Every line is production-ready from creation |
| Mandatory Regression Tests | Every bug fix includes tests that would have caught the bug |
| Clean Run | Zero runtime warnings, zero info/debug log noise |

The practical implication is that you cannot commit code that "mostly works." If a function handles three cases, all three must be implemented, tested, and documented before the commit.

### NO DOUBTS: Decision Quality

The NO DOUBTS pillar governs how decisions are made:

| Requirement | What It Means |
|-------------|---------------|
| Full Investigation | Understand the problem completely before writing code |
| Decisive Action | Once you decide on an approach, commit fully |
| Evidence-Based | Every claim is backed by tests, benchmarks, or verification |
| Verified Results | No unvalidated claims, no unchecked outputs |

This means you do not guess at solutions. You read the relevant code, understand the existing patterns, write your solution, and verify it with tests. The exploration phase uses [NABLA Infinity](@/glossary/nabla-infinity.md) principles; the execution phase uses NO MERCY enforcement.

### The 13 Quality Domains

The Quality Floor Guardian monitors these domains continuously:

```
Dialyzer          - Static type analysis (0 violations)
Credo             - Code style and complexity (0 violations)
Compilation       - Zero warnings across all apps (0 violations)
DateTime          - Microsecond precision enforcement (0 violations)
Guard Functions   - Proper guard clause usage (0 violations)
@impl Coverage    - All callbacks annotated (709 annotations)
Memory Safety     - No unbounded growth patterns (0 violations)
Performance       - No known anti-patterns (0 violations)
Regression        - Prevented regressions (0 violations)
Timing Patterns   - No Process.sleep in production code (0 violations)
TODO Management   - No TODOs in committed code (0 violations)
Typespec Coverage - All public functions have @spec (0 violations)
Unsafe Map Access - No bare map[key] without handling nil (0 violations)
```

Each domain has automated detection. When you introduce a violation in any domain, the pre-commit hook blocks your commit.

## Step-by-Step Guide

### Step 1: Understanding Quality Gates

Run the quality gates to see the current platform state:

```bash
mix quality.gates
```

The output shows each domain with its status. A passing platform looks like this:

```
Quality Gates Report
====================
Dialyzer:           PASS (0 violations)
Credo:              PASS (0 violations)
Compilation:        PASS (0 warnings)
DateTime Precision: PASS (0 violations)
...
Overall Score:      100/100 PERFECT
```

### Step 2: Experience a Violation

Create a deliberate violation to see the enforcement in action. Add this to any module:

```elixir
# This will trigger multiple violations:
def bad_function(map) do
  # TODO: implement this properly    <- TODO violation
  value = map[:key]                  <- Unsafe map access
  Process.sleep(1000)               <- Timing pattern violation
  value
end                                  # Missing @spec violation
```

Attempt to commit:

```bash
git add -A && git commit -m "test: deliberate violations"
```

The pre-commit hook will block with specific violation reports:

```
QUALITY GATE FAILURE
====================
TODO Management:     1 violation (line 3: TODO comment)
Unsafe Map Access:   1 violation (line 4: bare map[:key])
Timing Patterns:     1 violation (line 5: Process.sleep)
Typespec Coverage:   1 violation (bad_function/1 missing @spec)

COMMIT BLOCKED - Fix all violations before committing
```

### Step 3: Fix Violations Correctly

The correct version of the function above:

```elixir
@spec process_map_value(map()) :: {:ok, term()} | {:error, :missing_key}
def process_map_value(map) when is_map(map) do
  case Map.fetch(map, :key) do
    {:ok, value} -> {:ok, value}
    :error -> {:error, :missing_key}
  end
end
```

Notice the changes: a `@spec` annotation, a guard clause (`when is_map(map)`), `Map.fetch/2` instead of bare access, no `Process.sleep`, no TODO, and proper `{:ok, _}/{:error, _}` returns.

### Step 4: The CASCADE Pattern

CASCADE is a systematic pattern for eliminating entire categories of defects at once. Instead of fixing bugs one at a time, CASCADE identifies the root pattern and eliminates all instances across the codebase:

```bash
# Example: the Type Mismatch CASCADE eliminated 200+ potential type errors
# by enforcing @spec on all public functions and running Dialyzer

# The Dead Code CASCADE removed all unreachable code paths
# The Empty Check CASCADE replaced all `length(list) > 0` with pattern matching
```

When you encounter a pattern that could cause defects in multiple places, consider whether a CASCADE elimination is appropriate.

### Step 5: Regression Test Protocol

Every bug fix follows a mandatory protocol:

```
1. BEFORE fixing: identify root cause and failure mode
2. CREATE regression test(s) that would have caught the bug
3. VERIFY test fails with unfixed code
4. APPLY the fix
5. VERIFY test passes with fixed code
6. REPORT completion with summary
```

This is not optional. The commit hook checks for test files modified alongside source files when the commit message indicates a fix.

## Code Examples

### Correct Pattern: Map Access

```elixir
# WRONG: bare map access (unsafe, returns nil silently)
value = config[:timeout]

# CORRECT: explicit fetch with error handling
case Map.fetch(config, :timeout) do
  {:ok, timeout} -> {:ok, timeout}
  :error -> {:error, :missing_timeout}
end

# ALSO CORRECT: with default value when nil is acceptable
timeout = Map.get(config, :timeout, 5_000)
```

### Correct Pattern: Complete Function Clauses

```elixir
# WRONG: incomplete pattern matching
def handle_event("click", _params, socket) do
  {:noreply, socket}
end

# CORRECT: handle all expected events
def handle_event("click", params, socket) do
  {:noreply, handle_click(socket, params)}
end

def handle_event("submit", params, socket) do
  {:noreply, handle_submit(socket, params)}
end

def handle_event(event, _params, socket) do
  Logger.warning("Unhandled event: #{event}")
  {:noreply, socket}
end
```

### Correct Pattern: Comprehensive @spec

```elixir
@spec calculate_score(list(float()), keyword()) ::
        {:ok, %{score: float(), grade: atom()}} | {:error, :empty_input | :invalid_data}
def calculate_score([], _opts), do: {:error, :empty_input}

def calculate_score(values, opts) when is_list(values) do
  if Enum.all?(values, &is_number/1) do
    score = Enum.sum(values) / length(values)
    grade = score_to_grade(score, Keyword.get(opts, :scale, :default))
    {:ok, %{score: score, grade: grade}}
  else
    {:error, :invalid_data}
  end
end
```

## Common Pitfalls

**Trying to bypass hooks with `--no-verify`.** This is explicitly forbidden in the platform. The session discipline protocol treats `--no-verify` usage as an L4 violation requiring supreme review.

**Leaving TODOs "just for now."** There is no "just for now." If you need to track future work, create a GitLab issue. The codebase itself must be TODO-free at all times.

**Using `Process.sleep` in production code.** This is a timing pattern violation. Use `Process.send_after/3` for delayed messages or `:timer.apply_after/4` for delayed function calls. Tests may use `Process.sleep` sparingly when testing async behavior.

**Writing mocks instead of real implementations.** The NO MERCY doctrine prohibits stubs and mocks. If a function depends on external state, use dependency injection with real implementations. If you need a test double, implement a full in-memory adapter.

**Assuming Dialyzer will catch everything.** Dialyzer is one of 13 quality domains. It catches type errors but not logical errors, performance anti-patterns, or missing test coverage. All 13 domains must pass.

## Exercises

1. **Audit a module.** Pick any module in the platform and verify it complies with all 13 quality domains. Check for @spec on every public function, @impl on every callback, and proper map access patterns.

2. **Practice the regression test protocol.** Introduce a deliberate bug in a test environment, then follow the five-step protocol to fix it with a regression test.

3. **Run Credo strict.** Execute `mix credo --strict` and read every suggestion. Understand why each rule exists and how it prevents defects.

4. **Explore Quality DNA.** Read `.claude/quality-dna/current-state.json` and understand the metrics tracked across sessions. Identify which metrics contribute to the overall quality score.

## Summary

NO MERCY, NO DOUBTS is a binary doctrine: code either complies fully or it does not enter the codebase. The 13 quality domains are monitored by automated tools that block non-compliant commits. Every bug fix requires regression tests. Every function requires a typespec. Every callback requires `@impl true`. The result is a platform that maintains a perfect 100/100 quality score across 90+ applications.

Key takeaways:

- NO MERCY enforces execution quality: zero warnings, zero stubs, 100% test coverage
- NO DOUBTS enforces decision quality: full investigation before action, evidence-based claims
- 13 quality domains are monitored continuously by automated tools
- Pre-commit hooks block violations before they reach the repository
- CASCADE patterns eliminate entire categories of defects simultaneously
- The `--no-verify` flag is absolutely forbidden

## Practical Implementation

### In Prismatic Platform

The NO MERCY, NO DOUBTS doctrine is enforced through these applications:

- **prismatic_safety** (`apps/prismatic_safety/`) -- Contains `PrismaticSafety.QualityFloorGuardian` which monitors all 13 quality domains in real time. Also contains `PrismaticSafety.QualityDNA` for persistent quality state and `PrismaticSafety.SelfHealing` for 5-level autonomous error correction
- **prismatic_credo** (`apps/prismatic_credo/`) -- Custom Credo checks specific to Prismatic patterns, extending standard Credo with platform-specific anti-pattern detection
- **prismatic_quality_intelligence** (`apps/prismatic_quality_intelligence/`) -- Advanced quality analysis with pattern detection, CASCADE elimination tracking, and quality trend analysis
- **prismatic** (`apps/prismatic/`) -- Houses mix tasks in `lib/mix/tasks/quality/` including `mix quality.gates`, `mix quality.enforce_standard`, and `mix quality.standardize_mix`

### Code Examples from the Codebase

The Quality Floor Guardian operates at four enforcement levels:

```elixir
# Quality Floor Guardian enforcement levels
# 100-99%: OPTIMAL (monitor only)
# 98-99%: WARNING (alert + investigation)
# 95-98%: CRITICAL (auto-evolution trigger)
# <95%:   EMERGENCY (block commits + escalate)

# Check current quality state
{:ok, status} = PrismaticSafety.QualityFloorGuardian.status()
# => %{score: 100, domains: 13, violations: 0, level: :optimal}
```

Pre-commit hooks live in `.githooks/pre-commit` and enforce quality in ordered phases:

```bash
# Phase 1: Compilation (fast) - mix compile --warnings-as-errors --force
# Phase 2: Pattern scanning (instant) - TODO, Process.sleep, length() > 0
# Phase 3: Test execution (moderate) - mix test --only changed
# Phase 4: Credo (moderate) - mix credo --strict --only-changed
```

## See Also

### Related Applications
- [prismatic_safety](@/apps/prismatic-safety.md) -- Quality Floor Guardian and self-healing system
- [prismatic_credo](@/apps/prismatic-credo.md) -- Custom Credo checks for platform-specific patterns
- [prismatic_quality_intelligence](@/apps/prismatic-quality-intelligence.md) -- CASCADE pattern detection and quality trending

### Glossary
- [NO MERCY](@/glossary/no-mercy.md) -- Execution quality enforcement pillar
- [NO DOUBTS](@/glossary/no-doubts.md) -- Decision quality enforcement pillar
- [Quality DNA](@/glossary/quality-dna.md) -- Persistent quality metrics across sessions
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Autonomous quality monitoring agent
- [Quality Gates](@/glossary/quality-gates.md) -- Automated compliance checks blocking non-compliant code
- [CASCADE](@/glossary/cascade.md) -- Pattern for eliminating entire defect categories
- [Clean Run](@/glossary/clean-run.md) -- Zero warnings, zero debug logs in production
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- Compilation with --warnings-as-errors
- [Regression Test](@/glossary/regression-test.md) -- Mandatory test for every bug fix
- [Violation Protocol](@/glossary/violation-protocol.md) -- L1-L4 escalation for quality violations

### Architecture
- [Telemetry](@/architecture/telemetry.md) -- Quality metrics emitted via telemetry events

### Related Academy Topics
- [NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md) -- Epistemic framework behind NO DOUBTS
- [Development Workflow](@/academy/development-workflow.md) -- How quality gates integrate into CI/CD
- [The AIAD Standard](@/academy/aiad-standard.md) -- Policy specifications for quality enforcement
- [Self-Evolving Ecosystems](@/academy/evolution-patterns.md) -- How quality drives evolutionary fitness

## Next Steps

- [Applying NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md) -- understand the epistemic framework behind NO DOUBTS
- [Development Workflow & CI/CD](@/academy/development-workflow.md) -- see how quality gates integrate into the full pipeline
- [The AIAD Standard Explained](@/academy/aiad-standard.md) -- learn how policies enforce the doctrine across all components

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)