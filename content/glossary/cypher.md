+++
title = "Cypher"
description = "A declarative graph database query language originally developed for Neo4j, now adopted by KuzuDB and other graph databases for pattern matching on property graphs."
weight = 50

[extra]
category = "database"
tags = ["cypher", "graph-database", "query-language", "neo4j", "kuzudb", "pattern-matching", "property-graph", "gql", "openCypher", "relationships"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["developers", "data-engineers", "architects", "analysts"]
related_terms = ["graph-database", "kuzudb", "neo4j", "property-graph", "sparql", "gremlin", "pattern-matching"]
key_concepts = ["pattern-matching", "match-clause", "create-clause", "merge-clause", "relationship-traversal", "variable-length-paths"]
platforms = ["neo4j", "kuzudb", "memgraph", "amazon-neptune", "beam"]
prerequisites = ["graph-theory-basics", "sql-fundamentals", "data-modeling"]
use_cases = ["social-network-analysis", "fraud-detection", "knowledge-graphs", "recommendation-engines", "osint-entity-resolution"]
complexity = "medium"
stability = "mature"
pioneer = "Andrés Taylor (Neo Technology)"
year_introduced = "2011"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1150
date_modified = "2026-02-23"
keywords = ["Cypher", "graph query language", "Neo4j", "KuzuDB", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Cypher - Prismatic Platform"
+++

## Definition and Overview

Cypher is a declarative graph query language designed for expressive and efficient querying of property graph databases. Originally created by Andres Taylor at Neo Technology (now Neo4j, Inc.) in 2011, Cypher uses ASCII-art syntax to represent graph patterns, making queries visually intuitive for developers accustomed to thinking in terms of nodes and relationships. The language has been open-sourced as openCypher and adopted by multiple graph database vendors including KuzuDB, Memgraph, Amazon Neptune (limited), and RedisGraph.

The core design principle of Cypher is pattern matching. Rather than specifying how to traverse a graph (imperative), Cypher queries describe what pattern to find (declarative). The database engine determines the optimal execution strategy, much as SQL engines optimize relational queries. A Cypher query like `MATCH (a:Person)-[:KNOWS]->(b:Person) RETURN a.name, b.name` reads naturally as "find all pairs of persons where one knows the other."

Cypher's adoption as the de facto standard for property graph querying has been formalized through the GQL (Graph Query Language) ISO standard (ISO/IEC 39075), which draws heavily from Cypher's syntax and semantics. This standardization ensures that knowledge of Cypher transfers across graph database platforms, reducing vendor lock-in and enabling polyglot graph querying architectures.

## Technical Deep Dive

### Core Syntax Elements

| Element | Syntax | Description |
|---------|--------|-------------|
| **Node** | `(variable:Label {props})` | Represents a graph node with optional label and properties |
| **Relationship** | `-[variable:TYPE {props}]->` | Directed relationship with optional type and properties |
| **Undirected** | `-[variable:TYPE]-` | Relationship without direction constraint |
| **Pattern** | `(a)-[:REL]->(b)` | Complete pattern combining nodes and relationships |
| **Variable-length** | `(a)-[:REL*1..5]->(b)` | Path of 1 to 5 relationship hops |

### Clause Reference

| Clause | Purpose | SQL Equivalent |
|--------|---------|---------------|
| `MATCH` | Find patterns in the graph | `FROM` + `JOIN` |
| `WHERE` | Filter matched patterns | `WHERE` |
| `RETURN` | Specify output columns | `SELECT` |
| `CREATE` | Insert nodes and relationships | `INSERT` |
| `MERGE` | Match or create (upsert) | `INSERT ... ON CONFLICT` |
| `DELETE` | Remove nodes and relationships | `DELETE` |
| `SET` | Update properties | `UPDATE SET` |
| `WITH` | Chain query parts (pipeline) | CTE / subquery |
| `UNWIND` | Expand list to rows | `UNNEST` / `LATERAL` |
| `ORDER BY` | Sort results | `ORDER BY` |
| `LIMIT` / `SKIP` | Pagination | `LIMIT` / `OFFSET` |
| `OPTIONAL MATCH` | Left outer join equivalent | `LEFT JOIN` |
| `UNION` | Combine result sets | `UNION` |

### Query Examples

```cypher
// Find shortest path between two entities
MATCH path = shortestPath(
  (a:Entity {name: 'Company A'})-[*..6]-(b:Entity {name: 'Person B'})
)
RETURN path, length(path) AS hops

// Aggregate relationship counts by type
MATCH (e:Entity)-[r]->(target)
WHERE e.source = 'czech_registry'
RETURN type(r) AS relationship_type,
       count(r) AS count,
       collect(DISTINCT target.entity_type) AS target_types
ORDER BY count DESC

// Variable-length path with filtering
MATCH (company:Entity {entity_type: 'company'})
      -[:HAS_DIRECTOR*1..3]->(person:Entity {entity_type: 'person'})
WHERE company.country = 'CZ'
RETURN company.name, person.name,
       length(shortestPath((company)-[*]-(person))) AS distance

// MERGE for idempotent entity creation
MERGE (e:Entity {external_id: $external_id})
ON CREATE SET e.name = $name, e.created_at = datetime()
ON MATCH SET e.updated_at = datetime()
RETURN e
```

## Architecture and Implementation

Cypher query execution follows a pipeline architecture: parsing produces an abstract syntax tree (AST), semantic analysis resolves variable bindings and validates label/relationship types, the query planner generates a logical plan, the optimizer selects physical operators and access methods, and the executor runs the plan against the storage engine.

The pattern matching engine is the heart of Cypher execution. For each `MATCH` clause, the engine must find all subgraph isomorphisms in the database that match the specified pattern. This is computationally equivalent to subgraph isomorphism testing (NP-complete in general), but practical query plans exploit indexes on node labels and relationship types, property value indexes, and join ordering heuristics to achieve acceptable performance on real-world graphs.

Graph databases use specialized storage formats optimized for relationship traversal. Unlike relational databases that require expensive joins, graph databases store relationships as direct pointers between nodes, enabling constant-time relationship traversal regardless of graph size. This "index-free adjacency" property is what makes graph databases efficient for deep traversals.

## Usage in Prismatic Platform

The Prismatic Platform integrates Cypher through the KuzuDB storage adapter, using graph queries for OSINT entity resolution, relationship discovery, and network analysis in the DD (Due Diligence) pipeline.

```elixir
defmodule PrismaticStorageKuzu.CypherQuery do
  @moduledoc """
  Cypher query builder and executor for KuzuDB integration.
  Used by the DD pipeline for entity relationship discovery
  and the OSINT toolbox for network analysis.
  """

  alias PrismaticStorageKuzu.Connection

  @type query_result :: {:ok, list(map())} | {:error, term()}

  @spec find_entity_network(String.t(), pos_integer()) :: query_result()
  def find_entity_network(entity_id, max_depth \\ 3) do
    cypher = """
    MATCH path = (source:Entity {id: $entity_id})-[*1..#{max_depth}]-(connected)
    RETURN connected.id AS id,
           connected.name AS name,
           connected.entity_type AS type,
           length(path) AS distance,
           [r IN relationships(path) | type(r)] AS relationship_chain
    ORDER BY distance ASC
    """

    Connection.execute(cypher, %{entity_id: entity_id})
  end

  @spec find_shortest_path(String.t(), String.t()) :: query_result()
  def find_shortest_path(from_id, to_id) do
    cypher = """
    MATCH path = shortestPath(
      (a:Entity {id: $from_id})-[*..10]-(b:Entity {id: $to_id})
    )
    RETURN [n IN nodes(path) | {id: n.id, name: n.name, type: n.entity_type}] AS nodes,
           [r IN relationships(path) | {type: type(r), properties: properties(r)}] AS edges,
           length(path) AS hops
    """

    Connection.execute(cypher, %{from_id: from_id, to_id: to_id})
  end

  @spec upsert_entity(map()) :: query_result()
  def upsert_entity(entity) do
    cypher = """
    MERGE (e:Entity {external_id: $external_id})
    ON CREATE SET e.name = $name,
                  e.entity_type = $entity_type,
                  e.source = $source,
                  e.created_at = $now
    ON MATCH SET e.name = $name,
                 e.updated_at = $now
    RETURN e.external_id AS id, e.name AS name
    """

    params = Map.put(entity, :now, DateTime.utc_now() |> DateTime.to_iso8601())
    Connection.execute(cypher, params)
  end
end
```

The DD pipeline's entity resolution process uses Cypher extensively for merging entities from multiple Czech registry sources, detecting duplicate entries through property similarity, and building relationship networks that reveal corporate ownership structures, board memberships, and beneficial ownership chains.

## Cross-References

- [Graph Database](/glossary/graph-database/) -- Database model Cypher queries against
- [KuzuDB](/glossary/kuzudb/) -- Embedded graph database used by the platform
- **Property Graph** -- Data model underlying Cypher
- **SPARQL** -- Alternative graph query language for RDF
- **Full-Text Index** -- Text search complementing graph queries
- **Livebooks**: `storage_data/` notebooks demonstrate interactive Cypher querying
- **Academy**: Topics referencing entity relationship analysis use Cypher examples

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
