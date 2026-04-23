+++
title = "/coordinate"
weight = 2020
[extra]
category = "Framework"
description = "Orchestrate complex multi-agent operations with sequential and parallel execution"
syntax = "/coordinate [options]"
authority = "L3"
agent = "multi-agent-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1171
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["coordinate", "Orchestrate", "commands", "Framework", "Prismatic Platform", "Coordination", "Problem"]
tags = ["commands", "framework", "coordinate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/coordinate - Prismatic Platform"
+++

## Overview

**/coordinate** is a production command in the **Framework** category of the Prismatic Platform that orchestrates complex multi-agent operations requiring sequential dependencies, parallel verification, and inter-agent communication. When a problem exceeds the capability of a single specialist agent, the `/coordinate` command assembles a team of specialists, establishes execution order based on dependencies, and manages the handoff of results between agents to produce a unified solution.

The command implements three coordination patterns: Sequential + Parallel (the most common, used for problems with both dependent and independent verification phases), Pure Parallel (for independent verification tasks that can run simultaneously), and Pure Sequential (for strictly dependent operations where each step builds on previous results). The coordination engine manages the full lifecycle from problem analysis through result aggregation, with MCP blackboard integration enabling real-time inter-agent communication.

This command operates under the **L3** authority level and is executed by the `multi-agent-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command was developed from the successful pattern of the Operation Type Inference Fix, where coordinated multi-agent execution resolved complex type system and pattern matching bugs that no single agent could address independently.

The coordination approach delivers 30-50% time savings through parallelization of independent work phases, while maintaining strict sequential ordering where dependencies exist. Every coordinated operation produces a comprehensive audit trail documenting each agent's contribution, timing, and results. The multi-agent coordination paradigm reflects a fundamental insight in the platform's design philosophy: complex problems are best solved by assembling purpose-built specialist teams rather than relying on generalist capabilities.

## Syntax and Usage

```bash
/coordinate <problem_description> [options]
```

The command accepts a natural language problem description as its primary argument. The coordinator agent analyzes this description to determine complexity, identify required specialist domains, and select the appropriate coordination pattern.

### Complex Problem Coordination

```bash
# Type system bug fix (real-world example)
/coordinate "Fix type inference causing Dialyzer warnings + pattern matching causing FunctionClauseError"

# Performance investigation
/coordinate "Investigate and fix ETS adapter timeout on large queries"

# Security audit
/coordinate "Comprehensive security audit for production deployment"
```

### Multi-Domain Tasks

```bash
# Cross-cutting concern
/coordinate "Implement telemetry across all storage adapters with dashboard integration"

# Architecture migration
/coordinate "Migrate authentication from Guardian to custom JWT implementation"

# Quality improvement
/coordinate "Eliminate all Dialyzer warnings across prismatic_agents and prismatic_web apps"
```

### Verification Operations

```bash
# Platform-wide verification
/coordinate "Verify all public API contracts match documentation"

# Regression testing
/coordinate "Run comprehensive regression analysis after storage layer refactoring"
```

## Parameters and Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `problem` | string | required | Problem description requiring coordination |
| `--pattern` | string | auto-detected | Coordination pattern: `sequential-parallel`, `parallel`, `sequential` |
| `--squads` | string | auto-selected | Override squad composition |
| `--dry-run` | boolean | false | Show plan without executing |
| `--timeout` | integer | 3600 | Maximum execution time in seconds |
| `--verbose` | boolean | false | Show real-time agent communication |
| `--max-agents` | integer | 10 | Maximum number of agents to deploy |
| `--priority` | string | `normal` | Execution priority: `critical`, `normal`, `background` |
| `--rollback` | boolean | true | Enable automatic rollback on failure |

The `--pattern` parameter is auto-detected by default based on problem analysis. Override is available for cases where the operator has domain knowledge that influences optimal coordination strategy. The `--squads` parameter accepts a comma-separated list of agent identifiers, replacing the automatic squad selection when the operator knows exactly which specialists are needed.

## Implementation Architecture

The coordination system uses a squad-based architecture with a central coordinator managing multiple agent teams.

```
Multi-Agent Coordinator
    |
    +-- Problem Analyzer
    |       |-- Classify complexity
    |       |-- Identify required domains
    |       |-- Determine coordination pattern
    |
    +-- Agent Selector
    |       |-- Alpha Squad (primary specialists)
    |       |-- Bravo Squad (verification specialists)
    |       |-- Audit Team (platform validators)
    |
    +-- Execution Manager
    |       |-- Sequential execution engine
    |       |-- Parallel execution engine
    |       |-- Handoff coordinator
    |       |-- MCP blackboard integration
    |
    +-- Result Aggregator
            |-- Collect outputs
            |-- Verify no conflicts
            |-- Check for regressions
            |-- Generate unified report
```

### Coordination Patterns

| Pattern | Structure | Use Case | Time Savings |
|---------|-----------|----------|-------------|
| **Sequential + Parallel** | Alpha -> Bravo -> Audit (parallel) | Complex problems with dependencies | 30-50% |
| **Pure Parallel** | All teams simultaneously | Independent verification | Maximum |
| **Pure Sequential** | Step 1 -> Step 2 -> Step 3 | Strictly dependent operations | None (safety focus) |

### Execution Flow

```
PHASE 1: PROBLEM ANALYSIS (1-2 min)
    |-- Parse problem description
    |-- Assess complexity (simple/medium/complex)
    |-- Identify required specialist domains
    |-- Determine coordination pattern
    |-- Estimate execution time
    |
PHASE 2: AGENT SELECTION (< 1 min)
    |-- Alpha Squad: Primary specialists (P0)
    |-- Bravo Squad: Verification specialists (P1)
    |-- Audit Team: Platform validators (P2)
    |-- Present team composition for approval
    |
PHASE 3: EXECUTION PLAN
    |-- Define sequential dependencies
    |-- Identify parallel opportunities
    |-- Establish handoff points
    |-- Set success criteria per squad
    |
PHASE 4: COORDINATION EXECUTION
    |-- Launch Alpha Squad
    |-- Monitor progress via MCP blackboard
    |-- Execute handoff to Bravo Squad
    |-- Launch Audit Team (parallel if independent)
    |-- Track all operations
    |
PHASE 5: RESULT AGGREGATION
    |-- Collect outputs from all agents
    |-- Verify no inter-agent conflicts
    |-- Check for regressions
    |-- Validate success criteria
    |
PHASE 6: COMPREHENSIVE REPORT
    |-- Problem summary
    |-- Agent contributions with timing
    |-- Fixes implemented
    |-- Verification results
    |-- Success metrics
```

### MCP Blackboard Integration

Agents communicate during coordination through the MCP blackboard, a shared state mechanism that enables real-time status updates and data handoffs:

```elixir
# Alpha Squad writes completion status
PrismaticMcp.Blackboard.write("alpha_status", "typespec_fixes_complete")

# Bravo Squad reads and proceeds
case PrismaticMcp.Blackboard.read("alpha_status") do
  "typespec_fixes_complete" -> start_pattern_audit()
  _ -> wait_for_alpha()
end

# Audit Team monitors progress
PrismaticMcp.Blackboard.subscribe("alpha_status")
PrismaticMcp.Blackboard.subscribe("bravo_status")
```

The blackboard operates as an ETS-backed key-value store with pub/sub capabilities. Each agent writes its status, intermediate results, and final outputs to designated blackboard keys. Other agents subscribe to relevant keys and receive real-time notifications when data changes. This decoupled communication pattern allows agents to operate independently while maintaining coordination awareness.

## Examples

### Operation Type Inference Fix

```bash
/coordinate "Fix type inference + pattern matching bugs"
```

**Execution**:

| Phase | Squad | Duration | Result |
|-------|-------|----------|--------|
| Alpha | type-inference-debugger | 8 min | 4 conflicting typespecs removed |
| Bravo | pattern-matching-auditor | 12 min | 3 arity mismatches fixed |
| Audit | systematic-verifier | 15 min (parallel) | Zero regressions confirmed |

**Total Duration**: 20 minutes (with parallelization, would be 35 sequential)

**Results**: 7 issues fixed, 5 regression tests added, zero regressions, 100% success rate

### Cross-Application Telemetry Implementation

```bash
/coordinate "Implement telemetry across all storage adapters" --verbose
```

This coordination assembled a three-agent Alpha Squad (one per storage adapter type), a Bravo Squad of test specialists, and an Audit Team that verified telemetry event consistency across all adapters. The sequential-parallel pattern ensured that the adapter implementations completed before verification began, while the three audit checks ran in parallel.

### Security Audit Coordination

```bash
/coordinate "Comprehensive security audit for production deployment" --pattern sequential --priority critical
```

For security-critical operations, the pure sequential pattern ensures that each specialist builds upon the findings of predecessors. The authentication auditor runs first, followed by the authorization reviewer, then the data exposure scanner, and finally the penetration tester. Each specialist receives the accumulated findings from all previous specialists.

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Multi-agent coordination | Squad-based team management |
| AIAD Registry | Agent discovery | Specialist selection from registry |
| [Quality Gates](/glossary/quality-gates/) | Post-coordination validation | All squads pass gates |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Coordination event tracking |
| MCP Blackboard | Inter-agent communication | Real-time status and data sharing |
| Session Context | Result persistence | Reports saved to `.claude/reports/` |
| [Trinity Gate](/glossary/trinity-gate/) | Result validation | Coordinated outputs pass Trinity verification |
| [/analyze](/commands/analyze/) | Pre-coordination analysis | Problem space mapping before agent selection |

## Workflow Integration

The /coordinate command serves as the escalation path when single-agent operations encounter problems that span multiple domains. The typical workflow progression is: attempt resolution with a single specialist agent, if the problem spans multiple domains or requires verification from independent perspectives, escalate to `/coordinate` for multi-agent resolution.

Within the broader platform workflow, coordination integrates at several points:

1. **Bug Fix Escalation**: When [/fix](/commands/fix/) encounters a multi-domain bug, it recommends escalation to `/coordinate` with a pre-analyzed problem description.
2. **Architecture Migration**: Complex refactoring operations that touch multiple applications are naturally suited to coordinated execution, with specialists for each affected domain.
3. **Quality Campaigns**: Platform-wide quality improvement campaigns use `/coordinate` to parallelize domain-specific quality evolution across independent applications.
4. **Release Validation**: Pre-release validation coordinates multiple verification specialists to audit different aspects of the release simultaneously.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: All agents must complete successfully, all quality gates must pass, and zero regressions are tolerated. Partial success is treated as failure. The coordination engine does not accept "good enough" results from any squad.
- **NO DOUBTS**: Full investigation by multiple independent agents before conclusions. The multi-squad approach ensures that no single perspective dominates decision-making. Contradictions between squad findings trigger additional investigation rather than being silently resolved.

NABLA axiom compliance in coordination operations:

| Axiom | Enforcement |
|-------|-------------|
| **Signal Plurality** | Multiple independent agents provide diverse analytical signals |
| **Contradiction Preservation** | Inter-agent conflicts preserved for human resolution |
| **Source Independence** | Squads operate independently before result aggregation |
| **Provenance Mandatory** | Each agent's contribution timestamped and attributed |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Problem Analysis | 1-2 minutes | Complexity-dependent |
| Agent Selection | < 1 minute | Registry-based discovery |
| Coordination Execution | 10-60 minutes | Problem-dependent |
| Parallelization Savings | 30-50% | Compared to pure sequential |
| Result Aggregation | 1-3 minutes | Cross-validation overhead |
| Blackboard Latency | < 5ms | ETS-backed read/write |
| Total Overhead | < 5 minutes | Coordination infrastructure cost |

The coordination overhead (problem analysis + agent selection + result aggregation) typically adds 3-5 minutes to the total execution time. This overhead is compensated by the parallelization savings, which average 30-50% for problems with independent verification phases.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/rc1-orchestrate](/commands/rc1-orchestrate/) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/code](/commands/code/) - Core coding implementation and feature development
- [/debug-investigation](/commands/debug-investigation/) - Comprehensive debugging investigation
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/archer-supreme](/commands/archer-supreme/) - Supreme strategic coordination with multi-domain analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)