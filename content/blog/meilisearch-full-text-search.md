+++
title = "Full-Text Search with Meilisearch in an Elixir Platform"
date = 2026-03-14
description = "Integrating Meilisearch for full-text search: index management, faceted search, typo tolerance configuration, and glossary indexing for an intelligence platform."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["meilisearch", "search", "elixir", "full-text", "indexing"]
reading_time = "8 min"
keywords = ["meilisearch elixir", "full text search", "faceted search", "typo tolerance", "search index management"]
image = "/images/blog/meilisearch-full-text-search.png"
word_count = 1020
date_created = "2026-03-14"
date_modified = "2026-03-14"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Full-Text Search with Meilisearch in an Elixir Platform - Prismatic Platform"
+++

Full-text search across intelligence data requires sub-50ms response times, tolerance for typos and partial matches, and faceted filtering by entity type, source, and risk level. Meilisearch provides all of this with a simple HTTP API and minimal operational overhead. This post covers how the Prismatic Platform integrates Meilisearch for entity search, glossary lookup, and document discovery.

## Architecture

Meilisearch runs as a sidecar service. The Elixir application communicates with it through an HTTP client wrapper that handles index management, document ingestion, and search queries:

| Component | Purpose | Technology |
|-----------|---------|------------|
| Meilisearch instance | Search engine | Meilisearch v1.6+ |
| `PrismaticSearch.Client` | HTTP client wrapper | Tesla + Jason |
| `PrismaticSearch.Indexer` | Document ingestion pipeline | GenServer + Broadway |
| `PrismaticSearch.Query` | Search query builder | Elixir structs |
| Index sync worker | Keeps indices in sync with DB | Periodic GenServer |

## Client Module

The client module wraps Meilisearch's HTTP API with typed Elixir functions:

```elixir
defmodule PrismaticSearch.Client do
  @moduledoc """
  HTTP client for Meilisearch operations.

  Provides index management, document CRUD, search queries,
  and settings configuration. All operations return tagged
  tuples for explicit error handling.
  """

  @type search_result :: %{
    hits: [map()],
    estimated_total_hits: non_neg_integer(),
    processing_time_ms: non_neg_integer(),
    facet_distribution: map()
  }

  @spec search(String.t(), String.t(), keyword()) :: {:ok, search_result()} | {:error, term()}
  def search(index, query, opts \\ []) do
    body = %{
      q: query,
      limit: Keyword.get(opts, :limit, 20),
      offset: Keyword.get(opts, :offset, 0),
      filter: Keyword.get(opts, :filter),
      facets: Keyword.get(opts, :facets),
      attributesToHighlight: Keyword.get(opts, :highlight, ["*"]),
      attributesToCrop: Keyword.get(opts, :crop),
      cropLength: Keyword.get(opts, :crop_length, 200)
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})

    case post("/indexes/#{index}/search", body) do
      {:ok, %{status: 200, body: result}} -> {:ok, parse_search_result(result)}
      {:ok, %{status: status, body: body}} -> {:error, {status, body}}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec add_documents(String.t(), [map()]) :: {:ok, map()} | {:error, term()}
  def add_documents(index, documents) when is_list(documents) do
    case post("/indexes/#{index}/documents", documents) do
      {:ok, %{status: 202, body: task}} -> {:ok, task}
      {:ok, %{status: status, body: body}} -> {:error, {status, body}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp post(path, body) do
    url = "#{base_url()}#{path}"
    headers = [{"Authorization", "Bearer #{api_key()}"}, {"Content-Type", "application/json"}]
    Tesla.post(url, Jason.encode!(body), headers: headers)
  end

  defp base_url, do: Application.get_env(:prismatic_search, :meilisearch_url)
  defp api_key, do: Application.get_env(:prismatic_search, :meilisearch_key)
end
```

## Index Configuration

Each search domain gets its own index with tailored settings. Index configuration controls which fields are searchable, filterable, and sortable:

```elixir
defmodule PrismaticSearch.IndexConfig do
  @moduledoc """
  Index configuration definitions for all search domains.

  Each index specifies searchable attributes, filterable
  attributes for faceted search, sortable attributes,
  and ranking rules optimized for the domain.
  """

  @spec entity_index_settings() :: map()
  def entity_index_settings do
    %{
      searchableAttributes: ["name", "description", "aliases", "identifiers"],
      filterableAttributes: ["type", "risk_level", "sources", "country", "status"],
      sortableAttributes: ["risk_score", "updated_at", "name"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "risk_score:desc"
      ],
      typoTolerance: %{
        minWordSizeForTypos: %{oneTypo: 4, twoTypos: 8},
        disableOnAttributes: ["identifiers"]
      },
      pagination: %{maxTotalHits: 5000}
    }
  end

  @spec glossary_index_settings() :: map()
  def glossary_index_settings do
    %{
      searchableAttributes: ["term", "definition", "category", "related_terms"],
      filterableAttributes: ["category", "domain", "language"],
      sortableAttributes: ["term", "updated_at"],
      typoTolerance: %{
        minWordSizeForTypos: %{oneTypo: 3, twoTypos: 6}
      }
    }
  end
end
```

