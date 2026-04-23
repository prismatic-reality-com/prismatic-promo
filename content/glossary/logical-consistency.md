+++
title = "Logical Consistency"
weight = 50
[extra]
tags = ["glossary", "epistemic", "verification", "trinity-gate", "nabla", "formal-methods", "reasoning", "quality"]
description = "Logical consistency is the property of a belief system, codebase, or knowledge graph where no proposition contradicts another, enforced in the Prismatic Platform through the Trinity Gate's second verification layer using rule-based reasoning."
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["structural-consistency", "formal-necessity", "trinity-gate", "nabla-infinity", "contradiction-preservation", "epistemic-reasoning", "belief-graph", "modal-logic", "formal-verification", "quality-gates"]
keywords = ["logical consistency", "formal logic", "rule-based reasoning", "contradiction detection", "Trinity Gate", "epistemic verification", "propositional logic", "predicate logic", "belief networks", "deductive reasoning"]
testing_scenarios = ["contradiction detection in belief graphs", "logical implication chain verification", "modus ponens validation across proposition sets", "circular reasoning detection", "consistency maintenance under concurrent belief updates"]
prerequisites = ["belief-graph", "epistemic-reasoning", "trinity-gate"]
learning_path = ["epistemic-reasoning", "structural-consistency", "logical-consistency", "formal-necessity", "trinity-gate", "nabla-infinity"]
date_created = "2026-02-22"
word_count = 1848
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Logical Consistency - Prismatic Platform"
+++

## Definition

**Logical consistency** is the property of a system of propositions, beliefs, or assertions in which no statement contradicts any other statement within the system. A logically consistent system is one where it is impossible to derive both a proposition P and its negation NOT P from the set of accepted premises. In formal terms, a set of sentences S is logically consistent if and only if there exists at least one interpretation under which all sentences in S are simultaneously true.

Within the Prismatic Platform, logical consistency serves as the second verification layer of the Trinity Gate -- the three-part epistemic verification framework that every claim must pass before being accepted as established knowledge. While structural consistency (the first gate) verifies that the belief network forms a valid directed acyclic graph, logical consistency ensures that the propositions within that graph obey the rules of formal logic. No contradictory claims can coexist, no circular reasoning can persist, and no invalid inference chains can be accepted.

## Overview

Logical consistency is one of the oldest and most fundamental concepts in philosophy, mathematics, and computer science. Aristotle's Law of Non-Contradiction (circa 350 BCE) states that a thing cannot both be and not be at the same time and in the same respect. This principle has served as the bedrock of Western logic for over two millennia and remains essential in formal verification, database integrity, and epistemic systems.

In software engineering, logical consistency manifests in multiple domains. Database constraints enforce that data cannot simultaneously satisfy contradictory conditions. Type systems ensure that values cannot simultaneously belong to incompatible types. Configuration management prevents mutually exclusive settings from being active concurrently. Business rule engines verify that no two rules produce contradictory outcomes for the same input.

The Prismatic Platform elevates logical consistency from a desirable property to a mandatory enforcement mechanism. The NABLA Infinity epistemic framework includes logical consistency as one of its core verification layers, requiring that all platform knowledge -- from quality metrics to security assessments to evolutionary fitness scores -- maintains internal logical coherence. This is not merely a guideline; it is a hard enforcement gate that blocks any knowledge claim exhibiting logical contradictions.

The relationship between logical consistency and the Prismatic Platform's Addiction Preservation doctrine is nuanced and important. Addiction Preservation requires preserving contradictory signals and maintaining evidence plurality. This might appear to conflict with logical consistency, but the resolution is subtle: contradictory evidence is preserved as distinct data points, while the conclusions drawn from that evidence must be logically consistent. The system explicitly tracks that "Source A says X" and "Source B says NOT X" without attempting to resolve the contradiction prematurely, but it will not accept both X and NOT X as established conclusions simultaneously.

