+++
title = "Prismatic Cache"
weight = 15
[extra]
icon = "zap"
color = "yellow"
description = "Multi-layer caching system with ETS, Redis, and intelligent invalidation"
category = "Infrastructure"
files = "195"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1191
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Cache", "Multi-layer", "Redis", "apps", "Infrastructure", "Prismatic Platform"]
tags = ["apps", "infrastructure", "prismatic-cache", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Cache - Prismatic Platform"
+++

## Abstract

Prismatic Cache provides a multi-layer caching system that reduces latency and external API consumption across the platform through a three-tier hierarchy: L1 (process-local [ETS](@/glossary/ets.md)) for sub-microsecond access, L2 (shared ETS) for cross-process caching within a node, and L3 ([Redis](@/glossary/redis.md)) for distributed caching across cluster nodes. For an intelligence platform querying 121+ [OSINT](@/glossary/osint.md) sources with strict rate limits and per-query costs, effective caching is a functional necessity. The system implements transparent fallthrough (L1 miss promotes to L2, L2 miss promotes to L3, L3 miss executes the origin function), per-source TTL configuration, pattern-based invalidation, event-driven invalidation through [PubSub](@/glossary/pubsub.md), cache warming for frequently accessed data, and comprehensive statistics tracking including hit rates, API call savings, and estimated cost savings. The cache saves an estimated 56,000+ daily API calls with an overall hit rate exceeding 99%.

## 1. Introduction

### 1.1 Problem Statement

The Prismatic Platform queries over 121 external OSINT sources, many with strict rate limits ([Shodan](@/glossary/shodan.md): 100 requests/hour, AbuseIPDB: 1,000 requests/day) and per-query costs. An entity that appears in multiple intelligence operations would trigger redundant queries to the same sources. Without caching, the platform would exhaust API quotas within hours of moderate usage, and response latency would be dominated by external API round-trip times.

Prismatic Cache ensures that each external query is performed at most once within its TTL window, regardless of how many platform components request the same data.

### 1.2 Design Goals

1. **Three-tier hierarchy** -- L1 (process ETS, ~1 microsecond), L2 (shared ETS, ~10 microseconds), L3 (Redis, ~1 millisecond) with automatic promotion on cache hits.
2. **Per-source TTL** -- different data sources have different freshness requirements; Czech registries (weekly updates) have 7-day TTLs while sanctions lists (daily updates) have 24-hour TTLs.
3. **Pattern-based invalidation** -- invalidate all entries matching a glob pattern (e.g., `"ares:*"`) for bulk cache clearing.
4. **Event-driven invalidation** -- PubSub-based invalidation when source data is known to have changed.
5. **Cache warming** -- pre-populate cache for frequently accessed entities to eliminate first-request latency.
6. **Statistics tracking** -- hit rates, miss rates, API calls saved, and estimated cost savings per source.

### 1.3 Scope

Prismatic Cache covers data caching across all platform applications. It does not implement HTTP response caching for the API layer (which uses a specialized ResponseCache) or CDN-level asset caching.

## 2. Architecture

### 2.1 System Design

```
Application Request
       |
  PrismaticCache.fetch/3
       |
  L1: Process ETS (~1 us)
  |-- hit → return
  |-- miss ↓
  L2: Shared ETS (~10 us)
  |-- hit → promote to L1, return
  |-- miss ↓
  L3: Redis (~1 ms)
  |-- hit → promote to L1+L2, return
  |-- miss ↓
  Origin Function (external API call)
  |-- store in L1+L2+L3, return
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticCache` | Public facade: `fetch/3`, `put/3`, `invalidate/1`, `invalidate_pattern/1`, `stats/0` |
| `PrismaticCache.L1` | Process-local ETS cache with per-[process isolation](@/glossary/process-isolation.md) |
| `PrismaticCache.L2` | Shared ETS cache accessible across all processes on a node |
| `PrismaticCache.L3` | Redis-backed distributed cache for cross-node access |
| `PrismaticCache.TTLManager` | Per-source TTL resolution and expiration enforcement |
| `PrismaticCache.Invalidator` | Pattern-based and event-driven cache invalidation |
| `PrismaticCache.Warmer` | Scheduled and on-demand cache pre-population |
| `PrismaticCache.Stats` | Hit/miss tracking, API savings calculation, cost estimation |
| `PrismaticCache.ResponseCache` | Specialized HTTP response cache with ETag support for the API layer |

### 2.3 Process Topology

```
PrismaticCache.Application (Supervisor, :one_for_one)
+-- PrismaticCache.L2 (GenServer)
|     Shared ETS table owner, TTL enforcement
+-- PrismaticCache.Invalidator (GenServer)
|     PubSub subscription for invalidation events
+-- PrismaticCache.Warmer (GenServer)
|     Scheduled cache warming operations
+-- PrismaticCache.Stats (GenServer)
      Hit/miss counters, periodic statistics computation
```

### 2.4 Data Flow

A `fetch/3` call first checks L1 (process-local ETS). On a hit, the cached value is returned immediately. On a miss, L2 (shared ETS) is checked; a hit promotes the entry to L1 and returns. On an L2 miss, L3 (Redis) is checked; a hit promotes to L1 and L2. On an L3 miss, the origin function is executed, and the result is stored in all three layers. TTL is determined by the cache key [pattern matching](@/glossary/pattern-matching.md) against the per-source TTL configuration.

## 3. Implementation

### 3.1 Key Algorithms

**TTL Resolution**. Cache keys follow the pattern `"source:type:identifier"` (e.g., `"shodan:host:1.2.3.4"`). The TTLManager matches the key against glob patterns in the TTL configuration to determine the appropriate TTL. More specific patterns take precedence over general ones.

**Cache Promotion**. When a lower cache layer has a hit, the entry is promoted to higher layers to ensure subsequent accesses are served from the fastest available layer. Promotion is performed asynchronously to avoid adding latency to the cache hit path.

### 3.2 Data Structures

```elixir
defmodule PrismaticCache.Entry do
  @type t :: %__MODULE__{
    key: String.t(),
    value: term(),
    ttl: pos_integer(),
    inserted_at: DateTime.t(),
    expires_at: DateTime.t(),
    source: atom(),
    hit_count: non_neg_integer()
  }
end
```

### 3.3 API Surface

```elixir
# Fetch with automatic origin execution on miss
@spec fetch(String.t(), function(), keyword()) :: {:ok, term()}
PrismaticCache.fetch("shodan:host:1.2.3.4", fn ->
  Shodan.host("1.2.3.4")
end, ttl: :timer.hours(24))

# Direct put
@spec put(String.t(), term(), keyword()) :: :ok
PrismaticCache.put("ares:company:12345678", company_data, ttl: :timer.hours(168))

# Invalidate specific entry
@spec invalidate(String.t()) :: :ok
PrismaticCache.invalidate("shodan:host:1.2.3.4")

# Pattern-based invalidation
@spec invalidate_pattern(String.t()) :: {:ok, non_neg_integer()}
PrismaticCache.invalidate_pattern("ares:*")

# Cache statistics
@spec stats() :: {:ok, CacheStats.t()}
PrismaticCache.stats()

# Cache warming
@spec warm(String.t(), function()) :: :ok
PrismaticCache.warm("ares", fn -> Ares.get_top_companies(limit: 1000) end)
```

### 3.4 Configuration

```elixir
config :prismatic_cache,
  # Layer configuration
  l1_max_entries: 10_000,
  l2_max_entries: 100_000,
  l3_url: "redis://localhost:6379/0",

  # Per-source TTLs
  ttl_config: %{
    "shodan:*" => :timer.hours(24),
    "censys:*" => :timer.hours(12),
    "virustotal:*" => :timer.hours(6),
    "abuseipdb:*" => :timer.hours(1),
    "ares:*" => :timer.hours(168),
    "justice:*" => :timer.hours(168),
    "eu_sanctions:*" => :timer.hours(24),
    "*" => :timer.hours(1)
  },

  # Warming
  warm_on_boot: true,
  warm_interval: :timer.hours(24)
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage](@/apps/prismatic-storage.md) | Redis adapter for L3 cache |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Cache hit/miss [metrics](@/glossary/metrics.md) |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | OSINT query result caching |
| [Prismatic API](@/apps/prismatic-api.md) | API response caching with ETag |
| [Prismatic HAWKEYE](@/apps/prismatic-hawkeye.md) | Intelligence query caching |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Assessment result caching |

### 4.3 Inter-Process Communication

L1 access requires no IPC (process-local ETS). L2 access is a direct ETS read (lock-free). L3 access communicates with Redis via the Redix connection pool. Invalidation events are broadcast via PubSub.

### 4.4 External Integrations

Redis for L3 distributed cache. No other external services.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| L1 hit | ~1 microsecond | Process-local ETS read |
| L2 hit | ~10 microseconds | Shared ETS read |
| L3 hit | ~1 millisecond | Redis round-trip |
| Origin miss | 200ms-3s | External API call |
| Pattern invalidation (1K entries) | 10-50ms | ETS scan + delete |

### 5.2 Scalability

L1 and L2 scale with available memory. L3 scales with Redis cluster capacity. The three-tier architecture ensures that hot data is always served from the fastest available layer.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 100 MB (L1+L2) | 500 MB (L1+L2) + 2 GB (Redis L3) |
| CPU | 1 core | 2 cores |

## 6. Testing Strategy

### 6.1 Unit Tests

Each cache layer has tests for put, get, TTL expiration, and invalidation. TTL resolution tests verify correct pattern matching for all configured sources.

### 6.2 Integration Tests

Full three-tier tests verify promotion behavior, invalidation propagation, and statistics accuracy across all layers.

### 6.3 Property-Based Testing

StreamData generators produce random cache keys and TTL values to verify that entries always expire within their TTL window and that invalidation patterns match correctly.

## 7. Security Considerations

### 7.1 Threat Model

Cache poisoning (storing incorrect data under a valid key) could propagate incorrect intelligence. Mitigations include cache entry integrity verification and source authentication before caching.

### 7.2 Access Control

Cache operations are platform-internal. Redis access is authenticated via connection credentials. No external cache access is exposed.

## 8. Operational Considerations

### 8.1 Deployment

Requires Redis for L3 cache. L1 and L2 operate without external dependencies. Cache warming runs automatically on boot.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :cache, :hit]`, `[:prismatic, :cache, :miss]`, `[:prismatic, :cache, :invalidated]`. Key metrics include per-layer hit rates, overall hit rate, API calls saved, and estimated cost savings.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Low hit rate | TTL too short | Increase TTL for stable sources |
| Memory growth | L2 unbounded | Configure max_entries limit |
| Stale data | TTL too long | Reduce TTL or use event-driven invalidation |
| Redis timeouts | Connection pool exhaustion | Increase pool size |

## 9. Future Work

Planned enhancements include adaptive TTL based on source update frequency, cache cost optimization (preferring cheaper sources for redundant data), predictive cache warming based on access patterns, and tiered storage with SSD-backed L2.5 layer for overflow.

## References

- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) -- Primary cache consumer
- [Prismatic Storage](@/apps/prismatic-storage.md) -- Redis adapter for L3
- [Prismatic API](@/apps/prismatic-api.md) -- Response cache integration
- [Prismatic Telemetry](@/apps/prismatic-telemetry.md) -- Cache metric pipeline

## Related Agents

- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Designs the three-tier cache layer abstraction with consistent interfaces across ETS, shared ETS, and Redis backends
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews cache architecture for correct promotion semantics, TTL resolution, and invalidation propagation
- [Deployment Commander Agent](@/agents/deployment-commander-agent.md) -- Manages Redis deployment, cache warming schedules, and production cache configuration across environments

## Related Capabilities

- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Tracks per-layer hit rates, API call savings, and cost estimation metrics for cache performance optimization
- [Quality Gates](@/capabilities/quality-gates.md) -- Validates cache correctness through property-based testing of TTL expiration, promotion behavior, and invalidation patterns
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Detects cache degradation and triggers automatic recovery through connection pool reset and warming cycles

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)