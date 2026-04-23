+++
title = "youtube-intelligence-specialist"
weight = 419
[extra]
domain = "youtube"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "no-doubts", "seadf", "telemetry"]
domain_normalized = "social"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["youtube-intelligence-specialist", "Specialized", "agents", "agent", "Prismatic Platform", "YouTube", "OSINT", "KuzuDB"]
tags = ["agents", "agent", "youtube-intelligence-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "youtube-intelligence-specialist - Prismatic Platform"
+++

## Overview

The YouTube Intelligence Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's social media intelligence domain, responsible for gathering, analyzing, and correlating intelligence from YouTube's public data surface. This agent extracts structured intelligence from video metadata, channel profiles, comment threads, engagement patterns, and cross-platform reference networks to support [OSINT](@/glossary/osint.md) investigations, entity profiling, and digital footprint analysis.

YouTube, as the world's second-largest search engine and largest video platform, represents a critical intelligence surface. Channels, videos, comments, and playlists contain rich metadata that reveals organizational communications, individual digital identities, corporate activities, and network relationships. The YouTube Intelligence Specialist applies automated collection and analysis techniques to transform this unstructured public data into structured intelligence entities stored in the platform's [KuzuDB](@/glossary/kuzudb.md) graph database.

Built on the [AIAD](@/glossary/aiad.md) standard and integrated with the [GARDEN](@/glossary/garden.md) legacy knowledge system (which includes 250+ OSINT provider integrations), the agent feeds intelligence into the platform's [entity resolution](@/glossary/entity-resolution.md) pipeline where YouTube-derived identities are correlated with entities from other intelligence sources. All intelligence claims comply with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, requiring multi-source confirmation and formal provenance for every finding. The agent enforces the [NO DOUBTS](@/glossary/no-doubts.md) doctrine's requirement for evidence-based claims.

## Architecture

The YouTube Intelligence Specialist is built on a pipeline architecture that separates collection, extraction, analysis, and correlation into distinct [OTP](@/glossary/otp.md) processing stages.

```
YouTubeIntelligence.Supervisor
+-- Collector.Worker             (YouTube Data API integration)
+-- MetadataExtractor.Worker     (structured data extraction)
+-- ContentAnalyzer.Engine       (NLP and pattern analysis)
+-- NetworkMapper.Worker         (channel/commenter network graph)
+-- EntityResolver.Worker        (cross-platform identity correlation)
+-- IntelligenceStore.Server     (KuzuDB graph storage)
```

The Collector interfaces with YouTube's public Data API to retrieve channel information, video metadata, playlist contents, and comment threads within rate limits and terms of service. The MetadataExtractor parses raw API responses into structured intelligence entities: channels become organization/person profiles, videos become content artifacts with temporal metadata, and comments become social interaction records. The ContentAnalyzer applies natural language processing to video titles, descriptions, and comments to extract keywords, sentiment, topic classifications, and referenced entities.

The NetworkMapper constructs relationship graphs from cross-references: channel subscriptions, video responses, comment reply chains, and shared content patterns. The EntityResolver correlates YouTube-derived identities with entities in other intelligence databases, using [entity resolution](@/glossary/entity-resolution.md) techniques to link YouTube channels to organizational entities, social media profiles, and corporate registrations. The IntelligenceStore persists all extracted intelligence in [KuzuDB](@/glossary/kuzudb.md) with full provenance metadata.

## Core Capabilities

The YouTube Intelligence Specialist provides six primary capabilities forming a comprehensive YouTube intelligence pipeline.

**Channel Intelligence Collection** extracts structured profiles from YouTube channels: channel creation date, subscriber counts, upload frequency, content categories, associated websites, social media links, geographic indicators, and language patterns. This metadata creates baseline profiles for channels of intelligence interest, enabling temporal analysis of channel activity patterns and content evolution.

**Video Metadata Analysis** processes video-level data including titles, descriptions, tags, publication timestamps, view counts, engagement ratios, and thumbnail imagery. The agent identifies content patterns (topic clustering, publication scheduling, engagement anomalies) that reveal organizational communication strategies, marketing campaigns, or coordinated information operations.

**Comment Intelligence Extraction** analyzes public comment threads to identify active community members, sentiment trends, discussion topics, and external references. Comment analysis reveals community structures, identifies key opinion leaders, and detects coordinated engagement patterns. The agent extracts URLs, email addresses, and identifiers from comments for cross-platform correlation.

**Social Network Mapping** constructs relationship graphs from YouTube interaction data: channel-to-channel references, commenter overlap between channels, playlist curation patterns, and video response chains. These networks reveal organizational relationships, influence hierarchies, and community structures that are not visible from individual channel analysis.

**Cross-Platform Identity Correlation** links YouTube identities to entities in other intelligence databases. Channel descriptions often contain links to other social media profiles, corporate websites, and personal blogs. The agent extracts these cross-references and feeds them into the platform's [entity resolution](@/glossary/entity-resolution.md) pipeline, where YouTube-derived identities are correlated with entities from LinkedIn, Twitter, corporate registries, and other OSINT sources.

**Temporal Intelligence Analysis** tracks changes in channel behavior, content patterns, and engagement metrics over time. Sudden changes in upload frequency, topic focus, or engagement patterns can indicate organizational events (leadership changes, strategy shifts, crisis responses) that are intelligence-relevant.

## Implementation

The core intelligence collection and analysis pipeline is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that orchestrates YouTube data collection and processing.

```elixir
defmodule Prismatic.Agents.YouTubeIntelligence do
  @moduledoc """
  YouTube Intelligence Specialist - structured intelligence
  gathering and analysis from YouTube public data surface.
  """

  use GenServer

  alias Prismatic.Agents.YouTubeIntelligence.{
    Collector,
    MetadataExtractor,
    ContentAnalyzer,
    NetworkMapper,
    EntityResolver,
    IntelligenceStore
  }

  @type intelligence_entity :: %{
    id: String.t(),
    source: :youtube,
    entity_type: :channel | :video | :comment | :network,
    data: map(),
    provenance: map(),
    confidence: float(),
    collected_at: DateTime.t()
  }

  @type collection_task :: %{
    target: String.t(),
    scope: :channel | :video | :comments | :network | :full,
    depth: pos_integer(),
    params: map()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    {:ok, %{
      collections: %{},
      entity_count: 0,
      config: Map.new(opts)
    }}
  end

  @spec collect(collection_task()) :: {:ok, [intelligence_entity()]} | {:error, term()}
  def collect(task) do
    GenServer.call(__MODULE__, {:collect, task}, :timer.minutes(30))
  end

  @spec analyze_channel(String.t()) :: {:ok, map()} | {:error, term()}
  def analyze_channel(channel_id) do
    GenServer.call(__MODULE__, {:analyze_channel, channel_id}, :timer.minutes(15))
  end

  @impl true
  def handle_call({:collect, task}, _from, state) do
    with {:ok, raw_data} <- Collector.fetch(task),
         {:ok, entities} <- MetadataExtractor.extract(raw_data),
         {:ok, analyzed} <- ContentAnalyzer.analyze(entities),
         {:ok, networked} <- NetworkMapper.map_relationships(analyzed) do

      resolved = EntityResolver.correlate(networked)
      IntelligenceStore.persist(resolved)

      :telemetry.execute(
        [:prismatic, :youtube_intelligence, :collection_complete],
        %{
          entities: length(resolved),
          channels: count_type(resolved, :channel),
          videos: count_type(resolved, :video)
        },
        %{target: task.target, scope: task.scope}
      )

      new_state = %{state |
        entity_count: state.entity_count + length(resolved)
      }

      {:reply, {:ok, resolved}, new_state}
    end
  end

  @impl true
  def handle_call({:analyze_channel, channel_id}, _from, state) do
    task = %{
      target: channel_id,
      scope: :full,
      depth: 2,
      params: %{include_comments: true, include_network: true}
    }

    case Collector.fetch(task) do
      {:ok, raw_data} ->
        {:ok, entities} = MetadataExtractor.extract(raw_data)
        {:ok, analyzed} = ContentAnalyzer.analyze(entities)
        profile = build_channel_profile(analyzed)

        {:reply, {:ok, profile}, state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  defp build_channel_profile(entities) do
    channel = Enum.find(entities, &(&1.entity_type == :channel))
    videos = Enum.filter(entities, &(&1.entity_type == :video))

    %{
      channel: channel,
      video_count: length(videos),
      content_topics: extract_topics(videos),
      activity_pattern: analyze_temporal_pattern(videos),
      cross_references: extract_cross_references(entities)
    }
  end

  defp extract_topics(videos) do
    videos
    |> Enum.flat_map(&Map.get(&1.data, :topics, []))
    |> Enum.frequencies()
    |> Enum.sort_by(&elem(&1, 1), :desc)
    |> Enum.take(20)
  end

  defp analyze_temporal_pattern(videos) do
    videos
    |> Enum.map(&Map.get(&1.data, :published_at))
    |> Enum.reject(&is_nil/1)
    |> Enum.sort(DateTime)
  end

  defp extract_cross_references(entities) do
    entities
    |> Enum.flat_map(&Map.get(&1.data, :external_links, []))
    |> Enum.uniq()
  end

  defp count_type(entities, type) do
    Enum.count(entities, &(&1.entity_type == type))
  end
end
```

The `collect/1` function orchestrates the full intelligence pipeline: fetching raw data from the YouTube API, extracting structured entities, analyzing content, mapping relationships, resolving cross-platform identities, and persisting results. The `analyze_channel/1` function provides a focused channel analysis producing a comprehensive profile.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [KuzuDB](@/glossary/kuzudb.md) Graph Database | Outbound | Persists intelligence entities and relationship networks |
| [Entity Resolution](@/glossary/entity-resolution.md) Pipeline | Bidirectional | Feeds YouTube identities; receives correlated multi-source entities |
| [GARDEN](@/glossary/garden.md) OSINT Providers | Inbound | Leverages 250+ OSINT providers for cross-platform correlation |
| [Prismatic Agents](@/glossary/prismatic-agents.md) Runtime | Bidirectional | Lifecycle management and workflow integration |
| [Prismatic Web](@/glossary/prismatic-web.md) | Outbound | Provides intelligence data for investigation dashboards |
| YouTube Data API | External | Primary data source for intelligence collection |
| [ETS](@/glossary/ets.md) Collection Cache | Internal | Rate-limit management and response caching |

## Operational Workflow

The agent operates through three modes: targeted collection, monitoring, and investigation support.

**Targeted Collection** executes specific intelligence gathering tasks against designated YouTube targets (channels, videos, or search queries). Tasks are parameterized with scope (channel only, full network) and depth (how many relationship hops to follow). Results are processed through the full intelligence pipeline and stored in KuzuDB.

**Continuous Monitoring** watches previously collected channels for changes in activity patterns, content topics, subscriber counts, and engagement metrics. Significant changes trigger re-collection and analysis, generating intelligence alerts for investigation teams.

**Investigation Support** provides on-demand intelligence analysis for active investigations. Investigators can request channel profiles, network maps, temporal analysis, and cross-platform correlation for specific targets. Results are formatted for integration with the platform's due diligence and investigation workflows.

The collection workflow proceeds through six phases: (1) target specification and API request construction, (2) data collection within rate limits, (3) structured entity extraction, (4) content and pattern analysis, (5) network mapping and identity correlation, and (6) intelligence storage and telemetry publication.

## NABLA Compliance

The YouTube Intelligence Specialist operates under strict [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance.

**Signal Plurality**: Every intelligence claim requires confirmation from at least two independent signals. A channel attribution requires both profile metadata analysis and content analysis confirmation. A network relationship requires both direct link evidence and behavioral correlation.

**Contradiction Preservation**: When different analysis modules produce conflicting assessments (content analysis suggests one organization while metadata points to another), both assessments are preserved with their respective evidence chains. The agent does not force premature resolution.

**Provenance Mandatory**: Every intelligence entity carries complete provenance: YouTube API endpoints queried, response timestamps, extraction rules applied, analysis methods used, and confidence scores. Provenance chains are immutable.

**Source Independence**: Intelligence from YouTube is treated as one signal among many. Cross-platform correlation through the entity resolution pipeline provides independent signals. YouTube intelligence alone does not establish high-confidence claims without corroboration from independent sources.

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.YouTubeIntelligence,
  api_key: System.get_env("YOUTUBE_API_KEY"),
  rate_limit: 100,
  rate_window: :timer.minutes(1),
  max_collection_depth: 3,
  default_scope: :channel,
  monitoring_interval: :timer.hours(12),
  cache_ttl: :timer.hours(24),
  kuzudb_graph: "youtube_intelligence",
  telemetry_prefix: [:prismatic, :youtube_intelligence]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `rate_limit` | 100 | Maximum API requests per rate window |
| `rate_window` | 1 minute | Rate limit time window |
| `max_collection_depth` | 3 | Maximum relationship traversal depth |
| `monitoring_interval` | 12 hours | Frequency of monitored channel re-checks |
| `cache_ttl` | 24 hours | TTL for cached API responses |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Single channel collection | < 30 seconds | 5-15 seconds |
| Full channel analysis (with network) | < 5 minutes | 1-3 minutes |
| Comment extraction (1000 comments) | < 60 seconds | 20-40 seconds |
| Network mapping (depth 2) | < 10 minutes | 3-7 minutes |
| Entity resolution | < 30 seconds | 5-15 seconds |
| KuzuDB persistence | < 5 seconds | 1-3 seconds |
| Memory footprint | < 100 MB | 40-70 MB |

The agent respects YouTube API rate limits through token bucket rate limiting cached in ETS. Collection operations are parallelized where API limits permit, and response caching eliminates redundant API calls for recently accessed data. Network mapping uses breadth-first traversal with configurable depth limits to bound collection scope.

## Related Resources

- [OSINT](@/glossary/osint.md) -- Open Source Intelligence methodology and tools
- [Entity Resolution](@/glossary/entity-resolution.md) -- Cross-platform identity correlation
- [KuzuDB](@/glossary/kuzudb.md) -- Graph database for intelligence entity storage
- [GARDEN](@/glossary/garden.md) -- Legacy knowledge system with 250+ OSINT providers
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing intelligence claims
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation for intelligence findings
- [NO DOUBTS Doctrine](@/glossary/no-doubts.md) -- Evidence-based decision making requirement
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification standard

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)