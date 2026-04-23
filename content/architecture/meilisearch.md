+++
title = "Meilisearch"
weight = 8
date = 2026-01-12
[extra]
icon = "lightning"
color = "orange"
description = "Full-text search engine with sub-50ms response times, typo tolerance, faceted filtering, and real-time index synchronization for the intelligence platform"
date_created = "2025-09-20"
reading_time = "11 min"
difficulty = "intermediate"
tags = ["meilisearch", "full-text-search", "typo-tolerance", "faceted-search", "real-time-indexing", "search-relevance"]
related_articles = ["postgresql-kuzudb", "storage-adapters", "telemetry", "phoenix-liveview"]
maturity = "production"
author = "Tomas Korcak (korczis)"
word_count = 1388
date_modified = "2026-02-23"
keywords = ["Meilisearch", "Full-text", "architecture", "Prismatic Platform", "PostgreSQL", "Elasticsearch", "Search"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Meilisearch - Prismatic Platform"
+++

## Overview

Meilisearch powers Prismatic Platform's search infrastructure, providing sub-50ms full-text search with typo tolerance, faceted filtering, and real-time index synchronization across the platform's data domains. In an intelligence platform managing hundreds of thousands of assets, agents, documents, and corporate entities, the ability to find the right information instantly is not a convenience feature -- it is an operational necessity.

The decision to use a dedicated search engine rather than relying solely on [PostgreSQL's](/glossary/postgresql/) built-in full-text search capabilities was driven by three requirements: sub-50ms response times at scale (PostgreSQL's `tsvector` approach degrades above 100K documents without careful tuning), typo tolerance (critical for names transliterated between Czech and English alphabets), and faceted filtering (enabling drill-down navigation in the [LiveView](/architecture/phoenix-liveview/) dashboards). Meilisearch meets all three requirements out of the box, with minimal operational overhead.

The search subsystem integrates with the platform's [storage adapter layer](/architecture/storage-adapters/) through a dedicated [Meilisearch adapter](/apps/prismatic-storage-meilisearch/) and synchronizes with the primary [PostgreSQL database](/architecture/postgresql-kuzudb/) through an event-driven pipeline that keeps search indexes current within seconds of data changes.

## Why Meilisearch Over Alternatives

The search engine landscape is dominated by Elasticsearch, which is the industry default for full-text search. Selecting Meilisearch over Elasticsearch was a deliberate architectural decision based on operational fit.

| Criterion | Meilisearch | Elasticsearch | Typesense | PostgreSQL FTS |
|-----------|------------|---------------|-----------|----------------|
| **Deployment complexity** | Single binary | JVM cluster, Kibana, Logstash | Single binary | Built-in |
| **Memory footprint** | 200-500MB | 2-8GB (JVM heap) | 200-500MB | N/A |
| **Search latency (10K docs)** | <10ms | 10-50ms | <10ms | 20-100ms |
| **Search latency (1M docs)** | <50ms | 50-200ms | <50ms | 200-2000ms |
| **Typo tolerance** | Built-in, configurable | Plugin (phonetic, fuzzy) | Built-in | Manual (pg_trgm) |
| **Faceted filtering** | Native | Native | Native | Manual aggregation |
| **Real-time indexing** | Yes (sub-second) | Near-real-time (1s refresh) | Yes | Immediate (triggers) |
| **Operational overhead** | Minimal | High (cluster management) | Minimal | None |
| **[Elixir](/glossary/elixir/) ecosystem** | HTTP API (any client) | elasticsearch-elixir | HTTP API | [Ecto](/glossary/ecto/) native |
| **License** | MIT | SSPL/Elastic License | GPL v3 | PostgreSQL License |

Meilisearch was selected because it provides Elasticsearch-class search quality with Typesense-class operational simplicity. For an intelligence platform that already manages [PostgreSQL](/glossary/postgresql/), [KuzuDB](/glossary/kuzudb/), [Redis](/apps/prismatic-storage-redis/), and [ETS](/glossary/ets/), adding a JVM-based cluster (Elasticsearch) would create disproportionate operational burden. Meilisearch's single-binary deployment and sub-500MB memory footprint fit the platform's "minimal viable infrastructure" philosophy.

PostgreSQL's built-in full-text search was rejected not because it is inadequate for simple use cases, but because the platform's search requirements exceed its sweet spot: typo tolerance requires `pg_trgm` with GIN indexes plus similarity thresholds, which is fragile to configure and slow at scale. Meilisearch handles this natively.

## Index Architecture

The platform maintains multiple search indexes, each optimized for its specific data domain. Index configuration includes searchable attributes (which fields to index), filterable attributes (which fields support exact-match filtering), sortable attributes, and custom ranking rules.

### Index Configuration

```elixir
defmodule PrismaticSearch.IndexConfig do
  @moduledoc """
  Centralized search index configuration.

  Defines searchable, filterable, and sortable attributes
  for each domain index. These settings are applied on
  index creation and can be updated at runtime.
  """

  @type index_settings :: %{
    searchableAttributes: [String.t()],
    filterableAttributes: [String.t()],
    sortableAttributes: [String.t()],
    rankingRules: [String.t()],
    distinctAttribute: String.t() | nil,
    typoTolerance: map()
  }

  @spec settings(atom()) :: index_settings()
  def settings(:agents) do
    %{
      searchableAttributes: [
        "name",
        "description",
        "commands",
        "capabilities",
        "domain"
      ],
      filterableAttributes: [
        "type",
        "tier",
        "status",
        "color_team",
        "domain"
      ],
      sortableAttributes: [
        "name",
        "created_at",
        "usage_count"
      ],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness"
      ],
      typoTolerance: %{
        minWordSizeForTypos: %{oneTypo: 4, twoTypos: 8}
      }
    }
  end

  def settings(:assets) do
    %{
      searchableAttributes: [
        "domain",
        "ip_addresses",
        "technologies",
        "services",
        "organization_name"
      ],
      filterableAttributes: [
        "security_rating",
        "compliance_status",
        "asset_type",
        "discovered_at",
        "organization_id"
      ],
      sortableAttributes: [
        "domain",
        "security_score",
        "last_scanned",
        "risk_score"
      ],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "security_score:desc"
      ],
      distinctAttribute: "domain"
    }
  end

  def settings(:companies) do
    %{
      searchableAttributes: [
        "name",
        "ico",
        "registered_address",
        "directors",
        "legal_form"
      ],
      filterableAttributes: [
        "status",
        "legal_form",
        "founded_year",
        "risk_score",
        "region"
      ],
      sortableAttributes: [
        "name",
        "founded_date",
        "risk_score"
      ],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness"
      ],
      typoTolerance: %{
        # Czech company names need higher typo tolerance
        minWordSizeForTypos: %{oneTypo: 3, twoTypos: 6}
      }
    }
  end
end
```

### Ranking Rules and Relevance Tuning

Meilisearch applies ranking rules in order, using each subsequent rule as a tiebreaker. The default order (`words > typo > proximity > attribute > sort > exactness`) works well for most queries, but the platform customizes this for specific domains.

The ranking pipeline operates as follows:

1. **words**: Documents containing more query words rank higher. A query for "security certificate expired" ranks a document containing all three words above one containing only two.
2. **typo**: Among documents matching the same number of words, those with fewer typos rank higher. This is critical for Czech name searches where diacritics may be omitted.
3. **proximity**: Words appearing closer together in the document rank higher. "security certificate" as adjacent words ranks above a document where "security" appears in the title and "certificate" in the footer.
4. **attribute**: Matches in earlier searchable attributes rank higher. For agents, a match in "name" outranks a match in "capabilities."
5. **sort**: When an explicit sort is requested, this rule applies the sort order.
6. **exactness**: Exact matches rank above prefix matches. "archer" outranks "archery."

## Client Implementation

The search client provides a typed interface to Meilisearch's HTTP API, with [connection pooling](/glossary/connection-pooling/), request batching, and [telemetry](/glossary/telemetry/) integration.

```elixir
defmodule PrismaticSearch.Client do
  @moduledoc """
  Meilisearch client with connection pooling and telemetry.

  All search and indexing operations go through this module,
  which handles serialization, error mapping, and performance
  tracking via telemetry events.
  """

  @base_url Application.compile_env(:prismatic_search, :meilisearch_url, "http://localhost:7700")
  @api_key Application.compile_env(:prismatic_search, :meilisearch_key, nil)

  @type search_result :: %{
    hits: [map()],
    estimatedTotalHits: integer(),
    processingTimeMs: integer(),
    facetDistribution: map() | nil
  }

  @spec search(String.t(), String.t(), keyword()) :: {:ok, search_result()} | {:error, term()}
  def search(index, query, opts \\ []) do
    start_time = System.monotonic_time(:microsecond)

    body = %{
      q: query,
      limit: Keyword.get(opts, :limit, 20),
      offset: Keyword.get(opts, :offset, 0),
      filter: Keyword.get(opts, :filter),
      facets: Keyword.get(opts, :facets),
      sort: Keyword.get(opts, :sort),
      attributesToHighlight: Keyword.get(opts, :highlight, ["*"]),
      attributesToCrop: Keyword.get(opts, :crop),
      cropLength: Keyword.get(opts, :crop_length, 200)
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Map.new()

    result = post("/indexes/#{index}/search", body)

    elapsed = System.monotonic_time(:microsecond) - start_time

    :telemetry.execute(
      [:prismatic, :search, :query],
      %{duration_us: elapsed, hits: get_in(result, [:ok, :estimatedTotalHits]) || 0},
      %{index: index, query_length: String.length(query)}
    )

    result
  end

  @spec add_documents(String.t(), [map()], keyword()) :: {:ok, map()} | {:error, term()}
  def add_documents(index, documents, opts \\ []) do
    primary_key = Keyword.get(opts, :primary_key)
    path = "/indexes/#{index}/documents"
    path = if primary_key, do: "#{path}?primaryKey=#{primary_key}", else: path

    post(path, documents)
  end

  @spec delete_document(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def delete_document(index, id) do
    delete("/indexes/#{index}/documents/#{id}")
  end

  @spec update_settings(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def update_settings(index, settings) do
    patch("/indexes/#{index}/settings", settings)
  end

  defp post(path, body) do
    headers = build_headers()

    case Req.post("#{@base_url}#{path}", json: body, headers: headers) do
      {:ok, %{status: status, body: response}} when status in 200..299 ->
        {:ok, response}

      {:ok, %{status: status, body: error}} ->
        {:error, {:meilisearch_error, status, error}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  defp build_headers do
    if @api_key do
      [{"authorization", "Bearer #{@api_key}"}]
    else
      []
    end
  end
end
```

## Real-Time Synchronization

Search indexes must reflect the current state of the platform's data. The synchronization layer uses an event-driven architecture where data changes in [PostgreSQL](/architecture/postgresql-kuzudb/) trigger index updates through the platform's [PubSub system](/architecture/pubsub/).

### Event-Driven Sync

```elixir
defmodule PrismaticSearch.Sync do
  @moduledoc """
  Real-time search index synchronization.

  Listens for data change events via PubSub and propagates
  updates to Meilisearch indexes. Implements batching for
  bulk operations and immediate sync for individual changes.
  """

  use GenServer

  alias PrismaticSearch.Client
  alias Phoenix.PubSub

  @pubsub Prismatic.PubSub
  @batch_size 500
  @flush_interval 2_000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    PubSub.subscribe(@pubsub, "data:changes")
    schedule_flush()
    {:ok, %{buffers: %{}, flush_count: 0}}
  end

  @impl true
  def handle_info({:entity_created, index, document}, state) do
    state = buffer_document(state, index, document)

    if buffer_full?(state, index) do
      state = flush_buffer(state, index)
      {:noreply, state}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_info({:entity_updated, index, document}, state) do
    # Updates use the same add_documents endpoint (upsert semantics)
    state = buffer_document(state, index, document)
    {:noreply, state}
  end

  @impl true
  def handle_info({:entity_deleted, index, id}, state) do
    # Deletes are immediate (no batching)
    Client.delete_document(index, id)
    {:noreply, state}
  end

  @impl true
  def handle_info(:flush, state) do
    state =
      state.buffers
      |> Map.keys()
      |> Enum.reduce(state, fn index, acc -> flush_buffer(acc, index) end)

    schedule_flush()
    {:noreply, state}
  end

  defp buffer_document(state, index, document) do
    buffer = Map.get(state.buffers, index, [])
    %{state | buffers: Map.put(state.buffers, index, [document | buffer])}
  end

  defp buffer_full?(state, index) do
    length(Map.get(state.buffers, index, [])) >= @batch_size
  end

  defp flush_buffer(state, index) do
    buffer = Map.get(state.buffers, index, [])

    if length(buffer) > 0 do
      :ok = Client.add_documents(index, Enum.reverse(buffer))

      :telemetry.execute(
        [:prismatic, :search, :sync],
        %{documents: length(buffer)},
        %{index: index, operation: :flush}
      )
    end

    %{state |
      buffers: Map.put(state.buffers, index, []),
      flush_count: state.flush_count + 1
    }
  end

  defp schedule_flush do
    Process.send_after(self(), :flush, @flush_interval)
  end
end
```

### Full Reindex

For [disaster recovery](/glossary/disaster-recovery/) or after schema changes, the platform supports full reindexing from PostgreSQL. The reindex process streams records in batches to avoid memory pressure.

```elixir
defmodule PrismaticSearch.Reindexer do
  @moduledoc """
  Full reindex from PostgreSQL to Meilisearch.

  Streams records in batches using Ecto's stream/2 with
  configurable batch sizes. Emits telemetry for progress
  tracking during long-running reindex operations.
  """

  import Ecto.Query

  @batch_size 1_000

  @spec reindex(atom()) :: {:ok, %{indexed: integer(), elapsed_ms: integer()}}
  def reindex(:assets) do
    start_time = System.monotonic_time(:millisecond)

    count =
      Asset
      |> order_by(:id)
      |> Prismatic.Repo.stream(max_rows: @batch_size)
      |> Stream.chunk_every(@batch_size)
      |> Stream.map(fn batch ->
        documents = Enum.map(batch, &serialize_asset/1)
        {:ok, _} = PrismaticSearch.Client.add_documents("assets", documents)

        :telemetry.execute(
          [:prismatic, :search, :reindex],
          %{batch_size: length(documents)},
          %{index: "assets"}
        )

        length(documents)
      end)
      |> Enum.sum()

    elapsed = System.monotonic_time(:millisecond) - start_time
    {:ok, %{indexed: count, elapsed_ms: elapsed}}
  end

  defp serialize_asset(asset) do
    %{
      id: asset.id,
      domain: asset.identifier,
      asset_type: asset.type,
      security_rating: asset.security_grade,
      security_score: asset.risk_score,
      organization_name: asset.organization.name,
      technologies: asset.metadata["technologies"] || [],
      services: asset.metadata["services"] || [],
      last_scanned: DateTime.to_iso8601(asset.last_seen),
      discovered_at: DateTime.to_iso8601(asset.first_discovered)
    }
  end
end
```

## Search Features in Practice

### Typo Tolerance

Typo tolerance is configured per index with word-length thresholds. By default, words of 4+ characters allow one typo, and words of 8+ characters allow two typos. For Czech company names (which tend to be shorter), the platform uses lower thresholds (3/6).

```elixir
# All queries return the same result -- "Archer Supreme" agent
PrismaticSearch.Client.search("agents", "archar")     # 1 typo in 6-char word
PrismaticSearch.Client.search("agents", "archer")     # exact match
PrismaticSearch.Client.search("agents", "archre")     # transposition
PrismaticSearch.Client.search("agents", "archr")      # missing character

# Czech company name search with diacritics handling
PrismaticSearch.Client.search("companies", "Ceska sporitelna")  # missing hacek
PrismaticSearch.Client.search("companies", "Ceska sporitelna")  # normalized
```

Meilisearch's typo tolerance algorithm uses a prefix tree (trie) with Levenshtein distance computation. This is fundamentally different from PostgreSQL's `pg_trgm` approach, which uses trigram similarity. The trie-based approach handles transpositions and missing characters more accurately, while `pg_trgm` handles substring matches better. For the platform's primary use case (name search), the trie-based approach is superior.

### Faceted Search

Faceted search enables drill-down navigation in the [LiveView](/architecture/phoenix-liveview/) dashboards. Users can search for assets and simultaneously see the distribution of results across [security rating](/glossary/security-rating/)s, asset types, and compliance statuses.

```elixir
{:ok, results} = PrismaticSearch.Client.search("assets", "example.com",
  facets: ["security_rating", "asset_type", "compliance_status"],
  filter: "security_rating = A OR security_rating = B"
)

# Response includes both hits and facet distribution
%{
  "hits" => [...],
  "estimatedTotalHits" => 77,
  "processingTimeMs" => 12,
  "facetDistribution" => %{
    "security_rating" => %{"A" => 45, "B" => 32},
    "asset_type" => %{"domain" => 50, "ip" => 20, "certificate" => 7},
    "compliance_status" => %{"compliant" => 60, "non_compliant" => 12, "unknown" => 5}
  }
}
```

### Search Result Highlighting

Highlighted search results improve the user experience by showing exactly which terms matched in each result. The platform renders highlights in the LiveView interface using Phoenix's `raw/1` helper.

```elixir
# Search results include highlighted matches
%{
  "domain" => "security-scanner.example.com",
  "_formatted" => %{
    "domain" => "<em>security</em>-scanner.<em>example</em>.com",
    "technologies" => ["nginx", "<em>security</em>-headers"]
  }
}
```

## LiveView Integration

The search client integrates with [Phoenix LiveView](/architecture/phoenix-liveview/) for real-time, interactive search experiences. Debounced keystroke handling prevents excessive API calls while maintaining perceived instantaneity.

```elixir
defmodule PrismaticWeb.AssetSearchLive do
  @moduledoc "LiveView component for real-time asset search"

  use PrismaticWeb, :live_view

  @debounce_ms 150

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket,
      query: "",
      results: [],
      facets: %{},
      filters: %{},
      total_hits: 0
    )}
  end

  @impl true
  def handle_event("search", %{"query" => query}, socket) do
    if String.length(query) >= 2 do
      {:ok, response} = PrismaticSearch.Client.search("assets", query,
        limit: 20,
        facets: ["security_rating", "asset_type"],
        filter: build_filter_string(socket.assigns.filters),
        highlight: ["domain", "technologies", "services"]
      )

      {:noreply, assign(socket,
        query: query,
        results: response["hits"],
        facets: response["facetDistribution"] || %{},
        total_hits: response["estimatedTotalHits"]
      )}
    else
      {:noreply, assign(socket, query: query, results: [], facets: %{})}
    end
  end

  @impl true
  def handle_event("filter", %{"field" => field, "value" => value}, socket) do
    filters = Map.put(socket.assigns.filters, field, value)

    {:ok, response} = PrismaticSearch.Client.search("assets", socket.assigns.query,
      limit: 20,
      facets: ["security_rating", "asset_type"],
      filter: build_filter_string(filters)
    )

    {:noreply, assign(socket, filters: filters, results: response["hits"])}
  end

  defp build_filter_string(filters) do
    filters
    |> Enum.map(fn {field, value} -> "#{field} = '#{value}'" end)
    |> Enum.join(" AND ")
    |> case do
      "" -> nil
      filter -> filter
    end
  end
end
```

## Performance Characteristics and Benchmarks

All benchmarks measured with Meilisearch 1.6.x on Apple M2 Pro, 32GB RAM.

| Metric | 10K Documents | 100K Documents | 1M Documents |
|--------|-------------|---------------|-------------|
| Search latency (p50) | 3ms | 12ms | 38ms |
| Search latency (p99) | 8ms | 28ms | 65ms |
| Indexing speed | 15K docs/sec | 12K docs/sec | 10K docs/sec |
| Index size (disk) | 15MB | 120MB | 500MB |
| Memory usage | 180MB | 350MB | 480MB |
| Faceted search overhead | +2ms | +5ms | +12ms |

The sub-50ms p50 latency at 1M documents meets the platform's SLA for interactive search. The p99 at 65ms is acceptable for dashboard use but may require optimization (query caching, index sharding) if the dataset grows beyond 5M documents.

### Indexing Pipeline Performance

| Operation | Throughput | Latency | Notes |
|-----------|-----------|---------|-------|
| Single document upsert | N/A | 3ms (async task creation) | Returns task ID immediately |
| Batch upsert (1K docs) | 12K docs/sec | 80ms | Optimal batch size |
| Batch upsert (10K docs) | 10K docs/sec | 1.0s | Memory-constrained above this |
| Full reindex (100K docs) | 11K docs/sec | 9.1s | Streamed from PostgreSQL |
| Settings update | N/A | 50ms | Triggers background re-ranking |

## Comparison with Elasticsearch

For teams considering Elasticsearch as an alternative, the key tradeoffs are:

| Dimension | Meilisearch | Elasticsearch |
|-----------|------------|---------------|
| **Search quality** | Excellent for user-facing search | Superior for log analytics, complex aggregations |
| **Operational cost** | Single binary, <500MB RAM | JVM cluster, 2-8GB RAM per node |
| **Query language** | Simple JSON API | Full Query DSL (powerful but complex) |
| **Aggregation** | Basic facets only | Full aggregation framework (histograms, percentiles, nested) |
| **Geospatial** | Basic geo filtering | Full geo queries (shapes, distance, bounding box) |
| **Horizontal scaling** | Limited (single node) | Excellent (sharding, replication) |
| **Learning curve** | Minimal (~1 hour to productive) | Significant (~1 week to productive) |
| **Index management** | Automatic | Manual (mapping, analyzers, tokenizers) |

Meilisearch wins for the platform's primary use case (interactive, user-facing search) but would not be suitable for log analytics or complex aggregation workloads. Those workloads are handled by [PostgreSQL](/architecture/postgresql-kuzudb/) or dedicated analytics tools.

## Integration with Platform Components

- **[PostgreSQL](/architecture/postgresql-kuzudb/)**: Source of truth for all indexed data. Synchronization via PubSub events.
- **[Storage adapters](/architecture/storage-adapters/)**: Meilisearch adapter implements the platform's `AdapterBehaviour` for unified query interface.
- **[Telemetry](/architecture/telemetry/)**: All search and indexing operations emit telemetry events for performance monitoring.
- **[LiveView](/architecture/phoenix-liveview/)**: Real-time search interface with debounced keystroke handling and faceted filtering.
- **[Local AI (Ollama)](/architecture/ollama/)**: Semantic search enrichment using local LLM embeddings for query expansion without exposing queries to external APIs.
- **[Perimeter EASM](/apps/prismatic-perimeter/)**: Asset search powers the [attack surface](/glossary/attack-surface/) exploration interface.
- **[Agent registry](/apps/prismatic-agents/)**: Agent discovery search enables finding the right agent for a given task.

## Operational Considerations

### Backup and Recovery

Meilisearch maintains its indexes on disk at a configurable path. The platform backs up indexes alongside PostgreSQL backups. In case of index corruption, a full reindex from PostgreSQL restores the search service within minutes (proportional to data volume at ~10K docs/sec).

### Security

Meilisearch supports API key authentication with fine-grained permissions (search-only keys, admin keys, tenant-scoped keys). The platform uses search-only keys for the LiveView frontend and admin keys only for the synchronization service. Meilisearch binds to localhost only; external access is proxied through the platform's [API gateway](/glossary/api-gateway/).

### Monitoring

The [telemetry system](/architecture/telemetry/) tracks search latency, indexing throughput, and error rates. Alerts fire when search p99 latency exceeds 100ms or when the synchronization backlog exceeds 1,000 pending documents, enabling proactive capacity management before users notice degradation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)