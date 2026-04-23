+++
title = "Mapping Uncertainty"
weight = 40
[extra]
description = "The systematic practice of identifying, quantifying, and tracking areas of incomplete knowledge in software systems and decision-making processes"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
abbreviation = "N/A"
related_terms = ["nabla-infinity", "nabla-axioms", "belief-graph", "confidence-scoring", "trinity-gate", "epistemic-reasoning", "bayesian-reasoning", "signal-plurality", "evidence", "formal-verification"]
keywords = ["mapping uncertainty definition", "epistemic uncertainty quantification", "uncertainty management software", "confidence calibration", "decision making under uncertainty", "Bayesian uncertainty modelling", "knowledge gap analysis", "uncertainty propagation", "probabilistic reasoning", "NABLA uncertainty framework"]
tags = ["epistemic", "nabla", "uncertainty", "reasoning", "decision-making"]
difficulty_level = "advanced"
platform_relevance = "critical"
elixir_relevance = "high"
version = "1.0.0"
word_count = 2099
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Mapping Uncertainty - Prismatic Platform"
+++

## Definition

Mapping uncertainty is the systematic practice of identifying, classifying, quantifying, and tracking areas where knowledge is incomplete, contested, or absent within a software system or decision-making process. Rather than treating uncertainty as an obstacle to be eliminated or ignored, the Prismatic Platform's NABLA Infinity framework treats uncertainty as informative data that must be explicitly modelled, preserved, and propagated through reasoning chains. Mapping uncertainty transforms the implicit "we do not know" into explicit, structured representations that inform decisions, trigger investigations, and prevent false confidence from corrupting system behaviour.

## Overview

Uncertainty is endemic to all software systems. Requirements are incompletely specified. Runtime environments behave non-deterministically. External dependencies have unknown failure modes. User behaviour is unpredictable. Security threats are partially observable. Performance characteristics change under load. The question is not whether uncertainty exists, but whether a system acknowledges and manages it or pretends it does not exist.

Most software systems take the latter approach. Boolean flags represent states that are actually probabilistic. Configuration values are treated as certain even when their optimal values are unknown. Error handling assumes a known taxonomy of failure modes. Security models assume a known set of threats. This implicit denial of uncertainty creates systems that are brittle when confronted with unexpected conditions -- they have no machinery for reasoning about what they do not know.

The Prismatic Platform takes a fundamentally different approach through the NABLA Infinity epistemic framework. The fifth NABLA axiom states that "Unknown is a valid state" -- acknowledging ignorance is not a failure but a legitimate and informative epistemic position. The third axiom states that "Absence is informative" -- the fact that expected information is missing tells us something important. Together, these axioms mandate that uncertainty must be explicitly mapped, tracked, and propagated rather than hidden or assumed away.

This approach has deep roots in Bayesian epistemology, where all beliefs are held with associated probabilities rather than binary certainty. It draws from decision theory's distinction between risk (quantifiable uncertainty) and Knightian uncertainty (unquantifiable uncertainty). It incorporates ideas from fuzzy logic, interval analysis, and probabilistic programming. But in the Prismatic Platform, these academic concepts are operationalized into concrete data structures, validation rules, and enforcement mechanisms that ensure uncertainty is never silently discarded.

The practical value of mapping uncertainty is most visible during incident response and decision-making under pressure. When a security alert fires, the system does not present a binary "threat/no-threat" assessment. It presents a structured uncertainty map: confidence level in the detection, alternative explanations for the observed behaviour, information that would increase confidence, and the cost of different response actions under each hypothesis. This structured uncertainty enables better decisions than false certainty ever could.

Mapping uncertainty also serves a critical role in preventing the epistemic anti-patterns that the NABLA framework was designed to counter: cherry-picking evidence, burying contradictions, claiming false certainty, and reasoning from single sources. When uncertainty is explicitly mapped, these anti-patterns become structurally difficult to commit -- the system forces acknowledgment of what is not known alongside what is claimed.

