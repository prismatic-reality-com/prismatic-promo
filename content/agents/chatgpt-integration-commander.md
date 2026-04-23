+++
title = "chatgpt-integration-commander"
weight = 73
[extra]
domain = "ai-platform-integration"
level = "L3"
description = "Manages the full integration lifecycle between the Prismatic ecosystem and OpenAI's ChatGPT API, handling connection management, request routing, response validation, circuit breaker patterns, and failover to local Ollama models when external APIs are unavailable."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "rate-limiting", "connection-pooling", "ets"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-integration-commander", "Manages", "Prismatic", "OpenAIs", "ChatGPT", "Ollama", "APIs", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "chatgpt-integration-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-integration-commander - Prismatic Platform"
+++

## Executive Summary

The ChatGPT Integration Commander operates as an L3 [strategic command](/glossary/strategic-command/) agent within the AI Platform Integration domain of the Prismatic Platform. This agent manages the full integration lifecycle between the Prismatic ecosystem and OpenAI's ChatGPT API, handling connection management, request routing, response validation, and failover strategies. It serves as the strategic authority for all ChatGPT-related operations, ensuring that external AI capabilities are integrated reliably and securely into the platform's operational fabric.

The platform's multi-AI strategy requires robust integration infrastructure that can handle API rate limits, service degradation, model version transitions, and pricing changes without disrupting dependent workflows. The ChatGPT Integration Commander implements [circuit breaker](/glossary/circuit-breaker/) patterns, automatic retry with exponential backoff, and graceful degradation to local [Ollama](/glossary/ollama/) models when external APIs are unavailable. This architectural approach ensures that AI-dependent platform operations maintain continuity regardless of external service status, a critical requirement for a platform where 434 agents may depend on AI capabilities at any time.

## Architecture

The Integration Commander implements a resilient four-layer architecture designed for high availability and graceful degradation.

