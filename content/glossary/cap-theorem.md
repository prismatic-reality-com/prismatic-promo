+++
title = "CAP Theorem"
weight = 32
[extra]
category = "architecture"
description = "Theorem stating distributed systems can guarantee at most two of consistency, availability, and partition tolerance simultaneously"
related_terms = ["distributed-system", "eventual-consistency", "postgresql", "redis", "ets", "cluster", "consensus-algorithm", "circuit-breaker", "fault-tolerance", "beam", "connection-pooling", "load-balancing"]
keywords = ["CAP theorem distributed systems", "consistency availability partition tolerance", "PACELC extension", "Brewer theorem", "distributed database trade-offs", "polyglot persistence CAP", "eventual consistency model", "linearizability distributed"]
tags = ["cap-theorem", "distributed-systems", "architecture", "consistency", "availability", "databases"]
difficulty = "advanced"
audience = ["distributed-systems-architects", "backend-engineers", "database-administrators"]
version = "2.0.0"
last_updated = "2026-02-22"
tldr = "The CAP theorem proves distributed systems must sacrifice either consistency or availability during network partitions; the Prismatic Platform makes per-concern trade-offs using polyglot persistence."
prerequisites = ["distributed-systems-basics", "database-fundamentals", "networking"]
use_cases = ["storage-architecture", "replication-design", "failover-planning", "cache-strategy"]
platform_usage = "high"
platform_components = ["PrismaticStorage.Ecto", "PrismaticStorage.ETS", "PrismaticStorage.Redis", "PrismaticStorage.Meilisearch", "PrismaticStorage.KuzuDB"]
academic_references = ["Brewer 2000", "Gilbert-Lynch 2002", "Abadi 2012 PACELC"]
estimated_reading_time = "14 minutes"
formulated_by = "Eric Brewer (2000), proved by Seth Gilbert and Nancy Lynch (2002)"
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2178
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "CAP Theorem - Prismatic Platform"
+++

## Definition and Overview

The CAP theorem, formulated by Eric Brewer in 2000 and formally proved by Seth Gilbert and Nancy Lynch in 2002, states that a [distributed system](@/glossary/distributed-system.md) can simultaneously guarantee at most two of three properties: Consistency (every read receives the most recent write or an error), Availability (every request receives a non-error response, without guarantee that it contains the most recent write), and Partition tolerance (the system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes). Since network partitions are an unavoidable reality of distributed computing -- hardware fails, cables are cut, switches misconfigure -- the theorem's practical implication is that system designers must choose between consistency and availability during partition events.

The theorem is frequently misunderstood as forcing a binary choice between three options. In reality, the trade-off only activates during a network partition. When the network is healthy, a well-designed system can provide both consistency and availability simultaneously. The meaningful design question is not "which two of three?" but rather "when the network partitions, do we sacrifice consistency or availability?" This nuance led Daniel Abadi to propose the PACELC extension in 2012: if there is a Partition, choose between Availability and Consistency; Else (when the system is running normally), choose between Latency and Consistency. PACELC captures the reality that even during normal operation, stronger consistency requires coordination between nodes, which increases latency.

Understanding CAP is essential for the Prismatic Platform because it operates as a polyglot persistence system where different storage backends make different CAP trade-offs. The platform does not make a single CAP choice -- it makes the appropriate choice for each data concern, ranging from strongly consistent [PostgreSQL](@/glossary/postgresql.md) transactions for security ratings to [eventually consistent](@/glossary/eventual-consistency.md) [ETS](@/glossary/ets-table.md) caches for OSINT data that tolerates brief staleness.

## Historical Context and Formal Proof

Eric Brewer presented the CAP conjecture as a keynote address at the ACM Symposium on Principles of Distributed Computing (PODC) in July 2000. The conjecture was based on Brewer's experience building large-scale internet services at Inktomi, where he observed that engineers consistently struggled with the tension between consistency and availability in distributed architectures. Brewer's insight was that this tension was not merely a practical difficulty but a fundamental theoretical limitation.

