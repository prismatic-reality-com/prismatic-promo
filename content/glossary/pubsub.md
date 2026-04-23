+++
title = "PubSub"
weight = 15
[extra]
category = "architecture"
subcategory = "messaging_patterns"
difficulty = "intermediate"
technology_type = "messaging_system"
platform_component = "communication_layer"
decoupling_mechanism = "topic_based"
scalability_pattern = "fan_out"
real_time_capability = "enabled"
fault_tolerance = "supervisor_based"
distribution_support = "cluster_aware"
backpressure_handling = "built_in"
prerequisite_concepts = ["message_passing", "process_communication", "event_driven_architecture", "distributed_systems"]
use_cases = ["real_time_updates", "event_broadcasting", "system_decoupling", "notification_delivery"]
benefits = ["loose_coupling", "scalability", "real_time_updates", "fault_isolation"]
implementation_patterns = ["topic_subscription", "message_broadcasting", "event_routing", "channel_management"]
quality_metrics = ["message_throughput", "delivery_latency", "subscriber_count", "fault_recovery_time"]
integration_points = ["phoenix_channels", "liveview", "websockets", "distributed_erlang"]
related_disciplines = ["event_driven_architecture", "real_time_systems", "distributed_computing", "message_queuing"]
phoenix_integration = "native"
description = "Publish-subscribe messaging system enabling decoupled communication between processes and distributed nodes."
related_terms = ["phoenix", "liveview", "telemetry", "message-passing", "channel", "cluster", "graphql", "redis", "topic-subscription", "event-broadcasting", "real-time-messaging", "distributed-pubsub"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1748
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PubSub", "Publish-subscribe", "glossary", "architecture", "Prismatic Platform", "Phoenix", "GenServer", "PrismaticWeb"]
tags = ["glossary", "architecture", "pubsub", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "PubSub - Prismatic Platform"
+++

## Definition

PubSub (Publish-Subscribe) is a messaging pattern in which publishers emit messages to named topics without knowledge of who will receive them, and subscribers register interest in specific topics without knowledge of who produces messages on those topics. This fundamental decoupling---publishers and subscribers interact only through the topic namespace, never directly---is one of the most powerful architectural patterns for building scalable, maintainable [distributed systems](/glossary/distributed-system/). Adding new consumers requires no changes to publishers, and adding new producers requires no changes to consumers, enabling independent evolution of system components.

Phoenix.PubSub is the Elixir ecosystem's production implementation of this pattern, designed specifically for the [BEAM](/glossary/beam/) virtual machine's concurrent process model. It provides both local (single-node) and distributed (multi-node) message delivery through pluggable adapter backends. On a single node, messages are delivered through direct Erlang process messaging with sub-millisecond latency. Across a [cluster](/glossary/cluster/) of connected nodes, messages are automatically propagated to all subscribers on all nodes, with the distribution mechanism abstracted behind the adapter interface. The default `Phoenix.PubSub.PG2` adapter uses Erlang's built-in process groups for zero-dependency distributed messaging, while the `Phoenix.PubSub.Redis` adapter uses [Redis](/glossary/redis/) Pub/Sub for environments where Erlang node clustering is not feasible.

The PubSub pattern differs from point-to-point messaging (where a message goes to exactly one recipient) and from request-response (where a sender waits for a reply). PubSub delivers each message to every subscriber on the topic---this fan-out characteristic makes it ideal for event notification, state synchronization, and broadcasting scenarios where multiple independent consumers need to react to the same event.

## Phoenix.PubSub Architecture

Phoenix.PubSub is structured as a supervision tree with pluggable adapters:

```
Phoenix.PubSub Supervisor
    |
    +-- Local PubSub (ETS-backed registry)
    |       |-- Topic -> [pid1, pid2, pid3, ...]  (subscriber registry)
    |       |-- Fast local delivery via send/2
    |
    +-- Adapter (distribution layer)
            |-- PG2: Erlang process groups (default)
            |-- Redis: External message broker
            |-- Custom: User-defined adapters

## Advanced PubSub Patterns and Implementation

### High-Performance PubSub with Backpressure

```elixir
defmodule PrismaticPubSub.AdvancedPublisher do
  @moduledoc """
  High-performance publisher with backpressure control and delivery guarantees.
  """

  use GenServer

  defstruct [
    :name,
    :pubsub_server,
    :max_queue_size,
    :delivery_mode,
    :message_queue,
    :subscribers_count,
    :metrics
  ]

  @delivery_modes [:fire_and_forget, :at_least_once, :exactly_once]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: opts[:name])
  end

  def publish(publisher, topic, message, opts \\ []) do
    GenServer.call(publisher, {:publish, topic, message, opts})
  end

  def publish_batch(publisher, messages) do
    GenServer.call(publisher, {:publish_batch, messages})
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      name: opts[:name],
      pubsub_server: opts[:pubsub_server],
      max_queue_size: opts[:max_queue_size] || 10_000,
      delivery_mode: opts[:delivery_mode] || :fire_and_forget,
      message_queue: :queue.new(),
      subscribers_count: %{},
      metrics: initialize_metrics()
    }

    # Start background processes
    schedule_metrics_collection()
    schedule_queue_processing()

    {:ok, state}
  end

  @impl true
  def handle_call({:publish, topic, message, opts}, from, state) do
    delivery_mode = Keyword.get(opts, :delivery_mode, state.delivery_mode)

    case check_backpressure(state) do
      :ok ->
        publish_message(topic, message, delivery_mode, state)

      {:backpressure, reason} ->
        handle_backpressure(topic, message, delivery_mode, from, reason, state)
    end
  end

  @impl true
  def handle_call({:publish_batch, messages}, _from, state) do
    case check_batch_backpressure(messages, state) do
      :ok ->
        results = Enum.map(messages, fn {topic, message, opts} ->
          delivery_mode = Keyword.get(opts, :delivery_mode, state.delivery_mode)
          publish_message_sync(topic, message, delivery_mode, state)
        end)

        {:reply, results, state}

      {:backpressure, reason} ->
        {:reply, {:error, {:backpressure, reason}}, state}
    end
  end

  @impl true
  def handle_info(:process_queue, state) do
    updated_state = process_queued_messages(state)
    schedule_queue_processing()
    {:noreply, updated_state}
  end

  @impl true
  def handle_info(:collect_metrics, state) do
    updated_metrics = collect_publisher_metrics(state)
    schedule_metrics_collection()
    {:noreply, %{state | metrics: updated_metrics}}
  end

  defp check_backpressure(state) do
    queue_size = :queue.len(state.message_queue)

    cond do
      queue_size > state.max_queue_size ->
        {:backpressure, :queue_full}

      system_memory_pressure?() ->
        {:backpressure, :memory_pressure}

      subscriber_overload?(state) ->
        {:backpressure, :subscriber_overload}

      true ->
        :ok
    end
  end

  defp publish_message(topic, message, delivery_mode, state) do
    enriched_message = enrich_message(message, delivery_mode)

    case delivery_mode do
      :fire_and_forget ->
        Phoenix.PubSub.broadcast(state.pubsub_server, topic, enriched_message)
        {:reply, :ok, update_metrics(state, :message_published)}

      :at_least_once ->
        publish_with_retry(topic, enriched_message, state)

      :exactly_once ->
        publish_with_deduplication(topic, enriched_message, state)
    end
  end

  defp publish_with_retry(topic, message, state, attempts \\ 3) do
    case Phoenix.PubSub.broadcast(state.pubsub_server, topic, message) do
      :ok ->
        {:reply, :ok, update_metrics(state, :message_published)}

      {:error, reason} when attempts > 1 ->
        :timer.sleep(100)  # Brief backoff
        publish_with_retry(topic, message, state, attempts - 1)

      {:error, reason} ->
        {:reply, {:error, {:delivery_failed, reason}}, update_metrics(state, :message_failed)}
    end
  end

  defp publish_with_deduplication(topic, message, state) do
    message_id = generate_message_id(message)
    dedupe_key = {topic, message_id}

    case check_message_deduplication(dedupe_key) do
      :duplicate ->
        {:reply, {:ok, :duplicate}, update_metrics(state, :message_deduplicated)}

      :unique ->
        result = Phoenix.PubSub.broadcast(state.pubsub_server, topic, message)
        store_message_for_deduplication(dedupe_key)

        case result do
          :ok ->
            {:reply, :ok, update_metrics(state, :message_published)}

          {:error, reason} ->
            remove_deduplication_entry(dedupe_key)
            {:reply, {:error, reason}, update_metrics(state, :message_failed)}
        end
    end
  end

  defp enrich_message(message, delivery_mode) do
    Map.merge(message, %{
      __pubsub_meta__: %{
        timestamp: System.system_time(:millisecond),
        delivery_mode: delivery_mode,
        publisher: self(),
        message_id: :crypto.strong_rand_bytes(16) |> Base.encode64()
      }
    })
  end
