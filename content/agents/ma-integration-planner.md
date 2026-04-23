+++
title = "ma-integration-planner"
weight = 238
[extra]
domain = "primary"
level = "L3"
description = "Develop comprehensive integration strategy and master plan"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-integration-planner", "Develop", "agents", "agent", "Prismatic Platform", "Phase", "Inbound", "Plan", "Every"]
tags = ["agents", "agent", "ma-integration-planner", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ma-integration-planner - Prismatic Platform"
+++

## Overview

The ma-integration-planner agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's primary domain, responsible for developing comprehensive post-acquisition integration strategies and master plans that transform deal intelligence into executable operational roadmaps. This agent synthesizes outputs from financial, technical, risk, and market analysis agents into cohesive integration blueprints that define timelines, resource requirements, dependency chains, risk mitigations, and success metrics for every phase of post-close integration.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy/) doctrine, the ma-integration-planner refuses to produce integration plans without sufficient evidence. Every plan element traces back to validated intelligence from specialist agents, and all timeline projections carry explicit confidence intervals rather than point estimates. The agent applies the [NABLA Infinity](/glossary/nabla-infinity/) framework to ensure that integration plans acknowledge contradictory signals from different assessment domains rather than artificially resolving tensions.

Post-acquisition integration is widely recognized as the most critical determinant of M&A success, with studies consistently showing that 60-70% of acquisitions fail to deliver expected value due to integration failures. The ma-integration-planner addresses this challenge by providing structured, evidence-based integration planning that accounts for the complex interdependencies between technology systems, organizational structures, business processes, and cultural factors that determine integration outcomes.

## Architecture

The ma-integration-planner implements a dependency-aware planning architecture that models integration activities as a directed acyclic graph (DAG) with resource constraints and risk-adjusted timelines.

```
Intelligence Inputs              Planning Engine              Plan Outputs
+-------------------+          +------------------+         +------------------+
| Financial Profile |---+      | Dependency Graph |         | Master Timeline  |
+-------------------+   |  +-->| (DAG Builder)    |---+     | (Gantt + Deps)   |
| Technical Profile |---+->|   +------------------+   |  +->+------------------+
+-------------------+   |  |   | Resource Planner |   |  |  | Resource Plan    |
| Risk Assessment   |---+  +-->| (Optimization)   |---+--+  | (People/Budget)  |
+-------------------+   |      +------------------+   |  |  +------------------+
| Market Analysis   |---+      | Risk Integrator  |   |  |  | Risk Mitigation  |
+-------------------+          | (Contingency)    |---+  +->| (Contingencies)  |
                               +------------------+         +------------------+
                                                                    |
                                                                    v
                                                            +------------------+
                                                            | Integration      |
                                                            | Master Plan      |
                                                            +------------------+
```

The planning engine constructs a dependency graph of integration activities across all workstreams (technology, operations, finance, HR, legal, commercial), applies resource optimization algorithms to produce feasible schedules, and integrates risk contingencies from the risk assessment pipeline. Plan outputs are versioned and tracked through the enforcement commander's compliance gates.

## Core Capabilities

The ma-integration-planner provides comprehensive post-acquisition integration planning through several specialized capability domains.

**Workstream Decomposition** breaks the integration challenge into structured workstreams covering technology migration, organizational restructuring, financial integration, commercial alignment, legal entity consolidation, and operational process harmonization. Each workstream is further decomposed into discrete activities with defined deliverables, owners, and acceptance criteria.

**Dependency Modeling** constructs a directed acyclic graph of integration activities, identifying critical path items, parallel execution opportunities, and hard dependencies that constrain scheduling. The dependency model accounts for both technical dependencies (system A must migrate before system B) and organizational dependencies (team restructuring must precede process changes).

**Resource Optimization** allocates personnel, budget, and infrastructure resources across integration activities to minimize total integration duration while respecting resource constraints. The optimizer considers skill requirements, availability windows, and capacity limits to produce feasible resource assignments.

**Timeline Generation** produces risk-adjusted timelines with confidence intervals rather than deterministic dates. Timelines incorporate buffer allocations based on risk assessments, historical integration performance data, and complexity scoring. Critical milestones are identified and linked to enforcement gates.

**Synergy Tracking** defines and tracks the realization of expected deal synergies (cost savings, revenue enhancement, capability gains) through integration activities. Each synergy is mapped to specific integration deliverables with measurable indicators and target realization timelines.

**Contingency Planning** develops contingency responses for identified integration risks, defining trigger conditions, alternative execution paths, and resource reserves required for each contingency scenario.

## Implementation

The integration planner is implemented as a [GenServer](/glossary/genserver/) process managing the integration planning state machine for each deal.

```elixir
defmodule Prismatic.MA.IntegrationPlanner do
  @moduledoc """
  L3 Strategic Command agent for post-acquisition integration planning.
  Synthesizes deal intelligence into executable integration roadmaps.
  """

  use GenServer
  require Logger

  alias Prismatic.MA.Integration.{WorkstreamBuilder, DependencyGraph, ResourceOptimizer}
  alias Prismatic.MA.Integration.{TimelineEngine, SynergyTracker, ContingencyPlanner}

  @workstreams [:technology, :operations, :finance, :hr, :legal, :commercial]
  @planning_phases [:assessment, :design, :validation, :approval, :execution, :monitoring]

  defstruct [:deal_id, :phase, :workstreams, :dependency_graph, :timeline, :resources, :synergies]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: via_tuple(opts[:deal_id]))
  end

  @spec generate_master_plan(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def generate_master_plan(deal_id, intelligence_inputs) do
    GenServer.call(via_tuple(deal_id), {:generate_plan, intelligence_inputs}, 180_000)
  end

  @impl true
  def handle_call({:generate_plan, inputs}, _from, state) do
    :telemetry.execute(
      [:prismatic, :ma, :integration, :plan_generation],
      %{timestamp: System.monotonic_time()},
      %{deal_id: state.deal_id}
    )

    with {:ok, workstreams} <- WorkstreamBuilder.decompose(inputs, @workstreams),
         {:ok, graph} <- DependencyGraph.build(workstreams),
         {:ok, resources} <- ResourceOptimizer.allocate(graph, inputs[:resource_constraints]),
         {:ok, timeline} <- TimelineEngine.generate(graph, resources),
         {:ok, contingencies} <- ContingencyPlanner.develop(graph, inputs[:risk_assessment]) do
      master_plan = %{
        workstreams: workstreams,
        dependency_graph: graph,
        timeline: timeline,
        resources: resources,
        contingencies: contingencies,
        synergy_targets: SynergyTracker.define(inputs[:synergy_model]),
        confidence: compute_plan_confidence(inputs),
        version: increment_version(state),
        generated_at: DateTime.utc_now()
      }
      {:reply, {:ok, master_plan}, %{state | phase: :validation}}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [ma-financial-analyst](/agents/ma-financial-analyst/) | Receives financial projections for integration cost modeling | Inbound |
| [ma-tech-assessor](/agents/ma-tech-assessor/) | Consumes technology profiles for migration planning | Inbound |
| [ma-risk-assessor](/agents/ma-risk-assessor/) | Risk assessments inform contingency planning | Inbound |
| [ma-market-analyst](/agents/ma-market-analyst/) | Market dynamics shape commercial integration strategy | Inbound |
| [ma-enforcement-commander](/agents/ma-enforcement-commander/) | Integration plans validated against safety theorems | Outbound |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Planning pipeline [metrics](/glossary/metrics/) and progress tracking | Outbound |
| [SEADF](/glossary/seadf/) | Self-healing for planning pipeline failures | Bidirectional |

## Operational Workflow

The integration planner follows a six-phase planning lifecycle for each acquisition.

**Phase 1 -- Assessment**: Collect and synthesize intelligence inputs from all specialist M&A agents. Validate input completeness against minimum planning requirements. Identify information gaps that require additional investigation.

**Phase 2 -- Design**: Decompose integration into workstreams, model dependencies, allocate resources, and generate risk-adjusted timelines. Produce draft master plan for review.

**Phase 3 -- Validation**: Submit draft plan to enforcement commander for formal verification against Lean4 safety theorems. Validate resource feasibility with stakeholders. Stress-test timelines against risk scenarios.

**Phase 4 -- Approval**: Present validated plan for authorization. Record approval decisions with full audit trail. Lock baseline plan version.

**Phase 5 -- Execution**: Monitor integration progress against plan baselines. Track milestone completion, resource utilization, and synergy realization. Trigger contingency plans when deviation thresholds are exceeded.

**Phase 6 -- Monitoring**: Post-integration monitoring of synergy realization, operational stability, and integration debt resolution. Generate retrospective reports for organizational learning.

## NABLA Compliance

| Axiom | Integration Planning Application |
|-------|----------------------------------|
| Signal Plurality | Integration plans require validated inputs from minimum three specialist domains |
| Contradiction Preservation | Conflicting assessments across domains are surfaced in plan risk sections |
| Absence Informative | Missing intelligence inputs reduce plan confidence and trigger investigation |
| Time Decay | Intelligence inputs expire after configurable intervals; stale data blocks planning |
| Unknown Valid | Timeline confidence intervals express uncertainty explicitly |
| Source Independence | Independent domain assessments weighted higher in plan synthesis |
| Provenance Mandatory | Every plan element traces to source intelligence with full attribution |

## Configuration

```elixir
config :prismatic_ma, Prismatic.MA.IntegrationPlanner,
  plan_generation_timeout_ms: 180_000,
  min_input_domains: 3,
  timeline_confidence_level: 0.80,
  resource_buffer_factor: 1.15,
  synergy_tracking_enabled: true,
  contingency_coverage: :comprehensive,
  max_plan_versions: 50,
  telemetry_prefix: [:prismatic, :ma, :integration]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_input_domains` | 3 | Minimum specialist domains required for plan generation |
| `timeline_confidence_level` | 0.80 | Target confidence for timeline projections |
| `resource_buffer_factor` | 1.15 | Resource allocation buffer (15% reserve) |
| `contingency_coverage` | `:comprehensive` | Contingency plan depth |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Master plan generation | < 120s | 65s (P95) |
| Dependency graph construction | < 5s | 2.3s (P95) |
| Resource optimization | < 30s | 18s (P95) |
| Timeline generation | < 10s | 4.5s (P95) |
| Plan version storage | < 500ms | 120ms (P95) |
| Concurrent deal capacity | 20+ | 25 tested |

## Related Resources

- [ma-enforcement-commander](/agents/ma-enforcement-commander/) -- Plan compliance verification
- [ma-financial-analyst](/agents/ma-financial-analyst/) -- Financial input for cost modeling
- [ma-tech-assessor](/agents/ma-tech-assessor/) -- Technology profiles for migration planning
- [ma-risk-assessor](/agents/ma-risk-assessor/) -- Risk inputs for contingency planning
- [ma-market-analyst](/agents/ma-market-analyst/) -- Market dynamics for commercial strategy
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for evidence-based planning
- [SEADF](/glossary/seadf/) -- Self-healing subsystem integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)