+++
title = "Formal Verification"
weight = 201

[extra]
category = "epistemic"
description = "Mathematical proof-based verification of system properties using Lean4 theorem proving within the QEVE framework."
related_terms = ["qeve", "lean4", "trinity-gate", "property-based-testing", "white-team", "nabla-infinity", "modal-logic", "monte-carlo-verification", "belief-graph", "epistemic-robustness"]
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
word_count = 2489
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Formal", "Verification", "Mathematical", "Lean4", "QEVE", "glossary", "epistemic", "Prismatic Platform", "Stage", "Monte Carlo"]
tags = ["glossary", "epistemic", "formal-verification", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Formal Verification - Prismatic Platform"
+++

## Definition

Formal verification is the application of mathematical proof techniques to establish that a system, conclusion, or property holds universally -- not merely for tested cases, but for all possible inputs, states, and scenarios. Within the Prismatic Platform, formal verification operates through the [QEVE](/glossary/qeve/) pipeline's Stage 4, where critical claims extracted from the [belief graph](/glossary/belief-graph/) are translated into [Lean4](/glossary/lean4/) theorem statements and subjected to machine-checked proof. A formally verified conclusion is not "probably true" or "true in all tested cases" but "necessarily true given the stated axioms," providing the strongest possible epistemic guarantee.

The distinction between formal verification and other validation methods is categorical, not gradational. Testing checks specific cases. [Property-based testing](/glossary/property-based-testing/) checks random cases drawn from a distribution. [Monte Carlo verification](/glossary/monte-carlo-verification/) checks robustness under perturbation. Formal verification proves universality. When a Lean4 proof succeeds, the conclusion holds in every possible scenario consistent with the axioms -- not 99.99% of scenarios, but 100%. This is why formal verification occupies the penultimate stage of the [QEVE](/glossary/qeve/) pipeline: it provides the mathematical certainty that other methods cannot.

## Historical Foundations

### Origins in Program Correctness

The intellectual foundations of formal verification trace to the 1960s and three seminal contributions. Edsger Dijkstra's 1968 paper "Go To Statement Considered Harmful" initiated the structured programming movement and established the principle that program structure should be amenable to mathematical reasoning. Robert Floyd's 1967 paper on assigning meanings to programs introduced verification conditions -- logical predicates that, if proven true, guarantee program correctness. C.A.R. Hoare's 1969 paper "An Axiomatic Basis for Computer Programming" formalized these ideas into Hoare logic, providing a rigorous framework for reasoning about program behavior through preconditions, postconditions, and invariants.

Hoare logic introduced the triple notation {P} C {Q}, read as: "If precondition P holds before executing command C, then postcondition Q holds after execution." This simple formalism enabled the first machine-checked proofs of program correctness and remains foundational in formal methods.

### From Programs to Properties

The 1970s and 1980s saw formal verification expand beyond individual program statements to system-level properties. Temporal logic (Pnueli, 1977) enabled reasoning about properties that must hold over time: "the system never enters a deadlock state" (safety), "every request eventually receives a response" (liveness). Model checking (Clarke and Emerson, 1981; Queille and Sifakis, 1982) automated the verification of temporal properties by exhaustively exploring all reachable states of a finite-state system.

The Prismatic Platform inherits both traditions. Hoare-style reasoning informs the verification of individual pipeline stages, while temporal reasoning informs the verification of system-level properties like "no belief is accepted without Trinity Gate passage" and "all evidence undergoes time decay."

### The Lean4 Revolution

[Lean4](/glossary/lean4/), developed at Microsoft Research by Leonardo de Moura, represents the current state of the art in interactive theorem proving. Unlike earlier proof assistants (Coq, Isabelle, Agda), Lean4 is simultaneously a general-purpose programming language and a proof assistant. Programs written in Lean4 carry their correctness proofs as part of their type signatures, blurring the boundary between "writing code" and "proving properties."

Lean4's dependent type system allows types to depend on values. A function declared as `def sort (l : List Nat) : {l' : List Nat // Sorted l' /\ Permutation l l'}` does not merely return a list -- its type signature proves that the output is sorted and contains the same elements as the input. The Lean4 type checker is itself a proof checker: if the code compiles, the proof is valid.

## Theorem Proving vs. Model Checking

Formal verification encompasses two major paradigms with distinct strengths, limitations, and applicability.

### Theorem Proving

Theorem proving constructs a mathematical proof that a property holds universally. The proof is a chain of logical deductions from axioms to the desired conclusion, verified step by step by a proof checker. Theorem proving can handle infinite state spaces and parameterized systems because it reasons symbolically rather than enumerating states.

**Strengths**:
- Handles infinite state spaces (unbounded data structures, parameterized systems)
- Proofs are compositional -- a proof about a component transfers to systems containing that component
- Machine-checked proofs provide absolute certainty within the axiom system
- Proofs serve as documentation of *why* a property holds, not just *that* it holds

**Limitations**:
- Requires human guidance for complex proofs (automation covers only decidable fragments)
- Proof development is time-consuming and requires specialized expertise
- The axiom system itself must be trusted (a proof is only as sound as its axioms)
- Undecidable problems exist where no proof can be constructed

### Model Checking

Model checking exhaustively explores all reachable states of a system to verify that a property holds in every state. It is fully automated but limited to finite-state systems or systems that can be abstracted to finite state spaces.

**Strengths**:
- Fully automated -- no human guidance required
- Produces counterexamples when properties are violated
- Exhaustive within the explored state space

**Limitations**:
- State explosion problem -- state space grows exponentially with system complexity
- Cannot handle infinite state spaces without abstraction
- Abstraction may introduce false positives or false negatives
- Provides no explanation of why a property holds, only that it does

### Prismatic's Hybrid Approach

The Prismatic Platform employs theorem proving (via Lean4) for core invariants and critical decision properties, and model checking (via property enumeration) for finite-state protocol verification. The [QEVE](/glossary/qeve/) pipeline's Stage 4 uses Lean4 theorem proving for the claims that matter most: belief acceptance, [confidence scoring](/glossary/confidence-scoring/) correctness, and axiom compliance. The [White Team](/glossary/white-team/) uses both paradigms in its verification campaigns, selecting the appropriate method based on the property's structure.

## Dependent Type Theory

Lean4's power derives from its foundation in dependent type theory, specifically the Calculus of Inductive Constructions (CIC). Understanding the type-theoretic foundation is essential for understanding how the platform translates epistemic claims into formal proofs.

### Types as Propositions

The Curry-Howard correspondence establishes a deep isomorphism between logic and type theory:

| Logic | Type Theory |
|-------|-------------|
| Proposition | Type |
| Proof | Program (term inhabiting the type) |
| Implication (A implies B) | Function type (A -> B) |
| Conjunction (A and B) | Product type (A x B) |
| Disjunction (A or B) | Sum type (A + B) |
| Universal quantification (for all x, P(x)) | Dependent function type ((x : A) -> P(x)) |
| Existential quantification (exists x, P(x)) | Dependent pair type (Sigma x : A, P(x)) |
| Falsehood | Empty type |
| Truth | Unit type |

Under this correspondence, proving a theorem is equivalent to writing a program of the appropriate type. If the type is inhabited (a program of that type exists and compiles), the proposition is true. If the type is empty (no such program exists), the proposition is false. The Lean4 type checker serves as both a compiler and a proof checker.

### Dependent Types in Practice

A dependent type is a type that depends on a value. In conventional type systems, you can say "this function returns a list." In a dependent type system, you can say "this function returns a list of exactly n elements, where n is the input parameter." The type itself carries a correctness guarantee.

For QEVE's formal layer, dependent types enable specifications like:

```
-- A verified belief has passed all axiom checks
structure VerifiedBelief where
  belief : Belief
  plurality_proof : SignalCount belief >= 2
  provenance_proof : HasProvenance belief
  timestamp_proof : HasTimestamp belief
  decay_applied : DecayApplied belief
```

A value of type `VerifiedBelief` cannot exist unless all four proof fields are satisfied. The type system makes it impossible to construct an unverified belief and pass it as verified -- the compiler would reject it.

## QEVE Formal Verification Pipeline

Within the [QEVE](/glossary/qeve/) pipeline, formal verification operates as Stage 4, between logical consistency checking (Stage 3) and [Monte Carlo robustness testing](/glossary/monte-carlo-verification/) (Stage 5).

### Theorem Generation

The first step translates the critical hypothesis from the [belief graph](/glossary/belief-graph/) into a Lean4 theorem statement. This translation involves:

1. **Axiom extraction**: Identify the evidence signals supporting the hypothesis and encode them as Lean4 axioms
2. **Inference chain encoding**: Translate the inference rules connecting evidence to conclusion into Lean4 function definitions
3. **Theorem statement**: Formulate the hypothesis as a Lean4 proposition to be proved
4. **Side condition encoding**: Encode [NABLA Infinity](/glossary/nabla-infinity/) axiom requirements as additional proof obligations

### Proof Search

Lean4's tactic framework provides semi-automated proof search. The engine attempts proof using a sequence of strategies:

- **Automation tactics** (`simp`, `omega`, `decide`): Handle decidable fragments automatically
- **Structural induction**: For properties over recursive data structures
- **Case analysis**: Exhaustive case splitting when the proof branches
- **External solvers**: Integration with SMT solvers (Z3) for arithmetic and quantifier reasoning

If automated tactics succeed, the proof is complete without human intervention. If they fail, the system records which sub-goals remain unproved and reports them as open proof obligations.

### Proof Audit

Every completed proof undergoes an audit phase that checks:

- **Assumption minimality**: Does the proof use only the stated axioms, or does it depend on hidden assumptions?
- **Axiom consistency**: Are the stated axioms mutually consistent? (Inconsistent axioms can prove anything, making the proof vacuously true.)
- **Dependency tracking**: Which evidence signals does the proof actually depend on? (A proof that depends on only 2 of 5 signals reveals that the other 3 signals are irrelevant to the formal necessity of the conclusion.)

### Counterexample Construction

When a proof attempt fails, the engine switches to counterexample mode. Using Lean4's `#eval` and `#check` capabilities combined with bounded model checking, it searches for a concrete scenario that makes the hypothesis false. A counterexample is far more actionable than a generic "proof failed" result because it identifies the specific conditions under which the conclusion breaks.

## Soundness and Completeness

Two fundamental properties govern any formal verification system.

### Soundness

A verification system is sound if every conclusion it verifies is actually true. Soundness means "no false positives" -- if the system says a property holds, it really holds. Lean4's type checker is sound (assuming the underlying axiom system, the Calculus of Inductive Constructions, is consistent -- a widely held belief supported by decades of mathematical investigation but not itself formally provable due to Goedel's incompleteness theorems).

