+++
title = "ir-generator"
weight = 216
[extra]
domain = "execution"
level = "L3"
description = "LLM-powered generation of Information Retrieval (IR) workflows from natural language descriptions"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "pvm", "telemetry", "beam", "genstage", "genserver"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-generator", "LLM-powered", "Information", "Retrieval", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "ir-generator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ir-generator - Prismatic Platform"
+++

## Overview

The ir-generator is an L3 [Strategic Command](/glossary/strategic-command/) agent within the Prismatic Platform's execution domain, responsible for automatically generating Information Retrieval (IR) workflow definitions from natural language descriptions. This agent bridges the gap between human intent and executable IR pipelines by translating descriptive specifications into structured workflow graphs that can be validated, optimized, and executed by the platform's [PVM](/glossary/pvm/) (Platform Virtual Machine) runtime. The ir-generator leverages large language model capabilities to interpret ambiguous or high-level retrieval requirements and produce type-safe, composable workflow specifications.

Built on the [AIAD](/glossary/aiad/) standard, the ir-generator operates within the platform's broader IR compilation pipeline alongside the [ir-linter](/agents/ir-linter/), [ir-validator](/agents/ir-validator/), and [ir-pvm-profiler](/agents/ir-pvm-profiler/) agents. Together, these agents form a complete lifecycle management system for IR workflows: the generator creates workflow definitions, the linter checks them for quality and best-practice compliance, the validator verifies structural and type correctness, and the profiler measures runtime performance. This separation of concerns follows the Prismatic Platform's architectural principle that generation, validation, and execution should be handled by independent, specialized components.

## Information Retrieval Workflow Architecture

Information Retrieval workflows in the Prismatic Platform are represented as directed acyclic graphs (DAGs) of processing stages. Each stage implements a specific retrieval operation: source querying, filtering, ranking, deduplication, enrichment, aggregation, or output formatting. Stages are connected by typed edges that define data flow between operations, with each edge carrying a schema that specifies the structure and types of data flowing through it.

The ir-generator produces these DAG specifications from natural language input. A user might describe a retrieval requirement as "find all companies registered in Prague with more than 50 employees that have changed their board members in the last 6 months" and the generator would produce a workflow DAG with stages for Czech registry querying, employee count filtering, board change detection, temporal filtering, and result aggregation.

The generated workflows are expressed in the platform's IR intermediate representation format, a JSON-based schema that captures stage definitions, edge connections, parameter configurations, and type constraints. This intermediate representation is designed to be machine-readable for downstream validation and compilation, while remaining human-inspectable for debugging and manual refinement.

## Key Capabilities

- **Natural language to IR translation** -- Interprets natural language retrieval descriptions and produces structured IR workflow definitions with appropriate stage selections, parameter configurations, and data flow connections
- **Stage library awareness** -- Maintains knowledge of all available IR processing stages in the platform's stage library, including their input/output schemas, configuration parameters, and performance characteristics
- **Type inference and propagation** -- Infers data types from natural language descriptions and propagates type constraints through the generated workflow graph to ensure end-to-end type safety
- **Optimization hint generation** -- Annotates generated workflows with optimization hints based on the described retrieval pattern, such as suggesting index-friendly query orderings or identifying parallelizable branches
- **Iterative refinement** -- Supports multi-turn generation workflows where users refine their requirements through conversation, with the generator maintaining context and applying incremental modifications to the workflow DAG
- **Template instantiation** -- Recognizes common retrieval patterns and instantiates pre-validated workflow templates when appropriate, reducing generation latency and improving output reliability
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-healing capabilities for generation pipeline recovery
- **[Telemetry integration](/capabilities/telemetry-integration/)** for generation quality monitoring and performance tracking

## Generation Pipeline

The generation pipeline follows a multi-phase architecture designed to maximize output quality while maintaining acceptable latency. The interpretation phase parses the natural language input and extracts semantic elements: data sources, filter predicates, sorting criteria, aggregation operations, and output format requirements. This phase produces a structured intent representation that captures the user's retrieval requirements in a machine-processable format.

The planning phase maps extracted semantic elements to available IR stages, resolving ambiguities in stage selection by consulting the stage library for compatibility constraints and performance profiles. When multiple stage combinations could satisfy the requirement, the planner selects the combination with the best expected performance characteristics, annotating alternatives for user review.

