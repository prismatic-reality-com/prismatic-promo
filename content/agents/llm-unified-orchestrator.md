+++
title = "llm-unified-orchestrator"
weight = 231
[extra]
domain = "general"
level = "L2"
description = "Strategic orchestration of multi-provider LLM operations with 3NL integration"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "3nl"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-unified-orchestrator", "Strategic", "agents", "agent", "Prismatic Platform", "Retry", "Orchestrator", "Layer"]
tags = ["agents", "agent", "llm-unified-orchestrator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-unified-orchestrator - Prismatic Platform"
+++

## Overview

The LLM Unified Orchestrator operates as an L2 tactical operations agent providing strategic orchestration of multi-provider LLM operations with [3NL](@/glossary/three-nl.md) (Three-Normative-Layer) integration within the Prismatic Platform. This agent serves as the unified execution layer that receives routed LLM requests and manages the complete lifecycle of each request through prompt construction, provider API interaction, response validation, and result integration back into the platform's intelligence pipeline.

While the LLM Routing Orchestrator decides where to send requests, the Unified Orchestrator handles how requests are executed. This includes prompt template management, context window optimization, response quality validation, retry handling, and integration with the 3NL framework for linguistically-aware response processing. The orchestrator ensures that LLM responses meet quality thresholds before they influence platform decisions.

## Operational Domain

The orchestrator operates across the general domain, serving as the execution backbone for all LLM operations regardless of the requesting agent's domain. It interfaces with the 3NL framework to apply linguistic normalization to prompts and semantic analysis to responses, ensuring that LLM interactions maintain consistent quality across different providers and models.

## Request Execution Pipeline

```elixir
defmodule PrismaticAgents.LLMUnifiedOrchestrator do
  @moduledoc """
  Unified LLM request execution orchestrator with 3NL integration.
  Manages the complete lifecycle of LLM requests across all providers.
  """

  use GenServer

  @max_retries 3
  @quality_threshold 0.75

  @type llm_request :: %{
    prompt: String.t(),
    provider: atom(),
    model: String.t(),
    context: [map()],
    temperature: float(),
    max_tokens: non_neg_integer(),
    quality_requirements: map()
  }

  @type llm_response :: %{
    content: String.t(),
    provider: atom(),
    model: String.t(),
    tokens_used: non_neg_integer(),
    quality_score: float(),
    latency_ms: non_neg_integer(),
    metadata: map()
  }

  @spec execute(llm_request()) :: {:ok, llm_response()} | {:error, term()}
  def execute(request) do
    GenServer.call(__MODULE__, {:execute, request}, :timer.minutes(5))
  end

  @impl true
  def handle_call({:execute, request}, _from, state) do
    with {:ok, prepared} <- prepare_prompt(request),
         {:ok, optimized} <- optimize_context_window(prepared),
         {:ok, raw_response} <- call_provider(optimized),
         {:ok, validated} <- validate_response(raw_response, request),
         {:ok, processed} <- apply_3nl_processing(validated) do
      response = build_response(processed, request)
      {:reply, {:ok, response}, update_metrics(state, response)}
    else
      {:error, :quality_below_threshold} ->
        handle_quality_retry(request, state)
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## 3NL Integration

The orchestrator integrates with the Three-Normative-Layer framework for linguistically-aware LLM operations.

| 3NL Layer | Function in LLM Context | Application |
|---|---|---|
| L1 Logic | Structural prompt validation | Ensure prompts are logically coherent |
| L2 Neural | Semantic similarity analysis | Validate response relevance to prompt |
| L3 Linguistic | Natural language normalization | Normalize responses for consistent formatting |

```elixir
defmodule PrismaticAgents.LLMUnifiedOrchestrator.ThreeNL do
  @spec process_response(String.t(), String.t()) :: {:ok, processed_response()}
  def process_response(response, original_prompt) do
    with {:ok, l1} <- validate_logical_structure(response),
         {:ok, l2} <- assess_semantic_relevance(response, original_prompt),
         {:ok, l3} <- normalize_linguistic_output(response) do
      {:ok, %{content: l3, logic_valid: l1, relevance_score: l2}}
    end
  end
end
```

## Context Window Optimization

The orchestrator optimizes context window usage to maximize the useful information sent to LLMs while staying within token limits.

| Optimization Strategy | Technique | Token Savings |
|---|---|---|
| Context pruning | Remove irrelevant prior messages | 20-40% |
| Summary compression | Compress long contexts into summaries | 30-60% |
| Priority ordering | Place critical context near prompt end | Improved quality |
| Template reuse | Use cached prompt templates | 5-15% |
| Token counting | Pre-count tokens before submission | Prevents truncation |

## Response Quality Validation

Every LLM response undergoes quality validation before being accepted.

| Quality Check | Method | Threshold | Failure Action |
|---|---|---|---|
| Completeness | Response length vs expected | > 50% of expected | Retry with clarification |
| Relevance | 3NL L2 semantic similarity | > 0.75 similarity | Retry with refined prompt |
| Format compliance | Expected structure check | 100% structure match | Parse and reformat |
| Factual consistency | Cross-reference with context | No contradictions | Flag for review |
| Code validity | Syntax check for code responses | Must compile | Retry with error context |

## Key Capabilities

- **Multi-provider execution** managing LLM request lifecycle across [Ollama](@/glossary/ollama.md), Claude, and OpenRouter with provider-specific API handling and error normalization
- **3NL linguistic processing** applying three-layer linguistic analysis to prompts and responses for quality assurance and consistency
- **Context window optimization** intelligently managing context to maximize information density within token limits for each provider and model
- **Response quality validation** enforcing quality thresholds on all LLM responses with automatic retry and prompt refinement for substandard results
- **Retry with refinement** automatically retrying failed or low-quality responses with prompt modifications informed by the specific failure mode
- **Cross-provider consistency** normalizing response formats across different LLM providers to present a uniform interface to consuming agents

## Authority Level

**L2** - Tactical Operations. Domain-specific [tactical execution](@/glossary/tactical-execution.md) with cross-domain coordination capabilities. The orchestrator executes LLM requests as directed by the routing layer and reports quality metrics back for routing optimization.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [llm-routing-orchestrator-agent](@/agents/llm-routing-orchestrator-agent.md) | Routing Authority | Receives routing decisions and reports execution outcomes |
| [llm-prompt-engineer](@/agents/llm-prompt-engineer.md) | Prompt Optimization | Collaborates on prompt template design and optimization |
| [llm-context-optimizer](@/agents/llm-context-optimizer.md) | Context Management | Assists with context window optimization strategies |
| [3nl-coordinator](@/agents/3nl-coordinator.md) | 3NL Integration | Provides three-layer normative processing for LLM interactions |

## Integration

| Component | Relationship |
|---|---|
| [3NL](@/glossary/three-nl.md) Framework | Linguistic normalization and semantic analysis |
| [Ollama](@/glossary/ollama.md) | Local LLM inference execution |
| Platform [Telemetry](@/glossary/telemetry.md) | Request metrics, quality scores, and latency tracking |
| [SEADF](@/glossary/seadf.md) | Evolutionary optimization of prompt templates |

## Enforcement

The LLM Unified Orchestrator operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. All LLM responses must meet quality thresholds before acceptance. Responses that fail quality validation are retried up to the configured maximum with progressive prompt refinement. Token consumption is tracked and reported for every request. No LLM response influences platform decisions without passing 3NL validation. All request-response pairs are logged with full provenance for quality analysis and prompt optimization.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)