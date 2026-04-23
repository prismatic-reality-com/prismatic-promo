+++
title = "Graph Database"
weight = 50
[extra]
tags = ["glossary", "database", "graph", "kuzudb", "storage", "data-modeling", "relationships", "osint"]
description = "A graph database is a storage system that uses graph structures with nodes, edges, and properties to represent and query data, enabling efficient traversal of complex relationships -- foundational to the Prismatic Platform's entity resolution, OSINT correlation, and knowledge graph capabilities via KuzuDB."
category = "data"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["kuzudb", "knowledge-graph", "entity-resolution", "graph-theory", "polyglot-persistence", "postgresql", "ets", "entity-graph", "osint", "cypher"]
platforms = ["prismatic-platform", "kuzudb"]
audience = ["engineers", "data-architects", "intelligence-analysts"]
prerequisite_knowledge = ["databases", "data-modeling", "graph-theory"]
word_count = 1759
date_modified = "2026-02-23"
keywords = ["Graph", "Database", "Prismatic", "Platforms", "OSINT", "KuzuDB", "glossary", "data", "Prismatic Platform", "Cypher"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Graph Database - Prismatic Platform"
+++

## Definition

A graph database is a database management system that uses graph structures -- nodes (vertices), edges (relationships), and properties (key-value pairs attached to nodes and edges) -- as its fundamental data model for storing, mapping, and querying data. Unlike relational databases that organize data into tables with foreign key relationships resolved through joins, graph databases store relationships as first-class citizens alongside the entities they connect, enabling constant-time relationship traversal regardless of dataset size. In the Prismatic Platform, KuzuDB serves as the primary graph database engine, powering entity resolution across 120+ OSINT sources, knowledge graph construction, attack surface mapping in Prismatic Perimeter, and the belief graph infrastructure underlying the NABLA epistemic framework.

## Overview

The idea of organizing data as a graph is as old as computer science itself. Euler's 1736 solution to the Konigsberg bridge problem is often cited as the birth of graph theory, and graph-based data models appeared in early database systems like IDS (Integrated Data Store, 1964) and CODASYL network databases. However, the modern graph database movement emerged in the 2000s, driven by social networks, recommendation engines, and fraud detection systems that needed to traverse deep relationship chains efficiently.

The key insight of graph databases is that relationships are data. In a relational database, a relationship between two entities is represented implicitly through a foreign key -- a value in one table that references a primary key in another. To traverse this relationship, the database must perform a join operation, which becomes increasingly expensive as the number of relationships grows. In a graph database, the relationship is stored explicitly as an edge connecting two nodes, and traversing it is a simple pointer dereference -- O(1) regardless of the total graph size.

This distinction matters enormously for certain workloads:

- **Social networks**: "Find all friends-of-friends-of-friends who share an interest" requires 3-hop traversal, which is trivial in a graph database but requires three nested joins in SQL
- **Fraud detection**: "Find all accounts connected to this suspicious entity through any chain of transactions" requires variable-depth traversal, which is natural in graph queries but practically impossible with fixed-depth SQL joins
- **OSINT intelligence**: "Correlate all entities connected to this domain through DNS records, WHOIS data, certificate transparency logs, and business registries" requires multi-source relationship traversal -- exactly the Prismatic Platform's core use case

### Graph Database Landscape

| Database | Model | Query Language | Storage | License |
|----------|-------|---------------|---------|---------|
| **Neo4j** | Labeled Property Graph | Cypher | Native graph | AGPL/Commercial |
| **KuzuDB** | Labeled Property Graph | Cypher | Columnar | MIT |
| **Amazon Neptune** | Property Graph + RDF | Gremlin, SPARQL | Cloud-native | Proprietary |
| **ArangoDB** | Multi-model (Graph + Doc + KV) | AQL | Native | Apache 2.0 |
| **TigerGraph** | Property Graph | GSQL | Native | Commercial |
| **JanusGraph** | Property Graph | Gremlin | Pluggable (Cassandra, HBase) | Apache 2.0 |
| **DGraph** | RDF-like | DQL (GraphQL+/-) | Native | Apache 2.0 |

The Prismatic Platform chose KuzuDB for several reasons: MIT license, embeddable architecture (no separate server process), columnar storage for analytical queries, Cypher query support, and excellent Elixir integration through the `kuzu-ex` GARDEN project.

## Technical Details

### Property Graph Model

The property graph model (used by KuzuDB, Neo4j, and most modern graph databases) consists of:

**Nodes** represent entities. Each node has:
- A unique identifier
- One or more labels (types)
- Zero or more properties (key-value pairs)

**Edges** represent relationships. Each edge has:
- A unique identifier
- A type (label)
- A source node and a target node
- Zero or more properties

**Properties** are key-value pairs where keys are strings and values are typed data (strings, numbers, booleans, arrays, dates).

```
(:Person {name: "Alice", age: 30}) -[:WORKS_AT {since: 2020}]-> (:Company {name: "Acme"})
(:Person {name: "Alice"}) -[:KNOWS {since: 2018}]-> (:Person {name: "Bob"})
(:Company {name: "Acme"}) -[:REGISTERED_IN]-> (:Country {name: "Czech Republic"})
```

### Cypher Query Language

Cypher is the declarative graph query language used by KuzuDB (and originated in Neo4j). It uses ASCII art patterns to express graph traversals:

```cypher
// Find all companies connected to a person through any relationship
MATCH (p:Person {name: "Alice"})-[*1..3]-(c:Company)
RETURN c.name, c.registration_number

// Find shortest path between two entities
MATCH path = shortestPath(
  (a:Entity {id: "entity-1"})-[*]-(b:Entity {id: "entity-2"})
)
RETURN path

// OSINT correlation: find all domains connected to a suspicious IP
MATCH (ip:IPAddress {address: "192.168.1.1"})-[:RESOLVES_TO]-(d:Domain)
      -[:REGISTERED_BY]-(r:Registrant)-[:OWNS]-(other:Domain)
RETURN other.name, r.name, r.email
```

### KuzuDB Integration in Prismatic

The Prismatic Platform integrates KuzuDB through a dedicated storage adapter:

```elixir
defmodule PrismaticStorageKuzu.Adapter do
  @moduledoc """
  KuzuDB storage adapter implementing the PrismaticStorageCore
  trait for graph-based data operations.
  """

  @behaviour PrismaticStorageCore.Adapter

  alias PrismaticStorageKuzu.Connection
  alias PrismaticStorageKuzu.QueryBuilder

  @type node_data :: %{
    label: String.t(),
    properties: map()
  }

  @type edge_data :: %{
    type: String.t(),
    source_id: String.t(),
    target_id: String.t(),
    properties: map()
  }

  @type query_result :: {:ok, list(map())} | {:error, term()}

  @impl true
  @spec store(String.t(), map()) :: {:ok, String.t()} | {:error, term()}
  def store(collection, data) do
    with {:ok, conn} <- Connection.get(),
         {:ok, cypher} <- QueryBuilder.build_create(collection, data),
         {:ok, result} <- execute(conn, cypher) do
      {:ok, extract_id(result)}
    end
  end

  @impl true
  @spec query(String.t(), map()) :: query_result()
  def query(collection, filters) do
    with {:ok, conn} <- Connection.get(),
         {:ok, cypher} <- QueryBuilder.build_match(collection, filters),
         {:ok, results} <- execute(conn, cypher) do
      {:ok, Enum.map(results, &normalize_result/1)}
    end
  end

  @spec traverse(String.t(), String.t(), keyword()) :: query_result()
  def traverse(start_id, relationship_type, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 3)
    direction = Keyword.get(opts, :direction, :outgoing)

    cypher = """
    MATCH path = (start {id: $start_id})-[r:#{relationship_type}*1..#{max_depth}]-#{direction_arrow(direction)}(target)
    RETURN target, relationships(path) AS rels, length(path) AS depth
    ORDER BY depth ASC
    """

    with {:ok, conn} <- Connection.get(),
         {:ok, results} <- execute(conn, cypher, %{start_id: start_id}) do
      {:ok, Enum.map(results, &normalize_traversal/1)}
    end
  end

  @spec shortest_path(String.t(), String.t()) :: {:ok, list(map())} | {:error, :no_path}
  def shortest_path(source_id, target_id) do
    cypher = """
    MATCH path = shortestPath(
      (a {id: $source_id})-[*]-(b {id: $target_id})
    )
    RETURN nodes(path) AS nodes, relationships(path) AS edges
    """

    with {:ok, conn} <- Connection.get(),
         {:ok, [result | _]} <- execute(conn, cypher, %{source_id: source_id, target_id: target_id}) do
      {:ok, result}
    else
      {:ok, []} -> {:error, :no_path}
      error -> error
    end
  end

  defp execute(conn, cypher, params \\ %{}) do
    Connection.execute(conn, cypher, params)
  end

  defp direction_arrow(:outgoing), do: ">"
  defp direction_arrow(:incoming), do: "<"
  defp direction_arrow(:both), do: ""

  defp extract_id(%{"id" => id}), do: id
  defp normalize_result(row), do: row
  defp normalize_traversal(row), do: row
end
```

### Graph Schema for OSINT Entity Resolution

The platform's OSINT entity resolution uses a rich graph schema:

```cypher
// Node types (labels)
CREATE NODE TABLE Person (id STRING PRIMARY KEY, name STRING, email STRING, confidence FLOAT)
CREATE NODE TABLE Company (id STRING PRIMARY KEY, name STRING, ico STRING, country STRING)
CREATE NODE TABLE Domain (id STRING PRIMARY KEY, name STRING, registrar STRING, created DATE)
CREATE NODE TABLE IPAddress (id STRING PRIMARY KEY, address STRING, asn STRING, geo STRING)
CREATE NODE TABLE Certificate (id STRING PRIMARY KEY, serial STRING, issuer STRING, expiry DATE)

// Edge types (relationships)
CREATE REL TABLE OWNS (FROM Person TO Domain, since DATE, confidence FLOAT)
CREATE REL TABLE REGISTERED_BY (FROM Domain TO Person, registrar STRING)
CREATE REL TABLE RESOLVES_TO (FROM Domain TO IPAddress, first_seen DATE, last_seen DATE)
CREATE REL TABLE HAS_CERT (FROM Domain TO Certificate, valid BOOLEAN)
CREATE REL TABLE WORKS_AT (FROM Person TO Company, role STRING, since DATE)
CREATE REL TABLE SUBSIDIARY_OF (FROM Company TO Company, ownership_pct FLOAT)
```

This schema enables queries like "find all domains owned by people who work at companies that are subsidiaries of a given parent company" -- a query that would require five joins in SQL but is expressed naturally in Cypher.

## Implementation

### Polyglot Persistence Architecture

The Prismatic Platform does not use graph databases exclusively. Instead, it employs a polyglot persistence strategy where each data type is stored in the most appropriate engine:

| Engine | Use Case | Strength |
|--------|----------|----------|
| **PostgreSQL** | Transactional data, user accounts, audit logs | ACID compliance, SQL ecosystem |
| **ETS** | In-memory caches, agent state, session data | Microsecond access, no serialization |
| **KuzuDB** | Entity graphs, relationship traversal, OSINT correlation | O(1) traversal, Cypher queries |
| **Meilisearch** | Full-text search, document indexing | Sub-50ms search, typo tolerance |
| **Redis** | Pub/sub, rate limiting, ephemeral state | Speed, pub/sub, TTL expiry |

The `PrismaticStorageCore` trait system provides a unified interface across all storage backends, allowing business logic to remain storage-agnostic while each adapter optimizes for its engine's strengths.

### Graph-Powered Entity Resolution

Entity resolution -- determining whether two records from different sources refer to the same real-world entity -- is one of the most important applications of graph databases in the platform:

```elixir
defmodule Prismatic.OSINT.EntityResolver do
  @moduledoc """
  Resolves entities across multiple OSINT sources using
  graph-based similarity scoring and transitive closure.
  """

  alias PrismaticStorageKuzu.Adapter, as: GraphDB

  @type entity :: %{id: String.t(), source: String.t(), properties: map()}
  @type resolution :: %{entities: list(entity()), confidence: float(), evidence: list(String.t())}

  @similarity_threshold 0.85

  @spec resolve(entity(), list(String.t())) :: {:ok, list(resolution())} | {:error, term()}
  def resolve(seed_entity, sources) do
    with {:ok, candidates} <- find_candidates(seed_entity, sources),
         {:ok, scored} <- score_candidates(seed_entity, candidates),
         {:ok, clusters} <- cluster_by_similarity(scored) do
      resolutions =
        Enum.map(clusters, fn cluster ->
          %{
            entities: cluster.members,
            confidence: cluster.avg_score,
            evidence: cluster.evidence
          }
        end)

      {:ok, Enum.filter(resolutions, &(&1.confidence >= @similarity_threshold))}
    end
  end

  defp find_candidates(entity, _sources) do
    GraphDB.traverse(entity.id, "SIMILAR_TO", max_depth: 2, direction: :both)
  end

  defp score_candidates(seed, candidates) do
    scored =
      Enum.map(candidates, fn candidate ->
        score = compute_similarity(seed.properties, candidate)
        {candidate, score}
      end)

    {:ok, scored}
  end

  defp cluster_by_similarity(scored_candidates) do
    clusters =
      scored_candidates
      |> Enum.filter(fn {_c, score} -> score >= @similarity_threshold end)
      |> Enum.group_by(fn {c, _score} -> c.source end)
      |> Enum.map(fn {_source, items} ->
        members = Enum.map(items, fn {c, _s} -> c end)
        scores = Enum.map(items, fn {_c, s} -> s end)
        %{members: members, avg_score: Enum.sum(scores) / length(scores), evidence: []}
      end)

    {:ok, clusters}
  end

  defp compute_similarity(props_a, candidate) do
    shared_keys = MapSet.intersection(
      MapSet.new(Map.keys(props_a)),
      MapSet.new(Map.keys(candidate))
    )

    if MapSet.size(shared_keys) == 0 do
      0.0
    else
      matches =
        shared_keys
        |> Enum.count(fn key -> Map.get(props_a, key) == Map.get(candidate, key) end)

      matches / MapSet.size(shared_keys)
    end
  end
end
```

### Attack Surface Mapping

The Prismatic Perimeter EASM module uses graph databases to map organizational attack surfaces:

```cypher
// Discover all assets connected to a target domain
MATCH (root:Domain {name: "example.com"})
OPTIONAL MATCH (root)-[:RESOLVES_TO]->(ip:IPAddress)
OPTIONAL MATCH (root)-[:HAS_CERT]->(cert:Certificate)
OPTIONAL MATCH (root)<-[:SUBDOMAIN_OF]-(sub:Domain)
OPTIONAL MATCH (ip)<-[:HOSTED_ON]-(service:Service)
RETURN root, collect(DISTINCT ip) AS ips,
       collect(DISTINCT cert) AS certs,
       collect(DISTINCT sub) AS subdomains,
       collect(DISTINCT service) AS services
```

This single query discovers the entire attack surface connected to a domain, traversing DNS records, certificates, subdomains, and services in a single graph operation.

## Comparison

### Graph Database vs. Relational Database

| Aspect | Relational (PostgreSQL) | Graph (KuzuDB) |
|--------|------------------------|-----------------|
| **Data Model** | Tables, rows, columns | Nodes, edges, properties |
| **Relationships** | Foreign keys + JOINs | First-class edges |
| **Traversal Cost** | O(n) per JOIN | O(1) per hop |
| **Deep Traversals** | Exponentially expensive | Linear cost |
| **Schema** | Rigid, migration-based | Flexible, label-based |
| **ACID** | Full ACID | Varies by implementation |
| **Best For** | Transactional, tabular data | Connected, relationship-heavy data |
| **Query Language** | SQL | Cypher, Gremlin, SPARQL |

### Graph Database vs. Document Database

Document databases (MongoDB, CouchDB) store denormalized documents without explicit relationships. While this simplifies reads for self-contained entities, it makes relationship traversal difficult -- you must either denormalize relationships into documents (causing update anomalies) or perform application-level joins.

### Graph Database vs. Key-Value Store

Key-value stores (Redis, ETS) provide the fastest possible single-key lookups but have no concept of relationships. They are excellent for caches and session state but entirely unsuitable for relationship-heavy workloads.

## Best Practices

### 1. Model Relationships, Not Just Entities

The primary value of a graph database is in its relationships. If your data model has few or shallow relationships, a relational database may be more appropriate. Graph databases shine when relationships are dense, deep, or variable.

### 2. Use Specific Relationship Types

Avoid generic relationship types like `:RELATED_TO`. Use specific types like `:OWNS`, `:WORKS_AT`, `:RESOLVES_TO` that carry semantic meaning. This enables more precise and efficient queries.

### 3. Index Node Properties Used in Lookups

While traversal is O(1), finding the starting node still requires an index lookup. Create indexes on properties used in `MATCH` patterns (especially IDs, names, and identifiers).

### 4. Limit Traversal Depth

Unbounded traversals (`-[*]->`) can explore the entire graph. Always specify a maximum depth (`-[*1..5]->`) to prevent runaway queries.

### 5. Denormalize Selectively for Performance

Store frequently accessed aggregate properties directly on nodes rather than computing them from edges every time. For example, store a `connection_count` property on a `Person` node rather than counting edges at query time.

### 6. Use the Right Database for the Right Job

Graph databases are not universal replacements for relational databases. Use polyglot persistence: PostgreSQL for transactional data, KuzuDB for relationship traversal, ETS for caching, and Meilisearch for full-text search.

## Common Pitfalls

### Super Nodes

A "super node" is a node with an extremely high number of edges (e.g., a popular domain with millions of DNS records). Traversing through super nodes can be expensive even in graph databases. Solutions include edge partitioning, materialized aggregations, and query-time filtering.

### Lack of Schema Enforcement

Graph databases' schema flexibility can lead to inconsistent data if not managed carefully. Use node labels and edge types consistently, and implement validation at the application layer.

### Over-Reliance on Graph for Everything

Not all data belongs in a graph. Tabular data (financial transactions, audit logs, user sessions) is typically better served by relational databases. Use graph databases where relationships are the primary query dimension.

### Neglecting Graph Maintenance

Graphs accumulate stale edges and orphan nodes over time. Implement regular graph cleanup routines that remove outdated relationships and merge duplicate nodes.

### Ignoring Query Optimization

Just because traversal is O(1) per hop does not mean all queries are fast. Complex pattern matching with multiple unbounded paths can still be expensive. Use `EXPLAIN` and `PROFILE` to analyze query performance.

## Use Cases

### OSINT Entity Correlation

The Prismatic Platform's core intelligence use case: correlating entities (persons, companies, domains, IP addresses) across 120+ OSINT sources. The graph structure naturally represents the web of relationships between these entities, and Cypher queries enable analysts to discover hidden connections that would be invisible in tabular data.

### Prismatic Perimeter Attack Surface Mapping

The EASM module maps organizational attack surfaces as graphs: domains connect to IPs, which connect to services, which connect to vulnerabilities, which connect to compliance requirements. This graph structure enables questions like "what is the blast radius if this server is compromised?" to be answered with a single traversal query.

### Knowledge Graph Construction

The platform builds knowledge graphs that represent accumulated intelligence about entities, events, and relationships. These graphs grow over time as new OSINT sources are integrated, with entity resolution ensuring that new information is connected to existing knowledge rather than creating duplicates.

### Belief Graph for NABLA Axioms

The NABLA epistemic framework uses a directed acyclic graph (DAG) to represent beliefs, evidence, and logical relationships. The Trinity Gate verifies structural consistency of this belief graph as one of its three verification channels.

### Agent Dependency Resolution

The 530+ AIAD agents have complex dependency relationships. The agent orchestration system uses graph traversal to determine execution order, identify circular dependencies, and optimize parallel execution.

## Related Concepts

Graph databases connect to numerous aspects of the Prismatic Platform:

- [KuzuDB](@/glossary/kuzudb.md) is the specific graph database engine used by the platform, chosen for its embeddable architecture and MIT license
- [Knowledge Graph](@/glossary/knowledge-graph.md) is the primary data structure built and queried using graph database technology
- [Entity Resolution](@/glossary/entity-resolution.md) uses graph traversal to identify matching entities across disparate OSINT sources
- [Graph Theory](@/glossary/graph-theory.md) provides the mathematical foundations for graph database operations and algorithms
- [Polyglot Persistence](@/glossary/polyglot-persistence.md) is the architectural pattern that places graph databases alongside relational and other storage engines
- [PostgreSQL](@/glossary/postgresql.md) serves as the relational database counterpart to KuzuDB in the polyglot persistence architecture
- [ETS](@/glossary/ets.md) provides in-memory graph-adjacent caching for frequently accessed nodes and traversal results
- [Entity Graph](@/glossary/entity-graph.md) describes the specific graph schema used for OSINT entity modeling
- [OSINT](@/glossary/osint.md) is the primary intelligence domain that graph database capabilities serve
- [Belief Graph](@/glossary/belief-graph.md) uses directed acyclic graph structures verified by the Trinity Gate

## See Also

- [Kuzu DB](@/glossary/kuzu-db.md) -- alternative reference for the platform's graph database engine
- [Full Text Search](@/glossary/full-text-search.md) -- complementary search capability provided by Meilisearch
- [Database](@/glossary/database.md) -- general database concepts and the platform's storage philosophy
- [Relational Database](@/glossary/relational-database.md) -- the traditional alternative to graph databases for structured data
- [Vector Database](@/glossary/vector-database.md) -- semantic similarity search complementing graph traversal

---

**Connect & Contribute**: Built by [Tomas Korcak (korczis)](https://github.com/korczis) as part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE). Contributions welcome via [GitHub Issues](https://github.com/korczis/prismatic-platform/issues) and [Pull Requests](https://github.com/korczis/prismatic-platform/pulls).
