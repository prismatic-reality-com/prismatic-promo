+++
title = "Verifiable Evidence"
description = "Comprehensive treatment of evidence verification, NABLA provenance tracking, Trinity Gate verification, and the epistemic foundations ensuring all platform beliefs are backed by traceable, validated evidence."
weight = 42

[extra]
category = "epistemic"
tags = ["verifiable-evidence", "evidence", "provenance", "nabla", "trinity-gate", "epistemic", "verification", "traceability", "signal-plurality", "truth"]
related_terms = ["evidence", "evidence-over-opinion", "provenance-mandatory", "nabla-infinity", "nabla-axioms", "trinity-gate", "signal-plurality", "confidence-threshold", "confidence-scoring", "structural-consistency", "logical-consistency", "quality-evidence-truth"]
keywords = ["verifiable evidence epistemic framework", "NABLA provenance tracking", "Trinity Gate verification", "evidence-based decision making", "signal plurality requirement", "provenance mandatory axiom", "epistemic pipeline verification", "evidence chain traceability", "belief verification formal methods", "evidence quality assessment"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
learning_outcomes = ["Understand the epistemic foundations requiring verifiable evidence", "Trace evidence through the NABLA provenance chain", "Apply the seven NABLA axioms to evidence evaluation", "Evaluate evidence quality using confidence scoring", "Understand Trinity Gate's three-layer verification process", "Implement evidence tracking in Elixir systems"]
prerequisites = ["nabla-infinity", "trinity-gate", "signal-plurality", "provenance-mandatory"]
see_also = ["evidence-over-opinion", "confidence-threshold", "quality-evidence-truth", "structural-consistency", "logical-consistency"]
word_count = 1398
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Verifiable Evidence - Prismatic Platform"
+++

## Definition and Overview

Verifiable evidence is information that can be independently confirmed, traced to its origin, and validated against multiple independent sources. In the Prismatic Platform, verifiable evidence is not a philosophical ideal but an engineering requirement: every belief, decision, and conclusion that enters the platform's knowledge base must pass through the [Trinity Gate](/glossary/trinity-gate/) verification mechanism, satisfy the seven [NABLA axioms](/glossary/nabla-axioms/), and maintain a complete [provenance](/glossary/provenance-mandatory/) chain from source to conclusion. No claim is accepted without verifiable evidence. No exceptions.

The demand for verifiable evidence arises from a specific failure mode in AI-assisted systems: the gap between confidence and truth. A language model can express high confidence in a statement that is factually incorrect. A statistical analysis can produce a p-value below 0.05 for a spurious correlation. A security scanner can report zero vulnerabilities in a system that is fundamentally compromised. In each case, the system produces an output that looks like evidence but lacks the properties required for reliable decision-making: traceability to independent sources, structural coherence with existing knowledge, and logical necessity given the premises.

The Prismatic Platform's epistemic framework, [NABLA Infinity](/glossary/nabla-infinity/), addresses this gap by encoding the requirements for verifiable evidence into seven non-negotiable axioms. These axioms are not guidelines to be followed when convenient -- they are hard enforcement rules implemented in the platform's verification pipeline. Violations trigger blocking responses: operations halt, conclusions are rejected, and the system demands correction before proceeding.

## The Seven NABLA Axioms

The [NABLA axioms](/glossary/nabla-axioms/) define the minimum requirements for any piece of evidence to be considered verifiable:

### Axiom 1: Signal Plurality

**Requirement**: Every belief must be supported by a minimum of two independent signals.

[Signal Plurality](/glossary/signal-plurality/) prevents single-source trust. A claim supported by only one source -- no matter how authoritative that source appears -- cannot be verified because there is no independent confirmation. The platform requires at least two signals from independent origins before any belief transitions from hypothesis to accepted conclusion.

```elixir
defmodule PrismaticNabla.SignalPlurality do
  @moduledoc """
  Signal Plurality enforcement.
  Verifies that every belief is supported by at least two independent signals.
  """

  @type signal :: %{
    source: String.t(),
    content: term(),
    timestamp: DateTime.t(),
    confidence: float(),
    independent_from: list(String.t())
  }

  @spec verify(list(signal())) :: {:ok, :plural} | {:error, :insufficient_signals}
  def verify(signals) when length(signals) >= 2 do
    if independent_sources?(signals) do
      {:ok, :plural}
    else
      {:error, :insufficient_signals}
    end
  end

  def verify(_signals), do: {:error, :insufficient_signals}

  @spec independent_sources?(list(signal())) :: boolean()
  defp independent_sources?(signals) do
    sources = Enum.map(signals, & &1.source)

    # Check that at least two signals come from independent sources
    # (not derived from each other)
    Enum.any?(signals, fn signal ->
      Enum.any?(signals, fn other ->
        other.source != signal.source and
          other.source not in signal.independent_from and
          signal.source not in other.independent_from
      end)
    end)
  end
end
```

### Axiom 2: Contradiction Preservation

**Requirement**: When contradictory evidence exists, both sides must be preserved. Never discard inconvenient truths.

This axiom prevents cherry-picking. When evidence contradicts an existing belief, the natural human tendency is to dismiss the contradicting evidence or rationalize it away. NABLA Infinity requires that contradictions be explicitly preserved in the evidence graph, annotated with their sources and confidence levels, and presented to the decision-maker without editorial smoothing.

```elixir
defmodule PrismaticNabla.ContradictionPreservation do
  @moduledoc """
  Contradiction Preservation enforcement.
  Maintains contradictory evidence without resolution.
  """

  @type evidence :: %{
    claim: String.t(),
    direction: :supports | :contradicts,
    source: String.t(),
    confidence: float()
  }

  @spec verify_preservation(list(evidence())) :: {:ok, :preserved} | {:error, :contradiction_buried}
  def verify_preservation(evidence_list) do
    directions = evidence_list |> Enum.map(& &1.direction) |> Enum.uniq()

    cond do
      length(directions) <= 1 ->
        # No contradiction to preserve -- check passes
        {:ok, :preserved}

      both_sides_present?(evidence_list) ->
        # Contradiction exists and both sides are preserved
        {:ok, :preserved}

      true ->
        # Contradiction detected but one side is missing
        {:error, :contradiction_buried}
    end
  end

  defp both_sides_present?(evidence_list) do
    has_support = Enum.any?(evidence_list, &(&1.direction == :supports))
    has_contradiction = Enum.any?(evidence_list, &(&1.direction == :contradicts))
    has_support and has_contradiction
  end
end
```

### Axiom 3: Absence Informative

**Requirement**: Missing signals are tracked as data, not ignored.

The absence of evidence is itself evidence. If a security scanner reports no findings for a system that has never been scanned before, the absence of findings is not the same as confirmation of security. NABLA Infinity tracks what was NOT found and what was NOT examined, treating gaps in coverage as information that affects confidence calculations.

### Axiom 4: Time Decay

**Requirement**: All beliefs carry mandatory timestamps. Older evidence degrades in confidence unless refreshed.

Evidence from last year is less reliable than evidence from today. NABLA Infinity implements temporal decay: evidence confidence decreases over time according to a configurable decay function. A security rating from 90 days ago cannot justify the same confidence as a rating computed today.

```elixir
defmodule PrismaticNabla.TimeDecay do
  @moduledoc """
  Time decay calculation for evidence freshness.
  """

  @decay_half_life_days 30

  @spec apply_decay(float(), DateTime.t()) :: float()
  def apply_decay(original_confidence, evidence_timestamp) do
    age_days = DateTime.diff(DateTime.utc_now(), evidence_timestamp, :day)

    decay_factor = :math.pow(0.5, age_days / @decay_half_life_days)

    original_confidence * decay_factor
  end
end
```

### Axiom 5: Unknown Valid

**Requirement**: "I don't know" is a legitimate and required state. Do not fabricate certainty.

This axiom prevents false confidence. When the evidence is insufficient to support a conclusion, the system must report uncertainty rather than guessing. The statement "insufficient evidence to determine" is more valuable than a confident answer that may be wrong.

### Axiom 6: Source Independence

**Requirement**: Evidence from independent sources is weighted higher than correlated sources.

Two studies citing the same underlying dataset are not independent. A news article and its source paper are not independent. NABLA Infinity tracks source dependencies and adjusts confidence weights accordingly. Truly independent confirmation is weighted higher than echo-chamber amplification.

### Axiom 7: Provenance Mandatory

**Requirement**: All beliefs must be traceable to their original sources. No untraceable claims.

[Provenance Mandatory](/glossary/provenance-mandatory/) is the keystone axiom. Every piece of evidence in the platform must carry a complete provenance chain: who created it, when, from what sources, through what transformations. A conclusion without provenance is an assertion, not evidence. Assertions are inadmissible in the NABLA framework.

```elixir
defmodule PrismaticNabla.Provenance do
  @moduledoc """
  Provenance tracking for evidence chain integrity.
  Every evidence node must have a complete provenance record.
  """

  @type provenance :: %{
    evidence_id: String.t(),
    source_type: :primary | :derived | :aggregated,
    original_sources: list(String.t()),
    transformations: list(transformation()),
    created_at: DateTime.t(),
    created_by: String.t(),
    confidence_at_creation: float()
  }

  @type transformation :: %{
    type: :filter | :aggregate | :normalize | :enrich,
    description: String.t(),
    applied_at: DateTime.t(),
    applied_by: String.t()
  }

  @spec verify_provenance(provenance()) :: {:ok, :complete} | {:error, :incomplete_provenance}
  def verify_provenance(provenance) do
    checks = [
      has_source_type?(provenance),
      has_original_sources?(provenance),
      has_timestamps?(provenance),
      has_creator?(provenance),
      transformations_documented?(provenance)
    ]

    if Enum.all?(checks) do
      {:ok, :complete}
    else
      failed = Enum.zip([:source_type, :sources, :timestamps, :creator, :transformations], checks)
               |> Enum.reject(fn {_name, result} -> result end)
               |> Enum.map(fn {name, _} -> name end)

      {:error, {:incomplete_provenance, missing: failed}}
    end
  end

  defp has_source_type?(%{source_type: type}) when type in [:primary, :derived, :aggregated], do: true
  defp has_source_type?(_), do: false

  defp has_original_sources?(%{original_sources: sources}) when is_list(sources) and length(sources) > 0, do: true
  defp has_original_sources?(_), do: false

  defp has_timestamps?(%{created_at: %DateTime{}}), do: true
  defp has_timestamps?(_), do: false

  defp has_creator?(%{created_by: creator}) when is_binary(creator) and byte_size(creator) > 0, do: true
  defp has_creator?(_), do: false

  defp transformations_documented?(%{transformations: []}), do: true
  defp transformations_documented?(%{source_type: :primary}), do: true
  defp transformations_documented?(%{transformations: transforms}) when is_list(transforms) do
    Enum.all?(transforms, fn t ->
      is_binary(t.description) and byte_size(t.description) > 0
    end)
  end
  defp transformations_documented?(_), do: false
end
```

## Trinity Gate Verification

The [Trinity Gate](/glossary/trinity-gate/) is where verifiable evidence is subjected to its most rigorous test. Every conclusion derived from evidence must pass three independent verification gates plus a meta-integrity layer.

### Gate 1: Structural Consistency

Verifies that the evidence network forms a valid directed acyclic graph (DAG). Circular reasoning (A supports B, B supports A) is a structural failure. Every conclusion must trace back to evidence nodes through valid edges.

### Gate 2: Logical Consistency

Verifies that inference rules applied to the evidence are sound. Conclusions must follow from premises. [NABLA axioms](/glossary/nabla-axioms/) must not be violated at any inference step. Hidden assumptions are detected and flagged.

### Gate 3: Formal Necessity

The most rigorous gate. Uses modal logic and Lean4 formal proofs to determine whether conclusions are **necessary** (must be true given the evidence) rather than merely probable. For critical decisions, probability is insufficient -- necessity is required.

### Meta-Integrity Layer

Validates the verification process itself. Ensures gates are operating independently, verification covers the full scope of the claim, and no bypass or weakening has occurred.

```elixir
defmodule PrismaticNabla.TrinityGate do
  @moduledoc """
  Trinity Gate verification pipeline.
  All three gates plus meta-integrity must pass for a conclusion
  to transition from hypothesis to accepted belief.
  """

  @type conclusion :: %{
    claim: String.t(),
    evidence: list(map()),
    confidence: float(),
    provenance: map()
  }

  @type gate_result :: {:pass, map()} | {:fail, String.t()}
  @type verification_result :: {:ok, :trinity_passed} | {:error, {:gate_failed, atom(), String.t()}}

  @spec verify(conclusion()) :: verification_result()
  def verify(conclusion) do
    with {:structural, {:pass, _}} <- {:structural, check_structural(conclusion)},
         {:logical, {:pass, _}} <- {:logical, check_logical(conclusion)},
         {:formal, {:pass, _}} <- {:formal, check_formal(conclusion)},
         {:meta, {:pass, _}} <- {:meta, check_meta_integrity(conclusion)} do
      {:ok, :trinity_passed}
    else
      {gate, {:fail, reason}} ->
        :telemetry.execute(
          [:prismatic, :trinity_gate, :failure],
          %{},
          %{gate: gate, reason: reason, claim: conclusion.claim}
        )

        {:error, {:gate_failed, gate, reason}}
    end
  end

  @spec check_structural(conclusion()) :: gate_result()
  defp check_structural(conclusion) do
    # Verify evidence graph is a valid DAG
    # Check for circular reasoning
    # Ensure all conclusions trace to evidence nodes
    case build_evidence_dag(conclusion.evidence) do
      {:ok, dag} ->
        if acyclic?(dag) and fully_connected?(dag) do
          {:pass, %{dag_nodes: length(dag.nodes), dag_edges: length(dag.edges)}}
        else
          {:fail, "Evidence graph contains cycles or disconnected nodes"}
        end

      {:error, reason} ->
        {:fail, "Failed to build evidence DAG: #{reason}"}
    end
  end

  @spec check_logical(conclusion()) :: gate_result()
  defp check_logical(conclusion) do
    # Verify inference rules are sound
    # Check NABLA axiom compliance at every step
    # Detect hidden assumptions
    axiom_results = [
      PrismaticNabla.SignalPlurality.verify(conclusion.evidence),
      PrismaticNabla.ContradictionPreservation.verify_preservation(conclusion.evidence),
      PrismaticNabla.Provenance.verify_provenance(conclusion.provenance)
    ]

    case Enum.find(axiom_results, &match?({:error, _}, &1)) do
      nil -> {:pass, %{axioms_checked: length(axiom_results)}}
      {:error, reason} -> {:fail, "Axiom violation: #{inspect(reason)}"}
    end
  end

  @spec check_formal(conclusion()) :: gate_result()
  defp check_formal(conclusion) do
    # For critical decisions (confidence >= 0.95), apply formal necessity
    # For standard operations, structural + logical sufficiency
    if conclusion.confidence >= 0.95 do
      case formal_proof_attempt(conclusion) do
        {:proved, proof} -> {:pass, %{proof_type: :formal, proof: proof}}
        {:unproved, reason} -> {:fail, "Formal proof failed: #{reason}"}
      end
    else
      {:pass, %{proof_type: :confidence_sufficient}}
    end
  end

  @spec check_meta_integrity(conclusion()) :: gate_result()
  defp check_meta_integrity(_conclusion) do
    # Verify gates operated independently
    # Verify full scope was covered
    # Self-consistency audit
    {:pass, %{meta_checks: [:independence, :completeness, :self_consistency]}}
  end

  # Private helper stubs for illustration
  defp build_evidence_dag(evidence), do: {:ok, %{nodes: evidence, edges: []}}
  defp acyclic?(_dag), do: true
  defp fully_connected?(_dag), do: true
  defp formal_proof_attempt(_conclusion), do: {:proved, :trivial}
end
```

## Confidence Scoring

Verifiable evidence is not binary (verified/unverified) but graduated. The [confidence threshold](/glossary/confidence-threshold/) system assigns numeric scores to evidence quality and determines what actions are permitted at each confidence level.

### Confidence Levels

| Threshold | Context | Trinity Gate | Actions Permitted |
|-----------|---------|-------------|-------------------|
| 0.95 | Critical decisions | MANDATORY (all gates + meta) | Production deploy, security assessment, compliance determination |
| 0.80 | Standard operations | MANDATORY (all gates + meta) | Routine processing, agent decisions, data updates |
| 0.60 | Exploratory analysis | RECOMMENDED | Research, hypothesis generation, pattern exploration |
| 0.50 | Research queries | OPTIONAL | Speculative analysis, early investigation |

### Confidence Computation

```elixir
defmodule PrismaticNabla.ConfidenceScoring do
  @moduledoc """
  Computes confidence scores for evidence-backed conclusions.
  Incorporates signal plurality, source independence, temporal decay,
  and contradiction impact.
  """

  @spec compute(list(map())) :: float()
  def compute(evidence_items) when is_list(evidence_items) do
    base_confidence = base_score(evidence_items)
    plurality_bonus = plurality_factor(evidence_items)
    independence_bonus = independence_factor(evidence_items)
    decay_penalty = temporal_decay_factor(evidence_items)
    contradiction_penalty = contradiction_factor(evidence_items)

    (base_confidence * plurality_bonus * independence_bonus * decay_penalty - contradiction_penalty)
    |> max(0.0)
    |> min(1.0)
  end

  defp base_score(items) do
    if items == [] do
      0.0
    else
      items
      |> Enum.map(& &1.confidence)
      |> Enum.sum()
      |> Kernel./(length(items))
    end
  end

  defp plurality_factor(items) do
    source_count = items |> Enum.map(& &1.source) |> Enum.uniq() |> length()

    case source_count do
      0 -> 0.0
      1 -> 0.6   # Single source penalty
      2 -> 1.0   # Minimum plurality met
      n -> min(1.0 + (n - 2) * 0.05, 1.2)  # Bonus for additional sources, capped
    end
  end

  defp independence_factor(items) do
    # Truly independent sources boost confidence
    # Correlated sources provide diminishing returns
    independent_pairs = count_independent_pairs(items)
    min(0.8 + independent_pairs * 0.1, 1.2)
  end

  defp temporal_decay_factor(items) do
    if items == [] do
      0.0
    else
      items
      |> Enum.map(fn item -> PrismaticNabla.TimeDecay.apply_decay(1.0, item.timestamp) end)
      |> Enum.sum()
      |> Kernel./(length(items))
    end
  end

  defp contradiction_factor(items) do
    contradicting = Enum.count(items, &(&1.direction == :contradicts))
    supporting = Enum.count(items, &(&1.direction == :supports))

    if supporting == 0, do: 0.5, else: contradicting / (supporting + contradicting) * 0.3
  end

  defp count_independent_pairs(items) do
    for a <- items, b <- items, a.source != b.source, a.source not in (b[:dependent_on] || []),
        reduce: 0 do
      acc -> acc + 1
    end
    |> div(2)  # Each pair counted twice
  end
end
```

## Evidence in OSINT Operations

The Prismatic Platform's OSINT capabilities (120 tools across 7 categories) produce evidence that must meet NABLA standards. Every OSINT finding carries provenance metadata.

### OSINT Evidence Structure

```elixir
@type osint_evidence :: %{
  tool: String.t(),           # e.g., "ARES", "Shodan", "VirusTotal"
  category: atom(),           # :czech | :global | :sanctions | :eu | :uk | :us
  query: String.t(),          # The search query that produced this result
  result: term(),             # The raw result data
  confidence: float(),        # Tool-specific confidence rating
  timestamp: DateTime.t(),    # When the query was executed
  provenance: %{
    source_type: :primary,
    original_sources: [String.t()],
    transformations: [],
    created_by: String.t()
  }
}
```

### Cross-Source Verification

When multiple OSINT tools return information about the same entity, the platform's evidence pipeline automatically cross-references the results:

| Scenario | Evidence Action | Confidence Impact |
|----------|----------------|-------------------|
| Two tools agree | Signal plurality confirmed | Confidence increases |
| Two tools disagree | Contradiction preserved | Both results retained with annotation |
| One tool returns data, one returns nothing | Absence tracked | Confidence unchanged, gap noted |
| Tool returns stale data (> 30 days) | Time decay applied | Confidence reduced by decay factor |

## Enforcement Protocol

Violations of evidence verifiability requirements trigger escalating enforcement:

| Level | Trigger | Response | Authority |
|-------|---------|----------|-----------|
| E1 | Soft axiom violation (exploratory context) | Warning + correction request | Agent |
| E2 | Hard axiom violation (single source belief, missing provenance) | BLOCK + rejection | System |
| E3 | Trinity Gate failure in mandatory context | HALT + review required | Supreme |
| E4 | Multiple axiom violations or meta-integrity failure | Investigation + full audit | Cosmic |

### Anti-Patterns (Forbidden)

| Pattern | Description | Enforcement |
|---------|-------------|-------------|
| Cherry Picking | Selecting only supporting evidence | E2 BLOCK |
| False Certainty | Claims without adequate proof | E2 BLOCK |
| Contradiction Burial | Hiding inconvenient contradictions | E3 HALT |
| Single Source Truth | Believing without plurality | E2 BLOCK |
| Reasoning Opacity | Decisions without traceable provenance | E2 BLOCK |

## Best Practices

**Always trace to primary sources.** Secondary sources (summaries, aggregations, reports citing other reports) introduce interpretation layers that may distort the original evidence. Whenever possible, trace back to the primary data source and verify directly.

**Timestamp everything.** Evidence without timestamps cannot be subjected to time decay analysis. Every observation, measurement, and conclusion must carry the datetime of creation. Use UTC exclusively to avoid timezone ambiguity.

**Preserve contradictions explicitly.** When new evidence contradicts existing beliefs, do not discard either side. Create an explicit contradiction record that documents both positions, their respective evidence, and their confidence levels. Resolution comes through additional evidence, not through editorial choice.

**Separate observation from interpretation.** Raw observations ("the scanner found port 443 open") are evidence. Interpretations ("the system is secure because port 443 uses TLS") are conclusions that must be verified. Keep these distinct in the evidence chain.

## Related Concepts

- [Evidence](/glossary/evidence/) -- General concept of evidence in the platform
- [Evidence Over Opinion](/glossary/evidence-over-opinion/) -- Principle prioritizing evidence-backed claims
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Axiom requiring complete evidence traceability
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing evidence standards
- [NABLA Axioms](/glossary/nabla-axioms/) -- The seven non-negotiable axioms for evidence
- [Trinity Gate](/glossary/trinity-gate/) -- Three-layer verification mechanism for conclusions
- [Signal Plurality](/glossary/signal-plurality/) -- Minimum two independent sources requirement
- [Confidence Threshold](/glossary/confidence-threshold/) -- Numeric confidence levels for evidence quality
- [Confidence Scoring](/glossary/confidence-scoring/) -- Computation of evidence confidence scores
- [Quality Evidence Truth](/glossary/quality-evidence-truth/) -- Platform's truth-verification standards

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
