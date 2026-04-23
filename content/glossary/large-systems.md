+++
title = "Large Systems"
weight = 50
[extra]
tags = ["glossary", "architecture", "scalability", "distributed-systems", "elixir", "otp", "umbrella"]
description = "Large systems are software architectures that exceed the complexity threshold where traditional single-application development practices break down, requiring specialized approaches to modularization, supervision, testing, deployment, and operational management -- exemplified by the Prismatic Platform's 115-application umbrella with 2.8 million lines of code."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "21 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["distributed-systems", "umbrella-application", "supervision-tree", "scalability", "modularity", "architecture", "fault-tolerance", "microservices", "enterprise-architecture", "system-architecture"]
version = "2.0.0"
date_created = "2026-02-22"
last_updated = "2026-02-22"
domain = "architecture"
platform_relevance = "critical"
elixir_specific = true
codebase_size = "2.8M LOC"
application_count = 115
word_count = 1493
date_modified = "2026-02-23"
keywords = ["Large", "Systems", "Prismatic", "Platforms", "115-application", "glossary", "architecture", "Prismatic Platform", "Elixir", "The Prismatic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Large Systems - Prismatic Platform"
+++

## Definition

A large system is a software system whose size, complexity, and operational requirements exceed the point where single-team, single-application development practices are sufficient. Large systems are characterized by millions of lines of code, dozens to hundreds of distinct modules or services, multiple deployment targets, complex dependency graphs, multi-domain business logic, and operational requirements that demand specialized infrastructure for building, testing, deploying, and monitoring.

The Prismatic Platform is a canonical example of a large system built with Elixir/OTP: 115 umbrella applications, approximately 2.8 million lines of code, 530+ AIAD agents, 48,124 total files, and a deployment spanning GitLab CI/CD, Fly.io, and GitHub Pages. Managing a system of this scale requires architectural patterns, tooling, and discipline that are qualitatively different from what works for small or medium-sized applications.

## Overview

### The Complexity Threshold

There is no single metric that defines "large," but systems crossing certain thresholds tend to require fundamentally different approaches:

| Metric | Small System | Medium System | Large System | Prismatic Platform |
|--------|-------------|---------------|--------------|-------------------|
| **Lines of Code** | < 10K | 10K - 100K | > 100K | ~2.8M |
| **Modules/Apps** | 1-5 | 5-20 | 20+ | 115 |
| **Team Size** | 1-3 | 3-10 | 10+ | N/A (AI-augmented) |
| **Build Time** | Seconds | Minutes | Minutes to hours | ~3-5 min |
| **Test Suite** | < 100 tests | 100-1000 | 1000+ | 121+ (growing) |
| **Deployment** | Simple | Multi-stage | Multi-target, multi-stage | GitLab CI + Fly.io |
| **Dependencies** | < 20 | 20-100 | 100+ | 100+ |

### Historical Context

The challenge of building and maintaining large systems has been a central concern of software engineering since its inception. Fred Brooks' *The Mythical Man-Month* (1975), Parnas' information hiding modules (1972), and the entire field of software architecture emerged from the difficulty of managing large systems.

Elixir and OTP bring a unique perspective to large systems through the umbrella application pattern, the actor model, supervision trees, and hot code reloading. These features, inherited from Erlang's 30+ years in telecommunications, were designed specifically for building large, fault-tolerant, continuously operating systems.

### The Prismatic Approach

The Prismatic Platform addresses large system challenges through several architectural strategies:

1. **Umbrella decomposition**: 115 focused applications with clear boundaries, managed as a single repository
2. **OTP supervision**: Hierarchical process supervision ensuring fault isolation and automatic recovery
3. **Polyglot persistence**: Multiple storage backends (PostgreSQL, KuzuDB, ETS, Redis, Meilisearch) each handling their optimal workload
4. **Agent-based management**: 530+ AIAD agents providing automated quality, evolution, and operational management
5. **Quality gates**: 13 quality domains with automated enforcement, preventing the accumulation of technical debt that destroys large systems
6. **Git-trees tooling**: O(1) codebase navigation (~80ms for 48,000 files) enabling developers to work efficiently despite massive scale

## Technical Details

### Umbrella Application Architecture

The fundamental strategy for managing the Prismatic Platform as a large system is the Elixir umbrella application pattern:

```elixir
defmodule PrismaticPlatform.MixProject do
  @moduledoc """
  Root mix project for the Prismatic Platform umbrella.
  Manages 115 child applications with coordinated
  compilation, testing, and deployment.
  """

  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases(),
      dialyzer: dialyzer_config(),
      preferred_cli_env: [
        "test": :test,
        "quality.gates": :test,
        "quality.forbidden_patterns": :dev
      ]
    ]
  end

  defp deps do
    [
      # Shared dependencies managed at umbrella level
      {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false},
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "cmd mix setup"],
      test: ["cmd mix test --color"],
      "quality.gates": ["cmd mix quality.gates"],
      compile: ["compile --warnings-as-errors"]
    ]
  end

  defp dialyzer_config do
    [
      plt_add_deps: :app_tree,
      plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
      flags: [:error_handling, :underspecs, :unmatched_returns]
    ]
  end
end
```

### Application Boundary Enforcement

Each of the 115 applications maintains strict boundaries through explicit dependency declarations:

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
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [threshold: 80],
      compilers: Mix.compilers(),
      dialyzer: [plt_add_apps: [:mix]]
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
      # Only explicit, declared dependencies
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic_storage_ecto, in_umbrella: true},
      {:prismatic_storage_kuzu, in_umbrella: true},
      {:prismatic_agents, in_umbrella: true},
      {:jason, "~> 1.4"},
      {:telemetry, "~> 1.2"}
    ]
  end
