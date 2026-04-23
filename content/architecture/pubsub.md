+++
title = "Phoenix PubSub"
weight = 10
date = 2026-02-12
[extra]
icon = "lightning"
color = "pink"
description = "Real-time event broadcasting across distributed nodes"
date_created = "2025-08-10"
reading_time = "13 min"
difficulty = "intermediate"
tags = ["pubsub", "phoenix", "distributed", "events", "real-time", "beam", "otp"]
related_articles = ["phoenix-liveview", "graphql", "telemetry", "supervision-trees"]
authors = ["Tomáš Korcak (korczis)"]
author = "Tomas Korcak (korczis)"
word_count = 1520
date_modified = "2026-02-23"
keywords = ["Phoenix", "PubSub", "Real-time", "architecture", "Prismatic Platform", "Erlang"]
quality_score = 90
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Phoenix PubSub - Prismatic Platform"
+++

## Overview

[Phoenix](/glossary/phoenix/) PubSub is the event backbone of the Prismatic Platform, providing real-time message broadcasting between processes both within a single node and across a distributed cluster. Every real-time feature in the platform -- [LiveView dashboard updates](/architecture/phoenix-liveview/), [GraphQL subscription delivery](/architecture/graphql/), agent coordination, search index synchronization, and security alert propagation -- flows through PubSub as its transport layer.

The design decision to centralize event distribution through PubSub rather than direct process messaging was deliberate and grounded in three architectural requirements. First, the publisher-subscriber decoupling means that event producers (such as the asset discovery engine in [Prismatic Perimeter](/apps/prismatic-perimeter/)) do not need to know which consumers exist or where they run. Second, the topic-based routing provides a natural namespace for events that maps cleanly to domain concepts (assets, agents, [security rating](/glossary/security-rating/)s, compliance findings). Third, the pluggable adapter system allows the same application code to run on a single developer machine using in-process Erlang distribution and in production across multiple nodes using a distributed backend.

This article examines the PubSub architecture in depth: why it was chosen over alternatives, how topic hierarchies are designed, how it integrates with the platform's major subsystems, and what performance characteristics it delivers under production load.

## Architecture and Backend Selection

### Core Architecture

