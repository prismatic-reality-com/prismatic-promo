+++
title = "Applications"
description = "Complete catalog of Prismatic Platform's 90+ OTP umbrella applications spanning core infrastructure, intelligence modules, storage adapters, web interfaces, and autonomous evolution systems"
sort_by = "weight"
template = "apps/list.html"
page_template = "apps/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
word_count = 3500
difficulty = "intermediate"
image = "/images/sections/apps.png"
image_alt = "Prismatic Platform umbrella applications architecture overview"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
citation_style = "IEEE"
doi_placeholder = "10.prismatic/applications-overview"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["prismatic-api", "prismatic-web", "prismatic-perimeter"]
glossary_terms = ["OTP", "3NL", "AIAD", "umbrella", "supervision-tree"]
keywords = ["Elixir umbrella applications", "OTP application architecture", "fault-tolerant microservices", "BEAM supervision tree", "modular application design", "Elixir OTP apps", "umbrella project structure", "independent deployable apps"]
tags = ["elixir", "otp", "architecture", "applications", "umbrella"]
see_also = ["architecture", "agents", "technologies"]
total_apps = 93
total_elixir_files = 6652
total_loc_millions = "2.8"
date_modified = "2026-02-23"
+++

93 [OTP](/glossary/otp/) [umbrella](/glossary/umbrella-application/) applications forming the Prismatic Platform -- from core infrastructure and storage adapters through intelligence modules and autonomous evolution systems to production web interfaces. Each application is a self-contained OTP application with its own [supervision tree](/glossary/supervision-tree/), configuration, and test suite, communicating through well-defined public APIs following the [3NL](/glossary/three-nl/) architectural framework.

## Abstract

The Prismatic Platform's application architecture follows the Elixir/OTP umbrella pattern, organizing 93 distinct OTP applications into a cohesive, [fault-tolerant](/glossary/fault-tolerance/) ecosystem. Each application owns its supervision tree, isolates its [failure domain](/glossary/process-isolation/), and exposes functionality exclusively through a public facade module. This document catalogs the complete application landscape, explains the architectural rationale behind the umbrella structure, and provides guidance for understanding how applications compose into the platform's capabilities.

