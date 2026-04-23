+++
title = "SEADF: Self-Evolving Autonomous Development Framework"
date = 2026-03-19
description = "The SEADF framework for autonomous platform development: five-phase cycle (discover, plan, execute, validate, integrate), guardrails, and human review thresholds."

[extra]
author = "Tomas Korcak (korczis)"
category = "evolution"
tags = ["seadf", "autonomous", "development", "evolution", "ai-assisted"]
reading_time = "9 min"
keywords = ["seadf framework", "autonomous development", "self-evolving", "ai development loop", "guardrails"]
image = "/images/blog/seadf-autonomous-development.png"
word_count = 1100
date_created = "2026-03-19"
date_modified = "2026-03-19"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "SEADF: Self-Evolving Autonomous Development Framework - Prismatic Platform"
+++

The Self-Evolving Autonomous Development Framework (SEADF) is a structured approach to AI-assisted platform development. It defines a five-phase cycle where AI agents discover improvement opportunities, plan changes, execute implementations, validate results, and integrate approved changes. The key innovation is the guardrail system that determines when human review is required versus when changes can proceed autonomously.

## The Five-Phase Cycle

SEADF operates as a continuous loop. Each phase has defined inputs, outputs, and quality gates:

| Phase | Input | Output | Gate |
|-------|-------|--------|------|
| Discover | Platform metrics, code analysis | Improvement opportunities | Priority threshold |
| Plan | Opportunity spec | Implementation plan | Complexity limit |
| Execute | Plan + codebase | Code changes + tests | Compilation pass |
| Validate | Changes + test results | Quality assessment | Doctrine compliance |
| Integrate | Validated changes | Merged code | Human review threshold |

## Phase 1: Discovery

The discovery phase scans the platform for improvement opportunities using static analysis, telemetry data, and doctrine compliance reports:

```elixir
defmodule PrismaticSeadf.Phases.Discover do
  @moduledoc """
  SEADF Discovery Phase.

  Scans the platform for improvement opportunities by analyzing
  code quality metrics, telemetry data, doctrine compliance gaps,
  and dependency health. Produces prioritized opportunity specs.
  """

  alias PrismaticQuality.Doctrines
  alias PrismaticTelemetry.Metrics

  @type opportunity :: %{
    id: String.t(),
    type: :quality | :performance | :security | :feature,
    priority: float(),
    description: String.t(),
    affected_modules: [module()],
    estimated_effort: :trivial | :small | :medium | :large,
    doctrine_pillar: atom() | nil
  }

  @spec discover() :: [opportunity()]
  def discover do
    [
      discover_doctrine_gaps(),
      discover_performance_issues(),
      discover_security_gaps(),
      discover_test_coverage_gaps()
    ]
    |> List.flatten()
    |> Enum.sort_by(& &1.priority, :desc)
    |> Enum.take(20)
  end

  defp discover_doctrine_gaps do
    results = Doctrines.validate_all()

    for {pillar, %{status: :fail, violations: violations}} <- results,
        violation <- violations do
      %{
        id: "doctrine-#{pillar}-#{hash(violation)}",
        type: :quality,
        priority: pillar_priority(pillar),
        description: "#{pillar} violation: #{violation.message}",
        affected_modules: [violation.module],
        estimated_effort: violation_effort(violation),
        doctrine_pillar: pillar
      }
    end
  end

  defp discover_performance_issues do
    slow_endpoints = Metrics.endpoints_above_threshold(250)

    Enum.map(slow_endpoints, fn endpoint ->
      %{
        id: "perf-#{hash(endpoint.path)}",
        type: :performance,
        priority: endpoint.avg_ms / 1000.0,
        description: "Slow endpoint: #{endpoint.path} (#{endpoint.avg_ms}ms avg)",
        affected_modules: [endpoint.controller],
        estimated_effort: :medium,
        doctrine_pillar: :PERF
      }
    end)
  end

  defp pillar_priority(:ZERO), do: 0.95
  defp pillar_priority(:SEAL), do: 0.9
  defp pillar_priority(:PERF), do: 0.8
  defp pillar_priority(:TACH), do: 0.7
  defp pillar_priority(_), do: 0.5

  defp hash(term), do: :erlang.phash2(term) |> Integer.to_string(16)
end
```

## Phase 2: Planning

The planning phase takes an opportunity spec and generates an implementation plan. Plans are constrained by complexity limits to keep individual changes reviewable:

```elixir
defmodule PrismaticSeadf.Phases.Plan do
  @moduledoc """
  SEADF Planning Phase.

  Generates implementation plans from opportunity specs.
  Plans are decomposed into steps of 5 minutes or less
  per M5M doctrine. Complex opportunities are split
  into multiple sequential plans.
  """

  @type plan :: %{
    id: String.t(),
    opportunity_id: String.t(),
    steps: [step()],
    estimated_duration: non_neg_integer(),
    complexity: :trivial | :simple | :moderate | :complex,
    requires_human_review: boolean(),
    affected_files: [String.t()]
  }

  @type step :: %{
    order: non_neg_integer(),
    action: :modify | :create | :delete | :test,
    target: String.t(),
    description: String.t(),
    estimated_minutes: non_neg_integer()
  }

  @max_autonomous_complexity :moderate
  @max_step_minutes 5

  @spec plan(Discover.opportunity()) :: {:ok, plan()} | {:error, term()}
  def plan(opportunity) do
    steps = generate_steps(opportunity)
    complexity = assess_complexity(steps)

    plan = %{
      id: "plan-#{generate_id()}",
      opportunity_id: opportunity.id,
      steps: steps,
      estimated_duration: Enum.sum(Enum.map(steps, & &1.estimated_minutes)),
      complexity: complexity,
      requires_human_review: complexity_exceeds_threshold?(complexity),
      affected_files: extract_affected_files(steps)
    }

    if valid_plan?(plan) do
      {:ok, plan}
    else
      {:error, :plan_exceeds_limits}
    end
  end

  defp assess_complexity(steps) do
    file_count = steps |> Enum.map(& &1.target) |> Enum.uniq() |> length()
    total_minutes = Enum.sum(Enum.map(steps, & &1.estimated_minutes))

    cond do
      file_count <= 1 and total_minutes <= 5 -> :trivial
      file_count <= 3 and total_minutes <= 15 -> :simple
      file_count <= 8 and total_minutes <= 30 -> :moderate
      true -> :complex
    end
  end

  defp complexity_exceeds_threshold?(complexity) do
    complexity_rank(complexity) > complexity_rank(@max_autonomous_complexity)
  end

  defp complexity_rank(:trivial), do: 0
  defp complexity_rank(:simple), do: 1
  defp complexity_rank(:moderate), do: 2
  defp complexity_rank(:complex), do: 3

  defp generate_id, do: Base.encode16(:crypto.strong_rand_bytes(4), case: :lower)
end
```

## Phase 3: Execution

The execution phase applies the plan's steps to the codebase. Each step is executed atomically with rollback capability:

```elixir
defmodule PrismaticSeadf.Phases.Execute do
  @moduledoc """
  SEADF Execution Phase.

  Applies plan steps to the codebase. Each step is executed
  atomically: if a step fails, all previous steps for this
  plan are rolled back. Tracks execution timing for M5M
  compliance monitoring.
  """

  require Logger

  @spec execute(Plan.plan()) :: {:ok, map()} | {:error, term()}
  def execute(plan) do
    Logger.info("SEADF executing plan #{plan.id} (#{length(plan.steps)} steps)")

    result =
      Enum.reduce_while(plan.steps, {:ok, []}, fn step, {:ok, completed} ->
        start_time = System.monotonic_time(:millisecond)

        case execute_step(step) do
          {:ok, result} ->
            duration = System.monotonic_time(:millisecond) - start_time
            Logger.info("Step #{step.order} completed in #{duration}ms")
            {:cont, {:ok, [{step, result, duration} | completed]}}

          {:error, reason} ->
            Logger.warning("Step #{step.order} failed: #{inspect(reason)}, rolling back")
            rollback(completed)
            {:halt, {:error, {step.order, reason}}}
        end
      end)

    case result do
      {:ok, completed} ->
        {:ok, %{
          plan_id: plan.id,
          steps_completed: length(completed),
          total_duration_ms: completed |> Enum.map(&elem(&1, 2)) |> Enum.sum(),
          changes: Enum.map(completed, fn {step, result, _} -> {step.target, result} end)
        }}

      {:error, _} = error ->
        error
    end
  end

  defp execute_step(%{action: :modify, target: path, description: desc}) do
    Logger.debug("Modifying #{path}: #{desc}")
    # Apply the planned modification
    apply_modification(path, desc)
  end

  defp execute_step(%{action: :test, target: path}) do
    Logger.debug("Running tests for #{path}")
    run_tests(path)
  end

  defp rollback(completed_steps) do
    for {step, _result, _duration} <- completed_steps do
      Logger.info("Rolling back step #{step.order}: #{step.target}")
      revert_step(step)
    end
  end
end
```

