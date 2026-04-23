+++
title = "retry-#{UUID.uuid4()}"
weight = 76
[extra]
domain = "llm-operations"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "lean4"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["retry-UUIDuuid4", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Multi", "Provider"]
tags = ["agents", "agent", "retry-uuiduuid4", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "retry-#{UUID.uuid4()} - Prismatic Platform"
+++

## Overview

The retry agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's LLM Operations domain, implementing intelligent retry logic for Large Language Model (LLM) API calls with exponential backoff, [circuit breaker](@/glossary/circuit-breaker.md) protection, and multi-provider failover. LLM operations are inherently unreliable -- API rate limits, transient network errors, model overload conditions, and provider outages make robust retry strategies essential for production intelligence pipelines that depend on LLM-generated analysis.

This agent implements the [OTP](@/glossary/otp.md) "let it crash" philosophy for LLM interactions: rather than attempting to handle every possible failure condition inline, the retry agent provides a supervised retry wrapper that handles transient failures automatically while escalating persistent failures through the platform's standard error handling pipeline. The retry strategy adapts dynamically based on failure patterns, distinguishing between rate-limit errors (which require backoff), network errors (which require retry), model errors (which may require provider switching), and content errors (which should not be retried).

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, the retry agent ensures that LLM operation failures are handled deterministically with explicit success/failure outcomes. No LLM call silently fails, no retry loop runs indefinitely, and no failure is swallowed without logging. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework applies to retry decision-making: the agent considers multiple signals (error type, failure history, provider health, queue depth) before choosing a retry strategy.

## Retry Strategy Architecture

The retry system implements a multi-layer strategy that adapts to the specific failure type encountered.

**Exponential backoff** is the default retry strategy for transient errors. Initial retry delay starts at 100ms and doubles with each attempt, with configurable jitter to prevent thundering herd effects when multiple LLM calls fail simultaneously. Maximum backoff is capped at 30 seconds, and maximum retry attempts default to 5 with configurable override.

**Circuit breaker protection** prevents cascading failures when an LLM provider experiences sustained outages. The circuit breaker monitors failure rates over a sliding window and transitions to "open" state when the failure rate exceeds the configured threshold. In open state, all requests are rejected immediately without contacting the provider, reducing load on a struggling service and providing fast failure feedback. After a configurable timeout, the circuit transitions to "half-open" state, allowing a single probe request to test provider recovery.

**Multi-provider failover** routes requests to alternative LLM providers when the primary provider is unavailable. The agent maintains a prioritized list of providers (Claude, [Ollama](@/glossary/ollama.md) local models, OpenRouter) and routes requests to the next available provider when the current provider's circuit breaker is open. Provider selection considers model capability requirements, latency targets, and cost constraints.

**Adaptive strategy selection** analyzes the error response to choose the appropriate retry behavior. HTTP 429 (rate limit) errors trigger backoff with the provider's suggested retry-after delay. HTTP 5xx errors trigger standard exponential backoff. HTTP 4xx errors (except 429) are not retried as they indicate request-level issues. Connection timeouts trigger immediate retry on an alternative provider.

## Key Capabilities

- **Intelligent retry with exponential backoff** -- Implements exponential backoff with jitter for transient failures, respecting provider rate-limit headers and configurable maximum attempts
- **[Circuit breaker](@/glossary/circuit-breaker.md) per provider** -- Maintains independent circuit breakers for each LLM provider, preventing cascading load on failing providers while allowing healthy providers to continue serving requests
- **Multi-provider failover** -- Routes requests to alternative providers when primary providers are unavailable, considering capability compatibility, latency, and cost in provider selection
- **Error classification** -- Analyzes error responses to distinguish retryable transient errors from permanent failures, preventing wasted retry attempts on non-recoverable errors
- **Request deduplication** -- Detects and prevents duplicate LLM requests during retry windows, avoiding redundant API costs and inconsistent results
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with automatic provider health monitoring and circuit breaker management
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for retry rate, failure classification, and provider health metric tracking

## Implementation Architecture

```elixir
defmodule PrismaticLLM.RetryAgent do
  @moduledoc """
  Intelligent retry logic for LLM API calls with exponential
  backoff, circuit breaker protection, and multi-provider failover.
  """

  use GenServer
  alias PrismaticLLM.{CircuitBreaker, ProviderRouter, ErrorClassifier}

  @type retry_opts :: %{
    max_attempts: pos_integer(),
    initial_delay_ms: pos_integer(),
    max_delay_ms: pos_integer(),
    jitter_factor: float(),
    providers: [atom()]
  }

  @default_opts %{
    max_attempts: 5,
    initial_delay_ms: 100,
    max_delay_ms: 30_000,
    jitter_factor: 0.25,
    providers: [:claude, :ollama, :openrouter]
  }

  @spec call_with_retry(map(), retry_opts()) ::
    {:ok, map()} | {:error, :exhausted} | {:error, term()}
  def call_with_retry(request, opts \\ @default_opts) do
    attempt_with_failover(request, opts, opts.providers, 0)
  end

  defp attempt_with_failover(_request, _opts, [], _attempt) do
    {:error, :all_providers_exhausted}
  end

  defp attempt_with_failover(request, opts, [provider | rest], attempt)
       when attempt >= opts.max_attempts do
    attempt_with_failover(request, opts, rest, 0)
  end

  defp attempt_with_failover(request, opts, [provider | _] = providers, attempt) do
    case CircuitBreaker.check(provider) do
      :open ->
        attempt_with_failover(request, opts, tl(providers), 0)
      _ ->
        case ProviderRouter.send(provider, request) do
          {:ok, response} -> {:ok, response}
          {:error, error} ->
            case ErrorClassifier.classify(error) do
              :retryable ->
                delay = calculate_delay(opts, attempt)
                Process.sleep(delay)
                attempt_with_failover(request, opts, providers, attempt + 1)
              :provider_down ->
                CircuitBreaker.record_failure(provider)
                attempt_with_failover(request, opts, tl(providers), 0)
              :permanent ->
                {:error, error}
            end
        end
    end
  end
end
```

## Error Classification Matrix

| Error Type | HTTP Code | Classification | Retry Strategy |
|------------|-----------|---------------|----------------|
| **Rate Limited** | 429 | Retryable | Backoff with Retry-After header |
| **Server Error** | 500-503 | Retryable | Exponential backoff |
| **Gateway Timeout** | 504 | Provider down | Failover to next provider |
| **Bad Request** | 400 | Permanent | No retry, return error |
| **Auth Failed** | 401/403 | Permanent | No retry, alert |
| **Connection Timeout** | N/A | Provider down | Immediate failover |
| **Model Overloaded** | 529 | Retryable | Extended backoff |

## Circuit Breaker States

| State | Behavior | Transition Trigger |
|-------|----------|-------------------|
| **Closed** | Normal operation, requests pass through | Failure rate >50% in 60s window |
| **Open** | All requests rejected immediately | Timeout (60 seconds default) |
| **Half-Open** | Single probe request allowed | Probe success -> Closed; Probe failure -> Open |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to manage LLM provider connections, implement retry strategies, and orchestrate multi-provider failover.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/llm-retry status` | Display circuit breaker states and retry statistics | L3+ |
| `/llm-retry providers` | List configured providers with health status | L3+ |
| `/llm-retry reset` | Reset circuit breakers for specified provider | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md) | Bridge operations use retry agent for API resilience |
| [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) | Context management depends on reliable LLM communication |
| [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) | Prompt engineering operations routed through retry infrastructure |

## Enforcement

LLM retry operations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no LLM call silently fails, every failure is logged with classification details, and retry exhaustion triggers explicit error propagation. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that retry decisions are based on error classification evidence, not arbitrary retry counts. The [Trinity Gate](@/glossary/trinity-gate.md) validates retry configuration consistency, ensuring that timeout values, retry limits, and circuit breaker thresholds are coherent across the LLM operations pipeline.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)