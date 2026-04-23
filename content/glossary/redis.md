+++
title = "Redis"
weight = 12
[extra]
category = "infrastructure"
description = "In-memory data structure store used for caching, session management, PubSub messaging, rate limiting, and distributed coordination in the Prismatic Platform"
related_terms = ["ets", "postgresql", "pubsub", "connection-pooling", "cluster", "backpressure", "distributed-system", "rate-limiting"]
domain = "data-infrastructure"
complexity = "intermediate"
maturity = "production"
platform_adoption = "universal"
elixir_modules = ["PrismaticCache", "PrismaticRateLimiter", "PrismaticStorageRedis"]
client_library = "Redix"
data_structures = ["string", "hash", "list", "set", "sorted-set", "stream", "bitmap", "hyperloglog"]
caching_patterns = ["cache-aside", "write-through", "write-behind"]
persistence_modes = ["RDB", "AOF", "RDB+AOF", "none"]
ha_modes = ["Sentinel", "Cluster"]
performance_profile = "sub-millisecond"
memory_model = "in-memory"
protocol = "RESP"
default_port = 6379
use_cases = ["caching", "sessions", "rate-limiting", "pubsub", "distributed-locks", "feature-flags", "job-queues"]
enforcement_level = "recommended"
documentation_quality = "academic"
last_updated = "2026-02-22"
version = "2.0.0"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1994
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Redis", "In-memory", "PubSub", "Prismatic", "Platform", "glossary", "infrastructure", "Prismatic Platform"]
tags = ["glossary", "infrastructure", "redis", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Redis - Prismatic Platform"
+++

## Definition and Overview

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that functions as a database, cache, message broker, and streaming engine. Originally created by Salvatore Sanfilippo in 2009, Redis has become one of the most widely deployed infrastructure components in modern distributed systems. Its defining characteristic is that all data resides in memory, enabling sub-millisecond read and write latency that is orders of magnitude faster than disk-based storage systems.

Unlike simple key-value caches such as Memcached, Redis provides a rich collection of native data structures -- strings, hashes, lists, sets, sorted sets, bitmaps, hyperloglogs, geospatial indexes, and streams -- each with dedicated atomic operations. This structural richness transforms Redis from a flat cache into a versatile data platform capable of implementing leaderboards (sorted sets), rate limiters (atomic counters with expiry), job queues (lists with blocking pops), and real-time analytics (hyperloglogs and streams) without external application logic.

Redis also supports optional persistence through RDB (point-in-time snapshots) and AOF (append-only file logging), enabling data survival across restarts. For high availability, Redis Sentinel provides automatic failover monitoring, while Redis Cluster offers horizontal sharding across multiple nodes with automatic partition tolerance. These features position Redis as both an ephemeral acceleration layer and, when configured appropriately, a durable data store for specific workloads.

Within the Prismatic Platform, Redis serves as a high-speed acceleration layer complementing [PostgreSQL](@/glossary/postgresql.md) for persistent storage and [ETS](@/glossary/ets.md) for node-local caching. It handles cross-node communication, distributed state, rate limiting, and session management -- workloads where sub-millisecond latency and atomic operations are essential.

## Historical Context and Evolution

Salvatore Sanfilippo created Redis in 2009 to solve a specific problem: his real-time web analytics startup needed a data store faster than MySQL for tracking page views and visitor statistics. The initial implementation supported only strings and lists, but the simplicity and performance attracted rapid adoption. By 2010, VMware sponsored Redis development, and the project grew its data structure repertoire to include sets, sorted sets, and hashes.

Redis 2.0 (2010) introduced the Pub/Sub system and virtual memory. Redis 2.6 (2012) added Lua scripting for server-side computation. Redis 3.0 (2015) delivered Redis Cluster for horizontal scaling. Redis 5.0 (2018) introduced Streams, providing Kafka-like append-only log functionality. Redis 6.0 (2020) added I/O threading for network operations, significantly improving throughput on multi-core machines while maintaining single-threaded command execution for atomicity.

The Redis ecosystem underwent significant governance changes in 2024 when Redis Labs changed the license from BSD to dual-licensed (RSALv2 + SSPLv1), prompting community forks including Valkey (led by the Linux Foundation) and Redict. The Prismatic Platform monitors these developments and maintains compatibility with both Redis and its open-source forks through the Redix client library's protocol-level abstraction.

## Core Data Structures

Redis's power derives from its native data structures, each optimized for specific access patterns and backed by efficient in-memory representations.

| Structure | Description | Common Operations | Use Case |
|-----------|-------------|-------------------|----------|
| **String** | Binary-safe byte sequence up to 512MB | `GET`, `SET`, `INCR`, `APPEND` | Caching, counters, simple values |
| **Hash** | Field-value map within a single key | `HGET`, `HSET`, `HMGET`, `HINCRBY` | Object storage, user profiles |
| **List** | Ordered sequence with O(1) push/pop | `LPUSH`, `RPOP`, `LRANGE`, `BLPOP` | Job queues, activity feeds |
| **Set** | Unordered collection of unique members | `SADD`, `SMEMBERS`, `SINTER`, `SUNION` | Tags, unique tracking, set operations |
| **Sorted Set** | Set with floating-point score per member | `ZADD`, `ZRANGE`, `ZRANGEBYSCORE` | Leaderboards, priority queues |
| **Stream** | Append-only log with consumer groups | `XADD`, `XREAD`, `XREADGROUP` | Event streaming, audit logs |
| **Bitmap** | Bit-level operations on strings | `SETBIT`, `GETBIT`, `BITCOUNT` | Feature flags, presence tracking |
| **HyperLogLog** | Probabilistic cardinality estimation | `PFADD`, `PFCOUNT`, `PFMERGE` | Unique visitor counting |

## Caching Patterns

Redis excels as a caching layer, and several established patterns govern how caches interact with primary data stores like [PostgreSQL](@/glossary/postgresql.md).

**Cache-Aside (Lazy Loading)** is the most common pattern: the application checks Redis first, and on a cache miss, queries the primary database, stores the result in Redis with a TTL (time-to-live), and returns the data. This pattern ensures Redis only contains data that has actually been requested, minimizing memory usage.

**Write-Through** caching writes data to both Redis and the primary store simultaneously, guaranteeing cache freshness at the cost of higher write latency. **Write-Behind (Write-Back)** inverts this by writing to Redis immediately and asynchronously persisting to the database, optimizing write throughput but introducing a window of potential data loss.

```elixir
defmodule PrismaticCache do
  @moduledoc """
  Cache-aside pattern implementation using Redis via Redix.
  Provides transparent caching with configurable TTL,
  automatic serialization, and telemetry integration.
  """

  @default_ttl_seconds 300

  @spec fetch(String.t(), keyword(), (-> term())) :: {:ok, term()} | {:error, term()}
  def fetch(key, opts \\ [], fallback_fn) do
    ttl = Keyword.get(opts, :ttl, @default_ttl_seconds)

    case Redix.command(:redis, ["GET", key]) do
      {:ok, nil} ->
        value = fallback_fn.()
        serialized = :erlang.term_to_binary(value)

        case Redix.command(:redis, ["SETEX", key, ttl, serialized]) do
          {:ok, "OK"} ->
            :telemetry.execute([:prismatic, :cache, :miss], %{key: key}, %{ttl: ttl})
            {:ok, value}

          {:error, reason} ->
            {:error, {:cache_write_failed, reason}}
        end

      {:ok, binary} ->
        :telemetry.execute([:prismatic, :cache, :hit], %{key: key}, %{})
        {:ok, :erlang.binary_to_term(binary)}

      {:error, reason} ->
        {:error, {:cache_read_failed, reason}}
    end
  end

  @spec invalidate(String.t()) :: :ok | {:error, term()}
  def invalidate(key) do
    case Redix.command(:redis, ["DEL", key]) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  @spec invalidate_pattern(String.t()) :: {:ok, non_neg_integer()} | {:error, term()}
  def invalidate_pattern(pattern) do
    case Redix.command(:redis, ["KEYS", pattern]) do
      {:ok, []} ->
        {:ok, 0}

      {:ok, keys} ->
        case Redix.command(:redis, ["DEL" | keys]) do
          {:ok, count} -> {:ok, count}
          {:error, reason} -> {:error, reason}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

**Cache Invalidation** remains one of the hardest problems in [distributed systems](@/glossary/distributed-system.md). Common strategies include TTL-based expiry (simple but allows stale reads), event-driven invalidation (accurate but complex), and versioned keys (append version numbers to cache keys, increment on mutation).

## Pub/Sub Messaging

Redis includes a built-in [publish-subscribe](@/glossary/pubsub.md) messaging system that enables real-time communication between processes. Publishers send messages to named channels, and all subscribers listening on those channels receive the messages instantly. Unlike Redis's data structures, Pub/Sub messages are fire-and-forget -- they are not persisted, and subscribers who are not connected at the time of publication will miss the message.

```elixir
defmodule PrismaticPubSub.RedisTransport do
  @moduledoc """
  Redis-backed PubSub transport for cross-node event propagation.
  Enables real-time event distribution across cluster nodes
  through Redis Pub/Sub channels.
  """

  @spec publish(String.t(), term()) :: :ok | {:error, term()}
  def publish(channel, message) do
    encoded = Jason.encode!(message)

    case Redix.command(:redis, ["PUBLISH", channel, encoded]) do
      {:ok, _subscriber_count} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  @spec subscribe(String.t(), pid()) :: {:ok, reference()} | {:error, term()}
  def subscribe(channel, listener_pid) do
    {:ok, pubsub} = Redix.PubSub.start_link()

    case Redix.PubSub.subscribe(pubsub, channel, listener_pid) do
      {:ok, ref} -> {:ok, ref}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

For durable messaging where message loss is unacceptable, Redis Streams provide an alternative with consumer groups, acknowledgment tracking, and message persistence. Streams function as append-only logs where multiple consumer groups can independently read and process messages at their own pace, similar to Apache Kafka's consumer group model.

| Feature | Pub/Sub | Streams |
|---------|---------|---------|
| **Persistence** | None (fire-and-forget) | Persistent until explicitly trimmed |
| **Consumer Groups** | No | Yes, with acknowledgment |
| **Message Replay** | Not possible | Full replay from any position |
| **Backpressure** | None (subscribers must keep up) | Consumer-controlled read rate |
| **Use Case** | Real-time notifications | Event sourcing, job processing |

## Session and Rate Limiting

Redis's combination of atomic operations, key expiry, and sub-millisecond latency makes it the standard choice for web session storage and rate limiting. Sessions are stored as Redis hashes with a TTL matching the desired session lifetime.

```elixir
defmodule PrismaticRateLimiter do
  @moduledoc """
  Sliding window rate limiter using Redis atomic operations.
  Provides per-client fairness guarantees with configurable
  window size and request limits.
  """

  @default_window_seconds 60
  @default_max_requests 100

  @spec check_rate(String.t(), keyword()) :: :allow | :deny
  def check_rate(client_id, opts \\ []) do
    window = Keyword.get(opts, :window_seconds, @default_window_seconds)
    max_requests = Keyword.get(opts, :max_requests, @default_max_requests)
    key = "rate:#{client_id}:#{div(System.system_time(:second), window)}"

    case Redix.pipeline(:redis, [
      ["INCR", key],
      ["EXPIRE", key, window]
    ]) do
      {:ok, [count, _]} when count <= max_requests ->
        :telemetry.execute([:prismatic, :rate_limit, :allowed], %{count: count}, %{client: client_id})
        :allow

      {:ok, _} ->
        :telemetry.execute([:prismatic, :rate_limit, :denied], %{}, %{client: client_id})
        :deny

      {:error, _reason} ->
        :allow
    end
  end
end
```

Beyond sessions and rate limiting, Redis manages several categories of ephemeral state:

- **Distributed Locks**: The Redlock algorithm coordinates exclusive access across [distributed system](@/glossary/distributed-system.md) nodes
- **Feature Flags**: Simple key-value toggles with instant propagation across all application instances
- **Temporary Tokens**: One-time-use tokens (password reset, email verification) with automatic expiry
- **[Backpressure](@/glossary/backpressure.md) Counters**: Atomic counters tracking queue depth for flow control decisions

## Persistence and Durability

While Redis is fundamentally an in-memory store, it offers two persistence mechanisms for data durability across restarts.

| Mechanism | Description | Tradeoffs |
|-----------|-------------|-----------|
| **RDB (Snapshotting)** | Point-in-time binary snapshots at configurable intervals | Fast recovery, potential data loss between snapshots |
| **AOF (Append-Only File)** | Logs every write operation to disk | Minimal data loss, larger files, slower recovery |
| **RDB + AOF** | Combined approach using both mechanisms | Best durability with fast recovery via RDB and completeness via AOF |
| **No Persistence** | Pure in-memory mode | Zero disk I/O overhead, data lost on restart |

For cache-only deployments where data can be reconstructed from the primary database, disabling persistence entirely eliminates disk I/O overhead and maximizes throughput.

## Clustering and High Availability

Redis offers two complementary high-availability solutions:

**Redis Sentinel** monitors Redis instances and performs automatic failover when a primary node fails. Sentinel nodes form a quorum to agree on failure detection, then promote a replica to primary and reconfigure clients.

**Redis Cluster** provides horizontal sharding across multiple nodes, distributing data across 16,384 hash slots. Each node owns a subset of slots and handles requests for keys mapping to those slots.

| Feature | Sentinel | Cluster |
|---------|----------|---------|
| **Sharding** | No (single dataset) | Yes (16,384 hash slots) |
| **Failover** | Automatic with quorum | Automatic per shard |
| **Scaling** | Vertical only | Horizontal across nodes |
| **Multi-Key Ops** | All keys accessible | Only within same hash slot |
| **Complexity** | Lower | Higher |

## Usage in Prismatic Platform

The Prismatic Platform uses Redis as a high-speed acceleration layer complementing [PostgreSQL](@/glossary/postgresql.md) as the primary persistent store and [ETS](@/glossary/ets.md) for node-local caching.

**API Response Caching**: The `prismatic_api` application caches endpoint discovery results in Redis, avoiding recomputation of expensive module introspection on every request. Cache entries carry TTLs aligned with deployment cycles, and cache invalidation triggers on application restarts.

**Rate Limiting**: API gateway rate limiting uses Redis atomic counters with sliding window algorithms, protecting backend services from traffic spikes while providing per-client fairness guarantees.

**Distributed PubSub Transport**: Redis Pub/Sub serves as a transport layer for [Phoenix.PubSub](@/glossary/pubsub.md) in multi-node deployments, enabling real-time event propagation across [cluster](@/glossary/cluster.md) nodes. LiveView dashboard updates, agent state changes, and security alerts broadcast through Redis-backed PubSub channels.

**Session Storage**: Web sessions for the LiveView dashboards are stored in Redis with automatic expiry, keeping session data close to the application tier for minimal lookup latency.

**Ephemeral State**: Temporary computation results, [backpressure](@/glossary/backpressure.md) counters, and coordination tokens that do not warrant database persistence reside in Redis with appropriate TTLs.

**[OSINT](@/glossary/osint.md) Provider Rate Tracking**: Intelligence collection pipelines use Redis counters to track per-provider API usage against rate limits, preventing throttling and account suspension.

The platform manages Redis connections through a [connection pool](@/glossary/connection-pooling.md) supervised by OTP, ensuring that connection failures are isolated and automatically recovered without affecting other platform components.

## Performance Characteristics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| **Read Latency** | <0.1ms (local), <1ms (network) | Single-threaded event loop |
| **Write Latency** | <0.1ms (local), <1ms (network) | Atomic operations |
| **Throughput** | 100,000+ ops/sec per node | Pipeline mode increases 5-10x |
| **Memory Efficiency** | ~85 bytes overhead per key | Varies by data structure |
| **Max Key Size** | 512MB per value | Practical limit much lower |

Redis's single-threaded execution model eliminates locking overhead and ensures atomic operations without the complexity of multi-threaded synchronization. Redis 6.0+ introduced I/O threading for network operations while maintaining single-threaded command execution, improving throughput on multi-core machines without sacrificing atomicity guarantees.

## Redis vs ETS Comparison

Both Redis and [ETS (Erlang Term Storage)](@/glossary/ets.md) serve as in-memory data stores in the Prismatic Platform, but they address different requirements:

| Aspect | Redis | ETS |
|--------|-------|-----|
| **Scope** | Network-accessible, shared across nodes | Process-local to BEAM VM |
| **Persistence** | Optional (RDB/AOF) | None (process lifecycle) |
| **Data Format** | Byte strings (serialization required) | Native Erlang terms |
| **Distribution** | Built-in clustering | Manual replication needed |
| **Latency** | Network hop required | Direct memory access |
| **Use Case** | Cross-service caching, distributed state | Local caching, registries |

The platform uses ETS for high-frequency, node-local lookups (agent registries, module caches) and Redis for data that must be shared across nodes or survive process restarts.

## Best Practices

1. **Use appropriate data structures.** Redis provides specialized structures for specific access patterns. Use sorted sets for ranked data, hashes for object-like data, and streams for event logs. Using strings for everything wastes Redis's structural capabilities.

2. **Set TTLs on all cache entries.** Every cached value should have an expiry. Without TTLs, Redis memory grows unbounded until it hits the maxmemory limit and triggers eviction policies, which may evict important data.

3. **Use pipelining for batch operations.** Sending multiple commands in a single round-trip reduces network overhead by 5-10x. The Redix library's `pipeline/2` function makes this straightforward.

4. **Monitor memory usage.** Redis operates entirely in memory. Use `INFO memory` to track usage and configure `maxmemory` with an appropriate eviction policy (typically `allkeys-lru` for caches).

5. **Prefer Lua scripts for complex atomicity.** When multiple operations must execute atomically, use Redis Lua scripting rather than application-level locking. Lua scripts execute atomically on the Redis server.

## Common Pitfalls

- **Using Redis as a primary database.** Redis is optimized for speed, not durability. Even with AOF persistence, it lacks the ACID guarantees, query capabilities, and data integrity features of [PostgreSQL](@/glossary/postgresql.md).

- **Storing large objects.** Redis strings can hold up to 512MB, but large values increase memory fragmentation and slow down persistence operations. Keep values small and use reference patterns for large data.

- **Ignoring eviction policies.** When Redis reaches its memory limit, it must evict data. Without explicit configuration, Redis may evict recently used cache entries or refuse writes entirely.

- **Using KEYS in production.** The `KEYS` command scans all keys and blocks the server during execution. Use `SCAN` for production key enumeration.

- **Neglecting connection pooling.** Each Redis connection consumes server resources. Use [connection pooling](@/glossary/connection-pooling.md) to limit concurrent connections and efficiently share them across processes.

## Related Terms

- [PostgreSQL](@/glossary/postgresql.md) - Primary persistent database that Redis accelerates through caching
- [ETS](@/glossary/ets.md) - Node-local in-memory store complementing Redis for BEAM-local data
- [PubSub](@/glossary/pubsub.md) - Messaging pattern that Redis implements as a transport layer
- [Connection Pooling](@/glossary/connection-pooling.md) - Pool management for Redis client connections
- [Cluster](@/glossary/cluster.md) - Distributed deployment topology Redis supports natively
- [Backpressure](@/glossary/backpressure.md) - Flow control mechanism using Redis counters
- [Distributed System](@/glossary/distributed-system.md) - Architecture pattern requiring shared state management
- [Rate Limiting](@/glossary/rate-limiting.md) - Traffic control implemented with Redis atomic operations
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Fault tolerance pattern applied to Redis connections
- [Message Passing](@/glossary/message-passing.md) - Communication paradigm that Redis Pub/Sub extends across network boundaries
- [Event Sourcing](@/glossary/event-sourcing.md) - Pattern implementable with Redis Streams
- [OSINT](@/glossary/osint.md) - Intelligence collection using Redis for rate tracking

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture and data flow patterns
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Applications consuming Redis services

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
