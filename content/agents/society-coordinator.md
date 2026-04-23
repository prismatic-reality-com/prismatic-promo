+++
title = "society-coordinator"
weight = 379
[extra]
domain = "general"
level = "L3"
description = "This agent specializes in coordinating epistemic societies, managing repair queues, and implementing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "nabla-infinity", "telemetry"]
domain_normalized = "general"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 141
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["society-coordinator", "agent", "specializes", "coordinating", "epistemic", "societies", "managing", "agents", "Prismatic Platform", "Optimal"]
tags = ["agents", "agent", "society-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "society-coordinator - Prismatic Platform"
+++

## Overview

The Society Coordinator is an L3 agent operating in the **general** domain of the Prismatic Platform. This agent specializes in coordinating epistemic societies, managing repair queues, and implementing collective intelligence protocols that enable the platform's 434 agents to function as a coherent, self-improving organism rather than a collection of independent processes.

An epistemic society, in the context of the Prismatic Platform, is a dynamically formed group of agents that collaborate on shared knowledge domains, collectively maintain belief states, and jointly evolve their capabilities through structured feedback loops. The Society Coordinator manages the lifecycle of these societies -- from formation through maturation to dissolution or merger -- ensuring that the platform's collective intelligence continuously improves.

The coordinator operates under the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, which mandates that all beliefs within a society are traceable, time-stamped, and supported by multiple independent signals. This prevents the emergence of echo chambers or unchallenged assumptions within any epistemic society.

## Epistemic Society Architecture

The platform organizes its agents into overlapping epistemic societies, where each society focuses on a specific knowledge domain or operational concern.

| Society | Focus | Member Count | Health |
|---------|-------|-------------|--------|
| **Quality Society** | Code quality, testing, static analysis | 45 agents | Optimal |
| **Intelligence Society** | OSINT, entity resolution, analysis | 62 agents | Optimal |
| **Security Society** | Defensive ops, compliance, vulnerability | 38 agents | Optimal |
| **Architecture Society** | System design, scalability, patterns | 28 agents | Optimal |
| **Epistemic Society** | Knowledge management, belief systems | 22 agents | Optimal |
| **Development Society** | Tooling, productivity, CI/CD | 35 agents | Optimal |

## Society Lifecycle Management

The Society Coordinator manages each society through a defined lifecycle.

```
Formation -> Initialization -> Active Operation -> Maturation -> Evolution/Dissolution
```

| Phase | Duration | Activities | Coordinator Role |
|-------|----------|------------|-----------------|
| **Formation** | Minutes | Member selection, charter creation | Initiator |
| **Initialization** | Hours | Knowledge base seeding, role assignment | Facilitator |
| **Active Operation** | Ongoing | Normal operations, knowledge sharing | Monitor |
| **Maturation** | Weeks-Months | Capability refinement, specialization | Guide |
| **Evolution** | Days | Merger, split, or capability expansion | Orchestrator |
| **Dissolution** | Hours | Knowledge preservation, member reassignment | Archivist |

## Repair Queue Management

One of the coordinator's critical functions is managing the repair queue -- a prioritized list of knowledge defects, capability gaps, and operational failures that require society-level intervention.

```elixir
defmodule PrismaticAgents.SocietyCoordinator do
  @moduledoc """
  L3 Society Coordinator.
  Manages epistemic societies, repair queues, and collective intelligence.
  """

  use GenServer
  require Logger

  @coordination_interval_ms :timer.minutes(5)

  defstruct [
    :societies,
    :repair_queue,
    :collective_health,
    :last_coordination_at,
    status: :coordinating
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    societies = discover_active_societies()
    schedule_coordination()
    {:ok, %__MODULE__{societies: societies, repair_queue: :queue.new()}}
  end

  @impl true
  def handle_info(:coordinate, state) do
    {processed, remaining} = process_repair_queue(state.repair_queue, state.societies)
    health = assess_collective_health(state.societies)

    :telemetry.execute(
      [:prismatic, :agents, :society_coordinator, :cycle],
      %{repairs_processed: processed, queue_depth: :queue.len(remaining)},
      %{society_count: length(state.societies), health: health}
    )

    schedule_coordination()

    {:noreply, %{state |
      repair_queue: remaining,
      collective_health: health,
      last_coordination_at: DateTime.utc_now()
    }}
  end

  @impl true
  def handle_cast({:enqueue_repair, repair_item}, state) do
    prioritized_queue = insert_by_priority(state.repair_queue, repair_item)
    {:noreply, %{state | repair_queue: prioritized_queue}}
  end

  defp process_repair_queue(queue, societies) do
    {items_to_process, remaining} = dequeue_batch(queue, 10)

    processed =
      items_to_process
      |> Enum.map(fn item -> route_repair_to_society(item, societies) end)
      |> Enum.count(&match?({:ok, _}, &1))

    {processed, remaining}
  end

  defp assess_collective_health(societies) do
    societies
    |> Enum.map(&assess_society_health/1)
    |> Enum.reduce(0, fn health, acc -> acc + health end)
    |> Kernel./(max(length(societies), 1))
  end
end
```

## Collective Intelligence Protocol

The Society Coordinator implements a collective intelligence protocol that enables societies to make decisions that exceed the capability of any individual agent.

| Protocol Step | Description | Mechanism |
|--------------|-------------|-----------|
| **Signal Collection** | Gather perspectives from all society members | [Telemetry](@/glossary/telemetry.md) aggregation |
| **Diversity Check** | Ensure sufficient viewpoint diversity | [NABLA](@/glossary/nabla-infinity.md) plurality axiom |
| **Weighted Synthesis** | Combine signals with competence-based weighting | Bayesian aggregation |
| **Contradiction Analysis** | Identify and preserve contradictory signals | Contradiction preservation axiom |
| **Confidence Assessment** | Calculate collective confidence in conclusions | [Trinity Gate](@/glossary/trinity-gate.md) validation |
| **Decision Emission** | Publish society-level decisions with provenance | Immutable audit trail |

## Repair Item Classification

| Priority | Description | SLA | Example |
|----------|-------------|-----|---------|
| **P0** | Society-breaking defect | Immediate | Knowledge base corruption |
| **P1** | Capability gap affecting operations | 1 hour | Missing analysis capability |
| **P2** | Performance degradation | 4 hours | Slow inference pipeline |
| **P3** | Enhancement opportunity | 24 hours | New data source integration |
| **P4** | Long-term improvement | 1 week | Algorithm optimization |

## Society Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Member Responsiveness** | Average response time to coordination requests | < 5 seconds |
| **Knowledge Freshness** | Age of most recent knowledge contribution | < 1 hour |
| **Repair Queue Depth** | Outstanding repair items | < 10 |
| **Cross-Society Collaboration** | Inter-society knowledge exchange events | > 50/day |
| **Belief Consistency** | Percentage of non-contradictory beliefs | > 95% |

## Inter-Society Knowledge Transfer

One of the Society Coordinator's most valuable capabilities is facilitating knowledge transfer between societies. When one society develops a capability or discovers a pattern that could benefit another society, the coordinator manages the transfer process to ensure knowledge is correctly contextualized and adapted for the receiving society's domain.

### Knowledge Transfer Protocol

```elixir
defmodule PrismaticAgents.SocietyCoordinator.KnowledgeTransfer do
  @moduledoc """
  Manages inter-society knowledge transfer with context adaptation.
  Ensures transferred knowledge is correctly mapped to receiving domain.
  """

  @spec initiate_transfer(atom(), atom(), map()) :: {:ok, map()} | {:error, term()}
  def initiate_transfer(source_society, target_society, knowledge_item) do
    with {:ok, validated} <- validate_transferability(knowledge_item, target_society),
         {:ok, adapted} <- adapt_context(validated, source_society, target_society),
         {:ok, verified} <- verify_no_contradictions(adapted, target_society),
         :ok <- inject_into_society(adapted, target_society) do
      :telemetry.execute(
        [:prismatic, :agents, :society_coordinator, :knowledge_transfer],
        %{},
        %{source: source_society, target: target_society, item: knowledge_item.id}
      )

      {:ok, %{
        source: source_society,
        target: target_society,
        item_id: knowledge_item.id,
        adaptation_changes: adapted.changes,
        transferred_at: DateTime.utc_now()
      }}
    end
  end

  defp adapt_context(knowledge, source, target) do
    mappings = fetch_domain_concept_mappings(source, target)

    adapted =
      knowledge
      |> Map.update(:terminology, %{}, &apply_term_mappings(&1, mappings))
      |> Map.update(:references, [], &remap_references(&1, target))
      |> Map.put(:provenance, %{
        original_society: source,
        adapted_for: target,
        adapted_at: DateTime.utc_now()
      })

    {:ok, adapted}
  end
end
```

| Transfer Type | Description | Frequency | Success Rate |
|--------------|-------------|-----------|-------------|
| **Pattern Transfer** | Proven quality patterns shared across societies | Weekly | 92% |
| **Tool Sharing** | Analytical tools adapted for new domains | Monthly | 85% |
| **Insight Broadcast** | Strategic insights shared with all societies | As discovered | N/A |
| **Failure Lessons** | Post-mortem learnings distributed | Per incident | 98% |
| **Capability Seeding** | New capability introduced from external sources | Quarterly | 78% |

## Society Formation Criteria

Not every group of agents warrants a formal epistemic society. The Society Coordinator evaluates formation requests against strict criteria to ensure that societies provide genuine collective intelligence value rather than merely adding organizational overhead.

| Criterion | Requirement | Rationale |
|-----------|-------------|-----------|
| **Minimum Membership** | 5+ agents | Below this threshold, direct coordination is more efficient |
| **Shared Knowledge Domain** | Agents share at least 60% domain overlap | Without overlap, collective reasoning lacks foundation |
| **Complementary Capabilities** | Members bring diverse analytical perspectives | Homogeneous societies produce echo chambers |
| **Sustained Need** | Expected operational duration > 30 days | Short-term collaboration handled by mission planning |
| **Clear Charter** | Documented purpose, scope, and success criteria | Societies without clear purpose drift and decay |

## Integration Points

- [**NABLA Axioms**](@/capabilities/nabla-axioms.md) -- Epistemic framework governing society beliefs
- [**Autonomous Self-Healing**](@/capabilities/autonomous-self-healing.md) -- Society-level self-repair capabilities
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Society health monitoring
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- All societies operate within AIAD constraints

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 16 rules defined |
| Telemetry integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

- [**Societies Quality Feedback Coordinator**](@/agents/societies-quality-feedback-coordinator.md) -- Quality feedback across societies
- [**Stack Mode Coordinator**](@/agents/stack-mode-coordinator.md) -- Stack-based conversation state management
- [**Six Sigma Psycho Coordinator**](@/agents/six-sigma-psycho-coordinator.md) -- Quality enforcement within societies

## Society Performance Benchmarks

The Society Coordinator evaluates each society against standardized performance benchmarks that measure both the society's internal health and its contribution to the platform's overall intelligence capability.

| Benchmark | Measurement | Excellent | Good | Needs Attention | Critical |
|-----------|------------|-----------|------|----------------|----------|
| **Decision Quality** | Accuracy of society-level decisions | > 98% | 95-98% | 90-95% | < 90% |
| **Response Time** | Time from query to society response | < 5s | 5-15s | 15-60s | > 60s |
| **Knowledge Growth** | New knowledge items per week | > 50 | 20-50 | 5-20 | < 5 |
| **Collaboration Index** | Inter-member knowledge exchanges per day | > 20 | 10-20 | 5-10 | < 5 |
| **Repair Resolution** | Repair items resolved within SLA | > 98% | 95-98% | 90-95% | < 90% |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to create, modify, and dissolve epistemic societies and manage their collective intelligence protocols.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)