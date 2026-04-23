+++
title = "ExUnit"
weight = 11
[extra]
category = "quality"
description = "Elixir's built-in unit testing framework providing assertions, async test execution, doctests, contract testing, and comprehensive test organization for the Prismatic Platform's 5,500+ test files."
related_terms = ["property-based-testing", "code-coverage", "qdp", "mix", "clean-run", "dialyzer", "typespec", "beam", "pattern-matching", "immutability", "genserver", "supervisor"]
use_cases = ["Unit testing business logic", "Contract testing storage adapters", "Documentation verification via doctests", "Integration testing API endpoints", "Regression prevention"]
key_benefit = "Built-in async execution model leveraging BEAM processes for true parallel testing across 115 umbrella applications"
platforms = ["Prismatic Platform", "Elixir"]
programming_languages = ["Elixir", "Erlang"]
difficulty = "Intermediate"
prerequisites = ["Elixir basics", "Pattern matching", "OTP concepts"]
test_count = "5,500+"
umbrella_apps = 115
assertion_types = ["assert", "refute", "assert_raise", "assert_receive", "assert_in_delta"]
execution_modes = ["Async (parallel)", "Synchronous (sequential)", "Partitioned (CI)"]
coverage_tool = "Erlang :cover module"
doctest_support = true
contract_testing = true
ci_integration = "JUnitFormatter output"
async_model = "Per-module BEAM process isolation"
max_parallel = "System.schedulers_online() * 2"
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1381
date_modified = "2026-02-23"
keywords = ["ExUnit", "Elixirs", "Prismatic", "Platforms", "5500", "glossary", "quality", "Prismatic Platform", "BEAM", "Shows"]
tags = ["glossary", "quality", "exunit", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "ExUnit - Prismatic Platform"
+++

## Definition

ExUnit is Elixir's built-in unit testing framework, included in the standard library and requiring no external dependencies. It provides a complete testing infrastructure: test case organization through modules, rich assertion macros with detailed failure messages, setup and teardown callbacks at both test and module scope, asynchronous test execution for parallelism, doctests that verify code examples embedded in documentation, tag-based filtering for selective test runs, and comprehensive failure formatting with diff output for easy debugging.

ExUnit follows a deliberately simple design philosophy -- test modules are regular Elixir modules that `use ExUnit.Case`, and individual tests are functions defined with the `test` macro. This simplicity enables tests to leverage the full power of Elixir's [pattern matching](/glossary/pattern-matching/), [pipe operator](/glossary/pipe-operator/), and [immutable data](/glossary/immutability/) without framework-specific abstractions obscuring what is being tested.

The framework runs via `mix test` and integrates with the broader Elixir toolchain: [code coverage](/glossary/code-coverage/) reporting through Erlang's `:cover` module, [Dialyzer](/glossary/dialyzer/) type checking on test modules, and CI/CD pipeline integration through structured output formatters. ExUnit's async execution model spawns each test module as a separate [BEAM](/glossary/beam/) process, enabling true parallel execution while maintaining isolation -- a crashed test cannot affect other tests running concurrently.

## Historical Context and Design Philosophy

ExUnit was created by Jose Valim as part of the original Elixir standard library, drawing inspiration from Erlang's EUnit framework while incorporating ideas from Ruby's minitest and RSpec. The design prioritizes simplicity, composability, and leveraging the unique properties of the BEAM virtual machine.

The key insight in ExUnit's design is that the BEAM's process model provides natural test isolation. Each test module runs in its own process, which means that tests are truly isolated by the virtual machine itself -- not through mocking frameworks or dependency injection gymnastics. A test that causes a process crash does not affect other running tests because BEAM processes are independent and share no state. This architecture enables safe parallel execution without the fragile coordination mechanisms required by testing frameworks on shared-memory runtimes.

ExUnit's assertion macros are implemented using Elixir's macro system, which enables them to provide detailed failure messages that include the actual and expected values, source code location, and even structural diffs. The `assert left == right` macro, for example, captures both operands at compile time and presents them in a side-by-side diff on failure. This compile-time analysis makes ExUnit's error messages significantly more informative than runtime-only assertion libraries.

The framework's integration with [Mix](/glossary/mix/) provides lifecycle management: `mix test` automatically compiles test dependencies, starts required applications, runs tests in the configured order, and reports results. Mix also handles test partitioning for CI environments, seed-based randomization for test ordering, and stale-test detection for incremental testing during development.

## Implementation in Prismatic Platform

The Prismatic Platform maintains over 5,500 test files running through ExUnit across all 115 umbrella applications. The NO MERCY doctrine mandates 100% test coverage for all new code, with mandatory regression tests for every bug fix (the Mandatory Regression Test Protocol requires that every fix includes a test proving the bug existed and is now resolved). ExUnit is configured with `--warnings-as-errors` to catch test-time compilation warnings, ensuring the [Clean Run](/glossary/clean-run/) standard applies to test code as well as production code.

The platform uses ExUnit's async mode extensively for parallel test execution, reducing the full test suite runtime from what would be hours to minutes. Contract tests validate adapter compliance through shared test modules (`PrismaticStorage.AdapterContractTest`), ensuring that all storage implementations ([ETS](/glossary/ets/), Ecto, [Meilisearch](/glossary/meilisearch/), [KuzuDB](/glossary/kuzudb/)) behave identically. [Property-based testing](/glossary/property-based-testing/) via StreamData complements ExUnit's example-based tests for critical business logic.

## Test Structure and Organization

ExUnit tests follow the Arrange-Act-Assert pattern within a clean module structure:

```elixir
defmodule PrismaticPerimeter.SecurityRatingTest do
  @moduledoc """
  Tests for the SecurityRating module, verifying grade calculation,
  score normalization, and edge case handling.
  """

  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  describe "calculate/1" do
    test "returns A grade for score above 850" do
      # Arrange
      assets = build_assets(vulnerabilities: 0, tls_valid: true)

      # Act
      result = SecurityRating.calculate(assets)

      # Assert
      assert result.grade == :A
      assert result.score >= 850
      assert result.score <= 900
    end

    test "returns F grade when critical vulnerabilities exist" do
      assets = build_assets(vulnerabilities: 5, severity: :critical)

      result = SecurityRating.calculate(assets)

      assert result.grade == :F
      assert result.score < 400
    end

    test "returns error tuple for invalid input" do
      assert {:error, :invalid_assets} = SecurityRating.calculate(nil)
    end

    test "handles empty asset list gracefully" do
      assert {:error, :no_assets} = SecurityRating.calculate(%{assets: []})
    end
  end

  describe "normalize/2" do
    test "normalizes score to 0-100 range" do
      assert SecurityRating.normalize(750, {300, 900}) == 75.0
    end

    test "clamps at range boundaries" do
      assert SecurityRating.normalize(100, {300, 900}) == 0.0
      assert SecurityRating.normalize(1000, {300, 900}) == 100.0
    end
  end

  defp build_assets(opts) do
    %{
      vulnerabilities: Keyword.get(opts, :vulnerabilities, 0),
      tls_valid: Keyword.get(opts, :tls_valid, true),
      severity: Keyword.get(opts, :severity, :none)
    }
  end
end
```

| Element | Purpose | Usage |
|---------|---------|-------|
| `use ExUnit.Case` | Imports test macros and registers module | Required in every test module |
| `async: true` | Enables parallel execution with other async modules | Default for isolated tests |
| `describe` | Groups related tests under a named context | Organizes by function or scenario |
| `test` | Defines an individual test case | One assertion focus per test |
| `setup` | Runs before each test in the module | State initialization, fixture creation |
| `setup_all` | Runs once before all tests in the module | Expensive resource initialization |
| `@tag` | Attaches metadata to tests for filtering | Environment-specific, slow, integration |

## Assertion System

ExUnit provides rich assertions with detailed failure output including value diffs:

```elixir
# Value assertions
assert value == expected
assert value != other
assert value > threshold

# Pattern matching assertions
assert {:ok, %{grade: :A}} = SecurityRating.calculate(assets)
assert %{score: score} when score > 800 = result

# Exception assertions
assert_raise ArgumentError, fn ->
  SecurityRating.calculate("invalid")
end

assert_raise ArgumentError, ~r/expected.*map/, fn ->
  SecurityRating.calculate("invalid")
end

# Receive assertions (message passing)
assert_receive {:rating_calculated, ^entity_id}, 5000
refute_receive {:error, _}, 100

# Approximate assertions
assert_in_delta result.score, 780.0, 5.0

# Capture IO
assert capture_log(fn ->
  SecurityRating.calculate(%{invalid: true})
end) =~ "Invalid asset data"
```

| Assertion | Tests For | Failure Output |
|-----------|-----------|---------------|
| `assert expr` | Truthiness | Shows actual value |
| `assert left == right` | Equality with diff | Side-by-side value diff |
| `assert pattern = expr` | Pattern match | Shows non-matching value |
| `assert_raise` | Exception raising | Shows actual exception or none |
| `assert_receive` | Message arrival | Shows mailbox contents |
| `refute expr` | Falsiness | Shows truthy value |
| `assert_in_delta` | Approximate equality | Shows delta exceeded |
| `capture_log` | Log output capture | Shows captured vs expected |

## Setup and Teardown Callbacks

ExUnit provides two levels of setup callbacks for test fixture management:

```elixir
defmodule PrismaticAgents.RegistryIntegrationTest do
  @moduledoc """
  Integration tests for the agent registry, verifying registration,
  lookup, and deregistration across the lifecycle.
  """

  use ExUnit.Case, async: true

  # Runs once before all tests -- expensive initialization
  setup_all do
    {:ok, pid} = PrismaticAgents.Registry.start_link(name: :test_registry)
    %{registry: pid}
  end

  # Runs before each test -- per-test state
  setup %{registry: registry} do
    agent = PrismaticAgents.Registry.register(registry, :test_agent, %{tier: :l2})
    on_exit(fn -> PrismaticAgents.Registry.deregister(registry, agent.id) end)
    %{agent: agent}
  end

  test "registered agent is discoverable", %{registry: registry, agent: agent} do
    assert {:ok, ^agent} = PrismaticAgents.Registry.lookup(registry, agent.id)
  end

  test "deregistered agent returns not_found", %{registry: registry, agent: agent} do
    :ok = PrismaticAgents.Registry.deregister(registry, agent.id)
    assert {:error, :not_found} = PrismaticAgents.Registry.lookup(registry, agent.id)
  end

  test "registry handles concurrent registrations", %{registry: registry} do
    tasks =
      for i <- 1..100 do
        Task.async(fn ->
          PrismaticAgents.Registry.register(registry, :"agent_#{i}", %{tier: :l4})
        end)
      end

    results = Task.await_many(tasks)
    assert Enum.all?(results, &match?(%{id: _}, &1))
  end
end
```

The `on_exit/1` callback registers cleanup functions that execute after the test completes, regardless of pass/fail status. This ensures resources are properly released even when tests crash.

## Async Execution Model

ExUnit's async execution leverages the [BEAM](/glossary/beam/) to run test modules in parallel:

| Mode | Declaration | Behavior | Use When |
|------|-------------|----------|----------|
| **Async** | `use ExUnit.Case, async: true` | Runs concurrently with other async modules | Tests have no shared state |
| **Synchronous** | `use ExUnit.Case` (default) | Runs sequentially, one module at a time | Tests share database, files, or ports |
| **Partitioned** | `mix test --partitions N` | Splits test suite across CI workers | Large suites in CI pipelines |

Within an async module, tests still execute sequentially. The parallelism is between modules -- multiple async modules run simultaneously as separate BEAM processes. Synchronous modules execute alone, ensuring they have exclusive access to shared resources like databases.

```bash
# Run all tests with parallel execution
mix test

# Run specific test file
mix test test/prismatic_perimeter/security_rating_test.exs

# Run specific test by line number
mix test test/prismatic_perimeter/security_rating_test.exs:15

# Run only tagged tests
mix test --only integration

# Exclude slow tests
mix test --exclude slow

# Run with coverage
mix test --cover

# Partition across CI nodes
MIX_TEST_PARTITION=1 mix test --partitions 4
```

## Doctests

ExUnit can extract and execute code examples from module documentation, ensuring documentation stays accurate:

```elixir
defmodule PrismaticPerimeter.RiskScore do
  @moduledoc """
  Calculates risk scores for discovered assets.

  ## Examples

      iex> PrismaticPerimeter.RiskScore.calculate(%{vuln_count: 0})
      {:ok, 0.0}

      iex> PrismaticPerimeter.RiskScore.calculate(%{vuln_count: 3})
      {:ok, 7.5}

  """

  @doc """
  Normalizes a score to the 0-100 range.

  ## Examples

      iex> PrismaticPerimeter.RiskScore.normalize(750, {300, 900})
      75.0

  """
  @spec normalize(number(), {number(), number()}) :: float()
  def normalize(score, {min, max}), do: (score - min) / (max - min) * 100

  @spec calculate(map()) :: {:ok, float()} | {:error, term()}
  def calculate(%{vuln_count: count}) when is_integer(count) and count >= 0 do
    {:ok, count * 2.5}
  end

  def calculate(_), do: {:error, :invalid_input}
end

# In the test file
defmodule PrismaticPerimeter.RiskScoreTest do
  use ExUnit.Case, async: true
  doctest PrismaticPerimeter.RiskScore
end
```

Doctests serve a dual purpose: they keep documentation accurate by treating code examples as executable tests, and they provide living examples that developers can trust to be correct. Any documentation drift from actual behavior is caught immediately.

## Contract Testing Pattern

Prismatic uses a shared contract test pattern to verify that all storage adapter implementations conform to the same behaviour:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Shared contract tests for all storage adapters.
  Ensures that ETS, Ecto, Meilisearch, and KuzuDB adapters
  all conform to the same storage behaviour contract.

  Usage:
      defmodule PrismaticStorage.ETS.AdapterTest do
        use PrismaticStorage.AdapterContractTest,
          adapter_module: PrismaticStorage.ETS
      end
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter_module)

      describe "#{inspect(@adapter)} contract compliance" do
        test "stores and retrieves a value" do
          assert :ok = @adapter.put("key", "value")
          assert {:ok, "value"} = @adapter.get("key")
        end

        test "returns error for missing key" do
          assert {:error, :not_found} = @adapter.get("nonexistent_#{System.unique_integer()}")
        end

        test "deletes a value" do
          key = "delete_test_#{System.unique_integer()}"
          :ok = @adapter.put(key, "value")
          assert :ok = @adapter.delete(key)
          assert {:error, :not_found} = @adapter.get(key)
        end

        test "overwrites existing value" do
          key = "overwrite_test_#{System.unique_integer()}"
          :ok = @adapter.put(key, "first")
          :ok = @adapter.put(key, "second")
          assert {:ok, "second"} = @adapter.get(key)
        end

        test "lists all stored entries" do
          key = "list_test_#{System.unique_integer()}"
          :ok = @adapter.put(key, "value")
          assert {:ok, entries} = @adapter.list()
          assert is_list(entries)
        end
      end
    end
  end
