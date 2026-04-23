+++
title = "chatgpt-prompt-engineer"
weight = 75
[extra]
domain = "llm-operations"
level = "L3"
description = "Designs, optimizes, and maintains versioned prompt templates used across all ChatGPT interactions within the platform, treating prompt engineering as a systematic discipline with A/B testing, quality metrics, and evolutionary optimization."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "lean4", "prompt-engineering", "ets"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-prompt-engineer", "Designs", "ChatGPT", "agents", "agent", "Prismatic Platform", "Phase", "Templates", "Template"]
tags = ["agents", "agent", "chatgpt-prompt-engineer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-prompt-engineer - Prismatic Platform"
+++

## Executive Summary

The ChatGPT Prompt Engineer operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the LLM Operations domain of the Prismatic Platform. This agent designs, optimizes, and maintains prompt templates used across all ChatGPT interactions within the platform. By treating [prompt engineering](@/glossary/prompt-engineering.md) as a systematic discipline rather than ad-hoc experimentation, the agent ensures that every ChatGPT interaction extracts maximum value per token spent while producing structured, actionable outputs that downstream agents can consume without manual transformation.

Prompt quality directly determines the quality of AI-generated outputs. A poorly structured prompt produces verbose, unfocused, or incorrectly formatted responses that require post-processing and waste tokens. An optimized prompt elicits precise, structured outputs that slot directly into the platform's processing pipelines. The ChatGPT Prompt Engineer maintains a library of tested, versioned prompt templates optimized for specific use cases: code analysis, architectural review, [intelligence synthesis](@/capabilities/intelligence-synthesis.md), compliance assessment, and strategic planning. Each template undergoes A/B testing against quality [metrics](@/glossary/metrics.md), with high-performing templates promoted and underperforming ones evolved or retired.

## Architecture

The Prompt Engineer implements a template lifecycle architecture with design, testing, deployment, and evolution phases.

```
+----------------------------------------------------------------------+
|         ChatGPT Prompt Engineer (L3)                                 |
+----------------------------------------------------------------------+
|  Design Layer                                                         |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Template Designer  |  | Structure Optimizer|  | Token Estimator  | |
|  | (Use-case mapping) |  | (Format selection) |  | (Cost projection)| |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Testing Framework                                    |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | A/B Splitter  |  | Quality Scorer   |  | Metric Collector  |  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Deployment Layer          |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Version Manager    |  | Rollback Engine    |  | Canary Deploy    | |
|  | (Semantic version) |  | (Quick revert)     |  | (Gradual rollout)| |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Evolution Layer           |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Mutation Engine    |  | Fitness Evaluator  |  | Selection Filter | |
|  | (Prompt variants)  |  | (Quality metrics)  |  | (Best survivors) | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Design Layer creates prompt templates matched to specific use cases, optimizes their structural format for output quality, and estimates token costs. The Testing Framework provides systematic A/B comparison of prompt variants. The Deployment Layer manages versioned template releases with rollback capability. The Evolution Layer applies genetic algorithm principles to continuously improve templates over time.

## Operational Domain

The LLM Operations domain manages all aspects of large language model integration, from connection management through prompt optimization to output validation. The Prompt Engineer focuses specifically on the prompt design layer, ensuring that the platform communicates with external AI models using optimized, context-rich prompts that produce structured, actionable outputs.

Prompt engineering within the Prismatic ecosystem is a quantitative discipline, not an art. Every prompt template has measurable performance characteristics: average output quality score, token consumption per unit of useful output, structural compliance rate, and downstream processing success rate. These metrics drive template evolution decisions, ensuring that the prompt library continuously improves based on empirical evidence rather than subjective preference.

The domain must also account for model-specific prompt optimization. Different LLM providers (ChatGPT models, [Ollama](@/glossary/ollama.md) local models, OpenRouter endpoints) respond differently to identical prompts. The Prompt Engineer maintains model-specific template variants that exploit each model's strengths while mitigating its weaknesses, ensuring consistent output quality regardless of the underlying model.

## Core Capabilities

**Template Library Management** maintains versioned, categorized prompt templates for all ChatGPT use cases across the platform, with documented performance metrics for each template. The library is organized by domain (code analysis, architecture review, intelligence synthesis, compliance assessment, strategic planning) and by output format (JSON, markdown tables, categorized lists, structured reports). Each template carries metadata including its creation date, version history, A/B test results, average quality score, and token efficiency rating.

**A/B Testing Framework** systematically compares prompt variants to identify which formulations produce higher-quality, more structured, and more actionable outputs. The framework runs controlled experiments where identical inputs are processed through competing template variants, and outputs are scored using domain-specific quality rubrics. Statistical significance requirements prevent premature conclusions: template promotions require at least 30 comparison runs with p < 0.05 confidence that the new variant outperforms the incumbent.

**Context Window Optimization** designs prompts that maximize information density within token limits, ensuring critical context is included without exceeding budget constraints. The optimization process analyzes how different prompt structures affect context utilization: where to place instructions versus context, how to format context for maximum comprehension, and how to structure output requirements to minimize response padding.

**Multi-Provider Adaptation** adapts prompt templates for different LLM providers while maintaining consistent output quality. ChatGPT models respond well to detailed system prompts with structured output examples, while smaller Ollama models perform better with concise, directive prompts. The adaptation system maintains equivalence classes of templates that produce comparable outputs across providers.

**Output Structure Enforcement** designs prompts that elicit structured responses (JSON, tables, categorized lists) suitable for automated downstream processing. Structured output prompts include explicit format specifications, examples of correct output structure, and constraints that prevent common formatting errors. The enforcement success rate is tracked per template, and templates with low structural compliance are flagged for redesign.

**Prompt Evolution** applies genetic algorithm principles to evolve prompt templates over time, selecting for quality and retiring underperformers. The evolution engine generates template mutations (word choice variations, structural rearrangements, instruction reformulations), evaluates mutant fitness through the A/B testing framework, and promotes successful mutations into the active template library while culling low-fitness variants.

## Implementation

```elixir
defmodule PrismaticChatGPT.PromptEngineer do
  @moduledoc """
  L3 Strategic Command agent designing and optimizing prompt
  templates through systematic A/B testing and evolution.
  """

  use GenServer

  alias PrismaticChatGPT.{TemplateLibrary, ABTester, EvolutionEngine}
  alias PrismaticChatGPT.{QualityScorer, TokenEstimator}

  @min_ab_runs 30
  @significance_threshold 0.05

  defstruct [
    :template_registry,
    :active_experiments,
    :evolution_state,
    :performance_history
  ]

  @spec get_template(atom(), atom()) :: {:ok, map()} | {:error, :not_found}
  def get_template(domain, task_type) do
    GenServer.call(__MODULE__, {:get_template, domain, task_type})
  end

  @spec start_experiment(String.t(), map()) :: {:ok, String.t()} | {:error, term()}
  def start_experiment(template_id, variant) do
    GenServer.call(__MODULE__, {:experiment, template_id, variant})
  end

  @impl true
  def handle_call({:get_template, domain, task_type}, _from, state) do
    case TemplateLibrary.best_for(state.template_registry, domain, task_type) do
      nil -> {:reply, {:error, :not_found}, state}
      template -> {:reply, {:ok, template}, state}
    end
  end

  @impl true
  def handle_call({:experiment, template_id, variant}, _from, state) do
    experiment = ABTester.create(template_id, variant, @min_ab_runs, @significance_threshold)
    updated = Map.put(state.active_experiments, experiment.id, experiment)
    {:reply, {:ok, experiment.id}, %{state | active_experiments: updated}}
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination and specialized operational command. The Prompt Engineer exercises authority over prompt template design, A/B testing protocols, and template deployment decisions for all ChatGPT interactions across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md) | Bridge Operations | Provides API-level feedback on prompt performance and token consumption metrics |
| [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) | Context Optimization | Coordinates context inclusion strategy with prompt design token allocation |
| [chatgpt-integration-commander](@/agents/chatgpt-integration-commander.md) | Integration Authority | Provides model capability information that informs prompt design decisions |
| [chatgpt-consultation-coordinator](@/agents/chatgpt-consultation-coordinator.md) | Consultation Templates | Designs multi-turn prompt sequences for consultation workflows |

