+++
title = "Ollama"
weight = 40
[extra]
category = "ai-ml"
description = "Local AI model runner for privacy-first inference with support for multiple open-source models"
url = "https://ollama.com"
version = "0.3+"
icon = "ollama"
color = "gray"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 809
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Ollama", "Local", "technologies", "ai ml", "Prismatic Platform", "OpenAI", "HTTP", "CUDA"]
tags = ["technologies", "ai-ml", "ollama", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Ollama - Prismatic Platform"
+++

## Overview

Ollama is the local AI inference engine that enables the Prismatic Platform to run AI models entirely on-premises, ensuring complete data privacy and eliminating cloud API dependencies for routine AI operations. It provides a simple interface for downloading, running, and managing large language models on local hardware, with GPU acceleration support for both NVIDIA CUDA and Apple Metal. Ollama transforms what would otherwise require complex model serving infrastructure into a single-binary solution.

The Prismatic Platform integrates Ollama as a first-class AI provider, running models like qwen3-coder (7B), gpt-oss (20B), and deepseek-coder (6.7B) for code generation, analysis, and natural language processing tasks. Ollama's response times of under 3 seconds for 7B models and under 5 seconds for 20B models meet the platform's interactive usage requirements. These response times are achieved on consumer-grade hardware (Apple M-series with 16GB+ RAM or NVIDIA GPUs with 8GB+ VRAM), making local AI inference accessible without datacenter hardware.

Ollama operates as the primary AI backend for development and testing, with automatic fallback to cloud providers ([Claude](/technologies/claude/), [OpenAI](/technologies/openai/)) when higher capability is needed. This hybrid approach maximizes privacy while maintaining access to frontier model capabilities. Sensitive data -- proprietary code, security findings, OSINT intelligence -- can be processed locally through Ollama without ever leaving the developer's machine.

## Key Features

- **Local Execution**: Complete data privacy with no cloud dependencies or network requirements
- **Model Library**: Access to Llama, Mistral, CodeLlama, Qwen, DeepSeek, Phi, and dozens of other open-source models
- **GPU Acceleration**: NVIDIA CUDA and Apple Metal support for fast inference on consumer hardware
- **REST API**: Simple HTTP interface at `localhost:11434` compatible with OpenAI API format for drop-in replacement
- **Model Management**: Pull, list, copy, customize, and remove models with simple CLI commands
- **Concurrent Inference**: Multiple model serving and request queuing for parallel AI operations
- **Modelfile Customization**: Custom system prompts, parameters, and model configurations through Modelfile definitions
- **Memory Efficiency**: Automatic model loading/unloading based on available memory and usage patterns

## Platform Integration

Ollama serves as the default local AI provider for the platform through a unified provider abstraction.

```elixir
defmodule PrismaticClaude.Providers.Ollama do
  @moduledoc """
  Local AI provider using Ollama for privacy-first inference.
  Implements the unified provider behaviour for seamless
  integration with the multi-provider AI architecture.
  """
  @behaviour PrismaticClaude.Providers.Behaviour

  @base_url "http://localhost:11434"

  @impl true
  def generate(prompt, opts \\ []) do
    model = Keyword.get(opts, :model, "qwen3-coder")
    body = %{
      model: model,
      prompt: prompt,
      stream: Keyword.get(opts, :stream, false),
      options: %{
        temperature: Keyword.get(opts, :temperature, 0.7),
        num_predict: Keyword.get(opts, :max_tokens, 2048),
        top_p: Keyword.get(opts, :top_p, 0.9)
      }
    }

    case HTTPoison.post("#{@base_url}/api/generate", Jason.encode!(body),
           [{"Content-Type", "application/json"}],
           recv_timeout: 60_000) do
      {:ok, %{status_code: 200, body: resp_body}} ->
        %{"response" => response} = Jason.decode!(resp_body)
        {:ok, response}

      {:ok, %{status_code: status}} ->
        {:error, {:http_error, status}}

      {:error, %HTTPoison.Error{reason: :timeout}} ->
        {:error, :timeout}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def chat(messages, opts \\ []) do
    model = Keyword.get(opts, :model, "qwen3-coder")
    body = %{
      model: model,
      messages: messages,
      stream: false,
      options: %{
        temperature: Keyword.get(opts, :temperature, 0.7),
        num_predict: Keyword.get(opts, :max_tokens, 2048)
      }
    }

    case HTTPoison.post("#{@base_url}/api/chat", Jason.encode!(body),
           [{"Content-Type", "application/json"}],
           recv_timeout: 60_000) do
      {:ok, %{status_code: 200, body: resp_body}} ->
        %{"message" => %{"content" => content}} = Jason.decode!(resp_body)
        {:ok, content}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def available? do
    case HTTPoison.get("#{@base_url}/api/tags", [], recv_timeout: 5_000) do
      {:ok, %{status_code: 200}} -> true
      _ -> false
    end
  end
end
```

## Architecture

Ollama integrates into the platform's multi-provider AI architecture as the local inference option.

| Provider | Tier | Use Case | Latency | Privacy |
|----------|------|----------|---------|---------|
| Ollama (local) | Primary for dev | Code generation, analysis, testing | 1-5s | Full (local) |
| [Claude](/technologies/claude/) | Primary for production | Complex reasoning, architecture analysis | 2-30s | Cloud API |
| [OpenAI](/technologies/openai/) | Secondary | Embeddings, classification, fallback | 2-20s | Cloud API |

The provider selection follows a priority-based routing strategy.

| Decision Point | Routing Logic |
|---------------|---------------|
| Sensitive data present | Route to Ollama (local) |
| Complex reasoning required | Route to Claude |
| Embedding generation | Route to OpenAI |
| Cloud providers unavailable | Fallback to Ollama |
| Ollama unavailable | Fallback to cloud |
| Cost optimization mode | Prefer Ollama for routine tasks |

## Model Configuration

The platform standardizes on specific models for different task types, balancing capability against resource usage.

| Model | Size | Response Time | Memory | Task |
|-------|------|---------------|--------|------|
| qwen3-coder | 7B | < 3s | ~5 GB | Code generation, refactoring |
| gpt-oss:20b | 20B | < 5s | ~12 GB | Complex analysis, reasoning |
| deepseek-coder | 6.7B | < 3s | ~4 GB | Code completion, analysis |
| nomic-embed-text | 137M | < 500ms | ~300 MB | Text embeddings |
| codellama | 7B | < 3s | ~5 GB | Code-specific tasks |

Custom Modelfiles enable task-specific model configurations.

```dockerfile
# Modelfile for Prismatic code analysis
FROM qwen3-coder

SYSTEM """
You are an expert Elixir developer working on the Prismatic Platform.
Follow OTP conventions, use GenServer patterns, and ensure all code
includes @spec annotations and @moduledoc documentation.
Never use Manager/Handler/Utils naming patterns.
"""

PARAMETER temperature 0.3
PARAMETER num_predict 4096
PARAMETER top_p 0.9
```

## Performance Characteristics

Ollama performance depends on the available hardware and selected model.

| Metric | Apple M2 Pro (16GB) | NVIDIA RTX 3080 (10GB) | CPU Only |
|--------|--------------------|-----------------------|----------|
| qwen3-coder (7B) first token | ~500ms | ~300ms | ~2s |
| qwen3-coder (7B) tokens/sec | ~25 t/s | ~40 t/s | ~5 t/s |
| gpt-oss (20B) first token | ~1.5s | ~1s | ~5s |
| gpt-oss (20B) tokens/sec | ~10 t/s | ~20 t/s | ~2 t/s |
| Model load time | ~2s | ~3s | ~5s |
| Memory idle | ~200 MB | ~200 MB | ~200 MB |
| Memory active (7B) | ~5 GB | ~5 GB | ~5 GB |
| Uptime | >99% | >99% | >99% |

## Configuration

Ollama integration is configured through environment variables and the platform's configuration system.

```bash
# Ollama environment configuration
export OLLAMA_HOST="http://localhost:11434"
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=2

# Model management
ollama pull qwen3-coder
ollama pull deepseek-coder:6.7b
ollama pull nomic-embed-text
ollama list
```

```elixir
# Elixir configuration for Ollama integration
config :prismatic_claude, :ollama,
  base_url: System.get_env("OLLAMA_HOST", "http://localhost:11434"),
  default_model: "qwen3-coder",
  embedding_model: "nomic-embed-text",
  timeout: 60_000,
  max_retries: 3,
  fallback_to_cloud: true

# Claude Code integration
config :prismatic_claude, :claude_code,
  auth_token: "ollama",
  base_url: "http://localhost:11434"
```

## Best Practices

- **Use 7B models for routine tasks** -- 7B parameter models provide the best balance of speed and quality for code generation and analysis
- **Reserve 20B models for complex reasoning** -- larger models are significantly slower; use them only when smaller models produce insufficient results
- **Configure `OLLAMA_MAX_LOADED_MODELS`** -- limit concurrent model loading to prevent memory exhaustion on constrained hardware
- **Use streaming for interactive use** -- enable `stream: true` for chat interfaces to provide progressive output
- **Implement health checks** -- the provider's `available?/0` function should be called before routing to ensure Ollama is responsive
- **Cache model outputs** -- store generated embeddings and repeated query results in [ETS](/technologies/ets/) to avoid redundant inference
- **Create custom Modelfiles** -- tailor system prompts and parameters to the platform's coding conventions for better output quality
- **Monitor memory usage** -- Ollama can consume significant RAM with large models; ensure the system has adequate free memory

## Comparison with Alternatives

| Feature | Ollama | vLLM | LM Studio | LocalAI | llama.cpp |
|---------|--------|------|-----------|---------|-----------|
| Setup Complexity | Minimal (single binary) | Moderate (Python) | Minimal (GUI) | Moderate | High (build from source) |
| API Compatibility | OpenAI-compatible | OpenAI-compatible | OpenAI-compatible | OpenAI-compatible | Custom |
| GPU Support | CUDA + Metal | CUDA only | CUDA + Metal | CUDA + Metal | CUDA + Metal |
| Model Management | Built-in pull/list | Manual | GUI-based | Manual | Manual |
| Multi-model | Yes | Yes | Yes | Yes | Single |
| Elixir Integration | HTTP (simple) | HTTP | HTTP | HTTP | NIF (complex) |
| Production Ready | Yes | Yes | No (desktop) | Yes | Partial |

Ollama was chosen for its minimal setup complexity, built-in model management, and broad hardware support. The single-binary installation and OpenAI-compatible API make it the easiest local AI solution to integrate with the platform's existing HTTP-based provider architecture.

## Related Technologies

- [Claude](/technologies/claude/) - Cloud AI provider for complex reasoning tasks
- [OpenAI](/technologies/openai/) - Cloud AI provider for embeddings and fallback
- [ETS](/technologies/ets/) - In-memory cache for Ollama response caching
- [Elixir](/technologies/elixir/) - Host language providing the HTTP client for Ollama integration

## Related Apps

- [prismatic_claude](/apps/prismatic-claude/) - Multi-provider AI layer hosting the Ollama adapter
- [prismatic_agents](/apps/prismatic-agents/) - AI-powered agent operations using local inference
- [prismatic_ollama](/apps/prismatic-ollama/) - Ollama-specific integration and model management

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)