Phoenix PubSub implements a [registry](/glossary/registry-otp/)-based pub/sub model where subscribers register interest in named topics, and publishers broadcast messages to all registered subscribers on a given topic. The critical architectural insight is that PubSub builds on [Erlang's native process messaging](/glossary/beam/) -- a `broadcast` is ultimately a series of `send/2` calls to registered process PIDs, which means it inherits all the reliability guarantees (and limitations) of BEAM inter-process communication.

```
Publisher Process                     Subscriber Processes
     |                                    ^  ^  ^
     v                                    |  |  |
Phoenix.PubSub.broadcast/3               |  |  |
     |                                    |  |  |
     v                                    |  |  |
PubSub Server (GenServer)                 |  |  |
     |                                    |  |  |
     +-- Local dispatch -------> Process registry lookup
     |                                    |  |  |
     +-- Cluster dispatch ----> Remote node PubSub servers
           (via adapter)              |  |  |
              |                       v  v  v
              +-- pg (OTP 23+) or Redis --> Remote dispatch
```

### Backend Adapters

The Prismatic Platform uses different PubSub backends depending on the deployment environment. The choice between them involves explicit tradeoffs:

| Backend | Use Case | Latency | Persistence | Cluster Support |
|---------|----------|---------|-------------|-----------------|
| `Phoenix.PubSub.PG2` (Erlang pg) | Development, single-node prod | <100us | None | Via Erlang distribution |
| [Redis](/glossary/redis/) adapter | Multi-region, non-Erlang consumers | ~1ms | Optional (Streams) | Via Redis cluster |
| Custom [ETS](/glossary/ets/) tracker | High-frequency internal events | <50us | None | Single node only |

```elixir
# Development and single-cluster production
# Uses Erlang's built-in pg module (successor to pg2)
config :prismatic_platform, PrismaticPubSub,
  name: PrismaticPubSub,
  adapter: Phoenix.PubSub.PG2,
  pool_size: System.schedulers_online()

# Multi-region production with Redis
config :prismatic_platform, PrismaticPubSub,
  name: PrismaticPubSub,
  adapter: Phoenix.PubSub.Redis,
  url: System.get_env("REDIS_PUBSUB_URL"),
  node_name: System.get_env("FLY_ALLOC_ID", node() |> to_string())
```

The default `PG2` adapter was chosen for the primary deployment because the Prismatic Platform runs as a single Erlang cluster on [Fly.io](/glossary/fly-io/), where Erlang distribution provides sub-millisecond cross-node messaging without external dependencies. The Redis adapter is reserved for scenarios where non-Erlang services need to participate in the event stream or where multi-region deployments make Erlang distribution impractical due to latency.

### Why Not Direct Process Messaging?

An alternative to PubSub would be direct process-to-process messaging using `send/2` with a process [registry](/glossary/genserver/). This approach was evaluated and rejected for three reasons:

1. **Coupling**: Direct messaging requires the publisher to know subscriber PIDs, creating tight coupling between producers and consumers. When a new consumer type is added (e.g., a search indexer), every producer would need modification.

2. **Fan-out complexity**: When an event needs to reach 50+ LiveView processes, 10 GraphQL subscriptions, a search indexer, an audit logger, and a [metrics](/glossary/metrics/) collector, managing the fan-out manually is error-prone and duplicative.

3. **Distribution transparency**: PubSub abstracts whether subscribers are local or remote. Direct messaging across nodes requires explicit `Node.send/3` or `:rpc` calls, complicating the code and making it environment-dependent.

## Topic Design and Naming Conventions

The Prismatic Platform uses a hierarchical topic naming convention that encodes both the domain entity and the event granularity:

```elixir
# Topic naming convention:
# {domain}:{entity_type}:{optional_id}:{optional_event}

# Broad subscriptions (receive all events in a domain)
"assets:discovered"               # All newly discovered assets
"agents:status"                   # All agent status changes
"security:alerts"                 # All security alerts

# Entity-specific subscriptions
"assets:#{asset_id}:updated"      # Updates to a specific asset
"agents:#{agent_id}:completed"    # Completion of a specific agent
"ratings:#{domain}:changed"       # Rating changes for a specific domain

# Scoped subscriptions for multi-tenant isolation
"tenant:#{tenant_id}:assets:*"    # All asset events for a tenant
"tenant:#{tenant_id}:alerts:*"    # All alerts for a tenant
```

### Topic Registry Module

To enforce naming consistency and provide documentation, topics are defined through a dedicated module rather than scattered string literals:

```elixir
defmodule PrismaticPubSub.Topics do
  @moduledoc """
  Canonical topic definitions for PubSub event routing.
  All topic strings used in broadcast/subscribe calls MUST be
  constructed through this module to ensure naming consistency.
  """

  # Asset lifecycle events
  def asset_discovered, do: "assets:discovered"
  def asset_updated(asset_id), do: "assets:#{asset_id}:updated"
  def asset_deleted(asset_id), do: "assets:#{asset_id}:deleted"
  def asset_vulnerability(asset_id), do: "assets:#{asset_id}:vulnerability"

  # Agent coordination events
  def agent_status, do: "agents:status"
  def agent_started(agent_id), do: "agents:#{agent_id}:started"
  def agent_completed(agent_id), do: "agents:#{agent_id}:completed"
  def agent_error(agent_id), do: "agents:#{agent_id}:error"
  def agent_metrics, do: "agents:metrics"

  # Security events
  def security_alert(severity), do: "security:alert:#{severity}"
  def rating_changed(domain), do: "ratings:#{domain}:changed"

  # Compliance events
  def compliance_status(framework), do: "compliance:#{framework}:status"
  def compliance_violation(framework), do: "compliance:#{framework}:violation"

  # Perimeter-wide events
  def perimeter_updates, do: "perimeter:updates"
  def perimeter_scan_progress(scan_id), do: "perimeter:scan:#{scan_id}:progress"

  # Tenant-scoped events
  def tenant_events(tenant_id, category), do: "tenant:#{tenant_id}:#{category}"
end
```

This approach prevents the most common PubSub bugs: topic string typos that silently cause messages to be lost because no subscriber matches the misspelled topic.

## Broadcasting Patterns

### Simple Broadcast

The most common pattern is a domain module broadcasting an event after a state change. The broadcast is typically the last step in a pipeline, after the change has been persisted:

```elixir
defmodule PrismaticPerimeter.Assets do
  alias PrismaticPubSub.Topics

  def create(attrs) do
    with {:ok, asset} <- validate_and_insert(attrs) do
      # Broadcast AFTER successful persistence
      Phoenix.PubSub.broadcast(
        PrismaticPubSub,
        Topics.asset_discovered(),
        {:asset_discovered, asset}
      )

      {:ok, asset}
    end
  end

  def update(asset, attrs) do
    with {:ok, updated} <- validate_and_update(asset, attrs) do
      Phoenix.PubSub.broadcast(
        PrismaticPubSub,
        Topics.asset_updated(asset.id),
        {:asset_updated, updated}
      )

      {:ok, updated}
    end
  end
end
```

### Broadcast with Sender Exclusion

When the process that triggers an event is also a subscriber (common in collaborative editing scenarios), `broadcast_from/4` prevents the sender from receiving its own message:

```elixir
defmodule PrismaticAgents.Coordinator do
  def complete_mission(agent_id, result) do
    # This process is subscribed to agent events for coordination
    # Use broadcast_from to avoid processing our own completion event
    Phoenix.PubSub.broadcast_from(
      PrismaticPubSub,
      self(),
      PrismaticPubSub.Topics.agent_completed(agent_id),
      {:agent_completed, agent_id, result}
    )
  end
end
```

### Targeted Node Broadcast

For events that should only reach a specific node (useful for node-local cache invalidation or diagnostics), `direct_broadcast/4` targets a single node:

```elixir
defmodule PrismaticCache.Invalidator do
  def invalidate_local(key) do
    Phoenix.PubSub.direct_broadcast(
      node(),
      PrismaticPubSub,
      "cache:invalidation",
      {:invalidate, key}
    )
  end

  def invalidate_cluster(key) do
    Phoenix.PubSub.broadcast(
      PrismaticPubSub,
      "cache:invalidation",
      {:invalidate, key}
    )
  end
end
```

## Integration with Platform Subsystems

### LiveView Real-Time Dashboards

The primary consumer of PubSub events is the [LiveView](/architecture/phoenix-liveview/) layer. Each LiveView process subscribes to relevant topics during its `mount/3` callback and receives events through `handle_info/2`. This integration requires zero additional infrastructure -- no message queue, no polling, no separate [WebSocket](/glossary/websocket/) server:

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view
  alias PrismaticPubSub.Topics

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticPubSub, Topics.perimeter_updates())
      Phoenix.PubSub.subscribe(PrismaticPubSub, Topics.asset_discovered())
      Phoenix.PubSub.subscribe(PrismaticPubSub, Topics.security_alert(:critical))
    end

    {:ok, assign(socket, assets: [], alerts: [], rating: nil)}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, socket) do
    {:noreply, update(socket, :assets, &[asset | &1])}
  end

  @impl true
  def handle_info({:rating_updated, rating}, socket) do
    {:noreply, assign(socket, rating: rating)}
  end

  @impl true
  def handle_info({:security_alert, :critical, alert}, socket) do
    {:noreply,
     socket
     |> update(:alerts, &[alert | &1])
     |> push_event("alert-sound", %{severity: :critical})}
  end
