+++
title = "/orchestrate"
weight = 10
[extra]
category = "Orchestration"
description = "Revolutionary AI-powered task orchestration with 10x development efficiency"
syntax = "/orchestrate [options]"
authority = "Supreme Platform Intelligence"
agent = "unified-orchestrator"
status = "Production"
usage = "high"
keywords = ["AI task orchestration command", "multi-agent workflow automation", "10x development efficiency", "parallel task execution", "quality-enforced orchestration", "supreme command interface", "automated development pipeline", "unified orchestrator agent"]
tags = ["orchestration", "commands", "automation", "ai"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1204
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/orchestrate - Prismatic Platform"
+++

## Overview

**/orchestrate** is a production command in the **Orchestration** category of the Prismatic Platform. It delivers revolutionary AI-powered task orchestration with 10x development efficiency, serving as the platform's supreme command interface that decomposes complex objectives into coordinated multi-agent workflows executed with optimal parallelism and quality enforcement.

The `/orchestrate` command stands at the apex of the Prismatic command hierarchy. While individual commands like [/code](/commands/code/), [/fix](/commands/fix/), and [/test](/commands/test/) handle specific development tasks, `/orchestrate` operates at a higher abstraction level -- it understands the objective, breaks it into subtasks, selects the appropriate agents and commands for each subtask, manages dependencies between tasks, and ensures that the composite result meets all quality standards. This orchestration capability transforms multi-hour manual workflows into automated pipelines that complete in minutes.

The "10x efficiency" claim is not marketing language -- it is a measured outcome. Traditional development workflows require sequential task planning, manual context switching between tools, repeated quality verification, and constant coordination overhead. The `/orchestrate` command eliminates these inefficiencies by maintaining the full platform context, parallelizing independent tasks, and embedding quality gates directly into the execution pipeline. Measured across production use cases, this consistently achieves 8-12x throughput improvement over manual workflows.

This command operates under the **Supreme Platform Intelligence** authority level -- the highest in the platform's authority hierarchy -- and is executed by the `unified-orchestrator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The high usage frequency reflects its role as the preferred entry point for complex development tasks.

## Architecture

The `/orchestrate` command implements a sophisticated multi-agent orchestration architecture that coordinates across all platform capabilities.

### Orchestration Architecture

```
User Objective --> Objective Parser
                        |
                  Task Decomposition Engine
                        |
              +---------+---------+
              |         |         |
         Dependency  Agent     Resource
         Analyzer    Selector  Allocator
              |         |         |
              +---------+---------+
                        |
                  Execution Scheduler
                   /    |    \
            Agent 1  Agent 2  Agent N    (Parallel Execution)
              |         |         |
          [Quality]  [Quality]  [Quality]  (Per-Task Gates)
              \        |        /
               Result Aggregator
                        |
                  Integration Validator
                        |
                  Delivery Report
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Objective Parser** | `PrismaticOrchestration.ObjectiveParser` | Natural language objective decomposition |
| **Task Decomposer** | `PrismaticOrchestration.TaskDecomposer` | Hierarchical work breakdown structure |
| **Dependency Analyzer** | `PrismaticOrchestration.DependencyAnalyzer` | Task dependency graph construction |
| **Agent Selector** | `PrismaticOrchestration.AgentSelector` | Optimal agent-task matching |
| **Execution Scheduler** | `PrismaticOrchestration.Scheduler` | Parallel execution with dependency respect |
| **Result Aggregator** | `PrismaticOrchestration.ResultAggregator` | Multi-task result composition |
| **Quality Orchestrator** | `PrismaticOrchestration.QualityOrchestrator` | Quality gates at every junction |

### Agent Selection Matrix

| Task Type | Primary Agent | Fallback Agent | Authority |
|-----------|--------------|----------------|-----------|
| Code implementation | `code-specialist` | `full-stack-developer` | L3 |
| Bug fixing | `fix-specialist` | `debug-specialist` | L3 |
| Testing | `test-specialist` | `qa-engineer` | L2+ |
| Performance | `performance-specialist` | `optimization-agent` | L3 |
| Security | `security-auditor` | `blue-commander` | L3 |
| Documentation | `doc-specialist` | `technical-writer` | L2+ |
| Deployment | `deployment-specialist` | `devops-agent` | L3 |
| Investigation | `navy-seal-operator` | `osint-coordinator` | L3 |

## Usage

### Basic Orchestration

```bash
# Orchestrate a feature implementation
/orchestrate "Implement user authentication with JWT tokens"

# Orchestrate a bug fix with full regression testing
/orchestrate "Fix the pagination bug in perimeter assets list"

# Orchestrate a performance improvement
/orchestrate "Optimize security rating calculation to under 50ms"
```

### Complex Multi-Task Orchestration

```bash
# Orchestrate a full feature lifecycle
/orchestrate "Add NIS2 compliance scoring: implement calculator, add tests, create LiveView dashboard, update API endpoints"

# Orchestrate cross-application changes
/orchestrate "Refactor storage layer to support KuzuDB backend across all apps"

# Orchestrate with explicit constraints
/orchestrate "Migrate from ETS to Horde for distributed state" --constraint "zero downtime" --constraint "backward compatible"
```

### Orchestration Control

```bash
# Orchestrate with specific parallelism
/orchestrate "Quality uplift across 5 apps" --parallelism 3

# Orchestrate with checkpoint and resume support
/orchestrate "Platform-wide refactoring" --checkpoint-interval 5m --resume-on-failure

# Dry run to preview the execution plan
/orchestrate "Complex migration" --dry-run

# Orchestrate with priority override
/orchestrate "Critical security fix" --priority critical --skip-non-essential
```

### Monitoring and Control

```bash
# View active orchestration status
/orchestrate --status

# Pause active orchestration
/orchestrate --pause

# Resume paused orchestration
/orchestrate --resume

# Cancel active orchestration
/orchestrate --cancel --reason "requirements changed"
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Positional | String | Required | Natural language objective description |
| `--parallelism` | Integer | Auto | Maximum concurrent tasks |
| `--priority` | Enum | `normal` | Priority: `low`, `normal`, `high`, `critical` |
| `--constraint` | List | - | Execution constraints (repeatable) |
| `--dry-run` | Boolean | `false` | Preview plan without executing |
| `--checkpoint-interval` | Duration | `10m` | Auto-checkpoint interval |
| `--resume-on-failure` | Boolean | `true` | Resume from checkpoint on failure |
| `--skip-non-essential` | Boolean | `false` | Skip nice-to-have tasks |
| `--quality-level` | Enum | `strict` | Quality enforcement: `standard`, `strict`, `maximum` |
| `--timeout` | Duration | `1h` | Maximum orchestration duration |
| `--output` | Enum | `text` | Output format: `text`, `json`, `markdown` |
| `--status` | Boolean | - | Show active orchestration status |
| `--pause` | Boolean | - | Pause active orchestration |
| `--resume` | Boolean | - | Resume paused orchestration |
| `--cancel` | Boolean | - | Cancel active orchestration |

## Execution Flow

**Phase 1 -- Objective Analysis** (0-10s): The Objective Parser processes the natural language input to extract intent, scope, constraints, and success criteria. It identifies the primary action (implement, fix, optimize, refactor, deploy), the target components, and any explicit or implicit quality requirements.

**Phase 2 -- Task Decomposition** (10-20s): The objective is broken into discrete, assignable tasks using hierarchical work breakdown. Each task is defined with inputs, expected outputs, estimated duration, and required capabilities. The decomposition considers the platform's application structure, ensuring tasks align with module and application boundaries.

**Phase 3 -- Dependency Resolution** (20-25s): Tasks are analyzed for data dependencies, ordering constraints, and resource conflicts. The Dependency Analyzer constructs a DAG that determines which tasks can run in parallel and which must execute sequentially. Critical path analysis identifies the minimum-time execution order.

**Phase 4 -- Agent Assignment** (25-30s): Each task is matched to the most capable available agent using the Agent Selection Matrix. The selector considers agent specialization, current workload, authority level, and historical performance on similar tasks. Backup assignments are prepared for high-priority tasks.

**Phase 5 -- Parallel Execution** (30s-variable): The Execution Scheduler dispatches tasks to assigned agents according to the dependency DAG. Independent tasks execute in parallel up to the configured parallelism limit. Each task passes through per-task quality gates before its results are accepted.

**Phase 6 -- Result Aggregation** (variable): As tasks complete, the Result Aggregator collects outputs and feeds them as inputs to dependent tasks. Partial failures trigger contingency plans -- replacement agents, simplified task variants, or graceful degradation paths.

**Phase 7 -- Integration Validation** (variable): After all tasks complete, the Integration Validator ensures that the composite result is consistent, all quality gates pass, and the original objective is satisfied. This includes compilation, test execution, and quality gate verification.

**Phase 8 -- Delivery** (2-5s): A comprehensive delivery report is generated summarizing all tasks executed, time taken, agents used, quality metrics, and any deviations from the original plan.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Multi-agent coordination | Dispatches to 403+ agents by capability |
| [AIAD Registry](/glossary/aiad/) | Agent/command discovery | Queries capabilities for task matching |
| [Quality Gates](/glossary/quality-gates/) | Per-task validation | Quality gates embedded in execution pipeline |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Task timing, agent utilization, quality scores |
| [Session Lifecycle](/glossary/session-discipline/) | Context management | Maintains context across multi-task execution |
| [GitLab](/glossary/gitlab-ci/) | Issue tracking | Creates/updates issues for orchestrated work |
| [All Commands](/commands/) | Command dispatch | Can invoke any of 216 platform commands |

## Best Practices

**Objective Precision**: Write objectives that are specific and measurable. "Improve performance" is too vague. "Reduce security rating calculation from 200ms to under 50ms for single-domain assessments" is precise enough for effective decomposition.

**Constraint Declaration**: Explicitly state constraints that the orchestrator should respect. Constraints like "zero downtime," "backward compatible," and "no schema changes" prevent the orchestrator from generating plans that violate non-obvious requirements.

**Dry Run First**: For complex orchestrations that touch multiple applications or involve irreversible operations, always run `--dry-run` first to review the execution plan. This preview costs nothing and can prevent costly mistakes.

**Checkpoint Configuration**: For orchestrations expected to run longer than 15 minutes, reduce the checkpoint interval to 5 minutes. This minimizes work loss if the orchestration is interrupted.

**Parallelism Tuning**: The default auto-parallelism works well for most cases. Override with a lower value when working with shared resources (databases, file systems) that may contend under parallel access.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Objective too vague | Clarification requested | Planning paused |
| Agent unavailable | Fallback agent assigned | Transparent substitution |
| Task failure | Retry, then failover, then checkpoint | Partial completion if unrecoverable |
| Quality gate failure | Task re-executed with corrections | Extended execution time |
| Timeout reached | Checkpoint saved, resume available | Partial delivery with resume option |
| Circular dependency | DAG restructured with warning | Modified task ordering |

## Advanced Usage

### Recursive Orchestration

The orchestrator can invoke itself for sub-objectives:

```bash
# Top-level orchestration with nested sub-orchestrations
/orchestrate "Complete M47 milestone: implement features A, B, C with full test coverage and documentation"
```

### Template-Based Orchestration

```bash
# Use predefined orchestration templates
/orchestrate --template feature-lifecycle "Add webhook support"

# Create template from successful orchestration
/orchestrate --save-template my-template --from-run orchestration-2026-02-15
```

### Metrics and Analysis

```bash
# View orchestration performance history
/orchestrate --history --last 10

# Analyze efficiency gains
/orchestrate --efficiency-report --period monthly
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every subtask must pass quality gates. No partial deliveries without explicit checkpoint. No skipped tests or documentation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Task decomposition is validated against platform architecture. Agent assignments are based on measured capabilities. Quality assessments use quantitative metrics.

The Supreme Platform Intelligence authority level provides unrestricted access to all platform capabilities, making `/orchestrate` the most powerful and most accountable command in the system.

## Related Commands

- [/auto](/commands/auto/) - Intelligent autonomous evolution engine for zero-human-intervention improvements
- [/auto-pro](/commands/auto-pro/) - Steroids edition with genetic optimization, swarm intelligence and quantum decisions
- [/auto-ultimate](/commands/auto-ultimate/) - Maximum [intelligence fusion](/glossary/intelligence-fusion/) combining MENDEL, MYCELIALIZE and AXON/EXLA neural computing
- [/operation-order](/commands/operation-order/) - Military-grade operation order generation for complex tasks
- [/archer-supreme](/commands/archer-supreme/) - Elite tactical commander for impossible mission execution
- [/code](/commands/code/) - Core coding implementation and feature development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)