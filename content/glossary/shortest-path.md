+++
title = "Shortest Path"
weight = 50
[extra]
description = "Graph traversal algorithm finding the minimum-cost route between vertices, essential for relationship analysis in OSINT and knowledge graphs"
category = "algorithms"
related_terms = ["graph-database", "kuzudb", "cypher", "bfs", "dijkstra", "knowledge-graph", "relationship"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["shortest path", "graph traversal", "algorithm", "Dijkstra", "BFS", "glossary", "Prismatic Platform"]
tags = ["glossary", "algorithms", "graph"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Shortest Path - Prismatic Platform"
+++

## Definition & Overview

The shortest path problem is a foundational graph theory problem: given a weighted or unweighted graph and two vertices (source and target), find the path between them that minimizes total edge cost. In unweighted graphs, this reduces to finding the path with the fewest edges (solved by BFS). In weighted graphs, algorithms like Dijkstra's, Bellman-Ford, or A* find the minimum-cost path considering edge weights. The problem has direct applications in network routing, social network analysis, supply chain optimization, and intelligence relationship mapping.

In the Prismatic Platform, shortest path algorithms are central to OSINT relationship analysis and the DD (Due Diligence) entity graph. When investigating connections between entities -- companies, individuals, domains, IP addresses -- the shortest path reveals the most direct relationship chain. A path from a sanctioned entity to a target company through three intermediary shell corporations represents a critical compliance finding that manual analysis might miss.

The platform leverages KuzuDB as its graph database backend, which provides native Cypher query support including variable-length path patterns and shortest path functions. This integration enables sub-second path queries across entity graphs with hundreds of thousands of nodes, making real-time relationship exploration feasible in the LiveView dashboard.

## Technical Deep Dive

### BFS for Unweighted Graphs

For unweighted graphs where all edges have equal cost, breadth-first search finds the shortest path optimally:

```elixir
defmodule PrismaticGraph.BFS do
  @moduledoc """
  Breadth-first search for shortest path in unweighted graphs.
  Returns the path with minimum number of edges.
  """

  @spec shortest_path(map(), term(), term()) :: {:ok, [term()]} | {:error, :no_path}
  def shortest_path(adjacency_map, source, target) do
    queue = :queue.from_list([{source, [source]}])
    visited = MapSet.new([source])
    bfs_loop(adjacency_map, target, queue, visited)
  end

  defp bfs_loop(_graph, _target, {[], []}, _visited) do
    {:error, :no_path}
  end

  defp bfs_loop(graph, target, queue, visited) do
    {{:value, {current, path}}, rest} = :queue.out(queue)

    if current == target do
      {:ok, Enum.reverse(path)}
    else
      neighbors = Map.get(graph, current, [])

      {new_queue, new_visited} =
        Enum.reduce(neighbors, {rest, visited}, fn neighbor, {q, v} ->
          if MapSet.member?(v, neighbor) do
            {q, v}
          else
            {:queue.in({neighbor, [neighbor | path]}, q), MapSet.put(v, neighbor)}
          end
        end)

      bfs_loop(graph, target, new_queue, new_visited)
    end
  end
end
```

### Dijkstra's Algorithm for Weighted Graphs

When edges carry weights (trust scores, transaction amounts, temporal distance), Dijkstra's algorithm finds the true shortest path:

```elixir
defmodule PrismaticGraph.Dijkstra do
  @moduledoc """
  Dijkstra's shortest path algorithm for weighted graphs
  with non-negative edge weights. Uses a priority queue
  for O((V + E) log V) performance.
  """

  @spec shortest_path(map(), term(), term()) :: {:ok, {number(), [term()]}} | {:error, :no_path}
  def shortest_path(weighted_graph, source, target) do
    distances = %{source => 0}
    predecessors = %{}
    # Priority queue: [{cost, node}]
    pq = [{0, source}]
    visited = MapSet.new()

    case dijkstra_loop(weighted_graph, target, pq, distances, predecessors, visited) do
      {:found, final_distances, final_predecessors} ->
        path = reconstruct_path(final_predecessors, target, [target])
        {:ok, {final_distances[target], path}}

      :not_found ->
        {:error, :no_path}
    end
  end

  defp dijkstra_loop(_graph, _target, [], _distances, _predecessors, _visited) do
    :not_found
  end

  defp dijkstra_loop(graph, target, [{cost, node} | rest], distances, predecessors, visited) do
    if node == target do
      {:found, distances, predecessors}
    else
      if MapSet.member?(visited, node) do
        dijkstra_loop(graph, target, rest, distances, predecessors, visited)
      else
        new_visited = MapSet.put(visited, node)
        neighbors = Map.get(graph, node, [])

        {new_pq, new_distances, new_predecessors} =
          Enum.reduce(neighbors, {rest, distances, predecessors}, fn
            {neighbor, weight}, {pq, dist, pred} ->
              alt = cost + weight
              current_dist = Map.get(dist, neighbor, :infinity)

              if alt < current_dist do
                {insert_sorted(pq, {alt, neighbor}), Map.put(dist, neighbor, alt),
                 Map.put(pred, neighbor, node)}
              else
                {pq, dist, pred}
              end
          end)

        dijkstra_loop(graph, target, new_pq, new_distances, new_predecessors, new_visited)
      end
    end
  end

  defp insert_sorted([], item), do: [item]
  defp insert_sorted([{c, _} = h | t], {cost, _} = item) when cost <= c, do: [item, h | t]
  defp insert_sorted([h | t], item), do: [h | insert_sorted(t, item)]

  defp reconstruct_path(_predecessors, source, [source | _] = path), do: path
  defp reconstruct_path(predecessors, _source, [current | _] = path) do
    case Map.get(predecessors, current) do
      nil -> path
      prev -> reconstruct_path(predecessors, prev, [prev | path])
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform integrates shortest path algorithms at multiple levels. For small in-memory graphs (agent dependency trees, supervision hierarchies), the Elixir implementations above provide microsecond-level path computation. For large persistent graphs (OSINT entity networks, DD relationship maps), the platform delegates to KuzuDB's native graph engine.

KuzuDB's Cypher query language provides built-in shortest path support:

```elixir
defmodule PrismaticDd.RelationshipAnalyzer do
  @moduledoc """
  Analyzes entity relationships using KuzuDB shortest path queries.
  """

  @spec find_connection(String.t(), String.t()) :: {:ok, list()} | {:error, term()}
  def find_connection(source_entity_id, target_entity_id) do
    query = """
    MATCH path = shortestPath(
      (source:Entity {id: $source_id})-[:RELATED_TO*1..6]-(target:Entity {id: $target_id})
    )
    RETURN nodes(path) AS entities, relationships(path) AS connections
    """

    PrismaticStorage.KuzuDB.execute(query, %{
      source_id: source_entity_id,
      target_id: target_entity_id
    })
  end

  @spec all_shortest_paths(String.t(), String.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def all_shortest_paths(source_id, target_id, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 6)

    query = """
    MATCH path = allShortestPaths(
      (s:Entity {id: $source})-[:RELATED_TO*1..#{max_depth}]-(t:Entity {id: $target})
    )
    RETURN path, length(path) AS hops
    ORDER BY hops ASC
    """

    PrismaticStorage.KuzuDB.execute(query, %{source: source_id, target: target_id})
  end
end
```

The platform also uses Erlang's `:digraph` module for in-memory directed graphs, which provides built-in shortest path computation. The Academy `InterconnectionEngine` uses this for topic relationship mapping.

## Usage in Prismatic Platform

Shortest path queries power several critical platform features. The DD pipeline uses them to discover hidden ownership chains between entities. The Perimeter EASM module uses them to trace attack paths from internet-facing assets to internal systems. The Academy interconnection engine uses them to suggest learning paths between topics.

```elixir
defmodule PrismaticPerimeter.AttackPathAnalyzer do
  @moduledoc """
  Identifies shortest attack paths from external assets
  to critical internal systems using graph traversal.
  """

  @spec analyze(String.t()) :: {:ok, map()} | {:error, term()}
  def analyze(domain) do
    with {:ok, graph} <- build_asset_graph(domain),
         {:ok, external} <- find_external_assets(graph),
         {:ok, critical} <- find_critical_assets(graph) do
      paths =
        for source <- external, target <- critical do
          case PrismaticGraph.Dijkstra.shortest_path(graph, source.id, target.id) do
            {:ok, {cost, path}} -> %{from: source, to: target, cost: cost, path: path}
            {:error, :no_path} -> nil
          end
        end
        |> Enum.reject(&is_nil/1)
        |> Enum.sort_by(& &1.cost)

      {:ok, %{attack_paths: paths, shortest: List.first(paths)}}
    end
  end
end
```

## Cross-References

- [KuzuDB](@/glossary/kuzudb.md) - Graph database providing native shortest path queries
- [Graph Database](@/glossary/graph-database.md) - Storage technology optimized for path traversal
- **Cypher** - Query language with shortest path built-in functions
- [Knowledge Graph](@/glossary/knowledge-graph.md) - Semantic graph where path analysis reveals insights

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