The distinction between paraconsistent logic (which tolerates contradictions without explosion) and classical logic (where any contradiction implies everything) is relevant here. The Prismatic Platform operates in a hybrid mode: it uses paraconsistent approaches for evidence gathering and signal processing, but classical consistency requirements for conclusions, decisions, and actions. This mirrors how scientific practice works -- conflicting experimental results coexist in the literature, but scientific consensus must be internally consistent.

## Technical Details

The Prismatic Platform implements logical consistency verification through a combination of compile-time checks, runtime assertions, and epistemic gate evaluation.

### Propositional Consistency Checker

The core logical consistency engine evaluates sets of propositions for internal coherence using resolution-based theorem proving.

```elixir
defmodule Prismatic.Epistemic.LogicalConsistency do
  @moduledoc """
  Verifies logical consistency of proposition sets using
  resolution-based contradiction detection. Implements the
  second gate of the Trinity Gate verification framework.
  """

  @type proposition :: %{
    id: String.t(),
    subject: atom(),
    predicate: atom(),
    object: term(),
    negated: boolean(),
    confidence: float(),
    source: String.t()
  }

  @type consistency_result ::
    {:consistent, %{propositions_checked: non_neg_integer()}}
    | {:inconsistent, %{contradictions: [contradiction()]}}

  @type contradiction :: %{
    proposition_a: proposition(),
    proposition_b: proposition(),
    rule_violated: atom(),
    explanation: String.t()
  }

  @spec verify(list(proposition())) :: consistency_result()
  def verify(propositions) when is_list(propositions) do
    contradictions =
      propositions
      |> generate_pairs()
      |> Enum.flat_map(&check_pair/1)
      |> Enum.uniq_by(fn c -> {c.proposition_a.id, c.proposition_b.id} end)

    case contradictions do
      [] ->
        {:consistent, %{propositions_checked: length(propositions)}}
      found ->
        {:inconsistent, %{contradictions: found}}
    end
  end

  defp generate_pairs(propositions) do
    for a <- propositions,
        b <- propositions,
        a.id < b.id,
        do: {a, b}
  end

  defp check_pair({a, b}) do
    checks = [
      &check_direct_contradiction/2,
      &check_transitivity_violation/2,
      &check_mutual_exclusion/2,
      &check_temporal_impossibility/2
    ]

    Enum.flat_map(checks, fn check -> check.(a, b) end)
  end

  defp check_direct_contradiction(a, b) do
    if a.subject == b.subject and
       a.predicate == b.predicate and
       a.object == b.object and
       a.negated != b.negated do
      [%{
        proposition_a: a,
        proposition_b: b,
        rule_violated: :non_contradiction,
        explanation: "Direct contradiction: #{a.subject}.#{a.predicate} " <>
          "is both asserted and negated"
      }]
    else
      []
    end
  end

  defp check_transitivity_violation(a, b) do
    if a.predicate == :greater_than and
       b.predicate == :greater_than and
       a.subject == b.object and
       a.object == b.subject do
      [%{
        proposition_a: a,
        proposition_b: b,
        rule_violated: :transitivity,
        explanation: "Transitivity violation: #{a.subject} > #{a.object} " <>
          "and #{b.subject} > #{b.object} form a cycle"
      }]
    else
      []
    end
  end

  defp check_mutual_exclusion(a, b) do
    exclusion_rules = mutual_exclusion_registry()

    Enum.flat_map(exclusion_rules, fn {pred1, pred2} ->
      if (a.predicate == pred1 and b.predicate == pred2 and
          a.subject == b.subject and not a.negated and not b.negated) do
        [%{
          proposition_a: a,
          proposition_b: b,
          rule_violated: :mutual_exclusion,
          explanation: "#{a.subject} cannot simultaneously be " <>
            "#{pred1} and #{pred2}"
        }]
      else
        []
      end
    end)
  end

  defp check_temporal_impossibility(a, b) do
    if a.predicate == :occurs_before and
       b.predicate == :occurs_before and
       a.subject == b.object and
       a.object == b.subject do
      [%{
        proposition_a: a,
        proposition_b: b,
        rule_violated: :temporal_consistency,
        explanation: "Temporal impossibility: #{a.subject} cannot both " <>
          "precede and follow #{a.object}"
      }]
    else
      []
    end
  end

  defp mutual_exclusion_registry do
    [
      {:active, :terminated},
      {:healthy, :degraded},
      {:passed, :failed},
      {:production_ready, :draft}
    ]
  end
end
```

