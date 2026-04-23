+++
title = "Typo Tolerance"
weight = 50
[extra]
description = "Meilisearch fuzzy matching capability that returns relevant results despite spelling errors in search queries"
category = "search"
related_terms = ["meilisearch", "search", "fuzzy-matching", "relevance"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["typo tolerance", "fuzzy matching", "Meilisearch", "search relevance", "edit distance", "glossary", "Prismatic Platform"]
tags = ["glossary", "search"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Typo Tolerance - Prismatic Platform"
+++

## Definition & Overview

Typo tolerance is a search engine capability that returns relevant results even when the user's query contains spelling mistakes, transpositions, or other typographical errors. Rather than requiring exact character-by-character matches, a typo-tolerant search engine computes the edit distance (Levenshtein distance or Damerau-Levenshtein distance) between the query terms and indexed terms, accepting matches within a configurable distance threshold. This significantly improves search usability by accommodating the natural imprecision of human typing.

Meilisearch, the full-text search engine integrated into the Prismatic Platform via the `prismatic_storage_meilisearch` adapter, provides built-in typo tolerance as one of its core ranking rules. Meilisearch applies typo tolerance intelligently: shorter words require exact matches (no typos allowed for words under 5 characters), medium words allow 1 typo, and longer words allow up to 2 typos. This graduated approach prevents false matches on short terms while being lenient on longer terms where typos are more likely and less ambiguous.

In the Prismatic Platform, typo tolerance enhances search experiences across the OSINT toolbox (searching for tool names and descriptions), the Academy (finding topics by name), the glossary (601 entries accessible via hover cards), and the promo site's search functionality. When a user searches for "virsutotal" instead of "virustotal", the search engine correctly identifies the intended tool without requiring the user to notice and correct their mistake.

## Technical Deep Dive

The Meilisearch adapter in the platform configures typo tolerance as part of index settings:

```elixir
defmodule PrismaticStorageMeilisearch.IndexConfig do
  @moduledoc """
  Configuration for Meilisearch indexes with typo tolerance,
  ranking rules, and searchable attribute settings.
  """

  @type typo_config :: %{
    enabled: boolean(),
    min_word_size_for_typos: %{
      one_typo: pos_integer(),
      two_typos: pos_integer()
    },
    disable_on_words: [String.t()],
    disable_on_attributes: [String.t()]
  }

  @default_typo_config %{
    enabled: true,
    min_word_size_for_typos: %{
      one_typo: 5,
      two_typos: 9
    },
    disable_on_words: [],
    disable_on_attributes: []
  }

  @spec configure_index(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def configure_index(index_name, opts \\ []) do
    typo_config = Keyword.get(opts, :typo_tolerance, @default_typo_config)
    searchable = Keyword.get(opts, :searchable_attributes, ["*"])
    ranking = Keyword.get(opts, :ranking_rules, default_ranking_rules())

    settings = %{
      "typoTolerance" => %{
        "enabled" => typo_config.enabled,
        "minWordSizeForTypos" => %{
          "oneTypo" => typo_config.min_word_size_for_typos.one_typo,
          "twoTypos" => typo_config.min_word_size_for_typos.two_typos
        },
        "disableOnWords" => typo_config.disable_on_words,
        "disableOnAttributes" => typo_config.disable_on_attributes
      },
      "searchableAttributes" => searchable,
      "rankingRules" => ranking
    }

    PrismaticStorageMeilisearch.Client.update_settings(index_name, settings)
  end

  defp default_ranking_rules do
    ["words", "typo", "proximity", "attribute", "sort", "exactness"]
  end
end
```

The ranking rule ordering is critical for typo tolerance effectiveness. By placing "typo" after "words" in the ranking rules, Meilisearch first ensures all query terms are present, then ranks exact matches above typo-tolerant matches:

```elixir
defmodule PrismaticStorageMeilisearch.Search do
  @moduledoc """
  Search operations with typo tolerance, highlighting,
  and faceted filtering support.
  """

  @spec search(String.t(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(index_name, query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 20)
    offset = Keyword.get(opts, :offset, 0)
    filters = Keyword.get(opts, :filters, nil)
    highlight = Keyword.get(opts, :highlight, ["*"])

    params = %{
      "q" => query,
      "limit" => limit,
      "offset" => offset,
      "attributesToHighlight" => highlight,
      "highlightPreTag" => "<mark>",
      "highlightPostTag" => "</mark>",
      "showMatchesPosition" => true
    }

    params =
      if filters do
        Map.put(params, "filter", filters)
      else
        params
      end

    case PrismaticStorageMeilisearch.Client.search(index_name, params) do
      {:ok, %{"hits" => hits, "estimatedTotalHits" => total, "processingTimeMs" => time}} ->
        {:ok, %{
          hits: hits,
          total: total,
          processing_time_ms: time,
          query: query,
          typo_corrections: extract_typo_info(hits)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp extract_typo_info(hits) do
    hits
    |> Enum.flat_map(fn hit ->
      case Map.get(hit, "_matchesPosition") do
        nil -> []
        positions ->
          positions
          |> Enum.flat_map(fn {_attr, matches} ->
            Enum.filter(matches, fn m -> Map.get(m, "type") == "typo" end)
          end)
      end
    end)
  end
end
```

## Architecture & Implementation

Typo tolerance in the platform's search infrastructure operates within the broader Meilisearch integration:

**Index Management**: Each searchable domain (OSINT tools, Academy topics, glossary entries, DD entities) has its own Meilisearch index with domain-specific typo tolerance configuration. OSINT tool names disable typo tolerance on slug fields (where exact matching is required for routing) while enabling it on name and description fields.

**Ranking Integration**: Meilisearch's ranking rules determine how typo-tolerant matches compare to exact matches. The default rule ordering ensures that exact matches always rank above typo-corrected matches, which in turn rank above more distant matches. This preserves result quality while still surfacing relevant content for imprecise queries.

**Performance**: Meilisearch pre-computes typo variations during indexing rather than at query time, making typo-tolerant search nearly as fast as exact search. The `prismatic_storage_meilisearch` adapter inherits this performance characteristic, with sub-50ms search times even with typo tolerance enabled across all indexes.

**Attribute-Level Control**: Certain attributes like identifiers (ICO numbers in ARES, company registration numbers) have typo tolerance disabled because a single-character difference in an identifier points to a completely different entity. The configuration supports per-attribute typo tolerance control to handle these cases.

## Usage in Prismatic Platform

The OSINT toolbox search uses typo tolerance to help users find tools by approximate name:

```elixir
defmodule PrismaticWeb.OsintSearchLive do
  use PrismaticWeb, :live_view

  @impl true
  def handle_event("search", %{"query" => query}, socket) when byte_size(query) >= 2 do
    case PrismaticStorageMeilisearch.Search.search("osint_tools", query,
           limit: 10,
           highlight: ["name", "description"]) do
      {:ok, %{hits: hits, processing_time_ms: time}} ->
        {:noreply, assign(socket,
          search_results: hits,
          search_time_ms: time,
          search_query: query
        )}

      {:error, _} ->
        {:noreply, assign(socket, search_results: [], search_query: query)}
    end
  end

  @impl true
  def handle_event("search", _params, socket) do
    {:noreply, assign(socket, search_results: [])}
  end
end
```

The glossary hover card system also benefits from typo tolerance when users search the 601-entry glossary. Searching for "metaprogamming" (missing an 'r') still finds the "metaprogramming" entry, ensuring smooth user experience.

## Cross-References

- [Meilisearch](@/glossary/meilisearch.md) - Full-text search engine
- **Search** - Information retrieval concepts
- **Relevance** - Search result ranking
- **Fuzzy Matching** - Approximate string matching
- [Tool](@/glossary/tool.md) - OSINT tools discoverable via search

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
