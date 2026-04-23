+++
title = "Distributed Systems"
weight = 50
[extra]
description = "Computing systems with components located on different networked computers that communicate and coordinate their actions through message passing to achieve common goals, providing fault tolerance, scalability, and geographic distribution."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "system-architecture"
related_concepts = ["beam-vm", "cluster", "eventual-consistency", "cap-theorem", "consensus-algorithm"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 8
prerequisites = ["concurrency", "beam-vm", "supervision-tree", "process-isolation"]
learning_path = ["concurrency", "process-isolation", "distributed-systems", "cluster", "cap-theorem", "consensus-algorithm"]
interactive_demos = ["/labs/glossary/distributed-systems"]
code_examples = ["elixir", "erlang"]
external_resources = ["https://www.erlang.org/doc/system/distributed.html", "https://hexdocs.pm/horde/readme.html", "https://jepsen.io/", "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["node-partitioning", "split-brain-recovery", "state-convergence", "failover-timing", "message-ordering"]
keywords = ["distributed systems", "BEAM distribution", "Horde", "distributed registry", "cluster", "node", "partition tolerance", "message passing", "fault tolerance", "CAP theorem", "consensus", "CRDTs"]
tags = ["glossary", "architecture", "distributed", "beam", "cluster", "fault-tolerance", "scalability", "OTP"]
related_terms = ["distributed-system", "beam-vm", "beam", "cluster", "eventual-consistency", "cap-theorem", "consensus-algorithm", "process-isolation", "supervision-tree", "circuit-breaker"]
word_count = 1746
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Distributed Systems - Prismatic Platform"
+++

## Definition

Distributed systems are computing architectures where components residing on networked computers communicate and coordinate their actions exclusively through message passing to achieve common goals. Unlike monolithic systems where all components share memory and a single failure domain, distributed systems span multiple nodes that may fail independently, experience network partitions, and observe inconsistent views of global state. The fundamental challenge of distributed systems -- articulated by Leslie Lamport -- is that "a distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."

In the context of the Prismatic Platform, distributed systems capabilities are inherited from the [BEAM VM](@/glossary/beam-vm.md) (Bogdan/Bjorn's Erlang Abstract Machine), which was purpose-built for distributed, fault-tolerant, soft real-time systems. The platform leverages BEAM's native distribution protocol for inter-node communication, [Horde](@/glossary/cluster.md) for distributed process registries and supervisors, and OTP's [supervision trees](@/glossary/supervision-tree.md) for hierarchical fault isolation and recovery.

## Overview

Distributed systems have evolved from an academic curiosity to the dominant architecture for modern software. The transition was driven by three forces: the need for fault tolerance (no single machine is perfectly reliable), the need for scalability (no single machine can handle unlimited load), and the need for geographic distribution (users are spread across the globe and expect low-latency access).

The theoretical foundations of distributed systems are built on several impossibility results and trade-off theorems:

**CAP Theorem** (Brewer, 2000): A distributed data store cannot simultaneously provide more than two of three guarantees: Consistency (every read receives the most recent write), Availability (every request receives a response), and [Partition Tolerance](@/glossary/cap-theorem.md) (the system continues to operate despite network partitions). Since network partitions are inevitable in real systems, the practical choice is between CP (consistent but sometimes unavailable) and AP (available but sometimes inconsistent).

**FLP Impossibility** (Fischer, Lynch, Paterson, 1985): In an asynchronous distributed system where at least one process may crash, no deterministic [consensus algorithm](@/glossary/consensus-algorithm.md) can guarantee agreement in bounded time. This foundational result shapes all practical consensus protocols, which must make trade-offs around timing assumptions.

**Two Generals Problem**: Two parties communicating over an unreliable channel cannot achieve coordinated action with certainty. This implies that perfect coordination in distributed systems is impossible and all practical systems must tolerate some degree of uncertainty.

The BEAM VM occupies a unique position in the distributed systems landscape. Unlike most runtimes that bolt on distributed capabilities as libraries, BEAM was designed from inception for distributed operation. Erlang/OTP was created at Ericsson in the 1980s specifically to build telephone switching systems requiring "five nines" (99.999%) uptime -- systems that could not be taken down for maintenance, upgrades, or even in the face of hardware failures.

The BEAM's distributed systems capabilities include:

- **Transparent Location**: Processes can communicate regardless of whether they reside on the same node or different nodes. `send(pid, message)` works identically for local and remote processes.
- **Native Clustering**: Nodes discover and connect to each other using BEAM's distribution protocol, forming a fully connected mesh with heartbeat-based failure detection.
- **Per-Process Isolation**: Each BEAM process has its own heap, stack, and garbage collector. A crash in one process cannot corrupt another, providing fault isolation comparable to OS-level process isolation but with microsecond-scale communication overhead.
- **Hot Code Upgrade**: Running systems can be upgraded without stopping, a critical capability for distributed systems where coordinated shutdown is complex and risky.

## Technical Details

### BEAM Distribution Protocol

The BEAM VM implements a native distribution protocol that enables transparent communication between Erlang/Elixir processes across nodes:

```elixir
defmodule PrismaticCluster.NodeManager do
  @moduledoc """
  Manages BEAM cluster topology for the Prismatic Platform.
  Handles node discovery, connection management, and health monitoring
  using libcluster for automatic cluster formation.
  """

  use GenServer
  require Logger

  @type node_status :: :connected | :disconnected | :connecting | :unreachable
  @type cluster_state :: %{
          nodes: %{node() => node_status()},
          topology: :full_mesh | :ring | :star,
          partition_detected: boolean(),
          last_topology_change: DateTime.t()
        }

  @heartbeat_interval_ms :timer.seconds(5)
  @node_timeout_ms :timer.seconds(15)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec cluster_status() :: {:ok, cluster_state()}
  def cluster_status do
    GenServer.call(__MODULE__, :cluster_status)
  end

  @spec connected_nodes() :: [node()]
  def connected_nodes do
    Node.list(:connected)
  end

  @spec node_count() :: pos_integer()
  def node_count do
    length(Node.list(:connected)) + 1
  end

  @impl true
  def init(opts) do
    topology = Keyword.get(opts, :topology, :full_mesh)
    schedule_heartbeat()

    state = %{
      nodes: %{},
      topology: topology,
      partition_detected: false,
      last_topology_change: DateTime.utc_now()
    }

    :net_kernel.monitor_nodes(true, node_type: :visible)

    {:ok, state}
  end

  @impl true
  def handle_call(:cluster_status, _from, state) do
    enriched = %{state | nodes: build_node_map()}
    {:reply, {:ok, enriched}, state}
  end

  @impl true
  def handle_info({:nodeup, node, _info}, state) do
    Logger.info("Node connected: #{node}")

    new_state = %{state |
      nodes: Map.put(state.nodes, node, :connected),
      last_topology_change: DateTime.utc_now()
    }

    {:noreply, new_state}
  end

  @impl true
  def handle_info({:nodedown, node, _info}, state) do
    Logger.warning("Node disconnected: #{node}")

    new_state = %{state |
      nodes: Map.put(state.nodes, node, :disconnected),
      last_topology_change: DateTime.utc_now(),
      partition_detected: detect_partition(state.nodes)
    }

    {:noreply, new_state}
  end

  @impl true
  def handle_info(:heartbeat, state) do
    check_node_health(state.nodes)
    schedule_heartbeat()
    {:noreply, state}
  end

  @spec build_node_map() :: %{node() => node_status()}
  defp build_node_map do
    Node.list(:connected)
    |> Enum.map(&{&1, :connected})
    |> Map.new()
  end

  @spec detect_partition(%{node() => node_status()}) :: boolean()
  defp detect_partition(nodes) do
    disconnected = Enum.count(nodes, fn {_node, status} -> status == :disconnected end)
    total = map_size(nodes)
    total > 0 and disconnected / total > 0.3
  end

  @spec check_node_health(%{node() => node_status()}) :: :ok
  defp check_node_health(nodes) do
    Enum.each(nodes, fn {node, _status} ->
      case Node.ping(node) do
        :pong -> :ok
        :pang -> Logger.warning("Node health check failed: #{node}")
      end
    end)
  end

  @spec schedule_heartbeat() :: reference()
  defp schedule_heartbeat do
    Process.send_after(self(), :heartbeat, @heartbeat_interval_ms)
  end
end
```

### Distributed Process Registries with Horde

The Prismatic Platform uses Horde for distributed process registration and supervision, providing cluster-wide process discovery and automatic failover:

```elixir
defmodule PrismaticAgents.DistributedRegistry do
  @moduledoc """
  Distributed agent registry using Horde for cluster-wide process
  registration. Agents registered here are discoverable from any
  node in the cluster and automatically migrated on node failure.

  Uses delta-CRDTs internally for eventually consistent registry
  state that converges without coordination.
  """

  use Horde.Registry

  @type agent_id :: String.t()
  @type agent_meta :: %{
          tier: :L1 | :L2 | :L3 | :L4,
          domain: atom(),
          started_at: DateTime.t(),
          node: node()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    Horde.Registry.start_link(__MODULE__, [keys: :unique] ++ opts, name: __MODULE__)
  end

  @spec init(keyword()) :: {:ok, keyword()}
  def init(opts) do
    {:ok, Keyword.put(opts, :members, discover_members())}
  end

  @spec register_agent(agent_id(), agent_meta()) :: {:ok, pid()} | {:error, {:already_registered, pid()}}
  def register_agent(agent_id, meta) do
    Horde.Registry.register(__MODULE__, agent_id, meta)
  end

  @spec lookup_agent(agent_id()) :: [{pid(), agent_meta()}]
  def lookup_agent(agent_id) do
    Horde.Registry.lookup(__MODULE__, agent_id)
  end

  @spec all_agents() :: [{agent_id(), pid(), agent_meta()}]
  def all_agents do
    Horde.Registry.select(__MODULE__, [{{:"$1", :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}])
  end

  @spec agents_on_node(node()) :: [{agent_id(), pid(), agent_meta()}]
  def agents_on_node(target_node) do
    all_agents()
    |> Enum.filter(fn {_id, _pid, meta} -> meta.node == target_node end)
  end

  @spec agent_count() :: non_neg_integer()
  def agent_count do
    Horde.Registry.count(__MODULE__)
  end

  @spec discover_members() :: [atom()]
  defp discover_members do
    [Node.self() | Node.list()]
    |> Enum.map(fn node -> {__MODULE__, node} end)
  end
end
```

### Distributed Supervisor with Automatic Failover

```elixir
defmodule PrismaticAgents.DistributedSupervisor do
  @moduledoc """
  Distributed supervisor using Horde that distributes agent processes
  across cluster nodes and automatically restarts them on a different
  node when their hosting node fails.

  Distribution strategy uses a consistent hash ring to minimize
  process migration during cluster membership changes.
  """

  use Horde.DynamicSupervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Horde.DynamicSupervisor.start_link(
      __MODULE__,
      [strategy: :one_for_one, distribution_strategy: Horde.UniformQuorumDistribution] ++ opts,
      name: __MODULE__
    )
  end

  @spec init(keyword()) :: {:ok, keyword()}
  def init(opts) do
    {:ok, Keyword.put(opts, :members, discover_members())}
  end

  @spec start_agent(module(), keyword()) :: DynamicSupervisor.on_start_child()
  def start_agent(agent_module, opts) do
    child_spec = %{
      id: Keyword.fetch!(opts, :id),
      start: {agent_module, :start_link, [opts]},
      restart: :transient,
      shutdown: :timer.seconds(10)
    }

    Horde.DynamicSupervisor.start_child(__MODULE__, child_spec)
  end

  @spec stop_agent(pid()) :: :ok | {:error, :not_found}
  def stop_agent(pid) when is_pid(pid) do
    Horde.DynamicSupervisor.terminate_child(__MODULE__, pid)
  end

  @spec running_agents() :: non_neg_integer()
  def running_agents do
    Horde.DynamicSupervisor.count_children(__MODULE__)
    |> Map.get(:active, 0)
  end

  @spec discover_members() :: [atom()]
  defp discover_members do
    [Node.self() | Node.list()]
    |> Enum.map(fn node -> {__MODULE__, node} end)
  end
end
```

### Split-Brain Resolution

Network partitions (split-brain scenarios) are the most challenging failure mode in distributed systems. When nodes cannot communicate, each partition may believe it is the sole surviving cluster and make conflicting decisions:

```elixir
defmodule PrismaticCluster.SplitBrainResolver do
  @moduledoc """
  Resolves split-brain scenarios in the Prismatic Platform cluster.

  Implements a configurable resolution strategy:
  - :static_quorum  - Nodes in minority partition shut down
  - :dynamic_quorum - Quorum size adjusts based on known cluster size
  - :keep_majority  - The partition with more nodes survives

  Uses a configurable grace period before resolution to allow
  for transient network issues to resolve naturally.
  """

  use GenServer
  require Logger

  @type strategy :: :static_quorum | :dynamic_quorum | :keep_majority
  @type state :: %{
          strategy: strategy(),
          expected_nodes: pos_integer(),
          grace_period_ms: pos_integer(),
          partition_timer: reference() | nil
        }

  @default_grace_period_ms :timer.seconds(30)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec resolve(strategy(), [node()], pos_integer()) :: :survive | :shutdown
  def resolve(strategy, visible_nodes, expected_total) do
    current_count = length(visible_nodes) + 1

    case strategy do
      :static_quorum ->
        quorum = div(expected_total, 2) + 1
        if current_count >= quorum, do: :survive, else: :shutdown

      :dynamic_quorum ->
        quorum = div(expected_total, 2) + 1
        if current_count >= quorum, do: :survive, else: :shutdown

      :keep_majority ->
        if current_count > expected_total / 2, do: :survive, else: :shutdown
    end
  end

  @impl true
  def init(opts) do
    state = %{
      strategy: Keyword.get(opts, :strategy, :keep_majority),
      expected_nodes: Keyword.get(opts, :expected_nodes, 3),
      grace_period_ms: Keyword.get(opts, :grace_period, @default_grace_period_ms),
      partition_timer: nil
    }

    :net_kernel.monitor_nodes(true)
    {:ok, state}
  end

  @impl true
  def handle_info({:nodedown, node}, state) do
    Logger.warning("SplitBrainResolver: node down #{node}, starting grace period")

    timer = Process.send_after(self(), :evaluate_partition, state.grace_period_ms)
    {:noreply, %{state | partition_timer: timer}}
  end

  @impl true
  def handle_info({:nodeup, _node}, %{partition_timer: timer} = state) when not is_nil(timer) do
    Process.cancel_timer(timer)
    {:noreply, %{state | partition_timer: nil}}
  end

  @impl true
  def handle_info({:nodeup, _node}, state) do
    {:noreply, state}
  end

  @impl true
  def handle_info(:evaluate_partition, state) do
    visible = Node.list(:connected)
    action = resolve(state.strategy, visible, state.expected_nodes)

    case action do
      :survive ->
        Logger.info("SplitBrainResolver: this partition survives (#{length(visible) + 1} nodes)")

      :shutdown ->
        Logger.critical("SplitBrainResolver: this partition must shut down (minority)")
        System.stop(1)
    end

    {:noreply, %{state | partition_timer: nil}}
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform leverages distributed systems principles across its architecture:

### Multi-Node Deployment

The platform is deployed across multiple nodes on [Fly.io](@/glossary/production-environment.md), with BEAM's native distribution protocol connecting instances. The deployment configuration in `fly.toml` specifies cluster formation parameters, and `libcluster` handles automatic node discovery using Fly.io's DNS-based service discovery.

### Distributed Agent Registry

The platform's 530 [AIAD agents](@/glossary/agent.md) are distributed across cluster nodes using Horde. Agent processes are automatically migrated to surviving nodes when a node fails, ensuring continuous availability of all agent capabilities. The `PrismaticAgents.DistributedRegistry` provides cluster-wide agent lookup by ID, tier, or domain.

### Distributed State with CRDTs

For state that must be shared across nodes without coordination overhead, the platform uses Conflict-free Replicated Data Types (CRDTs) through Horde's delta-CRDT implementation. CRDTs provide strong eventual consistency -- all nodes are guaranteed to converge to the same state without requiring distributed locking or consensus protocols.

### PrismaticSupervisor

The [PrismaticSupervisor](@/glossary/supervisor.md) application implements dependency-aware startup with pluggable backends. In development, it uses ETS for local process registration. In production, it switches to Horde for distributed registration, enabling cluster-wide [supervision tree](@/glossary/supervision-tree.md) management.

### Telemetry Aggregation

The platform's [telemetry](@/glossary/telemetry.md) system aggregates metrics across all cluster nodes, providing a unified view of platform health regardless of which node is handling a particular request or process.

## Comparison with Alternatives

| Technology | Distribution Model | Fault Tolerance | Consistency | Prismatic Fit |
|------------|-------------------|-----------------|-------------|---------------|
| **BEAM/OTP** | Native message passing, transparent location | Per-process isolation, supervision trees | Configurable (strong to eventual) | Native platform runtime |
| **Kubernetes** | Container orchestration, pod scheduling | Pod restart, node replacement | Etcd for coordination | Deployment target (Fly.io) |
| **Akka (JVM)** | Actor model, cluster sharding | Supervision, split-brain resolver | Distributed data via CRDTs | Similar model but JVM-based |
| **Go + etcd** | gRPC services, etcd coordination | Health checks, leader election | Raft consensus via etcd | Good for microservices but lacks BEAM isolation |
| **Rust + Raft** | Custom protocols, Raft consensus | Depends on implementation | Strong consensus via Raft | Performance-critical subsystems |

## Best Practices

1. **Design for Partition Tolerance**: Network partitions are inevitable in distributed systems. Design every component to degrade gracefully during partitions rather than assuming reliable networking. The BEAM's "let it crash" philosophy aligns naturally with this principle.

2. **Prefer Message Passing**: Communicate between distributed components through explicit message passing rather than shared state. This makes communication boundaries visible, testable, and resilient to partial failures.

3. **Use Supervision Trees**: Structure distributed applications as hierarchies of [supervisors](@/glossary/supervision-tree.md) that define restart strategies for their children. This provides automatic recovery from process failures without manual intervention.

4. **Implement Idempotent Operations**: In distributed systems, messages may be delivered more than once. Design operations to produce the same result regardless of how many times they are applied. This is critical for [retry patterns](@/glossary/retry-pattern.md) and at-least-once delivery guarantees.

5. **Choose Consistency Models Deliberately**: Understand the [CAP theorem](@/glossary/cap-theorem.md) trade-offs and choose consistency models appropriate to each use case. Strong consistency for financial transactions, [eventual consistency](@/glossary/eventual-consistency.md) for counters and metrics.

6. **Monitor Cluster Health**: Implement comprehensive monitoring for node connectivity, message queue depths, process counts, and replication lag. The Prismatic Platform's distributed [telemetry](@/glossary/telemetry.md) aggregation provides this visibility.

7. **Test Failure Scenarios**: Use [chaos engineering](@/glossary/chaos-engineering.md) techniques to verify that the system behaves correctly under node failures, network partitions, and clock skew. Jepsen-style testing validates distributed correctness properties.

8. **Minimize Coordination**: Every coordination point (locks, consensus rounds, two-phase commits) is a potential bottleneck and failure point. Use CRDTs, event sourcing, and local-first processing to minimize the need for cross-node coordination.

## Common Pitfalls

1. **Ignoring Network Partitions**: Assuming that the network is reliable and that all nodes can always communicate. This assumption leads to data loss, split-brain states, and inconsistent behavior during real-world network failures.

2. **Distributed Monolith**: Distributing a tightly coupled monolith across nodes without decoupling its components. This creates a system with all the complexity of distribution and none of the benefits -- every operation still requires cross-node coordination.

3. **Premature Distribution**: Distributing a system before it needs distribution. Single-node systems are dramatically simpler to develop, test, debug, and operate. Distribute only when fault tolerance, scalability, or geographic requirements demand it.

4. **Clock Assumptions**: Assuming synchronized clocks across nodes. Real distributed systems experience clock skew, clock drift, and NTP synchronization failures. Use logical clocks (vector clocks, Lamport timestamps) or CRDTs instead of relying on wall-clock time for ordering.

5. **Unbounded Message Queues**: Sending messages to distributed processes faster than they can process them. Without [backpressure](@/glossary/backpressure.md) mechanisms, message queues grow unbounded, consuming memory and eventually crashing processes.

6. **Ignoring Split-Brain**: Failing to implement split-brain resolution strategies. When a cluster partitions, both sides may elect leaders and accept writes, leading to conflicting state that is difficult or impossible to reconcile.

7. **Testing Only the Happy Path**: Testing distributed systems only under ideal network conditions. Real-world failures include partial partitions, asymmetric network failures, slow nodes, and cascading failures that are difficult to reproduce in development environments.

## Use Cases

### High-Availability Agent Operations

The platform's 530 agents run across multiple BEAM nodes. When a node fails, Horde automatically restarts affected agents on surviving nodes, maintaining continuous agent availability without manual intervention.

### Geographic Distribution

For organizations with global operations, the platform can be deployed across multiple regions. BEAM's native distribution protocol enables inter-region communication with configurable consistency guarantees appropriate to each data type.

### Rolling Deployments

BEAM's hot code upgrade capability enables rolling deployments where nodes are upgraded one at a time without service interruption. The Horde-based registry ensures that processes are migrated away from nodes being upgraded.

### Distributed OSINT Collection

OSINT collection operations are distributed across cluster nodes to parallelize data gathering from 120+ source adapters. Each node handles a subset of adapter calls, with results aggregated through the distributed registry.

### Multi-Tenant Isolation

In multi-tenant deployments, each tenant's processes can be distributed across nodes while maintaining isolation through BEAM's per-process memory isolation and the Horde-based distributed supervisor's process placement strategies.

## Related Concepts

- [BEAM VM](@/glossary/beam-vm.md) -- The virtual machine that provides native distributed systems capabilities for the platform
- [Cluster](@/glossary/cluster.md) -- A group of connected BEAM nodes forming a distributed system
- [CAP Theorem](@/glossary/cap-theorem.md) -- The fundamental trade-off theorem governing distributed data stores
- [Eventual Consistency](@/glossary/eventual-consistency.md) -- Consistency model where replicas converge over time without coordination
- [Consensus Algorithm](@/glossary/consensus-algorithm.md) -- Protocols for achieving agreement among distributed nodes
- [Supervision Tree](@/glossary/supervision-tree.md) -- Hierarchical fault isolation and recovery structure in OTP
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM's per-process memory isolation enabling fault containment
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern for preventing cascading failures in distributed systems
- [Backpressure](@/glossary/backpressure.md) -- Flow control mechanism preventing unbounded message queue growth
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Practice of testing distributed systems under failure conditions

## See Also

- [Distributed System](@/glossary/distributed-system.md) -- Related singular form entry
- [Concurrency](@/glossary/concurrency.md) -- Concurrent programming within a single node
- [Actor Model](@/glossary/actor-model.md) -- The computational model underlying BEAM processes
- [Saga Pattern](@/glossary/saga-pattern.md) -- Distributed transaction management across services
- [CQRS](@/glossary/cqrs.md) -- Command Query Responsibility Segregation for distributed data
- [Distributed Tracing](@/glossary/distributed-tracing.md) -- Observability for requests spanning multiple nodes

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
