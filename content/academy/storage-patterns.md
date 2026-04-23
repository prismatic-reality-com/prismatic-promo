+++
title = "Storage Architecture & Adapters"
weight = 7
[extra]
description = "Working with PostgreSQL, ETS, KuzuDB, and Meilisearch through the trait-based storage layer"
category = "intermediate"
difficulty = "intermediate"
duration = "55 min"
prerequisites = ["getting-started", "otp-fundamentals"]
glossary_terms = ["aiad", "adapter-pattern", "cascade", "no-mercy", "quality-dna"]
technologies = ["elixir", "postgresql", "ets", "kuzudb", "meilisearch", "ecto"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 958
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Storage", "Architecture", "Adapters", "Working", "PostgreSQL", "KuzuDB", "Meilisearch", "academy", "intermediate", "Prismatic Platform"]
tags = ["academy", "intermediate", "storage-architecture--adapters", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Storage Architecture & Adapters - Prismatic Platform"
+++

## Overview

The Prismatic Platform does not commit to a single storage technology. Instead, it defines storage behaviors (traits) in a core library and implements them through pluggable adapters. This architecture allows the same business logic to run against ETS in development, PostgreSQL in production, and KuzuDB for graph queries -- all without changing application code. This guide teaches you the trait system, adapter implementation, and patterns for choosing the right storage backend.

You will learn:

- The trait-based storage architecture in `prismatic_storage_core`
- How to use existing adapters (ETS, Ecto/PostgreSQL, Meilisearch, KuzuDB)
- How to implement a new storage adapter from scratch
- Contract testing patterns that verify adapter compliance
- Performance characteristics and when to use each backend

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Completed [OTP Design Patterns for Prismatic](@/academy/otp-fundamentals.md)
- Basic understanding of database concepts (CRUD, indexing, transactions)

## Core Concepts

### The Storage Trait System

At the foundation lies `prismatic_storage_core`, which defines behaviors (Elixir's equivalent of interfaces) that all storage adapters must implement:

```elixir
defmodule PrismaticStorageCore.StorageBehaviour do
  @moduledoc """
  Core storage trait. All adapters must implement these callbacks.
  """

  @callback init(opts :: keyword()) :: {:ok, state :: term()} | {:error, term()}
  @callback get(key :: term(), state :: term()) :: {:ok, term()} | {:error, :not_found}
  @callback put(key :: term(), value :: term(), state :: term()) :: {:ok, state :: term()}
  @callback delete(key :: term(), state :: term()) :: {:ok, state :: term()}
  @callback list(opts :: keyword(), state :: term()) :: {:ok, [term()]}
  @callback count(state :: term()) :: {:ok, non_neg_integer()}
end
```

This separation means business logic depends only on the behavior, never on a concrete implementation. Swapping backends is a configuration change, not a code change.

### Available Adapters

| Adapter | Backend | Best For | Trade-offs |
|---------|---------|----------|------------|
| `PrismaticStorageEts` | ETS tables | Development, caching, volatile data | Fast but not persistent |
| `PrismaticStorageEcto` | PostgreSQL via Ecto | Production data, transactions, ACID | Durable but slower than ETS |
| `PrismaticStorageMeilisearch` | Meilisearch | Full-text search, faceted filtering | Excellent search, eventual consistency |
| `PrismaticStorageKuzu` | KuzuDB | Graph queries, relationship traversal | Graph-native, limited for tabular data |

### The Adapter Contract

Every adapter must pass the contract test suite. This guarantees behavioral equivalence across backends:

```elixir
# Any module can use the contract test to verify compliance
use PrismaticStorage.AdapterContractTest, adapter_module: MyAdapter
```

## Step-by-Step Guide

### Step 1: Using the ETS Adapter

The ETS adapter is the simplest to start with. It requires no external services:

```elixir
defmodule MyApp.Cache do
  @moduledoc """
  Application cache using the ETS storage adapter.
  """

  alias PrismaticStorageEts.Adapter, as: Storage

  @spec start_link(keyword()) :: {:ok, pid()}
  def start_link(opts \\ []) do
    Storage.start_link(Keyword.merge([name: __MODULE__, table: :my_app_cache], opts))
  end

  @spec get(term()) :: {:ok, term()} | {:error, :not_found}
  def get(key) do
    Storage.get(__MODULE__, key)
  end

  @spec put(term(), term()) :: :ok
  def put(key, value) do
    Storage.put(__MODULE__, key, value)
  end

  @spec delete(term()) :: :ok
  def delete(key) do
    Storage.delete(__MODULE__, key)
  end
end
```

### Step 2: Using the Ecto/PostgreSQL Adapter

For persistent storage, the Ecto adapter provides full ACID transactions:

```elixir
defmodule MyApp.Repo do
  use Ecto.Repo,
    otp_app: :my_app,
    adapter: Ecto.Adapters.Postgres
end

defmodule MyApp.Schema.Finding do
  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "findings" do
    field :domain, :string
    field :severity, Ecto.Enum, values: [:critical, :high, :medium, :low, :info]
    field :description, :string
    field :evidence, :map
    field :confidence, :float

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(finding, attrs) do
    finding
    |> cast(attrs, [:domain, :severity, :description, :evidence, :confidence])
    |> validate_required([:domain, :severity, :description])
    |> validate_number(:confidence, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0)
    |> validate_length(:description, min: 10)
  end
end
```

Using the adapter through the storage trait:

```elixir
alias PrismaticStorageEcto.Adapter, as: Storage

# Store a finding
{:ok, finding} = Storage.put(:findings, "finding-123", %{
  domain: "example.com",
  severity: :high,
  description: "TLS certificate expires in 7 days",
  confidence: 0.95
})

# Retrieve a finding
{:ok, finding} = Storage.get(:findings, "finding-123")

# List findings with filters
{:ok, findings} = Storage.list(:findings, severity: :critical, limit: 50)
```

### Step 3: Implementing a Custom Adapter

To add a new storage backend, implement the behavior and pass the contract tests:

```elixir
defmodule MyApp.Storage.RedisAdapter do
  @moduledoc """
  Redis-backed storage adapter implementing the StorageBehaviour trait.
  """

  @behaviour PrismaticStorageCore.StorageBehaviour

  @impl true
  def init(opts) do
    case Redix.start_link(opts) do
      {:ok, conn} -> {:ok, %{conn: conn, prefix: Keyword.get(opts, :prefix, "prismatic")}}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def get(key, %{conn: conn, prefix: prefix}) do
    case Redix.command(conn, ["GET", "#{prefix}:#{key}"]) do
      {:ok, nil} -> {:error, :not_found}
      {:ok, value} -> {:ok, :erlang.binary_to_term(value)}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def put(key, value, %{conn: conn, prefix: prefix} = state) do
    serialized = :erlang.term_to_binary(value)

    case Redix.command(conn, ["SET", "#{prefix}:#{key}", serialized]) do
      {:ok, "OK"} -> {:ok, state}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def delete(key, %{conn: conn, prefix: prefix} = state) do
    case Redix.command(conn, ["DEL", "#{prefix}:#{key}"]) do
      {:ok, _} -> {:ok, state}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def list(_opts, %{conn: conn, prefix: prefix}) do
    case Redix.command(conn, ["KEYS", "#{prefix}:*"]) do
      {:ok, keys} -> {:ok, keys}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def count(%{conn: conn, prefix: prefix}) do
    case Redix.command(conn, ["KEYS", "#{prefix}:*"]) do
      {:ok, keys} -> {:ok, length(keys)}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### Step 4: Contract Testing Your Adapter

Use the shared contract test suite to verify your adapter:

```elixir
defmodule MyApp.Storage.RedisAdapterTest do
  use ExUnit.Case, async: false

  # This macro generates tests for all StorageBehaviour callbacks
  use PrismaticStorage.AdapterContractTest,
    adapter_module: MyApp.Storage.RedisAdapter,
    init_opts: [host: "localhost", port: 6379, prefix: "test"]

  # Add adapter-specific tests
  describe "redis-specific behavior" do
    test "handles connection loss gracefully" do
      # Test reconnection behavior
    end

    test "respects key prefix isolation" do
      # Test that different prefixes create isolated namespaces
    end
  end
end
```

### Step 5: Choosing the Right Backend

Use this decision matrix:

```
Need ACID transactions?          --> PostgreSQL (Ecto adapter)
Need fast key-value lookups?     --> ETS adapter
Need full-text search?           --> Meilisearch adapter
Need graph traversal?            --> KuzuDB adapter
Need persistent caching?         --> Redis adapter (custom)
Need all of the above?           --> Use multiple adapters with domain routing
```

The platform commonly uses multiple adapters simultaneously. A typical configuration:

```elixir
config :my_app, :storage,
  primary: PrismaticStorageEcto.Adapter,      # Persistent data
  cache: PrismaticStorageEts.Adapter,         # Hot data cache
  search: PrismaticStorageMeilisearch.Adapter, # Search index
  graph: PrismaticStorageKuzu.Adapter          # Relationship queries
```

## Code Examples

### Domain Router Pattern

```elixir
defmodule MyApp.Storage.Router do
  @moduledoc """
  Routes storage operations to the appropriate backend
  based on data characteristics.
  """

  @spec store(atom(), term(), term()) :: {:ok, term()} | {:error, term()}
  def store(:findings, key, value) do
    # Persistent storage for findings
    with {:ok, _} <- PrismaticStorageEcto.Adapter.put(:findings, key, value),
         :ok <- PrismaticStorageMeilisearch.Adapter.index(:findings, key, value) do
      {:ok, value}
    end
  end

  def store(:metrics, key, value) do
    # ETS for volatile metrics (fast, no persistence needed)
    PrismaticStorageEts.Adapter.put(:metrics, key, value)
  end

  def store(:relationships, key, value) do
    # KuzuDB for graph data
    PrismaticStorageKuzu.Adapter.put(:relationships, key, value)
  end
end
```

## Common Pitfalls

**Coupling business logic to a specific adapter.** Always depend on the behavior, never on the concrete adapter module. This is the entire purpose of the trait system.

**Using ETS for data that must survive restarts.** ETS tables are destroyed when their owner process terminates. For persistent data, use the Ecto adapter or implement ETS-to-disk snapshotting.

**Ignoring the contract test suite.** A custom adapter that skips contract tests will break when the behavior evolves. Always run `use PrismaticStorage.AdapterContractTest` in your test suite.

**Serializing large Elixir terms with `:erlang.term_to_binary`.** This format is Erlang-specific and version-sensitive. For cross-system storage, use JSON or Protocol Buffers.

## Exercises

1. **Build an in-memory adapter with TTL.** Extend the ETS adapter to support per-key time-to-live. Entries should expire and be cleaned up automatically.

2. **Implement dual-write.** Create a storage module that writes to both ETS (for speed) and PostgreSQL (for durability), with ETS serving as a read-through cache.

3. **Run the contract tests.** Pick an existing adapter and run its contract tests. Read through the generated test cases to understand what behavioral guarantees are verified.

4. **Profile adapter performance.** Use `:timer.tc/1` to measure get/put/delete latency for ETS vs. Ecto on 1,000 operations. Document the performance characteristics.

## Summary

The Prismatic storage architecture separates storage concerns into behaviors (traits) and implementations (adapters). Business logic depends only on behaviors, making backend changes a configuration concern. Four production adapters cover relational, key-value, search, and graph storage needs. Contract tests ensure all adapters provide identical behavioral guarantees. The domain router pattern enables using multiple backends simultaneously, routing operations based on data characteristics.

## Practical Implementation

### In Prismatic Platform

The storage architecture spans seven dedicated applications:

- **prismatic_storage_core** (`apps/prismatic_storage_core/`) -- Defines `StorageBehaviour` callbacks (traits), protocols, and contract test macros. All adapters depend on this. Example: `use PrismaticStorage.AdapterContractTest, adapter_module: MyAdapter`
- **prismatic_storage_ets** (`apps/prismatic_storage_ets/`) -- In-memory ETS adapter for development, caching, and volatile data. Fast (sub-microsecond) but not persistent across restarts
- **prismatic_storage_ecto** (`apps/prismatic_storage_ecto/`) -- PostgreSQL adapter via Ecto for production-grade persistent storage with ACID transactions, migrations, and query composition
- **prismatic_storage_meilisearch** (`apps/prismatic_storage_meilisearch/`) -- Full-text search adapter for faceted filtering and instant search. Used by the DD platform for entity search across 122 OSINT sources
- **prismatic_storage_kuzudb** (`apps/prismatic_storage_kuzudb/`) -- Graph database adapter for relationship traversal, ownership chain analysis, and shared director network queries in due diligence investigations
- **prismatic_storage_duckdb** (`apps/prismatic_storage_duckdb/`) -- Analytical database adapter for columnar data processing and OLAP queries
- **prismatic_storage_redis** (`apps/prismatic_storage_redis/`) -- Redis adapter for persistent caching, session storage, and pub/sub message brokering
- **prismatic_storage** (`apps/prismatic_storage/`) -- Unified storage facade providing domain routing across multiple backends

### Code Examples from the Codebase

The DD platform uses multiple storage backends simultaneously:

```elixir
# prismatic_dd uses multi-backend storage routing:
# - PostgreSQL (Ecto) for entity and case persistence
# - KuzuDB for ownership chains and director networks
# - Meilisearch for full-text entity search
# - ETS for hot caches during investigation sessions

# Example: graph traversal for UBO identification
{:ok, chain} = PrismaticDd.ownership_chain(entity_id, max_depth: 10)
# Backed by KuzuDB Cypher queries through prismatic_storage_kuzudb
```

The adapter contract test ensures behavioral equivalence:

```elixir
# Every adapter MUST pass this contract test
defmodule MyAdapter.ContractTest do
  use PrismaticStorage.AdapterContractTest,
    adapter_module: MyAdapter,
    init_opts: [name: :test_adapter]
  # Generates tests for all StorageBehaviour callbacks automatically
end
```

## See Also

### Related Applications
- [prismatic_storage_core](@/apps/prismatic-storage-core.md) -- Core traits and contract test infrastructure
- [prismatic_storage_ets](@/apps/prismatic-storage-ets.md) -- ETS adapter for volatile data
- [prismatic_storage_ecto](@/apps/prismatic-storage-ecto.md) -- PostgreSQL adapter for persistent data
- [prismatic_storage_meilisearch](@/apps/prismatic-storage-meilisearch.md) -- Full-text search adapter
- [prismatic_storage_kuzudb](@/apps/prismatic-storage-kuzudb.md) -- Graph database adapter
- [prismatic_storage_duckdb](@/apps/prismatic-storage-duckdb.md) -- Analytical/columnar database adapter
- [prismatic_storage_redis](@/apps/prismatic-storage-redis.md) -- Redis caching adapter

### Glossary
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Design pattern for pluggable implementations
- [PostgreSQL](@/glossary/postgresql.md) -- Primary relational database
- [Redis](@/glossary/redis.md) -- In-memory data structure store
- [KuzuDB](@/glossary/kuzudb.md) -- Embedded graph database

### Architecture
- [Storage Adapters](@/architecture/storage-adapters.md) -- Architectural overview of the storage layer
- [PostgreSQL & KuzuDB](@/architecture/postgresql-kuzudb.md) -- Relational and graph storage design
- [Meilisearch](@/architecture/meilisearch.md) -- Search infrastructure architecture

### Related Academy Topics
- [DD Investigation Techniques](@/academy/dd-investigation.md) -- Multi-backend storage in due diligence
- [Building EASM Features](@/academy/easm-development.md) -- Storage patterns for security assessments
- [OTP Design Patterns](@/academy/otp-fundamentals.md) -- Process patterns behind storage adapters
- [API Integration](@/academy/api-integration.md) -- Exposing storage operations via REST

## Next Steps

- [Building LiveView Dashboards](@/academy/liveview-dashboards.md) -- display storage data in real-time interfaces
- [API Integration Guide](@/academy/api-integration.md) -- expose storage operations through the REST API
- [OTP Design Patterns for Prismatic](@/academy/otp-fundamentals.md) -- understand the process patterns behind storage adapters

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)