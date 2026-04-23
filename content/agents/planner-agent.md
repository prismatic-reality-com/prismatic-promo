+++
title = "Planner Agent"
weight = 302
[extra]
domain = "strategic"
level = "L3"
description = "The Planner Agent creates detailed project roadmaps, dependency graphs, and execution plans with complete integration across EVERY AIAD feature. This agent leverages meta-evolut..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "telemetry"]
domain_normalized = "strategic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Planner", "Agent", "EVERY", "AIAD", "agents", "Prismatic Platform", "Planner Agent", "The Planner", "Tasks"]
tags = ["agents", "agent", "planner-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Planner Agent - Prismatic Platform"
+++

## Overview

The Planner Agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's strategic domain, responsible for creating detailed project roadmaps, dependency graphs, and execution plans that coordinate work across the platform's 90+ applications and 400+ agents. This agent transforms high-level objectives into structured, executable plans with explicit dependency ordering, resource allocation, risk assessment, and milestone tracking. Every plan integrates across all [AIAD](/glossary/aiad/) features -- agents, commands, pipelines, and policies -- ensuring that execution pathways leverage the full capability of the platform.

Built on the [AIAD](/glossary/aiad/) standard and deeply integrated with the [SEADF](/glossary/seadf/) evolutionary framework, the Planner Agent leverages meta-evolutionary patterns to optimize planning strategies over time. Plans are not static artifacts -- they are living documents that adapt as execution progresses, incorporating feedback from completed tasks and adjusting timelines based on actual velocity. The [NABLA Infinity](/glossary/nabla-infinity/) framework ensures that planning assumptions are explicitly stated and tracked, with confidence levels assigned to timeline estimates.

## Operational Domain

The strategic planning domain covers all project coordination activities from initial scoping through execution tracking to retrospective analysis. The Planner Agent maintains a dependency graph that maps all in-flight work items, their interdependencies, resource requirements, and critical path relationships. Plans span multiple granularity levels: strategic roadmaps (months), milestone plans (weeks), sprint plans (days), and tactical task sequences (hours).

| Planning Level | Time Horizon | Granularity | Stakeholders |
|---------------|-------------|-------------|-------------|
| Strategic Roadmap | 3-12 months | Milestones, themes | Platform leadership |
| Milestone Plan | 2-6 weeks | Features, epics | Domain commanders |
| Sprint Plan | 1-2 weeks | Tasks, stories | Agent teams |
| Tactical Sequence | Hours to days | Individual steps | Executing agents |
| Emergency Plan | Immediate | Critical actions | Supreme authority |

## Key Capabilities

- **Dependency graph construction** -- Builds directed acyclic graphs (DAGs) of work item dependencies, identifying critical paths, parallelizable work streams, and bottleneck resources
- **Resource allocation optimization** -- Assigns agents and computational resources to tasks based on capability matching, availability, and historical velocity data
- **Risk-adjusted timeline estimation** -- Produces timeline estimates with confidence intervals based on task complexity, dependency depth, and historical completion velocity
- **Plan adaptation** -- Continuously adjusts plans based on execution feedback, automatically rescheduling downstream tasks when upstream work completes ahead of or behind schedule
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed plan monitoring and proactive bottleneck detection
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing planning velocity metrics, dependency resolution times, and plan accuracy scores

## Planning Engine

```elixir
defmodule Prismatic.Planner.Engine do
  @moduledoc """
  Creates and manages execution plans with dependency resolution,
  resource allocation, and adaptive timeline management.
  """

  alias Prismatic.Planner.{DependencyGraph, ResourceAllocator, TimelineEstimator}

  @type plan :: %{
    id: String.t(),
    objective: String.t(),
    tasks: [task()],
    dependencies: DependencyGraph.t(),
    timeline: timeline(),
    status: :draft | :active | :completed | :blocked
  }

  @spec create_plan(objective :: String.t(), requirements :: map()) :: {:ok, plan()}
  def create_plan(objective, requirements) do
    tasks = decompose_objective(objective, requirements)
    graph = DependencyGraph.build(tasks)
    critical_path = DependencyGraph.critical_path(graph)

    allocations = ResourceAllocator.assign(tasks, %{
      agents: available_agents(),
      priorities: requirements.priorities,
      constraints: requirements.constraints
    })

    timeline = TimelineEstimator.estimate(graph, allocations, %{
      confidence_level: 0.80,
      velocity_source: :historical,
      risk_buffer: 1.2
    })

    plan = %{
      id: Ecto.UUID.generate(),
      objective: objective,
      tasks: tasks,
      dependencies: graph,
      timeline: timeline,
      critical_path: critical_path,
      allocations: allocations,
      status: :draft
    }

    emit_plan_telemetry(plan)
    {:ok, plan}
  end

  @spec adapt_plan(plan(), feedback :: map()) :: {:ok, plan()}
  def adapt_plan(plan, feedback) do
    updated_tasks = apply_feedback(plan.tasks, feedback)
    updated_graph = DependencyGraph.rebuild(updated_tasks)
    updated_timeline = TimelineEstimator.revise(plan.timeline, feedback)

    {:ok, %{plan |
      tasks: updated_tasks,
      dependencies: updated_graph,
      timeline: updated_timeline
    }}
  end
end
```

## Plan Quality Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Estimation Accuracy | Actual vs. estimated completion times | > 80% within 20% of estimate |
| Dependency Satisfaction | Tasks completing in correct order | 100% (zero violations) |
| Resource Utilization | Agent allocation efficiency | > 70% productive utilization |
| Plan Stability | Frequency of plan revisions | < 2 major revisions per sprint |
| Critical Path Visibility | Percentage of work on identified critical path | 100% tracked and monitored |
| Bottleneck Detection | Time to identify blocked work streams | < 1 hour detection latency |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to create execution plans, assign tasks to agents, and adjust priorities across all platform work streams.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/plan create` | Generate execution plan from specified objective and requirements | L3+ |
| `/plan status` | Display current plan status with progress and blockers | L3+ |
| `/plan adapt` | Adjust active plan based on execution feedback and velocity data | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [evolution-orchestrator-supreme](/agents/evolution-orchestrator-supreme/) | Aligns plans with evolutionary priorities and fitness goals |
| [code-quality-commander](/agents/code-quality-commander/) | Quality gates integrated into plan milestones |
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Session outcomes feed plan velocity and estimation models |
| [service-mesh-specialist](/agents/service-mesh-specialist/) | Infrastructure capacity informs resource allocation decisions |

## NABLA Infinity Integration

All planning assumptions comply with [NABLA Infinity](/glossary/nabla-infinity/) axioms. Timeline estimates carry explicit confidence intervals and provenance chains linking estimates to historical velocity data. The [Trinity Gate](/glossary/trinity-gate/) validates that plan structures maintain consistency -- no circular dependencies, no unresolvable resource conflicts, and no missing prerequisite tasks. Planning decisions based on uncertain information are explicitly marked with their confidence levels.

## Dependency Graph Analysis

The Planner Agent constructs directed acyclic graphs (DAGs) to model work item dependencies. The graph analysis provides several critical insights for plan execution.

### Critical Path Identification

The critical path is the longest sequence of dependent tasks from plan start to completion. Any delay on the critical path directly delays the entire plan. The Planner Agent identifies the critical path through topological sorting and forward/backward pass analysis, computing the earliest start time, latest start time, and float (slack) for each task. Tasks with zero float are on the critical path and receive priority resource allocation and monitoring attention.

### Parallelism Analysis

By analyzing the dependency graph, the Planner Agent identifies the maximum degree of parallelism available at each stage of the plan. This informs resource allocation decisions: if 8 tasks can execute in parallel at a given point but only 5 agents are available, the planner must either accept sequential execution of 3 tasks or request additional agent allocation. The parallelism profile (maximum concurrent tasks over the plan timeline) guides capacity planning for the entire execution period.

### Bottleneck Detection

Bottlenecks occur when many downstream tasks depend on a single upstream task, creating a funnel that constrains the plan's throughput. The Planner Agent detects bottlenecks by computing the fan-out degree of each task (how many tasks depend on its completion). Tasks with high fan-out receive elevated priority and are flagged for risk monitoring because their delay would cascade to the maximum number of downstream tasks.

## Risk-Adjusted Estimation

Timeline estimates produced by the Planner Agent are not single-point predictions. Instead, each estimate includes three values: the optimistic estimate (assuming no impediments), the most likely estimate (based on historical velocity), and the pessimistic estimate (assuming reasonable worst-case delays). These three values are combined using a PERT-like formula to produce a risk-adjusted estimate with an associated confidence interval.

The confidence interval widens for tasks with high uncertainty (novel work without historical precedent, tasks with many external dependencies) and narrows for well-understood, repeatable tasks. The Planner Agent communicates confidence levels explicitly so that plan consumers understand the reliability of timeline commitments. For plans with aggregate confidence below 70%, the agent recommends scope reduction or timeline extension rather than committing to an unreliable schedule.

## Plan Adaptation Loop

Plans are living documents that adapt as execution progresses. The Planner Agent implements a continuous adaptation loop that compares actual progress against the plan baseline. When a task completes ahead of schedule, the agent evaluates whether downstream tasks can be advanced. When a task falls behind, the agent recalculates the critical path and timeline, potentially reassigning resources from non-critical tasks to the delayed critical path. The adaptation loop runs automatically at configurable intervals (default: every 4 hours during active execution) and produces adaptation reports that document any changes to the plan baseline.

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that all plans include measurable success criteria, explicit dependency ordering, and quality gates at every milestone. No task is marked complete without satisfying its acceptance criteria. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that planning decisions are based on evidence (historical velocity, measured capacity, verified dependencies) rather than optimistic assumptions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)