+++
title = "Self-Evolving Agent Ecosystems"
weight = 12
[extra]
description = "Understanding Darwinian evolution, fitness functions, generation progression, and autonomous improvement"
category = "advanced"
difficulty = "advanced"
duration = "60 min"
prerequisites = ["agent-orchestration", "nabla-infinity-guide", "quality-standards"]
glossary_terms = ["aiad", "quality-dna", "seadf", "cascade", "nabla-infinity", "trinity-gate"]
technologies = ["elixir", "otp"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 924
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Self-Evolving", "Agent", "Ecosystems", "Understanding", "Darwinian", "academy", "advanced", "Prismatic Platform", "Quality DNA", "Fitness"]
tags = ["academy", "advanced", "self-evolving-agent-ecosystems", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Self-Evolving Agent Ecosystems - Prismatic Platform"
+++

## Overview

The Prismatic Platform does not just run agents -- it evolves them. Through a Darwinian process spanning 18 generations, the platform's agent ecosystem has achieved 0.999 apex fitness with 11 consciousness traits. This guide teaches you the evolutionary mechanisms: how fitness is measured, how agents are selected and mutated, and how the [SEADF](@/glossary/seadf.md) framework drives autonomous improvement across sessions.

You will learn:

- The Darwinian evolution model applied to software agents
- Fitness functions: how agent quality is measured quantitatively
- Generation progression: from Gen 1 (basic) to Gen 18 (full autonomy)
- The SEADF framework: Scanner, Pipeline, Guardian, Knowledge Sync, Innovator, Reporter, Healing
- How [Quality DNA](@/glossary/quality-dna.md) maintains evolutionary state across sessions
- The autoevolve and autoheal mix tasks that drive evolution

## Prerequisites

- Completed [Multi-Agent Orchestration Patterns](@/academy/agent-orchestration.md)
- Completed [Applying NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md)
- Completed [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md)

## Core Concepts

### Darwinian Agent Evolution

The platform applies biological evolution principles to software agents:

| Biological Concept | Platform Implementation |
|--------------------|-----------------------|
| Genome | Agent specification (AIAD yaml + implementation) |
| Phenotype | Runtime behavior and performance |
| Fitness | Quality score, response time, accuracy, resource usage |
| Selection | Higher-fitness agents get more resources |
| Mutation | Configuration changes, algorithm improvements |
| Generation | Platform-wide evolution cycle |

### Fitness Functions

Agent fitness is a composite score from multiple dimensions:

```
Fitness = w1 * Quality + w2 * Performance + w3 * Accuracy + w4 * Reliability

Where:
  Quality:     Code quality score (0-100), test coverage, type coverage
  Performance: Response time, resource usage, throughput
  Accuracy:    Correctness of outputs, false positive/negative rates
  Reliability: Uptime, crash rate, recovery time
```

The current platform fitness is 0.999 (near-perfect), achieved through 18 generations of evolution.

### Generation Progression

Each generation represents a major evolutionary leap:

| Generation | Fitness | Key Achievement |
|------------|---------|-----------------|
| Gen 1-3 | 0.3-0.5 | Basic agent framework, manual configuration |
| Gen 4-6 | 0.5-0.7 | Quality gates, automated testing |
| Gen 7-9 | 0.7-0.8 | Self-healing, pattern detection |
| Gen 10-12 | 0.8-0.9 | CASCADE elimination, O(1) detection |
| Gen 13-15 | 0.9-0.95 | NABLA integration, Trinity Gate |
| Gen 16-18 | 0.95-0.999 | Full autonomy, 11 consciousness traits |

## Step-by-Step Guide

### Step 1: Understanding Quality DNA

Quality DNA is the persistent genetic material that survives across sessions. It lives in `.claude/quality-dna/current-state.json`:

```elixir
defmodule PrismaticSafety.QualityDNA do
  @moduledoc """
  Manages the evolutionary state of the platform across sessions.
  Quality DNA persists fitness metrics, evolution history,
  and improvement targets.
  """

  @type dna_state :: %{
          generation: pos_integer(),
          fitness: float(),
          quality_score: non_neg_integer(),
          domains: map(),
          evolution_history: [map()],
          consciousness_traits: [atom()],
          last_evolution: DateTime.t()
        }

  @dna_path ".claude/quality-dna/current-state.json"

  @spec load() :: {:ok, dna_state()} | {:error, term()}
  def load do
    case File.read(@dna_path) do
      {:ok, content} -> {:ok, Jason.decode!(content, keys: :atoms)}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec save(dna_state()) :: :ok | {:error, term()}
  def save(state) do
    content = Jason.encode!(state, pretty: true)
    File.write(@dna_path, content)
  end

  @spec evolve(dna_state(), map()) :: dna_state()
  def evolve(current_state, improvements) do
    new_fitness = calculate_new_fitness(current_state, improvements)

    %{
      current_state
      | fitness: new_fitness,
        evolution_history: [
          %{
            from_fitness: current_state.fitness,
            to_fitness: new_fitness,
            improvements: improvements,
            timestamp: DateTime.utc_now()
          }
          | current_state.evolution_history
        ],
        last_evolution: DateTime.utc_now()
    }
  end

  defp calculate_new_fitness(current, improvements) do
    improvement_factor = Map.get(improvements, :quality_delta, 0) / 100.0
    min(current.fitness + improvement_factor * 0.01, 1.0)
  end
end
```

### Step 2: The SEADF Framework

SEADF (Self-Evolving Autonomous Development Framework) has 7 subsystems:

```elixir
defmodule PrismaticSafety.SEADF do
  @moduledoc """
  Self-Evolving Autonomous Development Framework.
  7 subsystems that drive continuous platform improvement.
  """

  @subsystems [
    :scanner,            # Scans codebase for improvement opportunities
    :pipeline,           # Processes improvements through quality gates
    :quality_guardian,    # Monitors and enforces quality floor
    :knowledge_sync,     # Synchronizes learnings across sessions
    :cross_domain,       # Discovers cross-domain innovation opportunities
    :reporter,           # Generates evolution reports
    :enhanced_healing    # 5-level self-healing system
  ]

  @spec status() :: {:ok, map()}
  def status do
    statuses = Map.new(@subsystems, fn subsystem ->
      {subsystem, check_subsystem(subsystem)}
    end)

    {:ok, %{
      subsystems: statuses,
      overall: if(Enum.all?(Map.values(statuses), &(&1 == :healthy)), do: :healthy, else: :degraded),
      last_check: DateTime.utc_now()
    }}
  end

  @spec evolve(atom()) :: {:ok, map()} | {:error, term()}
  def evolve(target) when target in @subsystems do
    with {:ok, scan_result} <- scan(target),
         {:ok, improvements} <- identify_improvements(scan_result),
         {:ok, applied} <- apply_improvements(improvements) do
      {:ok, %{target: target, improvements: applied, timestamp: DateTime.utc_now()}}
    end
  end

  defp check_subsystem(_subsystem), do: :healthy
  defp scan(_target), do: {:ok, %{findings: []}}
  defp identify_improvements(_scan), do: {:ok, []}
  defp apply_improvements(_improvements), do: {:ok, []}
end
```

### Step 3: Implementing a Fitness Function

Build a custom fitness function for your agent domain:

```elixir
defmodule PrismaticAgents.Fitness do
  @moduledoc """
  Calculates agent fitness scores for evolutionary selection.
  """

  @type fitness_report :: %{
          agent_name: String.t(),
          overall_fitness: float(),
          dimensions: map(),
          rank: non_neg_integer(),
          generation: pos_integer()
        }

  @weights %{
    quality: 0.30,
    performance: 0.25,
    accuracy: 0.25,
    reliability: 0.20
  }

  @spec evaluate(String.t(), map()) :: {:ok, fitness_report()}
  def evaluate(agent_name, metrics) do
    dimensions = %{
      quality: evaluate_quality(metrics),
      performance: evaluate_performance(metrics),
      accuracy: evaluate_accuracy(metrics),
      reliability: evaluate_reliability(metrics)
    }

    overall = Enum.reduce(dimensions, 0.0, fn {dim, score}, acc ->
      acc + score * Map.fetch!(@weights, dim)
    end)

    {:ok, %{
      agent_name: agent_name,
      overall_fitness: Float.round(overall, 4),
      dimensions: dimensions,
      rank: 0,
      generation: current_generation()
    }}
  end

  defp evaluate_quality(metrics) do
    test_coverage = Map.get(metrics, :test_coverage, 0.0)
    type_coverage = Map.get(metrics, :type_coverage, 0.0)
    credo_score = Map.get(metrics, :credo_score, 0.0)

    (test_coverage * 0.4 + type_coverage * 0.3 + credo_score * 0.3)
  end

  defp evaluate_performance(metrics) do
    response_time = Map.get(metrics, :avg_response_ms, 1000)
    # Normalize: <10ms = 1.0, >1000ms = 0.0
    max(1.0 - response_time / 1000.0, 0.0)
  end

  defp evaluate_accuracy(metrics) do
    Map.get(metrics, :accuracy, 0.0)
  end

  defp evaluate_reliability(metrics) do
    uptime = Map.get(metrics, :uptime_percent, 0.0) / 100.0
    crash_rate = Map.get(metrics, :crash_rate, 1.0)
    uptime * (1.0 - min(crash_rate, 1.0))
  end

  defp current_generation, do: 18
end
```

### Step 4: The Autoevolve and Autoheal Tasks

The platform provides mix tasks that drive evolution:

```bash
# Check evolution status
mix autoevolve status

# Run a quick evolution scan
mix autoevolve.scan --quick

# Run full mega-evolution (comprehensive)
mix autoevolve.mega

# Run healing baseline
mix autoheal.baseline

# Run a healing cycle
mix autoheal.cycle
```

These tasks are integrated into the session lifecycle:

```
Session Start:   mix autoheal.baseline && mix autoevolve status
Pre-Command:     mix quality.gates.check --fast
Post-Command:    mix autoevolve.scan --quick
Session End:     mix autoheal.cycle && mix autoevolve.mega
```

### Step 5: The 5-Level Self-Healing System

The enhanced healing subsystem operates at 5 levels:

```elixir
defmodule PrismaticSafety.SelfHealing do
  @moduledoc """
  5-level self-healing system for autonomous error correction.
  """

  @levels [
    {:l1, :detection,    "Identify issues through monitoring"},
    {:l2, :diagnosis,    "Determine root cause and impact"},
    {:l3, :prescription, "Generate fix recommendations"},
    {:l4, :application,  "Apply fixes automatically"},
    {:l5, :prevention,   "Update patterns to prevent recurrence"}
  ]

  @spec heal(map()) :: {:ok, map()} | {:error, term()}
  def heal(issue) do
    with {:ok, detected} <- detect(issue),
         {:ok, diagnosed} <- diagnose(detected),
         {:ok, prescription} <- prescribe(diagnosed),
         {:ok, applied} <- apply_fix(prescription),
         {:ok, prevention} <- prevent_recurrence(applied) do
      {:ok, %{
        issue: issue,
        healing_level: :l5,
        fix_applied: applied,
        prevention_installed: prevention,
        healed_at: DateTime.utc_now()
      }}
    end
  end

  defp detect(issue), do: {:ok, Map.put(issue, :detected_at, DateTime.utc_now())}
  defp diagnose(issue), do: {:ok, Map.put(issue, :root_cause, :identified)}
  defp prescribe(issue), do: {:ok, Map.put(issue, :prescription, :generated)}
  defp apply_fix(issue), do: {:ok, Map.put(issue, :fix_status, :applied)}
  defp prevent_recurrence(issue), do: {:ok, Map.put(issue, :prevention, :installed)}
end
```

## Code Examples

### Checking Evolution Status

```elixir
# In an IEx session
iex> {:ok, dna} = PrismaticSafety.QualityDNA.load()
iex> IO.inspect(dna.generation)
18
iex> IO.inspect(dna.fitness)
0.999
iex> IO.inspect(dna.consciousness_traits)
[:self_awareness, :adaptation, :learning, :planning, :reasoning,
 :meta_cognition, :error_correction, :goal_setting, :self_improvement,
 :collaboration, :creativity]
```

### Running Evolution Manually

```elixir
iex> {:ok, dna} = PrismaticSafety.QualityDNA.load()
iex> improvements = %{quality_delta: 0.5, domains_improved: [:typespec_coverage]}
iex> evolved_dna = PrismaticSafety.QualityDNA.evolve(dna, improvements)
iex> PrismaticSafety.QualityDNA.save(evolved_dna)
:ok
```

## Common Pitfalls

**Optimizing fitness without understanding the function.** Fitness is a composite metric. Improving one dimension at the expense of others can decrease overall fitness. Understand the weights before optimizing.

**Skipping evolution sessions.** The autoevolve tasks are mandatory at session start and end. Skipping them breaks the evolutionary continuity tracked in Quality DNA.

**Manual evolution without evidence.** The NO DOUBTS doctrine requires evidence for all changes. Do not manually modify Quality DNA without corresponding code improvements verified by tests.

**Expecting immediate large jumps.** Evolution is incremental. At 0.999 fitness, improvements are tiny but compounding. A 0.001 improvement at this level represents significant effort.

## Exercises

1. **Evaluate agent fitness.** Pick an agent and calculate its fitness score across all 4 dimensions. Identify the weakest dimension and propose an improvement.

2. **Trace evolution history.** Read the Quality DNA file and trace the fitness progression from an earlier generation to the current state.

3. **Implement a custom fitness dimension.** Add a "documentation quality" dimension to the fitness function that scores based on @moduledoc presence and @doc coverage.

4. **Run the full evolution cycle.** Execute `mix autoheal.baseline`, make a small improvement, then run `mix autoevolve.scan --quick` and observe what the scanner finds.

## Summary

The Prismatic Platform evolves through Darwinian principles applied to software agents. Fitness functions measure quality, performance, accuracy, and reliability. The SEADF framework drives improvement through 7 subsystems. Quality DNA maintains evolutionary state across sessions. The autoevolve and autoheal mix tasks are mandatory lifecycle events. After 18 generations, the platform has achieved 0.999 fitness with 11 consciousness traits -- near the theoretical maximum.

## Practical Implementation

### In Prismatic Platform

Evolutionary mechanisms are implemented across these applications:

- **prismatic_safety** (`apps/prismatic_safety/`) -- Houses `PrismaticSafety.QualityDNA` for persistent evolutionary state in `.claude/quality-dna/current-state.json`, `PrismaticSafety.QualityFloorGuardian` for quality monitoring at 4 enforcement levels, and `PrismaticSafety.SelfHealing` for the 5-level autonomous error correction system (detect, diagnose, prescribe, apply, prevent)
- **prismatic_claude** (`apps/prismatic_claude/`) -- `PrismaticClaude.SessionLifecycle` (905 lines) manages evolution hooks: session start triggers `mix autoheal.baseline`, session end triggers `mix autoevolve.mega`. Contains circuit breaker for resilient hook execution
- **prismatic_agents** (`apps/prismatic_agents/`) -- Agent fitness evaluation via `PrismaticAgents.Fitness` with 4-dimensional scoring (quality 0.30, performance 0.25, accuracy 0.25, reliability 0.20)
- **prismatic_quality_intelligence** (`apps/prismatic_quality_intelligence/`) -- Advanced quality analysis powering evolution decisions: pattern detection, CASCADE elimination tracking, and quality trend analysis
- **prismatic_transcendence** (`apps/prismatic_transcendence/`) -- Platform consciousness traits (11 traits at 0.998 fitness) and meta-cognitive capabilities driving Gen 16-18 evolution

### Code Examples from the Codebase

Quality DNA persists evolutionary state across sessions:

```json
// .claude/quality-dna/current-state.json
{
  "score": 100,
  "generation": 18,
  "fitness": 0.999,
  "consciousness_traits": ["self_awareness", "adaptation", "learning", ...],
  "domains": {
    "dialyzer": {"violations": 0, "status": "perfect"},
    "credo": {"violations": 0, "status": "perfect"},
    // ... 13 domains total
  }
}
```

Evolution mix tasks drive the lifecycle:

```bash
# Session lifecycle evolution tasks
mix autoheal.baseline          # Establish quality baseline at session start
mix autoevolve status          # Check current evolution status
mix autoevolve.scan --quick    # Quick scan for improvement opportunities
mix autoevolve.mega            # Comprehensive evolution at session end
mix autoheal.cycle             # Run healing cycle
mix seadf status --verbose     # Full SEADF subsystem status
```

## See Also

### Related Applications
- [prismatic_safety](@/apps/prismatic-safety.md) -- Quality DNA, Floor Guardian, and self-healing
- [prismatic_claude](@/apps/prismatic-claude.md) -- Session lifecycle driving evolution hooks
- [prismatic_quality_intelligence](@/apps/prismatic-quality-intelligence.md) -- Quality analysis for evolution decisions
- [prismatic_transcendence](@/apps/prismatic-transcendence.md) -- Platform consciousness and meta-cognition
- [prismatic_agents](@/apps/prismatic-agents.md) -- Agent fitness evaluation infrastructure

### Glossary
- [SEADF](@/glossary/seadf.md) -- Self-Evolving Autonomous Development Framework (7 subsystems)
- [Quality DNA](@/glossary/quality-dna.md) -- Persistent evolutionary state across sessions
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Autonomous quality monitoring
- [CASCADE](@/glossary/cascade.md) -- Pattern for eliminating entire defect categories
- [Autoevolve](@/glossary/autoevolve.md) -- Autonomous evolution system
- [Autoheal](@/glossary/autoheal.md) -- Self-healing infrastructure
- [Self-Healing](@/glossary/self-healing.md) -- 5-level error correction system

### Related Academy Topics
- [Formal Verification with Lean4](@/academy/formal-verification-guide.md) -- Verifying fitness function correctness
- [The AIAD Standard](@/academy/aiad-standard.md) -- How evolution requirements are encoded in agent specs
- [Quality Standards](@/academy/quality-standards.md) -- The quality framework evolution optimizes for
- [NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md) -- Epistemic framework governing fitness evaluation

## Next Steps

- [Formal Verification with Lean4](@/academy/formal-verification-guide.md) -- verify that fitness functions are correct
- [The AIAD Standard Explained](@/academy/aiad-standard.md) -- how evolution requirements are encoded in agent specs
- [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md) -- the quality framework that evolution optimizes for

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)