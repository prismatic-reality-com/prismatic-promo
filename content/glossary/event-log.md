+++
title = "Event Log"
description = "An immutable, append-only data structure that records a chronological sequence of events, serving as the authoritative audit trail and source of truth for system state reconstruction."
weight = 50

[extra]
category = "architecture"
tags = ["event-log", "audit", "immutable", "append-only", "event-sourcing", "wal", "cdc", "compliance", "traceability", "nis2"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["architects", "developers", "compliance-officers", "security-engineers"]
related_terms = ["event", "immutable-log", "event-sourcing", "wal", "audit-trail", "cdc", "streaming"]
key_concepts = ["append-only", "immutability", "ordering", "replay", "compaction", "retention", "partitioning"]
platforms = ["postgresql", "beam", "elixir", "kafka"]
prerequisites = ["event-driven-architecture", "database-fundamentals", "distributed-systems"]
use_cases = ["audit-compliance", "state-reconstruction", "debugging", "analytics", "change-data-capture"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["Event Log", "audit trail", "immutable", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Event Log - Prismatic Platform"
+++

## Definition and Overview

An event log is an ordered, append-only data structure that records events as they occur within a system. Each entry captures what happened, when it happened, and the relevant context, forming a permanent historical record that cannot be modified or deleted after creation. Event logs serve multiple purposes: they provide an authoritative audit trail for compliance requirements, enable state reconstruction through event replay, support debugging through temporal querying, and feed downstream analytics and reporting systems.

The immutability property of event logs is their defining characteristic. Unlike mutable state stores (traditional databases where records are updated in place), event logs preserve every state transition as a distinct entry. This means the complete history of an entity -- every change, every interaction, every decision -- is permanently recorded. To "undo" an operation, a compensating event is appended rather than deleting or modifying the original event. This design provides strong auditability guarantees required by regulations such as NIS2, GDPR (right to audit), SOC 2, and financial compliance frameworks.

Event logs have deep roots in computer science. The concept appears in database write-ahead logs (WAL), version control systems (Git's commit log), blockchain ledgers, and distributed consensus protocols (Raft, Paxos). In each case, the append-only log serves as the foundation for ensuring data integrity, enabling recovery after failures, and providing a deterministic replay mechanism for state reconstruction.

## Technical Deep Dive

### Event Log Properties

| Property | Description | Enforcement |
|----------|-------------|-------------|
| **Append-only** | New entries added at the end only | Database constraints, no UPDATE/DELETE |
| **Ordered** | Entries have a total or partial order | Monotonic sequence numbers or timestamps |
| **Immutable** | Written entries cannot be modified | Column constraints, application-level checks |
| **Durable** | Entries survive system restarts | WAL, fsync, replication |
| **Addressable** | Each entry has a unique position | Sequence number, offset, UUID |

### Log vs State Store

| Aspect | Event Log | State Store (CRUD) |
|--------|----------|-------------------|
| **Operations** | Append only | Create, Read, Update, Delete |
| **History** | Complete -- every change recorded | Only current state |
| **Recovery** | Replay from any point | Backup/restore only |
| **Schema evolution** | Each event versioned independently | Migration required |
| **Storage growth** | Grows monotonically | Bounded by entity count |
| **Query pattern** | Sequential scan or indexed lookup | Random access |
| **Consistency model** | Eventually consistent (with projections) | Immediately consistent |

### Retention and Compaction Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Full retention** | Keep all events forever | Regulatory compliance, audit |
| **Time-based** | Delete events older than N days/years | Operational logs, telemetry |
| **Snapshot + truncate** | Periodically snapshot state, truncate old events | High-volume event streams |
| **Compaction** | Keep only latest event per key | Changelog topics, CDC |
| **Archival** | Move old events to cold storage | Cost optimization |

### Log Partitioning

For high-throughput systems, event logs are partitioned to distribute write load and enable parallel consumption:

```
Partitioning Strategies:
  - By entity ID (hash)  -- all events for an entity in same partition
  - By event type        -- separate logs per event category
  - By time window       -- monthly/daily log tables
  - By source system     -- separate logs per producer
```

## Architecture and Implementation

Event log architecture consists of three layers: the write layer that appends events with ordering guarantees, the storage layer that durably persists events with efficient sequential and indexed access, and the read layer that provides event replay, filtering, and projection capabilities.

The write layer must ensure that events are appended atomically and assigned monotonically increasing sequence numbers. In PostgreSQL, this is achieved through sequences and row-level locks. In distributed systems, consensus protocols ensure that all nodes agree on the event order.

The storage layer uses structures optimized for sequential access (B-tree indexes on sequence numbers, partitioned tables by time range) and supports efficient range queries for replay. Compression and columnar storage reduce the cost of retaining large event volumes.

The read layer provides projection capabilities -- deriving current state by replaying events through projection functions. Projections can be materialized (pre-computed and stored) for read performance, or computed on-demand for flexibility. Multiple projections over the same event log enable different views of the same data without duplicating storage.

## Usage in Prismatic Platform

The Prismatic Platform maintains event logs for OSINT tool executions, DD pipeline operations, agent activities, and security events. PostgreSQL serves as the durable event store with ETS caches for recent event access.

```elixir
defmodule Prismatic.EventLog do
  @moduledoc """
  Append-only event log backed by PostgreSQL.
  Provides immutable audit trail for all platform
  operations with efficient replay capabilities.
  """

  use Ecto.Schema
  import Ecto.Query

  @type t :: %__MODULE__{
    sequence: integer(),
    event_type: String.t(),
    aggregate_id: String.t(),
    aggregate_type: String.t(),
    payload: map(),
    metadata: map(),
    occurred_at: DateTime.t(),
    recorded_at: DateTime.t()
  }

  @primary_key false
  schema "event_log" do
    field :sequence, :integer, primary_key: true, autogenerate: true
    field :event_type, :string
    field :aggregate_id, :string
    field :aggregate_type, :string
    field :payload, :map
    field :metadata, :map
    field :occurred_at, :utc_datetime_usec
    field :recorded_at, :utc_datetime_usec
  end

  @spec append(String.t(), String.t(), String.t(), map(), map()) :: {:ok, t()} | {:error, term()}
  def append(event_type, aggregate_type, aggregate_id, payload, metadata \\ %{}) do
    now = DateTime.utc_now()

    %__MODULE__{
      event_type: event_type,
      aggregate_type: aggregate_type,
      aggregate_id: aggregate_id,
      payload: payload,
      metadata: metadata,
      occurred_at: now,
      recorded_at: now
    }
    |> Prismatic.Repo.insert()
  end

  @spec replay(String.t(), String.t(), keyword()) :: list(t())
  def replay(aggregate_type, aggregate_id, opts \\ []) do
    from_sequence = Keyword.get(opts, :from, 0)
    limit = Keyword.get(opts, :limit, 10_000)

    __MODULE__
    |> where([e], e.aggregate_type == ^aggregate_type)
    |> where([e], e.aggregate_id == ^aggregate_id)
    |> where([e], e.sequence > ^from_sequence)
    |> order_by([e], asc: e.sequence)
    |> limit(^limit)
    |> Prismatic.Repo.all()
  end

  @spec stream_events(String.t(), keyword()) :: Enumerable.t()
  def stream_events(event_type, opts \\ []) do
    since = Keyword.get(opts, :since, ~U[2020-01-01 00:00:00Z])

    __MODULE__
    |> where([e], e.event_type == ^event_type)
    |> where([e], e.occurred_at >= ^since)
    |> order_by([e], asc: e.sequence)
    |> Prismatic.Repo.stream()
  end
end
```

The DD pipeline appends events for every fetch and load operation, enabling full reconstruction of entity import history. The OSINT toolbox logs every tool execution with parameters and results for audit compliance. The agent system records all orchestration decisions for post-incident analysis.

## Cross-References

- [Event](/glossary/event/) -- Individual event records
- **Immutable Log** -- Broader immutable logging patterns
- **Incident Reporting** -- NIS2 audit requirements
- [ACID Transactions](/glossary/acid-transactions/) -- Transactional event appending
- **Livebooks**: `storage_data/` notebooks demonstrate event log querying and replay
- **Academy**: Topics on event-driven architecture reference event logs

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
