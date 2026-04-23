+++
title = "workflow-orchestration-specialist"
weight = 418
[extra]
domain = "integration"
level = "L3"
description = "Complex workflow coordination across systems and services"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["workflow-orchestration-specialist", "Complex", "agents", "agent", "Prismatic Platform", "Workflow", "Maximum"]
tags = ["agents", "agent", "workflow-orchestration-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "workflow-orchestration-specialist - Prismatic Platform"
+++

## Overview

The Workflow Orchestration Specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's integration domain, responsible for coordinating complex multi-step workflows that span multiple systems, services, and agent domains. This agent designs, executes, and monitors workflows that require precise sequencing, conditional branching, error recovery, and distributed coordination across the platform's 90 [umbrella application](/glossary/umbrella-application/)s and 434 [AIAD](/glossary/aiad/) agents.

The Prismatic Platform's autonomous operations frequently require workflows that combine intelligence gathering, analysis, verification, and reporting steps across multiple subsystems. A due diligence investigation, for example, requires orchestrating OSINT collection agents, entity resolution services, graph analysis pipelines, risk scoring engines, and report generation systems in a precise sequence with error handling at each stage. The Workflow Orchestration Specialist provides the coordination layer that enables these complex multi-step operations to execute reliably and repeatably.

Built on [OTP](/glossary/otp/) supervision patterns and the [SEADF](/glossary/seadf/) framework, the agent implements workflow definitions as supervised process trees where each step is an isolated process that can fail and retry independently without affecting other workflow steps. All workflow execution complies with the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework for provenance tracking and the [NO MERCY](/glossary/no-mercy/) doctrine's zero-tolerance policy for incomplete workflow execution.

## Architecture

The Workflow Orchestration Specialist is built on a three-layer architecture that separates workflow definition, execution management, and monitoring into distinct [OTP](/glossary/otp/) process hierarchies.

```
WorkflowOrchestration.Supervisor
+-- WorkflowRegistry.Server        (workflow definition catalog)
+-- ExecutionEngine.DynamicSupervisor (workflow instance management)
|   +-- WorkflowInstance.Supervisor (per-instance process tree)
|       +-- Step.Worker             (individual step execution)
|       +-- Compensator.Worker      (rollback/compensation logic)
+-- Scheduler.Server                (cron-style workflow scheduling)
+-- MonitorDashboard.Server         (real-time execution monitoring)
+-- AuditLog.Writer                 (immutable execution audit trail)
```

The WorkflowRegistry maintains canonical workflow definitions: step sequences, dependency graphs, branching conditions, timeout configurations, and retry policies. Workflow definitions are versioned and immutable once published, ensuring that running workflow instances always use the definition they were started with.

The ExecutionEngine uses a [Dynamic Supervisor](/glossary/dynamic-supervisor/) to spawn workflow instances on demand. Each instance gets its own supervision subtree with individual step workers and compensator processes. Steps communicate through the instance supervisor, and the execution engine tracks the overall workflow state machine. The Scheduler handles time-based workflow triggering with cron-style expressions. The MonitorDashboard provides real-time visibility into all running workflow instances, their current step, and any errors or retries in progress.

## Core Capabilities

The Workflow Orchestration Specialist provides six primary capabilities that together enable reliable complex workflow execution.

**Declarative Workflow Definition** allows workflows to be specified as directed acyclic graphs of steps with dependency relationships, conditional branches, parallel execution groups, and timeout constraints. Workflow definitions are expressed in a declarative format that separates the "what" (step dependencies and conditions) from the "how" (step implementation). This separation enables workflow modifications without changing the underlying step implementations.

**Distributed Step Execution** runs each workflow step as an isolated [OTP](/glossary/otp/) process under the workflow instance's supervision tree. Steps can execute sequentially (dependency-ordered), in parallel (independent steps), or conditionally (branching based on previous step results). Each step has configurable retry policies with exponential backoff, maximum attempt limits, and timeout constraints.

**Saga-Pattern Compensation** implements the saga pattern for distributed transactions: when a workflow step fails after previous steps have made side effects, the orchestrator invokes compensation actions for all completed steps in reverse order. This ensures that failed workflows leave the system in a consistent state rather than in a partially completed state.

**Workflow Versioning and Migration** maintains versioned workflow definitions and handles running instances that were started with previous versions. When a workflow definition is updated, running instances continue with their original version, while new instances use the updated definition. Migration strategies handle cases where running instances need to adopt new definitions.

**Real-Time Monitoring and Alerting** provides comprehensive visibility into workflow execution: current step, elapsed time, retry counts, error logs, and estimated completion time. Alerts are generated for workflows that exceed expected duration, encounter repeated failures, or enter unexpected states.

**Cross-Domain Agent Coordination** orchestrates workflows that involve agents from multiple platform domains. The orchestrator understands agent capabilities, availability, and response time characteristics, and schedules workflow steps to optimize for throughput while respecting agent capacity constraints.

## Implementation

The core workflow execution engine is implemented as an [OTP](/glossary/otp/) [GenServer](/glossary/genserver/) that manages workflow instance lifecycle and step coordination.

```elixir
defmodule Prismatic.Agents.WorkflowOrchestration do
  @moduledoc """
  Workflow Orchestration Specialist - complex multi-step
  workflow coordination across systems and services.
  """

  use GenServer

  alias Prismatic.Agents.WorkflowOrchestration.{
    WorkflowRegistry,
    ExecutionEngine,
    StepRunner,
    Compensator
  }

  @type workflow_status :: :pending | :running | :completed | :failed | :compensating
  @type step_status :: :pending | :running | :completed | :failed | :retrying | :skipped

  @type workflow_instance :: %{
    id: String.t(),
    workflow_name: String.t(),
    version: String.t(),
    status: workflow_status(),
    steps: %{String.t() => step_state()},
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    context: map()
  }

  @type step_state :: %{
    name: String.t(),
    status: step_status(),
    attempts: non_neg_integer(),
    result: term(),
    started_at: DateTime.t() | nil,
    completed_at: DateTime.t() | nil
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    {:ok, %{
      instances: %{},
      config: Map.new(opts)
    }}
  end

  @spec execute_workflow(String.t(), map()) ::
    {:ok, workflow_instance()} | {:error, term()}
  def execute_workflow(workflow_name, params \\ %{}) do
    GenServer.call(__MODULE__, {:execute, workflow_name, params}, :timer.hours(1))
  end

  @spec workflow_status(String.t()) :: {:ok, workflow_instance()} | {:error, :not_found}
  def workflow_status(instance_id) do
    GenServer.call(__MODULE__, {:status, instance_id})
  end

  @impl true
  def handle_call({:execute, workflow_name, params}, _from, state) do
    with {:ok, definition} <- WorkflowRegistry.get(workflow_name),
         {:ok, instance} <- ExecutionEngine.create_instance(definition, params) do

      result = execute_steps(instance, definition)

      final_instance = case result do
        {:ok, completed} ->
          %{completed | status: :completed, completed_at: DateTime.utc_now()}

        {:error, failed_step, partial} ->
          compensated = Compensator.compensate(partial, definition)
          %{compensated | status: :failed, completed_at: DateTime.utc_now()}
      end

      :telemetry.execute(
        [:prismatic, :workflow, :execution_complete],
        %{
          status: status_to_int(final_instance.status),
          steps: map_size(final_instance.steps),
          duration_ms: DateTime.diff(
            final_instance.completed_at,
            final_instance.started_at,
            :millisecond
          )
        },
        %{workflow: workflow_name, instance_id: final_instance.id}
      )

      {:reply, {:ok, final_instance},
       put_in(state, [:instances, final_instance.id], final_instance)}
    end
  end

  @impl true
  def handle_call({:status, instance_id}, _from, state) do
    case Map.get(state.instances, instance_id) do
      nil -> {:reply, {:error, :not_found}, state}
      instance -> {:reply, {:ok, instance}, state}
    end
  end

  defp execute_steps(instance, definition) do
    definition.steps
    |> topological_sort()
    |> Enum.reduce_while({:ok, instance}, fn step, {:ok, acc} ->
      case StepRunner.execute(step, acc.context) do
        {:ok, result} ->
          updated = update_step_state(acc, step.name, :completed, result)
          {:cont, {:ok, updated}}

        {:error, reason} ->
          updated = update_step_state(acc, step.name, :failed, reason)
          {:halt, {:error, step.name, updated}}
      end
    end)
  end

  defp topological_sort(steps) do
    # Kahn's algorithm for dependency-based ordering
    steps
    |> Enum.sort_by(&length(&1.dependencies))
  end

  defp update_step_state(instance, step_name, status, result) do
    put_in(instance, [:steps, step_name], %{
      name: step_name,
      status: status,
      result: result,
      completed_at: DateTime.utc_now()
    })
  end

  defp status_to_int(:completed), do: 1
  defp status_to_int(:failed), do: -1
  defp status_to_int(_), do: 0
end
```

The `execute_workflow/2` function creates a workflow instance from a registered definition, executes steps in topological order (respecting dependencies), and handles failures through the saga compensation pattern. Each step execution is independently timed and logged through telemetry for monitoring purposes.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) Runtime | Bidirectional | Orchestrates agent tasks as workflow steps; receives agent completion events |
| [SEADF](/glossary/seadf/) Pipeline | Bidirectional | Provides workflow execution for evolution pipeline stages |
| [Quality Floor Guardian](/glossary/quality-floor-guardian/) | Outbound | Reports workflow execution metrics for platform quality scoring |
| [Prismatic Web](/glossary/prismatic-web/) | Outbound | Provides workflow status for LiveView monitoring dashboards |
| [ETS](/glossary/ets/) Instance Store | Internal | In-memory workflow instance state with sub-millisecond access |
| [PostgreSQL](/glossary/postgresql/) | Persistence | Durable workflow state for recovery after system restart |
| [Prismatic Telemetry](/glossary/telemetry/) | Outbound | Publishes step-level and workflow-level execution events |

