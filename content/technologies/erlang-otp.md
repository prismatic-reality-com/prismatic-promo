+++
title = "Erlang/OTP"
weight = 2
[extra]
category = "language"
description = "Battle-tested runtime system for building fault-tolerant, distributed, and highly concurrent applications"
url = "https://www.erlang.org"
version = "27+"
icon = "erlang"
color = "red"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1052
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ErlangOTP", "Battle-tested", "technologies", "language", "Prismatic Platform", "Erlang", "GenServer", "Supervisor"]
tags = ["technologies", "language", "erlang-otp", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Erlang/OTP - Prismatic Platform"
+++

## Overview

Erlang/OTP (Open Telecom Platform) is the runtime foundation upon which the entire Prismatic Platform operates. Originally developed by Ericsson in 1986 for telecommunications systems, Erlang was designed from the ground up for concurrency, distribution, fault tolerance, and hot code upgrades -- properties that are essential for the Prismatic Platform's 24/7 intelligence operations. While [Elixir](@/technologies/elixir.md) is the language developers write in, it is Erlang/OTP that provides the battle-tested runtime guarantees that make the platform reliable.

OTP provides a set of libraries, design principles, and behaviours (GenServer, Supervisor, Application) that standardize how concurrent and distributed applications are structured. The Prismatic Platform uses OTP extensively -- every stateful component runs as a supervised process, every agent is a GenServer, and every subsystem is an OTP application with its own supervision tree. OTP's behaviours are not abstract design patterns but concrete, runtime-enforced contracts that ensure consistent process lifecycle management across the entire platform.

The combination of Erlang's preemptive scheduler, lightweight processes, and OTP's supervision strategies enables the platform to run 404+ agents concurrently while maintaining 99.9%+ uptime and automatic recovery from failures. When an agent process crashes, its supervisor restarts it according to a configurable strategy -- one_for_one, one_for_all, or rest_for_one -- without affecting other agents or the platform's overall operation. This "let it crash" philosophy, backed by supervision trees, is fundamentally different from defensive programming approaches and produces simpler, more reliable code.

## Key Features

Erlang/OTP provides a comprehensive runtime system that combines a language-level concurrency model with a standardized framework for building fault-tolerant applications.

- **Lightweight Processes**: Millions of isolated processes with ~2KB memory footprint each, independently scheduled and garbage-collected
- **Preemptive Scheduling**: Fair CPU time allocation across all processes with reduction counting, preventing any process from monopolizing resources
- **OTP Behaviours**: Standardized patterns (GenServer, Supervisor, GenStage, Agent) for common concurrency patterns with compile-time enforcement
- **Hot Code Upgrades**: Update running systems without downtime, enabling zero-downtime deployments for critical services
- **Distribution**: Built-in node clustering with transparent message passing between nodes for horizontal scaling
- **[ETS](@/technologies/ets.md)/DETS**: High-performance in-memory and disk-based term storage built into the runtime
- **Observer**: Built-in runtime introspection and monitoring tools for debugging production systems
- **NIFs and Ports**: Safe integration with native code (C, Rust) through controlled interfaces

| OTP Behaviour | Purpose | Platform Usage |
|--------------|---------|----------------|
| GenServer | Generic server process | Agent state management, service endpoints |
| Supervisor | Process monitoring and restart | Fault tolerance for all subsystems |
| Application | OTP application lifecycle | Each of the 90 umbrella apps |
| GenStage | Producer-consumer pipeline | Intelligence processing pipelines |
| DynamicSupervisor | Runtime process creation | On-demand agent spawning |
| Registry | Process name registration | Agent lookup and discovery |
| Task | Async computation | Parallel data collection |

## Platform Integration

OTP supervision trees form the backbone of every Prismatic application, ensuring fault tolerance and automatic recovery. Each application defines its supervision tree in its `Application` module, specifying which processes to start and how to handle failures.

```elixir
defmodule PrismaticSafety.Application do
  @moduledoc "OTP Application for platform safety and quality monitoring."
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Static children started in order
      PrismaticSafety.QualityFloorGuardian,
      PrismaticSafety.ArchitectureDebtDetector,
      {Registry, keys: :unique, name: PrismaticSafety.Registry},
      # Dynamic supervisor for on-demand processes
      {DynamicSupervisor, name: PrismaticSafety.AgentSupervisor, strategy: :one_for_one}
    ]

    opts = [strategy: :one_for_one, name: PrismaticSafety.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

The GenServer behaviour standardizes stateful process implementation across all platform agents:

```elixir
defmodule PrismaticAgents.SecurityScanner do
  @moduledoc "Security scanning agent using OTP GenServer behaviour."
  use GenServer

  @type state :: %{
    scan_count: non_neg_integer(),
    last_scan: DateTime.t() | nil,
    config: map()
  }

  # Client API
  @spec start_link(map()) :: GenServer.on_start()
  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: __MODULE__)
  end

  @spec scan(String.t()) :: {:ok, map()} | {:error, term()}
  def scan(domain) do
    GenServer.call(__MODULE__, {:scan, domain}, :timer.seconds(30))
  end

  # Server callbacks
  @impl true
  def init(config) do
    {:ok, %{scan_count: 0, last_scan: nil, config: config}}
  end

  @impl true
  def handle_call({:scan, domain}, _from, state) do
    case execute_scan(domain, state.config) do
      {:ok, result} ->
        new_state = %{state | scan_count: state.scan_count + 1, last_scan: DateTime.utc_now()}
        {:reply, {:ok, result}, new_state}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end