Two years later, Seth Gilbert and Nancy Lynch of MIT published a formal proof of Brewer's conjecture in their paper "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services." The proof demonstrates that in an asynchronous network model (where message delivery times are unbounded), no algorithm can simultaneously guarantee all three CAP properties. The proof uses a network partition scenario where two nodes are unable to communicate, showing that either one node must reject requests (sacrificing availability) or both nodes must serve potentially stale data (sacrificing consistency).

The proof formalized what practitioners had long observed empirically: building distributed databases that are both perfectly consistent and perfectly available is impossible in the presence of network failures. This result has shaped the design of every significant distributed data system built since, from Amazon's Dynamo (AP) to Google's Spanner (CP with sophisticated clock synchronization).

## The Three Guarantees

### Consistency (C)

In the CAP context, consistency means linearizability -- the strongest single-object consistency model. Every read operation returns the value of the most recent completed write, regardless of which node services the request. If client A writes value V to the system and client B subsequently reads the same data, client B is guaranteed to see V (or a later value), never an older value.

Achieving consistency requires coordination: after a write, the system must ensure all replicas agree on the new value before acknowledging reads. This coordination is the source of latency and availability trade-offs.

It is important to distinguish CAP consistency from ACID consistency. ACID consistency refers to database integrity constraints (foreign keys, unique constraints, check constraints). CAP consistency refers to the agreement of data across replicas. A system can be ACID-consistent while being CAP-inconsistent (eventually consistent), and vice versa.

### Availability (A)

CAP availability means every request received by a non-failing node must result in a non-error response. The system cannot simply refuse to answer because it cannot reach other nodes to verify consistency. Note that CAP does not specify how quickly the response must arrive -- only that it eventually arrives without an error.

In practice, "available" means the system serves requests even when some nodes or network links are unreachable. An available system never tells the client "I cannot serve you because I cannot reach a quorum."

### Partition Tolerance (P)

Partition tolerance means the system continues to function when network communication between nodes is unreliable -- messages may be lost, delayed, duplicated, or delivered out of order. A network partition divides the [cluster](@/glossary/cluster.md) into two or more groups that cannot communicate with each other.

Partition tolerance is not optional in any real-world distributed system. Networks fail. The question is never "should we be partition-tolerant?" but rather "given that we must tolerate partitions, do we sacrifice C or A when they occur?"

## PACELC Extension

| Condition | Trade-off | Examples |
|-----------|-----------|---------|
| **Partition** | Availability vs. Consistency | Network split forces choice |
| **Else** (normal operation) | Latency vs. Consistency | Coordination adds latency |

The PACELC framework (Abadi, 2012) extends CAP to address normal operation trade-offs:

| System Classification | During Partition | During Normal Operation | Example |
|----------------------|------------------|------------------------|---------|
| **PA/EL** | Available + Partition Tolerant | Low Latency | DynamoDB, Cassandra |
| **PA/EC** | Available + Partition Tolerant | Consistent | Cosmos DB (session consistency) |
| **PC/EL** | Consistent + Partition Tolerant | Low Latency | PNUTS |
| **PC/EC** | Consistent + Partition Tolerant | Consistent | PostgreSQL, traditional RDBMS |

The Prismatic Platform's storage backends span this classification space:

- **[PostgreSQL](@/glossary/postgresql.md)** (PC/EC): Always consistent, accepts higher latency for coordination
- **[ETS](@/glossary/ets-table.md)** (PA/EL): Node-local, always available, no cross-node coordination
- **[Redis](@/glossary/redis.md)** (PA/EL): Available with asynchronous replication, low latency reads
- **Meilisearch** (PA/EL): Eventually consistent search indices, optimized for read latency
- **KuzuDB** (PC/EC): Embedded graph database, node-local consistency

## Consistency Models Spectrum

Between the extremes of strong consistency and eventual consistency lies a spectrum of models that offer different trade-offs between correctness guarantees and performance:

| Model | Guarantee | Latency | Use Case |
|-------|-----------|---------|----------|
| **Linearizability** | Reads see latest write globally | Highest | Financial transactions, security ratings |
| **Sequential consistency** | All operations appear in some total order | High | Audit trails, event logs |
| **Causal consistency** | Causally related operations appear in order | Medium | Collaborative editing, comment threads |
| **Session consistency** | Reads within a session see own writes | Medium-Low | User profiles, preferences |
| **Eventual consistency** | All replicas converge eventually | Lowest | OSINT cache, search indices, metrics |

