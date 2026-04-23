+++
title = "/auto-pro"
weight = 30
[extra]
category = "Orchestration"
description = "Steroids edition with genetic optimization, swarm intelligence and quantum decisions"
syntax = "/auto-pro [options]"
authority = "COSMIC+"
agent = "archer-supreme"
status = "Experimental"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1248
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["auto-pro", "Steroids", "commands", "Orchestration", "Prismatic Platform", "COSMIC", "Phase", "MENDEL", "Cross"]
tags = ["commands", "orchestration", "auto-pro", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/auto-pro - Prismatic Platform"
+++

## Overview

The **/auto-pro** command is the professional-grade autonomous development engine that extends the base [/auto](/commands/auto/) command with MENDEL genetic optimization, mycelial network pattern propagation, and multi-objective fitness optimization. Where /auto performs standard evolution cycles of scan-plan-implement-verify, /auto-pro introduces biologically-inspired algorithms that discover improvement patterns through genetic selection, crossover, and mutation operations, then propagate successful patterns across the entire platform through the mycelial intelligence network.

The distinction between /auto and /auto-pro is analogous to the difference between gradient descent and evolutionary algorithms in machine learning. Standard /auto follows a deterministic improvement path, addressing the most impactful opportunities first and working down the priority list. /auto-pro, by contrast, maintains a population of candidate improvements that compete, combine, and evolve over multiple generations. This approach excels at discovering non-obvious optimization paths that deterministic analysis would miss, particularly in complex domains where the interaction between multiple changes produces emergent benefits that no single change would achieve in isolation.

Operating at the COSMIC+ authority level and executed by the `archer-supreme` agent, /auto-pro represents the second tier in the platform's autonomous development hierarchy. It is classified as experimental, reflecting the inherently exploratory nature of genetic optimization. The command is part of the platform's 216-command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard, and enforces a quality floor of 100/100 throughout all genetic operations, ensuring that evolutionary exploration never compromises platform stability.

## Usage

```bash
/auto-pro [mission] [options]
```

The command accepts an optional mission description that guides the direction of genetic evolution, along with several options that control the behavior of the MENDEL and mycelial subsystems.

### Examples

```bash
# Professional autonomous evolution with all defaults
/auto-pro

# Evolution with a specific mission objective
/auto-pro "Optimize storage layer performance across all adapters"

# Extended genetic generations for deeper exploration
/auto-pro --generations=10

# Disable mycelial propagation for isolated experimentation
/auto-pro --mycelial=false

# Custom quality floor for exploratory work
/auto-pro --quality-floor=95

# Targeted mission with extended generations
/auto-pro "Eliminate all unsafe map access patterns" --generations=8
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **mission** | string | No | Auto-detected | Mission description guiding the direction of genetic evolution |
| **--mendel** | boolean | No | `true` | Enable MENDEL genetic evolution algorithm |
| **--mycelial** | boolean | No | `true` | Enable mycelial network pattern propagation |
| **--generations** | integer | No | `5` | Number of genetic generations to evolve |
| **--quality-floor** | integer | No | `100` | Minimum quality score to maintain throughout evolution |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | COSMIC+ |
| **Executing Agent** | `archer-supreme` |
| **Status** | Experimental |
| **Usage Frequency** | Medium |
| **Category** | Orchestration |
| **Read Access** | All applications, mycelial network state, genetic population history |
| **Write Access** | Source files, pattern library, mycelial knowledge base, fitness metrics |
| **Escalation Path** | COSMIC+ -> COSMIC++ for formal verification requirements |
| **Rollback Capability** | Per-generation rollback with population history preservation |

## Technical Implementation

The /auto-pro command implements a five-phase workflow that combines genetic algorithm operations with mycelial network intelligence. The MENDEL subsystem maintains a population of candidate improvement strategies that evolve through selection, crossover, and mutation operations. The mycelial subsystem connects discovered patterns to a cross-domain knowledge network, enabling successful improvements in one domain to propagate to analogous structures in other domains.

```elixir
defmodule Prismatic.Commands.AutoPro do
  @moduledoc """
  Professional autonomous evolution with MENDEL genetics
  and mycelial pattern propagation.
  """

  @default_generations 5
  @quality_floor 100

  @spec execute(mission :: String.t() | nil, opts :: keyword()) ::
          {:ok, EvolutionReport.t()} | {:error, term()}
  def execute(mission \\ nil, opts \\ []) do
    generations = Keyword.get(opts, :generations, @default_generations)
    mendel_enabled = Keyword.get(opts, :mendel, true)
    mycelial_enabled = Keyword.get(opts, :mycelial, true)

    with {:ok, population} <- initialize_population(mission, mendel_enabled),
         {:ok, mycelial_state} <- connect_mycelial_network(mycelial_enabled),
         {:ok, evolved} <- run_genetic_evolution(population, generations, mycelial_state),
         {:ok, propagated} <- propagate_patterns(evolved, mycelial_state),
         {:ok, report} <- generate_evolution_report(evolved, propagated) do
      {:ok, report}
    end
  end

  defp run_genetic_evolution(population, generations, mycelial_state) do
    Enum.reduce_while(1..generations, {:ok, population}, fn gen, {:ok, pop} ->
      with {:ok, selected} <- select_fittest(pop),
           {:ok, crossed} <- crossover(selected),
           {:ok, mutated} <- mutate(crossed),
           {:ok, validated} <- verify_quality_floor(mutated) do
        {:cont, {:ok, %{pop | generation: gen, individuals: validated}}}
      else
        {:error, _} = error -> {:halt, error}
      end
    end)
  end
end
```

Phase 1 (Genetic Initialization) creates the initial population of improvement candidates by analyzing the codebase scope defined by the mission. Each individual in the population represents a specific improvement strategy with associated fitness metrics. Phase 2 (Mycelial Analysis) connects to the platform's mycelial knowledge network, discovering cross-domain patterns and aggregating collective intelligence from previous evolution sessions. Phase 3 (Evolution Cycles) runs the configured number of genetic generations, with selection based on multi-objective fitness, crossover for combining successful strategies, and mutation for exploration of novel approaches. Phase 4 (Pattern Propagation) takes the fittest strategies from the final generation and propagates them through the mycelial network to all analogous code structures platform-wide. Phase 5 (Validation and Report) performs comprehensive testing, quality gate verification, and generates a detailed evolution report documenting all changes and their rationale.

### Feature Comparison with /auto

| Feature | /auto | /auto-pro |
|---------|-------|-----------|
| Evolution Cycles | 3 | 5+ (genetic generations) |
| MENDEL Genetics | No | Yes |
| Mycelial Network | No | Yes |
| Quality Floor | 95 | 100 |
| Cross-Domain Intel | Limited | Full |
| Fitness Optimization | Single-objective | Multi-objective |
| Pattern Propagation | Local | Platform-wide |

## Workflow Integration

The /auto-pro command is designed for scenarios where standard /auto evolution has plateaued or where the improvement domain is complex enough to benefit from genetic exploration. It fits into the development workflow at several key points.

The typical escalation pattern follows the autonomous development hierarchy: start with `/auto` for quick, deterministic improvements, then escalate to `/auto-pro` when deeper optimization is needed, and finally to [/auto-ultimate](/commands/auto-ultimate/) when formal verification of evolution results is required. Each tier builds on the previous one, ensuring that the simplest effective tool is always used first.

Common workflow patterns include:

1. **Post-/auto Plateau**: When `/auto evolve` returns reports showing diminishing improvements, escalate to `/auto-pro` to discover deeper optimization paths
2. **Cross-Domain Optimization**: Use `/auto-pro --mycelial=true` when improvements in one application should propagate to similar structures across the platform
3. **Mission-Driven Evolution**: Provide specific mission descriptions to focus genetic exploration on a targeted objective rather than general improvement
4. **Experimental Exploration**: Use with `--quality-floor=95` for more aggressive exploration that allows temporary quality trade-offs
5. **Pattern Library Building**: Run /auto-pro regularly to expand the mycelial knowledge base with new successful patterns

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `archer-supreme` agent with COSMIC+ authority |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Per-generation quality validation with automatic rollback |
| [Telemetry](/glossary/telemetry/) | Genetic fitness [metrics](/glossary/metrics/), generation tracking, propagation events |
| MENDEL Engine | Genetic algorithm operations: selection, crossover, mutation |
| Mycelial Network | Cross-domain pattern propagation and collective intelligence |
| Quality DNA | Fitness trajectory persistence across sessions |
| SEADF Framework | Autonomous evolution subsystem with ecosystem coordination |
| Pattern Library | Storage of successful evolution patterns for reuse |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Despite its experimental classification, /auto-pro enforces the same quality floor as production commands. Every generation in the genetic evolution must pass all quality gates. Mutations that introduce regressions are eliminated in the selection phase. The mycelial propagation system only distributes patterns that have been validated in their source domain. Zero tolerance for incomplete or quality-compromising evolution results.
- **NO DOUBTS**: Genetic fitness functions are defined by measurable, evidence-based criteria (quality score, test coverage, static analysis results, performance metrics). The multi-objective optimization ensures that no single metric is improved at the expense of others without explicit awareness. Evolution reports include full provenance for every change, tracing it back to the specific generation, crossover, or mutation event that produced it.
- **NABLA Compliance**: The mycelial network enforces signal plurality by requiring that patterns discovered in one domain be independently validated in the target domain before propagation is considered successful. Contradiction preservation is built into the genetic population: contradictory improvement strategies are maintained in the population rather than prematurely eliminated, allowing genetic recombination to explore hybrid approaches.

## Best Practices

1. **Escalate from /auto**: Only use /auto-pro after standard /auto has been run and its opportunities exhausted; genetic optimization has overhead that is unnecessary for simple improvements
2. **Provide clear missions**: The genetic algorithm converges faster when given a specific mission description that constrains the search space
3. **Start with fewer generations**: Begin with `--generations=3` and increase only if the fitness curve has not plateaued, as each generation has a computational cost
4. **Review propagation targets**: After mycelial propagation, review the target files to ensure that patterns were applied appropriately in their new context
5. **Track fitness trajectories**: Monitor the multi-objective fitness scores across generations to ensure the algorithm is converging toward meaningful improvements rather than cycling
6. **Use --mycelial=false for isolation**: When experimenting with a single application, disable mycelial propagation to avoid premature cross-domain effects

## Related Commands

- [/orchestrate](/commands/orchestrate/) - Revolutionary AI-powered task orchestration with 10x development efficiency
- [/auto](/commands/auto/) - Intelligent autonomous evolution engine for zero-human-intervention improvements
- [/auto-ultimate](/commands/auto-ultimate/) - Maximum [intelligence fusion](/glossary/intelligence-fusion/) combining MENDEL, MYCELIALIZE and AXON/EXLA neural computing
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/cascade](/commands/cascade/) - Execute [CASCADE pattern](/glossary/cascade-pattern/) fix for systematic anti-pattern removal
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)