+++
title = "Formal Verification with Lean4"
weight = 11
[extra]
description = "Using QEVE for property-based testing, proof construction, and invariant verification"
category = "advanced"
difficulty = "advanced"
duration = "75 min"
prerequisites = ["nabla-infinity-guide", "quality-standards"]
glossary_terms = ["trinity-gate", "nabla-infinity", "no-mercy", "no-doubts", "quality-dna", "aiad"]
technologies = ["elixir", "lean4", "exunit"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1006
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Formal", "Verification", "Lean4", "QEVE", "academy", "advanced", "Prismatic Platform", "Monte Carlo", "Property", "Trinity Gate"]
tags = ["academy", "advanced", "formal-verification-with-lean4", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Formal Verification with Lean4 - Prismatic Platform"
+++

## Overview

Formal verification is the third layer of the [Trinity Gate](@/glossary/trinity-gate.md) -- the gate that ensures critical claims are not just structurally and logically consistent but mathematically proven. The Prismatic Platform uses QEVE (Quality Evidence Verification Engine) which combines Lean4 formal proofs, [NABLA Infinity](@/glossary/nabla-infinity.md) axiom checking, and Monte Carlo simulation to verify system properties. This guide teaches you to write property-based tests, construct formal proofs, and verify invariants.

You will learn:

- The QEVE verification pipeline: property-based testing, formal proofs, and Monte Carlo simulation
- How to write StreamData property-based tests for Elixir modules
- How Lean4 proofs verify critical system properties
- Invariant verification patterns for stateful systems
- When formal verification is required vs. recommended vs. optional

## Prerequisites

- Completed [Applying NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md)
- Completed [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md)
- Basic understanding of mathematical logic (propositions, proofs)
- Familiarity with property-based testing concepts

## Core Concepts

### The QEVE Pipeline

QEVE provides three levels of verification, each progressively stronger:

| Level | Method | Strength | Speed | When Required |
|-------|--------|----------|-------|---------------|
| L1 | Property-Based Testing | Statistical confidence | Fast | All code |
| L2 | Monte Carlo Simulation | Probabilistic verification | Medium | Stateful systems |
| L3 | Lean4 Formal Proofs | Mathematical certainty | Slow | Critical claims |

### Property-Based Testing vs. Example-Based Testing

Traditional tests verify specific examples:

```elixir
# Example-based: tests ONE specific case
test "sorts a list" do
  assert Enum.sort([3, 1, 2]) == [1, 2, 3]
end
```

Property-based tests verify properties that hold for ALL valid inputs:

```elixir
# Property-based: tests THOUSANDS of random cases
property "sorting produces a list with the same elements" do
  check all list <- list_of(integer()) do
    sorted = Enum.sort(list)
    assert length(sorted) == length(list)
    assert Enum.all?(list, fn x -> x in sorted end)
  end
end
```

### When Formal Proofs Are Required

The Trinity Gate mandates formal proofs for:

- Security rating calculations (financial impact)
- Compliance assessment logic (regulatory impact)
- Agent consensus algorithms (correctness impact)
- Confidence threshold transitions (epistemic impact)

For standard business logic, property-based testing (L1) is sufficient.

## Step-by-Step Guide

### Step 1: Property-Based Testing with StreamData

StreamData is Elixir's property-based testing library. It generates random data and checks that properties hold:

```elixir
defmodule PrismaticPerimeter.RatingPropertyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  alias PrismaticPerimeter.Rating

  # Generator for findings
  defp finding_generator do
    gen all severity <- member_of([:critical, :high, :medium, :low, :info]),
            confidence <- float(min: 0.0, max: 1.0),
            category <- member_of(["tls", "dns", "headers", "ports"]) do
      %{
        severity: severity,
        confidence: confidence,
        category: category,
        resolved_at: nil
      }
    end
  end

  property "score is always between 300 and 900" do
    check all findings <- list_of(finding_generator(), max_length: 50) do
      {:ok, rating} = Rating.calculate("test.com", findings)
      assert rating.score >= 300
      assert rating.score <= 900
    end
  end

  property "more critical findings produce lower scores" do
    check all base_findings <- list_of(finding_generator(), min_length: 1, max_length: 10) do
      critical_finding = %{
        severity: :critical,
        confidence: 1.0,
        category: "tls",
        resolved_at: nil
      }

      {:ok, base_rating} = Rating.calculate("test.com", base_findings)
      {:ok, worse_rating} = Rating.calculate("test.com", [critical_finding | base_findings])

      assert worse_rating.score <= base_rating.score
    end
  end

  property "resolved findings do not affect score" do
    check all findings <- list_of(finding_generator(), min_length: 1, max_length: 20) do
      resolved = Enum.map(findings, fn f ->
        %{f | resolved_at: DateTime.utc_now()}
      end)

      {:ok, active_rating} = Rating.calculate("test.com", [])
      {:ok, resolved_rating} = Rating.calculate("test.com", resolved)

      assert resolved_rating.score == active_rating.score
    end
  end

  property "grade is consistent with score" do
    check all findings <- list_of(finding_generator(), max_length: 30) do
      {:ok, rating} = Rating.calculate("test.com", findings)

      expected_grade = cond do
        rating.score >= 850 -> :A
        rating.score >= 750 -> :B
        rating.score >= 650 -> :C
        rating.score >= 500 -> :D
        true -> :F
      end

      assert rating.grade == expected_grade
    end
  end

  property "confidence is between 0 and 1 when findings exist" do
    check all findings <- list_of(finding_generator(), min_length: 1, max_length: 20) do
      {:ok, rating} = Rating.calculate("test.com", findings)
      assert rating.confidence >= 0.0
      assert rating.confidence <= 1.0
    end
  end
end
```

### Step 2: Invariant Verification for Stateful Systems

For GenServer-based agents, verify that state invariants hold across all operations:

```elixir
defmodule PrismaticAgents.BeliefEngineInvariantTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  alias PrismaticAgents.BeliefEngine

  # Generator for signals
  defp signal_generator do
    gen all source <- atom(:alphanumeric),
            confidence <- float(min: 0.0, max: 1.0),
            value <- one_of([integer(), float(), string(:alphanumeric)]) do
      %{
        source: source,
        value: value,
        confidence: confidence,
        timestamp: DateTime.utc_now(),
        provenance: "test-generator"
      }
    end
  end

  property "NABLA Axiom 1: no belief established from single signal" do
    check all signal <- signal_generator() do
      belief = BeliefEngine.evaluate_signals("test claim", [signal])
      assert belief.status == :pending
      assert belief.established_at == nil
    end
  end

  property "NABLA Axiom 2: contradictions are always preserved" do
    check all signals <- list_of(signal_generator(), min_length: 2, max_length: 10) do
      belief = BeliefEngine.evaluate_signals("test claim", signals)

      # No signals should be silently discarded
      total_tracked = length(belief.signals) + length(belief.contradictions)
      assert total_tracked == length(signals)
    end
  end

  property "NABLA Axiom 7: all beliefs have provenance" do
    check all signals <- list_of(signal_generator(), min_length: 2, max_length: 10) do
      belief = BeliefEngine.evaluate_signals("test claim", signals)

      # Every signal in the belief must have non-nil provenance
      Enum.each(belief.signals, fn signal ->
        assert signal.provenance != nil
      end)
    end
  end

  property "confidence never exceeds 1.0" do
    check all signals <- list_of(signal_generator(), min_length: 2, max_length: 50) do
      belief = BeliefEngine.evaluate_signals("test claim", signals)
      assert belief.confidence >= 0.0
      assert belief.confidence <= 1.0
    end
  end
end
```

### Step 3: Monte Carlo Simulation (QEVE Level 2)

Monte Carlo simulation tests system behavior under thousands of random scenarios:

```elixir
defmodule PrismaticPerimeter.MonteCarloTest do
  use ExUnit.Case, async: true

  @iterations 10_000

  describe "rating stability under random conditions" do
    test "rating distribution is reasonable across #{@iterations} random organizations" do
      results =
        1..@iterations
        |> Enum.map(fn _ ->
          findings = generate_random_findings()
          {:ok, rating} = PrismaticPerimeter.Rating.calculate("random.org", findings)
          rating
        end)

      scores = Enum.map(results, & &1.score)
      grades = Enum.frequencies_by(results, & &1.grade)

      # Statistical assertions
      mean = Enum.sum(scores) / length(scores)
      assert mean > 400, "Mean score #{mean} is unreasonably low"
      assert mean < 850, "Mean score #{mean} is unreasonably high"

      # Distribution assertions: no grade should dominate completely
      assert Map.get(grades, :A, 0) < @iterations * 0.5
      assert Map.get(grades, :F, 0) < @iterations * 0.5

      # All grades should be represented in a large sample
      assert map_size(grades) >= 3, "Expected at least 3 different grades"
    end

    test "rating is deterministic for same inputs" do
      findings = generate_random_findings()

      {:ok, rating1} = PrismaticPerimeter.Rating.calculate("test.org", findings)
      {:ok, rating2} = PrismaticPerimeter.Rating.calculate("test.org", findings)

      assert rating1.score == rating2.score
      assert rating1.grade == rating2.grade
    end
  end

  defp generate_random_findings do
    count = :rand.uniform(20)
    severities = [:critical, :high, :medium, :low, :info]

    Enum.map(1..count, fn _ ->
      %{
        severity: Enum.random(severities),
        confidence: :rand.uniform() * 0.5 + 0.5,
        category: Enum.random(["tls", "dns", "headers", "ports"]),
        resolved_at: if(:rand.uniform() > 0.7, do: DateTime.utc_now())
      }
    end)
  end
end
```

### Step 4: Lean4 Formal Proofs (QEVE Level 3)

For critical system properties, Lean4 provides mathematical certainty:

```lean
-- Lean4 proof that rating score bounds are maintained
-- File: proofs/perimeter/rating_bounds.lean

theorem rating_score_bounded (base_score : Nat) (deductions : Nat)
    (h_base : base_score = 900)
    (h_deductions : deductions >= 0) :
    max (base_score - deductions) 300 >= 300 ∧
    max (base_score - deductions) 300 <= 900 := by
  constructor
  · -- Lower bound: max always returns at least 300
    omega
  · -- Upper bound: base_score - deductions <= base_score = 900
    omega

-- Proof that adding findings can only decrease or maintain score
theorem findings_monotonic_decrease (score_before : Nat) (new_deduction : Nat)
    (h_score : score_before >= 300)
    (h_score_upper : score_before <= 900)
    (h_deduction : new_deduction >= 0) :
    max (score_before - new_deduction) 300 <= score_before := by
  omega
```

These proofs are checked at build time. If the proof does not hold, the build fails -- providing mathematical certainty that the property is correct for all possible inputs, not just tested ones.

### Step 5: Integrating QEVE Levels

```elixir
defmodule PrismaticPerimeter.RatingVerification do
  @moduledoc """
  QEVE verification suite for the Rating module.
  Combines L1 (property tests), L2 (Monte Carlo), and L3 (formal proofs).
  """

  @spec verify_rating_system() :: {:ok, map()} | {:error, term()}
  def verify_rating_system do
    results = %{
      l1_property_tests: run_property_tests(),
      l2_monte_carlo: run_monte_carlo(),
      l3_formal_proofs: check_lean4_proofs()
    }

    if Enum.all?(Map.values(results), &(&1 == :passed)) do
      {:ok, results}
    else
      {:error, results}
    end
  end

  defp run_property_tests do
    case System.cmd("mix", ["test", "--only", "property", "test/perimeter/rating_property_test.exs"]) do
      {_, 0} -> :passed
      {output, _} -> {:failed, output}
    end
  end

  defp run_monte_carlo do
    case System.cmd("mix", ["test", "--only", "monte_carlo", "test/perimeter/monte_carlo_test.exs"]) do
      {_, 0} -> :passed
      {output, _} -> {:failed, output}
    end
  end

  defp check_lean4_proofs do
    case System.cmd("lake", ["build"], cd: "proofs/perimeter") do
      {_, 0} -> :passed
      {output, _} -> {:failed, output}
    end
  end
end
```

## Common Pitfalls

**Writing property tests that always pass.** A property like "the result is a map" is too weak. Properties should encode meaningful invariants that would catch real bugs.

**Generating unrealistic test data.** Random data is powerful but must be realistic. A finding with severity `:critical` and confidence `0.01` is unrealistic and may mask real issues. Constrain generators to produce realistic distributions.

**Confusing property tests with fuzzing.** Property-based testing verifies that properties hold for all generated inputs. Fuzzing tries to find inputs that crash the system. Both are valuable but serve different purposes.

**Skipping formal proofs for critical logic.** When the Trinity Gate mandates formal verification for a claim, property tests alone are insufficient. The formal proof must be provided.

**Not running QEVE in CI.** Property-based tests and Monte Carlo simulations must run in CI, not just locally. Configure the CI pipeline to run these tests with sufficient iterations.

## Exercises

1. **Write a property for domain normalization.** Verify that `normalize_domain/1` is idempotent: normalizing an already-normalized domain produces the same result.

2. **Property-test the BeliefEngine.** Write properties that verify all 7 NABLA axioms hold for the BeliefEngine module under random inputs.

3. **Monte Carlo test agent consensus.** Generate 10,000 random voting scenarios and verify that the consensus algorithm produces correct results and handles edge cases (ties, empty votes).

4. **Read a Lean4 proof.** Examine `proofs/perimeter/rating_bounds.lean` and understand how the `omega` tactic closes arithmetic goals. Try modifying the theorem to prove a false claim and observe the error.

## Summary

QEVE provides three levels of verification: property-based testing for statistical confidence, Monte Carlo simulation for probabilistic verification, and Lean4 formal proofs for mathematical certainty. Property-based tests generate thousands of random inputs to verify that invariants hold. Monte Carlo simulations test system behavior under realistic random conditions. Lean4 proofs provide mathematical guarantees for critical properties. The Trinity Gate requires formal proofs for critical claims, property tests for all code, and Monte Carlo for stateful systems.

## Practical Implementation

### In Prismatic Platform

Formal verification is implemented across these applications:

- **prismatic_lean4** (`apps/prismatic_lean4/`) -- Lean4 formal proof integration for QEVE Level 3 verification. Contains deduction verification proofs in `priv/deduction_verification/` (hundreds of `.lean` proof files). Bridges Elixir property claims to Lean4 mathematical proofs
- **prismatic_deduction** (`apps/prismatic_deduction/`) -- Deduction engine for constructing and verifying logical reasoning chains. Supports the structural and logical consistency layers of the Trinity Gate
- **prismatic_monte_carlo** (`apps/prismatic_monte_carlo/`) -- Monte Carlo simulation engine for QEVE Level 2 probabilistic verification. Runs thousands of random scenarios to test system behavior under varied conditions
- **prismatic_nabla** (`apps/prismatic_nabla/`) -- NABLA axiom enforcement integrated with QEVE: properties like signal plurality (Axiom 1) and confidence bounds are verified through property-based tests
- **prismatic_trinity_nexus** (`apps/prismatic_trinity_nexus/`) -- Trinity Gate implementation that delegates to Lean4 for formal necessity checks on critical claims. Houses 629 trinity entities

### Code Examples from the Codebase

Lean4 proof files live in `apps/prismatic_lean4/priv/deduction_verification/`:

```bash
# Hundreds of formal verification proofs
ls apps/prismatic_lean4/priv/deduction_verification/ | wc -l
# => 400+ .lean proof files

# Example proof file structure
cat apps/prismatic_lean4/priv/deduction_verification/verify_845.lean
# Contains theorem statements and proofs for system invariants
```

The QEVE verification pipeline combines all three levels:

```elixir
# QEVE Level 1: Property-based tests (StreamData)
# Run with: mix test --only property
property "score is always between 300 and 900" do
  check all findings <- list_of(finding_generator()) do
    {:ok, rating} = Rating.calculate("test.com", findings)
    assert rating.score >= 300 and rating.score <= 900
  end
end

# QEVE Level 2: Monte Carlo simulation
# Run with: mix test --only monte_carlo
# 10,000 random scenarios per test

# QEVE Level 3: Lean4 formal proofs
# Built with: cd apps/prismatic_lean4 && lake build
```

## See Also

### Related Applications
- [prismatic_lean4](@/apps/prismatic-lean4.md) -- Lean4 proof infrastructure and deduction verification
- [prismatic_deduction](@/apps/prismatic-deduction.md) -- Logical deduction engine
- [prismatic_monte_carlo](@/apps/prismatic-monte-carlo.md) -- Monte Carlo simulation for probabilistic verification
- [prismatic_nabla](@/apps/prismatic-nabla.md) -- NABLA axiom enforcement integrated with QEVE
- **prismatic_trinity_nexus** (`apps/prismatic_trinity_nexus/`) -- Trinity Gate formal necessity delegation

### Glossary
- [Trinity Gate](@/glossary/trinity-gate.md) -- 3-layer validation requiring formal proofs for critical claims
- [QEVE](@/glossary/qeve.md) -- Quality Evidence Verification Engine
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Statistical confidence through random input generation
- [Theorem Proving](@/glossary/theorem-proving.md) -- Mathematical verification of system properties
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework requiring formal verification

### Architecture
- [NABLA Framework](@/architecture/nabla-framework.md) -- Epistemic framework architecture including QEVE

### Related Academy Topics
- [Self-Evolving Ecosystems](@/academy/evolution-patterns.md) -- Formal verification of fitness functions
- [Color Team Security](@/academy/color-team-security.md) -- White Team verification methods
- [The AIAD Standard](@/academy/aiad-standard.md) -- How verification requirements are specified in agent definitions
- [NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md) -- Axioms that formal verification proves

## Next Steps

- [Self-Evolving Agent Ecosystems](@/academy/evolution-patterns.md) -- formal verification of evolutionary fitness functions
- [Color Team Security Operations](@/academy/color-team-security.md) -- White Team verification methods
- [The AIAD Standard Explained](@/academy/aiad-standard.md) -- how verification requirements are specified in agent definitions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)