+++
title = "Unit Test"
weight = 50
[extra]
description = "Isolated test verifying a single module or function's behavior with controlled inputs and expected outputs"
category = "testing"
related_terms = ["testing", "exunit", "property-based-testing", "coverage"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["unit test", "testing", "ExUnit", "isolation", "test coverage", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Unit Test - Prismatic Platform"
+++

## Definition & Overview

A unit test is an automated test that verifies the behavior of a single, isolated unit of code, typically a function or module, by providing controlled inputs and asserting expected outputs. Unit tests form the foundation of the testing pyramid, executing quickly (milliseconds), requiring no external dependencies (databases, networks, filesystems), and providing precise failure localization. When a unit test fails, the developer knows exactly which function is broken and under what conditions.

The defining characteristic of a unit test is isolation. The code under test operates independently of external systems, with dependencies replaced by controlled substitutes. In the Prismatic Platform, this means testing pure functions directly and testing stateful modules (GenServers, ETS operations) with isolated process instances rather than shared global state. The platform's NO MERCY doctrine mandates 100% test coverage for all business logic, and unit tests provide the bulk of this coverage.

The Prismatic Platform uses ExUnit, Elixir's built-in testing framework, for all unit testing. ExUnit provides test organization via `describe` blocks, setup fixtures via `setup` callbacks, assertion macros, async test execution, and integration with `mix test` for running the full test suite. The platform's 121 tests span three phases: Phase 1 (36 Workflow/Step tests), Phase 2 (41 Storage/Web/Agent tests), and Phase 3 (44 End-to-End tests), with unit tests constituting the majority.

## Technical Deep Dive

Unit tests in the platform follow strict patterns enforced by the NO MERCY doctrine:

```elixir
defmodule PrismaticTransform.PipelineTest do
  @moduledoc """
  Unit tests for the transform pipeline, verifying
  step composition, error handling, and batch processing.
  """

  use ExUnit.Case, async: true

  alias PrismaticTransform.Pipeline

  describe "Pipeline.new/2" do
    test "creates pipeline with default error strategy" do
      pipeline = Pipeline.new("test-pipeline")

      assert pipeline.name == "test-pipeline"
      assert pipeline.steps == []
      assert pipeline.error_strategy == :halt
    end

    test "creates pipeline with custom error strategy" do
      pipeline = Pipeline.new("test-pipeline", error_strategy: :skip)

      assert pipeline.error_strategy == :skip
    end
  end

  describe "Pipeline.add_step/3" do
    test "appends step to pipeline" do
      pipeline =
        Pipeline.new("test")
        |> Pipeline.add_step("step1", &identity/1)
        |> Pipeline.add_step("step2", &identity/1)

      assert length(pipeline.steps) == 2
      assert [{"step1", _}, {"step2", _}] = pipeline.steps
    end
  end

  describe "Pipeline.run/2" do
    test "executes steps in order" do
      pipeline =
        Pipeline.new("test")
        |> Pipeline.add_step("double", fn data ->
          {:ok, Map.update!(data, :value, &(&1 * 2))}
        end)
        |> Pipeline.add_step("add_ten", fn data ->
          {:ok, Map.update!(data, :value, &(&1 + 10))}
        end)

      assert {:ok, %{value: 30}} = Pipeline.run(pipeline, %{value: 10})
    end

    test "halts on error with halt strategy" do
      pipeline =
        Pipeline.new("test", error_strategy: :halt)
        |> Pipeline.add_step("fail", fn _data -> {:error, :broken} end)
        |> Pipeline.add_step("never_reached", fn data -> {:ok, data} end)

      assert {:error, {"fail", :broken}} = Pipeline.run(pipeline, %{})
    end

    test "skips errors with skip strategy" do
      pipeline =
        Pipeline.new("test", error_strategy: :skip)
        |> Pipeline.add_step("fail", fn _data -> {:error, :broken} end)
        |> Pipeline.add_step("succeed", fn data ->
          {:ok, Map.put(data, :reached, true)}
        end)

      assert {:ok, %{reached: true}} = Pipeline.run(pipeline, %{})
    end
  end

  describe "Pipeline.run_batch/2" do
    test "separates successes from failures" do
      pipeline =
        Pipeline.new("test")
        |> Pipeline.add_step("validate", fn
          %{valid: true} = data -> {:ok, data}
          %{valid: false} -> {:error, :invalid}
        end)

      records = [
        %{valid: true, id: 1},
        %{valid: false, id: 2},
        %{valid: true, id: 3}
      ]

      {successes, failures} = Pipeline.run_batch(pipeline, records)

      assert length(successes) == 2
      assert length(failures) == 1
      assert Enum.all?(successes, &(&1.valid == true))
    end
  end

  defp identity(data), do: {:ok, data}
end
```

Testing GenServers requires starting isolated instances:

```elixir
defmodule PrismaticCache.TTLStoreTest do
  @moduledoc """
  Unit tests for TTL-based ETS cache with expiry verification.
  """

  use ExUnit.Case, async: true

  alias PrismaticCache.TTLStore

  setup do
    table_name = :"test_cache_#{System.unique_integer([:positive])}"

    {:ok, pid} = TTLStore.start_link(
      name: :"ttl_store_#{table_name}",
      table: table_name
    )

    %{table: table_name, pid: pid}
  end

  describe "put/4 and get/2" do
    test "stores and retrieves values", %{table: table} do
      :ok = TTLStore.put(table, "key1", "value1", 60_000)
      assert {:ok, "value1"} = TTLStore.get(table, "key1")
    end

    test "returns miss for non-existent keys", %{table: table} do
      assert :miss = TTLStore.get(table, "nonexistent")
    end

    test "returns miss for expired entries", %{table: table} do
      :ok = TTLStore.put(table, "key1", "value1", 1)
      Process.sleep(5)
      assert :miss = TTLStore.get(table, "key1")
    end
  end

  describe "get_or_fetch/4" do
    test "returns cached value on hit", %{table: table} do
      :ok = TTLStore.put(table, "key1", "cached", 60_000)

      result = TTLStore.get_or_fetch(table, "key1", 60_000, fn ->
        {:ok, "fresh"}
      end)

      assert {:ok, "cached"} = result
    end

    test "fetches and caches on miss", %{table: table} do
      fetch_count = :counters.new(1, [:atomics])

      result = TTLStore.get_or_fetch(table, "key1", 60_000, fn ->
        :counters.add(fetch_count, 1, 1)
        {:ok, "fetched"}
      end)

      assert {:ok, "fetched"} = result
      assert :counters.get(fetch_count, 1) == 1

      assert {:ok, "fetched"} = TTLStore.get(table, "key1")
    end
  end
end
```

## Architecture & Implementation

The platform's unit testing architecture follows established patterns:

**Test Organization**: Tests mirror the source code structure. For `lib/prismatic_transform/pipeline.ex`, the corresponding test lives at `test/prismatic_transform/pipeline_test.exs`. This convention makes it easy to find tests for any module.

**Async Execution**: All unit tests use `async: true` to enable parallel execution, dramatically reducing total test suite time. This is possible because unit tests are isolated and don't share state. Integration tests that depend on shared resources (database, ETS tables) use `async: false`.

**Contract Testing**: The `PrismaticStorage.AdapterContractTest` module provides a reusable test suite that verifies any storage adapter implements the required behaviour correctly. This pattern ensures all adapters (ETS, Ecto, Meilisearch, KuzuDB) meet the same behavioral contract.

**Property-Based Testing**: Beyond traditional example-based unit tests, the platform uses StreamData for property-based testing that generates random inputs and verifies properties hold across all of them. This catches edge cases that manual test case selection might miss.

## Usage in Prismatic Platform

Every module in the platform has corresponding unit tests. The pre-commit hook runs the full test suite, and the CI/CD pipeline requires 100% pass rate before deployment:

```elixir
defmodule PrismaticOsintCore.ToolRegistryTest do
  use ExUnit.Case, async: true

  alias PrismaticOsintCore.ToolRegistry

  setup do
    table = :"registry_#{System.unique_integer([:positive])}"
    {:ok, _pid} = ToolRegistry.start_link(table: table)
    %{table: table}
  end

  describe "register/1" do
    test "registers a tool configuration" do
      config = %{slug: "test-tool", name: "Test Tool", category: :global, module: TestTool}
      assert :ok = ToolRegistry.register(config)
    end
  end

  describe "get_tool/1" do
    test "retrieves registered tool" do
      config = %{slug: "test-tool", name: "Test Tool", category: :global, module: TestTool}
      ToolRegistry.register(config)

      assert {:ok, ^config} = ToolRegistry.get_tool("test-tool")
    end

    test "returns error for unregistered tool" do
      assert {:error, :not_found} = ToolRegistry.get_tool("nonexistent")
    end
  end

  describe "list_by_category/1" do
    test "filters tools by category" do
      ToolRegistry.register(%{slug: "czech-1", category: :czech, module: Czech1})
      ToolRegistry.register(%{slug: "global-1", category: :global, module: Global1})

      czech_tools = ToolRegistry.list_by_category(:czech)
      assert length(czech_tools) == 1
      assert hd(czech_tools).slug == "czech-1"
    end
  end
end
```

## Cross-References

- [Testing](@/glossary/testing.md) - Broader testing methodology
- [ExUnit](@/glossary/exunit.md) - Elixir test framework
- [Property-Based Testing](@/glossary/property-based-testing.md) - Generative testing approach
- **Coverage** - Test coverage measurement
- [Triage](@/glossary/triage.md) - Test failure prioritization

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
