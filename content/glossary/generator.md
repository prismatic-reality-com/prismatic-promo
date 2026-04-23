+++
title = "Generator"
description = "A property-based testing data producer that creates random, structured test inputs according to specified types and constraints, enabling exhaustive exploration of input spaces."
weight = 50

[extra]
category = "testing"
tags = ["generator", "property-testing", "stream-data", "quickcheck", "test-data", "fuzzing", "shrinking", "random", "elixir", "testing"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["developers", "testers", "architects", "quality-engineers"]
related_terms = ["property-testing", "stream-data", "shrinking", "quickcheck", "fuzzing", "test-coverage"]
key_concepts = ["data-generation", "composable-generators", "shrinking", "type-driven-generation", "custom-generators"]
platforms = ["stream-data", "propcheck", "elixir", "beam"]
prerequisites = ["testing-fundamentals", "property-based-testing", "elixir-types"]
use_cases = ["property-testing", "fuzz-testing", "load-testing", "data-validation-testing", "boundary-testing"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Generator", "property testing", "test data", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Generator - Prismatic Platform"
+++

## Definition and Overview

A generator in property-based testing is a composable data producer that creates random, well-typed test inputs according to specified constraints. Unlike traditional unit tests that use handcrafted examples, property-based tests use generators to produce hundreds or thousands of diverse inputs, testing that invariant properties hold across the entire input space. Generators are the engine that powers this approach -- they know how to produce valid instances of any data type, from simple integers and strings to complex nested structures.

The power of generators lies in their composability. Primitive generators (integers, strings, booleans, floats) can be combined using mapping, filtering, binding, and structural combinators to build generators for any domain-specific data type. A generator for a user record is composed from a name generator (string), an age generator (positive integer), and an email generator (string matching a pattern). This compositional approach means that once a library of primitive and domain generators exists, generating test data for any new feature is straightforward.

Generators also support shrinking -- the process of reducing a failing test case to its minimal form. When a generator produces an input that causes a property to fail, the shrinking process systematically reduces the input's complexity (shorter strings, smaller numbers, fewer list elements) while maintaining the failure. This produces minimal, human-readable counterexamples that directly reveal the source of the bug. In the Prismatic Platform, generators are used extensively for testing storage adapters, OSINT data processing, and agent behavior across diverse input spaces.

## Technical Deep Dive

### Generator Hierarchy

| Level | Generator | Example Output |
|-------|-----------|---------------|
| **Primitive** | `integer()`, `string(:alphanumeric)`, `boolean()` | `42`, `"abc"`, `true` |
| **Constrained** | `integer(1..100)`, `string(:ascii, min_length: 3)` | `73`, `"xyz"` |
| **Composite** | `{integer(), string(:alphanumeric)}` | `{42, "abc"}` |
| **Collection** | `list_of(integer())`, `map_of(atom(), string())` | `[1, 3, 7]`, `%{a: "x"}` |
| **Domain** | Custom generator for business types | `%User{name: "Jan", age: 35}` |

### Generator Combinators

| Combinator | Purpose | Example |
|-----------|---------|---------|
| `map/2` | Transform generated values | `map(integer(), &abs/1)` |
| `bind/2` | Dependent generation (flatMap) | `bind(integer(1..5), fn n -> list_of(integer(), length: n) end)` |
| `filter/2` | Reject invalid values | `filter(integer(), &(&1 != 0))` |
| `one_of/1` | Choose from alternatives | `one_of([integer(), string(:alphanumeric)])` |
| `frequency/1` | Weighted choice | `frequency([{3, integer()}, {1, float()}])` |
| `constant/1` | Always return same value | `constant(:ok)` |
| `tuple/1` | Combine into tuple | `tuple({integer(), string(:ascii)})` |
| `fixed_list/1` | Fixed-length heterogeneous list | `fixed_list([integer(), atom()])` |

### Shrinking Strategies

| Strategy | Description | Applied To |
|----------|-------------|-----------|
| **Integral** | Shrink toward zero | Integers, floats |
| **String** | Remove characters, simplify | Strings, binaries |
| **List** | Remove elements, shrink remaining | Lists, keyword lists |
| **Tuple** | Shrink each element | Tuples, structs |
| **Tree** | Lazy shrink tree exploration | All generators (StreamData) |

## Architecture and Implementation

Generator architecture in StreamData (the standard Elixir property testing library) uses lazy rose trees -- tree structures where each node contains a generated value and its children contain progressively simpler alternatives. When a property fails, the test framework traverses the shrink tree to find the simplest input that still triggers the failure.

The generation process starts with a random seed and a size parameter (which increases with each test iteration). Generators use the seed for deterministic random number generation, ensuring reproducible test failures. The size parameter controls the complexity of generated values -- larger size produces longer strings, bigger numbers, and deeper structures, gradually exploring more of the input space.

Custom generators for domain types are built by composing primitive generators and applying transformations. The key design principle is that generators should produce values that are valid according to the domain's invariants. Invalid inputs should be tested separately through targeted negative test cases, not through generators that might waste testing budget on obviously invalid combinations.

## Usage in Prismatic Platform

The Prismatic Platform uses StreamData generators throughout its test suite for storage adapter contract testing, OSINT data validation, and agent behavior verification.

```elixir
defmodule Prismatic.Generators do
  @moduledoc """
  Domain-specific generators for property-based testing
  across the Prismatic Platform. Provides generators for
  entities, OSINT tool configurations, events, and
  agent commands.
  """

  use ExUnitProperties

  @spec entity_generator() :: StreamData.t(map())
  def entity_generator do
    gen all(
      name <- string(:alphanumeric, min_length: 1, max_length: 100),
      entity_type <- member_of([:person, :company, :organization]),
      external_id <- string(:alphanumeric, length: 8),
      source <- member_of([:ares, :justice, :isir, :forbes, :manual])
    ) do
      %{
        name: name,
        entity_type: entity_type,
        external_id: external_id,
        source: source,
        attributes: %{},
        created_at: DateTime.utc_now()
      }
    end
  end

  @spec osint_tool_config_generator() :: StreamData.t(map())
  def osint_tool_config_generator do
    gen all(
      slug <- string(:alphanumeric, min_length: 3, max_length: 30),
      name <- string(:printable, min_length: 5, max_length: 80),
      category <- member_of([:czech, :global, :sanctions, :eu, :uk, :us, :universal]),
      api_style <- member_of([:source, :provider]),
      requires_auth <- boolean(),
      field_count <- integer(1..5),
      fields <- list_of(input_field_generator(), length: field_count)
    ) do
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
    gen all(
      name <- atom(:alphanumeric),
      type <- member_of([:text, :number, :email, :url, :select]),
      required <- boolean()
    ) do
      %{name: name, type: type, label: Atom.to_string(name), required: required}
    end
  end

  @spec event_generator() :: StreamData.t(map())
  def event_generator do
    gen all(
      event_type <- member_of(["entity.created", "tool.executed", "scan.completed", "agent.started"]),
      source <- string(:alphanumeric, min_length: 5, max_length: 30),
      payload_keys <- list_of(atom(:alphanumeric), min_length: 1, max_length: 5),
      payload_values <- list_of(string(:alphanumeric), length: length(payload_keys))
    ) do
      %{
        event_type: event_type,
        source: source,
        payload: Enum.zip(payload_keys, payload_values) |> Map.new(),
        occurred_at: DateTime.utc_now()
      }
    end
  end
end
```

These generators are used in adapter contract tests (`PrismaticStorage.AdapterContractTest`), ensuring that every storage backend handles the full range of valid inputs correctly. The OSINT tool registry tests use the `osint_tool_config_generator` to verify that the self-registration system handles all valid configurations.

## Cross-References

- **Property Testing** -- Testing methodology using generators
- **StreamData** -- Elixir property testing library
- [Testing](@/glossary/testing.md) -- Broader testing practices
- [F1 Score](@/glossary/f1-score.md) -- Evaluating test-driven model quality
- **Livebooks**: `quality_testing/` notebooks demonstrate property-based testing
- **Academy**: Topics on testing methodology cover generator design

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
