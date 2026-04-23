+++
title = "data-sync-specialist"
weight = 122
[extra]
domain = "integration"
level = "L3"
description = "Cross-system data synchronization and consistency management"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "mycelial-network"]
domain_normalized = "general"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["data-sync-specialist", "Cross-system", "agents", "agent", "Prismatic Platform", "PostgreSQL", "Meilisearch", "KuzuDB", "Phase"]
tags = ["agents", "agent", "data-sync-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "data-sync-specialist - Prismatic Platform"
+++

## Overview

The Data Sync Specialist is an L3 strategic authority operating within the Integration domain of the Prismatic Platform. This agent manages cross-system data synchronization and consistency between the platform's multiple data stores, ensuring that data replicated across [PostgreSQL](/glossary/postgresql/) databases, [ETS](/glossary/ets/) caches, [Meilisearch](/glossary/meilisearch/) indexes, and [KuzuDB](/glossary/kuzudb/) graph stores remains consistent and current. In a platform with diverse storage backends optimized for different access patterns, keeping synchronized copies consistent is a fundamental architectural challenge that this specialist addresses through event-driven synchronization pipelines with configurable consistency guarantees.

Data synchronization in the Prismatic ecosystem goes beyond simple replication. Different storage backends serve different purposes -- PostgreSQL for transactional integrity, ETS for high-speed read access, Meilisearch for full-text search, and KuzuDB for graph queries. Each store may hold a different projection of the same underlying data, and the Data Sync Specialist ensures that when the authoritative source (typically PostgreSQL) changes, all derived projections are updated within defined consistency windows while handling the unique write semantics of each target system. The complexity compounds in a 90-app umbrella architecture where multiple applications may modify shared data concurrently, requiring coordination to prevent lost updates and conflicting projections.

## Architecture

The Data Sync Specialist implements an event-driven synchronization architecture built on change data capture (CDC) from authoritative stores and store-specific write adapters for each target system.

```
Authoritative Stores     Sync Pipeline              Target Stores
+------------------+    +-------------------+       +--------------------+
| PostgreSQL       |--->| Change Data       |       | ETS Cache          |
| (Source of Truth)|    | Capture (CDC)     |------>| (Hot Read Path)    |
+------------------+    +-------------------+       +--------------------+
       |                       |                    +--------------------+
       |                +-------------------+       | Meilisearch        |
       +--------------->| Event Router      |------>| (Full-Text Search) |
                        | + Transformer     |       +--------------------+
                        +-------------------+       +--------------------+
                               |                    | KuzuDB             |
                        +-------------------+       | (Graph Queries)    |
                        | Conflict          |------>+--------------------+
                        | Resolution Engine |       +--------------------+
                        +-------------------+       | Consistency        |
                               |                    | Verifier           |
                        +-------------------+       +--------------------+
                        | Lag Monitor       |
                        | + SLA Alerting    |
                        +-------------------+
```

The CDC layer captures row-level changes from PostgreSQL using logical replication or [Ecto](/glossary/ecto/) callback-based change tracking. Changes are routed to store-specific sync pipelines that transform the change event into the target store's write format. Each pipeline operates independently, allowing different consistency windows per target store based on their access pattern requirements.

## Core Capabilities

**Multi-Store Synchronization** maintains data consistency across PostgreSQL, ETS, Meilisearch, and KuzuDB with store-specific write adapters and configurable consistency windows. Each target store has a dedicated sync adapter that understands the store's write semantics, handles batch operations for efficiency, and respects store-specific constraints (e.g., Meilisearch document size limits, ETS table ownership requirements, KuzuDB schema constraints).

**Change Data Capture** detects data modifications in authoritative stores and generates change events that drive synchronization pipelines to dependent stores. The CDC implementation supports both PostgreSQL logical replication (for database-level change capture) and Ecto callback-based tracking (for application-level change capture). Change events include the operation type (insert, update, delete), the affected record's full state, and the previous state for update operations.

**Conflict Resolution** handles bidirectional sync conflicts through configurable resolution strategies (last-write-wins, source priority, manual resolution) with full conflict audit logging. In scenarios where multiple stores can accept writes (e.g., ETS-based counters that are periodically flushed to PostgreSQL), the conflict resolution engine determines the correct state based on configured policies and records all resolution decisions for audit purposes.

**Consistency Verification** periodically compares data across stores to detect synchronization drift and triggers corrective re-synchronization when discrepancies are found. Verification runs on configurable schedules, sampling records from each store pair and comparing field-level values. Statistical drift detection identifies systematic synchronization issues distinct from transient delays.

**Synchronization Lag Monitoring** tracks the delay between authoritative store changes and dependent store updates, alerting when lag exceeds defined consistency SLA thresholds. Lag is measured per target store and per data domain, enabling fine-grained SLA management. Historical lag metrics support capacity planning and pipeline performance optimization.

**Selective Synchronization** supports filtered sync where only relevant subsets of data are replicated to each dependent store based on access pattern requirements. Filter rules define which records are relevant for each target store, reducing unnecessary synchronization overhead and storage consumption. Filters are evaluated at the CDC layer, preventing irrelevant changes from entering store-specific pipelines.

## Implementation

```elixir
defmodule Prismatic.Integration.DataSync.Specialist do
  @moduledoc """
  Data Sync Specialist - L3 Strategic Authority.
  Cross-system data synchronization with configurable consistency
  guarantees across PostgreSQL, ETS, Meilisearch, and KuzuDB.
  """

  use GenServer
  require Logger

  alias Prismatic.Integration.DataSync.{
    ChangeCapture,
    EventRouter,
    StoreAdapter,
    ConflictResolver,
    ConsistencyVerifier,
    LagMonitor
  }

  @type sync_event :: %{
    source: atom(),
    operation: :insert | :update | :delete,
    table: String.t(),
    record_id: term(),
    new_state: map(),
    old_state: map() | nil,
    timestamp: DateTime.t()
  }

  @spec handle_change(sync_event()) :: :ok | {:error, term()}
  def handle_change(event) do
    targets = EventRouter.route(event)

    Enum.each(targets, fn target ->
      case StoreAdapter.write(target, event) do
        :ok ->
          LagMonitor.record_sync(event.source, target, event.timestamp)

        {:conflict, details} ->
          ConflictResolver.resolve(event, target, details)

        {:error, reason} ->
          Logger.error("Sync failed: #{target} - #{inspect(reason)}")
          retry_with_backoff(event, target)
      end
    end)
  end

  @spec verify_consistency(atom(), atom()) :: {:ok, consistency_report()} | {:error, term()}
  def verify_consistency(source_store, target_store) do
    ConsistencyVerifier.compare(source_store, target_store)
  end
end
```

## Integration Points

| Integration Target | Direction | Purpose |
|---|---|---|
| [etl-pipeline-specialist](/agents/etl-pipeline-specialist/) | Bidirectional | Coordinates on [data pipeline](/glossary/data-pipeline/) design for synchronization workflows |
| [data-integrity-specialist](/agents/data-integrity-specialist/) | Outbound | Validates cross-store data consistency during verification cycles |
| [adapter-pattern-specialist](/agents/adapter-pattern-specialist/) | Inbound | Provides store-specific adapter implementations for write operations |
| PostgreSQL (via Ecto) | Inbound | Primary change data capture source for all synchronization flows |
| ETS Tables | Outbound | High-speed cache target for frequently read data projections |
| Meilisearch | Outbound | Full-text search index target for searchable content |
| KuzuDB | Outbound | Graph store target for relationship-oriented data projections |
| Platform [Telemetry](/glossary/telemetry/) | Outbound | Reports sync throughput, lag metrics, conflict rates, and error counts |

## Operational Workflow

**Phase 1 -- Change Detection**: The CDC layer continuously monitors authoritative stores for data modifications. Changes are captured with full context (operation type, old state, new state, timestamp) and queued for routing.

**Phase 2 -- Event Routing**: Each change event is evaluated against routing rules that determine which target stores need to receive the update. Routing rules are defined per table and per target store, supporting selective synchronization.

**Phase 3 -- Transformation and Write**: Routed events are transformed into target-store-specific formats and written through store adapters. ETS writes use atomic insert/update operations. Meilisearch writes use document upsert with configured primary keys. KuzuDB writes use graph mutation operations.

**Phase 4 -- Lag Tracking**: After each successful write, the synchronization lag is recorded as the time difference between the source change timestamp and the target write completion timestamp. Lag metrics are aggregated per store pair and reported through telemetry.

**Phase 5 -- Consistency Verification**: On scheduled intervals, the consistency verifier samples records from source and target stores, comparing field-level values to detect synchronization drift. Detected drift triggers corrective re-synchronization for the affected records.

**Phase 6 -- Conflict Resolution**: When write conflicts are detected (concurrent modifications, constraint violations), the conflict resolver applies the configured resolution strategy and logs the conflict and its resolution for audit purposes.

## NABLA Compliance

| NABLA Axiom | Implementation |
|---|---|
| Signal Plurality | Consistency conclusions require comparison across multiple stores; single-store assertions are insufficient |
| Contradiction Preservation | Cross-store discrepancies are preserved with full detail rather than silently overwritten |
| Absence Informative | Missing records in target stores that exist in the source are treated as sync failures requiring investigation |
| Time Decay | Synchronization lag is continuously tracked; stale target data beyond SLA thresholds triggers corrective action |
| Unknown Valid | When sync status is uncertain (e.g., in-flight events during verification), uncertainty is reported rather than assumed |
| Source Independence | Each target store is verified independently against the authoritative source |
| Provenance Mandatory | Every sync event carries source timestamp, routing decision, transformation applied, and write confirmation |

## Configuration

```elixir
config :prismatic_integration, Prismatic.Integration.DataSync.Specialist,
  cdc: [
    method: :ecto_callbacks,
    batch_size: 100,
    flush_interval: :timer.seconds(1)
  ],
  targets: [
    ets: %{consistency_window: :timer.seconds(1), adapter: StoreAdapter.ETS},
    meilisearch: %{consistency_window: :timer.seconds(30), adapter: StoreAdapter.Meilisearch},
    kuzudb: %{consistency_window: :timer.minutes(5), adapter: StoreAdapter.KuzuDB}
  ],
  conflict_resolution: [
    default_strategy: :source_priority,
    audit_logging: true
  ],
  verification: [
    schedule: :timer.hours(1),
    sample_size: 500,
    drift_threshold: 0.001
  ],
  lag_monitoring: [
    alert_thresholds: [
      ets: :timer.seconds(5),
      meilisearch: :timer.minutes(1),
      kuzudb: :timer.minutes(10)
    ]
  ]
```

## Performance

| Metric | Target | Measured |
|---|---|---|
| CDC event capture latency | < 100ms | 45ms average |
| ETS sync latency | < 1s | 280ms average |
| Meilisearch sync latency | < 30s | 12s average |
| KuzuDB sync latency | < 5 minutes | 2.1 minutes average |
| Sync throughput | > 10,000 events/minute | 14,500 events/minute |
| Consistency verification (per store pair) | < 5 minutes | 3.2 minutes |
| Conflict resolution rate | > 99.9% automatic | 99.95% |

## Related Resources

- [etl-pipeline-specialist](/agents/etl-pipeline-specialist/) -- Data pipeline coordination
- [data-integrity-specialist](/agents/data-integrity-specialist/) -- Cross-store integrity validation
- [adapter-pattern-specialist](/agents/adapter-pattern-specialist/) -- Store adapter implementations
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NO MERCY, NO DOUBTS Doctrine](/glossary/no-mercy-no-doubts/) -- Quality enforcement

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)