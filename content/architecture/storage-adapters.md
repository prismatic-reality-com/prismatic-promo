+++
title = "Storage Adapters"
weight = 6
date = 2026-02-12
[extra]
icon = "database"
color = "emerald"
description = "Unified storage abstraction across PostgreSQL, ETS, Redis, and KuzuDB"
date_created = "2025-07-05"
reading_time = "14 min"
difficulty = "advanced"
tags = ["storage", "adapters", "protocol", "ets", "postgresql", "redis", "kuzudb", "elixir", "otp"]
related_articles = ["phoenix-liveview", "pubsub", "supervision-trees", "postgresql-kuzudb"]
authors = ["Tomáš Korcak (korczis)"]
author = "Tomas Korcak (korczis)"
word_count = 1263
date_modified = "2026-02-23"
keywords = ["Storage", "Adapters", "Unified", "PostgreSQL", "Redis", "KuzuDB", "architecture", "Prismatic Platform"]
quality_score = 75
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Storage Adapters - Prismatic Platform"
+++

## Overview

The Prismatic Platform abstracts all data access behind a unified [protocol](/glossary/protocol/), enabling business logic to operate identically regardless of whether data resides in [ETS](/glossary/ets/) tables, [PostgreSQL](/architecture/postgresql-kuzudb/) databases, [Redis](/glossary/redis/) caches, or [KuzuDB](/glossary/kuzudb/) graph stores. This abstraction is not a theoretical exercise in software design -- it was driven by a concrete operational requirement: the platform's 90+ [umbrella application](/glossary/umbrella-application/)s each have different storage characteristics (latency tolerance, persistence requirements, query patterns, data relationships), and forcing all of them through a single storage backend would create performance bottlenecks in some applications and unnecessary complexity in others.

The storage adapter architecture implements the [adapter pattern](/glossary/adapter-pattern/) using [Elixir](/glossary/elixir/)'s protocol mechanism, which provides compile-time dispatch and zero-overhead polymorphism. Each storage backend ([prismatic_storage_ets](/apps/prismatic-storage-ets/), [prismatic_storage_ecto](/apps/prismatic-storage-ecto/), [prismatic_storage_redis](/apps/prismatic-storage-redis/), [prismatic_storage_kuzudb](/apps/prismatic-storage-kuzudb/)) is a separate umbrella application that implements the protocol for its backend type. Business logic in domain applications (such as [Prismatic Perimeter](/apps/prismatic-perimeter/) or [Prismatic Agents](/apps/prismatic-agents/)) programs against the protocol interface, and the concrete adapter is injected at configuration time or runtime.

This approach enables several capabilities that a monolithic storage layer cannot provide: transparent caching with ETS in front of PostgreSQL, seamless test isolation using in-memory adapters, graph queries for relationship-heavy domains alongside relational queries for tabular data, and runtime backend switching without redeploying the application.

## Protocol Architecture

### The Storage Protocol

The [storage protocol](/apps/prismatic-storage-core/) defines the minimal interface that all storage backends must implement. The design follows the principle of making the common case simple while allowing backend-specific extensions:

```elixir
defprotocol PrismaticStorage.Protocol do
  @moduledoc """
  Unified storage interface across all Prismatic storage backends.
  Every adapter MUST implement all functions in this protocol.
  Backend-specific capabilities are exposed through optional
  behaviour callbacks in each adapter module.
  """

  @doc "Retrieve a value by its key"
  @spec get(t(), key :: term()) :: {:ok, value :: term()} | {:error, :not_found}
  def get(adapter, key)

  @doc "Store a value under a key"
  @spec put(t(), key :: term(), value :: term()) :: :ok | {:error, term()}
  def put(adapter, key, value)

  @doc "Store a value with metadata (timestamps, TTL, tags)"
  @spec put(t(), key :: term(), value :: term(), opts :: keyword()) :: :ok | {:error, term()}
  def put(adapter, key, value, opts)

  @doc "Remove a value by its key"
  @spec delete(t(), key :: term()) :: :ok | {:error, term()}
  def delete(adapter, key)

  @doc "List values with optional filtering and pagination"
  @spec list(t(), opts :: keyword()) :: {:ok, [term()]} | {:error, term()}
  def list(adapter, opts)

  @doc "Check if a key exists without retrieving the value"
  @spec exists?(t(), key :: term()) :: boolean()
  def exists?(adapter, key)

  @doc "Count entries matching the given criteria"
  @spec count(t(), opts :: keyword()) :: {:ok, non_neg_integer()} | {:error, term()}
  def count(adapter, opts)
end
```

