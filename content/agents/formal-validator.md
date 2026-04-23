+++
title = "formal-validator"
weight = 170
[extra]
domain = "domain"
level = "L3"
description = "Formal verification specialist implementing Lean4-based theorem proving, type-theoretic validation, and mathematical proof generation for the NABLA Reasoning System"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "hot-code-reload", "nabla-infinity", "telemetry", "trinity-gate", "lean4"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["formal-validator", "Formal", "Lean4-based", "NABLA", "Reasoning", "System", "agents", "agent", "Prismatic Platform", "The Formal"]
tags = ["agents", "agent", "formal-validator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "formal-validator - Prismatic Platform"
+++

## Overview

The Formal Validator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Domain domain of the Prismatic Platform. This agent implements [formal verification](@/glossary/formal-verification.md) through [Lean4](@/glossary/lean4.md)-based [theorem proving](@/glossary/theorem-proving.md), type-theoretic validation, and mathematical proof generation for the [NABLA](@/capabilities/nabla-axioms.md) Reasoning System. It provides the mathematical certainty required by the [Trinity Gate](@/glossary/trinity-gate.md)'s Formal Necessity criterion, ensuring that platform claims are not merely empirically supported but provably correct.

While the [formal-reasoning-specialist](@/agents/formal-reasoning-specialist.md) focuses on integrating formal reasoning systems with the platform's epistemic framework, the Formal Validator concentrates specifically on validation -- the act of confirming that implementations satisfy their formal specifications. Within the platform's 434-agent autonomous ecosystem built on the [AIAD](@/glossary/aiad.md) standard, this distinction is critical: reasoning explores what can be proven, while validation confirms what must be proven.

## Type-Theoretic Foundation

The Formal Validator's approach to verification is grounded in type theory, the mathematical discipline that treats types as propositions and programs as proofs. This correspondence, known as the Curry-Howard isomorphism, enables the agent to verify program properties by constructing programs in a sufficiently expressive type system.

Lean4's dependent type system provides the expressiveness required for meaningful verification. Unlike simple type systems that only track data categories (integer, string, list), dependent types can express relationships between values. A dependent type can state that "this function takes a list and returns a list of the same length" or "this function takes a positive integer and returns a result between 0 and that integer." These refined types capture behavioral properties that simple types cannot express.

The Formal Validator maintains type-theoretic specifications for critical platform components. These specifications serve dual purposes: they provide machine-checkable documentation of intended behavior, and they enable automated verification that implementations conform to their specifications. When implementation and specification diverge, the Lean4 type checker reports the inconsistency, enabling immediate correction.

Type universe management ensures that specifications are constructed at appropriate levels of abstraction. Lower-level specifications describe individual functions and data structures. Higher-level specifications describe component interactions, protocol properties, and system-wide invariants. The hierarchical organization prevents circular dependencies between specifications and enables modular verification.

## Lean4 Proof Architecture

The agent maintains a structured proof architecture that organizes formal proofs into categories aligned with platform concerns.

Safety proofs demonstrate that platform operations cannot produce unsafe states. These proofs cover memory safety (no use-after-free or buffer overflow), type safety (no runtime type errors), and concurrency safety (no data races or deadlocks). Safety proofs provide negative guarantees -- they prove the absence of undesirable behaviors.

Liveness proofs demonstrate that platform operations eventually produce desired outcomes. These proofs cover termination (computations complete in finite time), progress (the system continues to make forward progress), and fairness (all requests eventually receive service). Liveness proofs provide positive guarantees -- they prove the eventual occurrence of desirable behaviors.

Correctness proofs demonstrate that platform operations produce the correct results. These proofs cover functional correctness (outputs match specifications for all valid inputs), protocol correctness (communication patterns follow defined protocols), and invariant preservation (system invariants are maintained across all state transitions).

Each proof category employs different verification techniques. Safety proofs typically use type-based reasoning, where the type system prevents construction of unsafe programs. Liveness proofs often use well-founded induction, demonstrating that some measure decreases with each step until termination. Correctness proofs may combine equational reasoning, case analysis, and structural induction depending on the property being verified.

## NABLA Axiom Verification

The Formal Validator provides formal verification of the [NABLA Infinity](@/glossary/nabla-infinity.md) axioms, ensuring that these epistemic principles are not merely policy statements but mathematically enforced properties.

For the Signal Plurality axiom, the validator proves that no belief establishment function can return a confidence above the threshold without receiving evidence from at least two distinct sources. This proof involves constructing a type that encodes the source-count requirement and demonstrating that the belief establishment function's type signature enforces it.

For the Contradiction Preservation axiom, the validator proves that the evidence storage system maintains both supporting and contradicting evidence for any belief, and that no function in the belief processing pipeline can discard contradicting evidence. This proof traces the data flow through the processing pipeline and demonstrates that contradiction-carrying types are preserved at each stage.

For the Provenance Mandatory axiom, the validator proves that every belief in the knowledge base carries provenance metadata and that no function can create or modify a belief without updating its provenance chain. This proof uses dependent types to encode the provenance requirement in the belief type itself, making provenance-less beliefs unrepresentable.

## Trinity Gate Validation Service

The Formal Validator serves as the validation engine for the [Trinity Gate](@/glossary/trinity-gate.md)'s third gate: Formal Necessity. When claims are submitted for Trinity Gate review, they pass through three sequential validation stages.

The Structural Consistency gate verifies that the evidence network supporting a claim forms a valid directed acyclic graph without circular dependencies. The Logical Consistency gate checks that the claim follows from its premises through valid logical inference. The Formal Necessity gate, served by the Formal Validator, attempts to construct a formal proof of the claim.

The Formal Validator implements the Formal Necessity check through a multi-strategy proof search. It first attempts automated proof tactics including simplification, rewriting, and decision procedures for decidable theories. If automated tactics fail, it attempts interactive proof construction using domain-specific tactics from its tactic library. If proof construction fails but no counterexample can be found, the validator reports the claim as "formally undetermined" with an explanation of which proof obligations remain open.

| Validation Result | Meaning | Action |
|------------------|---------|--------|
| Proven | Formal proof constructed and verified | Claim passes Formal Necessity |
| Disproven | Counterexample found | Claim fails with explanation |
| Undetermined | Neither proof nor counterexample found | Claim flagged for manual review |
| Out of scope | Property not expressible in formal system | Claim assessed by alternative means |

## Hot Code Reload Verification

The platform's [hot code reload](@/glossary/hot-code-reload.md) capability presents a unique verification challenge: how to ensure that upgrading running code preserves system properties without requiring system restart. The Formal Validator addresses this challenge by verifying state migration functions and interface compatibility between module versions.

State migration verification proves that the function transforming old state to new state preserves essential properties. If a GenServer's state invariant states that a counter is always non-negative, the migration function must provably maintain this invariant.

Interface compatibility verification proves that new module versions maintain backward compatibility with existing callers. This involves comparing function signatures, message protocol types, and behavioral specifications between versions.

## Continuous Verification Pipeline

The Formal Validator operates within a continuous verification pipeline that re-checks proofs as the platform evolves.

Incremental verification identifies which proofs are affected by code changes and re-verifies only those proofs, avoiding full re-verification on every change. Dependency tracking between proofs and code enables efficient identification of affected proofs.

Proof regression detection monitors for proofs that previously succeeded but now fail, indicating that code changes have broken formal properties. These regressions are treated with the same severity as test regressions under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime | Agent lifecycle management |
| AIAD [Registry](@/glossary/registry-otp.md) | Discovery | Specification and lookup |
| Prismatic Telemetry | Monitoring | Verification performance metrics |
| Trinity Gate | Validation service | Formal Necessity gate implementation |
| NABLA Framework | Axiom verification | Mathematical enforcement of epistemic axioms |
| Lean4 Runtime | External tooling | Theorem prover execution environment |

## Related Agents

- [**formal-reasoning-specialist**](@/agents/formal-reasoning-specialist.md) (L3) - Broader formal reasoning integration including Prolog and exploratory proof strategies
- [**aiad-hot-reload-coordinator**](@/agents/aiad-hot-reload-coordinator.md) (L3) - Hot reload coordination consuming formal compatibility proofs for safe upgrades
- [**cer-screening-specialist**](@/agents/cer-screening-specialist.md) (L3) - Critical infrastructure compliance verification benefiting from formal property proofs

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)