The Prismatic Platform applies different consistency models to different data domains:

```elixir
defmodule PrismaticStorage.ConsistencyStrategy do
  @moduledoc """
  Maps data domains to appropriate consistency models.
  Each domain chooses the weakest consistency model that
  meets its correctness requirements, maximizing availability.
  """

  @type consistency :: :strong | :session | :eventual

  @spec for_domain(atom()) :: {:ok, consistency()} | {:error, :unknown_domain}
  def for_domain(:security_ratings), do: {:ok, :strong}
  def for_domain(:compliance_assessments), do: {:ok, :strong}
  def for_domain(:audit_trails), do: {:ok, :strong}
  def for_domain(:user_sessions), do: {:ok, :session}
  def for_domain(:osint_cache), do: {:ok, :eventual}
  def for_domain(:search_index), do: {:ok, :eventual}
  def for_domain(:dashboard_metrics), do: {:ok, :eventual}
  def for_domain(:agent_health), do: {:ok, :eventual}
  def for_domain(_unknown), do: {:error, :unknown_domain}
end
```

## Prismatic's Polyglot CAP Strategy

The platform does not make a single CAP trade-off -- it makes the appropriate trade-off for each data concern based on business requirements.

```
+-----------------------------------------------------------+
|                 Prismatic Data Flow                        |
|                                                           |
|  +---------------+     +---------------+                  |
|  |  Write Path    |     |  Read Path    |                 |
|  |                |     |               |                  |
|  |  PostgreSQL    |---->|  ETS Cache    |  (AP, fast)     |
|  |  (CP, strong)  |     |               |                  |
|  |                |---->|  Meilisearch  |  (AP, search)   |
|  |                |     |               |                  |
|  |                |---->|  Redis        |  (AP, shared)   |
|  +---------------+     +---------------+                  |
|                                                           |
|  CP = Authoritative     AP = Read-optimized               |
+-----------------------------------------------------------+
```

### CP Data (Consistency Prioritized)

Data requiring absolute correctness uses [PostgreSQL](@/glossary/postgresql.md) with serializable transaction isolation:

| Data Type | Why CP | Consequence of Inconsistency |
|-----------|--------|------------------------------|
| Security ratings (A-F grades) | Incorrect ratings create liability | Regulatory exposure, client trust damage |
| Compliance assessments (NIS2, ZKB) | Legal compliance data must be authoritative | Legal violations, audit failures |
| Agent configurations | Agents must execute correct policies | Unpredictable platform behavior |
| Audit trails | Immutable provenance chain | Regulatory non-compliance |
| User authentication | Session and credential integrity | Security vulnerability |

```elixir
defmodule PrismaticPerimeter.RatingStore do
  @moduledoc """
  CP write path for security ratings.
  Uses serializable transactions to guarantee linearizability.
  All writes are atomic with their audit trail entries.
  """

  @spec create_rating(map()) :: {:ok, map()} | {:error, term()}
  def create_rating(attrs) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:rating, %SecurityRating{
      domain: attrs.domain,
      grade: attrs.grade,
      score: attrs.score,
      assessed_at: DateTime.utc_now()
    })
    |> Ecto.Multi.insert(:audit, %AuditTrail{
      action: :rating_created,
      entity_type: "SecurityRating",
      provenance: attrs.provenance_chain
    })
    |> Repo.transaction(isolation_level: :serializable)
    |> case do
      {:ok, %{rating: rating}} -> {:ok, rating}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end
end
```

### AP Data (Availability Prioritized)

Data tolerating brief staleness uses ETS, [Redis](@/glossary/redis.md), or Meilisearch:

| Data Type | Why AP | Staleness Tolerance |
|-----------|--------|---------------------|
| OSINT intelligence cache | Source data refreshes hourly | Minutes to hours |
| Search indices | Near-real-time indexing acceptable | Seconds to minutes |
| Dashboard metrics | Approximate counts acceptable | Seconds |
| Agent health status | Best-effort monitoring | Seconds |
| Session state | Sticky sessions bound to specific nodes | N/A (node-local) |

