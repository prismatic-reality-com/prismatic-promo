+++
title = "Topic Registry"
weight = 50
[extra]
description = "ETS-backed self-registering catalog for Academy learning topics with semantic interconnections and search indexing"
category = "academy"
related_terms = ["tool-registry", "ets", "metaprogramming", "academy"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["topic registry", "academy", "self-registering", "ETS", "metaprogramming", "glossary", "Prismatic Platform"]
tags = ["glossary", "academy"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Topic Registry - Prismatic Platform"
+++

## Definition & Overview

The Topic Registry is an ETS-backed GenServer within the Prismatic Academy application that serves as the central catalog for all self-registering learning topics. It follows the same metaprogramming pattern used by the OSINT ToolRegistry and DD SourceRegistry, where topic modules declare their configuration via macros and automatically register themselves at compile time through `@after_compile` hooks.

The registry maintains three ETS tables: a primary topics table for O(1) slug-based lookups, an interconnections table that maps semantic relationships between topics using a directed graph, and a search index that enables full-text discovery across topic titles, descriptions, and tags. This tri-table architecture ensures that common access patterns, whether looking up a single topic, navigating related content, or searching across the curriculum, all complete in sub-millisecond time.

What distinguishes the Topic Registry from a simple key-value store is its active role in maintaining pedagogical coherence. The InterconnectionEngine, which works in tandem with the registry, automatically discovers relationships between topics based on shared categories, overlapping tags, prerequisite chains, and content similarity. This transforms the flat list of topics into a navigable knowledge graph that supports intelligent learning path recommendations.

## Technical Deep Dive

The Topic Registry's implementation follows the established self-registering pattern with academy-specific enhancements for learning path management:

```elixir
defmodule PrismaticAcademy.TopicRegistry do
  @moduledoc """
  ETS-backed registry for self-registered Academy topics.
  Maintains topics, interconnections, and search index
  across three dedicated ETS tables.
  """

  use GenServer

  @topics_table :academy_topics
  @interconnections_table :academy_interconnections
  @search_index_table :academy_search_index

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@topics_table, [:set, :named_table, :public, read_concurrency: true])
    :ets.new(@interconnections_table, [:bag, :named_table, :public, read_concurrency: true])
    :ets.new(@search_index_table, [:bag, :named_table, :public, read_concurrency: true])

    {:ok, %{initialized_at: DateTime.utc_now()}}
  end

  @spec register(map()) :: :ok
  def register(%{slug: slug} = config) do
    :ets.insert(@topics_table, {slug, config})
    index_topic(slug, config)
    :ok
  end

  @spec get_topic(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_topic(slug) do
    case :ets.lookup(@topics_table, slug) do
      [{^slug, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  @spec list_topics(keyword()) :: [map()]
  def list_topics(filters \\ []) do
    category = Keyword.get(filters, :category)
    difficulty = Keyword.get(filters, :difficulty)

    :ets.foldl(fn {_slug, config}, acc ->
      matches_category = is_nil(category) or config.category == category
      matches_difficulty = is_nil(difficulty) or config.difficulty == difficulty

      if matches_category and matches_difficulty do
        [config | acc]
      else
        acc
      end
    end, [], @topics_table)
  end

  @spec search(String.t()) :: [map()]
  def search(query) do
    normalized = String.downcase(query)

    @search_index_table
    |> :ets.foldl(fn {term, slug}, acc ->
      if String.contains?(term, normalized) do
        MapSet.put(acc, slug)
      else
        acc
      end
    end, MapSet.new())
    |> Enum.flat_map(fn slug ->
      case get_topic(slug) do
        {:ok, config} -> [config]
        _ -> []
      end
    end)
  end

  defp index_topic(slug, config) do
    terms = [
      String.downcase(config.name),
      String.downcase(config.description || ""),
      Enum.join(config.tags || [], " ") |> String.downcase()
    ]

    Enum.each(terms, fn term ->
      term
      |> String.split(~r/\s+/)
      |> Enum.each(fn word ->
        :ets.insert(@search_index_table, {word, slug})
      end)
    end)
  end
end
```

The Topic behaviour and registration macro mirror the OSINT Tool pattern:

```elixir
defmodule PrismaticAcademy.Topic do
  @moduledoc """
  Behaviour and registration macro for Academy topics.
  Modules using this behaviour self-register at compile time.
  """

  @callback content() :: map()
  @callback exercises() :: [map()]
  @callback assessment() :: map()

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticAcademy.Topic
      import PrismaticAcademy.Topic, only: [register_topic: 1]

      @after_compile __MODULE__

      def __after_compile__(env, _bytecode) do
        if function_exported?(env.module, :__topic_config__, 0) do
          config = env.module.__topic_config__()
          PrismaticAcademy.TopicRegistry.register(config)
        end
      end
    end
  end

  defmacro register_topic(config) do
    quote do
      def __topic_config__ do
        unquote(config)
        |> Map.put(:module, __MODULE__)
        |> Map.put(:registered_at, DateTime.utc_now())
      end
    end
  end
end
```

## Architecture & Implementation

The Topic Registry operates within a broader Academy OTP supervision tree that includes five GenServers working in coordination:

**TopicRegistry**: The central catalog described above, holding all topic configurations and providing filtered queries. It starts first in the supervision tree since other components depend on it.

**InterconnectionEngine**: Uses Erlang's `:digraph` module to maintain a directed graph of topic relationships. After all topics are registered, it scans for shared categories, prerequisite declarations, overlapping tags, and content similarity to build semantic edges. This graph powers the "Related Topics" sidebar in the Academy LiveView dashboard.

**ProgressTracker**: Tracks per-user completion state for each topic. Reads the topic list from the registry and maintains progress records in ETS with PostgreSQL persistence for durability.

**SessionManager**: Manages active learning sessions, tracking which topics a user is currently studying and enforcing prerequisite chains by consulting the interconnection graph.

**Telemetry**: Emits events for topic views, exercise completions, assessment scores, and learning path progress, enabling time series analysis of educational outcomes.

The registry's `read_concurrency: true` ETS option ensures that concurrent LiveView processes serving the Academy dashboard can read topic data without contention, even under high load.

## Usage in Prismatic Platform

The Topic Registry integrates with the Academy LiveView dashboard to provide dynamic filtering, search, and navigation across all registered topics:

```elixir
defmodule PrismaticWeb.AcademyLive.Dashboard do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    topics = PrismaticAcademy.TopicRegistry.list_topics()
    categories = topics |> Enum.map(& &1.category) |> Enum.uniq() |> Enum.sort()

    {:ok, assign(socket,
      topics: topics,
      categories: categories,
      selected_category: nil,
      search_query: ""
    )}
  end

  @impl true
  def handle_event("filter_category", %{"category" => category}, socket) do
    filter = if category == "all", do: [], else: [category: String.to_existing_atom(category)]
    topics = PrismaticAcademy.TopicRegistry.list_topics(filter)
    {:noreply, assign(socket, topics: topics, selected_category: category)}
  end

  @impl true
  def handle_event("search", %{"query" => query}, socket) do
    topics =
      if String.length(query) >= 2 do
        PrismaticAcademy.TopicRegistry.search(query)
      else
        PrismaticAcademy.TopicRegistry.list_topics()
      end

    {:noreply, assign(socket, topics: topics, search_query: query)}
  end
end
```

The registry pattern, shared across OSINT (ToolRegistry), Academy (TopicRegistry), and DD (SourceRegistry), represents one of the platform's most powerful architectural patterns. It enables each subsystem to grow by simply adding new modules without modifying any infrastructure code.

## Cross-References

- [Tool](/glossary/tool/) - OSINT self-registering adapter using the same pattern
- [ETS](/glossary/ets/) - In-memory storage backing the registry
- [Metaprogramming](/glossary/metaprogramming/) - Compile-time code generation technique
- **Academy** - Learning platform subsystem
- **Track** - Learning path built from registered topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