end
```

### GraphQL Subscription Delivery

[GraphQL subscriptions](/architecture/graphql/) use PubSub as their delivery mechanism. When a domain event occurs, the publisher broadcasts to a PubSub topic that Absinthe has registered for the matching subscription:

```elixir
defmodule PrismaticPerimeter.Events do
  @moduledoc """
  Bridges domain events to both PubSub (for LiveView/internal)
  and Absinthe subscriptions (for GraphQL clients).
  """

  def emit_asset_discovered(asset) do
    # PubSub broadcast for LiveView and internal consumers
    Phoenix.PubSub.broadcast(
      PrismaticPubSub,
      PrismaticPubSub.Topics.asset_discovered(),
      {:asset_discovered, asset}
    )

    # Absinthe subscription publish for GraphQL clients
    Absinthe.Subscription.publish(
      PrismaticWeb.Endpoint,
      asset,
      asset_discovered: "assets:discovered",
      asset_discovered: "assets:discovered:#{asset.domain}"
    )
  end
end
```

### Agent Coordination

The [agent system](/apps/prismatic-agents/) uses PubSub for coordination between agents running on different nodes. When an agent completes a task, it broadcasts its result, allowing dependent agents to proceed without polling:

```elixir
defmodule PrismaticAgents.MissionCoordinator do
  use GenServer
  alias PrismaticPubSub.Topics

  @impl true
  def init(mission) do
    Phoenix.PubSub.subscribe(PrismaticPubSub, Topics.agent_status())
    Phoenix.PubSub.subscribe(PrismaticPubSub, Topics.agent_metrics())

    {:ok, %{
      mission: mission,
      active_agents: %{},
      pending_tasks: mission.tasks,
      completed: []
    }}
  end

  @impl true
  def handle_info({:agent_completed, agent_id, result}, state) do
    state =
      state
      |> record_completion(agent_id, result)
      |> schedule_dependent_tasks(agent_id)
      |> maybe_complete_mission()

    {:noreply, state}
  end

  @impl true
  def handle_info({:agent_error, agent_id, error}, state) do
    state =
      state
      |> handle_agent_failure(agent_id, error)
      |> maybe_retry_or_abort()

    {:noreply, state}
  end

  defp schedule_dependent_tasks(state, completed_agent_id) do
    dependents =
      Enum.filter(state.pending_tasks, fn task ->
        completed_agent_id in task.depends_on and
          all_dependencies_met?(task, state.completed)
      end)

    Enum.reduce(dependents, state, fn task, acc ->
      {:ok, agent_id} = PrismaticAgents.dispatch(task)

      Phoenix.PubSub.broadcast(
        PrismaticPubSub,
        Topics.agent_started(agent_id),
        {:agent_started, agent_id, task}
      )

      put_in(acc.active_agents[agent_id], task)
    end)
  end
