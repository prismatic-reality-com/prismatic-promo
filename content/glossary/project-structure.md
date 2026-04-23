+++
title = "Project Structure"
weight = 50
[extra]
tags = ["glossary", "architecture", "organization", "elixir", "umbrella", "modularity", "codebase"]
description = "Project structure is the deliberate organization of source code, configuration, tests, and documentation into a directory hierarchy that reflects the system's architectural boundaries, dependency relationships, and domain decomposition, enabling teams to navigate, understand, and evolve large codebases efficiently."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["umbrella-application", "bounded-context", "modularity", "composability", "domain-driven-design", "supervision-tree", "circular-dependency", "adapter-pattern", "ecto", "otp-application"]
key_concepts = ["umbrella applications", "feature grouping", "dependency graph", "namespace conventions", "configuration hierarchy", "test organization"]
use_cases = ["large-scale Elixir platforms", "multi-team development", "open-source projects", "monorepo management"]
prerequisites = ["otp-application", "modularity"]
version = "1.0.0"
schema_type = "DefinedTerm"
date_created = "2026-02-22"
word_count = 1645
date_modified = "2026-02-23"
keywords = ["Project", "Structure", "glossary", "architecture", "Prismatic Platform", "Elixir", "The Prismatic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Project Structure - Prismatic Platform"
+++

## Definition

Project structure is the intentional organization of a software system's source code, configuration, tests, documentation, and build artifacts into a directory hierarchy that communicates the system's architecture. A well-designed project structure makes the codebase navigable (developers can find what they need), comprehensible (the directory layout reveals architectural intent), and evolvable (new features can be added without restructuring existing code).

In the Elixir ecosystem, project structure has a specific technical meaning beyond mere file organization. An Elixir project's structure determines compilation order, dependency resolution, supervision tree topology, and release packaging. The choice between a single Mix project, an umbrella application, or a Poncho-style multi-project repository has profound implications for build times, test isolation, deployment granularity, and team autonomy.

The Prismatic Platform uses an umbrella application structure with 115 applications in the `apps/` directory, making it one of the larger Elixir umbrella projects in existence. This structure reflects the platform's domain decomposition: each application owns a specific domain (storage, web, agents, security, OSINT, perimeter), has its own supervision tree, and can be tested independently. The umbrella provides a shared dependency resolution and compilation context while preserving application-level isolation.

## Overview

Project structure is not a cosmetic concern. Studies of large codebases consistently find that developers spend more time reading code than writing it, and the ease of finding relevant code directly impacts development velocity. A project structure that groups related code together, separates concerns cleanly, and follows consistent naming conventions reduces the time from "I need to change X" to "I found where X lives" from minutes to seconds.

The foundational decision in Elixir project structure is the choice of project topology:

**Single Mix Project.** All code lives in one `lib/` directory. Simple, fast compilation, but all code shares the same namespace, dependency set, and test suite. Appropriate for small-to-medium applications (under 50 modules).

**Umbrella Application.** A root project contains multiple child applications in `apps/`. Each child has its own `lib/`, `test/`, `mix.exs`, and dependency list. Child applications can depend on each other (forming a DAG). Appropriate for large systems with distinct domains that benefit from isolation.

**Poncho Projects.** Multiple independent Mix projects in a monorepo, linked by path dependencies. Each project is fully independent and can be published as a Hex package. More isolation than umbrellas but more configuration overhead.

The Prismatic Platform chose the umbrella topology because it provides the best balance of isolation and integration for a 115-application system. Each application is independently compilable and testable, but the umbrella root provides shared configuration (`config/`), shared build context (`_build/`), and unified command execution (`mix test` runs all tests across all applications).

Within each application, the internal structure follows Elixir conventions and platform-specific standards: `lib/` for source code, `test/` for tests, `priv/` for static assets and migrations, and a `CLAUDE.md` file documenting the application's purpose, architecture, and key modules.

## Technical Details

### Umbrella Application Layout

The Prismatic Platform's root directory structure:

```
prismatic-platform/
├── apps/                          # 115 umbrella applications
│   ├── prismatic/                 # Core coordination (facades, mix tasks)
│   ├── prismatic_web/             # Phoenix LiveView (port 4000)
│   ├── prismatic_api/             # REST API gateway (port 4004)
│   ├── prismatic_agents/          # AIAD agent runtime (530 agents)
│   ├── prismatic_storage_core/    # Storage traits and behaviours
│   ├── prismatic_storage_ecto/    # PostgreSQL adapter
│   ├── prismatic_storage_ets/     # ETS adapter
│   ├── prismatic_storage_meilisearch/ # Search adapter
│   ├── prismatic_storage_kuzudb/  # Graph database adapter
│   ├── prismatic_perimeter/       # External attack surface management
│   ├── prismatic_supervisor/      # Compositional supervision
│   ├── prismatic_safety/          # Quality and safety enforcement
│   ├── prismatic_claude/          # Claude AI integration
│   └── ...                        # 102 more applications
├── config/                        # Shared configuration
│   ├── config.exs                 # Compile-time defaults
│   ├── dev.exs                    # Development overrides
│   ├── test.exs                   # Test overrides
│   ├── prod.exs                   # Production overrides
│   └── runtime.exs                # Runtime configuration
├── sites/                         # Static sites
│   └── promo/                     # Zola-based public promo site
├── priv/                          # Root-level private assets
├── scripts/                       # Shell scripts and tooling
├── .aiad/                         # AIAD agent/command/policy specs
├── .claude/                       # Claude AI session context
├── .githooks/                     # Git hook scripts
├── mix.exs                        # Root mix project file
├── mix.lock                       # Dependency lock file
├── CLAUDE.md                      # Platform documentation
└── AGENTS.md                      # Agent documentation
```

### Individual Application Structure

Each umbrella application follows a consistent internal layout:

```elixir
# apps/prismatic_perimeter/mix.exs
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
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      dialyzer: [plt_add_deps: :app_tree],
      test_coverage: [tool: ExCoveralls]
    ]
  end

  def application do
    [
      mod: {PrismaticPerimeter.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      # Internal umbrella dependencies
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic_storage_ecto, in_umbrella: true},

      # External dependencies
      {:jason, "~> 1.4"},
      {:tesla, "~> 1.7"}
    ]
  end
end
```

```
apps/prismatic_perimeter/
├── lib/
│   └── prismatic_perimeter/
│       ├── application.ex          # OTP application with supervision tree
│       ├── perimeter.ex            # Public API facade
│       ├── discovery/              # Asset discovery modules
│       │   ├── dns_scanner.ex
│       │   ├── cert_scanner.ex
│       │   └── cloud_scanner.ex
│       ├── rating/                 # Security rating computation
│       │   ├── engine.ex
│       │   ├── category_scorer.ex
│       │   └── grade_mapper.ex
│       ├── compliance/             # Compliance assessment
│       │   ├── nis2.ex
│       │   └── zkb.ex
│       └── storage/                # Domain-specific storage
│           ├── asset_store.ex
│           └── scan_store.ex
├── test/
│   ├── prismatic_perimeter/
│   │   ├── discovery/
│   │   │   ├── dns_scanner_test.exs
│   │   │   └── cert_scanner_test.exs
│   │   ├── rating/
│   │   │   └── engine_test.exs
│   │   └── compliance/
│   │       └── nis2_test.exs
│   ├── support/                    # Test helpers and fixtures
│   │   └── fixtures.ex
│   └── test_helper.exs
├── priv/
│   └── repo/
│       └── migrations/             # Ecto migrations
├── CLAUDE.md                       # Application documentation
└── mix.exs                         # Application project file
```

### Dependency Graph Management

Umbrella applications form a directed acyclic graph (DAG) of dependencies. Circular dependencies are detected and blocked:

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc """
  Resolves and validates the dependency graph across umbrella applications.
  Detects circular dependencies that would prevent compilation.
  """

  @spec build_graph() :: %{atom() => [atom()]}
  def build_graph do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(&parse_app_deps/1)
    |> Map.new()
  end

  @spec detect_cycles(%{atom() => [atom()]}) :: [:ok | {:cycle, [atom()]}]
  def detect_cycles(graph) do
    graph
    |> Map.keys()
    |> Enum.map(fn app -> check_cycle(graph, app, [app]) end)
    |> Enum.filter(fn
      {:cycle, _} -> true
      :ok -> false
    end)
  end

  defp parse_app_deps(mix_file) do
    {config, _} = Code.eval_file(mix_file)
    app_name = config[:app]
    umbrella_deps =
      (config[:deps] || [])
      |> Enum.filter(fn dep ->
        case dep do
          {_name, opts} when is_list(opts) -> Keyword.get(opts, :in_umbrella, false)
          _ -> false
        end
      end)
      |> Enum.map(fn {name, _opts} -> name end)

    {app_name, umbrella_deps}
  end

  defp check_cycle(graph, current, visited) do
    deps = Map.get(graph, current, [])

    case Enum.find(deps, fn dep -> dep in visited end) do
      nil ->
        deps
        |> Enum.map(fn dep -> check_cycle(graph, dep, [dep | visited]) end)
        |> Enum.find(:ok, fn result -> match?({:cycle, _}, result) end)

      cycle_start ->
        {:cycle, Enum.reverse([cycle_start | visited])}
    end
  end
end
```

### Namespace Conventions

The Prismatic Platform enforces strict naming conventions that map directory structure to module namespaces:

```elixir
# File: apps/prismatic_perimeter/lib/prismatic_perimeter/discovery/dns_scanner.ex
# Module: PrismaticPerimeter.Discovery.DnsScanner
defmodule PrismaticPerimeter.Discovery.DnsScanner do
  @moduledoc """
  Discovers DNS records for a target domain. Part of the
  Perimeter application's discovery subsystem.
  """

  @spec scan(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def scan(domain, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 10_000)
    record_types = Keyword.get(opts, :types, [:a, :aaaa, :mx, :ns, :txt, :cname])

    record_types
    |> Task.async_stream(fn type -> query_dns(domain, type) end, timeout: timeout)
    |> Enum.reduce([], fn
      {:ok, {:ok, records}}, acc -> acc ++ records
      {:ok, {:error, _}}, acc -> acc
      {:exit, _}, acc -> acc
    end)
    |> then(fn records -> {:ok, records} end)
  end

  defp query_dns(_domain, _type), do: {:ok, []}
end
```

### Configuration Hierarchy

Configuration flows from general to specific, with later files overriding earlier ones:

```elixir
# config/config.exs - Base configuration (all environments)
import Config

config :prismatic_web, PrismaticWeb.Endpoint,
  render_errors: [
    formats: [html: PrismaticWeb.ErrorHTML, json: PrismaticWeb.ErrorJSON],
    layout: false
  ]

config :prismatic_storage_ecto, PrismaticStorage.Repo,
  migration_primary_key: [type: :binary_id]

# Import environment-specific config
import_config "#{config_env()}.exs"
```

```elixir
# config/dev.exs - Development overrides
import Config

config :prismatic_web, PrismaticWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  debug_errors: true,
  code_reloader: true

config :prismatic_storage_ecto, PrismaticStorage.Repo,
  database: "prismatic_dev",
  hostname: "localhost",
  pool_size: 10
```

```elixir
# config/runtime.exs - Runtime configuration (reads env vars)
import Config

if config_env() == :prod do
  config :prismatic_storage_ecto, PrismaticStorage.Repo,
    url: System.get_env("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))
end
```

## Implementation

### Structuring a New Umbrella Application

When adding a new domain to the Prismatic Platform, follow this sequence:

**Step 1: Generate the application skeleton.**

```bash
cd apps
mix new prismatic_new_domain --sup
```

**Step 2: Configure umbrella paths in mix.exs.**

Update the generated `mix.exs` to use shared build paths:

```elixir
def project do
  [
    app: :prismatic_new_domain,
    version: "0.1.0",
    build_path: "../../_build",
    config_path: "../../config/config.exs",
    deps_path: "../../deps",
    lockfile: "../../mix.lock",
    elixir: "~> 1.19",
    start_permanent: Mix.env() == :prod,
    deps: deps(),
    dialyzer: [plt_add_deps: :app_tree],
    test_coverage: [tool: ExCoveralls]
  ]
end
```

**Step 3: Define the public API facade.**

Every application exposes a single public API module that delegates to internal modules:

```elixir
defmodule PrismaticNewDomain do
  @moduledoc """
  Public API for the New Domain application.
  All external access goes through this module.
  """

  defdelegate create(params), to: PrismaticNewDomain.Core
  defdelegate get(id), to: PrismaticNewDomain.Core
  defdelegate list(opts \\ []), to: PrismaticNewDomain.Core
end
```

**Step 4: Organize internal modules by subdomain.**

Group related modules in directories that reflect the application's internal domains:

```
lib/prismatic_new_domain/
├── application.ex     # Supervision tree
├── new_domain.ex      # Public facade (defdelegate to internal)
├── core/              # Business logic
│   ├── core.ex
│   └── validator.ex
├── storage/           # Data access
│   └── store.ex
└── telemetry/         # Instrumentation
    └── events.ex
```

**Step 5: Create CLAUDE.md documentation.**

Every application must have a `CLAUDE.md` file documenting its purpose, architecture, key modules, and usage examples.

**Step 6: Add quality DNA.**

Create `.claude/quality-dna/current-state.json` with baseline quality metrics.

### Test Organization

Tests mirror the source structure and are organized by scope:

```
test/
├── prismatic_new_domain/
│   ├── core/
│   │   ├── core_test.exs           # Unit tests
│   │   └── validator_test.exs       # Unit tests
│   └── storage/
│       └── store_test.exs           # Integration tests
├── integration/
│   └── full_workflow_test.exs       # Cross-module integration
├── support/
│   ├── factory.ex                   # Test data factories
│   └── fixtures.ex                  # Static test data
└── test_helper.exs
```

## Comparison

### Umbrella vs. Single Project vs. Microservices

| Aspect | Single Project | Umbrella | Microservices |
|--------|---------------|----------|---------------|
| Compilation | Single pass | Per-application | Independent |
| Dependency sharing | Implicit | Explicit DAG | None (duplication) |
| Test isolation | None | Per-application | Complete |
| Deployment unit | One binary | One release (configurable) | Per-service |
| Refactoring scope | Global | Application boundary | Service boundary |
| Team scaling | Bottleneck at ~10 devs | Scales to many teams | Scales independently |
| Operational overhead | Minimal | Low | High (per-service infra) |
| Build time | Fast | Medium (incremental) | Fast (per-service) |

### Group by Feature vs. Group by Type

Two competing approaches to internal application organization:

**Group by Feature** (Prismatic Platform's approach):

```
lib/prismatic_perimeter/
├── discovery/          # All discovery code together
│   ├── dns_scanner.ex
│   ├── cert_scanner.ex
│   └── cloud_scanner.ex
├── rating/             # All rating code together
│   ├── engine.ex
│   └── grade_mapper.ex
└── compliance/         # All compliance code together
    ├── nis2.ex
    └── zkb.ex
```

**Group by Type** (common but less maintainable):

```
lib/prismatic_perimeter/
├── scanners/           # All scanners together
│   ├── dns_scanner.ex
│   ├── cert_scanner.ex
│   └── compliance_scanner.ex
├── engines/            # All engines together
│   └── rating_engine.ex
└── mappers/            # All mappers together
    └── grade_mapper.ex
```

Grouping by feature keeps related code co-located, making it easier to understand a complete feature by reading one directory. Grouping by type requires jumping between directories to understand a single feature. The Prismatic Platform mandates grouping by feature.

## Best Practices

1. **Make the directory structure reflect architectural boundaries.** Each directory in `apps/` should correspond to a bounded context or domain. If two applications are always changed together, they may belong in the same application.

2. **Expose a single public API per application.** External consumers should interact with the top-level module (`PrismaticPerimeter`, not `PrismaticPerimeter.Discovery.DnsScanner`). This facade pattern enables internal refactoring without breaking consumers.

3. **Enforce the dependency DAG.** Circular dependencies between umbrella applications create compilation problems and indicate unclear boundaries. Use `mix xref graph --format cycles` to detect and eliminate cycles.

4. **Keep `config/` minimal.** Configuration should contain only values that genuinely vary between environments. Default values belong in module attributes or function defaults, not in config files.

5. **Mirror source structure in tests.** A test at `test/prismatic_perimeter/discovery/dns_scanner_test.exs` clearly tests `lib/prismatic_perimeter/discovery/dns_scanner.ex`. This 1:1 mapping makes it trivial to find tests for any module.

6. **Use consistent naming across the codebase.** Module names map to file paths: `PrismaticPerimeter.Discovery.DnsScanner` lives at `lib/prismatic_perimeter/discovery/dns_scanner.ex`. Deviations from this convention make code harder to find.

7. **Document each application independently.** Each `CLAUDE.md` should describe what the application does, who depends on it, what it depends on, and how to use it. This documentation is the entry point for developers new to that domain.

8. **Use `priv/` for application-specific assets.** Migrations, static files, and data fixtures belong in the application's `priv/` directory, not in a shared location. This ensures that assets travel with the application that owns them.

## Pitfalls

**Too many small applications.** Each umbrella application adds configuration overhead, compilation time, and cognitive load. An application with one module and 50 lines of code is better merged into a related application. The Prismatic Platform's 115 applications are justified by genuine domain separation, but not every project needs this many.

**Circular dependencies.** When application A depends on B and B depends on A, the compiler cannot determine compilation order. This is always a sign of unclear domain boundaries. The solution is to extract the shared concern into a third application that both A and B depend on (the `prismatic_storage_core` pattern).

**Shared mutable state.** Umbrella applications should communicate through explicit APIs, not by reading each other's ETS tables or GenServer state directly. Direct state access creates hidden coupling that breaks when applications are restructured or deployed independently.

**Inconsistent internal organization.** If each application uses a different internal directory structure, developers must re-learn the layout every time they switch contexts. The Prismatic Platform enforces a standard template (application.ex, facade, core/, storage/, telemetry/) across all applications.

**Over-nesting directories.** Deeply nested directories (`lib/prismatic_perimeter/discovery/scanners/dns/ipv4/resolver.ex`) create long module names and make navigation tedious. Prefer flat structures within feature directories: two to three levels of nesting is usually sufficient.

## Use Cases

### Large-Scale Platform Development

The Prismatic Platform's 115-application umbrella demonstrates project structure at scale. Each domain -- storage, web, agents, perimeter, OSINT, compliance -- gets its own application with clear boundaries. Teams working on the Perimeter application can run `cd apps/prismatic_perimeter && mix test` to verify their changes in isolation, without compiling or testing the other 114 applications. This isolation enables parallel development across domains.

### Open-Source Library Organization

Elixir libraries published to Hex follow a standard single-project structure. The `lib/` directory contains the implementation, `test/` contains tests, and the root `mix.exs` declares dependencies and package metadata. The `prismatic_storage_core` application follows this pattern internally, defining behaviours and protocols that other applications implement.

### Monorepo with Multiple Deployment Targets

A project that produces both a web application and a CLI tool can use an umbrella with shared core logic. The core application contains business logic, the web application adds Phoenix endpoints, and the CLI application adds `escript` packaging. The release configuration in `mix.exs` defines separate releases for each deployment target, each including only the relevant applications.

### Gradual Decomposition from Monolith

A growing single-project application can be incrementally decomposed into an umbrella. Extract the most distinct domain first (e.g., email notifications), move it to `apps/`, and update the remaining code to depend on it through its public API. Repeat for each domain until the monolith is fully decomposed. This gradual approach avoids the big-bang rewrite risk.

## Related Concepts

Project structure connects to architectural design, code organization, and development workflow patterns:

- [Umbrella Application](@/glossary/umbrella-application.md) -- the Elixir project topology that enables multi-application monorepo structure with shared compilation
- [Bounded Context](@/glossary/bounded-context.md) -- domain-driven design concept that informs how applications are partitioned within the umbrella
- [Modularity](@/glossary/modularity.md) -- the software design principle that project structure physically enforces through directory and application boundaries
- [Composability](@/glossary/composability.md) -- the property that well-structured projects exhibit, enabling applications to be composed into larger systems
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- architectural methodology whose bounded contexts map directly to umbrella applications
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP structure that each application defines independently, reflecting the project's process topology
- [Circular Dependency](@/glossary/circular-dependency.md) -- structural anti-pattern that umbrella dependency management detects and prevents
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- design pattern used to separate storage core traits from concrete implementations across applications
- [OTP Application](@/glossary/otp-application.md) -- the fundamental unit of project structure in Elixir, defining a supervised process tree
- [Ecto](@/glossary/ecto.md) -- database library whose migrations and schemas are organized within application-specific `priv/` directories

## See Also

- [Compilation](@/glossary/compilation.md) -- the build process that project structure directly influences through dependency ordering
- [Static Analysis](@/glossary/static-analysis.md) -- quality tooling that operates within the project's structural boundaries
- [Credo](@/glossary/credo.md) -- Elixir linter that enforces naming conventions aligned with project structure
- [Quality DNA](@/glossary/quality-dna.md) -- per-application quality tracking that mirrors the umbrella application structure
- [Release](@/glossary/release.md) -- deployment packaging that assembles selected applications from the umbrella into a deployable unit

---

*Built with precision by the Prismatic Platform team. This glossary entry is part of a living knowledge base that evolves with the platform.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis)
