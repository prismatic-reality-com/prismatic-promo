+++
title = "Prompt Engineering"
weight = 47
[extra]
category = "technology"
description = "Systematic techniques for optimizing AI model input to improve output quality"
related_terms = ["ollama", "aiad", "agent", "confidence-threshold", "nabla-infinity", "epistemic-pipeline", "rag", "prompt-engineering"]
tags = ["glossary", "ai", "prompt-engineering", "llm", "agent", "optimization", "context-window", "few-shot", "chain-of-thought"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "elixir", "ollama"]
domain = "artificial-intelligence"
audience = ["developers", "architects", "ai-engineers"]
prerequisite_knowledge = ["llm-basics", "ai-concepts", "elixir-fundamentals"]
learning_outcomes = ["Understand prompt engineering techniques and their performance impact", "Design structured prompts for AIAD agents", "Implement confidence-calibrated prompting per NABLA Infinity", "Optimize prompts for local Ollama models"]
quality_score = 95
word_count_target = 2500
cross_references = 12
section_count = 14
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
technical_level = "intermediate-to-advanced"
domain_category = "ai-systems"
implementation_status = "production"
authority_level = "L3-strategic"
code_examples = true
version_introduced = "0.1.0"
stability_level = "stable"
keywords = ["prompt engineering", "LLM", "few-shot", "chain-of-thought", "context window", "system message", "AIAD", "agent prompts", "NABLA"]
word_count = 1787
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Prompt Engineering - Prismatic Platform"
+++

## Definition and Overview

Prompt engineering is the discipline of crafting, structuring, and optimizing input text (prompts) to elicit desired behaviors and outputs from Large Language Models (LLMs). Unlike traditional software engineering where behavior is determined by explicit code, LLM behavior is shaped by the instructions, context, examples, and constraints provided in the input prompt. Effective prompt engineering bridges the gap between a model's latent capabilities and specific task requirements, dramatically improving accuracy, consistency, reasoning quality, and adherence to constraints without modifying the model's weights or architecture.

Prompt engineering has evolved from an informal practice ("just ask the model nicely") into a systematic discipline with established techniques, evaluation methodologies, and optimization frameworks. Research has demonstrated that the difference between a naive prompt and an engineered prompt can produce order-of-magnitude improvements in task performance. A simple instruction like "classify this text" might produce 60% accuracy, while a carefully structured prompt with role definition, few-shot examples, chain-of-thought reasoning, and output format specification can achieve 95%+ accuracy on the same task with the same model.

The discipline encompasses multiple layers of optimization. At the instruction layer, prompts define what the model should do through system messages, role assignments, and behavioral guidelines. At the context layer, prompts provide relevant background information, domain knowledge, and constraints that frame the task. At the example layer, few-shot demonstrations show the model the desired input-output pattern. At the reasoning layer, techniques like chain-of-thought prompting guide the model through structured reasoning processes. At the output layer, format specifications ensure responses are parseable, consistent, and actionable.

Prompt engineering is particularly important in agentic AI systems where models operate autonomously, making decisions and taking actions without human review of each step. In such systems, prompt quality directly determines the agent's reliability, safety, and effectiveness. A poorly engineered prompt can produce an agent that sometimes ignores constraints, sometimes produces invalid outputs, and sometimes reasons incorrectly -- even when the underlying model is capable of correct behavior with better instructions.

## Historical Context and Evolution

The origins of prompt engineering trace back to the earliest experiments with transformer-based language models. GPT-2 (2019) demonstrated that language models could be "prompted" to perform tasks they were not explicitly trained on by framing the task as text completion. GPT-3 (2020) formalized this as "in-context learning" -- the ability of large models to learn task patterns from examples provided in the prompt without weight updates.

The field accelerated rapidly with the introduction of instruction-tuned models (InstructGPT, 2022) and chat-aligned models (ChatGPT, 2022), which were specifically trained to follow natural language instructions. This shifted prompt engineering from a research curiosity to a production engineering discipline, as organizations began deploying LLM-powered systems that depended critically on prompt quality.

The Prismatic Platform adopted prompt engineering as a first-class concern from its inception, recognizing that in a 530-agent ecosystem, the quality of agent prompts directly determines the quality of platform operations. The platform's prompt architecture -- structured CLAUDE.md hierarchies, agent specification templates, and [confidence threshold](/glossary/confidence-threshold/)-calibrated outputs -- represents a production-grade application of prompt engineering principles at scale.

## Technical Deep Dive

