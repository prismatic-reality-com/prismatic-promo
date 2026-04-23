+++
title = "Mix"
weight = 12
[extra]
category = "infrastructure"
subcategory = "build-tools"
description = "Elixir build tool providing project creation, compilation, testing, dependency management, and custom task execution"
keywords = ["build-tool", "elixir", "compilation", "dependency-management", "task-runner", "umbrella-projects", "hex-packages"]
related_terms = ["hex", "exunit", "umbrella-application", "quality-gates", "umbrella", "elixir"]
complexity = "intermediate"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["project-management", "build-automation", "dependency-resolution", "task-execution", "release-building"]
prerequisites = ["elixir-basics", "command-line", "project-structure"]
learning_path = ["elixir-installation", "project-creation", "dependency-management", "custom-tasks"]
difficulty = "beginner-intermediate"
time_to_learn = "1-2 weeks"
industry_usage = "high"
pattern_type = "build-system"
architecture_layer = "tooling"
quality_gates = ["compilation-success", "dependency-resolution", "task-execution"]
testing_approach = ["unit-testing", "integration-testing", "task-testing"]
monitoring = ["build-times", "compilation-warnings", "task-performance"]
scalability = "project-wide"
core_features = ["compilation", "dependency-management", "task-system", "umbrella-projects", "releases"]
integration_points = ["hex", "elixir-compiler", "otp", "external-tools"]
task_types = ["built-in", "custom", "third-party", "domain-specific"]
project_types = ["single-app", "umbrella", "library", "web-application"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 927
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "infrastructure", "mix", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Mix - Prismatic Platform"
+++

## Definition

Mix is Elixir's built-in build tool and project lifecycle manager, responsible for every aspect of an Elixir project from creation through compilation, testing, dependency management, release building, and custom task execution. Unlike ecosystems that require separate tools for building (Make/CMake), testing (pytest/JUnit), dependency management (pip/Maven), and task running (Rake/Gulp), Mix unifies all of these concerns into a single, extensible tool that ships with every Elixir installation.

Mix's power lies in its extensibility through custom tasks. Any Elixir module that follows the `Mix.Task` behaviour becomes a command-line tool invocable as `mix task_name`. This extensibility mechanism turns Mix into a platform-specific CLI framework -- projects can define arbitrarily complex tooling that integrates naturally with Elixir's compilation pipeline, dependency graph, and configuration system. The Prismatic Platform exploits this capability extensively, with over 100 custom Mix tasks powering everything from quality enforcement to autonomous evolution.

The `mix.exs` file serves as the project's central configuration point, defining the project name, version, dependencies, compilation options, test configuration, release settings, and application metadata. For umbrella projects (multi-application monorepos), Mix manages inter-application dependencies, shared configuration, and coordinated compilation across all child applications.

## Core Task System

Mix ships with a comprehensive set of built-in tasks that cover the standard development lifecycle:

### Built-in Tasks

| Task | Description | Common Flags |
|------|-------------|-------------|
| `mix new` | Create a new project or umbrella application | `--umbrella`, `--app`, `--module` |
| `mix compile` | Compile the project and its dependencies | `--warnings-as-errors`, `--force` |
| `mix test` | Run the test suite via [ExUnit](@/glossary/exunit.md) | `--cover`, `--stale`, `--trace` |
| `mix deps.get` | Fetch and install dependencies from [Hex](@/glossary/hex.md) | `--only` |
| `mix deps.compile` | Compile fetched dependencies | `--force` |
| `mix format` | Auto-format Elixir source code | `--check-formatted`, `--dry-run` |
| `mix release` | Build an OTP [release](@/glossary/release.md) for deployment | `--overwrite`, `--path` |
| `mix ecto.migrate` | Run [Ecto](@/glossary/ecto.md) database migrations | `--step`, `--to` |
| `mix ecto.rollback` | Reverse database migrations | `--step`, `--to` |
| `mix phx.server` | Start the [Phoenix](@/glossary/phoenix.md) web server | - |
| `mix phx.routes` | Display all configured routes | - |
| `mix xref` | Cross-reference analysis for dependencies | `graph`, `callers`, `unreachable` |
| `mix dialyzer` | Run [Dialyzer](@/glossary/dialyzer.md) static analysis | `--format`, `--quiet` |

### Task Execution Model

Mix tasks are Elixir modules that implement the `Mix.Task` behaviour. When invoked, Mix compiles the project (if needed), resolves the task module, calls its `run/1` function with command-line arguments, and returns the result. Tasks can depend on other tasks, and Mix ensures each dependency runs at most once per invocation:

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc "Run all quality gate checks for the Prismatic Platform."
  use Mix.Task

  @shortdoc "Run quality gates (compile, credo, dialyzer, tests)"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [fast: :boolean, verbose: :boolean])

    checks = [
      {"Compilation", &run_compilation/1},
      {"Credo", &run_credo/1},
      {"Dialyzer", &run_dialyzer/1},
      {"Tests", &run_tests/1}
    ]

    results = Enum.map(checks, fn {name, check_fn} ->
      Mix.shell().info("Running #{name}...")
      {name, check_fn.(opts)}
    end)

    failed = Enum.filter(results, fn {_, result} -> result != :ok end)

    if Enum.empty?(failed) do
      Mix.shell().info("All quality gates passed.")
    else
      Mix.raise("Quality gates failed: #{inspect(Enum.map(failed, &elem(&1, 0)))}")
    end
  end
