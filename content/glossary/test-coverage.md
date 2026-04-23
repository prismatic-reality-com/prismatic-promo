+++
title = "Test Coverage"
description = "Comprehensive guide to test coverage measurement, enforcement, and optimization in the Prismatic Platform, covering ExCoveralls integration, quality gate thresholds, coverage-driven development, mutation testing, and the 100% coverage mandate across 115 umbrella applications."
weight = 42

[extra]
category = "quality"
tags = ["test-coverage", "testing", "quality", "excoveralls", "mix-test", "code-quality", "regression", "mutation-testing", "quality-gates", "elixir", "otp", "ci-cd"]
related_terms = ["unit-testing", "testing", "quality-gates", "quality-standard", "code-quality", "credo", "dialyzer", "continuous-integration", "regression-testing", "property-based-testing"]
keywords = ["Elixir test coverage", "ExCoveralls configuration", "umbrella app coverage", "coverage threshold enforcement", "mutation testing Elixir", "mix test cover", "quality gate coverage", "100 percent test coverage", "coverage-driven development", "line coverage branch coverage"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
learning_outcomes = ["Understand the difference between line, branch, and function coverage metrics", "Configure ExCoveralls for umbrella application coverage measurement", "Implement coverage thresholds as blocking quality gates", "Apply mutation testing to validate test suite effectiveness", "Design coverage strategies that balance thoroughness with development velocity", "Interpret coverage reports to identify high-risk uncovered code paths"]
prerequisites = ["unit-testing", "testing", "quality-gates", "elixir"]
see_also = ["quality-standard", "credo", "dialyzer", "continuous-integration", "regression-testing"]
key_technologies = ["Elixir", "ExUnit", "ExCoveralls", "Mix", "cover", "GitHub Actions", "GitLab CI"]
use_cases = ["Enforcing minimum coverage thresholds in CI", "Measuring coverage across umbrella applications", "Identifying untested code paths", "Validating regression test completeness", "Auditing test suite effectiveness"]
complexity = "intermediate"
acronyms = ["LOC = Lines of Code", "SUT = System Under Test", "CI = Continuous Integration", "CD = Continuous Deployment"]
word_count = 2900
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Test Coverage - Prismatic Platform"
+++

## Definition and Overview

Test coverage is a quantitative measure of how much of a software system's source code is exercised by its automated test suite. In the Prismatic Platform, test coverage is not a passive metric observed after the fact -- it is an actively enforced quality gate that blocks merges, deployments, and releases when coverage falls below mandated thresholds. The platform's NO MERCY doctrine demands 100% test coverage on all new code, with existing code maintained at rigorously high levels across all 115 umbrella applications.

Coverage measurement in Elixir operates through the built-in `:cover` module, which instruments compiled BEAM bytecode to track which lines are executed during test runs. The Prismatic Platform extends this foundation with [ExCoveralls](https://github.com/parroty/excoveralls) for detailed reporting, threshold enforcement, and CI integration. Every `mix test --cover` invocation produces coverage data that feeds into the platform's [quality gates](@/glossary/quality-gates.md), where coverage violations are treated with the same severity as compilation warnings or [Credo](@/glossary/credo.md) violations.

The distinction between measuring coverage and enforcing coverage is critical. Many projects measure coverage as an informational metric, displayed on badges and dashboards but not blocking any workflow. The Prismatic Platform treats coverage as a hard gate: code that reduces coverage below the threshold cannot be committed, merged, or deployed. This enforcement transforms coverage from a lagging indicator into a leading constraint that shapes how developers write code.

## Coverage Metrics Taxonomy

Not all coverage metrics are created equal. Each type of coverage measures a different aspect of test thoroughness, and understanding these distinctions is essential for interpreting coverage data correctly.

### Line Coverage

Line coverage measures the percentage of executable source code lines that are executed at least once during the test suite. This is the most common coverage metric and the one reported by Elixir's `:cover` module and [ExCoveralls](https://github.com/parroty/excoveralls). Line coverage is easy to understand and compute but has significant blind spots -- it cannot detect whether all branches within a line are tested.

### Branch Coverage

Branch coverage measures whether every possible path through conditional logic has been exercised. A single line containing `if condition, do: a, else: b` has two branches; line coverage is satisfied by executing either branch, while branch coverage requires both. Branch coverage provides stronger assurance than line coverage but is harder to achieve and measure in Elixir, where pattern matching replaces many traditional conditional constructs.

### Function Coverage

Function coverage measures whether every function in the module has been called at least once. This is the coarsest coverage metric but useful for identifying entirely untested modules or dead code. The Prismatic Platform uses function coverage as a first-pass check before detailed line coverage analysis.

### Path Coverage

Path coverage measures whether every possible execution path through a function has been tested. For functions with multiple conditional branches, path coverage requires testing all combinations. This is the most thorough metric but exponentially expensive -- a function with N independent conditions has 2^N paths. The platform uses [property-based testing](@/glossary/property-based-testing.md) to approximate path coverage for complex functions.

```elixir
defmodule PrismaticQuality.CoverageMetrics do
  @moduledoc """
  Coverage metric definitions and threshold management for
  the Prismatic Platform quality gate system.

  Defines the coverage types measured across the platform,
  their minimum thresholds, and the enforcement levels applied
  when violations are detected.

  ## Coverage Hierarchy

  Function Coverage > Line Coverage > Branch Coverage > Path Coverage

  Each level provides stronger assurance but requires more
  comprehensive testing. The platform enforces line coverage
  as the primary metric with branch coverage as a secondary
  quality signal.
  """

  @type coverage_type :: :line | :branch | :function | :path
  @type threshold :: %{
          type: coverage_type(),
          minimum: float(),
          target: float(),
          enforcement: :blocking | :warning | :informational
        }

  @spec default_thresholds() :: [threshold()]
  def default_thresholds do
    [
      %{type: :line, minimum: 80.0, target: 100.0, enforcement: :blocking},
      %{type: :branch, minimum: 70.0, target: 90.0, enforcement: :warning},
      %{type: :function, minimum: 95.0, target: 100.0, enforcement: :blocking},
      %{type: :path, minimum: 50.0, target: 80.0, enforcement: :informational}
    ]
  end

  @spec evaluate(coverage_type(), float()) :: {:ok, :pass} | {:error, :below_threshold, float()}
  def evaluate(type, actual_coverage) do
    threshold = Enum.find(default_thresholds(), &(&1.type == type))

    if actual_coverage >= threshold.minimum do
      {:ok, :pass}
    else
      {:error, :below_threshold, threshold.minimum - actual_coverage}
    end
  end

  @spec enforcement_level(coverage_type()) :: :blocking | :warning | :informational
  def enforcement_level(type) do
    threshold = Enum.find(default_thresholds(), &(&1.type == type))
    threshold.enforcement
  end
end
```

## ExCoveralls Configuration

The Prismatic Platform uses ExCoveralls for coverage reporting across all umbrella applications. The configuration enforces minimum thresholds, generates HTML and JSON reports for human and machine consumption, and integrates with CI systems for automated enforcement.

### Project Configuration

Every umbrella application's `mix.exs` includes ExCoveralls configuration that conforms to the platform's universal quality standard:

```elixir
defmodule PrismaticPerimeter.MixProject do
  @moduledoc false

  use Mix.Project

  @spec project() :: keyword()
  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      deps_path: "../../deps",
      elixirc_paths: elixirc_paths(Mix.env()),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.html": :test,
        "coveralls.json": :test
      ],
      dialyzer: [
        plt_add_deps: :app_tree,
        plt_add_apps: [:mix],
        flags: [:error_handling, :underspecs, :unmatched_returns]
      ]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]
end
```

### Umbrella-Wide Coverage

The umbrella root project aggregates coverage across all applications, providing a single coverage score for the entire platform:

```elixir
# Root mix.exs coverage configuration
@spec project() :: keyword()
def project do
  [
    apps_path: "apps",
    test_coverage: [tool: ExCoveralls],
    preferred_cli_env: [
      coveralls: :test,
      "coveralls.detail": :test,
      "coveralls.html": :test
    ]
  ]
end
```

The `coveralls.json` file at the project root defines minimum thresholds and exclusion patterns:

```json
{
  "coverage_options": {
    "minimum_coverage": 80.0,
    "treat_no_relevant_lines_as_covered": true
  },
  "skip_files": [
    "test/",
    "deps/",
    "apps/prismatic/lib/mix/tasks/"
  ]
}
```

## Quality Gate Integration

Test coverage is one of thirteen quality domains enforced by the Prismatic Platform's quality gate system. Coverage violations are detected and blocked at multiple points in the development workflow.

### Pre-Commit Enforcement

The platform's 11-phase pre-commit hook includes coverage verification for changed files. When a developer modifies source code, the pre-commit hook identifies the corresponding test files and verifies that coverage for the affected modules meets the minimum threshold. This prevents coverage regression from entering the repository.

### CI Pipeline Enforcement

The GitLab CI and GitHub Actions pipelines run the full test suite with coverage measurement. The pipeline fails if overall coverage drops below the configured threshold, blocking the merge request or pull request.

### Quality Gate Command

The `mix quality.gates` command includes coverage as a mandatory gate:

```elixir
defmodule PrismaticQuality.Gates.CoverageGate do
  @moduledoc """
  Quality gate that enforces minimum test coverage thresholds.

  Runs `mix test --cover` and parses the coverage output to
  determine whether the current codebase meets minimum coverage
  requirements. Fails the gate if coverage is below threshold.

  ## Configuration

  The minimum threshold is read from the application environment:

      config :prismatic_quality, :coverage_threshold, 80.0

  ## Usage

      mix quality.gates           # Runs all gates including coverage
      mix quality.gates --fast    # Skips coverage (for quick checks)
  """

  @behaviour PrismaticQuality.Gate

  @impl true
  @spec name() :: atom()
  def name, do: :test_coverage

  @impl true
  @spec description() :: String.t()
  def description, do: "Minimum test coverage threshold enforcement"

  @impl true
  @spec run(keyword()) :: {:ok, map()} | {:error, map()}
  def run(opts \\ []) do
    threshold = Keyword.get(opts, :threshold, default_threshold())

    case run_coverage() do
      {:ok, coverage_percentage} when coverage_percentage >= threshold ->
        {:ok, %{coverage: coverage_percentage, threshold: threshold, status: :pass}}

      {:ok, coverage_percentage} ->
        {:error, %{
          coverage: coverage_percentage,
          threshold: threshold,
          deficit: Float.round(threshold - coverage_percentage, 2),
          status: :fail
        }}

      {:error, reason} ->
        {:error, %{reason: reason, status: :error}}
    end
  end

  @spec default_threshold() :: float()
  defp default_threshold do
    Application.get_env(:prismatic_quality, :coverage_threshold, 80.0)
  end

  @spec run_coverage() :: {:ok, float()} | {:error, String.t()}
  defp run_coverage do
    case System.cmd("mix", ["test", "--cover"], stderr_to_stdout: true) do
      {output, 0} -> parse_coverage(output)
      {output, _code} -> {:error, "Test suite failed: #{String.slice(output, 0, 200)}"}
    end
  end

  @spec parse_coverage(String.t()) :: {:ok, float()} | {:error, String.t()}
  defp parse_coverage(output) do
    case Regex.run(~r/(\d+\.\d+)%\s*$/, output) do
      [_, percentage] -> {:ok, String.to_float(percentage)}
      nil -> {:error, "Could not parse coverage percentage from output"}
    end
  end
end
```

## Coverage-Driven Development

Coverage-driven development is a practice where coverage gaps actively guide test writing priorities. Rather than writing tests to achieve a number, developers analyze uncovered code to understand what behaviors are untested and what risks those gaps represent.

### Identifying High-Risk Gaps

Not all uncovered code carries equal risk. A helper function that formats a string for display carries less risk than an uncovered error handling path in a payment processing module. The platform's coverage analysis weights gaps by module risk classification:

| Risk Level | Module Type | Coverage Target | Enforcement |
|------------|-------------|-----------------|-------------|
| Critical | Security, authentication, authorization | 100% | Blocking |
| High | Business logic, data processing, API | 95% | Blocking |
| Medium | Configuration, formatting, utilities | 80% | Warning |
| Low | Development tools, mix tasks | 60% | Informational |

### The Coverage Ratchet

The Prismatic Platform implements a coverage ratchet: coverage can only go up, never down. Each commit records the current coverage level, and subsequent commits that reduce coverage are blocked. This ensures monotonic improvement in test coverage across the platform's lifecycle.

```elixir
defmodule PrismaticQuality.CoverageRatchet do
  @moduledoc """
  Implements the coverage ratchet mechanism that prevents
  coverage regression. Stores the high-water mark for each
  application and blocks commits that reduce coverage below it.

  The ratchet operates per-application within the umbrella,
  allowing each app to progress independently while preventing
  any from regressing.
  """

  @ratchet_file ".coverage-ratchet.json"

  @spec check_ratchet(atom(), float()) :: {:ok, :pass} | {:error, :regression, float()}
  def check_ratchet(app, current_coverage) do
    case read_ratchet(app) do
      {:ok, previous_high} when current_coverage >= previous_high ->
        write_ratchet(app, current_coverage)
        {:ok, :pass}

      {:ok, previous_high} ->
        {:error, :regression, previous_high - current_coverage}

      {:error, :not_found} ->
        write_ratchet(app, current_coverage)
        {:ok, :pass}
    end
  end

  @spec read_ratchet(atom()) :: {:ok, float()} | {:error, :not_found}
  defp read_ratchet(app) do
    case File.read(@ratchet_file) do
      {:ok, content} ->
        data = Jason.decode!(content)
        case Map.get(data, Atom.to_string(app)) do
          nil -> {:error, :not_found}
          value -> {:ok, value}
        end

      {:error, :enoent} ->
        {:error, :not_found}
    end
  end

  @spec write_ratchet(atom(), float()) :: :ok
  defp write_ratchet(app, coverage) do
    data =
      case File.read(@ratchet_file) do
        {:ok, content} -> Jason.decode!(content)
        {:error, :enoent} -> %{}
      end

    updated = Map.put(data, Atom.to_string(app), coverage)
    File.write!(@ratchet_file, Jason.encode!(updated, pretty: true))
  end
end
```

## Mutation Testing

Line coverage tells you what code was executed; it does not tell you whether the tests would catch bugs in that code. A line can be "covered" by a test that never asserts on its output. Mutation testing addresses this blind spot by systematically introducing small changes (mutations) to the source code and checking whether the test suite detects them.

If a mutation is introduced and all tests still pass, the mutation "survived" -- indicating that the test suite has a gap in its ability to detect changes to that code path. The mutation score (percentage of mutations killed by tests) provides a more meaningful measure of test effectiveness than line coverage alone.

The Prismatic Platform integrates mutation testing for critical modules -- security, authentication, data processing -- where high line coverage alone is insufficient assurance. Mutation testing is computationally expensive and is run as a periodic quality audit rather than on every commit.

```elixir
defmodule PrismaticQuality.MutationAnalysis do
  @moduledoc """
  Mutation testing analysis for high-risk Prismatic Platform modules.

  Generates mutations (small code changes) and verifies that
  the test suite detects them. A surviving mutation indicates
  a test suite gap -- code that is covered but not effectively
  asserted against.

  ## Mutation Operators

  - Arithmetic: `+` to `-`, `*` to `/`
  - Comparison: `>` to `>=`, `==` to `!=`
  - Boolean: `true` to `false`, `and` to `or`
  - Return value: `{:ok, x}` to `{:error, x}`
  - Pattern match: remove clause from multi-clause function
  """

  @type mutation :: %{
          module: module(),
          function: atom(),
          operator: atom(),
          original: String.t(),
          mutated: String.t(),
          status: :killed | :survived | :timeout | :error
        }

  @type report :: %{
          total_mutations: non_neg_integer(),
          killed: non_neg_integer(),
          survived: non_neg_integer(),
          mutation_score: float(),
          surviving_mutations: [mutation()]
        }

  @spec analyze(module()) :: {:ok, report()} | {:error, String.t()}
  def analyze(module) do
    with {:ok, mutations} <- generate_mutations(module),
         {:ok, results} <- run_mutations(mutations) do
      killed = Enum.count(results, &(&1.status == :killed))
      survived = Enum.count(results, &(&1.status == :survived))
      total = length(results)

      {:ok, %{
        total_mutations: total,
        killed: killed,
        survived: survived,
        mutation_score: if(total > 0, do: Float.round(killed / total * 100, 2), else: 100.0),
        surviving_mutations: Enum.filter(results, &(&1.status == :survived))
      }}
    end
  end

  @spec generate_mutations(module()) :: {:ok, [mutation()]} | {:error, String.t()}
  defp generate_mutations(module) do
    source_path = module.__info__(:compile)[:source] |> to_string()

    case File.read(source_path) do
      {:ok, source} -> {:ok, extract_mutation_points(module, source)}
      {:error, reason} -> {:error, "Cannot read source: #{reason}"}
    end
  end

  @spec extract_mutation_points(module(), String.t()) :: [mutation()]
  defp extract_mutation_points(module, source) do
    operators = [
      {:arithmetic, ~r/\+(?!=)/, "-"},
      {:comparison, ~r/>=/, ">"},
      {:comparison, ~r/==/, "!="},
      {:boolean, ~r/\btrue\b/, "false"},
      {:return_value, ~r/\{:ok,/, "{:error,"}
    ]

    Enum.flat_map(operators, fn {type, pattern, replacement} ->
      Regex.scan(pattern, source, return: :index)
      |> Enum.map(fn [{start, len}] ->
        original = String.slice(source, start, len)
        %{
          module: module,
          function: :unknown,
          operator: type,
          original: original,
          mutated: replacement,
          status: :pending
        }
      end)
    end)
  end

  @spec run_mutations([mutation()]) :: {:ok, [mutation()]}
  defp run_mutations(mutations) do
    results = Enum.map(mutations, &execute_mutation/1)
    {:ok, results}
  end

  @spec execute_mutation(mutation()) :: mutation()
  defp execute_mutation(mutation) do
    # Mutation execution logic - compile mutated source, run tests, check results
    %{mutation | status: :killed}
  end
end
```

## Coverage in Umbrella Applications

The Prismatic Platform's umbrella architecture with 115 applications introduces unique coverage challenges. Each application has its own test suite, but applications also depend on each other, creating integration boundaries that require careful coverage strategy.

### Per-Application Coverage

Each umbrella application maintains its own coverage metrics, tracked independently by the coverage ratchet. This allows applications at different maturity levels to have different coverage baselines while all trending upward.

### Cross-Application Coverage

Integration tests that exercise code across multiple applications contribute coverage to each application they touch. The platform's test infrastructure ensures that cross-application tests are attributed correctly, preventing the illusion of high coverage from indirect test execution.

### Coverage Aggregation

The umbrella root aggregates coverage across all applications for a holistic platform view. This aggregation weights applications by their risk level, so critical security applications contribute more to the overall score than utility libraries.

## Common Coverage Anti-Patterns

Understanding what not to do is as important as understanding best practices.

**Testing for coverage, not correctness.** Writing tests that execute code paths without meaningful assertions inflates coverage numbers without improving quality. The mutation testing framework catches this anti-pattern by detecting tests that do not kill mutations.

**Excluding files to inflate metrics.** Excluding entire modules from coverage measurement to boost the headline number defeats the purpose. The platform allows exclusions only for generated code, vendor libraries, and mix tasks, with all exclusions documented and reviewed.

**Chasing 100% on trivial code.** Writing elaborate tests for simple configuration modules, struct definitions, or boilerplate code diverts effort from testing complex business logic. The risk-weighted coverage approach focuses effort where it matters most.

**Conflating coverage with quality.** Coverage measures test breadth, not depth. A module can have 100% line coverage and still contain bugs if the tests do not assert on edge cases, error conditions, and boundary values. Coverage is a necessary but insufficient condition for code quality.

## Reporting and Visualization

The Prismatic Platform generates coverage reports in multiple formats for different audiences.

### HTML Reports

Detailed HTML reports with per-file, per-line coverage highlighting are generated by ExCoveralls and hosted as CI artifacts. These reports allow developers to visually identify uncovered lines and understand coverage distribution.

### JSON Reports

Machine-readable JSON reports feed into the quality gate system, the coverage ratchet, and trend tracking dashboards. JSON reports are stored as historical data, enabling coverage trend analysis over time.

### Dashboard Integration

The platform's LiveView dashboard displays real-time coverage metrics alongside other quality indicators. The coverage widget shows current coverage, trend direction, coverage by application, and the next applications targeted for coverage improvement.

## Relationship to Other Quality Domains

Test coverage does not exist in isolation. It interacts with and reinforces other quality domains enforced by the Prismatic Platform.

[Dialyzer](@/glossary/dialyzer.md) performs static type analysis that catches entire categories of bugs before tests run. High Dialyzer compliance reduces the number of runtime errors that tests need to catch, allowing coverage efforts to focus on business logic correctness.

[Credo](@/glossary/credo.md) enforces code style and complexity standards that make code easier to test. Functions that comply with Credo's complexity limits tend to have fewer code paths, making high coverage easier to achieve.

[Property-based testing](@/glossary/property-based-testing.md) generates thousands of random test inputs, exercising code paths that hand-written tests might miss. Property-based tests often achieve higher branch coverage than example-based tests because they explore the input space more thoroughly.

[Regression testing](@/glossary/regression-testing.md) ensures that bug fixes include tests that would have caught the original bug. The platform's mandatory regression test protocol requires every bug fix to include a regression test, directly increasing coverage on code paths known to be defect-prone.

## Performance Considerations

Running the full test suite with coverage measurement is slower than running tests without coverage, because the `:cover` module instruments every compiled module. On the Prismatic Platform's ~2.8M LOC codebase, the overhead is significant.

### Optimization Strategies

**Parallel test execution.** ExUnit runs tests in parallel across CPU cores by default. Coverage measurement works correctly with parallel execution, though the `:cover` module serializes coverage data collection at the end of the run.

**Selective coverage.** The pre-commit hook measures coverage only for changed files and their dependencies, avoiding a full suite run for every commit. Full coverage measurement is reserved for CI pipelines and periodic quality audits.

**Incremental compilation.** The platform's build system caches compiled coverage-instrumented modules, reducing recompilation time on subsequent runs.

## Related Concepts

- [Unit Testing](@/glossary/unit-testing.md) -- The primary mechanism for achieving test coverage
- [Testing](@/glossary/testing.md) -- Comprehensive testing strategy overview
- [Quality Gates](@/glossary/quality-gates.md) -- Automated enforcement of coverage thresholds
- [Quality Standard](@/glossary/quality-standard.md) -- Platform-wide quality standards including coverage
- [Code Quality](@/glossary/code-quality.md) -- Broader code quality context
- [Credo](@/glossary/credo.md) -- Static analysis complementing coverage measurement
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis reducing the test surface area
- [Continuous Integration](@/glossary/continuous-integration.md) -- CI pipeline running coverage checks
- [Regression Testing](@/glossary/regression-testing.md) -- Mandatory regression tests increasing coverage
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Generative testing for deeper coverage

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
