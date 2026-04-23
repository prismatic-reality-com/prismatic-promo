+++
title = "Eventual Consistency"
weight = 31
[extra]
category = "architecture"
description = "Distributed systems guarantee that all nodes converge to the same state given sufficient time, trading strong consistency for availability and partition tolerance."
related_terms = ["distributed-system", "cap-theorem", "event-sourcing", "cqrs", "idempotency", "cluster", "consensus-algorithm", "postgresql", "redis", "broadway", "ets", "pubsub"]
keywords = ["eventual consistency", "distributed systems", "CAP theorem", "CRDT", "replication lag", "convergence", "staleness budget", "conflict resolution"]
use_cases = ["Multi-store architecture", "Distributed agent registry", "Dashboard caching", "Search index updates", "Quality DNA propagation"]
technologies = ["PostgreSQL", "ETS", "Meilisearch", "KuzuDB", "Redis", "Horde", "CRDTs"]
consistency_models = ["eventual", "causal", "session", "monotonic-read", "read-your-writes", "bounded-staleness", "linearizable"]
difficulty = "advanced"
importance = "critical"
domain = "distributed-systems"
category_color = "blue"
version = "1.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
authors = ["Tomas Korcak"]
tags = ["distributed-systems", "consistency", "replication", "architecture", "CAP-theorem"]
prerequisites = ["understanding of distributed systems", "familiarity with database replication", "knowledge of network partitions"]
estimated_reading_time = "14 minutes"
related_apps = ["prismatic_storage_core", "prismatic_storage_ecto", "prismatic_storage_ets", "prismatic_storage_meilisearch"]
related_architectures = ["multi-store consistency", "write-through caching", "CQRS read projections"]
theoretical_foundation = "CAP theorem (Brewer, 2000), CRDTs (Shapiro et al., 2011)"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1524
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Eventual Consistency - Prismatic Platform"
+++

## Definition

Eventual consistency is a consistency model used in [distributed systems](@/glossary/distributed-system.md) where replicas are guaranteed to converge to the same state given sufficient time and no new updates. Unlike strong consistency -- which blocks operations until all replicas agree on the current state -- eventual consistency allows temporary divergence between replicas in exchange for higher availability and lower latency. A client reading from different replicas during the convergence window may observe different values, but once all updates have propagated and no new writes occur, every replica will return the same result.

