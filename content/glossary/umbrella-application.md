+++
title = "Umbrella Application"
weight = 6
[extra]
description = "Elixir/OTP project structure housing 115 interconnected applications under a single repository with compile-time boundary enforcement and shared deployment"
category = "architecture"
related_terms = ["otp", "supervision-tree", "adapter-pattern", "umbrella", "hex", "mix", "openapi-spec", "phoenix-liveview", "elixir", "beam"]
keywords = ["Elixir umbrella project", "OTP umbrella application", "monorepo Elixir", "umbrella mix project", "modular Elixir architecture", "compile-time boundaries", "umbrella dependency management", "multi-app Elixir"]
tags = ["architecture", "elixir", "otp", "monorepo"]
difficulty = "intermediate"
audience = ["elixir-developers", "architects", "platform-engineers"]
domain = "architecture"
stability = "stable"
since_version = "1.0.0"
app_count = 115
source_files = 6652
test_files = 5883
dependency_model = "DAG"
build_tool = "Mix"
deployment_model = "single OTP release"
see_also = ["architecture", "technologies", "apps"]
prerequisites = ["elixir", "otp", "mix"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1388
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Umbrella Application - Prismatic Platform"
+++

## Definition and Overview

An Umbrella Application is an [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) project structure that houses multiple interconnected applications within a single repository under a shared `apps/` directory. Each child application maintains its own `mix.exs`, dependencies, [supervision tree](/glossary/supervision-tree/), configuration, and test suite while sharing a common build system, dependency resolution, and deployment pipeline. This structure enables modular architecture with clear compile-time boundaries between domains while avoiding the operational complexity of distributed microservices.

The umbrella pattern addresses a fundamental tension in software architecture: the need for both modularity (clear boundaries, independent development, isolated failure) and integration (shared data types, direct function calls, coordinated deployment). Microservices provide modularity but impose distributed systems complexity -- network latency, serialization overhead, service discovery, partial failure handling. Monoliths provide integration but resist modularity -- everything depends on everything, changes in one area affect others, testing requires the entire system. Umbrella applications provide a third option: monorepo modularity with monolith integration.

In an umbrella project, each child application is a first-class OTP application with its own `Application` module, supervision tree, and process hierarchy. Applications declare dependencies on each other explicitly in their `mix.exs` files, and the compiler enforces these boundaries -- an application cannot call modules from another application unless it declares the dependency. This compile-time enforcement prevents the gradual erosion of boundaries that plagues monolithic applications, where any module can call any other module without restriction.

The deployment model for umbrella applications differs fundamentally from microservices. All child applications are compiled into a single OTP release and run within a single [BEAM](/glossary/beam/) virtual machine instance. This means inter-application communication uses direct function calls (microsecond latency) rather than network requests (millisecond latency), applications share the same [ETS](/glossary/ets/) tables and process registry, and a single deployment unit contains the entire system. The trade-off is that all applications must be deployed together, but the benefit is dramatically simpler operations and orders-of-magnitude lower communication latency.

The Prismatic Platform uses an umbrella structure containing 115 OTP applications, from foundational layers (`prismatic_storage_core`, `prismatic`) to domain-specific systems (`prismatic_perimeter`, `prismatic_agents`, `prismatic_web`) to specialized adapters (`prismatic_storage_ets`, `prismatic_storage_ecto`, `prismatic_storage_meilisearch`). This structure supports the platform's 6,652 Elixir source files, 5,864 test files, and enables teams of agents to work on isolated domains without creating conflicts across the codebase.

## Historical Context and Motivation

The umbrella pattern in Elixir emerged from the Erlang/OTP tradition of building systems as collections of loosely coupled applications. In Erlang, large systems like the AXD 301 switch were composed of hundreds of OTP applications, each with its own supervision tree and deployment configuration. Elixir's Mix build tool formalized this pattern through the `--umbrella` flag, providing project generation, dependency management, and build orchestration specifically designed for multi-application projects.

The Prismatic Platform adopted the umbrella structure early in its evolution (Generation 1-3) when it became clear that a monolithic approach would not scale to the platform's ambitions. The initial five applications (`prismatic_storage_core`, `prismatic`, `prismatic_web`, `prismatic_storage_ets`, `prismatic_storage_ecto`) established the foundational layers. By Generation 10, the platform had grown to 50+ applications, and by Generation 19, it encompasses 115 applications across multiple domains.

The growth from 5 to 115 applications validated the umbrella decision. Adding a new domain (e.g., `prismatic_perimeter` for EASM, or `prismatic_api` for the REST gateway) requires creating a new application directory with its own mix.exs, declaring its dependencies, and implementing its supervision tree. The existing applications are unaffected, and the new application can be developed and tested in isolation before being integrated into the release.

## Technical Deep Dive

### Umbrella Project Structure

The Prismatic Platform follows the standard Elixir umbrella layout with domain-organized applications:

```
prismatic-platform/
  mix.exs                    # Root mix.exs (umbrella config)
  mix.lock                   # Shared dependency lock file
  config/
    config.exs               # Shared configuration
    dev.exs                  # Development overrides
    test.exs                 # Test configuration
    prod.exs                 # Production configuration
    runtime.exs              # Runtime configuration
  apps/
    prismatic_storage_core/  # Foundation: traits, protocols, behaviours
      mix.exs                # Own deps: none (leaf application)
      lib/
      test/
      CLAUDE.md              # Application documentation
    prismatic/               # Core: coordination, API facades
      mix.exs                # Deps: prismatic_storage_core, ...
      lib/
      test/
    prismatic_web/           # Web: Phoenix, LiveView
      mix.exs                # Deps: prismatic, phoenix, ...
      lib/
      test/
    prismatic_perimeter/     # EASM: scanning, rating, compliance
      mix.exs                # Deps: prismatic, prismatic_storage_core, ...
      lib/
      test/
    prismatic_api/           # REST API: auto-introspecting gateway
      mix.exs                # Deps: prismatic, open_api_spex, ...
      lib/
      test/
    prismatic_agents/        # Agent runtime: 530 agents
      mix.exs                # Deps: prismatic_storage_core, ...
      lib/
      test/
    ...                      # 109 more applications
```

### Application Dependency Management

Each child application declares its dependencies explicitly, and the compiler enforces these boundaries:

```elixir
defmodule PrismaticPerimeter.MixProject do
  @moduledoc false
  use Mix.Project

  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls],
      dialyzer: [plt_add_apps: [:ex_unit]],
      compilers: Mix.compilers(),
      aliases: aliases()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {PrismaticPerimeter.Application, []}
    ]
  end

  defp deps do
    [
      # Umbrella dependencies (compile-time enforced)
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic, in_umbrella: true},

      # External dependencies
      {:jason, "~> 1.4"},
      {:req, "~> 0.5"},
      {:telemetry, "~> 1.2"}
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp aliases do
    [
      quality: ["compile --warnings-as-errors", "credo --strict", "dialyzer"]
    ]
  end
end
```

The `in_umbrella: true` flag instructs Mix to resolve the dependency from the local `apps/` directory rather than Hex. This provides the same compile-time dependency enforcement as external packages but with local resolution.

### Per-Application Supervision Trees

Each umbrella application defines its own [supervision tree](/glossary/supervision-tree/), creating an isolated process hierarchy:

```elixir
defmodule PrismaticPerimeter.Application do
  @moduledoc """
  OTP Application for Prismatic Perimeter EASM.
  Defines the supervision tree for scanning, rating, and compliance.
  Uses rest_for_one strategy because downstream processes depend
  on the asset store and rating cache.
  """
  use Application

  @impl Application
  def start(_type, _args) do
    children = [
      # Core data stores (must start first)
      PrismaticPerimeter.AssetStore,
      PrismaticPerimeter.RatingCache,

      # Scanning subsystem (depends on stores)
      {PrismaticPerimeter.Scanner.Supervisor, []},

      # Rating engine (depends on stores and scanner)
      PrismaticPerimeter.Rating.Engine,

      # Compliance assessor (depends on rating engine)
      PrismaticPerimeter.Compliance.Assessor,

      # Task supervisor for parallel operations
      {Task.Supervisor, name: PrismaticPerimeter.TaskSupervisor}
    ]

    opts = [strategy: :rest_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Compile-Time Boundary Enforcement

The compiler prevents unauthorized cross-application dependencies. This is a structural guarantee, not a convention:

```elixir
defmodule PrismaticPerimeter.Example do
  @moduledoc false

  # This works: prismatic_storage_core is a declared dependency
  alias PrismaticStorageCore.Traits.StorageAdapter

  # This works: prismatic is a declared dependency
  alias Prismatic.Coordinator

  # This would FAIL at compile time if prismatic_web is NOT
  # listed in deps. The compiler enforces the boundary.
  # alias PrismaticWeb.Router  # => CompileError
end
```

This enforcement is what distinguishes umbrella applications from a monolith organized into directories. In a typical monolith, any module can import any other module without restriction. In an umbrella, the dependency declarations create a compile-time contract that the toolchain enforces automatically.

### Dependency Graph

The platform's dependency graph forms a directed acyclic graph (DAG) with clear layering:

```
Layer 0 (no deps):     prismatic_storage_core
                              |
Layer 1 (core deps):   prismatic_storage_ets    prismatic_storage_ecto
                       prismatic_storage_meilisearch    prismatic_types
                              |
Layer 2 (platform):    prismatic    prismatic_agents    prismatic_safety
                       prismatic_supervisor
                              |
Layer 3 (domain):      prismatic_perimeter    prismatic_visitor_intelligence
                       prismatic_claude    prismatic_dark
                              |
Layer 4 (interface):   prismatic_web    prismatic_api
```

## Application Categories

The 115 umbrella applications fall into distinct architectural categories:

| Category | Count | Examples | Role |
|----------|-------|---------|------|
| Foundation | 5 | `prismatic_storage_core`, `prismatic_types` | Shared traits, protocols, types |
| Storage Adapters | 7 | `prismatic_storage_ets`, `prismatic_storage_ecto` | Data persistence implementations |
| Core Platform | 10 | `prismatic`, `prismatic_agents`, `prismatic_safety` | Platform coordination and quality |
| Domain Applications | 50+ | `prismatic_perimeter`, `prismatic_claude` | Business logic domains |
| Web/API | 3 | `prismatic_web`, `prismatic_api` | User-facing interfaces |
| Testing/Tooling | 15+ | `prismatic_test_helpers`, `prismatic_benchmarks` | Development infrastructure |
| Security | 10+ | `prismatic_dark`, Color Team implementations | Security operations |
| Ecosystem | 5+ | OSS packages, plugin systems | Open-source components |

### Cross-Application Communication Patterns

All inter-application communication occurs within a single BEAM instance, providing microsecond-level latency:

| Pattern | Mechanism | Latency | Use Case |
|---------|-----------|---------|----------|
| Direct function call | `Module.function(args)` | Microseconds | Synchronous queries |
| [GenServer](/glossary/genserver/) call | `GenServer.call(name, msg)` | Microseconds | Stateful operations |
| PubSub broadcast | `Phoenix.PubSub.broadcast/3` | Microseconds | Event notification |
| Telemetry events | `:telemetry.execute/3` | Microseconds | Observability |
| Task.async | `Task.async(fn -> ... end)` | Microseconds | Parallel computation |
| Outbox Pattern | Database + publisher | Milliseconds | Reliable cross-app events |

## Build and Test Isolation

The umbrella structure supports both whole-system and per-application operations:

```bash
# Compile all applications
mix compile

# Compile a single application (with dependencies)
mix compile --app prismatic_perimeter

# Run all tests across all applications
mix test

# Run tests for a single application
mix test apps/prismatic_perimeter/test/

# Run quality checks across all applications
mix quality.gates

# Run quality checks for a single application
cd apps/prismatic_perimeter && mix quality

# Check dependency graph for cycles
mix xref graph --format=cycles

# Visualize dependency graph
mix xref graph --format=dot | dot -Tpng -o deps.png
```

## Creating a New Umbrella Application

Adding a new domain to the platform follows a standardized process:

```bash
# Generate new application with supervision tree
cd apps
mix new prismatic_new_domain --sup

# The generated structure:
# apps/prismatic_new_domain/
#   mix.exs
#   lib/
#     prismatic_new_domain.ex
#     prismatic_new_domain/application.ex
#   test/
#     prismatic_new_domain_test.exs
#     test_helper.exs
```

After generation, the application needs configuration:

```elixir
# 1. Configure umbrella paths in mix.exs
# 2. Add in_umbrella dependencies
# 3. Define Application module with supervision tree
# 4. Create CLAUDE.md documentation
# 5. Add .claude/quality-dna/current-state.json
# 6. Configure quality gates (warnings_as_errors, dialyzer, etc.)
```

## Inter-Application Usage Patterns

```elixir
# From prismatic_web, calling prismatic_perimeter (direct function call)
defmodule PrismaticWeb.PerimeterLive.Dashboard do
  @moduledoc """
  LiveView dashboard for EASM security ratings.
  Calls PrismaticPerimeter directly for rating data.
  """
  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    {:ok, rating} = PrismaticPerimeter.security_rating("example.com")
    {:ok, assign(socket, rating: rating)}
  end
end

# From prismatic_api, using generic dispatch across umbrella apps
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic API controller that dispatches to any Prismatic facade module.
  Auto-discovered at boot time through module introspection.
  """

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    case Prismatic.dispatch(app, action, params) do
      {:ok, result} -> json(conn, %{status: "ok", data: result})
      {:error, reason} -> json(conn, %{status: "error", reason: inspect(reason)})
    end
  end
end
```

## Comparison with Alternative Architectures

| Architecture | Modularity | Integration | Deployment | Communication | Complexity |
|-------------|------------|-------------|------------|---------------|------------|
| **Umbrella** | Compile-time boundaries | Direct function calls | Single release | Microseconds | Moderate |
| **Monolith** | Directory conventions | Direct function calls | Single deploy | Microseconds | Low |
| **Microservices** | Service boundaries | HTTP/gRPC/messaging | Independent | Milliseconds | High |
| **Monorepo (multi-lang)** | Language boundaries | API contracts | Mixed | Variable | High |
| **Modular Monolith** | Package/module boundaries | Direct calls | Single deploy | Microseconds | Moderate |

## Best Practices

**Enforce strict dependency direction.** Dependencies should flow from higher layers (web, API) toward lower layers (core, storage). Never create circular dependencies between applications. Use `mix xref graph --format=cycles` to verify the dependency DAG regularly.

**Keep foundation applications dependency-free.** Applications like `prismatic_storage_core` that define traits and protocols should have zero umbrella dependencies. This ensures they can be compiled first and used by all other applications without creating bottlenecks.

**One supervision tree per application.** Each application should define its own `Application` module with a [supervision tree](/glossary/supervision-tree/). Do not rely on parent applications to supervise your processes.

**Test applications in isolation.** Each application's test suite should run independently. Cross-application integration tests belong in a dedicated test application or the root test suite.

**Document application boundaries in CLAUDE.md.** Every application should have a `CLAUDE.md` file that describes its purpose, public API, dependencies, and architectural constraints. This serves as the primary documentation for agent-driven development.

**Namespace configuration properly.** Use `config :prismatic_perimeter, key: value` rather than generic keys. Configuration key collisions are a common source of subtle bugs in umbrella projects.

**Define clear public API modules.** Each application should have a single public facade module (e.g., `PrismaticPerimeter`) that exposes its public API. Internal modules should use `@moduledoc false` to signal they are not part of the public contract.

## Common Pitfalls

**Circular dependencies between applications**: Application A depends on B and B depends on A. The compiler will reject this, but cycles involving three or more applications can be subtle. Use `mix xref graph --format=cycles` to detect them.

**Leaking internal modules across boundaries**: Applications that expose internal implementation details force consumers to depend on unstable interfaces. Define clear public API modules and use `@moduledoc false` for internal modules.

**Shared configuration confusion**: Umbrella applications share `config/config.exs`, which can lead to configuration key collisions. Always namespace configuration under the application name.

**Testing with cross-application side effects**: Tests in one application that depend on processes or state from another application create fragile, order-dependent test suites. Mock or stub cross-application dependencies in tests.

**Deploying individual applications independently**: While umbrella applications can be compiled independently, they are designed to be deployed together as a single OTP release. Attempting to deploy individual applications creates version skew.

**Growing applications instead of splitting them**: When an application exceeds 50-100 modules, it likely contains multiple distinct concerns that should be separate applications. Split proactively rather than letting applications become internal monoliths.

## Related Concepts

- [OTP](/glossary/otp/) -- The application framework underlying the umbrella structure
- [Supervision Tree](/glossary/supervision-tree/) -- Per-app process management hierarchies
- [Adapter Pattern](/glossary/adapter-pattern/) -- Cross-app storage abstraction layer
- [Phoenix LiveView](/glossary/phoenix-liveview/) -- Web framework application within the umbrella
- [Elixir](/glossary/elixir/) -- The language providing umbrella project tooling via Mix
- [BEAM](/glossary/beam/) -- Virtual machine hosting all umbrella applications in one instance
- [GenServer](/glossary/genserver/) -- Process abstraction used across all umbrella applications
- [ETS](/glossary/ets/) -- Shared in-memory storage accessible across applications
- [Supervisor](/glossary/supervisor/) -- OTP behavior managing processes within each application
- [Quality Debt](/glossary/quality-debt/) -- Quality tracking applied per-application

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory with all 115 umbrella applications

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