### Trinity Gate Integration

Logical consistency is verified as the second of three gates that every epistemic claim must pass.

```elixir
defmodule Prismatic.Epistemic.TrinityGate do
  @moduledoc """
  The Trinity Gate: three verification layers that every
  knowledge claim must pass before acceptance.

  Gate 1: Structural Consistency (graph theory)
  Gate 2: Logical Consistency (rule-based reasoning)
  Gate 3: Formal Necessity (modal logic + Lean4)
  """

  alias Prismatic.Epistemic.{
    StructuralConsistency,
    LogicalConsistency,
    FormalNecessity
  }

  @type gate_result :: :passed | {:failed, gate_number :: 1..3, reason :: term()}

  @spec evaluate(list(LogicalConsistency.proposition())) :: gate_result()
  def evaluate(propositions) do
    with {:gate_1, {:consistent, _}} <-
           {:gate_1, StructuralConsistency.verify(propositions)},
         {:gate_2, {:consistent, _}} <-
           {:gate_2, LogicalConsistency.verify(propositions)},
         {:gate_3, {:verified, _}} <-
           {:gate_3, FormalNecessity.verify(propositions)} do
      :passed
    else
      {:gate_1, {:inconsistent, reason}} -> {:failed, 1, reason}
      {:gate_2, {:inconsistent, reason}} -> {:failed, 2, reason}
      {:gate_3, {:unverified, reason}} -> {:failed, 3, reason}
    end
  end
end
```

### Compile-Time Consistency Enforcement

Beyond epistemic reasoning, logical consistency is enforced at the code level through Elixir's type system, pattern matching exhaustiveness, and custom Credo checks.

```elixir
defmodule Prismatic.Config.ConsistencyValidator do
  @moduledoc """
  Validates that application configuration is logically
  consistent -- no mutually exclusive options are set
  simultaneously, no dependencies are unmet, no circular
  references exist in configuration values.
  """

  @type validation_result ::
    :valid
    | {:invalid, list(String.t())}

  @spec validate(keyword()) :: validation_result()
  def validate(config) when is_list(config) do
    errors =
      []
      |> check_mutual_exclusions(config)
      |> check_dependency_requirements(config)

    case errors do
      [] -> :valid
      found -> {:invalid, found}
    end
  end

  defp check_mutual_exclusions(errors, config) do
    exclusions = [
      {[:debug_mode, :production_mode], "Cannot enable both debug and production mode"},
      {[:mock_enabled, :real_adapter], "Cannot use mocks with real adapter simultaneously"}
    ]

    Enum.reduce(exclusions, errors, fn {keys, message}, acc ->
      if Enum.all?(keys, &Keyword.get(config, &1, false)) do
        [message | acc]
      else
        acc
      end
    end)
  end

  defp check_dependency_requirements(errors, config) do
    dependencies = [
      {:ssl_enabled, :certificate_path, "SSL requires certificate_path"},
      {:cluster_mode, :node_list, "Cluster mode requires node_list"}
    ]

    Enum.reduce(dependencies, errors, fn {required_by, dependency, message}, acc ->
      if Keyword.get(config, required_by) && !Keyword.get(config, dependency) do
        [message | acc]
      else
        acc
      end
    end)
  end
end
```

## Implementation in Prismatic Platform

### Trinity Gate Enforcement

The Prismatic Platform implements logical consistency as a non-bypassable enforcement mechanism. The Trinity Gate requires all three gates to pass before any knowledge claim is accepted. Gate 2 (Logical Consistency) uses rule-based reasoning to verify that propositions follow logical rules, checking for direct contradictions, transitivity violations, mutual exclusion violations, and temporal impossibilities.

The enforcement operates at multiple confidence thresholds: critical decisions require 0.95 confidence with mandatory Trinity Gate passage, standard operations require 0.80 with mandatory gate passage, exploratory analysis uses 0.60 with recommended gate passage, and research queries use 0.50 with optional gate evaluation.