end
```

## Umbrella Project Support

Mix's umbrella project support is fundamental to the Prismatic Platform's architecture. An umbrella project is a monorepo containing multiple Elixir applications, each with its own `mix.exs`, source code, tests, and configuration, managed under a single top-level `mix.exs`:

```
prismatic-platform/          # Umbrella root
  mix.exs                    # Root mix.exs (umbrella config)
  config/                    # Shared configuration
    config.exs
    dev.exs
    test.exs
    prod.exs
  apps/                      # Child applications
    prismatic/               # Core application
      mix.exs
      lib/
      test/
    prismatic_web/           # Phoenix web UI (port 4000)
      mix.exs
      lib/
      test/
    prismatic_api/           # REST API (port 4004)
      mix.exs
      lib/
      test/
    prismatic_perimeter/     # EASM module
      mix.exs
      lib/
      test/
    ...                      # 86 more applications
```

### Umbrella Dependency Management

Within an umbrella, applications can depend on each other using the `in_umbrella: true` option:

```elixir
# apps/prismatic_web/mix.exs
defp deps do
  [
    {:prismatic, in_umbrella: true},
    {:prismatic_perimeter, in_umbrella: true},
    {:prismatic_storage_ecto, in_umbrella: true},
    {:phoenix, "~> 1.7"},
    {:phoenix_live_view, "~> 1.0"}
  ]
end
```

Mix resolves these inter-application dependencies at compile time, ensuring correct compilation order and detecting circular dependencies. The `mix compile` command at the umbrella root compiles all applications in dependency order, while `mix test` runs all test suites across all applications.

## Compilation Pipeline

Mix's compilation pipeline provides several features critical for large codebases:

| Feature | Description |
|---------|-------------|
| **Incremental compilation** | Only recompiles files whose dependencies have changed |
| **Dependency tracking** | Tracks cross-module dependencies for precise recompilation |
| **Warnings as errors** | `--warnings-as-errors` flag fails compilation on any warning |
| **Protocol consolidation** | Optimizes protocol dispatch at compile time |
| **Code paths** | Manages BEAM code paths for all applications and dependencies |

```elixir
# Prismatic enforces zero-warning compilation
# mix.exs configuration
def project do
  [
    elixirc_options: [warnings_as_errors: true],
    # ... other config
  ]
