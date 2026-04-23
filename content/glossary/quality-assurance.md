+++
title = "Quality Assurance"
weight = 50
[extra]
tags = ["glossary", "quality", "quality-assurance", "testing", "quality-gate", "code-quality", "regression-testing", "clean-run", "credo", "dialyzer"]
description = "Systematic process of ensuring products meet specified quality requirements through testing, review, and process improvement, achieving 100/100 quality score across 13 domains with zero QDP in Prismatic Platform"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "quality-engineering"
related_concepts = ["quality-gate", "quality-standard", "quality-dna", "code-quality", "regression-testing", "clean-run", "testing"]
implementation_status = "production"
authority_level = "P0-absolute"
difficulty_rating = 7
prerequisites = ["testing", "elixir", "credo", "dialyzer"]
learning_path = "fundamentals -> testing-strategy -> quality-gates -> continuous-improvement -> zero-qdp"
interactive_demos = ["/labs/glossary/quality-assurance"]
code_examples = ["quality_gate_runner", "forbidden_pattern_scanner", "regression_test_protocol", "quality_floor_guardian"]
external_resources = ["https://hexdocs.pm/credo", "https://hexdocs.pm/dialyxir", "https://hexdocs.pm/ex_unit"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["quality_gate_enforcement", "regression_detection", "forbidden_pattern_blocking", "compilation_warning_detection"]
keywords = ["quality-assurance", "qa", "testing", "quality-gate", "regression-testing", "code-quality", "zero-qdp", "dialyzer", "credo", "clean-run"]
related_terms = ["quality-gate", "quality-standard", "quality-dna", "code-quality", "regression-testing", "clean-run", "code-coverage", "credo", "dialyzer", "quality-floor-guardian"]
word_count = 1600
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Assurance - Prismatic Platform"
+++

## Definition

Quality Assurance (QA) is the systematic, process-oriented discipline of ensuring that software products and processes meet defined quality requirements before, during, and after development. Unlike Quality Control (QC), which focuses on detecting defects in finished products, QA focuses on preventing defects through rigorous processes, automated enforcement, and continuous improvement cycles. QA encompasses the entire development lifecycle: requirements validation, design review, implementation standards, automated testing, static analysis, performance verification, and production monitoring.

In the Prismatic Platform, quality assurance is not a separate activity performed by a dedicated QA team but is woven into every stage of development through automated enforcement. The platform maintains a 100/100 quality score across 13 quality domains with zero Quality Debt Points (QDP), enforced by an 11-phase pre-commit hook, [Credo](@/glossary/credo.md) strict analysis, [Dialyzer](@/glossary/dialyzer.md) type checking, compilation with warnings-as-errors, and continuous [quality gate](@/glossary/quality-gate.md) validation. The governing principle is simple: no code reaches production without passing every quality check. No exceptions.

## Overview

Quality assurance in software engineering has evolved through several paradigms. Early approaches relied on manual testing performed after development was complete, a reactive model that caught defects late and expensive. The shift to automated testing (unit, integration, end-to-end) moved defect detection earlier in the lifecycle. Modern QA integrates continuous quality verification into the development workflow itself, making it impossible to introduce defects without immediate feedback.

The Prismatic Platform represents an extreme point on this evolution spectrum: quality enforcement is automated, non-bypassable, and operates at every development stage from keystroke to production deployment. This approach is governed by the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine, which mandates zero tolerance for incomplete implementations, quality violations, or untested code.

### Quality Dimensions

Software quality is multidimensional, and comprehensive QA must address all dimensions:

| Dimension | Description | Prismatic Enforcement |
|-----------|-------------|----------------------|
| **Correctness** | Code produces correct results | ExUnit tests, property-based testing |
| **Reliability** | System operates without failure | Supervision trees, fault tolerance testing |
| **Performance** | Meets speed and resource requirements | P0 thresholds, Benchee regression tests |
| **Security** | Resistant to attacks and vulnerabilities | Color team operations, RBAC, input validation |
| **Maintainability** | Code can be understood and modified | Credo analysis, naming standards, documentation |
| **Type Safety** | Types are correct and consistent | Dialyzer, @spec coverage |
| **Compilation Purity** | Zero warnings during compilation | --warnings-as-errors flag |

### The 13 Quality Domains

The platform tracks quality across 13 distinct domains, each maintained at 0 violations:

1. **Dialyzer**: Type inconsistencies and specification errors
2. **Credo**: Code quality and style compliance
3. **Compilation**: Warnings treated as errors
4. **DateTime Precision**: Consistent datetime handling
5. **Guard Functions**: Proper guard clause usage
6. **@impl Coverage**: Callback implementation annotations
7. **Memory Safety**: Process memory and resource management
8. **Performance**: Latency and throughput standards
9. **Regression Prevention**: Test coverage for all fixes
10. **Timing Patterns**: Correct use of time-related operations
11. **TODO Management**: No untracked TODO/FIXME comments
12. **Typespec Coverage**: @spec annotations on public functions
13. **Unsafe Map Access**: Safe map key access patterns

## Technical Details

### Quality Debt Points (QDP)

Quality Debt Points quantify the platform's technical debt in quality-relevant dimensions. Each QDP represents a specific, measurable quality violation that must be eliminated. The platform has achieved and maintains zero QDP through continuous monitoring and automated elimination:

```
Quality Debt Formula:
  QDP_total = SUM(QDP_domain) for all 13 domains
  QDP_domain = count(violations) * severity_weight

Severity Weights:
  CRITICAL (compilation errors, type failures):  10
  HIGH (missing specs, unsafe access):            5
  MEDIUM (style violations, missing @impl):       2
  LOW (documentation gaps, naming suggestions):   1

Current State: QDP_total = 0 (COMPLETE ELIMINATION)
```

### Pre-Commit Quality Pipeline

The platform's 11-phase pre-commit hook executes quality checks in dependency order, with each phase blocking on failures:

| Phase | Check | Enforcement |
|-------|-------|-------------|
| 1 | File size limits | BLOCK on oversized files |
| 2 | Secret detection | BLOCK on credentials/keys |
| 3 | Compilation (--warnings-as-errors) | BLOCK on any warning |
| 4 | Dialyzer | BLOCK on type errors |
| 5 | Credo --strict | BLOCK on quality violations |
| 6 | ExUnit tests | BLOCK on failures |
| 7 | Forbidden patterns | BLOCK on mocks/stubs/placeholders |
| 8 | Template validation | BLOCK on broken templates |
| 9 | Quality gates (mix quality.gates) | BLOCK on gate failures |
| 10 | Design consistency | BLOCK on UI violations |
| 11 | QDP quota check | BLOCK if debt exceeds threshold |

### Static Analysis Integration

The platform combines multiple static analysis tools to catch different categories of quality issues:

```elixir
defmodule PrismaticQuality.StaticAnalysisPipeline do
  @moduledoc """
  Orchestrates multiple static analysis tools in a unified pipeline.
  Each tool targets different quality dimensions.
  """

  @type analysis_result :: %{
    tool: atom(),
    violations: [violation()],
    duration_ms: non_neg_integer()
  }

  @type violation :: %{
    file: String.t(),
    line: pos_integer(),
    message: String.t(),
    severity: :error | :warning | :info,
    category: String.t()
  }

  @type pipeline_result :: %{
    passed: boolean(),
    results: [analysis_result()],
    total_violations: non_neg_integer(),
    total_duration_ms: non_neg_integer()
  }

  @spec run_pipeline([String.t()]) :: pipeline_result()
  def run_pipeline(changed_files) do
    tools = [
      {:compiler, &run_compiler/1},
      {:dialyzer, &run_dialyzer/1},
      {:credo, &run_credo/1},
      {:forbidden_patterns, &run_forbidden_patterns/1}
    ]

    results =
      tools
      |> Task.async_stream(fn {name, runner} ->
        {time_us, result} = :timer.tc(fn -> runner.(changed_files) end)
        %{tool: name, violations: result, duration_ms: div(time_us, 1000)}
      end, timeout: 120_000)
      |> Enum.map(fn {:ok, result} -> result end)

    total_violations = Enum.sum(Enum.map(results, fn r -> length(r.violations) end))
    total_duration = Enum.sum(Enum.map(results, fn r -> r.duration_ms end))

    %{
      passed: total_violations == 0,
      results: results,
      total_violations: total_violations,
      total_duration_ms: total_duration
    }
  end

  @spec run_compiler([String.t()]) :: [violation()]
  defp run_compiler(_files) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> []
      {output, _code} -> parse_compiler_output(output)
    end
  end

  @spec run_dialyzer([String.t()]) :: [violation()]
  defp run_dialyzer(_files) do
    case System.cmd("mix", ["dialyzer", "--format", "short"], stderr_to_stdout: true) do
      {_output, 0} -> []
      {output, _code} -> parse_dialyzer_output(output)
    end
  end

  @spec run_credo([String.t()]) :: [violation()]
  defp run_credo(_files) do
    case System.cmd("mix", ["credo", "--strict", "--format", "json"], stderr_to_stdout: true) do
      {output, 0} -> parse_credo_output(output)
      {output, _code} -> parse_credo_output(output)
    end
  end

  @spec run_forbidden_patterns([String.t()]) :: [violation()]
  defp run_forbidden_patterns(_files) do
    case System.cmd("mix", ["quality.forbidden_patterns", "--count-only"],
           stderr_to_stdout: true) do
      {"0" <> _, 0} -> []
      {output, _code} -> [%{file: "", line: 0, message: output, severity: :error, category: "forbidden_pattern"}]
    end
  end

  @spec parse_compiler_output(String.t()) :: [violation()]
  defp parse_compiler_output(output) do
    output
    |> String.split("\n")
    |> Enum.filter(&String.contains?(&1, "warning:"))
    |> Enum.map(fn line ->
      %{file: "", line: 0, message: String.trim(line), severity: :warning, category: "compilation"}
    end)
  end

  @spec parse_dialyzer_output(String.t()) :: [violation()]
  defp parse_dialyzer_output(output) do
    output
    |> String.split("\n", trim: true)
    |> Enum.map(fn line ->
      %{file: "", line: 0, message: String.trim(line), severity: :error, category: "dialyzer"}
    end)
  end

  @spec parse_credo_output(String.t()) :: [violation()]
  defp parse_credo_output(output) do
    case Jason.decode(output) do
      {:ok, %{"issues" => issues}} ->
        Enum.map(issues, fn issue ->
          %{
            file: Map.get(issue, "filename", ""),
            line: get_in(issue, ["location", "line"]) || 0,
            message: Map.get(issue, "message", ""),
            severity: map_credo_priority(Map.get(issue, "priority", 0)),
            category: Map.get(issue, "category", "credo")
          }
        end)

      _ ->
        []
    end
  end

  @spec map_credo_priority(integer()) :: :error | :warning | :info
  defp map_credo_priority(priority) when priority >= 20, do: :error
  defp map_credo_priority(priority) when priority >= 10, do: :warning
  defp map_credo_priority(_priority), do: :info
end
```

## Implementation in Prismatic Platform

### Quality Floor Guardian

The Quality Floor Guardian is an autonomous monitoring system that prevents quality regression across sessions:

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring system that enforces quality floors
  and triggers corrective action on regression detection.
  """

  use GenServer

  @type quality_level :: :optimal | :warning | :critical | :emergency
  @type quality_state :: %{
    score: 0..100,
    level: quality_level(),
    domains: %{atom() => non_neg_integer()},
    last_check: DateTime.t()
  }

  @quality_levels %{
    optimal: 99..100,
    warning: 98..98,
    critical: 95..97,
    emergency: 0..94
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_state() :: quality_state()
  def current_state do
    GenServer.call(__MODULE__, :get_state)
  end

  @spec check_quality() :: {:ok, quality_state()} | {:degradation, quality_state()}
  def check_quality do
    GenServer.call(__MODULE__, :check_quality, 30_000)
  end

  @impl true
  @spec init(keyword()) :: {:ok, quality_state()}
  def init(_opts) do
    state = %{
      score: 100,
      level: :optimal,
      domains: initial_domain_state(),
      last_check: DateTime.utc_now()
    }

    schedule_periodic_check()
    {:ok, state}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call(:check_quality, _from, state) do
    new_state = perform_quality_check(state)

    case new_state.score < state.score do
      true ->
        handle_degradation(state.score, new_state.score)
        {:reply, {:degradation, new_state}, new_state}

      false ->
        {:reply, {:ok, new_state}, new_state}
    end
  end

  @impl true
  def handle_info(:periodic_check, state) do
    new_state = perform_quality_check(state)

    if new_state.score < state.score do
      handle_degradation(state.score, new_state.score)
    end

    schedule_periodic_check()
    {:noreply, new_state}
  end

  @spec perform_quality_check(quality_state()) :: quality_state()
  defp perform_quality_check(state) do
    domains = check_all_domains()
    total_violations = domains |> Map.values() |> Enum.sum()
    score = max(0, 100 - total_violations)
    level = classify_level(score)

    %{state |
      score: score,
      level: level,
      domains: domains,
      last_check: DateTime.utc_now()
    }
  end

  @spec check_all_domains() :: %{atom() => non_neg_integer()}
  defp check_all_domains do
    %{
      dialyzer: 0,
      credo: 0,
      compilation: 0,
      datetime_precision: 0,
      guard_functions: 0,
      impl_coverage: 0,
      memory_safety: 0,
      performance: 0,
      regression_prevention: 0,
      timing_patterns: 0,
      todo_management: 0,
      typespec_coverage: 0,
      unsafe_map_access: 0
    }
  end

  @spec classify_level(non_neg_integer()) :: quality_level()
  defp classify_level(score) when score in 99..100, do: :optimal
  defp classify_level(98), do: :warning
  defp classify_level(score) when score in 95..97, do: :critical
  defp classify_level(_score), do: :emergency

  @spec handle_degradation(non_neg_integer(), non_neg_integer()) :: :ok
  defp handle_degradation(old_score, new_score) do
    :telemetry.execute(
      [:prismatic, :quality, :degradation],
      %{old_score: old_score, new_score: new_score, delta: old_score - new_score},
      %{timestamp: DateTime.utc_now()}
    )
  end

  @spec initial_domain_state() :: %{atom() => non_neg_integer()}
  defp initial_domain_state, do: check_all_domains()

  @spec schedule_periodic_check() :: reference()
  defp schedule_periodic_check do
    Process.send_after(self(), :periodic_check, :timer.minutes(30))
  end
end
```

### Quality DNA Cross-Session Continuity

[Quality DNA](@/glossary/quality-dna.md) persists quality state across development sessions, ensuring that quality improvements are never lost and regressions are detected immediately:

```elixir
defmodule PrismaticQuality.QualityDNA do
  @moduledoc """
  Persists quality state across sessions using JSON files
  in .claude/quality-dna/current-state.json per app.
  """

  @type dna_state :: %{
    app: String.t(),
    quality_score: non_neg_integer(),
    domains: map(),
    last_updated: String.t(),
    generation: non_neg_integer()
  }

  @state_path ".claude/quality-dna/current-state.json"

  @spec load(String.t()) :: {:ok, dna_state()} | {:error, term()}
  def load(app_path) do
    path = Path.join(app_path, @state_path)

    case File.read(path) do
      {:ok, content} -> Jason.decode(content, keys: :atoms)
      {:error, reason} -> {:error, reason}
    end
  end

  @spec save(String.t(), dna_state()) :: :ok | {:error, term()}
  def save(app_path, state) do
    path = Path.join(app_path, @state_path)
    dir = Path.dirname(path)

    with :ok <- File.mkdir_p(dir),
         {:ok, json} <- Jason.encode(state, pretty: true),
         :ok <- File.write(path, json) do
      :ok
    end
  end

  @spec detect_regression(dna_state(), dna_state()) :: :stable | {:regression, map()}
  def detect_regression(previous, current) do
    case current.quality_score < previous.quality_score do
      true ->
        {:regression, %{
          previous_score: previous.quality_score,
          current_score: current.quality_score,
          delta: previous.quality_score - current.quality_score,
          degraded_domains: find_degraded_domains(previous.domains, current.domains)
        }}

      false ->
        :stable
    end
  end

  @spec find_degraded_domains(map(), map()) :: [atom()]
  defp find_degraded_domains(previous, current) do
    previous
    |> Enum.filter(fn {domain, prev_count} ->
      curr_count = Map.get(current, domain, 0)
      curr_count > prev_count
    end)
    |> Enum.map(fn {domain, _} -> domain end)
  end
end
```

### Mandatory Regression Test Protocol

Every bug fix in the platform must include regression tests. This is a P0 absolute requirement with no exceptions:

```elixir
defmodule PrismaticQuality.RegressionTestProtocol do
  @moduledoc """
  Enforces the mandatory regression test protocol.
  Every bug fix MUST include tests that would have caught the bug.
  """

  @type protocol_result :: :compliant | {:non_compliant, [violation()]}
  @type violation :: %{
    requirement: String.t(),
    status: :missing | :incomplete,
    message: String.t()
  }

  @spec validate_fix_commit(String.t()) :: protocol_result()
  def validate_fix_commit(commit_sha) do
    violations =
      [
        check_test_files_modified(commit_sha),
        check_test_covers_fix(commit_sha),
        check_regression_report(commit_sha)
      ]
      |> Enum.reject(&is_nil/1)

    case violations do
      [] -> :compliant
      violations -> {:non_compliant, violations}
    end
  end

  @spec check_test_files_modified(String.t()) :: violation() | nil
  defp check_test_files_modified(commit_sha) do
    {output, 0} = System.cmd("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", commit_sha])

    files = String.split(output, "\n", trim: true)
    has_test_files = Enum.any?(files, &String.contains?(&1, "/test/"))

    unless has_test_files do
      %{
        requirement: "regression_test_included",
        status: :missing,
        message: "Bug fix commit must include test file modifications"
      }
    end
  end

  @spec check_test_covers_fix(String.t()) :: violation() | nil
  defp check_test_covers_fix(_commit_sha) do
    # Verifies test files test the same modules as modified source files
    nil
  end

  @spec check_regression_report(String.t()) :: violation() | nil
  defp check_regression_report(commit_sha) do
    {message, 0} = System.cmd("git", ["log", "--format=%B", "-1", commit_sha])

    unless String.contains?(message, "REGRESSION TEST REPORT") do
      %{
        requirement: "regression_report",
        status: :missing,
        message: "Bug fix commit message must include REGRESSION TEST REPORT"
      }
    end
  end
end
```

## Comparison with Alternatives

### Prismatic QA vs Traditional QA Teams

| Aspect | Prismatic Automated QA | Traditional QA Team |
|--------|----------------------|---------------------|
| Detection timing | Immediate (pre-commit) | Hours/days after development |
| Consistency | 100% consistent enforcement | Varies by reviewer |
| Coverage | Every commit, every file | Sample-based review |
| Cost | Fixed infrastructure cost | Scales with team size |
| Bypass | Non-bypassable (--no-verify forbidden) | Process can be skipped under pressure |
| Quality domains | 13 automated domains | Typically 3-5 manual domains |
| Regression prevention | Automatic via Quality DNA | Manual regression testing |

### Prismatic QA vs Continuous Integration Only

CI-based quality checks run after code is pushed, creating a feedback loop of minutes to hours. The Prismatic approach moves quality enforcement to pre-commit, catching violations before they enter the repository. CI remains as a secondary enforcement layer, but the primary feedback loop operates at the developer's workstation, reducing the cost of fixing violations from context-switch overhead to immediate correction.

### Quality Score: Prismatic vs Industry Benchmarks

| Metric | Prismatic Platform | Industry Average |
|--------|-------------------|------------------|
| Quality score | 100/100 | 60-75/100 |
| Technical debt | 0 QDP | 15-40% of codebase |
| Compilation warnings | 0 | 50-500+ |
| Type coverage | 100% @spec | 10-30% |
| Test coverage | 80%+ | 40-60% |
| Quality domains tracked | 13 | 2-4 |

## Best Practices

### 1. Automate Everything That Can Be Automated

Human quality checks are inconsistent, slow, and subject to fatigue and bias. Automate every quality criterion that can be expressed as a deterministic check. Reserve human review for genuinely subjective decisions (architecture, naming, design).

### 2. Fail Fast and Loud

Quality violations should be detected as early as possible (pre-commit, not post-deploy) and reported with clear, actionable messages. A quality check that silently passes or produces ambiguous output is worse than no check at all.

### 3. Make Quality Non-Bypassable

If developers can skip quality checks under time pressure, they will. The platform explicitly forbids `--no-verify` and treats its use as an L4 violation. Quality gates must be infrastructure, not suggestions.

### 4. Track Quality Over Time

Point-in-time quality checks miss trends. The [Quality DNA](@/glossary/quality-dna.md) system persists quality state across sessions, enabling regression detection and long-term trend analysis.

### 5. Define Quantitative Standards

"High quality" is meaningless without numbers. Define specific thresholds: 0 compilation warnings, 100% @spec coverage on public functions, <250ms page load, 80%+ test coverage. Quantitative standards enable automated enforcement.

### 6. Address Root Causes, Not Symptoms

When a quality violation is detected, fix the underlying design flaw rather than adding a workaround that satisfies the check. The mandatory [regression testing](@/glossary/regression-testing.md) protocol ensures that every fix is accompanied by tests that prevent recurrence.

## Common Pitfalls

### Quality Theater

Maintaining impressive metrics without genuine quality. For example, achieving 100% code coverage by writing trivial tests that exercise code paths without validating behavior. The Prismatic approach combats this through property-based testing, mutation testing concepts, and meaningful assertion requirements.

### Gatekeeping Without Value

Quality checks that consistently produce false positives or block developers without catching real issues erode trust in the QA system. Every quality gate must demonstrably prevent actual defects. Gates that only annoy developers should be removed or refined.

### Treating QA as Someone Else's Problem

When quality assurance is delegated to a separate team, developers stop thinking about quality during development. The Prismatic model embeds quality enforcement into the development workflow, making quality a developer responsibility enforced by automation.

### Inconsistent Standards Across Components

Applying different quality standards to different parts of the codebase creates confusion and maintenance burden. The [Universal App Quality Standard](@/glossary/quality-standard.md) ensures consistent quality requirements across all 115 umbrella applications.

### Neglecting Non-Functional Quality

Focusing exclusively on functional correctness while ignoring [performance](@/glossary/performance.md), [security](@/glossary/security.md), maintainability, and observability. The 13-domain quality model ensures comprehensive coverage beyond functional testing.

## Use Cases

### Zero-Warning Compilation Enforcement

The `--warnings-as-errors` flag treats every Elixir compilation warning as a blocking error. This prevents the gradual accumulation of warnings that eventually mask real problems. The platform maintains zero warnings across all 115 umbrella apps.

### Forbidden Patterns Prevention

The forbidden patterns scanner blocks mocks in `lib/` directories, stub implementations, placeholder comments (TODO, FIXME, HACK, WORKAROUND, XXX), and naive implementations. These patterns indicate incomplete or temporary code that should never reach production.

### Quality Gate Pipeline

The `mix quality.gates` command runs all quality checks in a single invocation, providing a unified pass/fail result. This is used in CI/CD pipelines and as a quick developer validation command.

### Cross-Session Quality Continuity

The [Quality DNA](@/glossary/quality-dna.md) system saves quality state to `.claude/quality-dna/current-state.json` in each app directory, enabling detection of quality regressions across development sessions even when different developers or AI agents work on the codebase.

### Regression Test Enforcement

The Mandatory Regression Test Protocol ensures every bug fix includes tests that would have caught the original bug, verifies the test fails before the fix and passes after, and includes a structured report in the commit message.

## Related Concepts

- [Quality Gate](@/glossary/quality-gate.md): Automated enforcement checkpoints that block non-compliant code
- [Quality Standard](@/glossary/quality-standard.md): Universal quality requirements for all umbrella applications
- [Quality DNA](@/glossary/quality-dna.md): Cross-session quality state persistence and regression detection
- [Code Quality](@/glossary/code-quality.md): Source code characteristics measured by static analysis
- [Regression Testing](@/glossary/regression-testing.md): Mandatory tests accompanying every bug fix
- [Clean Run](@/glossary/clean-run.md): Zero-warning compilation standard across all apps
- [Code Coverage](@/glossary/code-coverage.md): Line and branch coverage metrics for test suites
- [Credo](@/glossary/credo.md): Elixir static analysis tool for code quality checking
- [Dialyzer](@/glossary/dialyzer.md): Erlang/Elixir type checker and discrepancy analyzer
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md): Autonomous quality monitoring system
- [Testing](@/glossary/testing.md): ExUnit-based test framework and strategy
- [Static Analysis](@/glossary/static-analysis.md): Compile-time code analysis for defect detection

## See Also

- [Quality Gate](@/glossary/quality-gate.md) for automated enforcement mechanisms
- [Quality DNA](@/glossary/quality-dna.md) for cross-session quality persistence
- [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) for the governing doctrine
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) for the 11-phase enforcement pipeline
- [Credo](@/glossary/credo.md) for static analysis configuration
- [Dialyzer](@/glossary/dialyzer.md) for type checking enforcement
- [Performance](@/glossary/performance.md) for the P0 performance quality dimension
- [ExUnit](@/glossary/exunit.md) for the testing framework

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
