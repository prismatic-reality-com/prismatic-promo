+++
title = "Task Dispatch"
weight = 50
[extra]
description = "AIAD agent work distribution mechanism that routes tasks to qualified agents based on skill matrix, availability, and priority"
category = "agents"
related_terms = ["agent-orchestration", "aiad", "skill-matrix", "genserver", "task-supervisor", "load-balancing"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["task dispatch", "agent routing", "work distribution", "AIAD", "orchestration", "glossary", "Prismatic Platform"]
tags = ["glossary", "agents", "orchestration"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Task Dispatch - Prismatic Platform"
+++

## Definition & Overview

Task dispatch is the mechanism by which work items are routed to the most appropriate agent for execution. In a multi-agent system, not all agents are equally qualified, available, or efficient for every task. Task dispatch considers agent capabilities (skill matrix proficiency), current load (how many tasks an agent is already handling), priority (task urgency relative to the agent's queue), and affinity (whether an agent has prior context relevant to the task). The goal is to maximize system throughput and result quality by matching tasks to their optimal executors.

Task dispatch differs from simple load balancing in that it accounts for qualitative differences between workers. A load balancer distributes work evenly; a task dispatcher distributes work intelligently. A security analysis task should go to a security-specialist agent, not to a code formatting agent, even if the formatter is idle. The dispatch decision incorporates domain knowledge about what each agent does well, not just how busy each agent is.

In the Prismatic Platform, task dispatch operates within the AIAD agent orchestration framework. With 530+ agents across 16 domains, efficient dispatch is critical for the `/orchestrate` command's 10x efficiency claim. The dispatch system maintains a real-time view of agent capabilities (from `.aiad/agents/*.agent.md` specifications), current availability (from the agent runtime registry), and task requirements (from the command invocation context). It routes tasks to the best available agent and implements fallback chains when the primary agent is unavailable.

## Technical Deep Dive

### Task Dispatch Engine

The dispatch engine evaluates candidates and selects the optimal agent:

```elixir
defmodule PrismaticAgents.Dispatcher do
  @moduledoc """
  Routes tasks to the most qualified available agent.
  Considers skill match, availability, load, and affinity.
  """

  alias PrismaticAgents.{Registry, SkillMatrix}

  @type task :: %{
    domain: atom(),
    required_skills: [atom()],
    priority: :low | :normal | :high | :critical,
    context: map(),
    requester: String.t()
  }

  @type dispatch_result :: %{
    agent_id: String.t(),
    score: float(),
    reason: String.t()
  }

  @spec dispatch(task()) :: {:ok, dispatch_result()} | {:error, term()}
  def dispatch(task) do
    candidates =
      Registry.all_agents()
      |> Enum.filter(&agent_eligible?(&1, task))
      |> Enum.map(&score_candidate(&1, task))
      |> Enum.sort_by(& &1.score, :desc)

    case candidates do
      [best | _] ->
        Registry.assign_task(best.agent_id, task)
        {:ok, best}

      [] ->
        {:error, {:no_qualified_agent, task.domain, task.required_skills}}
    end
  end

  defp agent_eligible?(agent, task) do
    agent.status == :available and
      domain_match?(agent, task) and
      has_required_skills?(agent, task)
  end

  defp domain_match?(agent, task) do
    task.domain in agent.domains
  end

  defp has_required_skills?(agent, task) do
    Enum.all?(task.required_skills, fn skill ->
      SkillMatrix.proficiency_for(agent.skill_matrix, agent.id, skill) in
        [:intermediate, :advanced, :expert]
    end)
  end

  defp score_candidate(agent, task) do
    skill_score = calculate_skill_score(agent, task)
    load_score = calculate_load_score(agent)
    affinity_score = calculate_affinity_score(agent, task)
    priority_boost = priority_multiplier(task.priority)

    total = (skill_score * 0.5 + load_score * 0.3 + affinity_score * 0.2) * priority_boost

    %{
      agent_id: agent.id,
      score: total,
      reason: "skill=#{Float.round(skill_score, 2)}, load=#{Float.round(load_score, 2)}, affinity=#{Float.round(affinity_score, 2)}"
    }
  end

  defp calculate_skill_score(agent, task) do
    scores = Enum.map(task.required_skills, fn skill ->
      case SkillMatrix.proficiency_for(agent.skill_matrix, agent.id, skill) do
        :expert -> 1.0
        :advanced -> 0.8
        :intermediate -> 0.6
        :beginner -> 0.3
        _ -> 0.0
      end
    end)

    if Enum.empty?(scores), do: 0.5, else: Enum.sum(scores) / length(scores)
  end

  defp calculate_load_score(agent) do
    max_load = agent.max_concurrent_tasks || 5
    current = Registry.current_task_count(agent.id)
    max(0, 1.0 - current / max_load)
  end

  defp calculate_affinity_score(agent, task) do
    if Map.get(task.context, :previous_agent) == agent.id, do: 0.8, else: 0.0
  end

  defp priority_multiplier(:critical), do: 2.0
  defp priority_multiplier(:high), do: 1.5
  defp priority_multiplier(:normal), do: 1.0
  defp priority_multiplier(:low), do: 0.8
end
```

### Fallback Chain Dispatch

When the primary agent is unavailable, the dispatcher follows a fallback chain:

```elixir
defmodule PrismaticAgents.FallbackDispatcher do
  @moduledoc """
  Implements fallback chains for robust task dispatch.
  Tries primary, secondary, and generic agents in sequence.
  """

  alias PrismaticAgents.{Dispatcher, Registry}

  @spec dispatch_with_fallback(Dispatcher.task(), keyword()) :: {:ok, map()} | {:error, term()}
  def dispatch_with_fallback(task, opts \\ []) do
    max_attempts = Keyword.get(opts, :max_attempts, 3)
    dispatch_attempt(task, 0, max_attempts)
  end

  defp dispatch_attempt(_task, attempts, max) when attempts >= max do
    {:error, :all_fallbacks_exhausted}
  end

  defp dispatch_attempt(task, attempt, max) do
    adjusted_task = relax_requirements(task, attempt)

    case Dispatcher.dispatch(adjusted_task) do
      {:ok, result} ->
        {:ok, Map.put(result, :fallback_level, attempt)}

      {:error, _} ->
        dispatch_attempt(task, attempt + 1, max)
    end
  end

  defp relax_requirements(task, 0), do: task

  defp relax_requirements(task, 1) do
    # Level 1: Accept lower proficiency
    %{task | required_skills: Enum.take(task.required_skills, 1)}
  end

  defp relax_requirements(task, _level) do
    # Level 2+: Accept any agent in the domain
    %{task | required_skills: []}
  end
end
```

### Async Task Dispatch with Task.Supervisor

For non-blocking dispatch, the platform uses OTP Task.Supervisor:

```elixir
defmodule PrismaticAgents.AsyncDispatcher do
  @moduledoc """
  Asynchronous task dispatch using OTP Task.Supervisor.
  Tasks execute concurrently with configurable timeouts.
  """

  @spec dispatch_async(Dispatcher.task(), keyword()) :: {:ok, Task.t()} | {:error, term()}
  def dispatch_async(task, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    callback = Keyword.get(opts, :on_complete)

    case Dispatcher.dispatch(task) do
      {:ok, dispatch_result} ->
        async_task = Task.Supervisor.async_nolink(
          PrismaticAgents.TaskSupervisor,
          fn ->
            result = execute_on_agent(dispatch_result.agent_id, task)
            if callback, do: callback.(result)
            result
          end,
          shutdown: timeout
        )

        {:ok, async_task}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp execute_on_agent(agent_id, task) do
    agent = Registry.get_agent(agent_id)
    agent.module.execute(task)
  end
end
```

## Architecture & Implementation

The dispatch system is built on three pillars: the agent registry (who is available), the skill matrix (who is capable), and the scoring engine (who is optimal). The registry is an ETS-backed GenServer providing sub-microsecond agent lookups. The skill matrix is derived from AIAD agent specifications and runtime performance metrics. The scoring engine combines weighted factors into a composite score.

Dispatch decisions are logged with full context for audit and optimization. The platform tracks which agent was selected, the scoring breakdown, whether fallbacks were used, and the execution outcome. This data feeds back into the skill matrix, creating a learning loop where dispatch decisions improve over time.

The platform avoids the "hot agent" problem (where the highest-scoring agent gets all tasks) through load scoring. As an agent accumulates tasks, its load score decreases, naturally distributing work across qualified agents. Priority multipliers ensure that critical tasks still reach the best agent even under load.

## Usage in Prismatic Platform

Task dispatch powers the `/orchestrate` command and internal agent coordination:

```elixir
# Dispatch a security analysis task
{:ok, result} = PrismaticAgents.Dispatcher.dispatch(%{
  domain: :security,
  required_skills: [:vulnerability_analysis, :compliance],
  priority: :high,
  context: %{target: "example.com"},
  requester: "user-123"
})
```

## Cross-References

- [Agent Orchestration](@/glossary/agent-orchestration.md) - Higher-level coordination using dispatch
- [AIAD](@/glossary/aiad.md) - Agent specification defining dispatch-relevant metadata
- [Skill Matrix](@/glossary/skill-matrix.md) - Capability data driving dispatch decisions
- **Task Supervisor** - OTP component executing dispatched tasks

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
