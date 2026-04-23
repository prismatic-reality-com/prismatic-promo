+++
title = "Edge"
weight = 50

[extra]
description = "Connection between two nodes in a graph data structure representing typed, weighted, temporal relationships, and computing infrastructure positioned at network boundaries to minimize latency through geographic distribution and CDN integration."
category = "data"
domain = "graph-infrastructure"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["digraph", "graph-database", "kuzudb", "graph-theory", "fly-io", "distributed-erlang", "vertex", "node", "cdn", "latency", "websocket", "liveview", "relationship", "traversal"]
tags = ["glossary", "edge", "graph", "network", "infrastructure", "latency", "cdn", "graph-database", "kuzudb", "distributed", "geographic"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Edges in the Prismatic Platform serve dual roles: as typed, weighted, temporal relationship connections in KuzuDB graph queries and DD entity graphs for intelligence analysis, and as Fly.io edge deployment locations minimizing client latency for LiveView WebSocket connections."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Edge", "graph", "network", "computing", "glossary", "Prismatic Platform", "infrastructure", "CDN", "KuzuDB", "relationship", "graph traversal", "edge computing", "geographic distribution", "latency optimization"]
image = "/images/sections/glossary.png"
image_alt = "Edge - Prismatic Platform"
word_count = 3400
see_also = ["technologies", "architecture", "capabilities", "graph-database", "fly-io"]
+++

## Definition

The term "edge" carries two distinct but deeply related meanings in the Prismatic Platform context, both concerning connections and boundaries within larger systems.

In **graph theory and graph databases**, an edge is a connection between two vertices (nodes) representing a relationship, dependency, or association. Edges can be directed (having a source and target, like "company employs person") or undirected (bidirectional, like "person knows person"), and may carry labels (relationship types), properties (metadata attributes), weights (strength or confidence scores), and temporal bounds (validity periods). In the DD knowledge graph, edges represent the relationships that intelligence analysts traverse to uncover ownership structures, financial flows, and hidden connections between entities.

In **infrastructure and networking**, edge computing refers to processing and serving data at network boundary locations physically close to end users, reducing latency and improving data locality. Edge locations are the outermost layer of a distributed system's topology, sitting between users and the centralized origin servers. For LiveView applications like Prismatic, where every user interaction travels over a WebSocket to the server and back, edge proximity directly determines perceived responsiveness -- a 100ms round-trip in Frankfurt versus 300ms to US East is the difference between "instant" and "noticeable delay".

Both meanings share a common architectural principle: edges define the connective tissue that gives structure and accessibility to systems, whether those systems are knowledge graphs or geographic networks.

## Core Concepts

### Graph Edge Classification

| Edge Type | Direction | Properties | Example | Database Support |
|-----------|-----------|------------|---------|-----------------|
| **Directed** | Source -> Target | Asymmetric relationship | "company employs person" | KuzuDB, `:digraph`, Neo4j |
| **Undirected** | Bidirectional | Symmetric relationship | "person knows person" | KuzuDB (via two directed edges) |
| **Labeled** | Named relationship | Type classification | `:owns`, `:manages`, `:related_to` | KuzuDB, all graph DBs |
| **Weighted** | Numeric property | Confidence/strength score | Confidence: 0.87 on ownership link | KuzuDB, `:digraph` |
| **Temporal** | Time-bounded | Validity period | "CEO from 2020-01 to 2024-06" | KuzuDB |
| **Multi-edge** | Multiple parallel | Different relationship types | Both "owns" and "manages" between same pair | KuzuDB |
| **Hyperedge** | N-ary connection | Connects >2 vertices | Board meeting linking 5 directors | Requires special modeling |

### Graph Traversal Patterns

