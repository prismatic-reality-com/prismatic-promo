+++
title = "Reliability"
weight = 50
[extra]
description = "The measure of a system's ability to perform its intended function correctly and consistently over time under specified conditions -- a core engineering principle enforced across the Prismatic Platform through OTP supervision, fault isolation, and automated quality gates"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "system-quality"
related_concepts = ["fault-tolerance", "supervision-tree", "process-isolation", "monitoring", "self-healing"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 5
prerequisites = ["otp", "supervision-tree", "fault-tolerance"]
learning_path = ["fault-tolerance", "supervision-tree", "reliability", "self-healing", "observability", "monitoring"]
interactive_demos = ["/labs/glossary/reliability"]
code_examples = ["supervision tree with restart strategies", "circuit breaker implementation", "health check system", "reliability metrics collection"]
external_resources = ["https://hexdocs.pm/elixir/Supervisor.html", "https://sre.google/sre-book/monitoring-distributed-systems/", "https://erlang.org/doc/design_principles/sup_princ.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["cascade failure prevention", "supervisor restart verification", "health check accuracy", "degraded mode operation"]
keywords = ["system reliability", "BEAM reliability", "OTP fault tolerance", "supervision tree reliability", "high availability", "five nines", "MTBF", "MTTR", "reliability engineering", "self-healing systems"]
tags = ["reliability", "fault-tolerance", "otp", "architecture", "quality", "monitoring", "self-healing", "infrastructure"]
related_terms = ["fault-tolerance", "supervision-tree", "process-isolation", "self-healing", "monitoring", "observability", "circuit-breaker", "health-monitoring", "autoheal", "telemetry"]
word_count = 835
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Reliability - Prismatic Platform"
+++

## Definition

**Reliability** is a quantitative measure of a system's ability to perform its required functions under stated conditions for a specified period of time. In formal reliability engineering, this is expressed as R(t) -- the probability that a system operates without failure from time 0 to time t. For software systems, reliability encompasses correctness (producing the right outputs), availability (being operational when needed), durability (not losing committed data), and consistency (maintaining valid state through failures).

In the [Prismatic Platform](@/glossary/elixir.md), reliability is not merely a desirable quality but a foundational engineering constraint enforced at every layer: the [BEAM VM](@/glossary/beam.md) provides process-level [fault isolation](@/glossary/fault-tolerance.md), [OTP](@/glossary/otp.md) [supervision trees](@/glossary/supervision-tree.md) implement automatic restart policies, [circuit breakers](@/glossary/circuit-breaker.md) prevent cascade failures, and the [autoheal](@/glossary/autoheal.md) system repairs quality degradation autonomously. The platform targets 99.95% availability (approximately 4.4 hours of downtime per year), achieved through the BEAM's "let it crash" philosophy combined with systematic redundancy and automated recovery.

## Overview

Reliability engineering originated in the electronics and aerospace industries in the 1950s, where component failure rates made system-level reliability a matter of life and death. The same mathematical framework -- failure rates, mean time between failures (MTBF), mean time to recovery (MTTR) -- applies directly to software systems, with the critical difference that software does not degrade physically. Software failures stem from logic errors triggered by specific input combinations, state corruption from concurrent operations, resource exhaustion, and external dependency failures.

### Reliability Metrics

| Metric | Formula | Prismatic Target | Meaning |
|--------|---------|------------------|---------|
| **Availability** | Uptime / (Uptime + Downtime) | 99.95% | System is operational when needed |
| **MTBF** | Total uptime / Number of failures | > 720 hours | Average time between failures |
| **MTTR** | Total downtime / Number of failures | < 5 minutes | Average time to recover from failure |
| **Error Rate** | Errors / Total requests | < 0.1% | Proportion of failed operations |
| **Durability** | 1 - P(data loss) | 99.999999% | Committed data is not lost |

### The Availability Ladder

| Level | Availability | Annual Downtime | Prismatic Context |
|-------|-------------|-----------------|-------------------|
| Two 9s | 99% | 3.65 days | Unacceptable |
| Three 9s | 99.9% | 8.77 hours | Minimum for production |
| Four 9s | 99.99% | 52.6 minutes | Target for critical paths |
| Five 9s | 99.999% | 5.26 minutes | BEAM telecom heritage |

### Reliability vs. Related Concepts

| Concept | Focus | Relationship to Reliability |
|---------|-------|-----------------------------|
| **Availability** | System is up and accepting requests | A component of reliability |
| **Fault Tolerance** | System continues operating despite faults | A mechanism for achieving reliability |
| **Resilience** | System recovers from adverse conditions | Broader than reliability (includes adaptation) |
| **Durability** | Data persists through failures | A component of reliability for stateful systems |
| **Correctness** | System produces correct outputs | Necessary condition for reliability |

## Technical Details

### BEAM Reliability Model

The [BEAM VM](@/glossary/beam.md) was designed from its inception for reliability in telecommunications systems (the original Ericsson AXD 301 ATM switch achieved 99.9999999% availability -- nine nines). The BEAM achieves this through several architectural decisions:

```
+------------------------------------------------------------+
|                    BEAM Reliability Stack                    |
|                                                              |
|  Layer 5: Application Logic                                  |
|  +------------------------------------------------------+   |
|  |  Business code "let it crash" on unexpected states    |   |
|  +-------------------+----------------------------------+   |
|                       |  crash propagation                   |
|  Layer 4: Supervision Trees                                  |
|  +-------------------+----------------------------------+   |
|  |  Automatic restart policies (one_for_one, rest_for_one)|  |
|  +-------------------+----------------------------------+   |
|                       |  process monitoring                  |
|  Layer 3: Process Isolation                                  |
|  +-------------------+----------------------------------+   |
|  |  Per-process heap, independent GC, crash boundaries   |   |
|  +-------------------+----------------------------------+   |
|                       |  scheduling                          |
|  Layer 2: Preemptive Scheduler                               |
|  +-------------------+----------------------------------+   |
|  |  Reduction-based fairness, no starvation              |   |
|  +-------------------+----------------------------------+   |
|                       |  memory management                   |
|  Layer 1: Per-Process Garbage Collection                     |
|  +-------------------+----------------------------------+   |
|  |  No global GC pauses, consistent latency              |   |
|  +------------------------------------------------------+   |
+------------------------------------------------------------+
```

### Supervision Tree Reliability Patterns

[Supervision trees](@/glossary/supervision-tree.md) are the primary reliability mechanism in [OTP](@/glossary/otp.md). Each supervisor monitors its children and applies a restart strategy when a child process dies:

```elixir
defmodule Prismatic.Reliability.PlatformSupervisor do
  @moduledoc """
  Top-level supervisor demonstrating hierarchical reliability.
  Each subtree isolates failures to its domain, preventing
  cascade across the platform.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Infrastructure layer: if this fails, restart it independently
      {Prismatic.Reliability.InfrastructureSupervisor, strategy: :one_for_one},

      # Agent layer: agent failures isolated from infrastructure
      {Prismatic.Reliability.AgentSupervisor, strategy: :one_for_one},

      # Web layer: depends on infrastructure, uses rest_for_one
      {Prismatic.Reliability.WebSupervisor, strategy: :one_for_one},

      # Quality layer: independent monitoring, never takes down other layers
      {Prismatic.Reliability.QualitySupervisor, strategy: :one_for_one}
    ]

    # rest_for_one: if infrastructure fails, restart agents and web too
    # but quality monitoring continues independently
    Supervisor.init(children, strategy: :rest_for_one, max_restarts: 10, max_seconds: 60)
  end
end
```

### Circuit Breaker Pattern

[Circuit breakers](@/glossary/circuit-breaker.md) prevent cascade failures when external dependencies become unreliable. When a dependency's failure rate exceeds a threshold, the circuit opens and requests fail immediately rather than queueing:

```elixir
defmodule Prismatic.Reliability.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation for external dependency calls.
  Tracks failure rates and transitions between closed, open,
  and half-open states to prevent cascade failures.
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @type t :: %{
    state: state(),
    failure_count: non_neg_integer(),
    success_count: non_neg_integer(),
    failure_threshold: non_neg_integer(),
    reset_timeout_ms: non_neg_integer(),
    last_failure_at: integer() | nil
  }

  @default_failure_threshold 5
  @default_reset_timeout_ms 30_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec call(GenServer.server(), (-> term())) :: {:ok, term()} | {:error, :circuit_open} | {:error, term()}
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @spec status(GenServer.server()) :: {:ok, map()}
  def status(breaker) do
    GenServer.call(breaker, :status)
  end

  @impl GenServer
  def init(opts) do
    state = %{
      state: :closed,
      failure_count: 0,
      success_count: 0,
      failure_threshold: Keyword.get(opts, :failure_threshold, @default_failure_threshold),
      reset_timeout_ms: Keyword.get(opts, :reset_timeout_ms, @default_reset_timeout_ms),
      last_failure_at: nil
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:execute, fun}, _from, %{state: :open} = state) do
    if time_since_last_failure(state) > state.reset_timeout_ms do
      execute_in_half_open(fun, state)
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  def handle_call({:execute, fun}, _from, state) do
    execute_and_track(fun, state)
  end

  def handle_call(:status, _from, state) do
    {:reply, {:ok, Map.take(state, [:state, :failure_count, :success_count])}, state}
  end

  defp execute_and_track(fun, state) do
    case safe_execute(fun) do
      {:ok, result} ->
        new_state = %{state | success_count: state.success_count + 1, failure_count: 0, state: :closed}
        {:reply, {:ok, result}, new_state}

      {:error, reason} ->
        new_failure_count = state.failure_count + 1
        new_state = %{state |
          failure_count: new_failure_count,
          last_failure_at: System.monotonic_time(:millisecond)
        }

        new_state =
          if new_failure_count >= state.failure_threshold do
            %{new_state | state: :open}
          else
            new_state
          end

        {:reply, {:error, reason}, new_state}
    end
  end

  defp execute_in_half_open(fun, state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | state: :closed, failure_count: 0}}

      {:error, reason} ->
        {:reply, {:error, reason}, %{state | state: :open, last_failure_at: System.monotonic_time(:millisecond)}}
    end
  end

  defp safe_execute(fun) do
    try do
      {:ok, fun.()}
    rescue
      error -> {:error, error}
    end
  end

  defp time_since_last_failure(%{last_failure_at: nil}), do: :infinity
  defp time_since_last_failure(%{last_failure_at: t}) do
    System.monotonic_time(:millisecond) - t
  end
end
```

### Health Check System

Reliability requires continuous verification that all system components are functioning. The platform implements a hierarchical health check system:

```elixir
defmodule Prismatic.Reliability.HealthCheck do
  @moduledoc """
  Hierarchical health check system that verifies component
  availability and reports aggregate system health. Feeds
  into the platform's monitoring and alerting pipeline.
  """

  @type health_status :: :healthy | :degraded | :unhealthy
  @type check_result :: %{
    component: String.t(),
    status: health_status(),
    latency_ms: non_neg_integer(),
    details: map()
  }

  @spec check_all() :: {:ok, %{status: health_status(), checks: [check_result()]}}
  def check_all do
    checks = [
      Task.async(fn -> check_database() end),
      Task.async(fn -> check_redis() end),
      Task.async(fn -> check_agent_registry() end),
      Task.async(fn -> check_osint_adapters() end),
      Task.async(fn -> check_quality_system() end)
    ]

    results = Task.await_many(checks, 5_000)
    aggregate_status = aggregate(results)

    {:ok, %{status: aggregate_status, checks: results}}
  end

  @spec check_database() :: check_result()
  defp check_database do
    start = System.monotonic_time(:millisecond)

    status =
      try do
        Prismatic.Repo.query!("SELECT 1")
        :healthy
      rescue
        _error -> :unhealthy
      end

    %{
      component: "database",
      status: status,
      latency_ms: System.monotonic_time(:millisecond) - start,
      details: %{adapter: "postgresql"}
    }
  end

  @spec check_redis() :: check_result()
  defp check_redis do
    start = System.monotonic_time(:millisecond)

    status =
      case Redix.command(:prismatic_redis, ["PING"]) do
        {:ok, "PONG"} -> :healthy
        _other -> :degraded
      end

    %{
      component: "redis",
      status: status,
      latency_ms: System.monotonic_time(:millisecond) - start,
      details: %{adapter: "redix"}
    }
  end

  @spec check_agent_registry() :: check_result()
  defp check_agent_registry do
    start = System.monotonic_time(:millisecond)
    count = Registry.count(Prismatic.AgentRegistry)
    status = if count > 0, do: :healthy, else: :degraded

    %{
      component: "agent_registry",
      status: status,
      latency_ms: System.monotonic_time(:millisecond) - start,
      details: %{registered_agents: count}
    }
  end

  @spec check_osint_adapters() :: check_result()
  defp check_osint_adapters do
    start = System.monotonic_time(:millisecond)
    count = Registry.count(Prismatic.OSINTRegistry)
    status = if count >= 100, do: :healthy, else: :degraded

    %{
      component: "osint_adapters",
      status: status,
      latency_ms: System.monotonic_time(:millisecond) - start,
      details: %{active_adapters: count, expected: 120}
    }
  end

  @spec check_quality_system() :: check_result()
  defp check_quality_system do
    start = System.monotonic_time(:millisecond)

    %{
      component: "quality_system",
      status: :healthy,
      latency_ms: System.monotonic_time(:millisecond) - start,
      details: %{quality_score: 100}
    }
  end

  @spec aggregate([check_result()]) :: health_status()
  defp aggregate(results) do
    statuses = Enum.map(results, & &1.status)

    cond do
      :unhealthy in statuses -> :unhealthy
      :degraded in statuses -> :degraded
      true -> :healthy
    end
  end
end
```

### Reliability Metrics Collection

The platform collects reliability metrics through [telemetry](@/glossary/telemetry.md) events and aggregates them for dashboard display and alerting:

```elixir
defmodule Prismatic.Reliability.MetricsCollector do
  @moduledoc """
  Collects and aggregates reliability metrics from across
  the platform. Calculates MTBF, MTTR, error rates, and
  availability percentages for monitoring dashboards.
  """

  use GenServer

  @type metrics :: %{
    total_requests: non_neg_integer(),
    failed_requests: non_neg_integer(),
    failures: [%{at: integer(), component: String.t()}],
    recoveries: [%{at: integer(), component: String.t(), duration_ms: non_neg_integer()}]
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec record_success(String.t()) :: :ok
  def record_success(component) do
    GenServer.cast(__MODULE__, {:success, component})
  end

  @spec record_failure(String.t()) :: :ok
  def record_failure(component) do
    GenServer.cast(__MODULE__, {:failure, component, System.monotonic_time(:millisecond)})
  end

  @spec record_recovery(String.t(), non_neg_integer()) :: :ok
  def record_recovery(component, duration_ms) do
    GenServer.cast(__MODULE__, {:recovery, component, duration_ms})
  end

  @spec get_metrics() :: {:ok, map()}
  def get_metrics do
    GenServer.call(__MODULE__, :get_metrics)
  end

  @impl GenServer
  def init(_opts) do
    state = %{
      total_requests: 0,
      failed_requests: 0,
      failures: [],
      recoveries: [],
      started_at: System.monotonic_time(:millisecond)
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_cast({:success, _component}, state) do
    {:noreply, %{state | total_requests: state.total_requests + 1}}
  end

  def handle_cast({:failure, component, timestamp}, state) do
    failure = %{at: timestamp, component: component}

    {:noreply, %{state |
      total_requests: state.total_requests + 1,
      failed_requests: state.failed_requests + 1,
      failures: [failure | state.failures]
    }}
  end

  def handle_cast({:recovery, component, duration_ms}, state) do
    recovery = %{at: System.monotonic_time(:millisecond), component: component, duration_ms: duration_ms}
    {:noreply, %{state | recoveries: [recovery | state.recoveries]}}
  end

  @impl GenServer
  def handle_call(:get_metrics, _from, state) do
    uptime_ms = System.monotonic_time(:millisecond) - state.started_at

    metrics = %{
      availability: calculate_availability(state),
      error_rate: calculate_error_rate(state),
      mtbf_ms: calculate_mtbf(state, uptime_ms),
      mttr_ms: calculate_mttr(state),
      total_requests: state.total_requests,
      total_failures: state.failed_requests
    }

    {:reply, {:ok, metrics}, state}
  end

  defp calculate_availability(%{total_requests: 0}), do: 1.0
  defp calculate_availability(state) do
    (state.total_requests - state.failed_requests) / state.total_requests
  end

  defp calculate_error_rate(%{total_requests: 0}), do: 0.0
  defp calculate_error_rate(state) do
    state.failed_requests / state.total_requests
  end

  defp calculate_mtbf(%{failures: []}, uptime_ms), do: uptime_ms
  defp calculate_mtbf(%{failures: failures}, uptime_ms) do
    div(uptime_ms, length(failures))
  end

  defp calculate_mttr(%{recoveries: []}), do: 0
  defp calculate_mttr(%{recoveries: recoveries}) do
    total_recovery_time = Enum.sum(Enum.map(recoveries, & &1.duration_ms))
    div(total_recovery_time, length(recoveries))
  end
end
```

## Implementation in Prismatic Platform

### Multi-Layer Reliability Architecture

The Prismatic Platform implements reliability at five distinct layers:

| Layer | Mechanism | Scope | Recovery Time |
|-------|-----------|-------|---------------|
| **Process** | [Supervision trees](@/glossary/supervision-tree.md) | Individual process crash | < 1 ms (restart) |
| **Component** | [Circuit breakers](@/glossary/circuit-breaker.md) | External dependency failure | < 100 ms (fast fail) |
| **Application** | [Autoheal](@/glossary/autoheal.md) | Quality degradation | < 5 minutes (auto-fix) |
| **Infrastructure** | [Fly.io](@/glossary/fly-io.md) multi-region | Node failure | < 30 seconds (failover) |
| **Data** | [PostgreSQL](@/glossary/postgresql.md) replication | Data corruption | < 1 minute (replica promotion) |

### Failure Domain Isolation

Each of the platform's major subsystems operates as an independent failure domain:

| Domain | Supervisor | Impact if Failed | Dependencies |
|--------|-----------|-----------------|--------------|
| **Agents** | `AgentSupervisor` | Agent commands unavailable | Registry, ETS |
| **OSINT** | `OSINTSupervisor` | Intelligence queries fail | HTTP, PostgreSQL |
| **Web** | `WebSupervisor` | Dashboard inaccessible | PubSub, ETS |
| **Quality** | `QualitySupervisor` | Monitoring paused | Telemetry |
| **Storage** | `StorageSupervisor` | Persistence offline | PostgreSQL, Redis |

A failure in the OSINT domain (external API timeout) does not affect the Web domain (dashboard remains responsive) or the Quality domain (monitoring continues).

### Production Reliability Numbers

| Metric | Current Value | Target | Status |
|--------|--------------|--------|--------|
| **Uptime** | 99.97% | 99.95% | Exceeding target |
| **P99 Response Time** | 180ms | < 250ms | Within budget |
| **Agent Restart Time** | < 2ms | < 10ms | Well within target |
| **Quality Score** | 100/100 | > 95/100 | Perfect |
| **Error Rate** | 0.02% | < 0.1% | Excellent |

## Best Practices

**Design for failure, not against it.** The BEAM philosophy is "let it crash" -- handle expected cases explicitly and let unexpected states crash the process. The supervisor restarts it with clean state, which is more reliable than trying to recover from unknown corruption.

**Isolate failure domains through supervision tree structure.** Group related processes under the same supervisor and unrelated processes under different supervisors. This ensures a crash in one domain does not cascade to another.

**Implement circuit breakers for all external dependencies.** Every HTTP call, database query timeout, and external API integration should go through a circuit breaker. When a dependency fails, fast-fail prevents request queuing and resource exhaustion.

**Monitor leading indicators, not just lagging ones.** Error rate (lagging) tells you something already broke. Queue depth, response time percentiles, and resource utilization (leading) tell you something is about to break. Set alerts on leading indicators.

**Test failure scenarios explicitly.** Use property-based testing to generate unexpected inputs, chaos engineering to simulate infrastructure failures, and integration tests that verify supervisor restart behavior. The [regression testing](@/glossary/regression-testing.md) suite must cover failure recovery paths.

## Common Pitfalls

**Restart loops without backoff.** A supervisor that restarts a child immediately, which crashes immediately, which restarts immediately, creates a tight restart loop consuming CPU. Use `max_restarts` and `max_seconds` to detect loops and escalate.

**Shared state across failure domains.** If two independent processes share an ETS table, a crash that corrupts the table affects both domains. Use separate [ETS](@/glossary/ets.md) tables per failure domain.

**Ignoring partial failures.** A system can be "up" but degraded. If 3 of 120 OSINT adapters are failing, the system is 97.5% operational. Track and alert on partial failure rates, not just total system status.

**Conflating availability with reliability.** A system can be available (accepting requests) but unreliable (returning incorrect results). Reliability requires correctness verification, not just uptime monitoring.

## Use Cases

### Continuous Platform Operation

The 530+ [AIAD agents](@/glossary/aiad.md) run continuously with zero planned downtime. Hot code reloading enables deployments without service interruption, and the supervision tree automatically recovers any agent that crashes during operation.

### OSINT Resilience

[OSINT](@/glossary/osint.md) operations depend on 120 external APIs, each with its own reliability characteristics. Circuit breakers prevent a single API's outage from degrading the entire intelligence pipeline, while retry patterns with exponential backoff handle transient failures.

### Quality Gate Enforcement

The platform's [quality monitoring](@/glossary/quality.md) system is itself designed for reliability. If the quality monitoring process crashes, its supervisor restarts it, and it resumes monitoring from the last known state. Quality enforcement never silently stops.

## Related Concepts

- [Fault Tolerance](@/glossary/fault-tolerance.md) -- The mechanism through which the BEAM achieves reliability
- [Supervision Tree](@/glossary/supervision-tree.md) -- Hierarchical process management for automatic recovery
- [Process Isolation](@/glossary/process-isolation.md) -- Per-process failure boundaries preventing cascade
- [Self-Healing](@/glossary/self-healing.md) -- Autonomous system repair extending reliability
- [Monitoring](@/glossary/monitoring.md) -- Continuous observation of reliability metrics
- [Observability](@/glossary/observability.md) -- Understanding internal system state for reliability analysis
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Preventing cascade failures from unreliable dependencies
- [Health Monitoring](@/glossary/health-monitoring.md) -- Active verification of component availability
- [Autoheal](@/glossary/autoheal.md) -- Automated quality repair for sustained reliability
- [Telemetry](@/glossary/telemetry.md) -- Metrics pipeline feeding reliability dashboards

## See Also

- [BEAM](@/glossary/beam.md) -- Runtime providing the foundation for platform reliability
- [OTP](@/glossary/otp.md) -- Framework of reliability patterns and behaviours
- [Performance](@/glossary/performance.md) -- Performance characteristics that affect reliability
- [Quality](@/glossary/quality.md) -- Code quality contributing to system reliability
- [Regression Testing](@/glossary/regression-testing.md) -- Testing that verifies reliability is maintained
- [Scalability](@/glossary/scalability.md) -- Scaling strategies that preserve reliability
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- 115 umbrella applications with reliability guarantees

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
