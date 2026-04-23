+++
title = "AI Inference"
weight = 50

[extra]
description = "The computational process of using a trained artificial intelligence model to generate predictions, classifications, or outputs from new input data, encompassing model loading, input preprocessing, forward pass execution, and output postprocessing"
category = "ai"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "machine-learning"
related_concepts = ["llm", "ollama", "embedding", "fine-tuning", "ai-model", "ai-agent", "artificial-intelligence", "genserver"]
implementation_status = "production"
authority_level = "L3"
difficulty_rating = 6
prerequisites = ["artificial-intelligence", "ai-model", "llm"]
learning_path = "ai-engineering"
interactive_demos = ["/labs/glossary/ai-inference"]
code_examples = ["PrismaticAI.Inference.run/3", "PrismaticAI.OllamaClient.generate/2"]
external_resources = ["NVIDIA TensorRT Inference Guide", "ONNX Runtime Documentation", "Ollama Model Library"]
version_introduced = "gen-11"
stability_level = "stable"
testing_scenarios = ["inference-latency-benchmark", "model-accuracy-validation", "batch-inference-throughput"]
keywords = ["AI inference", "model inference", "prediction", "forward pass", "model serving", "inference optimization", "real-time inference", "batch inference"]
tags = ["ai", "inference", "machine-learning", "llm", "ollama", "model-serving", "prediction"]
related_terms = ["llm", "ollama", "embedding", "fine-tuning", "ai-model", "ai-agent", "artificial-intelligence", "genserver", "telemetry", "circuit-breaker"]
word_count = 1512
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AI Inference - Prismatic Platform"
+++

## Definition

**AI Inference** is the computational process of applying a trained artificial intelligence model to new, previously unseen input data to generate predictions, classifications, embeddings, or other structured outputs. It is the production-facing counterpart to model training: where training adjusts model parameters to learn patterns from data, inference uses those fixed parameters to process new inputs in real time or batch. The inference pipeline encompasses model loading and initialization, input preprocessing and tokenization, forward pass computation through the model's neural network layers, and output postprocessing including decoding, sampling, and formatting.

## Overview

AI inference is where the value of machine learning is realized. A trained model sitting in storage produces no value; only when it processes real inputs and generates actionable outputs does the investment in data collection, feature engineering, and training pay off. For this reason, inference optimization -- reducing latency, maximizing throughput, minimizing resource consumption -- is a critical engineering discipline in production AI systems.

The inference landscape has bifurcated into two major categories. **Traditional ML inference** involves relatively small models (gradient boosted trees, logistic regression, small neural networks) that can run efficiently on CPUs with millisecond latency. **Large Language Model (LLM) inference** involves models with billions of parameters that require GPUs or specialized accelerators, produce tokens sequentially (autoregressive generation), and present unique optimization challenges around memory bandwidth, key-value cache management, and speculative decoding.

The Prismatic Platform's AI inference infrastructure supports both categories. For LLM inference, the platform integrates with Ollama for local model serving (supporting models like qwen3-coder, gpt-oss:20b, deepseek-coder) and with cloud providers (Anthropic Claude) for high-capability tasks. For traditional ML inference, the platform uses Elixir/Erlang's Nx numerical computing library and ONNX Runtime for model execution. The architecture prioritizes inference latency (under 3 seconds for local models, under 5 seconds for cloud models) while maintaining automatic fallback between providers for resilience.

### Inference vs. Training

| Aspect | Training | Inference |
|--------|----------|-----------|
| **Goal** | Learn model parameters from data | Apply learned parameters to new data |
| **Computation** | Forward pass + backward pass (gradient computation) | Forward pass only |
| **Data Volume** | Large datasets (millions/billions of examples) | Single input or small batches |
| **Latency Requirement** | Hours to weeks acceptable | Milliseconds to seconds required |
| **Hardware** | GPU clusters, TPU pods | Single GPU, CPU, or edge devices |
| **Memory Pattern** | Gradient storage, optimizer state | Model weights + activation cache |
| **Frequency** | Periodic (retrain monthly/quarterly) | Continuous (every request) |
| **Optimization Focus** | Convergence speed, final accuracy | Latency, throughput, cost per inference |