## Operational Workflow

**Phase 1 -- Template Design**: New prompt templates are designed based on use case requirements, target model capabilities, and desired output format. Design considers token budget constraints, context window allocation, and structural output requirements.

**Phase 2 -- Baseline Testing**: New templates undergo baseline quality testing against a standardized set of test inputs. Templates that fail to meet minimum quality thresholds are redesigned before proceeding to A/B testing.

**Phase 3 -- A/B Experimentation**: Promising templates enter controlled A/B experiments against incumbent templates for the same use case. Experiments run until statistical significance is achieved, with quality metrics tracked across multiple dimensions.

**Phase 4 -- Canary Deployment**: Templates that demonstrate statistically significant improvement enter canary deployment, where they handle a fraction of production traffic while being monitored for unexpected quality regressions.

**Phase 5 -- Full Promotion or Retirement**: Templates that maintain quality gains during canary deployment are promoted to primary status. Templates that regress are retired, and their experimental data feeds back into the evolution engine for future mutation attempts.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Template library coverage | > 95% of use cases | 97% |
| A/B experiment throughput | > 10/month | 14/month |
| Template quality improvement rate | > 5%/quarter | 7.2%/quarter |
| Output structure compliance | > 95% | 96.8% |
| Token efficiency (quality/token) | > 0.85 | 0.88 |
| Cross-provider consistency | > 90% | 92% |

## NABLA Compliance

**Signal Plurality**: Template quality assessment uses multiple independent signals: output quality score, token efficiency, structural compliance rate, and downstream processing success rate. No single metric determines template promotion or retirement.

**Provenance Mandatory**: All A/B test results carry complete provenance including test configuration, input dataset, model version, timestamp, and statistical analysis methodology. This enables audit and reproduction of any template promotion decision.

**Time Decay**: Template performance metrics decay over time, reflecting the reality that model updates and changing use patterns can erode template effectiveness. Periodic re-evaluation ensures that templates remain optimized for current conditions.

## Enforcement

Prompt engineering operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No prompt template is deployed to production without measured quality metrics from testing. Prompts that consistently produce low-quality or unstructured outputs are immediately retired. The NABLA Evidence axioms require all prompt performance claims to be backed by quantitative A/B test results rather than subjective assessment.

## Related Resources

- [chatgpt-integration-commander](@/agents/chatgpt-integration-commander.md) -- API integration management
- [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) -- Context window optimization
- [chatgpt-consultation-coordinator](@/agents/chatgpt-consultation-coordinator.md) -- Consultation workflow management
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Performance monitoring
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)