end

defmodule PrismaticPubSub.SmartSubscriber do
  @moduledoc """
  Intelligent subscriber with filtering, buffering, and circuit breaker functionality.
  """

  use GenServer

  defstruct [
    :name,
    :pubsub_server,
    :subscriptions,
    :message_buffer,
    :buffer_size,
    :processing_mode,
    :circuit_breaker,
    :message_filters,
    :metrics
  ]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: opts[:name])
  end

  def subscribe_with_filter(subscriber, topic, filter_fn) do
    GenServer.call(subscriber, {:subscribe_filtered, topic, filter_fn})
  end

  def subscribe_with_backoff(subscriber, topic, backoff_config) do
    GenServer.call(subscriber, {:subscribe_backoff, topic, backoff_config})
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      name: opts[:name],
      pubsub_server: opts[:pubsub_server],
      subscriptions: %{},
      message_buffer: [],
      buffer_size: opts[:buffer_size] || 1000,
      processing_mode: opts[:processing_mode] || :immediate,
      circuit_breaker: initialize_circuit_breaker(),
      message_filters: %{},
      metrics: initialize_subscriber_metrics()
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:subscribe_filtered, topic, filter_fn}, _from, state) do
    case Phoenix.PubSub.subscribe(state.pubsub_server, topic) do
      :ok ->
        updated_filters = Map.put(state.message_filters, topic, filter_fn)
        updated_subscriptions = Map.put(state.subscriptions, topic, %{
          type: :filtered,
          filter: filter_fn,
          subscribed_at: System.system_time(:millisecond)
        })

        new_state = %{state |
          message_filters: updated_filters,
          subscriptions: updated_subscriptions
        }

        {:reply, :ok, new_state}

      error ->
        {:reply, error, state}
    end
  end

  @impl true
  def handle_info({:pubsub_message, topic, message}, state) do
    case should_process_message?(topic, message, state) do
      true ->
        process_message_with_circuit_breaker(topic, message, state)

      false ->
        {:noreply, update_subscriber_metrics(state, :message_filtered)}
    end
  end

  defp should_process_message?(topic, message, state) do
    case Map.get(state.message_filters, topic) do
      nil ->
        true  # No filter, process all messages

      filter_fn when is_function(filter_fn) ->
        try do
          filter_fn.(message)
        rescue
          _ -> false  # Filter error, drop message
        end
    end
  end

  defp process_message_with_circuit_breaker(topic, message, state) do
    case state.circuit_breaker.state do
      :closed ->
        # Normal processing
        case process_message(topic, message, state.processing_mode) do
          :ok ->
            updated_cb = reset_circuit_breaker_failures(state.circuit_breaker)
            {:noreply, %{state | circuit_breaker: updated_cb}}

          {:error, reason} ->
            updated_cb = increment_circuit_breaker_failures(state.circuit_breaker)
            handle_processing_error(topic, message, reason, %{state | circuit_breaker: updated_cb})
        end

      :open ->
        # Circuit breaker open, drop message
        {:noreply, update_subscriber_metrics(state, :message_dropped_circuit_open)}

      :half_open ->
        # Test one message
        case process_message(topic, message, state.processing_mode) do
          :ok ->
            updated_cb = close_circuit_breaker(state.circuit_breaker)
            {:noreply, %{state | circuit_breaker: updated_cb}}

          {:error, _reason} ->
            updated_cb = open_circuit_breaker(state.circuit_breaker)
            {:noreply, %{state | circuit_breaker: updated_cb}}
        end
    end
  end