```elixir
defmodule PrismaticOsint.CacheReader do
  @moduledoc """
  AP read path for OSINT intelligence data.
  Reads from ETS cache with TTL-based expiration.
  Falls back to authoritative source on cache miss.
  """

  @spec get_intelligence(binary()) :: {:ok, map()} | {:error, term()}
  def get_intelligence(domain) do
    case PrismaticStorage.ETS.get(:osint_cache, domain) do
      {:ok, cached} when not expired?(cached) ->
        {:ok, cached.data}

      _ ->
        # Cache miss or expired: fetch from authoritative source
        with {:ok, fresh} <- PrismaticPerimeter.discover(domain) do
          PrismaticStorage.ETS.put(:osint_cache, domain, fresh, ttl: :timer.hours(1))
          {:ok, fresh}
        end
    end
  end

  defp expired?(%{inserted_at: inserted_at, ttl: ttl}) do
    DateTime.diff(DateTime.utc_now(), inserted_at, :millisecond) > ttl
  end
end
```

## Practical Implications for OSINT

OSINT intelligence data presents a nuanced CAP challenge. Raw intelligence from sources like Shodan, Censys, and GreyNoise is inherently stale -- the data represents the state of the internet at scan time, which may be hours or days old. Applying strong consistency to inherently stale data adds latency without improving correctness.

The platform therefore treats OSINT data as AP during collection and caching, but applies CP semantics when OSINT data is synthesized into security ratings or compliance assessments. The transition from AP to CP occurs at the analysis boundary:

1. **Collection** (AP): OSINT providers are queried with best-effort availability; cached results served during provider outages
2. **Fusion** (AP): Entity resolution and knowledge graph construction tolerates [eventual consistency](@/glossary/eventual-consistency.md)
3. **Analysis** (CP): Security rating calculation requires consistent input; reads from PostgreSQL authoritative store
4. **Publication** (CP): Published ratings are transactionally consistent with their audit trails

This layered approach means the platform maximizes availability for data ingestion (where timeliness matters more than perfect consistency) while maintaining strict consistency for outputs that have legal and regulatory implications.

## ETS vs. Distributed ETS

A key architectural decision in [BEAM](@/glossary/beam.md) distributed systems is whether to use node-local ETS tables or distributed ETS (Mnesia or Horde-backed distributed ETS).

| Dimension | Local ETS | Distributed ETS |
|-----------|-----------|-----------------|
| **Read latency** | ~0.5 microseconds | ~50-500 microseconds (network hop) |
| **Consistency** | Strong (single node) | Eventual (replication lag) |
| **Availability** | Node-local only | Survives node failure |
| **Capacity** | Bound by single node memory | Aggregated cluster memory |
| **Complexity** | Trivial | Significant (conflict resolution, replication) |

The Prismatic Platform defaults to node-local ETS for read-heavy caches where each node can independently populate its cache from the authoritative [PostgreSQL](@/glossary/postgresql.md) source. This avoids the complexity of distributed ETS while accepting that different nodes may serve slightly different cache contents during the brief window between a write and cache invalidation.

## Consensus and Coordination Costs

Achieving consistency in a distributed system requires [consensus](@/glossary/consensus-algorithm.md) -- agreement among nodes on the order and outcome of operations. Classical consensus protocols (Paxos, Raft) require a majority quorum: in a 3-node cluster, at least 2 nodes must agree on every write. This has measurable latency implications.

| Operation | Local | Cross-datacenter |
|-----------|-------|-------------------|
| ETS read (no consensus) | 0.5 us | 0.5 us |
| PostgreSQL read (local replica) | 0.5 ms | 0.5 ms |
| PostgreSQL write (consensus) | 2-5 ms | 50-200 ms |
| Distributed lock acquisition | 1-5 ms | 50-200 ms |

The platform minimizes consensus operations by structuring data flows so that writes are infrequent relative to reads. A security rating is computed once and read thousands of times. The one-time consistency cost of the write is amortized across many low-latency cached reads.

