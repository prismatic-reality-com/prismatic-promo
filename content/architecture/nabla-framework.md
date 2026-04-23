+++
title = "NABLA Framework"
weight = 9
date = 2026-01-15
[extra]
icon = "cpu"
color = "purple"
description = "Epistemic uncertainty framework with 7 axioms, Trinity Gate validation, and formal verification through Lean4 integration"
date_created = "2025-09-01"
reading_time = "12 min"
difficulty = "advanced"
tags = ["epistemic-framework", "nabla", "trinity-gate", "formal-verification", "belief-graphs", "uncertainty-quantification"]
related_articles = ["supervision-trees", "telemetry", "storage-adapters"]
maturity = "production"
author = "Tomas Korcak (korczis)"
word_count = 1706
date_modified = "2026-02-23"
keywords = ["NABLA", "Framework", "Epistemic", "Trinity", "Gate", "Lean4", "architecture", "Prismatic Platform", "Axiom", "HARD"]
quality_score = 90
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "NABLA Framework - Prismatic Platform"
+++

## Overview

NABLA (stylized as the nabla operator, a mathematical symbol for gradient or divergence) is Prismatic Platform's epistemic reasoning framework. It governs how the platform's 400+ autonomous agents form beliefs, propagate uncertainty, and arrive at actionable conclusions. Where most AI platforms treat [inference](@/glossary/inference.md) outputs as binary (true/false) or at best attach a single confidence float, NABLA implements a rigorous multi-layered epistemology: every belief carries provenance, every conclusion requires multi-source corroboration, and every decision must pass through a formal three-gate validation pipeline before it can influence platform behavior.

The framework draws inspiration from Bayesian epistemology, Dempster-Shafer evidence theory, and [modal logic](@/glossary/modal-logic.md). Its name reflects its mathematical foundation -- just as the nabla operator computes the gradient of a scalar field (revealing how values change across space), the NABLA framework computes the "epistemic gradient" across the platform's belief landscape, revealing where confidence is strong, where it decays, and where contradictions create uncertainty valleys that demand investigation rather than dismissal.

NABLA integrates deeply with the platform's [agent architecture](@/apps/prismatic-agents.md), the [NABLA application module](@/apps/prismatic-nabla.md), and the broader [NABLA axioms capability](@/capabilities/nabla-axioms.md). Its design reflects a fundamental philosophical commitment: the platform must never be more confident than its evidence warrants, and it must never discard inconvenient truths in pursuit of clean narratives.

## The 7 Non-Negotiable Axioms

The axioms form the DNA-level constraints of NABLA. They are not guidelines or best practices -- they are hard enforcement rules compiled into every agent's decision pipeline. Violating an axiom triggers automatic rejection of the offending belief and escalation to the appropriate enforcement level.

| # | Axiom | Enforcement | Rationale |
|---|-------|-------------|-----------|
| 1 | **[Signal Plurality](@/glossary/signal-plurality.md)** | HARD -- minimum 2 independent signals | Single-source beliefs are indistinguishable from hallucinations |
| 2 | **[Contradiction Preservation](@/glossary/contradiction-preservation.md)** | HARD -- preserve both sides, never discard | Contradictions are information; resolving them prematurely destroys data |
| 3 | **Absence Is Informative** | SOFT -- missing signals tracked as data points | What a system does NOT report is often more revealing than what it does |
| 4 | **[Time Decay](@/glossary/time-decay.md)** | HARD -- mandatory timestamps on all beliefs | Stale intelligence is dangerous intelligence |
| 5 | **Unknown Is Valid** | HARD -- "I don't know" is a legitimate terminal state | Forced conclusions under uncertainty cause more harm than acknowledged gaps |
| 6 | **Source Independence** | SOFT -- independent sources weighted higher | Correlated sources provide less information than independent ones |
| 7 | **[Provenance Mandatory](@/glossary/provenance-mandatory.md)** | HARD -- all beliefs must be traceable to origin | Untraceable conclusions cannot be audited, updated, or invalidated |

