+++
title = "/refactor"
weight = 80
[extra]
category = "Development"
description = "Safe refactoring with zero-regression guarantee"
syntax = "/refactor [options]"
authority = "L3"
agent = "refactoring-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1164
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["refactor", "Safe", "commands", "Development", "Prismatic Platform", "Step", "Refactoring", "Credo"]
tags = ["commands", "development", "refactor", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/refactor - Prismatic Platform"
+++

## Overview

**/refactor** is a production command in the **Development** category of the Prismatic Platform that performs safe, systematic code refactoring with a zero-regression guarantee. This command automates the complex process of restructuring existing code without changing its external behavior, ensuring that every transformation preserves the system's functional correctness through comprehensive test verification at each step.

Refactoring in a platform of this scale -- over 90 umbrella applications, 6,652 Elixir source files, and approximately 2.8 million lines of code -- demands a fundamentally different approach than manual restructuring. A single rename operation can ripple through dozens of modules across multiple applications. A pattern change applied inconsistently creates subtle behavioral divergences that may not manifest until production. The `/refactor` command addresses these challenges through automated change propagation, incremental verification, and rollback capability at every transformation step.

The zero-regression guarantee is not aspirational but mechanically enforced. Before applying any transformation, the refactoring engine captures the complete test baseline. After each atomic transformation step, the full test suite executes. If any test fails, the transformation is automatically rolled back and the failure is reported with precise context. This approach means that refactoring operations either complete successfully with verified behavioral equivalence or leave the codebase in its original, known-good state.

This command operates under the **L3** authority level and is executed by the `refactoring-specialist` agent, which maintains a comprehensive library of safe refactoring patterns tailored to Elixir/OTP conventions. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The refactoring engine follows a transaction-based architecture where each refactoring operation is decomposed into atomic steps that can be individually verified and rolled back.

```
Refactoring Request
    |
    v
[Analysis Phase]
    +---> Impact Analysis (modules affected, test coverage)
    +---> Risk Assessment (coupling, blast radius)
    +---> Pattern Matching (identify applicable refactoring)
    |
    v
[Baseline Capture]
    +---> Test Suite Snapshot
    +---> Quality Metrics Snapshot
    +---> Git Checkpoint
    |
    v
[Transformation Phase]
    +---> Step 1: Apply atomic transformation
    |     +---> Verify: compile + test
    |     +---> Rollback on failure
    +---> Step 2: Apply next transformation
    |     +---> Verify: compile + test
    |     +---> Rollback on failure
    +---> Step N: Final transformation
    |
    v
[Validation Phase]
    +---> Full test suite execution
    +---> Quality gate verification
    +---> Regression check (25 custom Credo checks)
    |
    v
Refactoring Complete (or Rolled Back)
```

The analysis phase leverages the [/reconnaissance](/commands/reconnaissance/) command's structural analysis to determine the blast radius of the proposed refactoring and identify all affected modules, tests, and downstream dependencies.

## Usage

```bash
# Refactor a specific module with automatic pattern detection
/refactor --target=PrismaticPerimeter.SecurityRating

# Extract a module from an existing monolithic module
/refactor --extract-module --from=PrismaticWeb.Router --to=PrismaticWeb.PerimeterRouter

# Rename a function across all callers
/refactor --rename-function --module=Prismatic --from=old_name --to=new_name

# Apply a specific refactoring pattern
/refactor --pattern=extract-behaviour --target=PrismaticStorage

# Refactor with dry-run preview
/refactor --dry-run --target=PrismaticAgents.Registry

# Inline a single-use helper function
/refactor --inline-function --module=PrismaticWeb.Helpers --function=format_date

# Convert callback-based code to pipeline style
/refactor --pattern=pipeline-conversion --target=PrismaticPerimeter.Scanner

# Refactor with explicit rollback checkpoint
/refactor --checkpoint=pre-refactor --target=PrismaticStorage.Ecto
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | required | Target module or application for refactoring |
| `--pattern` | string | auto | Refactoring pattern to apply (auto-detected if omitted) |
| `--dry-run` | boolean | false | Preview changes without applying them |
| `--extract-module` | boolean | false | Extract functionality into a new module |
| `--rename-function` | boolean | false | Rename a function across all call sites |
| `--inline-function` | boolean | false | Inline a function at all call sites |
| `--from` | string | - | Source identifier (module, function, or path) |
| `--to` | string | - | Target identifier for the transformation |
| `--module` | string | - | Module context for function-level operations |
| `--function` | string | - | Function name for inline operations |
| `--checkpoint` | string | auto | Git checkpoint name for rollback |
| `--skip-tests` | boolean | false | Skip incremental test verification (NOT recommended) |
| `--scope` | enum | module | Refactoring scope: `function`, `module`, `app`, `cross-app` |
| `--verify-coverage` | boolean | true | Verify test coverage is maintained post-refactoring |

## Execution Flow

The refactoring command follows a carefully orchestrated execution flow designed to maximize safety while minimizing the total time required for complex multi-step transformations.

**Step 1 - Impact Analysis**: The engine analyzes the proposed refactoring to determine its scope and impact. This includes identifying all modules that reference the target, computing the transitive dependency closure, and mapping the affected test files. The impact analysis report shows exactly which files will change and which tests will need to pass.

**Step 2 - Baseline Capture**: Before any changes are made, the current state is captured as a baseline. This includes running the complete test suite (or the affected subset for scoped operations), recording quality metrics, and creating a git checkpoint. The baseline serves as the rollback target if any transformation step fails.

**Step 3 - Transformation Planning**: The refactoring engine decomposes the requested change into the smallest possible atomic steps. For example, a module extraction might decompose into: create new module file, move function definitions, update caller references, update tests, update documentation.

**Step 4 - Incremental Execution**: Each atomic step executes in sequence. After each step, the compiler verifies that the codebase compiles without warnings, and the affected test subset runs to verify behavioral equivalence. If any verification fails, the step is rolled back and the operator receives a detailed failure report.

**Step 5 - Full Verification**: After all atomic steps complete successfully, the full verification suite runs. This includes the complete test suite, all 25 custom [Credo](/glossary/credo/) regression checks, zero-warning compilation, and quality gate verification. Only when all verifications pass is the refactoring considered complete.

**Step 6 - Cleanup**: Temporary files, intermediate checkpoints, and analysis artifacts are cleaned up. The final state is validated against the baseline to confirm behavioral equivalence.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `refactoring-specialist` | Expert in safe Elixir/OTP refactoring patterns |
| [/reconnaissance](/commands/reconnaissance/) | Pre-refactoring analysis | Provides structural context for impact assessment |
| [/test](/commands/test/) | Verification engine | Test suite execution at each transformation step |
| [/regression-check](/commands/regression-check/) | Post-refactoring validation | 25 custom Credo checks verify no regression |
| [Quality Gates](/glossary/quality-gates/) | Final validation | All quality domains must maintain perfect scores |
| [Git Trees](/glossary/git-trees/) | File discovery | Optimized identification of affected files |
| [Telemetry](/glossary/telemetry/) | Operation tracking | All refactoring steps logged with timing data |

## Best Practices

Always run `--dry-run` before executing a cross-application refactoring. Cross-app refactorings have the largest blast radius and the highest potential for unexpected consequences. The dry-run preview reveals the complete list of affected files and the planned transformation steps, enabling informed review before any changes are made.

Prefer small, focused refactorings over large-scale restructurings. A sequence of three small, individually verified refactorings is safer and more maintainable than a single large refactoring that changes dozens of files simultaneously. Each small refactoring produces a clean, committable state that can be reviewed independently.

Use the `--pattern` flag explicitly when you know the specific refactoring pattern you want to apply. While automatic pattern detection is convenient, explicit specification ensures predictable behavior and clearer documentation of intent.

Ensure comprehensive test coverage before refactoring. The zero-regression guarantee depends entirely on the test suite's ability to detect behavioral changes. If the target module has insufficient test coverage, consider writing additional tests before initiating the refactoring.

## Error Handling

The refactoring engine handles errors at multiple levels with automatic rollback as the default response to any failure.

```
REFACTORING ROLLBACK REPORT
Operation: extract-module PrismaticWeb.Router -> PrismaticWeb.PerimeterRouter
Failed Step: Step 3 of 5 (Update caller references)
Failure: Compilation error in apps/prismatic_api/lib/prismatic_api/router.ex:42
Details: undefined function perimeter_routes/0
Root Cause: Router macro expansion creates implicit function references
            not captured by static analysis
Rollback: Complete - codebase restored to pre-refactoring state
Checkpoint: pre-refactor-20260131-142305
Suggestion: Use --pattern=extract-plug-router for Phoenix router extraction
```

Compilation failures, test failures, quality gate violations, and Credo regressions all trigger automatic rollback. The rollback is always to the baseline checkpoint, ensuring that partial transformations never remain in the codebase.

## Advanced Usage

Advanced refactoring operations support pattern composition, custom transformation rules, and integration with the formal verification subsystem.

```bash
# Chain multiple refactorings in a pipeline
/refactor --pipeline="extract-behaviour,rename-module,update-supervision-tree" --target=PrismaticStorage

# Refactoring with formal verification of equivalence
/refactor --formal-verify --target=PrismaticPerimeter.RiskEngine

# Custom transformation rule from AIAD pattern library
/refactor --custom-rule=.aiad/patterns/genserver-to-agent.pattern.md --target=MyModule

# Cross-application refactoring with dependency order
/refactor --scope=cross-app --dependency-order --target=PrismaticStorageCore.Traits
```

The `--formal-verify` flag engages the [Lean4](/commands/lean/) formal verification engine to prove behavioral equivalence between the original and refactored code. This provides the strongest possible guarantee that the refactoring preserves semantics, going beyond test-based verification to mathematical proof.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Refactoring either completes with all verifications passing or rolls back completely. There is no middle ground, no partial completion, and no "fix it later" state.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The impact analysis phase ensures complete understanding before any transformation begins. Every transformation step is verified with evidence (passing tests), not assumptions.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/reconnaissance](/commands/reconnaissance/) - Codebase reconnaissance and structure analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)