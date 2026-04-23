+++
title = "white-contract-validator"
weight = 414
[extra]
domain = "verification"
level = "L4"
description = "Interface contract compliance confirmed"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["trinity-gate", "lean4", "property-based-testing", "nabla-infinity", "aiad", "no-mercy", "no-doubts", "seadf", "telemetry"]
domain_normalized = "verification"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2350
quality_score = 86
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["white-contract-validator", "Interface", "agents", "agent", "Prismatic Platform", "Trinity Gate", "White Team"]
tags = ["agents", "agent", "white-contract-validator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "white-contract-validator - Prismatic Platform"
+++

## Overview

The white-contract-validator operates as an L4 Specialist authority within the Prismatic Platform's [White Team](@/glossary/white-team.md) verification domain, responsible for validating that system interfaces, module boundaries, and inter-component contracts function according to their specifications. As a core member of the [color-team](@/glossary/color-teams.md) security architecture, this agent belongs to the White Team -- the constructive verification team that proves systems hold through progressive verification methodology spanning levels L0 through L5.

Built on the [AIAD](@/glossary/aiad.md) standard, the white-contract-validator produces evidence artifacts rather than modifying targets. All verification output passes through [Trinity Gate](@/glossary/trinity-gate.md) validation, ensuring structural, logical, and formal consistency. The agent applies [property-based testing](@/glossary/property-based-testing.md) to verify that contracts hold across the full input domain rather than just specific test cases, and leverages [Lean4](@/glossary/lean4.md) formal proofs for critical interface specifications where mathematical certainty is required.

The platform's 90 [umbrella application](@/glossary/umbrella-application.md)s define hundreds of inter-module contracts through Elixir behaviours, protocols, and API specifications. The white-contract-validator ensures that every producer-consumer agreement is honored, that interface changes do not break dependent modules, and that the system's compositional guarantees are maintained across all module boundaries. Contract verification operates within the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, where verification results carry formal provenance and multi-signal confirmation.

## Architecture

The white-contract-validator is built on a three-tier verification architecture that separates contract discovery, verification execution, and evidence artifact management into distinct [OTP](@/glossary/otp.md) processes.

```
WhiteContractValidator.Supervisor
+-- ContractDiscovery.Scanner     (automatic contract identification)
+-- BehaviourVerifier.Worker      (@callback contract testing)
+-- ProtocolVerifier.Worker       (message format validation)
+-- APIVerifier.Worker            (HTTP endpoint contract testing)
+-- PropertyGenerator.Engine      (property-based test generation)
+-- ProofArtifact.Store           (immutable evidence storage)
+-- TrinityGate.Validator         (three-layer validation)
```

The ContractDiscovery scanner automatically identifies contracts across the codebase by analyzing Elixir module attributes (`@callback`, `@behaviour`), protocol definitions (`defprotocol`), and API specifications (OpenApiSpex schemas). The verification workers execute contract checks for each category, generating structured evidence artifacts. The PropertyGenerator creates [property-based testing](@/glossary/property-based-testing.md) suites that explore the full input domain for each contract, going beyond example-based tests to provide probabilistic confidence. The ProofArtifact store maintains an immutable archive of all verification evidence, indexed by contract identifier and verification timestamp.

Communication between the discovery layer and verification workers uses [GenServer](@/glossary/genserver.md) calls with configurable timeouts, ensuring that long-running verification tasks do not block discovery operations. The [Trinity Gate](@/glossary/trinity-gate.md) validator applies three-layer validation to every verification result before it is stored as an evidence artifact.

## Core Capabilities

The white-contract-validator provides six primary capabilities that together form a comprehensive contract verification system.

**Behaviour Contract Validation** tests that all modules implementing [Elixir](@/glossary/elixir.md) behaviours satisfy their `@callback` contracts, verifying return types, error handling patterns, and side-effect constraints through property-based test generation. The agent discovers all behaviour-implementing modules by scanning `@behaviour` attributes and generates verification suites that exercise each callback with randomized inputs drawn from the callback's typespec domain.

**Protocol Contract Testing** validates message exchange protocols between [OTP](@/glossary/otp.md) processes, ensuring that [GenServer](@/glossary/genserver.md) call/cast interfaces, [PubSub](@/glossary/pubsub.md) message formats, and event schemas conform to documented specifications. The agent captures process message traces and validates them against protocol specifications, detecting violations such as unexpected message types, missing required fields, or incorrect response formats.

**API Contract Verification** tests HTTP endpoint contracts against [OpenAPI](@/glossary/openapi.md) specifications, validating request parsing, response serialization, error format compliance, and authentication boundary enforcement. The agent generates requests covering the full parameter space defined by the OpenAPI schema and validates that responses conform to the documented response schemas for each status code.

**Formal Proof Generation** produces [Lean4](@/glossary/lean4.md) proofs for critical interface invariants, establishing mathematical certainty for properties that property-based testing can only probabilistically verify. This capability is reserved for the most critical contracts where the cost of violation would be catastrophic.

**Contract Drift Detection** identifies cases where implementation has diverged from specification. When a module's actual behavior no longer matches its declared contract (either because the implementation changed without updating the specification, or because the specification was updated without adjusting the implementation), the agent flags the drift for immediate remediation.

**Cross-Module Dependency Verification** validates that contract changes in one module are compatible with all dependent modules. When a behaviour callback signature changes, the agent identifies all implementing modules and verifies that they have been updated to match the new contract.

## Implementation

The core contract verification coordinator is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that manages verification lifecycle and evidence artifact production.

```elixir
defmodule Prismatic.Agents.WhiteContractValidator do
  @moduledoc """
  White Team Contract Validator - verifies interface contracts
  across all module boundaries with property-based testing
  and formal proof generation.
  """

  use GenServer

  alias Prismatic.Agents.WhiteContractValidator.{
    ContractDiscovery,
    BehaviourVerifier,
    ProtocolVerifier,
    APIVerifier,
    ProofArtifact
  }

  @type contract_type :: :behaviour | :protocol | :api
  @type verification_result :: %{
    contract_id: String.t(),
    contract_type: contract_type(),
    module: module(),
    status: :verified | :violated | :partial,
    evidence: map(),
    proof_artifact_id: String.t() | nil,
    verified_at: DateTime.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_verification(opts[:interval] || :timer.hours(4))

    {:ok, %{
      contracts: ContractDiscovery.discover_all(),
      results: %{},
      config: Map.new(opts)
    }}
  end

  @spec verify_all_contracts :: {:ok, [verification_result()]}
  def verify_all_contracts do
    GenServer.call(__MODULE__, :verify_all, :timer.minutes(30))
  end

  @spec verify_behaviour(module()) :: {:ok, verification_result()}
  def verify_behaviour(module) do
    GenServer.call(__MODULE__, {:verify_behaviour, module})
  end

  @impl true
  def handle_call(:verify_all, _from, state) do
    behaviour_results =
      state.contracts
      |> Map.get(:behaviours, [])
      |> Enum.map(&BehaviourVerifier.verify/1)

    protocol_results =
      state.contracts
      |> Map.get(:protocols, [])
      |> Enum.map(&ProtocolVerifier.verify/1)

    api_results =
      state.contracts
      |> Map.get(:apis, [])
      |> Enum.map(&APIVerifier.verify/1)

    all_results = behaviour_results ++ protocol_results ++ api_results

    Enum.each(all_results, fn result ->
      ProofArtifact.store(result)

      :telemetry.execute(
        [:prismatic, :white_contract, :verification_complete],
        %{status: status_to_int(result.status)},
        %{
          contract_type: result.contract_type,
          module: result.module
        }
      )
    end)

    result_map = Map.new(all_results, &{&1.contract_id, &1})

    {:reply, {:ok, all_results},
     %{state | results: result_map}}
  end

  @impl true
  def handle_call({:verify_behaviour, module}, _from, state) do
    result = BehaviourVerifier.verify(module)
    ProofArtifact.store(result)

    {:reply, {:ok, result},
     put_in(state, [:results, result.contract_id], result)}
  end

  @impl true
  def handle_info(:scheduled_verification, state) do
    {:ok, _results} = verify_all_contracts()
    schedule_verification(state.config[:interval] || :timer.hours(4))
    {:noreply, %{state | contracts: ContractDiscovery.discover_all()}}
  end

  defp schedule_verification(interval) do
    Process.send_after(self(), :scheduled_verification, interval)
  end

  defp status_to_int(:verified), do: 1
  defp status_to_int(:partial), do: 0
  defp status_to_int(:violated), do: -1
end
```

The `verify_all_contracts/0` function orchestrates verification across all three contract categories, stores evidence artifacts for each result, and publishes telemetry metrics. The ContractDiscovery module is re-invoked during scheduled verification to detect newly added or modified contracts.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [white-verifier-commander](@/agents/white-verifier-commander.md) | Outbound | Reports verification results to White Team commander for composite proof construction |
| [white-invariant-prover](@/agents/white-invariant-prover.md) | Bidirectional | Collaborates on formal verification of critical interface invariants |
| [purple-coordinator](@/agents/purple-coordinator.md) | Outbound | Verification results feed [Purple Team](@/glossary/purple-team.md) synthesis for Red-Blue closure |
| [code-quality-commander](@/agents/code-quality-commander.md) | Outbound | Contract compliance status contributes to platform quality score |
| [Trinity Gate](@/glossary/trinity-gate.md) | Enforcement | All verification artifacts pass through three-layer validation |
| [Prismatic API](@/apps/prismatic-api.md) | Target | OpenAPI endpoint contract verification target |
| [AIAD Registry](@/glossary/registry-otp.md) | Inbound | Discovers agent interface contracts for verification |

## Operational Workflow

The agent operates through three modes: scheduled comprehensive verification, event-triggered targeted verification, and on-demand audit.

**Scheduled Verification** runs every 4 hours, performing a complete contract verification sweep across all discovered behaviours, protocols, and API specifications. The discovery phase re-scans the codebase to detect new or modified contracts, ensuring that the verification scope stays current with platform evolution.

**Event-Triggered Verification** activates when changes are detected in files that define or implement contracts. When a behaviour callback signature changes, all implementing modules are re-verified. When an API specification is updated, the corresponding endpoint contracts are re-validated.

**On-Demand Audit** supports targeted verification of specific modules, behaviour contracts, or API endpoints through the command interface. This mode is used during code review and pre-deployment verification to ensure that proposed changes maintain contract compliance.

The verification workflow proceeds through six phases: (1) contract discovery and enumeration, (2) property-based test generation for each contract, (3) test execution with randomized inputs, (4) evidence artifact generation, (5) Trinity Gate validation of artifacts, and (6) result publication and storage.

## NABLA Compliance

The white-contract-validator operates under strict [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance.

**Signal Plurality**: Every contract verification requires at least two independent signals. Behaviour contracts are verified through both property-based testing (probabilistic) and specific example tests (deterministic). API contracts are verified through both schema validation and runtime request-response testing.

**Contradiction Preservation**: When property-based tests pass but specific examples fail (or vice versa), both results are preserved in the evidence artifact with full context. The agent does not suppress contradictory evidence.

**Provenance Mandatory**: Every verification result carries complete provenance: contract specification source, verification module, test inputs and outputs, property definitions, and the specific rules that determined the verification outcome. Evidence artifacts are immutable once stored.

**Unknown Valid**: When verification is inconclusive (property-based testing reaches the iteration limit without finding a counterexample, but cannot prove universal satisfaction), the result is reported as `:partial` rather than either `:verified` or `:violated`. Uncertainty is explicitly represented.

All verification results pass through [Trinity Gate](@/glossary/trinity-gate.md): structural consistency (the contract references valid modules and functions), logical consistency (the verification logic correctly evaluates the contract), and formal necessity (critical contracts have Lean4 proof obligations).

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.WhiteContractValidator,
  verification_interval: :timer.hours(4),
  property_test_iterations: 1000,
  max_verification_timeout: :timer.minutes(10),
  proof_artifacts_dir: "priv/proofs/contracts/",
  enable_lean4_proofs: true,
  contract_types: [:behaviour, :protocol, :api],
  scan_paths: ["apps/"],
  telemetry_prefix: [:prismatic, :white_contract]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `verification_interval` | 4 hours | Time between scheduled comprehensive verifications |
| `property_test_iterations` | 1000 | Number of randomized test cases per property |
| `enable_lean4_proofs` | `true` | Whether to generate formal proofs for critical contracts |
| `contract_types` | All three | Which contract categories to verify |
| `max_verification_timeout` | 10 minutes | Maximum time for single contract verification |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full contract verification sweep | < 30 minutes | 10-20 minutes |
| Single behaviour verification | < 60 seconds | 15-40 seconds |
| API endpoint verification | < 30 seconds | 5-15 seconds |
| Property-based test suite (1000 iterations) | < 30 seconds | 8-20 seconds |
| Lean4 proof checking | < 5 minutes | 1-3 minutes |
| Evidence artifact storage | < 100 ms | 20-50 ms |
| Contract discovery scan | < 60 seconds | 15-30 seconds |

The agent parallelizes verification across contract categories and uses incremental re-verification for event-triggered scans. Property-based test generation is cached for unchanged contracts, and Lean4 proof checking is only invoked for contracts marked as critical, minimizing the computational cost of formal verification.

## Related Resources

- [White Team](@/glossary/white-team.md) -- Constructive verification team overview
- [white-verifier-commander](@/agents/white-verifier-commander.md) -- White Team strategic commander
- [white-invariant-prover](@/agents/white-invariant-prover.md) -- Formal invariant proof specialist
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation for verification artifacts
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Probabilistic contract verification methodology
- [Lean4](@/glossary/lean4.md) -- Formal theorem prover for mathematical certainty
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing verification claims
- [Color Teams](@/glossary/color-teams.md) -- Security operations team architecture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)