+++
title = "Skill Matrix"
weight = 50
[extra]
description = "Competency assessment grid mapping team members or agents to skill levels across defined capability domains"
category = "management"
related_terms = ["agent-orchestration", "academy", "capability", "team", "assessment", "learning-path"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["skill matrix", "competency", "assessment", "capability mapping", "glossary", "Prismatic Platform"]
tags = ["glossary", "management", "assessment"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Skill Matrix - Prismatic Platform"
+++

## Definition & Overview

A skill matrix is a visual management tool that maps individuals (or, in AI systems, agents) against a set of competency domains, rating each on a defined proficiency scale. The matrix reveals capability gaps, identifies subject matter experts, guides training investments, and enables intelligent work assignment. In its simplest form, a skill matrix is a grid with people on rows, skills on columns, and proficiency levels in cells.

In the Prismatic Platform, the skill matrix concept extends beyond human team management to encompass the platform's 530+ AIAD agents. Each agent has defined capabilities, specializations, and proficiency levels that determine which tasks it can handle and at what quality level. The orchestration system uses this matrix to route tasks to the most capable agent, implement fallback chains when primary agents are unavailable, and identify capability gaps that require new agent development.

The Academy subsystem integrates with the skill matrix to provide learning paths that address identified gaps. When a topic assessment reveals low proficiency in a domain, the Academy recommends specific topics with exercises calibrated to the learner's current level. This creates a feedback loop where skill assessment drives learning, and learning outcomes update the skill matrix.

## Technical Deep Dive

### Skill Matrix Data Model

The platform represents skill matrices as structured data with enumerated proficiency levels:

```elixir
defmodule PrismaticAgents.SkillMatrix do
  @moduledoc """
  Competency assessment grid for AIAD agents.
  Maps agents to skill domains with proficiency levels.
  """

  @type proficiency :: :novice | :beginner | :intermediate | :advanced | :expert
  @type domain :: atom()

  @type entry :: %{
    agent_id: String.t(),
    domain: domain(),
    proficiency: proficiency(),
    assessed_at: DateTime.t(),
    evidence: [String.t()],
    confidence: float()
  }

  @type t :: %__MODULE__{
    entries: %{{String.t(), domain()} => entry()},
    domains: [domain()],
    agents: [String.t()]
  }

  defstruct entries: %{}, domains: [], agents: []

  @proficiency_order [:novice, :beginner, :intermediate, :advanced, :expert]
  @proficiency_scores %{novice: 1, beginner: 2, intermediate: 3, advanced: 4, expert: 5}

  @spec assess(t(), String.t(), domain(), proficiency(), keyword()) :: t()
  def assess(%__MODULE__{} = matrix, agent_id, domain, proficiency, opts \\ []) do
    entry = %{
      agent_id: agent_id,
      domain: domain,
      proficiency: proficiency,
      assessed_at: DateTime.utc_now(),
      evidence: Keyword.get(opts, :evidence, []),
      confidence: Keyword.get(opts, :confidence, 0.8)
    }

    %{matrix |
      entries: Map.put(matrix.entries, {agent_id, domain}, entry),
      domains: Enum.uniq([domain | matrix.domains]),
      agents: Enum.uniq([agent_id | matrix.agents])
    }
  end

  @spec proficiency_for(t(), String.t(), domain()) :: proficiency() | nil
  def proficiency_for(%__MODULE__{entries: entries}, agent_id, domain) do
    case Map.get(entries, {agent_id, domain}) do
      %{proficiency: p} -> p
      nil -> nil
    end
  end

  @spec find_experts(t(), domain()) :: [String.t()]
  def find_experts(%__MODULE__{entries: entries}, domain) do
    entries
    |> Enum.filter(fn {{_agent, d}, %{proficiency: p}} ->
      d == domain and p in [:advanced, :expert]
    end)
    |> Enum.sort_by(fn {_, %{proficiency: p}} -> -Map.get(@proficiency_scores, p) end)
    |> Enum.map(fn {{agent_id, _}, _} -> agent_id end)
  end

  @spec identify_gaps(t(), [domain()]) :: [{String.t(), domain()}]
  def identify_gaps(%__MODULE__{agents: agents} = matrix, required_domains) do
    for agent <- agents,
        domain <- required_domains,
        proficiency_for(matrix, agent, domain) in [nil, :novice, :beginner] do
      {agent, domain}
    end
  end
end
```

### Task Routing Based on Skills

The orchestration system uses the skill matrix to route tasks intelligently:

```elixir
defmodule PrismaticAgents.TaskRouter do
  @moduledoc """
  Routes tasks to agents based on skill matrix proficiency.
  Implements fallback chains and load balancing.
  """

  alias PrismaticAgents.SkillMatrix

  @spec route(SkillMatrix.t(), atom(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def route(matrix, required_domain, opts \\ []) do
    min_proficiency = Keyword.get(opts, :min_proficiency, :intermediate)

    candidates =
      matrix
      |> SkillMatrix.find_experts(required_domain)
      |> filter_by_min_proficiency(matrix, required_domain, min_proficiency)
      |> filter_by_availability()

    case candidates do
      [best | _rest] -> {:ok, best}
      [] -> {:error, {:no_qualified_agent, required_domain, min_proficiency}}
    end
  end

  defp filter_by_min_proficiency(agents, matrix, domain, min) do
    min_score = Map.get(%{novice: 1, beginner: 2, intermediate: 3, advanced: 4, expert: 5}, min)

    Enum.filter(agents, fn agent_id ->
      case SkillMatrix.proficiency_for(matrix, agent_id, domain) do
        nil -> false
        p -> Map.get(%{novice: 1, beginner: 2, intermediate: 3, advanced: 4, expert: 5}, p) >= min_score
      end
    end)
  end

  defp filter_by_availability(agents) do
    Enum.filter(agents, fn agent_id ->
      case PrismaticAgents.Registry.status(agent_id) do
        :available -> true
        _ -> false
      end
    end)
  end
end
```

## Architecture & Implementation

The skill matrix integrates with three platform subsystems. The agent registry stores baseline capabilities defined in `.aiad/agents/*.agent.md` files. The runtime assessment system updates proficiency levels based on task execution outcomes (success rate, quality metrics, execution time). The Academy provides learning paths to address identified gaps.

Assessment data is stored in PostgreSQL with JSONB evidence fields, enabling rich queries about capability distribution across the agent fleet. ETS caches provide the fast lookups needed for real-time task routing decisions.

The proficiency scale is intentionally coarse (5 levels) to avoid false precision in capability assessment. Each level maps to concrete, observable criteria: a "beginner" agent can handle standard cases with supervision, while an "expert" agent can handle novel edge cases autonomously and teach other agents.

## Usage in Prismatic Platform

The platform maintains skill matrices for both AIAD agents and platform domains. The agent skill matrix drives the `/orchestrate` command's agent selection logic. The domain skill matrix helps the Academy recommend topics and track organizational capability growth.

```elixir
# Build skill matrix from AIAD agent definitions
matrix =
  PrismaticAgents.Registry.all()
  |> Enum.reduce(SkillMatrix.new(), fn agent, acc ->
    Enum.reduce(agent.capabilities, acc, fn {domain, level}, m ->
      SkillMatrix.assess(m, agent.id, domain, level, evidence: [agent.spec_path])
    end)
  end)

# Find agents for security task
{:ok, agent} = PrismaticAgents.TaskRouter.route(matrix, :security, min_proficiency: :advanced)

# Identify training needs
gaps = SkillMatrix.identify_gaps(matrix, [:osint, :security, :compliance, :graph_analysis])
```

## Cross-References

- [Agent Orchestration](@/glossary/agent-orchestration.md) - Task routing that consumes skill matrix data
- **Academy** - Learning system that addresses skill matrix gaps
- **Capability** - Individual competency domain tracked in the matrix
- [AIAD](@/glossary/aiad.md) - Agent specification standard defining capabilities

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