end

# Applied to each adapter
defmodule PrismaticStorage.ETS.AdapterTest do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.ETS
end

defmodule PrismaticStorage.Ecto.AdapterTest do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.Ecto
end
```

## Regression Testing Protocol

The Mandatory Regression Test Protocol requires that every bug fix includes a test proving the bug existed and is now resolved:

```elixir
defmodule PrismaticPerimeter.SecurityRating.RegressionTest do
  @moduledoc """
  Regression tests for SecurityRating bugs.
  Each test documents the original bug, proves the fix works,
  and prevents regression.
  """

  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  describe "regression: ISSUE-1234 score overflow with many assets" do
    test "score does not exceed 900 regardless of asset count" do
      # Bug: scores could exceed the 300-900 range when asset count > 1000
      # Root cause: unclamped sum in aggregate_scores/1
      assets = build_many_assets(1500)

      {:ok, rating} = SecurityRating.calculate(assets)

      assert rating.score <= 900
      assert rating.score >= 300
    end
  end

  describe "regression: ISSUE-1256 nil vulnerability count crash" do
    test "handles nil vulnerability count without crashing" do
      # Bug: nil vuln_count caused ArithmeticError in score calculation
      # Root cause: missing nil check in calculate_vulnerability_score/1
      assets = %{vulnerabilities: nil, tls_valid: true}

      assert {:error, :invalid_assets} = SecurityRating.calculate(assets)
    end
  end

  defp build_many_assets(count) do
    for _ <- 1..count do
      %{vulnerabilities: :rand.uniform(3), tls_valid: true, severity: :low}
    end
  end
