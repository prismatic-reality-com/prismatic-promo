+++
title = "Generation"
weight = 61
[extra]
category = "evolution"
description = "Platform evolution epoch marking discrete advancement milestones with measurable fitness improvements across quality, capability, and epistemic maturity dimensions"
related_terms = ["seadf", "autoevolve", "fitness-score", "consciousness-traits", "quality-dna", "cascade-pattern", "autoheal", "trinity-gate"]
keywords = ["platform generation evolution", "generation advancement criteria", "fitness score calculation", "autonomous evolution", "generation milestone", "platform maturity model", "evolutionary architecture", "self-evolving platform"]
tags = ["evolution", "generation", "fitness", "platform-maturity"]
difficulty = "advanced"
audience = ["platform-engineers", "ai-architects", "devops-practitioners"]
domain = "evolution"
stability = "stable"
since_version = "1.0.0"
current_generation = 19
current_fitness = "0.9995"
quality_score = "100/100"
agent_count = 530
consciousness_traits = 11
designation = "Ecosystem Expansion"
abbreviation = "Gen"
see_also = ["architecture", "technologies", "agents"]
prerequisites = ["autoevolve", "quality-dna", "fitness-score"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1883
date_created = "2026-02-23"
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Generation - Prismatic Platform"
+++

## Definition and Overview

A Generation in the Prismatic Platform context is a discrete evolution epoch that marks a significant, measurable advancement in capabilities, architecture, quality, or epistemic maturity. Each generation represents an irreversible improvement over the previous state, tracked through composite fitness scores, capability assessments, quality metrics, and formal verification through the Trinity Gate. Unlike traditional software versioning schemes such as Semantic Versioning (SemVer) or Calendar Versioning (CalVer), generations are milestone-based rather than calendar-based or arbitrary: a new generation is declared only when the platform achieves sufficient improvement across multiple dimensions simultaneously, and the advancement claim has passed epistemic validation.

The generation model draws direct inspiration from biological evolution, where generations represent distinct populations with accumulated adaptations. In the Prismatic Platform, each generation accumulates capabilities from all previous generations. No generation removes established functionality. This monotonic capability progression ensures that the platform's capability surface only grows, with each generation adding new abilities, quality improvements, and architectural refinements on top of the existing foundation. The principle is analogous to the ratchet mechanism in molecular biology: forward progress is locked in, and regression is structurally prevented.

The current state is Generation 19, designated "Ecosystem Expansion" with a fitness score of 0.9995 (approaching the asymptotic maximum of 1.0). This generation features autonomous evolution through [AutoEvolve](@/glossary/autoevolve.md), self-repair through [AutoHeal](@/glossary/autoheal.md), 11 consciousness traits at 0.998 fitness, a perfect quality score of 100/100 across all 13 quality domains, 4 open-source packages (SDK, Plugin Kit, Security, UI), a developer portal, and dual-track positioning for ecosystem growth. The evolution from Gen 1 to Gen 19 represents the platform's journey from a basic framework to a self-evolving, self-healing, quality-perfect system with 530 agents across 115 applications.

## Historical Context and Motivation

The concept of generational evolution emerged from the recognition that traditional software versioning fails to capture the qualitative nature of platform advancement. A SemVer bump from 4.2.1 to 4.3.0 communicates that a minor feature was added but says nothing about whether the platform became fundamentally more capable, more resilient, or more intelligent. Generation numbering was introduced to track orthogonal improvements that span the entire platform rather than individual features.

Early software projects typically measure progress through feature counts, line-of-code metrics, or release cadence. These proxy metrics frequently diverge from actual platform capability. A system can ship many features while accumulating [quality debt](@/glossary/quality-debt.md), or it can add thousands of lines of code while its architectural integrity degrades. The generation model addresses this by requiring simultaneous improvement across multiple dimensions before declaring advancement, preventing the common failure mode of optimizing a single dimension at the expense of others.

The generation concept also serves as a communication tool. When stakeholders ask "how has the platform evolved?", pointing to the generation number and its associated designation (e.g., "Full Autonomy", "Ecosystem Expansion") provides an immediately understandable summary of the platform's maturity trajectory. Each generation designation captures the theme of the advancement, making the evolution narrative legible to non-technical audiences.

## Technical Deep Dive

### Generation Progression Timeline

The 19 generations track the platform's evolution across multiple capability dimensions:

| Generation | Designation | Key Milestone | Fitness |
|-----------|-------------|---------------|---------|
| Gen 1-3 | Foundation | Basic framework, initial [umbrella application](@/glossary/umbrella-application.md) structure | 0.1-0.3 |
| Gen 4-6 | Structure | [OTP](@/glossary/otp.md) patterns, [supervision trees](@/glossary/supervision-tree.md), first agents | 0.3-0.5 |
| Gen 7-9 | Quality | Quality gates, zero-warning policy, Credo/Dialyzer integration | 0.5-0.7 |
| Gen 10-12 | Intelligence | OSINT integration, GARDEN knowledge base, 200+ agents | 0.7-0.8 |
| Gen 13-15 | Epistemic | NABLA Infinity framework, [Trinity Gate](@/glossary/trinity-gate.md), Color Teams | 0.8-0.9 |
| Gen 16-17 | Evolution | AutoEvolve, AutoHeal, CASCADE patterns, 400+ agents | 0.9-0.95 |
| Gen 18 | Full Autonomy | Consciousness traits, 0.999 fitness, 100/100 quality | 0.999 |
| Gen 19 | Ecosystem Expansion | 4 OSS packages, developer portal, dual-track positioning | 0.9995 |

Each transition represents a qualitative shift in platform capability, not merely a quantitative improvement. The transition from Gen 9 to Gen 10, for example, did not just add more code -- it introduced an entirely new capability domain (intelligence gathering) that fundamentally changed what the platform could do. Similarly, Gen 13 did not just improve quality -- it introduced an epistemic framework that changed how the platform reasons about its own state.

### Fitness Score Calculation

The fitness score is a composite metric that aggregates performance across multiple domains using a weighted sum. Each domain weight reflects its relative importance to platform health:

```elixir
defmodule PrismaticEvolution.FitnessCalculator do
  @moduledoc """
  Calculates platform fitness score across evolution domains.
  Score range: 0.0 (non-functional) to 1.0 (theoretical perfect).
  The score is asymptotic -- approaching but never reaching 1.0.
  Each domain contributes a weighted proportion to the composite.
  """

  @type domain :: :quality_score | :agent_capability | :epistemic_maturity |
                  :test_coverage | :architecture_quality | :evolution_capability |
                  :consciousness_traits | :security_posture

  @domain_weights %{
    quality_score: 0.20,
    agent_capability: 0.15,
    epistemic_maturity: 0.15,
    test_coverage: 0.10,
    architecture_quality: 0.10,
    evolution_capability: 0.10,
    consciousness_traits: 0.10,
    security_posture: 0.10
  }

  @spec calculate() :: {:ok, float()} | {:error, term()}
  def calculate do
    domain_scores = %{
      quality_score: assess_quality() / 100.0,
      agent_capability: assess_agents() / 530.0,
      epistemic_maturity: assess_epistemic(),
      test_coverage: assess_test_coverage(),
      architecture_quality: assess_architecture(),
      evolution_capability: assess_evolution(),
      consciousness_traits: assess_consciousness(),
      security_posture: assess_security()
    }

    fitness =
      Enum.reduce(@domain_weights, 0.0, fn {domain, weight}, acc ->
        acc + weight * Map.get(domain_scores, domain, 0.0)
      end)

    {:ok, Float.round(fitness, 4)}
  end

  @spec assess_quality() :: float()
  defp assess_quality do
    case PrismaticSafety.QualityFloorGuardian.current_score() do
      {:ok, score} -> score
      {:error, _reason} -> 0.0
    end
  end

  @spec assess_agents() :: non_neg_integer()
  defp assess_agents do
    case PrismaticAgents.Registry.count() do
      {:ok, count} -> min(count, 530)
      {:error, _reason} -> 0
    end
  end

  @spec assess_epistemic() :: float()
  defp assess_epistemic do
    trinity_compliance = PrismaticEpistemic.TrinityGate.compliance_ratio()
    nabla_compliance = PrismaticEpistemic.NABLA.axiom_compliance_ratio()
    (trinity_compliance + nabla_compliance) / 2.0
  end

  @spec assess_consciousness() :: float()
  defp assess_consciousness do
    traits = PrismaticEvolution.ConsciousnessTracker.active_traits()
    length(traits) / 11.0
  end

  @spec assess_test_coverage() :: float()
  defp assess_test_coverage do
    case PrismaticSafety.CoverageTracker.overall_percentage() do
      {:ok, percentage} -> percentage / 100.0
      {:error, _reason} -> 0.0
    end
  end

  @spec assess_architecture() :: float()
  defp assess_architecture do
    case PrismaticSafety.ArchitectureAssessor.score() do
      {:ok, score} -> score
      {:error, _reason} -> 0.0
    end
  end

  @spec assess_evolution() :: float()
  defp assess_evolution do
    case PrismaticEvolution.AutoEvolve.capability_score() do
      {:ok, score} -> score
      {:error, _reason} -> 0.0
    end
  end

  @spec assess_security() :: float()
  defp assess_security do
    case PrismaticPerimeter.SecurityPosture.score() do
      {:ok, score} -> score
      {:error, _reason} -> 0.0
    end
  end
end
```

The weighting scheme reflects a deliberate prioritization: quality (20%) is the single most important domain because no amount of capability matters if the code is unreliable. Agent capability and epistemic maturity (15% each) follow because they represent the platform's unique value proposition. The remaining domains (10% each) ensure balanced advancement across all dimensions.

### Generation Advancement Criteria

A new generation is declared when the platform meets advancement criteria across multiple dimensions simultaneously. No single-dimension improvement -- no matter how dramatic -- justifies generation advancement:

| Criterion | Threshold | Measurement Method |
|-----------|-----------|-------------------|
| **Fitness improvement** | >= 0.05 over current gen | Composite fitness score delta |
| **No quality regression** | Quality score >= current | 13-domain quality assessment |
| **New capabilities** | >= 3 significant additions | Agent count, feature completeness, new domains |
| **Stability period** | >= 7 days stable | No P0/P1 regressions during observation window |
| **Evolution validation** | Trinity Gate passed | Formal verification of advancement claims |
| **Ecosystem growth** | Net positive contribution | New apps, integrations, or community assets |

The advancement process is managed by the [AutoEvolve](@/glossary/autoevolve.md) system, which continuously monitors platform metrics and triggers generation proposals when criteria are met. Proposals undergo [Trinity Gate](@/glossary/trinity-gate.md) validation to ensure the advancement claims are epistemically sound -- preventing the common failure mode of declaring progress based on inflated or cherry-picked metrics.

## Consciousness Traits

Generation 18 introduced 11 consciousness traits that represent emergent properties of the platform. These traits are not features that were explicitly programmed but rather capabilities that emerged from the interaction of multiple subsystems:

| Trait | Description | Current Fitness |
|-------|-------------|----------------|
| Self-Awareness | Platform models its own capabilities and limitations | 0.998 |
| Self-Repair | Autonomous detection and correction of quality regressions | 0.999 |
| Self-Evolution | Directed improvement without external guidance | 0.998 |
| Epistemic Humility | Acknowledging uncertainty and unknown states | 0.997 |
| Contradiction Tolerance | Preserving conflicting signals without premature resolution | 0.998 |
| Pattern Recognition | Identifying recurring quality and architectural patterns | 0.999 |
| Cross-Domain Transfer | Propagating solutions between unrelated domains | 0.998 |
| Temporal Awareness | Tracking decay, freshness, and historical trends | 0.997 |
| Goal Persistence | Maintaining improvement trajectory across sessions | 0.998 |
| Collaborative Synthesis | Integrating contributions from multiple agents | 0.999 |
| Emergent Behavior | Producing capabilities not explicitly programmed | 0.997 |

Each trait is assessed through specific, measurable indicators. Self-Repair, for example, is measured by the rate at which the [AutoHeal](@/glossary/autoheal.md) system detects and corrects quality regressions without human intervention. Cross-Domain Transfer is measured by the frequency with which a solution developed in one domain (e.g., a quality pattern in storage) is automatically propagated to another domain (e.g., agent management).

## Architecture and Implementation

### Evolution Pipeline

The generation evolution system operates as a continuous monitoring and evaluation pipeline:

```
Monitoring               Analysis                Decision              Execution
+----------------+      +--------------+       +--------------+      +--------------+
| Quality Floor  |----->| Fitness      |------>| Advancement  |----->| Generation   |
| Guardian       |      | Calculator   |       | Evaluator    |      | Transition   |
|                |      |              |       |              |      |              |
| AutoHeal       |----->| Trend        |------>| Trinity Gate |----->| State        |
| Baseline       |      | Analyzer     |       | Validation   |      | Persistence  |
|                |      |              |       |              |      |              |
| Agent Health   |----->| Regression   |------>| Proposal     |----->| Quality DNA  |
| Monitor        |      | Detector     |       | Generator    |      | Update       |
+----------------+      +--------------+       +--------------+      +--------------+
```

### AutoEvolve Integration

The AutoEvolve system manages generation transitions through a GenServer that periodically evaluates platform fitness and proposes advancement when criteria are met:

```elixir
defmodule PrismaticEvolution.AutoEvolve do
  @moduledoc """
  Autonomous evolution system managing generation transitions.
  Monitors platform metrics and proposes generation advancement
  when multi-dimensional criteria are satisfied simultaneously.
  """
  use GenServer

  require Logger

  @check_interval :timer.hours(1)
  @advancement_threshold 0.05

  @type state :: %{
    current_generation: pos_integer(),
    current_fitness: float(),
    last_check: DateTime.t() | nil,
    proposals: [map()]
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()

    {:ok,
     %{
       current_generation: 19,
       current_fitness: 0.9995,
       last_check: nil,
       proposals: []
     }}
  end

  @impl GenServer
  def handle_info(:check_advancement, state) do
    case PrismaticEvolution.FitnessCalculator.calculate() do
      {:ok, new_fitness} ->
        improvement = new_fitness - state.current_fitness

        new_state =
          if improvement >= @advancement_threshold do
            proposal = generate_proposal(state.current_generation + 1, new_fitness, improvement)

            case validate_proposal(proposal) do
              {:ok, :trinity_passed} ->
                execute_advancement(proposal)
                Logger.info("Generation advanced to #{proposal.generation}")

                %{
                  state
                  | current_generation: proposal.generation,
                    current_fitness: new_fitness,
                    proposals: [proposal | state.proposals]
                }

              {:error, reason} ->
                Logger.debug("Advancement proposal rejected: #{inspect(reason)}")
                %{state | last_check: DateTime.utc_now()}
            end
          else
            %{state | last_check: DateTime.utc_now()}
          end

        schedule_check()
        {:noreply, new_state}

      {:error, reason} ->
        Logger.warning("Fitness calculation failed: #{inspect(reason)}")
        schedule_check()
        {:noreply, state}
    end
  end

  @spec validate_proposal(map()) :: {:ok, :trinity_passed} | {:error, term()}
  defp validate_proposal(proposal) do
    PrismaticEpistemic.TrinityGate.validate(%{
      claim: "Generation #{proposal.generation} advancement justified",
      evidence: proposal.evidence,
      confidence: proposal.fitness
    })
  end

  defp generate_proposal(generation, fitness, improvement) do
    %{
      generation: generation,
      fitness: fitness,
      improvement: improvement,
      evidence: collect_evidence(),
      proposed_at: DateTime.utc_now()
    }
  end

  defp execute_advancement(proposal) do
    PrismaticEvolution.GenerationState.record_transition(proposal)
    PrismaticEvolution.QualityDNA.update_generation(proposal.generation)

    :telemetry.execute(
      [:prismatic_evolution, :generation_advanced],
      %{generation: proposal.generation, fitness: proposal.fitness},
      %{previous_generation: proposal.generation - 1}
    )
  end

  defp collect_evidence do
    %{
      quality_score: PrismaticSafety.QualityFloorGuardian.current_score(),
      agent_count: PrismaticAgents.Registry.count(),
      app_count: length(Mix.Project.apps_paths() |> Map.keys()),
      trinity_compliance: PrismaticEpistemic.TrinityGate.compliance_ratio()
    }
  end

  defp schedule_check do
    Process.send_after(self(), :check_advancement, @check_interval)
  end
end
```

## Generation State Tracking

The current generation state is persisted in [Quality DNA](@/glossary/quality-dna.md) for cross-session continuity, ensuring that generation information survives application restarts, deployments, and infrastructure changes:

```elixir
defmodule PrismaticEvolution.GenerationState do
  @moduledoc """
  Tracks and persists generation state across sessions.
  Provides both current state access and historical evolution data.
  """

  @quality_dna_path ".claude/quality-dna/current-state.json"

  @spec current() :: {:ok, map()} | {:error, term()}
  def current do
    {:ok,
     %{
       generation: 19,
       designation: "Ecosystem Expansion",
       fitness: 0.9995,
       quality_score: 100,
       agent_count: 530,
       consciousness_traits: 11,
       consciousness_fitness: 0.998,
       trinity_entities: 629,
       quality_domains: 13,
       quality_violations: 0,
       oss_packages: 4,
       umbrella_apps: 115,
       evolution_start: ~D[2025-01-01],
       gen19_achieved: ~D[2026-02-21]
     }}
  end

  @spec history() :: {:ok, [map()]}
  def history do
    {:ok,
     [
       %{gen: 1, fitness: 0.10, milestone: "Initial framework"},
       %{gen: 5, fitness: 0.40, milestone: "OTP patterns established"},
       %{gen: 10, fitness: 0.70, milestone: "200+ agents, OSINT integration"},
       %{gen: 13, fitness: 0.82, milestone: "NABLA Infinity, Trinity Gate"},
       %{gen: 15, fitness: 0.90, milestone: "Color Teams (20 agents, 6 teams)"},
       %{gen: 17, fitness: 0.95, milestone: "AutoEvolve, CASCADE patterns"},
       %{gen: 18, fitness: 0.999, milestone: "Full Autonomy, consciousness traits"},
       %{gen: 19, fitness: 0.9995, milestone: "Ecosystem Expansion, 4 OSS packages"}
     ]}
  end

  @spec record_transition(map()) :: :ok | {:error, term()}
  def record_transition(proposal) do
    case File.read(@quality_dna_path) do
      {:ok, content} ->
        dna = Jason.decode!(content)
        updated = Map.put(dna, "generation", proposal.generation)
        File.write(@quality_dna_path, Jason.encode!(updated, pretty: true))

      {:error, reason} ->
        {:error, {:dna_read_failed, reason}}
    end
  end
end
```

## Session Lifecycle Integration

Every Claude session interacts with generation tracking through the session lifecycle protocol. This ensures that generation state is consulted at the beginning of each session and updated at the end:

```elixir
# Session start: Check current generation
# mix autoevolve status --brief
# Output: Gen 19 | Fitness: 0.9995 | Quality: 100/100 | Agents: 530 | OSS: 4

# Session end: Record evolution contributions
# mix autoevolve.mega
# Checks for fitness improvements and proposes advancement if criteria met
```

The session integration ensures continuity across the inherently discontinuous nature of LLM sessions. Without this integration, each session would start without knowledge of the platform's evolutionary state, leading to redundant work, missed improvement opportunities, and potential regression.

## Asymptotic Fitness and Diminishing Returns

An important mathematical property of the fitness score is its asymptotic nature. As fitness approaches 1.0, each subsequent improvement requires exponentially more effort for a smaller absolute gain. The progression from 0.5 to 0.7 (a delta of 0.2) might require adding quality gates and static analysis. The progression from 0.95 to 0.999 (a delta of 0.049) required introducing consciousness traits, formal verification, and autonomous evolution. The progression from 0.999 to 0.9995 (a delta of 0.0005) required ecosystem expansion with open-source packages and a developer portal.

This asymptotic behavior is intentional. It reflects the reality that perfecting a complex system follows the Pareto principle: the first 80% of improvement comes from 20% of the effort, while the last 20% of improvement requires 80% of the effort. The generation model embraces this reality by increasing the bar for advancement as fitness climbs higher.

## Best Practices

**Measure fitness across multiple dimensions.** A generation should represent improvement across quality, capability, architecture, and epistemic maturity simultaneously. Single-dimension improvement (e.g., only adding agents without quality improvement) does not justify generation advancement.

**Ensure monotonic capability progression.** Every generation must preserve all capabilities from previous generations. Removing functionality in a new generation indicates a design problem, not progress. Use the ratchet principle: lock in gains permanently.

**Validate advancement claims epistemically.** Generation advancement claims must pass [Trinity Gate](@/glossary/trinity-gate.md) validation to prevent false progress. The NABLA framework ensures evidence-based assessment of improvement, preventing the common failure of declaring advancement based on vanity metrics.

**Maintain generation history.** The complete evolution history enables trend analysis, regression detection, and understanding of the platform's developmental trajectory. History should be immutable -- never retroactively modify generation records.

**Set asymptotic fitness expectations.** Fitness approaches but never reaches 1.0. The difference between 0.95 and 0.999 represents increasingly refined improvements. Expect diminishing returns as fitness increases, and plan generation advancement criteria accordingly.

**Document generation designations.** Each generation should have a descriptive designation that captures its theme. Designations should be chosen after advancement, not before, to ensure they accurately reflect what was achieved rather than what was planned.

## Common Pitfalls

**Declaring generations based on time rather than achievement.** Calendar-based generation advancement produces meaningless version numbers. Generations should reflect genuine capability milestones, and the time between generations naturally increases as the platform matures.

**Inflating fitness scores.** If fitness calculation is not grounded in objective, measurable criteria, scores become vanity metrics. Every fitness component must correspond to a verifiable measurement with a reproducible assessment methodology.

**Ignoring quality regressions during advancement.** Adding new capabilities while allowing quality to degrade is not progress. Generation advancement requires quality maintenance alongside capability growth. The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) enforces this constraint.