end
```

The Prismatic Platform mandates `warnings_as_errors: true` across all 90 umbrella applications, ensuring that no warning -- unused variables, deprecated function calls, unreachable code -- can enter the codebase. This is enforced by both the compilation configuration and the pre-commit quality gates.

## Dependency Management with Hex

Mix integrates with [Hex](@/glossary/hex.md), the package manager for the Erlang ecosystem, for external dependency management. Dependencies are declared in `mix.exs` and resolved by Mix's dependency resolver:

```elixir
defp deps do
  [
    # Hex packages with version constraints
    {:phoenix, "~> 1.7.18"},
    {:ecto_sql, "~> 3.12"},
    {:postgrex, "~> 0.19"},

    # Git dependencies
    {:custom_lib, git: "https://github.com/org/custom_lib.git", branch: "main"},

    # Path dependencies (umbrella siblings)
    {:prismatic, in_umbrella: true},

    # Development/test only dependencies
    {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
    {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false},
    {:excoveralls, "~> 0.18", only: :test}
  ]
end
```

Mix generates a `mix.lock` file that pins exact versions for reproducible builds. The lock file is committed to version control, ensuring all developers and CI environments use identical dependency versions.

## Configuration Management

Mix provides a multi-layer configuration system that supports environment-specific overrides:

```elixir
# config/config.exs -- shared configuration
import Config

config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [formats: [html: PrismaticWeb.ErrorHTML]]

config :prismatic_storage_ecto, PrismaticStorage.Repo,
  pool_size: 10

# Import environment-specific config
import_config "#{config_env()}.exs"

# config/dev.exs -- development overrides
import Config

config :prismatic_web, PrismaticWeb.Endpoint,
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true

# config/runtime.exs -- runtime configuration (from environment variables)
import Config

if config_env() == :prod do
  config :prismatic_storage_ecto, PrismaticStorage.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "20"))
end
```

The configuration cascade flows: `config.exs` -> `{env}.exs` -> `runtime.exs`, with later files overriding earlier ones. Runtime configuration (`runtime.exs`) is evaluated at application startup rather than compile time, enabling configuration from environment variables in production deployments.

## Custom Mix Tasks in Prismatic

The Prismatic Platform defines over 100 custom Mix tasks organized by domain:

| Domain | Tasks | Examples |
|--------|-------|---------|
| **Quality** | 15+ | `mix quality.gates`, `mix quality.enforce_standard`, `mix quality.standardize_mix` |
| **Evolution** | 8+ | `mix autoheal.baseline`, `mix autoheal.cycle`, `mix autoevolve.mega`, `mix autoevolve.status` |
| **Git Trees** | 10+ | `mix git_trees`, `mix git_trees list`, `mix git_trees find`, `mix git_trees apps` |
| **SEADF** | 5+ | `mix seadf status`, `mix seadf evolve`, `mix seadf heal` |
| **Promo** | 3+ | `mix promo.enhance`, `mix promo.enhance --section agents` |
| **Supervisor** | 3+ | `mix supervisor`, `mix supervisor.discover`, `mix supervisor deps` |
| **Database** | 5+ | `mix ecto.migrate`, `mix ecto.rollback`, `mix ecto.setup` |

These tasks form the operational backbone of the platform, invoked manually during development, automatically by the CI/CD pipeline, and programmatically by the session lifecycle hooks during Claude sessions.

## Release Building

Mix builds OTP [releases](@/glossary/release.md) -- self-contained deployment packages that include the Erlang runtime, all compiled BEAM bytecode, and application configuration:

```elixir
# Release configuration in mix.exs
def project do
  [
    releases: [
      prismatic: [
        include_executables_for: [:unix],
        applications: [
          prismatic_web: :permanent,
          prismatic_api: :permanent,
          prismatic_agents: :permanent,
          runtime_tools: :permanent
        ],
        steps: [:assemble, :tar]
      ]
    ]
  ]