end
```

## Test Configuration

ExUnit is configured in `test/test_helper.exs` and through Mix configuration:

```elixir
# test/test_helper.exs
ExUnit.start(
  capture_log: true,          # Suppress Logger output in tests
  max_cases: System.schedulers_online() * 2,
  exclude: [:skip],           # Default exclusions
  formatters: [ExUnit.CLIFormatter, JUnitFormatter],
  seed: 0                     # Deterministic ordering (set to nil for random)
)

# In mix.exs
def project do
  [
    test_coverage: [tool: ExCoveralls],
    preferred_cli_env: [
      coveralls: :test,
      "coveralls.html": :test
    ]
  ]
end
```

## Test Tagging and Filtering

ExUnit's tag system allows tests to be categorized and selectively executed:

```elixir
defmodule PrismaticPerimeter.IntegrationTest do
  use ExUnit.Case

  @moduletag :integration

  @tag :slow
  test "full EASM scan of large domain" do
    # This test takes > 30 seconds
  end

  @tag timeout: 60_000
  test "complete compliance assessment" do
    # This test needs a longer timeout
  end

  @tag :external_api
  test "Shodan API integration" do
    # Requires network access and API key
  end
end
```

```bash
# Run only integration tests
mix test --only integration

# Exclude slow tests during development
mix test --exclude slow

