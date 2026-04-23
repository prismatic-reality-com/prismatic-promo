+++
title = "Ollama"
weight = 46
[extra]
category = "ai"
description = "Local AI model runtime enabling on-premise execution of large language models, providing API-compatible inference without external cloud dependencies."
related_terms = ["aiad", "otp", "nabla-infinity", "autoevolve", "beam", "supervisor", "circuit-breaker", "self-healing", "agent", "consciousness-traits", "autoheal", "encryption-at-rest"]
keywords = ["ollama", "local AI", "LLM inference", "on-premise AI", "model serving", "GGUF", "Metal acceleration", "OpenAI API compatible"]
use_cases = ["Local code generation", "Privacy-preserving inference", "Air-gapped deployments", "Development workflow acceleration", "Cost reduction for routine AI tasks"]
technologies = ["GGUF", "GGML", "Metal", "CUDA", "ROCm", "REST API", "NDJSON streaming"]
platforms = ["macOS", "Linux", "Windows", "Docker"]
difficulty = "intermediate"
importance = "high"
domain = "artificial-intelligence"
category_color = "purple"
version = "1.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
authors = ["Tomas Korcak"]
tags = ["ai", "local-inference", "privacy", "model-serving", "elixir-integration"]
prerequisites = ["basic understanding of LLMs", "familiarity with REST APIs", "Elixir/OTP knowledge helpful"]
estimated_reading_time = "12 minutes"
related_apps = ["prismatic_ollama", "prismatic_agents", "prismatic_claude", "prismatic_ai_alignment_core"]
related_architectures = ["hybrid AI inference", "fallback routing", "quality gate pipeline"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1511
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Ollama - Prismatic Platform"
+++

## Definition

Ollama is an open-source tool for running large language models (LLMs) locally on commodity hardware, providing a unified interface for downloading, managing, and serving AI models without requiring cloud API subscriptions or external network connectivity. Created to democratize access to LLM inference, Ollama packages model weights, configuration, and runtime dependencies into a single distributable format, abstracting away the complexity of model quantization, GPU memory management, and inference engine configuration that typically requires deep ML engineering expertise.

The core architecture consists of a model registry (for pulling and storing model files), a serving layer (managing model loading and unloading from memory), and a REST API that implements the OpenAI API specification. This API compatibility is a critical design decision: applications built against the OpenAI API can switch to Ollama by changing only the base URL and authentication token, with no code modifications required for prompt formatting, response parsing, or streaming behavior. This enables organizations to develop against cloud APIs during prototyping and transition to local inference for production deployments where data sovereignty, latency, or cost considerations demand on-premise execution.

Ollama supports quantized model formats (GGUF, GGML) that reduce memory requirements through lower-precision arithmetic, making it practical to run 7B-parameter models on machines with 8GB RAM and 20B-parameter models on machines with 16GB RAM. GPU acceleration via CUDA (NVIDIA), ROCm (AMD), and Metal (Apple Silicon) dramatically improves inference speed, with Metal acceleration on Apple M-series chips achieving particularly strong performance-per-watt ratios that make laptop-based inference viable for development workflows.

## Architecture and Components

Ollama's architecture separates model management from inference serving, with each component handling a distinct responsibility:

| Component | Responsibility | Interface |
|-----------|---------------|-----------|
| **Model Registry** | Download, store, and version model files | `ollama pull`, `ollama list` |
| **Serving Layer** | Load models into memory, manage GPU allocation | `ollama run`, `ollama serve` |
| **REST API** | OpenAI-compatible HTTP inference endpoint | `http://localhost:11434/api` |
| **Modelfile** | Custom model configuration (system prompts, parameters) | Dockerfile-like syntax |
| **Memory Manager** | Model loading/unloading based on available RAM/VRAM | Automatic LRU eviction |

```bash
# Model lifecycle management
ollama pull qwen3-coder           # Download model (~4GB)
ollama list                        # Show installed models
ollama run qwen3-coder "Explain GenServer"  # Interactive inference
ollama serve                       # Start API server on :11434

# Modelfile for custom configuration
cat <<EOF > Modelfile
FROM qwen3-coder
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
SYSTEM "You are an Elixir/OTP expert. Provide production-ready code."
EOF
ollama create prismatic-coder -f Modelfile
```

The Modelfile syntax intentionally mirrors Dockerfile conventions, lowering the barrier to entry for developers already familiar with container-based workflows. Parameters control inference behavior including temperature (randomness), context window size, top-k sampling, repetition penalty, and stop sequences. System prompts embedded in the Modelfile persist across sessions, enabling model specialization without per-request overhead.

## Model Management

Ollama's model registry functions similarly to container registries: models are pulled from a central repository, cached locally, and versioned through tags. Quantization levels (Q4_0, Q4_K_M, Q5_K_M, Q8_0) control the trade-off between model quality and memory consumption.

| Quantization | Bits per Weight | Memory (7B model) | Quality Impact |
|-------------|----------------|-------------------|----------------|
| **Q4_0** | 4.0 | ~3.8GB | Noticeable degradation |
| **Q4_K_M** | 4.5 | ~4.3GB | Minimal degradation |
| **Q5_K_M** | 5.5 | ~5.1GB | Near-original quality |
| **Q8_0** | 8.0 | ~7.2GB | Negligible degradation |
| **FP16** | 16.0 | ~14GB | Original quality |

Model files are stored in `~/.ollama/models/` and can be shared across projects. Ollama automatically manages model loading and unloading based on available system memory, using an LRU (Least Recently Used) eviction strategy when memory pressure requires freeing resources. The memory manager tracks GPU VRAM and system RAM separately, preferring GPU offloading for maximum inference throughput while falling back to CPU computation when VRAM is exhausted.

When multiple models are requested concurrently, Ollama queues requests for models that are not currently loaded, loads them sequentially to avoid memory thrashing, and serves requests in FIFO order. This queuing behavior is transparent to clients, which experience only increased latency rather than errors when a model swap is required.

## API Compatibility Layer

The OpenAI-compatible REST API is Ollama's primary integration interface, accepting the same request format and returning the same response structure as the OpenAI API:

```elixir
defmodule PrismaticOllama.Client do
  @moduledoc """
  HTTP client for Ollama's OpenAI-compatible REST API.
  Provides synchronous and streaming inference with automatic
  retry logic and connection health monitoring.
  """

  @base_url "http://localhost:11434"

  @type chat_message :: %{role: String.t(), content: String.t()}
  @type chat_opts :: [temperature: float(), stream: boolean(), max_tokens: pos_integer()]

  @spec chat_completion(String.t(), [chat_message()], chat_opts()) ::
          {:ok, map()} | {:error, term()}
  def chat_completion(model, messages, opts \\ []) do
    body = %{
      model: model,
      messages: messages,
      temperature: Keyword.get(opts, :temperature, 0.2),
      stream: Keyword.get(opts, :stream, false)
    }

    case HTTPoison.post("#{@base_url}/api/chat", Jason.encode!(body),
      [{"Content-Type", "application/json"}],
      recv_timeout: 30_000
    ) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)}
      {:ok, %{status_code: status}} ->
        {:error, {:http_error, status}}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec list_models() :: {:ok, [map()]} | {:error, term()}
  def list_models do
    case HTTPoison.get("#{@base_url}/api/tags") do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)["models"]}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec generate_embedding(String.t(), String.t()) :: {:ok, [float()]} | {:error, term()}
  def generate_embedding(model, text) do
    body = %{model: model, prompt: text}

    case HTTPoison.post("#{@base_url}/api/embeddings", Jason.encode!(body),
      [{"Content-Type", "application/json"}],
      recv_timeout: 15_000
    ) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)["embedding"]}
      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

The API supports both synchronous and streaming responses. Streaming uses newline-delimited JSON (NDJSON) for token-by-token delivery, enabling responsive UIs that display text as it generates rather than waiting for complete responses.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Text completion (legacy) |
| `/api/chat` | POST | Chat completion (primary) |
| `/api/embeddings` | POST | Vector embeddings generation |
| `/api/tags` | GET | List installed models |
| `/api/show` | POST | Model metadata and parameters |
| `/api/pull` | POST | Download model from registry |
| `/api/delete` | DELETE | Remove a model from local storage |
| `/api/copy` | POST | Duplicate a model under a new name |

## Performance Characteristics

Local inference performance depends on hardware configuration, model size, and quantization level. The following benchmarks represent typical performance on Apple M-series hardware:

| Model | Parameters | Memory | Time to First Token | Tokens/Second | Use Case |
|-------|-----------|--------|---------------------|---------------|----------|
| **qwen3-coder** | 7B | ~4.3GB | <500ms | 35-50 tok/s | Code generation, fast queries |
| **deepseek-coder** | 6.7B | ~4.0GB | <500ms | 40-55 tok/s | Code completion, analysis |
| **gpt-oss:20b** | 20B | ~12GB | <1.5s | 15-25 tok/s | Complex reasoning, planning |

Key performance factors:

- **Metal/CUDA acceleration**: 3-10x speedup over CPU-only inference
- **Context window**: Larger contexts (8K+) increase memory usage and reduce throughput
- **Batch size**: Single-request latency vs multi-request throughput trade-off
- **Quantization**: Q4_K_M provides the best quality-to-performance ratio for most use cases
- **Model warm-up**: First inference after loading incurs additional latency for KV cache initialization
- **Concurrent requests**: Ollama serializes requests to the same model; parallelism requires multiple model instances

## Streaming and Real-Time Inference

For interactive applications and developer tooling, streaming inference provides a significantly better user experience by delivering tokens as they are generated rather than waiting for the complete response:

```elixir
defmodule PrismaticOllama.StreamClient do
  @moduledoc """
  Streaming inference client for Ollama.
  Delivers tokens incrementally via callback function,
  enabling real-time UI updates and progressive rendering.
  """

  @spec stream_chat(String.t(), [map()], (String.t() -> :ok)) ::
          {:ok, String.t()} | {:error, term()}
  def stream_chat(model, messages, callback) do
    body = Jason.encode!(%{model: model, messages: messages, stream: true})
    url = "http://localhost:11434/api/chat"

    {:ok, ref} = :hackney.post(url, [{"Content-Type", "application/json"}], body, [
      {:async, :once},
      {:recv_timeout, 60_000}
    ])

    collect_stream(ref, callback, [])
  end

  defp collect_stream(ref, callback, acc) do
    :hackney.stream_next(ref)

    receive do
      {:hackney_response, ^ref, {:status, 200, _}} ->
        collect_stream(ref, callback, acc)

      {:hackney_response, ^ref, {:headers, _headers}} ->
        collect_stream(ref, callback, acc)

      {:hackney_response, ^ref, chunk} when is_binary(chunk) ->
        case Jason.decode(chunk) do
          {:ok, %{"done" => true}} ->
            {:ok, Enum.join(acc)}

          {:ok, %{"message" => %{"content" => token}}} ->
            callback.(token)
            collect_stream(ref, callback, [token | acc])

          _ ->
            collect_stream(ref, callback, acc)
        end

      {:hackney_response, ^ref, :done} ->
        {:ok, Enum.join(Enum.reverse(acc))}
    after
      60_000 -> {:error, :stream_timeout}
    end
  end
end
```

## Context in Prismatic Platform

The Prismatic Platform integrates Ollama as its local AI inference layer through the Ollama Coordinator [Agent](/glossary/agent/), which manages model selection, health monitoring, quality assessment, and automatic fallback behavior. The integration operates at multiple levels:

**Model Portfolio**: Three models are deployed for different workload profiles -- qwen3-coder (7B) for fast code generation queries under 3 seconds, deepseek-coder (6.7B) for code analysis and completion tasks, and gpt-oss:20b (20B) for complex reasoning tasks requiring deeper analysis at up to 5 seconds per response.

**Automatic Cloud Fallback**: When local inference quality drops below the configured threshold (>85% accuracy target), the platform automatically routes requests to cloud providers (Anthropic Claude). The fallback is transparent to consuming agents -- they receive responses through the same interface regardless of whether inference occurred locally or remotely. When local quality recovers, routing automatically shifts back to Ollama.

**Configuration Integration**: The platform configures Ollama through environment variables that mirror the cloud API interface:

```bash
# Switch Claude Code to use Ollama
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://localhost:11434
claude --model qwen3-coder "Generate REST API endpoint"
```

**Quality Gates**: All Ollama-generated outputs pass through the platform's quality gate infrastructure before being applied to the codebase. The [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework validates LLM outputs against the seven axioms, ensuring that locally generated code and analysis meet the same standards as cloud-generated outputs.

**Health Monitoring**: The Coordinator Agent tracks response latency, error rates, and output quality metrics. If Ollama's health degrades (process crash, memory exhaustion, model corruption), the agent triggers [self-healing](/glossary/self-healing/) procedures including model reloading, process restart, and temporary cloud failover.

## Coordinator Agent Architecture

The Ollama Coordinator Agent is a specialized [AIAD agent](/glossary/aiad/) that manages the full lifecycle of local AI inference within the platform:

```elixir
defmodule PrismaticOllama.Coordinator do
  @moduledoc """
  Ollama Coordinator Agent for the Prismatic Platform.
  Manages model lifecycle, health monitoring, quality assessment,
  and automatic cloud fallback routing for local AI inference.
  """

  use GenServer
  require Logger

  @type inference_route :: :local | :cloud | :hybrid
  @type model_status :: :loaded | :loading | :unloaded | :error

  defstruct [
    :active_model,
    :model_status,
    :inference_route,
    :health_metrics,
    :quality_threshold,
    :fallback_config
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      active_model: Keyword.get(opts, :model, "qwen3-coder"),
      model_status: :unloaded,
      inference_route: :local,
      health_metrics: %{latency_ms: [], error_count: 0, quality_score: 1.0},
      quality_threshold: Keyword.get(opts, :quality_threshold, 0.85),
      fallback_config: Keyword.get(opts, :fallback, %{})
    }

    schedule_health_check()
    {:ok, state}
  end

  @impl true
  def handle_info(:health_check, state) do
    updated_state = perform_health_check(state)

    updated_state =
      if updated_state.health_metrics.quality_score < state.quality_threshold do
        Logger.warning("Ollama quality below threshold, switching to cloud fallback",
          quality: updated_state.health_metrics.quality_score,
          threshold: state.quality_threshold
        )
        %{updated_state | inference_route: :cloud}
      else
        %{updated_state | inference_route: :local}
      end

    schedule_health_check()
    {:noreply, updated_state}
  end

  defp schedule_health_check do
    Process.send_after(self(), :health_check, 30_000)
  end

  defp perform_health_check(state) do
    case PrismaticOllama.Client.list_models() do
      {:ok, models} ->
        %{state | model_status: :loaded, health_metrics: update_metrics(state.health_metrics)}
      {:error, _reason} ->
        %{state | model_status: :error, health_metrics: increment_errors(state.health_metrics)}
    end
  end

  defp update_metrics(metrics), do: %{metrics | error_count: 0}
  defp increment_errors(metrics), do: %{metrics | error_count: metrics.error_count + 1}
end
```

## Operational Targets

| Metric | Target | Current |
|--------|--------|---------|
| Response time (7B) | <3 seconds | <3 seconds |
| Response time (20B) | <5 seconds | <5 seconds |
| Memory usage | <8GB (7B models) | <8GB |
| Uptime | >99% | >99% |
| Accuracy | >85% | >85% |

## Privacy and Data Sovereignty

A primary motivation for local AI inference is data sovereignty -- ensuring that sensitive data never leaves the organization's network boundary. This is particularly important for:

- **Intelligence data**: OSINT findings and security assessments that may contain sensitive organizational information
- **Code analysis**: Proprietary source code that should not be transmitted to third-party APIs
- **Compliance requirements**: Regulatory frameworks (NIS2, ZKB) that restrict data processing locations
- **Air-gapped environments**: Deployment scenarios with no internet connectivity
- **Client confidentiality**: Due diligence and intelligence operations where data leakage would breach professional obligations
- **Model fine-tuning data**: Training data that contains proprietary patterns or domain knowledge

Ollama's local execution model guarantees that all inference data -- prompts, completions, embeddings, and model weights -- remains entirely within the local network. No telemetry, usage data, or model interaction logs are transmitted externally. This guarantee is architectural, not policy-based: there is no configuration option that would enable external data transmission, and the inference engine has no network client code beyond the model registry pull functionality.

## Ollama vs Cloud AI Providers

| Aspect | Ollama (Local) | Cloud Providers |
|--------|---------------|-----------------|
| **Latency** | Lower (no network hop) | Higher (API round-trip) |
| **Cost** | Hardware only (no per-token fees) | Per-token pricing |
| **Privacy** | Complete data sovereignty | Data transmitted to third party |
| **Model Size** | Limited by local hardware | Access to largest models |
| **Quality** | Good for code tasks (7-20B) | Superior for complex reasoning |
| **Availability** | Dependent on local hardware | 99.9%+ SLA |
| **Scaling** | Vertical (single machine) | Horizontal (elastic) |
| **Offline use** | Full functionality | No functionality |
| **Customization** | Modelfile-based customization | Limited to API parameters |
| **Compliance** | Full control over data residency | Depends on provider's DPA |

The platform's hybrid approach leverages both: Ollama handles routine code generation and analysis tasks where 7-20B parameter models perform adequately, while cloud providers handle complex reasoning, planning, and tasks requiring the capabilities of larger frontier models. The [circuit breaker](/glossary/circuit-breaker/) pattern manages the transition between local and cloud inference, preventing cascading failures when either path degrades.

## Best Practices

1. **Choose Quantization Wisely**: For code generation tasks, Q4_K_M provides the best balance of quality and memory usage. For tasks requiring higher fidelity (analysis, reasoning), prefer Q5_K_M or Q8_0 if hardware supports it.

2. **Pre-warm Models**: Load frequently used models at application startup rather than on first request. The first inference after model loading incurs significant latency for KV cache initialization.

3. **Set Memory Limits**: In environments where Ollama shares resources with the BEAM runtime, configure explicit memory limits to prevent model loading from starving application processes.

4. **Use Modelfiles for Specialization**: Create domain-specific Modelfiles with tailored system prompts, temperature settings, and context windows for different workload types rather than configuring these per-request.

5. **Monitor Inference Quality**: Implement automated quality checks on Ollama outputs using the platform's [quality gates](/glossary/quality-gates/) infrastructure. Track quality metrics over time to detect model degradation.

6. **Implement Health Checks**: Regularly verify Ollama's responsiveness and model availability. Use the `/api/tags` endpoint as a lightweight health probe.

7. **Plan for Fallback**: Always have a cloud fallback path configured. Local hardware failures, model corruption, and resource contention can make local inference unavailable without warning.

## Related Terms

- [Agent](/glossary/agent/) - AIAD agents that consume Ollama inference for autonomous operations
- [NABLA Infinity](/glossary/nabla-infinity/) - Epistemic framework validating LLM output quality and correctness
- [Autoevolve](/glossary/autoevolve/) - Platform evolution system using AI-driven code improvements
- [Consciousness Traits](/glossary/consciousness-traits/) - Agent capabilities enhanced through local AI inference
- [Self-Healing](/glossary/self-healing/) - Automatic recovery procedures for Ollama service failures
- [Autoheal](/glossary/autoheal/) - Healing system that may use Ollama for diagnostic analysis
- [Circuit Breaker](/glossary/circuit-breaker/) - Fault tolerance pattern managing Ollama connection failures
- [BEAM](/glossary/beam/) - Virtual machine hosting the Ollama client processes
- [Supervisor](/glossary/supervisor/) - OTP supervision tree managing Ollama coordinator lifecycle
- [Encryption at Rest](/glossary/encryption-at-rest/) - Protection for locally stored model files
- [Quality Gates](/glossary/quality-gates/) - Validation pipeline for AI-generated outputs
- [GenServer](/glossary/genserver/) - Process abstraction implementing the Coordinator Agent

## See Also

- [Architecture](/architecture/) -- Platform AI integration architecture
- [Agents](/agents/) -- Agent catalog consuming Ollama inference
- [Technologies](/technologies/) -- Technology stack including AI infrastructure
- [Capabilities](/capabilities/) -- AI-enhanced platform capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
