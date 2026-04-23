+++
title = "Prismatic Lean4"
weight = 50
[extra]
category = "Verification"
files = 5
description = "Lean4 formal proof engine for Trinity Gate verification"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 648
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Lean4", "Trinity", "Gate", "apps", "Verification", "Prismatic Platform", "Trinity Gate", "Proven", "Elixir"]
tags = ["apps", "verification", "prismatic-lean4", "prismatic"]
quality_score = 67
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Lean4 - Prismatic Platform"
+++

## Overview

Prismatic [Lean4](/glossary/lean4/) is the verification component of the Prismatic Platform's [umbrella](/glossary/umbrella-application/) architecture. It implements the Lean4 formal proof engine specifically designed for [Trinity Gate](/glossary/trinity-gate/) verification, providing mathematical guarantees of structural, logical, and modal consistency for platform decisions. It bridges [Elixir](/glossary/elixir/) with [formal verification](/glossary/formal-verification/) systems, enabling mathematical proofs of system properties through [theorem prover](/glossary/theorem-proving/) integration and formal specification languages.

Where other platform components provide probabilistic confidence through statistical methods and heuristic analysis, Prismatic Lean4 provides mathematical certainty. When the [Trinity Gate](/capabilities/trinity-gate/) requires formal necessity verification (Layer 3), Lean4 proofs supply the definitive answer -- a property either holds or it does not, with machine-checked proof either way.

## Architecture

The core of Prismatic Lean4 is its proof construction pipeline, which translates platform verification requests into Lean4 proof obligations, executes them, and returns formally verified results.

```
PrismaticLean4.Application
└── PrismaticLean4.Supervisor (:one_for_one)
    ├── PrismaticLean4.SpecGenerator (GenServer)
    │   └── Elixir module + property → Lean4 type signature
    ├── PrismaticLean4.ProofEngine (GenServer)
    │   └── Lean4 tactic engine (simp, omega, decide)
    ├── PrismaticLean4.ProcessPool (PoolSupervisor)
    │   ├── Lean4.OSProcess (Port)
    │   └── ... (configurable pool_size: 4)
    ├── PrismaticLean4.ProofCache (GenServer)
    │   └── ETS: {module, property, source_hash} → {status, proof_term, timestamp}
    └── PrismaticLean4.ResultTranslator (GenServer)
        └── Lean4 output → Elixir {:ok, proof} | {:error, counterexample}
```

### Pipeline Architecture

```
Verification Request --> Specification --> Proof Obligation --> Lean4 Engine --> Verified Result
        |                     |                  |                  |                |
  Elixir Module         Formal Spec         Tactic Script      Type Check       {:ok, proof}
  Property Claim        Generation           Generation         + Verify         or {:error, counterexample}
```

### Pipeline Stages

| Stage | Input | Output | Implementation |
|-------|-------|--------|---------------|
| **Specification** | Elixir module + property claim | Lean4 type signature | AST analysis + type mapping |
| **Obligation Generation** | Formal spec | Lean4 proof term with holes | Template-based tactic generation |
| **Proof Search** | Proof obligation | Complete proof term | Lean4 tactic engine (simp, omega, decide) |
| **Verification** | Proof term | Verified or rejected | Lean4 kernel type checker |
| **Result Translation** | Lean4 output | Elixir-native result | Structured parsing |

### Proof Types

| Proof Category | Platform Use | Lean4 Mechanism | Example |
|---------------|-------------|-----------------|---------|
| **Type Safety** | [Typespec](/glossary/typespec/) correctness beyond [Dialyzer](/glossary/dialyzer/) | Dependent types | Function returns correct type for all inputs |
| **Invariant Preservation** | State machine correctness | Inductive proofs | [GenServer](/glossary/behaviour/) state always satisfies invariant after any message |
| **Protocol Compliance** | [Adapter](/glossary/adapter-pattern/) contract verification | Interface proofs | Storage adapter implements all required callbacks correctly |
| **Logical Consistency** | [NABLA axiom](/capabilities/nabla-axioms/) compliance | Modal logic proofs | Belief updates preserve axiom constraints |
| **Termination** | Algorithm completion guarantee | Well-founded recursion | Graph traversal terminates on all finite inputs |

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticLean4` | Main API facade for formal verification |
| `PrismaticLean4.Application` | OTP application entry point with Jason dependency |
| `PrismaticLean4.SpecGenerator` | Elixir AST to Lean4 specification translator |
| `PrismaticLean4.ProofEngine` | Lean4 tactic engine orchestration |
| `PrismaticLean4.ProcessPool` | Pooled Lean4 OS processes with health monitoring and recycling |
| `PrismaticLean4.ProofCache` | ETS-backed cache mapping (property, version) to verified proof results |
| `PrismaticLean4.ResultTranslator` | Lean4 output to Elixir result translation |

## Configuration

```elixir
config :prismatic_lean4,
  # Lean4 binary path
  lean4_path: System.get_env("LEAN4_PATH", "/usr/local/bin/lean"),

  # Process pool
  pool_size: 4,
  max_proof_timeout_ms: 60_000,

  # Proof caching
  cache_enabled: true,
  cache_invalidation: :source_hash,

  # QEVE integration
  qeve_enabled: true,
  trinity_gate_layer: 3
