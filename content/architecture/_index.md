+++
title = "Architecture"
description = "Technical deep-dive into Prismatic Platform's deterministic, fault-tolerant architecture built on Elixir/OTP -- covering the BEAM runtime, supervision trees, storage adapters, event sourcing, and the epistemic pipeline"
sort_by = "weight"
template = "architecture/list.html"
page_template = "architecture/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
word_count = 3800
difficulty = "advanced"
image = "/images/sections/architecture.png"
image_alt = "Prismatic Platform architecture diagram showing OTP supervision trees and data flow"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
citation_style = "IEEE"
doi_placeholder = "10.prismatic/architecture-overview"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["umbrella-apps", "supervision-trees", "storage-adapters", "event-sourcing"]
glossary_terms = ["OTP", "BEAM", "3NL", "NABLA", "supervision-tree", "GenServer"]
keywords = ["Elixir OTP architecture", "BEAM virtual machine", "fault-tolerant system design", "supervision tree pattern", "event sourcing architecture", "epistemic pipeline design", "storage adapter layer", "distributed systems Elixir"]
tags = ["architecture", "elixir", "otp", "beam", "distributed-systems"]
see_also = ["apps", "technologies", "capabilities"]
architecture_components = 12
total_otp_apps = 93
beam_schedulers = 10
date_modified = "2026-02-23"
+++

Technical deep-dive into Prismatic Platform's deterministic, [fault-tolerant](@/glossary/fault-tolerance.md) architecture built on [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md). The platform runs as 93 OTP applications on a single [BEAM](@/glossary/beam.md) node, coordinated through [supervision trees](@/glossary/supervision-tree.md), [PubSub](@/glossary/pubsub.md) event buses, and a pluggable storage [adapter](@/glossary/adapter-pattern.md) layer -- achieving microsecond inter-service latency without the operational complexity of distributed [microservices](@/glossary/microservices.md).

## Abstract

This section documents the architectural decisions, runtime characteristics, and design patterns that underpin the Prismatic Platform. The architecture is organized around three core principles: **fault tolerance through OTP supervision** (every stateful component lives in a supervised process tree with automatic restart), **data consistency through [event sourcing](@/glossary/event-sourcing.md)** (system state is derived from an append-only event log, enabling full auditability and temporal queries), and **cognitive reliability through the [NABLA](@/glossary/nabla-infinity.md) [epistemic pipeline](@/glossary/epistemic-pipeline.md)** (all beliefs formed by the system pass a formal [Trinity Gate](@/glossary/trinity-gate.md) before influencing decisions).

The platform rejects the microservice-over-HTTP pattern in favour of a monolithic deployment of 93 OTP applications sharing a single BEAM virtual machine. This design eliminates network serialization overhead between components while preserving modularity through Elixir's [umbrella project](@/glossary/umbrella-application.md) structure and compile-time dependency enforcement.

## Introduction

### Why Elixir/OTP

The choice of Elixir on the BEAM VM is not incidental -- it directly addresses three requirements that disqualify most runtime environments:

1. **Soft real-time guarantees**: The BEAM scheduler provides preemptive scheduling across lightweight processes with sub-millisecond context switching, ensuring that no single computation starves others. This matters when 434+ AI agents, web dashboard connections, and background crawl jobs share the same runtime.

2. **Fault isolation without containers**: Each Erlang process has its own heap and garbage-collects independently. A crash in one process does not corrupt another's memory. OTP supervisors automatically restart failed processes according to configurable strategies, making the system [self-healing](@/glossary/self-healing.md) at the [process](@/glossary/process-isolation.md) level.

3. **[Hot code loading](@/glossary/hot-code-reload.md)**: The BEAM supports replacing module code in a running system without dropping connections or losing process state. While not used in production today, this capability enables zero-downtime deployments for future production scenarios.

### Architectural Layers

