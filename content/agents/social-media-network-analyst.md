+++
title = "social-media-network-analyst"
weight = 377
[extra]
domain = "social"
level = "L3"
description = "Cross-Platform Social Media Intelligence operations and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "no-doubts", "seadf", "telemetry"]
domain_normalized = "social"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 136
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["social-media-network-analyst", "Cross-Platform", "Social", "Media", "Intelligence", "agents", "agent", "Prismatic Platform", "Social Media", "Network Analyst"]
tags = ["agents", "agent", "social-media-network-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "social-media-network-analyst - Prismatic Platform"
+++

## Overview

The Social Media Network Analyst is an L3 agent operating in the **social** domain of the Prismatic Platform. This agent specializes in cross-platform social media intelligence (SOCMINT) operations, performing comprehensive analysis of social network structures, influence patterns, and information propagation dynamics across multiple social media platforms simultaneously. The agent synthesizes data from platform-specific intelligence specialists into unified analytical products that reveal cross-platform behavioral patterns invisible to single-platform analysis.

Social media intelligence has become a critical component of modern [OSINT](@/glossary/osint.md) operations. Individuals and organizations maintain presences across multiple platforms, and understanding the complete picture of their social network activity requires correlation of identities, content, and relationships across platform boundaries. The Social Media Network Analyst serves as the central hub for this cross-platform synthesis, coordinating with platform-specific specialists while maintaining the epistemic rigor demanded by the [NABLA Infinity](@/glossary/nabla-infinity.md) framework.

This agent is part of the platform's 434-strong autonomous agent ecosystem, contributing to the intelligence synthesis infrastructure under [AIAD](@/glossary/aiad.md) standard compliance.

## Cross-Platform Intelligence Architecture

The Social Media Network Analyst coordinates with multiple platform-specific intelligence specialists, each providing domain expertise for their respective platform.

| Platform Specialist | Platform | Data Types | Integration |
|--------------------|----------|------------|-------------|
| [**TikTok Intelligence Specialist**](@/agents/tiktok-intelligence-specialist.md) | TikTok | Video metadata, hashtags, engagement | Direct feed |
| [**Twitter/X Intelligence Specialist**](@/agents/twitter-x-intelligence-specialist.md) | Twitter/X | Tweets, followers, interactions | Direct feed |
| **LinkedIn Intelligence Specialist** | LinkedIn | Professional networks, companies | API integration |
| **Facebook Intelligence Specialist** | Facebook/Meta | Social graphs, groups, pages | API integration |
| **Telegram Intelligence Specialist** | Telegram | Channels, groups, messages | Channel monitoring |

## Network Analysis Capabilities

The Social Media Network Analyst applies graph theory and network science methodologies to social media data, producing structured intelligence products.

### Graph Metrics

| Metric | Description | Application |
|--------|-------------|-------------|
| **Degree Centrality** | Number of connections per node | Identify most connected accounts |
| **Betweenness Centrality** | Bridge positions between communities | Identify information brokers |
| **Closeness Centrality** | Average distance to all other nodes | Identify efficient spreaders |
| **PageRank** | Iterative influence scoring | Rank accounts by influence |
| **Community Detection** | Modularity-based clustering | Identify coordinated groups |
| **Temporal Patterns** | Activity timing analysis | Detect automated behavior |

### Cross-Platform Entity Resolution

The most critical capability of the Social Media Network Analyst is [entity resolution](@/glossary/entity-resolution.md) across platform boundaries -- determining when accounts on different platforms belong to the same real-world entity.

```elixir
defmodule PrismaticAgents.SocialMediaNetworkAnalyst do
  @moduledoc """
  L3 Social Media Network Analyst.
  Cross-platform social media intelligence synthesis.
  """

  use GenServer
  require Logger

  @analysis_interval_ms :timer.hours(2)

  defstruct [
    :active_operations,
    :platform_feeds,
    :entity_graph,
    :last_analysis_at,
    status: :monitoring
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_analysis()
    {:ok, %__MODULE__{platform_feeds: %{}, entity_graph: initialize_graph()}}
  end

  @impl true
  def handle_info(:analyze, state) do
    platform_data = collect_platform_feeds(state.platform_feeds)
    resolved_entities = resolve_cross_platform_entities(platform_data)
    network_metrics = calculate_network_metrics(resolved_entities)

    :telemetry.execute(
      [:prismatic, :agents, :social_media, :analysis_complete],
      %{entities_resolved: length(resolved_entities), metrics_computed: map_size(network_metrics)},
      %{platforms_analyzed: map_size(platform_data)}
    )

    schedule_analysis()
    {:noreply, %{state | entity_graph: resolved_entities, last_analysis_at: DateTime.utc_now()}}
  end

  defp resolve_cross_platform_entities(platform_data) do
    platform_data
    |> Enum.flat_map(fn {_platform, entities} -> entities end)
    |> group_by_resolution_signals()
    |> merge_with_confidence_scoring()
  end

  defp group_by_resolution_signals(entities) do
    entities
    |> Enum.group_by(&extract_resolution_key/1)
    |> Enum.map(fn {_key, group} -> merge_entity_group(group) end)
  end
end
```

## Intelligence Product Types

The Social Media Network Analyst produces several types of structured intelligence products, each serving different analytical needs.

| Product Type | Description | Update Frequency | Consumers |
|-------------|-------------|------------------|-----------|
| **Network Map** | Visual graph of entity relationships | On-demand | Analysts |
| **Influence Report** | Ranked list of influential accounts | Daily | Investigators |
| **Community Briefing** | Detected community structures and themes | Weekly | Strategic command |
| **Anomaly Alert** | Unusual activity patterns detected | Real-time | Security teams |
| **Cross-Platform Profile** | Unified entity profiles across platforms | Continuous | Entity database |
| **Temporal Analysis** | Activity patterns over time | Daily | Pattern analysts |

## Graph Storage Architecture

The Social Media Network Analyst stores social network graphs in [KuzuDB](@/glossary/kuzudb.md), the platform's graph database, which enables efficient traversal queries and pattern matching across large social networks.

```elixir
defmodule PrismaticAgents.SocialMediaNetworkAnalyst.GraphStorage do
  @moduledoc """
  KuzuDB graph storage for social network analysis.
  """

  @spec store_relationship(map(), map(), String.t()) :: {:ok, map()} | {:error, term()}
  def store_relationship(source_entity, target_entity, relationship_type) do
    PrismaticStorageKuzu.create_edge(
      %{
        source: source_entity.id,
        target: target_entity.id,
        type: relationship_type,
        confidence: calculate_edge_confidence(source_entity, target_entity),
        first_observed: DateTime.utc_now(),
        source_platform: source_entity.platform
      }
    )
  end
end
```

## Entity Resolution Methodology

Cross-platform entity resolution is the most analytically valuable and technically challenging capability of the Social Media Network Analyst. The process of determining when accounts on different platforms belong to the same real-world entity relies on multiple resolution signals, each with its own confidence characteristics.

| Resolution Signal | Description | Confidence | False Positive Risk |
|------------------|-------------|------------|---------------------|
| **Username Similarity** | Same or similar usernames across platforms | Medium | High (common names) |
| **Profile Image Match** | Perceptual hash comparison of profile images | High | Low |
| **Bio Text Overlap** | Semantic similarity of profile descriptions | Medium | Medium |
| **URL Cross-Reference** | Shared links pointing to same external sites | Very High | Very Low |
| **Temporal Correlation** | Synchronized posting patterns across platforms | High | Medium |
| **Content Duplication** | Same text or media posted across platforms | Very High | Very Low |
| **Network Overlap** | Same connections across platform boundaries | High | Medium |
| **Self-Declaration** | Explicit cross-platform links in profiles | Very High | Very Low |

The entity resolution pipeline combines these signals using a Bayesian confidence aggregation model. A single high-confidence signal (such as an explicit cross-platform link) may be sufficient to establish entity equivalence, while multiple medium-confidence signals must agree to reach the confidence threshold required by the [NABLA Infinity](@/glossary/nabla-infinity.md) framework.

```elixir
defmodule PrismaticAgents.SocialMediaNetworkAnalyst.EntityMatcher do
  @moduledoc """
  Multi-signal entity resolution across social media platforms.
  Uses Bayesian confidence aggregation for cross-platform identity matching.
  """

  @confidence_threshold 0.80

  @spec match_entities(map(), map()) :: {:match, float()} | {:no_match, float()}
  def match_entities(entity_a, entity_b) do
    signals = [
      {:username, compare_usernames(entity_a.username, entity_b.username)},
      {:profile_image, compare_profile_images(entity_a.avatar_hash, entity_b.avatar_hash)},
      {:bio_text, compare_bios(entity_a.bio, entity_b.bio)},
      {:url_crossref, compare_urls(entity_a.urls, entity_b.urls)},
      {:temporal, compare_activity_patterns(entity_a.activity, entity_b.activity)},
      {:network, compare_network_overlap(entity_a.connections, entity_b.connections)}
    ]

    confidence = aggregate_confidence(signals)

    if confidence >= @confidence_threshold do
      {:match, confidence}
    else
      {:no_match, confidence}
    end
  end

  defp aggregate_confidence(signals) do
    signals
    |> Enum.filter(fn {_, score} -> score > 0 end)
    |> Enum.reduce(0.5, fn {_type, score}, prior ->
      bayesian_update(prior, score)
    end)
  end

  defp bayesian_update(prior, evidence) do
    (prior * evidence) / (prior * evidence + (1 - prior) * (1 - evidence))
  end
end
```

## NABLA Infinity Compliance

All intelligence products must satisfy the [NABLA Infinity](@/glossary/nabla-infinity.md) axioms before publication. Cross-platform intelligence is held to especially strict compliance standards because the synthesis of data from multiple sources creates additional risk of correlation errors and false confidence.

| Axiom | Application | Enforcement |
|-------|-------------|-------------|
| **Signal Plurality** | Cross-platform confirmation required for entity claims | HARD |
| **Contradiction Preservation** | Conflicting platform data preserved with both sources | HARD |
| **Time Decay** | Social media intelligence decays rapidly; timestamps mandatory | HARD |
| **Provenance Mandatory** | Every data point traced to platform, account, and timestamp | HARD |
| **Source Independence** | Platform-specific data weighted by independence from other platforms | SOFT |
| **Unknown Valid** | Unresolved entity matches preserved as uncertain | HARD |
| **Absence Informative** | Missing platform presence treated as analytical signal | SOFT |

## Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Platforms monitored** | 5+ | Active social media platform coverage |
| **Entity resolution accuracy** | >85% | Cross-platform identity matching |
| **Network analysis latency** | <30 minutes | Time from data collection to analysis |
| **Graph update frequency** | Hourly | Entity graph refresh cycle |

## Integration Points

- [**Intelligence Synthesis**](@/capabilities/intelligence-synthesis.md) -- Feeds social intelligence into platform knowledge base
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Collection and analysis performance metrics
- [**Real-time Monitoring**](@/capabilities/real-time-monitoring.md) -- Live dashboards for active social monitoring operations
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## Related Agents

- [**TikTok Intelligence Specialist**](@/agents/tiktok-intelligence-specialist.md) -- TikTok-specific intelligence collection
- [**Twitter/X Intelligence Specialist**](@/agents/twitter-x-intelligence-specialist.md) -- Twitter/X platform intelligence
- [**Siege Master Specialist**](@/agents/siege-master-specialist.md) -- Long-term persistent intelligence operations

## Cross-Platform Analysis Challenges

Cross-platform social media intelligence presents unique analytical challenges that the Social Media Network Analyst must address through specialized methodologies and careful epistemic discipline.

| Challenge | Description | Mitigation Strategy |
|-----------|-------------|---------------------|
| **Platform Data Heterogeneity** | Each platform uses different data models and APIs | Normalization layer with platform-specific adapters |
| **Identity Ambiguity** | Same person may use different names across platforms | Multi-signal entity resolution with confidence scoring |
| **Temporal Misalignment** | Platforms use different timestamp formats and timezones | UTC normalization with platform-specific offset handling |
| **Privacy Boundaries** | Some platforms have stricter privacy settings | Respect platform-specific access controls, work with available data |
| **API Instability** | Platform APIs change frequently without notice | Adapter pattern with version detection and fallback |
| **Scale Disparity** | Vastly different data volumes across platforms | Normalized sampling with weighted analysis |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to initiate cross-platform intelligence collection and synthesis operations.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)