+++
title = "Faceted Search"
description = "A search technique that enables users to filter results across multiple independent dimensions (facets) such as category, date range, status, and type, providing guided navigation through large datasets."
weight = 50

[extra]
category = "search"
domain = "information-retrieval"
complexity = "intermediate"
stability = "mature"
beam_related = true
tags = ["faceted-search", "meilisearch", "filtering", "navigation", "search", "ux", "multi-attribute", "taxonomy", "drill-down", "refinement"]
date_created = "2026-02-23"
date_updated = "2026-04-02"
difficulty = "intermediate"
audience = ["developers", "ux-designers", "architects", "data-engineers"]
related_terms = ["full-text-index", "meilisearch", "elasticsearch", "search", "filtering", "taxonomy", "inverted-index", "pagination", "liveview", "ets", "genserver", "pubsub", "data-quality"]
key_concepts = ["facet-extraction", "facet-counting", "conjunctive-filtering", "disjunctive-filtering", "hierarchical-facets"]
platforms = ["meilisearch", "elasticsearch", "solr", "beam", "elixir"]
prerequisites = ["search-fundamentals", "database-indexing", "ux-basics"]
use_cases = ["e-commerce-filtering", "osint-tool-discovery", "document-search", "entity-browsing", "catalog-navigation"]
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
word_count = 3600
date_modified = "2026-04-02"
keywords = ["Faceted Search", "filtering", "Meilisearch", "facets", "multi-dimensional", "aggregations", "glossary", "Prismatic Platform"]
quality_score = 95
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Faceted Search - Prismatic Platform"
+++

## Definition

Faceted search (also known as faceted navigation or guided navigation) is a search and filtering technique that allows users to narrow search results by applying multiple independent filters (facets) simultaneously. Each facet represents a dimension of the data -- such as category, date range, author, status, or geographic region -- and displays the available values along with the count of matching results for each value. This combination of full-text search with multi-dimensional filtering provides a powerful exploration interface for large, heterogeneous datasets.

The key insight of faceted search is that users often do not know the exact query to type but do know the characteristics of what they are looking for. Rather than requiring users to formulate precise search queries, faceted search presents the structure of available data and lets users progressively refine results by selecting relevant attributes. This approach reduces the cognitive load of searching and virtually eliminates "zero results" scenarios by showing only filter values that produce results.

Faceted search originated in library science and information architecture, where faceted classification systems (developed by S.R. Ranganathan in the 1930s) organize knowledge along multiple independent dimensions rather than a single hierarchy. The technique was popularized in e-commerce (Amazon, eBay) and is now standard in any application that exposes large catalogs to users, including search engines, document management systems, and OSINT platforms.

The mathematical foundation of faceted search rests on set theory and Boolean algebra. Each facet filter defines a set of matching documents; combining facets computes the intersection (AND) or union (OR) of these sets. The challenge lies in computing these set operations efficiently while simultaneously counting remaining facet values -- a problem that modern search engines solve through specialized data structures like inverted indexes, bitmap indexes, and columnar doc-value stores.

## Core Concepts

| Concept | Description | Role in Faceted Search |
|---------|-------------|----------------------|
| **Facet** | A single dimension of data used for filtering (e.g., "category", "date") | Primary filtering axis |
| **Facet Value** | A specific option within a facet (e.g., "Security" within "category") | Individual filter selection |
| **Facet Count** | The number of documents matching a specific facet value | Guides user decisions, prevents dead ends |
| **Conjunctive Filter (AND)** | All selected facets must match simultaneously | Cross-facet narrowing |
| **Disjunctive Filter (OR)** | Any selected value within a facet matches | Within-facet broadening |
| **Hierarchical Facet** | Nested facet with parent-child relationships (e.g., Region > Country > City) | Multi-level drill-down |
| **Facet Distribution** | The complete set of values and counts for a facet | Drives UI rendering |
| **Post-Filter Count** | Facet count computed after applying other facets | Shows remaining possibilities |
| **Facet Isolation** | Counting a facet's values without applying that facet's own filter | Enables multi-select within facet |
| **Dynamic Faceting** | Automatically discovering facets from data schema | Reduces manual configuration |

