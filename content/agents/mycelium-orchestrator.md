+++
title = "Mycelium Orchestrator"
weight = 271
[extra]
domain = "orchestration"
level = "L2"
description = "Advanced multi-agent coordination for IR/PVM workflows with distributed execution and intelligent task distribution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "otp", "genserver", "supervision-tree", "dynamic-supervisor", "message-passing", "no-doubts", "seadf", "pvm", "telemetry"]
domain_normalized = "orchestration"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mycelium", "Orchestrator", "Advanced", "IRPVM", "agents", "agent", "Prismatic Platform", "Workflow", "Mycelium Orchestrator"]
tags = ["agents", "agent", "mycelium-orchestrator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Mycelium Orchestrator - Prismatic Platform"
+++

## Overview

The Mycelium Orchestrator operates as an L2 Tactical Operations authority within the Prismatic Platform's orchestration domain, providing advanced multi-agent coordination for Incident Response (IR) and Process Virtual Machine ([PVM](/glossary/pvm/)) workflows. While the Mycelial Network Coordinator manages the communication infrastructure itself, the Mycelium Orchestrator utilizes that infrastructure to coordinate complex, multi-step operational workflows that require the participation of agents across multiple domains. This agent translates high-level workflow definitions into distributed execution plans, assigns tasks to qualified agents, manages execution dependencies, and aggregates results into coherent workflow outputs.

Built on the [AIAD](/glossary/aiad/) standard and implemented as an [OTP](/glossary/otp/) [GenServer](/glossary/genserver/) within the platform's [supervision tree](/glossary/supervision-tree/), the orchestrator manages workflow execution as a directed acyclic graph (DAG) of tasks with dependency relationships. Each task in a workflow specifies its agent requirements (domain expertise, authority level, capability set), input dependencies (outputs from prior tasks that must be available), and execution constraints (timeout limits, quality thresholds, parallelism rules). The [NO DOUBTS](/glossary/no-doubts/) principle governs task assignment: agents are selected for tasks based on measured capability profiles rather than static role assignments, ensuring that each task is handled by the agent best qualified to execute it.

## Theoretical Foundations

Workflow orchestration in multi-agent systems draws from distributed computing theory, DAG scheduling algorithms, and process algebra. The orchestrator implements a modified version of the Heterogeneous Earliest Finish Time (HEFT) algorithm for task scheduling, adapted to account for the dynamic availability and varying capabilities of agents in the ecosystem. HEFT provides near-optimal scheduling by prioritizing tasks based on their position in the critical path and assigning them to agents that minimize expected completion time.

The Process Virtual Machine abstraction provides a language-agnostic workflow definition framework where workflows are expressed as state machines with well-defined transitions, guards, and actions. This PVM approach enables workflow definitions to be composed, nested, and extended without modifying the orchestrator's core scheduling logic. IR workflows (which follow established incident response playbooks) and analytical workflows (which follow data processing pipelines) share the same PVM execution substrate.

Distributed execution introduces coordination challenges including partial failure handling, deadline management, and result consistency. The orchestrator applies the saga pattern for long-running workflows, where each task has a corresponding compensating action that is executed if subsequent tasks fail, enabling graceful rollback of partially-completed workflows.

## Operational Domain

The orchestration domain covers all multi-agent workflow execution within the platform. The orchestrator manages concurrent execution of multiple workflows, each progressing independently through their task DAGs. Resource management ensures that workflow execution does not monopolize agent capacity, with configurable concurrency limits per agent and per domain that prevent individual workflows from starving other operations.

Workflow definitions are stored in a registry and can be instantiated with specific parameters. The orchestrator maintains a workflow execution log that records every task assignment, execution result, timing measurement, and state transition for audit and debugging purposes. This log is persisted to [ETS](/glossary/ets/) for immediate access and periodically checkpointed to durable storage for historical analysis.

## Key Capabilities

- **DAG-based workflow execution** -- Manages workflow execution as directed acyclic graphs of tasks with dependency relationships, executing independent tasks in parallel while respecting sequential dependencies
- **Intelligent task assignment** -- Selects executing agents based on measured capability profiles, current availability, historical performance, and domain expertise, optimizing for earliest expected completion across the workflow DAG
- **PVM workflow support** -- Executes workflows defined in the Process Virtual Machine abstraction, supporting state machine-based workflow definitions with guards, transitions, and composable sub-workflows
- **IR playbook execution** -- Manages incident response workflows that follow established playbooks, coordinating evidence collection, analysis, containment, and remediation tasks across specialized agents
- **Distributed execution management** -- Coordinates task execution across agents running on different [BEAM](/glossary/beam/) nodes, handling network partitions, agent failures, and result aggregation in distributed environments
- **Saga-pattern rollback** -- Implements compensating transactions for long-running workflows, enabling graceful rollback when task failures make workflow completion impossible
- **Deadline management** -- Tracks workflow and task-level deadlines, escalating or reassigning tasks that risk missing their time constraints
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed workflow monitoring and automatic intervention for stalled or failing executions
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing workflow metrics including execution duration, parallelism utilization, task success rates, and agent utilization

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](/glossary/tactical-execution/) authority for workflow orchestration with the ability to assign tasks to L3 and L4 agents within their operational domains.

