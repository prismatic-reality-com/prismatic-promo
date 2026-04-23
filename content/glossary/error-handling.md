+++
title = "Error Handling"
weight = 50
[extra]
description = "Techniques and patterns for detecting, reporting, and recovering from errors during program execution, including Elixir's tagged tuple patterns, supervision-based recovery, and circuit breaker mechanisms"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "software-engineering"
related_concepts = ["fault-tolerance", "let-it-crash", "supervisor", "circuit-breaker", "retry-pattern", "exponential-backoff", "supervision-tree"]
implementation_status = "production"
authority_level = "platform-standard"
difficulty_rating = 5
prerequisites = ["elixir", "otp", "pattern-matching", "genserver"]
learning_path = ["pattern-matching", "error-handling", "let-it-crash", "supervisor", "circuit-breaker", "fault-tolerance"]
interactive_demos = ["/labs/glossary/error-handling"]
code_examples = ["Tagged tuple error handling", "with-clause chains", "Circuit breaker GenServer", "Supervisor restart strategies"]
external_resources = ["https://hexdocs.pm/elixir/main/error-handling.html", "https://ferd.ca/it-s-about-the-guarantees.html", "https://erlang.org/doc/design_principles/des_princ.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["error propagation verification", "supervisor restart under failure", "circuit breaker state transitions", "graceful degradation paths"]
keywords = ["error handling", "fault tolerance", "let it crash", "supervision", "circuit breaker", "retry", "exponential backoff", "tagged tuples", "with clause"]
tags = ["glossary", "core", "error-handling", "fault-tolerance", "elixir", "otp", "resilience"]
related_terms = ["fault-tolerance", "let-it-crash", "supervisor", "circuit-breaker", "retry-pattern", "exponential-backoff", "supervision-tree", "pattern-matching", "genserver", "beam", "observability", "telemetry"]
word_count = 1594
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Error Handling - Prismatic Platform"
+++

## Definition

Error handling encompasses the techniques, patterns, and architectural decisions for detecting, reporting, classifying, and recovering from errors during program execution. It addresses the fundamental reality that software systems operate in imperfect environments: networks fail, disks fill, inputs are malformed, dependencies become unavailable, and logic contains bugs.

In the Elixir/BEAM ecosystem that powers the Prismatic Platform, error handling follows a distinctive philosophy that differs fundamentally from mainstream languages. Rather than wrapping every operation in try/catch blocks and attempting to handle every possible error at the point of occurrence, Elixir embraces a layered approach: expected errors are handled with tagged tuples (`{:ok, value}` / `{:error, reason}`), unexpected errors are allowed to crash the process, and [Supervisor](/glossary/supervisor/) processes automatically restart failed processes in a known good state. This is the [Let It Crash](/glossary/let-it-crash/) philosophy.

## Overview

Error handling strategies exist on a spectrum from fully defensive (handle every possible error at every call site) to fully supervisory (let errors propagate and recover at a higher level). Most languages push toward the defensive end: Java's checked exceptions force callers to handle errors, Go's explicit error returns require checking after every call, Rust's Result type makes the happy path and error path equally explicit.

Elixir and Erlang take a different position on this spectrum, distinguishing between two fundamentally different categories of errors:

**Expected errors** (business logic failures): A user provides invalid input, a database record is not found, an API returns a 404. These are not bugs -- they are normal system behavior that the application logic must handle. In Elixir, these are represented as `{:error, reason}` tuples and handled with pattern matching, `case`, and `with` expressions.

**Unexpected errors** (system failures): A database connection drops, a NIF segfaults, a process receives a malformed message. These are not anticipated by the application logic. Rather than writing speculative error handling code at the call site, Elixir allows the process to crash. The [Supervision Tree](/glossary/supervision-tree/) detects the crash and restarts the process.

This separation is powerful because it focuses error handling effort where it matters (expected errors in business logic) while providing automatic recovery for unexpected failures (supervision). The result is less error handling code that handles more errors correctly.

### The Error Handling Pyramid

```
                    +-----------------+
                    | Application     |  Supervision trees, graceful
                    | Architecture    |  degradation, circuit breakers
                    +--------+--------+
                             |
                    +--------v--------+
                    | Process Level   |  Let-it-crash, supervisor
                    | Recovery        |  restarts, process isolation
                    +--------+--------+
                             |
                    +--------v--------+
                    | Function Level  |  {:ok,_}/{:error,_} tuples,
                    | Error Returns   |  with clauses, pattern matching
                    +--------+--------+
                             |
                    +--------v--------+
                    | Exception Level |  try/rescue for boundary code,
                    | (Rare)          |  library interop, FFI errors
                    +--------+--------+
```

## Technical Details

### Tagged Tuple Pattern

The foundation of Elixir error handling is the tagged tuple convention:

```elixir
# Success case
{:ok, value}

# Error case
{:error, reason}

# Usage with pattern matching
case Database.fetch(id) do
  {:ok, record} ->
    process_record(record)

  {:error, :not_found} ->
    handle_not_found(id)

  {:error, :connection_lost} ->
    retry_or_fallback(id)
end
```

This pattern is not enforced by the compiler (unlike Rust's Result type) but is a universal convention in the Elixir ecosystem. Functions that can fail return tagged tuples; functions that should never fail (or whose failure indicates a bug) return plain values or raise exceptions.

### The `with` Expression

For chaining multiple operations that may fail, the `with` expression provides clean error propagation:

```elixir
with {:ok, user} <- authenticate(credentials),
     {:ok, account} <- fetch_account(user.id),
     {:ok, balance} <- check_balance(account, amount),
     {:ok, transaction} <- execute_transfer(account, recipient, amount) do
  {:ok, transaction}
else
  {:error, :invalid_credentials} -> {:error, :authentication_failed}
  {:error, :account_not_found} -> {:error, :account_not_found}
  {:error, :insufficient_funds} -> {:error, :insufficient_funds}
  {:error, reason} -> {:error, {:transfer_failed, reason}}
end
```

The `with` expression short-circuits on the first non-matching clause, propagating the error to the `else` block. This avoids deeply nested `case` expressions while maintaining explicit error handling.

### Exception Handling

Elixir provides try/rescue/catch for exceptional situations, but their use should be rare:

```elixir
# Use for boundary code (external libraries, FFI, JSON parsing)
try do
  Jason.decode!(untrusted_json)
rescue
  Jason.DecodeError ->
    {:error, :invalid_json}
end

# NEVER do this in business logic
# This is anti-pattern in Elixir:
try do
  result = risky_operation()
  {:ok, result}
rescue
  e -> {:error, e}
end
```

The convention is: use tagged tuples for expected errors, let unexpected errors crash the process, and use try/rescue only at system boundaries where external code may raise.

### Error Classification

Prismatic classifies errors into four categories with different handling strategies:

| Category | Examples | Strategy |
|----------|----------|----------|
| **Transient** | Network timeout, DB connection reset | Retry with [Exponential Backoff](/glossary/exponential-backoff/) |
| **Permanent** | Invalid input, missing resource | Return error, do not retry |
| **Degraded** | External API down, cache miss | [Circuit Breaker](/glossary/circuit-breaker/), fallback |
| **Fatal** | Corrupted state, unrecoverable | Crash process, supervisor restarts |

## Implementation in Prismatic Platform

### Error Handling Module

```elixir
defmodule Prismatic.ErrorHandling do
  @moduledoc """
  Centralized error handling utilities for the Prismatic Platform.
  Provides standardized error formatting, classification, and
  reporting across all 115 umbrella applications.
  """

  alias Prismatic.Telemetry.ErrorReporter

  @type error_class :: :transient | :permanent | :degraded | :fatal
  @type error_context :: %{
    module: module(),
    function: atom(),
    args_summary: String.t(),
    timestamp: DateTime.t(),
    node: node(),
    process: pid()
  }

  @type classified_error :: %{
    class: error_class(),
    reason: term(),
    context: error_context(),
    retry_eligible: boolean(),
    fallback_available: boolean()
  }

  @spec classify_error(term(), error_context()) :: classified_error()
  def classify_error(reason, context) do
    class = determine_class(reason)

    %{
      class: class,
      reason: reason,
      context: context,
      retry_eligible: class in [:transient, :degraded],
      fallback_available: class == :degraded
    }
  end

  @spec handle_classified_error(classified_error()) ::
    {:retry, keyword()} | {:fallback, atom()} | {:error, term()} | :crash
  def handle_classified_error(%{class: :transient} = error) do
    ErrorReporter.report(error, severity: :warning)
    {:retry, max_attempts: 3, backoff: :exponential}
  end

  def handle_classified_error(%{class: :permanent} = error) do
    ErrorReporter.report(error, severity: :info)
    {:error, error.reason}
  end

  def handle_classified_error(%{class: :degraded} = error) do
    ErrorReporter.report(error, severity: :warning)
    {:fallback, determine_fallback(error)}
  end

  def handle_classified_error(%{class: :fatal} = error) do
    ErrorReporter.report(error, severity: :critical)
    :crash
  end

  @spec determine_class(term()) :: error_class()
  defp determine_class(reason) do
    case reason do
      :timeout -> :transient
      :econnrefused -> :transient
      :econnreset -> :transient
      {:timeout, _} -> :transient
      :nxdomain -> :permanent
      :not_found -> :permanent
      {:invalid, _} -> :permanent
      :service_unavailable -> :degraded
      {:dependency_down, _} -> :degraded
      :corrupted_state -> :fatal
      _ -> :permanent
    end
  end

  @spec determine_fallback(classified_error()) :: atom()
  defp determine_fallback(%{reason: :service_unavailable}), do: :cached_response
  defp determine_fallback(%{reason: {:dependency_down, _}}), do: :degraded_mode
  defp determine_fallback(_), do: :default_response
end
```

### Circuit Breaker Implementation

```elixir
defmodule Prismatic.CircuitBreaker do
  @moduledoc """
  Circuit breaker pattern implementation protecting against
  cascading failures from unreliable external dependencies.

  States:
  - :closed   - Normal operation, requests pass through
  - :open     - Failure threshold exceeded, requests fail fast
  - :half_open - Testing recovery, limited requests allowed
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @type circuit_config :: %{
    failure_threshold: pos_integer(),
    reset_timeout_ms: pos_integer(),
    half_open_max_calls: pos_integer(),
    name: atom()
  }

  @default_config %{
    failure_threshold: 5,
    reset_timeout_ms: 30_000,
    half_open_max_calls: 3
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    config = Map.merge(@default_config, Map.new(opts))
    GenServer.start_link(__MODULE__, config, name: name)
  end

  @spec call(atom(), (-> {:ok, term()} | {:error, term()})) ::
    {:ok, term()} | {:error, :circuit_open} | {:error, term()}
  def call(name, fun) when is_function(fun, 0) do
    GenServer.call(name, {:execute, fun})
  end

  @spec get_state(atom()) :: {state(), map()}
  def get_state(name) do
    GenServer.call(name, :get_state)
  end

  @impl true
  def init(config) do
    state = %{
      circuit_state: :closed,
      failure_count: 0,
      success_count: 0,
      half_open_calls: 0,
      last_failure_time: nil,
      config: config
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:execute, fun}, _from, %{circuit_state: :closed} = state) do
    case execute_safely(fun) do
      {:ok, result} ->
        new_state = %{state | failure_count: 0, success_count: state.success_count + 1}
        {:reply, {:ok, result}, new_state}

      {:error, reason} ->
        new_failure_count = state.failure_count + 1

        new_state =
          if new_failure_count >= state.config.failure_threshold do
            schedule_half_open(state.config.reset_timeout_ms)
            emit_circuit_opened(state.config.name)

            %{state |
              circuit_state: :open,
              failure_count: new_failure_count,
              last_failure_time: DateTime.utc_now()
            }
          else
            %{state | failure_count: new_failure_count}
          end

        {:reply, {:error, reason}, new_state}
    end
  end

  @impl true
  def handle_call({:execute, _fun}, _from, %{circuit_state: :open} = state) do
    emit_circuit_rejected(state.config.name)
    {:reply, {:error, :circuit_open}, state}
  end

  @impl true
  def handle_call({:execute, fun}, _from, %{circuit_state: :half_open} = state) do
    if state.half_open_calls >= state.config.half_open_max_calls do
      {:reply, {:error, :circuit_open}, state}
    else
      case execute_safely(fun) do
        {:ok, result} ->
          new_state = %{state |
            circuit_state: :closed,
            failure_count: 0,
            half_open_calls: 0,
            success_count: state.success_count + 1
          }

          emit_circuit_closed(state.config.name)
          {:reply, {:ok, result}, new_state}

        {:error, reason} ->
          new_state = %{state |
            circuit_state: :open,
            half_open_calls: 0,
            last_failure_time: DateTime.utc_now()
          }

          schedule_half_open(state.config.reset_timeout_ms)
          emit_circuit_opened(state.config.name)
          {:reply, {:error, reason}, new_state}
      end
    end
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, {state.circuit_state, state}, state}
  end

  @impl true
  def handle_info(:try_half_open, %{circuit_state: :open} = state) do
    emit_circuit_half_open(state.config.name)
    {:noreply, %{state | circuit_state: :half_open, half_open_calls: 0}}
  end

  def handle_info(:try_half_open, state) do
    {:noreply, state}
  end

  @spec execute_safely((-> term())) :: {:ok, term()} | {:error, term()}
  defp execute_safely(fun) do
    try do
      fun.()
    rescue
      e -> {:error, Exception.message(e)}
    catch
      :exit, reason -> {:error, {:exit, reason}}
    end
  end

  @spec schedule_half_open(pos_integer()) :: reference()
  defp schedule_half_open(timeout_ms) do
    Process.send_after(self(), :try_half_open, timeout_ms)
  end

  @spec emit_circuit_opened(atom()) :: :ok
  defp emit_circuit_opened(name) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, :opened],
      %{system_time: System.system_time()},
      %{name: name}
    )
  end

  @spec emit_circuit_closed(atom()) :: :ok
  defp emit_circuit_closed(name) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, :closed],
      %{system_time: System.system_time()},
      %{name: name}
    )
  end

  @spec emit_circuit_half_open(atom()) :: :ok
  defp emit_circuit_half_open(name) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, :half_open],
      %{system_time: System.system_time()},
      %{name: name}
    )
  end

  @spec emit_circuit_rejected(atom()) :: :ok
  defp emit_circuit_rejected(name) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, :rejected],
      %{system_time: System.system_time()},
      %{name: name}
    )
  end
end
```

### Retry with Exponential Backoff

```elixir
defmodule Prismatic.Retry do
  @moduledoc """
  Retry logic with exponential backoff and jitter for
  transient error recovery.
  """

  @type retry_opts :: [
    max_attempts: pos_integer(),
    base_delay_ms: pos_integer(),
    max_delay_ms: pos_integer(),
    jitter: boolean()
  ]

  @default_opts [
    max_attempts: 3,
    base_delay_ms: 100,
    max_delay_ms: 10_000,
    jitter: true
  ]

  @spec with_retry((-> {:ok, term()} | {:error, term()}), retry_opts()) ::
    {:ok, term()} | {:error, term()}
  def with_retry(fun, opts \\ []) when is_function(fun, 0) do
    opts = Keyword.merge(@default_opts, opts)
    do_retry(fun, opts, 1)
  end

  @spec do_retry(function(), retry_opts(), pos_integer()) ::
    {:ok, term()} | {:error, term()}
  defp do_retry(fun, opts, attempt) do
    case fun.() do
      {:ok, result} ->
        {:ok, result}

      {:error, reason} when attempt >= opts[:max_attempts] ->
        {:error, reason}

      {:error, _reason} ->
        delay = calculate_delay(attempt, opts)
        Process.sleep(delay)
        do_retry(fun, opts, attempt + 1)
    end
  end

  @spec calculate_delay(pos_integer(), retry_opts()) :: pos_integer()
  defp calculate_delay(attempt, opts) do
    base = opts[:base_delay_ms] * :math.pow(2, attempt - 1) |> round()
    capped = min(base, opts[:max_delay_ms])

    if opts[:jitter] do
      jitter = :rand.uniform(capped)
      div(capped + jitter, 2)
    else
      capped
    end
  end
end
```

## Comparison with Alternatives

### vs. Exception-Based Error Handling (Java, Python, C#)

Languages like Java use exceptions as the primary error handling mechanism. Checked exceptions force callers to handle errors but create verbose code with exception specifications at every level. Unchecked exceptions can propagate silently. In Elixir, the tagged tuple approach makes errors explicit in the return type without the ceremony of exception declarations. Exceptions exist but are reserved for truly exceptional circumstances.

### vs. Go Error Handling

Go uses explicit error returns: `result, err := doSomething()`. This is conceptually similar to Elixir's tagged tuples but lacks pattern matching for clean destructuring. Go's `if err != nil` boilerplate is more verbose than Elixir's `case` and `with` expressions. Go has no supervision trees or automatic process restart.

### vs. Rust Result Type

Rust's `Result<T, E>` is the most type-safe approach, enforced by the compiler. The `?` operator provides ergonomic error propagation. Elixir's tagged tuples are conventionally enforced (not compiler-enforced) but paired with supervision trees provide a more complete error recovery story. Rust focuses on preventing errors at compile time; Elixir focuses on recovering from errors at runtime.

### vs. Monadic Error Handling (Haskell)

Haskell uses the `Either` monad and `do` notation for error handling, which Elixir's `with` expression partially mirrors. Haskell's approach is more formally rigorous (type-checked monadic composition), while Elixir's is more pragmatic (convention-based tuples with runtime pattern matching). Haskell lacks Elixir's process-level fault isolation.

### vs. Defensive Programming (C)

C relies on error codes, errno, and manual checking. Every function call must be checked, and forgetting a check leads to undefined behavior. Elixir's pattern matching ensures errors are not silently ignored -- an unmatched error tuple crashes the process (which the supervisor then restarts). This is safer than C's silent error propagation.

## Best Practices

1. **Use tagged tuples for expected errors, exceptions for unexpected ones.** If a function can reasonably fail (network call, file read, user input validation), return `{:ok, value}` or `{:error, reason}`. Reserve `raise` for programming errors and broken invariants.

2. **Be specific about error reasons.** Use atoms or structured tuples for error reasons: `{:error, :not_found}`, `{:error, {:validation_failed, field, message}}`. Never use `{:error, "something went wrong"}` -- string errors cannot be pattern matched reliably.

3. **Handle errors at the right level.** Business logic handles expected errors. Supervisors handle unexpected crashes. Circuit breakers handle dependency failures. Do not mix these levels.

4. **Use `with` for multi-step operations.** When a function chains multiple fallible operations, `with` provides clean short-circuiting. Avoid nested `case` expressions more than 2 levels deep.

5. **Emit telemetry for all error categories.** Every error, whether handled or crashed, should emit a telemetry event. This provides the [Observability](/glossary/observability/) needed to detect patterns, measure error rates, and trigger alerts.

6. **Design for graceful degradation.** When a dependency fails, have a fallback path. Cached data, default values, or reduced functionality are better than complete failure. Circuit breakers formalize this pattern.

7. **Never silently swallow errors.** `{:error, _} -> :ok` is the most dangerous pattern in Elixir. If you genuinely do not care about an error, log it at minimum. Silently swallowed errors are invisible bugs.

## Common Pitfalls

1. **Overusing try/rescue.** Wrapping business logic in try/rescue is a code smell in Elixir. It usually means the function should return tagged tuples instead of raising. Try/rescue hides the error path from the caller.

2. **Not matching on specific error reasons.** Writing `{:error, _reason} -> handle_error()` loses information. Match on specific reasons to provide appropriate responses: retries for transient errors, user feedback for validation errors, alerts for unexpected errors.

3. **Catching exits.** `try do ... catch :exit, _ -> ... end` defeats the purpose of OTP supervision. If a process exits, the supervisor should handle it. Catching exits in application code prevents proper fault recovery.

4. **Retry without backoff.** Retrying a failed operation immediately in a tight loop can overwhelm a recovering service. Always use [Exponential Backoff](/glossary/exponential-backoff/) with jitter to spread retry load.

5. **Missing circuit breakers on external calls.** Every external dependency (HTTP APIs, databases, third-party services) should be protected by a [Circuit Breaker](/glossary/circuit-breaker/). Without one, a slow or failing dependency can consume all available connections and crash the entire system.

6. **Error handling in GenServer callbacks.** A crash in `handle_call/3` sends an exit signal to the caller. If the supervisor restarts the GenServer, any in-flight calls receive `{:error, {:exit, ...}}`. Design callers to handle this gracefully.

## Use Cases

### API Gateway Error Handling

The Prismatic API (port 4004) handles errors from all 115 umbrella applications. Each application may return different error types. The API gateway classifies errors, maps them to HTTP status codes, and returns structured JSON error responses. Circuit breakers protect against slow applications, and retry logic handles transient failures.

### OSINT Data Collection

When collecting data from 120+ OSINT sources, errors are expected and frequent. Sources go offline, rate limits are hit, data formats change. The error handling strategy uses circuit breakers per source, exponential backoff for rate limits, and graceful degradation (skip unavailable sources rather than failing the entire collection).

### LiveView Real-Time Updates

Phoenix LiveView processes handle errors in real-time user sessions. A crash in a LiveView process disconnects the user. The supervision tree automatically restarts the LiveView, and the client reconnects. Error handling ensures that transient errors (database timeouts) retry transparently while permanent errors (invalid state) redirect the user to an error page.

### Background Job Processing

Long-running background jobs (compliance scans, security assessments) use layered error handling: per-step tagged tuples for expected failures, supervision for unexpected crashes, and circuit breakers for external dependencies. Jobs record partial progress so that supervisor restarts resume from the last checkpoint rather than starting over.

## Related Concepts

- [Fault Tolerance](/glossary/fault-tolerance/) - The system-level property that error handling at the process level enables
- [Let It Crash](/glossary/let-it-crash/) - The Erlang/Elixir philosophy of allowing process crashes for unexpected errors
- [Supervisor](/glossary/supervisor/) - OTP behavior that monitors and restarts failed processes
- [Circuit Breaker](/glossary/circuit-breaker/) - Pattern preventing cascading failures from unreliable dependencies
- [Retry Pattern](/glossary/retry-pattern/) - Strategy for recovering from transient errors through repeated attempts
- [Exponential Backoff](/glossary/exponential-backoff/) - Delay strategy that increases wait time between retry attempts
- [Supervision Tree](/glossary/supervision-tree/) - Hierarchical process management providing fault containment
- [Pattern Matching](/glossary/pattern-matching/) - Core mechanism for destructuring and handling error tuples
- [GenServer](/glossary/genserver/) - Server behavior whose callbacks define process-level error boundaries
- [BEAM](/glossary/beam/) - Virtual machine providing process isolation that enables safe crashing
- [Observability](/glossary/observability/) - Monitoring and metrics essential for error pattern detection
- [Telemetry](/glossary/telemetry/) - Event emission framework for tracking error rates and patterns

## See Also

- [Elixir](/glossary/elixir/) - The language implementing these error handling patterns
- [OTP](/glossary/otp/) - The framework providing supervision and process management
- [Erlang](/glossary/erlang/) - The language that originated the let-it-crash philosophy
- [Distributed System](/glossary/distributed-system/) - Systems where network partitions add error handling complexity
- [Concurrency](/glossary/concurrency/) - Concurrent execution contexts where error isolation is critical

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
