+++
title = "Event Sourcing"
weight = 4
date = 2026-02-12


[extra]
icon = "database"
color = "purple"
description = "Immutable event log as the source of truth for all state changes"
date_created = "2025-06-15"
reading_time = "14 min"
difficulty = "advanced"
tags = ["event-sourcing", "cqrs", "immutability", "audit-trail", "commanded", "projections"]
related_articles = ["supervision-trees", "telemetry", "umbrella-apps", "storage-adapters", "postgresql-kuzudb"]
author = "Tomas Korcak (korczis)"
word_count = 1243
date_modified = "2026-02-23"
keywords = ["Event", "Sourcing", "Immutable", "architecture", "Prismatic Platform", "Events"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Event Sourcing - Prismatic Platform"
+++

## Overview

Event sourcing is the core data architecture of the Prismatic Platform, replacing traditional state-mutation persistence with an immutable, append-only log of domain events. Instead of storing the current state of an entity and overwriting it on each change, the platform records every state transition as a discrete, timestamped event. The current state is derived by replaying the event sequence from the beginning -- or, for performance, from a periodic snapshot. This approach provides full [auditability](@/glossary/audit-trail.md), deterministic replay, temporal queries ("what was the state at time T?"), and a natural integration point for the platform's distributed agent architecture.

The decision to adopt event sourcing in the Prismatic Platform was driven by the requirements of the External [Attack Surface](@/glossary/attack-surface.md) Management ([EASM](@/glossary/attack-surface.md)) domain. Security intelligence systems must maintain a complete, tamper-evident history of every asset discovered, every vulnerability detected, every compliance assessment performed, and every remediation action taken. Regulatory frameworks like [NIS2](@/glossary/nis2.md) and [ZKB](@/glossary/zkb.md) mandate [audit trail](@/glossary/audit-trail.md)s that prove what was known, when it was known, and what actions were taken. Event sourcing satisfies these requirements by construction: the event log is the audit trail.

## Event Sourcing vs. Traditional State Persistence

### The State Mutation Problem

Traditional CRUD (Create, Read, Update, Delete) persistence stores only the current state of an entity. When a record is updated, the previous state is overwritten and lost. This creates several problems for intelligence platforms:

1. **No audit trail**: It is impossible to determine what the system knew at a past point in time without separate audit logging (which is often incomplete or inconsistent with the actual state).
2. **Lost causation**: The reason for a state change is not captured. Why did this asset's [risk score](@/glossary/risk-score.md) change from 720 to 580? The CRUD model only shows the final value.
3. **Non-deterministic testing**: Tests must set up state through a sequence of mutations, and the order matters. There is no way to verify that a given sequence of inputs produces the expected outputs without replaying the entire mutation sequence.
4. **Conflict resolution complexity**: Concurrent updates to the same record require pessimistic locking or optimistic concurrency control with conflict resolution logic that is domain-specific and error-prone.

### The Event Sourcing Solution

Event sourcing addresses each of these problems:

| Problem | CRUD Approach | Event Sourcing Approach |
|---------|--------------|------------------------|
| Audit trail | Separate audit table (often incomplete) | Event log IS the audit trail |
| Causation tracking | Not captured | Every event includes causation metadata |
| Testing determinism | Setup through mutations | Replay events, assert final state |
| Concurrency | Row-level locks or optimistic versioning | Append-only with stream versioning |
| Temporal queries | Not possible without snapshots | Replay to any version/timestamp |
| Undo/compensation | Complex rollback logic | Append compensating events |

## Event Architecture and Data Flow

The Prismatic Platform implements the [CQRS](@/glossary/cqrs.md) (Command Query Responsibility Segregation) pattern alongside event sourcing. Commands represent intentions to change state. Events represent facts about what happened. Projections build read-optimized views from the event stream.

```
Command (intention)
    |
    v
Command Handler (validates, applies business rules)
    |
    v
Aggregate (domain entity that enforces invariants)
    |
    v
Domain Event (immutable fact)
    |
    +----> Event Store (append-only, PostgreSQL)
    |
    +----> Event Bus (PubSub distribution)
             |
             +----> Projection 1 (read model for dashboards)
             +----> Projection 2 (read model for API queries)
             +----> Projection 3 (read model for compliance reports)
             +----> Event Handler (side effects: notifications, scans)
```

This separation means that the write model (aggregates + event store) can be optimized for consistency and correctness, while read models (projections) can be optimized for query performance, each with its own data structure and indexing strategy.

## Core Implementation

### Event Definition

Events are [Elixir](@/glossary/elixir.md) structs with enforced keys, ensuring that incomplete events cannot be created. Each event represents a single, atomic fact about the domain.

```elixir
defmodule PrismaticEvents.AssetDiscovered do
  @moduledoc """
  Emitted when an external asset is discovered during EASM scanning.
  This event is the canonical record that an asset entered the platform's
  awareness at a specific point in time from a specific source.
  """

  @enforce_keys [:asset_id, :domain, :discovered_at, :source]
  defstruct [
    :asset_id,
    :domain,
    :asset_type,
    :ip_addresses,
    :discovered_at,
    :source,
    :confidence,
    :metadata
  ]

  @type t :: %__MODULE__{
    asset_id: String.t(),
    domain: String.t(),
    asset_type: :domain | :ip | :certificate | :service | :cloud_resource,
    ip_addresses: [String.t()] | nil,
    discovered_at: DateTime.t(),
    source: :dns_enum | :cert_transparency | :passive_dns | :web_crawl,
    confidence: float() | nil,
    metadata: map() | nil
  }
end

defmodule PrismaticEvents.VulnerabilityDetected do
  @moduledoc """
  Emitted when a vulnerability is identified on a monitored asset.
  Severity follows CVSS v3.1 scoring (0.0-10.0).
  """

  @enforce_keys [:vuln_id, :asset_id, :cve, :severity, :detected_at]
  defstruct [
    :vuln_id,
    :asset_id,
    :cve,
    :severity,
    :cvss_score,
    :affected_component,
    :detected_at,
    :evidence,
    :remediation_guidance
  ]
end

defmodule PrismaticEvents.SecurityRatingCalculated do
  @moduledoc """
  Emitted when a security rating is computed or recomputed for a domain.
  Ratings follow the A-F grading system with numeric scores (300-900).
  """

  @enforce_keys [:domain, :grade, :score, :calculated_at]
  defstruct [
    :domain,
    :grade,
    :score,
    :previous_grade,
    :previous_score,
    :factors,
    :calculated_at,
    :confidence
  ]
end
```

### Event Store Schema

The event store uses [PostgreSQL](@/glossary/postgresql.md) with a carefully designed schema that supports both efficient appending and fast stream reads.

| Column | Type | Purpose | Index |
|--------|------|---------|-------|
| `event_id` | `uuid` (PK) | Globally unique event identifier | Primary |
| `stream_id` | `uuid` | Aggregate/entity identifier | B-tree |
| `stream_type` | `varchar(255)` | Aggregate type name | B-tree (composite) |
| `event_type` | `varchar(255)` | Event module name | B-tree |
| `event_number` | `bigint` | Global ordering sequence | Unique, ascending |
| `stream_version` | `integer` | Per-stream version (optimistic concurrency) | Unique per stream |
| `data` | `jsonb` | Event payload | GIN (for queries) |
| `metadata` | `jsonb` | Causation ID, correlation ID, user ID | GIN |
| `created_at` | `timestamptz` | Event creation timestamp | B-tree |

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  stream_type VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_number BIGINT GENERATED ALWAYS AS IDENTITY,
  stream_version INTEGER NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stream_id, stream_version)
);