For the Prismatic Platform, soundness means: if [Trinity Gate](/glossary/trinity-gate/)'s formal layer reports that a conclusion is "formally necessary," then the conclusion genuinely follows from the evidence under the stated axioms. No exception.

### Completeness

A verification system is complete if it can verify every true property. Completeness means "no false negatives" -- if a property is true, the system can prove it. By Goedel's First Incompleteness Theorem, no sufficiently powerful formal system is both sound and complete. Lean4 is sound but not complete: some true statements cannot be proved within the system.

For the Prismatic Platform, incompleteness means: some genuinely sound conclusions will fail formal verification -- not because they are wrong, but because the proof engine cannot find a proof within the available axiom system and tactics. These conclusions are classified as "possible but not formally necessary" and fall back to the logical consistency gate (Stage 3) and [Monte Carlo robustness testing](/glossary/monte-carlo-verification/) (Stage 5) for validation.

This is why QEVE employs multiple verification stages rather than relying on formal proofs alone. Formal verification provides the strongest guarantee when it succeeds, but its incompleteness means it cannot be the sole verification method.

## Integration with OTP Supervision Trees

The Prismatic Platform's Elixir/OTP architecture provides a natural alignment with formal verification principles. OTP supervision trees encode restart strategies and failure handling policies that can be formally specified and verified.

