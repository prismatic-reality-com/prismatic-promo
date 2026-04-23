+++
title = "Adapter Pattern"
weight = 45
[extra]
category = "storage"
description = "Unified storage interface abstracting 7 backend technologies through Elixir behaviours and compile-time contract enforcement"
related_terms = ["behaviour", "protocol", "ets", "kuzudb", "meilisearch", "duckdb", "ecto", "connection-pooling", "openapi-spec", "umbrella-application", "plug", "typespec"]
tags = ["glossary", "architecture", "design-patterns", "storage", "abstraction", "contracts"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP", "Phoenix LiveView"]
key_takeaway = "The adapter pattern via Elixir behaviours enables the Prismatic Platform to abstract 7 storage backends behind a unified interface with compile-time contract enforcement and runtime backend selection"
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_concepts = ["structural design pattern", "interface abstraction", "backend composition", "contract testing", "dependency inversion"]
see_also = ["behaviour", "protocol", "ets", "ecto", "kuzudb", "meilisearch"]
word_count = 1126
date_modified = "2026-02-23"
keywords = ["Adapter", "Pattern", "Unified", "Elixir", "glossary", "storage", "Prismatic Platform", "PostgreSQL", "Milliseconds"]
image = "/images/sections/glossary.png"
image_alt = "Adapter Pattern - Prismatic Platform"
+++

## Definition

The Adapter Pattern is a structural design pattern that defines a uniform interface through which client code interacts with diverse backend implementations. By establishing a contract (the adapter interface) and implementing it for each backend, the pattern decouples application logic from infrastructure concerns: business code depends only on the abstract interface, never on a specific technology. Adapters can be swapped, composed, or layered without modifying the code that consumes them.

In the classical Gang of Four formulation, the adapter pattern translates one interface into another that a client expects. In the Prismatic Platform's usage, the pattern goes further: it defines a canonical storage interface via Elixir [behaviours](@/glossary/behaviour.md) and implements it across seven distinct storage technologies, each optimized for different access patterns. This is not merely interface translation but a full abstraction layer that enables transparent multi-backend operations, layered caching, and contract-driven testing across all storage implementations.

The pattern's power in the Prismatic context stems from Elixir's compile-time behaviour verification. When a storage adapter claims to implement the `PrismaticStorage.Core` behaviour, Dialyzer verifies at compile time that all required callbacks are implemented with correct type signatures. This provides the same guarantees as interface implementation in statically typed languages while preserving Elixir's dynamic dispatch flexibility and pattern matching capabilities.

## Storage Architecture Overview

The Prismatic Platform's storage layer is organized as a set of umbrella applications, each implementing the core storage behaviour for a specific backend technology.

| Application | Backend | Optimized For | Latency | Use Case |
|-------------|---------|---------------|---------|----------|
| `prismatic_storage_ets` | [ETS](@/glossary/ets.md) | Key-value, concurrent reads | Microseconds | Hot cache, working memory |
| `prismatic_storage_ecto` | [PostgreSQL](@/glossary/postgresql.md) via Ecto | Relational queries, transactions | Milliseconds | Persistent storage, ACID |
| `prismatic_storage_meilisearch` | Meilisearch | Full-text search | Milliseconds | Content discovery, search |
| `prismatic_storage_kuzudb` | KuzuDB | Graph traversal, path queries | Milliseconds | Relationship graphs, ontology |
| `prismatic_storage_duckdb` | DuckDB | Analytical OLAP, columnar | Milliseconds | Analytics, aggregation |
| `prismatic_storage_redis` | [Redis](@/glossary/redis.md) | Pub/sub, distributed cache | Sub-millisecond | Cross-node state, caching |
| `prismatic_storage_file` | File system | Document storage | Milliseconds | Reports, exports, artifacts |

Each adapter lives in its own umbrella application with independent dependencies, tests, and configuration. This isolation means that adding a new storage backend requires no changes to existing adapters or to application code that uses the abstract interface.

## Behaviour-Based Contracts

The adapter pattern in Prismatic is built on Elixir [behaviours](@/glossary/behaviour.md), which provide compile-time contract enforcement through `@callback` declarations.

### Core Behaviour Definition

```elixir
defmodule PrismaticStorage.Core do
  @moduledoc """
  Core storage behaviour defining the contract all adapters must implement.
  """

  @type key :: binary() | atom()
  @type value :: term()
  @type opts :: keyword()
  @type error :: {:error, term()}

  @callback get(key(), opts()) :: {:ok, value()} | {:ok, nil} | error()
  @callback put(key(), value(), opts()) :: {:ok, value()} | error()
  @callback delete(key(), opts()) :: :ok | error()
  @callback list(opts()) :: {:ok, [value()]} | error()
  @callback exists?(key(), opts()) :: {:ok, boolean()} | error()
  @callback count(opts()) :: {:ok, non_neg_integer()} | error()

  @callback query(map(), opts()) :: {:ok, [value()]} | error()
  @callback bulk_put([{key(), value()}], opts()) :: {:ok, non_neg_integer()} | error()
  @callback bulk_delete([key()], opts()) :: {:ok, non_neg_integer()} | error()

  @optional_callbacks [query: 2, bulk_put: 2, bulk_delete: 2]
end
```

### Adapter Implementation

Each adapter implements the core behaviour, translating the abstract operations into backend-specific calls.

```elixir
defmodule PrismaticStorage.ETS do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    table = Keyword.fetch!(opts, :table)
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:ok, nil}
    end
  end

  @impl true
  def put(key, value, opts) do
    table = Keyword.fetch!(opts, :table)
    true = :ets.insert(table, {key, value})
    {:ok, value}
  end

  @impl true
  def delete(key, opts) do
    table = Keyword.fetch!(opts, :table)
    true = :ets.delete(table, key)
    :ok
  end

  @impl true
  def list(opts) do
    table = Keyword.fetch!(opts, :table)
    values = :ets.tab2list(table) |> Enum.map(&elem(&1, 1))
    {:ok, values}
  end

  @impl true
  def exists?(key, opts) do
    table = Keyword.fetch!(opts, :table)
    {:ok, :ets.member(table, key)}
  end

  @impl true
  def count(opts) do
    table = Keyword.fetch!(opts, :table)
    {:ok, :ets.info(table, :size)}
  end
end
```

```elixir
defmodule PrismaticStorage.Ecto do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    repo = Keyword.fetch!(opts, :repo)
    schema = Keyword.fetch!(opts, :schema)
    case repo.get(schema, key) do
      nil -> {:ok, nil}
      record -> {:ok, record}
    end
  end

  @impl true
  def put(key, value, opts) do
    repo = Keyword.fetch!(opts, :repo)
    schema = Keyword.fetch!(opts, :schema)
    changeset = schema.changeset(struct(schema), Map.put(value, :id, key))
    case repo.insert_or_update(changeset) do
      {:ok, record} -> {:ok, record}
      {:error, changeset} -> {:error, changeset}
    end
  end

  @impl true
  def query(filters, opts) do
    repo = Keyword.fetch!(opts, :repo)
    schema = Keyword.fetch!(opts, :schema)
    results = build_query(schema, filters) |> repo.all()
    {:ok, results}
  end

  # ... remaining callbacks
end
```

## Contract Testing

The adapter contract test suite ensures that every adapter implementation satisfies the full interface specification, not just the type signatures checked by Dialyzer.

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Reusable test harness that validates any adapter against the
  full PrismaticStorage.Core interface specification.

  Usage:
    use PrismaticStorage.AdapterContractTest,
      adapter_module: PrismaticStorage.ETS
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      describe "#{inspect(@adapter)} contract compliance" do
        test "get returns {:ok, nil} for missing keys" do
          assert {:ok, nil} = @adapter.get("nonexistent", test_opts())
        end

        test "put followed by get returns the stored value" do
          assert {:ok, value} = @adapter.put("key1", %{data: "test"}, test_opts())
          assert {:ok, ^value} = @adapter.get("key1", test_opts())
        end

        test "delete removes a stored value" do
          {:ok, _} = @adapter.put("key2", %{data: "test"}, test_opts())
          assert :ok = @adapter.delete("key2", test_opts())
          assert {:ok, nil} = @adapter.get("key2", test_opts())
        end

        test "exists? returns true for stored keys" do
          {:ok, _} = @adapter.put("key3", %{data: "test"}, test_opts())
          assert {:ok, true} = @adapter.exists?("key3", test_opts())
          assert {:ok, false} = @adapter.exists?("missing", test_opts())
        end

        test "count returns the number of stored entries" do
          assert {:ok, initial} = @adapter.count(test_opts())
          {:ok, _} = @adapter.put("cnt1", %{}, test_opts())
          {:ok, _} = @adapter.put("cnt2", %{}, test_opts())
          assert {:ok, count} = @adapter.count(test_opts())
          assert count == initial + 2
        end

        test "list returns all stored values" do
          {:ok, _} = @adapter.put("lst1", %{a: 1}, test_opts())
          {:ok, _} = @adapter.put("lst2", %{a: 2}, test_opts())
          assert {:ok, values} = @adapter.list(test_opts())
          assert length(values) >= 2
        end
      end
    end
  end
end
```

This contract test is used by every adapter:

```elixir
# In prismatic_storage_ets/test/
use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.ETS

# In prismatic_storage_ecto/test/
use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.Ecto

# In prismatic_storage_meilisearch/test/
use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.Meilisearch
```

## Runtime Adapter Selection

The platform supports runtime adapter selection, enabling configuration-driven backend switching without code changes.

```elixir
defmodule PrismaticStorage do
  @moduledoc "Unified storage facade with runtime adapter resolution."

  def get(key, opts \\ []) do
    adapter = resolve_adapter(opts)
    adapter.get(key, opts)
  end

  def put(key, value, opts \\ []) do
    adapter = resolve_adapter(opts)
    adapter.put(key, value, opts)
  end

  defp resolve_adapter(opts) do
    Keyword.get_lazy(opts, :adapter, fn ->
      Application.get_env(:prismatic_storage, :default_adapter, PrismaticStorage.ETS)
    end)
  end
end
```

Configuration-driven adapter selection:

```elixir
# config/dev.exs
config :prismatic_storage, default_adapter: PrismaticStorage.ETS

# config/prod.exs
config :prismatic_storage, default_adapter: PrismaticStorage.Ecto

# config/test.exs
config :prismatic_storage, default_adapter: PrismaticStorage.ETS
```

## Backend Composition and Layering

One of the adapter pattern's most powerful capabilities in Prismatic is transparent backend composition: adapters can be layered to combine the strengths of multiple backends.

### Write-Through Cache

```elixir
defmodule PrismaticStorage.CacheThrough do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    cache = Keyword.fetch!(opts, :cache_adapter)
    primary = Keyword.fetch!(opts, :primary_adapter)

    case cache.get(key, opts) do
      {:ok, nil} ->
        # Cache miss: read from primary, populate cache
        case primary.get(key, opts) do
          {:ok, value} when not is_nil(value) ->
            cache.put(key, value, opts)
            {:ok, value}
          result ->
            result
        end

      {:ok, value} ->
        {:ok, value}  # Cache hit
    end
  end

  @impl true
  def put(key, value, opts) do
    cache = Keyword.fetch!(opts, :cache_adapter)
    primary = Keyword.fetch!(opts, :primary_adapter)

    # Write to both: primary first, then cache
    with {:ok, value} <- primary.put(key, value, opts),
         {:ok, _} <- cache.put(key, value, opts) do
      {:ok, value}
    end
  end
end
```

### Multi-Backend Query

```elixir
# Query across graph + relational backends
defmodule PrismaticStorage.MultiQuery do
  def find_related_assets(domain) do
    # Graph query for relationships
    {:ok, related} = PrismaticStorage.KuzuDB.query(
      %{type: :related_assets, domain: domain},
      adapter: PrismaticStorage.KuzuDB
    )

    # Relational query for details
    ids = Enum.map(related, & &1.id)
    {:ok, details} = PrismaticStorage.Ecto.query(
      %{ids: ids, include: [:vulnerabilities, :compliance]},
      adapter: PrismaticStorage.Ecto
    )

    # Full-text search for contextual matches
    {:ok, contextual} = PrismaticStorage.Meilisearch.query(
      %{search: domain, facets: ["asset_type", "risk_level"]},
      adapter: PrismaticStorage.Meilisearch
    )

    {:ok, merge_results(related, details, contextual)}
  end
end
```

## Telemetry and Observability

The adapter pattern provides a natural instrumentation point. Because all storage operations flow through the adapter interface, telemetry can be attached at the contract level, providing uniform observability across all backends without modifying individual adapter implementations.

```elixir
defmodule PrismaticStorage.InstrumentedAdapter do
  @moduledoc """
  Wraps any storage adapter with telemetry instrumentation.
  Measures latency, tracks error rates, and emits storage events
  for all operations without modifying the underlying adapter.
  """

  @behaviour PrismaticStorage.Core

  @spec new(module(), keyword()) :: map()
  def new(adapter, opts \\ []) do
    %{adapter: adapter, opts: opts}
  end

  @impl true
  def get(key, opts) do
    adapter = Keyword.fetch!(opts, :instrumented_adapter)
    metadata = %{adapter: adapter, operation: :get, key: key}

    :telemetry.span(
      [:prismatic, :storage, :get],
      metadata,
      fn ->
        result = adapter.get(key, opts)
        {result, Map.put(metadata, :result, elem(result, 0))}
      end
    )
  end

  @impl true
  def put(key, value, opts) do
    adapter = Keyword.fetch!(opts, :instrumented_adapter)
    metadata = %{adapter: adapter, operation: :put, key: key}

    :telemetry.span(
      [:prismatic, :storage, :put],
      metadata,
      fn ->
        result = adapter.put(key, value, opts)
        {result, Map.put(metadata, :result, elem(result, 0))}
      end
    )
  end

  @impl true
  def delete(key, opts) do
    adapter = Keyword.fetch!(opts, :instrumented_adapter)

    :telemetry.span(
      [:prismatic, :storage, :delete],
      %{adapter: adapter, operation: :delete, key: key},
      fn ->
        result = adapter.delete(key, opts)
        {result, %{}}
      end
    )
  end
end
```

This instrumented adapter enables dashboards that show per-backend latency distributions, error rates, and throughput metrics -- all derived from the uniform adapter interface without any backend-specific instrumentation code.

## Error Handling Strategy

The adapter pattern enforces a consistent error handling strategy across all backends. Every adapter must translate backend-specific errors into the platform's standard `{:ok, value} | {:error, reason}` tuple format. This normalization ensures that application code never needs to handle PostgreSQL-specific exceptions, ETS-specific error atoms, or Meilisearch HTTP error codes directly.

```elixir
defmodule PrismaticStorage.ErrorNormalizer do
  @moduledoc """
  Normalizes backend-specific errors into the platform's
  standard error tuple format for consistent error handling.
  """

  @type storage_error ::
    {:error, :not_found}
    | {:error, :connection_failed}
    | {:error, :timeout}
    | {:error, :conflict}
    | {:error, {:validation, list(String.t())}}

  @spec normalize(term(), atom()) :: storage_error()
  def normalize(%Postgrex.Error{postgres: %{code: :unique_violation}}, :ecto) do
    {:error, :conflict}
  end

  def normalize(%DBConnection.ConnectionError{}, :ecto) do
    {:error, :connection_failed}
  end

  def normalize(:timeout, _backend) do
    {:error, :timeout}
  end

  def normalize({:error, reason}, _backend) do
    {:error, reason}
  end
end
```

This approach means that when application code receives `{:error, :connection_failed}`, it can implement retry logic without knowing whether the underlying backend is PostgreSQL, Redis, or Meilisearch. The error normalization is part of the adapter contract, not an afterthought.

## Comparison with Alternative Abstraction Patterns

| Pattern | Dispatch Mechanism | Best For | Prismatic Usage |
|---------|-------------------|----------|-----------------|
| **Adapter (Behaviour)** | Module-level callbacks | Backend abstraction | Storage adapters |
| **Protocol** | Data type dispatch | Polymorphic data operations | Encoding, formatting |
| [Plug](@/glossary/plug.md) | Request pipeline | HTTP middleware | Request processing |
| **Strategy** | Runtime function selection | Algorithm selection | Scoring algorithms |
| **Repository** | Domain-specific interface | Data access objects | Ecto Repos |

The adapter pattern via behaviours was chosen for storage because the dispatch decision is based on the backend type (a module), not on the data type (which would favor protocols). A single data structure (e.g., a security asset record) may be stored in any backend, so module-based dispatch is the natural choice.

## Adding a New Adapter

The adapter pattern makes adding a new storage backend a well-defined, low-risk operation.

| Step | Action | Verification |
|------|--------|-------------|
| 1 | Create umbrella app `prismatic_storage_new` | `mix new apps/prismatic_storage_new` |
| 2 | Add `@behaviour PrismaticStorage.Core` | Dialyzer checks callback completeness |
| 3 | Implement all `@callback` functions | Compiler warns on missing callbacks |
| 4 | Add `use PrismaticStorage.AdapterContractTest` | Contract tests validate behavior |
| 5 | Configure in `config/*.exs` | Runtime adapter selection works |
| 6 | Add [connection pooling](@/glossary/connection-pooling.md) if needed | Pool supervised in app tree |
| 7 | Document in adapter registry | Discoverable by other components |

No existing adapters or application code need to be modified. The contract test suite guarantees that the new adapter satisfies the same behavioral contract as all existing adapters.

## Performance Characteristics

| Adapter | Read Latency | Write Latency | Query Capability | Scalability |
|---------|-------------|---------------|-----------------|-------------|
| ETS | < 1 microsecond | < 1 microsecond | Key-value only | Single node |
| Ecto/PostgreSQL | 1-10 ms | 1-10 ms | Full SQL, joins | Multi-node (replication) |
| Meilisearch | 5-50 ms | 10-100 ms | Full-text search, facets | Horizontal |
| KuzuDB | 1-50 ms | 5-50 ms | Graph traversal, Cypher | Single node |
| DuckDB | 10-100 ms | 10-50 ms | Analytical SQL, columnar | Single node |
| Redis | < 1 ms | < 1 ms | Key-value, sorted sets | Cluster |

The performance characteristics inform backend selection. The platform's multi-backend architecture enables choosing the optimal backend for each access pattern: ETS for hot-path reads, PostgreSQL for transactional writes, Meilisearch for search, and KuzuDB for relationship traversal.

## Migration Between Backends

The adapter pattern simplifies backend migration because application code depends only on the abstract interface. A migration from one backend to another involves three steps: implementing the new adapter, verifying it passes the contract test suite, and updating the configuration. Application code remains untouched.

For data migration between backends, the uniform interface enables a generic migration tool:

```elixir
defmodule PrismaticStorage.Migrator do
  @moduledoc """
  Migrates data between storage backends using the uniform adapter interface.
  Works with any pair of adapters that implement PrismaticStorage.Core.
  """

  @spec migrate(module(), module(), keyword()) :: {:ok, non_neg_integer()} | {:error, term()}
  def migrate(source_adapter, target_adapter, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 1000)

    with {:ok, items} <- source_adapter.list(opts) do
      items
      |> Enum.chunk_every(batch_size)
      |> Enum.reduce({:ok, 0}, fn batch, {:ok, count} ->
        pairs = Enum.map(batch, fn {key, value} -> {key, value} end)
        case target_adapter.bulk_put(pairs, opts) do
          {:ok, n} -> {:ok, count + n}
          error -> error
        end
      end)
    end
  end
end
```

This migration tool works for any pair of adapters without knowledge of either backend's internals, demonstrating the full power of the adapter abstraction.

## Related Terms

- [Behaviour](@/glossary/behaviour.md) - Contract mechanism enforcing adapter compliance at compile time
- [Typespec](@/glossary/typespec.md) - Type annotations used in `@callback` definitions for adapter contracts
- [ETS](@/glossary/ets.md) - In-memory storage adapter for high-speed caching and working memory
- [Ecto](@/glossary/ecto.md) - Database wrapper and query builder used by the PostgreSQL adapter
- [KuzuDB](@/glossary/kuzudb.md) - Graph database adapter for relationship queries and ontology
- [Connection Pooling](@/glossary/connection-pooling.md) - Resource management for database adapters requiring persistent connections
- [Plug](@/glossary/plug.md) - Composable request processing pattern, conceptually similar to adapter composition
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis tool verifying adapter contract compliance
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing methodology complementing contract tests
- [Redis](@/glossary/redis.md) - Distributed cache adapter for cross-node state management
- [PostgreSQL](@/glossary/postgresql.md) - Primary relational database backend
- [Prismatic Storage](@/glossary/prismatic-storage.md) - The unified storage layer built on the adapter pattern

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview and storage layer design
- [Technologies](@/technologies/_index.md) - Technology stack details for all storage backends
- [Apps](@/apps/_index.md) - Umbrella applications implementing storage adapters

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