## Technical Details

### Uncertainty Type Taxonomy

The Prismatic Platform classifies uncertainty into distinct categories, each requiring different handling strategies:

| Uncertainty Type | Description | Handling Strategy | Example |
|-----------------|-------------|-------------------|---------|
| **Aleatoric** | Irreducible randomness inherent in the system | Model probabilistically, do not try to eliminate | Network latency variance |
| **Epistemic** | Reducible uncertainty from incomplete knowledge | Investigate to reduce, track reduction progress | Unknown threat actor capability |
| **Model** | Uncertainty about whether the model is correct | Validate with multiple models, track divergence | Security risk scoring formula |
| **Measurement** | Uncertainty in observations and data quality | Calibrate instruments, propagate measurement error | OSINT source reliability |
| **Decision** | Uncertainty about which action to take | Decision analysis, expected value calculations | Whether to block suspicious IP |
| **Temporal** | Uncertainty that changes over time | Time-decay beliefs, re-evaluate periodically | Stale threat intelligence |

### Uncertainty Representation in Elixir

The Prismatic Platform represents uncertainty as first-class data structures rather than implicit assumptions:

```elixir
defmodule PrismaticNabla.Uncertainty do
  @moduledoc """
  Core uncertainty representation for the NABLA Infinity framework.
  Provides structured types for mapping, tracking, and propagating
  uncertainty through reasoning chains and decision processes.
  """

  @type uncertainty_type :: :aleatoric | :epistemic | :model | :measurement | :decision | :temporal
  @type confidence :: float()

  @type uncertainty_map :: %{
    id: String.t(),
    domain: String.t(),
    type: uncertainty_type(),
    description: String.t(),
    confidence: confidence(),
    evidence_for: list(evidence()),
    evidence_against: list(evidence()),
    information_gaps: list(String.t()),
    resolution_strategy: atom(),
    last_assessed: DateTime.t(),
    decay_rate: float()
  }

  @type evidence :: %{
    source: String.t(),
    content: String.t(),
    reliability: float(),
    timestamp: DateTime.t(),
    independent: boolean()
  }

  @spec create(map()) :: {:ok, uncertainty_map()} | {:error, String.t()}
  def create(attrs) do
    with :ok <- validate_confidence(attrs[:confidence]),
         :ok <- validate_evidence_plurality(attrs) do
      uncertainty = %{
        id: generate_id(),
        domain: attrs.domain,
        type: attrs.type,
        description: attrs.description,
        confidence: attrs.confidence,
        evidence_for: Map.get(attrs, :evidence_for, []),
        evidence_against: Map.get(attrs, :evidence_against, []),
        information_gaps: Map.get(attrs, :information_gaps, []),
        resolution_strategy: determine_strategy(attrs.type),
        last_assessed: DateTime.utc_now(),
        decay_rate: Map.get(attrs, :decay_rate, 0.01)
      }

      {:ok, uncertainty}
    end
  end

  @spec apply_time_decay(uncertainty_map()) :: uncertainty_map()
  def apply_time_decay(%{last_assessed: assessed, decay_rate: rate} = uncertainty) do
    hours_elapsed = DateTime.diff(DateTime.utc_now(), assessed, :hour)
    decay_factor = :math.exp(-rate * hours_elapsed)
    decayed_confidence = uncertainty.confidence * decay_factor

    %{uncertainty |
      confidence: Float.round(decayed_confidence, 4),
      last_assessed: DateTime.utc_now()
    }
  end

  defp validate_confidence(nil), do: {:error, "Confidence is required (NABLA axiom: provenance mandatory)"}
  defp validate_confidence(c) when c >= 0.0 and c <= 1.0, do: :ok
  defp validate_confidence(_), do: {:error, "Confidence must be between 0.0 and 1.0"}

  defp validate_evidence_plurality(%{evidence_for: ev}) when length(ev) < 2 do
    {:error, "NABLA axiom violation: signal plurality requires minimum 2 evidence sources"}
  end
  defp validate_evidence_plurality(_), do: :ok

  defp determine_strategy(:aleatoric), do: :probabilistic_model
  defp determine_strategy(:epistemic), do: :investigation
  defp determine_strategy(:model), do: :multi_model_validation
  defp determine_strategy(:measurement), do: :calibration
  defp determine_strategy(:decision), do: :expected_value_analysis
  defp determine_strategy(:temporal), do: :periodic_reassessment
end
```