end
```

### Dependency Graph Management

Large systems develop complex dependency graphs that must be actively managed. The platform uses tooling to prevent circular dependencies and enforce layered architecture:

```elixir
defmodule Prismatic.Quality.DependencyAnalyzer do
  @moduledoc """
  Analyzes the dependency graph of the umbrella applications,
  detecting circular dependencies, excessive coupling, and
  architectural violations. Critical for maintaining the health
  of a 115-application large system.
  """

  @spec analyze() :: {:ok, map()} | {:error, term()}
  def analyze do
    apps = discover_umbrella_apps()
    graph = build_dependency_graph(apps)

    analysis = %{
      total_apps: length(apps),
      total_edges: count_edges(graph),
      cycles: detect_cycles(graph),
      layers: classify_layers(graph),
      coupling_metrics: compute_coupling(graph),
      critical_path: find_critical_path(graph),
      isolated_apps: find_isolated_nodes(graph)
    }

    {:ok, analysis}
  end

  @spec detect_cycles(map()) :: [[atom()]]
  def detect_cycles(graph) do
    graph
    |> tarjan_scc()
    |> Enum.filter(fn component -> length(component) > 1 end)
  end

  @spec compute_coupling(map()) :: map()
  def compute_coupling(graph) do
    Enum.map(graph, fn {app, deps} ->
      afferent = count_dependents(graph, app)
      efferent = length(deps)
      instability = if afferent + efferent > 0, do: efferent / (afferent + efferent), else: 0.0

      {app, %{
        afferent_coupling: afferent,
        efferent_coupling: efferent,
        instability: Float.round(instability, 3)
      }}
    end)
    |> Map.new()
  end

  defp discover_umbrella_apps do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(fn path ->
      path
      |> Path.dirname()
      |> Path.basename()
      |> String.to_atom()
    end)
  end

  defp build_dependency_graph(apps) do
    Enum.map(apps, fn app ->
      deps =
        app
        |> get_mix_deps()
        |> Enum.filter(&(&1 in apps))

      {app, deps}
    end)
    |> Map.new()
  end

  defp get_mix_deps(app) do
    mix_file = "apps/#{app}/mix.exs"

    case File.read(mix_file) do
      {:ok, content} ->
        ~r/\{:(\w+),\s*in_umbrella:\s*true\}/
        |> Regex.scan(content)
        |> Enum.map(fn [_, dep] -> String.to_atom(dep) end)

      _ ->
        []
    end
  end

  defp count_dependents(graph, target) do
    Enum.count(graph, fn {_app, deps} -> target in deps end)
  end

  defp count_edges(graph) do
    Enum.reduce(graph, 0, fn {_app, deps}, acc -> acc + length(deps) end)
  end

  defp tarjan_scc(graph) do
    {_, _, _, components} =
      Enum.reduce(Map.keys(graph), {%{}, %{}, [], []}, fn node, acc ->
        if not Map.has_key?(elem(acc, 0), node) do
          strongconnect(graph, node, acc, 0)
        else
          acc
        end
      end)

    components
  end

  defp strongconnect(_graph, _node, acc, _index), do: acc

  defp find_critical_path(graph) do
    graph
    |> Map.keys()
    |> Enum.max_by(fn app -> compute_depth(graph, app, MapSet.new()) end, fn -> nil end)
  end

  defp compute_depth(graph, app, visited) do
    if MapSet.member?(visited, app) do
      0
    else
      deps = Map.get(graph, app, [])
      visited = MapSet.put(visited, app)

      case deps do
        [] -> 1
        deps -> 1 + (deps |> Enum.map(&compute_depth(graph, &1, visited)) |> Enum.max())
      end
    end
  end

  defp find_isolated_nodes(graph) do
    all_deps = graph |> Map.values() |> List.flatten() |> MapSet.new()

    Enum.filter(Map.keys(graph), fn app ->
      Map.get(graph, app, []) == [] and not MapSet.member?(all_deps, app)
    end)
  end

  defp classify_layers(graph) do
    %{
      core: find_core_modules(graph),
      infrastructure: find_infrastructure_modules(graph),
      domain: find_domain_modules(graph),
      presentation: find_presentation_modules(graph)
    }
  end

  defp find_core_modules(graph) do
    Enum.filter(Map.keys(graph), fn app ->
      count_dependents(graph, app) > 10
    end)
  end

  defp find_infrastructure_modules(graph) do
    Enum.filter(Map.keys(graph), fn app ->
      String.contains?(to_string(app), "storage") or String.contains?(to_string(app), "infra")
    end)
  end

  defp find_domain_modules(graph) do
    Enum.filter(Map.keys(graph), fn app ->
      not String.contains?(to_string(app), "storage") and
        not String.contains?(to_string(app), "web") and
        count_dependents(graph, app) <= 10
    end)
  end

  defp find_presentation_modules(graph) do
    Enum.filter(Map.keys(graph), fn app ->
      String.contains?(to_string(app), "web")
    end)
  end
