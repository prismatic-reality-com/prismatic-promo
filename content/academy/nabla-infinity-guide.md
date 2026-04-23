+++
title = "Applying NABLA Infinity Axioms"
weight = 6
[extra]
description = "Practical guide to the 7 epistemic axioms, Trinity Gate validation, and confidence thresholds"
category = "intermediate"
difficulty = "intermediate"
duration = "55 min"
prerequisites = ["quality-standards", "first-agent"]
glossary_terms = ["nabla-infinity", "trinity-gate", "no-mercy", "no-doubts", "confidence-threshold", "aiad"]
technologies = ["elixir", "lean4"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1154
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Applying", "NABLA", "Infinity", "Axioms", "Practical", "Trinity", "Gate", "academy", "intermediate", "Prismatic Platform"]
tags = ["academy", "intermediate", "applying-nabla-infinity-axioms", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Applying NABLA Infinity Axioms - Prismatic Platform"
+++

## Overview

[NABLA Infinity](@/glossary/nabla-infinity.md) is the epistemic framework that governs how the Prismatic Platform forms beliefs, evaluates evidence, and makes decisions. While [NO MERCY, NO DOUBTS](@/academy/quality-standards.md) governs code quality, NABLA Infinity governs knowledge quality. This guide teaches you to apply the 7 axioms in your agent implementations, validate claims through the [Trinity Gate](@/glossary/trinity-gate.md), and calibrate confidence thresholds for different decision contexts.

You will learn:

- The 7 non-negotiable axioms and how to encode them in agent logic
- How the Trinity Gate validates claims through three independent checks
- Confidence threshold calibration for critical vs. exploratory decisions
- The Addiction Preservation principle: why contradictions are preserved, not resolved
- How NABLA integrates with the NO MERCY execution phase

## Prerequisites

- Completed [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md)
- Completed [Building Your First Autonomous Agent](@/academy/first-agent.md)
- Conceptual understanding of epistemic reasoning (forming justified beliefs)

## Core Concepts

### The 7 Non-Negotiable Axioms

These axioms are encoded at the DNA level of the platform. They are not guidelines -- they are hard constraints that block processing when violated:

**Axiom 1: Signal Plurality.** No belief is established from a single signal. Minimum two independent signals are required. If one sensor says "the server is down" but all other indicators show normal operation, the belief "server is down" cannot be established.

**Axiom 2: Contradiction Preservation.** When signals contradict, both are preserved. The platform never silently discards inconvenient evidence. If Port Scanner says "port 443 is open" and Certificate Checker says "no TLS service responds," both findings are recorded and surfaced.

**Axiom 3: Absence Informative.** Missing data is data. If a DNS query returns no results, that absence is tracked as a signal, not ignored. An agent that expected to find evidence and found none must report the absence.

**Axiom 4: Time Decay.** All beliefs have timestamps and decay over time. A security assessment from 6 months ago carries less weight than one from today. Stale data is explicitly flagged and eventually expires.

**Axiom 5: Unknown Valid.** "I don't know" is a legitimate state. Agents are not forced to produce answers when evidence is insufficient. An honest unknown is superior to a fabricated certainty.

**Axiom 6: Source Independence.** Independent sources are weighted higher than correlated sources. Two findings from the same scanner carry less weight than one finding from each of two different scanners.

**Axiom 7: Provenance Mandatory.** Every belief must be traceable to its source evidence. No "magic numbers" or unexplained conclusions. If a security score is 780, the system can explain exactly which findings contributed and with what weights.

### The Trinity Gate

No claim is established without passing all three Trinity Gate checks:

1. **Structural Consistency** -- the belief network forms a valid directed acyclic graph (no circular reasoning)
2. **Logical Consistency** -- propositions follow logical rules (no contradictions in established beliefs)
3. **Formal Necessity** -- for critical claims, formal proofs in Lean4 verify the reasoning chain

### Confidence Thresholds

Different decision contexts require different levels of certainty:

| Context | Threshold | Trinity Gate |
|---------|-----------|-------------|
| Critical Decisions (deploy to production) | 0.95 | Mandatory |
| Standard Operations (update configuration) | 0.80 | Mandatory |
| Exploratory Analysis (investigate anomaly) | 0.60 | Recommended |
| Research Queries (hypothesis testing) | 0.50 | Optional |

## Step-by-Step Guide

### Step 1: Implement Signal Plurality

Design your agents to require multiple independent signals before establishing beliefs:

```elixir
defmodule PrismaticAgents.BeliefEngine do
  @moduledoc """
  Implements NABLA Infinity axioms for belief formation.
  No belief is established without satisfying all applicable axioms.
  """

  @type signal :: %{
          source: atom(),
          value: term(),
          confidence: float(),
          timestamp: DateTime.t(),
          provenance: String.t()
        }

  @type belief :: %{
          claim: String.t(),
          confidence: float(),
          signals: [signal()],
          contradictions: [signal()],
          established_at: DateTime.t() | nil,
          status: :established | :pending | :contested | :unknown
        }

  @spec evaluate_signals(String.t(), [signal()]) :: belief()
  def evaluate_signals(claim, signals) do
    # Axiom 1: Signal Plurality -- need at least 2 signals
    if length(signals) < 2 do
      %{
        claim: claim,
        confidence: 0.0,
        signals: signals,
        contradictions: [],
        established_at: nil,
        status: :pending
      }
    else
      {supporting, contradicting} = partition_signals(claim, signals)
      confidence = calculate_confidence(supporting, contradicting)
      status = determine_status(confidence, contradicting)

      %{
        claim: claim,
        confidence: confidence,
        signals: supporting,
        contradictions: contradicting,
        established_at: if(status == :established, do: DateTime.utc_now()),
        status: status
      }
    end
  end

  # Axiom 6: Source Independence -- weight independent sources higher
  defp calculate_confidence(supporting, contradicting) do
    unique_sources = supporting |> Enum.map(& &1.source) |> Enum.uniq() |> length()
    total_sources = length(supporting) + length(contradicting)

    base_confidence = length(supporting) / max(total_sources, 1)

    # Independence bonus: more unique sources = higher confidence
    independence_factor = unique_sources / max(length(supporting), 1)

    # Axiom 4: Time Decay -- recent signals weighted higher
    recency_factor = calculate_recency_factor(supporting)

    base_confidence * independence_factor * recency_factor
  end

  # Axiom 4: Time Decay
  defp calculate_recency_factor(signals) do
    now = DateTime.utc_now()

    signals
    |> Enum.map(fn signal ->
      age_hours = DateTime.diff(now, signal.timestamp, :hour)
      # Exponential decay: half-life of 24 hours
      :math.exp(-0.029 * age_hours)
    end)
    |> then(fn factors -> Enum.sum(factors) / max(length(factors), 1) end)
  end

  # Axiom 2: Contradiction Preservation
  defp partition_signals(claim, signals) do
    Enum.split_with(signals, fn signal ->
      signal_supports_claim?(signal, claim)
    end)
  end

  defp determine_status(confidence, contradictions) do
    cond do
      length(contradictions) > 0 and confidence < 0.80 -> :contested
      confidence >= 0.80 -> :established
      confidence > 0.0 -> :pending
      true -> :unknown
    end
  end

  defp signal_supports_claim?(signal, _claim) do
    signal.confidence > 0.5
  end
end
```

### Step 2: Implement Trinity Gate Validation

```elixir
defmodule PrismaticAgents.TrinityGate do
  @moduledoc """
  Three-layer validation gate. No claim passes without
  satisfying all three checks.
  """

  @type gate_result :: %{
          structural: boolean(),
          logical: boolean(),
          formal: boolean(),
          passed: boolean(),
          failures: [String.t()]
        }

  @spec validate(map(), map()) :: gate_result()
  def validate(claim, belief_network) do
    structural = check_structural_consistency(claim, belief_network)
    logical = check_logical_consistency(claim, belief_network)
    formal = check_formal_necessity(claim)

    failures =
      []
      |> then(fn f -> if structural, do: f, else: ["Structural: circular dependency detected" | f] end)
      |> then(fn f -> if logical, do: f, else: ["Logical: contradicts established belief" | f] end)
      |> then(fn f -> if formal, do: f, else: ["Formal: proof obligation not satisfied" | f] end)

    %{
      structural: structural,
      logical: logical,
      formal: formal,
      passed: structural and logical and formal,
      failures: failures
    }
  end

  # Check 1: Belief network forms a valid DAG
  defp check_structural_consistency(claim, network) do
    dependencies = Map.get(network, :dependencies, %{})
    not has_cycle?(claim.id, dependencies, MapSet.new())
  end

  # Check 2: No contradictions with established beliefs
  defp check_logical_consistency(claim, network) do
    established = Map.get(network, :established_beliefs, [])

    not Enum.any?(established, fn belief ->
      contradicts?(claim, belief)
    end)
  end

  # Check 3: Formal proof obligation (for critical claims)
  defp check_formal_necessity(claim) do
    if claim.criticality == :critical do
      # In production, this delegates to QEVE/Lean4
      Map.get(claim, :formal_proof, nil) != nil
    else
      true
    end
  end

  defp has_cycle?(_node, _deps, _visited), do: false
  defp contradicts?(_a, _b), do: false
end
```

### Step 3: Apply Confidence Thresholds in Decisions

```elixir
defmodule PrismaticAgents.DecisionEngine do
  @moduledoc """
  Makes decisions based on belief confidence and context.
  Transitions from NABLA exploration to NO MERCY execution
  only when confidence threshold and Trinity Gate are satisfied.
  """

  alias PrismaticAgents.{BeliefEngine, TrinityGate}

  @thresholds %{
    critical: 0.95,
    standard: 0.80,
    exploratory: 0.60,
    research: 0.50
  }

  @spec decide(String.t(), [BeliefEngine.signal()], atom(), map()) ::
          {:execute, map()} | {:hold, map()} | {:unknown, map()}
  def decide(claim, signals, context, belief_network) do
    belief = BeliefEngine.evaluate_signals(claim, signals)
    threshold = Map.fetch!(@thresholds, context)
    gate = TrinityGate.validate(%{id: claim, criticality: context}, belief_network)

    cond do
      belief.confidence >= threshold and gate.passed ->
        {:execute, %{belief: belief, gate: gate, action: :proceed}}

      belief.status == :unknown ->
        {:unknown, %{belief: belief, gate: gate, action: :gather_more_evidence}}

      true ->
        {:hold, %{belief: belief, gate: gate, action: :wait_for_confidence}}
    end
  end
end
```

### Step 4: Preserve Contradictions (Addiction Preservation)

```elixir
# WRONG: resolving contradictions by discarding one side
def handle_contradicting_signals(signal_a, signal_b) do
  if signal_a.confidence > signal_b.confidence do
    signal_a  # VIOLATION: discards signal_b
  else
    signal_b
  end
end

# CORRECT: preserving both signals with their full context
def handle_contradicting_signals(signal_a, signal_b) do
  %{
    status: :contested,
    supporting: signal_a,
    contradicting: signal_b,
    resolution: :pending,
    requires_additional_evidence: true
  }
end
```

## Common Pitfalls

**Resolving contradictions prematurely.** The Addiction Preservation doctrine requires that contradictory signals be maintained until genuinely resolved by additional evidence. Picking the "more confident" signal is a violation.

**Treating absence as negation.** "No evidence of a vulnerability" is not the same as "evidence of no vulnerability." Axiom 3 (Absence Informative) tracks the absence itself as a data point.

**Ignoring time decay.** A finding from last year is not equivalent to a finding from today. All beliefs must carry timestamps and be subject to decay weighting.

**Single-source beliefs.** No matter how confident a single agent is, one source is never sufficient. Axiom 1 requires minimum two independent signals.

## Exercises

1. **Implement time decay.** Create a function that accepts a list of signals and returns only those within a configurable freshness window, flagging expired ones.

2. **Build a provenance tracker.** Extend the `BeliefEngine` to maintain a full provenance chain: which signals led to which beliefs, and which beliefs support which decisions.

3. **Simulate conflicting agents.** Create two L1 agents that produce contradicting findings for the same domain. Build an L2 orchestrator that properly preserves both and reports the contested status.

4. **Test Trinity Gate failures.** Write tests that verify each of the three Trinity Gate checks fails independently when its condition is violated.

## Summary

NABLA Infinity provides the epistemic foundation that ensures the platform's knowledge quality matches its code quality. The 7 axioms prevent common reasoning failures: single-source bias, contradiction burial, stale evidence, and opaque reasoning. The Trinity Gate adds structural, logical, and formal validation. Together, they ensure that when the platform transitions from exploration to execution, the decision is justified by evidence, not assumption.

## Practical Implementation

### In Prismatic Platform

NABLA Infinity axioms are enforced through these applications:

- **prismatic_nabla** (`apps/prismatic_nabla/`) -- Core implementation of the 7 axioms, belief engine, confidence calculation, and time decay functions. Contains the `PrismaticNabla` facade module for axiom validation and belief formation
- **prismatic_trinity_nexus** (`apps/prismatic_trinity_nexus/`) -- Trinity Gate implementation with structural consistency (DAG validation), logical consistency (proposition verification), and formal necessity (Lean4 delegation). Houses 629 trinity entities
- **prismatic_deduction** (`apps/prismatic_deduction/`) -- Formal deduction engine supporting logical reasoning chains with provenance tracking (Axiom 7)
- **prismatic_lean4** (`apps/prismatic_lean4/`) -- Lean4 formal proof integration for QEVE Level 3 verification, the mathematical certainty layer of the Trinity Gate
- **prismatic_signals** (`apps/prismatic_signals/`) -- Signal processing infrastructure for plurality enforcement (Axiom 1), source independence weighting (Axiom 6), and contradiction detection (Axiom 2)

### Code Examples from the Codebase

The Addiction Preservation doctrine is implemented as a policy:

```elixir
# From .aiad/doctrine/addiction-preservation.doctrine.md
# Contradictions are NEVER silently discarded
# Both sides preserved until resolution by additional evidence

# Practical pattern in agent code:
case evaluate_signals(claim, signals) do
  %{status: :contested, contradictions: contras} ->
    # Preserve both sides, request additional evidence
    {:hold, %{contradictions: contras, requires_additional_evidence: true}}
  %{status: :established, confidence: conf} when conf >= 0.95 ->
    {:execute, %{confidence: conf}}  # Transition to NO MERCY execution
end
```

Confidence thresholds govern the NABLA-to-NM/ND transition:

```elixir
# Transition protocol
# EXPLORATION (NABLA: maps uncertainty, preserves contradictions)
#     |
# confidence >= 0.95 AND trinity_gate.passed AND axioms_compliant
#     |
# EXECUTION (decisive action, complete delivery, NO MERCY enforcement)
```

## See Also

### Related Applications
- [prismatic_nabla](@/apps/prismatic-nabla.md) -- Core NABLA Infinity axiom implementation
- **prismatic_trinity_nexus** (`apps/prismatic_trinity_nexus/`) -- Trinity Gate 3-layer validation
- [prismatic_deduction](@/apps/prismatic-deduction.md) -- Formal deduction and reasoning chains
- [prismatic_lean4](@/apps/prismatic-lean4.md) -- Lean4 formal proof verification
- [prismatic_signals](@/apps/prismatic-signals.md) -- Signal processing for axiom enforcement

### Glossary
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework itself
- [Trinity Gate](@/glossary/trinity-gate.md) -- 3-layer claim validation gate
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom 1: minimum 2 independent signals
- [Time Decay](@/glossary/time-decay.md) -- Axiom 4: belief freshness enforcement
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom 7: all beliefs traceable
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Context-dependent certainty levels
- [Cherry Picking](@/glossary/cherry-picking.md) -- Anti-pattern: selecting only supporting evidence
- [Belief Graph](@/glossary/belief-graph.md) -- DAG structure for structural consistency checking
- [Theorem Proving](@/glossary/theorem-proving.md) -- Formal verification underlying Trinity Gate

### Architecture
- [NABLA Framework](@/architecture/nabla-framework.md) -- Architectural overview of the epistemic framework

### Related Academy Topics
- [Formal Verification with Lean4](@/academy/formal-verification-guide.md) -- The formal proof layer of the Trinity Gate
- [Color Team Security](@/academy/color-team-security.md) -- NABLA axioms applied to adversarial analysis
- [Self-Evolving Ecosystems](@/academy/evolution-patterns.md) -- How NABLA governs evolutionary fitness
- [Quality Standards](@/academy/quality-standards.md) -- NO MERCY execution phase that NABLA transitions into

## Next Steps

- [Formal Verification with Lean4](@/academy/formal-verification-guide.md) -- the formal proof layer of the Trinity Gate
- [Color Team Security Operations](@/academy/color-team-security.md) -- NABLA axioms applied to adversarial analysis
- [Self-Evolving Agent Ecosystems](@/academy/evolution-patterns.md) -- how NABLA governs evolutionary fitness evaluation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)