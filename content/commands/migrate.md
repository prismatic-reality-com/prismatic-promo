+++
title = "/migrate"
weight = 820
[extra]
category = "Architecture"
description = "Safe migration planning with rollback strategies"
syntax = "/migrate [options]"
authority = "L3"
agent = "migration-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1213
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["migrate", "Safe", "commands", "Architecture", "Prismatic Platform", "Subcommand", "Migration", "Migrations"]
tags = ["commands", "architecture", "migrate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/migrate - Prismatic Platform"
+++

## Overview

**/migrate** is a production command in the **Architecture** category of the Prismatic Platform. It provides safe migration planning with comprehensive rollback strategies for database schema changes, data transformations, API version transitions, and structural refactoring across the platform's 90+ application umbrella. In a system of this scale -- over 2.8 million lines of code across nearly 100 OTP applications -- migrations must be planned, validated, and executed with surgical precision to prevent production incidents.

The command goes beyond simple Ecto migration execution. While `mix ecto.migrate` handles individual database migrations, `/migrate` operates at a higher level of abstraction: it analyzes migration impact across the entire umbrella, identifies cross-application dependencies that could be affected, generates rollback plans before execution, validates data integrity constraints post-migration, and provides a unified interface for all types of migrations -- not just database schema changes.

This command operates under the **L3** authority level and is executed by the `migration-specialist` agent, a specialized architecture agent with deep knowledge of the platform's data model, application dependencies, and deployment topology. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority requirement reflects the potential production impact of migration operations, which can alter data structures, break API contracts, and affect running services.

The safety-first approach embodied by this command is informed by production incidents across the software industry where poorly planned migrations caused data loss, extended downtime, or subtle data corruption. Every feature of `/migrate` exists to prevent a specific category of migration failure: dependency analysis prevents cascade failures, rollback strategies ensure recoverability, dry-run capability enables pre-flight validation, and post-migration checks detect data integrity issues before they propagate.

## Architecture

The migration system is structured as a multi-stage pipeline with safety checks at each transition point.

```
+---------------------+     +---------------------+     +---------------------+
|  Migration Scanner  |---->|  Impact Analyzer     |---->|  Rollback Planner   |
|  (Discover Changes) |     |  (Dependency Graph)  |     |  (Revert Strategy)  |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Validation Engine  |---->|  Migration Executor  |---->|  Integrity Checker  |
|  (Pre-flight Checks)|     |  (Ordered Execution) |     |  (Post-migration)   |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Rollback Executor  |     |  Migration Log       |     |  Telemetry Sink     |
|  (Emergency Revert) |     |  (Audit Trail)       |     |  (Event Stream)     |
+---------------------+     +---------------------+     +---------------------+
```

The **Migration Scanner** discovers pending migrations across all applications in the umbrella, including Ecto migrations, data transformation scripts, configuration changes, and API version transitions. It produces a unified migration manifest that captures all pending changes.

The **Impact Analyzer** evaluates the dependency graph to determine which applications, tables, processes, and external integrations could be affected by each migration. It flags high-risk migrations that affect shared tables, critical path services, or external API contracts.

The **Rollback Planner** generates a complete rollback strategy for each migration, including reverse schema changes, data restoration procedures, and service rollback sequences. The rollback plan is validated for completeness before migration execution begins.

The **Validation Engine** performs pre-flight checks: schema compatibility, data constraint validation, resource availability (disk space, memory, connections), and timing analysis (estimated migration duration vs. maintenance window).

## Usage

### Migration Discovery

```bash
# Show all pending migrations across the umbrella
/migrate status

# Show detailed migration manifest with impact analysis
/migrate plan

# Show migrations for a specific application
/migrate status --app=prismatic_storage_ecto

# Show migration history
/migrate history --limit=20
```

### Migration Execution

```bash
# Execute all pending migrations with safety checks
/migrate run

# Execute a specific migration
/migrate run --migration=20260215120000_add_security_ratings

# Execute with explicit rollback plan verification
/migrate run --verify-rollback

# Dry run showing what would be executed without making changes
/migrate run --dry-run
```

### Rollback Operations

```bash
# Rollback the most recent migration
/migrate rollback

# Rollback to a specific version
/migrate rollback --to=20260214000000

# Rollback a specific number of migrations
/migrate rollback --step=3

# Preview rollback without executing
/migrate rollback --dry-run
```

### Analysis and Safety

```bash
# Full impact analysis for pending migrations
/migrate analyze

# Check data integrity after migration
/migrate verify

# Generate migration report for review
/migrate report --format=markdown

# Validate rollback plans for all pending migrations
/migrate validate-rollback
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | Subcommand | -- | Show pending migration status |
| `plan` | Subcommand | -- | Generate detailed migration plan with impact analysis |
| `run` | Subcommand | -- | Execute pending migrations |
| `rollback` | Subcommand | -- | Rollback executed migrations |
| `analyze` | Subcommand | -- | Full impact analysis |
| `verify` | Subcommand | -- | Post-migration integrity verification |
| `report` | Subcommand | -- | Generate migration report |
| `history` | Subcommand | -- | Show migration execution history |
| `--app` | String | all | Target specific application |
| `--migration` | String | all pending | Specific migration identifier |
| `--to` | String | none | Target version for rollback |
| `--step` | Integer | 1 | Number of migrations to rollback |
| `--dry-run` | Flag | false | Preview without execution |
| `--verify-rollback` | Flag | false | Verify rollback plan before execution |
| `--force` | Flag | false | Skip confirmation prompts (use with caution) |
| `--timeout` | Duration | 5m | Per-migration execution timeout |
| `--limit` | Integer | 10 | Limit for history results |
| `--format` | String | table | Output format (table, json, markdown) |
| `--verbose` | Flag | false | Show detailed execution logs |

## Execution Flow

1. **Authority Verification** -- L3 authority is confirmed for the requesting operator. Migration operations can have significant production impact.

2. **Migration Discovery** -- The scanner traverses all umbrella applications to discover pending migrations, building a comprehensive manifest.

3. **Impact Analysis** -- Each pending migration is analyzed for cross-application impact, shared resource conflicts, and dependency chain effects. High-risk migrations are flagged for additional review.

4. **Rollback Plan Generation** -- For each migration in the manifest, a complete rollback strategy is generated and validated. Migrations without valid rollback plans are flagged as high-risk.

5. **Pre-flight Validation** -- System prerequisites are checked: database connectivity, sufficient disk space, available connections, and estimated execution time within the maintenance window.

6. **Execution Ordering** -- Migrations are ordered based on inter-application dependencies, ensuring that shared schema changes execute before dependent application migrations.

7. **Sequential Execution** -- Migrations execute sequentially within a transaction where supported. Each migration's execution time, affected rows, and resource consumption are recorded.

8. **Post-Migration Verification** -- Data integrity checks run after each migration: constraint validation, index verification, referential integrity, and application-level consistency checks.

9. **Audit Logging** -- The complete migration execution record (timing, affected objects, row counts, verification results) is persisted in the migration log.

10. **Telemetry Emission** -- Migration events are emitted for operational visibility and alerting.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by the `migration-specialist` agent |
| [Ecto](@/glossary/ecto.md) | Database Layer | Core database migration infrastructure |
| [PostgreSQL](@/glossary/postgresql.md) | Database | Target database for schema migrations |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/Post Validation | Migration quality gate checks |
| [Telemetry](@/glossary/telemetry.md) | Observability | Migration execution metrics and events |
| [Prismatic API](@/apps/prismatic-api.md) | API Impact | API version migrations coordinated with gateway |
| [Supervision Trees](@/glossary/supervision-tree.md) | Process Impact | Process topology changes during migration |

## Best Practices

**Always Dry Run First**: Before executing any migration in a non-development environment, run `/migrate run --dry-run` to preview the execution plan, impact analysis, and rollback strategy.

**Verify Rollback Plans**: Use `/migrate run --verify-rollback` to ensure that every migration has a tested rollback strategy before execution. Migrations without rollback capability should be approached with extreme caution.

**Staged Execution**: For large migration sets, execute in stages rather than all at once. Use `--app` to migrate one application at a time, verifying each before proceeding.

**Post-Migration Verification**: Always run `/migrate verify` after executing migrations to catch data integrity issues before they propagate through the system.

**Document Data Migrations**: Data transformation migrations (as opposed to schema changes) should include comprehensive documentation about the transformation logic, affected data volumes, and expected outcomes.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Database connection failure | Fatal error with connection diagnostics | Verify database connectivity and credentials |
| Migration syntax error | Error with migration file path and error details | Fix migration source code |
| Timeout during execution | Migration aborted; state depends on transaction support | Check migration for long-running operations; increase timeout |
| Post-migration verification failure | Warning with integrity check details | Investigate and fix data issues; consider rollback |
| Rollback failure | Critical error with manual recovery instructions | Follow manual recovery procedures in error output |
| Insufficient disk space | Pre-flight failure with space requirements | Free disk space before proceeding |

## Advanced Usage

### Multi-Database Migration

For platforms with multiple database connections:

```bash
# Migrate specific database repository
/migrate run --repo=PrismaticStorage.Repo

# Migrate all repositories in dependency order
/migrate run --all-repos --ordered
```

### Data Migration with Transformation

Execute data transformation migrations with progress tracking:

```bash
# Run data migration with batch processing
/migrate run --migration=20260215_transform_ratings --batch-size=1000 --progress

# Resume an interrupted data migration
/migrate resume --migration=20260215_transform_ratings
```

### Migration Testing

Test migrations in isolation before applying to shared environments:

```bash
# Create a test database and run migrations against it
/migrate test --migration=20260215120000 --test-db=prismatic_migration_test

# Validate migration and rollback cycle
/migrate test-cycle --migration=20260215120000
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for migrations without rollback strategies. Every migration must have a validated rollback plan before execution. Migrations that fail post-execution verification trigger immediate investigation. No migration is considered complete until integrity checks pass.
- **NO DOUBTS**: Full impact analysis before execution. Every migration is analyzed for cross-application effects, dependency chain risks, and data integrity implications. The dry-run capability ensures operators can verify the complete execution plan before committing. Evidence-based verification replaces assumption-based confidence.

## Related Commands

- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/architect](@/commands/architect.md) - Architecture design and recommendation generation
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)