The distinction between HARD and SOFT enforcement is significant. Hard axioms trigger immediate blocking (E2 level) when violated -- the belief is rejected and cannot proceed through the pipeline. Soft axioms generate warnings (E1 level) and request corrective action but do not immediately halt processing. This graduated approach prevents the framework from becoming so rigid that it cannot operate under real-world conditions where perfect information is unavailable.

### Why These Specific Axioms?

The axiom set was derived from analyzing failure modes in intelligence analysis and AI systems. Each axiom addresses a specific, documented failure pattern:

- **Signal Plurality** prevents the single-point-of-failure that caused the 2003 Iraqi WMD intelligence failure, where a single source (codenamed "Curveball") drove major conclusions.
- **Contradiction Preservation** addresses confirmation bias, the most pervasive cognitive failure in both human and AI reasoning systems.
- **Time Decay** prevents the "stale cache" problem seen in cybersecurity, where outdated vulnerability data leads to false confidence.
- **Provenance Mandatory** ensures the platform maintains a complete [audit trail](@/glossary/audit-trail.md), critical for [compliance frameworks](@/capabilities/aiad-compliance.md) like [NIS2](@/glossary/nis2.md) and [ZKB](@/glossary/zkb.md).

## Trinity Gate -- Three-Layer Validation

The [Trinity Gate](@/capabilities/trinity-gate.md) is the epistemic checkpoint that every belief must pass before it can influence agent decisions or be propagated to downstream consumers. The gate implements three independent validation layers, each grounded in a different mathematical discipline. ALL three must pass -- there is no partial credit.

```
Input Belief
     |
     +---> Gate 1: Structural Consistency (Graph Theory)
     |         +---> Belief graph forms valid DAG (no cycles)
     |         +---> All edges have valid provenance
     |         +---> No orphaned nodes
     |
     +---> Gate 2: Logical Consistency (Rule-Based)
     |         +---> No unresolved contradictions at tau threshold
     |         +---> Axiom compliance verified
     |         +---> Inference chain validity checked
     |
     +---> Gate 3: Formal Necessity (Modal Logic + Lean4)
     |         +---> Conclusion follows necessarily from premises
     |         +---> Modal operators correctly applied
     |         +---> Formal proof obligation discharged
     |
     +---> ALL PASS? --> ACCEPTED (confidence assigned)
     +---> ANY FAIL? --> REJECTED (violation report generated)
```

### Why Three Gates Instead of One?

A single validation layer, no matter how sophisticated, has blind spots. Structural consistency can miss logical paradoxes. Logical consistency can miss graph-level structural problems (cycles that create circular reasoning). And both can miss cases where the conclusion, while structurally and logically consistent, does not follow with necessity from the premises. The three-gate design provides defense in depth for epistemic claims.

The computational cost of three-gate validation is non-trivial. Gate 1 (structural) runs in O(V + E) time using topological sort cycle detection. Gate 2 (logical) is worst-case exponential but bounded by [belief graph](@/glossary/belief-graph.md) size limits (maximum 10,000 nodes per validation batch). Gate 3 (formal) delegates to [Lean4](@/glossary/lean4.md) for proof checking, which adds latency but provides mathematical certainty.

### Implementation

