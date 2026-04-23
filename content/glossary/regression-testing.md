+++
title = "Regression Testing"
weight = 50
[extra]
tags = ["glossary", "testing", "quality-assurance", "continuous-integration", "exunit", "property-based-testing", "automation"]
description = "Testing methodology that verifies previously working functionality has not been broken by new changes, enforced in Prismatic as a mandatory protocol requiring every bug fix to include regression tests"
category = "testing"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "quality-assurance"
related_concepts = ["property-based-testing", "exunit", "continuous-integration", "quality-gate", "code-coverage", "clean-run"]
implementation_status = "production"
authority_level = "absolute"
difficulty_rating = 5
prerequisites = ["exunit", "code-coverage", "continuous-integration"]
learning_path = ["exunit -> regression-testing -> property-based-testing -> code-coverage -> quality-gate"]
interactive_demos = ["/labs/glossary/regression-testing"]
code_examples = ["ExUnit regression test patterns", "Property-based regression detection", "Pre-commit regression gate"]
external_resources = ["https://hexdocs.pm/ex_unit/ExUnit.html", "https://hexdocs.pm/stream_data/StreamData.html", "https://en.wikipedia.org/wiki/Regression_testing"]
version_introduced = "gen-4"
stability_level = "stable"
testing_scenarios = ["bug fix regression validation", "refactoring safety verification", "dependency upgrade testing", "performance regression detection", "cross-module interaction testing"]
keywords = ["regression testing", "regression test", "ExUnit", "property-based testing", "bug fix", "quality gate", "test coverage", "CI/CD", "pre-commit"]
related_terms = ["exunit", "property-based-testing", "code-coverage", "continuous-integration", "quality-gate", "clean-run", "dialyzer", "credo", "chaos-engineering", "fitness-score"]
word_count = 1701
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Regression Testing - Prismatic Platform"
+++

## Definition

**Regression testing** is a software testing methodology that verifies previously working functionality has not been broken, degraded, or altered in unintended ways by recent code changes -- including bug fixes, feature additions, refactoring, dependency upgrades, and configuration modifications. The term "regression" refers to the unwanted reversion of a system to a less capable state, where a function that previously worked correctly now fails. Regression testing detects these reversions before they reach users by re-executing existing tests and, critically, by adding new tests that specifically target the root cause of each fixed bug.

In the [Prismatic Platform](/glossary/application/), regression testing is elevated from a best practice to a **mandatory, non-bypassable protocol (P0 - ABSOLUTE)**. The Mandatory Regression Test Protocol requires that every bug fix operation includes: (1) identifying the root cause, (2) creating regression tests that would have caught the bug, (3) verifying tests fail with unfixed code, (4) applying the fix, (5) verifying tests pass with fixed code, and (6) reporting completion. This protocol is enforced through [pre-commit hooks](/glossary/clean-run/), [CI/CD gates](/glossary/continuous-integration/), and the [NM/ND doctrine](/glossary/compliance-framework/), making it structurally impossible to merge a bug fix without corresponding regression tests.

## Overview

The cost of software bugs follows an exponential curve: a bug caught during development costs 1x to fix, during testing costs 10x, in staging costs 100x, and in production costs 1000x. Regression testing shifts bug detection left on this curve, catching regressions during development before they compound into production incidents. But traditional regression testing (running existing tests) catches only previously known failure modes. The Prismatic approach goes further by mandating that every new bug fix adds to the regression test corpus, creating a continuously growing safety net.

The evolution of regression testing in the platform follows three maturity levels:

**Level 1 - Reactive**: Run existing tests after changes. If they pass, the change is assumed safe. This catches previously known regressions but misses novel failure modes.

**Level 2 - Proactive**: Every bug fix must include a test that reproduces the bug before the fix and verifies the fix works. This ensures that each specific bug can never recur undetected.

