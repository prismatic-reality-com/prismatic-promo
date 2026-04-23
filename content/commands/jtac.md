+++
title = "/jtac"
weight = 210
[extra]
category = "Development"
description = "Joint terminal attack controller for precision code operations"
syntax = "/jtac [options]"
authority = "L3"
agent = "elixir-core-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1155
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["jtac", "Joint", "commands", "Development", "Prismatic Platform", "AIAD", "Verification", "Generate"]
tags = ["commands", "development", "jtac", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/jtac - Prismatic Platform"
+++

## Overview

**/jtac** is a production command in the **Development** category of the Prismatic Platform that implements a Joint Terminal Attack Controller (JTAC) paradigm for precision code operations. Drawing from military tactical doctrine where a JTAC coordinates air-to-ground precision strikes, this command orchestrates targeted, surgical code modifications across the platform's 99 umbrella applications with minimal collateral impact and maximum effectiveness.

The JTAC approach is particularly valuable in a large-scale Elixir umbrella project where a single change can cascade through dozens of dependent applications. Traditional development workflows often result in broad, imprecise modifications that introduce unexpected regressions. The `/jtac` command addresses this by providing precise targeting capabilities -- identifying the exact modules, functions, and lines that need modification, analyzing the blast radius of proposed changes, and coordinating the execution to minimize disruption.

This command operates under the **L3** authority level -- higher than standard development commands -- reflecting the elevated precision and impact of JTAC operations. It is executed by the `elixir-core-specialist` agent, the platform's most experienced Elixir developer agent with deep knowledge of OTP patterns, supervision trees, and cross-application dependencies. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

The command implements four operational phases: reconnaissance (target identification and analysis), planning (change strategy and blast radius assessment), execution (precise code modification), and verification (post-modification testing and validation). Each phase produces structured output that feeds into the next, creating an auditable chain of evidence for every code change.

## Architecture

The JTAC system coordinates multiple subsystems to achieve precision code modification.

```
+---------------------+     +-------------------+     +-------------------+
| Reconnaissance      | --> | Planning Engine   | --> | Execution Engine  |
| (Target Analysis)   |     | (Strategy + Blast)|     | (Precision Apply) |
+---------------------+     +-------------------+     +-------------------+
  |                                |                          |
  v                                v                          v
+---------------------+     +-------------------+     +-------------------+
| Dependency Mapper   |     | Risk Assessor     |     | Verification      |
| (Cross-App Graph)   |     | (Impact Analysis) |     | (Test + Validate) |
+---------------------+     +-------------------+     +-------------------+
         |                                                    |
         v                                                    v
+---------------------+                              +-------------------+
| Target Designator   |                              | After-Action Report|
| (Precise Location)  |                              | (Evidence Chain)  |
+---------------------+                              +-------------------+
```

The **Reconnaissance** subsystem analyzes the codebase to identify targets matching the specified criteria. The **Dependency Mapper** builds a cross-application dependency graph to understand how targets relate to the broader system. The **Target Designator** produces precise file, module, and function-level target specifications. The **Planning Engine** develops a modification strategy, while the **Risk Assessor** computes blast radius and risk scores. The **Execution Engine** applies changes with surgical precision, and the **Verification** subsystem validates that the changes achieve the intended effect without introducing regressions.

## Usage

### Reconnaissance Operations

```bash
# Identify targets matching a pattern
/jtac recon --pattern "Process.sleep" --scope apps/

# Analyze a specific module as a potential target
/jtac recon --module PrismaticWeb.LiveDashboard --depth 3

# Map dependencies of a target function
/jtac recon --function "PrismaticStorage.ETS.get/2" --callers

# Scan for specific anti-pattern targets
/jtac recon --anti-pattern "length() > 0" --scope all
```

### Planning Operations

```bash
# Plan a targeted modification with blast radius analysis
/jtac plan --target "apps/prismatic_web/lib/live/dashboard.ex:42" --change "replace"

# Plan a cross-application refactoring
/jtac plan --target-pattern "unsafe_map_access" --strategy incremental

# Preview blast radius of a proposed change
/jtac plan --target MyModule.function/2 --blast-radius

# Generate risk assessment for a planned operation
/jtac plan --target "lib/prismatic/api.ex" --risk-assess
```

### Execution Operations

```bash
# Execute a planned JTAC operation
/jtac execute --plan jtac-plan-001

# Execute with dry-run (preview changes only)
/jtac execute --plan jtac-plan-001 --dry-run

# Execute with automatic rollback on test failure
/jtac execute --plan jtac-plan-001 --auto-rollback

# Execute and immediately verify
/jtac execute --plan jtac-plan-001 --verify
```

### Verification Operations

```bash
# Verify a completed JTAC operation
/jtac verify --operation jtac-op-001

# Run targeted tests for affected modules
/jtac verify --operation jtac-op-001 --test-scope affected

# Generate after-action report
/jtac verify --operation jtac-op-001 --report
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| (subcommand) | string | required | Phase: `recon`, `plan`, `execute`, `verify` |
| `--pattern` | string | - | Code pattern to search for during reconnaissance |
| `--module` | string | - | Specific module to analyze |
| `--function` | string | - | Specific function to analyze (Module.function/arity) |
| `--anti-pattern` | string | - | Known anti-pattern to detect |
| `--scope` | string | all | Search scope: `all`, specific app name, or directory path |
| `--depth` | integer | 2 | Dependency analysis depth |
| `--callers` | boolean | false | Show callers of the target function |
| `--target` | string | - | Precise target specification (file:line or Module.function/arity) |
| `--target-pattern` | string | - | Pattern-based target specification |
| `--strategy` | string | surgical | Modification strategy: `surgical`, `incremental`, `sweep` |
| `--blast-radius` | boolean | false | Compute and display blast radius analysis |
| `--risk-assess` | boolean | false | Generate risk assessment for planned change |
| `--plan` | string | - | Plan identifier for execution |
| `--dry-run` | boolean | false | Preview changes without applying |
| `--auto-rollback` | boolean | true | Automatically rollback on test failure |
| `--verify` | boolean | false | Run verification immediately after execution |
| `--test-scope` | string | affected | Test scope: `affected`, `full`, `unit`, `integration` |
| `--report` | boolean | false | Generate after-action report |
| `--format` | string | text | Output format: `text`, `json`, `markdown` |
| `--verbose` | boolean | false | Show detailed operational information |

## Execution Flow

1. **Mission Briefing**: The command parses the subcommand and options, establishing the operational parameters. For `execute` operations, the referenced plan is loaded and validated.

2. **Reconnaissance** (for `recon` subcommand): The codebase is scanned using AST-based analysis for the specified pattern, anti-pattern, or module. Cross-application dependency analysis maps the target's relationships. Results are presented as a target dossier.

3. **Planning** (for `plan` subcommand): The planning engine develops a modification strategy based on the target specification. Blast radius is computed by traversing the dependency graph outward from the target. Risk assessment considers the target's centrality in the dependency graph, test coverage, and historical change frequency.

4. **Execution** (for `execute` subcommand): The plan is applied with precision. Each modification is atomic -- either all changes in the plan succeed or none do. If `--auto-rollback` is enabled, test failures trigger immediate rollback to the pre-modification state.

5. **Verification** (for `verify` subcommand): The verification engine runs targeted tests for all affected modules, checks compilation with `--warnings-as-errors`, runs [Credo](@/glossary/credo.md) checks on modified files, and validates that quality gates pass. An after-action report documents the operation's outcome.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `elixir-core-specialist` agent |
| [Quality Gates](@/glossary/quality-gates.md) | Verification | Post-operation quality validation |
| [Telemetry](@/glossary/telemetry.md) | Observability | Operation metrics and audit trail |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered via AIAD standard |
| Git | Version Control | Atomic commits with rollback support |
| [Credo](@/glossary/credo.md) | Quality | Modified file quality checks |
| Dialyzer | Type Safety | Type checking on modified modules |
| ExUnit | Testing | Targeted test execution for affected modules |

## Best Practices

**Always run reconnaissance before planning.** Understanding the target's dependency graph and blast radius before planning changes prevents unexpected cascading failures. Even for seemingly simple changes, the dependency analysis often reveals non-obvious impacts.

**Use the `surgical` strategy for isolated fixes** and `incremental` for broader pattern elimination. The `sweep` strategy is reserved for platform-wide anti-pattern removal and should only be used after thorough reconnaissance across the entire codebase.

**Enable auto-rollback for all production-impacting changes.** The cost of a rollback is minimal compared to the cost of a regression that reaches production. Manual rollback should only be used when you need to preserve partial progress from a partially successful operation.

**Generate after-action reports for significant operations.** These reports provide an auditable trail of what was changed, why, and what was verified. They are invaluable for post-incident analysis and knowledge transfer.

**Prefer precision over speed.** JTAC operations are not about making changes quickly; they are about making changes correctly. Take time in the reconnaissance and planning phases to ensure the execution is clean and complete.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Target not found | Lists similar targets with edit distance | Refine target specification |
| Circular dependency detected | Shows dependency cycle with path | Restructure to break cycle before proceeding |
| Blast radius exceeds threshold | Warns and requires explicit confirmation | Use `--strategy incremental` to reduce scope |
| Test failure during execution | Auto-rollback to pre-modification state | Investigate failure, refine plan, re-execute |
| Compilation error after modification | Auto-rollback with error details | Fix compilation issues in plan |
| Plan validation failure | Shows plan inconsistencies | Regenerate plan with corrected parameters |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. JTAC operations are atomic -- partial execution is never acceptable. All modified code must pass compilation, testing, linting, and quality gates. Rollback is automatic on any failure.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The reconnaissance and planning phases ensure complete understanding before execution. Every decision is documented in the after-action report. No change is applied without evidence that it achieves the intended effect.

The JTAC paradigm embodies the [NABLA Infinity](@/glossary/nabla-infinity.md) principle of exploring uncertainty thoroughly (reconnaissance) before committing to decisive action (execution), with the transition governed by confidence thresholds and trinity gate passage.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)