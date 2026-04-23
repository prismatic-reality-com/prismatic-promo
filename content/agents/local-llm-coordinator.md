+++
title = "local-llm-coordinator"
weight = 233
[extra]
domain = "llm"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "seadf", "telemetry", "no-mercy"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["local-llm-coordinator", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Ollama", "Model", "Memory", "Local LLM"]
tags = ["agents", "agent", "local-llm-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "local-llm-coordinator - Prismatic Platform"
+++

## Overview

The Local LLM Coordinator operates as an L3 strategic command agent within the LLM domain of the Prismatic Platform. This agent manages the lifecycle, configuration, and optimization of locally-deployed LLM models running through [Ollama](/glossary/ollama/), providing privacy-preserving, zero-latency AI inference capabilities without external API dependencies. The coordinator handles model selection, memory management, health monitoring, and performance optimization for the platform's local AI infrastructure.

Local LLM deployment addresses three critical requirements: data privacy (sensitive code and intelligence data never leaves the local machine), cost reduction (eliminating per-token API charges for routine operations), and latency (sub-second responses for interactive development workflows). The Local LLM Coordinator ensures that locally-deployed models deliver consistent quality by managing model configurations, monitoring inference quality, and automatically falling back to cloud providers when local models cannot meet quality thresholds for complex tasks.

## Operational Domain

The LLM domain encompasses all large language model operations within the Prismatic Platform. The Local LLM Coordinator specifically manages the local inference tier, working alongside the routing orchestrator (which decides when to use local vs. cloud models) and the unified orchestrator (which executes requests regardless of provider).

## Model Management

The coordinator manages the lifecycle of locally-deployed Ollama models.

| Model | Size | Specialization | Response Time | Memory Usage |
|---|---|---|---|---|
| qwen3-coder (7B) | 4.5 GB | Code generation | < 3s | < 6 GB |
| gpt-oss:20b | 12 GB | General reasoning | < 5s | < 14 GB |
| deepseek-coder (6.7B) | 4.2 GB | Code understanding | < 3s | < 6 GB |

```elixir
defmodule PrismaticAgents.LocalLLMCoordinator do
  @moduledoc """
  Local LLM model lifecycle management and optimization.
  Coordinates Ollama model deployment, health monitoring,
  and performance tuning.
  """

  use GenServer

  @health_check_interval_ms :timer.seconds(30)
  @max_memory_usage_gb 14

  @type model_status :: %{
    name: String.t(),
    loaded: boolean(),
    memory_gb: float(),
    avg_response_ms: non_neg_integer(),
    request_count: non_neg_integer(),
    error_rate: float(),
    last_health_check: DateTime.t()
  }

  @spec get_status() :: {:ok, [model_status()]}
  def get_status do
    GenServer.call(__MODULE__, :status)
  end

  @spec load_model(String.t()) :: {:ok, :loaded} | {:error, term()}
  def load_model(model_name) do
    GenServer.call(__MODULE__, {:load, model_name}, :timer.minutes(5))
  end

  @impl true
  def handle_call({:load, model_name}, _from, state) do
    with {:ok, _} <- check_memory_budget(model_name, state),
         {:ok, _} <- pull_model_if_needed(model_name),
         {:ok, _} <- warm_up_model(model_name) do
      {:reply, {:ok, :loaded}, register_model(state, model_name)}
    else
      {:error, :memory_exceeded} ->
        {:ok, freed} = evict_least_used_model(state)
        handle_call({:load, model_name}, nil, freed)
      error ->
        {:reply, error, state}
    end
  end

  @impl true
  def handle_info(:health_check, state) do
    updated = Enum.map(state.models, fn {name, status} ->
      {name, perform_health_check(name, status)}
    end) |> Map.new()

    schedule_health_check()
    {:noreply, %{state | models: updated}}
  end

  defp schedule_health_check do
    Process.send_after(self(), :health_check, @health_check_interval_ms)
  end
end
```

## Memory Management

The coordinator implements intelligent memory management to maximize model availability within hardware constraints.

| Strategy | Trigger | Action | Impact |
|---|---|---|---|
| Eager loading | Session start | Load primary models | Faster first response |
| Lazy loading | First request for model | Pull and load on demand | Lower idle memory |
| LRU eviction | Memory budget exceeded | Unload least-recently-used model | Frees memory |
| Preemptive eviction | Memory approaching limit | Unload lowest-priority model | Prevents OOM |

## Quality Monitoring

The coordinator continuously monitors inference quality to detect model degradation.

```elixir
defmodule PrismaticAgents.LocalLLMCoordinator.QualityMonitor do
  @min_quality_score 0.70
  @degradation_window 100

  @spec assess_quality(String.t(), String.t(), String.t()) :: {:ok, float()}
  def assess_quality(model, prompt, response) do
    scores = [
      check_response_completeness(response, prompt),
      check_code_validity(response, prompt),
      check_format_compliance(response),
      check_response_relevance(response, prompt)
    ]

    avg_score = Enum.sum(scores) / length(scores)

    if avg_score < @min_quality_score do
      emit_quality_alert(model, avg_score)
    end

    {:ok, avg_score}
  end
end
```

## Ollama Configuration

The coordinator manages Ollama server configuration for optimal performance.

| Parameter | Default | Optimized | Purpose |
|---|---|---|---|
| OLLAMA_NUM_PARALLEL | 1 | 4 | Concurrent request handling |
| OLLAMA_MAX_LOADED_MODELS | 1 | 3 | Models kept in memory |
| OLLAMA_KEEP_ALIVE | 5m | 30m | Model memory persistence |
| GPU_LAYERS | auto | model-specific | GPU offloading depth |

## Key Capabilities

- **Model lifecycle management** handling model download, loading, memory management, and eviction across the Ollama model library
- **Health monitoring** performing continuous health checks on loaded models with latency, error rate, and memory usage tracking
- **Memory optimization** implementing LRU eviction, preemptive unloading, and memory budgeting to maximize model availability within hardware constraints
- **Quality assurance** monitoring inference quality and triggering cloud fallback when local models produce substandard results
- **Configuration optimization** tuning Ollama server parameters for the specific hardware profile and workload characteristics
- **Performance tracking** maintaining detailed per-model performance metrics including response time distributions, token throughput, and error categorization

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination for local LLM operations. The coordinator manages all Ollama model operations and reports health status to the routing orchestrator.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [ollama-coordinator](/agents/ollama-coordinator/) | Infrastructure Partner | Manages Ollama server process and system-level configuration |
| [llm-routing-orchestrator-agent](/agents/llm-routing-orchestrator-agent/) | Routing Authority | Reports local model availability for routing decisions |
| [llm-model-selector](/agents/llm-model-selector/) | Model Selection | Assists with model selection for specific task types |
| [cost-optimization-specialist](/agents/cost-optimization-specialist/) | Cost Tracking | Reports local inference as cost-free alternative to cloud |

## Integration

| Component | Relationship |
|---|---|
| [Ollama](/glossary/ollama/) | Primary local inference runtime |
| [Circuit Breaker](/glossary/circuit-breaker/) | Health management for local model availability |
| Platform [Telemetry](/glossary/telemetry/) | Model performance metrics and health status |
| [SEADF](/glossary/seadf/) | Evolutionary optimization of model configurations |

## Enforcement

The Local LLM Coordinator operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. All model health checks must pass before models are marked as available for routing. Quality monitoring triggers automatic cloud fallback when local model quality degrades below thresholds. Memory management prevents out-of-memory conditions through proactive eviction. Model configurations are version-controlled and reproducible. Performance metrics are continuously collected and analyzed for optimization opportunities.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)