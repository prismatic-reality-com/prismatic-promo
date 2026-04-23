+++
title = "OTP Design Patterns for Prismatic"
weight = 13
[extra]
description = "GenServer, Supervisor, Application patterns, process topology, and fault tolerance in the Prismatic context"
category = "beginner"
difficulty = "beginner"
duration = "55 min"
prerequisites = ["getting-started"]
glossary_terms = ["aiad", "no-mercy", "no-doubts", "quality-dna"]
technologies = ["elixir", "otp", "genserver", "erlang-otp"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1152
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OTP", "Design", "Patterns", "Prismatic", "GenServer", "Supervisor", "Application", "academy", "beginner", "Prismatic Platform"]
tags = ["academy", "beginner", "otp-design-patterns-for-prismatic", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "OTP Design Patterns for Prismatic - Prismatic Platform"
+++

## Overview

OTP (Open Telecom Platform) is not optional in Prismatic -- it is the foundation. Every stateful component runs inside an OTP process. Every failure is handled by a supervision tree. Every agent is a GenServer. This guide teaches you the OTP patterns used throughout the platform, why they matter, and how to apply them correctly.

You will learn:

- GenServer: the workhorse of stateful processes
- Supervisor: building fault-tolerant process trees
- Application: structuring OTP applications in the umbrella
- Process topology: designing process hierarchies for your domain
- Fault tolerance: let-it-crash philosophy in practice
- The Prismatic meta-rule: if it could be written the same way in Node.js, it is wrong

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Basic Elixir syntax (modules, functions, pattern matching)
- Understanding of concurrent programming concepts

## Core Concepts

### Why OTP?

The BEAM virtual machine (Elixir's runtime) provides lightweight processes that are:

- **Isolated**: one process crashing does not affect others
- **Concurrent**: millions of processes can run simultaneously
- **Supervised**: crashed processes are automatically restarted
- **Distributed**: processes can communicate across nodes

OTP provides the patterns (GenServer, Supervisor, Application) that organize these processes into reliable systems. The Prismatic Platform relies on these guarantees for its 400+ agents, storage adapters, and real-time dashboards.

### The Process Model

Every Prismatic component maps to processes:

```
Agent          --> GenServer process
Agent Registry --> Registry + ETS table
Storage        --> GenServer per adapter
Dashboard      --> LiveView process per user connection
Orchestrator   --> GenServer coordinating other GenServers
Supervisor     --> Supervisor process monitoring children
```

### The Meta-Rule Revisited

> **If the same solution could be written identically in Node.js, it is WRONG.**

This means:
- State belongs in processes, not in closures or global variables
- Concurrency uses message passing, not callbacks or promises
- Failure handling uses supervision, not try/catch
- Communication uses GenServer calls, not shared memory

## Step-by-Step Guide

### Step 1: GenServer -- The Stateful Process

GenServer is the most common OTP pattern. It wraps a process that maintains state and responds to messages:

```elixir
defmodule PrismaticAgents.Counter do
  @moduledoc """
  A simple GenServer demonstrating the core pattern.
  State is maintained in the process, accessed through a public API,
  and modified through message passing.
  """

  use GenServer

  # --- Public API (runs in the caller's process) ---

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    initial_value = Keyword.get(opts, :initial, 0)
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, initial_value, name: name)
  end

  @spec increment(GenServer.server()) :: :ok
  def increment(server \\ __MODULE__) do
    GenServer.cast(server, :increment)
  end

  @spec get_count(GenServer.server()) :: non_neg_integer()
  def get_count(server \\ __MODULE__) do
    GenServer.call(server, :get_count)
  end

  @spec reset(GenServer.server()) :: :ok
  def reset(server \\ __MODULE__) do
    GenServer.call(server, :reset)
  end

  # --- GenServer Callbacks (runs in the GenServer process) ---

  @impl true
  def init(initial_value) do
    {:ok, %{count: initial_value, started_at: DateTime.utc_now()}}
  end

  @impl true
  def handle_cast(:increment, state) do
    {:noreply, %{state | count: state.count + 1}}
  end

  @impl true
  def handle_call(:get_count, _from, state) do
    {:reply, state.count, state}
  end

  @impl true
  def handle_call(:reset, _from, state) do
    {:reply, :ok, %{state | count: 0}}
  end
end
```

Key patterns to note:

- **Public API functions** provide a clean interface. Callers never send raw messages.
- **`@impl true`** on every callback. This is mandatory in Prismatic.
- **`@spec`** on every public function. Also mandatory.
- **call vs. cast**: `call` is synchronous (waits for reply), `cast` is asynchronous (fire-and-forget).

### Step 2: Supervisor -- Fault Tolerance

Supervisors monitor child processes and restart them on failure:

```elixir
defmodule PrismaticAgents.MonitoringSupervisor do
  @moduledoc """
  Supervises monitoring agents. Uses :one_for_one strategy:
  if one agent crashes, only that agent is restarted.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # Each child is a GenServer with its own configuration
      {PrismaticAgents.MetricSentinel, %{
        metric_name: "cpu_usage",
        threshold_high: 90.0,
        threshold_low: 5.0,
        check_interval_ms: 10_000,
        metric_source: fn -> :rand.uniform(100) end
      }},
      {PrismaticAgents.MetricSentinel, %{
        metric_name: "memory_usage",
        threshold_high: 85.0,
        threshold_low: 10.0,
        check_interval_ms: 15_000,
        metric_source: fn -> :rand.uniform(100) end
      }},
      # Task supervisor for ad-hoc concurrent work
      {Task.Supervisor, name: PrismaticAgents.TaskSupervisor}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### Supervision Strategies

| Strategy | Behavior | Use When |
|----------|----------|----------|
| `:one_for_one` | Restart only the crashed child | Children are independent |
| `:one_for_all` | Restart all children | Children depend on each other |
| `:rest_for_one` | Restart crashed child and all children started after it | Sequential dependencies |

Choose the strategy that matches your process dependencies. Most Prismatic supervisors use `:one_for_one` because agents are designed to be independent.

### Step 3: Application -- Structuring the Umbrella App

Every umbrella app is an OTP Application with a supervision tree:

```elixir
defmodule PrismaticAgents.Application do
  @moduledoc """
  OTP Application for the Prismatic Agents subsystem.
  Starts the supervision tree that manages all agent processes.
  """

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Registry for agent process lookup
      {Registry, keys: :unique, name: PrismaticAgents.Registry},

      # Monitoring supervisor (agents that monitor metrics)
      PrismaticAgents.MonitoringSupervisor,

      # Dynamic supervisor for agents started at runtime
      {DynamicSupervisor, name: PrismaticAgents.DynamicSupervisor, strategy: :one_for_one},

      # Health monitor for all agents
      PrismaticAgents.HealthMonitor
    ]

    opts = [strategy: :one_for_one, name: PrismaticAgents.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Step 4: DynamicSupervisor -- Runtime Process Creation

When you need to start processes at runtime (e.g., creating agents on demand):

```elixir
defmodule PrismaticAgents.AgentManager do
  @moduledoc """
  Manages dynamic agent creation and termination.
  Uses DynamicSupervisor for runtime process management.
  """

  @spec start_agent(map()) :: {:ok, pid()} | {:error, term()}
  def start_agent(config) do
    child_spec = {PrismaticAgents.MetricSentinel, config}

    case DynamicSupervisor.start_child(PrismaticAgents.DynamicSupervisor, child_spec) do
      {:ok, pid} ->
        Logger.info("Started agent #{config.metric_name} (pid: #{inspect(pid)})")
        {:ok, pid}

      {:error, {:already_started, pid}} ->
        {:ok, pid}

      {:error, reason} ->
        Logger.error("Failed to start agent: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @spec stop_agent(String.t()) :: :ok | {:error, :not_found}
  def stop_agent(metric_name) do
    case Registry.lookup(PrismaticAgents.Registry, {:metric_sentinel, metric_name}) do
      [{pid, _}] ->
        DynamicSupervisor.terminate_child(PrismaticAgents.DynamicSupervisor, pid)
        :ok

      [] ->
        {:error, :not_found}
    end
  end
end
```

### Step 5: Process Topology Design

Before writing code, design your process tree. Here is the Prismatic Agents topology:

```
PrismaticAgents.Supervisor (:one_for_one)
|
+-- Registry (PrismaticAgents.Registry)
|
+-- MonitoringSupervisor (:one_for_one)
|     |
|     +-- MetricSentinel ("cpu_usage")
|     +-- MetricSentinel ("memory_usage")
|     +-- TaskSupervisor
|
+-- DynamicSupervisor (runtime agents)
|     |
|     +-- [dynamically added agents]
|
+-- HealthMonitor
```

Rules for topology design:

1. **Every stateful entity gets its own process**
2. **Group related processes under a shared supervisor**
3. **Use DynamicSupervisor for runtime-created processes**
4. **Use Registry for process discovery (not named atoms)**
5. **Document the tree before writing code**

## Code Examples

### Process Communication Patterns

```elixir
# Synchronous call (blocks until reply)
count = GenServer.call(counter, :get_count)

# Asynchronous cast (returns immediately)
GenServer.cast(counter, :increment)

# Direct message sending (use sparingly)
send(pid, {:custom_message, data})

# PubSub broadcast (one-to-many)
Phoenix.PubSub.broadcast(Prismatic.PubSub, "topic", {:event, data})
```

### Handling Timeouts

```elixir
@impl true
def init(opts) do
  # Schedule periodic work
  schedule_tick(opts.interval_ms)
  {:ok, initial_state(opts)}
end

@impl true
def handle_info(:tick, state) do
  new_state = perform_periodic_work(state)
  schedule_tick(state.interval_ms)
  {:noreply, new_state}
end

defp schedule_tick(interval_ms) do
  Process.send_after(self(), :tick, interval_ms)
end
```

### Graceful Shutdown

```elixir
@impl true
def terminate(reason, state) do
  Logger.info("#{__MODULE__} shutting down: #{inspect(reason)}")
  persist_state(state)
  :ok
end
```

## Common Pitfalls

**Storing state in module attributes.** Module attributes are compile-time constants. For mutable state, use GenServer. For configuration, use Application environment.

**Using atom names for processes.** Atoms are not garbage collected. Creating atoms dynamically (e.g., from user input) leads to atom table exhaustion. Use `Registry` with `{:via, Registry, ...}` tuples instead.

**Catching all exceptions in GenServer callbacks.** Let processes crash. The supervisor will restart them. Catching exceptions hides bugs and prevents the supervision tree from functioning.

**Blocking in GenServer callbacks.** A GenServer processes one message at a time. Long-running work in `handle_call` blocks all other callers. Delegate heavy work to `Task.async/1` under a `Task.Supervisor`.

**Missing `@impl true` annotations.** Every callback function must have `@impl true`. This is enforced by the compilation check and Credo.

## Exercises

1. **Build a rate limiter.** Implement a GenServer that limits operations to N per minute. The state tracks timestamps of recent operations and rejects new ones when the limit is reached.

2. **Design a supervision tree.** For a hypothetical "email notification system," design the process topology on paper. Identify which supervisor strategy each level needs.

3. **Implement graceful degradation.** Create a GenServer that calls an external service. When the service is unavailable, the GenServer should return cached data and log the degradation.

4. **Test process crashes.** Write a test that starts a supervised GenServer, kills it with `Process.exit/2`, waits briefly, and verifies it was restarted by checking `GenServer.whereis/1`.

## Summary

OTP provides the process model, supervision trees, and communication patterns that make Prismatic reliable. Every stateful component is a GenServer. Every process group has a Supervisor. Every umbrella app is an OTP Application. Process topology is designed before code is written. The meta-rule ensures that Elixir code leverages the BEAM's unique capabilities rather than imitating imperative patterns.

Key takeaways:

- GenServer for stateful processes, Supervisor for fault tolerance
- `:one_for_one` for independent children, `:one_for_all` for interdependent
- Registry for process discovery (not atom names)
- Design the supervision tree before writing implementation code
- Let processes crash -- supervisors handle recovery
- `@impl true` and `@spec` on all callbacks and public functions

## Practical Implementation

### In Prismatic Platform

OTP patterns are the foundation of every application in the platform:

- **prismatic_supervisor** (`apps/prismatic_supervisor/`) -- Compositional supervision framework with `PrismaticSupervisor.DependencyResolver` for dependency-aware startup, `PrismaticSupervisor.DomainSupervisor` for domain-based process grouping, and pluggable backends (`Registry.ETS` for dev, `Registry.Horde` for distributed prod). Contains `PrismaticSupervisor.AutoDiscovery` that scans all umbrella apps and classifies them into domains
- **prismatic_agents** (`apps/prismatic_agents/`) -- Every agent is a GenServer. `PrismaticAgents.Registry` uses the OTP Registry with `{:via, Registry, ...}` tuples. Dynamic agents are managed through `DynamicSupervisor`. Process topology is documented before implementation
- **prismatic_storage_ets** (`apps/prismatic_storage_ets/`) -- ETS adapter demonstrating GenServer-owned ETS tables with proper lifecycle management. Tables are created in `init/1` and destroyed on process termination
- **prismatic_claude** (`apps/prismatic_claude/`) -- `PrismaticClaude.StackConversation` (1,128 lines) is a GenServer with ETS-backed frame storage and disk persistence, demonstrating complex OTP state management with telemetry integration

### Code Examples from the Codebase

PrismaticSupervisor provides dependency-aware startup:

```elixir
# From prismatic_supervisor - dependency-aware startup
PrismaticSupervisor.DependencyResolver.resolve(apps)
# Builds dependency graph, detects cycles, returns startup order

# Domain supervisors group related apps
PrismaticSupervisor.DomainSupervisor.start_domain(:storage, children)
# Uses configurable restart strategies per domain
```

The Stack Conversation GenServer demonstrates advanced OTP patterns:

```elixir
# From prismatic_claude - 1,128-line GenServer
# ETS-backed with disk persistence to .claude/stack-conversation/
# Telemetry events: [:prismatic_claude, :stack_conversation, *]
PrismaticClaude.StackConversation.get_stack()
PrismaticClaude.StackConversation.push(frame)
PrismaticClaude.StackConversation.checkpoint("milestone-1")
```

## See Also

### Related Applications
- **prismatic_supervisor** (`apps/prismatic_supervisor/`) -- Compositional supervision with dependency-aware startup
- [prismatic_agents](@/apps/prismatic-agents.md) -- Agent runtime demonstrating GenServer and Registry patterns
- [prismatic_storage_ets](@/apps/prismatic-storage-ets.md) -- ETS adapter with GenServer lifecycle management
- [prismatic_claude](@/apps/prismatic-claude.md) -- Complex GenServer with ETS backing and telemetry
- [prismatic_core](@/apps/prismatic-core.md) -- Core protocols and shared OTP patterns

### Glossary
- [OTP](@/glossary/otp.md) -- Open Telecom Platform runtime
- [BEAM](@/glossary/beam.md) -- The virtual machine running Elixir/Erlang
- [Supervisor](@/glossary/supervisor.md) -- Process monitoring and restart
- [Supervision Tree](@/glossary/supervision-tree.md) -- Hierarchical process topology
- [Behaviour](@/glossary/behaviour.md) -- Interface definition mechanism (GenServer, Supervisor)
- [Registry (OTP)](@/glossary/registry-otp.md) -- Process discovery infrastructure
- [Application](@/glossary/application.md) -- OTP Application structure
- [Process Isolation](@/glossary/process-isolation.md) -- Independent process execution
- [Task Module](@/glossary/task-module.md) -- Supervised short-lived tasks

### Architecture
- [Supervision Trees](@/architecture/supervision-trees.md) -- Process topology design patterns
- [Umbrella Apps](@/architecture/umbrella-apps.md) -- How OTP Applications compose in the umbrella

### Related Academy Topics
- [Building Your First Agent](@/academy/first-agent.md) -- Apply OTP patterns to build a real agent
- [Multi-Agent Orchestration](@/academy/agent-orchestration.md) -- Coordinate multiple OTP processes
- [Storage Architecture](@/academy/storage-patterns.md) -- OTP patterns in storage implementations
- [Getting Started](@/academy/getting-started.md) -- Platform introduction with OTP foundations

## Next Steps

- [Building Your First Autonomous Agent](@/academy/first-agent.md) -- apply OTP patterns to build a real agent
- [Multi-Agent Orchestration Patterns](@/academy/agent-orchestration.md) -- coordinate multiple OTP processes
- [Storage Architecture & Adapters](@/academy/storage-patterns.md) -- OTP patterns in storage implementations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)