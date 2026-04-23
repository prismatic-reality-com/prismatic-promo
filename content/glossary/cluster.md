+++
title = "Cluster"
weight = 12
[extra]
category = "infrastructure"
description = "Distributed Erlang cluster enabling transparent process communication and fault tolerance across multiple nodes."
related_terms = ["beam", "distributed-system", "fly-io", "process-isolation", "consensus-algorithm", "pubsub", "cluster"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1650
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Cluster", "Distributed", "Erlang", "glossary", "infrastructure", "Prismatic Platform", "Horde", "BEAM", "Node"]
tags = ["glossary", "infrastructure", "cluster", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Cluster - Prismatic Platform"
+++

## Definition

A cluster in the Erlang/Elixir context is a group of connected [BEAM](/glossary/beam/) virtual machine nodes that can transparently communicate via [message passing](/glossary/message-passing/). Distributed Erlang provides location-transparent process communication -- a process on Node A can send messages to a process on Node B using exactly the same syntax as local messaging (`send(pid, message)`). The receiving process cannot distinguish whether the message came from a local or remote process. This transparency enables horizontal scaling, fault tolerance through geographic distribution, and shared state via distributed ETS, CRDTs, or libraries like Horde.

Unlike microservice architectures where services communicate through HTTP, gRPC, or message queues, Erlang clusters communicate through the native Erlang distribution protocol -- a persistent TCP connection between nodes that carries Erlang terms directly. This eliminates serialization overhead for inter-node communication and allows the full spectrum of OTP patterns (GenServer calls, supervisor trees, monitors, links) to work transparently across node boundaries. A [supervisor](/glossary/supervisor/) on one node can monitor a process on another node; a GenServer call from Node A to a process on Node B looks identical to a local call.

Node discovery can be manual (configuring node names directly), DNS-based (resolving a DNS record to a list of node addresses), or use libraries like `libcluster` for automatic topology management. In cloud environments, `libcluster` provides strategies for Kubernetes, Fly.io, EC2, and other platforms that automatically discover peer nodes and form clusters without manual configuration.

## Cluster Architecture

```
+------------------+     Erlang Distribution     +------------------+
|   Node A         |  <----------------------->  |   Node B         |
|   (fly-a.internal)                             |   (fly-b.internal)
|                  |                              |                  |
|  [Agent 1]       |     transparent             |  [Agent 3]       |
|  [Agent 2]       |     message passing         |  [Agent 4]       |
|  [LiveView 1]    |                              |  [LiveView 2]    |
|  [Storage ETS]   |                              |  [Storage ETS]   |
|                  |                              |                  |
|  Phoenix.PubSub -+--- broadcast across cluster -+- Phoenix.PubSub |
+------------------+                              +------------------+
         |                                                 |
         v                                                 v
+------------------+                              +------------------+
|   PostgreSQL     |  <--- shared database --->   |   PostgreSQL     |
|   (primary)      |                              |   (replica)      |
+------------------+                              +------------------+
```

## Erlang Distribution Protocol

The Erlang distribution protocol is the backbone of all inter-node communication. Understanding its mechanics is essential for building reliable clustered systems.

When two BEAM nodes connect, they perform a handshake that includes cookie verification (a shared secret ensuring only authorized nodes can join the cluster), capability negotiation, and node name exchange. Once connected, a persistent TCP connection is maintained between the nodes for the lifetime of the cluster membership. This connection carries all messages, monitor signals, and link notifications between the two nodes.

The protocol encodes Erlang terms in the External Term Format (ETF), a binary serialization format native to the BEAM. Because both the sender and receiver run the same virtual machine, no schema negotiation or format conversion is needed -- terms are serialized on one side and deserialized on the other with perfect fidelity. This includes complex data structures like maps, tuples, binaries, and even references to processes and ports.

```elixir
# Connecting nodes programmatically
Node.connect(:"prismatic@fly-b.internal")

# Verifying cluster membership
Node.list()
# => [:"prismatic@fly-b.internal", :"prismatic@fly-c.internal"]

# Spawning a process on a remote node
Node.spawn(:"prismatic@fly-b.internal", fn ->
  IO.puts("Running on #{Node.self()}")
end)

# Making a GenServer call to a process on a remote node
GenServer.call({AgentWorker, :"prismatic@fly-b.internal"}, :status)
```

| Protocol Feature | Description | Performance Impact |
|-----------------|-------------|-------------------|
| **Persistent TCP** | Single long-lived connection per node pair | Zero connection overhead per message |
| **ETF Encoding** | Native binary term serialization | Microsecond serialization, no schema overhead |
| **Cookie Auth** | Shared secret for cluster membership | One-time handshake cost |
| **Net Ticktime** | Periodic heartbeat to detect node failure | Configurable detection latency (default 60s) |
| **Large Message Fragmentation** | Automatic splitting of large terms | Prevents head-of-line blocking |

## Node Discovery with libcluster

`libcluster` provides automatic node discovery and cluster formation:

```elixir
# config/runtime.exs
config :libcluster,
  topologies: [
    fly_io: [
      strategy: Cluster.Strategy.DNSPoll,
      config: [
        polling_interval: 5_000,
        query: "prismatic.internal",
        node_basename: "prismatic"
      ]
    ]
  ]

# For development (local nodes)
config :libcluster,
  topologies: [
    local: [
      strategy: Cluster.Strategy.Epmd,
      config: [
        hosts: [:"prismatic@localhost"]
      ]
    ]
  ]
```

| Strategy | Environment | Discovery Method |
|----------|-------------|-----------------|
| **DNSPoll** | Fly.io, Kubernetes | Poll DNS record for node addresses |
| **Kubernetes** | Kubernetes | Query K8s API for pod endpoints |
| **Epmd** | Development | Connect to known node names |
| **Gossip** | LAN | UDP multicast for peer discovery |
| **EC2** | AWS | Query EC2 API for tagged instances |

## Distributed Process Patterns

### Distributed PubSub

[Phoenix.PubSub](/glossary/pubsub/) automatically propagates messages across cluster nodes:

```elixir
# Broadcasting on Node A -- all subscribers on ALL nodes receive the message
Phoenix.PubSub.broadcast(Prismatic.PubSub, "security:alerts", {:new_alert, alert})

# Subscribing on Node B -- receives broadcasts from any node
Phoenix.PubSub.subscribe(Prismatic.PubSub, "security:alerts")

# In a LiveView on Node B
def handle_info({:new_alert, alert}, socket) do
  {:noreply, assign(socket, alerts: [alert | socket.assigns.alerts])}
end
```

### Distributed Process Registry (Horde)

Horde provides a distributed process registry and DynamicSupervisor:

```elixir
defmodule DistributedAgentRegistry do
  use Horde.Registry

  def start_link(opts) do
    Horde.Registry.start_link(__MODULE__, [keys: :unique, members: :auto], opts)
  end

  def init(opts) do
    Horde.Registry.init(opts)
  end

  # Register an agent process -- visible across all cluster nodes
  def register_agent(agent_id, pid) do
    Horde.Registry.register(__MODULE__, agent_id, pid)
  end

  # Lookup an agent -- finds it regardless of which node it runs on
  def find_agent(agent_id) do
    case Horde.Registry.lookup(__MODULE__, agent_id) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, :not_found}
    end
  end
end
```

### Global Process Registration

For singleton processes that must exist exactly once across the entire cluster, Erlang's `:global` module provides cluster-wide registration:

```elixir
defmodule ClusterCoordinator do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: {:global, __MODULE__})
  end

  def get_coordinator do
    case :global.whereis_name(__MODULE__) do
      :undefined -> {:error, :not_running}
      pid -> {:ok, pid}
    end
  end
end
```

## Network Partition Handling

Network partitions (split-brain scenarios) are the primary challenge in distributed systems. The cluster must handle the case where nodes cannot communicate:

| Strategy | Behavior | Trade-off |
|----------|----------|-----------|
| **Majority wins** | Partition with majority of nodes continues; minority shuts down | Data safety, but minority nodes unavailable |
| **Accept all writes** | Both partitions continue independently; reconcile on heal | Availability, but potential data conflicts |
| **Read-only minority** | Minority partition serves reads but rejects writes | Partial availability with data safety |
| **Manual intervention** | Alert operators; require human decision | Maximum safety, minimum automation |

```elixir
# Monitoring node connections for partition detection
Node.monitor(:node_b@hostname, true)

# Handle node disconnect
def handle_info({:nodedown, node}, state) do
  Logger.warning("Node disconnected", node: node)
  {:noreply, handle_partition(node, state)}
end

# Handle node reconnect
def handle_info({:nodeup, node}, state) do
  Logger.info("Node reconnected", node: node)
  {:noreply, handle_heal(node, state)}
end
```

### Partition Detection and Recovery

Robust partition handling requires multiple layers of detection. The BEAM's net ticktime mechanism provides basic node-down detection, but application-level health checks add finer-grained awareness:

```elixir
defmodule ClusterHealthMonitor do
  use GenServer

  @check_interval :timer.seconds(10)

  def init(_opts) do
    :net_kernel.monitor_nodes(true, node_type: :visible)
    schedule_health_check()
    {:ok, %{nodes: MapSet.new(), partitioned: MapSet.new()}}
  end

  def handle_info({:nodeup, node, _info}, state) do
    Logger.info("Node joined cluster", node: node)
    new_state = %{state | nodes: MapSet.put(state.nodes, node)}
    {:noreply, reconcile_after_heal(node, new_state)}
  end

  def handle_info({:nodedown, node, _info}, state) do
    Logger.warning("Node left cluster", node: node)
    new_state = %{state |
      nodes: MapSet.delete(state.nodes, node),
      partitioned: MapSet.put(state.partitioned, node)
    }
    {:noreply, new_state}
  end

  defp reconcile_after_heal(node, state) do
    if MapSet.member?(state.partitioned, node) do
      Logger.info("Reconciling state after partition heal", node: node)
      %{state | partitioned: MapSet.delete(state.partitioned, node)}
    else
      state
    end
  end

  defp schedule_health_check do
    Process.send_after(self(), :health_check, @check_interval)
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform is designed for clustered deployment on [Fly.io](/glossary/fly-io/), with the following distributed capabilities:

- **Automatic Node Discovery**: `libcluster` with Fly.io DNS strategy discovers peer nodes automatically. New instances join the cluster within seconds of starting.
- **Distributed PubSub**: [Phoenix.PubSub](/glossary/pubsub/) messages propagate across all cluster nodes automatically. Security alerts, quality events, and agent status updates are visible platform-wide.
- **[LiveView](/glossary/liveview/) Session Recovery**: LiveView connections can survive node restarts through session recovery mechanisms. Users experience brief reconnections rather than lost state.
- **Agent Workload Distribution**: [Agent](/glossary/agent/) processes can be distributed across cluster members using Horde, enabling horizontal scaling of agent execution capacity.
- **PrismaticSupervisor**: The `prismatic_supervisor` app provides pluggable backends -- ETS for single-node development and Horde for multi-node production clusters.
- **Distributed ETS**: Certain read-heavy data (agent specifications, quality rules) can be replicated across nodes using distributed ETS for local-speed access.
- **[Consensus](/glossary/consensus-algorithm/) for Coordination**: Cluster-wide operations (quality gate enforcement, agent scheduling) use consensus mechanisms to ensure consistent decision-making across nodes.

## Cluster Sizing Considerations

Determining optimal cluster size requires balancing performance, fault tolerance, and operational complexity. The sweet spot for most applications is 3-7 nodes, providing good fault tolerance without excessive coordination overhead.

| Factor | Consideration | Recommendation |
|--------|--------------|----------------|
| **Node count** | More nodes increase fault tolerance but add coordination overhead | 3-5 nodes for production, odd numbers for consensus |
| **Message volume** | High PubSub broadcast rates multiply across nodes (N² growth) | Monitor broadcast frequency; consider topic sharding |
| **State distribution** | Horde processes need time to redistribute after node changes | Plan for 30-60 second redistribution windows |
| **Network latency** | Inter-node latency affects GenServer call performance | Keep nodes within 50ms RTT; prefer regional clusters |
| **Memory per node** | Each node holds its own process heaps; total memory = nodes * per-node | Size individual nodes 4-8GB; monitor heap growth |
| **Split-brain risk** | More nodes increase probability of partial partition | Use consensus algorithms; require majority for decisions |
| **Database connections** | Each node needs its own connection pool to PostgreSQL | Size connection pools as total_connections / node_count |
| **Session affinity** | LiveView sessions may prefer sticky routing | Use load balancer session affinity or design for failover |

**Performance Scaling Patterns**:

```elixir
# Measure cluster message overhead
defmodule ClusterMetrics do
  def benchmark_broadcast(topic, message, iterations \\ 1000) do
    node_count = length(Node.list()) + 1

    {time_microseconds, _} = :timer.tc(fn ->
      for _ <- 1..iterations do
        Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, message)
      end
    end)

    messages_per_second = iterations * 1_000_000 / time_microseconds
    total_messages = iterations * node_count

    %{
      messages_per_second: messages_per_second,
      total_network_messages: total_messages,
      overhead_factor: node_count
    }
  end
end

# Expected results:
# 2 nodes: 1x overhead (messages duplicated)
# 3 nodes: 2x overhead (each message to 2 other nodes)
# 5 nodes: 4x overhead (each message to 4 other nodes)
```

## Cluster vs. Microservices

| Aspect | Erlang Cluster | Microservices |
|--------|---------------|---------------|
| **Communication** | Native Erlang distribution (TCP) | HTTP/gRPC/message queues |
| **Serialization** | None (native terms) | JSON/protobuf/msgpack |
| **Process Model** | Shared (transparent across nodes) | Isolated (separate deployments) |
| **Deployment** | Single codebase, multiple instances | Separate codebases per service |
| **Latency** | Sub-millisecond inter-node | Milliseconds to seconds |
| **Complexity** | OTP handles distribution | Service mesh, API gateway, load balancer |
| **Consistency** | Strong (distributed monitors/links) | Eventual (distributed transactions hard) |

## Best Practices

**Use libcluster for Discovery**: Never hardcode node names. Use `libcluster` with environment-appropriate strategies (DNSPoll for Fly.io, Kubernetes API for K8s, Epmd for development) to handle node discovery automatically. Hardcoded node lists become unmaintainable as clusters scale and cloud instances change IP addresses.

**Monitor Node Connections**: Subscribe to `:nodeup` and `:nodedown` events to detect partition scenarios early. Implement health checks that verify cluster membership state. Consider using telemetry events to track node join/leave patterns and alert on unusual activity:

```elixir
# Advanced node monitoring with telemetry
defmodule ClusterTelemetry do
  def attach do
    :telemetry.attach_many(
      "cluster-monitoring",
      [
        [:cluster, :node, :join],
        [:cluster, :node, :leave],
        [:cluster, :partition, :detected]
      ],
      &handle_cluster_event/4,
      nil
    )
  end

  defp handle_cluster_event([:cluster, :node, :join], %{latency: ms}, metadata, _config) do
    if ms > 5_000 do
      Logger.warning("Slow node join", node: metadata.node, latency_ms: ms)
    end
  end

  defp handle_cluster_event([:cluster, :partition, :detected], _, metadata, _config) do
    Logger.error("Network partition detected",
      nodes_lost: metadata.nodes_lost,
      cluster_majority: metadata.has_majority
    )
  end
end
```

**Design for Partition**: Assume network partitions will happen and design state management accordingly. Use CRDTs (Horde) for data that must be available during partitions, and PostgreSQL for data requiring strong consistency. Document which components require majority consensus vs. those that can operate independently.

**Minimize Cross-Node State**: Prefer stateless nodes with shared database backends over heavy cross-node state synchronization. PubSub broadcasts are cheap; distributed state coordination is expensive. Design APIs to be idempotent so retries during partition recovery don't cause issues.

**Tune Net Ticktime**: The default net ticktime of 60 seconds may be too slow for detecting node failures in latency-sensitive environments. Reduce it for faster detection, but ensure the value is high enough to tolerate temporary network jitter without false positives:

```elixir
# In vm.args or runtime configuration
# Faster failure detection (15 second intervals)
-kernel net_ticktime 15

# For very stable networks, even faster
-kernel net_ticktime 5

# Monitor false partition events in logs
Logger.info("Net tick configuration", net_ticktime: :net_kernel.get_net_ticktime())
```

**Use Fly.io Private Networking**: On Fly.io, use the `.internal` DNS addresses and IPv6 private networking for inter-node communication. This avoids exposing Erlang distribution ports to the public internet and reduces latency compared to public IP routing. Configure the BEAM for IPv6-first resolution to take advantage of Fly.io's native IPv6 network.

**Implement Graceful Shutdown**: When nodes leave the cluster (planned maintenance, scaling down), implement graceful shutdown procedures that drain work, transfer state, and notify cluster members. This prevents message loss and reduces recovery time:

```elixir
defmodule GracefulShutdown do
  def prepare_for_shutdown do
    # 1. Stop accepting new work
    stop_work_acceptance()

    # 2. Drain existing work (with timeout)
    drain_work_queues(timeout: :timer.seconds(30))

    # 3. Transfer critical state to other nodes
    transfer_critical_state()

    # 4. Notify cluster members of departure
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "cluster:events", {:node_leaving, Node.self()})

    # 5. Allow time for message propagation
    Process.sleep(1_000)
  end
