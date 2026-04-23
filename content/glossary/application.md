+++
title = "Application"
weight = 14
[extra]
category = "technology"
subcategory = "otp"
difficulty = "intermediate"
technology_type = "runtime_system"
platform_component = "process_lifecycle"
otp_concept = "application_behaviour"
supervision_level = "top_level"
process_management = "lifecycle_control"
dependency_management = "explicit"
configuration_scope = "application_wide"
startup_coordination = "dependency_aware"
shutdown_behavior = "graceful"
prerequisite_concepts = ["supervision_trees", "process_lifecycle", "dependency_graphs"]
use_cases = ["service_packaging", "process_organization", "dependency_management", "configuration_isolation"]
benefits = ["explicit_dependencies", "controlled_startup", "isolation", "configuration_namespacing"]
implementation_patterns = ["supervision_tree", "application_callback", "dependency_declaration", "configuration_access"]
quality_metrics = ["startup_time", "dependency_clarity", "configuration_completeness", "shutdown_reliability"]
integration_points = ["mix", "supervisor", "configuration", "dependency_system", "beam_runtime"]
related_disciplines = ["systems_architecture", "process_management", "dependency_resolution", "service_orchestration"]
architectural_patterns = "hierarchical_composition"
description = "OTP packaging unit with supervised process trees and lifecycle management"
related_terms = ["otp", "supervision-tree", "umbrella-application", "mix", "supervisor", "beam", "application-behaviour", "dependency-graph", "lifecycle-management", "process-hierarchy"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1056
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Application", "packaging", "supervised", "process", "trees", "lifecycle", "management", "glossary", "technology", "Prismatic Platform"]
tags = ["glossary", "technology", "application", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Application - Prismatic Platform"
+++

## Definition and Overview

An OTP Application is the fundamental packaging and lifecycle unit in the Erlang/OTP ecosystem. Each application defines a supervision tree of processes, configuration, and dependencies that start and stop as a unit. Applications declare their dependencies explicitly, ensuring correct boot order across a system. The Application behaviour's `start/2` callback initializes the top-level supervisor, while `stop/1` handles graceful shutdown. In Elixir, applications are defined in `mix.exs` and managed by the Mix build tool.

The concept of an OTP Application is more than a library or package -- it represents a running component of a system with its own lifecycle, state, and process hierarchy. When an application starts, it launches a supervision tree that manages all of its worker processes. When it stops, it gracefully shuts down that entire tree. This lifecycle management is what distinguishes OTP Applications from simple code libraries: they are living, running subsystems.

OTP Applications form the building blocks of Erlang/Elixir systems. A production release is composed of multiple applications, each responsible for a specific domain or capability. The BEAM virtual machine starts applications in dependency order, ensuring that foundational services (logging, database connections, configuration) are available before application-level code attempts to use them.

## Technical Deep Dive

### Application Behaviour

The Application behaviour defines two callbacks that control the application lifecycle:

```elixir
defmodule MyApp.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      MyApp.Repo,
      {Phoenix.PubSub, name: MyApp.PubSub},
      MyApp.Endpoint
    ]

    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def stop(_state) do
    :ok
  end
end
```

The `start/2` callback receives a start type (`:normal`, `:takeover`, or `:failover` for distributed applications) and application arguments. It must return `{:ok, pid}` where `pid` is the top-level supervisor.

### Start Types

| Type | Description | Use Case |
|------|-------------|----------|
| `:normal` | Standard startup | Default for all local applications |
| `:takeover` | Distributed takeover from another node | Multi-node failover scenarios |
| `:failover` | Failover from a crashed node | High-availability distributed systems |

### Application Specification

Every application is defined by a specification in `mix.exs`:

```elixir
defmodule MyApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :my_app,
      version: "1.0.0",
      elixir: "~> 1.19",
      deps: deps()
    ]
  end

  def application do
    [
      mod: {MyApp.Application, []},
      extra_applications: [:logger, :runtime_tools],
      registered: [MyApp.Supervisor, MyApp.Registry]
    ]
  end
end
```

Key fields in the application specification:

| Field | Purpose |
|-------|---------|
| `mod` | Module implementing the Application behaviour |
| `extra_applications` | OTP applications to start before this one |
| `registered` | Named processes this application registers (for conflict detection) |
| `env` | Default configuration values |
| `applications` | Runtime dependencies (auto-detected from `deps`) |

### Dependency Management

OTP applications declare their dependencies explicitly, and the BEAM runtime starts them in topological order. Mix automatically infers runtime dependencies from the `deps` function, but developers can add additional OTP applications through `extra_applications`:

```
startup order: kernel -> stdlib -> elixir -> logger -> ecto -> phoenix -> my_app
```

If application A depends on application B, B is guaranteed to be fully started (supervision tree initialized, all processes running) before A's `start/2` callback executes.

### Configuration

Each application has its own configuration namespace, accessed via `Application.get_env/3`:

```elixir
# config/config.exs
config :my_app,
  database_url: "postgres://localhost/my_app",
  pool_size: 10

# Runtime access
Application.get_env(:my_app, :database_url)
# => "postgres://localhost/my_app"
```

Configuration is loaded at compile time from `config/config.exs` and at runtime from `config/runtime.exs`, providing both build-time defaults and environment-specific overrides.

## Architecture and Implementation

### Application Controller

The BEAM's application controller is a system process that manages the lifecycle of all applications. It maintains a state machine for each application:

```
:loaded -> :starting -> :started -> :stopping -> :stopped
```

The controller ensures that:
1. Dependencies are started before dependents
2. Only one instance of each application runs per node
3. Application crashes are reported and handled according to the start type
4. Shutdown proceeds in reverse dependency order

### Process Hierarchy

Each application owns a supervision tree rooted at its top-level supervisor:

```
Application Controller
  |
  +-- MyApp.Supervisor (top-level)
       |
       +-- MyApp.Repo (Ecto database pool)
       |
       +-- MyApp.PubSub (Phoenix PubSub)
       |
       +-- MyApp.Endpoint (Phoenix HTTP server)
       |    |
       |    +-- Cowboy listener processes
       |    +-- WebSocket handler processes
       |
       +-- MyApp.Workers.Supervisor
            |
            +-- Worker 1
            +-- Worker 2
            +-- ...
```

### Application Types

Elixir/OTP distinguishes between two application types:

| Type | Has Supervision Tree | Examples |
|------|---------------------|----------|
| Regular | Yes (`mod` specified) | Phoenix apps, GenServer-based services |
| Library | No (code only) | Utility libraries, protocol definitions |

Library applications provide modules and functions but do not start any processes. They are loaded into the VM but have no runtime lifecycle.

## Usage in Prismatic Platform

The Prismatic Platform is structured as an umbrella containing 89 OTP applications under the `apps/` directory. This architecture provides domain isolation, independent compilation, and granular dependency management.

### Application Categories

| Category | Count | Examples |
|----------|-------|---------|
| Core | 5 | `prismatic`, `prismatic_web`, `prismatic_api` |
| Storage | 8 | `prismatic_storage_core`, `prismatic_storage_ets`, `prismatic_storage_ecto` |
| Intelligence | 12 | `prismatic_agents`, `prismatic_osint`, `prismatic_visitor_intelligence` |
| Security | 8 | `prismatic_perimeter`, `prismatic_dark`, `prismatic_safety` |
| Infrastructure | 15 | `prismatic_supervisor`, `prismatic_claude`, `prismatic_telemetry` |
| Domain | 41 | Feature-specific applications |

### PrismaticSupervisor Orchestration

The `PrismaticSupervisor` application orchestrates dependency-aware startup across all 89 apps:

```elixir
defmodule PrismaticSupervisor.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Auto-discover all umbrella applications
    {:ok, apps} = PrismaticSupervisor.AutoDiscovery.scan()

    # Build dependency graph
    {:ok, graph} = PrismaticSupervisor.DependencyResolver.resolve(apps)

    # Start in topological order with domain grouping
    children = PrismaticSupervisor.DomainSupervisor.build_children(graph)

    opts = [strategy: :one_for_one, name: PrismaticSupervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Dependency Graph

The platform's application dependency graph forms a DAG (Directed Acyclic Graph):

```
prismatic_storage_core (foundation - no deps)
  |
  +-- prismatic_storage_ets
  +-- prismatic_storage_ecto
  +-- prismatic_storage_meilisearch
  +-- prismatic_storage_kuzu
  |
  +-- prismatic (core API)
       |
       +-- prismatic_agents (agent runtime)
       +-- prismatic_perimeter (EASM)
       +-- prismatic_web (LiveView UI)
       +-- prismatic_api (REST gateway)
```

### Quality Standardization

All 89 applications follow the universal quality standard enforced by `mix quality.enforce_standard`:

```elixir
# Every application's mix.exs includes:
def project do
  [
    app: :prismatic_example,
    version: "0.1.0",
    build_path: "../../_build",
    deps_path: "../../deps",
    elixirc_options: [warnings_as_errors: true],
    dialyzer: [plt_add_apps: [:mix]],
    test_coverage: [tool: ExCoveralls]
  ]
end
```

## Code Examples

### Creating a New Umbrella Application

```bash
# Generate a new application in the umbrella
cd apps/
mix new prismatic_example --sup

# The --sup flag generates the Application module with a supervisor
```

### Application Environment Configuration

```elixir
defmodule PrismaticPerimeter.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Read application-specific config
    scan_config = Application.get_env(:prismatic_perimeter, :scanning, [])
    rating_config = Application.get_env(:prismatic_perimeter, :rating, [])

    children = [
      {PrismaticPerimeter.Scanner, scan_config},
      {PrismaticPerimeter.RatingEngine, rating_config},
      {PrismaticPerimeter.ComplianceAssessor, []},
      PrismaticPerimeterWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Health Checking Applications

```elixir
defmodule PrismaticSupervisor.HealthMonitor do
  @moduledoc """
  Monitors the health of all running OTP applications.
  """

  @spec check_all() :: [{atom(), :running | :stopped | :starting}]
  def check_all do
    for {app, _desc, _vsn} <- Application.started_applications() do
      case Application.get_env(app, :health_check_module) do
        nil -> {app, :running}
        module -> {app, module.check()}
      end
    end
  end

  @spec ensure_started(atom()) :: :ok | {:error, term()}
  def ensure_started(app) do
    case Application.ensure_all_started(app) do
      {:ok, _started} -> :ok
      {:error, {app, reason}} -> {:error, {app, reason}}
    end
  end
end
```

## Best Practices

1. **One supervision tree per application** -- Each application should own exactly one supervision tree. Do not start processes outside the tree.

2. **Explicit dependency declaration** -- Never rely on implicit startup order. Always declare dependencies in `mix.exs` so the runtime guarantees correct boot sequence.

3. **Graceful shutdown** -- Implement `stop/1` for cleanup tasks (closing connections, flushing buffers). Supervision tree shutdown handles most cases automatically.

4. **Configuration over hardcoding** -- Use `Application.get_env/3` with sensible defaults rather than hardcoding values. This enables per-environment tuning.

5. **Library applications for shared code** -- Pure utility modules should be library applications (no `mod` in the app spec) to avoid unnecessary process overhead.

6. **Keep applications focused** -- Each application should own a single domain. If an application grows to cover multiple concerns, split it.

## Advanced Application Patterns

### Application Grouping and Domains

In large systems like the Prismatic Platform, applications are organized into logical domains:

```elixir
defmodule PrismaticSupervisor.DomainClassifier do
  @domains %{
    storage: ~r/^prismatic_storage_/,
    intelligence: ~r/^prismatic_(agents|osint|visitor_intelligence)/,
    security: ~r/^prismatic_(perimeter|dark|safety)/,
    infrastructure: ~r/^prismatic_(supervisor|claude|telemetry)/,
    web: ~r/^prismatic_(web|api)/,
    core: ~r/^prismatic$/
  }

  def classify_application(app_name) do
    app_string = to_string(app_name)

    Enum.find_value(@domains, :domain, fn {domain, pattern} ->
      if String.match?(app_string, pattern), do: domain
    end)
  end

  def group_applications_by_domain(applications) do
    Enum.group_by(applications, &classify_application/1)
  end
end
```

### Hot Code Swapping in Applications

OTP applications support hot code swapping without restarts:

```elixir
defmodule PrismaticPerimeter.CodeUpgrade do
  @behaviour :application_upgrade

  def upgrade(_old_vsn, _state, _extra) do
    # Suspend processes during upgrade
    :ok = :sys.suspend(PrismaticPerimeter.Scanner)
    :ok = :sys.suspend(PrismaticPerimeter.RatingEngine)

    # Load new code
    :code.purge(PrismaticPerimeter.Scanner)
    :code.load_file(PrismaticPerimeter.Scanner)
    :code.purge(PrismaticPerimeter.RatingEngine)
    :code.load_file(PrismaticPerimeter.RatingEngine)

    # Update process state if necessary
    :sys.change_code(PrismaticPerimeter.Scanner, PrismaticPerimeter.Scanner, "1.1.0", [])
    :sys.change_code(PrismaticPerimeter.RatingEngine, PrismaticPerimeter.RatingEngine, "1.1.0", [])

    # Resume processes
    :ok = :sys.resume(PrismaticPerimeter.Scanner)
    :ok = :sys.resume(PrismaticPerimeter.RatingEngine)

    {:ok, []}
  end

  def downgrade(_new_vsn, _state, _extra) do
    # Similar process for rollback
    {:ok, []}
  end
end
```

### Application Environment Validation

Validating configuration at startup prevents runtime failures:

```elixir
defmodule PrismaticPerimeter.ConfigValidator do
  @required_keys [:security_rating_endpoint, :compliance_standards, :scan_intervals]
  @valid_compliance_standards [:nis2, :zkb, :iso27001, :soc2]

  def validate_config! do
    config = Application.get_all_env(:prismatic_perimeter)

    Enum.each(@required_keys, fn key ->
      unless Keyword.has_key?(config, key) do
        raise ArgumentError, "Missing required configuration key: #{key}"
      end
    end)

    validate_compliance_standards!(config[:compliance_standards])
    validate_scan_intervals!(config[:scan_intervals])
    validate_endpoints!(config)

    :ok
  end

  defp validate_compliance_standards!(standards) when is_list(standards) do
    invalid = Enum.reject(standards, &(&1 in @valid_compliance_standards))

    unless Enum.empty?(invalid) do
      raise ArgumentError, "Invalid compliance standards: #{inspect(invalid)}"
    end
  end

  defp validate_scan_intervals!(intervals) when is_map(intervals) do
    required_intervals = [:asset_discovery, :vulnerability_scan, :ssl_check]

    Enum.each(required_intervals, fn interval ->
      case Map.get(intervals, interval) do
        value when is_integer(value) and value > 0 -> :ok
        _ -> raise ArgumentError, "Invalid scan interval for #{interval}: must be positive integer"
      end
    end)
  end

  defp validate_endpoints!(config) do
    endpoint = config[:security_rating_endpoint]

    case URI.parse(endpoint) do
      %URI{scheme: scheme, host: host} when scheme in ["http", "https"] and not is_nil(host) ->
        :ok
      _ ->
        raise ArgumentError, "Invalid security_rating_endpoint: #{endpoint}"
    end
  end
end

defmodule PrismaticPerimeter.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Validate configuration before starting any processes
    PrismaticPerimeter.ConfigValidator.validate_config!()

    # Start supervision tree only after config validation
    children = [...]
    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Dynamic Application Loading

Applications can be started and stopped dynamically:

```elixir
defmodule PrismaticSupervisor.DynamicLoader do
  def start_application_if_needed(app_name) do
    case Application.ensure_all_started(app_name) do
      {:ok, started} ->
        Logger.info("Started applications: #{inspect(started)}")
        :ok

      {:error, {failed_app, reason}} ->
        Logger.error("Failed to start #{failed_app}: #{inspect(reason)}")
        {:error, {failed_app, reason}}
    end
  end

  def stop_application_gracefully(app_name) do
    case Application.stop(app_name) do
      :ok ->
        # Also unload the application
        Application.unload(app_name)
        Logger.info("Stopped and unloaded #{app_name}")
        :ok

      {:error, {:not_started, ^app_name}} ->
        Logger.warn("Application #{app_name} was not started")
        :ok

      {:error, reason} ->
        Logger.error("Failed to stop #{app_name}: #{inspect(reason)}")
        {:error, reason}
    end
  end

  def list_running_applications do
    Application.started_applications()
    |> Enum.map(fn {app, _desc, _vsn} -> app end)
    |> Enum.sort()
  end

  def application_dependency_tree do
    apps = list_running_applications()

    Enum.map(apps, fn app ->
      deps = case Application.spec(app, :applications) do
        nil -> []
        list -> list
      end

      {app, deps}
    end)
    |> Enum.into(%{})
  end
end
```

### Application Telemetry Integration

Modern OTP applications integrate with telemetry for observability:

```elixir
defmodule PrismaticPerimeter.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Attach telemetry handlers before starting processes
    attach_telemetry_handlers()

    children = [
      # Telemetry supervisor starts first
      PrismaticPerimeter.Telemetry,

      # Core processes
      PrismaticPerimeter.Scanner,
      PrismaticPerimeter.RatingEngine,
      PrismaticPerimeterWeb.Endpoint
    ]

    # Emit application start event
    :telemetry.execute(
      [:prismatic_perimeter, :application, :start],
      %{timestamp: System.system_time()},
      %{node: node(), version: Application.spec(:prismatic_perimeter, :vsn)}
    )

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def stop(_state) do
    # Emit application stop event
    :telemetry.execute(
      [:prismatic_perimeter, :application, :stop],
      %{timestamp: System.system_time()},
      %{node: node()}
    )

    :ok
  end

  defp attach_telemetry_handlers do
    events = [
      [:prismatic_perimeter, :scan, :start],
      [:prismatic_perimeter, :scan, :stop],
      [:prismatic_perimeter, :rating, :calculate],
      [:prismatic_perimeter, :compliance, :assess]
    ]

    :telemetry.attach_many(
      "prismatic-perimeter-handler",
      events,
      &PrismaticPerimeter.TelemetryHandler.handle_event/4,
      nil
    )
  end
end
```

### Multi-Node Application Coordination

Distributed applications coordinate across multiple nodes:

```elixir
defmodule PrismaticPerimeter.DistributedApplication do
  use GenServer

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init([]) do
    # Monitor cluster membership
    :net_kernel.monitor_nodes(true)

    # Determine if this node should be the primary
    state = %{
      node: node(),
      is_primary: determine_primary_status(),
      peer_nodes: Node.list(),
      services_running: false
    }

    # Start services if primary
    if state.is_primary do
      start_primary_services()
    end

    {:ok, state}
  end

  @impl true
  def handle_info({:nodeup, node}, state) do
    new_state = %{state | peer_nodes: Node.list()}

    # Re-evaluate primary status when topology changes
    case determine_primary_status() do
      true when not state.is_primary ->
        # This node should become primary
        start_primary_services()
        {:noreply, %{new_state | is_primary: true, services_running: true}}

      false when state.is_primary ->
        # This node should step down
        stop_primary_services()
        {:noreply, %{new_state | is_primary: false, services_running: false}}

      _ ->
        {:noreply, new_state}
    end
  end

  @impl true
  def handle_info({:nodedown, node}, state) do
    new_state = %{state | peer_nodes: Node.list()}

    # Check if we need to take over primary role
    if not state.is_primary and determine_primary_status() do
      start_primary_services()
      {:noreply, %{new_state | is_primary: true, services_running: true}}
    else
      {:noreply, new_state}
    end
  end

  defp determine_primary_status do
    # Primary is the node with lexicographically smallest name
    all_nodes = [node() | Node.list()]
    |> Enum.sort()

    List.first(all_nodes) == node()
  end

  defp start_primary_services do
    # Start services that should only run on one node
    DynamicSupervisor.start_child(
      PrismaticPerimeter.DynamicSupervisor,
      PrismaticPerimeter.PeriodicScanner
    )

    DynamicSupervisor.start_child(
      PrismaticPerimeter.DynamicSupervisor,
      PrismaticPerimeter.ReportGenerator
    )

    Logger.info("Started primary services on node #{node()}")
  end

  defp stop_primary_services do
    # Stop primary-only services
    DynamicSupervisor.terminate_child(
      PrismaticPerimeter.DynamicSupervisor,
      PrismaticPerimeter.PeriodicScanner
    )

    DynamicSupervisor.terminate_child(
      PrismaticPerimeter.DynamicSupervisor,
      PrismaticPerimeter.ReportGenerator
    )

    Logger.info("Stopped primary services on node #{node()}")
  end
end
```

### Application Resource Pools

Managing shared resources across application boundaries:

```elixir
defmodule PrismaticResourcePool do
  use GenServer

  defstruct [:pools, :configs, :monitors]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def get_resource(pool_name, timeout \\ 5000) do
    GenServer.call(__MODULE__, {:get_resource, pool_name}, timeout)
  end

  def return_resource(pool_name, resource) do
    GenServer.cast(__MODULE__, {:return_resource, pool_name, resource})
  end

  @impl true
  def init(opts) do
    pool_configs = Keyword.get(opts, :pools, [])

    pools = Enum.into(pool_configs, %{}, fn {name, config} ->
      {name, initialize_pool(name, config)}
    end)

    state = %__MODULE__{
      pools: pools,
      configs: Enum.into(pool_configs, %{}),
      monitors: %{}
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:get_resource, pool_name}, from, state) do
    case Map.get(state.pools, pool_name) do
      nil ->
        {:reply, {:error, :pool_not_found}, state}

      pool when pool.available > 0 ->
        resource = create_resource(pool_name, state.configs[pool_name])
        ref = Process.monitor(elem(from, 0))

        updated_pool = %{pool | available: pool.available - 1, in_use: pool.in_use + 1}
        updated_pools = Map.put(state.pools, pool_name, updated_pool)
        updated_monitors = Map.put(state.monitors, ref, {pool_name, resource})

        {:reply, {:ok, resource}, %{state | pools: updated_pools, monitors: updated_monitors}}

      _pool ->
        {:reply, {:error, :pool_exhausted}, state}
    end
  end

  @impl true
  def handle_cast({:return_resource, pool_name, resource}, state) do
    case Map.get(state.pools, pool_name) do
      nil ->
        {:noreply, state}

      pool ->
        cleanup_resource(pool_name, resource)

        updated_pool = %{pool | available: pool.available + 1, in_use: pool.in_use - 1}
        updated_pools = Map.put(state.pools, pool_name, updated_pool)

        {:noreply, %{state | pools: updated_pools}}
    end
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
    case Map.pop(state.monitors, ref) do
      {nil, _monitors} ->
        {:noreply, state}

      {{pool_name, resource}, updated_monitors} ->
        # Process died while holding resource - return it to pool
        handle_cast({:return_resource, pool_name, resource}, %{state | monitors: updated_monitors})
    end
  end

  defp initialize_pool(pool_name, config) do
    %{
      name: pool_name,
      max_size: Keyword.get(config, :max_size, 10),
      available: Keyword.get(config, :max_size, 10),
      in_use: 0,
      created_at: System.system_time()
    }
  end

  defp create_resource(:http_client, _config) do
    {:ok, pid} = HTTPClient.start_link()
    pid
  end

  defp create_resource(:database_connection, config) do
    Postgrex.start_link(config)
  end

  defp cleanup_resource(:http_client, pid) do
    GenServer.stop(pid)
  end

  defp cleanup_resource(:database_connection, pid) do
    GenServer.stop(pid)
  end
end
```

### Application State Persistence

Persisting application state across restarts:

```elixir
defmodule PrismaticPerimeter.StatePersistence do
  @state_file "priv/state/perimeter_state.etf"

  def save_application_state(state) do
    ensure_state_directory()

    binary_state = :erlang.term_to_binary(state)
    File.write(@state_file, binary_state)
  end

  def load_application_state do
    case File.read(@state_file) do
      {:ok, binary} ->
        try do
          state = :erlang.binary_to_term(binary)
          {:ok, state}
        rescue
          _ -> {:error, :corrupt_state}
        end

      {:error, :enoent} ->
        {:ok, default_state()}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def delete_application_state do
    File.rm(@state_file)
  end

  defp ensure_state_directory do
    Path.dirname(@state_file)
    |> File.mkdir_p!()
  end

  defp default_state do
    %{
      last_scan_time: nil,
      discovered_assets: [],
      security_ratings: %{},
      compliance_status: %{}
    }
  end
end

defmodule PrismaticPerimeter.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Load persisted state
    {:ok, persisted_state} = PrismaticPerimeter.StatePersistence.load_application_state()

    children = [
      {PrismaticPerimeter.StateManager, persisted_state},
      PrismaticPerimeter.Scanner,
      PrismaticPerimeter.RatingEngine,
      PrismaticPerimeterWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: PrismaticPerimeter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def stop(_state) do
    # Save current state before shutdown
    current_state = PrismaticPerimeter.StateManager.get_state()
    PrismaticPerimeter.StatePersistence.save_application_state(current_state)

    :ok
  end
end
```

## Testing Application Behavior

### Application Integration Tests

```elixir
defmodule PrismaticPerimeter.ApplicationTest do
  use ExUnit.Case

  describe "application lifecycle" do
    test "starts and stops cleanly" do
      # Ensure application is not running
      assert Application.stop(:prismatic_perimeter) == :ok

      # Start application
      assert {:ok, _} = Application.ensure_all_started(:prismatic_perimeter)

      # Verify supervision tree is running
      assert Process.whereis(PrismaticPerimeter.Supervisor) != nil
      assert Process.whereis(PrismaticPerimeter.Scanner) != nil
      assert Process.whereis(PrismaticPerimeter.RatingEngine) != nil

      # Stop application
      assert Application.stop(:prismatic_perimeter) == :ok

      # Verify processes are stopped
      assert Process.whereis(PrismaticPerimeter.Supervisor) == nil
    end

    test "handles configuration errors gracefully" do
      # Set invalid configuration
      Application.put_env(:prismatic_perimeter, :security_rating_endpoint, "invalid-url")

      # Application should fail to start
      assert_raise ArgumentError, fn ->
        Application.ensure_all_started(:prismatic_perimeter)
      end

      # Reset configuration
      Application.delete_env(:prismatic_perimeter, :security_rating_endpoint)
    end

    test "survives individual process crashes" do
      {:ok, _} = Application.ensure_all_started(:prismatic_perimeter)

      scanner_pid = Process.whereis(PrismaticPerimeter.Scanner)
      assert scanner_pid != nil

      # Kill the scanner process
      Process.exit(scanner_pid, :kill)

      # Process should be restarted by supervisor
      :timer.sleep(100)

      new_scanner_pid = Process.whereis(PrismaticPerimeter.Scanner)
      assert new_scanner_pid != nil
      assert new_scanner_pid != scanner_pid

      Application.stop(:prismatic_perimeter)
    end
  end

  describe "application dependencies" do
    test "starts dependencies in correct order" do
      # Track application start order
      test_pid = self()

      :telemetry.attach_many(
        "app-start-tracker",
        [[:prismatic_storage_core, :application, :start],
         [:prismatic_perimeter, :application, :start]],
        fn event, _measurements, _metadata, _config ->
          send(test_pid, {:app_started, event})
        end,
        nil
      )

      Application.ensure_all_started(:prismatic_perimeter)

      # Should receive storage_core start before perimeter start
      assert_receive {:app_started, [:prismatic_storage_core, :application, :start]}
      assert_receive {:app_started, [:prismatic_perimeter, :application, :start]}

      :telemetry.detach("app-start-tracker")
      Application.stop(:prismatic_perimeter)
    end
  end
end
```

### Application Configuration Testing

```elixir
defmodule PrismaticPerimeter.ConfigurationTest do
  use ExUnit.Case

  setup do
    # Store original config
    original_config = Application.get_all_env(:prismatic_perimeter)

    on_exit(fn ->
      # Restore original config
      Application.put_all_env([{:prismatic_perimeter, original_config}])
    end)

    :ok
  end

  test "validates required configuration keys" do
    # Remove required key
    Application.delete_env(:prismatic_perimeter, :security_rating_endpoint)

    assert_raise ArgumentError, ~r/Missing required configuration key/, fn ->
      PrismaticPerimeter.ConfigValidator.validate_config!()
    end
  end

  test "validates compliance standards" do
    Application.put_env(:prismatic_perimeter, :compliance_standards, [:invalid_standard])

    assert_raise ArgumentError, ~r/Invalid compliance standards/, fn ->
      PrismaticPerimeter.ConfigValidator.validate_config!()
    end
  end

  test "validates scan intervals" do
    Application.put_env(:prismatic_perimeter, :scan_intervals, %{asset_discovery: -1})

    assert_raise ArgumentError, ~r/Invalid scan interval/, fn ->
      PrismaticPerimeter.ConfigValidator.validate_config!()
    end
  end

  test "accepts valid configuration" do
    Application.put_env(:prismatic_perimeter, :security_rating_endpoint, "https://api.example.com")
    Application.put_env(:prismatic_perimeter, :compliance_standards, [:nis2, :zkb])
    Application.put_env(:prismatic_perimeter, :scan_intervals, %{
      asset_discovery: 3600,
      vulnerability_scan: 86400,
      ssl_check: 7200
    })

    assert :ok = PrismaticPerimeter.ConfigValidator.validate_config!()
  end
end
```

## Common Pitfalls

- **Circular dependencies**: Application A depends on B, and B depends on A. The BEAM will refuse to start. Restructure shared code into a third library application.

- **Missing `extra_applications`**: Forgetting to list `:logger` or `:runtime_tools` in `extra_applications`. Mix warns but the application may crash at runtime.

- **Heavy `start/2` callbacks**: Performing slow initialization (database migrations, file parsing) in `start/2` delays the entire boot sequence. Defer heavy work to supervised processes.

- **Hardcoded environment assumptions**: Using `Mix.env()` at runtime instead of application configuration. `Mix.env()` is a compile-time construct not available in releases.

- **Shared mutable state across applications**: Using global ETS tables or the process dictionary to share state between applications breaks isolation. Use explicit message passing or shared storage backends.

## Related Concepts

- [OTP](@/glossary/otp.md) -- Framework defining the Application behaviour and lifecycle
- [Supervision Tree](@/glossary/supervision-tree.md) -- Process hierarchy rooted in each application
- [Umbrella Application](@/glossary/umbrella-application.md) -- Multi-app project structure hosting 89 applications
- [Mix](@/glossary/mix.md) -- Build tool managing application compilation and dependencies
- [Supervisor](@/glossary/supervisor.md) -- Top-level process tree root within each application
- [BEAM](@/glossary/beam.md) -- Virtual machine providing the application runtime
- [Elixir](@/glossary/elixir.md) -- Language providing Application behaviour integration

## Further Reading

- [Elixir Application Documentation](https://hexdocs.pm/elixir/Application.html) -- Official API reference
- [OTP Design Principles](https://www.erlang.org/doc/design_principles/applications.html) -- Erlang application design guide
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Full catalog of Prismatic umbrella applications
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)