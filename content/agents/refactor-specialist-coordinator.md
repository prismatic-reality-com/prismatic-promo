+++
title = "refactor-specialist-coordinator"
weight = 344
[extra]
domain = "development"
level = "L2"
description = "Specialized coordinator for code refactoring and architectural improvement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["refactor-specialist-coordinator", "Specialized", "agents", "agent", "Prismatic Platform", "Dialyzer", "Tactical Operations", "Elixir"]
tags = ["agents", "agent", "refactor-specialist-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "refactor-specialist-coordinator - Prismatic Platform"
+++

## Overview

The refactor-specialist-coordinator operates as an L2 Tactical Operations authority within the Prismatic Platform's development domain, serving as the dedicated coordinator for code refactoring campaigns and architectural improvement initiatives across the platform's 90-application umbrella codebase. In a platform of this scale -- exceeding 6,600 Elixir source files and 2.8 million lines of code -- refactoring is not an occasional cleanup activity but a continuous operational necessity. This agent plans, coordinates, and monitors refactoring operations to ensure they achieve their improvement objectives without introducing regressions or disrupting ongoing development.

The coordinator distinguishes between tactical refactoring (localized code improvements within a single module or application) and strategic refactoring (cross-application architectural changes that affect multiple teams and systems). Tactical refactoring is delegated to the [refactor-specialist](/agents/refactor-specialist/) for direct execution, while strategic refactoring requires the coordinator's orchestration to manage dependencies, sequence changes, and coordinate across affected codebases.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, this agent ensures that every refactoring operation is backed by measurable improvement criteria, validated through comprehensive testing, and verified against regression prevention requirements. The platform's zero-warning, zero-debt quality standard means that refactoring operations must not merely avoid introducing new issues -- they must demonstrably improve the codebase's quality metrics.

## Refactoring Campaign Management

Large-scale refactoring in an umbrella application requires careful campaign management to prevent destabilizing the codebase. The coordinator manages refactoring campaigns through four phases.

The **assessment phase** evaluates the current state of the target codebase using static analysis, complexity metrics, dependency graphs, and quality scores. This assessment identifies specific improvement opportunities and quantifies the expected benefit of each refactoring action. Priority ranking considers improvement impact, regression risk, implementation complexity, and dependency on other changes.

The **planning phase** sequences refactoring actions to minimize intermediate breakage. In a deeply interconnected umbrella application, changing a shared module may affect dozens of dependent applications. The coordinator plans change sequences that maintain compilation and test validity at every intermediate step, enabling incremental commits rather than requiring a single large change.

The **execution phase** delegates individual refactoring tasks to the [refactor-specialist](/agents/refactor-specialist/) and monitors progress against the plan. The coordinator tracks which planned changes have been completed, verifies that quality metrics improve as expected, and adjusts the plan when unexpected dependencies or complications arise.

The **validation phase** confirms that the complete refactoring campaign achieved its objectives by comparing post-refactoring quality metrics against pre-refactoring baselines.

## Key Capabilities

- **Cross-application dependency analysis** -- Maps module dependencies across the umbrella application to identify refactoring impact boundaries and sequence changes to avoid breaking dependent code
- **Quality metric tracking** -- Monitors Credo, Dialyzer, compilation warning, and test coverage metrics before, during, and after refactoring campaigns to verify measurable improvement
- **[CASCADE](/glossary/cascade/) pattern elimination** -- Coordinates campaigns targeting CASCADE anti-patterns (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) across the codebase
- **Regression prevention coordination** -- Ensures that every refactoring change is accompanied by tests that verify both the improvement and the absence of regressions
- **Incremental delivery planning** -- Sequences refactoring changes into committable increments that maintain compilation and test validity at every step
- **Resource allocation** -- Coordinates refactoring work alongside feature development to prevent resource conflicts and minimize development disruption
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with continuous codebase quality monitoring and automatic identification of refactoring opportunities
- **[Telemetry integration](/capabilities/telemetry-integration/)** for refactoring campaign progress tracking and quality improvement measurement

## Refactoring Patterns

The coordinator maintains a catalog of validated refactoring patterns specific to the Prismatic Platform's Elixir/[OTP](/glossary/otp/) architecture. **Extract Module** isolates cohesive functionality from oversized modules into focused, single-responsibility modules. **Introduce Behaviour** replaces ad-hoc polymorphism with explicit [BEAM](/glossary/beam/) behaviour definitions, enabling contract-based testing and Dialyzer verification. **Consolidate Protocols** merges redundant protocol implementations into shared implementations with adapter patterns.

**Simplify Supervision** restructures complex [supervision tree](/glossary/supervision-tree/) configurations into flatter, more predictable topologies with clear restart strategies. **Normalize Error Handling** standardizes error return patterns from inconsistent variations to the platform's canonical `{:ok, result}` / `{:error, reason}` format. **Extract GenServer State** moves complex [GenServer](/glossary/genserver/) state into dedicated state modules that can be tested independently of process lifecycle.

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](/glossary/tactical-execution/) with authority to plan and coordinate refactoring campaigns, assign tasks to refactoring specialists, and approve refactoring completion based on quality metric verification.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/refactor plan` | Generate a refactoring plan for a specified application or module | L2+ |
| `/refactor status` | Display current refactoring campaign progress and quality metrics | L2+ |
| `/refactor assess` | Run quality assessment on a codebase area to identify refactoring opportunities | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [refactor-specialist](/agents/refactor-specialist/) | Executes individual refactoring tasks under the coordinator's direction |
| [refactoring-coordinator-agent](/agents/refactoring-coordinator-agent/) | Formal verification of refactoring safety through Lean4 theorems |
| [code-quality-commander](/agents/code-quality-commander/) | Quality metrics validate refactoring campaign outcomes |
| [route-testing-supreme](/agents/route-testing-supreme/) | Route testing ensures refactoring does not break web endpoints |

## Enforcement

Refactoring operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no refactoring is considered complete until quality metrics demonstrably improve and all tests pass with zero warnings. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that refactoring decisions are backed by measurable evidence from static analysis and quality metrics. The [Trinity Gate](/glossary/trinity-gate/) validates refactoring plans for structural consistency before execution begins, and refactoring outcomes undergo the full quality gate pipeline including Dialyzer, Credo, and compilation verification.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)