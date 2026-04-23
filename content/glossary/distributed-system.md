+++
title = "Distributed System"
weight = 14
[extra]
description = "Computing system where components on networked computers coordinate through message passing to appear as a single coherent system"
category = "architecture"
tags = ["distributed-computing", "beam-vm", "clustering", "fault-tolerance", "message-passing", "horde", "libcluster", "cap-theorem"]
related_terms = ["cap-theorem", "eventual-consistency", "cluster", "message-passing", "consensus-algorithm", "fault-tolerance", "supervisor", "process-isolation", "circuit-breaker", "load-balancing", "beam", "fly-io"]
difficulty = "advanced"
importance = "critical"
platform_relevance = "core"
date_created = "2025-05-01"
date_updated = "2026-02-22"
version = "3.0.0"
audience = ["platform-architects", "backend-engineers", "devops-engineers", "system-designers"]
prerequisites = ["beam", "otp", "elixir", "message-passing", "supervisor"]
domain = "platform-architecture"
related_patterns = ["location-transparency", "let-it-crash", "supervision-tree", "consistent-hashing", "crdt-merge", "polyglot-consistency"]
see_also = ["architecture/_index.md", "technologies/_index.md", "apps/_index.md"]
acronyms = ["BEAM", "OTP", "CAP", "CRDT", "FLP", "DNS", "ETS"]
standards = ["CAP-theorem", "FLP-impossibility", "Lamport-clocks", "vector-clocks"]
tools = ["libcluster", "Horde", "Phoenix.PubSub", "pg", "rpc", "global"]
platforms = ["beam-vm", "fly-io", "wireguard"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2054
date_modified = "2026-02-23"
keywords = ["Distributed", "System", "Computing", "glossary", "architecture", "Prismatic Platform", "BEAM", "Horde"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Distributed System - Prismatic Platform"
+++

## Definition and Overview

A distributed system is a collection of independent computing nodes that communicate through message passing to coordinate actions and share state, appearing to users as a single coherent system. Unlike monolithic architectures where all components share memory and a single failure domain, distributed systems spread computation across multiple physical or virtual machines connected by a network. This distribution introduces fundamental challenges -- partial failures, network partitions, clock skew, message reordering, and Byzantine faults -- that do not exist in single-node systems. The reward for managing this complexity is horizontal scalability, fault tolerance through redundancy, and geographic distribution that can place computation close to data sources or end users.

The theoretical foundations of distributed systems rest on several impossibility results that constrain what any distributed system can achieve. The [CAP theorem](/glossary/cap-theorem/) proves that no distributed data store can simultaneously guarantee consistency, availability, and partition tolerance. The FLP impossibility result (Fischer, Lynch, Paterson, 1985) proves that no deterministic consensus protocol can guarantee termination in an asynchronous system where even a single process may crash. These results are not obstacles to be overcome but fundamental properties of networked computation that inform every design decision in a distributed platform.

The BEAM virtual machine, which underpins the Prismatic Platform's [Elixir](/glossary/elixir/) runtime, was designed from its inception for distributed computing. Erlang was created at Ericsson in the 1980s to build telephone switches requiring 99.999% uptime -- systems that are inherently distributed across multiple hardware units. This heritage means that distribution is not bolted onto the BEAM as an afterthought but woven into its process model, message passing semantics, and failure handling philosophy. The Prismatic Platform leverages this native distribution capability to deploy its 115 umbrella applications, 530 agents, and quality enforcement infrastructure across a multi-region cluster on [Fly.io](/glossary/fly-io/).

## BEAM Distribution Model

### Node Connectivity and Mesh Topology

BEAM nodes form clusters through a fully connected mesh topology. When node A connects to node B, and node B is already connected to node C, node A automatically discovers and connects to node C. This transitive connectivity simplifies cluster formation but limits maximum cluster size -- a fully connected mesh of N nodes requires N*(N-1)/2 connections, making clusters of hundreds of nodes impractical without partitioning strategies.

Each BEAM node runs an independent instance of the virtual machine with its own scheduler, memory allocator, and process table. Processes on different nodes communicate through the same `send/2` primitive used for local message passing -- the runtime transparently serializes messages using Erlang Term Format (ETF), routes them over the network through the distribution port, and deserializes them at the destination. This location transparency is a core principle: code that works locally works identically across nodes without modification, a property that dramatically simplifies the development of distributed applications.

### Distribution Primitives

The BEAM provides a rich set of distribution primitives that the Prismatic Platform builds upon:

| Primitive | Purpose | Scope | Prismatic Usage |
|-----------|---------|-------|-----------------|
| `Node.connect/1` | Establish connection between BEAM nodes | Cluster formation | Automatic via libcluster |
| `Node.list/0` | List all connected nodes | Cluster discovery | Health monitoring, agent placement |
| `:global` | Cluster-wide process name registration | Global singleton processes | Quality Floor Guardian, SEADF engine |
| `:pg` (process groups) | Group processes across nodes | Pub/sub, fan-out | Phoenix.PubSub, agent groups |
| `:rpc` | Remote procedure calls to other nodes | Cross-node function execution | Distributed task dispatch |
| Distributed ETS | Replicated in-memory tables | Shared state across nodes | Agent registry, configuration cache |
| Horde | Distributed supervisor and registry | Fault-tolerant process placement | Agent supervision, singleton management |

### Cluster Formation in Production

```elixir
defmodule PrismaticCluster.Config do
  @moduledoc """
  Cluster formation configuration for the Prismatic Platform.
  Uses DNS-based discovery on Fly.io with WireGuard mesh networking.
  Supports multiple topologies for different deployment environments.
  """

  @spec cluster_config(atom()) :: keyword()
  def cluster_config(:production) do
    [
      topologies: [
        fly6pn: [
          strategy: Cluster.Strategy.DNSPoll,
          config: [
            polling_interval: 5_000,
            query: "prismatic.internal",
            node_basename: "prismatic"
          ]
        ]
      ]
    ]
  end

  @spec cluster_config(atom()) :: keyword()
  def cluster_config(:development) do
    [
      topologies: [
        local: [
          strategy: Cluster.Strategy.Epmd,
          config: [hosts: [:"prismatic@127.0.0.1"]]
        ]
      ]
    ]
  end

  @spec cluster_config(atom()) :: keyword()
  def cluster_config(:test) do
    [topologies: []]
  end
end
```

The Prismatic Platform uses `libcluster` with DNS-based discovery for automatic cluster formation on [Fly.io](/glossary/fly-io/). Fly.io's WireGuard mesh network provides encrypted, low-latency connectivity between nodes across regions. When a new node starts, it queries the internal DNS record `prismatic.internal`, discovers existing nodes, and joins the cluster automatically. When a node fails, the remaining nodes detect the disconnection through BEAM's built-in heartbeat mechanism and redistribute work accordingly through Horde.

## Consistency Models

Distributed systems must choose among several consistency models, each offering different trade-offs between correctness guarantees and performance. The Prismatic Platform employs polyglot consistency -- different storage backends and data flows use different consistency models based on business requirements.

| Model | Guarantee | Latency | Use Case in Prismatic |
|-------|-----------|---------|----------------------|
| **Strong Consistency** | All nodes see same data at same time | High (coordination required) | Security ratings, compliance assessments, quality scores |
| **Eventual Consistency** | All nodes converge to same state given time | Low (no coordination) | OSINT cache synchronization, search indices, agent state |
| **Causal Consistency** | Causally related operations seen in order | Medium | Event processing pipelines, audit trails, session context |
| **Session Consistency** | A single client sees its own writes | Low-Medium | User dashboard state, session data, LiveView assigns |

```elixir
defmodule PrismaticStorage.ConsistencyPolicy do
  @moduledoc """
  Defines consistency requirements for different data domains.
  Each domain specifies its consistency model based on business
  requirements, read/write patterns, and tolerance for stale data.
  """

  @type consistency_model :: :strong | :eventual | :causal | :session

  @spec required_consistency(atom()) :: consistency_model()
  def required_consistency(:security_ratings), do: :strong
  def required_consistency(:compliance_assessments), do: :strong
  def required_consistency(:quality_scores), do: :strong
  def required_consistency(:osint_cache), do: :eventual
  def required_consistency(:search_index), do: :eventual
  def required_consistency(:agent_state), do: :eventual
  def required_consistency(:audit_trail), do: :causal
  def required_consistency(:event_pipeline), do: :causal
  def required_consistency(:dashboard_state), do: :session
  def required_consistency(_), do: :eventual
end
```

[PostgreSQL](/glossary/postgresql/) provides strong consistency for authoritative data through serializable transactions. [Redis](/glossary/redis/) provides eventual consistency for cached data with configurable TTLs. ETS tables are node-local by default (strong consistency within a node) with optional cross-node replication through Horde ([eventual consistency](/glossary/eventual-consistency/) across nodes). Meilisearch provides eventual consistency for full-text search indices with near-real-time indexing latency.

## Failure Modes and Handling

Distributed systems experience failure modes that are qualitatively different from single-node failures. Understanding and designing for these failure modes is the central challenge of distributed systems engineering.

### Partial Failure

In a distributed system, some components can fail while others continue operating. A network partition might isolate node A from node B while both continue serving requests independently. The [let-it-crash](/glossary/let-it-crash/) philosophy, enforced through OTP [supervisors](/glossary/supervisor/), provides a principled approach: when a process fails, its supervisor restarts it with clean state rather than attempting complex error recovery. This approach scales naturally to distributed systems -- when a node fails, distributed supervisors (Horde) restart its processes on surviving nodes.

### Network Partitions

Network partitions -- where the [cluster](/glossary/cluster/) splits into two or more groups that cannot communicate -- are the defining challenge of distributed systems. The [CAP theorem](/glossary/cap-theorem/) proves that during a partition, the system must choose between consistency (rejecting requests that might produce inconsistent state) and availability (serving requests with potentially stale data).

The Prismatic Platform handles partitions through a combination of strategies:

- **PostgreSQL**: Uses primary-replica topology; during partition, only the primary accepts writes (CP behavior)
- **ETS/Horde**: Each partition continues operating independently; state reconciles when partition heals (AP behavior)
- **Application layer**: [Circuit breakers](/glossary/circuit-breaker/) detect partition-induced failures and provide graceful degradation
- **Phoenix.PubSub**: Local broadcasts continue within each partition; cross-partition messages buffer and replay on heal

### Split-Brain Resolution

When a network partition heals, the cluster must reconcile divergent state. The platform uses conflict-free replicated data types (CRDTs) for counters, sets, and registers where automatic merge is possible, and last-writer-wins with vector clocks for cases where automatic merge is not semantically meaningful.

```elixir
defmodule PrismaticStorage.CRDT.GCounter do
  @moduledoc """
  Grow-only counter CRDT for distributed counting without coordination.
  Each node maintains its own counter; the total is the sum of all nodes.
  Merge is commutative, associative, and idempotent -- safe for
  concurrent updates and partition healing.
  """

  @type t :: %{node() => non_neg_integer()}

  @spec new() :: t()
  def new, do: %{}

  @spec increment(t(), node()) :: t()
  def increment(counter, node \\ Node.self()) do
    Map.update(counter, node, 1, &(&1 + 1))
  end

  @spec value(t()) :: non_neg_integer()
  def value(counter) do
    counter |> Map.values() |> Enum.sum()
  end

  @spec merge(t(), t()) :: t()
  def merge(counter_a, counter_b) do
    Map.merge(counter_a, counter_b, fn _k, v1, v2 -> max(v1, v2) end)
  end
end
```

## Prismatic Distributed Architecture

The Prismatic Platform deploys across multiple [Fly.io](/glossary/fly-io/) regions, with each BEAM node running a full copy of the umbrella application including its own agent processes, ETS caches, and Phoenix endpoint.

```
                    +-----------------------------------------+
                    |       Fly.io WireGuard Mesh              |
                    |                                          |
    +-----------+   |   +-----------+       +-----------+     |
    |  Node A   |<--+-->|  Node B   |<----->|  Node C   |     |
    |  (iad)    |   |   |  (cdg)    |       |  (nrt)    |     |
    |           |   |   |           |       |           |     |
    | [530 Agt] |   |   | [530 Agt] |       | [530 Agt] |     |
    | [ETS]     |   |   | [ETS]     |       | [ETS]     |     |
    | [LiveView]|   |   | [LiveView]|       | [LiveView]|     |
    +-----------+   |   +-----------+       +-----------+     |
                    |          |                               |
                    |   +------+------+                       |
                    |   | PostgreSQL  |  (shared, CP)          |
                    |   |  Primary    |                        |
                    |   +------+------+                        |
                    |          |                               |
                    |   +------+------+                       |
                    |   | Read Replica|  (per-region)          |
                    |   +-------------+                        |
                    +-----------------------------------------+
```

Horde distributes singleton processes (the Quality Floor Guardian, the SEADF evolution engine, the [PrismaticSupervisor](/glossary/supervisor/) coordinator) across the cluster, ensuring exactly one instance runs at any time. If the node hosting a singleton fails, Horde automatically restarts it on a surviving node within seconds. Process placement uses a consistent hashing strategy to minimize redistribution when nodes join or leave.

## Distributed Process Management

The platform uses Horde for distributed process supervision and registry, building on the BEAM's native distribution primitives to provide fault-tolerant process placement across the cluster.

```elixir
defmodule PrismaticSupervisor.Distributed do
  @moduledoc """
  Distributed supervisor using Horde for cross-cluster process management.
  Ensures that supervised processes survive node failures through automatic
  redistribution. Uses consistent hashing for stable process placement.
  """

  use Horde.DynamicSupervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Horde.DynamicSupervisor.start_link(
      __MODULE__,
      [strategy: :one_for_one, members: :auto],
      opts
    )
  end

  @spec start_agent(map()) :: DynamicSupervisor.on_start_child()
  def start_agent(agent_spec) do
    Horde.DynamicSupervisor.start_child(
      __MODULE__,
      {PrismaticAgents.Worker, agent_spec}
    )
  end

  @spec count_agents() :: non_neg_integer()
  def count_agents do
    Horde.DynamicSupervisor.count_children(__MODULE__)
    |> Keyword.get(:active, 0)
  end

  @impl true
  def init(init_arg) do
    Horde.DynamicSupervisor.init(init_arg)
  end
end

defmodule PrismaticSupervisor.Registry do
  @moduledoc """
  Distributed registry for agent lookup across cluster nodes.
  Provides unique key registration with automatic cleanup on
  process termination or node disconnection.
  """

  use Horde.Registry

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Horde.Registry.start_link(
      __MODULE__,
      [keys: :unique, members: :auto],
      opts
    )
  end

  @spec lookup(String.t()) :: [{pid(), term()}]
  def lookup(agent_id) do
    Horde.Registry.lookup(__MODULE__, agent_id)
  end

  @spec registered_agents() :: [String.t()]
  def registered_agents do
    Horde.Registry.select(__MODULE__, [{{:"$1", :_, :_}, [], [:"$1"]}])
  end
end
```

The `:auto` membership option enables automatic cluster member discovery -- when a new BEAM node joins the cluster, Horde's distributed supervisor and registry automatically incorporate it. Process placement uses a consistent hashing strategy to minimize redistribution when nodes join or leave, ensuring that the 530-agent fleet experiences minimal disruption during cluster topology changes.

## Observability in Distributed Systems

Distributed systems require specialized [observability](/glossary/observability/) tooling because no single node has a complete view of system behavior. The Prismatic Platform implements a comprehensive observability stack that correlates events across all cluster nodes.

| Observability Layer | Implementation | Purpose |
|--------------------|----------------|---------|
| [Distributed Tracing](/glossary/distributed-tracing/) | OpenTelemetry spans across nodes | End-to-end request tracking |
| [Structured Logging](/glossary/structured-logging/) | JSON logs with node/process metadata | Cross-node log correlation |
| [Metrics](/glossary/metrics/) | Telemetry events aggregated centrally | Cluster-wide health monitoring |
| Node Monitoring | BEAM `:net_kernel` heartbeats | Partition and failure detection |
| Process Distribution | Horde registry queries | Agent placement visualization |

```elixir
defmodule PrismaticCluster.HealthMonitor do
  @moduledoc """
  Monitors cluster health by tracking node connectivity,
  process distribution, and cross-node communication latency.
  Emits telemetry events for alerting and dashboarding.
  """

  use GenServer

  @check_interval :timer.seconds(15)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_check()
    {:ok, %{nodes: [], last_check: nil, opts: opts}}
  end

  @impl true
  def handle_info(:health_check, state) do
    nodes = Node.list()
    latencies = measure_latencies(nodes)

    :telemetry.execute(
      [:prismatic, :cluster, :health],
      %{
        node_count: length(nodes),
        avg_latency_ms: average_latency(latencies),
        max_latency_ms: max_latency(latencies)
      },
      %{node: Node.self(), connected_nodes: nodes}
    )

    schedule_check()
    {:noreply, %{state | nodes: nodes, last_check: DateTime.utc_now()}}
  end

  defp measure_latencies(nodes) do
    Enum.map(nodes, fn node ->
      start = System.monotonic_time(:microsecond)
      :rpc.call(node, :erlang, :node, [])
      elapsed = System.monotonic_time(:microsecond) - start
      {node, elapsed / 1_000}
    end)
  end

  defp schedule_check, do: Process.send_after(self(), :health_check, @check_interval)
  defp average_latency([]), do: 0.0
  defp average_latency(latencies), do: Enum.map(latencies, &elem(&1, 1)) |> then(&(Enum.sum(&1) / length(&1)))
  defp max_latency([]), do: 0.0
  defp max_latency(latencies), do: Enum.map(latencies, &elem(&1, 1)) |> Enum.max()
end
```

The platform attaches distributed trace context to every cross-node message, enabling reconstruction of the full request path even when it spans multiple nodes and storage backends. The [Observer](/glossary/observer/) tool provides real-time visualization of process distribution across the cluster.

## Performance Considerations

Distributed systems introduce latency and complexity that require careful performance management. The Prismatic Platform addresses these concerns through several mechanisms:

| Concern | Strategy | Implementation |
|---------|----------|---------------|
| Cross-node latency | Minimize cross-node calls | Local ETS caches, node affinity routing |
| Serialization overhead | Efficient binary format | Erlang Term Format (ETF) for BEAM messages |
| Network bandwidth | Message size limits | Compress large payloads, batch small messages |
| Coordination overhead | Avoid consensus where possible | CRDTs for counters, eventual consistency for caches |
| Process placement | Co-locate related processes | Horde placement strategies, node affinity |

The platform's [page load performance standard](/glossary/performance/) of under 250ms total load time applies across all cluster configurations. This requires that distributed operations -- cross-node agent lookups, distributed registry queries, and cross-region data replication -- complete within tight latency budgets that leave room for application-level processing.

## Historical Context and Industry Evolution

The field of distributed systems has evolved through several paradigm shifts. The 1970s saw foundational work on [message passing](/glossary/message-passing/) and [consensus](/glossary/consensus-algorithm/) (Lamport clocks, 1978). The 1980s introduced practical distributed databases (two-phase commit, Paxos). The 1990s brought Erlang and the BEAM, demonstrating that distribution could be a language-level primitive. The 2000s introduced large-scale web systems (Google's MapReduce, Amazon's Dynamo) that prioritized availability over consistency. The 2010s brought container orchestration ([Docker](/glossary/docker/), Kubernetes) as a platform-agnostic distribution layer.

The BEAM ecosystem occupies a unique position in this evolution. While most distributed systems frameworks treat distribution as a deployment concern layered on top of single-node programming models, the BEAM treats distribution as a language-level primitive. This means that the Prismatic Platform's distributed architecture is not a separate system from its single-node architecture -- it is the same system, transparently scaled across multiple nodes. A process on node A sends a message to a process on node B using the same syntax and semantics as sending to a local process.

## Best Practices

1. **Design for partial failure**: Every cross-node call can fail. Use timeouts, circuit breakers, and fallback strategies for all distributed operations. Never assume network reliability.

2. **Choose consistency models deliberately**: Match consistency requirements to business needs. Strong consistency for security ratings, eventual consistency for caches. Document the choice and its rationale.

3. **Minimize cross-node communication**: Place related processes on the same node when possible. Use local ETS for read-heavy workloads. Reserve cross-node calls for operations that genuinely require coordination.

4. **Monitor cluster health continuously**: Network partitions, node failures, and latency spikes require real-time detection. The HealthMonitor GenServer provides 15-second health check cadence.

5. **Test partition scenarios**: Use tools like `Toxiproxy` or BEAM's `:net_kernel.disconnect/1` to simulate partitions in development and staging environments.

6. **Use CRDTs where applicable**: For counters, sets, and registers that require concurrent updates without coordination, CRDTs provide mathematically guaranteed convergence.

## Common Pitfalls

- **Assuming network reliability**: The network is always unreliable. Designing as if it were reliable leads to data loss, split-brain, and inconsistent state that manifests only under production load.

- **Overusing strong consistency**: Strong consistency requires coordination, which adds latency and reduces availability. Many use cases tolerate eventual consistency, and forcing strong consistency where it is not needed degrades performance without benefit.

- **Ignoring clock skew**: Distributed nodes do not share a global clock. Using wall-clock timestamps for ordering can produce incorrect results. Use logical clocks (Lamport timestamps, vector clocks) for causal ordering.

- **Unbounded cross-node messages**: Large messages consume network bandwidth and serialization CPU. Set size limits and compress payloads that exceed thresholds.

- **Testing only on single nodes**: Many distributed system bugs only manifest with multiple nodes. Always test cluster configurations in CI/CD with at least two nodes.

## Related Terms

- [CAP Theorem](/glossary/cap-theorem/) -- Fundamental theorem constraining distributed system guarantees
- [Eventual Consistency](/glossary/eventual-consistency/) -- Consistency model for distributed replicas converging over time
- [Cluster](/glossary/cluster/) -- Connected group of BEAM nodes forming the distributed system
- [Message Passing](/glossary/message-passing/) -- Communication primitive between distributed processes
- [Consensus Algorithm](/glossary/consensus-algorithm/) -- Protocols for distributed agreement (Paxos, Raft)
- [Fault Tolerance](/glossary/fault-tolerance/) -- System's ability to continue operating despite component failures
- [Supervisor](/glossary/supervisor/) -- OTP process monitoring and restart, extended to distributed by Horde
- [Process Isolation](/glossary/process-isolation/) -- BEAM isolation guarantees that make distribution safe
- [Circuit Breaker](/glossary/circuit-breaker/) -- Pattern for graceful degradation during partial failures
- [Load Balancing](/glossary/load-balancing/) -- Request distribution across cluster nodes
- [BEAM](/glossary/beam/) -- Virtual machine providing native distributed computing primitives
- [Fly.io](/glossary/fly-io/) -- Deployment platform providing WireGuard mesh networking

## See Also

- [Architecture](/architecture/) -- Distributed platform architecture
- [Technologies](/technologies/) -- BEAM distributed computing technology stack
- [Apps](/apps/) -- 115 umbrella applications running across the distributed cluster

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
