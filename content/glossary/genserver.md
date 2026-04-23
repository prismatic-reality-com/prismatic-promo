+++
title = "GenServer"
weight = 37
[extra]
category = "elixir"
description = "OTP generic server behaviour for building stateful processes with serialized message handling and supervised lifecycle management"
related_terms = ["otp", "supervision-tree", "ets", "behaviour", "registry-otp", "backpressure", "beam", "supervisor", "telemetry", "message-passing", "process-isolation", "genstatem", "dialyzer", "let-it-crash"]
keywords = ["GenServer OTP behaviour", "Elixir stateful processes", "client-server pattern OTP", "handle_call handle_cast", "GenServer callbacks explained", "OTP generic server", "process state management", "Elixir GenServer tutorial", "GenServer best practices", "GenServer ETS pattern"]
tags = ["genserver", "otp", "elixir", "concurrency", "state-management", "beam"]
difficulty = "intermediate"
audience = ["elixir-developers", "backend-engineers", "distributed-systems-architects"]
version = "2.0.0"
last_updated = "2026-02-22"
tldr = "GenServer is the foundational OTP behaviour that abstracts the client-server pattern into a standardized, supervised process with serialized state management and fault-tolerant lifecycle."
prerequisites = ["basic-elixir", "processes", "message-passing"]
use_cases = ["state-management", "caching", "rate-limiting", "coordination", "agent-runtime"]
platform_usage = "high"
platform_components = ["StackConversation", "SessionLifecycle", "QualityFloorGuardian", "AppRegistry", "HealthMonitor", "DomainSupervisor", "CircuitBreaker"]
elixir_version = "1.19+"
otp_version = "27+"
estimated_reading_time = "12 minutes"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1582
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GenServer - Prismatic Platform"
+++

## Definition and Overview

GenServer (Generic Server) is an [OTP](@/glossary/otp.md) behaviour that abstracts the common client-server interaction pattern into a standardized, reusable module. It provides a uniform interface for synchronous requests (`handle_call/3`), asynchronous notifications (`handle_cast/2`), and system message handling (`handle_info/2`), while managing process state, crash recovery through supervision, and lifecycle callbacks. In the OTP philosophy, every piece of mutable state in an application should be owned by a dedicated GenServer process, ensuring that state access is serialized, failures are isolated, and recovery is automatic.

GenServer is the most fundamental building block in the OTP ecosystem. While the [BEAM](@/glossary/beam.md) virtual machine provides the raw primitives of processes, message passing, and links/monitors, GenServer encodes decades of distributed systems experience into a standardized abstraction. It handles the boilerplate of process initialization, message loop management, timeout configuration, code change callbacks, and termination cleanup, allowing developers to focus on business logic expressed as pure callback implementations.

The behaviour pattern underlying GenServer is central to Elixir and Erlang's approach to software architecture. A [behaviour](@/glossary/behaviour.md) defines a set of callback functions that a module must implement, similar to interfaces in object-oriented languages but with the addition of a default implementation (the GenServer module itself) that provides the process management infrastructure. This separation of concerns -- infrastructure in the behaviour, business logic in the callbacks -- is what enables OTP's legendary reliability in production systems.

## Historical Context and Design Philosophy

GenServer traces its lineage to the earliest Erlang/OTP libraries developed at Ericsson in the late 1980s for building telephone switching systems. The gen_server module was one of the first OTP behaviours created, reflecting a pattern that Ericsson engineers observed repeatedly: nearly every concurrent component in a telephony system followed the client-server model, where clients send requests and a server maintains state and processes those requests sequentially.

Before gen_server existed, Erlang programmers wrote process loops manually, handling messages with receive blocks, managing timeouts, implementing shutdown protocols, and coordinating with supervisors through ad hoc conventions. This led to subtle bugs: missed messages, incorrect timeout handling, processes that did not respond to system messages (like code change notifications), and inconsistent error reporting. GenServer standardized all of these concerns into a single, well-tested module that has been refined over three decades of production use in systems handling millions of concurrent operations.

