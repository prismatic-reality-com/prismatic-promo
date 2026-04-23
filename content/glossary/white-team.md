+++
title = "White Team"
weight = 23
[extra]
description = "Constructive verification team for formal proofs and contract validation"
category = "security"
related_terms = ["color-teams", "trinity-gate", "nabla-infinity", "sparkline", "purple-team"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1233
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["White", "Team", "Constructive", "glossary", "security", "Prismatic Platform", "White Team", "Purple Team", "The White"]
tags = ["glossary", "security", "white-team", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "White Team - Prismatic Platform"
+++

## Definition & Overview

The White Team is one of six specialized [Color Teams](@/glossary/color-teams.md) in the Prismatic Platform's epistemic security architecture. Comprising three agents operating at L3-L4 authority levels, the White Team is responsible for constructive verification---the discipline of proving that systems behave correctly through progressive verification methodology, formal mathematical proofs, contract validation, and invariant analysis. Unlike the [Red Team](@/glossary/red-team.md), which seeks to break systems through adversarial simulation, the White Team seeks to prove that systems hold.

The White Team occupies a unique position in the Color Team signal flow architecture. While Red Team generates adversarial findings and [Blue Team](@/glossary/blue-team.md) maintains defensive posture, White Team provides the constructive evidence that systems satisfy their specified properties. This evidence feeds into [Purple Team](@/glossary/purple-team.md) closure decisions, where the combination of adversarial findings (Red), defensive posture (Blue), and constructive proofs (White) determines whether a security question has been definitively answered.

All White Team output passes through the [Trinity Gate](@/glossary/trinity-gate.md) before being accepted as verified. This four-layer validation ensures that proofs are structurally consistent (valid DAG in the belief network), logically consistent (propositions follow logical rules), and formally necessary (claims proven in formal systems such as Lean4). The Trinity Gate requirement prevents the acceptance of superficially convincing but fundamentally flawed verification artifacts.

The White Team's progressive verification methodology spans six levels (L0-L5), each representing increasing rigor and confidence:

| Level | Name | Method | Confidence |
|-------|------|--------|------------|
| **L0** | Smoke Test | Basic functionality verification | 0.30 |
| **L1** | Unit Verification | Individual function contract testing | 0.50 |
| **L2** | Integration Verification | Cross-module interaction testing | 0.65 |
| **L3** | Property-Based Verification | QuickCheck/StreamData properties | 0.80 |
| **L4** | Formal Verification | Lean4 formal proofs | 0.95 |
| **L5** | Complete Verification | Full formal proof with all invariants | 0.99 |

The progression through these levels is not always linear. White Team agents assess the risk profile of each verification target and determine the appropriate starting level. Critical security properties may begin at L3 or L4, while routine functional contracts start at L0 and progress upward as needed.

## Technical Deep Dive

### Agent Composition

The White Team consists of three agents with distinct specializations and authority levels:

**white-verifier-commander (L3 Strategic Commander)** orchestrates all White Team verification campaigns. The commander receives verification requests from Purple Team, assesses target risk profiles, allocates specialist agents, and constructs composite proofs from individual verification artifacts. The commander has authority to escalate verification requirements when initial results indicate higher risk than anticipated.

**white-contract-validator (L4 Operational Specialist)** specializes in interface contract testing across three domains: behavioral contracts (function input/output specifications), protocol contracts (message-passing and state machine compliance), and API contracts (endpoint request/response schemas). Contract validation ensures that modules, services, and APIs conform to their declared interfaces under all specified conditions.

**white-invariant-prover (L4 Operational Specialist)** handles the most rigorous verification activities: property-based testing using StreamData, formal proof construction in Lean4, and fault injection analysis. This agent proves that system invariants---properties that must always hold regardless of input or state---are mathematically guaranteed. The invariant prover also performs fault injection analysis, verifying that systems maintain their invariants even under degraded conditions.

### Verification Methodology

The White Team's verification methodology is constructive rather than destructive. Where Red Team asks "Can I break this?", White Team asks "Can I prove this holds?". The distinction is fundamental: constructive verification produces positive evidence of correctness, while adversarial testing produces negative evidence of vulnerability. Both are necessary for complete security assurance.

```
Verification Request
    |
    v
[Risk Assessment] --> Determines starting verification level
    |
    v
[Contract Validation] --> Behavioral, Protocol, API contracts
    |
    v
[Property-Based Testing] --> StreamData properties, edge cases
    |
    v
[Formal Proofs] --> Lean4 mathematical proofs (if L4+ required)
    |
    v
[Composite Proof Construction] --> Combines evidence artifacts
    |
    v
[Trinity Gate Validation] --> 4-layer gate passage required
    |
    v
[Purple Team Delivery] --> Evidence feeds into closure decisions
```

### Non-Destructive Operation

A critical constraint on White Team operations is non-destructiveness. White Team agents must never modify the systems they verify. All verification activities are read-only or operate on isolated copies. This constraint ensures that verification itself cannot introduce defects or alter system behavior. The evidence artifacts produced are pure data structures---proof trees, test results, contract compliance reports---with no side effects on the target system.

## Architecture & Implementation

### Verification Engine

The White Team's verification engine implements the progressive methodology as a composable pipeline:

```elixir
defmodule PrismaticDark.WhiteTeam.VerificationEngine do
  @moduledoc """
  Progressive verification engine implementing L0-L5 methodology.
  Produces evidence artifacts without modifying target systems.
  All output passes through Trinity Gate validation.
  """

  @type verification_level :: :l0 | :l1 | :l2 | :l3 | :l4 | :l5
  @type evidence :: %{
    level: verification_level(),
    target: module(),
    method: atom(),
    result: :verified | :failed | :inconclusive,
    confidence: float(),
    proof_artifact: term(),
    timestamp: DateTime.t()
  }

  @spec verify(module(), keyword()) :: {:ok, list(evidence())} | {:error, term()}
  def verify(target_module, opts \\ []) do
    starting_level = Keyword.get(opts, :level, :l0)
    max_level = Keyword.get(opts, :max_level, :l5)

    starting_level
    |> levels_through(max_level)
    |> Enum.reduce_while({:ok, []}, fn level, {:ok, evidence_acc} ->
      case execute_verification(target_module, level) do
        {:ok, evidence} ->
          {:cont, {:ok, [evidence | evidence_acc]}}

        {:failed, evidence} ->
          {:halt, {:ok, [evidence | evidence_acc]}}

        {:error, reason} ->
          {:halt, {:error, {level, reason}}}
      end
    end)
    |> validate_through_trinity_gate()
  end

  defp execute_verification(target, :l0) do
    SmokeTest.run(target)
  end

  defp execute_verification(target, :l1) do
    ContractValidator.validate_unit_contracts(target)
  end

  defp execute_verification(target, :l2) do
    ContractValidator.validate_integration_contracts(target)
  end

  defp execute_verification(target, :l3) do
    InvariantProver.property_based_verification(target)
  end

  defp execute_verification(target, :l4) do
    InvariantProver.formal_proof(target)
  end

  defp execute_verification(target, :l5) do
    InvariantProver.complete_verification(target)
  end
end
```

### Contract Validation

The contract validator checks three categories of contracts:

```elixir
defmodule PrismaticDark.WhiteTeam.ContractValidator do
  @moduledoc """
  Validates behavioral, protocol, and API contracts
  for interface compliance verification.
  """

  @spec validate_behavioral_contract(module(), atom(), list()) ::
    {:ok, evidence()} | {:failed, evidence()}
  def validate_behavioral_contract(module, function, test_cases) do
    results =
      test_cases
      |> Enum.map(fn %{input: input, expected: expected} ->
        actual = apply(module, function, input)
        %{input: input, expected: expected, actual: actual, pass: actual == expected}
      end)

    all_passed = Enum.all?(results, & &1.pass)

    evidence = %{
      level: :l1,
      target: module,
      method: :behavioral_contract,
      result: if(all_passed, do: :verified, else: :failed),
      confidence: if(all_passed, do: 0.50, else: 0.0),
      proof_artifact: %{
        function: function,
        test_cases: length(test_cases),
        passed: Enum.count(results, & &1.pass),
        failed: Enum.count(results, &(not &1.pass)),
        details: results
      },
      timestamp: DateTime.utc_now()
    }

    if all_passed, do: {:ok, evidence}, else: {:failed, evidence}
  end

  @spec validate_protocol_contract(module(), atom()) ::
    {:ok, evidence()} | {:failed, evidence()}
  def validate_protocol_contract(module, protocol) do
    # Verifies state machine transitions follow protocol specification
    states = protocol.states()
    transitions = protocol.transitions()

    valid =
      Enum.all?(transitions, fn {from, event, to} ->
        from in states and to in states and
        module.handle_transition(from, event) == {:ok, to}
      end)

    evidence = %{
      level: :l2,
      target: module,
      method: :protocol_contract,
      result: if(valid, do: :verified, else: :failed),
      confidence: if(valid, do: 0.65, else: 0.0),
      proof_artifact: %{protocol: protocol, states: states, transitions: length(transitions)},
      timestamp: DateTime.utc_now()
    }

    if valid, do: {:ok, evidence}, else: {:failed, evidence}
  end
end
```

### Invariant Proving

The invariant prover handles property-based testing and formal verification:

```elixir
defmodule PrismaticDark.WhiteTeam.InvariantProver do
  @moduledoc """
  Property-based testing and formal proof construction.
  Uses StreamData for property testing and Lean4 integration
  for mathematical proofs.
  """

  use ExUnitProperties

  @spec property_based_verification(module()) ::
    {:ok, evidence()} | {:failed, evidence()}
  def property_based_verification(module) do
    properties = module.__properties__()

    results =
      Enum.map(properties, fn {name, generator, property_fn} ->
        case check_property(generator, property_fn) do
          :ok -> {:passed, name}
          {:error, counterexample} -> {:failed, name, counterexample}
        end
      end)

    all_passed = Enum.all?(results, &match?({:passed, _}, &1))

    evidence = %{
      level: :l3,
      target: module,
      method: :property_based_testing,
      result: if(all_passed, do: :verified, else: :failed),
      confidence: if(all_passed, do: 0.80, else: 0.0),
      proof_artifact: %{
        properties_tested: length(properties),
        passed: Enum.count(results, &match?({:passed, _}, &1)),
        failed: Enum.count(results, &match?({:failed, _, _}, &1))
      },
      timestamp: DateTime.utc_now()
    }

    if all_passed, do: {:ok, evidence}, else: {:failed, evidence}
  end
end
```

## Usage in Prismatic Platform

### Signal Flow Position

In the Color Team signal flow architecture, the White Team occupies the constructive verification position:

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis) --> Blue (defense)
                                    ^                          |       ^           |
                                    |                          v       |           v
                               Black (threat models)     White (proofs)    Platform Defense
```

White Team proofs flow into Purple Team, where they are combined with Red Team findings and Blue Team defensive posture to make closure decisions. A security question can only be "closed" when White Team has provided constructive verification that the relevant properties hold, Red Team has exhausted its adversarial scenarios, and Blue Team has confirmed defensive readiness.

### SPARKLINE Contract Verification

White Team plays a critical role in verifying [SPARKLINE](@/glossary/sparkline.md) contracts. The contract validator ensures that all interface contracts between platform modules are satisfied, preventing integration failures and behavioral regressions. Contract verification is mandatory before SPARKLINE canonicalization.

### Trinity Gate Integration

All White Team output must pass the [Trinity Gate](@/glossary/trinity-gate.md) before acceptance. This four-layer gate validates structural consistency, logical consistency, formal necessity, and consciousness alignment. The Trinity Gate requirement ensures that White Team proofs are not merely syntactically correct but semantically meaningful.

## Best Practices

1. **Start at the appropriate level**: Not every verification target needs L5 formal proofs. Match the verification level to the risk profile. Security-critical invariants warrant L4-L5; routine functional contracts are adequately served by L1-L2.

2. **Maintain non-destructiveness absolutely**: White Team agents must never modify target systems. Even read operations should be minimized to avoid observation effects on concurrent systems.

3. **Produce composable evidence**: Structure evidence artifacts so they can be combined into composite proofs. Isolated verification results are less valuable than interconnected proof networks.

4. **Document verification assumptions**: Every proof rests on assumptions. Document what conditions must hold for the proof to be valid, so that changes to those conditions trigger re-verification.

5. **Integrate with Purple Team continuously**: White Team proofs are most valuable when they arrive at Purple Team in real time, enabling progressive closure decisions rather than batch review.

6. **Use property-based testing as the bridge**: L3 property-based testing bridges the gap between conventional testing (L0-L2) and formal verification (L4-L5). It provides high confidence at lower cost than full formal proofs.

## Common Pitfalls

- **Over-reliance on L0-L1 verification**: Smoke tests and unit contract tests provide limited confidence. Critical systems require L3+ verification to achieve confidence thresholds for [NM/ND doctrine](@/glossary/nm-nd.md) compliance.

- **Treating verification as one-time**: Systems evolve continuously. Proofs constructed against version N may not hold for version N+1. Verification must be re-executed when target systems change.

- **Conflating testing with proving**: Tests demonstrate behavior for specific inputs. Proofs demonstrate behavior for all possible inputs within the specified domain. White Team's value lies in progressing from testing (L0-L2) to proving (L3-L5).

- **Ignoring formal proof maintenance**: Lean4 proofs require maintenance when type signatures, module interfaces, or system invariants change. Unmaintained proofs become stale and provide false confidence.

- **Isolated verification without context**: Verifying individual modules in isolation misses integration failures. L2 integration verification is essential for catching cross-module contract violations.

## Related Concepts

- [Color Teams](@/glossary/color-teams.md) - Full overview of all six color team operations
- [Trinity Gate](@/glossary/trinity-gate.md) - Four-layer verification gate validating all White Team output
- [Purple Team](@/glossary/purple-team.md) - Consumes White Team proofs for closure decisions
- [Red Team](@/glossary/red-team.md) - Adversarial counterpart to White Team's constructive approach
- [Blue Team](@/glossary/blue-team.md) - Defensive posture team complementing White Team verification
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic axioms governing verification standards
- [SPARKLINE](@/glossary/sparkline.md) - Contract system verified by White Team
- [NM/ND Doctrine](@/glossary/nm-nd.md) - Doctrine requiring evidence-based verification
- [Quality Gates](@/glossary/quality-gates.md) - Platform quality enforcement consuming White Team evidence

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Agents](@/agents/_index.md) - Agent registry including White Team agents
- [Apps](@/apps/_index.md) - Application ecosystem verified by White Team

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)