end
```

**Version Compatibility**: Plan for rolling deployments where different code versions run simultaneously during updates. Use protocol versioning for critical inter-node communication and ensure backward compatibility during deployment windows.

## Advanced Clustering Techniques

### Multi-Region Cluster Deployment

For global applications, clusters can span multiple geographic regions to provide low-latency access to users worldwide:

```elixir
# Region-aware node naming
defmodule RegionalCluster do
  def start_node do
    region = System.get_env("FLY_REGION", "unknown")
    hostname = System.get_env("HOSTNAME", "localhost")

    node_name = :"prismatic-#{region}@#{hostname}"

    case Node.start(node_name) do
      {:ok, _} ->
        connect_to_regional_peers(region)
        {:ok, node_name}
      error ->
        {:error, error}
    end
  end

  defp connect_to_regional_peers(region) do
    # Connect primarily to nodes in the same region
    regional_peers = discover_regional_nodes(region)
    cross_region_peers = discover_cross_region_nodes(region, limit: 2)

    all_peers = regional_peers ++ cross_region_peers

    for peer <- all_peers do
      Node.connect(peer)
    end
  end
end
```

### Cluster Health and Monitoring

Comprehensive cluster health monitoring requires tracking multiple dimensions:

```elixir
defmodule ClusterHealthDashboard do
  use GenServer

  @metrics [
    :node_count,
    :inter_node_latency,
    :message_throughput,
    :partition_events,
    :process_count_per_node,
    :memory_usage_per_node
  ]

  def init(_opts) do
    :timer.send_interval(30_000, self(), :collect_metrics)
    {:ok, %{metrics: %{}, history: []}}
  end

  def handle_info(:collect_metrics, state) do
    current_metrics = %{
      timestamp: DateTime.utc_now(),
      nodes: collect_node_metrics(),
      cluster_health: assess_cluster_health(),
      warnings: detect_health_warnings()
    }

    new_history = [current_metrics | state.history]
                  |> Enum.take(100)  # Keep last 100 measurements

    {:noreply, %{state | metrics: current_metrics, history: new_history}}
  end

  defp collect_node_metrics do
    for node <- [Node.self() | Node.list()] do
      {node, %{
        memory_mb: :erlang.memory(:total) |> div(1_024_000),
        process_count: :erlang.system_info(:process_count),
        load_average: :cpu_sup.avg1() / 256,
        uptime_seconds: :erlang.statistics(:wall_clock) |> elem(0) |> div(1000)
      }}
    end
    |> Enum.into(%{})
  end

  defp assess_cluster_health do
    node_count = length(Node.list()) + 1
    expected_nodes = Application.get_env(:cluster, :expected_node_count, 3)

    cond do
      node_count < expected_nodes * 0.5 -> :critical
      node_count < expected_nodes * 0.8 -> :degraded
      node_count >= expected_nodes -> :healthy
      true -> :unknown
    end
  end