## Technical Details

### Inference Pipeline Architecture

A production inference pipeline comprises several stages, each with distinct optimization opportunities:

```elixir
defmodule PrismaticAI.Inference do
  @moduledoc """
  Core inference pipeline for the Prismatic Platform.
  Manages the full lifecycle from input preprocessing through
  model execution to output postprocessing.
  """

  @type inference_request :: %{
    model: String.t(),
    input: String.t() | map(),
    parameters: map(),
    timeout: non_neg_integer()
  }

  @type inference_result :: %{
    output: term(),
    model: String.t(),
    latency_ms: non_neg_integer(),
    tokens_generated: non_neg_integer(),
    provider: :ollama | :cloud | :local
  }

  @spec run(String.t(), term(), keyword()) ::
          {:ok, inference_result()} | {:error, term()}
  def run(model, input, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    provider = Keyword.get(opts, :provider, :auto)

    start_time = System.monotonic_time(:millisecond)

    with {:ok, provider} <- resolve_provider(model, provider),
         {:ok, preprocessed} <- preprocess(input, model),
         {:ok, raw_output} <- execute_forward_pass(provider, model, preprocessed, timeout),
         {:ok, postprocessed} <- postprocess(raw_output, model, opts) do
      latency = System.monotonic_time(:millisecond) - start_time

      :telemetry.execute(
        [:prismatic_ai, :inference, :completed],
        %{latency_ms: latency, tokens: count_tokens(raw_output)},
        %{model: model, provider: provider}
      )

      {:ok, %{
        output: postprocessed,
        model: model,
        latency_ms: latency,
        tokens_generated: count_tokens(raw_output),
        provider: provider
      }}
    end
  end

  @spec resolve_provider(String.t(), atom()) :: {:ok, atom()} | {:error, term()}
  defp resolve_provider(model, :auto) do
    cond do
      ollama_available?(model) -> {:ok, :ollama}
      cloud_available?() -> {:ok, :cloud}
      true -> {:error, :no_provider_available}
    end
  end

  defp resolve_provider(_model, provider), do: {:ok, provider}
end
```

### LLM Inference: Autoregressive Generation

Large language models generate text one token at a time, with each new token depending on all previously generated tokens. This autoregressive process creates unique performance characteristics:

```elixir
defmodule PrismaticAI.LLMInference do
  @moduledoc """
  Specialized inference pipeline for large language models.
  Implements autoregressive token generation with KV-cache
  optimization and configurable sampling strategies.
  """

  @type generation_config :: %{
    max_tokens: non_neg_integer(),
    temperature: float(),
    top_p: float(),
    top_k: non_neg_integer(),
    stop_sequences: list(String.t()),
    stream: boolean()
  }

  @default_config %{
    max_tokens: 4096,
    temperature: 0.0,
    top_p: 1.0,
    top_k: 50,
    stop_sequences: [],
    stream: false
  }

  @spec generate(String.t(), String.t(), generation_config()) ::
          {:ok, String.t()} | {:error, term()}
  def generate(model, prompt, config \\ @default_config) do
    with {:ok, tokenized} <- tokenize(prompt, model),
         {:ok, kv_cache} <- initialize_kv_cache(model, length(tokenized)),
         {:ok, tokens} <- autoregressive_decode(model, tokenized, kv_cache, config) do
      {:ok, detokenize(tokens, model)}
    end
  end

  @spec autoregressive_decode(String.t(), list(integer()), map(), generation_config()) ::
          {:ok, list(integer())} | {:error, term()}
  defp autoregressive_decode(model, input_tokens, kv_cache, config) do
    Stream.unfold({input_tokens, kv_cache, 0}, fn
      {_tokens, _cache, count} when count >= config.max_tokens ->
        nil

      {tokens, cache, count} ->
        case forward_pass_single_token(model, List.last(tokens), cache) do
          {:ok, logits, updated_cache} ->
            next_token = sample_token(logits, config)

            if next_token in get_stop_token_ids(config.stop_sequences, model) do
              nil
            else
              {next_token, {tokens ++ [next_token], updated_cache, count + 1}}
            end

          {:error, _reason} ->
            nil
        end
      end)
    |> Enum.to_list()
    |> then(&{:ok, &1})
  end

  @spec sample_token(list(float()), generation_config()) :: integer()
  defp sample_token(logits, %{temperature: 0.0}) do
    logits
    |> Enum.with_index()
    |> Enum.max_by(fn {logit, _idx} -> logit end)
    |> elem(1)
  end

  defp sample_token(logits, %{temperature: temp, top_p: top_p}) do
    logits
    |> Enum.map(&(&1 / temp))
    |> softmax()
    |> apply_top_p(top_p)
    |> weighted_sample()
  end
end
```

