+++
title = "Shrinking"
weight = 50
[extra]
description = "Property-based testing technique that minimizes failing counterexamples to their simplest reproducible form for efficient debugging"
category = "testing"
related_terms = ["property-based-testing", "stream-data", "counterexample", "generator", "quickcheck", "test-suite"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["shrinking", "property-based testing", "counterexample", "minimization", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing", "quality"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Shrinking - Prismatic Platform"
+++

## Definition & Overview

Shrinking is the process by which a property-based testing framework, upon finding an input that causes a test to fail, systematically reduces that input to the smallest possible value that still triggers the failure. When a property test discovers that a randomly generated list of 47 elements causes a function to crash, shrinking will attempt to find whether a list of 1, 2, or 3 elements can reproduce the same crash. The result is a minimal counterexample that isolates the root cause and makes debugging dramatically easier.

Without shrinking, property-based testing would produce massive, opaque counterexamples that obscure the actual bug. A failing input might be a deeply nested data structure with dozens of irrelevant fields, when the real issue is triggered by a single empty string in one field. Shrinking strips away the irrelevant complexity, leaving only the essential structure that causes the failure.

In the Prismatic Platform, shrinking is integral to the quality assurance pipeline. The platform uses StreamData (Elixir's property-based testing library) extensively for testing storage adapters, OSINT tool input validation, and pipeline data transformations. Shrinking ensures that when a property fails, developers receive actionable counterexamples rather than walls of generated data. This aligns with the NO MERCY doctrine's demand for evidence-based verification and the platform's zero-tolerance approach to untested code.

## Technical Deep Dive

### How Shrinking Works

StreamData implements integrated shrinking through lazy trees. Each generated value is not just a single datum but a tree of progressively simpler alternatives. When a test fails, the framework traverses this tree, testing each simpler alternative until it finds the smallest one that still fails:

```elixir
defmodule PrismaticQuality.ShrinkingDemo do
  @moduledoc """
  Demonstrates shrinking behavior in property-based tests.
  """

  use ExUnit.Case
  use ExUnitProperties

  # This property will fail: not all lists are sorted
  property "all lists are sorted" do
    check all list <- list_of(integer(), min_length: 1) do
      assert list == Enum.sort(list)
    end
  end

  # StreamData will shrink the counterexample from something like
  # [42, -17, 893, 0, -5, 12, 77, -88, 3, 44]
  # down to the minimal failing case:
  # [1, 0]  (simplest unsorted list)
end
```

### Custom Shrinking Strategies

For domain-specific data types, custom generators with tailored shrinking behavior provide better counterexamples:

```elixir
defmodule PrismaticOsintCore.TestGenerators do
  @moduledoc """
  Custom StreamData generators with domain-aware shrinking
  for OSINT tool input validation testing.
  """

  import StreamData

  @spec tool_config_generator() :: StreamData.t(map())
  def tool_config_generator do
    gen all slug <- string(:alphanumeric, min_length: 1, max_length: 50),
            name <- string(:printable, min_length: 1, max_length: 100),
            category <- member_of([:czech, :global, :sanctions, :eu, :uk, :us, :universal]),
            api_style <- member_of([:provider, :source, :hybrid]),
            requires_auth <- boolean(),
            field_count <- integer(0..10),
            fields <- list_of(input_field_generator(), length: field_count) do
      %{
        slug: slug,
        name: name,
        category: category,
        api_style: api_style,
        requires_auth: requires_auth,
        input_fields: fields
      }
    end
  end

  defp input_field_generator do
    gen all name <- atom(:alphanumeric),
            type <- member_of([:text, :number, :email, :url, :select]),
            required <- boolean() do
      %{name: name, type: type, label: Atom.to_string(name), required: required}
    end
  end

  @spec entity_generator() :: StreamData.t(map())
  def entity_generator do
    gen all name <- string(:printable, min_length: 1, max_length: 200),
            entity_type <- member_of([:person, :company, :domain, :ip_address]),
            attributes <- map_of(atom(:alphanumeric), string(:printable)),
            source_count <- integer(1..5),
            sources <- list_of(string(:alphanumeric, min_length: 1), length: source_count) do
      %{
        name: name,
        type: entity_type,
        attributes: attributes,
        sources: sources
      }
    end
  end
end
```

### Shrinking in Practice: Storage Adapter Testing

The platform's contract tests use property-based testing with shrinking to validate adapter behavior across the full input space:

```elixir
defmodule PrismaticStorage.PropertyTest do
  @moduledoc """
  Property-based tests for storage adapter contract compliance.
  Shrinking ensures minimal counterexamples when violations are found.
  """

  use ExUnit.Case
  use ExUnitProperties

  @adapters [PrismaticStorage.ETS, PrismaticStorage.Ecto]

  for adapter <- @adapters do
    property "#{inspect(adapter)} put-get roundtrip preserves data" do
      check all key <- string(:alphanumeric, min_length: 1),
                value <- term(),
                max_runs: 200 do
        opts = test_opts(unquote(adapter))
        assert {:ok, ^value} = unquote(adapter).put(key, value, opts)
        assert {:ok, ^value} = unquote(adapter).get(key, opts)
      end
    end

    property "#{inspect(adapter)} delete removes entry" do
      check all key <- string(:alphanumeric, min_length: 1),
                value <- binary(),
                max_runs: 200 do
        opts = test_opts(unquote(adapter))
        {:ok, _} = unquote(adapter).put(key, value, opts)
        assert :ok = unquote(adapter).delete(key, opts)
        assert {:ok, nil} = unquote(adapter).get(key, opts)
      end
    end
  end
end
```

## Architecture & Implementation

StreamData's shrinking is implemented through rose trees (multi-way trees where each node carries a value and has zero or more children representing simpler alternatives). When a generator produces a value, it simultaneously produces the entire shrink tree. The framework performs a depth-first search through this tree, testing each simpler value. If a simpler value still fails, it becomes the new root and shrinking continues from there.

The shrinking strategy varies by data type. Integers shrink toward zero. Strings shrink by removing characters and replacing them with simpler characters. Lists shrink by removing elements and shrinking individual elements. Maps shrink by removing key-value pairs. Composite generators shrink each component independently.

For the Prismatic Platform, this means that a failing property test on an OSINT tool configuration might shrink from a complex map with 10 input fields, nested attributes, and lengthy strings down to a minimal map with a single empty field that triggers the validation bug. The developer immediately sees that the bug is related to empty field handling rather than being buried in irrelevant generated data.

The platform's CI pipeline captures and archives shrunk counterexamples. When a property test fails, the minimal counterexample is logged with full context, enabling developers to write targeted regression tests that cover the exact edge case discovered by shrinking.

## Usage in Prismatic Platform

Shrinking is used across all quality-critical subsystems. The Academy topic registration uses property tests to validate that arbitrary topic configurations correctly self-register. The DD pipeline uses them to verify that entity normalization handles edge cases. The Perimeter scoring engine uses them to ensure rating calculations are monotonic.

```elixir
defmodule PrismaticPerimeter.ScoringPropertyTest do
  use ExUnit.Case
  use ExUnitProperties

  property "security score is always within valid range" do
    check all findings <- list_of(finding_generator(), max_length: 50),
              max_runs: 500 do
      {:ok, score} = PrismaticPerimeter.SecurityScoring.calculate(findings)
      assert score.numeric >= 300
      assert score.numeric <= 900
      assert score.grade in [:A, :B, :C, :D, :F]
    end
  end

  # When this fails, shrinking reveals the minimal set of
  # findings that produces an out-of-range score
end
```

## Cross-References

- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing methodology that relies on shrinking for usable results
- **StreamData** - Elixir library implementing integrated shrinking
- **Test Suite** - Organized collection including property-based tests
- **Counterexample** - Specific input that disproves a property

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
