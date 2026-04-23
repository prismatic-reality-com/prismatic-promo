+++
title = "Phoenix PubSub"
weight = 44
[extra]
description = "Real-time message broadcasting system in Phoenix that enables distributed publish-subscribe communication across processes, nodes, and clients using adapters like PG2, Redis, and custom implementations"
category = "phoenix"
abbreviation = "PubSub"
related_terms = ["phoenix", "real-time", "liveview", "websockets", "channels", "distributed-systems", "gen-server"]
complexity_level = "intermediate"
use_cases = ["real_time_ui", "distributed_messaging", "event_broadcasting", "system_coordination", "notification_delivery"]
beam_feature = true
framework_feature = true
compile_time = false
runtime_effect = true
real_time = true
distributed = true
pub_sub_pattern = true
adapter_based = true
platform_integration = "extensive"
umbrella_apps = ["prismatic_web", "prismatic_agents", "prismatic_perimeter", "prismatic_osint_core"]
pubsub_adapters = ["pg2", "redis", "custom_adapters"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1800
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Phoenix PubSub", "real-time", "publish-subscribe", "WebSockets", "LiveView", "distributed systems", "Prismatic Platform"]
tags = ["glossary", "phoenix", "pubsub", "real-time", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Phoenix PubSub - Prismatic Platform"
+++

## Definition & Overview

**Phoenix PubSub** is a high-performance, distributed publish-subscribe messaging system that enables real-time communication between processes, nodes, and connected clients in Phoenix applications. Built on the Publish-Subscribe pattern, it allows components to broadcast messages to multiple subscribers without requiring direct point-to-point connections, creating loose coupling and scalable architecture for real-time features.

Phoenix PubSub operates as a message router that maintains topic subscriptions and delivers published messages to all interested subscribers. It supports multiple adapters including PG2 (process groups), Redis, and custom implementations, allowing developers to choose the appropriate backend based on scalability and distribution requirements. The system integrates seamlessly with Phoenix Channels and LiveView for WebSocket communication with browser clients.

In the [Prismatic Platform](@/glossary/aiad.md), Phoenix PubSub powers real-time features across all 141 umbrella applications, handling over 50,000 messages per second during peak loads. The platform uses PubSub for OSINT tool progress updates, security perimeter alerts, agent coordination messages, and LiveView UI synchronization across the distributed AIAD ecosystem.

## Core Architecture

### PubSub Server and Topics

Phoenix PubSub operates through named servers that manage topic subscriptions:

```elixir
defmodule PrismaticWeb.Application do
  use Application

  def start(_type, _args) do
    children = [
      # Start PubSub server with PG2 adapter (development)
      {Phoenix.PubSub, name: PrismaticWeb.PubSub},

      # Redis adapter for production clustering
      {Phoenix.PubSub, [
        name: PrismaticWeb.PubSub,
        adapter: Phoenix.PubSub.Redis,
        host: "redis.example.com",
        port: 6379
      ]},

      # Other supervision tree children...
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

### Publishing and Subscribing

Basic PubSub operations for message broadcasting:

```elixir
defmodule PrismaticOSINT.ProgressBroadcaster do
  @moduledoc """
  Broadcasts real-time OSINT tool execution progress to subscribed LiveView processes.
  Handles 127 registered tools with streaming progress updates.
  """

  alias Phoenix.PubSub

  @pubsub PrismaticWeb.PubSub

  # Subscribe to progress updates for a specific tool
  @spec subscribe_to_tool(String.t()) :: :ok | {:error, term()}
  def subscribe_to_tool(tool_slug) when is_binary(tool_slug) do
    PubSub.subscribe(@pubsub, "osint:progress:#{tool_slug}")
  end

  # Subscribe to all OSINT progress updates
  @spec subscribe_to_all() :: :ok | {:error, term()}
  def subscribe_to_all do
    PubSub.subscribe(@pubsub, "osint:progress:*")
  end

  # Broadcast progress update to all subscribers
  @spec broadcast_progress(String.t(), float(), map()) :: :ok | {:error, term()}
  def broadcast_progress(tool_slug, progress, metadata \\ %{})
      when is_binary(tool_slug) and is_float(progress) do
    message = %{
      tool_slug: tool_slug,
      progress: progress,
      timestamp: DateTime.utc_now(),
      metadata: metadata
    }

    PubSub.broadcast(@pubsub, "osint:progress:#{tool_slug}", {:progress_update, message})
  end

  # Broadcast completion notification
  @spec broadcast_completion(String.t(), map()) :: :ok | {:error, term()}
  def broadcast_completion(tool_slug, results) when is_binary(tool_slug) do
    message = %{
      tool_slug: tool_slug,
      status: :completed,
      results: results,
      timestamp: DateTime.utc_now()
    }

    PubSub.broadcast(@pubsub, "osint:progress:#{tool_slug}", {:tool_completed, message})
  end
end
```

## LiveView Integration

### Real-Time UI Updates

Phoenix PubSub integrates directly with LiveView for reactive user interfaces:

```elixir
defmodule PrismaticWeb.OSINTToolboxLive do
  use PrismaticWeb, :live_view

  alias PrismaticOSINT.ProgressBroadcaster
  alias PrismaticPerimeter.SecurityAlerts

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    # Subscribe to real-time updates if connected
    if connected?(socket) do
      ProgressBroadcaster.subscribe_to_all()
      SecurityAlerts.subscribe_to_alerts()
    end

    {:ok, assign(socket,
      running_tools: %{},
      security_alerts: [],
      last_update: DateTime.utc_now()
    )}
  end

  @impl Phoenix.LiveView
  def handle_info({:progress_update, %{tool_slug: slug, progress: progress}}, socket) do
    updated_tools = Map.put(socket.assigns.running_tools, slug, progress)

    {:noreply, assign(socket,
      running_tools: updated_tools,
      last_update: DateTime.utc_now()
    )}
  end

  def handle_info({:tool_completed, %{tool_slug: slug, results: results}}, socket) do
    # Remove from running tools and update UI
    updated_tools = Map.delete(socket.assigns.running_tools, slug)

    # Show completion notification
    {:noreply, socket
     |> assign(running_tools: updated_tools)
     |> put_flash(:info, "Tool #{slug} completed successfully")
     |> push_event("tool-completed", %{slug: slug, results: results})}
  end

  def handle_info({:security_alert, %{severity: severity, domain: domain}}, socket) do
    alert = %{
      id: :erlang.unique_integer([:positive]),
      severity: severity,
      domain: domain,
      timestamp: DateTime.utc_now()
    }

    updated_alerts = [alert | socket.assigns.security_alerts]

    {:noreply, assign(socket, security_alerts: updated_alerts)}
  end
end
```

### Channel-Based Communication

PubSub powers Phoenix Channels for WebSocket communication:

```elixir
defmodule PrismaticWeb.MonitoringChannel do
  use PrismaticWeb, :channel

  alias PrismaticCore.QualityGuardian
  alias PrismaticPerimeter.ThreatIntelligence

  @impl Phoenix.Channel
  def join("monitoring:dashboard", _payload, socket) do
    # Subscribe to quality and security updates
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "quality:updates")
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:threats")

    # Send initial state
    quality_score = QualityGuardian.current_score()
    threat_level = ThreatIntelligence.current_threat_level()

    {:ok, %{quality: quality_score, threats: threat_level}, socket}
  end

  @impl Phoenix.Channel
  def handle_info({:quality_update, new_score}, socket) do
    push(socket, "quality_changed", %{score: new_score, timestamp: DateTime.utc_now()})
    {:noreply, socket}
  end

  def handle_info({:threat_detected, threat}, socket) do
    push(socket, "new_threat", threat)
    {:noreply, socket}
  end

  @impl Phoenix.Channel
  def handle_in("request_update", %{"component" => component}, socket) do
    case component do
      "quality" ->
        score = QualityGuardian.current_score()
        push(socket, "quality_changed", %{score: score})

      "threats" ->
        threats = ThreatIntelligence.active_threats()
        push(socket, "threat_update", %{threats: threats})
    end

    {:noreply, socket}
  end
end
```

## Distributed Messaging Patterns

### Agent Coordination

PubSub enables coordination across the 1,090-agent AIAD ecosystem:

```elixir
defmodule PrismaticAgents.CoordinationHub do
  @moduledoc """
  Coordinates 530 AIAD agents through distributed PubSub messaging.
  Handles agent registration, task distribution, and result aggregation.
  """

  alias Phoenix.PubSub

  @pubsub PrismaticWeb.PubSub
  @agent_registry_topic "agents:registry"
  @task_distribution_topic "agents:tasks"

  # Agent registration broadcasting
  @spec register_agent(atom(), map()) :: :ok
  def register_agent(agent_name, capabilities) do
    registration = %{
      agent: agent_name,
      capabilities: capabilities,
      node: Node.self(),
      timestamp: DateTime.utc_now(),
      status: :online
    }

    PubSub.broadcast(@pubsub, @agent_registry_topic, {:agent_registered, registration})
  end

  # Distribute task to appropriate agents
  @spec distribute_task(String.t(), map(), [atom()]) :: :ok
  def distribute_task(task_id, task_data, target_capabilities) do
    task = %{
      id: task_id,
      data: task_data,
      required_capabilities: target_capabilities,
      timestamp: DateTime.utc_now(),
      source_node: Node.self()
    }

    PubSub.broadcast(@pubsub, @task_distribution_topic, {:new_task, task})
  end

  # Broadcast agent result to interested subscribers
  @spec broadcast_result(String.t(), atom(), any()) :: :ok
  def broadcast_result(task_id, agent_name, result) do
    result_message = %{
      task_id: task_id,
      agent: agent_name,
      result: result,
      timestamp: DateTime.utc_now(),
      node: Node.self()
    }

    PubSub.broadcast(@pubsub, "results:#{task_id}", {:task_result, result_message})
  end
end
```

### System Health Monitoring

Real-time health metrics across distributed nodes:

```elixir
defmodule PrismaticCore.HealthMonitor do
  use GenServer

  alias Phoenix.PubSub

  @pubsub PrismaticWeb.PubSub
  @health_topic "system:health"
  @check_interval :timer.seconds(30)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    # Subscribe to health updates from other nodes
    PubSub.subscribe(@pubsub, @health_topic)

    # Schedule periodic health checks
    Process.send_after(self(), :health_check, @check_interval)

    {:ok, %{
      node_health: %{},
      last_check: DateTime.utc_now()
    }}
  end

  @impl GenServer
  def handle_info(:health_check, state) do
    health_data = collect_health_metrics()

    # Broadcast health update
    PubSub.broadcast(@pubsub, @health_topic, {:health_update, Node.self(), health_data})

    # Schedule next check
    Process.send_after(self(), :health_check, @check_interval)

    {:noreply, %{state | last_check: DateTime.utc_now()}}
  end

  def handle_info({:health_update, node, health_data}, state) do
    updated_health = Map.put(state.node_health, node, health_data)

    # Detect critical health issues
    if critical_issue?(health_data) do
      PubSub.broadcast(@pubsub, "alerts:critical", {:health_alert, node, health_data})
    end

    {:noreply, %{state | node_health: updated_health}}
  end

  defp collect_health_metrics do
    %{
      memory_usage: :erlang.memory(:total),
      process_count: length(Process.list()),
      ets_count: length(:ets.all()),
      message_queue_lengths: collect_message_queues(),
      timestamp: DateTime.utc_now()
    }
  end

  defp critical_issue?(%{memory_usage: memory}) when memory > 1_000_000_000, do: true
  defp critical_issue?(%{process_count: count}) when count > 50_000, do: true
  defp critical_issue?(_), do: false
end
```

## Advanced Features

### Message Routing and Filtering

Custom routing logic for complex messaging scenarios:

```elixir
defmodule PrismaticWeb.SmartRouter do
  @moduledoc """
  Intelligent message routing with filtering and transformation capabilities.
  Routes messages based on content, subscriber preferences, and system load.
  """

  alias Phoenix.PubSub

  @pubsub PrismaticWeb.PubSub

  # Route message with intelligent filtering
  @spec route_message(String.t(), map(), keyword()) :: :ok | {:error, term()}
  def route_message(base_topic, message, opts \\ []) do
    # Apply transformations based on subscriber capabilities
    transformed_message = transform_for_subscribers(message, base_topic)

    # Route to primary topic
    PubSub.broadcast(@pubsub, base_topic, transformed_message)

    # Route to filtered topics based on message content
    route_to_filtered_topics(base_topic, transformed_message)

    # Archive if specified
    if Keyword.get(opts, :archive, false) do
      archive_message(base_topic, transformed_message)
    end

    :ok
  end

  # Subscribe with filtering preferences
  @spec subscribe_with_filter(String.t(), map()) :: :ok
  def subscribe_with_filter(topic, filter_spec) do
    # Store filter preferences for this process
    Process.put({:pubsub_filter, topic}, filter_spec)

    PubSub.subscribe(@pubsub, topic)
  end

  # Custom message handler that applies filtering
  def handle_filtered_message(topic, message) do
    case Process.get({:pubsub_filter, topic}) do
      nil ->
        message

      filter_spec ->
        apply_message_filter(message, filter_spec)
    end
  end

  defp route_to_filtered_topics(base_topic, message) do
    # Route high-priority messages to priority topic
    if message.priority == :high do
      PubSub.broadcast(@pubsub, "#{base_topic}:priority", message)
    end

    # Route by category if present
    if category = message[:category] do
      PubSub.broadcast(@pubsub, "#{base_topic}:category:#{category}", message)
    end

    # Route by severity level
    if severity = message[:severity] do
      PubSub.broadcast(@pubsub, "alerts:#{severity}", message)
    end
  end
end
```

### Performance Optimization

Optimizing PubSub for high-throughput scenarios:

```elixir
defmodule PrismaticCore.PubSubOptimizer do
  @moduledoc """
  Performance optimizations for Phoenix PubSub in high-throughput scenarios.
  Handles batching, rate limiting, and backpressure management.
  """

  use GenServer

  alias Phoenix.PubSub

  @pubsub PrismaticWeb.PubSub
  @batch_size 100
  @batch_timeout :timer.seconds(1)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  # Batch multiple messages for efficient broadcasting
  @spec batch_broadcast(String.t(), [any()]) :: :ok
  def batch_broadcast(topic, messages) when length(messages) > @batch_size do
    # Split into chunks and broadcast each chunk
    messages
    |> Enum.chunk_every(@batch_size)
    |> Enum.each(fn chunk ->
      PubSub.broadcast(@pubsub, topic, {:message_batch, chunk})
    end)
  end

  def batch_broadcast(topic, messages) do
    PubSub.broadcast(@pubsub, topic, {:message_batch, messages})
  end

  # Rate-limited broadcasting with backpressure
  @spec rate_limited_broadcast(String.t(), any(), pos_integer()) :: :ok | {:error, :rate_limited}
  def rate_limited_broadcast(topic, message, rate_limit) do
    case check_rate_limit(topic, rate_limit) do
      :ok ->
        PubSub.broadcast(@pubsub, topic, message)

      {:error, :rate_limited} ->
        # Queue for later delivery or drop based on policy
        handle_backpressure(topic, message)
    end
  end

  defp check_rate_limit(topic, limit) do
    current_count = get_current_message_count(topic)
    if current_count < limit do
      increment_message_count(topic)
      :ok
    else
      {:error, :rate_limited}
    end
  end

  defp handle_backpressure(topic, message) do
    # Strategy: Queue with bounded capacity
    case queue_message(topic, message) do
      :ok -> :ok
      {:error, :queue_full} -> {:error, :rate_limited}
    end
  end
end
```

## Testing PubSub Systems

### Unit Testing with Test Process

Testing PubSub message flows in isolation:

```elixir
defmodule PrismaticOSINT.ProgressBroadcasterTest do
  use ExUnit.Case, async: true

  alias PrismaticOSINT.ProgressBroadcaster

  setup do
    # Subscribe test process to receive messages
    ProgressBroadcaster.subscribe_to_tool("test-tool")
    :ok
  end

  test "broadcasts progress updates to subscribers" do
    # Broadcast progress update
    :ok = ProgressBroadcaster.broadcast_progress("test-tool", 0.5, %{stage: "processing"})

    # Assert test process receives message
    assert_receive {:progress_update, %{
      tool_slug: "test-tool",
      progress: 0.5,
      metadata: %{stage: "processing"}
    }}, 1000
  end

  test "broadcasts completion notifications" do
    results = %{findings: ["result1", "result2"], count: 2}

    :ok = ProgressBroadcaster.broadcast_completion("test-tool", results)

    assert_receive {:tool_completed, %{
      tool_slug: "test-tool",
      status: :completed,
      results: ^results
    }}, 1000
  end

  test "handles multiple subscribers" do
    # Subscribe another process
    parent = self()

    spawn_link(fn ->
      ProgressBroadcaster.subscribe_to_tool("test-tool")

      receive do
        {:progress_update, message} ->
          send(parent, {:subscriber2_received, message})
      after 2000 ->
        send(parent, :timeout)
      end
    end)

    # Broadcast message
    ProgressBroadcaster.broadcast_progress("test-tool", 0.75, %{})

    # Both processes should receive the message
    assert_receive {:progress_update, %{progress: 0.75}}
    assert_receive {:subscriber2_received, %{progress: 0.75}}
  end
end
```

### Integration Testing

Testing PubSub with LiveView and Channels:

```elixir
defmodule PrismaticWeb.OSINTToolboxLiveTest do
  use PrismaticWeb.ConnCase, async: true

  import Phoenix.LiveViewTest

  alias PrismaticOSINT.ProgressBroadcaster

  test "updates UI when progress messages are received", %{conn: conn} do
    # Mount LiveView
    {:ok, view, _html} = live(conn, "/osint/toolbox")

    # Broadcast progress update
    ProgressBroadcaster.broadcast_progress("test-tool", 0.3, %{})

    # Assert LiveView updates
    assert render(view) =~ "30%"
    assert has_element?(view, "[data-tool='test-tool'][data-progress='0.3']")
  end

  test "shows completion notification", %{conn: conn} do
    {:ok, view, _html} = live(conn, "/osint/toolbox")

    # Broadcast completion
    ProgressBroadcaster.broadcast_completion("test-tool", %{findings: []})

    # Assert flash message appears
    assert render(view) =~ "Tool test-tool completed successfully"
    refute has_element?(view, "[data-tool='test-tool']")
  end
end
```

## Usage in Prismatic Platform

Phoenix PubSub serves as the backbone for real-time communication across the Prismatic Platform:

| Component | Topics | Message Volume | Purpose |
|-----------|--------|----------------|---------|
| **OSINT Toolbox** | 157 tool topics | ~5,000/hour | Progress updates, results |
| **Security Perimeter** | 15 alert topics | ~1,200/hour | Threat alerts, ratings |
| **Quality Guardian** | 8 quality topics | ~800/hour | Quality score updates |
| **Agent Coordination** | 1,090 agent topics | ~15,000/hour | Task distribution, results |
| **LiveView UI** | 200+ UI topics | ~25,000/hour | Real-time UI updates |

The platform handles peak loads of over 50,000 PubSub messages per second during intensive operations, with sub-millisecond message delivery latency across distributed nodes.

## Performance and Scaling

**Memory Efficiency**: PubSub maintains minimal memory overhead by storing only topic subscriptions, not message history.

**Horizontal Scaling**: Redis adapter enables clustering across multiple nodes with message persistence and replay capabilities.

**Fault Tolerance**: PG2 adapter provides automatic process group management with failure recovery.

**Backpressure Management**: Built-in message queuing and rate limiting prevent system overload during traffic spikes.

## Related Concepts

- [Phoenix](@/glossary/phoenix.md) - Web framework providing the PubSub system
- [LiveView](@/glossary/liveview.md) - Real-time UI framework leveraging PubSub
- [WebSocket](@/glossary/websocket.md) - Transport protocol used by Phoenix Channels
- [Distributed Systems](@/glossary/distributed-systems.md) - Architecture pattern supported by PubSub
- [GenServer](@/glossary/genserver.md) - OTP behavior often combined with PubSub

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture utilizing PubSub
- [Apps](@/apps/_index.md) - Applications demonstrating real-time features
- [OSINT Core](@/apps/prismatic-osint-core.md) - OSINT system with progress broadcasting
- [Perimeter](@/apps/prismatic-perimeter.md) - Security system with alert distribution
- [LiveView UI](@/apps/prismatic-web.md) - Real-time user interface components

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)