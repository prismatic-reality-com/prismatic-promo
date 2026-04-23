+++
title = "Mnesia"
weight = 42
[extra]
category = "technology"
description = "Distributed real-time database built into the Erlang/OTP runtime with ACID transactions and transparent replication"
related_terms = ["ets", "otp", "beam", "cluster", "distributed-system", "postgresql", "genserver", "supervisor"]
platform_relevance = "high"
complexity = "advanced"
domain = "distributed-storage"
layer = "data"
paradigm = "distributed-database"
runtime = "BEAM"
language = "Erlang/Elixir"
origin = "Ericsson"
first_introduced = "OTP R1 (1996)"
prismatic_usage = "distributed-agent-registry, session-state, cluster-coordination"
quality_impact = "moderate"
safety_level = "production"
documentation_required = true
testing_strategy = "property-based-testing"
storage_types = ["ram_copies", "disc_copies", "disc_only_copies"]
transaction_types = ["transaction", "sync_transaction", "async_dirty", "sync_dirty"]
query_methods = ["key-lookup", "index-read", "match-object", "qlc"]
related_apps = ["prismatic_cluster", "prismatic_agents", "prismatic_supervisor"]
cap_theorem_position = "CP (consistency + partition tolerance)"
see_also = ["ets", "otp", "beam", "cluster", "postgresql", "distributed-system"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1741
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mnesia", "Distributed", "ErlangOTP", "ACID", "glossary", "technology", "Prismatic Platform", "BEAM"]
tags = ["glossary", "technology", "mnesia", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Mnesia - Prismatic Platform"
+++

## Definition

Mnesia is a distributed, soft real-time database management system built into the Erlang/OTP platform, designed for telecommunications applications requiring high availability, fault tolerance, and predictable response times. Unlike external database systems that communicate over network protocols, Mnesia runs inside the [BEAM](/glossary/beam/) virtual machine as a native [OTP](/glossary/otp/) application, storing Erlang and Elixir terms directly in memory without serialization overhead. It combines the speed of in-memory storage (via [ETS](/glossary/ets/) tables) with optional disk persistence (via DETS), ACID transactions across distributed nodes, transparent data replication, and schema evolution at runtime without downtime.

Mnesia was developed at Ericsson in the 1990s as part of the Open Telecom Platform, specifically to meet the requirements of telecommunications switching systems that demanded sub-millisecond data access, continuous availability (five-nines or better), and transparent failover across hardware boundaries. These requirements drove Mnesia's distinctive design: data lives in-process with zero serialization cost, replication is automatic and configurable per-table, transactions work across nodes using a two-phase commit protocol, and the schema can be modified while the system continues serving requests.

The system occupies a unique position in the database landscape. It is neither a traditional relational database (it stores arbitrary Erlang terms, not SQL-structured rows) nor a simple key-value store (it supports secondary indexes, QLC queries, and multi-table transactions). It is a distributed, in-memory, term-storage database with optional persistence, native to the BEAM runtime. This makes it the natural choice for storing application state that must survive node restarts and replicate across [cluster](/glossary/cluster/) members without external infrastructure dependencies.

## Historical Context and Design Philosophy

Mnesia's origins trace to the AXD 301 ATM switch project at Ericsson in the mid-1990s, one of the most ambitious telecommunications systems ever built. The switch required a database that could handle millions of concurrent subscribers, provide sub-millisecond lookups for call routing, survive hardware failures without service interruption, and allow schema changes without system downtime. No existing database met these requirements, so the Erlang team built Mnesia as part of OTP.

The name "Mnesia" derives from the Greek word "mnesia" (memory), reflecting the database's in-memory nature. The original name was "Amnesia" (a play on the concept of a forgetful database that could also remember), but Ericsson's naming committee objected, resulting in the dropping of the initial "A."

The design philosophy behind Mnesia reflects the Erlang ecosystem's broader priorities: availability over consistency in the face of network partitions, predictable latency over maximum throughput, and operational simplicity over feature richness. Mnesia deliberately does not attempt to compete with PostgreSQL or MySQL on query expressiveness, indexing sophistication, or storage efficiency. Instead, it excels in a specific niche: distributed state management within the BEAM ecosystem where zero-serialization access, automatic replication, and tight OTP integration outweigh the benefits of a full-featured external database.

This philosophy aligns perfectly with the Prismatic Platform's storage architecture, where each storage backend serves a specific purpose. [PostgreSQL](/glossary/postgresql/) handles structured data with rich queries, [ETS](/glossary/ets/) provides local caching with maximum speed, Meilisearch powers full-text search, and Mnesia fills the gap for distributed state that must be accessible from any node in the [cluster](/glossary/cluster/) without external dependencies.

## Overview

### Mnesia in the Storage Hierarchy

```
                    Application Layer
                          |
        +-----------------+------------------+
        |                 |                  |
    ETS (local)     Mnesia (distributed)  External DB
    - Fastest       - Distributed           - PostgreSQL
    - No persist    - Persistent optional   - Full SQL
    - No replicate  - Replicated            - Rich queries
    - In-process    - In-process            - Network I/O
    - Per-node      - Cross-node            - Centralized
```

### Table Types

Mnesia supports multiple table storage backends, each optimized for different access patterns.

| Table Type | Storage | Persistence | Performance | Use Case |
|------------|---------|-------------|-------------|----------|
| **ram_copies** | RAM only (ETS) | Lost on restart | Fastest reads/writes | Session data, caches |
| **disc_copies** | RAM + disk (ETS + DETS) | Survives restarts | Fast reads, slower writes | Configuration, registries |
| **disc_only_copies** | Disk only (DETS) | Survives restarts | Slowest (disk I/O) | Audit logs, large datasets |

The choice of table type is per-table and per-node. A table can have `ram_copies` on some nodes and `disc_copies` on others, enabling sophisticated topologies where frequently accessed data is memory-resident on hot paths while persistent copies exist on dedicated storage nodes.

### Data Model

Mnesia stores records as Erlang/Elixir tuples where the first element is the table name and the second element is the primary key. This tuple-based model eliminates the object-relational impedance mismatch that plagues traditional database integrations.

```elixir
# Record format: {TableName, PrimaryKey, Field1, Field2, ...}
# Using Elixir records (compile-time convenience):

defmodule AgentRegistry do
  @moduledoc """
  Mnesia record definition for the distributed agent registry.
  Agents are tracked across cluster nodes with automatic replication.
  """

  require Record

  Record.defrecord(:agent, [
    :id,           # Primary key
    :name,
    :tier,
    :status,
    :last_heartbeat,
    :node
  ])
end

# Stored as: {:agent, "agent-001", "scanner", :l2, :active, ~U[2026-02-15T10:00:00Z], :"app@host1"}
```

## Technical Details

### Schema Definition and Table Creation

```elixir
defmodule PrismaticCluster.MnesiaSetup do
  @moduledoc """
  Mnesia schema initialization and table creation for
  distributed platform state. Handles both fresh installations
  and cluster node additions with automatic synchronization.
  """

  @spec initialize_schema(list(node())) :: :ok | {:error, term()}
  def initialize_schema(nodes) do
    # Stop Mnesia on all nodes before schema creation
    Enum.each(nodes, &:rpc.call(&1, :mnesia, :stop, []))

    # Create distributed schema
    case :mnesia.create_schema(nodes) do
      :ok -> :ok
      {:error, {_, {:already_exists, _}}} -> :ok
      error -> error
    end

    # Start Mnesia on all nodes
    Enum.each(nodes, &:rpc.call(&1, :mnesia, :start, []))

    # Create tables with replication
    create_tables(nodes)
  end

  defp create_tables(nodes) do
    :mnesia.create_table(:agent_registry, [
      attributes: [:id, :name, :tier, :status, :last_heartbeat, :node],
      disc_copies: nodes,
      index: [:name, :tier, :status],
      type: :set
    ])

    :mnesia.create_table(:session_state, [
      attributes: [:session_id, :user_id, :data, :created_at, :expires_at],
      ram_copies: nodes,
      index: [:user_id],
      type: :set
    ])

    :mnesia.create_table(:config_store, [
      attributes: [:key, :value, :updated_at, :updated_by],
      disc_copies: nodes,
      type: :set
    ])

    :mnesia.create_table(:event_buffer, [
      attributes: [:event_id, :type, :payload, :timestamp, :processed],
      ram_copies: nodes,
      index: [:type, :processed],
      type: :ordered_set
    ])

    :ok
  end
end
```

### Transaction Types

Mnesia provides multiple transaction types optimized for different consistency and performance requirements.

| Transaction Type | Consistency | Performance | Use Case |
|-----------------|-------------|-------------|----------|
| **`transaction/1`** | Full ACID, distributed locks | Slower (lock contention) | Multi-record updates, cross-table consistency |
| **`sync_transaction/1`** | ACID + synchronous replication | Slowest (waits for all nodes) | Critical data that must be immediately consistent |
| **`async_dirty/1`** | No locks, no transaction log | Fastest | Read-heavy workloads, eventual consistency acceptable |
| **`sync_dirty/1`** | No locks, synchronous write | Fast | Single-record writes where consistency is less critical |
| **`activity/2`** | Configurable access context | Varies | Testing, custom access patterns |

The distinction between transaction types is critical for performance. A full `:mnesia.transaction` acquires distributed locks using a majority-based protocol, which provides strong consistency but introduces latency proportional to the number of nodes. For read-heavy workloads where stale data is acceptable, `async_dirty` bypasses the transaction system entirely, reading directly from the local ETS table backing the Mnesia table.

### Query Capabilities

```elixir
defmodule PrismaticCluster.MnesiaQueries do
  @moduledoc """
  Mnesia query patterns for distributed state access.
  Demonstrates key lookup, index queries, match specifications,
  and QLC comprehensions for complex query patterns.
  """

  # Simple key lookup (fastest - single ETS read)
  @spec get_agent(String.t()) :: {:ok, tuple()} | {:error, :not_found}
  def get_agent(id) do
    case :mnesia.dirty_read(:agent_registry, id) do
      [record] -> {:ok, record}
      [] -> {:error, :not_found}
    end
  end

  # Index-based lookup (uses secondary index)
  @spec agents_by_tier(atom()) :: {:ok, list(tuple())}
  def agents_by_tier(tier) do
    records = :mnesia.dirty_index_read(:agent_registry, tier, :tier)
    {:ok, records}
  end

  # Transaction with match specification (pattern matching on records)
  @spec active_agents_on_node(node()) :: {:ok, list(tuple())} | {:error, term()}
  def active_agents_on_node(target_node) do
    case :mnesia.transaction(fn ->
      :mnesia.match_object({:agent_registry, :_, :_, :_, :active, :_, target_node})
    end) do
      {:atomic, results} -> {:ok, results}
      {:aborted, reason} -> {:error, reason}
    end
  end

  # QLC (Query List Comprehension) for complex queries
  @spec agents_with_stale_heartbeat(integer()) :: {:ok, list(tuple())} | {:error, term()}
  def agents_with_stale_heartbeat(max_age_seconds) do
    cutoff = DateTime.add(DateTime.utc_now(), -max_age_seconds, :second)

    case :mnesia.transaction(fn ->
      query = :qlc.q([
        agent ||
          agent <- :mnesia.table(:agent_registry),
          elem(agent, 5) < cutoff
      ])

      :qlc.e(query)
    end) do
      {:atomic, results} -> {:ok, results}
      {:aborted, reason} -> {:error, reason}
    end
  end

  # Folding over entire table (use sparingly - full table scan)
  @spec count_agents_by_status() :: {:ok, map()} | {:error, term()}
  def count_agents_by_status do
    case :mnesia.transaction(fn ->
      :mnesia.foldl(fn record, acc ->
        status = elem(record, 4)
        Map.update(acc, status, 1, &(&1 + 1))
      end, %{}, :agent_registry)
    end) do
      {:atomic, counts} -> {:ok, counts}
      {:aborted, reason} -> {:error, reason}
    end
  end
end
```

### Replication and Failover

Mnesia's replication model is table-granular and node-configurable. Each table can specify which nodes hold copies and what type of copy (ram, disc, disc_only) each node maintains.

```
Node A                    Node B                    Node C
+------------------+     +------------------+     +------------------+
| agent_registry   |<--->| agent_registry   |<--->| agent_registry   |
| (disc_copies)    |     | (disc_copies)    |     | (disc_copies)    |
+------------------+     +------------------+     +------------------+
| session_state    |<--->| session_state    |<--->| session_state    |
| (ram_copies)     |     | (ram_copies)     |     | (ram_copies)     |
+------------------+     +------------------+     +------------------+

Replication: Automatic, synchronous for transactions
Failover: Automatic, surviving nodes continue serving
Recovery: Rejoining node syncs from surviving nodes
```

When a node fails, surviving nodes continue serving reads and writes without interruption. The failed node's data is still available on the surviving nodes. When the failed node recovers and rejoins the cluster, Mnesia automatically synchronizes its tables from the surviving nodes.

### Network Partition Handling

Mnesia's most significant limitation is its handling of network partitions. When a network partition splits the cluster, Mnesia may detect "inconsistent database" states where different sides of the partition have divergent data. The default behavior is to log a warning and continue, which can lead to data inconsistency.

```elixir
defmodule PrismaticCluster.MnesiaPartitionHandler do
  @moduledoc """
  Handles Mnesia network partition recovery using a
  configurable resolution strategy. Defaults to majority-wins
  with manual override for critical data.
  """

  @spec handle_partition(list(node()), list(node())) :: :ok | {:error, term()}
  def handle_partition(surviving_nodes, recovered_nodes) do
    # Use majority partition as source of truth
    if length(surviving_nodes) > length(recovered_nodes) do
      # Surviving partition is majority - force sync from here
      Enum.each(recovered_nodes, fn node ->
        :rpc.call(node, :mnesia, :set_master_nodes, [surviving_nodes])
      end)
      :ok
    else
      # No clear majority - require manual resolution
      {:error, :manual_resolution_required}
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses Mnesia for distributed state scenarios where cross-node access is required without external infrastructure dependencies.

```elixir
defmodule PrismaticCluster.DistributedRegistry do
  @moduledoc """
  Distributed agent registry using Mnesia for cross-node
  state management with automatic replication and failover.
  Tracks 530+ agents across the BEAM cluster.
  """

  use GenServer

  @table :distributed_agents

  @spec register_agent(String.t(), map()) :: {:ok, String.t()} | {:error, term()}
  def register_agent(agent_id, metadata) do
    record = {
      @table,
      agent_id,
      metadata.name,
      metadata.tier,
      :active,
      DateTime.utc_now(),
      node()
    }

    case :mnesia.transaction(fn -> :mnesia.write(record) end) do
      {:atomic, :ok} -> {:ok, agent_id}
      {:aborted, reason} -> {:error, reason}
    end
  end

  @spec deregister_agent(String.t()) :: :ok | {:error, term()}
  def deregister_agent(agent_id) do
    case :mnesia.transaction(fn -> :mnesia.delete({@table, agent_id}) end) do
      {:atomic, :ok} -> :ok
      {:aborted, reason} -> {:error, reason}
    end
  end

  @spec list_agents(keyword()) :: {:ok, list(map())} | {:error, term()}
  def list_agents(opts \\ []) do
    tier_filter = Keyword.get(opts, :tier)
    node_filter = Keyword.get(opts, :node)

    result =
      :mnesia.transaction(fn ->
        :mnesia.foldl(fn record, acc ->
          if matches_filters?(record, tier_filter, node_filter) do
            [record_to_map(record) | acc]
          else
            acc
          end
        end, [], @table)
      end)

    case result do
      {:atomic, agents} -> {:ok, agents}
      {:aborted, reason} -> {:error, reason}
    end
  end

  defp matches_filters?(record, nil, nil), do: true
  defp matches_filters?(record, tier, nil), do: elem(record, 3) == tier
  defp matches_filters?(record, nil, node), do: elem(record, 6) == node
  defp matches_filters?(record, tier, node), do: elem(record, 3) == tier and elem(record, 6) == node

  defp record_to_map(record) do
    %{
      id: elem(record, 1),
      name: elem(record, 2),
      tier: elem(record, 3),
      status: elem(record, 4),
      last_heartbeat: elem(record, 5),
      node: elem(record, 6)
    }
  end
end
```

## CAP Theorem Position

In terms of the [CAP theorem](/glossary/cap-theorem/), Mnesia is a CP system -- it prioritizes Consistency and Partition tolerance over Availability. During a network partition, Mnesia may become unavailable (refusing writes) rather than allowing inconsistent data across partitions. This is the appropriate trade-off for the types of state Mnesia manages in the Prismatic Platform: agent registrations, configuration, and coordination state where inconsistency would be more harmful than brief unavailability.

| Property | Mnesia Behavior |
|----------|----------------|
| **Consistency** | Strong (ACID transactions with distributed locks) |
| **Availability** | Best-effort (degrades during partitions) |
| **Partition Tolerance** | Yes (survives node failures, detects partitions) |

## Comparison with Alternatives

| Feature | Mnesia | [ETS](/glossary/ets/) | [PostgreSQL](/glossary/postgresql/) | Redis | Horde |
|---------|--------|-----|------------|-------|-------|
| **Location** | In-BEAM | In-BEAM | External server | External server | In-BEAM (library) |
| **Distribution** | Built-in (multi-node) | Local only | Separate replication | Redis Cluster | CRDT-based |
| **Persistence** | Optional (RAM/disk) | None | Always persistent | Optional (RDB/AOF) | None (in-memory) |
| **Transactions** | ACID (distributed) | None | Full ACID | Limited (MULTI) | None (eventual) |
| **Query language** | Match specs, QLC | Match specs, ETS | SQL | Commands | Elixir API |
| **Schema** | Runtime-evolvable | Schemaless | Migrations | Schemaless | Schemaless |
| **Serialization** | None (native terms) | None (native terms) | Protocol-based | RESP protocol | None (native terms) |
| **Best for** | Distributed BEAM state | Local caching | Structured data, reporting | External caching | Process distribution |
| **Max data size** | Memory-limited | Memory-limited | Disk-limited | Memory-limited | Memory-limited |

## Schema Evolution

One of Mnesia's distinctive capabilities is runtime schema evolution. Tables can be created, deleted, and modified while the system is running and serving requests. This enables zero-downtime schema migrations for Mnesia-backed state.

```elixir
defmodule PrismaticCluster.MnesiaEvolution do
  @moduledoc """
  Handles runtime schema evolution for Mnesia tables.
  Supports adding attributes, changing table types, and
  modifying replication without service interruption.
  """

  @spec add_attribute(atom(), atom(), term()) :: :ok | {:error, term()}
  def add_attribute(table, new_attribute, default_value) do
    current_attrs = :mnesia.table_info(table, :attributes)
    new_attrs = current_attrs ++ [new_attribute]

    transform_fn = fn old_record ->
      Tuple.append(old_record, default_value)
    end

    case :mnesia.transform_table(table, transform_fn, new_attrs) do
      {:atomic, :ok} -> :ok
      {:aborted, reason} -> {:error, reason}
    end
  end

  @spec change_table_type(atom(), node(), atom()) :: :ok | {:error, term()}
  def change_table_type(table, node, new_type) do
    case :mnesia.change_table_copy_type(table, node, new_type) do
      {:atomic, :ok} -> :ok
      {:aborted, reason} -> {:error, reason}
    end
  end
end
```

## Best Practices

1. **Use Mnesia for BEAM-Distributed State**: Mnesia is optimal when data needs to be shared across BEAM nodes without external dependencies. For data that does not require cross-node access, ETS is simpler. For data that requires rich queries, PostgreSQL is more capable.

2. **Choose Table Types Carefully**: Use `ram_copies` for ephemeral data (sessions, caches), `disc_copies` for important state (registries, configuration), and `disc_only_copies` only for large datasets where memory is a constraint.

3. **Minimize Transaction Scope**: Keep transactions as short as possible to reduce lock contention. Use `dirty_read` for reads that do not require strict consistency, and `dirty_write` when eventual consistency is acceptable.

4. **Plan for Network Partitions**: Mnesia does not handle network partitions gracefully by default. Configure the `majority` table setting for critical tables, and implement a partition resolution strategy (either manual or automatic).

5. **Index Sparingly**: Secondary indexes improve read performance but increase write overhead. Add indexes only for fields that are frequently queried and have moderate cardinality.

6. **Monitor Table Sizes**: Mnesia tables in `ram_copies` or `disc_copies` consume BEAM process memory. Monitor table sizes and implement eviction strategies for growing datasets.

7. **Use `dirty_read` for Non-Critical Reads**: The vast majority of reads do not require transactional isolation. Using `dirty_read` instead of reading within a transaction avoids lock acquisition and provides significantly better performance.

8. **Test with Multiple Nodes**: Mnesia behavior changes significantly in multi-node configurations. Always test with at least two nodes in your test environment to catch replication and consistency issues early.

## Common Pitfalls

- **Unbounded table growth**: Mnesia tables without eviction strategies grow until they consume all available memory. Implement TTL-based cleanup or size-based eviction for tables that receive continuous writes.

- **Long-running transactions**: Transactions that perform expensive computations while holding locks cause contention and can lead to deadlocks. Move computation outside the transaction, holding locks only for the actual read-modify-write cycle.

- **Ignoring partition warnings**: Mnesia logs warnings about inconsistent database states after partition recovery. These warnings indicate potential data inconsistency and must be investigated and resolved.

- **Schema creation ordering**: Mnesia schema must be created before Mnesia is started on any node, but after all nodes in the cluster are connected. Getting this ordering wrong is a common source of initialization failures.

## Use Cases

- **Distributed Agent Registry**: Cross-node agent registration and discovery, enabling the platform's 530 agents to coordinate across BEAM cluster nodes with automatic failover.

- **Session State Management**: User session data replicated across nodes for seamless failover, with `ram_copies` providing fast access and automatic eviction on expiry.

- **Configuration Store**: Runtime-configurable platform settings that must be consistent across all cluster nodes, with `disc_copies` ensuring persistence across restarts.

- **Cluster Coordination**: [PrismaticSupervisor](/glossary/supervisor/)'s Horde backend can leverage Mnesia for consensus state when stronger consistency guarantees are needed than CRDTs provide.

- **Event Buffer**: Temporary storage for events during processing pipeline stages, replicated across nodes for [fault tolerance](/glossary/fault-tolerance/) but not requiring external database durability.

## Related Concepts

- [ETS](/glossary/ets/) -- In-memory storage that Mnesia extends with persistence and distribution
- [OTP](/glossary/otp/) -- Runtime platform that includes Mnesia as a standard application
- [BEAM](/glossary/beam/) -- Virtual machine hosting Mnesia processes natively
- [Cluster](/glossary/cluster/) -- Multi-node deployment where Mnesia replicates data
- [PostgreSQL](/glossary/postgresql/) -- External relational database complementing Mnesia
- [Distributed System](/glossary/distributed-system/) -- Architecture pattern Mnesia supports natively
- [GenServer](/glossary/genserver/) -- OTP pattern used alongside Mnesia for stateful processes
- [CAP Theorem](/glossary/cap-theorem/) -- Theoretical framework for Mnesia's consistency/availability trade-offs
- [Fault Tolerance](/glossary/fault-tolerance/) -- Reliability property that Mnesia enables through replication
- [Supervisor](/glossary/supervisor/) -- OTP patterns for managing Mnesia-dependent processes

## See Also

- [Architecture](/architecture/) -- Distributed storage architecture
- [Technologies](/technologies/) -- Database technology stack
- [Capabilities](/capabilities/) -- Distributed data management capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
