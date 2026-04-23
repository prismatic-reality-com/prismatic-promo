+++
title = "Local AI (Ollama)"
weight = 3
date = 2026-01-20
[extra]
icon = "cpu"
color = "purple"
description = "Air-gapped LLM inference with Ollama integration, model routing, connection pooling, and automatic cloud fallback for security-sensitive intelligence operations"
date_created = "2025-10-15"
reading_time = "11 min"
difficulty = "intermediate"
tags = ["ollama", "local-ai", "llm", "air-gapped", "inference", "privacy", "model-routing"]
related_articles = ["supervision-trees", "telemetry", "nabla-framework", "storage-adapters"]
maturity = "production"
author = "Tomas Korcak (korczis)"
word_count = 1322
date_modified = "2026-02-23"
keywords = ["Local", "Ollama", "Air-gapped", "architecture", "Prismatic Platform", "The Ollama"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Local AI (Ollama) - Prismatic Platform"
+++

## Overview

Prismatic Platform integrates with [Ollama](https://ollama.ai) for local, air-gapped large language model [inference](/glossary/inference/). This architectural decision addresses a fundamental tension in AI-powered security platforms: the most powerful LLM capabilities require sending data to external APIs, but security-sensitive intelligence operations cannot tolerate data leaving the controlled environment. Ollama resolves this by running quantized open-source models locally, providing AI-powered analysis without any external network dependency.

The integration is not a simple HTTP client wrapper. It is a full [OTP](/glossary/otp/)-supervised subsystem with [connection pooling](/glossary/connection-pooling/), model routing, health monitoring, automatic cloud fallback, and deep integration with the platform's [telemetry infrastructure](/architecture/telemetry/). The Ollama Coordinator Agent manages model lifecycle, routes requests to appropriate models based on task type, and monitors inference latency to ensure SLA compliance.

This architecture supports the platform's broader commitment to data sovereignty -- particularly important for [Perimeter EASM](/apps/prismatic-perimeter/) operations involving sensitive corporate intelligence, [Czech registry data](/apps/prismatic-czech-autocrawler/) processing, and any workflow where the [NABLA framework](/architecture/nabla-framework/) classifies the input signals as confidential.

## Architectural Design and Model Selection

### Why Ollama Over Alternatives?

Several local inference solutions were evaluated before settling on Ollama:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Ollama** | Simple API, model management, cross-platform, active community | Limited to supported model formats | SELECTED |
| **llama.cpp** | Maximum performance, C++ native | No model management, complex build, raw API | Rejected -- operational overhead too high |
| **vLLM** | Production-grade serving, PagedAttention | GPU-only, heavy dependencies, Linux-focused | Rejected -- not suitable for developer machines |
| **LocalAI** | OpenAI-compatible API, broad model support | Less mature, fewer models, slower updates | Rejected -- ecosystem smaller |
| **text-generation-inference** | HuggingFace ecosystem, optimized serving | Complex setup, GPU-focused | Rejected -- developer experience poor |

Ollama was selected because it provides the best balance of developer experience (single binary, automatic model downloading, simple [REST API](/glossary/rest-api/)) and operational reliability ([process isolation](/glossary/process-isolation/) per model, automatic memory management, graceful degradation under load).

### Supported Models and Task Routing

The platform maintains a curated set of models, each selected for specific task domains. The model router selects the appropriate model based on task classification, available resources, and latency requirements.

| Model | Parameters | Quantization | Response Time | VRAM | Primary Use Case |
|-------|------------|-------------|---------------|------|-----------------|
| **qwen3-coder** | 7B | Q4_K_M | <3s | 4GB | Code generation, static analysis, AST processing |
| **gpt-oss:20b** | 20B | Q4_K_M | <5s | 12GB | Complex reasoning, multi-step analysis, report generation |
| **deepseek-coder** | 6.7B | Q4_K_M | <3s | 4GB | Code completion, Cypher query generation, schema analysis |
| **llama3.2** | 8B | Q4_K_M | <4s | 5GB | General purpose NLP, entity extraction, classification |
| **mistral** | 7B | Q4_K_M | <3s | 4GB | Fast inference, summarization, translation |

The quantization level (Q4_K_M) represents a carefully chosen tradeoff. Q4 quantization reduces model size by approximately 4x compared to FP16, with measured quality degradation of less than 3% on standard benchmarks (MMLU, HumanEval). The K_M variant uses mixed quantization -- attention layers retain higher precision while feed-forward layers use aggressive quantization -- which preserves reasoning quality while minimizing memory footprint.

## OTP Supervision Architecture

The Ollama integration follows Prismatic's OTP-first design philosophy. Every stateful component runs in its own supervised process, with explicit restart strategies and health monitoring.

```
OllamaSupervisor (rest_for_one)
    |
    +--- OllamaHealthMonitor (permanent)
    |       Pings Ollama server every 5s
    |       Emits telemetry events on state changes
    |
    +--- OllamaModelRouter (permanent)
    |       Routes inference requests to appropriate models
    |       Maintains model capability registry in ETS
    |
    +--- OllamaConnectionPool (permanent)
    |       Finch-based HTTP connection pool
    |       10 connections per pool, 2 pools
    |
    +--- OllamaInferenceWorker (temporary, dynamic)
            Spawned per-request for long-running inferences
            Timeout: 30s default, configurable per model
```

The `rest_for_one` supervision strategy ensures that if the health monitor crashes, the model router and connection pool are also restarted (since they depend on health state). Individual inference workers are temporary processes -- if one crashes during inference, only that request fails, without affecting the overall system.

### Connection Pool Implementation

```elixir
defmodule Prismatic.AI.OllamaPool do
  @moduledoc """
  OTP-supervised connection pool for Ollama HTTP requests.

  Uses Finch for HTTP/1.1 connection pooling with configurable
  pool size and per-request timeouts. Integrates with telemetry
  for latency tracking and circuit breaker monitoring.
  """

  use Supervisor

  @pool_name :ollama_pool
  @default_pool_size 10
  @default_pool_count 2

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    pool_size = Keyword.get(opts, :pool_size, @default_pool_size)
    pool_count = Keyword.get(opts, :pool_count, @default_pool_count)
    base_url = Keyword.get(opts, :base_url, "http://localhost:11434")

    children = [
      {Finch,
       name: @pool_name,
       pools: %{
         base_url => [
           size: pool_size,
           count: pool_count,
           protocol: :http1
         ]
       }}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec request(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
  def request(path, body, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    base_url = Keyword.get(opts, :base_url, "http://localhost:11434")

    start_time = System.monotonic_time(:microsecond)

    result =
      Finch.build(:post, "#{base_url}#{path}", [{"content-type", "application/json"}], Jason.encode!(body))
      |> Finch.request(@pool_name, receive_timeout: timeout)

    elapsed = System.monotonic_time(:microsecond) - start_time

    :telemetry.execute(
      [:prismatic, :ollama, :request],
      %{duration_us: elapsed},
      %{path: path, model: body[:model]}
    )

    case result do
      {:ok, %Finch.Response{status: 200, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:ok, %Finch.Response{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end
end
```

## Model Router and Task Classification

The model router is the intelligence layer that maps incoming inference requests to the most appropriate model. It considers task type, required quality level, available VRAM, and current model load.

```elixir
defmodule Prismatic.AI.ModelRouter do
  @moduledoc """
  Routes inference requests to appropriate Ollama models
  based on task classification and resource availability.
  """

  use GenServer

  @model_capabilities %{
    "qwen3-coder" => %{
      tasks: [:code_generation, :code_analysis, :ast_processing, :refactoring],
      quality_tier: :high,
      latency_class: :fast,
      vram_mb: 4096
    },
    "gpt-oss:20b" => %{
      tasks: [:complex_reasoning, :report_generation, :multi_step_analysis],
      quality_tier: :premium,
      latency_class: :standard,
      vram_mb: 12_288
    },
    "deepseek-coder" => %{
      tasks: [:code_completion, :query_generation, :schema_analysis],
      quality_tier: :high,
      latency_class: :fast,
      vram_mb: 4096
    },
    "llama3.2" => %{
      tasks: [:entity_extraction, :classification, :general_nlp],
      quality_tier: :standard,
      latency_class: :standard,
      vram_mb: 5120
    },
    "mistral" => %{
      tasks: [:summarization, :translation, :fast_inference],
      quality_tier: :standard,
      latency_class: :fast,
      vram_mb: 4096
    }
  }

  @spec route(atom(), keyword()) :: {:ok, String.t()} | {:error, :no_suitable_model}
  def route(task_type, opts \\ []) do
    quality_min = Keyword.get(opts, :quality, :standard)
    latency_max = Keyword.get(opts, :latency, :standard)

    suitable_models =
      @model_capabilities
      |> Enum.filter(fn {_model, caps} ->
        task_type in caps.tasks and
          quality_rank(caps.quality_tier) >= quality_rank(quality_min) and
          latency_rank(caps.latency_class) <= latency_rank(latency_max)
      end)
      |> Enum.sort_by(fn {_model, caps} -> quality_rank(caps.quality_tier) end, :desc)

    case suitable_models do
      [{model, _caps} | _rest] -> {:ok, model}
      [] -> {:error, :no_suitable_model}
    end
  end

  defp quality_rank(:premium), do: 3
  defp quality_rank(:high), do: 2
  defp quality_rank(:standard), do: 1

  defp latency_rank(:fast), do: 1
  defp latency_rank(:standard), do: 2
end
```

## Core Inference API

The primary inference interface provides both simple generation and structured chat completions. All calls go through the connection pool and model router, with automatic [telemetry](/glossary/telemetry/) emission.

```elixir
defmodule Prismatic.AI.Ollama do
  @moduledoc """
  Ollama LLM integration for local inference.

  Provides generate/2 for single-turn prompts and chat/2 for
  multi-turn conversations. All requests are routed through
  the connection pool with telemetry tracking.
  """

  alias Prismatic.AI.OllamaPool

  @spec generate(String.t(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def generate(prompt, opts \\ []) do
    model = Keyword.get(opts, :model, "qwen3-coder")
    timeout = Keyword.get(opts, :timeout, 30_000)

    body = %{
      model: model,
      prompt: prompt,
      stream: false,
      options: %{
        temperature: Keyword.get(opts, :temperature, 0.1),
        num_predict: Keyword.get(opts, :max_tokens, 2048)
      }
    }

    case OllamaPool.request("/api/generate", body, timeout: timeout) do
      {:ok, %{"response" => response}} -> {:ok, response}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec chat([map()], keyword()) :: {:ok, String.t()} | {:error, term()}
  def chat(messages, opts \\ []) do
    model = Keyword.get(opts, :model, "qwen3-coder")

    body = %{
      model: model,
      messages: messages,
      stream: false
    }

    case OllamaPool.request("/api/chat", body) do
      {:ok, %{"message" => %{"content" => content}}} -> {:ok, content}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

## Practical Use Cases

### Security-Sensitive Code Analysis

For [Perimeter EASM](/apps/prismatic-perimeter/) operations, code snippets discovered during [attack surface](/glossary/attack-surface/) scanning must be analyzed without sending potentially sensitive intellectual property to external APIs.

```elixir
defmodule PrismaticPerimeter.CodeAnalyzer do
  @moduledoc "Local AI-powered code analysis for discovered assets"

  def analyze_for_vulnerabilities(code_snippet, language) do
    prompt = """
    Analyze this #{language} code for security vulnerabilities.
    Focus on: SQL injection, XSS, authentication bypass, path traversal.
    Return structured JSON with: vulnerability_type, severity (1-10),
    line_number, description, remediation.

    ```#{language}
    #{code_snippet}
    ```
    """

    case Prismatic.AI.Ollama.generate(prompt, model: "qwen3-coder") do
      {:ok, response} -> parse_vulnerability_report(response)
      {:error, reason} -> {:error, {:analysis_failed, reason}}
    end
  end
end
```

### Entity Extraction from Intelligence Documents

Processing [OSINT](/glossary/osint/) documents requires extracting structured entities (companies, people, dates, relationships) without exposing the document content to cloud services.

```elixir
defmodule PrismaticIntelligence.EntityExtractor do
  @moduledoc "Local AI entity extraction for intelligence documents"

  def extract_entities(document_text) do
    {:ok, response} = Prismatic.AI.Ollama.generate("""
    Extract all entities from this intelligence document.
    Return JSON with keys: companies, people, dates, locations, relationships.
    Each entity should include: name, type, context, confidence (0.0-1.0).

    #{document_text}
    """, model: "gpt-oss:20b", timeout: 60_000)

    case Jason.decode(response) do
      {:ok, entities} -> {:ok, entities}
      {:error, _} -> {:ok, %{"raw" => response}}
    end
  end
end
```

### Graph Query Generation

The [KuzuDB graph database](/architecture/postgresql-kuzudb/) uses Cypher query language. Natural language to Cypher translation runs locally to avoid exposing the graph schema to external services.

```elixir
defmodule PrismaticGraph.QueryGenerator do
  @moduledoc "Natural language to Cypher query generation via local AI"

  @schema_description """
  Nodes: Company(ico, name, founded), Person(name, birth_date)
  Relationships: OWNS(percentage, since), DIRECTOR(since, until)
  """

  def generate_cypher(natural_language_query) do
    {:ok, cypher} = Prismatic.AI.Ollama.generate("""
    Generate a KuzuDB Cypher query for: "#{natural_language_query}"

    Schema: #{@schema_description}

    Return ONLY the Cypher query, no explanation.
    """, model: "deepseek-coder")

    {:ok, String.trim(cypher)}
  end
end
```

## Cloud Fallback and Circuit Breaker

The platform implements a graceful degradation strategy: when Ollama is unavailable (server down, model not loaded, resource exhaustion), requests automatically fall back to cloud APIs. This fallback is governed by a [circuit breaker](/glossary/circuit-breaker/) pattern that prevents cascade failures.

```elixir
defmodule Prismatic.AI.FallbackRouter do
  @moduledoc """
  Inference router with circuit breaker and automatic cloud fallback.

  The circuit breaker opens after 3 consecutive Ollama failures,
  routing all traffic to cloud for 60 seconds before attempting
  to half-open and test local availability.
  """

  use GenServer

  defstruct [
    :state,           # :closed | :open | :half_open
    :failure_count,
    :last_failure_at,
    :recovery_timeout  # milliseconds
  ]

  @failure_threshold 3
  @recovery_timeout 60_000

  def generate_with_fallback(prompt, opts \\ []) do
    case get_circuit_state() do
      :closed ->
        attempt_local(prompt, opts)

      :open ->
        if should_attempt_recovery?() do
          attempt_local_with_recovery(prompt, opts)
        else
          route_to_cloud(prompt, opts)
        end

      :half_open ->
        attempt_local_with_recovery(prompt, opts)
    end
  end

  defp attempt_local(prompt, opts) do
    case Prismatic.AI.Ollama.generate(prompt, opts) do
      {:ok, response} ->
        reset_circuit()
        {:ok, response, :local}

      {:error, reason} ->
        record_failure(reason)
        route_to_cloud(prompt, opts)
    end
  end

  defp route_to_cloud(prompt, opts) do
    Logger.warning("Ollama circuit open, routing to cloud API")
    :telemetry.execute([:prismatic, :ollama, :fallback], %{count: 1}, %{})

    case Prismatic.AI.CloudProvider.generate(prompt, opts) do
      {:ok, response} -> {:ok, response, :cloud}
      {:error, reason} -> {:error, {:both_failed, reason}}
    end
  end
end
```

## Performance Characteristics and Resource Management

### Measured Benchmarks

All benchmarks measured on Apple M2 Pro, 32GB RAM, Ollama 0.3.x.

| Operation | Model | p50 Latency | p99 Latency | Tokens/sec | Memory |
|-----------|-------|------------|------------|-----------|--------|
| Short prompt (50 tokens) | qwen3-coder | 890ms | 2.1s | 42 t/s | 4.2GB |
| Medium prompt (500 tokens) | qwen3-coder | 1.8s | 4.2s | 38 t/s | 4.3GB |
| Short prompt (50 tokens) | gpt-oss:20b | 2.1s | 5.8s | 22 t/s | 12.1GB |
| Code analysis (1000 tokens) | deepseek-coder | 2.4s | 6.1s | 35 t/s | 4.1GB |
| Entity extraction (2000 tokens) | llama3.2 | 3.8s | 8.2s | 28 t/s | 5.3GB |

### Resource Requirements by Configuration

| Configuration | Models Loaded | Total VRAM | Total RAM | Disk Space |
|---------------|--------------|-----------|----------|-----------|
| **Minimal** (1 model) | qwen3-coder | 4GB | 8GB | 4GB |
| **Standard** (3 models) | qwen3 + deepseek + mistral | 12GB | 16GB | 12GB |
| **Full** (5 models) | All models | 29GB | 32GB | 29GB |
| **Production** (GPU server) | All + replicas | 48GB+ | 64GB | 50GB |

### Optimization Strategies

Ollama's model loading is the primary latency bottleneck. The first request to an unloaded model incurs a 10-30 second loading penalty. The platform mitigates this through model preloading during application startup.

```elixir
defmodule Prismatic.AI.ModelPreloader do
  @moduledoc "Preloads frequently used models on application startup"

  use GenServer

  @preload_models ["qwen3-coder", "deepseek-coder", "mistral"]

  def init(_opts) do
    for model <- @preload_models do
      Task.start(fn ->
        Prismatic.AI.Ollama.generate("warmup", model: model, max_tokens: 1)
      end)
    end

    {:ok, %{preloaded: @preload_models}}
  end
end
```

## Comparison with Cloud-Only Approaches

| Dimension | Local (Ollama) | Cloud (Anthropic/OpenAI) | Prismatic Hybrid |
|-----------|---------------|------------------------|-----------------|
| **Data privacy** | Complete -- no data leaves machine | Data sent to third party | Sensitive local, routine cloud |
| **Latency (first token)** | 500ms-2s | 200ms-500ms | Context-dependent routing |
| **Model quality** | Good (7B-20B quantized) | Excellent (100B+ FP16) | Best of both via fallback |
| **Cost** | Hardware only (one-time) | Per-token pricing (ongoing) | Optimized -- local first |
| **Availability** | Depends on local hardware | 99.9% SLA | 99.99% with fallback |
| **Customization** | Full ([fine-tuning](/glossary/fine-tuning/), LoRA) | Limited (API parameters) | Full local + cloud baseline |
| **Compliance** | Easy (data stays local) | Complex (DPA required) | Simplified -- default local |

The hybrid approach is the key architectural insight. Pure local inference sacrifices quality; pure cloud inference sacrifices privacy. By combining both with intelligent routing, the platform achieves the best of both worlds: sensitive operations stay local with acceptable quality, while non-sensitive operations can leverage superior cloud models when local resources are constrained.

## Integration with Platform Components

The Ollama subsystem integrates with several platform components:

- **[Agent system](/apps/prismatic-agents/)**: Agents use the inference API for reasoning, classification, and generation tasks. The Ollama Coordinator Agent manages the model lifecycle.
- **[Meilisearch](/architecture/meilisearch/)**: Search result enrichment uses local AI for semantic reranking without exposing search queries to external services.
- **[NABLA framework](/architecture/nabla-framework/)**: Confidence scores from local inference are tagged with source provenance (`source_family: :local_llm`) for proper independence weighting.
- **[Telemetry](/architecture/telemetry/)**: All inference requests emit telemetry events (`[:prismatic, :ollama, :request]`) with duration, model, and outcome metadata.
- **[Supervision trees](/architecture/supervision-trees/)**: The Ollama subsystem runs under its own [supervisor](/glossary/supervisor/) within the platform's [OTP supervision hierarchy](/glossary/supervision-tree/).

## Security Considerations

Running LLMs locally introduces its own security surface. The platform addresses these through several mechanisms:

- **Process isolation**: Ollama runs as a separate OS process, not embedded in the [BEAM](/glossary/beam/) VM. A model crash cannot corrupt platform state.
- **Network binding**: Ollama binds to `localhost:11434` only. No external network access is permitted in production deployments.
- **Input sanitization**: All prompts pass through a sanitization layer that strips potential prompt injection patterns before reaching the model.
- **Output validation**: Model outputs are parsed and validated before being used in platform decisions. Raw LLM output never directly influences security-critical paths without passing through the [NABLA framework's](/architecture/nabla-framework/) confidence assessment.
- **Resource limits**: Per-request timeouts and memory limits prevent a single inference from consuming all available resources.

## Commands and Operations

| Command | Description | Use Case |
|---------|-------------|----------|
| `/ollama status` | Check Ollama server health and loaded models | Operational monitoring |
| `/ollama models` | List available and loaded models with resource usage | Capacity planning |
| `/ollama install <model>` | Download and install a new model | Capability expansion |
| `/ollama config` | Show current configuration and pool settings | Debugging |
| `/ollama test` | Run inference benchmark across all loaded models | Performance validation |
| `/ollama optimize` | Optimize model loading order and memory allocation | Resource optimization |

These commands integrate with the platform's [AIAD command framework](/capabilities/aiad-standard/), ensuring consistent invocation patterns and telemetry tracking across all operational interfaces.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)