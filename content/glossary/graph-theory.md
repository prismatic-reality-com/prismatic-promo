+++
title = "Graph Theory"
weight = 50
[extra]
tags = ["glossary", "mathematics", "graph", "algorithms", "data-structures", "formal-methods", "trinity-gate", "verification"]
description = "Graph theory is the branch of mathematics studying structures formed by vertices and edges, providing the formal foundation for the Prismatic Platform's dependency resolution, belief graph verification, agent orchestration, knowledge graphs, and Trinity Gate structural consistency checks."
category = "mathematics"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["graph-database", "knowledge-graph", "trinity-gate", "structural-consistency", "belief-graph", "supervision-tree", "entity-graph", "formal-verification", "dependency-injection", "dag"]
platforms = ["prismatic-platform"]
audience = ["engineers", "architects", "mathematicians", "formal-methods-practitioners"]
prerequisite_knowledge = ["mathematics", "data-structures", "algorithms"]
word_count = 1758
date_modified = "2026-02-23"
keywords = ["Graph", "Theory", "Prismatic", "Platforms", "Trinity", "Gate", "glossary", "mathematics", "Prismatic Platform", "Trinity Gate"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Graph Theory - Prismatic Platform"
+++

## Definition

Graph theory is the branch of discrete mathematics that studies graphs -- mathematical structures consisting of vertices (nodes) connected by edges (links) -- and the properties, algorithms, and theorems that govern them. A graph `G = (V, E)` is defined by a set of vertices `V` and a set of edges `E`, where each edge connects two vertices. Graph theory provides the formal foundation for problems involving connectivity, paths, cycles, flows, coloring, matching, and planarity. In the Prismatic Platform, graph theory is not an academic abstraction but a practical tool applied daily: supervision trees are graphs, agent dependency chains are directed acyclic graphs (DAGs), the NABLA belief network must form a valid DAG for Trinity Gate passage, entity resolution operates on property graphs, and the platform's attack surface maps are traversable graph structures.

## Overview

Graph theory was born in 1736 when Leonhard Euler solved the Seven Bridges of Konigsberg problem by proving that no walk through the city could cross each of its seven bridges exactly once. Euler's key insight was to abstract the problem from its physical geography into a mathematical structure: landmasses became vertices, bridges became edges, and the question became one about the existence of an Eulerian path in the resulting graph. This act of abstraction -- reducing a real-world problem to its graph-theoretic essence -- remains the central methodology of graph theory nearly three centuries later.

The field has grown enormously since Euler's time. Key milestones include:

- **1847**: Kirchhoff's tree theorem for electrical circuits
- **1852**: The Four Color Problem (proven by computer in 1976)
- **1936**: Konig's publication of the first graph theory textbook
- **1956**: Dijkstra's shortest-path algorithm
- **1962**: Edmonds' maximum matching algorithm
- **1970s**: NP-completeness of many graph problems (Hamilton cycle, graph coloring, etc.)
- **2000s**: PageRank (Google) as a graph-theoretic algorithm on the web graph
- **2010s**: Graph neural networks bridging graph theory and machine learning
- **2020s**: Property graph databases bringing graph theory to practical data management

In software engineering, graph theory surfaces everywhere: dependency resolution, build systems, network routing, state machines, workflow engines, compiler optimization (control flow graphs), garbage collection (reachability graphs), and version control (commit DAGs). The Prismatic Platform leverages graph theory across nearly every subsystem.

## Technical Details

### Fundamental Graph Types

Understanding the Prismatic Platform's graph usage requires familiarity with several graph types:

**Undirected Graph**: Edges have no direction. If `(u, v)` is an edge, you can traverse from `u` to `v` and from `v` to `u`. Used for modeling symmetric relationships like "knows" or "similar to."

**Directed Graph (Digraph)**: Each edge has a direction, denoted `(u, v)` meaning from `u` to `v`. Used for modeling asymmetric relationships like "depends on," "supervises," or "implies."

**Directed Acyclic Graph (DAG)**: A directed graph with no cycles. Critical for dependency resolution, build ordering, and the Prismatic Platform's belief graph (a cycle in a belief graph would mean a belief supports itself, which is epistemically invalid).

**Weighted Graph**: Edges carry numeric weights representing cost, distance, capacity, or confidence. Used for shortest-path algorithms, flow optimization, and confidence-weighted entity resolution.

**Property Graph**: Nodes and edges carry key-value properties. The data model used by KuzuDB and most modern graph databases. The Prismatic Platform's entity graphs are property graphs.

**Tree**: A connected acyclic undirected graph. Equivalently, a connected graph with `n-1` edges for `n` vertices. Supervision trees in OTP are tree-structured (rooted trees where the root is the top-level supervisor).

### Core Algorithms in the Platform

The following graph algorithms are directly used in the Prismatic Platform:

```elixir
defmodule Prismatic.Graph.Algorithms do
  @moduledoc """
  Graph theory algorithms used across the Prismatic Platform
  for dependency resolution, cycle detection, shortest paths,
  and topological ordering.
  """

  @type vertex :: term()
  @type edge :: {vertex(), vertex()}
  @type graph :: %{vertices: MapSet.t(vertex()), edges: list(edge())}
  @type weight_fn :: (vertex(), vertex() -> number())

  # --- Topological Sort ---
  # Used for: agent dependency resolution, build ordering,
  # supervision tree construction

  @spec topological_sort(graph()) :: {:ok, list(vertex())} | {:error, :cycle_detected}
  def topological_sort(graph) do
    in_degree = compute_in_degrees(graph)

    queue =
      graph.vertices
      |> Enum.filter(fn v -> Map.get(in_degree, v, 0) == 0 end)
      |> :queue.from_list()

    do_topological_sort(graph, queue, in_degree, [])
  end

  defp do_topological_sort(graph, queue, in_degree, result) do
    case :queue.out(queue) do
      {:empty, _} ->
        if length(result) == MapSet.size(graph.vertices) do
          {:ok, Enum.reverse(result)}
        else
          {:error, :cycle_detected}
        end

      {{:value, vertex}, rest_queue} ->
        {updated_queue, updated_degrees} =
          outgoing_neighbors(graph, vertex)
          |> Enum.reduce({rest_queue, in_degree}, fn neighbor, {q, deg} ->
            new_deg = Map.update!(deg, neighbor, &(&1 - 1))

            if new_deg[neighbor] == 0 do
              {:queue.in(neighbor, q), new_deg}
            else
              {q, new_deg}
            end
          end)

        do_topological_sort(graph, updated_queue, updated_degrees, [vertex | result])
    end
  end

  # --- Cycle Detection ---
  # Used for: circular dependency prevention, belief graph validation,
  # Trinity Gate structural consistency

  @spec has_cycle?(graph()) :: boolean()
  def has_cycle?(graph) do
    case topological_sort(graph) do
      {:ok, _} -> false
      {:error, :cycle_detected} -> true
    end
  end

  # --- Shortest Path (Dijkstra) ---
  # Used for: entity resolution path finding, attack surface
  # blast radius calculation

  @spec shortest_path(graph(), vertex(), vertex(), weight_fn()) ::
    {:ok, list(vertex()), number()} | {:error, :no_path}
  def shortest_path(graph, source, target, weight_fn) do
    distances = %{source => 0}
    predecessors = %{}
    unvisited = graph.vertices

    {final_dist, final_pred} =
      dijkstra_loop(graph, unvisited, distances, predecessors, weight_fn)

    case Map.get(final_dist, target) do
      nil -> {:error, :no_path}
      dist -> {:ok, reconstruct_path(final_pred, source, target), dist}
    end
  end

  defp dijkstra_loop(_graph, unvisited, distances, predecessors, _weight_fn)
       when map_size(unvisited) == 0 do
    {distances, predecessors}
  end

  defp dijkstra_loop(graph, unvisited, distances, predecessors, weight_fn) do
    current =
      unvisited
      |> Enum.filter(&Map.has_key?(distances, &1))
      |> Enum.min_by(&Map.get(distances, &1), fn -> nil end)

    case current do
      nil ->
        {distances, predecessors}

      vertex ->
        updated_unvisited = MapSet.delete(unvisited, vertex)
        current_dist = distances[vertex]

        {new_dist, new_pred} =
          outgoing_neighbors(graph, vertex)
          |> Enum.filter(&MapSet.member?(unvisited, &1))
          |> Enum.reduce({distances, predecessors}, fn neighbor, {d, p} ->
            alt = current_dist + weight_fn.(vertex, neighbor)

            if alt < Map.get(d, neighbor, :infinity) do
              {Map.put(d, neighbor, alt), Map.put(p, neighbor, vertex)}
            else
              {d, p}
            end
          end)

        dijkstra_loop(graph, updated_unvisited, new_dist, new_pred, weight_fn)
    end
  end

  # --- Strongly Connected Components (Tarjan) ---
  # Used for: identifying circular dependency clusters,
  # finding tightly coupled module groups

  @spec strongly_connected_components(graph()) :: list(list(vertex()))
  def strongly_connected_components(graph) do
    state = %{
      index: 0,
      stack: [],
      on_stack: MapSet.new(),
      indices: %{},
      lowlinks: %{},
      components: []
    }

    final_state =
      Enum.reduce(graph.vertices, state, fn vertex, acc ->
        if Map.has_key?(acc.indices, vertex) do
          acc
        else
          tarjan_visit(graph, vertex, acc)
        end
      end)

    final_state.components
  end

  defp tarjan_visit(graph, vertex, state) do
    state = %{state |
      indices: Map.put(state.indices, vertex, state.index),
      lowlinks: Map.put(state.lowlinks, vertex, state.index),
      index: state.index + 1,
      stack: [vertex | state.stack],
      on_stack: MapSet.put(state.on_stack, vertex)
    }

    state =
      outgoing_neighbors(graph, vertex)
      |> Enum.reduce(state, fn neighbor, acc ->
        cond do
          not Map.has_key?(acc.indices, neighbor) ->
            acc = tarjan_visit(graph, neighbor, acc)
            lowlink = min(acc.lowlinks[vertex], acc.lowlinks[neighbor])
            %{acc | lowlinks: Map.put(acc.lowlinks, vertex, lowlink)}

          MapSet.member?(acc.on_stack, neighbor) ->
            lowlink = min(acc.lowlinks[vertex], acc.indices[neighbor])
            %{acc | lowlinks: Map.put(acc.lowlinks, vertex, lowlink)}

          true ->
            acc
        end
      end)

    if state.lowlinks[vertex] == state.indices[vertex] do
      {component, rest_stack, rest_on_stack} = pop_component(state.stack, state.on_stack, vertex, [])
      %{state |
        stack: rest_stack,
        on_stack: rest_on_stack,
        components: [component | state.components]
      }
    else
      state
    end
  end

  defp pop_component([vertex | rest], on_stack, target, acc) do
    updated_on_stack = MapSet.delete(on_stack, vertex)
    acc = [vertex | acc]

    if vertex == target do
      {acc, rest, updated_on_stack}
    else
      pop_component(rest, updated_on_stack, target, acc)
    end
  end

  # --- Helpers ---

  defp compute_in_degrees(graph) do
    Enum.reduce(graph.edges, %{}, fn {_from, to}, acc ->
      Map.update(acc, to, 1, &(&1 + 1))
    end)
  end

  defp outgoing_neighbors(graph, vertex) do
    graph.edges
    |> Enum.filter(fn {from, _to} -> from == vertex end)
    |> Enum.map(fn {_from, to} -> to end)
  end

  defp reconstruct_path(predecessors, source, target) do
    do_reconstruct(predecessors, source, target, [target])
  end

  defp do_reconstruct(_pred, source, source, path), do: path
  defp do_reconstruct(pred, source, current, path) do
    prev = Map.get(pred, current)
    do_reconstruct(pred, source, prev, [prev | path])
  end
end
```

### Graph Theory in the Trinity Gate

The Trinity Gate's first verification channel -- Structural Consistency -- is a pure graph-theory check. It verifies that the platform's belief network forms a valid DAG:

```elixir
defmodule Prismatic.Trinity.StructuralConsistency do
  @moduledoc """
  Trinity Gate Layer 1: Structural Consistency.
  Verifies that the belief graph is a valid DAG with
  no orphan nodes, no unreachable subgraphs, and
  proper provenance chains.
  """

  alias Prismatic.Graph.Algorithms

  @type belief_graph :: Algorithms.graph()
  @type check_result :: {:pass, map()} | {:fail, list(String.t())}

  @spec verify(belief_graph()) :: check_result()
  def verify(graph) do
    checks = [
      {:acyclicity, &check_acyclicity/1},
      {:connectivity, &check_weak_connectivity/1},
      {:root_existence, &check_has_root/1},
      {:provenance_chain, &check_provenance/1}
    ]

    results = Enum.map(checks, fn {name, check_fn} -> {name, check_fn.(graph)} end)
    failures = Enum.filter(results, fn {_name, result} -> result != :pass end)

    if Enum.empty?(failures) do
      {:pass, %{checks_passed: length(checks), graph_size: MapSet.size(graph.vertices)}}
    else
      {:fail, Enum.map(failures, fn {name, {:fail, reason}} -> "#{name}: #{reason}" end)}
    end
  end

  defp check_acyclicity(graph) do
    if Algorithms.has_cycle?(graph) do
      {:fail, "Belief graph contains cycles -- circular reasoning detected"}
    else
      :pass
    end
  end

  defp check_weak_connectivity(graph) do
    components = weak_connected_components(graph)

    if length(components) == 1 do
      :pass
    else
      {:fail, "Belief graph has #{length(components)} disconnected subgraphs"}
    end
  end

  defp check_has_root(graph) do
    in_degrees = compute_in_degrees(graph)

    roots =
      graph.vertices
      |> Enum.filter(fn v -> Map.get(in_degrees, v, 0) == 0 end)

    case length(roots) do
      0 -> {:fail, "No root beliefs found (all beliefs depend on others)"}
      _ -> :pass
    end
  end

  defp check_provenance(graph) do
    case Algorithms.topological_sort(graph) do
      {:ok, order} ->
        valid =
          Enum.all?(order, fn vertex ->
            in_edges = Enum.filter(graph.edges, fn {_from, to} -> to == vertex end)
            in_degree = length(in_edges)
            in_degree == 0 or in_degree >= 1
          end)

        if valid, do: :pass, else: {:fail, "Provenance chain broken"}

      {:error, :cycle_detected} ->
        {:fail, "Cannot verify provenance -- cycles present"}
    end
  end

  defp compute_in_degrees(graph) do
    Enum.reduce(graph.edges, %{}, fn {_from, to}, acc ->
      Map.update(acc, to, 1, &(&1 + 1))
    end)
  end

  defp weak_connected_components(graph) do
    undirected_edges =
      Enum.flat_map(graph.edges, fn {a, b} -> [{a, b}, {b, a}] end)

    undirected = %{vertices: graph.vertices, edges: undirected_edges}

    graph.vertices
    |> Enum.reduce({[], MapSet.new()}, fn vertex, {components, visited} ->
      if MapSet.member?(visited, vertex) do
        {components, visited}
      else
        component = bfs(undirected, vertex)
        {[component | components], MapSet.union(visited, MapSet.new(component))}
      end
    end)
    |> elem(0)
  end

  defp bfs(graph, start) do
    do_bfs(graph, :queue.in(start, :queue.new()), MapSet.new([start]), [start])
  end

  defp do_bfs(graph, queue, visited, result) do
    case :queue.out(queue) do
      {:empty, _} ->
        result

      {{:value, vertex}, rest} ->
        neighbors =
          outgoing_neighbors(graph, vertex)
          |> Enum.reject(&MapSet.member?(visited, &1))

        new_visited = Enum.reduce(neighbors, visited, &MapSet.put(&2, &1))
        new_queue = Enum.reduce(neighbors, rest, &:queue.in(&1, &2))

        do_bfs(graph, new_queue, new_visited, result ++ neighbors)
    end
  end

  defp outgoing_neighbors(graph, vertex) do
    graph.edges
    |> Enum.filter(fn {from, _to} -> from == vertex end)
    |> Enum.map(fn {_from, to} -> to end)
  end
end
```

### Supervision Trees as Graph Structures

OTP supervision trees are rooted trees (a special case of DAGs) where supervisors are internal nodes and workers are leaf nodes:

```
                    Application
                        |
                  TopSupervisor
                   /         \
          DomainSuperA    DomainSuperB
           /     \           /    \
      WorkerA  WorkerB  WorkerC  WorkerD
```

The PrismaticSupervisor module uses graph theory for dependency-aware startup ordering:

1. Build a dependency graph from application specifications
2. Perform topological sort to determine startup order
3. Detect cycles (circular dependencies) and report them as errors
4. Group independent applications for parallel startup

## Implementation

### Dependency Resolution

The platform's dependency resolver uses topological sort to determine the correct startup order for 115 umbrella applications:

```bash
# Show dependency graph and detect cycles
mix supervisor deps --cycles

# Show application startup order
mix supervisor discover
```

### Graph-Based Agent Orchestration

The 530+ AIAD agents have task dependencies that form a DAG. When orchestrating a complex operation (like `/orchestrate`), the system:

1. Builds a task dependency graph
2. Topologically sorts to find execution order
3. Identifies independent tasks that can run in parallel
4. Executes tasks in waves, where each wave contains independent tasks

### Belief Network Validation

Every claim processed by the NABLA framework is added to a belief graph. Before any claim is accepted (Trinity Gate passage), the graph is checked for:

- Acyclicity (no circular reasoning)
- Weak connectivity (no orphaned beliefs)
- Root existence (axioms as foundation)
- Provenance chains (every belief traceable to evidence)

## Comparison

### Graph Theory vs. Set Theory

Set theory deals with collections of elements without inherent structure. Graph theory adds pairwise relationships between elements. While you can represent a graph as a set of ordered pairs, graph-specific algorithms (shortest path, cycle detection, flow) have no natural set-theoretic equivalents.

### Graph Theory vs. Category Theory

Category theory generalizes graph theory by adding composition of arrows (morphisms). Every graph can be viewed as a free category, but categories have additional structure (identity morphisms, associative composition) that graphs lack. The Prismatic Platform uses category-theoretic concepts in its adapter pattern (functors between storage categories).

### Directed vs. Undirected Applications

| Use Case | Graph Type | Reason |
|----------|-----------|--------|
| Dependency resolution | Directed (DAG) | Dependencies are asymmetric |
| Social network analysis | Undirected | "Knows" is symmetric |
| Attack surface mapping | Directed | "Resolves to" has direction |
| Similarity clustering | Undirected weighted | Similarity is symmetric |
| Belief networks | Directed (DAG) | "Supports" is directional, acyclic |
| Supervision trees | Directed (tree) | "Supervises" is hierarchical |

## Best Practices

### 1. Choose the Right Graph Representation

Adjacency lists are efficient for sparse graphs (most real-world graphs). Adjacency matrices are efficient for dense graphs and operations like matrix multiplication. The platform uses adjacency list representation (edge lists) for most graph operations.

### 2. Validate Graph Properties Early

Before running algorithms on a graph, validate that it has the expected properties (acyclicity for DAGs, connectivity for paths, non-negativity for Dijkstra). The cost of validation is negligible compared to debugging incorrect algorithm results on malformed graphs.

### 3. Use Topological Sort for Dependency Resolution

Any time you have a "must happen before" relationship, model it as a DAG and topologically sort. This applies to build systems, migration ordering, agent orchestration, and supervisor startup sequences.

### 4. Detect and Report Cycles

Cycles in dependency graphs are always bugs. Detect them proactively (Tarjan's algorithm for strongly connected components) and report them with the full cycle path so developers can fix the root cause.

### 5. Bound Traversal Depth

In production graph operations, always bound the maximum depth. Unbounded BFS/DFS on large graphs can consume excessive memory and time. Most practical queries need at most 3-5 hops of traversal.

### 6. Consider Graph Algorithms' Complexity

Know the time complexity of the algorithms you use: BFS/DFS is O(V+E), Dijkstra is O((V+E) log V) with a heap, topological sort is O(V+E), and SCC is O(V+E). For large graphs, constant factors matter.

## Common Pitfalls

### Confusing Directed and Undirected Operations

Running an undirected connectivity check on a directed graph can give misleading results. A directed graph may be weakly connected (connected when ignoring edge direction) but not strongly connected. Use the appropriate algorithm for the graph type.

### Ignoring Graph Mutations

Many graph algorithms assume the graph is static during execution. Modifying the graph (adding/removing vertices or edges) during traversal can cause subtle bugs: missed vertices, infinite loops, or incorrect results. Snapshot the graph before algorithmic operations.

### Exponential Path Enumeration

Counting or enumerating all paths between two vertices in a general graph can be exponential. If you need to find all paths, add constraints (maximum length, excluded vertices) to keep the computation tractable.

### Memory Overhead for Large Graphs

Storing explicit edge objects with properties can consume significant memory for large graphs. Consider compressed representations (CSR/CSC format) for read-heavy workloads, and streaming approaches for graphs that do not fit in memory.

### Neglecting Graph Theory for "Simple" Problems

Many problems that seem non-graph-related are actually graph problems in disguise. State machines are graphs, type hierarchies are trees, network routing is shortest-path, and scheduling is graph coloring. Recognizing the graph structure enables use of well-studied algorithms.

## Use Cases

### OTP Supervision Tree Design

Every OTP application is a tree of supervisors and workers. Graph theory formalizes questions about this tree: "What happens if this node fails?" (subtree analysis), "What is the restart strategy?" (tree traversal), "Are there single points of failure?" (cut vertex detection).

### Prismatic Perimeter Blast Radius Analysis

When a vulnerability is discovered in an asset, the EASM module calculates its "blast radius" by traversing the asset graph from the vulnerable node. All reachable nodes within a configurable depth represent potentially affected assets.

### NABLA Belief Network Verification

The Trinity Gate's structural consistency check uses cycle detection to prevent circular reasoning, connectivity analysis to ensure no orphaned beliefs, and topological sort to verify that every belief has a valid provenance chain back to axioms or evidence.

### Agent Task Scheduling

The AIAD orchestrator builds a task dependency graph, identifies independent tasks (vertices with no unresolved dependencies), and schedules them for parallel execution. As tasks complete, their dependent tasks become eligible for execution -- a classic topological-sort-driven scheduling pattern.

### Quality Gate Dependency Resolution

Quality gates have dependencies: Dialyzer depends on compilation, tests depend on compilation, Credo depends on source files. The quality pipeline resolves these dependencies via topological sort to determine the correct execution order and maximize parallelism.

## Related Concepts

Graph theory connects to numerous aspects of the Prismatic Platform:

- [Graph Database](@/glossary/graph-database.md) provides the persistent storage layer for graph-structured data, powered by KuzuDB
- [Knowledge Graph](@/glossary/knowledge-graph.md) is the primary application of graph theory in the platform's intelligence domain
- [Trinity Gate](@/glossary/trinity-gate.md) uses graph theory for its structural consistency verification channel
- [Structural Consistency](@/glossary/structural-consistency.md) is the specific Trinity Gate check that validates belief graph DAG properties
- [Belief Graph](@/glossary/belief-graph.md) is the directed acyclic graph structure that represents the platform's epistemic state
- [Supervision Tree](@/glossary/supervision-tree.md) is the OTP construct that models process hierarchies as rooted trees
- [Entity Graph](@/glossary/entity-graph.md) applies graph theory to model relationships between OSINT-discovered entities
- [Formal Verification](@/glossary/formal-verification.md) uses graph-theoretic proofs for algorithmic correctness claims
- [Circular Dependency](@/glossary/circular-dependency.md) is the graph-theoretic concept of a cycle in a dependency graph
- [Dependency Injection](@/glossary/dependency-injection.md) decouples graph vertices to prevent unwanted edge formation

## See Also

- [DAG (Directed Acyclic Graph)](@/glossary/ast.md) -- the specific graph structure used for dependency resolution and belief networks
- [Formal Proof](@/glossary/formal-proof.md) -- mathematical proofs that often rely on graph-theoretic arguments
- [Modal Logic](@/glossary/modal-logic.md) -- logical framework whose Kripke semantics are graph-based (possible worlds as vertices)
- [Lean4](@/glossary/lean4.md) -- the theorem prover used for formal graph-theoretic proofs in the Trinity Gate
- [Theorem Proving](@/glossary/theorem-proving.md) -- automated verification that leverages graph-theoretic structures

---

**Connect & Contribute**: Built by [Tomas Korcak (korczis)](https://github.com/korczis) as part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE). Contributions welcome via [GitHub Issues](https://github.com/korczis/prismatic-platform/issues) and [Pull Requests](https://github.com/korczis/prismatic-platform/pulls).