The platform's architecture follows four distinct layers, each with clear responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Web & API                                     │
│  Phoenix LiveView (4000) · REST API (4004) · WebSocket  │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Domain Applications                           │
│  Perimeter · DD · Hawkeye · AI Drift · OSINT · Agents  │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Platform Services                             │
│  Auth · Audit · Cache · PubSub · Compression · Search  │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Core Infrastructure                           │
│  Storage Adapters · Kernel · 3NL · Core Types · Config  │
├─────────────────────────────────────────────────────────┤
│  Layer 0: BEAM Runtime                                  │
│  Erlang VM · OTP · Schedulers · ETS · Distribution      │
└─────────────────────────────────────────────────────────┘
```

Dependencies flow strictly downward. Layer 4 may call Layer 3 and below; Layer 3 may call Layer 2 and below. Circular dependencies are rejected at compile time.

## Core Architecture Components

This section provides an overview of the 12 architectural subsystems documented in detail on their individual pages.

### OTP Supervision Trees

Every stateful application defines a supervision tree rooted in its `Application.start/2` callback. The platform uses three OTP restart strategies depending on process coupling:

| Strategy | Count | Pattern |
|----------|-------|---------|
| `:one_for_one` | 67 apps | Independent workers -- restart only the failed child |
| `:rest_for_one` | 14 apps | Sequential dependencies -- restart failed child and all started after it |
| `:one_for_all` | 12 apps | Tightly coupled -- restart all children when any fails |

The top-level supervisor for the entire platform uses `:one_for_one`, meaning a failure in the Perimeter application does not restart the Web application. This isolation is critical for operational stability.

```elixir
# Platform-level supervision structure (simplified)
defmodule Prismatic.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Prismatic.Config,
      {Phoenix.PubSub, name: Prismatic.PubSub},
      Prismatic.Repo,
      PrismaticWeb.Endpoint
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

**Deep dive**: [Supervision Trees](@/architecture/supervision-trees.md)

### Umbrella Application Structure

The 93 OTP applications are organized as an Elixir umbrella project. Each application resides in `apps/<name>/` with its own `mix.exs`, `lib/`, `test/`, and `priv/` directories. Inter-application dependencies are declared explicitly:

```elixir
# apps/prismatic_perimeter/mix.exs
defp deps do
  [
    {:prismatic_core, in_umbrella: true},
    {:prismatic_storage_core, in_umbrella: true},
    {:prismatic_osint_core, in_umbrella: true}
  ]
end
```

The umbrella structure provides microservice-like modularity (independent compilation, isolated testing) without microservice operational overhead (no service discovery, no network serialization, no distributed tracing).

**Deep dive**: [Umbrella Applications](@/architecture/umbrella-apps.md)

### Storage Adapter Architecture

The storage layer implements a [behaviour](@/glossary/behaviour.md)-based adapter pattern. All storage operations route through the `PrismaticStorage.Adapter` behaviour, allowing the platform to swap backends without changing domain code:

| Adapter | Backend | Latency | Use Case |
|---------|---------|---------|----------|
| **[ETS](@/glossary/ets.md)** | Erlang Term Storage | ~1 μs | Caches, sessions, hot data |
| **[Ecto](@/glossary/ecto.md)** | [PostgreSQL](@/glossary/postgresql.md) | ~2-10 ms | Persistent records, transactions |
| **[Meilisearch](@/glossary/meilisearch.md)** | Meilisearch | ~5-20 ms | Full-text search, faceted queries |
| **[KuzuDB](@/glossary/kuzudb.md)** | KuzuDB | ~3-15 ms | Graph queries, relationship traversal |
| **[Redis](@/glossary/redis.md)** | Redis | ~1-5 ms | Distributed cache, [rate limiting](@/glossary/rate-limiting.md) |

The adapter protocol enforces a uniform API across all backends:

```elixir
@callback store(key, value, opts) :: {:ok, term()} | {:error, term()}
@callback fetch(key, opts) :: {:ok, term()} | {:error, :not_found}
@callback delete(key, opts) :: :ok | {:error, term()}
@callback list(prefix, opts) :: {:ok, [term()]} | {:error, term()}
```

**Deep dive**: [Storage Adapters](@/architecture/storage-adapters.md)

### Event Sourcing

