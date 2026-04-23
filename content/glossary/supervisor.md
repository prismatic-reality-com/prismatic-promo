+++
title = "Supervisor"
weight = 15
[extra]
category = "otp"
description = "OTP behavior that monitors and automatically restarts child processes according to configurable restart strategies, forming the backbone of fault-tolerant Elixir systems"
related_terms = ["supervision-tree", "genserver", "dynamic-supervisor", "otp", "umbrella", "fault-tolerance", "let-it-crash", "process-isolation", "self-healing", "beam", "agent"]
keywords = ["OTP Supervisor", "Elixir Supervisor", "fault tolerance OTP", "supervision strategies", "one_for_one strategy", "rest_for_one strategy", "one_for_all strategy", "process restart", "let it crash philosophy", "BEAM fault tolerance"]
tags = ["otp", "supervisor", "fault-tolerance", "elixir"]
difficulty = "intermediate"
audience = ["elixir-developers", "platform-engineers", "distributed-systems-architects"]
domain = "otp"
stability = "stable"
since_version = "1.0.0"
strategies = ["one_for_one", "rest_for_one", "one_for_all"]
default_max_restarts = 3
default_max_seconds = 5
prismatic_max_restarts = 5
prismatic_max_seconds = 30
see_also = ["architecture", "technologies", "capabilities"]
prerequisites = ["elixir", "otp", "genserver", "beam"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1932
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Supervisor - Prismatic Platform"
+++

## Definition and Overview

A Supervisor is an [OTP](/glossary/otp/) behavior responsible for starting, monitoring, and restarting child processes. It implements fault tolerance by defining restart strategies that determine how failures propagate and how recovery occurs. Supervisors form the backbone of the "let it crash" philosophy central to Erlang/[Elixir](/glossary/elixir/) systems: rather than writing defensive error-handling code in every function, developers delegate recovery responsibility to supervisors that observe failures and apply structured recovery strategies.

Supervisors can manage both worker processes ([GenServers](/glossary/genserver/), Tasks, Agents) and other supervisors, creating hierarchical supervision trees of arbitrary depth. This hierarchical composition is what gives OTP systems their characteristic resilience -- failures are contained at the lowest possible level, with escalation occurring only when local recovery strategies are exhausted. The result is a system that self-heals from the vast majority of failures without human intervention.

The Supervisor behavior is not merely a convenience pattern or a library utility. It is a fundamental building block that makes the [BEAM](/glossary/beam/) virtual machine's fault tolerance guarantees practical. Without supervisors, the [process isolation](/glossary/process-isolation/) that the BEAM provides would be useful for preventing corruption but insufficient for maintaining system availability. Supervisors bridge the gap between isolation (preventing cascading damage) and availability (ensuring crashed components are replaced with fresh instances).

## Historical Context and Motivation

The Supervisor behavior traces its origins to Ericsson's development of the AXD 301 ATM switch in the late 1990s, which achieved the legendary "nine nines" (99.9999999%) uptime using Erlang/OTP. The key insight was that hardware failures, software bugs, and unexpected conditions are inevitable in any sufficiently complex system, and the correct response is not to prevent all failures but to detect and recover from them automatically.

This insight was formalized as the "let it crash" philosophy. In traditional software development, errors are handled at the point of occurrence through try-catch blocks, error codes, and defensive programming. This approach has two fundamental problems: it makes code harder to read (error handling obscures business logic), and it cannot handle truly unexpected failures (you can only catch errors you anticipated). The supervisor model inverts this: processes are allowed to crash on any unexpected error, and supervisors handle recovery.

The analogy often used is that of a factory floor. Rather than training each worker to handle every possible emergency (fire, equipment failure, power outage), you hire a supervisor whose sole job is to detect when a worker stops functioning and replace them. The workers can focus entirely on their task, and the supervisor handles recovery. This separation of concerns is what makes OTP supervision so effective.

## Supervision Strategies

The three core supervision strategies define how a supervisor responds when one of its children fails. Choosing the correct strategy requires understanding the dependency relationships between child processes.

### one_for_one

When a child process terminates abnormally, only that specific child is restarted. Other children are unaffected. This strategy is appropriate when children are independent -- the failure of one has no impact on the correctness of others.

```elixir
defmodule PrismaticWeb.EndpointSupervisor do
  @moduledoc """
  Supervises independent web endpoint components.
  Each child operates independently, so one_for_one ensures
  minimal disruption when any single component fails.
  """
  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticWeb.Telemetry, []},
      {PrismaticWeb.MetricsCollector, []},
      {PrismaticWeb.HealthCheck, []}
    ]

    # Each child is independent -- restart only the failed one
    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

**Use when**: Children do not share state, do not communicate directly, and one child's failure does not invalidate another child's state. Example: a pool of independent HTTP request handlers, a collection of independent telemetry collectors, or the domain supervisors within the [Prismatic Agents](/glossary/prismatic-agents/) runtime.

### rest_for_one

When a child process terminates abnormally, that child and all children started **after** it in the child specification list are restarted. Children started before the failed child are unaffected. This strategy is appropriate when children have ordered dependencies -- later children depend on earlier ones.

```elixir
defmodule PrismaticStorage.PipelineSupervisor do
  @moduledoc """
  Supervises a data pipeline with ordered dependencies.
  The Registry must exist before the Cache can function,
  and the Cache must exist before the Writer can operate.
  """
  use Supervisor

  @impl Supervisor
  def init(_opts) do
    children = [
      # Registry must start first -- others depend on it
      {PrismaticStorage.Registry, []},
      # Cache depends on Registry for adapter lookup
      {PrismaticStorage.Cache, [registry: PrismaticStorage.Registry]},
      # Writer depends on both Registry and Cache
      {PrismaticStorage.Writer, [cache: PrismaticStorage.Cache]}
    ]

    # If Registry crashes: restart Registry, Cache, AND Writer
    # If Cache crashes: restart Cache AND Writer (Registry stays)
    # If Writer crashes: restart Writer only
    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

**Use when**: Children have a linear dependency chain where later children depend on earlier ones. Example: a data pipeline where the registry must exist before the cache, the cache must exist before the writer, or an application startup sequence where configuration must be loaded before services are started.

### one_for_all

When any child process terminates abnormally, all children are terminated and then all are restarted. This strategy is appropriate when children are tightly coupled and maintaining consistency requires that all operate from the same starting state.

```elixir
defmodule PrismaticAgents.ConsensusGroup do
  @moduledoc """
  Supervises a consensus group where all participants must
  agree on shared state. If any participant fails, all must
  restart to re-establish consensus from a clean baseline.
  """
  use Supervisor

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticAgents.ProposalCollector, []},
      {PrismaticAgents.VoteCounter, []},
      {PrismaticAgents.DecisionPublisher, []}
    ]

    # If any participant fails, restart the entire consensus group
    Supervisor.init(children, strategy: :one_for_all)
  end
end
```

**Use when**: Children maintain coordinated state where a partial group is worse than a fully restarted group. Example: a distributed consensus group, a transactional pipeline where partial state is invalid, or a group of processes that share an [ETS](/glossary/ets/) table owned by one of them.

### Strategy Comparison

| Strategy | Restart Scope | Dependency Model | State Impact | Best For |
|----------|--------------|------------------|-------------|----------|
| **one_for_one** | Only failed child | Independent | Minimal | Worker pools, independent services |
| **rest_for_one** | Failed + later children | Linear dependency | Moderate | Ordered pipelines, layered services |
| **one_for_all** | All children | Mutual dependency | Maximum | Consensus groups, coordinated actors |

## Process Topology Design

Designing a supervision tree is one of the most consequential architectural decisions in an OTP application. The tree structure determines failure isolation boundaries, restart scopes, and startup ordering. The Prismatic Platform mandates that process topology is documented before code is written -- this is an enforcement requirement, not a suggestion.

Key design principles for supervision topology:

**Separate concerns vertically**: Each branch of the supervision tree should handle a distinct operational concern. The storage layer, the web layer, the agent layer, and the intelligence layer each have their own top-level supervisor. A failure in storage should not restart web processes.

**Place volatile processes deep**: Processes that crash frequently (external API callers, file system watchers, network monitors) should be deep in the tree with narrow restart scope. Their crashes should not propagate to stable infrastructure processes.

**Place stable processes shallow**: Core infrastructure (registries, ETS table owners, configuration servers) should be near the top of the tree. They rarely crash, and when they do, dependent processes should restart to pick up the new state.

**Minimize restart blast radius**: Each supervisor's child list should contain the minimum set of processes that must restart together. If only two of five processes are coupled, put those two under a sub-supervisor with `one_for_all` and the remaining three under a separate supervisor with `one_for_one`.

**Document the tree before coding**: The supervision tree should be designed on paper (or in CLAUDE.md) before any code is written. This forces explicit thinking about process dependencies and failure modes.

## Max Restarts and Escalation

Every supervisor is configured with `max_restarts` and `max_seconds` parameters that define an intensity threshold. If a child crashes more than `max_restarts` times within `max_seconds` seconds, the supervisor itself terminates. This propagates the failure upward to the supervisor's own supervisor, creating an escalation chain.

| Configuration | OTP Default | Prismatic Default | Purpose |
|--------------|---------|-------------------|---------|
| `max_restarts` | 3 | 5 | Maximum crashes before escalation |
| `max_seconds` | 5 | 30 | Time window for counting crashes |

```elixir
defmodule PrismaticPerimeter.Scanner.Supervisor do
  @moduledoc """
  Supervises scanner processes with tuned restart intensity.
  Scanners interact with external services and may experience
  transient failures, so a higher threshold prevents premature
  escalation while still catching persistent failures.
  """
  use Supervisor

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticPerimeter.Scanner.DNS, []},
      {PrismaticPerimeter.Scanner.TLS, []},
      {PrismaticPerimeter.Scanner.Port, []}
    ]

    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 10,
      max_seconds: 60
    )
  end
end
```

The escalation mechanism ensures that persistently failing processes do not consume resources indefinitely through rapid restart loops. Instead, the failure escalates to a higher-level supervisor that can apply a broader recovery strategy -- perhaps restarting an entire subsystem or triggering the platform's [self-healing](/glossary/self-healing/) system.

## PrismaticSupervisor: Compositional Model

The PrismaticSupervisor module extends OTP's standard Supervisor with dependency-aware startup and domain-based process organization. It addresses a limitation of standard supervision: in a large [umbrella application](/glossary/umbrella-application/) with 115+ apps, manually specifying startup ordering and dependency relationships is error-prone and unmaintainable.

PrismaticSupervisor provides:

- **Auto-Discovery**: Scans all umbrella applications, classifies them into domains (storage, web, intelligence, security, etc.), and builds a dependency graph automatically
- **Dependency Resolution**: Topologically sorts applications by their dependencies, ensuring that dependent applications start only after their dependencies are available
- **Domain Supervisors**: Groups related applications under domain-specific supervisors, providing failure isolation at the domain level
- **Health Monitoring**: Integrates with the HealthMonitor to track supervision tree health and trigger self-healing when persistent failures are detected
- **Backend Pluggability**: Supports both ETS (development) and Horde (production cluster) registry backends through a behaviour-based adapter pattern

```elixir
defmodule PrismaticSupervisor do
  @moduledoc """
  Compositional supervisor with dependency-aware startup ordering.
  Auto-discovers umbrella apps, resolves dependencies via topological
  sort, and organizes processes under domain supervisors.
  """
  use Supervisor

  alias PrismaticSupervisor.{AutoDiscovery, DependencyResolver, DomainSupervisor}

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    {:ok, apps} = AutoDiscovery.discover()
    {:ok, ordered} = DependencyResolver.resolve(apps)

    children =
      ordered
      |> DomainSupervisor.group_by_domain()
      |> Enum.map(&DomainSupervisor.child_spec/1)

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

## Dynamic Supervisor

The [Dynamic Supervisor](/glossary/dynamic-supervisor/) variant allows children to be started and stopped at runtime rather than being defined statically in the `init/1` callback. This is essential for use cases where the number and type of child processes is not known at compile time.

In the Prismatic Platform, Dynamic Supervisors manage:

- **Agent pools**: The number of active [agents](/glossary/agent/) varies based on workload and configuration
- **Task execution**: One-off tasks spawned in response to user requests or scheduled events
- **Connection handlers**: WebSocket connections, LiveView sessions, and API request processors
- **Pipeline workers**: Data processing workers that scale with input volume
- **OSINT operations**: Intelligence gathering operations spawned dynamically per target

```elixir
defmodule PrismaticAgents.DynamicPool do
  @moduledoc """
  Dynamic agent pool that starts and stops agent processes
  based on runtime demand. Uses DynamicSupervisor for
  supervised lifecycle management of dynamic agents.
  """

  @spec start_agent(map()) :: {:ok, pid()} | {:error, term()}
  def start_agent(agent_spec) do
    DynamicSupervisor.start_child(
      PrismaticAgents.DynamicSupervisor,
      {PrismaticAgents.AgentProcess, agent_spec}
    )
  end

  @spec stop_agent(pid()) :: :ok | {:error, :not_found}
  def stop_agent(pid) do
    DynamicSupervisor.terminate_child(PrismaticAgents.DynamicSupervisor, pid)
  end

  @spec active_count() :: non_neg_integer()
  def active_count do
    DynamicSupervisor.count_children(PrismaticAgents.DynamicSupervisor)
    |> Map.get(:active, 0)
  end
end
```

## Supervision and the NO MERCY Doctrine

The NO MERCY doctrine mandates specific supervision requirements that go beyond OTP defaults:

| Requirement | Enforcement | Consequence of Violation |
|-------------|-------------|-------------------------|
| Every [GenServer](/glossary/genserver/) MUST have a supervisor | Pre-commit quality gate | L2 BLOCK -- commit rejected |
| Process topology documented before code | Code review requirement | L2 BLOCK -- PR rejected |
| No orphan processes | Runtime monitoring | L1 WARNING -- investigation triggered |
| Supervision strategy justified in comments | Code review requirement | L1 WARNING -- correction requested |
| Restart intensity configured explicitly | Quality gate check | L1 WARNING -- default values flagged |

These requirements ensure that supervision is not an afterthought but a first-class architectural concern. In many Elixir projects, supervision is added after the fact. In Prismatic, the supervision tree is designed first, and the worker processes are implemented to fit within it.

## Child Specification

Every supervised process defines a child specification that tells the supervisor how to start, stop, and restart it:

```elixir
defmodule PrismaticPerimeter.Rating.Engine do
  @moduledoc """
  Security rating calculation engine. Runs as a supervised
  GenServer with explicit child specification for restart
  behavior and shutdown timeout.
  """
  use GenServer

  @spec child_spec(keyword()) :: Supervisor.child_spec()
  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :worker,
      restart: :permanent,
      shutdown: 5_000
    }
  end

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    {:ok, %{cache_ttl: Keyword.get(opts, :cache_ttl, :timer.minutes(5))}}
  end
