+++
title = "llm-generic-bridge"
weight = 226
[extra]
domain = "aiad-enhanced"
level = "L4"
description = "Universal platform adaptation and vendor-neutral LLM coordination providing a unified interface across heterogeneous LLM providers"
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
keywords = ["llm-generic-bridge", "Universal", "agents", "agent", "Prismatic Platform", "Ollama"]
tags = ["agents", "agent", "llm-generic-bridge", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-generic-bridge - Prismatic Platform"
+++

## Overview

The llm-generic-bridge is an L4 domain authority agent operating within the [AIAD](@/glossary/aiad.md)-enhanced domain of the Prismatic Platform. This agent provides a universal abstraction layer that enables the platform to interact with any LLM provider through a unified, vendor-neutral interface. By abstracting away provider-specific API differences, authentication mechanisms, request formats, response structures, and capability variations, the bridge enables the platform to support multiple LLM backends (Anthropic Claude, OpenAI GPT, local Ollama models, and future providers) without requiring changes to the hundreds of agents and components that consume LLM capabilities.

Built on the [AIAD](@/glossary/aiad.md) standard, the llm-generic-bridge embodies the adapter pattern at the LLM integration level. Just as the platform's storage layer uses adapter behaviors to abstract over PostgreSQL, ETS, and Meilisearch, the LLM bridge uses adapter behaviors to abstract over Claude, GPT, Ollama, and any future LLM provider. This abstraction is essential for provider independence -- the platform can switch providers, add new providers, or operate with multiple providers simultaneously without modifying consumer code.

## Bridge Architecture

The bridge architecture implements a layered abstraction with three levels: the protocol layer, the capability layer, and the semantic layer.

The protocol layer handles the mechanics of communicating with LLM provider APIs. Each provider has a protocol adapter that manages authentication (API keys, OAuth tokens, local connections), request formatting (converting the platform's canonical request format to the provider's API format), response parsing (converting the provider's response format to the platform's canonical response format), error handling (translating provider-specific error codes to platform error types), and connection management (HTTP client configuration, connection pooling, timeout handling). The protocol layer is the only component that contains provider-specific code.

The capability layer maps the platform's abstract LLM capabilities (text generation, code generation, analysis, classification, summarization, structured output) to provider-specific features. Different providers support these capabilities with varying quality levels and through different API parameters. The capability layer maintains a capability matrix that records which providers support which capabilities and at what quality levels, enabling the [llm-model-selector](@/agents/llm-model-selector.md) to make informed routing decisions.

The semantic layer ensures that the meaning of requests and responses is preserved across provider translations. This includes handling differences in system prompt conventions, instruction formatting, output formatting expectations, and conversation history representation between providers. The semantic layer ensures that a request that produces a specific behavior with one provider produces equivalent behavior with another, even when the providers' APIs differ significantly in their conventions.

## Key Capabilities

- **Vendor-neutral request interface** -- Exposes a unified request API that abstracts over all supported LLM providers, enabling provider-agnostic consumption by platform agents
- **Provider protocol adaptation** -- Implements provider-specific protocol adapters for authentication, request formatting, response parsing, and error handling
- **Capability mapping** -- Maintains a capability matrix that maps abstract platform capabilities to provider-specific features and quality levels
- **Response normalization** -- Converts provider-specific response structures to a canonical 3-tuple format (`{:ok, response, metadata}` or `{:error, reason, context}`) with standardized metadata
- **Streaming support** -- Provides unified streaming response handling that abstracts over provider-specific streaming protocols (Server-Sent Events, WebSocket, chunked HTTP)
- **Provider registration** -- Supports dynamic registration of new LLM providers through adapter module implementation, enabling platform extension without core modifications
- **Connection pooling** -- Manages HTTP connection pools for each provider, optimizing connection reuse and preventing resource exhaustion
- **[GenServer](@/glossary/genserver.md)-based state management** -- Maintains provider configuration and connection state as OTP GenServer state
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for per-provider latency, throughput, and error rate metrics

## Provider Adapter Interface

Each LLM provider is integrated through an adapter module that implements the platform's LLM adapter behavior. The behavior defines callbacks for connection establishment, request submission, response handling, streaming support, capability declaration, and health probing. New providers can be added by implementing this behavior without modifying the bridge core or any consumer code.

The adapter behavior enforces a consistent contract: all adapters return responses in the platform's canonical 3-tuple format, all adapters support health probing for the fallback coordinator, and all adapters emit standardized telemetry events for cost tracking and performance monitoring. This contract enforcement ensures that provider-specific quirks are contained within the adapter and never leak through to consumers.

Currently implemented adapters include the Anthropic adapter (Claude models via the Anthropic API), the OpenAI adapter (GPT models via the OpenAI API), and the Ollama adapter (local open-source models via the Ollama API). The Ollama adapter is particularly significant as it enables fully local, zero-cost LLM operation for development and testing scenarios where cloud API costs are undesirable.

## Response Normalization

Response normalization is a critical function of the bridge. Different providers return responses in different structures with different metadata. The bridge normalizes all responses to the platform's canonical format:

Successful responses are normalized to `{:ok, response_body, metadata}` where `response_body` contains the generated text/structured output and `metadata` contains standardized fields: `model` (model identifier), `input_tokens` (input token count), `output_tokens` (output token count), `latency_ms` (response time), `provider` (provider identifier), and `request_id` (unique request identifier for audit tracking).

Error responses are normalized to `{:error, reason, context}` where `reason` is a platform-standard error atom (`:rate_limited`, `:timeout`, `:invalid_request`, `:model_unavailable`, `:provider_error`) and `context` contains provider-specific error details for debugging.

## Authority Level

**L4** - Domain Authority - Specialized domain expertise for LLM provider abstraction. The L4 designation reflects the agent's role as infrastructure that serves higher-authority agents rather than making independent strategic decisions.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Anthropic API | Claude model provider protocol adapter |
| OpenAI API | GPT model provider protocol adapter |
| Ollama | Local model provider protocol adapter |
| [GenServer](@/glossary/genserver.md) | OTP-based provider state and connection pool management |
| Prismatic Telemetry | Per-provider performance [metrics](@/glossary/metrics.md) and error rate tracking |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent specification and provider adapter discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/llm-bridge providers` | List configured providers with capability matrices | L2+ |
| `/llm-bridge health` | Display health status of all provider connections | L2+ |
| `/llm-bridge test <provider>` | Execute test request against a specific provider | L3+ |
| `/llm-bridge register <adapter>` | Register a new provider adapter module | L3+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-model-selector**](@/agents/llm-model-selector.md) (L4) | Consults capability matrix for model selection decisions |
| [**llm-fallback-coordinator**](@/agents/llm-fallback-coordinator.md) (L3) | Bridge abstraction enables transparent failover between providers |
| [**llm-cost-manager**](@/agents/llm-cost-manager.md) (L4) | Normalized metadata enables consistent cost tracking across providers |
| [**llm-performance-optimizer**](@/agents/llm-performance-optimizer.md) (L3) | Normalized metrics enable cross-provider performance comparison |
| [**llm-client-pattern-specialist**](@/agents/llm-client-pattern-specialist.md) (L3) | Enforces correct usage of the bridge's canonical response format |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that all provider adapters maintain the canonical response contract without exception. No provider-specific response format leaks through the bridge to consumers. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that the capability matrix accurately reflects each provider's actual capabilities, verified through periodic testing rather than assumed from documentation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)