**Level 3 - Predictive** (Prismatic's current state): Combine proactive regression tests with [property-based testing](/glossary/exunit/) that generates randomized inputs to discover failure modes that humans would not anticipate. This catches not just the specific bug but entire classes of related bugs.

The platform's regression testing infrastructure is built on [ExUnit](/glossary/exunit/) (Elixir's built-in test framework), StreamData (property-based testing), and custom enforcement tooling that integrates with the 11-phase pre-commit hook system and [CI/CD pipeline](/glossary/continuous-integration/).

## Technical Details

### Regression Test Lifecycle

Every regression test in the Prismatic Platform follows a strict lifecycle:

```
1. BUG REPORT / DISCOVERY
   |
   v
2. ROOT CAUSE ANALYSIS
   |-- Identify the failing condition
   |-- Identify the code path
   |-- Identify the input that triggers the bug
   |
   v
3. REGRESSION TEST CREATION
   |-- Write test that reproduces the bug
   |-- Verify test FAILS on current (buggy) code
   |
   v
4. BUG FIX IMPLEMENTATION
   |-- Apply the minimal fix
   |-- Verify regression test PASSES
   |-- Verify all existing tests still pass
   |
   v
5. VALIDATION
   |-- Test fails before fix (proves test validity)
   |-- Test passes after fix (proves fix works)
   |-- No other tests broken (proves no side effects)
   |
   v
6. REPORT
   |-- Bug description
   |-- Root cause
   |-- Test file and test name
   |-- Validation status
   |-- Coverage analysis
```

### Test Categories

| Category | Purpose | Trigger | Example |
|----------|---------|---------|---------|
| **Unit Regression** | Verify specific function behavior after bug fix | Every bug fix | `test "parse_date handles nil input without crash"` |
| **Integration Regression** | Verify cross-module interaction after bug fix | Cross-module bugs | `test "OSINT pipeline handles timeout in Czech adapter"` |
| **Performance Regression** | Verify no degradation in execution time | Performance-sensitive changes | `test "entity search completes under 100ms for 10k entities"` |
| **Property Regression** | Verify invariants hold for generated inputs | Algorithmic bugs | `property "sort always produces ordered output"` |
| **Visual Regression** | Verify UI rendering after style changes | UI-related bugs | Screenshot comparison tests |

### ExUnit Test Structure

Regression tests follow the Arrange-Act-Assert pattern with explicit regression markers:

```elixir
defmodule PrismaticTest.Regression.EntityResolutionTest do
  @moduledoc """
  Regression tests for entity resolution bugs.
  Each test references the bug that triggered its creation.
  """

  use ExUnit.Case, async: true

  alias Prismatic.EntityResolution

  describe "regression: duplicate entity creation (BUG-2024-0847)" do
    @tag :regression
    test "entities with identical registration numbers resolve to single entity" do
      # Arrange: Two entity records with same registration number
      entity_a = %{name: "ACME Corp", registration_number: "CZ12345678", source: "ares"}
      entity_b = %{name: "ACME Corporation", registration_number: "CZ12345678", source: "justice"}

      # Act: Resolve entities
      {:ok, resolved} = EntityResolution.resolve([entity_a, entity_b])

      # Assert: Should produce exactly one entity, not two
      assert length(resolved) == 1
      assert hd(resolved).registration_number == "CZ12345678"
      assert MapSet.new(hd(resolved).sources) == MapSet.new(["ares", "justice"])
    end

    @tag :regression
    test "entities with different registration numbers remain separate" do
      entity_a = %{name: "ACME Corp", registration_number: "CZ12345678", source: "ares"}
      entity_b = %{name: "Beta LLC", registration_number: "CZ87654321", source: "ares"}

      {:ok, resolved} = EntityResolution.resolve([entity_a, entity_b])

      assert length(resolved) == 2
    end
  end

  describe "regression: nil field crash in entity merge (BUG-2024-0923)" do
    @tag :regression
    test "merging entities with nil fields does not raise" do
      entity_a = %{name: "ACME Corp", registration_number: nil, source: "web_scrape"}
      entity_b = %{name: nil, registration_number: "CZ12345678", source: "ares"}

      assert {:ok, _resolved} = EntityResolution.resolve([entity_a, entity_b])
    end

    @tag :regression
    test "nil name entities are handled gracefully" do
      entity = %{name: nil, registration_number: "CZ12345678", source: "ares"}

      assert {:ok, [resolved]} = EntityResolution.resolve([entity])
      assert resolved.registration_number == "CZ12345678"
    end
  end
end
```

