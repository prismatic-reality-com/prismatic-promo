+++
title = "White Team"
weight = 5
[extra]
color = "white"
agent_count = 3
commander = "white-verifier-commander"
role = "Constructive Verification"
description = "Constructive verification, formal proofs, Lean4 validation"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1278
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["White", "Team", "Constructive", "Lean4", "teams", "Prismatic Platform", "Trinity Gate", "White Team", "Purple", "FULL"]
tags = ["teams", "white-team", "prismatic"]
quality_score = 80
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "White Team - Prismatic Platform"
+++

## Overview

The White Team provides the formal verification and constructive proof capability within the Prismatic Platform's six-team color-team security architecture. While [Red Team](/teams/red/) finds vulnerabilities through adversarial simulation and [Blue Team](/teams/blue/) builds defenses through monitoring and detection, White Team proves that systems hold through progressive formal methods — from property-based testing through contract validation to full Lean4 theorem proving. White provides mathematical certainty where simulation and observation alone cannot.

The theoretical foundation of White Team operations draws from formal methods in software engineering, type theory, constructive logic, and the Curry-Howard correspondence that links proofs and programs. The Prismatic Platform implements a six-level verification hierarchy (L0-L5) that allows verification effort to be calibrated to the criticality of the system under examination. Low-criticality modules receive L0-L1 verification (unit and property tests), while safety-critical paths receive L4-L5 verification (theorem proving and full formalization).

White Team's role within the color-team architecture is uniquely constructive — while other teams find problems (Red), detect changes (Blue), explore boundaries (Gray), model threats (Black), and synthesize findings (Purple), White Team proves that solutions work. White verification evidence feeds into [Purple Team](/teams/purple/) closure decisions, providing the formal proof that a defense implementation actually satisfies its security properties. This constructive role makes White Team essential for the platform's [Trinity Gate](/glossary/trinity-gate/) — the three-layer verification gate that every belief must pass.

## Mission and Doctrine

The White Team mission is to provide progressive formal verification of platform systems, producing mathematical evidence that implementations satisfy their specifications. This evidence supports Purple Team closure decisions, Trinity Gate passage, and long-term platform reliability.

### Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Progressive Verification** | Match verification depth to system criticality | L0-L5 hierarchy |
| **Constructive Evidence** | Produce proofs, not just absence of counterexamples | Proof artifact requirement |
| **Target Independence** | Never modify verification targets | Read-only analysis |
| **Trinity Gate Support** | Provide formal necessity evidence for gate passage | Mandatory for critical claims |
| **Reproducibility** | All proofs reproducible from specification to conclusion | Proof artifact storage |

The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine governs White operations with emphasis on NO DOUBTS: every verification claim must be backed by reproducible proof artifacts, and no system is declared "verified" without evidence at the appropriate level. NO MERCY manifests in the insistence on genuine verification — proofs that actually prove the property in question, not superficially similar properties that are easier to verify.

## Team Composition

The White Team comprises three agents organized around the verification lifecycle: campaign orchestration, contract validation, and invariant proving.

| Agent | Level | Role | Primary Function | Specialization |
|-------|-------|------|------------------|----------------|
| **white-verifier-commander** | L3 | Strategic Commander | Verification campaign orchestration, composite proof construction | Campaign planning, L0-L5 assignment |
| **white-contract-validator** | L4 | Operational Specialist | Interface contract testing, behavior/protocol/API validation | Contract types (behavior, protocol, API) |
| **white-invariant-prover** | L4 | Operational Specialist | Property-based testing, formal Lean4 proofs, fault injection | Deep verification (L3-L5) |

### white-verifier-commander

The Verifier Commander orchestrates verification campaigns, assigning verification levels to target systems based on criticality assessment, available specifications, and resource constraints. The commander also constructs composite proofs — combining evidence from multiple verification methods into unified proof packages that satisfy Trinity Gate requirements. Campaign planning considers the priority signals from Purple Team about which findings require formal verification for closure.

### white-contract-validator

The Contract Validator specializes in three contract types: behavior contracts (function input/output relationships verified against `@spec` annotations), protocol contracts (Elixir protocol compliance verification), and API contracts ([OpenAPI](/glossary/openapi/) specification validation for external interfaces). This agent produces test suites that continuously verify contract compliance, serving as the L1-L2 verification layer.

