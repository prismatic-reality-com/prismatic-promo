+++
title = "database-migration-specialist"
weight = 125
[extra]
domain = "infrastructure"
level = "L3"
description = "Safe database schema evolution with zero-downtime migration strategies, cross-application dependency resolution, and production migration safety review."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "ecto"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["database-migration-specialist", "Safe", "agents", "agent", "Prismatic Platform", "Migrations", "Migration", "Infrastructure"]
tags = ["agents", "agent", "database-migration-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "database-migration-specialist - Prismatic Platform"
+++

## Overview

The Database Migration Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent manages safe database schema evolution through zero-downtime migration strategies, ensuring that [PostgreSQL](/glossary/postgresql/) schema changes can be applied to production databases without service interruption, data loss, or application errors. In a continuously deployed platform, database migrations are among the highest-risk operations, and this specialist ensures they are executed with surgical precision.

Schema evolution in a 90-app [umbrella application](/glossary/umbrella-application/) architecture requires particular care because multiple applications may share database tables or depend on specific schema structures. The Database Migration Specialist evaluates every migration for backward compatibility, ensuring that the migration can be applied while the current application version is running and that the subsequent application version works correctly with both the pre-migration and post-migration schema. This two-version compatibility requirement is the foundation of zero-downtime migration.

The specialist serves as the gatekeeper for all production schema changes, combining automated safety analysis with expert review to prevent the migration failures that could cause production outages, data corruption, or extended maintenance windows.

## Zero-Downtime Migration Principles

Zero-downtime migration is not a single technique but a discipline that pervades every aspect of schema evolution planning and execution.

The expand-contract pattern forms the foundation of zero-downtime migration. Schema changes are decomposed into two phases: an expand phase that adds new structures (columns, tables, indexes) without removing or modifying existing ones, and a contract phase that removes deprecated structures after all application code has been updated to use the new schema. Between these phases, the schema supports both old and new application code simultaneously.

Column addition follows a strict sequence: add the column with a default value (or as nullable), update application code to write to the new column, backfill existing rows with appropriate values, and only then add NOT NULL constraints if required. Direct addition of a NOT NULL column without a default is rejected because it would fail on existing rows.

Column removal is never performed in the same deployment as the code change that stops using the column. The specialist enforces a minimum separation of one deployment between code removal and column removal, ensuring that rollback to the previous code version remains possible without schema modification.

Table lock avoidance is critical for zero-downtime operation. The specialist identifies migration operations that acquire AccessExclusiveLock (which blocks all concurrent access) and requires alternatives that use less restrictive locks. CREATE INDEX CONCURRENTLY replaces CREATE INDEX. ADD COLUMN with DEFAULT uses the PostgreSQL 11+ optimization that avoids full table rewrite. ALTER TYPE conversions use multi-step approaches that avoid lock escalation.

## Migration Safety Review

Every migration undergoes safety review before production execution, evaluating the migration against a comprehensive checklist of potential issues.

Lock analysis determines the lock types required by each migration statement and estimates the lock hold time based on table size and operation complexity. Migrations that hold AccessExclusiveLock for more than a configurable threshold (typically 10 seconds based on production table sizes) are rejected and must be redesigned.

Performance impact assessment estimates the migration execution time on production-scale data volumes. The specialist runs the migration against production-representative datasets in staging, measuring actual execution time and resource consumption. Migrations that exceed the deployment window or that would cause visible performance degradation during execution are flagged for optimization.

Backward compatibility verification confirms that the post-migration schema is compatible with the current running application code. This verification includes running the existing test suite against the new schema and confirming that all queries execute successfully, all ORM mappings remain valid, and all data constraints are satisfied.

Data integrity validation ensures that the migration preserves data integrity throughout its execution. For migrations that transform data (type changes, value normalization, data movement between tables), the specialist verifies that no data is lost, truncated, or corrupted during the transformation. Checksum verification before and after data transformation provides an additional safety layer.

## Cross-Application Migration Coordination

In the umbrella architecture, migrations may affect multiple applications that share database resources.

Dependency analysis identifies all applications that access the tables affected by a proposed migration. This analysis uses the platform's data access audit logs and [Ecto](/glossary/ecto/) schema definitions to build a comprehensive dependency map. Migrations that affect shared tables require coordination across all dependent applications.

Migration ordering resolves sequencing conflicts when multiple applications have pending migrations that affect shared resources. The specialist establishes a migration execution order that respects dependencies and ensures that each migration step leaves the database in a consistent state usable by all dependent applications.

Communication protocols ensure that application teams are notified of upcoming schema changes that affect their domain. The specialist publishes migration impact summaries that describe which tables are affected, what changes are being made, and whether any application code changes are required to accommodate the new schema.

## Rollback Strategy

Every migration must have a tested rollback path that can restore the previous schema state if issues are detected after migration execution.

Rollback script generation produces the inverse operations for each migration step. The specialist validates that rollback scripts can execute successfully against the post-migration schema and that the resulting schema matches the pre-migration state exactly. Rollback scripts are tested in staging as part of the migration review process.

Data preservation during rollback addresses the challenge that rollback may lose data added after the migration. For migrations that add new columns or tables, rollback must decide whether to discard data that has been written to the new structures. The specialist documents data loss implications of rollback for each migration and ensures that operators understand the trade-offs before production execution.

Partial rollback capability enables reverting specific migration steps rather than the entire migration sequence. This capability is essential when a multi-step migration has an issue in a later step but the earlier steps completed successfully and do not need reversal.

## Migration Testing Automation

The specialist manages automated testing infrastructure that validates migrations before production deployment.

Production-scale testing executes migrations against databases that match production data volumes and distribution characteristics. This testing catches performance issues that are invisible when testing against small development datasets, such as migrations that complete in seconds on test data but take hours on production-scale volumes.

Concurrent load testing executes migrations while the database is under simulated production load, verifying that migration operations do not cause query timeouts, deadlocks, or performance degradation for concurrent application queries.

Rollback testing validates that rollback scripts work correctly after migration application, ensuring that the rollback path is available if needed during production deployment.

Idempotency testing verifies that migrations can be safely re-run if they are interrupted and resumed, preventing the data corruption that can occur when a partially executed migration is retried without accounting for the work already completed.

## Migration Documentation

The specialist maintains comprehensive migration documentation that supports operational decision-making.

Migration impact documentation describes the purpose, scope, affected tables, performance characteristics, and rollback implications of each migration. This documentation is reviewed by the Deployment Commander before migration execution is authorized.

Migration history tracking maintains a complete record of all migrations applied to each environment, including execution timestamps, execution durations, and any issues encountered. This history supports incident investigation and audit requirements.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to approve or reject database migrations, mandate safety modifications, and sequence cross-application schema changes.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [database-architecture-specialist](/agents/database-architecture-specialist/) | Reviews schema design decisions that inform migration requirements | Infrastructure |
| [database-performance-specialist](/agents/database-performance-specialist/) | Assesses performance impact of proposed migrations on query patterns | Infrastructure |
| [deployment-commander-agent](/agents/deployment-commander-agent/) | Coordinates migration execution timing within deployment windows | Deployment |

## Enforcement

The Database Migration Specialist operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No migration reaches production without safety review and staging validation. Migrations that acquire exclusive locks on large tables are rejected and must be redesigned for concurrency safety. Every migration must have a tested rollback path. Migration execution in production is monitored in real time with automatic rollback if execution time exceeds projections by more than 2x. Cross-application migrations require documented impact assessment and explicit acknowledgment from all affected application teams.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)