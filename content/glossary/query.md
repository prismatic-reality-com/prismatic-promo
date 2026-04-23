+++
title = "Query"
weight = 50

[extra]
description = "A structured request for data retrieval or manipulation against a data store, search engine, or API endpoint, forming the fundamental unit of data interaction in any platform."
category = "data"
domain = "data-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["query-plan", "sequential-scan", "schema", "resolver", "ecto", "sql", "meilisearch", "storage-adapter", "index", "pagination", "caching", "ets"]
tags = ["query", "data", "sql", "ecto", "search", "database", "retrieval", "filtering", "elixir", "composable", "optimization", "dd-pipeline"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Queries are the universal interface between application logic and data stores, and Prismatic Platform abstracts them through Ecto, Meilisearch, ETS match specifications, and custom storage adapters with composable, type-safe query building."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Query", "SQL", "Ecto", "search", "glossary", "Prismatic Platform", "BEAM", "composable queries", "query optimization", "DD pipeline", "Meilisearch", "ETS match spec"]
image = "/images/sections/glossary.png"
image_alt = "Query - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "apps", "performance-testing", "storage-adapter"]
+++

## Definition

A **query** is a formal expression that specifies what data to retrieve, insert, update, or delete from a data store. Queries range from simple key-value lookups to complex multi-table joins, full-text searches with faceted filtering, and graph traversals. In the context of the Prismatic Platform, queries operate across multiple storage backends -- PostgreSQL via Ecto, Meilisearch for full-text search, ETS for in-memory lookups, and KuzuDB for graph traversals -- each with its own query language and optimization characteristics.

The concept of a query extends beyond traditional SQL. In modern platforms, a query can be an HTTP request against a REST API, a GraphQL operation, a search request against a full-text engine, or a pattern match against an ETS table. What unifies these is the intent: expressing a declarative specification of desired data that the underlying engine translates into an execution plan. The quality of a query -- its composability, safety, and performance characteristics -- directly determines the reliability and throughput of the entire application.

Prismatic Platform treats queries as first-class data structures rather than opaque strings. This structural approach enables compile-time validation, runtime composition, and systematic optimization across all storage backends. Every subsystem -- OSINT toolbox, DD pipeline, Academy, API gateway, and the Decision Engine -- relies on composable query patterns that enforce parameterization, result bounding, and explicit error handling at the type level.

## Core Concepts

| Concept | Description | Prismatic Usage |
|---------|-------------|-----------------|
| **Composability** | Queries built incrementally by layering filters, sorts, and limits onto base queries | Ecto query pipelines in DD entity retrieval, OSINT tool filtering |
| **Parameterization** | Values injected via bind variables rather than string interpolation, preventing injection | Ecto `^pin` operator enforced across all PostgreSQL queries |
| **Query Planning** | Database generates execution strategies (sequential scan, index scan, nested loop) | PostgreSQL EXPLAIN ANALYZE used for DD pipeline optimization |
| **Match Specifications** | Erlang term patterns compiled to a mini-VM for sub-microsecond ETS lookups | ToolRegistry, TopicRegistry, SourceRegistry lookups |
| **Full-Text Search** | Inverted index queries with typo tolerance, faceting, and relevance ranking | Meilisearch queries for glossary search, OSINT result filtering |
| **Graph Traversal** | Pattern-matching queries that follow relationships in graph databases | KuzuDB Cypher queries for DD entity relationship exploration |
| **Result Bounding** | Every query must specify explicit limits to prevent unbounded memory consumption | PERF doctrine enforcement: no `Repo.all` without `limit` |
| **Query Caching** | Frequently executed queries cached at ETS or Cachex layer for sub-50ms responses | HierarchicalCache (ETS -> Cachex -> external) for glossary queries |
| **Pagination** | Cursor-based or offset-based result windowing for large result sets | Keyset pagination in DD entity listings, offset pagination in API |
| **Projection** | Selecting only required fields to reduce data transfer and memory allocation | Ecto `select` maps in DD pipeline, API response shaping |