end

defmodule PrismaticPubSub.TopicManager do
  @moduledoc """
  Manages dynamic topic creation, lifecycle, and cleanup.
  """

  use GenServer

  defstruct [
    :topics,
    :topic_configs,
    :cleanup_timer,
    :metrics
  ]

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def create_dynamic_topic(name, config \\ %{}) do
    GenServer.call(__MODULE__, {:create_topic, name, config})
  end

  def get_topic_stats(topic) do
    GenServer.call(__MODULE__, {:get_stats, topic})
  end

  def cleanup_inactive_topics do
    GenServer.cast(__MODULE__, :cleanup_inactive)
  end

  @impl true
  def init(_opts) do
    state = %__MODULE__{
      topics: %{},
      topic_configs: %{},
      cleanup_timer: schedule_cleanup(),
      metrics: %{}
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:create_topic, name, config}, _from, state) do
    case Map.has_key?(state.topics, name) do
      true ->
        {:reply, {:error, :topic_exists}, state}

      false ->
        topic_info = %{
          name: name,
          created_at: System.system_time(:millisecond),
          subscriber_count: 0,
          message_count: 0,
          last_activity: System.system_time(:millisecond),
          config: config
        }

        updated_topics = Map.put(state.topics, name, topic_info)
        updated_configs = Map.put(state.topic_configs, name, config)

        new_state = %{state |
          topics: updated_topics,
          topic_configs: updated_configs
        }

        {:reply, {:ok, topic_info}, new_state}
    end
  end

  @impl true
  def handle_call({:get_stats, topic}, _from, state) do
    case Map.get(state.topics, topic) do
      nil ->
        {:reply, {:error, :topic_not_found}, state}

      topic_info ->
        # Enrich with real-time subscriber count
        current_subscribers = Phoenix.PubSub.subscribers(PrismaticPubSub, topic)

        enriched_stats = Map.merge(topic_info, %{
          current_subscribers: length(current_subscribers),
          uptime_seconds: (System.system_time(:millisecond) - topic_info.created_at) / 1000
        })

        {:reply, {:ok, enriched_stats}, state}
    end
  end

  @impl true
  def handle_cast(:cleanup_inactive, state) do
    cutoff_time = System.system_time(:millisecond) - (24 * 60 * 60 * 1000)  # 24 hours

    {active_topics, inactive_topics} = Enum.split_with(state.topics, fn {_name, info} ->
      info.last_activity > cutoff_time and
      Phoenix.PubSub.subscribers(PrismaticPubSub, info.name) |> length() > 0
    end)

    # Log cleanup information
    if length(inactive_topics) > 0 do
      Logger.info("Cleaning up #{length(inactive_topics)} inactive topics")

      Enum.each(inactive_topics, fn {name, _info} ->
        Logger.debug("Cleaned up inactive topic: #{name}")
      end)
    end

    updated_state = %{state |
      topics: Map.new(active_topics),
      topic_configs: Map.take(state.topic_configs, Enum.map(active_topics, &elem(&1, 0)))
    }

    {:noreply, updated_state}
  end

  @impl true
  def handle_info(:cleanup_timer, state) do
    cleanup_inactive_topics()
    new_timer = schedule_cleanup()
    {:noreply, %{state | cleanup_timer: new_timer}}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup_timer, 60 * 60 * 1000)  # 1 hour
  end
