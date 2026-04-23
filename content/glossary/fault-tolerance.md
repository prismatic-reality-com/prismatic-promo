+++
title = "Fault Tolerance"
weight = 15
[extra]
category = "architecture"
description = "System design property ensuring continued correct operation despite individual component failures through process isolation, supervision trees, and automated recovery"
related_app = "prismatic_supervisor"
platform_layer = "infrastructure"
difficulty = "intermediate"
domain = "reliability-engineering"
stability = "stable"
since_version = "0.1.0"
elixir_module = "PrismaticSupervisor"
otp_compliant = true
beam_feature = true
tags = ["resilience", "supervision", "crash-recovery", "let-it-crash", "process-isolation", "circuit-breaker", "graceful-degradation", "self-healing", "OTP", "BEAM"]
related_terms = ["let-it-crash", "supervisor", "circuit-breaker", "otp", "self-healing", "process-isolation", "beam", "backpressure", "chaos-engineering", "observability", "distributed-system", "message-passing"]
date_created = "2025-06-10"
date_updated = "2026-02-22"
use_cases = ["OSINT pipeline resilience", "agent crash recovery", "external API failure handling", "storage failover", "distributed cluster healing"]
compliance_frameworks = ["NIS2", "DORA"]
performance_impact = "low"
dependencies = ["beam", "otp", "supervisor"]
erlang_origin = "1986"
uptime_target = "99.9999999%"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1953
date_modified = "2026-02-23"
keywords = ["Fault", "Tolerance", "System", "glossary", "architecture", "Prismatic Platform", "BEAM", "Platform", "Erlang"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Fault Tolerance - Prismatic Platform"
+++

## Definition

Fault tolerance is a system design property ensuring continued correct operation even when individual components fail. Rather than attempting to prevent all failures -- an approach that produces brittle, over-engineered systems -- fault-tolerant systems accept that failures are inevitable and design for rapid detection, isolation, and recovery. The goal is not a system that never fails, but a system that fails gracefully: degrading non-critical functionality while maintaining core operations, recovering automatically from transient failures, and escalating persistent failures to human operators with full diagnostic context.

This philosophy is deeply embedded in the Erlang/OTP ecosystem and, by extension, in the [BEAM](@/glossary/beam.md) virtual machine that powers Elixir. Joe Armstrong, Erlang's creator, designed the language specifically for telecommunications systems that required 99.9999999% uptime (nine nines, or approximately 31 milliseconds of downtime per year). The fault tolerance techniques that emerged from this requirement -- process isolation, supervision trees, and the let-it-crash philosophy -- remain the most battle-tested approach to building resilient distributed systems.

The Prismatic Platform inherits these guarantees from the BEAM VM and extends them through application-level systems: the SEADF [self-healing](@/glossary/self-healing.md) framework, the Quality Floor Guardian, and the [circuit breaker](@/glossary/circuit-breaker.md) patterns that protect external dependency boundaries. The result is a platform that can sustain individual process crashes, external service outages, and even partial infrastructure failures while maintaining its core intelligence-gathering and analysis operations.

## Historical Context

The study of fault tolerance predates computer science itself, with roots in redundancy engineering for mechanical and electrical systems. In the computing domain, the foundational work emerged from three independent traditions:

**Telecommunications (1960s-1980s)**: Ericsson's development of the AXE telephone switch required systems that could handle millions of calls without downtime. This need directly motivated the creation of Erlang (1986) and the Open Telecom Platform (OTP), which codified fault tolerance patterns into a reusable framework. The Ericsson AXD301 ATM switch, written in Erlang, achieved 99.9999999% uptime in production -- a record that has rarely been matched by any software system.

**Aerospace and Defense (1960s-1970s)**: NASA's Apollo Guidance Computer and later Space Shuttle systems pioneered hardware-level fault tolerance through triple modular redundancy (TMR), where three independent systems vote on correct output. These patterns influenced software fault tolerance through concepts like N-version programming and recovery blocks.

**Database Systems (1970s-1980s)**: Jim Gray's work on transaction processing at Tandem Computers established the concepts of process pairs, checkpointing, and transaction-based recovery that underpin modern database fault tolerance. Gray's 1985 paper "Why Do Computers Stop and What Can Be Done About It?" remains one of the most cited works in reliability engineering.

The BEAM virtual machine synthesizes lessons from all three traditions: process isolation from telecommunications, redundancy from aerospace, and state recovery from database systems.

## The Erlang/OTP Approach

Erlang's approach to fault tolerance is philosophically distinct from the dominant paradigm in software engineering. Most languages and frameworks treat errors as problems to be prevented through defensive programming -- null checks, exception handling, input validation, and defensive copies. Erlang treats errors as facts of life to be managed through structural isolation and automated recovery.

The difference is analogous to two approaches to building earthquake-resistant structures. The defensive approach tries to build a structure so rigid that it cannot be damaged -- but when a sufficiently strong earthquake arrives, the rigid structure shatters catastrophically. The OTP approach builds a structure that flexes: individual components may fail, but the overall structure absorbs the shock and replaces damaged components automatically.

Three principles underpin Erlang's approach:

1. **Processes are cheap and isolated**: Creating a process costs approximately 2-3 microseconds and 2KB of memory. Processes share no memory. A crash in one process cannot corrupt another process's state.

2. **Supervisors replace failed processes**: When a process crashes, its [supervisor](@/glossary/supervisor.md) detects the failure (via linked exit signals) and starts a replacement process with clean initial state. This happens automatically, without application code intervention.

3. **Failure is information**: A crashed process generates diagnostic data (the crash reason, the state at crash time, the stack trace) that supervisors and logging systems capture. Failure is not hidden or suppressed -- it is surfaced, recorded, and used to improve the system.

## Process Isolation

[Process isolation](@/glossary/process-isolation.md) is the foundation upon which all other fault tolerance mechanisms are built. In the BEAM VM, every process has its own heap, its own stack, and its own garbage collector. There is no shared mutable state between processes. Communication occurs exclusively through [message passing](@/glossary/message-passing.md), which copies data between process heaps.

This isolation provides several guarantees critical to fault tolerance:

| Guarantee | Mechanism | Fault Tolerance Impact |
|-----------|-----------|----------------------|
| **Memory safety** | Per-process heaps, no shared pointers | A buffer overflow in one process cannot corrupt another |
| **Crash containment** | Isolated execution contexts | A crash terminates only the affected process |
| **Independent GC** | Per-process garbage collection | GC pauses affect only the pausing process, not the system |
| **Fair scheduling** | Preemptive scheduling with reduction counting | A busy or stuck process cannot starve others |

The practical consequence is that a Prismatic Platform agent that encounters corrupted data, an unexpected input format, or a programming error will crash in isolation. The agent's supervisor detects the crash, logs the diagnostic information, and starts a fresh agent process -- all within milliseconds. Other agents, the web interface, the API layer, and the storage system continue operating without interruption.

```elixir
defmodule PrismaticAgents.IsolationDemo do
  @moduledoc """
  Demonstrates process isolation in fault tolerance.

  Each agent runs in its own process. A crash in one agent
  cannot affect any other agent, the web layer, or storage.
  The supervisor automatically restarts crashed agents with
  clean initial state.
  """

  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    GenServer.start_link(__MODULE__, opts, name: via_tuple(agent_id))
  end

  @impl GenServer
  def init(opts) do
    state = %{
      agent_id: Keyword.fetch!(opts, :agent_id),
      started_at: DateTime.utc_now(),
      crash_count: 0
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:process, data}, _from, state) do
    case validate_and_process(data) do
      {:ok, result} ->
        {:reply, {:ok, result}, state}

      {:error, :invalid_data} ->
        {:reply, {:error, :invalid_data}, state}

      # Unexpected errors crash the process.
      # Supervisor restarts with clean state.
      # No catch-all needed.
    end
  end

  defp via_tuple(agent_id) do
    {:via, Registry, {PrismaticAgents.Registry, agent_id}}
  end

  defp validate_and_process(data) do
    # Business logic here -- handles expected cases.
    # Unexpected cases crash, supervisor recovers.
    {:ok, data}
  end
end
```

## Supervision Trees

[Supervisor](@/glossary/supervisor.md) trees are the organizational structure that makes process isolation useful for fault tolerance. Without supervisors, a crashed process would simply disappear, leaving a gap in the system. Supervisors ensure that crashed processes are replaced, that dependent processes are restarted in the correct order, and that persistent failures are escalated.

### Supervision Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **:one_for_one** | Only the crashed child is restarted | Independent children (agent pool) |
| **:one_for_all** | All children restarted on any crash | Tightly coupled children (shared state) |
| **:rest_for_one** | Crashed child and all children started after it are restarted | Sequential dependencies (pipeline stages) |

The supervision tree in the Prismatic Platform mirrors the platform's domain structure:

```
PrismaticSupervisor (one_for_one)
|
+-- StorageDomainSupervisor (rest_for_one)
|   +-- PrismaticStorageCore
|   +-- PrismaticStorageETS
|   +-- PrismaticStorageEcto
|   +-- PrismaticStorageMeilisearch
|
+-- WebDomainSupervisor (one_for_one)
|   +-- PrismaticWeb.Endpoint
|   +-- PrismaticApi.Endpoint
|
+-- AgentDomainSupervisor (one_for_one)
|   +-- AgentRegistry
|   +-- AgentPoolSupervisor (one_for_one)
|       +-- Agent_1 ... Agent_N
|
+-- IntelligenceDomainSupervisor (rest_for_one)
    +-- PipelineRegistry
    +-- PipelineWorkerPool
    +-- ResultAggregator
```

Each domain supervisor isolates its domain's failures. A crash in the storage layer does not restart web processes. A crash in the agent pool does not affect the intelligence pipeline. Within each domain, the chosen strategy reflects the dependency relationships between components.

### Restart Intensity

Supervisors also implement restart intensity limits to prevent infinite crash loops. If a child process crashes more than `max_restarts` times within `max_seconds`, the supervisor itself terminates, escalating the failure to its parent supervisor:

```elixir
defmodule PrismaticAgents.PoolSupervisor do
  @moduledoc """
  Supervises the agent worker pool with restart intensity
  limits to prevent infinite crash loops.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticAgents.WorkerPool, pool_size: 10},
      {PrismaticAgents.Registry, []},
      {PrismaticAgents.Metrics, []}
    ]

    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 5,
      max_seconds: 60
    )
  end
end
```

## Circuit Breakers

[Circuit breakers](@/glossary/circuit-breaker.md) complement supervision trees by handling a class of failures that supervisors alone cannot address: slow external dependencies. A supervisor excels at handling fast failures (process crashes), but it cannot help when an external API is responding slowly, consuming the calling process's time and resources without actually crashing.

Circuit breakers address this by monitoring failure rates and temporarily stopping requests to degraded dependencies. The pattern operates as a state machine:

- **Closed**: Normal operation. Requests pass through. Failures are counted.
- **Open**: Failure threshold exceeded. Requests immediately fail without attempting the external call. A timer starts for recovery probing.
- **Half-Open**: Timer expired. A limited number of test requests are allowed through. Success closes the circuit; failure re-opens it.

```elixir
defmodule PrismaticPerimeter.CircuitBreaker do
  @moduledoc """
  Circuit breaker protecting external API boundaries.

  Monitors failure rates for external dependencies and
  temporarily stops requests when failure thresholds are
  exceeded, preventing cascading failures.
  """

  use GenServer

  @type state :: :closed | :open | :half_open

  @failure_threshold 5
  @reset_timeout :timer.seconds(30)
  @half_open_max_requests 3

  @spec call(GenServer.server(), (-> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, term()}
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @impl GenServer
  def handle_call({:execute, fun}, _from, %{state: :closed} = state) do
    case fun.() do
      {:ok, result} ->
        {:reply, {:ok, result}, reset_failures(state)}

      {:error, reason} ->
        new_state = record_failure(state)
        if new_state.failure_count >= @failure_threshold do
          {:reply, {:error, reason}, trip_breaker(new_state)}
        else
          {:reply, {:error, reason}, new_state}
        end
    end
  end

  def handle_call({:execute, _fun}, _from, %{state: :open} = state) do
    {:reply, {:error, :circuit_open}, state}
  end

  def handle_call({:execute, fun}, _from, %{state: :half_open} = state) do
    case fun.() do
      {:ok, result} ->
        {:reply, {:ok, result}, close_breaker(state)}

      {:error, reason} ->
        {:reply, {:error, reason}, trip_breaker(state)}
    end
  end

  defp trip_breaker(state) do
    Process.send_after(self(), :attempt_reset, @reset_timeout)
    %{state | state: :open, failure_count: 0}
  end

  defp close_breaker(state), do: %{state | state: :closed, failure_count: 0}
  defp reset_failures(state), do: %{state | failure_count: 0}
  defp record_failure(state), do: %{state | failure_count: state.failure_count + 1}
end
```

In the Prismatic Platform, circuit breakers protect every external dependency boundary: database connections, API calls to [Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), [GreyNoise](@/glossary/greynoise.md), LLM provider calls to [Ollama](@/glossary/ollama.md), and inter-service communication.

## Graceful Degradation

Fault tolerance does not mean that all functionality is maintained during failures. It means that the system degrades gracefully: losing non-critical functionality while preserving core operations. The Prismatic Platform implements graceful degradation through a tiered service model:

| Service Tier | During Partial Failure | Example |
|-------------|----------------------|---------|
| **Critical** | Always maintained | Core epistemic pipeline, belief graph integrity |
| **Important** | Maintained with reduced performance | Agent execution, OSINT scanning |
| **Standard** | May queue or delay | Report generation, promo site building |
| **Optional** | May be temporarily disabled | Metrics dashboards, non-critical notifications |

The key design principle is **explicit degradation**: the system knows which services are critical and which are optional, and it makes deliberate choices about what to sacrifice. This is superior to the common pattern of implicit degradation, where random components fail unpredictably based on which resource is exhausted first.

```elixir
defmodule PrismaticPlatform.ServiceTier do
  @moduledoc """
  Defines service tiers for graceful degradation.

  During partial failures, the platform sheds load by
  disabling lower-tier services first, preserving critical
  operations at the expense of optional functionality.
  """

  @type tier :: :critical | :important | :standard | :optional

  @spec should_execute?(tier(), map()) :: boolean()
  def should_execute?(tier, system_health) do
    case {tier, system_health.status} do
      {:critical, _} -> true
      {:important, :healthy} -> true
      {:important, :degraded} -> true
      {:important, :critical} -> system_health.cpu_usage < 0.90
      {:standard, :healthy} -> true
      {:standard, :degraded} -> system_health.queue_depth < 1000
      {:standard, :critical} -> false
      {:optional, :healthy} -> true
      {:optional, _} -> false
    end
  end
end
```

## Self-Healing Systems

The Prismatic Platform extends OTP's fault tolerance with application-level [self-healing](@/glossary/self-healing.md) systems that go beyond process restart to actively diagnose and remediate system-level issues:

| System | Purpose | Recovery Scope |
|--------|---------|---------------|
| **SEADF Quality Guardian** | Monitors quality metrics, triggers auto-evolution | Code quality regression |
| **Quality Floor Guardian** | Prevents quality score degradation below threshold | Quality gate enforcement |
| **Predictive Pre-Commit** | Blocks potentially harmful changes before commit | Regression prevention |
| **Autoheal Cycle** | Systematic diagnosis and automated remediation | Cross-domain healing |

These systems operate as higher-order fault tolerance: rather than just restarting crashed processes, they detect degradation trends, diagnose root causes, and apply corrective actions proactively.

## Comparison with Traditional Error Handling

The fault tolerance approach used in Prismatic (and OTP systems generally) differs fundamentally from the exception-handling paradigm dominant in languages like Java, Python, and JavaScript.

| Dimension | Traditional Exception Handling | OTP Fault Tolerance |
|-----------|-------------------------------|---------------------|
| **Philosophy** | Prevent crashes at all costs | Accept crashes, automate recovery |
| **Error location** | Inline with business logic | Separated into supervisor hierarchy |
| **State after error** | Uncertain (partially modified state) | Clean (fresh process with initial state) |
| **Recovery responsibility** | The function that caught the error | The supervisor that monitors the process |
| **Failure scope** | Entire thread/request may be compromised | Only the specific process is affected |
| **Cognitive burden** | Developer must anticipate every error | Developer handles expected cases; supervisor handles the rest |

The traditional approach produces code cluttered with try/catch blocks, null checks, and defensive validation. The OTP approach produces clean business logic focused on the happy path, with recovery logic centralized in the supervision tree. The result is code that is both more readable and more resilient.

```elixir
# OTP approach: handle expected cases, let supervisor handle the rest
defmodule PrismaticOSINT.Scanner do
  @moduledoc """
  OSINT scanner demonstrating OTP fault tolerance patterns.

  Handles expected error cases explicitly. Unexpected errors
  crash the process, which the supervisor restarts with clean
  state. No catch-all needed. No silent error swallowing.
  """

  use GenServer

  @impl GenServer
  def handle_call({:scan, target}, _from, state) do
    case PrismaticOSINT.API.query(target) do
      {:ok, results} ->
        {:reply, {:ok, process_results(results)}, state}

      {:error, :rate_limited} ->
        {:reply, {:error, :retry_later}, state}

      {:error, :invalid_target} ->
        {:reply, {:error, :invalid_target}, state}

      # Unexpected errors? Process crashes. Supervisor restarts.
      # No catch-all needed. No silent error swallowing.
    end
  end
end
```

## BEAM VM Guarantees

The [BEAM](@/glossary/beam.md) virtual machine provides several guarantees that make OTP-style fault tolerance possible. These are not library features that can be replicated in other runtimes -- they are properties of the virtual machine itself:

| Guarantee | Description | Impact on Fault Tolerance |
|-----------|-------------|--------------------------|
| **Preemptive scheduling** | No process can monopolize the CPU | Infinite loops and runaway computations are contained |
| **Per-process GC** | Garbage collection pauses affect only one process | No system-wide GC pauses (unlike JVM stop-the-world) |
| **Soft real-time** | Scheduling guarantees bounded latency | System remains responsive even under load |
| **Hot code reload** | Code can be updated without stopping the system | Bug fixes can be deployed without downtime |
| **Distribution** | Transparent communication across nodes | Fault tolerance extends across physical machines |
| **Binary heap** | Large binaries stored in shared heap, reference-counted | Efficient message passing without full-copy overhead |

These guarantees mean that the Prismatic Platform's fault tolerance is not aspirational -- it is architectural. The platform inherits industrial-grade resilience from the BEAM VM and extends it through application-level self-healing systems.

## Fault Tolerance in Distributed Systems

Fault tolerance becomes significantly more challenging in [distributed systems](@/glossary/distributed-system.md) where network partitions, clock skew, and partial failures are additional failure modes. The BEAM VM's distribution protocol handles many of these challenges transparently:

```elixir
defmodule PrismaticCluster.NodeMonitor do
  @moduledoc """
  Monitors cluster node health and triggers recovery
  procedures when nodes become unreachable.
  """

  use GenServer

  @impl GenServer
  def init(_opts) do
    :net_kernel.monitor_nodes(true)
    {:ok, %{nodes: Node.list(), failed_nodes: []}}
  end

  @impl GenServer
  def handle_info({:nodedown, node}, state) do
    Logger.warning("Node #{node} went down, initiating recovery")
    new_state = %{state |
      nodes: List.delete(state.nodes, node),
      failed_nodes: [node | state.failed_nodes]
    }
    trigger_failover(node, new_state)
    {:noreply, new_state}
  end

  @impl GenServer
  def handle_info({:nodeup, node}, state) do
    Logger.info("Node #{node} recovered, reintegrating")
    new_state = %{state |
      nodes: [node | state.nodes],
      failed_nodes: List.delete(state.failed_nodes, node)
    }
    trigger_reintegration(node, new_state)
    {:noreply, new_state}
  end

  defp trigger_failover(node, state) do
    # Redistribute work from failed node to surviving nodes
    PrismaticCluster.WorkDistributor.redistribute(node, state.nodes)
  end

  defp trigger_reintegration(node, _state) do
    # Sync state and resume work assignment to recovered node
    PrismaticCluster.StateSynchronizer.sync(node)
  end
end
```

## Measuring Fault Tolerance

Fault tolerance is not a binary property -- it exists on a spectrum. The Prismatic Platform measures its fault tolerance through several metrics:

| Metric | Definition | Target |
|--------|-----------|--------|
| **MTBF** | Mean Time Between Failures | >720 hours |
| **MTTR** | Mean Time To Recovery | <100ms (process restart) |
| **Availability** | Uptime percentage | 99.99% (52 min/year downtime) |
| **Blast radius** | Percentage of system affected by a single failure | <1% |
| **Recovery completeness** | Percentage of failures recovered automatically | >99% |
| **Degradation granularity** | Number of independent failure domains | 115 (one per umbrella app) |

## Related Terms

- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy enabling fault tolerance through supervised failure
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior implementing automatic recovery
- [Process Isolation](@/glossary/process-isolation.md) -- Memory isolation preventing cross-process corruption
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern preventing cascading failures across boundaries
- [Self-Healing](@/glossary/self-healing.md) -- Platform-level automated recovery building on OTP foundations
- [BEAM](@/glossary/beam.md) -- Virtual machine providing fault tolerance guarantees
- [OTP](@/glossary/otp.md) -- Framework providing supervision and fault tolerance infrastructure
- [Backpressure](@/glossary/backpressure.md) -- Flow control preventing resource exhaustion failures
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Testing methodology that validates fault tolerance
- [Observability](@/glossary/observability.md) -- Monitoring enabling failure detection and diagnosis
- [Distributed System](@/glossary/distributed-system.md) -- Systems requiring fault tolerance across network boundaries
- [Message Passing](@/glossary/message-passing.md) -- Communication mechanism preserving process isolation

## See Also

- [Architecture](@/architecture/_index.md) -- Platform resilience architecture
- [Technologies](@/technologies/_index.md) -- BEAM VM and OTP technology details
- [Capabilities](@/capabilities/_index.md) -- Platform fault tolerance capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
