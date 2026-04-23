+++
title = "Phoenix PubSub"
weight = 75
[extra]
category = "protocol"
description = "Distributed publish-subscribe system for real-time messaging across processes and cluster nodes"
url = "https://hexdocs.pm/phoenix_pubsub/"
version = "2.1+"
icon = "pubsub"
color = "orange"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1037
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Phoenix", "PubSub", "Distributed", "technologies", "protocol", "Prismatic Platform", "LiveView", "Redis", "Erlang", "BEAM"]
tags = ["technologies", "protocol", "phoenix-pubsub", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Phoenix PubSub - Prismatic Platform"
+++

## Overview

Phoenix PubSub is the distributed messaging system that connects all real-time components of the Prismatic Platform. It enables processes to subscribe to topics and receive messages when events occur, providing the communication backbone for [Phoenix LiveView](/technologies/phoenix-liveview/) updates, agent notifications, security alerts, and cross-application event propagation across the 90-application umbrella architecture.

The Prismatic Platform uses PubSub for real-time dashboard updates (security rating changes, new vulnerability discoveries), agent coordination (task distribution, status broadcasting), system-wide event notification (deployment events, quality gate results), and search index synchronization (keeping [Meilisearch](/technologies/meilisearch/) current when data changes). PubSub's distributed nature means events published on one cluster node are automatically delivered to subscribers on all nodes, which is essential for the platform's multi-node deployment on [Fly.io](/technologies/flyio/). Without PubSub, each node would operate in isolation, and users connected to different nodes would see inconsistent dashboard state.

PubSub supports multiple adapters -- the platform uses the PG2 adapter for distributed [Erlang/OTP](/technologies/erlang-otp/) clusters on Fly.io and the [Redis](/technologies/redis/) adapter as an alternative for environments without Distributed Erlang. The adapter is selected at configuration time, and the publishing/subscribing API remains identical regardless of the backend, enabling transparent migration between adapter strategies without code changes.

## Key Features

- **Topic-Based Routing**: Hierarchical topic strings with pattern-based subscription for fine-grained event filtering, enabling subscribers to receive only the events they care about
- **Distributed by Default**: Automatic message propagation across all connected cluster nodes using the PG2 process group adapter
- **Process Integration**: Any [Elixir](/technologies/elixir/)/Erlang process can subscribe -- [GenServer](/technologies/genserver/)s, Tasks, LiveView processes, and custom agents all participate equally
- **Multiple Adapters**: PG2 (default for Distributed Erlang), Redis (for non-EPMD environments), and custom adapters for specialized requirements
- **Broadcast**: One-to-many message delivery from a single publish call to all subscribers on all nodes with no fan-out overhead on the publisher
- **Direct Send**: Targeted message delivery to specific subscribers when broadcast is too broad for the use case
- **Zero Configuration**: Works out of the box with PG2 in a clustered [BEAM](/technologies/beam/) deployment without external infrastructure dependencies
- **Lightweight**: No persistent message storage, no delivery guarantees beyond process liveness -- designed for real-time notification, not durable messaging

## Platform Integration

PubSub connects all real-time components across the platform. Events flow from publishers (security scanners, agent coordinators, data pipelines) to subscribers (LiveView processes, search indexers, notification handlers).

```elixir
defmodule PrismaticPerimeter.Events do
  @moduledoc "Publishes security events for real-time dashboard updates"
  @pubsub PrismaticWeb.PubSub

  @doc "Broadcast a security rating change for a domain"
  def broadcast_rating_change(domain, old_rating, new_rating) do
    Phoenix.PubSub.broadcast(@pubsub, "perimeter:#{domain}", %{
      event: :rating_changed,
      domain: domain,
      old_rating: old_rating,
      new_rating: new_rating,
      timestamp: DateTime.utc_now()
    })
  end

  @doc "Broadcast a new security finding"
  def broadcast_finding(domain, finding) do
    Phoenix.PubSub.broadcast(@pubsub, "perimeter:findings", %{
      event: :new_finding,
      domain: domain,
      finding: finding,
      severity: finding.severity
    })
  end

  @doc "Broadcast asset discovery to all monitoring dashboards"
  def broadcast_asset_discovered(domain, asset) do
    Phoenix.PubSub.broadcast(@pubsub, "perimeter:#{domain}", %{
      event: :asset_discovered,
      domain: domain,
      asset: asset,
      discovered_at: DateTime.utc_now()
    })
  end
end
```

LiveView processes subscribe on mount and handle incoming messages to update the UI in real-time:

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  use PrismaticWeb, :live_view

  def mount(%{"domain" => domain}, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:#{domain}")
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:findings")
    end

    {:ok, assign(socket, domain: domain, rating: load_rating(domain))}
  end

  def handle_info(%{event: :rating_changed, new_rating: rating}, socket) do
    {:noreply, assign(socket, :rating, rating)}
  end

  def handle_info(%{event: :new_finding, finding: finding}, socket) do
    {:noreply, update(socket, :findings, &[finding | &1])}
  end
end
```

Non-LiveView subscribers also participate. The search index synchronizer subscribes to data change events to keep Meilisearch current without polling the database:

```elixir
defmodule PrismaticStorage.Search.IndexSync do
  use GenServer

  def init(_) do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "agents:changes")
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:findings")
    {:ok, %{indexed_count: 0}}
  end

  def handle_info(%{event: :agent_updated, agent: agent}, state) do
    PrismaticStorage.Search.MeilisearchAdapter.index_document("agents", agent)
    {:noreply, %{state | indexed_count: state.indexed_count + 1}}
  end

  def handle_info(%{event: :new_finding, finding: finding}, state) do
    PrismaticStorage.Search.MeilisearchAdapter.index_document("findings", finding)
    {:noreply, %{state | indexed_count: state.indexed_count + 1}}
  end
end
```

## Architecture

PubSub operates as a lightweight message bus that connects publishers and subscribers across the platform's process ecosystem and cluster topology.

| Component | Role | Implementation |
|-----------|------|----------------|
| **PubSub Server** | Named GenServer managing subscriptions | `Phoenix.PubSub` started in supervision tree |
| **PG2 Adapter** | Distributed process group membership | Erlang `:pg` module (OTP 23+) |
| **Redis Adapter** | Alternative for non-Distributed-Erlang | `Phoenix.PubSub.Redis` with Redix |
| **Topics** | String-based routing keys | Hierarchical (e.g., `"perimeter:example.com"`) |
| **Subscribers** | Processes registered for topics | LiveView, GenServer, Task processes |
| **Publishers** | Processes broadcasting events | Scanners, coordinators, pipelines |

The message flow in a clustered deployment:

```
Publisher (Node A) -> PubSub Server (Node A) -> PG2/Redis -> PubSub Server (Node B)
                            |                                        |
                      Local Subscribers                        Remote Subscribers
                      (LiveView, GenServer)                    (LiveView, GenServer)
```

## Performance Characteristics

PubSub is designed for high-throughput, low-latency message delivery with minimal overhead per subscriber.

| Metric | Value | Context |
|--------|-------|---------|
| Local broadcast latency | <100us | Same-node delivery |
| Cross-node broadcast latency | <5ms | PG2 adapter over Distributed Erlang |
| Redis adapter latency | <10ms | Includes Redis round-trip |
| Subscribers per topic | Unlimited | Limited only by BEAM memory |
| Topics per PubSub instance | Unlimited | ETS-backed topic registry |
| Message throughput | 100,000+ msg/s | Local broadcasts, single node |
| Memory per subscription | ~200 bytes | PG2 group membership entry |
| Subscriber notification | Sequential per topic | Parallel across topics |

## Configuration

```elixir
# PubSub configuration with PG2 adapter for clustered deployment
config :prismatic_web, PrismaticWeb.PubSub,
  adapter: Phoenix.PubSub.PG2,
  name: PrismaticWeb.PubSub,
  pool_size: System.schedulers_online()

# Alternative: Redis adapter for environments without Distributed Erlang
config :prismatic_web, PrismaticWeb.PubSub,
  adapter: Phoenix.PubSub.Redis,
  url: System.get_env("REDIS_URL"),
  name: PrismaticWeb.PubSub,
  node_name: System.get_env("FLY_ALLOC_ID", "default")
```

The PubSub server is started as part of the application supervision tree:

```elixir
defmodule PrismaticWeb.Application do
  use Application

  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: PrismaticWeb.PubSub},
      PrismaticWeb.Endpoint
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