end

defmodule PrismaticPubSub.Telemetry do
  @moduledoc """
  Comprehensive telemetry and monitoring for PubSub operations.
  """

  def attach_pubsub_telemetry do
    events = [
      [:phoenix, :channel, :join, :start],
      [:phoenix, :channel, :join, :stop],
      [:phoenix, :channel, :leave, :stop],
      [:phoenix, :socket_connected],
      [:prismatic_pubsub, :message, :published],
      [:prismatic_pubsub, :message, :delivered],
      [:prismatic_pubsub, :subscriber, :added],
      [:prismatic_pubsub, :subscriber, :removed]
    ]

    :telemetry.attach_many(
      "prismatic-pubsub-telemetry",
      events,
      &handle_pubsub_event/4,
      %{}
    )
  end

  def handle_pubsub_event([:phoenix, :channel, :join, :stop], measurements, metadata, _config) do
    duration_ms = measurements.duration / 1_000_000

    :telemetry.execute(
      [:prismatic_pubsub, :channel, :join],
      %{duration: duration_ms},
      %{
        topic: metadata.params["topic"],
        result: if(metadata.result == :ok, do: :success, else: :error)
      }
    )

    # Update metrics
    PubSubMetrics.increment_counter(:channel_joins_total)
    PubSubMetrics.observe_histogram(:channel_join_duration_ms, duration_ms)
  end

  def handle_pubsub_event([:prismatic_pubsub, :message, :published], measurements, metadata, _config) do
    PubSubMetrics.increment_counter(:messages_published_total, %{topic: metadata.topic})
    PubSubMetrics.observe_histogram(:message_size_bytes, measurements.message_size)

    # Track per-topic metrics
    TopicMetrics.increment_message_count(metadata.topic)
  end

  def emit_message_published(topic, message_size, subscriber_count) do
    :telemetry.execute(
      [:prismatic_pubsub, :message, :published],
      %{message_size: message_size, subscriber_count: subscriber_count},
      %{topic: topic}
    )
  end

  def emit_subscriber_event(action, topic) when action in [:added, :removed] do
    :telemetry.execute(
      [:prismatic_pubsub, :subscriber, action],
      %{count: 1},
      %{topic: topic}
    )
  end