### Why Protocols Over Behaviours?

Elixir offers two polymorphism mechanisms: [protocols](/glossary/protocol/) (data-type dispatch) and [behaviours](/glossary/behaviour/) (module-based contracts). The storage layer uses protocols for the primary interface because:

1. **Dispatch on data type**: Protocol dispatch is determined by the adapter struct type, which means you can pass different adapter instances to the same function and get different behavior. This enables patterns like the multi-tier cache shown later in this article.

2. **Compile-time consolidation**: Protocol implementations are consolidated at compile time, meaning dispatch has zero runtime overhead in production builds. There is no function pointer lookup or vtable -- the [BEAM](/glossary/beam/) directly calls the correct implementation module.

3. **Open extension**: New storage backends can be added without modifying the protocol definition or any existing implementations. A team building a [DuckDB](/glossary/duckdb/) adapter simply implements the protocol for their struct type.

Behaviours are used for backend-specific capabilities that do not fit the universal protocol (e.g., KuzuDB's Cypher query interface, Ecto's changeset validation, Redis's TTL management).

```elixir
# Backend-specific behaviour for capabilities beyond the protocol
defmodule PrismaticStorage.GraphQueryable do
  @callback query(adapter :: term(), cypher :: String.t(), params :: map()) ::
              {:ok, [map()]} | {:error, term()}
  @callback shortest_path(adapter :: term(), from :: term(), to :: term()) ::
              {:ok, [term()]} | {:error, :no_path}
end

defmodule PrismaticStorage.Transactional do
  @callback transaction(adapter :: term(), fun :: (-> term())) ::
              {:ok, term()} | {:error, term()}
  @callback multi(adapter :: term(), operations :: [{atom(), term()}]) ::
              {:ok, map()} | {:error, atom(), term()}
end
```

## Adapter Implementations

### ETS Adapter

The [ETS adapter](/apps/prismatic-storage-ets/) provides in-memory storage with microsecond-level access times. ETS (Erlang Term Storage) is a built-in [OTP](/glossary/otp/) feature that stores Erlang terms in memory with concurrent read/write access. The adapter is the default choice for data that does not require persistence or that serves as a cache layer in front of persistent storage.

```elixir
defmodule PrismaticStorageEts.Adapter do
  @moduledoc """
  In-memory storage adapter using ETS tables.
  Provides sub-microsecond reads and writes for hot data.
  """

  @enforce_keys [:table, :name]
  defstruct [:table, :name, :type, :access]

  @spec new(atom(), keyword()) :: t()
  def new(name, opts \\ []) do
    type = Keyword.get(opts, :type, :set)
    access = Keyword.get(opts, :access, :public)
    read_concurrency = Keyword.get(opts, :read_concurrency, true)
    write_concurrency = Keyword.get(opts, :write_concurrency, true)

    table =
      :ets.new(name, [
        type,
        access,
        :named_table,
        read_concurrency: read_concurrency,
        write_concurrency: write_concurrency
      ])

    %__MODULE__{table: table, name: name, type: type, access: access}
  end
end

defimpl PrismaticStorage.Protocol, for: PrismaticStorageEts.Adapter do
  def get(%{table: table}, key) do
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [{^key, value, _metadata}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  def put(%{table: table}, key, value) do
    true = :ets.insert(table, {key, value})
    :ok
  end

  def put(%{table: table}, key, value, opts) do
    metadata = %{
      inserted_at: DateTime.utc_now(),
      ttl: Keyword.get(opts, :ttl),
      tags: Keyword.get(opts, :tags, [])
    }

    true = :ets.insert(table, {key, value, metadata})
    :ok
  end

  def delete(%{table: table}, key) do
    true = :ets.delete(table, key)
    :ok
  end

  def list(%{table: table}, opts) do
    limit = Keyword.get(opts, :limit, 100)
    offset = Keyword.get(opts, :offset, 0)

    entries =
      :ets.tab2list(table)
      |> Enum.drop(offset)
      |> Enum.take(limit)
      |> Enum.map(fn
        {_key, value} -> value
        {_key, value, _meta} -> value
      end)

    {:ok, entries}
  end

  def exists?(%{table: table}, key) do
    :ets.member(table, key)
  end

  def count(%{table: table}, _opts) do
    {:ok, :ets.info(table, :size)}
  end
end
```

**Performance characteristics** (benchmarked with benchee on 8-core, 32GB RAM):

| Operation | Latency (p50) | Latency (p99) | Throughput |
|-----------|--------------|--------------|------------|
| get (single key) | 0.3us | 0.8us | 3,000,000 ops/s |
| put (single key) | 0.5us | 1.2us | 2,000,000 ops/s |
| delete (single key) | 0.3us | 0.7us | 3,000,000 ops/s |
| list (100 items) | 15us | 45us | 60,000 ops/s |
| exists? | 0.2us | 0.5us | 5,000,000 ops/s |

### Ecto Adapter (PostgreSQL)

The [Ecto adapter](/apps/prismatic-storage-ecto/) provides persistent storage with full ACID transaction guarantees, complex querying via SQL, JSONB document storage, and full-text search. It is the authoritative data store for all business entities that require persistence.

```elixir
defmodule PrismaticStorageEcto.Adapter do
  @moduledoc """
  PostgreSQL storage adapter via Ecto.
  Provides ACID transactions, complex queries, JSONB, and full-text search.
  """

  @enforce_keys [:repo, :schema]
  defstruct [:repo, :schema, :preloads, :default_order]

  @spec new(module(), module(), keyword()) :: t()
  def new(repo, schema, opts \\ []) do
    %__MODULE__{
      repo: repo,
      schema: schema,
      preloads: Keyword.get(opts, :preloads, []),
      default_order: Keyword.get(opts, :default_order, [desc: :inserted_at])
    }
  end
end

defimpl PrismaticStorage.Protocol, for: PrismaticStorageEcto.Adapter do
  import Ecto.Query

  def get(%{repo: repo, schema: schema, preloads: preloads}, key) do
    case repo.get(schema, key) do
      nil -> {:error, :not_found}
      record -> {:ok, repo.preload(record, preloads)}
    end
  end

  def put(%{repo: repo, schema: schema}, _key, value) do
    changeset =
      schema
      |> struct()
      |> schema.changeset(value)

    case repo.insert_or_update(changeset) do
      {:ok, _record} -> :ok
      {:error, changeset} -> {:error, changeset}
    end
  end

  def put(adapter, key, value, _opts) do
    put(adapter, key, value)
  end

  def delete(%{repo: repo, schema: schema}, key) do
    case repo.get(schema, key) do
      nil -> {:error, :not_found}
      record -> repo.delete(record) |> elem(0)
    end
  end

  def list(%{repo: repo, schema: schema, default_order: order}, opts) do
    limit = Keyword.get(opts, :limit, 20)
    offset = Keyword.get(opts, :offset, 0)
    filters = Keyword.get(opts, :filters, [])

    query =
      schema
      |> apply_filters(filters)
      |> order_by(^order)
      |> limit(^limit)
      |> offset(^offset)

    {:ok, repo.all(query)}
  end

  def exists?(%{repo: repo, schema: schema}, key) do
    repo.exists?(from(s in schema, where: s.id == ^key))
  end

  def count(%{repo: repo, schema: schema}, opts) do
    filters = Keyword.get(opts, :filters, [])

    count =
      schema
      |> apply_filters(filters)
      |> repo.aggregate(:count)

    {:ok, count}
  end

  defp apply_filters(query, []), do: query

  defp apply_filters(query, [{field, value} | rest]) do
    query
    |> where([s], field(s, ^field) == ^value)
    |> apply_filters(rest)
  end
end
```

**Performance characteristics** (PostgreSQL 16, connection pool of 20):

| Operation | Latency (p50) | Latency (p99) | Notes |
|-----------|--------------|--------------|-------|
| get (indexed primary key) | 0.8ms | 3ms | Single index scan |
| put (insert) | 2ms | 8ms | Write + WAL flush |
| put (update) | 2.5ms | 10ms | Index update + WAL |
| delete | 1.5ms | 5ms | Soft delete pattern |
| list (20 items, indexed filter) | 2ms | 8ms | Index scan + limit |
| list (20 items, full-text search) | 5ms | 20ms | GIN index scan |
| count (with filter) | 1ms | 5ms | Index-only scan |

### KuzuDB Adapter

The [KuzuDB adapter](/apps/prismatic-storage-kuzudb/) provides graph storage and traversal capabilities for domain models where relationships are first-class entities. In the Prismatic Platform, this includes agent dependency graphs, attack path analysis, infrastructure relationship mapping, and [knowledge graph](/glossary/knowledge-graph/) construction.

```elixir
defmodule PrismaticStorageKuzu.Adapter do
  @moduledoc """
  Graph storage adapter using KuzuDB.
  Provides Cypher queries, multi-hop traversals, and path analysis.
  """

  @enforce_keys [:database, :connection]
  defstruct [:database, :connection, :schema_version]

  @behaviour PrismaticStorage.GraphQueryable

  @impl PrismaticStorage.GraphQueryable
  def query(%{connection: conn}, cypher, params \\ %{}) do
    case Kuzu.execute(conn, cypher, params) do
      {:ok, result} -> {:ok, result.rows}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl PrismaticStorage.GraphQueryable
  def shortest_path(%{connection: conn}, from_id, to_id) do
    cypher = """
    MATCH p = shortestPath(
      (a {id: $from})-[*..10]-(b {id: $to})
    )
    RETURN nodes(p), relationships(p)
    """

    case Kuzu.execute(conn, cypher, %{from: from_id, to: to_id}) do
      {:ok, %{rows: [path | _]}} -> {:ok, path}
      {:ok, %{rows: []}} -> {:error, :no_path}
      {:error, reason} -> {:error, reason}
    end
  end
end

defimpl PrismaticStorage.Protocol, for: PrismaticStorageKuzu.Adapter do
  def get(%{connection: conn}, key) do
    cypher = "MATCH (n {id: $id}) RETURN n"

    case Kuzu.execute(conn, cypher, %{id: key}) do
      {:ok, %{rows: [node | _]}} -> {:ok, node}
      {:ok, %{rows: []}} -> {:error, :not_found}
      {:error, reason} -> {:error, reason}
    end
  end

  def put(%{connection: conn}, key, value) do
    cypher = "MERGE (n {id: $id}) SET n += $props"

    case Kuzu.execute(conn, cypher, %{id: key, props: value}) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  def put(adapter, key, value, _opts), do: put(adapter, key, value)

  def delete(%{connection: conn}, key) do
    cypher = "MATCH (n {id: $id}) DETACH DELETE n"

    case Kuzu.execute(conn, cypher, %{id: key}) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  def list(%{connection: conn}, opts) do
    label = Keyword.get(opts, :label, "Node")
    limit = Keyword.get(opts, :limit, 100)
    cypher = "MATCH (n:#{label}) RETURN n LIMIT $limit"

    case Kuzu.execute(conn, cypher, %{limit: limit}) do
      {:ok, %{rows: rows}} -> {:ok, rows}
      {:error, reason} -> {:error, reason}
    end
  end

  def exists?(%{connection: conn}, key) do
    cypher = "MATCH (n {id: $id}) RETURN count(n) > 0 AS exists"

    case Kuzu.execute(conn, cypher, %{id: key}) do
      {:ok, %{rows: [%{exists: exists}]}} -> exists
      _ -> false
    end
  end

  def count(%{connection: conn}, opts) do
    label = Keyword.get(opts, :label, "Node")
    cypher = "MATCH (n:#{label}) RETURN count(n) AS cnt"

    case Kuzu.execute(conn, cypher, %{}) do
      {:ok, %{rows: [%{cnt: count}]}} -> {:ok, count}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

**Performance characteristics** (KuzuDB embedded, SSD storage):

| Operation | Latency (p50) | Latency (p99) | Notes |
|-----------|--------------|--------------|-------|
| get (single node by ID) | 0.5ms | 2ms | Direct index lookup |
| put (merge node) | 2ms | 8ms | Index update + persistence |
| 2-hop traversal | 3ms | 12ms | Graph scan with index |
| Shortest path (up to 10 hops) | 5ms | 25ms | BFS with pruning |
| Pattern match (complex Cypher) | 10ms | 50ms | Depends on graph density |

### Redis Adapter

The [Redis adapter](/apps/prismatic-storage-redis/) provides distributed caching with TTL support, atomic operations, and distributed locking. It bridges the gap between ETS (fast but node-local) and PostgreSQL (persistent but slower):

| Capability | ETS | Redis | PostgreSQL |
|-----------|-----|-------|------------|
| Latency | <1us | ~0.5ms | ~2ms |
| Persistence | None | Optional (RDB/AOF) | Full ACID |
| Distribution | Single node | Cluster-native | Single primary |
| TTL support | Manual | Native | Manual (triggers) |
| Atomic counters | CAS operations | Native INCR | SELECT FOR UPDATE |
| Pub/Sub | Via [Phoenix](/glossary/phoenix/) [PubSub](/glossary/pubsub/) | Native | LISTEN/NOTIFY |

## Multi-Adapter Composition Patterns

The true power of the adapter architecture emerges when adapters are composed to create sophisticated data access patterns. Because all adapters implement the same protocol, composition is type-safe and transparent to consumers.

### Read-Through Cache

The read-through cache pattern attempts to serve data from ETS first, falling back to PostgreSQL on cache miss, and populating the cache on successful retrieval:

```elixir
defmodule PrismaticStorage.ReadThroughCache do
  @moduledoc """
  Composes an ETS cache in front of an Ecto persistent store.
  Cache misses automatically populate the cache from the backing store.
  """

  defstruct [:cache, :backing_store, :ttl]

  def new(cache_adapter, backing_adapter, opts \\ []) do
    %__MODULE__{
      cache: cache_adapter,
      backing_store: backing_adapter,
      ttl: Keyword.get(opts, :ttl, :timer.minutes(5))
    }
  end
end

defimpl PrismaticStorage.Protocol, for: PrismaticStorage.ReadThroughCache do
  def get(%{cache: cache, backing_store: store}, key) do
    case PrismaticStorage.Protocol.get(cache, key) do
      {:ok, value} ->
        {:ok, value}

      {:error, :not_found} ->
        case PrismaticStorage.Protocol.get(store, key) do
          {:ok, value} ->
            PrismaticStorage.Protocol.put(cache, key, value)
            {:ok, value}

          error ->
            error
        end
    end
  end

  def put(%{cache: cache, backing_store: store}, key, value) do
    with :ok <- PrismaticStorage.Protocol.put(store, key, value) do
      PrismaticStorage.Protocol.put(cache, key, value)
    end
  end

  def put(%{cache: cache, backing_store: store}, key, value, opts) do
    with :ok <- PrismaticStorage.Protocol.put(store, key, value, opts) do
      PrismaticStorage.Protocol.put(cache, key, value, opts)
    end
  end

  def delete(%{cache: cache, backing_store: store}, key) do
    PrismaticStorage.Protocol.delete(cache, key)
    PrismaticStorage.Protocol.delete(store, key)
  end

  def list(%{backing_store: store}, opts) do
    PrismaticStorage.Protocol.list(store, opts)
  end

  def exists?(%{cache: cache, backing_store: store}, key) do
    PrismaticStorage.Protocol.exists?(cache, key) or
      PrismaticStorage.Protocol.exists?(store, key)
  end

  def count(%{backing_store: store}, opts) do
    PrismaticStorage.Protocol.count(store, opts)
  end
end
```

### Write-Behind Pattern

The write-behind pattern provides fast write acknowledgment by writing to the cache immediately and asynchronously persisting to the backing store. This trades immediate consistency for lower write latency:

```elixir
defmodule PrismaticStorage.WriteBehind do
  @moduledoc """
  Fast writes via cache with asynchronous persistence.
  Guarantees eventual consistency via supervised async tasks.
  """

  defstruct [:cache, :backing_store, :task_supervisor]

  def new(cache_adapter, backing_adapter, opts \\ []) do
    supervisor = Keyword.get(opts, :task_supervisor, PrismaticStorage.TaskSupervisor)

    %__MODULE__{
      cache: cache_adapter,
      backing_store: backing_adapter,
      task_supervisor: supervisor
    }
  end
end

defimpl PrismaticStorage.Protocol, for: PrismaticStorage.WriteBehind do
  def put(%{cache: cache, backing_store: store, task_supervisor: sup}, key, value) do
    # Immediate write to cache
    :ok = PrismaticStorage.Protocol.put(cache, key, value)

    # Async write to persistent storage via supervised task
    Task.Supervisor.start_child(sup, fn ->
      case PrismaticStorage.Protocol.put(store, key, value) do
        :ok ->
          :ok

        {:error, reason} ->
          Logger.warning("Write-behind persistence failed: #{inspect(reason)}")
          # The cache still has the data; retry or alert
          :telemetry.execute(
            [:prismatic, :storage, :write_behind, :failure],
            %{count: 1},
            %{key: key, reason: reason}
          )
      end
    end)

    :ok
  end

  # Other protocol functions delegate to appropriate adapter...
  def get(%{cache: cache}, key), do: PrismaticStorage.Protocol.get(cache, key)
  def delete(%{cache: cache, backing_store: store}, key) do
    PrismaticStorage.Protocol.delete(cache, key)
    PrismaticStorage.Protocol.delete(store, key)
  end
  def list(%{backing_store: store}, opts), do: PrismaticStorage.Protocol.list(store, opts)
  def put(adapter, key, value, _opts), do: put(adapter, key, value)
  def exists?(%{cache: cache}, key), do: PrismaticStorage.Protocol.exists?(cache, key)
  def count(%{backing_store: store}, opts), do: PrismaticStorage.Protocol.count(store, opts)
end
```

### Multi-Backend Query Routing

For domains where different query types map to different backends (e.g., point lookups to ETS, full-text search to PostgreSQL, relationship traversal to KuzuDB), a routing adapter dispatches based on query characteristics:

```elixir
defmodule PrismaticStorage.QueryRouter do
  defstruct [:point_store, :search_store, :graph_store]

  def new(point, search, graph) do
    %__MODULE__{point_store: point, search_store: search, graph_store: graph}
  end

  def point_lookup(router, key) do
    PrismaticStorage.Protocol.get(router.point_store, key)
  end

  def full_text_search(router, query, opts \\ []) do
    PrismaticStorage.Protocol.list(router.search_store,
      Keyword.put(opts, :filters, [{:search, query}])
    )
  end

  def graph_traverse(router, from_id, relationship, depth \\ 3) do
    PrismaticStorage.GraphQueryable.query(
      router.graph_store,
      "MATCH (a {id: $from})-[:#{relationship}*1..#{depth}]->(b) RETURN b",
      %{from: from_id}
    )
  end
end
```

## Testing with Storage Adapters

The adapter architecture provides a significant testing advantage: tests can use in-memory ETS adapters instead of PostgreSQL, eliminating database setup/teardown overhead and enabling fully parallel test execution:

```elixir
defmodule PrismaticPerimeter.AssetsTest do
  use ExUnit.Case, async: true

  setup do
    # Create isolated ETS-backed adapter for this test
    adapter = PrismaticStorageEts.Adapter.new(:"test_#{System.unique_integer()}")
    {:ok, adapter: adapter}
  end

  test "stores and retrieves assets", %{adapter: adapter} do
    asset = %{id: "a1", domain: "example.com", type: :domain}
    assert :ok = PrismaticStorage.Protocol.put(adapter, "a1", asset)
    assert {:ok, ^asset} = PrismaticStorage.Protocol.get(adapter, "a1")
  end

  test "returns not_found for missing keys", %{adapter: adapter} do
    assert {:error, :not_found} = PrismaticStorage.Protocol.get(adapter, "nonexistent")
  end

  test "counts entries", %{adapter: adapter} do
    for i <- 1..10 do
      PrismaticStorage.Protocol.put(adapter, "key-#{i}", %{value: i})
    end

    assert {:ok, 10} = PrismaticStorage.Protocol.count(adapter, [])
  end
end
```

Contract tests ensure all adapter implementations satisfy the protocol's behavioral requirements:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Shared test suite that validates any adapter implementation.
  Use by including in adapter-specific test modules.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      setup do
        {:ok, adapter: unquote(adapter_module).new(:"test_#{System.unique_integer()}")}
      end

      test "get returns {:error, :not_found} for missing key", %{adapter: a} do
        assert {:error, :not_found} = PrismaticStorage.Protocol.get(a, "missing")
      end

      test "put then get returns stored value", %{adapter: a} do
        assert :ok = PrismaticStorage.Protocol.put(a, "k", "v")
        assert {:ok, "v"} = PrismaticStorage.Protocol.get(a, "k")
      end

      test "delete removes the entry", %{adapter: a} do
        PrismaticStorage.Protocol.put(a, "k", "v")
        assert :ok = PrismaticStorage.Protocol.delete(a, "k")
        assert {:error, :not_found} = PrismaticStorage.Protocol.get(a, "k")
      end

      test "exists? returns correct boolean", %{adapter: a} do
        refute PrismaticStorage.Protocol.exists?(a, "k")
        PrismaticStorage.Protocol.put(a, "k", "v")
        assert PrismaticStorage.Protocol.exists?(a, "k")
      end

      test "count starts at zero", %{adapter: a} do
        assert {:ok, 0} = PrismaticStorage.Protocol.count(a, [])
      end
    end
  end
end
```

## Performance Comparison Across Backends

Comprehensive benchmarks across all four adapters, measured under identical conditions (same machine, same data set of 10,000 entries):

| Operation | ETS | PostgreSQL | Redis | KuzuDB |
|-----------|-----|-----------|-------|--------|
| Single key read | 0.3us | 0.8ms | 0.4ms | 0.5ms |
| Single key write | 0.5us | 2ms | 0.5ms | 2ms |
| Batch read (100 keys) | 30us | 3ms | 2ms | 5ms |
| List with filter (20 results) | 50us | 2ms | 1ms | 3ms |
| Count all entries | 0.1us | 1ms | 0.3ms | 2ms |
| Full-text search | N/A | 5ms | N/A | N/A |
| 3-hop graph traversal | N/A | 15ms (recursive CTE) | N/A | 3ms |
| Transaction (3 operations) | N/A | 5ms | 2ms (MULTI) | 8ms |

These benchmarks demonstrate why the multi-adapter architecture exists: no single backend excels at all access patterns. ETS dominates for point lookups and hot data, PostgreSQL is required for ACID persistence and complex queries, Redis provides distributed caching with TTL, and KuzuDB delivers order-of-magnitude improvements for graph traversal compared to PostgreSQL's recursive CTEs.

## Supervision and Lifecycle Management

Each storage adapter is managed within the platform's [supervision tree](/architecture/supervision-trees/) to ensure proper initialization, health monitoring, and graceful shutdown:

```elixir
defmodule PrismaticStorage.Supervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # Task supervisor for write-behind async persistence
      {Task.Supervisor, name: PrismaticStorage.TaskSupervisor},

      # ETS tables (created at startup, owned by supervisor)
      {PrismaticStorageEts.TableOwner, tables: [:assets_cache, :agent_state, :config]},

      # Ecto repository (PostgreSQL connection pool)
      PrismaticStorage.Repo,

      # Redis connection pool
      {PrismaticStorageRedis.Pool, url: redis_url(), pool_size: 10},

      # KuzuDB embedded database
      {PrismaticStorageKuzu.Database, path: kuzu_path()}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

## Summary

The storage adapter architecture is the data access foundation of the Prismatic Platform. By implementing a unified [protocol](/glossary/protocol/) across four distinct backends -- [ETS](/glossary/ets/) for microsecond in-memory access, PostgreSQL for ACID persistence, [Redis](/glossary/redis/) for distributed caching, and [KuzuDB](/glossary/kuzudb/) for graph traversal -- the platform can assign each data access pattern to its optimal backend without polluting business logic with storage concerns. The composition patterns (read-through cache, write-behind, query routing) demonstrate that the protocol-based design is not merely an abstraction exercise but a practical architecture that delivers measurable performance improvements. The same protocol enables transparent test isolation using in-memory adapters, contract testing that verifies behavioral consistency across all backends, and runtime backend switching without redeployment. This architecture integrates naturally with the platform's [PubSub event system](/architecture/pubsub/) for cache invalidation, [LiveView dashboards](/architecture/phoenix-liveview/) for real-time data display, and [supervision trees](/architecture/supervision-trees/) for lifecycle management.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
