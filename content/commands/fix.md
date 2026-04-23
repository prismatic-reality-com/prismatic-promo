+++
title = "/fix"
weight = 60
[extra]
category = "Development"
description = "Bug fix implementation with mandatory regression tests"
syntax = "/fix [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1268
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["fix", "implementation", "mandatory", "regression", "tests", "commands", "Development", "Prismatic Platform", "Analysis", "Credo"]
tags = ["commands", "development", "fix", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/fix - Prismatic Platform"
+++

## Overview

**/fix** is a production command in the **Development** category of the Prismatic Platform. It implements bug fixes with mandatory [regression tests](@/capabilities/regression-tests.md), ensuring that every bug fix is accompanied by tests that would have caught the bug and will prevent its recurrence. This command embodies the platform's absolute commitment to quality through the P0 Mandatory Regression Test Protocol.

Bug fixing without regression testing is a recipe for recurring failures. Studies consistently show that bugs fixed without corresponding tests recur at a rate of 15-30% within 6 months. The `/fix` command eliminates this recurrence by enforcing a strict protocol: identify the root cause, write a test that reproduces the bug, verify the test fails against unfixed code, apply the fix, verify the test passes, and report the complete fix-test cycle.

The [elixir-core-specialist](@/agents/elixir-core-specialist.md) agent executes this command, bringing deep expertise in Elixir/OTP patterns, Phoenix conventions, and the platform's architectural idioms. The agent follows a methodical debugging approach: reproduce the issue, isolate the root cause, develop the fix with minimal scope, create comprehensive regression tests, and validate through the full quality gate pipeline.

This command operates under the **L2+** authority level and has **high** usage frequency, reflecting its critical role in day-to-day development. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The fix system implements a structured debugging and fix pipeline with integrated regression test enforcement:

```
Bug Report --> Root Cause Analysis --> Regression Test Creation --> Fix Implementation
     |               |                        |                          |
 Reproduction    Isolation              Test Design                Code Change
 Verification    Analysis               Validation                 Minimal Scope
     |               |                        |                          |
 Bug Confirmed   Cause Found           Test Fails (unfixed)       Fix Applied
     \               |                        |                          /
      --> Fix Validation Pipeline --> Test Passes (fixed) --> Quality Gates
                     |
              Regression Report
```

**Root Cause Analysis**: The agent traces the bug from symptoms to root cause using a systematic isolation approach. This includes examining stack traces, reproducing with minimal inputs, bisecting recent changes, and analyzing the relevant module's logic path. The analysis identifies not just what is wrong but why it went wrong.

**Regression Test Creation**: Before the fix is applied, regression tests are created that demonstrate the bug. The tests are designed to fail with the current (buggy) code and pass with the fixed code. This verification protocol ensures that the tests are actually testing the bug rather than passing trivially.

**Fix Implementation**: The actual code change is applied with minimal scope -- fixing the identified root cause without introducing unnecessary changes. Minimal scope reduces the risk of unintended side effects and makes the fix easier to review and verify.

**Fix Validation Pipeline**: The complete fix (code change + regression tests) passes through the full quality gate pipeline: zero-warning compilation, full test suite execution, Credo static analysis, and Dialyzer type checking.

## Usage

### Basic Bug Fixing

```bash
# Fix a described bug
/fix "Login fails when email contains plus sign"

# Fix a bug in a specific module
/fix --module=PrismaticWeb.AuthController "Session not persisted after login"

# Fix based on a GitLab issue
/fix --issue=1259
```

### Targeted Fixes

```bash
# Fix a compilation warning
/fix --warning "unused variable in PrismaticPerimeter.Scanner"

# Fix a test failure
/fix --test="test/prismatic_api/dispatch_controller_test.exs:42"

# Fix a Dialyzer type error
/fix --dialyzer "PrismaticStorage.Ecto.Repo.get/2 returns nil but expected struct"

# Fix a Credo violation
/fix --credo "PrismaticAgents.Registry complexity exceeds threshold"
```

### Advanced Fix Operations

```bash
# Fix with explicit root cause hypothesis
/fix --hypothesis="Race condition in GenServer callback" \
  --module=PrismaticClaude.StackConversation

# Fix with specific test strategy
/fix --test-strategy=property-based \
  "Date parsing fails for edge case inputs"

# Fix with verbose debugging output
/fix --verbose --trace "Memory leak in long-running process"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--module` | string | auto-detected | Target module for the fix |
| `--issue` | string | none | GitLab issue number for context |
| `--warning` | string | none | Fix a specific compilation warning |
| `--test` | string | none | Fix a failing test (file:line format) |
| `--dialyzer` | string | none | Fix a Dialyzer type error |
| `--credo` | string | none | Fix a Credo violation |
| `--hypothesis` | string | none | Starting hypothesis for root cause |
| `--test-strategy` | string | unit | Regression test strategy (unit, integration, property-based) |
| `--verbose` | flag | false | Include detailed debugging trace |
| `--trace` | flag | false | Enable execution tracing for debugging |
| `--dry-run` | flag | false | Analyze and propose fix without applying |
| `--format` | string | text | Output format for fix report (text, json, markdown) |
| `--no-gate` | flag | false | Skip quality gate validation (FORBIDDEN in production) |
| `--scope` | string | minimal | Fix scope (minimal, moderate, comprehensive) |

## Execution Flow

The `/fix` command follows the Mandatory Regression Test Protocol -- a strict 6-phase pipeline:

1. **Bug Reproduction**: The bug is reproduced in a controlled environment. The agent creates a minimal reproduction case that isolates the failure condition. If the bug cannot be reproduced, the agent reports this and requests additional information.

2. **Root Cause Identification**: Systematic analysis traces the bug from symptoms to root cause. Techniques include stack trace analysis, binary search through recent commits (git bisect logic), module dependency analysis, and state inspection. The root cause is documented with evidence.

3. **Regression Test Creation**: Tests are written that demonstrate the bug. For unit tests, these directly invoke the buggy function with the failing inputs. For integration tests, these simulate the user workflow that triggers the bug. For property-based tests, these define the properties that the bug violates.

4. **Test Failure Verification**: The regression tests are executed against the current (unfixed) codebase. They MUST fail. If they pass, the tests are not actually testing the bug and must be revised. This step is non-negotiable.

5. **Fix Application**: The minimal code change that resolves the root cause is applied. The fix targets the root cause specifically -- no drive-by fixes, no unrelated improvements, no scope expansion.

6. **Validation & Reporting**: The regression tests are re-executed against the fixed code. They MUST pass. The full quality gate pipeline is executed. The mandatory regression test report is generated:

```
REGRESSION TEST REPORT
Bug Fixed: [brief description]
Root Cause: [what caused the bug]
Test Added: [test file path and test name]
Validation: Test fails before fix, passes after fix
Coverage: [what scenarios the test covers]
```

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Elixir-core-specialist agent drives the fix |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Full quality gate pipeline post-fix |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Fix [metrics](@/glossary/metrics.md), regression test counts |
| [Credo](@/glossary/credo.md) | Analysis | Static analysis validation of fix |
| [Dialyzer](@/glossary/dialyzer.md) | Analysis | Type safety validation of fix |
| Pre-commit Hooks | Enforcement | Regression test requirement at commit time |
| GitLab API | Tracking | Issue updates, fix commit linkage |
| [Quality DNA](@/glossary/quality-dna.md) | History | Fix history and regression prevention records |
| AIAD Registry | Discovery | Command specification and agent binding |

## Best Practices

**Always reproduce before fixing**: A fix without reproduction is speculation. The `/fix` command requires reproduction as its first phase because fixes applied without understanding the failure mode often address symptoms rather than causes.

**Write the test before the fix**: The regression test protocol is "test-first" by design. Writing the test before the fix ensures that the test actually tests the bug. Tests written after the fix risk passing trivially without truly exercising the failure condition.

**Minimize fix scope**: Every line of changed code is a potential source of new bugs. The `/fix` command enforces minimal scope by default -- fix the root cause and nothing else. Use [/refactor](@/commands/refactor.md) for broader improvements discovered during debugging.

**Use property-based testing for edge cases**: When a bug involves unexpected input combinations, property-based testing (via `--test-strategy=property-based`) is more effective than unit testing because it explores the input space systematically.

**Link fixes to GitLab issues**: Use `--issue` to automatically link the fix to its tracking issue. This creates a traceable chain from problem report through root cause analysis to fix verification.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `BUG_NOT_REPRODUCIBLE` | Bug cannot be reproduced in the development environment | Request additional reproduction steps; check environment differences |
| `ROOT_CAUSE_NOT_IDENTIFIED` | Analysis could not determine root cause | Expand investigation scope; use `--verbose --trace` for detailed debugging |
| `REGRESSION_TEST_PASSES_UNFIXED` | Test passes without the fix (not testing the bug) | Revise test to correctly exercise the failure condition |
| `REGRESSION_TEST_FAILS_FIXED` | Test fails even with the fix applied | Fix is incomplete; investigate remaining failure path |
| `QUALITY_GATE_FAILURE` | Fix introduces quality violations | Address quality issues while maintaining fix correctness |
| `SCOPE_EXCEEDED` | Fix changes extend beyond minimal scope | Split into fix commit + separate improvement commit |

## Advanced Usage

### Complex Debugging

```bash
# Fix with distributed tracing for multi-process bugs
/fix --trace --distributed "Message lost between GenServers"

# Fix with memory profiling for leak detection
/fix --memory-profile "Growing ETS table in production"

# Fix with concurrency analysis
/fix --concurrency-check "Race condition in concurrent updates"
```

### Batch Fix Operations

```bash
# Fix all compilation warnings in an application
/fix --batch-warnings --app=prismatic_perimeter

# Fix all Credo violations in a module
/fix --batch-credo --module=PrismaticApi.Scanner

# Fix all failing tests in a specific directory
/fix --batch-tests --dir=test/prismatic_storage_ecto/
```

### Post-Fix Analysis

```bash
# Verify fix did not introduce performance regression
/fix --post-analysis=performance --benchmark

# Verify fix coverage across related modules
/fix --post-analysis=coverage --related-modules
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Every bug fix MUST include regression tests. No exceptions. No bypass. The Mandatory Regression Test Protocol is enforced at P0 ABSOLUTE level. Bug fixes without regression tests are BLOCKED at commit time.
- **NO DOUBTS**: Full root cause investigation before applying fixes. No guessing, no "try this and see." The elixir-core-specialist agent traces every bug to its root cause with evidence before proposing a fix.

The `/fix` command's mandatory regression test protocol is the operational enforcement of the NO MERCY doctrine's "Zero tolerance for incomplete implementations" principle. A fix without a test is incomplete by definition.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/explain](@/commands/explain.md) - Code explanation and architecture walkthrough
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)