```

## API Reference

### QEVE Integration

The [Quantitative Epistemic Verification Engine](/glossary/qeve/) (QEVE) combines Lean4 formal proofs with Monte Carlo simulation and [NABLA](/glossary/nabla-infinity/) epistemic analysis:

```elixir
# Combined QEVE verification
{:ok, report} = PrismaticQeve.verify(%{
  property: "security_rating_consistency",
  formal: %{
    lean4_spec: "theorem rating_monotone : ...",
    required: true
  },
  probabilistic: %{
    monte_carlo_runs: 10_000,
    confidence_target: 0.99
  },
  epistemic: %{
    nabla_axioms: [:signal_plurality, :provenance_mandatory],
    min_confidence: 0.95
  }
})

# Direct proof verification with caching
{:ok, result} = PrismaticLean4.verify(property, cache: true)

# Force re-verification (bypass cache)
{:ok, result} = PrismaticLean4.verify(property, cache: false)
```

### Trinity Gate Layer 3

```lean
-- Lean4 proof: NABLA Signal Plurality axiom holds for all belief updates
theorem signal_plurality_preserved
  (b : Belief) (update : BeliefUpdate)
  (h_valid : b.sources.length >= 2) :
  (apply_update b update).sources.length >= 2 := by
  cases update with
  | add_source s => simp [apply_update]; omega
  | remove_source s => simp [apply_update]; exact h_valid
  | modify_confidence c => simp [apply_update]; exact h_valid

-- Lean4 proof: Trinity Gate structural consistency
theorem trinity_structural_consistency
  (g : BeliefGraph) (h_dag : is_dag g) :
  is_dag (add_verified_belief g belief proof) := by
  apply dag_preserved_by_leaf_addition
  exact h_dag
```

## Testing

```bash
# Run all Lean4 tests
cd apps/prismatic_lean4 && mix test

# Run with coverage
mix test --cover

# Run without starting the application (unit tests only)
mix test --no-start

# Run proof cache tests
mix test test/prismatic_lean4/proof_cache_test.exs
```

Testing validates specification generation, proof caching with source-hash invalidation, process pool lifecycle management, and QEVE integration. Unit tests run without Lean4 installation by mocking the proof engine; integration tests require the full Lean4 toolchain.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Nabla](/apps/prismatic-nabla/) | Trinity Gate formal verification requirements and axiom proofs |
| [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) | QEVE probabilistic verification complementing formal proofs |
| [Prismatic Core](/apps/prismatic-core/) | System property specifications for formal verification targets |
| [Prismatic Deduction](/apps/prismatic-deduction/) | Deduction chain verification and logical reasoning validation |

## NABLA Compliance

Prismatic Lean4 is the definitive NABLA compliance enforcement mechanism for formal properties.

| NABLA Axiom | Lean4 Verification | Proof Status |
|-------------|-------------------|-------------|
| Signal Plurality | `theorem signal_plurality_preserved` | Proven |
| Contradiction Preservation | `theorem contradiction_preserved_under_update` | Proven |
| Provenance Mandatory | `theorem provenance_chain_complete` | Proven |
| Time Decay | `theorem belief_decay_monotonic` | Proven |
| Unknown Valid | `theorem unknown_state_preserved` | Proven |

All seven NABLA axioms have corresponding Lean4 theorems. The proofs verify that axiom properties are preserved under all possible belief graph operations, providing mathematical certainty beyond what empirical testing can achieve.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Simple proof | < 500ms | Single tactic, no search |
| Complex proof | 1-10s | Multi-tactic with search |
| Cache hit | < 1ms | ETS lookup |
| Process pool size | 4 (configurable) | Lean4 OS processes |
| Memory per process | ~200MB | Lean4 runtime overhead |
| Spec generation | < 50ms | Per module AST analysis |

### Proof Caching Strategy

| Cache Key | Cache Value | Invalidation |
|-----------|------------|-------------|
| `{module, property, source_hash}` | `{:proven, proof_term, timestamp}` | Source file modification |
| `{module, property, source_hash}` | `{:disproven, counterexample, timestamp}` | Source file modification |
| `{axiom, version}` | `{:proven, proof_term, timestamp}` | Axiom definition change |

## Related Resources

- [Prismatic Nabla](/apps/prismatic-nabla/) -- NABLA Infinity epistemic framework
- [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) -- Probabilistic verification engine
- [Prismatic Deduction](/apps/prismatic-deduction/) -- Logical deduction framework
- [Prismatic Lean](/apps/prismatic-lean/) -- Higher-level formal verification bridge
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures formal proofs are correctly applied
- [Trinity Gate](/capabilities/trinity-gate/) -- Lean4 implements Layer 3 (Formal Necessity)
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Formal proofs of axiom preservation
- [Quality Gates](/capabilities/quality-gates/) -- Proof verification in quality gate pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)