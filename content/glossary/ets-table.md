+++
title = "ETS Table"
weight = 30
[extra]
category = "technology"
description = "In-memory key-value storage with concurrent read access on the BEAM"
related_terms = ["ets", "genserver", "beam", "otp", "process-isolation", "registry-otp"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ETS", "Table", "In-memory", "BEAM", "glossary", "technology", "Prismatic Platform", "GenServer", "Erlang"]
tags = ["glossary", "technology", "ets-table", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "ETS Table - Prismatic Platform"
+++

## Definition and Overview

ETS (Erlang Term Storage) tables are in-memory key-value stores built directly into the BEAM virtual machine, providing O(1) average-case lookup time for arbitrary Erlang and Elixir terms. Unlike process-based state management (such as [GenServer](/glossary/genserver/) state), ETS tables allow concurrent read access from multiple processes without serialization bottlenecks, making them the standard solution for shared read-heavy data on the BEAM. ETS tables store data as tuples where one element serves as the key, and they support four table types (set, ordered_set, bag, duplicate_bag) to accommodate different access patterns.

ETS was introduced in early versions of Erlang/OTP as a response to the fundamental tension between BEAM's process isolation model and the need for shared state. In the actor model, each process owns its state exclusively, and all inter-process communication happens through message passing. While this model provides excellent fault isolation and concurrency safety, it creates a bottleneck when many processes need to read the same data: all reads must be serialized through the owning process's mailbox. ETS resolves this by providing a shared memory region that any process can read without sending messages, while still maintaining the BEAM's safety guarantees through atomic operations and copy semantics.

Each ETS table is owned by a single process (its creator by default). When the owning process terminates, the table is automatically destroyed, and all data is lost. This ownership model ties table lifecycle to process lifecycle, leveraging the BEAM's supervision system for resource management. For production systems where table data must survive process restarts, heir configuration or persistent storage backing is essential.

## Technical Deep Dive

### Table Types

ETS provides four table types, each optimized for different access patterns:

| Type | Key Uniqueness | Value Multiplicity | Ordering | Use Case |
|------|---------------|-------------------|----------|----------|
| **set** | Unique keys | One value per key | None (hash) | General key-value storage, caches |
| **ordered_set** | Unique keys | One value per key | Key order (tree) | Range queries, sorted data |
| **bag** | Non-unique keys | Multiple values per key (unique tuples) | None (hash) | Tags, categories, multi-value indexes |
| **duplicate_bag** | Non-unique keys | Multiple identical tuples allowed | None (hash) | Event logs, raw data collection |

The performance characteristics differ significantly:

| Operation | set / bag | ordered_set |
|-----------|-----------|-------------|
| Lookup by key | O(1) average | O(log n) |
| Insert | O(1) average | O(log n) |
| Delete by key | O(1) average | O(log n) |
| First/Next traversal | Arbitrary order | Sorted order |
| Memory overhead | Lower (hash table) | Higher (balanced tree) |

### Access Control

ETS tables support four access levels:

```elixir
# Public: Any process can read and write
:ets.new(:public_table, [:set, :public, :named_table])

# Protected (default): Any process can read, only owner writes
:ets.new(:protected_table, [:set, :protected, :named_table])

# Private: Only the owner can read or write
:ets.new(:private_table, [:set, :private, :named_table])
```

For production systems, `protected` is the most common choice: a GenServer owns the table and manages writes, while any process can read directly without message passing. This pattern provides write serialization (preventing race conditions) with concurrent read access (avoiding bottlenecks).

### Copy Semantics and Memory

ETS uses copy semantics for data transfer: when a process reads from ETS, the data is copied from the shared table into the process's heap. Similarly, when writing, data is copied from the process heap into the table. This copying has important implications:

- **No shared references**: Processes cannot hold references to ETS data; they always receive copies
- **Memory usage**: Large values are duplicated in both ETS and the reading process's heap
- **Garbage collection**: ETS data is not subject to per-process GC; it persists until explicitly deleted or the table is destroyed
- **Binary optimization**: Large binaries (>64 bytes) are reference-counted rather than copied, reducing memory overhead for binary-heavy workloads

### Atomic Operations

ETS provides several atomic operations that enable safe concurrent access:

```elixir
# Atomic counter increment (no race conditions)
:ets.update_counter(:counters, :page_views, {2, 1})

# Atomic conditional update (compare-and-swap pattern)
:ets.select_replace(:table, [
  {{:key, :old_value}, [], [{{:key, :new_value}}]}
])

# Atomic insert-if-absent
:ets.insert_new(:table, {:key, :value})
```

These atomic operations eliminate the need for external locking or process-based serialization for common patterns like counters, flags, and conditional updates.

## Architecture and Implementation

### GenServer-Owned ETS Pattern

The most common production pattern combines a GenServer (for lifecycle management and write serialization) with a public or protected ETS table (for concurrent reads):

```elixir
defmodule PrismaticCache.TableServer do
  @moduledoc """
  GenServer managing an ETS table with concurrent read access.
  Writes are serialized through GenServer calls; reads bypass the process.
  """
  use GenServer

  @table_name :prismatic_cache
  @table_opts [:set, :protected, :named_table, read_concurrency: true]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  # Client API -- reads bypass GenServer for performance
  @spec get(term()) :: {:ok, term()} | {:error, :not_found}
  def get(key) do
    case :ets.lookup(@table_name, key) do
      [{^key, value, _expiry}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  # Client API -- writes go through GenServer for serialization
  @spec put(term(), term(), keyword()) :: :ok
  def put(key, value, opts \\ []) do
    GenServer.call(__MODULE__, {:put, key, value, opts})
  end

  @spec delete(term()) :: :ok
  def delete(key) do
    GenServer.call(__MODULE__, {:delete, key})
  end

  # Server callbacks
  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table_name, @table_opts)
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_call({:put, key, value, opts}, _from, state) do
    ttl = Keyword.get(opts, :ttl, :infinity)
    expiry = if ttl == :infinity, do: :infinity, else: System.monotonic_time(:second) + ttl
    :ets.insert(@table_name, {key, value, expiry})
    {:reply, :ok, state}
  end

  @impl GenServer
  def handle_call({:delete, key}, _from, state) do
    :ets.delete(@table_name, key)
    {:reply, :ok, state}
  end
end
```

### Heir Configuration for Fault Tolerance

When a GenServer crashes, its ETS table is destroyed. The heir mechanism transfers table ownership to a designated survivor process:

```elixir
defmodule PrismaticCache.Supervisor do
  @moduledoc """
  Supervisor ensuring ETS table survives GenServer restarts via heir configuration.
  """
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticCache.TableOwner, []},
      {PrismaticCache.TableServer, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end

defmodule PrismaticCache.TableOwner do
  @moduledoc """
  Long-lived process that serves as ETS table heir.
  Receives table ownership on GenServer crash and transfers it back on restart.
  """
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{tables: %{}}}
  end

  @impl GenServer
  def handle_info({:"ETS-TRANSFER", table, from_pid, heir_data}, state) do
    new_tables = Map.put(state.tables, heir_data.name, table)
    {:noreply, %{state | tables: new_tables}}
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform relies heavily on ETS tables across its 89 umbrella applications for high-performance shared state, caching, and coordination.

### Platform ETS Usage Map

| Application | Table Purpose | Type | Access |
|-------------|--------------|------|--------|
| **PrismaticAgents** | Agent Registry (434 agents) | set | protected |
| **PrismaticClaude** | StackConversation frames | set | protected |
| **PrismaticAPI** | Endpoint scanner cache | set | protected |
| **PrismaticSupervisor** | App Registry (89 apps) | set | protected |
| **PrismaticPerimeter** | Asset discovery cache | set | protected |
| **PrismaticStorage** | ETS storage adapter | set | public |
| **PrismaticSafety** | Quality gate results | ordered_set | protected |

### Agent Registry

The Agent Registry caches all 434 agent definitions in ETS for O(1) lookup, avoiding repeated file system reads:

```elixir
defmodule PrismaticAgents.Registry do
  @moduledoc """
  ETS-backed registry for 434 AIAD agents with O(1) lookup.
  """
  use GenServer

  @table :agent_registry

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @spec lookup(atom()) :: {:ok, map()} | {:error, :not_found}
  def lookup(agent_id) do
    case :ets.lookup(@table, agent_id) do
      [{^agent_id, agent_def}] -> {:ok, agent_def}
      [] -> {:error, :not_found}
    end
  end

  @spec all() :: list(map())
  def all do
    :ets.tab2list(@table) |> Enum.map(fn {_id, def} -> def end)
  end

  @impl GenServer
  def init(_) do
    table = :ets.new(@table, [:set, :protected, :named_table, read_concurrency: true])
    load_agents(table)
    {:ok, %{table: table}}
  end

  defp load_agents(table) do
    Path.wildcard(".aiad/agents/*.agent.md")
    |> Enum.each(fn path ->
      agent = parse_agent_definition(path)
      :ets.insert(table, {agent.id, agent})
    end)
  end
end
```

### Performance Optimization

The platform uses `read_concurrency: true` and `write_concurrency: true` options to optimize ETS for its specific workload pattern:

```elixir
# Read-heavy table (agent registry, endpoint cache)
:ets.new(:read_heavy, [:set, :protected, :named_table, read_concurrency: true])

# Write-heavy table (telemetry counters, metrics)
:ets.new(:write_heavy, [:set, :public, :named_table, write_concurrency: true])

# Balanced table (session state, actively updated caches)
:ets.new(:balanced, [:set, :protected, :named_table,
  read_concurrency: true, write_concurrency: true])
```

## Best Practices

**Use `read_concurrency: true` for read-heavy tables.** This option optimizes the table's internal data structures for concurrent reads at the cost of slightly slower writes. For tables that are read far more often than written (caches, registries), this provides measurable throughput improvements.

**Always use named tables for production code.** Named tables (`named_table` option) can be accessed by name from any process, providing a stable reference that survives GenServer restarts with heir configuration. Anonymous tables (accessed by reference) become inaccessible if the reference is lost.

**Protect writes behind a GenServer.** Use `protected` access with a GenServer owner to serialize writes while allowing concurrent reads. This prevents race conditions on writes without creating a read bottleneck.

**Implement table heirs for fault tolerance.** Configure heirs to prevent data loss when the owning GenServer crashes. The heir process receives table ownership via the `ETS-TRANSFER` message and can transfer it back to the restarted GenServer.

**Monitor table size.** ETS tables consume system memory and are not subject to per-process garbage collection. Implement TTL-based expiration or size-based eviction to prevent unbounded growth. Use `:ets.info(table, :memory)` to track table memory consumption.

## Common Pitfalls

**Table destruction on owner crash.** If the owning process crashes without heir configuration, the table and all its data are destroyed. This is the most common ETS-related production incident. Always configure heirs for tables containing important state.

**Memory leaks from unbounded tables.** ETS tables grow without limit unless actively managed. A cache table that never evicts entries will eventually consume all available memory. Implement periodic cleanup with `:ets.select_delete/2` or scheduled GenServer sweeps.

**Copy overhead for large values.** Reading large maps or lists from ETS copies the entire structure into the reading process's heap. For large values, consider storing references (PIDs, keys) in ETS and fetching full data from the owning process on demand.

**Match specification complexity.** ETS match specifications (`ets.select/2`, `ets.match/2`) use a Erlang-specific tuple syntax that is difficult to read and maintain. Use `:ets.fun2ms/1` (Erlang) or `Ex2ms` (Elixir) to compile Elixir-style function expressions into match specifications.

**Forgetting about ordered_set performance.** Developers often use `ordered_set` for sorted output without considering the O(log n) lookup cost. If sorted output is needed only occasionally but lookups are frequent, use `set` with in-memory sorting on retrieval.

## Related Concepts

- [GenServer](/glossary/genserver/) -- Stateful processes that commonly own and manage ETS tables
- [BEAM](/glossary/beam/) -- Virtual machine providing native ETS table support
- [OTP](/glossary/otp/) -- Framework providing supervision for ETS table lifecycle management
- [Registry (OTP)](/glossary/registry-otp/) -- Process registry built on top of ETS tables
- [Process Isolation](/glossary/process-isolation/) -- Isolation model that ETS tables bridge for shared data
- [Prismatic Storage](/glossary/prismatic-storage/) -- Storage layer with ETS as a backend adapter
- [Prismatic API](/glossary/prismatic-api/) -- API gateway caching endpoint metadata in ETS

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Umbrella applications using ETS tables

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)