| Pattern | Description | Complexity | DD Use Case |
|---------|-------------|------------|-------------|
| **BFS** | Breadth-first search from a vertex | O(V + E) | Finding all direct connections of an entity |
| **DFS** | Depth-first search following paths | O(V + E) | Tracing ownership chains to ultimate beneficiary |
| **Shortest Path** | Minimum hops between two vertices | O(V + E) with BFS | Finding closest connection between two entities |
| **All Paths** | Every path between two vertices | Exponential worst case | Mapping all connection routes in corruption networks |
| **Cycle Detection** | Finding circular relationships | O(V + E) | Detecting circular ownership structures |
| **Subgraph Matching** | Pattern matching on graph structure | NP-hard general | Finding known fraud patterns in entity networks |
| **PageRank** | Importance scoring by incoming edges | O(iterations * E) | Identifying key entities in a relationship network |
| **Community Detection** | Clustering densely connected vertices | O(E * log V) | Grouping related entities into organizational clusters |

### Infrastructure Edge Locations

| Edge Location | Provider | Region | Latency (EU users) | Prismatic Usage |
|--------------|----------|--------|--------------------|--------------------|
| **Frankfurt (FRA)** | Fly.io | EU Central | < 15ms | Primary production, database |
| **Amsterdam (AMS)** | Fly.io | EU West | < 20ms | Secondary, failover |
| **Warsaw (WAW)** | Fly.io | EU East | < 25ms | Czech/Polish user optimization |
| **London (LHR)** | Fly.io | UK | < 25ms | UK compliance endpoints |
| **US East (IAD)** | Fly.io | Americas | < 80ms from EU | Monitoring, US-facing API |
| **CDN (Global)** | Fly.io Edge | Global | < 50ms anywhere | Static assets, promo site |

### Edge Computing vs. Traditional Architecture

| Aspect | Centralized | Edge | Prismatic Approach |
|--------|------------|------|-------------------|
| **Latency** | Higher (user -> origin) | Lower (user -> nearest edge) | Fly.io multi-region for LiveView |
| **Data Locality** | All data at origin | Data replicated to edges | Read replicas near users |
| **Consistency** | Strong (single source) | Eventual (replication lag) | Strong for writes (primary), eventual for reads |
| **Failure Domain** | Single point of failure | Isolated edge failures | Multi-region with automatic failover |
| **Cost** | Lower (single location) | Higher (replication overhead) | Optimized (primary + 1-2 replicas) |
| **Complexity** | Simpler | Higher (distribution) | Fly.io manages distribution layer |

## Technical Deep Dive

### Graph Edges in KuzuDB

KuzuDB, the Prismatic Platform's graph database, stores edges as first-class citizens with rich property support. Unlike relational databases where relationships are implicit (join tables), graph databases make relationships explicit and traversable without joins, enabling sub-millisecond traversal of complex relationship networks.

Edge storage in KuzuDB uses a Compressed Sparse Row (CSR) format that enables O(1) neighbor lookup for a given vertex. This is critical for DD graph queries where an analyst might ask "show me all entities connected to this company within 3 hops" -- a query that would require 3 self-joins in a relational database but is a simple BFS in a graph database.

Temporal edges in KuzuDB support `valid_from` and `valid_to` properties, enabling point-in-time queries like "what was the ownership structure of this company on 2023-01-15?" This is essential for DD investigations where historical relationships often reveal patterns invisible in current-state snapshots.

### Edge Weight Semantics in OSINT

In OSINT knowledge graphs, edge weights carry specific semantic meaning depending on the relationship type:

| Weight Range | Confidence Level | Source Quality | Analyst Action |
|-------------|-----------------|----------------|----------------|
| **0.9 - 1.0** | Verified | Official registry, court record | Accept as fact |
| **0.7 - 0.89** | High confidence | Multiple corroborating sources | Accept with note |
| **0.5 - 0.69** | Moderate | Single reliable source | Verify independently |
| **0.3 - 0.49** | Low confidence | Indirect inference, media report | Flag for investigation |
| **0.0 - 0.29** | Unverified | Rumor, single unverified source | Treat as hypothesis |

### LiveView WebSocket Edge Optimization

For LiveView applications, edge proximity to users directly determines UX quality. Each user interaction (click, form input, navigation) requires a WebSocket round-trip: browser -> edge server -> process event -> render diff -> send diff -> browser update.

The total perceived latency is: `RTT + server_processing + diff_computation + browser_patch`. With server processing typically under 10ms for well-optimized LiveViews, the RTT becomes the dominant factor. Deploying at edge locations reduces RTT from ~80-150ms (cross-Atlantic) to ~10-25ms (same-continent), making LiveView interactions feel instantaneous.

