+++
title = "/swarm-evolve"
weight = 550
[extra]
category = "Evolution"
description = "Multi-agent swarm coordination for intelligent autonomous platform evolution"
syntax = "/swarm-evolve [options]"
authority = "COSMIC"
agent = "evolution-orchestrator"
status = "Experimental"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1180
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["swarm-evolve", "Multi-agent", "commands", "Evolution", "Prismatic Platform", "Phase", "Swarm", "Quality", "Description"]
tags = ["commands", "evolution", "swarm-evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/swarm-evolve - Prismatic Platform"
+++

## Overview

**/swarm-evolve** is an experimental command in the **Evolution** category of the Prismatic Platform. It coordinates multiple agents in a swarm formation to execute large-scale autonomous platform evolution that exceeds the capabilities of single-agent evolution commands. Where [/evolve](@/commands/evolve.md) operates as a single-agent evolution cycle and [/quality-evolve](@/commands/quality-evolve.md) targets specific quality domains, `/swarm-evolve` deploys dozens of agents simultaneously across multiple evolution fronts, using swarm intelligence algorithms (stigmergy, pheromone trails, consensus voting) to coordinate their efforts without central bottlenecks.

This command operates under the **COSMIC** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The COSMIC authority level -- the highest in the platform's hierarchy -- is required because swarm evolution can modify any file in the codebase, create new modules, refactor existing ones, update tests, and propagate changes across application boundaries. This scope demands unrestricted access.

The biological inspiration comes from ant colony optimization and bee swarm intelligence. Individual agents have limited scope and capability, but their collective behavior produces emergent intelligence that identifies optimization opportunities, generates improvements, validates them, and promotes successful changes -- all at a scale and speed impossible for sequential execution. The swarm maintains quality through redundant validation: every change proposed by one agent must be independently verified by at least two others before promotion.

## Architecture

The swarm evolution system operates as a decentralized multi-agent coordination framework.

### Swarm Architecture

```
             /swarm-evolve
                    |
          Evolution Orchestrator
                    |
          +--------+--------+
          |        |        |
       Swarm     Task      Consensus
       Manager   Allocator  Engine
          |        |        |
    +-----+-----+  |  +----+----+
    |     |     |  |  |    |    |
   Scout Worker  Guard    Vote  Merge
   Agents Agents Agents  Logic Logic
    |     |     |  |  |    |    |
    +--+--+--+--+--+--+----+----+
       |     |     |
    Pheromone Trail System
       |
    Shared Knowledge Base
```

### Agent Roles

| Role | Count | Capability | Scope |
|------|-------|------------|-------|
| **Scout Agents** | 5-10 | Issue discovery, opportunity identification | Read-only codebase scanning |
| **Worker Agents** | 10-30 | Fix generation, code improvement | Write access to assigned files |
| **Guard Agents** | 3-5 | Quality validation, regression prevention | Read-only with gate authority |
| **Merge Agents** | 2-3 | Change integration, conflict resolution | Write access for merging |
| **Orchestrator** | 1 | Swarm coordination, task allocation | Full COSMIC authority |

### Swarm Intelligence Mechanisms

| Mechanism | Inspiration | Application |
|-----------|-------------|-------------|
| **Stigmergy** | Ant pheromone trails | Indirect agent coordination through shared markers |
| **Pheromone Decay** | Evaporating chemical trails | Stale improvement signals lose priority over time |
| **Waggle Dance** | Bee communication | Worker agents broadcast successful pattern locations |
| **Consensus Voting** | Democratic decision | Changes require 2/3 guard agent approval |
| **Division of Labor** | Ant caste system | Agents specialize by role (scout, worker, guard) |

## Usage

```bash
# Launch full swarm evolution
/swarm-evolve

# Launch with specific swarm size
/swarm-evolve --swarm-size 20

# Target specific evolution domain
/swarm-evolve --domain quality

# Target specific applications
/swarm-evolve --apps "prismatic_web,prismatic_api"

# Launch with conservative consensus threshold
/swarm-evolve --consensus 0.8

# Monitor swarm progress in real-time
/swarm-evolve --monitor

# Dry run showing swarm plan
/swarm-evolve --dry-run

# Launch micro-swarm for focused improvement
/swarm-evolve --micro --domain performance

# Export swarm evolution report
/swarm-evolve --report --format json --export ./swarm-report.json
```

### Practical Examples

```bash
# Full platform quality evolution with large swarm
/swarm-evolve --domain quality --swarm-size 30 --consensus 0.75 --monitor

# Focused performance optimization across hot paths
/swarm-evolve --domain performance --apps "prismatic_storage_ets,prismatic" --micro

# Documentation evolution with guard-heavy swarm
/swarm-evolve --domain documentation --guard-ratio 0.3 --consensus 0.9

# Cross-cutting refactoring campaign
/swarm-evolve --domain refactoring --pattern "unsafe_map_access" --swarm-size 25

# Experimental deep evolution with full COSMIC authority
/swarm-evolve --deep --max-depth 5 --time-limit 2h --report
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--swarm-size` | `integer` | 15 | Total number of agents in the swarm |
| `--domain` | `enum` | all | Evolution domain: `quality`, `performance`, `documentation`, `refactoring`, `testing`, `all` |
| `--apps` | `string` | all | Comma-separated application targets |
| `--consensus` | `float` | 0.67 | Consensus threshold for change approval (0.5-1.0) |
| `--monitor` | `flag` | false | Real-time swarm progress monitoring |
| `--dry-run` | `flag` | false | Show swarm plan without executing |
| `--micro` | `flag` | false | Micro-swarm mode (5 agents, focused scope) |
| `--deep` | `flag` | false | Deep evolution allowing architectural changes |
| `--max-depth` | `integer` | 3 | Maximum change depth (1=surface, 5=architectural) |
| `--guard-ratio` | `float` | 0.2 | Ratio of guard agents to total swarm |
| `--time-limit` | `duration` | `1h` | Maximum swarm execution time |
| `--pattern` | `string` | none | Specific anti-pattern to target |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export results to file |
| `--report` | `flag` | false | Generate detailed evolution report |
| `--rollback-on-failure` | `flag` | true | Automatically rollback on quality gate failure |

## Execution Flow

### Phase 1: Swarm Formation

The orchestrator assembles the swarm based on configuration: allocating agents to roles (scout/worker/guard/merge), assigning domain specializations, and establishing the pheromone trail system. The shared knowledge base is initialized with current codebase state, quality metrics, and known issues.

### Phase 2: Reconnaissance

Scout agents fan out across the codebase, each scanning assigned regions for improvement opportunities. Discoveries are recorded as pheromone markers in the shared knowledge base with confidence scores, estimated effort, and expected impact. High-confidence discoveries attract more scout attention (positive feedback loop).

### Phase 3: Task Allocation

The task allocator reads pheromone markers and assigns improvement tasks to worker agents. Allocation considers agent specialization, task complexity, dependency ordering (simple improvements before complex ones that depend on them), and load balancing across the swarm.

### Phase 4: Parallel Execution

Worker agents execute assigned improvements concurrently. Each worker operates on a dedicated code region to avoid conflicts. Workers broadcast successful completions via the waggle dance mechanism, enabling other workers to learn from successful patterns. Pheromone trails are updated with actual outcomes.

### Phase 5: Consensus Validation

Guard agents independently validate each proposed change against quality gates: compilation, Credo, tests, type safety, and regression checks. Changes require configurable consensus threshold (default 2/3 guard approval) before promotion. Rejected changes are returned to workers with guard feedback.

### Phase 6: Integration and Reporting

Merge agents integrate approved changes, resolving any conflicts between concurrent modifications. The orchestrator generates a comprehensive report: changes made, quality metrics before and after, agent utilization, consensus outcomes, and recommendations for future evolution cycles.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/evolve](@/commands/evolve.md) | Foundation | Single-agent evolution provides the base protocol |
| [/quality-evolve](@/commands/quality-evolve.md) | Domain | Quality-focused evolution used by quality-domain workers |
| [/seadf](@/commands/seadf.md) | Infrastructure | SEADF subsystems provide scanner and healing infrastructure |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | All swarm changes must pass quality gates |
| [/mycelialize](@/commands/mycelialize.md) | Propagation | Successful swarm patterns propagated via mycelial network |
| [/verify-patterns](@/commands/verify-patterns.md) | Validation | Pattern verification for swarm-generated code |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime | 400+ agents available for swarm recruitment |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Swarm metrics: agent utilization, consensus rates, quality impact |

