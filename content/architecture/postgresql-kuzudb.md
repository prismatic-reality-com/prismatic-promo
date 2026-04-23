+++
title = "PostgreSQL + KuzuDB"
weight = 2
date = 2026-01-10
[extra]
icon = "database"
color = "blue"
description = "Hybrid relational-graph database architecture combining PostgreSQL for transactional data with KuzuDB for complex entity relationship traversal and ownership chain analysis"
date_created = "2025-08-15"
reading_time = "13 min"
difficulty = "advanced"
tags = ["postgresql", "kuzudb", "graph-database", "hybrid-storage", "ecto", "cypher", "entity-resolution"]
related_articles = ["storage-adapters", "meilisearch", "telemetry", "supervision-trees"]
maturity = "production"
author = "Tomas Korcak (korczis)"
word_count = 1325
date_modified = "2026-02-23"
keywords = ["PostgreSQL", "KuzuDB", "Hybrid", "architecture", "Prismatic Platform", "ACID"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "PostgreSQL + KuzuDB - Prismatic Platform"
+++

## Overview

Prismatic Platform employs a hybrid database architecture that combines [PostgreSQL](/glossary/postgresql/) for structured relational data with [KuzuDB](/glossary/kuzudb/) for graph-based entity relationship traversal. This is not a compromise between two paradigms -- it is a deliberate architectural decision that leverages the distinct strengths of each system for the workloads they handle best.

The fundamental insight driving this design is that intelligence platforms must handle two fundamentally different data access patterns. The first is transactional: creating, reading, updating, and deleting structured records with ACID guarantees -- assets, findings, sessions, audit logs. [PostgreSQL](/glossary/postgresql/) excels at this, with decades of battle-tested reliability, rich indexing, and the [Elixir](/glossary/elixir/) ecosystem's mature [Ecto](/glossary/ecto/) integration. The second pattern is relational traversal: "find all companies owned by Jan Novak through any ownership chain" or "identify all entities within 3 relationship hops of a sanctioned entity." These queries require recursive path traversal that, while possible in PostgreSQL via recursive CTEs, becomes prohibitively expensive at scale. KuzuDB handles these queries natively with graph-optimized storage and Cypher query language.

The hybrid architecture is implemented through the platform's [storage adapter system](/architecture/storage-adapters/), with dedicated adapters for each database ([Ecto adapter](/apps/prismatic-storage-ecto/), [KuzuDB adapter](/apps/prismatic-storage-kuzudb/)) and a synchronization layer that keeps the two systems consistent.

## Why a Hybrid Approach

### The Relational Ceiling

Consider a common intelligence query: "Find all companies ultimately controlled by a specific person, through any chain of ownership, board membership, or proxy arrangements." In PostgreSQL, this requires a recursive CTE:

```sql
WITH RECURSIVE ownership_chain AS (
  -- Base case: direct relationships
  SELECT p.name AS controller, c.name AS company, c.ico, 1 AS depth
  FROM persons p
  JOIN directorships d ON d.person_id = p.id
  JOIN companies c ON c.id = d.company_id
  WHERE p.name = 'Jan Novak'

  UNION ALL

  -- Recursive case: follow ownership links
  SELECT oc.controller, c2.name, c2.ico, oc.depth + 1
  FROM ownership_chain oc
  JOIN ownerships o ON o.owner_ico = oc.ico
  JOIN companies c2 ON c2.ico = o.owned_ico
  WHERE oc.depth < 10  -- Safety limit
)
SELECT DISTINCT company, ico, depth FROM ownership_chain ORDER BY depth;
```

This works for small graphs but degrades rapidly. With 100,000 companies and 500,000 ownership relationships, the recursive CTE scans the entire ownership table at each recursion level. Measured performance on the platform's Czech corporate [registry](/glossary/registry-otp/) dataset:

| Depth | PostgreSQL CTE | KuzuDB Cypher | Speedup |
|-------|---------------|---------------|---------|
| 2 hops | 45ms | 2ms | 22x |
| 4 hops | 320ms | 8ms | 40x |
| 6 hops | 2,800ms | 18ms | 155x |
| 8 hops | 18,500ms | 35ms | 528x |
| 10 hops | timeout (>30s) | 52ms | >576x |

The performance gap grows super-linearly because PostgreSQL must re-scan and join at each recursion level, while KuzuDB uses adjacency-list storage with index-free adjacency -- following a relationship is a pointer dereference, not a table scan.

### The Graph Limitation

Conversely, KuzuDB is not suitable for all workloads. It lacks PostgreSQL's ACID transaction support across complex multi-table operations, its query planner is optimized for traversal rather than aggregation, and it has no equivalent to PostgreSQL's rich ecosystem of extensions (PostGIS, [TimescaleDB](/glossary/timescaledb/), pg_trgm). The platform needs both.

| Capability | PostgreSQL | KuzuDB | Winner |
|-----------|-----------|--------|--------|
| ACID transactions | Full | Limited | PostgreSQL |
| Complex aggregations | Excellent | Basic | PostgreSQL |
| Recursive traversal | Slow (CTE) | Native (Cypher) | KuzuDB |
| Path finding | Very slow | O(V+E) BFS/DFS | KuzuDB |
| [Pattern matching](/glossary/pattern-matching/) | regex/LIKE | Graph patterns | KuzuDB |
| Schema evolution | Migrations | Flexible | PostgreSQL |
| Ecosystem maturity | 30+ years | Emerging | PostgreSQL |
| Concurrent writes | Excellent (MVCC) | Limited | PostgreSQL |
| Memory footprint | Configurable | Embedded (low) | KuzuDB |
| Full-text search | pg_trgm/tsvector | None | PostgreSQL |

## PostgreSQL Architecture

### Schema Design

The PostgreSQL schema follows a [domain-driven design](/glossary/domain-driven-design/) aligned with the platform's [umbrella application structure](/architecture/umbrella-apps/). Each domain owns its tables, and cross-domain references use foreign keys with explicit naming conventions.

```elixir
defmodule PrismaticPerimeter.Schema.Asset do
  @moduledoc """
  Core asset schema for the Perimeter EASM system.

  Assets represent discovered entities on the attack surface:
  domains, IP addresses, SSL certificates, and running services.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "perimeter_assets" do
    field :type, Ecto.Enum, values: [:domain, :ip, :certificate, :service]
    field :identifier, :string
    field :metadata, :map, default: %{}
    field :risk_score, :integer
    field :security_grade, Ecto.Enum, values: [:a, :b, :c, :d, :f]
    field :last_seen, :utc_datetime_usec
    field :first_discovered, :utc_datetime_usec

    belongs_to :organization, PrismaticPerimeter.Schema.Organization
    has_many :findings, PrismaticPerimeter.Schema.Finding
    has_many :scan_results, PrismaticPerimeter.Schema.ScanResult

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields [:type, :identifier, :organization_id]
  @optional_fields [:metadata, :risk_score, :security_grade, :last_seen, :first_discovered]

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:risk_score, 0..1000)
    |> unique_constraint([:type, :identifier, :organization_id])
    |> foreign_key_constraint(:organization_id)
  end
end
```

### Ecto Repository Configuration

```elixir
defmodule Prismatic.Repo do
  @moduledoc """
  Primary PostgreSQL repository.

  Configured with connection pooling via DBConnection,
  runtime URL configuration, and telemetry integration.
  """

  use Ecto.Repo,
    otp_app: :prismatic,
    adapter: Ecto.Adapters.Postgres

  @spec init(atom(), keyword()) :: {:ok, keyword()}
  def init(_type, config) do
    config =
      config
      |> Keyword.put(:url, System.get_env("DATABASE_URL"))
      |> Keyword.put(:pool_size, String.to_integer(System.get_env("POOL_SIZE", "10")))
      |> Keyword.put(:queue_target, 5_000)
      |> Keyword.put(:queue_interval, 1_000)

    {:ok, config}
  end
end
```

### PostgreSQL Optimization Strategies

The platform applies several PostgreSQL optimization techniques, each chosen based on measured query patterns:

| Technique | Implementation | Measured Impact |
|-----------|----------------|-----------------|
| **B-tree indexes** | Foreign keys, lookup columns | 10-100x for point queries |
| **GIN indexes** | JSONB metadata columns | 5-20x for containment queries |
| **Partial indexes** | `WHERE risk_score > 700` for high-risk assets | 3-5x for filtered queries |
| **Table partitioning** | Time-based for audit logs (monthly) | 10-50x for time-range scans |
| **[Connection pooling](/glossary/connection-pooling/)** | DBConnection + 10 connections default | Eliminates connection overhead |
| **Prepared statements** | Ecto default via DBConnection | 2-3x for repeated queries |
| **Read replicas** | Ecto multi-repo for read-heavy paths | 2x throughput for reads |

```elixir
defmodule PrismaticPerimeter.Schema.AuditLog do
  @moduledoc "Time-partitioned audit log for compliance tracking"

  use Ecto.Schema

  # Partitioned by month on inserted_at
  @primary_key false
  schema "perimeter_audit_logs" do
    field :id, :binary_id, autogenerate: true, primary_key: true
    field :action, :string
    field :actor, :string
    field :resource_type, :string
    field :resource_id, :string
    field :changes, :map
    field :metadata, :map

    timestamps(type: :utc_datetime_usec, updated_at: false)
  end
end
```

## KuzuDB Architecture

### Graph Data Model

KuzuDB stores the platform's entity relationship graph. The data model maps directly to the intelligence domain: companies own other companies, people serve as directors, entities have addresses, and relationships carry temporal metadata (since/until dates, ownership percentages).

```elixir
defmodule Prismatic.Graph do
  @moduledoc """
  KuzuDB graph database integration via kuzu-ex.

  Defines the node and relationship schema for corporate
  intelligence graph traversal.
  """

  use Kuzu

  # Node types
  defnode :company do
    field :ico, :string       # Czech company ID
    field :name, :string
    field :legal_form, :string
    field :founded, :date
    field :status, :string    # active, dissolved, in_liquidation
    field :risk_score, :integer
  end

  defnode :person do
    field :name, :string
    field :birth_date, :date
    field :nationality, :string
  end

  defnode :address do
    field :street, :string
    field :city, :string
    field :postal_code, :string
    field :country, :string
  end

  # Relationship types
  defrel :owns, from: :company, to: :company do
    field :percentage, :float
    field :since, :date
    field :until, :date       # nil = current
    field :ownership_type, :string  # direct, indirect, beneficial
  end

  defrel :director, from: :person, to: :company do
    field :since, :date
    field :until, :date
    field :role, :string      # statutory_director, board_member, proxy
  end

  defrel :registered_at, from: :company, to: :address do
    field :since, :date
    field :until, :date
  end

  defrel :resides_at, from: :person, to: :address do
    field :since, :date
  end
end
```

### Cypher Query Patterns

KuzuDB uses the Cypher query language, which provides declarative graph pattern matching. Here are the core query patterns used across the platform:

```cypher
-- Ownership chain traversal (variable-length path)
-- Find all companies owned by a person through any chain of ownership
MATCH (p:Person {name: 'Jan Novak'})-[:DIRECTOR]->(c1:Company)-[:OWNS*1..10]->(owned:Company)
RETURN owned.name, owned.ico, length(path) AS chain_depth
ORDER BY chain_depth

-- Common controller detection
-- Find entities that control two seemingly unrelated companies
MATCH (c1:Company {ico: '12345678'})<-[:OWNS*1..5]-(controller)-[:OWNS*1..5]->(c2:Company {ico: '87654321'})
RETURN controller.name, controller.ico,
       length(path1) AS depth_to_c1,
       length(path2) AS depth_to_c2

-- Circular ownership detection (compliance red flag)
MATCH path = (c:Company)-[:OWNS*2..8]->(c)
RETURN [n IN nodes(path) | n.name] AS circular_chain,
       [r IN relationships(path) | r.percentage] AS percentages

-- Address clustering (shared registration addresses)
MATCH (c1:Company)-[:REGISTERED_AT]->(a:Address)<-[:REGISTERED_AT]-(c2:Company)
WHERE c1.ico <> c2.ico
RETURN a.street, a.city, count(DISTINCT c1) + count(DISTINCT c2) AS company_count
ORDER BY company_count DESC
LIMIT 20

-- Sanctioned entity proximity (risk assessment)
MATCH (sanctioned:Person {status: 'sanctioned'}),
      path = shortestPath((sanctioned)-[*..4]-(target:Company {ico: $target_ico}))
RETURN length(path) AS distance,
       [n IN nodes(path) | coalesce(n.name, n.ico)] AS path_entities
```

### KuzuDB Performance Characteristics

KuzuDB operates as an embedded database -- it runs in-process with the application, using memory-mapped files for storage. This eliminates network overhead entirely and provides predictable latency.

| Operation | Dataset Size | p50 Latency | p99 Latency | Notes |
|-----------|-------------|------------|------------|-------|
| Single-hop traversal | 100K nodes | 0.3ms | 1.2ms | Index-free adjacency |
| 4-hop ownership chain | 100K nodes, 500K edges | 8ms | 35ms | Variable-length path |
| Shortest path (depth 6) | 100K nodes, 500K edges | 12ms | 48ms | BFS with early termination |
| Circular ownership detection | 100K nodes, 500K edges | 45ms | 180ms | Full cycle enumeration |
| Bulk node insertion (10K) | N/A | 120ms | 350ms | Batch mode |
| Bulk edge insertion (50K) | N/A | 280ms | 650ms | Batch mode with validation |

## Synchronization Architecture

The two databases must remain consistent. The synchronization layer ensures that changes to relational data are reflected in the graph and vice versa. The design follows an event-driven pattern integrated with the platform's [PubSub system](/architecture/pubsub/).

```elixir
defmodule Prismatic.Sync.GraphSynchronizer do
  @moduledoc """
  Event-driven synchronization between PostgreSQL and KuzuDB.

  Listens for Ecto changeset events via PubSub and propagates
  changes to the graph database. Supports both real-time sync
  (for individual changes) and batch reindex (for bulk operations).
  """

  use GenServer

  alias Prismatic.Graph
  alias Phoenix.PubSub

  @pubsub Prismatic.PubSub
  @sync_topic "db:sync"

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    PubSub.subscribe(@pubsub, @sync_topic)
    {:ok, %{pending: [], sync_count: 0}}
  end

  @impl true
  def handle_info({:company_created, %{ico: ico, name: name} = company}, state) do
    :ok = Graph.upsert_node(:company, %{
      ico: ico,
      name: name,
      founded: company.founded_date,
      status: company.status,
      risk_score: company.risk_score
    })

    :telemetry.execute(
      [:prismatic, :sync, :graph],
      %{count: 1},
      %{operation: :company_created, ico: ico}
    )

    {:noreply, %{state | sync_count: state.sync_count + 1}}
  end

  @impl true
  def handle_info({:ownership_created, ownership}, state) do
    :ok = Graph.upsert_rel(:owns,
      from: {:company, ico: ownership.owner_ico},
      to: {:company, ico: ownership.owned_ico},
      props: %{
        percentage: ownership.percentage,
        since: ownership.effective_date,
        ownership_type: ownership.type
      }
    )

    {:noreply, %{state | sync_count: state.sync_count + 1}}
  end

  @impl true
  def handle_info({:ownership_revoked, ownership}, state) do
    :ok = Graph.update_rel(:owns,
      from: {:company, ico: ownership.owner_ico},
      to: {:company, ico: ownership.owned_ico},
      props: %{until: ownership.revocation_date}
    )

    {:noreply, %{state | sync_count: state.sync_count + 1}}
  end
end
```

### Consistency Guarantees

The synchronization is eventually consistent, not strongly consistent. PostgreSQL is the source of truth for all structured data. KuzuDB is a derived view optimized for graph traversal. If the synchronization process crashes (and is restarted by the [supervisor](/architecture/supervision-trees/)), a full reconciliation runs on restart.

```elixir
defmodule Prismatic.Sync.Reconciler do
  @moduledoc """
  Full reconciliation between PostgreSQL and KuzuDB.

  Runs on startup and can be triggered manually for recovery.
  Compares node/edge counts and checksums to detect drift.
  """

  @spec reconcile() :: {:ok, %{nodes_synced: integer(), edges_synced: integer()}}
  def reconcile do
    companies = Prismatic.Repo.all(Company)
    ownerships = Prismatic.Repo.all(Ownership)
    persons = Prismatic.Repo.all(Person)
    directorships = Prismatic.Repo.all(Directorship)

    node_count =
      sync_nodes(:company, companies) +
      sync_nodes(:person, persons)

    edge_count =
      sync_edges(:owns, ownerships) +
      sync_edges(:director, directorships)

    {:ok, %{nodes_synced: node_count, edges_synced: edge_count}}
  end
end
```

## Query Routing Strategy

The application layer must decide which database to query for each operation. This routing is handled by a query classifier that examines the query pattern and routes accordingly.

| Query Pattern | Target Database | Rationale |
|--------------|----------------|-----------|
| CRUD on single entity | PostgreSQL | ACID, indexed lookup |
| Aggregation (COUNT, SUM, AVG) | PostgreSQL | Optimized query planner |
| Time-range filtering | PostgreSQL | Partitioned tables |
| Full-text search | PostgreSQL + [Meilisearch](/architecture/meilisearch/) | pg_trgm + dedicated search |
| Single-hop relationship | Either (context-dependent) | Both perform well |
| Multi-hop traversal (3+) | KuzuDB | Native graph traversal |
| Path finding (shortest path) | KuzuDB | BFS/DFS algorithms |
| Pattern matching (subgraph) | KuzuDB | Cypher pattern expressions |
| Compliance [audit trail](/glossary/audit-trail/) | PostgreSQL | Immutable, time-ordered |
| Network topology analysis | KuzuDB | Graph centrality, clustering |

```elixir
defmodule Prismatic.QueryRouter do
  @moduledoc """
  Routes queries to the appropriate database based on
  query classification and access pattern analysis.
  """

  @spec query(atom(), map()) :: {:ok, term()} | {:error, term()}
  def query(:ownership_chain, %{person: name, max_depth: depth}) do
    # Multi-hop traversal -> KuzuDB
    Prismatic.Graph.query("""
    MATCH (p:Person {name: $name})-[:DIRECTOR]->(c:Company)-[:OWNS*1..#{depth}]->(owned:Company)
    RETURN owned.name, owned.ico
    """, %{name: name})
  end

  def query(:asset_search, %{query: text, filters: filters}) do
    # Full-text search -> Meilisearch with PostgreSQL fallback
    PrismaticSearch.Client.search("assets", text, filter: filters)
  end

  def query(:risk_assessment, %{ico: ico}) do
    # Hybrid: PostgreSQL for base data, KuzuDB for graph metrics
    with {:ok, company} <- fetch_company(ico),
         {:ok, graph_metrics} <- compute_graph_risk(ico) do
      {:ok, merge_risk_assessment(company, graph_metrics)}
    end
  end
end
```

## Comparison with Alternative Architectures

### Single-Database (PostgreSQL Only)

Using only PostgreSQL simplifies operations (one database to manage, backup, monitor) but creates a performance ceiling for graph queries. The recursive CTE approach works for small graphs but becomes the bottleneck for intelligence workloads at scale. The platform initially used PostgreSQL-only and migrated graph queries to KuzuDB when ownership chain queries exceeded 5-second SLA at depth 6.

### Single-Database (Neo4j or Dedicated Graph DB)

Using only a graph database is tempting for an intelligence platform but creates problems for transactional workloads. Graph databases typically lack PostgreSQL's ACID guarantees for complex multi-entity transactions, their aggregation performance is poor compared to columnar/relational engines, and their ecosystem tooling (migrations, ORM, monitoring) is less mature. Neo4j specifically was evaluated and rejected due to its licensing model (enterprise features behind commercial license) and its JVM-based architecture (poor fit for an Elixir/[BEAM](/glossary/beam/) ecosystem).

### PostgreSQL + Graph Extension (Apache AGE)

Apache AGE adds graph query capabilities directly to PostgreSQL, eliminating the synchronization problem. However, AGE's performance for deep traversals does not match dedicated graph engines, and its Cypher compatibility is incomplete. The extension also adds complexity to PostgreSQL upgrades and has a smaller community than KuzuDB.

### The Prismatic Approach: Best Tool for Each Job

The hybrid architecture adds synchronization complexity but delivers optimal performance for each workload type. PostgreSQL handles the 80% of queries that are transactional, and KuzuDB handles the 20% that are graph-intensive. The [storage adapter pattern](/architecture/storage-adapters/) abstracts the routing, so application code does not need to know which database serves a given query.

## Integration with Platform Storage Layer

The PostgreSQL and KuzuDB adapters are both implementations of the platform's [storage adapter trait](/apps/prismatic-storage-core/). This provides a unified interface for the application layer.

```elixir
defmodule PrismaticStorage.Adapters.Ecto do
  @moduledoc "PostgreSQL adapter via Ecto"
  @behaviour PrismaticStorage.AdapterBehaviour

  @impl true
  def get(schema, id, opts) do
    repo = Keyword.get(opts, :repo, Prismatic.Repo)
    case repo.get(schema, id) do
      nil -> {:error, :not_found}
      record -> {:ok, record}
    end
  end

  @impl true
  def list(schema, filters, opts) do
    repo = Keyword.get(opts, :repo, Prismatic.Repo)
    query = build_query(schema, filters)
    {:ok, repo.all(query)}
  end
end

defmodule PrismaticStorage.Adapters.KuzuDB do
  @moduledoc "KuzuDB graph adapter"
  @behaviour PrismaticStorage.AdapterBehaviour

  @impl true
  def get(:company, ico, _opts) do
    Prismatic.Graph.query(
      "MATCH (c:Company {ico: $ico}) RETURN c",
      %{ico: ico}
    )
  end

  @impl true
  def traverse(start_node, relationship, opts) do
    max_depth = Keyword.get(opts, :max_depth, 5)
    Prismatic.Graph.query(
      "MATCH path = (start)-[:#{relationship}*1..#{max_depth}]->(end) " <>
      "WHERE start.ico = $ico RETURN path",
      %{ico: start_node.ico}
    )
  end
end
```

The [ETS adapter](/apps/prismatic-storage-ets/) provides an additional in-memory caching layer for frequently accessed graph query results, reducing the load on both databases for hot-path queries. The [telemetry system](/architecture/telemetry/) tracks query latency and routing decisions across all adapters, enabling data-driven optimization of the routing strategy.

## Future Directions

Current development focuses on three areas: real-time graph change streaming (using PostgreSQL logical replication to feed KuzuDB updates without application-layer synchronization), graph-powered [LiveView](/architecture/phoenix-liveview/) dashboards for interactive ownership chain visualization, and integration with the [NABLA framework](/architecture/nabla-framework/) for graph-based belief provenance tracking. The long-term vision is a unified query interface where the application expresses intent and the platform automatically selects the optimal execution strategy across both databases.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)