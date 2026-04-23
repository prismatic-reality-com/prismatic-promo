+++
title = "Prismatic Lean"
weight = 26
[extra]
icon = "check-badge"
color = "blue"
description = "Formal verification bridge to Lean4 theorem prover for mathematical proofs"
category = "Verification"
files = "160"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 594
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Lean", "Formal", "Lean4", "apps", "Verification", "Prismatic Platform", "PrismaticLean", "Elixir", "Trinity Gate"]
tags = ["apps", "verification", "prismatic-lean", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Lean - Prismatic Platform"
+++

## Overview

Prismatic Lean provides a bridge between the [Elixir](/glossary/elixir/) platform and the [Lean 4](/glossary/lean4/) theorem prover, enabling formal mathematical verification of critical platform properties. It translates Elixir specifications into Lean 4 propositions, executes proof obligations, and integrates verification results into the platform's epistemic framework. This module serves as the formal necessity layer -- the third gate of the [Trinity Gate](/glossary/trinity-gate/) -- ensuring that critical claims are not merely consistent or logical but mathematically proven.

The verification bridge addresses a fundamental challenge in complex systems: how to guarantee that [security rating](/glossary/security-rating/) algorithms are monotonic, that compliance scoring never produces contradictory results, and that epistemic axioms hold under all conditions. While [property-based testing](/glossary/property-based-testing/) can demonstrate that properties hold for many random inputs, [formal verification](/glossary/formal-verification/) proves they hold for all possible inputs -- a qualitative difference in assurance level that matters for safety-critical decisions.

Prismatic Lean operates as part of the platform's [QEVE](/glossary/qeve/) (Quantitative Epistemic Verification Engine) alongside [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) for probabilistic analysis. Where Monte Carlo quantifies uncertainty through simulation, Lean provides certainty through mathematical proof.

## Architecture

The module runs as a supervised [OTP](/glossary/otp/) application with process-isolated Lean 4 toolchain management.

```
PrismaticLean.Application
└── PrismaticLean.Supervisor (:one_for_one)
    ├── PrismaticLean.SpecTranslator (GenServer)
    │   └── Elixir AST → Lean 4 definition translation
    ├── PrismaticLean.ProofScheduler (GenServer)
    │   └── Proof obligation queue with priority ordering
    ├── PrismaticLean.EnginePool (PoolSupervisor)
    │   ├── Lean4.Worker (Port process)
    │   ├── Lean4.Worker ...
    │   └── Lean4.Worker ...
    ├── PrismaticLean.ProofCache (GenServer)
    │   └── ETS: :lean_proof_cache (property, version → proof result)
    └── PrismaticLean.ResultParser (GenServer)
        └── Lean 4 output → Elixir {:ok, proof} | {:error, counterexample}
```

```
Elixir @spec/@type → Spec Translator → Lean 4 Definitions
         ↓                  ↓                   ↓
  Behavioral Contracts   AST Transform    Lean 4 Propositions
  Invariant Specs        Type Mapping     Proof Obligations
         ↓                                      ↓
  Property Generators ←→ Lean 4 Proof Engine → Verification Result
                                ↓                    ↓
                          Proof Artifacts    Trinity Gate Layer 3
                          Counterexamples    Confidence Score
```

The translator parses Elixir type specifications and behavioral contracts through AST analysis, mapping Elixir types to their Lean 4 equivalents. Proof execution is managed through a supervised port process that communicates with the Lean 4 toolchain, with result caching for incremental verification.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticLean` | Main API facade for formal verification requests |
| `PrismaticLean.Application` | OTP application entry point |
| `PrismaticLean.SpecTranslator` | Elixir `@type`/`@spec` to Lean 4 type definition mapping |
| `PrismaticLean.ProofScheduler` | Priority-based proof obligation queue management |
| `PrismaticLean.EnginePool` | Pooled Lean 4 OS process management with health monitoring |
| `PrismaticLean.ProofCache` | ETS-backed incremental proof caching with invalidation |
| `PrismaticLean.ResultParser` | Lean 4 output to Elixir result translation |
| `PrismaticLean.TrinityGate` | Layer 3 integration for formal necessity verification |

## Configuration

```elixir
config :prismatic_lean,
  # Lean 4 engine
  lean4_binary: System.get_env("LEAN4_PATH", "/usr/local/bin/lean"),
  pool_size: 4,
  proof_timeout_ms: 30_000,

  # Caching
  cache_enabled: true,
  cache_ttl_seconds: 86_400,

  # Trinity Gate
  trinity_gate_enabled: true,
  min_proof_coverage: 0.80
```

## API Reference

```elixir
# Verify a property formally through Lean 4
{:ok, proof} = PrismaticLean.verify(
  property: :monotonic_security_score,
  spec: PrismaticPerimeter.SecurityRating
)
# => %{status: :proven, proof_hash: "abc123...", time_ms: 2340}

# Generate proof obligations for a module
{:ok, obligations} = PrismaticLean.obligations(PrismaticNabla.Axioms)
# => [%{property: :signal_plurality, status: :pending}, ...]

# Verify all properties for a module
{:ok, report} = PrismaticLean.verify_all(module: PrismaticAlgorithms)
# => %{total: 12, proven: 10, failed: 1, timeout: 1}

# Extract counterexample from failed proof
{:ok, counter} = PrismaticLean.counterexample(failed_obligation)

# Check proof cache status
{:ok, stats} = PrismaticLean.cache_stats()
# => %{entries: 142, hit_rate: 0.87, total_proofs: 163}
```

## Testing

```bash
# Run all Lean verification tests
cd apps/prismatic_lean && mix test

# Run with coverage
mix test --cover

# Run proof engine integration tests (requires Lean 4 installation)
mix test test/prismatic_lean/engine_pool_test.exs

# Run spec translator unit tests
mix test test/prismatic_lean/spec_translator_test.exs
```

Tests cover specification translation accuracy, proof caching with invalidation, engine pool process management, and Trinity Gate integration. Integration tests require a Lean 4 installation and verify end-to-end proof execution with real theorem proving.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Nabla](/apps/prismatic-nabla/) | Trinity Gate Layer 3 provider for formal necessity verification |
| [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) | Complementary verification: proof (Lean) + simulation (Monte Carlo) |
| [Prismatic Algorithms](/apps/prismatic-algorithms/) | Primary target for formal verification of algorithmic properties |
| [Prismatic Safety](/apps/prismatic-safety/) | Safety-critical properties requiring formal proof guarantees |
| [Prismatic Lean4](/apps/prismatic-lean4/) | Low-level Lean 4 toolchain integration and process management |

## NABLA Compliance

Prismatic Lean is the primary implementer of NABLA's formal verification requirements.

| NABLA Axiom | Lean Enforcement | Implementation |
|-------------|-----------------|----------------|
| Signal Plurality | Proofs serve as independent verification signals | Proof results complement empirical signals |
| Contradiction Preservation | Failed proofs expose contradictions formally | Counterexample extraction preserves conflict evidence |
| Provenance Mandatory | All proofs include full provenance chain | Proof hash, spec version, timestamp tracked |
| Source Independence | Formal proofs are source-independent verification | Mathematical truth independent of empirical sources |

Trinity Gate Layer 3 passage requires at least one formal proof for each critical property claim. Lean provides the definitive answer: proven or disproven with machine-checked evidence.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Simple proof | < 500ms | Single tactic, no search |
| Complex proof | 1-10s | Multi-tactic with search |
| Cache hit | < 1ms | ETS lookup |
| Process pool size | 4 (configurable) | Lean 4 OS processes |
| Memory per process | ~200MB | Lean 4 runtime overhead |
| Spec translation | < 50ms | AST analysis per module |

## Related Resources

- [Prismatic Lean4](/apps/prismatic-lean4/) -- Low-level Lean 4 toolchain integration and process management
- [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) -- Probabilistic verification complementing formal proofs
- [Prismatic Testing](/apps/prismatic-testing/) -- Property-based testing as a complement to formal proofs
- [Prismatic Transcendence](/apps/prismatic-transcendence/) -- Consciousness axiom verification through formal methods
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Enforces evidence-based verification standards
- [Trinity Gate](/capabilities/trinity-gate/) -- Prismatic Lean serves as the Layer 3 formal necessity provider
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Formal verification of the 7 epistemic axioms

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)