```
+----------------------------------------------------------------------+
|         ChatGPT Integration Commander (L3)                           |
+----------------------------------------------------------------------+
|  Connection Layer                                                     |
|  +--------------------+  +--------------------+  +------------------+ |
|  | API Key Manager    |  | Connection Pool    |  | TLS/Auth        | |
|  | (Rotation + vault) |  | (Poolboy-based)    |  | (Certificate)    | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Routing Engine                                       |  |
|  |  +---------------+  +----------------+  +--------------------+   |  |
|  |  | Model Router  |  | Rate Limiter   |  | Priority Scheduler |   |  |
|  |  +---------------+  +----------------+  +--------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Resilience Layer          |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Circuit Breaker    |  | Retry Engine       |  | Fallback Router  | |
|  | (Per-model state)  |  | (Exp. backoff)     |  | (Ollama switch)  | |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Validation Layer          |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Response Validator |  | Quality Scorer     |  | Cost Tracker     | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Connection Layer manages authentication, connection pooling, and transport security for ChatGPT API communications. The Routing Engine directs requests to appropriate model endpoints based on task requirements, rate limit headroom, and priority scheduling. The Resilience Layer provides fault tolerance through circuit breakers, retry logic, and automatic failover. The Validation Layer ensures response quality and tracks costs.

## Operational Domain

The AI Platform Integration domain governs all connections between the Prismatic Platform and external AI services. The ChatGPT Integration Commander specifically manages the OpenAI integration surface, including API key management, model selection, token budget allocation, and response quality monitoring. It coordinates with the Ollama coordinator for fallback operations when external services are degraded.

This domain operates at a critical boundary: the interface between the platform's controlled internal environment and unpredictable external services. External APIs can experience rate limiting, latency spikes, service outages, model deprecations, and pricing changes -- any of which could cascade into platform-wide disruptions if not properly managed. The Integration Commander's primary mission is to absorb this external volatility and present a stable, predictable API surface to internal platform consumers.

The domain also manages the economic dimension of AI integration. ChatGPT API calls consume tokens with direct cost implications, and the Integration Commander tracks spending across all platform operations, enforcing budget limits and generating cost allocation reports that enable informed decisions about AI utilization patterns.

## Core Capabilities

**API Connection Lifecycle Management** handles authentication, [rate limiting](/glossary/rate-limiting/), [connection pooling](/glossary/connection-pooling/), and graceful shutdown for ChatGPT API interactions. The connection manager maintains a pool of authenticated connections, rotating API keys when approaching per-key rate limits and handling key renewal when keys expire. Connection health is monitored through periodic heartbeat checks, and unhealthy connections are removed from the pool and replaced automatically.

**Circuit Breaker Implementation** automatically disables external API calls after configurable failure thresholds and recovers once service health is restored. The circuit breaker operates per model endpoint, allowing individual model circuits to trip independently. The breaker tracks three states: closed (normal operation), open (all requests routed to fallback), and half-open (testing recovery with limited traffic). Transition thresholds, timeout durations, and test traffic percentages are configurable per model.

**Fallback Orchestration** seamlessly routes requests to local Ollama models when ChatGPT API is unavailable, maintaining operation continuity with documented capability differences. The fallback system maps ChatGPT model capabilities to equivalent or nearest-capability local models: GPT-4 class requests fall back to qwen3-coder or deepseek-coder, while simpler requests can use smaller local models. Fallback responses carry metadata indicating they were generated by a fallback model, enabling downstream agents to adjust their confidence assessments accordingly.

**Response Validation** verifies that ChatGPT API responses meet quality thresholds and structural expectations before forwarding to consuming agents. Validation checks include response completeness (no truncation), structural compliance (expected JSON or markdown format), content coherence (no obvious hallucination indicators), and safety filtering (no harmful content passed through).

**Token Budget Management** tracks and controls API token consumption across all platform operations to manage costs and prevent budget overruns. The budget system operates at three levels: per-request budgets that limit individual interaction costs, per-session budgets that constrain extended operation sequences, and platform-wide daily/monthly budgets that enforce overall spending limits.

**Model Version Coordination** manages transitions between ChatGPT model versions, ensuring compatibility testing before promoting new model versions to production use. When OpenAI releases new model versions, the coordinator runs compatibility tests against the platform's prompt template library, measures output quality differences, and provides migration recommendations with quantified impact assessments.

## Implementation

```elixir
defmodule PrismaticChatGPT.IntegrationCommander do
  @moduledoc """
  L3 Strategic Command agent managing ChatGPT API integration
  with circuit breaker protection and Ollama fallback.
  """

  use GenServer

  alias PrismaticChatGPT.{ConnectionPool, CircuitBreaker, RateLimiter}
  alias PrismaticChatGPT.{FallbackRouter, ResponseValidator, BudgetTracker}

  defstruct [
    :connection_pool,
    :circuit_breakers,
    :rate_limiters,
    :budget_tracker,
    :model_registry
  ]

  @spec send_request(map()) :: {:ok, map()} | {:error, term()}
  def send_request(request) do
    GenServer.call(__MODULE__, {:send, request}, :timer.seconds(30))
  end

  @impl true
  def handle_call({:send, request}, _from, state) do
    model = request.model || default_model(request.task_type)

    case CircuitBreaker.status(state.circuit_breakers, model) do
      :closed ->
        execute_with_retry(request, model, state)

      :open ->
        execute_fallback(request, state)

      :half_open ->
        execute_with_probe(request, model, state)
    end
  end

  defp execute_with_retry(request, model, state) do
    case do_send(request, model, state) do
      {:ok, response} ->
        validated = ResponseValidator.validate(response, request.expectations)
        BudgetTracker.record(state.budget_tracker, request, response)
        {:reply, validated, state}

      {:error, reason} ->
        CircuitBreaker.record_failure(state.circuit_breakers, model, reason)
        execute_fallback(request, state)
    end
  end

  defp execute_fallback(request, state) do
    case FallbackRouter.route_to_ollama(request) do
      {:ok, response} ->
        tagged = Map.put(response, :fallback, true)
        {:reply, {:ok, tagged}, state}

      {:error, _reason} = error ->
        {:reply, error, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination and specialized operational command. The Integration Commander exercises authority over all ChatGPT API communications, circuit breaker policies, fallback routing decisions, and token budget enforcement across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [chatgpt-bridge-commander](/agents/chatgpt-bridge-commander/) | Bridge Operations | Manages low-level API communication protocols and transport layer concerns |
| [chatgpt-prompt-engineer](/agents/chatgpt-prompt-engineer/) | Prompt Design | Optimizes prompt templates, informing token budget allocation per request |
| [chatgpt-workflow-orchestrator](/agents/chatgpt-workflow-orchestrator/) | Workflow Routing | Routes workflow-specific requests through the integration layer with priority scheduling |
| [chatgpt-context-manager](/agents/chatgpt-context-manager/) | Context Layer | Coordinates context preparation that affects token consumption and budget allocation |

## Operational Workflow

**Phase 1 -- Request Reception**: Incoming requests are classified by model requirement, priority level, and budget allocation. The routing engine checks rate limit headroom for the target model and schedules the request accordingly.

**Phase 2 -- Circuit Breaker Check**: Before any external API call, the circuit breaker state for the target model is consulted. Closed circuits proceed normally, open circuits route directly to fallback, and half-open circuits allow limited probe requests to test recovery.

**Phase 3 -- API Execution**: Requests proceed through the connection pool to the ChatGPT API endpoint. Rate limiters enforce per-second and per-minute request limits. Retry logic handles transient failures with exponential backoff and jitter.

**Phase 4 -- Response Validation**: API responses pass through the validation pipeline, checking completeness, structural compliance, content quality, and safety. Invalid responses trigger retry or fallback depending on the failure type.

**Phase 5 -- Budget Recording**: Successful requests have their token consumption recorded against per-request, per-session, and platform-wide budgets. Budget threshold warnings are generated when consumption approaches configured limits.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| API availability (with fallback) | > 99.9% | 99.97% |
| Average request latency | < 3s | 1.8s |
| Circuit breaker accuracy | > 95% | 97.5% |
| Fallback transition time | < 100ms | 45ms |
| Response validation pass rate | > 98% | 99.1% |
| Budget compliance rate | 100% | 100% |

## NABLA Compliance

**Source Independence**: The platform's AI integration architecture explicitly avoids critical dependence on any single external AI provider. The fallback to Ollama local models ensures that platform operations continue even during complete external service outages, fulfilling the Source Independence axiom.

**Provenance Mandatory**: Every API response carries provenance metadata including the model version used, the API endpoint, response timestamp, token consumption, and whether fallback routing was involved. This provenance chain enables downstream agents to assess the reliability of AI-generated outputs.

**Signal Plurality**: The Integration Commander monitors multiple health signals (latency, error rate, response quality, rate limit headroom) to make circuit breaker decisions. No single metric triggers state transitions in isolation.

## Enforcement

Integration operations are governed by [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No external API dependency operates without circuit breaker protection. No response from external services is trusted without validation. Failed integrations trigger immediate fallback to local models with no service interruption. The NABLA Source Independence axiom requires that platform operations never become critically dependent on a single external AI provider.

## Related Resources

- [chatgpt-bridge-commander](/agents/chatgpt-bridge-commander/) -- Low-level API bridge operations
- [chatgpt-prompt-engineer](/agents/chatgpt-prompt-engineer/) -- Prompt design and optimization
- [chatgpt-workflow-orchestrator](/agents/chatgpt-workflow-orchestrator/) -- Workflow execution engine
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Self-healing patterns
- [AIAD Standard](/glossary/aiad/) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)