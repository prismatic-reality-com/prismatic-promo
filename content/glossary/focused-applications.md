+++
title = "Focused Applications"
weight = 50
[extra]
tags = ["glossary", "architecture", "umbrella", "modularity", "elixir", "otp", "single-responsibility", "design-principle"]
description = "Focused applications are self-contained umbrella applications that each address a single, well-defined domain concern, enforcing the single responsibility principle at the application level and enabling independent development, testing, and deployment."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["umbrella-application", "bounded-context", "modularity", "composability", "domain-driven-design", "otp-application", "supervision-tree", "facade-modules", "project-structure", "microservices"]
key_takeaway = "Focused applications enforce single-responsibility at the application level, enabling 115 umbrella apps to evolve independently while maintaining clear boundaries, explicit dependencies, and composable interfaces."
version = "2.0.0"
word_count = 1974
date_modified = "2026-02-23"
keywords = ["Focused", "Applications", "glossary", "architecture", "Prismatic Platform", "Step"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Focused Applications - Prismatic Platform"
+++

## Definition

A focused application is an Elixir umbrella application that is designed to address exactly one domain concern. It has a clearly defined purpose, a bounded set of responsibilities, an explicit dependency graph, and a facade module that exposes its capabilities to other applications. The "focused" qualifier distinguishes these from monolithic applications that accumulate unrelated responsibilities over time, or from overly granular applications that fragment cohesive logic across too many separate codebases.

In the Prismatic Platform, focused applications are the fundamental unit of architectural organization. The platform's 115 umbrella applications each own a specific domain: `prismatic_perimeter` handles external attack surface management, `prismatic_storage_ets` handles ETS-backed storage, `prismatic_agents` manages the agent runtime, and so on. No application crosses domain boundaries, and no domain is split across multiple applications without a clear architectural reason.

## Overview

The focused application pattern emerges from the intersection of three principles: the Unix philosophy ("do one thing and do it well"), the Single Responsibility Principle from object-oriented design (applied at the application rather than class level), and Domain-Driven Design's bounded context concept (each application maps to a bounded context).

### The Problem Focused Applications Solve

As software systems grow, they face a persistent organizational challenge: where should new code go? Without clear boundaries, code gravitates toward existing modules, creating increasingly bloated, entangled codebases. A module that started as "user authentication" gradually absorbs session management, permission checking, rate limiting, audit logging, and eventually becomes an inscrutable monolith that nobody fully understands and everyone is afraid to modify.

Focused applications prevent this by establishing clear boundaries at the strongest possible level -- the application. In an Elixir umbrella project, each application has its own:

- **mix.exs**: Declaring its specific dependencies
- **lib/ directory**: Containing only its domain logic
- **test/ directory**: Containing only its domain tests
- **Supervision tree**: Managing only its domain processes
- **Facade module**: Exposing only its domain operations
- **Configuration**: Accepting only its domain settings

These physical boundaries make it difficult to accidentally bleed functionality across domains. When a developer needs to add a new feature, the application structure forces them to ask: "Which domain does this belong to?" If the answer is "a new domain," a new focused application is created.

### Scale and Evolution

The Prismatic Platform demonstrates that focused applications scale effectively to very large systems. At 115 applications, the platform manages nearly 2.8 million lines of code across domains ranging from storage adapters to security analysis to AI agent orchestration. Each application can be understood independently, tested independently, and evolved independently.

The platform's evolution from its early versions to Generation 19 would have been impossible without focused applications. Entire subsystems have been rewritten, new domains have been added, and obsolete applications have been retired -- all without cascading changes across the codebase. The application boundaries serve as firebreaks that contain the blast radius of any change.

## Technical Details

### Anatomy of a Focused Application

Every focused application in the Prismatic Platform follows a consistent structure:

```
apps/prismatic_perimeter/
  CLAUDE.md                          # Application documentation
  mix.exs                            # Dependencies and configuration
  .claude/
    quality-dna/
      current-state.json             # Quality metrics
  lib/
    prismatic_perimeter.ex           # Facade module
    prismatic_perimeter/
      asset_discovery.ex             # Internal: asset scanning
      compliance_assessor.ex         # Internal: compliance checks
      risk_scorer.ex                 # Internal: risk calculation
      security_rating.ex             # Internal: rating engine
      vulnerability_tracker.ex       # Internal: vulnerability management
  test/
    prismatic_perimeter_test.exs     # Facade integration tests
    prismatic_perimeter/
      asset_discovery_test.exs       # Unit tests
      compliance_assessor_test.exs   # Unit tests
      risk_scorer_test.exs           # Unit tests
      security_rating_test.exs       # Unit tests
      vulnerability_tracker_test.exs # Unit tests
  priv/
    # Application-specific data, migrations, etc.
```

### The mix.exs Contract

A focused application's `mix.exs` serves as its contract with the rest of the system. It declares exactly which other applications it depends on, what its compilation requirements are, and how it should be configured:

```elixir
defmodule PrismaticPerimeter.MixProject do
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
      elixirc_options: [warnings_as_errors: true],
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [coveralls: :test],
      dialyzer: [
        plt_add_apps: [:mix],
        plt_file: {:no_warn, "../../priv/plts/dialyzer.plt"}
      ]
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
      # Internal dependencies -- other focused apps
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic_storage_ets, in_umbrella: true},

      # External dependencies -- kept minimal
      {:jason, "~> 1.4"},
      {:telemetry, "~> 1.2"}
    ]
  end
end
```

Key observations:

- **warnings_as_errors: true** enforces zero-warning compilation
- **Minimal dependencies** -- only the storage apps it actually uses
- **In-umbrella dependencies are explicit** -- no hidden coupling
- **Dialyzer configuration** enables static type analysis

### Application Supervision

Each focused application manages its own supervision tree, starting only the processes it needs:

```elixir
defmodule PrismaticPerimeter.Application do
  @moduledoc false
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Asset discovery cache
      {PrismaticPerimeter.AssetCache, []},
      # Background scan scheduler
      {PrismaticPerimeter.ScanScheduler, []},
      # Telemetry reporter
      {PrismaticPerimeter.TelemetryReporter, []}
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

The supervision tree is self-contained: it does not start processes from other applications, and other applications do not start its processes. This isolation means that if `prismatic_perimeter` crashes and restarts, no other application is directly affected.

### Dependency Graph Enforcement

The Prismatic Platform enforces a clean dependency graph across focused applications. Circular dependencies are detected and blocked:

```elixir
defmodule Prismatic.Quality.DependencyChecker do
  @moduledoc """
  Verifies that the dependency graph across focused applications
  forms a directed acyclic graph (DAG) with no circular dependencies.
  """

  @spec check_cycles() :: :ok | {:error, [[atom()]]}
  def check_cycles do
    graph = build_dependency_graph()

    case find_cycles(graph) do
      [] -> :ok
      cycles -> {:error, cycles}
    end
  end

  @spec build_dependency_graph() :: %{atom() => [atom()]}
  defp build_dependency_graph do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(&extract_app_deps/1)
    |> Enum.into(%{})
  end

  defp extract_app_deps(mix_file) do
    {config, _} = Code.eval_file(mix_file)
    app_name = config[:app]

    umbrella_deps =
      (config[:deps] || [])
      |> Enum.filter(fn
        {_, opts} when is_list(opts) -> Keyword.get(opts, :in_umbrella, false)
        _ -> false
      end)
      |> Enum.map(fn {name, _} -> name end)

    {app_name, umbrella_deps}
  end

  defp find_cycles(graph) do
    graph
    |> Map.keys()
    |> Enum.flat_map(fn node -> dfs_cycle(graph, node, [node], MapSet.new()) end)
    |> Enum.uniq()
  end

  defp dfs_cycle(graph, current, path, visited) do
    deps = Map.get(graph, current, [])

    Enum.flat_map(deps, fn dep ->
      cond do
        dep in path -> [Enum.reverse([dep | path])]
        dep in visited -> []
        true -> dfs_cycle(graph, dep, [dep | path], MapSet.put(visited, dep))
      end
    end)
  end
end
```

## Implementation

### Creating a New Focused Application

When a new domain emerges in the Prismatic Platform, creating a focused application follows a defined process:

**Step 1: Domain analysis.** Define the bounded context: what entities does this domain own? What operations does it provide? What are its invariants? This analysis should produce a clear, one-sentence description of the application's purpose.

**Step 2: Generate the application skeleton.**

```bash
cd apps
mix new prismatic_new_domain --sup
```

**Step 3: Define the facade module.** Write the top-level module with `@moduledoc`, public function signatures with `@spec`, and delegation to (initially stub) internal modules.

**Step 4: Establish quality infrastructure.** Add CLAUDE.md, Quality DNA, Dialyzer configuration, and ensure `warnings_as_errors: true` is set.

**Step 5: Implement internal modules.** Build the domain logic in focused internal modules, each handling one aspect of the domain.

**Step 6: Write comprehensive tests.** Integration tests against the facade, unit tests for internal modules, property-based tests for critical logic.

**Step 7: Register the application.** Update the umbrella root's `mix.exs` if needed, and verify the dependency graph is still acyclic.

### When to Create vs. Extend

The decision to create a new focused application vs. extending an existing one follows these guidelines:

| Signal | Decision |
|--------|----------|
| New domain entities with their own lifecycle | Create new app |
| New operations on existing entities | Extend existing app |
| Shared infrastructure (caching, scheduling) | Create shared app |
| Alternative implementation of existing interface | Create adapter app |
| Feature that depends on multiple domains | Create orchestration app |
| Utility functions used across domains | Add to existing utility app |

### Application Naming Conventions

The Prismatic Platform uses a consistent naming scheme:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `prismatic_<domain>` | Core domain app | `prismatic_perimeter` |
| `prismatic_storage_<backend>` | Storage adapter | `prismatic_storage_ets` |
| `prismatic_<domain>_<aspect>` | Domain sub-concern | `prismatic_web_components` |
| `prismatic_<capability>` | Cross-cutting capability | `prismatic_telemetry` |

## Comparison

### Focused Applications vs. Alternative Architectures

| Architecture | Granularity | Coupling | Deployment | Communication | Prismatic Approach |
|-------------|-------------|----------|------------|---------------|-------------------|
| **Focused Apps (Umbrella)** | Per domain | Low (via facades) | Single release | Function calls | Primary architecture |
| **Monolith** | Single unit | High | Single unit | Internal calls | Avoided |
| **Microservices** | Per service | Very low | Independent | Network (HTTP/gRPC) | Not needed at current scale |
| **Modular Monolith** | Per module | Medium | Single unit | Function calls | Similar but less strict |
| **Service-Oriented** | Per service group | Low-Medium | Group-based | Network | Future possibility |

### Why Umbrella over Microservices?

The Prismatic Platform chose focused applications within an umbrella over microservices for several reasons:

1. **Function calls vs. network calls.** Intra-application communication within an umbrella is a function call (nanoseconds). Microservice communication requires network serialization/deserialization (milliseconds). For a platform that enforces sub-250ms page loads, this difference matters enormously.

2. **Shared type system.** All umbrella apps share Elixir's type system, enabling Dialyzer to check cross-app type compatibility at compile time. Microservices require schema validation at runtime.

3. **Single deployment artifact.** A single Elixir release contains all applications, simplifying deployment, rollback, and monitoring. Microservices require orchestration infrastructure (Kubernetes, service mesh) that adds operational complexity.

4. **Refactoring safety.** Renaming a function in an umbrella app is caught by the compiler across all dependent apps. Renaming a microservice endpoint requires coordinated deployment and contract versioning.

5. **The escape hatch exists.** If the platform grows to a scale where umbrella applications are insufficient, extracting a focused application into an independent service is straightforward because the boundaries are already clean.

## Best Practices

1. **One domain, one application.** Resist the temptation to combine "related" domains into a single application. "Related" today becomes "entangled" tomorrow. If two domains share data, they should communicate through facades, not shared internal modules.

2. **Explicit dependencies only.** If `prismatic_perimeter` needs `prismatic_storage_ets`, it must declare the dependency in its `mix.exs`. Implicit dependencies (using a module without declaring the dependency) should be caught by the compiler and CI.

3. **Facade-first design.** Design the facade module before implementing internal logic. The facade represents the application's contract with the outside world; internal modules can be freely restructured as long as the facade holds.

4. **Keep applications small.** A focused application should have 5-30 source files. If it grows beyond 50 files, consider splitting it into multiple applications. The Prismatic Platform's average is approximately 24 files per application.

5. **Test at the facade boundary.** Integration tests should exercise the facade module's public API. Unit tests should exercise internal modules. This layering ensures that refactoring internal modules does not require changing integration tests.

6. **Document the purpose.** Every focused application must have a CLAUDE.md explaining its purpose, architecture, key decisions, and dependencies. A developer should be able to understand an application's role by reading its documentation, without reading its code.

7. **Enforce quality per application.** Each application has its own Quality DNA, tracking quality metrics independently. An application cannot hide behind the platform's overall quality score -- it must maintain its own standards.

8. **Minimize external dependencies.** Each focused application should depend on as few external packages as possible. Shared external dependencies should be wrapped in dedicated adapter applications.

## Pitfalls

### Common Anti-Patterns

1. **The Kitchen Sink Application.** An application that accumulates unrelated functionality because "it was easier to put it here." This typically happens with applications named `prismatic_utils` or `prismatic_common`. When these applications grow beyond 10 files, they should be decomposed into domain-specific applications.

2. **The Nano Application.** An application containing a single module with a single function. This over-granularity creates unnecessary overhead (mix.exs, supervision tree, configuration) without meaningful boundary enforcement. A function that does not own any domain concept should live in a broader application.

3. **The Circular Dependency.** Application A depends on Application B, which depends on Application A. This violates the DAG requirement and indicates a domain boundary error. The solution is usually to extract shared concepts into a third application that both depend on.

4. **The God Facade.** An application whose facade module exposes 100+ functions, suggesting that the application encompasses too many concerns. Split it into focused applications, each with a manageable facade.

5. **The Leaky Abstraction.** Consumers of a focused application importing and using its internal modules directly, bypassing the facade. This creates tight coupling that defeats the purpose of the focused application pattern.

6. **The Phantom Dependency.** An application that uses another application's modules without declaring the dependency in `mix.exs`. This works in development (all apps are compiled together) but can fail in production if compilation order changes.

7. **The Stale Application.** An application that was created for a feature that is no longer used but remains in the codebase. Regular audits should identify and remove applications with no consumers.

## Use Cases

### Platform-Specific Applications

**Storage Adapters.** The Prismatic Platform uses focused applications for each storage backend: `prismatic_storage_ets` for in-memory storage, `prismatic_storage_ecto` for PostgreSQL, `prismatic_storage_meilisearch` for search, `prismatic_storage_kuzu` for graph queries. Each adapter implements the same storage behaviour, enabling backend swapping without affecting consumers.

**Security Domain Isolation.** Security-sensitive functionality is isolated in dedicated focused applications: `prismatic_perimeter` for EASM, `prismatic_dark` for sandboxed red team operations, `prismatic_safety` for quality guardians. This isolation ensures that security domain code is reviewed and maintained by specialized teams.

**Agent Runtime.** The agent system is decomposed into focused applications: `prismatic_agents` for the runtime, `prismatic_claude` for Claude Code integration, `prismatic_credo` for custom Credo rules. Each can evolve independently as the agent architecture matures.

**API Layers.** `prismatic_api` (REST API on port 4004) and `prismatic_web` (LiveView dashboard on port 4000) are separate focused applications. They share no code -- each has its own router, controllers/LiveViews, and templates. Both consume other applications through facades.

**Cross-Cutting Concerns.** Infrastructure concerns like telemetry, configuration, and supervision have their own focused applications (`prismatic_telemetry`, `prismatic_config`, `prismatic_supervisor`). This prevents cross-cutting concerns from leaking into domain applications.

## Related Concepts

Focused applications connect to several architectural concepts in the Prismatic Platform:

- [Umbrella Application](@/glossary/umbrella-application.md) is the Elixir project structure that houses focused applications
- [Bounded Context](@/glossary/bounded-context.md) from DDD maps directly to focused application boundaries
- [Modularity](@/glossary/modularity.md) is the design principle that focused applications enforce at the application level
- [Composability](@/glossary/composability.md) is enabled by focused applications that expose clean, composable facade interfaces
- [Domain-Driven Design](@/glossary/domain-driven-design.md) provides the theoretical framework for identifying application boundaries
- [OTP Application](@/glossary/otp-application.md) is the Erlang/OTP construct that underpins focused applications
- [Supervision Tree](@/glossary/supervision-tree.md) defines the process management structure within each focused application
- [Facade Modules](@/glossary/facade-modules.md) provide the public API through which focused applications expose their capabilities
- [Project Structure](@/glossary/project-structure.md) defines how focused applications are organized in the repository
- [Microservices](@/glossary/microservices.md) is the distributed alternative to focused umbrella applications

## See Also

- [Adapter Pattern](@/glossary/adapter-pattern.md) -- the pattern used for storage adapter focused applications
- [Dependency Injection](@/glossary/dependency-injection.md) -- enabling runtime selection of focused application implementations
- [Scalability](@/glossary/scalability.md) -- how focused applications support scaling strategies
- [Maintainability](@/glossary/maintainability.md) -- the quality attribute that focused applications directly improve
- [Circular Dependency](@/glossary/circular-dependency.md) -- the anti-pattern that focused application boundaries prevent

---

**Connect & Contribute**: Focused applications are the architectural foundation of the Prismatic Platform's 115-app ecosystem. Visit the [Prismatic Platform repository](https://github.com/korczis/prismatic-platform) to explore the umbrella structure, review individual application architectures, or connect with the community through [GitHub Discussions](https://github.com/korczis/prismatic-platform/discussions). Created by [Tomas Korcak (korczis)](https://github.com/korczis).
