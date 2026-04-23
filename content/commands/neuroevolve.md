+++
title = "/neuroevolve"
weight = 560
[extra]
category = "Evolution"
description = "Neuroevolution combining neural network architecture with evolutionary optimization"
syntax = "/neuroevolve [options]"
authority = "COSMIC"
agent = "evolution-orchestrator"
status = "Experimental"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 898
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["neuroevolve", "Neuroevolution", "commands", "Evolution", "Prismatic Platform", "PrismaticEvolution", "Neuro", "Phase", "Float"]
tags = ["commands", "evolution", "neuroevolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/neuroevolve - Prismatic Platform"
+++

## Overview

**/neuroevolve** is an experimental command in the **Evolution** category of the Prismatic Platform. It implements neuroevolution combining neural network architecture with evolutionary optimization, enabling the platform to autonomously discover, refine, and deploy novel computational structures through biologically-inspired search algorithms.

Neuroevolution represents the convergence of two powerful optimization paradigms: neural network learning and evolutionary computation. The `/neuroevolve` command operationalizes this convergence within the Prismatic ecosystem, applying topology-evolving algorithms inspired by NEAT (NeuroEvolution of Augmenting Topologies) and HyperNEAT to platform components including agent behavior networks, quality prediction models, and pattern recognition architectures.

The command operates at the highest authority tier -- **COSMIC** -- reflecting its ability to modify fundamental platform behaviors through evolved network topologies. Each neuroevolution run produces a population of candidate solutions that compete, mutate, and recombine across generations. The fittest individuals are evaluated against the platform's [quality gates](@/glossary/quality-gates.md) and, upon passing the [Trinity Gate](@/glossary/trinity-gate.md) verification, are eligible for deployment into production systems.

This command is executed by the `evolution-orchestrator` agent and is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Its experimental status indicates active research-grade development with stable core functionality and evolving edge capabilities.

## Architecture

The `/neuroevolve` command is built on a distributed evolutionary computation framework that leverages Elixir's [OTP](@/glossary/otp.md) concurrency model for population-level parallelism.

### System Architecture

```
User Command --> Evolution Orchestrator
                        |
                  Population Manager
                   /    |    \
            Island 1  Island 2  Island N    (Island Model)
              |         |         |
          [Genomes]  [Genomes]  [Genomes]   (Neural Topologies)
              |         |         |
          Evaluator  Evaluator  Evaluator   (Fitness Assessment)
              |         |         |
          Selection  Selection  Selection   (Tournament/Elite)
              \        |        /
               Migration Manager            (Inter-Island Transfer)
                        |
                  Best Genome Extractor
                        |
                  Trinity Gate Validation
                        |
                  Deployment Decision
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Population Manager** | `PrismaticEvolution.Neuro.PopulationManager` | Manages genome populations across islands |
| **Genome Encoder** | `PrismaticEvolution.Neuro.GenomeEncoder` | NEAT-style genome representation |
| **Topology Mutator** | `PrismaticEvolution.Neuro.TopologyMutator` | Add/remove nodes and connections |
| **Crossover Engine** | `PrismaticEvolution.Neuro.Crossover` | Multi-point crossover with innovation tracking |
| **Fitness Evaluator** | `PrismaticEvolution.Neuro.FitnessEvaluator` | Multi-objective fitness assessment |
| **Speciation Manager** | `PrismaticEvolution.Neuro.Speciation` | Compatibility-based species management |
| **Migration Controller** | `PrismaticEvolution.Neuro.Migration` | Inter-island genome transfer |

The island model distributes the population across independent [GenServer](@/glossary/genserver.md) processes, each evolving semi-independently. Periodic migration events transfer high-fitness genomes between islands, combining the exploration benefits of independent populations with the exploitation advantages of sharing successful topologies.

## Usage

### Basic Neuroevolution

```bash
# Evolve a pattern recognition network
/neuroevolve --task pattern-recognition --generations 100

# Evolve agent behavior network with custom fitness
/neuroevolve --task agent-behavior --fitness-fn quality_score --generations 500

# Quick experimental run with small population
/neuroevolve --task optimization --population 50 --generations 20 --mode quick
```

### Advanced Configuration

```bash
# Multi-island evolution with migration
/neuroevolve --task quality-prediction --islands 4 --migration-rate 0.05 --generations 1000

# NEAT-style topology evolution with speciation
/neuroevolve --task topology-search --algorithm neat --species-threshold 3.0

# HyperNEAT with compositional pattern producing networks
/neuroevolve --task spatial-patterns --algorithm hyperneat --substrate-dims 8x8

# Resume interrupted evolution from checkpoint
/neuroevolve --resume checkpoint-2026-02-15-gen-450 --generations +200
```

### Monitoring and Analysis

```bash
# View current evolution status
/neuroevolve --status

# Export best genome for analysis
/neuroevolve --export-best --format dot --file best-topology.dot

# Visualize fitness landscape
/neuroevolve --analyze fitness-landscape --run-id latest

# Compare runs
/neuroevolve --compare run-001 run-002 --metric fitness,complexity
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--task` | String | Required | Evolution target task identifier |
| `--algorithm` | Enum | `neat` | Algorithm: `neat`, `hyperneat`, `cppn`, `es-hyperneat` |
| `--generations` | Integer | `100` | Maximum number of generations |
| `--population` | Integer | `150` | Population size per island |
| `--islands` | Integer | `1` | Number of parallel island populations |
| `--migration-rate` | Float | `0.03` | Fraction of genomes migrating per generation |
| `--mutation-rate` | Float | `0.8` | Probability of mutation per genome |
| `--crossover-rate` | Float | `0.75` | Probability of crossover per mating |
| `--species-threshold` | Float | `3.0` | Compatibility threshold for speciation |
| `--elitism` | Integer | `2` | Number of elite genomes preserved per species |
| `--fitness-fn` | String | `default` | Custom fitness function identifier |
| `--mode` | Enum | `standard` | Execution mode: `quick`, `standard`, `thorough`, `exhaustive` |
| `--resume` | String | - | Resume from checkpoint identifier |
| `--export-best` | Boolean | `false` | Export best genome after completion |
| `--format` | Enum | `json` | Export format: `json`, `dot`, `onnx` |
| `--convergence-threshold` | Float | `0.001` | Early stopping when fitness improvement falls below threshold |

## Execution Flow

The neuroevolution process follows a generational loop with well-defined stages at each iteration.

**Phase 1 -- Initialization** (0-10s): The Population Manager creates the initial population of minimal-topology genomes. Each genome starts with input nodes connected directly to output nodes with random weights. Innovation numbers are assigned to each connection gene for tracking historical origin during crossover.

**Phase 2 -- Evaluation** (per generation, variable): Every genome in the population is evaluated against the fitness function. For platform optimization tasks, this involves instantiating the encoded neural network, running it against a test suite, and measuring performance metrics. Evaluation is parallelized across available CPU cores using `Task.async_stream/3`.

**Phase 3 -- Speciation** (per generation, <1s): Genomes are grouped into species based on topological and weight similarity. The compatibility distance function considers excess genes, disjoint genes, and average weight differences. This protects topological innovation by allowing novel structures time to optimize their weights before competing against established topologies.

**Phase 4 -- Selection and Reproduction** (per generation, <1s): Within each species, genomes are selected for reproduction using tournament selection. Elite genomes are preserved unchanged. Selected parents produce offspring through crossover (aligning genes by innovation number) and mutation (weight perturbation, add node, add connection, disable connection).

**Phase 5 -- Migration** (periodic): At configurable intervals, top-performing genomes migrate between islands. The migration topology can be ring, fully-connected, or custom, controlling the rate of genetic mixing between subpopulations.

**Phase 6 -- Convergence Check and Finalization**: Evolution terminates when the generation limit is reached, the convergence threshold is met, or a genome achieves the target fitness. The best genome undergoes [Trinity Gate](@/glossary/trinity-gate.md) validation before being marked as deployment-eligible.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Managed by `evolution-orchestrator` agent |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Evolved solutions must pass all quality gates |
| [Trinity Gate](@/glossary/trinity-gate.md) | Verification | Formal verification of evolved topologies |
| [Telemetry](@/glossary/telemetry.md) | Observability | Generation [metrics](@/glossary/metrics.md), fitness trajectories, species counts |
| [SEADF](@/glossary/seadf.md) | Framework | Integrates with Self-Evolving Autonomous Development Framework |
| [Mycelial Network](@/glossary/mycelial-network.md) | Pattern propagation | Successful topologies propagated via mycelial channels |
| [NABLA](@/glossary/nabla-infinity.md) | Epistemic validation | Confidence scoring on evolved solutions |

## Best Practices

**Population Sizing**: Use a minimum of 150 genomes per island for standard tasks. Smaller populations risk premature convergence. For complex topology searches, increase to 300-500 genomes with multiple islands.

**Speciation Tuning**: The species compatibility threshold controls diversity. Too low (< 1.0) creates excessive species with tiny populations that cannot evolve effectively. Too high (> 6.0) collapses all genomes into one species, eliminating topological protection. Start at 3.0 and adjust based on species count -- aim for 5-15 active species.

**Fitness Function Design**: Multi-objective fitness functions should balance performance against complexity. Penalize overly complex topologies to prevent bloat. The platform provides built-in complexity penalties via the `--complexity-penalty` parameter.

**Checkpointing**: Always enable checkpointing for long evolution runs (>100 generations). The `--checkpoint-interval` parameter defaults to every 10 generations but should be reduced for expensive fitness evaluations.

**Resource Management**: Each island runs as an independent [GenServer](@/glossary/genserver.md) process. Monitor memory usage for large populations with complex topologies. The platform's circuit breaker will terminate runaway evaluations that exceed memory bounds.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Fitness evaluation timeout | Genome assigned minimum fitness, evolution continues | Slow genomes naturally deselected |
| Island process crash | Supervisor restarts island from last checkpoint | Brief pause, minimal data loss |
| Memory exhaustion | Population pruned, complexity limits enforced | Reduced population, warning issued |
| Convergence stall | Automatic mutation rate increase triggered | Extended run time, diversity injection |
| Invalid genome topology | Genome repaired or replaced with random individual | Transparent recovery |
| Checkpoint corruption | Fallback to previous valid checkpoint | Potential generation loss, warning |

## Advanced Usage

### Custom Fitness Functions

Define domain-specific fitness evaluation through the platform's fitness function registry:

```elixir
# Register a custom fitness function
PrismaticEvolution.FitnessRegistry.register(:my_fitness, fn genome ->
  network = PrismaticEvolution.Neuro.Phenotype.build(genome)
  accuracy = evaluate_accuracy(network, test_data)
  complexity = genome.connection_count / max_connections
  accuracy * 0.8 + (1.0 - complexity) * 0.2
end)
```

```bash
# Use the custom fitness function
/neuroevolve --task custom --fitness-fn my_fitness --generations 200
```

### Coevolution

Run multiple populations that evolve against each other:

```bash
# Coevolve attack and defense networks
/neuroevolve --task coevolution --populations "attacker,defender" --coevolution-mode competitive
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Evolved solutions that fail quality gates are rejected regardless of fitness score. No partial deployments. No unvalidated topologies in production.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every evolved genome carries full lineage tracing back to its initial random topology. Fitness improvements are statistically validated across multiple evaluations to prevent overfitting.

The COSMIC authority level ensures that neuroevolved changes undergo the most rigorous review process, including [Trinity Gate](@/glossary/trinity-gate.md) formal verification, before any deployment consideration.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)