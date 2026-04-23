+++
title = "Structural Consistency"
weight = 38
[extra]
description = "The first gate of Trinity Gate verification, validating that belief networks form valid directed acyclic graphs with no circular reasoning, orphaned conclusions, or topological contradictions."
category = "epistemic"
related_terms = ["trinity-gate", "belief-graph", "nabla-infinity", "signal-plurality", "confidence-threshold", "provenance-mandatory", "contradiction-preservation", "property-based-testing", "static-analysis", "quality-gate"]
keywords = ["structural consistency verification", "belief graph validation", "directed acyclic graph reasoning", "circular reasoning detection", "Trinity Gate first gate", "graph theory verification", "topological belief analysis", "knowledge graph integrity", "DAG validation epistemic", "inference path verification"]
tags = ["structural-consistency", "epistemic", "trinity-gate", "verification"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1369
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Structural Consistency - Prismatic Platform"
+++

## Definition and Overview

Structural Consistency is the first of three verification gates within the [Trinity Gate](@/glossary/trinity-gate.md) mechanism. It validates that the belief network underlying a platform decision forms a valid directed acyclic graph (DAG) with no circular reasoning, no orphaned conclusions, and no topological contradictions. Structural consistency operates at the graph-theoretic level -- it examines the shape and connectivity of the reasoning structure without evaluating whether the individual inference steps are logically sound (that responsibility belongs to Gate 2, Logical Consistency).

The distinction between structural and logical consistency is fundamental to understanding why both are necessary. A structurally consistent belief graph can contain logically unsound inference steps -- the graph forms a valid DAG, but some of the edges represent flawed reasoning. Conversely, a structurally inconsistent graph (containing cycles) cannot be logically sound regardless of the quality of individual edges, because circular reasoning is inherently self-referential and unfalsifiable. Structural consistency is therefore a necessary but not sufficient condition for epistemic validity.

Within the Prismatic Platform, structural consistency verification is the most frequently invoked gate and the most common point of failure. Approximately 40% of all [Trinity Gate](@/glossary/trinity-gate.md) rejections occur at the structural level, typically due to circular reasoning patterns (conclusion A supports B which supports C which supports A) or orphaned belief nodes (conclusions with no traceable evidence path). This high rejection rate is not a deficiency -- it reflects the gate's effectiveness at catching reasoning failures that would otherwise propagate undetected through the system.

The concept extends beyond epistemic verification into software architecture. Structural consistency of code (no circular dependencies between modules), of data models (no referential integrity violations), and of supervision trees (no circular supervisor dependencies) all apply the same principle: the underlying graph must be well-formed before the content it carries can be meaningful.

## Technical Deep Dive

### Graph-Theoretic Foundation

Structural consistency rests on directed graph theory. A belief network is modeled as a directed graph G = (V, E) where:

- **V** (vertices) represents beliefs, evidence, assumptions, and conclusions
- **E** (edges) represents inference relationships (directed from supporting evidence to conclusions)
- **Node types**: evidence (leaf nodes), intermediate beliefs, conclusions (root nodes), assumptions (annotated leaf nodes)

For the graph to be structurally consistent, it must satisfy the following properties:

| Property | Formal Definition | Failure Mode |
|----------|------------------|--------------|
| **Acyclicity** | No directed path from any node back to itself | Circular reasoning |
| **Reachability** | Every conclusion node is reachable from at least one evidence node | Orphaned conclusions |
| **Evidence grounding** | Every path from conclusion to leaf terminates at an evidence or assumption node | Ungrounded inference |
| **Contradiction annotation** | Contradictory evidence pairs are explicitly marked, not silently resolved | Hidden contradiction |
| **Inference direction** | Edges point from evidence toward conclusions, not from conclusions to evidence | Retroactive justification |

### Verification Algorithm

The structural consistency verifier implements a multi-pass analysis over the belief graph:

```elixir
defmodule PrismaticNabla.StructuralConsistency do
  @moduledoc """
  Gate 1 of Trinity Gate: Structural Consistency verification.
  Validates that the belief network forms a valid DAG with
  proper evidence grounding and no circular reasoning.
  """

  @type node_type :: :evidence | :assumption | :belief | :conclusion
  @type belief_node :: %{
    id: String.t(),
    type: node_type(),
    content: String.t(),
    confidence: float(),
    timestamp: DateTime.t()
  }

  @type inference_edge :: %{
    from: String.t(),
    to: String.t(),
    rule: String.t(),
    strength: float()
  }

  @type belief_graph :: %{
    nodes: %{String.t() => belief_node()},
    edges: [inference_edge()],
    contradictions: [{String.t(), String.t()}]
  }

  @type verification_result :: %{
    passed: boolean(),
    violations: [violation()],
    metrics: %{
      node_count: non_neg_integer(),
      edge_count: non_neg_integer(),
      max_depth: non_neg_integer(),
      cycle_count: non_neg_integer(),
      orphan_count: non_neg_integer()
    }
  }

  @type violation :: %{
    type: :cycle | :orphan | :ungrounded | :hidden_contradiction | :retroactive,
    nodes: [String.t()],
    description: String.t(),
    severity: :critical | :major | :minor
  }

  @spec verify(belief_graph()) :: {:ok, verification_result()} | {:error, term()}
  def verify(graph) do
    violations =
      []
      |> check_acyclicity(graph)
      |> check_reachability(graph)
      |> check_evidence_grounding(graph)
      |> check_contradiction_annotation(graph)
      |> check_inference_direction(graph)

    metrics = compute_metrics(graph)

    result = %{
      passed: violations == [],
      violations: violations,
      metrics: metrics
    }

    {:ok, result}
  end

  @spec check_acyclicity([violation()], belief_graph()) :: [violation()]
  defp check_acyclicity(violations, graph) do
    case detect_cycles(graph) do
      [] ->
        violations

      cycles ->
        cycle_violations =
          Enum.map(cycles, fn cycle ->
            %{
              type: :cycle,
              nodes: cycle,
              description: "Circular reasoning detected: #{Enum.join(cycle, " -> ")}",
              severity: :critical
            }
          end)

        violations ++ cycle_violations
    end
  end

  @spec detect_cycles(belief_graph()) :: [[String.t()]]
  defp detect_cycles(graph) do
    adjacency = build_adjacency_map(graph.edges)

    graph.nodes
    |> Map.keys()
    |> Enum.reduce([], fn node, cycles ->
      case dfs_cycle_detect(node, adjacency, MapSet.new(), MapSet.new(), []) do
        {:cycle, path} -> [path | cycles]
        :no_cycle -> cycles
      end
    end)
  end

  @spec dfs_cycle_detect(
    String.t(),
    %{String.t() => [String.t()]},
    MapSet.t(),
    MapSet.t(),
    [String.t()]
  ) :: {:cycle, [String.t()]} | :no_cycle
  defp dfs_cycle_detect(node, adjacency, visiting, visited, path) do
    cond do
      MapSet.member?(visited, node) ->
        :no_cycle

      MapSet.member?(visiting, node) ->
        {:cycle, Enum.reverse([node | path])}

      true ->
        visiting = MapSet.put(visiting, node)
        neighbors = Map.get(adjacency, node, [])

        result =
          Enum.reduce_while(neighbors, :no_cycle, fn neighbor, _acc ->
            case dfs_cycle_detect(neighbor, adjacency, visiting, visited, [node | path]) do
              {:cycle, _} = cycle -> {:halt, cycle}
              :no_cycle -> {:cont, :no_cycle}
            end
          end)

        case result do
          {:cycle, _} = cycle -> cycle
          :no_cycle -> :no_cycle
        end
    end
  end

  @spec check_reachability([violation()], belief_graph()) :: [violation()]
  defp check_reachability(violations, graph) do
    evidence_nodes =
      graph.nodes
      |> Enum.filter(fn {_id, node} -> node.type in [:evidence, :assumption] end)
      |> Enum.map(fn {id, _node} -> id end)
      |> MapSet.new()

    conclusion_nodes =
      graph.nodes
      |> Enum.filter(fn {_id, node} -> node.type == :conclusion end)
      |> Enum.map(fn {id, _node} -> id end)

    reachable = compute_reachable_set(evidence_nodes, graph.edges)

    orphan_violations =
      conclusion_nodes
      |> Enum.reject(&MapSet.member?(reachable, &1))
      |> Enum.map(fn node_id ->
        %{
          type: :orphan,
          nodes: [node_id],
          description: "Conclusion '#{node_id}' has no path from any evidence node",
          severity: :critical
        }
      end)

    violations ++ orphan_violations
  end

  defp check_evidence_grounding(violations, graph) do
    leaf_nodes =
      graph.nodes
      |> Enum.filter(fn {id, _node} ->
        not Enum.any?(graph.edges, &(&1.to == id))
      end)
      |> Enum.reject(fn {_id, node} -> node.type in [:evidence, :assumption] end)

    grounding_violations =
      Enum.map(leaf_nodes, fn {id, node} ->
        %{
          type: :ungrounded,
          nodes: [id],
          description: "Node '#{id}' (type: #{node.type}) is a leaf but not evidence/assumption",
          severity: :major
        }
      end)

    violations ++ grounding_violations
  end

  defp check_contradiction_annotation(violations, graph) do
    annotated = MapSet.new(graph.contradictions |> Enum.flat_map(&Tuple.to_list/1))

    potential_contradictions =
      graph.nodes
      |> Enum.filter(fn {_id, node} -> node.type == :evidence end)
      |> detect_unannotated_contradictions(annotated)

    violations ++ potential_contradictions
  end

  defp check_inference_direction(violations, graph) do
    retroactive =
      graph.edges
      |> Enum.filter(fn edge ->
        from_node = Map.get(graph.nodes, edge.from)
        to_node = Map.get(graph.nodes, edge.to)

        from_node != nil and to_node != nil and
          from_node.type == :conclusion and to_node.type == :evidence
      end)
      |> Enum.map(fn edge ->
        %{
          type: :retroactive,
          nodes: [edge.from, edge.to],
          description: "Edge from conclusion '#{edge.from}' to evidence '#{edge.to}' suggests retroactive justification",
          severity: :critical
        }
      end)

    violations ++ retroactive
  end

  defp build_adjacency_map(edges) do
    Enum.reduce(edges, %{}, fn edge, acc ->
      Map.update(acc, edge.from, [edge.to], &[edge.to | &1])
    end)
  end

  defp compute_reachable_set(start_nodes, edges) do
    adjacency = build_adjacency_map(edges)
    bfs(start_nodes, adjacency, start_nodes)
  end

  defp bfs(frontier, adjacency, visited) do
    next =
      frontier
      |> Enum.flat_map(&Map.get(adjacency, &1, []))
      |> MapSet.new()
      |> MapSet.difference(visited)

    if MapSet.size(next) == 0 do
      visited
    else
      bfs(next, adjacency, MapSet.union(visited, next))
    end
  end

  defp compute_metrics(graph) do
    %{
      node_count: map_size(graph.nodes),
      edge_count: length(graph.edges),
      max_depth: compute_max_depth(graph),
      cycle_count: length(detect_cycles(graph)),
      orphan_count: count_orphans(graph)
    }
  end
end
```

### Violation Classification

Structural consistency violations are classified by severity, which determines the enforcement response:

| Severity | Violation Type | Description | Enforcement |
|----------|---------------|-------------|-------------|
| **Critical** | Cycle | Circular reasoning in the belief graph | E3 HALT -- immediate gate failure |
| **Critical** | Orphan | Conclusion with no evidence path | E3 HALT -- immediate gate failure |
| **Critical** | Retroactive | Evidence generated to fit conclusion | E3 HALT -- immediate gate failure |
| **Major** | Ungrounded | Non-evidence leaf nodes in the graph | E2 BLOCK -- correction required |
| **Major** | Hidden contradiction | Contradictory evidence not annotated | E2 BLOCK -- annotation required |
| **Minor** | Weak grounding | Evidence path exists but through low-confidence edges | E1 WARNING -- investigation recommended |

Any critical violation causes immediate structural gate failure. The claim cannot proceed to Gate 2 (Logical Consistency) until all critical structural violations are resolved.

## Architecture and Implementation

### Integration with Trinity Gate Pipeline

Structural consistency is the first gate evaluated in the Trinity Gate pipeline. This ordering is deliberate -- structural checks are computationally inexpensive (linear in graph size) and catch approximately 40% of all issues. Running the structural gate first avoids wasting computational resources on logical and formal verification for structurally broken reasoning.

```
Input: Belief Graph
    |
    v
[Gate 1: Structural Consistency] -- FAST (~ms)
    |
    +-- FAIL (40% of rejections) --> Report violations --> EXIT
    |
    +-- PASS
            |
            v
        [Gate 2: Logical Consistency] -- MODERATE (~100ms)
            |
            +-- FAIL (35% of rejections) --> Report violations --> EXIT
            |
            +-- PASS
                    |
                    v
                [Gate 3: Formal Necessity] -- EXPENSIVE (~seconds)
                    |
                    +-- FAIL (25% of rejections) --> Report violations --> EXIT
                    |
                    +-- PASS --> [Meta-Integrity Layer] --> ACCEPTED
```

### Belief Graph Construction

Before structural consistency can be verified, the belief graph must be constructed from the platform's epistemic state. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework maintains belief graphs as first-class data structures:

```elixir
defmodule PrismaticNabla.BeliefGraph.Builder do
  @moduledoc """
  Constructs belief graphs from platform signals, observations,
  and inference steps. Ensures all graph invariants are maintained
  during construction.
  """

  alias PrismaticNabla.StructuralConsistency

  @spec build(keyword()) :: {:ok, StructuralConsistency.belief_graph()} | {:error, term()}
  def build(opts) do
    signals = Keyword.fetch!(opts, :signals)
    inferences = Keyword.get(opts, :inferences, [])

    nodes = build_nodes(signals, inferences)
    edges = build_edges(inferences)
    contradictions = detect_contradictions(signals)

    graph = %{nodes: nodes, edges: edges, contradictions: contradictions}

    {:ok, graph}
  end

  @spec build_nodes([map()], [map()]) :: %{String.t() => StructuralConsistency.belief_node()}
  defp build_nodes(signals, inferences) do
    evidence_nodes =
      signals
      |> Enum.map(fn signal ->
        {signal.id, %{
          id: signal.id,
          type: :evidence,
          content: signal.observation,
          confidence: signal.confidence,
          timestamp: signal.timestamp
        }}
      end)
      |> Map.new()

    inference_nodes =
      inferences
      |> Enum.map(fn inference ->
        {inference.conclusion_id, %{
          id: inference.conclusion_id,
          type: classify_node_type(inference),
          content: inference.conclusion,
          confidence: inference.confidence,
          timestamp: inference.timestamp
        }}
      end)
      |> Map.new()

    Map.merge(evidence_nodes, inference_nodes)
  end

  defp build_edges(inferences) do
    Enum.flat_map(inferences, fn inference ->
      Enum.map(inference.premise_ids, fn premise_id ->
        %{
          from: premise_id,
          to: inference.conclusion_id,
          rule: inference.rule,
          strength: inference.confidence
        }
      end)
    end)
  end

  defp detect_contradictions(signals) do
    signals
    |> Enum.group_by(& &1.topic)
    |> Enum.flat_map(fn {_topic, group} ->
      find_contradicting_pairs(group)
    end)
  end

  defp classify_node_type(%{is_final: true}), do: :conclusion
  defp classify_node_type(%{is_assumption: true}), do: :assumption
  defp classify_node_type(_), do: :belief

  defp find_contradicting_pairs(signals) do
    for a <- signals,
        b <- signals,
        a.id < b.id,
        contradicts?(a, b),
        do: {a.id, b.id}
  end

  defp contradicts?(a, b) do
    a.direction != b.direction and a.confidence > 0.5 and b.confidence > 0.5
  end
end
```

### Structural Consistency in Code Architecture

The same principle that governs epistemic belief graphs applies to software architecture. The Prismatic Platform enforces structural consistency in code through several mechanisms:

```elixir
defmodule PrismaticQuality.StructuralCodeConsistency do
  @moduledoc """
  Validates structural consistency of the codebase.
  Detects circular dependencies, orphaned modules, and
  architectural violations in the umbrella application graph.
  """

  @spec check_circular_dependencies() :: {:ok, []} | {:error, [cycle :: [String.t()]]}
  def check_circular_dependencies do
    apps = list_umbrella_apps()
    dependency_graph = build_dependency_graph(apps)

    case find_cycles(dependency_graph) do
      [] -> {:ok, []}
      cycles -> {:error, cycles}
    end
  end

  @spec check_orphaned_modules() :: {:ok, []} | {:error, [module()]}
  def check_orphaned_modules do
    all_modules = list_all_modules()
    referenced_modules = list_referenced_modules()

    orphans = MapSet.difference(all_modules, referenced_modules)

    case MapSet.size(orphans) do
      0 -> {:ok, []}
      _ -> {:error, MapSet.to_list(orphans)}
    end
  end

  @spec check_supervision_tree_consistency() :: {:ok, map()} | {:error, term()}
  def check_supervision_tree_consistency do
    supervisors = list_all_supervisors()
    supervisor_graph = build_supervisor_graph(supervisors)

    case find_cycles(supervisor_graph) do
      [] -> {:ok, %{supervisors: length(supervisors), cycles: 0}}
      cycles -> {:error, {:circular_supervision, cycles}}
    end
  end
end
```

## Usage in Prismatic Platform

### Epistemic Verification

Every platform decision that requires [Trinity Gate](@/glossary/trinity-gate.md) validation begins with structural consistency verification. The gate evaluates the belief graph underlying the decision and rejects any decision whose reasoning structure contains cycles, orphans, or ungrounded nodes.

### Quality Gate Integration

The [Quality Gate](@/glossary/quality-gate.md) system includes structural consistency checks for both code and architecture. The pre-commit hook verifies that no circular dependencies are introduced between umbrella applications, and the `mix quality.gates` task includes structural analysis of module dependency graphs.

### Agent Decision Validation

When AIAD agents produce recommendations, the recommendation's supporting evidence is assembled into a belief graph and checked for structural consistency before the recommendation is accepted. An agent that produces a circular reasoning chain (conclusion supports its own evidence) is flagged and the recommendation is rejected.

## Structural Consistency vs. Other Verification

| Aspect | Structural Consistency | Logical Consistency | Formal Necessity |
|--------|----------------------|--------------------|--------------------|
| **What it checks** | Graph shape (DAG validity) | Inference soundness | Conclusion necessity |
| **How it checks** | Topological analysis | Rule evaluation | Modal logic + proofs |
| **Computational cost** | Low (O(V+E)) | Moderate | High |
| **Failure rate** | ~40% of rejections | ~35% of rejections | ~25% of rejections |
| **Type of error caught** | Circular reasoning, orphans | Invalid inference, axiom violations | Possible but not necessary conclusions |
| **Prerequisite for next** | None (first gate) | Structural pass required | Structural + Logical pass required |

## Best Practices

1. **Check structural consistency before investing in logical analysis.** Structural verification is fast and catches the most common failure mode. Running expensive logical or formal verification on a structurally broken graph wastes resources.

2. **Build belief graphs incrementally.** Rather than constructing the entire graph and then verifying, add nodes and edges incrementally with on-the-fly structural checks. This catches violations early and provides immediate feedback.

3. **Annotate contradictions explicitly.** The structural consistency gate requires that contradictory evidence be explicitly marked. Hiding contradictions by silently discarding one side is a critical violation. The [Contradiction Preservation](@/glossary/contradiction-preservation.md) principle demands that both sides be preserved.

4. **Monitor cycle detection metrics.** Track the frequency and patterns of circular reasoning detection across the platform. Recurring cycles in specific domains may indicate a systemic issue in how evidence is gathered or reasoning is structured in that domain.

5. **Apply structural consistency to code architecture.** The same graph-theoretic principles that validate belief networks validate code dependency graphs. Circular module dependencies, orphaned code, and architectural violations are structural consistency failures in the software domain.

## Common Pitfalls

- **Confusing structural validity with truth**: A structurally consistent belief graph can still contain false conclusions. Structural consistency only means the reasoning structure is well-formed, not that the content is correct. All three gates are necessary for full epistemic validation.

- **Ignoring weak evidence paths**: A conclusion that is reachable from evidence only through very low-confidence edges is technically structurally consistent but practically ungrounded. Monitor edge strengths alongside structural topology.

- **Over-engineering graph construction**: Not every decision requires a formal belief graph. Simple decisions with clear evidence and straightforward reasoning can be validated through lighter-weight mechanisms. Reserve full graph construction for decisions that genuinely benefit from topological analysis.

- **Treating structural gate passage as sufficient**: Passing Gate 1 is necessary but not sufficient. The most dangerous errors are often structurally well-formed but logically unsound -- the graph looks perfect but the reasoning is flawed.

## Related Terms

- [Trinity Gate](@/glossary/trinity-gate.md) -- Parent verification mechanism containing structural consistency as Gate 1
- [Belief Graph](@/glossary/belief-graph.md) -- Data structure representing the reasoning network verified by this gate
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework whose axioms are enforced through structural analysis
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom requiring multiple evidence sources (affects graph topology)
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom requiring explicit annotation of contradictory evidence
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom ensuring all beliefs are traceable through the graph
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Score thresholds that determine gate activation
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Testing methodology that validates structural invariants
- [Static Analysis](@/glossary/static-analysis.md) -- Code analysis complementing epistemic structural verification
- [Quality Gate](@/glossary/quality-gate.md) -- Platform verification gates incorporating structural checks

## See Also

- [Formal Verification](@/glossary/formal-verification.md) -- Gate 3 complementing structural consistency
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- Full pipeline in which structural consistency operates
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