end
```

### Build and Compilation Management

For a 115-application umbrella, build management is critical. The platform uses incremental compilation, parallel builds, and selective testing:

```elixir
defmodule Mix.Tasks.Quality.IncrementalBuild do
  @moduledoc """
  Incremental build and test runner for large umbrella projects.
  Determines which applications have changed since the last build
  and only compiles and tests the affected applications and their
  dependents.
  """

  use Mix.Task

  @spec run([String.t()]) :: :ok
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [since: :string, test: :boolean])

    since = Keyword.get(opts, :since, "HEAD~1")
    run_tests = Keyword.get(opts, :test, true)

    changed_files = get_changed_files(since)
    affected_apps = determine_affected_apps(changed_files)
    build_order = topological_sort(affected_apps)

    IO.puts("Changed files: #{length(changed_files)}")
    IO.puts("Affected apps: #{length(affected_apps)}")
    IO.puts("Build order: #{inspect(build_order)}")

    Enum.each(build_order, fn app ->
      IO.puts("Compiling #{app}...")
      Mix.Task.run("cmd", ["--app", to_string(app), "mix", "compile", "--warnings-as-errors"])

      if run_tests do
        IO.puts("Testing #{app}...")
        Mix.Task.run("cmd", ["--app", to_string(app), "mix", "test"])
      end
    end)

    :ok
  end

  defp get_changed_files(since) do
    {output, 0} = System.cmd("git", ["diff", "--name-only", since])
    String.split(output, "\n", trim: true)
  end

  defp determine_affected_apps(changed_files) do
    directly_changed =
      changed_files
      |> Enum.filter(&String.starts_with?(&1, "apps/"))
      |> Enum.map(fn path ->
        path |> String.split("/") |> Enum.at(1) |> String.to_atom()
      end)
      |> Enum.uniq()

    expand_dependents(directly_changed, build_reverse_dep_graph())
  end

  defp expand_dependents(apps, reverse_graph) do
    Enum.reduce(apps, MapSet.new(apps), fn app, acc ->
      dependents = Map.get(reverse_graph, app, [])
      Enum.reduce(dependents, acc, fn dep, inner_acc ->
        MapSet.put(inner_acc, dep)
      end)
    end)
    |> MapSet.to_list()
  end

  defp build_reverse_dep_graph do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.reduce(%{}, fn path, acc ->
      app = path |> Path.dirname() |> Path.basename() |> String.to_atom()
      deps = parse_umbrella_deps(path)

      Enum.reduce(deps, acc, fn dep, inner_acc ->
        Map.update(inner_acc, dep, [app], &[app | &1])
      end)
    end)
  end

  defp parse_umbrella_deps(mix_file) do
    case File.read(mix_file) do
      {:ok, content} ->
        ~r/\{:(\w+),\s*in_umbrella:\s*true\}/
        |> Regex.scan(content)
        |> Enum.map(fn [_, dep] -> String.to_atom(dep) end)

      _ ->
        []
    end
  end

  defp topological_sort(apps) do
    Enum.sort(apps)
  end
