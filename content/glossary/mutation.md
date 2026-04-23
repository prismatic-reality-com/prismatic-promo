+++
title = "Mutation"
weight = 50
[extra]
description = "A deliberate code alteration for testing purposes, or a GraphQL write operation that modifies server-side data."
category = "testing"
related_terms = ["mutation-testing", "mutant", "graphql", "api"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mutation", "mutation testing", "GraphQL mutation", "code alteration", "API write", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Mutation - Prismatic Platform"
+++

## Definition & Overview

The term "mutation" carries two distinct meanings in software engineering. In the context of mutation testing, a mutation is a deliberate, small syntactic change applied to source code to evaluate test suite effectiveness. In the context of GraphQL APIs, a mutation is a write operation that modifies server-side data, analogous to POST, PUT, PATCH, or DELETE in REST APIs. Both usages share the underlying concept of change, but they operate in entirely different domains.

In mutation testing, mutations are the fundamental unit of test quality assessment. Each mutation simulates a potential programming error: changing an operator, altering a constant, removing a statement, or modifying a return value. When tests detect the mutation (kill the mutant), it proves they are verifying behavior, not just executing code. When tests miss the mutation (the mutant survives), it reveals a test gap. The mutation score (percentage of killed mutants) provides a rigorous measure of test suite quality.

In GraphQL, mutations are one of three root operation types (alongside queries and subscriptions). They provide a structured, type-safe mechanism for write operations with explicit input types, return types, and error handling. Unlike REST where write semantics depend on HTTP methods, GraphQL mutations are explicitly declared in the schema, making the API self-documenting.

The Prismatic Platform uses both senses of the term: mutation testing for quality assurance across all 115 umbrella applications, and GraphQL-style mutation patterns in its API layer for data modification operations.

## Technical Deep Dive

### Mutation Testing Context

Mutation testing applies transformation rules (mutation operators) to source code to create variants called mutants. Each mutation targets a specific syntactic element. The process is systematic: for every applicable operator at every applicable code location, a unique mutant is generated, tested, and classified.

The quality of mutation operators determines the validity of the testing results. Well-designed operators model real-world faults. Research has shown that simple first-order mutations (single changes) are as effective at measuring test quality as complex multi-order mutations, leading to the "competent programmer hypothesis": most real bugs are close to the correct program by a small syntactic change.

```elixir
defmodule PrismaticQuality.Mutation do
  @moduledoc """
  Represents a single mutation applied to source code.
  Used in both generation and evaluation phases.
  """

  @type operator ::
    :aor | :ror | :lcr | :cr | :sd | :rvr

  @type status ::
    :pending | :killed | :survived | :equivalent | :timeout

  @type t :: %__MODULE__{
    id: String.t(),
    file: String.t(),
    line: pos_integer(),
    column: non_neg_integer(),
    operator: operator(),
    original: String.t(),
    replacement: String.t(),
    status: status(),
    killing_test: String.t() | nil,
    execution_time_ms: non_neg_integer() | nil
  }

  defstruct [
    :id, :file, :line, :column, :operator,
    :original, :replacement, :killing_test,
    :execution_time_ms,
    status: :pending
  ]

  @operator_names %{
    aor: "Arithmetic Operator Replacement",
    ror: "Relational Operator Replacement",
    lcr: "Logical Connector Replacement",
    cr: "Constant Replacement",
    sd: "Statement Deletion",
    rvr: "Return Value Replacement"
  }

  @spec describe(t()) :: String.t()
  def describe(%__MODULE__{} = mutation) do
    op_name = Map.get(@operator_names, mutation.operator, "Unknown")

    "#{op_name}: #{mutation.original} -> #{mutation.replacement} " <>
    "at #{mutation.file}:#{mutation.line}"
  end

  @spec killed?(t()) :: boolean()
  def killed?(%__MODULE__{status: :killed}), do: true
  def killed?(%__MODULE__{}), do: false

  @spec survived?(t()) :: boolean()
  def survived?(%__MODULE__{status: :survived}), do: true
  def survived?(%__MODULE__{}), do: false
end
```

### GraphQL Mutation Context

GraphQL mutations define write operations with strongly typed inputs and outputs. Each mutation specifies its arguments (the data to write), its return type (the data returned after the write), and can include validation, authorization, and business logic. This self-describing nature makes GraphQL mutations more discoverable and safer than untyped REST endpoints.

```elixir
defmodule PrismaticApi.Schema.Mutations.EntityMutations do
  @moduledoc """
  GraphQL mutations for DD entity management.
  """

  use Absinthe.Schema.Notation

  object :entity_mutations do
    @desc "Create a new DD entity"
    field :create_entity, :entity do
      arg :name, non_null(:string)
      arg :entity_type, non_null(:entity_type_enum)
      arg :source_slug, non_null(:string)
      arg :attributes, :json

      resolve fn args, _resolution ->
        PrismaticDd.create_entity(args)
      end
    end

    @desc "Update an existing DD entity"
    field :update_entity, :entity do
      arg :id, non_null(:id)
      arg :name, :string
      arg :attributes, :json

      resolve fn %{id: id} = args, _resolution ->
        with {:ok, entity} <- PrismaticDd.get_entity(id),
             {:ok, updated} <- PrismaticDd.update_entity(entity, args) do
          {:ok, updated}
        end
      end
    end

    @desc "Trigger a DD pipeline fetch for a source group"
    field :trigger_fetch, :fetch_result do
      arg :group, non_null(:string)

      resolve fn %{group: group}, _resolution ->
        group_atom = String.to_existing_atom(group)
        PrismaticDd.Client.fetch_group(group_atom)
      end
    end
  end
end
```

## Architecture & Implementation

The dual meaning of mutation in the Prismatic Platform is managed through clear module namespacing. Mutation testing code lives under `PrismaticQuality.Mutation*` and `PrismaticQuality.MutantGenerator`. GraphQL mutation definitions live under `PrismaticApi.Schema.Mutations.*`. This separation prevents confusion and ensures that developers working on test quality versus API development operate in clearly distinct namespaces.

The mutation testing system integrates with the quality gates pipeline. When `mix quality.gates` runs, it can optionally trigger mutation testing for critical modules. The results feed into the Quality DNA system, tracking mutation scores over time and alerting when scores degrade. This integration ensures mutation testing is not a one-time activity but a continuous quality monitoring practice.

GraphQL mutations in the API layer follow the Command pattern: each mutation maps to a specific business operation with validation, authorization, execution, and response formatting. Side effects (database writes, cache invalidation, event emission) are encapsulated within the resolver, keeping the schema definition clean and declarative.

## Usage in Prismatic Platform

Combining both mutation concepts in a quality-assured API:

```elixir
defmodule PrismaticQuality.MutationReport do
  @moduledoc """
  Generates comprehensive mutation testing reports for quality tracking.
  """

  alias PrismaticQuality.Mutation

  @type report :: %{
    total: non_neg_integer(),
    killed: non_neg_integer(),
    survived: non_neg_integer(),
    equivalent: non_neg_integer(),
    score: float(),
    by_operator: %{Mutation.operator() => %{killed: integer(), total: integer()}},
    survived_details: [Mutation.t()],
    recommendations: [String.t()]
  }

  @spec generate([Mutation.t()]) :: report()
  def generate(mutations) do
    killed = Enum.count(mutations, &Mutation.killed?/1)
    survived = Enum.count(mutations, &Mutation.survived?/1)
    equivalent = Enum.count(mutations, &(&1.status == :equivalent))
    decisive = killed + survived

    score = if decisive > 0, do: killed / decisive * 100, else: 100.0

    %{
      total: length(mutations),
      killed: killed,
      survived: survived,
      equivalent: equivalent,
      score: Float.round(score, 2),
      by_operator: group_by_operator(mutations),
      survived_details: Enum.filter(mutations, &Mutation.survived?/1),
      recommendations: generate_recommendations(mutations)
    }
  end

  defp group_by_operator(mutations) do
    mutations
    |> Enum.group_by(& &1.operator)
    |> Enum.map(fn {op, muts} ->
      killed = Enum.count(muts, &Mutation.killed?/1)
      {op, %{killed: killed, total: length(muts)}}
    end)
    |> Map.new()
  end

  defp generate_recommendations(mutations) do
    survived = Enum.filter(mutations, &Mutation.survived?/1)

    survived
    |> Enum.group_by(& &1.operator)
    |> Enum.map(fn {op, muts} ->
      "Add #{length(muts)} tests targeting #{op} mutations in #{hd(muts).file}"
    end)
  end
end
```

This unified report system tracks mutation testing quality over time, ensuring both mutation testing (for code quality) and GraphQL mutations (for API correctness) maintain the high standards required by the NO MERCY doctrine.

## Cross-References

- [Mutation Testing](@/glossary/mutation-testing.md) - The testing methodology using code mutations
- [Mutant](@/glossary/mutant.md) - The modified code resulting from a mutation
- [Mutation Score](@/glossary/mutation-score.md) - Quality metric derived from mutation results
- [GraphQL](@/glossary/graphql.md) - Query language where mutations are write operations
- [API](@/glossary/api.md) - Interface layer exposing mutation operations

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
