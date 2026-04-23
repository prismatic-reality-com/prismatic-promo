+++
title = "Prismatic Storage ETS"
weight = 36
[extra]
icon = "circle-stack"
color = "yellow"
description = "ETS-backed storage adapter for high-performance in-memory data access"
category = "Storage"
files = "95"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1254
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Storage", "ETS", "ETS-backed", "apps", "Prismatic Platform", "Prismatic Storage", "Memory"]
tags = ["apps", "storage", "prismatic-storage-ets", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Storage ETS - Prismatic Platform"
+++

## Overview

[Prismatic Storage](/glossary/prismatic-storage/) [ETS](/glossary/ets/) implements the platform's storage adapter [protocol](/glossary/protocol/) using Erlang Term Storage (ETS). It provides microsecond-latency data access for hot data, caches, session state, and high-throughput workloads that demand the lowest possible read and write latency across the platform.

Because ETS tables are native to the [BEAM](/glossary/beam/) virtual machine, data is stored as raw Erlang terms with zero serialization overhead. This makes ETS the fastest storage option in the Prismatic ecosystem -- reads complete in single-digit microseconds regardless of value complexity, and concurrent read access scales linearly with available CPU cores. The adapter manages table lifecycle through [OTP](/glossary/otp/) supervision, monitors memory consumption with configurable thresholds, and provides optional disk persistence for crash recovery.

Prismatic Storage ETS serves as the L1 (first-level) cache in the platform's multi-level caching hierarchy, with [Redis](/apps/prismatic-storage-redis/) functioning as L2 and [PostgreSQL](/apps/prismatic-storage-ecto/) as the durable persistence layer.

## Architecture

```
Application Code
       |
  PrismaticStorageCore Behaviour (Protocol)
       |
  ETS Adapter
       |
  +----+----+----+
  |         |         |
Table     Memory    Persistence
Lifecycle Monitor   Manager
(Supervisor)  (GenServer)  (GenServer)
  |         |         |
ETS Tables  Alerts    DETS Backup
```

Each logical data namespace (cache, sessions, entities) maps to a separate ETS table with its own configuration for table type, access mode, and TTL policy. The Table Lifecycle [supervisor](/glossary/supervisor/) ensures tables are recreated after process crashes, and the Memory Monitor [GenServer](/glossary/genserver/) enforces memory budgets by evicting expired or least-recently-used entries when consumption exceeds thresholds.

## Adapter Pattern and PrismaticStorageCore.Behaviour

The ETS adapter implements the [Prismatic Storage Core](/apps/prismatic-storage-core/) contract with traits optimized for in-memory access patterns: Storable, Identifiable, Queryable, Batchable, Cacheable, and Streamable. The trait selection reflects ETS's strengths -- sub-microsecond key-value operations, atomic counter updates, and efficient pattern matching across tables -- while omitting traits like Transactional that ETS cannot meaningfully support.

The Storable trait implementation is the simplest across all adapters because ETS stores native Erlang terms. The `to_storage/1` callback is essentially a no-op for Elixir maps and structs, since ETS can store them directly without serialization. The `from_storage/2` callback similarly requires no deserialization -- values retrieved from ETS are already in their native Elixir representation. This zero-serialization property is the primary reason ETS achieves microsecond latencies that are impossible for adapters requiring JSON or binary serialization.

The Queryable trait implementation uses ETS's `match_spec` mechanism for server-side filtering. Match specifications compile pattern matching logic into bytecode that executes within the ETS runtime, avoiding the overhead of copying all table entries to the calling process for application-level filtering. For simple key-prefix queries, the adapter uses `:ets.select/2` with compiled match specifications. For complex multi-field filters, it constructs match specifications dynamically from the platform's generic query interface.

The Cacheable trait is unique to the ETS adapter and provides TTL-based caching with several eviction strategies. Entries can be configured with individual TTL values, and a periodic sweep process removes expired entries on a configurable interval. The sweep process is carefully designed to spread deletion work across multiple scheduler invocations to avoid blocking the ETS table during large cache expirations.

The Batchable trait leverages ETS's `insert/2` function, which accepts a list of tuples for atomic bulk insertion. All entries in a batch are inserted in a single operation that is atomic with respect to concurrent readers -- a reader will see either all entries from the batch or none, never a partial state. This atomicity guarantee is essential for cache warming operations where a set of related entities must become visible simultaneously.

Contract compliance is verified through `PrismaticStorageCore.ContractTest` with ETS-specific extensions testing memory management, TTL expiration, and concurrent access patterns under load.

## Key Features

### Performance
- Microsecond read/write latency with zero garbage collection pressure
- Concurrent read access using `:read_concurrency` optimization
- Write serialization through the owning process with `:write_concurrency` for parallel writes
- No serialization overhead -- Erlang terms stored natively in BEAM memory
- Compressed table support to reduce memory footprint for large datasets

### Management
- Automatic table lifecycle managed under OTP [supervision tree](/glossary/supervision-tree/)s
- Memory usage monitoring with configurable warning and critical thresholds
- Configurable table types: `:set`, `:ordered_set`, `:bag`, and `:duplicate_bag`
- Automatic TTL-based cleanup with periodic sweep processes
- Named table [registry](/glossary/registry-otp/) for discoverable cross-module access

### Persistence
- Optional disk backup on graceful application shutdown
- Periodic snapshot to DETS for durability without sacrificing read performance
- Recovery from disk snapshots on startup for warm cache restoration
- DETS fallback mode for datasets that must survive process restarts

## Table Topology and Ownership

ETS table ownership is a critical design consideration in OTP applications. Each ETS table is owned by the process that created it -- if the owning process terminates, the table is destroyed. The ETS adapter addresses this through a dedicated table owner process supervised under a `one_for_one` supervisor. The owner process has minimal logic (it simply holds table ownership and responds to management commands), reducing the surface area for crashes that would destroy the table.

The table topology maps each logical data namespace to a separate ETS table with optimized configuration:

| Namespace | Table Type | Access | Concurrency | Purpose |
|-----------|-----------|--------|-------------|---------|
| `:cache` | `:set` | `:public` | `:read_concurrency` | General-purpose caching |
| `:sessions` | `:set` | `:protected` | Both read and write | Active user sessions |
| `:counters` | `:set` | `:public` | `:write_concurrency` | Atomic counters and rate limits |
| `:entities` | `:ordered_set` | `:protected` | `:read_concurrency` | Sorted entity lookup |
| `:registry` | `:set` | `:public` | `:read_concurrency` | Adapter and module registry |

The distinction between `:public` and `:protected` access is deliberate. Caches and registries allow direct reads from any process for maximum performance, while sessions and entities restrict writes to the owning process for controlled mutation.

## Memory Management

The Memory Monitor GenServer tracks memory consumption across all managed ETS tables and enforces configurable budgets. When total ETS memory consumption exceeds the warning threshold (default: 70% of configured budget), the monitor begins evicting expired entries aggressively. At the critical threshold (default: 90%), it switches to LRU eviction, removing the least recently accessed entries regardless of TTL status.

Memory statistics are emitted as telemetry events on a configurable interval, enabling the [Prismatic Telemetry](/apps/prismatic-telemetry/) system to track ETS memory trends and alert on sustained growth. The adapter also exposes a `memory_stats/1` function for on-demand inspection of per-table memory utilization.

## Usage

```elixir
# Store a value with TTL via the adapter protocol
PrismaticStorageEts.put(:cache, "entity:123", entity_data,
  ttl: :timer.minutes(5)
)

# Retrieve a cached value
{:ok, value} = PrismaticStorageEts.get(:cache, "entity:123")
# => {:ok, %Entity{id: "123", type: :domain, ...}}

# Pattern matching queries across a table
{:ok, results} = PrismaticStorageEts.match(:entities, %{type: :domain})
# => {:ok, [%Entity{type: :domain, name: "example.com"}, ...]}

# Atomic counter increment for rate limiting
PrismaticStorageEts.update_counter(:rate_limits, "api:user:42", 1)

# Memory status for a namespace
{:ok, stats} = PrismaticStorageEts.memory_stats(:cache)
# => {:ok, %{entries: 15_420, memory_bytes: 2_340_000, utilization: 0.47}}
```

## Testing

```bash
mix test apps/prismatic_storage_ets/test
mix test apps/prismatic_storage_ets/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Adapter Contract | Shared suite | All declared trait compliance |
| TTL Expiration | 8 | Entry expiration, sweep timing, edge cases |
| Memory Management | 6 | Threshold enforcement, eviction behavior |
| Concurrency | 10 | Concurrent read/write safety, counter atomicity |
| Persistence | 4 | DETS backup/restore round-trip correctness |
| Table Lifecycle | 6 | Owner process restart, table recreation |

## Integration Points

The ETS adapter is consumed by nearly every application in the umbrella. [Prismatic HAWKEYE](/apps/prismatic-hawkeye/) stores visitor session profiles in ETS for sub-microsecond [risk score](/glossary/risk-score/) retrieval. [Prismatic Auth](/apps/prismatic-auth/) maintains active sessions and rate limiter state in ETS tables. The [Prismatic API](/apps/prismatic-api/) endpoint registry is ETS-backed for lock-free concurrent reads during request dispatch. [Prismatic Mycelial Nx](/apps/prismatic-mycelial-nx/) caches [inference](/glossary/inference/) results in ETS to avoid redundant GPU computations.

## NABLA Compliance

ETS operations emit telemetry events with timestamps and table identifiers, satisfying the Provenance Mandatory axiom. The TTL-based cache expiration mechanism implements Time Decay at the storage layer, ensuring that stale data is automatically removed rather than persisting indefinitely. Memory monitoring provides the observability required for the Unknown Valid axiom -- when memory pressure forces eviction, the system acknowledges data loss explicitly through logged telemetry events rather than silently degrading.

## Performance

| Metric | Value |
|--------|-------|
| Read latency | 1-5 microseconds |
| Write latency | 2-10 microseconds |
| Concurrent read scaling | Linear with CPU cores |
| Counter update | Atomic, sub-microsecond |
| Memory overhead per entry | ~100 bytes + term size |
| Pattern match scan | O(n) table size |

## Related Components

- [Prismatic Storage Core](/apps/prismatic-storage-core/) -- Adapter protocol definition
- [Prismatic Storage Redis](/apps/prismatic-storage-redis/) -- L2 distributed cache layer
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- Durable PostgreSQL persistence
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Storage operation [metrics](/glossary/metrics/)

## Related Agents

- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Ensures ETS adapter conforms to the PrismaticStorageCore protocol contract
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews ETS table topology and memory management strategies
- [Elixir Architect](/agents/elixir-architect/) -- Validates OTP supervision patterns for ETS table ownership

## Related Capabilities

- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) -- ETS adapter serves as the universal L1 cache across all platform domains
- [Quality Gates](/capabilities/quality-gates/) -- Contract tests verify adapter protocol compliance before deployment
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Storage operation metrics emitted for performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)