end
            |-- Redis: Redis Pub/Sub channels
            |-- Custom: Any adapter implementing the behaviour
```

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| **Registry** | Map topics to subscriber PIDs | ETS table (concurrent reads) |
| **Local Dispatch** | Deliver messages to local subscribers | Erlang `send/2` to each PID |
| **Adapter** | Propagate messages to other nodes | PG2 (Erlang) or Redis |
| **Supervisor** | Manage lifecycle and fault tolerance | OTP Supervisor tree |

```elixir
# PubSub configuration in config.exs
config :prismatic_web, PrismaticWeb.PubSub,
  name: PrismaticWeb.PubSub,
  adapter: Phoenix.PubSub.PG2,
  pool_size: System.schedulers_online()

# Starting PubSub in application supervision tree
children = [
  {Phoenix.PubSub, name: PrismaticWeb.PubSub}
]
```

## Topic Subscription Patterns

Topics are string-based identifiers that organize messages into logical streams. Phoenix.PubSub supports flexible topic naming conventions:

```elixir
# Subscribe to topics
Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:alerts")
Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "assets:discovery:example.com")
Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "quality:metrics")

# Publish to topics
Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, "security:alerts", %{
  event: "new_vulnerability",
  severity: :critical,
  asset: "example.com",
  timestamp: DateTime.utc_now()
})

# Receiving messages (in any Elixir process)
def handle_info(%{event: "new_vulnerability"} = alert, state) do
  Logger.warning("Critical vulnerability: #{alert.asset}")
  {:noreply, update_dashboard(state, alert)}
end
```

| Topic Convention | Example | Purpose |
|-----------------|---------|---------|
| `"domain:event"` | `"security:alerts"` | Domain-scoped event stream |
| `"domain:resource:id"` | `"assets:rating:abc123"` | Resource-specific events |
| `"domain:action:target"` | `"discovery:progress:example.com"` | Action tracking |
| `"system:category"` | `"system:health"` | Platform-level events |
| `"user:id:events"` | `"user:42:notifications"` | Per-user event streams |

## Broadcast vs Direct Send

Phoenix.PubSub provides two primary message delivery mechanisms:

```elixir
# Broadcast: delivers to ALL subscribers on the topic (fan-out)
Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, "security:alerts", payload)

# Broadcast from a specific node (excludes the broadcasting node)
Phoenix.PubSub.broadcast_from(PrismaticWeb.PubSub, self(), "security:alerts", payload)