The design philosophy behind GenServer embodies a key OTP principle: separate the generic from the specific. The generic parts -- process spawning, message loop, timeout management, supervisor integration, code change handling -- are provided by the framework. The specific parts -- initialization logic, message handling, state transitions -- are implemented by the developer through callbacks. This separation means the generic code is tested and proven by the entire Erlang/Elixir community, while the specific code is focused, testable, and free from infrastructure concerns.

## Technical Deep Dive

### Callback Interface

GenServer defines six callbacks, three of which are required and three optional:

| Callback | Required | Purpose | Return |
|----------|----------|---------|--------|
| `init/1` | Yes | Initialize process state | `{:ok, state}` or `{:stop, reason}` |
| `handle_call/3` | Yes | Synchronous request handling | `{:reply, reply, new_state}` |
| `handle_cast/2` | Yes | Asynchronous message handling | `{:noreply, new_state}` |
| `handle_info/2` | No | System/arbitrary message handling | `{:noreply, new_state}` |
| `terminate/2` | No | Cleanup before process exit | Ignored |
| `code_change/3` | No | Hot code upgrade support | `{:ok, new_state}` |

Additionally, `handle_continue/2` was introduced in OTP 21 to support post-initialization work without blocking the supervisor startup sequence.

### Message Processing Model

GenServer processes messages sequentially from their mailbox:

```
Mailbox (FIFO Queue)          GenServer Process
+--------------------+         +-------------------------------+
| {:call, from, msg} |-------->| handle_call(msg, from, state) |
| {:cast, msg}       |         | handle_cast(msg, state)       |
| {:info, msg}       |         | handle_info(msg, state)       |
| ...                |         |                               |
+--------------------+         | State: current_state          |
                               +-------------------------------+
```

Key properties of the message processing model:

- **Sequential processing**: Only one message is processed at a time, preventing race conditions on state
- **FIFO ordering**: Messages are processed in the order they arrive in the mailbox
- **Selective receive**: GenServer always processes the next message; it does not skip messages
- **Back-pressure**: If the process cannot keep up, the mailbox grows, providing a natural back-pressure signal

### Call vs. Cast vs. Info

Understanding the three message types is fundamental to GenServer usage:

```elixir
defmodule CounterServer do
  @moduledoc """
  A simple counter GenServer demonstrating call, cast, and info patterns.
  State is serialized through the process mailbox, eliminating race conditions.
  """

  use GenServer

  # Client API

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    initial_count = Keyword.get(opts, :initial_count, 0)
    GenServer.start_link(__MODULE__, initial_count, name: __MODULE__)
  end

  # Synchronous: caller blocks until reply is received
  # Use for reads and operations where the caller needs the result
  @spec get_count() :: {:ok, non_neg_integer()}
  def get_count, do: GenServer.call(__MODULE__, :get_count)

  # Asynchronous: caller continues immediately, fire-and-forget
  # Use for writes where the caller doesn't need confirmation
  @spec increment() :: :ok
  def increment, do: GenServer.cast(__MODULE__, :increment)

  # Server Callbacks

  @impl GenServer
  def init(initial_count) do
    # Schedule periodic operations via handle_info
    Process.send_after(self(), :log_count, 60_000)
    {:ok, %{count: initial_count}}
  end

  @impl GenServer
  def handle_call(:get_count, _from, state) do
    {:reply, {:ok, state.count}, state}
  end

  @impl GenServer
  def handle_cast(:increment, state) do
    {:noreply, %{state | count: state.count + 1}}
  end

  @impl GenServer
  def handle_info(:log_count, state) do
    :telemetry.execute([:counter, :log], %{count: state.count}, %{})
    Process.send_after(self(), :log_count, 60_000)
    {:noreply, state}
  end
end
```

## Process Lifecycle

