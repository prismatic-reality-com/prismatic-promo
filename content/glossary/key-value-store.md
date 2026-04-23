+++
title = "Key-Value Store"
weight = 50
[extra]
tags = ["glossary", "data", "storage", "database", "ets", "caching", "nosql", "performance", "distributed"]
description = "A key-value store is a data storage paradigm that associates unique keys with arbitrary values, providing O(1) lookup performance and serving as the foundational data structure for caches, session stores, configuration registries, and high-performance data access patterns in distributed systems."
category = "data"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["ets", "redis", "caching", "database", "mnesia", "distributed-system", "performance", "polyglot-persistence", "connection-pooling", "prismatic-storage"]
aliases = ["kv-store", "key-value-database", "key-value-pair-storage"]
prerequisites = ["database", "caching", "distributed-system"]
use_cases = ["caching", "session-management", "configuration-storage", "api-registry", "rate-limiting"]
word_count = 1927
date_modified = "2026-02-23"
keywords = ["Key-Value", "Store", "storage", "paradigm", "associates", "unique", "glossary", "data", "Prismatic Platform", "Redis"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Key-Value Store - Prismatic Platform"
+++

## Definition

A **key-value store** is a data storage system built on the fundamental abstraction of associating unique keys with arbitrary values. Given a key, the store returns the associated value in constant time O(1) or near-constant time, regardless of the total number of stored entries. This simplicity makes key-value stores the fastest general-purpose storage mechanism available and the building block upon which more complex data structures and storage systems are constructed.

Keys are typically strings, integers, or composite identifiers. Values can range from simple scalars (strings, numbers, booleans) to complex serialized objects (JSON documents, binary blobs, Erlang terms). The store itself imposes no schema on values -- it treats them as opaque data associated with keys. This schema-less nature provides maximum flexibility at the cost of requiring the application layer to understand and validate value structure.

Key-value stores exist at every level of the computing stack: CPU caches, hash tables in programming languages, in-process stores like ETS, standalone databases like Redis, and distributed systems like Amazon DynamoDB. The concept is so fundamental that nearly every other database type (relational, document, graph, time-series) uses key-value storage internally as its underlying access mechanism.

## Overview

The key-value abstraction is one of the oldest and most universal concepts in computer science. Hash tables, introduced by Hans Peter Luhn at IBM in 1953, formalized the O(1) lookup property that makes key-value stores practical. The memcached project (2003) popularized distributed key-value caching for web applications. Redis (2009) expanded the concept with rich data types and persistence. Amazon DynamoDB (2012) brought fully managed key-value storage to cloud computing.

In the Elixir/OTP ecosystem, key-value storage has a privileged position because the BEAM virtual machine provides ETS (Erlang Term Storage) as a built-in, highly optimized key-value store. ETS tables live in the same memory space as the BEAM processes that access them, providing microsecond-level read and write operations without network overhead. This makes ETS the default choice for any in-memory key-value storage need within a BEAM application.

The Prismatic Platform uses key-value stores extensively across its 115 umbrella applications. The API introspection registry caches discovered endpoints in ETS. The agent registry stores agent configurations. The quality DNA system persists quality metrics. Session state, rate limiting counters, circuit breaker states, and configuration overrides all rely on key-value storage patterns. Understanding when and how to use different key-value stores is essential for platform development.

Key-value stores are categorized along several dimensions:

- **Durability**: In-memory (ETS, memcached) vs. persistent (Redis with AOF, DynamoDB)
- **Distribution**: Single-node (ETS, LevelDB) vs. distributed (Redis Cluster, etcd, DynamoDB)
- **Data model**: Simple strings (memcached) vs. rich types (Redis: lists, sets, sorted sets, hashes)
- **Consistency**: Strongly consistent (etcd, single-node ETS) vs. eventually consistent (DynamoDB, Riak)
- **Access pattern**: Read-heavy (caching) vs. write-heavy (logging) vs. balanced (session storage)

## Technical Details

### ETS: The BEAM's Native Key-Value Store

ETS is the most important key-value store in the Elixir ecosystem. It provides lock-free concurrent read access, atomic write operations, and the ability to store any Erlang term as both key and value:

```elixir
defmodule Prismatic.Store.ETSKeyValue do
  @moduledoc """
  High-performance key-value store backed by ETS.
  Provides typed access patterns, TTL support, and
  telemetry integration for the Prismatic Platform.
  """
  use GenServer

  @type key :: term()
  @type value :: term()
  @type ttl_ms :: non_neg_integer() | :infinity

  defstruct [:table, :name, :cleanup_interval]

  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl true
  def init(opts) do
    table_name = Keyword.fetch!(opts, :table_name)
    cleanup_interval = Keyword.get(opts, :cleanup_interval, :timer.minutes(1))

    table = :ets.new(table_name, [
      :set,
      :named_table,
      :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    schedule_cleanup(cleanup_interval)

    {:ok, %__MODULE__{
      table: table,
      name: table_name,
      cleanup_interval: cleanup_interval
    }}
  end

  @spec get(atom(), key()) :: {:ok, value()} | :not_found
  def get(table, key) do
    case :ets.lookup(table, key) do
      [{^key, value, :infinity}] ->
        {:ok, value}

      [{^key, value, expires_at}] ->
        if System.monotonic_time(:millisecond) < expires_at do
          {:ok, value}
        else
          :ets.delete(table, key)
          :not_found
        end

      [] ->
        :not_found
    end
  end

  @spec put(atom(), key(), value(), ttl_ms()) :: :ok
  def put(table, key, value, ttl \\ :infinity) do
    expires_at = case ttl do
      :infinity -> :infinity
      ms when is_integer(ms) -> System.monotonic_time(:millisecond) + ms
    end

    :ets.insert(table, {key, value, expires_at})

    :telemetry.execute(
      [:prismatic, :kv_store, :put],
      %{count: 1},
      %{table: table, key: key, ttl: ttl}
    )

    :ok
  end

  @spec delete(atom(), key()) :: :ok
  def delete(table, key) do
    :ets.delete(table, key)
    :ok
  end

  @spec get_or_put(atom(), key(), (-> value()), ttl_ms()) :: value()
  def get_or_put(table, key, compute_fn, ttl \\ :infinity) do
    case get(table, key) do
      {:ok, value} ->
        value

      :not_found ->
        value = compute_fn.()
        put(table, key, value, ttl)
        value
    end
  end

  @spec size(atom()) :: non_neg_integer()
  def size(table) do
    :ets.info(table, :size)
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = System.monotonic_time(:millisecond)

    expired_count =
      :ets.foldl(fn
        {key, _value, expires_at}, count when is_integer(expires_at) and expires_at < now ->
          :ets.delete(state.table, key)
          count + 1

        _entry, count ->
          count
      end, 0, state.table)

    if expired_count > 0 do
      :telemetry.execute(
        [:prismatic, :kv_store, :cleanup],
        %{expired_count: expired_count},
        %{table: state.name}
      )
    end

    schedule_cleanup(state.cleanup_interval)
    {:noreply, state}
  end

  defp schedule_cleanup(interval) do
    Process.send_after(self(), :cleanup, interval)
  end
end
```

### Multi-Tier Key-Value Architecture

Production systems typically use multiple key-value stores at different tiers, each optimized for specific access patterns:

```elixir
defmodule Prismatic.Store.TieredKeyValue do
  @moduledoc """
  Multi-tier key-value store that checks local ETS cache first,
  then falls through to Redis, then to the primary database.
  Write-through ensures all tiers stay consistent.
  """

  @type tier :: :local | :distributed | :persistent

  @spec get(String.t()) :: {:ok, term()} | :not_found
  def get(key) do
    with :not_found <- get_local(key),
         :not_found <- get_distributed(key),
         :not_found <- get_persistent(key) do
      :not_found
    else
      {:ok, value, source_tier} ->
        backfill_upper_tiers(key, value, source_tier)
        {:ok, value}
    end
  end

  @spec put(String.t(), term(), keyword()) :: :ok
  def put(key, value, opts \\ []) do
    ttl = Keyword.get(opts, :ttl, :infinity)
    tiers = Keyword.get(opts, :tiers, [:local, :distributed, :persistent])

    if :local in tiers do
      Prismatic.Store.ETSKeyValue.put(:kv_cache, key, value, local_ttl(ttl))
    end

    if :distributed in tiers do
      Prismatic.Store.RedisAdapter.set(key, value, ttl)
    end

    if :persistent in tiers do
      Prismatic.Store.PersistentAdapter.write(key, value)
    end

    :ok
  end

  defp get_local(key) do
    case Prismatic.Store.ETSKeyValue.get(:kv_cache, key) do
      {:ok, value} -> {:ok, value, :local}
      :not_found -> :not_found
    end
  end

  defp get_distributed(key) do
    case Prismatic.Store.RedisAdapter.get(key) do
      {:ok, value} -> {:ok, value, :distributed}
      :not_found -> :not_found
    end
  end

  defp get_persistent(key) do
    case Prismatic.Store.PersistentAdapter.read(key) do
      {:ok, value} -> {:ok, value, :persistent}
      :not_found -> :not_found
    end
  end

  defp backfill_upper_tiers(key, value, :distributed) do
    Prismatic.Store.ETSKeyValue.put(:kv_cache, key, value, :timer.minutes(5))
  end

  defp backfill_upper_tiers(key, value, :persistent) do
    Prismatic.Store.ETSKeyValue.put(:kv_cache, key, value, :timer.minutes(5))
    Prismatic.Store.RedisAdapter.set(key, value, :timer.hours(1))
  end

  defp backfill_upper_tiers(_key, _value, :local), do: :ok

  defp local_ttl(:infinity), do: :timer.minutes(15)
  defp local_ttl(ttl) when is_integer(ttl), do: min(ttl, :timer.minutes(15))
end
```

### Consistent Hashing for Distributed Key-Value

When distributing keys across multiple nodes, consistent hashing ensures that adding or removing nodes only relocates a minimal number of keys:

```elixir
defmodule Prismatic.Store.ConsistentHash do
  @moduledoc """
  Consistent hash ring for distributing keys across nodes.
  Uses virtual nodes to ensure even distribution even with
  a small number of physical nodes.
  """

  @virtual_nodes 150

  @type ring :: %{
    nodes: [node()],
    ring: [{non_neg_integer(), node()}]
  }

  @spec new([node()]) :: ring()
  def new(nodes) do
    ring =
      nodes
      |> Enum.flat_map(fn node ->
        Enum.map(1..@virtual_nodes, fn i ->
          hash = :erlang.phash2({node, i}, trunc(:math.pow(2, 32)))
          {hash, node}
        end)
      end)
      |> Enum.sort_by(fn {hash, _node} -> hash end)

    %{nodes: nodes, ring: ring}
  end

  @spec get_node(ring(), String.t()) :: node()
  def get_node(%{ring: ring}, key) do
    hash = :erlang.phash2(key, trunc(:math.pow(2, 32)))

    case Enum.find(ring, fn {h, _node} -> h >= hash end) do
      {_h, node} -> node
      nil ->
        {_h, node} = List.first(ring)
        node
    end
  end
end
```

## Implementation

### Choosing the Right Key-Value Store

The implementation decision tree for key-value storage in the Prismatic Platform:

1. **Is the data needed only within a single BEAM node?** Use ETS. It is the fastest option with zero network overhead.

2. **Does the data need to survive node restarts?** Use ETS with disk persistence (DETS) or Redis with AOF/RDB persistence.

3. **Does the data need to be shared across multiple BEAM nodes?** Use Redis, Mnesia, or a distributed ETS approach with `:pg` process groups.

4. **Does the data need strong consistency guarantees?** Use Mnesia with synchronous transactions or etcd.

5. **Is the data access pattern read-heavy?** Configure ETS with `read_concurrency: true`.

6. **Is the data access pattern write-heavy?** Configure ETS with `write_concurrency: true`.

### ETS Table Types

ETS provides four table types, each suited to different access patterns:

| Type | Key Uniqueness | Access Pattern | Use Case |
|------|---------------|----------------|----------|
| `:set` | Unique keys | Point lookups by key | Caches, registries, configuration |
| `:ordered_set` | Unique keys | Range queries, sorted access | Leaderboards, time-series windows |
| `:bag` | Duplicate keys, unique entries | Multiple values per key | Event logs, tagging |
| `:duplicate_bag` | Fully duplicated | All duplicates allowed | Audit trails, raw event storage |

### Performance Characteristics

| Operation | ETS | Redis | PostgreSQL | DynamoDB |
|-----------|-----|-------|------------|----------|
| **Read latency** | ~1 microsecond | ~0.5 ms | ~2-10 ms | ~5-15 ms |
| **Write latency** | ~1 microsecond | ~0.5 ms | ~5-20 ms | ~10-25 ms |
| **Throughput (reads/s)** | ~10M | ~100K | ~10K | ~25K (on-demand) |
| **Persistence** | Memory only (DETS for disk) | Optional (AOF/RDB) | Always | Always |
| **Distribution** | Single node | Cluster | Replication | Global tables |
| **Max size** | Available memory | Available memory | Disk | Unlimited (managed) |

## Comparison

| Feature | ETS | Redis | Memcached | etcd | DynamoDB |
|---------|-----|-------|-----------|------|----------|
| **Data types** | Any Erlang term | Strings, lists, sets, hashes, streams | Strings only | Strings (key-value + directory) | Documents (JSON) |
| **Transactions** | Limited (select/match) | MULTI/EXEC | No | Yes (MVCC) | Yes (transactional writes) |
| **Persistence** | No (use DETS) | Yes (AOF, RDB) | No | Yes (WAL) | Yes (managed) |
| **Clustering** | No (use Mnesia) | Yes (Redis Cluster) | Client-side | Yes (Raft consensus) | Yes (managed) |
| **TTL support** | Manual implementation | Native EXPIRE | Native TTL | Lease-based TTL | Native TTL |
| **Pub/Sub** | No | Yes | No | Watch keys | Streams |
| **Lua scripting** | No | Yes | No | No | No |
| **Access model** | In-process | Network (TCP) | Network (TCP) | Network (gRPC) | Network (HTTP) |

### ETS vs. Redis

ETS is the preferred choice when data is local to a single BEAM node, access latency requirements are in the microsecond range, and the data fits in memory. Redis is preferred when data must be shared across nodes (including non-BEAM applications), persistence is required, or advanced data structures (sorted sets, streams, pub/sub) are needed.

### Key-Value Store vs. Relational Database

Relational databases support complex queries (joins, aggregations, subqueries) and enforce referential integrity. Key-value stores sacrifice query flexibility for raw speed. Use key-value stores for access patterns that always use a known key; use relational databases for access patterns that require searching, filtering, or relating data across entities.

## Best Practices

1. **Design keys deliberately**: Key naming conventions matter. Use structured keys with namespace prefixes: `"agent:config:red-commander"`, `"cache:api:v1:endpoints"`. This enables key scanning, debugging, and access control by prefix.

2. **Set TTLs on cached data**: Every cached value should have an expiration time. Unbounded caches grow until they consume all available memory, then fail catastrophically. Explicit TTLs ensure the cache remains bounded.

3. **Use ETS read_concurrency for read-heavy tables**: The `read_concurrency: true` option optimizes ETS for concurrent reads at a slight cost to write performance. This is the correct choice for caches and registries where reads vastly outnumber writes.

4. **Implement cache stampede protection**: When a popular cache entry expires, multiple concurrent requests may simultaneously attempt to recompute it. Use locking or probabilistic early refresh to prevent stampedes.

5. **Monitor memory usage**: Key-value stores in memory can grow unexpectedly. Monitor ETS table sizes and Redis memory usage. Set alerts when storage approaches capacity limits.

6. **Serialize values efficiently**: When storing complex values, choose serialization carefully. `:erlang.term_to_binary` is fast for BEAM-internal use. JSON is portable across languages. MessagePack is compact and fast for cross-platform binary serialization.

7. **Use the right ETS table type**: `:set` for most use cases, `:ordered_set` only when range queries are needed (it uses a tree instead of a hash table, so point lookups are O(log n) instead of O(1)).

8. **Prefer ETS public tables for shared state**: When multiple processes need to read cached data, use `:public` access rather than routing all reads through a GenServer. The GenServer becomes a bottleneck; ETS handles concurrent reads natively.

## Common Pitfalls

1. **ETS table ownership**: When the process that created an ETS table dies, the table is deleted. Always create ETS tables in a supervised process (typically a GenServer) with a proper supervision strategy to ensure the table survives crashes.

2. **Unbounded growth**: Key-value stores without TTLs or size limits grow until they exhaust memory. Implement eviction policies (LRU, LFU, or TTL-based) for all caches.

3. **Hot keys**: A single key that receives disproportionate traffic becomes a bottleneck. In ETS, `write_concurrency` helps. In Redis, hot keys may require key splitting or read replicas.

4. **Serialization overhead**: Storing large values (megabytes) in a key-value store introduces serialization/deserialization overhead that can negate the speed advantage. Store references to large data rather than the data itself.

5. **Cache invalidation complexity**: Invalidating cached data correctly is notoriously difficult. Stale data serves incorrect results; aggressive invalidation negates caching benefits. Use TTLs as a safety net even when explicit invalidation is implemented.

6. **Missing the abstraction boundary**: Application code that directly calls `:ets.lookup` throughout the codebase becomes impossible to migrate to a different storage backend. Always wrap key-value access behind a module interface.

7. **Ignoring DETS limitations**: DETS (disk-based ETS) has a 2GB file size limit and is significantly slower than ETS. It is suitable for small, persistent datasets but not as a general-purpose persistent key-value store.

8. **Network partition handling**: Distributed key-value stores face the CAP theorem. When a network partition occurs, the store must choose between consistency (rejecting writes) and availability (accepting writes that may conflict). Understand your store's partition behavior before production deployment.

## Use Cases

### API Endpoint Registry

The Prismatic Platform's auto-introspecting API gateway stores discovered endpoints in an ETS-backed key-value store. At boot time, the introspection system scans all facade modules and populates the registry. At runtime, the dispatch controller performs O(1) lookups to route incoming requests to the appropriate module and function.

### Session Management

Web application sessions are a natural fit for key-value storage: each session has a unique identifier (key) and associated state (value). The Prismatic Platform stores Phoenix session data in ETS for single-node deployments and Redis for multi-node deployments, with a behaviour-based adapter pattern for transparent backend switching.

### Rate Limiting

Rate limiters track request counts per client per time window. A key-value store with TTL support implements this efficiently: the key is the client identifier plus time window, the value is the request count, and the TTL matches the window duration. When the TTL expires, the counter is automatically reset.

### Configuration Storage

Application configuration that changes at runtime (feature flags, tuning parameters, A/B test assignments) is stored in key-value stores. ETS provides fast reads with no network overhead, and a GenServer synchronizes configuration changes from an external source (database, config service).

### Circuit Breaker State

Circuit breakers track failure counts and state transitions (closed, open, half-open) per downstream service. A key-value store holds the current state, failure count, and last state transition timestamp for each circuit, enabling O(1) state checks on every outgoing request.

## Related Concepts

Key-value stores connect to many fundamental concepts in data storage and distributed systems:

- [ETS](/glossary/ets/) -- the BEAM virtual machine's built-in key-value store, the primary in-process storage mechanism
- [Redis](/glossary/redis/) -- the most widely used external key-value store, supporting rich data types and persistence
- [Caching](/glossary/caching/) -- the access pattern that key-value stores are most commonly used to implement
- [Mnesia](/glossary/mnesia/) -- Erlang's distributed database that extends ETS with transactions and replication
- [Database](/glossary/database/) -- the broader category of data storage systems that includes key-value stores
- [Distributed Systems](/glossary/distributed-systems/) -- the architectural context where distributed key-value stores operate
- [Performance](/glossary/performance/) -- the primary motivation for choosing key-value stores over more complex storage systems
- [Polyglot Persistence](/glossary/polyglot-persistence/) -- the strategy of using multiple storage types including key-value stores for their respective strengths
- [Prismatic Storage](/glossary/prismatic-storage/) -- the Prismatic Platform's unified storage abstraction that includes key-value backends
- [Connection Pooling](/glossary/connection-pooling/) -- the resource management pattern used with network-based key-value stores like Redis

## See Also

- [ETS Table](/glossary/ets-table/) -- specific ETS table types and their access patterns
- [CAP Theorem](/glossary/cap-theorem/) -- the consistency-availability-partition tolerance trade-off governing distributed key-value stores
- [Eventual Consistency](/glossary/eventual-consistency/) -- the consistency model used by many distributed key-value stores
- [Backpressure](/glossary/backpressure/) -- flow control mechanisms relevant to high-throughput key-value store access
- [Meilisearch](/glossary/meilisearch/) -- full-text search engine used alongside key-value stores for different access patterns

---

*[Prismatic Platform](https://github.com/korczis/prismatic-platform) is an open-source intelligent platform built with Elixir/OTP. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE).*
