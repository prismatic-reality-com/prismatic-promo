+++
title = "Technologies"
description = "Complete technology stack powering the Prismatic Platform -- from Elixir/OTP and Phoenix through AI models and formal verification to production infrastructure"
sort_by = "weight"
template = "technologies/list.html"
page_template = "technologies/detail.html"

[extra]
date_created = "2026-02-06"
section_icon = "cpu-chip"
total_technologies = 45
architectural_layers = 8
selection_criteria = ["fault-tolerance", "developer-productivity", "maintainability"]
platform_scale = "2.8M+ LOC"
applications_count = 106
quality_standard = "NO_MERCY"
key_features = ["BEAM-Native", "Polyglot Storage", "AI Integration", "Fault Tolerance", "Zero Vendor Lock-in"]
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
word_count = 3200
difficulty = "advanced"
image = "/images/sections/technologies.png"
image_alt = "Prismatic Platform technology stack overview"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "3.0.0"
last_enhanced = "2026-02-22"
quality_score = 98
integration_approach = "deep-composition"
licensing = "GPL-3.0"
related_articles = ["elixir", "phoenix", "postgresql", "claude", "kuzudb"]
glossary_terms = ["BEAM", "OTP", "LiveView", "ETS", "GenServer", "KuzuDB", "NABLA"]
keywords = ["Elixir technology stack", "Phoenix LiveView framework", "BEAM runtime technologies", "PostgreSQL database platform", "AI model integration stack", "formal verification Lean 4", "KuzuDB graph database", "production infrastructure tools"]
tags = ["technologies", "elixir", "phoenix", "stack", "infrastructure", "ai-integration", "fault-tolerance"]
see_also = ["architecture", "apps", "capabilities", "developers", "agents", "applications"]
date_modified = "2026-02-23"
+++

## Perex

The Prismatic Platform's production stack integrates 45+ carefully selected technologies into a unified [architecture](@/glossary/software-architecture.md) that serves [intelligence analysis](@/glossary/intelligence-analysis.md), [security assessment](@/glossary/security-assessment.md), [formal verification](@/glossary/formal-verification.md), and autonomous [AI](@/glossary/artificial-intelligence.md) operations. From the [BEAM](@/glossary/beam-vm.md) [virtual machine](@/glossary/virtual-machine.md) foundation through [Phoenix](@/glossary/phoenix-framework.md) [LiveView](@/glossary/liveview.md) interfaces to [AI model](@/glossary/ai-model.md) integration and graph-native storage, every technology was chosen through rigorous evaluation against [fault tolerance](@/glossary/fault-tolerance.md), developer productivity, and long-term maintainability.

This technology selection transforms platform capabilities into reliable, [scalable](@/glossary/scalability.md) infrastructure supporting 2.8M+ lines of code across 106 applications, delivering [enterprise-grade](@/glossary/enterprise-architecture.md) performance with academic research rigor.

## Key Technology Resources

**45+ Technologies** • **8 Architectural Layers** • **Zero Vendor Lock-in** • **Production-Tested**

The platform combines proven open-source technologies with cutting-edge AI integration, creating a stack that prioritizes operational characteristics over feature richness. Each technology undergoes evaluation against three constraints: composition compatibility, fault tolerance requirements, and long-term maintainability.

### Technology Stack Layers

| Layer | Technologies | Focus Area | Key Components |
|-------|-------------|------------|----------------|
| **Runtime Foundation** | 8 techs | [BEAM](@/glossary/beam-vm.md) VM, [OTP](@/glossary/otp.md), [Elixir](@/glossary/elixir.md) | [Virtual machine](@/glossary/virtual-machine.md), [supervision trees](@/glossary/supervision-tree.md), [concurrency](@/glossary/concurrency.md) |
| **Web Platform** | 6 techs | [Phoenix](@/glossary/phoenix-framework.md), [LiveView](@/glossary/liveview.md), HTTP | Real-time interfaces, [WebSocket](@/glossary/websocket.md) handling |
| **Data Persistence** | 8 techs | [PostgreSQL](@/glossary/postgresql.md), [KuzuDB](@/glossary/kuzu-db.md), [ETS](@/glossary/ets.md) | Polyglot storage, [graph databases](@/glossary/graph-database.md), [caching](@/glossary/caching.md) |
| **AI Integration** | 5 techs | [Claude](@/glossary/claude-ai.md), [Ollama](@/glossary/ollama.md), OpenAI | Frontier models, local inference, [agent](@/glossary/agent.md) coordination |
| **Frontend & UI** | 4 techs | [TailwindCSS](@/glossary/tailwindcss.md), [Flowbite](@/glossary/flowbite.md), Alpine.js | Modern responsive interfaces |
| **Security & Auth** | 3 techs | Guardian, [RBAC](@/glossary/rbac.md), [Encryption](@/glossary/encryption.md) | [Authentication](@/glossary/authentication.md), [authorization](@/glossary/authorization.md), [data protection](@/glossary/data-protection.md) |
| **Development Tools** | 6 techs | [Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), Mix | [Code quality](@/glossary/code-quality.md), [static analysis](@/glossary/static-analysis.md), build tooling |
| **Infrastructure** | 5 techs | Fly.io, GitLab CI, Docker | Deployment, [CI/CD](@/glossary/ci-cd.md), [containerization](@/glossary/containerization.md) |

