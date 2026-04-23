+++
title = "Relational Database"
weight = 50
[extra]
description = "A structured data storage system based on the relational model that organizes data into tables with defined schemas, enforces referential integrity through foreign keys, and supports ACID transactions -- the primary persistence layer of the Prismatic Platform via PostgreSQL and Ecto"
category = "data"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "data-infrastructure"
related_concepts = ["postgresql", "ecto", "acid-transactions", "sql", "data-integrity"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 5
prerequisites = ["sql", "data-modeling", "acid-transactions"]
learning_path = ["sql", "relational-database", "postgresql", "ecto", "acid-transactions", "data-pipeline"]
interactive_demos = ["/labs/glossary/relational-database"]
code_examples = ["Ecto schema definition", "migration with referential integrity", "transactional writes with Ecto.Multi", "query optimization with indexes"]
external_resources = ["https://hexdocs.pm/ecto/Ecto.html", "https://www.postgresql.org/docs/current/", "https://hexdocs.pm/ecto_sql/Ecto.Migration.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["referential integrity enforcement", "concurrent transaction isolation", "migration rollback verification", "query performance under load"]
keywords = ["relational database", "PostgreSQL", "Ecto", "SQL database", "ACID transactions", "relational model", "database schema", "referential integrity", "database migrations", "query optimization"]
tags = ["database", "postgresql", "ecto", "data", "persistence", "sql", "acid", "infrastructure"]
related_terms = ["postgresql", "ecto", "acid-transactions", "data-pipeline", "scalability", "performance", "monitoring", "telemetry", "security", "encryption"]
word_count = 1554
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Relational Database - Prismatic Platform"
+++

## Definition

A **Relational Database** is a data management system that stores information in structured tables (relations), where each table consists of rows (tuples) and columns (attributes) defined by a schema. The relational model, first formalized by E.F. Codd in 1970, provides a mathematical foundation for data organization based on set theory and first-order predicate logic. Relational databases enforce data integrity through constraints (primary keys, foreign keys, unique constraints, check constraints), support [ACID transactions](@/glossary/acid-transactions.md) for reliable concurrent data modification, and provide a declarative query language (SQL) that allows users to express what data they want rather than how to retrieve it.

In the [Prismatic Platform](@/glossary/elixir.md), [PostgreSQL](@/glossary/postgresql.md) serves as the primary relational database, accessed through the [Ecto](@/glossary/ecto.md) library. Every persistent entity -- from agent configurations and OSINT scan results to quality metrics and session state -- is stored in PostgreSQL tables with rigorous schema definitions, enforced referential integrity, and comprehensive indexing. The platform's 115 umbrella applications share a PostgreSQL cluster through Ecto's repository pattern, with each application's data isolated by schema namespace.

## Overview

The relational model has endured for over five decades because it provides a principled approach to three fundamental data management challenges: structure (how data is organized), integrity (how correctness is maintained), and manipulation (how data is queried and modified).

### The Relational Model

Edgar F. Codd's original paper "A Relational Model of Data for Large Shared Data Banks" (1970) introduced several concepts that remain the foundation of modern database systems:

| Concept | Formal Term | Practical Equivalent | Purpose |
|---------|-------------|---------------------|---------|
| **Relation** | Set of tuples | Table | Data organization |
| **Tuple** | Ordered set of values | Row/record | Single data instance |
| **Attribute** | Named domain value | Column/field | Data property |
| **Domain** | Set of allowable values | Column type + constraints | Data validity |
| **Primary Key** | Unique tuple identifier | ID column | Row identification |
| **Foreign Key** | Cross-relation reference | Reference column | Relationship encoding |

### Why Relational for the Prismatic Platform

The Prismatic Platform chose PostgreSQL as its primary data store for specific technical reasons:

| Requirement | Relational Solution | Alternative Trade-off |
|-------------|--------------------|-----------------------|
| **Agent state consistency** | ACID transactions ensure no partial updates | Document DBs risk inconsistent nested updates |
| **Cross-entity queries** | SQL JOINs across tables are first-class | Graph/Document DBs require denormalization |
| **Schema evolution** | Migrations with rollback support | Schema-less DBs defer validation to application |
| **OSINT data integrity** | Foreign keys prevent orphaned records | Key-value stores cannot enforce referential integrity |
| **Audit trail** | Temporal tables and triggers | Requires application-level implementation elsewhere |
| **Concurrent access** | MVCC isolation levels | Many NoSQL systems offer only eventual consistency |

## Technical Details

### Schema Design with Ecto

[Ecto](@/glossary/ecto.md) schemas map Elixir structs to relational tables, providing compile-time type checking and runtime validation:

```elixir
defmodule Prismatic.Schema.Agent do
  @moduledoc """
  Schema for AIAD agent persistence. Maps agent metadata,
  configuration, and runtime state to the agents table
  with full referential integrity.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
    id: Ecto.UUID.t(),
    name: String.t(),
    domain: String.t(),
    tier: integer(),
    status: String.t(),
    config: map(),
    inserted_at: NaiveDateTime.t(),
    updated_at: NaiveDateTime.t()
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "agents" do
    field :name, :string
    field :domain, :string
    field :tier, :integer
    field :status, :string, default: "active"
    field :config, :map, default: %{}

    has_many :executions, Prismatic.Schema.AgentExecution
    belongs_to :team, Prismatic.Schema.Team

    timestamps(type: :naive_datetime_usec)
  end

  @required_fields ~w(name domain tier)a
  @optional_fields ~w(status config team_id)a

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(%__MODULE__{} = agent, attrs) do
    agent
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:tier, 1..5)
    |> validate_inclusion(:status, ~w(active inactive suspended))
    |> validate_length(:name, min: 1, max: 255)
    |> unique_constraint(:name)
    |> foreign_key_constraint(:team_id)
  end
end
```

### Migrations and Schema Evolution

Relational databases use migrations to evolve schemas over time. Each migration is a versioned, reversible transformation that modifies the database structure:

```elixir
defmodule Prismatic.Repo.Migrations.CreateAgentsTable do
  @moduledoc """
  Creates the agents table with full referential integrity,
  appropriate indexes, and constraint enforcement.
  """

  use Ecto.Migration

  def change do
    create table(:agents, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :domain, :string, null: false
      add :tier, :integer, null: false
      add :status, :string, null: false, default: "active"
      add :config, :map, null: false, default: %{}
      add :team_id, references(:teams, type: :binary_id, on_delete: :nilify_all)

      timestamps(type: :naive_datetime_usec)
    end

    create unique_index(:agents, [:name])
    create index(:agents, [:domain])
    create index(:agents, [:status])
    create index(:agents, [:team_id])
    create index(:agents, [:tier, :status])

    create constraint(:agents, :valid_tier, check: "tier >= 1 AND tier <= 5")
    create constraint(:agents, :valid_status,
      check: "status IN ('active', 'inactive', 'suspended')")
  end
end
```

### ACID Transactions with Ecto.Multi

For operations that must modify multiple tables atomically, [ACID transactions](@/glossary/acid-transactions.md) ensure all changes succeed or none do. Ecto.Multi provides a composable transaction builder:

```elixir
defmodule Prismatic.RelationalDB.TransactionDemo do
  @moduledoc """
  Demonstrates ACID transaction patterns using Ecto.Multi
  for multi-table operations that must be atomic. Used
  throughout the platform for operations spanning multiple
  entity types.
  """

  alias Ecto.Multi
  alias Prismatic.Repo

  @spec create_agent_with_team(map(), map()) :: {:ok, map()} | {:error, atom(), term(), map()}
  def create_agent_with_team(agent_attrs, team_attrs) do
    Multi.new()
    |> Multi.insert(:team, Prismatic.Schema.Team.changeset(
      %Prismatic.Schema.Team{}, team_attrs
    ))
    |> Multi.insert(:agent, fn %{team: team} ->
      agent_attrs
      |> Map.put(:team_id, team.id)
      |> then(&Prismatic.Schema.Agent.changeset(%Prismatic.Schema.Agent{}, &1))
    end)
    |> Multi.insert(:audit_entry, fn %{agent: agent, team: team} ->
      Prismatic.Schema.AuditEntry.changeset(%Prismatic.Schema.AuditEntry{}, %{
        entity_type: "agent",
        entity_id: agent.id,
        action: "created",
        details: %{team_id: team.id, agent_name: agent.name}
      })
    end)
    |> Repo.transaction()
  end

  @spec transfer_agent(Ecto.UUID.t(), Ecto.UUID.t()) :: {:ok, map()} | {:error, atom(), term(), map()}
  def transfer_agent(agent_id, new_team_id) do
    Multi.new()
    |> Multi.run(:agent, fn repo, _changes ->
      case repo.get(Prismatic.Schema.Agent, agent_id) do
        nil -> {:error, :agent_not_found}
        agent -> {:ok, agent}
      end
    end)
    |> Multi.run(:team, fn repo, _changes ->
      case repo.get(Prismatic.Schema.Team, new_team_id) do
        nil -> {:error, :team_not_found}
        team -> {:ok, team}
      end
    end)
    |> Multi.update(:transfer, fn %{agent: agent} ->
      Ecto.Changeset.change(agent, team_id: new_team_id)
    end)
    |> Repo.transaction()
  end
end
```

### Query Optimization

Relational databases excel at complex queries through the SQL query planner, which automatically optimizes execution plans based on table statistics, indexes, and join strategies:

```elixir
defmodule Prismatic.RelationalDB.QueryOptimization do
  @moduledoc """
  Demonstrates query patterns optimized for PostgreSQL.
  Includes index-aware queries, efficient joins, and
  aggregate operations.
  """

  import Ecto.Query

  alias Prismatic.Repo
  alias Prismatic.Schema.Agent

  @spec agents_by_domain_with_stats(String.t()) :: [map()]
  def agents_by_domain_with_stats(domain) do
    Agent
    |> where([a], a.domain == ^domain and a.status == "active")
    |> join(:left, [a], e in assoc(a, :executions))
    |> group_by([a, _e], a.id)
    |> select([a, e], %{
      agent: a,
      execution_count: count(e.id),
      last_execution: max(e.completed_at),
      avg_duration_ms: avg(e.duration_ms)
    })
    |> order_by([a, _e], desc: count(e.id))
    |> Repo.all()
  end

  @spec active_agent_summary() :: map()
  def active_agent_summary do
    Agent
    |> where([a], a.status == "active")
    |> group_by([a], a.domain)
    |> select([a], %{
      domain: a.domain,
      count: count(a.id),
      avg_tier: avg(a.tier),
      domains: fragment("array_agg(DISTINCT ?)", a.name)
    })
    |> Repo.all()
    |> Map.new(fn row -> {row.domain, row} end)
  end

  @spec search_agents(String.t(), keyword()) :: [Agent.t()]
  def search_agents(query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)

    Agent
    |> where([a], ilike(a.name, ^"%#{query}%") or ilike(a.domain, ^"%#{query}%"))
    |> limit(^limit)
    |> order_by([a], asc: a.name)
    |> Repo.all()
  end
end
```

### Normalization Levels

Relational database design follows normalization principles to eliminate data redundancy and update anomalies:

| Normal Form | Rule | Prismatic Application |
|-------------|------|-----------------------|
| **1NF** | Atomic values, no repeating groups | All columns are scalar; arrays stored as JSONB or separate tables |
| **2NF** | No partial dependencies on composite keys | All non-key attributes depend on the full primary key |
| **3NF** | No transitive dependencies | Agent domain metadata in separate domain table, not duplicated |
| **BCNF** | Every determinant is a candidate key | Applied to lookup tables (status codes, tier definitions) |
| **Denormalized** | Intentional redundancy for read performance | Materialized views for dashboard aggregates |

The Prismatic Platform targets 3NF for transactional tables and selectively denormalizes for read-heavy dashboard queries using PostgreSQL materialized views.

## Implementation in Prismatic Platform

### Database Architecture

The platform uses a single PostgreSQL cluster with logical separation:

```
+--------------------------------------------------------+
|                  PostgreSQL Cluster                      |
|                                                          |
|  +--------------+  +--------------+  +--------------+   |
|  | prismatic_dev|  |prismatic_test|  |prismatic_prod|   |
|  |              |  |              |  |              |   |
|  | Schema:      |  | Schema:      |  | Schema:      |   |
|  |  public      |  |  public      |  |  public      |   |
|  |  osint       |  |  osint       |  |  osint       |   |
|  |  perimeter   |  |  perimeter   |  |  perimeter   |   |
|  |  agents      |  |  agents      |  |  agents      |   |
|  |  quality     |  |  quality     |  |  quality     |   |
|  +--------------+  +--------------+  +--------------+   |
|                                                          |
|  Extensions: uuid-ossp, pgcrypto, pg_trgm, citext       |
|  Connection Pool: DBConnection (per Ecto.Repo)           |
+--------------------------------------------------------+
```

### Connection Pooling

Each [Ecto](@/glossary/ecto.md) Repo maintains a connection pool using DBConnection, preventing connection exhaustion under concurrent load:

| Environment | Pool Size | Queue Target | Queue Interval | Timeout |
|-------------|-----------|--------------|----------------|---------|
| **Development** | 10 | 50ms | 1000ms | 15s |
| **Test** | 1 (sandbox) | 50ms | 1000ms | 15s |
| **Production** | 20 | 50ms | 1000ms | 15s |
| **Staging** | 10 | 50ms | 1000ms | 15s |

### PostgreSQL Extensions

| Extension | Purpose | Platform Use |
|-----------|---------|-------------|
| **uuid-ossp** | UUID generation | Primary keys for all entities |
| **pgcrypto** | Cryptographic functions | Password hashing, token generation |
| **pg_trgm** | Trigram similarity | Fuzzy search on agent names |
| **citext** | Case-insensitive text | Email addresses, domain names |
| **pg_stat_statements** | Query performance tracking | Slow query identification |

## Comparison with Non-Relational Alternatives

| Feature | Relational (PostgreSQL) | Document (MongoDB) | Key-Value (Redis) | Graph (KuzuDB) | Search (Meilisearch) |
|---------|----------------------|-------------------|-------------------|----------------|---------------------|
| **Schema** | Strict, enforced | Flexible, optional | None | Property graph | Index mapping |
| **Transactions** | Full ACID | Multi-doc (4.0+) | Single-key atomic | Limited | None |
| **Joins** | Native, optimized | $lookup (slow) | None | Native traversal | None |
| **Consistency** | Strong | Configurable | Strong (single-key) | Strong | Eventually consistent |
| **Query Language** | SQL (declarative) | MQL (imperative) | Commands | Cypher | REST/SDK |
| **Scale Pattern** | Vertical + read replicas | Horizontal sharding | Horizontal sharding | Vertical | Horizontal |
| **Prismatic Role** | Primary persistence | Not used | [Cache/sessions](@/glossary/redis.md) | Graph analysis | [Full-text search](@/glossary/meilisearch.md) |

The platform uses PostgreSQL as the system of record and delegates specialized workloads to purpose-built stores: [Redis](@/glossary/redis.md) for ephemeral caching, [Meilisearch](@/glossary/meilisearch.md) for full-text search, and KuzuDB for graph analytics.

## Best Practices

**Design schemas in Third Normal Form, denormalize only with evidence.** Start with properly normalized tables. When [performance](@/glossary/performance.md) monitoring shows a query bottleneck, create a materialized view or denormalized table with clear documentation of the trade-off.

**Use Ecto changesets for all data modifications.** Never bypass Ecto's validation layer for direct SQL inserts. Changesets provide type coercion, constraint validation, and a consistent error format that the platform's error handling relies on.

**Create indexes based on query patterns, not guesswork.** Enable `pg_stat_statements` to identify the actual top queries by execution time. Create indexes that match these queries' WHERE, JOIN, and ORDER BY clauses. Remove unused indexes (they slow down writes).

**Use Ecto.Multi for all multi-table operations.** Individual `Repo.insert/2` calls outside a transaction risk partial state when one insert fails. Multi ensures atomicity and provides a clear rollback path with named steps for error identification.

**Set appropriate isolation levels.** The default `READ COMMITTED` level is correct for most operations. Use `SERIALIZABLE` only for operations where phantom reads would cause logical errors (financial calculations, sequence generation). Higher isolation levels reduce throughput.

**Version all schema changes through migrations.** Never modify production schemas through direct DDL. Every change must be a reversible Ecto migration, tested in the staging environment, and applied through the deployment pipeline.

## Common Pitfalls

**N+1 query problem.** Loading a list of agents and then issuing a separate query for each agent's team creates N+1 total queries. Use `Repo.preload/2` or join-based loading to fetch associated data in a single query.

**Missing indexes on foreign keys.** PostgreSQL does not automatically index foreign key columns. A JOIN on an unindexed foreign key triggers a sequential scan. Always create indexes on foreign key columns.

**Overusing JSONB columns.** While PostgreSQL's JSONB type is powerful, overusing it defeats the purpose of a relational schema. JSONB columns cannot enforce referential integrity, have weaker type guarantees, and make migrations harder. Use JSONB for truly dynamic data (plugin configurations, external API responses) and proper columns for structured data.

**Long-running transactions holding locks.** A transaction that runs for minutes (bulk imports, complex reports) holds row locks that block other writes. Use batch processing with smaller transactions, or read-only replicas for reporting queries.

**Ignoring connection pool exhaustion.** When all pool connections are checked out, new queries queue and eventually timeout. Monitor pool utilization via [telemetry](@/glossary/telemetry.md) and scale pool size to match concurrent query demand.

## Use Cases

### OSINT Intelligence Storage

All [OSINT](@/glossary/osint.md) scan results are stored in normalized PostgreSQL tables. Entity data (companies, domains, IP addresses) lives in entity tables, with scan results in separate tables linked by foreign keys. This normalization enables cross-scan analysis: querying all historical scans for a given entity, comparing results over time, and detecting changes.

### Agent Configuration Persistence

Each of the 530+ [AIAD agents](@/glossary/aiad.md) has its configuration stored relationally. Agent metadata, capability declarations, execution history, and performance metrics occupy separate tables with foreign key relationships. This enables complex queries like "find all agents in the security domain with execution success rates above 95%."

### Quality Metrics Tracking

The platform's [quality monitoring](@/glossary/quality.md) subsystem writes metrics to PostgreSQL with timestamps, enabling time-series analysis of code quality trends. Queries aggregate quality scores by domain, identify regression patterns, and feed the [autoevolve](@/glossary/autoevolve.md) system's decision engine.

### Compliance Audit Trail

For [NIS2](@/glossary/nis2.md) and [GDPR](@/glossary/gdpr.md) compliance, every data access and modification is logged to audit tables. The relational model's referential integrity ensures audit entries always link to valid entities, and SQL's temporal query capabilities enable compliance reports over arbitrary time ranges.

## Related Concepts

- [PostgreSQL](@/glossary/postgresql.md) -- The specific relational database used by the Prismatic Platform
- [Ecto](@/glossary/ecto.md) -- Elixir database library providing the interface to PostgreSQL
- [ACID Transactions](@/glossary/acid-transactions.md) -- Guarantees that make relational writes reliable
- [Data Pipeline](@/glossary/data-pipeline.md) -- Data flows that originate from or terminate in relational storage
- [Scalability](@/glossary/scalability.md) -- Scaling strategies for relational databases under load
- [Performance](@/glossary/performance.md) -- Query optimization and indexing strategies
- [Monitoring](@/glossary/monitoring.md) -- Database health and query performance tracking
- [Telemetry](@/glossary/telemetry.md) -- Ecto telemetry events for connection pool and query metrics
- [Security](@/glossary/security.md) -- Database access control and encryption at rest
- [Encryption](@/glossary/encryption.md) -- Column-level and disk-level encryption for sensitive data

## See Also

- [Redis](@/glossary/redis.md) -- Complementary key-value store for caching
- [Meilisearch](@/glossary/meilisearch.md) -- Full-text search engine alongside relational storage
- [ETS](@/glossary/ets.md) -- In-memory storage for data that does not need persistence
- [Regression Testing](@/glossary/regression-testing.md) -- Testing migrations and schema changes
- [CI/CD](@/glossary/ci-cd.md) -- Automated migration execution in deployment pipeline
- [Observability](@/glossary/observability.md) -- Database metrics in platform observability stack
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- 115 umbrella applications using relational storage

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
