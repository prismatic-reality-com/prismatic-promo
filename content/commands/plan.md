+++
title = "/plan"
weight = 970
[extra]
category = "Operations"
description = "Strategic project planning with complete AIAD ecosystem integration"
syntax = "/plan [options]"
authority = "L2+"
agent = "planner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1292
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["plan", "Strategic", "AIAD", "commands", "Operations", "Prismatic Platform", "GitLab", "Phase"]
tags = ["commands", "operations", "plan", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/plan - Prismatic Platform"
+++

## Overview

**/plan** is a production command in the **Operations** category of the Prismatic Platform that provides strategic project planning capabilities with full [AIAD](/glossary/aiad/) ecosystem integration. This command transforms high-level objectives into structured, executable project plans that account for dependencies, resource constraints, quality requirements, and the platform's extensive agent and command ecosystem. It is the primary interface for translating strategic intent into tactical execution roadmaps.

The planning engine operates by decomposing objectives into work items, identifying dependencies between them, estimating effort based on historical platform data, and mapping work items to appropriate agents and commands for execution. The resulting plan is a directed acyclic graph (DAG) of tasks with clear sequencing, parallelization opportunities, and quality gate checkpoints. This structured approach ensures that complex multi-phase projects are executed with the discipline and completeness that the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine demands.

This command operates under the **L2+** authority level and is executed by the `planner` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard. The planner agent has read access to the full AIAD registry, enabling it to recommend specific agents and commands for each task in the generated plan.

Unlike ad-hoc task tracking, the `/plan` command produces plans that are deeply integrated with the platform's operational infrastructure. Each task in a generated plan can reference specific commands to execute, agents to coordinate with, quality gates to pass, and [telemetry](/glossary/telemetry/) events to emit. This integration means that plan execution is not merely a checklist but a coordinated workflow that leverages the full capabilities of the Prismatic Platform.

## Architecture

The planning engine architecture follows a multi-stage pipeline from objective intake to plan rendering, with feedback loops for iterative refinement.

```
Objective Input ──> Objective Parser ──> Decomposition Engine
                                              │
                                              v
                                     Task Graph Builder
                                    (DAG Construction)
                                              │
                     ┌────────────────────────┤
                     v                        v
              Dependency Resolver     Agent/Command Mapper
              (Topological Sort)      (AIAD Registry Lookup)
                     │                        │
                     v                        v
              Effort Estimator        Quality Gate Planner
              (Historical Data)       (Gate Insertion)
                     │                        │
                     └────────────┬───────────┘
                                  v
                          Plan Optimizer
                     (Critical Path Analysis)
                                  │
                                  v
                          Plan Renderer
                     (Table/JSON/Gantt/MD)
```

The Decomposition Engine applies a recursive decomposition strategy: top-level objectives are broken into epics, epics into tasks, and tasks into sub-tasks until each leaf node represents an atomic unit of work that can be assigned to a single agent and completed within a single session. The decomposition depth is configurable, allowing both high-level strategic plans and detailed tactical execution plans to be generated from the same objective.

## Usage

### Basic Planning

```bash
# Generate plan from objective description
/plan "Implement user authentication with JWT tokens"

# Plan with specific scope constraints
/plan "Add NIS2 compliance module" --scope perimeter --timeline 2w

# Plan with milestone structure
/plan "EASM MVP delivery" --milestones --phases 4
```

### Detailed Planning

```bash
# Full project plan with resource allocation
/plan "Czech Registry Autocrawler" --detail full --resources --dependencies

# Plan with quality gate insertion
/plan "Add security headers" --quality-gates --test-coverage 100

# Plan with agent assignment recommendations
/plan "Optimize database queries" --assign-agents --recommend-commands
```

### Plan Management

```bash
# View current active plan
/plan --show

# Update plan with progress
/plan --update --task 3 --status complete

# Re-plan with changed constraints
/plan --replan --timeline 1w --priority critical

# Export plan for external tools
/plan --export jira --output plan-export.json
```

### GitLab Integration

```bash
# Generate plan and create GitLab issues
/plan "Feature X implementation" --create-issues --milestone "Sprint 42"

# Sync plan progress with GitLab
/plan --sync-gitlab --project prismatic-platform

# Import GitLab milestone as plan
/plan --import-gitlab --milestone-id 6250432
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| (positional) | string | required | Objective description or plan action |
| `--scope` | string | all | Limit planning scope to specific domain |
| `--timeline` | duration | auto | Target timeline for completion |
| `--milestones` | flag | false | Generate milestone structure |
| `--phases` | integer | auto | Number of execution phases |
| `--detail` | enum | standard | Plan detail: minimal, standard, full |
| `--resources` | flag | false | Include resource allocation |
| `--dependencies` | flag | false | Show task dependencies |
| `--quality-gates` | flag | false | Insert quality gate checkpoints |
| `--test-coverage` | integer | 80 | Target test coverage percentage |
| `--assign-agents` | flag | false | Recommend agent assignments |
| `--recommend-commands` | flag | false | Map tasks to platform commands |
| `--show` | flag | false | Display current active plan |
| `--update` | flag | false | Update plan with progress |
| `--task` | integer | none | Task ID for update operations |
| `--status` | enum | none | Task status: pending, in_progress, complete, blocked |
| `--replan` | flag | false | Re-generate plan with new constraints |
| `--priority` | enum | normal | Plan priority: low, normal, high, critical |
| `--export` | enum | none | Export format: jira, gitlab, trello, json |
| `--create-issues` | flag | false | Create GitLab issues from plan |
| `--milestone` | string | none | GitLab milestone for issue creation |
| `--sync-gitlab` | flag | false | Synchronize plan with GitLab |
| `--format` | enum | table | Output: table, json, markdown, gantt |
| `--output` | path | stdout | Output file path |

## Execution Flow

The planning pipeline executes through five distinct phases that transform an objective into an actionable plan.

**Phase 1 -- Objective Analysis** (1-3 seconds): The objective description is parsed and analyzed to extract key requirements, constraints, and success criteria. Natural language processing identifies technical domains, affected components, and implicit requirements. The planner agent queries the AIAD registry to understand available capabilities relevant to the objective.

**Phase 2 -- Task Decomposition** (2-5 seconds): The objective is recursively decomposed into a task hierarchy. Each decomposition level applies domain-specific heuristics: a "security" objective generates tasks for threat modeling, implementation, testing, and documentation; a "feature" objective generates tasks for design, implementation, testing, deployment, and monitoring. The decomposition continues until each leaf task is atomic and assignable.

**Phase 3 -- Dependency Resolution** (1-2 seconds): Dependencies between tasks are identified and validated. The dependency graph is checked for cycles (which would indicate planning errors) and topologically sorted to determine valid execution orderings. Critical path analysis identifies the longest dependency chain, which determines the minimum possible project timeline.

**Phase 4 -- Resource Mapping** (1-3 seconds): Each task is mapped to appropriate agents, commands, and quality gates from the AIAD registry. Effort estimates are generated based on task complexity, historical completion data from similar tasks, and the capabilities of the assigned agents. Resource conflicts are identified and sequencing adjustments are made to resolve contention.

**Phase 5 -- Plan Rendering** (< 1 second): The completed plan is rendered in the requested output format. Table format provides a compact task list with status indicators. Markdown format produces a readable project document. JSON format enables programmatic consumption. Gantt format produces a timeline visualization suitable for project management presentations.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Task Assignment | Maps tasks to capable agents |
| [AIAD Registry](/glossary/aiad/) | Capability Discovery | Queries available commands and agents |
| [Quality Gates](/glossary/quality-gates/) | Checkpoint Insertion | Adds quality gates at phase boundaries |
| [Telemetry](/glossary/telemetry/) | Plan Tracking | Emits plan lifecycle events |
| [Prismatic Storage](/apps/prismatic-storage/) | Plan Persistence | Stores plans, progress, history |
| GitLab API | Issue Management | Creates/syncs issues and milestones |
| [/code](/commands/code/) | Execution | Implementation tasks reference `/code` |
| [/test](/commands/test/) | Execution | Testing tasks reference `/test` |
| [/fix](/commands/fix/) | Execution | Bug fix tasks reference `/fix` |

## Best Practices

**Start with Clear Objectives**: The quality of the generated plan depends directly on the clarity of the input objective. Provide specific, measurable goals rather than vague aspirations. "Implement JWT authentication with refresh tokens and RBAC" produces a significantly better plan than "add auth."

**Use Phases for Large Projects**: For objectives spanning more than a week, use the `--phases` option to create a phased delivery plan. This creates natural checkpoints for progress assessment and enables course correction before significant effort is invested in a suboptimal approach.

**Enable Quality Gates**: Always use `--quality-gates` for production-bound work. Quality gates at phase boundaries catch issues early when they are cheapest to fix, aligning with the platform's zero-tolerance quality standards.

**Leverage Agent Recommendations**: The `--assign-agents` option matches tasks to agents with the appropriate specialization. This is particularly valuable for operators who are not familiar with the full agent ecosystem and might otherwise miss specialized capabilities.

**Integrate with GitLab**: Use `--create-issues` to automatically generate GitLab issues from plan tasks. This maintains a single source of truth for project tracking and ensures compliance with the platform's mandatory session tracking protocol.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Empty objective | Validation error with guidance | Provide descriptive objective |
| Circular dependencies | Error with cycle identification | Restructure task relationships |
| Timeline infeasible | Warning with minimum timeline | Adjust scope or timeline |
| Agent not found | Task flagged as unassigned | Manual agent assignment |
| GitLab API unavailable | Plan created without issues | Retry `--create-issues` later |
| Conflicting constraints | Error with constraint analysis | Relax conflicting constraints |

## Advanced Usage

### Iterative Planning

```bash
# Initial high-level plan
/plan "EASM MVP" --detail minimal --milestones

# Refine specific milestone
/plan --refine --milestone 2 --detail full --assign-agents

# Track execution and replan
/plan --show --progress
/plan --replan --completed-tasks 1,2,3,4 --timeline 3d
```

### Template-Based Planning

```bash
# Use predefined plan template
/plan "New app module" --template umbrella-app

# List available templates
/plan --list-templates

# Create plan from previous successful plan
/plan "Similar feature" --from-plan plan-2026-01-15.json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Generated plans always include quality gates, testing phases, and documentation tasks. Plans that would produce incomplete or untested deliverables are rejected by the planning engine.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Task effort estimates are based on historical data, not assumptions. Dependencies are verified against the actual codebase structure. Agent assignments are validated against the AIAD registry to ensure capability alignment.

The planner agent operates under the [NABLA](/glossary/nabla-infinity/) framework, applying Signal Plurality to effort estimation (multiple estimation techniques are cross-validated) and Provenance Mandatory to dependency analysis (all dependencies are traceable to specific code and configuration relationships).

## Related Commands

- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)