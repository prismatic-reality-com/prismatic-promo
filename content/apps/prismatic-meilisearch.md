+++
title = "Prismatic Meilisearch"
weight = 13
[extra]
icon = "search"
color = "pink"
description = "Full-text search engine integration with typo-tolerant instant search"
category = "Storage"
files = "210"
status = "Production"
port = "7700"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 994
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Meilisearch", "Full-text", "apps", "Storage", "Prismatic Platform", "PrismaticStorageMeilisearch", "Prismatic Storage", "Search"]
tags = ["apps", "storage", "prismatic-meilisearch", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Meilisearch - Prismatic Platform"
+++

## Overview

Prismatic [Meilisearch](@/glossary/meilisearch.md) integrates the Meilisearch full-text search engine into the Prismatic Platform, providing lightning-fast, typo-tolerant search across all indexed data. Meilisearch delivers sub-50ms search responses with built-in relevancy ranking, faceted search, and filtering -- essential for searching across the platform's vast [OSINT](@/glossary/osint.md) intelligence data, entity records, and agent outputs. The search engine handles over 500,000 documents across six specialized indexes, supporting query patterns that range from simple keyword searches to complex faceted analytics with multi-attribute filtering.

As part of the [Prismatic Storage](@/apps/prismatic-storage.md) adapter ecosystem, Meilisearch is accessed through the `Indexable` and `Queryable` traits, allowing transparent search operations across the platform. The actual application is `prismatic_storage_meilisearch`, implementing the storage adapter [protocol](@/glossary/protocol.md) for consistent access patterns alongside [ETS](@/glossary/ets.md), [Ecto](@/glossary/ecto.md), [KuzuDB](@/glossary/kuzudb.md), and [DuckDB](@/glossary/duckdb.md) adapters. This uniform interface means that application code never interacts with Meilisearch's HTTP API directly -- all queries flow through the trait system, enabling future backend substitution without consumer changes.

The integration goes beyond simple search indexing. Meilisearch serves as the platform's primary discovery layer for human-facing interfaces: when an analyst searches for an entity by name in any [LiveView](@/glossary/liveview.md) dashboard, the query routes through this adapter. Typo tolerance ensures that misspelled company names, transliterated personal names, and approximate domain matches still return relevant results -- a critical capability when dealing with international intelligence data where name spellings vary across sources and languages.

## Architecture

```
PrismaticStorageMeilisearch.Application
+-- PrismaticStorageMeilisearch.Supervisor (:one_for_one)
    +-- PrismaticStorageMeilisearch.Client (GenServer)
    |   +-- HTTP client for Meilisearch API (port 7700)
    +-- PrismaticStorageMeilisearch.IndexManager (GenServer)
    |   +-- Index lifecycle: create, configure, delete
    +-- PrismaticStorageMeilisearch.SearchEngine (GenServer)
    |   +-- Query builder with facets, filters, sorting
    +-- PrismaticStorageMeilisearch.Sync (GenServer)
    |   +-- Data synchronization from other storage adapters
    +-- PrismaticStorageMeilisearch.Adapter
        +-- Indexable + Queryable trait implementation
```

The architecture follows a supervised [GenServer](@/glossary/genserver.md) pattern where each concern -- HTTP communication, index management, query building, and data synchronization -- runs as an independent process under [OTP](@/glossary/otp.md) supervision. This isolation ensures that a failure in synchronization cannot affect search query processing, and that index management operations do not block ongoing searches.

```
Application Code --> PrismaticStorage.search(:meilisearch_adapter, query)
                        |
                   PrismaticStorageMeilisearch.Adapter (Indexable trait)
                        |
                   Meilisearch Engine (port 7700)
                        |
                   Search Results --> Application Code
```

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticStorageMeilisearch` | Public facade: `search/3`, `multi_search/1`, `add_documents/2`, `stats/1` |
| `PrismaticStorageMeilisearch.Application` | OTP application entry point with supervisor initialization |
| `PrismaticStorageMeilisearch.Client` | HTTP client managing Meilisearch API communication with connection pooling |
| `PrismaticStorageMeilisearch.IndexManager` | Index creation, configuration, schema management, and lifecycle operations |
| `PrismaticStorageMeilisearch.SearchEngine` | Query building with facets, filters, sorting, and relevancy tuning |
| `PrismaticStorageMeilisearch.Sync` | Cross-adapter data synchronization pipeline with batch processing |
| `PrismaticStorageMeilisearch.Adapter` | Prismatic Storage trait implementation (Indexable, Queryable) |
| `PrismaticStorageMeilisearch.Config` | Index configuration, ranking rules, and schema management |
| `PrismaticStorageMeilisearch.HealthCheck` | Meilisearch instance health verification and connectivity monitoring |

## Key Features

### Typo-Tolerant Search

Meilisearch's built-in typo tolerance uses a prefix-tree-based algorithm that automatically handles misspellings up to two characters for words of eight or more characters, and one character for words of four or more. This is configurable per index:

```elixir
defmodule PrismaticStorageMeilisearch.SearchEngine do
  @spec search(String.t(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(index, query, opts \\ []) do
    params = %{
      q: query,
      limit: Keyword.get(opts, :limit, 20),
      offset: Keyword.get(opts, :offset, 0),
      filter: Keyword.get(opts, :filter),
      facets: Keyword.get(opts, :facets),
      sort: Keyword.get(opts, :sort),
      matchingStrategy: Keyword.get(opts, :strategy, "last"),
      attributesToHighlight: Keyword.get(opts, :highlight, ["*"])
    }

    case Client.post("/indexes/#{index}/search", params) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, %{
          hits: body["hits"],
          estimated_total: body["estimatedTotalHits"],
          processing_time_ms: body["processingTimeMs"],
          facet_distribution: body["facetDistribution"]
        }}

      {:error, reason} ->
        {:error, {:search_failed, reason}}
    end
  end
end
```

### Multi-Index Search

The multi-search capability enables simultaneous queries across multiple indexes, returning unified results. This is critical for entity searches where a name might match companies, persons, or domains:

```elixir
# Multi-index search implementation
def multi_search(queries) when is_list(queries) do
  payload = %{queries: Enum.map(queries, &build_search_params/1)}

  case Client.post("/multi-search", payload) do
    {:ok, %{status: 200, body: %{"results" => results}}} ->
      {:ok, Enum.zip(queries, results) |> Enum.into(%{}, fn {q, r} ->
        {q.index, %{hits: r["hits"], total: r["estimatedTotalHits"]}}
      end)}

    {:error, reason} ->
      {:error, {:multi_search_failed, reason}}
  end
end
```

### Index Synchronization

The Sync module maintains consistency between the platform's primary storage backends (PostgreSQL, ETS) and Meilisearch indexes through a configurable synchronization pipeline:

| Sync Strategy | Trigger | Latency | Use Case |
|---------------|---------|---------|----------|
| Real-time | PubSub event | < 100ms | Critical entity updates |
| Batch | Timer-based | 1-60s | Bulk data ingestion |
| Full rebuild | Manual/scheduled | Minutes | Schema changes, reindexing |
| Delta sync | Change detection | 5-30s | Incremental updates |

### Faceted Search and Filtering

The platform uses Meilisearch's faceted search extensively for intelligence analysis interfaces, enabling analysts to drill down through large result sets by source, severity, category, and time period without issuing new queries.

## Configuration

```elixir
config :prismatic_storage_meilisearch,
  # Meilisearch connection
  url: System.get_env("MEILISEARCH_URL", "http://localhost:7700"),
  api_key: System.get_env("MEILISEARCH_API_KEY"),

  # Index defaults
  default_ranking_rules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  typo_tolerance: %{enabled: true, min_word_size_for_typos: %{one_typo: 4, two_typos: 8}},

  # Sync settings
  sync_batch_size: 1000,
  sync_interval_ms: 60_000,

  # HTTP client
  http_timeout_ms: 5_000,
  http_pool_size: 10,

  # Health check
  health_check_interval_ms: 30_000,
  health_check_timeout_ms: 2_000
```

## Indexed Data

| Index | Documents | Description | Searchable Attributes |
|-------|-----------|-------------|----------------------|
| **companies** | 45K+ | Czech and international company records | name, address, business_activities, ico |
| **persons** | 120K+ | Statutory bodies, directors, UBOs | name, date_of_birth, role, company |
| **domains** | 80K+ | Discovered domains and subdomains | domain, registrar, nameservers, technologies |
| **osint_reports** | 200K+ | Intelligence reports and findings | title, content, source, category |
| **agents** | 400+ | Agent definitions and capabilities | name, description, capabilities, domain |
| **vulnerabilities** | 50K+ | CVE and vulnerability records | cve_id, description, affected_products, severity |

## Usage

```elixir
# Search across all indexed documents
{:ok, results} = PrismaticMeilisearch.search("companies", "Prismatic s.r.o.",
  limit: 20,
  offset: 0,
  filter: "country = 'CZ' AND status = 'active'",
  sort: ["relevancy:desc", "created_at:desc"]
)
# => %{hits: [...], estimated_total_hits: 3, processing_time_ms: 12}

# Typo-tolerant search (finds "Prismtic" -> "Prismatic")
{:ok, results} = PrismaticMeilisearch.search("companies", "Prismtic")

# Faceted search with filters
{:ok, results} = PrismaticMeilisearch.search("osint_reports",
  "vulnerability assessment",
  facets: ["source", "severity", "category"],
  filter: "severity IN ['critical', 'high']"
)

# Multi-index search
{:ok, results} = PrismaticMeilisearch.multi_search([
  %{index: "companies", query: "Novak"},
  %{index: "persons", query: "Novak"},
  %{index: "domains", query: "novak"}
])

# Create an index with configuration
{:ok, index} = PrismaticMeilisearch.create_index("companies",
  primary_key: "ico",
  searchable_attributes: ["name", "address", "business_activities"],
  filterable_attributes: ["country", "legal_form", "status"],
  sortable_attributes: ["name", "created_at"]
)

# Add documents in bulk
{:ok, task} = PrismaticMeilisearch.add_documents("companies", company_list)

# Get index statistics
{:ok, stats} = PrismaticMeilisearch.stats("companies")
# => %{number_of_documents: 45_230, is_indexing: false, field_distribution: %{...}}
```

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- search results include source index and document ID | Every hit includes provenance metadata tracing to original source |
| Time Decay | HARD -- indexed documents carry timestamps | `created_at` and `updated_at` as sortable/filterable attributes on all indexes |
| Signal Plurality | N/A -- Meilisearch is a storage layer, not a signal source | Search aggregates signals stored by other components; plurality enforced at ingestion |
| Source Independence | SOFT -- indexes maintain source attribution | Each document carries source identifier enabling per-source result filtering |

Meilisearch serves as a retrieval layer rather than a signal source. NABLA compliance is enforced at the indexing stage by upstream components that populate search indices with provenance-tagged documents. The adapter ensures that provenance metadata is preserved through the indexing pipeline and returned with search results.

## Testing

Search accuracy tests verify typo tolerance thresholds, faceted filtering correctness, multi-index query result merging, and relevancy ranking stability across document distributions. Adapter contract tests verify trait compliance against the `PrismaticStorage.AdapterContractTest` suite, ensuring consistent behavior with other storage backends.

Synchronization tests exercise the batch, real-time, and delta sync strategies against a running Meilisearch instance, verifying document consistency after concurrent update operations. Performance tests validate sub-50ms search latency under load with realistic document volumes.

```bash
# Run all Meilisearch adapter tests
cd apps/prismatic_storage_meilisearch && mix test

# Run with coverage
mix test --cover

# Run search engine tests (requires running Meilisearch instance)
mix test test/prismatic_storage_meilisearch/search_engine_test.exs

# Run adapter contract tests
mix test test/prismatic_storage_meilisearch/adapter_test.exs
```

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage Core](@/apps/prismatic-storage-core.md) | Indexable and Queryable trait implementation conforming to adapter protocol |
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | OSINT data indexing for full-text search across intelligence findings |
| [Prismatic Web](@/apps/prismatic-web.md) | Search UI components in LiveView dashboards with instant results |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Asset search and filtering for attack surface management |
| [Prismatic Modalities](@/apps/prismatic-modalities.md) | OCR and transcription text indexing for multi-modal search |
| [Prismatic DD](@/apps/prismatic-dd.md) | Due diligence case search across entity and evidence records |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Search latency | < 50ms | Average across all indexes at P95 |
| Typo-tolerant search | < 50ms | 2-character typo threshold |
| Multi-index search | < 100ms | 3 indexes queried in parallel |
| Bulk indexing | 10K+ docs/s | Batch mode with 1,000 document batches |
| Total documents | 500K+ | Across 6 indexes |
| Index size | ~2GB | All indexes combined |
| Health check | < 5ms | Connectivity and status verification |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :meilisearch, :search]`, `[:prismatic, :meilisearch, :index]`, `[:prismatic, :meilisearch, :sync]`.

## Related Resources

- [Prismatic Storage Core](@/apps/prismatic-storage-core.md) -- Storage adapter trait system defining Indexable and Queryable contracts
- [Prismatic Storage ETS](@/apps/prismatic-storage-ets.md) -- In-memory storage complement for sub-millisecond lookups
- [Prismatic Storage KuzuDB](@/apps/prismatic-storage-kuzudb.md) -- Graph storage for relationship queries complementing text search
- [Consolidation Architect](@/agents/consolidation-architect.md) -- Data deduplication across indexes preventing duplicate search results
- [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) -- Search spanning all data domains through multi-index queries
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Search latency and index health monitoring through telemetry
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source data fusion populating search indexes

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)