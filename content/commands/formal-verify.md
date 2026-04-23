+++
title = "/formal-verify"
weight = 1720
[extra]
category = "Formal Verification"
description = "Formal verification of system properties and invariants"
syntax = "/formal-verify [options]"
authority = "L3"
agent = "formal-verification-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1218
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["formal-verify", "Formal", "commands", "Formal Verification", "Prismatic Platform", "Trinity Gate", "Prolog", "NABLA"]
tags = ["commands", "formal-verification", "formal-verify", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/formal-verify - Prismatic Platform"
+++

## Overview

**/formal-verify** is a production command in the **[Formal Verification](@/glossary/formal-verification.md)** category of the Prismatic Platform that provides mathematically rigorous verification of system properties and invariants. Unlike testing, which can only demonstrate the presence of bugs, formal verification proves their absence for all possible inputs within a specified domain. This command bridges the gap between empirical software testing and mathematical proof, ensuring that critical system properties hold unconditionally.

The command operates under the **L3** authority level and is executed by the `formal-verification-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the command's ability to make definitive claims about system correctness -- claims that carry weight in the platform's [Trinity Gate](@/glossary/trinity-gate.md) evaluation and [NABLA](@/glossary/nabla-infinity.md) epistemic framework.

Formal verification is a cornerstone of the QEVE (Quantum Epistemic Verification Engine) subsystem, which combines [Lean4](@/glossary/lean4.md) theorem proving, NABLA axiom verification, and Monte Carlo simulation to produce multi-layered confidence assessments. The `/formal-verify` command provides direct access to this verification infrastructure, enabling operators to prove properties ranging from type safety and termination guarantees to protocol correctness and invariant preservation across system state transitions.

The platform currently maintains 629 Trinity Gate entities, each of which has passed the three-gate verification process: structural consistency (graph theory), logical consistency (rule-based), and formal necessity (modal logic + Lean4). The `/formal-verify` command is the primary tool for establishing and maintaining these formal guarantees.

## Architecture

The formal verification pipeline is built on a multi-engine architecture that selects the appropriate verification strategy based on the property being verified.

```
Property Spec --> Parser --> Strategy Selector --> Verification Engine --> Trinity Gate
                                  |                      |
                            Property Type           Engine Selection
                            Classification          (Lean4/Prolog/PBT)
                                                         |
                                              +----------+----------+
                                              |          |          |
                                           Lean4     Prolog    Property-
                                           Proofs    Logic     Based Test
```

### Verification Engines

| Engine | Technology | Best For | Confidence Level |
|--------|-----------|----------|-----------------|
| **Lean4 Prover** | Lean 4 | Mathematical proofs, type properties, induction | Formal proof (1.0) |
| **Prolog Reasoner** | SWI-Prolog | Logical relationships, protocol verification, rule systems | Logical proof (0.95) |
| **Property-Based** | StreamData | Statistical verification, boundary conditions, fuzzing | Statistical (0.90) |
| **Model Checker** | Custom | State machine verification, concurrency properties | Exhaustive (0.98) |

### Property Classification

Properties are classified into categories that determine which verification engine is most appropriate:

| Category | Examples | Primary Engine |
|----------|----------|---------------|
| **Type Safety** | "All return values match @spec" | Lean4 + Dialyzer |
| **Invariant** | "Account balance never negative" | Lean4 + PBT |
| **Protocol** | "Messages are processed in order" | Prolog + Model Checker |
| **Termination** | "Recursive function always terminates" | Lean4 |
| **Concurrency** | "No deadlock in supervision tree" | Model Checker |
| **Security** | "No privilege escalation path exists" | Prolog + Lean4 |

## Usage

### Basic Usage

```bash
# Verify all registered properties for a module
/formal-verify PrismaticPerimeter.SecurityRating

# Verify a specific property
/formal-verify --property "score_always_in_range" --module PrismaticPerimeter.Scoring

# Verify all properties in an application
/formal-verify --app prismatic_perimeter

# Run Trinity Gate verification on a claim
/formal-verify --trinity "Security ratings are monotonically bounded between 300 and 900"
```

### Engine-Specific Verification

```bash
# Use Lean4 for mathematical proof
/formal-verify --engine lean4 --property "list_sort_preserves_length"

# Use Prolog for protocol verification
/formal-verify --engine prolog --property "message_ordering_guarantee"

# Use property-based testing for statistical verification
/formal-verify --engine pbt --property "json_roundtrip_identity" --iterations 100000

# Use model checker for concurrency properties
/formal-verify --engine model-check --property "no_deadlock" --module PrismaticSupervisor
```

### Batch Verification

```bash
# Verify all properties across the entire platform
/formal-verify --all --report

# Verify only properties that changed since last verification
/formal-verify --incremental

# Verify and generate Lean4 proof artifacts
/formal-verify --app prismatic_storage_core --emit-proofs --output proofs/
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--module` | atom | none | Target Elixir module for verification |
| `--app` | string | none | Target umbrella application |
| `--property` | string | none | Specific property name to verify |
| `--engine` | string | auto | Verification engine: lean4, prolog, pbt, model-check |
| `--trinity` | string | none | Claim to evaluate through Trinity Gate |
| `--all` | boolean | false | Verify all registered properties platform-wide |
| `--incremental` | boolean | false | Only verify properties affected by recent changes |
| `--iterations` | integer | 10000 | Number of iterations for property-based testing |
| `--timeout` | integer | 300000 | Maximum verification time in milliseconds |
| `--emit-proofs` | boolean | false | Generate proof artifacts (Lean4 files) |
| `--output` | string | stdout | Directory for proof artifact output |
| `--report` | boolean | false | Generate a comprehensive verification report |
| `--verbose` | boolean | false | Show detailed verification steps and intermediate results |

## Execution Flow

1. **Property Resolution**: Resolve the target properties from the specified module, app, or explicit property name. Properties are loaded from `@verify` module attributes and the platform's property registry.

2. **Classification**: Each property is classified by category (type safety, invariant, protocol, termination, concurrency, security) to determine the optimal verification strategy.

3. **Engine Selection**: Based on classification, the appropriate verification engine is selected. If `--engine` is specified, that engine is used regardless of classification.

4. **Precondition Check**: Verify that all preconditions for the chosen engine are met (e.g., Lean4 toolchain available, Prolog runtime accessible, StreamData dependency present).

5. **Verification Execution**: The selected engine executes the verification. For Lean4, this involves generating and checking a proof term. For Prolog, logical rules are evaluated. For PBT, random inputs are generated and tested.

6. **Evidence Assembly**: Verification results are packaged as evidence with confidence levels, provenance metadata, and proof artifacts.

7. **Trinity Gate Evaluation**: If `--trinity` is specified, the evidence passes through all three Trinity Gate layers: structural consistency, logical consistency, and formal necessity.

8. **Report Generation**: Results are formatted and output. Failed verifications include counterexamples when available.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Trinity Gate](@/glossary/trinity-gate.md) | Core | Formal necessity gate requires proof from this command |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Epistemic | Verification results feed into NABLA confidence calculations |
| [QEVE](@/glossary/qeve.md) | Engine | Part of the Quantum Epistemic Verification Engine |
| [Lean4](@/glossary/lean4.md) | Prover | Lean4 theorem prover for mathematical proofs |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Formal verification can be required as a quality gate |
| [White Team](@/glossary/white-team.md) | Security | White Team verification campaigns use this command |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Verification results tracked as telemetry events |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `formal-verification-specialist` agent |

## Best Practices

**Start with property-based testing, graduate to formal proofs.** Use the PBT engine to quickly discover counterexamples and build confidence, then use Lean4 to establish formal guarantees for critical properties. This progression mirrors the NABLA confidence threshold escalation: exploratory (0.50) to standard (0.80) to critical (0.95).

**Define properties close to the code they verify.** Use `@verify` module attributes to declare properties inline with the modules they describe. This keeps properties synchronized with implementation changes and makes verification an integral part of the development workflow.

**Use incremental verification in CI/CD.** The `--incremental` flag dramatically reduces verification time by only checking properties affected by recent changes. Reserve `--all` verification for release candidates and milestone completions.

**Leverage Trinity Gate for critical claims.** Any claim that influences architectural decisions, security posture, or compliance status should pass Trinity Gate verification. The formal necessity gate ensures that the claim is not merely consistent but provably true.

**Archive proof artifacts.** Use `--emit-proofs` to generate Lean4 proof files that serve as machine-checkable evidence. These artifacts are valuable for compliance audits, security reviews, and knowledge transfer.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :property_not_found}` | Specified property does not exist in the target module | Check property name spelling; use `--verbose` to list available properties |
| `{:error, :engine_unavailable}` | Required verification engine is not installed | Install the missing engine (e.g., `lean4` toolchain, SWI-Prolog) |
| `{:error, :verification_timeout}` | Verification exceeded the timeout limit | Increase `--timeout` or simplify the property specification |
| `{:error, :counterexample_found}` | Property-based testing found a counterexample | Examine the counterexample to identify the implementation bug |
| `{:error, :proof_incomplete}` | Lean4 proof could not be completed automatically | Manual proof assistance may be required; check the generated `.lean` file |
| `{:error, :trinity_gate_failed}` | Claim failed one or more Trinity Gate layers | Review which gate failed and provide additional evidence |

## Advanced Usage

### Custom Property Definitions

Define verifiable properties using the `@verify` attribute:

```elixir
defmodule PrismaticPerimeter.Scoring do
  @verify %{
    name: "score_bounded",
    type: :invariant,
    property: "forall score : score >= 300 and score <= 900",
    engine: :lean4
  }

  @spec calculate_score(map()) :: {:ok, integer()} | {:error, term()}
  def calculate_score(evidence) do
    # Implementation
  end
end
```

### Lean4 Proof Generation

```bash
# Generate and verify a Lean4 proof
/formal-verify --engine lean4 --property "sort_idempotent" --emit-proofs --output proofs/sort/

# The generated proof can be checked independently
lean proofs/sort/sort_idempotent.lean
```

### Compositional Verification

Verify complex system properties by composing simpler verified properties:

```bash
# Verify individual components
/formal-verify --property "input_validated" --module PrismaticAPI.Validator
/formal-verify --property "output_sanitized" --module PrismaticAPI.Renderer

# Verify the composed property
/formal-verify --trinity "API requests are safe from injection attacks" \
  --evidence input_validated,output_sanitized
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Failed verifications are treated as blocking issues that must be resolved before proceeding.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Formal verification is the ultimate expression of NO DOUBTS -- mathematical proof eliminates doubt entirely.

The command is a direct implementation of the [NABLA](@/glossary/nabla-infinity.md) framework's seventh axiom (Provenance Mandatory): all verification results include complete provenance chains showing exactly how the conclusion was reached, which engines were used, and what evidence supports the claim.

## Related Commands

- [/lean](@/commands/lean.md) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/monte-carlo](@/commands/monte-carlo.md) - Monte Carlo simulation for probabilistic analysis and risk assessment
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)