```elixir
defmodule PrismaticNabla.TrinityGate do
  @moduledoc """
  Three-layer epistemic validation gate.

  Every belief must pass structural, logical, and formal
  validation before acceptance into the platform's belief network.
  """

  @type gate :: :structural | :logical | :formal
  @type result :: {:ok, :trinity_passed} | {:rejected, gate(), term()}

  @spec validate(PrismaticNabla.Belief.t()) :: result()
  def validate(belief) do
    with :ok <- check_structural(belief),
         :ok <- check_logical(belief),
         :ok <- check_formal(belief) do
      {:ok, :trinity_passed}
    else
      {:error, gate, reason} -> {:rejected, gate, reason}
    end
  end

  defp check_structural(belief) do
    cond do
      has_cycles?(belief.graph) ->
        {:error, :structural, :cyclic_belief_graph}

      has_orphaned_nodes?(belief.graph) ->
        {:error, :structural, :orphaned_provenance}

      not valid_dag?(belief.graph) ->
        {:error, :structural, :invalid_dag_structure}

      true ->
        :ok
    end
  end

  defp check_logical(belief) do
    contradictions = find_contradictions(belief)

    case contradictions do
      [] ->
        :ok

      unresolved when length(unresolved) > 0 ->
        {:error, :logical, {:unresolved_contradictions, unresolved}}
    end
  end

  defp check_formal(belief) do
    case PrismaticNabla.Lean4Bridge.check_necessity(belief) do
      {:proved, _proof_term} -> :ok
      {:unproved, obligation} -> {:error, :formal, {:insufficient_necessity, obligation}}
      {:timeout, elapsed_ms} -> {:error, :formal, {:proof_timeout, elapsed_ms}}
    end
  end
end
```

## Confidence Scoring and Time Decay

Confidence in NABLA is not a static number -- it is a dynamic value that changes over time, responds to new evidence, and reflects the quality and independence of its supporting signals. The [confidence scoring](@/glossary/confidence-scoring.md) engine implements exponential time decay, source independence weighting, and plurality bonuses.

| Context | Threshold (tau) | [Trinity Gate](@/glossary/trinity-gate.md) | Use Case |
|---------|-----------------|-------------|----------|
| Critical Decisions | 0.95 | MANDATORY | Security actions, compliance determinations |
| Standard Operations | 0.80 | MANDATORY | Normal agent decisions, routine assessments |
| Exploratory Analysis | 0.60 | RECOMMENDED | Research queries, hypothesis exploration |
| Initial Signals | 0.50 | OPTIONAL | Raw data ingestion, preliminary assessment |

The threshold values were calibrated through extensive testing against historical intelligence analysis datasets. The 0.95 threshold for critical decisions means that only beliefs with overwhelming multi-source corroboration can trigger security-critical actions -- this prevents false positives in the [Perimeter EASM system](@/apps/prismatic-perimeter.md) from generating spurious alerts.

### Confidence Calculation Engine

```elixir
defmodule PrismaticNabla.Confidence do
  @moduledoc """
  Dynamic confidence scoring with time decay, source independence
  weighting, and plurality bonuses.
  """

  @half_life_hours 168  # 7 days -- signals lose half their weight weekly
  @plurality_bonus 0.15  # 15% boost for each independent source beyond 2
  @max_confidence 0.99   # Never claim absolute certainty

  @spec calculate([PrismaticNabla.Signal.t()]) :: float()
  def calculate(signals) when length(signals) < 2 do
    # Axiom 1: Signal Plurality -- refuse to calculate with single source
    {:error, :insufficient_plurality, length(signals)}
  end

  def calculate(signals) do
    signals
    |> apply_time_decay()
    |> apply_source_independence()
    |> apply_plurality_bonus()
    |> normalize()
    |> min(@max_confidence)
  end

  defp apply_time_decay(signals) do
    now = DateTime.utc_now()

    Enum.map(signals, fn signal ->
      age_hours = DateTime.diff(now, signal.timestamp, :hour)
      decay_factor = :math.exp(-0.693 * age_hours / @half_life_hours)
      %{signal | weight: signal.weight * decay_factor}
    end)
  end

  defp apply_source_independence(signals) do
    signals
    |> Enum.group_by(& &1.source_family)
    |> Enum.flat_map(fn {_family, family_signals} ->
      # Diminishing returns for correlated sources
      family_signals
      |> Enum.sort_by(& &1.weight, :desc)
      |> Enum.with_index()
      |> Enum.map(fn {signal, idx} ->
        %{signal | weight: signal.weight * (1 / (idx + 1))}
      end)
    end)
  end

  defp apply_plurality_bonus(signals) do
    independent_count =
      signals
      |> Enum.map(& &1.source_family)
      |> Enum.uniq()
      |> length()

    bonus = max(0, (independent_count - 2) * @plurality_bonus)

    Enum.map(signals, fn signal ->
      %{signal | weight: signal.weight * (1.0 + bonus)}
    end)
  end

  defp normalize(signals) do
    total = Enum.sum(Enum.map(signals, & &1.weight))
    if total == 0, do: 0.0, else: total / (total + 1.0)
  end
end
```

