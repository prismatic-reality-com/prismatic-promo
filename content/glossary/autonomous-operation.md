+++
title = "Autonomous Operation"
weight = 50
[extra]
description = "Sustained system functioning without human intervention, including self-monitoring, self-healing, and self-optimization capabilities"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "platform-operations"
related_concepts = ["autonomous-agent", "self-healing", "health-monitoring", "autoheal", "fault-tolerance", "supervision-tree", "circuit-breaker"]
implementation_status = "production"
authority_level = "L3-L5 Agent Tiers"
difficulty_rating = 7
prerequisites = ["otp", "supervision-tree", "genserver", "fault-tolerance"]
learning_path = "fundamentals -> otp-patterns -> supervision -> autonomous-operation"
interactive_demos = ["/labs/glossary/autonomous-operation"]
code_examples = ["Elixir supervision tree", "Health monitoring GenServer", "Circuit breaker implementation", "Self-healing pipeline"]
external_resources = ["https://erlang.org/doc/design_principles/des_princ.html", "https://hexdocs.pm/elixir/supervisor-and-application.html"]
version_introduced = "Gen 5"
stability_level = "stable"
testing_scenarios = ["supervisor restart verification", "health check failure recovery", "circuit breaker state transitions", "cascading failure containment"]
keywords = ["autonomous operation", "self-monitoring", "self-healing", "self-optimization", "fault tolerance", "supervision", "zero-downtime", "operational autonomy"]
tags = ["glossary", "operations", "autonomy", "fault-tolerance", "otp", "supervision"]
related_terms = ["autonomous-agent", "self-healing", "health-monitoring", "autoheal", "fault-tolerance", "supervision-tree", "circuit-breaker", "genserver", "otp", "telemetry"]
word_count = 1623
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Autonomous Operation - Prismatic Platform"
+++

## Definition

Autonomous Operation is the sustained ability of a software system to function, monitor itself, recover from failures, and optimize its own performance without requiring human intervention. A system operating autonomously does not merely run unattended -- it actively observes its own health, detects anomalies, diagnoses root causes, applies corrective actions, and reports on its status. The distinction from simple uptime is that autonomous operation implies agency: the system makes active decisions about its own operational state.

In the Prismatic Platform, autonomous operation is built on the foundation of Erlang/OTP's "let it crash" philosophy, extended with application-level health monitoring, circuit breaker patterns, and self-healing pipelines. The platform's 115 umbrella applications, 530+ agents, and numerous background processes operate within a supervision tree hierarchy that automatically restarts failed processes, contains cascading failures, and maintains operational continuity without human operators.

## Overview

Traditional software operations depend on human operators for monitoring, incident response, and recovery. Even with sophisticated alerting systems, the loop is human-mediated: alert fires, human investigates, human decides response, human applies fix. This loop introduces latency (minutes to hours), inconsistency (different operators make different decisions), and availability gaps (humans sleep, take breaks, get distracted).

Autonomous operation eliminates the human from the operational loop for routine scenarios. The system monitors itself through [Telemetry](/glossary/telemetry/) instrumentation, detects anomalies through health checks and drift detection, diagnoses issues through automated root cause analysis, and applies corrections through self-healing pipelines. Humans remain in the loop for novel situations that exceed the system's autonomous capabilities, but the vast majority of operational events are handled without human awareness.

The Prismatic Platform achieves autonomous operation through five interlocking systems:

1. **Supervision Trees** -- OTP-based process hierarchy with automatic restart strategies
2. **Health Monitoring** -- Continuous assessment of component health across multiple dimensions
3. **Circuit Breakers** -- Isolation of failing components to prevent cascade failures
4. **Self-Healing Pipelines** -- Automated detection, diagnosis, and remediation of operational issues
5. **Telemetry Infrastructure** -- Real-time metrics collection, aggregation, and anomaly detection

### The OTP Foundation