end
```

The `mix release` command produces a tarball that can be deployed to any compatible Linux system without installing Erlang or Elixir. The Prismatic Platform builds releases inside [Docker](@/glossary/docker.md) multi-stage builds for deployment to [Fly.io](@/glossary/fly-io.md).

## Advanced Mix Patterns

### Custom Task Architecture

Mix's extensibility through custom tasks enables sophisticated build automation. The Prismatic Platform demonstrates advanced task patterns:

```elixir
defmodule Mix.Tasks.Quality.Gates.Comprehensive do
  @moduledoc """
  Comprehensive quality gate implementation with parallel execution
  and detailed reporting for the Prismatic Platform.
  """

  use Mix.Task

  @shortdoc "Run comprehensive quality gates with parallel execution"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args,
      switches: [
        fast: :boolean,
        verbose: :boolean,
        parallel: :boolean,
        fail_fast: :boolean,
        report_format: :string
      ],
      aliases: [v: :verbose, f: :fast]
    )

    # Ensure project is compiled before running checks
    Mix.Task.run("compile", [])

    checks = define_quality_checks(opts)
    results = execute_checks(checks, opts)

    generate_report(results, opts)

    case analyze_results(results) do
      :success -> Mix.shell().info("✅ All quality gates passed!")
      {:failure, failed_checks} ->
        Mix.raise("❌ Quality gates failed: #{Enum.join(failed_checks, ", ")}")
    end
  end

  defp define_quality_checks(opts) do
    base_checks = [
      %{
        name: "Compilation",
        module: Mix.Tasks.Quality.Gates.Compilation,
        timeout: 30_000,
        critical: true,
        parallel_safe: false  # Must run first
      },
      %{
        name: "Credo",
        module: Mix.Tasks.Quality.Gates.Credo,
        timeout: 60_000,
        critical: true,
        parallel_safe: true
      },
      %{
        name: "Dialyzer",
        module: Mix.Tasks.Quality.Gates.Dialyzer,
        timeout: 300_000,
        critical: true,
        parallel_safe: true
      },
      %{
        name: "Test Coverage",
        module: Mix.Tasks.Quality.Gates.Coverage,
        timeout: 120_000,
        critical: true,
        parallel_safe: true
      },
      %{
        name: "Documentation",
        module: Mix.Tasks.Quality.Gates.Documentation,
        timeout: 30_000,
        critical: false,
        parallel_safe: true
      },
      %{
        name: "Security Audit",
        module: Mix.Tasks.Quality.Gates.Security,
        timeout: 60_000,
        critical: false,
        parallel_safe: true
      }
    ]

    if opts[:fast] do
      Enum.reject(base_checks, &(&1.name in ["Dialyzer", "Security Audit"]))
    else
      base_checks
    end
  end

  defp execute_checks(checks, opts) do
    # Run compilation first (not parallel safe)
    compilation_check = Enum.find(checks, &(&1.name == "Compilation"))
    compilation_result = execute_single_check(compilation_check, opts)

    if compilation_result.status == :failed and opts[:fail_fast] do
      [compilation_result]
    else
      other_checks = Enum.reject(checks, &(&1.name == "Compilation"))

      other_results = if opts[:parallel] do
        execute_checks_parallel(other_checks, opts)
      else
        execute_checks_sequential(other_checks, opts)
      end

      [compilation_result | other_results]
    end
  end

  defp execute_checks_parallel(checks, opts) do
    tasks = Enum.map(checks, fn check ->
      Task.async(fn -> execute_single_check(check, opts) end)
    end)

    Task.await_many(tasks, 600_000) # 10 minute timeout
  end

  defp execute_single_check(check, opts) do
    start_time = System.monotonic_time(:millisecond)

    result = try do
      apply(check.module, :run, [opts])
    catch
      kind, reason ->
        {:error, {kind, reason, __STACKTRACE__}}
    end

    end_time = System.monotonic_time(:millisecond)
    duration = end_time - start_time

    %{
      check: check.name,
      status: classify_result(result),
      result: result,
      duration_ms: duration,
      critical: check.critical
    }
  end

  defp classify_result(:ok), do: :passed
  defp classify_result({:ok, _}), do: :passed
  defp classify_result({:error, _}), do: :failed
  defp classify_result(:error), do: :failed
  defp classify_result(_), do: :unknown
