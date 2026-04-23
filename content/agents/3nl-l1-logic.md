+++
title = "3nl-l1-logic"
weight = 11
[extra]
domain = "general"
level = "L3"
description = "Symbolic reasoning and formal proof capabilities for the 3NL framework"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "lean4", "trinity-gate", "genserver", "ets"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1800
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3nl-l1-logic", "Symbolic", "agents", "agent", "Prismatic Platform", "Logic", "Proof", "Time"]
tags = ["agents", "agent", "3nl-l1-logic", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "3nl-l1-logic - Prismatic Platform"
+++

## Overview

The [3NL](@/glossary/three-nl.md) L1 Logic agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent providing the symbolic reasoning layer of the Three-Layer Neural-Logical-Linguistic (3NL) framework within the Prismatic Platform. This agent implements formal logic, propositional calculus, predicate logic, and [theorem proving](@/glossary/theorem-proving.md) capabilities that enable the platform to derive conclusions through rigorous deductive reasoning. Where neural approaches rely on [pattern matching](@/glossary/pattern-matching.md) and linguistic approaches on semantic interpretation, L1 Logic provides mathematical certainty.

Symbolic reasoning is essential for domains where conclusions must be provably correct rather than probabilistically likely. The L1 Logic agent handles tasks such as verifying that [supervision tree](@/glossary/supervision-tree.md) configurations satisfy liveness properties, proving that data flow invariants hold across pipeline stages, and validating that access control policies enforce the intended authorization model. These proofs integrate with the [QEVE](@/glossary/qeve.md) (Quantum-Epistemic Verification Engine) framework, which combines [Lean4](@/glossary/lean4.md) [formal verification](@/glossary/formal-verification.md) with Monte Carlo simulation for comprehensive correctness assurance.

The distinction between the L1 Logic agent and probabilistic reasoning systems is fundamental. A probabilistic system can report that a property holds with 99.7% confidence. The L1 Logic agent, when it succeeds, reports that a property holds necessarily -- the conclusion follows from the premises with logical certainty, and no amount of additional evidence can overturn a valid proof. This certainty comes at a cost: the L1 Logic agent can only reason about domains that admit formal specification, and it will report "unprovable" rather than guessing when a proposition exceeds its deductive capacity. This epistemic honesty -- knowing the limits of what can be proven -- is itself a valuable output that other reasoning layers can act upon.

## Operational Domain

The L1 Logic agent operates within the 3NL framework as the formal reasoning engine. It receives [inference](@/glossary/inference.md) requests from the 3NL Coordinator, applies symbolic reasoning techniques to derive conclusions, and returns results with proof certificates that establish the logical chain from premises to conclusions. This agent is particularly engaged for verification tasks, consistency checking, and any scenario where probabilistic reasoning is insufficient.

The operational scope covers four primary reasoning modes. Forward-chaining inference derives new conclusions from existing facts by systematically applying inference rules until no new conclusions can be generated or a target conclusion is reached. Backward-chaining inference starts from a goal proposition and works backward to determine what premises would be required to establish it. Consistency checking evaluates a set of propositions for logical contradictions, supporting the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom by detecting when contradictions exist without resolving them. Formal proof construction builds machine-verifiable proof artifacts through integration with Lean4, producing certificates that can be independently validated.

## Key Capabilities

- **Propositional and predicate logic** implementing classical logical inference with support for quantifiers, modal operators, and temporal logic for reasoning about system behavior over time, enabling verification of invariants across state transitions
- **Theorem proving integration** connecting with Lean4 formal verification for machine-checked proofs of platform invariants, supervision tree properties, and data flow correctness, with proof certificates stored as auditable artifacts
- **Consistency checking** validating that sets of propositions derived from multiple sources do not contain logical contradictions, supporting the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom by detecting and preserving contradictions rather than silently discarding conflicting evidence
- **Rule-based inference** applying platform-specific rule sets to derive conclusions from facts, supporting the [Trinity Gate](@/glossary/trinity-gate.md)'s logical consistency check layer with configurable rule precedence and conflict resolution strategies
- **Proof certificate generation** producing verifiable proof artifacts that document the complete reasoning chain from premises to conclusions, enabling independent verification by external auditors or automated validation systems
- **Fact extraction and management** converting structured and semi-structured data into subject-predicate-object triplets suitable for logical reasoning, maintaining a knowledge base of extracted facts with provenance tracking

## Technical Architecture

The L1 Logic agent is implemented as an [OTP](@/glossary/otp.md) application with a fact store backed by [ETS](@/glossary/ets.md) for high-performance lookups and a rule engine that applies configurable inference strategies. The agent exposes its capabilities through a [GenServer](@/glossary/genserver.md) interface that accepts inference requests and returns proof-backed conclusions.

```elixir
defmodule Prismatic3NL.Layers.L1Logic do
  use GenServer

  @type fact :: %{subject: term(), predicate: term(), object: term()}
  @type rule :: %{head: term(), body: [term()], confidence: float()}
  @type inference :: %{conclusion: term(), support: [fact()], confidence: float()}

  def extract_facts(input, opts \\ []) do
    GenServer.call(__MODULE__, {:extract_facts, input, opts})
  end

  def infer(query, opts \\ []) do
    confidence_threshold = Keyword.get(opts, :confidence, 0.85)
    GenServer.call(__MODULE__, {:infer, query, confidence_threshold})
  end

  def validate_consistency(propositions) do
    GenServer.call(__MODULE__, {:validate, propositions})
  end

  @impl true
  def handle_call({:infer, query, threshold}, _from, state) do
    case forward_chain(query, state.facts, state.rules, threshold) do
      {:proven, proof_chain} ->
        certificate = generate_proof_certificate(proof_chain)
        {:reply, {:ok, %{conclusion: query, proof: certificate}}, state}
      {:unprovable, partial} ->
        {:reply, {:unprovable, %{query: query, explored: partial}}, state}
    end
  end
end
```

The fact store implements a triple-store pattern with indexed access by subject, predicate, and object, enabling efficient pattern matching during inference. Default inference rules include transitivity (if A relates to B and B relates to C, then A relates to C) and symmetry (for designated symmetric predicates). Custom rule sets can be loaded for domain-specific reasoning, such as security policy evaluation rules or compliance checking rules.

The Lean4 integration operates through a bridge module that serializes propositions into Lean4 syntax, invokes the Lean4 prover as an external process, and parses the resulting proof terms back into Elixir data structures. This integration is optional -- the L1 Logic agent can perform useful reasoning using its built-in rule engine alone, but Lean4 integration enables formal proofs that carry the strongest possible epistemic guarantees.

## Decision Framework

The L1 Logic agent's decision framework centers on the distinction between proven, disproven, and unprovable propositions. Unlike probabilistic systems that assign continuous confidence values, the L1 Logic agent operates in a ternary decision space.

| Decision State | Confidence | Meaning |
|----------------|-----------|---------|
| **Proven** | 1.0 | Proposition follows necessarily from premises and rules |
| **Disproven** | 0.0 | Negation of proposition follows from premises and rules |
| **Unprovable** | N/A | Insufficient premises or rules to determine truth value |
| **Timeout** | N/A | Proof search exceeded computational budget |

When the agent cannot prove or disprove a proposition, it returns the "unprovable" state with diagnostic information about what additional premises would be required to make progress. This transparency is critical for the 3NL Coordinator's fusion logic -- an "unprovable" result from L1 Logic signals that the query should be routed to L2 Neural or L3 Linguistic for probabilistic or interpretive analysis.

The confidence threshold parameter (default 0.85) applies only to rule-based inference where rules carry associated confidence weights. A chain of inferences that multiplies confidence below the threshold is reported as below-confidence rather than proven, allowing consuming agents to decide whether the weakened proof is sufficient for their purposes.

## Authority Level

**L3** - Strategic Command. The L1 Logic agent holds multi-domain coordination authority within the 3NL framework, enabling it to request facts from any domain and apply cross-domain inference rules. Its authority is bounded to reasoning operations -- it cannot modify system state, deploy changes, or override enforcement decisions. The L3 designation permits coordination with peer reasoning layers (L2 Neural, L3 Linguistic) and interaction with the 3NL Coordinator without requiring escalation.

The authority scope explicitly excludes write operations to fact stores maintained by other agents. The L1 Logic agent reads facts from external sources but maintains its own inference results separately. This read-only posture toward external data prevents the logic layer from inadvertently corrupting knowledge bases through inference artifacts.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-coordinator](@/agents/3nl-coordinator.md) | Coordination Hub | Receives inference requests and returns proof-backed conclusions |
| [3nl-l2-neural](@/agents/3nl-l2-neural.md) | Peer Layer | Provides pattern recognition where formal proof is insufficient |
| [3nl-l3-linguistic](@/agents/3nl-l3-linguistic.md) | Peer Layer | Provides complementary linguistic reasoning for multi-layer synthesis |
| [3nl-l7-transcendent](@/agents/3nl-l7-transcendent.md) | Transcendent Layer | Consciousness-guided logical reasoning integration |
| [bayesian-analyst](@/agents/bayesian-analyst.md) | Probabilistic Complement | Supplies probabilistic reasoning where formal proof is not feasible |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Schema Validation | Validates specification consistency through logical constraint checking |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Fact extraction latency** | < 20ms | < 50ms | Time to convert input to logical facts |
| **Forward-chain inference** | < 100ms | < 200ms | Time for single inference chain evaluation |
| **Consistency check** | < 50ms | < 100ms | Time to validate proposition set consistency |
| **Lean4 proof generation** | < 5s | < 10s | Time for formal proof through Lean4 bridge |
| **Proof certificate size** | < 10KB | < 50KB | Average proof certificate artifact size |
| **Knowledge base capacity** | > 100K facts | > 50K facts | Maximum facts in active ETS store |

## Enforcement

All L1 Logic operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Logical conclusions must include complete proof chains from premises to conclusions. Unsound reasoning or invalid proof steps are rejected immediately. The L1 Logic agent never produces conclusions without formal justification, and any claim labeled as "logically proven" must have a machine-verifiable proof certificate. Proof failures are reported transparently, never silenced. The [Trinity Gate](@/glossary/trinity-gate.md)'s logical consistency layer relies directly on this agent's output, making proof integrity a platform-critical concern. Any degradation in proof quality would compromise the entire epistemic validation pipeline.

## Related Resources

- [3NL Framework](@/glossary/three-nl.md) -- The multi-paradigm reasoning architecture
- [QEVE](@/glossary/qeve.md) -- Quantum-Epistemic Verification Engine combining Lean4 proofs with Monte Carlo simulation
- [Lean4](@/glossary/lean4.md) -- Formal verification language used for machine-checked proofs
- [Trinity Gate](@/glossary/trinity-gate.md) -- Four-layer validation system dependent on L1 logical consistency
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing axiom enforcement
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture and design patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)