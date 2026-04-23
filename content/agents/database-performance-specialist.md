+++
title = "database-performance-specialist"
weight = 126
[extra]
domain = "infrastructure"
level = "L3"
description = "Database performance monitoring, query optimization, connection pool tuning, index management, and N+1 query detection across all platform applications."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "ecto", "timescaledb"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["database-performance-specialist", "Database", "agents", "agent", "Prismatic Platform", "Ecto", "Infrastructure", "PostgreSQL"]
tags = ["agents", "agent", "database-performance-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "database-performance-specialist - Prismatic Platform"
+++

## Overview

The Database Performance Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent monitors, analyzes, and optimizes [PostgreSQL](@/glossary/postgresql.md) database performance across all platform applications, ensuring that query execution times, connection pool utilization, and storage efficiency meet production-grade requirements. With a 90-app umbrella architecture generating diverse query patterns, continuous performance monitoring is essential to prevent database bottlenecks from degrading platform responsiveness.

Database performance in the Prismatic ecosystem involves more than simple query optimization. The specialist manages [ETS](@/glossary/ets.md) caching strategies that reduce database load, [Ecto](@/glossary/ecto.md) query plan analysis that identifies N+1 query patterns, connection pool sizing that balances throughput against resource consumption, and index management that keeps query performance optimal as data volumes grow. Every optimization recommendation is backed by EXPLAIN ANALYZE evidence and measured before-and-after benchmarks.

The specialist operates as the performance guardian for the entire data layer, ensuring that the platform's strict page load requirements (total page load under 250ms, server-side render under 100ms) are supported by a data layer that responds within its allocated time budget.

## Query Performance Analysis

Query performance analysis is the specialist's primary activity, continuously evaluating query execution characteristics across all platform applications.

EXPLAIN ANALYZE is the foundational tool for query analysis. The specialist captures execution plans for queries flagged by pg_stat_statements as high-frequency or high-latency, analyzing the plan tree to identify sequential scans on large tables, nested loop joins on unindexed columns, hash join build phase memory spills, and sort operations that exceed work_mem and spill to disk.

Query categorization groups queries by their performance characteristics and optimization potential. Hot queries (high frequency, high total execution time) receive priority attention because small improvements compound across many executions. Slow queries (low frequency, high per-execution time) may indicate missing indexes or suboptimal query structure. Growing queries (execution time increasing over time) may indicate data volume scaling issues that require architectural attention.

Plan stability analysis monitors whether PostgreSQL's query planner consistently selects the same execution plan for the same query across executions. Plan instability (the planner alternating between different plans) often indicates that table statistics are stale, that cost parameters are miscalibrated, or that the query is on the boundary between plan choices. The specialist investigates plan instability and resolves it through statistics updates, parameter tuning, or query restructuring.

Correlation analysis connects database query performance to application-level latency metrics, identifying which queries contribute most to user-visible response times. This correlation ensures that optimization efforts focus on queries with the greatest impact on user experience rather than queries that are slow but execute in background contexts where latency is less critical.

## N+1 Query Detection and Elimination

N+1 query patterns are one of the most common performance issues in applications using ORM frameworks like Ecto. The specialist implements systematic detection and elimination of these patterns.

Detection mechanisms combine static analysis of Ecto query construction with runtime telemetry that identifies query sequences characteristic of N+1 patterns. A query that executes once to fetch a list of entities followed by N separate queries that each fetch related data for one entity is a textbook N+1 pattern. The specialist's detection system identifies these patterns through query correlation analysis.

Elimination strategies depend on the specific Ecto pattern involved. Standard N+1 patterns are resolved through Ecto.Repo.preload/3 which loads related data in a single batch query. More complex patterns may require Ecto.Query.join/5 with explicit select clauses to fetch all required data in a single query. Aggregate N+1 patterns (loading counts or sums for each entity individually) are resolved through GROUP BY queries or subquery preloads.

Prevention through code review integrates N+1 detection into the CI/CD pipeline, flagging new code that introduces potential N+1 patterns before it reaches production. The specialist maintains detection heuristics that analyze Ecto query construction patterns in new code and flag suspicious patterns for review.

## Connection Pool Optimization

Ecto connection pool configuration directly affects the platform's ability to handle concurrent database requests without experiencing connection exhaustion or excessive queuing.

Pool sizing analysis examines the relationship between pool size, query execution time, concurrent request volume, and connection wait time. The specialist uses Little's Law to calculate the theoretical optimal pool size based on average query execution time and peak concurrent request rates, then adjusts for practical factors including connection creation overhead, transaction hold time, and connection health check frequency.

Checkout timeout configuration balances fail-fast behavior against request queuing. Too short a checkout timeout causes unnecessary request failures during load spikes. Too long a timeout causes request pile-up that degrades the entire application's responsiveness. The specialist tunes checkout timeouts based on observed queue depth distributions and SLA requirements.

Per-application pool isolation ensures that a misbehaving application cannot exhaust database connections for the entire platform. The specialist configures separate connection pools for each application in the umbrella, with pool sizes proportional to each application's query volume and latency requirements.

## Index Management

Strategic index management is essential for maintaining query performance as data volumes grow.

Index creation recommendations are based on actual query patterns captured through pg_stat_statements and application telemetry. The specialist identifies high-frequency queries that perform sequential scans on large tables and recommends appropriate index types: B-tree for equality and range queries, GIN for array and full-text search queries, GiST for geometric and range type queries, and partial indexes for queries that filter on specific value subsets.

Unused index detection identifies indexes that consume write overhead without providing read benefit. The specialist monitors pg_stat_user_indexes for indexes with zero or near-zero scan counts over extended observation periods. Confirmed unused indexes are candidates for removal, which improves write performance and reduces storage overhead.

Index bloat monitoring tracks the ratio of dead pages to live pages in each index, identifying indexes that need rebuilding to restore their space efficiency. The specialist schedules REINDEX operations during maintenance windows when bloat exceeds operational thresholds.

Composite index optimization evaluates whether multi-column indexes are ordered optimally for the queries that use them. PostgreSQL's leftmost prefix matching means that column order in composite indexes significantly affects their utility for different query patterns. The specialist analyzes the query workload to determine the optimal column ordering for each composite index.

## ETS Cache Coordination

The specialist designs and monitors ETS-based caching strategies that reduce database load for read-heavy access patterns.

Cache design identifies data categories suitable for ETS caching based on access frequency, data size, update frequency, and consistency requirements. Frequently read reference data with low update rates is an ideal caching candidate. Frequently updated transactional data is typically not suitable for caching.

Cache invalidation strategies ensure that cached data remains consistent with the authoritative database source. The specialist implements both time-based invalidation (TTL-based expiration) and event-based invalidation (cache refresh triggered by database change notifications) depending on the consistency requirements of each cached data category.

Cache effectiveness monitoring tracks hit rates, miss rates, and stale data detection rates for each cache, identifying caches that are not providing sufficient benefit to justify their memory consumption and maintenance overhead.

## Performance Regression Detection

The specialist maintains performance baselines and detects regressions that indicate degrading database performance.

Baseline establishment captures query performance metrics during stable operational periods, creating reference points against which future measurements are compared. Baselines include per-query execution time distributions, overall database throughput, and connection utilization patterns.

Regression detection compares current performance metrics against baselines using statistical significance testing. Small variations due to workload fluctuation are distinguished from genuine regressions that indicate schema changes, data growth effects, or query plan changes. Confirmed regressions trigger investigation and are reported with sufficient context for root cause analysis.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to mandate query optimization, require index changes, and block deployments that introduce known performance regressions.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [database-architecture-specialist](@/agents/database-architecture-specialist.md) | Coordinates on schema design decisions that impact query performance | Infrastructure |
| [database-migration-specialist](@/agents/database-migration-specialist.md) | Reviews migration scripts for performance impact before execution | Infrastructure |
| [database-core-specialist](@/agents/database-core-specialist.md) | Collaborates on core database operations and storage engine optimization | Infrastructure |

## Enforcement

The Database Performance Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No query optimization is claimed without EXPLAIN ANALYZE evidence. No index is added without measured query improvement. Performance regressions detected in CI are blocking -- the responsible changes must be fixed before merge. Database operations exceeding SLA thresholds trigger immediate investigation with zero tolerance for unaddressed slow queries. N+1 query patterns detected in new code are blocking violations that must be resolved before the code is approved for merge.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)