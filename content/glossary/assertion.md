+++
title = "Assertion"
weight = 50
[extra]
description = "A programmatic statement that verifies a condition is true at a specific point in code execution, serving as the foundation of automated testing and runtime invariant checking"
category = "quality"
related_terms = ["benchmark", "completeness", "accuracy", "code-smell", "contract", "compliance", "axiom"]
tags = ["glossary", "assertion", "testing", "exunit", "verification", "invariant", "quality", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "beginner"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Assertions are the atomic units of verification in the Prismatic Platform's testing infrastructure, enforcing correctness guarantees across 121+ tests with ExUnit's pattern-matching assertions"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["assertion", "assert", "ExUnit", "testing", "verification", "invariant", "pattern matching", "test assertion", "refute", "runtime check"]
image = "/images/sections/glossary.png"
image_alt = "Assertion - Prismatic Platform"
word_count = 950
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An assertion is a programmatic statement that declares a condition expected to be true at a specific point during code execution. When the condition holds, execution continues normally. When it fails, the assertion raises an error with diagnostic information, halting execution and signaling a defect. Assertions are the atomic building blocks of automated testing -- every test ultimately reduces to one or more assertions verifying that observed behavior matches expected behavior.

In the Prismatic Platform, assertions power the ExUnit test suite (121+ tests), quality gate verification, runtime invariant checking, and the White Team's formal verification evidence system.

## Technical Deep Dive

### Assertion Types

| Type | Purpose | Example | Failure Behavior |
|------|---------|---------|-----------------|
| **Test assertion** | Verify expected behavior | `assert result == :ok` | Test failure |
| **Pattern assertion** | Verify data shape | `assert {:ok, %{id: _}} = call()` | Test failure |
| **Runtime assertion** | Guard invariants | Function guard clauses | Runtime error |
| **Contract assertion** | Verify API contracts | `assert_schema(response)` | Integration failure |
| **Property assertion** | Statistical verification | `assert property(...)` | Property failure |

### ExUnit Assertion Macros

```elixir
# Truthiness
assert value                    # Passes if value is truthy
refute value                    # Passes if value is falsy

# Equality with pattern matching
assert {:ok, result} = function_call()
assert %{name: "test"} = map_value

# Exception assertions
assert_raise ArgumentError, fn -> bad_call() end
assert_raise RuntimeError, ~r/expected/, fn -> bad_call() end

# Receive assertions (for message passing)
assert_receive {:message, _payload}, 5000
refute_receive :unexpected_message
```

## Architecture and Implementation

```elixir
defmodule PrismaticQuality.InvariantChecker do
  @moduledoc """
  Runtime invariant assertion system for the Prismatic Platform.
  Checks critical invariants at system boundaries and emits
  telemetry events on violations for monitoring.
  """

  @type invariant_result :: :ok | {:violation, String.t(), map()}

  @spec assert_invariant(atom(), (-> boolean()), map()) :: :ok
  def assert_invariant(name, check_fn, context \\ %{}) do
    if check_fn.() do
      :ok
    else
      :telemetry.execute(
        [:prismatic, :invariant, :violation],
        %{count: 1},
        %{invariant: name, context: context}
      )

      raise "Invariant violation: #{name} -- #{inspect(context)}"
    end
  end

  @spec check_invariant(atom(), (-> boolean()), map()) :: invariant_result()
  def check_invariant(name, check_fn, context \\ %{}) do
    if check_fn.() do
      :ok
    else
      {:violation, "#{name} failed", context}
    end
  end
end
```

## Usage in Prismatic Platform

- **ExUnit Tests**: 121+ tests using `assert`, `refute`, `assert_receive`, `assert_raise` across all umbrella apps
- **Quality Gates**: Assertions verify zero warnings, zero Credo violations, and coverage thresholds
- **Contract Tests**: Adapter contract test suites use assertions to verify storage adapter compliance
- **White Team Proofs**: Formal assertions in verification campaigns
- **Pre-commit Hooks**: 11-phase pre-commit asserts quality standards before allowing commits
- **Runtime Guards**: Elixir guard clauses serve as runtime assertions on function inputs

## Code Examples

### Adapter Contract Test Assertions

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Shared assertion suite for storage adapter compliance testing.
  Every adapter must pass these assertions to be considered compliant.
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      test "stores and retrieves data" do
        key = "test-#{System.unique_integer()}"
        value = %{data: "test"}

        assert :ok = unquote(adapter).put(key, value)
        assert {:ok, ^value} = unquote(adapter).get(key)
      end

      test "returns error for missing keys" do
        assert {:error, :not_found} = unquote(adapter).get("nonexistent-key")
      end

      test "deletes existing keys" do
        key = "delete-test-#{System.unique_integer()}"
        assert :ok = unquote(adapter).put(key, %{})
        assert :ok = unquote(adapter).delete(key)
        assert {:error, :not_found} = unquote(adapter).get(key)
      end
    end
  end
end
```

## Best Practices

1. **One assertion per test when possible**: Each test should verify a single behavior for clear failure diagnostics.

2. **Use pattern-matching assertions**: `assert {:ok, %{id: id}} = result` is more expressive and precise than `assert result != nil`.

3. **Include meaningful failure messages**: `assert valid?, "Expected user #{id} to be valid but validation failed"`.

4. **Assert both positive and negative cases**: Test that correct inputs succeed AND incorrect inputs fail appropriately.

5. **Use `refute` for negative assertions**: `refute Enum.empty?(list)` is clearer than `assert length(list) > 0`.

6. **Never write assertions that always pass**: An assertion that cannot fail provides no value. This is a NO MERCY doctrine violation.

## Related Terms

- [Benchmark](@/glossary/benchmark.md) -- performance assertions against baselines
- **Completeness** -- assertion coverage of requirements
- **Contract** -- formal behavior agreements verified by assertions
- [Axiom](@/glossary/axiom.md) -- foundational truths analogous to assertions in formal logic
- **Code Smell** -- patterns indicating missing assertions

## See Also

- [ExUnit Documentation](https://hexdocs.pm/ex_unit/ExUnit.html) -- Elixir test framework
- [Quality Gates](@/glossary/quality-gates.md) -- assertion-based quality enforcement
- [Regression Testing](@/glossary/regression-testing.md) -- assertion-based regression prevention

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
