+++
title = "Component Failures"
weight = 50
[extra]
tags = ["glossary", "reliability", "fault-tolerance", "resilience", "failure-modes", "engineering"]
description = "Component failures refer to the partial or complete loss of functionality in individual system elements, encompassing detection strategies, isolation mechanisms, recovery procedures, and the architectural patterns that enable systems to maintain operation despite such failures."
category = "reliability"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "Reliability Engineering"
related_concepts = ["fault tolerance", "supervision trees", "circuit breakers", "process isolation", "crash-only design", "let it crash", "graceful degradation", "failure domains"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "advanced"
prerequisites = ["supervision-tree", "process-isolation", "circuit-breaker", "beam-vm"]
learning_path = ["reliability", "process-isolation", "supervision-tree", "component-failures", "chaos-engineering"]
interactive_demos = ["/labs", "/architecture"]
code_examples = true
external_resources = ["https://erlang.org/doc/design_principles/sup_princ.html", "https://ferd.ca/it-s-about-the-guarantees.html", "https://hexdocs.pm/elixir/Supervisor.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["process crash recovery", "supervisor restart limits", "cascading failure containment", "network partition handling", "resource exhaustion simulation"]
keywords = ["component failures", "fault tolerance", "failure detection", "failure isolation", "failure recovery", "crash recovery", "let it crash", "resilience", "reliability engineering"]
related_terms = ["circuit-breaker", "supervision-tree", "process-isolation", "self-healing", "chaos-engineering", "bulkhead-pattern", "disaster-recovery", "reliability", "controlled-failures", "process-restart"]
word_count = 1577
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Component Failures - Prismatic Platform"
+++

## Definition

Component failures are events in which an individual element of a software system -- a process, service, module, hardware node, or external dependency -- ceases to function correctly, either partially (degraded performance, incorrect responses) or completely (crash, unresponsiveness). In complex distributed systems, component failures are not exceptional events but statistical certainties that must be anticipated, detected, isolated, and recovered from as part of normal system operation.

The engineering discipline around component failures focuses on three core questions: How do we detect that a component has failed? How do we prevent the failure from spreading to other components? How do we restore the failed component or an equivalent replacement to operational status?

## Overview

The history of reliable computing is fundamentally a history of managing component failures. From early redundancy schemes in aerospace systems to modern distributed architectures, the central challenge remains: how to build reliable systems from unreliable parts.

Traditional approaches attempted to prevent failures by making components more reliable -- better hardware, more thorough testing, defensive programming. While these measures reduce failure frequency, they cannot eliminate failures entirely. Network partitions, disk corruption, memory exhaustion, software bugs, and operator errors will occur in any sufficiently large system.

The paradigm shift introduced by Erlang and the OTP framework, which the Prismatic Platform builds upon, is to accept failures as inevitable and design the system's response to failures rather than attempting to prevent them. This "let it crash" philosophy does not mean ignoring error handling -- it means separating the concern of error handling from the concern of business logic, delegating failure recovery to specialized supervisor processes.

### Failure Taxonomy

Component failures can be classified along several dimensions:

**By severity:**
- **Crash failure**: The component stops entirely and is detectable.
- **Omission failure**: The component fails to respond to some requests.
- **Timing failure**: The component responds, but outside acceptable time bounds.
- **Response failure**: The component responds incorrectly (value or state transition error).
- **Byzantine failure**: The component behaves arbitrarily, including producing contradictory outputs.

**By scope:**
- **Isolated failure**: Affects only the failed component.
- **Correlated failure**: Multiple components fail simultaneously due to a shared cause.
- **Cascading failure**: One component's failure triggers failures in dependent components.

**By duration:**
- **Transient**: Self-resolving (network glitch, temporary resource contention).
- **Intermittent**: Recurring but not permanent (flaky connection, marginal hardware).
- **Permanent**: Requires explicit intervention to resolve (hardware failure, data corruption).

## Technical Details

### Failure Detection

Detecting component failures quickly and accurately is the foundation of fault-tolerant design. The Prismatic Platform employs multiple detection mechanisms:

```elixir
defmodule Prismatic.Reliability.FailureDetector do
  @moduledoc """
  Multi-strategy failure detection for system components.
  Combines heartbeat monitoring, response time analysis,
  and error rate tracking to detect failures promptly.
  """
  use GenServer

  @type component_id :: atom() | {atom(), node()}

  @type health_state :: :healthy | :degraded | :suspected | :failed

  @type detection_config :: %{
    heartbeat_interval_ms: pos_integer(),
    heartbeat_timeout_ms: pos_integer(),
    error_rate_threshold: float(),
    response_time_p99_ms: pos_integer(),
    suspicion_window_ms: pos_integer()
  }

  @type state :: %{
    components: %{component_id() => component_state()},
    config: detection_config()
  }

  @type component_state :: %{
    health: health_state(),
    last_heartbeat: DateTime.t() | nil,
    error_count: non_neg_integer(),
    request_count: non_neg_integer(),
    response_times: :queue.queue(),
    suspected_since: DateTime.t() | nil
  }

  @default_config %{
    heartbeat_interval_ms: 5_000,
    heartbeat_timeout_ms: 15_000,
    error_rate_threshold: 0.05,
    response_time_p99_ms: 1_000,
    suspicion_window_ms: 30_000
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    config = Map.merge(@default_config, Map.new(opts[:config] || []))
    GenServer.start_link(__MODULE__, config, name: __MODULE__)
  end

  @impl true
  def init(config) do
    schedule_heartbeat_check(config.heartbeat_interval_ms)
    {:ok, %{components: %{}, config: config}}
  end

  @spec register_component(component_id()) :: :ok
  def register_component(component_id) do
    GenServer.call(__MODULE__, {:register, component_id})
  end

  @spec report_heartbeat(component_id()) :: :ok
  def report_heartbeat(component_id) do
    GenServer.cast(__MODULE__, {:heartbeat, component_id, DateTime.utc_now()})
  end

  @spec report_response(component_id(), non_neg_integer(), :ok | :error) :: :ok
  def report_response(component_id, duration_ms, result) do
    GenServer.cast(__MODULE__, {:response, component_id, duration_ms, result})
  end

  @spec get_health(component_id()) :: health_state()
  def get_health(component_id) do
    GenServer.call(__MODULE__, {:get_health, component_id})
  end

  @impl true
  def handle_call({:register, component_id}, _from, state) do
    new_component = %{
      health: :healthy,
      last_heartbeat: DateTime.utc_now(),
      error_count: 0,
      request_count: 0,
      response_times: :queue.new(),
      suspected_since: nil
    }

    new_state = put_in(state, [:components, component_id], new_component)
    {:reply, :ok, new_state}
  end

  @impl true
  def handle_call({:get_health, component_id}, _from, state) do
    health =
      case Map.get(state.components, component_id) do
        nil -> :unknown
        component -> component.health
      end

    {:reply, health, state}
  end

  @impl true
  def handle_cast({:heartbeat, component_id, timestamp}, state) do
    new_state =
      update_in(state, [:components, component_id], fn
        nil -> nil
        component -> %{component | last_heartbeat: timestamp}
      end)

    {:noreply, new_state}
  end

  @impl true
  def handle_cast({:response, component_id, duration_ms, result}, state) do
    new_state =
      update_in(state, [:components, component_id], fn
        nil ->
          nil

        component ->
          updated = %{component | request_count: component.request_count + 1}

          updated =
            if result == :error do
              %{updated | error_count: updated.error_count + 1}
            else
              updated
            end

          response_times = enqueue_bounded(updated.response_times, duration_ms, 100)
          %{updated | response_times: response_times}
      end)

    {:noreply, new_state}
  end

  @impl true
  def handle_info(:check_heartbeats, state) do
    now = DateTime.utc_now()
    config = state.config

    new_components =
      Map.new(state.components, fn {id, component} ->
        new_health = evaluate_health(component, now, config)
        {id, %{component | health: new_health}}
      end)

    schedule_heartbeat_check(config.heartbeat_interval_ms)
    {:noreply, %{state | components: new_components}}
  end

  defp evaluate_health(component, now, config) do
    heartbeat_age = DateTime.diff(now, component.last_heartbeat || now, :millisecond)

    cond do
      heartbeat_age > config.heartbeat_timeout_ms -> :failed
      heartbeat_age > config.suspicion_window_ms -> :suspected
      error_rate(component) > config.error_rate_threshold -> :degraded
      true -> :healthy
    end
  end

  defp error_rate(%{request_count: 0}), do: 0.0
  defp error_rate(%{error_count: errors, request_count: total}), do: errors / total

  defp enqueue_bounded(queue, item, max_size) do
    queue = :queue.in(item, queue)

    if :queue.len(queue) > max_size do
      {_, trimmed} = :queue.out(queue)
      trimmed
    else
      queue
    end
  end

  defp schedule_heartbeat_check(interval_ms) do
    Process.send_after(self(), :check_heartbeats, interval_ms)
  end
end
```

### Failure Isolation

Failure isolation prevents a component failure from affecting other parts of the system. The BEAM VM provides inherent isolation through process architecture, but additional patterns strengthen isolation at higher abstraction levels:

```elixir
defmodule Prismatic.Reliability.FailureBoundary do
  @moduledoc """
  Implements failure boundary enforcement using a combination
  of supervision, circuit breaking, and bulkhead isolation.
  """

  @type boundary_config :: %{
    name: atom(),
    max_concurrent: pos_integer(),
    timeout_ms: pos_integer(),
    circuit_breaker: circuit_breaker_config()
  }

  @type circuit_breaker_config :: %{
    failure_threshold: pos_integer(),
    reset_timeout_ms: pos_integer(),
    half_open_max: pos_integer()
  }

  @spec execute_within_boundary(boundary_config(), (() -> result)) ::
          {:ok, result} | {:error, :boundary_rejected | :timeout | :circuit_open}
        when result: term()
  def execute_within_boundary(config, operation) do
    with :ok <- check_circuit_breaker(config.name),
         :ok <- acquire_semaphore(config.name, config.max_concurrent) do
      try do
        result = execute_with_timeout(operation, config.timeout_ms)
        record_success(config.name)
        release_semaphore(config.name)
        {:ok, result}
      rescue
        error ->
          record_failure(config.name)
          release_semaphore(config.name)
          {:error, {:component_failure, error}}
      end
    end
  end

  defp check_circuit_breaker(name) do
    case :ets.lookup(:circuit_breakers, name) do
      [{^name, :open, _}] -> {:error, :circuit_open}
      _ -> :ok
    end
  end

  defp acquire_semaphore(name, max) do
    case :counters.get(:semaphores, semaphore_index(name)) do
      count when count < max ->
        :counters.add(:semaphores, semaphore_index(name), 1)
        :ok

      _ ->
        {:error, :boundary_rejected}
    end
  end

  defp release_semaphore(name) do
    :counters.sub(:semaphores, semaphore_index(name), 1)
  end

  defp execute_with_timeout(operation, timeout_ms) do
    task = Task.async(fn -> operation.() end)

    case Task.yield(task, timeout_ms) || Task.shutdown(task) do
      {:ok, result} -> result
      nil -> raise "Operation timed out after #{timeout_ms}ms"
    end
  end

  defp record_success(name) do
    :telemetry.execute(
      [:prismatic, :failure_boundary, :success],
      %{count: 1},
      %{boundary: name}
    )
  end

  defp record_failure(name) do
    :telemetry.execute(
      [:prismatic, :failure_boundary, :failure],
      %{count: 1},
      %{boundary: name}
    )
  end

  defp semaphore_index(name), do: :erlang.phash2(name, 1024) + 1
end
```

### Failure Recovery

Recovery from component failures follows a hierarchy of strategies, from simple restart to complex state reconstruction:

1. **Immediate restart** (supervisor default): The failed process is restarted with its initial state. Suitable for stateless or easily reconstructable components.
2. **Restart with state recovery**: The process restarts and recovers state from persistent storage (ETS, database, or event log).
3. **Graceful degradation**: The system continues operating with reduced functionality while the failed component is unavailable.
4. **Failover**: A standby component takes over the responsibilities of the failed component.
5. **Manual intervention**: For failures that cannot be automatically resolved, the system alerts operators and provides diagnostic information.

## Implementation in Prismatic Platform

The Prismatic Platform implements component failure management at multiple levels:

### Process-Level Isolation

Every stateful component runs as an independent OTP process. The BEAM VM guarantees that a crash in one process cannot corrupt the memory of another process. This is the foundation of all failure isolation in the platform.

### Supervision Tree Architecture

The PrismaticSupervisor organizes the 115 umbrella applications into a dependency-aware supervision hierarchy. Each application has its own supervisor with an appropriate restart strategy. The DependencyResolver ensures that applications start in the correct order and that failures in one application trigger appropriate responses in dependent applications.

### Circuit Breaker Integration

External dependencies (APIs, databases, third-party services) are accessed through circuit breakers that prevent cascading failures when those dependencies become unavailable. The circuit breaker tracks failure rates, opens when a threshold is exceeded, and periodically attempts recovery.

### Health Monitoring

The HealthMonitor subsystem continuously checks the health of all registered components, aggregating heartbeat data, error rates, and response times into a unified health assessment. Components that transition to degraded or failed states trigger telemetry events that can be observed through the LiveView dashboard.

### Autoheal Integration

The autoheal system responds to detected component failures by analyzing the failure mode, determining the appropriate recovery strategy, and executing the recovery. For quality-related failures (compilation warnings, test failures, static analysis violations), autoheal can automatically apply fixes and verify the result.

## Comparison with Alternatives

| Approach | Philosophy | Strengths | Limitations |
|----------|-----------|-----------|-------------|
| **Defensive programming** | Prevent failures through input validation and error checking | Catches many errors at boundaries | Cannot prevent all failure modes; clutters business logic |
| **Exception handling** | Catch and handle errors at the call site | Familiar to most developers | Leads to deeply nested try/catch; mixes recovery with logic |
| **Let it crash (OTP)** | Separate failure recovery from business logic via supervisors | Clean business logic; systematic recovery; composable | Requires OTP mindset; initial learning curve |
| **Retry with backoff** | Retry failed operations with increasing delays | Handles transient failures well | Can amplify load during widespread failures |
| **Bulkhead isolation** | Partition resources to contain failures | Prevents resource exhaustion from spreading | Reduces overall resource utilization |

The Prismatic Platform combines all of these approaches, using OTP supervision as the foundation and applying defensive programming, circuit breakers, retries, and bulkheads at appropriate abstraction levels.

## Best Practices

1. **Classify failure modes explicitly**: For every component, document its possible failure modes, their likelihood, and their impact. This classification drives supervision strategy selection.

2. **Separate failure handling from business logic**: Use supervisors for crash recovery, circuit breakers for dependency failures, and keep business logic functions pure.

3. **Design for restart**: Components should be designed so that restarting them is safe and efficient. Minimize process state; reconstruct from persistent sources.

4. **Set appropriate restart limits**: `max_restarts` and `max_seconds` in supervisor specifications should reflect the expected failure rate. Too aggressive leads to cascading supervisor crashes; too lenient allows repeated failures to persist.

5. **Monitor failure rates**: Track component failure rates over time. A sudden increase in failure rate often indicates a systemic issue rather than individual component problems.

6. **Test failure scenarios**: Use property-based testing and chaos engineering to verify that the system behaves correctly when components fail.

7. **Document recovery procedures**: For failures that require manual intervention, maintain runbooks that describe the diagnostic steps and recovery actions.

8. **Use telemetry for failure events**: Every component failure should emit a telemetry event that can be observed, correlated, and alerted upon.

## Common Pitfalls

1. **Catching too broadly**: Catching all exceptions and returning a default value hides failures that should be surfaced and handled by supervisors.

2. **Restart loops without backoff**: A component that crashes immediately after restart will consume supervisor restart budget rapidly, potentially bringing down the entire supervision subtree.

3. **Shared state between failure domains**: When components share ETS tables or external resources, a failure in one component can corrupt shared state, affecting others.

4. **Ignoring partial failures**: A component that returns incorrect results is more dangerous than one that crashes, because the error propagates silently.

5. **Insufficient failure isolation in tests**: Tests that pass because they run in isolation may mask failure modes that only manifest under concurrent operation.

6. **Timeout values that are too generous**: Long timeouts delay failure detection and can cause resource accumulation as requests queue up behind a non-responsive component.

7. **Not accounting for correlated failures**: Infrastructure changes (deployments, configuration updates) can cause multiple components to fail simultaneously in ways that single-component failure testing does not reveal.

## Use Cases

- **Payment processing systems** where individual transaction processors may fail but the overall system must continue processing payments with guaranteed exactly-once semantics.
- **OSINT data aggregation** where hundreds of external source adapters may fail independently due to rate limits, API changes, or network issues, but the aggregation pipeline must continue with available sources.
- **Real-time security monitoring** where sensor failures must not create blind spots in coverage, and the system must detect and report sensor failures as security events.
- **Multi-agent orchestration** where individual agent failures must not prevent other agents from completing their tasks, and failed agents must be restarted with appropriate context.
- **Database connection management** where connection pool failures, query timeouts, and connection leaks must be detected and recovered without manual intervention.

## Related Concepts

Component failures connect to many reliability and resilience concepts in the Prismatic Platform:

- [Circuit Breaker](/glossary/circuit-breaker/) -- prevents cascading failures by stopping calls to failing components
- [Supervision Tree](/glossary/supervision-tree/) -- the OTP mechanism for organizing component failure recovery hierarchies
- [Process Isolation](/glossary/process-isolation/) -- BEAM-level guarantee that process crashes do not corrupt other processes
- [Self-Healing](/glossary/self-healing/) -- autonomous detection and recovery from component failures
- [Chaos Engineering](/glossary/chaos-engineering/) -- deliberately injecting component failures to verify system resilience
- [Bulkhead Pattern](/glossary/bulkhead-pattern/) -- resource partitioning to contain the blast radius of component failures
- [Disaster Recovery](/glossary/disaster-recovery/) -- procedures for recovering from catastrophic multi-component failures
- [Reliability](/glossary/reliability/) -- the overall system property that component failure management supports
- [Controlled Failures](/glossary/controlled-failures/) -- deliberate failure injection for testing and validation
- [Process Restart](/glossary/process-restart/) -- the fundamental OTP recovery mechanism for crashed processes

## See Also

- Glossary Index -- complete listing of all platform terminology
- [BEAM VM](/glossary/beam-vm/) -- the virtual machine that provides process-level failure isolation
- [Cascade Pattern](/glossary/cascade-pattern/) -- patterns for managing how failures propagate through interconnected components
- [Backpressure](/glossary/backpressure/) -- flow control that prevents failures caused by overwhelming downstream components

---

*Built with precision. Ready for the future.*

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
