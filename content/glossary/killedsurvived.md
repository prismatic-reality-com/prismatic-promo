+++
title = "Killed/Survived (Mutation Testing)"
weight = 50
[extra]
description = "Binary outcome of a mutation test: a mutant is 'killed' when tests detect the code change, or 'survived' when tests fail to catch it."
category = "testing"
related_terms = ["mutation-testing", "mutant", "mutation-score", "test-coverage"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["killed", "survived", "mutation testing", "test quality", "mutant", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Killed/Survived - Prismatic Platform"
+++

## Definition & Overview

In mutation testing, "killed" and "survived" describe the two possible outcomes when a mutant (a deliberately introduced code modification) is evaluated against the existing test suite. A mutant is killed when at least one test fails as a result of the code change, proving that the test suite can detect that specific type of fault. A mutant survives when all tests continue to pass despite the code modification, revealing a gap in test coverage or assertion quality.

The killed/survived classification is the foundation of mutation testing's value proposition. Traditional code coverage metrics (line, branch, condition coverage) only measure whether code is executed during tests, not whether the tests actually verify correct behavior. A test that calls a function but never asserts on its return value will show as "covered" in line coverage but will fail to kill mutants. The killed/survived outcome directly measures test effectiveness rather than mere execution.

The Prismatic Platform uses mutation testing as part of its quality assurance strategy, particularly for critical business logic in the DD pipeline, security scoring in the Perimeter module, and confidence calculations in the NABLA epistemic framework. The NO MERCY doctrine requires that survived mutants in critical paths are treated as test quality deficiencies and addressed immediately.

## Technical Deep Dive

Mutation operators define the types of code changes applied to create mutants. Common operators include arithmetic operator replacement (+ to -), relational operator replacement (< to <=), logical connector replacement (AND to OR), constant replacement (0 to 1), statement deletion, and return value modification. Each operator targets a specific fault class, and together they provide comprehensive fault simulation.

A killed mutant indicates test strength: the tests correctly distinguish between correct and incorrect behavior for that specific code location and mutation type. A survived mutant has multiple possible interpretations. It may indicate a genuine test gap (the test suite lacks assertions that would catch the change). It may be an equivalent mutant (the mutation produces identical behavior for all possible inputs, making it semantically identical to the original). Or it may be a near-equivalent mutant (the behavior differs only for inputs that the test suite does not exercise).

```elixir
defmodule PrismaticQuality.MutationTesting do
  @moduledoc """
  Mutation testing framework for evaluating test suite quality.
  Generates mutants, runs tests, and classifies outcomes.
  """

  @type mutant :: %{
    id: String.t(),
    file: String.t(),
    line: pos_integer(),
    operator: atom(),
    original: String.t(),
    mutated: String.t(),
    status: :pending | :killed | :survived | :timeout | :error
  }

  @type result :: %{
    total_mutants: non_neg_integer(),
    killed: non_neg_integer(),
    survived: non_neg_integer(),
    timeouts: non_neg_integer(),
    errors: non_neg_integer(),
    mutation_score: float()
  }

  @spec evaluate_mutant(mutant(), String.t()) :: mutant()
  def evaluate_mutant(%{file: file, original: original, mutated: mutated} = mutant, test_dir) do
    # Apply mutation
    original_content = File.read!(file)
    mutated_content = String.replace(original_content, original, mutated, global: false)
    File.write!(file, mutated_content)

    # Run relevant tests
    test_result =
      try do
        run_tests(test_dir, timeout: 30_000)
      after
        # Always restore original code
        File.write!(file, original_content)
      end

    # Classify outcome
    status =
      case test_result do
        {:ok, :all_passed} -> :survived
        {:ok, :failures} -> :killed
        {:error, :timeout} -> :timeout
        {:error, _reason} -> :error
      end

    %{mutant | status: status}
  end

  @spec summarize([mutant()]) :: result()
  def summarize(mutants) do
    counts = Enum.frequencies_by(mutants, & &1.status)

    killed = Map.get(counts, :killed, 0)
    survived = Map.get(counts, :survived, 0)
    total_decisive = killed + survived

    mutation_score =
      if total_decisive > 0,
        do: killed / total_decisive * 100,
        else: 0.0

    %{
      total_mutants: length(mutants),
      killed: killed,
      survived: survived,
      timeouts: Map.get(counts, :timeout, 0),
      errors: Map.get(counts, :error, 0),
      mutation_score: Float.round(mutation_score, 2)
    }
  end

  defp run_tests(test_dir, opts) do
    timeout = Keyword.get(opts, :timeout, 30_000)

    case System.cmd("mix", ["test", test_dir, "--no-color"],
           stderr_to_stdout: true,
           timeout: timeout) do
      {_output, 0} -> {:ok, :all_passed}
      {_output, _} -> {:ok, :failures}
    end
  rescue
    _ -> {:error, :timeout}
  end
end
```

The timeout outcome deserves special mention. Mutations that cause infinite loops or extreme slowdowns are typically killed by timeout, which is classified separately because it indicates the mutation was detected (the original code does not timeout) but through a non-functional mechanism. Some mutation testing frameworks count timeouts as killed, while others treat them separately.

## Architecture & Implementation

The mutation testing pipeline in the Prismatic Platform operates in three phases. First, the mutation generation phase applies mutation operators to target source files, generating a list of mutant definitions. Second, the evaluation phase applies each mutation, runs the relevant test subset, records the outcome, and restores the original code. Third, the analysis phase computes the mutation score, identifies survived mutants, and generates a report with recommendations.

Performance is a key concern. Running the full test suite for each of potentially hundreds of mutants is prohibitively slow. The platform uses test selection optimization: for each mutant, only tests that exercise the mutated code are run, as determined by coverage data from a prior test run. This reduces evaluation time by 80-95% compared to running all tests for every mutant.

Survived mutant triage is a structured process. Each survived mutant is classified as one of: genuine gap (needs new test), equivalent mutant (no behavioral difference), or trivial mutant (tests a meaningless property). Genuine gaps trigger test creation under the NO MERCY protocol. Equivalent mutants are marked as such in the baseline to avoid repeated investigation.

## Usage in Prismatic Platform

Critical path mutation testing for security scoring:

```elixir
defmodule PrismaticPerimeter.MutationTests.SecurityScoringTest do
  @moduledoc """
  Mutation testing for security scoring logic.
  Ensures test suite catches all meaningful mutations in
  the scoring algorithm.
  """

  use ExUnit.Case, async: false

  alias PrismaticQuality.MutationTesting

  @target_file "apps/prismatic_perimeter/lib/prismatic_perimeter/scoring.ex"
  @test_dir "apps/prismatic_perimeter/test/"

  describe "security scoring mutation resilience" do
    test "arithmetic mutations in score calculation are killed" do
      mutants = [
        %MutationTesting{
          id: "score-arith-1",
          file: @target_file,
          line: 42,
          operator: :arithmetic_replacement,
          original: "base_score + risk_penalty",
          mutated: "base_score - risk_penalty",
          status: :pending
        },
        %MutationTesting{
          id: "score-arith-2",
          file: @target_file,
          line: 45,
          operator: :arithmetic_replacement,
          original: "score * confidence",
          mutated: "score / confidence",
          status: :pending
        }
      ]

      results =
        Enum.map(mutants, &MutationTesting.evaluate_mutant(&1, @test_dir))

      summary = MutationTesting.summarize(results)

      # NO MERCY: 100% kill rate required for security scoring
      assert summary.mutation_score == 100.0,
        "Survived mutants in security scoring: #{inspect(Enum.filter(results, &(&1.status == :survived)))}"
    end
  end
end
```

Survived mutants in security-critical code paths are treated as P0 issues requiring immediate remediation, ensuring that the test suite provides genuine behavioral verification, not merely coverage theater.

## Cross-References

- [Mutation Testing](/glossary/mutation-testing/) - The broader testing methodology
- [Mutant](/glossary/mutant/) - The modified code unit being evaluated
- **Mutation Score** - Aggregate metric computed from kill/survive ratios
- [Test Coverage](/glossary/test-coverage/) - Complementary but weaker quality metric
- [Property-Based Testing](/glossary/property-based-testing/) - Alternative test quality technique

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
