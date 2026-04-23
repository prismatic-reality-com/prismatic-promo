+++
title = "KuzuDB"
weight = 50
[extra]
tags = ["glossary", "database", "graph-database", "storage", "kuzu", "cypher", "osint"]
description = "KuzuDB is a high-performance, embeddable graph database management system designed for analytical graph workloads, serving as the primary graph storage engine in the Prismatic Platform for OSINT entity intelligence, dependency analysis, attack surface mapping, and knowledge graph operations."
category = "database"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["graph-database", "knowledge-graph", "entity-graph", "postgresql", "ets", "meilisearch", "osint", "easm", "cypher", "polyglot-persistence"]
version = "2.0.0"
date_created = "2026-02-22"
last_updated = "2026-02-22"
domain = "storage"
platform_relevance = "critical"
elixir_specific = true
website = "https://kuzudb.com"
word_count = 1499
date_modified = "2026-02-23"
keywords = ["KuzuDB", "Prismatic", "Platform", "OSINT", "glossary", "database", "Prismatic Platform", "Cypher"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "KuzuDB - Prismatic Platform"
+++

## Definition

KuzuDB is an embeddable, columnar graph database management system (GDBMS) optimized for analytical graph workloads. Originally developed at the University of Waterloo's Data Systems Group, KuzuDB implements the Cypher query language and uses a novel storage architecture based on columnar compression and factorized query execution to achieve high performance on graph analytical queries. Unlike client-server graph databases such as Neo4j, KuzuDB runs in-process, eliminating network overhead and simplifying deployment.

Within the Prismatic Platform, KuzuDB serves as the graph storage layer accessed through the `prismatic_storage_kuzu` adapter application. It powers OSINT entity intelligence (mapping relationships between companies, people, domains, and IP addresses), dependency graph analysis (tracking inter-application dependencies in the 115-app umbrella), attack surface mapping (modeling relationships between discovered assets in Prismatic Perimeter), and the platform's knowledge graph operations (representing the interconnected knowledge artifacts produced by 530+ AIAD agents).

## Overview

Graph databases represent data as nodes (vertices) and edges (relationships), making them natural for modeling domains where relationships are first-class citizens. Traditional relational databases can model relationships through foreign keys and join tables, but as the depth and complexity of relationship queries grow, performance degrades exponentially due to the join-heavy nature of such queries.

KuzuDB addresses this by providing:

- **Embeddable architecture**: Runs in the same process as the application, eliminating serialization and network overhead
- **Columnar storage**: Uses column-oriented storage for both node and relationship properties, enabling efficient analytical scans
- **Cypher query language**: Implements the openCypher standard, providing a well-known declarative graph query language
- **Factorized execution**: Uses factorized intermediate representations to avoid materializing redundant data during multi-join queries
- **ACID transactions**: Provides full transactional guarantees for graph mutations

### Why KuzuDB for Prismatic

The platform evaluated multiple graph databases before selecting KuzuDB:

1. **Neo4j**: Mature but requires a separate server process, adds network latency, and has licensing constraints for embedded use
2. **Amazon Neptune**: Cloud-only, introduces vendor lock-in, and requires network round-trips
3. **DGraph**: Distributed focus adds unnecessary complexity for single-node analytical workloads
4. **KuzuDB**: Embeddable, open-source (MIT), columnar storage ideal for analytical queries, Cypher support, and excellent performance on relationship-heavy workloads

The embeddable nature of KuzuDB is particularly valuable in the Elixir/OTP ecosystem, where running an external database server adds operational complexity. KuzuDB can be loaded as a NIF (Native Implemented Function) or accessed through a port, fitting naturally into the BEAM's process model.

### Historical Context in the Platform

KuzuDB integration began during Generation 12 of the platform's evolution, driven by the need for graph-based OSINT intelligence. The GARDEN legacy repository (`garden/`) contains `kuzu-ex`, an early Elixir SDK for KuzuDB that predates the current `prismatic_storage_kuzu` adapter. This legacy integration, spanning 20+ years of accumulated patterns, informed the current production implementation.

## Technical Details

### Storage Architecture

KuzuDB's storage architecture uses a novel approach that separates node tables from relationship tables, each stored in columnar format:

```
Node Table: Company
+-- Column: id (INT64, primary key)
+-- Column: name (STRING, dictionary-compressed)
+-- Column: jurisdiction (STRING, dictionary-compressed)
+-- Column: risk_score (FLOAT64)
+-- Column: discovered_at (TIMESTAMP)

Relationship Table: OWNS
+-- Column: source_id (INT64, references Person.id)
+-- Column: target_id (INT64, references Company.id)
+-- Column: ownership_pct (FLOAT64)
+-- Column: confidence (FLOAT64)
+-- Column: effective_date (TIMESTAMP)
```

### Elixir Integration

The Prismatic Platform accesses KuzuDB through a dedicated storage adapter that follows the platform's adapter pattern:

```elixir
defmodule PrismaticStorageKuzu do
  @moduledoc """
  KuzuDB storage adapter for the Prismatic Platform. Provides
  graph-based storage with Cypher query support for OSINT entity
  intelligence, dependency analysis, and knowledge graph operations.

  Implements the PrismaticStorageCore.Adapter behaviour for
  consistent integration with the platform's polyglot persistence layer.
  """

  @behaviour PrismaticStorageCore.Adapter

  alias PrismaticStorageKuzu.{Connection, Schema, QueryBuilder}

  @type query_result :: {:ok, [[term()]]} | {:error, atom()}
  @type node_id :: String.t() | integer()

  @impl PrismaticStorageCore.Adapter
  def start_link(opts) do
    db_path = Keyword.fetch!(opts, :path)
    Connection.start_link(db_path: db_path)
  end

  @impl PrismaticStorageCore.Adapter
  def health_check do
    case Connection.execute("RETURN 1") do
      {:ok, [[1]]} -> {:ok, :healthy}
      _ -> {:error, :unhealthy}
    end
  end

  @spec create_node(atom(), map()) :: {:ok, node_id()} | {:error, atom()}
  def create_node(label, properties) when is_atom(label) and is_map(properties) do
    {cypher, params} = QueryBuilder.insert_node(label, properties)
    Connection.execute(cypher, params)
  end

  @spec create_relationship(atom(), node_id(), node_id(), map()) ::
          {:ok, :created} | {:error, atom()}
  def create_relationship(type, source_id, target_id, properties \\ %{}) do
    {cypher, params} = QueryBuilder.insert_relationship(type, source_id, target_id, properties)

    case Connection.execute(cypher, params) do
      {:ok, _} -> {:ok, :created}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec query(String.t(), map()) :: query_result()
  def query(cypher, params \\ %{}) do
    Connection.execute(cypher, params)
  end

  @spec traverse(node_id(), keyword()) :: {:ok, [map()]} | {:error, atom()}
  def traverse(start_node, opts \\ []) do
    direction = Keyword.get(opts, :direction, :both)
    max_depth = Keyword.get(opts, :max_depth, 3)
    rel_types = Keyword.get(opts, :relationship_types, [])
    min_confidence = Keyword.get(opts, :min_confidence, 0.0)

    {cypher, params} =
      QueryBuilder.traversal(start_node, direction, max_depth, rel_types, min_confidence)

    Connection.execute(cypher, params)
  end
end
```

### OSINT Entity Graph Schema

The platform defines a rich graph schema for OSINT intelligence:

```elixir
defmodule PrismaticStorageKuzu.Schema.OSINT do
  @moduledoc """
  KuzuDB schema definitions for OSINT entity intelligence.
  Defines node types (entities) and relationship types (connections)
  for the platform's intelligence graph.
  """

  @node_schemas [
    {:Person, [
      {:id, :string, primary_key: true},
      {:name, :string},
      {:date_of_birth, :string},
      {:nationality, :string},
      {:risk_level, :string},
      {:pep_status, :boolean},
      {:sanctions_match, :boolean},
      {:discovered_at, :timestamp},
      {:confidence, :float64}
    ]},
    {:Company, [
      {:id, :string, primary_key: true},
      {:name, :string},
      {:registration_number, :string},
      {:jurisdiction, :string},
      {:status, :string},
      {:risk_score, :float64},
      {:discovered_at, :timestamp},
      {:source, :string}
    ]},
    {:Domain, [
      {:id, :string, primary_key: true},
      {:name, :string},
      {:registrar, :string},
      {:created_date, :timestamp},
      {:expiry_date, :timestamp},
      {:dns_records, :string},
      {:ssl_grade, :string}
    ]},
    {:IPAddress, [
      {:id, :string, primary_key: true},
      {:address, :string},
      {:version, :int32},
      {:asn, :string},
      {:geolocation, :string},
      {:open_ports, :string},
      {:threat_score, :float64}
    ]}
  ]

  @relationship_schemas [
    {:OWNS, :Person, :Company, [
      {:ownership_percentage, :float64},
      {:effective_date, :timestamp},
      {:confidence, :float64},
      {:source, :string}
    ]},
    {:DIRECTS, :Person, :Company, [
      {:role, :string},
      {:appointed_date, :timestamp},
      {:confidence, :float64}
    ]},
    {:HOSTS, :IPAddress, :Domain, [
      {:record_type, :string},
      {:first_seen, :timestamp},
      {:last_seen, :timestamp}
    ]},
    {:RESOLVES_TO, :Domain, :IPAddress, [
      {:record_type, :string},
      {:ttl, :int32}
    ]},
    {:SUBSIDIARY_OF, :Company, :Company, [
      {:ownership_percentage, :float64},
      {:confidence, :float64}
    ]}
  ]

  @spec create_schema(pid()) :: :ok | {:error, term()}
  def create_schema(conn) do
    Enum.each(@node_schemas, fn {label, columns} ->
      create_node_table(conn, label, columns)
    end)

    Enum.each(@relationship_schemas, fn {type, from, to, columns} ->
      create_rel_table(conn, type, from, to, columns)
    end)

    :ok
  end

  defp create_node_table(conn, label, columns) do
    col_defs = Enum.map_join(columns, ", ", fn
      {name, type, primary_key: true} -> "#{name} #{kuzu_type(type)} PRIMARY KEY"
      {name, type, _opts} -> "#{name} #{kuzu_type(type)}"
      {name, type} -> "#{name} #{kuzu_type(type)}"
    end)

    PrismaticStorageKuzu.query("CREATE NODE TABLE #{label} (#{col_defs})")
  end

  defp create_rel_table(conn, type, from, to, columns) do
    col_defs = Enum.map_join(columns, ", ", fn
      {name, type} -> "#{name} #{kuzu_type(type)}"
      {name, type, _opts} -> "#{name} #{kuzu_type(type)}"
    end)

    PrismaticStorageKuzu.query(
      "CREATE REL TABLE #{type} (FROM #{from} TO #{to}, #{col_defs})"
    )
  end

  defp kuzu_type(:string), do: "STRING"
  defp kuzu_type(:int32), do: "INT32"
  defp kuzu_type(:int64), do: "INT64"
  defp kuzu_type(:float64), do: "DOUBLE"
  defp kuzu_type(:boolean), do: "BOOL"
  defp kuzu_type(:timestamp), do: "TIMESTAMP"
end
```

## Implementation

### Deployment Architecture

KuzuDB runs embedded within the Prismatic Platform's BEAM runtime. The database files are stored in `priv/power_graph_kuzu/` and are managed by a dedicated GenServer that handles connection lifecycle, schema migrations, and health monitoring:

```
prismatic_storage_kuzu (OTP Application)
+-- PrismaticStorageKuzu.Supervisor
|   +-- PrismaticStorageKuzu.Connection  (GenServer - connection pool)
|   +-- PrismaticStorageKuzu.SchemaManager  (GenServer - migrations)
|   +-- PrismaticStorageKuzu.HealthMonitor  (periodic health checks)
+-- priv/power_graph_kuzu/
    +-- catalog.kz     (schema metadata)
    +-- nodes/          (columnar node data)
    +-- rels/           (columnar relationship data)
```

### Query Patterns

The platform uses several standard query patterns against KuzuDB:

**Neighborhood exploration** (for OSINT entity investigation):
```cypher
MATCH (target:Company {id: $company_id})<-[owns:OWNS]-(person:Person)
WHERE owns.confidence >= 0.7
RETURN person.name, owns.ownership_percentage, owns.confidence
ORDER BY owns.ownership_percentage DESC
```

**Path finding** (for beneficial ownership chains):
```cypher
MATCH path = (start:Person {id: $person_id})-[:OWNS|:DIRECTS*1..5]->(end:Company)
WHERE ALL(r IN relationships(path) WHERE r.confidence >= 0.6)
RETURN path, length(path) AS chain_length
ORDER BY chain_length ASC
```

**Aggregate analytics** (for security rating computation):
```cypher
MATCH (company:Company {id: $company_id})-[:HOSTS|:RESOLVES_TO*1..3]-(asset)
RETURN labels(asset)[0] AS asset_type, COUNT(asset) AS count, AVG(asset.threat_score) AS avg_threat
```

## Comparison

| Feature | KuzuDB | Neo4j | DGraph | Amazon Neptune | DuckDB |
|---------|--------|-------|--------|----------------|--------|
| **Architecture** | Embedded | Client-Server | Distributed | Cloud Service | Embedded |
| **Query Language** | Cypher | Cypher | GraphQL+- | Gremlin/SPARQL | SQL |
| **Storage Model** | Columnar | Native graph | Custom | Custom | Columnar |
| **ACID** | Yes | Yes | Yes | Yes | Yes |
| **License** | MIT | GPL/Commercial | Apache 2.0 | Proprietary | MIT |
| **Elixir Integration** | NIF/Port | Bolt driver | HTTP/gRPC | HTTP | NIF |
| **Latency** | Microseconds | Milliseconds | Milliseconds | Milliseconds | Microseconds |
| **Analytical Performance** | Excellent | Good | Good | Good | Excellent (relational) |
| **Graph Traversal** | Excellent | Excellent | Good | Good | Poor |
| **Deployment Complexity** | Minimal | Moderate | High | Managed | Minimal |

### KuzuDB vs. Neo4j

Neo4j is the most established graph database, but its client-server architecture introduces network latency that is unacceptable for the Prismatic Platform's sub-100ms page load requirements. KuzuDB's embedded architecture eliminates this overhead entirely. Additionally, Neo4j's Community Edition licensing (GPL) creates distribution complications that KuzuDB's MIT license avoids.

### KuzuDB vs. DuckDB

Both are embeddable, columnar databases, but they serve different purposes. DuckDB excels at analytical SQL queries over tabular data. KuzuDB excels at graph traversal and relationship-heavy queries. The Prismatic Platform uses both: DuckDB (via `prismatic_storage_duckdb`) for analytical reporting and KuzuDB for graph intelligence.

## Best Practices

1. **Design schemas for query patterns**: Model your graph schema around the questions you need to answer, not around the data you have. If you frequently query "who owns this company?", make OWNS a first-class relationship type.

2. **Use typed properties**: KuzuDB's columnar storage benefits from typed properties. Use specific types (INT64, DOUBLE, TIMESTAMP) rather than storing everything as STRING.

3. **Index primary keys**: Ensure all node tables have proper primary keys for efficient lookups. KuzuDB creates automatic indexes on primary key columns.

4. **Batch mutations**: When loading large datasets (common in OSINT operations), batch CREATE statements rather than issuing individual inserts. KuzuDB's columnar storage benefits from bulk loading.

5. **Monitor database size**: The columnar files in `priv/power_graph_kuzu/` grow with data. Implement periodic compaction and archival strategies for long-running instances.

6. **Use parameterized queries**: Always use parameterized Cypher queries to prevent injection and enable query plan caching.

7. **Limit traversal depth**: Unbounded graph traversals can be expensive. Always specify maximum depth in MATCH patterns (e.g., `*1..5` rather than `*`).

8. **Test with realistic data volumes**: Graph query performance is highly sensitive to data distribution. Test with production-scale datasets, not toy examples.

## Pitfalls

1. **Treating KuzuDB as a relational database**: Writing SQL-style queries instead of leveraging graph patterns. If you find yourself doing multiple JOINs, you probably want a MATCH pattern.

2. **Unbounded traversals**: Queries like `MATCH path = (a)-[*]->(b)` without depth limits can consume unbounded resources. Always constrain traversal depth.

3. **Ignoring the embedded lifecycle**: KuzuDB runs in-process, so its resources are tied to the BEAM VM. If the VM crashes, uncommitted transactions are lost. Use proper OTP supervision for the connection process.

4. **Over-modeling**: Creating too many node and relationship types makes the schema hard to understand and queries hard to write. Start with a minimal schema and extend as needed.

5. **Not backing up the database directory**: The `priv/power_graph_kuzu/` directory contains all graph data. Include it in backup strategies and deployment artifacts.

6. **Assuming real-time consistency**: While KuzuDB provides ACID transactions, the Prismatic Platform's OSINT data collection is eventually consistent. A relationship may be discovered minutes or hours after the entities it connects.

7. **Mixing OLTP and OLAP patterns**: KuzuDB is optimized for analytical (OLAP) graph queries. High-frequency transactional (OLTP) workloads are better served by ETS or PostgreSQL.

## Use Cases

### OSINT Beneficial Ownership Analysis

When investigating corporate ownership structures, analysts need to traverse chains of ownership relationships to discover ultimate beneficial owners. KuzuDB enables queries like "find all natural persons who control more than 25% of Company X through direct or indirect ownership chains up to 5 levels deep."

### Attack Surface Mapping

Prismatic Perimeter uses KuzuDB to model the relationships between discovered assets: domains resolve to IP addresses, IP addresses host services, services have vulnerabilities, domains have SSL certificates. This graph representation enables rich security analytics that would be extremely cumbersome in a relational model.

### Dependency Graph Analysis

The platform's 115 umbrella applications have complex inter-dependencies. KuzuDB represents these as a dependency graph, enabling queries like "which applications would be affected if prismatic_storage_core introduced a breaking change?" and "are there any circular dependency paths?"

### Knowledge Graph Operations

The 530+ AIAD agents produce knowledge artifacts that reference each other. KuzuDB represents these references as a knowledge graph, enabling discovery of related concepts, gap analysis (concepts that should be connected but are not), and impact analysis (what is affected when a concept changes).

## Related Concepts

KuzuDB integrates with a rich ecosystem of platform components for graph-based intelligence:

- [Graph Database](/glossary/graph-database/) -- the general category of databases that KuzuDB belongs to, optimized for relationship-centric data models
- [Knowledge Graph](/glossary/knowledge-graph/) -- the higher-level knowledge structure built on top of KuzuDB's graph storage capabilities
- [Entity Graph](/glossary/entity-graph/) -- the OSINT-specific graph model representing people, companies, domains, and their interconnections
- [PostgreSQL](/glossary/postgresql/) -- the relational database that complements KuzuDB in the platform's polyglot persistence strategy
- [ETS](/glossary/ets/) -- Erlang Term Storage providing high-speed key-value access alongside KuzuDB's graph queries
- [Meilisearch](/glossary/meilisearch/) -- the search engine that indexes KuzuDB entities for full-text discovery
- [OSINT](/glossary/osint/) -- open source intelligence operations that produce the entity data stored in KuzuDB
- [EASM](/glossary/easm/) -- external attack surface management using KuzuDB for asset relationship modeling
- [Polyglot Persistence](/glossary/polyglot-persistence/) -- the architectural strategy of using multiple storage engines, with KuzuDB as the graph tier
- [Knowledge Representation](/glossary/knowledge-representation/) -- the broader field that KuzuDB's graph model instantiates

## See Also

- [Prismatic Storage](/glossary/prismatic-storage/) -- the unified storage abstraction layer that KuzuDB integrates through
- [Graph Theory](/glossary/graph-theory/) -- the mathematical foundations underlying KuzuDB's data model
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- the EASM application that is KuzuDB's primary consumer
- [Entity Resolution](/glossary/entity-resolution/) -- the process of matching discovered entities to existing graph nodes
- [Adapter Pattern](/glossary/adapter-pattern/) -- the software pattern used to integrate KuzuDB with the platform's storage core

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) Glossary

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | Glossary Index