end
```

### Umbrella Project Optimization

Advanced umbrella management techniques for large monorepos:

```elixir
defmodule Mix.Tasks.Umbrella.Optimize do
  @moduledoc """
  Optimize umbrella project structure and dependencies.
  """

  use Mix.Task

  @shortdoc "Optimize umbrella project dependencies and build order"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args,
      switches: [analyze: :boolean, fix: :boolean, verbose: :boolean]
    )

    umbrella_info = analyze_umbrella_structure()
    dependency_graph = build_dependency_graph(umbrella_info)
    optimization_report = generate_optimization_suggestions(dependency_graph, umbrella_info)

    if opts[:verbose] do
      display_detailed_analysis(umbrella_info, dependency_graph, optimization_report)
    end

    if opts[:fix] do
      apply_optimizations(optimization_report)
    else
      display_optimization_summary(optimization_report)
    end
  end

  defp analyze_umbrella_structure do
    apps_path = Mix.Project.config()[:apps_path] || "apps"

    apps = File.ls!(apps_path)
    |> Enum.filter(fn app ->
      File.exists?(Path.join([apps_path, app, "mix.exs"]))
    end)
    |> Enum.map(fn app ->
      app_path = Path.join(apps_path, app)
      mix_exs_path = Path.join(app_path, "mix.exs")

      {module, _} = Code.eval_file(mix_exs_path)
      project_config = apply(module, :project, [])

      %{
        name: String.to_atom(app),
        path: app_path,
        version: project_config[:version],
        dependencies: extract_dependencies(apply(module, :deps, [])),
        elixir_version: project_config[:elixir],
        app_config: project_config[:app] || []
      }
    end)

    %{
      apps: apps,
      total_count: length(apps),
      umbrella_root: File.cwd!()
    }
  end

  defp build_dependency_graph(umbrella_info) do
    apps_by_name = Map.new(umbrella_info.apps, &{&1.name, &1})

    dependency_map = for app <- umbrella_info.apps, into: %{} do
      umbrella_deps = Enum.filter(app.dependencies, fn
        {_name, opts} when is_list(opts) -> Keyword.get(opts, :in_umbrella, false)
        _ -> false
      end)
      |> Enum.map(&elem(&1, 0))

      {app.name, umbrella_deps}
    end

    # Detect cycles
    cycles = detect_dependency_cycles(dependency_map)

    # Calculate compilation order
    compilation_order = topological_sort_apps(dependency_map)

    # Calculate metrics
    complexity_metrics = calculate_dependency_complexity(dependency_map)

    %{
      dependency_map: dependency_map,
      cycles: cycles,
      compilation_order: compilation_order,
      metrics: complexity_metrics
    }
  end

  defp detect_dependency_cycles(dependency_map) do
    visited = MapSet.new()
    visiting = MapSet.new()
    cycles = []

    Enum.reduce(dependency_map, cycles, fn {app, _}, acc ->
      case dfs_cycle_detection(app, dependency_map, visited, visiting, []) do
        {:cycle, path} -> [path | acc]
        :no_cycle -> acc
      end
    end)
  end

  defp calculate_dependency_complexity(dependency_map) do
    app_count = map_size(dependency_map)
    total_deps = dependency_map |> Map.values() |> List.flatten() |> length()

    fan_out = for {app, deps} <- dependency_map, into: %{} do
      {app, length(deps)}
    end

    fan_in = Enum.reduce(dependency_map, %{}, fn {app, deps}, acc ->
      Enum.reduce(deps, acc, fn dep, acc2 ->
        Map.update(acc2, dep, 1, &(&1 + 1))
      end)
    end)

    max_fan_out = fan_out |> Map.values() |> Enum.max(fn -> 0 end)
    max_fan_in = fan_in |> Map.values() |> Enum.max(fn -> 0 end)

    %{
      total_apps: app_count,
      total_dependencies: total_deps,
      average_dependencies_per_app: total_deps / app_count,
      max_fan_out: max_fan_out,
      max_fan_in: max_fan_in,
      fan_out_distribution: fan_out,
      fan_in_distribution: fan_in,
      complexity_score: calculate_complexity_score(app_count, total_deps, max_fan_out)
    }
  end