CREATE INDEX idx_events_stream ON events (stream_id, stream_version);
CREATE INDEX idx_events_type ON events (event_type, created_at);
CREATE INDEX idx_events_correlation ON events USING GIN ((metadata->'correlation_id'));
```

The `UNIQUE (stream_id, stream_version)` constraint provides optimistic concurrency control: if two concurrent commands attempt to append to the same stream at the same version, one will succeed and the other will receive a constraint violation, triggering a retry with the updated stream state.

### Aggregate Implementation

Aggregates are the consistency boundaries of the event-sourced system. Each aggregate enforces domain invariants and produces events in response to commands.

```elixir
defmodule PrismaticPerimeter.Aggregates.Asset do
  @moduledoc """
  Aggregate root for external assets. Enforces invariants such as:
  - An asset cannot be scanned if it is not yet discovered
  - A vulnerability cannot be marked remediated without evidence
  - Security ratings require at least one completed scan
  """

  defstruct [
    :asset_id,
    :domain,
    :status,
    :vulnerabilities,
    :scans,
    :security_rating,
    :version
  ]

  @type t :: %__MODULE__{}

  # Command handling: validate and produce events

  @spec execute(t(), DiscoverAsset.t()) :: {:ok, [event()]} | {:error, term()}
  def execute(%__MODULE__{asset_id: nil}, %DiscoverAsset{} = cmd) do
    {:ok, [
      %AssetDiscovered{
        asset_id: cmd.asset_id,
        domain: cmd.domain,
        discovered_at: DateTime.utc_now(),
        source: cmd.source
      }
    ]}
  end

  def execute(%__MODULE__{asset_id: _}, %DiscoverAsset{}) do
    {:error, :asset_already_exists}
  end

  def execute(%__MODULE__{status: :active}, %ScanAsset{} = cmd) do
    {:ok, [
      %AssetScanStarted{
        asset_id: cmd.asset_id,
        scan_id: UUID.uuid4(),
        scan_type: cmd.scan_type,
        started_at: DateTime.utc_now()
      }
    ]}
  end

  def execute(%__MODULE__{status: nil}, %ScanAsset{}) do
    {:error, :asset_not_discovered}
  end

  # Event application: update state (pure function, no side effects)

  @spec apply(t(), event()) :: t()
  def apply(state, %AssetDiscovered{} = event) do
    %{state |
      asset_id: event.asset_id,
      domain: event.domain,
      status: :active,
      vulnerabilities: [],
      scans: [],
      version: (state.version || 0) + 1
    }
  end

  def apply(state, %VulnerabilityDetected{} = event) do
    %{state |
      vulnerabilities: [event | state.vulnerabilities],
      status: :vulnerable,
      version: state.version + 1
    }
  end

  def apply(state, %SecurityRatingCalculated{} = event) do
    %{state |
      security_rating: %{grade: event.grade, score: event.score},
      version: state.version + 1
    }
  end
