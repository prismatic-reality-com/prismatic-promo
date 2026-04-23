+++
title = "Epistemic Confidence"
description = "A quantified measure of knowledge certainty within the NABLA Infinity framework, expressing how strongly a belief is supported by independent evidence, formal verification, and signal plurality."
weight = 50

[extra]
category = "doctrine"
tags = ["epistemic-confidence", "nabla", "knowledge", "certainty", "trinity-gate", "belief", "evidence", "axioms", "epistemology", "formal-verification"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["architects", "researchers", "security-engineers", "ai-engineers"]
related_terms = ["nabla-infinity", "trinity-gate", "signal-plurality", "contradiction-preservation", "addiction-preservation", "provenance"]
key_concepts = ["confidence-threshold", "trinity-gate-passage", "axiom-compliance", "signal-plurality", "time-decay", "provenance-tracking"]
platforms = ["prismatic-platform", "nabla-framework", "beam"]
prerequisites = ["epistemology-basics", "formal-logic", "probability-theory"]
use_cases = ["decision-making", "threat-assessment", "intelligence-analysis", "agent-reasoning", "quality-gates"]
complexity = "high"
stability = "evolving"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1200
date_modified = "2026-02-23"
keywords = ["Epistemic Confidence", "NABLA", "knowledge certainty", "glossary", "Prismatic Platform"]
quality_score = 85
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Epistemic Confidence - Prismatic Platform"
+++

## Definition and Overview

Epistemic confidence is a numerical measure (ranging from 0.0 to 1.0) expressing the degree of certainty assigned to a belief, claim, or intelligence assessment within the Prismatic Platform's NABLA Infinity epistemic framework. Unlike probabilistic confidence intervals from statistics, epistemic confidence is a composite measure that integrates evidence strength, source independence, logical consistency, formal verifiability, and temporal relevance into a single score that governs decision-making authority.

The concept addresses a fundamental challenge in intelligence analysis and automated decision-making: distinguishing between what we know, what we think we know, and what we do not know. Traditional systems treat all data equally once it passes basic validation, leading to overconfident decisions based on weak evidence. Epistemic confidence forces explicit quantification of uncertainty, ensuring that high-stakes decisions require correspondingly high evidence thresholds.

Within the NABLA Infinity framework, epistemic confidence is not merely advisory -- it is enforced. Claims below the required confidence threshold for their context are blocked from influencing decisions. The Trinity Gate (a three-stage verification system requiring structural consistency, logical consistency, and formal necessity) must be passed before any claim achieves the confidence levels required for critical operations. This prevents the "false certainty" anti-pattern where weak evidence is treated with unjustified conviction.

## Technical Deep Dive

### Confidence Score Components

Epistemic confidence is computed as a weighted aggregate of five independent dimensions:

| Dimension | Weight | Range | Assessment Method |
|-----------|--------|-------|-------------------|
| **Evidence Strength** | 0.30 | 0.0-1.0 | Source reliability, data quality, corroboration count |
| **Source Independence** | 0.20 | 0.0-1.0 | Number of independent sources, correlation analysis |
| **Logical Consistency** | 0.20 | 0.0-1.0 | Contradiction detection, inference chain validity |
| **Temporal Relevance** | 0.15 | 0.0-1.0 | Age of evidence, decay function, refresh rate |
| **Formal Verifiability** | 0.15 | 0.0-1.0 | Trinity Gate passage level, proof availability |

### Confidence Thresholds

| Context | Threshold (tau) | Trinity Gate | Enforcement |
|---------|----------------|-------------|-------------|
| **Critical Decisions** | >= 0.95 | MANDATORY (all 3 gates) | BLOCKING -- decision halted |
| **Standard Operations** | >= 0.80 | MANDATORY (all 3 gates) | BLOCKING -- operation paused |
| **Exploratory Analysis** | >= 0.60 | RECOMMENDED | WARNING -- flagged for review |
| **Research Queries** | >= 0.50 | OPTIONAL | INFORMATIONAL -- logged |
| **Speculative** | >= 0.30 | NOT REQUIRED | LABELED -- marked as speculative |

### NABLA Axiom Integration

Each of the seven NABLA axioms directly influences confidence computation:

| Axiom | Effect on Confidence | Violation Impact |
|-------|---------------------|-----------------|
| **Signal Plurality** | Requires minimum 2 independent signals | Score capped at 0.40 if single-source |
| **Contradiction Preservation** | Contradictory evidence reduces score until resolved | Score reduced by 0.20 per unresolved contradiction |
| **Absence Informative** | Missing expected data treated as signal | Score adjusted for informative absence |
| **Time Decay** | Older evidence weighted less | Score decays by configurable function |
| **Unknown Valid** | Explicit "unknown" state preserves honesty | Score set to 0.0 for unknown (not guessed) |
| **Source Independence** | Independent sources weighted higher | Correlated sources treated as single source |
| **Provenance Mandatory** | All beliefs must be traceable | Score blocked at 0.0 without provenance |

## Architecture and Implementation

The epistemic confidence system operates as a directed acyclic graph (DAG) of belief nodes, where each node carries a confidence score derived from its evidence base and propagated through logical inference rules. When new evidence arrives, confidence scores are recalculated through the affected portion of the belief graph, and any decisions or operations that depend on beliefs whose confidence has dropped below their required threshold are automatically flagged for review.

The architecture distinguishes between ground-level confidence (assigned to direct observations and primary evidence) and derived confidence (computed through inference chains). Derived confidence is always less than or equal to the minimum confidence in its inference chain, ensuring that long chains of reasoning do not produce artificially high confidence through accumulated small inferences.

Time decay is implemented as a configurable function (exponential, linear, or step) that reduces confidence scores as evidence ages. The decay rate is context-dependent: financial intelligence decays rapidly (hours), infrastructure configuration states decay moderately (days), and historical facts decay slowly (years).

## Usage in Prismatic Platform

The Prismatic Platform implements epistemic confidence through the NABLA framework module, integrated with the agent decision-making system and quality gates.

```elixir
defmodule Prismatic.Epistemic.Confidence do
  @moduledoc """
  Computes and tracks epistemic confidence scores for
  beliefs, claims, and intelligence assessments within
  the NABLA Infinity framework.

  Confidence scores govern decision authority: operations
  below their required threshold are blocked until
  additional evidence raises confidence.
  """

  @type dimension :: :evidence | :independence | :consistency | :temporal | :formal
  @type confidence_score :: float()

  @type belief :: %{
    id: String.t(),
    claim: String.t(),
    confidence: confidence_score(),
    dimensions: map(),
    sources: list(map()),
    created_at: DateTime.t(),
    last_evaluated: DateTime.t(),
    trinity_gate_status: :passed | :failed | :pending
  }

  @dimension_weights %{
    evidence: 0.30,
    independence: 0.20,
    consistency: 0.20,
    temporal: 0.15,
    formal: 0.15
  }

  @spec compute_confidence(list(map()), keyword()) :: confidence_score()
  def compute_confidence(evidence_items, opts \\ []) do
    context = Keyword.get(opts, :context, :standard)
    decay_fn = Keyword.get(opts, :decay, &exponential_decay/2)

    dimensions = %{
      evidence: assess_evidence_strength(evidence_items),
      independence: assess_source_independence(evidence_items),
      consistency: assess_logical_consistency(evidence_items),
      temporal: assess_temporal_relevance(evidence_items, decay_fn),
      formal: assess_formal_verifiability(evidence_items)
    }

    score =
      Enum.reduce(@dimension_weights, 0.0, fn {dim, weight}, acc ->
        acc + weight * Map.fetch!(dimensions, dim)
      end)

    apply_axiom_constraints(score, evidence_items, context)
  end

  @spec meets_threshold?(confidence_score(), atom()) :: boolean()
  def meets_threshold?(score, :critical), do: score >= 0.95
  def meets_threshold?(score, :standard), do: score >= 0.80
  def meets_threshold?(score, :exploratory), do: score >= 0.60
  def meets_threshold?(score, :research), do: score >= 0.50
  def meets_threshold?(_score, :speculative), do: true

  defp assess_evidence_strength(items) do
    case length(items) do
      0 -> 0.0
      1 -> 0.3
      n when n < 3 -> 0.5
      n when n < 5 -> 0.7
      _ -> min(1.0, 0.7 + length(items) * 0.03)
    end
  end

  defp assess_source_independence(items) do
    unique_sources =
      items
      |> Enum.map(& &1.source)
      |> Enum.uniq()
      |> length()

    case unique_sources do
      0 -> 0.0
      1 -> 0.3
      2 -> 0.6
      _ -> min(1.0, 0.6 + unique_sources * 0.1)
    end
  end

  defp assess_logical_consistency(items) do
    contradictions =
      items
      |> detect_contradictions()
      |> length()

    max(0.0, 1.0 - contradictions * 0.20)
  end

  defp assess_temporal_relevance(items, decay_fn) do
    now = DateTime.utc_now()

    items
    |> Enum.map(fn item ->
      age_hours = DateTime.diff(now, item.timestamp, :hour)
      decay_fn.(1.0, age_hours)
    end)
    |> then(fn scores ->
      if Enum.empty?(scores), do: 0.0, else: Enum.max(scores)
    end)
  end

  defp assess_formal_verifiability(items) do
    verified_count = Enum.count(items, & &1[:formally_verified])
    if Enum.empty?(items), do: 0.0, else: verified_count / length(items)
  end

  defp apply_axiom_constraints(score, items, _context) do
    score
    |> apply_plurality_constraint(items)
    |> apply_provenance_constraint(items)
  end

  defp apply_plurality_constraint(score, items) do
    if length(Enum.uniq_by(items, & &1.source)) < 2, do: min(score, 0.40), else: score
  end

  defp apply_provenance_constraint(score, items) do
    if Enum.any?(items, fn i -> is_nil(i[:provenance]) end), do: 0.0, else: score
  end

  defp exponential_decay(initial, age_hours) do
    half_life = 168.0
    initial * :math.pow(0.5, age_hours / half_life)
  end

  defp detect_contradictions(items) do
    items
    |> Enum.chunk_every(2, 1, :discard)
    |> Enum.filter(fn [a, b] -> contradicts?(a, b) end)
  end

  defp contradicts?(a, b), do: a[:claim] == b[:claim] and a[:value] != b[:value]
end
```

## Cross-References

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Parent epistemic framework
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-stage verification for high-confidence claims
- [Addiction Preservation](@/glossary/addiction-recovery.md) -- Preserving contradictory signals
- [Signal Plurality](@/glossary/signal-plurality.md) -- Multi-source evidence requirement
- **GRACE** -- Intelligence analysis framework using confidence scores
- **Livebooks**: `ai_agents/` notebooks demonstrate confidence computation
- **Academy**: OSINTSignalSynthesis topic teaches confidence assessment

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