## Phase 4: Validation

The validation phase runs the full quality gate suite against the changes:

```elixir
defmodule PrismaticSeadf.Phases.Validate do
  @moduledoc """
  SEADF Validation Phase.

  Validates executed changes against platform quality gates,
  doctrine compliance, test suite, and performance benchmarks.
  Produces a validation report with pass/fail status.
  """

  @type validation_result :: %{
    status: :pass | :fail,
    compilation: :ok | {:error, [String.t()]},
    tests: %{passed: integer(), failed: integer(), skipped: integer()},
    doctrine: %{passed: [atom()], failed: [atom()]},
    format: :ok | :needs_formatting
  }

  @spec validate(map()) :: {:ok, validation_result()} | {:error, term()}
  def validate(execution_result) do
    checks = [
      {:compilation, &check_compilation/0},
      {:format, &check_format/0},
      {:tests, &check_tests/1},
      {:doctrine, &check_doctrines/0}
    ]

    results =
      Enum.into(checks, %{}, fn
        {name, fun} when is_function(fun, 0) -> {name, fun.()}
        {name, fun} when is_function(fun, 1) -> {name, fun.(execution_result)}
      end)

    status =
      if results.compilation == :ok and
         results.tests.failed == 0 and
         results.doctrine.failed == [] do
        :pass
      else
        :fail
      end

    {:ok, Map.put(results, :status, status)}
  end

  defp check_compilation do
    case System.cmd("mix", ["compile", "--warnings-as-errors"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _} -> {:error, String.split(output, "\n", trim: true)}
    end
  end

  defp check_tests(execution_result) do
    affected = Enum.map(execution_result.changes, &elem(&1, 0))
    {output, code} = System.cmd("mix", ["test" | affected], stderr_to_stdout: true)

    parse_test_output(output, code)
  end
end
```

## Phase 5: Integration and Guardrails

The integration phase determines whether changes can be merged autonomously or require human review. The decision is based on complexity, risk, and the types of files affected:

| Criterion | Autonomous | Requires Review |
|-----------|-----------|-----------------|
| Complexity | Trivial, Simple | Moderate, Complex |
| Files changed | 1-3 files | 4+ files |
| Doctrine fixes | ZERO, PERF, DOCS | SEAL, architectural |
| Test changes | Adding tests only | Modifying existing tests |
| Schema changes | Never autonomous | Always review |
| Config changes | Never autonomous | Always review |

```elixir
defmodule PrismaticSeadf.Phases.Integrate do
  @moduledoc """
  SEADF Integration Phase with guardrails.

  Determines whether validated changes can be auto-merged
  or require human review. Applies conservative guardrails
  that err on the side of requiring review.
  """

  require Logger

  @always_review_patterns ~w(
    **/migrations/**
    **/config/**
    **/mix.exs
    **/router.ex
    **/*schema*.ex
  )

  @spec integrate(Plan.plan(), Validate.validation_result()) :: :auto_merged | :pending_review
  def integrate(plan, validation) do
    cond do
      validation.status != :pass ->
        Logger.warning("SEADF: Changes failed validation, not integrating")
        :rejected

      plan.requires_human_review ->
        create_review_request(plan)
        :pending_review

      touches_sensitive_files?(plan) ->
        create_review_request(plan)
        :pending_review

      true ->
        commit_changes(plan)
        Logger.info("SEADF: Auto-merged plan #{plan.id}")
        :auto_merged
    end
  end

  defp touches_sensitive_files?(plan) do
    Enum.any?(plan.affected_files, fn file ->
      Enum.any?(@always_review_patterns, &PathGlob.match?(&1, file))
    end)
  end

  defp create_review_request(plan) do
    # Create GitLab MR with SEADF label for human review
    Logger.info("SEADF: Created review request for plan #{plan.id}")
  end
end
```

SEADF provides a structured framework for AI-assisted development that respects the boundary between autonomous improvement and human oversight. The five-phase cycle ensures that every change is discovered through data, planned with constraints, executed atomically, validated thoroughly, and integrated with appropriate review. The guardrail system makes the autonomous boundary explicit and conservative, building trust through predictable behavior.
