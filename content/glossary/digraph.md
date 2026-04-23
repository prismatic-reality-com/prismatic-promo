+++
title = "Digraph"
weight = 50

[extra]
description = "Directed graph data structure provided by Erlang's :digraph module, used for dependency resolution, topology sorting, and relationship modeling in OTP applications."
category = "data"
related_terms = ["graph-database", "graph-theory", "kuzudb", "supervision-tree", "dependency-injection", "interconnection"]
tags = ["glossary", "digraph", "graph", "erlang", "data-structure", "topology", "dependency"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
difficulty = "advanced"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Erlang's :digraph module provides ETS-backed directed graph operations used throughout the Prismatic Platform for dependency resolution, supervision tree modeling, and the Academy interconnection engine."
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["Digraph", "directed graph", "topology", "Erlang", "glossary", "Prismatic Platform", "dependency"]
image = "/images/sections/glossary.png"
image_alt = "Digraph - Prismatic Platform"
word_count = 920
see_also = ["technologies", "architecture", "capabilities"]
+++

## Definition

A digraph (directed graph) is a mathematical structure consisting of vertices (nodes) and directed edges (arcs) where each edge has a source vertex and a target vertex, establishing an asymmetric relationship. Erlang's `:digraph` module provides a mutable, ETS-backed implementation of directed graphs with operations for vertex and edge manipulation, path finding, cycle detection, and topological sorting. Unlike most Erlang/Elixir data structures which are immutable, `:digraph` graphs are mutable structures stored in ETS tables, requiring explicit lifecycle management.

In the Prismatic Platform, digraphs are used extensively for dependency resolution (PrismaticSupervisor's DependencyResolver), topic interconnection mapping (PrismaticAcademy's InterconnectionEngine), and relationship modeling in the DD pipeline.

## Technical Deep Dive

The `:digraph` module stores graph data across three ETS tables (vertices, edges, and neighbours), enabling O(1) vertex/edge access with efficient adjacency queries.

| Operation | Complexity | Function |
|-----------|-----------|----------|
| **Add vertex** | O(1) | `:digraph.add_vertex/2` |
| **Add edge** | O(1) | `:digraph.add_edge/4` |
| **Get neighbours** | O(degree) | `:digraph.out_neighbours/2` |
| **Shortest path** | O(V + E) | `:digraph.get_short_path/3` |
| **Topological sort** | O(V + E) | `:digraph_utils.topsort/1` |
| **Cycle detection** | O(V + E) | `:digraph_utils.is_acyclic/1` |
| **Components** | O(V + E) | `:digraph_utils.components/1` |

## Usage in Prismatic Platform

The PrismaticSupervisor's DependencyResolver uses `:digraph` to determine safe application startup order across the 115-app umbrella.

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc """
  Resolves application startup order using directed graph
  topological sorting. Builds a dependency digraph from
  umbrella application configurations and produces a safe
  startup sequence that respects all dependency constraints.
  """

  @spec resolve(list({atom(), list(atom())})) :: {:ok, list(atom())} | {:error, {:cycle, list(atom())}}
  def resolve(app_dependencies) do
    graph = :digraph.new([:acyclic])

    try do
      Enum.each(app_dependencies, fn {app, _deps} ->
        :digraph.add_vertex(graph, app)
      end)

      Enum.each(app_dependencies, fn {app, deps} ->
        Enum.each(deps, fn dep ->
          :digraph.add_vertex(graph, dep)
          case :digraph.add_edge(graph, dep, app) do
            {:error, {:bad_edge, path}} ->
              throw({:cycle, path})
            _edge ->
              :ok
          end
        end)
      end)

      case :digraph_utils.topsort(graph) do
        false -> {:error, {:cycle, find_cycle(graph)}}
        sorted -> {:ok, sorted}
      end
    catch
      {:cycle, path} -> {:error, {:cycle, path}}
    after
      :digraph.delete(graph)
    end
  end

  defp find_cycle(graph) do
    :digraph.vertices(graph)
    |> Enum.find_value(fn v ->
      case :digraph.get_short_cycle(graph, v) do
        false -> nil
        cycle -> cycle
      end
    end) || []
  end
end
```

## Code Examples

The Academy InterconnectionEngine uses `:digraph` to model semantic relationships between learning topics.

```elixir
defmodule PrismaticAcademy.InterconnectionEngine do
  @moduledoc """
  Semantic linking engine that builds a directed graph of topic
  relationships, enabling prerequisite chains, related topic
  discovery, and learning path generation.
  """

  use GenServer

  @type link_type :: :prerequisite | :related | :extends | :contrasts

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    graph = :digraph.new([:protected])
    {:ok, %{graph: graph}}
  end

  @spec add_topic(String.t()) :: :ok
  def add_topic(topic_slug) do
    GenServer.call(__MODULE__, {:add_topic, topic_slug})
  end

  @spec link_topics(String.t(), String.t(), link_type()) :: :ok | {:error, term()}
  def link_topics(from_slug, to_slug, link_type) do
    GenServer.call(__MODULE__, {:link, from_slug, to_slug, link_type})
  end

  @spec learning_path(String.t(), String.t()) :: {:ok, list(String.t())} | {:error, :no_path}
  def learning_path(from_slug, to_slug) do
    GenServer.call(__MODULE__, {:path, from_slug, to_slug})
  end

  @impl GenServer
  def handle_call({:add_topic, slug}, _from, %{graph: graph} = state) do
    :digraph.add_vertex(graph, slug)
    {:reply, :ok, state}
  end

  @impl GenServer
  def handle_call({:link, from, to, type}, _from, %{graph: graph} = state) do
    label = %{type: type, created_at: DateTime.utc_now()}
    :digraph.add_edge(graph, from, to, label)
    {:reply, :ok, state}
  end

  @impl GenServer
  def handle_call({:path, from, to}, _from, %{graph: graph} = state) do
    case :digraph.get_short_path(graph, from, to) do
      false -> {:reply, {:error, :no_path}, state}
      path -> {:reply, {:ok, path}, state}
    end
  end

  @impl GenServer
  def terminate(_reason, %{graph: graph}) do
    :digraph.delete(graph)
  end
end
```

## Best Practices

1. **Always delete digraphs when done** -- `:digraph` creates ETS tables that persist until explicitly deleted; failing to clean up causes memory leaks.
2. **Use `try/after` for lifecycle management** -- ensure `:digraph.delete/1` is called even when operations fail.
3. **Prefer `:acyclic` option when cycles are invalid** -- the `:acyclic` option rejects edges that would create cycles, providing compile-time-like safety.
4. **Wrap in GenServer for concurrent access** -- `:digraph` is mutable; concurrent modifications require serialization through a GenServer.
5. **Use `:digraph_utils` for graph algorithms** -- topological sort, components, and reachability are provided by the companion module.

## Related Terms

- [Graph Database](/glossary/graph-database/) -- Persistent graph storage for large-scale relationship data
- [Graph Theory](/glossary/graph-theory/) -- Mathematical foundations underlying digraph operations
- [KuzuDB](/glossary/kuzudb/) -- Graph database adapter for persistent relationship queries
- **Interconnection** -- Semantic linking using digraph structures

## See Also

- [Technologies](/technologies/) -- Graph technologies in the platform stack
- [Architecture](/architecture/) -- Dependency resolution architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