### Key Performance Metrics

| Metric | Definition | Target (Local) | Target (Cloud) |
|--------|-----------|---------------|---------------|
| **Time to First Token (TTFT)** | Latency before first output token | < 500ms | < 1000ms |
| **Tokens Per Second (TPS)** | Rate of token generation | 30-50 TPS | 50-100 TPS |
| **Total Latency** | End-to-end inference time | < 3s (7B model) | < 5s |
| **Memory Usage** | GPU/system memory consumed | < 8GB (7B model) | N/A (provider managed) |
| **Throughput** | Concurrent requests handled | 5-10 concurrent | 50+ concurrent |
| **Accuracy** | Quality of model outputs | > 85% task success | > 95% task success |

### Inference Optimization Techniques

Optimizing inference performance involves multiple complementary techniques:

#### 1. Model Quantization

Reducing numerical precision from FP32 to FP16, INT8, or INT4 to decrease memory usage and increase throughput:

| Precision | Memory (7B model) | Speed | Quality Impact |
|-----------|-------------------|-------|---------------|
| **FP32** | 28 GB | 1x baseline | None |
| **FP16** | 14 GB | 1.5-2x | Negligible |
| **INT8** | 7 GB | 2-3x | Minor (< 1% accuracy drop) |
| **INT4** | 3.5 GB | 3-4x | Moderate (1-3% accuracy drop) |

#### 2. KV-Cache Optimization

During autoregressive generation, key-value pairs from attention layers are cached to avoid redundant computation. Managing this cache efficiently is critical for long sequences:

```elixir
defmodule PrismaticAI.KVCacheManager do
  @moduledoc """
  Manages key-value caches for transformer attention layers
  during autoregressive inference, implementing paged attention
  for efficient memory utilization.
  """

  @type cache_entry :: %{
    key: Nx.Tensor.t(),
    value: Nx.Tensor.t(),
    sequence_length: non_neg_integer()
  }

  @spec initialize(String.t(), non_neg_integer()) :: {:ok, map()} | {:error, term()}
  def initialize(model, num_layers) do
    cache =
      0..(num_layers - 1)
      |> Enum.map(fn layer_idx ->
        {layer_idx, %{
          key: Nx.tensor([], type: :f16),
          value: Nx.tensor([], type: :f16),
          sequence_length: 0
        }}
      end)
      |> Map.new()

    {:ok, cache}
  end

  @spec append(map(), non_neg_integer(), Nx.Tensor.t(), Nx.Tensor.t()) :: {:ok, map()}
  def append(cache, layer_idx, new_key, new_value) do
    entry = Map.fetch!(cache, layer_idx)

    updated_entry = %{entry |
      key: Nx.concatenate([entry.key, new_key], axis: -2),
      value: Nx.concatenate([entry.value, new_value], axis: -2),
      sequence_length: entry.sequence_length + 1
    }

    {:ok, Map.put(cache, layer_idx, updated_entry)}
  end

  @spec evict_oldest(map(), non_neg_integer()) :: {:ok, map()}
  def evict_oldest(cache, tokens_to_evict) do
    updated =
      Map.new(cache, fn {layer_idx, entry} ->
        {layer_idx, %{entry |
          key: Nx.slice_along_axis(entry.key, tokens_to_evict, :all, axis: -2),
          value: Nx.slice_along_axis(entry.value, tokens_to_evict, :all, axis: -2),
          sequence_length: max(entry.sequence_length - tokens_to_evict, 0)
        }}
      end)

    {:ok, updated}
  end
end
```