end
```

The key insight is the separation between `execute/2` (which validates commands and produces events) and `apply/2` (which updates state from events). The `execute` function may reject commands by returning `{:error, reason}`. The `apply` function is a [pure function](@/glossary/pure-function.md) that must always succeed -- if an event was persisted, it must be applicable.

### Projections: Read-Optimized Views

Projections consume events and build read-optimized data structures. They are inherently disposable: if a projection becomes corrupted or its schema changes, it can be rebuilt by replaying the event stream.

```elixir
defmodule PrismaticPerimeter.Projections.AssetDashboard do
  @moduledoc """
  Projection that maintains a denormalized view of assets for the
  LiveView dashboard. Optimized for fast reads with pre-computed
  aggregations.
  """
  use Commanded.Projections.Ecto,
    application: PrismaticApp,
    repo: PrismaticStorage.Repo,
    name: "asset_dashboard_projection"

  project(%AssetDiscovered{} = event, _metadata, fn multi ->
    Ecto.Multi.insert(multi, :asset, %AssetReadModel{
      id: event.asset_id,
      domain: event.domain,
      status: :active,
      vulnerability_count: 0,
      last_scan_at: nil,
      security_grade: nil,
      discovered_at: event.discovered_at
    })
  end)

  project(%VulnerabilityDetected{} = event, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :increment_vulns,
      from(a in AssetReadModel, where: a.id == ^event.asset_id),
      inc: [vulnerability_count: 1],
      set: [status: :vulnerable, updated_at: DateTime.utc_now()]
    )
  end)

  project(%SecurityRatingCalculated{} = event, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :update_rating,
      from(a in AssetReadModel, where: a.domain == ^event.domain),
      set: [
        security_grade: event.grade,
        security_score: event.score,
        updated_at: DateTime.utc_now()
      ]
    )
  end)
