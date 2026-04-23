+++
title = "Test Suite"
weight = 50
[extra]
description = "Organized collection of automated tests covering unit, integration, property-based, and end-to-end scenarios for comprehensive quality verification"
category = "testing"
related_terms = ["exunit", "testing", "property-based-testing", "coverage", "regression", "ci-cd", "quality-gates"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["test suite", "automated testing", "ExUnit", "quality", "coverage", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing", "quality"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Test Suite - Prismatic Platform"
+++

## Definition & Overview

A test suite is a structured collection of automated tests organized by scope, purpose, and execution characteristics. A well-designed test suite covers multiple testing levels: unit tests verify individual functions in isolation, integration tests verify module interactions, property-based tests verify behavioral invariants across random inputs, and end-to-end tests verify complete user-facing workflows. The suite is designed to be run frequently (on every commit, in CI, before deployment) and to provide fast, reliable feedback about code correctness.

Test suites differ from ad-hoc test collections in their intentional organization. Tests are grouped by feature, tagged by execution speed, and ordered by dependency. Fast unit tests run first (providing instant feedback), followed by slower integration tests, with comprehensive end-to-end tests running last. This tiered execution strategy maximizes developer productivity by surfacing failures as early as possible.

The Prismatic Platform maintains 121+ tests organized across three phases. Phase 1 contains 36 workflow and step tests. Phase 2 contains 41 storage, web, and agent tests. Phase 3 contains 44 end-to-end tests. The NO MERCY doctrine requires 100% test coverage on all business logic, mandatory regression tests for every bug fix, and zero test skips without documented justification. The test suite runs in CI as a blocking quality gate -- code that fails any test cannot be merged.

## Technical Deep Dive

### Test Organization with ExUnit

The platform organizes tests using ExUnit's module and describe structure:

```elixir
defmodule PrismaticOsintCore.ToolRegistryTest do
  @moduledoc """
  Test suite for the OSINT Tool Registry.
  Covers registration, lookup, and concurrent access patterns.
  """

  use ExUnit.Case, async: true

  alias PrismaticOsintCore.ToolRegistry

  setup do
    # Each test gets a fresh ETS table
    table = :ets.new(:test_registry, [:named_table, :set, :public])
    on_exit(fn -> :ets.delete(table) end)
    {:ok, table: table}
  end

  describe "register/1" do
    test "registers a tool configuration" do
      config = %{slug: "test-tool", name: "Test Tool", category: :global}
      assert :ok = ToolRegistry.register(config)
    end

    test "overwrites existing registration with same slug" do
      config1 = %{slug: "test-tool", name: "Version 1", category: :global}
      config2 = %{slug: "test-tool", name: "Version 2", category: :global}

      ToolRegistry.register(config1)
      ToolRegistry.register(config2)

      {:ok, result} = ToolRegistry.lookup("test-tool")
      assert result.name == "Version 2"
    end
  end

  describe "lookup/1" do
    test "returns tool by slug" do
      config = %{slug: "ares", name: "ARES", category: :czech}
      ToolRegistry.register(config)

      assert {:ok, %{slug: "ares", name: "ARES"}} = ToolRegistry.lookup("ares")
    end

    test "returns error for unknown slug" do
      assert {:error, :not_found} = ToolRegistry.lookup("nonexistent")
    end
  end

  describe "concurrent access" do
    test "handles concurrent reads during writes" do
      # Register initial tools
      for i <- 1..100 do
        ToolRegistry.register(%{slug: "tool-#{i}", name: "Tool #{i}", category: :global})
      end

      # Concurrent reads and writes
      tasks =
        for i <- 1..50 do
          Task.async(fn ->
            ToolRegistry.lookup("tool-#{i}")
          end)
        end

      results = Task.await_many(tasks)
      assert Enum.all?(results, &match?({:ok, _}, &1))
    end
  end
end
```

### Contract Test Suite

The platform's reusable contract test suite validates adapter implementations:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Reusable test suite that validates any storage adapter
  against the full PrismaticStorage.Core interface.
  Used by every adapter's test module.
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      describe "#{inspect(@adapter)} contract: basic operations" do
        test "put and get roundtrip" do
          assert {:ok, value} = @adapter.put("key", %{data: "test"}, test_opts())
          assert {:ok, ^value} = @adapter.get("key", test_opts())
        end

        test "get returns nil for missing keys" do
          assert {:ok, nil} = @adapter.get("missing", test_opts())
        end

        test "delete removes entries" do
          {:ok, _} = @adapter.put("key", "value", test_opts())
          assert :ok = @adapter.delete("key", test_opts())
          assert {:ok, nil} = @adapter.get("key", test_opts())
        end
      end

      describe "#{inspect(@adapter)} contract: collection operations" do
        test "count returns entry count" do
          {:ok, _} = @adapter.put("a", 1, test_opts())
          {:ok, _} = @adapter.put("b", 2, test_opts())
          assert {:ok, count} = @adapter.count(test_opts())
          assert count >= 2
        end

        test "exists? returns correct boolean" do
          {:ok, _} = @adapter.put("exists", true, test_opts())
          assert {:ok, true} = @adapter.exists?("exists", test_opts())
          assert {:ok, false} = @adapter.exists?("nope", test_opts())
        end
      end
    end
  end
end
```

### Test Tagging and Selective Execution

```elixir
defmodule PrismaticDd.PipelineIntegrationTest do
  use ExUnit.Case

  @moduletag :integration

  @tag :slow
  test "full pipeline processes 100 entities" do
    {:ok, result} = PrismaticDd.Pipeline.execute(:test_source)
    assert result.stage_results[:load].count == 100
  end

  @tag :requires_db
  test "entities persist to PostgreSQL" do
    {:ok, _} = PrismaticDd.Pipeline.execute(:test_source)
    assert PrismaticDd.Repo.aggregate(PrismaticDd.Schemas.EntityRecord, :count) > 0
  end
end

# Run specific test categories:
# mix test --only unit          # Fast unit tests
# mix test --only integration   # Integration tests
# mix test --only slow          # Slow tests
# mix test --cover              # With coverage report
```

## Architecture & Implementation

The test suite architecture follows the testing pyramid: many fast unit tests at the base, fewer integration tests in the middle, and a small number of end-to-end tests at the top. This structure ensures that most failures are caught quickly by unit tests, while integration and E2E tests catch issues that unit tests miss (incorrect wiring, protocol mismatches, environmental dependencies).

Each umbrella application maintains its own test suite in `apps/<app>/test/`. Tests are isolated: they set up their own state, run assertions, and clean up. Async tests (`async: true`) run in parallel across CPU cores, reducing total suite execution time. Tests that require shared resources (database connections, named ETS tables) use `async: false` and setup/teardown hooks.

The CI pipeline runs the full test suite in the `test` stage, after compilation and before static analysis. Test failures block the entire pipeline, preventing untested code from reaching quality gates or deployment stages. Coverage reports (`mix test --cover`) are generated and tracked, with the NO MERCY doctrine requiring 100% coverage on business logic.

## Usage in Prismatic Platform

The test suite is run at every stage of development:

```elixir
# Run all tests
# mix test

# Run with coverage
# mix test --cover

# Run specific app tests
# mix test apps/prismatic_dd/test/

# Run tagged tests
# mix test --only integration
```

## Cross-References

- [ExUnit](@/glossary/exunit.md) - Elixir testing framework powering the test suite
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing method included in the suite
- [Quality Gates](@/glossary/quality-gates.md) - Enforcement system that requires test suite passage
- [CI/CD](@/glossary/ci-cd.md) - Pipeline running the test suite automatically

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
