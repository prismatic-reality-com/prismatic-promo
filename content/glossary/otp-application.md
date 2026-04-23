+++
title = "OTP Application"
weight = 50
[extra]
description = "A self-contained component in the OTP framework that packages code, configuration, and supervision trees into a deployable unit -- the fundamental building block of the Prismatic Platform's 115-application umbrella architecture"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "runtime-infrastructure"
related_concepts = ["otp-behaviour", "supervision-tree", "beam-vm", "genserver", "umbrella-application"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 6
prerequisites = ["elixir", "erlang", "otp", "beam-vm"]
learning_path = ["erlang", "beam-vm", "elixir", "otp", "otp-application", "otp-behaviour", "genserver", "supervision-tree", "umbrella-application"]
interactive_demos = ["/labs/glossary/otp-application"]
code_examples = ["Application module callback", "application supervision tree", "umbrella application configuration", "dynamic application loading"]
external_resources = ["https://hexdocs.pm/elixir/Application.html", "https://www.erlang.org/doc/design_principles/applications.html", "https://hexdocs.pm/mix/Mix.Tasks.App.Tree.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["application startup and shutdown", "supervision tree initialization", "configuration loading", "dependency resolution", "graceful shutdown ordering"]
keywords = ["OTP application", "Elixir application", "application callback", "application supervision tree", "mix application", "application environment", "umbrella application", "application lifecycle"]
tags = ["otp", "application", "elixir", "erlang", "beam", "supervision", "architecture", "runtime"]
related_terms = ["otp-behaviour", "supervision-tree", "beam-vm", "genserver", "umbrella-application", "supervisor", "process-isolation", "elixir", "erlang", "application"]
word_count = 1743
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OTP Application - Prismatic Platform"
+++

## Definition

An **OTP Application** is a self-contained, reusable component in the Open Telecom Platform (OTP) framework that bundles related code modules, a supervision tree, configuration, and startup/shutdown logic into a single deployable unit. In the Erlang/Elixir ecosystem, an application is not merely a collection of source files -- it is a runtime entity with a defined lifecycle, a dependency graph against other applications, and a supervision hierarchy that ensures its processes are started, monitored, and restarted according to explicit strategies.

Every Elixir project, whether a simple script or a complex distributed system, ultimately runs as one or more OTP applications. The [Prismatic Platform](/glossary/elixir/) leverages this architectural primitive to its fullest extent: its 115 umbrella applications each represent a distinct bounded context -- from `prismatic_storage_core` (storage traits and protocols) to `prismatic_perimeter` (External Attack Surface Management) to `prismatic_web` (LiveView dashboards). Each application has its own supervision tree, its own configuration namespace, its own dependencies, and its own lifecycle -- yet they compose seamlessly into a coherent platform through OTP's application dependency resolution and startup ordering.

## Overview

The OTP application concept originates from Erlang's telecommunications heritage, where systems needed to be composed of independently upgradable, restartable components that could run for years without interruption. An OTP application draws a boundary around a set of related functionality and provides the runtime infrastructure to manage that functionality as a unit.

### Application Anatomy

Every OTP application consists of several components:

| Component | Purpose | Location |
|-----------|---------|----------|
| **Application Module** | Defines `start/2` callback, initializes supervision tree | `lib/my_app/application.ex` |
| **Application Specification** | Declares metadata, dependencies, registered names | `mix.exs` (generated from project config) |
| **Supervision Tree** | Defines process hierarchy and restart strategies | Started from `Application.start/2` |
| **Configuration** | Application-specific settings via `config/` files | `Application.get_env/3` at runtime |
| **Modules** | The actual code (GenServers, supervisors, pure functions) | `lib/my_app/**/*.ex` |

### Application Lifecycle

```
                    ┌─────────────┐
                    │   LOADED    │ ← Application code loaded into VM
                    └──────┬──────┘
                           │ Application.start/2
                    ┌──────▼──────┐
                    │  STARTING   │ ← start/2 callback executing
                    └──────┬──────┘
                           │ Supervision tree initialized
                    ┌──────▼──────┐
                    │   RUNNING   │ ← Normal operation
                    └──────┬──────┘
                           │ Application.stop/1
                    ┌──────▼──────┐
                    │  STOPPING   │ ← prep_stop/1 then stop/1 callbacks
                    └──────┬──────┘
                           │ All processes terminated
                    ┌──────▼──────┐
                    │   STOPPED   │ ← Application fully shut down
                    └─────────────┘
```

### Application Types

OTP distinguishes between two types of applications:

1. **Regular Applications** (most common): Have a supervision tree started by the `start/2` callback. They manage long-lived processes and state. Most Prismatic Platform applications are regular applications.

2. **Library Applications**: Contain only modules with no supervision tree. They are loaded but do not have a `start/2` callback. Examples include pure utility libraries like `prismatic_storage_core` (providing behaviours and protocols only).

### The Prismatic Platform's Application Architecture

The Prismatic Platform's 115 applications form a dependency graph where foundational applications (storage core, configuration) are started first, followed by service applications (storage adapters, agents), and finally presentation applications (web, API). This layered startup ensures that every application's dependencies are available before it initializes.

| Layer | Applications | Purpose | Examples |
|-------|-------------|---------|----------|
| **Foundation** | ~15 | Core protocols, behaviours, utilities | `prismatic_storage_core`, `prismatic_types` |
| **Infrastructure** | ~25 | Storage, messaging, monitoring | `prismatic_storage_ets`, `prismatic_storage_ecto` |
| **Domain** | ~45 | Business logic, agents, intelligence | `prismatic_agents`, `prismatic_perimeter` |
| **Presentation** | ~10 | Web UI, API, CLI | `prismatic_web`, `prismatic_api` |
| **Support** | ~20 | Testing, quality, tooling | `prismatic_credo`, `prismatic_safety` |

## Technical Details

### Application Module Callback

The `Application` behaviour requires a `start/2` callback that initializes the application's supervision tree. This is the entry point for the application's runtime lifecycle.

```elixir
defmodule PrismaticPerimeter.Application do
  @moduledoc """
  OTP Application for the Prismatic Perimeter EASM module.

  Starts the supervision tree that manages:
  - Asset discovery workers
  - Security rating calculation engine
  - Compliance assessment service
  - Dashboard data aggregation
  - Rate-limited external API clients

  Dependencies: prismatic_storage_core, prismatic_agents, prismatic
  Started after all dependencies are running.
  """

  use Application

  @impl Application
  def start(_type, _args) do
    children = [
      # ETS table manager for caching scan results
      {PrismaticPerimeter.Cache, []},
      # Asset discovery worker pool
      {PrismaticPerimeter.Discovery.WorkerSupervisor, []},
      # Security rating engine (computes A-F grades)
      {PrismaticPerimeter.SecurityRating.Engine, []},
      # Compliance assessment (NIS2, ZKB)
      {PrismaticPerimeter.Compliance.Assessor, []},
      # Rate limiter for external API calls
      {PrismaticPerimeter.RateLimiter, bucket_size: 100, refill_rate: 10},
      # Telemetry reporter for performance metrics
      {PrismaticPerimeter.Telemetry.Reporter, []}
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl Application
  def prep_stop(state) do
    # Gracefully drain in-progress scans before shutdown
    PrismaticPerimeter.Discovery.WorkerSupervisor.drain()
    state
  end

  @impl Application
  def stop(_state) do
    :ok
  end
end
```

### Application Configuration

OTP applications have their own configuration namespace, accessible through `Application.get_env/3`. In Elixir projects, this configuration is typically defined in `config/*.exs` files.

```elixir
# config/config.exs
import Config

# Each application has its own configuration namespace
config :prismatic_perimeter,
  scan_concurrency: 10,
  rate_limit_per_second: 5,
  cache_ttl_seconds: 3600,
  compliance_frameworks: [:nis2, :zkb]

config :prismatic_storage_ecto,
  ecto_repos: [PrismaticStorage.Ecto.Repo]

config :prismatic_web,
  generators: [timestamp_type: :utc_datetime_usec]
```

```elixir
defmodule PrismaticPerimeter.Config do
  @moduledoc """
  Configuration access for the Prismatic Perimeter application.

  Wraps Application.get_env/3 with type-safe accessors and
  compile-time validation of required configuration keys.
  """

  @type config :: %{
    scan_concurrency: pos_integer(),
    rate_limit_per_second: pos_integer(),
    cache_ttl_seconds: pos_integer(),
    compliance_frameworks: [atom()]
  }

  @doc """
  Returns the complete configuration for the Perimeter application.
  Raises at startup if required keys are missing.
  """
  @spec get_config() :: config()
  def get_config do
    %{
      scan_concurrency: get_required(:scan_concurrency),
      rate_limit_per_second: get_required(:rate_limit_per_second),
      cache_ttl_seconds: get_required(:cache_ttl_seconds),
      compliance_frameworks: get_required(:compliance_frameworks)
    }
  end

  @spec get_required(atom()) :: term()
  defp get_required(key) do
    case Application.fetch_env(:prismatic_perimeter, key) do
      {:ok, value} -> value
      :error -> raise "Missing required config: :prismatic_perimeter, #{inspect(key)}"
    end
  end
end
```

### Mix Project as Application Definition

The `mix.exs` file serves as the application specification, declaring dependencies, included applications, and metadata.

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
      dialyzer: [plt_add_apps: [:mix]],
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [coveralls: :test]
    ]
  end

  def application do
    [
      # This tells OTP to start this application using the Application module
      mod: {PrismaticPerimeter.Application, []},
      # Extra applications started before this one
      extra_applications: [:logger, :runtime_tools],
      # Application environment defaults
      env: [
        scan_concurrency: 10,
        rate_limit_per_second: 5
      ]
    ]
  end

  defp deps do
    [
      # Internal umbrella dependencies (other OTP applications)
      {:prismatic_storage_core, in_umbrella: true},
      {:prismatic_agents, in_umbrella: true},
      {:prismatic, in_umbrella: true},
      # External dependencies
      {:finch, "~> 0.18"},
      {:jason, "~> 1.4"},
      {:telemetry, "~> 1.2"}
    ]
  end
end
```

### Application Dependency Resolution

OTP ensures that applications are started in dependency order. If application A depends on application B, B is guaranteed to be fully started before A's `start/2` callback is invoked.

```elixir
defmodule PrismaticSupervisor.DependencyGraph do
  @moduledoc """
  Analyzes and visualizes the dependency graph between
  OTP applications in the Prismatic Platform umbrella.

  This module demonstrates how OTP's application dependency
  system ensures correct startup ordering across 115 applications.
  """

  @type app_node :: %{
    name: atom(),
    dependencies: [atom()],
    type: :regular | :library,
    layer: :foundation | :infrastructure | :domain | :presentation | :support
  }

  @type dependency_graph :: %{
    nodes: [app_node()],
    edges: [{atom(), atom()}],
    startup_order: [atom()],
    layers: %{atom() => [atom()]}
  }

  @doc """
  Builds the complete dependency graph for all umbrella applications.
  Returns the graph structure and computed startup order.
  """
  @spec build_graph() :: {:ok, dependency_graph()}
  def build_graph do
    apps = discover_umbrella_apps()
    edges = extract_dependencies(apps)
    order = topological_sort(apps, edges)

    graph = %{
      nodes: apps,
      edges: edges,
      startup_order: order,
      layers: group_by_layer(apps)
    }

    {:ok, graph}
  end

  @doc """
  Detects circular dependencies in the application graph.
  Circular dependencies are forbidden -- they prevent startup.
  """
  @spec detect_cycles(dependency_graph()) :: {:ok, :no_cycles} | {:error, [[atom()]]}
  def detect_cycles(%{nodes: nodes, edges: edges}) do
    case find_cycles(nodes, edges) do
      [] -> {:ok, :no_cycles}
      cycles -> {:error, cycles}
    end
  end

  defp discover_umbrella_apps, do: []
  defp extract_dependencies(_apps), do: []
  defp topological_sort(_apps, _edges), do: []
  defp group_by_layer(_apps), do: %{}
  defp find_cycles(_nodes, _edges), do: []
end
```

### Dynamic Application Management

OTP provides runtime control over applications -- starting, stopping, and querying application state dynamically.

```elixir
defmodule PrismaticSupervisor.ApplicationManager do
  @moduledoc """
  Manages OTP application lifecycle at runtime.

  Supports:
  - Starting/stopping individual applications
  - Querying application status across the umbrella
  - Graceful rolling restarts for zero-downtime updates
  - Health checking through application state inspection
  """

  @type app_status :: :running | :stopped | :starting | :stopping | :not_loaded
  @type app_info :: %{
    name: atom(),
    status: app_status(),
    pid: pid() | nil,
    uptime_seconds: non_neg_integer(),
    child_count: non_neg_integer()
  }

  @doc """
  Returns the status of all Prismatic Platform applications.
  """
  @spec list_applications() :: [app_info()]
  def list_applications do
    Application.started_applications()
    |> Enum.filter(fn {name, _desc, _vsn} -> prismatic_app?(name) end)
    |> Enum.map(&build_app_info/1)
  end

  @doc """
  Performs a graceful restart of an application and its dependents.
  Stops dependents first (reverse dependency order), then restarts
  the target, then restarts dependents.
  """
  @spec graceful_restart(atom()) :: :ok | {:error, term()}
  def graceful_restart(app_name) do
    dependents = find_dependents(app_name)

    with :ok <- stop_applications(Enum.reverse(dependents)),
         :ok <- stop_application(app_name),
         :ok <- start_application(app_name),
         :ok <- start_applications(dependents) do
      :ok
    end
  end

  defp prismatic_app?(name) do
    name
    |> Atom.to_string()
    |> String.starts_with?("prismatic")
  end

  defp build_app_info({name, _desc, _vsn}) do
    %{
      name: name,
      status: :running,
      pid: Process.whereis(:"#{name}_supervisor"),
      uptime_seconds: 0,
      child_count: 0
    }
  end

  defp find_dependents(_app_name), do: []
  defp stop_applications(_apps), do: :ok
  defp stop_application(_app), do: :ok
  defp start_application(_app), do: :ok
  defp start_applications(_apps), do: :ok
end
```

## Implementation

### Structuring an OTP Application

Creating a well-structured OTP application requires attention to several architectural concerns:

**Supervision Strategy Selection**: The choice between `:one_for_one`, `:one_for_all`, `:rest_for_one`, and `:simple_one_for_one` (or the dynamic supervisor) determines how failures propagate and how restarts occur. The Prismatic Platform uses `:one_for_one` for most top-level application supervisors, because the failure of one subsystem (such as the discovery worker pool) should not require restarting unrelated subsystems (such as the compliance assessor).

**Configuration Management**: Application configuration should be validated at startup, not lazily at point-of-use. Failing fast with a clear error message is vastly preferable to a cryptic crash minutes or hours into operation when a missing configuration key is finally accessed.

**Dependency Minimization**: Each application should depend only on the applications it directly uses. Transitive dependencies are resolved automatically by OTP, but unnecessary direct dependencies create coupling that makes the application harder to test, deploy, and reason about.

**Clean Boundaries**: An OTP application defines a bounded context. Its public API should be a single facade module (e.g., `PrismaticPerimeter`) that exposes the capabilities without leaking internal implementation details. Internal modules should be namespaced under the application (e.g., `PrismaticPerimeter.Discovery.Worker`) and should not be called directly by other applications.

**Testing in Isolation**: Each application in the umbrella should be testable independently using `mix test` from its directory. This verifies that the application's boundaries are clean and its dependencies are correctly declared.

### Application Patterns in the Prismatic Platform

The platform follows consistent patterns across all 115 applications:

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Facade Module** | `lib/prismatic_perimeter.ex` | Single public API for the application |
| **Application Module** | `lib/prismatic_perimeter/application.ex` | OTP lifecycle callbacks |
| **Config Module** | `lib/prismatic_perimeter/config.ex` | Type-safe configuration access |
| **Telemetry Module** | `lib/prismatic_perimeter/telemetry.ex` | Instrumentation and metrics |
| **Quality DNA** | `.claude/quality-dna/current-state.json` | Quality tracking metadata |
| **Documentation** | `CLAUDE.md` | Application-specific developer guide |

## Comparison

### OTP Application vs. Other Packaging Mechanisms

| Feature | OTP Application | npm Package | Java JAR | Go Module | Python Package |
|---------|----------------|-------------|----------|-----------|---------------|
| **Runtime Lifecycle** | Full (start/stop/restart) | None | Limited (Spring Boot) | None | None |
| **Supervision** | Built-in supervision tree | None | External (Spring) | None | None |
| **Configuration** | Application environment | package.json / env | properties files | env / flags | settings modules |
| **Dependency Resolution** | OTP boot ordering | npm install time | Classpath | Build time | pip install time |
| **Hot Code Reload** | Supported natively | None | Limited | None | Limited |
| **Process Isolation** | Per-application supervision | Single process | Thread-based | Goroutine-based | GIL-limited |
| **Graceful Shutdown** | `prep_stop/1` callback | SIGTERM handler | Shutdown hooks | Context cancellation | atexit handlers |

### OTP Application vs. OTP Behaviour

An [OTP application](/glossary/otp-application/) is a packaging and lifecycle mechanism -- it defines how code is organized, configured, and started as a runtime unit. An [OTP behaviour](/glossary/otp-behaviour/) is a design pattern implementation -- it defines how individual processes within an application are structured and interact. Applications contain processes that implement behaviours; behaviours provide the building blocks from which applications are constructed.

## Best Practices

1. **One Bounded Context Per Application**: Each OTP application should represent a single domain concept or capability. Avoid monolithic applications that bundle unrelated functionality. The Prismatic Platform demonstrates this with separate applications for storage, agents, web, API, and each domain capability.

2. **Explicit Dependencies**: Declare all dependencies in `mix.exs`, both internal umbrella dependencies and external packages. Never rely on transitive dependency availability.

3. **Fail Fast on Configuration Errors**: Validate all required configuration in the `start/2` callback or immediately after. A clear startup failure is preferable to a runtime crash hours later.

4. **Use Telemetry for Observability**: Emit telemetry events from key points in the application. This enables monitoring, alerting, and debugging without coupling to specific monitoring tools.

5. **Design for Independent Testing**: Each application should have a comprehensive test suite that runs independently. Use `mix test` in the application directory to verify isolation.

6. **Document the Public API**: The facade module should have complete `@moduledoc`, `@doc`, and `@spec` annotations for every public function. Internal modules should also be documented but may be less formal.

7. **Implement `prep_stop/1` for Graceful Shutdown**: If the application has in-flight work (HTTP requests, database transactions, background jobs), use `prep_stop/1` to drain queues before `stop/1` terminates processes.

8. **Keep Supervision Trees Shallow**: Deep supervision hierarchies are harder to reason about. Prefer two to three levels of supervision. Use dynamic supervisors for worker pools rather than deeply nested static trees.

## Common Pitfalls

1. **God Application Anti-Pattern**: Putting all functionality into a single application eliminates the benefits of OTP's application model. If an application has more than 50 modules, it is probably too large and should be split.

2. **Circular Dependencies**: Two applications that depend on each other cannot be started. This is often a sign of incorrect domain boundaries. Extract shared functionality into a third application.

3. **Configuration at Compile Time**: Using `Application.get_env/3` in module attributes or at compile time captures the value at build time, not runtime. Use `Application.get_env/3` in function bodies or `Application.compile_env/3` when compile-time access is intentional.

4. **Missing `:mod` in `application/0`**: Forgetting to specify `mod: {MyApp.Application, []}` means OTP will not start the supervision tree. The application's code will be loaded but no processes will run.

5. **Ignoring Startup Order**: Accessing resources from another application in your `start/2` callback without declaring the dependency can cause race conditions. Always declare dependencies explicitly.

6. **Leaking Internal Modules**: Allowing other applications to call internal modules directly (e.g., `PrismaticPerimeter.Discovery.Worker.do_scan/1`) creates tight coupling. Expose functionality only through the facade module.

7. **Heavyweight `start/2`**: The `start/2` callback should initialize the supervision tree and return quickly. Long-running initialization (data loading, external API calls) should be performed by supervised processes after startup.

## Use Cases

### Umbrella Architecture (Prismatic Platform)

The Prismatic Platform's 115 umbrella applications demonstrate OTP application architecture at scale. Each application encapsulates a distinct domain -- storage, agents, security, web, API -- with explicit dependency declarations that OTP resolves into a correct startup order. This architecture enables independent development, testing, and deployment of platform components while maintaining runtime cohesion through the BEAM VM.

### Microservice Decomposition Without Network Overhead

OTP applications provide the boundary and isolation benefits of microservices without the network latency, serialization overhead, and operational complexity of distributed deployments. Within a single BEAM VM, 115 applications communicate through direct function calls while maintaining clear boundaries through public APIs and dependency declarations. This is sometimes called the "macrolithic" architecture.

### Hot Code Upgrade

OTP applications support hot code upgrades through release handlers. A running system can upgrade individual applications without stopping the entire system. While the Prismatic Platform currently uses rolling deployments via Fly.io, the OTP application structure provides the foundation for zero-downtime upgrades at the application level.

### Plugin Architecture

OTP applications serve as natural plugin boundaries. The Prismatic Platform's Plugin Kit OSS package enables external developers to create applications that integrate with the platform through defined interfaces, leveraging OTP's application dependency and lifecycle management for reliable plugin loading and unloading.

## Related Concepts

OTP applications connect to fundamental BEAM and Elixir concepts throughout the Prismatic Platform:

- [OTP Behaviour](/glossary/otp-behaviour/) -- the process design patterns used within applications
- [Supervision Tree](/glossary/supervision-tree/) -- the fault-tolerance hierarchy started by each application
- [BEAM VM](/glossary/beam-vm/) -- the virtual machine that manages application lifecycle
- [GenServer](/glossary/genserver/) -- the most common process behaviour used in application implementations
- [Umbrella Application](/glossary/umbrella-application/) -- the multi-application project structure used by the Prismatic Platform
- [Supervisor](/glossary/supervisor/) -- the process that manages child processes within an application
- [Process Isolation](/glossary/process-isolation/) -- the BEAM feature that enables application-level fault containment
- [Elixir](/glossary/elixir/) -- the programming language built on OTP application primitives
- [Erlang](/glossary/erlang/) -- the language that originally defined the OTP application concept
- [Application](/glossary/application/) -- the general concept of software applications

## See Also

- [OTP](/glossary/otp/) -- the broader framework that defines the application model
- [Phoenix Framework](/glossary/phoenix-framework/) -- a web framework structured as an OTP application
- [Releases (Elixir)](/glossary/releases-elixir/) -- the deployment mechanism for OTP applications
- [Supervision](/glossary/supervision/) -- the fault-tolerance strategy underlying OTP applications

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) open source ecosystem. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
