+++
title = "chatgpt-archive-specialist"
weight = 69
[extra]
domain = "ai-archive-management"
level = "L3"
description = "Autonomy Created: 2025-12-05 AIAD Compliance: v1.0"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry"]
domain_normalized = "general"
content_version = "1.1.0"
last_enhanced = "2026-02-14"
word_count = 400
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-archive-specialist", "Autonomy", "Created", "2025-12-05", "AIAD", "Compliance", "agents", "agent", "Prismatic Platform", "Phase"]
tags = ["agents", "agent", "chatgpt-archive-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-archive-specialist - Prismatic Platform"
+++

## Overview

The ChatGPT Archive Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the AI Archive Management domain of the Prismatic Platform. This agent manages the systematic archival, indexing, and retrieval of ChatGPT interaction histories, ensuring that valuable AI-generated insights are preserved for future reference, pattern extraction, and cross-session knowledge continuity. In a platform that coordinates multiple AI providers for diverse analytical tasks, interaction archives become a strategic knowledge asset that improves over time.

The ChatGPT Archive Specialist captures not just raw conversation logs but structured metadata: prompt patterns that produced high-quality responses, token usage efficiency [metrics](@/glossary/metrics.md), response quality scores, contextual tags that enable targeted retrieval, and temporal markers that track knowledge evolution. This structured archival approach transforms ephemeral AI interactions into a searchable, analyzable knowledge base that enables the platform to learn from its own AI consultation history. Over time, the archive reveals which prompt strategies produce the best results for specific analysis types, which model configurations optimize quality-to-cost ratios, and which consultation patterns should be replicated or retired. This agent is part of the platform's 434-strong autonomous agent ecosystem, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard, operating under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine.

## Architecture

The Archive Specialist implements a three-tier storage architecture designed for efficient ingestion, indexed retrieval, and long-term knowledge preservation.

**Hot Tier (ETS)** -- Recent interactions from the current and previous session are maintained in [ETS](@/glossary/ets.md) tables for sub-millisecond access. The hot tier supports real-time queries from agents that need to reference recent AI interactions for context building or deduplication. Hot tier entries include full conversation content, metadata, and quality annotations.

**Warm Tier (PostgreSQL)** -- Interactions older than the hot tier retention window are migrated to PostgreSQL with full-text search indexing. The warm tier supports complex queries including metadata filtering, temporal range searches, quality score ranking, and prompt pattern matching. Database-level compression reduces storage costs while maintaining query performance.

**Cold Tier (Compressed Archive)** -- Interactions exceeding the warm tier retention period are compressed and moved to archival storage. Cold tier data is accessible through batch retrieval requests with higher latency but minimal storage cost. This tier satisfies [GDPR](@/glossary/gdpr.md) retention requirements by enabling scheduled purging of archived data that exceeds legal retention limits.

## Core Capabilities

- **Structured interaction capture** recording ChatGPT conversations with rich metadata including prompt templates used, response quality scores, token consumption metrics, contextual domain tags, and the requesting agent's identity
- **Knowledge extraction** identifying reusable insights, solution patterns, and analytical techniques from archived interactions, packaging them for integration into the platform's knowledge base and prompt template library
- **Searchable archive management** maintaining full-text indexed archives that support complex queries spanning metadata filters, temporal ranges, quality thresholds, and domain classifications for efficient knowledge retrieval
- **Quality-annotated storage** preserving interaction quality assessments alongside conversation data, enabling retrospective analysis of which consultation patterns produce the highest-value outputs for specific analysis types
- **Retention policy enforcement** managing archive lifecycle including tier migration, compression, and scheduled purging aligned with GDPR data retention requirements and organizational knowledge management policies
- **Pattern mining** applying statistical analysis to archived interactions to identify recurring consultation patterns, prompt effectiveness trends, and model performance variations across different analysis domains
- **Cross-session continuity** enabling agents to reference previous AI interactions when building context for new consultations, preventing redundant queries and enabling progressive knowledge building across sessions

## Implementation

The archive system is implemented as an [OTP](@/glossary/otp.md) application with supervised processes for each storage tier and a unified query interface.

```elixir
defmodule Prismatic.AI.Archive.Specialist do
  @moduledoc """
  Manages structured archival, indexing, and retrieval of ChatGPT
  interaction histories with tiered storage and knowledge extraction.
  """
  use GenServer

  alias Prismatic.AI.Archive.{
    HotStore,
    WarmStore,
    ColdStore,
    KnowledgeExtractor,
    RetentionManager
  }

  @type interaction :: %{
    id: String.t(),
    session_id: String.t(),
    agent: atom(),
    prompt_template: String.t(),
    messages: list(message()),
    quality_score: float(),
    token_usage: %{prompt: integer(), completion: integer()},
    metadata: map(),
    archived_at: DateTime.t()
  }

  @spec archive(interaction()) :: {:ok, String.t()} | {:error, term()}
  def archive(interaction) do
    GenServer.call(__MODULE__, {:archive, interaction})
  end

  @spec search(keyword()) :: {:ok, list(interaction())} | {:error, term()}
  def search(criteria) do
    GenServer.call(__MODULE__, {:search, criteria}, :timer.seconds(30))
  end

  @spec extract_patterns(keyword()) :: {:ok, list(pattern())} | {:error, term()}
  def extract_patterns(opts \\ []) do
    GenServer.call(__MODULE__, {:extract_patterns, opts}, :timer.minutes(2))
  end

  @impl true
  def handle_call({:archive, interaction}, _from, state) do
    enriched = enrich_with_metadata(interaction)

    with :ok <- HotStore.insert(enriched),
         :ok <- schedule_tier_migration(enriched) do
      :telemetry.execute(
        [:prismatic, :ai, :archive, :stored],
        %{token_usage: interaction.token_usage.prompt + interaction.token_usage.completion},
        %{agent: interaction.agent, quality_score: interaction.quality_score}
      )
      {:reply, {:ok, enriched.id}, state}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:search, criteria}, _from, state) do
    results =
      case determine_search_tier(criteria) do
        :hot -> HotStore.query(criteria)
        :warm -> WarmStore.query(criteria)
        :all -> merge_results(HotStore.query(criteria), WarmStore.query(criteria))
      end

    {:reply, results, state}
  end

  defp enrich_with_metadata(interaction) do
    Map.merge(interaction, %{
      archived_at: DateTime.utc_now(),
      provenance: build_provenance_chain(interaction),
      content_hash: :crypto.hash(:sha256, Jason.encode!(interaction.messages))
    })
  end
end
```

## Integration Points

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md) | Data Source | Provides raw ChatGPT interaction data including API responses, token usage, and timing metrics |
| [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) | Context Partner | Shares context metadata that enriches archive entries with domain classification and relevance scores |
| [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) | Pattern Consumer | Receives extracted prompt patterns and effectiveness metrics for template library improvement |
| [context-preservation-specialist-agent](@/agents/context-preservation-specialist-agent.md) | Preservation Coordination | Aligns AI archive management with platform-wide context preservation strategies and retention policies |
| PostgreSQL | Warm Storage | Provides full-text indexed storage for medium-term interaction archives with complex query support |
| [ETS](@/glossary/ets.md) | Hot Storage | Supplies sub-millisecond access to recent interactions for real-time context building |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Observability | Emits archival metrics including storage utilization, query performance, and pattern extraction rates |

