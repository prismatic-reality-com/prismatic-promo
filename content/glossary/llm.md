+++
title = "LLM"
weight = 50
[extra]
description = "Large Language Model -- a neural network trained on vast text corpora capable of generating, analyzing, and reasoning about text, powering 530+ AIAD agents through Claude API and Ollama local inference"
category = "ai"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "Artificial Intelligence"
related_concepts = ["transformer architecture", "natural language processing", "generative AI", "token prediction", "foundation models"]
implementation_status = "production"
authority_level = "standard"
difficulty_rating = 8
prerequisites = ["ai-model", "ai-inference", "neural-network", "embedding"]
learning_path = ["neural-network", "embedding", "ai-model", "llm", "prompt-engineering"]
interactive_demos = ["/labs/glossary/llm"]
code_examples = ["Elixir HTTP Client", "Ollama Integration", "Agent Dispatch"]
external_resources = ["https://arxiv.org/abs/1706.03762", "https://ollama.com/", "https://docs.anthropic.com/"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["model response validation", "token budget enforcement", "fallback chain verification", "rate limit handling", "response quality assessment", "latency budget compliance"]
keywords = ["LLM", "large language model", "transformer", "GPT", "Claude", "Ollama", "natural language processing", "text generation", "reasoning", "inference", "foundation model"]
tags = ["glossary", "ai", "llm", "machine-learning", "inference", "agents", "claude", "ollama"]
related_terms = ["ai-model", "ai-inference", "ollama", "claude-ai", "prompt-engineering", "fine-tuning", "neural-network", "embedding", "rag", "agent", "agent-registry", "agent-tier", "aiad", "knowledge-graph", "ontology", "elixir"]
word_count = 1916
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "LLM - Prismatic Platform"
+++

## Definition

A Large Language Model (LLM) is a [neural network](@/glossary/neural-network.md) -- typically based on the transformer architecture -- trained on massive text corpora (hundreds of billions to trillions of tokens) that develops the ability to generate coherent text, analyze complex documents, reason through multi-step problems, write code, and follow nuanced instructions. LLMs operate by predicting the next token in a sequence, but this simple mechanism gives rise to emergent capabilities including in-context learning, chain-of-thought reasoning, and tool use.

In the Prismatic Platform, LLMs are the cognitive engine powering 530+ [AIAD](@/glossary/aiad.md) agents. The platform integrates with two inference backends: the [Claude AI](@/glossary/claude-ai.md) API (Anthropic's frontier models) for high-capability tasks requiring advanced reasoning, and [Ollama](@/glossary/ollama.md) for local inference with open-weight models (qwen3-coder 7B, gpt-oss 20B, deepseek-coder 6.7B) that provide sub-3-second response times without network dependency. This dual-track architecture ensures that the platform can operate with full AI capabilities both online (cloud API) and offline (local inference), with automatic fallback from local to cloud when task complexity exceeds local model capacity.

## Overview

The transformer architecture, introduced in the 2017 paper "Attention Is All You Need," revolutionized natural language processing by replacing recurrent computation with self-attention mechanisms. Self-attention allows the model to consider relationships between all positions in an input sequence simultaneously, rather than processing tokens one at a time. This parallelism enables training on massive datasets using GPU clusters, which in turn produces models with emergent capabilities that scale with model size and training data.

Modern LLMs operate at scales that would have been considered impractical a decade ago. Models range from 7 billion parameters (suitable for local inference on consumer hardware) to over 100 billion parameters (requiring distributed GPU clusters). The relationship between scale and capability follows approximate scaling laws: doubling the model size and training data produces predictable improvements in benchmark performance, though the specific capabilities that emerge at each scale are not always predictable.

The key capabilities relevant to the Prismatic Platform include:

- **Code Generation**: LLMs can generate [Elixir](@/glossary/elixir.md) code with correct syntax, idiomatic patterns, proper `@spec` annotations, and OTP-compliant designs. The platform uses this capability for agent code generation, automated refactoring, and quality improvement suggestions.
- **Reasoning**: Multi-step logical reasoning enables agents to analyze complex situations, evaluate evidence chains, and make decisions within the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework.
- **Analysis**: LLMs can process and summarize large codebases, identify patterns, detect anomalies, and extract structured information from unstructured text -- essential for OSINT operations and security analysis.
- **Instruction Following**: The ability to follow detailed instructions enables precise agent behavior specification through the AIAD standard's prompt engineering layer.
- **Tool Use**: Modern LLMs can decide when and how to use external tools (APIs, databases, code execution environments), enabling agents to interact with the platform's infrastructure.

The platform's dual-track inference architecture (cloud + local) reflects a pragmatic engineering decision. Cloud inference provides frontier model capabilities but introduces network [latency](@/glossary/latency.md), cost per token, and internet dependency. Local inference via [Ollama](@/glossary/ollama.md) provides privacy, zero network latency, and predictable costs but with reduced model capability. The automatic fallback mechanism ensures that agents always have access to LLM capabilities regardless of network conditions.

## Technical Details

### Transformer Architecture

The transformer architecture consists of stacked layers, each containing a multi-head self-attention mechanism and a feed-forward network. For a sequence of N tokens:

1. **Tokenization**: Input text is split into tokens (subword units) using a trained tokenizer (BPE, SentencePiece, or similar). Each token maps to an integer ID.
2. **[Embedding](@/glossary/embedding.md)**: Token IDs are mapped to dense vectors (embeddings) that encode semantic meaning in high-dimensional space.
3. **Positional Encoding**: Position information is added to embeddings so the model knows token order (transformers process all positions in parallel).
4. **Self-Attention**: Each token attends to all other tokens, computing weighted combinations that capture contextual relationships. Multi-head attention runs multiple attention computations in parallel, capturing different types of relationships.
5. **Feed-Forward**: Position-wise feed-forward networks process each token independently after attention aggregation.
6. **Layer Stacking**: Steps 4-5 repeat across many layers (32-128+ in modern models), progressively building more abstract representations.
7. **Output Projection**: Final hidden states are projected to vocabulary logits, producing probability distributions over the next token.

### Inference Parameters

LLM behavior is controlled by inference parameters:

| Parameter | Effect | Typical Range | Platform Default |
|-----------|--------|--------------|-----------------|
| **Temperature** | Randomness in token selection | 0.0-2.0 | 0.7 (generation), 0.0 (analysis) |
| **Top-p** | Nucleus sampling threshold | 0.0-1.0 | 0.95 |
| **Top-k** | Consider only top-k tokens | 1-100 | 40 |
| **Max Tokens** | Output length limit | 1-100,000+ | Task-dependent |
| **Stop Sequences** | Tokens that halt generation | Varies | Task-dependent |
| **System Prompt** | Behavioral instructions | Text | AIAD agent spec |

### Token Economics

LLM costs scale with token count (input + output). The platform manages token budgets:

- **Input Tokens**: Context window consumed by system prompt, agent spec, and user input.
- **Output Tokens**: Generated response text, typically more expensive than input.
- **Context Window**: Maximum total tokens (input + output) per request. Claude models support 200K+ tokens.
- **Budget Enforcement**: Each agent has a per-request token budget. Exceeding it triggers automatic summarization or task decomposition.

### Model Selection Criteria

The platform selects models based on task requirements:

| Task Category | Primary Model | Fallback Model | Rationale |
|--------------|--------------|----------------|-----------|
| **Strategic Analysis** | Claude Opus 4.6 | -- | Maximum reasoning capability required |
| **Code Generation** | Claude Opus 4.6 | qwen3-coder (7B) | Strong code + reasoning needed |
| **Quick Analysis** | qwen3-coder (7B) | Claude Haiku | Speed-optimized, local inference |
| **OSINT Processing** | gpt-oss (20B) | Claude Sonnet | Balance of capability and throughput |
| **Code Review** | deepseek-coder (6.7B) | Claude Sonnet | Code-specialized model |

## Implementation in Prismatic Platform

### LLM Client Abstraction

The platform abstracts LLM interaction behind a behavior that supports both cloud and local backends:

```elixir
defmodule PrismaticAgents.LLM.Client do
  @moduledoc """
  Unified LLM client abstraction supporting Claude API and
  Ollama local inference with automatic fallback, token budget
  enforcement, and telemetry integration.
  """

  @type model :: String.t()
  @type message :: %{role: :system | :user | :assistant, content: String.t()}
  @type response :: %{
    content: String.t(),
    model: model(),
    input_tokens: non_neg_integer(),
    output_tokens: non_neg_integer(),
    latency_ms: non_neg_integer()
  }
  @type opts :: [
    temperature: float(),
    max_tokens: pos_integer(),
    top_p: float(),
    stop_sequences: [String.t()]
  ]

  @callback complete([message()], opts()) :: {:ok, response()} | {:error, term()}
  @callback stream([message()], opts()) :: {:ok, Enumerable.t()} | {:error, term()}
  @callback models() :: {:ok, [model()]} | {:error, term()}

  @spec complete(module(), [message()], opts()) :: {:ok, response()} | {:error, term()}
  def complete(backend, messages, opts \\ []) do
    start_time = System.monotonic_time(:millisecond)

    result = backend.complete(messages, opts)

    latency_ms = System.monotonic_time(:millisecond) - start_time

    :telemetry.execute(
      [:prismatic_agents, :llm, :complete],
      %{latency_ms: latency_ms, tokens: token_count(result)},
      %{backend: backend, model: opts[:model]}
    )

    result
  end

  @spec token_count({:ok, response()} | {:error, term()}) :: non_neg_integer()
  defp token_count({:ok, %{input_tokens: input, output_tokens: output}}), do: input + output
  defp token_count(_), do: 0
end
```

### Ollama Local Inference Integration

The [Ollama](@/glossary/ollama.md) integration provides local LLM inference with automatic model management:

```elixir
defmodule PrismaticAgents.LLM.Ollama do
  @moduledoc """
  Ollama backend for local LLM inference. Supports qwen3-coder,
  gpt-oss, and deepseek-coder models with automatic fallback to
  cloud API when local capacity is insufficient.
  """

  @behaviour PrismaticAgents.LLM.Client

  @ollama_base_url "http://localhost:11434"
  @default_model "qwen3-coder"
  @timeout_ms 30_000

  @type ollama_response :: %{
    model: String.t(),
    response: String.t(),
    total_duration: non_neg_integer(),
    prompt_eval_count: non_neg_integer(),
    eval_count: non_neg_integer()
  }

  @impl PrismaticAgents.LLM.Client
  @spec complete([PrismaticAgents.LLM.Client.message()], keyword()) ::
          {:ok, PrismaticAgents.LLM.Client.response()} | {:error, term()}
  def complete(messages, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)
    temperature = Keyword.get(opts, :temperature, 0.7)

    body = %{
      model: model,
      messages: format_messages(messages),
      stream: false,
      options: %{temperature: temperature}
    }

    case post("/api/chat", body) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, parse_response(response_body, model)}

      {:ok, %{status: status}} ->
        {:error, {:ollama_error, status}}

      {:error, reason} ->
        handle_fallback(messages, opts, reason)
    end
  end

  @impl PrismaticAgents.LLM.Client
  @spec models() :: {:ok, [String.t()]} | {:error, term()}
  def models do
    case get("/api/tags") do
      {:ok, %{status: 200, body: %{"models" => models}}} ->
        {:ok, Enum.map(models, & &1["name"])}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl PrismaticAgents.LLM.Client
  @spec stream([PrismaticAgents.LLM.Client.message()], keyword()) ::
          {:ok, Enumerable.t()} | {:error, term()}
  def stream(messages, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)

    body = %{
      model: model,
      messages: format_messages(messages),
      stream: true
    }

    case post_stream("/api/chat", body) do
      {:ok, stream} -> {:ok, stream}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec format_messages([PrismaticAgents.LLM.Client.message()]) :: [map()]
  defp format_messages(messages) do
    Enum.map(messages, fn %{role: role, content: content} ->
      %{"role" => to_string(role), "content" => content}
    end)
  end

  @spec parse_response(map(), String.t()) :: PrismaticAgents.LLM.Client.response()
  defp parse_response(body, model) do
    %{
      content: get_in(body, ["message", "content"]),
      model: model,
      input_tokens: body["prompt_eval_count"] || 0,
      output_tokens: body["eval_count"] || 0,
      latency_ms: div(body["total_duration"] || 0, 1_000_000)
    }
  end

  @spec handle_fallback([PrismaticAgents.LLM.Client.message()], keyword(), term()) ::
          {:ok, PrismaticAgents.LLM.Client.response()} | {:error, term()}
  defp handle_fallback(messages, opts, _local_error) do
    :telemetry.execute(
      [:prismatic_agents, :llm, :fallback],
      %{count: 1},
      %{from: :ollama, to: :claude}
    )

    PrismaticAgents.LLM.Claude.complete(messages, opts)
  end

  @spec post(String.t(), map()) :: {:ok, map()} | {:error, term()}
  defp post(path, body) do
    Req.post(@ollama_base_url <> path,
      json: body,
      receive_timeout: @timeout_ms
    )
  end

  @spec post_stream(String.t(), map()) :: {:ok, Enumerable.t()} | {:error, term()}
  defp post_stream(path, body) do
    Req.post(@ollama_base_url <> path,
      json: body,
      into: :stream,
      receive_timeout: @timeout_ms
    )
  end

  @spec get(String.t()) :: {:ok, map()} | {:error, term()}
  defp get(path) do
    Req.get(@ollama_base_url <> path, receive_timeout: @timeout_ms)
  end
end
```

### Agent-LLM Integration

Each [AIAD](@/glossary/aiad.md) agent specifies its LLM requirements in the agent specification, and the runtime dispatches to the appropriate backend:

```elixir
defmodule PrismaticAgents.Runtime.LLMDispatcher do
  @moduledoc """
  Dispatches LLM requests from agents to the appropriate
  backend based on agent tier, task complexity, and
  backend availability. Enforces token budgets and
  quality thresholds.
  """

  alias PrismaticAgents.LLM.{Client, Claude, Ollama}
  alias PrismaticAgents.Registry

  @type dispatch_result :: {:ok, Client.response()} | {:error, term()}

  @tier_model_mapping %{
    l5: {Claude, "claude-opus-4-6"},
    l4: {Claude, "claude-opus-4-6"},
    l3: {Claude, "claude-sonnet-4-20250514"},
    l2: {Ollama, "qwen3-coder"},
    l1: {Ollama, "qwen3-coder"}
  }

  @spec dispatch(String.t(), [Client.message()], keyword()) :: dispatch_result()
  def dispatch(agent_id, messages, opts \\ []) do
    with {:ok, tier} <- Registry.get_tier(agent_id),
         {:ok, token_budget} <- Registry.get_token_budget(agent_id),
         {backend, model} <- select_backend(tier, opts),
         :ok <- validate_budget(messages, token_budget) do
      Client.complete(backend, messages, Keyword.put(opts, :model, model))
    end
  end

  @spec select_backend(atom(), keyword()) :: {module(), String.t()}
  defp select_backend(tier, opts) do
    case Keyword.get(opts, :force_backend) do
      nil -> Map.get(@tier_model_mapping, tier, {Ollama, "qwen3-coder"})
      :cloud -> {Claude, "claude-opus-4-6"}
      :local -> {Ollama, "qwen3-coder"}
    end
  end

  @spec validate_budget([Client.message()], pos_integer()) :: :ok | {:error, :budget_exceeded}
  defp validate_budget(messages, budget) do
    estimated_tokens = estimate_tokens(messages)

    if estimated_tokens <= budget do
      :ok
    else
      {:error, :budget_exceeded}
    end
  end

  @spec estimate_tokens([Client.message()]) :: non_neg_integer()
  defp estimate_tokens(messages) do
    messages
    |> Enum.map(fn %{content: content} -> div(String.length(content), 4) end)
    |> Enum.sum()
  end
end
```

## Comparison with Alternatives

### LLM vs. Traditional NLP

| Aspect | Large Language Models | Traditional NLP |
|--------|---------------------|----------------|
| **Training** | Self-supervised on raw text | Supervised on labeled datasets |
| **Generalization** | Zero/few-shot learning | Requires task-specific training |
| **Capability** | Multi-task, emergent abilities | Single-task, engineered features |
| **Resource Cost** | High (GPU inference) | Low (CPU sufficient) |
| **Interpretability** | Low (black box) | Higher (feature engineering visible) |
| **Accuracy** | State-of-art on most benchmarks | Competitive on narrow tasks |

### Cloud LLM vs. Local LLM (Ollama)

| Aspect | Cloud (Claude API) | Local (Ollama) |
|--------|-------------------|----------------|
| **Capability** | Frontier model performance | 7B-20B model performance |
| **Latency** | 500ms-5s (network + inference) | < 3s (inference only) |
| **Privacy** | Data leaves premises | Fully local, zero data exfiltration |
| **Cost** | Per-token pricing | Hardware cost only (amortized) |
| **Availability** | Internet required | Always available |
| **Context Window** | 200K+ tokens | 8K-32K tokens |
| **Reasoning** | Advanced multi-step | Basic to intermediate |

### LLM vs. Rule-Based Systems

LLMs excel at handling ambiguity, novel inputs, and tasks where the rules are too complex to enumerate. [Rule-based systems](@/glossary/rule-based-reasoning.md) excel at deterministic, verifiable decisions where correctness is more important than flexibility. The Prismatic Platform uses both: LLMs for agent reasoning and analysis, rule-based systems for [quality gates](@/glossary/quality-gate.md), authority validation, and compliance checks.

## Best Practices

1. **Structured Prompts**: Use system prompts that precisely define agent behavior, output format, and constraints. The AIAD agent specification serves as the system prompt template.

2. **Temperature Control**: Use temperature 0.0 for deterministic tasks (analysis, extraction, validation) and 0.5-0.7 for creative tasks (code generation, strategy proposals).

3. **Token Budget Enforcement**: Set explicit token budgets per agent and per request. Monitor actual usage against budgets. Unbounded token consumption is a cost and latency risk.

4. **Fallback Chains**: Always configure fallback from local to cloud and from expensive to cheaper models. A degraded response is better than no response.

5. **Response Validation**: Never trust LLM output without validation. Parse structured outputs, type-check code generation, and verify factual claims against platform data.

6. **[Prompt Engineering](@/glossary/prompt-engineering.md) Versioning**: Treat prompts as code. Version them, test them, and review them. A prompt change can alter agent behavior as dramatically as a code change.

7. **Caching Identical Requests**: If multiple agents issue the same query, cache the response. LLM inference is expensive and deterministic at temperature 0.0.

## Common Pitfalls

1. **Hallucination Trust**: LLMs can generate plausible but factually incorrect text. Every LLM output used for platform decisions must be validated through the [Trinity Gate](@/glossary/trinity-gate.md) or verified against ground truth.

2. **Context Window Overflow**: Exceeding the model's context window silently truncates input, losing critical information. The platform estimates token counts before submission and truncates intelligently (summarizing older context).

3. **Prompt Injection**: Untrusted user input included in prompts can manipulate LLM behavior. The platform sanitizes all user input before inclusion in agent prompts and uses structural separation between system instructions and user data.

4. **Cost Explosion**: Cloud LLM costs scale linearly with token count. A misconfigured agent that generates verbose prompts or requests unnecessary completions can consume the entire monthly budget in hours.

5. **Latency Variability**: Cloud LLM [latency](@/glossary/latency.md) varies widely (500ms to 30s) depending on model load, request complexity, and output length. Design for worst-case latency with timeouts and async patterns.

6. **Model Monoculture**: Depending on a single model provider creates a single point of failure. The platform's dual-track architecture (Claude + Ollama) mitigates this, but teams should also test agent behavior across different models.

## Use Cases

### Agent-Powered Code Generation

When the platform's autoevolve system identifies an improvement opportunity, an L3 Strategic Commander decomposes the task and assigns code generation to L2 agents. These agents use Claude or qwen3-coder to generate [Elixir](@/glossary/elixir.md) code complete with `@spec` annotations, `@moduledoc` documentation, and property-based tests. The generated code passes through quality gates before integration.

### OSINT Intelligence Analysis

The platform's 120 OSINT tools collect raw data from Czech business registries, global threat intelligence feeds, and sanctions databases. LLMs analyze this raw data to extract entities, identify relationships, assess risk levels, and generate structured intelligence reports. The analysis follows [NABLA Infinity](@/glossary/nabla-infinity.md) axioms, maintaining signal plurality and contradiction preservation.

### Natural Language Query Interface

Users can query platform state using natural language through the API and LiveView interfaces. LLMs translate natural language queries into structured platform API calls, execute them, and format the results as human-readable responses. This enables non-technical users to access platform capabilities without learning the API.

### Security Assessment Reasoning

The Perimeter EASM system uses LLMs to reason about security findings, correlate vulnerabilities across assets, and generate security rating justifications. The reasoning chain is preserved as evidence for the [formal verification](@/glossary/formal-verification.md) system, ensuring that security ratings are traceable and defensible.

### Automated Documentation

LLMs generate and maintain documentation for the platform's 115 umbrella applications, including CLAUDE.md files, API documentation, and [knowledge graph](@/glossary/knowledge-graph.md) entries. The generation process uses the existing codebase as ground truth, reducing hallucination risk.

## Related Concepts

- [AI Model](@/glossary/ai-model.md) -- The broader category of machine learning models that includes LLMs
- [AI Inference](@/glossary/ai-inference.md) -- The process of running input through a trained LLM to produce output
- [Ollama](@/glossary/ollama.md) -- Local LLM inference server providing the platform's offline AI capability
- [Claude AI](@/glossary/claude-ai.md) -- Anthropic's frontier LLM powering the platform's high-capability agents
- [Prompt Engineering](@/glossary/prompt-engineering.md) -- The practice of crafting effective instructions for LLMs
- [Fine-Tuning](@/glossary/fine-tuning.md) -- Adapting a pre-trained LLM to specific tasks through additional training
- [Neural Network](@/glossary/neural-network.md) -- The computational architecture underlying LLMs
- [Embedding](@/glossary/embedding.md) -- Dense vector representations used internally by LLMs and for semantic search
- [RAG](@/glossary/rag.md) -- Retrieval-Augmented Generation, combining LLMs with knowledge retrieval
- [Agent](@/glossary/agent.md) -- Autonomous entities powered by LLM reasoning in the platform
- [AIAD](@/glossary/aiad.md) -- The standard defining how agents interface with LLMs
- [Agent Registry](@/glossary/agent-registry.md) -- Registry managing 530+ LLM-powered agents
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- Structured knowledge that grounds LLM reasoning
- [Ontology](@/glossary/ontology.md) -- Formal domain models that constrain LLM output to valid concepts

## See Also

- [Agent Tier](@/glossary/agent-tier.md) -- Authority levels that determine LLM model selection per agent
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification system that validates LLM-generated claims
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework constraining how LLM outputs are treated as evidence
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical verification complementing LLM probabilistic reasoning
- [Elixir](@/glossary/elixir.md) -- The platform's primary language, both generated by and orchestrating LLMs

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
