+++
title = "Few-Shot"
description = "A large language model prompting technique where a small number of input-output examples are provided in the prompt to guide the model's response format, style, and reasoning pattern."
weight = 50

[extra]
category = "ai-ml"
tags = ["few-shot", "llm", "prompting", "in-context-learning", "examples", "zero-shot", "one-shot", "chain-of-thought", "gpt", "ollama"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["ai-engineers", "developers", "data-scientists", "architects"]
related_terms = ["zero-shot", "chain-of-thought", "prompt-engineering", "llm", "in-context-learning", "fine-tuning"]
key_concepts = ["in-context-learning", "example-selection", "prompt-template", "task-demonstration", "format-guidance"]
platforms = ["ollama", "openai", "anthropic", "beam"]
prerequisites = ["llm-basics", "natural-language-processing", "prompt-engineering-basics"]
use_cases = ["classification", "entity-extraction", "code-generation", "data-transformation", "intelligence-analysis"]
complexity = "medium"
stability = "evolving"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Few-Shot", "prompting", "LLM", "examples", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Few-Shot - Prismatic Platform"
+++

## Definition and Overview

Few-shot prompting is a technique for guiding large language model (LLM) behavior by including a small number of input-output examples directly in the prompt. Rather than modifying model weights through fine-tuning, few-shot prompting exploits the model's in-context learning capability -- its ability to recognize patterns from examples and apply them to new inputs within the same conversation context. The technique was prominently demonstrated in the GPT-3 paper (Brown et al., 2020) and has become a foundational tool in prompt engineering.

The spectrum of example-based prompting ranges from zero-shot (no examples, only task description), through one-shot (single example), to few-shot (typically 2-8 examples), and many-shot (dozens of examples consuming significant context window). Each position on this spectrum trades prompt length and cost against output quality and consistency. Zero-shot relies entirely on the model's pre-trained knowledge, while few-shot provides concrete demonstrations that reduce ambiguity and guide the model toward the desired output format and reasoning pattern.

Few-shot prompting is particularly effective when the desired output has a specific format (JSON, structured tables, classification labels), when the task involves domain-specific conventions, or when the model's default behavior does not match the desired behavior. By showing the model concrete examples of correct behavior, the developer communicates expectations far more precisely than through verbal instructions alone. The technique is used extensively in the Prismatic Platform's AI agent system for OSINT data classification, entity extraction, and intelligence report generation.

## Technical Deep Dive

### Prompting Spectrum

| Technique | Examples | Prompt Size | Quality | Best For |
|-----------|----------|-------------|---------|----------|
| **Zero-shot** | 0 | Minimal | Variable | Simple, well-known tasks |
| **One-shot** | 1 | Small | Moderate | Format demonstration |
| **Few-shot** | 2-8 | Moderate | High | Complex tasks with specific format |
| **Many-shot** | 10-50+ | Large | Very high | Rare patterns, domain-specific |
| **Fine-tuning** | 100-10K+ | N/A (training) | Highest | Production scale, latency-critical |

### Example Selection Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Diverse coverage** | Examples spanning different categories/edge cases | Classification, entity extraction |
| **Difficulty graduated** | Simple examples first, complex later | Multi-step reasoning |
| **Similar to input** | Examples closest to the target input | Retrieval-augmented few-shot |
| **Contrastive** | Pairs showing correct vs incorrect | Error-prone patterns |
| **Chain-of-thought** | Examples with explicit reasoning steps | Complex reasoning tasks |

### Few-Shot Prompt Structure

```
System: You are an OSINT entity classifier for Czech business registries.

Example 1:
Input: "Tomas Novak, CEO of Acme s.r.o., born 1975"
Output: {"entity_type": "person", "name": "Tomas Novak", "role": "CEO",
         "organization": "Acme s.r.o.", "birth_year": 1975}

Example 2:
Input: "Firma XYZ a.s., ICO 12345678, founded 2010, Prague"
Output: {"entity_type": "company", "name": "Firma XYZ a.s.",
         "ico": "12345678", "founded": 2010, "city": "Prague"}

Example 3:
Input: "Board member of DEF Group from Jan 2020 to Dec 2023"
Output: {"entity_type": "relationship", "role": "board_member",
         "organization": "DEF Group", "start": "2020-01", "end": "2023-12"}

Now classify:
Input: [actual user input]
```

### Quality Factors

| Factor | Impact | Optimization |
|--------|--------|-------------|
| **Example count** | Diminishing returns after 4-6 | Profile quality vs cost |
| **Example quality** | High -- errors in examples propagate | Use verified, clean examples |
| **Example ordering** | Moderate -- recency bias possible | Place most relevant example last |
| **Format consistency** | High -- inconsistent formats confuse | Uniform formatting across examples |
| **Label balance** | High for classification | Include all possible labels |
| **Edge cases** | High for robustness | Include boundary examples |

## Architecture and Implementation

Few-shot prompt engineering in production systems requires a structured approach to example management. Examples are stored in a versioned repository, indexed by task type and domain, and selected at query time based on the input characteristics. The architecture consists of an example store (holding curated input-output pairs), an example selector (choosing the most relevant examples for a given input), and a prompt assembler (composing the final prompt from system instructions, selected examples, and the actual input).

Dynamic few-shot selection -- where examples are chosen based on similarity to the actual input -- significantly outperforms static example sets. This approach uses embedding-based retrieval to find the most similar examples from the example store, ensuring that the model sees demonstrations most relevant to the specific task at hand. The trade-off is additional latency for the retrieval step and the need to maintain a high-quality example embedding index.

## Usage in Prismatic Platform

The Prismatic Platform uses few-shot prompting in its AI agent system for entity classification, intelligence report generation, and data extraction tasks, integrated with the local Ollama models.

```elixir
defmodule Prismatic.AI.FewShotPrompt do
  @moduledoc """
  Few-shot prompt builder for AI agent tasks.
  Manages example selection, prompt composition,
  and format enforcement for LLM-based classification
  and extraction tasks.
  """

  @type example :: %{input: String.t(), output: String.t()}
  @type prompt_config :: %{
    system: String.t(),
    examples: list(example()),
    input: String.t(),
    output_format: :json | :text | :structured
  }

  @spec build_prompt(prompt_config()) :: String.t()
  def build_prompt(config) do
    parts = [
      config.system,
      "",
      format_examples(config.examples),
      "Now process the following input:",
      "Input: #{config.input}",
      "Output:"
    ]

    Enum.join(parts, "\n")
  end

  @spec build_entity_classifier(String.t(), keyword()) :: String.t()
  def build_entity_classifier(input, opts \\ []) do
    num_examples = Keyword.get(opts, :examples, 3)

    build_prompt(%{
      system: "You are an entity classifier for Czech business registry data. " <>
              "Extract structured entity information from text. " <>
              "Output valid JSON only.",
      examples: select_examples(:entity_classification, num_examples),
      input: input,
      output_format: :json
    })
  end

  @spec select_examples(atom(), pos_integer()) :: list(example())
  def select_examples(task_type, count) do
    get_example_store(task_type)
    |> Enum.take(count)
  end

  defp format_examples(examples) do
    examples
    |> Enum.with_index(1)
    |> Enum.map(fn {example, idx} ->
      "Example #{idx}:\nInput: #{example.input}\nOutput: #{example.output}\n"
    end)
    |> Enum.join("\n")
  end

  defp get_example_store(:entity_classification) do
    [
      %{
        input: "Jan Novak, jednatel spolecnosti ABC s.r.o., nar. 1980",
        output: ~s({"entity_type": "person", "name": "Jan Novak", "role": "jednatel", "organization": "ABC s.r.o.", "birth_year": 1980})
      },
      %{
        input: "XYZ Technologies a.s., ICO 98765432, Praha 1, zalozena 2015",
        output: ~s({"entity_type": "company", "name": "XYZ Technologies a.s.", "ico": "98765432", "city": "Praha", "founded": 2015})
      },
      %{
        input: "Clen predstavenstva od 03/2019 do 11/2022",
        output: ~s({"entity_type": "relationship", "role": "board_member", "start": "2019-03", "end": "2022-11"})
      }
    ]
  end
end
```

## Cross-References

- [LLM](@/glossary/llm.md) -- Large language models using few-shot prompting
- [Prompt Engineering](@/glossary/prompt-engineering.md) -- Broader prompt design techniques
- [F1 Score](@/glossary/f1-score.md) -- Evaluating few-shot classification performance
- [Agent Module](@/glossary/agent-module.md) -- AI agents using few-shot prompts
- **Livebooks**: `ai_agents/` notebooks demonstrate few-shot prompt design and evaluation
- **Academy**: AI/ML topics cover in-context learning techniques

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