#### 3. Batching Strategies

Processing multiple inference requests together increases hardware utilization:

| Strategy | Description | Latency | Throughput | Use Case |
|----------|-------------|---------|-----------|----------|
| **No Batching** | Process one request at a time | Lowest | Lowest | Real-time, latency-critical |
| **Static Batching** | Fixed batch size, wait for batch to fill | Higher | Medium | Offline processing |
| **Dynamic Batching** | Variable batch, short wait window | Balanced | High | API serving |
| **Continuous Batching** | Add/remove requests during generation | Lowest for batch | Highest | High-throughput LLM serving |

#### 4. Speculative Decoding

Using a smaller, faster model to draft candidate tokens that the larger model then verifies in parallel:

```elixir
defmodule PrismaticAI.SpeculativeDecoder do
  @moduledoc """
  Implements speculative decoding for accelerated LLM inference.
  A small draft model proposes K tokens; the large target model
  verifies them in a single forward pass.
  """

  @spec speculative_generate(String.t(), String.t(), String.t(), keyword()) ::
          {:ok, String.t()} | {:error, term()}
  def speculative_generate(target_model, draft_model, prompt, opts \\ []) do
    speculation_length = Keyword.get(opts, :speculation_length, 5)
    max_tokens = Keyword.get(opts, :max_tokens, 4096)

    generate_loop(target_model, draft_model, prompt, speculation_length, max_tokens, [])
  end

  @spec generate_loop(String.t(), String.t(), String.t(), integer(), integer(), list()) ::
          {:ok, String.t()} | {:error, term()}
  defp generate_loop(_target, _draft, _prompt, _spec_len, max_tokens, acc)
       when length(acc) >= max_tokens do
    {:ok, Enum.join(acc)}
  end

  defp generate_loop(target_model, draft_model, prompt, spec_len, max_tokens, acc) do
    # Draft model generates K candidate tokens quickly
    {:ok, draft_tokens} = draft_generate(draft_model, prompt, spec_len)

    # Target model verifies all K tokens in a single forward pass
    {:ok, verified_tokens} = verify_tokens(target_model, prompt, draft_tokens)

    # Accept verified prefix, reject from first disagreement
    accepted = take_verified_prefix(draft_tokens, verified_tokens)

    updated_prompt = prompt <> Enum.join(accepted)
    generate_loop(target_model, draft_model, updated_prompt, spec_len, max_tokens, acc ++ accepted)
  end
end
```

## Implementation in Prismatic Platform

### Ollama Integration

The platform's primary local inference backend is Ollama, providing zero-configuration model serving:

```elixir
defmodule PrismaticAI.OllamaClient do
  @moduledoc """
  Client for the Ollama local AI model serving infrastructure.
  Provides generate, embed, and chat endpoints with automatic
  model management and health monitoring.
  """

  @base_url "http://localhost:11434"

  @spec generate(String.t(), String.t(), keyword()) ::
          {:ok, map()} | {:error, term()}
  def generate(model, prompt, opts \\ []) do
    body = %{
      model: model,
      prompt: prompt,
      stream: Keyword.get(opts, :stream, false),
      options: %{
        temperature: Keyword.get(opts, :temperature, 0.0),
        num_predict: Keyword.get(opts, :max_tokens, 4096),
        top_p: Keyword.get(opts, :top_p, 1.0)
      }
    }

    case http_post("#{@base_url}/api/generate", body) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, %{
          response: response_body["response"],
          model: model,
          eval_count: response_body["eval_count"],
          eval_duration_ns: response_body["eval_duration"],
          tokens_per_second: calculate_tps(response_body)
        }}

      {:ok, %{status: status}} ->
        {:error, %{status: status, message: "Ollama request failed"}}

      {:error, reason} ->
        {:error, %{reason: reason, message: "Ollama connection failed"}}
    end
  end

  @spec embed(String.t(), String.t()) :: {:ok, list(float())} | {:error, term()}
  def embed(model, text) do
    body = %{model: model, prompt: text}

    case http_post("#{@base_url}/api/embeddings", body) do
      {:ok, %{status: 200, body: %{"embedding" => embedding}}} ->
        {:ok, embedding}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec health_check() :: {:ok, map()} | {:error, term()}
  def health_check do
    case http_get("#{@base_url}/api/tags") do
      {:ok, %{status: 200, body: body}} ->
        models = body["models"] || []
        {:ok, %{status: :healthy, models: length(models), available_models: models}}

      {:error, reason} ->
        {:error, %{status: :unhealthy, reason: reason}}
    end
  end
end
```

