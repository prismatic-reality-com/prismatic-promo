+++
title = "LLM Routing Orchestrator Agent"
weight = 230
[extra]
domain = "llm"
level = "L3"
description = "The LLM Routing Orchestrator agent provides master coordination for intelligent LLM routing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "seadf", "telemetry", "no-mercy"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["LLM", "Routing", "Orchestrator", "Agent", "agents", "Prismatic Platform", "Ollama", "OpenRouter", "Claude"]
tags = ["agents", "agent", "llm-routing-orchestrator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "LLM Routing Orchestrator Agent - Prismatic Platform"
+++

## Overview

The LLM Routing Orchestrator Agent operates as an L3 strategic command authority within the LLM domain of the Prismatic Platform. This agent provides master coordination for intelligent LLM routing, dynamically selecting the optimal model and provider for each request based on task complexity, cost constraints, latency requirements, and provider health status. By maintaining real-time awareness of provider capabilities, pricing, and availability, the orchestrator ensures that every LLM request is routed to the most appropriate backend.

The Prismatic Platform integrates multiple LLM providers -- [Ollama](/glossary/ollama/) for local inference, Claude for complex reasoning, OpenRouter for model diversity -- each with distinct capabilities, cost profiles, and latency characteristics. Without intelligent routing, teams default to the most expensive model for every request, wasting budget on simple tasks that local models handle effectively. The LLM Routing Orchestrator eliminates this waste by matching task requirements to provider capabilities in real-time.

## Routing Architecture

The orchestrator implements a multi-factor routing decision engine that evaluates each request against provider capabilities.

```elixir
defmodule PrismaticAgents.LLMRouting do
  @moduledoc """
  Intelligent LLM routing orchestrator that selects
  optimal model and provider for each request.
  """

  use GenServer

  @type routing_decision :: %{
    provider: atom(),
    model: String.t(),
    reason: String.t(),
    estimated_cost: float(),
    estimated_latency_ms: non_neg_integer(),
    fallback: routing_decision() | nil
  }

  @type request_profile :: %{
    complexity: :simple | :moderate | :complex | :expert,
    max_latency_ms: non_neg_integer(),
    max_cost_tokens: non_neg_integer(),
    requires_code: boolean(),
    requires_reasoning: boolean(),
    context_length: non_neg_integer()
  }

  @spec route(String.t(), keyword()) :: {:ok, routing_decision()} | {:error, term()}
  def route(prompt, opts \\ []) do
    GenServer.call(__MODULE__, {:route, prompt, opts})
  end

  @impl true
  def handle_call({:route, prompt, opts}, _from, state) do
    profile = analyze_request(prompt, opts)
    providers = get_healthy_providers(state.provider_health)
    decision = select_optimal_route(profile, providers, state.cost_budget)

    emit_telemetry(:routing_decision, decision)
    {:reply, {:ok, decision}, update_routing_history(state, decision)}
  end

  defp select_optimal_route(profile, providers, budget) do
    providers
    |> score_providers(profile, budget)
    |> Enum.sort_by(& &1.score, :desc)
    |> build_decision_with_fallback()
  end
end
```

## Provider Registry

The orchestrator maintains a real-time registry of available LLM providers with their capabilities, health status, and cost metrics.

| Provider | Models | Strengths | Latency | Cost | Health Check |
|---|---|---|---|---|---|
| Ollama (Local) | qwen3-coder, deepseek-coder, gpt-oss:20b | Fast, free, privacy | < 3s | Free | Heartbeat |
| Claude API | opus, sonnet | Complex reasoning, code | 2-15s | High | API health |
| OpenRouter | 50+ models | Model diversity, fallback | 1-30s | Variable | API health |

## Routing Decision Matrix

| Task Type | Complexity | Preferred Provider | Model | Fallback |
|---|---|---|---|---|
| Code generation | Simple | Ollama | qwen3-coder | OpenRouter |
| Code generation | Complex | Claude | opus | OpenRouter |
| Documentation | Simple | Ollama | gpt-oss:20b | Claude |
| Reasoning/Analysis | Complex | Claude | opus | OpenRouter |
| Bulk processing | Any | Ollama | qwen3-coder | OpenRouter |
| Real-time chat | Simple | Ollama | qwen3-coder | Claude |

## Circuit Breaker Integration

Each provider connection is protected by a [circuit breaker](/glossary/circuit-breaker/) that prevents cascading failures when a provider becomes unavailable.

```elixir
defmodule PrismaticAgents.LLMRouting.CircuitBreaker do
  @failure_threshold 3
  @recovery_timeout_ms :timer.seconds(60)

  @type breaker_state :: :closed | :open | :half_open

  @spec check_provider(atom()) :: {:ok, :available} | {:error, :circuit_open}
  def check_provider(provider) do
    case get_breaker_state(provider) do
      :closed -> {:ok, :available}
      :half_open -> {:ok, :available}
      :open -> {:error, :circuit_open}
    end
  end

  @spec record_failure(atom()) :: :ok
  def record_failure(provider) do
    failures = increment_failure_count(provider)
    if failures >= @failure_threshold, do: open_circuit(provider)
    :ok
  end
end
```

## Cost Optimization

The orchestrator tracks token consumption and cost across all providers to optimize budget allocation.

| Metric | Tracking | Optimization |
|---|---|---|
| Tokens per request | Per-provider, per-model | Route to cheapest adequate model |
| Monthly spend | Aggregate across providers | Budget alerts at 80% threshold |
| Cost per task type | Categorized by complexity | Identify over-spending patterns |
| Local vs. cloud ratio | Ollama vs. API usage | Maximize local model usage |

## Key Capabilities

- **Dynamic provider selection** routing each LLM request to the optimal provider based on real-time assessment of task complexity, cost constraints, and provider health
- **Multi-provider fallback** maintaining ordered fallback chains for each provider, ensuring request completion even when primary providers are unavailable
- **Circuit breaker protection** preventing cascading failures through per-provider circuit breakers with configurable failure thresholds and recovery timeouts
- **Cost-aware routing** tracking token consumption across all providers and optimizing routing decisions to minimize cost while maintaining output quality
- **Latency optimization** selecting providers that meet latency requirements for time-sensitive operations, preferring local Ollama models for sub-second response needs
- **Request profiling** analyzing prompt complexity, context length, and task type to build request profiles that inform routing decisions

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination for LLM operations. The orchestrator has authority to route requests across all providers, manage circuit breaker states, and set cost budget allocations.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [ollama-coordinator](/agents/ollama-coordinator/) | Local Provider | Manages Ollama model lifecycle and local inference |
| [llm-cost-manager](/agents/llm-cost-manager/) | Cost Tracking | Provides detailed cost analysis for routing optimization |
| [llm-fallback-coordinator](/agents/llm-fallback-coordinator/) | Fallback Management | Coordinates fallback routing when primary providers fail |
| [llm-performance-optimizer](/agents/llm-performance-optimizer/) | Performance Tuning | Optimizes routing parameters based on performance telemetry |

## Integration

| Component | Relationship |
|---|---|
| [Ollama](/glossary/ollama/) | Local LLM inference provider |
| [Circuit Breaker](/glossary/circuit-breaker/) | Provider health management |
| Platform [Telemetry](/glossary/telemetry/) | Routing metrics, latency, and cost tracking |
| [NABLA Infinity](/glossary/nabla-infinity/) | Multi-signal routing decision evidence |

## Enforcement

The LLM Routing Orchestrator operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. All routing decisions are logged with full evidence including request profile, provider scores, and selection rationale. Cost budget overruns trigger automatic routing policy adjustments. Provider health degradation triggers immediate circuit breaker activation. No LLM request is sent to an unhealthy provider. Routing decisions maintain complete [audit trail](/glossary/audit-trail/) provenance for cost and quality analysis.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)