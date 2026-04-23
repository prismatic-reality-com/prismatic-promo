+++
title = "OTP Behaviour"
weight = 50
[extra]
description = "A formalized process design pattern in the OTP framework that separates generic server logic from specific implementation callbacks -- the foundation for every stateful process in the Prismatic Platform's 530+ agent architecture"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "runtime-infrastructure"
related_concepts = ["otp-application", "genserver", "supervision-tree", "beam-vm", "behaviour-pattern"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 7
prerequisites = ["elixir", "erlang", "otp", "beam-vm", "genserver"]
learning_path = ["erlang", "beam-vm", "elixir", "otp", "otp-behaviour", "genserver", "supervision-tree", "otp-application"]
interactive_demos = ["/labs/glossary/otp-behaviour"]
code_examples = ["GenServer behaviour implementation", "custom behaviour definition", "Supervisor behaviour callbacks", "Agent behaviour usage"]
external_resources = ["https://hexdocs.pm/elixir/behaviours.html", "https://www.erlang.org/doc/design_principles/des_princ.html", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["behaviour callback compliance", "generic vs specific logic separation", "process lifecycle management", "state machine transitions", "fault recovery after crash"]
keywords = ["OTP behaviour", "Elixir behaviour", "GenServer behaviour", "Supervisor behaviour", "callback module", "behaviour pattern", "process abstraction", "use GenServer"]
tags = ["otp", "behaviour", "elixir", "erlang", "beam", "genserver", "pattern", "callback", "process"]
related_terms = ["otp-application", "genserver", "supervision-tree", "beam-vm", "behaviour-pattern", "supervisor", "process-isolation", "elixir", "erlang", "protocol"]
word_count = 1718
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OTP Behaviour - Prismatic Platform"
+++

## Definition

An **OTP Behaviour** is a formalized design pattern in the Open Telecom Platform (OTP) that separates the generic, reusable logic of a concurrent process from its specific business logic through a callback module mechanism. The behaviour defines a contract -- a set of callback functions that the implementing module must provide -- while the behaviour module itself handles the complex, error-prone mechanics of process lifecycle management, message handling, state transitions, and fault recovery.

In practical terms, when a developer writes `use GenServer` in an Elixir module, they are adopting the GenServer behaviour. The GenServer behaviour handles process spawning, message reception, synchronous/asynchronous call dispatch, timeout management, code change handling, and graceful termination. The developer's module provides only the callbacks that define what the process actually does: `init/1` for initialization, `handle_call/3` for synchronous requests, `handle_cast/2` for asynchronous messages, and `handle_info/2` for system messages.

The [Prismatic Platform](@/glossary/elixir.md) builds its entire 530+ agent architecture on OTP behaviours. Every agent, every storage adapter, every rate limiter, and every monitoring process implements one or more OTP behaviours. The platform also defines its own custom behaviours for domain-specific patterns like `PrismaticStorage.AdapterBehaviour`, which ensures all storage backends implement a consistent interface.

## Overview

The motivation for OTP behaviours comes from a simple observation: most concurrent processes follow one of a few common patterns. A process that maintains state and responds to requests (server), a process that monitors children and restarts them on failure (supervisor), a process that manages state transitions (state machine), and a process that handles events (event handler) -- these patterns recur across virtually every concurrent application.

Without behaviours, every developer implementing a server process would need to write their own message loop, handle process linking, implement timeout logic, manage state, handle system messages, and deal with hot code upgrades. This boilerplate is not only tedious but error-prone -- the subtle interactions between process lifecycle events, supervision signals, and OTP system messages are easy to get wrong. OTP behaviours extract this complexity into battle-tested, formally verified implementations that have been running in production telecommunications systems since the 1990s.

### Standard OTP Behaviours

| Behaviour | Purpose | Key Callbacks | Prismatic Usage |
|-----------|---------|---------------|-----------------|
| **GenServer** | Client-server process | `init/1`, `handle_call/3`, `handle_cast/2`, `handle_info/2`, `terminate/2` | 530+ agents, storage adapters, rate limiters |
| **Supervisor** | Process supervision | `init/1` (returns child spec + strategy) | 115 application supervisors, domain supervisors |
| **GenEvent** | Event management | `init/1`, `handle_event/2`, `handle_call/2` | Deprecated; replaced by `:gen_event` or custom |
| **GenStateMachine** | Finite state machine | `init/1`, `handle_event/4` (per state) | Circuit breakers, workflow engines |
| **Application** | Application lifecycle | `start/2`, `stop/1`, `prep_stop/1` | All 115 umbrella applications |
| **Agent** | Simple state wrapper | Functional interface (get/update) | Configuration caches, counters |
| **Task** | One-off async work | Functional interface (async/await) | Parallel OSINT queries, batch processing |

### The Generic-Specific Split

The fundamental insight of OTP behaviours is the separation between generic process logic and specific business logic:

```
┌──────────────────────────────────────────────┐
│              OTP Behaviour (Generic)          │
│                                              │
│  ┌─ Process spawning and registration        │
│  ├─ Message loop and dispatch                │
│  ├─ Synchronous call/reply protocol          │
│  ├─ Asynchronous cast handling               │
│  ├─ System message handling                  │
│  ├─ Timeout management                       │
│  ├─ Hot code upgrade support                 │
│  ├─ Graceful termination protocol            │
│  └─ Integration with supervision tree        │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │     Callback Module (Specific)       │    │
│  │                                      │    │
│  │  init/1        → Initial state       │    │
│  │  handle_call/3 → Sync responses      │    │
│  │  handle_cast/2 → Async handling      │    │
│  │  handle_info/2 → System messages     │    │
│  │  terminate/2   → Cleanup             │    │
│  │  code_change/3 → Hot upgrade         │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

This split means that the generic process logic, which has been refined over decades of production use, never needs to be reimplemented. Developers focus exclusively on what makes their process unique: the business logic in the callbacks.

## Technical Details

### GenServer: The Workhorse Behaviour

GenServer is by far the most commonly used OTP behaviour. It models a server process that maintains state, handles synchronous requests (calls), asynchronous notifications (casts), and miscellaneous messages (info).

```elixir
defmodule PrismaticPerimeter.SecurityRating.Engine do
  @moduledoc """
  Computes security ratings (A-F grades, 300-900 scores) for domains.

  Implements the GenServer behaviour to maintain:
  - A cache of recently computed ratings
  - Rate limiting state for external API calls
  - Aggregated telemetry metrics

  The GenServer behaviour handles all process lifecycle management;
  this module provides only the business logic callbacks.
  """

  use GenServer

  require Logger

  @type state :: %{
    cache: %{String.t() => rating()},
    pending_requests: %{reference() => {pid(), String.t()}},
    metrics: %{total_ratings: non_neg_integer(), cache_hits: non_neg_integer()}
  }

  @type rating :: %{
    domain: String.t(),
    grade: :A | :B | :C | :D | :F,
    score: 300..900,
    computed_at: DateTime.t(),
    factors: [%{name: String.t(), score: float(), weight: float()}]
  }

  # Client API (called by other processes)

  @doc "Starts the security rating engine under a supervisor."
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc "Computes a security rating for the given domain. Synchronous call."
  @spec rate_domain(String.t()) :: {:ok, rating()} | {:error, term()}
  def rate_domain(domain) do
    GenServer.call(__MODULE__, {:rate_domain, domain}, 30_000)
  end

  @doc "Returns cached ratings without computation. Returns immediately."
  @spec get_cached_rating(String.t()) :: {:ok, rating()} | {:error, :not_found}
  def get_cached_rating(domain) do
    GenServer.call(__MODULE__, {:get_cached, domain})
  end

  @doc "Invalidates cached rating for a domain. Asynchronous cast."
  @spec invalidate_cache(String.t()) :: :ok
  def invalidate_cache(domain) do
    GenServer.cast(__MODULE__, {:invalidate, domain})
  end

  # Server Callbacks (the "specific" part of the behaviour)

  @impl GenServer
  def init(opts) do
    cache_ttl = Keyword.get(opts, :cache_ttl, 3600)

    state = %{
      cache: %{},
      pending_requests: %{},
      metrics: %{total_ratings: 0, cache_hits: 0},
      cache_ttl: cache_ttl
    }

    # Schedule periodic cache cleanup
    schedule_cache_cleanup(cache_ttl)

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:rate_domain, domain}, _from, state) do
    case Map.get(state.cache, domain) do
      %{computed_at: computed_at} = cached ->
        if fresh?(computed_at, state.cache_ttl) do
          metrics = update_in(state.metrics.cache_hits, &(&1 + 1))
          {:reply, {:ok, cached}, %{state | metrics: metrics}}
        else
          {rating, new_state} = compute_rating(domain, state)
          {:reply, {:ok, rating}, new_state}
        end

      nil ->
        {rating, new_state} = compute_rating(domain, state)
        {:reply, {:ok, rating}, new_state}
    end
  end

  @impl GenServer
  def handle_call({:get_cached, domain}, _from, state) do
    case Map.get(state.cache, domain) do
      nil -> {:reply, {:error, :not_found}, state}
      rating -> {:reply, {:ok, rating}, state}
    end
  end

  @impl GenServer
  def handle_cast({:invalidate, domain}, state) do
    {:noreply, %{state | cache: Map.delete(state.cache, domain)}}
  end

  @impl GenServer
  def handle_info(:cleanup_cache, state) do
    now = DateTime.utc_now()

    fresh_cache =
      state.cache
      |> Enum.filter(fn {_domain, rating} -> fresh?(rating.computed_at, state.cache_ttl) end)
      |> Map.new()

    schedule_cache_cleanup(state.cache_ttl)
    {:noreply, %{state | cache: fresh_cache}}
  end

  @impl GenServer
  def terminate(reason, state) do
    Logger.info("SecurityRating.Engine shutting down: #{inspect(reason)}, " <>
      "computed #{state.metrics.total_ratings} ratings")
    :ok
  end

  # Private implementation

  defp compute_rating(domain, state) do
    factors = [
      %{name: "TLS Configuration", score: assess_tls(domain), weight: 0.25},
      %{name: "DNS Security", score: assess_dns(domain), weight: 0.20},
      %{name: "Header Security", score: assess_headers(domain), weight: 0.20},
      %{name: "Vulnerability Exposure", score: assess_vulnerabilities(domain), weight: 0.20},
      %{name: "Certificate Health", score: assess_certificates(domain), weight: 0.15}
    ]

    weighted_score =
      factors
      |> Enum.reduce(0.0, fn f, acc -> acc + f.score * f.weight end)
      |> normalize_to_range(300, 900)
      |> round()

    rating = %{
      domain: domain,
      grade: score_to_grade(weighted_score),
      score: weighted_score,
      computed_at: DateTime.utc_now(),
      factors: factors
    }

    metrics = %{state.metrics | total_ratings: state.metrics.total_ratings + 1}
    new_state = %{state | cache: Map.put(state.cache, domain, rating), metrics: metrics}

    {rating, new_state}
  end

  defp score_to_grade(score) when score >= 810, do: :A
  defp score_to_grade(score) when score >= 690, do: :B
  defp score_to_grade(score) when score >= 570, do: :C
  defp score_to_grade(score) when score >= 450, do: :D
  defp score_to_grade(_score), do: :F

  defp fresh?(computed_at, ttl_seconds) do
    DateTime.diff(DateTime.utc_now(), computed_at, :second) < ttl_seconds
  end

  defp schedule_cache_cleanup(ttl) do
    Process.send_after(self(), :cleanup_cache, ttl * 1_000)
  end

  defp assess_tls(_domain), do: 0.85
  defp assess_dns(_domain), do: 0.90
  defp assess_headers(_domain), do: 0.75
  defp assess_vulnerabilities(_domain), do: 0.80
  defp assess_certificates(_domain), do: 0.95

  defp normalize_to_range(value, min, max) do
    min + value * (max - min)
  end
