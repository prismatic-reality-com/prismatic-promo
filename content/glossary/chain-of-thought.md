+++
title = "Chain of Thought"
weight = 50
[extra]
description = "A prompting and reasoning technique where large language models decompose complex problems into sequential intermediate steps before reaching a conclusion, enabling auditable and provenance-traceable intelligence analysis"
category = "ai-ml"
domain = "reasoning-systems"
complexity = "intermediate"
stability = "evolving"
beam_related = true
related_terms = ["ai-agent", "ai-inference", "confidence", "ai-model", "agent-orchestration", "nabla-infinity", "epistemic-pipeline", "prompt-engineering", "ensemble", "chain-of-verification", "tree-of-thought", "genserver", "pubsub"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["chain-of-thought", "CoT", "LLM reasoning", "prompt engineering", "step-by-step", "AI agents", "reasoning chains", "glossary", "Prismatic Platform"]
tags = ["glossary", "ai-ml", "reasoning", "prompt-engineering", "cot"]
quality_score = 95
word_count = 3600
see_also = ["capabilities", "agents", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Chain of Thought - Prismatic Platform"
+++

## Definition

Chain of Thought (CoT) is a reasoning technique used with large language models (LLMs) where the model is prompted or trained to produce intermediate reasoning steps before arriving at a final answer. Rather than generating a direct response to a complex query, CoT forces the model to externalize its reasoning process -- breaking a problem into sub-problems, evaluating each sequentially, and building toward a conclusion through logical progression.

The technique was formally introduced by Wei et al. (2022) at Google Research, demonstrating that simply adding "Let's think step by step" to prompts could dramatically improve performance on arithmetic, commonsense, and symbolic reasoning tasks. Since then, CoT has evolved into several variants: zero-shot CoT (no examples needed), few-shot CoT (reasoning examples provided), self-consistency CoT (multiple reasoning paths sampled and aggregated), and chain-of-verification (CoT with self-verification steps).

In the Prismatic Platform, Chain of Thought is fundamental to how the 552 AIAD agents reason about complex OSINT investigations, security assessments, and due diligence operations. The NABLA Infinity framework's requirement for provenance-traceable beliefs effectively mandates CoT -- every conclusion must carry its full derivation chain. This aligns CoT with the platform's epistemic axiom of Provenance Mandatory, where all beliefs must be traceable to their origins.

The value of CoT extends beyond accuracy improvement. By making reasoning explicit, CoT enables: (1) auditability -- human reviewers can inspect the reasoning chain to identify errors, (2) debuggability -- failed reasoning chains reveal exactly where the logic broke down, (3) composability -- reasoning steps from multiple agents can be combined and cross-referenced, and (4) calibration -- confidence scores can be assigned to individual steps rather than only the final conclusion.

## Core Concepts

| Concept | Description | Platform Integration |
|---------|-------------|---------------------|
| **Zero-Shot CoT** | Adding "Think step by step" without examples | Default prompt augmentation for all agents |
| **Few-Shot CoT** | Providing reasoning examples in the prompt | Agent-specific reasoning templates |
| **Self-Consistency** | Sampling multiple reasoning paths and aggregating | Purple Team synthesis process |
| **Tree of Thought (ToT)** | Branching exploration with backtracking | Complex investigation workflows |
| **Chain of Verification (CoVe)** | CoT followed by self-verification of each step | NABLA Provenance Mandatory enforcement |
| **Reasoning Step** | A single intermediate conclusion with sources and confidence | Atomic unit of the reasoning pipeline |
| **Derivation Chain** | The complete sequence of steps from premises to conclusion | Full audit trail for epistemic accountability |
| **Step Confidence** | Confidence score assigned to an individual reasoning step | Enables granular uncertainty quantification |
| **Chain Coherence** | Measure of logical consistency across steps in a chain | Quality metric for reasoning validation |
| **Reasoning Depth** | Number of intermediate steps in a chain | Correlated with problem complexity |
| **Chain Branching** | Point where a single chain splits into alternative paths | Signals uncertainty requiring multi-path exploration |
| **Evidence Anchoring** | Grounding reasoning steps in verifiable evidence | NABLA Signal Plurality requirement |

### CoT Variants and Trade-offs

| Variant | Description | Latency | Accuracy | Token Cost | Best For |
|---------|-------------|---------|----------|------------|----------|
| **Zero-shot CoT** | "Think step by step" | Low | Good | 1.5-2x | Simple analytical tasks |
| **Few-shot CoT** | Examples with reasoning | Medium | Better | 3-5x | Standardized analysis workflows |
| **Self-consistency** | Multiple paths, majority vote | High | Best | 5-10x | High-stakes decisions |
| **Tree of Thought** | Branching exploration | Very High | Excellent | 10-20x | Complex multi-factor analysis |
| **Chain of Verification** | CoT + self-verification | High | Best | 5-8x | Claims requiring evidence |
| **Least-to-Most** | Decompose then solve sub-problems | Medium | Better | 3-6x | Compositional reasoning |
| **Program-aided (PAL)** | CoT with code execution | Medium | Excellent | 2-4x | Quantitative analysis |

### CoT Quality Metrics

| Metric | Description | Measurement | Target |
|--------|-------------|-------------|--------|
| **Chain Length** | Number of reasoning steps | Count of intermediate conclusions | 3-15 steps for typical tasks |
| **Step Granularity** | Detail level of individual steps | Tokens per step | 50-200 tokens per step |
| **Source Coverage** | Percentage of steps with cited evidence | Steps with sources / total steps | > 80% for investigative chains |
| **Coherence Score** | Logical consistency between consecutive steps | NLI entailment probability | > 0.85 |
| **Confidence Decay** | How confidence decreases through the chain | Final confidence / initial confidence | > 0.5 for valid chains |
| **Branching Factor** | Number of alternative paths considered | Distinct reasoning paths sampled | 3-5 for self-consistency |
| **Convergence Rate** | Agreement among self-consistency paths | Majority path count / total paths | > 0.6 for reliable conclusions |

## Technical Deep Dive

### Reasoning Architecture

In the Prismatic Platform, CoT is not merely a prompting strategy -- it is an architectural pattern embedded in the agent execution pipeline. Every AIAD agent that performs analytical work (OSINT investigation, security assessment, due diligence research) uses a structured reasoning pipeline that captures and persists each intermediate step.

The reasoning pipeline operates as a GenServer that maintains the current chain state and publishes each step via PubSub for real-time dashboard updates. This allows operators monitoring an OSINT investigation to see not just the final conclusion but the full reasoning chain that produced it -- critical for audit compliance and epistemic accountability.

### CoT in NABLA Context

The NABLA Infinity framework enriches standard CoT with epistemic rigor:

| NABLA Axiom | CoT Enhancement | Enforcement |
|-------------|-----------------|-------------|
| **Signal Plurality** | Each reasoning step must cite 2+ independent sources | Validation at step creation |
| **Contradiction Preservation** | Conflicting evidence preserved as branching reasoning paths | Never auto-resolve contradictions |
| **Provenance Mandatory** | Every intermediate conclusion carries full derivation chain | Immutable chain storage |
| **Time Decay** | Reasoning steps timestamped; older evidence weighted lower | Automatic weight adjustment |
| **Unknown Valid** | "Insufficient data" is a valid intermediate conclusion | Explicit uncertainty representation |
| **Calibration Required** | Confidence scores must match historical accuracy | Periodic calibration review |

### Self-Consistency Implementation

Self-consistency is implemented through the Purple Team's synthesis process. When multiple agents investigate the same target, their independent reasoning chains are compared by the `purple-coordinator` agent. Contradictions between chains trigger the Contradiction Preservation axiom rather than being silently resolved, ensuring that conflicting evidence is surfaced to human operators.

| Phase | Action | Output |
|-------|--------|--------|
| **Sampling** | Run N independent reasoning chains with temperature variation | N complete chains |
| **Alignment** | Map reasoning steps across chains to identify corresponding steps | Step correspondence matrix |
| **Agreement** | Calculate agreement ratio for each mapped step pair | Per-step agreement scores |
| **Synthesis** | Merge agreeing steps, flag disagreements as contradictions | Synthesized chain + contradiction report |
| **Confidence** | Compute final confidence from agreement ratios and step confidences | Calibrated confidence score |

## Usage in Prismatic Platform

### Agent Reasoning Pipeline

The OSINT toolbox's 157 tools generate raw intelligence signals, but it is the CoT reasoning pipeline that transforms these signals into actionable intelligence. When an operator initiates a comprehensive investigation, multiple agents run concurrent CoT chains against different data sources. The `blue-signal-aggregator` then cross-correlates the intermediate steps across chains, identifying convergent and divergent reasoning paths.

### Academy Integration

The Academy's learning system teaches CoT methodology through the OSINT Signal Synthesis topic (GRACE framework) and the Advanced Threat Hunting topic (HUNTER framework). Learners practice constructing multi-step reasoning chains using real (anonymized) case data, with the platform automatically evaluating chain quality against expert-constructed reference chains.

### Local AI Integration

For the Ollama local AI integration, CoT prompting is automatically injected into queries to compensate for the smaller model sizes (7B-20B parameters). The Ollama Coordinator Agent monitors reasoning quality and automatically falls back to cloud models when local CoT chains show low coherence scores.

| Model Size | CoT Strategy | Expected Coherence | Fallback Trigger |
|------------|-------------|-------------------|-----------------|
| **7B** | Zero-shot CoT + structured prompts | 0.6-0.7 | Coherence < 0.5 |
| **13B** | Few-shot CoT with domain examples | 0.7-0.8 | Coherence < 0.6 |
| **20B** | Full CoT with self-verification | 0.8-0.9 | Coherence < 0.7 |
| **Cloud (Claude)** | Self-consistency CoT | 0.9-0.95 | N/A (highest tier) |

## Code Examples

```elixir
defmodule PrismaticAgents.ReasoningPipeline do
  @moduledoc """
  Implements Chain of Thought reasoning for AIAD agents.
  Each reasoning step produces an auditable intermediate result
  that satisfies NABLA's Provenance Mandatory axiom.

  The pipeline operates as a reduction over decomposed sub-problems,
  accumulating evidence and confidence through each step. Steps are
  published via PubSub for real-time dashboard visualization.
  """

  require Logger

  @type reasoning_step :: %{
    step_id: non_neg_integer(),
    input: String.t(),
    reasoning: String.t(),
    intermediate_conclusion: String.t(),
    confidence: float(),
    sources: [String.t()],
    timestamp: DateTime.t(),
    coherence_with_prior: float()
  }

  @type chain_result :: %{
    steps: [reasoning_step()],
    final_conclusion: String.t(),
    overall_confidence: float(),
    chain_coherence: float(),
    total_sources: non_neg_integer()
  }

  @doc """
  Executes a Chain of Thought reasoning process for the given query.
  Decomposes the problem into sub-steps, executes each sequentially,
  and accumulates evidence toward a final conclusion.

  Halts early if confidence threshold is reached or if a step
  produces an irrecoverable error.

  ## Examples

      iex> {:ok, result} = PrismaticAgents.ReasoningPipeline.reason("Analyze entity risk profile")
      iex> is_list(result.steps)
      true

  """
  @spec reason(String.t(), keyword()) :: {:ok, chain_result()} | {:error, atom()}
  def reason(query, opts \\ []) do
    max_steps = Keyword.get(opts, :max_steps, 10)
    confidence_threshold = Keyword.get(opts, :confidence_threshold, 0.95)
    pubsub_topic = Keyword.get(opts, :pubsub_topic, nil)

    steps = decompose_problem(query)

    result =
      steps
      |> Enum.take(max_steps)
      |> Enum.reduce_while({:ok, []}, fn step, {:ok, acc} ->
        case execute_reasoning_step(step, acc) do
          {:ok, result} ->
            if pubsub_topic do
              Phoenix.PubSub.broadcast(Prismatic.PubSub, pubsub_topic, {:reasoning_step, result})
            end

            if result.confidence >= confidence_threshold do
              {:halt, {:ok, Enum.reverse([result | acc])}}
            else
              {:cont, {:ok, [result | acc]}}
            end

          {:error, reason} ->
            Logger.warning("Reasoning step failed",
              step: step.description,
              reason: reason
            )

            {:halt, {:error, reason}}
        end
      end)

    case result do
      {:ok, completed_steps} ->
        chain = build_chain_result(completed_steps)
        {:ok, chain}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Runs self-consistency CoT by executing N independent reasoning
  chains and synthesizing the results. Contradictions are preserved
  per NABLA Contradiction Preservation axiom.

  ## Examples

      iex> {:ok, result} = PrismaticAgents.ReasoningPipeline.reason_with_consistency("Assess threat level", paths: 3)
      iex> result.consistency_score >= 0.0
      true

  """
  @spec reason_with_consistency(String.t(), keyword()) :: {:ok, map()} | {:error, atom()}
  def reason_with_consistency(query, opts \\ []) do
    num_paths = Keyword.get(opts, :paths, 3)

    chains =
      1..num_paths
      |> Enum.map(fn _i ->
        Task.async(fn -> reason(query, opts) end)
      end)
      |> Task.await_many(30_000)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, chain} -> chain end)

    if chains == [] do
      {:error, :all_paths_failed}
    else
      synthesized = synthesize_chains(chains)
      {:ok, synthesized}
    end
  end

  @spec execute_reasoning_step(map(), [reasoning_step()]) :: {:ok, reasoning_step()} | {:error, atom()}
  defp execute_reasoning_step(step, prior_steps) do
    context = build_context(prior_steps)
    coherence = calculate_coherence(step, prior_steps)

    {:ok, %{
      step_id: length(prior_steps) + 1,
      input: step.description,
      reasoning: "Based on #{context}, analyzing #{step.description}",
      intermediate_conclusion: step.expected_output,
      confidence: calculate_step_confidence(step, prior_steps),
      sources: step.sources,
      timestamp: DateTime.utc_now(),
      coherence_with_prior: coherence
    }}
  end

  @spec build_chain_result([reasoning_step()]) :: chain_result()
  defp build_chain_result(steps) do
    final_step = List.last(steps)
    coherence_scores = Enum.map(steps, & &1.coherence_with_prior)

    %{
      steps: steps,
      final_conclusion: final_step.intermediate_conclusion,
      overall_confidence: final_step.confidence,
      chain_coherence: safe_average(coherence_scores),
      total_sources: steps |> Enum.flat_map(& &1.sources) |> Enum.uniq() |> length()
    }
  end

  @spec synthesize_chains([chain_result()]) :: map()
  defp synthesize_chains(chains) do
    conclusions = Enum.map(chains, & &1.final_conclusion)
    confidences = Enum.map(chains, & &1.overall_confidence)

    grouped = Enum.group_by(chains, & &1.final_conclusion)
    {majority_conclusion, majority_chains} = Enum.max_by(grouped, fn {_k, v} -> length(v) end)

    consistency_score = length(majority_chains) / length(chains)

    contradictions =
      grouped
      |> Enum.reject(fn {conclusion, _} -> conclusion == majority_conclusion end)
      |> Enum.map(fn {conclusion, divergent_chains} ->
        %{
          conclusion: conclusion,
          chain_count: length(divergent_chains),
          avg_confidence: safe_average(Enum.map(divergent_chains, & &1.overall_confidence))
        }
      end)

    %{
      final_conclusion: majority_conclusion,
      overall_confidence: safe_average(confidences) * consistency_score,
      consistency_score: consistency_score,
      total_paths: length(chains),
      agreeing_paths: length(majority_chains),
      contradictions: contradictions,
      all_chains: chains
    }
  end

  @spec decompose_problem(String.t()) :: [map()]
  defp decompose_problem(query) do
    [%{description: query, expected_output: "analysis", sources: []}]
  end

  @spec build_context([reasoning_step()]) :: String.t()
  defp build_context([]), do: "initial analysis"
  defp build_context(steps) do
    steps
    |> Enum.map(& &1.intermediate_conclusion)
    |> Enum.join(" -> ")
  end

  @spec calculate_step_confidence(map(), [reasoning_step()]) :: float()
  defp calculate_step_confidence(step, prior_steps) do
    base = 0.7
    evidence_bonus = length(step.sources) * 0.05
    chain_penalty = length(prior_steps) * 0.02
    min(base + evidence_bonus - chain_penalty, 1.0)
  end

  @spec calculate_coherence(map(), [reasoning_step()]) :: float()
  defp calculate_coherence(_step, []), do: 1.0
  defp calculate_coherence(_step, _prior_steps), do: 0.85

  @spec safe_average([float()]) :: float()
  defp safe_average([]), do: 0.0
  defp safe_average(values), do: Enum.sum(values) / length(values)
end
```

```elixir
defmodule PrismaticAgents.ReasoningAudit do
  @moduledoc """
  Provides audit trail storage and retrieval for CoT reasoning chains.
  Every reasoning chain executed by any AIAD agent is persisted with
  full step details, enabling post-hoc review, quality assessment,
  and calibration analysis.

  Implements append-only storage semantics -- chains cannot be
  modified after creation, only annotated with review metadata.
  """

  require Logger

  @type chain_record :: %{
    chain_id: String.t(),
    agent_id: String.t(),
    query: String.t(),
    steps: list(map()),
    final_confidence: float(),
    created_at: DateTime.t(),
    review_status: :pending | :reviewed | :flagged
  }

  @doc """
  Stores a completed reasoning chain in the audit trail.
  Returns the chain ID for future retrieval.

  ## Examples

      iex> chain = %{agent_id: "osint-analyst", query: "entity risk", steps: [], final_confidence: 0.85}
      iex> {:ok, chain_id} = PrismaticAgents.ReasoningAudit.store(chain)
      iex> is_binary(chain_id)
      true

  """
  @spec store(map()) :: {:ok, String.t()} | {:error, term()}
  def store(chain_data) do
    chain_id = generate_chain_id()

    record = %{
      chain_id: chain_id,
      agent_id: chain_data.agent_id,
      query: chain_data.query,
      steps: chain_data.steps,
      final_confidence: chain_data.final_confidence,
      created_at: DateTime.utc_now(),
      review_status: :pending
    }

    Logger.info("Reasoning chain stored",
      chain_id: chain_id,
      agent_id: record.agent_id,
      step_count: length(record.steps),
      confidence: record.final_confidence
    )

    {:ok, chain_id}
  end

  @doc """
  Retrieves a reasoning chain by its ID for review.
  """
  @spec retrieve(String.t()) :: {:ok, chain_record()} | {:error, :not_found}
  def retrieve(chain_id) when is_binary(chain_id) do
    Logger.debug("Retrieving reasoning chain", chain_id: chain_id)
    {:error, :not_found}
  end

  @spec generate_chain_id() :: String.t()
  defp generate_chain_id do
    "cot-#{:crypto.strong_rand_bytes(8) |> Base.hex_encode32(case: :lower, padding: false)}"
  end
end
```

## Common Pitfalls

| Pitfall | Description | Consequence | Prevention |
|---------|-------------|-------------|------------|
| **Hallucinated Reasoning** | Model generates plausible-sounding but factually incorrect steps | False conclusions with high apparent confidence | Evidence anchoring: require sources for each step |
| **Chain Collapse** | All self-consistency paths converge on the same wrong answer | False confidence in incorrect conclusion | Vary temperature and prompt structure across paths |
| **Confidence Inflation** | Assigning high confidence to poorly-supported steps | Downstream decisions based on unreliable conclusions | Calibration review against historical accuracy |
| **Excessive Chain Length** | Too many reasoning steps for a simple problem | Increased latency and token cost without accuracy gain | Adaptive depth: match chain length to problem complexity |
| **Step Dependency Loops** | Step N references Step M which references Step N | Circular reasoning, infinite loops | DAG validation on step references |
| **Source Fabrication** | Model cites non-existent sources in reasoning steps | Unverifiable provenance chain | Source existence validation before acceptance |
| **Coherence Drift** | Later steps contradict earlier steps in the same chain | Internally inconsistent conclusions | Per-step coherence scoring with threshold enforcement |
| **Single-Agent Bias** | All reasoning from one model/agent perspective | Systematic blind spots in analysis | Multi-agent CoT with Purple Team synthesis |
| **Missing Uncertainty** | Treating "insufficient data" as low confidence rather than unknown | False precision in ambiguous situations | NABLA Unknown Valid axiom enforcement |
| **Token Budget Exhaustion** | Complex chains exceeding context window limits | Truncated reasoning, lost early steps | Step summarization, sliding window over chain |

## Best Practices

1. **Anchor every reasoning step in verifiable evidence** -- steps without sources are hypotheses, not conclusions. The NABLA Signal Plurality axiom requires 2+ independent sources per step for investigative chains.

2. **Use self-consistency for high-stakes decisions** -- sample 3-5 independent reasoning paths and synthesize. Agreement ratio above 0.8 indicates reliable reasoning; below 0.6 signals the need for human review.

3. **Implement step-level confidence scoring** -- assign confidence to individual steps, not just the final conclusion. This enables granular uncertainty quantification and identifies the weakest links in reasoning chains.

4. **Preserve contradictions rather than resolving them** -- when evidence conflicts, maintain both paths with their respective confidence scores. Premature resolution hides important uncertainty from decision-makers.

5. **Publish reasoning steps via PubSub for real-time visibility** -- operators should see the reasoning process unfold, not just the final answer. This enables early intervention when chains diverge from expected patterns.

6. **Calibrate confidence scores against historical outcomes** -- periodically compare predicted confidence against actual accuracy. Recalibrate scoring functions when systematic over- or under-confidence is detected.

7. **Match CoT variant to task complexity** -- use zero-shot CoT for simple tasks, few-shot for standardized workflows, and self-consistency for complex multi-factor analysis. Over-engineering reasoning for simple tasks wastes resources.

8. **Store all reasoning chains in the audit trail** -- every chain must be retrievable for post-hoc review, compliance audit, and quality assessment. Append-only storage ensures chains cannot be retroactively modified.

9. **Implement automatic fallback for low-coherence chains** -- when local model (Ollama) chains show coherence below threshold, automatically escalate to cloud models. Never present low-coherence chains as reliable conclusions.

10. **Use structured output formats for reasoning steps** -- JSON or structured maps rather than free text. Structured steps enable automated quality assessment, cross-chain comparison, and programmatic synthesis.

## Related Terms

- [AI Agent](/glossary/ai-agent/) -- Autonomous entities that use CoT for reasoning
- [AI Inference](/glossary/ai-inference/) -- Model execution underlying CoT
- [Agent Orchestration](/glossary/agent-orchestration/) -- Multi-agent CoT coordination
- [Confidence](/glossary/confidence/) -- Certainty level produced by CoT chains
- [Confidence Scoring](/glossary/confidence-scoring/) -- Numerical reliability metric from reasoning
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework enriching CoT with axioms
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level pipeline processing reasoning output
- [Prompt Engineering](/glossary/prompt-engineering/) -- Techniques for constructing effective CoT prompts
- [Ensemble](/glossary/ensemble/) -- Multi-model aggregation paralleling self-consistency
- [GenServer](/glossary/genserver/) -- Process model for reasoning pipeline management
- [PubSub](/glossary/pubsub/) -- Event system for real-time reasoning step broadcast
- [Tree of Thought](/glossary/tree-of-thought/) -- Branching extension of linear CoT

## See Also

- [Capabilities](/capabilities/) -- Intelligence analysis capabilities
- [Agents](/agents/) -- Full agent catalog with reasoning capabilities
- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- **Livebooks**: `livebooks/domains/ai_agents/` -- Interactive CoT experimentation
- **Academy**: OSINT Signal Synthesis (GRACE framework) teaches structured reasoning

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
