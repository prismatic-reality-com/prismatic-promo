+++
title = "Redis"
weight = 32
[extra]
category = "database"
description = "In-memory data store for caching, session management, rate limiting, and pub/sub messaging"
url = "https://redis.io"
version = "7+"
icon = "redis"
color = "red"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 996
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Redis", "In-memory", "technologies", "database", "Prismatic Platform", "None", "HyperLogLog"]
tags = ["technologies", "database", "redis", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Redis - Prismatic Platform"
+++

## Overview

Redis serves as the Prismatic Platform's external caching layer and distributed data structure store. While [ETS](@/technologies/ets.md) handles in-process caching within a single node, Redis provides shared caching across multiple nodes, persistent session storage, rate limiting counters, and distributed locking -- capabilities essential for the platform's clustered deployment on [Fly.io](@/technologies/flyio.md) where multiple instances must share state.

The Prismatic Platform uses Redis for API response caching (reducing [PostgreSQL](@/technologies/postgresql.md) load by 80%+), distributed rate limiting (ensuring fair API usage across all nodes), session storage for web authentication, and as a backing store for [Phoenix PubSub](@/technologies/pubsub.md) in multi-node deployments where Distributed Erlang is unavailable. Redis complements the platform's primary data stores by providing sub-millisecond access to frequently requested data without touching the database.

Redis's data structures -- strings, hashes, lists, sets, sorted sets, streams, and HyperLogLog -- provide purpose-built tools for each caching scenario. The platform uses sorted sets for security rating leaderboards, hashes for session data, strings with TTL for response caches, and HyperLogLog for unique visitor counting in the Hawkeye visitor intelligence module. Each data structure is chosen for its specific operational characteristics rather than using Redis as a generic key-value store.

## Key Features

- **Sub-Millisecond Latency**: In-memory operations with ~0.1ms response times for cache hits, providing near-instantaneous data retrieval
- **Rich Data Structures**: Strings, hashes, lists, sets, sorted sets, streams, and HyperLogLog -- each optimized for specific access patterns
- **Pub/Sub**: Message broadcasting for distributed event notification across cluster nodes, used as an alternative PubSub adapter
- **Lua Scripting**: Atomic server-side scripting for complex multi-step operations like rate limiting that must execute without race conditions
- **Persistence**: RDB snapshots and AOF (append-only file) for durability across restarts, ensuring cached data survives Redis restarts
- **Clustering**: Built-in sharding and replication for horizontal scaling in production environments
- **TTL Management**: Per-key expiration for automatic cache invalidation without manual cleanup or cron-based purging
- **Pipelining**: Batch multiple commands in a single round-trip for reduced network overhead on bulk operations

## Platform Integration

Redis provides distributed caching with automatic expiration and rate limiting with atomic Lua scripts.

```elixir
defmodule PrismaticApi.Cache.ResponseCache do
  @moduledoc "Redis-backed response cache with automatic TTL expiration"
  @ttl_seconds 300

  @doc "Fetch from cache or execute function and cache the result"
  def get_or_fetch(cache_key, fetch_fn) do
    case Redix.command(:redix, ["GET", cache_key]) do
      {:ok, nil} ->
        {:ok, result} = fetch_fn.()
        encoded = Jason.encode!(result)
        Redix.command(:redix, ["SETEX", cache_key, @ttl_seconds, encoded])
        {:ok, result}

      {:ok, cached} ->
        {:ok, Jason.decode!(cached)}
    end
  end

  @doc "Invalidate all cache keys matching a pattern"
  def invalidate(pattern) do
    {:ok, keys} = Redix.command(:redix, ["KEYS", pattern])
    if keys != [], do: Redix.command(:redix, ["DEL" | keys])
    :ok
  end

  @doc "Cache with custom TTL for different data freshness requirements"
  def cache_with_ttl(key, value, ttl_seconds) do
    Redix.command(:redix, ["SETEX", key, ttl_seconds, Jason.encode!(value)])
  end
end
```

The rate limiter uses an atomic Lua script to prevent race conditions across concurrent requests from multiple nodes:

```elixir
defmodule PrismaticApi.RateLimiter do
  @moduledoc "Distributed rate limiting using Redis Lua scripting"

  @rate_limit_script """
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, window)
  end
  return current <= limit and 1 or 0
  """

  @doc "Check if a client has exceeded their rate limit"
  def check_rate(client_id, limit \\ 100, window_seconds \\ 60) do
    key = "rate:#{client_id}:#{div(System.system_time(:second), window_seconds)}"

    case Redix.command(:redix, ["EVAL", @rate_limit_script, 1, key, limit, window_seconds]) do
      {:ok, 1} -> :ok
      {:ok, 0} -> {:error, :rate_limited}
    end
  end
end
```

Redis also supports the platform's session management and security rating leaderboard:

```elixir
defmodule PrismaticWeb.SessionStore do
  @moduledoc "Redis-backed session storage for distributed web authentication"
  @session_ttl 86_400

  def store_session(session_id, user_data) do
    Redix.command(:redix, [
      "HSET", "session:#{session_id}",
      "user_id", user_data.id,
      "email", user_data.email,
      "role", to_string(user_data.role)
    ])
    Redix.command(:redix, ["EXPIRE", "session:#{session_id}", @session_ttl])
  end

  def get_session(session_id) do
    case Redix.command(:redix, ["HGETALL", "session:#{session_id}"]) do
      {:ok, []} -> {:error, :session_not_found}
      {:ok, fields} -> {:ok, Enum.chunk_every(fields, 2) |> Map.new(fn [k, v] -> {k, v} end)}
    end
  end
end
```

## Architecture

Redis occupies the caching and coordination layer between the application processes and the primary [PostgreSQL](@/technologies/postgresql.md) database.

| Layer | Purpose | Data Structure |
|-------|---------|----------------|
| **Response Cache** | API response caching (5-minute TTL) | String with SETEX |
| **Rate Limiting** | Per-client request counting (sliding window) | String with INCR + EXPIRE |
| **Session Store** | User authentication sessions (24-hour TTL) | Hash with HSET/HGETALL |
| **Leaderboard** | Security rating rankings | Sorted Set with ZADD/ZRANGE |
| **Visitor Counting** | Unique visitor estimation | HyperLogLog with PFADD/PFCOUNT |
| **PubSub Adapter** | Cross-node event distribution | Pub/Sub channels |
| **Distributed Lock** | Exclusive resource access across nodes | String with SET NX EX |

## Redis Streams for Event Ordering

The platform uses Redis Streams for ordered event logging in scenarios where PubSub's at-most-once delivery is insufficient. Security scan results, for example, are appended to Redis Streams so that late-joining consumers can replay recent events, ensuring no scan results are missed during brief service interruptions or rolling deployments across the cluster.

```elixir
defmodule PrismaticPerimeter.EventStream do
  @moduledoc "Redis Streams for ordered security event logging"
  @stream_key "perimeter:events"
  @max_stream_length 10_000

  def append_event(event_type, payload) do
    Redix.command(:redix, [
      "XADD", @stream_key, "MAXLEN", "~", @max_stream_length, "*",
      "type", event_type,
      "payload", Jason.encode!(payload),
      "timestamp", DateTime.to_iso8601(DateTime.utc_now())
    ])
  end

  def read_since(last_id \\ "0-0", count \\ 100) do
    case Redix.command(:redix, ["XRANGE", @stream_key, last_id, "+", "COUNT", count]) do
      {:ok, entries} -> {:ok, parse_entries(entries)}
      error -> error
    end
  end

  defp parse_entries(entries) do
    Enum.map(entries, fn [id, fields] ->
      %{id: id, data: Enum.chunk_every(fields, 2) |> Map.new(fn [k, v] -> {k, v} end)}
    end)
  end
end
```

## Distributed Locking

The platform uses Redis distributed locks (via the SET NX EX pattern) to coordinate exclusive operations across cluster nodes. This is used for operations like scheduled security scans where only one node should execute the scan at a time, and for cache warming operations that should not run concurrently.

```elixir
defmodule PrismaticApi.DistributedLock do
  @moduledoc "Redis-based distributed locking for cross-node coordination"

  def with_lock(resource, ttl_seconds \\ 30, fun) do
    lock_key = "lock:#{resource}"
    lock_value = :crypto.strong_rand_bytes(16) |> Base.encode64()

    case Redix.command(:redix, ["SET", lock_key, lock_value, "NX", "EX", ttl_seconds]) do
      {:ok, "OK"} ->
        try do
          fun.()
        after
          release_lock(lock_key, lock_value)
        end

      {:ok, nil} ->
        {:error, :lock_held}
    end
  end

  defp release_lock(key, expected_value) do
    script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
    Redix.command(:redix, ["EVAL", script, 1, key, expected_value])
  end
end
```

## Performance Characteristics

Redis delivers consistent sub-millisecond performance for all core operations, making it suitable for the platform's latency-sensitive caching requirements.

| Metric | Value | Notes |
|--------|-------|-------|
| GET/SET latency | ~0.1ms | Single key operations |
| Lua script execution | ~0.2ms | Rate limit check (EVAL) |
| HGETALL latency | ~0.15ms | Session retrieval |
| Pipeline throughput | 500K+ ops/s | Batched commands |
| Memory per key | ~80 bytes overhead | Plus value size |
| Max connections | 10,000 | Default, configurable |
| Eviction policy | allkeys-lru | Under memory pressure |
| Cache hit ratio | 85%+ | API response cache (measured) |

## Configuration

```elixir
# config/config.exs
config :prismatic, :redis,
  url: System.get_env("REDIS_URL", "redis://localhost:6379"),
  pool_size: 5,
  ssl: Mix.env() == :prod

# Redis as PubSub adapter (alternative to PG2)
config :prismatic_web, PrismaticWeb.PubSub,
  adapter: Phoenix.PubSub.Redis,
  url: System.get_env("REDIS_URL")

# config/prod.exs - Production Redis with SSL and connection pooling
config :prismatic, :redis,
  url: System.get_env("REDIS_URL"),
  pool_size: String.to_integer(System.get_env("REDIS_POOL_SIZE", "10")),
  ssl: true,
  socket_opts: [verify: :verify_peer, cacerts: :public_key.cacerts_get()]
```

The Redix connection pool is started in the application supervision tree:

```elixir
defmodule PrismaticApi.Application do
  use Application

  def start(_type, _args) do
    redis_url = Application.get_env(:prismatic, :redis)[:url]

    children = [
      {Redix, name: :redix, host: redis_url}
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

## Best Practices

- **Set TTLs on all cache keys** -- unbounded caches grow until they consume all available memory; every key should expire
- **Use Lua scripts for atomic operations** -- rate limiting and conditional updates must be atomic to avoid race conditions across nodes
- **Prefer [ETS](@/technologies/ets.md) for single-node caching** -- ETS has zero network overhead and is faster for local-only data that does not need cross-node sharing
- **Monitor memory usage** -- configure `maxmemory-policy allkeys-lru` in production to evict least-recently-used keys under memory pressure
- **Use connection pooling** -- the Redix library pool prevents connection exhaustion under concurrent load from multiple application processes
- **Avoid `KEYS` in production** -- the `KEYS` command scans all keys and blocks the Redis event loop; use `SCAN` for production key enumeration
- **Separate cache from persistent data** -- use different Redis instances or databases for ephemeral caches versus session data that should survive restarts

## Comparison with Alternatives

| Feature | Redis | Memcached | ETS (Elixir) | Cachex (Elixir) |
|---------|-------|-----------|--------------|-----------------|
| Data structures | Rich (strings, hashes, sets, sorted sets, streams) | Key-value only | Key-value, ordered set, bag | Key-value with TTL |
| Persistence | RDB + AOF | None | Process lifetime | Process lifetime |
| Distribution | Cluster mode, replication | Consistent hashing | Single node only | Single node only |
| Scripting | Lua scripts | None | None (use Elixir code) | None |
| Pub/Sub | Built-in | None | None | None |
| Memory overhead | ~80 bytes/key | ~48 bytes/key | ~60 bytes/entry | ~100 bytes/entry |
| Network | Required (TCP) | Required (TCP) | None (in-process) | None (in-process) |
| Platform role | Distributed cache + coordination | Not used | Local cache + registry | Not used |

Redis is used alongside ETS in the Prismatic Platform: ETS for hot-path, single-node caching (endpoint registry, compiled patterns), and Redis for cross-node state that must be consistent across the cluster (sessions, rate limits, response cache).

## Related Technologies

- [ETS](@/technologies/ets.md) - In-process memory cache for single-node operations without network overhead
- [PostgreSQL](@/technologies/postgresql.md) - Persistent relational data store that Redis caches accelerate
- [Phoenix PubSub](@/technologies/pubsub.md) - Distributed messaging with Redis adapter for non-Distributed-Erlang environments
- [Docker](@/technologies/docker.md) - Redis container in the development stack

## Related Apps

- [prismatic_api](@/apps/prismatic-api.md) - API response caching and rate limiting
- [prismatic_web](@/apps/prismatic-web.md) - Session storage and PubSub backing
- [prismatic_storage_redis](@/apps/prismatic-storage-redis.md) - Redis storage adapter implementation
- [prismatic_visitor_intelligence](@/apps/prismatic-visitor-intelligence.md) - HyperLogLog unique visitor counting

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)