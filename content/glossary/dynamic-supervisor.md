+++
title = "DynamicSupervisor"
weight = 28
[extra]
category = "otp"
description = "OTP supervisor that starts child processes on demand at runtime, enabling dynamic process creation for agents, sessions, and task workers."
related_terms = ["supervisor", "fault-tolerance", "agent", "process-isolation", "registry-otp", "let-it-crash", "cluster", "broadway", "circuit-breaker", "load-balancing"]
abbreviation = "N/A"
domain = "OTP Process Management"
complexity = "Intermediate"
beam_specific = true
otp_version = "21+"
elixir_version = "1.6+"
prismatic_usage = "Extensive"
platform_component = "PrismaticAgents, PrismaticSupervisor, PrismaticWeb"
first_introduced = "Gen 2"
current_generation = "Gen 19"
quality_impact = "High"
fault_tolerance_impact = "Critical"
restart_strategy = ":one_for_one (exclusive)"
distributed_variant = "Horde.DynamicSupervisor"
key_functions = ["start_child/2", "terminate_child/2", "count_children/1", "which_children/1"]
max_children_default = ":infinity"
prismatic_agent_count = 530
session_management = true
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1324
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["DynamicSupervisor", "supervisor", "starts", "child", "processes", "demand", "runtime", "glossary", "otp", "Prismatic Platform"]
tags = ["glossary", "otp", "dynamicsupervisor", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "DynamicSupervisor - Prismatic Platform"
+++

## Definition

DynamicSupervisor is an [OTP](/glossary/supervisor/) behavior for supervising processes that are started dynamically at runtime rather than declared statically in a supervision tree. Unlike a standard Supervisor that starts a fixed set of children at boot time and maintains that set for the lifetime of the application, DynamicSupervisor begins with zero children and spawns them on demand via `DynamicSupervisor.start_child/2`. Children can be started, stopped, and restarted independently throughout the system's lifetime.

This pattern addresses a fundamental challenge in concurrent systems: the number of concurrent activities is often unknown at compile time and changes continuously during operation. Web socket connections arrive and depart. User sessions begin and end. Background jobs are enqueued and completed. Agent instances are spawned for specific tasks and terminated when those tasks finish. In all of these cases, the system needs a supervisor that can manage a variable number of child processes, providing the same fault-tolerance guarantees as a static supervisor while accommodating dynamic workloads.

DynamicSupervisor enforces the `:one_for_one` restart strategy exclusively -- each child is independent, and the failure of one child does not affect any other child. This makes DynamicSupervisor ideal for homogeneous pools of workers where each worker handles an independent unit of work. For heterogeneous children with dependencies, the standard Supervisor with strategies like `:one_for_all` or `:rest_for_one` is more appropriate.

## Historical Context and Evolution

Before DynamicSupervisor was introduced in Elixir 1.6, dynamic process supervision was handled through two mechanisms: the `:simple_one_for_one` strategy in standard Supervisor (an Erlang/OTP feature), and manual process management without supervision. The `:simple_one_for_one` strategy was functionally similar to DynamicSupervisor but had several limitations: it required defining a single child specification template at init time, did not support `terminate_child/2`, and had confusing semantics when combined with other supervision strategies.

DynamicSupervisor was created to provide a cleaner, more explicit API for dynamic process supervision. It separates the concept of "dynamic child management" from the standard Supervisor behavior, making the intention clear and the API more ergonomic. The `:simple_one_for_one` strategy was deprecated in Elixir 1.6 in favor of DynamicSupervisor.

In the BEAM ecosystem, DynamicSupervisor represents the recognition that most production systems need both static structure (application supervisors, connection pools, registries) and dynamic capacity (workers, sessions, connections). The static structure provides the stable skeleton; the dynamic capacity provides the scalable muscle.

## DynamicSupervisor vs. Static Supervisor

| Characteristic | Static Supervisor | DynamicSupervisor |
|---------------|------------------|-------------------|
| **Child Definition** | Fixed list at init time | Added dynamically via `start_child/2` |
| **Initial Children** | All children started at boot | Zero children at boot |
| **Restart Strategy** | `:one_for_one`, `:one_for_all`, `:rest_for_one` | `:one_for_one` only |
| **Child Count** | Fixed (known at compile time) | Variable (changes at runtime) |
| **Use Case** | Core services, infrastructure | Workers, sessions, agents, connections |
| **Memory at Idle** | Fixed (all children running) | Minimal (no children until needed) |
| **Supervision Spec** | Declarative child list in `init/1` | Empty `init/1`, children added later |
| **Child Heterogeneity** | Supports different child types | Typically homogeneous children |
| **Dependency Ordering** | Preserves child start order | No ordering guarantees |

## Implementation

### Basic DynamicSupervisor

```elixir
defmodule AgentDynamicSupervisor do
  @moduledoc """
  DynamicSupervisor for managing AIAD agent worker processes.
  Agents are spawned on demand for task execution and terminated
  upon task completion. Provides fault tolerance through automatic
  restart of crashed agents.
  """

  use DynamicSupervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl DynamicSupervisor
  def init(_opts) do
    DynamicSupervisor.init(
      strategy: :one_for_one,
      max_children: 500,
      max_restarts: 100,
      max_seconds: 60
    )
  end

  @spec start_agent(map()) :: DynamicSupervisor.on_start_child()
  def start_agent(agent_spec) do
    child_spec = {AgentWorker, agent_spec}

    case DynamicSupervisor.start_child(__MODULE__, child_spec) do
      {:ok, pid} ->
        :telemetry.execute(
          [:prismatic, :agents, :started],
          %{count: 1},
          %{agent_type: agent_spec.type}
        )
        {:ok, pid}

      {:error, reason} = error ->
        :telemetry.execute(
          [:prismatic, :agents, :start_failed],
          %{count: 1},
          %{agent_type: agent_spec.type, reason: reason}
        )
        error
    end
  end

  @spec stop_agent(pid()) :: :ok | {:error, :not_found}
  def stop_agent(pid) do
    DynamicSupervisor.terminate_child(__MODULE__, pid)
  end

  @spec count_agents() :: non_neg_integer()
  def count_agents do
    %{active: count} = DynamicSupervisor.count_children(__MODULE__)
    count
  end

  @spec list_agents() :: [{:undefined, pid(), :worker, [module()]}]
  def list_agents do
    DynamicSupervisor.which_children(__MODULE__)
  end
end
```

### Worker Process with Child Spec

```elixir
defmodule AgentWorker do
  @moduledoc """
  Worker process for executing AIAD agent tasks. Uses :transient
  restart to avoid restarting processes that exit normally after
  completing their task.
  """

  use GenServer, restart: :transient

  require Logger

  @spec start_link(map()) :: GenServer.on_start()
  def start_link(agent_spec) do
    GenServer.start_link(__MODULE__, agent_spec)
  end

  @impl GenServer
  def init(agent_spec) do
    state = %{
      spec: agent_spec,
      status: :initializing,
      started_at: DateTime.utc_now(),
      task_ref: nil
    }

    {:ok, state, {:continue, :initialize}}
  end

  @impl GenServer
  def handle_continue(:initialize, state) do
    case load_agent_configuration(state.spec) do
      {:ok, config} ->
        Logger.info("Agent #{state.spec.type} initialized successfully")
        {:noreply, %{state | status: :running, config: config}}

      {:error, reason} ->
        Logger.error("Agent initialization failed: #{inspect(reason)}")
        {:stop, {:initialization_failed, reason}, state}
    end
  end

  @impl GenServer
  def handle_call({:execute, task}, _from, state) do
    case execute_task(task, state.config) do
      {:ok, result} ->
        {:reply, {:ok, result}, state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl GenServer
  def terminate(reason, state) do
    Logger.info("Agent #{state.spec.type} terminating: #{inspect(reason)}")
    :telemetry.execute(
      [:prismatic, :agents, :terminated],
      %{uptime_ms: DateTime.diff(DateTime.utc_now(), state.started_at, :millisecond)},
      %{agent_type: state.spec.type, reason: reason}
    )
    :ok
  end

  defp load_agent_configuration(spec) do
    {:ok, %{type: spec.type, settings: %{}}}
  end

  defp execute_task(task, config) do
    {:ok, %{task: task, result: :completed}}
  end
end
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **`:strategy`** | atom | `:one_for_one` | Only `:one_for_one` is supported |
| **`:max_children`** | integer or `:infinity` | `:infinity` | Maximum number of concurrent children |
| **`:max_restarts`** | integer | 3 | Maximum restarts within `max_seconds` window |
| **`:max_seconds`** | integer | 5 | Time window for restart counting |
| **`:extra_arguments`** | list | `[]` | Additional arguments prepended to child start args |

### Restart Strategies for Children

| Strategy | Behaviour | Use Case |
|----------|-----------|----------|
| `:permanent` | Always restart on exit | Long-running services |
| `:transient` | Restart only on abnormal exit | Task workers that complete normally |
| `:temporary` | Never restart | Fire-and-forget operations |

The choice of child restart strategy is critical for DynamicSupervisor performance. Using `:permanent` for task workers that exit normally after completing their work creates unnecessary restart churn. Using `:temporary` for workers that should recover from crashes loses fault tolerance. The `:transient` strategy, which restarts only on abnormal exit (crash), is typically the correct choice for task workers under a DynamicSupervisor.

## Implementation in Prismatic Platform

DynamicSupervisors are used throughout the Prismatic Platform for runtime process management across multiple architectural layers:

- **Agent Execution Layer**: The platform's 530 AIAD [agents](/glossary/agent/) are spawned under DynamicSupervisors. When an agent task is triggered, a new agent worker process is started under the DynamicSupervisor. When the task completes, the process terminates cleanly. If the agent crashes mid-task, the DynamicSupervisor restarts it according to its child spec.
- **Session Management**: Each user session (including [LiveView](/glossary/liveview/) connections) runs as a process under a DynamicSupervisor. Session count scales from zero to thousands based on active users.
- **Investigation Workflows**: OSINT investigation workflows spawn parallel worker processes for concurrent intelligence gathering. Each data source query runs as an independent child of a DynamicSupervisor.
- **[Broadway](/glossary/broadway/) Processing**: Broadway's internal architecture uses DynamicSupervisors for managing processor and batcher processes that scale with message volume.
- **PrismaticSupervisor**: The `prismatic_supervisor` app uses DynamicSupervisors with pluggable backends (ETS for development, Horde for production clustering) to manage domain-specific supervision trees.
- **Task Workers**: Parallel quality gate checks, security scans, and compliance assessments spawn task processes under DynamicSupervisors for concurrent execution.

### Platform Supervision Architecture

```
PrismaticPlatform.Application
  |
  +-- PrismaticAgents.Supervisor (static)
  |     +-- AgentDynamicSupervisor (dynamic, max_children: 500)
  |     |     +-- AgentWorker #1 (transient)
  |     |     +-- AgentWorker #2 (transient)
  |     |     +-- ... (up to 530 agent workers)
  |     +-- AgentRegistry (static)
  |
  +-- PrismaticWeb.Endpoint (static)
  |     +-- SessionDynamicSupervisor (dynamic)
  |     |     +-- Session #1 (transient)
  |     |     +-- Session #2 (transient)
  |     |     +-- ... (scales with active users)
  |
  +-- PrismaticPerimeter.Supervisor (static)
        +-- ScannerDynamicSupervisor (dynamic)
              +-- ScanWorker #1 (temporary)
              +-- ScanWorker #2 (temporary)
```

## Integration with Registry

DynamicSupervisors commonly pair with an OTP [Registry](/glossary/registry-otp/) for named process lookup:

```elixir
defmodule AgentManager do
  @moduledoc """
  Manages agent lifecycle through DynamicSupervisor with Registry
  integration for named lookup. Provides idempotent agent start
  (returns existing process if already running).
  """

  @spec start_agent(String.t(), map()) :: {:ok, pid()} | {:error, term()}
  def start_agent(agent_id, spec) do
    child_spec = {AgentWorker, Map.put(spec, :id, agent_id)}

    case DynamicSupervisor.start_child(AgentDynamicSupervisor, child_spec) do
      {:ok, pid} ->
        Registry.register(AgentRegistry, agent_id, %{started: DateTime.utc_now()})
        {:ok, pid}

      {:error, {:already_started, pid}} ->
        {:ok, pid}

      {:error, reason} = error ->
        error
    end
  end

  @spec find_agent(String.t()) :: {:ok, pid()} | {:error, :not_found}
  def find_agent(agent_id) do
    case Registry.lookup(AgentRegistry, agent_id) do
      [{pid, _meta}] -> {:ok, pid}
      [] -> {:error, :not_found}
    end
  end

  @spec stop_agent(String.t()) :: :ok | {:error, :not_found}
  def stop_agent(agent_id) do
    case find_agent(agent_id) do
      {:ok, pid} -> AgentDynamicSupervisor.stop_agent(pid)
      {:error, :not_found} -> {:error, :not_found}
    end
  end

  @spec active_agents() :: list({String.t(), pid(), map()})
  def active_agents do
    Registry.select(AgentRegistry, [{{:"$1", :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}])
  end
end
```

## Scaling and Resource Management

DynamicSupervisors provide built-in mechanisms for controlling resource consumption:

| Mechanism | Purpose | Configuration |
|-----------|---------|---------------|
| **max_children** | Prevent unbounded process creation | Set to match available resources |
| **max_restarts / max_seconds** | Prevent restart storms | Tune based on expected failure rate |
| **Transient restart** | Don't restart processes that exit normally | `restart: :transient` in child spec |
| **Temporary restart** | Never restart child | `restart: :temporary` in child spec |
| **Count monitoring** | Track active child count | `DynamicSupervisor.count_children/1` |
| **Which children** | List all active children | `DynamicSupervisor.which_children/1` |

### Backpressure Through max_children

When `max_children` is set and the limit is reached, `start_child/2` returns `{:error, :max_children}`. This provides natural [backpressure](/glossary/backpressure/) -- callers must handle the rejection and either wait, queue, or shed load:

```elixir
defmodule AgentPool do
  @moduledoc """
  Agent pool with backpressure through max_children limit.
  When the pool is full, requests are queued with configurable
  timeout and overflow behavior.
  """

  @pool_timeout :timer.seconds(30)

  @spec execute(map(), keyword()) :: {:ok, term()} | {:error, term()}
  def execute(task, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, @pool_timeout)

    case AgentDynamicSupervisor.start_agent(task) do
      {:ok, pid} ->
        result = GenServer.call(pid, {:execute, task}, timeout)
        AgentDynamicSupervisor.stop_agent(pid)
        result

      {:error, :max_children} ->
        {:error, :pool_exhausted}
    end
  end
end
```

## Distributed DynamicSupervisor (Horde)

For [clustered](/glossary/cluster/) deployments, the Horde library provides a distributed DynamicSupervisor that distributes children across cluster nodes:

```elixir
defmodule DistributedAgentSupervisor do
  @moduledoc """
  Distributed DynamicSupervisor using Horde for multi-node
  agent management. Children are automatically distributed
  across cluster nodes and restarted on surviving nodes if
  a node goes down.
  """

  use Horde.DynamicSupervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Horde.DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    Horde.DynamicSupervisor.init(
      strategy: :one_for_one,
      members: :auto,
      distribution_strategy: Horde.UniformDistribution
    )
  end

  @spec start_agent(map()) :: DynamicSupervisor.on_start_child()
  def start_agent(spec) do
    Horde.DynamicSupervisor.start_child(__MODULE__, {AgentWorker, spec})
  end
end
```

When a node leaves the cluster (planned shutdown or crash), Horde automatically restarts the orphaned children on surviving nodes. This provides automatic failover without any application-level code.

## Testing DynamicSupervisors

```elixir
defmodule AgentDynamicSupervisorTest do
  use ExUnit.Case, async: true

  setup do
    supervisor = start_supervised!({AgentDynamicSupervisor, []})
    %{supervisor: supervisor}
  end

  test "starts and stops agent processes" do
    {:ok, pid} = AgentDynamicSupervisor.start_agent(%{type: :scanner})
    assert Process.alive?(pid)
    assert AgentDynamicSupervisor.count_agents() == 1

    :ok = AgentDynamicSupervisor.stop_agent(pid)
    refute Process.alive?(pid)
    assert AgentDynamicSupervisor.count_agents() == 0
  end

  test "restarts crashed agent with :permanent restart" do
    {:ok, pid} = AgentDynamicSupervisor.start_agent(%{type: :scanner})
    ref = Process.monitor(pid)

    Process.exit(pid, :kill)
    assert_receive {:DOWN, ^ref, :process, ^pid, :killed}

    # DynamicSupervisor restarts the child
    Process.sleep(50)
    assert AgentDynamicSupervisor.count_agents() == 1
  end

  test "does not restart transient child on normal exit" do
    {:ok, pid} = AgentDynamicSupervisor.start_agent(%{type: :scanner})
    ref = Process.monitor(pid)

    GenServer.stop(pid, :normal)
    assert_receive {:DOWN, ^ref, :process, ^pid, :normal}

    Process.sleep(50)
    assert AgentDynamicSupervisor.count_agents() == 0
  end

  test "respects max_children limit" do
    # Start agents up to the limit
    for _ <- 1..500 do
      assert {:ok, _} = AgentDynamicSupervisor.start_agent(%{type: :scanner})
    end

    # Next start should fail
    assert {:error, :max_children} = AgentDynamicSupervisor.start_agent(%{type: :scanner})
  end
end
```

## Best Practices

**Set Appropriate max_children Limits**: Configure `max_children` based on available system resources. Unbounded process creation can exhaust memory and CPU, leading to cascading failures across the supervision tree.

**Use Transient Restart for Task Workers**: Workers that perform a discrete task and exit normally should use `restart: :transient` to avoid unnecessary restarts. Only permanently running services should use `restart: :permanent`.

**Pair with Registry for Named Lookup**: Always pair DynamicSupervisors with an OTP Registry for named process discovery. Without a registry, finding specific child processes requires iterating `which_children/1`, which is O(n) and should not be used in hot paths.

**Monitor Restart Intensity**: Tune `max_restarts` and `max_seconds` to match the expected failure profile. Too aggressive limits (low max_restarts) cause the supervisor to crash on transient failures; too permissive limits mask systemic issues.

**Use Telemetry for Child Lifecycle Events**: Emit telemetry events when children are started, stopped, and crash. This enables monitoring dashboards to track pool utilization, crash rates, and lifecycle patterns.

**Implement Graceful Drain**: When shutting down a DynamicSupervisor (e.g., during deployment), implement graceful drain logic that allows in-flight work to complete before terminating children.

## Use Cases

- **Agent Lifecycle Management**: Spawning AIAD agent worker processes on demand for task execution, with automatic cleanup on task completion and fault recovery on agent crash
- **Session Management**: Managing user sessions and LiveView connections as dynamically supervised processes that scale with active user count
- **Investigation Workflows**: Running parallel OSINT data source queries as independent child processes under a DynamicSupervisor for concurrent intelligence gathering
- **Batch Processing**: Spawning temporary worker processes for parallel quality gate checks, security scans, and compliance assessments
- **Connection Pools**: Managing pools of WebSocket, HTTP, or database connections that grow and shrink based on demand
- **Job Execution**: Running background jobs as supervised processes with automatic retry and crash recovery

## Related Concepts

- [Supervisor](/glossary/supervisor/) - Static supervisor for fixed child sets; parent concept
- [Fault Tolerance](/glossary/fault-tolerance/) - System property enabled by supervised process restart
- [Agent](/glossary/agent/) - AIAD agents spawned under DynamicSupervisors
- [Process Isolation](/glossary/process-isolation/) - BEAM isolation enabling safe independent restart
- [Registry (OTP)](/glossary/registry-otp/) - Named process lookup complementing dynamic spawning
- [Let It Crash](/glossary/let-it-crash/) - Philosophy enabled by supervisor-based recovery
- [Cluster](/glossary/cluster/) - Distributed DynamicSupervisors via Horde for cluster deployments
- [Broadway](/glossary/broadway/) - Data pipeline using DynamicSupervisors for worker management
- [Circuit Breaker](/glossary/circuit-breaker/) - Pattern protecting DynamicSupervisors from cascade failures
- [Load Balancing](/glossary/load-balancing/) - Distributing work across dynamically supervised processes

## See Also

- [Architecture](/architecture/) - Platform supervision architecture
- [Technologies](/technologies/) - OTP behaviors and patterns
- [Agents](/agents/) - Agent lifecycle managed through DynamicSupervisors

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