## Best Practices

- **Use specific topic strings** -- `"perimeter:example.com"` is better than `"perimeter"` to reduce message volume per subscriber and improve relevance
- **Always guard subscriptions with `connected?/1`** in LiveView -- subscribing during static render causes errors and duplicate subscriptions
- **Keep messages small** -- broadcast the event type and an identifier, let the subscriber fetch full data if needed; large payloads amplify network cost in clustered deployments
- **Handle unknown messages** -- add a catch-all `handle_info/2` clause to avoid crashing on unexpected events from topics that evolve over time
- **Use PubSub for cross-application coordination** -- it is the canonical way for umbrella apps to communicate without direct module dependencies
- **Prefer broadcast over direct send** -- broadcast is the common case; direct send is an optimization for specific subscribers that should be used sparingly
- **Monitor topic subscription counts** -- use `:pg.get_members/2` to verify that expected subscribers are active and detect subscription leaks

## Comparison with Alternatives

| Feature | Phoenix PubSub | Redis Pub/Sub | RabbitMQ | Kafka |
|---------|---------------|---------------|----------|-------|
| Delivery guarantee | At-most-once | At-most-once | At-least-once | At-least-once |
| Persistence | None (real-time only) | None | Optional (queues) | Persistent log |
| Clustering | Native (PG2/Distributed Erlang) | Redis cluster | RabbitMQ cluster | Broker cluster |
| Latency | <100us (local) | <1ms | <5ms | <10ms |
| External dependency | None (PG2 adapter) | Redis server | RabbitMQ server | Kafka cluster + ZooKeeper |
| BEAM integration | Native process messages | Via Redix | Via AMQP library | Via Kafka library |
| Backpressure | None (drop on slow consumer) | None | Channel-level flow control | Consumer group offsets |
| Platform usage | Primary real-time messaging | Fallback adapter | Not used | Not used |