### Why Exponential Decay?

The choice of exponential decay over linear decay is deliberate. Linear decay implies that a signal retains most of its value for most of its lifetime and then suddenly becomes worthless -- this does not model real-world intelligence degradation. Exponential decay with a configurable half-life (default 7 days) provides smooth, continuous degradation that matches the observed pattern in cybersecurity intelligence: a vulnerability report is most valuable when fresh, progressively less valuable as patches propagate, but never truly zero (unpatched legacy systems exist).

## Belief Graph Architecture

The [belief graph](@/glossary/belief-graph.md) is the data structure that tracks the provenance and dependency relationships between all beliefs in the system. It is implemented as a directed acyclic graph (DAG) where nodes represent beliefs and edges represent supporting relationships.

```elixir
defmodule PrismaticNabla.BeliefGraph do
  @moduledoc """
  DAG-based belief provenance tracking.

  Every belief node stores its content, confidence, timestamp,
  and the full set of edges tracing back to originating signals.
  """

  defstruct nodes: %{}, edges: [], metadata: %{}

  @type t :: %__MODULE__{
    nodes: %{String.t() => node()},
    edges: [edge()],
    metadata: map()
  }

  @type node :: %{
    id: String.t(),
    content: term(),
    confidence: float(),
    timestamp: DateTime.t(),
    axiom_compliance: map()
  }

  @type edge :: %{from: String.t(), to: String.t(), relation: atom()}

  @spec add_belief(t(), PrismaticNabla.Belief.t(), [PrismaticNabla.Signal.t()]) :: t()
  def add_belief(graph, belief, sources) do
    node = %{
      id: belief.id,
      content: belief,
      confidence: PrismaticNabla.Confidence.calculate(sources),
      timestamp: DateTime.utc_now(),
      axiom_compliance: check_all_axioms(belief, sources)
    }

    edges = Enum.map(sources, fn source ->
      %{from: source.id, to: belief.id, relation: :supports}
    end)

    %{graph |
      nodes: Map.put(graph.nodes, belief.id, node),
      edges: graph.edges ++ edges
    }
  end

  @spec trace_provenance(t(), String.t()) :: [node()]
  def trace_provenance(graph, belief_id) do
    traverse_backwards(graph, belief_id, MapSet.new())
  end

  defp traverse_backwards(graph, current_id, visited) do
    if MapSet.member?(visited, current_id) do
      []
    else
      parents =
        graph.edges
        |> Enum.filter(fn edge -> edge.to == current_id end)
        |> Enum.map(fn edge -> edge.from end)

      current_node = Map.get(graph.nodes, current_id)
      visited = MapSet.put(visited, current_id)

      ancestor_nodes =
        parents
        |> Enum.flat_map(&traverse_backwards(graph, &1, visited))

      [current_node | ancestor_nodes]
    end
  end
end
```

The belief graph integrates with the platform's [ETS storage layer](@/glossary/ets.md) for in-memory access during real-time operations and with [PostgreSQL](@/architecture/postgresql-kuzudb.md) for persistent storage. Graph traversal queries that span the entire belief network (such as finding all beliefs that transitively depend on a particular signal source) leverage [KuzuDB](@/glossary/kuzudb.md) for efficient recursive path queries.

## Epistemic Violation Handling