### Uncertainty Propagation Engine

Uncertainty does not exist in isolation -- it propagates through reasoning chains. When conclusion C depends on premises A and B, the uncertainty in C is a function of the uncertainties in A and B:

```elixir
defmodule PrismaticNabla.UncertaintyPropagation do
  @moduledoc """
  Propagates uncertainty through reasoning chains and dependency graphs.
  Ensures that downstream conclusions accurately reflect the cumulative
  uncertainty from upstream premises, preventing false confidence.
  """

  alias PrismaticNabla.Uncertainty

  @type reasoning_node :: %{
    id: String.t(),
    conclusion: String.t(),
    confidence: float(),
    premises: list(String.t()),
    combination_rule: atom()
  }

  @spec propagate(list(reasoning_node()), map()) :: {:ok, list(reasoning_node())}
  def propagate(nodes, uncertainty_registry) do
    sorted = topological_sort(nodes)

    updated =
      Enum.reduce(sorted, %{}, fn node, computed ->
        premise_confidences =
          node.premises
          |> Enum.map(fn premise_id ->
            case Map.get(computed, premise_id) do
              nil -> Map.get(uncertainty_registry, premise_id, %{confidence: 0.5})
              existing -> existing
            end
          end)
          |> Enum.map(& &1.confidence)

        propagated_confidence =
          combine_confidences(premise_confidences, node.combination_rule)

        final_confidence = min(node.confidence, propagated_confidence)

        Map.put(computed, node.id, %{node | confidence: final_confidence})
      end)

    {:ok, Map.values(updated)}
  end

  defp combine_confidences(confidences, :conjunction) do
    # AND logic: joint confidence is product of individual confidences
    Enum.reduce(confidences, 1.0, &(&1 * &2))
  end

  defp combine_confidences(confidences, :disjunction) do
    # OR logic: at least one must hold
    1.0 - Enum.reduce(confidences, 1.0, fn c, acc -> acc * (1.0 - c) end)
  end

  defp combine_confidences(confidences, :weighted_average) do
    if Enum.empty?(confidences) do
      0.0
    else
      Enum.sum(confidences) / length(confidences)
    end
  end

  defp combine_confidences(confidences, :minimum) do
    # Conservative: confidence is limited by weakest link
    Enum.min(confidences, fn -> 0.0 end)
  end
end
```

### Belief Graph with Uncertainty Tracking

The Prismatic Platform maintains a belief graph where each node carries explicit uncertainty information and edges represent evidential relationships:

```elixir
defmodule PrismaticNabla.BeliefGraph do
  @moduledoc """
  Directed acyclic graph of beliefs with uncertainty annotations.
  Each belief node carries confidence, evidence, and uncertainty metadata.
  Edges represent evidential support or contradiction relationships.
  Satisfies NABLA axioms: signal plurality, contradiction preservation,
  provenance mandatory, and time decay.
  """

  @type belief_node :: %{
    id: String.t(),
    proposition: String.t(),
    confidence: float(),
    uncertainty_type: atom(),
    evidence: list(map()),
    contradictions: list(String.t()),
    created_at: DateTime.t(),
    assessed_at: DateTime.t()
  }

  @type edge_type :: :supports | :contradicts | :depends_on | :weakens

  @spec add_belief(map(), String.t(), map()) ::
          {:ok, map()} | {:error, String.t()}
  def add_belief(graph, proposition, evidence) do
    with :ok <- validate_plurality(evidence),
         :ok <- validate_provenance(evidence),
         :ok <- check_contradictions(graph, proposition) do
      node = %{
        id: generate_belief_id(),
        proposition: proposition,
        confidence: calculate_initial_confidence(evidence),
        uncertainty_type: classify_uncertainty(evidence),
        evidence: evidence.sources,
        contradictions: find_contradictions(graph, proposition),
        created_at: DateTime.utc_now(),
        assessed_at: DateTime.utc_now()
      }

      # NABLA axiom: contradiction preservation
      # Do NOT discard contradicting beliefs; link them
      edges = build_evidential_edges(graph, node)

      {:ok, insert_node(graph, node, edges)}
    end
  end

  defp validate_plurality(%{sources: sources}) when length(sources) >= 2, do: :ok
  defp validate_plurality(_), do: {:error, "Signal plurality violation: minimum 2 independent sources required"}

  defp validate_provenance(%{sources: sources}) do
    if Enum.all?(sources, &Map.has_key?(&1, :origin)) do
      :ok
    else
      {:error, "Provenance mandatory: all evidence must have traceable origin"}
    end
  end

  defp check_contradictions(graph, proposition) do
    contradicting = find_contradictions(graph, proposition)

    if Enum.any?(contradicting) do
      # NABLA: contradictions are preserved, not resolved by discarding
      :ok
    else
      :ok
    end
  end
end
```

## Implementation

### NABLA Axiom Enforcement for Uncertainty

The Prismatic Platform enforces uncertainty mapping through the seven NABLA axioms:

1. **Signal Plurality**: Every uncertainty assessment must be informed by at least two independent signals. A single data point cannot establish confidence levels.

2. **Contradiction Preservation**: When evidence contradicts an existing belief, both the belief and the contradiction are preserved. The system does not resolve contradictions by discarding inconvenient evidence.

3. **Absence Informative**: Missing information is explicitly tracked as an information gap. The absence of expected data increases uncertainty rather than being silently ignored.

4. **Time Decay**: All confidence assessments decay over time. Stale intelligence, outdated vulnerability scans, and old threat models automatically lose confidence as they age, forcing periodic reassessment.

5. **Unknown Valid**: The system explicitly supports "I don't know" as a legitimate state. Forcing a binary decision when uncertainty is high is treated as a NABLA axiom violation.

6. **Source Independence**: Evidence from independent sources receives higher weight than correlated evidence. Two reports from the same underlying data source count as one signal, not two.

7. **Provenance Mandatory**: Every belief, assessment, and confidence score must trace back to its evidence sources. Unattributed claims are rejected by the system.

### Trinity Gate Integration

Uncertainty mapping integrates directly with the Trinity Gate validation system. All three gates must pass before any claim is established:

- **Structural Consistency**: The belief graph must form a valid DAG. Circular reasoning -- where belief A supports belief B which supports belief A -- is structurally detected and rejected.
- **Logical Consistency**: Propositions must follow logical rules. Claiming high confidence while acknowledging significant contradictions triggers a logical consistency failure.
- **Formal Necessity**: Critical claims must be formally provable. Uncertainty levels determine which claims require formal proof (high-confidence claims in critical domains) versus those that can proceed with lower verification.

### Practical Uncertainty Mapping Workflow

In daily platform operations, uncertainty mapping follows this workflow:

1. **Identify**: What do we not know? What assumptions are we making? What information is stale?
2. **Classify**: Is this aleatoric (irreducible), epistemic (reducible), model-related, or temporal?
3. **Quantify**: What is the confidence level? What evidence supports and contradicts the current assessment?
4. **Record**: Create structured uncertainty records in the belief graph with full provenance
5. **Propagate**: Update downstream conclusions that depend on the uncertain premise
6. **Plan**: Determine if the uncertainty is acceptable or requires investigation to reduce
7. **Reassess**: Periodically re-evaluate uncertainty assessments as new information arrives

## Comparison