end
```

### Load Balancing Strategies

Different workloads require different load balancing approaches across cluster nodes:

```elixir
defmodule ClusterLoadBalancer do
  @moduledoc """
  Implements various load balancing strategies for distributing work
  across cluster nodes.
  """

  # Round-robin distribution
  def round_robin_node(exclude_local \\ false) do
    nodes = if exclude_local do
      Node.list()
    else
      [Node.self() | Node.list()]
    end

    case nodes do
      [] -> Node.self()
      nodes ->
        index = :rand.uniform(length(nodes))
        Enum.at(nodes, index - 1)
    end
  end

  # Load-based distribution (route to least busy node)
  def least_loaded_node do
    node_loads = for node <- [Node.self() | Node.list()] do
      load = :rpc.call(node, :erlang, :system_info, [:process_count])
      {node, load}
    end

    {best_node, _load} = Enum.min_by(node_loads, fn {_node, load} -> load end)
    best_node
  end

  # Consistent hashing (same input always routes to same node)
  def consistent_hash_node(key) when is_binary(key) do
    hash = :erlang.phash2(key)
    nodes = [Node.self() | Node.list()] |> Enum.sort()

    case nodes do
      [] -> Node.self()
      nodes ->
        index = rem(hash, length(nodes))
        Enum.at(nodes, index)
    end
  end

  # Locality-aware routing (prefer same-region nodes)
  def region_aware_node(prefer_region \\ nil) do
    current_region = prefer_region || get_current_region()

    # Get all nodes with their regions
    node_regions = for node <- [Node.self() | Node.list()] do
      region = get_node_region(node)
      {node, region}
    end

    # Prefer nodes in the same region
    regional_nodes = Enum.filter(node_regions, fn {_node, region} ->
      region == current_region
    end)

    candidates = if Enum.empty?(regional_nodes) do
      node_regions  # Fallback to any node
    else
      regional_nodes
    end

    {node, _region} = Enum.random(candidates)
    node
  end

  defp get_current_region do
    System.get_env("FLY_REGION", "unknown")
  end

  defp get_node_region(node) do
    # Extract region from node name or query remotely
    case Atom.to_string(node) do
      "prismatic-" <> region_hostname ->
        region_hostname |> String.split("@") |> List.first()
      _ ->
        "unknown"
    end
  end