## Technical Deep Dive

### Query Lifecycle in PostgreSQL

At the database level, a query goes through several phases: parsing (syntax validation), planning (generating execution strategies), optimization (selecting the cheapest plan), and execution (fetching results). PostgreSQL's query planner considers table statistics, available indexes, join strategies, and cost estimates to produce an optimal execution plan.

The planner maintains statistics about table row counts, column value distributions, and index selectivity. These statistics are updated by `ANALYZE` (or autovacuum) and directly influence plan selection. A query against a table with stale statistics may choose a sequential scan when an index scan would be orders of magnitude faster. For Prismatic Platform's DD pipeline tables, which grow rapidly during batch fetches, ensuring fresh statistics is critical for query performance.

Join strategy selection (nested loop, hash join, merge join) depends on table sizes and available indexes. The DD entity relationship queries, which join `dd_entities` with `dd_relationships` and `dd_fetch_records`, benefit from hash joins when both tables are large and merge joins when both are pre-sorted on the join key.

### Ecto Query Composition

Ecto, Elixir's database wrapper, provides a composable query DSL that compiles to SQL at runtime. Ecto queries are data structures (not strings), which means they can be composed, extended, and inspected programmatically. This composability is central to how Prismatic Platform builds dynamic queries for OSINT tool execution, DD pipeline fetching, and Academy topic filtering.

The composition model works through Elixir's pipe operator: a base query is passed through a series of filter functions, each adding a `where`, `join`, `order_by`, or `limit` clause. This produces a single SQL statement with all conditions combined, rather than multiple round-trips. The pattern eliminates the N+1 query anti-pattern at the architectural level.

Ecto's query syntax uses two forms: keyword syntax (`from u in User, where: u.active == true`) for simple queries and expression syntax (`User |> where([u], u.active == true)`) for composable pipelines. Prismatic Platform standardizes on expression syntax for all dynamic query building, reserving keyword syntax for simple, non-composed queries in test fixtures.

### ETS Match Specifications

ETS queries use match specifications -- Erlang term patterns compiled to a small virtual machine that runs inside the ETS table's memory space. This provides sub-microsecond lookups for the platform's registries (ToolRegistry, TopicRegistry, SourceRegistry). Match specifications are more powerful than simple key lookups: they support guards (comparisons, boolean logic), variable binding, and result transformation within the ETS engine itself.

The match specification format is a list of three-element tuples: `{MatchPattern, Guards, ReturnValue}`. The pattern uses variables (`:"$1"`, `:"$2"`) that bind to elements of the stored tuple. Guards filter using Erlang guard expressions. The return value constructs the output from bound variables. This entire operation executes inside the ETS table's memory without copying intermediate results to the calling process.

For Prismatic Platform's registries, match specifications enable filtered lookups (e.g., "all OSINT tools in the Czech category that do not require authentication") in constant time relative to result set size, with only the matching entries copied to the caller.

### Meilisearch Query Model

For full-text search, Meilisearch queries support typo tolerance, faceted filtering, and relevance ranking out of the box. The query model differs fundamentally from SQL -- instead of exact matching, Meilisearch uses inverted indexes and proximity-based ranking to return results ordered by relevance.

Meilisearch queries combine a text search string with optional filter expressions, sort criteria, and facet distributions. The text search applies tokenization, typo tolerance (configurable per index), and proximity ranking. Filter expressions use a simple boolean syntax: `category = 'czech' AND requires_auth = false`. This combination enables the glossary search to provide instant, typo-tolerant results with category facets in a single query.

### KuzuDB Graph Queries

KuzuDB uses Cypher-like query syntax for graph traversals. Queries express patterns of nodes and relationships: `MATCH (e1:Entity)-[r:RELATED_TO]->(e2:Entity) WHERE e1.name = $name RETURN e2, r.type`. Variable-length path queries (`[*1..3]`) enable multi-hop relationship exploration in the DD entity graph.