### Cloud Provider Fallback

When local inference is unavailable or insufficient, the platform automatically falls back to cloud providers:

```elixir
defmodule PrismaticAI.ProviderRouter do
  @moduledoc """
  Routes inference requests to the optimal provider based on
  availability, capability, and cost. Implements circuit breaker
  pattern for automatic fallback.
  """

  @spec route(String.t(), map()) :: {:ok, atom()} | {:error, term()}
  def route(model_requirement, context) do
    providers = [
      {:ollama, &ollama_available?/1, :local, 0},
      {:anthropic, &anthropic_available?/1, :cloud, 1},
      {:openai, &openai_available?/1, :cloud, 2}
    ]

    providers
    |> Enum.filter(fn {name, check_fn, _type, _priority} ->
      not circuit_open?(name) and check_fn.(model_requirement)
    end)
    |> Enum.sort_by(fn {_name, _check, _type, priority} -> priority end)
    |> case do
      [{provider, _, _, _} | _] -> {:ok, provider}
      [] -> {:error, :no_providers_available}
    end
  end

  @spec circuit_open?(atom()) :: boolean()
  defp circuit_open?(provider) do
    case PrismaticAI.CircuitBreaker.status(provider) do
      :open -> true
      :half_open -> false
      :closed -> false
    end
  end
end
```

### Inference Telemetry and Monitoring