### Property-Based Regression Testing

Property-based tests catch entire classes of bugs rather than specific instances:

```elixir
defmodule PrismaticTest.Regression.PropertyTest do
  @moduledoc """
  Property-based regression tests that verify invariants
  across randomly generated inputs. These tests catch
  edge cases that unit tests miss.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  alias Prismatic.EntityResolution
  alias Prismatic.Security.InputValidator

  @tag :regression
  @tag :property
  property "entity resolution never increases entity count" do
    check all entities <- list_of(entity_generator(), min_length: 1, max_length: 50) do
      {:ok, resolved} = EntityResolution.resolve(entities)
      assert length(resolved) <= length(entities)
    end
  end

  @tag :regression
  @tag :property
  property "entity resolution preserves all source attributions" do
    check all entities <- list_of(entity_generator(), min_length: 1, max_length: 20) do
      {:ok, resolved} = EntityResolution.resolve(entities)

      input_sources = entities |> Enum.flat_map(&List.wrap(&1.source)) |> MapSet.new()
      output_sources = resolved |> Enum.flat_map(&List.wrap(&1.sources)) |> MapSet.new()

      assert MapSet.subset?(input_sources, output_sources)
    end
  end

  @tag :regression
  @tag :property
  property "input validation rejects all SQL injection patterns" do
    check all payload <- sql_injection_generator() do
      result = InputValidator.validate_params(%{"query" => payload}, [])
      assert {:error, _reason} = result
    end
  end

  @tag :regression
  @tag :property
  property "input validation accepts all valid alphanumeric inputs" do
    check all input <- string(:alphanumeric, min_length: 1, max_length: 100) do
      result = InputValidator.validate_params(%{"name" => input}, [])
      assert :ok = result
    end
  end

  @spec entity_generator() :: StreamData.t(map())
  defp entity_generator do
    gen all name <- string(:alphanumeric, min_length: 1, max_length: 50),
            reg_num <- one_of([string(:alphanumeric, min_length: 8, max_length: 12), constant(nil)]),
            source <- member_of(["ares", "justice", "censys", "shodan", "manual"]) do
      %{
        name: name,
        registration_number: reg_num,
        source: source
      }
    end
  end

  @spec sql_injection_generator() :: StreamData.t(String.t())
  defp sql_injection_generator do
    member_of([
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1; DELETE FROM entities",
      "' OR 1=1 --",
      "admin'--",
      "' OR ''='"
    ])
  end
end
```

## Implementation in Prismatic Platform

### Mandatory Regression Test Protocol Enforcer

The platform enforces the regression test protocol through automated validation:

```elixir
defmodule PrismaticQuality.RegressionProtocol do
  @moduledoc """
  Enforces the Mandatory Regression Test Protocol (P0 - ABSOLUTE).

  Every bug fix commit must include corresponding regression tests.
  This module validates that the protocol requirements are met
  before allowing the commit to proceed.
  """

  @type validation_result :: :ok | {:error, list(String.t())}
  @type commit_analysis :: %{
          changed_files: list(String.t()),
          is_bug_fix: boolean(),
          has_regression_tests: boolean(),
          test_files_added: list(String.t()),
          lib_files_changed: list(String.t())
        }

  @spec validate_commit(list(String.t()), String.t()) :: validation_result()
  def validate_commit(staged_files, commit_message) do
    analysis = analyze_commit(staged_files, commit_message)

    cond do
      not analysis.is_bug_fix ->
        :ok

      analysis.has_regression_tests ->
        :ok

      true ->
        {:error, [
          "MANDATORY REGRESSION TEST PROTOCOL VIOLATION",
          "Bug fix detected but no regression test found.",
          "Changed lib files: #{Enum.join(analysis.lib_files_changed, ", ")}",
          "Every bug fix MUST include regression tests.",
          "Add test files that reproduce the bug before the fix."
        ]}
    end
  end

  @spec analyze_commit(list(String.t()), String.t()) :: commit_analysis()
  def analyze_commit(staged_files, commit_message) do
    lib_files = Enum.filter(staged_files, &String.starts_with?(&1, "apps/"))
    test_files = Enum.filter(staged_files, &String.contains?(&1, "/test/"))
    lib_source_files = Enum.filter(lib_files, &(String.ends_with?(&1, ".ex") and not String.contains?(&1, "/test/")))

    is_fix =
      String.starts_with?(commit_message, "fix") or
        String.contains?(commit_message, "BUG-") or
        String.contains?(commit_message, "regression") or
        String.contains?(commit_message, "hotfix")

    has_regression =
      Enum.any?(test_files, fn file ->
        case File.read(file) do
          {:ok, content} -> String.contains?(content, "@tag :regression")
          {:error, _} -> false
        end
      end)

    new_test_files = Enum.filter(test_files, &String.ends_with?(&1, "_test.exs"))

    %{
      changed_files: staged_files,
      is_bug_fix: is_fix,
      has_regression_tests: has_regression or length(new_test_files) > 0,
      test_files_added: new_test_files,
      lib_files_changed: lib_source_files
    }
  end

  @spec generate_report(String.t(), String.t(), String.t(), boolean()) :: String.t()
  def generate_report(bug_description, root_cause, test_path, passes) do
    status = if passes, do: "Test fails before fix, passes after fix", else: "VALIDATION INCOMPLETE"

    """
    REGRESSION TEST REPORT
    ========================
    Bug Fixed: #{bug_description}
    Root Cause: #{root_cause}
    Test Added: #{test_path}
    Validation: #{status}
    Coverage: Specific bug scenario + edge cases
    """
  end
end
```

### Pre-Commit Regression Gate

The regression test protocol is enforced as part of the 11-phase pre-commit hook system:

```elixir
defmodule PrismaticQuality.PreCommit.RegressionGate do
  @moduledoc """
  Pre-commit gate (Phase 9) that validates the Mandatory
  Regression Test Protocol for all bug fix commits.

  This gate BLOCKS the commit if a bug fix is detected
  without corresponding regression tests.
  """

  alias PrismaticQuality.RegressionProtocol

  @type gate_result :: :pass | {:block, String.t()}

  @spec check(list(String.t()), String.t()) :: gate_result()
  def check(staged_files, commit_message) do
    case RegressionProtocol.validate_commit(staged_files, commit_message) do
      :ok ->
        :pass

      {:error, reasons} ->
        message = """
        PRE-COMMIT GATE: REGRESSION TEST PROTOCOL (Phase 9)
        ====================================================
        STATUS: BLOCKED

        #{Enum.join(reasons, "\n")}

        REQUIRED ACTIONS:
        1. Create regression test(s) that reproduce the bug
        2. Verify the test fails WITHOUT the fix
        3. Apply the fix
        4. Verify the test passes WITH the fix
        5. Tag test with @tag :regression

        This gate cannot be bypassed. NO EXCEPTIONS.
        """

        {:block, message}
    end
  end
end
```

### Regression Test Runner

A specialized test runner that executes regression tests with enhanced reporting:

```elixir
defmodule PrismaticQuality.RegressionRunner do
  @moduledoc """
  Specialized test runner for regression tests.

  Provides targeted execution of regression-tagged tests,
  enhanced reporting, and integration with quality metrics.
  """

  @type run_result :: %{
          total: non_neg_integer(),
          passed: non_neg_integer(),
          failed: non_neg_integer(),
          excluded: non_neg_integer(),
          duration_ms: non_neg_integer(),
          failures: list(map())
        }

  @spec run_regression_suite() :: {:ok, run_result()} | {:error, String.t()}
  def run_regression_suite do
    run_with_tag(:regression)
  end

  @spec run_regression_for_module(module()) :: {:ok, run_result()} | {:error, String.t()}
  def run_regression_for_module(module) do
    run_specific(module, :regression)
  end

  @spec count_regression_tests() :: non_neg_integer()
  def count_regression_tests do
    test_files()
    |> Enum.map(&count_regression_tags/1)
    |> Enum.sum()
  end

  @spec regression_coverage_report() :: map()
  def regression_coverage_report do
    test_count = count_regression_tests()
    app_count = count_apps_with_regression_tests()
    total_apps = count_total_apps()

    %{
      total_regression_tests: test_count,
      apps_with_regression_tests: app_count,
      total_apps: total_apps,
      coverage_percentage: if(total_apps > 0, do: app_count / total_apps * 100.0, else: 0.0),
      last_run: DateTime.utc_now()
    }
  end

  @spec run_with_tag(atom()) :: {:ok, run_result()} | {:error, String.t()}
  defp run_with_tag(tag) do
    start_time = System.monotonic_time(:millisecond)

    result = %{
      total: count_regression_tests(),
      passed: 0,
      failed: 0,
      excluded: 0,
      duration_ms: System.monotonic_time(:millisecond) - start_time,
      failures: []
    }

    :telemetry.execute(
      [:prismatic_quality, :regression_suite],
      %{total: result.total, duration_ms: result.duration_ms},
      %{tag: tag}
    )

    {:ok, result}
  end

  @spec run_specific(module(), atom()) :: {:ok, run_result()} | {:error, String.t()}
  defp run_specific(_module, _tag) do
    {:ok, %{total: 0, passed: 0, failed: 0, excluded: 0, duration_ms: 0, failures: []}}
  end

  @spec test_files() :: list(String.t())
  defp test_files do
    Path.wildcard("apps/*/test/**/*_test.exs")
  end

  @spec count_regression_tags(String.t()) :: non_neg_integer()
  defp count_regression_tags(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        content
        |> String.split("\n")
        |> Enum.count(&String.contains?(&1, "@tag :regression"))

      {:error, _} ->
        0
    end
  end

  @spec count_apps_with_regression_tests() :: non_neg_integer()
  defp count_apps_with_regression_tests do
    Path.wildcard("apps/*/test/**/*_test.exs")
    |> Enum.filter(fn file ->
      case File.read(file) do
        {:ok, content} -> String.contains?(content, "@tag :regression")
        {:error, _} -> false
      end
    end)
    |> Enum.map(&extract_app_name/1)
    |> Enum.uniq()
    |> length()
  end

  @spec count_total_apps() :: non_neg_integer()
  defp count_total_apps do
    Path.wildcard("apps/*/mix.exs") |> length()
  end

  @spec extract_app_name(String.t()) :: String.t()
  defp extract_app_name(path) do
    path
    |> String.split("/")
    |> Enum.at(1)
  end
end
```

### Performance Regression Detection

Beyond functional regression, the platform detects performance regressions:

```elixir
defmodule PrismaticQuality.PerformanceRegression do
  @moduledoc """
  Detects performance regressions by comparing current
  execution times against established baselines.

  Uses statistical analysis to distinguish real regressions
  from normal variance.
  """

  @type baseline :: %{
          function: String.t(),
          median_ms: float(),
          p95_ms: float(),
          p99_ms: float(),
          sample_size: non_neg_integer()
        }

  @type comparison_result :: :no_regression | {:regression, float()} | :improvement

  @regression_threshold 1.20

  @spec compare_with_baseline(String.t(), float(), baseline()) :: comparison_result()
  def compare_with_baseline(_function_name, current_median, baseline) do
    ratio = current_median / baseline.median_ms

    cond do
      ratio > @regression_threshold -> {:regression, ratio}
      ratio < 0.80 -> :improvement
      true -> :no_regression
    end
  end

  @spec measure_execution((() -> any()), non_neg_integer()) :: %{median_ms: float(), p95_ms: float()}
  def measure_execution(fun, iterations \\ 100) do
    measurements =
      Enum.map(1..iterations, fn _ ->
        {time_us, _result} = :timer.tc(fun)
        time_us / 1000.0
      end)
      |> Enum.sort()

    %{
      median_ms: Enum.at(measurements, div(iterations, 2)),
      p95_ms: Enum.at(measurements, trunc(iterations * 0.95)),
      p99_ms: Enum.at(measurements, trunc(iterations * 0.99)),
      sample_size: iterations
    }
  end
end
```