Key verifiable properties include:

- **Restart boundedness**: A supervision tree with `max_restarts: 3, max_seconds: 5` guarantees that no child process is restarted more than 3 times in any 5-second window. This property can be formally proved as a temporal safety property.
- **State isolation**: Each GenServer process maintains isolated state. Formal verification can prove that no state leakage occurs between processes, a critical property for the [epistemic pipeline](/glossary/epistemic-pipeline/).
- **Message ordering**: OTP guarantees FIFO message delivery between any two processes. Formal verification can prove that pipeline stages process evidence in the correct order.

The [White Team](/glossary/white-team/)'s verification campaigns include OTP supervision tree verification as a standard component, ensuring that the platform's process topology maintains its safety invariants under all failure scenarios.

## Comparison with Property-Based Testing

Formal verification and [property-based testing](/glossary/property-based-testing/) share the goal of validating universal properties but differ fundamentally in their guarantees.

| Dimension | Property-Based Testing | Formal Verification |
|-----------|----------------------|---------------------|
| **Method** | Random input generation | Mathematical proof |
| **Coverage** | Statistical (high but not complete) | Universal (within axiom system) |
| **Counterexamples** | Shrunk minimal failing case | Concrete countermodel |
| **Automation** | Fully automated | Semi-automated (may require guidance) |
| **Scalability** | Scales well to large systems | Proof complexity can be prohibitive |
| **Guarantee** | "No bugs found in N random tests" | "No bugs possible (within axioms)" |
| **Failure mode** | May miss edge cases outside distribution | May fail to prove true properties (incompleteness) |

