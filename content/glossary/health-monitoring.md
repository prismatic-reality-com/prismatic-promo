+++
title = "Health Monitoring"
weight = 50
[extra]
tags = ["glossary", "observability", "monitoring", "otp", "reliability", "fault-tolerance", "telemetry", "infrastructure"]
description = "Health monitoring encompasses the continuous observation, measurement, and evaluation of system components to detect degradation, predict failures, and maintain operational excellence across distributed software platforms"
category = "observability"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["telemetry", "observability", "fault-tolerance", "supervision-tree", "circuit-breaker", "metrics", "self-healing", "system-health", "monitoring", "distributed-system"]
key_concepts = ["liveness probes", "readiness probes", "heartbeat patterns", "degradation detection", "predictive failure analysis"]
platform_relevance = "critical"
date_created = "2026-02-22"
date_updated = "2026-02-22"
aliases = ["health checks", "system health monitoring", "service health"]
word_count = 1775
date_modified = "2026-02-23"
keywords = ["Health", "Monitoring", "glossary", "observability", "Prismatic Platform", "Prismatic", "BEAM"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Health Monitoring - Prismatic Platform"
+++

## Definition

Health monitoring is the practice of continuously observing, measuring, and evaluating the operational state of software systems, infrastructure components, and application services to detect anomalies, predict failures, and ensure sustained availability. In the context of the Prismatic Platform, health monitoring is a first-class architectural concern deeply integrated with Erlang/OTP supervision trees, Elixir telemetry pipelines, and the platform's self-healing infrastructure. Rather than treating health checks as an afterthought bolted onto production systems, Prismatic embeds monitoring into every layer of the application stack -- from individual GenServer processes to entire umbrella application domains.

Health monitoring extends beyond simple "up or down" binary checks. A mature health monitoring system evaluates resource utilization, response latency distributions, error rates, queue depths, connection pool saturation, memory pressure, and business-level indicators such as throughput and data freshness. The goal is to provide operators and automated systems with sufficient signal to distinguish between healthy operation, degraded performance, and imminent failure before users are affected.

## Overview

Modern distributed systems operate under constant uncertainty. Network partitions, hardware failures, dependency outages, and resource exhaustion can occur at any time. Health monitoring provides the observational foundation that enables systems to detect these conditions and respond appropriately -- whether through automated remediation, graceful degradation, or operator alerting.

In the Erlang/OTP ecosystem that underpins the Prismatic Platform, health monitoring benefits from the BEAM virtual machine's built-in process introspection capabilities. Every process exposes its message queue length, memory usage, reduction count, and current state through standard interfaces. The OTP supervision tree provides hierarchical health information: if a child process crashes and is restarted beyond its configured intensity, the supervisor itself fails upward, propagating health signals through the system hierarchy.

The Prismatic Platform implements health monitoring across three distinct tiers. The first tier covers infrastructure-level health: BEAM VM metrics, system memory, CPU utilization, disk I/O, and network connectivity. The second tier addresses application-level health: GenServer responsiveness, ETS table sizes, database connection pool availability, and external service reachability. The third tier monitors business-level health: data pipeline throughput, OSINT adapter success rates, quality gate compliance, and agent execution performance. Together, these tiers provide a comprehensive view of system health that supports both automated decision-making and human oversight.

## Technical Details

The Prismatic Platform leverages Elixir's `:telemetry` library as the foundation for health monitoring instrumentation. Telemetry events are emitted at critical points throughout the codebase, and monitoring modules attach handlers that aggregate, evaluate, and forward health signals.

```elixir
defmodule Prismatic.Health.Monitor do
  @moduledoc """
  Centralized health monitoring GenServer that periodically evaluates
  system health across infrastructure, application, and business tiers.
  """

  use GenServer

  require Logger

  @check_interval :timer.seconds(15)
  @degraded_threshold 0.8
  @critical_threshold 0.5

  defstruct [
    :status,
    :last_check,
    :checks,
    :history,
    :subscribers
  ]

  @type health_status :: :healthy | :degraded | :critical | :unknown
  @type check_result :: %{
          name: atom(),
          status: health_status(),
          score: float(),
          metadata: map(),
          checked_at: DateTime.t()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_status() :: {health_status(), [check_result()]}
  def current_status do
    GenServer.call(__MODULE__, :current_status)
  end

  @spec register_check(atom(), (-> check_result())) :: :ok
  def register_check(name, check_fn) when is_atom(name) and is_function(check_fn, 0) do
    GenServer.call(__MODULE__, {:register_check, name, check_fn})
  end

  @impl true
  def init(opts) do
    interval = Keyword.get(opts, :interval, @check_interval)
    Process.send_after(self(), :run_checks, interval)

    state = %__MODULE__{
      status: :unknown,
      last_check: nil,
      checks: %{},
      history: :queue.new(),
      subscribers: MapSet.new()
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:current_status, _from, state) do
    results = Enum.map(state.checks, fn {name, check_fn} ->
      evaluate_check(name, check_fn)
    end)

    {:reply, {state.status, results}, state}
  end

  @impl true
  def handle_call({:register_check, name, check_fn}, _from, state) do
    updated_checks = Map.put(state.checks, name, check_fn)
    {:reply, :ok, %{state | checks: updated_checks}}
  end

  @impl true
  def handle_info(:run_checks, state) do
    results = Enum.map(state.checks, fn {name, check_fn} ->
      evaluate_check(name, check_fn)
    end)

    aggregate_score = calculate_aggregate_score(results)
    new_status = score_to_status(aggregate_score)

    if new_status != state.status do
      :telemetry.execute(
        [:prismatic, :health, :status_change],
        %{score: aggregate_score},
        %{previous: state.status, current: new_status}
      )
    end

    Process.send_after(self(), :run_checks, @check_interval)

    updated_history = enqueue_limited(state.history, {DateTime.utc_now(), new_status, aggregate_score}, 100)

    {:noreply, %{state | status: new_status, last_check: DateTime.utc_now(), history: updated_history}}
  end

  defp evaluate_check(name, check_fn) do
    try do
      check_fn.()
    rescue
      error ->
        %{name: name, status: :critical, score: 0.0, metadata: %{error: Exception.message(error)}, checked_at: DateTime.utc_now()}
    end
  end

  defp calculate_aggregate_score(results) do
    case results do
      [] -> 1.0
      _ ->
        results
        |> Enum.map(& &1.score)
        |> Enum.sum()
        |> Kernel./(length(results))
    end
  end

  defp score_to_status(score) when score >= @degraded_threshold, do: :healthy
  defp score_to_status(score) when score >= @critical_threshold, do: :degraded
  defp score_to_status(_score), do: :critical

  defp enqueue_limited(queue, item, max_size) do
    queue = :queue.in(item, queue)

    if :queue.len(queue) > max_size do
      {_, queue} = :queue.out(queue)
      queue
    else
      queue
    end
  end
end
```

### Infrastructure-Level Health Checks

Infrastructure checks evaluate the BEAM VM and underlying operating system resources:

```elixir
defmodule Prismatic.Health.Checks.Infrastructure do
  @moduledoc """
  Infrastructure-level health checks for BEAM VM and OS resources.
  """

  @memory_threshold_bytes 1_073_741_824
  @process_threshold 200_000
  @port_threshold 50_000

  @spec beam_memory() :: Prismatic.Health.Monitor.check_result()
  def beam_memory do
    memory = :erlang.memory(:total)
    score = if memory < @memory_threshold_bytes, do: 1.0, else: max(0.0, 1.0 - (memory - @memory_threshold_bytes) / @memory_threshold_bytes)

    %{
      name: :beam_memory,
      status: if(score > 0.8, do: :healthy, else: :degraded),
      score: score,
      metadata: %{total_bytes: memory, threshold: @memory_threshold_bytes},
      checked_at: DateTime.utc_now()
    }
  end

  @spec process_count() :: Prismatic.Health.Monitor.check_result()
  def process_count do
    count = length(Process.list())
    score = if count < @process_threshold, do: 1.0, else: max(0.0, 1.0 - (count - @process_threshold) / @process_threshold)

    %{
      name: :process_count,
      status: if(score > 0.8, do: :healthy, else: :degraded),
      score: score,
      metadata: %{count: count, threshold: @process_threshold},
      checked_at: DateTime.utc_now()
    }
  end

  @spec port_count() :: Prismatic.Health.Monitor.check_result()
  def port_count do
    count = length(Port.list())
    score = if count < @port_threshold, do: 1.0, else: max(0.0, 1.0 - (count - @port_threshold) / @port_threshold)

    %{
      name: :port_count,
      status: if(score > 0.8, do: :healthy, else: :degraded),
      score: score,
      metadata: %{count: count, threshold: @port_threshold},
      checked_at: DateTime.utc_now()
    }
  end
end
```

### Application-Level Health Checks

Application checks verify that critical GenServers are responsive and that resource pools are available:

```elixir
defmodule Prismatic.Health.Checks.Application do
  @moduledoc """
  Application-level health checks for GenServer responsiveness
  and resource pool availability.
  """

  @timeout 5_000

  @spec genserver_responsive(module()) :: Prismatic.Health.Monitor.check_result()
  def genserver_responsive(server) do
    start = System.monotonic_time(:microsecond)

    result =
      try do
        GenServer.call(server, :health_check, @timeout)
      catch
        :exit, _ -> {:error, :timeout}
      end

    latency = System.monotonic_time(:microsecond) - start

    case result do
      {:ok, _} ->
        score = if latency < 1_000, do: 1.0, else: max(0.0, 1.0 - latency / 10_000)
        %{name: :"#{server}_responsive", status: :healthy, score: score, metadata: %{latency_us: latency}, checked_at: DateTime.utc_now()}

      {:error, reason} ->
        %{name: :"#{server}_responsive", status: :critical, score: 0.0, metadata: %{reason: reason}, checked_at: DateTime.utc_now()}
    end
  end

  @spec database_pool(atom()) :: Prismatic.Health.Monitor.check_result()
  def database_pool(repo) do
    case Ecto.Adapters.SQL.query(repo, "SELECT 1", [], timeout: @timeout) do
      {:ok, _} ->
        %{name: :"#{repo}_pool", status: :healthy, score: 1.0, metadata: %{}, checked_at: DateTime.utc_now()}

      {:error, reason} ->
        %{name: :"#{repo}_pool", status: :critical, score: 0.0, metadata: %{reason: inspect(reason)}, checked_at: DateTime.utc_now()}
    end
  end
end
```

## Implementation

Implementing health monitoring in a production Elixir application follows a layered approach that aligns with OTP principles.

### Step 1: Define Health Check Contracts

Every component that participates in health monitoring must implement a standard callback. This ensures uniform health reporting across the entire umbrella:

```elixir
defmodule Prismatic.Health.Checkable do
  @moduledoc """
  Behaviour that any health-checkable component must implement.
  """

  @callback health_check() :: {:ok, map()} | {:error, term()}
  @callback health_metadata() :: map()
end
```

### Step 2: Register Components at Boot Time

During application startup, each umbrella app registers its health checks with the central monitor. This registration happens in the application supervision tree, ensuring checks are automatically deregistered when applications stop.

### Step 3: Expose Health Endpoints

Health monitoring data is exposed through both HTTP endpoints for external monitoring tools and LiveView dashboards for human operators. The HTTP endpoint follows the standard health check response format used by Kubernetes, Fly.io, and other orchestration platforms.

### Step 4: Configure Alerting Thresholds

Health monitoring without alerting is mere data collection. The platform configures alerting rules that trigger notifications when health degrades.

## Comparison

| Approach | Strengths | Weaknesses | Prismatic Fit |
|----------|-----------|------------|---------------|
| **Polling-based checks** | Simple, predictable, easy to reason about | Latency between check intervals, resource overhead from constant polling | Primary approach for infrastructure tier |
| **Event-driven monitoring** | Real-time detection, low overhead when healthy | Complex implementation, potential event storm during failures | Used for application-tier via telemetry |
| **Passive monitoring** | Zero overhead, observes existing traffic | Cannot detect issues without traffic, blind to startup problems | Supplementary for high-traffic paths |
| **Synthetic monitoring** | Tests actual user paths, catches integration issues | Expensive, may affect production metrics, complex to maintain | Used for critical business flows |
| **BEAM process monitoring** | Native to OTP, process-level granularity, zero external deps | BEAM-specific, requires OTP knowledge | Core advantage of Prismatic's Elixir stack |

### Health Monitoring vs. Observability

Health monitoring is a subset of the broader observability discipline. While observability encompasses metrics, logs, and traces to answer arbitrary questions about system behavior, health monitoring focuses specifically on answering one question: "Is this system component functioning correctly right now?" The Prismatic Platform treats health monitoring as the actionable layer built on top of the observability foundation provided by telemetry, structured logging, and distributed tracing.

### Health Monitoring vs. Alerting

Alerting is a downstream consumer of health monitoring data. Health monitoring produces structured health signals; alerting systems consume those signals and apply rules to determine when human intervention or automated remediation is required. In Prismatic, the Quality Floor Guardian acts as an intelligent alerting layer that consumes health monitoring data and triggers autonomous evolution cycles when quality degrades.

## Best Practices

**1. Health checks must be fast and side-effect-free.** A health check that takes 30 seconds to complete or modifies system state defeats the purpose. Prismatic enforces a 5-second timeout on all health checks, and any check that mutates state is rejected during code review.

**2. Distinguish between liveness and readiness.** A live system is running but may not be ready to serve traffic (for example, during startup while caches warm). Prismatic exposes separate `/health/live` and `/health/ready` endpoints that orchestration platforms use to make routing decisions.

**3. Include dependency health in readiness checks.** If your application depends on PostgreSQL and Meilisearch, the readiness check should verify connectivity to both. A system that reports "ready" while its database is unreachable will receive traffic it cannot serve.

**4. Use graduated health scoring, not binary checks.** A system at 95% memory utilization is not "healthy" in the same way as one at 20%. The Prismatic health monitor uses floating-point scores (0.0 to 1.0) that enable nuanced degradation detection and trend analysis.

**5. Preserve health check history for trend analysis.** A single snapshot tells you the current state; a time series of health checks reveals trends. Prismatic maintains a circular buffer of the last 1,000 health check results, enabling detection of gradual degradation that would be invisible in point-in-time checks.

**6. Monitor the monitor.** If your health monitoring system itself fails silently, you lose visibility at the worst possible time. Prismatic uses OTP supervision to ensure the health monitor process is automatically restarted on failure, and a separate watchdog process verifies monitor liveness.

**7. Correlate health signals across tiers.** An application-level health degradation often has an infrastructure-level root cause. By correlating signals across tiers, operators can quickly identify that application slowness is caused by disk I/O saturation rather than application bugs.

## Pitfalls

**Overly aggressive health checks.** Checking health every 100 milliseconds on 50 components creates 500 checks per second -- a non-trivial load that can itself cause the degradation you are trying to detect. Choose check intervals appropriate to the failure modes you want to catch.

**Health checks that mask failures.** A health check that catches all exceptions and returns "healthy" regardless is worse than no health check at all, because it provides false confidence. Prismatic's health check framework propagates errors as `:critical` status rather than swallowing them.

**Ignoring partial degradation.** Systems that only report "up" or "down" miss the critical window where a component is degrading but not yet failed. This window is often where intervention is most effective. The scored health model addresses this by surfacing degradation before it becomes failure.

**Coupling health checks to business logic.** Health checks should verify that the system can process requests, not that specific business conditions hold. Checking "is the database reachable?" is a health check; checking "do we have more than 100 users?" is a business metric.

**Missing timeout on health check execution.** A health check that hangs indefinitely (for example, waiting for a database connection from an exhausted pool) will cause the health monitor itself to become unresponsive. Always enforce timeouts on health check execution.

**Alert fatigue from noisy health checks.** If health checks flap frequently (healthy, degraded, healthy, degraded), operators learn to ignore alerts. Implement hysteresis: require multiple consecutive degraded checks before transitioning status, and require sustained recovery before transitioning back to healthy.

## Use Cases

**Container orchestration integration.** Kubernetes and Fly.io use health check endpoints to determine whether to route traffic to a container, restart it, or scale horizontally. Prismatic's health endpoints follow the standard format expected by these platforms, enabling automated container lifecycle management.

**Canary deployment validation.** During a canary release, health monitoring of the new version is compared against the baseline. If the canary shows degraded health scores, the deployment is automatically rolled back before the change reaches the full fleet.

**Autonomous self-healing.** The Prismatic Platform's autoheal system uses health monitoring data as its primary input signal. When health checks detect degradation, the system can automatically restart affected processes, evict cached data, reconnect to external services, or trigger an evolution cycle to fix underlying code issues.

**Compliance and audit trails.** Regulatory frameworks like NIS2 and SOC2 require evidence that systems are continuously monitored. Health monitoring history provides timestamped, structured evidence of system availability and any degradation events, satisfying audit requirements.

**Capacity planning.** Historical health monitoring data reveals resource utilization trends over time. By analyzing how memory usage, connection pool saturation, and response latency grow with traffic, teams can project when capacity needs to be expanded.

**Incident postmortem analysis.** After an incident, health monitoring history provides a timeline of when degradation began, which components were affected first, and how the failure propagated through the system. This data is invaluable for root cause analysis and preventing recurrence.

## Related Concepts

Health monitoring intersects with many other concepts in the Prismatic Platform ecosystem:

- [Telemetry](/glossary/telemetry/) provides the instrumentation foundation that health monitoring builds upon
- [Observability](/glossary/observability/) is the broader discipline encompassing metrics, logs, and traces
- [Fault Tolerance](/glossary/fault-tolerance/) describes the system's ability to continue operating despite component failures
- [Supervision Trees](/glossary/supervision-tree/) provide hierarchical health propagation through OTP process trees
- [Circuit Breakers](/glossary/circuit-breaker/) use health signals to protect systems from cascading failures
- [Self-Healing](/glossary/self-healing/) systems consume health monitoring data to trigger automated remediation
- [System Health](/glossary/system-health/) represents the aggregate state derived from individual health checks
- [Metrics](/glossary/metrics/) are the quantitative measurements that health checks produce and evaluate
- [Monitoring](/glossary/monitoring/) is the broader operational practice that health monitoring specializes
- [Distributed Systems](/glossary/distributed-system/) present unique health monitoring challenges due to network partitions and partial failures

## See Also

- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- autonomous quality monitoring that uses health data
- [Autoheal](/glossary/autoheal/) -- self-healing system triggered by health degradation
- [Let It Crash](/glossary/let-it-crash/) -- OTP philosophy that complements health monitoring
- [BEAM VM](/glossary/beam-vm/) -- the runtime that provides native process health introspection
- [Performance Tracking](/glossary/performance-tracking/) -- related discipline focused on response time and throughput
- [Structured Logging](/glossary/structured-logging/) -- complements health monitoring with contextual event data

---

**Built with precision. Ready for the future.**

*Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [Prismatic Platform](https://github.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)*
