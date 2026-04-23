+++
title = "refactor-specialist"
weight = 345
[extra]
domain = "development"
level = "L3"
description = "Safe code refactoring with comprehensive regression prevention, quality improvement, maintainability enhancement, and genetic patterns for type safety and verification"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["refactor-specialist", "Safe", "agents", "agent", "Prismatic Platform", "Elixir", "Dialyzer", "Strategic Command"]
tags = ["agents", "agent", "refactor-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "refactor-specialist - Prismatic Platform"
+++

## Overview

The refactor-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's development domain, executing safe code refactoring operations with comprehensive regression prevention, quality improvement verification, and maintainability enhancement. This agent applies genetic patterns for type safety and formal verification to ensure that refactoring transformations preserve program semantics while improving code structure, readability, and performance characteristics.

In the Prismatic Platform's Elixir/[OTP](/glossary/otp/) codebase, refactoring carries specific challenges and opportunities not found in conventional imperative codebases. Process-based concurrency means that refactoring a module's interface can affect message-passing contracts between processes. [Supervision tree](/glossary/supervision-tree/) restructuring changes fault-tolerance characteristics. Protocol and behaviour modifications affect polymorphic dispatch across the entire umbrella. The refactor-specialist understands these Elixir-specific concerns and applies refactoring techniques that account for the BEAM runtime's unique characteristics.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, every refactoring operation follows a strict protocol: analyze the current state, identify the specific improvement target, implement the transformation, verify that all tests pass, confirm that quality metrics improve, and validate that no regressions were introduced. The agent's genetic pattern approach treats refactoring as controlled mutation of the codebase genome, where each mutation must be verified to increase fitness.

## Refactoring Safety Model

The refactor-specialist's safety model is built on the principle that refactoring should be provably behavior-preserving. Before applying any transformation, the agent establishes a behavioral specification for the affected code through three mechanisms.

**Test-based specification** captures current behavior through existing test suites. If test coverage is insufficient for the refactoring target, the agent generates additional characterization tests that document current behavior before making changes. These characterization tests serve as behavior-preservation guards throughout the refactoring process.

**Type-based specification** leverages [Dialyzer](/glossary/dialyzer/) typespecs and success typing analysis to verify that refactored code maintains type compatibility with all callers. The agent ensures that every public function carries an `@spec` annotation before refactoring begins, enabling Dialyzer to verify type preservation across the transformation.

**Contract-based specification** uses [BEAM](/glossary/beam/) behaviours and protocol definitions to capture interface contracts. When refactoring code that implements behaviours or protocols, the agent verifies that the refactored implementation satisfies all contract requirements, catching interface violations that tests might miss.

## Key Capabilities

- **Behavior-preserving transformations** -- Applies refactoring transformations guaranteed to preserve program semantics, verified through test, type, and contract specifications
- **Regression prevention** -- Generates characterization tests for insufficient coverage areas, ensuring that refactoring changes are fully guarded against behavioral regressions
- **Quality metric improvement** -- Targets specific quality metrics (Credo scores, Dialyzer compliance, complexity reduction, test coverage) with measurable improvement verification
- **Genetic pattern application** -- Treats refactoring as controlled codebase mutation, applying fitness-evaluated transformations that must demonstrably improve the code's overall quality genome
- **[Hot code reload](/glossary/hot-code-reload/) safety** -- Ensures that refactored modules maintain hot-code-reload compatibility, preserving the platform's ability to update running systems without downtime
- **Cross-module impact analysis** -- Traces the impact of interface changes across module boundaries, identifying all callers and dependents affected by a refactoring transformation
- **Incremental transformation** -- Breaks complex refactorings into atomic steps, each independently verifiable, enabling rollback to any intermediate state if issues are detected
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with quality-driven refactoring opportunity identification and self-directed execution

## Elixir-Specific Refactoring Techniques

The agent maintains specialized techniques for Elixir/OTP refactoring that account for the language's unique characteristics. **Pattern match simplification** restructures complex nested pattern matches into clearer forms using with-clauses, guard functions, or dedicated match modules. **Pipeline optimization** refactors verbose imperative code into idiomatic pipe-operator chains that improve readability while maintaining performance.

**Process boundary refactoring** restructures the boundaries between processes, potentially merging processes with unnecessary separation or splitting monolithic processes into focused single-responsibility processes. This technique requires careful analysis of message-passing patterns, state ownership, and fault-isolation requirements.

**[Ecto](/glossary/ecto/) query optimization** refactors database interaction code to use composable query patterns, eliminating N+1 queries, consolidating redundant database calls, and applying preload strategies that match actual access patterns. **[Phoenix](/glossary/phoenix/)/[LiveView](/glossary/liveview/) component extraction** identifies reusable UI patterns within LiveView modules and extracts them into composable function components or live components.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to execute refactoring operations across the platform's codebase, generate characterization tests, and verify quality improvements.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/refactor execute` | Execute a specified refactoring transformation with full safety verification | L3+ |
| `/refactor analyze` | Analyze a module or application for refactoring opportunities with impact assessment | L3+ |
| `/refactor verify` | Verify that a completed refactoring preserved behavior and improved quality | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [refactor-specialist-coordinator](/agents/refactor-specialist-coordinator/) | Receives coordinated refactoring tasks and reports completion with quality metrics |
| [refactoring-coordinator-agent](/agents/refactoring-coordinator-agent/) | Formal verification of refactoring safety through Lean4 theorem proving |
| [quality-assurance-commander](/agents/archer-supreme/) | Quality metrics validate refactoring outcomes against improvement targets |
| [recursive-optimizer](/agents/recursive-optimizer/) | Execution trace analysis identifies performance-impacting refactoring opportunities |

## Enforcement

Refactoring operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: every transformation must demonstrably improve at least one quality metric while degrading none. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that improvement claims are verified through quantitative measurement. Refactored code must pass the complete quality gate pipeline: zero compilation warnings, Dialyzer compliance, Credo strict mode, and full test suite passage. The [Trinity Gate](/glossary/trinity-gate/) validates that refactoring changes maintain structural consistency across the affected codebase.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)