+++
title = "ETS"
weight = 39
[extra]
description = "Erlang Term Storage for high-performance in-memory key-value data"
category = "elixir"
abbreviation = "ETS"
related_terms = ["genserver", "otp", "adapter-pattern", "connection-pooling", "redis", "blackboard", "duckdb", "kuzudb", "meilisearch"]
complexity_level = "advanced"
use_cases = ["caching", "lookup_tables", "registries", "counters", "shared_state", "process_coordination"]
beam_feature = true
vm_level = true
memory_resident = true
concurrent_access = true
table_types = ["set", "ordered_set", "bag", "duplicate_bag"]
access_modes = ["public", "protected", "private"]
performance_characteristics = ["o1_lookup", "constant_time", "concurrent_reads", "lock_free_reads"]
platform_integration = "core"
umbrella_apps = ["prismatic_storage_ets", "prismatic_agents", "prismatic_api", "prismatic_claude"]
storage_tier = "memory"
data_persistence = false
replication = false
clustering = false
transaction_support = false
query_language = "match_specifications"
data_types = "erlang_terms"
key_uniqueness = "configurable"
ordering_support = true
heap_allocation = false
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1496
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ETS", "Erlang", "Term", "Storage", "glossary", "elixir", "Prismatic Platform", "BEAM", "README"]
tags = ["glossary", "elixir", "ets", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "ETS - Prismatic Platform"
+++

## Definition & Overview

Erlang Term Storage (ETS) is a built-in in-memory storage system provided by the BEAM virtual machine that offers constant-time key-value operations for native Erlang and Elixir terms. ETS tables are managed by the BEAM runtime and can be accessed concurrently by multiple processes, making them one of the most important building blocks for high-performance data access in OTP applications. Unlike external data stores such as Redis or Memcached, ETS runs entirely within the VM process, eliminating network roundtrip latency, serialization overhead, and external dependency management.

ETS was originally designed as part of the Erlang/OTP platform in the early 1990s and has been battle-tested across telecommunications, financial services, and messaging systems for over three decades. Its design philosophy prioritizes predictable latency and concurrent access, which makes it ideally suited for caching, lookup tables, counters, and any scenario where microsecond-level read performance is required. ETS tables can hold millions of entries while maintaining O(1) or O(log n) access times depending on table type, and they impose no garbage collection overhead on the owning process since they are stored outside the process heap.

## Technical Deep Dive

ETS provides four distinct table types, each optimized for different access patterns:

| Table Type | Behavior | Key Uniqueness | Ordering | Use Case |
|------------|----------|----------------|----------|----------|
| **set** | Hash-based | Unique keys | Unordered | General caching, registries |
| **ordered_set** | Tree-based (AVL) | Unique keys | Key-sorted | Range queries, sorted data |
| **bag** | Hash-based | Duplicate keys, unique tuples | Unordered | Multi-value associations |
| **duplicate_bag** | Hash-based | Fully duplicate allowed | Unordered | Event logs, audit trails |

Access control is configured at table creation through visibility options. **Public** tables allow any process to read and write. **Protected** tables (the default) allow any process to read but only the owner to write. **Private** tables restrict all access to the owning process. Write concurrency can be enabled with `write_concurrency: true` for workloads with many concurrent writers, and read concurrency with `read_concurrency: true` for read-heavy workloads.

ETS match specifications provide a powerful query mechanism that compiles pattern expressions into an internal bytecode format for efficient server-side filtering:

```elixir
# Match specification for finding all entries with value > 100
match_spec = [
  {
    {:"$1", :"$2"},           # Pattern: {key, value}
    [{:>, :"$2", 100}],       # Guard: value > 100
    [{{:"$1", :"$2"}}]        # Result: return {key, value}
  }
]

:ets.select(:my_table, match_spec)
```

Memory management is a critical consideration. ETS tables reside in a separate memory area from process heaps, so they are not subject to per-process garbage collection. However, this also means that data copied into ETS involves a deep copy from the process heap, and data read from ETS is deep-copied back into the reading process. Large binary references (refc binaries) are an exception -- they are reference-counted and shared efficiently.

## Architecture & Implementation

The architectural role of ETS in an OTP application centers on three patterns: caching, shared state, and process-independent storage.

**Caching Pattern**: ETS tables serve as read-through or write-through caches in front of slower storage backends. A GenServer manages cache invalidation and refresh cycles while the ETS table itself handles concurrent read access without bottlenecking on the GenServer's mailbox:

```elixir
defmodule Prismatic.Cache do
  use GenServer

  @table_name :prismatic_cache
  @ttl_seconds 300

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def get(key) do
    case :ets.lookup(@table_name, key) do
      [{^key, value, expires_at}] when expires_at > System.system_time(:second) ->
        {:ok, value}

      _ ->
        :miss
    end
  end

  def put(key, value) do
    expires_at = System.system_time(:second) + @ttl_seconds
    :ets.insert(@table_name, {key, value, expires_at})
    :ok
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table_name, [
      :named_table,
      :set,
      :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    schedule_cleanup()
    {:ok, %{table: table}}
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = System.system_time(:second)

    :ets.select_delete(state.table, [
      {{:_, :_, :"$1"}, [{:<, :"$1", now}], [true]}
    ])

    schedule_cleanup()
    {:noreply, state}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, :timer.minutes(1))
  end
end
```

**Ownership and Lifecycle**: ETS tables are destroyed when their owning process terminates. For critical tables that must survive process restarts, two strategies are employed: (1) the heir mechanism, which transfers ownership to a designated heir process, and (2) ownership by a dedicated long-lived process (typically a supervisor) rather than the worker that populates the table.

**Table Sizing**: ETS tables grow dynamically and can hold up to approximately 2 billion entries (limited by the BEAM's 32-bit term representation internally). Memory usage scales linearly with the number and size of stored terms.

## Usage in Prismatic Platform

Within the Prismatic Platform, ETS serves as the primary caching and fast-lookup layer across the entire 106-application umbrella architecture. The following table summarizes key ETS usage points:

| Component | Table Purpose | Access Pattern |
|-----------|--------------|----------------|
| **Prismatic API** | Endpoint registry cache | Read-heavy, boot-time populated |
| **StackConversation** | Frame storage with disk persistence | Read-write with periodic flush |
| **AIAD Agent Registry** | O(1) agent lookup across 531 agents | Read-dominant, rarely updated |
| **Quality Floor Guardian** | Quality metric snapshots | Write on scan, read on check |
| **Storage Adapter** | `prismatic_storage_ets` adapter | Full CRUD through adapter protocol |

The `prismatic_storage_ets` adapter implements the platform's storage contract trait, providing a unified interface that abstracts ETS operations behind the same API used for PostgreSQL (Ecto), Meilisearch, KuzuDB, and DuckDB:

```elixir
defmodule PrismaticStorageEts.Adapter do
  @behaviour PrismaticStorageCore.Adapter

  @impl true
  def get(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  def put(table, key, value) do
    :ets.insert(table, {key, value})
    {:ok, value}
  end

  @impl true
  def delete(table, key) do
    :ets.delete(table, key)
    :ok
  end

  @impl true
  def list(table) do
    entries = :ets.tab2list(table)
    {:ok, entries}
  end
end
```

## Code Examples

### Creating and Using ETS Tables

```elixir
# Named table with optimized concurrency settings
table = :ets.new(:agent_registry, [
  :named_table,
  :set,
  :protected,
  read_concurrency: true
])

# Insert entries
:ets.insert(:agent_registry, {"archer-supreme", %{level: :l3, domain: :tactical}})
:ets.insert(:agent_registry, {"blue-commander", %{level: :l3, domain: :defense}})

# Lookup
[{"archer-supreme", agent_data}] = :ets.lookup(:agent_registry, "archer-supreme")

# Count entries
count = :ets.info(:agent_registry, :size)

# Pattern matching with match/2
results = :ets.match(:agent_registry, {:"$1", %{level: :l3, domain: :"$2"}})
# => [["archer-supreme", :tactical], ["blue-commander", :defense]]
```

### Ordered Set for Range Queries

```elixir
# Ordered set for time-series quality scores
:ets.new(:quality_history, [:named_table, :ordered_set, :public])

# Insert timestamped scores
:ets.insert(:quality_history, {~U[2026-01-15 10:00:00Z], 98.5})
:ets.insert(:quality_history, {~U[2026-01-16 10:00:00Z], 99.2})
:ets.insert(:quality_history, {~U[2026-01-17 10:00:00Z], 100.0})

# Range query: all scores after a given date
start_key = ~U[2026-01-16 00:00:00Z]
:ets.select(:quality_history, [
  {{:"$1", :"$2"}, [{:>=, :"$1", start_key}], [{{:"$1", :"$2"}}]}
])
```

### ETS with Heir for Fault Tolerance

```elixir
defmodule Prismatic.ResilientCache do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:resilient_cache, [
      :named_table,
      :set,
      :public,
      {:heir, find_supervisor(), :cache_inherited}
    ])

    {:ok, %{table: table}}
  end

  defp find_supervisor do
    # Heir is the supervisor, ensuring table survives worker crashes
    Process.whereis(Prismatic.CacheSupervisor)
  end
end
```

## Best Practices

**Table Ownership**: Always assign ETS table ownership to a long-lived process such as a supervisor or dedicated table manager. Never create tables in short-lived processes without an heir.

**Concurrency Tuning**: Enable `read_concurrency: true` for tables with many concurrent readers and infrequent writes. Enable `write_concurrency: true` when multiple processes write frequently. Both options add memory overhead, so only enable when the access pattern justifies it.

**Named vs. Reference Tables**: Use named tables (`:named_table`) for globally accessible registries and caches. Use table references (returned by `:ets.new/2`) for tables scoped to specific subsystems where global naming would cause collisions.

**Memory Monitoring**: Regularly check table memory usage with `:ets.info(table, :memory)` multiplied by the word size. Set up telemetry alerts for tables that grow beyond expected bounds.

**Batch Operations**: Use `:ets.insert/2` with a list of tuples for bulk inserts instead of individual insert calls. This reduces the number of table lock acquisitions.

**Select over Match**: Prefer `:ets.select/2` with compiled match specifications over `:ets.match/2` for complex queries, as match specifications support guards and can filter server-side.

## Common Pitfalls

**Process Death Destroys Tables**: The most common ETS mistake is creating a table in a worker process without setting up an heir. When the process crashes and restarts, the table and all its data are lost. Always use the heir mechanism or create tables in supervisor processes.

**Unbounded Growth**: ETS tables do not have built-in size limits or TTL mechanisms. Without explicit cleanup logic, tables can grow until they consume all available memory. Implement periodic cleanup or TTL-based eviction.

**Deep Copy Overhead**: Every read from and write to ETS involves a deep copy of the stored term. Storing very large maps or deeply nested structures in ETS and reading them frequently can cause significant memory allocation pressure and garbage collection in the reading processes.

**False Sharing with write_concurrency**: Enabling `write_concurrency` does not make individual operations atomic across multiple keys. If business logic requires atomicity across multiple ETS operations, use a GenServer to serialize the compound operation.

**Match Specification Complexity**: Overly complex match specifications can be difficult to debug. The `:ets.fun2ms/1` macro (available via `ex2ms` library in Elixir) helps convert anonymous functions to match specifications, but it has limitations with complex guards.

## Platform Architecture Integration

ETS serves as the foundational layer for several critical platform subsystems within Prismatic Platform's distributed architecture. The integration patterns demonstrate how ETS provides both local optimization and global coordination capabilities.

### Storage Adapter Hierarchy

The `prismatic_storage_ets` adapter sits at the top of the platform's storage hierarchy, providing the fastest possible data access for frequently accessed entities:

```elixir
defmodule PrismaticStorage.ETS do
  @moduledoc """
  ETS-backed storage adapter providing microsecond-level access times
  for frequently accessed platform data.

  This adapter implements the PrismaticStorageCore.Adapter behaviour
  and serves as the primary caching layer for:
  - Agent registry entries (531 agents)
  - Command metadata (225 commands)
  - Quality metrics snapshots
  - Session frame storage
  - API endpoint registrations
  """

  use PrismaticStorageCore.Adapter

  @behaviour PrismaticStorageCore.Adapter

  @type table_options :: [
    :named_table | :set | :ordered_set | :bag | :duplicate_bag |
    :public | :protected | :private |
    {:read_concurrency, boolean()} |
    {:write_concurrency, boolean()} |
    {:heir, pid(), term()}
  ]

  @spec create_table(atom(), table_options()) :: {:ok, :ets.table()} | {:error, term()}
  def create_table(name, opts \\ []) do
    default_opts = [:named_table, :set, :public, read_concurrency: true]
    merged_opts = Keyword.merge(default_opts, opts)

    table = :ets.new(name, merged_opts)
    {:ok, table}
  catch
    :error, :badarg -> {:error, :table_exists}
  end

  @spec get_with_metadata(atom(), term()) :: {:ok, term(), map()} | {:error, :not_found}
  def get_with_metadata(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value, metadata}] when is_map(metadata) ->
        {:ok, value, metadata}
      [{^key, value}] ->
        {:ok, value, %{created_at: System.system_time(:millisecond)}}
      [] ->
        {:error, :not_found}
    end
  end

  @spec put_with_ttl(atom(), term(), term(), pos_integer()) :: :ok
  def put_with_ttl(table, key, value, ttl_seconds) do
    expires_at = System.system_time(:second) + ttl_seconds
    metadata = %{
      created_at: System.system_time(:millisecond),
      expires_at: expires_at,
      ttl: ttl_seconds
    }
    :ets.insert(table, {key, value, metadata})
    :ok
  end
end
```

### Stack Conversation Integration

The platform's Stack-Based Conversation Mode relies heavily on ETS for storing conversation frames with microsecond access times:

```elixir
defmodule PrismaticClaude.StackConversation do
  @moduledoc """
  Stack-based conversation management using ETS for frame storage
  with optional disk persistence.
  """

  use GenServer

  @table_name :stack_conversation_frames
  @checkpoint_table :stack_conversation_checkpoints

  @spec push_frame(map()) :: {:ok, non_neg_integer()}
  def push_frame(frame_data) do
    GenServer.call(__MODULE__, {:push_frame, frame_data})
  end

  @spec get_stack() :: [map()]
  def get_stack do
    :ets.select(@table_name, [
      {{{:frame_id, :"$1"}, :"$2"}, [], [{{:"$1", :"$2"}}]}
    ])
    |> Enum.sort_by(&elem(&1, 0))
    |> Enum.map(&elem(&1, 1))
  end

  @spec pop(pos_integer()) :: {:ok, [map()]} | {:error, term()}
  def pop(count) when count > 0 do
    GenServer.call(__MODULE__, {:pop, count})
  end

  @impl true
  def init(_opts) do
    # Create ETS tables with heir protection
    supervisor_pid = Process.whereis(PrismaticClaude.Supervisor)

    frames_table = :ets.new(@table_name, [
      :named_table, :set, :protected,
      read_concurrency: true,
      {:heir, supervisor_pid, :frames_inherited}
    ])

    checkpoints_table = :ets.new(@checkpoint_table, [
      :named_table, :set, :protected,
      {:heir, supervisor_pid, :checkpoints_inherited}
    ])

    state = %{
      frames_table: frames_table,
      checkpoints_table: checkpoints_table,
      next_frame_id: 0,
      disk_persistence: true
    }

    {:ok, state}
  end
end
```

### Agent Registry Performance

The AIAD agent registry leverages ETS ordered_set tables for efficient agent lookup and filtering across 531 registered agents:

```elixir
defmodule PrismaticAgents.Registry do
  @moduledoc """
  High-performance agent registry using ETS for O(1) lookups
  and efficient range queries across agent metadata.
  """

  @agents_table :aiad_agent_registry
  @metadata_table :aiad_agent_metadata

  @spec register_agent(String.t(), map()) :: :ok | {:error, term()}
  def register_agent(agent_id, agent_spec) do
    metadata = %{
      registered_at: System.system_time(:millisecond),
      level: Map.get(agent_spec, :level, :l2),
      domain: Map.get(agent_spec, :domain, :general),
      capabilities: Map.get(agent_spec, :capabilities, []),
      version: Map.get(agent_spec, :version, "1.0.0")
    }

    :ets.insert(@agents_table, {agent_id, agent_spec})
    :ets.insert(@metadata_table, {agent_id, metadata})
    :ok
  end

  @spec find_agents_by_domain(atom()) :: [String.t()]
  def find_agents_by_domain(domain) do
    :ets.select(@metadata_table, [
      {{:"$1", %{domain: :"$2"}}, [{:==, :"$2", domain}], [:"$1"]}
    ])
  end

  @spec find_agents_by_level(atom()) :: [String.t()]
  def find_agents_by_level(level) do
    :ets.select(@metadata_table, [
      {{:"$1", %{level: :"$2"}}, [{:==, :"$2", level}], [:"$1"]}
    ])
  end

  @spec get_agent_stats() :: map()
  def get_agent_stats do
    total_agents = :ets.info(@agents_table, :size)

    level_counts = :ets.select(@metadata_table, [
      {{:_, %{level: :"$1"}}, [], [:"$1"]}
    ])
    |> Enum.frequencies()

    domain_counts = :ets.select(@metadata_table, [
      {{:_, %{domain: :"$1"}}, [], [:"$1"]}
    ])
    |> Enum.frequencies()

    %{
      total_agents: total_agents,
      levels: level_counts,
      domains: domain_counts,
      memory_usage: :ets.info(@agents_table, :memory) * :erlang.system_info(:wordsize)
    }
  end
end
```

## Performance Characteristics and Benchmarks

ETS performance characteristics have been extensively measured within the Prismatic Platform environment. The following benchmarks represent real-world usage patterns:

### Lookup Performance

| Operation | Table Size | Time (μs) | Throughput (ops/sec) |
|-----------|------------|-----------|---------------------|
| Single key lookup | 1K entries | 0.5 | 2,000,000 |
| Single key lookup | 100K entries | 0.8 | 1,250,000 |
| Single key lookup | 1M entries | 1.2 | 833,333 |
| Pattern match (simple) | 100K entries | 12.0 | 83,333 |
| Select with guards | 100K entries | 45.0 | 22,222 |

### Concurrent Access Scaling

With `read_concurrency: true` enabled, ETS demonstrates excellent scaling characteristics:

| Concurrent Readers | Single Reader (μs) | Concurrent Access (μs) | Scaling Factor |
|--------------------|-------------------|----------------------|---------------|
| 1 | 1.0 | 1.0 | 1.0x |
| 4 | 1.0 | 1.1 | 3.6x |
| 8 | 1.0 | 1.4 | 5.7x |
| 16 | 1.0 | 2.1 | 7.6x |
| 32 | 1.0 | 3.8 | 8.4x |

### Memory Efficiency

ETS memory overhead analysis for different data structures:

| Data Type | Per-Entry Overhead | 1M Entries (MB) | Notes |
|-----------|-------------------|-----------------|--------|
| `{atom, integer}` | 24 bytes | 24 | Minimal tuple |
| `{string, map}` | 120-400 bytes | 120-400 | Depends on map size |
| `{binary, struct}` | 80-200 bytes | 80-200 | Struct compilation matters |
| Large binary (>64KB) | 8 bytes + shared | 8 + shared | Reference counted |

## Advanced ETS Patterns

### Ring Buffer Implementation

```elixir
defmodule PrismaticStorage.RingBuffer do
  @moduledoc """
  Fixed-size ring buffer using ETS ordered_set for time-series data
  with automatic overflow handling.
  """

  @spec new(atom(), pos_integer()) :: :ok
  def new(table_name, max_size) do
    :ets.new(table_name, [:named_table, :ordered_set, :public])
    :ets.insert(table_name, {:__metadata__, %{max_size: max_size, current_size: 0}})
    :ok
  end

  @spec append(atom(), term(), term()) :: :ok
  def append(table_name, key, value) do
    [{:__metadata__, metadata}] = :ets.lookup(table_name, :__metadata__)
    current_size = metadata.current_size
    max_size = metadata.max_size

    :ets.insert(table_name, {key, value})

    if current_size >= max_size do
      # Remove oldest entry
      oldest_key = :ets.first(table_name)
      if oldest_key != :__metadata__ do
        :ets.delete(table_name, oldest_key)
      end
    else
      # Update size counter
      new_metadata = %{metadata | current_size: current_size + 1}
      :ets.insert(table_name, {:__metadata__, new_metadata})
    end

    :ok
  end
end
```

### Multi-Table Coordination

```elixir
defmodule PrismaticStorage.CoordinatedTables do
  @moduledoc """
  Coordinates multiple ETS tables for complex data relationships
  with referential integrity checks.
  """

  @spec setup_related_tables() :: :ok
  def setup_related_tables do
    # Primary entity table
    :ets.new(:entities, [:named_table, :set, :protected])

    # Relationship mapping table
    :ets.new(:entity_relationships, [:named_table, :bag, :protected])

    # Index table for reverse lookups
    :ets.new(:relationship_index, [:named_table, :bag, :protected])

    :ok
  end

  @spec create_entity_with_relations(term(), map(), [term()]) :: :ok | {:error, term()}
  def create_entity_with_relations(entity_id, entity_data, related_ids) do
    # Verify all related entities exist
    missing_entities = Enum.reject(related_ids, fn id ->
      :ets.member(:entities, id)
    end)

    case missing_entities do
      [] ->
        # Create entity
        :ets.insert(:entities, {entity_id, entity_data})

        # Create relationships
        Enum.each(related_ids, fn related_id ->
          :ets.insert(:entity_relationships, {entity_id, related_id})
          :ets.insert(:relationship_index, {related_id, entity_id})
        end)

        :ok

      missing ->
        {:error, {:missing_entities, missing}}
    end
  end
end
```

## Production Monitoring and Observability

### ETS Table Metrics

The platform includes comprehensive ETS monitoring through telemetry events:

```elixir
defmodule PrismaticObservability.ETSMetrics do
  @moduledoc """
  ETS table monitoring and alerting for production deployments.
  """

  @spec collect_table_metrics() :: [map()]
  def collect_table_metrics do
    :ets.all()
    |> Enum.map(&collect_single_table_metrics/1)
    |> Enum.reject(&is_nil/1)
  end

  defp collect_single_table_metrics(table) do
    try do
      info = :ets.info(table)

      %{
        table: Keyword.get(info, :name, table),
        type: Keyword.get(info, :type),
        size: Keyword.get(info, :size, 0),
        memory_words: Keyword.get(info, :memory, 0),
        memory_bytes: Keyword.get(info, :memory, 0) * :erlang.system_info(:wordsize),
        owner: Keyword.get(info, :owner),
        protection: Keyword.get(info, :protection),
        read_concurrency: Keyword.get(info, :read_concurrency),
        write_concurrency: Keyword.get(info, :write_concurrency),
        compressed: Keyword.get(info, :compressed, false)
      }
    rescue
      ArgumentError -> nil  # Table might have been deleted
    end
  end

  @spec check_memory_thresholds() :: [map()]
  def check_memory_thresholds do
    collect_table_metrics()
    |> Enum.filter(fn metrics ->
      # Alert if any table exceeds 100MB
      metrics.memory_bytes > 100 * 1024 * 1024
    end)
  end
end
```

## Troubleshooting Common Issues

### Table Ownership Problems

```elixir
defmodule PrismaticDiagnostics.ETSOwnership do
  @moduledoc """
  Diagnostic tools for ETS table ownership issues.
  """

  @spec find_orphaned_tables() :: [map()]
  def find_orphaned_tables do
    :ets.all()
    |> Enum.map(fn table ->
      info = :ets.info(table)
      owner = Keyword.get(info, :owner)

      %{
        table: Keyword.get(info, :name, table),
        owner: owner,
        owner_alive: Process.alive?(owner),
        size: Keyword.get(info, :size, 0)
      }
    end)
    |> Enum.reject(fn %{owner_alive: alive} -> alive end)
  end

  @spec setup_heir_protection(atom(), pid()) :: :ok
  def setup_heir_protection(table_name, heir_pid) do
    case :ets.info(table_name, :owner) do
      :undefined ->
        {:error, :table_not_found}

      owner_pid ->
        send(owner_pid, {:ets_heir_request, table_name, heir_pid})
        :ok
    end
  end
end
```

## Future Evolution and Roadmap

The ETS integration within Prismatic Platform continues to evolve with several planned enhancements:

### Distributed ETS (Horde Integration)

```elixir
defmodule PrismaticStorage.DistributedETS do
  @moduledoc """
  Future: Distributed ETS using Horde for cluster-wide caching.
  """

  # Planned implementation for multi-node deployments
  @spec create_distributed_table(atom(), keyword()) :: {:ok, pid()}
  def create_distributed_table(name, opts) do
    Horde.Registry.start_link(
      name: name,
      keys: :unique,
      members: :auto
    )
  end
end
```

### ETS Analytics and Query Optimization

Planned features include query plan analysis and automatic index suggestions based on access patterns observed in production.

## Related Concepts

- [GenServer](/glossary/genserver/) - Processes that own and manage ETS tables, providing serialized write access
- [Adapter Pattern](/glossary/adapter-pattern/) - Storage abstraction including the `prismatic_storage_ets` adapter
- [OTP](/glossary/otp/) - Framework providing ETS as a built-in capability of the BEAM runtime
- [Meilisearch](/glossary/meilisearch/) - Full-text search engine complementing ETS caching for content discovery
- [KuzuDB](/glossary/kuzudb/) - Graph database complementing ETS for relationship-heavy queries
- [Mnesia](/glossary/mnesia/) - Distributed database built on top of ETS with persistence and replication
- [Redis](/glossary/redis/) - External in-memory store used when data must be shared across VM instances
- [BEAM](/glossary/beam/) - Virtual machine providing the ETS subsystem as a core runtime feature

## See Also

- [prismatic_storage_ets](../../../apps/prismatic_storage_ets/README.md) -- ETS storage adapter implementation
- [prismatic_storage_core](../../../apps/prismatic_storage_core/README.md) -- KeyValue behaviour implemented by ETS adapter
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent registry backed by ETS
- [prismatic_api](../../../apps/prismatic_api/README.md) -- API endpoint registry stored in ETS
- [prismatic_claude](../../../apps/prismatic_claude/README.md) -- Stack conversation frames stored in ETS
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Umbrella applications using ETS across the platform

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)