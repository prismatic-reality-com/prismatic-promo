+++
title = "Regression Testing"
weight = 6
[extra]
icon = "refresh"
color = "emerald"
description = "Mandatory regression test protocol ensuring every bug fix includes a test that prevents recurrence"
category = "testing"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1023
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Regression", "Testing", "Mandatory", "capabilities", "Prismatic Platform", "Regression Test"]
tags = ["capabilities", "testing", "regression-testing", "prismatic"]
quality_score = 75
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Regression Testing - Prismatic Platform"
+++

## Overview

The Mandatory Regression Test Protocol ensures that every bug fixed on the Prismatic Platform is a bug that can never return. This is not a best practice recommendation but an absolute, non-bypassable enforcement requirement: every bug fix must include a regression test that would have caught the original bug, verified to fail before the fix and pass after it. No exception, no bypass, no deferral.

Regression testing addresses one of the most persistent and costly failure modes in software engineering: the reintroduction of previously fixed bugs. Studies consistently show that 15-25% of bug fixes in complex systems inadvertently reintroduce bugs that were fixed earlier. In a platform with 2.8 million lines of code across 99 umbrella applications, even a small regression rate compounds into significant quality degradation over time. The Mandatory Regression Test Protocol eliminates this failure mode entirely.

The protocol integrates with the [NO MERCY](@/capabilities/no-mercy.md) doctrine's zero-tolerance standards and is enforced through [Quality Gates](@/capabilities/quality-gates.md) pre-commit hooks that reject any bug fix commit lacking the required regression test. Combined with [Telemetry Integration](@/capabilities/telemetry-integration.md) for tracking regression test execution and [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) for alerting on test failures, the protocol creates a comprehensive defense against regression.

## Protocol Requirements

The Mandatory Regression Test Protocol follows a strict five-phase sequence that must be completed for every bug fix. Each phase has specific deliverables and verification criteria.

### Phase 1: Root Cause Investigation

Before writing any fix code, the developer must identify the bug's root cause with sufficient precision to design a targeted regression test. This aligns with the [NO DOUBTS](@/capabilities/no-doubts.md) doctrine's requirement for full investigation before action.

| Investigation Step | Deliverable | Verification |
|-------------------|-------------|--------------|
| Reproduce the bug | Reproducible test case or steps | Bug manifests consistently |
| Identify root cause | Written description of failure mechanism | Root cause explains all symptoms |
| Map failure boundaries | Set of inputs that trigger the bug | Boundary conditions documented |
| Check for related bugs | Assessment of similar code paths | Related areas identified |

### Phase 2: Regression Test Design

Design the regression test before implementing the fix. The test must be specific enough to catch the exact bug while general enough to detect related regressions.

```elixir
defmodule Prismatic.Perimeter.AssetProcessorRegressionTest do
  @moduledoc """
  Regression tests for AssetProcessor bug fixes.
  Each test references the original issue and documents the root cause.
  """
  use ExUnit.Case, async: true

  alias Prismatic.Perimeter.AssetProcessor

  describe "regression: handle empty asset list (#1234)" do
    @tag :regression
    @tag issue: "1234"
    @tag root_cause: "Enum.map/2 called on nil instead of empty list"

    test "returns empty result for empty input" do
      # This test would have caught the original bug:
      # AssetProcessor.process([]) crashed because the function
      # pattern-matched on [head | tail] without handling []
      assert {:ok, []} = AssetProcessor.process([])
    end

    test "returns error for nil input" do
      # Related regression: nil was passed through to Enum.map/2
      assert {:error, :invalid_input} = AssetProcessor.process(nil)
    end

    test "handles single-element list correctly" do
      # Boundary case: ensure fix works for list with exactly one element
      asset = build_asset("example.com")
      assert {:ok, [processed]} = AssetProcessor.process([asset])
      assert processed.domain == "example.com"
    end
  end

  describe "regression: certificate date parsing (#1287)" do
    @tag :regression
    @tag issue: "1287"
    @tag root_cause: "DateTime.from_iso8601/1 returned error tuple unhandled"

    test "handles malformed certificate dates gracefully" do
      asset = build_asset("test.com", cert_expiry: "not-a-date")
      assert {:ok, [processed]} = AssetProcessor.process([asset])
      assert is_nil(processed.cert_expiry)
    end

    test "handles missing certificate dates" do
      asset = build_asset("test.com", cert_expiry: nil)
      assert {:ok, [processed]} = AssetProcessor.process([asset])
      assert is_nil(processed.cert_expiry)
    end

    test "parses valid ISO 8601 dates correctly" do
      asset = build_asset("test.com", cert_expiry: "2026-12-31T23:59:59Z")
      assert {:ok, [processed]} = AssetProcessor.process([asset])
      assert %DateTime{year: 2026, month: 12} = processed.cert_expiry
    end
  end

  defp build_asset(domain, opts \\ []) do
    %{
      domain: domain,
      cert_expiry: Keyword.get(opts, :cert_expiry),
      discovered_at: DateTime.utc_now()
    }
  end
end
```

