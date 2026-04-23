+++
title = "unified-orchestrator"
weight = 408
[extra]
domain = "medium-predator"
level = "L1"
description = "Supreme coordination agent for intelligent task routing and multi-agent orchestration"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "predator"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 142
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["unified-orchestrator", "Supreme", "agents", "agent", "Prismatic Platform", "Unified Orchestrator", "Task", "Seconds"]
tags = ["agents", "agent", "unified-orchestrator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "unified-orchestrator - Prismatic Platform"
+++

## Overview

The Unified Orchestrator is an L1 Supreme Authority agent operating in the **medium-predator** organism classification of the Prismatic Platform. This agent serves as the supreme coordination hub for intelligent task routing and multi-agent orchestration, decomposing complex objectives into coordinated task sequences and dispatching them to the most capable specialist agents. When users invoke the `/orchestrate` command, it is the Unified Orchestrator that analyzes the request, formulates an execution plan, allocates agent resources, and monitors the mission to completion.

The "medium-predator" classification reflects the Unified Orchestrator's position in the platform's ecological hierarchy -- it actively coordinates and directs lower-tier agents (herbivores and small predators) while operating under the strategic direction of the [Strategic Command](@/agents/strategic-command.md) and Supreme Commander agents. This intermediate position gives the Unified Orchestrator both the tactical flexibility to adapt to changing conditions and the strategic awareness to align task execution with platform-wide objectives.

This agent operates under the [NO MERCY](@/glossary/no-mercy.md) doctrine, executing orchestration decisions with absolute confidence after [Trinity Gate](@/glossary/trinity-gate.md) verification and demanding complete execution from all subordinate agents.

## Orchestration Architecture

The Unified Orchestrator implements a multi-phase orchestration pipeline that transforms high-level objectives into coordinated multi-agent operations.

```
User Request -> Task Analysis -> Decomposition -> Agent Selection -> Execution -> Synthesis -> Delivery
```

| Phase | Duration | Activity | Output |
|-------|----------|----------|--------|
| **Task Analysis** | Seconds | Parse request, identify domain, assess complexity | Task specification |
| **Decomposition** | Seconds | Break into subtasks with dependency graph | Task DAG |
| **Agent Selection** | Seconds | Match subtasks to capable agents | Agent assignment map |
| **Execution** | Minutes-Hours | Dispatch tasks, monitor progress, handle failures | Task results |
| **Synthesis** | Seconds-Minutes | Merge results, verify completeness, format output | Unified result |
| **Delivery** | Seconds | Present results to user with provenance | Final deliverable |

## Technical Implementation

```elixir
defmodule PrismaticAgents.UnifiedOrchestrator do
  @moduledoc """
  L1 Unified Orchestrator agent.
  Supreme coordination for intelligent task routing and multi-agent orchestration.
  """

  use GenServer
  require Logger

  @max_parallel_agents 12
  @mission_timeout_ms :timer.minutes(30)

  defstruct [
    :active_missions,
    :agent_pool,
    :task_queue,
    :completion_rate,
    :last_orchestration_at,
    status: :ready
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:ok, %__MODULE__{active_missions: [], agent_pool: discover_available_agents()}}
  end

  @spec orchestrate(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def orchestrate(objective, opts \\ []) do
    GenServer.call(__MODULE__, {:orchestrate, objective, opts}, @mission_timeout_ms)
  end

  @impl true
  def handle_call({:orchestrate, objective, opts}, _from, state) do
    max_agents = Keyword.get(opts, :max_agents, @max_parallel_agents)

    with {:ok, spec} <- analyze_task(objective),
         {:ok, dag} <- decompose_task(spec),
         {:ok, assignments} <- select_agents(dag, state.agent_pool, max_agents),
         {:ok, results} <- execute_mission(assignments, dag),
         {:ok, synthesis} <- synthesize_results(results) do

      :telemetry.execute(
        [:prismatic, :agents, :orchestrator, :mission_complete],
        %{
          subtask_count: length(Map.keys(dag)),
          agents_used: length(Map.keys(assignments)),
          duration_ms: synthesis.duration_ms
        },
        %{objective: objective, success: true}
      )

      {:reply, {:ok, synthesis}, update_state(state, synthesis)}
    else
      {:error, reason} ->
        :telemetry.execute(
          [:prismatic, :agents, :orchestrator, :mission_failed],
          %{},
          %{objective: objective, reason: reason}
        )
        {:reply, {:error, reason}, state}
    end
  end

  defp execute_mission(assignments, dag) do
    execution_order = topological_sort(dag)

    results =
      execution_order
      |> Enum.reduce(%{}, fn task_batch, accumulated_results ->
        batch_results =
          task_batch
          |> Task.async_stream(
            fn task ->
              agent = Map.fetch!(assignments, task.id)
              context = extract_dependencies(task, accumulated_results)
              execute_subtask(agent, task, context)
            end,
            max_concurrency: @max_parallel_agents,
            timeout: :timer.minutes(10)
          )
          |> Enum.map(fn {:ok, result} -> result end)
          |> Map.new(fn r -> {r.task_id, r} end)

        Map.merge(accumulated_results, batch_results)
      end)

    {:ok, results}
  end
end
```

## Agent Selection Algorithm

The Unified Orchestrator selects agents for subtasks based on a multi-factor scoring algorithm.

| Factor | Weight | Measurement |
|--------|--------|-------------|
| **Domain Match** | 40% | Agent domain matches task domain |
| **Capability Score** | 25% | Agent's demonstrated capability for task type |
| **Current Load** | 15% | Agent's current task queue depth |
| **Historical Performance** | 15% | Past success rate for similar tasks |
| **Authority Level** | 5% | Agent has sufficient authority for task |

## Task Decomposition Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| **Sequential** | Tasks with strict dependencies | Build then deploy |
| **Parallel** | Independent tasks | Analyze multiple data sources |
| **Fan-Out/Fan-In** | One task generates many, results merged | Multi-agent investigation |
| **Pipeline** | Each task feeds the next | Data collection, processing, analysis |
| **Conditional** | Branching based on intermediate results | Escalate if threshold exceeded |

## Mission Monitoring

The Unified Orchestrator provides real-time mission monitoring through structured [telemetry](@/glossary/telemetry.md) events. These events feed into the platform's LiveView monitoring dashboards, providing real-time visibility into mission progress for both automated systems and human operators.

| Event | Data | Frequency |
|-------|------|-----------|
| **Mission Started** | Objective, agent count, estimated duration | Per mission |
| **Subtask Dispatched** | Task ID, assigned agent, expected duration | Per subtask |
| **Subtask Completed** | Task ID, result, actual duration | Per subtask |
| **Mission Progress** | Completion percentage, remaining tasks | Every 30 seconds |
| **Mission Complete** | Full results, total duration, agent utilization | Per mission |
| **Agent Stalled** | Agent ID, task ID, elapsed time | When timeout approaches |
| **Mission Failure** | Objective, failure point, error details | Per failure |

## Error Handling and Recovery

The Unified Orchestrator implements sophisticated error handling that distinguishes between transient failures (which can be retried), permanent failures (which require alternative approaches), and cascading failures (which require mission restructuring).

```elixir
defmodule PrismaticAgents.UnifiedOrchestrator.ErrorHandler do
  @moduledoc """
  Error handling and recovery strategies for orchestrated missions.
  Implements retry, fallback, and mission restructuring patterns.
  """

  @max_retries 3
  @retry_backoff_ms 1_000

  @spec handle_subtask_failure(map(), map(), map()) :: {:retry, map()} | {:fallback, map()} | {:abort, map()}
  def handle_subtask_failure(task, error, mission_context) do
    cond do
      transient_error?(error) and task.retry_count < @max_retries ->
        delay = @retry_backoff_ms * :math.pow(2, task.retry_count) |> round()
        {:retry, %{task | retry_count: task.retry_count + 1, retry_after_ms: delay}}

      fallback_agent_available?(task, mission_context) ->
        fallback = select_fallback_agent(task, mission_context)
        {:fallback, %{task | assigned_agent: fallback, retry_count: 0}}

      critical_path_task?(task, mission_context) ->
        {:abort, %{reason: :critical_path_failure, task: task, error: error}}

      true ->
        {:skip, %{task: task, reason: :non_critical_failure, error: error}}
    end
  end

  defp transient_error?(%{type: :timeout}), do: true
  defp transient_error?(%{type: :resource_unavailable}), do: true
  defp transient_error?(%{type: :rate_limited}), do: true
  defp transient_error?(_), do: false
end
```

| Error Category | Detection | Recovery Strategy | SLA |
|---------------|-----------|-------------------|-----|
| **Transient Failure** | Timeout, resource unavailable | Exponential backoff retry (max 3) | < 30 seconds |
| **Agent Failure** | Agent crash or unresponsive | Fallback to alternative agent | < 2 minutes |
| **Critical Path Failure** | Unrecoverable task on critical path | Mission abort with partial results | Immediate |
| **Non-Critical Failure** | Task failure on optional path | Skip task, continue mission | No delay |
| **Cascading Failure** | Multiple simultaneous failures | Mission restructure or abort | < 5 minutes |

## Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Mission success rate** | > 95% | Completed missions vs total |
| **Average orchestration latency** | < 5 seconds | Task analysis to first dispatch |
| **Agent utilization** | 60-80% | Optimal agent workload balance |
| **Max parallel agents** | 12 | Simultaneous agent coordination |
| **Task decomposition accuracy** | > 90% | Subtasks correctly identified |

## Mycelial Network Integration

The Unified Orchestrator communicates with agents through the platform's [mycelial network](@/glossary/mycelial-network.md), enabling rapid signal propagation and distributed coordination.

| Network Operation | Mechanism | Latency |
|------------------|-----------|---------|
| **Task Dispatch** | Targeted message to specific agent | < 5 ms |
| **Progress Query** | PubSub subscription to agent telemetry | < 10 ms |
| **Result Collection** | GenServer call with timeout | < 100 ms |
| **Emergency Recall** | Broadcast cancellation signal | < 5 ms |

## Integration Points

- [**NABLA Axioms**](@/capabilities/nabla-axioms.md) -- Epistemic framework for orchestration decisions
- [**Trinity Gate**](@/capabilities/trinity-gate.md) -- Verification of mission plans
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Mission monitoring and metrics
- [**Quality Gates**](@/capabilities/quality-gates.md) -- Mission output quality validation
- [**Real-time Monitoring**](@/capabilities/real-time-monitoring.md) -- Live mission dashboards

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 20 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

- [**Strategic Command**](@/agents/strategic-command.md) -- Provides strategic direction for orchestration
- [**Six Sigma Psycho Coordinator**](@/agents/six-sigma-psycho-coordinator.md) -- Quality enforcement on orchestrated outputs
- [**Scalability Architect**](@/agents/scalability-architect.md) -- Resource scaling for large orchestrations
- [**Strangler Pattern Specialist**](@/agents/strangler-pattern-specialist.md) -- Coordinated migration orchestration

## Mission Types and Templates

The Unified Orchestrator maintains a library of mission templates for common orchestration patterns. These templates accelerate mission planning by providing pre-configured task decomposition strategies, agent selection criteria, and success metrics for frequently executed operation types.

| Mission Template | Typical Agents | Duration | Use Case |
|-----------------|----------------|----------|----------|
| **Quality Sweep** | 6-8 quality agents | 30-60 min | Platform-wide quality assessment |
| **Intelligence Collection** | 4-6 intelligence agents | 1-4 hours | Multi-source OSINT operation |
| **Security Audit** | 5-7 security agents | 2-6 hours | Comprehensive security review |
| **Migration Step** | 3-5 architecture agents | 1-2 hours | Strangler pattern advancement |
| **Content Enhancement** | 2-4 content agents | 1-3 hours | Documentation or promo content |
| **Incident Response** | 8-12 mixed agents | Variable | Emergency response coordination |

## Authority Level

**L1** - Supreme Authority - Platform-wide strategic and tactical control with authority to coordinate up to 12 parallel agents and direct any L2-L4 agent.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)