### Approaches to Uncertainty in Software Systems

| Approach | Uncertainty Handling | Strengths | Weaknesses |
|----------|---------------------|-----------|------------|
| **Boolean Logic** | Ignored (true/false only) | Simple, fast | No uncertainty representation |
| **Exception Handling** | Binary (success/failure) | Standard, well-understood | No partial knowledge |
| **Fuzzy Logic** | Membership degrees [0,1] | Gradual transitions | Limited composability |
| **Bayesian Networks** | Conditional probabilities | Rigorous, well-founded | Computationally expensive |
| **Dempster-Shafer** | Belief/plausibility intervals | Handles ignorance explicitly | Complex combination rules |
| **NABLA Infinity** | Structured uncertainty maps with axiom enforcement | Comprehensive, operationalized | Learning curve, overhead |

### Uncertainty vs. Risk Management

Uncertainty mapping is related to but distinct from risk management:

| Dimension | Risk Management | Uncertainty Mapping |
|-----------|----------------|-------------------|
| **Focus** | Known threats with estimated probability | All forms of incomplete knowledge |
| **Scope** | Negative outcomes | Any knowledge gap (positive or negative) |
| **Quantification** | Probability x Impact matrices | Confidence scores with evidence chains |
| **Response** | Mitigate, transfer, accept, avoid | Investigate, monitor, propagate, preserve |
| **Temporal** | Point-in-time assessment | Continuous with time decay |
| **Contradictions** | Resolved by committee | Explicitly preserved |

## Best Practices

1. **Make uncertainty explicit**: Never represent uncertain knowledge as certain. Use confidence scores, ranges, or explicit "unknown" markers rather than picking a single value and treating it as truth.

2. **Preserve contradictions**: When evidence conflicts, record both sides with their respective confidence levels. Premature resolution of contradictions leads to information loss and false certainty.

3. **Enforce signal plurality**: Require multiple independent evidence sources before establishing belief. Single-source assertions should carry low confidence regardless of how authoritative the source appears.

4. **Implement time decay**: All assessments lose validity over time. Threat intelligence, vulnerability scans, performance benchmarks, and compliance assessments must have explicit freshness requirements.

5. **Propagate uncertainty honestly**: When downstream conclusions depend on uncertain premises, the downstream confidence must reflect the upstream uncertainty. Do not launder uncertainty by computing a precise number from imprecise inputs.

6. **Track information gaps**: Maintain an explicit list of what is not known. This "negative knowledge" guides investigation priorities and prevents blind spots from becoming invisible.

7. **Calibrate confidence assessments**: Periodically validate that confidence scores correspond to reality. If 90% confidence predictions are correct only 60% of the time, the calibration needs adjustment.

8. **Separate types of uncertainty**: Aleatoric uncertainty cannot be reduced by investigation; epistemic uncertainty can. Investing effort in reducing aleatoric uncertainty wastes resources. Investing effort in reducing epistemic uncertainty creates value.

## Pitfalls

1. **False precision**: Assigning a confidence of 0.847 when the actual uncertainty makes any value between 0.7 and 0.95 equally defensible. Spurious precision creates an illusion of knowledge.

2. **Uncertainty paralysis**: Using uncertainty as an excuse for inaction. The NABLA framework's transition protocol mandates that when confidence exceeds the relevant threshold and the Trinity Gate passes, execution must proceed decisively under NO MERCY doctrine.

3. **Anchoring bias**: Allowing the first estimate of uncertainty to unduly influence subsequent assessments. Initial confidence scores should be treated as hypotheses subject to revision, not anchors.

4. **Ignoring correlated uncertainty**: Treating multiple uncertain inputs as independent when they share common underlying causes. This underestimates the true uncertainty of combined conclusions.

5. **Single-point estimates**: Reducing uncertainty to a single number (e.g., "70% confident") without tracking the full uncertainty distribution, evidence base, and information gaps that produced that number.

