+++
title = "Prismatic Storage Meilisearch"
weight = 30
[extra]
icon = "search"
color = "blue"
description = "Full-text search adapter using Meilisearch for fast, typo-tolerant querying across platform data"
category = "Storage"
files = "85"
status = "Production"
port = "7700"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1218
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Meilisearch", "Full-text", "apps", "Prismatic Platform", "PostgreSQL", "PrismaticStorageCore", "Prismatic Storage"]
tags = ["apps", "storage", "prismatic-storage-meilisearch", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage Meilisearch - Prismatic Platform"
+++

## Overview

[Prismatic Storage](@/glossary/prismatic-storage.md) [Meilisearch](@/glossary/meilisearch.md) provides a full-text search adapter for the Prismatic Platform, enabling fast, typo-tolerant querying across all indexed platform data. Built on the PrismaticStorageCore behavior system, it integrates seamlessly with the unified storage layer while exposing Meilisearch-specific capabilities such as faceted search, custom ranking rules, and filterable attributes.

Meilisearch excels at search scenarios where user-facing typo tolerance and sub-50ms response times are critical. Within the platform, it powers the search functionality across [web dashboards](@/apps/prismatic-web.md), the agent and command registries, [OSINT](@/glossary/osint.md) source documentation, and [glossary](@/glossary/_index.md) term discovery. Unlike the relational queries handled by [PostgreSQL](@/apps/prismatic-storage-ecto.md), Meilisearch focuses on relevance-ranked, human-friendly search over document collections.

The adapter handles index management, document synchronization, and query translation, ensuring that indexed data stays consistent with the platform's authoritative storage layers.

## Architecture

```
Search Query
       |
  Meilisearch Adapter
       |
  +----+----+
  |         |
Query     Index
Builder   Manager
  |         |
  +----+----+
       |
  Meilisearch Server (port 7700)
       |
  +----+----+----+
  |         |         |
Agent    OSINT    Platform
Index    Source   Docs
         Index    Index
```

The Index Manager is a [GenServer](@/glossary/genserver.md) that owns the lifecycle of all Meilisearch indexes -- creating them on boot, configuring ranking rules and filterable attributes, and dispatching document synchronization tasks when source data changes. The Query Builder translates platform query structures into Meilisearch API calls with proper filter syntax and pagination.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The Meilisearch adapter implements the [Prismatic Storage Core](@/apps/prismatic-storage-core.md) contract with a trait set tailored for search workloads: Storable, Identifiable, Queryable, Searchable, and Batchable. The Searchable trait is the adapter's defining capability, providing callbacks for full-text search with relevance scoring, faceted aggregation, and configurable ranking rules that no other adapter in the platform supports.

The Storable trait implementation serializes Elixir maps to JSON documents for Meilisearch indexing. Unlike the ETS adapter where terms are stored natively, Meilisearch requires JSON serialization for all indexed documents. The `to_storage/1` callback handles this serialization, including special handling for Elixir-specific types (atoms are converted to strings, DateTime values are formatted as ISO 8601, and nested maps are flattened to Meilisearch's preferred document structure). The `from_storage/2` callback reverses this process, reconstructing Elixir maps from Meilisearch JSON responses.

The Searchable trait exposes Meilisearch's full-text search capabilities through a structured callback interface. The `search/3` callback accepts a query string, index name, and options map, returning relevance-ranked results with optional highlighting and facet distributions. The `index/2` callback handles document insertion and update, automatically triggering re-indexing when document content changes. The `configure_ranking/2` callback manages Meilisearch's ranking rule configuration -- the ordered list of criteria (word proximity, typo tolerance, attribute weight, exact match) that determines result ordering.

The Batchable trait is essential for the synchronization workflow. When the Index Manager detects changes in the authoritative PostgreSQL store, it batches updated documents and submits them to Meilisearch in bulk. Meilisearch processes batch updates asynchronously, and the adapter monitors update status through polling to ensure synchronization completes before reporting success.

Contract testing verifies basic CRUD and query operations through `PrismaticStorageCore.ContractTest`, while Meilisearch-specific tests validate search relevance, typo tolerance accuracy, and faceted aggregation correctness.

## Key Features

### Search Capabilities

| Feature | Description |
|---------|-------------|
| **Full-Text Search** | Sub-50ms search across all indexed documents with relevance ranking |
| **Typo Tolerance** | Automatic handling of misspellings and near-matches up to 2 edit distances |
| **Faceted Search** | Filter and aggregate results by attributes (category, status, source) |
| **Ranking Rules** | Configurable relevance scoring with custom attribute boosting |
| **Highlighting** | Search term highlighting in result snippets for UI display |
| **Synonyms** | Configurable synonym sets for domain-specific term equivalence |

### Index Management
- Automatic index creation and schema configuration on application boot
- Incremental document synchronization from source storage adapters
- Filterable and sortable attribute configuration per index
- Index health monitoring with document count and update status tracking

### Synchronization Strategy

The adapter implements an incremental synchronization strategy that keeps Meilisearch indexes consistent with the authoritative PostgreSQL data store without requiring full re-indexing. The synchronization process runs on a configurable interval (default: 15 minutes) and detects changed documents by comparing timestamps in the PostgreSQL `updated_at` column against the last synchronization checkpoint.

For initial index population, the adapter uses a bulk loading strategy that streams documents from PostgreSQL through the Ecto adapter and batches them into Meilisearch API calls with configurable batch sizes (default: 1,000 documents per batch). This streaming approach avoids loading the entire document corpus into memory, enabling initial indexing of large datasets without memory pressure.

When documents are deleted from PostgreSQL, the synchronization process detects the absence by comparing the set of document IDs in Meilisearch against the current PostgreSQL state. Orphaned documents are removed from the search index in a cleanup pass that runs after the primary synchronization.

## Configuration

```elixir
config :prismatic_storage_meilisearch,
  url: "http://localhost:7700",
  api_key: System.get_env("MEILI_MASTER_KEY"),
  index_prefix: "prismatic_",
  indexes: [
    %{name: "agents", primary_key: "id", filterable: [:category, :status, :domain]},
    %{name: "osint_sources", primary_key: "id", filterable: [:type, :provider]},
    %{name: "documents", primary_key: "id", filterable: [:section, :format]}
  ],
  sync_interval: :timer.minutes(15)
```

## Usage

```elixir
# Full-text search with typo tolerance
{:ok, results} = PrismaticStorageMeilisearch.search("agents", "anomly detecton",
  limit: 20,
  filter: "category = 'intelligence'"
)
# => {:ok, %{hits: [%{title: "Anomaly Detector", ...}], total: 3, processing_time_ms: 12}}

# Faceted search for dashboard filtering
{:ok, results} = PrismaticStorageMeilisearch.search("osint_sources", "social media",
  facets: [:type, :provider],
  limit: 50
)

# Index a new document
PrismaticStorageMeilisearch.index("documents", %{
  id: "doc-42",
  title: "OSINT Collection Guide",
  content: full_text_content,
  section: "guides"
})
```

## Relevance Ranking and Tuning

Meilisearch uses an ordered list of ranking rules to determine result ordering. The default ranking order is: words (number of matching terms), typo (number of typos), proximity (distance between matching terms), attribute (which document field matched), sort (custom sort criteria), and exactness (exact match preference). The adapter allows per-index customization of this ranking order through the configuration.

For the Prismatic Platform's agent registry index, the ranking rules are tuned to prioritize exact name matches over description matches, ensuring that searching for "anomaly detector" returns the agent with that exact name before agents whose descriptions merely mention anomaly detection. For the OSINT source index, the ranking rules boost recently added sources to surface new intelligence capabilities.

Custom ranking rules can reference any filterable attribute as a sort criterion. The security rating index, for instance, uses a custom ranking rule that boosts entities with higher risk scores, ensuring that analysts see the most critical results first when searching across monitored entities.

## Testing

```bash
mix test apps/prismatic_storage_meilisearch/test
mix test apps/prismatic_storage_meilisearch/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | All declared trait compliance |
| Search Relevance | 8 | Ranking accuracy, typo tolerance, highlighting |
| Faceted Search | 6 | Facet distribution, multi-facet filtering |
| Synchronization | 8 | Incremental sync, orphan cleanup, bulk loading |
| Index Management | 4 | Creation, configuration, health monitoring |

## Integration Points

- Implements `PrismaticStorageCore` adapter [behaviour](@/glossary/behaviour.md) for [protocol](@/glossary/protocol.md) compliance
- Indexes agent definitions, OSINT sources, and platform documentation
- Powers search in [Prismatic Web](@/apps/prismatic-web.md) dashboards
- Used by [Prismatic API](@/apps/prismatic-api.md) for endpoint discovery
- Indexes extracted text from [Prismatic Modalities](@/apps/prismatic-modalities.md) OCR and transcription

## NABLA Compliance

Search operations carry provenance metadata linking each search result back to its authoritative source in PostgreSQL, satisfying the Provenance Mandatory axiom. The synchronization architecture maintains Signal Plurality by indexing data from multiple platform sources into unified search indexes while preserving source attribution. Typo tolerance and synonym expansion implement a form of Absence Informative processing -- the search engine infers what the user likely intended even from imprecise queries, acknowledging the informative nature of the gap between what was typed and what was meant.

## Performance

| Metric | Value |
|--------|-------|
| Search latency | Sub-50ms for typical queries |
| Typo tolerance | Up to 2 edit distances |
| Index update | Asynchronous, sub-second for individual documents |
| Batch sync throughput | 1,000+ documents per batch |
| Concurrent search | Limited by Meilisearch server capacity |

## Related Components

- [Prismatic Storage Core](@/apps/prismatic-storage-core.md) -- Adapter protocol definition
- [Prismatic Storage Ecto](@/apps/prismatic-storage-ecto.md) -- Source of truth for indexed data
- [Prismatic Web](@/apps/prismatic-web.md) -- Dashboard search UI consumer
- [Prismatic API](@/apps/prismatic-api.md) -- Endpoint discovery search

## Doctrine Compliance

All storage operations follow [NO MERCY](@/capabilities/no-mercy.md) quality standards with full test coverage and zero-tolerance for data inconsistency.

## Related Agents

- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Ensures Meilisearch adapter conforms to the PrismaticStorageCore protocol contract
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews index configuration, ranking rules, and synchronization strategies
- [Consolidation Architect](@/agents/consolidation-architect.md) -- Data deduplication across search indexes for consistent search results

## Related Capabilities

- [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) -- Meilisearch powers search across agents, OSINT sources, and platform documentation
- [Quality Gates](@/capabilities/quality-gates.md) -- Contract tests verify adapter protocol compliance and search result accuracy
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Search latency and index health metrics emitted for performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)