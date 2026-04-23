+++
title = "postgresql-specialist"
weight = 305
[extra]
domain = "infrastructure"
level = "L3"
description = "PostgreSQL administration, optimization, and advanced features expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2400
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["postgresql-specialist", "PostgreSQL", "agents", "agent", "Prismatic Platform", "Ecto", "ANALYZE", "Step"]
tags = ["agents", "agent", "postgresql-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "postgresql-specialist - Prismatic Platform"
+++

## Overview

The postgresql-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, providing deep expertise in [PostgreSQL](@/glossary/postgresql.md) administration, query optimization, schema design, and advanced features including extensions, partitioning, and replication. This agent ensures that the platform's primary relational data store operates at peak performance, with optimized query plans, proper indexing strategies, and efficient schema designs that support the platform's 90+ [umbrella applications](@/glossary/umbrella-application.md) through [Ecto](@/glossary/ecto.md) as the database interface layer.

Built on the [AIAD](@/glossary/aiad.md) standard, the PostgreSQL specialist monitors database performance continuously through [telemetry](@/glossary/telemetry.md) events, identifies slow queries through EXPLAIN ANALYZE integration, and recommends structural improvements based on workload analysis. The [NO MERCY](@/glossary/no-mercy.md) doctrine applies to database performance: no query exceeding 100ms for web-facing operations is acceptable, and no migration ships without rollback capability and data integrity verification.

## Operational Domain

The PostgreSQL infrastructure domain covers all aspects of relational database management within the platform. This includes schema design and migration management through [Ecto](@/glossary/ecto.md), query optimization through index strategy and query plan analysis, connection pool management, replication configuration, backup and recovery planning, and extension management (TimescaleDB for time-series data, PostGIS for geospatial, pgvector for embeddings).

| Database Concern | Scope | Performance Target |
|-----------------|-------|-------------------|
| Query Performance | All application queries | P95 < 100ms for web, < 500ms for batch |
| Connection Pooling | Ecto connection management | < 5ms checkout time |
| Schema Migrations | DDL changes across apps | Zero-downtime deployments |
| Index Strategy | B-tree, GIN, GiST, BRIN | < 10ms index lookup |
| Replication | Streaming replication | < 1s replication lag |
| Backup/Recovery | Automated backup pipeline | < 15min RPO, < 1hr RTO |

## Key Capabilities

- **Query optimization** -- Analyzes query execution plans using EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON), identifies sequential scans, nested loop inefficiencies, and missing indexes, and recommends targeted improvements
- **Schema design review** -- Evaluates database schema designs for normalization correctness, appropriate data types, constraint completeness, and index coverage before migration deployment
- **Connection pool tuning** -- Optimizes Ecto pool configurations (pool_size, queue_target, queue_interval) based on workload patterns and connection utilization metrics
- **Partition strategy** -- Designs table partitioning schemes for large tables using range, list, or hash partitioning to maintain query performance at scale
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed performance monitoring and automatic slow query detection
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing query timing, pool utilization, and database health metrics

## Query Optimization Framework

```elixir
defmodule Prismatic.Database.QueryOptimizer do
  @moduledoc """
  Analyzes and optimizes PostgreSQL queries through execution
  plan analysis and index recommendation.
  """

  alias Prismatic.Database.{PlanAnalyzer, IndexAdvisor, Telemetry}

  @type analysis :: %{
    query: String.t(),
    plan: map(),
    cost: float(),
    actual_time: float(),
    issues: [issue()],
    recommendations: [recommendation()]
  }

  @spec analyze_query(Ecto.Query.t()) :: {:ok, analysis()}
  def analyze_query(query) do
    {sql, params} = Ecto.Adapters.SQL.to_sql(:all, Prismatic.Repo, query)

    plan = execute_explain(sql, params)
    issues = PlanAnalyzer.identify_issues(plan)
    recommendations = IndexAdvisor.recommend(plan, issues)

    analysis = %{
      query: sql,
      plan: plan,
      cost: plan.total_cost,
      actual_time: plan.actual_total_time,
      issues: issues,
      recommendations: recommendations
    }

    if analysis.actual_time > 100 do
      Telemetry.emit_slow_query(analysis)
    end

    {:ok, analysis}
  end

  defp execute_explain(sql, params) do
    explain_sql = "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) #{sql}"
    {:ok, %{rows: [[plan_json]]}} = Ecto.Adapters.SQL.query(
      Prismatic.Repo, explain_sql, params
    )
    Jason.decode!(plan_json) |> List.first()
  end
end
```

### Ecto Migration Best Practices

