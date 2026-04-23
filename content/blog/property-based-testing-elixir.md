+++
title = "Property-Based Testing in Elixir with StreamData"
date = 2026-03-04
description = "A practical guide to property-based testing using ExUnitProperties and StreamData, with real examples from validators, parsers, and encoders."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["testing", "elixir", "property-based-testing", "streamdata", "quality"]
reading_time = "11 min"
keywords = ["property-based testing elixir", "streamdata", "exunit properties", "generators", "shrinking"]
image = "/images/blog/property-based-testing-elixir.png"
word_count = 1420
date_created = "2026-03-04"
date_modified = "2026-03-04"
quality_score = 90
see_also = ["architecture", "developers", "error-handling-strategies"]
image_alt = "Property-Based Testing in Elixir - Prismatic Platform"
+++

Traditional example-based tests verify behavior against a handful of specific inputs. Property-based tests describe invariants that must hold for *any* valid input, then let the framework generate hundreds of random test cases to find violations. This post covers practical usage of `ExUnitProperties` and `StreamData` in the Prismatic Platform.

## Why Property-Based Testing Matters

Consider a URL validator. An example-based test might check:

```elixir
assert Validator.valid_url?("https://example.com")
refute Validator.valid_url?("not a url")
```

This covers two cases. A property-based test covers hundreds:

```elixir
property "all generated valid URLs pass validation" do
  check all scheme <- member_of(["http", "https"]),
            host <- string(:alphanumeric, min_length: 1, max_length: 63),
            tld <- member_of(["com", "org", "net", "io"]),
            path <- string(:alphanumeric, min_length: 0, max_length: 50) do
    url = "#{scheme}://#{host}.#{tld}/#{path}"
    assert Validator.valid_url?(url)
  end
end
```

Each test run generates 100 random combinations by default. Over time, this explores far more of the input space than hand-written examples ever could.

## Setting Up StreamData

Add the dependency to your `mix.exs`:

```elixir
defp deps do
  [
    {:stream_data, "~> 1.0", only: [:dev, :test]}
  ]
end
```

In your test files:

```elixir
defmodule MyApp.ValidatorPropertyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  # Properties go here
end
```

## Core Generators

StreamData provides generators for common types. These are the building blocks:

| Generator | Output | Example |
|---|---|---|
| `integer()` | Any integer | `-42`, `0`, `1337` |
| `positive_integer()` | Integers > 0 | `1`, `999` |
| `float()` | Any float | `-3.14`, `0.0`, `1.5e10` |
| `string(:alphanumeric)` | Alphanumeric strings | `"abc123"` |
| `binary()` | Raw binaries | `<<1, 2, 3>>` |
| `boolean()` | `true` or `false` | `true` |
| `atom(:alphanumeric)` | Random atoms | `:abc` |
| `list_of(generator)` | Lists of generated values | `[1, 3, 7]` |
| `map_of(key_gen, val_gen)` | Maps | `%{"a" => 1}` |
| `member_of(enumerable)` | One element from list | `"active"` from `["active", "inactive"]` |
| `one_of(generators)` | Value from one generator | Mixed types |

## Building Custom Generators

Real-world testing needs domain-specific generators. Here is a generator for a DD case entity as used in the platform:

```elixir
defmodule Prismatic.Generators do
  @moduledoc """
  StreamData generators for Prismatic domain types.
  """
  use ExUnitProperties

  @spec dd_case_params() :: StreamData.t(map())
  def dd_case_params do
    gen all name <- string(:alphanumeric, min_length: 3, max_length: 100),
            status <- member_of([:draft, :active, :completed, :archived]),
            priority <- member_of([:low, :medium, :high, :critical]),
            entity_count <- integer(0..50),
            confidence <- float(min: 0.0, max: 1.0) do
      %{
        name: name,
        status: status,
        priority: priority,
        entity_count: entity_count,
        confidence_score: Float.round(confidence, 4)
      }
    end
  end

  @spec email_address() :: StreamData.t(String.t())
  def email_address do
    gen all local <- string(:alphanumeric, min_length: 1, max_length: 64),
            domain <- string(:alphanumeric, min_length: 1, max_length: 63),
            tld <- member_of(["com", "org", "net", "io", "cz"]) do
      "#{local}@#{domain}.#{tld}"
    end
  end

  @spec ico_number() :: StreamData.t(String.t())
  def ico_number do
    gen all digits <- list_of(integer(0..9), length: 8) do
      Enum.join(digits)
    end
  end
end
```

## Real Property Examples

### Roundtrip Properties

The most powerful property pattern: encode then decode should return the original value.

