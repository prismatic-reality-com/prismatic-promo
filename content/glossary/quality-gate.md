+++
title = "Quality Gate"
weight = 50
[extra]
tags = ["glossary", "quality", "gate", "enforcement", "ci-cd", "pre-commit", "static-analysis", "testing", "compilation", "governance"]
description = "A Quality Gate is a mandatory checkpoint in the software delivery pipeline that evaluates code against defined quality criteria and produces a binary pass/fail verdict, blocking progression until all quality requirements are satisfied"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["quality-gates", "quality-dna", "quality-floor-guardian", "pre-commit-hooks", "continuous-integration", "static-analysis", "dialyzer", "credo", "code-coverage", "clean-run"]
keywords = ["quality gate", "quality checkpoint", "quality enforcement", "quality barrier", "code gate", "merge gate", "deployment gate", "quality check", "pipeline gate", "quality block"]
testing_scenarios = ["verify gate blocks code that fails quality criteria", "validate gate produces structured output for telemetry", "test gate cannot be bypassed via configuration", "confirm gate evaluates all registered checks", "ensure gate provides actionable failure messages"]
prerequisites = ["continuous-integration", "static-analysis", "testing"]
learning_path = ["testing", "continuous-integration", "quality-gate", "quality-gates", "quality-dna"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 1731
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Gate - Prismatic Platform"
+++

## Definition

A Quality Gate is a mandatory checkpoint in a software delivery pipeline that evaluates code against a defined set of quality criteria and produces a binary pass/fail verdict. When a quality gate fails, the pipeline is blocked: code cannot progress to the next stage (commit, merge, deployment) until all quality requirements are satisfied. Quality gates differ from quality advisories (which merely report) in that they have enforcement authority -- they can and do prevent unqualified code from advancing.

In the Prismatic Platform, quality gates are not optional configuration. They are structural invariants of the development workflow, enforced through Git hooks, CI/CD pipelines, and mix tasks. The platform operates 13 quality domains, each with its own gate, and all 13 must pass before any code modification is accepted. This zero-tolerance enforcement is a direct implementation of the NO MERCY doctrine: no incomplete implementations, no quality violations, no untested code.

## Overview

The concept of quality gates originates from manufacturing, where physical checkpoints on an assembly line inspect products at critical stages. A car body that fails structural testing does not proceed to painting. Software quality gates apply the same principle to code: code that fails compilation does not proceed to testing, code that fails testing does not proceed to review, code that fails review does not proceed to deployment.

The power of quality gates lies in their position in the workflow. By placing quality enforcement at the boundaries between workflow stages, gates prevent the accumulation of quality debt that occurs when problems are discovered late. A compilation error caught at commit time costs minutes to fix. The same error caught in production costs hours or days. Quality gates enforce the "shift left" principle by making quality assessment a prerequisite for every workflow transition.

The Prismatic Platform implements quality gates at three levels:

**Pre-Commit Gates (Local)**: The 11-phase pre-commit pipeline runs on the developer's machine before every commit. These gates catch problems at the earliest possible point, before code ever reaches a shared repository. The pipeline includes compilation checks, Credo analysis, Dialyzer type checking, forbidden pattern detection, test execution, and quality floor verification.

**CI/CD Gates (Pipeline)**: GitLab CI runs quality gates as pipeline stages. These gates run in a controlled environment and verify that code that passed local gates also passes in the canonical build environment. CI gates include all pre-commit checks plus integration tests, coverage analysis, and deployment readiness verification.

**Deployment Gates (Production)**: Before deploying to production, additional gates verify that the release artifact meets production quality standards: health checks respond, performance benchmarks pass, and no regression has been introduced since the last deployment.

Each level provides defense in depth: if a problem escapes one level, the next level catches it. This layered approach makes quality escape to production statistically improbable.

## Technical Details

### Quality Gate Behaviour

```elixir
defmodule Prismatic.Quality.Gate do
  @moduledoc """
  Defines the behaviour for quality gates. Each gate implements
  a specific quality check and produces a structured result that
  includes evidence, timing, and actionable feedback.
  """

  @type gate_result :: %{
          gate: atom(),
          domain: atom(),
          status: :pass | :fail,
          violations: [violation()],
          evidence: map(),
          duration_ms: non_neg_integer(),
          suggestions: [String.t()]
        }

  @type violation :: %{
          file: String.t(),
          line: non_neg_integer() | nil,
          message: String.t(),
          severity: :critical | :high | :medium | :low,
          rule: atom()
        }

  @callback evaluate(opts :: keyword()) :: {:ok, gate_result()} | {:error, term()}
  @callback domain() :: atom()
  @callback name() :: atom()
  @callback severity() :: :blocking | :warning

  defmacro __using__(opts) do
    quote do
      @behaviour Prismatic.Quality.Gate

      @impl true
      def domain, do: unquote(opts[:domain] || :general)

      @impl true
      def severity, do: unquote(opts[:severity] || :blocking)

      def run(opts \\ []) do
        start = System.monotonic_time(:millisecond)

        :telemetry.execute(
          [:prismatic, :quality, :gate, :start],
          %{system_time: System.system_time()},
          %{gate: name(), domain: domain()}
        )

        result = evaluate(opts)
        duration = System.monotonic_time(:millisecond) - start

        case result do
          {:ok, gate_result} ->
            enriched = %{gate_result | duration_ms: duration}

            :telemetry.execute(
              [:prismatic, :quality, :gate, :stop],
              %{duration: duration, status: gate_result.status},
              %{gate: name(), domain: domain(), result: enriched}
            )

            {:ok, enriched}

          {:error, _reason} = error ->
            :telemetry.execute(
              [:prismatic, :quality, :gate, :exception],
              %{duration: duration},
              %{gate: name(), domain: domain()}
            )

            error
        end
      end

      defoverridable domain: 0, severity: 0
    end
  end
end
```

### Concrete Gate Implementation: Zero Warnings

```elixir
defmodule Prismatic.Quality.Gates.ZeroWarnings do
  @moduledoc """
  Quality gate that enforces zero compilation warnings.
  This gate is BLOCKING: any compilation warning prevents
  the code from advancing in the pipeline.
  """

  use Prismatic.Quality.Gate, domain: :compilation, severity: :blocking

  @impl Prismatic.Quality.Gate
  def name, do: :zero_warnings

  @impl Prismatic.Quality.Gate
  def evaluate(opts) do
    apps = Keyword.get(opts, :apps, :all)

    case compile_and_capture(apps) do
      {output, 0} ->
        warnings = extract_warnings(output)

        if Enum.empty?(warnings) do
          {:ok, %{
            gate: :zero_warnings,
            domain: :compilation,
            status: :pass,
            violations: [],
            evidence: %{
              output_lines: String.split(output, "\n") |> length(),
              compilation_time_ms: extract_compile_time(output)
            },
            duration_ms: 0,
            suggestions: []
          }}
        else
          {:ok, %{
            gate: :zero_warnings,
            domain: :compilation,
            status: :fail,
            violations: Enum.map(warnings, &warning_to_violation/1),
            evidence: %{warning_count: length(warnings)},
            duration_ms: 0,
            suggestions: [
              "Run `mix compile --warnings-as-errors` to see all warnings",
              "Fix each warning individually -- they often indicate real bugs"
            ]
          }}
        end

      {output, _exit_code} ->
        {:ok, %{
          gate: :zero_warnings,
          domain: :compilation,
          status: :fail,
          violations: [%{
            file: "mix.exs",
            line: nil,
            message: "Compilation failed: #{String.slice(output, 0..200)}",
            severity: :critical,
            rule: :compilation_failure
          }],
          evidence: %{compilation_failed: true},
          duration_ms: 0,
          suggestions: ["Fix compilation errors before addressing warnings"]
        }}
    end
  end

  defp compile_and_capture(apps) do
    args = ["compile", "--warnings-as-errors", "--force"]

    args =
      case apps do
        :all -> args
        app when is_atom(app) -> args ++ ["--app", Atom.to_string(app)]
        _ -> args
      end

    System.cmd("mix", args, stderr_to_stdout: true)
  end

  defp extract_warnings(output) do
    output
    |> String.split("\n")
    |> Enum.filter(&String.contains?(&1, "warning:"))
  end

  defp warning_to_violation(warning_line) do
    %{
      file: extract_file(warning_line),
      line: extract_line(warning_line),
      message: warning_line,
      severity: :high,
      rule: :compilation_warning
    }
  end

  defp extract_file(line) do
    case Regex.run(~r/^([^:]+):/, line) do
      [_, file] -> file
      _ -> "unknown"
    end
  end

  defp extract_line(line) do
    case Regex.run(~r/:(\d+)/, line) do
      [_, num] -> String.to_integer(num)
      _ -> nil
    end
  end

  defp extract_compile_time(output) do
    case Regex.run(~r/Compiled .+ in (\d+(?:\.\d+)?)s/, output) do
      [_, seconds] -> round(String.to_float(seconds) * 1000)
      _ -> 0
    end
  end
end
```

### Gate Pipeline Orchestrator

```elixir
defmodule Prismatic.Quality.GatePipeline do
  @moduledoc """
  Orchestrates the execution of all quality gates in the
  correct order. Gates within the same phase run in parallel
  for performance. The pipeline short-circuits on blocking
  gate failure.
  """

  @phases [
    phase_1: [
      Prismatic.Quality.Gates.ZeroWarnings,
      Prismatic.Quality.Gates.CredoStrict
    ],
    phase_2: [
      Prismatic.Quality.Gates.DialyzerClean,
      Prismatic.Quality.Gates.ForbiddenPatterns
    ],
    phase_3: [
      Prismatic.Quality.Gates.TestSuite,
      Prismatic.Quality.Gates.CodeCoverage
    ],
    phase_4: [
      Prismatic.Quality.Gates.TypespecCoverage,
      Prismatic.Quality.Gates.QualityFloor
    ]
  ]

  @spec run_all(keyword()) :: {:ok, [map()]} | {:error, atom(), [map()]}
  def run_all(opts \\ []) do
    Enum.reduce_while(@phases, {:ok, []}, fn {phase_name, gates}, {:ok, results} ->
      phase_results = run_phase(gates, opts)

      blocking_failures =
        phase_results
        |> Enum.filter(fn
          {:ok, %{status: :fail}} -> true
          _ -> false
        end)
        |> Enum.filter(fn {:ok, result} ->
          gate_module = find_gate_module(result.gate, gates)
          gate_module.severity() == :blocking
        end)

      if Enum.empty?(blocking_failures) do
        new_results = results ++ Enum.map(phase_results, fn {:ok, r} -> r end)
        {:cont, {:ok, new_results}}
      else
        {:halt, {:error, phase_name, Enum.map(blocking_failures, fn {:ok, r} -> r end)}}
      end
    end)
  end

  defp run_phase(gates, opts) do
    gates
    |> Task.async_stream(fn gate -> gate.run(opts) end, timeout: 120_000)
    |> Enum.map(fn {:ok, result} -> result end)
  end

  defp find_gate_module(gate_name, gates) do
    Enum.find(gates, fn g -> g.name() == gate_name end)
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements quality gates through a comprehensive, multi-layered enforcement system that covers every stage of the software delivery lifecycle.

### 13 Quality Domains

The platform enforces quality gates across 13 distinct domains, each representing an independent quality dimension:

1. **Dialyzer** -- Type consistency through success typing analysis
2. **Credo** -- Code style, complexity, and consistency
3. **Compilation** -- Zero warnings under `--warnings-as-errors`
4. **DateTime Precision** -- Correct timezone and precision handling
5. **Guard Functions** -- Proper use of guard-safe expressions
6. **@impl Coverage** -- All callback implementations annotated
7. **Memory Safety** -- No unbounded data accumulation patterns
8. **Performance** -- No known performance anti-patterns
9. **Regression Prevention** -- No reintroduction of previously fixed bugs
10. **Timing Patterns** -- Correct use of timeouts and intervals
11. **TODO Management** -- No untracked TODO/FIXME comments
12. **Typespec Coverage** -- All public functions have @spec annotations
13. **Unsafe Map Access** -- No `map.key` syntax (use `Map.get/2` or pattern matching)

All 13 domains currently show 0 violations, achieving the PERFECT quality score of 100/100.

### 11-Phase Pre-Commit Pipeline

The pre-commit hook executes quality gates in 11 sequential phases, with each phase building on the results of previous phases:

Phase 1: Compilation check (--warnings-as-errors)
Phase 2: Credo strict analysis
Phase 3: Dialyzer type checking
Phase 4: Test execution
Phase 5: Coverage verification
Phase 6: Forbidden pattern detection
Phase 7: Typespec coverage check
Phase 8: Template validation (promo site)
Phase 9: Quality floor guardian check
Phase 10: Design consistency validation
Phase 11: Final quality gate aggregation

### Mix Task Interface

```bash
# Run all quality gates
mix quality.gates

# Run specific domain
mix quality.gates --domain dialyzer

# Machine-readable output for CI
mix quality.gates --format json

# Quick check (compilation + credo only)
mix quality.gates.check --fast
```

## Comparison with Alternative Approaches

| Feature | Prismatic Quality Gates | GitHub Actions Checks | SonarQube Quality Gates | Jenkins Quality Gates |
|---|---|---|---|---|
| **Enforcement point** | Pre-commit + CI + Deploy | CI only | CI/CD (webhook) | CI/CD (pipeline) |
| **Local enforcement** | Yes (Git hooks) | No | No | No |
| **Bypass resistance** | Structural (--no-verify forbidden) | Configuration | Configuration | Configuration |
| **Domain count** | 13 independent domains | Per-workflow | Configurable profiles | Per-pipeline |
| **Telemetry integration** | Native (OTP telemetry) | External (APIs) | Internal metrics | Plugin-based |
| **Feedback latency** | Seconds (local) | Minutes (CI) | Minutes (CI) | Minutes (CI) |
| **Evidence chain** | Complete provenance | Artifact-based | Dashboard-based | Log-based |

The primary advantage of the Prismatic approach is local enforcement through pre-commit hooks. Problems are caught in seconds on the developer's machine, not minutes later in a CI pipeline. This dramatically reduces the feedback loop and prevents quality problems from ever reaching the shared repository.

## Best Practices

**1. Make gates blocking, not advisory.** A quality gate that reports but does not block is a quality dashboard, not a gate. The defining characteristic of a gate is enforcement authority. If a gate can be ignored, it provides information but not quality assurance.

**2. Provide actionable failure messages.** When a gate fails, the developer needs to know exactly what failed, where in the code the problem is, and how to fix it. A gate that says "quality check failed" is worse than useless because it creates frustration without guidance. Include file paths, line numbers, and fix suggestions in every violation.

**3. Order gates by feedback speed.** Fast gates (compilation, linting) should run before slow gates (tests, Dialyzer). This provides immediate feedback for simple problems without waiting for expensive checks. The Prismatic pipeline implements this through its phased execution model.

**4. Run independent gates in parallel.** Gates that do not depend on each other should run concurrently. The Prismatic pipeline runs gates within each phase in parallel using `Task.async_stream/3`, reducing total pipeline time without sacrificing correctness.

**5. Track gate results over time.** Individual gate results are useful for immediate feedback, but gate trends over time reveal deeper quality dynamics. A gate that frequently fails suggests a systemic problem that requires architectural attention, not just a quick fix.

**6. Never add exceptions to gates.** Every exception weakens the gate. If a gate is too strict, adjust the gate's criteria globally rather than adding per-file or per-module exceptions. Exceptions accumulate and eventually render the gate meaningless.

## Common Pitfalls

**Gate fatigue.** When gates fail too often on problems that developers consider unimportant, developers develop workarounds (suppression comments, configuration overrides) that undermine the gate's effectiveness. The solution is to ensure gates enforce genuinely important quality criteria and that the criteria are understood and accepted by the team.

**Gate creep.** Adding too many gates too quickly overwhelms developers with feedback and slows development velocity. Gates should be introduced incrementally, starting with the most impactful checks (compilation, critical tests) and adding more over time as the team builds quality discipline.

**False security from green gates.** Passing all gates does not mean the code is correct -- it means the code meets the defined quality criteria. If the criteria are incomplete (no integration tests, no security checks, no performance tests), the gates provide false security. Regular review and expansion of gate criteria is essential.

**Inconsistent local and CI environments.** If gates pass locally but fail in CI (or vice versa), developers lose trust in the gate system. Environment consistency is a prerequisite for reliable gate enforcement. Docker and Nix help ensure reproducible gate execution across environments.

**Slow gates blocking flow.** A Dialyzer run that takes 10 minutes on every commit is a productivity disaster. Slow gates should use incremental analysis, caching, and parallelization to minimize their impact on developer workflow. The Prismatic platform uses PLT caching and incremental compilation to keep gate execution times manageable.

## Use Cases

### Feature Branch Protection

Quality gates on feature branches ensure that every branch meets quality standards before merge. This prevents the common pattern where "we'll fix it later" quality debt accumulates on feature branches and then floods the main branch during merge.

### Automated Code Review Triage

Quality gates can serve as the first pass of code review. If a PR fails quality gates, it is not ready for human review. This reduces reviewer burden by ensuring that the code meets baseline quality standards before a human needs to look at it.

### Deployment Confidence

Deployment gates that run after staging deployment but before production deployment provide the final quality verification. These gates can include integration tests, performance benchmarks, and health checks that are only meaningful in a deployed environment.

### Compliance Evidence Collection

Quality gates produce structured evidence that can be collected and presented for compliance audits. Each gate run creates a timestamped record of what was checked, what the result was, and what evidence supports the result. This satisfies audit requirements in regulated industries.

### New Developer Onboarding

Quality gates serve as automated mentors for new team members. When a new developer's code fails a gate, the failure message teaches them about the team's quality standards. This is more effective than documentation because it is contextual and immediate.

## Related Concepts

Quality gates connect to the broader quality and CI/CD infrastructure in the Prismatic Platform:

- [Quality Gates](/glossary/quality-gates/) -- The collective system of all quality gates operating together
- [Quality DNA](/glossary/quality-dna/) -- The persistence system that maintains quality state across sessions
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- The autonomous monitor that triggers gates on quality degradation
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- The Git mechanism that enforces quality gates at commit time
- [Continuous Integration](/glossary/continuous-integration/) -- The pipeline infrastructure that runs quality gates on shared code
- [Static Analysis](/glossary/static-analysis/) -- The analysis technique that powers several quality gates
- [Dialyzer](/glossary/dialyzer/) -- The type analysis tool that implements the Dialyzer quality gate
- [Credo](/glossary/credo/) -- The linting tool that implements the Credo quality gate
- [Code Coverage](/glossary/code-coverage/) -- The metric that the coverage quality gate enforces
- [Clean Run](/glossary/clean-run/) -- The zero-warning state that the compilation gate enforces

## See Also

- [Quality and Transparency](/glossary/quality-and-transparency/) -- The principle that gate results must be visible and auditable
- [Quality Evidence Truth](/glossary/quality-evidence-truth/) -- The epistemic framework that treats gate results as evidence
- [Quality Measurement System](/glossary/quality-measurement-system/) -- The infrastructure for quantifying gate results
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- The specific policy enforced by the compilation gate
- [Regression Testing](/glossary/regression-testing/) -- The testing approach that prevents reintroduction of fixed bugs

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)
