+++
title = "/darwinize"
weight = 450
[extra]
category = "Evolution"
description = "Natural selection operation for evolutionary fitness optimization"
syntax = "/darwinize [options]"
authority = "L3"
agent = "darwinian-evolution-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 905
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["darwinize", "Natural", "commands", "Evolution", "Prismatic Platform", "Mycelial", "Population", "Darwinian"]
tags = ["commands", "evolution", "darwinize", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/darwinize - Prismatic Platform"
+++

## Overview

**/darwinize** is a production command in the **Evolution** category of the Prismatic Platform that implements Darwinian natural selection operations for evolutionary fitness optimization across the platform ecosystem. The command applies environmental pressure to populations of solutions, selects the fittest individuals, enables adaptive radiation into new ecological niches, and tracks speciation and extinction events -- all modeled on biological evolutionary principles.

The Darwinian evolution mechanism is one of three complementary evolution strategies in the Prismatic Evolution Framework, alongside Mendelian (genetic crossover and mutation) and Mycelial (network-based pattern propagation). While Mendelian evolution operates on genetic recombination and Mycelial evolution spreads successful patterns through network connections, Darwinian evolution focuses on environmental fitness selection -- the survival and reproduction of individuals best adapted to their environmental context.

This command operates under the **L3** authority level and is executed by the `darwinian-evolution-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command supports six operations (adapt, compete, speciate, radiate, analyze, status) across four environmental contexts (production, development, testing, research), each applying distinct selection pressures optimized for that environment's priorities.

The evolution system maintains population viability through mandatory quality gates that prevent genetic bottlenecks, enforce diversity preservation, and ensure that at least two active ecological niches are maintained at all times. Extinction events are documented and analyzed to prevent loss of valuable genetic diversity.

## Architecture

The Darwinian evolution system is built on an environment-population-niche architecture that models biological natural selection.

```
Environment Configuration (production/development/testing/research)
    |
    v
Population Manager
    |-- Individual trait vectors
    |-- Fitness evaluation
    |-- Generation tracking
    |
    +-- Natural Selection Engine
    |       |-- Fitness-proportional selection
    |       |-- Tournament selection
    |       |-- Environmental pressure application
    |
    +-- Niche Manager
    |       |-- Niche partition
    |       |-- Adaptive radiation
    |       |-- Speciation detection
    |       |-- Extinction monitoring
    |
    +-- Evolution Reporter
            |-- Generation metrics
            |-- Speciation events
            |-- Extinction records
            |-- Telemetry emission
```

### Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Variation** | Individuals vary in trait vectors (performance, reliability, efficiency, innovation) |
| **Selection** | Environment selects fitter individuals through pressure-proportional survival |
| **Inheritance** | Successful traits pass to offspring in subsequent generations |
| **Time** | Evolution occurs over configurable number of generations |

## Usage

### Adaptation Operations

```bash
# Adapt population to production environment
/darwinize adapt production --selection-pressure 0.7

# Low-pressure development adaptation
/darwinize adapt development --adaptation-rate 0.2

# Research environment with high innovation weight
/darwinize adapt research --selection-pressure 0.3 --radiation

# Multi-generation production optimization
/darwinize adapt production --selection-pressure 0.7 --generations 15 --detailed
```

### Competition Operations

```bash
# Intense competition with 30% survival
/darwinize compete production --survival-rate 0.3

# Moderate competition with detailed output
/darwinize compete testing --detailed

# Competition with custom population size
/darwinize compete development --population-size 100 --survival-rate 0.5
```

### Speciation and Radiation

```bash
# Trigger speciation with 5 niches
/darwinize speciate --niche-count 5 --radiation

# Research speciation analysis
/darwinize speciate research --detailed

# Adaptive radiation into new niches
/darwinize radiate development --niche-count 4
/darwinize radiate production --adaptation-rate 0.15
```

### Analysis and Status

```bash
# Analyze population dynamics
/darwinize analyze --detailed

# Environment-specific analysis
/darwinize analyze production

# Current population status
/darwinize status
/darwinize status --detailed

# Dry run (preview without executing)
/darwinize adapt production --dry-run
```

## Options & Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `action` | enum | `adapt` | adapt, compete, speciate, radiate, analyze, status | Operation to perform |
| `environment` | enum | `production` | production, development, testing, research | Environmental context |
| `--selection-pressure` | float | 0.5 | 0.0-1.0 | Intensity of natural selection |
| `--survival-rate` | float | 0.5 | 0.1-0.9 | Proportion surviving each generation |
| `--niche-count` | integer | 3 | 1-5 | Number of ecological niches |
| `--adaptation-rate` | float | 0.1 | 0.0-0.5 | Rate of adaptive changes |
| `--population-size` | integer | 50 | 10-500 | Population size |
| `--generations` | integer | 10 | 1-100 | Number of generations |
| `--radiation` | boolean | true | - | Enable adaptive radiation |
| `--detailed` | boolean | false | - | Show detailed metrics |
| `--dry-run` | boolean | false | - | Preview without executing |

## Environmental Contexts

Each environment applies different selection pressures that favor different trait combinations:

| Environment | Performance | Reliability | Efficiency | Innovation | Threshold |
|-------------|------------|------------|-----------|-----------|-----------|
| **Production** | 40% | 30% | 20% | 10% | 60% |
| **Development** | 20% | 20% | 20% | 40% | 40% |
| **Testing** | 30% | 40% | 20% | 10% | 50% |
| **Research** | 10% | 10% | 20% | 60% | 30% |

## Ecological Niches

| Niche | Focus | Success Criteria |
|-------|-------|-----------------|
| **Performance** | Speed and efficiency | Low latency, high throughput |
| **Reliability** | Stability and correctness | Low error rate, consistency |
| **Efficiency** | Resource optimization | Low memory, CPU efficiency |
| **Innovation** | Novel approaches | Creative solutions, uniqueness |
| **Hybrid** | Balanced approach | Multi-dimensional fitness |

## Execution Flow

```
PHASE 1: ENVIRONMENT INITIALIZATION
    |-- Configure environmental factors
    |-- Set selection pressure
    |-- Define ecological niches
    |-- Initialize population
    |
PHASE 2: ENVIRONMENTAL PRESSURE
    |-- Apply environmental stress
    |-- Evaluate fitness in context
    |-- Identify struggling individuals
    |-- Apply survival challenges
    |
PHASE 3: NATURAL SELECTION
    |-- Fitness-proportional selection
    |-- Competition for resources
    |-- Survival of the fittest
    |-- Removal of unfit individuals
    |
PHASE 4: NICHE DYNAMICS
    |-- Partition into niches
    |-- Reproduce within niches
    |-- Enable adaptive radiation
    |-- Track niche populations
    |
PHASE 5: POPULATION DYNAMICS
    |-- Detect speciation events
    |-- Record extinctions
    |-- Update population structure
    |-- Calculate diversity metrics
    |
PHASE 6: REPORTING
    |-- Generate evolution report
    |-- Emit telemetry events
    |-- Update niche maps
    |-- Save to .claude/reports/darwinize/
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `darwinian-evolution-coordinator` | Multi-agent evolution |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](/glossary/quality-gates/) | Population viability enforcement | Diversity and niche gates |
| [Telemetry](/glossary/telemetry/) | Evolution event tracking | `[:prismatic, :evolution, :darwinian, *]` |
| Evolution Framework | Unified evolution engine | `Prismatic.Evolution.Engine` |
| Mendelian Mechanism | Genetic crossover complement | `Prismatic.Evolution.Mechanisms.Mendelian` |
| Mycelial Mechanism | Pattern propagation complement | `Prismatic.Evolution.Mechanisms.Mycelial` |