### white-invariant-prover

The Invariant Prover conducts the deepest verification work — property-based testing with StreamData, model checking, and formal theorem proving with [Lean4](/glossary/lean4/). This agent handles L3-L5 verification, producing mathematical proofs of system invariants. The prover also conducts fault injection analysis, verifying that systems maintain their properties under controlled failure conditions.

## Verification Hierarchy

### Progressive Methodology (L0-L5)

| Level | Method | Confidence | Tooling | Typical Targets |
|-------|--------|------------|---------|-----------------|
| **L0** | Unit Testing | 0.60 | [ExUnit](/glossary/exunit/) | All modules |
| **L1** | Property Testing | 0.75 | StreamData, PropCheck | Public APIs, data transformations |
| **L2** | Contract Testing | 0.85 | TypeCheck, custom validators | Module interfaces, protocol impls |
| **L3** | Model Checking | 0.90 | TLA+ specifications | State machines, concurrency |
| **L4** | Theorem Proving | 0.95 | Lean4 | Core algorithms, security properties |
| **L5** | Full Formalization | 0.99 | Lean4 + Coq | Trinity Gate, NABLA axioms |

### Verification Pipeline

```
Specification Extraction
        ↓
Property Identification
        ↓
Level Assignment (L0-L5 based on criticality)
        ↓
Test/Proof Generation
        ↓
Execution & Verification
        ↓
Evidence Artifact Production
        ↓
Purple Team / Trinity Gate Submission
```

### Level Assignment Criteria

| Criticality | Verification Level | Example Systems |
|-------------|-------------------|-----------------|
| **Critical** (failure = security breach) | L4-L5 | Authentication, access control, Trinity Gate |
| **High** (failure = data corruption) | L3-L4 | Storage adapters, data transformers |
| **Medium** (failure = degraded service) | L2-L3 | API endpoints, state machines |
| **Low** (failure = cosmetic/minor) | L0-L1 | UI helpers, formatters |

## Contract Validation

### Three Contract Types

| Type | Scope | Verification Method | Tooling |
|------|-------|-------------------|---------|
| **Behavior Contract** | Function I/O relationships | @spec enforcement, property testing | ExUnit, StreamData |
| **Protocol Contract** | Elixir protocol adherence | Protocol compliance testing | TypeCheck, custom validators |
| **API Contract** | External interface compliance | OpenAPI specification validation | OpenApiSpex |

### Contract Testing Implementation

```elixir
defmodule PrismaticDark.WhiteTeam.ContractValidator do
  @moduledoc """
  Three-type contract validation for behavior, protocol, and API contracts.
  Produces continuous verification evidence for Purple Team closure support.
  """

  @type contract_type :: :behavior | :protocol | :api
  @type verification_result :: %{
    contract_type: contract_type(),
    target: module(),
    properties_verified: non_neg_integer(),
    properties_failed: non_neg_integer(),
    confidence: float(),
    evidence: [map()]
  }

  @spec validate_behavior_contract(module(), atom(), non_neg_integer()) :: verification_result()
  def validate_behavior_contract(module, function, arity) do
    spec = fetch_spec(module, function, arity)
    properties = extract_properties_from_spec(spec)

    results =
      properties
      |> Enum.map(&verify_property(module, function, &1))

    %{
      contract_type: :behavior,
      target: module,
      properties_verified: Enum.count(results, &(&1.status == :verified)),
      properties_failed: Enum.count(results, &(&1.status == :failed)),
      confidence: calculate_confidence(results),
      evidence: results
    }
  end

  @spec validate_protocol_contract(module(), module()) :: verification_result()
  def validate_protocol_contract(protocol, implementation) do
    required_functions = protocol.__protocol__(:functions)

    results =
      required_functions
      |> Enum.map(fn {name, arity} ->
        verify_protocol_function(implementation, name, arity)
      end)

    %{
      contract_type: :protocol,
      target: implementation,
      properties_verified: Enum.count(results, &(&1.status == :verified)),
      properties_failed: Enum.count(results, &(&1.status == :failed)),
      confidence: calculate_confidence(results),
      evidence: results
    }
  end
end
```

## Invariant Proving

### Property-Based Testing

