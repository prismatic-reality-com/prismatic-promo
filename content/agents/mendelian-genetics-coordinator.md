+++
title = "mendelian-genetics-coordinator"
weight = 252
[extra]
domain = "medium-predator"
level = "L2"
description = "Genetic algorithm coordinator for pattern evolution and optimization"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "predator"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mendelian-genetics-coordinator", "Genetic", "agents", "agent", "Prismatic Platform", "Fitness", "Quality", "Weekly", "Mendelian Genetics"]
tags = ["agents", "agent", "mendelian-genetics-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "mendelian-genetics-coordinator - Prismatic Platform"
+++

## Overview

The Mendelian Genetics Coordinator operates as an L2 tactical operations agent within the Medium Predator domain of the Prismatic Platform. This agent applies genetic algorithm principles -- selection, crossover, mutation, and fitness evaluation -- to evolve quality patterns, detection rules, and optimization strategies across the platform. By treating platform configurations as genomes and quality metrics as fitness functions, the coordinator drives continuous improvement through evolutionary optimization.

The Prismatic Platform's quality patterns, risk scoring weights, and detection rules are not static configurations. They evolve through a Mendelian genetics-inspired process where high-performing pattern variants are selected for reproduction, combined through crossover operations, and occasionally mutated to explore new solution spaces. The Mendelian Genetics Coordinator manages this evolutionary process, maintaining population diversity, preventing premature convergence, and ensuring that every evolved pattern variant is validated before deployment.

## Operational Domain

The Medium Predator domain encompasses agents that apply adaptive optimization strategies across the platform. The Mendelian Genetics Coordinator provides the genetic algorithm engine that other evolutionary agents -- including the [SEADF](/glossary/seadf/) ecosystem commander and the autonomous evolution commander -- depend on for pattern optimization.

## Genetic Algorithm Architecture

The coordinator implements a complete genetic algorithm pipeline with domain-specific adaptations for platform pattern evolution.

```elixir
defmodule PrismaticAgents.MendelianGenetics do
  @moduledoc """
  Genetic algorithm coordinator for platform pattern evolution.
  Applies selection, crossover, mutation, and fitness evaluation
  to optimize quality patterns and detection rules.
  """

  use GenServer

  @population_size 50
  @elite_count 5
  @mutation_rate 0.05
  @crossover_rate 0.7
  @max_generations 100

  @type genome :: %{
    id: String.t(),
    genes: map(),
    fitness: float(),
    generation: non_neg_integer(),
    lineage: [String.t()]
  }

  @type population :: [genome()]

  @spec evolve(population(), fitness_function()) :: {:ok, genome()}
  def evolve(initial_population, fitness_fn) do
    GenServer.call(__MODULE__, {:evolve, initial_population, fitness_fn}, :timer.minutes(30))
  end

  @impl true
  def handle_call({:evolve, population, fitness_fn}, _from, state) do
    result = run_evolution(population, fitness_fn, @max_generations, 0)
    {:reply, {:ok, result}, update_evolution_history(state, result)}
  end

  defp run_evolution(population, fitness_fn, max_gen, current_gen) when current_gen >= max_gen do
    best_genome(population)
  end

  defp run_evolution(population, fitness_fn, max_gen, current_gen) do
    evaluated = evaluate_fitness(population, fitness_fn)
    elites = select_elites(evaluated, @elite_count)
    selected = tournament_selection(evaluated, @population_size - @elite_count)
    crossed = apply_crossover(selected, @crossover_rate)
    mutated = apply_mutation(crossed, @mutation_rate)
    new_population = elites ++ mutated

    if converged?(new_population) do
      best_genome(new_population)
    else
      run_evolution(new_population, fitness_fn, max_gen, current_gen + 1)
    end
  end
end
```

## Evolution Targets

The coordinator evolves multiple types of platform patterns, each with its own genome representation and fitness function.

| Evolution Target | Genome Representation | Fitness Function | Generation Cycle |
|---|---|---|---|
| Quality patterns | Pattern rules + thresholds | Quality score improvement | Weekly |
| Risk scoring weights | Weight vectors per dimension | Prediction accuracy | Bi-weekly |
| Detection rules | Rule conditions + actions | True positive rate | Weekly |
| Alert thresholds | Threshold values per metric | Signal-to-noise ratio | Monthly |
| Routing parameters | Provider weights + fallback chains | Cost-per-quality ratio | Weekly |

## Selection Strategies

The coordinator implements multiple selection strategies and adapts the strategy based on evolution progress.

| Strategy | When Used | Selection Pressure | Diversity Impact |
|---|---|---|---|
| Tournament Selection | Default strategy | Moderate | Preserves diversity |
| Roulette Wheel | Early generations | Low | Maximizes exploration |
| Rank-Based | Mid-evolution | Moderate-high | Balanced |
| Truncation | Near convergence | High | Accelerates convergence |
| Elitism | Always (top N) | Maximum for elites | Preserves best solutions |

## Crossover Operations

```elixir
defmodule PrismaticAgents.MendelianGenetics.Crossover do
  @spec single_point(genome(), genome()) :: {genome(), genome()}
  def single_point(parent_a, parent_b) do
    genes_a = Map.to_list(parent_a.genes)
    genes_b = Map.to_list(parent_b.genes)
    point = :rand.uniform(length(genes_a))

    {left_a, right_a} = Enum.split(genes_a, point)
    {left_b, right_b} = Enum.split(genes_b, point)

    child_a = Map.new(left_a ++ right_b)
    child_b = Map.new(left_b ++ right_a)

    {%{parent_a | genes: child_a, generation: parent_a.generation + 1},
     %{parent_b | genes: child_b, generation: parent_b.generation + 1}}
  end

  @spec uniform(genome(), genome(), float()) :: {genome(), genome()}
  def uniform(parent_a, parent_b, swap_probability \\ 0.5) do
    keys = Map.keys(parent_a.genes)

    {genes_a, genes_b} = Enum.reduce(keys, {%{}, %{}}, fn key, {acc_a, acc_b} ->
      if :rand.uniform() < swap_probability do
        {Map.put(acc_a, key, parent_b.genes[key]), Map.put(acc_b, key, parent_a.genes[key])}
      else
        {Map.put(acc_a, key, parent_a.genes[key]), Map.put(acc_b, key, parent_b.genes[key])}
      end
    end)

    {%{parent_a | genes: genes_a}, %{parent_b | genes: genes_b}}
  end
end
```

## Fitness Evaluation

Fitness evaluation is the critical component that connects genetic operations to real platform outcomes. Each genome is evaluated against live platform metrics.

| Metric Category | Weight | Evaluation Method | Minimum Threshold |
|---|---|---|---|
| Quality score impact | 40% | Before/after quality gate measurement | No regression |
| False positive rate | 25% | Detection accuracy on labeled dataset | < 5% false positives |
| Performance overhead | 15% | Execution time of evolved patterns | < 10ms per check |
| Coverage completeness | 20% | Coverage of target domain | > 95% coverage |

## Key Capabilities

- **Multi-target evolution** applying genetic algorithms to quality patterns, risk weights, detection rules, and routing parameters with domain-specific genome representations
- **Adaptive selection strategies** dynamically switching between tournament, roulette, rank-based, and truncation selection based on evolution progress and diversity metrics
- **Crossover and mutation** implementing single-point, uniform, and adaptive crossover operations with configurable mutation rates for solution space exploration
- **Fitness-driven optimization** evaluating evolved patterns against real platform metrics to ensure that evolutionary improvements translate to measurable quality gains
- **Population diversity management** preventing premature convergence through diversity monitoring, adaptive mutation rates, and immigration of random genomes
- **Lineage tracking** maintaining complete evolutionary histories for every genome to enable analysis of successful evolution paths

## Authority Level

**L2** - Tactical Operations. Domain-specific [tactical execution](/glossary/tactical-execution/) with cross-domain coordination capabilities. The coordinator manages genetic evolution operations and reports results to L3 evolution commanders.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [genetic-operations-controller](/agents/genetic-operations-controller/) | Operations Partner | Manages low-level genetic operation execution |
| [autonomous-evolution-commander](/agents/autonomous-evolution-commander/) | Evolution Authority | Receives evolved patterns for deployment approval |
| [cross-pollination-specialist](/agents/cross-pollination-specialist/) | Diversity Partner | Introduces cross-domain genetic material for diversity |
| [genetic-spec-propagator](/agents/genetic-spec-propagator/) | Propagation | Distributes approved evolved patterns across the platform |

## Integration

| Component | Relationship |
|---|---|
| [SEADF](/glossary/seadf/) | Evolutionary framework for ecosystem-wide optimization |
| [NABLA Infinity](/glossary/nabla-infinity/) | Fitness evaluation using multi-signal evidence |
| Platform [Telemetry](/glossary/telemetry/) | Real-time fitness metrics for evaluation |
| Quality DNA | Stores evolved pattern configurations |

## Enforcement

The Mendelian Genetics Coordinator operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Evolved patterns must demonstrate measurable improvement over the current baseline before deployment. Fitness evaluations use real platform metrics, never synthetic benchmarks. Population diversity is maintained above minimum thresholds to prevent local optima traps. Every evolved genome includes complete lineage provenance for traceability. Mutations that reduce fitness below baseline are immediately eliminated from the population.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)