Erlang/OTP provides the architectural foundation for autonomous operation through its process model and supervision framework. Every stateful entity in the platform runs as an isolated process. Process failures are contained -- a crashing process cannot corrupt another process's state. Supervisors monitor their child processes and apply configurable restart strategies when failures occur.

This foundation means that the Prismatic Platform has process-level self-healing built into its DNA. Before any application-level autonomous operation was implemented, the platform already recovered automatically from individual process crashes. Application-level autonomous operation builds on this foundation to handle higher-order operational concerns.

## Technical Details

### Supervision Tree Architecture

The platform's supervision tree implements a hierarchical containment strategy:

```elixir
defmodule PrismaticSupervisor do
  @moduledoc """
  Root supervisor implementing domain-based supervision with
  dependency-aware startup ordering and configurable restart
  strategies. Manages 115 umbrella applications across
  organized domain supervisors.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # Core infrastructure (must start first)
      {Prismatic.Storage.Supervisor, strategy: :one_for_one},
      {Prismatic.Telemetry.Supervisor, strategy: :one_for_one},

      # Health monitoring (starts after core infrastructure)
      {Prismatic.Health.Monitor, interval: :timer.seconds(30)},

      # Domain supervisors (dependency-ordered)
      {Prismatic.Quality.Supervisor, strategy: :one_for_one},
      {Prismatic.Agents.Supervisor, strategy: :one_for_one},
      {Prismatic.Evolution.Supervisor, strategy: :rest_for_one},

      # Self-healing (starts last, monitors everything)
      {Prismatic.SelfHealing.Pipeline, strategy: :one_for_one}
    ]

    Supervisor.init(children, strategy: :one_for_one, max_restarts: 10, max_seconds: 60)
  end
end
```

### Restart Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `:one_for_one` | Restart only the failed child | Independent processes (most common) |
| `:one_for_all` | Restart all children when one fails | Tightly coupled processes |
| `:rest_for_one` | Restart the failed child and all started after it | Dependency chains |
| `DynamicSupervisor` | On-demand child management | Agent pools, request handlers |

### Health Monitoring System

The health monitor continuously evaluates component health across multiple dimensions:

```elixir
defmodule Prismatic.Health.Monitor do
  @moduledoc """
  Continuous health monitoring for all platform components.
  Evaluates health across five dimensions: process liveness,
  memory consumption, message queue depth, response latency,
  and error rate. Reports to telemetry and triggers self-healing
  when thresholds are exceeded.
  """

  use GenServer

  @type health_status :: :healthy | :degraded | :unhealthy | :critical
  @type health_report :: %{
    component: atom(),
    status: health_status(),
    dimensions: map(),
    timestamp: DateTime.t(),
    recommendation: atom()
  }

  @health_dimensions [:process_alive, :memory_usage, :message_queue, :response_latency, :error_rate]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    interval = Keyword.get(opts, :interval, :timer.seconds(30))
    GenServer.start_link(__MODULE__, %{interval: interval}, name: __MODULE__)
  end

  @spec check_health(atom()) :: {:ok, health_report()} | {:error, :unknown_component}
  def check_health(component) do
    GenServer.call(__MODULE__, {:check_health, component})
  end

  @spec overall_status() :: {:ok, health_status()}
  def overall_status do
    GenServer.call(__MODULE__, :overall_status)
  end

  @impl true
  def init(%{interval: interval} = state) do
    schedule_check(interval)
    {:ok, Map.put(state, :reports, %{})}
  end

  @impl true
  def handle_info(:scheduled_check, state) do
    reports = evaluate_all_components()

    # Emit telemetry for each component
    Enum.each(reports, fn {component, report} ->
      :telemetry.execute(
        [:prismatic, :health, :check],
        %{status: health_to_integer(report.status)},
        %{component: component}
      )
    end)

    # Trigger self-healing for unhealthy components
    reports
    |> Enum.filter(fn {_, r} -> r.status in [:unhealthy, :critical] end)
    |> Enum.each(fn {component, report} ->
      Prismatic.SelfHealing.Pipeline.trigger(component, report)
    end)

    schedule_check(state.interval)
    {:noreply, %{state | reports: reports}}
  end

  @impl true
  def handle_call({:check_health, component}, _from, state) do
    case Map.get(state.reports, component) do
      nil -> {:reply, {:error, :unknown_component}, state}
      report -> {:reply, {:ok, report}, state}
    end
  end

  @impl true
  def handle_call(:overall_status, _from, state) do
    worst = state.reports
    |> Map.values()
    |> Enum.map(& &1.status)
    |> Enum.min_by(&health_priority/1, fn -> :healthy end)

    {:reply, {:ok, worst}, state}
  end

  @spec evaluate_all_components() :: %{atom() => health_report()}
  defp evaluate_all_components do
    Prismatic.Registry.list_components()
    |> Enum.map(fn component ->
      dimensions = evaluate_dimensions(component)
      status = derive_status(dimensions)
      recommendation = derive_recommendation(status)

      report = %{
        component: component,
        status: status,
        dimensions: dimensions,
        timestamp: DateTime.utc_now(),
        recommendation: recommendation
      }

      {component, report}
    end)
    |> Map.new()
  end

  @spec evaluate_dimensions(atom()) :: map()
  defp evaluate_dimensions(component) do
    @health_dimensions
    |> Enum.map(fn dim -> {dim, evaluate_dimension(component, dim)} end)
    |> Map.new()
  end

  @spec evaluate_dimension(atom(), atom()) :: float()
  defp evaluate_dimension(component, :process_alive) do
    if Process.whereis(component), do: 1.0, else: 0.0
  end

  defp evaluate_dimension(component, :memory_usage) do
    case Process.whereis(component) do
      nil -> 0.0
      pid ->
        {:memory, bytes} = Process.info(pid, :memory)
        max_bytes = 100 * 1024 * 1024  # 100MB threshold
        max(0.0, 1.0 - bytes / max_bytes)
    end
  end

  defp evaluate_dimension(component, :message_queue) do
    case Process.whereis(component) do
      nil -> 0.0
      pid ->
        {:message_queue_len, len} = Process.info(pid, :message_queue_len)
        max(0.0, 1.0 - len / 1000)
    end
  end

  defp evaluate_dimension(_component, :response_latency) do
    # Derived from telemetry metrics
    Prismatic.Telemetry.Metrics.latency_score()
  end

  defp evaluate_dimension(_component, :error_rate) do
    # Derived from error tracking
    Prismatic.Telemetry.Metrics.error_rate_score()
  end

  @spec derive_status(map()) :: health_status()
  defp derive_status(dimensions) do
    avg = dimensions |> Map.values() |> Enum.sum() |> then(&(&1 / map_size(dimensions)))

    cond do
      avg >= 0.90 -> :healthy
      avg >= 0.70 -> :degraded
      avg >= 0.40 -> :unhealthy
      true -> :critical
    end
  end

  defp derive_recommendation(:healthy), do: :none
  defp derive_recommendation(:degraded), do: :monitor
  defp derive_recommendation(:unhealthy), do: :remediate
  defp derive_recommendation(:critical), do: :escalate

  defp health_priority(:healthy), do: 4
  defp health_priority(:degraded), do: 3
  defp health_priority(:unhealthy), do: 2
  defp health_priority(:critical), do: 1

  defp health_to_integer(:healthy), do: 3
  defp health_to_integer(:degraded), do: 2
  defp health_to_integer(:unhealthy), do: 1
  defp health_to_integer(:critical), do: 0

  defp schedule_check(interval), do: Process.send_after(self(), :scheduled_check, interval)
end
```

### Circuit Breaker Pattern

Circuit breakers prevent cascading failures by isolating unhealthy components:

```elixir
defmodule Prismatic.Operations.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation for autonomous operation.
  Prevents cascading failures by tracking failure rates and
  temporarily disabling calls to unhealthy dependencies.

  States: :closed (normal), :open (failing, reject calls),
  :half_open (testing recovery).
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @type breaker_config :: %{
    failure_threshold: pos_integer(),
    reset_timeout: pos_integer(),
    half_open_max: pos_integer()
  }

  @default_config %{
    failure_threshold: 3,
    reset_timeout: :timer.seconds(60),
    half_open_max: 1
  }

  @spec call(atom(), function()) :: {:ok, term()} | {:error, :circuit_open}
  def call(breaker_name, fun) do
    GenServer.call(breaker_name, {:call, fun})
  end

  @spec status(atom()) :: {:ok, state()}
  def status(breaker_name) do
    GenServer.call(breaker_name, :status)
  end

  @impl true
  def init(config) do
    state = %{
      config: Map.merge(@default_config, config),
      state: :closed,
      failure_count: 0,
      half_open_attempts: 0,
      last_failure: nil
    }
    {:ok, state}
  end

  @impl true
  def handle_call({:call, fun}, _from, %{state: :open} = state) do
    if time_to_half_open?(state) do
      attempt_half_open(fun, state)
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  def handle_call({:call, fun}, _from, %{state: :closed} = state) do
    attempt_call(fun, state)
  end

  def handle_call({:call, fun}, _from, %{state: :half_open} = state) do
    if state.half_open_attempts < state.config.half_open_max do
      attempt_half_open(fun, state)
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  def handle_call(:status, _from, state) do
    {:reply, {:ok, state.state}, state}
  end

  @spec attempt_call(function(), map()) :: {:reply, term(), map()}
  defp attempt_call(fun, state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | failure_count: 0}}

      {:error, reason} ->
        new_count = state.failure_count + 1
        new_state = if new_count >= state.config.failure_threshold do
          %{state | state: :open, failure_count: new_count, last_failure: System.monotonic_time(:millisecond)}
        else
          %{state | failure_count: new_count}
        end
        {:reply, {:error, reason}, new_state}
    end
  end

  @spec attempt_half_open(function(), map()) :: {:reply, term(), map()}
  defp attempt_half_open(fun, state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | state: :closed, failure_count: 0, half_open_attempts: 0}}

      {:error, reason} ->
        {:reply, {:error, reason}, %{state | state: :open, last_failure: System.monotonic_time(:millisecond), half_open_attempts: 0}}
    end
  end

  defp time_to_half_open?(%{last_failure: last, config: %{reset_timeout: timeout}}) do
    System.monotonic_time(:millisecond) - last >= timeout
  end

  defp safe_execute(fun) do
    try do
      {:ok, fun.()}
    rescue
      error -> {:error, error}
    catch
      :exit, reason -> {:error, {:exit, reason}}
    end
  end
end
```

### Self-Healing Pipeline

The self-healing pipeline connects health monitoring to corrective action:

| Stage | Action | Trigger | Automation |
|-------|--------|---------|------------|
| **Detection** | Anomaly identified via health check | Periodic health monitor cycle | Fully automatic |
| **Diagnosis** | Root cause determined via pattern matching | Health status transitions to `:unhealthy` | Fully automatic |
| **Remediation** | Corrective action applied | Known pattern matched in diagnosis | Fully automatic |
| **Verification** | Recovery confirmed via follow-up health check | After remediation completes | Fully automatic |
| **Escalation** | Human notified for unknown patterns | No matching remediation pattern | Manual review |

### Telemetry Integration

