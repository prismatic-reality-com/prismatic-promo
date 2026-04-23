+++
title = "Outbox Pattern"
weight = 45
[extra]
category = "architecture"
description = "Reliable event publishing through transactional outbox table polling, solving the dual-write problem in distributed systems"
related_terms = ["event-sourcing", "ecto", "postgresql", "eventual-consistency", "cqrs", "data-pipeline", "pubsub", "circuit-breaker"]
keywords = ["outbox pattern Elixir", "transactional outbox", "dual-write problem", "at-least-once delivery", "Ecto Multi transaction", "reliable event publishing", "distributed systems patterns", "outbox publisher GenServer"]
tags = ["architecture", "distributed-systems", "reliability", "event-driven"]
difficulty = "advanced"
audience = ["backend-engineers", "distributed-systems-architects", "platform-engineers"]
domain = "architecture"
stability = "stable"
since_version = "3.0.0"
pattern_type = "reliability"
delivery_guarantee = "at-least-once"
database_requirement = "PostgreSQL"
polling_mechanism = "GenServer"
concurrency_support = "FOR UPDATE SKIP LOCKED"
see_also = ["architecture", "technologies", "apps"]
prerequisites = ["ecto", "postgresql", "genserver", "eventual-consistency"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1711
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Outbox Pattern - Prismatic Platform"
+++

## Definition and Overview

The Outbox Pattern is a distributed systems design pattern that ensures reliable event publishing by writing events to a dedicated outbox table within the same database transaction as the business data change. A separate process -- the outbox publisher -- polls this table and forwards events to downstream consumers, guaranteeing at-least-once delivery without requiring distributed transactions. The pattern solves the fundamental dual-write problem: the impossibility of atomically updating a database and publishing a message to a broker, where either operation can independently fail, leading to state inconsistency between systems.

The pattern was formalized in the context of microservice architectures where services need to communicate state changes reliably without coupling themselves to message broker availability. By treating the database as the single source of truth for both business state and pending events, the outbox pattern converts the distributed consistency problem into a local transaction, which databases solve with well-understood ACID guarantees. This conversion is the key insight: instead of solving a distributed coordination problem (which is provably difficult per the FLP impossibility result), the pattern reduces it to a local coordination problem (which databases solve routinely).

The Outbox Pattern occupies a specific position in the reliability-complexity spectrum of distributed event publishing. It is more reliable than direct publish (which suffers from dual-write failures), simpler than two-phase commit (which requires a distributed coordinator), less infrastructure-heavy than Change Data Capture (which requires tools like Debezium), and more controllable than event sourcing (which requires replaying entire event streams). For systems built on [PostgreSQL](@/glossary/postgresql.md) with [Ecto](@/glossary/ecto.md), the pattern integrates naturally through `Ecto.Multi` transactions.

## Historical Context and Motivation

The dual-write problem has been a persistent challenge in distributed computing since the emergence of service-oriented architectures in the early 2000s. As monolithic applications were decomposed into services, the need for reliable inter-service communication became critical. The naive approach -- update the database, then publish an event -- fails in predictable ways: the publish can fail after the commit (losing the event), or the commit can fail after the publish (creating a phantom event).

Two-Phase Commit (2PC) protocols were the initial theoretical solution, but their practical deployment revealed fundamental limitations. 2PC is a blocking protocol: if the coordinator fails during the prepare phase, all participants are locked until the coordinator recovers. This makes 2PC unsuitable for high-availability systems where any component can fail independently. The CAP theorem formalized this limitation, demonstrating that distributed systems must choose between consistency and availability during network partitions.

The Outbox Pattern emerged as a pragmatic alternative that trades exact consistency for eventual consistency with at-least-once delivery -- a tradeoff that most distributed systems practitioners consider highly favorable. The pattern was popularized by Vaughn Vernon in "Implementing Domain-Driven Design" (2013) and has since become a standard technique in event-driven architectures.

## Technical Deep Dive

### Outbox Table Schema

The outbox table stores events with sufficient metadata for reliable delivery, idempotent processing, and operational debugging:

```sql
CREATE TABLE outbox_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id   VARCHAR(255) NOT NULL,
  event_type    VARCHAR(255) NOT NULL,
  payload       JSONB NOT NULL,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at  TIMESTAMP WITH TIME ZONE,
  retry_count   INTEGER DEFAULT 0,
  max_retries   INTEGER DEFAULT 5,
  status        VARCHAR(20) DEFAULT 'pending',
  schema_version VARCHAR(10) DEFAULT '1.0'
);

-- Partial index for efficient pending event polling
CREATE INDEX idx_outbox_pending ON outbox_events (status, created_at)
  WHERE status = 'pending';

-- Index for aggregate-based event lookup
CREATE INDEX idx_outbox_aggregate ON outbox_events (aggregate_type, aggregate_id);

-- Index for dead-letter analysis
CREATE INDEX idx_outbox_failed ON outbox_events (status, retry_count)
  WHERE status = 'failed';
```

The schema design reflects several important considerations. The `id` field uses UUID to enable generation without coordination. The `aggregate_type` and `aggregate_id` fields support per-aggregate ordering and querying. The `metadata` JSONB field accommodates correlation IDs, causation IDs, and schema version information without requiring schema migrations. The partial index on `status = 'pending'` ensures that polling queries remain efficient even as the table grows with published events.

### Transactional Write with Ecto.Multi

The business operation and event creation execute within a single database transaction using [Ecto](@/glossary/ecto.md)'s `Multi` abstraction:

```elixir
defmodule PrismaticPerimeter.AssetDiscovery do
  @moduledoc """
  Asset discovery service that records discovered assets and
  publishes discovery events through the transactional outbox pattern.
  Both the asset record and the outbox event are written atomically.
  """

  alias Ecto.Multi
  alias PrismaticStorage.Repo
  alias PrismaticPerimeter.{Asset, OutboxEvent}

  @spec record_discovery(map()) :: {:ok, map()} | {:error, term()}
  def record_discovery(asset_params) do
    Multi.new()
    |> Multi.insert(:asset, Asset.changeset(%Asset{}, asset_params))
    |> Multi.insert(:outbox_event, fn %{asset: asset} ->
      OutboxEvent.changeset(%OutboxEvent{}, %{
        aggregate_type: "asset",
        aggregate_id: asset.id,
        event_type: "asset.discovered",
        payload: %{
          domain: asset.domain,
          ip_addresses: asset.ip_addresses,
          discovery_source: asset.discovery_source,
          discovered_at: DateTime.utc_now()
        },
        metadata: %{
          correlation_id: Ecto.UUID.generate(),
          causation_id: nil,
          schema_version: "1.0"
        }
      })
    end)
    |> Repo.transaction()
  end

  @spec record_update(Asset.t(), map()) :: {:ok, map()} | {:error, term()}
  def record_update(asset, changes) do
    Multi.new()
    |> Multi.update(:asset, Asset.changeset(asset, changes))
    |> Multi.insert(:outbox_event, fn %{asset: updated_asset} ->
      OutboxEvent.changeset(%OutboxEvent{}, %{
        aggregate_type: "asset",
        aggregate_id: updated_asset.id,
        event_type: "asset.updated",
        payload: %{
          domain: updated_asset.domain,
          changes: changes,
          updated_at: DateTime.utc_now()
        },
        metadata: %{
          correlation_id: Ecto.UUID.generate(),
          schema_version: "1.0"
        }
      })
    end)
    |> Repo.transaction()
  end
end
```

The `Multi` abstraction is critical: it ensures that the asset record and the outbox event are written in a single PostgreSQL transaction. If the asset insert succeeds but the outbox insert fails (due to a constraint violation, for example), the entire transaction rolls back and neither record persists. This atomicity guarantee is the foundation of the pattern's reliability.

### Outbox Publisher

The publisher is implemented as a [GenServer](@/glossary/genserver.md) that polls the outbox table and forwards events to downstream consumers:

```elixir
defmodule PrismaticPerimeter.OutboxPublisher do
  @moduledoc """
  Polls the outbox table for pending events and forwards them to
  downstream consumers via PubSub. Uses PostgreSQL's FOR UPDATE
  SKIP LOCKED for concurrent publisher safety.
  """
  use GenServer

  require Logger

  @poll_interval :timer.seconds(1)
  @batch_size 100

  @type state :: %{
    topic: String.t(),
    published_count: non_neg_integer(),
    error_count: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    schedule_poll()

    {:ok,
     %{
       topic: Keyword.get(opts, :topic, "perimeter:events"),
       published_count: 0,
       error_count: 0
     }}
  end

  @impl GenServer
  def handle_info(:poll, state) do
    new_state =
      case fetch_pending_events(@batch_size) do
        [] ->
          state

        events ->
          Enum.reduce(events, state, fn event, acc ->
            case publish_event(event, acc.topic) do
              :ok ->
                mark_published(event.id)
                %{acc | published_count: acc.published_count + 1}

              {:error, reason} ->
                Logger.warning("Outbox publish failed",
                  event_id: event.id,
                  reason: inspect(reason)
                )

                increment_retry(event.id)
                %{acc | error_count: acc.error_count + 1}
            end
          end)
      end

    schedule_poll()
    {:noreply, new_state}
  end

  @spec fetch_pending_events(pos_integer()) :: [map()]
  defp fetch_pending_events(limit) do
    import Ecto.Query

    PrismaticStorage.Repo.all(
      from(e in "outbox_events",
        where: e.status == "pending" and e.retry_count < e.max_retries,
        order_by: [asc: e.created_at],
        limit: ^limit,
        lock: "FOR UPDATE SKIP LOCKED"
      )
    )
  end

  @spec publish_event(map(), String.t()) :: :ok | {:error, term()}
  defp publish_event(event, topic) do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      topic,
      {:outbox_event, event.event_type, event.payload, event.metadata}
    )
  end

  @spec mark_published(Ecto.UUID.t()) :: {non_neg_integer(), nil}
  defp mark_published(event_id) do
    import Ecto.Query

    PrismaticStorage.Repo.update_all(
      from(e in "outbox_events", where: e.id == ^event_id),
      set: [status: "published", published_at: DateTime.utc_now()]
    )
  end

  @spec increment_retry(Ecto.UUID.t()) :: {non_neg_integer(), nil}
  defp increment_retry(event_id) do
    import Ecto.Query

    PrismaticStorage.Repo.update_all(
      from(e in "outbox_events", where: e.id == ^event_id),
      inc: [retry_count: 1]
    )
  end

  defp schedule_poll do
    Process.send_after(self(), :poll, @poll_interval)
  end
end
```

The `FOR UPDATE SKIP LOCKED` clause is critical for horizontal scalability. When multiple publisher instances run concurrently (for high-throughput scenarios), this clause ensures each instance claims a disjoint batch of pending events without contention. If one publisher is processing a batch, another publisher's query skips those locked rows and claims the next available batch.

### Consumer Idempotency

Because the outbox pattern provides at-least-once delivery (not exactly-once), consumers must be idempotent. The standard approach is tracking processed event IDs:

```elixir
defmodule PrismaticPerimeter.SecurityRatingConsumer do
  @moduledoc """
  Consumes asset discovery events and triggers security rating
  recalculation. Implements idempotent processing to handle
  duplicate event delivery from the outbox publisher.
  """
  use GenServer

  @spec handle_event(map()) :: :ok | :duplicate | {:error, term()}
  def handle_event(%{metadata: %{correlation_id: correlation_id}} = event) do
    case already_processed?(correlation_id) do
      true ->
        :duplicate

      false ->
        case process_event(event) do
          {:ok, _result} ->
            mark_processed(correlation_id)
            :ok

          {:error, reason} ->
            {:error, reason}
        end
    end
  end

  @spec already_processed?(String.t()) :: boolean()
  defp already_processed?(correlation_id) do
    import Ecto.Query

    PrismaticStorage.Repo.exists?(
      from(p in "processed_events", where: p.correlation_id == ^correlation_id)
    )
  end

  @spec mark_processed(String.t()) :: {non_neg_integer(), nil}
  defp mark_processed(correlation_id) do
    import Ecto.Query

    PrismaticStorage.Repo.insert_all("processed_events", [
      %{correlation_id: correlation_id, processed_at: DateTime.utc_now()}
    ])
  end

  defp process_event(%{event_type: "asset.discovered", payload: payload}) do
    PrismaticPerimeter.Rating.Engine.recalculate(payload.domain)
  end

  defp process_event(%{event_type: "asset.updated", payload: payload}) do
    PrismaticPerimeter.Rating.Engine.recalculate(payload.domain)
  end
end
```

## Dead Letter Handling

Events that exceed their retry limit must be moved to a dead-letter queue for manual investigation rather than being silently dropped:

```elixir
defmodule PrismaticPerimeter.OutboxDeadLetter do
  @moduledoc """
  Handles events that have exceeded their maximum retry count.
  Moves failed events to dead-letter status and emits telemetry
  for alerting and operational visibility.
  """

  require Logger

  @spec process_dead_letters() :: {:ok, non_neg_integer()}
  def process_dead_letters do
    import Ecto.Query

    {count, _} =
      PrismaticStorage.Repo.update_all(
        from(e in "outbox_events",
          where: e.status == "pending" and e.retry_count >= e.max_retries
        ),
        set: [status: "dead_letter"]
      )

    if count > 0 do
      Logger.warning("Moved #{count} events to dead letter queue")

      :telemetry.execute(
        [:prismatic_outbox, :dead_letter],
        %{count: count},
        %{source: __MODULE__}
      )
    end

    {:ok, count}
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform leverages the Outbox Pattern through [Ecto](@/glossary/ecto.md) and [PostgreSQL](@/glossary/postgresql.md) for reliable cross-application event propagation across its [umbrella applications](@/glossary/umbrella-application.md). The pattern is central to several subsystems:

**Perimeter Asset Discovery**: When the EASM scanner discovers new assets, it writes both the asset record and a discovery event to the outbox within a single `Ecto.Multi` transaction. The outbox publisher distributes events via [PubSub](@/glossary/pubsub.md) to the security rating engine, compliance assessor, and vulnerability scanner.

**Agent Coordination**: Agent state transitions (activation, deactivation, error recovery) are recorded as outbox events, ensuring that monitoring dashboards and the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) receive reliable notification of agent lifecycle changes.

**Quality Gate Results**: Quality gate pass/fail results are written to the outbox, enabling the [Quality DNA](@/glossary/quality-dna.md) system to update cross-session state and the SEADF evolution framework to track quality trends.

**Compliance Assessment**: When compliance checks complete for NIS2 or ZKB frameworks, results are published through the outbox to ensure that dashboard updates, alert generation, and report compilation all receive the assessment data reliably.

## Outbox Table Maintenance

Without maintenance, the outbox table grows indefinitely, degrading polling query performance. A periodic cleanup process archives or deletes published events beyond the retention window:

```elixir
defmodule PrismaticPerimeter.OutboxMaintenance do
  @moduledoc """
  Periodic maintenance for the outbox table. Archives published
  events beyond the retention window and compacts the table.
  """

  @retention_days 7

  @spec cleanup() :: {:ok, non_neg_integer()}
  def cleanup do
    import Ecto.Query

    cutoff = DateTime.add(DateTime.utc_now(), -@retention_days * 86_400, :second)

    {deleted_count, _} =
      PrismaticStorage.Repo.delete_all(
        from(e in "outbox_events",
          where: e.status == "published" and e.published_at < ^cutoff
        )
      )

    {:ok, deleted_count}
  end
end
```

## Comparison with Alternatives

| Approach | Consistency | Complexity | Availability | Ordering | Infrastructure |
|----------|-------------|-----------|--------------|----------|----------------|
| **Outbox Pattern** | At-least-once, local ACID | Moderate (idempotent consumers) | High (no external deps for write) | Per-aggregate via table | Database only |
| **Two-Phase Commit** | Exactly-once | High (coordinator required) | Low (blocking protocol) | Strong global ordering | Coordinator + participants |
| **Event Sourcing** | Event store is source of truth | High (full event replay) | High (append-only) | Strong per-aggregate | Event store |
| **Change Data Capture** | At-least-once from WAL | Low (infrastructure handles) | Medium (depends on CDC tool) | WAL ordering | Kafka Connect + Debezium |
| **Saga Pattern** | Eventual (compensating actions) | High (compensation logic) | High (decoupled steps) | No guaranteed ordering | Orchestrator or choreography |
| **Direct Message Publish** | Best-effort, dual-write risk | Low | Medium (broker dependency) | Broker-dependent | Message broker |

Change Data Capture (CDC) using tools like Debezium is the closest alternative, reading events directly from the database's write-ahead log. While CDC avoids the outbox table entirely, it requires additional infrastructure (Kafka Connect, Debezium) and provides less control over event schema and metadata. For Elixir/Phoenix systems that already use PostgreSQL and PubSub, the outbox pattern provides equivalent reliability with less operational overhead.

## Monitoring and Observability

Effective outbox operation requires monitoring several key metrics:

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Publisher lag** | Age of oldest pending event | > 30 seconds |
| **Pending count** | Number of unprocessed events | > 1,000 |
| **Dead letter count** | Events exceeding retry limit | > 0 |
| **Publish throughput** | Events published per second | < expected baseline |
| **Retry rate** | Percentage of events requiring retry | > 5% |
| **Consumer lag** | Time between publish and consumption | > 5 seconds |

## Best Practices

**Schema Versioning**: Include a schema version field in event metadata. When event structures evolve, consumers can detect version mismatches and apply appropriate deserialization logic without breaking existing processing.

**Bounded Retry**: Set maximum retry counts and implement dead-letter handling for events that exceed retry limits. Unbounded retries can mask permanent failures and consume publisher resources indefinitely.

**Correlation and Causation IDs**: Include both correlation IDs (tying related events across services) and causation IDs (identifying the event that caused this event) for distributed tracing and debugging.

**Outbox Table Maintenance**: Archive or delete published events periodically. Without maintenance, the outbox table grows indefinitely, degrading polling query performance.

**Monitoring Publisher Lag**: Track the age of the oldest pending event as a key metric. Growing lag indicates publisher throughput is insufficient or downstream consumers are causing backpressure.

**Idempotency Keys**: Use deterministic idempotency keys (aggregate ID + sequence number, or content hashes) rather than random UUIDs for events that may be regenerated during recovery scenarios.

**Batch Size Tuning**: Balance batch size against latency requirements. Larger batches improve throughput but increase per-event latency. Smaller batches provide lower latency but may underutilize database connections.

## Common Pitfalls

**Forgetting consumer idempotency**: The outbox guarantees at-least-once delivery, which means consumers may receive the same event multiple times. Without idempotent processing, this leads to duplicate side effects.

**Unbounded table growth**: Published events accumulate in the outbox table without cleanup, eventually degrading query performance and consuming storage. Implement periodic cleanup with appropriate retention windows.

**Single publisher bottleneck**: A single publisher process can become a throughput bottleneck under high load. Use `FOR UPDATE SKIP LOCKED` to enable concurrent publishers that claim disjoint event batches.

**Ignoring dead letters**: Events that exceed retry limits indicate a systemic problem. Silently dropping them hides operational issues. Always route dead letters to a monitoring system.

**Schema evolution without versioning**: Changing event payload structure without version markers causes consumer deserialization failures. Always include schema version metadata.

## Use Cases

**Microservice State Synchronization**: Services that need to keep their local state synchronized with changes in other services. The outbox ensures that state change notifications are reliably delivered even during service outages or network partitions.

**Audit Trail Generation**: Compliance-sensitive operations that require a complete, tamper-evident record of all state changes. The outbox table serves as both the event source and a durable audit log.

**Event-Driven Aggregation**: Systems that compute derived state (dashboards, reports, search indexes) from streams of events. The outbox guarantees that no source event is lost.

**Cross-Boundary Notifications**: [Umbrella applications](@/glossary/umbrella-application.md) that need to notify other applications of state changes without introducing runtime coupling. The outbox + PubSub combination provides reliable notification while keeping applications independently testable.

**CQRS Write-Side Events**: Command-Query Responsibility Segregation architectures where the write side needs to publish events for the read side to consume. The outbox ensures every write-side command that commits also produces a corresponding event.

## Related Concepts

- [Event Sourcing](@/glossary/event-sourcing.md) -- Event-centric architecture that the outbox pattern supports
- [Ecto](@/glossary/ecto.md) -- Database toolkit managing outbox table transactions through Multi
- [PostgreSQL](@/glossary/postgresql.md) -- Primary database hosting outbox tables with FOR UPDATE SKIP LOCKED
- [Eventual Consistency](@/glossary/eventual-consistency.md) -- Consistency model achieved through outbox event propagation
- [CQRS](@/glossary/cqrs.md) -- Command-query separation where outbox publishes command-side events
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Complementary pattern for publisher failure handling
- [Idempotency](@/glossary/idempotency.md) -- Consumer property required for at-least-once delivery safety
- [PubSub](@/glossary/pubsub.md) -- Distribution mechanism for outbox events within the platform
- [GenServer](@/glossary/genserver.md) -- Process abstraction backing the outbox publisher
- [Supervisor](@/glossary/supervisor.md) -- Fault tolerance for the publisher process

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
