+++
title = "Source Registry"
weight = 50
[extra]
description = "ETS-backed GenServer catalog that automatically discovers and indexes DD pipeline sources via compile-time metaprogramming hooks"
category = "architecture"
related_terms = ["source", "ets", "genserver", "dd-pipeline", "tool-registry", "metaprogramming", "self-registration"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["source registry", "DD pipeline", "ETS", "self-registration", "metaprogramming", "glossary", "Prismatic Platform"]
tags = ["glossary", "architecture", "dd-pipeline"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Source Registry - Prismatic Platform"
+++

## Definition & Overview

A source registry is an ETS-backed GenServer that serves as the central catalog for all data sources in the DD (Due Diligence) pipeline. Sources register themselves automatically at compile time through `@after_compile` hooks -- the registry never needs to be manually configured. When a module calls `use PrismaticDd.Source` and `register_source/1`, the compilation process triggers registration, making the source immediately discoverable by the scheduler, client, and API layer.

The source registry pattern is one of three self-registering registries in the Prismatic Platform, alongside the OSINT ToolRegistry and the Academy TopicRegistry. All three share the same architectural DNA: a GenServer owns an ETS table, modules register via `@after_compile` callbacks, and runtime lookups bypass the GenServer for sub-microsecond read performance. This consistency across subsystems means that understanding one registry provides complete insight into all three.

The registry provides multiple access patterns: lookup by slug (for direct access), filter by group (for batch operations like "fetch all Forbes sources"), filter by entity type (for type-specific processing), and full enumeration (for dashboard display). Each access pattern is optimized through ETS match specifications, avoiding full-table scans for filtered queries.

## Technical Deep Dive

### Registry GenServer

The SourceRegistry is implemented as a GenServer that owns an ETS table and provides both read and write operations:

```elixir
defmodule PrismaticDd.SourceRegistry do
  @moduledoc """
  ETS-backed registry for DD pipeline sources.
  Sources self-register via @after_compile hooks.
  Provides sub-microsecond lookups by slug, group, or entity type.
  """

  use GenServer

  @table :dd_source_registry

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table, [
      :named_table,
      :set,
      :public,
      read_concurrency: true
    ])
    {:ok, %{table: table, count: 0}}
  end

  @spec register(module(), map()) :: :ok
  def register(module, config) do
    GenServer.call(__MODULE__, {:register, module, config})
  end

  @spec lookup(String.t()) :: {:ok, map()} | {:error, :not_found}
  def lookup(slug) do
    case :ets.lookup(@table, slug) do
      [{^slug, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  @spec all() :: {:ok, [map()]}
  def all do
    sources = :ets.tab2list(@table) |> Enum.map(fn {_slug, config} -> config end)
    {:ok, sources}
  end

  @spec by_group(atom()) :: {:ok, [map()]}
  def by_group(group) do
    match_spec = [{
      {:_, %{group: :"$1"} = :"$2"},
      [{:==, :"$1", group}],
      [:"$2"]
    }]
    {:ok, :ets.select(@table, match_spec)}
  end

  @spec by_entity_type(atom()) :: {:ok, [map()]}
  def by_entity_type(entity_type) do
    match_spec = [{
      {:_, %{entity_type: :"$1"} = :"$2"},
      [{:==, :"$1", entity_type}],
      [:"$2"]
    }]
    {:ok, :ets.select(@table, match_spec)}
  end

  @spec count() :: non_neg_integer()
  def count do
    :ets.info(@table, :size)
  end

  @impl true
  def handle_call({:register, module, config}, _from, state) do
    enriched_config = Map.merge(config, %{
      module: module,
      registered_at: DateTime.utc_now()
    })
    :ets.insert(@table, {config.slug, enriched_config})
    {:reply, :ok, %{state | count: state.count + 1}}
  end
end
```

### Self-Registration Flow

The complete registration flow from module compilation to registry entry:

```elixir
# Step 1: Module definition with source macro
defmodule PrismaticDd.Sources.Parliament do
  use PrismaticDd.Source

  register_source(%{
    slug: "parliament-cz",
    name: "Czech Parliament Members",
    group: :parliament,
    entity_type: :person,
    country: "CZ",
    estimated_count: 200,
    refresh_interval_hours: 24,
    requires_auth: false
  })

  @impl true
  def fetch(_params) do
    # Fetch from parliament.cz API
    {:ok, []}
  end

  @impl true
  def normalize(raw) do
    {:ok, %{name: raw["name"], entity_type: :person, source_slug: "parliament-cz"}}
  end
end

# Step 2: @after_compile hook fires automatically
# -> Parliament.__after_compile__/2 called by compiler
# -> Reads @source_config module attribute
# -> Calls PrismaticDd.SourceRegistry.register(Parliament, config)

# Step 3: Source is now discoverable
{:ok, config} = PrismaticDd.SourceRegistry.lookup("parliament-cz")
# => {:ok, %{slug: "parliament-cz", name: "Czech Parliament Members", ...}}
```

### Registry Recovery After Restart

When the SourceRegistry GenServer restarts (due to crash or deployment), the ETS table is lost. The platform handles this through re-registration during application startup:

```elixir
defmodule PrismaticDd.RegistryRecovery do
  @moduledoc """
  Recovers source registrations after registry restart.
  Scans loaded modules for source behaviour implementations
  and triggers re-registration.
  """

  @spec recover() :: {:ok, non_neg_integer()}
  def recover do
    count =
      :code.all_loaded()
      |> Enum.filter(fn {module, _} -> implements_source?(module) end)
      |> Enum.map(fn {module, _} ->
        config = module.source_config()
        PrismaticDd.SourceRegistry.register(module, config)
      end)
      |> length()

    {:ok, count}
  end

  defp implements_source?(module) do
    behaviours = module.module_info(:attributes) |> Keyword.get_values(:behaviour) |> List.flatten()
    PrismaticDd.Source in behaviours
  rescue
    _ -> false
  end
end
```

## Architecture & Implementation

The registry architecture follows OTP principles strictly. The GenServer is supervised within the DD application's supervision tree, ensuring automatic restart on failure. The ETS table uses `:public` access with `read_concurrency: true`, allowing any process to read without contacting the GenServer. Writes are serialized through GenServer calls, preventing race conditions during registration.

The three platform registries form a consistent pattern:

| Registry | Table | Owner | Sources | Access Pattern |
|----------|-------|-------|---------|----------------|
| `PrismaticDd.SourceRegistry` | `:dd_source_registry` | DD app | 4 sources | slug, group, entity_type |
| `PrismaticOsintCore.ToolRegistry` | `:osint_tool_registry` | OSINT Core app | 127 tools | slug, category |
| `PrismaticAcademy.TopicRegistry` | `:academy_topics` | Academy app | 4 topics | slug, category, difficulty |

The registry pattern was designed for extensibility. Adding a new source requires only creating a module with `use PrismaticDd.Source` -- no configuration files need editing, no routing tables need updating, no registry code needs modifying. This zero-configuration extensibility is what makes the pattern powerful at scale.

Performance characteristics are exceptional. ETS lookups by key are O(1) with sub-microsecond latency. Match specification queries (by group, by entity type) are O(n) over the table size but with n typically under 100, completing in microseconds. The GenServer serialization for writes adds microsecond-level overhead but occurs only during compilation, never at runtime.

## Usage in Prismatic Platform

The SourceRegistry is consumed by the DD Scheduler (to determine which sources to refresh and when), the DD Client (to resolve source modules for fetch operations), the LiveView dashboard (to display source inventory), and the API layer (to expose sources via REST endpoints).

```elixir
# Scheduler queries registry for refresh schedule
{:ok, all_sources} = PrismaticDd.SourceRegistry.all()
due_sources = Enum.filter(all_sources, &source_due_for_refresh?/1)

# Client resolves source module for fetch
{:ok, config} = PrismaticDd.SourceRegistry.lookup("forbes-cz")
{:ok, records} = config.module.fetch(%{})

# Dashboard lists sources by group
{:ok, czech_sources} = PrismaticDd.SourceRegistry.by_group(:parliament)
```

## Cross-References

- [Source](/glossary/source/) - Individual data provider registered in the catalog
- [ETS](/glossary/ets/) - In-memory storage backing the registry
- [GenServer](/glossary/genserver/) - OTP abstraction owning the registry table
- **Tool Registry** - OSINT equivalent of the source registry
- [Metaprogramming](/glossary/metaprogramming/) - Technique enabling self-registration

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
