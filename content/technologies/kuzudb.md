+++
title = "KuzuDB"
weight = 34
[extra]
category = "database"
description = "Embedded graph database optimized for relationship-heavy data models and complex traversal queries"
url = "https://kuzudb.com"
version = "0.3+"
icon = "kuzu"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 927
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["KuzuDB", "Embedded", "technologies", "database", "Prismatic Platform", "Full", "PostgreSQL", "Cypher"]
tags = ["technologies", "database", "kuzudb", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "KuzuDB - Prismatic Platform"
+++

## Overview

KuzuDB is the embedded graph database used in the Prismatic Platform for modeling and querying complex relationships between entities -- companies, people, IP addresses, domains, security findings, and agent interactions. Unlike relational databases that require expensive JOIN operations for relationship traversal, KuzuDB stores relationships as first-class citizens and traverses them in constant time per hop. This architectural property makes graph queries that would require multiple nested JOINs in [PostgreSQL](/technologies/postgresql/) execute in milliseconds on KuzuDB.

The Prismatic Platform leverages KuzuDB for its OSINT intelligence graph, where entity relationships (person-owns-company, company-uses-domain, domain-resolves-to-ip) form a knowledge graph that enables deep investigative queries. KuzuDB's Cypher query language allows analysts to express complex graph patterns naturally, such as finding all entities within three hops of a suspicious domain or identifying shared infrastructure between seemingly unrelated organizations. These queries are the foundation of the platform's intelligence synthesis capabilities.

KuzuDB's embedded architecture means it runs in-process with the [Elixir](/technologies/elixir/) application via the custom `kuzu-ex` NIF library, eliminating network overhead and simplifying deployment. This is a key differentiator from external graph databases like Neo4j -- there is no separate service to manage, no network latency for queries, and the graph data lives alongside the application on the same host. The trade-off is that the graph data is local to a single node, which is acceptable for the platform's intelligence use case where graph queries are read-heavy and data is replicated from the relational source of truth.

## Key Features

- **Embedded Architecture**: In-process execution with zero network overhead, accessed through Elixir NIFs via `kuzu-ex`
- **Cypher Query Language**: Expressive graph pattern matching with `MATCH`, `WHERE`, `RETURN` syntax familiar to Neo4j users
- **Property Graphs**: Nodes and relationships carry typed properties for rich entity metadata and temporal annotations
- **Index Support**: Hash and B-tree indexes for fast lookups on node and relationship properties
- **Vectorized Execution**: Columnar storage with SIMD-optimized query processing for analytical workloads
- **ACID Transactions**: Full transactional guarantees for concurrent graph mutations
- **Schema Enforcement**: Typed node and relationship tables with enforced property constraints
- **Multi-hop Traversal**: Variable-length path queries with configurable depth limits for relationship discovery

## Platform Integration

KuzuDB models the platform's intelligence relationship graph. The `kuzu-ex` library provides an idiomatic Elixir interface to the underlying C++ engine.

```elixir
defmodule PrismaticStorage.Graph.IntelligenceGraph do
  @moduledoc """
  Graph-based intelligence queries using KuzuDB.
  Provides relationship discovery, shared infrastructure detection,
  and entity subgraph extraction for OSINT analysis.
  """
  alias KuzuEx.Connection

  @spec find_connections(String.t(), pos_integer()) :: {:ok, list()} | {:error, term()}
  def find_connections(entity_id, depth \\ 3) do
    query = """
    MATCH path = (start:Entity {id: $id})-[*1..#{depth}]-(connected:Entity)
    RETURN connected.name, connected.type,
           length(path) as distance,
           relationships(path) as rels
    ORDER BY distance
    LIMIT 100
    """

    Connection.execute(query, %{id: entity_id})
  end

  @spec find_shared_infrastructure(String.t(), String.t()) :: {:ok, list()} | {:error, term()}
  def find_shared_infrastructure(domain_a, domain_b) do
    query = """
    MATCH (a:Domain {name: $domain_a})-[:RESOLVES_TO]->(ip:IPAddress)
          <-[:RESOLVES_TO]-(b:Domain {name: $domain_b})
    RETURN ip.address, a.name, b.name
    """

    Connection.execute(query, %{domain_a: domain_a, domain_b: domain_b})
  end

  @spec build_entity_subgraph(String.t(), pos_integer()) :: {:ok, map()} | {:error, term()}
  def build_entity_subgraph(entity_id, max_depth \\ 2) do
    query = """
    MATCH path = (start:Entity {id: $id})-[r*1..#{max_depth}]-(neighbor)
    RETURN nodes(path) as nodes, relationships(path) as edges
    """

    case Connection.execute(query, %{id: entity_id}) do
      {:ok, results} -> {:ok, to_graph_structure(results)}
      error -> error
    end
  end

  defp to_graph_structure(results) do
    nodes = results |> Enum.flat_map(& &1["nodes"]) |> Enum.uniq_by(& &1["id"])
    edges = results |> Enum.flat_map(& &1["edges"]) |> Enum.uniq()
    %{nodes: nodes, edges: edges}
  end
end
```

The graph data feeds into the platform's [Three.js](/technologies/threejs/) 3D visualizations, where entity nodes and relationships are rendered as an interactive 3D graph that analysts can explore spatially.

## Architecture

KuzuDB occupies the graph storage layer in the platform's polyglot persistence architecture, complementing the relational and search engines.

| Storage Engine | Role | Data Type | Query Pattern |
|---------------|------|-----------|---------------|
| [PostgreSQL](/technologies/postgresql/) | Source of truth | Structured records | CRUD, aggregation, reporting |
| KuzuDB | Relationship graph | Entity relationships | Traversal, path finding, pattern matching |
| [Meilisearch](/technologies/meilisearch/) | Full-text search | Indexed documents | Text search, faceted filtering |
| [ETS](/technologies/ets/) | In-memory cache | Hot data | Key-value lookup, pattern matching |
| [Redis](/technologies/redis/) | Distributed cache | Session and cache data | Key-value, pub/sub |

The graph schema is defined at database creation time with typed node and relationship tables.

```elixir
defmodule PrismaticStorage.Graph.Schema do
  @moduledoc """
  KuzuDB schema definition for the intelligence graph.
  Defines node and relationship tables with typed properties.
  """

  def create_schema(conn) do
    # Node tables
    KuzuEx.Connection.execute(conn,
      "CREATE NODE TABLE Entity(id STRING, name STRING, type STRING, confidence FLOAT, PRIMARY KEY(id))")
    KuzuEx.Connection.execute(conn,
      "CREATE NODE TABLE Domain(name STRING, registrar STRING, created_at DATE, PRIMARY KEY(name))")
    KuzuEx.Connection.execute(conn,
      "CREATE NODE TABLE IPAddress(address STRING, asn INT64, country STRING, PRIMARY KEY(address))")
    KuzuEx.Connection.execute(conn,
      "CREATE NODE TABLE Company(id STRING, name STRING, jurisdiction STRING, PRIMARY KEY(id))")
    KuzuEx.Connection.execute(conn,
      "CREATE NODE TABLE Person(id STRING, name STRING, role STRING, PRIMARY KEY(id))")

    # Relationship tables
    KuzuEx.Connection.execute(conn,
      "CREATE REL TABLE RESOLVES_TO(FROM Domain TO IPAddress, first_seen DATE, last_seen DATE)")
    KuzuEx.Connection.execute(conn,
      "CREATE REL TABLE OWNS(FROM Entity TO Domain, since DATE)")
    KuzuEx.Connection.execute(conn,
      "CREATE REL TABLE ASSOCIATED_WITH(FROM Person TO Company, role STRING, since DATE)")
    KuzuEx.Connection.execute(conn,
      "CREATE REL TABLE SHARED_INFRA(FROM Domain TO Domain, via STRING)")
  end
end
```

## Performance Characteristics

KuzuDB's embedded architecture provides predictable, low-latency graph query performance.

| Query Type | Latency | Complexity | Notes |
|-----------|---------|------------|-------|
| Single-hop traversal | < 1ms | O(degree) | Direct neighbor lookup |
| 2-hop traversal | < 5ms | O(degree^2) | Friends-of-friends |
| 3-hop traversal | < 20ms | O(degree^3) | Deep relationship discovery |
| Shortest path | < 10ms | O(V + E) | BFS-based path finding |
| Shared infrastructure | < 5ms | O(degree) | Common neighbor detection |
| Subgraph extraction | < 50ms | O(V * depth) | Full neighborhood extraction |
| Bulk insert (1K nodes) | < 100ms | O(n) | Batch loading via transactions |
| Index lookup | < 0.1ms | O(1) | Hash index on primary key |

These measurements assume a graph of approximately 100K nodes and 500K relationships, which represents the typical intelligence graph size for the platform.

## Configuration

KuzuDB is configured through the platform's Elixir configuration system.

```elixir
# KuzuDB configuration in config/config.exs
config :prismatic, :kuzudb,
  database_path: Path.join(["priv", "kuzudb", "intelligence_graph"]),
  buffer_pool_size: 256 * 1024 * 1024,  # 256MB buffer pool
  max_threads: System.schedulers_online(),
  read_only: false

# Test configuration with smaller buffer
config :prismatic, :kuzudb,
  database_path: Path.join(["priv", "kuzudb", "test_graph"]),
  buffer_pool_size: 64 * 1024 * 1024,   # 64MB for testing
  max_threads: 2,
  read_only: false
```

## Best Practices

- **Use Cypher for relationship-heavy queries** -- if a query involves more than two JOINs in SQL, it likely belongs in the graph
- **Index lookup properties** -- always create indexes on properties used in `MATCH` node patterns for fast initial node lookups
- **Limit traversal depth** -- unbounded variable-length paths can be expensive; always specify a maximum depth (e.g., `*1..3`)
- **Keep [PostgreSQL](/technologies/postgresql/) as source of truth** -- use KuzuDB as a materialized graph view of relational data, not as the primary store
- **Batch graph updates** -- accumulate changes and apply them in transactions rather than issuing individual writes
- **Use parameterized queries** -- always use `$parameter` syntax rather than string interpolation to prevent Cypher injection
- **Profile expensive queries** -- use `EXPLAIN` to analyze query plans and identify optimization opportunities
- **Sync incrementally** -- update the graph from PostgreSQL change events rather than full rebuilds

## Comparison with Alternatives

| Feature | KuzuDB | Neo4j | ArangoDB | DGraph | JanusGraph |
|---------|--------|-------|----------|--------|------------|
| Architecture | Embedded | Client-server | Client-server | Distributed | Distributed |
| Query Language | Cypher | Cypher | AQL | GraphQL+ | Gremlin |
| Network Overhead | Zero (NIF) | TCP/Bolt | HTTP/TCP | gRPC | TCP |
| Deployment | In-process | Separate service | Separate service | Cluster | Cluster |
| Memory Model | Buffer pool | JVM heap | RocksDB | Badger | JVM heap |
| ACID | Full | Full | Full | Full | Eventual |
| Elixir Integration | NIF (kuzu-ex) | Bolt driver | HTTP client | gRPC client | HTTP client |
| License | MIT | GPL/Commercial | Apache 2.0 | Apache 2.0 | Apache 2.0 |

KuzuDB was chosen for its embedded architecture (zero network latency), Cypher compatibility (familiar syntax), and MIT license (no commercial restrictions). The trade-off of single-node deployment is acceptable because the intelligence graph is a materialized view of PostgreSQL data, not the source of truth.

## Related Technologies

- [PostgreSQL](/technologies/postgresql/) - Primary relational data store, source of truth for graph entities
- [Meilisearch](/technologies/meilisearch/) - Full-text search complementing graph traversal for entity discovery
- [Ecto](/technologies/ecto/) - Relational query interface for non-graph data access patterns
- [ETS](/technologies/ets/) - In-memory cache for frequently accessed graph query results
- [Elixir](/technologies/elixir/) - Host language providing the NIF interface to KuzuDB's C++ engine

## Related Apps

- [prismatic_storage_kuzudb](/apps/prismatic-storage-kuzudb/) - KuzuDB storage adapter with Elixir NIF bindings
- [prismatic_osint_sources](/apps/prismatic-osint-sources/) - Intelligence graph population and querying
- [prismatic_graph](/apps/prismatic-graph/) - Graph operations and visualization support

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)