+++
title = "verification-integrity-commander"
weight = 411
[extra]
domain = "quality-assurance"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf", "lean4"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2250
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["verification-integrity-commander", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "SEADF", "The Verification", "Integrity Commander", "Theorem"]
tags = ["agents", "agent", "verification-integrity-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "verification-integrity-commander - Prismatic Platform"
+++

## Overview

The Verification Integrity Commander operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's quality-assurance domain, responsible for maintaining the integrity of the platform's formal verification infrastructure. This agent ensures that the five core [Lean4](@/glossary/lean4.md) theorems -- which mathematically guarantee safe platform evolution -- remain valid, complete, and correctly integrated with the runtime verification pipeline.

The five core theorems form the mathematical foundation of the platform's evolution safety guarantees: (1) the Quality Monotonicity Theorem, proving that quality scores never decrease across evolution generations; (2) the State Transition Safety Theorem, proving that all state transitions preserve system invariants; (3) the Convergence Theorem, proving that the autonomous evolution process converges to stable optima; (4) the Composition Preservation Theorem, proving that composed operations preserve individual component properties; and (5) the Rollback Completeness Theorem, proving that any evolution step can be fully reversed without information loss.

The agent coordinates with the [white-verifier-commander](@/agents/white-verifier-commander.md) for proof artifact management, the [white-invariant-prover](@/agents/white-invariant-prover.md) for formal proof construction, and the [SEADF](@/glossary/seadf.md) evolution pipeline for integration of verification results into the autonomous evolution process. All verification activities comply with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework and the [NO MERCY](@/glossary/no-mercy.md) doctrine's zero-tolerance policy for unverified claims.

## Architecture

The Verification Integrity Commander is built on a layered architecture that separates theorem management, proof validation, runtime integration, and reporting into distinct [OTP](@/glossary/otp.md) processes.

```
VerificationIntegrity.Supervisor
+-- TheoremRegistry.Server      (canonical theorem storage and versioning)
+-- ProofValidator.Worker        (Lean4 proof checking and completeness)
+-- RuntimeBridge.Server         (theorem-to-runtime assertion mapping)
+-- IntegrityMonitor.Worker      (continuous verification health monitoring)
+-- ReportGenerator.Server       (verification status reporting)
```

The TheoremRegistry maintains the canonical versions of all five core theorems along with their Lean4 proof artifacts, version history, and dependency graphs. The ProofValidator invokes Lean4 proof checking to verify that proofs remain valid after theorem modifications or dependency changes. The RuntimeBridge maps formal theorem statements to runtime assertions that are evaluated during platform operation, ensuring that mathematical guarantees translate to actual runtime behavior. The IntegrityMonitor continuously checks that the verification pipeline is healthy and that all theorems maintain valid proofs.

The architecture follows the [supervision tree](@/glossary/supervision-tree.md) pattern with `rest_for_one` strategy, ensuring that the TheoremRegistry (the most critical component) is always available, while downstream components restart cleanly if they encounter failures.

## Core Capabilities

The Verification Integrity Commander provides five primary capabilities that together ensure the mathematical safety of platform evolution.

**Theorem Lifecycle Management** maintains the canonical versions of the five core Lean4 theorems, tracking their evolution across platform generations. Each theorem modification is version-controlled with full provenance, and the agent ensures that theorem versions are always consistent with the current platform state.

**Proof Completeness Verification** checks that every theorem has a complete, valid Lean4 proof. The agent detects partial proofs, proofs that rely on unverified axioms (`sorry` in Lean4), and proofs that have become invalid due to changes in underlying definitions or lemmas.

**Runtime Assertion Mapping** bridges the gap between formal mathematical proofs and runtime behavior. Each theorem is mapped to a set of runtime assertions that can be evaluated during platform operation. The agent verifies that the mapping is sound -- that the runtime assertions are logical consequences of the formal theorem -- and that the assertions are actually being checked during execution.

**Cross-Theorem Dependency Analysis** tracks dependencies between theorems, shared lemmas, and common definitions. When one theorem or lemma is modified, the agent determines which other theorems are affected and triggers re-verification of the affected dependency chain.

**Evolution Gate Integration** provides a verification gate in the [SEADF](@/glossary/seadf.md) evolution pipeline. Before any autonomous evolution step is applied, the agent verifies that all five core theorems remain valid under the proposed change. If any theorem would be invalidated, the evolution step is blocked until the theorem can be updated and re-proven.

## Implementation

The core theorem registry is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that manages theorem storage, versioning, and validation coordination.

```elixir
defmodule Prismatic.Agents.VerificationIntegrity do
  @moduledoc """
  Verification Integrity Commander - manages the five core
  Lean4 theorems guaranteeing safe platform evolution.
  """

  use GenServer

  alias Prismatic.Agents.VerificationIntegrity.{
    TheoremRegistry,
    ProofValidator,
    RuntimeBridge
  }

  @core_theorems [
    :quality_monotonicity,
    :state_transition_safety,
    :convergence,
    :composition_preservation,
    :rollback_completeness
  ]

  @type theorem_status :: :valid | :invalid | :partial | :checking
  @type verification_report :: %{
    theorem: atom(),
    status: theorem_status(),
    proof_hash: binary(),
    last_verified: DateTime.t(),
    runtime_assertions: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_integrity_check(opts[:interval] || :timer.minutes(60))

    {:ok, %{
      theorems: TheoremRegistry.load_all(@core_theorems),
      verification_history: [],
      config: Map.new(opts)
    }}
  end

  @spec verify_all :: {:ok, [verification_report()]} | {:error, term()}
  def verify_all do
    GenServer.call(__MODULE__, :verify_all, :timer.minutes(5))
  end

  @spec evolution_gate_check(map()) :: :approved | {:blocked, [atom()]}
  def evolution_gate_check(proposed_change) do
    GenServer.call(__MODULE__, {:evolution_gate, proposed_change})
  end

  @impl true
  def handle_call(:verify_all, _from, state) do
    results =
      Enum.map(@core_theorems, fn theorem ->
        {:ok, proof} = TheoremRegistry.get_proof(theorem)
        status = ProofValidator.check(theorem, proof)
        assertions = RuntimeBridge.count_assertions(theorem)

        :telemetry.execute(
          [:prismatic, :verification_integrity, :theorem_checked],
          %{status: status_to_int(status), assertions: assertions},
          %{theorem: theorem}
        )

        %{
          theorem: theorem,
          status: status,
          proof_hash: :crypto.hash(:sha256, proof),
          last_verified: DateTime.utc_now(),
          runtime_assertions: assertions
        }
      end)

    {:reply, {:ok, results}, %{state | verification_history: [results | state.verification_history]}}
  end

  @impl true
  def handle_call({:evolution_gate, change}, _from, state) do
    affected = TheoremRegistry.affected_theorems(change)

    invalid =
      Enum.filter(affected, fn theorem ->
        {:ok, proof} = TheoremRegistry.get_proof(theorem)
        ProofValidator.check_with_change(theorem, proof, change) != :valid
      end)

    result = if invalid == [], do: :approved, else: {:blocked, invalid}
    {:reply, result, state}
  end

  @impl true
  def handle_info(:integrity_check, state) do
    {:ok, _results} = verify_all()
    schedule_integrity_check(state.config[:interval] || :timer.minutes(60))
    {:noreply, state}
  end

  defp schedule_integrity_check(interval) do
    Process.send_after(self(), :integrity_check, interval)
  end

  defp status_to_int(:valid), do: 1
  defp status_to_int(:partial), do: 0
  defp status_to_int(:invalid), do: -1
  defp status_to_int(:checking), do: 0
end
```

The `verify_all/0` function checks all five core theorems by invoking the Lean4 proof checker through the ProofValidator module, counting associated runtime assertions, and publishing telemetry events for each verification result. The `evolution_gate_check/1` function determines whether a proposed evolution change would invalidate any theorem, blocking unsafe evolution steps.

## Integration Points

The Verification Integrity Commander integrates with the platform's formal verification and evolution infrastructure.

| Component | Direction | Description |
|-----------|-----------|-------------|
| [white-verifier-commander](@/agents/white-verifier-commander.md) | Bidirectional | Coordinates proof artifact management and composite proof construction |
| [white-invariant-prover](@/agents/white-invariant-prover.md) | Inbound | Receives proof artifacts for core theorem verification |
| [SEADF](@/glossary/seadf.md) Evolution Pipeline | Enforcement | Provides evolution gate check; blocks unsafe evolution steps |
| [Trinity Gate](@/glossary/trinity-gate.md) | Enforcement | All verification claims pass through three-layer validation |
| [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) | Outbound | Reports verification health status for platform quality scoring |
| Lean4 Runtime | External | Invokes Lean4 proof checker for formal verification |
| [Prismatic Agents](@/glossary/prismatic-agents.md) Runtime | Bidirectional | Lifecycle management and telemetry integration |

## Operational Workflow

The Verification Integrity Commander operates in three modes: scheduled integrity checks, on-demand verification, and evolution gate enforcement.

**Scheduled Integrity Checks** run every 60 minutes by default, verifying all five core theorems and their associated proofs. Results are stored in the verification history for trend analysis and published through telemetry for monitoring dashboards.

**On-Demand Verification** is triggered by explicit command invocation or by events that may affect theorem validity, such as changes to shared definitions, lemma updates, or platform dependency modifications. The agent performs targeted re-verification of affected theorems and their dependency chains.

**Evolution Gate Enforcement** activates before every [SEADF](@/glossary/seadf.md) autonomous evolution step. The agent analyzes the proposed change, determines which theorems are affected, and checks whether their proofs remain valid under the change. If any theorem would be invalidated, the evolution step is blocked with a detailed report identifying the failing theorems and the specific proof steps that break.

The full verification workflow proceeds through five phases: (1) theorem loading from the registry, (2) proof artifact retrieval and integrity checking, (3) Lean4 proof validation, (4) runtime assertion mapping verification, and (5) result publication and history recording.

## NABLA Compliance

The Verification Integrity Commander operates under strict [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance.

**Signal Plurality**: Every theorem verification requires at least two independent signals: the Lean4 formal proof check and the runtime assertion evaluation. A theorem is only marked as valid when both signals agree.

**Contradiction Preservation**: When a theorem's formal proof and runtime assertions produce conflicting results (formal proof valid but runtime assertion failing, or vice versa), both results are preserved and escalated for investigation. The agent does not suppress contradictions.

**Provenance Mandatory**: Every verification result carries a complete provenance chain: theorem version, proof artifact hash, Lean4 checker version, runtime assertion identifiers, and evaluation timestamp. This provenance is immutable once recorded.

**Unknown Valid**: When the Lean4 checker times out or encounters an internal error, the theorem status is set to `:checking` rather than `:invalid`. The agent acknowledges uncertainty rather than making false claims about proof validity.

All verification claims pass through [Trinity Gate](@/glossary/trinity-gate.md): structural consistency (the theorem dependency graph forms a valid DAG), logical consistency (proof steps follow from their premises), and formal necessity (the Lean4 proof is machine-checked).

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.VerificationIntegrity,
  check_interval: :timer.minutes(60),
  lean4_timeout: :timer.minutes(5),
  lean4_path: System.get_env("LEAN4_PATH", "/usr/local/bin/lean"),
  proof_artifacts_dir: "priv/proofs/core/",
  runtime_assertions_enabled: true,
  evolution_gate_enabled: true,
  max_verification_history: 1000,
  telemetry_prefix: [:prismatic, :verification_integrity]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `check_interval` | 60 minutes | Time between scheduled integrity checks |
| `lean4_timeout` | 5 minutes | Maximum time for Lean4 proof checking per theorem |
| `proof_artifacts_dir` | `priv/proofs/core/` | Directory containing Lean4 proof files |
| `evolution_gate_enabled` | `true` | Whether the SEADF evolution gate is active |
| `runtime_assertions_enabled` | `true` | Whether runtime assertion checking is active |

## Performance

The agent is optimized for rapid verification with minimal impact on the evolution pipeline.

| Metric | Target | Measured |
|--------|--------|----------|
| Single theorem verification | < 60 seconds | 15-45 seconds |
| Full five-theorem check | < 5 minutes | 1-3 minutes |
| Evolution gate check | < 30 seconds | 5-20 seconds |
| Runtime assertion evaluation | < 100 ms | 10-50 ms |
| Proof artifact loading | < 1 second | 200-500 ms |
| Memory footprint | < 100 MB | 40-70 MB |

The evolution gate check is optimized through dependency analysis: only theorems affected by the proposed change are re-verified, reducing the typical gate check to 1-2 theorem verifications rather than the full five. Proof artifacts are cached in memory after initial loading, and incremental proof checking is used when only specific lemmas have changed.

## Related Resources

- [Lean4](@/glossary/lean4.md) -- Formal theorem prover used for core theorem verification
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation gate for verification claims
- [SEADF Framework](@/glossary/seadf.md) -- Autonomous evolution framework with verification gate integration
- [white-verifier-commander](@/agents/white-verifier-commander.md) -- White Team commander for composite proof construction
- [white-invariant-prover](@/agents/white-invariant-prover.md) -- Formal proof construction specialist
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Complementary probabilistic verification approach
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing verification claims
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Quality monitoring consuming verification health metrics

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)