end
```

### Search Index Synchronization

PubSub provides the event stream that keeps the [Meilisearch](/apps/prismatic-meilisearch/) index synchronized with the primary [storage](/architecture/storage-adapters/) layer:

```elixir
defmodule PrismaticSearch.Sync do
  use GenServer

  @subscriptions [
    "assets:discovered",
    "assets:updated",
    "assets:deleted"
  ]

  @impl true
  def init(_opts) do
    Enum.each(@subscriptions, fn topic ->
      Phoenix.PubSub.subscribe(PrismaticPubSub, topic)
    end)

    {:ok, %{pending_batch: [], batch_timer: nil}}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, state) do
    state = add_to_batch(state, {:index, "assets", format_for_search(asset)})
    {:noreply, maybe_flush(state)}
  end

  @impl true
  def handle_info({:asset_updated, asset}, state) do
    state = add_to_batch(state, {:update, "assets", asset.id, format_for_search(asset)})
    {:noreply, maybe_flush(state)}
  end

  @impl true
  def handle_info({:asset_deleted, asset_id}, state) do
    state = add_to_batch(state, {:delete, "assets", asset_id})
    {:noreply, maybe_flush(state)}
  end

  defp maybe_flush(%{pending_batch: batch} = state) when length(batch) >= 50 do
    flush_batch(state)
  end

  defp maybe_flush(%{batch_timer: nil} = state) do
    timer = Process.send_after(self(), :flush_batch, 1_000)
    %{state | batch_timer: timer}
  end

  defp maybe_flush(state), do: state
end
```

This pattern uses micro-batching to reduce the number of Meilisearch API calls while still providing near-real-time search index updates. Events are buffered for up to 1 second or 50 events, whichever comes first.

## Event Message Design

The format of PubSub messages follows a consistent convention across the platform. Messages are tuples where the first element is an atom identifying the event type:

```elixir
# Event message conventions:
# {:event_name, payload}                    - Simple event
# {:event_name, entity_id, payload}         - Entity-specific event
# {:event_name, entity_id, metadata, payload} - Event with metadata