| Index | Documents | Searchable Fields | Filterable Fields | Avg Query Time |
|-------|-----------|-------------------|-------------------|---------------|
| `entities` | ~50K | name, description, aliases, identifiers | type, risk_level, sources, country | 8ms |
| `glossary` | ~500 | term, definition, category | category, domain, language | 3ms |
| `documents` | ~10K | title, content, tags | case_id, type, language | 12ms |
| `investigations` | ~2K | title, summary, entities | status, priority, assignee | 5ms |

## Faceted Search

Faceted search enables drill-down filtering in the UI. The search query requests facet distributions, which Meilisearch returns alongside results:

```elixir
defmodule PrismaticSearch.EntitySearch do
  @moduledoc """
  Entity search with faceted filtering.

  Supports multi-facet search with type, risk level,
  source, and country dimensions. Returns facet
  distributions for UI filter rendering.
  """

  alias PrismaticSearch.Client

  @spec search_entities(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def search_entities(query, filters \\ %{}) do
    filter_expressions = build_filter(filters)

    Client.search("entities", query,
      limit: Map.get(filters, :limit, 20),
      offset: Map.get(filters, :offset, 0),
      filter: filter_expressions,
      facets: ["type", "risk_level", "sources", "country"],
      highlight: ["name", "description"]
    )
  end

  defp build_filter(filters) do
    []
    |> maybe_add_filter(filters, :type, "type = ':value'")
    |> maybe_add_filter(filters, :risk_level, "risk_level = ':value'")
    |> maybe_add_filter(filters, :country, "country = ':value'")
    |> maybe_add_filter(filters, :source, "sources = ':value'")
    |> case do
      [] -> nil
      parts -> Enum.join(parts, " AND ")
    end
  end

  defp maybe_add_filter(filters_list, params, key, template) do
    case Map.get(params, key) do
      nil -> filters_list
      value -> [String.replace(template, ":value", to_string(value)) | filters_list]
    end
  end
end
```

## Glossary Indexing Integration

The platform's interactive glossary uses Meilisearch for instant search-as-you-type. A sync worker keeps the Meilisearch index updated when glossary entries change:

```elixir
defmodule PrismaticSearch.GlossarySync do
  @moduledoc """
  Synchronizes glossary entries to Meilisearch index.

  Listens for PubSub events on glossary changes and
  updates the search index. Performs full reindex
  on startup and incremental updates thereafter.
  """

  use GenServer
  require Logger

  @index "glossary"

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "glossary:changes")
    schedule_full_reindex()
    {:ok, %{last_sync: nil}}
  end

  @impl GenServer
  def handle_info(:full_reindex, state) do
    Logger.info("Starting full glossary reindex")

    entries = PrismaticWeb.Glossary.list_all_entries()

    documents =
      Enum.map(entries, fn entry ->
        %{
          id: entry.id,
          term: entry.term,
          definition: entry.definition,
          category: entry.category,
          domain: entry.domain,
          related_terms: entry.related_terms,
          language: entry.language,
          updated_at: DateTime.to_iso8601(entry.updated_at)
        }
      end)

    case PrismaticSearch.Client.add_documents(@index, documents) do
      {:ok, _task} ->
        Logger.info("Glossary reindex complete: #{length(documents)} entries")
      {:error, reason} ->
        Logger.error("Glossary reindex failed: #{inspect(reason)}")
    end

    {:noreply, %{state | last_sync: DateTime.utc_now()}}
  end

  @impl GenServer
  def handle_info({:glossary_updated, entry}, state) do
    document = %{
      id: entry.id,
      term: entry.term,
      definition: entry.definition,
      category: entry.category,
      domain: entry.domain,
      related_terms: entry.related_terms,
      language: entry.language,
      updated_at: DateTime.to_iso8601(DateTime.utc_now())
    }

    case PrismaticSearch.Client.add_documents(@index, [document]) do
      {:ok, _} -> Logger.debug("Glossary entry synced: #{entry.term}")
      {:error, reason} -> Logger.warning("Glossary sync failed for #{entry.term}: #{inspect(reason)}")
    end

    {:noreply, state}
  end

  defp schedule_full_reindex do
    Process.send_after(self(), :full_reindex, :timer.seconds(5))
  end
end
```

## Typo Tolerance Configuration

Meilisearch's typo tolerance is configurable per index and per attribute. For entity names where precision matters, stricter settings prevent false matches on identifiers while remaining lenient on names:

```elixir
@spec configure_typo_tolerance(String.t()) :: :ok | {:error, term()}
def configure_typo_tolerance(index) do
  settings = %{
    typoTolerance: %{
      enabled: true,
      minWordSizeForTypos: %{
        oneTypo: 4,
        twoTypos: 8
      },
      disableOnAttributes: ["identifiers", "ico", "registration_number"],
      disableOnWords: ["LLC", "s.r.o.", "a.s.", "GmbH"]
    }
  }

  Client.update_settings(index, settings)
end
```

Meilisearch provides fast, relevant full-text search with minimal configuration overhead. Combined with Elixir's GenServer patterns for sync and Broadway for bulk ingestion, it forms a responsive search layer that keeps pace with the platform's data growth.
