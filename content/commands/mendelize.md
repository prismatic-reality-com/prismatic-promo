+++
title = "/mendelize"
weight = 460
[extra]
category = "Evolution"
description = "Genetic algorithm operations with Mendelian inheritance patterns"
syntax = "/mendelize [options]"
authority = "L3"
agent = "mendelian-genetics-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1328
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mendelize", "Genetic", "Mendelian", "commands", "Evolution", "Prismatic Platform", "Subcommand", "String", "Fitness"]
tags = ["commands", "evolution", "mendelize", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mendelize - Prismatic Platform"
+++

## Overview

**/mendelize** is a production command in the **Evolution** category of the Prismatic Platform. It implements genetic algorithm operations inspired by Mendelian inheritance patterns, applying the principles of dominant/recessive traits, genetic crossover, mutation, and natural selection to the platform's agent population and code patterns. Named after Gregor Johann Mendel, the founder of modern genetics, this command treats platform components as organisms whose traits can be selectively bred for improved fitness.

The biological metaphor is not merely decorative. The platform's 400+ agents each possess a set of quantifiable traits: response latency, accuracy, resource efficiency, error rate, and specialization depth. These traits behave analogously to biological phenotypes -- they are expressed (measurable in production) and heritable (new agents can inherit trait combinations from existing high-performing agents). The `/mendelize` command manages the genetic lifecycle: trait assessment, parent selection, crossover recombination, controlled mutation, offspring evaluation, and population management.

This command operates under the **L3** authority level and is executed by the `mendelian-genetics-coordinator` agent, a specialized evolution agent that maintains the platform's genetic trait registry and population fitness metrics. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority requirement ensures that genetic operations, which can significantly alter agent behavior through trait recombination, are performed under appropriate oversight.

The genetic approach to platform evolution has proven particularly effective at exploring large optimization spaces where gradient-based or exhaustive approaches are impractical. By maintaining a diverse population of trait combinations and applying selection pressure through fitness evaluation, the platform discovers effective configurations that might never be found through manual tuning or deterministic optimization.

## Architecture

The Mendelian genetics system is built on a classical genetic algorithm architecture adapted for the Prismatic Platform's OTP-based agent ecosystem.

```
+---------------------+     +---------------------+     +---------------------+
|  Trait Registry     |---->|  Fitness Evaluator   |---->|  Selection Engine   |
|  (Phenotype Store)  |     |  (Multi-Objective)   |     |  (Tournament/Rank)  |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Crossover Engine   |---->|  Mutation Operator   |---->|  Offspring Evaluator|
|  (Recombination)    |     |  (Controlled Noise)  |     |  (Fitness Test)     |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Population Manager |---->|  Generational Log    |---->|  Trait Genealogy    |
|  (Elitism/Cull)     |     |  (History Tracking)  |     |  (Inheritance Tree) |
+---------------------+     +---------------------+     +---------------------+
```

The **Trait Registry** stores the phenotypic expression of each agent in the population. Traits are measured values (latency in milliseconds, accuracy as percentage, resource consumption in MB) rather than abstract genetic codes, ensuring that the genetic algorithm operates on production-relevant properties.

The **Fitness Evaluator** computes multi-objective fitness scores from trait vectors using configurable weighting. Different evolution campaigns can emphasize different objectives (minimize latency versus maximize accuracy) by adjusting fitness function weights.

The **Selection Engine** implements both tournament selection and rank-based selection strategies. Tournament selection provides stochastic selection pressure with configurable tournament size, while rank-based selection ensures deterministic proportional representation of high-fitness individuals.

The **Crossover Engine** combines traits from two parent agents to produce offspring trait vectors. It supports uniform crossover (each trait independently selected from either parent), single-point crossover (traits split at a random point), and blend crossover (traits interpolated between parents).

The **Mutation Operator** introduces controlled random perturbations to offspring traits, preventing premature convergence and maintaining population diversity. Mutation rate and magnitude are adaptive, increasing when population diversity falls below a threshold.

## Usage

### Population Assessment

```bash
# Show current population fitness summary
/mendelize status

# Display trait distributions across the population
/mendelize traits

# Rank agents by fitness score
/mendelize rank --top=20

# Show trait genealogy for a specific agent
/mendelize genealogy --agent=delta-force-commander
```

### Evolution Operations

```bash
# Execute a single generation of genetic evolution
/mendelize evolve

# Execute multiple generations
/mendelize evolve --generations=10

# Evolve with specific fitness objective
/mendelize evolve --objective=minimize-latency

# Evolve a specific agent subpopulation
/mendelize evolve --population=intelligence-agents
```

### Trait Management

```bash
# Register a new trait for tracking
/mendelize register-trait --name=cache-hit-rate --type=percentage --objective=maximize

# Update trait measurements from production telemetry
/mendelize measure --source=telemetry --period=7d

# Export trait data for external analysis
/mendelize export --format=csv --output=traits.csv
```

### Analysis

```bash
# Show convergence analysis
/mendelize convergence

# Identify dominant trait combinations
/mendelize dominance-analysis

# Show Pareto frontier of multi-objective optimization
/mendelize pareto --objectives=latency,accuracy
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | Subcommand | -- | Show population fitness summary |
| `traits` | Subcommand | -- | Display trait distributions |
| `rank` | Subcommand | -- | Rank agents by fitness |
| `evolve` | Subcommand | -- | Execute genetic evolution |
| `genealogy` | Subcommand | -- | Show trait inheritance history |
| `measure` | Subcommand | -- | Update trait measurements |
| `convergence` | Subcommand | -- | Convergence analysis |
| `--generations` | Integer | 1 | Number of generations to evolve |
| `--objective` | String | balanced | Fitness objective (balanced, minimize-latency, maximize-accuracy, minimize-resources) |
| `--population` | String | all | Target subpopulation for evolution |
| `--selection` | String | tournament | Selection strategy (tournament, rank, roulette) |
| `--crossover` | String | uniform | Crossover method (uniform, single-point, blend) |
| `--mutation-rate` | Float | 0.05 | Mutation probability per trait (0.0-1.0) |
| `--elitism` | Integer | 5 | Number of top-fitness individuals preserved unchanged |
| `--top` | Integer | 10 | Number of results for ranking operations |
| `--agent` | String | none | Target agent for genealogy queries |
| `--source` | String | telemetry | Data source for trait measurement |
| `--period` | Duration | 24h | Measurement period for trait evaluation |
| `--format` | String | table | Output format (table, json, csv, markdown) |
| `--verbose` | Flag | false | Show detailed genetic operation logs |

## Execution Flow

1. **Authority Verification** -- L3 authority is confirmed for the requesting operator. Genetic operations can significantly alter agent behavior and require appropriate oversight.

2. **Population Loading** -- The current agent population is loaded from the Trait Registry with their latest measured trait values. Population metadata (generation count, diversity index, fitness statistics) is computed.

3. **Fitness Evaluation** -- Multi-objective fitness scores are computed for each individual using the configured fitness function and objective weights. The fitness landscape is characterized (unimodal, multimodal, deceptive) for strategy selection.

4. **Parent Selection** -- High-fitness individuals are selected as parents according to the configured selection strategy. The selection process balances exploitation (favoring high-fitness parents) with exploration (maintaining diversity).

5. **Crossover Recombination** -- Selected parent pairs produce offspring through the configured crossover method. Each offspring inherits a combination of traits from both parents, potentially discovering beneficial trait combinations not present in either parent.

6. **Mutation Application** -- Controlled random mutations are applied to offspring traits. The mutation operator respects trait constraints (minimum/maximum values, type restrictions) and adapts its magnitude based on population diversity.

7. **Offspring Evaluation** -- Offspring fitness is evaluated, ideally through production testing or simulation. Offspring that fail quality thresholds are eliminated before entering the population.

8. **Population Update** -- The population is updated through elitist replacement: the top N individuals are preserved unchanged, and remaining slots are filled by offspring. Individuals below the survival threshold are retired.

9. **Generational Logging** -- The complete generational record (parents, offspring, fitness scores, trait changes) is logged for genealogy tracking and convergence analysis.

10. **Telemetry Emission** -- Evolution metrics (fitness delta, diversity index, convergence rate) are emitted for platform-wide observability.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Population Source | Agent population provides individuals for genetic operations |
| [Telemetry](/glossary/telemetry/) | Trait Measurement | Production telemetry provides trait values |
| [Quality Gates](/glossary/quality-gates/) | Offspring Validation | Quality gates validate offspring fitness |
| [Mega-Evolve](/commands/mega-evolve/) | Phase Integration | Genetic operations as Phase 5 of mega-evolution |
| [Quality DNA](/glossary/quality-dna/) | State Persistence | Genetic state persisted across sessions |
| [Mycelialize](/commands/mycelialize/) | Pattern Source | Beneficial trait patterns can be propagated via mycelial network |
| [NABLA Infinity](/glossary/nabla-infinity/) | Epistemic Framework | Fitness claims validated through evidence-based assessment |

## Best Practices

**Maintain Population Diversity**: Monitor the diversity index through `/mendelize convergence`. If diversity drops below 0.3, increase mutation rate or introduce random individuals to prevent premature convergence.

**Multi-Objective Balancing**: Use the `balanced` objective for routine evolution. Switch to specific objectives (minimize-latency, maximize-accuracy) only when targeting a known weakness.

**Elitism Preservation**: Keep the elitism parameter at 5-10% of population size to preserve proven high-performers while allowing evolutionary exploration.

**Measure Before Evolving**: Always run `/mendelize measure` with recent production telemetry before evolution to ensure trait values reflect current performance rather than historical data.

**Generational Patience**: Genetic algorithms require multiple generations to produce meaningful improvement. Run at least 5-10 generations before evaluating whether the evolution strategy is effective.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Insufficient population size | Error with minimum population requirement | Add agents to the population or reduce elitism count |
| Trait measurement unavailable | Warning; affected traits use last known value | Ensure telemetry collection is active |
| Fitness evaluation failure | Offspring marked as unfit; excluded from population | Investigate evaluation criteria and trait constraints |
| Convergence detected | Informational warning with diversity metrics | Increase mutation rate or inject random individuals |
| Trait constraint violation | Mutation clamped to valid range | Review trait constraints if violations are frequent |

## Advanced Usage

### Custom Fitness Functions

Define domain-specific fitness functions for specialized evolution campaigns:

```bash
# Evolve with custom weighted fitness function
/mendelize evolve --weights="latency:0.4,accuracy:0.4,memory:0.2"

# Evolve with penalty function for constraint violations
/mendelize evolve --penalty=constraint-violation --penalty-weight=0.5
```

### Cross-Population Breeding

Combine traits from different agent subpopulations:

```bash
# Cross-breed intelligence and security agent populations
/mendelize crossbreed --pop-a=intelligence-agents --pop-b=security-agents
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for fitness degradation. Offspring that fail quality gates are eliminated without exception. The elitism mechanism ensures that proven high-performers are never lost to evolutionary noise. Every generation must maintain or improve the population's aggregate fitness.
- **NO DOUBTS**: Full measurement-based evaluation of all genetic operations. Fitness scores are derived from production telemetry, not theoretical estimates. Trait genealogy provides complete provenance for every trait value in the population, supporting reproducibility and audit.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)