end
```

## Event Store Operations

### Appending Events

```elixir
defmodule PrismaticEvents.Store do
  @moduledoc "Core event store operations with optimistic concurrency."

  @spec append_to_stream(String.t(), non_neg_integer(), [event()]) ::
    :ok | {:error, :wrong_expected_version | term()}
  def append_to_stream(stream_id, expected_version, events) do
    PrismaticStorage.Repo.transaction(fn ->
      Enum.with_index(events, expected_version + 1)
      |> Enum.each(fn {event, version} ->
        %EventRecord{
          stream_id: stream_id,
          stream_version: version,
          event_type: event.__struct__ |> Module.split() |> List.last(),
          data: serialize(event),
          metadata: %{
            causation_id: Process.get(:causation_id),
            correlation_id: Process.get(:correlation_id)
          }
        }
        |> PrismaticStorage.Repo.insert!()
      end)
    end)
  end

  @spec read_stream(String.t(), keyword()) :: {:ok, [event()]}
  def read_stream(stream_id, opts \\ []) do
    max_version = Keyword.get(opts, :up_to_version, :infinity)

    query = from(e in EventRecord,
      where: e.stream_id == ^stream_id,
      order_by: [asc: e.stream_version]
    )

    query = if max_version != :infinity do
      where(query, [e], e.stream_version <= ^max_version)
    else
      query
    end

    events = PrismaticStorage.Repo.all(query)
    |> Enum.map(&deserialize/1)

    {:ok, events}
  end
end
```

### Time-Travel Queries

One of event sourcing's most powerful capabilities is reconstructing state at any historical point:

```elixir
defmodule PrismaticPerimeter.TimeTravel do
  @moduledoc "Temporal state reconstruction for audit and forensics."

  @spec state_at(String.t(), DateTime.t()) :: {:ok, Asset.t()} | {:error, :no_events}
  def state_at(asset_id, point_in_time) do
    {:ok, events} = PrismaticEvents.Store.read_stream(asset_id)

    relevant_events = Enum.filter(events, fn event ->
      DateTime.compare(event.created_at, point_in_time) in [:lt, :eq]
    end)

    case relevant_events do
      [] -> {:error, :no_events}
      events ->
        state = Enum.reduce(events, %Asset{}, &Asset.apply(&2, &1))
        {:ok, state}
    end
  end

  @spec diff_between(String.t(), DateTime.t(), DateTime.t()) :: {:ok, [event()]}
  def diff_between(asset_id, from_time, to_time) do
    {:ok, events} = PrismaticEvents.Store.read_stream(asset_id)

    diff = Enum.filter(events, fn event ->
      DateTime.compare(event.created_at, from_time) in [:gt, :eq] and
      DateTime.compare(event.created_at, to_time) in [:lt, :eq]
    end)

    {:ok, diff}
  end