## Operational Workflow

**Phase 1: Interaction Capture** -- When any platform agent completes a ChatGPT interaction through the bridge commander, the Archive Specialist receives the complete interaction record including all messages, token usage, timing data, and the quality score assigned by the consuming agent.

**Phase 2: Metadata Enrichment** -- The raw interaction is enriched with archival metadata including content hashing for deduplication, domain classification from the context manager, prompt template identification, and provenance chain construction linking the interaction to the requesting agent and analysis context.

**Phase 3: Hot Storage** -- The enriched interaction is inserted into the ETS hot tier for immediate availability. Agents building context for new consultations can reference this interaction within milliseconds of archival.

**Phase 4: Knowledge Extraction** -- Periodically, the knowledge extractor processes recent archives to identify reusable patterns. High-quality interactions are analyzed for prompt effectiveness, response structure patterns, and domain-specific consultation strategies that can improve future AI interactions.

**Phase 5: Tier Migration** -- Interactions exceeding the hot tier retention window are migrated to PostgreSQL warm storage with full-text indexing. Migration preserves all metadata and quality annotations while freeing ETS memory for current session data.

**Phase 6: Retention Management** -- The retention manager applies lifecycle policies to archived data, migrating warm tier entries to cold compressed storage and purging expired cold tier data in compliance with GDPR requirements.

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Provenance Mandatory** | Every archived interaction carries a complete provenance chain from the requesting agent through the prompt template to the API response and quality assessment |
| **Time Decay** | Archive entries carry timestamps and quality scores that are adjusted over time; older interactions are weighted lower in pattern extraction unless explicitly referenced |
| **Signal Plurality** | Knowledge extraction requires patterns to appear across multiple independent interactions before being promoted to the prompt template library |
| **Contradiction Preservation** | When archived interactions contain contradictory AI recommendations for similar queries, both are preserved with their temporal and contextual metadata intact |
| **Source Independence** | Archive analysis weights interactions from different requesting agents and different prompt templates independently to avoid single-source pattern bias |

## Configuration

```elixir
config :prismatic_ai, Prismatic.AI.Archive.Specialist,
  # Hot tier retention (seconds)
  hot_tier_ttl: 86_400,
  # Warm tier retention (days)
  warm_tier_ttl_days: 365,
  # Cold tier retention (days)
  cold_tier_ttl_days: 2555,
  # Pattern extraction interval (seconds)
  extraction_interval: 3600,
  # Minimum interactions for pattern promotion
  min_pattern_occurrences: 5,
  # Content hash algorithm
  hash_algorithm: :sha256,
  # GDPR-compliant purge schedule
  purge_schedule: "0 2 * * *"
```

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hot tier insert | < 1ms | ETS write for new interaction archival |
| Hot tier query | < 500 microseconds | ETS lookup for recent interaction retrieval |
| Warm tier query | < 50ms | PostgreSQL full-text search across indexed archives |
| Tier migration | < 100ms per record | Hot to warm tier migration including index construction |
| Pattern extraction cycle | < 5 minutes | Full knowledge extraction pass over recent archives |
| Storage efficiency | > 10:1 compression | Cold tier compression ratio for archived interactions |

## Related Resources

- [**chatgpt-bridge-commander**](@/agents/chatgpt-bridge-commander.md) (L2) -- API transport providing raw interaction data
- [**chatgpt-context-manager**](@/agents/chatgpt-context-manager.md) (L3) -- Context metadata enrichment partner
- [**chatgpt-prompt-engineer**](@/agents/chatgpt-prompt-engineer.md) (L3) -- Consumer of extracted prompt patterns
- [**context-preservation-specialist-agent**](@/agents/context-preservation-specialist-agent.md) -- Platform-wide context preservation alignment
- [GDPR](@/glossary/gdpr.md) -- Data protection regulation governing archive retention policies

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)