+++
title = "Event"
description = "A discrete system occurrence or message representing a state change, user action, or external signal that triggers processing in event-driven architectures and telemetry pipelines."
weight = 50

[extra]
category = "architecture"
tags = ["event", "event-driven", "message", "pubsub", "telemetry", "phoenix", "genserver", "otp", "streaming", "audit"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["developers", "architects", "data-engineers", "sre"]
related_terms = ["event-log", "pubsub", "message-passing", "telemetry", "genserver", "streaming", "webhook"]
key_concepts = ["event-sourcing", "event-driven-architecture", "publish-subscribe", "event-schema", "event-correlation"]
platforms = ["beam", "elixir", "phoenix", "phoenix-pubsub"]
prerequisites = ["message-passing-basics", "distributed-systems-fundamentals"]
use_cases = ["audit-logging", "real-time-notifications", "state-synchronization", "telemetry", "integration"]
complexity = "low"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Event", "event-driven", "message", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Event - Prismatic Platform"
+++

## Definition and Overview

An event is a record of something that happened at a specific point in time within a software system. Events are immutable facts -- once an event occurs, it cannot be changed or undone, only compensated for by subsequent events. In event-driven architectures, events serve as the primary mechanism for communication between loosely coupled components, replacing direct method calls with asynchronous message publication that decouples producers from consumers.

Events differ from commands and queries in their temporal semantics and coupling characteristics. A command is an instruction to do something (imperative, future-tense), a query is a request for information (interrogative, present-tense), and an event is a notification that something happened (declarative, past-tense). This distinction is fundamental to CQRS (Command Query Responsibility Segregation) and event sourcing patterns, where the complete system state can be reconstructed by replaying the ordered sequence of events from the beginning of time.

In the BEAM ecosystem, events are naturally represented as messages between processes. The [actor model](/glossary/actor-model/) treats message passing as the fundamental communication primitive, making event-driven architecture the default rather than an imposed pattern. Phoenix PubSub, Telemetry, and GenServer callback mechanisms all operate on event semantics, providing multiple abstraction levels for different use cases.

## Technical Deep Dive

### Event Classification

| Category | Description | Examples | Lifetime |
|----------|-------------|----------|----------|
| **Domain Events** | Business-meaningful state changes | `OrderPlaced`, `UserRegistered`, `ScanCompleted` | Permanent (event store) |
| **Integration Events** | Cross-service communication | `EntityUpdated`, `ReportGenerated` | Transient to persistent |
| **System Events** | Infrastructure-level signals | `ProcessStarted`, `NodeConnected`, `MemoryThreshold` | Transient (telemetry) |
| **UI Events** | User interaction signals | `ButtonClicked`, `FormSubmitted`, `PageViewed` | Transient (LiveView) |

### Event Schema Properties

Every well-formed event contains a standard set of metadata fields alongside domain-specific payload:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | UUID | Yes | Unique identifier for deduplication |
| `event_type` | string | Yes | Fully qualified event name |
| `occurred_at` | DateTime | Yes | When the event happened (source clock) |
| `recorded_at` | DateTime | Yes | When the event was persisted (system clock) |
| `source` | string | Yes | Producing component identifier |
| `correlation_id` | UUID | No | Links related events across components |
| `causation_id` | UUID | No | Links to the event/command that caused this event |
| `payload` | map | Yes | Domain-specific event data |
| `metadata` | map | No | Additional context (user, session, trace) |

### Event Delivery Guarantees

| Guarantee | Description | Use Case | Implementation |
|-----------|-------------|----------|----------------|
| **At-most-once** | Event may be lost, never duplicated | Telemetry, metrics | Phoenix PubSub default |
| **At-least-once** | Event delivered 1+ times, may duplicate | Critical business events | Outbox pattern + retry |
| **Exactly-once** | Event delivered precisely once | Financial transactions | Idempotent consumers + dedup |

## Architecture and Implementation

Event-driven architecture in the Prismatic Platform operates across three layers. The local layer uses BEAM process messages and GenServer callbacks for intra-node communication. The cluster layer uses Phoenix PubSub (backed by `Phoenix.PubSub.PG2`) for inter-node event distribution. The persistent layer uses PostgreSQL-backed event logs for durable event storage and replay.

The publish-subscribe pattern decouples event producers from consumers. A producer publishes events to a named topic without knowledge of which (or how many) consumers are subscribed. Consumers subscribe to topics of interest and receive events asynchronously. This pattern enables adding new event consumers without modifying producers, supporting extensibility and separation of concerns.

Event correlation is achieved through correlation and causation identifiers. The correlation ID groups all events related to a single user action or business transaction. The causation ID creates a causal chain showing which event triggered which subsequent event. Together, these fields enable distributed tracing and debugging across the entire event flow.

## Usage in Prismatic Platform

The Prismatic Platform uses events pervasively for inter-component communication, real-time UI updates, telemetry collection, and audit logging.

```elixir
defmodule Prismatic.Event do
  @moduledoc """
  Base event structure used across the platform.
  Provides consistent schema, serialization, and
  metadata for all domain and integration events.
  """

  @type t :: %__MODULE__{
    event_id: String.t(),
    event_type: String.t(),
    occurred_at: DateTime.t(),
    source: String.t(),
    correlation_id: String.t() | nil,
    causation_id: String.t() | nil,
    payload: map(),
    metadata: map()
  }

  defstruct [
    :event_id,
    :event_type,
    :occurred_at,
    :source,
    :correlation_id,
    :causation_id,
    payload: %{},
    metadata: %{}
  ]

  @spec new(String.t(), String.t(), map(), keyword()) :: t()
  def new(event_type, source, payload, opts \\ []) do
    %__MODULE__{
      event_id: Ecto.UUID.generate(),
      event_type: event_type,
      occurred_at: DateTime.utc_now(),
      source: source,
      correlation_id: Keyword.get(opts, :correlation_id),
      causation_id: Keyword.get(opts, :causation_id),
      payload: payload,
      metadata: Keyword.get(opts, :metadata, %{})
    }
  end
end

defmodule Prismatic.EventBus do
  @moduledoc """
  Central event publication and subscription hub.
  Wraps Phoenix.PubSub with structured event semantics
  and telemetry integration.
  """

  @pubsub Prismatic.PubSub

  @spec publish(String.t(), Prismatic.Event.t()) :: :ok
  def publish(topic, %Prismatic.Event{} = event) do
    :telemetry.execute(
      [:prismatic, :event, :published],
      %{count: 1},
      %{topic: topic, event_type: event.event_type, source: event.source}
    )

    Phoenix.PubSub.broadcast(@pubsub, topic, {:event, event})
  end

  @spec subscribe(String.t()) :: :ok | {:error, term()}
  def subscribe(topic) do
    Phoenix.PubSub.subscribe(@pubsub, topic)
  end

  @spec unsubscribe(String.t()) :: :ok
  def unsubscribe(topic) do
    Phoenix.PubSub.unsubscribe(@pubsub, topic)
  end
end
```

The DD pipeline publishes events on the `"dd:pipeline"` topic for real-time LiveView dashboard updates. The OSINT toolbox publishes scan progress and completion events. The agent system emits lifecycle events for monitoring and orchestration. All events flow through the Telemetry pipeline for metrics collection and the event log for audit compliance.

## Cross-References

- [Event Log](/glossary/event-log/) -- Immutable event persistence
- [Message Passing](/glossary/message-passing/) -- BEAM communication primitive
- [PubSub](/glossary/pubsub/) -- Publish-subscribe event distribution
- [Telemetry](/glossary/telemetry/) -- Metric collection from events
- **Immutable Log** -- Append-only event storage
- **Livebooks**: `api_integration/` notebooks demonstrate event-driven patterns
- **Academy**: Topics on distributed systems cover event architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
