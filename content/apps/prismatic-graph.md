+++
title = "Prismatic Graph"
weight = 12
[extra]
icon = "share-2"
color = "indigo"
description = "KuzuDB graph database integration for relationship queries and knowledge graphs"
category = "Storage"
files = "290"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 882
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Graph", "KuzuDB", "apps", "Storage", "Prismatic Platform", "PrismaticGraph", "OSINT", "Entity"]
tags = ["apps", "storage", "prismatic-graph", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Graph - Prismatic Platform"
+++

## Overview

Prismatic Graph provides the graph database integration layer built on [KuzuDB](@/glossary/kuzudb.md), an embedded graph database optimized for analytical workloads. It enables relationship-centric queries across the platform's entity data, powering the [knowledge graph](@/glossary/knowledge-graph.md), entity relationship mapping, and graph-based intelligence analysis.

Graph databases excel where relational databases struggle: traversing deep relationship chains, finding shortest paths between entities, detecting communities, and uncovering hidden connections. For an intelligence platform like Prismatic, graph queries are essential for connecting the dots across [OSINT sources](@/osint/_index.md), company registries, and [threat intelligence](@/glossary/threat-intelligence.md). The choice of KuzuDB as the embedded graph engine provides sub-100ms query performance for multi-hop traversals without the operational overhead of a standalone graph database server.

The module serves as the backbone of the platform's [entity resolution](@/glossary/entity-resolution.md) pipeline, maintaining a unified graph of entities -- companies, persons, domains, IP addresses, certificates -- connected by typed, directional relationships. When a new entity is discovered through any OSINT source, it is linked into the graph with edges representing ownership, directorship, hosting, DNS resolution, and other relationship types. This interconnected view enables analysts to discover non-obvious connections that would be invisible in tabular data.

## Architecture

```
PrismaticGraph
+-- Schema          # Graph schema definitions (node types, edge types, properties)
+-- Query           # Cypher query interface with parameterized execution
+-- Analytics       # Graph algorithms (centrality, community detection, PageRank)
+-- Ingestion       # Data loading from OSINT and registry sources
+-- KuzuAdapter     # Low-level KuzuDB driver with connection pooling
+-- Visualization   # Graph data export for rendering (D3.js, Cytoscape)
```

### Data Ingestion Pipeline

```
OSINT Sources --> Entity Extraction --> Graph Ingestion --> KuzuDB
    |                                                      |
    +-- ARES companies ----------------------------------------+
    +-- Justice.cz statutory bodies ---------------------------+
    +-- Shodan host-domain relationships ----------------------+
    +-- Censys certificate-domain links -----------------------+
    +-- Sanctions entity connections ---------------------------+
```

The ingestion pipeline follows an idempotent merge strategy: when an entity or relationship already exists in the graph, the ingestion process updates properties and timestamps rather than creating duplicates. This ensures graph integrity even when multiple OSINT sources provide overlapping data about the same entities.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticGraph` | Public facade: `query/1`, `shortest_path/1`, `ingest/2` |
| `PrismaticGraph.Application` | OTP application entry point with connection pool supervision |
| `PrismaticGraph.Schema` | DSL for defining graph node types, edge types, and property constraints |
| `PrismaticGraph.Query` | Cypher query builder with parameterized execution and result mapping |
| `PrismaticGraph.Analytics` | Graph algorithms including centrality, community detection, PageRank |
| `PrismaticGraph.Ingestion` | Idempotent entity and relationship loading from external sources |
| `PrismaticGraph.KuzuAdapter` | Low-level KuzuDB driver with connection management |
| `PrismaticGraph.Visualization` | Graph data export in formats suitable for frontend rendering |
| `PrismaticGraph.SchemaEvolution` | Schema migration management for graph structure changes |

## Entity Relationship Modeling

```elixir
# Define graph schema
PrismaticGraph.Schema.define do
  node :company do
    property :ico, :string
    property :name, :string
    property :country, :string
  end

  node :person do
    property :name, :string
    property :role, :string
  end

  node :ip_address do
    property :address, :string
    property :asn, :integer
  end

  node :domain do
    property :name, :string
    property :registrar, :string
  end

  node :certificate do
    property :fingerprint, :string
    property :issuer, :string
    property :valid_until, :datetime
  end

  edge :owns, from: :person, to: :company
  edge :directs, from: :person, to: :company
  edge :hosts, from: :ip_address, to: :company
  edge :resolves_to, from: :domain, to: :ip_address
  edge :related_to, from: :company, to: :company
  edge :secures, from: :certificate, to: :domain
end
```

## Cypher Query Interface

```elixir
# Find all companies directed by a specific person
{:ok, companies} = PrismaticGraph.query("""
  MATCH (p:Person {name: 'Jan Novak'})-[:DIRECTS]->(c:Company)
  RETURN c.name, c.ico
""")

# Find connections between two entities (up to 4 hops)
{:ok, paths} = PrismaticGraph.query("""
  MATCH path = (a:Company {ico: '12345678'})-[*1..4]-(b:Company {ico: '87654321'})
  RETURN path
""")

# Community detection - find clusters of related companies
{:ok, clusters} = PrismaticGraph.query("""
  MATCH (c1:Company)-[:RELATED_TO]-(c2:Company)
  WHERE c1.country = 'CZ'
  RETURN c1.name, collect(c2.name) as related
  ORDER BY size(related) DESC
  LIMIT 20
""")

# Shortest path between entities
{:ok, shortest} = PrismaticGraph.shortest_path(
  from: {:company, ico: "12345678"},
  to: {:company, ico: "87654321"}
)
```

## Graph Analytics

Graph analytics algorithms operate on the full graph to compute structural properties that reveal patterns invisible to direct queries. These algorithms run as background tasks under [OTP](@/glossary/otp.md) supervision, with results cached in [ETS](@/glossary/ets.md) for fast lookup.

```elixir
# Calculate centrality (most connected entities)
{:ok, central} = PrismaticGraph.Analytics.degree_centrality(:company)
# => [%{name: "Holding Corp", degree: 47}, %{name: "Bank A", degree: 38}, ...]

# Detect communities using label propagation
{:ok, communities} = PrismaticGraph.Analytics.detect_communities(:company, :related_to)

# Find bridge entities (connecting otherwise separate groups)
{:ok, bridges} = PrismaticGraph.Analytics.betweenness_centrality(:person)

# PageRank for entity importance
{:ok, ranked} = PrismaticGraph.Analytics.pagerank(:company)
```

| Algorithm | Use Case | Complexity |
|-----------|----------|------------|
| Degree Centrality | Most connected entities | O(V + E) |
| Betweenness Centrality | Bridge entities between groups | O(V * E) |
| PageRank | Entity importance ranking | O(V + E) per iteration |
| Label Propagation | Community detection | O(V + E) |
| Shortest Path | Connection discovery | O(V + E) |
| Connected Components | Isolated subgraph identification | O(V + E) |

## Graph Schema Evolution

As intelligence requirements evolve, the graph schema must adapt to represent new entity types and relationship categories. The SchemaEvolution module manages these changes while preserving existing data:

```elixir
defmodule PrismaticGraph.SchemaEvolution do
  @spec migrate(atom(), keyword()) :: {:ok, MigrationResult.t()} | {:error, term()}
  def migrate(migration_name, opts \\ []) do
    dry_run = Keyword.get(opts, :dry_run, false)

    with {:ok, migration} <- load_migration(migration_name),
         {:ok, plan} <- compute_migration_plan(migration),
         :ok <- validate_backward_compatibility(plan) do
      if dry_run do
        {:ok, %MigrationResult{plan: plan, applied: false}}
      else
        apply_migration(plan)
      end
    end
  end
end
```

## Connection Pool Management

The KuzuDB adapter manages a connection pool to ensure efficient resource utilization under concurrent query loads. Each LiveView dashboard session and background analytics task acquires connections from the pool rather than creating direct database handles:

| Pool Parameter | Default | Production | Notes |
|---------------|---------|------------|-------|
| Pool size | 5 | 20 | Connections per KuzuDB instance |
| Checkout timeout | 5,000ms | 10,000ms | Maximum wait for available connection |
| Idle timeout | 30,000ms | 60,000ms | Connection recycling threshold |
| Queue target | 50ms | 100ms | Target wait time in checkout queue |

## OSINT Intelligence Graph

Data from [ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md), [Shodan](@/osint/shodan.md), [Censys](@/osint/censys.md), and other [OSINT sources](@/osint/_index.md) flows into the graph, creating a unified intelligence knowledge base.

```elixir
# Ingest company data from Czech registries
PrismaticGraph.Ingestion.ingest_company(ares_data, justice_data)

# Ingest infrastructure relationships
PrismaticGraph.Ingestion.ingest_infrastructure(shodan_data, censys_data)

# Query across data sources
{:ok, result} = PrismaticGraph.query("""
  MATCH (c:Company {ico: '12345678'})-[:HOSTS]-(ip:IPAddress)-[:HOSTS]-(other:Company)
  RETURN other.name, ip.address
""")
```

## NABLA Compliance

| NABLA Axiom | Graph Enforcement | Implementation |
|-------------|------------------|----------------|
| Provenance Mandatory | Every node and edge carries source and timestamp metadata | Ingestion pipeline attaches provenance to all graph elements |
| Signal Plurality | Multi-source entity verification before graph insertion | Cross-source validation required for high-confidence entities |
| Source Independence | Each OSINT source ingests independently | Separate ingestion workers per source prevent cross-contamination |
| Contradiction Preservation | Conflicting relationship data preserved as parallel edges | Multiple edges with different sources maintained |
| Time Decay | Entity freshness tracked through last-observed timestamps | Stale entities flagged for re-verification |

## Testing

Schema tests verify node type, edge type, and property constraint definitions. Query tests verify Cypher execution, parameterization, and result mapping against known graph fixtures. Analytics tests verify algorithm correctness using small, manually-verified graph structures with known centrality and community properties.

Integration tests exercise the full pipeline from OSINT data ingestion through graph construction and querying. Property-based tests generate random graph structures to verify algorithm correctness invariants. Schema evolution tests verify migration safety using backward compatibility checks against existing graph data.

## Integration Points

| Application | Relationship |
|-------------|-------------|
| [Prismatic Storage](@/apps/prismatic-storage.md) | KuzuDB adapter via Graphable trait |
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | Entity data ingestion from OSINT sources |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | [Attack surface](@/glossary/attack-surface.md) relationship mapping |
| [Prismatic Web](@/apps/prismatic-web.md) | Graph visualization in LiveView dashboards |
| [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) | Czech registry entity relationship data |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| 4-hop traversal | < 100ms | KuzuDB embedded engine |
| Shortest path | < 50ms | Bidirectional BFS |
| Community detection | < 5s | Full graph, 100K+ nodes |
| Entity ingestion | 10K+ entities/s | Batch mode with merge |
| Total nodes | 100K+ | Across all entity types |
| Total edges | 500K+ | All relationship types |
| Schema migration | < 30s | Backward-compatible changes |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :graph, :query_executed]`, `[:prismatic, :graph, :entity_ingested]`, `[:prismatic, :graph, :analytics_computed]`.

## Related Resources

- [Prismatic Storage Core](@/apps/prismatic-storage-core.md) -- Storage adapter trait system
- [Prismatic Storage KuzuDB](@/apps/prismatic-storage-kuzudb.md) -- Graph storage adapter implementation
- [Consolidation Architect](@/agents/consolidation-architect.md) -- Entity deduplication and graph merge operations
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews graph schema design and query optimization
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Ensures KuzuDB integration follows storage adapter patterns
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Graph traversal enables cross-domain entity relationship discovery
- [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) -- Graph spans corporate, infrastructure, and social domains
- [Quality Gates](@/capabilities/quality-gates.md) -- Graph schema and query correctness verified through contract testing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)