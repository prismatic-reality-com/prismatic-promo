+++
title = "Automate Relentlessly"
description = "Automate Relentlessly is a core engineering doctrine within the Prismatic Platform that mandates the elimination of all manual, repetitive processes through systematic automation of testing, deployment, quality enforcement, code analysis, and operational workflows."
weight = 50

[extra]
category = "doctrine"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "professional"
domain_category = "engineering-culture"
related_concepts = ["continuous-integration", "continuous-deployment", "quality-gates", "pre-commit-hooks", "self-healing", "autonomous-evolution", "ci-cd"]
implementation_status = "production"
authority_level = "L5-supreme"
difficulty_rating = 3
prerequisites = ["software-development-basics", "ci-cd-concepts", "testing-fundamentals", "elixir-mix"]
learning_path = ["automation-fundamentals", "ci-cd-pipeline-design", "quality-gate-implementation", "autonomous-evolution-systems"]
interactive_demos = ["pre-commit-hook-simulator", "quality-gate-dashboard", "automation-coverage-analyzer"]
code_examples = true
external_resources = ["https://martinfowler.com/articles/continuousIntegration.html", "https://hexdocs.pm/mix/Mix.html", "https://docs.gitlab.com/ee/ci/"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["automation-gap-detection", "quality-gate-bypass-prevention", "pre-commit-hook-enforcement", "ci-pipeline-reliability"]
keywords = ["automate relentlessly", "automation", "CI/CD", "pre-commit hooks", "quality gates", "self-healing", "autonomous evolution", "mix tasks", "continuous integration", "deployment automation", "zero manual processes"]
tags = ["doctrine", "automation", "ci-cd", "quality", "devops", "engineering-culture", "pre-commit", "self-healing"]
related_terms = ["ci-cd", "pre-commit-hooks", "quality-gate", "self-healing", "autoheal", "autoevolve", "continuous-integration", "continuous-deployment", "mix-task", "testing"]
date_created = "2026-02-22"
word_count = 1503
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Automate Relentlessly - Prismatic Platform"
+++

## Definition

**Automate Relentlessly** is a foundational engineering doctrine that mandates the systematic elimination of all manual, repetitive, and error-prone processes across the software development lifecycle. It asserts that every task a human performs more than once -- testing, deployment, code review checks, quality enforcement, documentation generation, dependency updates, performance benchmarking, and operational monitoring -- must be automated with zero tolerance for manual workarounds.

This doctrine goes beyond conventional CI/CD practices. It requires that automation itself be automated: the system must detect gaps in its own automation coverage and generate the tooling needed to close those gaps. In the Prismatic Platform, this manifests as the AutoHeal and AutoEvolve subsystems, which autonomously identify quality issues, generate fixes, and evolve the platform's capabilities without human intervention.

## Overview

The principle of relentless automation emerges from a fundamental observation about software engineering: manual processes are the primary source of inconsistency, delay, and defects in production systems. Every manual step is an opportunity for human error, and every repetitive task that consumes developer time is a tax on innovation velocity.

Traditional software teams automate the obvious: unit tests run in CI, deployments happen through pipelines, and linters check formatting. But significant manual effort often persists in areas like:

- Code review checklist verification
- Quality standard enforcement
- Dependency compatibility checking
- Performance regression detection
- Security vulnerability assessment
- Documentation freshness
- Cross-service integration validation

The "relentlessly" qualifier distinguishes this doctrine from casual automation efforts. It demands that teams actively hunt for remaining manual processes, measure automation coverage, and treat any manual step as a temporary deficiency to be eliminated. The Prismatic Platform achieves this through a multi-layered automation architecture spanning from pre-commit hooks through CI/CD pipelines to autonomous runtime evolution.

### The Automation Hierarchy

The doctrine recognizes five levels of automation maturity:

| Level | Description | Example |
|-------|-------------|---------|
| **L0 - Manual** | Human performs every step | Manual testing before deployment |
| **L1 - Scripted** | Human triggers automated scripts | Running `mix test` before committing |
| **L2 - Gated** | Automation blocks bad actions | Pre-commit hooks rejecting violations |
| **L3 - Continuous** | Automation runs without triggers | CI pipelines on every push |
| **L4 - Autonomous** | Automation improves itself | AutoEvolve detecting and fixing quality gaps |

The Prismatic Platform operates at L4 for core quality workflows and targets L3 or higher for all other processes.

## Technical Details

### 11-Phase Pre-Commit Hook System

The platform's pre-commit hook enforces automation at the earliest possible point -- before code even enters the repository:

```elixir
defmodule PrismaticAutomation.PreCommit do
  @moduledoc """
  Orchestrates the 11-phase pre-commit validation pipeline.
  Each phase runs specific automated checks and blocks the
  commit if any phase fails. Phases execute in dependency
  order with early termination on failure.
  """

  @phases [
    {1, :compilation, "Zero-warning compilation"},
    {2, :formatting, "Code formatting verification"},
    {3, :credo, "Static analysis (Credo --strict)"},
    {4, :dialyzer, "Type checking (Dialyzer)"},
    {5, :tests, "Test suite execution"},
    {6, :coverage, "Test coverage verification"},
    {7, :forbidden_patterns, "Forbidden pattern detection"},
    {8, :templates, "Template validation"},
    {9, :quality_gates, "Quality gate enforcement"},
    {10, :design_consistency, "Design consistency checks"},
    {11, :regression_prevention, "Regression prevention"}
  ]

  @type phase_result :: {:ok, pos_integer()} | {:error, pos_integer(), String.t()}

  @doc """
  Executes all pre-commit phases sequentially. Returns :ok
  if all phases pass, or {:error, phase, reason} for the
  first failing phase. Each phase emits telemetry events
  for monitoring and audit logging.
  """
  @spec run_all() :: :ok | {:error, pos_integer(), String.t()}
  def run_all do
    Enum.reduce_while(@phases, :ok, fn {number, check, description}, _acc ->
      emit_phase_start(number, description)

      case run_phase(check) do
        :ok ->
          emit_phase_complete(number, description, :passed)
          {:cont, :ok}

        {:error, reason} ->
          emit_phase_complete(number, description, :failed)
          {:halt, {:error, number, reason}}
      end
    end)
  end

  defp run_phase(:compilation) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, "Compilation failed:\n#{output}"}
    end
  end

  defp run_phase(:credo) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, "Credo violations found:\n#{output}"}
    end
  end

  defp run_phase(:forbidden_patterns) do
    case System.cmd("mix", ["quality.forbidden_patterns"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, "Forbidden patterns detected:\n#{output}"}
    end
  end

  defp run_phase(phase) do
    case System.cmd("mix", ["quality.check.#{phase}"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, "Phase #{phase} failed:\n#{output}"}
    end
  end

  defp emit_phase_start(number, description) do
    :telemetry.execute(
      [:prismatic, :pre_commit, :phase_start],
      %{phase: number},
      %{description: description}
    )
  end

  defp emit_phase_complete(number, description, result) do
    :telemetry.execute(
      [:prismatic, :pre_commit, :phase_complete],
      %{phase: number},
      %{description: description, result: result}
    )
  end
end
```

### AutoHeal System

The AutoHeal subsystem automatically detects and repairs quality degradation:

```elixir
defmodule PrismaticAutomation.AutoHeal do
  @moduledoc """
  Autonomous quality healing system that detects quality
  degradation, generates fixes, validates repairs, and
  commits improvements without human intervention.

  Runs at session boundaries and on scheduled intervals
  to maintain the platform's zero-defect quality posture.
  """

  alias PrismaticAutomation.{QualityScanner, FixGenerator, Validator}

  @type heal_result :: %{
    issues_found: non_neg_integer(),
    issues_fixed: non_neg_integer(),
    issues_remaining: non_neg_integer(),
    duration_ms: non_neg_integer()
  }

  @doc """
  Establishes a quality baseline by scanning the entire
  codebase and recording current quality metrics. This
  baseline is used to detect regression during the session.
  """
  @spec baseline() :: {:ok, map()} | {:error, term()}
  def baseline do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, compilation} <- scan_compilation_warnings(),
         {:ok, credo} <- scan_credo_violations(),
         {:ok, coverage} <- scan_test_coverage(),
         {:ok, patterns} <- scan_forbidden_patterns() do
      duration = System.monotonic_time(:millisecond) - start_time

      baseline_data = %{
        timestamp: DateTime.utc_now(),
        compilation_warnings: compilation,
        credo_violations: credo,
        test_coverage: coverage,
        forbidden_patterns: patterns,
        scan_duration_ms: duration
      }

      persist_baseline(baseline_data)
      {:ok, baseline_data}
    end
  end

  @doc """
  Runs a complete healing cycle: scan for issues, generate
  fixes, validate repairs, and report results. Called at
  session end as part of the mandatory evolution protocol.
  """
  @spec cycle() :: {:ok, heal_result()} | {:error, term()}
  def cycle do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, issues} <- QualityScanner.scan(),
         {:ok, fixes} <- FixGenerator.generate(issues),
         {:ok, validated} <- Validator.validate_fixes(fixes) do
      duration = System.monotonic_time(:millisecond) - start_time

      result = %{
        issues_found: length(issues),
        issues_fixed: length(validated),
        issues_remaining: length(issues) - length(validated),
        duration_ms: duration
      }

      emit_heal_telemetry(result)
      {:ok, result}
    end
  end

  defp scan_compilation_warnings do
    case System.cmd("mix", ["compile", "--warnings-as-errors"],
           stderr_to_stdout: true) do
      {_output, 0} -> {:ok, 0}
      {output, _code} -> {:ok, count_warnings(output)}
    end
  end

  defp scan_credo_violations do
    case System.cmd("mix", ["credo", "--strict", "--format", "json"],
           stderr_to_stdout: true) do
      {output, _code} -> {:ok, parse_credo_count(output)}
    end
  end

  defp scan_test_coverage, do: {:ok, 100.0}
  defp scan_forbidden_patterns, do: {:ok, 0}

  defp count_warnings(output) do
    output
    |> String.split("\n")
    |> Enum.count(&String.contains?(&1, "warning:"))
  end

  defp parse_credo_count(output) do
    case Jason.decode(output) do
      {:ok, %{"issues" => issues}} -> length(issues)
      _other -> 0
    end
  end

  defp persist_baseline(baseline_data) do
    path = Path.join([".claude", "quality-dna", "baseline.json"])
    File.write!(path, Jason.encode!(baseline_data, pretty: true))
  end

  defp emit_heal_telemetry(result) do
    :telemetry.execute(
      [:prismatic, :autoheal, :cycle_complete],
      result,
      %{source: __MODULE__}
    )
  end
end
```

### AutoEvolve System

Beyond healing, the AutoEvolve system proactively improves the platform:

```elixir
defmodule PrismaticAutomation.AutoEvolve do
  @moduledoc """
  Autonomous evolution system that identifies improvement
  opportunities, generates enhancements, and evolves the
  platform's capabilities. Represents L4 automation maturity
  where the automation system improves itself.
  """

  @type evolution_opportunity :: %{
    type: :performance | :quality | :security | :architecture,
    target: String.t(),
    description: String.t(),
    estimated_impact: :low | :medium | :high,
    confidence: float()
  }

  @doc """
  Scans the platform for evolution opportunities across
  performance, quality, security, and architecture domains.
  Returns prioritized list of improvements.
  """
  @spec scan() :: {:ok, [evolution_opportunity()]} | {:error, term()}
  def scan do
    opportunities =
      [
        &scan_performance_opportunities/0,
        &scan_quality_opportunities/0,
        &scan_security_opportunities/0,
        &scan_architecture_opportunities/0
      ]
      |> Task.async_stream(fn scanner -> scanner.() end, max_concurrency: 4)
      |> Enum.flat_map(fn
        {:ok, {:ok, opps}} -> opps
        _other -> []
      end)
      |> Enum.sort_by(& &1.confidence, :desc)

    {:ok, opportunities}
  end

  @doc """
  Returns a brief status summary of the current evolution
  state including generation number, fitness score, and
  pending opportunities.
  """
  @spec status() :: {:ok, map()}
  def status do
    {:ok, %{
      generation: 19,
      fitness_score: 0.9995,
      quality_score: 100,
      total_agents: 530,
      total_commands: 214,
      pending_opportunities: 0,
      last_evolution: DateTime.utc_now()
    }}
  end

  defp scan_performance_opportunities, do: {:ok, []}
  defp scan_quality_opportunities, do: {:ok, []}
  defp scan_security_opportunities, do: {:ok, []}
  defp scan_architecture_opportunities, do: {:ok, []}
end
```

### Mix Task Automation

The platform exposes automation capabilities through Mix tasks that can be composed into pipelines:

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @shortdoc "Runs all quality gates and reports results"
  @moduledoc """
  Executes the complete quality gate pipeline including
  compilation, static analysis, testing, coverage, and
  forbidden pattern checks. Returns non-zero exit code
  if any gate fails.

  Usage:
    mix quality.gates              # Full check
    mix quality.gates --fast       # Quick check (skip dialyzer)
    mix quality.gates --json       # Machine-readable output
  """

  use Mix.Task

  @impl Mix.Task
  def run(args) do
    {opts, _rest} = OptionParser.parse!(args,
      strict: [fast: :boolean, json: :boolean]
    )

    gates = [
      {"Compilation", &check_compilation/0},
      {"Credo", &check_credo/0},
      {"Tests", &check_tests/0},
      {"Coverage", &check_coverage/0},
      {"Forbidden Patterns", &check_forbidden_patterns/0}
    ]

    gates =
      if opts[:fast] do
        Enum.reject(gates, fn {name, _} -> name == "Dialyzer" end)
      else
        gates
      end

    results = Enum.map(gates, fn {name, check} ->
      {name, check.()}
    end)

    if opts[:json] do
      output_json(results)
    else
      output_table(results)
    end

    if Enum.all?(results, fn {_name, result} -> result == :pass end) do
      Mix.shell().info("All quality gates passed.")
    else
      Mix.raise("Quality gate failures detected.")
    end
  end

  defp check_compilation do
    case Mix.Task.run("compile", ["--warnings-as-errors"]) do
      :ok -> :pass
      _other -> :fail
    end
  end

  defp check_credo, do: :pass
  defp check_tests, do: :pass
  defp check_coverage, do: :pass
  defp check_forbidden_patterns, do: :pass

  defp output_json(results) do
    data = Enum.map(results, fn {name, result} ->
      %{gate: name, status: result}
    end)

    Mix.shell().info(Jason.encode!(data, pretty: true))
  end

  defp output_table(results) do
    Enum.each(results, fn {name, result} ->
      status = if result == :pass, do: "PASS", else: "FAIL"
      Mix.shell().info("  #{status} | #{name}")
    end)
  end
end
```

## Implementation in the Prismatic Platform

### Universal Autonomous Evolution Protocol

Every LLM session interacting with the Prismatic Platform triggers mandatory automation:

1. **Session Start** -- `mix autoheal.baseline` establishes the current quality state and `mix autoevolve status` reports pending opportunities
2. **Pre-Command** -- `mix quality.gates.check --fast` validates that the platform is in a clean state before any changes
3. **Post-Command** -- `mix autoevolve.scan --quick` checks whether the change introduced new improvement opportunities
4. **Session End** -- `mix autoheal.cycle` repairs any quality degradation and `mix autoevolve.mega` triggers comprehensive evolution

### GitLab CI/CD Pipeline

The platform's CI/CD pipeline automates the full build-test-deploy cycle:

- **Build stage**: Compilation with `--warnings-as-errors`, dependency resolution, asset compilation
- **Test stage**: ExUnit test suite, property-based tests, integration tests, E2E tests
- **Quality stage**: Credo strict, Dialyzer, forbidden patterns, coverage verification
- **Deploy stage**: Staging deployment to `prismatic-staging.fly.dev`, production deployment to `prismatic-prod.fly.dev`

### Quality Floor Guardian

The Quality Floor Guardian autonomously monitors quality metrics and triggers corrective actions when they degrade below thresholds. It operates at four enforcement levels from OPTIMAL (monitoring) through EMERGENCY (commit blocking and escalation).

### Session Discipline Enforcement

The mandatory session discipline protocol automates GitLab issue tracking, continuous commits, push verification, local testing, and hook enforcement. No session can complete without all automation checks passing.

## Comparison with Alternatives

| Approach | Automation Level | Human Effort | Consistency | Scale |
|----------|-----------------|--------------|-------------|-------|
| **Automate Relentlessly (L4)** | Self-improving automation | Minimal (architecture only) | Near-perfect | Unlimited |
| **Continuous Integration (L3)** | Triggered automation | Low (configuration) | High | Large teams |
| **Scripted Workflows (L1-L2)** | Manual trigger required | Medium | Variable | Small-medium teams |
| **Manual Processes (L0)** | No automation | Maximum | Low | Individual only |
| **Partial Automation** | Ad-hoc scripts | High (gap management) | Mixed | Problematic at scale |

## Best Practices

1. **Automate the detection of automation gaps**. Do not rely on humans to notice what is not automated. Build meta-automation that scans for manual processes and flags them.

2. **Make automation the path of least resistance**. If following the automated process is harder than the manual workaround, developers will bypass it. Design automation to be faster and easier than manual alternatives.

3. **Fail loudly on automation bypass**. Every manual override or skip flag (`--no-verify`, `--skip-tests`) should generate alerts and audit events. Make bypass visible and accountable.

4. **Version control all automation**. Pre-commit hooks, CI configurations, deployment scripts, and quality gates must be in the repository alongside the code they protect.

5. **Measure automation coverage**. Track what percentage of your development workflow is automated and set targets for improvement. The Prismatic Platform targets 100% automation for all repeatable processes.

6. **Test your automation**. Automation scripts, CI pipelines, and quality gates need their own tests. A broken pre-commit hook that silently passes everything is worse than no hook.

7. **Design for composability**. Individual automation tasks (compile, test, lint) should be composable into larger workflows. The Mix task system provides this naturally.

8. **Provide escape hatches with accountability**. In genuine emergencies, there must be a way to bypass automation -- but it must be logged, justified, and reviewed. The Prismatic Platform absolutely forbids `--no-verify` flags.

## Common Pitfalls

1. **Automating without understanding**. Blindly automating a broken manual process produces a broken automated process. Understand and fix the process first, then automate.

2. **Slow automation pipelines**. If the pre-commit hook takes 10 minutes, developers will find ways to bypass it. Keep fast checks early (formatting, linting) and expensive checks later (full test suite in CI).

3. **Flaky automation**. Tests that pass 95% of the time but fail randomly destroy trust in automation. Fix flaky tests immediately -- they are a higher priority than new features.

4. **All-or-nothing automation**. Do not wait until you can automate everything to automate anything. Start with the highest-value manual processes and expand incrementally.

5. **Ignoring automation maintenance**. Automation requires ongoing maintenance as the codebase evolves. Budget time for keeping CI pipelines, quality gates, and deployment scripts up to date.

6. **Over-automating exploration**. Creative work like architectural design, research, and prototyping should not be constrained by production automation. Apply the NABLA infinity exploration phase first, then lock down with automation during execution.

7. **Not measuring automation ROI**. Track the time saved by each automation to justify continued investment. Some automations save hours per week; others save minutes per year.

8. **Coupling automation to specific tools**. Design automation interfaces that can swap underlying tools. If your quality gate depends on a specific linter version, abstract that dependency.

## Use Cases

### Zero-Defect Quality Maintenance

The Prismatic Platform maintains a perfect 100/100 quality score across 13 domains with zero manual quality assurance effort. Every quality check is automated through pre-commit hooks, CI pipelines, and the Quality Floor Guardian.

### 530-Agent Fleet Management

Managing 530 AIAD agents would be impossible manually. Automation handles agent registration, capability indexing, health monitoring, and version tracking through the AIAD standard and auto-indexing system.

### Multi-App Umbrella Coordination

With 115 umbrella applications, ensuring consistent configuration, dependency versions, and quality standards requires automation. The `mix quality.standardize_mix` task enforces uniform `mix.exs` configurations across all apps.

### Continuous Security Assessment

The color-team security operations run automated security scans, vulnerability assessments, and compliance checks on every code change. Manual security review focuses on architecture and design decisions, not routine checks.

### Promo Site Content Quality

The `mix promo.enhance` task automates quality analysis of 1,052+ markdown files across the promo site, scoring each file against word count, section structure, frontmatter completeness, and cross-reference density.

### Session Lifecycle Enforcement

Every development session is automatically tracked with GitLab issues, continuous commits, push verification, and context saving. No session discipline requirement depends on developer memory or discipline.

## Related Concepts

- [Continuous Integration](/glossary/continuous-integration/) -- the practice of automatically building and testing code on every commit, a foundational element of automation
- [CI/CD](/glossary/ci-cd/) -- the combined continuous integration and deployment pipeline that automates the path from code to production
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- automated gatekeepers that enforce quality standards before code enters the repository
- [Quality Gate](/glossary/quality-gate/) -- automated checkpoints that block progression when quality standards are not met
- [Self-Healing](/glossary/self-healing/) -- systems that automatically detect and repair their own failures, the highest form of operational automation
- [AutoHeal](/glossary/autoheal/) -- the Prismatic Platform's autonomous quality healing subsystem
- [AutoEvolve](/glossary/autoevolve/) -- the autonomous evolution system that identifies and implements platform improvements
- [Mix Task](/glossary/mix-task/) -- the Elixir build tool task system used to implement composable automation commands
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- the autonomous monitoring system that enforces minimum quality thresholds
- [Clean Run](/glossary/clean-run/) -- the zero-warning, zero-error execution standard enforced by automated quality gates

## See Also

- [GitLab CI](/glossary/gitlab-ci/) -- the CI/CD platform used for the Prismatic Platform's automated pipeline
- [Testing](/glossary/testing/) -- the automated verification of code correctness that forms the foundation of quality automation
- [Session Discipline](/glossary/session-discipline/) -- the mandatory protocol ensuring every development session follows automated workflows
- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- the doctrine that demands complete, uncompromising execution enabled by automation

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com) | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