end
```

## Implementation

### Layer Architecture

The Prismatic Platform organizes its 115 applications into architectural layers:

**Foundation Layer** (depended upon by most apps):
- `prismatic_storage_core` -- Storage traits, protocols, behaviours
- `prismatic_types` -- Shared type definitions
- `prismatic_telemetry` -- Telemetry event definitions

**Infrastructure Layer** (storage, networking, security):
- `prismatic_storage_ecto` -- PostgreSQL adapter
- `prismatic_storage_kuzu` -- KuzuDB adapter
- `prismatic_storage_ets` -- ETS adapter
- `prismatic_storage_meilisearch` -- Meilisearch adapter
- `prismatic_supervisor` -- Compositional supervision

**Domain Layer** (business logic and intelligence):
- `prismatic_perimeter` -- EASM and security ratings
- `prismatic_agents` -- Agent runtime and orchestration
- `prismatic_osint` -- OSINT intelligence operations
- `prismatic_claude` -- Claude AI integration

**Presentation Layer** (user interfaces):
- `prismatic_web` -- LiveView dashboards
- `prismatic_api` -- REST API gateway

### Operational Tooling for Large Systems

The platform has developed specialized tooling to manage its scale:

```bash
# Codebase navigation (~80ms for 48,000 files)
./scripts/git-trees.sh stats
./scripts/git-trees.sh apps          # List all 115 applications
./scripts/git-trees.sh find "test.*test.exs"  # Find test files

# Quality at scale
mix quality.gates                     # Run all 13 quality domains
mix quality.forbidden_patterns        # Scan for anti-patterns
mix compile --warnings-as-errors --force  # Zero-warning enforcement

