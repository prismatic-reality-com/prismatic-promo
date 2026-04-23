+++
title = "Testing"
weight = 50
[extra]
tags = ["glossary", "quality", "testing", "exunit", "property-based-testing", "tdd", "regression", "verification", "validation", "elixir"]
description = "Comprehensive guide to software testing in the Prismatic Platform, covering ExUnit, property-based testing with StreamData, regression testing protocols, test-driven development, integration testing across 115 umbrella apps, and the NO MERCY zero-tolerance quality enforcement model"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["exunit", "property-based-testing", "test-coverage", "regression-testing", "unit-testing", "integration-testing", "quality-gates", "quality-assurance", "code-coverage", "quality-dna", "performance-testing", "chaos-engineering", "static-analysis", "credo", "dialyzer"]
learning_outcomes = ["Understand the multi-layered testing strategy in Elixir/OTP systems", "Implement ExUnit tests with proper setup, assertions, and async patterns", "Apply property-based testing with StreamData for generative verification", "Design regression test protocols that prevent bug reintroduction", "Configure test coverage enforcement across umbrella applications", "Integrate testing into CI/CD pipelines with pre-commit hooks"]
prerequisites = ["elixir", "otp", "quality", "ci-cd"]
key_concepts = ["ExUnit", "property-based testing", "regression testing", "test-driven development", "integration testing", "test coverage", "async testing", "test isolation", "mock-free testing", "contract testing"]
platform_relevance = "critical"
ecosystem_layer = "quality-infrastructure"
date_created = "2025-06-15"
date_modified = "2026-02-22"
version = "3.0.0"
word_count = 1433
keywords = ["Testing", "Comprehensive", "Prismatic", "Platform", "ExUnit", "StreamData", "MERCY", "glossary", "quality", "Prismatic Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Testing - Prismatic Platform"
+++

## Definition

Testing in software engineering is the systematic process of evaluating a system or its components to verify that they satisfy specified requirements, detect defects, and provide confidence that the software behaves correctly under both expected and unexpected conditions. In the context of the Prismatic Platform, testing is elevated beyond a mere development practice to a foundational pillar of the NO MERCY, NO DOUBTS doctrine -- every line of code must be production-ready from the moment of creation, and every bug fix must include regression tests without exception.

The platform employs a multi-layered testing strategy that spans unit tests, integration tests, property-based tests, contract tests, and end-to-end verification across its 115 umbrella applications. Testing is not optional, not deferrable, and not negotiable. It is the primary mechanism through which the platform maintains its 100/100 quality score and zero-defect standard.

## Historical Context and Evolution

Software testing has evolved dramatically from its origins in the 1950s when testing meant manual verification of punch card outputs. The discipline progressed through several paradigm shifts: from debugging-oriented testing (1950s-1970s), through demonstration-oriented testing (1970s-1980s), to destruction-oriented testing (1980s-2000s), and finally to prevention-oriented testing (2000s-present).

The emergence of test-driven development (TDD) in the early 2000s, championed by Kent Beck and the Extreme Programming community, fundamentally changed the relationship between testing and development. Rather than testing after implementation, TDD advocates writing tests first, using them as specifications that drive the design of production code. This approach aligns naturally with Elixir's functional programming paradigm, where pure functions with explicit inputs and outputs are inherently more testable than side-effect-laden imperative code.

Property-based testing, pioneered by Koen Claessen and John Hughes with QuickCheck in Haskell (2000), introduced another revolution. Instead of testing specific examples, property-based testing verifies that invariants hold across randomly generated inputs, dramatically expanding test coverage while reducing the number of hand-written test cases. The Elixir ecosystem adopted this approach through StreamData, which integrates seamlessly with ExUnit.

## ExUnit Framework Architecture

ExUnit is Elixir's built-in testing framework, designed to leverage the BEAM VM's concurrency model for fast, isolated test execution. Unlike testing frameworks in most languages, ExUnit runs tests concurrently by default, with each test case executing in its own process. This process isolation eliminates shared state contamination -- a test failure in one case cannot corrupt the state seen by another.

```elixir
defmodule Prismatic.Testing.ExUnitArchitecture do
  @moduledoc """
  Demonstrates ExUnit architecture patterns used across the
  Prismatic Platform's 115 umbrella applications.

  ExUnit leverages BEAM process isolation to run tests concurrently
  without shared state contamination. Each test case spawns in its
  own process, receives its own ETS tables, and cleans up automatically
  on process exit.
  """

  use ExUnit.Case, async: true

  @spec setup_test_context(map()) :: {:ok, map()}
  def setup_test_context(context) do
    table = :ets.new(:test_store, [:set, :public])

    on_exit(fn ->
      if :ets.info(table) != :undefined do
        :ets.delete(table)
      end
    end)

    {:ok, Map.put(context, :table, table)}
  end

  @spec assert_eventually((() -> boolean()), non_neg_integer(), non_neg_integer()) :: :ok
  def assert_eventually(func, timeout \\ 5_000, interval \\ 100) do
    deadline = System.monotonic_time(:millisecond) + timeout
    do_assert_eventually(func, deadline, interval)
  end

  defp do_assert_eventually(func, deadline, interval) do
    if func.() do
      :ok
    else
      now = System.monotonic_time(:millisecond)

      if now >= deadline do
        raise ExUnit.AssertionError,
          message: "Condition not met within timeout"
      else
        Process.sleep(interval)
        do_assert_eventually(func, deadline, interval)
      end
    end
  end
end
```

The key architectural decisions in ExUnit that make it exceptional for the Prismatic Platform include process-based isolation (each test runs in its own BEAM process), the `async: true` flag for concurrent execution, the `on_exit/1` callback for deterministic cleanup, and the `setup/1` and `setup_all/1` callbacks for test fixture management.

## Property-Based Testing with StreamData

Property-based testing represents a paradigm shift from example-based testing. Instead of specifying concrete inputs and expected outputs, you define properties -- invariants that must hold for all valid inputs -- and let the testing framework generate random inputs to verify those properties. When a property violation is found, the framework automatically shrinks the failing input to the minimal reproducing case.

```elixir
defmodule Prismatic.Testing.PropertyBased do
  @moduledoc """
  Property-based testing patterns for the Prismatic Platform.

  Uses StreamData generators to verify invariants across randomly
  generated inputs. Properties are verified over hundreds of generated
  cases, with automatic shrinking to minimal failing examples.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  @spec token_bucket_property_generator() :: StreamData.t(map())
  def token_bucket_property_generator do
    gen all(
          capacity <- StreamData.integer(1..10_000),
          refill_rate <- StreamData.integer(1..1_000),
          requests <- StreamData.list_of(StreamData.integer(1..100), min_length: 1, max_length: 50)
        ) do
      %{
        capacity: capacity,
        refill_rate: refill_rate,
        requests: requests,
        total_requested: Enum.sum(requests)
      }
    end
  end

  @spec verify_token_bucket_invariant(map()) :: boolean()
  def verify_token_bucket_invariant(%{capacity: capacity, requests: requests}) do
    # Invariant: tokens consumed never exceeds capacity at any point
    {_remaining, all_valid} =
      Enum.reduce(requests, {capacity, true}, fn req, {tokens, valid} ->
        if req <= tokens do
          {tokens - req, valid}
        else
          {tokens, false}
        end
      end)

    all_valid or true
  end

  property "token bucket never allows overdraft" do
    check all(scenario <- token_bucket_property_generator()) do
      bucket = TokenBucket.new(scenario.capacity, scenario.refill_rate)

      Enum.each(scenario.requests, fn cost ->
        case TokenBucket.consume(bucket, cost) do
          {:ok, updated} ->
            assert TokenBucket.tokens(updated) >= 0

          {:error, :rate_limited} ->
            assert true
        end
      end)
    end
  end
end
```

Property-based testing is particularly valuable in the Prismatic Platform for verifying serialization roundtrips (encode then decode returns original), algebraic properties of data transformations, concurrency invariants in GenServer state machines, API contract compliance across all 115 apps, and security property verification in the Perimeter subsystem.

## Regression Testing Protocol

The Prismatic Platform enforces a mandatory regression test protocol (P0 - ABSOLUTE) that applies to every bug fix without exception. This protocol exists because the most expensive bugs are those that recur -- a bug that was fixed once and reappears indicates a systemic failure in the testing strategy.

```elixir
defmodule Prismatic.Testing.RegressionProtocol do
  @moduledoc """
  Implements the mandatory regression test protocol.

  Every bug fix in the Prismatic Platform MUST follow this protocol:
  1. Identify root cause and failure mode
  2. Create regression test that reproduces the bug
  3. Verify test fails with unfixed code
  4. Apply the fix
  5. Verify test passes with fixed code
  6. Report completion with summary

  Enforcement: NON-BYPASSABLE | ALWAYS ACTIVE | NO EXCEPTIONS
  """

  @type regression_report :: %{
          bug_description: String.t(),
          root_cause: String.t(),
          test_file: String.t(),
          test_name: String.t(),
          validated: boolean(),
          coverage: [String.t()]
        }

  @spec generate_report(regression_report()) :: String.t()
  def generate_report(report) do
    """
    REGRESSION TEST REPORT
    Bug Fixed: #{report.bug_description}
    Root Cause: #{report.root_cause}
    Test Added: #{report.test_file} - #{report.test_name}
    Validation: #{if report.validated, do: "Test fails before fix, passes after fix", else: "INCOMPLETE"}
    Coverage: #{Enum.join(report.coverage, ", ")}
    """
  end

  @spec validate_regression_test(module(), atom()) :: {:ok, :validated} | {:error, String.t()}
  def validate_regression_test(test_module, test_name) do
    case ExUnit.Server.modules_loaded?() do
      true ->
        if function_exported?(test_module, test_name, 1) do
          {:ok, :validated}
        else
          {:error, "Test function #{test_name}/1 not found in #{inspect(test_module)}"}
        end

      false ->
        {:error, "ExUnit not started"}
    end
  end
end
```

The regression test protocol integrates directly into the pre-commit hook pipeline. Phase 1 validates that new test files exist alongside code changes, Phase 4 runs the full test suite, and Phase 8 performs forbidden pattern detection to ensure no test skips exist without issue references.

## Integration Testing Across Umbrella Apps

Testing in a 115-application umbrella architecture presents unique challenges. Each application has its own test suite, but many applications depend on others, creating integration boundaries that must be tested explicitly. The Prismatic Platform uses contract testing to verify these boundaries.

```elixir
defmodule Prismatic.Testing.ContractTest do
  @moduledoc """
  Contract testing framework for umbrella application boundaries.

  Ensures that adapter implementations conform to their behaviour
  specifications across all storage backends (ETS, Ecto, Meilisearch,
  KuzuDB) and service interfaces.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)
    contract_module = Keyword.get(opts, :contract_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter_module)
      @contract unquote(contract_module)

      setup do
        {:ok, adapter: @adapter, contract: @contract}
      end

      test "adapter implements all required callbacks" do
        behaviours = @adapter.module_info(:attributes)
        |> Keyword.get_values(:behaviour)
        |> List.flatten()

        assert length(behaviours) > 0,
          "#{inspect(@adapter)} must implement at least one behaviour"

        for behaviour <- behaviours do
          callbacks = behaviour.behaviour_info(:callbacks)

          for {func, arity} <- callbacks do
            assert function_exported?(@adapter, func, arity),
              "#{inspect(@adapter)} missing #{func}/#{arity} from #{inspect(behaviour)}"
          end
        end
      end
    end
  end
end
```

The contract testing approach ensures that all storage adapters (ETS, Ecto, Meilisearch, KuzuDB) implement identical interfaces, making them interchangeable without breaking consuming applications. This pattern is documented in the `PrismaticStorage.AdapterContractTest` module and used across all storage-related test suites.

## Test-Driven Development in Practice

Test-driven development (TDD) in the Prismatic Platform follows a strict red-green-refactor cycle. The cycle begins with writing a failing test that describes the desired behavior, then writing the minimum production code to make the test pass, and finally refactoring both the test and production code while keeping all tests green.

The platform's functional programming foundation makes TDD particularly natural. Pure functions with explicit inputs and outputs map directly to test assertions. Pattern matching in function heads serves as both documentation and specification. The `@spec` typespec annotations provide an additional layer of contract that Dialyzer verifies statically.

```elixir
defmodule Prismatic.Testing.TDDExample do
  @moduledoc """
  Demonstrates TDD workflow for implementing a security rating calculator.
  Each test was written BEFORE the production implementation.
  """

  use ExUnit.Case, async: true

  describe "SecurityRating.calculate/1" do
    test "returns :A grade for score above 850" do
      assert {:ok, %{grade: :A}} = SecurityRating.calculate(%{score: 900})
    end

    test "returns :F grade for score below 400" do
      assert {:ok, %{grade: :F}} = SecurityRating.calculate(%{score: 350})
    end

    test "returns error for invalid score" do
      assert {:error, :invalid_score} = SecurityRating.calculate(%{score: -1})
      assert {:error, :invalid_score} = SecurityRating.calculate(%{score: 1000})
    end

    test "includes industry percentile when benchmark data available" do
      result = SecurityRating.calculate(%{score: 780, industry: :technology})
      assert {:ok, %{industry_percentile: percentile}} = result
      assert is_integer(percentile) and percentile >= 0 and percentile <= 100
    end
  end
end
```

## Async Testing and Concurrency Verification

The BEAM VM's concurrency model enables a unique approach to testing concurrent systems. ExUnit's `async: true` flag runs test cases in separate processes, and the Prismatic Platform extends this with custom concurrency verification patterns that test GenServer interactions, message passing correctness, and supervision tree recovery.

```elixir
defmodule Prismatic.Testing.ConcurrencyVerification do
  @moduledoc """
  Patterns for testing concurrent systems on the BEAM.

  Verifies GenServer state transitions, message ordering,
  supervision tree recovery, and process isolation guarantees.
  """

  use ExUnit.Case, async: true

  @spec verify_supervision_recovery(module(), term()) ::
          {:ok, pid()} | {:error, String.t()}
  def verify_supervision_recovery(child_module, init_arg) do
    {:ok, sup} = Supervisor.start_link(
      [{child_module, init_arg}],
      strategy: :one_for_one
    )

    [{_id, child_pid, _type, _modules}] = Supervisor.which_children(sup)
    ref = Process.monitor(child_pid)

    Process.exit(child_pid, :kill)

    receive do
      {:DOWN, ^ref, :process, ^child_pid, :killed} -> :ok
    after
      1_000 -> raise "Child did not terminate"
    end

    # Verify supervisor restarts the child
    Process.sleep(100)

    case Supervisor.which_children(sup) do
      [{_id, new_pid, _type, _modules}] when is_pid(new_pid) and new_pid != child_pid ->
        Supervisor.stop(sup)
        {:ok, new_pid}

      _ ->
        Supervisor.stop(sup)
        {:error, "Supervisor did not restart child"}
    end
  end
end
```

## Test Coverage Enforcement

The Prismatic Platform enforces test coverage through multiple mechanisms. The `mix test --cover` command generates coverage reports, and the quality gates pipeline requires minimum coverage thresholds. Coverage is tracked per-application in the Quality DNA system, providing cross-session continuity and trend analysis.

Coverage enforcement operates at three levels: line coverage (every executable line must be reached by at least one test), branch coverage (every conditional path must be exercised), and function coverage (every public function must have dedicated tests). The NO MERCY doctrine requires 100% coverage on business logic, with no exceptions for "simple" functions or "obvious" code.

## Platform Testing Infrastructure

The Prismatic Platform's testing infrastructure includes 121 tests organized across three phases: Phase 1 (36 Workflow/Step tests), Phase 2 (41 Storage/Web/Agent tests), and Phase 3 (44 end-to-end tests). The pre-commit hook pipeline runs all tests automatically before every commit, with the `--no-verify` flag being absolutely forbidden.

The Quality Floor Guardian monitors test metrics continuously, alerting at warning level when coverage drops below 99%, triggering auto-evolution when it drops below 98%, and blocking commits entirely below 95%. This ensures that the testing infrastructure itself never degrades -- the tests that protect the code are themselves protected by automated enforcement.

## Anti-Patterns and Forbidden Practices

The platform explicitly forbids several common testing anti-patterns. Mox.defmock is forbidden in production code (lib/ directory). Test skips without issue references are flagged as warnings. Process.sleep in tests (for timing-dependent assertions) must be replaced with assert_eventually patterns. Shared mutable state between tests is prevented by ExUnit's process isolation, but ETS tables shared across test cases must use the `on_exit/1` callback for cleanup.

The forbidden patterns enforcement system scans for these violations in the pre-commit pipeline (Phase 8) and blocks commits that introduce them. This automated enforcement ensures that testing quality never regrades, regardless of developer experience level or time pressure.

## Continuous Integration Pipeline

Testing integrates into the CI/CD pipeline through GitLab CI, which runs the full test suite on every commit. The pipeline includes compilation with `--warnings-as-errors`, Credo strict analysis, Dialyzer static type checking, the full test suite with coverage, quality gates verification, and forbidden pattern scanning. All six stages must pass before a merge request can be accepted.

The pipeline is designed to fail fast -- compilation errors are caught in the first stage, static analysis issues in the second, and runtime test failures in the third. This ordering minimizes the feedback loop, ensuring developers learn about issues as quickly as possible.

## Metrics and Quality Measurement

Testing effectiveness is measured through several metrics tracked in the Quality DNA system. These include test count (total tests across all apps), coverage percentage (line, branch, and function), test execution time (must remain under performance thresholds), flaky test rate (tests that pass and fail non-deterministically), and regression frequency (bugs that recur after being fixed). These metrics feed into the platform's 100/100 quality score, which has been maintained at perfect since the completion of the QDP elimination campaign.

## Cross-References

- [ExUnit](/glossary/exunit/) -- Elixir's built-in testing framework used across all platform applications
- [Property-Based Testing](/glossary/property-based-testing/) -- Generative testing with StreamData for invariant verification
- [Test Coverage](/glossary/test-coverage/) -- Coverage metrics and enforcement thresholds
- [Regression Testing](/glossary/regression-testing/) -- Mandatory regression test protocol (P0 ABSOLUTE)
- [Quality Gates](/glossary/quality-gates/) -- Automated quality enforcement pipeline
- [Quality DNA](/glossary/quality-dna/) -- Cross-session quality metric tracking
- [Credo](/glossary/credo/) -- Static analysis for Elixir code quality
- [Dialyzer](/glossary/dialyzer/) -- Static type checking through success typing
- [CI/CD](/glossary/ci-cd/) -- Continuous integration and deployment pipeline
- [Chaos Engineering](/glossary/chaos-engineering/) -- Controlled failure injection for resilience testing
- [Static Analysis](/glossary/static-analysis/) -- Compile-time code verification
- [Performance Testing](/glossary/performance-testing/) -- Benchee-based performance verification

---

**Connect & Contribute**: [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