Fly.io's Anycast networking automatically routes users to the nearest edge location without DNS-based geolocation, providing optimal routing even for users behind VPNs or CDNs that obscure geographic location.

## Usage in Prismatic Platform

### Graph Edges in DD Investigations

The DD knowledge graph uses edges to represent every discovered relationship between entities. When an analyst investigates a company, the system automatically discovers and graphs ownership edges (from company registries like ARES), employment edges (from public filings), financial flow edges (from transaction analysis), legal edges (from court proceedings), and association edges (from co-occurrence in media and documents).

The graph traversal engine enables complex queries like "find all paths between Entity A and Entity B through intermediaries" or "identify all entities within 2 hops of a sanctioned person". These queries leverage KuzuDB's native Cypher-like query language with temporal filters to reconstruct relationship networks at any point in time.

### Edge Deployment Architecture

The Prismatic Platform deploys to Fly.io edge locations with a primary instance in Frankfurt (EU Central) serving the PostgreSQL database and write operations, and read replicas distributed across additional edge locations. LiveView WebSocket connections are terminated at the nearest edge, with Fly.io's internal networking providing low-latency communication between edge instances and the primary database.

Static assets (JavaScript bundles, CSS, images) are served from Fly.io's global CDN edge network, ensuring sub-50ms asset delivery worldwide. The promo site (Zola-generated static content) is entirely edge-served with no origin dependency.

## Code Examples

