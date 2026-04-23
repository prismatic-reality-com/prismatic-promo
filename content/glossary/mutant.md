+++
title = "Mutant"
weight = 50
[extra]
description = "A deliberately modified version of source code created during mutation testing to evaluate test suite effectiveness."
category = "testing"
related_terms = ["mutation-testing", "killedsurvived", "mutation-score", "test-coverage"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mutant", "mutation testing", "code modification", "test quality", "fault injection", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Mutant - Prismatic Platform"
+++

## Definition & Overview

In mutation testing, a mutant is a modified version of the original source code where a single, small syntactic change has been applied by a mutation operator. Each mutant represents a potential bug that could be introduced during development. The test suite is then run against the mutant to determine whether the tests detect the change (kill the mutant) or fail to notice it (the mutant survives). The ratio of killed to total mutants provides the mutation score, a rigorous measure of test suite effectiveness.

Mutants are designed to simulate realistic programming mistakes. An arithmetic mutant might change `+` to `-`, a relational mutant might change `<` to `<=`, a logical mutant might change `and` to `or`, and a statement deletion mutant might remove an entire line. These small changes mirror the types of errors that developers actually make, making mutation testing a more realistic assessment of test quality than code coverage metrics, which only measure execution rather than behavioral verification.

The Prismatic Platform generates mutants for critical business logic during quality assurance cycles. The NO MERCY doctrine requires 100% kill rates for mutants in security-sensitive modules (Perimeter scoring, NABLA confidence calculations, authentication logic). Survived mutants in these areas trigger immediate test strengthening under the mandatory regression test protocol.

## Technical Deep Dive

Mutation operators define the transformation rules for generating mutants. The standard operators, derived from decades of mutation testing research, are categorized by the type of code element they modify. Each operator produces mutants that test a specific class of behavioral verification in the test suite.

Common mutation operator categories include: Arithmetic Operator Replacement (AOR) changing `+`, `-`, `*`, `/`; Relational Operator Replacement (ROR) changing `<`, `>`, `<=`, `>=`, `==`, `!=`; Logical Connector Replacement (LCR) changing `and`, `or`, `not`; Constant Replacement (CR) changing numeric and boolean literals; Statement Deletion (SD) removing individual statements; and Return Value Replacement (RVR) changing function return values.

```elixir
defmodule PrismaticQuality.MutantGenerator do
  @moduledoc """
  Generates mutants from Elixir source code by applying
  mutation operators to AST nodes.
  """

  @type mutation_operator ::
    :arithmetic_replacement | :relational_replacement |
    :logical_replacement | :constant_replacement |
    :statement_deletion | :return_value_replacement

  @type mutant :: %{
    id: String.t(),
    file: String.t(),
    line: pos_integer(),
    operator: mutation_operator(),
    original_code: String.t(),
    mutated_code: String.t(),
    description: String.t()
  }

  @arithmetic_replacements %{
    :+ => [:-, :*, :/],
    :- => [:+, :*, :/],
    :* => [:+, :-, :/],
    :/ => [:+, :-, :*]
  }

  @relational_replacements %{
    :< => [:<=, :>, :>=, :==, :!=],
    :> => [:>=, :<, :<=, :==, :!=],
    :<= => [:<, :>, :>=, :==, :!=],
    :>= => [:>, :<, :<=, :==, :!=],
    :== => [:!=, :<, :>, :<=, :>=],
    :!= => [:==, :<, :>, :<=, :>=]
  }

  @spec generate(String.t()) :: {:ok, [mutant()]}
  def generate(file_path) do
    source = File.read!(file_path)
    {:ok, ast} = Code.string_to_quoted(source, file: file_path)

    mutants =
      ast
      |> find_mutable_nodes()
      |> Enum.flat_map(&generate_mutants_for_node(&1, file_path, source))
      |> Enum.with_index(1)
      |> Enum.map(fn {mutant, idx} ->
        %{mutant | id: "#{Path.basename(file_path)}-#{idx}"}
      end)

    {:ok, mutants}
  end

  defp find_mutable_nodes(ast) do
    {_ast, nodes} =
      Macro.prewalk(ast, [], fn
        {op, meta, [_left, _right]} = node, acc
        when op in [:+, :-, :*, :/, :<, :>, :<=, :>=, :==, :!=, :and, :or] ->
          {node, [{op, meta} | acc]}

        node, acc ->
          {node, acc}
      end)

    Enum.reverse(nodes)
  end

  defp generate_mutants_for_node({op, meta}, file_path, source) do
    line = Keyword.get(meta, :line, 0)
    replacements = Map.get(@arithmetic_replacements, op, []) ++
                   Map.get(@relational_replacements, op, [])

    Enum.map(replacements, fn replacement ->
      %{
        id: "",
        file: file_path,
        line: line,
        operator: classify_operator(op),
        original_code: Atom.to_string(op),
        mutated_code: Atom.to_string(replacement),
        description: "Replace #{op} with #{replacement} at line #{line}"
      }
    end)
  end

  defp classify_operator(op) when op in [:+, :-, :*, :/], do: :arithmetic_replacement
  defp classify_operator(op) when op in [:<, :>, :<=, :>=, :==, :!=], do: :relational_replacement
  defp classify_operator(op) when op in [:and, :or, :not], do: :logical_replacement
  defp classify_operator(_), do: :constant_replacement
end
```

Higher-order mutants combine multiple single mutations, testing whether the test suite can detect compound errors. While first-order mutants (single changes) are the standard, research shows that higher-order mutants can reveal subtle test gaps that first-order mutants miss, particularly for complex conditional logic.

Equivalent mutants are a known challenge. These are mutants where the code change produces identical behavior for all inputs, making them impossible to kill. For example, replacing `x >= 0` with `x > -1` for integer values produces an equivalent mutant. Detecting equivalent mutants automatically is undecidable in the general case, so they require manual triage or heuristic detection.

## Architecture & Implementation

The Prismatic Platform's mutant generation pipeline operates on the Elixir AST (Abstract Syntax Tree) rather than source text, ensuring that mutations are syntactically valid and semantically meaningful. The `Code.string_to_quoted/2` function parses source into AST, mutation operators transform AST nodes, and `Macro.to_string/1` converts the mutated AST back to source for test execution.

Mutant selection optimization reduces the computational cost of mutation testing. Rather than generating all possible mutants (which can number in the thousands for large modules), the platform uses selective mutation strategies: it focuses on code paths with high cyclomatic complexity, recently changed code (where new bugs are most likely), and code covered by fewer tests (where gaps are most probable).

The mutation testing pipeline integrates with the CI system as an optional quality gate. For critical modules designated by the NO MERCY protocol, mutation testing runs on every commit with a minimum kill rate threshold. For standard modules, it runs weekly to track test quality trends without impacting development velocity.

## Usage in Prismatic Platform

Mutant generation and evaluation for critical security logic:

```elixir
defmodule PrismaticPerimeter.MutationAnalysis do
  @moduledoc """
  Mutation analysis for Perimeter security scoring.
  Generates and evaluates mutants to ensure scoring logic
  is thoroughly tested.
  """

  alias PrismaticQuality.MutantGenerator
  alias PrismaticQuality.MutationTesting

  @critical_files [
    "apps/prismatic_perimeter/lib/prismatic_perimeter/scoring.ex",
    "apps/prismatic_perimeter/lib/prismatic_perimeter/risk_assessment.ex",
    "apps/prismatic_perimeter/lib/prismatic_perimeter/compliance/nis2.ex"
  ]

  @spec run_analysis() :: {:ok, map()}
  def run_analysis do
    results =
      @critical_files
      |> Enum.map(fn file ->
        {:ok, mutants} = MutantGenerator.generate(file)

        evaluated =
          Enum.map(mutants, fn mutant ->
            test_dir = String.replace(file, "/lib/", "/test/")
                       |> String.replace(".ex", "_test.exs")
                       |> Path.dirname()

            MutationTesting.evaluate_mutant(mutant, test_dir)
          end)

        {file, MutationTesting.summarize(evaluated)}
      end)

    total = aggregate_results(results)

    {:ok, %{
      per_file: Map.new(results),
      total: total,
      compliant: total.mutation_score >= 100.0
    }}
  end

  defp aggregate_results(results) do
    Enum.reduce(results, %{killed: 0, survived: 0}, fn {_, summary}, acc ->
      %{
        killed: acc.killed + summary.killed,
        survived: acc.survived + summary.survived
      }
    end)
    |> then(fn %{killed: k, survived: s} ->
      total = k + s
      score = if total > 0, do: k / total * 100, else: 100.0
      %{killed: k, survived: s, total_mutants: total, mutation_score: score}
    end)
  end
end
```

Every survived mutant in critical modules triggers the regression test protocol, requiring a new test that specifically kills the mutant before the code change can be merged.

## Cross-References

- [Mutation Testing](/glossary/mutation-testing/) - The methodology using mutants
- [Killed/Survived](/glossary/killedsurvived/) - Binary outcome of mutant evaluation
- **Mutation Score** - Aggregate quality metric from mutant results
- [Property-Based Testing](/glossary/property-based-testing/) - Complementary test quality technique
- [Invariant](/glossary/invariant/) - Properties that mutants should violate when killed

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
