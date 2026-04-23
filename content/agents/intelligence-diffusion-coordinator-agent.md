+++
title = "Intelligence Diffusion Coordinator Agent"
weight = 212
[extra]
domain = "general"
level = "L3"
description = "OSINT Provider -> Consumer Agent"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "osint", "3nl"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Diffusion", "Coordinator", "Agent", "OSINT", "Provider", "Consumer", "agents", "Prismatic Platform", "Real"]
tags = ["agents", "agent", "intelligence-diffusion-coordinator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Intelligence Diffusion Coordinator Agent - Prismatic Platform"
+++

## Overview

The Intelligence Diffusion Coordinator Agent operates as an L3 strategic command authority within the General domain of the Prismatic Platform. This agent orchestrates the flow of intelligence data from [OSINT](/glossary/osint/) providers to consuming agents, ensuring that raw intelligence is properly enriched, deduplicated, scored for confidence, and routed to the appropriate downstream consumers. The coordinator acts as the central nervous system for intelligence distribution, preventing both information overload and intelligence gaps.

Intelligence diffusion in the Prismatic ecosystem involves 250+ OSINT providers generating data across domains including corporate registries, social media, financial databases, legal records, and technical infrastructure. Without coordinated diffusion, consuming agents would face duplicate data, inconsistent formats, missing provenance, and overwhelming volumes. The Intelligence Diffusion Coordinator normalizes all intelligence into a common format, applies confidence scoring based on source reliability, and routes enriched intelligence to registered consumers based on their subscription profiles.

## Operational Domain

The coordinator operates across all intelligence domains, serving as the bridge between data acquisition (OSINT providers) and data consumption (analysis agents). It interfaces with the platform's [GenStage](/glossary/genstage/) pipelines for backpressure-aware data flow and uses [PubSub](/glossary/pubsub/) for real-time intelligence event distribution.

## Diffusion Architecture

The intelligence diffusion pipeline processes raw provider output through multiple enrichment stages before delivery to consumers.

| Stage | Function | Input | Output |
|---|---|---|---|
| Ingestion | Receive raw provider data | Provider-specific format | Normalized intelligence record |
| Deduplication | Detect and merge duplicates | Normalized records | Unique intelligence items |
| Enrichment | Add context and cross-references | Unique items | Enriched intelligence |
| Scoring | Apply confidence and relevance scores | Enriched intelligence | Scored intelligence |
| Routing | Match to consumer subscriptions | Scored intelligence | Targeted delivery |
| Delivery | Push to consuming agents | Routed intelligence | Acknowledged receipt |

```elixir
defmodule PrismaticAgents.IntelligenceDiffusion do
  @moduledoc """
  Intelligence diffusion coordinator that manages the flow
  of OSINT data from providers to consuming agents.
  """

  use GenServer

  @type intelligence_record :: %{
    id: String.t(),
    source: String.t(),
    source_reliability: float(),
    content: map(),
    entity_refs: [String.t()],
    confidence: float(),
    timestamp: DateTime.t(),
    provenance: [source_record()]
  }

  @spec ingest(String.t(), map()) :: {:ok, String.t()} | {:error, term()}
  def ingest(provider_id, raw_data) do
    GenServer.call(__MODULE__, {:ingest, provider_id, raw_data})
  end

  @spec subscribe(atom(), subscription_filter()) :: :ok
  def subscribe(consumer_id, filter) do
    GenServer.call(__MODULE__, {:subscribe, consumer_id, filter})
  end

  @impl true
  def handle_call({:ingest, provider_id, raw_data}, _from, state) do
    with {:ok, normalized} <- normalize(provider_id, raw_data),
         {:ok, deduped} <- deduplicate(normalized, state.seen_items),
         {:ok, enriched} <- enrich(deduped),
         {:ok, scored} <- score_confidence(enriched),
         {:ok, routed} <- route_to_consumers(scored, state.subscriptions) do
      {:reply, {:ok, scored.id}, update_state(state, scored)}
    else
      {:error, :duplicate} -> {:reply, {:ok, :duplicate_skipped}, state}
      error -> {:reply, error, state}
    end
  end
end
```

## Provider Management

The coordinator maintains a registry of all active OSINT providers with their reliability ratings, data formats, and throughput capabilities.

| Provider Category | Count | Data Type | Reliability Range | Update Frequency |
|---|---|---|---|---|
| Corporate Registries | 30+ | Entity records, filings | 0.85 - 0.95 | Daily to weekly |
| Social Media | 15+ | Posts, profiles, networks | 0.40 - 0.70 | Real-time to hourly |
| Financial Databases | 20+ | Financial records, ratings | 0.80 - 0.95 | Daily |
| Legal Records | 25+ | Court filings, sanctions | 0.90 - 0.98 | Daily to weekly |
| Technical Infrastructure | 20+ | DNS, certificates, services | 0.75 - 0.90 | Hourly to daily |
| News and Media | 40+ | Articles, press releases | 0.50 - 0.80 | Real-time |

## Consumer Subscription Model

Consuming agents register subscription filters that define the intelligence they need. The coordinator matches incoming intelligence against these filters for targeted delivery.

```elixir
defmodule PrismaticAgents.IntelligenceDiffusion.Subscription do
  @type t :: %__MODULE__{
    consumer_id: atom(),
    entity_types: [atom()],
    domains: [String.t()],
    min_confidence: float(),
    max_age_hours: non_neg_integer(),
    delivery_mode: :push | :pull,
    priority: :high | :normal | :low
  }

  defstruct [
    :consumer_id,
    entity_types: [:all],
    domains: [:all],
    min_confidence: 0.5,
    max_age_hours: 24,
    delivery_mode: :push,
    priority: :normal
  ]
end
```

## Confidence Scoring

The coordinator applies a multi-factor confidence scoring model to all intelligence records.

| Factor | Weight | Description |
|---|---|---|
| Source reliability | 30% | Historical accuracy of the provider |
| Corroboration | 25% | Number of independent sources confirming |
| Freshness | 20% | Time since data was collected |
| Completeness | 15% | Proportion of expected fields populated |
| Consistency | 10% | Alignment with existing intelligence |

## Key Capabilities

- **Provider-to-consumer routing** managing subscription-based intelligence delivery from 250+ OSINT providers to consuming analysis agents with configurable filtering
- **Deduplication engine** detecting and merging duplicate intelligence records across providers using entity resolution and content similarity analysis
- **Confidence scoring** applying multi-factor scoring models that account for source reliability, corroboration, freshness, and consistency
- **[Backpressure](/glossary/backpressure/) management** using GenStage demand-driven pipelines to prevent consumer overload during high-volume intelligence periods
- **Provenance tracking** maintaining complete source provenance chains for every intelligence record, satisfying the NABLA Provenance Mandatory axiom
- **Real-time and batch delivery** supporting both push-based real-time delivery via PubSub and pull-based batch retrieval for bulk analysis operations

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination and specialized operational command. The coordinator has authority to manage provider connections, define routing policies, and control intelligence flow across all consuming agents.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [osint-intelligence-operative](/agents/osint-intelligence-operative/) | Provider Interface | Manages OSINT provider connections and data acquisition |
| [cross-domain-intelligence-coordinator](/agents/cross-domain-intelligence-coordinator/) | Cross-Domain | Routes intelligence across domain boundaries for multi-domain analysis |
| [risk-assessment-commander](/agents/risk-assessment-commander/) | Risk Consumer | Primary consumer of entity risk intelligence for scoring |
| [financial-intelligence-commander](/agents/financial-intelligence-commander/) | Financial Consumer | Consumes financial intelligence for due diligence operations |

## Integration

| Component | Relationship |
|---|---|
| [GenStage](/glossary/genstage/) | Backpressure-aware intelligence pipeline |
| [PubSub](/glossary/pubsub/) | Real-time intelligence event distribution |
| [NABLA Infinity](/glossary/nabla-infinity/) | Signal plurality and provenance enforcement |
| Platform [Telemetry](/glossary/telemetry/) | Diffusion metrics, throughput, and latency tracking |

## Enforcement

The Intelligence Diffusion Coordinator operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. All intelligence records must include complete provenance chains (NABLA Provenance Mandatory). Confidence scores must be calculated, never assumed. Duplicate intelligence is detected and merged, never delivered twice to the same consumer. Intelligence without minimum confidence thresholds is quarantined for review rather than delivered to consumers. All routing decisions are logged with full [audit trail](/glossary/audit-trail/) for accountability.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)