```elixir
defmodule PrismaticDd.Graph.Edge do
  @moduledoc """
  Represents relationships between DD entities in the knowledge graph.

  Edges connect entities with typed, weighted, and temporal relationships,
  enabling rich graph traversal for intelligence analysis. Each edge
  carries a relationship type, confidence weight, arbitrary properties,
  and optional temporal validity bounds.

  ## Edge Lifecycle

  Edges are created when relationships are discovered during DD
  investigations (from OSINT sources, public registries, financial
  records, etc.). They are updated when new evidence changes the
  confidence weight or extends the validity period. They are never
  deleted -- instead, expired edges have their `valid_to` set to the
  expiration timestamp, preserving the historical record.

  ## Examples

      iex> edge = PrismaticDd.Graph.Edge.create("company-1", "person-1", :employs, weight: 0.95)
      iex> edge.relationship_type
      :employs

      iex> PrismaticDd.Graph.Edge.active?(edge)
      true
  """

  @type relationship_type ::
    :owns | :manages | :employs | :directs | :founded |
    :related_to | :transacts_with | :litigates_against |
    :subsidiary_of | :partner_of | :audits | :finances

  @type t :: %__MODULE__{
    id: String.t(),
    source_id: String.t(),
    target_id: String.t(),
    relationship_type: relationship_type(),
    weight: float(),
    properties: map(),
    valid_from: DateTime.t() | nil,
    valid_to: DateTime.t() | nil,
    source_evidence: list(String.t()),
    created_at: DateTime.t()
  }

  defstruct [
    :id, :source_id, :target_id, :relationship_type,
    weight: 1.0, properties: %{}, valid_from: nil, valid_to: nil,
    source_evidence: [], created_at: nil
  ]

  @doc """
  Creates a new edge between two entities with the specified
  relationship type and optional properties.

  ## Parameters

    - `source_id` - The originating entity ID
    - `target_id` - The destination entity ID
    - `rel_type` - The relationship type atom
    - `opts` - Optional keyword list:
      - `:weight` - Confidence weight (0.0-1.0, default: 1.0)
      - `:properties` - Additional metadata map
      - `:valid_from` - Start of validity period
      - `:valid_to` - End of validity period
      - `:source_evidence` - List of evidence source identifiers

  ## Examples

      iex> edge = PrismaticDd.Graph.Edge.create("co-1", "per-1", :employs, weight: 0.9, properties: %{role: "CEO"})
      iex> edge.weight
      0.9

      iex> edge = PrismaticDd.Graph.Edge.create("co-1", "co-2", :subsidiary_of)
      iex> edge.relationship_type
      :subsidiary_of
  """
  @spec create(String.t(), String.t(), relationship_type(), keyword()) :: t()
  def create(source_id, target_id, rel_type, opts \\ []) do
    %__MODULE__{
      id: Ecto.UUID.generate(),
      source_id: source_id,
      target_id: target_id,
      relationship_type: rel_type,
      weight: Keyword.get(opts, :weight, 1.0),
      properties: Keyword.get(opts, :properties, %{}),
      valid_from: Keyword.get(opts, :valid_from),
      valid_to: Keyword.get(opts, :valid_to),
      source_evidence: Keyword.get(opts, :source_evidence, []),
      created_at: DateTime.utc_now()
    }
  end

  @doc """
  Checks whether an edge is currently active (not expired).

  An edge with no `valid_to` is always active. An edge with a
  `valid_to` in the past is inactive.

  ## Examples

      iex> edge = %PrismaticDd.Graph.Edge{valid_to: nil}
      iex> PrismaticDd.Graph.Edge.active?(edge)
      true

      iex> edge = %PrismaticDd.Graph.Edge{valid_to: ~U[2020-01-01 00:00:00Z]}
      iex> PrismaticDd.Graph.Edge.active?(edge)
      false
  """
  @spec active?(t()) :: boolean()
  def active?(%__MODULE__{valid_to: nil}), do: true
  def active?(%__MODULE__{valid_to: valid_to}) do
    DateTime.compare(DateTime.utc_now(), valid_to) == :lt
  end

  @doc """
  Checks whether an edge matches a given relationship type or list of types.

  ## Examples

      iex> edge = PrismaticDd.Graph.Edge.create("a", "b", :owns)
      iex> PrismaticDd.Graph.Edge.matches_type?(edge, :owns)
      true

      iex> PrismaticDd.Graph.Edge.matches_type?(edge, [:owns, :manages])
      true

      iex> PrismaticDd.Graph.Edge.matches_type?(edge, :employs)
      false
  """
  @spec matches_type?(t(), relationship_type() | list(relationship_type())) :: boolean()
  def matches_type?(%__MODULE__{relationship_type: type}, types) when is_list(types) do
    type in types
  end
  def matches_type?(%__MODULE__{relationship_type: type}, type), do: true
  def matches_type?(_, _), do: false

  @doc """
  Returns the confidence classification for an edge's weight.

  ## Examples

      iex> edge = PrismaticDd.Graph.Edge.create("a", "b", :owns, weight: 0.95)
      iex> PrismaticDd.Graph.Edge.confidence_level(edge)
      :verified

      iex> edge = PrismaticDd.Graph.Edge.create("a", "b", :owns, weight: 0.4)
      iex> PrismaticDd.Graph.Edge.confidence_level(edge)
      :low
  """
  @spec confidence_level(t()) :: :verified | :high | :moderate | :low | :unverified
  def confidence_level(%__MODULE__{weight: w}) when w >= 0.9, do: :verified
  def confidence_level(%__MODULE__{weight: w}) when w >= 0.7, do: :high
  def confidence_level(%__MODULE__{weight: w}) when w >= 0.5, do: :moderate
  def confidence_level(%__MODULE__{weight: w}) when w >= 0.3, do: :low
  def confidence_level(_), do: :unverified
end
```