Phoenix PubSub is the ideal choice for the Prismatic Platform because it requires no external infrastructure when using the PG2 adapter, integrates natively with BEAM processes, and provides the low-latency real-time delivery that LiveView dashboards demand.

PubSub also serves as the decoupling layer between umbrella applications, allowing domain-specific apps to emit events without knowing which other apps will consume them. This publish-subscribe pattern prevents the tight coupling that would otherwise emerge in a 90-application umbrella, where direct module calls between apps would create fragile dependency chains. By routing inter-app communication through PubSub topics, each application maintains a clean boundary with its dependencies declared through topic subscriptions rather than compile-time module references.

## Related Technologies

- [Phoenix LiveView](/technologies/phoenix-liveview/) - Primary consumer of PubSub events for real-time UI updates
- [WebSockets](/technologies/websockets/) - Browser-side transport for PubSub-driven updates via LiveView
- [Redis](/technologies/redis/) - Alternative PubSub adapter for non-Distributed-Erlang environments
- [GenServer](/technologies/genserver/) - Process subscribers that react to PubSub events for background processing
- [Phoenix Framework](/technologies/phoenix/) - The web framework that provides the PubSub infrastructure
- [BEAM VM](/technologies/beam/) - Process model enabling lightweight subscriber processes

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - PubSub event hub and LiveView subscriber host
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security event publisher for rating and finding changes
- [prismatic_agents](/apps/prismatic-agents/) - Agent status broadcasting and coordination via PubSub
- [prismatic_storage_meilisearch](/apps/prismatic-storage-meilisearch/) - Search index synchronization through PubSub events

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)