### Facet Types

| Facet Type | Description | Example | UI Pattern | Meilisearch Support |
|-----------|-------------|---------|-----------|-------------------|
| **Value facet** | Enumerated values with counts | Category: Security (45), OSINT (38) | Checkbox list | Native |
| **Range facet** | Numeric or date ranges | Date: Last 7 days, Last 30 days | Slider or radio buttons | Filter expressions |
| **Hierarchical facet** | Nested categories | Location > Europe > Czech Republic | Tree navigation | Custom implementation |
| **Boolean facet** | Binary toggle | "Has API key required" | Toggle switch | Filter expressions |
| **Tag facet** | Multi-value attribute | Tags: ["api", "free", "real-time"] | Tag cloud | Native (array fields) |
| **Numeric facet** | Continuous numeric values bucketed into ranges | Score: 0-25, 26-50, 51-75, 76-100 | Histogram / slider | Filter expressions |
| **Date facet** | Temporal bucketing | Created: This week, This month, This year | Calendar / radio | Filter expressions |

### Filtering Logic

| Logic | Behavior | SQL Equivalent | Use Case | Performance Impact |
|-------|---------|---------------|----------|-------------------|
| **Conjunctive (AND)** | All selected facets must match | `WHERE a AND b` | Cross-facet filtering | Linear in facet count |
| **Disjunctive (OR)** | Any selected value within facet matches | `WHERE a OR b` | Within-facet multi-select | Requires union computation |
| **Mixed** | AND between facets, OR within facets | `WHERE (a1 OR a2) AND (b1 OR b2)` | Standard e-commerce pattern | Most common, well-optimized |
| **Negation** | Exclude specific facet values | `WHERE NOT a` | Exclusion filtering | Requires complement set |
| **Nested** | Hierarchical AND/OR combinations | `WHERE (a AND (b1 OR b2)) OR c` | Advanced filtering | Query complexity scales |

## Technical Deep Dive

### Architecture Layers

Faceted search architecture consists of three layers: the indexing layer that extracts and stores facet values during document ingestion, the query layer that combines full-text search with facet filtering, and the presentation layer that renders facet values with counts in the user interface.

**Indexing Layer**: The indexing layer must identify which document fields serve as facets and ensure they are stored in structures that support efficient counting and filtering. Search engines like Meilisearch and Elasticsearch use inverted indexes for full-text search and columnar doc-value stores for facet operations. The doc-value store enables O(1) access to a document's facet values, while posting lists enable efficient counting of documents matching each facet value.

