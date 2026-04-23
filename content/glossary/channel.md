+++
title = "Channel"
weight = 15
[extra]
category = "architecture"
description = "Phoenix abstraction for real-time bidirectional communication over WebSockets between server and clients."
related_terms = ["phoenix", "pubsub", "liveview", "genserver", "graphql"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1128
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Channel", "Phoenix", "WebSockets", "glossary", "architecture", "Prismatic Platform", "WebSocket", "Phoenix Channels"]
tags = ["glossary", "architecture", "channel", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Channel - Prismatic Platform"
+++

## Definition

A Phoenix Channel is a high-level abstraction for real-time, bidirectional communication between server and connected clients, built on top of [WebSocket](@/glossary/websocket.md) transport with automatic fallback to HTTP long-polling. Channels organize communication into named topics (such as `"security:alerts"` or `"assets:discovery"`), where clients join topics of interest and exchange messages with the server and other clients through a structured event-based protocol. Each channel connection is backed by an Erlang process, inheriting [OTP](@/glossary/beam.md) fault tolerance, state management, and supervision capabilities that make Phoenix Channels uniquely robust compared to WebSocket implementations in other ecosystems.

The Channel abstraction solves several problems that raw WebSocket implementations leave to the developer: topic-based message routing (multiplexing multiple logical connections over a single WebSocket), presence tracking (knowing which users are connected and what metadata they carry), authorization (controlling who can join which topics), and distributed broadcasting (propagating messages across multiple server nodes in a [cluster](@/glossary/cluster.md)). By delegating these concerns to the framework, developers can focus on application logic---what events to handle and what data to push---rather than connection management infrastructure.

Phoenix Channels follow a request-response-push hybrid model. Clients can push events to the server (`handle_in`), the server can push events to specific clients, and the server can broadcast events to all clients subscribed to a topic. This three-way communication model supports patterns ranging from simple notification broadcasting (server pushes security alerts to all subscribers) to interactive request-response exchanges (client requests asset details, server responds with data) to collaborative state synchronization (multiple clients editing shared state with conflict resolution).

## Channel Lifecycle

Every Phoenix Channel connection follows a defined lifecycle with explicit callback hooks:

```elixir
defmodule PrismaticWeb.SecurityChannel do
  use Phoenix.Channel

  # 1. JOIN: Client requests to join a topic
  @impl true
  def join("security:" <> asset_id, params, socket) do
    if authorized?(socket.assigns.user_id, asset_id) do
      send(self(), :after_join)
      {:ok, assign(socket, :asset_id, asset_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # 2. AFTER JOIN: Send initial state to newly joined client
  @impl true
  def handle_info(:after_join, socket) do
    {:ok, rating} = PrismaticPerimeter.Ratings.latest(socket.assigns.asset_id)
    push(socket, "current_rating", rating)

    # Track presence for this user
    PrismaticWeb.Presence.track(socket, socket.assigns.user_id, %{
      joined_at: DateTime.utc_now(),
      role: socket.assigns.role
    })

    {:noreply, socket}
  end

  # 3. HANDLE_IN: Process client-sent events
  @impl true
  def handle_in("request_scan", %{"domain" => domain}, socket) do
    case PrismaticPerimeter.discover(domain) do
      {:ok, result} ->
        # Reply to the specific client
        {:reply, {:ok, result}, socket}
      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  # 4. HANDLE_OUT: Intercept outgoing broadcasts (optional)
  intercept ["new_alert"]

  @impl true
  def handle_out("new_alert", payload, socket) do
    if payload.severity >= socket.assigns.min_severity do
      push(socket, "new_alert", payload)
    end
    {:noreply, socket}
  end

  # 5. TERMINATE: Clean up when client disconnects
  @impl true
  def terminate(_reason, _socket) do
    :ok
  end
end
```

| Lifecycle Phase | Callback | Purpose |
|----------------|----------|---------|
| **Join** | `join/3` | Authorize client, initialize state |
| **After Join** | `handle_info/2` | Send initial data, track presence |
| **Client Event** | `handle_in/3` | Process events sent by client |
| **Server Event** | `handle_info/2` | Process internal Elixir messages |
| **Broadcast Intercept** | `handle_out/3` | Filter/transform outgoing broadcasts |
| **Disconnect** | `terminate/2` | Clean up resources |

## Topic-Based Pub/Sub

Channels use a topic string to route messages. Topics follow a `"resource:identifier"` convention that enables both specific and wildcard subscriptions:

| Topic Pattern | Example | Use Case |
|--------------|---------|----------|
| `"resource:*"` | `"security:*"` | All security events (server-side wildcard) |
| `"resource:id"` | `"security:asset_123"` | Events for a specific asset |
| `"resource:lobby"` | `"assets:lobby"` | General channel for a resource type |
| `"resource:subtopic:id"` | `"compliance:nis2:example_com"` | Nested topic hierarchy |

Broadcasting to a topic delivers the message to all clients subscribed to that topic, regardless of which server node they are connected to (distributed via [PubSub](@/glossary/pubsub.md)):

```elixir
# Broadcasting patterns
# From within a channel
broadcast(socket, "rating_updated", %{grade: "A", score: 850})

# From anywhere in the application
PrismaticWeb.Endpoint.broadcast("security:alerts", "new_alert", %{
  severity: "critical",
  message: "New vulnerability detected",
  asset: "example.com"
})

# Direct push to a specific client (not broadcast)
push(socket, "scan_complete", %{status: "success", findings: 42})
```

## Presence Tracking

Phoenix Presence provides distributed, conflict-free tracking of connected users and their metadata. Built on CRDTs (Conflict-free Replicated Data Types), Presence automatically synchronizes state across [cluster](@/glossary/cluster.md) nodes without a central coordinator:

```elixir
defmodule PrismaticWeb.Presence do
  use Phoenix.Presence,
    otp_app: :prismatic_web,
    pubsub_server: PrismaticWeb.PubSub
end

# In channel: track user presence
def handle_info(:after_join, socket) do
  {:ok, _} = PrismaticWeb.Presence.track(socket, socket.assigns.user_id, %{
    online_at: inspect(System.system_time(:second)),
    viewing: "perimeter_dashboard",
    role: socket.assigns.role
  })

  # Push current presence state to newly joined client
  push(socket, "presence_state", PrismaticWeb.Presence.list(socket))
  {:noreply, socket}
end
```

| Presence Feature | Description |
|-----------------|-------------|
| **Track** | Register a user's presence with metadata |
| **Untrack** | Remove a user's presence (automatic on disconnect) |
| **List** | Get all currently present users with metadata |
| **Diff** | Receive joins and leaves as incremental updates |
| **CRDT Sync** | Automatic conflict-free synchronization across nodes |

Presence tracking enables features like "who is viewing this dashboard," "how many analysts are online," and "which users are monitoring which assets."

## Intercept Mechanism

The `intercept` mechanism allows channels to filter or transform broadcast messages before they reach individual clients. This is useful for per-client message customization:

```elixir
# Only forward alerts matching client's configured severity threshold
intercept ["new_alert", "score_change"]

def handle_out("new_alert", payload, socket) do
  if payload.severity in socket.assigns.alert_severities do
    push(socket, "new_alert", payload)
  end
  {:noreply, socket}
end

def handle_out("score_change", payload, socket) do
  # Enrich with client-specific context
  enriched = Map.put(payload, :is_watched, payload.asset_id in socket.assigns.watched_assets)
  push(socket, "score_change", enriched)
  {:noreply, socket}
end
```

Without intercept, all broadcasts go directly to all subscribers. With intercept, each channel process can decide whether and how to deliver each broadcast to its connected client. This enables per-client filtering without requiring separate topics for each filter combination.

## Process Architecture

Each channel connection is an Erlang process, which means every connected client has a dedicated lightweight process on the server:

```
WebSocket Connection
    |
    v
Socket (1 per connection)
    |
    +-- Channel Process: "security:asset_123"  (GenServer)
    |       |-- State: %{user_id: 42, asset_id: "asset_123", ...}
    |       |-- Mailbox: incoming events queue
    |       |-- Supervisor: auto-restart on crash
    |
    +-- Channel Process: "assets:lobby"  (GenServer)
    |       |-- State: %{user_id: 42, filters: [...], ...}
    |       |-- ...
    |
    +-- Channel Process: "quality:metrics"  (GenServer)
            |-- State: %{user_id: 42, dashboard: "main", ...}
            |-- ...
```

This process-per-channel architecture provides:

- **Isolation**: A crash in one channel does not affect other channels on the same connection
- **State**: Each channel maintains its own state (assigns) independently
- **Concurrency**: Messages from different channels are processed concurrently
- **Supervision**: Crashed channels are automatically restarted by OTP supervisors
- **Memory**: Each process uses only ~2KB initially, scaling to millions of connections

## Implementation in Prismatic Platform

Phoenix Channels power the real-time features across the Prismatic Platform's web dashboards, providing the communication layer between server-side intelligence processing and browser-based visualization.

**Security Event Streams**: Security alerts, vulnerability discoveries, and threat intelligence updates are broadcast through channels to all connected [LiveView](@/glossary/liveview.md) dashboard clients. The Perimeter EASM dashboard at `/perimeter` subscribes to security channels for real-time rating updates.

**Asset Discovery Progress**: When asset discovery scans run for a domain, progress updates (assets found, scan phases completed, errors encountered) are pushed through asset channels, enabling real-time progress visualization without polling.

**Quality Metric Updates**: Quality score changes, QDP elimination progress, and autoheal results are broadcast through quality channels, keeping the platform monitoring dashboard current.

**Distributed Architecture**: The platform's multi-node [cluster](@/glossary/cluster.md) deployment uses [PubSub](@/glossary/pubsub.md)-backed channels to synchronize real-time state across nodes. A security event detected on one node is broadcast to all connected clients across all nodes through PubSub's distributed message propagation.

**Client-Side Integration**:

```javascript
// Phoenix JavaScript client connecting to security channel
import { Socket } from "phoenix"

let socket = new Socket("/socket", {params: {token: userToken}})
socket.connect()

let channel = socket.channel("security:alerts", {min_severity: "high"})

channel.on("new_alert", payload => {
  renderAlert(payload)
})

channel.on("rating_updated", payload => {
  updateSecurityGrade(payload.grade, payload.score)
})

channel.join()
  .receive("ok", resp => { console.log("Joined security channel", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })
```

## Best Practices

**Topic Naming**: Follow the `"resource:identifier"` convention consistently. Use singular resource names for specific entity subscriptions (`"security:asset_123"`) and `"resource:lobby"` for general-purpose channels within a resource type. Avoid deeply nested topic hierarchies that complicate routing.

**Authorization in join/3**: Always validate authorization in the `join/3` callback before allowing a client to subscribe. Never defer authorization to `handle_in/3` -- unauthorized clients should never receive any messages on a topic they should not access.

**Minimize Intercept Usage**: Use `intercept` sparingly. Every intercepted event adds per-client processing overhead since the `handle_out` callback executes for each connected client. For simple broadcast scenarios, skip intercept entirely and let messages flow directly.

**Presence Over Custom Tracking**: Use Phoenix Presence for any user tracking needs rather than building custom tracking with ETS or GenServer state. Presence handles distributed synchronization, conflict resolution, and cleanup automatically via CRDTs.

**Broadcast from Outside Channels**: Use `Endpoint.broadcast/3` for pushing events from background processes (Broadway pipelines, cron jobs, GenServers) rather than maintaining persistent channel references.

## Use Cases

- **Real-Time Security Dashboards**: Broadcasting security alerts, vulnerability discoveries, and rating changes to all connected analysts monitoring the Perimeter EASM dashboard
- **Asset Discovery Progress**: Pushing scan progress updates (assets found, phases completed, errors encountered) to clients watching a specific domain's discovery
- **Collaborative Monitoring**: Multiple analysts viewing the same security assessment with presence tracking showing who is online and what they are examining
- **Agent Status Feeds**: Real-time agent execution status and telemetry streaming to monitoring dashboards
- **Quality Metric Updates**: Broadcasting quality score changes and QDP elimination progress across connected platform users
- **Interactive Investigations**: Request-response exchanges where clients request asset details or trigger scans through channel events

## Related Concepts

- [Phoenix](@/glossary/phoenix.md) - Framework providing the Channel implementation and transport layer
- [PubSub](@/glossary/pubsub.md) - Message routing backbone that distributes channel broadcasts across nodes
- [WebSocket](@/glossary/websocket.md) - Transport protocol underlying channel connections
- [LiveView](@/glossary/liveview.md) - Server-rendered UI that uses channel-like connections for real-time updates
- [Message Passing](@/glossary/message-passing.md) - Erlang/OTP primitive that channels are built upon
- [Supervisor](@/glossary/supervisor.md) - OTP behavior managing channel process lifecycle
- [Cluster](@/glossary/cluster.md) - Multi-node deployment with distributed channel broadcasting
- [GraphQL](@/glossary/graphql.md) - API layer that can deliver subscriptions through channels
- [Distributed System](@/glossary/distributed-system.md) - Architecture pattern requiring distributed real-time communication
- [Process Isolation](@/glossary/process-isolation.md) - BEAM feature ensuring channel crash containment

## See Also

- [Architecture](@/architecture/_index.md) - Platform real-time communication architecture
- [Technologies](@/technologies/_index.md) - Communication technology stack
- [Apps](@/apps/_index.md) - Applications using Phoenix Channels for real-time features

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)