end
```

### Custom Behaviour Definition

Beyond the standard OTP behaviours, Elixir allows defining custom behaviours for domain-specific patterns. The Prismatic Platform uses this extensively to enforce consistent interfaces across implementations.

```elixir
defmodule PrismaticStorage.AdapterBehaviour do
  @moduledoc """
  Defines the behaviour (contract) that all storage adapters must implement.

  This custom behaviour ensures that ETS, Ecto, Meilisearch, and KuzuDB
  adapters all expose the same interface, enabling the platform to swap
  storage backends without changing application code.

  The behaviour uses @callback and @optional_callbacks to define the contract.
  Implementing modules use @behaviour and @impl to declare compliance.
  """

  @type key :: term()
  @type value :: term()
  @type query :: map()
  @type options :: keyword()
  @type error :: {:error, atom() | String.t()}

  @doc "Initializes the storage adapter with the given configuration."
  @callback init(options()) :: {:ok, state :: term()} | error()

  @doc "Stores a value under the given key."
  @callback put(key(), value(), options()) :: :ok | error()

  @doc "Retrieves the value for the given key."
  @callback get(key(), options()) :: {:ok, value()} | {:error, :not_found} | error()

  @doc "Deletes the value under the given key."
  @callback delete(key(), options()) :: :ok | error()

  @doc "Lists all keys matching the given query."
  @callback list(query(), options()) :: {:ok, [key()]} | error()

  @doc "Returns the count of stored entries."
  @callback count(options()) :: {:ok, non_neg_integer()} | error()

  @doc "Checks if the adapter is healthy and responsive."
  @callback health_check() :: :ok | error()

  @doc "Performs a batch operation for efficiency."
  @callback batch_put([{key(), value()}], options()) :: :ok | error()

  @optional_callbacks [batch_put: 2]