```elixir
defmodule PrismaticDark.WhiteTeam.InvariantProver do
  @moduledoc """
  Property-based testing and formal proof generation.
  Handles L1-L5 verification with progressive methodology.
  """
  use ExUnit.Case
  use ExUnitProperties

  property "NABLA signal plurality: minimum 2 independent signals for belief" do
    check all signals <- list_of(signal_generator(), min_length: 1, max_length: 20) do
      belief = PrismaticNabla.form_belief(signals)

      case belief do
        {:ok, %{confidence: c}} when c > 0.5 ->
          independent_sources = signals |> Enum.map(& &1.source) |> Enum.uniq()
          assert length(independent_sources) >= 2

        {:error, :insufficient_plurality} ->
          independent_sources = signals |> Enum.map(& &1.source) |> Enum.uniq()
          assert length(independent_sources) < 2

        _ ->
          :ok
      end
    end
  end

  property "account balance invariant: balance >= 0 after any operation sequence" do
    check all operations <- list_of(operation_generator()) do
      account = Account.new()
      final = Enum.reduce(operations, account, &apply_operation/2)
      assert final.balance >= 0
    end
  end
end
```

### Lean4 Formal Proofs

```lean
-- Proof that Trinity Gate is sound: if all three gates pass, the belief is valid
theorem trinity_gate_sound (belief : Belief) :
  trinity_passes belief →
  structural_consistent belief ∧
  logical_consistent belief ∧
  formally_necessary belief := by
  intro h
  constructor
  · exact h.structural
  constructor
  · exact h.logical
  · exact h.formal

-- Proof that NABLA signal plurality prevents single-source beliefs
theorem nabla_plurality_prevents_single_source :
  ∀ (signals : List Signal),
    (signals.length ≥ 2 ∧ sources_independent signals) →
    ¬ (single_source_dominant signals) := by
  intro signals ⟨h_len, h_indep⟩
  intro h_single
  have : sources_independent signals := h_indep
  exact absurd h_single (independent_not_single h_len this)
```

## Fault Injection Analysis

White Team validates system resilience through controlled fault injection, verifying that systems maintain their verified properties under failure conditions.

| Fault Type | Injection Method | Expected Behavior | Verification Level |
|------------|-----------------|-------------------|-------------------|
| **Network partition** | Simulate disconnect | Graceful degradation, no data loss | L2-L3 |
| **Data corruption** | Inject invalid data | Validation rejection, error propagation | L2 |
| **Resource exhaustion** | Memory/CPU limits | Back-pressure, no crash | L1-L2 |
| **Timing failures** | Delay/timeout injection | Retry with backoff, timeout handling | L1-L2 |
| **Process crashes** | Kill supervised processes | Supervisor restart, state recovery | L2-L3 |
| **Concurrent access** | Race condition simulation | Proper serialization, no data races | L3-L4 |

## Technical Architecture

### System Architecture

```
White Verifier Commander (L3)
├── Campaign Planner
│   ├── Criticality Assessor (assigns L0-L5)
│   ├── Specification Extractor
│   └── Resource Scheduler
├── Contract Validator (L4)
│   ├── Behavior Contract Engine
│   ├── Protocol Contract Engine
│   ├── API Contract Engine
│   └── Evidence Collector
├── Invariant Prover (L4)
│   ├── Property Test Generator (StreamData)
│   ├── Model Checker (TLA+)
│   ├── Theorem Prover (Lean4)
│   └── Fault Injector
└── Evidence Pipeline
    ├── Proof Artifact Storage
    ├── Confidence Calculator
    ├── Trinity Gate Submitter
    └── Purple Team Evidence Emitter
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :white_team, :verification, :start]` | target_count | campaign_id, level |
| `[:prismatic, :white_team, :verification, :complete]` | duration, properties_verified | campaign_id, confidence |
| `[:prismatic, :white_team, :contract, :verified]` | properties_count | module, contract_type |
| `[:prismatic, :white_team, :contract, :failed]` | failure_count | module, contract_type |
| `[:prismatic, :white_team, :proof, :complete]` | proof_size, duration | theorem_name, level |
| `[:prismatic, :white_team, :fault_injection, :complete]` | faults_injected, failures | target, fault_types |
| `[:prismatic, :white_team, :trinity_gate, :submitted]` | confidence | belief_id |