### Prompt Structure Hierarchy

Effective prompts follow a hierarchical structure that organizes instructions by priority and scope:

```
System Message (Highest Priority)
+-- Role Definition
|   +-- "You are a security analyst specializing in EASM..."
+-- Behavioral Guidelines
|   +-- "Always verify claims against multiple sources..."
+-- Constraints
|   +-- "Never produce executable exploit code..."
+-- Output Format
    +-- "Respond in JSON with schema..."

User Message (Task-Specific)
+-- Context
|   +-- "Given the following asset discovery results..."
+-- Task Description
|   +-- "Analyze the security posture and identify..."
+-- Examples (Few-Shot)
|   +-- "Example input: ... Example output: ..."
+-- Specific Instructions
    +-- "Focus on certificate hygiene and DNS security..."

Assistant Message (Response Shaping)
+-- Partial Response (for continuation)
    +-- '{"analysis": {'  // Guide output format
```

### Prompting Techniques

| Technique | Description | Use Case | Improvement |
|-----------|-------------|----------|-------------|
| **Zero-Shot** | Direct instruction, no examples | Simple classification, extraction | Baseline performance |
| **Few-Shot** | 2-5 input-output examples | Complex formatting, domain-specific tasks | 20-40% improvement |
| **Chain-of-Thought** | "Think step by step" instruction | Multi-step reasoning, math, logic | 30-50% on reasoning tasks |
| **Self-Consistency** | Multiple reasoning paths, majority vote | High-stakes decisions | 10-20% on complex tasks |
| **Role Prompting** | Assign expert persona | Domain-specific analysis | 15-25% on domain tasks |
| **ReAct** | Reason + Act interleaving | Tool-using agents, research tasks | Enables tool use |
| **Constitutional AI** | Self-critique and revision | Safety, alignment, quality | Reduces harmful outputs |
| **Structured Output** | JSON schema specification | API integration, data extraction | Near-100% parseability |

### AIAD Agent Prompt Architecture

Each of the 530 AIAD [agents](/glossary/agent/) has a structured prompt template that defines its behavior:

```elixir
defmodule PrismaticPrompt.AgentTemplate do
  @moduledoc """
  Structured prompt template for AIAD agent definitions.
  Generates system prompts from agent specification files.
  """

  @type agent_prompt :: %{
    system_message: String.t(),
    role: String.t(),
    capabilities: list(String.t()),
    constraints: list(String.t()),
    output_format: map(),
    examples: list(map()),
    nabla_compliance: map()
  }

  @spec build_system_prompt(map()) :: String.t()
  def build_system_prompt(agent_spec) do
    """
    # Agent: #{agent_spec.name}
    ## Role: #{agent_spec.role}
    ## Authority Level: #{agent_spec.authority_level}

    ## Capabilities
    #{format_capabilities(agent_spec.capabilities)}

    ## Constraints
    #{format_constraints(agent_spec.constraints)}

    ## Doctrine Compliance
    - NO MERCY, NO DOUBTS: Execute without compromise
    - NABLA Infinity: All claims require signal plurality and provenance
    - Trinity Gate: Critical decisions must pass structural, logical, and formal verification

    ## Output Format
    #{format_output_spec(agent_spec.output_format)}

    ## Quality Standards
    - Zero tolerance for unverified claims
    - Evidence-based reasoning with explicit confidence levels
    - Structured output conforming to specified schema
    - Complete execution or explicit failure reporting
    """
  end

  defp format_capabilities(capabilities) do
    capabilities
    |> Enum.map(fn cap -> "- #{cap}" end)
    |> Enum.join("\n")
  end

  defp format_constraints(constraints) do
    constraints
    |> Enum.map(fn con -> "- CONSTRAINT: #{con}" end)
    |> Enum.join("\n")
  end
end
```

### Prompt Optimization Pipeline

The Prismatic Platform implements a systematic prompt optimization pipeline:

```elixir
defmodule PrismaticPrompt.Optimizer do
  @moduledoc """
  Systematic prompt optimization through evaluation and iteration.
  Uses structured evaluation metrics to measure prompt effectiveness.
  """

  @type optimization_result :: %{
    original_prompt: String.t(),
    optimized_prompt: String.t(),
    original_score: float(),
    optimized_score: float(),
    improvement: float(),
    iterations: non_neg_integer()
  }

  @spec optimize(String.t(), list(map()), keyword()) :: {:ok, optimization_result()}
  def optimize(prompt, evaluation_cases, opts \\ []) do
    max_iterations = Keyword.get(opts, :max_iterations, 5)
    target_score = Keyword.get(opts, :target_score, 0.95)

    original_score = evaluate_prompt(prompt, evaluation_cases)

    {optimized, final_score, iterations} =
      Enum.reduce_while(1..max_iterations, {prompt, original_score, 0}, fn i, {current, score, _} ->
        if score >= target_score do
          {:halt, {current, score, i}}
        else
          improved = apply_optimization_techniques(current, evaluation_cases, score)
          new_score = evaluate_prompt(improved, evaluation_cases)

          if new_score > score do
            {:cont, {improved, new_score, i}}
          else
            {:cont, {current, score, i}}
          end
        end
      end)

    {:ok, %{
      original_prompt: prompt,
      optimized_prompt: optimized,
      original_score: original_score,
      optimized_score: final_score,
      improvement: final_score - original_score,
      iterations: iterations
    }}
  end

  defp evaluate_prompt(prompt, cases) do
    results =
      Enum.map(cases, fn case_data ->
        response = generate_response(prompt, case_data.input)
        score_response(response, case_data.expected_output, case_data.criteria)
      end)

    Enum.sum(results) / length(results)
  end

  defp apply_optimization_techniques(prompt, cases, current_score) do
    techniques = [
      &add_chain_of_thought/1,
      &add_output_constraints/1,
      &add_few_shot_examples/2,
      &refine_role_definition/1,
      &add_negative_examples/2
    ]

    Enum.reduce(techniques, prompt, fn technique, acc ->
      case technique do
        t when is_function(t, 1) -> t.(acc)
        t when is_function(t, 2) -> t.(acc, cases)
      end
    end)
  end
end
```

### Confidence-Calibrated Prompting

The [NABLA Infinity](/glossary/nabla-infinity/) framework requires that AI outputs include calibrated confidence levels:

```elixir
defmodule PrismaticPrompt.ConfidenceCalibration do
  @moduledoc """
  Prompt templates that enforce confidence-calibrated outputs
  per NABLA Infinity epistemic framework requirements.
  """

  @confidence_prompt """
  ## Confidence Calibration Requirements

  For every claim or assessment, you MUST provide:
  1. A confidence score between 0.0 and 1.0
  2. The evidence supporting the claim
  3. Potential contradicting evidence (if any)
  4. The number of independent sources consulted

  Confidence thresholds:
  - >= 0.95: Suitable for critical decisions (requires Trinity Gate)
  - >= 0.80: Suitable for standard operations
  - >= 0.60: Suitable for exploratory analysis
  - < 0.60: Must be flagged as uncertain

  If you cannot achieve >= 0.60 confidence, explicitly state:
  "Insufficient evidence for reliable assessment. Confidence: [score]."

  NEVER state a claim without an accompanying confidence level.
  NEVER inflate confidence beyond what evidence supports.
  """

  @spec inject_confidence_requirements(String.t()) :: String.t()
  def inject_confidence_requirements(base_prompt) do
    base_prompt <> "\n\n" <> @confidence_prompt
  end
end
```

### Context Window Management

Managing the limited context window of LLMs requires strategic information placement:

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Priority ordering** | Most important context first | Always (LLMs attend more to recent and early tokens) |
| **Chunking** | Split large inputs into processable segments | Documents > 50% of context window |
| **Summarization** | Compress prior context into summaries | Multi-turn conversations |
| **Selective inclusion** | Include only task-relevant context | Large codebases, many files |
| **Hierarchical context** | System > project > session context | CLAUDE.md hierarchy |

## Architecture and Implementation

### CLAUDE.md Prompt Hierarchy

The Prismatic Platform implements a three-level prompt hierarchy through CLAUDE.md files:

```
Level 1: Global Instructions (~/.claude/CLAUDE.md)
+-- Communication style
+-- Code standards (indentation, naming, quotes)
+-- Architecture preferences
+-- Testing strategy
+-- Security best practices

Level 2: Project Instructions (/CLAUDE.md)
+-- Platform-specific doctrine (NO MERCY, NO DOUBTS)
+-- Quality enforcement (13 domains, 100/100)
+-- NABLA Infinity axioms
+-- Color Team protocols
+-- Technology mandates (TailwindCSS, OTP-first)
+-- Session discipline requirements

Level 3: Session Context (.claude/session-context/*.md)
+-- Current session objectives
+-- Files modified
+-- Decisions made
+-- Next steps
```