# Run only external API tests
mix test --only external_api
```

## Best Practices

**Use Async Mode by Default**: Mark test modules with `async: true` unless they share mutable state (database, files, ports). Async modules run in parallel, dramatically reducing test suite execution time across the 115 umbrella applications.

**Follow Arrange-Act-Assert Pattern**: Structure every test with clear setup, execution, and verification phases. This makes tests self-documenting and easy to debug when they fail.

**Write Contract Tests for Shared Behaviors**: Use shared test modules (like `PrismaticStorage.AdapterContractTest`) to verify that all implementations of a behaviour conform to the same contract, preventing inconsistencies across storage adapters.

**Include Regression Tests for Every Bug Fix**: The Mandatory Regression Test Protocol requires that every bug fix includes a test proving the bug existed before the fix and is resolved after. This prevents regression and validates the fix.

**Use Doctests for Documentation Accuracy**: Add `iex>` examples to `@moduledoc` and `@doc` for public functions, then run them via `doctest` in test modules. This ensures documentation stays accurate as code evolves.

**Name Tests Descriptively**: Test names should describe the expected behavior, not the implementation. Prefer "returns error for invalid input" over "test_calculate_with_nil".

## Common Pitfalls

**Missing Async Isolation**: Using `async: true` on modules that share state (database tables, files, global ETS tables) causes flaky test failures. Only use async when tests are truly isolated.

**Overusing setup_all**: Heavy `setup_all` blocks that create complex state make tests harder to understand and debug. Prefer lightweight `setup` callbacks that create exactly what each test needs.

**Testing Implementation, Not Behavior**: Tests that assert on internal data structures rather than public API contracts become brittle when implementation changes. Test through the public interface.

**Ignoring Failure Messages**: ExUnit's detailed assertion messages are designed to make debugging fast. If a test failure message is unclear, the assertion choice may be wrong -- use pattern matching assertions instead of equality assertions when appropriate.

## Related Concepts

- [Property-Based Testing](/glossary/property-based-testing/) - Generative testing complementing ExUnit examples
- [Code Coverage](/glossary/code-coverage/) - Coverage measurement via `mix test --cover`
- [QDP](/glossary/qdp/) - Quality metric requiring comprehensive test coverage
- [Mix](/glossary/mix/) - Build tool that runs ExUnit via `mix test`
- [Clean Run](/glossary/clean-run/) - Zero-warning standard applied to test compilation
- [Dialyzer](/glossary/dialyzer/) - Static analysis applicable to test modules
- [BEAM](/glossary/beam/) - VM enabling async test execution through process isolation
- [Pattern Matching](/glossary/pattern-matching/) - Core assertion mechanism in ExUnit
- [Typespec](/glossary/typespec/) - Type annotations verified alongside tests
- [Immutability](/glossary/immutability/) - Data model ensuring test isolation
- [GenServer](/glossary/genserver/) - OTP pattern tested through ExUnit callbacks
- [Supervisor](/glossary/supervisor/) - Supervision tree testing patterns

## See Also

- [Architecture](/architecture/) - Platform testing architecture
- [Applications](/apps/) - Umbrella apps with independent test suites
- [Capabilities](/capabilities/) - Quality and testing capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
