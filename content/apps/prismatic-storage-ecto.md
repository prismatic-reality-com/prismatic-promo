+++
title = "Prismatic Storage Ecto"
weight = 37
[extra]
icon = "server-stack"
color = "blue"
description = "PostgreSQL storage adapter via Ecto for persistent relational data"
category = "Storage"
files = "140"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1283
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Ecto", "PostgreSQL", "apps", "Prismatic Platform", "Prismatic Storage", "Multi", "JSONB"]
tags = ["apps", "storage", "prismatic-storage-ecto", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage Ecto - Prismatic Platform"
+++

## Overview

[Prismatic Storage](@/glossary/prismatic-storage.md) [Ecto](@/glossary/ecto.md) implements the storage adapter [protocol](@/glossary/protocol.md) using Ecto with [PostgreSQL](@/glossary/postgresql.md) as the backend. It provides ACID-compliant persistent storage for entities, relationships, [audit trail](@/glossary/audit-trail.md)s, and any data requiring durability and complex querying. As the platform's authoritative data store, PostgreSQL serves as the source of truth from which all other storage layers ([ETS](@/apps/prismatic-storage-ets.md), [Redis](@/apps/prismatic-storage-redis.md), [Meilisearch](@/apps/prismatic-storage-meilisearch.md)) derive their data.

The adapter manages [connection pooling](@/glossary/connection-pooling.md) through DBConnection, handles schema migrations with rollback support, and provides both structured Ecto queries and raw SQL access for complex analytical workloads. Multi-tenant data isolation ensures that intelligence from different organizations remains strictly separated at the database level.

PostgreSQL's advanced features -- JSONB columns for semi-structured intelligence data, array types for tag collections, Common Table Expressions for recursive queries, and window functions for analytical reporting -- are fully leveraged through the adapter's query interface rather than being abstracted away behind a least-common-denominator API.

## Architecture

```
Application Code
       |
  PrismaticStorageCore Behaviour (Protocol)
       |
  Ecto Adapter
       |
  +----+----+----+
  |         |         |
Query     Migration  Multi-Tenant
Builder   Manager    Isolator
  |         |         |
  +----+----+----+
       |
  Ecto.Repo (Connection Pool via DBConnection)
       |
  +----+----+
  |         |
Primary   Read
(Write)   Replicas
```

The adapter separates write operations (routed to the primary database) from read operations (distributed across read replicas when configured). The Migration Manager handles schema evolution across all tenants, and the Multi-Tenant Isolator ensures that queries are scoped to the correct tenant context through row-level security policies and schema-based isolation.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The Ecto adapter is the most feature-rich implementation of the [Prismatic Storage Core](@/apps/prismatic-storage-core.md) contract, declaring support for the broadest set of traits: Storable, Identifiable, Queryable, Transactional, Batchable, Streamable, and Subscribable. This comprehensive trait coverage reflects PostgreSQL's versatility as a general-purpose database that supports everything from simple key-value operations to complex analytical queries with ACID guarantees.

The Storable trait implementation maps Elixir structs to Ecto schemas through a reflection-based approach. Rather than requiring manual schema definitions for each entity type, the adapter inspects the struct's fields and type annotations to generate appropriate Ecto changeset validations. This reduces boilerplate when onboarding new entity types -- implementing the `Storable` protocol for a struct is sufficient to enable full CRUD operations through the Ecto adapter.

The Transactional trait provides ACID transaction boundaries that span multiple operations. Unlike simpler adapters where `transaction/1` wraps a single operation, the Ecto implementation supports nested transactions via PostgreSQL savepoints, configurable isolation levels (read committed, repeatable read, serializable), and advisory locks for distributed coordination. These capabilities are essential for investigation workflows where multiple related entities must be updated atomically.

The Queryable trait maps the platform's generic query interface to Ecto's composable query DSL. Filter conditions, sort specifications, and pagination parameters are translated into Ecto query fragments that compose cleanly with application-specific query logic. The adapter also exposes PostgreSQL-specific features through extension points -- JSONB path queries, full-text search with `tsvector`/`tsquery`, and recursive CTEs are accessible through the query interface without breaking the adapter abstraction.

Contract compliance is verified through both the shared `PrismaticStorageCore.ContractTest` suite and Ecto-specific integration tests that exercise PostgreSQL features beyond the common contract. The test suite uses Ecto's SQL sandbox for test isolation, ensuring that concurrent test execution does not produce flaky results from shared database state.

## Key Features

### PostgreSQL Integration
- Full PostgreSQL feature support including JSONB, arrays, CTEs, and window functions
- Connection pooling with DBConnection for configurable pool size and overflow
- Automatic migration management with up/down rollback support
- Read replica distribution for query [load balancing](@/glossary/load-balancing.md)
- Advisory locks for distributed coordination across database connections

### Query Capabilities
- Complex joins and aggregations through Ecto's composable query interface
- Full-text search integration using PostgreSQL `tsvector` and `tsquery`
- JSONB path queries for semi-structured intelligence data (entity metadata, raw [OSINT](@/glossary/osint.md))
- Window functions for time-series analytics and ranking operations
- Recursive CTEs for hierarchical data traversal (organizational structures)

### Data Management
- Schema migration with rollback support and migration status tracking
- Multi-tenant data isolation via row-level security and schema separation
- Soft delete with audit trail preserving complete entity history
- Batch operations with `Repo.stream/2` for memory-efficient large dataset processing
- Upsert support for idempotent entity ingestion from OSINT sources

## Schema Migration Strategy

The Migration Manager implements a disciplined approach to schema evolution that accommodates the platform's multi-tenant architecture. Each migration is written as a pair of `up/0` and `down/0` functions, enabling clean rollback when a migration introduces issues. Migrations are versioned with timestamps and tracked in a `schema_migrations` table, ensuring that each migration executes exactly once regardless of deployment cadence.

For multi-tenant deployments, migrations must account for schema-per-tenant isolation. The Migration Manager iterates over all tenant schemas when applying migrations, wrapping each tenant's migration in its own transaction. This ensures that a failed migration for one tenant does not block migration progress for others. Tenant-specific migration state is tracked independently, allowing partial deployment recovery.

PostgreSQL's transactional DDL -- the ability to roll back schema changes within a transaction -- is leveraged extensively. Complex migrations that involve creating tables, adding indexes, and populating data can be written as single transactional units. If any step fails, the entire migration rolls back cleanly, preventing the partially-applied schema states that plague databases without transactional DDL support.

## Usage

```elixir
# Store an entity via the adapter protocol
PrismaticStorageEcto.put(:entities, %{
  id: "e-123",
  type: :domain,
  name: "example.com",
  risk_score: 72,
  metadata: %{"registrar" => "Example Registrar", "created" => "2020-01-15"}
})

# Complex query with filtering, ordering, and pagination
{:ok, results} = PrismaticStorageEcto.query(:entities,
  where: [type: :domain, risk_level: :high],
  order_by: [desc: :updated_at],
  limit: 100,
  offset: 0
)

# Aggregate statistics across entity types
{:ok, stats} = PrismaticStorageEcto.aggregate(:entities,
  group_by: :type,
  count: true,
  avg: :risk_score
)
# => {:ok, [%{type: :domain, count: 4_320, avg_risk_score: 42.7}, ...]}

# JSONB path query for semi-structured metadata
{:ok, registrar_results} = PrismaticStorageEcto.query(:entities,
  where: [type: :domain],
  jsonb_filter: {"metadata", "registrar", "Example Registrar"},
  select: [:name, :risk_score]
)

# Batch streaming for large dataset export
PrismaticStorageEcto.stream(:entities, where: [type: :domain])
|> Stream.map(&transform_for_export/1)
|> Stream.into(csv_writer)
|> Stream.run()
```

## Connection Pool Management

The adapter manages PostgreSQL connections through DBConnection with careful attention to pool sizing, connection health, and failure recovery. The connection pool is configured with a base size, a maximum overflow capacity, and a checkout timeout that prevents application threads from blocking indefinitely when the pool is exhausted.

Connection health checking runs on a configurable interval, executing a lightweight `SELECT 1` query against each idle connection. Connections that fail the health check are removed from the pool and replaced with fresh connections. This prevents stale connections from accumulating after network interruptions or PostgreSQL restarts.

For read-heavy workloads, the adapter supports read replica routing. Queries annotated as read-only are distributed across configured read replicas using round-robin selection, while write operations and transactions are always routed to the primary instance. This distribution is transparent to application code -- the adapter inspects the operation type and routes accordingly.

## Testing

```bash
mix test apps/prismatic_storage_ecto/test
mix test apps/prismatic_storage_ecto/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | All declared trait compliance |
| Schema Migrations | 10 | Up/down migration correctness, rollback safety |
| JSONB Operations | 8 | Path queries, nested access, index utilization |
| Multi-Tenant | 6 | Tenant isolation, cross-tenant query prevention |
| Concurrency | 8 | Connection pool behavior under load |
| Transactions | 12 | Nested transactions, isolation levels, advisory locks |

## Integration Points

Every storage adapter in the platform ultimately derives from or synchronizes with the Ecto layer. [Redis](@/apps/prismatic-storage-redis.md) cache entries are populated from PostgreSQL queries on cache miss. [Meilisearch](@/apps/prismatic-storage-meilisearch.md) indexes are synchronized from PostgreSQL entity tables on a configurable interval. [KuzuDB](@/apps/prismatic-storage-kuzudb.md) graph nodes reference PostgreSQL entity IDs as their canonical identifiers. [Prismatic Auth](@/apps/prismatic-auth.md) persists user accounts, API keys, and audit logs through the Ecto adapter.

## NABLA Compliance

The Ecto adapter enforces epistemic provenance through PostgreSQL's audit capabilities. Every entity modification is tracked with timestamps, user identifiers, and change descriptions in audit tables, satisfying the Provenance Mandatory axiom. JSONB metadata columns preserve the original source data alongside normalized fields, maintaining the raw evidence trail required by the Contradiction Preservation axiom. Multi-source entity ingestion through upsert operations preserves all contributing sources rather than overwriting previous data, supporting Signal Plurality.

## Performance

| Metric | Value |
|--------|-------|
| Connection pool size | 10-50 (configurable) |
| Read replica routing | Transparent round-robin |
| Query compilation cache | Ecto-managed with prepared statements |
| Batch insert throughput | 10,000+ entities/second |
| Migration execution | Transactional DDL with rollback |

## Related Components

- [Prismatic Storage Core](@/apps/prismatic-storage-core.md) -- Adapter protocol definition
- [Prismatic Storage ETS](@/apps/prismatic-storage-ets.md) -- L1 in-memory cache
- [Prismatic Storage Redis](@/apps/prismatic-storage-redis.md) -- L2 distributed cache
- [Prismatic Storage Meilisearch](@/apps/prismatic-storage-meilisearch.md) -- Full-text search index
- [Prismatic Storage KuzuDB](@/apps/prismatic-storage-kuzudb.md) -- Graph relationship storage

## Related Agents

- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Ensures Ecto adapter conforms to the PrismaticStorageCore protocol contract
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews database schema design, migration strategies, and query optimization
- [Elixir Architect](@/agents/elixir-architect.md) -- Validates Ecto repository patterns and connection pool configuration

## Related Capabilities

- [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) -- PostgreSQL serves as the authoritative store across all platform domains
- [Quality Gates](@/capabilities/quality-gates.md) -- Contract tests verify adapter protocol compliance and transaction safety
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Query latency and connection pool metrics emitted for performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)