# Direct send: delivers to a single process (point-to-point)
Phoenix.PubSub.direct_broadcast(PrismaticWeb.PubSub, node(), "user:42:inbox", payload)
```

| Function | Delivery | Scope | Use Case |
|----------|----------|-------|----------|
| `broadcast/3` | All subscribers | All nodes | Event notification, state sync |
| `broadcast!/3` | All subscribers (raises on error) | All nodes | Critical events |
| `broadcast_from/4` | All except sender | All nodes | Avoid echo in collaborative scenarios |
| `broadcast_from!/4` | All except sender (raises) | All nodes | Critical non-echo events |
| `direct_broadcast/4` | All subscribers on specific node | Single node | Node-targeted operations |

## Distributed PubSub Across Nodes

In a multi-node [cluster](/glossary/cluster/), Phoenix.PubSub automatically propagates messages to subscribers on all connected nodes. The distribution mechanism depends on the adapter:

```
Node A                    Node B                    Node C
+------------------+     +------------------+     +------------------+
| PubSub           |     | PubSub           |     | PubSub           |
|  "security:*"    |     |  "security:*"    |     |  "security:*"    |
|   -> pid_a1      |     |   -> pid_b1      |     |   -> pid_c1      |
|   -> pid_a2      |     |   -> pid_b2      |     |   -> pid_c2      |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------ PG2 / Redis Distribution -----------+
         |                        |                        |
    broadcast("security:alerts", payload)
         |                        |                        |
    pid_a1 receives          pid_b1 receives          pid_c1 receives
    pid_a2 receives          pid_b2 receives          pid_c2 receives
```

| Adapter | Distribution Mechanism | Pros | Cons |
|---------|----------------------|------|------|
| **PG2** (default) | Erlang process groups via EPMD | Zero dependencies, lowest latency | Requires Erlang clustering |
| **Redis** | Redis Pub/Sub channels | No Erlang clustering needed | Redis dependency, higher latency |
| **Custom** | Any implementation | Flexible (Kafka, NATS, etc.) | Development effort |

The PG2 adapter is preferred when Erlang nodes can form a cluster (connected via EPMD), as it provides the lowest latency and requires no external dependencies. The [Redis](/glossary/redis/) adapter is used in environments where Erlang clustering is not feasible (e.g., container orchestration without node discovery).

## Integration with Phoenix Channels

[Phoenix Channels](/glossary/channel/) are built directly on top of Phoenix.PubSub. When a Channel broadcasts a message, it publishes to a PubSub topic. When a client subscribes to a Channel, the Channel process subscribes to the corresponding PubSub topic:

```elixir
# Channel broadcast (internally uses PubSub)
broadcast(socket, "rating_updated", %{grade: "A", score: 850})
# Equivalent to:
# Phoenix.PubSub.broadcast(PubSub, "security:#{asset_id}", ...)

# LiveView subscription to PubSub topic
def mount(_params, _session, socket) do
  if connected?(socket) do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:alerts")
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "quality:metrics")
  end
  {:ok, socket}
end

def handle_info(%{event: "rating_updated"} = msg, socket) do
  {:noreply, assign(socket, :current_rating, msg.rating)}
end
```

This integration means that [LiveView](/glossary/liveview/) processes, [Channel](/glossary/channel/) processes, GenServers, and any other Elixir process can all participate in the same PubSub topic space, enabling seamless communication between different types of server-side components.

## Event-Driven Architecture Patterns

PubSub enables several event-driven architecture patterns within the platform:

**Event Notification**: Components publish events when state changes occur, and interested components react to those events independently:

```elixir
# Publisher: Asset scanner
def complete_scan(domain, results) do
  save_results(results)
  Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, "assets:scans", %{
    event: "scan_complete",
    domain: domain,
    asset_count: length(results.assets),
    timestamp: DateTime.utc_now()
  })
end

# Subscriber 1: Dashboard updates
def handle_info(%{event: "scan_complete"} = msg, socket) do
  {:noreply, update_asset_count(socket, msg)}
end

# Subscriber 2: Compliance recalculation
def handle_info(%{event: "scan_complete"} = msg, state) do
  trigger_compliance_check(msg.domain)
  {:noreply, state}
end

# Subscriber 3: Notification service
def handle_info(%{event: "scan_complete"} = msg, state) do
  notify_subscribers(msg.domain, msg.asset_count)
  {:noreply, state}