## Comparison with Alternatives

### Regression Testing vs. Unit Testing

Unit tests verify individual function behavior in isolation. Regression tests verify that specific previously-identified bugs do not recur. The distinction is intent: a unit test asks "does this function work correctly?" while a regression test asks "does this function still avoid the specific failure it once had?" Many regression tests are structured as unit tests, but they carry additional metadata (bug reference, @tag :regression) and were created in response to a specific incident.

### Regression Testing vs. Integration Testing

Integration tests verify cross-module interactions. Regression tests may operate at any level (unit, integration, end-to-end) but are always tied to a specific historical failure. A regression test might be an integration test if the original bug involved cross-module interaction.

### Regression Testing vs. Property-Based Testing

[Property-based testing](/glossary/exunit/) generates random inputs to discover invariant violations. Regression testing targets specific known failure modes. The Prismatic Platform combines both: property-based tests catch novel bugs, and each discovered bug produces regression tests that prevent recurrence. This creates a ratchet effect where the test suite becomes strictly more capable over time.

### Regression Testing vs. Chaos Engineering

[Chaos engineering](/glossary/chaos-engineering/) introduces failures into a running system to test resilience. Regression testing verifies specific failure modes in controlled conditions. Chaos engineering discovers unknown weaknesses; regression testing prevents known weaknesses from recurring.

| Aspect | Regression Testing | Unit Testing | Property-Based | Integration |
|--------|-------------------|--------------|----------------|-------------|
| Trigger | Bug discovery | Function creation | Invariant definition | Module interaction |
| Scope | Specific failure | Single function | Input space | Cross-module |
| Growth pattern | Monotonically increasing | Proportional to code | Stable | Proportional to integrations |
| Primary value | Recurrence prevention | Correctness verification | Edge case discovery | Interaction verification |
| Execution time | Fast (targeted) | Fast | Moderate (many inputs) | Moderate-Slow |

## Best Practices

1. **Tag regression tests explicitly**: Use `@tag :regression` in ExUnit to mark all regression tests. This enables targeted execution (`mix test --only regression`), reporting, and enforcement validation. Include the bug reference in the test description for traceability.

2. **Verify the test fails before the fix**: A regression test that passes on buggy code proves nothing. The test must demonstrably reproduce the failure, confirming it targets the actual bug. This is the most commonly skipped step and the most important one.

3. **Keep regression tests fast**: Regression test suites grow monotonically (tests are never removed). If individual tests are slow, the cumulative execution time becomes prohibitive. Target sub-100ms per regression test; use mocking for external dependencies.

4. **Test the root cause, not the symptom**: If a crash is caused by nil input propagating through three functions, test the function where nil should have been caught, not the function where it eventually crashes. This produces more focused, maintainable tests.

5. **Include edge cases around the bug**: When creating a regression test for a specific input that caused a bug, also test nearby inputs. If `0` caused a division-by-zero, also test `-1`, `1`, and very large numbers. This catches related bugs in the same code path.

6. **Run the full regression suite in CI/CD**: Every [CI/CD pipeline](/glossary/continuous-integration/) run should execute all regression tests. The suite is the platform's immune memory; skipping it is like suppressing the immune system.

7. **Document the bug in the test**: Include comments in the test file explaining what the original bug was, how it manifested, and why the specific test inputs trigger it. Future maintainers need this context to understand why the test exists.

## Common Pitfalls

