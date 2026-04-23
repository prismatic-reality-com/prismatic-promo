+++
title = "garden-extractor"
weight = 174
[extra]
domain = "general"
level = "L3"
description = "Specialized agent for extracting, adapting, and integrating code components from garden legacy repositories into the current Prismatic Platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "ecto", "garden", "3nl"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-extractor", "Specialized", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "Elixir", "Quality", "Extraction"]
tags = ["agents", "agent", "garden-extractor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "garden-extractor - Prismatic Platform"
+++

## Overview

The [Garden](/glossary/garden/) Extractor operates as an L3 [strategic command](/glossary/strategic-command/) agent within the General domain of the Prismatic Platform. This agent specializes in extracting, adapting, and integrating code components from garden legacy repositories into the current Prismatic Platform. The extraction process involves identifying valuable components within the 116-repository GARDEN ecosystem, transforming them to match the platform's architectural standards, and integrating them with full compliance to quality gates and testing requirements.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](/glossary/aiad/) standard, the Garden Extractor performs the critical transition from legacy knowledge to production-ready platform components. While the [garden-analyzer](/agents/garden-analyzer/) identifies what is valuable and the [garden-explorer-agent](/agents/garden-explorer-agent/) enables interactive discovery, the Garden Extractor executes the actual knowledge transfer, translating patterns and code across language boundaries, architectural paradigms, and quality standards.

## Extraction Planning

Extraction planning precedes any code transfer, establishing the scope, approach, and quality requirements for each extraction operation. Planning prevents ad hoc code copying that would introduce technical debt and quality violations into the platform.

Component identification defines exactly what will be extracted, including primary code modules, supporting utilities, test suites, configuration files, and documentation. The identification phase draws on assessments from the [garden-analyzer](/agents/garden-analyzer/) and exploration results from the [garden-explorer-agent](/agents/garden-explorer-agent/) to select components with demonstrated value and acceptable quality baselines.

Dependency analysis maps the selected component's dependency graph, identifying which dependencies are internal to the source repository (requiring co-extraction or replacement), which are external libraries (requiring version compatibility assessment with the platform), and which are implicit environmental assumptions (requiring platform adaptation). Complete dependency resolution before extraction prevents integration failures caused by missing or incompatible dependencies.

Adaptation requirements analysis identifies the transformations needed to bring extracted code into compliance with platform standards. Common adaptations include language translation (JavaScript/Python/Rust to Elixir), paradigm shift (object-oriented to functional), pattern alignment (imperative state management to [OTP](/glossary/otp/) process architecture), and quality elevation (adding type specifications, tests, and documentation to meet platform requirements).

| Planning Phase | Output | Consumer |
|---------------|--------|----------|
| Component identification | Extraction manifest | Extraction execution |
| Dependency analysis | Dependency map | Adaptation planning |
| Adaptation requirements | Transformation specification | Code transformation |
| Quality gap analysis | Quality remediation plan | Quality compliance |
| Integration mapping | Interface specification | Platform integration |

## Cross-Language Extraction

The most complex extraction operations involve translating code from one programming language to another. The GARDEN contains repositories in JavaScript/TypeScript, Python, Rust, Go, and Elixir, and the target platform uses Elixir exclusively. Cross-language extraction requires understanding not just syntax differences but fundamental paradigm differences between source and target languages.

JavaScript to Elixir extraction translates asynchronous callback/promise patterns into GenServer message-passing and Task-based concurrency. Mutable object state becomes immutable process state. Class hierarchies become module compositions with behaviours. Event emitters become GenStage pipelines or PubSub patterns.

Python to Elixir extraction translates imperative data processing scripts into functional pipeline transformations. Dictionary-based state management becomes [Ecto](/glossary/ecto/) schema structures. Try/except error handling becomes {:ok, result}/{:error, reason} pattern matching. Threading becomes OTP process supervision.

Rust to Elixir extraction translates ownership-based resource management into garbage-collected process isolation. Trait implementations become behaviour callbacks. Match expressions translate directly with minor syntax adjustment. Result/Option types map naturally to {:ok}/{:error} tuples.

The extraction process preserves the semantic intent of the original code while expressing it through idiomatic Elixir patterns. The resulting code should be indistinguishable from code written natively for the platform, satisfying the meta-rule: "If the same solution could be written identically in Node.js, it's WRONG."

## Component Adaptation Pipeline

The adaptation pipeline transforms extracted components through a series of stages that progressively bring them into compliance with platform standards.

Structural adaptation reorganizes code to match platform module conventions. Files are placed in the appropriate umbrella application directory, modules are named according to platform conventions, and public interfaces are aligned with platform API patterns.

Functional adaptation transforms implementation patterns to match platform idioms. Mutable state becomes process-managed state. Sequential I/O becomes concurrent stream processing. Exception-based error handling becomes tuple-based result returns. Global configuration access becomes application environment injection.

Quality adaptation adds the quality attributes required by platform standards. Type specifications are added for all public functions. Comprehensive documentation including @doc, @moduledoc, and @spec annotations is generated. Test suites are written covering unit tests, integration tests, and property-based tests. Credo compliance, Dialyzer compatibility, and compilation without warnings are verified.

Integration adaptation configures the extracted component for operation within the platform's umbrella application structure. Supervision tree placement, telemetry instrumentation, configuration management, and inter-module communication are all established.

## Quality Compliance

Every extraction must achieve full compliance with the platform's quality standards before the extracted component enters the codebase. The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine applies without exception to extracted code -- no component receives reduced quality requirements because it originated from a legacy repository.

Quality compliance verification runs the same quality gates applied to native platform code: zero compilation warnings, Credo strict compliance, Dialyzer type checking, full test coverage, and documentation completeness. Extracted components that fail any gate are returned to the adaptation pipeline for remediation.

The extraction process generates a quality report documenting the original component's quality metrics, the transformations applied, and the resulting component's quality scores. This report provides traceability from legacy code to production-ready platform component.

## Provenance Tracking

Provenance tracking maintains the complete lineage of extracted components, recording their garden origin, extraction decisions, transformations applied, and integration points within the platform. This tracking serves both intellectual honesty (acknowledging code origins) and practical maintenance (enabling investigation of extracted component behavior by reference to original implementations).

Each extracted component carries provenance metadata including the source repository, source file paths, extraction date, extraction agent version, adaptation transformations applied, and quality scores before and after adaptation. This metadata is stored alongside the component and is accessible through the platform's metadata query interface.

## Extraction Patterns Library

The Garden Extractor maintains a library of proven extraction patterns that encode successful transformation strategies for common source-to-target conversions. These patterns accelerate future extractions by providing tested approaches rather than requiring novel transformation design for each extraction.

Pattern categories include data model extraction (schema translation strategies), algorithm extraction (pure logic transfer approaches), integration extraction (API adapter conversion patterns), and architecture extraction (structural pattern translation strategies).

## Epistemic Framework Compliance

The [NABLA Infinity](/glossary/nabla-infinity/) framework's Provenance Mandatory axiom directly governs the extractor's operations. Every extracted component must trace back to its source through a documented chain of transformations. The Signal Plurality axiom applies when multiple garden repositories offer implementations of the same functionality -- the extractor evaluates all available implementations rather than selecting the first one encountered.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution | Agent lifecycle and scheduling |
| AIAD [Registry](/glossary/registry-otp/) | Discovery | Agent specification and indexing |
| Prismatic Telemetry | Monitoring | Extraction performance metrics |
| GARDEN Repositories | Data source | 116 legacy repositories for extraction |
| Quality Gates | Validation | Post-extraction quality compliance |

## Related Agents

- [**garden-analyzer**](/agents/garden-analyzer/) (L3) - Provides analytical assessments that guide extraction component selection
- [**garden-explorer-agent**](/agents/garden-explorer-agent/) (L3) - Provides interactive discovery results with extraction referrals
- [**garden-pattern-scout**](/agents/garden-pattern-scout/) (L3) - Provides pattern catalogs that inform extraction transformation strategies

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)