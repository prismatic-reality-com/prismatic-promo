+++
title = "Replication"
weight = 50

[extra]
description = "The process of copying and maintaining data across multiple nodes or storage systems to ensure availability, fault tolerance, and read scalability. In the Prismatic Platform, replication spans PostgreSQL streaming replication for persistent data, ETS registry reconstruction from compiled modules, and Horde-based distributed process state across BEAM cluster nodes."
category = "architecture"
domain = "infrastructure"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["wal", "rollback", "rpo", "rto", "storage-adapter", "retention", "failover", "high-availability", "consensus", "ets", "mnesia", "horde"]
tags = ["replication", "database", "availability", "fault-tolerance", "postgresql", "distributed", "streaming-replication", "wal", "read-replica", "ets", "beam-cluster"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Replication ensures data survives node failures and enables read scaling. Prismatic Platform uses PostgreSQL streaming replication for persistent data (near-zero RPO), ETS registry reconstruction from compiled BEAM modules for ephemeral state (no replication needed), and Horde for distributed process registries across cluster nodes."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Replication", "database", "availability", "PostgreSQL", "distributed", "streaming replication", "WAL", "read replica", "logical replication", "ETS", "Mnesia", "Horde", "BEAM cluster", "failover", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Replication - Database and Distributed Systems - Prismatic Platform"
word_count = 3400
see_also = ["architecture", "capabilities", "infrastructure"]
+++

## Definition

**Replication** is the process of maintaining identical copies of data across multiple storage locations, servers, or data centers. Its primary purposes are fault tolerance (data survives hardware failures), availability (read traffic can be distributed across replicas), and disaster recovery (a replica in a different region can become the primary if the original is destroyed). Replication is the fundamental mechanism through which distributed systems trade additional infrastructure cost for reliability.

Replication strategies fall into two fundamental categories: **synchronous** (the primary waits for replicas to acknowledge writes before confirming to the client) and **asynchronous** (the primary confirms immediately and replicas catch up later). Synchronous replication provides stronger consistency guarantees -- every acknowledged write exists on at least two nodes -- but introduces write latency proportional to the network round-trip time to the replica. Asynchronous replication offers better write performance but risks data loss if the primary fails before replicas have caught up.

A third category, **semi-synchronous**, requires acknowledgment from at least one (but not all) replicas before confirming. This provides a balance between durability and latency that is well-suited to most production workloads. PostgreSQL's `synchronous_standby_names` with `FIRST 1` implements this pattern, ensuring at least one replica has confirmed the write while allowing other replicas to lag.

## Core Concepts

### Replication Strategy Comparison

| Strategy | Consistency | Write Latency | Data Loss Risk | Complexity | Use Case |
|----------|-----------|---------------|---------------|-----------|----------|
| Synchronous | Strong (linearizable) | High (+network RTT) | Zero for committed txns | High | Financial data, compliance records |
| Semi-synchronous | Strong (at least 1 replica) | Medium (+1 replica RTT) | Near-zero | Medium | Primary operational data |
| Asynchronous | Eventual | None (fire-and-forget) | Replication lag window | Low | Read replicas, analytics |
| Logical | Selective, eventual | None | Publication lag | High | Cross-version, filtered sync |
| Statement-based | Varies (non-deterministic risk) | None | Statement lag | Medium | Legacy MySQL, simple cases |

### PostgreSQL Replication Mechanisms

| Mechanism | What Is Replicated | Granularity | RPO Achieved | Read Queries on Replica | Schema Divergence |
|-----------|-------------------|------------|-------------|----------------------|-------------------|
| Streaming (physical) | Entire cluster (all databases) | WAL record | Lag (0-5s typical) | Yes (hot standby) | Not supported |
| Logical replication | Selected tables/publications | Row change | Publication lag | Yes | Supported (same table structure) |
| WAL archiving | WAL segments to storage | WAL segment (16MB) | Archive interval | Via PITR restore only | Not applicable |
| pg_basebackup | Full cluster snapshot | Full copy | Snapshot time | After replay | Not applicable |

### BEAM-Level Replication Approaches

| Approach | Data Type | Consistency | Failure Mode | Prismatic Usage |
|----------|----------|------------|-------------|-----------------|
| ETS reconstruction | Compiled module metadata | Eventually consistent (per-node startup) | Node restart rebuilds from code | ToolRegistry, TopicRegistry, SourceRegistry |
| Mnesia | Structured records | Configurable (ram/disc, sync/async) | Network partition handling complex | Not currently used |
| Horde | Process state, registry entries | CRDT-based (eventually consistent) | Graceful node addition/removal | Distributed agent registry |
| PubSub broadcast | Event notifications | At-most-once delivery | Message loss on node disconnect | Real-time dashboard updates |
| Delta-CRDT | Distributed counters, sets, maps | Strong eventual consistency | Automatic conflict resolution | Distributed state convergence |

### Replication Topology Patterns

| Topology | Description | Advantages | Disadvantages | Complexity |
|----------|-----------|-----------|--------------|-----------|
| Primary-Standby | One writer, one+ readers | Simple, well-understood | Single write bottleneck | Low |
| Primary-Primary | Multiple writers | No write bottleneck | Conflict resolution required | Very High |
| Cascading | Primary -> Standby -> Standby | Reduces load on primary | Increased lag for downstream | Medium |
| Fan-out | Primary -> Many standbys | High read scalability | WAL sender resource usage | Medium |
| Multi-region | Primary in region A, standby in B | Disaster recovery | Cross-region latency | High |

## Technical Deep Dive

### PostgreSQL Streaming Replication Architecture

PostgreSQL streaming replication works by transmitting Write-Ahead Log (WAL) records from the primary server to one or more standby servers over TCP connections. The standby applies (replays) these WAL records to maintain a near-identical copy of the primary's data.

The replication protocol operates in three phases:

1. **Connection**: The standby connects to the primary using a replication connection (configured in `pg_hba.conf`). Authentication uses standard PostgreSQL mechanisms. The standby identifies its current WAL position.

2. **Streaming**: The primary's WAL sender process streams WAL records to the standby as they are generated. The standby's WAL receiver writes these records to local WAL files and signals the startup process to replay them.

3. **Feedback**: The standby periodically sends feedback to the primary reporting its current replay position, write position, and flush position. The primary uses this feedback for replication slot management, synchronous commit confirmation, and monitoring.

### Replication Lag: Anatomy and Monitoring

Replication lag is the time delay between a write on the primary and its availability on a standby. It has three components:

1. **Send lag**: Time for WAL records to travel over the network from primary to standby
2. **Write lag**: Time for the standby to write WAL records to disk
3. **Replay lag**: Time for the standby to apply WAL records to data files

Each component can be monitored independently via `pg_stat_replication`:

```sql
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  write_lag,
  flush_lag,
  replay_lag,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS bytes_behind
FROM pg_stat_replication;
```

Lag spikes typically occur during:
- Bulk data operations (large INSERTs, schema migrations)
- Standby I/O saturation (slow disks)
- Network congestion or partitions
- Long-running queries on the standby (conflicts with replay)

### Logical Replication

Logical replication publishes changes at the row level rather than the WAL record level. This enables:

- **Selective replication**: Publish only specific tables or filtered rows
- **Cross-version replication**: Publisher and subscriber can run different PostgreSQL versions
- **Schema differences**: Subscriber can have additional columns or indexes
- **Multi-source aggregation**: A subscriber can aggregate data from multiple publishers

Logical replication uses publications (on the publisher) and subscriptions (on the subscriber). Each publication defines which tables and operations (INSERT, UPDATE, DELETE) are replicated. The subscriber applies changes through a logical replication worker process.

Limitations include: no DDL replication (schema changes must be applied manually), no sequence replication (sequences must be manually synchronized), and potential for replication conflicts if the subscriber has local modifications to replicated tables.

### ETS Registry Reconstruction

In the BEAM ecosystem, ETS (Erlang Term Storage) tables are node-local by design. They are not automatically replicated across cluster nodes. The Prismatic Platform takes an intentional approach to ETS data: registries are reconstructed from compiled BEAM modules at startup rather than replicated.

This approach has several advantages:
- **Source of truth is code**: The codebase is the authoritative source for registry data, not a database
- **No replication lag**: Each node has a complete, consistent registry immediately after startup
- **No network dependency**: Registry availability does not depend on inter-node communication
- **Crash resilience**: A node restart naturally rebuilds the registry

The tradeoff is that registry updates require code deployment (hot code reload or restart). Runtime-registered data (such as dynamic tool results) must use a different persistence mechanism.

### Horde: Distributed BEAM Processes

Horde provides distributed process supervision and registry using CRDTs (Conflict-free Replicated Data Types). Unlike Mnesia, which uses two-phase commit for distributed transactions, Horde uses delta-CRDTs for eventually consistent state that automatically converges without coordination.

Horde's distributed supervisor ensures that supervised processes are distributed across cluster nodes. If a node goes down, its processes are automatically restarted on surviving nodes. This provides high availability for stateful processes (agents, pipeline workers) without manual failover.

Key properties:
- **Automatic rebalancing**: Processes redistribute when nodes join or leave
- **Conflict resolution**: CRDT semantics ensure automatic convergence after partitions
- **No single point of failure**: No central coordinator; all nodes are peers
- **Graceful degradation**: Nodes operate independently during partitions

### Conflict Resolution Strategies

When replicas can accept writes (multi-primary or logical replication with local modifications), conflicts are inevitable. Common resolution strategies:

| Strategy | Mechanism | Data Loss Risk | Complexity |
|----------|----------|---------------|-----------|
| Last-write-wins (LWW) | Timestamp comparison | Loses concurrent writes | Low |
| Application-level | Custom merge function | Depends on logic | High |
| CRDT-based | Mathematical convergence | None (all writes preserved) | Medium |
| Manual resolution | Queue conflicts for human review | None (but latency) | Low (technically) |

## Usage in Prismatic Platform

### PostgreSQL Streaming Replication

The platform's PostgreSQL database uses streaming replication for high availability on Fly.io. The primary database runs in the closest region to the majority of users, with read replicas in additional regions for latency optimization.

The replication configuration targets:
- **RPO**: Near-zero (async streaming with <2s typical lag)
- **RTO**: <30s (automatic failover via Fly.io's managed PostgreSQL)
- **Read scaling**: `Repo.replica()` directs read-only queries to replicas

Ecto's multi-repo pattern enables transparent read/write splitting:

```elixir
# Write operations always go to primary
PrismaticDd.Repo.insert(changeset)

# Read operations can be routed to replica
PrismaticDd.Repo.replica().all(query)
```

### ETS Registry Reconstruction

ETS-based registries (ToolRegistry, TopicRegistry, SourceRegistry) are node-local by design. In multi-node deployments, each node builds its own registry from compiled BEAM modules at startup. This provides eventual consistency -- a newly deployed module is available on each node after its next restart or hot code reload.

The reconstruction process:
1. Application supervisor starts the registry GenServer
2. GenServer creates the ETS table
3. GenServer scans all loaded modules implementing the relevant behaviour
4. Module metadata is extracted via `@after_compile` hooks and inserted into ETS
5. Registry is ready for queries

### Search Index Replication

Meilisearch indices are not automatically replicated. The platform maintains search index consistency through:

1. **Primary source**: PostgreSQL is the authoritative data source
2. **Index rebuild**: Periodic full reindex from PostgreSQL ensures eventual consistency
3. **Incremental sync**: Change Data Capture (CDC) from PostgreSQL feeds incremental updates
4. **Snapshot backup**: Periodic Meilisearch snapshots provide faster recovery than full rebuild

### Cross-Node State Synchronization

For state that must be consistent across cluster nodes in real-time (not just at startup), the platform uses Phoenix PubSub for event-driven synchronization:

```elixir
# When a DD case is updated on any node
Phoenix.PubSub.broadcast(Prismatic.PubSub, "dd:cases", {:case_updated, case_id, changes})

# All nodes receive the event and update local state
def handle_info({:case_updated, case_id, changes}, socket) do
  # Update LiveView state on the receiving node
  {:noreply, update_case_in_assigns(socket, case_id, changes)}
end
```

## Code Examples

```elixir
defmodule PrismaticStorage.ReplicationMonitor do
  @moduledoc """
  Monitors PostgreSQL replication lag and routes queries accordingly.

  Provides real-time visibility into replication health across all
  standbys, and exposes an API for the query router to determine
  whether replicas are safe for read queries.

  ## Architecture

  The monitor runs as a GenServer that periodically queries the primary
  database for replication status. It tracks per-standby lag metrics
  and emits telemetry events for dashboard integration.

  ## Telemetry Events

      [:prismatic, :replication, :check] - Periodic status check
      [:prismatic, :replication, :lag_spike] - Lag exceeds threshold
      [:prismatic, :replication, :standby_disconnect] - Standby disconnected
  """

  use GenServer
  require Logger

  @check_interval_ms :timer.seconds(5)
  @max_acceptable_lag_ms 1_000
  @lag_spike_threshold_ms 5_000

  @type standby_status :: %{
    client_addr: String.t(),
    state: String.t(),
    replay_lag_ms: non_neg_integer(),
    write_lag_ms: non_neg_integer(),
    flush_lag_ms: non_neg_integer(),
    bytes_behind: non_neg_integer(),
    healthy: boolean()
  }

  @type state :: %{
    standbys: list(standby_status()),
    any_healthy: boolean(),
    last_check_at: DateTime.t() | nil,
    consecutive_failures: non_neg_integer()
  }

  # --- Public API ---

  @doc """
  Starts the replication monitor.

  ## Examples

      iex> PrismaticStorage.ReplicationMonitor.start_link([])
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Returns whether any replica is healthy enough for read queries.

  ## Examples

      iex> PrismaticStorage.ReplicationMonitor.replica_healthy?()
      true
  """
  @spec replica_healthy?() :: boolean()
  def replica_healthy? do
    GenServer.call(__MODULE__, :replica_healthy?)
  end

  @doc """
  Returns detailed status for all connected standbys.

  ## Examples

      iex> standbys = PrismaticStorage.ReplicationMonitor.standby_statuses()
      iex> is_list(standbys)
      true
  """
  @spec standby_statuses() :: list(standby_status())
  def standby_statuses do
    GenServer.call(__MODULE__, :standby_statuses)
  end

  @doc """
  Returns the maximum replication lag across all standbys in milliseconds.

  ## Examples

      iex> PrismaticStorage.ReplicationMonitor.max_lag_ms()
      42
  """
  @spec max_lag_ms() :: non_neg_integer()
  def max_lag_ms do
    GenServer.call(__MODULE__, :max_lag_ms)
  end

  # --- Server Callbacks ---

  @impl true
  def init(_opts) do
    schedule_check()

    {:ok,
     %{
       standbys: [],
       any_healthy: false,
       last_check_at: nil,
       consecutive_failures: 0
     }}
  end

  @impl true
  def handle_call(:replica_healthy?, _from, state) do
    {:reply, state.any_healthy, state}
  end

  @impl true
  def handle_call(:standby_statuses, _from, state) do
    {:reply, state.standbys, state}
  end

  @impl true
  def handle_call(:max_lag_ms, _from, state) do
    max_lag =
      state.standbys
      |> Enum.map(& &1.replay_lag_ms)
      |> Enum.max(fn -> 0 end)

    {:reply, max_lag, state}
  end

  @impl true
  def handle_info(:check_replication, state) do
    case fetch_replication_status() do
      {:ok, standbys} ->
        any_healthy = Enum.any?(standbys, & &1.healthy)

        # Check for lag spikes
        Enum.each(standbys, fn standby ->
          if standby.replay_lag_ms > @lag_spike_threshold_ms do
            Logger.warning(
              "Replication lag spike: #{standby.client_addr} at #{standby.replay_lag_ms}ms",
              domain: [:prismatic, :replication]
            )

            :telemetry.execute(
              [:prismatic, :replication, :lag_spike],
              %{lag_ms: standby.replay_lag_ms},
              %{standby: standby.client_addr}
            )
          end
        end)

        :telemetry.execute(
          [:prismatic, :replication, :check],
          %{standby_count: length(standbys), healthy_count: Enum.count(standbys, & &1.healthy)},
          %{}
        )

        schedule_check()

        {:noreply,
         %{
           state
           | standbys: standbys,
             any_healthy: any_healthy,
             last_check_at: DateTime.utc_now(),
             consecutive_failures: 0
         }}

      {:error, reason} ->
        Logger.error("Failed to fetch replication status: #{inspect(reason)}",
          domain: [:prismatic, :replication]
        )

        schedule_check()
        {:noreply, %{state | consecutive_failures: state.consecutive_failures + 1}}
    end
  end

  # --- Private Helpers ---

  defp fetch_replication_status do
    query = """
    SELECT
      client_addr::text,
      state,
      COALESCE(extract(epoch from replay_lag) * 1000, 0)::integer AS replay_lag_ms,
      COALESCE(extract(epoch from write_lag) * 1000, 0)::integer AS write_lag_ms,
      COALESCE(extract(epoch from flush_lag) * 1000, 0)::integer AS flush_lag_ms,
      COALESCE(pg_wal_lsn_diff(sent_lsn, replay_lsn), 0)::bigint AS bytes_behind
    FROM pg_stat_replication
    ORDER BY replay_lag_ms DESC
    """

    case Ecto.Adapters.SQL.query(PrismaticDd.Repo, query, []) do
      {:ok, %{rows: rows}} ->
        standbys =
          Enum.map(rows, fn [addr, pg_state, replay, write, flush, bytes] ->
            %{
              client_addr: addr || "unknown",
              state: pg_state,
              replay_lag_ms: replay,
              write_lag_ms: write,
              flush_lag_ms: flush,
              bytes_behind: bytes,
              healthy: replay < @max_acceptable_lag_ms
            }
          end)

        {:ok, standbys}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp schedule_check do
    Process.send_after(self(), :check_replication, @check_interval_ms)
  end
end
```

```elixir
defmodule PrismaticStorage.ReadRouter do
  @moduledoc """
  Routes read queries to replicas when they are healthy, falling back
  to the primary when replicas are lagging or unavailable.

  This module implements the read/write splitting pattern where:
  - All write operations go to the primary (always)
  - Read operations go to a healthy replica (when available)
  - Read operations fall back to primary (when no healthy replica)

  ## Read-After-Write Consistency

  For read-after-write consistency (e.g., reading a record immediately
  after inserting it), callers should use `primary_read/1` instead of
  `read/1` to bypass the replica routing.
  """

  @type query_result :: {:ok, term()} | {:error, term()}

  @doc """
  Executes a read query, routing to replica if healthy.

  ## Examples

      iex> PrismaticStorage.ReadRouter.read(fn repo -> repo.all(MySchema) end)
      {:ok, [%MySchema{}, ...]}
  """
  @spec read((module() -> term())) :: query_result()
  def read(query_fn) do
    repo = select_read_repo()
    {:ok, query_fn.(repo)}
  rescue
    e in [Ecto.QueryError, DBConnection.ConnectionError] ->
      {:error, e}
  end

  @doc """
  Executes a read query on the primary, bypassing replica routing.
  Use for read-after-write consistency.

  ## Examples

      iex> PrismaticStorage.ReadRouter.primary_read(fn repo -> repo.get(MySchema, 1) end)
      {:ok, %MySchema{}}
  """
  @spec primary_read((module() -> term())) :: query_result()
  def primary_read(query_fn) do
    {:ok, query_fn.(PrismaticDd.Repo)}
  rescue
    e in [Ecto.QueryError, DBConnection.ConnectionError] ->
      {:error, e}
  end

  @doc """
  Selects the appropriate repo for read queries based on replica health.

  ## Examples

      iex> repo = PrismaticStorage.ReadRouter.select_read_repo()
      iex> repo in [PrismaticDd.Repo, PrismaticDd.Repo.Replica]
      true
  """
  @spec select_read_repo() :: module()
  def select_read_repo do
    if PrismaticStorage.ReplicationMonitor.replica_healthy?() do
      PrismaticDd.Repo.Replica
    else
      PrismaticDd.Repo
    end
  end
end
```

```elixir
defmodule PrismaticStorage.ETSRegistryReplicator do
  @moduledoc """
  Manages ETS registry reconstruction from compiled BEAM modules.

  Unlike database replication which copies data between nodes,
  ETS registries in the Prismatic Platform are reconstructed from
  the source of truth: compiled BEAM modules with metadata set
  via `@after_compile` hooks.

  This approach provides:
  - Zero replication lag (each node has complete data after startup)
  - No network dependency for registry availability
  - Automatic consistency with deployed code version
  - Crash resilience via natural reconstruction on restart
  """

  require Logger

  @type registry_stats :: %{
    table_name: atom(),
    entry_count: non_neg_integer(),
    memory_bytes: non_neg_integer(),
    build_time_ms: non_neg_integer()
  }

  @doc """
  Reconstructs an ETS registry by scanning all loaded modules
  that implement the given behaviour.

  ## Examples

      iex> stats = PrismaticStorage.ETSRegistryReplicator.rebuild(:tool_registry, PrismaticOsintCore.ToolBehaviour)
      iex> stats.entry_count > 0
      true
  """
  @spec rebuild(atom(), module()) :: registry_stats()
  def rebuild(table_name, behaviour) do
    start_time = System.monotonic_time(:millisecond)

    # Ensure table exists
    if :ets.whereis(table_name) == :undefined do
      :ets.new(table_name, [:named_table, :set, :public, read_concurrency: true])
    else
      :ets.delete_all_objects(table_name)
    end

    # Scan all loaded modules for behaviour implementations
    entries =
      :code.all_loaded()
      |> Enum.filter(fn {module, _file} ->
        behaviours = module.module_info(:attributes) |> Keyword.get(:behaviour, [])
        behaviour in behaviours
      end)
      |> Enum.map(fn {module, _file} ->
        metadata = module.metadata()
        :ets.insert(table_name, {module, metadata})
        module
      end)

    build_time = System.monotonic_time(:millisecond) - start_time
    wordsize = :erlang.system_info(:wordsize)

    stats = %{
      table_name: table_name,
      entry_count: length(entries),
      memory_bytes: :ets.info(table_name, :memory) * wordsize,
      build_time_ms: build_time
    }

    Logger.info(
      "Rebuilt #{table_name}: #{stats.entry_count} entries in #{stats.build_time_ms}ms (#{div(stats.memory_bytes, 1024)}KB)",
      domain: [:prismatic, :registry]
    )

    stats
  end

  @doc """
  Verifies that the ETS registry matches the expected module count.

  ## Examples

      iex> PrismaticStorage.ETSRegistryReplicator.verify(:tool_registry, 157)
      {:ok, :consistent}
  """
  @spec verify(atom(), non_neg_integer()) :: {:ok, :consistent} | {:error, :count_mismatch, map()}
  def verify(table_name, expected_count) do
    actual_count = :ets.info(table_name, :size)

    if actual_count == expected_count do
      {:ok, :consistent}
    else
      {:error, :count_mismatch,
       %{expected: expected_count, actual: actual_count, table: table_name}}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Reading after write from replica | Replica may not have the just-written data yet | Use `primary_read/1` for read-after-write; route to primary for critical reads |
| Ignoring replication lag monitoring | Stale reads cause subtle data inconsistency bugs | Monitor lag continuously; route away from lagging replicas |
| Synchronous replication without timeout | Network partition causes primary to hang waiting for standby | Configure `wal_sender_timeout` and use `FIRST 1` in synchronous standby names |
| Assuming ETS replication across nodes | ETS tables are node-local; changes on one node are invisible to others | Use ETS reconstruction from code, or Horde/PubSub for cross-node state |
| Logical replication with DDL changes | Schema changes are not replicated; subscriber breaks | Apply DDL on subscriber first, then publisher |
| No replication slot management | Unused replication slots prevent WAL cleanup, filling disk | Monitor and drop inactive slots; set `max_slot_wal_keep_size` |
| Testing only normal replication, not failover | Failover may fail under real conditions despite normal replication working | Schedule regular failover drills in staging environment |
| Single standby for both HA and read scaling | Standby serving read traffic may have higher lag, reducing HA RPO | Separate standbys for HA (sync, no read traffic) and read scaling (async) |
| Replicating everything when only some tables need it | Wasted bandwidth and storage for non-critical data | Use logical replication with selective publications |
| Not handling replication conflicts in logical replication | Conflicting writes on subscriber cause replication to stop | Implement conflict resolution or ensure subscriber is read-only for replicated tables |

## Best Practices

1. **Monitor replication lag continuously** -- stale reads from lagging replicas cause subtle bugs that are hard to diagnose. Alert at 50% of your acceptable lag threshold, not 100%.

2. **Use synchronous replication for critical writes** -- financial transactions, security events, and compliance records must not risk data loss. Accept the write latency cost for these data categories.

3. **Route reads intentionally** -- use `Repo.replica()` only for queries that tolerate slight staleness. Never use replicas for read-after-write patterns.

4. **Test failover regularly** -- replication only provides availability if the failover process actually works under pressure. Run failover drills monthly in staging.

5. **Set RPO/RTO targets explicitly** -- replication strategy must align with the organization's recovery point and recovery time objectives. Document the relationship.

6. **Manage replication slots** -- unused slots prevent WAL cleanup and can fill the disk. Monitor slot status and set `max_slot_wal_keep_size` as a safety limit.

7. **Separate HA standbys from read replicas** -- a standby serving heavy read traffic may lag more than one dedicated to HA. Use synchronous replication for the HA standby and async for read replicas.

8. **Use ETS reconstruction over replication for metadata** -- when the source of truth is code (registries, tool metadata), reconstruction from compiled modules is simpler and more reliable than distributed replication.

9. **Implement connection-aware query routing** -- when a replica is disconnected or lagging beyond threshold, the query router must transparently fall back to the primary without application-level error handling.

10. **Version your replication topology** -- document the current replication topology (which nodes, which regions, sync vs async) in infrastructure-as-code. Changes to replication topology should go through the same review process as code changes.

## Related Terms

- [WAL](@/glossary/wal.md) -- the Write-Ahead Log that streaming replication transmits
- [RPO](@/glossary/rpo.md) -- Recovery Point Objective that replication strategy determines
- [RTO](@/glossary/rto.md) -- Recovery Time Objective affected by failover mechanisms
- [Rollback](@/glossary/rollback.md) -- reverting to a known good state when replication diverges
- [Storage Adapter](@/glossary/storage-adapter.md) -- abstraction layer that encapsulates replication details
- [Failover](/glossary/failover/) -- automatic switching from primary to standby
- [High Availability](/glossary/high-availability/) -- system design goal that replication enables
- [Consensus](/glossary/consensus/) -- distributed agreement protocol for multi-primary systems
- [ETS](@/glossary/ets.md) -- Erlang Term Storage with node-local scope
- [Mnesia](@/glossary/mnesia.md) -- BEAM's built-in distributed database
- [Horde](/glossary/horde/) -- CRDT-based distributed process registry
- [Retention](@/glossary/retention.md) -- policies governing how long replicated data is kept

## See Also

- [PostgreSQL Replication Documentation](https://www.postgresql.org/docs/current/high-availability.html) -- official PostgreSQL HA guide
- [Platform Architecture](@/architecture/_index.md) -- overall infrastructure and replication design
- [Capabilities](@/capabilities/_index.md) -- replication-dependent platform capabilities
- [Fly.io PostgreSQL](https://fly.io/docs/postgres/) -- managed PostgreSQL replication on Fly.io

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
