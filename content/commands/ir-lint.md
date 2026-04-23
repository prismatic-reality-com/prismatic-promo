+++
title = "/ir-lint"
weight = 390
[extra]
category = "Quality"
description = "Static analysis and code quality enforcement for IR workflows"
syntax = "/ir-lint [options]"
authority = "L2+"
agent = "ir-linter"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1300
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-lint", "Static", "commands", "Quality", "Prismatic Platform", "Auto", "Lint", "AIAD"]
tags = ["commands", "quality", "ir-lint", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ir-lint - Prismatic Platform"
+++

## Overview

**/ir-lint** is a production command in the **Quality** category of the Prismatic Platform that performs static analysis and code quality enforcement on Intermediate Representation (IR) workflow files. Unlike [/ir-validate](@/commands/ir-validate.md), which checks structural correctness and type safety, `/ir-lint` focuses on stylistic consistency, idiomatic patterns, performance anti-patterns, and maintainability concerns that do not affect correctness but significantly impact long-term code quality.

Static analysis of IR workflows is essential in the Prismatic Platform because IR serves as the primary specification language for agent workflows, data pipelines, and operational automation. As the IR codebase grows, maintaining consistent style and avoiding anti-patterns becomes increasingly important for developer productivity, code review efficiency, and onboarding speed. The `/ir-lint` command codifies the platform's IR coding standards into an automated enforcement mechanism.

This command operates under the **L2+** authority level and is executed by the `ir-linter` agent, a specialist agent focused exclusively on IR code quality. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The linter agent maintains an evolving rule set that incorporates lessons learned from production incidents, performance regressions, and code review feedback.

The linter operates at multiple levels of analysis: lexical (naming conventions, formatting), structural (DAG patterns, node organization), semantic (redundant operations, dead paths), and performance (inefficient patterns, missing parallelization opportunities). Each rule is categorized by severity (error, warning, info) and can be individually enabled, disabled, or configured through project-level and file-level configuration.

## Architecture

The linting pipeline processes IR files through a series of analysis passes, each targeting a specific category of quality concerns.

```
+-------------------+     +--------------------+     +---------------------+
| IR Parser         | --> | AST Construction   | --> | Rule Engine         |
| (Token Stream)    |     | (Annotated AST)    |     | (Multi-Pass Analysis)|
+-------------------+     +--------------------+     +---------------------+
                                                              |
                          +--------------------+              v
                          | Configuration      | --> +---------------------+
                          | (.ir-lint.exs)     |     | Diagnostic Emitter  |
                          +--------------------+     | (Severity + Fix)    |
                                                     +---------------------+
                                                              |
                                                              v
                                                     +---------------------+
                                                     | Auto-Fix Engine     |
                                                     | (Safe Transforms)   |
                                                     +---------------------+
```

The **IR Parser** tokenizes the input and produces a token stream that feeds into **AST Construction**, which builds an annotated abstract syntax tree with source location information for precise diagnostic reporting. The **Rule Engine** executes multiple analysis passes over the AST, each pass evaluating a category of rules. The **Configuration** system allows project-level and file-level rule customization. The **Diagnostic Emitter** produces structured diagnostics with severity levels, source locations, and suggested fixes. The **Auto-Fix Engine** can automatically apply safe transformations for a subset of rules.

## Usage

### Basic Linting

```bash
# Lint all IR files in the current project
/ir-lint

# Lint a specific file
/ir-lint --file workflows/data_pipeline.ir

# Lint with strict mode (warnings become errors)
/ir-lint --strict

# Lint and show only errors
/ir-lint --severity error
```

### Auto-Fix Mode

```bash
# Lint and auto-fix safe issues
/ir-lint --fix

# Preview auto-fix changes without applying
/ir-lint --fix --dry-run

# Auto-fix specific rule categories only
/ir-lint --fix --rules naming,formatting
```

### Configuration and Rules

```bash
# List all available lint rules with descriptions
/ir-lint --list-rules

# Lint with specific rules enabled
/ir-lint --rules naming,dead-path,redundant-node

# Lint with specific rules disabled
/ir-lint --disable unused-variable,line-length

# Initialize project lint configuration
/ir-lint --init-config
```

### CI/CD Integration

```bash
# Exit with non-zero code if any errors found (for CI)
/ir-lint --fail-on error

# Output in machine-readable format
/ir-lint --format json --output lint-results.json

# Generate SARIF format for GitHub code scanning
/ir-lint --format sarif --output lint-results.sarif
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file` | string | all | Specific IR file or directory to lint |
| `--strict` | boolean | false | Treat warnings as errors |
| `--severity` | string | all | Filter by severity: `error`, `warning`, `info` |
| `--fix` | boolean | false | Automatically fix safe issues |
| `--dry-run` | boolean | false | Preview fixes without applying |
| `--rules` | string | all | Comma-separated list of rules or categories to enable |
| `--disable` | string | none | Comma-separated list of rules to disable |
| `--list-rules` | boolean | false | List all available rules with descriptions |
| `--init-config` | boolean | false | Generate a `.ir-lint.exs` configuration file |
| `--config` | string | .ir-lint.exs | Path to lint configuration file |
| `--format` | string | text | Output format: `text`, `json`, `sarif`, `checkstyle` |
| `--output` | string | stdout | Output file for lint results |
| `--fail-on` | string | error | Exit non-zero on: `error`, `warning`, `info` |
| `--max-issues` | integer | unlimited | Maximum issues to report before stopping |
| `--parallel` | boolean | true | Lint files in parallel for performance |
| `--cache` | boolean | true | Use incremental linting cache for unchanged files |
| `--verbose` | boolean | false | Show rule evaluation details |

## Lint Rule Categories

| Category | Rules | Description |
|----------|-------|-------------|
| **naming** | 8 | Node naming conventions, edge labels, variable names |
| **formatting** | 6 | Indentation, line length, whitespace consistency |
| **structure** | 10 | DAG topology patterns, node ordering, grouping |
| **dead-code** | 5 | Unreachable nodes, unused edges, dead paths |
| **redundancy** | 4 | Redundant operations, duplicate transformations, no-op nodes |
| **performance** | 7 | Missing parallelization, inefficient patterns, over-serialization |
| **error-handling** | 5 | Missing error handlers, catch-all patterns, swallowed errors |
| **documentation** | 4 | Missing node descriptions, undocumented parameters, changelog entries |
| **security** | 3 | Unsafe data handling, credential exposure, injection risks |
| **complexity** | 4 | Excessive nesting, overly complex conditions, fan-out limits |

## Execution Flow

1. **Configuration Resolution**: The linter loads configuration from (in priority order) command-line flags, `.ir-lint.exs` project config, and built-in defaults. File-level `# ir-lint:disable` comments override project-level settings.

2. **File Discovery**: IR files are discovered based on the `--file` parameter or by scanning project directories. The incremental cache is consulted to skip files that have not changed since the last lint run.

3. **Parallel Parsing**: All discovered files are parsed in parallel (unless `--parallel false`), building annotated ASTs with full source location information for each file.

4. **Rule Compilation**: The active rule set is compiled from the resolved configuration, filtering by enabled categories and individual rule overrides.

5. **Multi-Pass Analysis**: Each file's AST is processed through the rule engine in category order: naming, formatting, structure, dead-code, redundancy, performance, error-handling, documentation, security, complexity. Each pass produces a set of diagnostics.

6. **Cross-File Analysis**: After per-file analysis, cross-file rules are evaluated. These detect issues like inconsistent naming across related workflows, duplicate workflow definitions, and broken cross-references.

7. **Diagnostic Aggregation**: All diagnostics are aggregated, deduplicated, and sorted by severity and file location.

8. **Auto-Fix Application** (if `--fix`): Safe auto-fixes are applied to the source files. Each fix is verified to not change the semantic meaning of the IR by re-parsing and comparing ASTs before and after the transformation.

9. **Report Generation**: Final diagnostics are formatted and output in the requested format.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `ir-linter` agent |
| [IR Validator](@/commands/ir-validate.md) | Complementary | Lint checks complement validation checks |
| [IR Generate](@/commands/ir-generate.md) | Post-Processing | Generated IR is automatically linted |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Lint results feed into quality gate pass/fail decisions |
| [Telemetry](@/glossary/telemetry.md) | Observability | Lint run metrics and issue trends tracked |
| [Credo](@/glossary/credo.md) | Analogous | IR linter follows similar patterns to Elixir's Credo |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered via AIAD standard |
| CI/CD Pipeline | Automation | Lint checks enforced in merge request gates |

## Best Practices

**Run linting as part of your development workflow.** Configure your editor or IDE to run `/ir-lint` on save, providing immediate feedback on style violations. The incremental cache ensures that re-linting after small changes is nearly instantaneous.

**Start with the default rule set** and customize only when you have a documented reason. The default rules represent the platform's accumulated best practices. Disabling rules without understanding their rationale often leads to the exact problems the rules were designed to prevent.

**Use `--fix` regularly** to keep your codebase clean. Auto-fixable issues (primarily naming and formatting) account for approximately 60% of all lint diagnostics. Running `--fix` periodically reduces noise and allows you to focus on the more substantive structural and performance issues.

**Treat lint warnings seriously in code review.** While warnings do not block CI by default, they often indicate patterns that will become problems as the workflow evolves. Address warnings proactively rather than accumulating lint debt.

**Configure severity appropriately for your project.** Security and error-handling rules should always be at error severity. Formatting rules may be appropriate at warning or info severity depending on your team's preferences.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| IR parse error | Reports parse error and skips file | Fix syntax errors with [/ir-validate](@/commands/ir-validate.md) first |
| Invalid configuration | Reports config error with valid options | Fix `.ir-lint.exs` or use `--init-config` |
| Auto-fix conflict | Skips conflicting fix with explanation | Apply fix manually |
| Cache corruption | Clears cache and performs full re-lint | Automatic recovery |
| Unknown rule name | Reports available rules matching prefix | Use `--list-rules` to find correct name |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The linter enforces the platform's IR coding standards without exception. In `--strict` mode, even minor style inconsistencies prevent pipeline progression. Auto-fix transforms are verified to preserve semantic correctness -- no "fix" is permitted to change program behavior.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every lint rule is documented with rationale, examples of violations, and examples of compliant code. Diagnostic messages include actionable fix suggestions. The `--verbose` flag traces rule evaluation logic for full transparency.

## Related Commands

- [/ir-validate](@/commands/ir-validate.md) - Comprehensive validation of IR workflows with DAG analysis and type safety
- [/ir-generate](@/commands/ir-generate.md) - Generate IR workflows from natural language descriptions
- [/ir-benchmark](@/commands/ir-benchmark.md) - Comprehensive performance benchmarking with Benchee integration for IR workflows
- [/ir-examples](@/commands/ir-examples.md) - Interactive examples, templates and learning resources for IR workflows
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)