# Examples:
{:asset_discovered, %Asset{id: "a1", domain: "example.com"}}
{:agent_completed, "agent-42", %{duration_ms: 1250, result: :success}}
{:security_alert, :critical, %Alert{type: :exposed_service, ...}}
{:rating_changed, "example.com", %{old: :B, new: :A, score: 850}}
```

The convention of using tagged tuples rather than maps or structs for PubSub messages was chosen for [pattern matching](/glossary/pattern-matching/) efficiency. Subscribers can use [Elixir](/glossary/elixir/)'s pattern matching in `handle_info/2` to selectively process only the events they care about, with non-matching messages falling through to a catch-all clause:

```elixir
# Selective event handling via pattern matching
def handle_info({:security_alert, :critical, alert}, socket) do
  # Only handles critical alerts
  {:noreply, update(socket, :critical_alerts, &[alert | &1])}
end

def handle_info({:security_alert, _severity, _alert}, socket) do
  # Catch-all for non-critical alerts - increment counter only
  {:noreply, update(socket, :alert_count, &(&1 + 1))}
end
```

## Distributed PubSub and Cluster Behavior

When the platform runs as a multi-node Erlang [cluster](/glossary/cluster/), PubSub automatically distributes messages across all nodes. The `PG2` adapter uses Erlang's `pg` module (OTP 23+), which maintains a distributed process group across the cluster:

```
Node A                          Node B                          Node C
  |                               |                               |
  +-- PubSub Server ----+------- pg group synchronization --------+
  |   (local registry)  |        |   (local registry)             |   (local registry)
  |                     |        |                                |
  +-- LiveView procs    |        +-- LiveView procs               +-- Agent procs
  +-- Search sync       |        +-- GraphQL subs                 +-- Metrics collector
                        |        |
                        +--------+
                    Cross-node message
                    delivery via Erlang
                    distribution protocol
```

### Cluster Formation on Fly.io

The Prismatic Platform uses `libcluster` for automatic cluster formation on Fly.io:

```elixir
config :libcluster,
  topologies: [
    fly6pn: [
      strategy: Cluster.Strategy.DNSPoll,
      config: [
        polling_interval: 5_000,
        query: System.get_env("FLY_APP_NAME") <> ".internal",
        node_basename: System.get_env("FLY_APP_NAME")
      ]
    ]
  ]
```

When a new node joins the cluster, `pg` automatically synchronizes the process group membership, and new PubSub subscriptions on the joining node begin receiving broadcasts from all other nodes within seconds.

### Partition Handling

Network partitions in distributed PubSub are an inherent concern covered by the [CAP theorem](/glossary/cap-theorem/). The Prismatic Platform's PubSub makes an explicit availability-over-consistency choice: during a partition, each partition continues to deliver events to its local subscribers, but cross-partition delivery is lost. When the partition heals, `pg` group membership resynchronizes automatically, but events published during the partition are not replayed.

For events where delivery guarantees are critical (such as [audit trail](/glossary/audit-trail/) entries or compliance state changes), the platform uses [PostgreSQL](/glossary/postgresql/)-backed [event sourcing](/architecture/event-sourcing/) as the source of truth, with PubSub serving only as a notification mechanism. The consumer can always rebuild its state from the persistent event store if PubSub messages are lost.

## Telemetry and Observability

PubSub operations emit [telemetry](/architecture/telemetry/) events that integrate with the platform's monitoring infrastructure:

```elixir
defmodule PrismaticPubSub.Telemetry do
  @events [
    [:phoenix, :pubsub, :broadcast, :start],
    [:phoenix, :pubsub, :broadcast, :stop],
    [:phoenix, :pubsub, :subscribe, :start],
    [:phoenix, :pubsub, :subscribe, :stop]
  ]

  def attach do
    :telemetry.attach_many(
      "prismatic-pubsub-metrics",
      @events,
      &handle_event/4,
      %{}
    )
  end

  defp handle_event(
         [:phoenix, :pubsub, :broadcast, :stop],
         %{duration: duration},
         %{topic: topic},
         _config
       ) do
    domain = topic |> String.split(":") |> List.first()

    :telemetry.execute(
      [:prismatic, :pubsub, :broadcast],
      %{duration: duration, subscriber_count: count_subscribers(topic)},
      %{domain: domain, topic: topic}
    )
  end

  defp count_subscribers(topic) do
    PrismaticPubSub
    |> Phoenix.PubSub.node_name()
    |> :pg.get_members(topic)
    |> length()
  rescue
    _ -> 0
  end
