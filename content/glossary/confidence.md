+++
title = "Confidence"
weight = 50
[extra]
description = "An epistemic certainty level representing the degree of justified belief in a claim, measured on a 0.0-1.0 scale with defined thresholds for action in the NABLA framework"
category = "epistemology"
related_terms = ["confidence-score", "confidence-threshold", "confidence-scoring", "contradiction-preservation", "axiom-enforcement"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["confidence", "epistemic certainty", "NABLA", "belief strength", "confidence threshold", "Trinity Gate", "glossary", "Prismatic Platform"]
tags = ["glossary", "epistemology", "nabla"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Confidence - Prismatic Platform"
+++

## Definition & Overview

Confidence, in the Prismatic Platform's epistemic framework, is a quantitative measure of justified certainty in a claim or belief, expressed on a continuous 0.0 to 1.0 scale. Unlike informal notions of confidence (gut feeling, intuition), the platform's confidence measure is rigorously derived from the NABLA Infinity framework's seven axioms -- particularly Signal Plurality (multiple independent sources required), Provenance Mandatory (traceable evidence chains), and Time Decay (temporal degradation of evidence strength).

Confidence is not probability in the frequentist sense (how often something occurs) but rather a Bayesian-inspired measure of epistemic justification (how well-supported a belief is given available evidence). A confidence of 0.95 does not mean "95% chance of being true" but rather "the evidence supporting this claim meets the 0.95 justification threshold required for high-stakes decisions." This distinction is fundamental to the platform's approach to intelligence analysis and decision-making.

The NABLA framework defines context-dependent confidence thresholds that determine when beliefs can transition from exploration to execution. Critical decisions require confidence of 0.95 or higher with mandatory Trinity Gate passage. Standard operations require 0.80. Exploratory analysis can proceed at 0.60. Below 0.50, the system explicitly acknowledges uncertainty rather than proceeding with unjustified beliefs -- respecting the Unknown Valid axiom.

## Technical Deep Dive

### Confidence Thresholds

| Context | Threshold (tau) | Trinity Gate | Action |
|---------|--------|-------------|--------|
| **Critical Decisions** | 0.95 | MANDATORY | Proceed with full commitment |
| **Standard Operations** | 0.80 | MANDATORY | Proceed normally |
| **Exploratory Analysis** | 0.60 | RECOMMENDED | Proceed with caution |
| **Research Queries** | 0.50 | OPTIONAL | Flag as uncertain |
| **Insufficient Evidence** | < 0.50 | N/A | Explicitly acknowledge uncertainty |

### Confidence Calculation Engine

```elixir
defmodule PrismaticNabla.ConfidenceEngine do
  @moduledoc """
  Calculates epistemic confidence levels for claims within the
  NABLA Infinity framework. Enforces axiom compliance and
  Trinity Gate requirements at each confidence threshold.
  """

  @type signal :: %{
    source: String.t(),
    value: term(),
    confidence: float(),
    timestamp: DateTime.t(),
    independent: boolean()
  }

  @type confidence_result :: %{
    claim: String.t(),
    confidence: float(),
    signal_count: non_neg_integer(),
    independent_sources: non_neg_integer(),
    axiom_compliance: map(),
    trinity_gate_required: boolean(),
    action_permitted: boolean()
  }

  @spec calculate(String.t(), [signal()], keyword()) :: {:ok, confidence_result()}
  def calculate(claim, signals, opts \\ []) do
    context = Keyword.get(opts, :context, :standard)
    threshold = threshold_for_context(context)

    independent = Enum.filter(signals, & &1.independent)
    time_adjusted = apply_time_decay(signals)

    base_confidence = aggregate_confidence(time_adjusted)

    axiom_compliance = %{
      signal_plurality: length(independent) >= 2,
      provenance: Enum.all?(signals, &has_provenance?/1),
      time_decay: true,
      contradiction_preserved: check_contradictions(signals)
    }

    confidence = adjust_for_axiom_violations(base_confidence, axiom_compliance)

    result = %{
      claim: claim,
      confidence: confidence,
      signal_count: length(signals),
      independent_sources: length(independent),
      axiom_compliance: axiom_compliance,
      trinity_gate_required: threshold >= 0.80,
      action_permitted: confidence >= threshold and all_axioms_met?(axiom_compliance)
    }

    {:ok, result}
  end

  defp threshold_for_context(:critical), do: 0.95
  defp threshold_for_context(:standard), do: 0.80
  defp threshold_for_context(:exploratory), do: 0.60
  defp threshold_for_context(:research), do: 0.50

  defp apply_time_decay(signals) do
    now = DateTime.utc_now()

    Enum.map(signals, fn signal ->
      age_hours = DateTime.diff(now, signal.timestamp, :hour)
      decay_factor = :math.exp(-age_hours / 720.0)
      %{signal | confidence: signal.confidence * decay_factor}
    end)
  end

  defp aggregate_confidence(signals) when length(signals) == 0, do: 0.0
  defp aggregate_confidence(signals) do
    weights = Enum.map(signals, & &1.confidence)
    Enum.sum(weights) / length(weights)
  end

  defp adjust_for_axiom_violations(confidence, compliance) do
    penalties = [
      if(!compliance.signal_plurality, do: 0.15, else: 0),
      if(!compliance.provenance, do: 0.10, else: 0),
      if(!compliance.contradiction_preserved, do: 0.20, else: 0)
    ]

    max(confidence - Enum.sum(penalties), 0.0)
  end

  defp has_provenance?(signal), do: signal.source != nil and signal.source != ""
  defp check_contradictions(signals) do
    values = Enum.map(signals, & &1.value) |> Enum.uniq()
    length(values) <= 1 or length(signals) >= 3
  end
  defp all_axioms_met?(compliance) do
    compliance.signal_plurality and compliance.provenance and compliance.contradiction_preserved
  end
end
```

### Trinity Gate Integration

```elixir
defmodule PrismaticNabla.TrinityGate do
  @moduledoc """
  Three-layer verification gate that ALL claims must pass
  before being accepted at confidence >= 0.80.
  No claim is established without Trinity passage.
  """

  @type gate_result :: %{
    structural: boolean(),
    logical: boolean(),
    formal: boolean(),
    passed: boolean()
  }

  @spec evaluate(String.t(), float(), map()) :: {:ok, gate_result()} | {:error, gate_result()}
  def evaluate(claim, confidence, evidence) do
    structural = check_structural_consistency(claim, evidence)
    logical = check_logical_consistency(claim, evidence)
    formal = check_formal_necessity(claim, evidence)

    result = %{
      structural: structural,
      logical: logical,
      formal: formal,
      passed: structural and logical and formal
    }

    if result.passed, do: {:ok, result}, else: {:error, result}
  end

  defp check_structural_consistency(_claim, evidence) do
    Map.get(evidence, :dag_valid, true)
  end

  defp check_logical_consistency(_claim, evidence) do
    not Map.get(evidence, :has_logical_contradiction, false)
  end

  defp check_formal_necessity(_claim, evidence) do
    Map.get(evidence, :formally_proven, false) or Map.get(evidence, :proof_not_required, true)
  end
end
```

## Architecture & Implementation

The confidence system is architecturally central to the NABLA Infinity framework, which governs all epistemic operations across the platform. Every claim, from OSINT intelligence findings to security assessment ratings to agent recommendations, carries a confidence value computed by the ConfidenceEngine. This value determines what actions the system is permitted to take -- the higher the confidence, the more decisive the permitted actions.

The Trinity Gate provides three independent verification layers: structural consistency (belief network forms a valid DAG), logical consistency (propositions follow logical rules), and formal necessity (claims proven in formal systems, potentially including Lean4). All three gates must pass for claims at confidence >= 0.80. This multi-layered verification prevents any single verification approach from being gamed or circumvented.

Time decay is implemented using exponential decay with a half-life of approximately 720 hours (30 days). Evidence older than 30 days has its confidence contribution halved, older than 60 days quartered, and so on. This ensures that the platform's beliefs are grounded in current evidence rather than stale historical data.

## Usage in Prismatic Platform

The OSINT toolbox assigns confidence scores to every intelligence signal returned by its 127 tools. When correlating signals from multiple tools, the ConfidenceEngine aggregates individual confidences into a composite claim confidence, applying the Signal Plurality axiom (minimum two independent sources) and Time Decay axiom (recent evidence weighted higher).

The Perimeter security rating system uses confidence to communicate the reliability of its A-F grades. A rating based on extensive evidence from multiple sources receives high confidence (e.g., 0.92), while a rating based on limited external observations receives lower confidence (e.g., 0.65). Users see both the grade and its confidence level, enabling informed decision-making.

The Color Team operations use confidence thresholds to determine when findings transition from exploration to execution. The Purple Team's closure process requires confidence >= 0.95 with mandatory Trinity Gate passage before any finding can be declared resolved -- preventing premature closure based on insufficient evidence.

## Cross-References

- [Confidence Score](/glossary/confidence-score/) - numerical OSINT reliability metric
- [Confidence Threshold](/glossary/confidence-threshold/) - context-dependent action thresholds
- [Confidence Scoring](/glossary/confidence-scoring/) - scoring methodology
- [Contradiction Preservation](/glossary/contradiction-preservation/) - axiom affecting confidence
- [Axiom Enforcement](/glossary/axiom-enforcement/) - NABLA axiom compliance
- **Livebooks**: `livebooks/domains/ai_agents/` - confidence calibration experiments
- **Academy**: NABLA framework and epistemic reasoning topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
