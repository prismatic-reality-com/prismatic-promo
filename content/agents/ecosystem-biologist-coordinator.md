+++
title = "ecosystem-biologist-coordinator"
weight = 144
[extra]
domain = "supreme"
level = "L3"
description = "The Ecosystem Biologist Coordinator treats the Prismatic Platform as a living ecosystem:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "beam", "telemetry", "mycelial-network"]
domain_normalized = "supreme"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 206
quality_score = 42
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ecosystem-biologist-coordinator", "Ecosystem", "Biologist", "Coordinator", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "Phase"]
tags = ["agents", "agent", "ecosystem-biologist-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ecosystem-biologist-coordinator - Prismatic Platform"
+++

## Overview

The Ecosystem Biologist Coordinator operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Supreme domain of the Prismatic Platform. This agent treats the entire platform as a living ecosystem, applying biological principles -- population dynamics, ecological succession, symbiotic relationships, and homeostatic regulation -- to model and optimize the behavior of 430+ autonomous agents operating across 90 [umbrella application](/glossary/umbrella-application/)s. The biological metaphor is not merely descriptive; it provides the formal framework through which the coordinator makes decisions about agent lifecycle management, resource allocation, and evolutionary trajectory.

In ecological terms, the Prismatic Platform exhibits characteristics of a complex adaptive system: emergent behaviors arise from agent interactions that no single agent was designed to produce, resource competition drives efficiency improvements, and environmental pressures (quality gates, performance targets, doctrine enforcement) create selection pressures that shape the agent population over generational cycles. The Ecosystem Biologist Coordinator serves as the platform's ecologist, monitoring these dynamics and intervening when the ecosystem drifts toward unhealthy states such as monoculture (too many similar agents), population collapse (agent failure cascades), or invasive dominance (a single agent pattern overwhelming diversity).

The coordinator operates at the intersection of the [SEADF](/glossary/seadf/) self-evolving framework and the [mycelial network](/glossary/mycelial-network/) communication substrate, using biological models to inform both evolutionary strategy and pattern propagation decisions.

## Architecture

The Ecosystem Biologist Coordinator implements a biological monitoring and intervention architecture built on three interconnected subsystems.

```
           Population Monitor
           (agent census, fitness
            distributions, diversity)
                    |
                    v
        Ecological Model Engine ------> Intervention Planner
        (population dynamics,            (succession triggers,
         niche analysis,                  resource rebalancing,
         symbiosis mapping)               diversity preservation)
                    |                           |
                    v                           v
            Health Dashboard          Mycelial Network
            (ecosystem metrics,       (intervention
             trend visualization)      propagation)
```

**Population Monitoring Subsystem.** This subsystem maintains a continuous census of the agent population, tracking agent count by domain, fitness score distributions, resource consumption patterns, and activity levels. Population snapshots are recorded at configurable intervals to enable trend analysis across the platform's 18-generation evolutionary history.

**Ecological Model Engine.** The core analytical engine applies formal ecological models to the agent population data. Lotka-Volterra competition models evaluate resource competition between agent domains. Shannon diversity indices measure agent population diversity across functional categories. Succession models predict how the agent ecosystem will evolve under current selection pressures and identify intervention points where small adjustments can prevent undesirable ecological outcomes.

**Intervention Planning Subsystem.** When ecological models identify unhealthy trends, the intervention planner generates corrective actions. These range from mild interventions (adjusting resource quotas to relieve competition pressure) to significant interventions (triggering evolutionary cycles to introduce diversity into stagnating domains) to emergency interventions (isolating failing domains to prevent cascade failure propagation).

## Core Capabilities

**Population Dynamics Analysis.** The coordinator tracks agent population metrics across all platform domains, measuring birth rates (new agent deployment), death rates (agent deprecation), migration patterns (agents moving between domains), and carrying capacity utilization. These metrics reveal whether the ecosystem is growing sustainably, stagnating, or approaching resource limits that could trigger population crashes.

**Ecological Niche Mapping.** Each agent domain is modeled as an ecological niche with defined resource boundaries, competitive relationships, and symbiotic dependencies. The coordinator identifies niche overlap (multiple agents competing for the same functional space), niche vacancies (functional areas without adequate agent coverage), and niche boundary changes that indicate domain evolution.

**Symbiosis Relationship Tracking.** Agent interactions are classified as mutualistic (both agents benefit from interaction), commensalistic (one benefits, other unaffected), or parasitic (one benefits at the other's expense). This classification informs decisions about agent coupling -- mutualistic relationships are strengthened through closer integration, while parasitic relationships are restructured to eliminate the exploitation pattern.

**Homeostatic Regulation.** The coordinator implements homeostatic control loops that maintain ecosystem stability metrics within acceptable ranges. When quality scores drop, the coordinator increases evolutionary pressure on underperforming domains. When resource consumption spikes, the coordinator triggers load-shedding in non-critical agent processes. When diversity declines, the coordinator initiates mutation cycles to introduce variation.

**Succession Planning.** Drawing from ecological succession theory, the coordinator plans the long-term trajectory of the agent ecosystem. Pioneer agents that establish new capabilities are identified and supported. Climax communities -- stable, high-performing agent configurations -- are preserved and replicated. Disturbance events (major refactoring, architecture changes) are modeled to predict and mitigate their ecological impact.

**Cross-Domain Health Synthesis.** The coordinator aggregates health signals from all platform domains into a unified ecosystem health score that accounts for population health, diversity, stability, resource efficiency, and evolutionary momentum. This score drives strategic decisions about platform investment priorities and evolutionary direction.

## Implementation

```elixir
defmodule PrismaticAgents.EcosystemBiologist.Coordinator do
  @moduledoc """
  L3 Ecosystem Biologist Coordinator - applies biological
  principles to model and optimize the 430+ agent ecosystem
  as a living adaptive system.
  """
  use GenServer

  alias PrismaticAgents.EcosystemBiologist.{
    PopulationMonitor,
    EcologicalModel,
    InterventionPlanner,
    DiversityIndexer,
    SymbiosisMapper
  }

  @type ecosystem_health :: %{
    population_health: float(),
    diversity_index: float(),
    stability_score: float(),
    resource_efficiency: float(),
    evolutionary_momentum: float(),
    overall_health: float(),
    assessed_at: DateTime.t()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_census()
    {:ok, %{
      population_snapshots: [],
      ecological_models: %{},
      active_interventions: [],
      config: Keyword.get(opts, :config, default_config())
    }}
  end

  @spec assess_ecosystem_health() :: {:ok, ecosystem_health()} | {:error, term()}
  def assess_ecosystem_health do
    GenServer.call(__MODULE__, :assess_health, 60_000)
  end

  @impl true
  def handle_call(:assess_health, _from, state) do
    with {:ok, census} <- PopulationMonitor.current_census(),
         {:ok, diversity} <- DiversityIndexer.compute(census),
         {:ok, symbiosis} <- SymbiosisMapper.map_relationships(census),
         {:ok, model} <- EcologicalModel.evaluate(census, diversity, symbiosis) do
      health = %{
        population_health: model.population_fitness,
        diversity_index: diversity.shannon_index,
        stability_score: model.stability_metric,
        resource_efficiency: model.resource_utilization,
        evolutionary_momentum: model.momentum_score,
        overall_health: compute_overall(model),
        assessed_at: DateTime.utc_now()
      }

      interventions = InterventionPlanner.plan(health, state.config)
      {:reply, {:ok, health}, %{state | active_interventions: interventions}}
    end
  end
end
```

## Integration Points

| Component | Integration Type | Purpose |
|-----------|-----------------|---------|
| [SEADF](/glossary/seadf/) | Evolution Framework | Self-evolving development framework coordination for evolutionary interventions |
| [Mycelial Network](/glossary/mycelial-network/) | Communication Substrate | Cross-domain pattern propagation and intervention distribution |
| [Quality Floor Guardian](/glossary/quality-floor-guardian/) | Quality Monitoring | Quality metrics as ecological health indicators |
| [autonomous-healing-commander](/agents/autonomous-healing-commander/) | Healing Partner | L1-L5 healing capabilities triggered by ecosystem health degradation |
| [darwinian-evolution-coordinator](/agents/darwinian-evolution-coordinator/) | Evolution Partner | Survival-of-the-fittest selection informed by ecological models |
| [GARDENER SUPREME](/agents/gardener-supreme/) | Legacy Knowledge | Garden repository patterns as ecological reference data |
| [Telemetry](/glossary/telemetry/) | Observability | Ecosystem health metrics and census event tracking |

## Operational Workflow

**Phase 1: Census Collection.** At configurable intervals (default: every 6 hours), the coordinator performs a comprehensive census of the agent population. This includes counting active agents per domain, measuring fitness score distributions, recording resource consumption, and cataloging inter-agent communication patterns through the mycelial network.

**Phase 2: Ecological Modeling.** Census data is processed through the ecological model engine to produce population dynamics forecasts, diversity trend analysis, and symbiosis relationship maps. Models are calibrated against historical census data spanning all 18 platform generations, enabling the coordinator to distinguish normal variation from concerning trends.

**Phase 3: Health Assessment.** Model outputs are synthesized into the composite ecosystem health score. Health assessments are compared against historical baselines and configurable thresholds to identify domains requiring attention.

**Phase 4: Intervention Planning.** When health assessments identify concerning trends, the intervention planner generates corrective action proposals. Each proposal includes the identified problem, the proposed intervention, the expected ecological impact, and the confidence level of the prediction. Interventions requiring significant ecosystem changes are routed through the [Trinity Gate](/glossary/trinity-gate/) for formal validation.

**Phase 5: Intervention Execution.** Approved interventions are propagated through the mycelial network to affected domains. The coordinator monitors intervention outcomes through subsequent census cycles, adjusting the intervention strategy based on observed results.

## NABLA Compliance

| Axiom | Ecological Enforcement |
|-------|------------------------|
| **Signal Plurality** | Ecosystem health assessments aggregate signals from population metrics, diversity indices, resource measurements, and symbiosis maps |
| **Contradiction Preservation** | When population metrics indicate health but diversity indices indicate stagnation, both signals are preserved and reported |
| **Provenance Mandatory** | Every health score links to specific census data, model parameters, and computation steps |
| **Time Decay** | Historical census data is weighted by recency, with exponential decay preventing outdated population data from dominating models |
| **Unknown Valid** | Domains with insufficient monitoring data are classified as "unassessed" rather than assumed healthy |

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.EcosystemBiologist.Coordinator,
  census_interval_hours: 6,
  snapshot_retention_count: 1_000,
  diversity_warning_threshold: 0.60,
  diversity_critical_threshold: 0.40,
  stability_warning_threshold: 0.75,
  resource_efficiency_target: 0.85,
  intervention_confidence_threshold: 0.80,
  max_concurrent_interventions: 3,
  ecological_model: :lotka_volterra_extended
```

## Performance

| Metric | Target | Description |
|--------|--------|-------------|
| **Census Collection** | < 30s | Complete agent population census across all domains |
| **Ecological Modeling** | < 60s | Full model evaluation including dynamics and diversity |
| **Health Assessment** | < 10s | Composite health score computation |
| **Intervention Planning** | < 15s | Corrective action proposal generation |
| **Memory Footprint** | < 100 MB | Population snapshot storage for 1,000 historical censuses |

## Related Resources

- [**autonomous-healing-commander**](/agents/autonomous-healing-commander/) (L3) - L1-L5 healing capabilities triggered by ecosystem health degradation
- [**darwinian-evolution-coordinator**](/agents/darwinian-evolution-coordinator/) (L3) - Survival-of-the-fittest evolutionary selection informed by ecological models
- [**GARDENER SUPREME**](/agents/gardener-supreme/) (L3) - Legacy knowledge garden providing ecological reference patterns from 22 repositories
- [**evolution-orchestrator-supreme**](/agents/evolution-orchestrator-supreme/) (L3) - Supreme evolutionary orchestration consuming ecosystem health signals
- [SEADF](/glossary/seadf/) - Self-evolving autonomous development framework coordinated by the biologist

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)