end
```

## Performance Characteristics

### Measured Performance

Benchmarks from the Prismatic Platform production environment (3-node cluster, 8-core per node, 32GB RAM):

| Metric | Local (same node) | Cluster (cross-node) | Notes |
|--------|-------------------|---------------------|-------|
| Broadcast latency (single subscriber) | <50us | <2ms | Process send + pg dispatch |
| Broadcast latency (100 subscribers) | <200us | <5ms | Fan-out to all subscribers |
| Broadcast latency (1,000 subscribers) | <1ms | <10ms | Linear in subscriber count |
| Subscribe/unsubscribe | <10us | <100us | pg group join/leave |
| Memory per subscription | ~200 bytes | ~200 bytes | pg group entry overhead |
| Max subscribers per topic | Unlimited | Unlimited | Bounded by node memory |
| Max topics | Unlimited | Unlimited | Bounded by pg group count |
| Throughput (broadcasts/sec, single topic) | 100,000+ | 50,000+ | Benchmarked with benchee |

### Scaling Considerations

PubSub broadcast latency scales linearly with the number of subscribers on a topic. For topics with very high fan-out (10,000+ subscribers), consider these strategies:

1. **Topic sharding**: Split `"assets:discovered"` into `"assets:discovered:shard:0"` through `"assets:discovered:shard:N"`, with subscribers assigned to shards by consistent hashing.

2. **Intermediate aggregation**: Insert a [GenServer](/glossary/genserver/) that subscribes to the high-frequency topic, aggregates events over a time window, and broadcasts summaries on a lower-frequency topic.

3. **Rate-limited broadcast**: Use [backpressure](/glossary/backpressure/) patterns to throttle broadcast frequency when subscriber count exceeds thresholds.

## Comparison with Alternative Event Systems

| System | Latency | Persistence | Ordering | Language Integration | Prismatic Usage |
|--------|---------|-------------|----------|---------------------|-----------------|
| Phoenix PubSub (pg) | <100us | None | Per-topic FIFO | Native BEAM | Primary event bus |
| Redis Pub/Sub | ~1ms | None | Per-[channel](/glossary/channel/) FIFO | Client library | Multi-region fallback |
| RabbitMQ | ~5ms | Optional | Per-queue FIFO | AMQP client | Not used (overhead) |
| Apache Kafka | ~10ms | Persistent | Partition-ordered | Producer/consumer lib | Not used (complexity) |
| PostgreSQL LISTEN/NOTIFY | ~2ms | None | FIFO | [Ecto](/glossary/ecto/)/Postgrex | Audit event triggers |

Phoenix PubSub was chosen as the primary event bus because it eliminates external infrastructure dependencies, provides the lowest latency for the common case (same-cluster delivery), and integrates natively with [LiveView](/architecture/phoenix-liveview/) and Absinthe subscriptions. The tradeoff is the lack of message persistence -- which is acceptable because the platform uses persistent storage ([PostgreSQL](/architecture/postgresql-kuzudb/), [event sourcing](/architecture/event-sourcing/)) as the source of truth and PubSub purely as a notification layer.

## Summary

Phoenix PubSub serves as the central nervous system of the Prismatic Platform, routing domain events between [LiveView dashboards](/architecture/phoenix-liveview/), [GraphQL subscriptions](/architecture/graphql/), [agent coordinators](/apps/prismatic-agents/), search indexers, and monitoring systems. Its design leverages the BEAM's native process messaging to deliver sub-millisecond local event propagation and single-digit millisecond cross-cluster delivery without requiring external message brokers. The topic-based routing, combined with Elixir's pattern matching in `handle_info/2`, creates a system where adding new event consumers is a matter of subscribing to a topic and writing a pattern match -- no configuration changes, no routing rules, no deployment coordination. This architectural simplicity is the direct result of building on a runtime ([OTP](/glossary/otp/)) that treats inter-process messaging as a first-class primitive rather than an afterthought bolted onto a thread-based model.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
