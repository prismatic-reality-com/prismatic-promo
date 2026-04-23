+++
title = "Inference"
weight = 36
[extra]
category = "technology"
description = "Executing a trained AI model to generate predictions or outputs"
related_terms = ["ollama", "beam", "telemetry", "observability", "rate-limiting", "backpressure"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 783
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Inference", "Executing", "glossary", "technology", "Prismatic Platform", "README", "Cache"]
tags = ["glossary", "technology", "inference", "prismatic"]
quality_score = 67
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Inference - Prismatic Platform"
+++

## Definition

Inference is the computational process of executing a trained artificial intelligence model to produce outputs (predictions, classifications, text generations, or decisions) from new, previously unseen inputs. Unlike training, which adjusts model parameters by iterating over datasets to minimize a loss function, inference applies the fixed, learned parameters to transform inputs into outputs in a single forward pass through the model's neural network architecture. In production systems, inference encompasses the complete pipeline: input preprocessing and tokenization, tensor construction, forward propagation through the model's layers, output sampling or decoding, and post-processing of results into application-consumable formats.

Inference performance is characterized by three primary dimensions: latency (time-to-first-token and time-to-completion for generative models, or total response time for classification models), throughput (tokens per second or requests per second the system can sustain), and resource efficiency (memory consumption, GPU/CPU utilization, and energy cost per inference). These dimensions exist in tension -- optimizing for throughput through batching increases individual request latency, while minimizing latency through dedicated resources reduces throughput and increases cost. Production inference systems must navigate these tradeoffs based on application requirements, with interactive applications prioritizing latency and batch processing pipelines prioritizing throughput.

The distinction between training and inference has profound implications for system architecture. Training is a batch process requiring massive computational resources for hours or days, producing a model artifact. Inference is a real-time service requiring sustained, low-latency processing for the operational lifetime of the application. This difference means that training infrastructure (GPU clusters, distributed data pipelines) and inference infrastructure (serving frameworks, load balancers, model caches) are fundamentally different systems optimized for different workloads.

## Overview

The inference landscape has evolved rapidly with the proliferation of Large Language Models (LLMs) and the emergence of local inference runtimes. Where inference previously required cloud GPU instances costing thousands of dollars per month, modern quantization techniques and optimized runtimes enable 7B-20B parameter models to run on consumer hardware with acceptable latency. This democratization of inference capability enables platforms to maintain AI functionality with reduced cloud dependency, improved data privacy, and predictable cost profiles.

### Inference Pipeline Stages

| Stage | Description | Typical Latency | Optimization |
|-------|-------------|-----------------|--------------|
| **Preprocessing** | Input validation, tokenization, embedding lookup | 1-5ms | Token caching, batch tokenization |
| **Prefill** | Processing all input tokens through attention layers | 50-500ms | FlashAttention, tensor parallelism |
| **Generation** | Auto-regressive token generation (LLMs) | 20-100ms/token | KV-cache, speculative decoding |
| **Postprocessing** | Token decoding, output formatting, validation | 1-5ms | Streaming output, early stopping |

### Model Optimization Techniques

| Technique | Memory Reduction | Speed Impact | Quality Impact |
|-----------|------------------|--------------|----------------|
| **FP16** | 50% vs FP32 | 1.5-2x faster | Negligible |
| **INT8 Quantization** | 75% vs FP32 | 2-3x faster | Minor (< 1% perplexity) |
| **INT4 Quantization (GPTQ/AWQ)** | 87.5% vs FP32 | 3-4x faster | Moderate (1-3% perplexity) |
| **GGUF (llama.cpp)** | Variable (Q4_K_M typical) | CPU-optimized | Varies by quant level |
| **Speculative Decoding** | None | 2-3x faster generation | Lossless |
| **KV-Cache** | Increases memory | Required for generation | Lossless |
| **Continuous Batching** | None | 2-5x throughput | Lossless |

### Inference Architectures

```
                    +-----------------------+
                    |    Request Router     |
                    |  (load balancing,     |
                    |   rate limiting)      |
                    +----------+------------+
                               |
              +----------------+----------------+
              |                |                |
     +--------v------+  +-----v--------+  +---v-----------+
     | Local Runtime  |  | Cloud API    |  | Hybrid        |
     | (Ollama)       |  | (Claude,     |  | (local first, |
     | - 7B-20B       |  |  GPT)        |  |  cloud        |
     | - < 8GB RAM    |  | - Any size   |  |  fallback)    |
     | - Privacy      |  | - Fastest    |  | - Balanced    |
     +----------------+  +--------------+  +---------------+
```

## Technical Details

### Tokenization and Input Processing

Inference begins with converting raw input into the model's expected format. For LLMs, this means tokenization -- mapping text strings to integer token IDs using the model's vocabulary:

| Tokenizer | Vocabulary Size | Avg Tokens/Word | Used By |
|-----------|----------------|-----------------|---------|
| **BPE (Byte Pair Encoding)** | 32K-100K | 1.3-1.5 | GPT, Llama |
| **SentencePiece** | 32K-64K | 1.2-1.4 | T5, Gemma |
| **WordPiece** | 30K-50K | 1.4-1.6 | BERT |
| **Tiktoken** | 100K+ | 1.1-1.3 | Claude, GPT-4 |

### KV-Cache Management

During auto-regressive generation, each new token attends to all previous tokens. Without caching, this requires recomputing attention for the entire sequence at every step (O(n^2) complexity). The KV-cache stores intermediate key-value attention states, reducing per-token generation to O(n) by reusing cached computations:

| Sequence Length | Without KV-Cache | With KV-Cache | Memory Cost (7B FP16) |
|-----------------|------------------|---------------|----------------------|
| 512 tokens | 512 forward passes | 1 forward pass + 511 cached | ~500MB |
| 2048 tokens | 2048 forward passes | 1 forward pass + 2047 cached | ~2GB |
| 8192 tokens | 8192 forward passes | 1 forward pass + 8191 cached | ~8GB |

### Batching Strategies

| Strategy | Description | Latency | Throughput | Use Case |
|----------|-------------|---------|------------|----------|
| **No batching** | One request at a time | Lowest | Lowest | Interactive, single-user |
| **Static batching** | Fixed batch size, wait for batch fill | Higher | Medium | Batch processing |
| **Continuous batching** | Dynamic insertion/completion | Medium | Highest | Production serving |
| **Speculative batching** | Draft model generates, main model verifies | Low | High | Latency-sensitive generation |

## Implementation in Prismatic Platform

The Prismatic Platform runs inference workloads through Ollama's local AI infrastructure, with the Ollama Coordinator Agent managing model lifecycle, resource allocation, and performance monitoring:

```elixir
defmodule PrismaticAgents.InferenceCoordinator do
  @moduledoc """
  Coordinates AI inference requests across local Ollama runtime
  and cloud fallback providers with backpressure and rate limiting.
  """

  use GenServer

  alias PrismaticAgents.OllamaClient
  alias PrismaticAgents.CloudFallback

  @max_concurrent_local 4
  @local_timeout_ms 30_000
  @memory_limit_bytes 8 * 1024 * 1024 * 1024  # 8GB

  @type inference_request :: %{
    model: String.t(),
    prompt: String.t(),
    max_tokens: pos_integer(),
    temperature: float()
  }

  @type inference_result :: %{
    output: String.t(),
    tokens_generated: pos_integer(),
    latency_ms: non_neg_integer(),
    provider: :local | :cloud
  }

  @spec infer(inference_request()) :: {:ok, inference_result()} | {:error, term()}
  def infer(request) do
    GenServer.call(__MODULE__, {:infer, request}, @local_timeout_ms)
  end

  @impl GenServer
  def handle_call({:infer, request}, _from, state) do
    start_time = System.monotonic_time(:millisecond)

    result =
      if state.active_requests < @max_concurrent_local and
           state.memory_usage < @memory_limit_bytes do
        execute_local(request, start_time)
      else
        execute_cloud_fallback(request, start_time)
      end

    emit_inference_telemetry(result)
    {:reply, result, update_state(state, result)}
  end

  defp execute_local(request, start_time) do
    case OllamaClient.generate(request) do
      {:ok, response} ->
        latency = System.monotonic_time(:millisecond) - start_time

        {:ok, %{
          output: response.text,
          tokens_generated: response.eval_count,
          latency_ms: latency,
          provider: :local
        }}

      {:error, :timeout} ->
        CloudFallback.generate(request, start_time)
    end
  end

  defp emit_inference_telemetry({:ok, result}) do
    :telemetry.execute(
      [:prismatic, :inference, :complete],
      %{
        latency_ms: result.latency_ms,
        tokens: result.tokens_generated
      },
      %{provider: result.provider}
    )
  end
end
```

### Model Configuration

```elixir
defmodule PrismaticAgents.InferenceConfig do
  @moduledoc "Inference model configuration and selection."

  @models %{
    "qwen3-coder" => %{
      parameters: "7B",
      response_time: "< 3s",
      memory: "< 4GB",
      use_case: :code_generation
    },
    "gpt-oss:20b" => %{
      parameters: "20B",
      response_time: "< 5s",
      memory: "< 8GB",
      use_case: :general_reasoning
    },
    "deepseek-coder" => %{
      parameters: "6.7B",
      response_time: "< 3s",
      memory: "< 4GB",
      use_case: :code_analysis
    }
  }

  @spec select_model(atom()) :: {:ok, map()} | {:error, :no_suitable_model}
  def select_model(use_case) do
    case Enum.find(@models, fn {_name, config} -> config.use_case == use_case end) do
      {name, config} -> {:ok, Map.put(config, :name, name)}
      nil -> {:error, :no_suitable_model}
    end
  end
end
```

## Comparison with Alternatives

| Dimension | Local Inference (Ollama) | Cloud API (Claude/GPT) | Edge Inference | Custom Training |
|-----------|-------------------------|------------------------|----------------|-----------------|
| **Latency** | 1-5s (7B), 3-10s (20B) | 0.5-3s (optimized) | 10-100ms | Varies |
| **Privacy** | Complete data locality | Data sent to provider | On-device | Depends on setup |
| **Cost** | Hardware amortization | Per-token pricing | Device cost | GPU cluster cost |
| **Model quality** | Good (7-20B range) | Best (100B+ params) | Limited (1-3B) | Domain-specific |
| **Scalability** | Limited by hardware | Virtually unlimited | Per-device | Cluster-dependent |
| **Availability** | 99%+ (local hardware) | 99.9% (SLA-backed) | 100% (offline) | Varies |

## Best Practices

1. **Right-Size Model Selection**: Match model size to task complexity. Code completion and classification tasks often perform well with 7B models, while complex reasoning and multi-step planning benefit from larger models. Avoid defaulting to the largest available model when smaller models suffice.

2. **Implement Backpressure**: Never allow inference requests to exceed system capacity. Use bounded queues, rate limiting, and circuit breakers to prevent resource exhaustion. The BEAM's message-passing model naturally supports backpressure through GenServer call timeouts.

3. **Monitor Resource Consumption**: Track GPU/CPU utilization, memory usage, and inference latency as telemetry metrics. Set alerts for memory approaching limits (> 90% of 8GB budget) and latency exceeding thresholds (> 5s for interactive requests).

4. **Implement Graceful Fallback**: Design inference systems with fallback paths. When local inference is overloaded or unavailable, automatically route to cloud providers. When cloud is unreachable, degrade gracefully with cached responses or simplified heuristics.

5. **Cache Strategically**: Cache inference results for deterministic inputs. When the same prompt or similar prompts are processed repeatedly, caching eliminates redundant computation. Use semantic similarity matching for approximate cache hits.

6. **Stream Responses**: For generative models, stream tokens to the client as they are produced rather than waiting for complete generation. This reduces perceived latency and enables early termination when sufficient output is generated.

## Use Cases

- **Agent Decision-Making**: The 434 AIAD agents use inference for task planning, code analysis, quality assessment, and decision-making. Each agent selects an appropriate model based on its specialization and the complexity of the current task.

- **Code Generation and Analysis**: Inference powers code generation for platform evolution, quality fix suggestions, and pattern detection. Models like qwen3-coder and deepseek-coder are optimized for understanding and generating Elixir code.

- **OSINT Analysis**: Natural language processing inference extracts entities, relationships, and sentiment from unstructured OSINT data, feeding structured intelligence into the knowledge graph.

- **Security Classification**: Inference models classify security threats, assess vulnerability severity, and generate risk narratives for Prismatic Perimeter security ratings.

- **Quality Evolution**: The autoevolve system uses inference to identify improvement opportunities, suggest refactoring patterns, and evaluate the impact of proposed changes across the platform's 90 umbrella applications.

## Related Concepts

- [Ollama](@/glossary/ollama.md) - Local AI runtime executing inference for platform models
- [Backpressure](@/glossary/backpressure.md) - Flow control preventing inference request overload
- [Rate Limiting](@/glossary/rate-limiting.md) - Request throttling protecting inference resources
- [Telemetry](@/glossary/telemetry.md) - Metrics system monitoring inference performance
- [Observability](@/glossary/observability.md) - Monitoring infrastructure tracking inference health
- [BEAM](@/glossary/beam.md) - Virtual machine providing concurrent inference request processing
- [GenServer](@/glossary/genserver.md) - OTP behaviour implementing the inference coordinator

## See Also

- [prismatic_ollama](../../../apps/prismatic_ollama/README.md) -- Local AI inference runtime via Ollama
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent system consuming inference for decision-making
- [app_ai_safety](../../../apps/app_ai_safety/README.md) -- Safety monitoring for inference outputs
- [app_ai_interpretability](../../../apps/app_ai_interpretability/README.md) -- Interpretability analysis of inference results
- [prismatic_telemetry](../../../apps/prismatic_telemetry/README.md) -- Telemetry tracking inference performance metrics
- [Architecture](@/architecture/_index.md) -- AI inference architecture and integration patterns
- [Capabilities](@/capabilities/_index.md) -- AI and machine learning capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)