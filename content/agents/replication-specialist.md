+++
title = "replication-specialist"
weight = 352
[extra]
domain = "infrastructure"
level = "L3"
description = "Database replication setup and management expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["replication-specialist", "Database", "agents", "agent", "Prismatic Platform", "PostgreSQL", "Primary", "Eventual"]
tags = ["agents", "agent", "replication-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "replication-specialist - Prismatic Platform"
+++

## Overview

The replication-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, serving as the expert agent for database replication setup, configuration, monitoring, and management across the platform's [PostgreSQL](@/glossary/postgresql.md) infrastructure. In a platform processing intelligence data across multiple storage backends, replication is not merely a backup mechanism -- it provides read scaling, geographic distribution, disaster recovery, and zero-downtime maintenance capabilities essential for production reliability.

The replication-specialist manages PostgreSQL streaming replication, logical replication for selective data distribution, and [ETS](@/glossary/ets.md) table replication for in-memory state synchronization across distributed [BEAM](@/glossary/beam.md) nodes. Each replication topology serves different operational requirements: streaming replication provides byte-level consistency for disaster recovery, logical replication enables selective data distribution to analytical systems, and ETS replication ensures in-memory cache coherence across cluster nodes.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, the replication-specialist enforces strict data consistency guarantees. Replication lag monitoring is continuous, and the agent ensures that no client reads stale data without explicit acknowledgment of eventual consistency semantics. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that replication health claims are backed by measurable metrics, not assumed from configuration correctness.

## Replication Architecture

The platform's replication infrastructure operates at three levels, each serving distinct operational requirements.

**PostgreSQL streaming replication** provides physical replication of the primary database to one or more standby servers. The standby servers maintain byte-level copies of the primary, enabling rapid failover with minimal data loss (bounded by the `synchronous_commit` configuration). Streaming replication supports both synchronous mode (zero data loss, higher latency) and asynchronous mode (minimal latency, bounded data loss window). The replication-specialist manages the `recovery.conf` configuration, monitors replication lag through `pg_stat_replication`, and orchestrates failover procedures when primary database unavailability is detected.

**PostgreSQL logical replication** enables selective table-level replication from the primary database to subscriber databases. This supports scenarios including analytical database synchronization, cross-region data distribution, and major version upgrade testing. Logical replication operates through WAL decoding and publication/subscription mechanisms, allowing the specialist to configure precisely which tables and operations (INSERT, UPDATE, DELETE) are replicated.

**ETS table replication** synchronizes in-memory state across distributed BEAM nodes. The platform uses ETS extensively for caching (API catalog, agent registry, quality state), and the replication-specialist ensures cache coherence when multiple nodes serve the same data. ETS replication uses the platform's [GenServer](@/glossary/genserver.md)-based synchronization protocol with conflict resolution strategies appropriate to each cache type.

## Key Capabilities

- **Streaming replication management** -- Configures and monitors PostgreSQL streaming replication including WAL shipping, standby promotion, and automatic failover with bounded data loss guarantees
- **Logical replication orchestration** -- Manages publication/subscription configurations for selective table replication, supporting analytical synchronization and cross-region distribution
- **ETS cache coherence** -- Implements distributed [ETS](@/glossary/ets.md) table synchronization across BEAM cluster nodes with configurable conflict resolution strategies
- **Replication lag monitoring** -- Provides real-time replication lag measurement across all replication streams with configurable alerting thresholds
- **Failover automation** -- Orchestrates automatic failover from primary to standby with connection draining, standby promotion, and application connection reconfiguration
- **[Circuit breaker](@/glossary/circuit-breaker.md) integration** -- Applies circuit breaker patterns to replication streams, preventing cascading failures when replication targets become unavailable
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous replication health monitoring and automatic recovery
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for replication lag, throughput, and health metric tracking

## Replication Topology

| Stream Type | Source | Target | Consistency | Use Case |
|------------|--------|--------|-------------|----------|
| **Streaming Sync** | Primary PG | Standby PG | Strong | Disaster recovery |
| **Streaming Async** | Primary PG | Read replica | Eventual | Read scaling |
| **Logical** | Primary PG | Analytics DB | Eventual | Analytical queries |
| **ETS Sync** | Leader node | Follower nodes | Eventual | Cache coherence |
| **KuzuDB Sync** | Primary | Mirror | Eventual | Graph query scaling |

## Implementation Architecture

```elixir
defmodule PrismaticInfra.ReplicationSpecialist do
  @moduledoc """
  Database replication management agent handling PostgreSQL
  streaming/logical replication and ETS cache synchronization.
  """

  use GenServer
  alias PrismaticInfra.{StreamingReplication, LogicalReplication, ETSSync}

  @type replication_status :: %{
    streaming: %{lag_bytes: non_neg_integer(), state: atom()},
    logical: %{subscriptions: non_neg_integer(), state: atom()},
    ets: %{synced_tables: non_neg_integer(), conflicts: non_neg_integer()}
  }

  @spec health_check() :: {:ok, replication_status()} | {:error, term()}
  def health_check do
    with {:ok, streaming} <- StreamingReplication.status(),
         {:ok, logical} <- LogicalReplication.status(),
         {:ok, ets} <- ETSSync.status() do
      {:ok, %{streaming: streaming, logical: logical, ets: ets}}
    end
  end

  @spec failover(atom()) :: {:ok, atom()} | {:error, term()}
  def failover(target_standby) do
    with :ok <- drain_connections(),
         :ok <- StreamingReplication.promote(target_standby),
         :ok <- reconfigure_connections(target_standby) do
      {:ok, target_standby}
    end
  end
end
```

## Replication Monitoring Metrics

| Metric | Warning Threshold | Critical Threshold | Measurement |
|--------|------------------|-------------------|-------------|
| **Streaming Lag (bytes)** | >1 MB | >10 MB | `pg_stat_replication` |
| **Streaming Lag (time)** | >5 seconds | >30 seconds | WAL timestamp delta |
| **Logical Lag (LSN)** | >100 MB | >1 GB | Subscription state |
| **ETS Sync Conflicts** | >10/minute | >100/minute | Conflict counter |
| **Replication Slot Inactive** | >5 minutes | >30 minutes | Slot activity check |

## Failover Protocol

| Phase | Duration | Actions | Data Loss Risk |
|-------|----------|---------|---------------|
| **Detection** | <10 seconds | Health check failure, confirmed by retry | None |
| **Drainage** | <30 seconds | Connection draining, new connections refused | None |
| **Promotion** | <5 seconds | Standby promoted to primary | Bounded by async lag |
| **Reconfiguration** | <15 seconds | Application connections redirected | None |
| **Verification** | <30 seconds | Health checks, replication re-establishment | None |
| **Total** | <90 seconds | End-to-end automatic failover | Minimal |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to configure replication topologies, execute failover procedures, and manage cross-node data synchronization.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/replication status` | Display replication health across all streams | L3+ |
| `/replication failover` | Execute failover to specified standby | L3+ |
| `/replication configure` | Configure replication topology for a database | L3+ |
| `/replication lag` | Display real-time replication lag metrics | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [prismatic-supreme-commander](@/agents/prismatic-supreme-commander.md) | Failover decisions escalated for supreme approval |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Replication health is a quality metric |
| [prismatic-api-introspector](@/agents/prismatic-api-introspector.md) | API catalog ETS replication across cluster nodes |
| [route-testing-supreme](@/agents/route-testing-supreme.md) | Route testing verifies failover does not break endpoints |

## Enforcement

Replication management operates under the [NO MERCY](@/glossary/no-mercy.md) doctrine: replication lag exceeding critical thresholds triggers immediate automated response, and no deployment is permitted when replication health is degraded. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that replication status claims are backed by actual lag measurements, not configuration assumptions. The [Trinity Gate](@/glossary/trinity-gate.md) validates replication topology configurations for structural consistency before application.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)