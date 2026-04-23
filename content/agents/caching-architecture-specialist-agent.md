+++
title = "Caching Architecture Specialist Agent"
weight = 62
[extra]
domain = "primary"
level = "L3"
description = "Multi-tier caching strategy architect providing cache design, invalidation patterns, and performance optimization across all platform layers"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "ets", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "2 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Caching", "Architecture", "Specialist", "Agent", "Multi-tier", "agents", "Prismatic Platform", "Cache", "Configuration", "Invalidation"]
tags = ["agents", "agent", "caching-architecture-specialist-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Caching Architecture Specialist Agent - Prismatic Platform"
+++

## Overview

The Caching Architecture Specialist Agent is an L3 [strategic command](@/glossary/strategic-command.md) authority operating within the Primary domain of the Prismatic Platform. This agent provides multi-tier caching strategies, cache invalidation patterns, and performance optimization expertise across all platform layers. In a system processing intelligence data across 90 [umbrella application](@/glossary/umbrella-application.md)s with real-time [LiveView](@/glossary/liveview.md) dashboards, caching architecture directly impacts both response latency and computational resource consumption.

Caching in the Prismatic Platform is not a simple key-value layer -- it is a multi-tier architecture spanning [ETS](@/glossary/ets.md) tables for sub-microsecond in-memory access, [GenServer](@/glossary/genserver.md) state for process-level caching, PostgreSQL materialized views for query acceleration, and HTTP-level caching for web response optimization. The Caching Architecture Specialist designs and maintains this multi-tier strategy, ensuring that each layer serves its appropriate access patterns while maintaining consistency guarantees that prevent stale data from corrupting platform operations.

The fundamental challenge of caching -- maintaining the balance between performance (serving cached data quickly) and consistency (ensuring cached data is current) -- is amplified in an intelligence platform where stale data can lead to incorrect analysis. The specialist addresses this challenge through explicit TTL (time-to-live) policies, event-driven invalidation, and tiered consistency guarantees that provide strong consistency for critical data and eventual consistency for data where latency matters more than immediacy.

## Operational Domain

The Primary domain grants the Caching Architecture Specialist authority over core platform functionality with direct user-facing impact. Cache performance directly affects page load times (mandated at < 250ms), LiveView mount latency (< 150ms), and API response times. The specialist's cache architecture decisions propagate across all platform applications through shared caching infrastructure.

## Key Capabilities

- **Multi-tier cache design** architecting caching strategies that span ETS in-memory tables, GenServer state, PostgreSQL materialized views, Meilisearch indices, and HTTP response caching, with each tier optimized for its characteristic access patterns

- **Cache invalidation strategy** designing invalidation approaches appropriate to each data type: event-driven invalidation for data that changes unpredictably, TTL-based expiration for data with known refresh rates, and write-through caching for data requiring immediate consistency

- **[ETS](@/glossary/ets.md) table management** designing ETS table configurations (table types, access patterns, memory limits) that optimize for the platform's read-heavy workloads while maintaining bounded memory consumption

- **Cache warming** implementing preload strategies that populate caches before requests arrive, ensuring that cache misses are rare during normal operation. Warming strategies account for application startup, deployment cache clears, and predictable access patterns.

- **Performance profiling** identifying caching opportunities through [telemetry](@/glossary/telemetry.md) analysis, detecting hot paths where caching would provide the highest latency reduction, and measuring actual cache hit rates to verify strategy effectiveness

- **Consistency guarantee design** defining and enforcing consistency guarantees per data type: strong consistency for security-critical data, bounded staleness for analytics data, and eventual consistency for display-oriented data

## Multi-Tier Cache Architecture

The specialist designs and maintains a four-tier caching architecture.

### Tier 1: ETS In-Memory Cache

**Use case**: Sub-microsecond access to frequently read, infrequently written data.
**Configuration**: `:set` or `:ordered_set` table types with `:read_concurrency` enabled.
**Examples**: Agent fitness scores, quality metrics, configuration parameters, AIAD specifications.
**Invalidation**: Event-driven through [telemetry](@/glossary/telemetry.md) events; bounded TTL as safety net.
**Memory management**: Per-table size limits with LRU eviction for bounded-growth tables.

### Tier 2: GenServer State Cache

**Use case**: Process-local caching of computed results that are expensive to recalculate.
**Configuration**: GenServer state with scheduled refresh cycles.
**Examples**: Aggregated dashboard statistics, compiled query results, derived security ratings.
**Invalidation**: Periodic refresh with configurable intervals per data type.
**Memory management**: Bounded by GenServer process memory; monitored through telemetry.

### Tier 3: PostgreSQL Materialized Views

**Use case**: Accelerating complex queries that join multiple tables or perform aggregations.
**Configuration**: Materialized views with scheduled concurrent refresh.
**Examples**: Compliance assessment summaries, entity relationship aggregations, historical trend data.
**Invalidation**: Scheduled refresh (hourly/daily depending on data velocity) with on-demand refresh capability.
**Memory management**: Database-managed; storage costs tracked through database monitoring.

### Tier 4: HTTP Response Cache

**Use case**: Caching rendered HTML and JSON responses for repeat requests.
**Configuration**: ETag-based validation, Cache-Control headers, conditional GET support.
**Examples**: Static asset responses, public API endpoints, documentation pages.
**Invalidation**: ETag invalidation on content change; time-based expiration for public content.
**Memory management**: CDN/reverse proxy managed; minimal server-side storage.

## Cache Invalidation Patterns

The specialist implements three primary invalidation patterns appropriate to different data characteristics.

| Pattern | Mechanism | Consistency | Use Case |
|---------|-----------|-------------|----------|
| Event-driven | Telemetry event triggers cache clear | Strong (on event) | Security data, authentication state |
| TTL-based | Automatic expiration after configurable interval | Bounded staleness | Analytics, metrics, scores |
| Write-through | Cache updated simultaneously with primary store | Immediate | Configuration, quality thresholds |

## Integration Ecosystem

| Component | Relationship | Data Flow |
|-----------|-------------|-----------|
| Prismatic Core | Central platform coordination | Cache strategy directives for core data |
| [Prismatic Web](@/glossary/prismatic-web.md) | [LiveView](@/glossary/liveview.md) dashboard | Cache-backed real-time dashboard data |
| [Phoenix](@/glossary/phoenix.md) | Web framework | HTTP caching headers and ETag management |
| ETS Infrastructure | In-memory storage | Cache table creation, management, monitoring |
| PostgreSQL | Materialized view management | Query acceleration through cached aggregations |
| [Telemetry](@/glossary/telemetry.md) | Cache metrics | Hit rates, miss rates, invalidation frequency |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to define caching policies, mandate cache implementation patterns, and enforce performance standards.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [architecture-review-specialist](@/agents/architecture-review-specialist.md) | Structural Review | Validates cache architecture against platform structural standards |
| [performance-optimization-specialist](@/agents/archer-supreme.md) | Performance Partner | Coordinates cache optimization with broader performance strategy |
| [database-core-specialist](@/agents/database-core-specialist.md) | Database Integration | Coordinates materialized view strategies with database optimization |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| ETS cache hit rate | > 95% | > 90% | Percentage of ETS lookups served from cache |
| Average cache-backed response time | < 50ms | < 100ms | Response time for cache-hit requests |
| Cache memory usage | < 2GB | < 4GB | Total ETS cache memory consumption |
| Invalidation latency | < 10ms | < 100ms | Time from data change to cache invalidation |
| Materialized view refresh time | < 30s | < 60s | Time to refresh PostgreSQL materialized views |
| Cache miss penalty | < 200ms | < 250ms | Additional latency for cache-miss requests |

## Enforcement

The Caching Architecture Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Page load times must stay below 250ms, and caching is a primary mechanism for achieving this target. Cache strategies must be documented with explicit consistency guarantees. Cache invalidation must be verified to prevent stale data from affecting platform operations. The [Trinity Gate](@/glossary/trinity-gate.md) validates that caching decisions maintain structural consistency (cache layers do not create circular dependencies), logical consistency (consistency guarantees are satisfied for each data type), and formal correctness (TTL and invalidation logic produces correct behavior under all conditions). Performance regressions caused by cache misconfiguration are treated as production incidents requiring immediate remediation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)