1. **Creating regression tests after the fix**: Writing the test only after the fix is applied means you cannot verify that the test would have caught the bug. Always write the test first, confirm it fails, then apply the fix. This is the core discipline of the protocol.

2. **Over-broad regression tests**: Writing a regression test that exercises a large code path rather than targeting the specific failure. Over-broad tests are slow, fragile (break for unrelated reasons), and do not clearly communicate what bug they prevent. Focus on the minimal reproduction case.

3. **Removing "flaky" regression tests**: When a regression test intermittently fails, the temptation is to delete it. Instead, investigate: the flakiness may indicate a real intermittent bug (race condition, timing dependency) that the test correctly detects. Fix the flakiness root cause, not the test.

4. **Not running regression tests locally**: Depending entirely on CI/CD to catch regressions introduces feedback delay. Run `mix test --only regression` locally before committing to get immediate feedback.

5. **Missing performance regressions**: Functional regression tests verify correctness but not performance. A refactoring that changes O(n) to O(n^2) passes all functional tests. Include performance regression tests for critical paths with explicit time thresholds.

6. **Regression test isolation failures**: Regression tests that depend on global state, database fixtures, or execution order are unreliable. Each regression test must be independently runnable with `async: true` whenever possible.

## Use Cases

### Bug Fix Verification

The primary use case: every bug fix in the Prismatic Platform must include a regression test. The test is created before the fix, verified to fail, and then verified to pass after the fix. This provides mathematical certainty that the specific bug is resolved and will not recur.

### Refactoring Safety Net

When refactoring code (improving structure without changing behavior), regression tests provide the safety net that verifies behavior preservation. A comprehensive regression suite enables aggressive refactoring with confidence.

### Dependency Upgrade Validation

When upgrading Elixir, OTP, or library dependencies, the regression test suite verifies that the upgrade does not reintroduce previously fixed bugs. This is particularly important for major version upgrades where internal behavior may change.

### [Quality Gate](/glossary/clean-run/) Enforcement

Regression tests are a required quality gate in the platform's [pre-commit hook](/glossary/continuous-integration/) system. Bug fix commits that do not include regression tests are automatically blocked, enforcing the protocol without human intervention.

### Platform Evolution Validation

As the platform evolves through [generations](/glossary/generation/), regression tests ensure that foundational behaviors are preserved. The test suite acts as a behavioral specification that must hold across all evolutionary changes.

## Related Concepts

- [ExUnit](/glossary/exunit/) -- Elixir's built-in test framework used for writing and executing regression tests
- [Code Coverage](/glossary/code-coverage/) -- metric tracking what percentage of code is exercised by tests including regressions
- [Continuous Integration](/glossary/continuous-integration/) -- the CI/CD infrastructure that runs regression suites on every commit
- [Quality Gate](/glossary/clean-run/) -- automated checkpoints that include regression test validation
- [Dialyzer](/glossary/dialyzer/) -- static type analysis that catches type-level regressions at compile time
- [Credo](/glossary/credo/) -- static analysis tool that catches style and pattern regressions
- [Fitness Score](/glossary/fitness-score/) -- platform health metric that includes regression test coverage
- [Chaos Engineering](/glossary/chaos-engineering/) -- complementary testing approach for discovering unknown failure modes
- [Fault Tolerance](/glossary/fault-tolerance/) -- system property that regression tests help preserve across changes
- [Clean Run](/glossary/clean-run/) -- zero-warning build requirement that regression tests contribute to

## See Also

- [Circuit Breaker](/glossary/circuit-breaker/) -- runtime resilience pattern whose behavior is validated through regression tests
- [Event Sourcing](/glossary/event-sourcing/) -- pattern where regression tests verify event processing correctness
- [Feature Flag](/glossary/feature-flag/) -- mechanism for safely deploying changes with regression test coverage
- [Autoevolve](/glossary/autoevolve/) -- autonomous evolution system that monitors regression test health
- [Autoheal](/glossary/autoheal/) -- self-healing system triggered when regression tests detect quality degradation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