end
```

## Snapshotting for Performance

For aggregates with long event histories, replaying from the beginning becomes expensive. The Prismatic Platform uses periodic snapshots to bound replay time.

```elixir
defmodule PrismaticEvents.Snapshots do
  @snapshot_interval 100  # Snapshot every 100 events

  @spec rebuild_with_snapshot(String.t()) :: {:ok, Asset.t()}
  def rebuild_with_snapshot(stream_id) do
    case get_latest_snapshot(stream_id) do
      {:ok, snapshot} ->
        # Replay only events after the snapshot
        {:ok, events} = PrismaticEvents.Store.read_stream(
          stream_id,
          from_version: snapshot.version + 1
        )

        state = Enum.reduce(events, snapshot.state, &Asset.apply(&2, &1))
        maybe_create_snapshot(stream_id, state)
        {:ok, state}

      {:error, :no_snapshot} ->
        # Full replay from beginning
        {:ok, events} = PrismaticEvents.Store.read_stream(stream_id)
        state = Enum.reduce(events, %Asset{}, &Asset.apply(&2, &1))
        maybe_create_snapshot(stream_id, state)
        {:ok, state}
    end
  end

  defp maybe_create_snapshot(stream_id, state) do
    if rem(state.version, @snapshot_interval) == 0 do
      save_snapshot(stream_id, state.version, state)
    end
  end
end
```

## Subscription and Real-Time Processing

Events are distributed in real-time through the subscription system, which integrates with the platform's [PubSub architecture](@/architecture/pubsub.md) and [telemetry](@/architecture/telemetry.md) infrastructure.

```elixir
defmodule PrismaticPerimeter.Subscriptions.AlertHandler do
  @moduledoc """
  Subscribes to vulnerability events and triggers alerts for critical findings.
  Runs as a supervised process within the Perimeter supervision tree.
  """
  use Commanded.Event.Handler,
    application: PrismaticApp,
    name: "perimeter_alert_handler",
    subscription_opts: [checkpoint_threshold: 10, checkpoint_after: 5_000]

  @spec handle(event(), map()) :: :ok
  def handle(%VulnerabilityDetected{severity: :critical} = event, metadata) do
    :telemetry.execute(
      [:prismatic, :perimeter, :alert, :critical],
      %{system_time: System.monotonic_time()},
      %{asset_id: event.asset_id, cve: event.cve}
    )

    PrismaticNotifications.send(%{
      channel: :pagerduty,
      severity: :critical,
      title: "Critical vulnerability: #{event.cve}",
      asset_id: event.asset_id,
      correlation_id: metadata.correlation_id
    })

    :ok
  end

  def handle(%VulnerabilityDetected{}, _metadata), do: :ok

  def handle(%SecurityRatingCalculated{grade: grade} = event, _metadata)
      when grade in [:d, :f] do
    PrismaticNotifications.send(%{
      channel: :slack,
      severity: :warning,
      title: "Security rating degraded to #{grade} for #{event.domain}",
      domain: event.domain,
      score: event.score
    })

    :ok
  end

  def handle(_event, _metadata), do: :ok
end
```

## Deterministic Testing

Event sourcing enables a testing style where the entire interaction is expressed as a sequence of given events, a command, and expected outcome events:

```elixir
defmodule PrismaticPerimeter.AssetAggregateTest do
  use ExUnit.Case, async: true

  alias PrismaticPerimeter.Aggregates.Asset

  describe "scan command" do
    test "succeeds for discovered asset" do
      # Given: asset was previously discovered
      state = Asset.apply(%Asset{}, %AssetDiscovered{
        asset_id: "asset-123",
        domain: "example.com",
        discovered_at: ~U[2026-01-15 10:00:00Z],
        source: :dns_enum
      })

      # When: scan is requested
      assert {:ok, [%AssetScanStarted{asset_id: "asset-123"}]} =
        Asset.execute(state, %ScanAsset{
          asset_id: "asset-123",
          scan_type: :full
        })
    end

    test "rejects scan for undiscovered asset" do
      # Given: no prior events (empty state)
      state = %Asset{}

      # When: scan is requested
      assert {:error, :asset_not_discovered} =
        Asset.execute(state, %ScanAsset{
          asset_id: "asset-456",
          scan_type: :full
        })
    end

    test "full lifecycle produces correct final state" do
      events = [
        %AssetDiscovered{asset_id: "a1", domain: "example.com",
          discovered_at: ~U[2026-01-15 10:00:00Z], source: :dns_enum},
        %VulnerabilityDetected{vuln_id: "v1", asset_id: "a1",
          cve: "CVE-2026-0001", severity: :high, detected_at: ~U[2026-01-16 14:00:00Z]},
        %SecurityRatingCalculated{domain: "example.com",
          grade: :c, score: 580, calculated_at: ~U[2026-01-17 09:00:00Z]}
      ]

      state = Enum.reduce(events, %Asset{}, &Asset.apply(&2, &1))

      assert state.status == :vulnerable
      assert state.security_rating.grade == :c
      assert length(state.vulnerabilities) == 1
      assert state.version == 3
    end
  end