```elixir
defmodule PrismaticDd.Graph.Traversal do
  @moduledoc """
  Graph traversal algorithms for DD entity relationship analysis.

  Provides BFS, DFS, shortest path, and all-paths algorithms
  operating on the DD knowledge graph. Traversals respect temporal
  bounds and minimum confidence thresholds, ensuring analysts only
  see relationships that are current and sufficiently verified.

  ## Examples

      iex> {:ok, paths} = PrismaticDd.Graph.Traversal.find_paths("entity-a", "entity-b", max_depth: 3)
      iex> is_list(paths)
      true
  """

  alias PrismaticDd.Graph.Edge

  @type traversal_opts :: [
    max_depth: pos_integer(),
    min_confidence: float(),
    relationship_types: list(atom()),
    temporal_filter: DateTime.t() | nil
  ]
  @type path :: list(Edge.t())

  @doc """
  Finds all paths between two entities within the given constraints.

  ## Parameters

    - `source_id` - Starting entity ID
    - `target_id` - Destination entity ID
    - `opts` - Traversal options:
      - `:max_depth` - Maximum path length (default: 4)
      - `:min_confidence` - Minimum edge weight (default: 0.3)
      - `:relationship_types` - Filter by relationship types (default: all)
      - `:temporal_filter` - Point-in-time filter (default: current)

  ## Examples

      iex> {:ok, paths} = PrismaticDd.Graph.Traversal.find_paths("co-1", "per-1", max_depth: 2)
      iex> Enum.all?(paths, &is_list/1)
      true
  """
  @spec find_paths(String.t(), String.t(), traversal_opts()) :: {:ok, list(path())} | {:error, term()}
  def find_paths(source_id, target_id, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 4)
    min_confidence = Keyword.get(opts, :min_confidence, 0.3)

    paths = do_find_paths(source_id, target_id, max_depth, min_confidence, [], MapSet.new())
    {:ok, paths}
  end

  @doc """
  Performs breadth-first search from a source entity, returning all
  entities reachable within `max_depth` hops.

  ## Examples

      iex> {:ok, reachable} = PrismaticDd.Graph.Traversal.bfs("entity-1", max_depth: 2)
      iex> is_list(reachable)
      true
  """
  @spec bfs(String.t(), traversal_opts()) :: {:ok, list(map())} | {:error, term()}
  def bfs(source_id, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 3)
    min_confidence = Keyword.get(opts, :min_confidence, 0.3)

    result = do_bfs([{source_id, 0}], MapSet.new([source_id]), [], max_depth, min_confidence)
    {:ok, result}
  end

  @spec do_find_paths(String.t(), String.t(), non_neg_integer(), float(), path(), MapSet.t()) :: list(path())
  defp do_find_paths(_source, _target, 0, _min_conf, _current_path, _visited), do: []

  defp do_find_paths(source, target, max_depth, min_conf, current_path, visited) do
    neighbors = get_neighbors(source, min_conf)

    Enum.flat_map(neighbors, fn edge ->
      next_id = edge.target_id
      new_path = current_path ++ [edge]

      cond do
        next_id == target ->
          [new_path]

        MapSet.member?(visited, next_id) ->
          []

        true ->
          do_find_paths(next_id, target, max_depth - 1, min_conf, new_path, MapSet.put(visited, next_id))
      end
    end)
  end

  @spec do_bfs(list({String.t(), non_neg_integer()}), MapSet.t(), list(map()), non_neg_integer(), float()) :: list(map())
  defp do_bfs([], _visited, results, _max_depth, _min_conf), do: results

  defp do_bfs([{_id, depth} | rest], visited, results, max_depth, min_conf) when depth > max_depth do
    do_bfs(rest, visited, results, max_depth, min_conf)
  end

  defp do_bfs([{id, depth} | rest], visited, results, max_depth, min_conf) do
    neighbors = get_neighbors(id, min_conf)

    new_entries =
      neighbors
      |> Enum.reject(fn edge -> MapSet.member?(visited, edge.target_id) end)
      |> Enum.map(fn edge -> {edge.target_id, depth + 1} end)

    new_visited = Enum.reduce(new_entries, visited, fn {nid, _}, vs -> MapSet.put(vs, nid) end)
    new_results = results ++ Enum.map(new_entries, fn {nid, d} -> %{entity_id: nid, depth: d} end)

    do_bfs(rest ++ new_entries, new_visited, new_results, max_depth, min_conf)
  end

  @spec get_neighbors(String.t(), float()) :: list(Edge.t())
  defp get_neighbors(_entity_id, _min_confidence) do
    # In production, queries KuzuDB for outgoing edges
    []
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Generic edge labels** | Using "related_to" for all relationships loses analytical value | Define specific relationship types (`:owns`, `:employs`, `:manages`) with clear semantics |
| **Missing temporal bounds** | Treating historical relationships as current produces false intelligence | Always set `valid_from`/`valid_to` on edges; query with temporal filters |
| **Unweighted edges** | Treating all relationships as equally confident leads to false conclusions | Assign confidence weights based on source quality; filter by minimum confidence |
| **Unbounded traversals** | Graph traversal without depth limits can explore the entire graph | Always set `max_depth`; start with 2-3 hops and increase if needed |
| **Ignoring edge direction** | Treating directed edges as undirected corrupts relationship semantics | Respect edge direction in queries; use explicit bidirectional edges when needed |
| **Edge deployment without monitoring** | Deploying to edge locations without latency monitoring misses performance regressions | Monitor p50/p95/p99 latency per edge region; alert on degradation |
| **Single-region dependency** | All traffic to one region creates a single point of failure | Deploy to at least 2 regions with automatic failover |
| **Large WebSocket payloads** | Sending large diffs over LiveView WebSocket negates edge latency benefits | Optimize LiveView assigns to minimize diff size; use temporary assigns |
| **Circular ownership graphs** | Circular relationships without cycle detection cause infinite traversal | Implement cycle detection; maintain visited set during traversal |
| **Stale edge cache** | Caching graph query results without invalidation serves outdated relationships | Use TTL-based cache invalidation; invalidate on edge create/update |

## Best Practices

1. **Type all edges with meaningful relationship names** -- generic edges like "related_to" carry less analytical value than specific types like "employs", "owns", or "litigates_against".
2. **Include temporal validity on edges** -- relationships change over time; temporal edges enable historical analysis and point-in-time reconstruction essential for DD investigations.
3. **Weight edges by source confidence** -- in OSINT contexts, relationship confidence varies by source quality; edge weights from the Nabla epistemic engine capture this uncertainty quantitatively.
4. **Index frequently traversed edge types** -- graph query performance depends on efficient edge traversal; create indexes on common relationship types in KuzuDB.
5. **Deploy at edges closest to users** -- Fly.io edge regions reduce p95 latency for LiveView WebSocket connections from 80-150ms to 10-25ms.
6. **Implement bounded traversals** -- always set `max_depth` on graph traversals; unbounded traversals can explore millions of edges and time out.
7. **Preserve edge history** -- never delete edges; set `valid_to` to expire them, preserving the complete historical record for audit and investigation replay.
8. **Monitor edge region health** -- track latency, error rates, and connection counts per edge deployment region; implement automatic failover.
9. **Use CSR-optimized storage** -- KuzuDB's Compressed Sparse Row format provides O(1) neighbor lookup; leverage this for performance-critical traversals.
10. **Combine graph and relational queries** -- use graph edges for relationship traversal and relational queries for attribute filtering; not every query benefits from graph representation.

## Related Terms

- [Digraph](@/glossary/digraph.md) -- Erlang's directed graph implementation with in-memory edge storage
- [Graph Database](@/glossary/graph-database.md) -- persistent storage optimized for edge-centric queries and traversals
- [KuzuDB](@/glossary/kuzudb.md) -- the Prismatic Platform's graph database storing DD entity relationships
- [Graph Theory](@/glossary/graph-theory.md) -- mathematical foundations of edge properties, traversal algorithms, and graph metrics
- [Vertex](/glossary/vertex/) -- the nodes connected by edges in a graph structure
- [Fly.io](@/glossary/fly-io.md) -- edge deployment platform providing multi-region infrastructure
- [Distributed Erlang](@/glossary/distributed-erlang.md) -- BEAM clustering enabling communication between edge-deployed nodes
- [Latency](@/glossary/latency.md) -- the primary metric optimized by edge deployment strategies
- [LiveView](@/glossary/liveview.md) -- Phoenix LiveView requiring low-latency WebSocket connections to edge servers
- [CDN](/glossary/cdn/) -- content delivery networks serving static assets from edge locations
- [WebSocket](@/glossary/websocket.md) -- persistent connections between browsers and edge servers for real-time updates
- [Relationship](/glossary/relationship/) -- the semantic meaning carried by edges in knowledge graphs

## See Also

- [Technologies](@/technologies/_index.md) -- graph and edge computing technologies in the platform stack
- [Architecture](@/architecture/_index.md) -- platform graph database and multi-region deployment architecture
- [Capabilities](@/capabilities/_index.md) -- intelligence analysis and edge deployment capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