6. **Temporal neglect**: Failing to implement time decay, resulting in stale assessments being treated with the same confidence as fresh observations.

7. **Cherry-picking evidence**: Selectively citing evidence that supports a preferred conclusion while ignoring contradicting evidence. The NABLA contradiction preservation axiom is specifically designed to prevent this anti-pattern.

## Use Cases

### Security Threat Assessment

When PrismaticPerimeter detects a potential security issue, the assessment includes explicit uncertainty mapping. A suspicious network connection might be classified as 0.65 confidence malicious with evidence from behavioral analysis (supports) and known legitimate service patterns (contradicts). The uncertainty map guides the response: high-confidence threats trigger automated blocking, medium-confidence findings trigger investigation, and low-confidence signals are logged for pattern analysis.

### OSINT Intelligence Analysis

Intelligence gathered from the platform's 120+ OSINT tools carries varying reliability. A corporate registration from an official government registry has high reliability. A social media post claiming insider knowledge has low reliability. The uncertainty mapping system weights and combines these signals according to source independence and reliability, producing intelligence assessments with calibrated confidence rather than binary conclusions.

### Quality Gate Confidence

The quality gate system operates with explicit confidence thresholds. A Dialyzer analysis that passes with zero warnings produces high-confidence type safety. A security scan that detects a potential vulnerability produces medium-confidence findings that require human assessment. The confidence level determines whether the gate blocks automatically or escalates for human judgment.

### Architectural Decision Making

When evaluating architectural alternatives, uncertainty mapping tracks what is known and unknown about each option's performance characteristics, maintenance burden, and scaling behaviour. Rather than pretending to have perfect knowledge of future requirements, the decision process explicitly models the uncertainty and selects the option that performs best across the range of plausible scenarios.

### Incident Response Prioritization

During incident response, multiple hypotheses compete to explain observed symptoms. Mapping uncertainty across hypotheses -- with explicit evidence for and against each -- prevents the common failure mode of fixating on the first plausible explanation while ignoring alternatives that might better explain the observations.

## Related Concepts

Understanding mapping uncertainty connects to the NABLA Infinity epistemic framework and broader Prismatic Platform architecture:

- [NABLA Infinity](/glossary/nabla-infinity/) -- the overarching epistemic framework that mandates systematic uncertainty management
- [NABLA Axioms](/glossary/nabla-axioms/) -- the seven non-negotiable axioms that govern uncertainty handling
- [Belief Graph](/glossary/belief-graph/) -- the directed acyclic graph structure that represents beliefs with uncertainty annotations
- [Confidence Scoring](/glossary/confidence-scoring/) -- the quantitative assessment of belief reliability
- [Trinity Gate](/glossary/trinity-gate/) -- the three-layer validation system that integrates with uncertainty thresholds
- [Bayesian Reasoning](/glossary/bayesian-reasoning/) -- the probabilistic foundation for updating beliefs given new evidence
- [Signal Plurality](/glossary/signal-plurality/) -- the requirement for multiple independent evidence sources
- [Epistemic Reasoning](/glossary/epistemic-reasoning/) -- the broader practice of reasoning about knowledge and belief
- [Evidence](/glossary/evidence/) -- the informational basis for all confidence assessments
- [Formal Verification](/glossary/formal-verification/) -- the mathematical proof techniques used for high-confidence claims

## See Also

- [Adversarial Drift](/glossary/adversarial-drift/) -- how uncertainty increases when adversarial conditions shift undetected
- [Confidence Threshold](/glossary/confidence-threshold/) -- the minimum confidence required for different categories of decisions
- [Epistemic Validation](/glossary/epistemic-validation/) -- the validation of reasoning processes themselves
- [Modal Logic](/glossary/modal-logic/) -- the formal logical system for reasoning about possibility and necessity
- [Axiom Enforcement](/glossary/axiom-enforcement/) -- how the NABLA axioms are technically enforced in the platform

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) glossary. Contributions welcome via pull request.
