+++
title = "ETS-Backed Registries: Sub-Millisecond Data Access in Elixir"
date = 2026-03-05
description = "How Prismatic uses ETS tables as high-performance registries for agents, OSINT adapters, blog articles, and platform metrics. Patterns for compile-time loading, lazy initialization, and concurrent reads."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["elixir", "ets", "performance", "registry", "otp", "concurrency"]
reading_time = "9 min"
keywords = ["Elixir ETS tables", "ETS registry pattern", "high-performance Elixir", "in-memory data store", "concurrent reads Elixir", "ETS vs GenServer"]
image = "/images/blog/ets-registries.png"
word_count = 1600
date_created = "2026-03-05"
date_modified = "2026-03-05"
quality_score = 86
see_also = ["architecture", "developers", "capabilities"]
image_alt = "ETS-Backed Registries: Sub-Millisecond Data Access in Elixir - Prismatic Platform"
+++

Erlang Term Storage (ETS) is one of the most underappreciated features of the BEAM virtual machine. While most Elixir tutorials mention it briefly, few explore its use as a high-performance registry for application data. This post describes how Prismatic uses ETS tables to serve 552 agents, 157 OSINT adapters, and blog articles with sub-millisecond access times.

## Why Not GenServer?

The instinct in Elixir is to reach for a GenServer when you need shared state. For registries, this creates a bottleneck:

```elixir
# Anti-pattern: GenServer as read-heavy registry
defmodule AgentRegistry do
  use GenServer

  def get_agent(slug), do: GenServer.call(__MODULE__, {:get, slug})

  def handle_call({:get, slug}, _from, state) do
    {:reply, Map.get(state.agents, slug), state}
  end
end
```

This serializes all reads through a single process. Under load, the GenServer mailbox backs up and response times degrade.

ETS tables support concurrent reads from any process without serialization:

```elixir
# Preferred: ETS for read-heavy registries
:ets.lookup(:agent_registry, slug)
```

## The Registry Pattern

Prismatic uses a consistent pattern for all ETS-backed registries:

```elixir
defmodule Prismatic.Blog.Articles do
  @table_name :blog_articles

  @doc "Ensure the ETS table exists (lazy initialization)"
  @spec ensure_table() :: :ok
  def ensure_table do
    case :ets.whereis(@table_name) do
      :undefined ->
        :ets.new(@table_name, [
          :set,
          :public,
          :named_table,
          read_concurrency: true
        ])
      _ref -> :ok
    end
    :ok
  end

  @doc "List all articles sorted by date"
  @spec list_articles() :: [article()]
  def list_articles do
    ensure_table()
    :ets.tab2list(@table_name)
    |> Enum.map(fn {_key, article} -> article end)
    |> Enum.sort_by(& &1.published_at, {:desc, Date})
  end

  @doc "Get a single article by slug"
  @spec get_article(String.t()) :: {:ok, article()} | {:error, :not_found}
  def get_article(slug) do
    ensure_table()
    case :ets.lookup(@table_name, slug) do
      [{^slug, article}] -> {:ok, article}
      [] -> {:error, :not_found}
    end
  end
end
```

Key design decisions:

1. **`:public` access** -- any process can read without message passing
2. **`read_concurrency: true`** -- optimizes for concurrent reads (the common case)
3. **`:named_table`** -- allows lookup by atom name instead of table reference
4. **Lazy initialization** -- `ensure_table/0` creates the table on first access

## Compile-Time Loading

For data that does not change at runtime, we load it at compile time:

```elixir
defmodule Prismatic.Blog.Articles do
  @articles PostsBatch1.articles() ++ PostsBatch2.articles() ++ PostsBatch3.articles()

  def load_articles do
    ensure_table()
    Enum.each(@articles, fn article ->
      :ets.insert(@table_name, {article.slug, article})
    end)
  end
end
```

The articles are defined as Elixir data structures in batch modules. At compile time, they become module attributes. At application startup, they are inserted into ETS. The result: article lookups are O(1) hash table operations returning in microseconds.

## Performance Characteristics

ETS provides predictable performance:

| Operation | Time Complexity | Typical Latency |
|-----------|----------------|-----------------|
| Lookup by key | O(1) | 1-5 microseconds |
| Insert | O(1) | 1-5 microseconds |
| Full table scan | O(n) | Linear with table size |
| Match spec query | O(n) | Linear, but optimized |

For Prismatic's registries:

- **Agent registry** (552 entries): lookup < 2 microseconds
- **OSINT adapter registry** (157 entries): lookup < 2 microseconds
- **Blog articles** (28 entries): full scan < 10 microseconds
- **Platform metrics** (50+ entries): lookup < 2 microseconds

Compare this to a GenServer call, which involves message passing (5-50 microseconds) plus the serialization overhead under load.

## When to Use ETS vs. Alternatives

| Use Case | Recommendation |
|----------|---------------|
| Read-heavy, write-rare | ETS with `read_concurrency: true` |
| Write-heavy | GenServer with periodic ETS flush |
| Large datasets (100K+) | ETS with match specifications |
| Cross-node sharing | Mnesia or distributed cache |
| Persistent storage | Ecto/PostgreSQL |
| Full-text search | Meilisearch |

ETS is the right choice when data fits in memory, reads vastly outnumber writes, and you need concurrent access from multiple processes.

## Gotchas

**Table ownership**: ETS tables are owned by the process that creates them. If that process crashes, the table is destroyed. Solution: create tables in a supervisor or use `:ets.give_away/3`.

**Memory management**: ETS data is not garbage collected. If you insert data and never delete it, memory grows unbounded. Solution: implement TTL-based cleanup or bounded table sizes.

**Atom keys**: Using atoms as keys is fast but risky if keys come from user input. We use string keys for user-facing data and atom keys only for internal registries.

**No transactions**: ETS does not support multi-key transactions. If you need atomic updates across multiple keys, use a GenServer as a write coordinator that updates ETS.

## The Hierarchical Cache Pattern

For data that benefits from multiple cache layers, Prismatic uses a three-level hierarchy:

```
Request → Process Dictionary (0 cost)
       → ETS Table (microseconds)
       → External Source (milliseconds)
```

The `HierarchicalCache` module manages this transparently:

```elixir
def cached_lookup(key, opts) do
  with :miss <- check_process_dict(key),
       :miss <- check_ets(key) do
    value = fetch_from_source(key, opts)
    store_in_ets(key, value, opts[:ttl])
    store_in_process_dict(key, value)
    value
  end
end
```

This pattern delivers sub-50ms response times for data that would otherwise require database or HTTP calls.

## Conclusion

ETS is the BEAM's secret weapon for high-performance data access. By treating ETS tables as application-level registries with compile-time data loading and concurrent read access, Prismatic serves thousands of lookups per second with single-digit microsecond latency.

The pattern is simple: define your data as Elixir structures, load them into ETS at startup, and read from any process without serialization. For read-heavy, write-rare workloads, nothing in the Elixir ecosystem is faster.

---

*Explore the [Architecture Documentation](/architecture/) for more patterns or try the [Interactive Academy](/academy/) for hands-on exercises with ETS.*
