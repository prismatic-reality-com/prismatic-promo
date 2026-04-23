+++
title = "Temperature"
weight = 50
[extra]
description = "LLM sampling parameter controlling output randomness - lower values produce deterministic responses, higher values increase creativity and variation"
category = "ai"
related_terms = ["llm", "system-prompt", "token", "agent", "inference", "top-p"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["temperature", "LLM", "sampling", "randomness", "AI", "glossary", "Prismatic Platform"]
tags = ["glossary", "ai", "parameters"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Temperature - Prismatic Platform"
+++

## Definition & Overview

Temperature is a sampling parameter that controls the randomness of a language model's output. It scales the logits (raw output scores) before the softmax function converts them into token probabilities. A temperature of 0 makes the model deterministic, always selecting the highest-probability token. A temperature of 1.0 uses the model's natural probability distribution. Values above 1.0 flatten the distribution, increasing the chance of selecting lower-probability tokens, producing more creative and diverse but potentially less coherent output.

The temperature parameter derives its name from the Boltzmann distribution in statistical mechanics, where temperature controls the probability of a system occupying different energy states. At low temperatures, a physical system settles into its lowest energy state (most probable configuration). At high temperatures, higher-energy states become accessible (less probable configurations become possible). The analogy translates directly to language model sampling.

In the Prismatic Platform, temperature is a configurable parameter for AIAD agent interactions with language models. Different agent types require different temperature settings. Code generation agents use low temperature (0.0-0.2) for deterministic, reproducible output. Creative analysis agents (Red Team scenario generation, threat modeling) use moderate temperature (0.5-0.7) for diverse hypothesis generation. The Ollama local AI integration supports temperature configuration per model and per request, enabling fine-grained control over agent behavior.

## Technical Deep Dive

### Temperature in the Sampling Pipeline

The temperature parameter modifies the softmax probability distribution:

```elixir
defmodule PrismaticAI.Sampling do
  @moduledoc """
  Token sampling with temperature control.
  Demonstrates how temperature affects output distribution.
  """

  @spec apply_temperature([float()], float()) :: [float()]
  def apply_temperature(logits, temperature) when temperature > 0 do
    # Scale logits by inverse temperature
    scaled = Enum.map(logits, &(&1 / temperature))
    softmax(scaled)
  end

  def apply_temperature(logits, 0.0) do
    # Temperature 0: greedy decoding (argmax)
    max_idx = logits |> Enum.with_index() |> Enum.max_by(&elem(&1, 0)) |> elem(1)
    Enum.map(Enum.with_index(logits), fn {_, i} ->
      if i == max_idx, do: 1.0, else: 0.0
    end)
  end

  defp softmax(values) do
    max_val = Enum.max(values)
    exps = Enum.map(values, &:math.exp(&1 - max_val))
    sum = Enum.sum(exps)
    Enum.map(exps, &(&1 / sum))
  end

  @doc """
  Example: Given logits [2.0, 1.0, 0.5] for tokens ["the", "a", "an"]

  Temperature 0.1 (near-deterministic):
    Probabilities: [0.99, 0.007, 0.003]  -> Almost always picks "the"

  Temperature 1.0 (natural):
    Probabilities: [0.59, 0.22, 0.13]   -> Usually picks "the", sometimes "a"

  Temperature 2.0 (creative):
    Probabilities: [0.42, 0.31, 0.27]   -> Much more uniform, any token possible
  """
  @spec demonstrate_temperature([float()]) :: map()
  def demonstrate_temperature(logits) do
    %{
      greedy: apply_temperature(logits, 0.001),
      low: apply_temperature(logits, 0.3),
      normal: apply_temperature(logits, 1.0),
      high: apply_temperature(logits, 2.0)
    }
  end
end
```

### Agent-Specific Temperature Configuration

The platform configures temperature based on agent type and task:

```elixir
defmodule PrismaticAgents.TemperatureConfig do
  @moduledoc """
  Temperature configuration for different agent types and tasks.
  Maps agent domains to appropriate temperature ranges.
  """

  @type task_type :: :code_generation | :analysis | :creative | :security | :orchestration

  @configs %{
    code_generation: %{
      temperature: 0.0,
      description: "Deterministic code output, reproducible results"
    },
    security_analysis: %{
      temperature: 0.1,
      description: "Precise security findings with minimal hallucination"
    },
    osint_analysis: %{
      temperature: 0.2,
      description: "Accurate intelligence with slight exploration"
    },
    orchestration: %{
      temperature: 0.3,
      description: "Reliable task routing with adaptive problem-solving"
    },
    threat_modeling: %{
      temperature: 0.6,
      description: "Creative scenario generation for Red Team"
    },
    brainstorming: %{
      temperature: 0.8,
      description: "Diverse hypothesis generation"
    }
  }

  @spec for_task(task_type()) :: float()
  def for_task(task_type) do
    case Map.get(@configs, task_type) do
      %{temperature: t} -> t
      nil -> 0.3  # Conservative default
    end
  end

  @spec for_agent(String.t()) :: float()
  def for_agent(agent_id) do
    agent = PrismaticAgents.Registry.get_agent(agent_id)
    domain_to_temperature(agent.primary_domain)
  end

  defp domain_to_temperature(:security), do: 0.1
  defp domain_to_temperature(:osint), do: 0.2
  defp domain_to_temperature(:quality), do: 0.0
  defp domain_to_temperature(:code), do: 0.0
  defp domain_to_temperature(:red_team), do: 0.6
  defp domain_to_temperature(_), do: 0.3
end
```

### Ollama Integration with Temperature

The platform passes temperature to the Ollama local AI backend:

```elixir
defmodule PrismaticAI.OllamaClient do
  @moduledoc """
  Ollama API client with temperature configuration.
  """

  @spec generate(String.t(), String.t(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def generate(model, prompt, opts \\ []) do
    temperature = Keyword.get(opts, :temperature, 0.3)
    system_prompt = Keyword.get(opts, :system, "")

    body = Jason.encode!(%{
      model: model,
      prompt: prompt,
      system: system_prompt,
      options: %{
        temperature: temperature,
        num_predict: Keyword.get(opts, :max_tokens, 2048),
        top_p: Keyword.get(opts, :top_p, 0.9)
      },
      stream: false
    })

    case PrismaticHttp.SecureClient.post(
      "#{base_url()}/api/generate",
      body,
      headers: [{"Content-Type", "application/json"}]
    ) do
      {:ok, %{status: 200, body: resp}} ->
        {:ok, Jason.decode!(resp)["response"]}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp base_url, do: Application.get_env(:prismatic_ai, :ollama_url, "http://localhost:11434")
end
```

## Architecture & Implementation

Temperature is one of several sampling parameters that affect LLM output. Top-p (nucleus sampling) provides an alternative control by limiting token selection to the smallest set of tokens whose cumulative probability exceeds a threshold. The platform typically uses temperature as the primary control and top-p as a safety cap.

The platform's temperature defaults follow the principle of least surprise: agents produce deterministic output by default (low temperature), with higher temperatures explicitly configured for tasks that benefit from diversity. This aligns with the NO MERCY doctrine's preference for reproducible, verifiable results.

Temperature interacts with system prompts and few-shot examples. A well-crafted system prompt constrains the model's output space regardless of temperature. At low temperatures, the system prompt and few-shot examples dominate. At high temperatures, the model explores more freely within the constraints the prompt establishes.

## Usage in Prismatic Platform

Temperature is configured per-agent and per-task:

```elixir
# Code generation (deterministic)
PrismaticAI.OllamaClient.generate("qwen3-coder", prompt, temperature: 0.0)

# Threat scenario generation (creative)
PrismaticAI.OllamaClient.generate("gpt-oss:20b", prompt, temperature: 0.6)
```

## Cross-References

- [LLM](@/glossary/llm.md) - Language model consuming temperature parameter
- [System Prompt](@/glossary/system-prompt.md) - Instruction context complementing temperature
- [Agent](@/glossary/agent.md) - Specialized entity with configured temperature
- [AIAD](@/glossary/aiad.md) - Agent standard defining temperature defaults

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