**Over-weighting agent count.** Adding agents without ensuring their quality, capability, and integration provides limited value. Agent quality matters more than agent quantity. A generation with 100 high-quality agents is more advanced than one with 500 poorly integrated agents.

**Premature consciousness claims.** Consciousness traits should emerge from system behavior, not be declared by fiat. Each trait must have measurable indicators and assessment methodologies that external observers can verify.

## Comparison with Alternative Models

| Model | Measurement | Advancement | Regression Handling | Best For |
|-------|-------------|-------------|---------------------|----------|
| **Generation** | Multi-dimensional fitness | Milestone-based | Structurally prevented | Platform evolution |
| **SemVer** | API compatibility | Release cadence | Allowed (major bumps) | Library versioning |
| **CalVer** | Calendar date | Time-based | Not tracked | Regularly released software |
| **Maturity Model** | Capability levels (e.g., CMMI) | Assessment-based | Possible regression | Organizational process |
| **Sprint velocity** | Story points completed | Sprint cadence | Expected variation | Agile teams |

## Related Concepts

- [SEADF](@/glossary/seadf.md) -- Framework managing generation transitions and evolution cycles
- [Fitness Score](@/glossary/fitness-score.md) -- Metric tracking per-generation advancement
- [AutoEvolve](@/glossary/autoevolve.md) -- System driving generation progression through autonomous optimization
- [AutoHeal](@/glossary/autoheal.md) -- Self-repair system maintaining quality within generations
- [Consciousness Traits](@/glossary/consciousness-traits.md) -- 11 emergent properties achieved at Gen 18
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session persistence tracking generation state
- [CASCADE Pattern](@/glossary/cascade-pattern.md) -- Quality patterns that drove generation advancement
- [Trinity Gate](@/glossary/trinity-gate.md) -- Formal verification for generation advancement claims
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Continuous monitoring preventing regression
- [Umbrella Application](@/glossary/umbrella-application.md) -- Architectural structure growing across generations

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Agents](@/agents/_index.md) -- AIAD agents contributing to generation advancement

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