end
```

## Architecture

OTP's architecture provides the structural foundation for the Prismatic Platform's process hierarchy. Every platform component fits into a supervision tree that defines failure boundaries and recovery strategies.

| Supervision Level | Strategy | Platform Example |
|------------------|----------|-----------------|
| Platform Root | `rest_for_one` | Top-level application supervisor |
| Application | `one_for_one` | Individual app supervisors (90 total) |
| Domain | `one_for_all` | Tightly coupled service groups |
| Worker | `one_for_one` | Independent agent processes |
| Dynamic | DynamicSupervisor | On-demand agent spawning |

The supervision hierarchy ensures that failures are contained. If a single agent crashes, only that agent restarts. If an entire application subsystem fails, its supervisor restarts the affected processes without impacting other applications. This containment model is essential for a platform running 404+ concurrent agents where individual agent failures are expected and must not cascade.

```
Platform Supervision Tree:

PrismaticSupervisor (rest_for_one)
  |
  +-- PrismaticStorage.Supervisor
  |     +-- Repo (Postgrex connection pool)
  |     +-- ETS Registry
  |
  +-- PrismaticAgents.Supervisor (one_for_one)
  |     +-- AgentRegistry (Registry)
  |     +-- AgentSupervisor (DynamicSupervisor)
  |           +-- Agent 1 (GenServer)
  |           +-- Agent 2 (GenServer)
  |           +-- ... Agent 404+
  |
  +-- PrismaticWeb.Supervisor
        +-- Phoenix Endpoint
        +-- PubSub
```

## Performance Characteristics

Erlang/OTP's runtime characteristics are optimized for the concurrent, I/O-bound workload profile typical of the Prismatic Platform.

| Metric | Value | Notes |
|--------|-------|-------|
| Process spawn time | ~3 microseconds | 300K+ processes/second |
| Message send (local) | ~0.3 microseconds | Between processes on same node |
| Message send (remote) | ~100 microseconds | Between nodes over network |
| Supervisor restart | < 1 millisecond | Immediate child restart on crash |
| Application start | 10-50 milliseconds | Per OTP application |
| Context switch | ~0.1 microseconds | Between BEAM processes |
| Scheduler count | Matches CPU cores | Automatic SMP utilization |
| Process memory | ~2KB initial | Per-process heap, grows as needed |

## Configuration

OTP runtime parameters are configured through `vm.args` for production deployments and through Mix configuration for development.

```elixir
# vm.args - BEAM VM configuration
+P 1000000    # Max processes
+Q 1000000    # Max ports
+S 8:8        # Schedulers
+stbt db      # Scheduler bind type
+sub true     # Scheduler utilization balancing
+Bi           # Break handler ignore
```

```elixir
# config/config.exs - Application configuration
config :prismatic, PrismaticAgents,
  max_agents: 1000,
  supervisor_strategy: :one_for_one,
  agent_restart: :transient,
  shutdown_timeout: 5_000
```

## Best Practices

The Prismatic Platform enforces OTP best practices that leverage Erlang's unique strengths for building reliable systems.

- **Supervise everything** -- every stateful process must live under a supervisor; unsupervised processes are forbidden
- **Use behaviours, not ad-hoc processes** -- GenServer, Supervisor, and other OTP behaviours provide tested, standardized implementations
- **Embrace "let it crash"** -- handle expected errors, let unexpected errors crash the process and be restarted by the supervisor
- **Keep process state minimal** -- processes should hold only the state they need; large datasets belong in [ETS](@/technologies/ets.md) or the database
- **Use `@impl true` for all callbacks** -- compile-time verification that callback implementations match the behaviour specification
- **Name processes via Registry** -- use Registry for dynamic process naming instead of atoms to avoid atom table exhaustion
- **Set explicit timeouts** -- every GenServer.call should specify a timeout to prevent indefinite blocking
- **Document supervision strategies** -- the choice between one_for_one, one_for_all, and rest_for_one must be documented with rationale

## Comparison

Erlang/OTP was chosen as the Prismatic Platform's runtime foundation because no other runtime provides the same combination of fault tolerance, concurrency, and operational maturity.

| Criterion | Erlang/OTP | JVM (Java/Kotlin) | Go | Node.js |
|-----------|-----------|-------------------|-----|---------|
| Years in production | 38+ (since 1986) | 30+ (since 1995) | 15+ (since 2009) | 15+ (since 2009) |
| Concurrency model | Actor (BEAM processes) | Threads + locks | Goroutines + channels | Event loop |
| Fault isolation | Per-process memory | Shared memory | Shared memory | Shared memory |
| Supervision | Built-in (OTP) | External (Akka, etc.) | Manual | Manual (PM2, etc.) |
| Hot code reload | Native | Limited (classloading) | None | None |
| Distribution | Built-in | External (Akka Cluster) | External (gRPC, etc.) | External |
| Uptime record | Nine nines (Ericsson AXD301) | High (varies) | High (varies) | Moderate |

## Related Technologies

- [Elixir](@/technologies/elixir.md) - The modern language running on the Erlang VM with improved developer ergonomics
- [BEAM VM](@/technologies/beam.md) - The virtual machine that Erlang/OTP provides for process execution
- [GenServer](@/technologies/genserver.md) - OTP's generic server behaviour for stateful process implementation
- [Supervisor](@/technologies/supervisor.md) - OTP's supervision behaviour for fault-tolerant process management
- [ETS](@/technologies/ets.md) - Erlang's built-in in-memory term storage for high-speed data access

## Related Apps

- [prismatic_safety](@/apps/prismatic-safety.md) - Platform safety systems built on OTP supervision principles
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent runtime with OTP supervision, GenServer state, and Registry lookup
- [prismatic_claude](@/apps/prismatic-claude.md) - Claude integration using GenServer state management and circuit breakers
- [prismatic_web](@/apps/prismatic-web.md) - Phoenix web server built on OTP application structure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)