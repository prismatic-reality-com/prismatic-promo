+++
title = "MENDEL: Genetic Algorithm System for Platform Evolution"
date = 2026-03-17
description = "How the MENDEL system uses genetic operators -- crossover, mutation, selection -- to evolve platform configurations, fitness evaluation, and generation tracking in Elixir."

[extra]
author = "Tomas Korcak (korczis)"
category = "evolution"
tags = ["genetic-algorithm", "evolution", "mendel", "optimization", "elixir"]
reading_time = "9 min"
keywords = ["genetic algorithm elixir", "mendel system", "evolutionary optimization", "fitness evaluation", "population management"]
image = "/images/blog/mendel-genetic-algorithm-system.png"
word_count = 1080
date_created = "2026-03-17"
date_modified = "2026-03-17"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "MENDEL: Genetic Algorithm System for Platform Evolution - Prismatic Platform"
+++

The MENDEL system applies genetic algorithm principles to platform evolution. Rather than manually tuning configurations, pipeline parameters, and quality thresholds, MENDEL breeds populations of candidate configurations, evaluates their fitness against real platform metrics, and selects the fittest for the next generation. This post covers the core genetic operators, fitness evaluation, and generation management implemented in Elixir.

## Core Concepts

MENDEL operates on a population of "chromosomes" -- each chromosome is a set of platform configuration parameters encoded as a map. The system evolves these through standard genetic operators:

| Operator | Purpose | Implementation |
|----------|---------|----------------|
| Selection | Choose parents for reproduction | Tournament selection (k=3) |
| Crossover | Combine traits from two parents | Uniform crossover with 50% swap rate |
| Mutation | Introduce random variation | Gaussian perturbation (sigma=0.1) |
| Elitism | Preserve best individuals | Top 10% pass unchanged |
| Fitness | Evaluate configuration quality | Multi-objective weighted sum |

## Chromosome Representation

Each chromosome encodes configuration parameters as a map of genes. Genes have types (float, integer, enum) and valid ranges:

```elixir
defmodule PrismaticMendel.Chromosome do
  @moduledoc """
  Chromosome representation for genetic algorithm.

  A chromosome is a collection of genes, each with a name,
  type, value, and valid range. Provides encoding/decoding
  between configuration maps and genetic representations.
  """

  @type gene :: %{
    name: atom(),
    type: :float | :integer | :enum,
    value: term(),
    min: number() | nil,
    max: number() | nil,
    options: [atom()] | nil
  }

  @type t :: %__MODULE__{
    id: String.t(),
    genes: [gene()],
    fitness: float() | nil,
    generation: non_neg_integer(),
    metadata: map()
  }

  defstruct [:id, :genes, :fitness, :generation, metadata: %{}]

  @spec new(keyword()) :: t()
  def new(opts) do
    %__MODULE__{
      id: generate_id(),
      genes: Keyword.fetch!(opts, :genes),
      fitness: nil,
      generation: Keyword.get(opts, :generation, 0),
      metadata: Keyword.get(opts, :metadata, %{})
    }
  end

  @spec to_config(t()) :: map()
  def to_config(%__MODULE__{genes: genes}) do
    Map.new(genes, fn gene -> {gene.name, gene.value} end)
  end

  @spec from_config(map(), [gene()]) :: t()
  def from_config(config, gene_templates) do
    genes =
      Enum.map(gene_templates, fn template ->
        %{template | value: Map.get(config, template.name, template.value)}
      end)

    new(genes: genes)
  end

  defp generate_id, do: Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
end
```

## Genetic Operators

The operators module implements selection, crossover, and mutation with configurable parameters:

