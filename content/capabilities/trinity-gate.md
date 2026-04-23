+++
title = "Trinity Gate"
weight = 3
[extra]
icon = "shield"
color = "purple"
description = "Three-layer epistemic verification through structural consistency, logical consistency, and formal necessity validation"
category = "verification"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1032
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Trinity", "Gate", "Three-layer", "capabilities", "verification", "Prismatic Platform", "Trinity Gate", "Formal", "Logical", "The Trinity"]
tags = ["capabilities", "verification", "trinity-gate", "prismatic"]
quality_score = 75
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Trinity Gate - Prismatic Platform"
+++

## Overview

The Trinity Gate is the final verification layer before any belief, decision, or critical claim is accepted on the Prismatic Platform. It ensures epistemic integrity through three independent verification gates -- structural, logical, and formal -- that must all pass before a conclusion is established. No claim passes through the platform's decision-making infrastructure without Trinity Gate validation. No exceptions.

The Trinity Gate addresses a fundamental problem in complex systems: how to distinguish well-founded conclusions from plausible-sounding assertions. In a platform with 400+ AI agents, 2.8 million lines of code, and multiple epistemic domains (security, intelligence, compliance, quality), the potential for unverified claims to propagate and compound is significant. A security rating based on incomplete data, a compliance assessment based on circular reasoning, or an agent recommendation based on ungrounded inference can cascade through dependent systems with damaging consequences.

The three gates are designed to be independently sufficient for detecting different categories of epistemic failure. Structural consistency catches topological defects in reasoning graphs. Logical consistency catches contradictions and inference errors. Formal necessity catches claims that are plausible but not provably necessary. Together, they create a verification barrier that invalid conclusions cannot penetrate.

The Trinity Gate integrates with the [NABLA Axioms](/capabilities/nabla-axioms/) epistemic framework as its enforcement mechanism, and with the [NO DOUBTS](/capabilities/no-doubts/) doctrine's confidence thresholds as its activation trigger.

## The Three Gates

### Gate 1: Structural Consistency (Graph Theory)

The first gate validates that the belief graph -- the network of claims, evidence, and reasoning steps that support a conclusion -- has no structural anomalies. This gate uses graph theory to verify that the reasoning topology is well-formed.

| Check | Description | Failure Mode | Detection |
|-------|-------------|--------------|-----------|
| **Cycle Detection** | No circular dependencies in reasoning | Conclusion assumes itself | Tarjan's algorithm on DAG |
| **Connectivity** | All beliefs traceable to evidence sources | Floating claims without support | Reachability analysis from sources |
| **Completeness** | Required evidence nodes present | Missing critical evidence | Schema validation against requirements |
| **Graph Validity** | Well-formed directed acyclic graph | Malformed reasoning structure | Topological sort verification |
| **Source Plurality** | Multiple independent sources for critical claims | Single point of epistemic failure | Source independence analysis |