end
```

## Performance Optimization

### Message Batching for High-Throughput Systems

When dealing with high message volumes, batching can significantly improve cluster performance:

```elixir
defmodule BatchedBroadcaster do
  use GenServer

  @default_batch_size 100
  @default_flush_interval 50  # milliseconds

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def broadcast(topic, message) do
    GenServer.cast(__MODULE__, {:queue_broadcast, topic, message})
  end

  def init(opts) do
    batch_size = Keyword.get(opts, :batch_size, @default_batch_size)
    flush_interval = Keyword.get(opts, :flush_interval, @default_flush_interval)

    schedule_flush(flush_interval)

    {:ok, %{
      queue: [],
      batch_size: batch_size,
      flush_interval: flush_interval
    }}
  end

  def handle_cast({:queue_broadcast, topic, message}, state) do
    new_queue = [{topic, message} | state.queue]

    if length(new_queue) >= state.batch_size do
      flush_queue(new_queue)
      {:noreply, %{state | queue: []}}
    else
      {:noreply, %{state | queue: new_queue}}
    end
  end

  def handle_info(:flush, state) do
    if not Enum.empty?(state.queue) do
      flush_queue(state.queue)
    end

    schedule_flush(state.flush_interval)
    {:noreply, %{state | queue: []}}
  end

  defp flush_queue(messages) when is_list(messages) do
    # Group messages by topic for efficient broadcasting
    grouped = Enum.group_by(messages, fn {topic, _message} -> topic end)

    for {topic, topic_messages} <- grouped do
      message_list = Enum.map(topic_messages, fn {_topic, message} -> message end)
      Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, {:batch, message_list})
    end
  end

  defp schedule_flush(interval) do
    Process.send_after(self(), :flush, interval)
  end
