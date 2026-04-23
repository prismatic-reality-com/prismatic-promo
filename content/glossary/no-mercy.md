+++
title = "NO MERCY"
weight = 1
[extra]
description = "Zero tolerance for incomplete implementations, untested code, quality violations"
category = "doctrine"
related_terms = ["no-doubts", "nm-nd", "violation-protocol", "clean-run", "cascade-pattern", "code-coverage", "exunit", "property-based-testing", "qdp", "typespec"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1084
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MERCY", "Zero", "glossary", "doctrine", "Prismatic Platform", "Pattern", "Every"]
tags = ["glossary", "doctrine", "no-mercy", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "NO MERCY - Prismatic Platform"
+++

## Definition & Overview

NO MERCY is the enforcement arm of the NM/ND Doctrine that mandates absolute zero tolerance for incomplete implementations, untested code, quality violations, and deferred fixes. Every line of code must be production-ready from the moment of creation, with comprehensive test coverage and zero stubs, mocks, placeholders, naive implementations, TODO markers, or FIXME annotations. There are no exceptions, no "fix later" deferrals, no "temporary" workarounds, and no negotiation.

The principle operates on a simple axiom: code that is not production-ready should not exist in the repository. Every commit represents a complete, tested, verified unit of work. If a feature is too large to complete in a single commit, it is decomposed into smaller, independently complete increments -- each of which is production-ready on its own. The practice of committing incomplete work with the intention of completing it later is explicitly forbidden.

NO MERCY is not about perfectionism or unattainable standards. It is about completeness. The distinction is critical: perfectionism paralyzes by setting impossibly high aesthetic standards, while NO MERCY accelerates by requiring that every deliverable, however small, is fully functional, fully tested, and fully documented. A simple function with three tests is NO MERCY compliant. A complex function with zero tests is not, regardless of how elegant its implementation.

The principle has proven its effectiveness empirically: the Prismatic Platform maintains a 100/100 quality score across all 13 quality domains with 0 Quality Debt Points across a 2.8 million line codebase. This result is not accidental -- it is the direct consequence of enforcing NO MERCY on every commit since the doctrine's adoption.

## Technical Deep Dive

### Zero Tolerance Requirements

NO MERCY enforces zero tolerance across ten specific quality dimensions:

| Dimension | Requirement | Enforcement |
|-----------|-------------|-------------|
| **Completeness** | No stubs, placeholders, or naive implementations | Pre-commit pattern scan |
| **Test Coverage** | Comprehensive unit, integration, and property-based tests | Coverage gate (100%) |
| **Type Safety** | All public functions have @spec annotations | Dialyzer + custom check |
| **Static Analysis** | Zero Credo warnings in strict mode | Pre-commit + CI |
| **Compilation** | Zero warnings with --warnings-as-errors | Compilation gate |
| **Documentation** | All public APIs documented with @moduledoc/@doc | Custom check |
| **Regression** | Every bug fix includes regression test | Mandatory protocol |
| **TODO/FIXME** | Zero deferred work markers in codebase | Pattern scan |
| **Process Safety** | No Process.sleep, unsafe atom creation, or nil access | Pattern detection |
| **Anti-Patterns** | No length() > 0, unsafe map access, or common anti-patterns | Risk pattern scan |

### Forbidden Patterns

The pre-commit hook system scans for specific patterns that violate NO MERCY:

```elixir
defmodule PrismaticSafety.ForbiddenPatterns do
  @moduledoc """
  Defines patterns that are forbidden under the NO MERCY doctrine.
  These patterns indicate incomplete, unsafe, or anti-pattern code.
  """

  @forbidden_markers [
    {~r/\bTODO\b/i, :l3, "Deferred work marker"},
    {~r/\bFIXME\b/i, :l3, "Known defect marker"},
    {~r/\bHACK\b/i, :l3, "Acknowledged workaround"},
    {~r/\bstub\b/i, :l3, "Placeholder implementation"},
    {~r/\bplaceholder\b/i, :l3, "Incomplete implementation marker"},
    {~r/\bnaive.*implementation\b/i, :l3, "Non-production implementation"}
  ]

  @anti_patterns [
    {~r/length\(\w+\)\s*>\s*0/, :l2, "Use Enum.any?/1 or pattern match instead"},
    {~r/Process\.sleep/, :l2, "Use :timer or Process.send_after/3 instead"},
    {~r/String\.to_atom/, :l2, "Use String.to_existing_atom/1 instead"},
    {~r/\w+\[:(\w+)\]/, :l1, "Prefer Map.get/3 with default for safe access"}
  ]

  @spec scan(String.t()) :: [{Regex.t(), atom(), String.t()}]
  def scan(file_content) do
    (@forbidden_markers ++ @anti_patterns)
    |> Enum.filter(fn {pattern, _level, _message} ->
      Regex.match?(pattern, file_content)
    end)
  end
end
```

### CASCADE Elimination Patterns

When NO MERCY identifies systemic quality issues, CASCADE patterns provide bulk remediation strategies:

| Pattern | Description | QDP Eliminated |
|---------|-------------|----------------|
| **Type Mismatch** | Correct @spec annotations across modules | 200+ |
| **Dead Code** | Remove unreachable functions and modules | 150+ |
| **Empty Check** | Replace length() > 0 with Enum.any?/1 | 100+ |
| **Timer Replacement** | Replace Process.sleep with OTP timers | 50+ |
| **Nuclear Cache** | Clean corrupted build artifacts and PLT files | N/A (build fix) |

### Mandatory Regression Test Protocol

NO MERCY requires that every bug fix includes a regression test. This protocol is non-bypassable:

```
1. BEFORE fixing: Identify root cause and failure mode
2. CREATE regression test(s) that demonstrate the bug
3. VERIFY test FAILS with unfixed code (proves test validity)
4. APPLY the fix to the codebase
5. VERIFY test PASSES with fixed code (proves fix works)
6. REPORT completion with structured summary
```

## Architecture & Implementation

### Enforcement Architecture

NO MERCY is enforced through three concentric rings of protection:

```
Ring 3 (Outermost): Production Monitoring
+-------------------------------------------+
|  Quality Floor Guardian                    |
|  - Continuous quality score monitoring     |
|  - 4-level threshold alerts               |
|  - Auto-evolution triggers                 |
|                                            |
|  Ring 2 (Middle): CI/CD Pipeline           |
|  +-------------------------------------+  |
|  |  GitLab CI Stages                   |  |
|  |  - mix compile --warnings-as-errors |  |
|  |  - mix credo --strict               |  |
|  |  - mix dialyzer                     |  |
|  |  - mix test --cover                 |  |
|  |  - mix quality.gates               |  |
|  |                                     |  |
|  |  Ring 1 (Innermost): Pre-Commit     |  |
|  |  +-------------------------------+ |  |
|  |  | .githooks/pre-commit           | |  |
|  |  | - Compilation check            | |  |
|  |  | - Pattern scan                 | |  |
|  |  | - QDP check                    | |  |
|  |  | - Risk detection               | |  |
|  |  | - Modified file tests          | |  |
|  |  +-------------------------------+ |  |
|  +-------------------------------------+  |
+-------------------------------------------+
```

### Implementation in Quality Gates

```elixir
defmodule PrismaticSafety.NoMercyEnforcer do
  @moduledoc """
  Core NO MERCY enforcement engine.
  Validates that all code changes meet production-readiness requirements.
  """

  @type check_result :: :pass | {:fail, atom(), String.t()}

  @spec enforce_all(list(String.t())) :: {:ok, :all_passed} | {:error, list(check_result())}
  def enforce_all(changed_files) do
    checks = [
      &check_compilation/1,
      &check_credo_strict/1,
      &check_test_coverage/1,
      &check_forbidden_patterns/1,
      &check_typespec_coverage/1,
      &check_regression_tests/1
    ]

    results =
      checks
      |> Enum.flat_map(fn check -> check.(changed_files) end)
      |> Enum.reject(&(&1 == :pass))

    case results do
      [] -> {:ok, :all_passed}
      failures -> {:error, failures}
    end
  end

  defp check_compilation(files) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> [:pass]
      {output, _code} -> [{:fail, :compilation, "Compilation warnings: #{output}"}]
    end
  end

  defp check_forbidden_patterns(files) do
    files
    |> Enum.flat_map(fn file ->
      case File.read(file) do
        {:ok, content} ->
          PrismaticSafety.ForbiddenPatterns.scan(content)
          |> Enum.map(fn {_regex, level, message} ->
            {:fail, level, "#{file}: #{message}"}
          end)

        {:error, _} ->
          [:pass]
      end
    end)
    |> then(fn results ->
      case results do
        [] -> [:pass]
        violations -> violations
      end
    end)
  end
end
```

## Usage in Prismatic Platform

Within the Prismatic Platform, NO MERCY governs all code delivery across the entire 89-application umbrella. The principle is enforced at every integration point -- from the developer's local pre-commit hooks to the CI/CD pipeline to the production quality monitoring system.

### Quality Score Achievement

The platform's 100/100 quality score across all 13 quality domains is a direct result of NO MERCY enforcement. The 905 Quality Debt Points that existed before the doctrine's adoption were systematically eliminated through CASCADE patterns, and the pre-commit hook system prevents any new QDP from entering the repository.

### 13 Quality Domains

NO MERCY maintains zero violations across all 13 quality domains:

| Domain | Status | Enforcement |
|--------|--------|-------------|
| Dialyzer | 0 violations | Type checking gate |
| Credo | 0 violations | Static analysis gate |
| Compilation | 0 warnings | --warnings-as-errors |
| DateTime Precision | 0 violations | Custom check |
| Guard Functions | 0 violations | Pattern scan |
| @impl Coverage | 709 annotations | Callback verification |
| Memory Safety | 0 violations | Pattern detection |
| Performance | 0 violations | Benchmark gates |
| Regression Prevention | 0 regressions | Mandatory test protocol |
| Timing Patterns | 0 violations | Process.sleep detection |
| TODO Management | 0 markers | Pattern scan |
| Typespec Coverage | 0 missing | @spec verification |
| Unsafe Map Access | 0 violations | Pattern detection |

### Agent Compliance

All 434 AIAD agents carry the mandatory NM/ND enforcement block, which includes NO MERCY compliance. Agent definitions that contain incomplete specifications, missing capability definitions, or unverified authority claims are rejected during the AIAD indexing process.

## Code Examples

### Production-Ready Function Pattern

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Calculates security ratings for discovered assets.
  Produces A-F grades with numeric scores (300-900).
  """

  @type grade :: :a | :b | :c | :d | :f
  @type rating :: %{grade: grade(), score: integer(), percentile: float()}

  @doc """
  Calculates the security rating for a domain based on collected evidence.

  Returns a grade (A-F), numeric score (300-900), and industry percentile.

  ## Examples

      iex> SecurityRating.calculate("example.com", evidence)
      {:ok, %{grade: :b, score: 720, percentile: 65.3}}

  """
  @spec calculate(String.t(), map()) :: {:ok, rating()} | {:error, term()}
  def calculate(domain, evidence) when is_binary(domain) and is_map(evidence) do
    with {:ok, factors} <- extract_rating_factors(evidence),
         {:ok, raw_score} <- compute_weighted_score(factors),
         {:ok, normalized} <- normalize_score(raw_score, 300, 900) do
      grade = score_to_grade(normalized)
      percentile = compute_percentile(normalized)

      {:ok, %{grade: grade, score: normalized, percentile: percentile}}
    end
  end

  defp score_to_grade(score) when score >= 800, do: :a
  defp score_to_grade(score) when score >= 650, do: :b
  defp score_to_grade(score) when score >= 500, do: :c
  defp score_to_grade(score) when score >= 350, do: :d
  defp score_to_grade(_score), do: :f
end
```

## Best Practices

1. **Decompose Into Complete Units**: Large features should be broken into small, independently complete commits. Each commit must compile, pass tests, and be deployable on its own.

2. **Write Tests First**: Test-driven development naturally aligns with NO MERCY. Writing tests before implementation ensures that every function has coverage from the moment of creation.

3. **Use Type Specs Immediately**: Add `@spec` annotations when writing the function signature, not as an afterthought. This enables Dialyzer to catch type errors immediately.

4. **Handle All Error Cases**: Every function that can fail must return `{:ok, result}` or `{:error, reason}`. Pattern match on results, never assume success. Handle error cases explicitly.

5. **Verify Locally Before Committing**: Run `mix compile --warnings-as-errors`, `mix credo --strict`, and `mix test` for changed files before every commit. The pre-commit hooks enforce this, but running manually catches issues faster.

## Common Pitfalls

- **"I'll Add Tests Later"**: This is the most common NO MERCY violation. Tests are not optional follow-up work -- they are part of the implementation. Code without tests is incomplete code.

- **Stub Functions**: Functions that return hardcoded values or raise "not implemented" are L3 violations. If the function is not ready, do not commit it. If it is committed, it must be fully implemented.

- **Comment-Based Deferral**: Comments like `# TODO: handle edge case` or `# FIXME: this needs refactoring` are explicit NO MERCY violations. Address the issue now or do not commit the code.

- **Over-Mocking in Tests**: While NO MERCY demands comprehensive testing, using excessive mocks creates tests that verify mock behavior rather than actual code behavior. Prefer integration tests with real dependencies where feasible.

- **Confusing Completeness with Complexity**: A simple function with simple tests is perfectly compliant. NO MERCY does not demand complex solutions -- it demands complete solutions.

## Related Concepts

- [NO DOUBTS](/glossary/no-doubts/) - The investigative counterpart requiring evidence-based decisions
- [NM/ND Doctrine](/glossary/nm-nd/) - The combined enforcement framework
- [Violation Protocol](/glossary/violation-protocol/) - L1-L4 escalation for doctrine breaches
- [Quality Gates](/glossary/quality-gates/) - Automated enforcement pipeline implementing NO MERCY
- [Regression Test](/glossary/regression-test/) - Mandatory test required for every bug fix
- [Quality Debt](/glossary/quality-debt/) - QDP measurement eliminated through NO MERCY
- [CASCADE Pattern](/glossary/cascade-pattern/) - Bulk remediation patterns for systemic violations
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) - First enforcement point for NO MERCY compliance
- [Clean Run](/glossary/clean-run/) - Zero warnings compilation standard

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Technologies](/technologies/) - Technology stack details
- [Quality Gates Command](/commands/quality-gates/) - Quality enforcement commands

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)