+++
title = "Prismatic Mycelial Nx"
weight = 71
[extra]
icon = "cpu-chip"
color = "green"
description = "Nx-powered numerical computing for ML inference and tensor operations"
category = "AI"
files = "95"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 851
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Mycelial", "Nx-powered", "apps", "Prismatic Platform", "PrismaticMycelialNx", "Pipeline", "GenStage", "Contract"]
tags = ["apps", "ai", "prismatic-mycelial-nx", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Mycelial Nx - Prismatic Platform"
+++

## Overview

Prismatic Mycelial Nx provides the platform's computational backbone for distributed data processing, dependency graph analysis, computational caching, and pipeline orchestration. Drawing its name from [mycelial network](/glossary/mycelial-network/)s in biology -- decentralized, resilient systems that propagate information and resources across distributed nodes -- the application implements a graph-based computation model where data flows through interconnected processing stages with automatic backpressure, caching, and fault recovery. Rather than focusing narrowly on tensor operations, Mycelial Nx provides the infrastructure for building composable, observable, and self-healing data pipelines that underpin the platform's intelligence processing capabilities.

The module implements a directed acyclic graph (DAG) execution model where computational stages are connected through typed edges with propagation semantics. Each node in the computation graph represents a processing stage that can cache intermediate results, detect affected downstream consumers when inputs change, and participate in distributed consensus protocols for cross-node coordination. This architecture enables the platform to efficiently re-process only the portions of an intelligence pipeline affected by new data, rather than recomputing entire workflows from scratch.

The evolution subsystem provides a self-improving capability where pipeline configurations undergo genetic optimization, with safety gates and quality validators ensuring that evolutionary changes maintain or improve system behavior. This connects to the broader platform theme of autonomous self-improvement governed by rigorous verification gates.

## Architecture

```
PrismaticMycelialNx.Application
+-- Pipeline Subsystem
|   +-- Pipeline.Producer (GenStage)
|   +-- Pipeline.Processor (GenStage)
|   +-- Pipeline.Consumer (GenStage)
|   +-- Pipeline.CircuitBreaker
|   +-- Pipeline.Backpressure
|   +-- Pipeline.Event (structured event types)
|
+-- Graph Subsystem
|   +-- Graph.DAG (directed acyclic graph engine)
|   +-- Graph.Node (computation node abstraction)
|   +-- Graph.Edge (typed edge with propagation)
|
+-- Cache Subsystem
|   +-- Cache.ComputationalCache (content-addressed)
|   +-- Cache.Store (pluggable backends)
|   +-- Cache.Backend.ETS
|   +-- Cache.Hasher (deterministic hashing)
|   +-- Cache.Invalidator (dependency-aware)
|   +-- Cache.Compressor (result compression)
|
+-- DependencyGraph Subsystem
|   +-- DependencyGraph.Analyzer
|   +-- DependencyGraph.AffectedEngine
|   +-- DependencyGraph.GitIntegration
|   +-- DependencyGraph.FlowIntegration
|
+-- Sync Subsystem
|   +-- Sync.Coordinator (distributed coordination)
|   +-- Sync.VectorClock (causal ordering)
|   +-- Sync.CRDT (conflict-free replicated data)
|   +-- Sync.Consensus (agreement protocols)
|   +-- Sync.KnowledgeState
|   +-- Sync.StreamProducer / StreamConsumer
|
+-- Evolution Subsystem
    +-- Evolution.Orchestrator
    +-- Evolution.Strategy
    +-- Evolution.SafetyGate
    +-- Evolution.QualityValidator
    +-- Evolution.Rollback
    +-- Evolution.Metrics
    +-- Evolution.DSL
    +-- Evolution.BroadwayPipeline
```

```
Input Data --> DAG Scheduler --> Stage Execution --> Cache Check --> Compute/Retrieve
     |              |                |                 |                |
  Typed Events  Topological      GenStage           Content-Hash    Deterministic
  with Schema   Sort + Priority  Backpressure       Lookup          Execution
     |              |                |                 |                |
     +-- Affected Engine --+-- Circuit Breaker --+-- Invalidation --+
                           |
               Evolution Optimizer --> Safety Gate --> Quality Validator
```

The architecture separates concerns into five distinct subsystems. The Pipeline subsystem handles streaming data processing with GenStage backpressure. The Graph subsystem provides the DAG execution engine. The Cache subsystem implements content-addressed caching with dependency-aware invalidation. The Sync subsystem enables distributed coordination across cluster nodes. The Evolution subsystem drives autonomous optimization of pipeline configurations.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticMycelialNx` | Main API facade for pipeline construction and execution |
| `PrismaticMycelialNx.Application` | [OTP](/glossary/otp/) application entry point with supervision tree |
| `PrismaticMycelialNx.Graph.DAG` | Directed acyclic graph engine with topological execution ordering |
| `PrismaticMycelialNx.Graph.Node` | Computation node abstraction with lifecycle callbacks |
| `PrismaticMycelialNx.Graph.Edge` | Typed edge with propagation semantics and data transformation |
| `PrismaticMycelialNx.Pipeline.Producer` | GenStage producer for pipeline input streaming |
| `PrismaticMycelialNx.Pipeline.Processor` | GenStage processor with transformation and filtering |
| `PrismaticMycelialNx.Pipeline.Consumer` | GenStage consumer for result collection and dispatch |
| `PrismaticMycelialNx.Pipeline.CircuitBreaker` | Per-stage circuit breaker preventing cascade failures |
| `PrismaticMycelialNx.Cache.ComputationalCache` | Content-addressed cache with dependency-aware invalidation |
| `PrismaticMycelialNx.DependencyGraph` | Module dependency analysis with affected-file detection |
| `PrismaticMycelialNx.DependencyGraph.AffectedEngine` | Determines which pipeline stages need re-execution after input changes |
| `PrismaticMycelialNx.Sync.Coordinator` | Distributed coordination for cross-node pipeline execution |
| `PrismaticMycelialNx.Sync.VectorClock` | Causal ordering for distributed event streams |
| `PrismaticMycelialNx.Sync.CRDT` | Conflict-free replicated data types for distributed state |
| `PrismaticMycelialNx.Evolution.Orchestrator` | Autonomous pipeline optimization through evolutionary strategies |
| `PrismaticMycelialNx.Evolution.SafetyGate` | Verification gate ensuring evolutionary changes are safe |

## Core Protocols and Behaviours

The application defines a rich set of protocols and behaviours that enable composable, type-safe pipeline construction.

### Protocols

| Protocol | Purpose |
|----------|---------|
| `Composable` | Enables pipeline stage composition with `then/2` and `compose/2` operators |
| `Inspectable` | Provides structured introspection for debugging and monitoring |
| `Cacheable` | Marks computations eligible for content-addressed caching |
| `Graphable` | Enables nodes to participate in DAG execution |
| `Stageable` | Allows values to flow through GenStage pipeline stages |
| `Affectable` | Tracks which downstream stages are affected by input changes |
| `Hashable` | Deterministic content hashing for cache key generation |
| `Propagatable` | Defines how changes propagate through the computation graph |

### Behaviours

| Behaviour | Purpose |
|-----------|---------|
| `Node` | Contract for computation graph nodes with lifecycle callbacks |
| `Edge` | Contract for typed edges with transformation and filtering |
| `Stage` | Contract for GenStage pipeline stages with configuration |
| `Orchestrator` | Contract for pipeline execution coordinators |
| `Propagator` | Contract for change propagation strategies |
| `CacheBackend` | Contract for pluggable cache storage backends |

## Configuration

```elixir
config :prismatic_mycelial_nx,
  # Pipeline configuration
  default_concurrency: System.schedulers_online(),
  max_demand: 100,
  min_demand: 50,

  # Cache configuration
  cache_backend: PrismaticMycelialNx.Cache.Backend.ETS,
  cache_ttl: :timer.hours(1),
  cache_max_size_mb: 512,
  compression_enabled: true,

  # Circuit breaker
  circuit_breaker_threshold: 5,
  circuit_breaker_reset_ms: 30_000,

  # Evolution
  evolution_enabled: false,
  evolution_strategy: :genetic,
  safety_gate_enabled: true,

  # Sync
  vector_clock_enabled: true,
  crdt_backend: :g_counter,

  # Telemetry
  telemetry_prefix: [:prismatic_mycelial_nx]
```

## API Reference

```elixir
# Build and execute a computation DAG
{:ok, dag} = PrismaticMycelialNx.build_dag([
  {:fetch_data, fn -> fetch_osint_data() end},
  {:normalize, fn data -> normalize(data) end, depends_on: :fetch_data},
  {:enrich, fn data -> enrich_with_context(data) end, depends_on: :normalize},
  {:analyze, fn data -> run_analysis(data) end, depends_on: :enrich}
])
{:ok, results} = PrismaticMycelialNx.execute(dag)

# Detect affected stages after input change
{:ok, affected} = PrismaticMycelialNx.affected_stages(dag, changed: [:fetch_data])
# => [:normalize, :enrich, :analyze]

# Content-addressed caching
{:ok, cached} = PrismaticMycelialNx.Cache.ComputationalCache.get_or_compute(
  cache_key, fn -> expensive_computation() end)

# Dependency graph analysis
{:ok, deps} = PrismaticMycelialNx.DependencyGraph.analyze("apps/prismatic_signals")
# => %{modules: 12, dependencies: 34, cycles: 0}

# Evolutionary pipeline optimization
{:ok, optimized} = PrismaticMycelialNx.Evolution.optimize(pipeline_config,
  strategy: :genetic,
  generations: 50,
  fitness: &measure_throughput/1)
```

## Testing

```bash
# Run all Mycelial Nx tests
cd apps/prismatic_mycelial_nx && mix test

# Run with coverage
mix test --cover

# Run pipeline tests
mix test test/prismatic_mycelial_nx/pipeline

# Run cache tests
mix test test/prismatic_mycelial_nx/cache

# Run evolution tests
mix test test/prismatic_mycelial_nx/evolution

# Run benchmarks
mix mycelial_nx.test --benchmark
```

Testing includes unit tests for each protocol and behaviour implementation, integration tests for end-to-end DAG execution with caching, property-based tests for CRDT convergence and vector clock ordering, circuit breaker state transition tests, and benchmark suites measuring pipeline throughput and cache hit rates. The evolution subsystem has dedicated safety gate tests verifying that optimized configurations cannot degrade system behavior below established baselines.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Agents](/apps/prismatic-agents/) | Agent execution pipelines built on Mycelial Nx DAG infrastructure |
| [Prismatic Storage ETS](/apps/prismatic-storage-ets/) | ETS-backed computational cache for sub-microsecond result retrieval |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Pipeline execution metrics and cache performance monitoring |
| [Prismatic Modalities](/apps/prismatic-modalities/) | Multi-modal processing pipelines using DAG execution model |
| [Prismatic Signals](/apps/prismatic-signals/) | Signal processing pipeline built on GenStage infrastructure |
| [Prismatic Quality Intelligence](/apps/prismatic-quality-intelligence/) | Evolution subsystem informs quality rule optimization |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- every computation traceable through DAG execution path | Pipeline events carry full execution trace with stage identifiers |
| Signal Plurality | SOFT -- pipeline stages can merge signals from multiple sources | DAG fan-in nodes aggregate inputs before processing |
| Time Decay | HARD -- cached results carry TTL metadata | Cache entries expire based on configurable TTL and staleness policies |
| Source Independence | SOFT -- pipeline stages process inputs independently | Each stage operates in its own GenStage process with isolated state |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Pipeline stage throughput | 10K+ events/s | Per GenStage processor |
| Cache lookup (ETS) | < 1us | Content-hash based |
| DAG execution (10 nodes) | < 50ms | With cached intermediate results |
| Affected stage detection | < 5ms | Topological analysis |
| Circuit breaker overhead | < 0.1ms | Per-stage check |
| Vector clock comparison | < 0.5ms | Per event ordering |
| Evolution cycle (50 gen) | 5-30s | Background optimization |

## Related Resources

- [Prismatic Agents](/apps/prismatic-agents/) -- Agent execution leveraging Mycelial Nx pipeline infrastructure
- [Prismatic Storage ETS](/apps/prismatic-storage-ets/) -- ETS-backed computational cache backend
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Pipeline and cache performance metrics
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Combines graph-based, stream-based, and evolutionary approaches
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Pipeline provenance tracking and cached result time decay
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Pipeline execution observability and performance monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)