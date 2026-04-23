+++
title = "Prismatic Storage Core"
weight = 73
[extra]
icon = "database"
color = "purple"
description = "Storage abstraction layer - traits, protocols, and adapter contracts"
category = "Storage"
files = "180"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1507
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Core", "apps", "Prismatic Platform", "PrismaticStorageCore", "Prismatic Storage", "Traits"]
tags = ["apps", "storage", "prismatic-storage-core", "prismatic"]
quality_score = 90
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage Core - Prismatic Platform"
+++

## Overview

[Prismatic Storage](@/glossary/prismatic-storage.md) Core defines the storage abstraction layer used by all storage adapters in the Prismatic Platform. It provides [protocol](@/glossary/protocol.md) definitions, [behavior](@/glossary/behaviour.md) contracts, trait composition mechanisms, and shared utilities that ensure every storage backend -- [ETS](@/glossary/ets.md), [Ecto](@/glossary/ecto.md), [Redis](@/glossary/redis.md), [KuzuDB](@/glossary/kuzudb.md), [Meilisearch](@/glossary/meilisearch.md), [DuckDB](@/glossary/duckdb.md) -- presents a consistent interface to application code. The design draws inspiration from Rust's trait system, adapted for Elixir's dynamic capabilities with compile-time verification and runtime capability checking.

This application is the cornerstone of the platform's storage strategy: application code never interacts with a specific storage backend directly. Instead, it programs against the protocols and behaviors defined in Storage Core. This indirection enables backend-agnostic data access, multi-adapter query federation, runtime adapter switching, and comprehensive contract testing -- all without modifying a single line of application code. The trait composition system allows adapters to declare optional capabilities beyond the base CRUD contract, enabling the storage router to select optimal backends based on operation type and data characteristics.

Storage Core has zero external dependencies beyond the Elixir standard library, `jason` for JSON serialization, and `telemetry` for observability. This minimal dependency footprint is intentional -- the core abstraction layer must remain lightweight and stable since every storage adapter in the ecosystem depends on it. Property-based testing with `stream_data` and `propcheck` ensures that contract specifications are rigorously validated.

## Architecture

```
Application Code
       |
  PrismaticStorageCore Protocols + Behaviours
       |
  +----+----+----+----+----+----+
  |    |    |    |    |    |    |
 ETS  Ecto Redis Kuzu Meili Duck
  |    |    |    |    |    |    |
  +----+----+----+----+----+----+
       |
  Contract Test Suite (shared)
```

The architecture uses three complementary Elixir mechanisms to define the contract between application code and storage backends:

| Mechanism | Purpose | Enforcement |
|-----------|---------|-------------|
| **Protocol** | Polymorphic dispatch based on data type | Compile-time (protocol consolidation) |
| **Behaviour** | Required callback contract for adapters | Compile-time (`@callback` + Dialyzer) |
| **Trait** | Composable capability modules via `use` | Runtime (capability checking) |

The separation between protocols and behaviours is deliberate and mirrors a fundamental distinction in type system design. Protocols dispatch on the data being stored -- the entity type determines how serialization, key extraction, and schema mapping occur. Behaviours dispatch on the storage backend -- the adapter module determines how data is persisted, retrieved, and queried. Traits compose on top of behaviours to declare optional capabilities that extend the base contract without breaking backward compatibility.

This layered approach means that adding a new storage backend requires implementing the behaviour callbacks and declaring supported traits, while adding a new entity type requires implementing the protocol for that struct. Neither change affects existing code, achieving the open-closed principle at both the storage and data layers simultaneously.

## Design Principles

The Storage Core abstraction layer is governed by several design principles that ensure long-term maintainability and correctness across the platform's multi-backend architecture.

**Contract-First Design.** Every interaction between application code and storage backends is mediated by an explicit contract -- either a protocol function signature or a behaviour callback specification. These contracts are enforced at compile time through Dialyzer type checking and at runtime through pattern matching on return tuples. The `{:ok, result}` / `{:error, reason}` convention is universal, eliminating the possibility of silent failures.

**Capability Discovery.** Rather than assuming all backends support all operations, Storage Core implements a capability discovery mechanism. Adapters declare their supported traits at module definition time, and the storage router queries these capabilities before dispatching operations. Attempting to execute a full-text search against an ETS adapter, which lacks the Searchable trait, produces a clear `{:error, :unsupported_trait}` error rather than a runtime crash or incorrect behavior.

**Zero Abstraction Leak.** Backend-specific features are accessible through trait-gated extensions, not through leaky abstractions that expose implementation details. When PostgreSQL's JSONB path queries or KuzuDB's Cypher traversals are needed, the application explicitly requests those capabilities through the appropriate trait interface, making backend coupling visible and intentional rather than accidental.