Critical subsystems use event sourcing for auditability and temporal queries. Rather than storing current state directly, the system persists an ordered sequence of domain events. Current state is derived by replaying events through a projection function:

```
Event Stream:  [UserCreated] → [RoleAssigned] → [PermissionGranted] → ...
                     ↓                ↓                  ↓
Projection:    %User{id: 1}    %User{role: :admin}  %User{perms: [:read, :write]}
```

This pattern provides complete audit trails, enables temporal queries ("what was the state at timestamp T?"), and supports retroactive bug fixes by re-projecting events through corrected logic.

**Deep dive**: [Event Sourcing](@/architecture/event-sourcing.md)

### Phoenix LiveView

Web interfaces are built with [Phoenix](@/glossary/phoenix.md) [LiveView](@/glossary/liveview.md), delivering real-time server-rendered UI without client-side JavaScript frameworks. Each LiveView process maintains a WebSocket connection and pushes DOM diffs to the browser:

| Dashboard | Route | Function |
|-----------|-------|----------|
| Main Dashboard | `/` | Platform overview, metrics, navigation |
| DD Cases | `/dd/cases` | Due diligence case management |
| Graph Explorer | `/dd/graph` | Entity relationship visualization |
| Perimeter EASM | `/perimeter` | Security ratings, asset discovery |
| AI Drift Monitor | `/drift` | AI decision drift detection |
| Jobs Dashboard | `/jobs` | Oban background job monitoring |

LiveView's process model means each connected user gets a dedicated Erlang process with its own state, crash isolation, and garbage collection -- no shared mutable state between sessions.

**Deep dive**: [Phoenix LiveView](@/architecture/phoenix-liveview.md)

### PubSub Event Bus

Inter-application communication for event-driven workflows uses Phoenix.PubSub backed by the Erlang `pg` module for local distribution:

```elixir
# Publisher (any application)
Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:scan_complete", {:scan, result})

# Subscriber (any application)
Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:scan_complete")

# handle_info in subscriber GenServer
def handle_info({:scan, result}, state) do
  # React to scan completion
  {:noreply, update_state(state, result)}
end
```

PubSub events are fire-and-forget with at-most-once delivery within the local BEAM node. For guaranteed delivery, the platform uses Oban jobs.

**Deep dive**: [PubSub](@/architecture/pubsub.md)

### Telemetry & Observability

The platform uses Erlang's [`:telemetry`](@/glossary/telemetry.md) library for metrics emission. Every significant operation emits telemetry events that are consumed by handlers for logging, metrics aggregation, and alerting:

```elixir
:telemetry.execute(
  [:prismatic, :perimeter, :scan],
  %{duration: duration_ms, assets_found: count},
  %{domain: domain, scan_type: :full}
)
```

Key telemetry dimensions: request latency, query duration, cache hit rates, agent response times, queue depths, error rates.

**Deep dive**: [Telemetry](@/architecture/telemetry.md)

### NABLA Epistemic Pipeline

The [NABLA Infinity](@/glossary/nabla-infinity.md) (∇∞) framework implements a 16-level epistemic pipeline ensuring that beliefs formed by the platform's AI agents meet formal consistency requirements before influencing decisions:

```
L0: Raw Signal → L1: Validated Signal → L2: Correlated Evidence
→ L3: Synthesized Belief → ... → L13: Decision-Ready Intelligence
→ Meta Level: Pipeline Self-Assessment
→ Consciousness Level: System Self-Awareness
```

Every belief must pass the **Trinity Gate** -- three independent consistency checks that must all succeed:

1. **Structural Consistency**: Graph-theoretic validation of the belief's logical structure
2. **Logical Consistency**: Rule-based evaluation against known axioms
3. **Formal Necessity**: Modal logic verification with optional Lean4 proof

**Deep dive**: [NABLA Framework](@/architecture/nabla-framework.md)

### PostgreSQL & KuzuDB

The platform uses PostgreSQL as its primary relational store (via Ecto) and [KuzuDB](@/glossary/kuzudb.md) as an embedded [graph database](@/glossary/knowledge-graph.md) for relationship-heavy queries:

- **PostgreSQL**: Entity records, audit logs, configuration, Oban job queues
- **KuzuDB**: Entity relationship graphs, influence networks, ownership chains

The dual-database architecture avoids forcing graph queries into SQL joins or flattening relational data into graph structures.

**Deep dive**: [PostgreSQL & KuzuDB](@/architecture/postgresql-kuzudb.md)

### Ollama Local AI

Local AI [inference](@/glossary/inference.md) via [Ollama](@/glossary/ollama.md) provides <3 second response times for code generation, content analysis, and decision support without external API dependencies:

| Model | Parameters | Response Time | Use Case |
|-------|-----------|---------------|----------|
| qwen3-coder | 7B | <3s | Code generation, refactoring |
| gpt-oss:20b | 20B | <5s | Complex reasoning, analysis |
| deepseek-coder | 6.7B | <3s | Code review, documentation |

The architecture includes automatic fallback to cloud APIs when local models are unavailable or when tasks exceed local model capabilities.

**Deep dive**: [Ollama Integration](@/architecture/ollama.md)

### Meilisearch

Full-text search across platform data uses Meilisearch, an embedded search engine providing typo-tolerant, faceted search with sub-50ms query times:

- **Indexed content**: Agents, commands, OSINT sources, applications, documentation
- **Features**: Typo tolerance, faceted filtering, ranking rules, synonym support
- **Deployment**: Embedded in the platform, no external service dependency

**Deep dive**: [Meilisearch](@/architecture/meilisearch.md)

### GraphQL

The platform exposes a [GraphQL](@/glossary/graphql.md) API alongside [REST](@/glossary/rest-api.md) for complex, nested data queries where clients need control over response shape:

- **Schema**: Auto-generated from Ecto schemas and domain types
- **Subscriptions**: Real-time updates via WebSocket for dashboard widgets
- **DataLoader**: N+1 query prevention through batched data loading

**Deep dive**: [GraphQL](@/architecture/graphql.md)

## Cross-Cutting Concerns

### 3NL (Three Nested Levels) Framework

All architectural components are organized according to the [3NL](@/glossary/three-nl.md) framework:

- **Level 1 (Strategic)**: Public APIs, facade modules, external interfaces
- **Level 2 (Tactical)**: Inter-application coordination, pipeline orchestration, agent messaging
- **Level 3 (Operational)**: OTP process internals, ETS operations, BEAM optimizations

The 3NL framework ensures that consumers at each level interact only with appropriate abstractions, preventing implementation details from leaking across boundaries.

### Error Handling Philosophy

The platform follows Erlang's "[let it crash](@/glossary/let-it-crash.md)" philosophy, augmented with structured error tuples at API boundaries:

- **Internal processes**: Let supervisors handle crashes and restarts
- **API boundaries**: Return `{:ok, result}` / `{:error, reason}` tuples
- **Web interfaces**: Convert error tuples to appropriate HTTP status codes and user-facing messages

This hybrid approach provides the self-healing benefits of OTP supervision while maintaining predictable error handling at system edges.

### Configuration Architecture

Configuration follows a layered precedence model:

```
Runtime Environment (highest precedence)
    ↓
config/runtime.exs
    ↓
config/{env}.exs (dev.exs, prod.exs, test.exs)
    ↓
config/config.exs
    ↓
Application defaults (lowest precedence)
```

Sensitive configuration (database credentials, API keys) is loaded exclusively from environment variables at runtime, never committed to source control.

## Performance Characteristics

### Runtime Metrics

| Metric | Value | Context |
|--------|-------|---------|
| **BEAM Schedulers** | 10 | Matches physical CPU cores |
| **Process Count (idle)** | ~2,500 | Supervised processes at startup |
| **Memory (idle)** | ~350 MB | All 93 apps loaded |
| **Boot Time** | ~8s | Cold start to all apps ready |
| **ETS Tables** | ~180 | Active tables at runtime |
| **GC Pauses** | <1ms | Per-process garbage collection |

### Compilation Performance