```
start_link/1  -->  init/1  -->  Message Loop  -->  terminate/2  -->  Process Exit
                     |              |    ^               ^
                     |              |    |               |
                     |              v    |               |
                     |         handle_* callbacks        |
                     |                                   |
                     +-- {:stop, reason} ----------------+
```

The lifecycle integrates with supervision trees: when a supervised GenServer crashes, the [supervisor](@/glossary/supervisor.md) detects the process exit, logs the failure, and starts a new instance according to the configured restart strategy. The new instance calls `init/1` with the original arguments, establishing fresh state. This is the mechanical realization of the [let-it-crash](@/glossary/let-it-crash.md) philosophy.

### Timeout and Hibernation

GenServer supports timeouts and hibernation for resource management:

```elixir
@impl GenServer
def init(args) do
  # Timeout: if no message arrives in 30s, handle_info(:timeout, state) is called
  {:ok, initial_state, 30_000}
end

@impl GenServer
def handle_call(:expensive_query, _from, state) do
  result = compute_result(state)
  # Hibernate: reduce memory usage when idle
  {:reply, result, state, :hibernate}
end
```

Hibernation triggers a full garbage collection and reduces the process heap to the minimum, useful for processes that are mostly idle but hold large state between active periods. This is particularly valuable in systems with thousands of GenServer processes where most are idle at any given time.

### handle_continue for Deferred Initialization

The `handle_continue/2` callback addresses a common anti-pattern where heavy initialization in `init/1` blocks the supervisor from starting subsequent children:

```elixir
defmodule PrismaticCache.Preloader do
  @moduledoc """
  Cache preloader that defers heavy data loading to handle_continue,
  allowing the supervisor to complete startup without blocking.
  """

  use GenServer

  @impl GenServer
  def init(opts) do
    # Return immediately, defer heavy work to handle_continue
    {:ok, %{opts: opts, loaded: false}, {:continue, :load_data}}
  end

  @impl GenServer
  def handle_continue(:load_data, state) do
    # This runs after init returns but before any client messages
    data = load_from_database(state.opts)
    {:noreply, %{state | data: data, loaded: true}}
  end

  @spec get(binary()) :: {:ok, term()} | {:error, :not_loaded}
  def get(key) do
    GenServer.call(__MODULE__, {:get, key})
  end

  @impl GenServer
  def handle_call({:get, _key}, _from, %{loaded: false} = state) do
    {:reply, {:error, :not_loaded}, state}
  end

  def handle_call({:get, key}, _from, %{data: data} = state) do
    result = Map.get(data, key)
    {:reply, {:ok, result}, state}
  end
end
```

## Architecture and Implementation

### Supervised GenServer Pattern

The standard production pattern places GenServers under supervision:

```elixir
defmodule PrismaticAgent.Supervisor do
  @moduledoc """
  Supervisor for agent infrastructure processes.
  Uses one_for_one strategy: each child restarts independently.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticAgent.Registry, []},
      {PrismaticAgent.Coordinator, []},
      {PrismaticAgent.HealthMonitor, interval: 30_000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### GenServer with ETS Backing

A common pattern combines GenServer state management with [ETS](@/glossary/ets-table.md) for concurrent reads:

```elixir
defmodule PrismaticCache.Store do
  @moduledoc """
  GenServer-managed cache with ETS-backed concurrent reads.
  Writes serialized through GenServer; reads bypass directly to ETS.
  This pattern eliminates the read bottleneck while maintaining
  write consistency through process serialization.
  """
  use GenServer

  @table :cache_store

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  # Direct ETS read -- no GenServer message passing
  @spec get(term()) :: {:ok, term()} | {:error, :not_found}
  def get(key) do
    case :ets.lookup(@table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  # Serialized write through GenServer
  @spec put(term(), term()) :: :ok
  def put(key, value) do
    GenServer.call(__MODULE__, {:put, key, value})
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :protected, :named_table, read_concurrency: true])
    {:ok, %{table: table, write_count: 0}}
  end

  @impl GenServer
  def handle_call({:put, key, value}, _from, state) do
    :ets.insert(@table, {key, value})
    new_state = %{state | write_count: state.write_count + 1}
    :telemetry.execute([:cache, :write], %{count: new_state.write_count}, %{key: key})
    {:reply, :ok, new_state}
  end