The model was formalized in the context of the [CAP theorem](@/glossary/cap-theorem.md) (Brewer's theorem), which proves that a distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are inevitable in real distributed systems, designers must choose between strong consistency (CP systems like ZooKeeper) and eventual consistency (AP systems like Cassandra, DynamoDB). Eventual consistency is not a compromise -- it is a deliberate architectural choice that enables systems to remain available and responsive during network partitions, accepting that some reads may return stale data during the convergence period.

The convergence time depends on the system's replication topology, network latency, conflict resolution strategy, and write volume. In practice, most eventually consistent systems converge within milliseconds to seconds under normal conditions. Conflict-free Replicated Data Types (CRDTs) provide a mathematical foundation for eventual consistency by defining data structures that can be updated independently at multiple replicas and merged deterministically without coordination, guaranteeing convergence regardless of update order.

## Theoretical Foundations

The theoretical underpinnings of eventual consistency draw from several decades of distributed systems research. Werner Vogels, CTO of Amazon, popularized the term in his 2008 paper "Eventually Consistent," describing the consistency model that powers Amazon's DynamoDB and other planet-scale systems. However, the concept existed earlier in the distributed systems literature, particularly in the work on Bayou (a weakly consistent replicated storage system developed at Xerox PARC) and in Leslie Lamport's foundational work on distributed clocks and ordering.

The formal definition requires three properties for a system to be eventually consistent:

1. **Eventual Delivery**: Every update applied to one replica is eventually applied to all replicas
2. **Convergence**: Replicas that have received the same set of updates have the same state
3. **Termination**: All updates eventually complete (no infinite loops in merge/reconciliation)

These properties are weaker than strong consistency (linearizability) but stronger than no consistency guarantee at all. The system promises that divergence is temporary, not permanent, and that all replicas will eventually agree on the same state.

The PACELC theorem extends CAP by observing that even when no partition exists, there is still a trade-off between latency and consistency. A system that chooses availability during partitions (PA) must also choose between latency and consistency during normal operation (EL vs EC). The Prismatic Platform makes an explicit PA/EL choice: during partitions, availability is preferred, and during normal operation, lower latency is preferred over strict consistency for read replicas.

## Consistency Model Spectrum

Eventual consistency exists on a spectrum of consistency guarantees, from weakest to strongest:

| Model | Guarantee | Latency | Availability | Example System |
|-------|-----------|---------|-------------|---------------|
| **Eventual** | Replicas converge eventually | Lowest | Highest | DynamoDB, Cassandra |
| **Causal** | Causally related ops seen in order | Low | High | MongoDB (causal sessions) |
| **Session** | Reads within a session see own writes | Low | High | Client-side caching |
| **Monotonic Read** | Once a value is seen, newer values follow | Low | High | Read replicas with version tracking |
| **Read-Your-Writes** | Writer sees own updates immediately | Medium | High | Prismatic ETS write-through |
| **Bounded Staleness** | Replicas lag by at most N seconds/versions | Medium | Medium | Azure CosmosDB |
| **Linearizable** | All ops appear to execute atomically in order | Highest | Lowest | PostgreSQL single-node |

Each level in the spectrum provides stronger guarantees at the cost of higher latency and lower availability. The art of distributed system design lies in choosing the appropriate consistency level for each use case within the application, rather than applying a single model uniformly.

## CRDTs: Mathematical Foundation

CRDTs (Conflict-free Replicated Data Types) provide the theoretical foundation for guaranteed convergence without coordination. A CRDT is a data structure whose merge operation satisfies three mathematical properties: commutativity (order of merges does not matter), associativity (grouping of merges does not matter), and idempotency (merging the same update twice has no additional effect). These properties guarantee that any two replicas that have received the same set of updates will have the same state, regardless of the order in which updates were received or merged.

```elixir
defmodule PrismaticDistributed.GCounter do
  @moduledoc """
  Grow-only counter CRDT for distributed metric aggregation.
  Each node maintains its own counter; the total is the sum of all nodes.
  Merge takes the maximum per node, guaranteeing convergence.

  Mathematical properties:
  - Commutative: merge(a, b) == merge(b, a)
  - Associative: merge(merge(a, b), c) == merge(a, merge(b, c))
  - Idempotent: merge(a, a) == a
  """

  @type t :: %{node_id() => non_neg_integer()}
  @type node_id :: atom()

  @spec new() :: t()
  def new, do: %{}

  @spec increment(t(), node_id()) :: t()
  def increment(counter, node) do
    Map.update(counter, node, 1, &(&1 + 1))
  end

  @spec value(t()) :: non_neg_integer()
  def value(counter) do
    counter |> Map.values() |> Enum.sum()
  end

  @spec merge(t(), t()) :: t()
  def merge(counter_a, counter_b) do
    Map.merge(counter_a, counter_b, fn _node, a, b -> max(a, b) end)
  end
end

defmodule PrismaticDistributed.ORSet do
  @moduledoc """
  Observed-Remove Set CRDT for distributed set membership.
  Supports both add and remove operations with unique tags
  to resolve concurrent add/remove conflicts.
  """

  @type t :: %{elements: %{term() => MapSet.t()}, tombstones: %{term() => MapSet.t()}}

  @spec new() :: t()
  def new, do: %{elements: %{}, tombstones: %{}}

  @spec add(t(), term(), term()) :: t()
  def add(set, element, unique_tag) do
    elements = Map.update(set.elements, element, MapSet.new([unique_tag]), &MapSet.put(&1, unique_tag))
    %{set | elements: elements}
  end

  @spec remove(t(), term()) :: t()
  def remove(set, element) do
    case Map.get(set.elements, element) do
      nil ->
        set

      tags ->
        tombstones = Map.update(set.tombstones, element, tags, &MapSet.union(&1, tags))
        elements = Map.delete(set.elements, element)
        %{set | elements: elements, tombstones: tombstones}
    end
  end

  @spec merge(t(), t()) :: t()
  def merge(set_a, set_b) do
    merged_elements = Map.merge(set_a.elements, set_b.elements, fn _k, a, b ->
      MapSet.union(a, b)
    end)
    merged_tombstones = Map.merge(set_a.tombstones, set_b.tombstones, fn _k, a, b ->
      MapSet.union(a, b)
    end)

    # Remove tombstoned tags from elements
    cleaned_elements =
      Enum.reduce(merged_tombstones, merged_elements, fn {elem, tombstone_tags}, acc ->
        case Map.get(acc, elem) do
          nil -> acc
          tags ->
            remaining = MapSet.difference(tags, tombstone_tags)
            if MapSet.size(remaining) == 0, do: Map.delete(acc, elem), else: Map.put(acc, elem, remaining)
        end
      end)

    %{elements: cleaned_elements, tombstones: merged_tombstones}
  end
end
```

| CRDT Type | Operations | Merge Strategy | Use in Prismatic |
|-----------|-----------|----------------|-----------------|
| **G-Counter** | Increment only | Max per node | Distributed metric counters |
| **PN-Counter** | Increment and decrement | Pair of G-Counters | Agent activation tracking |
| **G-Set** | Add only | Union | Asset discovery sets |
| **OR-Set** | Add and remove | Observed-remove | Agent registry (Horde) |
| **LWW-Register** | Last-write-wins | Timestamp comparison | Configuration values |
| **MV-Register** | Multi-value | Preserve all concurrent values | Conflict detection |

## Implementation in Prismatic Platform

The Prismatic Platform uses eventual consistency in its multi-store architecture as a deliberate design choice. The authoritative data store is [PostgreSQL](@/glossary/postgresql.md), which provides strong consistency for critical writes. Read-optimized stores -- ETS caches, Meilisearch search indices, [KuzuDB](@/glossary/knowledge-graph.md) graph projections, and [Redis](@/glossary/redis.md) caches -- are eventually consistent with PostgreSQL, accepting brief staleness in exchange for query performance and specialized access patterns.

The AIAD agent registry exemplifies this pattern: it is loaded from persistent storage into ETS at boot time and refreshed periodically, accepting that newly registered agents may not be discoverable for a brief window (typically under 1 second). Quality DNA state propagates eventually across session boundaries through file-based persistence, and the [autoevolve](@/glossary/autoevolve.md) system accepts eventual convergence of quality metrics across the umbrella. When running in distributed mode with Horde, agent process registrations use CRDT-based consensus for eventual consistency across [cluster](@/glossary/cluster.md) nodes.

## Prismatic Multi-Store Consistency Architecture

The platform's consistency architecture uses PostgreSQL as the source of truth with eventually consistent read stores:

```
Write Path (Strong Consistency):
  Client --> Phoenix Endpoint --> Ecto --> PostgreSQL (authoritative)

Read Paths (Eventually Consistent):
  Client --> ETS Cache         (staleness: < 1s, refreshed on write + periodic)
  Client --> Meilisearch       (staleness: < 5s, indexed via Broadway pipeline)
  Client --> KuzuDB Graph      (staleness: < 30s, projected from Ecto changes)
  Client --> Redis Cache       (staleness: TTL-based, invalidated on write)
```

| Store | Role | Staleness Budget | Refresh Mechanism |
|-------|------|-----------------|-------------------|
| **PostgreSQL** | Source of truth | 0 (strongly consistent) | N/A |
| **ETS** | Fast local cache | < 1 second | Write-through + periodic refresh |
| **Meilisearch** | Full-text search | < 5 seconds | [Broadway](@/glossary/broadway.md) indexing pipeline |
| **KuzuDB** | Graph queries | < 30 seconds | Batch graph projection |
| **Redis** | Distributed cache | TTL-based (configurable) | TTL expiration + explicit invalidation |

## Conflict Resolution Strategies

When replicas diverge, conflicts must be resolved to achieve convergence. The choice of conflict resolution strategy depends on the data semantics and the acceptable trade-offs between simplicity and correctness:

| Strategy | Description | Trade-off | Prismatic Usage |
|----------|-------------|-----------|----------------|
| **Last-Writer-Wins** | Timestamp-based; latest write wins | May lose concurrent updates | Redis cache values |
| **Merge Function** | Application-specific merge logic | Complex but preserves intent | Agent state reconciliation |
| **CRDT Merge** | Mathematically guaranteed convergence | Limited data structure types | Horde process registry |
| **Version Vector** | Track causal history per replica | Detects conflicts for manual resolution | Quality DNA cross-session merge |
| **Application Resolution** | Human or application decides | Most flexible, highest latency | Intelligence entity resolution |
| **Semantic Resolution** | Domain-aware merge using business rules | High accuracy, high complexity | Security rating aggregation |

## Consistency Patterns in Practice

### Write-Through Cache

```elixir
defmodule PrismaticStorage.WriteThroughCache do
  @moduledoc """
  Write-through ETS cache with eventual consistency guarantees.
  Writes go to PostgreSQL first (strong consistency), then update
  the local ETS cache (immediate local consistency) and broadcast
  an invalidation message to other nodes (eventual cluster consistency).
  """

  @spec put(String.t(), term()) :: {:ok, term()} | {:error, term()}
  def put(key, value) do
    with :ok <- PrismaticStorage.Ecto.put(key, value),
         true <- :ets.insert(:cache_table, {key, value, System.monotonic_time()}) do
      Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, "cache:invalidation", {:invalidate, key})
      {:ok, value}
    else
      {:error, reason} -> {:error, reason}
      false -> {:error, :ets_insert_failed}
    end
  end

  @spec get(String.t()) :: {:ok, term()} | {:error, :not_found}
  def get(key) do
    case :ets.lookup(:cache_table, key) do
      [{^key, value, _ts}] -> {:ok, value}
      [] -> PrismaticStorage.Ecto.get(key)
    end
  end

  @spec handle_invalidation(String.t()) :: :ok
  def handle_invalidation(key) do
    :ets.delete(:cache_table, key)
    :ok
  end
end
```

### Read-Your-Writes Consistency

The platform ensures that within a single user session, writes are immediately visible to the writer, even though other users may see stale data:

| Scenario | Consistency Level | Mechanism |
|----------|------------------|-----------|
| **Same process** | Immediate | ETS write-through in same process |
| **Same node** | < 1ms | ETS table shared across processes |
| **Cross-node** | < 100ms | PubSub-based cache invalidation |
| **Cross-store** | < 5s | Broadway pipeline processing delay |

### Convergence Verification

```elixir
defmodule PrismaticStorage.ConvergenceMonitor do
  @moduledoc """
  Monitors convergence lag between the source of truth (PostgreSQL)
  and eventually consistent read stores. Emits telemetry events
  for staleness budget violations.
  """

  use GenServer

  @check_interval_ms 10_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{last_check: nil, violations: []}}
  end

  @impl true
  def handle_info(:check_convergence, state) do
    violations =
      Enum.flat_map(configured_stores(), fn {store, budget_ms} ->
        case measure_staleness(store) do
          {:ok, staleness_ms} when staleness_ms > budget_ms ->
            :telemetry.execute(
              [:prismatic, :storage, :staleness_violation],
              %{staleness_ms: staleness_ms, budget_ms: budget_ms},
              %{store: store}
            )
            [{store, staleness_ms, budget_ms}]

          _ ->
            []
        end
      end)

    schedule_check()
    {:noreply, %{state | last_check: DateTime.utc_now(), violations: violations}}
  end

  defp configured_stores do
    [
      {:ets, 1_000},
      {:meilisearch, 5_000},
      {:kuzudb, 30_000},
      {:redis, 60_000}
    ]
  end

  defp measure_staleness(store) do
    # Compare latest version in PostgreSQL vs read store
    {:ok, 0}
  end

  defp schedule_check do
    Process.send_after(self(), :check_convergence, @check_interval_ms)
  end
end
```

## Monitoring Convergence

Effective use of eventual consistency requires monitoring the convergence lag:

| Metric | Measurement | Alert Threshold |
|--------|-------------|----------------|
| **Replication Lag** | Time since last sync per store | > 10x staleness budget |
| **Stale Read Rate** | % of reads returning outdated data | > 5% during normal operation |
| **Convergence Time** | Time from write to all stores consistent | > 30 seconds |
| **Conflict Rate** | Conflicts requiring resolution per hour | > 100/hour |
| **Budget Violations** | Count of staleness budget exceedances | > 0 per minute |

## Anti-Patterns and Pitfalls

Several common mistakes arise when working with eventually consistent systems:

**Assuming Immediate Consistency**: Reading from a cache immediately after writing to the database and expecting the updated value. The write-through pattern mitigates this for local reads but does not help for cross-node reads.

**Missing Staleness Budgets**: Operating without explicit staleness budgets makes it impossible to reason about system behavior or detect degradation. Every read store must have a documented staleness budget.

**Ignoring Conflict Resolution**: Assuming that conflicts will not occur because writes are infrequent. In a distributed system, conflicts can arise from any concurrent operation, including automated processes.

**Over-Relying on Timestamps**: Using wall-clock timestamps for conflict resolution without accounting for clock skew between nodes. Logical clocks or version vectors provide stronger ordering guarantees.

**Silent Data Loss**: Last-Writer-Wins conflict resolution silently discards concurrent updates. For data where every update matters, use CRDTs or application-level merge functions instead.

## Best Practices

**Define Staleness Budgets Per Store**: Assign explicit maximum acceptable staleness to each read store (e.g., ETS < 1 second, Meilisearch < 5 seconds). Monitor actual convergence times against these budgets and alert when budgets are exceeded.

**Implement Read-Your-Writes for User-Facing Mutations**: After a user performs a write operation, ensure the response reflects the updated state by reading from the write model rather than an eventually consistent cache, preventing confusing UI states.

**Use CRDTs for Coordination-Free Convergence**: When data structures support it, use CRDTs (via Horde or custom implementations) to guarantee convergence without requiring coordination protocols. CRDTs eliminate the possibility of conflicting updates by mathematical construction.

**Monitor Convergence Lag Continuously**: Track replication lag, stale read rate, and convergence time as operational metrics. Increasing lag indicates infrastructure degradation that may lead to user-visible staleness.

**Choose the Right Consistency Level Per Operation**: Not every read needs eventual consistency, and not every read needs strong consistency. Design APIs that allow callers to specify their consistency requirements, routing strong-consistency reads to PostgreSQL and eventual-consistency reads to caches.

## Use Cases

- **Multi-Store Architecture**: Maintaining eventually consistent read replicas across ETS, Meilisearch, KuzuDB, and Redis from the authoritative PostgreSQL write store
- **Distributed Agent Registry**: Using CRDT-based convergence via Horde for distributed process registrations across cluster nodes
- **Quality DNA Propagation**: Propagating quality metric snapshots across session boundaries through file-based persistence with eventual convergence
- **Dashboard Caching**: Serving pre-computed dashboard metrics from ETS caches with periodic refresh, accepting brief staleness for sub-millisecond read latency
- **Search Index Updates**: Maintaining Meilisearch full-text search indices through Broadway pipeline processing with configurable indexing delay

## Related Concepts

- [Distributed System](@/glossary/distributed-system.md) - Systems where eventual consistency is a design choice
- [CAP Theorem](@/glossary/cap-theorem.md) - Theoretical foundation for consistency trade-offs
- [Consensus Algorithm](@/glossary/consensus-algorithm.md) - Protocols for achieving agreement in distributed systems
- [Event Sourcing](@/glossary/event-sourcing.md) - Event replay enables consistency recovery
- [CQRS](@/glossary/cqrs.md) - Read models are typically eventually consistent with write models
- [Idempotency](@/glossary/idempotency.md) - Enables safe retry during convergence
- [Cluster](@/glossary/cluster.md) - BEAM cluster nodes maintaining eventually consistent state
- [PostgreSQL](@/glossary/postgresql.md) - Strongly consistent authoritative store
- [Redis](@/glossary/redis.md) - Eventually consistent distributed cache
- [Broadway](@/glossary/broadway.md) - Pipeline for propagating updates to read stores
- [PubSub](@/glossary/pubsub.md) - Cache invalidation messaging for convergence acceleration
- [ETS](@/glossary/ets.md) - In-memory cache with sub-millisecond read latency

## See Also

- [Architecture](@/architecture/_index.md) - Distributed consistency design patterns
- [Technologies](@/technologies/_index.md) - Multi-store consistency approaches
- [Capabilities](@/capabilities/_index.md) - Platform resilience and availability capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
