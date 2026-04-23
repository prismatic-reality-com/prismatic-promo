+++
title = "Event Sourcing"
weight = 25
[extra]
category = "architecture"
description = "Persistence pattern storing state changes as an immutable sequence of domain events"
related_terms = ["cqrs", "eventual-consistency", "immutability", "stream-processing", "broadway", "data-pipeline", "etl", "domain-driven-design", "ecto", "structured-logging"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1161
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Event", "Sourcing", "Persistence", "glossary", "architecture", "Prismatic Platform", "Events", "Every"]
tags = ["glossary", "architecture", "event-sourcing", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Event Sourcing - Prismatic Platform"
+++

## Definition

Event sourcing is an architectural pattern where application state is not stored as mutable rows in a database but derived from an append-only, immutable log of domain events. Each state transition is captured as a discrete event -- "SecurityRatingCalculated," "AssetDiscovered," "ComplianceViolationDetected" -- and the current state of any entity is reconstructed by replaying its event history from the beginning. This inversion of the traditional persistence model, where updates overwrite previous values, provides capabilities that are impossible with mutable state: complete audit trails, temporal queries ("what was the security rating at 2 AM last Tuesday?"), and the ability to rebuild the entire system state by replaying the event log.

The pattern was formally articulated by Martin Fowler and popularized through Greg Young's work on CQRS (Command Query Responsibility Segregation), with which event sourcing is most naturally paired. In an event-sourced system, commands produce events, and events are the single source of truth. The current state is a projection -- a computed view derived from the event stream. Multiple projections can be maintained from the same event stream, each optimized for a different query pattern. This separation of recording (events) from presentation (projections) gives event-sourced systems remarkable flexibility: adding a new dashboard or report requires only creating a new projection and replaying existing events through it, without modifying the write path.

The Prismatic Platform employs event-sourcing principles across its evolution tracking, quality enforcement, and intelligence processing subsystems. The SEADF evolution framework records every generation transition, quality mutation, and healing cycle as immutable events, enabling full lineage from Generation 1 through 18. The [epistemic pipeline](@/glossary/epistemic-pipeline.md) treats evidence signals as events that flow through processing stages, each stage producing its own events that are appended to the pipeline's event log.

## Core Concepts

### Events as First-Class Citizens

In an event-sourced system, events are not side effects of state changes -- they are the state changes. An event represents something that happened in the domain, expressed in past tense using the ubiquitous language of the [bounded context](@/glossary/bounded-context.md).

| Event Property | Description | Example |
|----------------|-------------|---------|
| **Identity** | Unique event ID, typically a UUID | `evt_a1b2c3d4-...` |
| **Timestamp** | When the event occurred (microsecond precision) | `2026-01-15T14:32:07.123456Z` |
| **Type** | Domain event name in past tense | `SecurityRatingCalculated` |
| **Aggregate ID** | Entity the event belongs to | `domain:example.com` |
| **Payload** | Event-specific data | `%{grade: :B, score: 780}` |
| **Metadata** | Causation, correlation IDs, user context | `%{caused_by: "cmd_xyz", user: "system"}` |
| **Version** | Sequence number within the aggregate | `42` |

### Event Store Architecture

The event store is an append-only database optimized for two operations: appending events to a stream and reading events from a stream in order. It never updates or deletes events -- [immutability](@/glossary/immutability.md) is the defining property.

```
┌─────────────────────────────────────────────────────────┐
│                    Event Store                           │
│                                                          │
│  Stream: domain:example.com                              │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐   │
│  │ Event 1 │ Event 2 │ Event 3 │ Event 4 │ Event 5 │   │
│  │ Created │ Scanned │ Rated   │ Flagged │ Re-rated│   │
│  │ v1      │ v2      │ v3      │ v4      │ v5      │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                                                          │
│  Stream: agent:security-scanner                          │
│  ┌─────────┬─────────┬─────────┐                        │
│  │ Event 1 │ Event 2 │ Event 3 │                        │
│  │ Started │ Scanned │ Stopped │                        │
│  └─────────┴─────────┴─────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### State Reconstruction

Current state is always derivable from the event history by applying a fold (reduce) operation:

```elixir
defmodule SecurityRating.Aggregate do
  defstruct [:domain, :grade, :score, :history, version: 0]

  def apply_event(%__MODULE__{} = state, %AssetDiscovered{} = event) do
    %{state |
      domain: event.domain,
      history: [event | state.history],
      version: state.version + 1
    }
  end

  def apply_event(%__MODULE__{} = state, %SecurityRatingCalculated{} = event) do
    %{state |
      grade: event.grade,
      score: event.score,
      history: [event | state.history],
      version: state.version + 1
    }
  end

  def apply_event(%__MODULE__{} = state, %ComplianceViolationDetected{} = event) do
    new_grade = downgrade_for_violation(state.grade, event.severity)
    %{state |
      grade: new_grade,
      history: [event | state.history],
      version: state.version + 1
    }
  end

  # Reconstruct state from event history
  def from_events(events) do
    Enum.reduce(events, %__MODULE__{}, &apply_event(&2, &1))
  end
end
```

## Event Replay and Temporal Queries

### Full Replay

Replaying all events from the beginning reconstructs the complete current state. This enables powerful recovery scenarios: if a projection is corrupted or a new projection is needed, simply replay the event stream through the projection function.

### Point-in-Time Queries

By replaying events up to a specific timestamp or version, the system can reconstruct the state at any historical moment. This is invaluable for auditing, compliance, and debugging:

```elixir
# What was the security rating on January 1st?
events = EventStore.read_stream("domain:example.com",
  up_to: ~U[2026-01-01T00:00:00Z])

historical_state = SecurityRating.Aggregate.from_events(events)
# => %SecurityRating.Aggregate{grade: :C, score: 650, version: 23}
```

### Causal Analysis

Event streams enable causal analysis: "what event caused the rating to drop from B to C?" By examining the event immediately preceding a state change, the exact cause is always identifiable. This traceability satisfies the [provenance-mandatory](@/glossary/provenance-mandatory.md) axiom of [NABLA Infinity](@/glossary/nabla-infinity.md).

## Snapshotting

Replaying thousands of events to reconstruct state is computationally expensive. Snapshotting periodically captures the current state so that reconstruction only needs to replay events since the last snapshot.

| Strategy | Frequency | Trade-off |
|----------|-----------|-----------|
| **Every N events** | Every 100 events | Predictable replay cost; snapshot storage overhead |
| **Time-based** | Every hour | Calendar-aligned; variable replay cost |
| **On-demand** | When replay > threshold | Adaptive; unpredictable snapshot timing |
| **Generation-based** | On evolution transition | Aligned with platform generations (Gen 1-18) |

```elixir
defmodule SnapshotStore do
  def save_snapshot(aggregate_id, state, version) do
    %Snapshot{
      aggregate_id: aggregate_id,
      state: :erlang.term_to_binary(state),
      version: version,
      created_at: DateTime.utc_now()
    }
    |> Repo.insert!()
  end

  def load_with_snapshot(aggregate_id) do
    case get_latest_snapshot(aggregate_id) do
      nil ->
        # No snapshot: replay all events
        events = EventStore.read_stream(aggregate_id)
        Aggregate.from_events(events)

      snapshot ->
        # Replay only events after snapshot
        state = :erlang.binary_to_term(snapshot.state)
        events = EventStore.read_stream(aggregate_id,
          after_version: snapshot.version)
        Enum.reduce(events, state, &Aggregate.apply_event(&2, &1))
    end
  end
end
```

## CQRS Integration

Event sourcing and [CQRS](@/glossary/cqrs.md) are natural companions. Events produced by the write side (command handlers) feed into projections that build the read side (query models).

```
Command ──► Validate ──► Produce Events ──► Event Store
                                                │
                    ┌───────────────────────────┤
                    │               │            │
                    ▼               ▼            ▼
              Read Model 1   Read Model 2   Read Model 3
              (Dashboard)    (Search Index)  (Analytics)
              [ETS Cache]    [Meilisearch]   [TimescaleDB]
```

Each read model is a projection that subscribes to the event stream and maintains its own denormalized view of the data. Projections are disposable -- if a read model becomes corrupted, it can be rebuilt by replaying the event stream. This decoupling means read models can be added, removed, or redesigned without touching the write path.

In the Prismatic Platform, this pattern manifests as:

- **Write path**: Commands validated through quality gates, events persisted to [PostgreSQL](@/glossary/postgresql.md)
- **Dashboard projection**: Events projected into [ETS](@/glossary/ets.md) for [LiveView](@/glossary/liveview.md) real-time dashboards
- **Search projection**: Events projected into Meilisearch for full-text and semantic search
- **Analytics projection**: Events projected into [TimescaleDB](@/glossary/timescaledb.md) for time-series analysis

## Event Versioning and Schema Evolution

As the domain model evolves, event schemas change. Event sourcing requires a strategy for handling old events that predate schema changes.

| Strategy | Description | Complexity |
|----------|-------------|------------|
| **Upcasting** | Transform old events to new schema on read | Low (lazy migration) |
| **Versioned handlers** | Maintain handlers for each event version | Medium (code overhead) |
| **Copy-transform** | Rewrite event store with migrated events | High (one-time, comprehensive) |
| **Schema registry** | Store event schemas alongside events | Medium (self-describing events) |

```elixir
# Upcasting: transform v1 events to v2 on read
defmodule EventUpcast do
  def upcast(%{"type" => "SecurityRatingCalculated", "version" => 1} = event) do
    # v1 had "rating" field, v2 renamed to "grade" and added "score"
    %{event |
      "version" => 2,
      "data" => %{
        "grade" => Map.get(event["data"], "rating"),
        "score" => rating_to_score(Map.get(event["data"], "rating"))
      }
    }
  end

  def upcast(event), do: event
end
```

## Prismatic Platform Event Patterns

### SEADF Evolution Events

The SEADF framework records platform evolution as an event stream spanning Generations 1 through 18:

| Event Type | Description | Frequency |
|------------|-------------|-----------|
| `GenerationTransitioned` | Platform evolution to new generation | ~18 total (historical) |
| `QualityMutationApplied` | Quality gate improvement | Multiple per generation |
| `HealingCycleCompleted` | Autoheal cycle finished | Per session |
| `FitnessScoreUpdated` | Evolution fitness recalculated | Per mutation |
| `ConsciousnessTraitEmerged` | New consciousness trait detected | ~11 total |

### Telemetry as Events

The platform's [structured logging](@/glossary/structured-logging.md) and telemetry system follows event-sourcing principles. Every telemetry event is a timestamped, immutable record with a defined schema. The [Broadway](@/glossary/broadway.md) pipeline consumes these events for real-time processing, while the event log provides historical analysis.

## Benefits and Trade-offs

| Benefit | Description |
|---------|-------------|
| **Complete audit trail** | Every state change is recorded with timestamp and causation |
| **Temporal queries** | Reconstruct state at any point in history |
| **Debug-friendly** | Replay events to reproduce exact conditions of a bug |
| **Projection flexibility** | Add new read models without write-path changes |
| **Event-driven integration** | Natural boundary for [stream processing](@/glossary/stream-processing.md) pipelines |

| Trade-off | Mitigation |
|-----------|------------|
| **Storage growth** | Snapshotting + event archival to cold storage |
| **Replay latency** | Snapshots limit replay to recent events |
| **Schema evolution** | Upcasting + versioned event handlers |
| **Eventual consistency** | Acceptable for read models; write path is immediately consistent |
| **Complexity** | Worth it for domains with audit, temporal, or integration requirements |

## Related Terms

- [CQRS](@/glossary/cqrs.md) -- Natural companion pattern separating command and query responsibilities
- [Immutability](@/glossary/immutability.md) -- Core property of the append-only event log
- [Stream Processing](@/glossary/stream-processing.md) -- Real-time consumption and transformation of event streams
- [Broadway](@/glossary/broadway.md) -- Elixir library for concurrent, fault-tolerant event pipeline processing
- [Data Pipeline](@/glossary/data-pipeline.md) -- Infrastructure for moving events through processing stages
- [ETL](@/glossary/etl.md) -- Extract-Transform-Load patterns applied to event streams
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- Strategic design approach providing the ubiquitous language for events
- [Ecto](@/glossary/ecto.md) -- Elixir database layer used for event persistence and projections
- [Structured Logging](@/glossary/structured-logging.md) -- Logging pattern aligned with event sourcing principles
- [Eventual Consistency](@/glossary/eventual-consistency.md) -- Consistency model between event store and read projections
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- NABLA axiom satisfied by event sourcing's complete causation tracking
- [TimescaleDB](@/glossary/timescaledb.md) -- Time-series database for event analytics projections

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architectural patterns and event-driven design
- [Technologies](@/technologies/_index.md) -- Implementation technologies for event sourcing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)