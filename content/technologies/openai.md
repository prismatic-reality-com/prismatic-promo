+++
title = "OpenAI"
weight = 43
[extra]
category = "ai-ml"
description = "GPT model integration for natural language processing, embeddings, and classification tasks"
url = "https://openai.com"
version = "GPT-4+"
icon = "openai"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 985
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OpenAI", "model", "integration", "natural", "language", "processing", "embeddings", "technologies", "ai ml", "Prismatic Platform"]
tags = ["technologies", "ai-ml", "openai", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "OpenAI - Prismatic Platform"
+++

## Overview

OpenAI's GPT models serve as an alternative cloud AI provider in the Prismatic Platform, complementing the primary [Claude](@/technologies/claude.md) integration and local [Ollama](@/technologies/ollama.md) inference. The platform uses OpenAI primarily for embedding generation (text-embedding-3), classification tasks, and as a fallback provider when specialized model capabilities are needed. While Claude serves as the primary reasoning engine, OpenAI fills specific capability gaps, particularly in vector embedding generation where its text-embedding-3 family of models provides high-quality representations for semantic search.

The Prismatic Platform's multi-provider AI architecture ensures resilience -- if one provider is unavailable, the system automatically routes to alternatives. OpenAI's embedding models are particularly valuable for the platform's semantic search capabilities, generating vector representations of intelligence documents, agent descriptions, and security findings for similarity-based retrieval via [Meilisearch](@/technologies/meilisearch.md). These embeddings transform text into numerical vectors that capture semantic meaning, enabling searches that understand intent rather than just matching keywords.

OpenAI integration follows the same provider abstraction used for Claude and Ollama, allowing seamless switching between providers based on task requirements, cost optimization, and availability. The `PrismaticClaude.Providers` module defines a common behaviour that all providers implement, making the AI layer genuinely provider-agnostic at the application level. Application code never calls OpenAI directly -- it requests capabilities through the provider router, which selects the optimal provider based on the task requirements.

## Key Features

- **GPT-4 Turbo**: Advanced reasoning and code generation for complex analysis tasks requiring broad knowledge
- **Embeddings**: text-embedding-3-small (1536 dimensions) and text-embedding-3-large (3072 dimensions) for vector representations
- **Function Calling**: Structured output through tool definitions, enabling agents to invoke platform functions with type-safe parameters
- **JSON Mode**: Guaranteed valid JSON output for automated pipeline integrations, eliminating parsing failures
- **Streaming**: Token-by-token response streaming for real-time display in [Phoenix LiveView](@/technologies/phoenix-liveview.md) interfaces
- **Fine-Tuning**: Custom model training on platform-specific datasets for domain-specialized classification
- **Batch API**: Cost-efficient batch processing for large-scale document analysis at reduced pricing
- **Vision**: GPT-4V image analysis for security screenshot review and UI testing automation

## Platform Integration

OpenAI provides embedding generation and fallback inference through the platform's unified provider abstraction.

```elixir
defmodule PrismaticClaude.Providers.OpenAI do
  @moduledoc """
  OpenAI provider implementing the unified AI provider behaviour.
  Primary use: embedding generation and fallback inference.
  """
  @behaviour PrismaticClaude.Providers.Behaviour

  @base_url "https://api.openai.com/v1"

  @impl true
  def generate_embedding(text, opts \\ []) do
    model = Keyword.get(opts, :model, "text-embedding-3-small")
    headers = auth_headers()

    body = Jason.encode!(%{input: text, model: model})

    case HTTPoison.post("#{@base_url}/embeddings", body, headers,
           recv_timeout: 30_000) do
      {:ok, %{status_code: 200, body: body}} ->
        %{"data" => [%{"embedding" => embedding}]} = Jason.decode!(body)
        {:ok, embedding}

      {:ok, %{status_code: 429}} ->
        {:error, :rate_limited}

      {:ok, %{status_code: status, body: body}} ->
        {:error, {:api_error, status, Jason.decode!(body)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def complete(prompt, opts \\ []) do
    model = Keyword.get(opts, :model, "gpt-4-turbo")
    max_tokens = Keyword.get(opts, :max_tokens, 4096)

    body = Jason.encode!(%{
      model: model,
      messages: [%{role: "user", content: prompt}],
      max_tokens: max_tokens,
      response_format: %{type: "json_object"}
    })

    case HTTPoison.post("#{@base_url}/chat/completions", body, auth_headers(),
           recv_timeout: 60_000) do
      {:ok, %{status_code: 200, body: resp}} ->
        %{"choices" => [%{"message" => %{"content" => content}}]} = Jason.decode!(resp)
        {:ok, content}

      {:ok, %{status_code: 429}} ->
        {:error, :rate_limited}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def available? do
    case HTTPoison.get("#{@base_url}/models", auth_headers(), recv_timeout: 5_000) do
      {:ok, %{status_code: 200}} -> true
      _ -> false
    end
  end

  defp auth_headers do
    [
      {"Authorization", "Bearer #{api_key()}"},
      {"Content-Type", "application/json"}
    ]
  end

  defp api_key, do: Application.get_env(:prismatic_claude, :openai)[:api_key]
end
```

The provider abstraction enables automatic fallback routing. If OpenAI returns a rate limit or error, the coordinator routes to the next available provider transparently.

```elixir
defmodule PrismaticClaude.Providers.Router do
  @moduledoc """
  Routes AI requests to the optimal provider based on task type,
  availability, and configuration. Handles automatic fallback.
  """

  @spec route(atom(), keyword()) :: {:ok, module()} | {:error, :no_provider}
  def route(:embedding, _opts) do
    cond do
      PrismaticClaude.Providers.OpenAI.available?() -> {:ok, PrismaticClaude.Providers.OpenAI}
      PrismaticClaude.Providers.Ollama.available?() -> {:ok, PrismaticClaude.Providers.Ollama}
      true -> {:error, :no_provider}
    end
  end

  def route(:completion, opts) do
    cond do
      Keyword.get(opts, :sensitive, false) ->
        {:ok, PrismaticClaude.Providers.Ollama}
      PrismaticClaude.Providers.OpenAI.available?() ->
        {:ok, PrismaticClaude.Providers.OpenAI}
      PrismaticClaude.Providers.Ollama.available?() ->
        {:ok, PrismaticClaude.Providers.Ollama}
      true ->
        {:error, :no_provider}
    end
  end
end
```

## Architecture

OpenAI occupies the cloud AI provider tier in the platform's multi-provider architecture.

| Capability | OpenAI Model | Alternative | Selection Criteria |
|-----------|-------------|-------------|-------------------|
| Text Embedding | text-embedding-3-small | nomic-embed-text (Ollama) | Quality vs. privacy |
| Code Generation | gpt-4-turbo | Claude Opus (primary) | Fallback when Claude unavailable |
| Classification | gpt-4-turbo (fine-tuned) | qwen3-coder (Ollama) | Accuracy vs. cost |
| JSON Extraction | gpt-4-turbo (JSON mode) | Claude (tool use) | Reliability |
| Image Analysis | gpt-4-vision | Not available locally | Unique capability |
| Batch Processing | Batch API | N/A | Cost optimization for bulk operations |

The provider hierarchy for the platform follows a clear priority order.

| Priority | Provider | Strengths | Limitations |
|----------|----------|-----------|-------------|
| 1 | [Claude](@/technologies/claude.md) | Best reasoning, Elixir expertise | Cloud-only, cost |
| 2 | [Ollama](@/technologies/ollama.md) | Privacy, zero cost, no network | Limited capability |
| 3 | OpenAI | Embeddings, JSON mode, vision | Cloud-only, rate limits |

## Performance Characteristics

OpenAI API performance varies by model and endpoint. The platform tracks these metrics for provider selection optimization.

| Operation | Model | Latency | Cost (per 1K tokens) | Notes |
|-----------|-------|---------|---------------------|-------|
| Embedding (small) | text-embedding-3-small | ~200ms | $0.00002 | 1536 dimensions |
| Embedding (large) | text-embedding-3-large | ~300ms | $0.00013 | 3072 dimensions |
| Chat completion | gpt-4-turbo | 2-20s | $0.01/$0.03 (in/out) | Depends on complexity |
| JSON mode | gpt-4-turbo | 3-25s | $0.01/$0.03 (in/out) | Guaranteed valid JSON |
| Batch processing | gpt-4-turbo (batch) | Hours | 50% discount | Async, cost-optimized |
| Rate limit (Tier 1) | All models | N/A | N/A | 500 RPM, 30K TPM |
| Rate limit (Tier 3) | All models | N/A | N/A | 5000 RPM, 600K TPM |

Embedding generation is the most cost-effective OpenAI operation for the platform, providing high-quality vector representations at minimal cost per document.

## Configuration

OpenAI provider configuration is managed through the platform's runtime configuration system with support for environment-specific overrides.

```elixir
# OpenAI provider configuration in config/runtime.exs
config :prismatic_claude, :openai,
  api_key: System.get_env("OPENAI_API_KEY"),
  organization: System.get_env("OPENAI_ORG_ID"),
  model: "gpt-4-turbo",
  embedding_model: "text-embedding-3-small",
  max_tokens: 4096,
  timeout: 30_000,
  retry_count: 3,
  retry_delay: 1_000,
  rate_limit: [
    requests_per_minute: 500,
    tokens_per_minute: 30_000
  ]
```

Rate limiting is enforced client-side to prevent exceeding OpenAI's API limits and triggering 429 responses.

```elixir
# Client-side rate limiter for OpenAI API calls
config :prismatic_claude, :openai_rate_limiter,
  enabled: true,
  window_ms: 60_000,
  max_requests: 500,
  max_tokens: 30_000,
  backoff_strategy: :exponential,
  max_backoff_ms: 30_000
```

## Best Practices

- **Use embeddings for semantic search** -- OpenAI's embedding models outperform keyword matching for semantic similarity across intelligence documents and agent descriptions
- **Prefer JSON mode** for structured outputs that feed into automated pipelines, avoiding fragile parsing of free-text responses
- **Implement rate limit handling** with exponential backoff, as OpenAI's API enforces strict per-minute token limits
- **Cache embeddings aggressively** in [ETS](@/technologies/ets.md) or [Redis](@/technologies/redis.md) since the same text always produces the same embedding vector
- **Use the provider abstraction** -- never call OpenAI directly from application code; always go through `PrismaticClaude.Providers`
- **Monitor API costs** -- track token usage per operation type to identify cost optimization opportunities; batch API offers 50% savings for non-urgent operations
- **Handle all error codes** -- implement specific handling for 429 (rate limit), 500 (server error), and 503 (overloaded) responses
- **Use text-embedding-3-small by default** -- the small model provides 90%+ of the large model's quality at 15% of the cost

## Comparison with Alternatives

| Feature | OpenAI GPT-4 | Claude Opus | Ollama (Local) | Google Gemini |
|---------|-------------|-------------|----------------|---------------|
| Embedding Quality | Excellent | N/A (no embedding API) | Good (nomic) | Good |
| Code Generation | Good | Excellent (Elixir) | Moderate | Good |
| JSON Mode | Built-in | Tool use | Manual prompt | Built-in |
| Vision | GPT-4V | Claude Vision | LLaVA | Gemini Pro Vision |
| Context Window | 128K | 200K | 8-32K | 1M |
| Batch Processing | Yes (50% off) | No | N/A (local) | No |
| Latency | 2-20s | 2-30s | 1-5s | 2-15s |
| Privacy | Cloud | Cloud | Full local | Cloud |
| Platform Role | Embeddings + fallback | Primary reasoning | Privacy + dev | Not integrated |

OpenAI complements Claude and Ollama in the platform's AI architecture: Claude provides the best reasoning for [Elixir](@/technologies/elixir.md) code, Ollama provides privacy for sensitive data, and OpenAI provides the best embedding models and JSON mode for structured data extraction.

## Related Technologies

- [Claude](@/technologies/claude.md) - Primary AI provider for reasoning and code generation
- [Ollama](@/technologies/ollama.md) - Local AI inference for offline and privacy-sensitive operations
- [Meilisearch](@/technologies/meilisearch.md) - Search engine that can consume OpenAI-generated embeddings for semantic search
- [ETS](@/technologies/ets.md) - In-memory cache for embedding vectors and API response caching
- [Redis](@/technologies/redis.md) - Distributed cache for embedding vectors across cluster nodes
- [Elixir](@/technologies/elixir.md) - Host language providing the HTTP client and provider abstraction

## Related Apps

- [prismatic_claude](@/apps/prismatic-claude.md) - Multi-provider AI layer hosting the OpenAI adapter
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent system that may route to OpenAI for specific tasks
- [prismatic_storage_meilisearch](@/apps/prismatic-storage-meilisearch.md) - Search engine consuming OpenAI embeddings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)