## NABLA Compliance

White Team provides the formal verification layer that supports NABLA axiom enforcement across the platform.

| Axiom | White Team Application | Compliance Level |
|-------|----------------------|-----------------|
| Signal Plurality | Verifies plurality enforcement code with property tests | FULL — verifies enforcement |
| Contradiction Preservation | Proves contradiction preservation invariants | FULL — formal proofs |
| Absence Informative | Verifies absence detection implementations | FULL — contract testing |
| Time Decay | Verifies decay calculations are mathematically correct | FULL — property testing |
| Unknown Valid | Proves that unknown states are properly handled | FULL — model checking |
| Source Independence | Verifies independence weighting algorithms | FULL — property testing |
| Provenance Mandatory | Verifies provenance chain integrity | FULL — contract testing |

### Trinity Gate Support

White Team provides the **Formal Necessity** component of the [Trinity Gate](/glossary/trinity-gate/):

| Gate | Provider | Method |
|------|----------|--------|
| Structural Consistency | Graph analysis | Automated DAG validation |
| Logical Consistency | Rule engine | Propositional logic checking |
| **Formal Necessity** | **White Team** | Lean4 theorem proving, property testing |

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| L0-L1 verification time | < 30 seconds | Per module |
| L2 contract verification | 1-5 minutes | Per module interface |
| L3 model checking | 5-30 minutes | Per state machine |
| L4 theorem proving | 10-60 minutes | Per critical property |
| L5 full formalization | 1-8 hours | Per security domain |
| Property test generation | 100-1000 cases/second | StreamData throughput |
| Contract coverage | > 90% | Of public module interfaces |
| Proof artifact size | 5-50 KB | Per verified property |
| False verification rate | < 0.1% | Proofs that don't actually prove |

## Integration Points

| Component | Direction | Content | Purpose |
|-----------|-----------|---------|---------|
| [Purple Team](/teams/purple/) | White → Purple | Verification evidence, proof artifacts | Closure support |
| [Trinity Gate](/glossary/trinity-gate/) | White → Trinity | Formal necessity proofs | Gate passage evidence |
| [Red Team](/teams/red/) | Red → White | Findings requiring formal verification | Proof targets |
| [Blue Team](/teams/blue/) | Blue → White | Defense implementations for verification | Verification targets |
| [Gray Team](/teams/gray/) | Gray → White | Edge cases for formal analysis | Property test seeds |
| [Quality Gates](/capabilities/quality-gates/) | White → Quality | Verification status | Quality integration |

### Signal Flow

```
Red Findings ──→ Proof Targets ──→ White Team ──→ Proof Artifacts
                                       ↑                ↓
Blue Defenses ──→ Verification ────────┘          Purple Team
                    Targets                       (closure evidence)
                                                       ↓
Gray Edge Cases ──→ Property ──────────────────→ Trinity Gate
                    Test Seeds                   (formal necessity)
```

## Outputs

| Artifact | Purpose | Confidence Level | Consumers |
|----------|---------|-----------------|-----------|
| Proof Certificate | Formal verification evidence | 0.95+ | Purple, Trinity Gate |
| Contract Test Suite | Interface validation (continuous) | 0.85+ | Purple, Quality Gates |
| Invariant Catalog | System properties database | Reference | All Teams, Architecture |
| Fault Analysis Report | Resilience assessment under failure | Reference | Purple, Blue |
| Property Test Report | StreamData verification results | 0.75+ | Purple, Quality Gates |
| Lean4 Proof Archive | Formal theorem proof files | 0.95-0.99 | Purple, Trinity Gate, Archive |

## Related Resources

- [Purple Team](/teams/purple/) — Primary consumer of White verification evidence for closure
- [Red Team](/teams/red/) — Produces findings that require formal verification
- [Blue Team](/teams/blue/) — Produces defenses that White formally verifies
- [Gray Team](/teams/gray/) — Edge case discoveries that seed property-based tests
- [Black Team](/teams/black/) — Theoretical models verified against formal specifications
- [Trinity Gate](/capabilities/trinity-gate/) — Three-layer verification gate supported by White proofs
- [Quality Gates](/capabilities/quality-gates/) — Quality enforcement incorporating verification status

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)