+++
title = "Storage Pattern"
weight = 50
[extra]
tags = ["glossary", "architecture", "storage", "elixir", "patterns", "ets", "ecto", "adapters"]
description = "The architectural pattern governing how data is persisted, retrieved, cached, and indexed across multiple backend systems through a unified adapter contract -- the backbone of the Prismatic Platform's polyglot persistence strategy with ETS, Ecto, Meilisearch, and KuzuDB backends"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["adapter-pattern", "ets", "postgresql", "meilisearch", "kuzudb", "caching", "polyglot-persistence", "acid-transactions", "schema", "key-value-store"]
related_concepts = ["adapter contract", "repository pattern", "unit of work", "polyglot persistence", "CQRS", "event sourcing", "data locality", "storage tiering"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Phoenix LiveView"]
see_also = ["adapter-pattern", "caching", "polyglot-persistence", "acid-transactions"]
key_takeaway = "The storage pattern abstracts persistence behind a unified adapter contract, enabling the same business logic to operate across ETS (microsecond in-memory), Ecto/PostgreSQL (ACID relational), Meilisearch (full-text search), and KuzuDB (graph traversal) without coupling to any specific backend"
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 829
date_modified = "2026-02-23"
keywords = ["Storage", "Pattern", "Prismatic", "Platforms", "Ecto", "Meilisearch", "KuzuDB", "glossary", "architecture", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Storage Pattern - Prismatic Platform"
+++

## Definition

A Storage Pattern is an architectural abstraction that decouples business logic from persistence mechanisms by defining a uniform interface (adapter contract) through which data is stored, retrieved, updated, deleted, and queried. The pattern enables a system to use multiple storage backends simultaneously -- each optimized for different access patterns -- while presenting a consistent API to application code. Business logic interacts with the storage contract, never with specific backends, allowing backends to be swapped, composed, or evolved independently.

The storage pattern is distinct from simpler abstractions like the Repository pattern (which typically wraps a single database) or the DAO pattern (which maps objects to tables). The storage pattern explicitly supports [polyglot persistence](/glossary/polyglot-persistence/): using the right storage engine for each data access pattern. A single entity might exist simultaneously in ETS for fast reads, [PostgreSQL](/glossary/postgresql/) for durable writes, [Meilisearch](/glossary/meilisearch/) for search, and [KuzuDB](/glossary/kuzudb/) for graph traversal.

Within the Prismatic Platform, the storage pattern is implemented through the `prismatic_storage_core` application, which defines the adapter [behaviour](/glossary/behaviour/), and four backend applications (`prismatic_storage_ets`, `prismatic_storage_ecto`, `prismatic_storage_meilisearch`, `prismatic_storage_kuzu`) that provide [specialized variants](/glossary/specialized-variants/) of the contract.

## Architectural Motivation

### The Problem of Backend Coupling

Without a storage pattern, application code couples directly to database APIs:

```elixir
# Coupled: business logic knows about Repo
def get_user(id) do
  Repo.get(User, id)
end
```

This coupling creates problems: changing databases requires rewriting business logic, testing requires a running database, and using multiple backends requires different APIs in different code paths.

### The Solution: Adapter Contracts

The storage pattern interposes a contract between business logic and backends:

```elixir
# Decoupled: business logic knows only the contract
def get_user(id) do
  StorageAdapter.fetch(:users, id)
end
```

The `StorageAdapter` is resolved at runtime (or compile time through configuration), and the business logic neither knows nor cares whether data comes from ETS, PostgreSQL, or any other backend.

### When Multiple Backends Are Necessary

Modern platforms rarely use a single storage engine. Different data access patterns require different optimizations:

| Access Pattern | Optimal Backend | Latency | Consistency |
|---------------|----------------|---------|-------------|
| Key-value lookup | ETS | ~1 microsecond | Eventual (per-node) |
| Complex queries with joins | PostgreSQL/Ecto | ~1-50ms | Strong (ACID) |
| Full-text search with facets | Meilisearch | ~10-50ms | Eventual |
| Relationship traversal | KuzuDB | ~1-10ms | Read-committed |
| Time-series analytics | TimescaleDB | ~5-100ms | Strong |

The storage pattern makes polyglot persistence practical by providing a single API that dispatches to the appropriate backend.

## Platform Implementation in Elixir

### Core Adapter Behaviour

```elixir
defmodule Prismatic.StorageCore.Adapter do
  @moduledoc """
  Defines the universal adapter contract that all storage backends
  must implement. This behaviour is the foundation of the platform's
  polyglot persistence architecture.

  Every storage backend (ETS, Ecto, Meilisearch, KuzuDB) implements
  this behaviour, enabling transparent backend switching and composition.
  """

  @type collection :: atom() | String.t()
  @type key :: term()
  @type record :: map()
  @type query :: map() | keyword()
  @type opts :: keyword()

  @type page :: %{
    data: [record()],
    total: non_neg_integer(),
    page: pos_integer(),
    page_size: pos_integer(),
    has_next: boolean()
  }

  @type adapter_info :: %{
    name: atom(),
    version: String.t(),
    capabilities: [capability()],
    backend: atom(),
    status: :connected | :disconnected | :degraded
  }

  @type capability ::
    :crud | :search | :transactions | :pagination |
    :streaming | :graph | :full_text | :aggregation

  # Lifecycle
  @callback init(opts()) :: {:ok, term()} | {:error, term()}
  @callback terminate(term()) :: :ok
  @callback info() :: adapter_info()

  # CRUD Operations
  @callback insert(collection(), record(), opts()) :: {:ok, record()} | {:error, term()}
  @callback fetch(collection(), key(), opts()) :: {:ok, record()} | {:error, :not_found}
  @callback update(collection(), key(), record(), opts()) :: {:ok, record()} | {:error, term()}
  @callback delete(collection(), key(), opts()) :: :ok | {:error, term()}

  # Query Operations
  @callback list(collection(), opts()) :: {:ok, [record()]}
  @callback query(collection(), query(), opts()) :: {:ok, [record()]}
  @callback count(collection(), query(), opts()) :: {:ok, non_neg_integer()}
  @callback paginate(collection(), query(), opts()) :: {:ok, page()}

  # Batch Operations
  @callback insert_all(collection(), [record()], opts()) :: {:ok, non_neg_integer()} | {:error, term()}
  @callback delete_all(collection(), query(), opts()) :: {:ok, non_neg_integer()} | {:error, term()}

  # Optional Capabilities
  @callback transaction((-> term()), opts()) :: {:ok, term()} | {:error, term()}
  @callback stream(collection(), query(), opts()) :: Enumerable.t()

  @optional_callbacks [transaction: 2, stream: 3]
end
```

### ETS Storage Variant

```elixir
defmodule Prismatic.Storage.ETS do
  @moduledoc """
  In-memory storage backend using Erlang Term Storage (ETS).
  Provides microsecond-latency reads and writes with no external
  dependencies. Ideal for caches, registries, and real-time state.

  Limitations: data is node-local and not persisted across restarts
  unless combined with DETS or periodic snapshotting.
  """

  @behaviour Prismatic.StorageCore.Adapter

  use GenServer

  @impl true
  def init(opts) do
    table_opts = Keyword.get(opts, :table_opts, [:set, :public, :named_table, read_concurrency: true])
    tables = Keyword.get(opts, :collections, [])

    created = Enum.map(tables, fn collection ->
      table_name = collection_to_table(collection)
      :ets.new(table_name, table_opts)
      table_name
    end)

    {:ok, %{tables: created, opts: opts}}
  end

  @impl true
  def terminate(state) do
    Enum.each(state.tables, fn table ->
      if :ets.info(table) != :undefined, do: :ets.delete(table)
    end)
    :ok
  end

  @impl true
  def info do
    %{
      name: :ets,
      version: "1.0.0",
      capabilities: [:crud, :pagination, :streaming],
      backend: :erlang_ets,
      status: :connected
    }
  end

  @impl true
  def insert(collection, record, _opts) do
    table = collection_to_table(collection)
    key = Map.get(record, :id) || Map.get(record, "id") || make_ref()
    record_with_key = Map.put(record, :id, key)
    true = :ets.insert(table, {key, record_with_key, System.monotonic_time()})
    {:ok, record_with_key}
  end

  @impl true
  def fetch(collection, key, _opts) do
    table = collection_to_table(collection)
    case :ets.lookup(table, key) do
      [{^key, record, _ts}] -> {:ok, record}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  def update(collection, key, updates, opts) do
    with {:ok, existing} <- fetch(collection, key, opts) do
      updated = Map.merge(existing, updates)
      insert(collection, updated, opts)
    end
  end

  @impl true
  def delete(collection, key, _opts) do
    table = collection_to_table(collection)
    :ets.delete(table, key)
    :ok
  end

  @impl true
  def list(collection, opts) do
    table = collection_to_table(collection)
    limit = Keyword.get(opts, :limit, 1000)

    records =
      :ets.tab2list(table)
      |> Enum.map(fn {_key, record, _ts} -> record end)
      |> Enum.take(limit)

    {:ok, records}
  end

  @impl true
  def query(collection, query_params, opts) do
    with {:ok, all} <- list(collection, opts) do
      filtered = Enum.filter(all, fn record ->
        Enum.all?(query_params, fn {field, value} ->
          Map.get(record, field) == value
        end)
      end)
      {:ok, filtered}
    end
  end

  @impl true
  def count(collection, query_params, opts) do
    with {:ok, results} <- query(collection, query_params, opts) do
      {:ok, length(results)}
    end
  end

  @impl true
  def paginate(collection, query_params, opts) do
    page = Keyword.get(opts, :page, 1)
    page_size = Keyword.get(opts, :page_size, 20)

    with {:ok, all} <- query(collection, query_params, opts) do
      total = length(all)
      offset = (page - 1) * page_size

      data =
        all
        |> Enum.drop(offset)
        |> Enum.take(page_size)

      {:ok, %{
        data: data,
        total: total,
        page: page,
        page_size: page_size,
        has_next: offset + page_size < total
      }}
    end
  end

  @impl true
  def insert_all(collection, records, opts) do
    results = Enum.map(records, &insert(collection, &1, opts))
    errors = Enum.filter(results, &match?({:error, _}, &1))

    if errors == [] do
      {:ok, length(records)}
    else
      {:error, {:partial_insert, length(records) - length(errors), errors}}
    end
  end

  @impl true
  def delete_all(collection, query_params, opts) do
    with {:ok, matching} <- query(collection, query_params, opts) do
      Enum.each(matching, fn record ->
        key = Map.get(record, :id)
        if key, do: delete(collection, key, opts)
      end)
      {:ok, length(matching)}
    end
  end

  @impl true
  def stream(collection, query_params, _opts) do
    table = collection_to_table(collection)

    Stream.resource(
      fn -> :ets.first(table) end,
      fn
        :"$end_of_table" -> {:halt, nil}
        key ->
          case :ets.lookup(table, key) do
            [{^key, record, _ts}] ->
              if matches_query?(record, query_params) do
                {[record], :ets.next(table, key)}
              else
                {[], :ets.next(table, key)}
              end
            [] ->
              {[], :ets.next(table, key)}
          end
      end,
      fn _ -> :ok end
    )
  end

  defp collection_to_table(collection) when is_atom(collection), do: collection
  defp collection_to_table(collection) when is_binary(collection), do: String.to_atom("storage_ets_#{collection}")

  defp matches_query?(record, query_params) do
    Enum.all?(query_params, fn {field, value} ->
      Map.get(record, field) == value
    end)
  end
end
```

### Storage Router (Multi-Backend Dispatch)

```elixir
defmodule Prismatic.Storage.Router do
  @moduledoc """
  Routes storage operations to the appropriate backend based on
  collection configuration, operation type, and runtime context.
  Supports write-through, read-through, and cache-aside patterns.
  """

  @type routing_config :: %{
    collection: atom(),
    primary: module(),
    read_through: module() | nil,
    write_through: [module()],
    cache: module() | nil,
    cache_ttl: pos_integer() | nil
  }

  @spec route(atom(), atom(), list()) :: {:ok, term()} | {:error, term()}
  def route(collection, operation, args) do
    config = get_routing_config(collection)

    case classify_operation(operation) do
      :read -> route_read(config, operation, args)
      :write -> route_write(config, operation, args)
      :query -> route_query(config, operation, args)
    end
  end

  defp route_read(config, operation, args) do
    # Try cache first if available
    with {:cache, module} when not is_nil(module) <- {:cache, config.cache},
         {:ok, result} <- apply(module, operation, args) do
      {:ok, result}
    else
      {:cache, nil} ->
        apply(config.primary, operation, args)
      {:error, :not_found} ->
        # Cache miss: read from primary, populate cache
        with {:ok, result} <- apply(config.primary, operation, args) do
          if config.cache, do: populate_cache(config, result)
          {:ok, result}
        end
    end
  end

  defp route_write(config, operation, args) do
    # Write to primary first
    with {:ok, result} <- apply(config.primary, operation, args) do
      # Write-through to secondary backends
      Enum.each(config.write_through, fn backend ->
        Task.Supervisor.start_child(Prismatic.Storage.TaskSupervisor, fn ->
          apply(backend, operation, args)
        end)
      end)

      # Invalidate cache
      if config.cache, do: invalidate_cache(config, args)

      {:ok, result}
    end
  end

  defp route_query(config, operation, args) do
    # Queries go to the best backend for the operation
    backend = select_query_backend(config, operation)
    apply(backend, operation, args)
  end

  defp classify_operation(op) when op in [:fetch, :list], do: :read
  defp classify_operation(op) when op in [:insert, :update, :delete, :insert_all, :delete_all], do: :write
  defp classify_operation(_), do: :query

  defp get_routing_config(collection) do
    Application.get_env(:prismatic_storage, :routing, %{})
    |> Map.get(collection, default_routing_config(collection))
  end

  defp default_routing_config(collection) do
    %{
      collection: collection,
      primary: Prismatic.Storage.ETS,
      read_through: nil,
      write_through: [],
      cache: nil,
      cache_ttl: nil
    }
  end

  defp select_query_backend(config, _operation), do: config.primary
  defp populate_cache(_config, _result), do: :ok
  defp invalidate_cache(_config, _args), do: :ok
end
```

## Storage Pattern Topology

The Prismatic Platform's storage architecture follows a layered topology:

```
Application Layer (Business Logic)
         |
    Storage Contract (Adapter Behaviour)
         |
    +----+----+----+----+
    |    |    |    |    |
   ETS  Ecto  Meili KuzuDB  (Backend Adapters)
    |    |    |    |
   RAM  PG   HTTP  Files    (Physical Storage)
```

Each layer has a clear responsibility:
- **Application layer**: Expresses domain intent ("find users matching criteria")
- **Contract layer**: Translates intent to operations (fetch, query, paginate)
- **Adapter layer**: Maps operations to backend-specific APIs
- **Physical layer**: Executes operations against actual storage engines

## Operational Patterns

### Write-Through

Data written to the primary backend is synchronously replicated to secondary backends. This ensures consistency across backends at the cost of write latency.

### Cache-Aside

The application checks the cache (ETS) before querying the primary backend (Ecto/PostgreSQL). On cache miss, the primary result populates the cache. This optimizes read-heavy workloads.

### Event-Driven Synchronization

Write operations emit events that asynchronous consumers use to update secondary backends. This decouples write latency from replication, accepting eventual consistency.

### CQRS (Command Query Responsibility Segregation)

Write operations go to one backend (optimized for consistency), while read operations go to another (optimized for query performance). The platform uses Ecto for writes and Meilisearch for read-heavy search operations.

## Testing Storage Patterns

The platform provides a reusable contract test module:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Contract test suite that verifies any storage adapter
  implements the full Adapter behaviour correctly.
  Use: `use PrismaticStorage.AdapterContractTest, adapter_module: MyAdapter`
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)
      @test_collection :contract_test

      setup do
        {:ok, _} = @adapter.init(collections: [@test_collection])
        on_exit(fn -> @adapter.terminate(%{}) end)
        :ok
      end

      test "insert and fetch roundtrip" do
        record = %{id: "test-1", name: "Test", value: 42}
        assert {:ok, inserted} = @adapter.insert(@test_collection, record, [])
        assert {:ok, fetched} = @adapter.fetch(@test_collection, "test-1", [])
        assert fetched.name == "Test"
        assert fetched.value == 42
      end

      test "fetch returns not_found for missing key" do
        assert {:error, :not_found} = @adapter.fetch(@test_collection, "nonexistent", [])
      end

      test "update modifies existing record" do
        record = %{id: "test-2", name: "Original", value: 1}
        {:ok, _} = @adapter.insert(@test_collection, record, [])
        {:ok, updated} = @adapter.update(@test_collection, "test-2", %{value: 2}, [])
        assert updated.value == 2
        assert updated.name == "Original"
      end

      test "delete removes record" do
        record = %{id: "test-3", name: "ToDelete", value: 0}
        {:ok, _} = @adapter.insert(@test_collection, record, [])
        assert :ok = @adapter.delete(@test_collection, "test-3", [])
        assert {:error, :not_found} = @adapter.fetch(@test_collection, "test-3", [])
      end

      test "count returns correct number" do
        {:ok, _} = @adapter.insert(@test_collection, %{id: "c1", type: "a"}, [])
        {:ok, _} = @adapter.insert(@test_collection, %{id: "c2", type: "b"}, [])
        {:ok, _} = @adapter.insert(@test_collection, %{id: "c3", type: "a"}, [])
        assert {:ok, 2} = @adapter.count(@test_collection, %{type: "a"}, [])
      end
    end
  end
end
```

## Performance Characteristics

| Backend | Read Latency | Write Latency | Query Capability | Persistence |
|---------|-------------|---------------|-----------------|-------------|
| **ETS** | ~1 us | ~1 us | Key lookup, simple filters | None (RAM) |
| **Ecto/PG** | ~1-50 ms | ~5-50 ms | Full SQL, joins, aggregates | Durable (ACID) |
| **Meilisearch** | ~10-50 ms | ~50-200 ms | Full-text, facets, typo-tolerant | Durable |
| **KuzuDB** | ~1-10 ms | ~5-20 ms | Graph traversal, path queries | Durable (file) |

The storage router selects backends to minimize latency for each operation while respecting consistency requirements.

## Migration and Evolution

The storage pattern enables non-disruptive backend migration. To migrate from one backend to another:

1. Add the new backend as a write-through target
2. Backfill existing data to the new backend
3. Switch reads to the new backend
4. Remove the old backend from write-through
5. Decommission the old backend

Each step is independently verifiable and reversible, eliminating big-bang migration risk.

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Leaking backend details** | Business logic uses Ecto queries directly | Always go through adapter contract |
| **Ignoring consistency requirements** | Using eventual consistency for ACID needs | Match backend to consistency requirement |
| **Over-caching** | Caching everything in ETS | Cache only hot-path data with TTL |
| **Single backend for all patterns** | Using PostgreSQL for search | Use Meilisearch for full-text search |
| **No contract tests** | Assuming backends behave identically | Run contract tests against all backends |

## Advanced Implementation Patterns

The storage pattern supports several advanced implementation patterns for complex data scenarios:

### Multi-Backend Composition

```elixir
defmodule PrismaticAgents.CompositeStorage do
  @moduledoc """
  Composite storage pattern using multiple backends simultaneously.
  """

  @spec store_agent_with_search(map()) :: {:ok, String.t()} | {:error, term()}
  def store_agent_with_search(agent_data) do
    # Store in primary backend (PostgreSQL) for consistency
    with {:ok, agent_id} <- Ecto.insert(agent_data),
         # Index in search backend (Meilisearch) for discoverability
         {:ok, _} <- Meilisearch.insert([prepare_for_search(agent_data)]),
         # Cache in fast backend (ETS) for performance
         :ok <- ETS.put(:agents, agent_id, agent_data) do
      {:ok, agent_id}
    else
      error -> rollback_composite_operation(agent_data, error)
    end
  end
end
```

## Related Concepts

- [Adapter Pattern](/glossary/adapter-pattern/) -- The structural pattern underlying storage adapters
- [Polyglot Persistence](/glossary/polyglot-persistence/) -- Using multiple storage engines strategically
- [ACID Transactions](/glossary/acid-transactions/) -- Consistency guarantees for relational backends
- [Caching](/glossary/caching/) -- In-memory storage for performance optimization
- [Key-Value Store](/glossary/key-value-store/) -- Simple storage pattern used by ETS backend
- [Schema](/glossary/schema/) -- Data structure definitions for storage
- [Specialized Variants](/glossary/specialized-variants/) -- Storage backends as domain-specific variants
- [PostgreSQL](/glossary/postgresql/) -- Primary relational storage backend

See the Glossary index for the complete taxonomy of platform concepts.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
