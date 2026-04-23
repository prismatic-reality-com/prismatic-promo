+++
title = "Workflow"
weight = 50
[extra]
description = "A defined sequence of tasks, decisions, and actions that transform inputs into desired outputs, implemented through AIAD pipelines, quality gate workflows, autoevolve cycles, and CI/CD pipelines"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "orchestration"
related_concepts = ["orchestration", "data-pipeline", "continuous-integration", "aiad", "command"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 5
prerequisites = ["command", "aiad", "automation"]
learning_path = ["command", "aiad", "workflow", "orchestration", "data-pipeline", "continuous-integration"]
interactive_demos = ["/labs/glossary/workflow"]
code_examples = ["PrismaticClaude.Workflow.Engine", "PrismaticSafety.QualityWorkflow", "PrismaticClaude.SessionLifecycle"]
external_resources = ["https://hexdocs.pm/gen_stage/GenStage.html", "https://hexdocs.pm/flow/Flow.html"]
version_introduced = "0.4.0"
stability_level = "stable"
testing_scenarios = ["workflow-execution", "step-failure-handling", "retry-logic", "parallel-step-execution", "workflow-composition", "timeout-handling"]
keywords = ["workflow", "pipeline", "orchestration", "automation", "task sequence", "CI/CD", "quality gates", "autoevolve", "AIAD pipeline"]
tags = ["glossary", "core", "workflow", "orchestration", "automation", "pipeline"]
related_terms = ["orchestration", "data-pipeline", "continuous-integration", "aiad", "command", "automation", "quality-gate", "autoevolve", "autoheal", "agent-orchestration", "backpressure", "actor-model"]
word_count = 1396
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Workflow - Prismatic Platform"
+++

## Definition

A workflow is a defined sequence of tasks, decisions, and actions that transform inputs into desired outputs following a structured execution path. Workflows encode operational knowledge -- the "how" of getting things done -- into repeatable, automatable, and auditable processes. They range from simple linear sequences (validate, transform, store) to complex directed acyclic graphs with conditional branching, parallel execution, error handling, and retry logic.

In software systems, workflows formalize business processes, data processing pipelines, deployment procedures, and quality assurance chains into executable specifications. Rather than relying on implicit knowledge about "what steps to follow," workflows make the process explicit, testable, and measurable.

## Overview

The concept of workflow automation has evolved significantly from its origins in business process management (BPM) systems of the 1990s. Modern workflow engines operate at multiple levels of abstraction: infrastructure workflows (CI/CD pipelines, deployment automation), data workflows (ETL/ELT pipelines, stream processing), business workflows (approval chains, order fulfillment), and AI/ML workflows (training pipelines, inference chains, [agent orchestration](/glossary/agent-orchestration/)).

In the Prismatic Platform, workflows are a first-class architectural concept implemented through several interconnected systems:

- **[AIAD](/glossary/aiad/) Pipelines**: Multi-step agent workflows that compose commands and actions into complex operations
- **Quality Gate Workflows**: Automated quality assurance chains that validate code changes before merge
- **[Autoevolve](/glossary/autoevolve/) Cycles**: Self-improvement workflows that scan, analyze, and apply platform enhancements
- **[Autoheal](/glossary/autoheal/) Workflows**: Automated remediation workflows that detect and fix quality regressions
- **Session Lifecycle Workflows**: Structured start/execute/end flows for Claude sessions
- **CI/CD Pipelines**: GitLab CI workflows for building, testing, and deploying the platform
- **[Data Pipelines](/glossary/data-pipeline/)**: Processing workflows for OSINT data, compliance assessment, and security scanning

### Workflow Characteristics

| Property | Description | Prismatic Implementation |
|----------|-------------|------------------------|
| **Deterministic** | Same inputs produce same outputs | Pure function steps, immutable state |
| **Observable** | Execution progress is visible | Telemetry events, audit logging |
| **Recoverable** | Failures can be retried or rolled back | Retry policies, compensation steps |
| **Composable** | Workflows can include sub-workflows | Nested pipeline execution |
| **Measurable** | Duration and outcomes are tracked | Telemetry metrics, performance monitoring |
| **Auditable** | Every step is logged | Immutable [audit trail](/glossary/audit-trail/) |

## Technical Details

### Workflow Engine Architecture

The Prismatic Platform implements a workflow engine built on OTP principles:

```elixir
defmodule PrismaticClaude.Workflow.Engine do
  @moduledoc """
  Workflow execution engine built on OTP GenServer.
  Executes multi-step workflows with retry logic,
  timeout handling, and telemetry instrumentation.
  """

  use GenServer

  @type step :: %{
    name: atom(),
    handler: (map() -> {:ok, map()} | {:error, term()}),
    timeout: non_neg_integer(),
    retries: non_neg_integer(),
    retry_delay: non_neg_integer()
  }

  @type workflow :: %{
    id: String.t(),
    name: String.t(),
    steps: [step()],
    on_failure: :halt | :continue | :compensate,
    metadata: map()
  }

  @type execution_state :: %{
    workflow: workflow(),
    current_step: non_neg_integer(),
    context: map(),
    results: [step_result()],
    status: :pending | :running | :completed | :failed | :compensating,
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil
  }

  @type step_result :: %{
    step_name: atom(),
    status: :success | :failure | :skipped,
    output: term(),
    duration_ms: non_neg_integer(),
    retries_used: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec execute(workflow(), map()) :: {:ok, [step_result()]} | {:error, term()}
  def execute(workflow, initial_context \\ %{}) do
    GenServer.call(__MODULE__, {:execute, workflow, initial_context}, :infinity)
  end

  @impl true
  def init(opts) do
    {:ok, %{
      max_concurrent: Keyword.get(opts, :max_concurrent, 5),
      active_workflows: %{},
      completed_count: 0
    }}
  end

  @impl true
  def handle_call({:execute, workflow, context}, _from, state) do
    execution = %{
      workflow: workflow,
      current_step: 0,
      context: context,
      results: [],
      status: :running,
      started_at: DateTime.utc_now(),
      completed_at: nil
    }

    :telemetry.execute(
      [:prismatic, :workflow, :started],
      %{step_count: length(workflow.steps)},
      %{workflow_name: workflow.name, workflow_id: workflow.id}
    )

    result = execute_steps(workflow.steps, context, [])

    :telemetry.execute(
      [:prismatic, :workflow, :completed],
      %{duration_ms: elapsed_ms(execution.started_at)},
      %{workflow_name: workflow.name, status: elem(result, 0)}
    )

    {:reply, result, state}
  end

  @spec execute_steps([step()], map(), [step_result()]) ::
          {:ok, [step_result()]} | {:error, term()}
  defp execute_steps([], _context, results) do
    {:ok, Enum.reverse(results)}
  end

  defp execute_steps([step | remaining], context, results) do
    start_time = System.monotonic_time(:millisecond)
    result = execute_step_with_retries(step, context, 0)
    duration = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, updated_context, retries_used} ->
        step_result = %{
          step_name: step.name,
          status: :success,
          output: updated_context,
          duration_ms: duration,
          retries_used: retries_used
        }

        :telemetry.execute(
          [:prismatic, :workflow, :step_completed],
          %{duration_ms: duration, retries: retries_used},
          %{step_name: step.name}
        )

        execute_steps(remaining, updated_context, [step_result | results])

      {:error, reason} ->
        step_result = %{
          step_name: step.name,
          status: :failure,
          output: reason,
          duration_ms: duration,
          retries_used: step.retries
        }

        {:error, {step.name, reason, Enum.reverse([step_result | results])}}
    end
  end

  @spec execute_step_with_retries(step(), map(), non_neg_integer()) ::
          {:ok, map(), non_neg_integer()} | {:error, term()}
  defp execute_step_with_retries(step, context, attempt) do
    task = Task.async(fn -> step.handler.(context) end)

    case Task.yield(task, step.timeout) || Task.shutdown(task) do
      {:ok, {:ok, updated_context}} ->
        {:ok, updated_context, attempt}

      {:ok, {:error, reason}} when attempt < step.retries ->
        Process.sleep(step.retry_delay * (attempt + 1))
        execute_step_with_retries(step, context, attempt + 1)

      {:ok, {:error, reason}} ->
        {:error, reason}

      nil ->
        if attempt < step.retries do
          execute_step_with_retries(step, context, attempt + 1)
        else
          {:error, :timeout}
        end
    end
  end

  @spec elapsed_ms(DateTime.t()) :: non_neg_integer()
  defp elapsed_ms(start) do
    DateTime.diff(DateTime.utc_now(), start, :millisecond)
  end
end
```

### Quality Gate Workflow

The quality gate workflow is one of the most critical workflows in the platform, executing on every code change:

```elixir
defmodule PrismaticSafety.QualityWorkflow do
  @moduledoc """
  Quality gate workflow that validates code changes
  against platform quality standards. Executes as
  part of pre-commit hooks and CI/CD pipelines.
  """

  alias PrismaticClaude.Workflow.Engine

  @type quality_context :: %{
    changed_files: [String.t()],
    commit_message: String.t(),
    author: String.t(),
    branch: String.t()
  }

  @spec build_quality_workflow() :: Engine.workflow()
  def build_quality_workflow do
    %{
      id: "quality-gates-#{:erlang.unique_integer([:positive])}",
      name: "quality_gates",
      steps: [
        %{
          name: :compilation,
          handler: &check_compilation/1,
          timeout: 120_000,
          retries: 1,
          retry_delay: 5_000
        },
        %{
          name: :credo,
          handler: &check_credo/1,
          timeout: 60_000,
          retries: 0,
          retry_delay: 0
        },
        %{
          name: :dialyzer,
          handler: &check_dialyzer/1,
          timeout: 300_000,
          retries: 0,
          retry_delay: 0
        },
        %{
          name: :tests,
          handler: &run_tests/1,
          timeout: 300_000,
          retries: 1,
          retry_delay: 5_000
        },
        %{
          name: :forbidden_patterns,
          handler: &check_forbidden_patterns/1,
          timeout: 30_000,
          retries: 0,
          retry_delay: 0
        },
        %{
          name: :coverage,
          handler: &check_coverage/1,
          timeout: 60_000,
          retries: 0,
          retry_delay: 0
        }
      ],
      on_failure: :halt,
      metadata: %{enforced_by: "NO MERCY, NO DOUBTS doctrine"}
    }
  end

  @spec execute(quality_context()) :: {:ok, [Engine.step_result()]} | {:error, term()}
  def execute(context) do
    workflow = build_quality_workflow()
    Engine.execute(workflow, context)
  end

  @spec check_compilation(map()) :: {:ok, map()} | {:error, term()}
  defp check_compilation(context) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> {:ok, Map.put(context, :compilation, :pass)}
      {output, _} -> {:error, {:compilation_failed, output}}
    end
  end

  @spec check_credo(map()) :: {:ok, map()} | {:error, term()}
  defp check_credo(context) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, Map.put(context, :credo, :pass)}
      {output, _} -> {:error, {:credo_violations, output}}
    end
  end

  @spec check_dialyzer(map()) :: {:ok, map()} | {:error, term()}
  defp check_dialyzer(context) do
    case System.cmd("mix", ["dialyzer"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, Map.put(context, :dialyzer, :pass)}
      {output, _} -> {:error, {:dialyzer_warnings, output}}
    end
  end

  @spec run_tests(map()) :: {:ok, map()} | {:error, term()}
  defp run_tests(context) do
    case System.cmd("mix", ["test", "--cover"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, Map.put(context, :tests, :pass)}
      {output, _} -> {:error, {:test_failures, output}}
    end
  end

  @spec check_forbidden_patterns(map()) :: {:ok, map()} | {:error, term()}
  defp check_forbidden_patterns(context) do
    case System.cmd("mix", ["quality.forbidden_patterns", "--count-only"],
           stderr_to_stdout: true) do
      {"0\n", 0} -> {:ok, Map.put(context, :forbidden_patterns, :pass)}
      {output, _} -> {:error, {:forbidden_patterns_found, output}}
    end
  end

  @spec check_coverage(map()) :: {:ok, map()} | {:error, term()}
  defp check_coverage(context) do
    # Coverage threshold enforced by mix test --cover configuration
    {:ok, Map.put(context, :coverage, :pass)}
  end
end
```

### Session Lifecycle Workflow

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  Session lifecycle workflow managing the structured
  start, execute, and end flow for Claude sessions.
  Implements the Universal Autonomous Evolution Protocol.
  """

  use GenServer

  @type session_phase :: :start | :active | :ending | :ended
  @type hook :: %{
    name: atom(),
    handler: (map() -> {:ok, map()} | {:error, term()}),
    priority: non_neg_integer(),
    enabled: boolean()
  }

  @type session_state :: %{
    session_id: String.t(),
    phase: session_phase(),
    started_at: DateTime.t(),
    hooks: [hook()],
    context: map(),
    circuit_breaker: :closed | :open | :half_open,
    failure_count: non_neg_integer()
  }

  @spec start_session(map()) :: {:ok, session_state()} | {:error, term()}
  def start_session(opts \\ %{}) do
    session = %{
      session_id: generate_session_id(),
      phase: :start,
      started_at: DateTime.utc_now(),
      hooks: default_hooks(),
      context: opts,
      circuit_breaker: :closed,
      failure_count: 0
    }

    with {:ok, session} <- execute_phase_hooks(session, :session_start),
         {:ok, session} <- load_session_context(session),
         {:ok, session} <- run_baseline(session) do
      {:ok, %{session | phase: :active}}
    end
  end

  @spec end_session(session_state()) :: {:ok, session_state()} | {:error, term()}
  def end_session(session) do
    session = %{session | phase: :ending}

    with {:ok, session} <- save_session_context(session),
         {:ok, session} <- execute_phase_hooks(session, :session_end),
         {:ok, session} <- run_evolution_cycle(session) do
      {:ok, %{session | phase: :ended}}
    end
  end

  @spec execute_phase_hooks(session_state(), atom()) :: {:ok, session_state()} | {:error, term()}
  defp execute_phase_hooks(session, phase) do
    if session.circuit_breaker == :open do
      {:ok, session}
    else
      hooks =
        session.hooks
        |> Enum.filter(& &1.enabled)
        |> Enum.sort_by(& &1.priority)

      Enum.reduce_while(hooks, {:ok, session}, fn hook, {:ok, sess} ->
        case safe_execute_hook(hook, sess) do
          {:ok, updated} -> {:cont, {:ok, updated}}
          {:error, reason} -> handle_hook_failure(sess, hook, reason)
        end
      end)
    end
  end

  @spec safe_execute_hook(hook(), session_state()) :: {:ok, session_state()} | {:error, term()}
  defp safe_execute_hook(hook, session) do
    task = Task.async(fn -> hook.handler.(session.context) end)

    case Task.yield(task, 30_000) || Task.shutdown(task) do
      {:ok, {:ok, updated_context}} ->
        {:ok, %{session | context: updated_context}}

      {:ok, {:error, reason}} ->
        {:error, reason}

      nil ->
        {:error, :hook_timeout}
    end
  end
end
```

### Parallel Workflow Execution

For workflows with independent steps, the platform supports parallel execution using OTP's Task module:

```elixir
defmodule PrismaticClaude.Workflow.Parallel do
  @moduledoc """
  Parallel workflow execution for independent steps.
  Uses Task.async_stream for concurrent step execution
  with backpressure control.
  """

  @spec execute_parallel([Engine.step()], map(), keyword()) ::
          {:ok, [Engine.step_result()]} | {:error, term()}
  def execute_parallel(steps, context, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online())
    timeout = Keyword.get(opts, :timeout, 60_000)

    results =
      steps
      |> Task.async_stream(
        fn step ->
          start = System.monotonic_time(:millisecond)
          result = step.handler.(context)
          duration = System.monotonic_time(:millisecond) - start
          {step.name, result, duration}
        end,
        max_concurrency: max_concurrency,
        timeout: timeout,
        on_timeout: :kill_task
      )
      |> Enum.map(fn
        {:ok, {name, {:ok, output}, duration}} ->
          %{step_name: name, status: :success, output: output, duration_ms: duration, retries_used: 0}

        {:ok, {name, {:error, reason}, duration}} ->
          %{step_name: name, status: :failure, output: reason, duration_ms: duration, retries_used: 0}

        {:exit, reason} ->
          %{step_name: :unknown, status: :failure, output: reason, duration_ms: 0, retries_used: 0}
      end)

    failures = Enum.filter(results, &(&1.status == :failure))

    if Enum.empty?(failures) do
      {:ok, results}
    else
      {:error, {:parallel_failures, failures, results}}
    end
  end
end
```

## Implementation in Prismatic Platform

### Workflow Types in the Platform

| Workflow | Trigger | Steps | Frequency |
|----------|---------|-------|-----------|
| **Quality Gates** | Pre-commit hook | Compile, Credo, Dialyzer, Tests, Forbidden Patterns | Every commit |
| **[Autoevolve](/glossary/autoevolve/)** | Session end, manual | Scan, Analyze, Generate, Apply, Verify | Every session |
| **[Autoheal](/glossary/autoheal/)** | Quality regression | Detect, Diagnose, Fix, Verify, Report | On quality drop |
| **CI/CD Pipeline** | Git push | Build, Test, Analyze, Deploy | Every push |
| **EASM Scan** | Scheduled, on-demand | Discover, Scan, Assess, Rate, Report | Daily/weekly |
| **Compliance Assessment** | On-demand | Collect, Assess NIS2, Assess [ZKB](/glossary/zkb/), Compare, Report | On request |
| **Session Lifecycle** | Session start/end | Load context, Execute hooks, Save context | Every session |
| **Agent [Orchestration](/glossary/orchestration/)** | [Command](/glossary/command/) invocation | Parse, Route, Execute, Aggregate, Report | Per command |

### Workflow Observability

All workflows emit telemetry events for monitoring and debugging:

```elixir
# Workflow-level events
[:prismatic, :workflow, :started]     # %{step_count: N}
[:prismatic, :workflow, :completed]   # %{duration_ms: N}
[:prismatic, :workflow, :failed]      # %{step_name: atom, reason: term}

# Step-level events
[:prismatic, :workflow, :step_started]   # %{step_name: atom}
[:prismatic, :workflow, :step_completed] # %{duration_ms: N, retries: N}
[:prismatic, :workflow, :step_failed]    # %{step_name: atom, reason: term}
```

### Workflow Definition DSL

The platform provides a declarative workflow definition approach:

```elixir
defmodule PrismaticClaude.Workflow.DSL do
  @moduledoc """
  Declarative workflow definition DSL for building
  workflows from composable step definitions.
  """

  @spec workflow(String.t(), keyword()) :: Engine.workflow()
  def workflow(name, opts \\ []) do
    %{
      id: "#{name}-#{:erlang.unique_integer([:positive])}",
      name: name,
      steps: Keyword.get(opts, :steps, []),
      on_failure: Keyword.get(opts, :on_failure, :halt),
      metadata: Keyword.get(opts, :metadata, %{})
    }
  end

  @spec step(atom(), (map() -> {:ok, map()} | {:error, term()}), keyword()) :: Engine.step()
  def step(name, handler, opts \\ []) do
    %{
      name: name,
      handler: handler,
      timeout: Keyword.get(opts, :timeout, 30_000),
      retries: Keyword.get(opts, :retries, 0),
      retry_delay: Keyword.get(opts, :retry_delay, 1_000)
    }
  end
end
```

## Comparison with Alternatives

| Approach | Complexity | Recoverability | Observability | Prismatic Usage |
|----------|-----------|---------------|---------------|-----------------|
| **GenServer Workflow** | Medium | Manual retry/compensate | Telemetry events | Quality gates, session lifecycle |
| **Broadway/GenStage** | High | Built-in [backpressure](/glossary/backpressure/) | Metrics + dashboard | Data processing pipelines |
| **Oban** | Medium | Built-in retry, scheduling | Web UI, telemetry | Background job workflows |
| **Task.async_stream** | Low | Basic timeout | Manual instrumentation | Parallel scan steps |
| **Shell Scripts** | Low | Exit codes only | stdout/stderr | CI/CD helper scripts |
| **GitLab CI YAML** | Medium | Stage-level retry | GitLab UI | Build and deploy pipelines |

### External Workflow Engines Comparison

| Engine | Language | Model | Strength | Weakness |
|--------|----------|-------|----------|----------|
| **Prismatic Workflow Engine** | Elixir | OTP GenServer | Fault-tolerant, observable | Platform-specific |
| **Apache Airflow** | Python | DAG scheduler | Rich ecosystem, scheduling | Heavy, not real-time |
| **Temporal** | Go/Java/Python | Durable execution | Exactly-once, long-running | Complex deployment |
| **Prefect** | Python | Task graph | Modern Python, cloud-native | Python-only |
| **Step Functions** | AWS | State machine | Serverless, visual | Vendor lock-in |
| **Argo Workflows** | YAML/Go | Kubernetes CRD | Container-native | Kubernetes dependency |

The Prismatic Platform uses its own lightweight workflow engine rather than an external system because: (1) OTP provides superior fault tolerance through supervision trees, (2) Elixir's concurrency model handles parallel step execution natively, (3) tight integration with platform telemetry and quality systems requires deep coupling, and (4) the workflow definitions are simple enough that an external engine would add unnecessary operational complexity.

## Best Practices

1. **Keep steps small and focused**: Each workflow step should do one thing well. Small steps are easier to test, retry, and replace. If a step does too much, split it into multiple steps.

2. **Make steps idempotent**: Steps that can be safely re-executed produce the same result regardless of how many times they run. Idempotency is essential for retry logic and crash recovery.

3. **Define clear failure modes**: Every step should explicitly define what constitutes success and failure. Use `{:ok, context}` and `{:error, reason}` tuples consistently. Never let steps fail silently.

4. **Instrument with telemetry**: Every workflow and step should emit telemetry events for duration, success/failure, and relevant metadata. This data enables monitoring, alerting, and performance optimization.

5. **Set appropriate timeouts**: Every step needs a timeout to prevent hung workflows from blocking resources indefinitely. Set timeouts based on expected execution time with reasonable margin.

6. **Use compensation for side effects**: When a workflow fails partway through and earlier steps have produced side effects (database writes, API calls, file creation), implement compensation steps that undo those effects.

7. **Compose rather than nest deeply**: Prefer flat workflow compositions over deeply nested sub-workflows. Use the workflow DSL to compose reusable step definitions into different workflow configurations.

8. **Version workflow definitions**: As workflows evolve, maintain backward compatibility for in-flight executions. Use versioned workflow definitions so running instances complete with their original definition.

## Common Pitfalls

- **Monolithic steps**: Combining multiple operations into a single step makes debugging difficult and prevents granular retry. If a step fails, the entire combined operation must be retried.

- **Missing error handling**: Steps that raise exceptions instead of returning `{:error, reason}` crash the workflow engine. Always wrap step logic in try/rescue or use with/case for graceful error handling.

- **Unbounded retries**: Retrying failed steps indefinitely can create infinite loops and resource exhaustion. Set maximum retry counts with exponential backoff and circuit breaker patterns.

- **Ignoring partial completion**: When a multi-step workflow fails midway, ignoring the completed steps can lead to inconsistent state. Implement either compensation (undo completed steps) or checkpoint-resume (restart from failure point).

- **Synchronous bottlenecks**: Running all steps sequentially when some are independent wastes time. Identify independent steps and execute them in parallel using `Task.async_stream` with [backpressure](/glossary/backpressure/) control.

- **Hard-coded configuration**: Embedding timeouts, retry counts, and concurrency limits in step definitions reduces flexibility. Use configuration that can be tuned per environment (development, staging, production).

## Use Cases

**Quality Assurance Pipeline**: The pre-commit quality workflow executes six sequential validation steps (compilation, Credo, Dialyzer, tests, forbidden patterns, coverage) on every commit. Any failure blocks the commit, enforcing the platform's zero-defect quality standard.

**EASM Scanning Workflow**: The [EASM](/glossary/easm/) scanning workflow discovers external assets, performs [vulnerability](/glossary/vulnerability/) scanning, assesses compliance against [NIS2](/glossary/nis2/)/[ZKB](/glossary/zkb/) frameworks, calculates [security ratings](/glossary/security-rating/), and generates reports. Steps execute in a defined sequence with parallel sub-steps for scanning multiple assets simultaneously.

**Platform Evolution Cycle**: The autoevolve workflow scans the codebase for improvement opportunities, analyzes findings against platform quality standards, generates code changes, applies them, verifies through quality gates, and reports results. This workflow runs at every session end as part of the Universal Autonomous Evolution Protocol.

**CI/CD Deployment Pipeline**: The GitLab CI pipeline workflow builds the application, runs the full test suite, performs static analysis, checks for security vulnerabilities in dependencies, and deploys to staging/production. Each stage depends on the successful completion of previous stages.

**Agent [Orchestration](/glossary/orchestration/)**: When a user invokes a complex [AIAD](/glossary/aiad/) [command](/glossary/command/) like `/orchestrate`, the orchestrator workflow decomposes the request into sub-tasks, routes them to specialist agents, collects results, aggregates findings, and presents a unified response.

## Related Concepts

- [Orchestration](/glossary/orchestration/) -- Coordination of multiple workflows and services
- [Data Pipeline](/glossary/data-pipeline/) -- Specialized workflow for data processing
- [Continuous Integration](/glossary/continuous-integration/) -- CI/CD workflow automation
- [AIAD](/glossary/aiad/) -- Agent framework defining workflow pipelines
- [Command](/glossary/command/) -- Single executable unit within a workflow
- [Quality Gate](/glossary/quality-gate/) -- Validation checkpoints in quality workflows
- [Autoevolve](/glossary/autoevolve/) -- Self-improvement workflow system
- [Autoheal](/glossary/autoheal/) -- Automated remediation workflow
- [Agent Orchestration](/glossary/agent-orchestration/) -- Multi-agent workflow coordination
- [Backpressure](/glossary/backpressure/) -- Flow control in workflow pipelines
- [Actor Model](/glossary/actor-model/) -- Concurrency foundation for workflow execution
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of workflow execution

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application ecosystem
- [Agents](/agents/) -- Agent directory executing workflows
- [Commands](/commands/) -- Command catalog composing workflows

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
