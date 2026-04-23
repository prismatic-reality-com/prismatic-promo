+++
title = "Integration Test"
weight = 50
[extra]
description = "Testing strategy that verifies the correct interaction between multiple components, modules, or services working together."
category = "testing"
related_terms = ["unit-test", "end-to-end-test", "test-driven-development", "ecto"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["integration test", "testing", "multi-component", "Ecto sandbox", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Integration Test - Prismatic Platform"
+++

## Definition & Overview

An integration test verifies that multiple software components work correctly together. Unlike unit tests, which isolate individual functions or modules, integration tests exercise the interactions between components: database queries, API calls, message passing, and data transformations that cross module boundaries. They catch a class of bugs that unit tests cannot, such as interface mismatches, serialization errors, incorrect transaction boundaries, and timing issues in concurrent operations.

Integration tests sit in the middle of the testing pyramid, between fast and numerous unit tests at the base and slow but comprehensive end-to-end tests at the top. They provide a critical balance: they test real interactions (not mocked ones) while remaining fast enough to run frequently during development. A well-designed integration test suite catches the majority of production bugs because most failures occur at component boundaries rather than within individual functions.

In the Prismatic Platform, integration tests are mandatory for all cross-app interactions and database-backed features. The platform uses Ecto's SQL Sandbox for database test isolation, Phoenix's ConnTest for HTTP endpoint testing, and custom test helpers for OSINT adapter verification. The NO MERCY doctrine requires that every integration point has corresponding test coverage with no exceptions.

## Technical Deep Dive

The Elixir/Phoenix ecosystem provides excellent infrastructure for integration testing. Ecto's SQL Sandbox wraps each test in a database transaction that is rolled back after the test completes, providing perfect isolation without the overhead of recreating the database. `Phoenix.ConnTest` provides a test connection that simulates HTTP requests through the full Phoenix pipeline (router, plugs, controllers, views) without starting an actual HTTP server. LiveView test helpers simulate WebSocket connections for testing real-time interactions.

Integration tests in the Prismatic Platform follow a three-tier strategy. Module integration tests verify that functions across different modules within the same umbrella app work together correctly. App integration tests verify that facade functions from different umbrella apps compose correctly. System integration tests verify end-to-end workflows that span multiple apps, the database, and PubSub.

```elixir
defmodule PrismaticDd.Integration.PipelineTest do
  @moduledoc """
  Integration tests for the DD Client -> Loader pipeline.
  Verifies that fetched data is correctly normalized and persisted.
  """

  use PrismaticDd.DataCase, async: true

  alias PrismaticDd.Client
  alias PrismaticDd.Loader
  alias PrismaticDd.Schemas.EntityRecord
  alias PrismaticDd.Repo

  describe "fetch and load pipeline" do
    test "fetched records are normalized and persisted as entities" do
      # Arrange - set up source with test data
      source_config = %{
        slug: "test-source",
        group: :test,
        fetch_url: "https://test.example.com/api"
      }

      raw_records = [
        %{"name" => "Test Entity", "type" => "person", "id" => "TE001"},
        %{"name" => "Another Entity", "type" => "company", "id" => "AE002"}
      ]

      # Act - run the pipeline
      {:ok, fetch_run} = Client.store_fetch_results(source_config, raw_records)
      {:ok, load_run} = Loader.load_from_fetch(fetch_run.id)

      # Assert - verify entities were created
      entities = Repo.all(EntityRecord)
      assert length(entities) == 2

      person = Enum.find(entities, &(&1.entity_type == "person"))
      assert person.name == "Test Entity"
      assert person.source_slug == "test-source"

      # Verify load run metadata
      assert load_run.records_loaded == 2
      assert load_run.records_skipped == 0
      assert load_run.status == :completed
    end

    test "duplicate records are deduplicated via content hash" do
      source_config = %{slug: "dedup-test", group: :test}

      records = [%{"name" => "Entity", "type" => "person", "id" => "E1"}]

      # Load same data twice
      {:ok, run1} = Client.store_fetch_results(source_config, records)
      {:ok, _} = Loader.load_from_fetch(run1.id)

      {:ok, run2} = Client.store_fetch_results(source_config, records)
      {:ok, load_run} = Loader.load_from_fetch(run2.id)

      # Should skip duplicate
      assert load_run.records_skipped == 1
      assert load_run.records_loaded == 0

      # Only one entity in database
      assert Repo.aggregate(EntityRecord, :count) == 1
    end
  end
end
```

The `DataCase` helper module configures Ecto sandbox checkout, sets up test aliases, and provides factory functions for creating test data. Each integration test module declares `async: true` when possible, allowing parallel execution across CPU cores for faster feedback.

## Architecture & Implementation

The platform organizes integration tests by the boundary they exercise. Database integration tests live alongside the schemas they test, using Ecto sandbox for isolation. HTTP integration tests use `Phoenix.ConnTest` to exercise the full request pipeline. PubSub integration tests verify that events published by one module are correctly received and processed by subscribers. Cross-app integration tests are placed in the consuming app's test directory, testing the public API of the dependency.

Test data management follows the factory pattern rather than fixtures. Each app provides a test support module with factory functions that create valid records with sensible defaults. This approach avoids the fragility of shared fixtures while keeping test setup concise. The factories compose: a DD pipeline test can create a source, generate fetch records, and trigger loading in a few function calls.

The CI/CD pipeline runs integration tests in a dedicated phase after unit tests pass. Integration tests have access to a real PostgreSQL instance (not SQLite or in-memory alternatives), ensuring that PostgreSQL-specific features like JSONB queries, partial indexes, and advisory locks work correctly in tests.

## Usage in Prismatic Platform

OSINT adapter integration tests verify real API interaction patterns:

```elixir
defmodule PrismaticOsintCore.Integration.ToolExecutionTest do
  @moduledoc """
  Integration tests verifying OSINT tool execution pipeline:
  registration -> input validation -> execution -> result storage.
  """

  use PrismaticOsintCore.DataCase, async: true

  alias PrismaticOsintCore.ToolRegistry
  alias PrismaticOsintCore.Execution.ToolRunner

  describe "tool execution pipeline" do
    test "registered tool executes with valid input" do
      # Verify tool is registered
      assert {:ok, tool} = ToolRegistry.get("test-tool")
      assert tool.name == "Test OSINT Tool"

      # Execute with valid input
      input = %{query: "test-query"}
      {:ok, result} = ToolRunner.execute(tool.slug, input)

      # Verify result structure
      assert is_map(result)
      assert Map.has_key?(result, :data)
      assert Map.has_key?(result, :metadata)
      assert result.metadata.tool_slug == "test-tool"
      assert result.metadata.execution_time_ms > 0
    end

    test "execution with invalid input returns validation error" do
      {:ok, tool} = ToolRegistry.get("test-tool")

      # Missing required field
      input = %{}
      assert {:error, {:validation, errors}} = ToolRunner.execute(tool.slug, input)
      assert "query is required" in errors
    end

    test "execution results are stored in history" do
      {:ok, tool} = ToolRegistry.get("test-tool")
      input = %{query: "history-test"}

      {:ok, _result} = ToolRunner.execute(tool.slug, input)

      # Verify history entry was created
      history = ToolRunner.history(tool.slug, limit: 1)
      assert length(history) == 1
      assert hd(history).input == input
    end
  end
end
```

The `AdapterContractTest` macro provides standardized integration test suites that any storage adapter can adopt, ensuring consistent behavior across ETS, Ecto, Meilisearch, and KuzuDB backends. This contract testing approach guarantees that swapping adapters never breaks consumer code.

## Cross-References

- **Unit Test** - Isolated component testing complementing integration tests
- **End-to-End Test** - Full system verification
- [Ecto](@/glossary/ecto.md) - Database wrapper providing SQL Sandbox for test isolation
- **Test-Driven Development** - Development methodology guiding test creation
- **Mutation Testing** - Verifying test effectiveness

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