## Operational Workflow

The agent operates through four modes: on-demand execution, scheduled execution, event-triggered execution, and continuous monitoring.

**On-Demand Execution** starts workflows immediately when invoked through the API or command interface. This is the primary mode for user-initiated operations such as due diligence investigations, security assessments, and report generation.

**Scheduled Execution** runs workflows on configurable schedules using cron-style expressions. This mode handles recurring operations such as nightly quality assessments, weekly security scans, and monthly compliance reports.

**Event-Triggered Execution** starts workflows in response to platform events: new data ingestion, alert conditions, or evolution pipeline triggers. The scheduler monitors event streams and starts configured workflows when matching events are detected.

**Continuous Monitoring** provides real-time visibility into all running workflow instances. The monitor dashboard tracks current step, elapsed time, retry counts, and error conditions. Alerts are generated for workflows that exceed expected duration or encounter repeated failures.

The execution lifecycle follows six phases: (1) workflow definition loading and validation, (2) instance creation with parameter binding, (3) step execution in dependency order, (4) result collection and state updates, (5) compensation on failure or completion reporting on success, and (6) audit log recording and telemetry publication.

## NABLA Compliance

The Workflow Orchestration Specialist operates under [NABLA Infinity](/glossary/nabla-infinity/) epistemic governance for workflow execution claims.