**Minimal Core, Rich Extensions.** The base behaviour contract covers only CRUD operations and basic querying. All advanced capabilities -- transactions, batch operations, full-text search, graph traversal, caching with TTL -- are implemented as optional traits. This keeps the core contract small enough that implementing a new adapter is straightforward, while allowing sophisticated backends to expose their full power through composable trait declarations.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticStorageCore` | Main API and adapter registration |
| `PrismaticStorageCore.Application` | OTP Application entry point |
| `PrismaticStorageCore.Adapter` | Core adapter behaviour with CRUD callbacks |
| `PrismaticStorageCore.Storable` | Protocol for entity serialization to/from storage format |
| `PrismaticStorageCore.Traits.Queryable` | Optional trait for filter, sort, paginate operations |
| `PrismaticStorageCore.Traits.Transactional` | Optional trait for ACID transaction support |
| `PrismaticStorageCore.Traits.Batchable` | Optional trait for bulk insert/delete operations |
| `PrismaticStorageCore.Traits.Searchable` | Optional trait for full-text search with ranking |
| `PrismaticStorageCore.Traits.GraphTraversable` | Optional trait for graph traversal queries |
| `PrismaticStorageCore.Traits.Cacheable` | Optional trait for TTL-based caching |
| `PrismaticStorageCore.Traits.Subscribable` | Optional trait for change notifications |
| `PrismaticStorageCore.ContractTest` | Shared contract test suite for adapter verification |
| `PrismaticStorageCore.Health` | Trait system health monitoring |

## Trait Composition System

The trait system is the most distinctive architectural feature of Storage Core. Inspired by Rust's trait bounds and Haskell's type classes, it provides a mechanism for adapters to declare optional capabilities beyond the base CRUD contract. Each trait defines a set of additional callbacks that an adapter may implement, along with compile-time verification that all required callbacks are present when a trait is declared.

The trait hierarchy is deliberately flat rather than hierarchical. There is no trait inheritance -- Queryable does not extend Storable, and Transactional does not require Batchable. This prevents the diamond inheritance problems that plague deeply nested type hierarchies and keeps each trait independently composable.

| Trait | Callbacks | Use Case |
|-------|-----------|----------|
| **Queryable** | `filter/3`, `sort/3`, `paginate/3`, `aggregate/3` | Complex queries with filtering and sorting |
| **Transactional** | `begin_transaction/0`, `commit/1`, `rollback/1` | ACID transaction boundaries |
| **Batchable** | `batch_put/2`, `batch_delete/2`, `batch_update/2` | Bulk operations with atomicity guarantees |
| **Searchable** | `search/3`, `index/2`, `configure_ranking/2` | Full-text search with relevance scoring |
| **GraphTraversable** | `traverse/3`, `shortest_path/3`, `neighbors/2` | Graph relationship queries |
| **Cacheable** | `cache_get/2`, `cache_put/3`, `invalidate/2` | TTL-based caching with expiration |
| **Subscribable** | `subscribe/2`, `unsubscribe/2`, `notify/3` | Real-time change notifications |
| **Streamable** | `stream/2`, `stream_chunk/3` | Memory-efficient large dataset iteration |

When an adapter declares `use PrismaticStorageCore.Adapter, traits: [Queryable, Transactional]`, the macro system verifies at compile time that all callbacks from both the base adapter behaviour and the declared traits are implemented. Missing callbacks produce clear compile-time errors rather than runtime surprises.

## Configuration

```elixir
# Storage Core requires minimal configuration
# Adapters configure themselves; Core provides the contracts

# Optional telemetry configuration
config :prismatic_storage_core,
  telemetry_enabled: true,
  contract_test_timeout: 30_000
```

## API Reference

### Protocol Definitions

```elixir
# Storable protocol - every entity must implement
defprotocol PrismaticStorageCore.Storable do
  @spec to_storage(t()) :: {:ok, map()} | {:error, term()}
  def to_storage(entity)

  @spec from_storage(t(), map()) :: {:ok, t()} | {:error, term()}
  def from_storage(entity, data)

  @spec storage_key(t()) :: binary()
  def storage_key(entity)
end
```

### Behaviour Contracts

```elixir
# Storage adapter behaviour - every backend must implement
defmodule PrismaticStorageCore.Adapter do
  @callback get(table :: atom(), key :: binary()) :: {:ok, map()} | {:error, term()}
  @callback put(table :: atom(), key :: binary(), value :: map()) :: {:ok, map()} | {:error, term()}
  @callback delete(table :: atom(), key :: binary()) :: :ok | {:error, term()}
  @callback update(table :: atom(), key :: binary(), changes :: map()) :: {:ok, map()} | {:error, term()}
  @callback query(table :: atom(), opts :: keyword()) :: {:ok, [map()]} | {:error, term()}
  @callback batch_put(table :: atom(), entries :: [{binary(), map()}]) :: {:ok, integer()} | {:error, term()}
  @callback transaction(fun :: (-> term())) :: {:ok, term()} | {:error, term()}
end
```

### Trait Composition

```elixir
# Implement an adapter with multiple traits
defmodule MyAdapter do
  use PrismaticStorageCore.Adapter,
    traits: [Storable, Queryable, Streamable]

  # Compile-time verification ensures all required callbacks are implemented
