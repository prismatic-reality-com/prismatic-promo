+++
title = "Meilisearch"
weight = 47
[extra]
description = "Open-source, Rust-built full-text search engine providing instant, typo-tolerant search with sub-50ms response times, integrated into the Prismatic Platform through a dedicated storage adapter."
category = "storage"
related_terms = ["adapter-pattern", "ets", "kuzudb", "osint", "elixir", "postgresql", "knowledge-graph", "telemetry"]
use_cases = ["Agent documentation search", "OSINT entity matching", "Asset inventory search", "Platform-wide content discovery", "Glossary term lookup"]
key_benefit = "Sub-50ms typo-tolerant search across diverse content types and languages"
platforms = ["Prismatic Platform"]
programming_languages = ["Rust", "Elixir"]
difficulty = "Intermediate"
prerequisites = ["REST API", "JSON", "Elixir HTTP clients"]
response_time = "< 50ms"
typo_tolerance = "Built-in, automatic via FST"
data_structure = "Finite-state transducer (FST) inverted index"
scalability = "Single node, millions of documents"
api_style = "RESTful HTTP"
deployment = "Single binary, zero configuration"
license = "MIT"
adapter_module = "PrismaticStorage.Meilisearch.Adapter"
indexed_content = ["Documentation", "Agents", "OSINT entities", "Assets", "Glossary"]
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1717
date_modified = "2026-02-23"
keywords = ["Meilisearch", "Open-source", "Rust-built", "Prismatic", "Platform", "glossary", "storage", "Prismatic Platform", "String", "Client"]
tags = ["glossary", "storage", "meilisearch", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Meilisearch - Prismatic Platform"
+++

## Definition

Meilisearch is an open-source, full-text search engine designed to provide instant, typo-tolerant search experiences with sub-50 millisecond response times. Built in Rust for performance and safety, Meilisearch indexes documents as schemaless JSON objects and returns relevance-ranked results using a configurable ranking pipeline that considers word proximity, typo distance, attribute weight, and exact match status. The engine automatically detects document languages, handles synonym expansion, supports faceted filtering, and provides prefix search -- enabling "search-as-you-type" interfaces where results appear before the user finishes typing.

Unlike Elasticsearch, which targets log analytics, distributed search at scale, and complex query DSLs, Meilisearch is optimized for a specific use case: instant, user-facing search across document collections of moderate size (millions of documents). This focus enables a dramatically simpler API (RESTful HTTP, no query DSL), zero-configuration deployment (single binary, no cluster management), and built-in features that Elasticsearch requires plugins for (typo tolerance, language detection, faceted search). The tradeoff is that Meilisearch does not support the complex aggregation pipelines, distributed sharding, or real-time log ingestion workflows that Elasticsearch handles.

Meilisearch's architecture uses a custom inverted index implementation optimized for prefix matching and typo tolerance. Documents are tokenized, and each token's prefixes are stored in a finite-state transducer (FST) that enables constant-time lookup of all tokens within a configurable edit distance. This data structure is what makes sub-50ms typo-tolerant search possible -- even when a user misspells a query term, the FST efficiently identifies all matching terms within the allowed edit distance without scanning the entire vocabulary.

## Historical Context and Motivation

Full-text search is a fundamental capability for any platform that manages textual content at scale. The Prismatic Platform, with its documentation files, 530+ agent definitions, OSINT intelligence products, asset inventories, and glossary entries, requires search infrastructure that can handle diverse content types, multiple languages, and approximate matching for entity names that frequently appear in variant spellings, transliterations, and abbreviations.

Meilisearch was created in 2018 by Quentin de Quelen and Clementine Urquizar as a response to the complexity of Elasticsearch for user-facing search use cases. The project drew inspiration from Algolia's search-as-you-type experience but with an open-source, self-hosted model. Written entirely in Rust, Meilisearch leverages Rust's memory safety guarantees and zero-cost abstractions to deliver predictable, low-latency search performance without garbage collection pauses.

The choice of Meilisearch over alternatives like Elasticsearch or Typesense for the Prismatic Platform was driven by several factors: the zero-configuration deployment model aligns with the platform's preference for operational simplicity, the built-in typo tolerance is critical for OSINT entity matching where names appear in variant spellings, and the Rust-based implementation provides predictable latency without JVM overhead. The [adapter pattern](/glossary/adapter-pattern/) used in the storage layer allows Meilisearch to be swapped for alternatives without affecting application code.

## Search Pipeline Architecture

The search pipeline processes queries through multiple stages before returning results:

```
User Query: "prsmatic permeter"
         |
         v
    Query Analysis
    - Tokenization: ["prsmatic", "permeter"]
    - Language detection: English
         |
         v
    Typo Tolerance (FST lookup)
    - "prsmatic" -> "prismatic" (edit distance 1)
    - "permeter" -> "perimeter" (edit distance 1)
         |
         v
    Index Lookup (inverted index)
    - Documents containing "prismatic" AND "perimeter"
         |
         v
    Ranking Pipeline
    1. Words: both terms present
    2. Typo: penalty for 2 corrections
    3. Proximity: terms adjacent score higher
    4. Attribute: title matches rank above body
    5. Sort: relevance score descending
         |
         v
    Results (< 50ms)
```

## Ranking Rules

Meilisearch applies ranking rules in configurable priority order:

| Rule | Description | Default Priority |
|------|-------------|-----------------|
| **Words** | Documents containing more query terms rank higher | 1 (highest) |
| **Typo** | Documents matched with fewer typo corrections rank higher | 2 |
| **Proximity** | Documents where query terms appear closer together rank higher | 3 |
| **Attribute** | Matches in higher-priority attributes (title > body) rank higher | 4 |
| **Sort** | Custom sort criteria (date, relevance score) | 5 |
| **Exactness** | Documents with exact (non-typo-corrected) matches rank higher | 6 |

The ranking pipeline is composable -- rules can be reordered, removed, or extended with custom sort attributes. For the Prismatic Platform, the default ordering is optimal because it prioritizes term completeness (all query terms present), then accuracy (fewer typo corrections), then relevance signals (proximity and attribute weight).

## Document Indexing and Configuration

Meilisearch indexes schemaless JSON documents into typed indexes with configurable search, filter, and sort attributes:

```json
{
  "uid": "agents",
  "primaryKey": "id",
  "searchableAttributes": ["name", "description", "specialization", "domain"],
  "filterableAttributes": ["tier", "domain", "status", "classification"],
  "sortableAttributes": ["name", "tier", "updated_at"],
  "displayedAttributes": ["*"],
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 4,
      "twoTypos": 8
    }
  }
}
```

| Setting | Purpose | Example Value |
|---------|---------|---------------|
| **searchableAttributes** | Fields included in search, ordered by priority | `["name", "description", "tags"]` |
| **filterableAttributes** | Fields available for faceted filtering | `["category", "status", "tier"]` |
| **sortableAttributes** | Fields available for custom sorting | `["name", "updated_at", "score"]` |
| **synonyms** | Term equivalences for search expansion | `{"EASM": ["attack surface"], "NM/ND": ["no mercy"]}` |
| **stopWords** | Common words excluded from search | `["the", "a", "an", "is", "at"]` |
| **distinctAttribute** | Deduplicate results by field | `"entity_id"` |

## API Interface

Meilisearch exposes all operations through a RESTful HTTP API:

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Search** | POST | `/indexes/{uid}/search` | Full-text search with filters |
| **Add documents** | POST | `/indexes/{uid}/documents` | Index new documents |
| **Update documents** | PUT | `/indexes/{uid}/documents` | Update existing documents |
| **Delete documents** | DELETE | `/indexes/{uid}/documents/{id}` | Remove documents |
| **Get settings** | GET | `/indexes/{uid}/settings` | Retrieve index configuration |
| **Update settings** | PATCH | `/indexes/{uid}/settings` | Modify index configuration |
| **Get task** | GET | `/tasks/{uid}` | Check async operation status |

## Implementation in Prismatic Platform

Meilisearch is integrated through the `prismatic_storage_meilisearch` adapter, implementing the platform's storage behaviour for full-text search capabilities:

```elixir
defmodule PrismaticStorage.Meilisearch.Adapter do
  @moduledoc """
  Meilisearch storage adapter implementing the PrismaticStorage behaviour
  for full-text search with typo tolerance and faceted filtering.

  ## Architecture

  The adapter wraps Meilisearch's REST API behind the platform's unified
  storage interface, enabling transparent search across all content domains.
  Telemetry events are emitted for every search operation, enabling
  comprehensive monitoring and performance analysis.

  The adapter maintains connection pooling through Finch, handles API
  rate limiting with exponential backoff, and provides automatic
  failover to read-only mode during index updates.
  """

  alias PrismaticStorage.Meilisearch.{Index, Search, Document}
  alias PrismaticTelemetry.Meilisearch

  @behaviour PrismaticStorage.Behaviour

  @impl true
  def search(query, opts \\ []) do
    start_time = System.monotonic_time(:microsecond)

    with {:ok, index} <- resolve_index(opts[:index]),
         {:ok, search_params} <- build_search_params(query, opts),
         {:ok, response} <- execute_search(index, search_params) do

      duration = System.monotonic_time(:microsecond) - start_time

      Meilisearch.emit_search_telemetry(%{
        query: query,
        index: index,
        hits: length(response["hits"]),
        processing_time_ms: response["processingTimeMs"],
        duration_microseconds: duration
      })

      {:ok, format_search_results(response)}
    else
      {:error, reason} ->
        Meilisearch.emit_error_telemetry(%{
          operation: :search,
          query: query,
          error: reason
        })
        {:error, reason}
    end
  end

  @impl true
  def insert(documents, opts \\ []) when is_list(documents) do
    with {:ok, index} <- resolve_index(opts[:index]),
         {:ok, formatted_docs} <- format_documents(documents),
         {:ok, task} <- Document.add(index, formatted_docs) do

      # Monitor async indexing task
      spawn(fn -> monitor_indexing_task(task["taskUid"], length(documents)) end)

      {:ok, %{task_id: task["taskUid"], documents_count: length(documents)}}
    end
  end

  @impl true
  def update(documents, opts \\ []) when is_list(documents) do
    with {:ok, index} <- resolve_index(opts[:index]),
         {:ok, formatted_docs} <- format_documents(documents),
         {:ok, task} <- Document.update(index, formatted_docs) do

      spawn(fn -> monitor_indexing_task(task["taskUid"], length(documents)) end)

      {:ok, %{task_id: task["taskUid"], documents_count: length(documents)}}
    end
  end

  @impl true
  def delete(document_ids, opts \\ []) when is_list(document_ids) do
    with {:ok, index} <- resolve_index(opts[:index]),
         {:ok, task} <- Document.delete(index, document_ids) do

      spawn(fn -> monitor_indexing_task(task["taskUid"], length(document_ids)) end)

      {:ok, %{task_id: task["taskUid"], deleted_count: length(document_ids)}}
    end
  end

  # Advanced search capabilities
  @spec faceted_search(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def faceted_search(query, facet_filters) do
    search_params = %{
      "q" => query,
      "facets" => Map.keys(facet_filters),
      "filter" => build_facet_filter_expression(facet_filters),
      "limit" => 100,
      "offset" => 0
    }

    execute_search("agents", search_params)
  end

  @spec geosearch(String.t(), map()) :: {:ok, [map()]} | {:error, term()}
  def geosearch(query, geo_params) do
    # Geographic search for location-based entities
    search_params = %{
      "q" => query,
      "filter" => build_geo_filter(geo_params),
      "sort" => ["_geoDistance(#{geo_params.lat}, #{geo_params.lng}):asc"]
    }

    execute_search("locations", search_params)
  end

  defp build_facet_filter_expression(facet_filters) do
    Enum.map(facet_filters, fn {field, values} ->
      value_list = Enum.map(values, &"'#{&1}'") |> Enum.join(", ")
      "#{field} IN [#{value_list}]"
    end)
    |> Enum.join(" AND ")
  end

  defp build_geo_filter(%{lat: lat, lng: lng, radius_km: radius}) do
    "_geoRadius(#{lat}, #{lng}, #{radius * 1000})"
  end

  defp monitor_indexing_task(task_id, document_count) do
    # Poll task status until completion
    case poll_task_completion(task_id, 0) do
      {:ok, :completed} ->
        Meilisearch.emit_indexing_telemetry(%{
          task_id: task_id,
          status: :completed,
          documents_indexed: document_count
        })

      {:error, reason} ->
        Meilisearch.emit_error_telemetry(%{
          operation: :indexing,
          task_id: task_id,
          error: reason
        })
    end
  end
end
```

## Advanced Search Features

### Typo Tolerance and Fuzzy Matching

Meilisearch's typo tolerance makes search resilient to user input errors. The platform configures different tolerance levels based on search context:

```elixir
defmodule PrismaticSearch.TypoTolerance do
  @moduledoc """
  Configure typo tolerance based on search domain and user context.
  """

  @spec configure_typo_tolerance(atom(), map()) :: map()
  def configure_typo_tolerance(:agents, _opts) do
    # Strict tolerance for agent names (technical precision required)
    %{
      "enabled" => true,
      "minWordSizeForTypos" => %{
        "oneTypo" => 6,
        "twoTypos" => 10
      },
      "disableOnWords" => ["EASM", "OSINT", "API", "SDK", "CLI"]
    }
  end

  def configure_typo_tolerance(:glossary, _opts) do
    # Moderate tolerance for glossary search (user-friendly)
    %{
      "enabled" => true,
      "minWordSizeForTypos" => %{
        "oneTypo" => 4,
        "twoTypos" => 8
      },
      "disableOnAttributes" => ["exact_match_terms"]
    }
  end

  def configure_typo_tolerance(:osint, _opts) do
    # Minimal tolerance for OSINT data (precision critical)
    %{
      "enabled" => true,
      "minWordSizeForTypos" => %{
        "oneTypo" => 8,
        "twoTypos" => 12
      },
      "disableOnWords" => domain_specific_terms()
    }
  end

  defp domain_specific_terms do
    ["IP", "DNS", "SSL", "TLS", "CVE", "CPE", "WHOIS", "ASN", "BGP"]
  end
end
```

### Performance Optimization Strategies

Meilisearch performance optimization requires careful attention to index design, search patterns, and resource allocation:

```elixir
defmodule PrismaticStorage.Meilisearch.Performance do
  @moduledoc """
  Performance optimization utilities for Meilisearch operations.
  """

  @spec optimize_index_settings(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def optimize_index_settings(index_name, usage_patterns) do
    base_settings = %{
      "pagination" => %{"maxTotalHits" => 10_000},
      "distinctAttribute" => determine_distinct_attribute(usage_patterns),
      "rankingRules" => optimize_ranking_rules(usage_patterns)
    }

    # Adjust settings based on query patterns
    optimized_settings = case usage_patterns.primary_use_case do
      :faceted_search ->
        Map.put(base_settings, "maxValuesPerFacet", 1000)

      :autocomplete ->
        Map.merge(base_settings, %{
          "searchableAttributes" => ["name", "title", "description"],
          "cropLength" => 50,
          "highlightPreTag" => "<mark>",
          "highlightPostTag" => "</mark>"
        })

      :full_text_search ->
        Map.merge(base_settings, %{
          "cropLength" => 200,
          "searchableAttributes" => ["*"],
          "attributesToCrop" => ["description", "content"]
        })
    end

    update_index_settings(index_name, optimized_settings)
  end

  @spec batch_document_operations(String.t(), [map()]) :: {:ok, [String.t()]} | {:error, term()}
  def batch_document_operations(index_name, operations) do
    # Process large document sets in optimized batches
    batch_size = determine_optimal_batch_size(operations)

    operations
    |> Enum.chunk_every(batch_size)
    |> Enum.with_index()
    |> Enum.map(fn {batch, index} ->
      Task.async(fn ->
        process_batch(index_name, batch, index)
      end)
    end)
    |> Task.await_many(30_000)
    |> collect_task_ids()
  end

  defp determine_optimal_batch_size(operations) do
    avg_doc_size = calculate_average_document_size(operations)

    cond do
      avg_doc_size < 1_024 -> 1000  # Small documents
      avg_doc_size < 10_240 -> 500  # Medium documents
      avg_doc_size < 102_400 -> 100  # Large documents
      true -> 50                     # Very large documents
    end
  end

  defp calculate_average_document_size(operations) do
    total_size = operations
                 |> Enum.take(100)  # Sample first 100 operations
                 |> Enum.map(&(byte_size(Jason.encode!(&1))))
                 |> Enum.sum()

    div(total_size, min(100, length(operations)))
  end
end
```
  performance monitoring and query analytics.

  ## Examples

      iex> PrismaticStorage.Meilisearch.Adapter.search("agents", "archer supreme")
      {:ok, %{"hits" => [%{"name" => "archer-supreme", ...}], "processingTimeMs" => 3}}
  """

  @behaviour PrismaticStorage.Behaviour

  alias PrismaticStorage.Meilisearch.Client
  alias PrismaticStorage.Meilisearch.IndexManager

  @default_limit 20
  @search_timeout_ms 5_000

  @type search_opts :: %{
    filter: String.t() | nil,
    sort: list(String.t()) | nil,
    limit: pos_integer(),
    offset: non_neg_integer(),
    facets: list(String.t()) | nil
  }

  @spec search(String.t(), String.t(), search_opts()) :: {:ok, map()} | {:error, term()}
  def search(index, query, opts \\ %{}) do
    start_time = System.monotonic_time()

    params = %{
      q: query,
      limit: Map.get(opts, :limit, @default_limit),
      offset: Map.get(opts, :offset, 0),
      filter: Map.get(opts, :filter),
      sort: Map.get(opts, :sort),
      facets: Map.get(opts, :facets),
      attributesToHighlight: ["*"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>"
    }

    result = Client.post("/indexes/#{index}/search", params)

    :telemetry.execute(
      [:prismatic, :storage, :meilisearch, :search],
      %{duration: System.monotonic_time() - start_time},
      %{index: index, query_length: String.length(query)}
    )

    result
  end

  @spec index_documents(String.t(), list(map())) :: {:ok, map()} | {:error, term()}
  def index_documents(index, documents) do
    Client.post("/indexes/#{index}/documents", documents)
  end

  @spec configure_index(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def configure_index(index, settings) do
    Client.patch("/indexes/#{index}/settings", settings)
  end

  @spec delete_documents(String.t(), list(String.t())) :: {:ok, map()} | {:error, term()}
  def delete_documents(index, document_ids) do
    Client.post("/indexes/#{index}/documents/delete-batch", document_ids)
  end

  @spec index_stats(String.t()) :: {:ok, map()} | {:error, term()}
  def index_stats(index) do
    Client.get("/indexes/#{index}/stats")
  end
end
```

## OSINT Entity Search

OSINT entity matching is one of the most valuable applications of Meilisearch in the Prismatic Platform. Entity names from sanctions lists, business registries, and intelligence reports frequently appear in variant spellings, transliterations (Cyrillic to Latin), and abbreviations. Meilisearch's typo tolerance handles these variations automatically:

```elixir
defmodule PrismaticStorage.Meilisearch.OSINTSearch do
  @moduledoc """
  OSINT-specific search operations leveraging Meilisearch's typo
  tolerance for entity matching across name variations and transliterations.

  ## Entity Matching Strategy

  Entity names in OSINT data present unique challenges:
  - Multiple transliteration standards (Cyrillic, Arabic, Chinese)
  - Common abbreviations and acronyms
  - Legal entity suffixes (GmbH, s.r.o., LLC)
  - Historical name changes

  Meilisearch's FST-based typo tolerance handles edit distances
  automatically, while synonym configuration handles known equivalences.
  """

  alias PrismaticStorage.Meilisearch.Adapter

  @spec search_entities(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def search_entities(query, opts \\ []) do
    entity_type = Keyword.get(opts, :type)
    filter = if entity_type, do: "entity_type = #{entity_type}", else: nil

    Adapter.search("osint_entities", query, %{
      filter: filter,
      limit: Keyword.get(opts, :limit, 20),
      facets: ["entity_type", "source", "risk_level"]
    })
  end

  @spec fuzzy_entity_match(String.t(), float()) :: {:ok, list(map())} | {:error, term()}
  def fuzzy_entity_match(entity_name, min_score \\ 0.7) do
    case search_entities(entity_name, limit: 50) do
      {:ok, %{"hits" => hits}} ->
        matches =
          hits
          |> Enum.filter(&(&1["_rankingScore"] >= min_score))
          |> Enum.map(&normalize_match/1)

        {:ok, matches}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec batch_entity_search([String.t()], keyword()) :: {:ok, map()} | {:error, term()}
  def batch_entity_search(entity_names, opts \\ []) do
    results =
      entity_names
      |> Task.async_stream(fn name -> {name, search_entities(name, opts)} end,
        max_concurrency: 4,
        timeout: 10_000
      )
      |> Enum.into(%{}, fn {:ok, {name, result}} -> {name, result} end)

    {:ok, results}
  end

  defp normalize_match(hit) do
    %{
      id: hit["id"],
      name: hit["name"],
      score: hit["_rankingScore"],
      entity_type: hit["entity_type"],
      source: hit["source"],
      highlighted: get_in(hit, ["_formatted", "name"])
    }
  end
end
```

## Index Management and Monitoring

Proper index management ensures search performance remains within the sub-50ms target:

```elixir
defmodule PrismaticStorage.Meilisearch.IndexManager do
  @moduledoc """
  Manages Meilisearch index lifecycle including creation, configuration,
  health monitoring, and reindexing operations.
  """

  alias PrismaticStorage.Meilisearch.Client

  @spec create_index(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def create_index(uid, primary_key) do
    Client.post("/indexes", %{uid: uid, primaryKey: primary_key})
  end

  @spec health_check() :: {:ok, :healthy} | {:error, term()}
  def health_check do
    case Client.get("/health") do
      {:ok, %{"status" => "available"}} -> {:ok, :healthy}
      {:ok, other} -> {:error, {:unhealthy, other}}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec reindex(String.t(), list(map())) :: {:ok, map()} | {:error, term()}
  def reindex(index, documents) do
    with {:ok, _} <- Client.delete("/indexes/#{index}/documents"),
         {:ok, task} <- Client.post("/indexes/#{index}/documents", documents) do
      {:ok, task}
    end
  end

  @spec all_stats() :: {:ok, map()} | {:error, term()}
  def all_stats do
    Client.get("/stats")
  end
end
```

## Comparison with Alternatives

| Feature | Meilisearch | Elasticsearch | Algolia | Typesense | PostgreSQL FTS |
|---------|-------------|---------------|---------|-----------|----------------|
| **Typo tolerance** | Built-in, automatic | Plugin-dependent | Built-in | Built-in | None (manual) |
| **Response time** | < 50ms | 50-200ms | < 50ms | < 50ms | 100-500ms |
| **Setup complexity** | Single binary | JVM cluster, configuration | Cloud SaaS | Single binary | Existing DB |
| **Query language** | Simple REST API | Complex Query DSL | REST API | REST API | SQL |
| **Scalability** | Single node (millions) | Distributed (billions) | Cloud-managed | Single + replica | Table-limited |
| **Cost** | Free (self-hosted) | Free (self-hosted) + ops | Per-search pricing | Free (self-hosted) | Free (existing) |
| **Language** | Rust | Java | Proprietary | C++ | C |
| **Best for** | User-facing instant search | Log analytics, complex queries | SaaS search | User-facing search | Simple search needs |

## Telemetry and Observability

Search operations emit [telemetry](/glossary/telemetry/) events for monitoring and alerting:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :storage, :meilisearch, :search]` | `duration` | `index`, `query_length` |
| `[:prismatic, :storage, :meilisearch, :index]` | `duration`, `document_count` | `index` |
| `[:prismatic, :storage, :meilisearch, :error]` | `count` | `index`, `error_type` |

Alerts are configured for search latency exceeding 50ms, indicating that index optimization or infrastructure scaling is needed.

## Best Practices

**Prioritize Searchable Attributes**: Order searchable attributes by importance (title first, description second, tags third). Meilisearch uses attribute position as a ranking signal, so matches in higher-priority attributes score higher.

**Configure Synonyms for Domain Terms**: Define synonyms for domain-specific abbreviations and alternate terms. Map "EASM" to "external attack surface management", "NM/ND" to "no mercy no doubts", and "OSINT" to "open source intelligence" to ensure users find content regardless of terminology preference.

**Use Filterable Attributes Sparingly**: Only mark attributes as filterable when faceted search is needed. Each filterable attribute increases index size and indexing time. For the platform, category, status, tier, and domain are essential filters.

**Batch Document Updates**: Index documents in batches rather than individually. Meilisearch processes document additions asynchronously, and batch operations reduce API call overhead and improve indexing throughput.

**Monitor Index Health**: Track index size, document count, and search latency as telemetry metrics. Set alerts for search latency exceeding 50ms, which indicates index optimization is needed.

**Implement Search Analytics**: Log search queries and click-through patterns to identify missing content, poorly ranking documents, and common misspellings that should be added as synonyms.

## Use Cases in Prismatic Platform

- **Agent Documentation Search**: Platform documentation files are indexed in Meilisearch, providing instant search across agent definitions, command references, architecture documents, and glossary entries with typo tolerance for technical terms.

- **[OSINT](/glossary/osint/) Entity Matching**: Entity names from sanctions lists, business registries, and intelligence reports are matched using Meilisearch's typo tolerance to handle name variations, transliterations (Cyrillic to Latin), and abbreviations common in multi-language OSINT data.

- **Asset Inventory Search**: Prismatic Perimeter's asset inventory (domains, IP addresses, certificates, services) is searchable through Meilisearch, enabling rapid asset lookup during investigation workflows.

- **Platform-Wide Content Discovery**: A unified search interface indexes content across all platform sections -- agents, commands, applications, capabilities, teams -- providing a single entry point for finding any platform resource.

- **Glossary Term Lookup**: The glossary (127+ terms) is indexed with synonyms and related term expansion, ensuring that searching for "OTP" also surfaces "Open Telecom Platform" and "supervision tree" entries.

## Related Concepts

- [Adapter Pattern](/glossary/adapter-pattern/) - Unified storage interface including Meilisearch adapter
- [ETS](/glossary/ets/) - Complementary in-memory caching layer for hot data
- [KuzuDB](/glossary/kuzudb/) - Complementary graph database for relationship queries
- [OSINT](/glossary/osint/) - Domain benefiting from typo-tolerant entity search
- [Elixir](/glossary/elixir/) - Platform language with native Meilisearch client integration
- [PostgreSQL](/glossary/postgresql/) - Relational database with basic full-text search capabilities
- [Knowledge Graph](/glossary/knowledge-graph/) - Graph representation complemented by full-text search
- [Telemetry](/glossary/telemetry/) - Observability framework tracking search performance
- [GenServer](/glossary/genserver/) - Process managing search client connections and index lifecycle

## See Also

- [Architecture](/architecture/) -- Search architecture and storage layer integration
- [Capabilities](/capabilities/) -- Search and content discovery capabilities
- [Apps](/apps/) -- Umbrella applications with search integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