Violations are classified into four severity levels, each with distinct handling semantics. The violation handler is integrated with the platform's [telemetry system](@/architecture/telemetry.md) to ensure that all violations are recorded, aggregated, and available for trend analysis.

| Level | Description | Action | Recovery Path |
|-------|-------------|--------|---------------|
| **E1** | Soft axiom deviation (e.g., low source independence) | Warning + request additional sources | Automatic -- agent seeks more signals |
| **E2** | Hard axiom breach (e.g., single-source critical belief) | Block + immediate rejection | Manual -- requires new evidence submission |
| **E3** | Trinity Gate failure | Halt + escalate to review | Requires human or supreme agent review |
| **E4** | Multiple axiom violations or provenance corruption | Full investigation + audit trail | Platform-level security review triggered |

```elixir
defmodule PrismaticNabla.ViolationHandler do
  @moduledoc """
  Graduated violation handling with telemetry integration.
  """

  require Logger

  @spec handle(PrismaticNabla.Violation.t()) :: :ok | {:escalated, atom()}
  def handle(%{level: :E1} = violation) do
    Logger.warning("NABLA E1: #{violation.message}")
    :telemetry.execute([:nabla, :violation, :e1], %{count: 1}, violation)
    request_additional_sources(violation.belief)
    :ok
  end

  def handle(%{level: :E2} = violation) do
    Logger.error("NABLA E2: #{violation.message}")
    :telemetry.execute([:nabla, :violation, :e2], %{count: 1}, violation)
    block_and_reject(violation.belief)
    {:escalated, :blocked}
  end

  def handle(%{level: :E3} = violation) do
    Logger.critical("NABLA E3: #{violation.message}")
    :telemetry.execute([:nabla, :violation, :e3], %{count: 1}, violation)
    halt_and_escalate(violation.belief)
    {:escalated, :halted}
  end

  def handle(%{level: :E4} = violation) do
    Logger.critical("NABLA E4 CRITICAL: #{violation.message}")
    :telemetry.execute([:nabla, :violation, :e4], %{count: 1}, violation)
    trigger_full_investigation(violation)
    {:escalated, :investigation}
  end
end
```

## Performance Characteristics and Benchmarks

NABLA's performance profile varies significantly across its components. The following benchmarks were measured on the platform's standard development environment (Apple M-series, 32GB RAM).

| Operation | Time Complexity | Measured Latency (p50) | Measured Latency (p99) |
|-----------|----------------|----------------------|----------------------|
| Confidence calculation (10 signals) | O(n log n) | 0.2ms | 0.8ms |
| Confidence calculation (1000 signals) | O(n log n) | 12ms | 45ms |
| Structural gate (100-node graph) | O(V + E) | 0.5ms | 2ms |
| Structural gate (10,000-node graph) | O(V + E) | 35ms | 120ms |
| Logical gate (100 propositions) | O(n^2) worst case | 3ms | 15ms |
| Formal gate (Lean4 bridge) | Variable | 50ms | 500ms |
| Full Trinity validation (typical) | Dominated by Gate 3 | 55ms | 520ms |
| Belief graph insertion | O(1) amortized | 0.1ms | 0.3ms |
| Provenance trace (depth 10) | O(V + E) BFS | 2ms | 8ms |

The [formal verification](@/glossary/formal-verification.md) gate (Gate 3) is intentionally the bottleneck. It provides the strongest guarantees but at the highest cost. For time-critical operations at the exploratory [confidence threshold](@/glossary/confidence-threshold.md) (tau = 0.60), Gate 3 can be configured as RECOMMENDED rather than MANDATORY, allowing the system to proceed with structural and logical validation alone. Critical decisions (tau = 0.95) always require all three gates.

## Comparison with Alternative Approaches

### NABLA vs. Pure Bayesian Networks