end
```

### Named Process Registration

GenServer processes can be registered with names for discoverability. The platform uses three naming strategies depending on the use case:

```elixir
# Singleton: one instance per node, registered by module name
GenServer.start_link(__MODULE__, opts, name: __MODULE__)

# Dynamic: multiple instances, registered via Registry
GenServer.start_link(__MODULE__, opts,
  name: {:via, Registry, {PrismaticAgents.Registry, agent_id}})

# Global: one instance across the cluster (use sparingly)
GenServer.start_link(__MODULE__, opts, name: {:global, :cluster_coordinator})
```

## Usage in Prismatic Platform

GenServer is the fundamental building block for stateful components across all 115 umbrella applications in the Prismatic Platform. The platform's OTP-first mandate means every piece of mutable state has its own GenServer process.

### Key GenServers

| Module | Lines | Purpose |
|--------|-------|---------|
| `StackConversation` | 1,128 | Stack-based conversation state with ETS persistence |
| `SessionLifecycle` | 905 | Session hooks with [circuit breaker](@/glossary/circuit-breaker.md) pattern |
| `QualityFloorGuardian` | ~500 | Autonomous quality monitoring and alerting |
| `AppRegistry` | ~400 | 115-app registry with dependency tracking |
| `HealthMonitor` | ~350 | Process and application health monitoring |
| `DomainSupervisor` | ~300 | Domain-grouped supervision management |

### Circuit Breaker Pattern

The SessionLifecycle GenServer implements a [circuit breaker](@/glossary/circuit-breaker.md) pattern to prevent cascading failures:

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  Session lifecycle management with circuit breaker protection.
  Auto-opens after 3 failures, auto-resets after 60 seconds.
  Protects session operations from flaky mix task executions.
  """
  use GenServer

  @failure_threshold 3
  @reset_timeout :timer.seconds(60)

  defstruct [
    :circuit_state,
    :failure_count,
    :last_failure,
    :hooks
  ]

  @type circuit_state :: :closed | :open | :half_open

  @impl GenServer
  def init(_opts) do
    {:ok, %__MODULE__{
      circuit_state: :closed,
      failure_count: 0,
      last_failure: nil,
      hooks: load_hooks()
    }}
  end

  @impl GenServer
  def handle_call({:execute_hook, hook_name}, _from, %{circuit_state: :open} = state) do
    if time_to_reset?(state) do
      execute_with_circuit_breaker(hook_name, %{state | circuit_state: :half_open})
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  def handle_call({:execute_hook, hook_name}, _from, state) do
    execute_with_circuit_breaker(hook_name, state)
  end

  defp execute_with_circuit_breaker(hook_name, state) do
    case execute_hook(hook_name, state.hooks) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | circuit_state: :closed, failure_count: 0}}

      {:error, reason} ->
        new_count = state.failure_count + 1
        new_circuit = if new_count >= @failure_threshold, do: :open, else: state.circuit_state
        {:reply, {:error, reason}, %{state |
          failure_count: new_count,
          circuit_state: new_circuit,
          last_failure: DateTime.utc_now()
        }}
    end
  end

  defp time_to_reset?(%{last_failure: last}) do
    DateTime.diff(DateTime.utc_now(), last, :millisecond) >= @reset_timeout
  end
end
```

### Telemetry Integration

Platform GenServers emit [telemetry](@/glossary/telemetry.md) events for observability:

```elixir
defmodule PrismaticTelemetry.GenServerInstrumentation do
  @moduledoc """
  Telemetry instrumentation for GenServer call/cast latency tracking.
  Attaches to all platform GenServers via compile-time configuration.
  """

  @spec instrument_call(module(), atom(), (-> term())) :: term()
  def instrument_call(module, operation, fun) do
    start_time = System.monotonic_time()

    result = fun.()

    duration = System.monotonic_time() - start_time

    :telemetry.execute(
      [:prismatic, :genserver, :call],
      %{duration: duration},
      %{module: module, operation: operation}
    )

    result
  end
end
```

## Advanced Patterns

### GenServer with Reply Deferral

Sometimes a GenServer needs to perform asynchronous work before replying. The `GenServer.reply/2` function enables deferred replies:

```elixir
defmodule PrismaticOsint.AsyncResolver do
  @moduledoc """
  Demonstrates deferred reply pattern for async GenServer operations.
  The caller blocks on call/2 but the GenServer is free to process
  other messages while the async work completes.
  """

  use GenServer

  @impl GenServer
  def handle_call({:resolve, domain}, from, state) do
    # Spawn async work, do NOT reply yet
    Task.start(fn ->
      result = perform_dns_resolution(domain)
      # Reply directly to the waiting caller
      GenServer.reply(from, {:ok, result})
    end)

    # :noreply frees the GenServer to handle other messages
    {:noreply, state}
  end
end
```

### Process Mailbox Monitoring

Monitoring mailbox size prevents unbounded growth:

```elixir
defmodule PrismaticMonitoring.MailboxGuard do
  @moduledoc """
  Periodically checks GenServer mailbox sizes and emits warnings
  when mailboxes exceed configurable thresholds.
  """

  use GenServer

  @check_interval :timer.seconds(10)
  @warning_threshold 1_000

  @impl GenServer
  def init(monitored_processes) do
    schedule_check()
    {:ok, %{monitored: monitored_processes}}
  end

  @impl GenServer
  def handle_info(:check_mailboxes, state) do
    Enum.each(state.monitored, fn {name, pid} ->
      case Process.info(pid, :message_queue_len) do
        {:message_queue_len, len} when len > @warning_threshold ->
          :telemetry.execute(
            [:prismatic, :mailbox, :overflow_warning],
            %{queue_length: len},
            %{process: name}
          )

        _ ->
          :ok
      end
    end)

    schedule_check()
    {:noreply, state}
  end

  defp schedule_check, do: Process.send_after(self(), :check_mailboxes, @check_interval)
end
```

## Best Practices

**Name GenServers for discoverability.** Use `name: __MODULE__` for singleton GenServers. For multiple instances, use `Registry`-based naming with `{:via, Registry, {MyRegistry, id}}`. Named processes can be found and monitored without tracking PIDs.

**Separate client API from server callbacks.** Define a clean public API at the top of the module (the client functions that send messages) and implement callbacks below. This separation makes the module's interface clear to consumers who should not care about process internals.

**Keep callback implementations fast.** GenServer processes messages sequentially. A slow `handle_call` blocks all subsequent messages. For expensive operations, offload work to a Task and reply asynchronously, or use `handle_continue/2` to defer work after the reply.

**Use `handle_continue/2` for post-initialization work.** Heavy initialization (loading data from disk, building caches) should happen in `handle_continue`, not `init/1`. This allows the supervisor to finish startup without blocking on slow initialization.

**Emit telemetry events.** Instrument GenServer operations with [telemetry](@/glossary/telemetry.md) for production observability. Track message processing latency, mailbox size, and state size to detect performance issues early.

**Always use `@impl` annotations.** The `@impl GenServer` annotation provides compile-time verification that your callback matches the behaviour's contract. This catches typos and arity mismatches that would otherwise silently create non-callback functions.

**Design for restartability.** Since supervisors restart GenServers with fresh state, ensure that `init/1` can rebuild essential state from persistent sources (database, ETS heir, disk). Ephemeral state that is lost on restart should be acceptable by design.

## Common Pitfalls

**Bottlenecking reads through GenServer.** Using `handle_call` for read operations serializes all readers through the process mailbox. For read-heavy workloads, store data in [ETS](@/glossary/ets-table.md) and read directly, bypassing GenServer for reads while keeping writes serialized.

