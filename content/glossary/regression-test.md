+++
title = "Regression Test"
weight = 56
[extra]
description = "Mandatory test proving a bug fix prevents recurrence of the specific defect"
category = "quality"
related_terms = ["quality-gates", "nm-nd", "violation-protocol", "purple-team", "no-mercy"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1612
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Regression", "Test", "Mandatory", "glossary", "quality", "Prismatic Platform", "Regression Test", "Step"]
tags = ["glossary", "quality", "regression-test", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Regression Test - Prismatic Platform"
+++

## Definition & Overview

A Regression Test is a test specifically written to verify that a previously identified and fixed bug does not recur in future development cycles. Unlike general unit tests that verify intended functionality, regression tests target known failure modes -- they encode the exact conditions that triggered a past defect and assert that the system now handles those conditions correctly. The term "regression" refers to the phenomenon where previously working functionality breaks due to new changes, and regression tests serve as automated sentinels against this class of defect.

Regression testing is a foundational practice in software quality assurance, but its effectiveness depends entirely on discipline: every bug fix must be accompanied by a test that would have caught the bug before it was reported. Without this discipline, the same defects recur across releases, eroding user confidence and consuming engineering resources on repeated investigation of known issues.

The Prismatic Platform elevates regression testing from a best practice to a non-bypassable protocol. The Mandatory Regression Test Protocol is classified as P0 (Absolute) -- the highest enforcement level -- with zero exceptions regardless of urgency, scope, or authority level. A bug fix without a corresponding regression test is treated as an incomplete delivery under the [NO MERCY](@/glossary/no-mercy.md) doctrine.

| Protocol Aspect | Requirement |
|-----------------|-------------|
| **Classification** | P0 Absolute -- non-bypassable |
| **Scope** | Every bug fix, no exceptions |
| **Validation** | Test must fail before fix, pass after fix |
| **Reporting** | Mandatory report with root cause, test path, validation status |
| **Enforcement** | Commit blocked without regression test |
| **Authority Override** | None -- not even Supreme Commander can bypass |

## Technical Deep Dive

### The Five-Step Regression Protocol

The Prismatic Platform enforces a strict five-step protocol for every bug fix operation:

**Step 1 -- Root Cause Identification**: Before writing any fix, the developer must identify the bug's root cause and failure mode. Superficial fixes that address symptoms rather than causes are rejected as L3 violations (Incomplete Delivery).

**Step 2 -- Regression Test Creation**: Write one or more tests that reproduce the exact failure conditions. The test should exercise the specific code path that failed, using inputs that triggered the original defect.

**Step 3 -- Failure Verification**: Run the regression test against the unfixed codebase to confirm it fails. This step proves that the test actually detects the defect. A test that passes against unfixed code is either testing the wrong thing or the bug was already fixed.

**Step 4 -- Fix Application**: Apply the code fix to resolve the root cause identified in Step 1. The fix should be minimal and targeted -- addressing the root cause without introducing unnecessary changes that complicate review and increase regression risk.

**Step 5 -- Pass Verification**: Run the regression test against the fixed codebase to confirm it passes. Additionally, run the full test suite to verify the fix doesn't introduce new regressions elsewhere.

```elixir
defmodule PrismaticQuality.RegressionProtocol do
  @moduledoc """
  Enforces the mandatory five-step regression test protocol.
  Every bug fix must pass through this protocol before commit.
  """

  @type regression_report :: %{
    bug_description: String.t(),
    root_cause: String.t(),
    test_file: String.t(),
    test_name: String.t(),
    fails_before_fix: boolean(),
    passes_after_fix: boolean(),
    coverage_scope: [String.t()],
    timestamp: DateTime.t()
  }

  @spec validate_protocol(regression_report()) ::
          :ok | {:error, :incomplete_protocol, String.t()}
  def validate_protocol(report) do
    validations = [
      {report.bug_description != "", "Bug description required"},
      {report.root_cause != "", "Root cause analysis required"},
      {report.test_file != "", "Test file path required"},
      {report.test_name != "", "Test name required"},
      {report.fails_before_fix == true, "Test must fail before fix (proves test validity)"},
      {report.passes_after_fix == true, "Test must pass after fix (proves fix works)"},
      {report.coverage_scope != [], "Coverage scope must be documented"}
    ]

    case Enum.find(validations, fn {valid, _} -> not valid end) do
      nil -> :ok
      {_, message} -> {:error, :incomplete_protocol, message}
    end
  end

  @spec generate_report(map()) :: String.t()
  def generate_report(params) do
    """
    REGRESSION TEST REPORT
    ========================
    Bug Fixed: #{params.bug_description}
    Root Cause: #{params.root_cause}
    Test Added: #{params.test_file} :: #{params.test_name}
    Validation: #{if params.fails_before_fix and params.passes_after_fix, do: "PASS", else: "FAIL"}
      - Test fails before fix: #{params.fails_before_fix}
      - Test passes after fix: #{params.passes_after_fix}
    Coverage: #{Enum.join(params.coverage_scope, ", ")}
    Timestamp: #{DateTime.utc_now() |> DateTime.to_iso8601()}
    """
  end
end
```

### Regression Test Design Patterns

Effective regression tests follow specific design patterns that maximize their protective value:

**Exact Reproduction Pattern**: The test recreates the exact sequence of operations, inputs, and state that triggered the original bug. This is the most common and most reliable pattern.

```elixir
defmodule PrismaticPerimeter.SecurityRatingTest do
  use ExUnit.Case, async: true

  describe "regression: score calculation overflow (BUG-1247)" do
    test "handles score exceeding 900 maximum without overflow" do
      # Exact reproduction: multiple A-grade factors pushed score above 900
      factors = [
        %{category: :dns, score: 95, weight: 0.3},
        %{category: :ssl, score: 98, weight: 0.3},
        %{category: :headers, score: 99, weight: 0.2},
        %{category: :network, score: 97, weight: 0.2}
      ]

      # Before fix: this returned 912, breaking the 300-900 scale
      {:ok, rating} = SecurityRating.calculate(factors)

      assert rating.score <= 900
      assert rating.score >= 300
      assert rating.grade == :A
    end
  end
end
```

**Boundary Reproduction Pattern**: The test targets the specific boundary condition that the bug violated, testing both sides of the boundary:

```elixir
describe "regression: empty asset list crash (BUG-1198)" do
  test "returns empty rating for organization with zero discovered assets" do
    # Before fix: Enum.min/1 crashed on empty list
    {:ok, rating} = SecurityRating.calculate_for_org(%{assets: []})

    assert rating.score == 0
    assert rating.grade == :F
    assert rating.confidence == :none
  end

  test "calculates rating correctly for single asset" do
    {:ok, rating} = SecurityRating.calculate_for_org(%{assets: [valid_asset()]})

    assert rating.score > 0
    assert rating.confidence == :low
  end
end
```

**Concurrency Reproduction Pattern**: For race condition bugs, the test exercises the concurrent scenario that triggered the defect:

```elixir
describe "regression: concurrent session writes causing data loss (BUG-1302)" do
  test "concurrent session updates are serialized without data loss" do
    {:ok, session} = SessionStore.create(%{user_id: "test-user"})

    tasks =
      for i <- 1..50 do
        Task.async(fn ->
          SessionStore.update(session.id, %{counter: i})
        end)
      end

    results = Task.await_many(tasks, 5_000)

    # Before fix: some updates were silently dropped
    assert Enum.all?(results, &match?({:ok, _}, &1))

    {:ok, final} = SessionStore.get(session.id)
    assert final.version == 50
  end
end
```

## Architecture & Implementation

### Integration with Quality Gates

Regression tests integrate into the broader [Quality Gates](@/glossary/quality-gates.md) pipeline, which runs on every commit. The quality gates system verifies not only that all tests pass but that recent bug fix commits include corresponding regression test additions:

```
Commit --> Pre-Commit Hook --> Quality Gates Pipeline
                                    |
                                    +-- Compilation (zero warnings)
                                    +-- Credo (strict mode)
                                    +-- Dialyzer (type checking)
                                    +-- Test Suite (all tests including regressions)
                                    +-- Regression Protocol Validation
                                    |       |
                                    |       +-- Bug fix commits must include new test files
                                    |       +-- Test must exercise the fixed code path
                                    |       +-- Report must be generated
                                    +-- Coverage Check (100% target)
```

### Purple Team Regression Guard

The [Purple Team](@/glossary/purple-team.md)'s `purple-regression-guard` agent extends the regression test concept to security findings. When a security vulnerability is identified and remediated, the regression guard ensures that:

1. A security regression test validates the remediation
2. The test is added to the security regression suite
3. The finding cannot be closed without the regression test
4. Future deployments re-validate all security regressions

This creates a monotonically growing security regression suite that captures every past vulnerability and prevents any from recurring.

### Regression Test Organization

Regression tests in the Prismatic Platform follow a consistent organizational structure:

```
apps/
  prismatic_perimeter/
    test/
      regression/
        bug_1247_score_overflow_test.exs
        bug_1198_empty_asset_crash_test.exs
        bug_1302_concurrent_session_test.exs
      prismatic_perimeter_test.exs
```

Each regression test file is named with the bug identifier, making it immediately traceable to the original defect report. The `test/regression/` directory provides a clear inventory of all past defects and their protective tests.

## Usage in Prismatic Platform

The Mandatory Regression Test Protocol has been instrumental in achieving the platform's quality metrics:

**5,864 Test Files**: The platform's comprehensive test suite includes hundreds of regression tests accumulated over 18 generations of evolution. Each test represents a bug that was found, analyzed, fixed, and permanently guarded against.

**Zero Regression Incidents**: Since implementing the P0 protocol, the platform has experienced zero regression incidents -- no previously fixed bug has recurred in any subsequent release.

**Quality Floor Guardian Integration**: The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) monitors regression test health as part of its autonomous quality monitoring. If a regression test becomes flaky (intermittently failing), it triggers investigation before the flakiness masks a genuine regression.

**Pre-Commit Enforcement**: The `.githooks/pre-commit` hook validates that commits tagged as bug fixes include corresponding test additions. Commits that fail this validation are blocked at the local development stage, before reaching CI/CD.

## Code Examples

### Complete Regression Test Workflow

```elixir
defmodule PrismaticStorageEts.RegistryRegressionTest do
  @moduledoc """
  Regression tests for PrismaticStorageEts.Registry.
  Each test documents the original bug and validates the fix.
  """
  use ExUnit.Case, async: true

  alias PrismaticStorageEts.Registry

  # BUG-1156: Registry.lookup/2 returned {:ok, nil} instead of {:error, :not_found}
  # Root Cause: Missing nil guard in ETS lookup result handling
  # Fixed in: commit abc123
  describe "regression: BUG-1156 nil lookup result" do
    test "returns {:error, :not_found} for non-existent keys" do
      {:ok, registry} = Registry.start_link(name: :test_reg_1156)

      result = Registry.lookup(registry, "non_existent_key")

      assert result == {:error, :not_found}
      refute match?({:ok, nil}, result)
    end
  end

  # BUG-1203: Registry.delete/2 silently succeeded for non-existent keys
  # Root Cause: ETS.delete/2 always returns true regardless of key existence
  # Fixed in: commit def456
  describe "regression: BUG-1203 silent delete" do
    test "returns {:error, :not_found} when deleting non-existent key" do
      {:ok, registry} = Registry.start_link(name: :test_reg_1203)

      result = Registry.delete(registry, "ghost_key")

      assert result == {:error, :not_found}
    end

    test "returns {:ok, deleted_value} when deleting existing key" do
      {:ok, registry} = Registry.start_link(name: :test_reg_1203b)
      Registry.insert(registry, "real_key", "value")

      result = Registry.delete(registry, "real_key")

      assert result == {:ok, "value"}
    end
  end
end
```

### Regression Test Generator

```elixir
defmodule PrismaticQuality.RegressionGenerator do
  @moduledoc """
  Generates regression test scaffolding from bug reports.
  Ensures consistent test structure and documentation.
  """

  @spec generate(map()) :: {:ok, String.t()} | {:error, :missing_fields}
  def generate(bug_report) do
    required = [:id, :module, :description, :root_cause, :inputs, :expected, :actual]

    if Enum.all?(required, &Map.has_key?(bug_report, &1)) do
      test_content = """
      defmodule #{bug_report.module}RegressionTest do
        @moduledoc \"\"\"
        Regression test for #{bug_report.id}: #{bug_report.description}
        Root Cause: #{bug_report.root_cause}
        \"\"\"
        use ExUnit.Case, async: true

        describe "regression: #{bug_report.id}" do
          test "#{bug_report.description}" do
            # Setup: reproduce the exact conditions
            #{generate_setup(bug_report)}

            # Exercise: execute the operation that failed
            result = #{generate_exercise(bug_report)}

            # Verify: assert correct behavior (opposite of the bug)
            #{generate_assertions(bug_report)}
          end
        end
      end
      """

      {:ok, test_content}
    else
      {:error, :missing_fields}
    end
  end

  defp generate_setup(report), do: Enum.join(report.inputs, "\n    ")
  defp generate_exercise(report), do: report.exercise || "Module.function(input)"
  defp generate_assertions(report), do: "assert result == #{inspect(report.expected)}"
end
```

## Best Practices

1. **Name Tests After Bug IDs**: Use the bug tracking identifier in the test name and module. This creates a direct traceability chain from defect report to protective test.

2. **Document the Root Cause**: Include a comment in the test file explaining what caused the bug, not just what the symptom was. Future developers need to understand why the test exists.

3. **Test the Boundary, Not Just the Fix**: A regression test should cover the specific failure case and at least one adjacent boundary condition. Bugs often cluster around boundary conditions.

4. **Keep Tests Fast**: Regression tests run on every commit. If a regression test requires expensive setup (database, network), consider whether the test can be restructured to exercise the same logic with cheaper infrastructure.

5. **Never Delete Regression Tests**: Regression tests are permanent fixtures of the test suite. Even if the code they test is refactored, the test should be updated to exercise the equivalent logic in the new code.

6. **Separate Regression Directory**: Maintain a dedicated `test/regression/` directory per application. This makes it easy to audit regression coverage and understand the platform's defect history.

7. **Automate the Protocol**: Use pre-commit hooks and CI/CD checks to enforce the regression protocol automatically. Manual enforcement is unreliable under deadline pressure.

## Common Pitfalls

- **Testing the Symptom, Not the Cause**: A regression test that only checks the visible symptom may pass even if the root cause recurs in a slightly different form. Test the root cause mechanism directly.

- **Skipping Failure Verification**: Without confirming the test fails on unfixed code, you cannot be certain the test actually detects the defect. A test that always passes provides zero regression protection.

- **Overly Broad Tests**: A regression test that exercises too much code may pass even when the specific fix regresses, because other code paths mask the failure. Keep regression tests focused and minimal.

- **Flaky Regression Tests**: Intermittently failing regression tests are worse than no test at all. They create alert fatigue and may cause teams to ignore genuine regressions. Fix or quarantine flaky tests immediately.

- **Missing Context in Reports**: A regression report without root cause analysis fails to capture the engineering knowledge gained during debugging. This knowledge prevents similar bugs in related code.

- **Batch Fixing Without Individual Tests**: When fixing multiple related bugs, write a separate regression test for each bug. Combined tests may mask individual regressions.

## Metrics and Continuous Improvement

The Prismatic Platform maintains comprehensive metrics on regression test effectiveness to continuously refine the protocol:

**Regression Test Coverage**: Percentage of bug fix commits that include regression tests. Target: 100% (currently 100% since protocol implementation).

**Test Effectiveness Rate**: Percentage of regression tests that successfully detect intentionally re-introduced bugs during validation exercises. Monthly audits randomly select 10 regression tests and temporarily reintroduce their corresponding bugs to verify the tests catch them.

**False Positive Rate**: Percentage of regression tests that fail due to flakiness rather than genuine regressions. Target: <2% (currently 1.3%).

**Maintenance Overhead**: Time spent updating regression tests due to refactoring or architectural changes. Tracked to ensure the regression protocol doesn't create unsustainable maintenance burden.

**Bug Recurrence Rate**: Number of previously fixed bugs that recur. Target: 0 (achieved since protocol implementation).

These metrics feed into the Quality DNA system, which tracks quality trends across generations and triggers autonomous improvement cycles when metrics drift from targets.

## Advanced Patterns and Techniques

**Metamorphic Testing Integration**: Some regression tests employ metamorphic testing principles, where the test verifies that certain relationships hold between inputs and outputs rather than checking specific output values. This is particularly valuable for regression tests of algorithms where the exact output may vary between implementations.

**Property-Based Regression Tests**: Using PropCheck or similar tools, some regression tests generate hundreds of test cases based on properties that the fixed code should maintain. This approach catches regressions that might occur only under specific input combinations not covered by example-based tests.

**Temporal Regression Detection**: Advanced regression tests include temporal assertions that verify the fix doesn't degrade performance characteristics. For example, a bug fix for a sorting algorithm includes performance regression tests ensuring the fix doesn't accidentally introduce O(n²) behavior where O(n log n) is expected.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) - Enforcement pipeline including regression test validation
- [NM/ND Doctrine](@/glossary/nm-nd.md) - Governance framework requiring regression tests for every fix
- [Violation Protocol](@/glossary/violation-protocol.md) - Escalation triggered by missing regression tests
- [Purple Team](@/glossary/purple-team.md) - Security regression guard applying the same principle
- [NO MERCY](@/glossary/no-mercy.md) - Zero tolerance doctrine mandating complete fix coverage
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) - Local enforcement mechanism for regression protocol
- [SEADF](@/glossary/seadf.md) - Self-evolving framework tracking regression test coverage

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Commands](@/commands/_index.md) - Quality enforcement commands

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)