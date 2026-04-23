+++
title = "/mycelialize-formal"
weight = 430
[extra]
category = "Evolution"
description = "Lean4 + Prolog formal verification for mathematically proven pattern propagation"
syntax = "/mycelialize-formal [options]"
authority = "COSMIC"
agent = "mycelial-network-coordinator"
status = "Experimental"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1356
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mycelialize-formal", "Lean4", "Prolog", "commands", "Evolution", "Prismatic Platform", "Phase", "Patterns", "Trinity Gate"]
tags = ["commands", "evolution", "mycelialize-formal", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mycelialize-formal - Prismatic Platform"
+++

## Overview

**/mycelialize-formal** is an experimental command in the **Evolution** category of the Prismatic Platform. It applies [Lean4](@/glossary/lean4.md) theorem proving and Prolog logical reasoning to the [mycelial network](@/glossary/mycelial-network.md) pattern propagation system, producing mathematically verified proofs that patterns propagate correctly, preserve invariants, and terminate within bounded resource envelopes. While the sibling [/mycelialize](@/commands/mycelialize.md) command handles high-throughput biological-inspired propagation and [/mycelialize-living](@/commands/mycelialize-living.md) manages self-evolving intelligence, `/mycelialize-formal` occupies the verification layer, ensuring that every pattern transformation is backed by constructive proof rather than empirical observation alone.

This command operates under the **COSMIC** authority level and is executed by the `mycelial-network-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The COSMIC authority level reflects the command's ability to influence cross-system behavior through verified pattern theorems that, once proven, become axioms within the platform's [Trinity Gate](@/glossary/trinity-gate.md) verification pipeline.

The formal verification approach bridges two complementary paradigms. Lean4 provides dependent type theory and a sophisticated tactic framework for constructive proofs about pattern structure, termination, and resource bounds. Prolog contributes backward-chaining inference for constraint satisfaction, rule validation, and logical consistency checking across the network topology. Together, they form a dual-verification system that catches classes of errors neither system would detect in isolation.

## Architecture

The `/mycelialize-formal` command is structured as a multi-phase verification pipeline that coordinates between the Elixir runtime, Lean4 proof assistant, and SWI-Prolog inference engine.

### Component Architecture

```
                    /mycelialize-formal
                           |
                   +-------+-------+
                   |               |
            Lean4 Prover    Prolog Reasoner
                   |               |
            +------+------+   +----+----+
            |      |      |   |    |    |
         Type   Termination  Rule  Topo  Constraint
         Check  Proof     Check  Query  Solver
            |      |      |   |    |    |
            +------+------+---+----+----+
                           |
                   Proof Aggregator
                           |
                   Trinity Gate Submit
```

### Internal Modules

| Module | Responsibility | Technology |
|--------|---------------|------------|
| `PatternTypeChecker` | Verifies pattern type signatures match propagation contracts | Lean4 |
| `TerminationProver` | Proves bounded termination for recursive propagation paths | Lean4 |
| `InvariantValidator` | Confirms pre/post conditions hold across transformations | Lean4 + Prolog |
| `TopologyReasoner` | Validates network graph properties (acyclicity, connectivity) | Prolog |
| `ConstraintSolver` | Solves resource and scheduling constraints for propagation plans | Prolog |
| `ProofAggregator` | Combines individual proofs into composite verification certificates | Elixir |

### Data Flow

Pattern definitions enter the pipeline as Elixir structs, are serialized into Lean4 type definitions and Prolog facts, processed through their respective verification engines, and the resulting proofs are deserialized back into platform-native proof certificates. These certificates are then submitted to the [Trinity Gate](@/glossary/trinity-gate.md) for final acceptance into the platform's verified knowledge base.

## Usage

```bash
# Basic formal verification of all pending patterns
/mycelialize-formal

# Verify specific pattern by name
/mycelialize-formal --pattern cascade_type_mismatch

# Verify all patterns in a specific domain
/mycelialize-formal --domain quality

# Run only Lean4 verification (skip Prolog)
/mycelialize-formal --engine lean4

# Run only Prolog verification (skip Lean4)
/mycelialize-formal --engine prolog

# Full verification with proof export
/mycelialize-formal --full --export-proofs ./proofs/

# Verify with specific timeout per proof
/mycelialize-formal --timeout 30s

# Dry run showing what would be verified
/mycelialize-formal --dry-run

# Verbose output with proof steps
/mycelialize-formal --verbose
```

### Practical Examples

```bash
# Verify the CASCADE pattern family before deployment
/mycelialize-formal --pattern "cascade_*" --full --verbose

# Verify termination proofs only (fastest check)
/mycelialize-formal --check termination --timeout 10s

# Export Lean4 proof artifacts for external review
/mycelialize-formal --engine lean4 --export-proofs ./audit/lean4/

# Verify pattern propagation preserves quality invariants
/mycelialize-formal --domain quality --check invariants
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--pattern` | `string` | `*` | Pattern name or glob to verify |
| `--domain` | `string` | all | Quality domain to scope verification |
| `--engine` | `enum` | `both` | Verification engine: `lean4`, `prolog`, or `both` |
| `--check` | `enum` | `all` | Check type: `types`, `termination`, `invariants`, `topology`, `constraints`, or `all` |
| `--full` | `flag` | false | Run complete verification suite including edge cases |
| `--timeout` | `duration` | `60s` | Maximum time per individual proof attempt |
| `--export-proofs` | `path` | none | Directory to export proof artifacts |
| `--dry-run` | `flag` | false | Show verification plan without executing |
| `--verbose` | `flag` | false | Show detailed proof steps and intermediate results |
| `--parallel` | `integer` | 4 | Number of parallel proof workers |
| `--cache` | `flag` | true | Use cached proofs for unchanged patterns |
| `--strict` | `flag` | false | Fail on any unverifiable pattern (no skipping) |

## Execution Flow

The formal verification process follows a deterministic sequence designed to maximize proof reuse and minimize redundant computation.

### Phase 1: Pattern Discovery and Serialization

The command scans the mycelial network registry for patterns matching the specified filters. Each pattern's structure, type signature, propagation rules, and invariant annotations are extracted and serialized into both Lean4 definitions and Prolog facts.

### Phase 2: Dependency Analysis

A dependency graph is constructed from the pattern relationships. Patterns are topologically sorted so that foundational patterns are verified before dependent ones. This allows proofs to reference previously established lemmas, dramatically reducing total verification time.

### Phase 3: Lean4 Verification

Each pattern undergoes three Lean4 verification passes:

1. **Type Checking** -- Pattern input and output types are verified against propagation contracts using dependent types.
2. **Termination Proving** -- Recursive propagation paths are proven to terminate using well-founded recursion and decreasing measures.
3. **Invariant Verification** -- Pre-conditions and post-conditions are proven to hold across all valid pattern transformations.

### Phase 4: Prolog Verification

Complementary Prolog verification runs in parallel:

1. **Rule Consistency** -- Propagation rules are checked for logical consistency (no contradictions).
2. **Topology Validation** -- Network graph properties are verified (reachability, bounded degree, acyclicity where required).
3. **Constraint Satisfaction** -- Resource constraints and scheduling requirements are verified as satisfiable.

### Phase 5: Proof Aggregation and Trinity Submission

Individual proofs from both engines are aggregated into composite verification certificates. These certificates include proof hashes, verification timestamps, engine versions, and dependency chains. The composite certificate is submitted to the [Trinity Gate](@/glossary/trinity-gate.md) for acceptance.

```
Discovery → Dependency Sort → Lean4 Verify → Prolog Verify → Aggregate → Trinity Submit
                                    ↓               ↓
                              Cache Check       Cache Check
                                    ↓               ↓
                              Proof Workers    Inference Engine
```

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/mycelialize](@/commands/mycelialize.md) | Upstream | Provides pattern definitions for verification |
| [/mycelialize-living](@/commands/mycelialize-living.md) | Upstream | Supplies evolved patterns requiring re-verification |
| [Trinity Gate](@/glossary/trinity-gate.md) | Downstream | Receives verified proof certificates |
| [/trinity](@/commands/trinity.md) | Peer | Shares verification infrastructure |
| [/lean](@/commands/lean.md) | Engine | Lean4 proof assistant execution |
| [/prolog](@/commands/prolog.md) | Engine | Prolog inference engine execution |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Verified patterns pass quality gates automatically |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Proof timing, success rates, cache hit ratios |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Framework | Epistemic axiom compliance for proof provenance |

## Best Practices

### When to Use Formal Verification

Formal verification through `/mycelialize-formal` is most valuable for patterns that are safety-critical, widely propagated, or foundational to other patterns. Not every pattern requires formal proofs; the command is designed for targeted, high-value verification rather than blanket coverage.

**Recommended for:**
- CASCADE patterns that affect multiple quality domains simultaneously
- Patterns with recursive propagation paths (termination must be proven)
- Patterns that modify other patterns (meta-patterns)
- Any pattern entering production for the first time

**Optional for:**
- Leaf patterns with no dependents
- Patterns with trivial propagation logic (single-step, no branching)

### Proof Caching Strategy

The command maintains a proof cache keyed by pattern content hash. When patterns change, only the affected pattern and its dependents require re-verification. Use `--cache` (enabled by default) to leverage this. When debugging proof failures, temporarily disable caching with `--no-cache` to ensure fresh verification.

### Timeout Tuning

Complex patterns with deeply nested recursion may exceed the default 60-second timeout. Increase the timeout for initial verification passes, then optimize the pattern structure to bring proof times within standard bounds. Patterns that consistently exceed 120 seconds likely need structural simplification.

### Proof Export for Audit

When operating under compliance requirements (NIS2, ZKB), use `--export-proofs` to generate audit-ready proof artifacts. These can be submitted to external verification authorities as evidence of formal correctness.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `LEAN4_TIMEOUT` | Lean4 proof exceeded timeout | Increase `--timeout` or simplify pattern structure |
| `PROLOG_INCONSISTENCY` | Contradictory rules detected | Review pattern propagation rules for logical conflicts |
| `TYPE_MISMATCH` | Pattern type signature does not match contract | Fix pattern type annotations to match expected interface |
| `NON_TERMINATION` | Cannot prove termination of recursive path | Add decreasing measure annotation or restructure recursion |
| `TOPOLOGY_CYCLE` | Cycle detected in acyclicity-required subgraph | Remove circular dependencies in pattern propagation graph |
| `CONSTRAINT_UNSAT` | Resource constraints unsatisfiable | Relax constraints or increase available resources |
| `PROOF_DEPENDENCY_MISSING` | Required lemma from dependent pattern not found | Verify dependent patterns first |
| `ENGINE_UNAVAILABLE` | Lean4 or Prolog runtime not accessible | Check installation: `lean --version`, `swipl --version` |

### Recovery Procedures

When a proof fails, the command outputs the specific step where verification broke down. For Lean4 failures, the output includes the tactic state at the point of failure. For Prolog failures, the failing query and its context are displayed. Use `--verbose` to get complete proof traces for debugging.

## Advanced Usage

### Custom Proof Tactics

Advanced users can supply custom Lean4 tactics for domain-specific patterns by placing `.lean` files in the `proofs/tactics/` directory. These tactics are automatically loaded and made available during verification.

```bash
# Verify using custom tactics
/mycelialize-formal --pattern my_pattern --tactics-dir ./proofs/custom-tactics/
```

### Incremental Verification

For large-scale verification campaigns, use incremental mode to verify only patterns that changed since the last successful run:

```bash
# Verify only changed patterns since last successful run
/mycelialize-formal --incremental --since last-success

# Verify patterns changed in the last 24 hours
/mycelialize-formal --incremental --since 24h
```

### Integration with CI/CD

Formal verification can be integrated into the CI/CD pipeline as a blocking gate:

```bash
# CI gate: verify all production patterns
/mycelialize-formal --domain production --strict --timeout 120s --export-proofs ./ci-proofs/
```

### Proof Composition

When verifying complex multi-pattern interactions, use the composition mode to build proofs that span multiple patterns:

```bash
# Verify composition of quality cascade patterns
/mycelialize-formal --compose "cascade_type_mismatch + cascade_dead_code + cascade_empty_check"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Unverifiable patterns are rejected, not silently skipped.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every verification claim is backed by a constructive proof.

The formal verification approach directly embodies the NO DOUBTS principle: claims about pattern correctness are not asserted through testing alone but proven through mathematical reasoning.

## Related Commands

- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-living](@/commands/mycelialize-living.md) - Living self-evolving intelligence with introspection, AST manipulation and agent swarms
- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/lean](@/commands/lean.md) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/trinity](@/commands/trinity.md) - Trinity system status and rigidity score verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/formal-verify](@/commands/formal-verify.md) - Formal verification of system properties and invariants

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)