### Platform Statistics

- **Total Technologies**: 45+ production components
- **Architectural Layers**: 8 distinct technology layers
- **Selection Philosophy**: Operational characteristics first, features second
- **Quality Standard**: NO MERCY doctrine applied to all technology choices
- **Integration Depth**: Deep composition vs. loose assembly
- **Open Source**: GPL-3.0 licensing, zero vendor lock-in
- **Platform Scale**: 2.8M+ LOC, 106 applications supported

### Quick Navigation

- **[Architecture Overview](@/architecture/_index.md)** - System design and technology integration patterns
- **[Developer Portal](@/developers/_index.md)** - SDK and development toolchain access
- **[Platform Capabilities](@/capabilities/_index.md)** - Technical specifications and performance
- **[Applications Catalog](@/applications/_index.md)** - 625+ applications powered by this stack
- **[Agent System](@/agents/_index.md)** - 530 agents built on the technology foundation

### Explore Platform

| Component | Count | Description |
|-----------|-------|-------------|
| **Technology Components** | 45+ | Carefully selected open-source technologies |
| **Architectural Layers** | 8 | Runtime, web, data, AI, frontend, security, dev, infrastructure |
| **Quality Score** | 100/100 | Perfect compliance with selection and integration standards |
| **Applications** | 106 | Umbrella applications built on the technology stack |
| **Agent Coordination** | 530+ | Autonomous agents leveraging the technology foundation |

### Want to Know More?

Dive deeper into specific technology layers, explore our [architecture patterns](@/architecture/_index.md), or review the [development environment](@/developers/_index.md) that leverages this comprehensive stack.

