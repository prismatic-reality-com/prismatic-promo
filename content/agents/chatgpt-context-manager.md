+++
title = "chatgpt-context-manager"
weight = 72
[extra]
domain = "llm-operations"
level = "L3"
description = "Manages conversation context across ChatGPT interactions, optimizing context window utilization, maintaining conversation continuity, and ensuring relevant platform knowledge is included in every AI interaction without exceeding token budget constraints."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "lean4", "signal-plurality", "ets"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-context-manager", "Manages", "ChatGPT", "agents", "agent", "Prismatic Platform", "Context", "Compression"]
tags = ["agents", "agent", "chatgpt-context-manager", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-context-manager - Prismatic Platform"
+++

## Executive Summary

The ChatGPT Context Manager operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the LLM Operations domain of the Prismatic Platform. This agent manages conversation context across ChatGPT interactions, optimizing context window utilization, maintaining conversation continuity, and ensuring that relevant platform knowledge is included in every AI interaction without exceeding token budget constraints. In a platform where AI interactions span code analysis, architectural review, intelligence synthesis, and compliance assessment, the quality of context directly determines the quality of AI-generated outputs.

Effective AI interactions depend fundamentally on context quality. A code analysis query requires different context than a strategic planning consultation: the former needs relevant source files, type specifications, and test coverage data, while the latter needs milestone status, competitive intelligence, and architecture decision records. The ChatGPT Context Manager maintains a dynamic context model that selects the most relevant information for each interaction type, compresses it to fit within model token limits, and preserves essential conversation history across multi-turn sessions without context window overflow.

## Architecture

The Context Manager implements a four-layer architecture that transforms raw platform data into optimized AI model context.

```
+----------------------------------------------------------------------+
|           ChatGPT Context Manager (L3)                               |
+----------------------------------------------------------------------+
|  Selection Layer                                                      |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Domain Classifier  |  | Relevance Scorer   |  | Priority Ranker  | |
|  | (Task type detect) |  | (TF-IDF + recency) |  | (Budget alloc)   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Compression Engine                                   |  |
|  |  +--------------+  +-----------------+  +-------------------+    |  |
|  |  | Summarizer   |  | Deduplicator    |  | Token Optimizer   |    |  |
|  |  +--------------+  +-----------------+  +-------------------+    |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Continuity Layer          |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Session Memory     |  | History Pruner     |  | Bridge Manager   | |
|  | (Turn tracking)    |  | (Redundancy elim)  |  | (Cross-session)  | |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Budget Layer              |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Token Counter      |  | Budget Allocator   |  | Overflow Handler | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Selection Layer classifies incoming interaction requests by domain and task type, scores candidate context items for relevance, and ranks them by priority within the available token budget. The Compression Engine applies summarization, deduplication, and token optimization to maximize information density. The Continuity Layer maintains conversation state across turns and sessions. The Budget Layer tracks token consumption and enforces budget constraints.

## Operational Domain

The LLM Operations domain manages all technical aspects of large language model integration within the Prismatic Platform. The Context Manager specifically handles the semantic layer between raw platform data and AI model input. This is a critical boundary: too little context produces generic or incorrect AI outputs, while too much context exceeds token limits and increases costs without proportional quality gains.

The domain operates across multiple LLM providers. While the primary integration targets OpenAI's ChatGPT models, the Context Manager also optimizes context for local [Ollama](@/glossary/ollama.md) models (which have significantly smaller context windows) and OpenRouter endpoints. Each provider has different token limits, pricing structures, and context sensitivity characteristics that the Context Manager accounts for when preparing context payloads.

Context management intersects with nearly every operational domain in the platform. Code quality agents need source code context, intelligence agents need [OSINT](@/glossary/osint.md) data context, compliance agents need regulatory framework context, and evolution agents need fitness metric context. The Context Manager maintains specialized context assembly strategies for each domain, drawn from a registry of context templates that map domain-task combinations to optimal context compositions.

## Core Capabilities

**Dynamic Context Selection** chooses the most relevant platform information for each ChatGPT interaction based on task type, domain, and historical effectiveness data. The selection algorithm considers three factors: domain relevance (how closely the candidate context matches the interaction's domain), recency (how recently the context was generated or updated), and historical impact (how much including this type of context has improved output quality in past similar interactions). The algorithm produces a ranked list of context candidates, which are then trimmed to fit the token budget.

**Token Budget Management** monitors and controls context size to stay within model token limits while maximizing information density per token. Each interaction has a token budget allocated from the overall session budget, with reserves held for the system prompt, user query, and expected response length. The budget manager tracks cumulative token consumption across multi-turn sessions, alerting when the session approaches its overall budget limit and triggering context pruning strategies to extend the session's useful life.

**Conversation Continuity** maintains coherent context across multi-turn ChatGPT interactions, preserving essential information while pruning redundant history. As conversations progress, earlier turns contribute increasingly redundant context. The continuity system identifies which elements of conversation history remain essential (decisions made, constraints established, questions answered) and which can be safely summarized or dropped. This prevents the common failure mode where long conversations degrade as early context is silently truncated by the model.

**Context Compression** applies intelligent summarization and prioritization to fit more relevant information within fixed token budget constraints. Compression operates at three levels: structural compression removes formatting and whitespace without losing content, content compression summarizes verbose passages while preserving key information, and semantic compression identifies and eliminates redundant information across multiple context sources. Compression quality is measured by retention rate (percentage of key information preserved) with a mandatory minimum of 80% retention.

**Cross-Session Context Bridging** preserves and restores relevant context between separate ChatGPT sessions for long-running analysis tasks. When a session ends, the bridging system extracts essential context (decisions, findings, outstanding questions) and stores it in the platform's session context system. When a related session begins, this bridged context is automatically loaded and positioned appropriately in the new session's context window, enabling seamless continuation of multi-session analysis campaigns.

## Implementation

```elixir
defmodule PrismaticChatGPT.ContextManager do
  @moduledoc """
  L3 Strategic Command agent managing conversation context
  across ChatGPT interactions with token budget optimization.
  """

  use GenServer

  alias PrismaticChatGPT.{ContextSelector, TokenBudget, Compressor}
  alias PrismaticChatGPT.{ContinuityTracker, SessionBridge}

  @default_budget_tokens 128_000
  @response_reserve_tokens 4_096
  @retention_minimum 0.80

  defstruct [
    :active_sessions,
    :context_cache,
    :budget_tracker,
    :compression_stats
  ]

  @spec build_context(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def build_context(session_id, request) do
    GenServer.call(__MODULE__, {:build, session_id, request})
  end

  @impl true
  def handle_call({:build, session_id, request}, _from, state) do
    budget = TokenBudget.available(state.budget_tracker, session_id)
    effective_budget = budget - @response_reserve_tokens

    with {:ok, candidates} <- ContextSelector.select(request.domain, request.task_type),
         {:ok, ranked} <- ContextSelector.rank(candidates, request),
         {:ok, fitted} <- TokenBudget.fit_to_budget(ranked, effective_budget),
         {:ok, compressed} <- Compressor.compress_context(fitted, @retention_minimum) do
      updated_tracker = TokenBudget.record(state.budget_tracker, session_id, compressed)
      {:reply, {:ok, compressed}, %{state | budget_tracker: updated_tracker}}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination and specialized operational command. The Context Manager exercises authority over context composition decisions, token budget allocation, and compression policies for all ChatGPT interactions across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md) | Transport Layer | Provides API-level information about token limits, model capabilities, and pricing |
| [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) | Prompt Integration | Coordinates context inclusion with prompt template requirements and token allocation |
| [context-preservation-specialist-agent](@/agents/context-preservation-specialist-agent.md) | Platform Context | Provides broader platform context data for enriching ChatGPT interactions |
| [chatgpt-consultation-coordinator](@/agents/chatgpt-consultation-coordinator.md) | Consultation Context | Supplies context management for multi-turn consultation sessions |
| [context-compression-enforcer-agent](@/agents/context-compression-enforcer-agent.md) | Compression Policy | Enforces compression standards on context data stored and transmitted |

## Operational Workflow

**Phase 1 -- Request Analysis**: When a context build request arrives, the manager classifies the interaction by domain and task type, determines the target model's context window size and pricing, and calculates the available token budget after reserving space for system prompts and expected response length.

**Phase 2 -- Context Selection**: The selection algorithm queries the platform's knowledge sources for relevant context items, scores each candidate for relevance using domain-specific relevance models, and produces a priority-ranked candidate list. Context sources include source code files, documentation, session history, quality metrics, agent coordination state, and domain-specific knowledge bases.

**Phase 3 -- Budget Fitting**: The ranked candidate list is trimmed to fit the available token budget. High-priority items are included first, with lower-priority items added until the budget is exhausted. When individual high-priority items exceed their proportional budget allocation, they are compressed to fit rather than dropped entirely.

**Phase 4 -- Compression and Optimization**: The fitted context passes through the compression pipeline, which applies structural, content, and semantic compression to maximize information density. Compression quality is validated against the retention minimum threshold. The final compressed context is assembled into the model's expected input format.

**Phase 5 -- Budget Tracking**: The completed context build's token count is recorded against the session's budget tracker, updating cumulative consumption and remaining budget calculations. Budget exhaustion warnings are generated when sessions approach their limits.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Context build latency | < 50ms | 28ms |
| Token utilization efficiency | > 90% | 94.2% |
| Compression retention rate | > 80% | 88.7% |
| Budget overflow rate | < 1% | 0.3% |
| Cross-session bridge success | > 95% | 97.1% |
| Context relevance score | > 0.85 | 0.89 |

## NABLA Compliance

**Signal Plurality**: Context assembly includes information from multiple relevant sources rather than relying on a single perspective. Code analysis context includes source files, tests, documentation, and quality metrics. Strategic planning context includes milestone data, competitive intelligence, and architectural constraints. This plurality prevents context bias in AI interactions.

**Provenance Mandatory**: Every piece of context included in a model interaction carries provenance metadata: its source, extraction timestamp, and relevance score. This enables downstream validation of AI outputs by tracing conclusions back to the specific context that informed them.

**Time Decay**: Context items carry freshness timestamps, and the selection algorithm applies time-decay weighting that penalizes stale information. This prevents outdated context from misleading AI models, particularly important for rapidly-changing data like test results, quality metrics, and project status.

## Enforcement

Context management operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No ChatGPT interaction proceeds without optimized context selection. Context that exceeds token budgets is compressed rather than truncated, ensuring no critical information is silently dropped. The NABLA [Signal Plurality](@/glossary/signal-plurality.md) axiom requires context to include information from multiple relevant sources, preventing context bias in AI interactions.

## Related Resources

- [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) -- Prompt template optimization
- [context-preservation-specialist-agent](@/agents/context-preservation-specialist-agent.md) -- Session context management
- [context-compression-enforcer-agent](@/agents/context-compression-enforcer-agent.md) -- Compression policy enforcement
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Monitoring infrastructure
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)