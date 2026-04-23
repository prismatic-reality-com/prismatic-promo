+++
title = "Hot Code Reload"
weight = 43
[extra]
category = "otp"
description = "BEAM capability to replace running module code at runtime without stopping the system, enabling zero-downtime deployments and live debugging in production."
related_terms = ["beam", "release", "fly-io", "supervisor", "hot-code-reload"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1495
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Hot", "Code", "Reload", "BEAM", "glossary", "otp", "Prismatic Platform", "Release"]
tags = ["glossary", "otp", "hot-code-reload", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Hot Code Reload - Prismatic Platform"
+++

## Definition

Hot code reload is a [BEAM](@/glossary/beam.md) virtual machine capability that allows replacing a module's compiled code at runtime while the system continues operating without interruption. The BEAM maintains up to two versions of each module simultaneously -- the "current" version and the "old" version -- ensuring that processes executing the old code can finish their current function call before transitioning to the new version. Any new function call from a process (specifically, a fully-qualified external call) will execute the updated code immediately.

This capability was originally designed for Ericsson's telecommunications switches in the late 1980s, where systems handling tens of thousands of concurrent phone calls could not be taken offline for software updates. The ability to upgrade code without dropping connections or losing state was a hard requirement that shaped the entire BEAM architecture. Hot code reload is not a bolt-on feature; it is a fundamental property of how the BEAM loads and executes code, deeply integrated with the module system, process model, and OTP release handling infrastructure.

The mechanism works because BEAM processes execute code through external (fully-qualified) function calls that resolve modules at call time rather than at compile time. When a module is reloaded, the BEAM redirects all future external calls to the new version while allowing in-progress executions of the old version to complete naturally. This design means that hot code reload is safe by default -- processes do not see inconsistent code states, and the transition between versions is atomic at the function-call boundary.

## How Hot Code Reload Works

The BEAM code loading system operates through a code server process that manages module versions:

```
Module Load Sequence:
1. New beam file compiled or received
2. Code server loads new version as "current"
3. Previous "current" becomes "old"
4. Previous "old" is purged (processes still running it are killed)
5. Processes making external calls now execute "current" version

Process Code Transition:
+-----------+     external call     +-----------+
| Process P |  ------------------>  | Module M  |
| (running  |     resolve at       | (current) |
|  old code)|     call time        +-----------+
+-----------+                      +-----------+
                                   | Module M  |
                                   | (old)     |
                                   +-----------+
```

### Internal vs. External Calls

The distinction between internal and external (fully-qualified) function calls is critical for understanding code version transitions:

```elixir
defmodule Counter do
  # External call (fully qualified) -- resolves to current module version
  def loop(count) do
    receive do
      :increment ->
        Counter.loop(count + 1)  # External call: will use new code after reload
    end
  end

  # Internal call -- stays on the same code version
  def loop_internal(count) do
    receive do
      :increment ->
        loop_internal(count + 1)  # Internal call: stays on old code version
    end
  end
end
```

| Call Type | Syntax | Code Version | Transition Behavior |
|-----------|--------|-------------|-------------------|
| **External (qualified)** | `Module.function(args)` | Always resolves to "current" | Transitions to new code at next call |
| **Internal (local)** | `function(args)` | Stays on loaded version | Never transitions unless externally called |
| **Anonymous function** | `fun.(args)` | Captures version at creation | Stays on version captured in closure |

## The Code Server

The BEAM's code server (`:code`) is a central process that manages all module loading and version tracking. It is a singleton GenServer within the Erlang runtime that serializes all code loading operations, ensuring consistency even when multiple processes attempt to load modules simultaneously.

```elixir
# Querying the code server for module information
:code.is_loaded(MyModule)
# => {:file, '/path/to/Elixir.MyModule.beam'}

# Checking which modules are loaded
:code.all_loaded()
# => [{MyModule, '/path/to/beam'}, ...]

# Manually loading a module from a beam file
:code.load_file(MyModule)

# Purging old code versions
:code.purge(MyModule)

# Soft purge -- only purges if no processes are running old code
:code.soft_purge(MyModule)
```

The distinction between `purge/1` and `soft_purge/1` is important for production systems. A hard purge kills any processes still executing the old version, while a soft purge only succeeds if no processes are running old code. The soft purge approach is safer for production but requires that all processes have transitioned to the new code before the purge can succeed.

| Operation | Behavior | Safety Level |
|-----------|----------|-------------|
| **`:code.load_file/1`** | Load new version, old becomes "old" | Safe -- no processes affected |
| **`:code.soft_purge/1`** | Remove old version only if unused | Safe -- fails if processes running old code |
| **`:code.purge/1`** | Remove old version, kill processes on it | Dangerous -- may kill active processes |
| **`:code.delete/1`** | Mark module as not loaded | Dangerous -- breaks future calls |

## The code_change/3 Callback

For stateful processes (GenServers), upgrading code often requires transforming the process state to match the new code's expectations. OTP provides the `code_change/3` callback for this purpose:

```elixir
defmodule AgentProcess do
  use GenServer

  # Called during hot code upgrade when state format changes
  @impl GenServer
  def code_change(old_version, old_state, _extra) do
    new_state = migrate_state(old_version, old_state)
    {:ok, new_state}
  end

  defp migrate_state("1.0.0", %{name: name, status: status}) do
    # v1 -> v2: add 'created_at' field
    %{name: name, status: status, created_at: DateTime.utc_now()}
  end

  defp migrate_state("2.0.0", state) do
    # v2 -> v3: rename 'status' to 'lifecycle_state'
    state
    |> Map.put(:lifecycle_state, Map.get(state, :status))
    |> Map.delete(:status)
  end
end
```

The `code_change/3` callback receives three arguments: the old module version (from the module's `@vsn` attribute), the current process state, and an extra argument that can be used to pass additional context from the appup file. The callback must return `{:ok, new_state}` with the transformed state, or the upgrade will fail and the process will be terminated.

## OTP Release Upgrades

For production deployments, OTP provides a structured release upgrade mechanism that coordinates hot code reload across multiple modules:

| Component | Role | Description |
|-----------|------|-------------|
| **Appup** | Upgrade instructions | Per-app list of module load/unload/restart operations |
| **Relup** | Release instructions | Coordinated upgrade plan across all applications |
| **Release handler** | Execution engine | Applies relup instructions in correct order |
| **sys module** | Process control | Suspends/resumes processes during upgrade |
| **code_change/3** | State migration | Transforms process state for new code version |

```erlang
%% Example appup file for prismatic_agents 2.0.0 -> 2.1.0
{"2.1.0",
 [{"2.0.0",
   [{load_module, agent_worker},
    {update, agent_supervisor, supervisor},
    {load_module, agent_registry}]}],
 [{"2.0.0",
   [{load_module, agent_registry},
    {update, agent_supervisor, supervisor},
    {load_module, agent_worker}]}]}.
```

### The Upgrade Process

The OTP release upgrade follows a carefully orchestrated sequence that ensures system consistency:

```
1. Unpack new release package
2. Release handler reads relup file
3. For each instruction:
   a. Suspend affected processes (sys:suspend)
   b. Load new module code
   c. Call code_change/3 for stateful processes
   d. Resume processes (sys:resume)
4. Mark new release as current
5. Old release available for rollback
```

This process is fully transactional at the application level. If any step fails, the release handler can roll back to the previous release state. The suspend-upgrade-resume cycle ensures that processes never see inconsistent state during the transition.

## Implementation in Prismatic Platform

The Prismatic Platform leverages hot code reload at both development and production stages:

- **Development Workflow**: Phoenix's code reloader watches source files and automatically recompiles and reloads modified modules when a request arrives. This provides sub-second feedback during development -- save a file, refresh the browser, see the change. All 89 umbrella apps participate in the reload cycle.
- **[LiveView](@/glossary/liveview.md) Development**: LiveView pages update in real-time during development without losing client state, enabling rapid UI iteration.
- **Production Deployments on [Fly.io](@/glossary/fly-io.md)**: The platform uses OTP [releases](@/glossary/release.md) for production deployment. While the current deployment strategy uses rolling restarts (new instances start, old instances drain), the underlying BEAM infrastructure supports in-place upgrades for future zero-downtime deployment scenarios.
- **Agent Behavior Updates**: Agent decision logic can be updated through hot code reload without restarting agent processes, preserving accumulated agent state and in-flight operations.
- **Quality Rule Adjustments**: Quality gate rules and [QDP](@/glossary/qdp.md) scoring criteria can be adjusted in production without service interruption.
- **Live Debugging**: The BEAM's `:observer` and `:recon` tools can be loaded into a running production system for debugging without restarting the application.

## Development vs. Production Hot Reload

| Aspect | Development (Phoenix Reloader) | Production (OTP Releases) |
|--------|-------------------------------|--------------------------|
| **Trigger** | File save detected by watcher | Release upgrade command |
| **Scope** | Changed modules only | All modules in release diff |
| **State Migration** | Not needed (state lost on reload) | `code_change/3` callbacks required |
| **Coordination** | None (single node) | Release handler orchestrates |
| **Safety** | Best-effort (dev only) | Fully coordinated with rollback |
| **Speed** | Sub-second | Seconds to minutes |
| **Risk** | Low (development) | Requires careful appup planning |

## Phoenix Code Reloader Internals

During development, Phoenix's code reloader intercepts incoming HTTP requests and checks whether any source files have changed since the last compilation. If changes are detected, it triggers a recompilation before dispatching the request:

```elixir
# Simplified view of Phoenix code reloader plug
defmodule Phoenix.CodeReloader.Plug do
  @behaviour Plug

  def call(conn, _opts) do
    case Phoenix.CodeReloader.reload!() do
      :ok -> conn
      {:error, output} ->
        conn
        |> put_resp_content_type("text/html")
        |> send_resp(500, format_error(output))
        |> halt()
    end
  end
end
```

This approach is efficient because recompilation only occurs on the next request, not on every file save. If a developer saves a file but does not trigger a request, no recompilation happens. The reloader also handles compilation errors gracefully, displaying them in the browser rather than crashing the development server.

## Limitations and Considerations

| Consideration | Description | Mitigation |
|--------------|-------------|-----------|
| **Two-version limit** | Only current and old versions maintained | Plan upgrades to avoid three-version scenarios |
| **Process purge** | Processes running purged (old-old) code are killed | Ensure processes transition within one upgrade cycle |
| **State compatibility** | New code must handle old state format | Implement `code_change/3` with version-aware migration |
| **Supervision changes** | Changing supervision tree structure requires restart | Use DynamicSupervisors for flexible child management |
| **NIF modules** | Native code (NIFs) cannot be hot-reloaded | Isolate NIFs in dedicated modules, restart if needed |
| **Macro changes** | Macros expand at compile time, not reload time | Recompile all modules using changed macros |
| **Module attribute changes** | Compile-time attributes are not updated by reload | Avoid runtime dependence on compile-time attributes |

## Best Practices

**Use External Calls in Long-Running Processes**: GenServer callbacks should use fully-qualified module calls (`Module.function(args)`) for any function that might be upgraded, ensuring the process transitions to new code on the next callback invocation. OTP behaviors handle this automatically through the behavior callback dispatch mechanism.

**Implement code_change/3 for Stateful Processes**: Any GenServer or other stateful OTP process that may be upgraded in production must implement `code_change/3` to handle state migration. The callback should be version-aware, supporting migration from any previous version to the current one.

**Prefer Rolling Restarts for Complex Upgrades**: When an upgrade involves supervision tree restructuring, dependency changes, or NIF module updates, a rolling restart strategy (deploying new instances and draining old ones) is safer and simpler than in-place hot code upgrades. The Prismatic Platform uses this approach on Fly.io for production deployments.

**Test Upgrades in Staging**: Hot code upgrades should be tested in staging environments before production. The appup and relup files must be validated against actual running processes to ensure state migration works correctly.

## Advanced Hot Code Reload Patterns

### State Machine Upgrades

When upgrading stateful processes that implement state machines, careful consideration must be given to state transition compatibility:

```elixir
defmodule StateMachineUpgrade do
  @moduledoc """
  Pattern for upgrading state machines while preserving state validity.
  """

  # Version 1.0 state machine
  @v1_states [:idle, :processing, :completed, :failed]

  # Version 2.0 adds new intermediate states
  @v2_states [:idle, :validating, :processing, :finalizing, :completed, :failed, :retrying]

  def code_change("1.0", %{state: :idle} = old_state, _extra) do
    # Idle state maps directly
    {:ok, %{old_state | state: :idle}}
  end

  def code_change("1.0", %{state: :processing} = old_state, _extra) do
    # Processing in v1 maps to validating in v2 (more specific)
    {:ok, %{old_state | state: :validating}}
  end

  def code_change("1.0", %{state: :failed} = old_state, _extra) do
    # Failed in v1 becomes retrying in v2 (auto-recovery)
    {:ok, %{old_state | state: :retrying, retry_count: 0}}
  end

  def code_change("1.0", old_state, _extra) do
    # Default mapping for other states
    {:ok, old_state}
  end

  # State validation after upgrade
  defp validate_state_consistency(state) do
    case {state.state, Map.get(state, :retry_count, 0)} do
      {:retrying, count} when count >= 0 -> :ok
      {:validating, _} when is_map(state.input_data) -> :ok
      _ -> {:error, :invalid_state_after_upgrade}
    end
  end
end
```

### Distributed System Hot Upgrades

When multiple nodes are involved, hot code upgrades must be coordinated to maintain cluster consistency:

```elixir
defmodule DistributedHotUpgrade do
  @moduledoc """
  Coordinates hot code upgrades across a distributed Erlang cluster.
  """

  @type upgrade_plan :: %{
    version: String.t(),
    modules: [module()],
    node_sequence: [node()],
    rollback_window: pos_integer()
  }

  def coordinate_cluster_upgrade(upgrade_plan) do
    with :ok <- validate_cluster_readiness(),
         :ok <- prepare_upgrade_package(upgrade_plan),
         :ok <- execute_rolling_upgrade(upgrade_plan) do
      :ok
    else
      {:error, reason} ->
        rollback_cluster_upgrade(upgrade_plan)
        {:error, reason}
    end
  end

  defp execute_rolling_upgrade(plan) do
    # Upgrade nodes one at a time
    Enum.reduce_while(plan.node_sequence, :ok, fn node, :ok ->
      case upgrade_single_node(node, plan) do
        :ok ->
          # Wait for node to stabilize
          :timer.sleep(5000)
          {:cont, :ok}
        error ->
          {:halt, error}
      end
    end)
  end

  defp upgrade_single_node(node, plan) do
    # Redirect traffic away from this node
    cluster_take_node_offline(node)

    # Perform the upgrade
    result = :rpc.call(node, :release_handler, :install_release, [plan.version])

    case result do
      {:ok, _old_vsn, _new_vsn} ->
        # Validate the upgrade was successful
        case validate_node_health(node) do
          :ok ->
            cluster_bring_node_online(node)
            :ok
          error ->
            # Rollback this node
            :rpc.call(node, :release_handler, :revert_release, [plan.version])
            error
        end
      error ->
        error
    end
  end

  defp validate_node_health(node) do
    health_checks = [
      fn -> :rpc.call(node, :erlang, :system_info, [:process_count]) end,
      fn -> :rpc.call(node, Application, :started_applications, []) end,
      fn -> :rpc.call(node, :gen_server, :call, [:some_critical_process, :health_check]) end
    ]

    Enum.reduce_while(health_checks, :ok, fn check, :ok ->
      case check.() do
        result when result != :error -> {:cont, :ok}
        _ -> {:halt, {:error, :health_check_failed}}
      end
    end)
  end
end
```

### Memory and Performance Monitoring During Upgrades

Hot code reloads can impact system performance, especially in memory-constrained environments:

```elixir
defmodule UpgradeMonitoring do
  @moduledoc """
  Monitors system resources during hot code upgrades to detect issues early.
  """

  def monitor_upgrade_impact(upgrade_fn) do
    pre_metrics = capture_baseline_metrics()

    spawn_monitor(fn ->
      continuous_monitoring()
    end)

    result = upgrade_fn.()

    post_metrics = capture_baseline_metrics()
    impact_analysis = analyze_upgrade_impact(pre_metrics, post_metrics)

    %{
      upgrade_result: result,
      performance_impact: impact_analysis,
      recommendations: generate_recommendations(impact_analysis)
    }
  end

  defp capture_baseline_metrics do
    %{
      memory_total: :erlang.memory(:total),
      memory_processes: :erlang.memory(:processes),
      memory_code: :erlang.memory(:code),
      process_count: :erlang.system_info(:process_count),
      loaded_modules: length(:code.all_loaded()),
      message_queue_lengths: sample_message_queue_lengths(),
      gc_metrics: sample_gc_metrics(),
      timestamp: :erlang.monotonic_time(:millisecond)
    }
  end

  defp analyze_upgrade_impact(pre, post) do
    %{
      memory_delta: %{
        total: post.memory_total - pre.memory_total,
        processes: post.memory_processes - pre.memory_processes,
        code: post.memory_code - pre.memory_code
      },
      process_delta: post.process_count - pre.process_count,
      modules_delta: post.loaded_modules - pre.loaded_modules,
      duration_ms: post.timestamp - pre.timestamp,
      memory_efficiency: calculate_memory_efficiency(pre, post)
    }
  end

  defp generate_recommendations(impact) do
    recommendations = []

    recommendations = if impact.memory_delta.total > 100_000_000 do  # 100MB
      ["Consider memory optimization - upgrade increased memory by #{div(impact.memory_delta.total, 1_000_000)}MB" | recommendations]
    else
      recommendations
    end

    recommendations = if impact.process_delta > 1000 do
      ["Unusual process count increase: #{impact.process_delta} processes" | recommendations]
    else
      recommendations
    end

    recommendations = if impact.duration_ms > 30_000 do  # 30 seconds
      ["Slow upgrade detected: #{impact.duration_ms}ms - consider optimization" | recommendations]
    else
      recommendations
    end

    case recommendations do
      [] -> ["Upgrade completed successfully with minimal system impact"]
      _ -> recommendations
    end
  end

  defp continuous_monitoring do
    # Sample system metrics every second during upgrade
    receive do
      :stop_monitoring -> :ok
    after
      1000 ->
        metrics = capture_baseline_metrics()
        check_for_anomalies(metrics)
        continuous_monitoring()
    end
  end

  defp check_for_anomalies(metrics) do
    # Check for concerning patterns during upgrade
    cond do
      metrics.memory_total > 2_000_000_000 ->  # 2GB
        Logger.warning("High memory usage during upgrade", memory_mb: div(metrics.memory_total, 1_000_000))

      metrics.process_count > 100_000 ->
        Logger.warning("High process count during upgrade", process_count: metrics.process_count)

      length(metrics.message_queue_lengths |> Enum.filter(&(&1 > 1000))) > 10 ->
        Logger.warning("Multiple processes with large message queues during upgrade")

      true ->
        :ok
    end
  end
end
```

### Hot Code Reload for WebSocket Connections

LiveView connections present special challenges during hot code reloads:

```elixir
defmodule LiveViewUpgradeHandler do
  @moduledoc """
  Handles hot code upgrades for LiveView processes while maintaining
  WebSocket connections and user state.
  """

  def upgrade_liveview_processes(module, old_version, new_version) do
    # Find all LiveView processes for this module
    liveview_processes = find_liveview_processes(module)

    Logger.info("Upgrading #{length(liveview_processes)} LiveView processes",
      module: module,
      from_version: old_version,
      to_version: new_version
    )

    results = for pid <- liveview_processes do
      upgrade_single_liveview(pid, module, old_version, new_version)
    end

    successful = Enum.count(results, &(&1 == :ok))
    total = length(results)

    %{
      total_processes: total,
      successful_upgrades: successful,
      failed_upgrades: total - successful,
      success_rate: successful / total
    }
  end

  defp upgrade_single_liveview(pid, module, old_version, new_version) do
    try do
      # Suspend the LiveView process
      :sys.suspend(pid)

      # Capture current state
      current_state = :sys.get_state(pid)

      # Migrate state to new version
      case migrate_liveview_state(current_state, module, old_version, new_version) do
        {:ok, new_state} ->
          # Replace state
          :sys.replace_state(pid, fn _old -> new_state end)

          # Resume the process
          :sys.resume(pid)

          # Trigger a re-render to update the client
          send(pid, {:internal, :force_rerender})

          :ok

        {:error, reason} ->
          # Resume with old state on migration failure
          :sys.resume(pid)
          {:error, {:state_migration_failed, reason}}
      end
    rescue
      error ->
        # Ensure process is resumed even on error
        :sys.resume(pid)
        {:error, {:upgrade_exception, error}}
    end
  end

  defp migrate_liveview_state(state, module, old_version, new_version) do
    case apply(module, :code_change, [old_version, state, new_version]) do
      {:ok, new_state} -> {:ok, new_state}
      {:error, reason} -> {:error, reason}
      other -> {:error, {:invalid_code_change_return, other}}
    end
  end

  defp find_liveview_processes(module) do
    # Use process registry to find all LiveView processes for the module
    Registry.select(Phoenix.LiveView.Registry, [
      {{:"$1", :"$2", :"$3"}, [{:==, :"$2", module}], [:"$1"]}
    ])
  end
end
```

### Testing Hot Code Reloads

Comprehensive testing of hot code reload scenarios requires specialized tooling:

```elixir
defmodule HotReloadTestSuite do
  use ExUnit.Case, async: false

  @moduletag :hot_reload

  setup do
    # Start a test process running old code
    {:ok, pid} = TestTarget.start_link(version: "1.0")
    %{test_process: pid}
  end

  test "state migration preserves critical data", %{test_process: pid} do
    # Set up initial state
    :ok = TestTarget.set_state(pid, %{counter: 42, name: "test"})

    # Verify initial state
    assert %{counter: 42, name: "test"} = TestTarget.get_state(pid)

    # Simulate hot code reload
    :ok = simulate_code_reload(TestTarget, "1.0", "2.0")

    # Verify state migration
    new_state = TestTarget.get_state(pid)
    assert new_state.counter == 42
    assert new_state.name == "test"
    assert Map.has_key?(new_state, :created_at)  # New field in v2.0
  end

  test "external calls use new code after reload", %{test_process: pid} do
    # Call function that will be changed
    assert "v1.0" = TestTarget.version_info(pid)

    # Reload code
    :ok = simulate_code_reload(TestTarget, "1.0", "2.0")

    # External call should now use new code
    assert "v2.0" = TestTarget.version_info(pid)
  end

  test "upgrade handles process crashes gracefully" do
    # Start process with state that will cause migration to fail
    {:ok, pid} = TestTarget.start_link(invalid_state: true)

    # Attempt upgrade
    result = HotCodeReloadManager.upgrade_process(pid, "1.0", "2.0")

    # Should handle failure gracefully
    assert {:error, :state_migration_failed} = result

    # Process should still be alive with old state
    assert Process.alive?(pid)
  end

  test "upgrade rollback works correctly", %{test_process: pid} do
    original_state = TestTarget.get_state(pid)

    # Upgrade to new version
    :ok = simulate_code_reload(TestTarget, "1.0", "2.0")

    # Verify upgrade worked
    new_state = TestTarget.get_state(pid)
    refute new_state == original_state

    # Rollback
    :ok = simulate_code_reload(TestTarget, "2.0", "1.0")

    # State should be compatible with original version
    rollback_state = TestTarget.get_state(pid)
    assert Map.take(rollback_state, [:counter, :name]) ==
           Map.take(original_state, [:counter, :name])
  end

  defp simulate_code_reload(module, old_version, new_version) do
    # In a real test, this would involve compiling new beam files
    # and using the code server to load them
    :code.purge(module)
    :code.load_file(module)

    # Trigger code_change for all processes of this module
    upgrade_all_processes(module, old_version, new_version)
  end

  defp upgrade_all_processes(module, old_version, new_version) do
    processes = Process.list()
    |> Enum.filter(fn pid ->
      case Process.info(pid, :dictionary) do
        {:dictionary, dict} ->
          Keyword.get(dict, :module) == module
        _ ->
          false
      end
    end)

    Enum.each(processes, fn pid ->
      :sys.change_code(pid, module, old_version, new_version)
    end)

    :ok
  end
end
```

## Related Terms

- [BEAM](@/glossary/beam.md) - Virtual machine providing the hot code reload infrastructure
- [Release](@/glossary/release.md) - OTP release packaging with upgrade/downgrade support
- [Fly.io](@/glossary/fly-io.md) - Deployment platform for production BEAM releases
- [Supervisor](@/glossary/supervisor.md) - Process supervision during code upgrades
- [Fault Tolerance](@/glossary/fault-tolerance.md) - Zero-downtime upgrades as a fault tolerance mechanism
- [Process Isolation](@/glossary/process-isolation.md) - Per-process code version tracking
- [LiveView](@/glossary/liveview.md) - Real-time UI updates leveraging development hot reload
- [Observer](@/glossary/observer.md) - Debugging tool loadable at runtime through hot code loading
- [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) - Flexible supervision during code upgrades
- [Phoenix](@/glossary/phoenix.md) - Web framework with development-time code reloading

## See Also

- [Architecture](@/architecture/_index.md) - Deployment and upgrade architecture
- [Technologies](@/technologies/_index.md) - BEAM runtime and OTP release handling
- [Capabilities](@/capabilities/_index.md) - Zero-downtime deployment capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)