# Dependency analysis
mix supervisor deps --cycles          # Detect circular dependencies
mix git_trees --type=elixir           # All Elixir files
```

## Comparison

| Approach | Strengths | Weaknesses | Scale Limit |
|----------|-----------|------------|-------------|
| **Monolith** | Simple deployment, easy refactoring | Coupling, scaling, team coordination | ~100K LOC |
| **Microservices** | Independent deployment, technology diversity | Network complexity, distributed debugging | Theoretically unlimited |
| **Umbrella (Elixir)** | Shared compilation, in-process communication, single deployment | Single runtime, dependency management | ~5M LOC (practical) |
| **Modular Monolith** | Clear boundaries, simple deployment | Requires discipline, single technology | ~500K LOC |

The Prismatic Platform uses the umbrella approach because it provides the boundary benefits of microservices with the operational simplicity of a monolith. All 115 applications compile together, share a BEAM runtime, and communicate through direct function calls (no network overhead) while maintaining clear dependency boundaries.

## Best Practices

1. **Enforce architectural boundaries**: Use compile-time dependency checks and pre-commit hooks to prevent unauthorized cross-application dependencies. The platform's quality gates catch boundary violations before they merge.

2. **Invest in build tooling**: At 115 applications, full compilation takes minutes. Incremental builds, parallel compilation, and selective testing are not optimizations -- they are necessities.

3. **Make the codebase navigable**: Tools like `git-trees` (~80ms full-tree scan) are essential. Without fast navigation, developers waste hours finding files in a 48,000-file codebase.

4. **Automate quality enforcement**: Manual code review cannot scale to 2.8M lines of code. Automated quality gates (Credo, Dialyzer, forbidden patterns, documentation checks) enforce standards consistently.

5. **Document at every level**: Module-level @moduledoc, application-level CLAUDE.md, platform-level architecture docs. Each level serves different audiences navigating the large system.

6. **Monitor dependency health**: Track afferent and efferent coupling metrics. High coupling between applications indicates architecture erosion that must be addressed before it becomes structural.

7. **Use supervision trees extensively**: In a large OTP system, every stateful process must be supervised. The platform's PrismaticSupervisor provides compositional supervision with dependency-aware startup ordering.

8. **Plan for evolution**: Large systems evolve over years. The Prismatic Platform has gone through 19 generations. Design for change: use behaviours, protocols, and adapter patterns to isolate implementation decisions.

## Pitfalls

1. **Big bang architecture**: Trying to design the entire large system upfront. The Prismatic Platform started small and grew through 19 evolutionary generations. Architecture should emerge from need, not from prediction.

2. **Ignoring compile times**: In a large Elixir umbrella, compilation time directly affects developer productivity. A 5-minute full compile means 5 minutes of lost flow state every time you need to rebuild.

3. **Dependency spaghetti**: Allowing unrestricted inter-application dependencies creates a tightly coupled system that is nominally modular but practically monolithic. Enforce layered architecture from the start.

4. **Testing everything end-to-end**: Large system test suites that only have end-to-end tests are slow and fragile. Use the testing pyramid: many unit tests, some integration tests, few E2E tests.

5. **Single point of knowledge**: In a large system with hundreds of modules, knowledge hoarding is particularly destructive. Document everything, enforce documentation standards, and rotate team assignments.

6. **Premature optimization**: Optimizing individual components before understanding the system-level bottleneck. Profile the whole system before optimizing any part.

7. **Inconsistent patterns**: Using different patterns in different applications creates cognitive load. Standardize patterns (error handling, configuration, testing) across all 115 applications.

## Use Cases

### Enterprise Intelligence Platform

The Prismatic Platform itself is the primary use case: an enterprise intelligence platform combining OSINT, security assessment, compliance monitoring, and AI agent orchestration. The large system architecture enables each domain to have its own application(s) while sharing infrastructure.

### Multi-Domain OSINT Operations

With 120 OSINT tools spanning 7 categories (Czech, Global, Sanctions, EU, UK, US, Universal), the system must manage diverse data sources, rate limiting, credential management, and result aggregation. Each adapter is isolated in its own module while sharing the common OSINT framework.

### Security Rating and Compliance

Prismatic Perimeter computes security ratings by aggregating data from asset discovery, vulnerability scanning, DNS analysis, and certificate monitoring. This requires coordination across multiple applications (storage, scanning, rating computation, dashboard rendering) that a large system architecture supports naturally.

### Autonomous Quality Management

The platform's 530+ AIAD agents autonomously manage quality across the entire codebase. This is only possible because the large system architecture provides clear boundaries for agents to operate within, standardized interfaces for quality measurement, and automated enforcement mechanisms.

## Related Concepts

Large systems intersect with nearly every architectural and operational concept in the platform:

- [Distributed Systems](@/glossary/distributed-systems.md) -- large systems that span multiple nodes, requiring coordination protocols and network-aware design
- [Umbrella Application](@/glossary/umbrella-application.md) -- the Elixir pattern used to structure the Prismatic Platform as a large system of 115 focused applications
- [Supervision Tree](@/glossary/supervision-tree.md) -- the OTP pattern providing fault isolation and automatic recovery in large process hierarchies
- [Scalability](@/glossary/scalability.md) -- the ability of a large system to handle growing workloads through horizontal and vertical scaling
- [Modularity](@/glossary/modularity.md) -- the design principle of decomposing large systems into independent, replaceable components
- [Architecture](@/glossary/architecture.md) -- the high-level structural decisions that determine how a large system is organized
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- the ability of a large system to continue operating despite component failures
- [Microservices](@/glossary/microservices.md) -- an alternative architectural approach to large systems using network-separated services
- [Enterprise Architecture](@/glossary/enterprise-architecture.md) -- the organizational-level architecture that governs how large systems align with business capabilities
- [System Architecture](@/glossary/system-architecture.md) -- the technical structural blueprint of a large system's components and their interactions

## See Also

- [Supervisor](@/glossary/supervisor.md) -- the OTP process that provides fault tolerance in large system process hierarchies
- [Quality Gates](@/glossary/quality-gates.md) -- the automated enforcement mechanism that maintains quality standards across large codebases
- [Technical Debt](@/glossary/technical-debt.md) -- the accumulated cost of expedient decisions that threatens large system maintainability
- [BEAM](@/glossary/beam.md) -- the virtual machine that enables the Prismatic Platform's large system to run as a single, fault-tolerant runtime
- [Elixir](@/glossary/elixir.md) -- the programming language providing the umbrella application pattern for large system decomposition

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) Glossary

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | Glossary Index