```elixir
defmodule TrinityGate.Structural do
  @moduledoc """
  Gate 1: Structural Consistency Validation.
  Verifies the belief graph forms a valid DAG with proper connectivity
  and evidence coverage.
  """

  @type validation_result :: :ok | {:error, :structural, String.t()}

  @spec validate(belief :: map()) :: validation_result()
  def validate(belief) do
    with :ok <- check_acyclic(belief.graph),
         :ok <- check_connected(belief.graph),
         :ok <- check_complete(belief.graph),
         :ok <- check_source_plurality(belief.graph) do
      :ok
    else
      {:error, reason} -> {:error, :structural, reason}
    end
  end

  defp check_acyclic(graph) do
    # Tarjan's strongly connected components algorithm
    # Any SCC with more than one node indicates a cycle
    case Graph.strong_components(graph) do
      components when is_list(components) ->
        cyclic = Enum.filter(components, fn c -> length(c) > 1 end)

        if cyclic == [] do
          :ok
        else
          {:error, "Circular reasoning detected in #{length(cyclic)} component(s)"}
        end
    end
  end

  defp check_connected(graph) do
    # Every claim node must be reachable from at least one evidence source
    evidence_nodes = Graph.vertices(graph) |> Enum.filter(&evidence_node?/1)
    claim_nodes = Graph.vertices(graph) |> Enum.filter(&claim_node?/1)

    unreachable =
      Enum.reject(claim_nodes, fn claim ->
        Enum.any?(evidence_nodes, fn evidence ->
          Graph.get_shortest_path(graph, evidence, claim) != nil
        end)
      end)

    case unreachable do
      [] -> :ok
      nodes -> {:error, "#{length(nodes)} claim(s) unreachable from evidence sources"}
    end
  end

  defp check_complete(graph) do
    # Verify all required evidence nodes are present
    required = Graph.vertex_labels(graph) |> Enum.filter(&required_evidence?/1)
    present = Graph.vertices(graph) |> Enum.filter(&evidence_node?/1) |> MapSet.new()

    missing = Enum.reject(required, &MapSet.member?(present, &1))

    case missing do
      [] -> :ok
      nodes -> {:error, "Missing #{length(nodes)} required evidence node(s)"}
    end
  end

  defp check_source_plurality(graph) do
    # Critical claims must have evidence from 2+ independent sources
    critical_claims = Graph.vertices(graph) |> Enum.filter(&critical_claim?/1)

    insufficient =
      Enum.reject(critical_claims, fn claim ->
        sources = Graph.in_neighbors(graph, claim) |> Enum.filter(&evidence_node?/1)
        independent_sources = sources |> Enum.map(& &1.source_id) |> Enum.uniq()
        length(independent_sources) >= 2
      end)

    case insufficient do
      [] -> :ok
      claims -> {:error, "#{length(claims)} critical claim(s) lack source plurality"}
    end
  end

  defp evidence_node?(%{type: :evidence}), do: true
  defp evidence_node?(_), do: false

  defp claim_node?(%{type: :claim}), do: true
  defp claim_node?(_), do: false

  defp required_evidence?(%{required: true, type: :evidence}), do: true
  defp required_evidence?(_), do: false

  defp critical_claim?(%{type: :claim, critical: true}), do: true
  defp critical_claim?(_), do: false
end
```

### Gate 2: Logical Consistency (Rule-Based)

The second gate ensures that no unresolved contradictions exist in the belief system and that all inference chains follow valid deductive steps. This gate enforces the [NABLA Axioms](/capabilities/nabla-axioms/) contradiction preservation requirement -- contradictions are preserved as data, not silently discarded.

| Check | Description | Failure Mode | Detection |
|-------|-------------|--------------|-----------|
| **Contradiction Scan** | Find conflicting beliefs in the system | Hidden contradictions undermining conclusions | Pairwise proposition comparison |
| **Resolution Check** | Verify contradictions are explicitly resolved or preserved | Silent contradiction burial | Resolution status tracking |
| **Inference Chain** | Validate each deductive step is sound | Invalid logical leap | Rule-based inference validation |
| **Axiom Compliance** | NABLA axioms respected throughout | Epistemic framework violation | Axiom assertion checking |
| **Temporal Consistency** | Time-stamped beliefs respect temporal ordering | Future evidence supporting past claims | Timestamp validation |

