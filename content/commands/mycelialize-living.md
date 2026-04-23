+++
title = "/mycelialize-living"
weight = 440
[extra]
category = "Evolution"
description = "Living self-evolving intelligence with introspection, AST manipulation and agent swarms"
syntax = "/mycelialize-living [options]"
authority = "COSMIC"
agent = "mycelial-network-coordinator"
status = "Experimental"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1295
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mycelialize-living", "Living", "commands", "Evolution", "Prismatic Platform", "Phase", "Agent"]
tags = ["commands", "evolution", "mycelialize-living", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mycelialize-living - Prismatic Platform"
+++

## Overview

**/mycelialize-living** is an experimental command in the **Evolution** category of the Prismatic Platform. It operates the living intelligence layer of the [mycelial network](@/glossary/mycelial-network.md), enabling patterns to introspect their own structure, rewrite their Abstract Syntax Trees at runtime, and coordinate through agent swarms that exhibit emergent collective behavior. Unlike the deterministic propagation of [/mycelialize](@/commands/mycelialize.md) or the proof-based verification of [/mycelialize-formal](@/commands/mycelialize-formal.md), this command manages a genuinely self-evolving system where patterns adapt, mutate, and optimize themselves based on runtime feedback.

This command operates under the **COSMIC** authority level and is executed by the `mycelial-network-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The COSMIC authority level is necessary because the command can modify pattern behavior at the AST level, fundamentally altering how the platform processes and propagates knowledge.

The living mycelial system draws inspiration from biological neural networks and fungal mycelium. Individual pattern agents communicate through chemical-signal-like messages, form temporary coalitions to solve complex problems, and evolve their strategies through a fitness-based selection mechanism. The system maintains a population of pattern variants, evaluates their effectiveness against real platform metrics, and promotes successful adaptations while pruning underperformers.

## Architecture

The living mycelial system operates as a multi-layered architecture combining introspection, mutation, and swarm coordination.

### System Architecture

```
                   /mycelialize-living
                          |
              +-----------+-----------+
              |           |           |
        Introspection  Mutation   Swarm
          Engine       Engine    Coordinator
              |           |           |
         +----+----+ +---+---+ +-----+-----+
         |    |    | |   |   | |     |     |
        AST  Meta  Type  AST  Fitness  Agent  Colony
       Reader Exam Infer Writer Eval   Spawn  Merge
         |    |    | |   |   | |     |     |
         +----+----+-+---+---+-+-----+-----+
                          |
                   Living Registry
                          |
                  +-------+-------+
                  |               |
            Pattern Store    Evolution Log
```

### Core Subsystems

| Subsystem | Responsibility | Key Capability |
|-----------|---------------|----------------|
| **Introspection Engine** | Self-examination of pattern structure | AST reading, metadata extraction, type inference |
| **Mutation Engine** | Controlled pattern modification | AST rewriting, variant generation, safety constraints |
| **Swarm Coordinator** | Multi-agent collective intelligence | Agent spawning, colony formation, fitness evaluation |
| **Living Registry** | State management for evolving patterns | Version tracking, rollback support, evolution lineage |
| **Fitness Evaluator** | Performance measurement of pattern variants | Metric collection, comparative analysis, selection pressure |

### Agent Swarm Model

Each pattern in the living system is represented by one or more autonomous agents. These agents follow a simple behavioral model:

1. **Sense** -- Read current platform state and peer signals
2. **Decide** -- Apply evolved decision rules to choose an action
3. **Act** -- Execute the chosen action (propagate, mutate, merge, or signal)
4. **Evaluate** -- Measure the outcome against fitness criteria
5. **Adapt** -- Adjust decision rules based on evaluation

Agents that consistently produce positive outcomes accumulate fitness, which increases their influence on the swarm's collective behavior. Low-fitness agents are eventually replaced by variants of high-fitness agents.

## Usage

```bash
# Start living mycelial system with defaults
/mycelialize-living

# Start with specific population size
/mycelialize-living --population 100

# Enable AST mutation with safety constraints
/mycelialize-living --enable-mutation --mutation-rate 0.05

# Run swarm coordination only (no mutation)
/mycelialize-living --mode swarm-only

# Start with introspection-first approach
/mycelialize-living --mode introspect-first

# Enable full living evolution cycle
/mycelialize-living --full-evolution --generations 50

# Monitor living system status
/mycelialize-living --status

# Pause evolution (freeze current population)
/mycelialize-living --pause

# Resume from paused state
/mycelialize-living --resume

# Export evolution history
/mycelialize-living --export-history ./evolution-log/
```

### Practical Examples

```bash
# Evolve quality patterns over 100 generations with conservative mutation
/mycelialize-living --domain quality --generations 100 --mutation-rate 0.02

# Run swarm optimization for CASCADE pattern family
/mycelialize-living --pattern "cascade_*" --mode swarm-only --population 50

# Introspect all patterns and report structural anomalies
/mycelialize-living --mode introspect-first --report anomalies

# Full living cycle with proof verification at each generation
/mycelialize-living --full-evolution --verify-each-generation
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--population` | `integer` | 50 | Initial population size for pattern variants |
| `--generations` | `integer` | 20 | Number of evolution generations to run |
| `--mutation-rate` | `float` | 0.03 | Probability of mutation per pattern per generation |
| `--enable-mutation` | `flag` | false | Allow AST-level pattern mutations |
| `--mode` | `enum` | `full` | Operating mode: `full`, `swarm-only`, `introspect-first`, `mutation-only` |
| `--domain` | `string` | all | Scope to specific quality domain |
| `--pattern` | `string` | `*` | Pattern name or glob filter |
| `--fitness-metric` | `enum` | `composite` | Fitness evaluation: `speed`, `accuracy`, `coverage`, `composite` |
| `--selection` | `enum` | `tournament` | Selection strategy: `tournament`, `roulette`, `elitist` |
| `--crossover-rate` | `float` | 0.7 | Probability of crossover between high-fitness patterns |
| `--elitism` | `integer` | 5 | Number of top-fitness patterns preserved unchanged |
| `--status` | `flag` | false | Display current living system status |
| `--pause` | `flag` | false | Pause evolution, freeze population |
| `--resume` | `flag` | false | Resume from paused state |
| `--export-history` | `path` | none | Export evolution history to directory |
| `--verify-each-generation` | `flag` | false | Run formal verification after each generation |
| `--verbose` | `flag` | false | Detailed output including agent-level telemetry |

## Execution Flow

### Phase 1: Population Initialization

The system initializes a population of pattern variants from the current mycelial network state. Each pattern is cloned into multiple variants with slight random perturbations to create genetic diversity. The initial population is evaluated against the fitness metric to establish a baseline.

### Phase 2: Introspection Cycle

Every pattern agent introspects its own structure through AST analysis:

- **Structural Analysis** -- Identifies complexity hotspots, redundant branches, and optimization opportunities
- **Metadata Examination** -- Reviews propagation history, fitness trends, and peer relationships
- **Type Inference** -- Derives actual runtime types from execution traces, comparing against declared contracts

Introspection results inform the subsequent mutation and selection phases.

### Phase 3: Mutation and Crossover

When mutation is enabled, pattern variants undergo controlled modifications:

1. **Point Mutation** -- Single AST node replacement (e.g., changing a comparison operator)
2. **Structural Mutation** -- Branch insertion, removal, or reordering
3. **Crossover** -- Combining subtrees from two high-fitness parents to produce offspring
4. **Safety Validation** -- All mutations pass through a safety checker that rejects type-unsafe or non-terminating modifications

### Phase 4: Swarm Evaluation

The mutated population is deployed into a sandboxed evaluation environment. Agent swarms execute the patterns against real (but isolated) platform data. Performance metrics are collected:

| Metric | Weight | Description |
|--------|--------|-------------|
| Propagation Speed | 0.25 | Patterns/second throughput |
| Accuracy | 0.35 | Correct classification rate |
| Coverage | 0.20 | Percentage of applicable cases handled |
| Resource Efficiency | 0.20 | Memory and CPU utilization |

### Phase 5: Selection and Next Generation

Based on fitness scores, the selection algorithm chooses patterns for the next generation. The elitist strategy preserves the top N patterns unchanged, while remaining slots are filled through tournament selection and crossover. Low-fitness patterns are removed from the population.

### Phase 6: Convergence Check and Reporting

After each generation, the system checks for convergence (fitness plateau across multiple generations). If converged, the best patterns are promoted to the production mycelial network. Evolution history is logged for audit and analysis.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/mycelialize](@/commands/mycelialize.md) | Upstream/Downstream | Receives patterns for evolution, returns improved variants |
| [/mycelialize-formal](@/commands/mycelialize-formal.md) | Verification | Formally verifies evolved patterns before promotion |
| [/swarm-evolve](@/commands/swarm-evolve.md) | Peer | Shares swarm coordination infrastructure |
| [/evolve](@/commands/evolve.md) | Framework | Participates in broader AIAD ecosystem evolution |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime | Agent swarm execution environment |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Evolved patterns must pass gates before promotion |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Fitness metrics, generation stats, convergence data |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Epistemic | Evolution decisions backed by epistemic framework |

## Best Practices

### Mutation Rate Tuning

Start with conservative mutation rates (0.01-0.03) and increase only if the population converges prematurely. High mutation rates (above 0.10) tend to destroy beneficial adaptations faster than the selection process can preserve them.

### Population Sizing

Larger populations provide more genetic diversity but consume proportionally more resources. A good heuristic is to use 10x the number of distinct pattern types being evolved. For single-pattern optimization, populations of 20-50 are typically sufficient.

### Fitness Metric Selection

Choose the fitness metric that aligns with your optimization goal. For throughput-critical patterns, weight `speed` heavily. For classification patterns, prioritize `accuracy`. The default `composite` metric provides balanced optimization suitable for most use cases.

### Formal Verification Integration

Enable `--verify-each-generation` when evolving safety-critical patterns. This ensures that mutations never introduce type errors, non-termination, or invariant violations. The verification overhead is significant (roughly 3-5x slower) but prevents promotion of incorrect patterns.

### Evolution Checkpointing

For long-running evolution campaigns, the system automatically checkpoints every 10 generations. Use `--pause` and `--resume` to safely interrupt and continue evolution across sessions.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `POPULATION_EXTINCT` | All variants fell below minimum fitness | Increase population size or reduce selection pressure |
| `MUTATION_UNSAFE` | Proposed mutation fails safety check | Review mutation constraints; reduce mutation rate |
| `AST_PARSE_FAILURE` | Cannot parse pattern AST for introspection | Check pattern syntax; may need manual repair |
| `SWARM_DEADLOCK` | Agent swarm entered deadlock state | Reduce agent count or increase message buffer size |
| `FITNESS_NAN` | Fitness evaluation produced NaN | Check fitness metric implementation for division by zero |
| `CONVERGENCE_STALL` | Population stalled without converging | Inject diversity with `--mutation-rate` increase |
| `SANDBOX_VIOLATION` | Evolved pattern attempted unauthorized access | Pattern quarantined; review mutation constraints |

## Advanced Usage

### Custom Fitness Functions

Define domain-specific fitness functions by implementing the `MycelialFitness` behaviour:

```elixir
defmodule MyCustomFitness do
  @behaviour PrismaticMycelial.Fitness

  def evaluate(pattern, context) do
    speed_score = measure_speed(pattern, context)
    accuracy_score = measure_accuracy(pattern, context)
    {speed_score * 0.4 + accuracy_score * 0.6, %{speed: speed_score, accuracy: accuracy_score}}
  end
end
```

```bash
/mycelialize-living --fitness-module MyCustomFitness
```

### Multi-Objective Evolution

For patterns that must optimize multiple competing objectives simultaneously, use Pareto-front selection:

```bash
/mycelialize-living --selection pareto --objectives speed,accuracy,coverage
```

### Distributed Swarm Execution

When running on a cluster, agent swarms can distribute across nodes for parallel evaluation:

```bash
/mycelialize-living --distributed --nodes node1@host,node2@host --population 500
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Evolved patterns that fail quality gates are rejected regardless of fitness score.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every evolution decision is logged with fitness evidence and statistical significance.

## Related Commands

- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/swarm-evolve](@/commands/swarm-evolve.md) - Multi-agent swarm coordination for intelligent autonomous platform evolution
- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)