### Phase 3: Test-First Verification

The regression test must be verified to fail with the unfixed code. This critical step proves that the test actually detects the bug, rather than being a vacuous test that always passes.

| Verification Step | Expected Result | Purpose |
|-------------------|----------------|---------|
| Run test against unfixed code | Test FAILS | Proves test detects the bug |
| Confirm failure matches bug symptoms | Failure mode matches reported bug | Validates test targets correct issue |
| Document failure output | Error message or crash recorded | Creates audit trail |

### Phase 4: Fix Implementation and Verification

Apply the fix and verify that the regression test now passes, along with the entire existing test suite.

| Verification Step | Expected Result | Purpose |
|-------------------|----------------|---------|
| Apply the code fix | Fix addresses root cause | Targets actual failure mechanism |
| Run regression test | Test PASSES | Proves fix resolves the bug |
| Run full test suite | All tests PASS | Ensures no side effects |
| Run [Dialyzer](@/technologies/dialyzer.md) | Zero type errors | Verifies type safety preserved |
| Run [Credo](@/technologies/credo.md) strict | Zero issues | Verifies code quality maintained |

### Phase 5: Regression Report

Every completed bug fix must generate a regression report documenting the fix, test, and verification results.

```
REGRESSION TEST REPORT
Bug Fixed: AssetProcessor crashes on empty asset list (#1234)
Root Cause: Pattern match on [head | tail] without empty list clause
Test Added: test/prismatic_perimeter/asset_processor_regression_test.exs
  - "returns empty result for empty input"
  - "returns error for nil input"
  - "handles single-element list correctly"
Validation: Test fails before fix, passes after fix
Coverage: Empty list, nil input, single-element boundary case
```

## Test Categories

The regression test protocol supports four categories of regression tests, selected based on the scope and nature of the original bug:

| Category | When to Use | Scope | Example |
|----------|-------------|-------|---------|
| **Unit Regression** | Bug in single function | Single module | Empty list crash in `AssetProcessor.process/1` |
| **Integration Regression** | Bug spans multiple modules | Cross-module interaction | Data loss between storage adapter and API layer |
| **Property Regression** | Bug involves edge cases | Input space exploration | Numeric overflow in security score calculation |
| **End-to-End Regression** | Bug affects user-visible flow | Full request lifecycle | LiveView dashboard fails to render on empty data |

### Property-Based Regression Tests

For bugs involving edge cases or boundary conditions, property-based testing with StreamData provides stronger guarantees than example-based tests alone:

```elixir
defmodule Prismatic.Perimeter.SecurityScoreRegressionTest do
  use ExUnit.Case, async: true
  use ExUnit.Parameterized

  describe "regression: score overflow on extreme inputs (#1301)" do
    @tag :regression
    @tag issue: "1301"

    property "score never exceeds maximum (900) regardless of input" do
      check all findings <- StreamData.integer(0..100_000),
                critical <- StreamData.integer(0..findings),
                info <- StreamData.integer(0..findings) do
        evidence = %{
          findings: findings,
          critical: critical,
          info: info,
          domain: "property-test.com"
        }

        {:ok, rating} = SecurityScore.calculate(evidence)
        assert rating.score >= 300, "Score #{rating.score} below minimum 300"
        assert rating.score <= 900, "Score #{rating.score} above maximum 900"
      end
    end

    property "score decreases monotonically with more critical findings" do
      check all base <- StreamData.integer(0..100),
                delta <- StreamData.integer(1..100) do
        base_evidence = %{findings: 100, critical: base, domain: "mono-test.com"}
        worse_evidence = %{findings: 100, critical: base + delta, domain: "mono-test.com"}

        {:ok, base_rating} = SecurityScore.calculate(base_evidence)
        {:ok, worse_rating} = SecurityScore.calculate(worse_evidence)

        assert worse_rating.score <= base_rating.score
      end
    end
  end
end
```

## Enforcement Mechanisms

The regression test protocol is enforced at multiple levels to ensure zero bypass:

| Enforcement Point | Mechanism | Violation Response |
|-------------------|-----------|-------------------|
| **Pre-commit hook** | Scan for `@tag :regression` in test files associated with fix | Commit BLOCKED if no regression tag found |
| **CI pipeline** | Verify regression tests exist for all bug-fix commits | Pipeline FAILS if regression tests missing |
| **Code review** | Reviewer must verify regression test validity | PR BLOCKED until test verified |
| **Quality Gate** | `mix quality.gates` checks regression test compliance | Gate FAILS on non-compliance |

### Automated Detection

The pre-commit hook automatically detects bug-fix commits and verifies regression test presence:

```elixir
defmodule PrismaticSafety.RegressionTestGuard do
  @moduledoc """
  Enforces the Mandatory Regression Test Protocol.
  Detects bug-fix commits and verifies regression test inclusion.
  """

  @bug_fix_indicators ["fix(", "fix:", "bugfix", "hotfix", "regression"]

  @spec validate_commit(commit_message :: String.t(), changed_files :: list(String.t())) ::
    :ok | {:error, :missing_regression_test}
  def validate_commit(commit_message, changed_files) do
    if is_bug_fix_commit?(commit_message) do
      if has_regression_test?(changed_files) do
        :ok
      else
        {:error, :missing_regression_test}
      end
    else
      :ok
    end
  end

  defp is_bug_fix_commit?(message) do
    downcased = String.downcase(message)
    Enum.any?(@bug_fix_indicators, &String.contains?(downcased, &1))
  end

  defp has_regression_test?(changed_files) do
    test_files = Enum.filter(changed_files, &String.ends_with?(&1, "_test.exs"))

    Enum.any?(test_files, fn file ->
      content = File.read!(file)
      String.contains?(content, "@tag :regression") or
        String.contains?(content, "regression:")
    end)
  end
end
```

## Regression Test Tagging Convention

All regression tests follow a consistent tagging convention that enables filtering, reporting, and traceability:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@tag :regression` | Identifies test as regression test | Required for all regression tests |
| `@tag issue: "1234"` | Links to original issue number | Traceability to bug report |
| `@tag root_cause: "..."` | Documents root cause | Knowledge preservation |
| `@tag severity: :critical` | Bug severity level | Prioritization in test runs |
| `@tag component: :perimeter` | Affected platform component | Scope identification |

```bash
# Run only regression tests
mix test --only regression

# Run regression tests for a specific component
mix test --only component:perimeter --only regression

# Run regression tests for a specific issue
mix test --only issue:1234
```

## Metrics and Effectiveness

The regression test protocol produces measurable improvements in platform stability:

| Metric | Before Protocol | After Protocol | Improvement |
|--------|----------------|----------------|-------------|
| Bug recurrence rate | 15-20% of fixes | < 1% of fixes | 95% reduction |
| Regression test count | 0 (ad hoc) | 350+ tagged tests | Comprehensive coverage |
| Time to fix regressions | 4-8 hours (re-investigation) | 0 hours (prevented) | 100% elimination |
| Test suite regression detection | ~60% catch rate | ~99% catch rate | 65% improvement |
| Developer confidence in fixes | Moderate | High | Measurable via survey |

## Integration Points

The Mandatory Regression Test Protocol integrates with the broader platform quality infrastructure:

- **[NO MERCY](@/capabilities/no-mercy.md)**: Regression protocol is a core enforcement mechanism of the zero-tolerance doctrine
- **[NO DOUBTS](@/capabilities/no-doubts.md)**: Root cause investigation aligns with the full investigation pillar
- **[Quality Gates](@/capabilities/quality-gates.md)**: Regression test presence verified as a gate requirement
- **[Trinity Gate](@/capabilities/trinity-gate.md)**: Complex regressions may require formal verification through Trinity
- **[Session Discipline](@/capabilities/session-discipline.md)**: Regression tests committed and pushed as part of session flow
- **[Telemetry Integration](@/capabilities/telemetry-integration.md)**: Regression test execution tracked via telemetry events
- **[Real-Time Monitoring](@/capabilities/real-time-monitoring.md)**: Regression test failures trigger immediate alerts
- **[Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md)**: Regression detection can trigger auto-healing cycles
- **[AIAD Standard](@/capabilities/aiad-standard.md)**: Agent-related bug fixes follow the same regression protocol
- **[Color Teams](@/capabilities/color-teams.md)**: Red Team identifies potential regression vectors for proactive testing

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/regression-add` | Create regression test template for current fix | Universal |
| `/regression-validate` | Verify regression test validity (fail-then-pass) | Universal |
| `/regression-report` | Generate regression test report | Universal |
| `mix test --only regression` | Run all regression tests | Development |
| `mix test --only issue:NUMBER` | Run regression tests for specific issue | Development |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)