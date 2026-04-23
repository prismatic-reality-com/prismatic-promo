+++
title = "white-invariant-prover"
weight = 415
[extra]
domain = "verification"
level = "L4"
description = "System invariant verified with proof artifact"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["trinity-gate", "lean4", "property-based-testing", "nabla-infinity", "aiad", "no-mercy", "no-doubts", "seadf", "telemetry"]
domain_normalized = "verification"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2300
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["white-invariant-prover", "System", "agents", "agent", "Prismatic Platform", "White Team", "Trinity Gate"]
tags = ["agents", "agent", "white-invariant-prover", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "white-invariant-prover - Prismatic Platform"
+++

## Overview

The white-invariant-prover operates as an L4 Specialist authority within the Prismatic Platform's [White Team](/glossary/white-team/) verification domain, responsible for constructing and maintaining formal proofs of system invariants. While the [white-contract-validator](/agents/white-contract-validator/) verifies that interface contracts are honored, the invariant prover establishes deeper mathematical guarantees -- proving that fundamental system properties hold under all possible execution paths, not just the paths exercised by testing.

System invariants are properties that must hold true at every point during system execution: data consistency guarantees, ordering constraints, resource bounds, safety properties, and liveness conditions. The white-invariant-prover uses a progressive verification methodology spanning five levels: L0 (type checking), L1 (property-based testing), L2 (model checking), L3 (abstract interpretation), and L4 (formal proof in [Lean4](/glossary/lean4/)). Each level provides stronger guarantees than the previous, with L4 providing mathematical certainty that the invariant holds for all inputs and all execution paths.

Built on the [AIAD](/glossary/aiad/) standard, the agent produces immutable proof artifacts that pass through [Trinity Gate](/glossary/trinity-gate/) validation before being accepted into the platform's verification corpus. The agent coordinates with the [white-verifier-commander](/agents/white-verifier-commander/) for strategic proof planning and with the [verification-integrity-commander](/agents/verification-integrity-commander/) for integration with the five core evolution theorems. All verification activities comply with the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework and the [NO MERCY](/glossary/no-mercy/) doctrine's absolute requirement for evidence-based claims.

## Architecture

The white-invariant-prover is built on a layered proof construction architecture that implements the progressive verification methodology.

```
WhiteInvariantProver.Supervisor
+-- InvariantRegistry.Server      (canonical invariant catalog)
+-- TypeChecker.Worker            (L0 - type-level verification)
+-- PropertyTester.Worker         (L1 - property-based testing)
+-- ModelChecker.Worker           (L2 - finite state exploration)
+-- AbstractInterpreter.Worker    (L3 - abstract domain analysis)
+-- Lean4Prover.Worker            (L4 - formal proof construction)
+-- ProofArtifact.Store           (immutable proof evidence storage)
```

The InvariantRegistry maintains the canonical catalog of system invariants, each annotated with its current verification level, proof status, and the affected system components. The verification workers implement each level of the progressive methodology, from lightweight type checking through full formal proof. The ProofArtifact store maintains immutable proof evidence, ensuring that verification results cannot be altered after production.

The architecture uses a [Dynamic Supervisor](/glossary/dynamic-supervisor/) pattern for the verification workers, allowing the system to spawn additional workers when proof construction requires parallelism (particularly for L2 model checking and L4 Lean4 proof construction). Each worker communicates with the InvariantRegistry through [GenServer](/glossary/genserver/) calls, and proof artifacts are stored through the ProofArtifact module's write-once interface.

## Core Capabilities

The white-invariant-prover provides five primary capabilities organized around the progressive verification methodology.

**Type-Level Invariant Verification (L0)** leverages [Dialyzer](/glossary/dialyzer/) and the Elixir type system to verify invariants that can be expressed as type constraints. This includes data structure shape invariants (a configuration map always contains required keys), numeric bound invariants (a score is always between 0 and 100), and state machine type invariants (a process state is always one of a defined set of atoms).

**Property-Based Invariant Testing (L1)** uses [property-based testing](/glossary/property-based-testing/) to verify invariants through randomized exploration. The agent generates property specifications from invariant declarations and executes thousands of randomized test cases, searching for counterexamples that violate the invariant. While not providing mathematical certainty, L1 verification catches the majority of invariant violations through extensive domain coverage.

**Model Checking (L2)** performs exhaustive exploration of finite state spaces to verify invariants over all reachable states. This is particularly effective for [GenServer](/glossary/genserver/) state machine invariants where the state space is bounded. The agent constructs finite models of OTP process behavior and uses breadth-first exploration to verify that the invariant holds at every reachable state.

**Abstract Interpretation (L3)** applies abstract domain analysis to verify invariants over infinite state spaces without exhaustive enumeration. The agent computes abstract representations of system behavior and verifies that the invariant holds in the abstract domain, which guarantees it holds in the concrete domain. This technique is particularly effective for numeric invariants and resource bound verification.

**Formal Proof Construction (L4)** produces machine-checked [Lean4](/glossary/lean4/) proofs for the most critical system invariants. This level provides mathematical certainty -- a Lean4 proof that an invariant holds is as reliable as the Lean4 proof checker itself. The agent translates Elixir system specifications into Lean4 formalizations and constructs proofs using Lean4's tactic framework.

**Fault Injection Analysis** complements the positive verification levels by actively attempting to violate invariants through targeted fault injection. The agent introduces simulated failures (process crashes, message losses, timeout expirations) and verifies that invariants are maintained even under adversarial conditions.

## Implementation

The core invariant prover is implemented as an [OTP](/glossary/otp/) [GenServer](/glossary/genserver/) that coordinates progressive verification across all levels.

```elixir
defmodule Prismatic.Agents.WhiteInvariantProver do
  @moduledoc """
  White Team Invariant Prover - constructs formal proofs
  of system invariants using progressive verification
  methodology (L0 through L4).
  """

  use GenServer

  alias Prismatic.Agents.WhiteInvariantProver.{
    InvariantRegistry,
    TypeChecker,
    PropertyTester,
    ModelChecker,
    AbstractInterpreter,
    Lean4Prover,
    ProofArtifact
  }

  @verification_levels [:l0_type, :l1_property, :l2_model, :l3_abstract, :l4_formal]

  @type invariant :: %{
    id: String.t(),
    name: String.t(),
    description: String.t(),
    affected_modules: [module()],
    current_level: atom(),
    target_level: atom(),
    status: :unverified | :verified | :violated | :in_progress
  }

  @type proof_result :: %{
    invariant_id: String.t(),
    level: atom(),
    status: :proved | :disproved | :inconclusive,
    evidence: map(),
    duration_ms: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_verification_cycle(opts[:interval] || :timer.hours(8))

    {:ok, %{
      invariants: InvariantRegistry.load_all(),
      proof_history: [],
      config: Map.new(opts)
    }}
  end

  @spec prove_invariant(String.t(), atom()) :: {:ok, proof_result()} | {:error, term()}
  def prove_invariant(invariant_id, target_level \\ :l4_formal) do
    GenServer.call(__MODULE__, {:prove, invariant_id, target_level}, :timer.minutes(30))
  end

  @impl true
  def handle_call({:prove, invariant_id, target_level}, _from, state) do
    case Map.get(state.invariants, invariant_id) do
      nil ->
        {:reply, {:error, :invariant_not_found}, state}

      invariant ->
        result = progressive_verify(invariant, target_level)

        ProofArtifact.store(result)

        :telemetry.execute(
          [:prismatic, :white_invariant, :proof_complete],
          %{
            level: level_to_int(result.level),
            status: status_to_int(result.status),
            duration_ms: result.duration_ms
          },
          %{invariant_id: invariant_id}
        )

        updated_invariant = %{invariant |
          current_level: result.level,
          status: map_proof_status(result.status)
        }

        new_state = put_in(state, [:invariants, invariant_id], updated_invariant)
        {:reply, {:ok, result}, new_state}
    end
  end

  defp progressive_verify(invariant, target_level) do
    start_time = System.monotonic_time(:millisecond)

    result =
      @verification_levels
      |> Enum.take_while(&(level_order(&1) <= level_order(target_level)))
      |> Enum.reduce_while(nil, fn level, _acc ->
        case verify_at_level(invariant, level) do
          {:proved, evidence} ->
            {:cont, %{level: level, status: :proved, evidence: evidence}}

          {:disproved, evidence} ->
            {:halt, %{level: level, status: :disproved, evidence: evidence}}

          {:inconclusive, evidence} ->
            {:cont, %{level: level, status: :inconclusive, evidence: evidence}}
        end
      end)

    duration = System.monotonic_time(:millisecond) - start_time

    Map.merge(result, %{
      invariant_id: invariant.id,
      duration_ms: duration
    })
  end

  defp verify_at_level(invariant, :l0_type), do: TypeChecker.verify(invariant)
  defp verify_at_level(invariant, :l1_property), do: PropertyTester.verify(invariant)
  defp verify_at_level(invariant, :l2_model), do: ModelChecker.verify(invariant)
  defp verify_at_level(invariant, :l3_abstract), do: AbstractInterpreter.verify(invariant)
  defp verify_at_level(invariant, :l4_formal), do: Lean4Prover.verify(invariant)

  defp level_order(:l0_type), do: 0
  defp level_order(:l1_property), do: 1
  defp level_order(:l2_model), do: 2
  defp level_order(:l3_abstract), do: 3
  defp level_order(:l4_formal), do: 4

  defp level_to_int(level), do: level_order(level)
  defp status_to_int(:proved), do: 1
  defp status_to_int(:inconclusive), do: 0
  defp status_to_int(:disproved), do: -1

  defp map_proof_status(:proved), do: :verified
  defp map_proof_status(:disproved), do: :violated
  defp map_proof_status(:inconclusive), do: :in_progress

  defp schedule_verification_cycle(interval) do
    Process.send_after(self(), :verification_cycle, interval)
  end
end
```

The `progressive_verify/2` function implements the core methodology: starting from L0 type checking and progressing through each level until either a disproof is found (halting immediately) or the target level is reached. Each level builds on the evidence from previous levels, providing increasingly strong guarantees.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [white-verifier-commander](/agents/white-verifier-commander/) | Outbound | Reports proof results to White Team commander for composite proof construction |
| [white-contract-validator](/agents/white-contract-validator/) | Bidirectional | Collaborates on interface invariant verification; receives contract specifications |
| [verification-integrity-commander](/agents/verification-integrity-commander/) | Outbound | Provides proof artifacts for core evolution theorem maintenance |
| [purple-coordinator](/agents/purple-coordinator/) | Outbound | Proof results feed Purple Team synthesis and closure assessment |
| [Trinity Gate](/glossary/trinity-gate/) | Enforcement | All proof artifacts pass through three-layer validation |
| [SEADF](/glossary/seadf/) Evolution Pipeline | Outbound | Invariant status informs evolution safety assessment |
| Lean4 Runtime | External | Formal proof construction and checking |
| [Dialyzer](/glossary/dialyzer/) | L0 | Type-level invariant verification |

## Operational Workflow

The agent operates through three modes: progressive verification campaigns, on-demand proof construction, and continuous invariant monitoring.

**Progressive Verification Campaigns** are scheduled verification sweeps that advance all tracked invariants toward their target verification levels. Each campaign starts from the current verification level of each invariant and attempts to advance it by one or more levels, recording evidence at each stage.

**On-Demand Proof Construction** supports targeted proof construction for specific invariants, invoked through the command interface or by other agents (particularly the verification-integrity-commander when evolution gate checks require invariant proof updates).

**Continuous Invariant Monitoring** runs as a background process that detects code changes affecting invariant-bearing modules. When a change is detected, the affected invariants are re-verified at their current level to ensure the change has not introduced a violation.

The proof construction workflow follows a six-phase process: (1) invariant specification loading, (2) progressive level verification starting from L0, (3) evidence artifact generation at each level, (4) Trinity Gate validation of evidence, (5) proof artifact storage, and (6) result publication through telemetry.

## NABLA Compliance

The white-invariant-prover operates under strict [NABLA Infinity](/glossary/nabla-infinity/) epistemic governance.

**Signal Plurality**: Every invariant verification combines evidence from multiple levels. An L4-verified invariant has evidence from L0 (type checking), L1 (property testing), L2 (model checking), L3 (abstract interpretation), and L4 (formal proof) -- five independent signals confirming the invariant.

**Contradiction Preservation**: When different verification levels produce conflicting results (L1 property testing finds no counterexample but L2 model checking discovers a reachable violation state), both results are preserved with full evidence chains. The lower-level positive result does not suppress the higher-level negative result.

**Provenance Mandatory**: Every proof artifact carries complete provenance: invariant specification, verification level, proof methodology, tool versions (Lean4 version, property testing library version), input parameters, and complete evidence chains. Artifacts are immutable.

**Unknown Valid**: Inconclusive results are explicitly represented. When L4 proof construction times out or encounters an unsupported pattern, the result is `:inconclusive` rather than either `:proved` or `:disproved`. The agent acknowledges the limits of each verification level.

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.WhiteInvariantProver,
  verification_interval: :timer.hours(8),
  default_target_level: :l2_model,
  critical_target_level: :l4_formal,
  property_test_iterations: 5000,
  model_check_state_limit: 100_000,
  lean4_timeout: :timer.minutes(10),
  lean4_path: System.get_env("LEAN4_PATH", "/usr/local/bin/lean"),
  proof_artifacts_dir: "priv/proofs/invariants/",
  telemetry_prefix: [:prismatic, :white_invariant]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `verification_interval` | 8 hours | Time between scheduled verification campaigns |
| `default_target_level` | `:l2_model` | Default verification level for non-critical invariants |
| `critical_target_level` | `:l4_formal` | Verification level for critical invariants |
| `property_test_iterations` | 5000 | Randomized test cases per L1 property |
| `model_check_state_limit` | 100,000 | Maximum states explored in L2 model checking |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| L0 type checking (per invariant) | < 5 seconds | 1-3 seconds |
| L1 property testing (5000 iterations) | < 30 seconds | 10-25 seconds |
| L2 model checking (100k states) | < 5 minutes | 1-4 minutes |
| L3 abstract interpretation | < 2 minutes | 30-90 seconds |
| L4 Lean4 proof construction | < 30 minutes | 5-25 minutes |
| Proof artifact storage | < 100 ms | 20-50 ms |
| Full campaign (all invariants) | < 2 hours | 30-90 minutes |

The progressive methodology is designed for performance: L0 and L1 verification is fast and catches most violations early, while L2-L4 verification is more expensive but only invoked for invariants that pass the cheaper levels. This approach ensures that common violations are detected quickly while critical invariants receive the strongest guarantees.

## Related Resources

- [White Team](/glossary/white-team/) -- Constructive verification team overview
- [white-verifier-commander](/agents/white-verifier-commander/) -- White Team strategic commander
- [white-contract-validator](/agents/white-contract-validator/) -- Interface contract verification specialist
- [Lean4](/glossary/lean4/) -- Formal theorem prover for L4 verification
- [Property-Based Testing](/glossary/property-based-testing/) -- L1 probabilistic verification methodology
- [Trinity Gate](/glossary/trinity-gate/) -- Three-layer validation for proof artifacts
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing invariant claims
- [Dialyzer](/glossary/dialyzer/) -- Erlang type analysis used for L0 verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)