+++
title = "chatgpt-bridge-commander"
weight = 70
[extra]
domain = "llm-operations"
level = "L2"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "lean4"]
domain_normalized = "llm"
content_version = "1.1.0"
last_enhanced = "2026-02-14"
word_count = 400
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-bridge-commander", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Ollama", "Phase", "HTTP"]
tags = ["agents", "agent", "chatgpt-bridge-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-bridge-commander - Prismatic Platform"
+++

## Overview

The ChatGPT Bridge Commander operates as an L2 tactical operations agent within the LLM Operations domain of the Prismatic Platform. This agent manages the low-level communication bridge between the Prismatic ecosystem and the ChatGPT API, handling HTTP connection management, request serialization, response deserialization, authentication, and comprehensive error handling. It serves as the foundational transport layer that all higher-level ChatGPT agents depend upon for reliable API access.

Reliable external API communication requires more than simple HTTP requests. The Bridge Commander implements [connection pooling](/glossary/connection-pooling/) for efficient resource utilization, request queuing with priority ordering, response streaming for large outputs, and comprehensive error classification that distinguishes between transient failures (retryable) and permanent failures (escalation required). This infrastructure ensures that ChatGPT interactions are reliable, efficient, and properly instrumented for monitoring. The agent's [circuit breaker](/glossary/circuit-breaker/) implementation protects the platform from cascading failures when the external API experiences degradation, automatically switching to local [Ollama](/glossary/ollama/) models when the external service becomes unavailable. This agent is part of the platform's 434-strong autonomous agent ecosystem, built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The Bridge Commander implements a layered transport architecture with clear separation between connection management, request processing, and resilience mechanisms.

**Connection Pool Manager** -- The outermost layer maintains a pool of HTTP/2 connections to the ChatGPT API endpoint. Connection lifecycle management includes TLS handshake optimization, keep-alive management, connection health monitoring, and automatic replacement of degraded connections. The pool size is configurable and auto-scales based on request throughput to optimize resource utilization without over-provisioning.

**Request Pipeline** -- Incoming API requests enter a priority-ordered queue. Emergency requests (security analysis, incident response) receive immediate dispatch. Standard requests (code analysis, documentation generation) are dispatched in FIFO order. Bulk requests (batch processing, archive operations) are rate-limited to prevent quota exhaustion. Each request passes through serialization, authentication header injection, and token budget validation before dispatch.

**Circuit Breaker** -- The resilience layer implements a three-state circuit breaker (closed, open, half-open) that monitors API response health. After configurable failure thresholds, the circuit opens, redirecting all requests to the local Ollama fallback. Periodic probe requests test API recovery, transitioning the circuit to half-open state for gradual traffic restoration.

**Response Processor** -- API responses undergo structural validation, deserialization, and metadata extraction before delivery to consuming agents. The processor captures token usage, response latency, model version, and finish reason for [telemetry](/glossary/telemetry/) reporting. Streaming responses are reassembled into complete response objects with progress callbacks for long-running interactions.

## Core Capabilities

- **Connection lifecycle management** maintaining HTTP/2 connection pools with [TLS](/glossary/tls/) optimization, keep-alive management, health monitoring, and automatic connection replacement for ChatGPT API endpoints
- **Request queuing and prioritization** ordering outgoing requests by urgency classification (emergency, standard, bulk) with configurable concurrency limits per priority tier to prevent resource starvation
- **Error classification** distinguishing between transient network errors (automatic retry with exponential backoff), rate limit responses (backoff with jitter), authentication failures (credential refresh), and permanent failures (escalation to command authority)
- **Response streaming** supporting streamed responses for long-running ChatGPT interactions with progress callbacks, partial result assembly, and timeout management for incomplete streams
- **Authentication management** securely handling API key rotation, organization-level credential management, and token refresh without exposing secrets in logs, telemetry, or error reports
- **Circuit breaker protection** automatically disabling external API calls after configurable failure thresholds, redirecting to local Ollama models, and gradually restoring traffic when API health recovers
- **Comprehensive instrumentation** emitting telemetry events for every API interaction including request latency, token consumption, error rates, circuit breaker state transitions, and connection pool utilization

## Implementation

The Bridge Commander is implemented as an [OTP](/glossary/otp/) [GenServer](/glossary/genserver/) with a supervised connection pool and circuit breaker state machine.

```elixir
defmodule Prismatic.AI.ChatGPT.Bridge do
  @moduledoc """
  Low-level transport bridge for ChatGPT API communication.
  Manages connection pooling, request prioritization, circuit
  breaker protection, and Ollama fallback.
  """
  use GenServer

  alias Prismatic.AI.ChatGPT.Bridge.{
    ConnectionPool,
    RequestQueue,
    CircuitBreaker,
    ResponseProcessor
  }

  @type request :: %{
    messages: list(map()),
    model: String.t(),
    temperature: float(),
    max_tokens: pos_integer(),
    priority: :emergency | :standard | :bulk,
    stream: boolean()
  }

  @type response :: %{
    content: String.t(),
    model: String.t(),
    token_usage: %{prompt: integer(), completion: integer()},
    finish_reason: String.t(),
    latency_ms: non_neg_integer()
  }

  @spec query(request()) :: {:ok, response()} | {:error, term()}
  def query(request) do
    GenServer.call(__MODULE__, {:query, request}, request_timeout(request))
  end

  @impl true
  def init(opts) do
    {:ok, pool} = ConnectionPool.start_link(opts[:pool_size] || 5)
    {:ok, cb} = CircuitBreaker.start_link(opts[:circuit_breaker] || [])

    {:ok, %{
      pool: pool,
      circuit_breaker: cb,
      queue: RequestQueue.new(),
      opts: opts
    }}
  end

  @impl true
  def handle_call({:query, request}, from, state) do
    case CircuitBreaker.status(state.circuit_breaker) do
      :closed ->
        dispatch_to_api(request, from, state)

      :open ->
        dispatch_to_fallback(request, from, state)

      :half_open ->
        dispatch_with_probe(request, from, state)
    end
  end

  defp dispatch_to_api(request, _from, state) do
    start_time = System.monotonic_time(:millisecond)

    result =
      with {:ok, conn} <- ConnectionPool.checkout(state.pool),
           {:ok, raw} <- execute_request(conn, request),
           :ok <- ConnectionPool.checkin(state.pool, conn),
           {:ok, response} <- ResponseProcessor.process(raw) do
        CircuitBreaker.record_success(state.circuit_breaker)
        latency = System.monotonic_time(:millisecond) - start_time
        emit_telemetry(:success, request, response, latency)
        {:ok, %{response | latency_ms: latency}}
      else
        {:error, reason} = error ->
          CircuitBreaker.record_failure(state.circuit_breaker)
          emit_telemetry(:failure, request, reason, 0)
          error
      end

    {:reply, result, state}
  end

  defp dispatch_to_fallback(request, _from, state) do
    result = Prismatic.AI.Ollama.query(adapt_for_ollama(request))
    emit_telemetry(:fallback, request, result, 0)
    {:reply, result, state}
  end
end
```

## Integration Points

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [chatgpt-integration-commander](/agents/chatgpt-integration-commander/) | Command Authority | Receives strategic directives for API configuration, model selection, and failover policy |
| [chatgpt-context-manager](/agents/chatgpt-context-manager/) | Context Layer | Provides optimized conversation context that the bridge transports to the API |
| [chatgpt-prompt-engineer](/agents/chatgpt-prompt-engineer/) | Request Content | Supplies optimized prompts assembled from templates and context for API delivery |
| [chatgpt-archive-specialist](/agents/chatgpt-archive-specialist/) | Archive Consumer | Receives completed interaction records for archival processing and knowledge extraction |
| [Ollama](/glossary/ollama/) Local Models | Fallback Provider | Provides local AI model access when the circuit breaker opens due to API degradation |
| [Prismatic Telemetry](/glossary/telemetry/) | Observability | Receives comprehensive API interaction metrics for dashboarding and alerting |

## Operational Workflow

**Phase 1: Request Reception** -- API requests arrive from consuming agents through the GenServer call interface. Each request carries priority classification, model specification, token budget, and streaming preference.

**Phase 2: Circuit Breaker Evaluation** -- The circuit breaker state determines routing. In closed state, requests proceed to the API. In open state, requests are redirected to Ollama fallback. In half-open state, a limited number of probe requests test API recovery while the remainder routes to fallback.

**Phase 3: Connection Acquisition** -- For API-bound requests, a connection is checked out from the pool. If no connections are available, the request waits up to a configurable timeout before being rejected with a resource exhaustion error.

**Phase 4: Request Dispatch** -- The request is serialized with authentication headers, sent over the acquired connection, and monitored for response. Streaming requests establish a long-lived connection with progress callbacks. Non-streaming requests use standard request-response semantics.

**Phase 5: Response Processing** -- Raw API responses are validated for structural integrity, deserialized, and enriched with metadata including latency measurement, token usage extraction, and model version confirmation. The circuit breaker records the outcome (success or failure).

**Phase 6: Telemetry Emission** -- Every API interaction generates telemetry events covering latency, token consumption, error classification, circuit breaker transitions, and connection pool utilization. These events feed the platform's observability infrastructure.

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Provenance Mandatory** | Every API response carries provenance metadata including model version, API endpoint, request timestamp, and response latency for full traceability |
| **Time Decay** | Connection pool health metrics use time-windowed averages; recent failures weight more heavily in circuit breaker decisions than older successes |
| **Signal Plurality** | Circuit breaker decisions require multiple consecutive failures before opening, preventing single transient errors from triggering fallback |
| **Source Independence** | When operating in half-open state, probe results are evaluated independently from fallback results to assess true API recovery |
| **Absence Informative** | API response timeouts are treated as informational signals that contribute to circuit breaker state evaluation rather than being silently ignored |

## Configuration

```elixir
config :prismatic_ai, Prismatic.AI.ChatGPT.Bridge,
  # Connection pool size
  pool_size: 5,
  # Request timeout by priority (milliseconds)
  timeouts: %{emergency: 60_000, standard: 120_000, bulk: 300_000},
  # Circuit breaker configuration
  circuit_breaker: [
    failure_threshold: 3,
    reset_timeout: 60_000,
    half_open_max_requests: 2
  ],
  # API endpoint
  api_endpoint: "https://api.openai.com/v1/chat/completions",
  # Fallback model for Ollama
  fallback_model: "qwen3-coder",
  # Rate limit (requests per minute)
  rate_limit: 60
```

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Request dispatch latency | < 5ms | Time from GenServer call to HTTP request send |
| Connection pool checkout | < 1ms | Time to acquire a connection from the pool |
| API round-trip (non-streaming) | < 30 seconds | Complete API request-response cycle |
| Circuit breaker evaluation | < 100 microseconds | State check and routing decision |
| Fallback switch time | < 10ms | Time to redirect from API to Ollama on circuit open |
| Telemetry emission | < 500 microseconds | Time to emit metrics after response processing |

## Related Resources

- [**chatgpt-integration-commander**](/agents/chatgpt-integration-commander/) (L3) -- Strategic integration management authority
- [**chatgpt-context-manager**](/agents/chatgpt-context-manager/) (L3) -- Context optimization for API interactions
- [**chatgpt-prompt-engineer**](/agents/chatgpt-prompt-engineer/) (L3) -- Prompt template management
- [Ollama](/glossary/ollama/) -- Local AI model infrastructure for fallback operations
- [Circuit Breaker](/glossary/circuit-breaker/) -- Resilience pattern preventing cascading failures
- [Lean4](/glossary/lean4/) -- Formal verification of bridge safety properties

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)