end
```

### Dependency Resolution Deep Dive

Mix's dependency resolution algorithm handles complex version constraints:

```elixir
defmodule Mix.Tasks.Deps.Analyze do
  @moduledoc """
  Advanced dependency analysis and conflict resolution.
  """

  use Mix.Task

  @shortdoc "Analyze dependency tree for conflicts and optimization opportunities"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args,
      switches: [conflicts: :boolean, outdated: :boolean, tree: :boolean, security: :boolean]
    )

    deps = Mix.Dep.load_and_check()
    lock_data = Mix.Dep.Lock.read()

    analysis = %{
      dependency_count: length(deps),
      direct_dependencies: count_direct_deps(deps),
      transitive_dependencies: count_transitive_deps(deps),
      conflicts: find_version_conflicts(deps, lock_data),
      outdated: find_outdated_dependencies(deps, lock_data),
      security_issues: analyze_security_vulnerabilities(deps),
      size_analysis: analyze_dependency_sizes(deps),
      license_analysis: analyze_licenses(deps)
    }

    if opts[:conflicts] do
      display_conflicts(analysis.conflicts)
    end

    if opts[:outdated] do
      display_outdated(analysis.outdated)
    end

    if opts[:tree] do
      display_dependency_tree(deps)
    end

    if opts[:security] do
      display_security_issues(analysis.security_issues)
    end

    display_summary(analysis)
  end

  defp find_version_conflicts(deps, lock_data) do
    # Group dependencies by package name
    grouped_deps = Enum.group_by(deps, fn dep -> dep.app end)

    conflicts = for {app, dep_list} <- grouped_deps, length(dep_list) > 1 do
      versions = Enum.map(dep_list, fn dep ->
        case lock_data[dep.app] do
          {:hex, _, version, _, _, _, _} -> version
          {:git, _, revision, _} -> revision
          _ -> "unknown"
        end
      end)
      |> Enum.uniq()

      if length(versions) > 1 do
        %{
          app: app,
          conflicting_versions: versions,
          dependency_sources: Enum.map(dep_list, &dependency_source/1),
          resolution_strategy: suggest_resolution_strategy(dep_list, versions)
        }
      else
        nil
      end
    end
    |> Enum.reject(&is_nil/1)

    conflicts
  end

  defp analyze_security_vulnerabilities(deps) do
    # Integrate with hex_audit or similar security scanning
    hex_deps = Enum.filter(deps, &(&1.scm == Hex.SCM))

    security_reports = Enum.map(hex_deps, fn dep ->
      case check_security_advisory(dep.app, get_locked_version(dep)) do
        {:vulnerable, advisories} ->
          %{
            app: dep.app,
            version: get_locked_version(dep),
            vulnerabilities: advisories,
            severity: calculate_max_severity(advisories)
          }
        :safe ->
          nil
      end
    end)
    |> Enum.reject(&is_nil/1)

    %{
      total_vulnerable: length(security_reports),
      critical_count: count_by_severity(security_reports, :critical),
      high_count: count_by_severity(security_reports, :high),
      medium_count: count_by_severity(security_reports, :medium),
      vulnerable_packages: security_reports
    }
  end

  defp analyze_dependency_sizes(deps) do
    size_data = Enum.map(deps, fn dep ->
      lib_path = Path.join([Mix.Project.deps_path(), to_string(dep.app)])
      size_bytes = calculate_directory_size(lib_path)

      %{
        app: dep.app,
        size_bytes: size_bytes,
        size_mb: Float.round(size_bytes / (1024 * 1024), 2)
      }
    end)
    |> Enum.sort_by(& &1.size_bytes, :desc)

    total_size = Enum.sum(Enum.map(size_data, & &1.size_bytes))

    %{
      total_size_mb: Float.round(total_size / (1024 * 1024), 2),
      largest_dependencies: Enum.take(size_data, 10),
      size_distribution: size_data
    }
  end