end
```

The `restart` field controls when the supervisor restarts the child:

| Restart Value | Behavior | Use For |
|--------------|----------|---------|
| `:permanent` | Always restart | Long-running services, GenServers |
| `:transient` | Restart only on abnormal exit | Tasks that should complete |
| `:temporary` | Never restart | Fire-and-forget operations |

## Supervisor Inspection and Debugging

OTP provides built-in tools for inspecting supervision trees at runtime:

```elixir
# List all children of a supervisor
Supervisor.which_children(PrismaticAgents.Supervisor)
# => [{PrismaticAgents.Registry, #PID<0.234.0>, :worker, [PrismaticAgents.Registry]}, ...]

# Count children by type
Supervisor.count_children(PrismaticAgents.Supervisor)
# => %{active: 18, specs: 18, supervisors: 5, workers: 13}

# Get detailed process info
Process.info(pid, [:current_function, :message_queue_len, :memory, :status])

# Observer (GUI tool for supervision tree visualization)
# :observer.start()
```

## Best Practices

**Design the tree before the code.** Draw the supervision tree structure, identifying process dependencies and restart relationships, before writing any implementation code. This prevents retrofitting supervision onto existing code.

**Use the narrowest possible restart strategy.** Default to `one_for_one` unless dependencies require `rest_for_one` or `one_for_all`. Broader strategies restart more processes, increasing recovery time and losing more accumulated state.

**Configure restart intensity deliberately.** Do not rely on OTP defaults. External-facing processes (API callers, network monitors) need higher thresholds than internal processes (registries, caches).

**Keep supervisor modules simple.** A supervisor's `init/1` should only define the child list and strategy. Business logic belongs in the worker processes, not the supervisor.

**Use Dynamic Supervisors for runtime-spawned processes.** Never bypass supervision by spawning processes with bare `spawn/1` or `Task.start/1`. All processes should be supervised.

**Test supervision behavior explicitly.** Write tests that verify supervisor restart behavior by killing child processes and asserting they are restarted correctly.

## Common Pitfalls

**Using one_for_all when one_for_one suffices**: Restarting all children when only one failed wastes resources and loses accumulated state in healthy processes. Use `one_for_all` only when processes are genuinely interdependent.

**Ignoring max_restarts configuration**: Default thresholds may be too low for processes that interact with unreliable external services, or too high for processes that should fail fast. Tune explicitly.

**Orphan processes**: Processes spawned with `spawn/1` or `Task.start/1` are not supervised. When they crash, nobody notices. Always use supervised alternatives.

**Deep nesting without purpose**: Unnecessary supervisor nesting adds latency to startup and recovery without providing additional isolation. Each level of nesting should serve a clear purpose.

**Circular supervisor dependencies**: Supervisor A starts process B, which tries to call process C managed by Supervisor D, which depends on Supervisor A to be running. This creates a deadlock during startup.

## Related Terms

- [Supervision Tree](/glossary/supervision-tree/) -- The hierarchical structure formed by nested supervisors
- [GenServer](/glossary/genserver/) -- The most common type of supervised child process
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Variant allowing runtime child management
- [OTP](/glossary/otp/) -- Framework providing the Supervisor behavior
- [BEAM](/glossary/beam/) -- Virtual machine providing process isolation that supervisors build upon
- [Let It Crash](/glossary/let-it-crash/) -- Philosophy that supervisors make practical
- [Fault Tolerance](/glossary/fault-tolerance/) -- System property that supervisors provide
- [Process Isolation](/glossary/process-isolation/) -- Memory isolation enabling safe supervised restarts
- [Self-Healing](/glossary/self-healing/) -- Platform-level recovery building on supervisor infrastructure
- [Agent](/glossary/agent/) -- Autonomous entities that run as supervised processes
- [Elixir](/glossary/elixir/) -- Programming language providing the Supervisor abstraction
- [Umbrella Application](/glossary/umbrella-application/) -- Project structure where each app has its own supervision tree

## See Also

- [Architecture](/architecture/) -- Platform supervision architecture
- [Technologies](/technologies/) -- OTP and BEAM technology details
- [Capabilities](/capabilities/) -- Platform fault tolerance capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
