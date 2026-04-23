+++
title = "Property Test"
weight = 50
[extra]
description = "Generative testing approach that verifies system properties hold across randomly generated inputs"
category = "testing"
related_terms = ["quality-floor", "precision", "placeholder", "plt", "process"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["property-based testing", "generative testing", "StreamData", "QuickCheck", "invariant", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing", "quality", "verification"]
quality_score = 79
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Property Test - Prismatic Platform"
+++

## Definition & Overview

Property-based testing (also called generative testing or property testing) is a testing methodology where instead of specifying individual test cases with fixed inputs and expected outputs, the developer specifies properties (invariants) that must hold for all possible inputs. A property-based testing framework then generates hundreds or thousands of random inputs, checking that the property holds for each one. When a failing input is found, the framework shrinks it to the minimal reproducing case.

Property-based testing excels at finding edge cases that example-based tests miss. A traditional unit test might verify that `sort([3, 1, 2])` returns `[1, 2, 3]`, but a property test verifies that for any list, the sorted result is always ordered, always contains the same elements, and always has the same length. This specification covers empty lists, single-element lists, lists with duplicates, very large lists, and lists with extreme values -- scenarios that developers rarely enumerate manually.

The Prismatic Platform mandates property-based testing for all critical subsystems: storage adapter contracts, OSINT tool input validation, DD entity normalization, security rating computation, and permission evaluation. The NO MERCY doctrine requires zero stubs and zero mocks, and property-based testing provides the comprehensive verification needed to maintain this standard. Elixir's `StreamData` library serves as the primary property-based testing framework.

## Technical Deep Dive

Property-based testing in Elixir uses `StreamData` generators to produce random inputs and `ExUnit` integration to run the property checks. Generators can be composed to produce complex data structures matching the shapes that production code encounters.

```elixir
defmodule PrismaticStorage.PropertyTest do
  @moduledoc """
  Property-based tests for storage adapter contracts.
  Verifies that adapter properties hold across all
  randomly generated inputs.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  @tag :property
  property "put followed by get returns the stored value" do
    check all key <- string(:alphanumeric, min_length: 1, max_length: 100),
              value <- map_of(atom(:alphanumeric), term()),
              max_runs: 200 do
      adapter = PrismaticStorage.ETS
      opts = [table: :property_test_table]

      assert {:ok, ^value} = adapter.put(key, value, opts)
      assert {:ok, ^value} = adapter.get(key, opts)
    end
  end

  @tag :property
  property "delete removes stored values" do
    check all key <- string(:alphanumeric, min_length: 1),
              value <- term() do
      adapter = PrismaticStorage.ETS
      opts = [table: :property_test_table]

      {:ok, _} = adapter.put(key, value, opts)
      assert :ok = adapter.delete(key, opts)
      assert {:ok, nil} = adapter.get(key, opts)
    end
  end

  @tag :property
  property "count increases by one after each put of a new key" do
    check all keys <- uniq_list_of(string(:alphanumeric, min_length: 1), min_length: 1, max_length: 50) do
      adapter = PrismaticStorage.ETS
      table = :"property_count_#{System.unique_integer([:positive])}"
      :ets.new(table, [:named_table, :set, :public])
      opts = [table: table]

      Enum.each(keys, fn key ->
        {:ok, before_count} = adapter.count(opts)
        {:ok, _} = adapter.put(key, %{}, opts)
        {:ok, after_count} = adapter.count(opts)
        assert after_count == before_count + 1
      end)

      :ets.delete(table)
    end
  end
end
```

Custom generators enable testing domain-specific data structures. The platform defines generators for OSINT tool parameters, DD entity records, security scores, and permission tuples, ensuring that property tests operate on realistic data shapes.

```elixir
defmodule PrismaticTest.Generators do
  @moduledoc """
  StreamData generators for platform-specific data types.
  Used across property-based tests to generate realistic
  domain data.
  """

  use ExUnitProperties

  @spec osint_tool_params() :: StreamData.t(map())
  def osint_tool_params do
    gen all query <- string(:printable, min_length: 1, max_length: 500),
            category <- member_of([:czech, :global, :sanctions, :eu, :uk, :us, :universal]),
            timeout <- integer(1_000..60_000) do
      %{
        query: query,
        category: category,
        timeout: timeout,
        options: %{}
      }
    end
  end

  @spec dd_entity() :: StreamData.t(map())
  def dd_entity do
    gen all name <- string(:printable, min_length: 1, max_length: 200),
            entity_type <- member_of([:person, :organization, :asset]),
            source <- member_of([:forbes_cz, :parliament, :senate, :local_gov]),
            attributes <- map_of(atom(:alphanumeric), string(:printable)) do
      %{
        name: name,
        type: entity_type,
        source: source,
        attributes: attributes,
        external_id: "gen_#{System.unique_integer([:positive])}"
      }
    end
  end

  @spec security_score() :: StreamData.t(float())
  def security_score do
    gen all score <- float(min: 0.0, max: 900.0) do
      Float.round(score, 2)
    end
  end

  @spec permission_tuple() :: StreamData.t({atom(), atom()})
  def permission_tuple do
    gen all action <- member_of([:read, :write, :execute, :admin, :delete]),
            resource <- member_of([:osint_tools, :dd_entities, :perimeter, :users, :reports]) do
      {action, resource}
    end
  end
end
```

## Architecture & Implementation

Property-based tests in the Prismatic Platform are tagged with `@tag :property` to enable selective execution. Quick property runs (100 iterations) execute on every commit, while extended runs (10,000 iterations) execute nightly in CI. This tiered approach balances fast feedback with thorough coverage.

Shrinking is the most valuable aspect of property-based testing. When a failing input is found, `StreamData` automatically tries smaller, simpler inputs until it finds the minimal case that still fails. This minimal case is far easier to debug than the original random input. The shrinking algorithm is customizable for domain-specific types.

The platform's property tests complement, rather than replace, example-based tests. Example tests document expected behavior for specific scenarios (serving as executable documentation), while property tests verify invariants across the entire input space. Together, they provide comprehensive coverage that satisfies the NO MERCY doctrine's zero-stub, zero-mock requirements.

## Usage in Prismatic Platform

Property-based tests are required for all storage adapter implementations, OSINT tool input validation, and security rating computation. The quality gate pipeline verifies that property tests pass before allowing merges.

```elixir
defmodule PrismaticPerimeter.SecurityRating.PropertyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  @tag :property
  property "security rating is always between 300 and 900" do
    check all scores <- list_of(PrismaticTest.Generators.security_score(), min_length: 1) do
      rating = PrismaticPerimeter.SecurityRating.compute(scores)
      assert rating.score >= 300
      assert rating.score <= 900
    end
  end

  @tag :property
  property "higher scores always produce equal or better grades" do
    check all score_a <- float(min: 300.0, max: 900.0),
              score_b <- float(min: 300.0, max: 900.0) do
      grade_a = PrismaticPerimeter.SecurityRating.score_to_grade(score_a)
      grade_b = PrismaticPerimeter.SecurityRating.score_to_grade(score_b)

      if score_a > score_b do
        assert grade_rank(grade_a) >= grade_rank(grade_b)
      end
    end
  end

  defp grade_rank(:A), do: 5
  defp grade_rank(:B), do: 4
  defp grade_rank(:C), do: 3
  defp grade_rank(:D), do: 2
  defp grade_rank(:F), do: 1
end
```

## Cross-References

- [Quality Floor](@/glossary/quality-floor.md) - Minimum quality standard that property tests help maintain
- [Precision](@/glossary/precision.md) - ML metric validated through property-based testing of classifiers
- [Placeholder](@/glossary/placeholder.md) - Forbidden pattern that property tests replace with real verification
- [PLT](@/glossary/plt.md) - Dialyzer type analysis complementing property-based runtime verification
- [Provenance](@/glossary/provenance.md) - Data origin tracing verified through property tests

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