end
```

### Contract Testing

```elixir
# Using the contract test suite in adapter tests
defmodule PrismaticStorageEts.AdapterTest do
  use PrismaticStorageCore.ContractTest,
    adapter_module: PrismaticStorageEts.Adapter,
    traits: [Storable, Queryable, Streamable]
end
```

## Storage Router and Backend Selection

The storage router is the runtime component that selects the optimal backend for each operation based on trait requirements, performance characteristics, and data locality. When application code issues a storage operation, the router inspects the operation type, checks which adapters support the required traits, and dispatches to the most appropriate backend.

The routing decision considers several factors in priority order: trait compatibility (the adapter must support all required traits), data locality (prefer the adapter where the data already resides), latency requirements (time-sensitive operations route to ETS over PostgreSQL), and consistency requirements (operations requiring ACID guarantees route to transactional adapters).

For read operations, the router implements a cache hierarchy: ETS (L1, microseconds) is checked first, then Redis (L2, sub-millisecond), then PostgreSQL (L3, milliseconds). Write operations follow the reverse path, writing to the durable store first and then populating caches asynchronously. This hierarchy is transparent to application code, which simply calls `StorageCore.get/2` without awareness of which backend serves the response.

Multi-adapter query federation enables complex operations that span multiple backends. A search query might use Meilisearch for relevance-ranked full-text matching, join the results with entity attributes from PostgreSQL, and enrich them with relationship data from KuzuDB -- all through a single federated query interface that the storage router coordinates.

## Testing

Contract testing is the primary testing mechanism for Storage Core. The shared contract test suite verifies that every adapter correctly implements the required protocols and behaviors.

```bash
mix test apps/prismatic_storage_core/test
mix test apps/prismatic_storage_core/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| CRUD Operations | 24 | get/put/delete/update correctness, error handling |
| Query Operations | 18 | Filter, sort, paginate, aggregate accuracy |
| Batch Operations | 12 | Bulk insert/delete atomicity and performance |
| Transaction Support | 8 | Commit, rollback, isolation level compliance |
| Concurrency | 10 | Race condition handling, read/write consistency |
| Error Handling | 15 | Missing keys, invalid data, timeout behavior |
| Property-Based | 20+ | Randomized input testing with StreamData/PropCheck |

### Property-Based Test Examples

```elixir
property "round-trip consistency" do
  check all key <- binary(), value <- map_of(atom(), term()) do
    :ok = Adapter.put(:test_table, key, value)
    assert {:ok, ^value} = Adapter.get(:test_table, key)
  end
end
```

The contract test suite is designed to be reusable across all adapter implementations. Each adapter test module includes the shared suite via `use PrismaticStorageCore.ContractTest`, which generates a comprehensive set of test cases that exercise every callback in the behaviour and every function in each declared trait. Adapters can extend the shared suite with backend-specific tests for features that go beyond the common contract.

## Integration Points

Storage Core integrates with every storage adapter in the platform:

| Adapter | Type | Latency | Best For |
|---------|------|---------|----------|
| **[Prismatic Storage ETS](@/apps/prismatic-storage-ets.md)** | In-memory | Microseconds | Hot caches, session state |
| **[Prismatic Storage Ecto](@/apps/prismatic-storage-ecto.md)** | Relational | Milliseconds | Entities, complex queries |
| **[Prismatic Storage Redis](@/apps/prismatic-storage-redis.md)** | Cache/KV | Sub-millisecond | Rate limiting, pub/sub |
| **[Prismatic Storage KuzuDB](@/apps/prismatic-storage-kuzudb.md)** | Graph | Milliseconds | Entity relationships |
| **[Prismatic Storage Meilisearch](@/apps/prismatic-storage-meilisearch.md)** | Search | Milliseconds | Full-text search |
| **[Prismatic Storage DuckDB](@/apps/prismatic-storage-duckdb.md)** | Analytical | Varies | Aggregations, reporting |

## NABLA Compliance

Storage Core enforces epistemic provenance at the data layer. Every storage operation emits telemetry events with timestamps, adapter identifiers, and operation metadata, satisfying the Provenance Mandatory axiom. The multi-adapter architecture inherently supports Signal Plurality -- data can be stored and queried across multiple independent backends, preventing single-source dependency. Contract testing provides formal verification that adapter implementations maintain data integrity invariants, aligning with the Trinity Gate's structural consistency requirement. The trait system's capability checking ensures that operations are only attempted on adapters that support them, preventing silent data loss from unsupported operations.

## Performance

| Metric | Value |
|--------|-------|
| Protocol dispatch overhead | Zero (compile-time resolution) |
| Trait capability check | O(1) runtime |
| Contract test suite execution | < 30 seconds per adapter |
| Memory footprint | Minimal (~100KB base) |
| Concurrent adapter support | 6 simultaneous backends |

## Related Resources

- [Prismatic Storage](@/apps/prismatic-storage.md) -- Unified storage facade consuming Core contracts
- [Prismatic](@/apps/prismatic.md) -- Core application consuming storage services through the adapter protocol
- [Prismatic Testing](@/apps/prismatic-testing.md) -- Contract test infrastructure shared across all adapters

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)