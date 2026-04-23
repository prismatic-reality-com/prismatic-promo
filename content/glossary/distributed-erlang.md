+++
title = "Distributed Erlang"
weight = 50

[extra]
description = "Built-in BEAM mechanism for connecting multiple Erlang/Elixir nodes into a cluster with transparent message passing, process monitoring, and global name registration across network boundaries."
category = "platform"
related_terms = ["beam", "actor-model", "genserver", "process-isolation", "distributed-system", "hot-code-upgrade", "node"]
tags = ["glossary", "distributed-erlang", "clustering", "beam", "nodes", "distributed-systems"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
difficulty = "advanced"
quality_score = 86
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Distributed Erlang provides transparent cross-node message passing and process monitoring, enabling the Prismatic Platform to scale across Fly.io instances with location-transparent process communication."
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["Distributed Erlang", "clustering", "BEAM", "nodes", "glossary", "Prismatic Platform", "distributed"]
image = "/images/sections/glossary.png"
image_alt = "Distributed Erlang - Prismatic Platform"
word_count = 950
see_also = ["technologies", "architecture", "capabilities"]
+++

## Definition

Distributed Erlang is the BEAM virtual machine's built-in mechanism for connecting multiple Erlang/Elixir nodes into a cluster where processes can communicate transparently regardless of their physical location. When nodes are connected, `send/2` automatically routes messages across the network, `Process.monitor/1` works across nodes, and `GenServer.call/2` operates identically whether the target process is local or remote. This location transparency is a fundamental property of the Actor Model as implemented by the BEAM, inherited from Ericsson's requirement that telecom switches operate as distributed fault-tolerant systems.

Nodes authenticate using a shared cookie (a secret string) and communicate over TCP using the Erlang distribution protocol. The Erlang Port Mapper Daemon (EPMD) manages node discovery within a network, mapping node names to TCP ports.

## Technical Deep Dive

| Feature | Mechanism | Properties |
|---------|-----------|------------|
| **Node Connection** | `Node.connect/1` + cookie auth | Full mesh by default |
| **Message Passing** | Transparent via `send/2` | At-most-once delivery |
| **Process Monitoring** | `Process.monitor/1` across nodes | `:nodedown` notifications |
| **Global Registry** | `:global.register_name/2` | Cluster-wide unique names |
| **PG (Process Groups)** | `:pg.join/2`, `:pg.get_members/1` | Multi-node process groups |
| **RPC** | `:rpc.call/4` | Synchronous remote calls |
| **Distribution Protocol** | TCP + Erlang binary format | ~100-200 MB/s throughput |

The full mesh topology means every node maintains a direct TCP connection to every other node. This works well for clusters of up to ~50-100 nodes but requires alternative approaches (hidden nodes, Partisan) for larger deployments.

## Usage in Prismatic Platform

The Prismatic Platform uses distributed Erlang for multi-instance communication on Fly.io, enabling cross-node PubSub, distributed ETS caching, and cluster-wide process registration.

```elixir
defmodule Prismatic.Cluster.Manager do
  @moduledoc """
  Manages distributed Erlang cluster formation and health
  monitoring for the Prismatic Platform's multi-node deployment.
  Uses libcluster for automatic node discovery on Fly.io.
  """

  use GenServer

  require Logger

  @type cluster_state :: %{
    nodes: list(node()),
    connected_at: map(),
    strategy: :dns | :gossip | :kubernetes
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    :net_kernel.monitor_nodes(true, node_type: :visible)
    strategy = Keyword.get(opts, :strategy, :dns)

    {:ok, %{
      nodes: Node.list(),
      connected_at: %{},
      strategy: strategy
    }}
  end

  @impl GenServer
  def handle_info({:nodeup, node, _info}, state) do
    Logger.info("Node connected: #{node}")
    connected_at = Map.put(state.connected_at, node, DateTime.utc_now())
    sync_registries(node)

    {:noreply, %{state |
      nodes: [node | state.nodes] |> Enum.uniq(),
      connected_at: connected_at
    }}
  end

  @impl GenServer
  def handle_info({:nodedown, node, _info}, state) do
    Logger.warning("Node disconnected: #{node}")

    {:noreply, %{state |
      nodes: List.delete(state.nodes, node),
      connected_at: Map.delete(state.connected_at, node)
    }}
  end

  @spec cluster_status() :: map()
  def cluster_status do
    GenServer.call(__MODULE__, :status)
  end

  @impl GenServer
  def handle_call(:status, _from, state) do
    status = %{
      self: Node.self(),
      connected_nodes: Node.list(),
      node_count: length(Node.list()) + 1,
      cookie_set: Node.get_cookie() != :nocookie,
      alive: Node.alive?()
    }
    {:reply, status, state}
  end

  defp sync_registries(node) do
    # Synchronize ETS-backed registries with newly connected node
    :rpc.call(node, PrismaticOsintCore.ToolRegistry, :list_tools, [])
  end
end
```

## Code Examples

```elixir
defmodule Prismatic.Distributed.PubSub do
  @moduledoc """
  Demonstrates distributed PubSub where broadcasts automatically
  propagate to subscribers on all connected nodes through
  Phoenix.PubSub's PG2 backend.
  """

  @spec broadcast_to_cluster(String.t(), term()) :: :ok | {:error, term()}
  def broadcast_to_cluster(topic, message) do
    # Phoenix.PubSub automatically distributes to all nodes
    Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, message)
  end

  @spec node_local_broadcast(String.t(), term()) :: :ok | {:error, term()}
  def node_local_broadcast(topic, message) do
    # Local-only broadcast when cross-node propagation is unnecessary
    Phoenix.PubSub.local_broadcast(Prismatic.PubSub, topic, message)
  end

  @spec remote_call(node(), module(), atom(), list()) :: {:ok, term()} | {:error, term()}
  def remote_call(node, module, function, args) do
    case :rpc.call(node, module, function, args, 5_000) do
      {:badrpc, reason} -> {:error, reason}
      result -> {:ok, result}
    end
  end
end
```

## Best Practices

1. **Use libcluster for automatic node discovery** -- manual node connection is fragile; libcluster supports DNS, gossip, and Kubernetes strategies.
2. **Set unique cookies per environment** -- never share distribution cookies between staging and production clusters.
3. **Handle netsplits gracefully** -- design systems to tolerate temporary node disconnections without data loss.
4. **Use pg (process groups) over :global for scalability** -- `:global` uses leader election which does not scale; `:pg` is eventual-consistent and partition-tolerant.
5. **Monitor node connections** -- `:net_kernel.monitor_nodes/2` provides real-time notifications for cluster membership changes.
6. **Size clusters appropriately** -- full mesh topology limits practical cluster size to ~50-100 nodes; use application-level sharding for larger deployments.

## Related Terms

- [BEAM](@/glossary/beam.md) -- Virtual machine providing distribution infrastructure
- [Actor Model](@/glossary/actor-model.md) -- Computation model enabling transparent distribution
- **Hot Code Upgrade** -- Capability enhanced by distributed node management
- [Distributed System](@/glossary/distributed-system.md) -- Broader category of multi-node architectures
- [GenServer](@/glossary/genserver.md) -- OTP behaviour that works transparently across nodes

## See Also

- [Technologies](@/technologies/_index.md) -- BEAM clustering technologies
- [Architecture](@/architecture/_index.md) -- Platform distribution architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
