+++
title = "Circular Dependency"
weight = 50
[extra]
tags = ["glossary", "architecture", "dependency", "anti-pattern", "modularity", "compilation", "umbrella", "design"]
description = "A dependency relationship where two or more modules depend on each other creating a cycle that prevents clean compilation and hinders modular design, detected and blocked in the Prismatic Platform umbrella structure"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Software Architecture & Design"
related_concepts = ["dependency-injection", "modularity", "bounded-context", "compilation", "umbrella-application", "supervision-tree", "adapter-pattern"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["modularity", "compilation", "umbrella-application"]
learning_path = "fundamentals -> modularity -> circular-dependency -> bounded-context -> architecture"
interactive_demos = ["/labs/glossary/circular-dependency"]
code_examples = ["elixir", "bash"]
external_resources = ["https://hexdocs.pm/mix/Mix.Tasks.Deps.html", "https://en.wikipedia.org/wiki/Circular_dependency"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["cycle-detection", "compilation-order-validation", "dependency-graph-analysis", "refactoring-verification"]
keywords = ["circular dependency", "dependency cycle", "compilation order", "DAG", "directed acyclic graph", "umbrella apps", "modularity", "coupling", "decoupling"]
related_terms = ["dependency-injection", "modularity", "bounded-context", "compilation", "umbrella-application", "adapter-pattern", "behaviour", "supervision-tree", "graph-theory", "otp"]
word_count = 1587
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Circular Dependency - Prismatic Platform"
+++

## Definition

A **Circular Dependency** (also called a dependency cycle or cyclic dependency) is a relationship between two or more software modules where each module directly or transitively depends on the others, forming a cycle in the dependency graph. In a circular dependency between modules A and B, module A depends on module B and module B depends on module A -- neither can be compiled, loaded, or tested independently. In larger systems, cycles can span three or more modules (A depends on B, B depends on C, C depends on A), making them harder to detect and resolve.

In the Prismatic Platform's 115-app [umbrella application](/glossary/umbrella-application/) architecture, circular dependencies are treated as critical architectural violations. They are detected by the AIAD indexer, blocked by the [pre-commit hooks](/glossary/pre-commit-hooks/), and prevented by design through protocols, behaviours, and the [adapter pattern](/glossary/adapter-pattern/). The dependency graph of all umbrella applications must form a Directed Acyclic Graph (DAG) -- any cycle is an immediate build failure.

## Overview

Circular dependencies are among the most common and damaging architectural anti-patterns in software engineering. They create tight coupling between modules, prevent independent compilation and testing, make refactoring dangerous, and obscure the true architecture of a system.

In the Elixir/OTP ecosystem, circular dependencies manifest at two levels:

1. **Application-level**: Two umbrella applications listing each other in their `deps` -- Mix will refuse to compile this configuration.
2. **Module-level**: Two modules calling functions from each other, which can compile but creates runtime coupling that undermines the supervision tree and makes the system brittle.

The Prismatic Platform addresses both levels:

- **Application-level cycles** are prevented by Mix's built-in dependency resolution and additionally validated by `mix supervisor deps --cycles` which analyzes the full dependency graph.
- **Module-level cycles** are detected by static analysis through [Credo](/glossary/credo/) rules and the AIAD indexer, which builds a complete call graph across all 115 applications.

The fundamental insight is that a well-designed system's dependency graph should form a DAG (Directed Acyclic Graph). In a DAG, you can always find a topological ordering -- a sequence in which modules can be compiled, tested, and deployed one at a time, each depending only on modules that come before it. Circular dependencies destroy this property, making the system irreducible.

## Technical Details

### Dependency Graph Theory

A dependency graph G = (V, E) where V is the set of modules and E is the set of dependency edges must satisfy the DAG property: there exists no path from any vertex v back to itself.

| Property | DAG (Desired) | Cyclic Graph (Violation) |
|----------|---------------|--------------------------|
| Topological sort | Always exists | Impossible |
| Independent compilation | Yes (in topo order) | No (requires simultaneous) |
| Independent testing | Yes | No (tests require cycle) |
| Incremental builds | Efficient | Must rebuild entire cycle |
| Refactoring safety | Change one module at a time | Must change all in cycle simultaneously |
| Comprehension | Follow dependency chain linearly | Must understand entire cycle at once |

### Types of Circular Dependencies

| Type | Example | Detection | Severity |
|------|---------|-----------|----------|
| **Direct** | A depends on B, B depends on A | Compile-time (Mix) | Critical -- build failure |
| **Transitive** | A -> B -> C -> A | `mix supervisor deps --cycles` | Critical -- hidden coupling |
| **Runtime** | A calls B dynamically, B calls A | Static analysis, call graph | High -- brittle at runtime |
| **Data** | A's struct contains B's struct, B's contains A's | Compile-time | Critical -- compilation loop |
| **Test** | A's tests depend on B, B's tests depend on A | Test suite analysis | Medium -- test isolation failure |

### Elixir Detection and Prevention

The Prismatic Platform implements multi-layer cycle detection:

```elixir
defmodule PrismaticArchitecture.CycleDetector do
  @moduledoc """
  Detects circular dependencies in the umbrella application dependency graph.
  Uses Kahn's algorithm for topological sorting -- if the sort cannot complete,
  the remaining nodes form one or more cycles.

  Integrates with the AIAD indexer for module-level call graph analysis
  and with pre-commit hooks for build-time enforcement.
  """

  @type app :: atom()
  @type dependency_graph :: %{app() => [app()]}
  @type cycle :: [app()]
  @type detection_result :: {:ok, :acyclic, [app()]} | {:error, :cycles_detected, [cycle()]}

  @doc """
  Analyzes the umbrella application dependency graph for cycles.
  Returns {:ok, :acyclic, topological_order} if no cycles exist,
  or {:error, :cycles_detected, cycles} listing all detected cycles.
  """
  @spec detect_cycles() :: detection_result()
  def detect_cycles do
    graph = build_dependency_graph()
    kahns_algorithm(graph)
  end

  @doc """
  Builds the dependency graph from all umbrella application mix.exs files.
  """
  @spec build_dependency_graph() :: dependency_graph()
  def build_dependency_graph do
    umbrella_apps = list_umbrella_apps()

    Map.new(umbrella_apps, fn app ->
      deps =
        app
        |> app_deps()
        |> Enum.filter(&(&1 in umbrella_apps))

      {app, deps}
    end)
  end

  @doc """
  Finds the shortest cycle containing a specific application,
  useful for debugging which apps are involved in a cycle.
  """
  @spec find_cycle_containing(app(), dependency_graph()) :: {:ok, cycle()} | {:error, :no_cycle}
  def find_cycle_containing(target_app, graph) do
    case dfs_cycle(target_app, graph, [target_app], MapSet.new([target_app])) do
      {:found, cycle} -> {:ok, Enum.reverse(cycle)}
      :not_found -> {:error, :no_cycle}
    end
  end

  @doc """
  Suggests resolution strategies for a detected cycle based on
  the dependency types and module relationships involved.
  """
  @spec suggest_resolution(cycle()) :: [String.t()]
  def suggest_resolution(cycle) do
    cycle
    |> analyze_cycle_edges()
    |> Enum.map(&resolution_strategy/1)
  end

  # --- Private Functions ---

  # Kahn's algorithm for topological sort with cycle detection
  defp kahns_algorithm(graph) do
    in_degree = calculate_in_degrees(graph)

    # Start with nodes that have no incoming edges
    queue =
      in_degree
      |> Enum.filter(fn {_node, degree} -> degree == 0 end)
      |> Enum.map(fn {node, _degree} -> node end)

    process_queue(queue, graph, in_degree, [])
  end

  defp process_queue([], _graph, in_degree, sorted) do
    remaining =
      in_degree
      |> Enum.filter(fn {_node, degree} -> degree > 0 end)
      |> Enum.map(fn {node, _degree} -> node end)

    if Enum.empty?(remaining) do
      {:ok, :acyclic, Enum.reverse(sorted)}
    else
      cycles = extract_cycles(remaining, _graph)
      {:error, :cycles_detected, cycles}
    end
  end

  defp process_queue([node | rest], graph, in_degree, sorted) do
    neighbors = Map.get(graph, node, [])

    updated_in_degree =
      Enum.reduce(neighbors, in_degree, fn neighbor, acc ->
        Map.update!(acc, neighbor, &(&1 - 1))
      end)

    new_queue =
      neighbors
      |> Enum.filter(fn n -> Map.get(updated_in_degree, n) == 0 end)

    process_queue(rest ++ new_queue, graph, updated_in_degree, [node | sorted])
  end

  defp calculate_in_degrees(graph) do
    all_nodes = Map.keys(graph)
    initial = Map.new(all_nodes, fn node -> {node, 0} end)

    Enum.reduce(graph, initial, fn {_node, deps}, acc ->
      Enum.reduce(deps, acc, fn dep, inner_acc ->
        Map.update(inner_acc, dep, 1, &(&1 + 1))
      end)
    end)
  end

  defp extract_cycles(remaining_nodes, graph) do
    # Tarjan's strongly connected components on remaining nodes
    remaining_graph =
      graph
      |> Map.take(remaining_nodes)
      |> Map.new(fn {k, v} -> {k, Enum.filter(v, &(&1 in remaining_nodes))} end)

    tarjans_scc(remaining_graph)
  end

  defp tarjans_scc(graph) do
    {_, _, sccs} =
      Enum.reduce(Map.keys(graph), {%{}, [], []}, fn node, {state, stack, sccs} ->
        if Map.has_key?(state, node) do
          {state, stack, sccs}
        else
          tarjan_visit(node, graph, state, stack, sccs, map_size(state))
        end
      end)

    Enum.filter(sccs, fn scc -> length(scc) > 1 end)
  end

  defp tarjan_visit(node, graph, state, stack, sccs, index) do
    state = Map.put(state, node, %{index: index, lowlink: index, on_stack: true})
    stack = [node | stack]

    {state, stack, sccs, _} =
      Enum.reduce(Map.get(graph, node, []), {state, stack, sccs, index + 1}, fn
        neighbor, {st, stk, sc, idx} ->
          cond do
            not Map.has_key?(st, neighbor) ->
              {st2, stk2, sc2, idx2} = tarjan_visit(neighbor, graph, st, stk, sc, idx)
              node_state = Map.get(st2, node)
              neighbor_state = Map.get(st2, neighbor)
              new_lowlink = min(node_state.lowlink, neighbor_state.lowlink)
              st3 = Map.put(st2, node, %{node_state | lowlink: new_lowlink})
              {st3, stk2, sc2, idx2}

            Map.get(st, neighbor, %{}).on_stack == true ->
              node_state = Map.get(st, node)
              neighbor_state = Map.get(st, neighbor)
              new_lowlink = min(node_state.lowlink, neighbor_state.index)
              st2 = Map.put(st, node, %{node_state | lowlink: new_lowlink})
              {st2, stk, sc, idx}

            true ->
              {st, stk, sc, idx}
          end
      end)

    node_state = Map.get(state, node)

    if node_state.lowlink == node_state.index do
      {scc, new_stack, new_state} = pop_scc(node, stack, state)
      {new_state, new_stack, [scc | sccs], index + 1}
    else
      {state, stack, sccs, index + 1}
    end
  end

  defp pop_scc(root, stack, state, acc \\ []) do
    [top | rest] = stack
    state = Map.update!(state, top, &%{&1 | on_stack: false})

    if top == root do
      {[top | acc], rest, state}
    else
      pop_scc(root, rest, state, [top | acc])
    end
  end

  defp dfs_cycle(current, graph, path, visited) do
    neighbors = Map.get(graph, current, [])

    Enum.find_value(neighbors, :not_found, fn neighbor ->
      cond do
        neighbor == hd(Enum.reverse(path)) and length(path) > 1 ->
          {:found, [neighbor | path]}

        neighbor in visited ->
          :not_found

        true ->
          dfs_cycle(neighbor, graph, [neighbor | path], MapSet.put(visited, neighbor))
      end
    end)
  end

  defp list_umbrella_apps do
    "apps"
    |> File.ls!()
    |> Enum.map(&String.to_atom/1)
  end

  defp app_deps(app) do
    mix_path = Path.join(["apps", Atom.to_string(app), "mix.exs"])

    if File.exists?(mix_path) do
      mix_path
      |> File.read!()
      |> extract_deps_from_mix()
    else
      []
    end
  end

  defp extract_deps_from_mix(content) do
    # Extract in_umbrella deps from mix.exs content
    ~r/:(\w+),\s*in_umbrella:\s*true/
    |> Regex.scan(content)
    |> Enum.map(fn [_, dep] -> String.to_atom(dep) end)
  end

  defp analyze_cycle_edges(cycle) do
    cycle
    |> Enum.chunk_every(2, 1, [hd(cycle)])
    |> Enum.map(fn [from, to] -> {from, to} end)
  end

  defp resolution_strategy({from, to}) do
    "Extract shared interface between #{from} and #{to} into a new protocol/behaviour module"
  end
end
```

### Resolution Strategies

When a circular dependency is detected, the following resolution patterns are applied in order of preference:

| Strategy | Description | Complexity | When to Use |
|----------|-------------|-----------|-------------|
| **Extract Interface** | Create a behaviour/protocol in a shared base app | Low | Two apps share a contract |
| **Dependency Inversion** | Depend on abstraction, not implementation | Medium | One direction is primary |
| **Event-Based Decoupling** | Replace direct calls with PubSub events | Medium | Loose coupling sufficient |
| **Mediator Pattern** | Third module coordinates between two | High | Complex bidirectional communication |
| **Merge Modules** | Combine tightly coupled modules | Last resort | True cohesion, artificial separation |

### Prismatic Resolution Example

The `prismatic_storage_core` application exists specifically to break potential cycles between storage adapters:

```
BEFORE (hypothetical cycle):
  prismatic_storage_ets --> prismatic_storage_ecto
  prismatic_storage_ecto --> prismatic_storage_ets

AFTER (resolved with shared traits):
  prismatic_storage_ets --> prismatic_storage_core (traits/protocols)
  prismatic_storage_ecto --> prismatic_storage_core (traits/protocols)
  prismatic_storage_core --> (no umbrella deps)
```

The `prismatic_storage_core` application defines the `StorageAdapter` behaviour that all storage implementations conform to. This breaks the cycle by introducing a dependency inversion -- both adapters depend on the abstraction rather than on each other.

## Implementation in Prismatic Platform

Circular dependency prevention is enforced at multiple levels in the Prismatic Platform:

**Mix Dependency Resolution**: Elixir's Mix build tool inherently prevents application-level circular dependencies. If two apps in `apps/` list each other in their `deps`, compilation fails immediately with a clear error message.

**AIAD Indexer**: The `.aiad/bin/aiad index` command builds a complete dependency graph across all 115 umbrella applications and 530+ agents. It detects both direct and transitive cycles, reporting them as critical violations.

**Pre-Commit Phase 9**: The [quality gates](/glossary/quality-gate/) phase of the pre-commit hooks includes dependency graph validation. Any commit that introduces a circular dependency is blocked.

**PrismaticSupervisor Integration**: The `DependencyResolver` module in `prismatic_supervisor` uses topological sorting to determine application startup order. If a cycle exists, the resolver reports the cycle and refuses to produce a startup order -- preventing runtime failures from circular dependencies.

**Architecture Conventions**: The platform follows a strict layering convention where dependencies flow downward: `prismatic_web` -> `prismatic` -> `prismatic_agents` -> `prismatic_storage_*` -> `prismatic_storage_core`. Cross-layer dependencies are forbidden.

**Behaviour-Based Decoupling**: The extensive use of OTP behaviours (`@behaviour`, `@callback`) throughout the platform prevents tight coupling. Modules depend on behaviour contracts, not concrete implementations, eliminating the most common source of circular dependencies.

## Comparison with Alternatives

| Approach | Detection | Prevention | Resolution | Scalability |
|----------|-----------|-----------|------------|-------------|
| **Prismatic (multi-layer)** | Compile-time + static analysis + indexer | Architecture conventions + behaviours | 5 resolution strategies | 115 apps, proven |
| **Compile-time only** | Build failure on direct cycles | None (reactive only) | Manual refactoring | Limited visibility |
| **Linter rules** | Pattern matching on imports | Warning-based | Suggestions only | Good for small codebases |
| **Architecture Decision Records** | Human review | Documentation | Design guidance | Depends on discipline |
| **No prevention** | Runtime failures | None | Firefighting | Does not scale |

## Best Practices

1. **Design Dependencies Before Code**: When creating a new umbrella application, map its dependency relationships before writing any code. The dependency graph should be a conscious design decision, not an emergent property.

2. **Use Behaviours for Contracts**: Define `@behaviour` modules in lower-level applications. Higher-level applications implement these behaviours, ensuring dependencies always flow downward.

3. **One-Way Data Flow**: Structure applications so that data flows in one direction through the dependency graph. If two apps need to exchange data, use events or a shared data store rather than direct function calls.

4. **Extract Core Libraries**: Shared types, protocols, and behaviours should live in dedicated "core" applications (like `prismatic_storage_core`) that have no umbrella dependencies.

5. **Run Cycle Detection Regularly**: Use `mix supervisor deps --cycles` as part of the development workflow, not just in CI. Catching cycles early is cheaper than fixing them after they propagate.

6. **Prefer Protocols Over Direct Calls**: Elixir protocols provide polymorphic dispatch without requiring the caller to know the implementation module, naturally preventing circular dependencies.

7. **Document Dependency Rationale**: When adding a new dependency between umbrella apps, document why the dependency exists. This helps future developers avoid introducing cycles when refactoring.

## Common Pitfalls

1. **Convenience Dependencies**: Adding a dependency because it is convenient rather than architecturally sound. "App A already has this helper function, let me just depend on it from App B" -- even though App B is at a lower architectural layer.

2. **Test-Time Cycles**: Tests that depend on modules from other applications in ways that the production code does not. While these do not cause compile-time failures, they create hidden coupling that breaks test isolation.

3. **Macro-Induced Cycles**: Using macros from another module can create compile-time dependencies that are not visible in the `mix.exs` deps list. The AIAD indexer detects these through AST analysis.

4. **Configuration Coupling**: Two applications reading the same configuration keys and assuming specific formats. This is a soft circular dependency that does not show up in dependency analysis but creates tight coupling.

5. **Struct Dependencies**: Referencing another application's struct type in a module creates a compile-time dependency. Use protocols or plain maps at module boundaries instead.

6. **Ignoring Transitive Cycles**: Only checking for direct A<->B cycles while missing A->B->C->A transitive cycles. Kahn's algorithm (implemented in `CycleDetector`) catches both.

## Use Cases

### Umbrella Application Design

When designing a new feature that spans multiple umbrella applications, the developer first maps the dependency graph. For example, adding a new OSINT adapter requires changes in `prismatic_osint` (adapter implementation), `prismatic_storage_ecto` (persistence), and `prismatic_web` (LiveView UI). The dependency flow is `prismatic_web -> prismatic_osint -> prismatic_storage_ecto -> prismatic_storage_core` -- a clean downward chain with no cycles.

### Refactoring Legacy Coupling

When the AIAD indexer identifies a module-level circular dependency between two components, the resolution process follows: (1) identify the shared contract, (2) extract it into a behaviour in the lower-level app, (3) have the higher-level app implement the behaviour, (4) verify the cycle is broken with `mix supervisor deps --cycles`.

### Startup Order Determination

The `PrismaticSupervisor.DependencyResolver` uses the dependency DAG to determine the correct startup order for all 115 umbrella applications. Applications with no dependencies start first, then applications that depend only on already-started applications, continuing until all applications are running. A circular dependency would make this impossible.

### Continuous Architecture Validation

Every commit triggers dependency graph analysis through the pre-commit hooks. This means the architecture is continuously validated -- it is impossible for a circular dependency to be introduced without immediate detection and blocking.

## Related Concepts

- [Dependency Injection](/glossary/dependency-injection/) -- Pattern for inverting dependencies to break cycles
- [Modularity](/glossary/modularity/) -- Design principle that circular dependencies violate
- [Bounded Context](/glossary/bounded-context/) -- Domain boundary that prevents cross-domain cycles
- [Compilation](/glossary/compilation/) -- Process that fails when circular dependencies exist
- [Umbrella Application](/glossary/umbrella-application/) -- Architecture where cycles are detected at the app level
- [Adapter Pattern](/glossary/adapter-pattern/) -- Pattern used to break cycles through abstraction
- [Behaviour](/glossary/behaviour/) -- OTP mechanism for defining contracts that prevent tight coupling
- [Supervision Tree](/glossary/supervision-tree/) -- Tree structure that requires acyclic dependencies
- [Graph Theory](/glossary/graph-theory/) -- Mathematical foundation for dependency analysis
- [OTP](/glossary/otp/) -- Framework whose design principles prevent circular dependencies

## See Also

- [Quality Gate](/glossary/quality-gate/) -- Gates that enforce acyclic dependency graphs
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- Hooks that block circular dependency introduction
- [Credo](/glossary/credo/) -- Static analysis tool that detects coupling patterns
- [AIAD](/glossary/aiad/) -- Framework with dependency indexing capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