```elixir
defmodule PrismaticMendel.Operators do
  @moduledoc """
  Genetic operators for population evolution.

  Implements tournament selection, uniform crossover,
  Gaussian mutation, and elitism preservation. All operators
  are pure functions operating on chromosome structs.
  """

  alias PrismaticMendel.Chromosome

  @spec tournament_select([Chromosome.t()], non_neg_integer()) :: Chromosome.t()
  def tournament_select(population, tournament_size \\ 3) do
    population
    |> Enum.take_random(tournament_size)
    |> Enum.max_by(& &1.fitness)
  end

  @spec crossover(Chromosome.t(), Chromosome.t(), float()) :: {Chromosome.t(), Chromosome.t()}
  def crossover(parent1, parent2, swap_rate \\ 0.5) do
    {genes1, genes2} =
      Enum.zip(parent1.genes, parent2.genes)
      |> Enum.map(fn {g1, g2} ->
        if :rand.uniform() < swap_rate do
          {%{g1 | value: g2.value}, %{g2 | value: g1.value}}
        else
          {g1, g2}
        end
      end)
      |> Enum.unzip()

    child1 = %{parent1 | genes: genes1, fitness: nil, id: Chromosome.generate_id()}
    child2 = %{parent2 | genes: genes2, fitness: nil, id: Chromosome.generate_id()}
    {child1, child2}
  end

  @spec mutate(Chromosome.t(), float(), float()) :: Chromosome.t()
  def mutate(chromosome, mutation_rate \\ 0.1, sigma \\ 0.1) do
    mutated_genes =
      Enum.map(chromosome.genes, fn gene ->
        if :rand.uniform() < mutation_rate do
          mutate_gene(gene, sigma)
        else
          gene
        end
      end)

    %{chromosome | genes: mutated_genes, fitness: nil}
  end

  defp mutate_gene(%{type: :float, value: v, min: min, max: max} = gene, sigma) do
    range = max - min
    perturbation = :rand.normal() * sigma * range
    new_value = clamp(v + perturbation, min, max)
    %{gene | value: new_value}
  end

  defp mutate_gene(%{type: :integer, value: v, min: min, max: max} = gene, sigma) do
    range = max - min
    perturbation = round(:rand.normal() * sigma * range)
    new_value = clamp(v + perturbation, min, max)
    %{gene | value: new_value}
  end

  defp mutate_gene(%{type: :enum, options: options} = gene, _sigma) do
    %{gene | value: Enum.random(options)}
  end

  defp clamp(value, min, max), do: value |> max(min) |> min(max)
end
```

## Fitness Evaluation

Fitness is computed by applying a candidate configuration to the platform and measuring multiple objectives. The fitness function is a weighted sum of normalized metrics:

```elixir
defmodule PrismaticMendel.Fitness do
  @moduledoc """
  Multi-objective fitness evaluation for chromosomes.

  Evaluates configurations against platform metrics including
  response time, throughput, error rate, and resource usage.
  Returns a single fitness score as a weighted sum.
  """

  alias PrismaticMendel.Chromosome

  @type objective :: %{
    name: atom(),
    weight: float(),
    direction: :minimize | :maximize,
    measure: (map() -> float())
  }

  @objectives [
    %{name: :response_time, weight: 0.3, direction: :minimize,
      measure: &__MODULE__.measure_response_time/1},
    %{name: :throughput, weight: 0.25, direction: :maximize,
      measure: &__MODULE__.measure_throughput/1},
    %{name: :error_rate, weight: 0.25, direction: :minimize,
      measure: &__MODULE__.measure_error_rate/1},
    %{name: :resource_usage, weight: 0.2, direction: :minimize,
      measure: &__MODULE__.measure_resource_usage/1}
  ]

  @spec evaluate(Chromosome.t()) :: Chromosome.t()
  def evaluate(chromosome) do
    config = Chromosome.to_config(chromosome)

    scores =
      Enum.map(@objectives, fn objective ->
        raw = objective.measure.(config)
        normalized = normalize(raw, objective.direction)
        {objective.name, normalized * objective.weight}
      end)

    total_fitness = scores |> Enum.map(&elem(&1, 1)) |> Enum.sum()

    %{chromosome |
      fitness: total_fitness,
      metadata: Map.put(chromosome.metadata, :scores, Map.new(scores))
    }
  end

  defp normalize(value, :minimize), do: 1.0 / (1.0 + value)
  defp normalize(value, :maximize), do: value / (1.0 + value)

  @spec measure_response_time(map()) :: float()
  def measure_response_time(config) do
    # Apply config and measure average response time
    PrismaticTelemetry.Metrics.avg_response_time(config)
  end

  @spec measure_throughput(map()) :: float()
  def measure_throughput(config) do
    PrismaticTelemetry.Metrics.requests_per_second(config)
  end

  @spec measure_error_rate(map()) :: float()
  def measure_error_rate(config) do
    PrismaticTelemetry.Metrics.error_rate(config)
  end

  @spec measure_resource_usage(map()) :: float()
  def measure_resource_usage(config) do
    PrismaticTelemetry.Metrics.cpu_memory_composite(config)
  end
end
```

