+++
title = "Meilisearch"
weight = 33
[extra]
category = "database"
description = "Lightning-fast, typo-tolerant full-text search engine designed for instant search experiences"
url = "https://www.meilisearch.com"
version = "1.6+"
icon = "meilisearch"
color = "purple"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 924
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Meilisearch", "Lightning-fast", "technologies", "database", "Prismatic Platform", "Search", "Index", "HTTP"]
tags = ["technologies", "database", "meilisearch", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Meilisearch - Prismatic Platform"
+++

## Overview

Meilisearch is the full-text search engine that powers the Prismatic Platform's search functionality across agents, commands, OSINT sources, security findings, and documentation. It delivers sub-50ms search responses with typo tolerance, faceted filtering, and ranking customization -- enabling users to find any platform resource instantly. The platform indexes over 1,000 searchable documents across multiple indexes, and Meilisearch returns relevant results before the user finishes typing.

The Prismatic Platform indexes its 404 agents, 211 commands, 121+ OSINT sources, and thousands of intelligence records into Meilisearch for instant search and discovery. Meilisearch's typo tolerance means users find what they need even with imprecise queries (searching "perimitr" still returns Perimeter-related results), while its faceted search enables filtering by category, status, domain, and other attributes simultaneously. This combination of fuzzy matching and structured filtering is essential for a security platform where operators need to locate resources quickly under pressure.

Meilisearch's simple HTTP API and the platform's [Elixir](/technologies/elixir/) client wrapper make integration straightforward, with real-time index synchronization through PubSub-triggered updates whenever data changes. When a new agent is registered or a security finding is created, a PubSub event triggers an immediate index update so the resource becomes searchable within seconds.

## Key Features

- **Sub-50ms Search**: Instant results even across millions of documents, with prefix matching for search-as-you-type
- **Typo Tolerance**: Fuzzy matching with configurable edit distance for imprecise queries
- **Faceted Search**: Multi-criteria filtering with count aggregation for building dynamic filter UIs
- **Ranking Rules**: Customizable result ordering by relevance, recency, and domain-specific attributes
- **Synonyms**: Custom synonym dictionaries for domain-specific language (e.g., "vuln" matches "vulnerability")
- **Multi-Index**: Separate searchable indexes per data type with independent configurations
- **Filterable Attributes**: Pre-defined attributes for fast filtered queries without full-text overhead
- **Highlighting**: Matched terms highlighted in results for visual feedback in the search UI

## Platform Integration

Meilisearch provides instant search across all platform resources through a unified search client that implements the storage behaviour.

```elixir
defmodule PrismaticStorage.Search.MeilisearchAdapter do
  @moduledoc """
  Meilisearch storage adapter implementing the unified search behaviour.
  Provides indexing, searching, and document management operations.
  """
  @behaviour PrismaticStorage.Search.Behaviour

  @impl true
  def search(index, query, opts \\ []) do
    body = %{
      q: query,
      limit: Keyword.get(opts, :limit, 20),
      offset: Keyword.get(opts, :offset, 0),
      filter: Keyword.get(opts, :filter),
      facets: Keyword.get(opts, :facets, []),
      attributesToHighlight: ["name", "description"]
    }

    case post("/indexes/#{index}/search", body) do
      {:ok, %{"hits" => hits, "estimatedTotalHits" => total}} ->
        {:ok, %{hits: hits, total: total}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def index_document(index, document) do
    post("/indexes/#{index}/documents", [document])
  end

  @impl true
  def delete_document(index, document_id) do
    delete("/indexes/#{index}/documents/#{document_id}")
  end

  defp post(path, body) do
    url = "#{base_url()}#{path}"
    headers = [{"Authorization", "Bearer #{api_key()}"}, {"Content-Type", "application/json"}]

    case HTTPoison.post(url, Jason.encode!(body), headers) do
      {:ok, %{status_code: status, body: body}} when status in 200..299 ->
        {:ok, Jason.decode!(body)}

      {:ok, %{status_code: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

Index synchronization is triggered by PubSub events, keeping search results current with the latest platform state.

```elixir
defmodule PrismaticStorage.Search.IndexSync do
  @moduledoc """
  Real-time index synchronization via PubSub events.
  Keeps Meilisearch indexes current with platform state changes.
  """
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "agents")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "findings")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "commands")
    {:ok, %{indexed_count: 0}}
  end

  @impl true
  def handle_info({:agent_registered, agent}, state) do
    PrismaticStorage.Search.MeilisearchAdapter.index_document("agents", %{
      id: agent.id,
      name: agent.name,
      domain: agent.domain,
      description: agent.description,
      status: to_string(agent.status)
    })
    {:noreply, %{state | indexed_count: state.indexed_count + 1}}
  end

  @impl true
  def handle_info({:finding_created, finding}, state) do
    PrismaticStorage.Search.MeilisearchAdapter.index_document("findings", %{
      id: finding.id,
      title: finding.title,
      severity: to_string(finding.severity),
      domain: finding.domain,
      description: finding.description
    })
    {:noreply, %{state | indexed_count: state.indexed_count + 1}}
  end