end
```

### Memory-Efficient Cluster State

For large clusters handling significant state, memory optimization becomes crucial:

```elixir
defmodule EfficientClusterState do
  @moduledoc """
  Memory-efficient cluster state management using ETS and selective replication.
  """

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    # Create ETS tables for different data types
    :ets.new(:cluster_metadata, [:named_table, :public, read_concurrency: true])
    :ets.new(:hot_data, [:named_table, :public, read_concurrency: true])
    :ets.new(:cold_data, [:named_table, :public])

    # Subscribe to cluster events
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "cluster:state")

    {:ok, %{}}
  end

  # Replicate hot data to all nodes (frequent access)
  def set_hot(key, value) do
    :ets.insert(:hot_data, {key, value, Node.self(), :os.timestamp()})
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "cluster:state",
      {:replicate_hot, key, value, Node.self()})
  end

  # Store cold data locally only (infrequent access)
  def set_cold(key, value) do
    :ets.insert(:cold_data, {key, value, :os.timestamp()})
  end

  # Smart lookup: check local first, then remote nodes
  def get(key) do
    case :ets.lookup(:hot_data, key) do
      [{^key, value, _node, _timestamp}] ->
        {:ok, value}
      [] ->
        get_from_cluster(key)
    end
  end

  defp get_from_cluster(key) do
    # Try cold data locally first
    case :ets.lookup(:cold_data, key) do
      [{^key, value, _timestamp}] ->
        {:ok, value}
      [] ->
        # Ask other nodes
        query_remote_nodes(key)
    end
  end

  defp query_remote_nodes(key) do
    responses = for node <- Node.list() do
      Task.async(fn ->
        GenServer.call({__MODULE__, node}, {:remote_get, key}, 1000)
      end)
    end

    case Task.yield_many(responses, 1000) do
      results when length(results) > 0 ->
        find_first_result(results)
      [] ->
        {:error, :not_found}
    end
  end

  defp find_first_result(results) do
    Enum.find_value(results, {:error, :not_found}, fn
      {_task, {:ok, {:ok, value}}} -> {:ok, value}
      _ -> nil
    end)
  end