```elixir
defmodule Prismatic.Repo.Migrations.AddSecurityRatingsIndex do
  @moduledoc """
  Adds concurrent index for security ratings lookup.
  Uses CREATE INDEX CONCURRENTLY for zero-downtime deployment.
  """

  use Ecto.Migration

  @disable_ddl_transaction true
  @disable_migration_lock true

  def change do
    create index(:security_ratings, [:domain, :assessed_at],
      name: :security_ratings_domain_assessed_idx,
      concurrently: true
    )

    create index(:security_ratings, [:grade],
      name: :security_ratings_grade_idx,
      concurrently: true,
      where: "grade IN ('D', 'F')"
    )
  end
end
```

## PostgreSQL Extensions

| Extension | Purpose | Use Case |
|-----------|---------|----------|
| TimescaleDB | Time-series optimization | Telemetry data, metric storage |
| pgvector | Vector similarity search | AI embeddings, semantic search |
| PostGIS | Geospatial data | Location intelligence, mapping |
| pg_stat_statements | Query performance tracking | Slow query identification |
| pg_trgm | Trigram text search | Fuzzy name matching, entity resolution |
| citext | Case-insensitive text | Email addresses, domain names |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to define database standards, approve schema migrations, and enforce query performance targets across all applications.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pg optimize` | Analyze and recommend optimizations for slow queries | L3+ |
| `/pg health` | Display database health metrics including connections, locks, and replication | L3+ |
| `/pg migration` | Review pending migration for safety, rollback capability, and performance impact | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [database-architecture-specialist](@/agents/database-architecture-specialist.md) | Collaborates on schema design and data modeling decisions |
| [database-performance-specialist](@/agents/database-performance-specialist.md) | Shares query performance data and optimization strategies |
| [database-migration-specialist](@/agents/database-migration-specialist.md) | Reviews migration safety and rollback procedures |
| [code-quality-commander](@/agents/code-quality-commander.md) | Enforces database code quality including query patterns |

## Query Plan Analysis Methodology

The postgresql-specialist follows a structured methodology for analyzing and optimizing query performance. This methodology produces measurable, evidence-based improvements rather than speculative optimization attempts.

### Step 1: Baseline Measurement

Before any optimization, the specialist captures a complete baseline using EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON). The baseline records total execution time, planning time, node-level execution times, buffer hits and reads (from shared buffers and disk), rows estimated vs. actual at each plan node, and join strategies selected by the planner. This baseline serves as the reference point for measuring improvement.

### Step 2: Issue Identification

The specialist analyzes the execution plan to identify specific issues. Common issues include sequential scans on large tables (indicating missing indexes), nested loop joins on large result sets (suggesting missing join indexes or need for hash/merge joins), large row estimate errors (indicating stale statistics requiring ANALYZE), excessive buffer reads (indicating poor cache utilization), and sort operations on large data sets (suggesting missing indexes that could provide pre-sorted access).

### Step 3: Targeted Optimization

Based on identified issues, the specialist applies targeted optimizations. For missing indexes, the specialist designs indexes that cover the specific access pattern while minimizing write overhead. For inefficient joins, the specialist evaluates whether query restructuring, index additions, or planner hint adjustments would be most effective. For statistics issues, the specialist adjusts the statistics target for affected columns and runs ANALYZE to refresh the planner's cost model.

### Step 4: Verification

After applying optimizations, the specialist captures a new execution plan and compares it against the baseline. Optimization is only considered successful if the measured improvement exceeds the noise threshold (typically 10% improvement for queries under 100ms, 20% for queries under 10ms). The before/after comparison is documented in the optimization record for future reference.

## Connection Pool Management

The postgresql-specialist configures and monitors [Ecto](@/glossary/ecto.md) connection pool settings across all platform applications. Connection pool tuning involves balancing three concerns: sufficient pool size to handle concurrent database requests, appropriate checkout timeout to prevent request queuing, and pool overflow limits to handle burst traffic without exhausting PostgreSQL connection slots.

The specialist monitors pool utilization metrics including checkout queue depth (requests waiting for a connection), checkout latency (time from request to connection delivery), and pool saturation (percentage of connections in active use). When checkout latency exceeds 5ms or queue depth exceeds 0 for sustained periods, the specialist evaluates whether pool size should be increased, whether slow queries should be optimized to reduce connection hold time, or whether read replicas should handle a portion of the query load.

## Partitioning Strategy

For tables that grow beyond hundreds of millions of rows, the specialist designs partitioning strategies that maintain query performance at scale. The specialist evaluates three partitioning methods based on access patterns: **range partitioning** (best for time-series data where queries filter by date range), **list partitioning** (best for categorical data where queries filter by a discrete set of values), and **hash partitioning** (best for evenly distributing data when no natural partition key exists). Partition pruning is verified through EXPLAIN analysis to confirm that the planner eliminates irrelevant partitions from query plans.

## Enforcement

All database operations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no query exceeding performance thresholds ships to production, migrations require rollback verification, and schema changes must pass data integrity checks. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that optimization recommendations are backed by EXPLAIN ANALYZE evidence. Index additions must demonstrate measurable query improvement through before/after benchmarking with [SEADF](@/glossary/seadf.md) performance tracking.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)