## Split-Brain Scenarios and Conflict Resolution

When a network partition creates two groups of nodes that can each accept writes independently, the system faces a split-brain scenario. Conflict resolution strategies determine how divergent state is reconciled when the partition heals:

| Strategy | Mechanism | Data Loss Risk | Complexity |
|----------|-----------|---------------|------------|
| **Last-write-wins (LWW)** | Timestamp-based, latest write retained | High (silent overwrites) | Low |
| **Vector clocks** | Causal ordering, conflicts surfaced to application | None (conflicts detected) | Medium |
| **CRDTs** | Conflict-free merge functions | None (mathematically convergent) | High |
| **Manual resolution** | Human reviews conflicts post-healing | None (human decides) | Highest |

The Prismatic Platform avoids split-brain complexity by design: CP data (security ratings, compliance) is written only to PostgreSQL with single-primary topology, making split-brain impossible for authoritative data. AP data (caches) uses last-write-wins with TTL expiration, accepting that brief inconsistency is tolerable and will self-correct when caches expire and refresh from the authoritative source.

## Common Misconceptions

| Misconception | Reality |
|---------------|---------|
| "You must choose 2 of 3" | Trade-off only activates during partitions; normal operation can have both C and A |
| "CP means unavailable" | CP systems reject writes during partition but can serve consistent reads from the majority partition |
| "AP means wrong answers" | AP systems serve the best available data; eventual consistency means they converge to correct state |
| "NoSQL = AP, SQL = CP" | Many NoSQL databases offer tunable consistency; PostgreSQL can be configured for AP with async replicas |
| "Partitions are rare" | In cloud environments, micro-partitions from network congestion are common; design for them |
| "CAP is only about databases" | CAP applies to any distributed system maintaining state, including caches, queues, and service meshes |

## Practical Decision Framework

When designing a new data store or choosing a storage backend for a new feature, apply this decision framework:

1. **Identify the data's truth source.** Is there an authoritative system of record? If yes, the read path can be AP (cache) while the write path is CP (authoritative store).
2. **Quantify staleness tolerance.** Can the application tolerate reading data that is seconds, minutes, or hours old? Higher staleness tolerance enables AP choices with lower latency.
3. **Assess the consequence of inconsistency.** What happens if two clients see different values? If the consequence is regulatory, legal, or financial, choose CP. If the consequence is cosmetic or transient, choose AP.
4. **Consider the read/write ratio.** High read-to-write ratios favor CP writes with AP read caches. High write rates with strong consistency requirements are the most expensive pattern.
5. **Evaluate partition frequency.** In cloud environments, plan for micro-partitions. In single-datacenter deployments, partitions are rarer but still possible.

## Related Terms

- [Distributed System](@/glossary/distributed-system.md) -- Systems governed by CAP constraints
- [Eventual Consistency](@/glossary/eventual-consistency.md) -- AP-side consistency model where replicas converge over time
- [Cluster](@/glossary/cluster.md) -- BEAM node group where CAP trade-offs are realized
- [Consensus Algorithm](@/glossary/consensus-algorithm.md) -- Protocols (Paxos, Raft) enabling CP guarantees
- [PostgreSQL](@/glossary/postgresql.md) -- CP-oriented authoritative data store for the platform
- [Redis](@/glossary/redis.md) -- AP-oriented shared cache with configurable consistency
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern for graceful degradation during partition-induced failures
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System resilience that CAP constrains but does not prevent
- [BEAM](@/glossary/beam.md) -- Virtual machine providing the distribution layer
- [ETS Table](@/glossary/ets-table.md) -- Node-local storage providing AP semantics within a single node
- [Connection Pooling](@/glossary/connection-pooling.md) -- Resource management for CP database connections
- [Load Balancing](@/glossary/load-balancing.md) -- Request distribution affected by CAP trade-offs

## See Also

- [Architecture](@/architecture/_index.md) -- Distributed storage architecture and CAP decisions
- [Technologies](@/technologies/_index.md) -- Storage backend trade-offs and implementations
- [Apps](@/apps/_index.md) -- Applications implementing polyglot persistence

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