### Quality Gate Consistency

The platform's quality gate system (`mix quality.gates`) enforces logical consistency across quality domains. It would be logically inconsistent to report zero Dialyzer warnings while simultaneously reporting type violations. The quality gate system cross-validates all 13 quality domains to ensure that no domain's results contradict another's. This cross-validation catches subtle inconsistencies that individual domain checks might miss.

### NABLA Axiom Integration

Logical consistency integrates with the 7 non-negotiable NABLA axioms. The Contradiction Preservation axiom preserves both sides of a contradiction at the evidence level, but logical consistency ensures that derived conclusions are coherent. The Provenance Mandatory axiom supports logical consistency by requiring traceable reasoning chains, making it possible to audit the logical path from evidence to conclusion.

### Credo and Static Analysis

At the code level, Credo strict mode and custom Prismatic Credo checks enforce a form of logical consistency in the codebase itself. Unreachable code (logically impossible execution paths), contradictory guard clauses, and inconsistent function specifications are all detected and blocked by the pre-commit quality protection hooks.

## Comparison

| Approach | Classical Logic | Paraconsistent Logic | Prismatic Hybrid | Fuzzy Logic |
|---|---|---|---|---|
| **Contradiction handling** | Explosion (everything derivable) | Tolerated, contained | Preserved as evidence, blocked in conclusions | Degrees of truth, no strict contradiction |
| **Use case** | Mathematics, formal proofs | Inconsistent databases | Epistemic AI platforms | Control systems, approximate reasoning |
| **Strength** | Maximum rigor | Real-world tolerance | Evidence plurality with rigorous conclusions | Handles vagueness naturally |
| **Weakness** | Fragile under contradiction | Weaker inference power | Complexity of dual-mode operation | Loss of precision |
| **Prismatic relevance** | Gate 3 (Formal Necessity) | Evidence gathering layer | **Full Trinity Gate** (primary approach) | Confidence scoring |

## Best Practices

**Separate evidence from conclusions.** The most common source of logical inconsistency in knowledge systems is conflating raw evidence with derived conclusions. Maintain clear provenance chains from evidence through reasoning to conclusion. The Prismatic Platform's NABLA framework enforces this separation through the Provenance Mandatory axiom.

**Validate consistency incrementally.** Checking the entire proposition set for consistency after every addition is expensive (potentially O(n^2) for pairwise checks). Instead, check new propositions against existing ones incrementally. Maintain an index of propositions by subject and predicate for efficient contradiction lookup.

**Use mutual exclusion registries.** Many logical inconsistencies arise from domain-specific mutual exclusions that cannot be derived from pure logic alone. Maintain explicit registries of mutually exclusive states (active/terminated, healthy/degraded, passed/failed) and check against them during consistency verification.

**Implement consistency repair, not just detection.** When a contradiction is detected, the system should have a strategy for resolution. Options include: rejecting the newer proposition, rejecting the lower-confidence proposition, escalating to human review, or recording both as unresolved pending additional evidence.

**Test consistency under concurrency.** In distributed systems, logical inconsistencies can arise from race conditions where two concurrent updates create contradictory states. Use serializable transactions or optimistic concurrency control with consistency validation to prevent this.

**Document logical assumptions explicitly.** Every system operates under implicit logical assumptions (closed-world assumption, unique name assumption, etc.). Document these assumptions so that consistency checks operate under the correct logical framework.

## Common Pitfalls

**The explosion problem.** In classical logic, a single contradiction makes every proposition derivable (ex falso quodlibet). If your system uses classical logic for inference, a single inconsistency can corrupt the entire knowledge base. Guard against this by using paraconsistent logic for evidence handling or by immediately quarantining contradictions.

**Confusing logical consistency with truth.** A set of propositions can be perfectly logically consistent while being entirely false. Internal coherence is necessary but not sufficient for knowledge. The Trinity Gate addresses this by requiring formal necessity (Gate 3) in addition to logical and structural consistency.

