+++
title = "Traversal"
weight = 50
[extra]
description = "Graph or tree navigation algorithm that systematically visits nodes following edges to discover paths and relationships"
category = "data"
related_terms = ["graph", "kuzudb", "bfs", "dfs", "relationship"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["traversal", "graph traversal", "BFS", "DFS", "tree navigation", "Cypher", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Traversal - Prismatic Platform"
+++

## Definition & Overview

Traversal is the process of systematically visiting nodes in a graph or tree data structure by following edges according to a defined strategy. The two fundamental traversal algorithms are Breadth-First Search (BFS), which explores all neighbors at the current depth before moving deeper, and Depth-First Search (DFS), which explores as far as possible along each branch before backtracking. More sophisticated traversal strategies include Dijkstra's shortest path, A* heuristic search, and random walks.

In the Prismatic Platform, traversal is fundamental to multiple subsystems. The DD pipeline's entity-relationship graph uses traversal to discover connections between companies, persons, and organizations across Czech registries. The Academy's InterconnectionEngine traverses a directed topic graph to find learning paths and prerequisite chains. The OSINT correlation engine traverses intelligence graphs to identify relationships between seemingly unrelated data points.

Graph traversal differs from simple iteration because the structure being navigated contains cycles, multiple paths between nodes, and variable connectivity. Traversal algorithms must handle these complexities through visited-node tracking, cycle detection, and path cost optimization. The choice of traversal strategy depends on the specific question being asked: BFS finds shortest paths, DFS finds any path with minimal memory, and weighted traversals find optimal paths.

## Technical Deep Dive

The platform implements graph traversal using Erlang's `:digraph` module for in-memory graphs and KuzuDB's Cypher queries for persistent graph storage:

```elixir
defmodule PrismaticGraph.Traversal do
  @moduledoc """
  Graph traversal algorithms for entity relationship
  exploration and path discovery.
  """

  @type node_id :: term()
  @type path :: [node_id()]

  @spec bfs(:digraph.graph(), node_id(), node_id()) :: {:ok, path()} | {:error, :no_path}
  def bfs(graph, start, target) do
    bfs_loop(graph, :queue.from_list([{start, [start]}]), MapSet.new([start]), target)
  end

  defp bfs_loop(_graph, {[], []}, _visited, _target), do: {:error, :no_path}

  defp bfs_loop(graph, queue, visited, target) do
    {{:value, {current, path}}, rest} = :queue.out(queue)

    if current == target do
      {:ok, Enum.reverse(path)}
    else
      neighbors =
        :digraph.out_neighbours(graph, current)
        |> Enum.reject(&MapSet.member?(visited, &1))

      new_visited = Enum.reduce(neighbors, visited, &MapSet.put(&2, &1))

      new_queue =
        Enum.reduce(neighbors, rest, fn neighbor, q ->
          :queue.in({neighbor, [neighbor | path]}, q)
        end)

      bfs_loop(graph, new_queue, new_visited, target)
    end
  end

  @spec dfs(:digraph.graph(), node_id(), node_id()) :: {:ok, path()} | {:error, :no_path}
  def dfs(graph, start, target) do
    dfs_loop(graph, [{start, [start]}], MapSet.new([start]), target)
  end

  defp dfs_loop(_graph, [], _visited, _target), do: {:error, :no_path}

  defp dfs_loop(graph, [{current, path} | rest], visited, target) do
    if current == target do
      {:ok, Enum.reverse(path)}
    else
      neighbors =
        :digraph.out_neighbours(graph, current)
        |> Enum.reject(&MapSet.member?(visited, &1))

      new_visited = Enum.reduce(neighbors, visited, &MapSet.put(&2, &1))
      new_stack = Enum.map(neighbors, fn n -> {n, [n | path]} end) ++ rest

      dfs_loop(graph, new_stack, new_visited, target)
    end
  end

  @spec find_all_paths(:digraph.graph(), node_id(), node_id(), pos_integer()) :: [path()]
  def find_all_paths(graph, start, target, max_depth \\ 10) do
    find_paths_recursive(graph, start, target, [start], MapSet.new([start]), max_depth)
  end

  defp find_paths_recursive(_graph, current, target, path, _visited, _max_depth)
       when current == target do
    [Enum.reverse(path)]
  end

  defp find_paths_recursive(_graph, _current, _target, path, _visited, max_depth)
       when length(path) > max_depth do
    []
  end

  defp find_paths_recursive(graph, current, target, path, visited, max_depth) do
    :digraph.out_neighbours(graph, current)
    |> Enum.reject(&MapSet.member?(visited, &1))
    |> Enum.flat_map(fn neighbor ->
      find_paths_recursive(
        graph, neighbor, target,
        [neighbor | path],
        MapSet.put(visited, neighbor),
        max_depth
      )
    end)
  end
end
```

For KuzuDB-backed persistent graphs, traversals are expressed as Cypher queries:

```elixir
defmodule PrismaticGraph.CypherTraversal do
  @moduledoc """
  Cypher-based traversals for KuzuDB persistent graphs.
  Leverages the graph database's native path-finding.
  """

  @spec shortest_path(String.t(), String.t()) :: {:ok, list()} | {:error, term()}
  def shortest_path(source_id, target_id) do
    query = """
    MATCH p = SHORTEST 1 ALLSHORTEST
      (a:Entity {id: $source})-[*1..10]-(b:Entity {id: $target})
    RETURN nodes(p) AS path_nodes, relationships(p) AS path_edges
    """

    PrismaticStorageKuzu.query(query, %{source: source_id, target: target_id})
  end

  @spec neighborhood(String.t(), pos_integer()) :: {:ok, map()} | {:error, term()}
  def neighborhood(entity_id, depth \\ 2) do
    query = """
    MATCH (center:Entity {id: $id})-[r*1..#{depth}]-(neighbor:Entity)
    RETURN DISTINCT neighbor.id AS id, neighbor.name AS name,
           neighbor.type AS type, length(r) AS distance
    ORDER BY distance ASC
    """

    PrismaticStorageKuzu.query(query, %{id: entity_id})
  end
end
```

## Architecture & Implementation

Graph traversal in the platform operates across three storage tiers, each optimized for different traversal patterns:

**In-Memory (`:digraph`)**: The Academy InterconnectionEngine and DD relationship builder use Erlang's `:digraph` for fast in-memory traversals. These graphs are rebuilt at startup from ETS-cached data and serve sub-millisecond traversal queries. Suitable for graphs with up to ~100K nodes.

**Graph Database (KuzuDB)**: Persistent entity-relationship graphs are stored in KuzuDB via the `prismatic_storage_kuzu` adapter. KuzuDB's native Cypher query engine handles complex traversals with built-in indexing and query optimization. Used for the DD entity graph where traversals need to survive process restarts.

**Hybrid**: Some traversals span both tiers. The OSINT correlation engine starts with in-memory graph exploration for recently discovered relationships and falls back to KuzuDB for historical relationship traversal when the in-memory graph lacks sufficient context.

## Usage in Prismatic Platform

The DD pipeline uses traversal to discover entity networks after loading data from Czech registries:

```elixir
defmodule PrismaticDd.EntityExplorer do
  @moduledoc """
  Traverses entity relationship graphs to discover
  networks and hidden connections.
  """

  @spec explore_network(String.t(), keyword()) :: {:ok, map()}
  def explore_network(entity_id, opts \\ []) do
    depth = Keyword.get(opts, :depth, 3)
    max_nodes = Keyword.get(opts, :max_nodes, 100)

    {:ok, neighbors} = PrismaticGraph.CypherTraversal.neighborhood(entity_id, depth)

    network = %{
      center: entity_id,
      nodes: Enum.take(neighbors, max_nodes),
      total_discovered: length(neighbors),
      depth: depth
    }

    {:ok, network}
  end
end
```

The Perimeter module traverses DNS and certificate graphs to map an organization's external attack surface, following domain-to-IP, IP-to-certificate, and certificate-to-domain edges to discover the full extent of internet-facing assets.

## Cross-References

- **Graph** - Data structure navigated by traversal
- [KuzuDB](/glossary/kuzudb/) - Graph database backend
- **Relationship** - Edges connecting graph nodes
- [Transform](/glossary/transform/) - Data conversion feeding graphs
- **Visualization** - Rendering traversal results

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