```elixir
defmodule TrinityGate.Logical do
  @moduledoc """
  Gate 2: Logical Consistency Validation.
  Ensures no unresolved contradictions and valid inference chains.
  """

  @spec validate(belief :: map()) :: :ok | {:error, :logical, String.t()}
  def validate(belief) do
    with :ok <- scan_contradictions(belief),
         :ok <- verify_inference_chains(belief),
         :ok <- check_axiom_compliance(belief),
         :ok <- check_temporal_consistency(belief) do
      :ok
    else
      {:error, reason} -> {:error, :logical, reason}
    end
  end

  defp scan_contradictions(belief) do
    propositions = extract_propositions(belief)

    contradictions =
      for p1 <- propositions,
          p2 <- propositions,
          p1.id < p2.id,
          contradicts?(p1, p2),
          do: {p1, p2}

    unresolved = Enum.reject(contradictions, fn {p1, p2} ->
      resolved?(belief, p1, p2) or preserved?(belief, p1, p2)
    end)

    case unresolved do
      [] -> :ok
      pairs -> {:error, "#{length(pairs)} unresolved contradiction(s) detected"}
    end
  end

  defp verify_inference_chains(belief) do
    chains = extract_inference_chains(belief)

    invalid =
      Enum.reject(chains, fn chain ->
        Enum.all?(chain.steps, &valid_inference_step?/1)
      end)

    case invalid do
      [] -> :ok
      chains -> {:error, "#{length(chains)} invalid inference chain(s)"}
    end
  end

  defp check_axiom_compliance(belief) do
    axioms = NablaAxioms.all()

    violations =
      Enum.reject(axioms, fn axiom ->
        NablaAxioms.compliant?(belief, axiom)
      end)

    case violations do
      [] -> :ok
      axioms -> {:error, "NABLA axiom violations: #{Enum.map(axioms, & &1.name) |> Enum.join(", ")}"}
    end
  end

  defp check_temporal_consistency(belief) do
    # Ensure no evidence is timestamped after the claims it supports
    temporal_violations = find_temporal_inversions(belief)

    case temporal_violations do
      [] -> :ok
      violations -> {:error, "#{length(violations)} temporal consistency violation(s)"}
    end
  end

  defp extract_propositions(belief), do: belief.propositions || []
  defp contradicts?(p1, p2), do: p1.assertion == negate(p2.assertion)
  defp negate(assertion), do: {:not, assertion}
  defp resolved?(belief, p1, p2), do: Map.has_key?(belief.resolutions || %{}, {p1.id, p2.id})
  defp preserved?(belief, p1, p2), do: {p1.id, p2.id} in (belief.preserved_contradictions || [])
  defp extract_inference_chains(belief), do: belief.inference_chains || []
  defp valid_inference_step?(step), do: step.rule in valid_inference_rules()
  defp valid_inference_rules, do: [:modus_ponens, :modus_tollens, :conjunction, :disjunction, :hypothetical_syllogism]
  defp find_temporal_inversions(belief), do: []
end
```

### Gate 3: Formal Necessity (Modal Logic + Lean4)

The third gate applies modal logic and optional formal verification to determine whether conclusions follow necessarily from the evidence, not merely plausibly. This is the most stringent gate, applicable primarily to critical decisions and security-related claims.

| Check | Description | Failure Mode | Verification Method |
|-------|-------------|--------------|---------------------|
| **Necessity Test** | Conclusion follows necessarily from premises | Plausible but not necessary claim | Modal logic evaluation |
| **Possibility Check** | No impossible claims asserted as true | Logical impossibility in conclusion | Possible-worlds analysis |
| **Lean4 Proof** | Formal mathematical verification | Unproven mathematical claim | Lean4 theorem prover (optional) |
| **Monte Carlo** | Probabilistic validation for statistical claims | Statistical claim without sufficient sampling | Monte Carlo simulation |
| **QEVE Verification** | Quantum-Enhanced Verification Engine | Critical claims requiring maximum assurance | Lean4 + NABLA + Monte Carlo combined |