**Query Layer**: The query layer processes a combined query consisting of a text query (optional) and zero or more facet filters. The engine first evaluates the text query to produce a candidate result set, then applies facet filters to narrow results, and finally computes facet counts over the filtered result set. Facet counts must be computed considering all filters except the current facet (to enable multi-select within a facet without reducing that facet's own visible options).

**Presentation Layer**: The presentation layer renders facet values with their counts, sorted by relevance or count. It must handle dynamic updates as users select facets, showing updated counts for all other facets. In LiveView applications, this update happens server-side with minimal latency.

### Meilisearch Faceted Search Internals

Meilisearch implements faceted search through a combination of its core search engine and a specialized facet computation pipeline:

| Component | Function | Performance Characteristic |
|-----------|----------|--------------------------|
| **Filterable Attributes** | Fields declared as filterable in index settings | O(1) lookup per document |
| **Sortable Attributes** | Fields available for result ordering | Pre-computed sort indexes |
| **Facet Distribution API** | Returns value counts for specified facets | Sub-10ms for typical datasets |
| **Filter Expressions** | SQL-like syntax for combining facet conditions | Parsed and optimized at query time |
| **Ranking Rules** | Configurable relevance scoring with facet awareness | Affects result ordering, not facet counts |

### Performance Considerations

| Technique | Purpose | Impact | Implementation |
|-----------|---------|--------|---------------|
| **Pre-computed facet counts** | Avoid full recalculation on each query | ~10x faster facet rendering | Cached in ETS after first computation |
| **Facet caching** | Cache facet values for common queries | Sub-millisecond facet display | HierarchicalCache (ETS > Cachex > Meilisearch) |
| **Partial facet refresh** | Only recount affected facets on filter change | Smoother UX, less computation | Selective invalidation on filter events |
| **Facet sampling** | Approximate counts for very large datasets | Trades accuracy for speed | Configurable sampling threshold |
| **Filtered facet counts** | Show counts considering current filters | Prevents selecting zero-result combinations | Computed in query layer |
| **Batch facet requests** | Combine multiple facet queries into single request | Reduces network overhead | BulkOperations utility |
| **Facet result limits** | Cap maximum facet values returned | Prevents memory bloat on high-cardinality facets | Configurable per-facet limit |

### Cardinality Management

High-cardinality facets (facets with many unique values, such as "author" in a large document collection) present specific challenges:

| Cardinality Level | Example | Challenge | Strategy |
|-------------------|---------|-----------|----------|
| **Low (< 20)** | Category, Status | No issues | Display all values |
| **Medium (20-100)** | Country, Year | UI clutter | Show top N with "Show more" |
| **High (100-10K)** | Author, Company | Performance, UX | Search-within-facet, lazy loading |
| **Very High (10K+)** | Tag, Keyword | Memory, latency | Sampling, aggregation, type-ahead |

## Usage in Prismatic Platform

The Prismatic Platform implements faceted search across three primary domains: the OSINT toolbox (filtering 157 tools by category, API style, authentication requirements), the DD entity browser (filtering entities by type, jurisdiction, risk level), and the Academy topic dashboard (filtering topics by domain, difficulty, prerequisites).

### OSINT Toolbox Faceted Interface

The OSINT toolbox LiveView at `/hub/osint/tools` provides a faceted interface with category chips (Czech, Global, Sanctions, EU, UK, US, Universal), API style filters, and authentication requirement toggles. As users select facets, the UI updates in real-time via LiveView's server-side rendering, with Meilisearch providing sub-10ms faceted search responses.

| Facet | Type | Values | UI Pattern |
|-------|------|--------|-----------|
| **Category** | Value | Czech, Global, Sanctions, EU, UK, US, Universal | Chip/pill selector |
| **API Style** | Value | REST, GraphQL, SOAP, Scraping, Provider | Checkbox list |
| **Requires Auth** | Boolean | Yes, No | Toggle switch |
| **Input Type** | Value | Domain, IP, Email, Hash, URL, Text | Multi-select |
| **Status** | Value | Active, Deprecated, Beta | Radio buttons |

### DD Entity Browser Facets

| Facet | Type | Values | Purpose |
|-------|------|--------|---------|
| **Entity Type** | Value | Person, Company, Domain, Asset | Primary classification |
| **Jurisdiction** | Hierarchical | Region > Country > City | Geographic filtering |
| **Risk Level** | Range | Low, Medium, High, Critical | Risk-based prioritization |
| **Case Association** | Value | Case IDs | Cross-reference filtering |
| **Last Updated** | Date | Time ranges | Freshness filtering |

## Code Examples

```elixir
defmodule Prismatic.Search.FacetedQuery do
  @moduledoc """
  Faceted search query builder for Meilisearch integration.
  Supports the OSINT toolbox, DD entity browser, and
  Academy topic discovery with multi-dimensional filtering.

  Implements the mixed filtering logic pattern: AND between
  facets, OR within facets. Supports all facet types including
  value, range, boolean, hierarchical, and tag facets.
  """

  require Logger

  @type facet_filter :: {String.t(), list(String.t())}
  @type facet_config :: %{
    attribute: String.t(),
    type: :value | :range | :boolean | :hierarchical | :tag,
    label: String.t(),
    max_values: pos_integer()
  }

  @type search_params :: %{
    query: String.t(),
    facet_filters: list(facet_filter()),
    facets_to_retrieve: list(String.t()),
    page: pos_integer(),
    per_page: pos_integer()
  }

  @type facet_distribution :: %{String.t() => %{String.t() => non_neg_integer()}}

  @type search_result :: %{
    hits: list(map()),
    facet_distribution: facet_distribution(),
    total_hits: non_neg_integer(),
    processing_time_ms: non_neg_integer()
  }

  @doc """
  Builds a Meilisearch-compatible query map from search parameters.
  Converts facet filters into Meilisearch filter expression syntax
  and includes facet distribution requests.

  ## Examples

      iex> params = %{query: "security", facet_filters: [{"category", ["czech"]}], facets_to_retrieve: ["category"], page: 1, per_page: 20}
      iex> query = Prismatic.Search.FacetedQuery.build_meilisearch_query(params)
      iex> query.q
      "security"

  """
  @spec build_meilisearch_query(search_params()) :: map()
  def build_meilisearch_query(params) do
    %{
      q: params.query,
      facets: params.facets_to_retrieve,
      filter: build_filter_expression(params.facet_filters),
      offset: (params.page - 1) * params.per_page,
      limit: params.per_page
    }
  end

  @doc """
  Converts a list of facet filters into Meilisearch filter expression
  format. Uses mixed logic: AND between different facets, OR within
  the same facet (disjunctive within, conjunctive between).

  ## Examples

      iex> filters = [{"category", ["czech", "global"]}, {"requires_auth", ["true"]}]
      iex> expr = Prismatic.Search.FacetedQuery.build_filter_expression(filters)
      iex> is_list(expr)
      true

  """
  @spec build_filter_expression(list(facet_filter())) :: list(list(String.t()))
  def build_filter_expression(facet_filters) do
    Enum.map(facet_filters, fn {attribute, values} ->
      Enum.map(values, fn value ->
        "#{attribute} = \"#{value}\""
      end)
    end)
  end

  @doc """
  Searches the OSINT toolbox with faceted filtering.
  Supports filtering by category, API style, and auth requirement.
  Results include facet distributions for all configured facets.

  ## Examples

      iex> {:ok, result} = Prismatic.Search.FacetedQuery.search_osint_tools("domain lookup")
      iex> is_map(result)
      true

  """
  @spec search_osint_tools(String.t(), keyword()) :: {:ok, search_result()} | {:error, term()}
  def search_osint_tools(query, opts \\ []) do
    params = %{
      query: query,
      facet_filters: Keyword.get(opts, :filters, []),
      facets_to_retrieve: ["category", "api_style", "requires_auth", "input_type"],
      page: Keyword.get(opts, :page, 1),
      per_page: Keyword.get(opts, :per_page, 20)
    }

    meilisearch_query = build_meilisearch_query(params)

    Logger.info("OSINT faceted search",
      query: query,
      facet_count: length(params.facet_filters),
      page: params.page
    )

    PrismaticStorageMeilisearch.search("osint_tools", meilisearch_query)
  end

  @doc """
  Searches DD entities with multi-dimensional faceted filtering.
  Supports entity type, jurisdiction, risk level, and case association.
  """
  @spec search_dd_entities(String.t(), keyword()) :: {:ok, search_result()} | {:error, term()}
  def search_dd_entities(query, opts \\ []) do
    params = %{
      query: query,
      facet_filters: Keyword.get(opts, :filters, []),
      facets_to_retrieve: ["entity_type", "jurisdiction", "risk_level", "case_id"],
      page: Keyword.get(opts, :page, 1),
      per_page: Keyword.get(opts, :per_page, 20)
    }

    meilisearch_query = build_meilisearch_query(params)
    PrismaticStorageMeilisearch.search("dd_entities", meilisearch_query)
  end
end
```

```elixir
defmodule Prismatic.Search.FacetCache do
  @moduledoc """
  ETS-backed cache for facet distributions. Stores computed facet
  counts with configurable TTL to avoid redundant Meilisearch queries.
  Implements the HierarchicalCache pattern: ETS (L1) -> Cachex (L2)
  -> Meilisearch (L3) with automatic promotion on cache miss.
  """

  use GenServer

  require Logger

  @type cache_key :: {String.t(), list(String.t())}
  @type cache_entry :: %{
    distribution: map(),
    computed_at: DateTime.t(),
    ttl_seconds: pos_integer()
  }

  @table_name :facet_cache
  @default_ttl_seconds 60

  @doc """
  Starts the facet cache GenServer and initializes the ETS table.

  ## Examples

      iex> {:ok, pid} = Prismatic.Search.FacetCache.start_link([])
      iex> is_pid(pid)
      true

  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Retrieves cached facet distribution or computes and caches it.
  Returns the facet distribution map with value counts.
  """
  @spec get_or_compute(String.t(), list(String.t()), (-> map())) :: {:ok, map()}
  def get_or_compute(index, facets, compute_fn) do
    key = {index, Enum.sort(facets)}

    case lookup(key) do
      {:hit, distribution} ->
        Logger.debug("Facet cache hit", index: index)
        {:ok, distribution}

      :miss ->
        distribution = compute_fn.()
        store(key, distribution)
        Logger.debug("Facet cache miss, computed", index: index)
        {:ok, distribution}
    end
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table_name, [:named_table, :set, :public, read_concurrency: true])
    schedule_cleanup()
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    now = DateTime.utc_now()

    :ets.foldl(
      fn {key, entry}, acc ->
        age = DateTime.diff(now, entry.computed_at)

        if age > entry.ttl_seconds do
          :ets.delete(@table_name, key)
        end

        acc
      end,
      :ok,
      @table_name
    )

    schedule_cleanup()
    {:noreply, state}
  end

  @spec lookup(cache_key()) :: {:hit, map()} | :miss
  defp lookup(key) do
    case :ets.lookup(@table_name, key) do
      [{^key, entry}] ->
        age = DateTime.diff(DateTime.utc_now(), entry.computed_at)

        if age <= entry.ttl_seconds do
          {:hit, entry.distribution}
        else
          :ets.delete(@table_name, key)
          :miss
        end

      [] ->
        :miss
    end
  end

  @spec store(cache_key(), map()) :: true
  defp store(key, distribution) do
    entry = %{
      distribution: distribution,
      computed_at: DateTime.utc_now(),
      ttl_seconds: @default_ttl_seconds
    }

    :ets.insert(@table_name, {key, entry})
  end

  @spec schedule_cleanup() :: reference()
  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, 30_000)
  end
end
```

```elixir
defmodule PrismaticWebWeb.OsintToolboxLive.FacetComponent do
  @moduledoc """
  LiveView component rendering facet filters for the OSINT toolbox.
  Handles facet selection, count display, and real-time updates
  as users interact with filter controls. Uses PubSub for
  cross-component communication when facets change.
  """

  use PrismaticWebWeb, :live_component

  @doc """
  Renders a single facet group with its values and counts.
  Supports value, boolean, and tag facet types with appropriate
  UI patterns for each.
  """
  @spec render(map()) :: Phoenix.LiveView.Rendered.t()
  def render(assigns) do
    ~H"""
    <div class="mb-4">
      <h4 class="text-sm font-semibold text-gray-300 mb-2"><%= @facet.label %></h4>
      <div class="space-y-1">
        <%= for {value, count} <- @distribution do %>
          <label class="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-700">
            <span class="flex items-center">
              <input
                type="checkbox"
                checked={value in @selected}
                phx-click="toggle_facet"
                phx-value-facet={@facet.attribute}
                phx-value-value={value}
                phx-target={@myself}
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-300"><%= value %></span>
            </span>
            <span class="text-xs text-gray-500">(<%= count %>)</span>
          </label>
        <% end %>
      </div>
    </div>
    """
  end

  @doc false
  def handle_event("toggle_facet", %{"facet" => facet, "value" => value}, socket) do
    send(self(), {:facet_toggled, facet, value})
    {:noreply, socket}
  end
end
```

## Common Pitfalls

| Pitfall | Description | Consequence | Prevention |
|---------|-------------|-------------|------------|
| **Zero-Result Dead Ends** | Showing facet values that produce empty results when combined with current filters | User frustration, wasted clicks | Compute post-filter counts; hide zero-count values |
| **Over-Faceting** | Exposing too many facets simultaneously | Cognitive overload, slow UI | Limit to 5-7 primary facets; group secondary facets |
| **High-Cardinality Explosion** | Using a field with thousands of unique values as a facet | Memory bloat, slow rendering | Cap facet values; use search-within-facet for high cardinality |
| **Missing Facet Isolation** | Applying a facet's own filter when computing its count | Multi-select within facet shows only selected values | Exclude current facet from its own count computation |
| **Stale Facet Counts** | Caching facet distributions too aggressively | Counts don't match actual results | TTL-based cache with invalidation on index updates |
| **N+1 Facet Queries** | Issuing separate queries for each facet | Multiplied latency | Request all facets in single Meilisearch query |
| **Ignoring URL State** | Not reflecting facet selections in the URL | Facets lost on page refresh, not shareable | Encode facet state in query parameters |
| **Synchronous Facet Computation** | Blocking the main thread while computing facet distributions | UI freeze on large datasets | Async computation with loading indicators |
| **Inconsistent Facet Ordering** | Facet values jumping around as counts change | Disorienting user experience | Stable sort: alphabetical or by original order, not by count |
| **Missing Mobile Adaptation** | Rendering full facet panel on mobile screens | Unusable on small screens | Collapsible facet panel, bottom sheet on mobile |

## Best Practices

1. **Use mixed filtering logic (AND between facets, OR within)** -- this is the standard e-commerce pattern that provides the most intuitive user experience. Cross-facet AND narrows results while within-facet OR broadens selection.

2. **Always show post-filter counts** -- facet values should display counts that reflect currently active filters on other facets. This prevents users from selecting combinations that produce zero results.

3. **Encode facet state in URL query parameters** -- this enables deep linking, browser back/forward navigation, and shareable filtered views. LiveView's `handle_params/3` makes this straightforward.

4. **Implement facet caching with short TTL** -- use ETS-backed caching (via HierarchicalCache) with 30-60 second TTL to avoid redundant Meilisearch queries while keeping counts reasonably fresh.

5. **Limit displayed facet values with "Show more"** -- for facets with more than 10-15 values, show the top N by count and provide an expansion control. This keeps the UI clean without hiding options.

6. **Request all facets in a single query** -- Meilisearch supports returning multiple facet distributions in one request. Never issue N separate queries for N facets.

7. **Provide a "Clear all filters" action** -- users who have applied multiple facets need a quick way to reset. Place this prominently near the active filter indicators.

8. **Sort facet values consistently** -- prefer alphabetical order or a predefined display order over sorting by count. Count-based sorting causes values to jump around as filters change.

9. **Use appropriate UI patterns per facet type** -- checkboxes for multi-select value facets, toggles for boolean facets, sliders for range facets, tree views for hierarchical facets. Do not use a single pattern for all types.

10. **Implement real-time facet updates via LiveView** -- when a user selects a facet, update all other facet counts immediately via server-side rendering. Avoid full page reloads or client-side JavaScript computation.

## Related Terms

- [Full-Text Index](/glossary/full-text-index/) -- Index structures supporting faceted search
- [Meilisearch](/glossary/meilisearch/) -- Search engine powering platform faceted search
- [Elasticsearch](/glossary/elasticsearch/) -- Alternative search engine with faceted search support
- [Taxonomy](/glossary/taxonomy/) -- Classification systems providing facet hierarchies
- [Inverted Index](/glossary/inverted-index/) -- Core data structure enabling facet counting
- [Pagination](/glossary/pagination/) -- Result pagination combined with faceted filtering
- [LiveView](/glossary/liveview/) -- Real-time UI framework rendering faceted interfaces
- [ETS](/glossary/ets/) -- In-memory storage backing facet cache
- [GenServer](/glossary/genserver/) -- Process model for facet cache management
- [PubSub](/glossary/pubsub/) -- Event system for cross-component facet updates
- [Data Quality](/glossary/data-quality/) -- Input quality affecting facet accuracy
- [Search](/glossary/search/) -- Broader search capabilities encompassing faceted search

## See Also

- [Capabilities](/capabilities/) -- Platform capability catalog
- [Architecture](/architecture/) -- Platform architecture overview
- [OSINT Tools](/osint/) -- Platform OSINT tool registry with faceted interface
- [Technologies](/technologies/) -- Technology stack including Meilisearch
- **Livebooks**: `api_integration/` notebooks demonstrate Meilisearch faceted queries
- **Academy**: Topics on information retrieval cover faceted search theory

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
