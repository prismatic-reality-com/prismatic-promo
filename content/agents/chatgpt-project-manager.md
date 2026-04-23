+++
title = "chatgpt-project-manager"
weight = 74
[extra]
domain = "ai-project-lifecycle-management"
level = "L3"
description = "Leverages ChatGPT capabilities to coordinate project planning, task decomposition, milestone tracking, and risk identification for AI-related development initiatives across the platform, combining external AI perspective with internal telemetry and velocity data."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker", "no-doubts", "telemetry", "no-mercy", "time-decay", "osint", "seadf"]
domain_normalized = "llm"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-project-manager", "Leverages", "ChatGPT", "AI-related", "agents", "agent", "Prismatic Platform", "Project Manager", "Phase", "The ChatGPT"]
tags = ["agents", "agent", "chatgpt-project-manager", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-project-manager - Prismatic Platform"
+++

## Executive Summary

The ChatGPT Project Manager operates as an L3 [strategic command](/glossary/strategic-command/) agent within the AI Project Lifecycle Management domain of the Prismatic Platform. This agent leverages ChatGPT's capabilities to coordinate project planning, task decomposition, and milestone tracking for AI-related development initiatives across the platform. It translates high-level project objectives into structured work breakdowns that align with the platform's [AIAD](/glossary/aiad/) agent ecosystem and evolutionary development methodology.

In a platform where AI development spans multiple concurrent workstreams -- from [OSINT](/glossary/osint/) intelligence pipelines to compliance automation to ecosystem evolution -- project coordination complexity exceeds what traditional project management tools can handle effectively. The ChatGPT Project Manager combines ChatGPT's broad knowledge of software project management practices with the platform's internal [telemetry](/glossary/telemetry/) and velocity data. This synthesis generates project plans that account for both industry best practices and platform-specific constraints such as OTP supervision tree dependencies, umbrella application build order requirements, and quality gate compliance timelines.

## Architecture

The Project Manager implements a three-layer architecture spanning planning intelligence, execution tracking, and retrospective analysis.

```
+----------------------------------------------------------------------+
|         ChatGPT Project Manager (L3)                                 |
+----------------------------------------------------------------------+
|  Planning Intelligence                                                |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Task Decomposer    |  | Dependency Mapper  |  | Effort Estimator | |
|  | (WBS generation)   |  | (Critical path)    |  | (Velocity-based) | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Execution Tracker                                    |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  |  | Progress Mon.|  | Risk Detector    |  | Milestone Tracker |   |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Retrospective Engine      |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Outcome Analysis   |  | Lesson Capture     |  | Velocity Update  | |
|  | (Plan vs actual)   |  | (Knowledge base)   |  | (Model refresh)  | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Planning Intelligence layer uses ChatGPT consultations augmented with platform velocity data to generate work breakdown structures, identify dependencies, and estimate effort. The Execution Tracker monitors progress against plans, detects emerging risks, and tracks milestone completion. The Retrospective Engine captures lessons from completed projects and feeds them back into the planning intelligence models.

## Operational Domain

The AI Project Lifecycle Management domain covers the full spectrum of AI project coordination, from initial scoping through delivery validation. This includes task prioritization, dependency mapping, resource allocation recommendations, and progress tracking. The ChatGPT Project Manager operates alongside the platform's native planning agents, providing complementary analysis that benefits from cross-industry project management intelligence.

Project management in the Prismatic ecosystem faces unique challenges. The umbrella architecture with 90 applications creates complex inter-application dependency chains. The AIAD agent ecosystem with 434 agents introduces coordination overhead that traditional project management frameworks do not account for. Quality gates that enforce zero-warning compilation and 100% test coverage create non-negotiable timeline constraints. The ChatGPT Project Manager factors all these platform-specific constraints into its planning outputs.

The domain also interfaces with GitLab for issue tracking and milestone management. Project plans generated by this agent map directly to GitLab milestones and issues, enabling automated progress tracking through commit and merge request activity.

## Core Capabilities

**AI-Powered Task Decomposition** breaks complex project objectives into manageable work items with estimated effort, dependencies, and acceptance criteria. The decomposition process uses ChatGPT consultations informed by the platform's historical work item data. Each generated task includes a clear objective, acceptance criteria that map to testable conditions, dependency links to other tasks, and effort estimates calibrated against the platform's velocity history. Decomposition depth is controlled by configurable granularity settings -- strategic planning uses coarse-grained decomposition while sprint planning uses fine-grained breakdown.

**Milestone Tracking and Forecasting** uses historical velocity data and current progress signals to project completion timelines with confidence intervals. The forecasting model tracks actual versus estimated completion times, identifies systematic estimation biases (the platform historically underestimates migration tasks by 30%), and adjusts future estimates accordingly. Forecasts include best-case, expected, and worst-case projections with quantified probabilities based on historical variance patterns.

**Risk Identification** analyzes project plans for common failure patterns including resource bottlenecks, dependency conflicts, and scope creep indicators. The risk detection system uses ChatGPT consultations to evaluate plans against known software project failure modes, then augments these external assessments with platform-specific risk factors: applications with high coupling scores, agents with known coordination overhead, and quality domains that historically require extra remediation time.

**Cross-Workstream Coordination** identifies interaction points between concurrent project streams and flags potential conflicts before they materialize. In a platform with multiple active milestones (MVP Prismatic Perimeter, Czech Registry Autocrawler, AI Drift MVP, Hawkeye Security), cross-stream dependencies are common and difficult to detect. The coordinator maintains a dependency graph across all active workstreams and alerts when planned work in one stream may impact another.

**Retrospective Analysis** generates structured post-project assessments that capture lessons learned and feed them back into the platform's knowledge base. Retrospectives analyze estimation accuracy, risk prediction effectiveness, dependency management success, and quality gate impact on timelines. Extracted lessons are stored in the platform's session context system for consumption by future planning sessions.

## Implementation

```elixir
defmodule PrismaticChatGPT.ProjectManager do
  @moduledoc """
  L3 Strategic Command agent leveraging ChatGPT for project
  planning, tracking, and retrospective analysis.
  """

  use GenServer

  alias PrismaticChatGPT.{ConsultationCoordinator, ContextManager}
  alias PrismaticProject.{VelocityTracker, RiskDetector, MilestoneManager}

  defstruct [
    :active_projects,
    :velocity_model,
    :risk_registry,
    :lesson_library
  ]

  @spec decompose_project(map()) :: {:ok, [map()]} | {:error, term()}
  def decompose_project(objective) do
    GenServer.call(__MODULE__, {:decompose, objective}, :timer.seconds(60))
  end

  @spec forecast_milestone(String.t()) :: {:ok, map()} | {:error, term()}
  def forecast_milestone(milestone_id) do
    GenServer.call(__MODULE__, {:forecast, milestone_id})
  end

  @impl true
  def handle_call({:decompose, objective}, _from, state) do
    velocity_context = VelocityTracker.historical_summary(state.velocity_model)

    consultation_request = %{
      objective: :task_decomposition,
      domain: :project_management,
      context: %{
        project_objective: objective,
        velocity_data: velocity_context,
        platform_constraints: platform_constraints()
      }
    }

    case ConsultationCoordinator.start_consultation(consultation_request) do
      {:ok, session_id} ->
        {:ok, result} = ConsultationCoordinator.await_result(session_id)
        tasks = parse_decomposition(result, state.velocity_model)
        {:reply, {:ok, tasks}, state}

      {:error, _reason} = error ->
        {:reply, error, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with specialized operational command authority. The Project Manager exercises authority over project planning outputs, milestone tracking, and risk assessment reporting. It coordinates with higher-authority agents for strategic priority decisions and with domain specialists for accurate effort estimation.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [chatgpt-bridge-commander](/agents/chatgpt-bridge-commander/) | Integration Bridge | Manages ChatGPT API communication protocols and [rate limiting](/glossary/rate-limiting/) |
| [chatgpt-workflow-orchestrator](/agents/chatgpt-workflow-orchestrator/) | Workflow Partner | Coordinates automated workflow execution for project task automation |
| [chatgpt-context-manager](/agents/chatgpt-context-manager/) | Context Authority | Maintains project context across ChatGPT consultation interactions |
| [chatgpt-consultation-coordinator](/agents/chatgpt-consultation-coordinator/) | Consultation Management | Manages multi-turn planning consultation sessions |
| [supreme-coordinator](/agents/supreme-coordinator/) | Strategic Authority | Provides strategic priorities that guide project planning decisions |

## Operational Workflow

**Phase 1 -- Project Scoping**: High-level objectives are received from strategic command agents. The project manager assembles relevant context including historical velocity data, active milestone status, available agent capacity, and quality gate requirements.

**Phase 2 -- AI-Augmented Decomposition**: ChatGPT consultations produce initial work breakdown structures informed by cross-industry best practices. These structures are then refined with platform-specific constraints: OTP dependency order, umbrella compilation chain, quality gate sequencing.

**Phase 3 -- Estimation and Scheduling**: Task estimates are calibrated against the platform's velocity model, adjusting for known estimation biases. Dependencies are analyzed to identify the critical path, and tasks are scheduled to minimize overall project duration while respecting resource constraints.

**Phase 4 -- Continuous Monitoring**: Once execution begins, the project manager tracks progress through GitLab issue activity, commit frequency, and quality gate passage rates. Deviations from plan trigger risk assessments and plan adjustment recommendations.

**Phase 5 -- Retrospective Capture**: Upon project completion, the retrospective engine compares planned versus actual outcomes, extracts estimation improvement data, captures lessons learned, and updates the velocity model for future planning accuracy.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Task decomposition quality | > 90% acceptance | 93% |
| Estimation accuracy (within 20%) | > 80% | 82% |
| Risk prediction recall | > 75% | 78% |
| Cross-stream conflict detection | > 90% | 91% |
| Retrospective lesson extraction | > 85% | 88% |
| Forecast confidence calibration | > 80% | 83% |

## NABLA Compliance

**Time Decay**: The [Time Decay](/glossary/time-decay/) axiom ensures that stale project data is flagged and refreshed before influencing planning decisions. Velocity data older than 90 days receives diminished weighting. Milestone forecasts are automatically refreshed when underlying data changes.

**Signal Plurality**: Project estimates draw from multiple signal sources: historical velocity data, ChatGPT cross-industry knowledge, developer capacity assessments, and quality gate historical passage rates. No single source dominates planning decisions.

**Provenance Mandatory**: Every project plan element carries traceable provenance indicating which data sources and ChatGPT consultation sessions contributed to its generation. This enables plan audit and assumption verification.

## Enforcement

All project management operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Project plans must be evidence-based, with estimates derived from historical velocity data rather than optimistic speculation. No milestone is declared complete without verified acceptance criteria. The NABLA Time Decay axiom ensures that stale project data is flagged and refreshed before influencing planning decisions.

## Related Resources

- [chatgpt-consultation-coordinator](/agents/chatgpt-consultation-coordinator/) -- Multi-turn consultation management
- [chatgpt-workflow-orchestrator](/agents/chatgpt-workflow-orchestrator/) -- Workflow automation
- [chatgpt-context-manager](/agents/chatgpt-context-manager/) -- Context optimization
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-domain intelligence
- [AIAD Standard](/glossary/aiad/) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)