All inference operations emit structured telemetry for observability:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic_ai, :inference, :started]` | `%{}` | model, provider, input_length |
| `[:prismatic_ai, :inference, :completed]` | latency_ms, tokens | model, provider |
| `[:prismatic_ai, :inference, :failed]` | latency_ms | model, provider, error |
| `[:prismatic_ai, :inference, :fallback]` | `%{}` | from_provider, to_provider, reason |

## Comparison with Alternatives

| Inference Platform | Deployment | Supported Models | Latency | Cost Model | Best For |
|-------------------|-----------|-----------------|---------|-----------|---------|
| **Ollama (Prismatic default)** | Local | Open-source LLMs (Llama, Qwen, DeepSeek) | < 3s (7B) | Free (hardware only) | Privacy, offline, development |
| **vLLM** | Self-hosted | Any HuggingFace model | Sub-second (with GPU) | Infrastructure cost | High-throughput LLM serving |
| **TensorRT-LLM** | Self-hosted (NVIDIA) | Optimized for NVIDIA GPUs | Fastest | NVIDIA hardware | Maximum performance |
| **Anthropic API** | Cloud | Claude models | 1-5s | Per-token pricing | Highest capability tasks |
| **OpenAI API** | Cloud | GPT models | 1-3s | Per-token pricing | General-purpose LLM tasks |
| **AWS SageMaker** | Cloud | Any | Variable | Instance + inference | Enterprise ML pipelines |
| **Replicate** | Cloud | Open-source models | Variable | Per-second pricing | Experimentation, prototyping |
| **ONNX Runtime** | Local/Edge | Traditional ML + small models | < 10ms | Free | Edge deployment, traditional ML |

The Prismatic Platform's dual-track approach (local Ollama + cloud fallback) provides the best balance of privacy, cost, and capability. Local inference handles routine operations with zero marginal cost and complete data privacy; cloud inference handles complex tasks requiring frontier model capabilities.

## Best Practices

### 1. Right-Size Your Model

Not every inference task requires a 70B parameter model. Use the smallest model that achieves acceptable quality for each use case. The platform routes to qwen3-coder (7B) for code tasks, reserving Claude for complex reasoning.

### 2. Optimize the Critical Path

Profile the full inference pipeline, not just model execution time. Input preprocessing, tokenization, and output parsing can contribute significant latency. Optimize the slowest component first.

### 3. Implement Caching

Many inference requests produce identical or similar outputs. Cache frequent queries, use semantic similarity to identify cache-hittable requests, and invalidate caches when models are updated.

### 4. Monitor Model Quality in Production

Model accuracy can degrade over time due to data drift (input distribution changes) or concept drift (relationship between inputs and desired outputs changes). Implement continuous quality monitoring with automated alerts.

### 5. Design for Graceful Degradation

When the primary inference provider fails, the system should automatically fall back to alternatives rather than returning errors. The platform's circuit breaker and provider router implement this pattern.

### 6. Batch Where Possible

If latency requirements permit, batch multiple inference requests together to improve hardware utilization. The platform uses dynamic batching for non-real-time workloads.

## Common Pitfalls

### Ignoring Cold Start Latency

The first inference after model loading can be significantly slower than subsequent requests due to model loading, compilation, and cache warming. Pre-warm models before serving traffic.

### Over-Provisioning for Peak Load

Inference infrastructure sized for peak demand wastes resources during normal operation. Use autoscaling, request queuing, or dynamic batching to handle load spikes efficiently.

### Neglecting Input Validation

Malformed, oversized, or adversarial inputs can cause inference failures, excessive latency, or resource exhaustion. Validate and sanitize all inputs before they reach the model.

### Not Measuring End-to-End Latency

Optimizing model inference time while ignoring network latency, queue wait time, and postprocessing time gives a misleading picture of user-perceived performance. Measure and optimize end-to-end.

### Single Provider Dependency

Relying on a single inference provider creates availability risk. The Prismatic Platform's multi-provider architecture with automatic fallback ensures resilience against provider outages.

## Use Cases

### Agent Reasoning

The platform's 530+ AIAD agents use AI inference for natural language understanding, task planning, and decision making. The Archer Supreme orchestrator uses Claude for complex multi-step reasoning; specialist agents use local Ollama models for routine classification and extraction tasks.

### Code Generation and Analysis

Development-oriented agents use inference for code generation (qwen3-coder), static analysis enrichment, and automated code review. Inference latency under 3 seconds ensures responsive developer experience.

### OSINT Entity Classification

Intelligence gathering agents use inference to classify entities extracted from open sources, determine relevance, and assess risk levels. Batch inference processes hundreds of entities per OSINT collection cycle.

### Security Assessment Reasoning

Color Team agents use inference to reason about attack scenarios, analyze vulnerability chains, and generate defensive recommendations. The Red Team's epistemic attack simulation requires fast inference loops for iterative scenario refinement.

### Embedding Generation

Semantic search across the platform's knowledge base uses embedding models to convert text into high-dimensional vectors. Ollama's embedding endpoint generates vectors for document indexing and similarity search.

## Related Concepts

- [LLM](/glossary/llm/) - Large language models that are the primary target of modern AI inference optimization
- [Ollama](/glossary/ollama/) - Local AI model serving platform used as the primary inference backend
- [Embedding](/glossary/embedding/) - Vector representations generated through embedding model inference
- [Fine-Tuning](/glossary/fine-tuning/) - Model customization that precedes inference deployment
- [AI Model](/glossary/ai-model/) - The trained artifact that inference executes
- [AI Agent](/glossary/ai-agent/) - Autonomous entities that consume inference outputs for decision making
- [Artificial Intelligence](/glossary/artificial-intelligence/) - The broader field encompassing inference as a core capability
- [GenServer](/glossary/genserver/) - OTP process abstraction used to implement inference servers
- [Telemetry](/glossary/telemetry/) - Observability framework monitoring inference performance
- [Circuit Breaker](/glossary/circuit-breaker/) - Fault tolerance pattern protecting inference provider connections

## See Also

- [Backpressure](/glossary/backpressure/) - Flow control essential for managing inference request queues
- [ETS](/glossary/ets/) - In-memory storage used for inference result caching
- [Phoenix LiveView](/glossary/phoenix-liveview/) - Real-time UI framework displaying inference results
- [Agent Orchestration](/glossary/agent-orchestration/) - Coordination layer that routes inference requests across agents
- [Security Rating](/glossary/security-rating/) - Perimeter output partially derived from inference-based analysis

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
