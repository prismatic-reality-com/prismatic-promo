+++
title = "Prismatic Storage KuzuDB"
weight = 39
[extra]
icon = "share"
color = "purple"
description = "KuzuDB graph database adapter for relationship-centric intelligence analysis"
category = "Storage"
files = "110"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1151
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "KuzuDB", "apps", "Prismatic Platform", "Cypher", "Graph", "Prismatic Storage"]
tags = ["apps", "storage", "prismatic-storage-kuzudb", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage KuzuDB - Prismatic Platform"
+++

## Overview

[Prismatic Storage](/glossary/prismatic-storage/) [KuzuDB](/glossary/kuzudb/) implements the storage adapter [protocol](/glossary/protocol/) using KuzuDB, an embedded graph database optimized for analytical graph queries. It stores entity relationships, ownership chains, communication networks, and infrastructure topology as native graph structures, enabling efficient traversal, [pattern matching](/glossary/pattern-matching/), and community detection queries that are impractical in relational databases.

As an embedded database, KuzuDB runs within the [BEAM](/glossary/beam/) process without requiring an external server. This eliminates network latency for graph queries and simplifies deployment. The adapter manages the database lifecycle through [OTP](/glossary/otp/) supervision, handles schema evolution for node and edge types, and provides a Cypher query interface that intelligence analysts can use to express complex relationship traversals.

Graph storage is the natural complement to the platform's relational ([PostgreSQL](/apps/prismatic-storage-ecto/)) and search ([Meilisearch](/apps/prismatic-storage-meilisearch/)) layers. While PostgreSQL stores entity attributes and Meilisearch indexes text, KuzuDB captures the relationships between entities -- corporate ownership hierarchies, network infrastructure dependencies, communication patterns, and social connections.

## Architecture

```
Application Code
       |
  PrismaticStorageCore Behaviour (Protocol)
       |
  KuzuDB Adapter
       |
  +----+----+----+
  |         |         |
Graph     Query     Schema
Manager   Engine    Manager
  |         |         |
  +----+----+----+
       |
  KuzuDB Embedded Engine
       |
  +----+----+
  |         |
Node      Edge
Tables    Tables
```

The Graph Manager [GenServer](/glossary/genserver/) owns the KuzuDB database connection and coordinates write operations. The Query Engine translates both structured API calls and raw Cypher queries into KuzuDB operations. The Schema Manager handles node and edge type definitions, property schemas, and index creation for frequently queried attributes.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The KuzuDB adapter implements the [Prismatic Storage Core](/apps/prismatic-storage-core/) contract with a trait set tailored for graph operations: Storable, Identifiable, Queryable, GraphTraversable, Batchable, and Streamable. The inclusion of the GraphTraversable trait distinguishes this adapter from all others in the platform and provides the foundation for relationship-centric intelligence analysis.

The Storable trait implementation handles the unique challenge of mapping flat Elixir maps to KuzuDB's property graph model. Entity maps are stored as node properties, with the entity type determining the node label. The `to_storage/1` callback extracts the entity's type, key, and properties, mapping them to KuzuDB's node creation syntax. The `from_storage/2` callback reconstructs Elixir maps from KuzuDB query results, handling the translation between KuzuDB's type system (which includes graph-specific types like `NODE` and `REL`) and standard Elixir terms.

The GraphTraversable trait is the adapter's defining capability. It provides callbacks for multi-hop traversal (`traverse/3`), shortest path computation (`shortest_path/3`), neighbor discovery (`neighbors/2`), and community detection (`detect_communities/3`). These operations have no meaningful equivalent in relational or key-value stores -- attempting them through SQL joins would produce prohibitively expensive queries as hop depth increases, while key-value stores lack the structural awareness to traverse relationships at all.

The Queryable trait implementation translates the platform's generic query interface into Cypher, KuzuDB's query language. Simple key-value lookups translate to `MATCH (n:Type {key: $value}) RETURN n` patterns, while filter-sort-paginate queries generate more complex Cypher with `WHERE`, `ORDER BY`, and `LIMIT` clauses. The adapter also accepts raw Cypher queries for analysts who need the full expressive power of the query language.

The Batchable trait is critical for graph population workflows. When OSINT collection produces thousands of entity relationships, the adapter uses KuzuDB's bulk loader to insert nodes and edges in large batches rather than individual transactions. Batch insertion bypasses the normal transactional overhead and writes directly to the columnar storage backend, achieving throughput orders of magnitude higher than row-by-row insertion.

Contract testing through `PrismaticStorageCore.ContractTest` verifies standard CRUD and query operations, while graph-specific tests exercise traversal depth, cycle detection, and community clustering accuracy.

## Key Features

### Graph Storage
- Native node and edge storage with typed properties
- Cypher query language support for expressive graph traversals
- Schema-flexible property graphs with runtime type evolution
- Embedded deployment -- no external server, no network overhead
- Automatic indexing on frequently queried node properties

### Graph Queries
- Multi-hop relationship traversal with variable-length path patterns
- Shortest path computation between any two entities
- Pattern matching with complex structural constraints
- Graph projection for analytical subgraph extraction
- Community detection for identifying entity clusters

### Integration
- Automatic graph population from [OSINT data](/apps/prismatic-osint-core/) through adapter hooks
- [Entity resolution](/glossary/entity-resolution/) with graph merge for deduplicating nodes from multiple sources
- Temporal graph versioning for tracking relationship changes over time
- Export to visualization tools (GraphML, DOT, JSON) for analyst consumption

## Graph Schema Design

The adapter implements a typed property graph schema where node labels correspond to entity types and edge labels correspond to relationship types. The schema is defined declaratively and managed by the Schema Manager, which creates KuzuDB node and edge tables on application boot and handles schema evolution as new entity or relationship types are introduced.

| Node Label | Properties | Example |
|-----------|-----------|---------|
| `Company` | `ico`, `name`, `country`, `risk_score` | Czech business entity |
| `Person` | `name`, `nationality`, `roles` | Individual associated with entities |
| `Domain` | `name`, `registrar`, `created_at` | Internet domain name |
| `IP` | `address`, `asn`, `geolocation` | Network address |
| `Certificate` | `subject`, `issuer`, `expiry` | TLS certificate |

| Edge Label | Source | Target | Properties |
|-----------|--------|--------|-----------|
| `OWNS` | Company | Company | `share`, `since`, `source` |
| `EMPLOYS` | Company | Person | `role`, `since`, `until` |
| `RESOLVES_TO` | Domain | IP | `first_seen`, `last_seen` |
| `ISSUED_FOR` | Certificate | Domain | `valid_from`, `valid_until` |

The schema supports temporal graph versioning through edge properties. Rather than deleting edges when relationships change, new edges are created with updated timestamps and the old edges are marked with an `until` property. This preserves the complete history of entity relationships, enabling point-in-time queries that reconstruct the graph as it existed at any historical moment.

## Usage

```elixir
# Store an entity relationship as a graph edge
PrismaticStorageKuzudb.create_edge(:owns, company_node, subsidiary_node, %{
  share: 0.75,
  since: ~D[2020-01-15],
  source: :business_registry
})

# Traverse an ownership chain up to 5 hops deep
{:ok, chain} = PrismaticStorageKuzudb.query("""
  MATCH (root:Company {ico: '12345678'})-[:OWNS*1..5]->(subsidiary:Company)
  RETURN subsidiary.name, subsidiary.ico, length(path) AS depth
  ORDER BY depth
""")
# => {:ok, [%{name: "Sub Corp A", ico: "87654321", depth: 1}, ...]}

# Find shortest path between two entities
{:ok, path} = PrismaticStorageKuzudb.shortest_path(entity_a, entity_b)
# => {:ok, %Path{nodes: [...], edges: [...], length: 3}}

# Community detection for network analysis
{:ok, communities} = PrismaticStorageKuzudb.detect_communities(:Company,
  algorithm: :label_propagation,
  min_size: 3
)
# => {:ok, [%Community{id: 1, members: ["e-1", "e-2", "e-3"], density: 0.85}]}

# Export subgraph for visualization
{:ok, graphml} = PrismaticStorageKuzudb.export(
  "MATCH (n:Company)-[r:OWNS]->(m:Company) RETURN n, r, m",
  format: :graphml
)
```

## Testing

```bash
mix test apps/prismatic_storage_kuzudb/test
mix test apps/prismatic_storage_kuzudb/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | All declared trait compliance |
| Graph Traversal | 12 | Multi-hop paths, cycle handling, depth limits |
| Shortest Path | 6 | Path correctness, disconnected graph handling |
| Community Detection | 4 | Clustering accuracy, minimum size filtering |
| Schema Evolution | 6 | Node/edge type addition, property migration |
| Temporal Queries | 8 | Point-in-time reconstruction, edge versioning |

## Integration Points

The graph store receives entity relationships from multiple platform sources. [Prismatic Tracking](/apps/prismatic-tracking/) feeds infrastructure topology changes as graph mutations. [Social media intelligence](/apps/prismatic-osint-social-media/) contributes social connection edges between person entities. [Prismatic Modalities](/apps/prismatic-modalities/) cross-modal entity resolution creates edges linking entities discovered across different intelligence modalities. The [Prismatic HAWKEYE](/apps/prismatic-hawkeye/) visitor intelligence system queries graph paths to assess whether visitor IP addresses are associated with known threat infrastructure.

## NABLA Compliance

Graph operations maintain full epistemic provenance through edge properties that record the source, timestamp, and confidence of each relationship assertion. Multiple edges between the same pair of nodes from different sources implement Signal Plurality at the relationship level -- contradictory relationship claims are preserved as parallel edges rather than being silently resolved. The Contradiction Preservation axiom is naturally satisfied by the graph model's ability to represent multiple, potentially conflicting relationships between the same entities. Temporal graph versioning satisfies Time Decay by enabling queries that weight recent observations more heavily than historical ones.

## Performance

| Metric | Value |
|--------|-------|
| Single-hop traversal | Sub-millisecond |
| Multi-hop traversal (5 hops) | Low milliseconds |
| Bulk node insertion | 100,000+ nodes/second |
| Community detection | Seconds for 10K-node graphs |
| Shortest path | Milliseconds for typical graph sizes |

## Related Components

- [Prismatic Storage Core](/apps/prismatic-storage-core/) -- Adapter protocol definition
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- Relational entity attribute storage
- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Intelligence source feeding graph population
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Graph query performance [metrics](/glossary/metrics/)

## Related Agents

- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Ensures KuzuDB adapter conforms to the PrismaticStorageCore protocol contract
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews graph schema design and query optimization strategies
- [Consolidation Architect](/agents/consolidation-architect/) -- Entity deduplication and graph merge operations for data consistency

## Related Capabilities

- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) -- Graph storage spans corporate, network, and social relationship domains
- [Quality Gates](/capabilities/quality-gates/) -- Contract tests verify graph adapter protocol compliance and query correctness
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Graph traversal enables cross-domain entity relationship discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)