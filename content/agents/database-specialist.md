+++
title = "database-specialist"
weight = 127
[extra]
domain = "development"
level = "L3"
description = "PostgreSQL expertise including schema design, Ecto migration management, query optimization, indexing strategy, cross-storage coordination, and data integrity enforcement."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload", "postgresql", "kuzudb", "meilisearch"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["database-specialist", "PostgreSQL", "Ecto", "agents", "agent", "Prismatic Platform", "Meilisearch"]
tags = ["agents", "agent", "database-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "database-specialist - Prismatic Platform"
+++

## Overview

The Database Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Development domain of the Prismatic Platform. This agent provides deep [PostgreSQL](/glossary/postgresql/) expertise including schema design, [Ecto](/glossary/ecto/) migration management, query optimization, indexing strategy, and data integrity enforcement. Every database schema change in the Prismatic ecosystem passes through this agent's review process to ensure correctness, performance, and backward compatibility with existing data.

Database operations in a platform with 90 [umbrella application](/glossary/umbrella-application/)s and multiple storage backends demand rigorous discipline. The Database Specialist ensures that Ecto schemas follow normalization best practices (typically 3NF), that migrations are reversible and idempotent, that indexes are strategically placed on frequently queried columns, and that complex queries use EXPLAIN ANALYZE for performance validation before deployment. The agent also manages the interaction between PostgreSQL and the platform's other storage systems including [ETS](/glossary/ets/) for in-memory caching, [Meilisearch](/glossary/meilisearch/) for full-text search, and [KuzuDB](/glossary/kuzudb/) for graph operations.

The Database Specialist serves as the primary point of contact for development teams working on database-related features, providing guidance that balances the immediate needs of feature development against the long-term health of the data layer.

## Schema Design Principles

Schema design in the Prismatic Platform follows principles that ensure data integrity, query performance, and evolutionary flexibility.

Normalization to Third Normal Form (3NF) is the default design approach. Every table should have a primary key, every non-key column should depend on the entire primary key, and every non-key column should depend only on the primary key. This discipline prevents update anomalies, reduces data redundancy, and provides a clean foundation for query optimization. Controlled denormalization is permitted when justified by documented performance requirements, but the normalization rationale must be preserved as documentation.

Type selection leverages PostgreSQL's rich type system rather than relying on generic string fields. The specialist mandates the use of appropriate types: UUID for identifiers, JSONB for semi-structured data, INET for network addresses, TSTZRANGE for time periods, and ENUM types for constrained value sets. Proper typing enables database-level validation that catches data quality issues that application-level validation might miss.

Constraint enforcement at the database level provides a safety net below application-level validation. NOT NULL constraints prevent missing required values. CHECK constraints enforce value ranges and format requirements. UNIQUE constraints prevent duplicate entries. Foreign key constraints maintain referential integrity. The specialist designs constraints that match the business rules without over-constraining the schema in ways that impede legitimate data operations.

Naming conventions ensure consistency across the platform's database schemas. Table names use plural snake_case. Column names use singular snake_case. Foreign key columns follow the pattern `referenced_table_id`. Index names follow the pattern `idx_table_column`. Constraint names follow the pattern `ck_table_description`. These conventions enable developers to work with any table in the platform's database without learning application-specific naming patterns.

## Ecto Schema and Changeset Design

The specialist provides guidance on Ecto schema design that bridges the gap between database schema and application code.

Schema module organization follows the platform convention of one schema module per database table, located in the owning application's schema directory. Each schema module defines both the database mapping and the changeset functions that validate data before database insertion. This co-location ensures that validation logic stays close to the data definition it protects.

Changeset design implements multi-level validation that separates concerns. Required field validation ensures all mandatory fields are present. Type casting validates that input values can be converted to the expected database types. Business rule validation implements domain-specific constraints that go beyond type checking. The specialist encourages composable changeset pipelines that allow different validation levels for different operations (create versus update, user input versus system input).

Association management ensures that Ecto associations (has_many, belongs_to, many_to_many) correctly reflect database foreign key relationships and provide appropriate preloading behavior. The specialist reviews association definitions for correct cardinality, cascade behavior, and preload performance characteristics.

## Query Optimization

Query optimization ensures that database operations meet the platform's performance requirements.

EXPLAIN ANALYZE usage is mandatory for queries that access large tables or perform complex joins. The specialist reviews execution plans to identify performance issues including sequential scans that should use indexes, hash joins that spill to disk due to insufficient work_mem, and nested loops that multiply query execution time with data volume growth.

Ecto query composition follows patterns that generate efficient SQL. The specialist guides developers toward queries that push filtering and aggregation to the database rather than performing these operations in application code. Subqueries, window functions, and common table expressions are preferred over multiple round-trips to the database. The specialist particularly watches for patterns where Ecto's composability tempts developers to build queries incrementally in ways that produce suboptimal SQL.

Batch operations replace individual row operations for bulk data processing. Ecto.Repo.insert_all/3 replaces individual inserts in loops. Ecto.Multi coordinates multiple related operations in a single transaction. Stream-based processing handles large result sets without loading them entirely into memory.

## Cross-Storage Coordination

The specialist manages data flow between PostgreSQL and the platform's other storage backends.

ETS cache management designs caching strategies that reduce PostgreSQL load for frequently accessed read-heavy data. The specialist determines which data categories benefit from caching, designs cache invalidation strategies that maintain consistency, and monitors cache effectiveness through hit rate tracking.

Meilisearch index synchronization maintains search indexes that reflect the current state of PostgreSQL data. The specialist designs synchronization mechanisms that update search indexes when database records change, handling the eventual consistency between PostgreSQL as the source of truth and Meilisearch as the search projection.

KuzuDB graph synchronization maintains graph database representations of entity relationships that originate in PostgreSQL relational tables. The specialist designs synchronization pipelines that project relational data into graph structures suitable for path-finding and pattern matching queries.

## Data Integrity Enforcement

Data integrity enforcement ensures that the platform's data remains consistent, complete, and accurate across all storage backends.

Database-level constraints provide the foundation of integrity enforcement. The specialist designs constraints that prevent invalid data from entering the database regardless of which application inserts it. This database-level safety net catches integrity violations that application-level validation might miss due to code defects or race conditions.

Referential integrity across applications uses convention-based foreign key management for cross-application references. The specialist designs integrity checking mechanisms that verify cross-application references during data insertion and provide periodic integrity audits that detect orphaned references.

Consistency monitoring detects inconsistencies between storage backends that should contain matching data. The specialist implements reconciliation processes that compare PostgreSQL records against their ETS cached copies, Meilisearch indexed copies, and KuzuDB graph projections, flagging discrepancies for investigation and correction.

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command with authority to review all database changes, mandate optimization, and enforce data integrity standards.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-specialist](/agents/code-specialist/) | Code Partner | Coordinates on Ecto schema code generation and database-related implementations |
| [data-integrity-specialist](/agents/data-integrity-specialist/) | Integrity Partner | Validates data integrity constraints and cross-system consistency |
| [database-performance-specialist](/agents/database-performance-specialist/) | Performance Partner | Collaborates on query optimization and index strategy decisions |

## Enforcement

All database operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No migration reaches production without reversibility verification and performance impact assessment. Every schema change must include corresponding test coverage for the affected data paths. Queries that exceed performance thresholds are blocked until optimized, and direct database access bypassing Ecto repositories is a quality gate violation with zero exceptions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)