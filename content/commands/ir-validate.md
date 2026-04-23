+++
title = "/ir-validate"
weight = 400
[extra]
category = "Quality"
description = "Comprehensive validation of IR workflows with DAG analysis and type safety"
syntax = "/ir-validate [options]"
authority = "L2+"
agent = "ir-validator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1303
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-validate", "Comprehensive", "commands", "Quality", "Prismatic Platform", "Validation", "Type"]
tags = ["commands", "quality", "ir-validate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ir-validate - Prismatic Platform"
+++

## Overview

**/ir-validate** is a production command in the **Quality** category of the Prismatic Platform that performs comprehensive structural and semantic validation of Intermediate Representation (IR) workflow files. This command ensures that IR workflows are syntactically correct, structurally sound as directed acyclic graphs (DAGs), type-safe across all data flows, and compliant with the platform's IR specification before they enter the compilation pipeline.

Validation is the critical gate between IR authoring and PVM compilation. An invalid IR workflow that reaches the compiler can produce unpredictable behavior, compilation failures with cryptic error messages, or -- in the worst case -- silently incorrect bytecode. The `/ir-validate` command eliminates these risks by performing exhaustive checks at every level of the IR structure, from individual token syntax through global DAG topology analysis.

This command operates under the **L2+** authority level and is executed by the `ir-validator` agent, a specialist agent with deep knowledge of the IR specification, DAG theory, and type system semantics. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The validator agent applies formal verification techniques where practical, including cycle detection algorithms, type unification, and reachability analysis.

Unlike [/ir-lint](@/commands/ir-lint.md), which focuses on style and best practices, `/ir-validate` is concerned exclusively with correctness. A workflow that passes validation is guaranteed to be compilable and semantically well-defined. A workflow that fails validation will not compile correctly and must be corrected before proceeding.

## Architecture

The validation pipeline performs checks in dependency order, where each stage builds on the results of previous stages.

```
+-------------------+     +-------------------+     +-------------------+
| Syntax Validator  | --> | Structure Checker | --> | DAG Analyzer      |
| (Lexical + Parse) |     | (Schema + Shape)  |     | (Cycle + Reach)   |
+-------------------+     +-------------------+     +-------------------+
                                                            |
+-------------------+     +-------------------+             v
| Constraint Solver | <-- | Type Checker      | <-- +-------------------+
| (Satisfiability)  |     | (Unification)     |     | Reference Resolver|
+-------------------+     +-------------------+     | (Entity + Import) |
         |                                           +-------------------+
         v
+-------------------+
| Validation Report |
| (Structured Diag) |
+-------------------+
```

The **Syntax Validator** ensures lexical and grammatical correctness against the IR grammar. The **Structure Checker** validates the overall document structure against the IR schema, checking for required fields, valid value ranges, and proper nesting. The **DAG Analyzer** performs graph-theoretic analysis including cycle detection (using Kahn's algorithm), reachability analysis, and connected component identification. The **Reference Resolver** resolves all entity references (node names, edge targets, import paths) against the available namespace. The **Type Checker** performs bidirectional type inference and unification across all data flow edges. The **Constraint Solver** evaluates any declared constraints (resource limits, timing requirements, cardinality bounds) for satisfiability.

## Usage

### Basic Validation

```bash
# Validate all IR files in the current project
/ir-validate

# Validate a specific file
/ir-validate --file workflows/data_pipeline.ir

# Validate with detailed diagnostics
/ir-validate --verbose

# Validate and show only errors (skip warnings)
/ir-validate --severity error
```

### Targeted Validation Passes

```bash
# Run only syntax validation
/ir-validate --pass syntax

# Run syntax and structure validation
/ir-validate --pass syntax,structure

# Run full validation including type checking
/ir-validate --pass all

# Run only DAG analysis
/ir-validate --pass dag
```

### Type System Validation

```bash
# Validate with explicit type checking
/ir-validate --type-check strict

# Show inferred types for all edges
/ir-validate --show-types

# Validate with custom type definitions
/ir-validate --type-defs custom_types.ir

# Check type compatibility with a specific PVM target
/ir-validate --target-pvm v2
```

### CI/CD Integration

```bash
# Exit with non-zero code on validation failure
/ir-validate --fail-fast

# Output machine-readable validation report
/ir-validate --format json --output validation-results.json

# Validate against a specific IR specification version
/ir-validate --spec-version 3.2
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file` | string | all | Specific IR file or directory to validate |
| `--pass` | string | all | Validation passes: `syntax`, `structure`, `dag`, `types`, `references`, `constraints`, `all` |
| `--severity` | string | all | Filter diagnostics by severity: `error`, `warning`, `info` |
| `--type-check` | string | standard | Type checking strictness: `standard`, `strict`, `permissive` |
| `--show-types` | boolean | false | Display inferred types for all data flow edges |
| `--type-defs` | string | - | Additional type definition file for custom types |
| `--target-pvm` | string | latest | PVM target version for compatibility checking |
| `--spec-version` | string | latest | IR specification version to validate against |
| `--fail-fast` | boolean | false | Stop on first error rather than collecting all errors |
| `--format` | string | text | Output format: `text`, `json`, `sarif`, `junit` |
| `--output` | string | stdout | Output file for validation report |
| `--verbose` | boolean | false | Show detailed validation pass information |
| `--parallel` | boolean | true | Validate files in parallel |
| `--cache` | boolean | true | Use validation cache for unchanged files |
| `--max-errors` | integer | unlimited | Maximum errors to report before stopping |

## Validation Passes

| Pass | Checks Performed | Failure Impact |
|------|-----------------|----------------|
| **syntax** | Token validity, grammar rules, string escaping, numeric formats | File is unparseable |
| **structure** | Required fields, value ranges, nesting depth, schema conformance | Document is malformed |
| **dag** | Cycle detection, reachability, connected components, source/sink identification | Workflow is unexecutable |
| **references** | Node name resolution, edge target resolution, import resolution | References are broken |
| **types** | Type inference, type unification, coercion validity, generic instantiation | Data flow is unsafe |
| **constraints** | Resource limit satisfiability, timing feasibility, cardinality bounds | Constraints are unsatisfiable |

## Execution Flow

1. **File Discovery**: IR files are identified from the `--file` parameter or project directory scanning. The validation cache is consulted to skip files unchanged since their last successful validation.

2. **Syntax Validation**: Each file is lexed and parsed against the IR grammar. Syntax errors include precise source locations (line, column) and contextual snippets showing the error in surrounding code.

3. **Structure Validation**: The parsed document is checked against the IR schema. Missing required fields, invalid value types, and structural violations are reported.

4. **DAG Analysis**: The workflow graph is extracted and analyzed. Cycle detection uses Kahn's algorithm for O(V+E) performance. Reachability analysis identifies orphaned nodes and unreachable paths. Source (entry) and sink (exit) nodes are identified and verified.

5. **Reference Resolution**: All references to nodes, edges, imports, and external entities are resolved. Unresolved references are reported with suggestions based on edit distance matching.

6. **Type Checking**: The type checker performs bidirectional type inference across the DAG. Forward inference propagates types from sources through transformations. Backward inference propagates type constraints from sinks back through the graph. Type conflicts are reported with the full inference chain for debugging.

7. **Constraint Solving**: Declared constraints are evaluated for satisfiability. Constraint violations include the conflicting constraint pair and the values that cause the violation.

8. **Report Generation**: All diagnostics are aggregated and formatted for output. The report includes a summary section with pass/fail status for each validation pass and detailed diagnostics sorted by severity and file location.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `ir-validator` agent |
| [IR Linter](@/commands/ir-lint.md) | Complementary | Validation checks correctness; linting checks quality |
| [IR Generate](@/commands/ir-generate.md) | Post-Processing | Generated IR is automatically validated |
| PVM Compiler | Gate | Validation is required before compilation |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Validation results feed quality gate decisions |
| [Telemetry](@/glossary/telemetry.md) | Observability | Validation pass/fail rates tracked as platform metrics |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered via AIAD standard |

## Best Practices

**Run validation before every compilation.** The `/ir-validate` command is designed to be fast enough for continuous use. The incremental cache ensures that only changed files are re-validated, making the cost of routine validation negligible.

**Use `--type-check strict` for production workflows.** Strict type checking catches subtle type mismatches that standard mode permits through implicit coercion. Production workflows should be fully type-explicit to avoid runtime type errors.

**Enable `--show-types` when debugging type errors.** The type display shows the inferred type at every edge in the DAG, making it easy to trace where type mismatches originate.

**Validate against the target PVM version.** If your deployment targets a specific PVM version, use `--target-pvm` to catch compatibility issues before they reach the compilation stage.

**Address all validation warnings**, not just errors. Warnings indicate potential issues that may become errors in future IR specification versions or under different execution conditions.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Syntax error | Precise location with context snippet | Fix syntax in editor |
| Cycle detected | Shows cycle path with node names | Restructure DAG to break cycle |
| Unreachable node | Lists unreachable nodes and nearest connected component | Connect or remove orphaned nodes |
| Type mismatch | Shows expected vs actual types with inference chain | Add explicit type annotation or coercion |
| Unresolved reference | Shows reference and closest matching entities | Correct reference name |
| Unsatisfiable constraint | Shows conflicting constraints with values | Relax constraints or restructure workflow |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Validation is a blocking gate -- no IR workflow proceeds to compilation without passing all validation passes. There are no "soft" validation failures. Every diagnostic at error severity must be resolved.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The validator performs exhaustive analysis across all validation passes rather than stopping at the first error. Diagnostic messages include full context (source location, inference chains, constraint values) to eliminate guesswork in error resolution.

The command enforces the [Trinity Gate](@/glossary/trinity-gate.md) requirements for structural consistency (valid DAG), logical consistency (type safety), and formal necessity (constraint satisfiability).

## Related Commands

- [/ir-lint](@/commands/ir-lint.md) - Static analysis and code quality enforcement for IR workflows
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