Graph queries are fundamentally different from relational queries: they excel at traversing relationships but perform poorly on aggregations over large result sets. Prismatic Platform uses KuzuDB exclusively for relationship exploration and entity graph visualization, delegating aggregation and filtering to PostgreSQL.

## Usage in Prismatic Platform

### DD Pipeline Queries

The DD pipeline is the most query-intensive subsystem. Entity fetching queries retrieve records from external sources (ARES, Justice, Parliament) through the fetch/load two-phase pipeline. Each phase generates distinct query patterns:

- **Fetch phase**: HTTP queries against external APIs, parameterized with entity identifiers (ICO, name, date range). Results are stored as raw `dd_fetch_records` with TTL-based retention.
- **Load phase**: Ecto queries transform raw fetch records into normalized `dd_entities` and `dd_relationships`. These queries use `INSERT ... ON CONFLICT UPDATE` (upsert) patterns to handle incremental updates.
- **Decision Engine queries**: The scoring engine queries entities with their relationships, fetch history, and contradiction markers to compute confidence scores. These are the most complex queries in the system, joining 4-6 tables with aggregation.

### OSINT Toolbox Queries

The OSINT toolbox queries the ToolRegistry ETS table for tool metadata using match specifications. Tool execution queries are dispatched to external APIs through the adapter pattern. Execution history is stored in PostgreSQL with 90-day retention, queryable by tool slug, input parameters, and result status.

### Academy and Glossary Queries

The Academy system queries the TopicRegistry for topic metadata and the InterconnectionEngine for semantic links. Glossary queries use the HierarchicalCache pattern: ETS (sub-millisecond) -> Cachex (millisecond) -> Meilisearch (tens of milliseconds). This three-tier query strategy ensures sub-50ms response times for glossary searches while maintaining full-text search capabilities.

### API Gateway Queries

The API gateway uses introspection queries to discover available endpoints at boot time. Runtime API queries are routed through the storage adapter pattern, which translates common query formats into backend-specific operations. All API queries enforce pagination (default limit: 50, maximum: 1000) and parameterized filtering.

## Code Examples

