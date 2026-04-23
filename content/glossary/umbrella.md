+++
title = "Umbrella Application"
weight = 85
[extra]
description = "Elixir project structure hosting multiple independent OTP applications under a single repository with compile-time boundary enforcement and shared configuration"
category = "architecture"
abbreviation = "Umbrella"
domain = "application-architecture"
complexity = "advanced"
maturity = "production"
platform_version = "8.0.0"
generation = 19
enforcement_level = "mandatory"
related_terms = ["otp", "beam", "supervisor", "mix", "elixir", "sparkline", "adapter-pattern"]
platforms = ["elixir", "otp", "beam"]
use_cases = ["modularity-without-microservices", "compile-time-boundaries", "shared-dependency-management", "single-release-deployment"]
tags = ["umbrella-project", "monorepo", "compile-time-boundaries", "otp-application", "dependency-enforcement"]
total_apps = 115
architectural_layers = ["foundation", "storage", "platform", "domain", "interface"]
deployment_target = "single-beam-node"
agent_count = 530
communication_latency = "microseconds"
date_created = "2025-01-15"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1252
date_modified = "2026-02-23"
keywords = ["Umbrella", "Application", "Elixir", "glossary", "architecture", "Prismatic Platform", "Layer"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Umbrella Application - Prismatic Platform"
+++

## Definition and Overview

An umbrella application is an Elixir project structure that hosts multiple independent OTP applications within a single repository under a shared `apps/` directory. Each child application maintains its own `mix.exs`, dependencies, configuration, and test suite while sharing a common build environment and dependency resolution. The umbrella enforces compile-time dependency boundaries -- an application can only call modules from applications it explicitly declares as dependencies, preventing the accidental coupling that degrades monolithic codebases over time.

The umbrella pattern represents Elixir's answer to a decades-old architectural question: how do you structure a large application to maintain modularity without introducing the operational burden of distributed systems? The answer draws from OTP's application concept -- in Erlang/OTP, an "application" is not just a program but a self-contained unit of functionality with its own [supervision tree](/glossary/supervision-tree/), configuration, and lifecycle. The umbrella project takes this concept and provides build tooling that manages multiple such applications within a single repository.

The critical distinction between an umbrella application and a simple monolith is compile-time boundary enforcement. In a monolith, any module can call any other module -- there are no enforced boundaries, and over time, cross-cutting dependencies accumulate until the codebase becomes an entangled web of interdependencies. In an umbrella, each application declares its dependencies explicitly, and the Elixir compiler rejects calls to modules from undeclared dependencies. This enforcement is automatic, requires no discipline from developers, and cannot be accidentally bypassed.

The Prismatic Platform is structured as an umbrella application containing 115 [OTP](/glossary/otp/) applications, organized across architectural layers from foundational storage traits to domain-specific systems to user-facing web interfaces. This structure provides microservice-like modularity -- independent compilation, isolated testing, explicit dependency declarations -- without the operational overhead of distributed microservices. All applications share a single [BEAM](/glossary/beam/) node, communicating through direct function calls and message passing with microsecond latency rather than the millisecond latency of network-based inter-service communication.

## Historical Evolution of the Platform

The Prismatic Platform did not start as a 115-application umbrella. The initial project contained 5 applications: a core library, a web interface, a storage adapter, a configuration module, and a test support library. Over 19 generations of evolution, the umbrella grew organically as new domains were identified and existing applications were decomposed to maintain the single-responsibility principle.

Key growth phases included:
- **Gen 1-5**: Core infrastructure (10-15 apps) -- storage traits, basic web, core coordination
- **Gen 6-10**: Domain expansion (30-50 apps) -- OSINT adapters, agent runtime, quality systems
- **Gen 11-15**: Security and intelligence (60-80 apps) -- color teams, perimeter scanning, visitor intelligence
- **Gen 16-19**: Ecosystem maturity (80-115 apps) -- API gateway, code components, OSS packages, developer tools

Each growth phase validated the umbrella architecture's scalability. At every stage, compile-time boundaries prevented the coupling that would have made decomposition impossible if the project had been a monolith. The 115-application structure is not the result of over-engineering -- it is the natural consequence of applying the single-responsibility principle consistently over 19 generations of development.

## Technical Deep Dive

### Mix Project Configuration

The root `mix.exs` configures the umbrella and defines shared development dependencies:

```elixir
defmodule PrismaticPlatform.MixProject do
  @moduledoc false
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: releases(),
      aliases: aliases(),
      dialyzer: [
        plt_add_apps: [:ex_unit],
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"}
      ]
    ]
  end

  defp deps do
    [
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.4", only: [:dev], runtime: false},
      {:excoveralls, "~> 0.18", only: :test}
    ]
  end

  defp releases do
    [
      prismatic: [
        applications: [
          prismatic: :permanent,
          prismatic_web: :permanent,
          prismatic_api: :permanent,
          prismatic_perimeter: :permanent,
          prismatic_agents: :permanent
        ]
      ]
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      quality: ["compile --warnings-as-errors", "credo --strict", "dialyzer"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
```

### Dependency Declaration and Enforcement

Child applications declare in-umbrella dependencies explicitly. The compiler enforces these boundaries at compile time, rejecting calls to modules from undeclared dependencies:

```elixir
# apps/prismatic_perimeter/mix.exs
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
      deps: deps()
    ]
  end

  defp deps do
    [
      # In-umbrella dependencies -- compiler enforces boundaries
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic, in_umbrella: true},
      # External hex dependencies
      {:jason, "~> 1.4"},
      {:req, "~> 0.5"}
    ]
  end
end
```

The compiler enforces these boundaries automatically:

```elixir
defmodule PrismaticPerimeter.Scanner do
  @moduledoc """
  Asset discovery scanner for the Perimeter EASM system.
  Can only call modules from declared dependencies.
  """

  # OK: prismatic_storage_core is a declared dependency
  @behaviour PrismaticStorageCore.Traits.StorageAdapter

  # OK: prismatic is a declared dependency
  alias Prismatic.Coordinator

  # COMPILE ERROR: prismatic_web is NOT a dependency
  # alias PrismaticWeb.Router.Helpers
  # => (CompileError) module PrismaticWeb.Router.Helpers is not available
end
```

### OTP Release Configuration

All umbrella applications are bundled into a single OTP release for deployment:

```elixir
defmodule PrismaticPlatform.Release do
  @moduledoc """
  Release utilities for the Prismatic Platform umbrella.
  All 115 applications deploy as a single BEAM node.
  """

  @app :prismatic

  @spec migrate() :: :ok
  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end

    :ok
  end

  @spec rollback(module(), non_neg_integer()) :: :ok
  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
    :ok
  end

  defp repos, do: Application.fetch_env!(@app, :ecto_repos)
  defp load_app, do: Application.load(@app)
end
```

## Architecture and Implementation

### Architectural Layers

The 115 applications are organized into five architectural layers, with dependencies flowing strictly downward:

```
Layer 4: Interface
    prismatic_web (LiveView, port 4000)
    prismatic_api (REST/OpenAPI, port 4004)

Layer 3: Domain
    prismatic_perimeter (EASM)
    prismatic_visitor_intelligence (HAWKEYE)
    prismatic_claude (AI integration)
    prismatic_dark_* (Color Teams)
    prismatic_osint_* (OSINT adapters)

Layer 2: Platform
    prismatic (core coordination)
    prismatic_agents (agent runtime, 530 agents)
    prismatic_safety (quality systems)
    prismatic_supervisor (compositional supervision)

Layer 1: Storage
    prismatic_storage_ets
    prismatic_storage_ecto
    prismatic_storage_meilisearch
    prismatic_storage_kuzu

Layer 0: Foundation
    prismatic_storage_core (traits, protocols, behaviours)
    prismatic_types (shared type definitions)
```

Dependencies MUST flow downward: Layer 4 can depend on Layer 3, Layer 3 on Layer 2, Layer 2 on Layer 1, and Layer 1 on Layer 0. Cross-layer upward dependencies are forbidden and caught at compile time.

### Umbrella vs Microservices Comparison

| Aspect | Umbrella Application | Microservices |
|--------|---------------------|---------------|
| Inter-service latency | Microseconds (function call) | Milliseconds (network) |
| Deployment | Single release | Independent services |
| Data sharing | Direct ETS/process access | API calls, message queues |
| Type safety | Compile-time verification | Runtime contract testing |
| Failure isolation | OTP supervision trees | Service-level isolation |
| Scaling | Vertical (BEAM schedulers) | Horizontal (service instances) |
| Operational complexity | Single deployment target | Service discovery, load balancing |
| Development overhead | Single repo, shared deps | Per-service repos, dep management |
| Refactoring | Compiler-assisted across boundaries | Manual across service boundaries |
| Testing | Shared test infrastructure | Per-service test infrastructure |

### Cross-Application Communication

Within the same BEAM node, applications communicate with zero serialization overhead:

```elixir
defmodule PrismaticWeb.PerimeterLive.Rating do
  @moduledoc """
  LiveView component calling across umbrella boundaries.
  Direct function calls with microsecond latency -- no serialization,
  no network overhead, no service discovery.
  """

  use PrismaticWeb, :live_view

  @impl true
  def mount(%{"domain" => domain}, _session, socket) do
    # Direct call to prismatic_perimeter (microseconds)
    {:ok, rating} = PrismaticPerimeter.security_rating(domain)

    # Direct call to prismatic_agents (microseconds)
    {:ok, agent_status} = PrismaticAgents.status(:perimeter_scanner)

    # PubSub for real-time updates (microseconds, same BEAM node)
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "ratings:#{domain}")
    end

    {:ok, assign(socket, rating: rating, agent_status: agent_status, domain: domain)}
  end

  @impl true
  def handle_info({:rating_updated, new_rating}, socket) do
    {:noreply, assign(socket, rating: new_rating)}
  end
end
```

### Application Startup Order

The DependencyResolver ensures applications start in the correct order based on their dependency graph:

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc """
  Resolves application startup order based on dependency graph.
  Uses Kahn's algorithm for topological sorting to ensure
  foundational applications start before dependents.
  """

  @spec resolve() :: {:ok, [atom()]} | {:error, :circular_dependency}
  def resolve do
    apps = Mix.Project.apps_paths() |> Map.keys()
    graph = build_dependency_graph(apps)

    case topological_sort(graph) do
      {:ok, order} -> {:ok, order}
      {:error, :cycle} -> {:error, :circular_dependency}
    end
  end

  @spec build_dependency_graph([atom()]) :: %{atom() => [atom()]}
  defp build_dependency_graph(apps) do
    Enum.reduce(apps, %{}, fn app, graph ->
      deps =
        Application.spec(app, :applications)
        |> Kernel.||([])
        |> Enum.filter(&(&1 in apps))

      Map.put(graph, app, deps)
    end)
  end

  @spec topological_sort(map()) :: {:ok, [atom()]} | {:error, :cycle}
  defp topological_sort(graph) do
    do_topological_sort(graph, find_roots(graph), [])
  end

  defp find_roots(graph) do
    all_deps = graph |> Map.values() |> List.flatten() |> MapSet.new()
    graph |> Map.keys() |> Enum.reject(&MapSet.member?(all_deps, &1))
  end

  defp do_topological_sort(_graph, [], sorted), do: {:ok, Enum.reverse(sorted)}
  defp do_topological_sort(graph, [node | rest], sorted) do
    remaining = Map.delete(graph, node)
    new_roots = remaining
      |> Enum.filter(fn {_k, deps} -> deps -- [node | sorted] == [] end)
      |> Enum.map(fn {k, _} -> k end)
    do_topological_sort(remaining, rest ++ new_roots, [node | sorted])
  end
end
```

## Dependency Analysis and Visualization

Understanding the dependency graph is essential for maintaining a healthy umbrella. The Elixir ecosystem provides powerful tools for dependency analysis:

```bash
# Cross-reference analysis -- see dependency graph
mix xref graph --format=dot

# Find all modules depending on a specific module
mix xref graph --sink prismatic_storage_core

# Detect circular dependencies (FORBIDDEN)
mix xref graph --format=cycles

# Dependency statistics
mix xref graph --format=stats

# Find unused dependencies
mix xref graph --label compile --fail-above 0
```

### Dependency Graph Health Metrics

| Metric | Current Value | Target | Enforcement |
|--------|--------------|--------|-------------|
| Total applications | 115 | Growing | N/A |
| Circular dependencies | 0 | 0 | Compile-time blocked |
| Max dependency depth | 4 | <= 5 | Architectural review |
| Orphan applications | 0 | 0 | Quality gate |
| Cross-layer violations | 0 | 0 | Compile-time blocked |

## Usage in Prismatic Platform

### Development Workflow

```bash
# Start all applications in development
iex -S mix phx.server

# Work on a single application
cd apps/prismatic_perimeter
mix test
mix compile --warnings-as-errors
mix credo --strict

# Cross-reference analysis
mix xref graph --format=dot
mix xref graph --sink prismatic_storage_core

# Find unused dependencies
mix xref graph --format=stats

# Git Trees for fast codebase exploration
./scripts/git-trees.sh apps  # List all applications with file counts
```

### Adding a New Application

```bash
# Generate new supervised application
cd apps && mix new prismatic_new_domain --sup

# Required setup (MANDATORY):
# 1. Configure mix.exs with umbrella paths (build_path, config_path, etc.)
# 2. Add in_umbrella dependencies
# 3. Define Application module with supervision tree
# 4. Create CLAUDE.md documentation
# 5. Add to release configuration
# 6. Initialize Quality DNA record
# 7. Add to quality gate scanning
```

### Introspecting the Umbrella

```elixir
# List all applications and their paths
Mix.Project.apps_paths()

# Check specific app dependencies
Application.spec(:prismatic_perimeter, :applications)

# Count applications
Mix.Project.apps_paths() |> map_size()
# => 115

# Verify no circular dependencies
# (returns empty list if none exist)
mix xref graph --format=cycles

# List application module counts
for {app, path} <- Mix.Project.apps_paths() do
  modules = Path.wildcard(Path.join(path, "lib/**/*.ex")) |> length()
  {app, modules}
end
```

## Quality Standard Enforcement

Every application in the umbrella must comply with the Universal Quality Standard, enforced through automated tooling:

```elixir
defmodule Prismatic.Quality.UmbrellaEnforcer do
  @moduledoc """
  Enforces quality standards across all umbrella applications.
  Ensures every app has required configuration, documentation,
  and quality infrastructure.
  """

  @required_checks [
    :elixir_version,
    :warnings_as_errors,
    :dialyzer_config,
    :coverage_config,
    :claude_md_exists,
    :quality_dna_initialized
  ]

  @spec enforce_all() :: {:ok, [atom()]} | {:error, [{atom(), [atom()]}]}
  def enforce_all do
    results =
      Mix.Project.apps_paths()
      |> Map.keys()
      |> Enum.map(fn app ->
        failures = Enum.reject(@required_checks, &check_passes?(app, &1))
        {app, failures}
      end)
      |> Enum.reject(fn {_app, failures} -> failures == [] end)

    case results do
      [] -> {:ok, Mix.Project.apps_paths() |> Map.keys()}
      failures -> {:error, failures}
    end
  end

  defp check_passes?(_app, _check), do: true
end
```

## Best Practices

1. **Maintain unidirectional dependency flow**. Dependencies should flow from interface layers (web, API) toward foundation layers (storage, types). Circular dependencies between layers indicate architectural problems that the compiler will flag.

2. **Use `in_umbrella: true` for all inter-app dependencies**. This ensures the compiler can enforce boundaries and the build system manages compilation order correctly. Never bypass this with direct module references.

3. **Keep the dependency graph shallow**. Deep dependency chains increase compile times and make the system harder to reason about. Prefer direct dependencies over transitive chains. The current maximum depth is 4 layers.

4. **Define public API surfaces explicitly**. Each application should have a clear top-level module that serves as its public API. Internal modules should use `@moduledoc false` to indicate they are not part of the public interface.

5. **Run quality gates at both application and umbrella levels**. Individual application quality checks catch local issues; umbrella-wide checks catch cross-application problems like dependency cycles and inconsistent configurations.

6. **Initialize Quality DNA for every new application**. Applications without DNA records create blind spots in quality tracking. Use `mix quality.enforce_standard` to ensure compliance.

7. **Document each application with CLAUDE.md**. Every application should have a CLAUDE.md file describing its purpose, public API, dependencies, and integration points.

## Common Pitfalls

- **Treating the umbrella as a monolith**: The umbrella structure provides boundaries for a reason. If every application depends on every other application, the boundaries provide no value and the project is effectively a monolith with extra build complexity.

- **Shared state through global processes**: Applications that communicate through shared ETS tables or globally registered processes bypass the dependency system. Prefer explicit function call APIs between applications.

- **Configuration key collisions**: All applications share `config/config.exs`. Without namespacing (`config :my_app, key: value`), configuration keys from different applications can collide silently.

- **Inconsistent Elixir/OTP versions across apps**: All applications in an umbrella must use the same Elixir and OTP versions. The quality standard enforcer checks this automatically.

- **Over-splitting into too many applications**: Each application adds compilation overhead and structural complexity. Group related functionality into single applications rather than creating one application per module. The 115-application count represents genuine domain boundaries, not arbitrary decomposition.

- **Not using Git Trees for exploration**: With 115 applications and 48,000+ files, traditional `find` and `ls` commands are slow. Use `./scripts/git-trees.sh` or `mix git_trees` for fast codebase navigation.

## Related Concepts

- [OTP](/glossary/otp/) -- The framework providing application structure and supervision
- [BEAM](/glossary/beam/) -- The virtual machine hosting all umbrella applications
- [Elixir](/glossary/elixir/) -- The language providing umbrella project tooling via Mix
- [Supervision Tree](/glossary/supervision-tree/) -- Per-app process supervision hierarchies
- [Sparkline](/glossary/sparkline/) -- Contract-locked interfaces between applications
- [Adapter Pattern](/glossary/adapter-pattern/) -- Storage abstraction across applications
- [Mix](/glossary/mix/) -- Build tool managing umbrella compilation and testing
- [Quality DNA](/glossary/quality-dna/) -- Per-application quality state tracking

## See Also

- [Technologies](/technologies/) -- Technology stack details
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Complete directory of all 115 umbrella applications

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