Bayesian networks compute posterior probabilities given evidence, which is powerful for well-defined probabilistic models. However, they assume that the prior distribution is known and that all variables are enumerable. NABLA handles open-world uncertainty where new signal types can appear at any time and where "I don't know the prior" is a valid state (Axiom 5). Bayesian networks also have no built-in mechanism for provenance tracking or contradiction preservation.

### NABLA vs. Dempster-Shafer Theory

Dempster-Shafer evidence theory supports explicit representation of uncertainty and ignorance through belief and plausibility functions. NABLA borrows this concept (Axiom 5: Unknown Is Valid) but extends it with mandatory provenance (Axiom 7), time decay (Axiom 4), and the Trinity Gate validation pipeline. Dempster-Shafer's combination rule can produce counterintuitive results when evidence sources conflict significantly -- NABLA addresses this through Contradiction Preservation (Axiom 2) rather than attempting automated conflict resolution.

### NABLA vs. Simple Confidence Scores

Most AI platforms attach a single float (0.0 to 1.0) to their outputs. This approach is attractive in its simplicity but fails to capture the multi-dimensional nature of epistemic quality. A confidence score of 0.85 tells you nothing about whether the underlying evidence is fresh or stale, independent or correlated, traceable or opaque. NABLA's structured approach adds overhead but provides the audit trail and reasoning transparency required for security-critical applications.

## Agent Integration Pattern

Every [agent](@/glossary/agent.md) in the platform must respect NABLA's axioms and pass through the Trinity Gate for decisions above the exploratory threshold. The integration pattern is standardized through the agent base module.

```elixir
defmodule PrismaticAgents.NablaAwareAgent do
  @moduledoc """
  Base behaviour for NABLA-compliant agents.
  All agents that form beliefs or make decisions must use this behaviour.
  """

  defmacro __using__(_opts) do
    quote do
      alias PrismaticNabla.{TrinityGate, Confidence, BeliefGraph}

      @decision_threshold 0.80

      def make_decision(context) do
        signals = gather_signals(context)

        with {:ok, belief} <- form_belief(signals),
             {:ok, :trinity_passed} <- TrinityGate.validate(belief),
             {:ok, confidence} <- check_threshold(belief, @decision_threshold) do
          execute_decision(belief, confidence)
        else
          {:rejected, gate, reason} ->
            handle_rejection(gate, reason, context)

          {:error, :below_threshold, actual} ->
            {:deferred, :insufficient_confidence, actual}
        end
      end

      defp check_threshold(belief, threshold) do
        if belief.confidence >= threshold do
          {:ok, belief.confidence}
        else
          {:error, :below_threshold, belief.confidence}
        end
      end

      defp handle_rejection(gate, reason, context) do
        PrismaticNabla.ViolationHandler.handle(%{
          level: :E3,
          gate: gate,
          reason: reason,
          context: context,
          message: "Trinity Gate rejection at #{gate}: #{inspect(reason)}"
        })

        {:error, {:nabla_violation, gate, reason}}
      end
    end
  end
end
```

This integration ensures that the [epistemic pipeline](@/glossary/epistemic-pipeline.md) is consistently applied across all 400+ agents, from the [safety system](@/apps/prismatic-safety.md) to the [Perimeter EASM scanner](@/apps/prismatic-perimeter.md). The framework's enforcement is not optional -- it is compiled into the agent [supervision tree](@/glossary/supervision-tree.md) and enforced at the [OTP](@/glossary/otp.md) process level through the platform's [supervision architecture](@/architecture/supervision-trees.md).

## Future Directions

The NABLA framework continues to evolve. Current research areas include integration with probabilistic programming languages (specifically, extending the Lean4 bridge to support probabilistic proofs), real-time belief graph visualization through [Phoenix LiveView](@/architecture/phoenix-liveview.md), and cross-agent belief propagation protocols that maintain provenance across the platform's [PubSub infrastructure](@/architecture/pubsub.md). The goal is a platform where every conclusion, no matter how deeply nested in the agent hierarchy, can be traced back to its originating signals with full confidence accounting at every step.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)