+++
title = "llm-aide-coordinator"
weight = 220
[extra]
domain = "aiad-enhanced"
level = "L3"
description = "Aide platform integration and cross-platform LLM coordination for unified AI assistant management across development environments"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-aide-coordinator", "Aide", "agents", "agent", "Prismatic Platform", "AIAD", "Cross"]
tags = ["agents", "agent", "llm-aide-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-aide-coordinator - Prismatic Platform"
+++

## Overview

The llm-aide-coordinator is an L3 [Strategic Command](/glossary/strategic-command/) agent operating within the [AIAD](/glossary/aiad/)-enhanced domain of the Prismatic Platform. This agent manages the integration between the Prismatic Platform and the Aide AI assistant platform, coordinating cross-platform LLM interactions to ensure consistent behavior, context sharing, and quality standards across multiple AI assistant environments. Aide represents one of several AI-powered development environments that developers may use alongside the platform's native Claude integration, and the coordinator ensures that interactions through Aide maintain the same epistemic rigor and quality standards as direct platform interactions.

Built on the [AIAD](/glossary/aiad/) standard, the llm-aide-coordinator addresses the practical reality that development teams use multiple AI assistant tools -- Claude Code, Aide, Cursor, GitHub Copilot, and others -- and that maintaining consistency across these tools requires active coordination. Without coordination, different AI assistants may produce conflicting code patterns, inconsistent naming conventions, or divergent architectural decisions. The coordinator establishes shared context, enforces platform coding standards, and monitors cross-platform interaction quality to ensure that AI-assisted development maintains coherence regardless of which tool generates the code.

## Cross-Platform Coordination Architecture

The coordination architecture operates at three levels: context synchronization, standard enforcement, and quality monitoring.

Context synchronization ensures that the Aide platform has access to relevant platform context when assisting developers. This includes the platform's coding standards (from CLAUDE.md and AIAD specifications), active quality gates, current architectural decisions, and recent changes that might affect code generation recommendations. The coordinator maintains a compressed context package that captures essential platform state for inclusion in Aide interactions, optimized for the Aide platform's context window constraints.

Standard enforcement monitors code produced through Aide interactions for compliance with platform coding standards. This includes Elixir naming conventions, OTP patterns, error handling patterns ({:ok, _}/{:error, _}), module structure requirements, and the platform's meta-rule ("if the same solution could be written identically in Node.js, it's WRONG"). Non-compliant code produced through Aide is flagged for remediation before it enters the platform's codebase.

Quality monitoring tracks the quality of AI-assisted development across platforms, measuring metrics such as code review rejection rates, test failure rates, and quality gate violation rates segmented by originating AI tool. This data identifies whether specific AI tools consistently produce code that requires more remediation, informing decisions about context package optimization and tool-specific guidance.

## Key Capabilities

- **Aide platform integration** -- Establishes and maintains connections to the Aide AI assistant platform, providing platform context and receiving interaction telemetry
- **Context package management** -- Maintains optimized context packages containing platform standards, conventions, and state for inclusion in Aide interactions
- **Cross-platform consistency** -- Monitors code produced through multiple AI tools for consistency in patterns, naming, architecture, and style
- **Standard enforcement** -- Validates AI-generated code against platform quality requirements regardless of originating tool
- **Interaction quality tracking** -- Measures and reports on the quality of AI-assisted development segmented by tool and interaction type
- **Prompt template sharing** -- Distributes platform-optimized prompt templates to Aide for consistent task formulation
- **[GenServer](/glossary/genserver/)-based coordination** -- Implements coordination logic as OTP GenServers for reliable state management and fault tolerance
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with continuous monitoring of cross-platform AI interactions
- **[Telemetry integration](/capabilities/telemetry-integration/)** for interaction quality metrics and coordination performance tracking

## Context Package Design

The context package provided to Aide is carefully designed to maximize the relevance and impact of platform context within the constraints of the target platform's context window. The package is structured in layers of decreasing priority.

The core layer contains non-negotiable standards: the NO MERCY, NO DOUBTS doctrine, critical coding patterns (OTP-first, functional purity, {:ok, _}/{:error, _} patterns), and the platform's meta-rule. This layer is always included regardless of context window constraints.

The architectural layer contains current architectural decisions, module boundaries, and integration patterns relevant to the developer's current task. This layer is dynamically composed based on the files and modules the developer is working with.

The contextual layer contains recent changes, active quality gates, and current session objectives. This layer provides temporal context that prevents AI assistants from generating code that conflicts with in-progress changes or recently revised patterns.

The reference layer contains extended documentation, examples, and precedent code for the relevant domain. This layer is included when context window capacity permits and omitted under constrained conditions.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the coordinator to access platform standards from all domains, monitor AI interaction quality across tools, and enforce consistency standards on cross-platform code generation.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Aide Platform | External AI assistant platform integration target |
| [AIAD](/glossary/aiad/) Registry | Platform standards and agent specification access |
| Quality Gates | Standard enforcement for AI-generated code |
| Prismatic Telemetry | Cross-platform interaction quality [metrics](/glossary/metrics/) |
| [SEADF](/glossary/seadf/) | Autonomous evolution of context package optimization |
| [GenServer](/glossary/genserver/) | OTP-based coordination state management |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/aide sync` | Synchronize platform context to Aide platform | L3+ |
| `/aide status` | Report Aide integration health and recent interaction metrics | L2+ |
| `/aide context --update` | Force regeneration of the context package | L3+ |
| `/aide quality --report` | Generate cross-platform AI quality comparison report | L3+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-context-optimizer**](/agents/llm-context-optimizer/) (L4) | Provides context window optimization strategies for Aide context packages |
| [**llm-prompt-engineer**](/agents/llm-prompt-engineer/) (L3) | Supplies optimized prompt templates for Aide interactions |
| [**llm-model-selector**](/agents/llm-model-selector/) (L4) | Advises on model selection for Aide platform configuration |
| [**llm-performance-optimizer**](/agents/llm-performance-optimizer/) (L3) | Monitors Aide interaction latency and throughput |
| [**llm-cost-manager**](/agents/llm-cost-manager/) (L4) | Tracks Aide platform cost allocation and budget compliance |

## Cross-Platform Quality Standards

The coordinator enforces uniform quality standards across all AI assistant platforms. These standards include mandatory @spec annotations on all public functions, comprehensive documentation for module-level documentation, OTP supervision tree compliance for stateful components, and the platform's zero-warning compilation requirement. Code generated through any AI tool is subject to the same quality gates as manually written code -- the production source does not affect the quality expectation.

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that AI-generated code meets the same quality standards regardless of originating tool. No exceptions are made for code produced through external AI platforms. The [NO DOUBTS](/glossary/no-doubts/) principle requires that the coordinator explicitly tracks and reports quality differences across AI tools, providing evidence-based assessments of tool effectiveness rather than assuming equivalence.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)