**Ignoring context-dependent consistency.** A proposition might be consistent within one context but contradictory in another. "Server A is healthy" and "Server A is unhealthy" are contradictory at the same time, but perfectly consistent if they refer to different time points. Ensure your consistency checker accounts for temporal, spatial, and contextual qualifiers.

**Over-strict consistency in evolving systems.** Systems that learn and evolve will inevitably encounter temporary inconsistencies as new information is integrated. Design your consistency enforcement to handle transitional states gracefully, perhaps using a staging area where new propositions are checked before being committed to the main knowledge base.

**Consistency checking without performance bounds.** Naive consistency checking is O(n^2) for n propositions. For large knowledge bases, this becomes prohibitive. Use indexing, partitioning, and incremental checking to keep verification performance within acceptable bounds.

**Assuming consistency implies completeness.** A consistent system can have gaps. The absence of a contradiction does not mean all necessary facts are present. Use the NABLA axiom "Absence is Informative" to track what is missing, not just what is contradictory.

## Use Cases

**Epistemic AI Platform Verification**: The Prismatic Platform's 530 AIAD agents generate claims about system state, security posture, quality metrics, and intelligence analysis. Logical consistency verification ensures that no agent's conclusions contradict another's, maintaining a coherent platform knowledge base across all domains.

**Configuration Validation**: In a 115-application umbrella with thousands of configuration parameters, logical consistency checking prevents contradictory settings (debug mode with production security, mock adapters with real databases) from reaching production. The pre-commit hooks validate configuration consistency before code can be merged.

**Security Assessment Coherence**: The Prismatic Perimeter EASM system produces security ratings, compliance assessments, and risk scores. Logical consistency ensures that a domain rated A for security is not simultaneously flagged for critical vulnerabilities, and that NIS2 compliance status aligns with the underlying security findings.

**Knowledge Graph Integrity**: Graph databases like KuzuDB store relationships between entities. Logical consistency ensures that these relationships are coherent -- an entity cannot be both "subsidiary of" and "parent of" the same entity, a person cannot be born after their death date, a company cannot be both active and dissolved.

**Multi-Agent Decision Making**: When multiple agents contribute to a decision (as in the Color-Team security architecture), logical consistency verification ensures that the synthesized recommendation does not contain contradictory actions. The Purple Team's synthesis function explicitly checks for logical coherence before producing closure recommendations.

## Related Concepts

Logical consistency connects to fundamental epistemic and verification concepts across the platform:

- [Structural Consistency](@/glossary/structural-consistency.md) -- the first Trinity Gate layer verifying belief network graph validity
- [Formal Necessity](@/glossary/formal-necessity.md) -- the third Trinity Gate layer using modal logic and Lean4 proofs
- [Trinity Gate](@/glossary/trinity-gate.md) -- the three-layer verification framework requiring all gates to pass
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- the epistemic framework defining seven non-negotiable axioms
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- the NABLA axiom preserving conflicting evidence
- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) -- the systematic approach to knowledge validation
- [Belief Graph](@/glossary/belief-graph.md) -- the directed graph structure storing propositions and their relationships
- [Modal Logic](@/glossary/modal-logic.md) -- the logical framework for reasoning about necessity and possibility
- [Formal Verification](@/glossary/formal-verification.md) -- mathematical proof that systems satisfy specifications
- [Quality Gates](@/glossary/quality-gates.md) -- the enforcement mechanism blocking quality violations

## See Also

- [Confidence Threshold](@/glossary/confidence-threshold.md) -- the minimum confidence required for Trinity Gate evaluation
- [Signal Plurality](@/glossary/signal-plurality.md) -- the requirement for multiple independent signals before forming beliefs
- [Evidence](@/glossary/evidence.md) -- the foundation of all knowledge claims in the epistemic framework
- [Rule-Based Reasoning](@/glossary/rule-based-reasoning.md) -- the logical approach used by Gate 2 for consistency checking
- [Static Analysis](@/glossary/static-analysis.md) -- compile-time verification of code-level logical consistency
- [Credo](@/glossary/credo.md) -- the Elixir static analysis tool enforcing code consistency

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) documentation. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
