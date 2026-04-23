+++
title = "Polyglot Persistence: Four Storage Adapters Behind One API"
date = 2026-04-09
description = "PostgreSQL for truth, ETS for speed, Meilisearch for search, KuzuDB for relations. One storage trait behind all four. Here's the pattern that keeps the calling code boring."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["storage", "polyglot", "adapter-pattern", "architecture", "traits"]
reading_time = "7 min"
keywords = ["polyglot persistence", "storage adapter", "multi-database", "trait pattern"]
image = "/images/blog/polyglot-persistence.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["adapter-pattern", "postgresql", "ets", "meilisearch", "kuzudb"]
image_alt = "Polyglot Persistence with Four Adapters"
+++

"Just use Postgres" is excellent advice until your workload has four different access patterns. Prismatic has exactly four: long-lived truth ([PostgreSQL](@/glossary/postgresql.md)), hot reads ([ETS](@/glossary/ets.md)), full-text search ([Meilisearch](@/glossary/meilisearch.md)), and graph traversal ([KuzuDB](@/glossary/kuzudb.md)). Mixing them under one storage trait keeps the calling code boring — which is the point.

## The trait

```elixir
defmodule Prismatic.Storage.Trait do
  @callback get(key :: term) :: {:ok, term} | {:error, :not_found}
  @callback put(key :: term, value :: term) :: :ok | {:error, term}
  @callback delete(key :: term) :: :ok
  @callback query(filter :: map) :: {:ok, [term]} | {:error, term}
  @callback search(query :: String.t(), opts :: keyword) :: {:ok, [term]}
end
```

Every [adapter](@/glossary/adapter-pattern.md) implements this behaviour. The caller never knows which one answers — it gets the same tuple shape regardless. That single constraint is what makes polyglot persistence feasible instead of chaotic.

## Adapter per access pattern

- **Postgres** — source of truth. Every write lands here first. Every other adapter derives from it.
- **ETS** — hot cache for "am I authorized", "what's the current rate limit", "what's the last-known state of this monitor". In-memory, sub-microsecond.
- **Meilisearch** — full-text and fuzzy search. Populated by a Broadway pipeline fed from Postgres WAL.
- **KuzuDB** — relationship traversal for DD. Populated by the same pipeline.

The golden rule: derived adapters are rebuildable. Delete ETS — it refills on next read. Delete Meilisearch — it reindexes from Postgres. Delete Kuzu — it rebuilds from relationship rows. Only Postgres is load-bearing. Everything else is a cache with extra steps.

## The write path

```elixir
def create_entity(attrs) do
  Ecto.Multi.new()
  |> Ecto.Multi.insert(:row, Entity.changeset(%Entity{}, attrs))
  |> Ecto.Multi.run(:publish, fn _repo, %{row: row} ->
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "entity:created", row)
    {:ok, row}
  end)
  |> Repo.transaction()
end
```

The write goes to Postgres in a transaction and publishes over PubSub. Subscribers — ETS cache invalidator, Meilisearch indexer, Kuzu upsert worker — react asynchronously. They can fall behind without corrupting anything, because Postgres is still the truth. This is "eventual consistency, strong source of truth," and it is the shape you want.

## When NOT to go polyglot

Polyglot persistence is a tax. Four adapters means four places to debug, four sets of connection pools, four migration stories. Pay the tax only when a single store cannot serve a workload within budget. If Postgres can do both the truth and the search, keep it on Postgres. Add adapters when, and only when, the workload requires it.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — the trait in practice
- **Glossary**: [Adapter Pattern](@/glossary/adapter-pattern.md), [PostgreSQL](@/glossary/postgresql.md), [ETS](@/glossary/ets.md), [Meilisearch](@/glossary/meilisearch.md), [KuzuDB](@/glossary/kuzudb.md)

Four stores. One trait. Boring callers. That is the whole trick.