**About Technologies**: [Selection Philosophy](#selection-philosophy) • [Technology Layers](#technology-layers) • [Conclusion](#conclusion)

---

## Abstract

The Prismatic Platform integrates 45 distinct technologies into a unified stack that serves intelligence analysis, security assessment, formal verification, and autonomous AI agent operations. This document provides a comprehensive survey of the technology landscape, organized by architectural layer, with emphasis on the selection rationale, integration patterns, and operational characteristics of each component.

Technology selection in a platform of this scale -- 93 OTP applications, 6,652 source files, approximately 2.8 million lines of code -- demands more than feature-list comparisons. Every technology must satisfy three constraints simultaneously: it must compose with the existing stack without impedance mismatch, it must operate reliably under the platform's fault tolerance requirements, and it must remain maintainable by a small team over multi-year timescales. These constraints eliminate a large number of otherwise capable tools and frameworks, producing a stack that favours proven, well-documented technologies over novel alternatives.

The stack is organized into eight layers, from the BEAM runtime at the foundation through the web platform, data persistence, AI integration, frontend rendering, security tooling, development infrastructure, and deployment operations. Each layer defines clear interfaces to adjacent layers, preventing tight coupling while enabling the deep integration that distinguishes Prismatic from loosely assembled tool collections.

## Introduction

### Selection Philosophy

The Prismatic Platform's technology choices reflect a pragmatic engineering philosophy: **select for operational characteristics first, [developer experience](@/glossary/developer-experience.md) second, and feature richness third**. A technology that is pleasant to use but unreliable under load, or feature-rich but poorly documented, will be rejected in favour of a simpler alternative that can be fully understood, [monitored](@/glossary/monitoring.md), and debugged in production.

This philosophy produces several observable patterns in the stack:

1. **[BEAM](@/glossary/beam-vm.md)-native when possible**: If a capability can be implemented as an [Erlang](@/glossary/erlang.md)/[Elixir](@/glossary/elixir.md) library running on the [BEAM VM](@/glossary/beam-vm.md), that approach is preferred over introducing an external service. [ETS](@/glossary/ets.md) replaces [Redis](@/glossary/redis.md) for many [caching](@/glossary/caching.md) scenarios. [Phoenix PubSub](@/glossary/pubsub.md) replaces message brokers for intra-node event distribution. [GenServer](@/glossary/genserver.md)-based [state machines](@/glossary/state-machine.md) replace external workflow engines.

2. **[Polyglot storage](@/glossary/polyglot-persistence.md)**: No single [database](@/glossary/database.md) technology optimally serves all access patterns. [PostgreSQL](@/glossary/postgresql.md) handles [relational data](@/glossary/relational-database.md) and [ACID transactions](@/glossary/acid-transactions.md). [ETS](@/glossary/ets.md) provides microsecond [key-value](@/glossary/key-value-store.md) lookups. [Meilisearch](@/glossary/meilisearch.md) powers [full-text search](@/glossary/full-text-search.md) with typo tolerance. [KuzuDB](@/glossary/kuzu-db.md) models [graph relationships](@/glossary/graph-database.md). DuckDB handles [analytical queries](@/glossary/analytics.md) on columnar data. Each storage engine is accessed through the platform's unified storage [adapter](@/glossary/adapter-pattern.md) layer, so application code never couples to a specific backend.

3. **[AI](@/glossary/artificial-intelligence.md) as a tool, not a foundation**: [AI models](@/glossary/ai-model.md) ([Claude](@/glossary/claude-ai.md), [Ollama](@/glossary/ollama.md), OpenAI) are integrated as callable services with well-defined interfaces, not as load-bearing architectural components. If every AI endpoint became unavailable simultaneously, the platform's core [intelligence analysis](@/glossary/intelligence-analysis.md), storage, and web serving would continue operating. AI enhances; it does not define.

4. **[Formal verification](@/glossary/formal-verification.md) as a peer**: [Lean 4](@/glossary/lean4.md) and [SWI-Prolog](@/glossary/prolog.md) are not afterthoughts or academic curiosities -- they are first-class components in the platform's [epistemic pipeline](@/glossary/epistemic-pipeline.md), providing [mathematical proof](@/glossary/formal-proof.md) [verification](@/glossary/verification.md) and [logical reasoning](@/glossary/logical-reasoning.md) that complement statistical [AI inference](@/glossary/ai-inference.md).

### Selection Criteria

Every technology in the stack was evaluated against five weighted criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **[Reliability](@/glossary/reliability.md)** | 30% | Proven stability in [production environments](@/glossary/production-environment.md) at scale |
| **[Composability](@/glossary/composability.md)** | 25% | Clean integration with existing stack components |
| **[Maintainability](@/glossary/maintainability.md)** | 20% | Documentation quality, community activity, update frequency |
| **[Performance](@/glossary/performance.md)** | 15% | Meets [throughput](@/glossary/throughput.md) and [latency](@/glossary/latency.md) requirements for intended use |
| **Security** | 10% | [Vulnerability](@/glossary/vulnerability.md) history, [security audit](@/glossary/security-audit.md) availability, hardening options |

Technologies scoring below 70% aggregate are rejected. Technologies scoring above 85% are preferred candidates. The current stack represents the cumulative result of applying these criteria across four years of platform evolution.

## Technology Layers

The complete stack is organized into eight [architectural layers](@/glossary/layered-architecture.md). Each layer depends only on layers below it; no upward or [circular dependencies](@/glossary/circular-dependency.md) exist.

| Layer | Domain | Key Technologies | Purpose |
|-------|--------|------------------|---------|
| **L0 -- Runtime** | VM & Processes | [BEAM](@/technologies/beam.md), [Erlang/OTP 27](@/technologies/erlang-otp.md), [Elixir 1.19](@/technologies/elixir.md) | Fault-tolerant process runtime |
| **L1 -- Framework** | Web & API | [Phoenix 1.7](@/technologies/phoenix.md), [LiveView](@/technologies/phoenix-liveview.md), [Plug](@/technologies/plug.md) | Request handling, real-time UI |
| **L2 -- Data** | Persistence & Search | [PostgreSQL 16](@/technologies/postgresql.md), [Ecto](@/technologies/ecto.md), [ETS](@/technologies/ets.md), [Redis](@/technologies/redis.md) | Structured storage, caching |
| **L3 -- Search & Graph** | Specialized Storage | [Meilisearch](@/technologies/meilisearch.md), [KuzuDB](@/technologies/kuzudb.md), [TimescaleDB](@/technologies/timescaledb.md) | Full-text, graph, time-series |
| **L4 -- Intelligence** | AI & Reasoning | [Claude](@/technologies/claude.md), [Ollama](@/technologies/ollama.md), [Lean 4](@/technologies/lean4.md) | AI inference, formal proofs |
| **L5 -- Frontend** | UI Rendering | [TailwindCSS](@/technologies/tailwindcss.md), [Flowbite](@/technologies/flowbite.md), [Alpine.js](@/technologies/alpinejs.md) | Styling, components, interactivity |
| **L6 -- Security** | Hardening & Audit | [Argon2](@/technologies/argon2.md), [SSL/TLS](@/technologies/ssl-tls.md), [JOSE](@/technologies/jose.md) | Auth, encryption, vulnerability scanning |
| **L7 -- DevOps** | Build & Deploy | [Docker](@/technologies/docker.md), [Fly.io](@/technologies/flyio.md), [GitLab CI](@/technologies/gitlab-ci.md), [Mix](@/technologies/mix.md) | Compilation, testing, deployment |

The following sections examine each layer in detail.

## Core Runtime: Elixir, OTP, and the BEAM

The platform's foundation is the [BEAM virtual machine](@/technologies/beam.md) -- the Erlang runtime system that has powered telecommunications infrastructure since 1986. On the BEAM, [Erlang/OTP 27](@/technologies/erlang-otp.md) provides the process model, supervision trees, and distribution protocols, while [Elixir 1.19](@/technologies/elixir.md) provides the developer-facing language with modern syntax, metaprogramming, and the Mix build tool.

### Why BEAM

The BEAM provides three properties that no other mainstream runtime offers simultaneously:

**Preemptive scheduling of lightweight processes.** The BEAM scheduler time-slices across millions of lightweight processes (not OS threads) with guaranteed fairness. A computationally expensive operation in one process cannot starve others. This is fundamental for a platform running 434+ AI agents, web connections, and background jobs concurrently.

**Per-process garbage collection.** Each BEAM process has its own heap. Garbage collection is per-process and concurrent -- collecting one process does not pause any other. This eliminates the stop-the-world GC pauses that plague JVM and V8-based systems under heavy load.

**Fault isolation through process boundaries.** A crash in one process does not corrupt another's memory. Combined with OTP supervisors that automatically restart failed processes, this produces systems that self-heal from transient failures without manual intervention.

### OTP in Practice

The platform uses OTP's core abstractions extensively:

```elixir
defmodule Prismatic.Perimeter.DiscoveryService do
  use GenServer

  @impl true
  def init(opts) do
    state = %{
      cache: :ets.new(:discovery_cache, [:set, :protected]),
      scan_interval: Keyword.get(opts, :scan_interval, :timer.minutes(15)),
      active_scans: %{}
    }

    schedule_periodic_scan(state.scan_interval)
    {:ok, state}
  end

  @impl true
  def handle_info(:periodic_scan, state) do
    {:ok, updated} = execute_scan_cycle(state)
    schedule_periodic_scan(state.scan_interval)
    {:noreply, updated}
  end

  defp schedule_periodic_scan(interval) do
    Process.send_after(self(), :periodic_scan, interval)
  end
end
```

Every stateful component in the platform follows this pattern: a [GenServer](@/technologies/genserver.md) process managed by a [Supervisor](@/technologies/supervisor.md), with ETS for fast reads and message passing for coordination. There are no global variables, no shared mutable state, and no thread-safety concerns.

### Runtime Characteristics

| Metric | Value |
|--------|-------|
| **Process creation** | ~2 microseconds |
| **Process memory overhead** | ~2.6 KB initial heap |
| **Message send** | ~0.5 microseconds (same node) |
| **Scheduler count** | Matches CPU cores (typically 10) |
| **Max concurrent processes** | Millions (tested to 2M+) |
| **GC strategy** | Per-process generational |

## Web Platform: Phoenix and LiveView

[Phoenix 1.7](@/technologies/phoenix.md) provides the HTTP layer, routing, and WebSocket infrastructure. [Phoenix LiveView 0.20](@/technologies/phoenix-liveview.md) extends this with server-rendered, real-time interactive interfaces that require zero custom JavaScript for the majority of UI interactions.

### Real-Time Without Complexity

LiveView's model eliminates the traditional frontend/backend split for dashboard-style applications. The server maintains the UI state, computes DOM diffs, and pushes minimal patches over a persistent WebSocket connection. The client applies patches without full page reloads.

This architecture is ideal for the Prismatic Platform's monitoring dashboards, where data changes continuously and must propagate to all connected clients within milliseconds:

```elixir
defmodule PrismaticWeb.Live.PerimeterDashboardLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:events")
    end

    {:ok, assign(socket, assets: [], rating: nil, last_scan: nil)}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, socket) do
    {:noreply, update(socket, :assets, &[asset | &1])}
  end

  @impl true
  def handle_info({:rating_updated, rating}, socket) do
    {:noreply, assign(socket, rating: rating)}
  end
end
```

When the perimeter scanner discovers a new asset or updates a security rating, it broadcasts through [Phoenix PubSub](@/technologies/pubsub.md). Every connected LiveView receives the event and updates its DOM -- no polling, no REST calls, no client-side state management libraries.

### Request Pipeline

Phoenix's [Plug](@/technologies/plug.md)-based request pipeline provides composable middleware for authentication, rate limiting, CORS, and telemetry:

```
Request → Endpoint → Router → Pipeline (Plugs) → Controller/LiveView → Response
                                  │
                                  ├── APIAuth (JWT verification)
                                  ├── RateLimiter (sliding window)
                                  ├── RequestLogger (structured telemetry)
                                  └── CSRFProtection (form tokens)
```

The platform serves two Phoenix applications simultaneously: `prismatic_web` on port 4000 (LiveView dashboards) and `prismatic_api` on port 4004 (REST API with [OpenAPI](@/technologies/openapi.md) spec generation via OpenApiSpex).

## Data Layer: Polyglot Persistence

The platform's data layer implements the polyglot persistence pattern -- using the best storage engine for each access pattern rather than forcing all data through a single database.

### PostgreSQL -- Relational Core

[PostgreSQL 16](@/technologies/postgresql.md) serves as the primary relational store for all structured, transactional data. Accessed through [Ecto](@/technologies/ecto.md) (Elixir's database wrapper and query DSL), PostgreSQL handles user data, audit logs, security ratings, compliance assessments, and configuration state.

[TimescaleDB](@/technologies/timescaledb.md) extends PostgreSQL for time-series workloads -- particularly AI drift monitoring metrics that require efficient range queries and automatic data retention policies.

```elixir
defmodule Prismatic.Perimeter.SecurityRating do
  use Ecto.Schema

  schema "security_ratings" do
    field :domain, :string
    field :grade, Ecto.Enum, values: [:A, :B, :C, :D, :F]
    field :score, :integer
    field :confidence, :float
    field :evidence, :map
    timestamps(type: :utc_datetime_usec)
  end
end
```

### ETS -- In-Memory Speed

[ETS (Erlang Term Storage)](@/technologies/ets.md) provides in-process, shared-nothing tables with microsecond read/write latency. The platform uses ETS extensively for caching, session state, and hot-path data that would suffer from the network round-trip overhead of an external cache:

| ETS Table | Purpose | Access Pattern |
|-----------|---------|----------------|
| `:api_registry` | Discovered API endpoints | Read-heavy, write on boot |
| `:discovery_cache` | Perimeter scan results | TTL-based expiration |
| `:agent_state` | Active agent contexts | Frequent read/write |
| `:rate_limits` | Request rate counters | Atomic increment |

ETS tables are owned by dedicated GenServer processes. If the owning process crashes and restarts, the table is recreated from the authoritative PostgreSQL source -- making ETS a performance optimization layer rather than a durability concern.

### Redis -- External Caching and Queues

[Redis](@/technologies/redis.md) handles caching scenarios that span multiple BEAM nodes (in clustered deployments) and provides the backing store for Oban job queues. While ETS serves single-node caching, Redis provides the shared state necessary for horizontal scaling.

### Meilisearch -- Full-Text Search

[Meilisearch](@/technologies/meilisearch.md) powers the platform's search capabilities with typo-tolerant, faceted full-text search. Entity search, document discovery, and asset inventory filtering all route through Meilisearch, which indexes data pushed from PostgreSQL through the storage adapter layer.

### KuzuDB -- Graph Analytics

[KuzuDB](@/technologies/kuzudb.md) provides embedded graph database capabilities for relationship-centric queries. Due diligence entity graphs, organizational ownership chains, and asset dependency maps are modeled as property graphs in KuzuDB, enabling traversal queries that would require expensive recursive CTEs in PostgreSQL.

## AI and Intelligence Layer

The platform integrates three AI and formal reasoning systems, each serving a distinct role in the intelligence pipeline.

### Claude (Anthropic)

[Claude](@/technologies/claude.md) serves as the primary frontier AI model for code generation, complex analysis, and autonomous agent operations. The platform's 434 AIAD agents leverage Claude for reasoning-intensive tasks through the Claude Agent SDK, with session context management ensuring continuity across interactions.

### Ollama -- Local AI

[Ollama](@/technologies/ollama.md) provides local AI inference with models running entirely on-premises. This addresses three requirements that cloud AI cannot: **data sovereignty** (sensitive intelligence data never leaves the local network), **latency** (sub-3-second responses without network round-trips), and **availability** (operates independently of external API availability).

The platform's Ollama integration supports automatic model selection based on task complexity and automatic fallback to cloud models when local inference quality is insufficient:

```elixir
defmodule PrismaticOllama.Coordinator do
  @models %{
    fast: "qwen3-coder:7b",
    balanced: "deepseek-coder:6.7b",
    capable: "gpt-oss:20b"
  }

  def infer(prompt, opts \\ []) do
    tier = Keyword.get(opts, :tier, :balanced)
    model = Map.fetch!(@models, tier)

    case PrismaticOllama.Client.generate(model, prompt) do
      {:ok, result} -> {:ok, result}
      {:error, _} -> fallback_to_cloud(prompt, opts)
    end
  end
end
```

### Lean 4 -- Formal Verification

[Lean 4](@/technologies/lean4.md) is an interactive theorem prover and programming language used for formal verification of the platform's critical deduction chains. When the epistemic pipeline produces a high-confidence conclusion, Lean 4 can verify the logical structure of the reasoning chain through machine-checked proofs.

This is not a theoretical capability -- the platform maintains thousands of Lean 4 verification files in `apps/prismatic_lean4/priv/deduction_verification/`, each encoding a specific deduction that has been formally verified. The combination of statistical AI inference (Claude/Ollama) with formal mathematical proof (Lean 4) is a distinguishing architectural feature.

## Frontend Stack

The frontend layer follows a server-first philosophy: LiveView handles interactivity on the server side, while the frontend technologies handle styling, component structure, and the minimal client-side behaviour that requires JavaScript execution.

### TailwindCSS

[TailwindCSS 3.4](@/technologies/tailwindcss.md) provides utility-first CSS styling. Every visual element is styled through Tailwind utility classes -- no custom CSS files, no BEM naming conventions, no specificity wars. This constraint (enforced as a platform policy) ensures visual consistency and makes style changes grep-able:

```html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
    Security Rating
  </h3>
  <span class="inline-flex items-center px-3 py-1 rounded-full
               text-sm font-medium bg-green-100 text-green-800">
    Grade A
  </span>
</div>
```

### Flowbite

[Flowbite 2.3](@/technologies/flowbite.md) extends TailwindCSS with pre-built UI components: modals, dropdowns, data tables, navigation bars, and charts. Using Flowbite's component library rather than building custom components reduces frontend development time while maintaining visual consistency across the platform's dashboards.

### Alpine.js

[Alpine.js](@/technologies/alpinejs.md) handles the small subset of client-side interactivity that cannot be served by LiveView -- primarily dropdown toggle states, tooltip positioning, and animation triggers that must respond to user input without a server round-trip.

## DevOps and Infrastructure

### Docker

[Docker](@/technologies/docker.md) provides development/production parity through containerized builds. The platform uses multi-stage Dockerfiles that separate compilation (with the full Elixir/Erlang toolchain) from the runtime image (Alpine Linux with only the compiled release), producing production images under 100 MB.

### Fly.io

[Fly.io](@/technologies/flyio.md) hosts the platform's staging and production deployments. Fly.io's edge-native architecture maps well to Elixir releases -- the platform deploys as a single BEAM VM per region, with Fly.io handling TLS termination, load balancing, and geographic routing.

### GitLab CI/CD

[GitLab CI/CD](@/technologies/gitlab-ci.md) orchestrates the platform's build pipeline: compilation with `--warnings-as-errors`, Credo static analysis, Dialyzer type checking, the full test suite, and deployment to Fly.io. The pipeline enforces the platform's quality gates -- a single warning, type error, or test failure blocks deployment.

### Mix and Hex

[Mix](@/technologies/mix.md) is Elixir's build tool, managing compilation, dependency resolution, test execution, and custom task definition. The platform defines 30+ custom Mix tasks for quality enforcement, benchmarking, code generation, and operational automation. [Hex](https://hex.pm) serves as the package registry, providing access to the Elixir ecosystem's 14,000+ packages.

## Security Tooling

Security is enforced at multiple layers through specialized tools:

| Tool | Function | Integration Point |
|------|----------|-------------------|
| **[Argon2](@/technologies/argon2.md)** | Password hashing (winner of PHC) | Authentication module |
| **Sobelow** | Static security analysis for Phoenix | CI pipeline, pre-commit hooks |
| **mix deps.audit** | Dependency vulnerability scanning | CI pipeline, weekly scheduled |
| **[JOSE](@/technologies/jose.md)** | JWT creation, verification, encryption | API authentication |
| **[SSL/TLS](@/technologies/ssl-tls.md)** | Transport encryption | All external connections |
| **[Credo](@/technologies/credo.md)** | Code consistency and anti-pattern detection | CI pipeline, pre-commit hooks |
| **[Dialyzer](@/technologies/dialyzer.md)** | Static type analysis via success typing | CI pipeline |

The security toolchain runs automatically on every commit through GitLab CI and pre-commit hooks. No code reaches the main branch without passing Sobelow (zero findings), Credo (strict mode, zero warnings), and Dialyzer (zero type violations).

## Build and Development Tools

### ExDoc

ExDoc generates the platform's 11,308 documentation files from inline `@doc` and `@moduledoc` attributes. Documentation is treated as a first-class artifact -- modules without documentation trigger compilation warnings that block deployment.

### ExUnit

[ExUnit](@/technologies/exunit.md) is Elixir's built-in test framework, executing the platform's 5,864 test files. Tests run in parallel by default, with database sandboxing through Ecto's SQL sandbox for isolation. The platform uses property-based testing (StreamData) alongside example-based tests for critical business logic.

### Zola

[Zola](@/technologies/zola.md) generates the public-facing promotional site (the one you are reading now). Zola is a single-binary static site generator written in Rust, chosen for its compilation speed (sub-second builds for the entire site), zero runtime dependencies, and native Sass/SCSS compilation.

### Git

[Git](@/technologies/git.md) provides version control with extensive platform-specific tooling. The platform's `git-trees.sh` script wraps `git ls-tree` for rapid codebase exploration (~80ms for 37,000+ files versus 500ms+ for `find`), and custom Git hooks enforce quality gates at commit, pre-push, and CI stages.

## Conclusion

The Prismatic Platform's 45-technology stack is the product of deliberate engineering trade-offs, not feature accumulation. Each technology occupies a specific niche defined by its operational characteristics, integration profile, and long-term maintainability. The BEAM VM provides the fault-tolerant foundation. Phoenix and LiveView deliver real-time web interfaces without frontend framework complexity. Polyglot storage ensures each data access pattern uses an optimized engine. AI models augment human analysis without becoming single points of failure. Formal verification with Lean 4 provides mathematical certainty where statistical inference is insufficient.

The unifying principle across all eight layers is **composability through well-defined interfaces**. Storage adapters abstract persistence backends. The Plug pipeline composes HTTP middleware. PubSub decouples event producers from consumers. GenServer contracts define process communication. This interface discipline enables the platform to evolve individual technologies -- replacing Redis with a BEAM-native alternative, swapping Meilisearch for a different search engine, upgrading AI models -- without cascading changes through the codebase.

For detailed documentation on any individual technology, select from the catalog below or navigate directly to the technology detail pages linked throughout this overview.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