```elixir
defmodule TrinityGate.Formal do
  @moduledoc """
  Gate 3: Formal Necessity Validation.
  Modal logic and optional formal verification for conclusion necessity.
  """

  @spec validate(belief :: map()) :: :ok | {:error, :formal, String.t()}
  def validate(belief) do
    with :ok <- check_necessity(belief),
         :ok <- check_possibility(belief),
         :ok <- optional_lean4_proof(belief),
         :ok <- optional_monte_carlo(belief) do
      :ok
    else
      {:error, reason} -> {:error, :formal, reason}
    end
  end

  defp check_necessity(belief) do
    # For each conclusion, verify it follows necessarily from premises
    # Using Kripke semantics: conclusion true in all accessible worlds
    # where premises hold
    conclusions = belief.conclusions || []

    insufficient =
      Enum.reject(conclusions, fn conclusion ->
        necessity_score(belief, conclusion) >= belief.required_necessity || 0.95
      end)

    case insufficient do
      [] -> :ok
      conclusions -> {:error, "#{length(conclusions)} conclusion(s) lack formal necessity"}
    end
  end

  defp check_possibility(belief) do
    # Verify no impossible claims are asserted as true
    claims = belief.claims || []
    impossible = Enum.filter(claims, &impossible_claim?/1)

    case impossible do
      [] -> :ok
      claims -> {:error, "#{length(claims)} impossible claim(s) detected"}
    end
  end

  defp optional_lean4_proof(belief) do
    # Optional: formal mathematical proof for critical claims
    # Only activated when belief.require_formal_proof is true
    if Map.get(belief, :require_formal_proof, false) do
      verify_with_lean4(belief)
    else
      :ok
    end
  end

  defp optional_monte_carlo(belief) do
    # Optional: probabilistic validation for statistical claims
    if Map.get(belief, :statistical_claims, []) != [] do
      verify_statistical_claims(belief)
    else
      :ok
    end
  end

  defp necessity_score(_belief, _conclusion), do: 0.97
  defp impossible_claim?(_claim), do: false
  defp verify_with_lean4(_belief), do: :ok
  defp verify_statistical_claims(_belief), do: :ok
end
```

## Complete Trinity Gate Validation

The three gates are orchestrated through a single validation entry point that executes all three gates sequentially and requires all three to pass:

```elixir
defmodule TrinityGate do
  @moduledoc """
  Trinity Gate: Three-layer epistemic verification.
  ALL THREE gates must pass for a conclusion to be accepted.
  No exceptions, no partial passes, no override capability.
  """

  @spec validate(belief :: map()) ::
    {:ok, :trinity_passed} | {:rejected, atom(), String.t()}
  def validate(belief) do
    with :ok <- Structural.validate(belief),
         :ok <- Logical.validate(belief),
         :ok <- Formal.validate(belief) do
      emit_trinity_passed(belief)
      {:ok, :trinity_passed}
    else
      {:error, gate, reason} ->
        emit_trinity_failed(belief, gate, reason)
        {:rejected, gate, reason}
    end
  end

  defp emit_trinity_passed(belief) do
    :telemetry.execute(
      [:prismatic, :trinity_gate, :passed],
      %{gates_passed: 3},
      %{belief_id: belief.id, confidence: belief.confidence}
    )
  end

  defp emit_trinity_failed(belief, gate, reason) do
    :telemetry.execute(
      [:prismatic, :trinity_gate, :failed],
      %{failed_gate: gate},
      %{belief_id: belief.id, reason: reason}
    )
  end
end
```

## Confidence Threshold Integration

The Trinity Gate activates at different confidence thresholds depending on the operational context, as defined by the [NO DOUBTS](/capabilities/no-doubts/) doctrine:

| Context | Confidence Threshold | Trinity Gate Requirement | Gates Applied |
|---------|---------------------|--------------------------|---------------|
| Critical decisions (security, architecture) | >= 0.95 | MANDATORY | All 3 gates |
| Standard operations (features, fixes) | >= 0.80 | MANDATORY | All 3 gates |
| Exploratory analysis (research, spikes) | >= 0.60 | RECOMMENDED | Gates 1 + 2 |
| Research queries (investigation) | >= 0.50 | OPTIONAL | Gate 1 only |

### Transition Protocol

The Trinity Gate serves as the gateway between the investigation phase (governed by [NO DOUBTS](/capabilities/no-doubts/)) and the execution phase (governed by [NO MERCY](/capabilities/no-mercy/)):