**Signal Plurality**: Workflow completion claims require both step-level confirmation (each step reports its own completion status) and workflow-level verification (the orchestrator independently verifies that all required steps completed successfully).

**Contradiction Preservation**: When step results contain contradictory information (one data source reports entity A as low-risk, another as high-risk), the workflow preserves both signals in its context rather than resolving the contradiction. Resolution is deferred to downstream consumers with appropriate expertise.

**Provenance Mandatory**: Every workflow execution carries complete provenance: workflow definition version, parameter values, step execution timestamps, step results, retry histories, and compensation actions. The audit log is immutable and fully traceable.

**Time Decay**: Workflow results include execution timestamps and are flagged when they become stale. Scheduled re-execution ensures that workflow outputs remain current with platform state.

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.WorkflowOrchestration,
  max_concurrent_workflows: 20,
  max_steps_per_workflow: 100,
  default_step_timeout: :timer.minutes(5),
  max_step_retries: 3,
  retry_backoff: :exponential,
  compensation_timeout: :timer.minutes(10),
  audit_log_retention: :timer.hours(720),
  telemetry_prefix: [:prismatic, :workflow]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_concurrent_workflows` | 20 | Maximum parallel workflow instances |
| `max_steps_per_workflow` | 100 | Maximum steps in a single workflow definition |
| `default_step_timeout` | 5 minutes | Default timeout per step execution |
| `max_step_retries` | 3 | Maximum retry attempts per step |
| `compensation_timeout` | 10 minutes | Maximum time for saga compensation |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Workflow instance creation | < 100 ms | 20-50 ms |
| Step dispatch latency | < 50 ms | 10-30 ms |
| Simple workflow (5 steps) | < 30 seconds | 5-15 seconds |
| Complex workflow (50 steps) | < 30 minutes | 5-20 minutes |
| Compensation execution | < 10 minutes | 1-5 minutes |
| Status query (ETS) | < 1 ms | 0.1-0.3 ms |
| Memory per instance | < 5 MB | 1-3 MB |

The execution engine is optimized for throughput through parallel step execution (independent steps run concurrently), efficient state management in ETS, and lightweight step processes that minimize per-step overhead. The saga compensation pattern ensures that failed workflows are cleaned up efficiently without blocking other instances.

## Related Resources

- [SEADF Framework](/glossary/seadf/) -- Autonomous evolution framework using workflow orchestration
- [Prismatic Agents](/glossary/prismatic-agents/) -- Agent runtime providing step implementations
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- OTP pattern for workflow instance management
- [Circuit Breaker](/glossary/circuit-breaker/) -- Resilience pattern for step failure isolation
- [NO MERCY Doctrine](/glossary/no-mercy/) -- Zero-tolerance for incomplete workflow execution
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing execution provenance
- [AIAD Standard](/glossary/aiad/) -- Agent specification standard
- [Supervision Tree](/glossary/supervision-tree/) -- OTP supervision pattern used for workflow isolation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)