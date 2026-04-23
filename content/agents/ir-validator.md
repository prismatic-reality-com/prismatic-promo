+++
title = "ir-validator"
weight = 219
[extra]
domain = "quality"
level = "L3"
description = "Comprehensive validation and verification of Information Retrieval (IR) workflows with DAG analysis and type safety enforcement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "genstage", "ets"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-validator", "Comprehensive", "Information", "Retrieval", "agents", "agent", "Prismatic Platform", "Type", "Validation"]
tags = ["agents", "agent", "ir-validator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ir-validator - Prismatic Platform"
+++

## Overview

The ir-validator is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the quality domain of the Prismatic Platform. It performs comprehensive structural validation and verification of Information Retrieval (IR) workflow definitions, ensuring that every workflow entering the execution pipeline is structurally sound, type-safe, and semantically consistent. While the [ir-linter](@/agents/ir-linter.md) evaluates workflow quality (how well-designed a workflow is), the ir-validator determines correctness (whether a workflow can execute without errors), making it a critical gate in the IR compilation pipeline.

Built on the [AIAD](@/glossary/aiad.md) standard and enforcing the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, the ir-validator implements a zero-tolerance policy for structural defects. No workflow with validation errors proceeds to the [PVM](@/glossary/pvm.md) execution runtime. This strict enforcement prevents runtime failures that would be far more costly to diagnose and recover from, implementing the software engineering principle of failing fast and failing loud at the earliest possible point in the pipeline.

## Validation Architecture

The ir-validator's architecture implements a multi-layer validation strategy where each layer addresses a different category of correctness concern. The layers are ordered from least expensive to most expensive, enabling early rejection of clearly invalid workflows without incurring the cost of deeper analysis.

The syntactic layer verifies that workflow definitions conform to the IR intermediate representation schema. This includes JSON schema validation, required field presence checks, and value range constraints. Syntactically invalid workflows are rejected immediately with specific error locations and schema violation descriptions.

The structural layer analyzes workflow topology as a directed graph. It verifies that the graph is acyclic (no circular dependencies between stages), connected (no orphaned stages or disconnected subgraphs), and properly sourced (at least one source stage that produces data without requiring input). Structural validation also checks that every non-source stage has at least one input edge and every non-sink stage has at least one output edge consumed by a downstream stage.

The type layer performs type inference and checking across the workflow graph. Starting from source stages with known output schemas, types are propagated forward through the graph, with each stage's output type computed from its input types and transformation semantics. Type mismatches at stage boundaries -- where a consuming stage expects a type incompatible with what the producing stage emits -- are flagged as type errors with detailed explanations of the mismatch.

The semantic layer verifies higher-level correctness properties. It checks that filter predicates reference fields that exist in the data flowing through them, that aggregation operations are applied to compatible data types, that join operations have matching key types, and that output formatting stages receive data in the expected structure. Semantic validation catches errors that are syntactically and structurally valid but logically meaningless.

## Key Capabilities

- **DAG validity analysis** -- Verifies that IR workflow graphs form valid directed acyclic graphs without cycles, disconnected components, or unreachable stages
- **Type safety enforcement** -- Performs forward type propagation through workflow graphs, detecting type mismatches at stage boundaries and ensuring end-to-end type consistency
- **Schema compatibility checking** -- Validates that data schemas at stage boundaries are compatible, including handling of optional fields, nullable values, and schema evolution patterns
- **Predicate field validation** -- Verifies that filter predicates, sort expressions, and aggregation operations reference fields that exist in the data schema at the point where they are applied
- **Parameter constraint validation** -- Checks that stage configuration parameters fall within their declared valid ranges and satisfy declared interdependencies between parameters
- **[Property-based testing](@/glossary/property-based-testing.md) support** -- Generates randomized workflow inputs for property-based validation of workflow invariants, complementing deterministic checks with stochastic verification
- **[Quality gate integration](@/capabilities/quality-gates.md)** with zero-error deployment gates
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for validation performance and error pattern monitoring

## Validation Process

The validation process accepts an IR workflow definition (typically annotated with linter findings from the [ir-linter](@/agents/ir-linter.md)) and produces a validation report that either certifies the workflow as valid or enumerates all discovered validation errors. The process is designed to be comprehensive rather than fail-fast: all validation layers execute to completion regardless of earlier failures, ensuring that users receive a complete picture of all validation issues in a single pass rather than discovering them incrementally across multiple validation attempts.

Each validation finding includes a severity level (error or warning), a precise location within the workflow definition, a human-readable description of the issue, and where applicable a suggested remediation. Error-level findings prevent workflow execution. Warning-level findings indicate potential issues that do not prevent execution but may cause unexpected behavior or degraded performance.

The validation report is structured as a machine-readable document that downstream tools can process programmatically. This enables integration with CI/CD pipelines where validation serves as an automated quality gate, and with IDE plugins that can display validation findings inline with the workflow definition.

## Type System

The ir-validator implements a structural type system for IR workflows that balances expressiveness with decidability. Types include primitive types (string, integer, float, boolean, datetime), collection types (list, map, set), record types (named fields with typed values), union types (one of several possible types), and optional types (a value or null). Type compatibility is determined by structural subtyping: a type A is compatible with type B if A provides at least all the fields and capabilities that B requires.

Type inference propagates types forward through the workflow DAG, computing output types from input types at each stage. For stages with polymorphic behavior (such as a map stage that transforms records according to a user-defined expression), type inference applies the transformation expression to the input type to derive the output type. This inference is decidable for the expression language supported by IR workflow specifications.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the ir-validator to access the IR stage library for type and parameter constraint reference, publish validation results to the quality tracking system, and block workflow deployment when validation errors are detected.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Quality Gates](@/glossary/quality-gates.md) | Validation serves as a mandatory quality gate before PVM execution |
| Prismatic Safety | [Quality floor guardian](@/glossary/quality-floor-guardian.md) integration for validation coverage tracking |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Automated validation in CI/CD pipelines |
| IR Stage Library | Reference for stage type signatures and parameter constraints |
| [ETS](@/glossary/ets.md) Cache | In-memory caching of stage type signatures for fast validation |
| Prismatic Telemetry | Validation latency and error pattern [metrics](@/glossary/metrics.md) |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ir validate <workflow_id>` | Run comprehensive validation on a workflow | L2+ |
| `/ir validate --strict <workflow_id>` | Run validation with warnings promoted to errors | L3+ |
| `/ir validate --types-only <workflow_id>` | Run type checking layer only | L2+ |
| `/ir validate --report <workflow_id>` | Generate detailed validation report with remediation suggestions | L3+ |

## Coordination with Quality Agents

| Agent | Relationship |
|-------|-------------|
| [**ir-generator**](@/agents/ir-generator.md) (L3) | Produces workflow definitions that the validator checks for correctness |
| [**ir-linter**](@/agents/ir-linter.md) (L3) | Provides quality annotations that complement the validator's correctness checks |
| [**ir-pvm-profiler**](@/agents/ir-pvm-profiler.md) (L3) | Verifies that validated workflows maintain performance baselines |
| [**cascade-quality-specialist**](@/agents/cascade-quality-specialist.md) (L3) | Eliminates quality debt patterns in IR validation rule sets |
| [**hbfs-quality-evolution**](@/agents/hbfs-quality-evolution.md) (L3) | Evolves validation rules through HBFS optimization cycles |

## Error Taxonomy

Validation errors are classified into a structured taxonomy that facilitates automated processing and trend analysis. Structural errors include cycle-detected, disconnected-graph, orphaned-stage, and missing-source. Type errors include type-mismatch, incompatible-schema, missing-field-reference, and invalid-aggregation-type. Parameter errors include out-of-range, missing-required, and violated-interdependency. Semantic errors include unreachable-branch, impossible-predicate, and redundant-operation.

This taxonomy enables aggregation of error patterns across workflows and over time, revealing systemic issues in workflow authoring practices or generator output quality. The [SEADF](@/glossary/seadf.md) evolution framework uses these patterns to drive improvements in the [ir-generator](@/agents/ir-generator.md) and in developer tooling.

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine mandates zero tolerance for validation errors. No workflow with unresolved error-level findings enters the PVM execution pipeline. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that every validation finding includes sufficient detail for the developer to understand and resolve the issue without additional investigation. Validation results include the specific location, the expected condition, the actual condition found, and a remediation suggestion.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)