| Operation | Duration | Parallelism |
|-----------|----------|-------------|
| Full compile (clean) | ~45s | Up to 10 parallel compilers |
| Incremental compile | ~2-5s | Single module recompilation |
| Full test suite | ~90s | Concurrent test processes |
| Dialyzer analysis | ~120s | Incremental PLT updates |
| Credo analysis | ~15s | Parallel file checking |

## Security Architecture

### Process-Level Isolation

The BEAM VM provides natural security boundaries:

- **Memory isolation**: Processes cannot access each other's heap
- **[Message-based communication](@/glossary/message-passing.md)**: All inter-process data is copied, not shared
- **Scheduler fairness**: No process can monopolize CPU time (reduction counting)
- **Port isolation**: External program interaction through controlled ports

### Network Security

- **[TLS](@/glossary/tls.md) everywhere**: All external connections use TLS 1.3
- **API authentication**: [JWT](@/glossary/jwt.md) tokens with configurable TTL and refresh
- **Rate limiting**: Per-endpoint and per-client rate limiting via Token Bucket
- **CORS**: Strict origin whitelisting for browser clients
- **CSP**: Content Security Policy headers on all HTML responses

### Data Protection

- **Encryption at rest**: PostgreSQL TDE for sensitive tables
- **Encryption in transit**: TLS for all inter-service and client-facing connections
- **PII suppression**: Automated PII detection and removal in logs and exports
- **Audit trails**: Immutable, append-only audit log for all state-changing operations

## Conclusion

The Prismatic Platform's architecture demonstrates that a monolithic Elixir/OTP deployment can scale to 93 applications and 2.8 million lines of code while maintaining the modularity, testability, and fault-tolerance properties typically associated with distributed microservice architectures. The BEAM VM's process model, combined with OTP supervision trees and Elixir's umbrella project structure, provides a foundation that is simultaneously scalable, maintainable, and operationally simple.

The architectural components documented in this section -- supervision trees, storage adapters, event sourcing, PubSub, telemetry, the NABLA epistemic pipeline, and the various data stores -- compose into a coherent whole through the 3NL framework's layered abstraction model and the platform's strict dependency graph.

## References

### Architecture Pages

- [Supervision Trees](@/architecture/supervision-trees.md) -- OTP supervision patterns and restart strategies
- [Umbrella Applications](@/architecture/umbrella-apps.md) -- Project structure and dependency management
- [Storage Adapters](@/architecture/storage-adapters.md) -- Pluggable storage backend architecture
- [Event Sourcing](@/architecture/event-sourcing.md) -- Append-only event logs and projections
- [Phoenix LiveView](@/architecture/phoenix-liveview.md) -- Real-time server-rendered UI
- [PubSub](@/architecture/pubsub.md) -- Event-driven inter-application messaging
- [Telemetry](@/architecture/telemetry.md) -- Metrics, tracing, and observability
- [NABLA Framework](@/architecture/nabla-framework.md) -- Epistemic pipeline and Trinity Gate
- [PostgreSQL & KuzuDB](@/architecture/postgresql-kuzudb.md) -- Dual-database architecture
- [Ollama](@/architecture/ollama.md) -- Local AI inference integration
- [Meilisearch](@/architecture/meilisearch.md) -- Full-text search engine
- [GraphQL](@/architecture/graphql.md) -- Query API and subscriptions

### Platform Documentation

- [Applications](@/apps/_index.md) -- Complete application catalog
- [Technologies](@/technologies/_index.md) -- Technology stack reference
- [Platform Capabilities](@/capabilities/_index.md) -- Doctrines and quality enforcement

### External References

- [Erlang/OTP Design Principles](https://www.erlang.org/doc/design_principles/users_guide.html)
- [Elixir Getting Started](https://elixir-lang.org/getting-started/introduction.html)
- [Phoenix Framework Guides](https://hexdocs.pm/phoenix/overview.html)
- [The BEAM Book](https://blog.stenmans.org/theBeamBook/)

---

*Architecture documentation reflects the platform state as of 2026-02-06. Component counts and performance metrics are measured on a 10-core development machine running macOS.*

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