**Unbounded mailbox growth.** If messages arrive faster than the GenServer can process them, the mailbox grows without bound, eventually consuming all memory. Implement [backpressure](@/glossary/backpressure.md) through caller-side rate limiting or use GenStage/Broadway for demand-driven processing.

**Large state in GenServer heap.** Storing large datasets (millions of records) in GenServer state causes garbage collection pauses. Move large data to ETS, which has its own memory space and is not subject to per-process GC.

**Synchronous calls in init/1.** Making GenServer.call to other processes during init creates startup ordering dependencies and potential deadlocks. Use `handle_continue` for operations that depend on other processes being available.

**Missing @impl annotations.** Without `@impl GenServer`, typos in callback names silently create new functions rather than overriding callbacks. Always annotate callbacks with `@impl` for compile-time verification via [Dialyzer](@/glossary/dialyzer.md).

**Deadlocks from self-calls.** A GenServer calling itself with `GenServer.call(__MODULE__, msg)` within a callback will deadlock because the process is already handling a message and cannot process the new call. Use internal function calls instead.

## Performance Considerations

| Operation | Typical Latency | Notes |
|-----------|----------------|-------|
| GenServer.call (local) | 5-50 us | Includes message copy + scheduling |
| GenServer.cast (local) | 1-5 us | Fire-and-forget, no reply wait |
| GenServer.call (remote) | 0.5-5 ms | Network round-trip |
| Process spawn | ~3 us | Initial heap allocation |
| State access (in callback) | ~0 us | Direct memory access, no message |
| ETS read (bypassing GenServer) | ~0.5 us | Concurrent, no serialization |

The key performance insight is that GenServer serializes all access through a single process. For read-heavy workloads, the ETS-backed pattern (writes through GenServer, reads direct from ETS) provides orders-of-magnitude better throughput.

## Testing GenServers

Testing GenServers follows the standard Elixir testing patterns with particular attention to the asynchronous nature of casts and info messages:

```elixir
defmodule CounterServerTest do
  use ExUnit.Case, async: true

  setup do
    {:ok, pid} = CounterServer.start_link(initial_count: 0)
    %{pid: pid}
  end

  test "get_count returns current count", %{pid: _pid} do
    assert {:ok, 0} = CounterServer.get_count()
  end

  test "increment increases count by one" do
    CounterServer.increment()
    # Cast is async; need to ensure it's processed before asserting
    assert {:ok, 1} = CounterServer.get_count()
  end

  test "process restarts on crash", %{pid: pid} do
    Process.exit(pid, :kill)
    # Allow supervisor to restart
    Process.sleep(10)
    assert {:ok, 0} = CounterServer.get_count()
  end
end
```

## Related Concepts

- [OTP](@/glossary/otp.md) -- Framework providing GenServer and other standard behaviours
- [Supervision Tree](@/glossary/supervision-tree.md) -- Process monitoring ensuring GenServer fault tolerance
- [ETS Table](@/glossary/ets-table.md) -- In-memory storage often backing GenServer state
- [Behaviour](@/glossary/behaviour.md) -- The callback mechanism that GenServer implements
- [GenStatem](@/glossary/gen-statem.md) -- State machine behaviour for processes with explicit states
- [Telemetry](@/glossary/telemetry.md) -- Metrics and events emitted by GenServer processes
- [Message Passing](@/glossary/message-passing.md) -- Communication model underlying GenServer interactions
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM property enabling safe GenServer crashes
- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy that GenServer supervision implements
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern implemented via GenServer state machines
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis verifying GenServer callback types
- [Backpressure](@/glossary/backpressure.md) -- Flow control for GenServer mailbox management

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications built on GenServer processes
- [Agents](@/agents/_index.md) -- Agent system using GenServer as runtime foundation
- [Technologies](@/technologies/_index.md) -- Technology stack and OTP framework details

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
