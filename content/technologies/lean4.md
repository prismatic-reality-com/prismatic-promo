+++
title = "Lean 4"
weight = 42
[extra]
category = "ai-ml"
description = "Theorem prover and programming language for formal verification of platform invariants and proofs"
url = "https://lean-lang.org"
version = "4.x"
icon = "lean"
color = "blue"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 961
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Lean", "Theorem", "technologies", "ai ml", "Prismatic Platform", "QEVE", "Trinity Gate", "Proof"]
tags = ["technologies", "ai-ml", "lean-4", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Lean 4 - Prismatic Platform"
+++

## Overview

Lean 4 is the formal verification system integrated into the Prismatic Platform's QEVE (Quality Evidence Verification Engine) for mathematically proving properties about critical system components. Unlike traditional testing that checks specific cases, Lean 4 proves properties hold for all possible inputs, providing the highest level of assurance for the platform's safety-critical operations. This distinction is fundamental: a test suite with 100% branch coverage can still miss edge cases, but a formal proof covers every possible execution path by mathematical necessity.

The Prismatic Platform uses Lean 4 within its [Trinity Gate](/capabilities/trinity-gate/) verification system, where formal proofs complement structural consistency checks and logical consistency validation. This three-layer verification ensures that platform invariants -- from data structure correctness to agent behavior guarantees -- are mathematically proven rather than merely tested. The Trinity Gate requires all three layers to pass before critical claims are accepted: structural consistency (graph theory), logical consistency (rule-based), and formal necessity (Lean 4 proofs).

Lean 4's dual nature as both a theorem prover and a general-purpose programming language enables the platform to express and verify complex properties about concurrent systems, data transformations, and security protocols in a unified framework. The same Lean 4 code that specifies a property also serves as its proof, creating a single source of truth for both specification and verification.

## Key Features

- **Dependent Types**: Types that depend on values for precise specifications -- a list of exactly 5 elements has a different type than a list of 6
- **Tactic Mode**: Interactive proof construction with automation tactics like `simp`, `omega`, and `decide` for routine proof obligations
- **Term Mode**: Direct proof term construction for simple proofs where the proof structure mirrors the type directly
- **Metaprogramming**: Lean 4 macros and elaboration for custom proof automation and domain-specific proof strategies
- **Interop**: Foreign function interface for C and other languages, enabling integration with platform binaries
- **Lake Build System**: Package management and project build tool with dependency resolution
- **Mathlib Integration**: Access to the comprehensive Mathlib4 library of formalized mathematics
- **Incremental Compilation**: Only re-verify changed proofs, enabling fast iteration during proof development

## Platform Integration

Lean 4 proves formal properties within the QEVE verification engine. The following examples demonstrate proofs of system invariants that the platform relies on.

```lean
-- Formal proof of agent supervision invariant:
-- Restarting a child preserves the supervisor's child count
-- and does not remove any other children.
theorem supervisor_restart_preserves_state
    (s : SupervisorState)
    (child : ChildSpec)
    (h : child ∈ s.children) :
    let s' := restart_child s child
    s'.children.length = s.children.length ∧
    ∀ c ∈ s.children, c ≠ child → c ∈ s'.children := by
  constructor
  · exact restart_preserves_count s child h
  · intro c hc hne
    exact restart_preserves_others s child c h hc hne

-- Proof that confidence scoring is monotonically bounded
theorem confidence_bounded
    (evidence : List Evidence)
    (h : evidence.length > 0) :
    0.0 ≤ confidence_score evidence ∧ confidence_score evidence ≤ 1.0 := by
  constructor
  · exact confidence_non_negative evidence h
  · exact confidence_upper_bound evidence h

-- Proof that the Trinity Gate is sound:
-- If all three gates pass, the claim is well-founded
theorem trinity_gate_soundness
    (claim : Claim)
    (h_struct : structural_consistent claim = true)
    (h_logic : logical_consistent claim = true)
    (h_formal : formal_necessary claim = true) :
    well_founded claim := by
  exact trinity_soundness claim h_struct h_logic h_formal
```

## Architecture

Lean 4 integrates into the platform's verification pipeline through the QEVE engine, which orchestrates proof obligations and validates results.

| Component | Role | Location |
|-----------|------|----------|
| Lean 4 Prover | Formal proof checking and construction | `lean/src/` |
| QEVE Engine | Proof orchestration and result validation | `apps/prismatic_safety/` |
| Trinity Gate | Three-layer verification requiring Lean 4 proofs | `apps/prismatic_safety/` |
| Property Specs | Formal specifications of platform invariants | `lean/src/PrismaticProofs/` |
| Proof Library | Reusable proof tactics and lemmas | `lean/src/PrismaticProofs/Tactics/` |
| CI Integration | Proof verification in [GitLab CI/CD](/technologies/gitlab-ci/) pipeline | `.gitlab-ci.yml` |

The verification workflow follows a structured process.

| Phase | Activity | Tool | Output |
|-------|----------|------|--------|
| 1 | Specify invariant | Lean 4 type | Formal specification (theorem statement) |
| 2 | Construct proof | Lean 4 tactic/term | Proof term |
| 3 | Verify proof | Lean 4 kernel | Verification certificate |
| 4 | Generate evidence | QEVE | Proof artifact for Trinity Gate |
| 5 | Gate evaluation | Trinity Gate | Pass/fail decision with evidence |

## Verification Domains

The platform uses Lean 4 to verify properties across several critical domains.

| Domain | Property Type | Example |
|--------|-------------|---------|
| Supervision | Child count preservation, restart invariants | `supervisor_restart_preserves_state` |
| Confidence Scoring | Boundedness, monotonicity, convergence | `confidence_bounded`, `confidence_monotone` |
| Trinity Gate | Soundness, completeness, decidability | `trinity_gate_soundness` |
| Data Structures | Sorted invariants, uniqueness, capacity | `sorted_insert_preserves_order` |
| Security Protocols | Token validity, key rotation safety | `key_rotation_no_auth_gap` |
| Agent Behavior | Termination, progress, fairness | `agent_eventually_responds` |

## Performance Characteristics

Lean 4 proof checking performance determines the verification cycle time within the platform's quality pipeline.

| Operation | Time | Notes |
|-----------|------|-------|
| Simple theorem verification | < 100ms | Direct proof terms, basic tactics |
| Medium theorem (10 tactics) | < 1s | Standard proof with automation |
| Complex theorem (Mathlib) | 1-10s | Proofs using Mathlib lemmas |
| Full proof library check | ~30s | All platform proofs (~50 theorems) |
| Incremental re-verification | < 500ms | Single changed proof file |
| Lake build (fresh) | ~60s | Initial build with dependencies |
| Lake build (cached) | < 5s | Incremental build |

The proof library is checked in the [GitLab CI/CD](/technologies/gitlab-ci/) pipeline as part of the quality stage. Incremental verification ensures that only changed proofs are re-checked, keeping the pipeline fast.

## Configuration

Lean 4 project configuration uses the Lake build system with Mathlib as a dependency.

```toml
# lakefile.lean - Lean 4 project configuration
require mathlib from git "https://github.com/leanprover-community/mathlib4"

lean_lib PrismaticProofs where
  srcDir := "lean/src"

lean_exe verify where
  root := `PrismaticProofs.Verify

-- Proof automation configuration
lean_lib PrismaticTactics where
  srcDir := "lean/src/Tactics"
```

Integration with the Elixir platform is managed through the QEVE module.

```elixir
# QEVE configuration for Lean 4 integration
config :prismatic_safety, :qeve,
  lean_path: "lean/",
  lake_executable: "lake",
  proof_timeout: 30_000,
  parallel_proofs: System.schedulers_online(),
  cache_verified: true
```

## Best Practices

- **Start with specifications** -- write the theorem statement (type) before attempting the proof; a clear specification is half the proof
- **Use automation first** -- try `simp`, `omega`, and `decide` before manual tactic sequences; Lean 4's automation handles many routine obligations
- **Decompose complex proofs** -- break large proofs into lemmas that can be verified independently and composed
- **Keep proofs readable** -- prefer explicit tactic sequences over clever one-liners; proofs are documentation of why a property holds
- **Version proofs with code** -- when a platform invariant changes, update both the code and its corresponding proof in the same commit
- **Use `sorry` sparingly** -- `sorry` marks unproven goals and should only appear during development, never in committed code
- **Integrate with CI/CD** -- run `lake build` in the [GitLab CI/CD](/technologies/gitlab-ci/) pipeline to ensure all proofs remain valid

## Comparison with Alternatives

| Feature | Lean 4 | Coq | Isabelle/HOL | Agda | Dafny |
|---------|--------|-----|-------------|------|-------|
| Type Theory | CIC with quotient types | CIC | HOL | Martin-Lof | First-order |
| Tactic System | Lean tactics + Mathlib | Ltac/Ltac2 | Isar/Eisbach | Pattern matching | Built-in |
| Programming | General-purpose | Extraction | Code generation | General-purpose | Imperative |
| Automation | Good (simp, omega) | Excellent (CoqHammer) | Excellent (sledgehammer) | Moderate | Strong (Z3) |
| Community | Growing fast | Large, mature | Large, mature | Moderate | Growing |
| Build System | Lake | opam/dune | Isabelle sessions | Stack/Cabal | MSBuild |
| Platform Choice | Primary | Not used | Not used | Not used | Not used |

Lean 4 was chosen for its combination of a modern programming language, strong automation, and active community growth. Its ability to serve as both a proof assistant and a programming language reduces the gap between specification and implementation.

## Related Technologies

- [Dialyzer](/technologies/dialyzer/) - Static type analysis that complements formal proofs with lightweight type checking
- [Credo](/technologies/credo/) - Code quality analysis that operates at a different level than formal verification
- [ExUnit](/technologies/exunit/) - Testing framework that provides empirical evidence complementing formal proofs
- [Elixir](/technologies/elixir/) - Primary platform language whose properties are verified by Lean 4

## Related Apps

- [prismatic_safety](/apps/prismatic-safety/) - QEVE verification engine hosting Lean 4 integration
- [prismatic_lean4](/apps/prismatic-lean4/) - Lean 4 proof library and build infrastructure
- [prismatic_lean](/apps/prismatic-lean/) - Legacy Lean integration module

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)