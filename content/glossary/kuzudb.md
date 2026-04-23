+++
title = "KuzuDB"
weight = 46
[extra]
category = "storage"
description = "Embedded graph database for relationship queries and knowledge graphs"
keywords = ["KuzuDB", "graph database", "Cypher", "property graph", "embedded database", "knowledge graph", "graph analytics"]
abbreviation = "N/A"
related_terms = ["adapter-pattern", "ets", "meilisearch", "blackboard", "duckdb", "garden", "postgresql", "knowledge-graph"]
related_apps = ["prismatic_storage_kuzudb", "prismatic_storage_core", "prismatic_power_graph", "prismatic_perimeter", "prismatic_osint_core"]
domain = "storage-systems"
complexity = "advanced"
stability = "stable"
since_generation = 7
beam_related = true
otp_behaviour = false
elixir_module = "PrismaticStorage.KuzuDB.Adapter"
phoenix_component = false
security_relevant = true
compliance_relevant = false
osint_relevant = true
performance_critical = true
date_created = "2025-04-15"
date_updated = "2026-02-22"
version = "2.0.0"
query_language = "Cypher"
storage_model = "columnar-property-graph"
deployment_model = "embedded"
sdk = "kuzu-ex"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1337
date_modified = "2026-02-23"
tags = ["glossary", "storage", "kuzudb", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "KuzuDB - Prismatic Platform"
+++

## Definition

KuzuDB is an embeddable, high-performance graph database management system designed for analytical queries on property graphs using the Cypher query language. Unlike client-server graph databases such as Neo4j that require a separate daemon process, KuzuDB runs embedded within the host application's process space, eliminating network round-trip overhead and simplifying deployment. The database stores data as typed nodes and directed relationships in a property graph model, where both nodes and relationships carry arbitrary key-value properties, enabling rich domain modeling that captures not just entities and connections but the attributes that characterize them.

KuzuDB's architecture is optimized for graph analytical workloads through columnar storage, vectorized query execution, and worst-case-optimal join algorithms. The columnar layout stores node and relationship properties in compressed columns rather than row-oriented records, enabling efficient scans across large property sets -- a pattern common in graph analytics where queries aggregate properties across many entities. Vectorized execution processes data in SIMD-friendly batches rather than one tuple at a time, leveraging modern CPU architectures for higher throughput.

## Overview

Graph databases address a fundamental limitation of relational databases: efficiently querying relationships. In a relational system, discovering that "Organization A operates Domain B, which resolves to IP C, which hosts Service D, which has Vulnerability E" requires joining five tables. Each join adds computational cost, and the query plan scales poorly as relationship depth increases. In a graph database, this same query is a five-hop traversal that executes in time proportional to the actual data touched, not the table sizes.

KuzuDB occupies a specific niche in the graph database landscape: embedded analytical graph processing. This positioning makes it ideal for applications that need graph query capabilities without the operational overhead of running a separate database server. For the Prismatic Platform, this means graph intelligence operations run within the [BEAM](/glossary/beam/) virtual machine's process space, communicating through function calls rather than network protocols.

The worst-case-optimal join algorithms ensure that multi-hop graph pattern matching (the core operation in graph queries) does not degenerate to exponential execution times on adversarial graph structures. The system supports ACID transactions, ensuring that concurrent read and write operations maintain data consistency. Schema definitions enforce type safety on node labels and relationship types, catching data modeling errors at insert time rather than query time.

## Property Graph Model

The property graph model used by KuzuDB is the most expressive graph data model in common use:

| Component | Description | Example |
|-----------|-------------|---------|
| **Node** | Entity with a label and properties | `(:Domain {name: "example.com", registered: "2020-01-15"})` |
| **Relationship** | Typed, directed connection between nodes | `-[:RESOLVES_TO {first_seen: "2025-06-15"}]->` |
| **Label** | Type classification for nodes | `:Domain`, `:IPAddress`, `:Certificate` |
| **Property** | Key-value attribute on node or relationship | `confidence: 0.95`, `source: "censys"` |

The property graph model is more expressive than triple stores (RDF/SPARQL) because it supports typed, directed relationships with properties -- a requirement for modeling intelligence relationships where the nature, confidence, and provenance of a connection are as important as its existence.

## Architecture

```
Application Code (Elixir/BEAM)
         |
         v
    kuzu-ex SDK (NIF bindings)
         |
         v
    KuzuDB Engine (embedded C++)
    +--------------------------------+
    | Query Parser (Cypher)          |
    | Query Optimizer                |
    | Vectorized Execution Engine    |
    | Buffer Manager                 |
    | Columnar Storage Engine        |
    +--------------------------------+
         |
         v
    Disk Storage (database directory)
```

The kuzu-ex SDK provides Elixir bindings through NIFs (Native Implemented Functions), enabling direct function calls from Elixir to the KuzuDB C++ engine without network overhead. This NIF integration means graph queries execute in the same OS process as the [BEAM](/glossary/beam/), with results returned directly to Elixir data structures.

## Cypher Query Language

KuzuDB implements a substantial subset of the Cypher query language, enabling expressive graph pattern matching:

```cypher
-- Find all domains operated by an organization and their exposed services
MATCH (org:Organization {name: $org_name})-[:OPERATES]->(d:Domain)
      -[:RESOLVES_TO]->(ip:IPAddress)-[:EXPOSES]->(s:Service)
RETURN d.name, ip.address, s.port, s.protocol
ORDER BY d.name

-- Shortest path between two entities
MATCH path = shortestPath(
  (a:Domain {name: $source})-[*1..6]-(b:Domain {name: $target})
)
RETURN path, length(path) AS distance

-- Find shared infrastructure between organizations
MATCH (a:Organization)-[:OPERATES]->(:Domain)-[:RESOLVES_TO]->(ip:IPAddress)
      <-[:RESOLVES_TO]-(:Domain)<-[:OPERATES]-(b:Organization)
WHERE a.name <> b.name
RETURN a.name, b.name, ip.address, count(*) AS shared_ips
ORDER BY shared_ips DESC
```

## Schema Definition

KuzuDB enforces typed schemas for both node tables and relationship tables, providing data integrity at the storage layer:

```cypher
-- Node table definitions
CREATE NODE TABLE Domain (
  name STRING PRIMARY KEY,
  registered DATE,
  registrar STRING,
  status STRING
)

CREATE NODE TABLE IPAddress (
  address STRING PRIMARY KEY,
  version INT64,
  asn INT64,
  country STRING
)

CREATE NODE TABLE Service (
  id STRING PRIMARY KEY,
  port INT64,
  protocol STRING,
  product STRING,
  version STRING
)

CREATE NODE TABLE Vulnerability (
  cve_id STRING PRIMARY KEY,
  severity STRING,
  cvss_score DOUBLE,
  description STRING
)

-- Relationship table definitions
CREATE REL TABLE RESOLVES_TO (
  FROM Domain TO IPAddress,
  first_seen TIMESTAMP,
  last_seen TIMESTAMP,
  source STRING,
  confidence DOUBLE
)

CREATE REL TABLE EXPOSES (
  FROM IPAddress TO Service,
  discovered_at TIMESTAMP,
  scanner STRING
)

CREATE REL TABLE VULNERABLE_TO (
  FROM Service TO Vulnerability,
  discovered_at TIMESTAMP,
  verified BOOLEAN
)
```

## Performance Characteristics

| Operation | KuzuDB (Embedded) | Neo4j (Server) | PostgreSQL (Recursive CTE) |
|-----------|--------------------|----------------|---------------------------|
| **1-hop lookup** | ~0.1ms | ~1ms (+ network) | ~0.5ms |
| **3-hop traversal** | ~1ms | ~5ms (+ network) | ~50ms (joins) |
| **6-hop path finding** | ~10ms | ~50ms (+ network) | ~5000ms+ (exponential joins) |
| **Graph analytics** | Optimized (columnar) | Moderate | Poor (not designed for graphs) |
| **Deployment** | In-process, zero ops | Separate server, JVM | Separate server |
| **Memory model** | Shared with application | Separate JVM heap | Separate process |

The performance advantage of KuzuDB grows exponentially with traversal depth. For 1-hop queries, the advantage over PostgreSQL is modest. For 6-hop queries, KuzuDB is 500x faster because it avoids the combinatorial explosion of self-joins that plagues relational approaches to graph traversal.

## Implementation in Prismatic Platform

KuzuDB is integrated through the `prismatic_storage_kuzu` adapter and the `kuzu-ex` Elixir SDK, a [GARDEN](/glossary/garden/) Tier 2 active repository:

```elixir
defmodule PrismaticStorage.KuzuDB.Adapter do
  @moduledoc """
  KuzuDB storage adapter implementing the PrismaticStorage behaviour
  for graph-based queries and knowledge graph operations.
  Provides attack surface mapping, entity resolution, and
  relationship traversal for OSINT intelligence.
  """

  @behaviour PrismaticStorage.Behaviour

  alias PrismaticStorage.KuzuDB.Connection

  @spec query(String.t(), map()) :: {:ok, list(map())} | {:error, term()}
  def query(cypher, params \\ %{}) do
    start_time = System.monotonic_time()

    result = Connection.execute(cypher, params)

    :telemetry.execute(
      [:prismatic, :storage, :kuzu, :query],
      %{duration: System.monotonic_time() - start_time},
      %{query_type: classify_query(cypher)}
    )

    result
  end

  @spec discover_attack_path(String.t(), String.t()) ::
          {:ok, list(map())} | {:error, term()}
  def discover_attack_path(source_domain, target_entity) do
    query(
      """
      MATCH path = shortestPath(
        (source:Domain {name: $source})-[*1..5]-(target {id: $target})
      )
      RETURN path, length(path) AS distance
      """,
      %{source: source_domain, target: target_entity}
    )
  end

  @spec enumerate_attack_surface(String.t()) ::
          {:ok, list(map())} | {:error, term()}
  def enumerate_attack_surface(organization) do
    query(
      """
      MATCH (org:Organization {name: $org})-[:OPERATES]->(d:Domain)
            -[:RESOLVES_TO]->(ip:IPAddress)-[:EXPOSES]->(s:Service)
      OPTIONAL MATCH (s)-[:VULNERABLE_TO]->(v:Vulnerability)
      RETURN d.name AS domain, ip.address AS ip,
             s.port AS port, s.protocol AS protocol,
             collect(v.cve_id) AS vulnerabilities
      ORDER BY size(vulnerabilities) DESC
      """,
      %{org: organization}
    )
  end

  @spec find_shared_infrastructure(String.t(), String.t()) ::
          {:ok, list(map())} | {:error, term()}
  def find_shared_infrastructure(domain_a, domain_b) do
    query(
      """
      MATCH (a:Domain {name: $domain_a})-[:RESOLVES_TO]->(ip:IPAddress)
            <-[:RESOLVES_TO]-(b:Domain {name: $domain_b})
      RETURN ip.address, a.name AS domain_a, b.name AS domain_b
      """,
      %{domain_a: domain_a, domain_b: domain_b}
    )
  end

  defp classify_query(cypher) do
    cond do
      String.contains?(cypher, "shortestPath") -> :path_query
      String.contains?(cypher, "MATCH") -> :pattern_match
      String.contains?(cypher, "CREATE") -> :mutation
      true -> :other
    end
  end
end
```

## Knowledge Graph Builder

The knowledge graph builder ingests [OSINT](/glossary/osint/) data from multiple sources and resolves entities into the unified graph structure:

```elixir
defmodule PrismaticStorage.KuzuDB.KnowledgeGraphBuilder do
  @moduledoc """
  Builds and maintains the OSINT knowledge graph by ingesting
  data from multiple sources and resolving entities.
  Supports incremental updates through MERGE operations.
  """

  alias PrismaticStorage.KuzuDB.Adapter

  @spec ingest_osint_data(atom(), list(map())) ::
          {:ok, non_neg_integer()} | {:error, term()}
  def ingest_osint_data(source, records) do
    results =
      records
      |> Enum.map(&normalize_record(source, &1))
      |> Enum.map(&upsert_entity/1)

    success_count = Enum.count(results, &match?({:ok, _}, &1))
    {:ok, success_count}
  end

  @spec upsert_entity(map()) :: {:ok, map()} | {:error, term()}
  defp upsert_entity(%{type: :domain} = entity) do
    Adapter.query(
      """
      MERGE (d:Domain {name: $name})
      SET d.registrar = $registrar,
          d.last_seen = $last_seen,
          d.source = $source
      """,
      entity.properties
    )
  end

  defp upsert_entity(%{type: :ip_address} = entity) do
    Adapter.query(
      """
      MERGE (ip:IPAddress {address: $address})
      SET ip.asn = $asn,
          ip.country = $country,
          ip.last_seen = $last_seen
      """,
      entity.properties
    )
  end

  defp normalize_record(source, record) do
    %{
      type: determine_entity_type(record),
      properties: Map.put(record, :source, Atom.to_string(source))
    }
  end

  defp determine_entity_type(%{name: _}), do: :domain
  defp determine_entity_type(%{address: _}), do: :ip_address
  defp determine_entity_type(_), do: :unknown
end
```

## Comparison with Alternatives

| Feature | KuzuDB | Neo4j | Amazon Neptune | ArangoDB | PostgreSQL + pg_graphql |
|---------|--------|-------|----------------|----------|------------------------|
| **Deployment** | Embedded (in-process) | Client-server (JVM) | Managed cloud | Client-server | Client-server |
| **Query language** | Cypher | Cypher | Gremlin/SPARQL | AQL | SQL + GraphQL |
| **Storage model** | Columnar property graph | Native graph | Triple store | Multi-model | Relational + extension |
| **ACID** | Yes | Yes | Yes | Yes | Yes |
| **Analytics** | Optimized (vectorized) | Moderate | Limited | Multi-model | Requires CTEs |
| **Operational cost** | Zero (embedded) | High (JVM, clustering) | Managed (pay-per-use) | Moderate | Low (existing infra) |
| **Elixir integration** | NIF via kuzu-ex | HTTP/Bolt driver | HTTP API | HTTP API | [Ecto](/glossary/ecto/) |
| **Best for** | Embedded analytics | Enterprise graph apps | Cloud-native graph | Multi-model needs | Existing PostgreSQL |

## Graph Analytics Capabilities

Beyond simple traversal queries, KuzuDB supports graph analytics operations that are central to the platform's intelligence capabilities:

| Operation | Description | OSINT Application |
|-----------|-------------|-------------------|
| **Shortest path** | Find minimum-hop path between entities | Attack path discovery |
| **Betweenness centrality** | Identify critical relay nodes | Infrastructure risk analysis |
| **Community detection** | Discover clusters of related entities | Organization mapping |
| **Subgraph matching** | Find patterns in the graph | Threat pattern detection |
| **Property aggregation** | Aggregate node/edge properties across paths | Risk score computation |

## Best Practices

1. **Design Schema Before Querying**: Define node labels and relationship types based on the domain model before loading data. Schema enforcement catches data quality issues at ingestion time, preventing corrupt graph structures that produce incorrect query results.

2. **Index Critical Properties**: Create indexes on properties used in MATCH clauses and WHERE filters. The `name` property on Domain nodes and `address` on IPAddress nodes should always be indexed for the EASM use case.

3. **Limit Traversal Depth**: Unbounded path queries (`[*]`) can explore the entire graph. Always specify maximum hop counts (`[*1..5]`) to prevent runaway queries. Six hops covers most meaningful infrastructure relationships.

4. **Batch Ingestion**: When loading OSINT data from multiple sources, batch insert operations rather than inserting one record at a time. KuzuDB's columnar storage benefits from bulk loading patterns.

5. **Use Parameterized Queries**: Always use query parameters (`$variable`) rather than string interpolation to prevent Cypher injection and enable query plan caching.

6. **Monitor Query Performance**: Emit telemetry metrics for every graph query, tracking execution time by query type. Slow queries indicate missing indexes or suboptimal traversal patterns.

7. **Separate Read and Write Paths**: Use dedicated connection pools for read-heavy analytics and write-heavy ingestion. This prevents long-running analytics queries from blocking data ingestion.

## Use Cases

- **Attack Surface Mapping**: KuzuDB stores the complete attack surface graph for monitored organizations, enabling multi-hop relationship traversal to discover indirect exposure paths, shared infrastructure risks, and supply chain dependencies through the [Prismatic Perimeter](/glossary/prismatic-perimeter/).

- **Agent Coordination Network**: The 530 AIAD [agents'](/glossary/agent/) coordination relationships are modeled as a graph, enabling queries like "which agents depend on the output of agent X" and "what is the critical path through agent dependencies for this workflow."

- **Entity Relationship Intelligence**: OSINT investigations use KuzuDB to explore relationships between people, companies, domains, and infrastructure elements, discovering non-obvious connections through graph traversal that would be invisible in tabular data.

- **Blackboard Knowledge Store**: The platform's [Blackboard](/glossary/blackboard/) system uses KuzuDB for storing and querying relationship-rich knowledge that does not fit naturally into relational tables or key-value stores.

- **Vulnerability Path Analysis**: Security assessments use graph path queries to trace exploitation chains from external-facing assets through internal infrastructure to sensitive data stores, identifying the shortest attack paths.

## Related Concepts

- [Knowledge Graph](/glossary/knowledge-graph/) - Graph-structured knowledge representation built on KuzuDB
- [Adapter Pattern](/glossary/adapter-pattern/) - Unified storage interface including KuzuDB as the graph adapter
- [Blackboard](/glossary/blackboard/) - Knowledge store leveraging KuzuDB for relationship-rich queries
- [GARDEN](/glossary/garden/) - Source of the kuzu-ex SDK and graph knowledge patterns
- [Meilisearch](/glossary/meilisearch/) - Complementary full-text search capability in the storage stack
- [DuckDB](/glossary/duckdb/) - Complementary analytical database for OLAP workloads
- [ETS](/glossary/ets/) - In-memory storage complementing KuzuDB for fast key-value access
- [PostgreSQL](/glossary/postgresql/) - Relational storage complementing KuzuDB for structured data
- [Embedding](/glossary/embedding/) - Node embeddings enriching KuzuDB graph structures
- [Data Pipeline](/glossary/data-pipeline/) - Pipeline infrastructure feeding data into KuzuDB

## See Also

- [Architecture](/architecture/) -- Storage architecture and graph database integration
- [Capabilities](/capabilities/) -- Intelligence and graph analytics capabilities
- [Technologies](/technologies/) -- Graph database technology stack

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
