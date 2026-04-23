+++
title = "/lean"
weight = 1700
[extra]
category = "Formal Verification"
description = "Execute Lean 4 code or prove a theorem with the lean-specialist agent"
syntax = "/lean [options]"
authority = "L2+"
agent = "lean-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1209
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["lean", "Execute", "commands", "Formal Verification", "Prismatic Platform", "Elixir", "QEVE", "Proof"]
tags = ["commands", "formal-verification", "lean", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/lean - Prismatic Platform"
+++

## Overview

**/lean** is a production command in the **[Formal Verification](@/glossary/formal-verification.md)** category of the Prismatic Platform that enables execution of Lean 4 code and theorem proving through the dedicated `lean-specialist` agent. Lean 4 is a functional programming language and interactive theorem prover that serves as the formal backbone of the platform's [QEVE](@/glossary/qeve.md) (Quantitative Epistemic Verification Engine) framework, providing machine-checkable proofs of system properties, invariants, and correctness guarantees.

Formal verification is a cornerstone of the Prismatic Platform's epistemic integrity. While traditional testing can demonstrate the presence of specific behaviors, formal verification proves the absence of entire classes of bugs. The `/lean` command makes this capability accessible through a simple command interface, allowing developers and agents to write Lean 4 specifications, prove theorems about platform components, and verify that implementations satisfy their formal specifications.

This command operates under the **L2+** authority level and is executed by the `lean-specialist` agent, which possesses expertise in dependent type theory, tactic-based proof development, and the Mathlib library. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The lean-specialist agent can translate between Elixir specifications and Lean 4 formalizations, bridging the gap between the platform's implementation language and its verification language.

Within the platform's [Trinity Gate](@/glossary/trinity-gate.md) framework, the `/lean` command directly supports the third gate -- Formal Necessity -- by providing machine-checkable proofs that claims are not merely consistent but formally necessary. This elevates epistemic claims from the level of empirical evidence to mathematical certainty.

## Architecture

The Lean integration architecture bridges the Elixir runtime with the Lean 4 toolchain through a managed execution environment.

```
+---------------------+     +-------------------+     +-------------------+
| Lean Source Manager | --> | Lean Compiler     | --> | Proof Checker     |
| (File + Inline)     |     | (lean4 toolchain) |     | (Kernel Verifier) |
+---------------------+     +-------------------+     +-------------------+
         |                          |                          |
         v                          v                          v
+---------------------+     +-------------------+     +-------------------+
| Spec Translator     |     | Lake Builder      |     | Result Formatter  |
| (Elixir -> Lean)    |     | (Dependency Mgmt) |     | (Proof Certificate)|
+---------------------+     +-------------------+     +-------------------+
         |                                                     |
         v                                                     v
+---------------------+                              +-------------------+
| Trinity Gate        |                              | QEVE Integration  |
| (Formal Necessity)  |                              | (Proof Storage)   |
+---------------------+                              +-------------------+
```

The **Lean Source Manager** handles both file-based and inline Lean 4 code. The **Spec Translator** converts Elixir module specifications (typespecs, behaviours, contracts) into Lean 4 formalizations for verification. The **Lean Compiler** invokes the Lean 4 toolchain with appropriate Lake build configurations. The **Proof Checker** validates that proofs are complete and well-typed. The **Result Formatter** produces human-readable proof certificates and machine-readable verification results. The **QEVE Integration** stores verified proofs as part of the platform's epistemic evidence base.

## Usage

### Executing Lean 4 Code

```bash
# Execute a Lean 4 file
/lean --file proofs/list_properties.lean

# Execute inline Lean 4 code
/lean --eval "def hello := \"Hello from Lean 4\""

# Execute with specific Lake environment
/lean --file proofs/graph_theory.lean --lake-env prismatic-proofs

# Execute with Mathlib dependency
/lean --file proofs/algebra.lean --mathlib
```

### Theorem Proving

```bash
# Prove a specific theorem
/lean --prove "theorem list_append_nil (l : List a) : l ++ [] = l"

# Prove with tactic hints
/lean --prove "theorem nat_add_comm" --tactics "induction, simp, ring"

# Attempt automated proof search
/lean --prove --auto "theorem double_neg (p : Prop) : p -> !!p"

# Verify an existing proof
/lean --verify proofs/supervisor_invariant.lean
```

### Specification Translation

```bash
# Translate Elixir module spec to Lean 4
/lean --translate-spec PrismaticStorage.ETS

# Translate and generate proof obligations
/lean --translate-spec PrismaticPerimeter.SecurityRating --proof-obligations

# Translate with custom type mappings
/lean --translate-spec MyModule --type-map custom_types.json
```

### QEVE Integration

```bash
# Submit verified proof to QEVE evidence base
/lean --submit-proof proofs/safety_property.lean --claim "agent_pool_never_deadlocks"

# Query QEVE for proofs related to a module
/lean --qeve-query PrismaticAgents.Pool

# Run Monte Carlo + Lean hybrid verification
/lean --hybrid-verify "system_availability > 0.999" --monte-carlo-samples 10000
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file` | string | - | Lean 4 source file to execute |
| `--eval` | string | - | Inline Lean 4 expression to evaluate |
| `--prove` | string | - | Theorem statement to prove |
| `--verify` | string | - | Proof file to verify without re-proving |
| `--auto` | boolean | false | Enable automated proof search (omega, simp, aesop) |
| `--tactics` | string | - | Comma-separated tactic suggestions for proof search |
| `--translate-spec` | string | - | Elixir module to translate to Lean 4 specification |
| `--proof-obligations` | boolean | false | Generate proof obligations from translated spec |
| `--type-map` | string | - | Custom Elixir-to-Lean type mapping file |
| `--mathlib` | boolean | false | Enable Mathlib library dependency |
| `--lake-env` | string | default | Lake build environment to use |
| `--submit-proof` | string | - | Submit verified proof to QEVE evidence base |
| `--claim` | string | - | Claim identifier for QEVE submission |
| `--qeve-query` | string | - | Query QEVE for proofs related to a module |
| `--hybrid-verify` | string | - | Property for hybrid Monte Carlo + Lean verification |
| `--monte-carlo-samples` | integer | 1000 | Number of Monte Carlo samples for hybrid verification |
| `--timeout` | duration | 60s | Maximum time for proof search |
| `--format` | string | text | Output format: `text`, `json`, `proof-certificate` |
| `--verbose` | boolean | false | Show detailed proof construction steps |

## Execution Flow

1. **Source Acquisition**: Lean 4 source is acquired from a file, inline expression, theorem statement, or specification translation. For `--translate-spec`, the Elixir module is loaded and its typespecs, behaviours, and documented contracts are extracted.

2. **Translation** (if applicable): Elixir specifications are translated to Lean 4 formalizations. Type mappings convert Elixir types to their Lean 4 equivalents (e.g., `list(integer())` becomes `List Int`, `{:ok, term()} | {:error, String.t()}` becomes a sum type). Custom type mappings override defaults.

3. **Environment Preparation**: The Lake build environment is configured with required dependencies (Mathlib, custom packages). The Lean toolchain version is verified for compatibility.

4. **Compilation**: The Lean 4 compiler processes the source, performing type checking, elaboration, and kernel verification. Compilation errors are captured with full diagnostic information.

5. **Proof Search** (for `--prove` and `--auto`): If automated proof is requested, the system applies a sequence of tactics: `simp`, `omega`, `aesop`, `ring`, `norm_num`, and custom tactics from `--tactics`. The search is bounded by `--timeout`.

6. **Verification**: Completed proofs are verified by the Lean kernel, which checks that the proof term has the correct type. This is a foundational verification step -- the kernel is the trusted computing base.

7. **QEVE Integration** (if applicable): Verified proofs are packaged as proof certificates and submitted to the QEVE evidence base, where they are indexed by the associated claim and linked to the relevant platform components.

8. **Output**: Results are formatted and displayed, including proof status, verification time, and any diagnostic information.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `lean-specialist` agent |
| [QEVE](@/glossary/qeve.md) | Evidence Storage | Verified proofs stored as epistemic evidence |
| [Trinity Gate](@/glossary/trinity-gate.md) | Formal Necessity | Lean proofs satisfy the third gate requirement |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Epistemic Framework | Proofs provide maximum confidence (1.0) evidence |
| [Monte Carlo](@/commands/monte-carlo.md) | Hybrid Verification | Combined probabilistic and formal verification |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Proof requirements enforced at quality gates |
| [Telemetry](@/glossary/telemetry.md) | Observability | Proof metrics tracked (time, complexity, success rate) |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered via AIAD standard |

## Best Practices

**Start with simple properties and build incrementally.** Attempting to prove complex system invariants directly often leads to proof bloat and tactic failures. Decompose complex properties into lemmas, prove each lemma independently, and compose them into the final proof.

**Use `--translate-spec` to bootstrap formal specifications.** Manual translation from Elixir to Lean is error-prone and tedious. The automated translator produces a correct starting point that can be refined with domain-specific invariants.

**Leverage Mathlib for standard mathematical properties.** The Mathlib library provides thousands of pre-proven theorems about numbers, lists, sets, and algebraic structures. Using `--mathlib` dramatically reduces the proof burden for properties involving standard mathematics.

**Set appropriate timeouts for automated proof search.** Complex proofs may require significantly more than the default 60-second timeout. For deep properties, increase the timeout or provide tactic hints to guide the search.

**Submit all verified proofs to QEVE.** The QEVE evidence base is cumulative -- each proof strengthens the platform's epistemic foundations. Even seemingly trivial proofs (e.g., a function always returns `{:ok, _}` for valid inputs) contribute to the overall confidence score.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Lean toolchain not installed | Installation instructions with version requirement | Install Lean 4 via elan |
| Proof search timeout | Shows partial proof progress and tactic state | Increase timeout or provide tactic hints |
| Type mismatch in translation | Shows Elixir type and failed Lean mapping | Add custom type mapping |
| Kernel verification failure | Shows the failing proof obligation with context | Review and correct proof construction |
| Mathlib version conflict | Shows compatible version range | Update Lake dependencies |
| QEVE submission failure | Stores proof locally for retry | Retry with `/lean --submit-proof` |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Proofs must be complete and kernel-verified -- partial proofs and sorry-based stubs are rejected. Every formal claim must be fully proven.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The Lean kernel provides the highest level of evidence: machine-checked mathematical proof. No formal claim is accepted without passing through the kernel verifier.

The `/lean` command is the cornerstone of the platform's [NABLA Infinity](@/glossary/nabla-infinity.md) Provenance Mandatory axiom, ensuring that formal claims are traceable to machine-checkable proofs rather than informal arguments or empirical testing alone.

## Related Commands

- [/formal-verify](@/commands/formal-verify.md) - Formal verification of system properties and invariants
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/monte-carlo](@/commands/monte-carlo.md) - Monte Carlo simulation for probabilistic analysis and risk assessment
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)