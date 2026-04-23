+++
title = "Prismatic Storage"
weight = 48
[extra]
category = "storage"
description = "Pluggable storage layer with adapter pattern for multiple backends"
related_terms = ["ets", "ecto", "postgresql", "meilisearch", "kuzudb", "redis"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1433
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Pluggable", "glossary", "Prismatic Platform", "PostgreSQL", "Ecto", "README"]
tags = ["glossary", "storage", "prismatic-storage", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Prismatic Storage - Prismatic Platform"
+++

## Definition and Overview

Prismatic Storage is the platform's pluggable storage abstraction layer, consisting of a core traits/protocols/behaviours package (`prismatic_storage_core`) and multiple backend adapters that implement the storage contract for different persistence technologies. The architecture uses the adapter pattern -- a core behaviour defining the storage interface, with separate implementations for each backend -- to provide a unified API across ETS (in-memory), Ecto/PostgreSQL (relational), Meilisearch (full-text and vector search), KuzuDB (graph), and Redis (caching). Each adapter implements the same behaviour contract, enabling backend swapping without modifying business logic. The contract test macro (`use PrismaticStorage.AdapterContractTest`) generates standardized test suites ensuring all adapters satisfy identical behavioral guarantees.

This architecture embodies a fundamental principle of the Prismatic Platform: storage decisions should be deferred until deployment time, not embedded in business logic. An application that needs to store agent state should declare that it requires a key-value store implementing the `PrismaticStorage.KeyValue` behaviour, not that it requires PostgreSQL specifically. In development, ETS provides fast in-memory storage without infrastructure dependencies. In production, PostgreSQL provides durability and ACID transactions. In edge deployments, Redis provides distributed caching. The application code remains identical across all environments; only the configured adapter changes.

The contract testing approach ensures behavioral equivalence across adapters. When a new adapter is created (e.g., `prismatic_storage_kuzudb` for graph queries), the developer implements the behaviour callbacks and invokes the contract test macro. The macro generates dozens of test cases that verify CRUD operations, error handling, concurrent access patterns, and edge cases. If the adapter passes all contract tests, it is guaranteed to be a drop-in replacement for any other adapter implementing the same behaviour. This eliminates the common problem of adapter implementations that work differently in subtle ways, causing bugs that only appear when switching backends.

The storage layer spans multiple umbrella applications, reflecting the separation of concerns between interface definition and implementation. `prismatic_storage_core` contains only the behaviour definitions, protocol declarations, and contract test macros -- it has no dependencies on any specific database or storage technology. Each adapter application (`prismatic_storage_ets`, `prismatic_storage_ecto`, `prismatic_storage_meilisearch`, `prismatic_storage_kuzudb`) depends only on `prismatic_storage_core` and its specific backend library. This dependency structure ensures that applications requiring only ETS do not pull in PostgreSQL drivers, and applications requiring only graph queries do not depend on full-text search libraries.

## Technical Deep Dive

### Behaviour Definitions

The storage core defines multiple behaviours for different access patterns:

```elixir
defmodule PrismaticStorage.KeyValue do
  @moduledoc """
  Behaviour for key-value storage operations.
  All adapters must implement these callbacks identically.
  """

  @type key :: term()
  @type value :: term()
  @type opts :: keyword()

  @callback get(key()) :: {:ok, value()} | {:error, :not_found}
  @callback put(key(), value()) :: :ok | {:error, term()}
  @callback delete(key()) :: :ok | {:error, term()}
  @callback exists?(key()) :: boolean()
  @callback list(opts()) :: {:ok, list({key(), value()})}
  @callback count() :: {:ok, non_neg_integer()}
  @callback clear() :: :ok
end

defmodule PrismaticStorage.Searchable do
  @moduledoc """
  Behaviour for searchable storage with full-text and vector capabilities.
  """

  @callback search(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  @callback index(String.t(), map()) :: :ok | {:error, term()}
  @callback delete_index(String.t()) :: :ok | {:error, term()}
  @callback vector_search(String.t(), list(float()), keyword()) :: {:ok, list(map())} | {:error, term()}
end

defmodule PrismaticStorage.Graph do
  @moduledoc """
  Behaviour for graph storage with relationship traversal capabilities.
  """

  @callback create_node(String.t(), map()) :: {:ok, map()} | {:error, term()}
  @callback create_edge(String.t(), String.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  @callback query(String.t()) :: {:ok, list(map())} | {:error, term()}
  @callback neighbors(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  @callback shortest_path(String.t(), String.t()) :: {:ok, list(map())} | {:error, :no_path}
end
```

### Contract Test Macro

The contract test macro generates standardized tests for any adapter:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Contract test macro that generates behavioral equivalence tests
  for storage adapter implementations.

  ## Usage

      defmodule MyAdapter.ContractTest do
        use PrismaticStorage.AdapterContractTest,
          adapter_module: MyAdapter,
          setup: fn -> MyAdapter.start_link([]) end
      end
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)
    setup_fn = Keyword.get(opts, :setup, nil)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      if unquote(setup_fn) do
        setup do
          unquote(setup_fn).()
          :ok
        end
      end

      describe "#{inspect(@adapter)} KeyValue contract" do
        test "put and get round-trip" do
          assert :ok = @adapter.put(:test_key, "test_value")
          assert {:ok, "test_value"} = @adapter.get(:test_key)
        end

        test "get returns error for missing key" do
          assert {:error, :not_found} = @adapter.get(:nonexistent_key)
        end

        test "delete removes existing key" do
          :ok = @adapter.put(:delete_key, "value")
          assert :ok = @adapter.delete(:delete_key)
          assert {:error, :not_found} = @adapter.get(:delete_key)
        end

        test "exists? returns true for existing key" do
          :ok = @adapter.put(:exists_key, "value")
          assert @adapter.exists?(:exists_key)
        end

        test "exists? returns false for missing key" do
          refute @adapter.exists?(:missing_key)
        end

        test "put overwrites existing value" do
          :ok = @adapter.put(:overwrite_key, "original")
          :ok = @adapter.put(:overwrite_key, "updated")
          assert {:ok, "updated"} = @adapter.get(:overwrite_key)
        end

        test "count reflects stored entries" do
          :ok = @adapter.clear()
          assert {:ok, 0} = @adapter.count()
          :ok = @adapter.put(:count_key_1, "v1")
          :ok = @adapter.put(:count_key_2, "v2")
          assert {:ok, 2} = @adapter.count()
        end

        test "list returns all entries" do
          :ok = @adapter.clear()
          :ok = @adapter.put(:list_a, "alpha")
          :ok = @adapter.put(:list_b, "beta")
          {:ok, entries} = @adapter.list([])
          assert length(entries) == 2
        end

        test "clear removes all entries" do
          :ok = @adapter.put(:clear_key, "value")
          :ok = @adapter.clear()
          assert {:ok, 0} = @adapter.count()
        end
      end
    end
  end
end
```

### Adapter Implementations

Each adapter implements the storage behaviours for its specific backend:

```elixir
defmodule PrismaticStorage.ETS do
  @moduledoc """
  ETS-backed storage adapter for high-speed in-memory key-value operations.
  Optimal for development, testing, and caching use cases.
  """
  @behaviour PrismaticStorage.KeyValue

  use GenServer

  @table :prismatic_storage_ets

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl PrismaticStorage.KeyValue
  def get(key) do
    case :ets.lookup(@table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl PrismaticStorage.KeyValue
  def put(key, value) do
    :ets.insert(@table, {key, value})
    :ok
  end

  @impl PrismaticStorage.KeyValue
  def delete(key) do
    :ets.delete(@table, key)
    :ok
  end

  @impl PrismaticStorage.KeyValue
  def exists?(key) do
    :ets.member(@table, key)
  end

  @impl PrismaticStorage.KeyValue
  def list(_opts) do
    entries = :ets.tab2list(@table)
    {:ok, entries}
  end

  @impl PrismaticStorage.KeyValue
  def count do
    {:ok, :ets.info(@table, :size)}
  end

  @impl PrismaticStorage.KeyValue
  def clear do
    :ets.delete_all_objects(@table)
    :ok
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{table: table}}
  end
end
```

### Backend Comparison

| Backend | Adapter | Persistence | Concurrency | Memory Usage | Performance | Best For | Limitations |
|---------|---------|-------------|-------------|--------------|-------------|----------|-------------|
| **ETS** | `prismatic_storage_ets` | In-memory (process lifetime) | Read-concurrent, write-serialized | O(n) data size | Microsecond access | Caching, development, testing | Lost on process restart |
| **Ecto/PostgreSQL** | `prismatic_storage_ecto` | Durable (disk) | ACID transactions | Fixed overhead + connection pools | Millisecond queries | Production persistence, complex queries | Connection pool limits |
| **Meilisearch** | `prismatic_storage_meilisearch` | Durable (disk) | Read-optimized | Index size + documents | Sub-millisecond search | Full-text search, vector similarity | Write latency during indexing |
| **KuzuDB** | `prismatic_storage_kuzudb` | Durable (disk) | Read-optimized | Graph size + query cache | Graph traversal optimized | Graph traversal, relationship queries | Memory-intensive for large graphs |
| **Redis** | `prismatic_storage_redis` | Configurable (memory/disk) | Single-threaded command processing | In-memory + persistence overhead | Microsecond commands | Distributed caching, pub/sub | Single-threaded bottleneck |
| **DuckDB** | `prismatic_storage_duckdb` | File-based | Multi-threaded analytical | Columnar compression | Optimized for aggregation | OLAP, analytics, reporting | Not optimized for OLTP |

### Performance Characteristics

Each adapter is optimized for different access patterns and workloads:

```elixir
defmodule PrismaticStorage.Benchmarks do
  @moduledoc """
  Performance benchmarking suite for storage adapters.
  Measures latency, throughput, and memory usage patterns.
  """

  def benchmark_read_latency(adapter, key_count \\ 10_000) do
    # Populate test data
    keys = Enum.map(1..key_count, fn i -> "key_#{i}" end)
    Enum.each(keys, fn key -> adapter.put(key, "value_#{key}") end)

    # Benchmark read operations
    {time_microseconds, _results} = :timer.tc(fn ->
      Enum.map(keys, fn key -> adapter.get(key) end)
    end)

    %{
      adapter: adapter,
      operations: key_count,
      total_time_us: time_microseconds,
      latency_per_op_us: time_microseconds / key_count,
      ops_per_second: key_count * 1_000_000 / time_microseconds
    }
  end

  def benchmark_write_throughput(adapter, operation_count \\ 1_000) do
    operations = Enum.map(1..operation_count, fn i ->
      {:"write_key_#{i}", "write_value_#{i}"}
    end)

    {time_microseconds, _results} = :timer.tc(fn ->
      Enum.each(operations, fn {key, value} ->
        adapter.put(key, value)
      end)
    end)

    %{
      adapter: adapter,
      operations: operation_count,
      total_time_us: time_microseconds,
      throughput_ops_per_sec: operation_count * 1_000_000 / time_microseconds
    }
  end

  def memory_usage_analysis(adapter, data_size_range) do
    measurements = for size <- data_size_range do
      # Clear existing data
      adapter.clear()

      # Measure memory before
      memory_before = :erlang.memory(:total)

      # Insert data
      Enum.each(1..size, fn i ->
        adapter.put(:"key_#{i}", String.duplicate("data", 100))
      end)

      # Measure memory after
      memory_after = :erlang.memory(:total)

      {size, memory_after - memory_before}
    end

    %{
      adapter: adapter,
      measurements: measurements,
      memory_per_item: calculate_memory_per_item(measurements)
    }
  end

  defp calculate_memory_per_item(measurements) do
    if length(measurements) >= 2 do
      [{size1, mem1}, {size2, mem2} | _] = measurements
      (mem2 - mem1) / (size2 - size1)
    else
      nil
    end
  end
end
```

## Architecture and Implementation

### Application Dependency Graph

```
prismatic_storage_core (behaviours, protocols, contract tests)
    │
    ├── prismatic_storage_ets (ETS adapter)
    │
    ├── prismatic_storage_ecto (PostgreSQL adapter)
    │     └── depends on: ecto, ecto_sql, postgrex
    │
    ├── prismatic_storage_meilisearch (Search adapter)
    │     └── depends on: meilisearch (HTTP client)
    │
    └── prismatic_storage_kuzudb (Graph adapter)
          └── depends on: kuzu_ex (NIF binding)
```

### Configuration-Based Backend Selection

```elixir
# config/dev.exs - Use ETS for fast development
config :prismatic, :storage_backend, PrismaticStorage.ETS

# config/prod.exs - Use PostgreSQL for production
config :prismatic, :storage_backend, PrismaticStorage.Ecto

# config/test.exs - Use ETS for isolated tests
config :prismatic, :storage_backend, PrismaticStorage.ETS

# Runtime selection in application code
defmodule PrismaticAgents.Store do
  @backend Application.compile_env(:prismatic, :storage_backend, PrismaticStorage.ETS)

  def save_agent_state(agent_id, state) do
    @backend.put({:agent, agent_id}, state)
  end

  def load_agent_state(agent_id) do
    @backend.get({:agent, agent_id})
  end
end
```

### Protocol-Based Type Dispatch

For operations that depend on data type rather than backend, protocols provide type-level dispatch:

```elixir
defprotocol PrismaticStorage.Storable do
  @moduledoc """
  Protocol for types that can be stored through the storage layer.
  Provides serialization, key generation, and validation.
  """

  @spec storage_key(t()) :: term()
  def storage_key(entity)

  @spec serialize(t()) :: map()
  def serialize(entity)

  @spec validate(t()) :: :ok | {:error, list(String.t())}
  def validate(entity)
end

defimpl PrismaticStorage.Storable, for: PrismaticPerimeter.Asset do
  def storage_key(asset), do: {:asset, asset.domain, asset.type, asset.identifier}
  def serialize(asset), do: Map.from_struct(asset)
  def validate(asset) do
    errors = []
    errors = if is_nil(asset.domain), do: ["domain required" | errors], else: errors
    errors = if is_nil(asset.type), do: ["type required" | errors], else: errors
    case errors do
      [] -> :ok
      errors -> {:error, errors}
    end
  end
end
```

## Usage in Prismatic Platform

Within the 90-app umbrella, the storage layer serves as the foundation for data persistence across all applications.

### Platform Storage Usage

| Application | Backend | Purpose |
|-------------|---------|---------|
| `prismatic_agents` | ETS | Agent state, registry, health monitoring |
| `prismatic_perimeter` | Ecto | Asset inventory, findings, compliance data |
| `prismatic_osint` | Ecto + Meilisearch | OSINT records + full-text search |
| `prismatic_web` | ETS | Session data, LiveView state cache |
| `prismatic_claude` | ETS + Disk | Stack conversation frames, session context |
| `prismatic_hawkeye` | Ecto + KuzuDB | Visitor records + relationship graphs |
| `prismatic_api` | ETS | Endpoint registry, rate limiting counters |

### Storage Layer Statistics

| Metric | Value |
|--------|-------|
| **Storage applications** | 5 (core + 4 adapters) |
| **Behaviour definitions** | 3 (KeyValue, Searchable, Graph) |
| **Contract test cases** | 40+ per adapter |
| **ETS tables at runtime** | 50+ |
| **PostgreSQL tables** | 200+ |

## Best Practices

**Program against behaviours, not implementations.** Application code should reference `PrismaticStorage.KeyValue` callbacks, not `PrismaticStorage.ETS` specific functions. This ensures backend portability and enables testing with lightweight ETS adapters regardless of the production backend.

**Run contract tests on every adapter.** The contract test macro exists to ensure behavioral equivalence. Every adapter must pass all contract tests before it can be used in production. Add new contract tests when new behavioral requirements emerge.

**Use ETS for development and testing.** ETS requires no external infrastructure, starts instantly, and provides fast in-memory access. This reduces the development feedback loop and enables parallel test execution without database contention.

**Separate read and write paths.** For read-heavy workloads, use ETS as a cache in front of PostgreSQL. Writes go to PostgreSQL through the Ecto adapter, and a GenServer-managed synchronization process updates the ETS cache. Reads bypass PostgreSQL entirely.

**Implement the Storable protocol for domain types.** The protocol ensures consistent serialization, key generation, and validation across all storage backends. Types that implement Storable can be stored through any adapter without additional transformation logic.

## Common Pitfalls

**Coupling business logic to a specific backend.** Directly calling `:ets.lookup` or `Repo.get` in business logic creates tight coupling that prevents backend switching. Always use the behaviour interface. This anti-pattern prevents testing with lightweight backends and locks applications to specific infrastructure choices made during early development.

**Assuming ETS persistence.** ETS tables exist only in memory and are lost when the owning process terminates. For data that must survive restarts, use Ecto/PostgreSQL or implement ETS-to-disk persistence with periodic snapshots. A common mistake is using ETS for user data or system state that needs to persist across deployments.

**Ignoring contract test failures.** When a contract test fails on a new adapter, the correct response is to fix the adapter, not to skip the test. Contract tests define the behavioral contract; violations indicate implementation bugs. Disabling tests to make CI pass creates behavioral differences between adapters that will cause production issues.

**Missing concurrent access testing.** Contract tests verify basic CRUD operations but may not cover all concurrent access patterns. For adapters used in high-concurrency environments, add property-based tests that exercise concurrent reads and writes. Race conditions often emerge only under load.

**Over-engineering adapter selection.** For simple applications with a single storage backend, the adapter pattern adds unnecessary indirection. Use the pattern when backend portability is genuinely needed (different environments, testing isolation, future migration flexibility). Single-backend applications should use the storage technology directly.

**Inefficient key design across adapters.** Keys that work efficiently in ETS (atoms, tuples) may perform poorly in Redis (string concatenation required) or PostgreSQL (complex composite keys). Design key structures that perform reasonably across all target backends, or use adapter-specific key transformation.

**Memory leak in ETS adapters.** ETS tables with `write_concurrency` enabled consume significant memory overhead per table. Creating too many ETS tables (one per user, per session, etc.) can exhaust memory. Use table sharding or a single table with prefixed keys for large datasets.

**Transaction boundary confusion.** ETS operations are atomic per operation but don't support multi-operation transactions. PostgreSQL supports ACID transactions but requires explicit transaction boundaries. Redis supports transactions with MULTI/EXEC but has different semantics than SQL transactions. Design business logic to work with the lowest common denominator or use adapter-specific transaction mechanisms.

**Serialization format incompatibility.** ETS can store raw Elixir terms, but other adapters require serialization to JSON, binary, or other formats. Using adapter-specific serialization (e.g., storing Maps in ETS but JSON in Redis) creates behavioral differences. Implement consistent serialization through the Storable protocol.

**Performance assumption mismatches.** Assuming all adapters have similar performance characteristics leads to poor design decisions. ETS read operations are O(1) with microsecond latency, while PostgreSQL queries may require millisecond network round-trips. Design for the performance characteristics of the slowest adapter if backend portability is required.

### Advanced Debugging and Monitoring

```elixir
defmodule PrismaticStorage.Diagnostics do
  @moduledoc """
  Diagnostic utilities for storage layer debugging and monitoring.
  Provides insight into adapter behavior and performance characteristics.
  """

  require Logger

  def adapter_health_check(adapter_module) do
    health_checks = [
      {:connectivity, test_connectivity(adapter_module)},
      {:basic_operations, test_basic_operations(adapter_module)},
      {:performance, benchmark_performance(adapter_module)},
      {:memory_usage, check_memory_usage(adapter_module)},
      {:error_handling, test_error_scenarios(adapter_module)}
    ]

    overall_status = if Enum.all?(health_checks, fn {_, result} -> result.status == :ok end) do
      :healthy
    else
      :degraded
    end

    %{
      adapter: adapter_module,
      overall_status: overall_status,
      checks: health_checks,
      timestamp: DateTime.utc_now()
    }
  end

  defp test_connectivity(adapter) do
    try do
      test_key = {:health_check, :erlang.unique_integer()}
      test_value = "connectivity_test_#{:erlang.unique_integer()}"

      with :ok <- adapter.put(test_key, test_value),
           {:ok, ^test_value} <- adapter.get(test_key),
           :ok <- adapter.delete(test_key) do
        %{status: :ok, latency_ms: measure_operation_latency(adapter, test_key, test_value)}
      else
        error ->
          %{status: :error, error: error}
      end
    rescue
      exception ->
        %{status: :error, exception: Exception.message(exception)}
    end
  end

  defp test_error_scenarios(adapter) do
    error_tests = [
      {:missing_key, fn -> adapter.get(:nonexistent_key_#{:erlang.unique_integer()}) end},
      {:invalid_operation, fn -> adapter.put(nil, "test") end}
    ]

    results = for {test_name, test_fn} <- error_tests do
      result = try do
        case test_fn.() do
          {:error, _reason} -> :expected_error
          {:ok, _} -> :unexpected_success
          other -> {:unexpected_result, other}
        end
      rescue
        _ -> :exception_raised
      end

      {test_name, result}
    end

    expected_errors = Enum.count(results, fn {_, result} -> result == :expected_error end)
    total_tests = length(results)

    if expected_errors == total_tests do
      %{status: :ok, error_handling_correct: true}
    else
      %{status: :warning, error_handling_issues: results}
    end
  end

  defp measure_operation_latency(adapter, key, value) do
    {time_microseconds, _} = :timer.tc(fn ->
      adapter.put(key, value)
      adapter.get(key)
      adapter.delete(key)
    end)

    time_microseconds / 1000  # Convert to milliseconds
  end

  defp benchmark_performance(adapter) do
    test_operations = 100
    test_data = for i <- 1..test_operations do
      {:"perf_test_#{i}", "test_value_#{i}"}
    end

    {write_time, _} = :timer.tc(fn ->
      for {key, value} <- test_data do
        adapter.put(key, value)
      end
    end)

    {read_time, _} = :timer.tc(fn ->
      for {key, _} <- test_data do
        adapter.get(key)
      end
    end)

    # Cleanup
    for {key, _} <- test_data, do: adapter.delete(key)

    %{
      status: :ok,
      write_ops_per_sec: test_operations * 1_000_000 / write_time,
      read_ops_per_sec: test_operations * 1_000_000 / read_time,
      write_latency_us: write_time / test_operations,
      read_latency_us: read_time / test_operations
    }
  end

  defp check_memory_usage(adapter) do
    memory_before = :erlang.memory(:total)

    # Insert test data
    test_data_size = 1000
    for i <- 1..test_data_size do
      adapter.put(:"mem_test_#{i}", String.duplicate("x", 100))
    end

    memory_after = :erlang.memory(:total)
    memory_delta = memory_after - memory_before

    # Cleanup
    for i <- 1..test_data_size do
      adapter.delete(:"mem_test_#{i}")
    end

    memory_per_item = memory_delta / test_data_size

    %{
      status: :ok,
      memory_delta_bytes: memory_delta,
      memory_per_item_bytes: memory_per_item,
      efficiency_rating: classify_memory_efficiency(memory_per_item)
    }
  end

  defp classify_memory_efficiency(bytes_per_item) do
    cond do
      bytes_per_item < 200 -> :excellent    # ETS-like efficiency
      bytes_per_item < 500 -> :good         # Reasonable overhead
      bytes_per_item < 1000 -> :acceptable  # Higher but manageable
      true -> :concerning                   # Investigate overhead
    end
  end
end
```

## Related Concepts

- [ETS Table](/glossary/ets-table/) -- In-memory storage backend for high-speed data access
- [Ecto](/glossary/ecto/) -- Database toolkit powering the relational storage adapter
- [PostgreSQL](/glossary/postgresql/) -- Primary persistent storage backend
- [Meilisearch](/glossary/meilisearch/) -- Full-text and vector search backend
- [KuzuDB](/glossary/kuzudb/) -- Graph database backend for relationship queries
- [Behaviour](/glossary/behaviour/) -- Callback mechanism defining storage contracts
- [Protocol](/glossary/protocol/) -- Type-based dispatch for the Storable protocol
- [Adapter Pattern](/glossary/adapter-pattern/) -- Design pattern underlying the storage architecture

## See Also

- [prismatic_storage_core](../../../apps/prismatic_storage_core/README.md) -- Core traits, protocols, and contract test macros
- [prismatic_storage_ets](../../../apps/prismatic_storage_ets/README.md) -- ETS adapter for in-memory key-value storage
- [prismatic_storage_ecto](../../../apps/prismatic_storage_ecto/README.md) -- Ecto/PostgreSQL adapter for persistent storage
- [prismatic_storage_meilisearch](../../../apps/prismatic_storage_meilisearch/README.md) -- Meilisearch adapter for full-text and vector search
- [prismatic_storage_kuzudb](../../../apps/prismatic_storage_kuzudb/README.md) -- KuzuDB adapter for graph queries
- [prismatic_storage_redis](../../../apps/prismatic_storage_redis/README.md) -- Redis adapter for distributed caching
- [prismatic_storage_duckdb](../../../apps/prismatic_storage_duckdb/README.md) -- DuckDB adapter for analytical queries
- [prismatic_storage](../../../apps/prismatic_storage/README.md) -- Storage coordination and backend selection
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Umbrella applications using the storage layer

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)