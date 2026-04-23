+++
title = "Prismatic Storage"
weight = 5
[extra]
icon = "database"
color = "green"
description = "Unified storage layer with 7 adapters and trait-based protocols"
category = "Storage"
files = "1240"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1415
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Unified", "apps", "Prismatic Platform", "Redis", "Meilisearch", "PostgreSQL", "Ecto"]
tags = ["apps", "storage", "prismatic-storage", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage - Prismatic Platform"
+++

## Abstract

Prismatic Storage provides a unified storage abstraction layer that enables application code to interact with seven heterogeneous storage backends -- [ETS](/glossary/ets/), [PostgreSQL](/glossary/postgresql/) (via [Ecto](/glossary/ecto/)), [Redis](/glossary/redis/), [Meilisearch](/glossary/meilisearch/), [KuzuDB](/glossary/kuzudb/), [DuckDB](/glossary/duckdb/), and filesystem -- through a consistent trait-based [protocol](/glossary/protocol/) system. The architecture defines six protocol traits (Readable, Writable, Queryable, Indexable, Graphable, Cacheable) that each adapter implements according to its backend's capabilities. Application code programs against traits rather than concrete adapters, enabling runtime adapter selection, transparent failover, and multi-adapter operations without code changes. The contract testing framework ensures protocol compliance across all adapters, while adapter-specific optimizations preserve the performance characteristics of each backend. This design supports the platform's diverse storage requirements: microsecond-latency ETS for hot data, ACID-compliant PostgreSQL for durable entities, sub-millisecond Redis for distributed caching, typo-tolerant Meilisearch for full-text search, native graph traversal via KuzuDB, and columnar analytics through DuckDB.

## 1. Introduction

### 1.1 Problem Statement

An intelligence platform integrating 121+ [OSINT](/glossary/osint/) sources, security assessments, compliance reporting, and visitor analytics generates heterogeneous data with conflicting storage requirements. Entity records need ACID durability (PostgreSQL). Hot session data needs microsecond access (ETS). Full-text search across millions of documents needs relevancy ranking and typo tolerance (Meilisearch). Entity relationship traversal needs native graph queries (KuzuDB). Analytical aggregations over time-series data need columnar storage (DuckDB). Distributed state needs sub-millisecond access across nodes (Redis).

Without a unifying abstraction, application code becomes tightly coupled to specific storage technologies, making it impossible to change backends without rewriting business logic. The trait-based protocol system solves this by defining storage operations as protocol contracts that adapters implement independently.

### 1.2 Design Goals

1. **Trait-based protocols** -- define storage operations as [Elixir](/glossary/elixir/) protocols that adapters implement, enabling polymorphic dispatch.
2. **Adapter-agnostic application code** -- business logic programs against traits, not concrete adapters.
3. **Runtime adapter selection** -- choose adapters at runtime based on data type, performance requirements, or operational conditions.
4. **Contract testing** -- a shared test suite that verifies every adapter correctly implements required protocols.
5. **Multi-adapter operations** -- support replication, federation, and migration across adapters.
6. **Performance preservation** -- trait dispatch introduces negligible overhead; adapter-specific optimizations are preserved.

### 1.3 Scope

Prismatic Storage covers the abstraction layer, protocol definitions, and adapter implementations. It does not implement application-specific schemas, migrations, or business logic. Each adapter is a separate [OTP](/glossary/otp/) application within the umbrella.

## 2. Architecture

### 2.1 System Design

```
Application Code
       |
  PrismaticStorage Facade
       |
  Trait Dispatch (Protocol Resolution)
       |
  +----+----+----+----+----+----+
  |    |    |    |    |    |    |
  ETS  Ecto Redis Meili Kuzu Duck  File
  |    |    |    |    |    |    |
  ETS  PG   Redis MS   KuzuDB DDB  FS
  Tab  SQL   Srv   Srv   Embed  Embed Dir
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticStorage` | Public facade with adapter-agnostic CRUD operations |
| `PrismaticStorageCore` | Protocol definitions, trait behaviors, and contract tests |
| `PrismaticStorageCore.Trait.Readable` | Protocol for read operations (get, fetch, exists?) |
| `PrismaticStorageCore.Trait.Writable` | Protocol for write operations (put, update, delete) |
| `PrismaticStorageCore.Trait.Queryable` | Protocol for query operations (filter, sort, paginate, aggregate) |
| `PrismaticStorageCore.Trait.Indexable` | Protocol for search operations (index, search, suggest) |
| `PrismaticStorageCore.Trait.Graphable` | Protocol for graph operations (traverse, shortest_path, neighbors) |
| `PrismaticStorageCore.Trait.Cacheable` | Protocol for cache operations (cache, invalidate, ttl) |
| `PrismaticStorageEts` | ETS adapter -- microsecond in-memory storage |
| `PrismaticStorageEcto` | Ecto/PostgreSQL adapter -- ACID persistent storage |
| `PrismaticStorageRedis` | Redis adapter -- distributed caching and pub/sub |
| `PrismaticMeilisearch` | Meilisearch adapter -- full-text search |
| `PrismaticStorageKuzudb` | KuzuDB adapter -- graph database |
| `PrismaticStorageDuckdb` | DuckDB adapter -- analytical queries |

### 2.3 Process Topology

```
PrismaticStorage.Application (Supervisor, :one_for_one)
+-- PrismaticStorage.AdapterRegistry (GenServer)
|     Tracks available adapters and their health status
+-- PrismaticStorage.Router (GenServer)
|     Routes operations to appropriate adapters based on data type
+-- Per-adapter supervision trees (started by each adapter app)
```

Each adapter application manages its own [supervision tree](/glossary/supervision-tree/), connection pools, and health monitoring. The central Storage application coordinates routing and discovery.

### 2.4 Data Flow

Read operations flow through the facade, which resolves the appropriate adapter via the Router, dispatches through the trait protocol, and returns the result. Write operations follow the same path but may additionally trigger replication to secondary adapters (e.g., writing to Ecto for durability and Meilisearch for searchability). Multi-adapter operations are coordinated through the Router with [eventual consistency](/glossary/eventual-consistency/) semantics.

## 3. Implementation

### 3.1 Key Algorithms

**Adapter Selection**. The Router maintains a mapping from data types to preferred adapters. When no explicit adapter is specified, the Router selects based on operation type: Readable/Writable default to ETS for volatile data and Ecto for persistent data; Indexable routes to Meilisearch; Graphable routes to KuzuDB; Cacheable routes to Redis. Application code can override the default by specifying an adapter explicitly.

**Contract Verification**. The contract testing framework generates a comprehensive test suite from protocol definitions. Each adapter runs the same test suite, verifying that all required callbacks return correct types, handle error cases, and maintain [idempotency](/glossary/idempotency/) where specified.

### 3.2 Data Structures

```elixir
defprotocol PrismaticStorageCore.Trait.Readable do
  @spec get(adapter :: t(), key :: term()) :: {:ok, term()} | {:error, :not_found | term()}
  def get(adapter, key)

  @spec fetch(adapter :: t(), key :: term(), default :: term()) :: {:ok, term()}
  def fetch(adapter, key, default)

  @spec exists?(adapter :: t(), key :: term()) :: boolean()
  def exists?(adapter, key)
end

defprotocol PrismaticStorageCore.Trait.Writable do
  @spec put(adapter :: t(), key :: term(), value :: term()) :: :ok | {:error, term()}
  def put(adapter, key, value)

  @spec delete(adapter :: t(), key :: term()) :: :ok | {:error, term()}
  def delete(adapter, key)
end
```

### 3.3 API Surface

```elixir
# Adapter-agnostic operations
@spec read(atom(), term()) :: {:ok, term()} | {:error, term()}
PrismaticStorage.read(:ets_adapter, "entity:123")

@spec write(atom(), term(), term()) :: :ok | {:error, term()}
PrismaticStorage.write(:ecto_adapter, "entity:123", entity_data)

# Search through Indexable trait
@spec search(atom(), String.t(), keyword()) :: {:ok, [term()]} | {:error, term()}
PrismaticStorage.search(:meilisearch_adapter, "Prismatic s.r.o.", limit: 20)

# Graph traversal through Graphable trait
@spec traverse(atom(), term(), term()) :: {:ok, [term()]} | {:error, term()}
PrismaticStorage.traverse(:kuzu_adapter, start_node, :OWNS)

# Multi-adapter replication
@spec replicate(atom(), atom(), term()) :: :ok | {:error, term()}
PrismaticStorage.replicate(:ecto_adapter, :meilisearch_adapter, "companies")
```

### 3.4 Configuration

```elixir
config :prismatic_storage,
  default_adapter: :ets_adapter,
  persistent_adapter: :ecto_adapter,
  cache_adapter: :redis_adapter,
  search_adapter: :meilisearch_adapter,
  graph_adapter: :kuzu_adapter,
  analytics_adapter: :duckdb_adapter,

  # Routing rules
  type_routing: %{
    :entities => :ecto_adapter,
    :sessions => :ets_adapter,
    :cache => :redis_adapter,
    :search_index => :meilisearch_adapter,
    :relationships => :kuzu_adapter,
    :analytics => :duckdb_adapter
  }
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Core](/apps/prismatic-core/) | Base entity definitions and protocols |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Storage operation [metrics](/glossary/metrics/) |

### 4.2 Dependents

Every platform application that persists or queries data depends on Prismatic Storage. Key consumers include [Prismatic Perimeter](/apps/prismatic-perimeter/) (entity and rating persistence), [Prismatic OSINT Core](/apps/prismatic-osint-core/) (intelligence data storage), [Prismatic Agents](/apps/prismatic-agents/) (agent definition [registry](/glossary/registry-otp/)), and [Prismatic Web](/apps/prismatic-web/) (session and dashboard state).

### 4.3 Inter-Process Communication

Adapters manage their own connection pools and process hierarchies. The Storage facade communicates with adapters through protocol dispatch (function calls), not [message passing](/glossary/message-passing/), minimizing latency. Replication between adapters uses asynchronous Task-based coordination.

### 4.4 External Integrations

External services: PostgreSQL (via Ecto), Redis (via Redix), Meilisearch (via HTTP client), KuzuDB (via NIF binding), DuckDB (via NIF binding). ETS and filesystem adapters have no external dependencies.

## 5. Performance

### 5.1 Benchmarks

| Adapter | Read Latency | Write Latency | Query Latency | Durability |
|---------|-------------|---------------|---------------|------------|
| ETS | ~1 microsecond | ~1 microsecond | ~10 microsecond | Volatile |
| Ecto (PostgreSQL) | 1-5ms | 2-10ms | 5-100ms | Durable |
| Redis | 0.1-1ms | 0.1-1ms | 1-5ms | Configurable |
| Meilisearch | N/A | 5-50ms (index) | 10-50ms (search) | Durable |
| KuzuDB | 1-10ms | 5-20ms | 10-100ms (traversal) | Durable |
| DuckDB | N/A | Batch only | 10ms-10s (analytics) | Durable |

### 5.2 Scalability

Each adapter scales according to its backend's characteristics. ETS scales with available memory. PostgreSQL scales with read replicas and connection pool size. Redis scales with cluster mode. Meilisearch scales with sharding. The trait abstraction allows transparent migration between adapters as scaling requirements evolve.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 1 GB (ETS + application) | 4 GB (all adapters active) |
| CPU | 2 cores | 4 cores |
| Storage | 10 GB (PostgreSQL) | 100 GB (full dataset) |

## 6. Testing Strategy

### 6.1 Unit Tests

Each adapter has unit tests for CRUD operations, error handling, and edge cases specific to its backend. These tests run against real backends (not mocks) to ensure correctness.

### 6.2 Integration Tests

The contract testing framework runs the same 121-test suite against every adapter, verifying protocol compliance. Multi-adapter integration tests verify replication, failover, and federated query behavior.

### 6.3 Property-Based Testing

StreamData generators produce random keys, values, and query predicates to verify adapter behavior under diverse inputs. Property tests verify that write-then-read roundtrips preserve data integrity across all adapters.

## 7. Security Considerations

### 7.1 Threat Model

Storage layer threats include unauthorized data access, SQL injection (Ecto adapter), and data corruption. Mitigations include parameterized queries (Ecto), access control through the application layer, [encryption at rest](/glossary/encryption-at-rest/) (PostgreSQL), and audit logging for all write operations.

### 7.2 Access Control

Storage access is mediated through the application layer. The Storage facade itself does not enforce authentication; this is the responsibility of consuming applications. Connection credentials are managed through environment variables and the application configuration.

## 8. Operational Considerations

### 8.1 Deployment

Each adapter deploys with its required backend. ETS requires no external services. Ecto requires PostgreSQL. Redis requires a Redis server. Meilisearch requires a Meilisearch instance. KuzuDB and DuckDB are embedded databases requiring no external services.

### 8.2 Monitoring

Telemetry events for all storage operations: `[:prismatic, :storage, :read]`, `[:prismatic, :storage, :write]`, `[:prismatic, :storage, :query]`. Metrics include operation latency per adapter, error rates, connection pool utilization, and cache hit rates.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Connection pool exhaustion | Too many concurrent queries | Increase pool size; add connection timeout |
| Slow queries | Missing indexes | Analyze query plans; add appropriate indexes |
| ETS memory growth | Missing TTL or cleanup | Configure automatic cleanup; add TTL to entries |
| Search results stale | Meilisearch indexing lag | Check indexing queue; force re-index |

## 9. Future Work

Planned enhancements include automatic adapter selection based on query complexity analysis, cross-adapter transactions with two-phase commit, data lifecycle management with automatic tier migration (hot to warm to cold), and a unified query language that compiles to adapter-specific queries.

## References

- [Prismatic Storage Core](/apps/prismatic-storage-core/) -- Protocol definitions and contracts
- [Prismatic Storage ETS](/apps/prismatic-storage-ets/) -- ETS adapter
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- PostgreSQL adapter
- [Prismatic Storage Redis](/apps/prismatic-storage-redis/) -- Redis adapter
- [Prismatic Storage KuzuDB](/apps/prismatic-storage-kuzudb/) -- Graph database adapter
- [Prismatic Storage DuckDB](/apps/prismatic-storage-duckdb/) -- Analytical adapter
- [Prismatic Meilisearch](/apps/prismatic-meilisearch/) -- Full-text search adapter

## Related Agents

- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Designs the trait-based protocol system enabling 7 heterogeneous storage backends through unified interfaces
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews the multi-adapter architecture for protocol compliance, performance preservation, and failover correctness
- [Consolidation Architect](/agents/consolidation-architect/) -- Coordinates the unified storage layer consolidation across ETS, Ecto, Redis, Meilisearch, KuzuDB, and DuckDB

## Related Capabilities

- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) -- Trait-based protocols enable runtime adapter selection across volatile, persistent, search, graph, and analytical workloads
- [Quality Gates](/capabilities/quality-gates/) -- Contract testing framework running 121 tests against every adapter to verify protocol compliance
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Full operation coverage with per-adapter latency, error rates, and connection pool utilization metrics

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)