+++
title = "llm-prompt-engineer"
weight = 229
[extra]
domain = "aiad-enhanced"
level = "L3"
description = "Advanced prompt engineering and optimization for maximum LLM effectiveness across platform operations"
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
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-prompt-engineer", "Advanced", "agents", "agent", "Prismatic Platform", "Prompt", "AIAD", "Designs"]
tags = ["agents", "agent", "llm-prompt-engineer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-prompt-engineer - Prismatic Platform"
+++

## Overview

The llm-prompt-engineer is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the [AIAD](@/glossary/aiad.md)-enhanced domain of the Prismatic Platform. This agent specializes in designing, optimizing, testing, and maintaining the [prompt engineering](@/glossary/prompt-engineering.md) templates and strategies used across all platform LLM interactions. Prompt quality is the single most influential factor in LLM response quality -- the same model with a well-engineered prompt dramatically outperforms itself with a poorly constructed prompt. The prompt engineer ensures that every LLM interaction across the platform benefits from optimized prompt construction.

Built on the [AIAD](@/glossary/aiad.md) standard, the llm-prompt-engineer addresses prompt engineering as a systematic discipline rather than an ad-hoc practice. In a platform with hundreds of agents making diverse LLM requests, consistency and quality in prompt construction cannot depend on individual developers' prompt engineering skill. The agent centralizes prompt expertise, maintains a library of optimized templates, conducts systematic A/B testing of prompt variations, and evolves prompt strategies based on measured response quality data.

## Prompt Engineering Framework

The prompt engineering framework organizes prompt construction into structured layers, each addressing a different aspect of LLM communication.

The **instruction layer** specifies what the LLM should do. Effective instructions are precise, unambiguous, and action-oriented. The prompt engineer maintains instruction templates for common task types (code generation, analysis, classification, extraction, summarization) that encode best practices for each: explicit output format specification, clear success criteria, and constraint communication.

The **context layer** provides the information the LLM needs to perform the task. Context management is handled in coordination with the [llm-context-optimizer](@/agents/llm-context-optimizer.md), which optimizes content selection and compression. The prompt engineer specifies the structure and formatting of context within the prompt, ensuring that context elements are clearly delineated, appropriately labeled, and arranged in order of relevance.

The **constraint layer** communicates limitations and requirements that the LLM must respect. This includes output format constraints (JSON, Elixir code, markdown), length constraints, style requirements (naming conventions, coding standards), and content restrictions (no fabricated data, no unsupported claims). The prompt engineer has found that constraints are most effective when stated positively ("always include @spec annotations") rather than negatively ("don't forget @spec annotations").

The **exemplar layer** provides examples of desired input-output pairs that demonstrate the expected behavior. Few-shot examples are particularly effective for tasks with specific output formatting requirements or domain-specific conventions. The prompt engineer maintains curated example libraries organized by task type and domain.

The **meta-instruction layer** provides instructions about how the LLM should approach the task: whether to think step-by-step, what level of detail to provide, how to handle uncertainty, and whether to ask clarifying questions. Meta-instructions are calibrated per model, as different LLMs respond differently to meta-prompting strategies.

## Key Capabilities

- **Prompt template design** -- Creates structured, modular prompt templates for all platform task types with configurable parameters for task-specific customization
- **A/B testing of prompt variants** -- Conducts controlled experiments comparing prompt variations, measuring response quality differences with statistical rigor
- **Model-specific optimization** -- Adapts prompt strategies for different LLM models, accounting for model-specific strengths, weaknesses, and instruction-following characteristics
- **Prompt library management** -- Maintains a versioned library of optimized prompt templates with usage documentation, performance metrics, and applicability guidelines
- **Chain-of-thought engineering** -- Designs and optimizes chain-of-thought prompting strategies for complex reasoning tasks, calibrating reasoning step granularity for each task type
- **Output format engineering** -- Designs prompt structures that reliably produce structured output (JSON, code, tables) from LLM responses, minimizing parsing failures
- **Prompt injection defense** -- Designs prompt structures that resist prompt injection attacks, protecting platform LLM interactions from adversarial input
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous prompt quality monitoring and optimization
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for prompt effectiveness metrics and A/B test result tracking

## Optimization Methodology

Prompt optimization follows an empirical methodology that treats prompt engineering as an experimental science. Each optimization cycle begins with hypothesis formation (identifying specific prompt modifications expected to improve response quality), followed by experimental design (constructing A/B tests with appropriate controls and sample sizes), execution (routing a percentage of requests through both prompt variants), measurement (evaluating response quality using task-specific metrics), and decision (adopting the superior variant or iterating with new hypotheses).

Quality metrics for prompt evaluation vary by task type. Code generation prompts are evaluated on compilation success rate, test pass rate, and style compliance. Analysis prompts are evaluated on insight relevance, reasoning soundness, and conclusion support. Classification prompts are evaluated on accuracy, confidence calibration, and edge case handling. Summarization prompts are evaluated on information preservation, conciseness, and readability.

The optimization methodology accounts for the interaction between prompts and models. A prompt variant that improves quality with Claude may not improve quality with GPT or Ollama models. The prompt engineer maintains model-specific prompt variants and evaluates optimizations independently for each model.

## Prompt Injection Defense

The prompt engineer designs prompt structures that resist prompt injection attacks -- attempts to manipulate LLM behavior by embedding adversarial instructions in user-provided input. Defense strategies include clear boundary markers between system instructions and user input, input sanitization that escapes potential instruction markers, behavioral anchoring through strong initial instructions that the LLM is unlikely to override, and output validation that detects responses inconsistent with the expected behavior.

Prompt injection defense is particularly important in the Prismatic Platform where LLM interactions may process user-provided content (investigation subjects, document text, code snippets) that could contain adversarial content. The prompt engineer regularly tests prompt templates against known injection techniques to verify their resilience.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the prompt engineer to access all platform prompt templates, conduct A/B tests across production LLM traffic, and publish optimized prompts that affect all consuming agents.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Prompt Template Library | Versioned storage for optimized prompt templates |
| [GenServer](@/glossary/genserver.md) | OTP-based A/B test management and optimization state |
| Prismatic Telemetry | Prompt effectiveness [metrics](@/glossary/metrics.md) and A/B test result tracking |
| [SEADF](@/glossary/seadf.md) | Autonomous evolution of prompt optimization strategies |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/prompt optimize <template_id>` | Run optimization analysis on a prompt template | L3+ |
| `/prompt test <variant_a> <variant_b>` | Configure A/B test between two prompt variants | L3+ |
| `/prompt library` | List available prompt templates with effectiveness metrics | L2+ |
| `/prompt inject-test <template_id>` | Run prompt injection resilience test | L3+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-context-optimizer**](@/agents/llm-context-optimizer.md) (L4) | Context optimization operates within the prompt structure designed by the prompt engineer |
| [**llm-model-selector**](@/agents/llm-model-selector.md) (L4) | Model-specific prompt variants inform model selection capabilities |
| [**llm-conversation-coordinator**](@/agents/llm-conversation-coordinator.md) (L3) | Conversation prompts maintain continuity across multi-turn interactions |
| [**llm-aide-coordinator**](@/agents/llm-aide-coordinator.md) (L3) | Prompt templates are shared with external AI platforms for consistency |
| [**ir-generator**](@/agents/ir-generator.md) (L3) | IR generation prompts are optimized for structured workflow output |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that all platform LLM interactions use optimized prompt templates from the managed library. Ad-hoc prompt construction is prohibited for production operations. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that prompt optimization decisions are backed by measured quality data from A/B tests or benchmark evaluations, not subjective assessments of prompt quality.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)