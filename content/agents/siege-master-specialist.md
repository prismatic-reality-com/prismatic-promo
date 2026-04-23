+++
title = "siege-master-specialist"
weight = 375
[extra]
domain = "intelligence"
level = "L3"
description = "Long-term persistent intelligence operations with systematic exploitation and sustained analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 139
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["siege-master-specialist", "Long-term", "agents", "agent", "Prismatic Platform", "Collection", "Specialist", "PostgreSQL", "Siege Master", "The Siege"]
tags = ["agents", "agent", "siege-master-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "siege-master-specialist - Prismatic Platform"
+++

## Overview

The Siege Master Specialist is an L3 agent operating in the **intelligence** domain of the Prismatic Platform. This agent manages long-term persistent intelligence operations characterized by systematic, sustained data collection and analysis over extended timeframes. Unlike rapid-strike intelligence agents that execute quick reconnaissance missions, the Siege Master Specialist specializes in methodical, continuous surveillance and exploitation operations that build comprehensive intelligence pictures over weeks, months, or even years.

The concept of siege operations in intelligence work draws from the military doctrine of sustained pressure -- maintaining continuous observation and data collection until a target's full operational picture is revealed. In the context of [OSINT](/glossary/osint/) and platform intelligence, this translates to persistent monitoring of data sources, gradual correlation of disparate signals, and the patient assembly of [entity resolution](/glossary/entity-resolution/) graphs that would be impossible to construct through single-pass analysis.

This agent is part of the platform's 434-strong autonomous agent ecosystem, operating under the strict epistemic standards defined by the [NABLA Infinity](/glossary/nabla-infinity/) framework.

## Operational Philosophy

The Siege Master Specialist operates on the principle that the most valuable intelligence emerges from sustained observation rather than point-in-time snapshots. This philosophy manifests in several operational characteristics.

| Characteristic | Description | Advantage |
|---------------|-------------|-----------|
| **Temporal Persistence** | Operations span weeks to months | Captures patterns invisible in short windows |
| **Incremental Enrichment** | New data continuously enhances existing intelligence | Compound value accumulation |
| **Pattern Emergence** | Statistical patterns require large sample sizes | Higher confidence in findings |
| **Behavioral Profiling** | Extended observation reveals behavioral patterns | Predictive capability |
| **Network Mapping** | Relationship discovery requires repeated observations | Complete graph construction |
| **Change Detection** | Baseline establishment enables anomaly detection | Early warning capability |

## Operation Lifecycle

Every siege operation follows a structured lifecycle managed by the Siege Master Specialist.

```
Phase 1: Target Designation -> Phase 2: Collection Planning -> Phase 3: Baseline Establishment
    -> Phase 4: Sustained Collection -> Phase 5: Progressive Analysis -> Phase 6: Intelligence Production
```

### Phase Definitions

| Phase | Duration | Activities | Output |
|-------|----------|------------|--------|
| **Target Designation** | Hours | Target scoping, collection authorization | Operation charter |
| **Collection Planning** | Days | Source identification, scheduling, resource allocation | Collection plan |
| **Baseline Establishment** | 1-2 weeks | Initial data gathering, normal behavior profiling | Baseline dataset |
| **Sustained Collection** | Weeks-months | Continuous monitoring, incremental data gathering | Raw intelligence stream |
| **Progressive Analysis** | Ongoing | Pattern recognition, entity resolution, anomaly detection | Analytical products |
| **Intelligence Production** | As needed | Report generation, briefing preparation | Finished intelligence |

## Technical Architecture

The Siege Master Specialist is implemented as a long-lived [GenServer](/glossary/genserver/) process with persistent state backed by [PostgreSQL](/glossary/postgresql/) and [KuzuDB](/glossary/kuzudb/) for graph-based intelligence storage.

```elixir
defmodule PrismaticAgents.SiegeMasterSpecialist do
  @moduledoc """
  L3 Siege Master Specialist agent.
  Manages long-term persistent intelligence operations.
  """

  use GenServer
  require Logger

  @collection_cycle_ms :timer.hours(1)

  defstruct [
    :active_operations,
    :collection_schedule,
    :analysis_queue,
    :last_cycle_at,
    status: :operational
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    operations = restore_active_operations()
    schedule_collection_cycle()
    {:ok, %__MODULE__{active_operations: operations}}
  end

  @impl true
  def handle_info(:collection_cycle, state) do
    results =
      state.active_operations
      |> Enum.map(&execute_collection_pass/1)
      |> Enum.filter(&match?({:ok, _}, &1))

    :telemetry.execute(
      [:prismatic, :agents, :siege_master, :collection_cycle],
      %{operations_processed: length(results)},
      %{active_operations: length(state.active_operations)}
    )

    schedule_collection_cycle()
    {:noreply, %{state | last_cycle_at: DateTime.utc_now()}}
  end

  defp execute_collection_pass(operation) do
    sources = operation.collection_plan.sources

    collected =
      sources
      |> Task.async_stream(&collect_from_source/1, max_concurrency: 4, timeout: 30_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, data}} -> data
        _ -> []
      end)

    store_collected_intelligence(operation.id, collected)
    {:ok, %{operation_id: operation.id, records_collected: length(collected)}}
  end
end
```

## Data Collection Architecture

The Siege Master Specialist coordinates data collection across multiple source types, maintaining collection schedules that respect rate limits and API quotas.

| Source Type | Collection Frequency | Data Volume | Storage |
|------------|---------------------|-------------|---------|
| **Web scraping** | Hourly-Daily | Medium | PostgreSQL |
| **API polling** | Per rate limit | High | PostgreSQL |
| **DNS monitoring** | Every 6 hours | Low | PostgreSQL |
| **Certificate transparency** | Daily | Medium | PostgreSQL |
| **Social media** | Hourly | High | KuzuDB (graph) |
| **Public records** | Weekly | Low | PostgreSQL |

## Entity Resolution Pipeline

Long-term operations generate massive volumes of data points that must be correlated into coherent entity profiles. The Siege Master Specialist employs a progressive [entity resolution](/glossary/entity-resolution/) pipeline that improves accuracy with each collection cycle.

```elixir
defmodule PrismaticAgents.SiegeMasterSpecialist.EntityResolver do
  @moduledoc """
  Progressive entity resolution for siege operations.
  Confidence increases with each observation cycle.
  """

  @spec resolve_entities(list(map()), keyword()) :: {:ok, list(map())}
  def resolve_entities(raw_records, opts \\ []) do
    min_confidence = Keyword.get(opts, :min_confidence, 0.60)

    resolved =
      raw_records
      |> group_by_identifiers()
      |> merge_overlapping_groups()
      |> calculate_confidence_scores()
      |> Enum.filter(fn entity -> entity.confidence >= min_confidence end)

    {:ok, resolved}
  end
end
```

## Intelligence Analysis Methodologies

The Siege Master Specialist employs several analytical methodologies that are specifically designed for long-duration intelligence operations where data accumulates over extended periods.

### Temporal Pattern Analysis

Long-duration operations generate time-series data that reveals patterns invisible in short-term analysis. The Siege Master Specialist applies temporal analysis techniques to identify recurring behaviors, seasonal patterns, and trend inflections.

| Temporal Pattern | Detection Window | Analytical Value | Confidence Threshold |
|-----------------|-----------------|------------------|---------------------|
| **Daily Rhythms** | 7+ days | Activity schedules, timezone inference | 0.80 |
| **Weekly Cycles** | 30+ days | Work patterns, regular meeting schedules | 0.85 |
| **Monthly Patterns** | 90+ days | Billing cycles, reporting periods | 0.80 |
| **Behavioral Shifts** | Relative to baseline | Operational changes, personnel turnover | 0.75 |
| **Anomalous Events** | Any duration | Unusual activity spikes or gaps | 0.70 |

### Network Evolution Tracking

One of the most valuable aspects of siege operations is the ability to observe how networks evolve over time. New connections, severed relationships, and changing communication patterns all provide intelligence that point-in-time snapshots cannot capture.

```elixir
defmodule PrismaticAgents.SiegeMasterSpecialist.NetworkTracker do
  @moduledoc """
  Tracks network evolution over the lifetime of a siege operation.
  Detects new connections, severed links, and structural changes.
  """

  @spec analyze_network_delta(map(), map()) :: map()
  def analyze_network_delta(previous_snapshot, current_snapshot) do
    new_edges = MapSet.difference(current_snapshot.edges, previous_snapshot.edges)
    removed_edges = MapSet.difference(previous_snapshot.edges, current_snapshot.edges)
    new_nodes = MapSet.difference(current_snapshot.nodes, previous_snapshot.nodes)
    removed_nodes = MapSet.difference(previous_snapshot.nodes, current_snapshot.nodes)

    %{
      new_connections: MapSet.size(new_edges),
      severed_connections: MapSet.size(removed_edges),
      new_entities: MapSet.size(new_nodes),
      removed_entities: MapSet.size(removed_nodes),
      structural_change_score: calculate_structural_delta(previous_snapshot, current_snapshot),
      delta_timestamp: DateTime.utc_now()
    }
  end

  defp calculate_structural_delta(prev, curr) do
    total_elements = MapSet.size(MapSet.union(prev.edges, curr.edges))
    changed_elements = MapSet.size(MapSet.symmetric_difference(prev.edges, curr.edges))
    if total_elements > 0, do: changed_elements / total_elements, else: 0.0
  end
end
```

## NABLA Infinity Compliance

All intelligence products generated by siege operations must comply with the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework. The [Trinity Gate](/glossary/trinity-gate/) verification is mandatory for any intelligence claim with confidence above the decision threshold. Siege operations face heightened epistemic risk because their extended duration can create false confidence through repeated observation of the same underlying phenomenon.

| Axiom | Application to Siege Operations | Special Considerations |
|-------|-------------------------------|----------------------|
| **Signal Plurality** | Minimum 3 independent sources for any claimed fact | Independent means different collection methods, not just timestamps |
| **Contradiction Preservation** | Conflicting intelligence preserved with both sources cited | Temporal contradictions especially common in long-duration ops |
| **Time Decay** | All intelligence timestamped with decay function applied | Decay rates calibrated to operation-specific context |
| **Provenance Mandatory** | Every data point traces to its collection source and method | Full collection chain documented |
| **Unknown Valid** | Gaps in collection acknowledged as data | Collection gaps due to rate limits documented |

## Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Active operations** | 5-20 concurrent | Parallel siege campaigns |
| **Collection uptime** | >99.5% | Continuous data gathering reliability |
| **Entity resolution accuracy** | >90% | Correctly merged entities |
| **Intelligence latency** | <24 hours | Time from collection to analysis |
| **False positive rate** | <5% | Incorrect entity correlations |

## Integration Points

- [**Telemetry Integration**](/capabilities/telemetry-integration/) -- Collection metrics and operation health monitoring
- [**Intelligence Synthesis**](/capabilities/intelligence-synthesis/) -- Feeds finished intelligence into platform knowledge base
- [**Real-time Monitoring**](/capabilities/real-time-monitoring/) -- Live operation dashboards
- [**AIAD Standard**](/capabilities/aiad-standard/) -- Full compliance with agent specification

## Operation Security (OPSEC)

Siege operations require careful operational security to ensure that collection activities do not alert targets or compromise intelligence sources. The Siege Master Specialist implements OPSEC protocols that govern collection frequency, access patterns, and data handling throughout the operation lifecycle.

| OPSEC Measure | Implementation | Purpose |
|--------------|----------------|---------|
| **Rate Limiting** | Collection frequency below detection thresholds | Avoid triggering rate-based alerts |
| **Access Diversification** | Multiple collection paths and methods | Prevent pattern-based detection |
| **Data Compartmentalization** | Operation data separated by classification | Limit exposure from any single compromise |
| **Source Protection** | Collection methods never revealed in products | Preserve future collection capability |
| **Activity Rotation** | Collection schedules varied pseudo-randomly | Avoid temporal pattern detection |

## Related Agents

- [**Social Media Network Analyst**](/agents/social-media-network-analyst/) -- Social media intelligence collection for siege operations
- [**TikTok Intelligence Specialist**](/agents/tiktok-intelligence-specialist/) -- TikTok-specific collection capabilities
- [**Twitter/X Intelligence Specialist**](/agents/twitter-x-intelligence-specialist/) -- Twitter/X platform intelligence

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to initiate, manage, and terminate long-term intelligence operations.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)