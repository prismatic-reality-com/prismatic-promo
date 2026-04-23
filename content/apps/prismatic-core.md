+++
title = "Prismatic Core"
weight = 3
[extra]
icon = "cpu-chip"
color = "purple"
description = "Foundation library providing core abstractions, Monte Carlo simulation, bifurcation analysis, quantum-inspired optimization, mycelial coordination, zero-downtime evolution, and epistemic reasoning primitives for 141 umbrella applications"
category = "Foundation"
files = "180"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
word_count = 5200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Core", "Foundation", "Monte Carlo", "Bifurcation", "Quantum Optimization", "Mycelial", "Zero Downtime", "Epistemic", "OTP", "BEAM", "Elixir", "Protocols", "Behaviours", "Prismatic Platform", "PrismaticCore"]
tags = ["apps", "foundation", "prismatic-core", "prismatic", "monte-carlo", "bifurcation", "quantum", "epistemic"]
quality_score = 95
see_also = ["technologies", "agents", "glossary", "capabilities"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Core - Prismatic Platform"
+++

## Overview

Prismatic Core is the foundational library of the Prismatic Platform -- the single dependency shared by all 141 umbrella applications. Far beyond a simple utilities package, it provides a comprehensive computational and coordination substrate: [Monte Carlo](/glossary/monte-carlo-verification/) simulation with 25 probability distributions, bifurcation analysis for detecting regime changes in complex systems, quantum-inspired optimization for combinatorial problems, bio-inspired mycelial coordination networks, zero-downtime evolution infrastructure, JWT/RBAC authentication, and epistemic reasoning primitives.

A platform comprising 115 [OTP](/glossary/otp/) applications requires a shared foundation of types, protocols, utilities, and computational engines. Without centralization, each application would define its own entity representations, error types, simulation engines, and coordination mechanisms -- leading to incompatible interfaces, duplicated implementations, and inconsistent behavior. Cross-application communication requires agreed-upon data structures, protocols, and shared computational infrastructure. Prismatic Core provides this foundation, ensuring all applications speak the same language for entities, errors, configuration, mathematical computation, and cross-domain coordination.

The library establishes the platform's type system through entity protocols for consistent data access, serialization protocols for storage adapter compatibility, validation protocols for data integrity, and comparison protocols for ordering. It provides platform-wide configuration management, structured error types following the `{:ok, result} | {:error, reason}` convention, cryptographic utilities (SHA-256, HMAC-SHA256, AES-256-GCM), string manipulation with Czech diacritics support, date/time handling with timezone awareness, deterministic UUID generation via SHA-256 hashing, and collection utilities.

## Architecture

```
Every Prismatic Application (141 apps)
       |
  depends on
       |
  Prismatic Core
  +-- Protocols (Entity, Serializable, Validatable, Comparable)
  +-- Entities (base definitions, identity management)
  +-- Config (platform-wide configuration access)
  +-- Errors (structured error types)
  +-- Crypto (SHA-256, HMAC, AES-256-GCM)
  +-- Utils (strings, dates, collections, UUID)
  |
  +-- Monte Carlo Engine (25 distributions, GenStage pipeline, streaming)
  +-- Bifurcation Analysis (Hopf, pitchfork, saddle-node, transcritical)
  +-- Quantum Optimizer (annealing, tunneling, superposition search)
  +-- Mycelial Network (cross-domain coordination, signal routing)
  +-- Zero-Downtime Evolution (hot code upgrades, schema migration, rollback)
  |
  +-- Auth (JWT RS256/HS256, RBAC, rate limiting)
  +-- EpRun (epistemic reasoning: claims, evidence, nabla scores)
  +-- Behaviours (Agent, LLM, Storage, UniversalConvergence)
  +-- Schemas (LLM, Agent, Storage, Investigation)
  +-- Integration (Gateway, EventBus, Telemetry)
  +-- Runtime (PubSub topics, safe atoms, feature flags, git trees)
```

Applications import Core modules and call functions directly. [Protocol](/glossary/protocol/) dispatch is resolved at compile time for known types and at runtime for dynamic dispatch. The computational subsystems (Monte Carlo, Bifurcation, Quantum, Mycelial) are independently usable but designed to compose -- Monte Carlo feeds probability distributions into bifurcation analysis, quantum optimizer uses Monte Carlo for stochastic evaluation, and mycelial networks propagate signals between all subsystems.

## Monte Carlo Simulation Engine

The Monte Carlo engine is one of the most substantial subsystems in Prismatic Core, providing probabilistic simulation capabilities used across risk analysis, security assessment, uncertainty quantification, and AI calibration.

### 25 Probability Distributions

The engine implements a comprehensive distribution library, each conforming to the `Distribution` behaviour with callbacks for sampling, PDF/CDF computation, moment calculation, and parameter estimation.

**Continuous (15)**: Normal, Log-Normal, Beta, Exponential, Gamma, Uniform, Weibull, Cauchy, Pareto, Triangular, Student-t, Gumbel, Laplace, Von Mises, Chi-Squared

**Discrete (7)**: Poisson, Bernoulli, Binomial, Geometric, Negative Binomial, Hypergeometric, Zipf

**Multivariate (3)**: Multinomial, Dirichlet, F-Distribution

### Streaming Architecture

The simulation pipeline uses [GenStage](/glossary/genstage/) for demand-driven backpressure management:

```
Producer (sampling) --> Processor (simulation) --> Consumer (collection)
                                                        |
                                              PubSub streaming
                                              (live dashboards)
```

Early convergence detection monitors result stability and terminates runs once statistical significance thresholds are met. Flow-based parallel execution distributes iterations across all available CPU cores. Windowed simulation provides periodic statistics for real-time monitoring.

### DSL for Simulation Workflows

The Monte Carlo DSL provides a declarative interface for defining complex simulation scenarios:

```elixir
alias PrismaticCore.MonteCarlo

# Risk simulation with multiple uncertain parameters
{:ok, result} = MonteCarlo.simulate(%{
  model: :breach_probability,
  parameters: %{
    vuln_count: {:normal, 12, 3},
    patch_time: {:lognormal, 30, 10},
    attack_frequency: {:poisson, 0.1}
  },
  iterations: 100_000
})

# Sensitivity analysis identifying key risk drivers
{:ok, sensitivity} = MonteCarlo.sensitivity(result)
# => %{patch_time: 0.62, vuln_count: 0.31, attack_frequency: 0.07}

# Value at Risk and Expected Shortfall
var_99 = MonteCarlo.value_at_risk(samples, 0.99)
cvar_95 = MonteCarlo.expected_shortfall(samples, 0.95)
```

### Applications

| Domain | Monte Carlo Use Case |
|--------|---------------------|
| **Security Ratings** | Confidence intervals on A-F grades via breach probability modeling |
| **OSINT Analysis** | Source reliability estimation through repeated assessment |
| **Risk Assessment** | Portfolio-level risk aggregation with correlated scenarios |
| **AI Calibration** | Bootstrap confidence intervals on model performance metrics |
| **Investment ROI** | Security investment return modeling under uncertainty |

## Bifurcation Analysis

The bifurcation subsystem provides mathematical framework for analyzing critical transitions in complex systems -- detecting when systems shift qualitatively from one behavioral regime to another. This is particularly relevant for AI drift detection, market phase transitions, and risk tipping points.

### Bifurcation Types

| Type | Physical Meaning | Detection Signature |
|------|-----------------|---------------------|
| **Hopf** | System starts oscillating (fixed point to limit cycle) | Complex eigenvalues cross imaginary axis |
| **Pitchfork** | Symmetry breaks, two new stable states emerge | Eigenvalue passes through zero with cubic nonlinearity |
| **Saddle-Node** | Equilibrium suddenly appears or disappears (sudden jumps) | Two eigenvalues collide and annihilate |
| **Transcritical** | Stable and unstable equilibria exchange roles | Eigenvalue passes through zero with stability exchange |

### Stability Analysis

The `stability.ex` module provides Lyapunov stability analysis, eigenvalue computation, and basin of attraction estimation. These mathematical tools determine whether a system near an equilibrium point will return to it (stable), diverge away (unstable), or remain at the boundary (marginally stable).

```elixir
# Detect regime change in AI system behavior
{:ok, result} = PrismaticCore.Bifurcation.detect_bifurcation(system_data, opts)
# => %{type: :hopf, parameter_value: 3.14, confidence: 0.92}

# Parameter sweep across a range to find transition points
{:ok, sweep} = PrismaticCore.Bifurcation.parameter_sweep(
  system_fn, {0.0, 10.0}, steps: 100
)
```

### Applications

| Domain | Bifurcation Use Case |
|--------|---------------------|
| **AI Drift Detection** | Monitoring when AI system behavior undergoes qualitative regime change |
| **Market Analysis** | Detecting phase transitions in economic indicators (boom-bust cycles) |
| **Risk Assessment** | Identifying tipping points in risk profiles (gradual accumulation to crisis) |
| **Agent Ecosystem** | Detecting emergent collective behavior shifts in 530+ agent populations |
| **Security Monitoring** | Identifying when attack surface complexity crosses critical thresholds |

The key insight: many real-world systems do not degrade linearly. They remain stable until a parameter crosses a critical threshold, then shift abruptly to a qualitatively different regime. Bifurcation analysis mathematically characterizes these transitions, enabling early warning before the tipping point is reached.

## Quantum-Inspired Optimization

The quantum optimizer implements optimization algorithms inspired by quantum mechanical principles -- simulated quantum annealing, quantum tunneling, superposition search, and entangled coordination -- applied to combinatorial and continuous optimization problems.

### Conceptual Model

```
Problem --> Hamiltonian --> Quantum Annealing --> Measurement --> Solution
                 |                  |
                 +-- Tunneling      +-- Superposition Search
                 +-- Entanglement   +-- Temperature Schedule
```

**No quantum hardware required.** These are classical algorithms that leverage quantum-mechanical heuristics to escape local optima more effectively than traditional approaches.

### Modules

| Module | Purpose |
|--------|---------|
| `quantum_state.ex` | Superposition of candidate solutions with amplitudes |
| `quantum_annealing.ex` | Thermal + quantum fluctuations to escape local minima |
| `quantum_tunneling.ex` | Probabilistic barrier penetration for escaping energy wells |
| `superposition_search.ex` | Parallel evaluation of multiple candidates simultaneously |
| `hamiltonian.ex` | Encodes optimization problems as energy minimization |
| `entangled_coordination.ex` | Entanglement-inspired coordination for dependent variables |

### Applications

| Problem | How Quantum Optimizer Helps |
|---------|---------------------------|
| **Agent Task Assignment** | Optimal allocation of 530+ agents to concurrent tasks (combinatorial) |
| **OSINT Source Selection** | Best combination of 157 OSINT tools for a given query (subset selection) |
| **Risk Portfolio Optimization** | Optimal risk-return tradeoffs in multi-objective space |
| **Decision Threshold Calibration** | Escaping local optima in FPR/TPR optimization landscape |
| **Security Rating Composition** | Optimal weighting of security factors for rating computation |

The quantum optimizer integrates naturally with Monte Carlo for stochastic objective function evaluation and with the mycelial network for distributing optimization across domains.

## Mycelial Coordination Network

Bio-inspired coordination network modeled after mycelial (fungal) networks in nature. In biology, mycelial networks connect trees across forests, sharing nutrients and warning signals. In Prismatic Core, the mycelial network connects platform domains, propagating patterns and sharing resources.

### Architecture

```
Monte Carlo --+
NABLA --------+-- Mycelial Hub --+-- Signal Router --> Subscribers
Bifurcation --+                  |
Agents -------+                  +-- Pattern Store
```

### Signal Types

Every signal carries typed metadata enabling intelligent routing:

| Property | Purpose |
|----------|---------|
| **Type** | What kind of information (convergence, anomaly, resource_request) |
| **Source domain** | Where it originated (monte_carlo, nabla, agents) |
| **Confidence** | Numeric confidence level (0.0 - 1.0) |
| **Decay** | Time-based decay function for signal relevance |
| **Provenance** | Full chain of transformations since signal creation |

### Applications

- **Cross-domain anomaly propagation**: Drift detected in one domain automatically alerts all related domains
- **Resource coordination**: Monte Carlo engine shares idle CPU capacity with other computational subsystems
- **Emergent pattern detection**: Independent subsystems collaboratively identify patterns none could detect alone
- **Convergence signal sharing**: NABLA epistemic engine and Monte Carlo simulation share convergence data

The mycelial network enables the platform to behave as an integrated organism rather than a collection of isolated services -- exactly the kind of cross-cutting coordination that makes 115-app ecosystems manageable.

## Zero-Downtime Evolution

Infrastructure for evolving the running system without downtime -- hot code upgrades, schema migrations, architecture transformations, and multi-level rollback capabilities. Essential for production deployment on [Fly.io](/glossary/fly-io/) where service interruption is unacceptable.

### Evolution Pipeline

```
Pre-Check --> Checkpoint --> Evolution --> Health Check --> Commit
    |              |             |              |
    +-- Abort      +-- Restore   +-- Rollback   +-- Rollback
```

### Modules

| Module | Purpose |
|--------|---------|
| `architecture_evolution.ex` | High-level architecture transformation orchestration |
| `checkpoint_manager.ex` | System state capture and restore -- bulletproof rollback |
| `health_monitor.ex` | Continuous health monitoring during evolution operations |
| `module_evolution.ex` | Individual module hot-swap and code reloading |
| `rollback_system.ex` | Multi-level rollback: module, schema, architecture |
| `safety_system.ex` | Safety gates and invariant enforcement during evolution |
| `schema_evolution.ex` | Database schema migration during live operation |

### Checkpoint Types

| Type | Scope | Storage |
|------|-------|---------|
| **System** | Full application state, supervision trees, configs | ETS (dev) / Disk (prod) |
| **Operation** | Single operation with params and rollback instructions | In-memory |
| **Schema** | Database schema state with migration tracking | Persistent |

### Safety System

Pre-evolution invariant checks, continuous health monitoring during transformation, automatic rollback on health degradation, post-evolution verification with configurable thresholds, and immutable checkpoint history for forensic analysis. The system ensures that any evolution step can be reversed atomically if the running system shows degradation.

## Authentication & Authorization

Production-ready security infrastructure providing three complementary mechanisms:

### JWT Token System

RS256 (asymmetric) and HS256 (symmetric) JWT issuance and verification with configurable claims, expiration, and audience validation. The system supports key rotation for zero-downtime secret migration.

### Role-Based Access Control (RBAC)

GenServer-based hierarchical RBAC with ETS-backed permission storage:

```
admin
  +-- manager
       +-- operator
            +-- viewer (read-only)
```

Permissions are stored as `{role, resource, action}` tuples with role hierarchy enabling implicit permission inheritance. ETS storage provides sub-microsecond permission lookups suitable for per-request authorization.

### Rate Limiting

Sliding window rate limiter with configurable windows, limits, and granularity. Supports per-user, per-IP, and per-endpoint limiting with ETS-backed token buckets.

```elixir
# JWT issuance
{:ok, token} = PrismaticCore.Auth.JWT.sign(%{user_id: "123", role: :admin})

# RBAC check
:ok = PrismaticCore.Auth.RBAC.authorize(:manager, :reports, :read)

# Rate limiting
case PrismaticCore.Auth.RateLimiter.check("user:123", :api_calls) do
  :ok -> proceed()
  {:error, :rate_limited} -> reject()
end
```

## Epistemic Reasoning (EpRun)

The EpRun subsystem provides data structures for epistemic reasoning -- versioned claims with smart constructors, evidence chains, and NABLA-compatible scoring. This is the foundation for the platform's approach to treating beliefs as first-class versioned entities rather than bare boolean flags.

### Core Concepts

| Concept | Implementation |
|---------|---------------|
| **Claim.V1** | Versioned claim with immutable fields and smart constructor guards |
| **Evidence chain** | Linked list of supporting/contradicting evidence with provenance |
| **NABLA score** | Composite epistemic confidence respecting NABLA axioms |
| **IR Bridge** | Intermediate Representation / PVM bridge for cross-system reasoning |

### Smart Constructors

Claims cannot be created with invalid state. The `Claim.V1` module enforces invariants at construction time through guard functions:

```elixir
# Smart constructor ensures valid claim
{:ok, claim} = EpRun.Claim.V1.new(%{
  statement: "Target system shows drift",
  confidence: 0.87,
  evidence: evidence_chain,
  source: :monte_carlo_simulation
})
```

This approach prevents the "magic constants everywhere" problem by making epistemic state explicit, versioned, and constrained.

## Protocols & Type System

The protocol layer establishes the platform's type system, ensuring consistent data handling across all 115 applications:

| Protocol | Purpose | Callbacks |
|----------|---------|-----------|
| `Entity` | Identity, type resolution, metadata access | `id/1`, `type/1`, `metadata/1` |
| `Serializable` | Storage-compatible serialization/deserialization | `serialize/1`, `deserialize/2` |
| `Validatable` | Data validation with structured error reporting | `validate/1`, `validate!/1` |
| `Comparable` | Ordering and equality comparison | `compare/2`, `equal?/2` |

```elixir
defprotocol PrismaticCore.Entity do
  @spec id(t()) :: String.t()
  def id(entity)

  @spec type(t()) :: atom()
  def type(entity)

  @spec metadata(t()) :: map()
  def metadata(entity)
end
```

Czech diacritics normalization provides bidirectional conversion between accented Czech characters and their ASCII equivalents, enabling fuzzy matching in [entity resolution](/glossary/entity-resolution/).

## Behaviours

Core behaviours define standard contracts for platform component implementations:

### Primary Behaviours

| Behaviour | Contract | Implementations |
|-----------|----------|-----------------|
| `Agent` | `start_link`, `handle_task`, `get_capabilities`, `health_check` | 530+ agents |
| `LLM` | `chat`, `stream`, `embed`, `health_check`, `list_models` | OpenAI, Ollama, Anthropic |
| `Storage` | `get`, `put`, `delete`, `exists?`, `get_batch`, `health_check` | ETS, Ecto, Meilisearch, KuzuDB |

### Extended Behaviours

| Behaviour | Purpose |
|-----------|---------|
| `UniversalConvergence` | Cross-domain convergence detection across Monte Carlo, NABLA, Mendel |
| `BlackboardFrameProtocol` | Frame-based communication standard for multi-agent coordination |
| `HealthCircuitBridge` | Health monitoring bridge with circuit breaker integration |

## Schemas

Domain-specific [Ecto](/glossary/ecto/) schemas organized by concern:

**LLM Domain**: Agent configurations (provider, model, system prompt), Memory types (short-term, long-term, vector, episodic), Prompt templates with variable interpolation

**Agent Domain**: Registry (agent registration and discovery), Execution (task tracking with timestamps)

**Storage Domain**: Adapter configurations (backend type, connection params)

**Investigation Domain**: OSINT investigation schemas with evidence linking

## Runtime & Integration

### PubSub Topic Registry

Compile-time constants for all platform PubSub channels:

```
prismatic:heartbeat          -- Global system pulse (1Hz)
prismatic:run:*              -- Orchestration lifecycle
prismatic:step:*             -- Step execution events
prismatic:commands           -- UI --> System commands
prismatic:mendel:policy      -- Meta-agent optimization
```

### Event Payload Contract

All events include version, ISO8601 timestamp, agent identity, and event-specific data -- ensuring cross-system interoperability.

### Git Trees (~100x faster file operations)

The `git_trees` module provides file system operations using `git ls-tree` instead of `find/ls -R`, achieving ~100x speedup on large repositories (80ms vs 500ms+ for 48,000 files).

### Integration Gateway

The integration layer provides `Gateway` (external service routing), `EventBus` (internal event distribution), and `UnifiedTelemetry` (standardized metrics emission).

## Configuration

```elixir
config :prismatic_core,
  environment: :prod,
  timezone: "Europe/Prague",
  locale: :cs,
  crypto_key_env: "PRISMATIC_CRYPTO_KEY"
```

Minimal by design. Environment determines runtime behavior. Timezone defaults to Prague for Czech-centric operations. Crypto key sourced from environment variables, never committed to source code.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Protocol dispatch | < 1 us | Compiled dispatch for known types |
| SHA-256 hash | < 10 us | NIF-backed Erlang crypto |
| String normalization | < 50 us | Unicode character mapping |
| Config lookup | < 1 us | Application env read |
| Monte Carlo (10K) | < 100 ms | Single parameter, single core |
| Monte Carlo (100K) | 1-5 s | Multi-parameter, parallel |
| Bifurcation detection | < 500 ms | Eigenvalue computation |
| Quantum annealing step | < 1 ms | Per iteration |
| RBAC permission check | < 1 us | ETS lookup |
| JWT verification | < 100 us | RS256 signature check |

[Pure function](/glossary/pure-function/)s with no shared state for the utility layer. Infinitely concurrent. Computational subsystems (Monte Carlo, Bifurcation, Quantum) use supervised processes for resource management.

## Testing

Protocol implementation tests verify correct dispatch for all supported types. Error type tests verify [pattern matching](/glossary/pattern-matching/) and message formatting. Crypto tests verify hash computation against known test vectors. Cross-application integration tests verify that entities serialized by one application can be deserialized by another through shared protocols.

Property-based tests use StreamData generators to produce random strings, dates, and entity data, verifying that serialization roundtrips preserve data integrity and that Czech normalization is idempotent. Monte Carlo distribution tests verify statistical moments against theoretical values. Bifurcation tests verify detection against known dynamical systems with analytically computed transition points.

## NABLA Compliance

As the foundational library, Prismatic Core provides the building blocks that other modules use to implement [NABLA](/glossary/nabla-infinity/) compliance:

| NABLA Axiom | Core Contribution | Implementation |
|-------------|------------------|----------------|
| Provenance Mandatory | Entity protocol includes metadata with creation timestamps | Protocol enforces provenance fields on all entity types |
| Signal Plurality | Monte Carlo produces probabilistic signals requiring corroboration | Simulation results are one signal among many, never sole basis |
| Contradiction Preservation | Bifurcation analysis preserves multi-modal distributions | Bimodal and conflicting scenarios explicitly surfaced |
| Unknown Valid | EpRun claims have explicit uncertainty representation | Structured errors and claims distinguish "not found" from "unknown" |
| Time Decay | Mycelial signals carry time-based decay functions | Signal relevance decreases as input conditions age |

## The AI Drift Calibration Pipeline

One of the most powerful demonstrations of Prismatic Core's subsystem composition is the AI Drift calibration pipeline, where multiple core subsystems work together:

```
1. Monte Carlo     --> Bootstrap confidence intervals on FPR/TPR
2. Bifurcation     --> Detect regime changes in detection behavior
3. Quantum Optimizer --> Find optimal threshold minimizing expected cost
4. Mycelial        --> Propagate calibration signals across detection domains
5. EpRun           --> Track calibration claims with versioned evidence
```

This pipeline replaces ad-hoc "pinata-style" threshold tuning with a principled, reproducible, and monitorable calibration system where every decision is:

- **Derived** from cost function optimization (not magic constants)
- **Versioned** as an epistemic claim with full provenance
- **Monitored** for regime changes via bifurcation analysis
- **Distributed** across domains via mycelial coordination

## Integration Points

| Relationship | Description |
|-------------|-------------|
| **Dependents** | All 115 Prismatic applications |
| **Dependencies** | None (Elixir stdlib + OTP only) |
| **[Prismatic Algorithms](/apps/prismatic-algorithms/)** | Nx-based implementations consuming Core's Monte Carlo engine |
| **[Prismatic Monte Carlo](/apps/prismatic-monte-carlo/)** | Full-featured Monte Carlo app built on Core's simulation primitives |
| **[Prismatic Nabla](/apps/prismatic-nabla/)** | Epistemic framework using Core's EpRun claims and mycelial signals |
| **[Prismatic Perimeter](/apps/prismatic-perimeter/)** | Security ratings using Core's Monte Carlo for confidence intervals |

## Related Resources

- [Elixir Protocols](https://hexdocs.pm/elixir/protocols.html) -- Protocol documentation
- [Erlang crypto](https://www.erlang.org/doc/man/crypto.html) -- Cryptographic functions
- [Prismatic Algorithms](/apps/prismatic-algorithms/) -- Nx-based calibration and drift detection algorithms
- [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) -- Full Monte Carlo simulation application
- [Elixir Architect](/agents/elixir-architect/) -- Ensures Core protocols follow OTP best practices
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews foundational abstraction design
- [Trinity Gate](/capabilities/trinity-gate/) -- Monte Carlo provides probabilistic verification complement
- [Quality Gates](/capabilities/quality-gates/) -- Core protocols verified through comprehensive contract tests

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
