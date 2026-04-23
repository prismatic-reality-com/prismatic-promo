+++
title = "Consensus Algorithm"
weight = 33
[extra]
category = "architecture"
description = "Protocol enabling distributed nodes to agree on a single value or sequence of operations despite partial failures and network partitions."
related_terms = ["distributed-system", "cap-theorem", "cluster", "fault-tolerance", "eventual-consistency", "message-passing", "beam"]
paradigm = "Distributed Computing"
difficulty = "Advanced"
key_algorithms = ["Paxos", "Raft", "PBFT", "CRDTs"]
authors = ["Leslie Lamport", "Diego Ongaro", "John Ousterhout", "Miguel Castro", "Barbara Liskov"]
year_introduced = "1989 (Paxos)"
impossibility_result = "FLP (Fischer, Lynch, Paterson, 1985)"
properties = ["Agreement", "Validity", "Termination"]
fault_models = ["Crash Failure", "Byzantine Failure", "Omission Failure"]
prismatic_usage = ["Horde distributed registry", "PostgreSQL HA", "BEAM :global", "Trinity Gate epistemic consensus"]
prismatic_apps = ["prismatic_supervisor", "prismatic_agents", "prismatic_storage_core"]
cap_trade_off = "CP for critical data, AP for process registries"
beam_primitives = [":global", ":pg", "Horde.Registry", "Horde.DynamicSupervisor"]
node_formula = "2f+1 for crash faults, 3f+1 for Byzantine faults"
latency_range = "1-200ms depending on algorithm"
platforms = ["BEAM", "Elixir/OTP", "PostgreSQL", "etcd"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1564
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Consensus", "Algorithm", "Protocol", "glossary", "architecture", "Prismatic Platform", "Raft", "Paxos", "Horde", "PBFT"]
tags = ["glossary", "architecture", "consensus-algorithm", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Consensus Algorithm - Prismatic Platform"
+++

## Definition

A consensus algorithm is a protocol that enables a group of distributed nodes to agree on a single value or sequence of values even when some nodes fail, messages are delayed or lost, and network partitions divide the system into isolated segments. Consensus is the foundational primitive of distributed computing -- without it, distributed databases cannot replicate data consistently, leader election cannot select a coordinator reliably, and state machine replication cannot maintain identical copies across nodes. The problem was first formalized by Leslie Lamport, who proved (with the FLP impossibility result) that no deterministic consensus protocol can guarantee termination in a fully asynchronous system with even one faulty process.

Practical consensus algorithms work around this theoretical impossibility by introducing timing assumptions (partial synchrony), randomization, or failure detectors. The most widely deployed algorithms are Paxos (Lamport, 1989), Raft (Ongaro and Ousterhout, 2014), and PBFT (Castro and Liskov, 1999). Each makes different trade-offs between understandability, performance, and fault tolerance. Raft has largely displaced Paxos in modern systems due to its significantly clearer specification and equivalent correctness guarantees.

Consensus algorithms guarantee three properties: **Agreement** (all non-faulty nodes decide on the same value), **Validity** (the decided value was proposed by some node), and **Termination** (all non-faulty nodes eventually decide). These guarantees hold as long as a majority of nodes (typically 2f+1 out of 3f for f failures) remain operational and can communicate. When a majority is unavailable, the system sacrifices availability to preserve consistency -- the "C" side of the [CAP theorem](/glossary/cap-theorem/) trade-off.

## Theoretical Foundations

### The FLP Impossibility Result

In 1985, Fischer, Lynch, and Paterson proved that in a purely asynchronous distributed system where even one process can fail, no deterministic algorithm can guarantee consensus. This result, known as the FLP impossibility theorem, does not mean consensus is unachievable -- it means that any practical consensus algorithm must make additional assumptions beyond pure asynchrony.

The three common workarounds are:

| Approach | Assumption | Example Algorithms |
|----------|-----------|-------------------|
| **Partial Synchrony** | Messages eventually arrive within bounded delay | Paxos, Raft, PBFT |
| **Randomization** | Non-deterministic choices break symmetry | Ben-Or's algorithm |
| **Failure Detectors** | Unreliable oracle detects crashed processes | Chandra-Toueg consensus |

### The CAP Theorem and Consensus

The [CAP theorem](/glossary/cap-theorem/) (Brewer, 2000) states that a distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are inevitable in real systems, the practical choice is between CP (consistent but may be unavailable during partitions) and AP (available but may return stale data during partitions).

Consensus algorithms are inherently CP -- they sacrifice availability during partitions to maintain consistency. CRDTs (Conflict-free Replicated Data Types) offer an AP alternative that avoids consensus entirely by using mathematical properties of data structures to guarantee convergence without coordination.

## Implementation in Prismatic Platform

The Prismatic Platform leverages consensus indirectly through its distributed infrastructure layers. [PostgreSQL](/glossary/postgresql/) uses write-ahead logging and synchronous replication for data durability, with Raft-based consensus in PostgreSQL HA configurations. When running in distributed mode with Horde, the platform uses CRDT-based (Conflict-free Replicated Data Type) convergence for distributed process registry and supervision -- a weaker form of consensus that trades strong consistency for availability and partition tolerance, aligning with the platform's AP design choice for non-critical state.

The [BEAM](/glossary/beam/) VM's built-in `global` module provides leader election for distributed named processes across the [cluster](/glossary/cluster/), and Erlang's `pg` module (process groups) uses a gossip-based protocol for group membership consensus. The NABLA Infinity [Trinity Gate](/glossary/trinity-gate/) applies a form of consensus to epistemic claims -- three independent verification gates must agree before a claim is established, analogous to Byzantine fault tolerance requiring agreement from multiple independent validators.

```elixir
defmodule PrismaticCluster.ConsensusCoordinator do
  @moduledoc """
  Coordinates consensus-based operations across the Prismatic
  cluster. Delegates to appropriate consensus mechanisms based
  on the consistency requirements of each operation.
  """
  use GenServer

  @type consistency :: :strong | :eventual | :causal
  @type consensus_result :: {:ok, term()} | {:error, :no_quorum} | {:error, term()}

  @spec propose(term(), consistency()) :: consensus_result()
  def propose(value, :strong) do
    # Use :global registration (strong consensus via Erlang global lock)
    case :global.trans({:consensus, make_ref()}, fn -> value end) do
      value -> {:ok, value}
    end
  end

  def propose(value, :eventual) do
    # Use Horde CRDT-based convergence (eventually consistent)
    Horde.Registry.register(PrismaticRegistry, :proposed_value, value)
    {:ok, value}
  end
end
```

## Major Consensus Algorithms

### Paxos

The original consensus algorithm, proposed by Leslie Lamport. Paxos defines three roles (Proposer, Acceptor, Learner) and achieves consensus through a two-phase protocol: Prepare/Promise followed by Accept/Accepted.

| Property | Value |
|----------|-------|
| **Fault Tolerance** | f failures with 2f+1 nodes |
| **Phases** | 2 (Prepare + Accept) |
| **Leader Required** | No (but Multi-Paxos uses stable leader) |
| **Understandability** | Low (notoriously difficult to implement correctly) |
| **Used By** | Google Chubby, Apache ZooKeeper (variant) |

Paxos is provably correct but notoriously difficult to implement. Lamport himself described it through an allegory about a Greek parliament, and many engineers have found the protocol's edge cases and optimizations challenging to reason about. This difficulty led to the development of Raft as an explicitly understandable alternative.

### Raft

Designed explicitly for understandability while maintaining Paxos-equivalent correctness. Raft separates consensus into three sub-problems: leader election, log replication, and safety.

| Property | Value |
|----------|-------|
| **Fault Tolerance** | f failures with 2f+1 nodes |
| **Phases** | Leader election + log replication |
| **Leader Required** | Yes (strong leader model) |
| **Understandability** | High (designed for clarity) |
| **Used By** | etcd, CockroachDB, Consul, TiKV |

```
Raft State Machine:
  Follower --(election timeout)--> Candidate
  Candidate --(majority votes)--> Leader
  Candidate --(higher term seen)--> Follower
  Leader --(higher term seen)--> Follower

Log Replication:
  Client --> Leader --> AppendEntries RPC --> Followers
                    --> Commit when majority acknowledges
```

Raft's key innovation is decomposition: by separating the consensus problem into leader election, log replication, and safety, each sub-problem can be understood and verified independently. The strong leader model simplifies log replication (only the leader appends entries), and term-based leader election provides clear conflict resolution.

### PBFT (Practical Byzantine Fault Tolerance)

Handles Byzantine failures (nodes that behave arbitrarily, including maliciously). Requires 3f+1 nodes to tolerate f Byzantine failures.

| Property | Value |
|----------|-------|
| **Fault Tolerance** | f Byzantine failures with 3f+1 nodes |
| **Phases** | 3 (Pre-Prepare, Prepare, Commit) |
| **Leader Required** | Yes (primary with view change) |
| **Understandability** | Medium |
| **Used By** | Hyperledger Fabric, some blockchain systems |

### CRDTs (Conflict-free Replicated Data Types)

CRDTs avoid consensus entirely by leveraging mathematical properties of data structures. A CRDT guarantees that any two replicas that have received the same set of updates will converge to the same state, regardless of the order in which updates were received.

```elixir
defmodule PrismaticCluster.CRDTExample do
  @moduledoc "Demonstration of CRDT-based convergence via Horde."

  @spec register_agent(String.t(), map()) :: {:ok, pid()} | {:error, term()}
  def register_agent(agent_id, metadata) do
    Horde.Registry.register(
      PrismaticRegistry.Distributed,
      agent_id,
      metadata
    )
  end

  @spec lookup_agent(String.t()) :: {:ok, {pid(), map()}} | {:error, :not_found}
  def lookup_agent(agent_id) do
    case Horde.Registry.lookup(PrismaticRegistry.Distributed, agent_id) do
      [{pid, metadata}] -> {:ok, {pid, metadata}}
      [] -> {:error, :not_found}
    end
  end
end
```

## Comparison of Consensus Algorithms

| Feature | Paxos | Raft | PBFT | CRDTs |
|---------|-------|------|------|-------|
| **Failure Model** | Crash | Crash | Byzantine | None (coordination-free) |
| **Nodes for f faults** | 2f+1 | 2f+1 | 3f+1 | Any |
| **Consistency** | Strong | Strong | Strong | [Eventual](/glossary/eventual-consistency/) |
| **Availability** | Low during partition | Low during partition | Low during partition | High always |
| **Latency** | 2 RTT | 1 RTT (leader write) | 3 RTT | 0 (local) |
| **Complexity** | Very High | Medium | High | Low |
| **Prismatic Usage** | PostgreSQL HA | etcd (infra) | Trinity Gate (epistemic) | Horde registry |

## BEAM Distribution and Consensus

The BEAM VM provides several consensus-adjacent primitives for distributed Elixir applications:

```elixir
defmodule PrismaticCluster.DistributionExample do
  @moduledoc """
  Examples of BEAM distribution primitives used for
  consensus-adjacent operations in the Prismatic Platform.
  """

  @spec register_global_leader(atom()) :: :yes | :no
  def register_global_leader(name) do
    :global.register_name(name, self())
  end

  @spec join_process_group(atom()) :: :ok
  def join_process_group(group) do
    :pg.join(group, self())
  end

  @spec get_group_members(atom()) :: [pid()]
  def get_group_members(group) do
    :pg.get_members(group)
  end

  @spec start_distributed_supervisor(module(), term()) ::
    {:ok, pid()} | {:error, term()}
  def start_distributed_supervisor(child_spec, config) do
    Horde.DynamicSupervisor.start_child(
      PrismaticSupervisor.Distributed,
      {child_spec, config}
    )
  end
end
```

| BEAM Primitive | Consensus Type | Consistency | Use in Prismatic |
|----------------|---------------|-------------|-----------------|
| **:global** | Leader-based coordination | Strong (within connected nodes) | Named process registration |
| **:pg** | Gossip-based membership | Eventually consistent | Agent group membership |
| **Horde.Registry** | delta-CRDT | Eventually consistent | Distributed agent registry |
| **Horde.DynamicSupervisor** | delta-CRDT | Eventually consistent | Distributed agent supervision |
| **Mnesia** | Two-phase commit | Strong (when majority available) | Not used (PostgreSQL preferred) |

## Leader Election

Many consensus algorithms require a leader (or primary) node. Leader election is itself a consensus problem:

```elixir
defmodule PrismaticCluster.LeaderElection do
  @moduledoc """
  Leader election using :global registration.
  Only one process across the cluster can hold the global name,
  providing a simple but effective leader election mechanism.
  """
  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: {:global, :cluster_leader})
  end

  @impl true
  def init(opts) do
    {:ok, %{role: :leader, started_at: DateTime.utc_now(), opts: opts}}
  end

  @spec current_leader() :: pid() | nil
  def current_leader do
    :global.whereis_name(:cluster_leader)
  end

  @spec am_i_leader?() :: boolean()
  def am_i_leader? do
    current_leader() == self()
  end
end
```

| Election Method | Mechanism | Failure Handling | BEAM Support |
|----------------|-----------|-----------------|-------------|
| **:global registration** | First to register wins | Re-election on node disconnect | Built-in |
| **Raft (via library)** | Term-based voting | Automatic re-election | `ra` library |
| **Horde** | CRDT convergence | Eventual leader agreement | Horde library |
| **External** | etcd/Consul lease | Lease expiration triggers re-election | API integration |

## Consensus in the Epistemic Domain

The [Trinity Gate](/glossary/trinity-gate/) applies consensus principles to knowledge claims:

| Trinity Gate | Consensus Analogy | Validates |
|-------------|-------------------|-----------|
| **Structural Consistency** | Node agreement on graph structure | Belief network forms valid DAG |
| **Logical Consistency** | Agreement on inference rules | Propositions follow logical rules |
| **Formal Necessity** | Proof verification | Claims proven in formal systems (Lean4) |

All three gates must pass (unanimous "consensus") before a claim is established -- this is analogous to PBFT requiring agreement from all non-faulty validators, providing the strongest possible guarantee for epistemic assertions.

## Performance Characteristics

| Algorithm | Throughput (ops/s) | Latency (p50) | Latency (p99) | Partition Behavior |
|-----------|-------------------|---------------|---------------|-------------------|
| **Raft** | 10,000-50,000 | 1-5ms | 10-50ms | Blocks (CP) |
| **Paxos** | 10,000-50,000 | 2-10ms | 20-100ms | Blocks (CP) |
| **PBFT** | 1,000-10,000 | 5-20ms | 50-200ms | Blocks (CP) |
| **CRDTs** | 100,000+ | < 1ms | < 5ms | Available (AP) |

## Split-Brain Prevention

A split-brain scenario occurs when a network partition divides a cluster and both partitions believe they are the active majority. This is one of the most dangerous failure modes in distributed systems:

```elixir
defmodule PrismaticCluster.SplitBrainDetector do
  @moduledoc "Monitors for and responds to potential split-brain conditions."

  @spec check_partition_health() :: :healthy | {:split_brain, [node()], [node()]}
  def check_partition_health do
    all_nodes = [node() | Node.list()]
    expected_nodes = Application.get_env(:prismatic_cluster, :expected_nodes, [])
    missing = expected_nodes -- all_nodes

    case length(missing) do
      0 -> :healthy
      n when n < div(length(expected_nodes), 2) -> :healthy
      _ -> {:split_brain, all_nodes, missing}
    end
  end
end
```

## Best Practices

**Prefer CRDTs for Non-Critical State**: Use CRDTs (via Horde) for process registries and eventually consistent state. Reserve strong consensus (Raft/Paxos) for operations requiring strict ordering such as leader election and distributed locks.

**Design for Partition**: Always consider what happens when nodes cannot communicate. Choose between CP (block during partition) and AP (serve stale data during partition) based on the specific use case's consistency requirements.

**Use Odd Node Counts**: Deploy clusters with 3, 5, or 7 nodes to ensure a clear majority exists during partitions. Even node counts risk split-brain scenarios where neither partition has majority.

**Monitor Consensus Latency**: Track the time required for consensus rounds. Increasing latency indicates network degradation or overloaded nodes that may lead to consensus failures.

**Implement Quorum Reads**: For read-heavy workloads, consider quorum reads that contact a majority of replicas to ensure reading the latest value, trading latency for consistency.

## Use Cases in Prismatic

- **Leader Election**: Selecting a coordinator node for cluster-wide operations such as quality gate enforcement and agent scheduling
- **Distributed Process Registry**: Maintaining a consistent view of which processes run on which nodes across the cluster
- **Epistemic Verification**: Trinity Gate consensus requiring agreement from three independent verification gates before establishing claims
- **Configuration Propagation**: Ensuring configuration changes are consistently applied across all cluster nodes
- **Distributed Locking**: Coordinating exclusive access to shared resources during critical operations
- **[Agent Registry](/glossary/agent-registry/) Synchronization**: Ensuring all nodes have a consistent view of the 530+ registered agents

## Related Concepts

- [Distributed System](/glossary/distributed-system/) - Systems requiring consensus for coordination
- [CAP Theorem](/glossary/cap-theorem/) - Theoretical constraints on consensus achievability
- [Cluster](/glossary/cluster/) - Node group participating in consensus protocols
- [Fault Tolerance](/glossary/fault-tolerance/) - Resilience property enabled by consensus
- [Eventual Consistency](/glossary/eventual-consistency/) - Weaker alternative to consensus-based consistency
- [Message Passing](/glossary/message-passing/) - Communication primitive underlying consensus protocols
- [BEAM](/glossary/beam/) - VM providing distributed primitives for consensus
- [Trinity Gate](/glossary/trinity-gate/) - Epistemic consensus mechanism in NABLA framework
- [PostgreSQL](/glossary/postgresql/) - Database using consensus for HA replication
- [Load Balancing](/glossary/load-balancing/) - Traffic distribution complementing consensus-elected leaders
- [Supervisor](/glossary/supervisor/) - OTP behaviour managing distributed process lifecycle

## See Also

- [Architecture](/architecture/) - Distributed coordination design
- [Technologies](/technologies/) - Consensus implementations in the stack

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
