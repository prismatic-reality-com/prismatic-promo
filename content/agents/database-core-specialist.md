+++
title = "database-core-specialist"
weight = 124
[extra]
domain = "infrastructure"
level = "L3"
description = "PostgreSQL engine internals, configuration tuning, WAL management, autovacuum optimization, and storage engine monitoring for production database health."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "timescaledb"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["database-core-specialist", "PostgreSQL", "agents", "agent", "Prismatic Platform", "Infrastructure", "Specialist"]
tags = ["agents", "agent", "database-core-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "database-core-specialist - Prismatic Platform"
+++

## Overview

The Database Core Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent provides deep expertise in [PostgreSQL](@/glossary/postgresql.md) internals, query execution mechanics, storage engine behavior, and low-level performance tuning that goes beyond application-level query optimization. While the Database Performance Specialist focuses on query patterns and [Ecto](@/glossary/ecto.md) usage, the Core Specialist addresses the fundamental database engine configuration, vacuum behavior, WAL management, and memory allocation that determine the platform's data layer capacity.

PostgreSQL's behavior at scale depends on dozens of configuration parameters that interact in complex ways. The Database Core Specialist manages these parameters -- shared_buffers, work_mem, effective_cache_size, checkpoint_completion_target, and autovacuum settings -- based on the platform's specific workload characteristics. It monitors WAL generation rates, dead tuple accumulation, table bloat, and index fragmentation to maintain database health at the engine level.

Understanding PostgreSQL at the engine level is essential for a platform that processes intelligence data with strict performance requirements. The difference between a well-tuned and a poorly-tuned PostgreSQL instance can be orders of magnitude in query performance, and the Core Specialist ensures that the platform operates on the well-tuned side of that spectrum.

## PostgreSQL Configuration Management

PostgreSQL configuration management requires balancing competing concerns across memory allocation, I/O behavior, concurrency, and reliability settings.

Memory configuration centers on shared_buffers (the shared memory buffer pool), work_mem (per-operation sort and hash memory), and maintenance_work_mem (memory for maintenance operations like VACUUM and CREATE INDEX). The specialist tunes these parameters based on the platform's memory budget, workload characteristics, and concurrency requirements. Shared_buffers is typically set to 25% of available RAM, but the optimal value depends on the specific workload mix between cached and non-cached data access patterns.

I/O configuration includes effective_io_concurrency (parallel I/O operations), random_page_cost (planner's estimate of random I/O cost relative to sequential I/O), and checkpoint-related parameters. The specialist tunes these settings based on the actual storage hardware characteristics: SSDs warrant different settings than spinning disks, and cloud-attached storage has different latency profiles than local storage.

Connection configuration covers max_connections, which interacts with shared_buffers allocation and the Ecto connection pool settings in each application. The specialist balances the need for sufficient connections to handle concurrent application requests against the per-connection memory overhead and the operating system limits on file descriptors and shared memory segments.

Logging configuration balances operational visibility against performance overhead. The specialist enables log_min_duration_statement for slow query detection, configures auto_explain for automatic EXPLAIN output on slow queries, and manages log rotation to prevent disk space exhaustion while maintaining sufficient log history for incident investigation.

## Autovacuum Management

PostgreSQL's MVCC (Multi-Version Concurrency Control) architecture requires regular vacuuming to reclaim space occupied by dead tuples. The specialist manages autovacuum configuration to prevent the problems that arise when vacuuming falls behind workload demands.

Dead tuple accumulation monitoring tracks the ratio of dead tuples to live tuples in frequently updated tables. When this ratio exceeds healthy thresholds, it indicates that autovacuum is not keeping pace with the update rate. The specialist adjusts autovacuum_vacuum_cost_delay and autovacuum_vacuum_cost_limit to increase vacuuming throughput while managing I/O impact on concurrent queries.

Table-specific autovacuum settings override global defaults for tables with unusual update patterns. High-update-rate tables (such as session state tables or telemetry buffers) require more aggressive vacuuming settings. Low-update-rate tables (such as reference data) can use less aggressive settings to reduce unnecessary overhead.

Transaction ID wraparound prevention is a critical safety concern. PostgreSQL's transaction ID space is finite, and if a table is not vacuumed before the transaction ID counter wraps around, the database must shut down to prevent data corruption. The specialist monitors transaction ID age across all tables and ensures that preventive vacuuming occurs well before wraparound thresholds are approached.

Bloat management extends beyond vacuuming to address table and index bloat that accumulates over time. The specialist monitors bloat levels through page inspection and pg_stat_user_tables, scheduling manual VACUUM FULL or pg_repack operations during maintenance windows when bloat exceeds operational thresholds.

## WAL Management

Write-Ahead Log (WAL) management directly affects both reliability and performance. The specialist tunes WAL configuration to balance crash recovery requirements against write performance.

Checkpoint configuration controls how frequently PostgreSQL writes dirty buffer pages to disk. The specialist tunes checkpoint_completion_target (typically 0.9 for smooth I/O distribution), max_wal_size (the WAL volume that triggers a checkpoint), and min_wal_size (the minimum WAL retention). These settings affect both write performance and crash recovery time.

WAL archiving configuration supports the platform's backup strategy. The specialist configures archive_command and related settings to ensure that WAL segments are archived to the backup system before being recycled, enabling point-in-time recovery. Archive lag monitoring detects delays in WAL archiving that could affect recovery point objectives.

Replication WAL settings configure streaming replication parameters including wal_level (set to replica or logical depending on replication requirements), max_wal_senders, and wal_keep_size. The specialist monitors replica lag and adjusts settings to ensure that replicas maintain acceptable freshness for read-only query offloading.

## Storage Engine Monitoring

The specialist implements comprehensive monitoring of PostgreSQL's storage engine internals through pg_stat views and extension modules.

Table-level statistics from pg_stat_user_tables track sequential scans, index scans, live and dead tuple counts, and last vacuum/analyze times. The specialist uses these statistics to identify tables that may need additional indexes (high sequential scan count on large tables), tables with excessive dead tuples, and tables that have not been analyzed recently.

Index health monitoring tracks index usage statistics, identifying unused indexes that consume write overhead without providing read benefit and missing indexes where sequential scans indicate opportunity for index creation. The specialist also monitors index bloat and corruption through pg_stat_user_indexes and periodic REINDEX operations.

Lock monitoring tracks lock contention through pg_stat_activity and pg_locks, identifying queries that hold locks for excessive durations, deadlock occurrences, and lock wait patterns that may indicate concurrency design issues in application code.

Buffer cache monitoring through pg_buffercache tracks cache hit rates and the distribution of cached pages across tables and indexes. The specialist uses this data to evaluate whether shared_buffers is appropriately sized and whether the working set of frequently accessed data fits within the cache.

## Extension Management

The specialist manages PostgreSQL extensions that extend the database's capabilities for platform-specific workloads.

[TimescaleDB](@/glossary/timescaledb.md) configuration manages hypertable creation, chunk interval sizing, compression policies, and continuous aggregate definitions for time-series workloads. The specialist tunes TimescaleDB parameters for optimal ingestion throughput while maintaining query performance on historical data ranges.

pg_stat_statements collects query execution statistics including call count, total execution time, mean execution time, and rows returned. The specialist uses pg_stat_statements as the primary source for query performance analysis, identifying the highest-impact optimization targets across all platform applications.

Additional extensions managed include pgcrypto for encryption operations, pg_trgm for trigram-based text search, and btree_gin for GIN index support on standard types.

## Backup and Recovery

The specialist ensures that database backup and recovery capabilities meet the platform's recovery point objectives (RPO) and recovery time objectives (RTO).

Backup strategy combines base backups with continuous WAL archiving to enable point-in-time recovery. The specialist schedules base backups at intervals that balance backup storage consumption against recovery time, and configures WAL archiving to ensure continuous recovery capability between base backups.

Recovery testing verifies backup integrity through periodic restoration tests in staging environments. The specialist schedules recovery drills that exercise the complete recovery process from backup restore through WAL replay to application validation, ensuring that the recovery procedure is documented, tested, and achievable within the stated RTO.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to modify PostgreSQL engine configuration, schedule maintenance operations, and mandate storage optimization across all database instances.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [database-performance-specialist](@/agents/database-performance-specialist.md) | Receives application-level query patterns that inform engine tuning decisions | Infrastructure |
| [database-architecture-specialist](@/agents/database-architecture-specialist.md) | Provides schema design context for storage engine optimization | Infrastructure |
| [backup-restore-specialist](@/agents/backup-restore-specialist.md) | Coordinates WAL and backup configuration for consistent recovery capability | Infrastructure |

## Enforcement

The Database Core Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Engine configuration changes must be backed by workload analysis evidence and tested in staging before production application. Autovacuum must never be disabled without documented justification and an alternative maintenance plan. WAL configuration must balance performance with recovery requirements -- no configuration that risks data loss is acceptable regardless of performance benefit. Transaction ID wraparound monitoring is mandatory and non-bypassable. Storage engine health metrics must be continuously monitored with alerts configured for critical thresholds.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)