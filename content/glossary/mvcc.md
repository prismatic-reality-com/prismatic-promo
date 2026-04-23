+++
title = "MVCC (Multi-Version Concurrency Control)"
weight = 50
[extra]
description = "Database concurrency mechanism that maintains multiple versions of data rows, allowing readers and writers to operate without blocking each other."
category = "database"
related_terms = ["postgresql", "transaction", "isolation-level", "deadlock"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MVCC", "concurrency control", "PostgreSQL", "transactions", "database", "glossary", "Prismatic Platform"]
tags = ["glossary", "database"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "MVCC - Prismatic Platform"
+++

## Definition & Overview

Multi-Version Concurrency Control (MVCC) is a database concurrency mechanism where each transaction sees a snapshot of the data as it existed at the transaction's start time, regardless of concurrent modifications by other transactions. Rather than locking rows to prevent concurrent access, MVCC maintains multiple versions of each row, allowing readers to proceed without blocking writers and writers to proceed without blocking readers. This approach dramatically improves throughput for read-heavy workloads while maintaining full ACID transaction guarantees.

MVCC is the concurrency control strategy used by PostgreSQL, Oracle, MySQL/InnoDB, and most modern relational databases. In PostgreSQL's implementation, when a row is updated, the old version is not overwritten. Instead, a new version is created with updated transaction metadata (xmin, xmax), and the old version remains visible to transactions that started before the update. This approach means reads never block writes and writes never block reads, achieving high concurrency without lock contention.

The Prismatic Platform relies heavily on MVCC for its concurrent workloads. The DD pipeline may be loading entity records while the OSINT toolbox is querying the same tables for search results. The Perimeter module runs security assessments that read asset data while the asset discovery process writes new findings. MVCC ensures these concurrent operations proceed without interference, maintaining both performance and data consistency.

## Technical Deep Dive

PostgreSQL's MVCC implementation assigns each transaction a unique transaction ID (XID). Each row version carries two XIDs: `xmin` (the transaction that created this version) and `xmax` (the transaction that deleted or replaced this version, or 0 if the version is still current). When a transaction reads a row, it determines visibility by comparing the row's XIDs against the transaction's snapshot, which records which transactions were committed at snapshot time.

A row version is visible to a transaction if: (1) the creating transaction (xmin) committed before the snapshot, AND (2) the deleting transaction (xmax) either has not committed or committed after the snapshot. This visibility check happens on every row access, making it performance-critical. PostgreSQL optimizes it through hint bits cached on row tuples and the visibility map that tracks all-visible pages.

```elixir
defmodule PrismaticDd.ConcurrentPipeline do
  @moduledoc """
  Demonstrates MVCC-safe concurrent operations in the DD pipeline.
  Multiple processes can safely read and write entities concurrently
  because PostgreSQL's MVCC ensures snapshot isolation.
  """

  alias PrismaticDd.Repo
  alias PrismaticDd.Schemas.EntityRecord

  import Ecto.Query

  @doc """
  Loads new entities while concurrent readers see a consistent
  snapshot. MVCC ensures readers are not blocked by the writes
  and vice versa.
  """
  @spec concurrent_load_and_query(atom(), String.t()) ::
    {:ok, %{loaded: non_neg_integer(), queried: non_neg_integer()}}
  def concurrent_load_and_query(source_group, search_term) do
    # These tasks run concurrently, both accessing dd_entities
    load_task = Task.async(fn ->
      load_entities_from_source(source_group)
    end)

    query_task = Task.async(fn ->
      # This query sees a consistent snapshot even while
      # load_task is inserting rows
      search_entities(search_term)
    end)

    {:ok, loaded} = Task.await(load_task, 60_000)
    {:ok, results} = Task.await(query_task, 60_000)

    {:ok, %{loaded: loaded, queried: length(results)}}
  end

  @doc """
  Uses Ecto transactions with explicit isolation levels
  for operations requiring stronger consistency guarantees.
  """
  @spec serializable_update(String.t(), map()) :: {:ok, EntityRecord.t()} | {:error, term()}
  def serializable_update(entity_id, attrs) do
    Repo.transaction(
      fn ->
        # SERIALIZABLE isolation: detects write conflicts
        entity =
          from(e in EntityRecord,
            where: e.id == ^entity_id,
            lock: "FOR UPDATE"
          )
          |> Repo.one!()

        entity
        |> EntityRecord.changeset(attrs)
        |> Repo.update!()
      end,
      isolation_level: :serializable
    )
  rescue
    Ecto.StaleEntryError ->
      {:error, :concurrent_modification}

    Postgrex.Error ->
      {:error, :serialization_failure}
  end

  defp load_entities_from_source(group) do
    # Bulk insert within a transaction
    Repo.transaction(fn ->
      records = fetch_from_source(group)
      {count, _} = Repo.insert_all(EntityRecord, records)
      {:ok, count}
    end)
  end

  defp search_entities(term) do
    from(e in EntityRecord,
      where: ilike(e.name, ^"%#{term}%"),
      limit: 100,
      select: [:id, :name, :entity_type]
    )
    |> Repo.all()
    |> then(&{:ok, &1})
  end

  defp fetch_from_source(_group), do: []
end
```

The trade-off of MVCC is increased storage: old row versions accumulate until they are no longer visible to any active transaction. PostgreSQL's VACUUM process reclaims space from dead row versions. The autovacuum daemon runs this automatically, but heavily updated tables may require tuned autovacuum parameters to prevent table bloat. The Prismatic Platform configures aggressive autovacuum settings for tables with high write rates (dd_fetch_records, dd_entities).

## Architecture & Implementation

MVCC behavior varies with the transaction isolation level. PostgreSQL supports four levels: READ UNCOMMITTED (treated as READ COMMITTED in PostgreSQL), READ COMMITTED (default, sees committed data as of each statement), REPEATABLE READ (sees committed data as of the transaction start), and SERIALIZABLE (full serialization, detects all anomalies). The Prismatic Platform uses READ COMMITTED for most operations (adequate for independent queries) and upgrades to SERIALIZABLE for critical operations like security score updates where write-write conflicts could produce inconsistent scores.

Understanding MVCC is essential for avoiding common pitfalls. Long-running transactions hold snapshots that prevent VACUUM from reclaiming old row versions, causing table bloat. The platform's query timeout settings ensure no transaction runs longer than 30 seconds, preventing snapshot retention problems. Advisory locks are used for application-level coordination where MVCC's optimistic approach would cause excessive retry overhead.

The ETS-based caches in the platform operate outside MVCC entirely, providing eventual consistency for read-heavy paths. When strong consistency is required, the platform reads directly from PostgreSQL, leveraging MVCC for concurrent access. This dual-layer strategy provides both the performance of in-memory access and the consistency guarantees of MVCC when needed.

## Usage in Prismatic Platform

MVCC-aware batch operations in the DD pipeline:

```elixir
defmodule PrismaticDd.Repo.Operations do
  @moduledoc """
  MVCC-aware database operations for the DD pipeline.
  Handles concurrent writes with proper conflict resolution.
  """

  alias PrismaticDd.Repo

  @doc """
  Upserts entities with MVCC-compatible conflict resolution.
  Uses ON CONFLICT to handle concurrent inserts gracefully.
  """
  @spec upsert_entity(map()) :: {:ok, map()} | {:error, term()}
  def upsert_entity(attrs) do
    Repo.insert(
      %PrismaticDd.Schemas.EntityRecord{}
      |> PrismaticDd.Schemas.EntityRecord.changeset(attrs),
      on_conflict: [
        set: [
          attributes: attrs.attributes,
          content_hash: attrs.content_hash,
          updated_at: DateTime.utc_now()
        ]
      ],
      conflict_target: [:source_slug, :external_id],
      returning: true
    )
  end

  @doc """
  Batch upsert within a single transaction.
  MVCC ensures concurrent reads see either all or none
  of the batch (transaction atomicity).
  """
  @spec batch_upsert([map()]) :: {:ok, non_neg_integer()} | {:error, term()}
  def batch_upsert(entities) when is_list(entities) do
    Repo.transaction(fn ->
      entities
      |> Enum.chunk_every(1000)
      |> Enum.reduce(0, fn chunk, acc ->
        {count, _} = Repo.insert_all(
          PrismaticDd.Schemas.EntityRecord,
          chunk,
          on_conflict: :replace_all,
          conflict_target: [:source_slug, :external_id]
        )
        acc + count
      end)
    end)
  end
end
```

MVCC is invisible to most application code when using Ecto, but understanding it is essential for performance tuning, debugging concurrency issues, and designing batch operations that maintain consistency under concurrent access.

## Cross-References

- [PostgreSQL](/glossary/postgresql/) - Primary database using MVCC
- **Transaction** - ACID unit of work managed by MVCC
- **Isolation Level** - Controls MVCC snapshot behavior
- [Index Scan](/glossary/index-scan/) - Query execution affected by MVCC visibility checks
- [Ecto](/glossary/ecto/) - Elixir database layer abstracting MVCC details

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