The umbrella approach delivers three critical properties that monolithic architectures cannot: **independent deployability** (applications can be compiled and tested in isolation), **fault isolation** (a crash in one application's supervision tree does not propagate to others), and **clear dependency graphs** (inter-application dependencies are explicit in `mix.exs` and enforced at compile time).

## Introduction

### The Umbrella Architecture Decision

The decision to structure Prismatic as an umbrella project rather than a monolith or [microservice](/glossary/microservices/) mesh reflects a deliberate architectural trade-off. [Elixir](/glossary/elixir/) umbrella projects provide the modularity benefits of microservices -- clear boundaries, independent testing, explicit dependencies -- without the operational complexity of distributed deployment, service discovery, and network-based inter-service communication.

Within a single [BEAM](/glossary/beam/) VM, all 93 applications share the same Erlang distribution node. They communicate via direct function calls, [message passing](/glossary/message-passing/) between named processes, and [PubSub](/glossary/pubsub/) events -- all happening in-process with microsecond latency rather than the millisecond-scale overhead of HTTP or gRPC between separate services.

### Architectural Principles

Every application in the umbrella adheres to these design constraints:

1. **Single Responsibility**: Each app owns exactly one domain. `prismatic_auth` handles authentication; `prismatic_audit` handles audit logging. No overlap.
2. **Facade Pattern**: External consumers access functionality through a single top-level module (e.g., `PrismaticAuth`, `PrismaticPerimeter`). Internal modules are implementation details.
3. **OTP Compliance**: Stateful applications define a supervision tree rooted in `Application.start/2`. Stateless libraries skip the application callback.
4. **Explicit Dependencies**: Every inter-app dependency is declared in `mix.exs`. Circular dependencies are forbidden and caught at compile time.
5. **Independent Testability**: `mix test apps/prismatic_auth` runs the auth test suite in isolation. No test should require another app's runtime state.

### Scale Context

The 93 applications collectively comprise:

| Metric | Count |
|--------|-------|
| **OTP Applications** | 93 |
| **Elixir Source Files (.ex)** | 6,652 |
| **Elixir Test Files (.exs)** | 5,864 |
| **Total Elixir Files** | 13,223 |
| **Documentation Files** | 11,308 |
| **Total Lines of Code** | ~2.8 million |
| **Total Repository Files** | 37,486 |

## Application Taxonomy

Applications are organized into eight functional categories, each serving a distinct role in the platform's architecture.

### Core Infrastructure

The foundation layer providing shared capabilities that all other applications depend on:

| Application | Purpose | Key Capability |
|-------------|---------|----------------|
| **prismatic_core** | Central coordination and shared types | Domain types, shared behaviours, core protocols |
| **prismatic_kernel** | Low-level runtime services | Process registry, system configuration, boot sequence |
| **prismatic_3nl** | Three Nested Levels framework | Architectural enforcement, level routing, abstraction boundaries |
| **prismatic_auth** | Authentication and authorization | JWT tokens, API keys, RBAC, session management |
| **prismatic_audit** | Audit logging and compliance trails | Immutable audit records, compliance reporting, event sourcing |
| **prismatic_cache** | Distributed caching layer | ETS-backed caching, TTL management, cache invalidation |
| **prismatic_compression** | Data compression services | Adaptive compression, streaming compression, format negotiation |

Core infrastructure applications have zero external dependencies beyond the Elixir standard library and are loaded first during the boot sequence.

### Storage Layer

The storage subsystem implements a pluggable adapter architecture through the `PrismaticStorage.Adapter` behaviour, allowing transparent switching between storage backends:

| Application | Backend | Use Case |
|-------------|---------|----------|
| **prismatic_storage_core** | [Protocol](/glossary/protocol/) definitions | Traits, protocols, [behaviours](/glossary/behaviour/) for all adapters |
| **prismatic_storage_ets** | [ETS](/glossary/ets/) | High-speed in-memory storage, session data, caches |
| **prismatic_storage_ecto** | [PostgreSQL](/glossary/postgresql/) via [Ecto](/glossary/ecto/) | Persistent relational data, transactions, migrations |
| **prismatic_storage_meilisearch** | [Meilisearch](/glossary/meilisearch/) | Full-text search, faceted filtering, typo-tolerant queries |
| **prismatic_storage_kuzudb** | [KuzuDB](/glossary/kuzudb/) | Graph database, relationship queries, network analysis |
| **prismatic_storage_redis** | [Redis](/glossary/redis/) | Distributed caching, pub/sub, [rate limiting](/glossary/rate-limiting/) counters |

```elixir
# Storage adapter contract -- all backends implement this
defmodule PrismaticStorage.Adapter do
  @callback store(key :: binary(), value :: term(), opts :: keyword()) ::
              {:ok, term()} | {:error, term()}
  @callback fetch(key :: binary(), opts :: keyword()) ::
              {:ok, term()} | {:error, :not_found}
  @callback delete(key :: binary(), opts :: keyword()) ::
              :ok | {:error, term()}
  @callback list(prefix :: binary(), opts :: keyword()) ::
              {:ok, [term()]} | {:error, term()}
end
```

### Intelligence & OSINT

Applications providing intelligence gathering, analysis, and synthesis capabilities:

| Application | Domain | Key Capability |
|-------------|--------|----------------|
| **prismatic_osint_core** | [OSINT](/glossary/osint/) framework | [Adapter](/glossary/adapter-pattern/) layer for 250+ intelligence sources |
| **prismatic_osint_sources** | Source integrations | Provider implementations, rate limiting, credential management |
| **prismatic_hawkeye** | Visitor intelligence | Browser fingerprinting, session analysis, threat detection |
| **prismatic_dd** | Due diligence | Entity-centric investigation, multi-source verification |
| **prismatic_czech_autocrawler** | Czech registry crawler | ARES, Justice.cz, trade registry automated data extraction |
| **prismatic_czech_courts** | Court records | Czech court decision analysis, legal entity monitoring |
| **prismatic_influence** | Influence mapping | Social graph analysis, influence scoring, network visualization |

### Security & Compliance

Applications enforcing security policies, running adversarial simulations, and ensuring regulatory compliance:

| Application | Domain | Key Capability |
|-------------|--------|----------------|
| **prismatic_perimeter** | [EASM](/glossary/easm/) | [Security ratings](/glossary/security-rating/) (A-F), asset discovery, [NIS2](/glossary/nis2/)/[ZKB](/glossary/zkb/) compliance |
| **prismatic_compliance** | Regulatory compliance | [GDPR](/glossary/gdpr/), [SOC2](/glossary/soc2/), [ISO 27001](/glossary/iso-27001/) compliance automation |
| **prismatic_dark** | Security simulation sandbox | Isolated environment for Red/Black team operations |
| **prismatic_cer** | CER compliance | Czech entity register verification, employee screening |
| **prismatic_detection_engine** | Threat detection | Anomaly detection, pattern matching, alert generation |
| **prismatic_suppression** | Data suppression | PII removal, data retention enforcement, right-to-erasure |

### AI & Agent Systems

Applications powering the platform's 434+ autonomous AI agents:

| Application | Domain | Key Capability |
|-------------|--------|----------------|
| **prismatic_agents** | [Agent](/glossary/agent/) runtime | 370+ [AIAD](/glossary/aiad/) agent execution, coordination, lifecycle management |
| **prismatic_claude** | Claude integration | Session management, stack conversation, context preservation |
| **prismatic_ollama** | Local AI [inference](/glossary/inference/) | [Ollama](/glossary/ollama/) model management, inference routing, fallback logic |
| **prismatic_deduction** | Logical deduction | Formal reasoning, proof generation, hypothesis testing |
| **prismatic_lean4** | [Formal verification](/glossary/formal-verification/) | [Lean4](/glossary/lean4/) proof integration, [theorem](/glossary/theorem-proving/) verification, [NABLA](/glossary/nabla-infinity/) proofs |
| **prismatic_logic_prolog** | Prolog reasoning | Logic programming, rule evaluation, knowledge base queries |
| **prismatic_bifurcation** | Decision branching | Scenario analysis, bifurcation detection, path evaluation |

### Web Interfaces

Phoenix-based web applications providing dashboards, APIs, and user interfaces:

| Application | Port | Interface |
|-------------|------|-----------|
| **prismatic_web** | 4000 | Main [LiveView](/glossary/liveview/) dashboard, DD cases, graph visualization |
| **prismatic_api** | 4004 | Auto-introspecting [REST API](/glossary/rest-api/), [OpenAPI](/glossary/openapi/) 3.0, SwaggerUI |
| **prismatic_hawkeye_web** | 4001 | Visitor intelligence dashboard |
| **prismatic_perimeter_web** | 4002 | EASM dashboard, security ratings, compliance views |
| **ai_drift_web** | 4003 | AI drift monitoring, alert dashboard |
| **prismatic_ir_pvm_web** | -- | Interactive PVM visualization |

### Quality & Evolution

Applications driving the platform's autonomous quality enforcement and evolution:

| Application | Domain | Key Capability |
|-------------|--------|----------------|
| **prismatic_safety** | Quality floor guardian | Autonomous quality monitoring, regression prevention |
| **prismatic_credo** | Code quality analysis | [Credo](/glossary/credo/) integration, custom checks, [quality scoring](/glossary/quality-gates/) |
| **prismatic_transcendence** | Evolutionary systems | Self-healing, autonomous improvement, fitness tracking |
| **prismatic_annihilation** | Technical debt elimination | QDP scanning, automated debt removal, quality enforcement |

### Specialized Domains

Applications serving specific business or technical domains:

| Application | Domain | Key Capability |
|-------------|--------|----------------|
| **prismatic_audio** | Audio processing | Speech analysis, audio fingerprinting |
| **prismatic_browser** | Browser automation | Headless browser control, page rendering, screenshot capture |
| **prismatic_crawler** / **prismatic_crawler_core** | Web crawling | URL discovery, content extraction, crawl scheduling |
| **prismatic_blackboard** | Shared knowledge | Blackboard architecture for multi-agent knowledge sharing |
| **ai_drift** | AI decision monitoring | Drift detection, baseline management, statistical testing |
| **prismatic_labs** | Experimental features | Prototype development, feature flags, A/B testing |
| **prismatic_tidewave** | Event streaming | Real-time event processing, stream aggregation |

## Inter-Application Communication

Applications communicate through four primary mechanisms, each suited to different interaction patterns:

### 1. Direct Function Calls (Synchronous)

The simplest and most common pattern. One application calls another's facade module:

```elixir
# prismatic_web calling prismatic_perimeter
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
```

### 2. GenServer Calls/Casts (Process-Based)

For stateful interactions where the target application manages state through a [GenServer](/glossary/genserver/):

```elixir
# Requesting a cached result from the cache application
{:ok, result} = PrismaticCache.fetch("session:#{session_id}")
```

### 3. PubSub Events (Asynchronous)

For event-driven communication where multiple applications may react to the same event:

```elixir
# Publishing an event from prismatic_audit
Phoenix.PubSub.broadcast(Prismatic.PubSub, "audit:events", {:audit_entry, entry})

# Subscribing in prismatic_compliance
Phoenix.PubSub.subscribe(Prismatic.PubSub, "audit:events")
```

### 4. Oban Jobs (Deferred)

For background processing and scheduled tasks using the Oban job processing library:

```elixir
# Scheduling a crawl job from prismatic_crawler
%{url: "https://example.com", depth: 3}
|> PrismaticCrawler.Workers.CrawlWorker.new(schedule_in: 60)
|> Oban.insert()
```

## Dependency Architecture

The dependency graph follows a strict layered architecture preventing circular dependencies:

```
Layer 4 (Web)        prismatic_web, prismatic_api, *_web apps
    ↓ depends on
Layer 3 (Domain)     prismatic_perimeter, prismatic_dd, prismatic_hawkeye, ai_drift
    ↓ depends on
Layer 2 (Services)   prismatic_agents, prismatic_osint_core, prismatic_auth
    ↓ depends on
Layer 1 (Core)       prismatic_core, prismatic_storage_core, prismatic_kernel
    ↓ depends on
Layer 0 (Runtime)    Elixir stdlib, OTP, BEAM VM
```

**Enforcement**: Circular dependencies are caught at compile time by `mix compile`. The platform's CI pipeline additionally verifies the dependency graph topology on every push.

## Supervision Tree Architecture

Each OTP application defines a supervision tree that determines how its processes start, restart, and recover from failures:

```elixir
# Typical application supervision tree
defmodule PrismaticPerimeter.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Core services
      PrismaticPerimeter.Config,
      PrismaticPerimeter.RatingCache,
      # Worker pools
      {Task.Supervisor, name: PrismaticPerimeter.TaskSupervisor},
      # Scheduled jobs
      PrismaticPerimeter.Scheduler
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

**Restart Strategies Used Across the Platform**:

| Strategy | Applications Using | Rationale |
|----------|-------------------|-----------|
| `:one_for_one` | 67 apps | Independent processes, failure in one doesn't affect others |
| `:one_for_all` | 12 apps | Tightly coupled processes that must restart together |
| `:rest_for_one` | 14 apps | Sequential dependency chains (e.g., config → cache → workers) |

## Performance Characteristics

### Build Performance

| Operation | Time | Context |
|-----------|------|---------|
| Full compilation (`mix compile`) | ~45s | All 93 apps from scratch |
| Incremental compilation | ~2-5s | Single file change |
| Full test suite (`mix test`) | ~90s | 5,864 test files |
| Single app tests | ~3-8s | Isolated app test suite |
| [Dialyzer](/glossary/dialyzer/) analysis | ~120s | Full type analysis |

### Runtime Performance

| Metric | Value | Measurement |
|--------|-------|-------------|
| Boot time | ~8s | Application start to ready |
| Memory baseline | ~350 MB | All apps loaded, idle |
| Process count | ~2,500 | Running processes at idle |
| ETS tables | ~180 | Active ETS table count |
| Schedulers | 10 | BEAM scheduler threads (matches CPU cores) |

## Development Workflow

### Creating a New Application

```bash
# Generate new umbrella application
cd apps/
mix new prismatic_new_app --sup

# Add to umbrella deps in root mix.exs
# Add inter-app dependencies in apps/prismatic_new_app/mix.exs
```

### Testing in Isolation

```bash
# Test single application
mix test apps/prismatic_perimeter

# Test with coverage
mix test apps/prismatic_perimeter --cover

# Run specific test file
mix test apps/prismatic_perimeter/test/prismatic/perimeter/security_rating_test.exs
```

### Exploring the Application Landscape

```bash
# List all applications with file counts
mix git_trees apps

# Find files in specific application
mix git_trees list apps/prismatic_perimeter

# Application statistics
mix git_trees --type=ex | grep prismatic_perimeter
```

## Security Considerations

### Application Isolation

Each application runs within its own supervision tree, providing natural process-level isolation. The BEAM VM's process model ensures that:

- **Memory isolation**: Processes do not share heap memory; data is copied on message passing
- **Failure isolation**: A crashing process takes down only its supervisor subtree
- **Scheduling fairness**: The BEAM scheduler prevents any single application from starving others

### Sensitive Applications

Applications handling sensitive data implement additional security measures:

- **prismatic_auth**: Credential storage uses Argon2 hashing; tokens have configurable TTL
- **prismatic_dark**: Operates in a sandboxed environment with no network access
- **prismatic_suppression**: Implements [cryptographic erasure](/glossary/encryption-at-rest/) for GDPR right-to-erasure compliance
- **prismatic_compliance**: Maintains immutable audit trails with tamper detection

### Dependency Security

All Hex dependencies are pinned to exact versions in `mix.lock`. The CI pipeline runs `mix deps.audit` to check for known vulnerabilities in the dependency tree.

## Conclusion

### Architectural Achievement

The 93-application umbrella architecture demonstrates that Elixir/OTP's process model scales to large, complex platforms without sacrificing modularity or fault tolerance. Each application maintains clear boundaries, independent testability, and explicit dependencies while benefiting from the shared BEAM runtime's efficiency.

### Evolution Path

The application count has grown from the original 12 core applications to 93, guided by the principle that new domains deserve their own application when they introduce distinct state, failure modes, or deployment requirements. This organic growth, constrained by architectural rules, produces a system that is simultaneously large-scale and comprehensible.

### Future Expansion

Planned application additions follow the platform's strategic roadmap:
- **Quantum-safe cryptography** application for post-quantum security
- **Multi-region coordination** for distributed deployment scenarios
- **Advanced vision analysis** for image and video intelligence capabilities

## References

### Internal Documentation

- [Platform Architecture](/architecture/) -- Architectural overview and design patterns
- [Umbrella Architecture](/architecture/umbrella-apps/) -- Detailed umbrella structure documentation
- [Supervision Trees](/architecture/supervision-trees/) -- OTP supervision patterns
- [Storage Adapters](/architecture/storage-adapters/) -- Storage layer architecture
- [Agent Architecture](/agents/) -- AI agent system documentation

### External Resources

- [Elixir Umbrella Projects](https://elixir-lang.org/getting-started/mix-otp/dependencies-and-umbrella-projects.html) -- Official Elixir guide
- [OTP Design Principles](https://www.erlang.org/doc/design_principles/users_guide.html) -- Erlang/OTP supervision and application design
- [Phoenix Framework](https://hexdocs.pm/phoenix/) -- Web framework documentation

---

*This document catalogs the complete application landscape of the Prismatic Platform as of 2026-02-06. Application counts and metrics are updated to reflect the current state of the platform.*

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