### Elixir API

```elixir
alias Prismatic.Evolution.{Engine, Mechanisms.Darwinian}

# Single evolution cycle
{:ok, result} = Engine.run_cycle(Darwinian, population)

# Multiple generations
{:ok, result} = Engine.run_generations(Darwinian, population, generations: 20)

# Custom configuration
{:ok, state} = Darwinian.init(
  environment: :production,
  selection_pressure: 0.7,
  survival_rate: 0.4,
  niche_count: 4
)

# Run until convergence
{:ok, result} = Engine.run_until_convergence(Darwinian, population)

# Chain with other mechanisms
{:ok, darwinian_result} = Engine.run_cycle(Darwinian, population)
{:ok, mycelial_result} = Engine.run_cycle(Mycelial, darwinian_result.population)
```

## Quality Gates

### Mandatory Population Gates

| Gate | Criteria | Enforcement |
|------|----------|-------------|
| **Population Viability** | Minimum population size maintained | Blocking |
| **Diversity Preservation** | Diversity index above 0.5 | Blocking |
| **Niche Balance** | At least 2 active niches | Blocking |
| **Fitness Progress** | Positive selection effect | Warning |

## Best Practices

1. **Match Environment to Goal**: Use production environment for stability optimization, research for innovation exploration. Mismatched environments produce suboptimal selection.

2. **Start with Moderate Pressure**: Begin with `--selection-pressure 0.5` and adjust based on results. High pressure (0.8+) can cause premature convergence and loss of diversity.

3. **Monitor Diversity**: Track the diversity index across generations. If diversity drops below 0.5, reduce selection pressure or increase niche count to prevent genetic bottleneck.

4. **Use Dry Run for Configuration Tuning**: Run `/darwinize adapt --dry-run` with different parameter combinations to preview expected outcomes before committing.

5. **Chain with Other Mechanisms**: Combine Darwinian selection with Mendelian crossover and Mycelial propagation for comprehensive evolution. Each mechanism addresses different aspects of optimization.

6. **Document Speciation Events**: Speciation events represent significant evolutionary milestones. Review and document the conditions that triggered speciation for future reference.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `POPULATION_EXTINCT` | Selection pressure too high | Reduce pressure or survival rate |
| `DIVERSITY_BOTTLENECK` | Population converged too quickly | Increase niche count or reduce pressure |
| `NICHE_COLLAPSE` | All individuals in single niche | Enable radiation, increase niche count |
| `GENERATION_TIMEOUT` | Generation processing exceeded limit | Reduce population size or simplify fitness function |
| `INVALID_ENVIRONMENT` | Unknown environment specified | Use: production, development, testing, research |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Per Generation | 1-5 seconds | Depends on population size |
| 10 Generations | 10-50 seconds | Standard configuration |
| 100 Generations | 2-10 minutes | Extended evolution |
| Population 500 | ~5 seconds/generation | Maximum population |
| Telemetry Overhead | < 50ms | Per event emission |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Quality gates are non-negotiable. Populations that violate viability or diversity thresholds trigger automatic intervention. No evolution cycle completes without gate validation.
- **NO DOUBTS**: Full investigation through multi-generation analysis before conclusions. Evolution results are evidence-based through fitness tracking, diversity metrics, and speciation event documentation.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for pattern propagation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/cascade](/commands/cascade/) - Execute CASCADE pattern fix for systematic anti-pattern removal
- [/coordinate](/commands/coordinate/) - Orchestrate complex multi-agent operations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)