end
```

**State Synchronization**: Multiple components maintain consistent views of shared state through PubSub event propagation.

**CQRS Integration**: Command handlers publish domain events through PubSub, and query-side projections subscribe to build read-optimized views. This aligns with the platform's [event sourcing](/glossary/event-sourcing/) patterns.

## Performance Characteristics

| Metric | Local Delivery | Distributed (PG2) | Distributed (Redis) |
|--------|---------------|-------------------|---------------------|
| **Latency** | <0.1ms | 1-5ms | 5-15ms |
| **Throughput** | 1M+ msg/s | 100K+ msg/s | 50K+ msg/s |
| **Subscribers per topic** | 100,000+ | 100,000+ (per node) | 100,000+ (per node) |
| **Topics** | Unlimited | Unlimited | Limited by Redis memory |
| **Ordering** | FIFO per publisher | Best-effort | Best-effort |

Local delivery is nearly instantaneous because it uses Erlang's native `send/2` mechanism---a direct memory write to the subscriber process's mailbox with no serialization, no network hop, and no intermediate buffering. Distributed delivery adds network latency proportional to the cluster's network topology.

## Context in Prismatic

Phoenix.PubSub is the primary inter-component communication mechanism in the Prismatic Platform, serving as the nervous system that connects independent subsystems without direct coupling.

**LiveView Dashboard Updates**: All LiveView dashboards subscribe to PubSub topics for real-time updates. When a security rating changes in the Perimeter module, the change is published to a PubSub topic, and every connected dashboard displaying that rating receives the update and re-renders the affected component.

**Agent Coordination**: The 434 AIAD agents use PubSub for broadcasting state changes, coordination signals, and health status updates across the platform. Agent lifecycle events (start, stop, error, recovery) are published to agent-specific topics.

**Telemetry Event Distribution**: The platform's [observability](/glossary/observability/) system publishes telemetry events through PubSub, enabling monitoring components to subscribe to performance metrics, error rates, and health indicators without polling.

**Cross-Module Integration**: PubSub enables loose coupling between umbrella applications. The Perimeter module publishes asset discovery events, the Compliance module subscribes and triggers compliance assessments, and the Dashboard module subscribes and updates visualizations---none of these modules have direct dependencies on each other.

**Event Flow Architecture**:

```
Asset Scanner --> PubSub("assets:discovery") --> Dashboard LiveView
                                              --> Compliance Engine
                                              --> Notification Service
                                              --> Audit Logger

Rating Engine --> PubSub("security:ratings") --> Dashboard LiveView
                                              --> Alert Manager
                                              --> Historical Tracker

Agent System  --> PubSub("agents:lifecycle") --> Health Monitor
                                              --> Dashboard LiveView
                                              --> Evolution Engine
```

## Related Terms

- [Phoenix](/glossary/phoenix/) - Framework providing the PubSub implementation
- [Channel](/glossary/channel/) - Real-time communication layer built on top of PubSub
- [LiveView](/glossary/liveview/) - Server-rendered UI that subscribes to PubSub for real-time updates
- [Message Passing](/glossary/message-passing/) - Lower-level Erlang process communication that PubSub builds upon
- [Redis](/glossary/redis/) - Alternative PubSub distribution backend for non-clustered deployments
- [Cluster](/glossary/cluster/) - Multi-node deployment with automatic PubSub distribution
- [Distributed System](/glossary/distributed-system/) - Architecture pattern requiring decoupled inter-node communication
- [WebSocket](/glossary/websocket/) - Transport delivering PubSub messages to browser clients
- [Event Sourcing](/glossary/event-sourcing/) - Pattern using PubSub for domain event propagation
- [GraphQL](/glossary/graphql/) - API layer using PubSub for subscription delivery via Absinthe
- [Observability](/glossary/observability/) - Monitoring system consuming PubSub telemetry events
- [Stream Processing](/glossary/stream-processing/) - Data processing pipelines fed by PubSub events

## See Also

- [Architecture](/architecture/) - Platform event-driven architecture and messaging patterns
- [Technologies](/technologies/) - Communication technology stack
- [Apps](/apps/) - Applications using PubSub for inter-component communication

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)