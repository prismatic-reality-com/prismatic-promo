+++
title = "Circuit Breaker"
weight = 29
[extra]
category = "pattern"
description = "Resilience pattern that prevents cascading failures by temporarily halting requests to a failing service, allowing it time to recover before resuming normal operation."
related_terms = ["otp", "supervisor", "seadf", "chaos-engineering", "fault-tolerance", "let-it-crash", "backpressure", "self-healing", "observability", "rate-limiting", "distributed-system"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1250
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Circuit", "Breaker", "Resilience", "glossary", "pattern", "Prismatic Platform", "Backpressure"]
tags = ["glossary", "pattern", "circuit-breaker", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Circuit Breaker - Prismatic Platform"
+++

## Definition

The circuit breaker pattern is a stability mechanism borrowed from electrical engineering: when a downstream service or component begins failing repeatedly, the circuit breaker "opens" to stop sending requests, preventing cascading failures and allowing the failing component time to recover. After a configurable timeout, the breaker enters a "half-open" state, allowing a limited number of test requests through to determine if the service has recovered. If the test succeeds, the breaker "closes" and normal operation resumes. If the test fails, the breaker re-opens.

The pattern addresses a specific class of failure that [supervisor](/glossary/supervisor/) restarts alone cannot handle: slow or degraded external dependencies. When an API endpoint responds with 30-second timeouts instead of crashing immediately, the calling process does not crash -- it blocks. Without a circuit breaker, the calling system accumulates blocked processes, exhausts its connection pool, and eventually becomes unresponsive itself. The failure cascades from the degraded dependency through every system that depends on it.

Circuit breakers are the immune system's tourniquet: when a wound is bleeding, the first response is to stop the bleeding (open the circuit) rather than continuing to send blood (requests) to the damaged area. Once the wound heals (dependency recovers), blood flow is cautiously restored (half-open probing).

## The State Machine

The circuit breaker operates as a finite state machine with three states and well-defined transitions between them. Understanding the state machine is essential for configuring breakers correctly.

```
                 failure_count >= threshold
    +--------+  ─────────────────────────>  +------+
    | CLOSED |                              | OPEN |
    +--------+  <─────────────────────────  +------+
         ^       test_request succeeds          |
         |                                      |
         |       +───────────+                  |
         +─ ─ ─ ─| HALF-OPEN |<── ── ── ── ── ─+
          success +───────────+  recovery_timeout
                       |
                       | test_request fails
                       v
                    +------+
                    | OPEN |
                    +------+
```

### Closed State (Normal Operation)

In the closed state, all requests pass through the circuit breaker to the downstream service. The breaker monitors each request's outcome:

- **Success**: The failure counter is reset to zero (or decremented, depending on implementation)
- **Failure**: The failure counter is incremented
- **Threshold Reached**: When the counter reaches the configured threshold, the breaker transitions to the open state

The closed state is the default and desirable state. The circuit breaker adds minimal overhead -- typically a counter check that takes nanoseconds.

### Open State (Failing Fast)

In the open state, requests are **immediately rejected** without attempting the downstream call. This is the key protective behavior: rather than waiting for a timeout, the calling code receives an immediate failure response (`{:error, :circuit_open}`). This prevents resource exhaustion and provides fast feedback to upstream callers.

The open state starts a recovery timer. When the timer expires (after the configured `recovery_timeout`), the breaker transitions to the half-open state.

### Half-Open State (Recovery Probing)

In the half-open state, a **limited number of test requests** are allowed through to the downstream service. The breaker observes the outcome:

- **Success**: The downstream service has recovered. The breaker transitions to the closed state. Normal operation resumes.
- **Failure**: The downstream service is still failing. The breaker transitions back to the open state. The recovery timer restarts.

The half-open state prevents the system from oscillating between full load and no load on a recovering service. By allowing only a trickle of test requests, it probes recovery without overwhelming the recovering service.

## State Configuration Parameters

| Parameter | Description | Typical Range | Prismatic Default |
|-----------|-------------|---------------|-------------------|
| `failure_threshold` | Failures before opening | 3-10 | 3 |
| `recovery_timeout` | Duration in open state before half-open probe | 10s-300s | 60s |
| `half_open_max_calls` | Test requests allowed in half-open | 1-5 | 1 |
| `failure_window` | Time window for counting failures (sliding window) | 30s-300s | 60s |
| `success_threshold` | Successes in half-open before closing | 1-3 | 1 |
| `excluded_exceptions` | Errors that do not count toward threshold | App-specific | `[:not_found, :bad_request]` |

The `excluded_exceptions` parameter is particularly important: not all errors indicate a service failure. A 404 Not Found response means the requested resource does not exist, not that the service is down. A 400 Bad Request means the caller sent invalid input. These should not count toward the failure threshold.

## Implementation in Elixir

The Prismatic Platform implements circuit breakers as GenServer processes that wrap downstream calls. This approach leverages OTP's process model: each circuit breaker is a supervised process with its own state, failure counters, and timers.

```elixir
defmodule PrismaticResilience.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation using GenServer state machine.
  Protects downstream services from cascading failures.
  """
  use GenServer

  defstruct [
    :name,
    :state,
    :failure_count,
    :failure_threshold,
    :recovery_timeout,
    :last_failure_time,
    :half_open_calls
  ]

  @type state :: :closed | :open | :half_open

  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl GenServer
  def init(opts) do
    breaker = %__MODULE__{
      name: Keyword.fetch!(opts, :name),
      state: :closed,
      failure_count: 0,
      failure_threshold: Keyword.get(opts, :failure_threshold, 3),
      recovery_timeout: Keyword.get(opts, :recovery_timeout, :timer.seconds(60)),
      last_failure_time: nil,
      half_open_calls: 0
    }

    {:ok, breaker}
  end

  @spec call(GenServer.server(), (-> result)) :: {:ok, result} | {:error, :circuit_open}
        when result: term()
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @impl GenServer
  def handle_call({:execute, fun}, _from, %{state: :open} = breaker) do
    if recovery_timeout_elapsed?(breaker) do
      # Transition to half-open: allow one test request
      execute_half_open(fun, %{breaker | state: :half_open, half_open_calls: 1})
    else
      # Still in open state: fail immediately
      emit_telemetry(:rejected, breaker)
      {:reply, {:error, :circuit_open}, breaker}
    end
  end

  def handle_call({:execute, fun}, _from, %{state: :closed} = breaker) do
    case execute_safely(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, reset_failures(breaker)}

      {:error, reason} ->
        updated = record_failure(breaker)

        if updated.failure_count >= updated.failure_threshold do
          emit_telemetry(:opened, updated)
          {:reply, {:error, reason}, %{updated | state: :open}}
        else
          {:reply, {:error, reason}, updated}
        end
    end
  end

  def handle_call({:execute, fun}, _from, %{state: :half_open} = breaker) do
    execute_half_open(fun, breaker)
  end

  defp execute_half_open(fun, breaker) do
    case execute_safely(fun) do
      {:ok, result} ->
        emit_telemetry(:closed, breaker)
        {:reply, {:ok, result}, %{breaker | state: :closed, failure_count: 0}}

      {:error, reason} ->
        emit_telemetry(:reopened, breaker)
        {:reply, {:error, reason}, %{breaker | state: :open, last_failure_time: now()}}
    end
  end

  defp execute_safely(fun) do
    try do
      {:ok, fun.()}
    rescue
      error -> {:error, error}
    catch
      :exit, reason -> {:error, {:exit, reason}}
    end
  end

  defp emit_telemetry(event, breaker) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, event],
      %{count: 1},
      %{name: breaker.name, state: breaker.state, failures: breaker.failure_count}
    )
  end

  defp record_failure(breaker) do
    %{breaker | failure_count: breaker.failure_count + 1, last_failure_time: now()}
  end

  defp reset_failures(breaker), do: %{breaker | failure_count: 0}
  defp now, do: System.monotonic_time(:millisecond)

  defp recovery_timeout_elapsed?(%{last_failure_time: nil}), do: true
  defp recovery_timeout_elapsed?(breaker) do
    now() - breaker.last_failure_time >= breaker.recovery_timeout
  end
end
```

## Circuit Breakers in Prismatic

The Prismatic Platform uses circuit breakers at several critical boundaries:

| Boundary | Breaker Config | Protected Resource | Failure Mode |
|----------|---------------|-------------------|--------------|
| **SessionLifecycle Hooks** | 3 failures / 60s recovery | Mix task execution during session | Flaky mix tasks blocking session operations |
| **External OSINT APIs** | 5 failures / 120s recovery | [Shodan](/glossary/shodan/), [Censys](/glossary/censys/), [GreyNoise](/glossary/greynoise/) | API rate limiting, outages, timeout |
| **Database Connections** | 3 failures / 30s recovery | [PostgreSQL](/glossary/postgresql/) connection pool | Connection pool exhaustion, replication lag |
| **LLM Provider** | 3 failures / 60s recovery | [Ollama](/glossary/ollama/) local inference | Model loading, memory pressure, GPU contention |
| **Redis Cache** | 5 failures / 15s recovery | [Redis](/glossary/redis/) cache layer | Network partition, memory limits |

The SessionLifecycle circuit breaker is the most prominent example in the codebase. It protects session operations from flaky mix tasks (like `mix autoheal.baseline` or `mix quality.gates.check`) that might time out or fail during compilation. When the breaker opens, session hooks are skipped entirely rather than blocking the session with repeated timeout failures.

## Telemetry Integration

Every circuit breaker state transition emits telemetry events through Erlang's `:telemetry` library. This integration provides [observability](/glossary/observability/) into breaker behavior and enables automated responses.

| Event | Emitted When | Metadata |
|-------|-------------|----------|
| `[:prismatic, :circuit_breaker, :opened]` | Breaker transitions from closed to open | Breaker name, failure count, threshold |
| `[:prismatic, :circuit_breaker, :closed]` | Breaker transitions from half-open to closed | Breaker name, recovery duration |
| `[:prismatic, :circuit_breaker, :reopened]` | Breaker transitions from half-open back to open | Breaker name, test failure reason |
| `[:prismatic, :circuit_breaker, :rejected]` | Request rejected due to open circuit | Breaker name, time since opening |

These telemetry events feed into the platform's [structured logging](/glossary/structured-logging/) and metrics systems. Dashboard panels track breaker state across all protected boundaries. Alerts trigger when breakers remain open for extended periods, indicating persistent dependency failures that may require human intervention.

## Relationship to Backpressure

[Backpressure](/glossary/backpressure/) and circuit breakers are complementary resilience patterns that address different failure modes:

| Dimension | Circuit Breaker | Backpressure |
|-----------|----------------|--------------|
| **Failure type** | Binary failure (service up/down) | Capacity failure (service overwhelmed) |
| **Response** | Stop all requests (open circuit) | Slow down request rate (demand reduction) |
| **Recovery** | Probe with test requests (half-open) | Gradually increase demand |
| **Scope** | External boundary protection | Internal pipeline flow control |
| **Granularity** | All-or-nothing (requests pass or fail) | Graduated (demand adjusts continuously) |

In practice, the two patterns often work together. A [data pipeline](/glossary/data-pipeline/) uses backpressure to regulate flow between internal stages and circuit breakers to protect against external dependency failures at the pipeline's edges.

## Relationship to Fault Tolerance

Circuit breakers are one layer in the Prismatic Platform's multi-layered [fault tolerance](/glossary/fault-tolerance/) strategy:

- **Process isolation** prevents memory corruption across boundaries
- **Supervisors** restart crashed processes with clean state
- **Circuit breakers** prevent cascading failures from slow dependencies
- **[Self-healing](/glossary/self-healing/)** diagnoses and corrects persistent issues
- **[Backpressure](/glossary/backpressure/)** prevents resource exhaustion from load spikes

Each layer handles a different failure class. Circuit breakers specifically address the class of failures that supervisors cannot: dependencies that are not crashing (which would trigger a supervisor restart) but are degraded (responding slowly, returning errors, or timing out). Without circuit breakers, these "gray failures" can be more destructive than clean crashes because they consume resources without triggering recovery mechanisms.

## Related Terms

- [Fault Tolerance](/glossary/fault-tolerance/) -- System property that circuit breakers help maintain
- [Supervisor](/glossary/supervisor/) -- Complementary resilience pattern for process crashes
- [Let It Crash](/glossary/let-it-crash/) -- Philosophy handling clean failures; circuit breakers handle gray failures
- [Backpressure](/glossary/backpressure/) -- Complementary pattern for flow control under load
- [Self-Healing](/glossary/self-healing/) -- Higher-level recovery that may be triggered by persistent open circuits
- [OTP](/glossary/otp/) -- Framework providing the process model for circuit breaker implementation
- [Observability](/glossary/observability/) -- Monitoring infrastructure tracking circuit breaker state
- [Rate Limiting](/glossary/rate-limiting/) -- Related pattern controlling request volume proactively
- [SEADF](/glossary/seadf/) -- Framework integrating circuit breakers into self-healing cycles
- [Chaos Engineering](/glossary/chaos-engineering/) -- Testing methodology that validates circuit breaker effectiveness
- [Distributed System](/glossary/distributed-system/) -- Systems where circuit breakers protect network boundaries
- [Structured Logging](/glossary/structured-logging/) -- Logging system recording circuit breaker events

## See Also

- [prismatic_ollama](../../../apps/prismatic_ollama/README.md) -- Circuit breaker for Ollama connection failures
- [prismatic_claude](../../../apps/prismatic_claude/README.md) -- Circuit breaker in SessionLifecycle GenServer
- [prismatic_supervisor](../../../apps/prismatic_supervisor/README.md) -- Supervision with circuit breaker integration
- [prismatic_crawler](../../../apps/prismatic_crawler/README.md) -- Web crawler with circuit breaker for target sites
- [Architecture](/architecture/) -- Platform resilience architecture
- [Capabilities](/capabilities/) -- Platform fault tolerance capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)