## Orchestration Architecture

The orchestrator implements a three-layer architecture. The **workflow layer** manages the lifecycle of workflow instances -- creation, scheduling, execution, completion, and archival. Each workflow instance maintains its own state machine that tracks progress through the task DAG. The **task layer** manages individual task execution -- assignment to agents, input preparation, execution monitoring, result collection, and output validation. The **agent layer** interfaces with the platform's agent infrastructure, querying agent availability and capabilities, dispatching task assignments through [message passing](/glossary/message-passing/), and collecting execution results.

A [Dynamic Supervisor](/glossary/dynamic-supervisor/) manages per-workflow execution processes, enabling the orchestrator to scale with concurrent workflow count. [Process isolation](/glossary/process-isolation/) ensures that a workflow execution failure does not affect other concurrent workflows. The orchestrator itself runs as a singleton [GenServer](/glossary/genserver/) that manages the global workflow queue and agent assignment state.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/orchestrate workflow` | Submit a workflow definition for execution | L2+ |
| `/orchestrate status` | Display current workflow execution status with task-level details | L2+ |
| `/orchestrate cancel` | Cancel a running workflow with compensating action execution | L2+ |
| `/orchestrate history` | Show completed workflow execution history with metrics | L2+ |
| `/orchestrate agents` | Display agent availability and capability profiles for task assignment | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [mycelial-network-coordinator](/agents/mycelial-network-coordinator/) | Uses network infrastructure for distributed task communication |
| [supreme-coordinator](/agents/supreme-coordinator/) | Receives high-level workflow definitions and strategic execution directives |
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Workflow execution outcomes inform session debrief and learning |
| [performance-benchmarking-agent](/agents/performance-benchmarking-agent/) | Benchmark data calibrates task duration estimates for scheduling |

## Failure Handling

The orchestrator implements comprehensive failure handling at multiple levels. **Task-level failures** trigger automatic retry with configurable retry limits and exponential backoff. If retries are exhausted, the task is reassigned to an alternative qualified agent. If no alternative is available, the workflow's saga compensating actions are triggered for graceful rollback. **Agent-level failures** (agent process crash) are detected through process monitoring and trigger immediate task reassignment. **Workflow-level failures** (unrecoverable task failures after all alternatives exhausted) trigger full saga rollback and workflow failure reporting.

## Enforcement

Workflow execution complies with the [NO MERCY](/glossary/no-mercy/) doctrine: no incomplete workflow is marked as successful, every task output must meet defined quality thresholds, and workflow deadlines are enforced without exception. The [NO DOUBTS](/glossary/no-doubts/) principle requires that task assignments are evidence-based (grounded in measured agent capabilities), workflow results carry full execution provenance, and all quality claims are verifiable through the execution log. The [Trinity Gate](/glossary/trinity-gate/) validates workflow outputs for structural, logical, and formal consistency.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)