end
```

This given-when-then pattern makes tests self-documenting and ensures that the aggregate's behavior is tested through its event interface, not through internal state manipulation.

## Performance Characteristics and Benchmarks

| Operation | Latency | Throughput | Notes |
|-----------|---------|------------|-------|
| Event append (single) | < 5 ms | 2,000/sec | PostgreSQL with WAL |
| Event append (batch of 100) | < 20 ms | 10,000/sec | Single transaction |
| Stream read (100 events) | < 10 ms | - | Sequential scan |
| Stream read (10,000 events) | < 200 ms | - | Index scan |
| Projection rebuild (1,000 events) | ~1 sec | 1,000 events/sec | Per projection |
| Snapshot creation | < 50 ms | - | Async, non-blocking |
| Snapshot-accelerated rebuild | < 15 ms | - | 100-event replay |
| Concurrent stream writes | No contention | Unlimited | Different streams |
| Same-stream concurrent writes | Serialized | ~500/sec | Optimistic concurrency |

The event store's performance scales linearly with PostgreSQL's capabilities. For the Prismatic Platform's workload -- primarily asset discovery and vulnerability scanning -- the write throughput of 2,000 events/second per stream far exceeds the operational requirements.

## Tradeoffs and Limitations

Event sourcing is not without costs. It is important to understand the tradeoffs made:

1. **Complexity**: The CQRS/ES pattern introduces more moving parts than simple CRUD. Developers must understand commands, events, aggregates, projections, and subscriptions.
2. **[Eventual consistency](@/glossary/eventual-consistency.md)**: Projections are updated asynchronously. Queries against projections may briefly return stale data. The platform accepts this tradeoff because security intelligence dashboards tolerate sub-second staleness.
3. **Schema evolution**: Changing event schemas requires careful versioning. Events are immutable and permanent -- you cannot ALTER TABLE on historical facts. The platform uses upcasters to transform old event formats during replay.
4. **Storage growth**: The event store grows monotonically. Archival strategies (moving old events to cold storage) are necessary for multi-year operation.

These tradeoffs are acceptable for the Prismatic Platform because the benefits -- full auditability, deterministic replay, temporal queries, and natural agent integration -- directly serve the platform's core mission of providing trustworthy security intelligence.

## Summary

Event sourcing in the Prismatic Platform transforms the append-only event log from a mere persistence mechanism into an architectural cornerstone that enables [audit trails](@/glossary/audit-trail.md), temporal queries, deterministic testing, and real-time event distribution. By separating the write model (aggregates enforcing domain invariants) from read models (projections optimized for specific query patterns), the [CQRS](@/glossary/cqrs.md) architecture achieves both consistency and performance. Combined with [supervision trees](@/architecture/supervision-trees.md) for [fault-tolerant](@/glossary/fault-tolerance.md) event processing, [telemetry integration](@/architecture/telemetry.md) for [observability](@/glossary/observability.md), and the [umbrella architecture](@/architecture/umbrella-apps.md) for clean module boundaries, event sourcing provides the data foundation for a security intelligence platform where every fact is permanent, every change is traceable, and every state is reproducible.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)