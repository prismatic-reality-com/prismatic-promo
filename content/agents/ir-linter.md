+++
title = "ir-linter"
weight = 217
[extra]
domain = "quality"
level = "L3"
description = "Advanced static analysis and code quality enforcement for IR workflows with performance and maintainability recommendations"
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
keywords = ["ir-linter", "Advanced", "agents", "agent", "Prismatic Platform", "Strategic Command"]
tags = ["agents", "agent", "ir-linter", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ir-linter - Prismatic Platform"
+++

## Overview

The ir-linter is an L3 [Strategic Command](/glossary/strategic-command/) agent operating within the quality domain of the Prismatic Platform. It performs advanced static analysis and quality enforcement for Information Retrieval (IR) workflow definitions, identifying anti-patterns, performance risks, maintainability issues, and style violations before workflows reach the validation and execution stages. While the [ir-validator](/agents/ir-validator/) checks structural correctness (whether a workflow is valid), the ir-linter evaluates qualitative aspects (whether a workflow is well-designed) and provides actionable recommendations for improvement.

Built on the [AIAD](/glossary/aiad/) standard and operating under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, the ir-linter enforces the principle that technically correct code is not sufficient -- it must also be efficient, maintainable, and idiomatic. This agent applies the same philosophy that tools like Credo bring to Elixir code, adapted for the specific domain of IR workflow specifications. Every linting finding is evidence-based, with clear explanations of why a pattern is problematic and specific suggestions for how to improve it.

## Static Analysis Framework

The ir-linter's static analysis framework operates on the IR intermediate representation, examining workflow DAGs through multiple analytical lenses. Each lens corresponds to a category of quality concern, and each produces findings with severity levels (error, warning, info) and confidence scores reflecting how certain the linter is that the finding represents a genuine quality issue rather than a false positive.

The structural analysis lens examines workflow topology: Are there unnecessarily long pipeline chains that could be parallelized? Are there redundant filtering stages that could be consolidated? Are there stages with no consumers for their output? These structural findings often reveal design inefficiencies that, while not technically incorrect, degrade performance and complicate maintenance.

The type analysis lens examines data type usage across the workflow: Are types unnecessarily broad where narrower types would improve downstream processing? Are there implicit type conversions that could be made explicit? Are schema evolutions backward-compatible? Type discipline in IR workflows is essential because type errors discovered at runtime are far more expensive to diagnose than those caught during linting.

The performance analysis lens identifies patterns known to cause poor runtime performance: full table scans where indexed queries would suffice, synchronous processing of independent branches that could run in parallel, excessive data materialization at intermediate stages, and missing pagination in source queries that could return unbounded result sets.

The maintainability analysis lens evaluates human readability: Are stages meaningfully named? Are configuration parameters documented? Are complex filter expressions decomposed into named sub-expressions? Is the workflow organized in a way that communicates its intent to future maintainers?

## Key Capabilities

- **Multi-lens static analysis** -- Applies structural, type, performance, and maintainability analysis lenses to IR workflow definitions, producing categorized findings with severity levels and confidence scores
- **Anti-pattern detection** -- Identifies known IR workflow anti-patterns including redundant stages, unnecessary serialization, unbounded queries, missing error handling, and overly complex filter expressions
- **Performance risk identification** -- Flags workflow patterns likely to cause poor runtime performance, with quantitative estimates of the expected impact based on historical profiling data from similar patterns
- **Maintainability scoring** -- Assigns maintainability scores to workflows based on naming quality, documentation completeness, structural complexity, and decomposition granularity
- **Auto-fix suggestions** -- Generates concrete code modifications that would resolve identified issues, enabling one-click remediation for common anti-patterns
- **[Quality gate integration](/capabilities/quality-gates/)** -- Enforces linting gates in the IR development pipeline, blocking deployment of workflows with unresolved error-level findings
- **[Regression prevention](/capabilities/regression-tests/)** with comprehensive test coverage enforcement
- **[Telemetry integration](/capabilities/telemetry-integration/)** for linting performance and finding trend monitoring

## Linting Rule Categories

The ir-linter organizes its rules into categories that align with the platform's quality dimensions. Each category can be independently configured for severity levels and enforcement modes.

**Structural Rules** enforce workflow topology best practices. The no-disconnected-stages rule catches stages that produce output consumed by no downstream stage. The no-redundant-filters rule identifies consecutive filter stages that could be combined into a single stage with a compound predicate. The parallel-opportunity rule detects independent branches that are unnecessarily serialized.

**Type Rules** enforce data type discipline. The narrow-types rule recommends replacing broad types (e.g., `any()`) with specific types when the data structure is deterministic. The explicit-conversion rule flags implicit type coercions that could mask data quality issues. The schema-evolution rule checks that type changes between workflow versions maintain backward compatibility.

**Performance Rules** identify efficiency problems. The unbounded-query rule flags source queries without pagination or result limits. The materialization-overhead rule identifies unnecessary intermediate data materialization that increases memory consumption without improving correctness. The index-utilization rule checks that filter predicates align with available indexes in the data sources being queried.

**Style Rules** enforce consistency and readability. The naming-convention rule checks that stage names follow the platform's naming guidelines. The documentation-coverage rule verifies that complex stages include configuration documentation. The complexity-threshold rule flags workflows exceeding configurable complexity limits, measured by stage count, edge count, and nesting depth.

## Integration with IR Pipeline

The ir-linter operates as the second stage in the IR lifecycle pipeline, receiving workflow definitions from the [ir-generator](/agents/ir-generator/) and producing annotated workflows for the [ir-validator](/agents/ir-validator/). Linting can also be invoked independently on manually authored workflows or on workflows being modified for maintenance.

The linting process is non-destructive: the ir-linter annotates workflow definitions with findings but does not modify the workflow itself. This annotation-based approach preserves the original workflow for comparison and allows users to selectively address findings in order of priority.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the ir-linter to access the IR stage library for rule reference, query historical profiling data for performance risk estimation, and publish linting results to the platform's quality tracking system.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Quality Gates](/glossary/quality-gates/) | Static analysis enforcement and compilation gate integration |
| Prismatic Safety | [Quality floor guardian](/glossary/quality-floor-guardian/) and evolution tracking |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Automated linting pipeline execution in CI/CD workflows |
| IR Stage Library | Reference catalog for rule validation and anti-pattern detection |
| [ETS](/glossary/ets/) Cache | In-memory caching of linting rules and historical finding data |
| Prismatic Telemetry | Linting performance metrics and finding trend analysis |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ir lint <workflow_id>` | Run full linting analysis on a workflow | L2+ |
| `/ir lint --fix <workflow_id>` | Run linting with auto-fix application | L3+ |
| `/ir lint --category=performance <workflow_id>` | Run performance-focused linting only | L2+ |
| `/ir lint --report <workflow_id>` | Generate detailed linting report with metrics | L3+ |

## Coordination with Quality Agents

| Agent | Relationship |
|-------|-------------|
| [**ir-generator**](/agents/ir-generator/) (L3) | Produces workflow definitions that the linter evaluates for quality |
| [**ir-validator**](/agents/ir-validator/) (L3) | Receives linter-annotated workflows for structural validation |
| [**cascade-quality-specialist**](/agents/cascade-quality-specialist/) (L3) | Applies CASCADE elimination patterns to IR workflow quality debt |
| [**documentation-verifier**](/agents/documentation-verifier/) (L3) | Verifies documentation coverage within IR workflow specifications |
| [**hbfs-quality-evolution**](/agents/hbfs-quality-evolution/) (L3) | Drives quality evolution of linting rules through HBFS optimization |

## Quality Evolution

The ir-linter's rule set evolves through the platform's genetic algorithm optimization framework. New rules are derived from patterns observed in runtime failures, performance regressions, and maintenance difficulties. Rules are evaluated based on their true-positive rate (percentage of findings that represent genuine quality issues) and their remediation value (how much runtime performance or maintenance effort is saved by addressing the finding). Low-value rules are deprecated and removed, while high-value rules are promoted to higher severity levels.

This evolutionary approach ensures that the linting rule set remains current with the platform's IR workflow patterns, automatically adapting to new stage types, new anti-patterns, and changing performance characteristics.

## Enforcement

The ir-linter enforces strict quality standards under the [NO MERCY](/glossary/no-mercy/) doctrine. Error-level findings block workflow deployment -- no workflow with known quality errors enters production. Warning-level findings are tracked in the platform's [quality debt](/glossary/quality-debt/) system and must be addressed within a configurable timeframe. Info-level findings are recorded for trend analysis but do not create enforcement obligations. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every finding includes a clear explanation and concrete remediation path, ensuring that developers can act on findings without additional research.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)