| Objective | Weight | Direction | Metric Source |
|-----------|--------|-----------|---------------|
| Response Time | 0.30 | Minimize | Telemetry avg_response_time |
| Throughput | 0.25 | Maximize | Telemetry requests/sec |
| Error Rate | 0.25 | Minimize | Telemetry error percentage |
| Resource Usage | 0.20 | Minimize | CPU + memory composite |

## Generation Management

The generation manager orchestrates the evolutionary loop, tracking population statistics and convergence:

```elixir
defmodule PrismaticMendel.GenerationManager do
  @moduledoc """
  Manages the evolutionary loop across generations.

  Coordinates selection, crossover, mutation, and fitness
  evaluation for each generation. Tracks convergence and
  terminates when improvement stalls.
  """

  use GenServer
  require Logger

  alias PrismaticMendel.{Chromosome, Operators, Fitness}

  @type state :: %{
    population: [Chromosome.t()],
    generation: non_neg_integer(),
    best_fitness: float(),
    stall_count: non_neg_integer(),
    config: map()
  }

  @default_config %{
    population_size: 50,
    elitism_rate: 0.1,
    crossover_rate: 0.8,
    mutation_rate: 0.1,
    max_generations: 100,
    stall_limit: 10
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec evolve_generation(pid()) :: {:ok, map()} | {:converged, Chromosome.t()}
  def evolve_generation(pid \\ __MODULE__) do
    GenServer.call(pid, :evolve, 60_000)
  end

  @impl GenServer
  def init(opts) do
    config = Map.merge(@default_config, Map.new(opts))
    population = initialize_population(config.population_size)

    {:ok, %{
      population: population,
      generation: 0,
      best_fitness: 0.0,
      stall_count: 0,
      config: config
    }}
  end

  @impl GenServer
  def handle_call(:evolve, _from, state) do
    evaluated = Enum.map(state.population, &Fitness.evaluate/1)
    best = Enum.max_by(evaluated, & &1.fitness)

    Logger.info(
      "Generation #{state.generation}: best=#{Float.round(best.fitness, 4)}, " <>
      "avg=#{Float.round(avg_fitness(evaluated), 4)}"
    )

    new_stall = if best.fitness > state.best_fitness, do: 0, else: state.stall_count + 1

    if new_stall >= state.config.stall_limit do
      {:reply, {:converged, best}, state}
    else
      next_population = breed_next_generation(evaluated, state.config)
      new_state = %{state |
        population: next_population,
        generation: state.generation + 1,
        best_fitness: max(best.fitness, state.best_fitness),
        stall_count: new_stall
      }
      {:reply, {:ok, generation_stats(evaluated, state.generation)}, new_state}
    end
  end

  defp breed_next_generation(population, config) do
    sorted = Enum.sort_by(population, & &1.fitness, :desc)
    elite_count = round(length(sorted) * config.elitism_rate)
    elite = Enum.take(sorted, elite_count)

    children_needed = config.population_size - elite_count

    children =
      Stream.repeatedly(fn ->
        parent1 = Operators.tournament_select(sorted)
        parent2 = Operators.tournament_select(sorted)
        {child1, child2} = Operators.crossover(parent1, parent2, config.crossover_rate)
        [Operators.mutate(child1, config.mutation_rate),
         Operators.mutate(child2, config.mutation_rate)]
      end)
      |> Stream.flat_map(& &1)
      |> Enum.take(children_needed)

    elite ++ children
  end

  defp avg_fitness(population) do
    population |> Enum.map(& &1.fitness) |> Enum.sum() |> Kernel./(length(population))
  end
end
```

MENDEL enables the platform to self-optimize over time. Configuration parameters that would take engineers weeks to tune through trial-and-error are discovered through evolutionary search. The genetic approach is particularly effective for multi-objective optimization where tradeoffs between competing goals (latency vs throughput, quality vs speed) are not obvious.
