+++
title = "Unexpected Conditions"
description = "Comprehensive treatment of error handling, edge cases, defensive programming, and the let-it-crash philosophy in Elixir/OTP systems within the Prismatic Platform."
weight = 42

[extra]
category = "resilience"
tags = ["unexpected-conditions", "error-handling", "fault-tolerance", "let-it-crash", "defensive-programming", "resilience", "otp", "supervision", "edge-cases"]
related_terms = ["let-it-crash", "fault-tolerance", "error-handling", "supervision-tree", "process-isolation", "process-restart", "genserver", "otp", "circuit-breaker", "pattern-matching", "telemetry", "observability"]
keywords = ["Elixir error handling patterns", "let it crash philosophy OTP", "defensive programming Elixir", "fault tolerance BEAM", "supervision tree error recovery", "unexpected condition handling", "edge case management", "process isolation error containment", "OTP resilience patterns", "Elixir exception handling best practices"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
learning_outcomes = ["Understand the let-it-crash philosophy and its relationship to supervision trees", "Distinguish between expected errors and unexpected conditions", "Implement defensive programming patterns using pattern matching and guards", "Design supervision strategies for different failure modes", "Apply circuit breaker and back-pressure patterns", "Use telemetry to detect and respond to unexpected conditions in production"]
prerequisites = ["otp", "genserver", "supervision-tree", "pattern-matching", "error-handling"]
see_also = ["fault-tolerance", "process-isolation", "circuit-breaker", "telemetry", "observability"]
word_count = 1578
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Unexpected Conditions - Prismatic Platform"
+++

## Definition and Overview

Unexpected conditions are runtime situations that deviate from a program's intended execution path -- inputs that violate assumptions, resource failures, timing anomalies, data corruption, and environmental changes that the happy path does not anticipate. In the Prismatic Platform, unexpected conditions are not treated as exceptional events to be avoided but as inevitable realities that the system must handle gracefully through a layered strategy combining [pattern matching](/glossary/pattern-matching/), [supervision trees](/glossary/supervision-tree/), [process isolation](/glossary/process-isolation/), and the [let-it-crash](/glossary/let-it-crash/) philosophy.

The distinction between "expected errors" and "unexpected conditions" is fundamental to the Elixir/OTP approach. Expected errors (a user provides an invalid email, a database query returns no results) are part of the business domain and are handled through return values like `{:ok, result}` and `{:error, reason}`. Unexpected conditions (the database connection drops, a process receives a message it does not understand, memory allocation fails) are system-level failures that are handled through supervision and process restart. Conflating these two categories -- trying to handle system failures with business logic, or treating business errors as crashes -- is a foundational design error that the Prismatic Platform's architecture actively prevents.

The BEAM virtual machine's process model provides the foundation for unexpected condition handling. Every Elixir process runs in isolation with its own heap, stack, and garbage collector. When a process encounters an unexpected condition and crashes, it affects only that process. No other process's state is corrupted. The supervisor detects the crash and restarts the failed process with clean state. This crash-and-restart cycle, far from being a sign of poor engineering, is the primary reliability mechanism in OTP systems and enables the Prismatic Platform's five-nines availability target.

## The Let-It-Crash Philosophy

The [let-it-crash](/glossary/let-it-crash/) philosophy is widely misunderstood. It does not mean "do not handle errors." It means "do not write defensive code against conditions you cannot meaningfully recover from within the current process." Instead, let the process crash and have the supervision tree handle recovery.

### What Let-It-Crash Actually Means

| Situation | Approach | Rationale |
|-----------|----------|-----------|
| Invalid user input | Return `{:error, reason}` | Business domain -- handle explicitly |
| Missing database record | Return `{:error, :not_found}` | Business domain -- expected case |
| Database connection lost | Let it crash | System failure -- supervisor restarts with reconnection |
| Corrupt process state | Let it crash | Recovery code would operate on corrupt data |
| Unexpected message format | Let it crash | Indicates programming error -- clean restart safer |
| Out of memory in process | Let it crash | Process heap is isolated -- restart with clean heap |

### The Anti-Pattern: Defensive Exception Swallowing

```elixir
# BAD: Swallowing exceptions hides bugs and produces corrupt state
defmodule BadExample do
  @moduledoc false

  def process_order(order) do
    try do
      validate_order(order)
      calculate_total(order)
      submit_to_payment(order)
      {:ok, order}
    rescue
      _error ->
        # What failed? We do not know. What is the state? Unknown.
        # Is the order partially submitted? Maybe.
        {:error, :something_went_wrong}
    end
  end
end

# GOOD: Let each step fail explicitly, let crashes propagate
defmodule GoodExample do
  @moduledoc false

  @spec process_order(map()) :: {:ok, map()} | {:error, atom()}
  def process_order(order) do
    with {:ok, validated} <- validate_order(order),
         {:ok, totaled} <- calculate_total(validated),
         {:ok, submitted} <- submit_to_payment(totaled) do
      {:ok, submitted}
    end
    # Unknown errors (crashes) propagate to the supervisor
    # which restarts the process with clean state
  end
end
```

### When NOT to Let It Crash

The let-it-crash philosophy has boundaries. Some crashes have unacceptable consequences:

- **Data loss**: If the process holds unwritten data, ensure it is persisted (to ETS, disk, or database) before allowing crashes through that code path
- **External side effects**: If the process has initiated an external operation (payment, API call), crashing without cleanup may leave external systems in an inconsistent state
- **User-facing processes**: A LiveView process crash disconnects the user. Handle errors gracefully in LiveView event handlers and re-raise only for truly unrecoverable conditions

```elixir
defmodule PrismaticWeb.Live.OrderLive do
  @moduledoc """
  LiveView for order management.
  Handles expected errors gracefully to avoid user disconnection.
  Lets truly unexpected conditions crash (supervisor will reconnect user).
  """

  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def handle_event("submit_order", params, socket) do
    case Orders.submit(params) do
      {:ok, order} ->
        {:noreply,
         socket
         |> put_flash(:info, "Order submitted successfully")
         |> assign(:order, order)}

      {:error, :insufficient_funds} ->
        {:noreply, put_flash(socket, :error, "Insufficient funds")}

      {:error, :validation_failed} ->
        {:noreply, put_flash(socket, :error, "Please check your order details")}

      # Unknown errors crash the LiveView process.
      # Supervisor reconnects the user automatically.
      # This is intentional -- unknown errors indicate a bug.
    end
  end
end
```

## Defensive Programming with Pattern Matching

[Pattern matching](/glossary/pattern-matching/) is Elixir's primary tool for defensive programming. Unlike runtime type checks or assertions, pattern matching validates data structure at the point of use, and failed matches produce clear crash messages that identify exactly which assumption was violated.

### Function Clause Guards

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Security rating calculator with defensive pattern matching.
  Every function clause specifies exactly what input shapes it accepts.
  Unmatched inputs produce FunctionClauseError with full diagnostic info.
  """

  @type score :: 300..900
  @type grade :: :A | :B | :C | :D | :F

  @spec calculate(String.t(), keyword()) :: {:ok, %{score: score(), grade: grade()}} | {:error, atom()}
  def calculate(domain, opts \\ [])

  def calculate(domain, opts) when is_binary(domain) and byte_size(domain) > 0 and is_list(opts) do
    with {:ok, surface} <- discover_attack_surface(domain),
         {:ok, findings} <- assess_vulnerabilities(surface),
         {:ok, score} <- compute_score(findings, opts) do
      {:ok, %{score: score, grade: score_to_grade(score)}}
    end
  end

  # Empty domain string -- explicit error, not crash
  def calculate("", _opts), do: {:error, :empty_domain}

  # Non-string domain -- let it crash via FunctionClauseError
  # because passing a non-string is a programming error

  @spec score_to_grade(score()) :: grade()
  defp score_to_grade(score) when score >= 800, do: :A
  defp score_to_grade(score) when score >= 650, do: :B
  defp score_to_grade(score) when score >= 500, do: :C
  defp score_to_grade(score) when score >= 350, do: :D
  defp score_to_grade(_score), do: :F
end
```

### Map Access Safety

The Prismatic Platform forbids unsafe map access (using `map.key` syntax on non-struct maps) because it raises `KeyError` on missing keys with unhelpful error messages. All map access must use `Map.get/3`, `Map.fetch!/2`, or pattern matching:

```elixir
# BAD: Unsafe map access -- raises KeyError with no context
defmodule UnsafeAccess do
  @moduledoc false

  def get_name(user) do
    user.name  # KeyError if :name missing, no indication of which map
  end
end

# GOOD: Pattern match destructuring -- clear failure message
defmodule SafeAccess do
  @moduledoc false

  @spec get_name(%{name: String.t()}) :: String.t()
  def get_name(%{name: name}) when is_binary(name), do: name

  @spec get_name_with_default(map()) :: String.t()
  def get_name_with_default(user) do
    Map.get(user, :name, "Unknown")
  end

  @spec get_name_required(map()) :: {:ok, String.t()} | {:error, :missing_name}
  def get_name_required(user) do
    case Map.fetch(user, :name) do
      {:ok, name} -> {:ok, name}
      :error -> {:error, :missing_name}
    end
  end
end
```

## Supervision Strategies for Failure Modes

Different [supervision](/glossary/supervision-tree/) strategies correspond to different failure mode assumptions. The choice of strategy communicates which processes are independent and which share fate.

### Strategy Selection Guide

| Strategy | When to Use | Example |
|----------|-------------|---------|
| `:one_for_one` | Processes are independent | Pool of worker processes |
| `:one_for_all` | All processes share state/dependencies | Database + cache + indexer |
| `:rest_for_one` | Sequential dependency chain | Producer -> consumer -> aggregator |

### Prismatic Platform Supervision Example

```elixir
defmodule PrismaticPerimeter.Supervisor do
  @moduledoc """
  Top-level supervisor for the Perimeter (EASM) application.

  Supervision strategy: :rest_for_one because the scanner depends
  on the registry, and the rating engine depends on the scanner.
  Restarting the registry must also restart downstream processes.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  @spec init(keyword()) :: {:ok, {Supervisor.sup_flags(), [Supervisor.child_spec()]}}
  def init(_opts) do
    children = [
      # Asset registry must start first -- other processes depend on it
      {PrismaticPerimeter.AssetRegistry, []},
      # Scanner depends on registry for asset storage
      {PrismaticPerimeter.Scanner, []},
      # Rating engine depends on scanner results
      {PrismaticPerimeter.RatingEngine, []},
      # Compliance checker depends on rating data
      {PrismaticPerimeter.ComplianceChecker, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one, max_restarts: 5, max_seconds: 60)
  end
end
```

### Restart Intensity Configuration

The `max_restarts` and `max_seconds` parameters control how aggressively the supervisor retries before giving up. Setting these too high masks persistent failures; setting them too low causes unnecessary escalation.

| Use Case | max_restarts | max_seconds | Rationale |
|----------|-------------|-------------|-----------|
| Transient network issues | 5 | 60 | Retries over a minute, then escalates |
| Database connections | 3 | 30 | Connection pools have their own retry logic |
| Worker processes | 10 | 60 | Workers are cheap to restart |
| Critical singletons | 3 | 10 | If it fails 3 times in 10 seconds, something is fundamentally wrong |

## Circuit Breaker Pattern

The [circuit breaker](/glossary/circuit-breaker/) pattern prevents cascading failures when an external dependency fails. Instead of repeatedly attempting operations that will fail, the circuit breaker opens and returns an immediate error, giving the dependency time to recover.

```elixir
defmodule PrismaticPerimeter.CircuitBreaker do
  @moduledoc """
  Circuit breaker for external service calls.
  States: :closed (normal), :open (failing), :half_open (testing recovery).
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @type circuit :: %{
    state: state(),
    failure_count: non_neg_integer(),
    last_failure: DateTime.t() | nil,
    threshold: pos_integer(),
    reset_timeout_ms: pos_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec call(GenServer.server(), (-> term())) :: {:ok, term()} | {:error, :circuit_open}
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @impl GenServer
  def init(opts) do
    {:ok, %{
      state: :closed,
      failure_count: 0,
      last_failure: nil,
      threshold: Keyword.get(opts, :threshold, 5),
      reset_timeout_ms: Keyword.get(opts, :reset_timeout_ms, 30_000)
    }}
  end

  @impl GenServer
  def handle_call({:execute, _fun}, _from, %{state: :open} = circuit) do
    if should_attempt_reset?(circuit) do
      {:reply, {:error, :circuit_half_open}, %{circuit | state: :half_open}}
    else
      {:reply, {:error, :circuit_open}, circuit}
    end
  end

  def handle_call({:execute, fun}, _from, circuit) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{circuit | state: :closed, failure_count: 0}}

      {:error, reason} ->
        new_count = circuit.failure_count + 1

        new_state =
          if new_count >= circuit.threshold, do: :open, else: circuit.state

        :telemetry.execute(
          [:prismatic, :circuit_breaker, :failure],
          %{count: new_count},
          %{state: new_state, reason: reason}
        )

        {:reply, {:error, reason},
         %{circuit | state: new_state, failure_count: new_count, last_failure: DateTime.utc_now()}}
    end
  end

  defp safe_execute(fun) do
    {:ok, fun.()}
  rescue
    error -> {:error, error}
  end

  defp should_attempt_reset?(%{last_failure: nil}), do: true
  defp should_attempt_reset?(%{last_failure: last, reset_timeout_ms: timeout}) do
    DateTime.diff(DateTime.utc_now(), last, :millisecond) >= timeout
  end
end
```

## Error Classification Taxonomy

The Prismatic Platform classifies errors into four categories, each with a distinct handling strategy:

### Category 1: Business Domain Errors

These are expected outcomes of business operations that the user or caller needs to know about. They are communicated through tagged tuples and never cause process crashes.

```elixir
@spec validate_domain(String.t()) :: {:ok, String.t()} | {:error, validation_error()}
def validate_domain(domain) do
  cond do
    String.length(domain) == 0 -> {:error, :empty_domain}
    not String.contains?(domain, ".") -> {:error, :invalid_format}
    String.length(domain) > 253 -> {:error, :domain_too_long}
    true -> {:ok, String.downcase(domain)}
  end
end
```

### Category 2: Infrastructure Failures

These are transient failures in external dependencies -- database timeouts, network errors, API rate limits. They are handled through retry logic, circuit breakers, and supervisor restarts.

### Category 3: Programming Errors

These are bugs -- pattern match failures, function clause errors, type mismatches. They crash the process immediately. The crash log provides diagnostic information. The supervisor restarts the process. The bug is fixed in the next deployment.

### Category 4: Resource Exhaustion

These are capacity failures -- memory exhaustion, file descriptor limits, connection pool depletion. They are detected through [telemetry](/glossary/telemetry/) and [health monitoring](/glossary/health-monitoring/) and addressed through scaling, throttling, or load shedding.

## Telemetry for Unexpected Condition Detection

[Telemetry](/glossary/telemetry/) is the primary mechanism for detecting unexpected conditions in production before they become user-visible failures:

```elixir
defmodule PrismaticTelemetry.ErrorTracker do
  @moduledoc """
  Telemetry handler for tracking unexpected conditions across the platform.
  Attaches to process exit events and GenServer crash events.
  """

  @spec attach() :: :ok
  def attach do
    events = [
      [:prismatic, :genserver, :crash],
      [:prismatic, :circuit_breaker, :failure],
      [:prismatic, :supervisor, :restart],
      [:prismatic, :http, :error]
    ]

    :telemetry.attach_many(
      "prismatic-error-tracker",
      events,
      &handle_event/4,
      %{}
    )
  end

  @spec handle_event(list(), map(), map(), map()) :: :ok
  def handle_event([:prismatic, :supervisor, :restart], measurements, metadata, _config) do
    if measurements.restart_count > 3 do
      Logger.warning("High restart rate detected",
        module: metadata.module,
        restart_count: measurements.restart_count,
        window_seconds: measurements.window_seconds
      )
    end

    :ok
  end

  def handle_event([:prismatic, :circuit_breaker, :failure], measurements, metadata, _config) do
    Logger.warning("Circuit breaker failure",
      state: metadata.state,
      failure_count: measurements.count,
      reason: inspect(metadata.reason)
    )

    :ok
  end
end
```

## Edge Case Categories

Understanding the taxonomy of edge cases helps engineers anticipate unexpected conditions during design rather than discovering them in production.

### Data Edge Cases

| Category | Examples | Mitigation |
|----------|----------|------------|
| Empty inputs | Empty strings, empty lists, nil values | Pattern match on structure |
| Boundary values | Integer max/min, zero, negative numbers | Guard clauses with ranges |
| Unicode | Multi-byte characters, zero-width joiners, RTL text | Binary-safe operations |
| Large inputs | Multi-MB strings, million-element lists | Stream processing, size limits |
| Concurrent modifications | Two processes updating same record | Optimistic locking, serialization |

### Timing Edge Cases

| Category | Examples | Mitigation |
|----------|----------|------------|
| Race conditions | Check-then-act on shared state | Serialize through GenServer |
| Timeouts | Slow external APIs, network latency | Configurable timeouts, circuit breakers |
| Clock skew | Different nodes report different times | UTC everywhere, NTP synchronization |
| Ordering | Messages arrive out of order | Sequence numbers, event sourcing |

### Resource Edge Cases

| Category | Examples | Mitigation |
|----------|----------|------------|
| Memory pressure | Large data structures in process heap | ETS for large data, streaming |
| Connection limits | Database pool exhaustion | Queue-based back-pressure |
| File descriptors | Too many open sockets | Connection pooling, limits |
| Disk space | Log growth, temp file accumulation | Rotation, cleanup, monitoring |

## Production Patterns in Prismatic Platform

### Session Lifecycle Circuit Breaker

The `PrismaticClaude.SessionLifecycle` GenServer implements a circuit breaker to prevent cascading failures from flaky mix tasks:

```elixir
# When a session hook fails 3 times within 60 seconds,
# the circuit opens and subsequent hooks return {:error, :circuit_open}
# until the reset timeout expires.
# This prevents a single broken hook from blocking all session operations.

@failure_threshold 3
@reset_timeout :timer.seconds(60)
```

### Quality Floor Guardian

The `QualityFloorGuardian` monitors quality metrics and triggers automatic responses when unexpected degradation is detected:

| Quality Level | Response |
|--------------|----------|
| 100-99% | OPTIMAL -- monitor only |
| 98-99% | WARNING -- alert and investigation |
| 95-98% | CRITICAL -- auto-evolution trigger |
| < 95% | EMERGENCY -- block commits and escalate |

## Best Practices

**Classify errors before handling them.** Determine whether a condition is a business error (return tagged tuple), infrastructure failure (retry/circuit-break), programming error (crash), or resource issue (monitor/scale) before writing handling code. The wrong classification leads to the wrong strategy.

**Prefer pattern matching over conditional checks.** Pattern matching in function heads validates data structure at zero cost and produces specific error messages. Conditional checks (`if is_map(x) and Map.has_key?(x, :name)`) are verbose, error-prone, and produce generic errors.

**Design supervision trees before writing processes.** The supervision tree is the error handling architecture. Deciding which processes are siblings (restart together), which are independent (restart individually), and which form chains (restart sequentially) is a design-time decision, not an afterthought.

**Use telemetry to detect patterns.** A single process crash is a transient event. Three crashes of the same process in a minute is a pattern that needs investigation. Telemetry enables pattern detection that would be invisible at the individual crash level.

**Test unexpected conditions explicitly.** Write tests that provide invalid inputs, simulate timeouts, inject failures into dependencies, and verify that the system degrades gracefully rather than catastrophically.

## Common Pitfalls

**Catching exceptions too broadly.** A `rescue` clause that catches `RuntimeError` or `Exception` hides specific failure information and may catch errors that should propagate. Catch only the specific exceptions you can meaningfully handle.

**Retrying without back-off.** Immediate retry loops against a failing service amplify the load on that service, making recovery harder. Always use exponential back-off with jitter.

**Ignoring process mailbox growth.** When a GenServer cannot keep up with incoming messages, the mailbox grows unboundedly. Monitor mailbox size through telemetry and implement back-pressure before memory exhaustion causes an OOM crash.

**Treating all crashes as bugs.** In OTP systems, process restarts are a normal part of operation. A process that crashes and restarts cleanly is operating as designed. Focus investigation on crash patterns (repeated crashes, cascading restarts) rather than individual crash events.

## Related Concepts

- [Let-It-Crash](/glossary/let-it-crash/) -- The OTP philosophy underlying unexpected condition handling
- [Fault Tolerance](/glossary/fault-tolerance/) -- System-level resilience through isolation and redundancy
- [Error Handling](/glossary/error-handling/) -- Pattern-based error management in Elixir
- [Supervision Tree](/glossary/supervision-tree/) -- Process monitoring and restart infrastructure
- [Process Isolation](/glossary/process-isolation/) -- BEAM's per-process heap and failure containment
- [Process Restart](/glossary/process-restart/) -- Clean state restoration after crashes
- [Circuit Breaker](/glossary/circuit-breaker/) -- Pattern for preventing cascading dependency failures
- [GenServer](/glossary/genserver/) -- OTP behaviour providing process state management
- [Telemetry](/glossary/telemetry/) -- Metrics and events for detecting unexpected conditions
- [Observability](/glossary/observability/) -- Production visibility into system behavior

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Umbrella applications implementing these patterns
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
