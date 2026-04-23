+++
title = "Prismatic Storage Redis"
weight = 38
[extra]
icon = "bolt"
color = "red"
description = "Redis storage adapter for caching, pub/sub, and distributed state"
category = "Storage"
files = "85"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1159
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "Redis", "apps", "Prismatic Platform", "Cache", "Prismatic Storage"]
tags = ["apps", "storage", "prismatic-storage-redis", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage Redis - Prismatic Platform"
+++

## Overview

[Prismatic Storage](/glossary/prismatic-storage/) [Redis](/glossary/redis/) implements the storage adapter [protocol](/glossary/protocol/) using Redis for distributed caching, cross-node state coordination, and real-time pub/sub messaging. It provides sub-millisecond access to frequently used data, distributed locks for singleton process coordination, and [message passing](/glossary/message-passing/) between platform components running on separate [BEAM](/glossary/beam/) nodes.

Within the platform's multi-level caching architecture, Redis serves as the L2 (second-level) cache. Hot data lives in [ETS](/apps/prismatic-storage-ets/) for microsecond access within a single node, while Redis provides millisecond access across all nodes in a cluster. When data is not found in either cache layer, it is fetched from [PostgreSQL](/apps/prismatic-storage-ecto/) and populated back through both cache levels.

The adapter manages [connection pooling](/glossary/connection-pooling/), automatic reconnection, and pipeline batching to maximize throughput. All Redis operations are instrumented with [telemetry events](/apps/prismatic-telemetry/) for latency monitoring and cache hit rate analysis.

## Architecture

```
Application Code
       |
  PrismaticStorageCore Behaviour (Protocol)
       |
  Redis Adapter
       |
  +----+----+----+
  |         |         |
Cache     Distributed  Pub/Sub
Manager   Coordination  Engine
  |         |         |
  +----+----+----+
       |
  Connection Pool (Redix)
       |
  Redis Server
```

The Cache Manager handles TTL-based caching with stampede prevention. The Distributed Coordination module provides locks, counters, and leader election primitives. The Pub/Sub Engine manages [channel](/glossary/channel/) subscriptions and message routing. All three subsystems share a connection pool managed by the Redix library with configurable pool size and overflow.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The Redis adapter implements the [Prismatic Storage Core](/apps/prismatic-storage-core/) contract with traits suited for distributed caching and coordination: Storable, Identifiable, Queryable, Cacheable, Batchable, and Subscribable. The combination of Cacheable and Subscribable traits makes Redis the only adapter in the platform capable of both TTL-managed caching and real-time change notifications across distributed nodes.

The Storable trait implementation handles serialization between Elixir terms and Redis's string-based storage. Unlike ETS, which stores native Erlang terms, Redis requires all values to be serialized to binary strings. The adapter supports three serialization formats: JSON (for interoperability with non-Elixir clients), Erlang External Term Format (ETF, for maximum fidelity of Elixir types), and Protocol Buffers (for space-efficient serialization of known schemas). The format is configurable per key namespace, allowing different serialization strategies for different data types.

The Cacheable trait implementation provides TTL-managed caching with stampede prevention -- a sophisticated mechanism that prevents thundering herd problems when popular cache entries expire. When a cache entry is within a configurable window of expiration, the adapter uses probabilistic early expiration: each request has a small, increasing probability of triggering a cache refresh, ensuring that only one process performs the expensive recomputation while others continue serving the stale-but-valid cached value. This technique is essential for high-traffic endpoints where simultaneous cache misses would overwhelm the PostgreSQL backend.

The Subscribable trait wraps Redis's pub/sub mechanism in the platform's notification interface. When a cache entry is invalidated on one node, the adapter publishes an invalidation message to a Redis channel. All other nodes subscribe to this channel and remove the corresponding entry from their local ETS caches, maintaining cross-node cache consistency without polling. This pub/sub-based invalidation is the mechanism that keeps L1 (ETS) and L2 (Redis) caches coherent in a multi-node deployment.

The Batchable trait leverages Redis pipelines for efficient bulk operations. Rather than sending each command individually and waiting for a response, the adapter batches multiple commands into a single pipeline request, reducing network round-trips. For cache warming operations that involve populating hundreds of keys, pipelining reduces total latency from hundreds of milliseconds to single-digit milliseconds.

Contract compliance is verified through `PrismaticStorageCore.ContractTest` with Redis-specific extensions testing distributed lock safety, pub/sub message delivery, and pipeline batching correctness.

## Key Features

### Caching
- Automatic cache population on miss with configurable loaders
- TTL-based expiration with per-key and per-namespace policies
- Cache stampede prevention using probabilistic early expiration and lock-based recomputation
- Multi-level caching integration: L1 [ETS](/apps/prismatic-storage-ets/) + L2 Redis
- Cache invalidation via pub/sub for cross-node consistency

### Distributed Coordination
- Distributed locks with automatic [release](/glossary/release/) on process crash (Redlock algorithm)
- Sliding window [rate limiting](/glossary/rate-limiting/) with atomic Lua script execution
- Distributed counters and gauges for shared [metrics](/glossary/metrics/) across nodes
- Leader election for singleton [GenServer](/glossary/genserver/) processes in clustered deployments

### Pub/Sub
- Channel-based real-time messaging for cross-node event propagation
- Pattern-based subscriptions for wildcard channel matching
- Message serialization with configurable formats (JSON, Protocol Buffers, ETF)
- Delivery guarantees with Redis Streams for critical event channels

## Distributed Lock Implementation

The adapter implements distributed locking using a simplified Redlock algorithm adapted for the platform's single-Redis-server deployment model. Locks are acquired using Redis's `SET key value NX PX milliseconds` command, which atomically sets a key only if it does not already exist, with an automatic expiration to prevent deadlocks from crashed processes.

Lock release uses a Lua script that checks the lock value (a unique identifier generated by the acquiring process) before deletion, preventing a process from releasing a lock it does not own. This is essential in scenarios where lock acquisition times out and a new process acquires the same lock -- the original process must not inadvertently release the new lock upon timeout recovery.

Rate limiting uses a sliding window algorithm implemented as an atomic Lua script. The script maintains a sorted set of timestamps, removes entries outside the current window, adds the new request's timestamp, and returns the current count -- all in a single atomic operation. This approach provides more accurate rate limiting than fixed-window counters while maintaining the performance characteristics of Redis's in-memory execution.

## Usage

```elixir
# Cache with TTL and automatic population
{:ok, entity} = PrismaticStorageRedis.fetch("entity:123", ttl: :timer.minutes(15), fn ->
  PrismaticStorageEcto.get(:entities, "123")
end)

# Distributed lock for exclusive operations
{:ok, lock} = PrismaticStorageRedis.lock("scan:example.com", ttl: 30_000)
try do
  perform_exclusive_scan("example.com")
after
  PrismaticStorageRedis.unlock(lock)
end

# Sliding window rate limiting
case PrismaticStorageRedis.rate_limit("api:user:123", limit: 100, window: 60) do
  :ok -> proceed_with_request()
  {:error, :rate_limited, retry_after} -> reject_with_retry(retry_after)
end

# Pub/sub for cross-node events
PrismaticStorageRedis.subscribe("osint:findings:*", fn channel, message ->
  process_finding(channel, message)
end)
```

## Testing

```bash
mix test apps/prismatic_storage_redis/test
mix test apps/prismatic_storage_redis/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | All declared trait compliance |
| Cache Operations | 10 | TTL, stampede prevention, hit/miss tracking |
| Distributed Locks | 8 | Acquisition, release, timeout, contention |
| Rate Limiting | 6 | Sliding window accuracy, concurrent requests |
| Pub/Sub | 8 | Message delivery, pattern subscriptions, serialization |
| Pipeline Batching | 4 | Bulk operation throughput, error handling |

## Integration Points

[Prismatic Auth](/apps/prismatic-auth/) uses Redis-backed rate limiting to enforce per-user and per-API-key request quotas across all nodes in the cluster. [Prismatic HAWKEYE](/apps/prismatic-hawkeye/) shares visitor [threat intelligence](/glossary/threat-intelligence/) between nodes via Redis pub/sub, ensuring all instances have current risk assessments. The [Prismatic API](/apps/prismatic-api/) gateway uses Redis for response caching with ETag support, reducing redundant computation for frequently requested endpoints.

## NABLA Compliance

Redis operations carry provenance metadata through key namespacing and telemetry event metadata. Cache entries include origin timestamps and source adapter identifiers, satisfying the Provenance Mandatory axiom. The pub/sub invalidation mechanism ensures that cached data does not persist beyond its validity period, implementing Time Decay at the distributed cache layer. The multi-level cache architecture supports Signal Plurality by allowing the same data to be retrieved from independent sources (ETS, Redis, PostgreSQL) for cross-validation when epistemic confidence thresholds require it.

## Performance

| Metric | Value |
|--------|-------|
| Cache read latency | Sub-millisecond |
| Cache write latency | Sub-millisecond |
| Pipeline throughput | 100,000+ operations/second |
| Pub/sub message latency | Sub-millisecond |
| Lock acquisition | ~1ms average |
| Rate limit check | ~0.5ms (Lua script) |

## Related Components

- [Prismatic Storage Core](/apps/prismatic-storage-core/) -- Adapter protocol definition
- [Prismatic Storage ETS](/apps/prismatic-storage-ets/) -- L1 in-memory cache layer
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- Durable PostgreSQL persistence
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Cache performance metrics

## Related Agents

- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Ensures Redis adapter conforms to the PrismaticStorageCore protocol contract
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews distributed cache topology and connection pooling strategies
- [Deployment Commander](/agents/deployment-commander-agent/) -- Coordinates Redis cluster deployment and failover configuration

## Related Capabilities

- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) -- Redis adapter provides cross-node state coordination for all platform domains
- [Quality Gates](/capabilities/quality-gates/) -- Contract tests verify adapter protocol compliance and concurrency safety
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Cache hit rates and latency metrics emitted for performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)