The composition phase assembles selected stages into a DAG, connecting stages with typed edges and configuring stage parameters based on the extracted requirements. This phase applies topological sorting to establish a valid execution order and identifies opportunities for parallel execution of independent branches.

The validation phase runs the generated workflow through lightweight structural checks before passing it to the [ir-validator](/agents/ir-validator/) for comprehensive verification. This early validation catches common generation errors (disconnected stages, type mismatches, missing required parameters) before the user commits to the workflow.

## LLM Integration Architecture

The ir-generator's LLM integration follows the platform's standard LLM client architecture, using the [llm-generic-bridge](/agents/llm-generic-bridge/) for vendor-neutral model access and the [llm-context-optimizer](/agents/llm-context-optimizer/) for efficient context window utilization. The stage library documentation is indexed and compressed for inclusion in the LLM context, providing the model with the reference information needed to select appropriate stages and configure them correctly.

Prompt engineering for IR generation follows structured templates that separate the user's natural language description from the stage library reference, example workflows, and output format specifications. This separation enables the [llm-prompt-engineer](/agents/llm-prompt-engineer/) to optimize each section independently, improving generation quality without increasing context window consumption proportionally.

Generated workflows are post-processed to remove LLM artifacts (hallucinated stage names, invalid parameter values, inconsistent type annotations) through a deterministic cleanup pass. This pass applies the platform's stage library as a ground truth reference, replacing any unrecognized stage names with their nearest valid equivalents and validating all parameter values against their declared schemas.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the ir-generator to access the complete stage library, invoke LLM services for natural language processing, and publish generated workflows to the platform's workflow registry for downstream consumption by validators and executors.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| [PVM](/glossary/pvm/) Runtime | Target execution environment for generated workflows |
| IR Stage Library | Reference catalog of available processing stages |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification, discovery, and indexing |
| Prismatic Telemetry | Generation quality [metrics](/glossary/metrics/) and latency tracking |
| LLM Client | Natural language processing for intent extraction and workflow composition |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ir generate <description>` | Generate IR workflow from natural language description | L3+ |
| `/ir refine <workflow_id> <modification>` | Apply incremental refinement to existing workflow | L3+ |
| `/ir templates` | List available workflow templates for common patterns | L2+ |
| `/ir explain <workflow_id>` | Generate natural language explanation of existing workflow | L2+ |

## Coordination with IR Pipeline Agents

The ir-generator operates as the first stage in the IR lifecycle pipeline, with its outputs consumed by downstream agents.

| Agent | Relationship |
|-------|-------------|
| [**ir-linter**](/agents/ir-linter/) (L3) | Checks generated workflows for quality, style, and best-practice compliance |
| [**ir-validator**](/agents/ir-validator/) (L3) | Verifies structural correctness, type safety, and DAG validity |
| [**ir-pvm-profiler**](/agents/ir-pvm-profiler/) (L3) | Profiles runtime performance of generated workflows |
| [**pvm-executor**](/agents/pvm-executor/) (L4) | Executes validated and compiled workflows on the PVM runtime |

## Quality Assurance

Generated workflow quality is measured across multiple dimensions. Structural validity measures whether the generated DAG is well-formed (no cycles, no disconnected components, all edges typed). Type correctness measures whether data types are consistent across stage boundaries. Semantic accuracy measures whether the generated workflow faithfully implements the user's stated retrieval requirements. Performance efficiency measures whether the generated workflow avoids unnecessary stages and exploits available optimization opportunities.

The agent maintains a feedback loop where validation failures from downstream agents (linter findings, validator rejections, profiler performance regressions) are analyzed to improve generation heuristics over time. This continuous improvement cycle is managed through the [SEADF](/glossary/seadf/) autonomous evolution framework.

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that every generated workflow passes basic structural validation before delivery. The ir-generator never produces workflows with known type errors, disconnected stages, or invalid parameter configurations. The [NO DOUBTS](/glossary/no-doubts/) principle requires that the generator explicitly communicates its confidence in the interpretation of ambiguous requirements, asking for clarification rather than guessing when the natural language input is genuinely ambiguous.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)