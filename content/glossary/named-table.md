+++
title = "Named Table (ETS)"
weight = 50
[extra]
description = "An ETS table registered with an atom name, enabling direct access by name instead of table reference, commonly used for global registries."
category = "elixir"
related_terms = ["ets", "genserver", "registry", "atom"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["named table", "ETS", "Erlang Term Storage", "registry", "Elixir", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Named Table - Prismatic Platform"
+++

## Definition & Overview

A named table in ETS (Erlang Term Storage) is a table that is registered with an atom name, allowing any process to access it by name rather than by its opaque table reference. Created with the `:named_table` option in `:ets.new/2`, named tables provide a global access point for shared in-memory data structures. This is the standard approach for implementing registries, caches, and configuration stores that need to be accessible from any process in the application.

Without the `:named_table` option, ETS tables can only be accessed using the table reference returned by `:ets.new/2`. This reference must be passed to every process that needs to read or write the table, requiring explicit sharing through GenServer state, application environment, or message passing. Named tables eliminate this coordination overhead by registering the table in a global atom-based namespace, making them the natural choice for platform-wide shared state.

The Prismatic Platform uses named ETS tables extensively for its self-registering architecture. The ToolRegistry, TopicRegistry, and SourceRegistry all use named tables to store their registered items, providing sub-millisecond lookups from any process in the application. This pattern is fundamental to the platform's ability to serve 127 OSINT tools, 4 Academy topics, and 4 DD sources with consistent low-latency access.

## Technical Deep Dive

Named tables are created by including `:named_table` in the options list passed to `:ets.new/2`. The atom used as the first argument becomes the table's name and can be used in all subsequent ETS operations instead of the table reference. Only one named table with a given name can exist at any time; attempting to create a second table with the same name raises an error.

Table ownership is a critical consideration. The process that creates the ETS table is its owner. If the owner process terminates, the table is automatically deleted, destroying all data. In the Prismatic Platform, named tables are always created by GenServer processes within the supervision tree, ensuring that if the owning process crashes, the supervisor restarts it and the table is recreated (with data repopulated from the durable backing store).

```elixir
defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  ETS-backed registry using named tables for OSINT tool lookups.
  The named table `:osint_tool_registry` is accessible from any
  process in the application.
  """

  use GenServer

  @table_name :osint_tool_registry
  @index_table :osint_tool_by_category

  # Client API

  @spec get(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get(slug) do
    case :ets.lookup(@table_name, slug) do
      [{^slug, tool_config}] -> {:ok, tool_config}
      [] -> {:error, :not_found}
    end
  end

  @spec all() :: {:ok, [map()]}
  def all do
    tools =
      @table_name
      |> :ets.tab2list()
      |> Enum.map(&elem(&1, 1))

    {:ok, tools}
  end

  @spec by_category(atom()) :: {:ok, [map()]}
  def by_category(category) do
    case :ets.lookup(@index_table, category) do
      [{^category, slugs}] ->
        tools = Enum.map(slugs, fn slug ->
          [{_, config}] = :ets.lookup(@table_name, slug)
          config
        end)
        {:ok, tools}

      [] ->
        {:ok, []}
    end
  end

  # Server Implementation

  @impl GenServer
  def init(_opts) do
    # Create named tables - accessible by atom from any process
    table = :ets.new(@table_name, [
      :set,
      :named_table,
      :public,
      read_concurrency: true
    ])

    index = :ets.new(@index_table, [
      :set,
      :named_table,
      :public,
      read_concurrency: true
    ])

    {:ok, %{table: table, index: index}, {:continue, :load_tools}}
  end

  @impl GenServer
  def handle_continue(:load_tools, state) do
    # Discover and register all compiled OSINT tools
    discover_tools()
    |> Enum.each(&register_tool/1)

    {:noreply, state}
  end

  defp register_tool(config) do
    :ets.insert(@table_name, {config.slug, config})

    # Update category index
    existing =
      case :ets.lookup(@index_table, config.category) do
        [{_, slugs}] -> slugs
        [] -> []
      end

    :ets.insert(@index_table, {config.category, [config.slug | existing]})
  end

  defp discover_tools do
    # Uses :beam_lib.chunks/2 to discover registered tools from compiled modules
    []
  end
end
```

The `:public` access protection allows any process to read from and write to the table. The `:read_concurrency` option optimizes the table for concurrent read access, which is the dominant pattern for registries. For tables that also need concurrent writes, `:write_concurrency` can be enabled, though it adds a small overhead to reads.

## Architecture & Implementation

The platform's named table strategy follows a consistent pattern across all registries. Each registry GenServer owns its named table, creates it in `init/1`, and populates it from compiled module metadata or database records in `handle_continue/2`. The table name is defined as a module attribute for documentation and to prevent typos. Client functions access the table directly (bypassing the GenServer) for reads, only routing through the GenServer for writes that need serialization.

This direct-access pattern is crucial for performance. If every lookup went through `GenServer.call/2`, the GenServer would become a bottleneck under high read concurrency. By making the table `:public` and reading directly, any number of processes can query the registry simultaneously with zero contention. The GenServer only serializes write operations, which are infrequent (occurring at startup or when new modules are compiled).

Table recreation after crashes is handled by the supervision strategy. When a registry GenServer crashes and restarts, it recreates the named table and repopulates it. The brief unavailability window (typically under 100ms) is acceptable for registry data. For scenarios requiring zero-downtime table access, the `:heir` option can transfer table ownership to a backup process rather than destroying it.

## Usage in Prismatic Platform

Multiple registry pattern using named tables:

```elixir
defmodule PrismaticAcademy.TopicRegistry do
  @moduledoc """
  Named ETS table registry for Academy topics.
  Follows the same pattern as ToolRegistry and SourceRegistry.
  """

  use GenServer

  @topics_table :academy_topics
  @interconnections_table :academy_interconnections
  @search_index_table :academy_search_index

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get(slug) do
    case :ets.lookup(@topics_table, slug) do
      [{^slug, topic}] -> {:ok, topic}
      [] -> {:error, :not_found}
    end
  end

  @spec search(String.t()) :: {:ok, [map()]}
  def search(query) do
    # Full-text search using the search index named table
    normalized = String.downcase(query)

    results =
      @search_index_table
      |> :ets.tab2list()
      |> Enum.filter(fn {_slug, keywords} ->
        Enum.any?(keywords, &String.contains?(&1, normalized))
      end)
      |> Enum.map(fn {slug, _} ->
        [{_, topic}] = :ets.lookup(@topics_table, slug)
        topic
      end)

    {:ok, results}
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@topics_table, [:set, :named_table, :public, read_concurrency: true])
    :ets.new(@interconnections_table, [:bag, :named_table, :public, read_concurrency: true])
    :ets.new(@search_index_table, [:set, :named_table, :public, read_concurrency: true])

    {:ok, %{}, {:continue, :discover}}
  end

  @impl GenServer
  def handle_continue(:discover, state) do
    # Populate from compiled Academy topic modules
    {:noreply, state}
  end
end
```

The consistent use of named tables across ToolRegistry, TopicRegistry, and SourceRegistry creates a uniform, high-performance data access layer that enables the platform's sub-millisecond response times for registry lookups, regardless of which subsystem is being queried.

## Cross-References

- [ETS](/glossary/ets/) - The underlying in-memory storage system
- [GenServer](/glossary/genserver/) - Process pattern owning named tables
- [Registry](/glossary/registry/) - Conceptual pattern implemented with named tables
- **Ordered Set** - ETS table type alternative for sorted access
- [Module](/glossary/module/) - Source of data populating named table registries

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