end
```

```elixir
defmodule PrismaticStorage.ETS.Adapter do
  @moduledoc """
  ETS-based storage adapter implementing the AdapterBehaviour.

  Demonstrates how a behaviour implementation provides the specific
  logic while the behaviour contract ensures interface consistency.
  """

  @behaviour PrismaticStorage.AdapterBehaviour

  @impl PrismaticStorage.AdapterBehaviour
  def init(opts) do
    table_name = Keyword.fetch!(opts, :table_name)
    table = :ets.new(table_name, [:set, :public, :named_table])
    {:ok, table}
  end

  @impl PrismaticStorage.AdapterBehaviour
  def put(key, value, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.insert(table, {key, value})
    :ok
  end

  @impl PrismaticStorage.AdapterBehaviour
  def get(key, opts) do
    table = Keyword.fetch!(opts, :table)

    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl PrismaticStorage.AdapterBehaviour
  def delete(key, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.delete(table, key)
    :ok
  end

  @impl PrismaticStorage.AdapterBehaviour
  def list(_query, opts) do
    table = Keyword.fetch!(opts, :table)
    keys = :ets.foldl(fn {key, _value}, acc -> [key | acc] end, [], table)
    {:ok, keys}
  end

  @impl PrismaticStorage.AdapterBehaviour
  def count(opts) do
    table = Keyword.fetch!(opts, :table)
    {:ok, :ets.info(table, :size)}
  end

  @impl PrismaticStorage.AdapterBehaviour
  def health_check do
    :ok
  end

  @impl PrismaticStorage.AdapterBehaviour
  def batch_put(entries, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.insert(table, entries)
    :ok
  end
end
```

### Supervisor Behaviour

The Supervisor behaviour is the second most important OTP behaviour, providing fault-tolerance through process monitoring and restart strategies.

```elixir
defmodule PrismaticPerimeter.Discovery.WorkerSupervisor do
  @moduledoc """
  DynamicSupervisor for asset discovery worker processes.

  Demonstrates the Supervisor behaviour pattern:
  - The generic supervision logic (monitoring, restarting) is provided by OTP
  - This module specifies only the supervision strategy and child specs
  - Workers are started dynamically as scan requests arrive
  """

  use DynamicSupervisor

  @doc "Starts the worker supervisor under the application supervision tree."
  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc "Starts a new discovery worker for the given domain."
  @spec start_worker(String.t()) :: DynamicSupervisor.on_start_child()
  def start_worker(domain) do
    spec = {PrismaticPerimeter.Discovery.Worker, domain: domain}
    DynamicSupervisor.start_child(__MODULE__, spec)
  end

  @doc "Drains all active workers gracefully before shutdown."
  @spec drain() :: :ok
  def drain do
    children = DynamicSupervisor.which_children(__MODULE__)

    Enum.each(children, fn {_, pid, _, _} ->
      if is_pid(pid), do: GenServer.stop(pid, :shutdown, 5_000)
    end)

    :ok
  end

  @impl DynamicSupervisor
  def init(_opts) do
    DynamicSupervisor.init(
      strategy: :one_for_one,
      max_children: 50,
      max_restarts: 10,
      max_seconds: 60
    )
  end
end
```

## Implementation

### Choosing the Right Behaviour

Selecting the appropriate OTP behaviour depends on the process's purpose:

| Use Case | Behaviour | When To Use |
|----------|-----------|-------------|
| Request-response server | `GenServer` | State management, caching, coordination |
| Process supervision | `Supervisor` / `DynamicSupervisor` | Fault tolerance, worker pool management |
| State machine | `GenStateMachine` / `:gen_statem` | Protocols, workflows, circuit breakers |
| Simple state | `Agent` | Configuration, counters, accumulators |
| One-off computation | `Task` / `Task.Supervisor` | Parallel HTTP requests, batch jobs |
| Application lifecycle | `Application` | Top-level application startup |

### Implementing a Custom Behaviour

When standard behaviours do not fit a domain-specific pattern, defining a custom behaviour creates a reusable abstraction. The process is:

1. **Define the behaviour module** with `@callback` declarations specifying required functions
2. **Mark optional callbacks** with `@optional_callbacks` for non-essential operations
3. **Implement the behaviour** in concrete modules using `@behaviour ModuleName` and `@impl true`
4. **Validate at compile time** -- Elixir warns if required callbacks are missing

The Prismatic Platform defines custom behaviours for:

- `PrismaticStorage.AdapterBehaviour` -- storage backend interface (ETS, Ecto, Meilisearch, KuzuDB)
- `PrismaticAgents.AgentBehaviour` -- agent execution interface (530+ agents)
- `PrismaticPerimeter.ScannerBehaviour` -- security scanner interface (120 OSINT tools)
- `PrismaticSupervisor.Registry.Behaviour` -- process registry interface (ETS, Horde)

### The @impl Annotation

Elixir's `@impl` annotation serves as compile-time documentation and validation. When a function is annotated with `@impl true` or `@impl BehaviourModule`, the compiler verifies that the function is actually a callback of the declared behaviour. This catches errors where a function is intended to be a callback but has a typo in its name or arity.

```elixir
defmodule MyServer do
  use GenServer

  # Compiler verifies this is a valid GenServer callback
  @impl GenServer
  def init(args), do: {:ok, args}

  # Compiler would warn: handle_cal is not a GenServer callback
  # @impl GenServer
  # def handle_cal(msg, from, state), do: {:reply, :ok, state}
end
```

## Comparison

### OTP Behaviour vs. Interface / Abstract Class / Trait

| Feature | OTP Behaviour | Java Interface | Go Interface | Rust Trait | Python ABC |
|---------|-------------|----------------|-------------|-----------|-----------|
| **Enforcement** | Compile-time warnings | Compile-time errors | Structural typing | Compile-time errors | Runtime errors |
| **Generic Logic** | Included (process management) | None (marker only) | None (marker only) | Default methods | Template method |
| **Concurrency** | Built-in (process per instance) | None | None | None | None |
| **Fault Handling** | Integrated (supervision) | Exception-based | Error return | Result type | Exception-based |
| **Hot Code Reload** | Supported via `code_change/3` | Not supported | Not supported | Not supported | Not supported |
| **State Management** | Built-in (per-process state) | Manual | Manual | Manual | Manual |

### OTP Behaviour vs. Elixir Protocol

OTP behaviours and Elixir protocols both define contracts, but they serve different purposes:

| Aspect | OTP Behaviour | Elixir Protocol |
|--------|-------------|-----------------|
| **Purpose** | Process design patterns | Data type polymorphism |
| **Dispatch** | Module-based (`use GenServer`) | Data-type-based (`defimpl for: Map`) |
| **Runtime Entity** | Creates a process | Pure function dispatch |
| **State** | Manages process state | Stateless |
| **Concurrency** | Built-in process management | None |
| **Use Case** | Servers, supervisors, state machines | String.Chars, Enumerable, Jason.Encoder |

The [Protocol](@/glossary/protocol.md) concept is complementary to behaviours: protocols dispatch on data types, while behaviours dispatch on module implementations. The Prismatic Platform uses both extensively.

## Best Practices

1. **Use Standard Behaviours First**: Before defining a custom behaviour, check if GenServer, Supervisor, or GenStateMachine already fits. Custom behaviours add complexity and should only be created when standard behaviours are genuinely insufficient.

2. **Always Annotate with @impl**: Every callback implementation should be annotated with `@impl true` or `@impl BehaviourModule`. This catches typos, documents intent, and enables compile-time validation.

3. **Separate Client API from Callbacks**: In a GenServer, define the client API (functions called by other processes) separately from the server callbacks. This makes the module's public interface immediately clear.

4. **Keep Callback Logic Pure**: Callbacks should delegate to pure functions for business logic. The callback itself handles the OTP protocol (returning `{:reply, result, state}`, etc.) while the pure function handles computation. This makes business logic independently testable.

5. **Handle All Message Types**: Implement `handle_info/2` to handle unexpected messages gracefully rather than crashing. Log a warning and discard the message rather than letting the default implementation crash the process.

6. **Implement terminate/2 for Cleanup**: If the process holds external resources (file handles, network connections, ETS tables), implement `terminate/2` to release them. Note that `terminate/2` is not always called (e.g., during brutal kills), so design for this possibility.

7. **Use Telemetry in Callbacks**: Emit telemetry events from key callbacks to enable monitoring and debugging. The Prismatic Platform convention is to emit events at `[:app_name, :server_name, :action]` paths.

8. **Document the Behaviour Contract**: Custom behaviour modules should have comprehensive `@moduledoc` and `@doc` annotations for each callback, explaining not just what the callback should return but what invariants it must maintain.

## Common Pitfalls

1. **Blocking in Callbacks**: GenServer callbacks run sequentially in a single process. A long-running operation in `handle_call/3` blocks all other messages. Delegate expensive work to `Task` processes and handle results via `handle_info/2`.

2. **Forgetting @impl**: Without `@impl`, the compiler cannot verify that a function is actually a callback. This leads to silent bugs where a misspelled callback is never called by the behaviour.

3. **Accumulating State Without Bounds**: GenServer state grows monotonically unless explicitly bounded. Without periodic cleanup (as shown in the cache cleanup example above), memory usage grows indefinitely.

4. **Improper Process Naming**: Using `{:global, name}` or `{:via, registry, name}` incorrectly can create race conditions during startup. Prefer local names (`name: __MODULE__`) for singleton processes and Registry for dynamic naming.

5. **Synchronous Deadlocks**: Two GenServers that call each other synchronously will deadlock. Use `GenServer.cast/2` for at least one direction, or use `Task` for parallel communication.

6. **Ignoring Return Tuples**: GenServer callbacks must return specific tuples (`{:reply, ...}`, `{:noreply, ...}`, `{:stop, ...}`). Returning the wrong tuple crashes the process with a confusing error.

7. **Overusing GenServer**: Not every abstraction needs its own process. Pure functions, ETS tables, and `Agent` are simpler alternatives when full GenServer capabilities are not needed. A GenServer that only wraps a map is over-engineering.

## Use Cases

### Agent Architecture (Prismatic Platform)

The Prismatic Platform's 530+ agents each implement GenServer behaviour to maintain their operational state, handle incoming directives, and report results. The uniform behaviour interface means that the platform's agent orchestration system can manage all agents identically regardless of their specific capabilities -- whether an agent performs OSINT reconnaissance, quality analysis, or security scanning.

### Storage Adapter System

The platform's storage layer uses a custom `AdapterBehaviour` to ensure all storage backends (ETS, Ecto, Meilisearch, KuzuDB) implement the same interface. Application code interacts with the behaviour's contract, not with specific implementations, enabling storage backends to be swapped at configuration time without code changes.

### Circuit Breaker Pattern

The `GenStateMachine` behaviour implements the circuit breaker pattern for external service calls. The state machine transitions between `:closed` (normal operation), `:open` (rejecting calls), and `:half_open` (testing recovery) states, with the behaviour managing the state transition logic and the callback module defining the specific health check and failure threshold logic.

### Supervision-Based Fault Tolerance

Every application in the Prismatic Platform uses the Supervisor behaviour to create fault-tolerant process hierarchies. When a worker process crashes, the supervisor automatically restarts it according to its strategy (`:one_for_one`, `:one_for_all`, `:rest_for_one`), ensuring system resilience without manual intervention.

## Related Concepts

OTP behaviours connect to the foundational concurrency and architecture concepts in the Prismatic Platform:

- [OTP Application](@/glossary/otp-application.md) -- the packaging unit that contains processes implementing behaviours
- [GenServer](@/glossary/genserver.md) -- the most widely used OTP behaviour for client-server processes
- [Supervision Tree](@/glossary/supervision-tree.md) -- the fault-tolerance hierarchy built from Supervisor behaviours
- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine that provides the process model behaviours abstract over
- [Behaviour Pattern](@/glossary/behaviour-pattern.md) -- the general design pattern concept behind OTP behaviours
- [Supervisor](@/glossary/supervisor.md) -- the OTP behaviour for process monitoring and restart
- [Process Isolation](@/glossary/process-isolation.md) -- the BEAM feature that makes per-process state in behaviours safe
- [Elixir](@/glossary/elixir.md) -- the language providing the `@behaviour` and `@impl` annotations
- [Erlang](@/glossary/erlang.md) -- the language that originated the OTP behaviour concept
- [Protocol](@/glossary/protocol.md) -- Elixir's complementary polymorphism mechanism for data types

## See Also

- [OTP](@/glossary/otp.md) -- the broader framework that defines standard behaviours
- [Concurrency](@/glossary/concurrency.md) -- the fundamental BEAM capability that behaviours abstract
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- the design pattern often implemented using custom behaviours
- [State Machine](@/glossary/state-machine.md) -- the pattern implemented by GenStateMachine behaviour

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) open source ecosystem. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