```elixir
property "JSON roundtrip preserves DD case data" do
  check all params <- Prismatic.Generators.dd_case_params() do
    encoded = Jason.encode!(params)
    decoded = Jason.decode!(encoded, keys: :atoms)

    assert decoded.name == params.name
    assert decoded.status == Atom.to_string(params.status)
    assert decoded.entity_count == params.entity_count
  end
end

property "Base64 roundtrip preserves binary data" do
  check all data <- binary(min_length: 0, max_length: 10_000) do
    assert data == data |> Base.encode64() |> Base.decode64!()
  end
end
```

### Invariant Properties

These assert conditions that must always be true regardless of input:

```elixir
property "confidence scores are always between 0 and 1" do
  check all raw_score <- float(min: -100.0, max: 100.0) do
    normalized = Prismatic.DD.ScoringEngine.normalize_confidence(raw_score)
    assert normalized >= 0.0
    assert normalized <= 1.0
  end
end

property "sanitized strings never contain script tags" do
  check all input <- string(:printable, max_length: 500) do
    sanitized = Prismatic.Sanitizer.strip_html(input)
    refute String.contains?(sanitized, "<script")
    refute String.contains?(sanitized, "javascript:")
  end
end
```

### Commutative / Associative Properties

Mathematical properties that should hold for domain operations:

```elixir
property "merging entity lists is associative" do
  check all a <- list_of(entity_gen(), max_length: 20),
            b <- list_of(entity_gen(), max_length: 20),
            c <- list_of(entity_gen(), max_length: 20) do
    left = EntityMerger.merge(EntityMerger.merge(a, b), c)
    right = EntityMerger.merge(a, EntityMerger.merge(b, c))

    assert MapSet.new(left, & &1.id) == MapSet.new(right, & &1.id)
  end
end
```

### Idempotency Properties

Operations that should produce the same result when applied multiple times:

```elixir
property "deduplication is idempotent" do
  check all items <- list_of(string(:alphanumeric), max_length: 100) do
    once = Prismatic.Utils.deduplicate(items)
    twice = Prismatic.Utils.deduplicate(once)
    assert once == twice
  end
end
```

## Shrinking

When StreamData finds a failing case, it *shrinks* the input to the smallest value that still triggers the failure. This is automatic and makes debugging far easier.

For example, if a list of 47 elements triggers a bug, StreamData will try progressively smaller lists until it finds the minimal failing case, often a list of 1 or 2 elements.

Custom generators built with `gen all` get shrinking for free. If you build generators using `StreamData.bind/2` or `StreamData.map/2`, shrinking propagates through the composition.

```elixir
# This generator automatically shrinks each component independently
gen all name <- string(:alphanumeric, min_length: 1),
        age <- positive_integer(),
        tags <- list_of(atom(:alphanumeric), max_length: 5) do
  %{name: name, age: age, tags: tags}
end
```

If a test fails for `%{name: "xQ7", age: 42, tags: [:a, :b]}`, shrinking might reduce it to `%{name: "a", age: 1, tags: [:a]}`.

## Integration with TACH Doctrine

The Prismatic Platform's TACH doctrine mandates property-based tests for pure/stateless modules: validators, parsers, encoders, scoring functions. The enforcement checks for `ExUnitProperties` usage in test files corresponding to these module types:

```bash
# TACH audit checks for property test coverage
mix tach.audit --property-gaps
```

Modules flagged as pure (no side effects, no GenServer state, no database access) that lack property tests appear as advisory warnings during CI.

## Configuring Test Runs

Control the number of generated cases per property:

```elixir
# In test_helper.exs or per-test
@tag property_iterations: 500

property "holds for many inputs", %{property_iterations: n} do
  check all input <- integer(), max_runs: n do
    assert is_integer(input)
  end
end
```

For CI, we run 200 iterations. For local development, 100 is the default. For pre-release validation, 1000.

## Common Pitfalls

**Overly constrained generators** defeat the purpose. If your generator only produces values that your code handles correctly, you are testing nothing. Include edge cases: empty strings, zero, negative numbers, Unicode.

**Slow generators** can make property tests impractical. Avoid database calls inside generators. Properties should test pure logic.

**Flaky properties** from non-deterministic behavior (timestamps, random values inside the function under test) need careful handling. Inject dependencies rather than relying on system state.

## Summary

| Pattern | Use Case | Example |
|---|---|---|
| Roundtrip | Encode/decode, serialize/deserialize | JSON, Base64, protocol buffers |
| Invariant | Output constraints, bounds, sanitization | Confidence scores, HTML stripping |
| Commutative | Order-independent operations | Set operations, merges |
| Idempotent | Repeated application safety | Deduplication, normalization |
| Oracle | Compare against reference implementation | New parser vs regex, optimized vs naive |

Property-based testing finds bugs that example-based tests miss. Combined with the TACH doctrine's enforcement, it forms a safety net that grows stronger with every test run.
