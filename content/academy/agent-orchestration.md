+++
title = "Multi-Agent Orchestration Patterns"
weight = 5
[extra]
description = "Supreme orchestrators, agent hierarchies, coordination protocols, and distributed decision-making"
category = "intermediate"
difficulty = "intermediate"
duration = "60 min"
prerequisites = ["first-agent", "otp-fundamentals"]
glossary_terms = ["aiad", "agent", "agent-tier", "agent-registry", "nabla-infinity", "trinity-gate"]
technologies = ["elixir", "otp", "genserver", "pubsub"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 926
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Multi-Agent", "Orchestration", "Patterns", "Supreme", "academy", "intermediate", "Prismatic Platform", "PubSub", "Step", "Communication"]
tags = ["academy", "intermediate", "multi-agent-orchestration-patterns", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Multi-Agent Orchestration Patterns - Prismatic Platform"
+++

## Overview

A single agent solves a single problem. An orchestrated fleet of agents solves impossible problems. The Prismatic Platform runs 400+ agents organized into hierarchies, coordinated by supreme orchestrators, and communicating through well-defined protocols. This guide teaches you the patterns for multi-agent coordination -- from simple two-agent pipelines to complex cross-domain orchestration.

You will learn:

- The four-tier agent hierarchy (L1 Specialist to L4 Supreme)
- How to build orchestrator agents that coordinate specialist agents
- Communication patterns: direct calls, PubSub broadcast, and telemetry events
- How to implement consensus-based decision making across agent teams
- The supreme orchestrator pattern used by ARCHER and platform-level coordinators

## Prerequisites

- Completed [Building Your First Autonomous Agent](/academy/first-agent/)
- Completed [OTP Design Patterns for Prismatic](/academy/otp-fundamentals/)
- Understanding of GenServer, supervision trees, and process communication

## Core Concepts

### The Agent Hierarchy

Prismatic agents are organized into four tiers. Higher-tier agents coordinate lower-tier agents but never bypass them:

```
L4 Supreme (ARCHER, Supreme Coordinator)
  |
  +-- L3 Strategic (Domain Commanders)
  |     |
  |     +-- L2 Tactical (Team Leads)
  |     |     |
  |     |     +-- L1 Specialist (Individual Workers)
  |     |     +-- L1 Specialist
  |     |
  |     +-- L2 Tactical
  |           |
  |           +-- L1 Specialist
  |
  +-- L3 Strategic (Another Domain)
        |
        +-- L2 Tactical
```

Each tier has distinct responsibilities:

| Tier | Role | Decision Scope | Communication |
|------|------|----------------|---------------|
| L1 | Execute specific tasks | Single domain, single task | Reports upward |
| L2 | Coordinate task groups | Single domain, multiple tasks | Manages L1 agents |
| L3 | Strategic domain decisions | Full domain authority | Coordinates with other L3 |
| L4 | Platform-wide orchestration | Unlimited cross-domain | Commands all tiers |

### Communication Patterns

Agents communicate through three mechanisms:

1. **Direct GenServer calls** -- synchronous, point-to-point, for commands and queries
2. **Phoenix PubSub** -- asynchronous, broadcast, for events and notifications
3. **Telemetry events** -- fire-and-forget, for metrics and observability

### The Orchestrator Pattern

An orchestrator agent does not do work itself. It decomposes problems, delegates to specialists, aggregates results, and makes decisions based on the combined output.

## Step-by-Step Guide

### Step 1: Define the Agent Team

Before writing code, design your agent team on paper. For this tutorial, we will build a security assessment orchestrator:

```
SecurityAssessmentOrchestrator (L2 Tactical)
  |
  +-- PortScanner (L1 Specialist) -- scans open ports
  +-- CertificateChecker (L1 Specialist) -- validates TLS certificates
  +-- DnsAnalyzer (L1 Specialist) -- analyzes DNS configuration
```

### Step 2: Implement a Specialist Agent

Each specialist has a narrow, well-defined responsibility:

```elixir
defmodule PrismaticPerimeter.Agents.CertificateChecker do
  @moduledoc """
  L1 Specialist: Validates TLS certificates for a given domain.
  Reports certificate expiry, chain validity, and cipher strength.
  """

  use GenServer

  @type check_result :: %{
          domain: String.t(),
          valid: boolean(),
          expires_at: DateTime.t() | nil,
          issuer: String.t() | nil,
          grade: :A | :B | :C | :D | :F
        }

  @spec check(String.t()) :: {:ok, check_result()} | {:error, term()}
  def check(domain) do
    GenServer.call(__MODULE__, {:check, domain}, 30_000)
  end

  @impl true
  def init(_opts) do
    {:ok, %{cache: %{}, checks_performed: 0}}
  end

  @impl true
  def handle_call({:check, domain}, _from, state) do
    result = perform_certificate_check(domain)

    :telemetry.execute(
      [:prismatic_perimeter, :certificate_checker, :check],
      %{duration_ms: result.duration_ms},
      %{domain: domain, grade: result.grade}
    )

    new_state = %{
      state
      | cache: Map.put(state.cache, domain, result),
        checks_performed: state.checks_performed + 1
    }

    {:reply, {:ok, result}, new_state}
  end

  defp perform_certificate_check(domain) do
    # Real implementation would use :ssl module
    %{
      domain: domain,
      valid: true,
      expires_at: DateTime.add(DateTime.utc_now(), 90, :day),
      issuer: "Let's Encrypt",
      grade: :A,
      duration_ms: 150
    }
  end
end
```

### Step 3: Build the Orchestrator

The orchestrator coordinates specialists and aggregates their results:

```elixir
defmodule PrismaticPerimeter.Agents.SecurityAssessmentOrchestrator do
  @moduledoc """
  L2 Tactical Orchestrator: Coordinates security assessment specialists
  to produce a unified security rating for a domain.

  Delegates to:
  - PortScanner (L1) -- open port enumeration
  - CertificateChecker (L1) -- TLS certificate validation
  - DnsAnalyzer (L1) -- DNS configuration analysis
  """

  use GenServer

  require Logger

  alias PrismaticPerimeter.Agents.{PortScanner, CertificateChecker, DnsAnalyzer}

  @type assessment :: %{
          domain: String.t(),
          overall_grade: atom(),
          score: float(),
          components: map(),
          assessed_at: DateTime.t()
        }

  @spec assess(String.t()) :: {:ok, assessment()} | {:error, term()}
  def assess(domain) do
    GenServer.call(__MODULE__, {:assess, domain}, 60_000)
  end

  @impl true
  def init(_opts) do
    {:ok, %{assessments: %{}, in_progress: %{}}}
  end

  @impl true
  def handle_call({:assess, domain}, from, state) do
    # Launch all specialist checks concurrently
    task_supervisor = PrismaticPerimeter.TaskSupervisor

    tasks = %{
      ports: Task.Supervisor.async(task_supervisor, fn -> PortScanner.scan(domain) end),
      certificate: Task.Supervisor.async(task_supervisor, fn -> CertificateChecker.check(domain) end),
      dns: Task.Supervisor.async(task_supervisor, fn -> DnsAnalyzer.analyze(domain) end)
    }

    # Collect results with timeout
    results = collect_results(tasks, 30_000)

    # Aggregate into unified assessment
    assessment = aggregate_assessment(domain, results)

    :telemetry.execute(
      [:prismatic_perimeter, :security_assessment, :complete],
      %{score: assessment.score},
      %{domain: domain, grade: assessment.overall_grade}
    )

    new_state = %{state | assessments: Map.put(state.assessments, domain, assessment)}
    {:reply, {:ok, assessment}, new_state}
  end

  defp collect_results(tasks, timeout) do
    Map.new(tasks, fn {key, task} ->
      case Task.yield(task, timeout) || Task.shutdown(task) do
        {:ok, {:ok, result}} -> {key, {:ok, result}}
        {:ok, {:error, reason}} -> {key, {:error, reason}}
        nil -> {key, {:error, :timeout}}
      end
    end)
  end

  defp aggregate_assessment(domain, results) do
    components = Map.new(results, fn {key, result} ->
      grade = case result do
        {:ok, data} -> data.grade
        {:error, _} -> :F
      end
      {key, grade}
    end)

    score = calculate_score(components)

    %{
      domain: domain,
      overall_grade: score_to_grade(score),
      score: score,
      components: components,
      assessed_at: DateTime.utc_now()
    }
  end

  defp calculate_score(components) do
    grade_values = %{A: 100, B: 80, C: 60, D: 40, F: 0}

    components
    |> Map.values()
    |> Enum.map(&Map.get(grade_values, &1, 0))
    |> then(fn scores -> Enum.sum(scores) / max(length(scores), 1) end)
  end

  defp score_to_grade(score) when score >= 90, do: :A
  defp score_to_grade(score) when score >= 80, do: :B
  defp score_to_grade(score) when score >= 70, do: :C
  defp score_to_grade(score) when score >= 60, do: :D
  defp score_to_grade(_score), do: :F
end
```

### Step 4: Event-Driven Coordination with PubSub

For loosely coupled agent communication, use Phoenix PubSub:

```elixir
# Agent publishing events
defmodule PrismaticAgents.EventPublisher do
  @spec publish_finding(String.t(), map()) :: :ok
  def publish_finding(topic, finding) do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "agent:findings:#{topic}",
      {:agent_finding, finding}
    )
  end
end

# Orchestrator subscribing to events
defmodule PrismaticAgents.FindingAggregator do
  use GenServer

  @impl true
  def init(topics) do
    Enum.each(topics, fn topic ->
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "agent:findings:#{topic}")
    end)

    {:ok, %{findings: []}}
  end

  @impl true
  def handle_info({:agent_finding, finding}, state) do
    {:noreply, %{state | findings: [finding | state.findings]}}
  end
end
```

### Step 5: Consensus-Based Decisions

When multiple agents produce conflicting assessments, use a voting mechanism:

```elixir
@spec consensus(list({atom(), term()}), float()) :: {:consensus, term()} | :no_consensus
def consensus(votes, threshold \\ 0.66) do
  total = length(votes)
  grouped = Enum.group_by(votes, fn {_agent, vote} -> vote end)

  case Enum.max_by(grouped, fn {_vote, agents} -> length(agents) end) do
    {winning_vote, agents} when length(agents) / total >= threshold ->
      {:consensus, winning_vote}

    _ ->
      :no_consensus
  end
end
```

## Common Pitfalls

**Creating god-orchestrators that do everything.** An L2 orchestrator coordinates L1 specialists. It should not contain specialist logic itself. If your orchestrator is doing the actual work, extract it into a specialist.

**Synchronous calls across many agents.** When coordinating 10+ agents, use `Task.async_stream/3` or concurrent tasks instead of sequential `GenServer.call/2`. Sequential calls create latency that scales linearly with agent count.

**Missing timeout handling.** Every cross-agent call must have a timeout. Use `Task.yield/2` with `Task.shutdown/1` fallback, never rely on the default GenServer timeout.

**Tight coupling between agent tiers.** L1 agents should not know about L3 agents. Communication flows through the hierarchy: L1 reports to L2, L2 reports to L3. Skip-level communication creates brittle dependencies.

## Exercises

1. **Add a fourth specialist.** Create an `HttpHeaderAnalyzer` L1 agent and integrate it into the `SecurityAssessmentOrchestrator`. The orchestrator should handle the new agent's results without changes to the aggregation logic.

2. **Implement weighted scoring.** Modify `calculate_score/1` to apply different weights to different components (e.g., certificate issues are more critical than DNS configuration).

3. **Build a PubSub-based alert pipeline.** Create an agent that subscribes to all security assessment events and publishes alerts when any domain receives a grade below C.

4. **Implement retry logic.** When a specialist agent times out, the orchestrator should retry once before marking that component as failed.

## Summary

Multi-agent orchestration in Prismatic follows a strict hierarchy: L1 specialists perform narrow tasks, L2 tacticians coordinate teams, L3 commanders manage domains, and L4 supremes orchestrate the entire platform. Communication uses direct calls for commands, PubSub for events, and telemetry for metrics. Orchestrators delegate work, aggregate results, and make decisions -- they never perform specialist work themselves.

## Practical Implementation

### In Prismatic Platform

Multi-agent orchestration is implemented across these applications:

- **prismatic_agents** (`apps/prismatic_agents/`) -- The orchestration runtime. `PrismaticAgents.Orchestrator` coordinates cross-domain agent communication. `PrismaticAgents.Registry` provides process discovery via `{:via, Registry, ...}` tuples. `PrismaticAgents.HealthMonitor` tracks agent lifecycle and health across all tiers
- **prismatic_perimeter** (`apps/prismatic_perimeter/`) -- Real-world example of L2 orchestration: the security assessment orchestrator coordinates discovery, enumeration, and rating agents to produce unified security grades (A-F, 300-900)
- **prismatic_dark** (`apps/prismatic_dark/`) -- The 6 color teams (20 agents) demonstrate complex multi-tier orchestration: L4 Supreme coordinators manage L3 strategic commanders, who coordinate L2 tactical specialists and L1 individual workers
- **prismatic_dd** (`apps/prismatic_dd/`) -- Due diligence investigation orchestrator coordinates 122 OSINT source adapters in parallel, aggregating results through the triple-check validation pipeline

### Code Examples from the Codebase

The Perimeter orchestrator uses `Task.Supervisor` for concurrent specialist coordination:

```elixir
# Real pattern from PrismaticPerimeter security assessment
tasks = %{
  ports: Task.Supervisor.async(task_sup, fn -> PortScanner.scan(domain) end),
  certificate: Task.Supervisor.async(task_sup, fn -> CertificateChecker.check(domain) end),
  dns: Task.Supervisor.async(task_sup, fn -> DnsAnalyzer.analyze(domain) end)
}
# Collect with timeout, aggregate into unified rating
```

PubSub-based event coordination between color teams:

```elixir
# Color team signal flow uses Phoenix PubSub topics
Phoenix.PubSub.broadcast(Prismatic.PubSub, "color_team:gray:findings", {:gray_finding, finding})
Phoenix.PubSub.subscribe(Prismatic.PubSub, "color_team:red:findings")
```

## See Also

### Related Applications
- [prismatic_agents](/apps/prismatic-agents/) -- Agent runtime with orchestration infrastructure
- [prismatic_perimeter](/apps/prismatic-perimeter/) -- EASM orchestrator coordinating security assessment agents
- [prismatic_dd](/apps/prismatic-dd/) -- DD investigation orchestrator with 122 OSINT source adapters
- [prismatic_dark](/apps/prismatic-dark/) -- 20 agents across 6 color teams demonstrating complex orchestration

### Glossary
- [Agent Tier](/glossary/agent-tier/) -- L1-L4 classification hierarchy for agent authority
- [Agent Registry](/glossary/agent-registry/) -- Process discovery infrastructure
- [AIAD](/glossary/aiad/) -- Standard governing agent specifications and interactions
- [PubSub](/glossary/pubsub/) -- Broadcast communication pattern for agent events
- [Strategic Command](/glossary/strategic-command/) -- L3 agent authority level
- [Supreme Commander](/glossary/supreme-commander/) -- L4 platform-wide orchestration
- [Tactical Execution](/glossary/tactical-execution/) -- L2 agent coordination role

### Architecture
- [PubSub](/architecture/pubsub/) -- Phoenix PubSub architecture for agent communication
- [Supervision Trees](/architecture/supervision-trees/) -- Process topology for orchestrated agents
- [Telemetry](/architecture/telemetry/) -- Observability events from orchestrator operations

### Related Academy Topics
- [The AIAD Standard](/academy/aiad-standard/) -- Formal agent interaction specifications
- [Color Team Security](/academy/color-team-security/) -- Orchestration applied to adversarial-defensive teams
- [Self-Evolving Ecosystems](/academy/evolution-patterns/) -- How agent teams improve autonomously
- [OTP Design Patterns](/academy/otp-fundamentals/) -- GenServer and Supervisor patterns underlying orchestration

## Next Steps

- [The AIAD Standard Explained](/academy/aiad-standard/) -- formal specification for agent interactions
- [Color Team Security Operations](/academy/color-team-security/) -- see orchestration applied to adversarial-defensive teams
- [Self-Evolving Agent Ecosystems](/academy/evolution-patterns/) -- how agent teams improve autonomously

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)