The Prismatic Platform uses both methods at different pipeline stages. Property-based testing (via StreamData in Elixir) validates software correctness at the code level. Formal verification (via Lean4) validates epistemic correctness at the reasoning level. They are complementary, not competing.

## Practical Limitations

Formal verification, despite its mathematical power, has practical limitations that the platform explicitly acknowledges and mitigates.

**Specification fidelity**: A proof is only as good as its specification. If the Lean4 theorem statement does not accurately capture the intended property, the proof is correct but irrelevant. The platform mitigates this through specification review as part of the [White Team](/glossary/white-team/)'s verification campaigns.

**Axiom trust**: Every proof rests on axioms. If an axiom is wrong (e.g., an evidence signal is encoded with incorrect weight), the proof may be valid but the conclusion false. The platform mitigates this through provenance tracking ([Provenance Mandatory](/glossary/provenance-mandatory/) axiom) and Monte Carlo stress testing of the axioms themselves.

**Computational cost**: Formal proof search is computationally expensive and may not terminate within practical time bounds. The platform uses timeout-bounded proof search with fallback to weaker verification methods (logical consistency + Monte Carlo robustness).

**Expertise requirement**: Writing formal specifications and guiding proof search requires specialized knowledge. The platform automates the most common proof patterns through Lean4 tactic libraries but reserves human-guided proofs for novel or particularly complex properties.

**Undecidability**: Some properties of interest are provably undecidable -- no algorithm can determine whether they hold in all cases. The platform classifies such properties and routes them to probabilistic methods rather than attempting impossible proofs.

## Five Core Platform Theorems

The Prismatic Platform maintains five core theorems that are formally verified through Lean4 and re-verified with every significant platform evolution:

1. **Axiom Compliance**: All beliefs passing through the [epistemic pipeline](/glossary/epistemic-pipeline/) satisfy all seven [NABLA Infinity](/glossary/nabla-infinity/) axioms
2. **Trinity Integrity**: [Trinity Gate](/glossary/trinity-gate/) evaluation is independent across its three layers (no layer influences another)
3. **Confidence Monotonicity**: Adding independent supporting evidence never decreases [confidence scores](/glossary/confidence-scoring/)
4. **Contradiction Visibility**: No [contradiction](/glossary/contradiction-preservation/) can be structurally hidden from downstream consumers
5. **Provenance Completeness**: Every accepted belief has a complete, auditable provenance chain to source signals

These theorems constitute the formal foundation of the platform's epistemic guarantees. Their formal proofs are part of the platform's [audit trail](/glossary/audit-trail/) and are available for external review.

## Related Terms

- [QEVE](/glossary/qeve/) -- Verification engine where formal verification operates as Stage 4
- [Lean4](/glossary/lean4/) -- Theorem prover and programming language used for formal proofs
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate whose third layer requires formal necessity proofs
- [Modal Logic](/glossary/modal-logic/) -- Logical framework for necessity and possibility used in Trinity Gate
- [Monte Carlo Verification](/glossary/monte-carlo-verification/) -- Probabilistic complement to formal proof
- [Property-Based Testing](/glossary/property-based-testing/) -- Randomized testing providing statistical coverage
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic axioms that formal verification proves are satisfied
- [White Team](/glossary/white-team/) -- Verification team conducting formal proof campaigns
- [Belief Graph](/glossary/belief-graph/) -- The data structure from which theorems are extracted
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- The property that formal and Monte Carlo verification jointly establish
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Axiom ensuring proof dependencies are traceable
- [Confidence Scoring](/glossary/confidence-scoring/) -- Formula whose correctness is formally verified
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Axiom whose enforcement is a core platform theorem
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of all formal proof attempts and results

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)