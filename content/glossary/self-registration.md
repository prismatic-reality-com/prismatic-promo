+++
title = "Self-Registration"
weight = 50
[extra]
description = "Metaprogramming auto-discovery pattern where modules register themselves at compile time via macros and hooks"
category = "architecture"
related_terms = ["process", "semantic-link", "semantic-linking", "property-test", "quality-floor"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["self-registration", "metaprogramming", "auto-discovery", "compile hook", "ETS registry", "glossary", "Prismatic Platform"]
tags = ["glossary", "architecture", "metaprogramming", "elixir"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Self-Registration - Prismatic Platform"
+++

## Definition & Overview

Self-registration is a metaprogramming pattern where modules automatically register themselves with a central registry at compile time, eliminating the need for manual configuration files, explicit module lists, or runtime discovery scans. In Elixir, this pattern leverages `use` macros, module attributes, and `@after_compile` hooks to extract configuration from each module and insert it into an ETS-backed registry GenServer during compilation.

The self-registration pattern solves the "plugin discovery" problem elegantly. Without it, adding a new OSINT tool, Academy topic, or DD source would require modifying a central configuration file or registry module -- a coordination bottleneck that creates merge conflicts and forgot-to-register bugs. With self-registration, adding a new component is a single-file operation: define the module with `use TheBehaviour`, call `register_thing(@config)`, and the module automatically appears in all UI listings, API endpoints, and operational pipelines.

The Prismatic Platform uses self-registration as a foundational pattern across three major subsystems: OSINT tools (127 adapters via `use PrismaticOsintCore.Tool`), Academy topics (4 topics via `use PrismaticAcademy.Topic`), and DD sources (4 sources via `use PrismaticDd.Source`). Each subsystem implements the same architectural pattern: a behaviour module providing the `use` macro with `register_*` function and `@after_compile` hook, paired with an ETS-backed GenServer registry for sub-millisecond lookups.

## Technical Deep Dive

The self-registration pattern consists of three components: the behaviour module (providing the macro), the `@after_compile` hook (extracting configuration from compiled modules), and the registry GenServer (storing and serving configurations).

```elixir
defmodule PrismaticOsintCore.Tool do
  @moduledoc """
  Behaviour and macro for self-registering OSINT tools.
  Modules using this behaviour automatically register their
  configuration with the ToolRegistry at compile time.
  """

  @callback run(params :: map()) :: {:ok, map()} | {:error, term()}

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticOsintCore.Tool

      import PrismaticOsintCore.Tool, only: [register_tool: 1]

      @before_compile PrismaticOsintCore.Tool
      @after_compile PrismaticOsintCore.Tool

      Module.register_attribute(__MODULE__, :tool_config, persist: true)
    end
  end

  defmacro register_tool(config) do
    quote do
      @tool_config unquote(config)
    end
  end

  defmacro __before_compile__(env) do
    quote do
      def __tool_config__ do
        @tool_config
      end
    end
  end

  def __after_compile__(module, _bytecode) do
    case extract_config(module) do
      {:ok, config} ->
        enriched = Map.put(config, :module, module)

        if Process.whereis(PrismaticOsintCore.ToolRegistry) do
          PrismaticOsintCore.ToolRegistry.register(enriched)
        end

      {:error, _} ->
        :ok
    end
  end

  defp extract_config(module) do
    case :beam_lib.chunks(module, [:attributes]) do
      {:ok, {_, [{:attributes, attrs}]}} ->
        case Keyword.get(attrs, :tool_config) do
          nil -> {:error, :no_config}
          config -> {:ok, config}
        end

      _ ->
        {:error, :no_beam}
    end
  end
end
```

The registry GenServer provides thread-safe ETS-backed storage with read concurrency optimization. The `read_concurrency: true` flag enables lock-free reads from multiple processes, critical for handling concurrent web requests that all query the tool registry.

```elixir
defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  ETS-backed registry for self-registered OSINT tools.
  Provides sub-millisecond lookups by slug, category, and
  arbitrary attribute filters.
  """

  use GenServer

  @ets_table :osint_tool_registry
  @categories_table :osint_tool_categories

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :set, :public, read_concurrency: true])
    :ets.new(@categories_table, [:named_table, :bag, :public, read_concurrency: true])
    {:ok, %{count: 0}}
  end

  @spec register(map()) :: :ok
  def register(config) do
    GenServer.call(__MODULE__, {:register, config})
  end

  @spec get_by_slug(String.t()) :: map() | nil
  def get_by_slug(slug) do
    case :ets.lookup(@ets_table, slug) do
      [{^slug, config}] -> config
      [] -> nil
    end
  end

  @spec list_by_category(atom()) :: [map()]
  def list_by_category(category) do
    :ets.lookup(@categories_table, category)
    |> Enum.map(fn {_, slug} -> get_by_slug(slug) end)
    |> Enum.reject(&is_nil/1)
  end

  @spec list_all() :: [map()]
  def list_all do
    :ets.tab2list(@ets_table)
    |> Enum.map(fn {_slug, config} -> config end)
  end

  @spec count() :: non_neg_integer()
  def count do
    :ets.info(@ets_table, :size)
  end

  @impl true
  def handle_call({:register, config}, _from, state) do
    slug = config.slug
    :ets.insert(@ets_table, {slug, config})
    :ets.insert(@categories_table, {config.category, slug})
    {:reply, :ok, %{state | count: state.count + 1}}
  end
end
```

## Architecture & Implementation

The self-registration architecture in the Prismatic Platform follows a consistent three-layer design across all three subsystems:

1. **Behaviour layer**: Defines the `use` macro, `register_*` function, `@after_compile` hook, and required callbacks
2. **Registry layer**: ETS-backed GenServer with `read_concurrency: true` for sub-millisecond lookups
3. **UI/API layer**: LiveView pages and REST endpoints that query the registry to dynamically generate interfaces

This pattern creates a zero-configuration plugin system where new tools, topics, or sources are discovered automatically. The compile-time registration ensures that the registry is populated before any runtime code attempts to access it. The ETS storage provides O(1) lookups without database queries, keeping UI response times under the platform's 250ms page load requirement.

The pattern's key advantage is locality: all information about a tool (its name, category, input fields, API style, and implementation) is co-located in a single module file. There are no separate configuration files, manifests, or registration modules to maintain. This locality eliminates an entire category of bugs (forgot-to-register, stale-configuration, wrong-module-reference).

## Usage in Prismatic Platform

Self-registration is used to add new OSINT tools, Academy topics, and DD sources. Each addition requires only a single new module file.

```elixir
# Adding a new OSINT tool (single file, zero configuration elsewhere)
defmodule PrismaticOsintCore.Adapters.Global.NewTool do
  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "new-tool",
    name: "New Intelligence Tool",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Search Query", required: true}
    ],
    requires_auth: true
  })

  @impl true
  def run(%{query: query}) do
    # Implementation
    {:ok, %{results: []}}
  end
end
# Result: automatically appears in UI, API, and pipeline
```

The same pattern applies to Academy topics and DD sources, with different behaviours but identical architectural structure. The platform tracks 127 OSINT tools, 4 Academy topics, and 4 DD sources -- all discovered automatically through self-registration.

## Cross-References

- [Process](@/glossary/process.md) - GenServer processes backing the ETS registries
- [Semantic Link](@/glossary/semantic-link.md) - Knowledge graph connections created from registered metadata
- [Semantic Linking](@/glossary/semantic-linking.md) - Interconnection engine using registered topic data
- [Property Test](@/glossary/property-test.md) - Testing approach validating registration invariants
- [Quality Floor](@/glossary/quality-floor.md) - Quality standards enforced on all registered modules

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
