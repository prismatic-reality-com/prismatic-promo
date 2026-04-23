+++
title = "Node"
weight = 44
[extra]
category = "technology"
description = "A running instance of the BEAM virtual machine in a distributed system"
related_terms = ["beam", "cluster", "distributed-system", "otp", "process-isolation", "message-passing"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 966
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Node", "BEAM", "glossary", "technology", "Prismatic Platform", "Nodes", "Production"]
tags = ["glossary", "technology", "node", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Node - Prismatic Platform"
+++

## Definition & Overview

A node in the Erlang/Elixir ecosystem is a named, running instance of the BEAM virtual machine that can communicate transparently with other nodes over a network. Nodes form the fundamental building block of BEAM's distributed computing model, enabling processes on different physical or virtual machines to send messages, monitor each other, and participate in distributed supervision as if they were co-located on the same machine.

Each node is identified by an atom in the format `name@hostname` (e.g., `prismatic@prod-1.fly.internal`) and authenticates with other nodes via a shared Erlang cookie -- a secret string that must match between nodes before they establish a trusted connection. Once connected, the BEAM runtime transparently routes messages between processes regardless of their physical location, making distribution a property of deployment rather than a property of application code.

The node abstraction is one of the BEAM's most powerful features because it enables genuine location transparency. A process sending a message to `{:agent_registry, :"prismatic@prod-2.fly.internal"}` uses exactly the same syntax and semantics as sending a message to a local process. This means applications can be developed and tested on a single node and then deployed across a cluster with minimal or no code changes. The BEAM handles connection management, message serialization, network partitions, and node discovery automatically.

Nodes can be started in three modes: as a named distributed node (`:longname` or `:shortname`), as a hidden node (connected but not visible in `Node.list/0`), or as a non-distributed node (no clustering capability). Production deployments typically use long names with DNS-based discovery for automatic cluster formation.

## Technical Deep Dive

### Node Naming and Identity

BEAM nodes use two naming conventions depending on the network environment:

| Mode | Format | Use Case | Example |
|------|--------|----------|---------|
| **Short Name** | `name@hostname` | Development, single-subnet | `prismatic@localhost` |
| **Long Name** | `name@fqdn` | Production, multi-host | `prismatic@prod-1.fly.internal` |
| **Hidden** | Same as above + `--hidden` | Monitoring, tooling | `observer@admin.internal` |

Nodes started with short names can only connect to other short-name nodes, and vice versa. Production deployments should consistently use long names.

### Connection Establishment

When node A attempts to connect to node B, the following protocol executes:

1. **DNS Resolution**: Node A resolves the hostname portion of node B's name
2. **TCP Connection**: A TCP connection is established to the EPMD (Erlang Port Mapper Daemon) on node B's host
3. **Port Lookup**: EPMD returns the distribution port for node B's name
4. **Cookie Verification**: Node A sends a challenge-response handshake using the shared cookie
5. **Connection Active**: Upon successful authentication, the nodes are fully connected

```elixir
defmodule PrismaticCluster.NodeManager do
  @moduledoc """
  Manages BEAM node connections for the Prismatic Platform cluster.
  Handles discovery, connection, and health monitoring of cluster nodes.
  """

  @type node_status :: :connected | :disconnected | :unreachable | :hidden

  @spec connect_to_peers(list(atom())) :: %{atom() => node_status()}
  def connect_to_peers(peer_nodes) do
    peer_nodes
    |> Enum.map(fn node_name ->
      status = case Node.connect(node_name) do
        true -> :connected
        false -> :unreachable
        :ignored -> :disconnected
      end

      {node_name, status}
    end)
    |> Map.new()
  end

  @spec cluster_status() :: map()
  def cluster_status do
    connected = Node.list()
    hidden = Node.list(:hidden)

    %{
      self: Node.self(),
      connected_nodes: connected,
      hidden_nodes: hidden,
      total_nodes: length(connected) + length(hidden) + 1,
      cookie_hash: :erlang.phash2(Node.get_cookie())
    }
  end
end
```

### Distributed Process Communication

Message passing between nodes is transparent -- the same `send/2` and `GenServer.call/3` functions work across node boundaries:

```elixir
# Sending a message to a process on a remote node
send({:process_name, :"prismatic@prod-2.fly.internal"}, {:update, data})

# Calling a GenServer on a remote node
GenServer.call({MyServer, :"prismatic@prod-2.fly.internal"}, :get_state)

# Registering a process globally across all nodes
:global.register_name(:singleton_agent, self())

# Starting a process on a remote node
Node.spawn(:"prismatic@prod-2.fly.internal", fn ->
  IO.puts("Running on remote node: #{Node.self()}")
end)
```

### Network Partition Handling

BEAM nodes detect network partitions through a heartbeat mechanism. When a node becomes unreachable, the system generates `:nodedown` messages to any processes monitoring that node:

```elixir
defmodule PrismaticCluster.PartitionHandler do
  @moduledoc """
  Handles network partition events in the BEAM cluster.
  Implements split-brain resolution strategies.
  """

  use GenServer

  @impl true
  def init(_opts) do
    :net_kernel.monitor_nodes(true, node_type: :visible)
    {:ok, %{known_nodes: MapSet.new()}}
  end

  @impl true
  def handle_info({:nodeup, node, _info}, state) do
    Logger.info("Node connected: #{node}")
    new_state = %{state | known_nodes: MapSet.put(state.known_nodes, node)}
    trigger_post_connection_sync(node)
    {:noreply, new_state}
  end

  @impl true
  def handle_info({:nodedown, node, _info}, state) do
    Logger.warning("Node disconnected: #{node}")
    new_state = %{state | known_nodes: MapSet.delete(state.known_nodes, node)}
    trigger_partition_response(node, new_state)
    {:noreply, new_state}
  end
end
```

## Architecture & Implementation

### Cluster Topology

The Prismatic Platform deploys as a cluster of BEAM nodes with automatic discovery:

```
                    +------------------+
                    |   DNS Discovery  |
                    |   (Fly.io DNS)   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v--+    +------v----+   +-----v------+
     | Node 1    |    | Node 2    |   | Node 3     |
     | prismatic |    | prismatic |   | prismatic  |
     | @prod-1   |<-->| @prod-2   |<->| @prod-3    |
     | (leader)  |    | (replica) |   | (replica)  |
     +--------+--+    +------+----+   +-----+------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v---------+
                    | Shared Cookie    |
                    | (FLY_APP_NAME)   |
                    +------------------+
```

### Production Clustering with libcluster

```elixir
defmodule PrismaticCluster.Topology do
  @moduledoc """
  Cluster topology configuration for the Prismatic Platform.
  Uses DNS-based discovery for Fly.io deployments.
  """

  @spec child_spec(keyword()) :: Supervisor.child_spec()
  def child_spec(opts) do
    topologies = [
      prismatic: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          polling_interval: 5_000,
          query: dns_query(),
          node_basename: node_basename()
        ]
      ]
    ]

    {Cluster.Supervisor, [topologies, [name: __MODULE__]]}
  end

  defp dns_query do
    app_name = System.get_env("FLY_APP_NAME", "prismatic")
    "#{app_name}.internal"
  end

  defp node_basename do
    System.get_env("FLY_APP_NAME", "prismatic")
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform's deployment architecture uses BEAM nodes for both development and production clustering. Fly.io deployments run multiple nodes with automatic clustering via DNS discovery, enabling distributed supervision, agent distribution, and data replication across the cluster.

### PrismaticSupervisor and Horde

The [PrismaticSupervisor](@/glossary/supervision-tree.md) application supports Horde-based distributed supervision across nodes in production, falling back to local ETS-based registries in development. The `Registry.Behaviour` trait abstracts this difference, allowing the same supervision code to work transparently in both environments.

### Agent Distribution

The platform's 434 runtime agents can distribute across nodes through the agent registry. The [Prismatic Agents](@/glossary/prismatic-agents.md) runtime uses the platform's message-passing architecture to ensure transparent cross-node agent communication. When an agent is located on a remote node, the dispatch mechanism routes messages through the BEAM distribution protocol without any change to the calling code.

### Data Replication

ETS tables used for caching (agent registry, configuration, security ratings) can replicate across nodes using the Horde distributed registry or custom replication mechanisms built on top of the BEAM distribution protocol.

## Code Examples

### Node Health Check

```elixir
defmodule PrismaticCluster.HealthCheck do
  @moduledoc """
  Health checking for cluster nodes with latency measurement.
  """

  @spec check_node_health(atom()) :: {:ok, map()} | {:error, :unreachable}
  def check_node_health(node_name) do
    start_time = System.monotonic_time(:microsecond)

    case :rpc.call(node_name, :erlang, :statistics, [:wall_clock], 5_000) do
      {uptime_ms, _} ->
        latency = System.monotonic_time(:microsecond) - start_time

        {:ok, %{
          node: node_name,
          status: :healthy,
          uptime_ms: uptime_ms,
          rpc_latency_us: latency,
          connected_nodes: :rpc.call(node_name, Node, :list, []),
          process_count: :rpc.call(node_name, :erlang, :system_info, [:process_count])
        }}

      {:badrpc, _reason} ->
        {:error, :unreachable}
    end
  end

  @spec check_all_nodes() :: map()
  def check_all_nodes do
    [Node.self() | Node.list()]
    |> Enum.map(fn node -> {node, check_node_health(node)} end)
    |> Map.new()
  end
end
```

### Cross-Node Agent Dispatch

```elixir
defmodule PrismaticAgents.CrossNodeDispatch do
  @moduledoc """
  Dispatches agent operations across BEAM cluster nodes.
  Provides location-transparent agent invocation.
  """

  @spec dispatch_to_agent(atom(), atom(), list()) ::
    {:ok, term()} | {:error, :agent_not_found | :node_unreachable}
  def dispatch_to_agent(agent_id, action, args) do
    case locate_agent(agent_id) do
      {:local, pid} ->
        {:ok, GenServer.call(pid, {action, args})}

      {:remote, node, pid} ->
        case GenServer.call({pid, node}, {action, args}, 10_000) do
          result -> {:ok, result}
        end

      :not_found ->
        {:error, :agent_not_found}
    end
  end

  defp locate_agent(agent_id) do
    case Registry.lookup(PrismaticAgents.Registry, agent_id) do
      [{pid, _}] -> {:local, pid}
      [] -> search_remote_nodes(agent_id)
    end
  end

  defp search_remote_nodes(agent_id) do
    Node.list()
    |> Enum.find_value(:not_found, fn node ->
      case :rpc.call(node, Registry, :lookup, [PrismaticAgents.Registry, agent_id], 5_000) do
        [{pid, _}] -> {:remote, node, pid}
        _ -> nil
      end
    end)
  end
end
```

## Best Practices

1. **Use Long Names in Production**: Always use fully qualified domain names for production nodes. Short names limit clustering to a single subnet and cause issues with cloud deployments.

2. **Secure the Cookie**: The Erlang cookie is a shared secret. Use environment variables to inject it at runtime rather than hardcoding it. Rotate cookies periodically and use strong, random values.

3. **Implement Partition Handling**: Network partitions are inevitable in distributed systems. Implement explicit `:nodeup` and `:nodedown` handlers that define behavior during split-brain scenarios.

4. **Monitor Node Connectivity**: Use `:net_kernel.monitor_nodes/2` to receive notifications about node state changes. Implement health checks that verify both connectivity and application-level readiness.

5. **Prefer Process Registry Over Global**: Use local process registries with distributed lookup rather than `:global` registration, which requires cluster-wide consensus and can block during partitions.

## Common Pitfalls

- **Cookie Mismatch**: Nodes with different cookies silently fail to connect. Verify cookie consistency across all nodes in the cluster before investigating other connectivity issues.

- **Mixed Name Modes**: Attempting to connect a short-name node to a long-name node fails silently. Ensure all nodes in a cluster use the same naming convention.

- **EPMD Dependency**: By default, BEAM relies on EPMD for port discovery. In containerized environments, ensure EPMD is running or use alternatives like `erl_dist` with static port assignment.

- **Large Message Passing**: Sending large data structures (multi-MB binaries, large lists) between nodes serializes and deserializes them, consuming significant CPU and network bandwidth. Use references to shared storage (ETS, database) instead.

- **Assuming Connectivity**: Node connections can drop at any time. Always handle `{:badrpc, :nodedown}` responses and implement retry logic with exponential backoff for critical cross-node operations.

## Related Concepts

- [BEAM](@/glossary/beam.md) - Virtual machine that each node runs as an instance of
- [Cluster](@/glossary/cluster.md) - Group of connected nodes forming a distributed system
- [Distributed System](@/glossary/distributed-system.md) - Architecture pattern enabled by node connectivity
- [Message Passing](@/glossary/message-passing.md) - Communication model that works transparently across nodes
- [Process Isolation](@/glossary/process-isolation.md) - Isolation model maintained across node boundaries
- [OTP](@/glossary/otp.md) - Application framework providing distributed supervision across nodes
- [Supervision Tree](@/glossary/supervision-tree.md) - Hierarchical process management across node boundaries

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Prismatic Agents](@/apps/prismatic-agents.md) - Agent distribution across nodes

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)