This hierarchy ensures that every LLM interaction within the platform operates under consistent behavioral guidelines, quality enforcement rules, and session-specific context. The hierarchical structure mirrors the way organizations layer policies: global standards apply everywhere, project rules override where needed, and session context provides immediate operational state.

### Ollama Integration

Local model interaction through [Ollama](/glossary/ollama/) uses optimized prompts for reduced-parameter models:

```elixir
defmodule PrismaticPrompt.OllamaOptimizer do
  @moduledoc """
  Prompt optimization for local Ollama models (7B-20B parameters).
  Adapts prompts for smaller context windows and reduced reasoning capability.
  """

  @spec optimize_for_local(String.t(), atom()) :: String.t()
  def optimize_for_local(prompt, model) do
    prompt
    |> simplify_instructions(model)
    |> add_explicit_examples(model)
    |> constrain_output_length(model)
    |> add_structured_output_markers(model)
  end

  defp simplify_instructions(prompt, :qwen3_coder) do
    # Qwen3-coder responds better to direct, short instructions
    prompt
    |> String.replace(~r/## .*\n/, "")  # Remove section headers
    |> compress_whitespace()
    |> truncate_to_context_window(4096)
  end

  defp add_explicit_examples(prompt, _model) do
    # Smaller models benefit more from explicit examples
    prompt <> "\n\nExample output format:\n```json\n{\"result\": \"...\"}\n```"
  end
end
```

## RAG-Enhanced Prompt Engineering

The intersection of prompt engineering and [RAG](/glossary/rag/) (Retrieval-Augmented Generation) represents a particularly powerful combination within the Prismatic Platform. Rather than relying solely on static prompts, the platform dynamically augments agent prompts with retrieved context from the knowledge base -- documentation, session history, quality metrics, and OSINT intelligence data.

RAG-enhanced prompts follow a specific structure that separates static instructions from dynamic context:

```elixir
defmodule PrismaticPrompt.RAGIntegration do
  @moduledoc """
  Integrates RAG-retrieved context into agent prompt templates.
  Manages the balance between static instructions and dynamic context.
  """

  @spec build_rag_prompt(String.t(), list(map()), keyword()) :: String.t()
  def build_rag_prompt(base_prompt, retrieved_chunks, opts \\ []) do
    max_context_tokens = Keyword.get(opts, :max_context_tokens, 2048)

    context =
      retrieved_chunks
      |> Enum.take_while(fn chunk ->
        estimate_tokens(chunk.content) <= max_context_tokens
      end)
      |> Enum.map_join("\n\n---\n\n", & &1.content)

    """
    #{base_prompt}

    ## Retrieved Context (use this to ground your response)
    #{context}

    ## Instructions
    - Base your response on the retrieved context above
    - Cite specific sections when making claims
    - If context is insufficient, state so explicitly
    """
  end

  defp estimate_tokens(text), do: div(String.length(text), 4)
end
```

This integration ensures that agents operate with up-to-date platform knowledge rather than relying solely on the LLM's parametric memory, which may be stale or incomplete for domain-specific tasks.

## Usage in Prismatic Platform

Prompt engineering permeates the entire Prismatic Platform, from the CLAUDE.md system instructions to individual agent prompt templates.

### Platform Prompt Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| **Agent prompt templates** | 530 | Define behavior for each AIAD agent |
| **Command prompts** | 225 | Structure CLI command execution |
| **CLAUDE.md hierarchy** | 3 levels | Global, project, and session context |
| **Ollama optimized prompts** | 15+ | Local model task templates |
| **Quality gate prompts** | 13 | Domain-specific quality assessment |

### Prompt Versioning

Agent prompts are version-controlled as [AIAD](/glossary/aiad/) agent specification files (`.aiad/agents/*.agent.md`), ensuring that prompt changes are tracked, reviewed, and auditable through Git history. This enables prompt rollback when a new prompt version produces inferior results.

### Prompt Testing and Evaluation

The platform treats prompts as testable artifacts. Each agent prompt template has an associated evaluation suite that measures performance across representative inputs. Prompt changes that decrease evaluation scores below threshold are rejected by the quality gates, preventing prompt regressions from reaching production.

## Epistemic Considerations

Prompt engineering intersects directly with the platform's [epistemic pipeline](/glossary/epistemic-pipeline/) through the NABLA Infinity framework. Every prompt that produces analytical conclusions must enforce epistemic discipline:

- **Signal Plurality**: Prompts must instruct models to seek multiple independent evidence sources
- **Contradiction Preservation**: Prompts must require models to present contradicting evidence rather than suppressing it
- **Provenance Tracking**: Prompts must require models to cite the source of every claim
- **Confidence Calibration**: Prompts must enforce explicit confidence scores per the [Trinity Gate](/glossary/trinity-gate/) requirements

This epistemic layer transforms prompt engineering from a purely technical optimization into a knowledge quality assurance discipline.

## Best Practices

**Define the role before the task.** System messages should establish the agent's identity, expertise, and behavioral framework before presenting the specific task. Role definition activates relevant knowledge within the model and provides a consistent frame for all subsequent interactions.

**Provide few-shot examples for complex tasks.** When the desired output format or reasoning pattern is non-obvious, include 2-3 concrete input-output examples. Examples are more effective than verbose descriptions at communicating expectations, especially for formatting and style.

**Use chain-of-thought for multi-step reasoning.** For tasks requiring analysis, comparison, or multi-step logic, instruct the model to "think step by step" and show its reasoning. This improves accuracy on complex tasks and makes errors debuggable by exposing the reasoning chain.

**Constrain output format explicitly.** Specify the exact output format (JSON schema, markdown structure, enumerated list) rather than relying on the model to infer it. Structured output specifications ensure parseability and enable automated processing of model responses.

**Calibrate confidence requirements.** Enforce NABLA-compliant confidence calibration by requiring the model to state its confidence level and supporting evidence for every claim. This prevents false certainty and enables downstream systems to make risk-appropriate decisions.

**Iterate with metrics.** Never deploy prompt changes without measuring their impact against a representative evaluation set. Prompt optimization should be data-driven, not intuition-driven.

## Common Pitfalls

**Vague or ambiguous instructions.** Prompts that use imprecise language ("analyze this well," "be thorough") produce inconsistent results. Specify exactly what analysis dimensions to cover, what "thorough" means in concrete terms, and what output structure to use.

**Context window overflow.** Stuffing too much context into a prompt causes the model to lose track of important instructions. Prioritize context by relevance, summarize when possible, and place critical instructions at both the beginning and end of the prompt (primacy and recency effects).

**Ignoring negative examples.** Telling the model what NOT to do is often as important as telling it what to do. Include explicit constraints and negative examples for common failure modes.

**Not testing prompt changes.** Prompt modifications can have unexpected downstream effects. Evaluate prompts against a test suite of representative inputs before deploying changes. Track metrics across prompt versions.

**Over-engineering for simple tasks.** Not every interaction requires a complex prompt with role definitions, examples, and chain-of-thought instructions. Simple extraction, classification, or formatting tasks can use concise direct instructions. Match prompt complexity to task complexity.

**Ignoring model-specific behavior.** Different models respond differently to the same prompt. [Ollama](/glossary/ollama/) local models with 7B parameters require more explicit prompts than cloud models with hundreds of billions of parameters. Always test prompts against the target model.

## Security Considerations

Prompt engineering carries security implications that are particularly relevant in the Prismatic Platform's security-critical context. Prompt injection attacks attempt to override system instructions by embedding adversarial instructions in user input. Prompt leaking attacks attempt to extract system prompts by asking the model to reveal its instructions.

The platform mitigates these risks through several mechanisms: strict input sanitization before prompt construction, separation of system and user message channels, monitoring for prompt injection patterns, and the [Color Team](/glossary/color-teams/) Red Team's periodic adversarial testing of agent prompts.

## Related Concepts

- [Ollama](/glossary/ollama/) -- Local AI runtime where prompt engineering drives model behavior
- [AIAD](/glossary/aiad/) -- Agent framework using structured prompts for agent definitions
- [Agent](/glossary/agent/) -- AI agents whose behavior is shaped by engineered prompts
- [Confidence Threshold](/glossary/confidence-threshold/) -- Quality gates enforced through prompt instructions
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework requiring evidence-based prompt design
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level processing pipeline informed by prompt structure
- [RAG](/glossary/rag/) -- Retrieval-augmented generation enhancing prompts with dynamic context
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate requiring confidence-calibrated prompt outputs
- [Color Teams](/glossary/color-teams/) -- Security teams testing prompt robustness against adversarial attacks
- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline validating prompt-driven outputs

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Agents](/agents/) -- AIAD agents with engineered prompt templates
- [Technologies](/technologies/) -- Technology stack including AI components
- [Capabilities](/capabilities/) -- AI-powered capabilities driven by prompt engineering

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