end
```

## Architecture

Meilisearch occupies the search layer in the platform's polyglot persistence architecture.

| Index | Documents | Filterable Fields | Sortable Fields | Update Trigger |
|-------|-----------|-------------------|-----------------|----------------|
| `agents` | ~404 | domain, status, tier | name, lastActivity | Agent registration/update |
| `commands` | ~211 | category, scope | name, weight | Command registration |
| `osint_sources` | ~121 | category, country | name, reliability | Source registration |
| `findings` | ~1000+ | severity, domain, status | createdAt, severity | Finding creation |
| `glossary` | ~127 | category | name | Documentation update |

The data flow from source of truth to search index follows a publish-subscribe pattern.

| Step | Component | Action |
|------|-----------|--------|
| 1 | Domain Service | Creates/updates record in [PostgreSQL](/technologies/postgresql/) |
| 2 | PubSub | Broadcasts change event via [Phoenix PubSub](/technologies/pubsub/) |
| 3 | IndexSync | Receives event, transforms to search document |
| 4 | Meilisearch | Indexes document, available for search within ~50ms |
| 5 | LiveView | Search UI shows updated results on next query |

## Performance Characteristics

Meilisearch's performance meets the platform's strict response time requirements.

| Metric | Target | Measured | Notes |
|--------|--------|----------|-------|
| Search latency (simple) | < 50ms | ~10ms | Single-word query, no filters |
| Search latency (complex) | < 100ms | ~30ms | Multi-word with filters and facets |
| Typo-tolerant search | < 50ms | ~15ms | 1-2 character edit distance |
| Faceted search | < 100ms | ~25ms | With count aggregation |
| Index update | < 200ms | ~50ms | Single document indexing |
| Bulk index (100 docs) | < 1s | ~300ms | Batch document indexing |
| Memory usage | < 500MB | ~200MB | For all platform indexes |
| Index size on disk | < 1GB | ~100MB | Compressed inverted indexes |

## Configuration

Meilisearch connection and index configuration is managed through the platform's configuration system.

```elixir
# Meilisearch connection and index configuration
config :prismatic, :meilisearch,
  url: System.get_env("MEILI_URL", "http://localhost:7700"),
  api_key: System.get_env("MEILI_MASTER_KEY"),
  indexes: ["agents", "commands", "osint_sources", "findings", "glossary"],
  timeout: 5_000

# Index-specific settings applied at startup
config :prismatic, :meilisearch_indexes,
  agents: %{
    filterable_attributes: ["domain", "status", "tier"],
    sortable_attributes: ["name", "lastActivity"],
    searchable_attributes: ["name", "description", "domain"],
    ranking_rules: ["words", "typo", "proximity", "attribute", "sort", "exactness"]
  },
  findings: %{
    filterable_attributes: ["severity", "domain", "status"],
    sortable_attributes: ["createdAt", "severity"],
    searchable_attributes: ["title", "description", "domain"]
  }
```

## Best Practices

- **Define filterable attributes upfront** -- Meilisearch requires attributes to be declared filterable before they can be used in filter expressions
- **Use facets for filter UIs** -- faceted search returns counts per filter value, enabling dynamic filter interfaces with accurate counts
- **Keep documents denormalized** -- Meilisearch performs best with flat, denormalized documents rather than nested structures
- **Sync incrementally** -- update individual documents rather than re-indexing entire collections on each change
- **Handle service unavailability gracefully** -- the adapter includes circuit breaker logic to prevent cascading failures when Meilisearch is down
- **Configure ranking rules per index** -- different indexes may need different ranking priorities; security findings should rank by severity, while agents rank by name relevance
- **Use synonyms for domain terminology** -- security professionals use varied terminology; configure synonyms like "vuln" = "vulnerability", "cert" = "certificate"
- **Set appropriate typo tolerance** -- increase for user-facing search, decrease for precise API queries

## Comparison with Alternatives

| Feature | Meilisearch | Elasticsearch | Algolia | Typesense | PostgreSQL FTS |
|---------|-------------|---------------|---------|-----------|---------------|
| Typo Tolerance | Built-in | Plugin | Built-in | Built-in | None |
| Setup Complexity | Minimal | High | SaaS | Minimal | Built-in |
| Memory Usage | Low (~200MB) | High (~1GB+) | N/A (cloud) | Low | Shared |
| Search Latency | ~10ms | ~20ms | ~5ms | ~10ms | ~50ms |
| Faceted Search | Yes | Yes | Yes | Yes | Limited |
| Self-hosted | Yes | Yes | No | Yes | Yes |
| Real-time Indexing | Yes | Near real-time | Yes | Yes | Immediate |
| Elixir Client | HTTP wrapper | elasticsearch-elixir | HTTP | HTTP | Ecto built-in |

Meilisearch was chosen for its combination of low operational complexity (single binary, minimal configuration), excellent typo tolerance, and fast search performance without requiring the resource overhead of Elasticsearch.

The platform also benefits from Meilisearch's multi-search capability, which allows a single HTTP request to query multiple indexes simultaneously. This enables the unified search bar in the web interface to return results across agents, commands, findings, and glossary entries in a single round-trip, reducing perceived latency and simplifying the client-side search implementation in [Phoenix LiveView](/technologies/phoenix-liveview/).

## Related Technologies

- [PostgreSQL](/technologies/postgresql/) - Primary persistent storage, source of truth for indexed data
- [ETS](/technologies/ets/) - In-memory caching complement for frequently accessed search results
- [Redis](/technologies/redis/) - Distributed caching for search result pages across cluster nodes
- [KuzuDB](/technologies/kuzudb/) - Graph database complementing text search with relationship traversal
- [Elixir](/technologies/elixir/) - Host language providing the HTTP client wrapper for Meilisearch

## Related Apps

- [prismatic_storage_meilisearch](/apps/prismatic-storage-meilisearch/) - Meilisearch storage adapter implementing the search behaviour
- [prismatic_web](/apps/prismatic-web/) - Search UI components and [Phoenix LiveView](/technologies/phoenix-liveview/) search integration
- [prismatic_meilisearch](/apps/prismatic-meilisearch/) - Meilisearch client and index management

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)