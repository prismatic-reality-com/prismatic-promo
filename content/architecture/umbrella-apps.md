+++
title = "Umbrella Architecture"
weight = 7
date = 2026-02-12


[extra]
icon = "cpu"
color = "cyan"
description = "90 modular applications in a single coordinated monorepo"
date_created = "2025-06-15"
reading_time = "14 min"
difficulty = "intermediate"
tags = ["umbrella", "monorepo", "modularity", "elixir", "otp-applications", "dependency-management"]
related_articles = ["supervision-trees", "telemetry", "event-sourcing", "storage-adapters", "pubsub"]
author = "Tomas Korcak (korczis)"
word_count = 1207
date_modified = "2026-02-23"
keywords = ["Umbrella", "Architecture", "modular", "applications", "single", "coordinated", "monorepo", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Umbrella Architecture - Prismatic Platform"
+++

## Overview

The Prismatic Platform is organized as an [Elixir](@/glossary/elixir.md) umbrella project containing 90 [OTP](@/glossary/otp.md) applications within a single monorepo. This architectural decision represents a deliberate middle ground between two extremes: a monolithic application where all code lives in a single compilation unit, and a distributed [microservices](@/glossary/microservices.md) architecture where each service is an independently deployed artifact. The umbrella approach provides the modularity and isolation of microservices -- each application has its own [supervision tree](@/glossary/supervision-tree.md), configuration, dependency declarations, and test suite -- while preserving the monorepo advantages of atomic cross-cutting changes, shared tooling, and compile-time dependency verification.

This article examines the rationale for this choice, the internal organization principles, the dependency management strategies that prevent the architecture from degrading into a "distributed monolith," and the operational benefits realized across 2.8 million lines of code managed by over 400 [AIAD agents](@/glossary/aiad.md).

## Rationale: Why Umbrella Over Alternatives

### The Monolith Problem

A single Elixir application containing all 2.8 million lines of code would suffer from several pathologies. Compilation times would be prohibitive: a change to a single module would trigger recompilation of all dependent modules, potentially the entire codebase. Test suites would run monolithically, providing no isolation between unrelated subsystems. Namespace pollution would make it difficult to reason about module boundaries. And perhaps most critically, there would be no structural enforcement of the separation between, say, the [EASM](@/glossary/easm.md) scanning engine and the [OSINT](@/glossary/osint.md) intelligence pipeline -- developers could freely couple any module to any other.

### The Microservices Problem

A fully distributed microservices architecture introduces network boundaries between components. While this provides the strongest isolation, it imposes significant operational overhead: each service needs its own deployment pipeline, monitoring, and runtime infrastructure. Network calls between services add latency and failure modes (network partitions, timeouts, serialization overhead). Cross-cutting changes that span multiple services require coordinated deployments. And critically for an Elixir platform, microservices forfeit the [BEAM](@/glossary/beam.md)'s greatest strengths: lightweight processes, supervision trees, and in-memory [message passing](@/glossary/message-passing.md) between processes on the same node.

### The Umbrella Sweet Spot

The umbrella architecture provides compile-time boundaries without runtime boundaries. Each application is compiled independently -- changing a module in `prismatic_perimeter` only recompiles `prismatic_perimeter` and its dependents, not the entire platform. Each application declares its dependencies explicitly in its `mix.exs`, creating a verifiable dependency graph. Yet at runtime, all applications share the same [BEAM](@/glossary/beam.md) node, communicating through fast in-memory message passing rather than network calls.

| Dimension | Monolith | Umbrella | Microservices |
|-----------|----------|----------|---------------|
| Compilation isolation | None | Per-app | Per-service |
| Runtime isolation | None | Per-process (OTP) | Per-network boundary |
| Communication overhead | Function call | Function call / message | Network RPC |
| Deployment granularity | All or nothing | Selective releases | Per-service |
| Cross-cutting changes | Trivial | Atomic commit | Coordinated deploy |
| Dependency enforcement | None (convention) | Compile-time ([mix](@/glossary/mix.md).exs) | Network boundary |
| Operational overhead | Low | Low | High |

## Project Structure and Organization Principles

The 90 applications are organized by domain responsibility, following a naming convention that communicates purpose and layer.

```
prismatic-platform/
+-- apps/
|   +-- prismatic/                    # Core coordination and facade
|   +-- prismatic_api/                # REST API gateway (port 4004)
|   +-- prismatic_web/                # LiveView dashboards (port 4000)
|   +-- prismatic_agents/             # Agent runtime and execution
|   +-- prismatic_perimeter/          # EASM engine
|   +-- prismatic_safety/             # Quality and safety enforcement
|   +-- prismatic_claude/             # Claude Code integration
|   +-- prismatic_supervisor/         # Compositional supervision
|   +-- prismatic_storage_core/       # Storage protocols and behaviours
|   +-- prismatic_storage_ets/        # ETS adapter
|   +-- prismatic_storage_ecto/       # PostgreSQL adapter
|   +-- prismatic_storage_kuzu/       # KuzuDB graph adapter
|   +-- prismatic_storage_meilisearch/ # Search adapter
|   +-- prismatic_storage_redis/      # Redis adapter
|   +-- prismatic_telemetry/          # Observability infrastructure
|   +-- prismatic_dark/               # Security simulation sandbox
|   +-- prismatic_osint_core/         # OSINT pipeline core
|   +-- prismatic_crawler/            # Web crawling engine
|   +-- ... (70+ more applications)
+-- config/                           # Shared and per-env configuration
+-- mix.exs                           # Umbrella root configuration
+-- rel/                              # Release configuration
```

### Application Categories

| Category | Count | Purpose | Key Applications |
|----------|-------|---------|-----------------|
| Core | 5 | Coordination, routing, events | prismatic, prismatic_core, prismatic_events |
| Storage | 8 | Adapters and protocols | [prismatic_storage_core](@/apps/prismatic-storage-core.md), [prismatic_storage_ets](@/apps/prismatic-storage-ets.md), [prismatic_storage_ecto](@/apps/prismatic-storage-ecto.md) |
| Intelligence | 12 | OSINT, analysis, discovery | prismatic_osint_core, prismatic_deduction, prismatic_detection_engine |
| Security | 6 | Scanning, compliance, ratings | [prismatic_perimeter](@/apps/prismatic-perimeter.md), prismatic_dark, prismatic_compliance |
| Agents | 10 | Agent types and runtime | [prismatic_agents](@/apps/prismatic-agents.md), prismatic_claude |
| Web | 4 | [LiveView](@/glossary/liveview.md), API, real-time | [prismatic_web](@/apps/prismatic-web.md), [prismatic_api](@/apps/prismatic-api.md) |
| Integration | 15 | External service adapters | prismatic_crawler, prismatic_browser |
| Safety | 8 | Quality enforcement, testing | [prismatic_safety](@/apps/prismatic-safety.md), prismatic_credo |
| Tooling | 22 | [Mix task](@/glossary/mix-task.md)s, generators, CLI | prismatic_algorithms, prismatic_compression |

### Naming Conventions

Application naming follows strict conventions that encode architectural information:

- `prismatic_storage_*` -- Storage layer adapters implementing the `StorageCore` protocols
- `prismatic_*_web` -- [Phoenix](@/glossary/phoenix.md) web interfaces for specific domains
- `prismatic_*_core` -- Core domain logic without external dependencies
- `prismatic_*` -- General-purpose applications within the platform namespace

## Dependency Management and Acyclic Enforcement

The most critical aspect of umbrella architecture is maintaining a clean, acyclic dependency graph. Without discipline, [umbrella application](@/glossary/umbrella-application.md)s can develop circular dependencies, effectively negating the modularity benefits and creating a "distributed monolith" that is harder to reason about than an actual monolith.

### Internal Dependencies

Each application explicitly declares its umbrella dependencies in its `mix.exs`:

```elixir
# apps/prismatic_perimeter/mix.exs
defmodule PrismaticPerimeter.MixProject do
  use Mix.Project

  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      deps: deps(),
      dialyzer: [plt_add_apps: [:mix]],
      test_coverage: [threshold: 85]
    ]
  end

  defp deps do
    [
      # Umbrella dependencies (explicit, compile-time verified)
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic_storage_ecto, in_umbrella: true},
      {:prismatic_agents, in_umbrella: true},
      {:prismatic_telemetry, in_umbrella: true},

      # External dependencies
      {:jason, "~> 1.4"},
      {:req, "~> 0.5"}
    ]
  end
end
```

### Dependency Graph Topology

The dependency graph follows a layered architecture with strict directionality. Higher-layer applications may depend on lower-layer applications, but never the reverse.

```
Layer 4 (Web)        prismatic_web --> prismatic_api
                          |                |
Layer 3 (Domain)     prismatic_perimeter   prismatic_agents
                          |         \       /        |
Layer 2 (Service)    prismatic_osint_core  prismatic_events
                          |                |
Layer 1 (Storage)    prismatic_storage_ecto prismatic_storage_ets
                          |                |
Layer 0 (Core)       prismatic_storage_core  prismatic_core
```

Circular dependencies are detected at compile time by Mix and blocked by the CI pipeline. The platform uses `mix xref graph --format=dot` to visualize the dependency graph and identify potential architectural violations.

### Facade Pattern for Public APIs

Each application exposes its public API through a single facade module, preventing external callers from depending on internal implementation details:

```elixir
defmodule PrismaticPerimeter do
  @moduledoc """
  Public API for External Attack Surface Management.

  All external access to Perimeter functionality MUST go through
  this module. Internal modules are private implementation details.
  """

  @spec discover(String.t()) :: {:ok, Surface.t()} | {:error, term()}
  defdelegate discover(domain), to: PrismaticPerimeter.Discovery.Engine

  @spec security_rating(String.t()) :: {:ok, Rating.t()} | {:error, term()}
  defdelegate security_rating(domain), to: PrismaticPerimeter.Rating.Calculator

  @spec assess_compliance(String.t(), [atom()]) :: {:ok, Assessment.t()} | {:error, term()}
  defdelegate assess_compliance(domain, frameworks),
    to: PrismaticPerimeter.Compliance.Assessor
end
```

This pattern ensures that refactoring internal modules within an application never breaks callers in other applications. The facade is the contract; everything behind it is an implementation detail.

## Configuration Architecture

### Shared Configuration

The umbrella root provides shared configuration that all applications inherit:

```elixir
# config/config.exs
import Config

config :prismatic_platform,
  ecto_repos: [PrismaticStorage.Repo],
  generators: [timestamp_type: :utc_datetime_usec]

# Import per-app configuration
import_config "../apps/*/config/config.exs"
```

### Environment-Specific Overrides

Production, staging, and development environments override shared defaults:

```elixir
# config/prod.exs
import Config

config :prismatic_perimeter,
  scan_concurrency: 50,
  rate_limit_per_second: 100,
  discovery_timeout_ms: 30_000

config :prismatic_web,
  cache_static_manifest: "priv/static/cache_manifest.json"

config :prismatic_storage_ecto,
  pool_size: 20,
  queue_target: 50,
  queue_interval: 1000
```

### Runtime Configuration

For secrets and environment-specific values that should not be compiled into releases:

```elixir
# config/runtime.exs
import Config

if config_env() == :prod do
  config :prismatic_storage_ecto, PrismaticStorage.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "20"))

  config :prismatic_perimeter,
    api_key: System.fetch_env!("PERIMETER_API_KEY")
end
```

## Testing Strategy

### Independent Application Testing

Each application has its own test suite that can run in isolation:

```bash
# Test a single application (fast, focused)
mix test apps/prismatic_perimeter/test/

# Test with specific tags
mix test apps/prismatic_perimeter/test/ --only integration

# Test all storage adapters against the contract
mix test apps/prismatic_storage_ets/test/
mix test apps/prismatic_storage_ecto/test/
```

### Contract Testing Across Applications

The [storage adapters](@/architecture/storage-adapters.md) demonstrate a powerful umbrella testing pattern: contract tests defined once in `prismatic_storage_core` and executed by every adapter implementation.

```elixir
# In prismatic_storage_core: define the contract
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc "Shared contract tests for all storage adapters"

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      describe "CRUD contract" do
        test "insert and retrieve" do
          {:ok, id} = unquote(adapter).insert(:test, %{name: "test"})
          {:ok, record} = unquote(adapter).get(:test, id)
          assert record.name == "test"
        end

        test "update existing" do
          {:ok, id} = unquote(adapter).insert(:test, %{name: "original"})
          :ok = unquote(adapter).update(:test, id, %{name: "updated"})
          {:ok, record} = unquote(adapter).get(:test, id)
          assert record.name == "updated"
        end

        test "delete existing" do
          {:ok, id} = unquote(adapter).insert(:test, %{name: "doomed"})
          :ok = unquote(adapter).delete(:test, id)
          {:error, :not_found} = unquote(adapter).get(:test, id)
        end
      end
    end
  end
end

# In prismatic_storage_ets: run the contract
defmodule PrismaticStorageEts.ContractTest do
  use PrismaticStorage.AdapterContractTest,
    adapter_module: PrismaticStorageEts.Adapter
end
```

### Full Integration Testing

The complete test suite runs across all 90 applications with 5,864 test files:

```bash
# Full suite with coverage
mix test --cover

# Parallel execution (default)
mix test --max-cases 16
```

## Release and Deployment

### Single Consolidated Release

The primary deployment model packages all applications into a single OTP [release](@/glossary/release.md):

```elixir
# mix.exs (umbrella root)
def project do
  [
    apps_path: "apps",
    releases: [
      prismatic_platform: [
        include_executables_for: [:unix],
        applications: [
          prismatic: :permanent,
          prismatic_web: :permanent,
          prismatic_api: :permanent,
          prismatic_agents: :permanent,
          prismatic_perimeter: :permanent,
          prismatic_storage_ecto: :permanent,
          prismatic_telemetry: :permanent
        ]
      ]
    ]
  ]
end
```

### Selective Releases

For specialized deployment scenarios, the umbrella supports building releases with subsets of applications:

```elixir
# Standalone perimeter scanner (no web UI)
prismatic_perimeter_scanner: [
  applications: [
    prismatic_perimeter: :permanent,
    prismatic_storage_core: :permanent,
    prismatic_storage_ecto: :permanent,
    prismatic_telemetry: :permanent
  ]
]

# Web-only deployment (behind API gateway)
prismatic_web_only: [
  applications: [
    prismatic_web: :permanent,
    prismatic_api: :permanent,
    prismatic_storage_ecto: :permanent
  ]
]
```

## Cross-Application Communication

Applications within the umbrella communicate through three primary mechanisms, each suited to different interaction patterns.

### Direct Function Calls (Synchronous)

For request-response interactions within the same node:

```elixir
# prismatic_web calling prismatic_perimeter
def handle_event("discover", %{"domain" => domain}, socket) do
  case PrismaticPerimeter.discover(domain) do
    {:ok, surface} -> {:noreply, assign(socket, :surface, surface)}
    {:error, reason} -> {:noreply, put_flash(socket, :error, inspect(reason))}
  end
end
```

### PubSub (Asynchronous, Decoupled)

For event-driven communication where the publisher should not know about subscribers. This integrates with the [event sourcing](@/architecture/event-sourcing.md) architecture and the [PubSub system](@/architecture/pubsub.md):

```elixir
# Publisher in prismatic_perimeter
Phoenix.PubSub.broadcast(
  PrismaticPubSub,
  "perimeter:assets:discovered",
  {:asset_discovered, %{domain: "example.com", assets: assets}}
)

# Subscriber in prismatic_web (LiveView dashboard)
def mount(_params, _session, socket) do
  Phoenix.PubSub.subscribe(PrismaticPubSub, "perimeter:assets:discovered")
  {:ok, socket}
end

def handle_info({:asset_discovered, data}, socket) do
  {:noreply, stream_insert(socket, :assets, data)}
end
```

### Process Registry (Named Lookup)

For locating specific processes across application boundaries:

```elixir
# Any application can look up an agent by ID
case Registry.lookup(PrismaticAgents.Registry, {:agent, agent_id}) do
  [{pid, _metadata}] -> GenServer.call(pid, :status)
  [] -> {:error, :agent_not_found}
end
```

## Quality Metrics and Enforcement

The umbrella architecture enables per-application quality measurement and enforcement through the [quality gates](@/capabilities/quality-gates.md) system.

| Metric | Value | Enforcement |
|--------|-------|-------------|
| Total applications | 90 | Tracked in [quality DNA](@/glossary/quality-dna.md) |
| Total Elixir files | 13,223 | Git tree indexed |
| Lines of code | ~2.8M | Measured per app |
| Test files | 5,864 | Per-app coverage required |
| Compilation warnings | 0 | `--warnings-as-errors` enforced |
| [Credo](@/glossary/credo.md) violations | 0 | `--strict` mode enforced |
| [Dialyzer](@/glossary/dialyzer.md) violations | 0 | PLT checked per app |
| [Typespec](@/glossary/typespec.md) coverage | 100% | All public functions |

Each application maintains its own `CLAUDE.md` documentation file and quality DNA state, enabling the [autonomous self-healing](@/capabilities/autonomous-self-healing.md) system to track and improve quality at the per-application level.

## Performance Impact of Umbrella Organization

The umbrella structure has measurable performance benefits during development:

| Operation | Monolith (estimated) | Umbrella (measured) | Improvement |
|-----------|---------------------|--------------------|----|
| Incremental compilation (1 file) | 15-30s | 1-3s | 10x |
| Single app test suite | N/A (monolithic) | 2-10s | Focused |
| Full test suite | 5-10 min | 3-5 min | Parallel |
| Dependency resolution | Single pass | Per-app cached | Faster iterations |
| Dialyzer analysis | Full codebase | Per-app PLT | 5x faster |

At runtime, the umbrella organization has zero overhead. All applications are loaded into the same BEAM node and communicate through the same mechanisms as a single application. The boundaries are purely a compile-time and organizational construct.

## Summary

The [umbrella application](@/glossary/umbrella-application.md) architecture gives the Prismatic Platform the modularity of [microservices](@/glossary/microservices.md) with the operational simplicity of a monolith. By enforcing explicit dependency declarations, facade-based public APIs, and layered dependency directionality, the architecture scales to 90 applications and 2.8 million lines of code without degrading into either a tangled monolith or a coordination-heavy [distributed system](@/glossary/distributed-system.md). Combined with [OTP supervision trees](@/architecture/supervision-trees.md) for [fault tolerance](@/glossary/fault-tolerance.md), [event sourcing](@/architecture/event-sourcing.md) for state management, and [telemetry](@/architecture/telemetry.md) for [observability](@/glossary/observability.md), the umbrella architecture provides the structural foundation for a platform that evolves rapidly while maintaining production-grade reliability.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)