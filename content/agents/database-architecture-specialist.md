+++
title = "database-architecture-specialist"
weight = 123
[extra]
domain = "architecture"
level = "L3"
description = "Data modeling, schema design, database technology selection, and polyglot persistence architecture for the multi-storage-backend Prismatic Platform."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts", "postgresql", "kuzudb", "timescaledb"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1850
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["database-architecture-specialist", "Data", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "PostgreSQL"]
tags = ["agents", "agent", "database-architecture-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "database-architecture-specialist - Prismatic Platform"
+++

## Overview

The Database Architecture Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Architecture domain of the Prismatic Platform. This agent provides data modeling expertise, schema design guidance, database technology selection strategies, and polyglot persistence architecture for the platform's multi-storage-backend infrastructure. With data distributed across [PostgreSQL](@/glossary/postgresql.md), [ETS](@/glossary/ets.md), [KuzuDB](@/glossary/kuzudb.md), [Meilisearch](@/glossary/meilisearch.md), and [TimescaleDB](@/glossary/timescaledb.md), the specialist ensures that each data category is stored in the most appropriate backend while maintaining consistency and accessibility across the storage ecosystem.

Database architecture in a 90-app [umbrella application](@/glossary/umbrella-application.md) platform demands discipline that goes beyond individual schema design. The specialist manages the global data model that spans all applications, ensuring that shared entities have consistent representations, that foreign key relationships across application boundaries are properly managed, and that data access patterns are optimized for each application's specific requirements without creating global performance bottlenecks.

The specialist also addresses the strategic dimension of database architecture: anticipating future data requirements, planning for scale, and ensuring that architectural decisions made today do not constrain the platform's evolution. Every data model decision is evaluated against both current requirements and the platform's strategic roadmap.

## Polyglot Persistence Strategy

The platform's polyglot persistence architecture assigns each data category to the storage backend best suited to its access patterns, consistency requirements, and performance characteristics.

PostgreSQL serves as the primary relational database for structured entity data, transactional operations, and data that requires ACID guarantees. The specialist designs PostgreSQL schemas with normalization best practices (typically 3NF), strategic denormalization for read-heavy access patterns, and appropriate indexing strategies. PostgreSQL's strength in complex queries with joins, aggregations, and window functions makes it the default choice for analytical workloads.

TimescaleDB extends PostgreSQL's capabilities for time-series data including telemetry metrics, security event logs, and temporal intelligence data. The specialist designs hypertable schemas that optimize for time-based queries with automatic partitioning, compression, and retention policies. TimescaleDB's continuous aggregate feature enables pre-computed time-series summaries that support dashboard queries without impacting raw data ingestion performance.

KuzuDB provides graph database capabilities for entity relationship data including ownership chains, social networks, transaction graphs, and intelligence link analysis. The specialist designs graph schemas with appropriate node and edge types, property definitions, and index configurations that support the path-finding and pattern matching queries central to intelligence operations.

ETS provides in-memory storage for high-frequency read access patterns including configuration caches, session data, agent registry state, and frequently accessed reference data. The specialist designs ETS table structures with appropriate access patterns (set, ordered_set, bag) and manages the trade-off between memory consumption and read performance.

Meilisearch provides full-text search capabilities for content search, entity name lookup, and document retrieval. The specialist designs search indexes with appropriate field weighting, filterable attributes, and ranking rules that balance relevance with performance.

## Schema Design Methodology

The specialist follows a structured schema design methodology that ensures consistency, correctness, and evolvability across all database schemas.

Conceptual modeling begins with entity-relationship diagrams that capture the business domain concepts, their attributes, and their relationships at a level independent of any specific database technology. This technology-agnostic modeling phase ensures that data design decisions are driven by business requirements rather than storage implementation details.

Logical modeling translates the conceptual model into technology-specific schemas for each storage backend. PostgreSQL schemas follow relational normalization principles. KuzuDB schemas follow graph modeling conventions with Cypher-compatible node and edge types. ETS table designs follow in-memory access pattern optimization. Each logical model preserves the semantics of the conceptual model while exploiting the strengths of its target storage backend.

Physical modeling addresses the implementation details that affect performance: index selection, partitioning strategies, table space allocation, and storage parameters. The specialist uses workload analysis and query pattern data from the Database Performance Specialist to inform physical modeling decisions that optimize for actual access patterns rather than theoretical worst cases.

Schema evolution planning ensures that every schema design includes a migration strategy for anticipated changes. The specialist evaluates schema decisions against likely future requirements and designs for extensibility where the cost is low, avoiding premature optimization of flexibility where future requirements are genuinely uncertain.

## Cross-Application Data Modeling

In a 90-app umbrella architecture, many entities are shared across applications. The specialist manages the global data model that defines these shared entities and their relationships.

Shared entity definitions establish canonical representations for entities that appear in multiple applications. A company entity in the intelligence domain must be compatible with the same company entity in the compliance domain, even if each domain adds domain-specific attributes. The specialist defines shared entity schemas in dedicated storage applications (prismatic_storage_core) that provide trait-based interfaces for common operations.

Cross-application foreign keys are managed through conventions rather than physical database constraints, because different applications may use different storage backends. The specialist defines referential integrity conventions that applications implement through their data access layers, with integration tests that verify referential integrity across application boundaries.

Data ownership boundaries define which application is authoritative for each entity attribute. When multiple applications maintain data about the same entity, the specialist designates one application as the authoritative source for each attribute category, preventing conflicting updates and establishing clear data provenance.

## Database Selection Framework

When new data storage requirements emerge, the specialist applies a structured evaluation framework to select the appropriate storage backend.

Access pattern analysis examines the expected read and write patterns: random access versus sequential scan, point queries versus range queries, simple lookups versus complex joins, real-time versus batch processing. Each pattern maps to storage backends with different suitability levels.

Consistency requirements assessment determines whether the data requires ACID transactions, eventual consistency, or relaxed consistency models. Data that participates in multi-step business processes typically requires ACID guarantees provided by PostgreSQL. Data that serves as a read-optimized projection of authoritative data can tolerate eventual consistency.

Scale projection estimates the expected data volume growth and query load growth over the platform's planning horizon. The specialist evaluates whether each candidate backend can accommodate projected growth without architectural changes, preferring backends that scale gracefully within the expected range.

## Performance Architecture

The specialist designs database architectures that meet the platform's performance requirements by combining storage backend selection with access pattern optimization.

Query path optimization designs data access paths that minimize the number of storage backend interactions required to satisfy common queries. This includes strategic denormalization, materialized views, and cross-backend data projection that pre-positions data in the storage backend most efficient for its primary access pattern.

Caching architecture designs multi-level caching strategies that reduce storage backend load for frequently accessed data. The specialist coordinates with the ETS cache layer to ensure that cache invalidation strategies maintain data consistency while maximizing cache hit rates.

Connection management designs connection pooling configurations for each storage backend that balance throughput against resource consumption, preventing connection exhaustion under load while avoiding the overhead of maintaining excessive idle connections.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to define data modeling standards, approve schema designs, and make database technology selection decisions across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [database-performance-specialist](@/agents/database-performance-specialist.md) | Performance Partner | Provides query performance data that informs schema design decisions |
| [database-migration-specialist](@/agents/database-migration-specialist.md) | Migration Partner | Implements schema changes designed by the architecture specialist |
| [database-core-specialist](@/agents/database-core-specialist.md) | Engine Partner | Provides PostgreSQL engine-level context for architecture decisions |
| [distributed-systems-specialist](@/agents/distributed-systems-specialist.md) | Distribution Partner | Coordinates on distributed data architecture across cluster nodes |

## Enforcement

All database architecture decisions are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No schema reaches production without architecture review. Data model changes that affect shared entities require cross-application impact assessment. Database technology selections must include documented trade-off analysis. Schema designs must include migration strategies for anticipated evolution. Performance-critical data paths must have documented access patterns with validated performance characteristics.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)