end
```

## Use Cases

- **High Availability**: Running multiple BEAM nodes behind a load balancer so that individual node failures do not cause service outages
- **Horizontal Scaling**: Adding nodes to handle increased agent execution workload or LiveView connection volume
- **Geographic Distribution**: Deploying nodes in multiple regions for lower latency to geographically distributed users
- **Rolling Deployments**: Deploying new releases to nodes one at a time while maintaining service availability through the remaining nodes
- **Load Isolation**: Separating CPU-intensive agent processing from user-facing web requests by dedicating different node types
- **Data Locality**: Placing compute nodes close to regional data sources for improved performance
- **Disaster Recovery**: Cross-region clustering ensures service continuity even during complete regional outages

## Related Concepts

- [BEAM](/glossary/beam/) - Virtual machine enabling distributed clustering
- [Distributed System](/glossary/distributed-system/) - General distributed systems theory and challenges
- [Fly.io](/glossary/fly-io/) - Deployment platform hosting the production cluster
- [Process Isolation](/glossary/process-isolation/) - Per-process fault boundaries extend across cluster
- [PubSub](/glossary/pubsub/) - Messaging system that spans cluster nodes automatically
- [Consensus Algorithm](/glossary/consensus-algorithm/) - Agreement protocols for cluster-wide decisions
- [CAP Theorem](/glossary/cap-theorem/) - Fundamental constraint on distributed system properties
- [Eventual Consistency](/glossary/eventual-consistency/) - Consistency model for distributed data
- [Load Balancing](/glossary/load-balancing/) - Distributing requests across cluster nodes
- [Docker](/glossary/docker/) - Container platform for consistent node deployment

## See Also

- [Architecture](/architecture/) - Platform distributed architecture
- [Technologies](/technologies/) - Distributed Erlang and clustering technology
- [Capabilities](/capabilities/) - Horizontal scaling and fault tolerance capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)