+++
title = "ExUnit"
weight = 62
[extra]
category = "testing"
description = "Built-in test framework for Elixir with async support, doctests, and comprehensive assertion library"
url = "https://hexdocs.pm/ex_unit/"
version = "Built-in"
icon = "exunit"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1080
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ExUnit", "Built-in", "Elixir", "technologies", "testing", "Prismatic Platform", "Built", "Database", "Test"]
tags = ["technologies", "testing", "exunit", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "ExUnit - Prismatic Platform"
+++

## Overview

ExUnit is [Elixir](@/technologies/elixir.md)'s built-in testing framework and the foundation of the Prismatic Platform's comprehensive test suite spanning 5,864 test files. ExUnit provides async test execution, rich assertions, setup/teardown callbacks, test tagging, and doctest support -- all the tools needed for the platform's rigorous quality mandate. As a built-in framework, ExUnit is deeply integrated with the Mix build tool and the Elixir compiler, enabling features like automatic test discovery and compile-time test validation that external frameworks cannot provide.

The Prismatic Platform uses ExUnit for unit tests, integration tests, property-based tests, and contract tests across all 90 applications. The platform's test suite runs in parallel by default, leveraging the [BEAM](@/technologies/beam.md)'s concurrency to execute thousands of tests in seconds. Database tests use [Ecto](@/technologies/ecto.md)'s SQL Sandbox for isolation, enabling concurrent database tests without data leaks between test cases. This parallel execution capability is essential for maintaining fast feedback loops in a codebase with thousands of tests.

ExUnit's describe blocks, tags, and setup callbacks enable structured test organization that mirrors the platform's module hierarchy, making it straightforward to find and maintain tests alongside their corresponding implementation code. The platform's [NO MERCY](@/capabilities/no-mercy.md) doctrine requires comprehensive test coverage for all new code, with regression tests mandatory for every bug fix -- ExUnit is the tool that makes this achievable without sacrificing development velocity.

## Key Features

ExUnit provides a focused, powerful testing framework that leverages Elixir's language features for expressive and efficient tests.

- **Async Testing**: Concurrent test execution across CPU cores, with automatic isolation through the Ecto SQL Sandbox
- **Rich Assertions**: Pattern matching assertions (`assert {:ok, %{grade: :A}} = result`), exception assertions, and delta checks
- **Setup/Teardown**: Module-level and test-level setup callbacks with context passing for shared test fixtures
- **Doctests**: Test code examples embedded directly in `@doc` annotations, ensuring documentation stays accurate
- **Tags**: Test categorization and selective execution for separating fast unit tests from slow integration tests
- **Capture IO**: Standard output and log capture for asserting on logging behavior and console output
- **Describe Blocks**: Logical grouping of related tests with shared setup for organized test files
- **Callbacks**: `on_exit/2` for guaranteed cleanup regardless of test success or failure
- **Formatters**: Multiple output formats (dots, verbose, JSON) for different CI/CD and local development needs

| Feature | Description | Platform Usage |
|---------|-------------|----------------|
| `async: true` | Parallel test execution | Default for all non-database tests |
| Pattern matching assertions | `assert {:ok, %{grade: :A}} = result` | Structural result validation |
| `describe` blocks | Logical test grouping | One describe per public function |
| `setup` callbacks | Shared test fixtures | Database seeding, mock configuration |
| `@tag` annotations | Test categorization | `:slow`, `:integration`, `:property` |
| Doctests | Documentation-embedded tests | All public API functions |
| `capture_log` | Log output assertion | Error handling verification |
| Ecto Sandbox | Database isolation | Concurrent database test execution |

## Platform Integration

ExUnit tests cover all platform modules with strict coverage requirements. The platform follows the Arrange-Act-Assert pattern with pattern matching assertions for structural validation.

```elixir
defmodule PrismaticPerimeter.SecurityRatingTest do
  @moduledoc "Comprehensive tests for security rating computation."
  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  describe "compute_rating/1" do
    test "returns A grade for scores above 850" do
      assessment = %{
        ssl_score: 95,
        header_score: 90,
        vulnerability_score: 98,
        compliance_score: 92
      }

      assert {:ok, %{grade: :A, score: score}} = SecurityRating.compute_rating(assessment)
      assert score >= 850
    end

    test "returns F grade for critical vulnerabilities" do
      assessment = %{critical_vulns: 3, ssl_score: 0}

      assert {:ok, %{grade: :F, score: score}} = SecurityRating.compute_rating(assessment)
      assert score < 400
    end

    test "returns error for empty assessment" do
      assert {:error, :insufficient_data} = SecurityRating.compute_rating(%{})
    end

    test "handles nil values gracefully" do
      assessment = %{ssl_score: nil, header_score: 50}

      assert {:ok, %{grade: grade}} = SecurityRating.compute_rating(assessment)
      assert grade in [:C, :D, :F]
    end
  end
end
```

Contract tests ensure that storage adapters conform to the platform's behavior specifications:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Contract test macro for verifying storage adapter compliance.
  Any module using this test suite must implement the StorageAdapter behaviour.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      alias unquote(adapter_module), as: Adapter

      describe "get/1" do
        test "returns {:ok, value} for existing keys" do
          :ok = Adapter.put("test_key", "test_value")
          assert {:ok, "test_value"} = Adapter.get("test_key")
        end

        test "returns {:error, :not_found} for missing keys" do
          assert {:error, :not_found} = Adapter.get("nonexistent")
        end
      end

      describe "put/2" do
        test "stores and retrieves values" do
          :ok = Adapter.put("key", %{data: "complex"})
          assert {:ok, %{data: "complex"}} = Adapter.get("key")
        end

        test "overwrites existing values" do
          :ok = Adapter.put("key", "v1")
          :ok = Adapter.put("key", "v2")
          assert {:ok, "v2"} = Adapter.get("key")
        end
      end

      describe "delete/1" do
        test "removes existing keys" do
          :ok = Adapter.put("key", "value")
          :ok = Adapter.delete("key")
          assert {:error, :not_found} = Adapter.get("key")
        end

        test "returns :ok for nonexistent keys" do
          assert :ok = Adapter.delete("nonexistent")
        end
      end
    end
  end
end
```

## Architecture

ExUnit integrates into the platform's quality enforcement pipeline as the runtime correctness verification layer, complementing [Credo](@/technologies/credo.md)'s static style analysis and [Dialyzer](@/technologies/dialyzer.md)'s type checking.

| Quality Layer | Tool | What It Validates | Execution |
|--------------|------|-------------------|-----------|
| Type Safety | [Dialyzer](@/technologies/dialyzer.md) | Type correctness (static) | `mix dialyzer` |
| Code Quality | [Credo](@/technologies/credo.md) | Style and design (static) | `mix credo --strict` |
| Compilation | `mix compile` | Syntax and references | `--warnings-as-errors` |
| **Runtime Correctness** | **ExUnit** | **Behavior and logic** | **`mix test`** |
| Coverage | ExCoveralls | Untested code paths | `mix coveralls` |

The test directory structure mirrors the source code structure, with each module having a corresponding test file. The platform's CI pipeline runs all tests in parallel, leveraging BEAM concurrency for fast feedback.

```
Test Organization:

apps/prismatic_perimeter/
  lib/
    prismatic_perimeter/
      security_rating.ex          # Implementation
  test/
    prismatic_perimeter/
      security_rating_test.exs    # Unit tests
    prismatic_perimeter_test.exs  # Integration tests
    test_helper.exs               # Test configuration
```

## Performance Characteristics

ExUnit's async test execution leverages the BEAM's process model to run tests in parallel, dramatically reducing total test suite time.

| Metric | Value | Notes |
|--------|-------|-------|
| Test files | 5,864 | Across 90 umbrella applications |
| Parallel execution | Per-CPU-core | `async: true` tests run concurrently |
| Typical test time | 1-10ms per test | Unit tests without I/O |
| Database test time | 5-50ms per test | With Ecto SQL Sandbox |
| Full suite duration | 30-120 seconds | Depends on parallelism and test mix |
| Setup callback overhead | < 1ms | Minimal GenServer interaction |
| Compilation before test | 5-30 seconds | Incremental, only changed modules |

The Ecto SQL Sandbox enables database tests to run concurrently by wrapping each test in a transaction that is rolled back on completion. This eliminates the need for sequential test execution when tests interact with the database.

## Configuration

ExUnit is configured through `test_helper.exs` files in each application, with platform-wide settings for consistent behavior.

```elixir
# test/test_helper.exs - Platform standard configuration
ExUnit.start(
  capture_log: true,          # Capture log output during tests
  exclude: [:slow, :integration],  # Exclude slow tests by default
  max_cases: System.schedulers_online() * 2,  # Parallel test processes
  timeout: 60_000             # 60 second timeout per test
)

# Configure Ecto sandbox for concurrent database tests
Ecto.Adapters.SQL.Sandbox.mode(PrismaticStorage.Repo, :manual)
```

```elixir
# mix.exs test configuration
def project do
  [
    test_coverage: [tool: ExCoveralls],
    preferred_cli_env: [
      coveralls: :test,
      "coveralls.html": :test,
      "coveralls.json": :test
    ],
    elixirc_paths: elixirc_paths(Mix.env())
  ]
end

defp elixirc_paths(:test), do: ["lib", "test/support"]
defp elixirc_paths(_), do: ["lib"]
```

Running tests with various options:

```bash
# Run all tests
mix test

# Run with coverage reporting
mix test --cover

# Run only a specific test file
mix test test/prismatic_perimeter/security_rating_test.exs

# Run tests matching a tag
mix test --include integration

# Run tests with verbose output
mix test --trace

# Run tests with seed for reproducibility
mix test --seed 12345
```

## Best Practices

The platform enforces testing conventions that ensure comprehensive coverage and maintainable test suites.

- **Use `async: true` by default** -- all tests that do not share mutable state should run concurrently for faster feedback
- **One `describe` block per public function** -- organize tests logically with shared setup for each function being tested
- **Test edge cases and error conditions** -- happy path tests are necessary but insufficient; test boundary values, nil inputs, and error returns
- **Use pattern matching in assertions** -- `assert {:ok, %{grade: :A}} = result` is more expressive and catches structural issues
- **Write regression tests for every bug fix** -- the platform's mandatory regression test protocol requires a test that would have caught the bug
- **Use `capture_log` for error handling tests** -- verify that error conditions produce appropriate log output without leaking to test output
- **Name tests descriptively** -- test names should read as specifications: "returns A grade for scores above 850"
- **Keep test setup minimal** -- use `setup` callbacks for shared fixtures, but keep individual tests self-contained when possible
- **Use tags for test categorization** -- tag slow tests with `@tag :slow` and integration tests with `@tag :integration` for selective execution

## Comparison

ExUnit was chosen as the platform's test framework because it is built into Elixir, deeply integrated with Mix, and provides the async testing capabilities essential for a large test suite.

| Criterion | ExUnit | RSpec (Ruby) | pytest (Python) | Jest (JavaScript) |
|-----------|--------|-------------|-----------------|-------------------|
| Language integration | Built-in | Gem | Package | Package |
| Async execution | Native (BEAM processes) | Parallel gem | pytest-xdist | Native workers |
| Pattern matching | First-class assertions | Custom matchers | N/A | N/A |
| Doctests | Built-in | N/A | Built-in | N/A |
| Database isolation | Ecto Sandbox | Database Cleaner | pytest-django | Manual |
| Setup/teardown | Callbacks + context | before/after blocks | fixtures | beforeEach/afterEach |
| Describe blocks | Built-in | Built-in | Classes | Built-in |
| Test tagging | Built-in tags | Tags/groups | Markers | N/A |
| Coverage | ExCoveralls integration | SimpleCov | pytest-cov | Built-in |

## Related Technologies

- [Elixir](@/technologies/elixir.md) - The language providing ExUnit as a built-in standard library module
- [Dialyzer](@/technologies/dialyzer.md) - Static type analysis that complements ExUnit's runtime testing
- [Credo](@/technologies/credo.md) - Code quality analysis that complements ExUnit's correctness testing
- [Ecto](@/technologies/ecto.md) - Database library providing the SQL Sandbox for concurrent test isolation
- [BEAM](@/technologies/beam.md) - Runtime enabling parallel test execution through lightweight processes

## Related Apps

- All 90 Prismatic Platform applications use ExUnit for comprehensive testing with strict coverage requirements
- [prismatic_safety](@/apps/prismatic-safety.md) - Quality Floor Guardian monitoring test coverage and pass rates
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Security-critical code with extensive property-based and contract tests
- [prismatic_storage_core](@/apps/prismatic-storage-core.md) - Defines contract test macros used by all storage adapter implementations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)