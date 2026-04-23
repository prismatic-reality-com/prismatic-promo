+++
title = "ETS"
weight = 31
[extra]
category = "database"
description = "Erlang Term Storage - high-performance in-memory storage built into the BEAM virtual machine"
url = "https://www.erlang.org/doc/man/ets.html"
version = "Built-in"
icon = "ets"
color = "red"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1077
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ETS", "Erlang", "Term", "Storage", "BEAM", "technologies", "database", "Prismatic Platform", "Milliseconds", "GenServer"]
tags = ["technologies", "database", "ets", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "ETS - Prismatic Platform"
+++

## Overview

ETS (Erlang Term Storage) is the high-performance in-memory data store built directly into the [BEAM](/technologies/beam/) virtual machine. The Prismatic Platform uses ETS extensively for caching, registries, real-time state management, and high-throughput data that does not require disk persistence. ETS tables provide O(1) lookups and can handle millions of reads per second without any external dependencies -- no network latency, no serialization overhead, and no separate process to manage. Data lives directly in the BEAM's memory space, accessible from any process.

The platform uses ETS for its agent registry (tracking 404+ agent states), API endpoint discovery cache, session data, rate limiter state, and real-time metrics aggregation. ETS's ability to be shared across processes (unlike process state in GenServers) makes it ideal for data that needs to be accessed by multiple agents or request handlers simultaneously without bottlenecking on a single process's mailbox. This is particularly important for hot-path operations like API endpoint resolution, where every request must look up routing information.

ETS supports multiple table types -- set, ordered_set, bag, and duplicate_bag -- each optimized for different access patterns. The platform leverages ordered_sets for priority queues and time-ordered data, sets for key-value caches, and bags for multi-value indexes. Combined with match specifications (compiled pattern matching queries), ETS provides a query language that approaches the flexibility of a database while maintaining in-memory performance.

## Key Features

ETS provides a rich set of capabilities for in-memory data management that go beyond simple key-value storage.

- **O(1) Lookups**: Constant-time key-based access for set and bag types using hash tables
- **Concurrent Access**: Built-in read and write concurrency options with fine-grained locking
- **Table Types**: Set (unique keys), ordered_set (sorted), bag (multiple values per key), duplicate_bag (including duplicates)
- **Match Specifications**: Compiled pattern matching for efficient server-side filtering without copying all data
- **No Serialization**: Native Erlang term storage without encoding/decoding overhead -- any Elixir term can be stored directly
- **Memory Management**: Configurable memory limits with heir mechanisms for table ownership transfer on process death
- **Atomic Operations**: `update_counter` and `insert_new` for lock-free atomic updates on concurrent tables
- **Select and Match**: SQL-like query capabilities through `ets:select/2` with compiled match specifications

| Table Type | Key Behavior | Ordering | Platform Usage |
|------------|-------------|----------|----------------|
| `:set` | Unique keys, last write wins | Unordered | Agent registry, endpoint cache |
| `:ordered_set` | Unique keys, sorted | Key-ordered | Priority queues, time-series |
| `:bag` | Multiple values per key | Unordered | Multi-value indexes, tag lookups |
| `:duplicate_bag` | Allows identical entries | Unordered | Event logging, audit trails |

## Platform Integration

ETS powers caching, registries, and high-speed state management across the platform. The API endpoint registry demonstrates a typical ETS usage pattern with process ownership and concurrent access.

```elixir
defmodule PrismaticApi.EndpointRegistry do
  @moduledoc """
  ETS-backed API endpoint registry for O(1) route resolution.
  Populated at boot time by scanning all Prismatic facade modules.
  """

  @table :api_endpoint_registry

  @spec init() :: :ets.tid()
  def init do
    :ets.new(@table, [
      :named_table,
      :set,
      :public,
      read_concurrency: true
    ])
  end

  @spec register(String.t(), String.t(), module(), atom(), non_neg_integer()) :: true
  def register(app, action, module, function, arity) do
    :ets.insert(@table, {{app, action}, module, function, arity})
  end

  @spec lookup(String.t(), String.t()) :: {:ok, {module(), atom(), non_neg_integer()}} | {:error, :not_found}
  def lookup(app, action) do
    case :ets.lookup(@table, {app, action}) do
      [{_key, module, function, arity}] -> {:ok, {module, function, arity}}
      [] -> {:error, :not_found}
    end
  end

  @spec all_endpoints() :: [{tuple(), module(), atom(), non_neg_integer()}]
  def all_endpoints do
    :ets.tab2list(@table)
  end

  @spec count() :: non_neg_integer()
  def count do
    :ets.info(@table, :size)
  end
end
```

The platform also uses ETS for rate limiting with atomic counters, avoiding the bottleneck of routing all rate checks through a single GenServer:

```elixir
defmodule PrismaticWeb.RateLimiter do
  @moduledoc "ETS-backed rate limiter using atomic counters for lock-free operation."

  @table :rate_limiter
  @window_seconds 60
  @max_requests 100

  @spec init() :: :ets.tid()
  def init do
    :ets.new(@table, [
      :named_table,
      :public,
      :set,
      write_concurrency: true
    ])
  end

  @spec check_rate(String.t()) :: :ok | {:error, :rate_limited}
  def check_rate(client_id) do
    window = div(System.system_time(:second), @window_seconds)
    key = {client_id, window}

    case :ets.update_counter(@table, key, {2, 1}, {key, 0}) do
      count when count <= @max_requests -> :ok
      _ -> {:error, :rate_limited}
    end
  end
end
```

## Architecture

ETS occupies a specific niche in the platform's data storage hierarchy, providing the fastest possible access for data that can tolerate loss on process restart (since ETS tables are destroyed when their owner process dies).

| Storage Layer | Technology | Access Time | Persistence | Platform Usage |
|--------------|------------|-------------|-------------|----------------|
| Process State | GenServer | Microseconds | None (process lifetime) | Agent-specific state |
| **In-Memory** | **ETS** | **Microseconds** | **None (table lifetime)** | **Registries, caches, rate limits** |
| In-Memory (distributed) | Horde/Mnesia | Milliseconds | Optional (disk copies) | Cluster-wide state |
| Search Index | Meilisearch | Milliseconds | Disk-backed | Full-text search |
| Persistent | [PostgreSQL](/technologies/postgresql/) | Milliseconds | Full ACID | Business data, audit trails |
| Graph | KuzuDB | Milliseconds | Disk-backed | Relationship queries |

ETS tables are owned by a process (typically a GenServer or Supervisor). If the owning process crashes, the table is destroyed. The platform mitigates this by using the `:heir` option to transfer table ownership to a supervisor on crash, or by using named tables owned by long-lived application supervisors that are guaranteed to outlive their data's usefulness.

## Performance Characteristics

ETS performance is exceptional for in-memory operations, with O(1) lookup times and the ability to handle millions of operations per second from concurrent processes.

| Operation | Typical Latency | Throughput |
|-----------|----------------|------------|
| Lookup (single key) | < 1 microsecond | 10M+ reads/second |
| Insert (single row) | < 1 microsecond | 5M+ writes/second |
| Update counter (atomic) | < 1 microsecond | 5M+ ops/second |
| Select with match spec | 1-100 microseconds | Depends on table size |
| `tab2list` (full scan) | Proportional to table size | Avoid on large tables |
| Memory per entry | ~50-200 bytes | Depends on term size |

The `read_concurrency: true` and `write_concurrency: true` options enable fine-grained locking that allows multiple processes to read and write simultaneously without contention. The `decentralized_counters: true` option (OTP 25+) further improves counter performance by distributing counter state across schedulers.

## Configuration

ETS tables are created with options that control access patterns, concurrency behavior, and memory management.

```elixir
# High-read cache with concurrent access
:ets.new(:prismatic_cache, [
  :named_table,
  :public,
  :set,
  read_concurrency: true,
  write_concurrency: true,
  decentralized_counters: true
])

# Ordered set for time-series data
:ets.new(:metrics_timeline, [
  :named_table,
  :protected,  # Owner writes, anyone reads
  :ordered_set
])

# Table with heir for crash resilience
:ets.new(:critical_registry, [
  :named_table,
  :public,
  :set,
  {:heir, supervisor_pid, :registry_recovery}
])
```

## Best Practices

The platform enforces ETS usage conventions that prevent common pitfalls and ensure optimal performance.

- **Use `:read_concurrency` for read-heavy tables** -- enables optimized locking for tables with many readers and few writers
- **Use `:write_concurrency` for write-heavy tables** -- reduces lock contention when multiple processes write simultaneously
- **Own tables from Supervisors** -- if a GenServer owns a table and crashes, the table is lost; own from a supervisor or use `:heir`
- **Avoid `tab2list` on large tables** -- this copies the entire table into the calling process's memory; use match specifications instead
- **Use `update_counter` for atomic increments** -- avoids read-modify-write race conditions in concurrent access patterns
- **Set access to `:protected` by default** -- allows any process to read but only the owner to write, preventing accidental mutations
- **Name tables with atoms** -- use `:named_table` for global access; avoid creating tables with dynamic names (atom table exhaustion)
- **Monitor table memory** -- use `:ets.info(table, :memory)` to track memory growth and implement eviction strategies

## Comparison

ETS was chosen as the platform's primary in-memory store because it is built into the BEAM runtime, requires no external dependencies, and provides the lowest possible access latency.

| Criterion | ETS | Redis | Memcached | Process State |
|-----------|-----|-------|-----------|---------------|
| Access latency | Microseconds | Milliseconds (network) | Milliseconds (network) | Microseconds |
| External dependency | No (built-in) | Yes (server) | Yes (server) | No (built-in) |
| Concurrent access | Native (fine-grained locks) | Single-threaded | Multi-threaded | Single process only |
| Persistence | None (memory only) | Optional (RDB/AOF) | None | None |
| Data types | Any Erlang term | Strings, lists, sets, etc. | Strings only | Any Erlang term |
| Query capability | Match specifications | Commands | Key-value only | Pattern matching |
| Clustering | Same node only | Redis Cluster | Consistent hashing | Same process only |
| Memory overhead | Minimal | Moderate | Moderate | Minimal |

## Related Technologies

- [BEAM VM](/technologies/beam/) - The runtime providing ETS as a built-in data structure
- [Erlang/OTP](/technologies/erlang-otp/) - The platform providing ETS alongside other storage primitives (DETS, Mnesia)
- [PostgreSQL](/technologies/postgresql/) - Persistent storage complement for data requiring ACID guarantees
- [GenServer](/technologies/genserver/) - Process abstraction that often owns and manages ETS tables
- [Elixir](/technologies/elixir/) - Language providing ergonomic access to ETS through `:ets` module

## Related Apps

- [prismatic_storage_ets](/apps/prismatic-storage-ets/) - ETS adapter implementing the platform's storage behavior trait
- [prismatic_api](/apps/prismatic-api/) - Endpoint registry cache for O(1) API route resolution
- [prismatic_agents](/apps/prismatic-agents/) - Agent state registry tracking 404+ concurrent agent processes
- [prismatic_web](/apps/prismatic-web/) - Session and rate limiting state for request handling

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)