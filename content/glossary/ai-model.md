+++
title = "AI Model"
weight = 50

[extra]
description = "A mathematical representation trained on data to make predictions, generate content, classify inputs, or reason about complex problems, forming the computational backbone of modern artificial intelligence systems"
category = "technology"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "artificial-intelligence"
related_concepts = ["llm", "ollama", "fine-tuning", "embedding", "ai-inference", "prompt-engineering"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 6
prerequisites = ["machine-learning", "neural-network"]
learning_path = "ai-engineering"
interactive_demos = ["/labs/glossary/ai-model"]
code_examples = ["PrismaticClaude.complete/2", "PrismaticOllama.generate/3", "PrismaticAgents.invoke/2"]
external_resources = ["Anthropic Claude Documentation", "Ollama Model Library", "Hugging Face Model Hub"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["model-inference-latency", "response-quality-validation", "fallback-chain-verification", "token-budget-enforcement"]
keywords = ["artificial intelligence", "machine learning", "neural network", "language model", "inference", "model serving"]
tags = ["ai", "models", "llm", "machine-learning", "inference", "ollama", "claude"]
related_terms = ["llm", "ollama", "fine-tuning", "embedding", "ai-inference", "prompt-engineering", "neural-network", "machine-learning"]
word_count = 1698
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AI Model - Prismatic Platform"
+++

## Definition

An AI model is a mathematical construct, typically parameterized by millions to trillions of weights, that has been trained on data to perform specific tasks such as prediction, generation, classification, or reasoning. In the context of modern software platforms, AI models serve as the computational engines that transform raw inputs into structured, actionable outputs. Within the Prismatic Platform, AI models operate through both local inference via Ollama and remote API calls to Anthropic's Claude, providing a dual-track architecture for intelligence-driven operations across 530+ autonomous agents.

## Overview

The concept of a trained mathematical model predating modern neural networks stretches back to the earliest days of statistics and operations research. Linear regression models from the 19th century, decision trees from the 1960s, and support vector machines from the 1990s all represent forms of AI models in their broadest sense. However, the contemporary meaning of "AI model" has been profoundly shaped by the deep learning revolution beginning around 2012, when convolutional neural networks demonstrated superhuman performance on image classification tasks.

The landscape shifted dramatically with the introduction of the Transformer architecture in 2017 (Vaswani et al., "Attention Is All You Need"), which enabled the creation of large language models (LLMs) capable of understanding and generating human language with remarkable fluency. Models such as GPT, Claude, LLaMA, Qwen, and DeepSeek represent the current frontier, with parameter counts ranging from 1 billion to over 1 trillion.

AI models can be categorized along several axes:

| Axis | Categories | Examples |
|------|-----------|----------|
| **Architecture** | Transformer, CNN, RNN, GAN, Diffusion | Claude (Transformer), ResNet (CNN) |
| **Modality** | Text, Image, Audio, Multimodal | GPT-4 (multimodal), Whisper (audio) |
| **Training Paradigm** | Supervised, Unsupervised, Reinforcement, Self-supervised | RLHF (reinforcement), BERT (self-supervised) |
| **Size** | Small (<1B), Medium (1-10B), Large (10-100B), Frontier (100B+) | Qwen3 7B (medium), Claude Opus (frontier) |
| **Deployment** | Cloud API, Local inference, Edge, Embedded | Claude API (cloud), Ollama (local) |
| **Task Type** | Generative, Discriminative, Embedding, Reasoning | Claude (generative), BERT (discriminative) |

The significance of AI models in modern software engineering cannot be overstated. They have moved from research curiosities to production infrastructure components that drive core business logic, automate complex decision-making, and enable capabilities that were previously impossible through traditional programming alone.

## Technical Details

### Model Architecture Fundamentals

Modern AI models, particularly large language models, are built on the Transformer architecture. The core mechanism is self-attention, which allows the model to weigh the relevance of different parts of an input sequence when producing each output element.

The fundamental computation in a Transformer layer involves:

1. **Multi-Head Attention**: Parallel attention computations that capture different aspects of token relationships
2. **Feed-Forward Networks**: Position-wise dense layers that transform attention outputs
3. **Layer Normalization**: Stabilization of activations between layers
4. **Residual Connections**: Skip connections that enable training of very deep networks

### Model Serving and Inference

Serving AI models in production involves several critical considerations:

| Concern | Description | Prismatic Approach |
|---------|-------------|-------------------|
| **Latency** | Time from request to first token | <3s local (Ollama), <5s cloud (Claude) |
| **Throughput** | Requests per second capacity | Batched inference, connection pooling |
| **Memory** | GPU/CPU RAM requirements | 7B models <8GB, quantization for efficiency |
| **Cost** | Per-token or per-request pricing | Local models for high-volume, cloud for quality |
| **Reliability** | Uptime and error handling | Circuit breaker + automatic fallback chain |
| **Quality** | Output accuracy and coherence | Model selection based on task complexity |

### Quantization and Optimization

For local deployment, models undergo quantization to reduce memory footprint while preserving quality:

```
Model Size Comparison (Qwen3 7B):
- FP32 (full precision):  ~28 GB
- FP16 (half precision):  ~14 GB
- INT8 (8-bit quantized): ~7 GB
- INT4 (4-bit quantized): ~3.5 GB
```

### Token Economics

AI models process text as tokens (subword units), and understanding token budgets is essential for cost management and context window optimization:

| Model | Context Window | Input Cost | Output Cost |
|-------|---------------|------------|-------------|
| Claude Opus | 200K tokens | $$$ | $$$ |
| Claude Sonnet | 200K tokens | $$ | $$ |
| Qwen3 7B (local) | 32K tokens | Free | Free |
| DeepSeek Coder 6.7B (local) | 16K tokens | Free | Free |

## Implementation in Prismatic Platform

The Prismatic Platform implements a sophisticated dual-track AI model infrastructure that combines local Ollama models for high-volume, low-latency operations with cloud-based Claude API calls for tasks requiring frontier-level reasoning.

### Ollama Local Model Integration

```elixir
defmodule PrismaticOllama.ModelManager do
  @moduledoc """
  Manages local AI model lifecycle including loading, inference, and health monitoring.
  Supports automatic model selection based on task requirements and available resources.
  """

  @spec generate(String.t(), String.t(), keyword()) ::
          {:ok, String.t()} | {:error, term()}
  def generate(model, prompt, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    temperature = Keyword.get(opts, :temperature, 0.7)

    case check_model_availability(model) do
      {:ok, _} ->
        do_generate(model, prompt, temperature, timeout)

      {:error, :not_loaded} ->
        with {:ok, _} <- pull_model(model),
             {:ok, response} <- do_generate(model, prompt, temperature, timeout) do
          {:ok, response}
        end
    end
  end

  @spec list_available_models() :: {:ok, [map()]} | {:error, term()}
  def list_available_models do
    case Ollama.API.list() do
      {:ok, %{models: models}} ->
        {:ok, Enum.map(models, &format_model_info/1)}

      {:error, reason} ->
        {:error, {:ollama_unavailable, reason}}
    end
  end
end
```

### Cloud API Fallback Chain

The platform implements an automatic fallback chain that routes requests to progressively more capable (and expensive) models based on task complexity and local model availability:

```elixir
defmodule PrismaticClaude.FallbackChain do
  @moduledoc """
  Implements automatic model fallback with circuit breaker protection.
  Routes to local models first, falling back to cloud API when needed.
  """

  @fallback_order [
    {:local, "qwen3-coder"},
    {:local, "deepseek-coder"},
    {:cloud, "claude-sonnet"},
    {:cloud, "claude-opus"}
  ]

  @spec complete(String.t(), keyword()) ::
          {:ok, map()} | {:error, :all_models_exhausted}
  def complete(prompt, opts \\ []) do
    Enum.reduce_while(@fallback_order, {:error, :all_models_exhausted}, fn
      {provider, model}, _acc ->
        case invoke_model(provider, model, prompt, opts) do
          {:ok, response} -> {:halt, {:ok, response}}
          {:error, _reason} -> {:cont, {:error, :all_models_exhausted}}
        end
    end)
  end
end
```

### Agent-Model Integration

Each of the 530+ AIAD agents in the platform can specify model preferences based on their operational requirements:

```yaml
# Example agent model configuration
agent:
  name: "code-analyzer"
  model_preferences:
    primary: "qwen3-coder"        # Fast local model for code analysis
    fallback: "claude-sonnet"      # Cloud fallback for complex cases
    max_tokens: 4096
    temperature: 0.3               # Low temperature for deterministic analysis
    timeout_ms: 30000
```

### Performance Metrics

The platform tracks detailed telemetry for all model interactions:

| Metric | Local (Ollama) | Cloud (Claude) |
|--------|---------------|----------------|
| **P50 Latency** | 1.2s | 2.8s |
| **P95 Latency** | 2.8s | 6.5s |
| **P99 Latency** | 4.5s | 12.0s |
| **Availability** | 99.2% | 99.9% |
| **Error Rate** | 0.8% | 0.1% |
| **Memory Usage** | <8GB per model | N/A |

## Comparison with Alternatives

| Approach | Latency | Cost | Privacy | Quality | Offline | Customization |
|----------|---------|------|---------|---------|---------|---------------|
| **Local Ollama (Prismatic)** | Low | Free | Full | Good | Yes | High |
| **Cloud API (Prismatic)** | Medium | Per-token | Limited | Excellent | No | Medium |
| **OpenAI API** | Medium | Per-token | Limited | Excellent | No | Medium |
| **AWS Bedrock** | Medium | Per-token | AWS-scoped | Good | No | Low |
| **Self-hosted vLLM** | Low | Infrastructure | Full | Good | Yes | High |
| **Hugging Face Inference** | Variable | Free/Paid | Shared | Variable | No | High |
| **Google Vertex AI** | Medium | Per-token | GCP-scoped | Good | No | Medium |

The Prismatic approach of combining local and cloud models provides the best balance of latency, cost, privacy, and quality. Local models handle routine operations at zero marginal cost, while frontier cloud models handle complex reasoning tasks that justify their per-token pricing.

## Best Practices

1. **Select models based on task complexity**: Use small local models (7B parameters) for routine tasks like code formatting, classification, and extraction. Reserve frontier models for complex reasoning, creative generation, and multi-step analysis. This optimization reduces costs by 80-90% without sacrificing quality where it matters.

2. **Implement circuit breakers for model calls**: Wrap all model inference calls in circuit breaker patterns that automatically fail open after consecutive failures. This prevents cascading failures when a model endpoint becomes unavailable and enables automatic recovery when service is restored.

3. **Set explicit token budgets per agent**: Define maximum input and output token counts for each agent's model interactions. This prevents runaway costs from overly verbose prompts or responses and ensures predictable resource consumption across the platform.

4. **Version-pin model deployments**: Always specify exact model versions (e.g., `qwen3-coder:7b-q4_K_M`) rather than floating tags. Model updates can introduce behavioral changes that break downstream expectations, and version pinning ensures reproducibility.

5. **Monitor inference quality continuously**: Implement automated quality checks on model outputs using structured evaluation criteria. Track quality metrics over time to detect model degradation, prompt drift, or changes in model behavior after updates.

6. **Use structured output formats**: Request JSON, YAML, or other structured formats from models rather than free-form text. This reduces parsing errors, enables automated validation, and improves downstream processing reliability.

7. **Implement graceful degradation**: Design systems so that model unavailability degrades functionality rather than causing failures. Cached responses, fallback heuristics, and human-in-the-loop escalation ensure continuous operation.

## Common Pitfalls

- **Over-reliance on a single model provider**: Coupling your entire system to one model provider creates a single point of failure and vendor lock-in. The Prismatic dual-track approach (local + cloud) mitigates this risk, but teams should still design for model-agnostic interfaces.

- **Ignoring token context window limits**: Sending prompts that exceed a model's context window results in silent truncation or errors. Always calculate prompt token counts before submission and implement chunking strategies for large inputs.

- **Treating model outputs as ground truth**: AI models generate plausible outputs that may contain factual errors, logical inconsistencies, or hallucinated information. All model outputs in production systems must pass through validation layers before being acted upon.

- **Neglecting prompt engineering as a discipline**: The quality of model outputs is directly proportional to the quality of prompts. Ad-hoc prompting leads to inconsistent results. Invest in prompt templates, few-shot examples, and systematic prompt evaluation.

- **Underestimating local model resource requirements**: Running multiple local models simultaneously can exhaust GPU memory and CPU resources. Profile actual resource consumption under load and implement model scheduling to prevent resource contention.

- **Skipping evaluation before deployment**: Deploying models or prompts without systematic evaluation against a representative test set leads to production surprises. Maintain evaluation datasets and run benchmarks before any model change reaches production.

## Use Cases

### Autonomous Agent Reasoning

The 530+ AIAD agents in the Prismatic Platform use AI models as their core reasoning engine. Each agent receives structured context about its domain, applies model-driven reasoning to analyze situations, and produces actionable outputs. For example, the `code-analyzer` agent uses local Qwen3 models to perform rapid code quality assessment, while the `archer-supreme` orchestrator uses Claude Opus for complex multi-step strategic planning.

### OSINT Intelligence Analysis

The platform's 120 OSINT tools generate raw intelligence data from diverse sources (ARES, Shodan, VirusTotal, etc.). AI models synthesize this raw data into coherent intelligence reports, identify patterns across disparate data sources, and assess confidence levels for analytical conclusions. The model's ability to reason about incomplete or contradictory information makes it essential for the NABLA Infinity epistemic framework.

### Automated Code Generation and Review

AI models power the platform's code generation capabilities, producing Elixir modules, test suites, and documentation that conform to the platform's strict quality standards. The model understands the umbrella architecture, OTP conventions, and the NO MERCY/NO DOUBTS doctrine, generating code that passes all 13 quality domains on first submission.

### Security Rating Computation

In the Prismatic Perimeter EASM module, AI models assist with interpreting security scan results, correlating vulnerability data across assets, and generating human-readable security assessment narratives. The models translate technical findings into A-F security ratings with supporting evidence chains that satisfy NIS2 and ZKB compliance auditors.

## Related Concepts

- [LLM](/glossary/llm/) - Large Language Models are the most prominent category of AI models in modern platforms, specializing in text understanding and generation
- [Ollama](/glossary/ollama/) - Local model serving infrastructure that enables privacy-preserving AI inference without cloud dependencies
- [Fine-Tuning](/glossary/fine-tuning/) - The process of adapting a pre-trained AI model to specific tasks or domains through additional training
- [Embedding](/glossary/embedding/) - Dense vector representations produced by AI models that capture semantic meaning for similarity search and clustering
- [AI Inference](/glossary/ai-inference/) - The runtime execution of a trained AI model to produce predictions or generations from new inputs
- [Prompt Engineering](/glossary/prompt-engineering/) - The discipline of crafting effective inputs to maximize AI model output quality and reliability
- [Neural Network](/glossary/neural-network/) - The underlying computational architecture that powers most modern AI models
- [Machine Learning](/glossary/machine-learning/) - The broader field encompassing the training and application of AI models across diverse problem domains

## See Also

- [Prismatic Claude App](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_claude) - Claude API integration and session management
- [Prismatic Agents App](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_agents) - 530+ autonomous agents powered by AI models
- [AIAD Standard](https://github.com/korczis/prismatic-platform/tree/main/.aiad) - Agent specification framework for model-driven agents
- [Ollama Integration Guide](https://github.com/korczis/prismatic-platform/blob/main/CLAUDE.md#ollama-local-ai-integration) - Local model configuration and optimization

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
