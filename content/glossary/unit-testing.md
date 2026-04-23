+++
title = "Unit Testing"
description = "Comprehensive guide to unit testing in Elixir using ExUnit, covering test isolation, mocking boundaries, property-based testing, test organization, and the Prismatic Platform's 100% coverage mandate."
weight = 42

[extra]
category = "quality"
tags = ["unit-testing", "exunit", "testing", "quality", "test-isolation", "property-based-testing", "mocking", "tdd", "coverage", "assertions"]
related_terms = ["exunit", "test-coverage", "testing", "property-based-testing", "quality-gates", "credo", "dialyzer", "regression-testing", "typespec", "behaviour", "pattern-matching", "telemetry"]
keywords = ["Elixir unit testing ExUnit", "unit test isolation patterns", "mocking boundaries Elixir", "property-based testing StreamData", "ExUnit best practices", "test coverage enforcement", "Elixir test organization", "async test concurrency", "test-driven development Elixir", "assertion patterns ExUnit"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
learning_outcomes = ["Write isolated unit tests using ExUnit", "Understand the difference between unit, integration, and property-based tests", "Apply mocking at boundaries using behaviours instead of mock libraries", "Implement property-based testing with StreamData", "Organize test suites for a large umbrella application", "Enforce coverage requirements through quality gates"]
prerequisites = ["exunit", "pattern-matching", "behaviour", "typespec", "quality-gates"]
see_also = ["test-coverage", "regression-testing", "property-based-testing", "credo", "dialyzer"]
word_count = 1126
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Unit Testing - Prismatic Platform"
+++

## Definition and Overview

Unit testing is the practice of verifying that individual functions and modules behave correctly in isolation from external dependencies. In the Prismatic Platform, unit tests are the first line of defense in a multi-layered quality strategy that includes [property-based testing](@/glossary/property-based-testing.md), integration tests, [regression tests](@/glossary/regression-testing.md), [static analysis](@/glossary/static-analysis.md) via [Dialyzer](@/glossary/dialyzer.md), and style enforcement via [Credo](@/glossary/credo.md). Every piece of code in the platform must have comprehensive tests -- this is not a guideline but a blocking requirement enforced by [pre-commit hooks](@/glossary/pre-commit-hooks.md) and [quality gates](@/glossary/quality-gates.md).

[ExUnit](@/glossary/exunit.md) is Elixir's built-in test framework and the only test framework used in the Prismatic Platform. It provides assertion macros, test organization through `describe` blocks, setup callbacks, async execution, and integration with Mix for test discovery and execution. ExUnit's design philosophy aligns with OTP principles: tests are processes, test isolation is achieved through process isolation, and test state is managed through the same mechanisms (GenServers, ETS, supervision) used in production code.

The Prismatic Platform's testing mandate is absolute: zero stubs, zero mocks in production code, zero placeholders, zero TODOs in test files, and 100% coverage of business logic. The NO MERCY doctrine applies to testing with the same force it applies to production code. A test that passes but does not actually verify the behavior under test (a "green lie") is worse than no test at all because it creates false confidence. Every test must assert something meaningful about the system's behavior.

## ExUnit Fundamentals

### Test Structure

Every test file in the Prismatic Platform follows the Arrange-Act-Assert pattern with descriptive test names:

```elixir
defmodule PrismaticPerimeter.SecurityRatingTest do
  @moduledoc """
  Unit tests for the SecurityRating module.
  Tests the scoring algorithm, grade assignment, and edge cases.
  """

  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  describe "calculate/2" do
    test "returns A grade for score above 800" do
      # Arrange
      findings = build_findings(critical: 0, high: 0, medium: 2, low: 5)

      # Act
      result = SecurityRating.compute_score(findings)

      # Assert
      assert {:ok, %{score: score, grade: :A}} = result
      assert score >= 800
    end

    test "returns F grade for score below 350" do
      findings = build_findings(critical: 10, high: 20, medium: 15, low: 30)

      assert {:ok, %{score: score, grade: :F}} = SecurityRating.compute_score(findings)
      assert score < 350
    end

    test "returns error for empty findings" do
      assert {:error, :no_findings} = SecurityRating.compute_score([])
    end

    test "weights critical findings 10x more than low findings" do
      critical_only = build_findings(critical: 1, high: 0, medium: 0, low: 0)
      low_only = build_findings(critical: 0, high: 0, medium: 0, low: 10)

      {:ok, %{score: critical_score}} = SecurityRating.compute_score(critical_only)
      {:ok, %{score: low_score}} = SecurityRating.compute_score(low_only)

      # One critical finding should impact score more than ten low findings
      assert critical_score < low_score
    end
  end

  defp build_findings(opts) do
    Enum.flat_map(opts, fn {severity, count} ->
      for _i <- 1..count, do: %{severity: severity, category: :test}
    end)
  end
end
```

### Async Test Execution

ExUnit runs test modules concurrently when `async: true` is set. This is the default for unit tests in the Prismatic Platform because unit tests, by definition, should not depend on shared state.

```elixir
# GOOD: Async test -- no shared state, runs in parallel
defmodule PrismaticPerimeter.DomainValidatorTest do
  use ExUnit.Case, async: true  # Runs concurrently with other async test modules

  # ...tests that only call pure functions...
end

# REQUIRED for shared state: Async false
defmodule PrismaticStorage.EctoAdapterTest do
  use ExUnit.Case, async: false  # Sequential execution required for database tests

  # ...tests that read/write shared database...
end
```

### Setup and Teardown

ExUnit provides `setup` and `setup_all` callbacks for test fixture management:

```elixir
defmodule PrismaticPerimeter.AssetRegistryTest do
  @moduledoc """
  Tests for the AssetRegistry GenServer.
  Each test gets its own ETS table to ensure isolation.
  """

  use ExUnit.Case, async: true

  setup do
    # Each test gets a unique table name based on the test PID
    table_name = :"test_registry_#{inspect(self())}"
    table = :ets.new(table_name, [:set, :public])

    on_exit(fn ->
      :ets.delete(table)
    end)

    %{table: table}
  end

  test "registers a new asset", %{table: table} do
    asset = %{domain: "example.com", type: :domain, discovered_at: DateTime.utc_now()}

    assert :ok = AssetRegistry.register(table, asset)
    assert [{_key, ^asset}] = :ets.lookup(table, "example.com")
  end

  test "prevents duplicate registration", %{table: table} do
    asset = %{domain: "example.com", type: :domain, discovered_at: DateTime.utc_now()}

    assert :ok = AssetRegistry.register(table, asset)
    assert {:error, :already_registered} = AssetRegistry.register(table, asset)
  end
end
```

## Test Isolation Principles

Test isolation means that each test runs independently, producing the same result regardless of execution order, parallelism, or the results of other tests. Isolation failures are the most common source of flaky tests.

### Isolation Strategies

| Strategy | Use Case | Implementation |
|----------|----------|----------------|
| Pure functions | Most unit tests | No shared state to isolate |
| Unique ETS tables | GenServer/ETS tests | Per-test table names |
| Ecto Sandbox | Database tests | `Ecto.Adapters.SQL.Sandbox` |
| Process isolation | Process-dependent tests | Start process in test setup |
| Unique identifiers | Tests that create named resources | `System.unique_integer()` suffixes |

### Pure Function Testing (Preferred)

The simplest and most reliable form of unit testing: call a function with known inputs, assert the output matches expectations. No setup, no teardown, no shared state, no flakiness.

```elixir
defmodule PrismaticPerimeter.ScoreCalculatorTest do
  @moduledoc """
  Tests for the pure scoring functions.
  All tests are async because they test pure functions with no side effects.
  """

  use ExUnit.Case, async: true

  alias PrismaticPerimeter.ScoreCalculator

  describe "normalize_score/2" do
    test "clamps score to 300-900 range" do
      assert 300 = ScoreCalculator.normalize_score(-50, {300, 900})
      assert 900 = ScoreCalculator.normalize_score(1500, {300, 900})
      assert 600 = ScoreCalculator.normalize_score(600, {300, 900})
    end

    test "rounds to nearest integer" do
      assert 651 = ScoreCalculator.normalize_score(650.7, {300, 900})
      assert 650 = ScoreCalculator.normalize_score(650.4, {300, 900})
    end
  end

  describe "weighted_average/2" do
    test "computes weighted average of category scores" do
      scores = [
        %{category: :network, score: 80, weight: 0.3},
        %{category: :application, score: 60, weight: 0.5},
        %{category: :data, score: 90, weight: 0.2}
      ]

      # 80*0.3 + 60*0.5 + 90*0.2 = 24 + 30 + 18 = 72
      assert 72.0 = ScoreCalculator.weighted_average(scores)
    end

    test "returns 0.0 for empty score list" do
      assert 0.0 = ScoreCalculator.weighted_average([])
    end
  end
end
```

### Process-Based Test Isolation

When testing GenServers or other stateful processes, start a fresh instance for each test:

```elixir
defmodule PrismaticClaude.StackConversationTest do
  @moduledoc """
  Tests for the StackConversation GenServer.
  Each test starts its own instance to ensure complete isolation.
  """

  use ExUnit.Case, async: true

  alias PrismaticClaude.StackConversation

  setup do
    # Start a uniquely named instance for this test
    name = :"stack_#{System.unique_integer([:positive])}"
    {:ok, pid} = StackConversation.start_link(name: name)

    on_exit(fn ->
      if Process.alive?(pid), do: GenServer.stop(pid)
    end)

    %{pid: pid, name: name}
  end

  test "pushes frame onto stack", %{name: name} do
    frame = %{input: "test query", output: "test response"}

    assert :ok = StackConversation.push(name, frame)
    assert {:ok, [^frame]} = StackConversation.get_stack(name)
  end

  test "pops frames from stack", %{name: name} do
    StackConversation.push(name, %{input: "frame 1", output: "response 1"})
    StackConversation.push(name, %{input: "frame 2", output: "response 2"})

    assert {:ok, popped} = StackConversation.pop(name, 1)
    assert length(popped) == 1

    {:ok, remaining} = StackConversation.get_stack(name)
    assert length(remaining) == 1
  end
end
```

## Mocking at Boundaries

The Prismatic Platform forbids mock libraries (Mox, Mock, etc.) in production code. Instead, mocking is achieved through [behaviours](@/glossary/behaviour.md) -- Elixir's native interface mechanism. A behaviour defines a callback specification. The production module implements the behaviour. The test module provides a lightweight test implementation.

### Behaviour-Based Dependency Injection

```elixir
# Step 1: Define the behaviour (contract)
defmodule PrismaticPerimeter.HTTPClient do
  @moduledoc """
  Behaviour for HTTP client operations.
  Production uses Req/Finch. Tests use a minimal implementation.
  """

  @callback get(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @callback post(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
end

# Step 2: Production implementation
defmodule PrismaticPerimeter.HTTPClient.Req do
  @moduledoc """
  Production HTTP client using Req.
  """

  @behaviour PrismaticPerimeter.HTTPClient

  @impl PrismaticPerimeter.HTTPClient
  @spec get(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def get(url, opts \\ []) do
    case Req.get(url, opts) do
      {:ok, %{status: 200, body: body}} -> {:ok, body}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl PrismaticPerimeter.HTTPClient
  @spec post(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
  def post(url, body, opts \\ []) do
    case Req.post(url, json: body, opts: opts) do
      {:ok, %{status: status, body: response}} when status in 200..299 -> {:ok, response}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end
end

# Step 3: Test implementation
defmodule PrismaticPerimeter.HTTPClient.Test do
  @moduledoc """
  Test HTTP client that returns predetermined responses.
  Used in unit tests to avoid network calls.
  """

  @behaviour PrismaticPerimeter.HTTPClient

  @impl PrismaticPerimeter.HTTPClient
  def get(_url, _opts) do
    {:ok, %{"status" => "ok", "data" => []}}
  end

  @impl PrismaticPerimeter.HTTPClient
  def post(_url, _body, _opts) do
    {:ok, %{"id" => "test-123", "status" => "created"}}
  end
end

# Step 4: Module under test accepts the client as a dependency
defmodule PrismaticPerimeter.Scanner do
  @moduledoc """
  Attack surface scanner. Accepts HTTP client as a compile-time config
  or runtime parameter for testability.
  """

  @http_client Application.compile_env(:prismatic_perimeter, :http_client, PrismaticPerimeter.HTTPClient.Req)

  @spec scan_domain(String.t(), module()) :: {:ok, list()} | {:error, term()}
  def scan_domain(domain, client \\ @http_client) do
    with {:ok, dns_data} <- client.get("https://dns.api/lookup/#{domain}"),
         {:ok, cert_data} <- client.get("https://crt.sh/?q=#{domain}&output=json") do
      {:ok, merge_results(dns_data, cert_data)}
    end
  end

  defp merge_results(dns, cert), do: [dns: dns, certificates: cert]
end

# Step 5: Test uses the test client
defmodule PrismaticPerimeter.ScannerTest do
  use ExUnit.Case, async: true

  alias PrismaticPerimeter.Scanner
  alias PrismaticPerimeter.HTTPClient.Test, as: TestClient

  test "scan_domain returns merged results" do
    assert {:ok, results} = Scanner.scan_domain("example.com", TestClient)
    assert Keyword.has_key?(results, :dns)
    assert Keyword.has_key?(results, :certificates)
  end
end
```

### Why Behaviours Over Mox

| Criterion | Behaviours | Mox |
|-----------|-----------|-----|
| Compile-time verification | Yes -- Dialyzer checks implementations | Partial |
| Production code visibility | Explicit in module | Hidden in test setup |
| Reusability | Test module reused across test files | Mock setup repeated per test |
| Documentation | Behaviour module documents the contract | Contract implicit in mock expectations |
| Runtime overhead | Zero | Mox process overhead |
| Platform policy | Allowed | Forbidden in production code |

## Property-Based Testing

[Property-based testing](@/glossary/property-based-testing.md) complements unit testing by generating hundreds of random inputs and verifying that invariants hold for all of them. Where unit tests verify specific examples, property tests verify universal truths.

```elixir
defmodule PrismaticPerimeter.ScoreCalculatorPropertyTest do
  @moduledoc """
  Property-based tests for scoring functions.
  Verifies invariants that must hold for ALL possible inputs.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  alias PrismaticPerimeter.ScoreCalculator

  property "normalized scores are always within the specified range" do
    check all raw_score <- float(min: -1000.0, max: 2000.0),
              min_score <- integer(0..500),
              max_score <- integer(501..1000) do
      result = ScoreCalculator.normalize_score(raw_score, {min_score, max_score})

      assert result >= min_score
      assert result <= max_score
    end
  end

  property "weighted average is always between min and max component scores" do
    check all scores <- list_of(
                          fixed_map(%{
                            category: atom(:alphanumeric),
                            score: float(min: 0.0, max: 100.0),
                            weight: float(min: 0.01, max: 1.0)
                          }),
                          min_length: 1,
                          max_length: 20
                        ) do
      result = ScoreCalculator.weighted_average(scores)
      min_score = scores |> Enum.map(& &1.score) |> Enum.min()
      max_score = scores |> Enum.map(& &1.score) |> Enum.max()

      assert result >= min_score - 0.01  # Float tolerance
      assert result <= max_score + 0.01
    end
  end

  property "grade assignment is monotonically decreasing with score" do
    check all score_a <- integer(300..900),
              score_b <- integer(300..900),
              score_a > score_b do
      grade_a = ScoreCalculator.score_to_grade(score_a)
      grade_b = ScoreCalculator.score_to_grade(score_b)

      grade_order = %{A: 5, B: 4, C: 3, D: 2, F: 1}
      assert Map.get(grade_order, grade_a) >= Map.get(grade_order, grade_b)
    end
  end
end
```

## Test Organization

### File Structure

Tests mirror the source file structure with a `_test.exs` suffix:

```
apps/prismatic_perimeter/
  lib/prismatic_perimeter/
    scanner.ex                 -> test/prismatic_perimeter/scanner_test.exs
    security_rating.ex         -> test/prismatic_perimeter/security_rating_test.exs
    compliance/
      nis2.ex                  -> test/prismatic_perimeter/compliance/nis2_test.exs
      zkb.ex                   -> test/prismatic_perimeter/compliance/zkb_test.exs
  test/
    support/
      fixtures.ex              # Shared test data builders
      test_helpers.ex           # Common test utilities
    test_helper.exs             # Test configuration
```

### Describe Blocks

Group tests by function under test, with clear descriptions:

```elixir
describe "validate_domain/1" do
  test "accepts valid domain names" do
    # ...
  end

  test "rejects empty strings" do
    # ...
  end

  test "rejects domains exceeding 253 characters" do
    # ...
  end
end

describe "discover_subdomains/2" do
  test "returns list of discovered subdomains" do
    # ...
  end

  test "handles DNS timeout gracefully" do
    # ...
  end
end
```

### Tags for Test Categorization

```elixir
# Tag slow tests for optional exclusion
@tag :slow
test "full domain scan completes within timeout" do
  # ...expensive test...
end

# Tag tests requiring external services
@tag :external
test "queries live DNS servers" do
  # ...requires network access...
end

# Run only fast tests during development
# mix test --exclude slow --exclude external
```

## Coverage Enforcement

The Prismatic Platform mandates comprehensive test coverage through automated gates:

### Coverage Configuration

```elixir
# In mix.exs for each umbrella app
def project do
  [
    test_coverage: [
      tool: ExCoveralls,
      summary: [threshold: 80]
    ]
  ]
end
```

### Quality Gate Integration

```bash
# Run tests with coverage reporting
mix test --cover

# Quality gates verify coverage threshold
mix quality.gates

# Pre-commit hook blocks commits with failing tests
# Phase 3: mix test (must pass)
# Phase 4: mix test --cover (must meet threshold)
```

### What Coverage Means (and Does Not Mean)

| Coverage Tells You | Coverage Does NOT Tell You |
|-------------------|--------------------------|
| Which lines were executed during tests | Whether the assertions are meaningful |
| Which branches were taken | Whether edge cases are covered |
| Which functions were called | Whether the function contract is verified |
| Where untested code exists | Whether the tests are correct |

100% line coverage is necessary but not sufficient. The Prismatic Platform supplements coverage metrics with mutation testing concepts: if you can change a line of code and no test fails, that line is not adequately tested regardless of coverage percentage.

## Regression Test Protocol

Every bug fix in the Prismatic Platform MUST include a regression test. This is a P0 absolute requirement with no bypass. The protocol is:

1. **Identify** the bug's root cause
2. **Write** a test that reproduces the bug (test must fail before fix)
3. **Apply** the fix
4. **Verify** the test passes after fix
5. **Report** completion

```elixir
defmodule PrismaticPerimeter.SecurityRatingRegressionTest do
  @moduledoc """
  Regression tests for SecurityRating bugs.
  Each test documents the original bug and verifies the fix.
  """

  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  # Regression: Issue #1234 -- scores below 300 caused FunctionClauseError
  # Root cause: score_to_grade/1 had no catch-all clause for negative scores
  # Fixed: Added guard clause for scores below 300
  test "handles scores below minimum range without crash" do
    # This would crash before the fix
    assert :F = SecurityRating.score_to_grade(100)
    assert :F = SecurityRating.score_to_grade(0)
    assert :F = SecurityRating.score_to_grade(-50)
  end
end
```

## Best Practices

**Test behavior, not implementation.** Assert what a function returns, not how it computes the result. Tests coupled to implementation details break when you refactor, even if the behavior is unchanged.

**One assertion per test when possible.** Tests with a single assertion have clear failure messages. When a multi-assertion test fails, the first failure obscures subsequent issues.

**Use descriptive test names.** The test name should describe the scenario and expected outcome. `test "returns error for empty domain"` is better than `test "test_empty"`.

**Avoid test interdependencies.** Each test must be self-contained. If test B depends on state created by test A, a failure in A cascades to B, making diagnosis harder.

**Write tests first for bug fixes.** Before fixing a bug, write a test that reproduces it. This ensures the fix actually addresses the problem and prevents regressions.

## Common Pitfalls

**Testing private functions directly.** Private functions are implementation details. Test them through the public API. If a private function is complex enough to warrant its own tests, it should probably be extracted into its own module.

**Flaky tests from shared state.** Tests that pass individually but fail when run together are sharing state through ETS tables, named processes, or the filesystem. Use unique identifiers and proper isolation.

**Meaningless assertions.** `assert result` only verifies the result is truthy. Use pattern matching: `assert {:ok, %{score: score}} = result` verifies both the structure and the success case.

**Overtesting framework behavior.** Do not test that Phoenix renders a template or that Ecto inserts a record. Test your business logic. Framework behavior is tested by the framework.

## Related Concepts

- [ExUnit](@/glossary/exunit.md) -- Elixir's built-in test framework
- [Test Coverage](@/glossary/test-coverage.md) -- Metrics measuring code execution during tests
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Generative testing with random inputs
- [Regression Testing](@/glossary/regression-testing.md) -- Tests preventing previously fixed bugs from recurring
- [Quality Gates](@/glossary/quality-gates.md) -- Automated checks enforcing test requirements
- [Behaviour](@/glossary/behaviour.md) -- Interface mechanism enabling boundary mocking
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis complementing runtime testing
- [Credo](@/glossary/credo.md) -- Code quality analysis alongside test verification
- [Typespec](@/glossary/typespec.md) -- Type specifications verified by Dialyzer
- [Pattern Matching](@/glossary/pattern-matching.md) -- Elixir feature enabling precise test assertions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications with their test suites
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
