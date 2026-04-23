+++
title = "Full Text Search"
weight = 50
[extra]
tags = ["glossary", "search", "meilisearch", "indexing", "information-retrieval", "text-processing", "relevance-ranking", "platform-infrastructure"]
description = "Full text search is the capability to search through the complete textual content of documents rather than just metadata or structured fields, enabling users to find information by natural language queries with relevance-ranked results."
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["meilisearch", "database", "postgresql", "ets", "api", "performance", "latency", "caching", "embedding", "knowledge-graph"]
key_concepts = ["inverted index", "tokenization", "stemming", "relevance scoring", "TF-IDF", "BM25", "fuzzy matching", "faceted search", "typo tolerance"]
use_cases = ["document search", "OSINT intelligence", "agent discovery", "glossary navigation", "command lookup", "knowledge graph querying"]
prerequisites = ["database", "api"]
complexity_level = "intermediate"
platform_relevance = "high"
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 2049
date_modified = "2026-02-23"
keywords = ["Full", "Text", "Search", "glossary", "infrastructure", "Prismatic Platform", "Meilisearch"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Full Text Search - Prismatic Platform"
+++

## Definition

Full text search (FTS) is the technique of searching through the complete textual content of a document collection, as opposed to searching only metadata, titles, or structured fields. A full text search engine builds an index of all words (or tokens) in the document collection, enabling rapid retrieval of documents that contain specific terms, phrases, or combinations of terms. Modern full text search engines add relevance ranking (returning the most relevant results first), typo tolerance (finding documents even when the query contains misspellings), faceted filtering (narrowing results by categories), and highlighting (showing where the query terms appear in the results).

Within the Prismatic Platform, full text search is a critical infrastructure component that powers search across the 115-application umbrella ecosystem. The platform integrates Meilisearch as its primary full text search engine, with PostgreSQL's built-in full text search capabilities serving as a secondary option for tightly integrated database queries. The search infrastructure indexes agent definitions, OSINT intelligence reports, glossary entries, command documentation, knowledge graph entities, and operational metrics, providing sub-50ms search responses across millions of documents.

## Overview

The need for full text search arises whenever a system contains more textual content than a user can manually browse. Simple substring matching (SQL LIKE queries) is insufficient for large document collections because it lacks relevance ranking, does not handle linguistic variations (plurals, conjugations, synonyms), and performs poorly at scale due to sequential scanning.

Full text search solves these problems through three key mechanisms. First, it builds an inverted index that maps each unique term to the list of documents containing that term, enabling O(1) lookup per term regardless of collection size. Second, it applies text processing (tokenization, stemming, stop-word removal) to normalize both documents and queries, so that a search for "running" also finds documents containing "run," "runs," and "ran." Third, it uses relevance scoring algorithms (TF-IDF, BM25, or machine learning-based rankers) to order results by how well they match the query, so the most relevant documents appear first.

The evolution of full text search mirrors the evolution of information retrieval as a discipline. Early systems (1960s-1970s) used simple boolean queries against inverted indexes. The introduction of TF-IDF scoring by Karen Sparck Jones in 1972 enabled relevance ranking. The BM25 algorithm (Robertson and Walker, 1994) improved upon TF-IDF and remains the default ranking algorithm in many modern search engines. Recent advances incorporate semantic understanding through word embeddings and transformer models, enabling search to find conceptually related documents even when the exact query terms do not appear.

The Prismatic Platform's search architecture reflects this evolution. Meilisearch provides fast, typo-tolerant search with relevance ranking for the primary search experience. PostgreSQL's tsvector/tsquery system provides SQL-integrated full text search for database queries. The platform's embedding infrastructure (via Ollama) enables semantic search that complements keyword-based full text search, finding conceptually related documents even without keyword overlap.

## Technical Details

### Inverted Index Architecture

The inverted index is the foundational data structure of full text search. For each unique term in the document collection, the index stores a posting list: the set of document identifiers containing that term, often augmented with positional information (where in the document the term appears) and frequency information (how often it appears).

For a collection of N documents containing V unique terms, the inverted index enables:
- **Term lookup**: O(1) to find all documents containing a term
- **Phrase search**: O(k) where k is the number of documents containing all phrase terms
- **Boolean queries**: O(k) per boolean operator via posting list intersection/union

### Meilisearch Integration

The Prismatic Platform integrates Meilisearch through a dedicated storage adapter:

```elixir
defmodule PrismaticStorageMeilisearch.SearchClient do
  @moduledoc """
  Full text search client for Meilisearch integration.
  Provides indexing, searching, and faceted filtering
  across the platform's document collections.
  """

  @type index_name :: String.t()
  @type document :: map()
  @type search_query :: String.t()

  @type search_opts :: [
    limit: non_neg_integer(),
    offset: non_neg_integer(),
    filter: String.t() | [String.t()],
    facets: [String.t()],
    sort: [String.t()],
    highlight_pre_tag: String.t(),
    highlight_post_tag: String.t(),
    attributes_to_highlight: [String.t()]
  ]

  @type search_result :: %{
    hits: [document()],
    total_hits: non_neg_integer(),
    processing_time_ms: non_neg_integer(),
    query: String.t(),
    facet_distribution: map()
  }

  @type index_result :: {:ok, %{task_uid: integer()}} | {:error, term()}

  @spec search(index_name(), search_query(), search_opts()) ::
    {:ok, search_result()} | {:error, term()}
  def search(index, query, opts \\ []) do
    body = build_search_body(query, opts)

    case post("/indexes/#{index}/search", body) do
      {:ok, %{status: 200, body: response}} ->
        {:ok, parse_search_response(response)}

      {:ok, %{status: status, body: error}} ->
        {:error, {:meilisearch_error, status, error}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  @spec index_documents(index_name(), [document()]) :: index_result()
  def index_documents(index, documents) when is_list(documents) do
    case post("/indexes/#{index}/documents", documents) do
      {:ok, %{status: 202, body: %{"taskUid" => uid}}} ->
        {:ok, %{task_uid: uid}}

      {:ok, %{status: status, body: error}} ->
        {:error, {:indexing_error, status, error}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  @spec configure_index(index_name(), map()) :: {:ok, map()} | {:error, term()}
  def configure_index(index, settings) do
    case patch("/indexes/#{index}/settings", settings) do
      {:ok, %{status: 202, body: response}} ->
        {:ok, response}

      {:ok, %{status: status, body: error}} ->
        {:error, {:settings_error, status, error}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  @spec build_search_body(search_query(), search_opts()) :: map()
  defp build_search_body(query, opts) do
    base = %{"q" => query}

    opts
    |> Enum.reduce(base, fn
      {:limit, v}, acc -> Map.put(acc, "limit", v)
      {:offset, v}, acc -> Map.put(acc, "offset", v)
      {:filter, v}, acc -> Map.put(acc, "filter", v)
      {:facets, v}, acc -> Map.put(acc, "facets", v)
      {:sort, v}, acc -> Map.put(acc, "sort", v)
      {:highlight_pre_tag, v}, acc -> Map.put(acc, "highlightPreTag", v)
      {:highlight_post_tag, v}, acc -> Map.put(acc, "highlightPostTag", v)
      {:attributes_to_highlight, v}, acc -> Map.put(acc, "attributesToHighlight", v)
      _, acc -> acc
    end)
  end

  @spec parse_search_response(map()) :: search_result()
  defp parse_search_response(response) do
    %{
      hits: Map.get(response, "hits", []),
      total_hits: Map.get(response, "estimatedTotalHits", 0),
      processing_time_ms: Map.get(response, "processingTimeMs", 0),
      query: Map.get(response, "query", ""),
      facet_distribution: Map.get(response, "facetDistribution", %{})
    }
  end

  @spec post(String.t(), term()) :: {:ok, map()} | {:error, term()}
  defp post(path, body) do
    url = "#{base_url()}#{path}"

    case Req.post(url, json: body, headers: auth_headers()) do
      {:ok, response} -> {:ok, %{status: response.status, body: response.body}}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec patch(String.t(), term()) :: {:ok, map()} | {:error, term()}
  defp patch(path, body) do
    url = "#{base_url()}#{path}"

    case Req.patch(url, json: body, headers: auth_headers()) do
      {:ok, response} -> {:ok, %{status: response.status, body: response.body}}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec base_url() :: String.t()
  defp base_url, do: Application.get_env(:prismatic_storage_meilisearch, :url, "http://localhost:7700")

  @spec auth_headers() :: [{String.t(), String.t()}]
  defp auth_headers do
    key = Application.get_env(:prismatic_storage_meilisearch, :api_key, "")
    [{"Authorization", "Bearer #{key}"}]
  end
end
```

### PostgreSQL Full Text Search

For queries that need to combine full text search with relational data, the platform uses PostgreSQL's built-in FTS capabilities:

```elixir
defmodule PrismaticStorage.PostgresFTS do
  @moduledoc """
  PostgreSQL full text search integration using tsvector
  and tsquery for SQL-integrated document search.
  """

  import Ecto.Query

  @type search_opts :: [
    language: String.t(),
    limit: non_neg_integer(),
    rank_function: :ts_rank | :ts_rank_cd
  ]

  @spec search(Ecto.Queryable.t(), String.t(), atom(), search_opts()) :: Ecto.Query.t()
  def search(queryable, search_term, column, opts \\ []) do
    language = Keyword.get(opts, :language, "english")
    limit_val = Keyword.get(opts, :limit, 20)

    queryable
    |> where([r], fragment(
      "to_tsvector(?, ?) @@ plainto_tsquery(?, ?)",
      ^language, field(r, ^column), ^language, ^search_term
    ))
    |> order_by([r], fragment(
      "ts_rank(to_tsvector(?, ?), plainto_tsquery(?, ?)) DESC",
      ^language, field(r, ^column), ^language, ^search_term
    ))
    |> limit(^limit_val)
  end
end
```

### Text Processing Pipeline

Both Meilisearch and PostgreSQL FTS apply a text processing pipeline to documents and queries:

1. **Tokenization**: Breaking text into individual tokens (words). Handles punctuation, whitespace, and special characters.
2. **Normalization**: Converting tokens to a canonical form (lowercasing, accent removal, Unicode normalization).
3. **Stop-word removal**: Filtering out common words ("the", "is", "at") that add noise to search results.
4. **Stemming/Lemmatization**: Reducing words to their root form ("running" becomes "run", "better" becomes "good").
5. **Index building**: Inserting processed tokens into the inverted index with document IDs, positions, and frequencies.

### Relevance Scoring

The platform uses BM25 as its primary relevance scoring algorithm. BM25 scores a document d for a query q as:

```
score(d, q) = SUM over terms t in q:
  IDF(t) * (tf(t,d) * (k1 + 1)) / (tf(t,d) + k1 * (1 - b + b * |d| / avgdl))
```

Where:
- IDF(t) is the inverse document frequency of term t
- tf(t,d) is the frequency of term t in document d
- k1 (typically 1.2) controls term frequency saturation
- b (typically 0.75) controls document length normalization
- |d| is the length of document d
- avgdl is the average document length

## Implementation

### Index Management Strategy

The Prismatic Platform maintains separate search indexes for different document types, each with optimized settings:

- **agents**: 530+ agent definitions with filterable attributes (tier, domain, status)
- **commands**: 225 command definitions with filterable attributes (category, authority)
- **glossary**: 500+ glossary entries with filterable attributes (category, difficulty)
- **osint_reports**: Intelligence reports with filterable attributes (source, confidence, date)
- **knowledge_graph**: Entity and relationship descriptions with filterable attributes (type, domain)

Each index is configured with appropriate searchable attributes (which fields to index), filterable attributes (which fields to allow filtering on), sortable attributes (which fields to allow sorting on), and ranking rules (the order in which ranking criteria are applied).

### Real-Time Index Updates

Documents are indexed in near-real-time using an event-driven architecture. When a document is created or updated, the change event propagates through the platform's PubSub system to the search indexer, which batches updates and sends them to Meilisearch. The typical indexing latency is under 500ms from document change to search availability.

### Search Quality Monitoring

The platform monitors search quality through several metrics: query latency (P50, P95, P99), zero-result rate (queries that return no results), click-through rate (percentage of searches that lead to document access), and relevance scores (distribution of top result scores). These metrics feed into the Quality Floor Guardian, which triggers alerts when search quality degrades.

## Comparison

### Meilisearch vs. Elasticsearch

| Aspect | Meilisearch | Elasticsearch |
|--------|-------------|---------------|
| Setup complexity | Minimal (single binary) | High (JVM, cluster config) |
| Typo tolerance | Built-in, configurable | Requires custom analyzers |
| Relevance tuning | Simple ranking rules | Complex query DSL |
| Memory usage | Low to moderate | High (JVM heap) |
| Scalability | Single node, federation planned | Horizontal clustering |
| Query latency | Sub-50ms typical | Sub-100ms typical |
| Best for | Developer-facing search, small-medium scale | Enterprise search, large scale |

### Full Text Search vs. SQL LIKE

| Aspect | Full Text Search | SQL LIKE |
|--------|-----------------|----------|
| Performance | O(1) per term via index | O(n) sequential scan |
| Relevance ranking | Built-in (BM25, TF-IDF) | None |
| Linguistic processing | Stemming, synonyms, typo tolerance | Exact substring match |
| Scalability | Millions of documents | Thousands of rows |
| Query expressiveness | Boolean, phrase, proximity, fuzzy | Wildcards only |

### Full Text Search vs. Semantic Search

| Aspect | Full Text Search | Semantic Search |
|--------|-----------------|-----------------|
| Matching method | Keyword/token overlap | Vector similarity |
| Handles synonyms | Limited (requires configuration) | Naturally (via embeddings) |
| Handles typos | Yes (with fuzzy matching) | Yes (embeddings are robust) |
| Precision | High for exact queries | Variable (may return tangentially related) |
| Recall | Limited to keyword matches | High for conceptual matches |
| Latency | Very low (sub-50ms) | Moderate (50-200ms with ANN) |
| Best for | Known-item search, precise queries | Exploratory search, conceptual queries |

## Best Practices

1. **Choose the right search engine for the use case.** Meilisearch excels at developer-facing search with typo tolerance. PostgreSQL FTS works well for tightly integrated database queries. Semantic search (vector databases) is best for conceptual similarity. The Prismatic Platform uses all three, selecting the appropriate engine for each use case.

2. **Configure searchable attributes carefully.** Not all document fields should be searchable. Including too many fields adds noise; including too few misses relevant content. Prioritize title, description, and primary content fields.

3. **Use faceted search for large collections.** Facets (filterable categories) help users narrow results efficiently. The platform's agent search uses facets for tier, domain, and status, reducing result sets from hundreds to manageable numbers.

4. **Implement search-as-you-type.** Users expect instant results as they type. Meilisearch's prefix search and the platform's debounced LiveView integration provide results within 50ms of each keystroke.

5. **Monitor zero-result queries.** Queries that return no results indicate content gaps or search configuration issues. Track these queries and either add the missing content or configure synonyms to redirect the queries.

6. **Batch index updates.** Indexing individual documents one at a time is inefficient. Batch updates of 100-1000 documents reduce indexing overhead by 10-100x.

7. **Use highlighting to show relevance.** Highlighting the matching terms in search results helps users quickly assess relevance without reading the entire document. Meilisearch provides built-in highlighting.

8. **Test search quality systematically.** Maintain a set of benchmark queries with expected top results. Run these benchmarks after any search configuration change to detect quality regressions.

## Common Pitfalls

1. **Indexing everything.** Including all document fields in the search index adds noise and increases index size without improving search quality. Be selective about what is searchable.

2. **Ignoring language configuration.** Full text search engines use language-specific tokenizers and stemmers. Using the wrong language configuration (or no language configuration) degrades search quality for non-English content.

3. **Not handling edge cases.** Empty queries, very long queries, queries with special characters, and queries in unexpected languages all need graceful handling. The platform validates and sanitizes all search queries before forwarding to the search engine.

4. **Neglecting index maintenance.** Search indexes can become fragmented over time, degrading performance. Schedule regular index optimization (Meilisearch handles this automatically, but PostgreSQL FTS may need explicit REINDEX operations).

5. **Over-relying on default relevance.** Default ranking rules work well for general-purpose search but may not suit domain-specific use cases. Tune ranking rules based on user feedback and click-through data.

6. **Ignoring search analytics.** Without analytics, search quality issues are invisible. Track query patterns, result quality, and user behavior to continuously improve the search experience.

7. **Synchronous indexing in request paths.** Indexing documents synchronously during user requests adds latency. Always index asynchronously using background jobs or event-driven pipelines.

## Use Cases

### OSINT Intelligence Search

The platform's 120 OSINT tools generate intelligence reports that need to be searchable across source type, entity, date range, and content. Full text search enables analysts to quickly find relevant intelligence by searching for entity names, threat indicators, or natural language descriptions. Faceted filtering by source type and confidence level narrows results to actionable intelligence.

### Agent Discovery

With 530+ agents in the platform ecosystem, users need to find the right agent for a task. Full text search across agent names, descriptions, capabilities, and domains enables natural language queries like "find agents that handle email intelligence" or "security compliance assessment." The search results include relevance-ranked agent cards with descriptions and capability summaries.

### Glossary Navigation

The platform's 500+ glossary entries form a knowledge base that users navigate through search. Full text search with typo tolerance ensures that misspelled queries still find the right entry. Cross-reference links between glossary entries create a navigable knowledge graph that complements direct search.

### Command Lookup

The 225 AIAD commands need to be discoverable by both exact name and natural language description. Full text search enables queries like "how to check quality" to find the `mix quality.gates` command, even though the query terms do not appear in the command name.

### Knowledge Graph Querying

The platform's knowledge graph contains entities and relationships that need textual search capabilities. Full text search enables finding entities by name, description, or associated metadata, complementing the graph's structural query capabilities.

## Related Concepts

Full text search connects to numerous infrastructure and data concepts in the Prismatic Platform:

- [Meilisearch](@/glossary/meilisearch.md) is the primary full text search engine used by the platform
- [PostgreSQL](@/glossary/postgresql.md) provides built-in full text search capabilities for SQL-integrated queries
- [Database](@/glossary/database.md) covers the broader data storage context where full text search operates
- [ETS](@/glossary/ets.md) provides in-memory caching for search results and frequently accessed indexes
- [API](@/glossary/api.md) is the interface through which search capabilities are exposed to clients
- [Performance](@/glossary/performance.md) is critical for search, where sub-50ms response times are the target
- [Latency](@/glossary/latency.md) is the primary metric for search quality from a user experience perspective
- [Caching](@/glossary/caching.md) is used to accelerate frequent search queries and reduce load on the search engine
- [Embedding](@/glossary/embedding.md) enables semantic search that complements keyword-based full text search
- [Knowledge Graph](@/glossary/knowledge-graph.md) provides the structured data that complements full text search

## See Also

- [OSINT](@/glossary/osint.md) for the intelligence domain where full text search is heavily used
- [Agent Registry](@/glossary/agent-registry.md) for the agent discovery use case powered by full text search
- [Stream Processing](@/glossary/stream-processing.md) for the event-driven architecture that feeds real-time index updates
- [Telemetry](@/glossary/telemetry.md) for monitoring search quality and performance metrics
- [Vector Database](@/glossary/vector-database.md) for the complementary semantic search technology

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) documentation. Contributions welcome via pull requests. Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE). [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
