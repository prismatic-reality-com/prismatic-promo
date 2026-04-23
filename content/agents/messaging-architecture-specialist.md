+++
title = "messaging-architecture-specialist"
weight = 253
[extra]
domain = "architecture"
level = "L3"
description = "Message queue architecture, pub/sub patterns, and async communication"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["messaging-architecture-specialist", "Message", "agents", "agent", "Prismatic Platform", "GenServer", "PubSub"]
tags = ["agents", "agent", "messaging-architecture-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "messaging-architecture-specialist - Prismatic Platform"
+++

## Overview

The messaging-architecture-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's architecture domain, responsible for designing, implementing, and maintaining asynchronous messaging infrastructure that enables decoupled, resilient communication between platform components. This agent governs the full spectrum of messaging patterns -- from simple point-to-point [message passing](@/glossary/message-passing.md) between [GenServer](@/glossary/genserver.md) processes to complex event-driven architectures built on [PubSub](@/glossary/pubsub.md) topologies and [GenStage](@/glossary/genstage.md) data pipelines.

Built on the [AIAD](@/glossary/aiad.md) standard and deeply integrated with [OTP](@/glossary/otp.md) supervision primitives, the messaging-architecture-specialist ensures that every message flow within the platform operates with guaranteed delivery semantics, proper [backpressure](@/glossary/backpressure.md) management, and fault-tolerant routing. The agent enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine on messaging reliability: no message channel is deployed without dead-letter handling, retry policies, and comprehensive [telemetry](@/glossary/telemetry.md) instrumentation.

## Operational Domain

The messaging architecture domain encompasses all asynchronous communication patterns within the Prismatic Platform's [umbrella application](@/glossary/umbrella-application.md) structure. This includes inter-process message passing within the [BEAM](@/glossary/beam.md) virtual machine, distributed PubSub for multi-node deployments, event sourcing pipelines, and command-query responsibility segregation (CQRS) implementations. The agent maintains a messaging topology registry that maps all active channels, their subscribers, message schemas, and throughput characteristics across the platform's 90+ applications.

| Communication Pattern | Implementation | Use Case |
|----------------------|----------------|----------|
| Point-to-Point | GenServer.call/cast | Direct process communication |
| Publish-Subscribe | Phoenix.PubSub | Event broadcasting across nodes |
| Pipeline | GenStage + Flow | Data processing with backpressure |
| Request-Reply | GenServer.call with timeout | Synchronous query patterns |
| Fire-and-Forget | GenServer.cast | Non-critical notifications |
| Event Sourcing | Custom EventStore | Audit trail and replay capability |

## Key Capabilities

- **Message topology design** -- Architects optimal messaging patterns for inter-application communication within the umbrella structure, selecting appropriate patterns based on latency requirements, ordering guarantees, and failure tolerance needs
- **Backpressure management** -- Implements [GenStage](@/glossary/genstage.md)-based demand-driven pipelines that prevent fast producers from overwhelming slow consumers, with adaptive rate limiting and overflow strategies
- **Dead-letter channel implementation** -- Designs and maintains dead-letter queues for messages that cannot be processed, enabling offline analysis and manual retry of failed deliveries
- **Message schema evolution** -- Manages versioned message contracts that allow producers and consumers to evolve independently without breaking compatibility
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-healing message channel recovery and automatic topology rebalancing
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing message throughput, latency, and error metrics under messaging-specific namespaces

## Architecture Patterns

The messaging-architecture-specialist implements several foundational patterns that govern how components communicate within the Prismatic Platform.

### PubSub Event Broadcasting

```elixir
defmodule Prismatic.Messaging.EventBroadcaster do
  @moduledoc """
  Broadcasts domain events across the platform using Phoenix.PubSub.
  Implements topic-based routing with schema validation.
  """

  alias Phoenix.PubSub

  @pubsub Prismatic.PubSub
  @event_schema_registry Prismatic.Messaging.SchemaRegistry

  @spec broadcast(String.t(), atom(), map()) :: :ok | {:error, term()}
  def broadcast(topic, event_type, payload) do
    with {:ok, validated} <- validate_schema(event_type, payload),
         envelope <- build_envelope(topic, event_type, validated) do
      :telemetry.execute(
        [:prismatic, :messaging, :broadcast],
        %{count: 1, payload_bytes: byte_size(:erlang.term_to_binary(payload))},
        %{topic: topic, event_type: event_type}
      )

      PubSub.broadcast(@pubsub, topic, envelope)
    end
  end

  defp build_envelope(topic, event_type, payload) do
    %{
      id: Ecto.UUID.generate(),
      topic: topic,
      event_type: event_type,
      payload: payload,
      timestamp: DateTime.utc_now(),
      source: node()
    }
  end

  defp validate_schema(event_type, payload) do
    @event_schema_registry.validate(event_type, payload)
  end
end
```

### GenStage Pipeline with Backpressure

```elixir
defmodule Prismatic.Messaging.IntelligencePipeline do
  @moduledoc """
  Demand-driven pipeline for processing intelligence events
  with automatic backpressure and dead-letter routing.
  """

  use GenStage

  def start_link(opts) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenStage
  def init(opts) do
    {:producer_consumer, %{processed: 0, errors: 0},
     subscribe_to: [{opts[:producer], max_demand: 50, min_demand: 10}]}
  end

  @impl GenStage
  def handle_events(events, _from, state) do
    {processed, failed} =
      Enum.split_with(events, fn event ->
        case process_event(event) do
          {:ok, _} -> true
          {:error, _reason} -> false
        end
      end)

    route_to_dead_letter(failed)

    {:noreply, processed,
     %{state | processed: state.processed + length(processed),
               errors: state.errors + length(failed)}}
  end

  defp route_to_dead_letter([]), do: :ok
  defp route_to_dead_letter(failed) do
    Enum.each(failed, &Prismatic.Messaging.DeadLetter.enqueue/1)
  end
end
```

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to define messaging standards, approve new channel topologies, and enforce schema compatibility across all platform applications.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/messaging topology` | Display current messaging topology across all applications | L3+ |
| `/messaging health` | Show message channel health, throughput, and error rates | L3+ |
| `/messaging schema` | Validate message schema compatibility across producers and consumers | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [event-driven-architecture-specialist](@/agents/event-driven-architecture-specialist.md) | Collaborates on event sourcing patterns and CQRS implementations |
| [service-mesh-specialist](@/agents/service-mesh-specialist.md) | Coordinates on inter-service communication routing and load balancing |
| [performance-benchmarking-agent](@/agents/performance-benchmarking-agent.md) | Validates messaging throughput and latency characteristics |
| [code-quality-commander](@/agents/code-quality-commander.md) | Enforces quality standards on messaging infrastructure code |

## Message Delivery Guarantees

| Guarantee Level | Pattern | Trade-off |
|----------------|---------|-----------|
| At-most-once | GenServer.cast | Fastest, may lose messages |
| At-least-once | Acknowledgment + retry | Reliable, possible duplicates |
| Exactly-once | Idempotency keys + dedup | Strongest, highest overhead |
| Ordered | Single partition / process | Sequential, limits parallelism |

## Telemetry and Observability

The messaging-architecture-specialist instruments all message flows with comprehensive telemetry events under the `[:prismatic, :messaging, *]` namespace. Key metrics include message throughput (messages per second per channel), end-to-end latency (producer to consumer acknowledgment), dead-letter queue depth, backpressure activation frequency, and schema validation failure rates. These metrics feed into the platform's [SEADF](@/glossary/seadf.md) evolutionary framework, enabling data-driven optimization of messaging topologies over time.

Observable events are organized into three categories: operational events (message sent, received, acknowledged), error events (delivery failure, schema validation error, timeout), and performance events (queue depth threshold, backpressure activation, throughput saturation). Each event carries structured metadata including the originating application, target application, message schema version, and correlation identifier that enables end-to-end trace reconstruction across multi-hop messaging chains.

## Design Philosophy

The messaging architecture within the Prismatic Platform follows a set of principles that distinguish it from conventional message queue implementations. The first principle is **process-native messaging**: rather than introducing external message brokers (RabbitMQ, Kafka), the platform leverages the [BEAM](@/glossary/beam.md) virtual machine's built-in message passing as the primary transport. This eliminates the operational complexity of managing separate broker infrastructure while preserving the fault tolerance guarantees that come with [OTP](@/glossary/otp.md) supervision.

The second principle is **schema-first contracts**. Every message channel defines a schema for its messages using a versioned contract registry. Producers validate outgoing messages against the schema before dispatch, and consumers validate incoming messages on receipt. Schema evolution follows backward-compatible rules: new fields may be added with defaults, existing fields may not be removed or have their types changed, and consumers must tolerate unknown fields. This enables independent evolution of producers and consumers without coordination.

The third principle is **topology as code**. Message channel configurations -- including topic names, subscriber lists, delivery guarantees, and dead-letter routing rules -- are defined declaratively in application configuration files rather than created imperatively at runtime. This makes the messaging topology auditable, version-controlled, and reproducible across environments. The messaging-architecture-specialist validates that declared topologies are consistent and that all referenced applications and topics exist within the umbrella structure.

The fourth principle is **observable by default**. Every message dispatch, receipt, and acknowledgment emits telemetry events without requiring explicit instrumentation by consuming applications. This provides platform-wide visibility into message flow health without imposing additional development burden on individual application teams.

## Multi-Node Distribution

For distributed deployments where the platform runs across multiple [BEAM](@/glossary/beam.md) nodes, the messaging architecture extends Phoenix.PubSub with a distributed adapter that ensures messages reach subscribers on all connected nodes. The distribution layer handles network partitions gracefully through a buffer-and-retry mechanism: messages published during a partition are buffered locally and re-broadcast when connectivity is restored. Partition detection relies on [OTP](@/glossary/otp.md) node monitoring, and the messaging specialist configures appropriate timeout and retry parameters based on network topology characteristics.

The distributed messaging layer also supports topic-based routing that allows messages to be directed to specific node subsets rather than broadcast to all nodes. This is essential for workloads where geographic affinity or data locality determines which nodes should process specific message types. Topic routing rules are maintained in the messaging topology configuration and validated by the specialist during topology audits.

## Enforcement

All messaging infrastructure must comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no message channel is deployed without dead-letter handling, retry policies with exponential backoff, schema validation, and comprehensive telemetry instrumentation. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that message delivery guarantees are explicitly documented and tested for every channel. Backpressure thresholds are validated through load testing before any pipeline reaches production.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)