```elixir
defmodule PrismaticStorage.Query do
  @moduledoc """
  Composable query building for Prismatic storage adapters.

  Provides type-safe, composable query construction for PostgreSQL
  (via Ecto), ETS (via match specifications), and Meilisearch
  (via search parameters). All queries enforce parameterization
  and result bounding per PERF and SEAL doctrine.

  ## Architecture

  Queries in Prismatic Platform follow a pipeline pattern:

      base_query()
      |> apply_filters(params)
      |> apply_sorting(params)
      |> apply_pagination(params)
      |> execute()

  This ensures every query path includes explicit limits and
  parameterized inputs, eliminating unbounded queries and
  injection vulnerabilities by construction.
  """

  import Ecto.Query, warn: false

  alias PrismaticDd.Schemas.EntityRecord
  alias PrismaticDd.Schemas.FetchRecord
  alias PrismaticDd.Schemas.Relationship

  @default_limit 100
  @max_limit 1_000

  @doc """
  Builds a composable query for DD entities filtered by source.

  Returns an `Ecto.Query.t()` that can be further composed with
  additional filters, sorting, or pagination before execution.

  ## Parameters

    * `source_slug` - The slug identifier of the data source (e.g., "czech-ares")

  ## Examples

      iex> query = PrismaticStorage.Query.entities_by_source("czech-ares")
      iex> is_struct(query, Ecto.Query)
      true

  """
  @spec entities_by_source(String.t()) :: Ecto.Query.t()
  def entities_by_source(source_slug) do
    from(e in EntityRecord,
      where: e.source_slug == ^source_slug,
      where: not is_nil(e.loaded_at),
      order_by: [desc: e.updated_at],
      limit: @default_limit,
      select: %{
        id: e.id,
        name: e.name,
        entity_type: e.entity_type,
        attributes: e.attributes
      }
    )
  end

  @doc """
  Builds a query for DD entities with their relationships preloaded.

  Joins entities with their relationships and fetch history to
  support the Decision Engine's scoring pipeline. Uses a single
  query with joins rather than N+1 preloads.

  ## Parameters

    * `entity_ids` - List of entity IDs to retrieve
    * `opts` - Keyword options:
      * `:include_fetch_history` - Include fetch records (default: false)
      * `:relationship_depth` - Maximum relationship hops (default: 1)

  ## Examples

      iex> query = PrismaticStorage.Query.entities_with_relationships([1, 2, 3])
      iex> is_struct(query, Ecto.Query)
      true

  """
  @spec entities_with_relationships(list(integer()), keyword()) :: Ecto.Query.t()
  def entities_with_relationships(entity_ids, opts \\ []) do
    include_history = Keyword.get(opts, :include_fetch_history, false)

    base =
      from(e in EntityRecord,
        where: e.id in ^entity_ids,
        left_join: r in Relationship,
        on: r.source_entity_id == e.id or r.target_entity_id == e.id,
        limit: @max_limit,
        select: %{entity: e, relationship: r}
      )

    if include_history do
      from([e, r] in base,
        left_join: f in FetchRecord,
        on: f.entity_id == e.id,
        select_merge: %{latest_fetch: f}
      )
    else
      base
    end
  end

  @doc """
  Searches OSINT tools in the ETS registry using match specifications.

  Compiles a match specification that runs inside the ETS table's
  memory space, providing sub-microsecond filtered lookups without
  copying non-matching entries to the calling process.

  ## Parameters

    * `category` - Tool category atom (e.g., `:czech`, `:global`, `:sanctions`)
    * `term` - Search term to match against slug or name

  ## Examples

      iex> results = PrismaticStorage.Query.search_tools(:czech, "ares")
      iex> is_list(results)
      true

  """
  @spec search_tools(atom(), String.t()) :: list(map())
  def search_tools(category, term) do
    match_spec = [
      {{:"$1", :"$2"},
       [{:andalso,
         {:==, {:map_get, :category, :"$2"}, category},
         {:orelse,
           {:==, {:map_get, :slug, :"$2"}, term},
           {:==, {:map_get, :name, :"$2"}, term}}}],
       [:"$2"]}
    ]

    :ets.select(:osint_tool_registry, match_spec)
  end

  @doc """
  Composes dynamic filters onto an existing Ecto query.

  Accepts a map of filter parameters and reduces them into
  the query using pattern matching. Unknown filter keys are
  safely ignored. All values are parameterized via Ecto's
  `^` pin operator (SEAL compliance).

  ## Parameters

    * `query` - Base `Ecto.Query.t()` to extend
    * `filters` - Map of filter key-value pairs

  ## Supported Filters

    * `:category` - Filter by category string
    * `:since` - Filter records inserted after this DateTime
    * `:entity_type` - Filter by entity type string
    * `:status` - Filter by status string
    * `:limit` - Override default result limit (capped at #{@max_limit})

  ## Examples

      iex> base = from(e in EntityRecord)
      iex> filtered = PrismaticStorage.Query.compose_filters(base, %{category: "company", limit: 50})
      iex> is_struct(filtered, Ecto.Query)
      true

  """
  @spec compose_filters(Ecto.Query.t(), map()) :: Ecto.Query.t()
  def compose_filters(query, %{} = filters) do
    Enum.reduce(filters, query, fn
      {:category, cat}, q -> where(q, [e], e.category == ^cat)
      {:since, date}, q -> where(q, [e], e.inserted_at >= ^date)
      {:entity_type, type}, q -> where(q, [e], e.entity_type == ^type)
      {:status, status}, q -> where(q, [e], e.status == ^status)
      {:limit, n}, q -> limit(q, ^min(n, @max_limit))
      _unknown, q -> q
    end)
  end

  @doc """
  Applies keyset pagination to an Ecto query.

  Uses cursor-based pagination (keyset) rather than offset-based
  pagination for consistent performance on large tables. The cursor
  is the `id` of the last seen record.

  ## Parameters

    * `query` - Base `Ecto.Query.t()` to paginate
    * `cursor` - ID of the last record from the previous page (nil for first page)
    * `page_size` - Number of records per page (capped at #{@max_limit})

  ## Examples

      iex> base = from(e in EntityRecord)
      iex> page = PrismaticStorage.Query.paginate(base, nil, 25)
      iex> is_struct(page, Ecto.Query)
      true

  """
  @spec paginate(Ecto.Query.t(), integer() | nil, pos_integer()) :: Ecto.Query.t()
  def paginate(query, nil, page_size) do
    query
    |> order_by([e], asc: e.id)
    |> limit(^min(page_size, @max_limit))
  end

  def paginate(query, cursor, page_size) do
    query
    |> where([e], e.id > ^cursor)
    |> order_by([e], asc: e.id)
    |> limit(^min(page_size, @max_limit))
  end

  @doc """
  Builds a Meilisearch query with filters and facets.

  Returns a map suitable for passing to the Meilisearch client.
  All parameters are validated and bounded.

  ## Parameters

    * `search_term` - The text to search for
    * `opts` - Keyword options:
      * `:filter` - Filter expression string (default: nil)
      * `:facets` - List of facet attributes (default: [])
      * `:limit` - Maximum results (default: 20, max: 100)
      * `:offset` - Result offset for pagination (default: 0)

  ## Examples

      iex> query = PrismaticStorage.Query.meilisearch_query("elixir", filter: "category = glossary")
      iex> query.q
      "elixir"

  """
  @spec meilisearch_query(String.t(), keyword()) :: map()
  def meilisearch_query(search_term, opts \\ []) do
    %{
      q: search_term,
      filter: Keyword.get(opts, :filter),
      facets: Keyword.get(opts, :facets, []),
      limit: min(Keyword.get(opts, :limit, 20), 100),
      offset: Keyword.get(opts, :offset, 0)
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Map.new()
  end
end
```