All autonomous operation components emit structured telemetry events:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :health, :check]` | `%{status: integer}` | `%{component: atom}` |
| `[:prismatic, :circuit_breaker, :state_change]` | `%{from: atom, to: atom}` | `%{breaker: atom}` |
| `[:prismatic, :self_healing, :remediation]` | `%{duration_ms: integer}` | `%{component: atom, action: atom}` |
| `[:prismatic, :supervisor, :restart]` | `%{count: integer}` | `%{supervisor: atom, child: atom}` |

## Implementation in Prismatic Platform

### PrismaticSupervisor Application

The `prismatic_supervisor` umbrella application (`apps/prismatic_supervisor/`) provides the compositional supervision infrastructure:

- **DependencyResolver** -- Builds startup ordering DAG across 115 apps
- **DomainSupervisor** -- Groups related apps under domain-scoped supervisors
- **HealthMonitor** -- Continuous multi-dimensional health assessment
- **AppRegistry** -- Tracks all running applications with pluggable ETS/Horde backends
- **AutoDiscovery** -- Scans umbrella apps, classifies into domains, builds dependency graph

### Operational Autonomy Levels

| Level | Description | Human Involvement | Platform Status |
|-------|-------------|-------------------|-----------------|
| **L0 Manual** | Human monitors and operates everything | Full | NOT USED |
| **L1 Alerting** | System alerts humans about issues | Reactive | NOT USED |
| **L2 Assisted** | System suggests corrective actions | Advisory | NOT USED |
| **L3 Conditional** | System acts autonomously for known patterns | Exception-based | ACTIVE for edge cases |
| **L4 High** | System handles most situations autonomously | Strategic oversight | ACTIVE for most operations |
| **L5 Full** | System operates without human involvement | None required | TARGET for production |

The platform currently operates at L4 (High Autonomy) for most subsystems, with L3 (Conditional) for novel situations requiring human judgment.

## Comparison with Alternatives

| Approach | Monitoring | Recovery | Optimization | Prismatic Advantage |
|----------|-----------|----------|-------------|-------------------|
| **Kubernetes** | Health checks, liveness probes | Pod restart, rolling update | HPA auto-scaling | Prismatic adds process-level granularity via OTP |
| **AWS Auto Scaling** | CloudWatch metrics | Instance replacement | Scaling policies | Prismatic operates within the application, not just infrastructure |
| **Netflix Chaos Engineering** | Failure injection testing | Validated recovery paths | N/A | Prismatic combines chaos testing with autonomous recovery |
| **HashiCorp Consul** | Service mesh health checks | Service re-routing | N/A | Prismatic integrates health with self-healing in one system |
| **Erlang/OTP (raw)** | Process monitoring | Supervisor restarts | N/A | Prismatic adds application-level health dimensions and self-optimization |

The key differentiator is integration depth. Infrastructure-level autonomous operation (Kubernetes, AWS) handles machine and container failures but cannot reason about application-level health. Prismatic operates at both levels: OTP handles process-level failures while application-level health monitoring handles semantic health (error rates, latency, quality metrics).

## Best Practices

### Supervision Design

1. **Isolate failure domains** -- Processes that can fail independently should be under separate supervisors.
2. **Choose restart strategies carefully** -- `:one_for_one` for independent processes, `:rest_for_one` for dependency chains, `:one_for_all` only for tightly coupled groups.
3. **Set appropriate restart intensity** -- `max_restarts` and `max_seconds` should reflect the expected failure rate, not be arbitrarily high.
4. **Name all supervised processes** -- Anonymous processes are impossible to monitor and debug.

### Health Monitoring

1. **Monitor multiple dimensions** -- Process liveness alone is insufficient; include memory, message queues, latency, and error rates.
2. **Use graduated thresholds** -- Distinguish between degraded, unhealthy, and critical states.
3. **Emit structured telemetry** -- All health data should flow through the telemetry pipeline for aggregation and alerting.
4. **Avoid over-monitoring** -- Health checks themselves consume resources; 30-second intervals balance timeliness with overhead.

### Circuit Breaker Configuration

1. **Tune failure thresholds per component** -- Critical components may need lower thresholds (faster trip) while resilient components can tolerate more failures.
2. **Set reasonable reset timeouts** -- Too short and the breaker oscillates; too long and recovery is delayed.
3. **Log all state transitions** -- Circuit breaker state changes are significant operational events.

### Self-Healing Limits

1. **Never heal silently** -- All remediation actions must be logged and reported through telemetry.
2. **Limit retry attempts** -- Infinite retry loops consume resources and mask underlying problems.
3. **Escalate when uncertain** -- If the self-healing pipeline cannot match a known pattern, escalate to human review rather than guessing.

## Common Pitfalls

### Restart Storm

A process that crashes immediately after restart, triggering rapid restart cycles that consume supervisor budget and potentially bring down the entire supervision tree. Prevention: Set appropriate `max_restarts` and `max_seconds` limits, and implement exponential backoff in process initialization.

### Health Check Avalanche

All health checks executing simultaneously, creating a thundering herd that degrades the very system being monitored. Prevention: Stagger health check intervals with jitter, and use lightweight checks (process info) rather than heavy operations (database queries).

### Circuit Breaker Oscillation

A circuit breaker rapidly alternating between open and half-open states because the underlying problem resolves slowly. Prevention: Implement exponential backoff on the reset timeout, increasing the wait period after each failed half-open attempt.

### Silent Degradation

Components that continue operating in a degraded state without triggering alerts because individual metrics remain below thresholds while the composite health is poor. Prevention: Evaluate composite health scores, not just individual dimensions.

### Supervision Hierarchy Too Flat

Placing all processes under a single supervisor, losing the containment benefits of hierarchical supervision. Prevention: Organize supervisors by domain, with separate supervisors for each failure domain.

## Use Cases

### Production Deployment Recovery

When the platform deploys to Fly.io (`prismatic-prod.fly.dev`), the supervision tree ensures that any process crash during deployment is automatically recovered. If a [GenServer](/glossary/genserver/) fails to initialize due to a transient dependency issue, the supervisor retries according to its restart strategy.

### Agent Pool Management

The platform's 530+ agents are managed through DynamicSupervisors that start and stop agent processes on demand. If an agent crashes during task execution, the supervisor restarts it and the agent re-initializes from persisted state.

### Database Connection Recovery

When PostgreSQL connections drop (network hiccup, server restart), the [Ecto](/glossary/ets/) connection pool detects the failure, the circuit breaker trips to prevent request queueing, and the health monitor tracks recovery. Once connections are re-established, the circuit breaker transitions to half-open and then closed.

### Session Lifecycle Protection

The SessionLifecycle GenServer operates with circuit breaker protection on all hook executions. If `mix autoevolve.scan --quick` hangs, the circuit breaker trips after 3 failures, and subsequent sessions skip that hook until the breaker resets after 60 seconds.

## Related Concepts

- [Autonomous Agent](/glossary/autonomous-agent/) -- Software entities that operate autonomously within the platform
- [Self-Healing](/glossary/self-healing/) -- Automated detection and remediation of operational issues
- [Health Monitoring](/glossary/health-monitoring/) -- Continuous assessment of component and system health
- [AutoHeal](/glossary/autoheal/) -- Prismatic's concrete self-healing implementation
- [Fault Tolerance](/glossary/fault-tolerance/) -- System ability to continue operating despite component failures
- [Supervision Tree](/glossary/supervision-tree/) -- OTP hierarchical process supervision architecture
- [Circuit Breaker](/glossary/circuit-breaker/) -- Pattern for isolating failing components
- [GenServer](/glossary/genserver/) -- OTP behavior implementing stateful server processes
- [OTP](/glossary/otp/) -- The Open Telecom Platform providing the foundation for autonomous operation
- [Telemetry](/glossary/telemetry/) -- Metrics and event infrastructure enabling operational observability
- [ETS](/glossary/ets/) -- In-memory storage used by health monitors and circuit breakers
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Quality monitoring component of autonomous operation

## See Also

- [Architecture](/architecture/) -- Platform supervision and operational architecture
- [Technologies](/technologies/) -- OTP and Elixir technologies enabling autonomous operation
- [Capabilities](/capabilities/) -- Platform autonomy capabilities overview
- [Apps](/apps/) -- Umbrella applications managed by autonomous operation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