end
```

### Mix Environment Management

Advanced configuration patterns for different environments:

```elixir
defmodule Mix.Tasks.Config.Validate do
  @moduledoc """
  Validate configuration across all environments.
  """

  use Mix.Task

  @shortdoc "Validate configuration for all environments"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args,
      switches: [env: :string, verbose: :boolean, fix: :boolean]
    )

    environments = case opts[:env] do
      nil -> [:dev, :test, :prod]
      env -> [String.to_atom(env)]
    end

    validation_results = Enum.map(environments, fn env ->
      validate_environment_config(env, opts)
    end)

    overall_result = analyze_validation_results(validation_results)
    display_validation_report(overall_result, opts)

    if overall_result.has_errors do
      Mix.raise("Configuration validation failed")
    end
  end

  defp validate_environment_config(env, opts) do
    # Load config for specific environment
    Mix.env(env)
    config = Application.get_all_env()

    validations = [
      validate_required_keys(config, env),
      validate_database_config(config, env),
      validate_endpoint_config(config, env),
      validate_secrets_config(config, env),
      validate_external_services_config(config, env)
    ]

    %{
      environment: env,
      validations: validations,
      errors: Enum.filter(validations, &match?({:error, _}, &1)),
      warnings: Enum.filter(validations, &match?({:warning, _}, &1))
    }
  end

  defp validate_required_keys(config, env) do
    required_keys = case env do
      :dev -> [:prismatic_web, :prismatic_storage_ecto, :logger]
      :test -> [:prismatic_web, :prismatic_storage_ecto, :logger, :ex_unit]
      :prod -> [:prismatic_web, :prismatic_storage_ecto, :logger]
    end

    missing_keys = Enum.filter(required_keys, fn key ->
      not Keyword.has_key?(config, key)
    end)

    if Enum.empty?(missing_keys) do
      {:ok, "All required configuration keys present"}
    else
      {:error, "Missing required configuration keys: #{inspect(missing_keys)}"}
    end
  end

  defp validate_database_config(config, env) do
    case Keyword.get(config, :prismatic_storage_ecto) do
      nil -> {:error, "Database configuration missing"}
      db_config ->
        repo_config = Keyword.get(db_config, PrismaticStorage.Repo, [])

        required_db_keys = case env do
          :test -> [:database, :pool]
          :dev -> [:database, :hostname, :username, :pool_size]
          :prod -> [:url, :pool_size]
        end

        missing_db_keys = Enum.filter(required_db_keys, fn key ->
          not Keyword.has_key?(repo_config, key)
        end)

        if Enum.empty?(missing_db_keys) do
          {:ok, "Database configuration valid"}
        else
          {:error, "Missing database configuration: #{inspect(missing_db_keys)}"}
        end
    end
  end

  defp validate_secrets_config(config, env) when env == :prod do
    secrets_to_check = [
      {:prismatic_web, [PrismaticWeb.Endpoint], :secret_key_base},
      {:prismatic_storage_ecto, [PrismaticStorage.Repo], :url}
    ]

    secret_issues = Enum.flat_map(secrets_to_check, fn {app, path, key} ->
      case get_nested_config(config, [app | path] ++ [key]) do
        nil -> ["Missing secret: #{inspect([app | path] ++ [key])}"]
        value when is_binary(value) and byte_size(value) < 32 ->
          ["Weak secret (too short): #{inspect([app | path] ++ [key])}"]
        _ -> []
      end
    end)

    if Enum.empty?(secret_issues) do
      {:ok, "Secrets configuration valid"}
    else
      {:error, "Secret configuration issues: #{Enum.join(secret_issues, ", ")}"}
    end
  end
  defp validate_secrets_config(_config, _env), do: {:ok, "Secrets validation skipped"}

  defp get_nested_config(config, [key]) do
    Keyword.get(config, key)
  end
  defp get_nested_config(config, [head | tail]) do
    case Keyword.get(config, head) do
      nil -> nil
      nested_config when is_list(nested_config) ->
        get_nested_config(nested_config, tail)
      _ -> nil
    end
  end