```elixir
defmodule PrismaticDd.Query.DecisionPipeline do
  @moduledoc """
  Specialized query module for the DD Decision Engine pipeline.

  Provides optimized queries for scoring, hypothesis evaluation,
  and contradiction detection across DD entities and their
  relationships. All queries are bounded and parameterized.
  """

  import Ecto.Query, warn: false

  alias PrismaticDd.Schemas.EntityRecord
  alias PrismaticDd.Schemas.Relationship
  alias PrismaticDd.Repo

  @doc """
  Retrieves entities with aggregated relationship counts for scoring.

  Uses a single query with subqueries to avoid N+1 patterns.
  Results are bounded to prevent memory exhaustion during
  batch scoring operations.

  ## Parameters

    * `case_id` - The DD case identifier
    * `limit` - Maximum entities to score per batch (default: 500)

  """
  @spec entities_for_scoring(String.t(), pos_integer()) :: list(map())
  def entities_for_scoring(case_id, limit \\ 500) do
    from(e in EntityRecord,
      where: e.case_id == ^case_id,
      left_join: r in subquery(
        from(r in Relationship,
          group_by: r.source_entity_id,
          select: %{
            entity_id: r.source_entity_id,
            relationship_count: count(r.id),
            contradiction_count: count(fragment(
              "CASE WHEN ? = true THEN 1 END", r.is_contradiction
            ))
          }
        )
      ),
      on: r.entity_id == e.id,
      limit: ^limit,
      select: %{
        entity: e,
        relationship_count: coalesce(r.relationship_count, 0),
        contradiction_count: coalesce(r.contradiction_count, 0)
      }
    )
    |> Repo.all()
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **String interpolation in queries** | SQL injection vulnerability (SEAL violation) | Always use Ecto's `^` pin operator or parameterized fragments |
| **Unbounded `Repo.all`** | Memory exhaustion on large tables (PERF violation) | Always include `limit` clause; enforced by PERF pre-commit hook |
| **N+1 query pattern** | Linear query count scaling (PERF violation) | Use `join` + `select` or `preload` with explicit queries |
| **Offset pagination on large tables** | Performance degrades linearly with offset | Use keyset (cursor) pagination for tables > 10k rows |
| **Missing indexes on filter columns** | Sequential scan on filtered queries | Run `EXPLAIN ANALYZE` before deploying new query patterns |
| **Stale table statistics** | Planner chooses suboptimal execution plans | Ensure autovacuum runs frequently on fast-growing DD tables |
| **ETS match spec complexity** | Difficult to debug and maintain | Extract match specs into named functions with documentation |
| **Cross-backend query assumptions** | Meilisearch relevance != SQL equality | Design query interfaces per backend, unify at the adapter level |
| **Missing query timeouts** | Single slow query blocks the connection pool | Set `:timeout` on Repo calls; use `Repo.query(..., timeout: 15_000)` |
| **Composing on nil base query** | Runtime crash in filter pipeline | Always start composition from a concrete `from()` base query |

## Best Practices

1. **Compose queries incrementally** -- build base queries and layer filters, avoiding monolithic query strings that cannot be reused or tested independently.
2. **Use parameterized queries exclusively** -- never interpolate user input into query strings; Ecto's `^` pin operator and prepared statements prevent SQL injection by design.
3. **Profile before optimizing** -- use `EXPLAIN ANALYZE` for PostgreSQL and `:ets.info/2` for ETS to understand actual query performance before adding indexes or restructuring.
4. **Limit result sets unconditionally** -- always apply reasonable limits and pagination to prevent unbounded memory consumption on large tables; this is enforced by PERF doctrine.
5. **Separate read and write paths** -- queries that read data should be clearly separated from commands that modify state, following CQRS principles where appropriate.
6. **Use keyset pagination for large tables** -- offset pagination degrades linearly; cursor-based pagination maintains constant performance regardless of page depth.
7. **Test query composition independently** -- each filter function should have unit tests that verify the generated SQL or match specification without hitting the database.
8. **Set explicit timeouts on all queries** -- a single runaway query can exhaust the connection pool; use `:timeout` option on all `Repo` calls.
9. **Cache frequently executed queries** -- use the HierarchicalCache pattern (ETS -> Cachex -> backend) for queries that are read-heavy and change infrequently.
10. **Document query performance characteristics** -- annotate complex queries with expected execution time and row counts so future maintainers understand performance expectations.

## Related Terms

- [Query Plan](@/glossary/query-plan.md) -- the execution strategy a database generates for a query
- [Sequential Scan](@/glossary/sequential-scan.md) -- a full-table scan when no index is available
- [Schema](@/glossary/schema.md) -- the structural definition that queries operate against
- [Resolver](@/glossary/resolver.md) -- the function that executes a query in GraphQL contexts
- [Storage Adapter](@/glossary/storage-adapter.md) -- the abstraction layer that translates queries to backend-specific operations
- [Meilisearch](@/glossary/meilisearch.md) -- full-text search engine used by Prismatic Platform
- [Ecto](@/glossary/ecto.md) -- Elixir database wrapper providing composable query DSL
- [ETS](@/glossary/ets.md) -- Erlang Term Storage for in-memory lookups with match specifications
- [Index](/glossary/index/) -- database structures that accelerate query execution
- [Pagination](/glossary/pagination/) -- result windowing strategies for large query results
- [Caching](@/glossary/caching.md) -- query result caching for performance optimization
- [SQL](/glossary/sql/) -- the standard language for relational database queries

## See Also

- [Storage Architecture](@/architecture/_index.md) -- how Prismatic Platform organizes its multi-backend storage
- [OSINT Toolbox](@/osint/_index.md) -- querying intelligence tools through the self-registering system
- [DD Pipeline](@/dd/_index.md) -- entity queries in the due diligence pipeline
- [Academy](@/academy/_index.md) -- topic and glossary queries in the learning platform
- [API Documentation](@/api/_index.md) -- query parameter conventions for REST endpoints

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
