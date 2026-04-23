+++
title = "Code Coverage"
weight = 11
[extra]
category = "quality"
description = "Measurement of which code lines, branches, and functions are exercised by the test suite, enforced at 100% for all new code under NO MERCY doctrine"
abbreviation = "COV"
domain = "quality-engineering"
complexity = "intermediate"
maturity = "production"
platform_version = "8.0.0"
generation = 19
enforcement_level = "mandatory"
related_terms = ["exunit", "clean-run", "qdp", "mix", "property-based-testing", "dialyzer", "typespec", "beam"]
platforms = ["elixir", "erlang", "beam"]
use_cases = ["regression-prevention", "quality-gate-enforcement", "dead-code-detection", "test-suite-health", "ci-cd-integration"]
tags = ["code-coverage", "test-quality", "line-coverage", "branch-coverage", "function-coverage", "excoveralls"]
coverage_tool = "erlang-cover"
reporting_tools = ["excoveralls", "cobertura", "lcov"]
threshold_blocking = 90
threshold_warning = 95
instrumentation_level = "beam-bytecode"
date_created = "2025-04-10"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1595
date_modified = "2026-02-23"
keywords = ["Code", "Coverage", "Measurement", "MERCY", "glossary", "quality", "Prismatic Platform", "Quality DNA", "Every"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code Coverage - Prismatic Platform"
+++

## Definition and Overview

Code coverage is a software quality metric that measures the proportion of source code executed during test suite runs. By instrumenting compiled code to record which lines, branches, and functions are exercised, coverage analysis identifies untested code paths, dead code, and areas requiring additional test cases. The metric is typically expressed as a percentage -- 100% line coverage means every source line was executed at least once during testing, though this does not guarantee correctness (a line can be executed without its output being verified by assertions).

Coverage analysis serves as a necessary but insufficient quality indicator. It answers the question "what code was exercised?" but not "was the code exercised correctly?" A test that calls a function without asserting on its return value achieves coverage without providing verification. This distinction is critical for understanding coverage's role in a comprehensive quality strategy: coverage is a floor, not a ceiling. It tells you what is definitely untested, but high coverage does not prove that the tested code is correct.

Coverage analysis operates at multiple granularities. Line coverage (the most common metric) tracks whether each source line was executed. Branch coverage tracks whether both true and false paths of every conditional expression (`if`, `case`, `cond`, `with`) were tested. Function coverage tracks whether each function was called. Path coverage -- the most rigorous -- tracks whether every possible execution path through a function was exercised. Each level provides progressively more confidence that the test suite exercises the code comprehensively, with correspondingly higher effort to achieve.

In the Elixir ecosystem, coverage is measured through Erlang's `:cover` module, which performs compile-time instrumentation of [BEAM](/glossary/beam/) bytecode. When a covered module executes, the instrumented code increments counters for each line and clause, producing a detailed execution map after tests complete. The `mix test --cover` command provides basic coverage reporting, while ExCoveralls and `mix coveralls` provide richer reporting with HTML output, threshold enforcement, and CI integration.

## Implementation in Prismatic Platform

The Prismatic Platform enforces 100% code coverage for all new code as a non-negotiable requirement of the NO MERCY doctrine. Coverage is measured via `mix test --cover` and ExCoveralls, and enforced through [quality gates](/glossary/quality-gates/), CI/CD pipelines, and the [Quality Floor Guardian](/glossary/quality-floor-guardian/). The platform's test files achieve comprehensive coverage across all 115 umbrella applications. The Mandatory Regression Test Protocol requires that every bug fix includes a regression test proving the bug existed before the fix and is resolved after -- ensuring that coverage is not just broad but targeted at actual failure modes.

Coverage reports are integrated into the platform's quality infrastructure. The [QDP](/glossary/qdp/) system counts insufficient coverage as quality debt, and the Quality Floor Guardian monitors coverage trends across sessions through [Quality DNA](/glossary/quality-dna/) persistence. When coverage drops below thresholds, commits are blocked until tests are added. The [Clean Run](/glossary/clean-run/) standard requires zero warnings during test compilation, ensuring that the test code itself meets the same quality bar as production code.

## Coverage Measurement in Elixir

Erlang's `:cover` module instruments BEAM bytecode at compile time, inserting counters at each executable line. The instrumentation is transparent to the running code -- it adds no behavioral changes, only observation infrastructure.

### Instrumentation Pipeline

The instrumentation process follows a clear pipeline from source code through compilation to coverage reporting:

```
Source (.ex) --> Compilation --> Instrumented BEAM bytecode
                                      |
                                      v
                              Test execution (mix test)
                                      |
                                      v
                              Line execution counters
                                      |
                                      v
                              Coverage report (HTML/JSON/console)
```

### Configuration

```elixir
defmodule PrismaticPerimeter.MixProject do
  @moduledoc false
  use Mix.Project

  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      test_coverage: [
        tool: ExCoveralls,
        summary: [threshold: 90]
      ],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.html": :test,
        "coveralls.json": :test
      ],
      deps: deps()
    ]
  end

  defp deps do
    [
      {:excoveralls, "~> 0.18", only: :test}
    ]
  end
end
```

### Running Coverage Analysis

```bash
# Basic Erlang :cover reporting
mix test --cover

# ExCoveralls with HTML report
mix coveralls.html

# Coverage with minimum threshold enforcement
mix coveralls --threshold 90

# Per-file coverage details
mix coveralls.detail

# JSON output for CI integration
mix coveralls.json
```

## Coverage Granularity Levels

Different coverage metrics provide different levels of confidence about test suite completeness. Understanding these levels is essential for choosing the right coverage strategy:

| Level | Measures | Confidence | Effort | Example |
|-------|----------|-----------|--------|---------|
| **Line** | Was each line executed? | Basic | Low | Every line runs at least once |
| **Branch** | Was each conditional path taken? | Moderate | Medium | Both `true` and `false` of every `if` |
| **Function** | Was each function called? | Minimal | Low | Every `def` invoked at least once |
| **Clause** | Was each function clause matched? | Good | Medium | Every pattern in multi-clause function |
| **Path** | Was every execution path traversed? | High | High | Every combination of branch decisions |

### Branch Coverage in Practice

Line coverage alone is insufficient for meaningful quality assurance. A function with multiple conditional paths can achieve 100% line coverage while leaving critical branches untested. Branch coverage ensures both true and false paths of every conditional are exercised:

```elixir
defmodule PrismaticPerimeter.RiskScorer do
  @moduledoc """
  Calculates risk scores for assets based on vulnerability
  and TLS certificate status. Branch coverage requires testing
  all conditional paths through this module.
  """

  @spec score(map()) :: {:ok, float()} | {:error, atom()}
  def score(%{vulnerabilities: vulns, tls: tls}) do
    # Branch 1: vulnerability check (requires true AND false paths)
    base = if vulns > 0, do: vulns * 2.5, else: 0.0

    # Branch 2: TLS validation (requires all 4 clauses)
    tls_penalty = case tls do
      :valid -> 0.0          # Branch 2a: valid certificate
      :expired -> 15.0       # Branch 2b: expired certificate
      :self_signed -> 25.0   # Branch 2c: self-signed certificate
      :missing -> 50.0       # Branch 2d: no TLS at all
    end

    {:ok, min(base + tls_penalty, 100.0)}
  end

  def score(_), do: {:error, :invalid_input}
end
```

To achieve 100% branch coverage for this module, tests must exercise:
- `vulns > 0` being true AND false (2 branches)
- `tls` matching `:valid`, `:expired`, `:self_signed`, AND `:missing` (4 branches)
- Valid map input AND invalid input (2 clauses)
- Total: 8 test cases minimum for complete branch and clause coverage

## Coverage vs. Quality

Coverage is a necessary but insufficient quality indicator. High coverage without meaningful assertions provides false confidence. The distinction between executing code and verifying code is the most important nuance in coverage analysis:

| Metric | Measures | Does NOT Measure |
|--------|----------|-----------------|
| **Line Coverage** | Code execution | Correct behavior |
| **Branch Coverage** | Decision paths taken | Edge case handling |
| **Function Coverage** | Functions called | Return value correctness |
| **Assertion Density** | Assertions per test | Assertion quality |

### The Coverage Paradox

```elixir
# BAD: 100% coverage, 0% value (no meaningful assertions)
test "calculate runs without error" do
  SecurityRating.calculate(%{assets: []})
  # This line achieves coverage but verifies nothing
end

# GOOD: 100% coverage WITH meaningful assertions
test "calculate returns B grade for moderate risk assets" do
  result = SecurityRating.calculate(%{assets: moderate_risk_assets()})
  assert {:ok, rating} = result
  assert rating.grade == :B
  assert rating.score >= 700
  assert rating.score < 850
  assert rating.confidence > 0.8
end
```

The Prismatic Platform addresses the coverage paradox through complementary measures:

- [Property-based testing](/glossary/property-based-testing/) via StreamData generates thousands of randomized inputs, catching edge cases that hand-written tests miss
- [Dialyzer](/glossary/dialyzer/) catches type mismatches that tests may overlook through static analysis
- [ExUnit](/glossary/exunit/) doctests verify documentation examples remain accurate
- Assertion density reviews during code review ensure tests are meaningful, not just comprehensive

## Coverage Reporting

ExCoveralls generates detailed reports showing per-module and per-line coverage across multiple output formats:

| Report Type | Command | Output | Use Case |
|-------------|---------|--------|----------|
| **Console** | `mix coveralls` | Summary table to stdout | Quick CI check |
| **HTML** | `mix coveralls.html` | Interactive HTML in `cover/` | Developer analysis |
| **JSON** | `mix coveralls.json` | Machine-readable JSON | CI integration |
| **Lcov** | `mix coveralls.lcov` | Standard lcov format | IDE integration |
| **GitHub** | `mix coveralls.github` | GitHub Actions integration | PR coverage comments |

### Console Output Example

```
----------------
COV    FILE                                        LINES RELEVANT   MISSED
100.0% lib/prismatic_perimeter/scanner.ex              95       42        0
 97.3% lib/prismatic_perimeter/risk_scorer.ex          67       37        1
100.0% lib/prismatic_perimeter/security_rating.ex      54       28        0
 95.8% lib/prismatic_perimeter/asset_discovery.ex     128       72        3
----------------
[TOTAL]  98.3%
```

## CI/CD Integration

Coverage enforcement is deeply integrated into the platform's continuous deployment pipeline, serving as a blocking quality gate:

```yaml
# GitLab CI coverage job
test:coverage:
  stage: test
  script:
    - mix deps.get
    - mix coveralls.json --threshold 90
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/excoveralls.json
  coverage: '/\[TOTAL\]\s+(\d+\.\d+)%/'
```

### Enforcement Thresholds

| Enforcement Level | Threshold | Action on Failure |
|-------------------|-----------|-------------------|
| **Warning** | < 95% | Log warning, allow merge |
| **Block** | < 90% | Block merge request |
| **Critical** | < 80% | Block + escalate to quality review |
| **Emergency** | < 70% | Block + immediate remediation required |

### Quality Gate Integration

```elixir
defmodule Prismatic.Quality.CoverageGate do
  @moduledoc """
  Coverage enforcement as a quality gate in the CI/CD pipeline.
  Reads coverage data from ExCoveralls output and enforces
  minimum thresholds per the platform's quality standards.
  """

  @blocking_threshold 90.0
  @warning_threshold 95.0

  @spec check(String.t()) :: :pass | {:warn, float()} | {:fail, float()}
  def check(coverage_path) do
    case read_coverage(coverage_path) do
      {:ok, percentage} when percentage >= @warning_threshold ->
        :pass

      {:ok, percentage} when percentage >= @blocking_threshold ->
        {:warn, percentage}

      {:ok, percentage} ->
        {:fail, percentage}

      {:error, reason} ->
        {:fail, reason}
    end
  end

  @spec read_coverage(String.t()) :: {:ok, float()} | {:error, term()}
  defp read_coverage(path) do
    with {:ok, content} <- File.read(path),
         {:ok, data} <- Jason.decode(content) do
      {:ok, data["source_files_coverage_percentage"]}
    end
  end
end
```

## Coverage-Driven Development Workflow

The platform's coverage enforcement creates a natural development workflow where coverage gaps are identified and addressed as part of the normal development cycle:

```
1. WRITE CODE
   +-> Implement feature or fix bug

2. RUN TESTS
   +-> mix test --cover
   +-> Identify uncovered lines/branches

3. ADD TESTS
   +-> Write tests for uncovered paths
   +-> Include edge cases and error paths
   +-> For bug fixes: regression test required

4. VERIFY COVERAGE
   +-> mix coveralls --threshold 90
   +-> All branches covered, assertions meaningful

5. QUALITY GATE
   +-> mix quality.gates (includes coverage check)
   +-> Pre-commit hook verifies coverage

6. CI/CD
   +-> GitLab CI runs full coverage analysis
   +-> Merge blocked if coverage drops below threshold
```

## Coverage in the Quality DNA Context

Coverage metrics are tracked as part of each application's [Quality DNA](/glossary/quality-dna/) record, enabling cross-session trend analysis:

```elixir
defmodule Prismatic.Quality.CoverageTracker do
  @moduledoc """
  Tracks coverage metrics in Quality DNA for trend analysis.
  Records per-application coverage percentages and identifies
  coverage regression patterns across sessions.
  """

  @spec record(atom(), float()) :: :ok
  def record(app_name, coverage_percentage) do
    case Prismatic.Quality.DNA.load(app_name) do
      {:ok, dna} ->
        updated_dna = update_coverage_domain(dna, coverage_percentage)
        Prismatic.Quality.DNA.save(updated_dna)

      {:error, :not_found} ->
        :ok
    end
  end

  @spec update_coverage_domain(map(), float()) :: map()
  defp update_coverage_domain(dna, percentage) do
    status = cond do
      percentage >= 95.0 -> :passing
      percentage >= 90.0 -> :warning
      true -> :failing
    end

    put_in(dna, [:domains, :coverage], %{
      status: status,
      score: percentage,
      violations: if(percentage < 90.0, do: 1, else: 0),
      last_checked: DateTime.utc_now()
    })
  end
end
```

## Coverage Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Testing implementation** | Tests break on refactoring | Test behavior, not internals |
| **Coverage-only tests** | No assertions, just execution | Add meaningful assertions per test |
| **Ignoring branches** | Only happy path tested | Test error paths and edge cases |
| **Excluding files** | Coverage gaps hidden by config | Minimize exclusions, justify each one |
| **Mocking everything** | Tests pass but integration fails | Use contract tests and integration tests |
| **Chasing 100%** | Testing trivial boilerplate | Focus coverage effort on business logic |

## Best Practices

1. **Measure Branch Coverage**: Line coverage alone is insufficient. A function with multiple conditional paths can achieve 100% line coverage while leaving critical branches untested. Branch coverage ensures both true and false paths of every conditional are exercised.

2. **Pair Coverage with Assertions**: Coverage without meaningful assertions provides false confidence. Every test should verify behavior, not just execute code paths. The Mandatory Regression Test Protocol ensures that bug fix tests prove both the existence of the bug and its resolution.

3. **Set Minimum Thresholds**: Configure coverage thresholds in CI (90%+ for blocking, 95%+ for warning) to catch coverage drops before they accumulate into significant gaps. The threshold should ratchet upward over time, never downward.

4. **Focus on Business Logic**: Prioritize high coverage on domain logic modules (risk scoring, compliance assessment, security rating calculation) over boilerplate modules (schemas, migrations, configuration).

5. **Use Coverage for Dead Code Detection**: Modules with persistent 0% coverage across multiple sessions are candidates for removal. Quality DNA trend analysis can identify these automatically.

6. **Track Coverage Trends**: Individual coverage snapshots are less valuable than trends. A module whose coverage drops from 95% to 90% over three sessions signals a developing quality problem.

7. **Complement with Property-Based Testing**: Coverage counts lines executed, not input diversity. [Property-based testing](/glossary/property-based-testing/) generates thousands of randomized inputs, achieving higher effective coverage than hand-written example tests.

## Common Pitfalls

- **Treating 100% as a goal rather than a floor**: 100% line coverage does not mean the code is correct. It means no line is completely untested. The real goal is correct, well-verified behavior.

- **Excluding files to inflate metrics**: Excluding modules from coverage analysis hides real gaps. Minimize exclusions and document the justification for each one.

- **Coverage-driven test writing**: Writing tests solely to increase a coverage number produces low-quality tests. Write tests to verify behavior, and let coverage be a side effect.

- **Ignoring coverage regressions**: When coverage drops on a commit, investigate immediately. Coverage regressions compound over time and become expensive to address retroactively.

- **Not testing error paths**: Happy-path coverage is easier to achieve but less valuable. Error handling code paths are where bugs hide, and they require deliberate test coverage effort.

## Use Cases

- **Regression Prevention**: Ensuring that every bug fix includes a test that would have caught the bug, verified by coverage analysis
- **Quality Gate Enforcement**: Blocking merge requests that reduce overall coverage below the configured threshold
- **Dead Code Detection**: Identifying modules with 0% coverage as candidates for removal or documentation
- **Test Suite Health Assessment**: Monitoring coverage trends across sessions through Quality DNA persistence
- **CI/CD Integration**: Generating coverage reports in Cobertura format for GitLab merge request annotations

## Related Concepts

- [ExUnit](/glossary/exunit/) -- Test framework that generates coverage data
- [Clean Run](/glossary/clean-run/) -- Zero-warning standard including coverage requirements
- [QDP](/glossary/qdp/) -- Quality debt system tracking insufficient coverage
- [Property-Based Testing](/glossary/property-based-testing/) -- Generative testing for higher effective coverage
- [Dialyzer](/glossary/dialyzer/) -- Static analysis complementing runtime coverage
- [Typespec](/glossary/typespec/) -- Type annotations enabling compile-time verification
- [Mix](/glossary/mix/) -- Build tool running coverage via `mix test --cover`
- [BEAM](/glossary/beam/) -- VM whose bytecode is instrumented for coverage
- [Quality DNA](/glossary/quality-dna/) -- Persistence mechanism tracking coverage trends
- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline where coverage is checked

## See Also

- [Architecture](/architecture/) -- Platform quality and testing architecture
- [Technologies](/technologies/) -- Testing tools and coverage infrastructure

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