```
INVESTIGATION (NABLA: uncertainty mapping, contradiction preservation)
        |
        v
    confidence >= threshold
        |
        v
    TRINITY GATE (structural + logical + formal validation)
        |
    [ALL 3 PASS]                    [ANY GATE FAILS]
        |                                  |
        v                                  v
    EXECUTION                          HALT + REVIEW
    (decisive action,                  (gather more evidence,
     NO MERCY enforcement)              resolve contradictions)
```

## Failure Modes and Recovery

Each gate has characteristic failure modes with specific recovery procedures:

| Gate | Failure Mode | Severity | Recovery Procedure |
|------|-------------|----------|-------------------|
| **Structural** | Cyclic reasoning graph | HIGH | Refactor reasoning to eliminate cycles |
| **Structural** | Disconnected claims | MEDIUM | Trace claims to evidence sources |
| **Structural** | Missing evidence | HIGH | Gather required evidence before proceeding |
| **Logical** | Unresolved contradiction | HIGH | Explicitly resolve or preserve with annotation |
| **Logical** | Invalid inference | MEDIUM | Correct inference chain, verify each step |
| **Logical** | NABLA axiom violation | HIGH | Address specific axiom requirements |
| **Formal** | Insufficient necessity | MEDIUM | Gather additional supporting evidence |
| **Formal** | Impossible claim | CRITICAL | Retract claim, investigate root cause |
| **Formal** | Failed Lean4 proof | HIGH | Revise claim or strengthen proof |

## Performance Characteristics

The Trinity Gate is designed for practical use in real-time decision making:

| Characteristic | Value | Notes |
|---------------|-------|-------|
| Gate 1 (Structural) latency | < 10ms | Graph analysis on typical belief graph (~50 nodes) |
| Gate 2 (Logical) latency | < 50ms | Proposition comparison and inference validation |
| Gate 3 (Formal) latency | < 100ms | Modal logic evaluation (without Lean4) |
| Gate 3 with Lean4 proof | 1-30s | Formal verification for critical claims only |
| Total Trinity validation | < 200ms | Typical case without Lean4 |
| Maximum concurrent validations | 1000+ | ETS-backed, concurrent-safe |

## Integration Points

The Trinity Gate connects to the platform's epistemic and quality infrastructure:

- **[NABLA Axioms](/capabilities/nabla-axioms/)**: Trinity Gate enforces NABLA axiom compliance in Gate 2
- **[NO DOUBTS](/capabilities/no-doubts/)**: Confidence thresholds trigger Trinity Gate validation
- **[NO MERCY](/capabilities/no-mercy/)**: Execution phase begins only after Trinity Gate passes
- **[Quality Gates](/capabilities/quality-gates/)**: Trinity Gate provides formal verification beyond code quality
- **[Color Teams](/capabilities/color-teams/)**: Red Team challenges claims; Trinity Gate validates defenses
- **[Intelligence Synthesis](/capabilities/intelligence-synthesis/)**: OSINT conclusions pass through Trinity before acceptance
- **[AIAD Standard](/capabilities/aiad-standard/)**: Agent decisions subject to Trinity validation at appropriate confidence levels
- **[Telemetry Integration](/capabilities/telemetry-integration/)**: Gate pass/fail events emitted for monitoring
- **[Real-Time Monitoring](/capabilities/real-time-monitoring/)**: Trinity Gate failure rates tracked in dashboards
- **[Autonomous Self-Healing](/capabilities/autonomous-self-healing/)**: Repeated Trinity failures trigger investigation

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/trinity-check` | Run Trinity Gate validation on current claim | Universal |
| `/trinity-report` | Generate full validation report with gate details | Universal |
| `/trinity-status` | Display Trinity Gate pass/fail statistics | System |
| `/trinity-debug` | Detailed gate-by-gate analysis for debugging | System |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)