end
```

### Performance Optimization

Mix task performance patterns for large codebases:

```elixir
defmodule Mix.Tasks.Perf.Profile do
  @moduledoc """
  Performance profiling for Mix tasks and build processes.
  """

  use Mix.Task

  @shortdoc "Profile build performance and identify bottlenecks"

  @impl Mix.Task
  def run(args) do
    {opts, targets, _} = OptionParser.parse(args,
      switches: [
        task: :string,
        profile_compilation: :boolean,
        profile_tests: :boolean,
        output: :string,
        flame_graph: :boolean
      ]
    )

    profiling_targets = determine_profiling_targets(opts, targets)
    results = execute_profiling(profiling_targets, opts)

    generate_performance_report(results, opts)

    if opts[:flame_graph] do
      generate_flame_graph(results, opts)
    end
  end

  defp determine_profiling_targets(opts, targets) do
    base_targets = []

    targets = if opts[:profile_compilation] do
      [%{type: :compilation, task: "compile", args: []} | base_targets]
    else
      base_targets
    end

    targets = if opts[:profile_tests] do
      [%{type: :testing, task: "test", args: []} | targets]
    else
      targets
    end

    if custom_task = opts[:task] do
      [%{type: :custom, task: custom_task, args: []} | targets]
    else
      targets
    end
  end

  defp execute_profiling(targets, opts) do
    Enum.map(targets, fn target ->
      Mix.shell().info("Profiling #{target.task}...")

      result = profile_task_execution(target, opts)

      %{
        target: target,
        profile_data: result.profile_data,
        execution_time: result.execution_time,
        memory_usage: result.memory_usage,
        process_info: result.process_info
      }
    end)
  end

  defp profile_task_execution(target, opts) do
    # Clear any existing compiled code to ensure clean profiling
    if target.type == :compilation do
      File.rm_rf!("_build")
    end

    start_memory = :erlang.memory()
    start_time = System.monotonic_time(:microsecond)

    # Start profiling
    :fprof.start()
    :fprof.trace([:start, :procs, :all])

    # Execute the target task
    execution_result = Mix.Task.run(target.task, target.args)

    # Stop profiling
    :fprof.trace(:stop)

    end_time = System.monotonic_time(:microsecond)
    end_memory = :erlang.memory()

    # Analyze profiling data
    :fprof.profile()
    profile_output = capture_fprof_analysis()

    %{
      execution_result: execution_result,
      execution_time: end_time - start_time,
      memory_usage: calculate_memory_delta(start_memory, end_memory),
      profile_data: profile_output,
      process_info: gather_process_information()
    }
  end

  defp generate_performance_report(results, opts) do
    output_format = case opts[:output] do
      "json" -> :json
      "html" -> :html
      _ -> :text
    end

    report_data = %{
      summary: generate_summary(results),
      detailed_results: results,
      recommendations: generate_performance_recommendations(results),
      generated_at: DateTime.utc_now()
    }

    case output_format do
      :json ->
        json_output = Jason.encode!(report_data, pretty: true)
        File.write!("performance_report.json", json_output)
        Mix.shell().info("Performance report written to performance_report.json")

      :html ->
        html_output = generate_html_report(report_data)
        File.write!("performance_report.html", html_output)
        Mix.shell().info("Performance report written to performance_report.html")

      :text ->
        display_text_report(report_data)
    end
  end

  defp generate_performance_recommendations(results) do
    recommendations = []

    # Analyze compilation time
    compilation_results = Enum.filter(results, &(&1.target.type == :compilation))
    recommendations = if not Enum.empty?(compilation_results) do
      compilation_time = compilation_results |> hd() |> Map.get(:execution_time)

      cond do
        compilation_time > 60_000_000 -> # > 60 seconds
          ["Consider splitting large modules", "Enable parallel compilation" | recommendations]
        compilation_time > 30_000_000 -> # > 30 seconds
          ["Review macro usage", "Consider incremental compilation optimizations" | recommendations]
        true -> recommendations
      end
    else
      recommendations
    end

    # Analyze memory usage
    high_memory_results = Enum.filter(results, fn result ->
      total_memory = result.memory_usage.total || 0
      total_memory > 100_000_000 # > 100MB
    end)

    recommendations = if not Enum.empty?(high_memory_results) do
      ["Review memory-intensive operations", "Consider streaming for large data sets" | recommendations]
    else
      recommendations
    end

    recommendations
  end
end
```

## Related Terms

- [Hex](@/glossary/hex.md) - Package manager integrated with Mix for dependency management
- [ExUnit](@/glossary/exunit.md) - Test framework executed via `mix test`
- [Ecto](@/glossary/ecto.md) - Database toolkit with Mix tasks for migrations
- [Phoenix](@/glossary/phoenix.md) - Web framework with Mix tasks for server management
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis tool invoked via `mix dialyzer`
- [Release](@/glossary/release.md) - OTP release built with `mix release`
- [Docker](@/glossary/docker.md) - Container builds using Mix releases
- [BEAM](@/glossary/beam.md) - Virtual machine executing compiled Mix output
- [Typespec](@/glossary/typespec.md) - Type specifications checked during compilation
- [Code Coverage](@/glossary/code-coverage.md) - Test coverage measured via `mix test --cover`
- [Umbrella Application](@/glossary/umbrella-application.md) - Multi-app project structure managed by Mix
- [Quality Gates](@/glossary/quality-gates.md) - Automated quality checks implemented as Mix tasks
- [GenServer](@/glossary/genserver.md) - OTP behavior compiled and managed through Mix
- [Supervision Tree](@/glossary/supervision-tree.md) - Process hierarchies in applications built with Mix

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture
- [Technologies](@/technologies/_index.md) - Technology stack
- [Quality Gates](@/glossary/quality-gates.md) - Quality enforcement via custom Mix tasks
- [Observability](@/glossary/observability.md) - Monitoring infrastructure triggered by Mix tasks

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)