## Best Practices

### Swarm Sizing

Start with micro-swarms (`--micro`, 5 agents) for focused improvements and scale up only when the targeted domain is well-understood. Large swarms (30+ agents) on poorly scoped domains waste resources and produce conflicting changes.

### Consensus Tuning

Higher consensus thresholds (0.8-0.9) produce more conservative, higher-quality changes but slower throughput. Lower thresholds (0.5-0.67) are appropriate for low-risk domains (documentation, formatting) where false positives are inexpensive. Critical domains (security, performance) should always use high consensus.

### Domain Isolation

Run swarm evolution on one domain at a time rather than using `--domain all`. Cross-domain swarms create complex interaction patterns between worker agents that can produce unexpected emergent behavior. Sequential domain evolution is more predictable.

### Monitoring for Convergence

Use `--monitor` to watch for swarm convergence indicators. A healthy swarm shows decreasing pheromone marker density (fewer remaining opportunities), increasing consensus approval rates (higher quality proposals), and stable agent utilization. If these metrics diverge, the swarm may need parameter adjustment.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `SWARM_DEADLOCK` | Agents waiting on circular dependencies | Orchestrator breaks cycle by reassigning tasks |
| `CONSENSUS_FAILURE` | No changes passing consensus threshold | Lower threshold or narrow scope |
| `AGENT_EXHAUSTION` | Workers completed all assigned tasks | Natural termination; report generated |
| `CONFLICT_UNRESOLVABLE` | Merge agents cannot resolve conflicting changes | Manual intervention required |
| `QUALITY_REGRESSION` | Swarm changes degraded quality metrics | Automatic rollback triggered |
| `TIME_LIMIT_EXCEEDED` | Swarm exceeded configured time limit | Graceful shutdown with partial results |
| `PHEROMONE_OVERFLOW` | Too many markers in knowledge base | Increase decay rate or narrow scope |

## Advanced Usage

### Custom Agent Compositions

Define custom swarm compositions for specific scenarios:

```bash
/swarm-evolve --composition "scouts:8,workers:15,guards:5,merge:2" --domain quality
```

### Evolutionary Pressure Tuning

Adjust evolutionary pressure parameters:

```bash
/swarm-evolve --pheromone-decay 0.1 --positive-feedback 2.0 --exploration-ratio 0.3
```

### Federated Swarms

Run multiple independent swarms that share discovery data:

```bash
/swarm-evolve --federated --domains "quality,performance,testing" --shared-knowledge
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every swarm change must pass consensus validation and quality gates. Automatic rollback on quality regression.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Scout agents provide evidence for every improvement opportunity. Guard agents provide evidence for every approval or rejection.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/meta-evolve](@/commands/meta-evolve.md) - Evolve the evolution system itself

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)