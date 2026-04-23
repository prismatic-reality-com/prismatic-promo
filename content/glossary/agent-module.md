+++
title = "Agent Module"
weight = 12
[extra]
category = "technology"
description = "Elixir module for simple state management around a process"
related_terms = ["genserver", "otp", "ets", "process-isolation", "beam", "supervision-tree"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1147
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Module", "Elixir", "glossary", "technology", "Prismatic Platform", "Agents", "GenServer"]
tags = ["glossary", "technology", "agent-module", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Agent Module - Prismatic Platform"
+++

## Definition and Overview

The Agent module in Elixir provides a simple abstraction for managing state within a process. It wraps a GenServer to offer a minimal API consisting of `Agent.get/2`, `Agent.update/2`, and `Agent.get_and_update/2`, hiding the GenServer callback boilerplate. Agents are suited for cases where the only requirement is to maintain and access state without complex message handling logic. They run as supervised or standalone processes on the BEAM virtual machine, inheriting all of OTP's fault tolerance and concurrency guarantees.

Agents fill a specific niche in the Elixir process taxonomy. While a raw process provides maximum flexibility and a GenServer provides full-featured stateful behavior with custom message handling, an Agent targets the common case where you simply need to store and retrieve a value across function calls. This positioning makes Agents an excellent teaching tool, prototyping mechanism, and production-ready solution for straightforward state management scenarios.

The Agent module was introduced in Elixir's standard library as a convenience layer that eliminates the ceremony of defining `handle_call`, `handle_cast`, and `init` callbacks when the only concern is state. Under the hood, every Agent is a GenServer process, which means it benefits from the same supervision, monitoring, and distributed capabilities as any other OTP-compliant process.

## Technical Deep Dive

### Core API

The Agent module exposes six primary functions that cover the complete lifecycle of a stateful process:

| Function | Purpose | Blocking? |
|----------|---------|-----------|
| `Agent.start_link/2` | Start an Agent under a supervisor | Yes |
| `Agent.start/2` | Start an unsupervised Agent | Yes |
| `Agent.get/3` | Read the current state | Yes (sync) |
| `Agent.update/3` | Modify state without returning it | Yes (sync) |
| `Agent.get_and_update/3` | Read and modify state atomically | Yes (sync) |
| `Agent.cast/2` | Fire-and-forget state modification | No (async) |
| `Agent.stop/3` | Gracefully terminate the Agent | Yes |

All synchronous operations accept an optional timeout parameter (default 5000ms), preventing deadlocks when the Agent process is unresponsive or overloaded.

### Process Model

Each Agent runs as an independent BEAM process with its own heap, garbage collector, and mailbox. State mutations are serialized through the process mailbox, guaranteeing that concurrent access from multiple callers never produces race conditions. This serialization comes at a cost: if many processes read from the same Agent simultaneously, the mailbox becomes a bottleneck. For high-concurrency read scenarios, [ETS tables](@/glossary/ets-table.md) provide a superior alternative with lock-free concurrent reads.

### Anonymous Function Protocol

Agent operations use anonymous functions to interact with state. The function executes inside the Agent's process, meaning:

1. The function has access to the Agent's process dictionary
2. Large return values must be copied to the caller's heap (message passing semantics)
3. Long-running functions block the Agent's mailbox for the duration

```elixir
# The function runs inside the Agent process
Agent.get(pid, fn state -> Map.get(state, :key) end)

# Only the return value crosses the process boundary
Agent.update(pid, fn state -> Map.put(state, :key, "value") end)
```

### Supervision Integration

Agents integrate seamlessly into OTP supervision trees. When started with `Agent.start_link/2`, the Agent links to its parent process (typically a Supervisor), ensuring automatic restart on crashes:

```elixir
children = [
  {Agent, fn -> %{counter: 0, started_at: DateTime.utc_now()} end}
]

Supervisor.start_link(children, strategy: :one_for_one)
```

Named Agents use the `:name` option for global registration, enabling lookup without storing the PID:

```elixir
Agent.start_link(fn -> [] end, name: MyApp.EventBuffer)
Agent.update(MyApp.EventBuffer, fn events -> [new_event | events] end)
```

## Architecture and Implementation

### Internal GenServer Structure

The Agent module's source code reveals a thin wrapper around GenServer callbacks:

```elixir
# Simplified internal implementation
defmodule Agent do
  use GenServer

  def init(fun) do
    {:ok, fun.()}
  end

  def handle_call({:get, fun}, _from, state) do
    {:reply, fun.(state), state}
  end

  def handle_call({:get_and_update, fun}, _from, state) do
    case fun.(state) do
      {reply, new_state} -> {:reply, reply, new_state}
    end
  end

  def handle_cast({:update, fun}, state) do
    {:noreply, fun.(state)}
  end
end
```

This implementation demonstrates that Agents add no runtime overhead beyond a single pattern match in the GenServer callbacks. The abstraction cost is purely ergonomic -- fewer lines of code in exchange for less control over message handling.

### Memory Considerations

Agent state resides in the process heap. When a caller reads state via `Agent.get/3`, the return value is copied from the Agent's heap to the caller's heap (standard BEAM message passing semantics). For large state objects, this copying can become expensive. Strategies to mitigate this include:

- Returning only the needed subset of state rather than the entire structure
- Using ETS for large shared datasets that require frequent reads
- Structuring state as references (e.g., ETS table references or file paths) rather than inline data

### Comparison with Alternatives

| Feature | Agent | GenServer | ETS | Process Dictionary |
|---------|-------|-----------|-----|--------------------|
| API complexity | Minimal (3 functions) | Full (6+ callbacks) | Moderate (20+ functions) | Minimal (2 functions) |
| Concurrent reads | Serialized | Serialized | Lock-free | N/A (same process) |
| Custom messages | No | Yes | N/A | N/A |
| Supervision | Yes | Yes | Via owner process | Via owner process |
| Distribution | Via `:global` | Via `:global` | Local node only | Local process only |
| Use case | Simple state | Complex state + messages | High-concurrency shared data | Process-local metadata |

## Usage in Prismatic Platform

In the Prismatic Platform, Agent modules serve as lightweight state containers across the 89 umbrella applications. Key usage patterns include:

### Configuration Caches

Runtime configuration that changes infrequently but is read often is stored in named Agents:

```elixir
defmodule PrismaticPerimeter.ConfigCache do
  @moduledoc """
  Caches EASM scanning configuration for fast access.
  """

  def start_link(config) do
    Agent.start_link(fn -> config end, name: __MODULE__)
  end

  def get_scan_interval do
    Agent.get(__MODULE__, & &1.scan_interval)
  end

  def update_scan_interval(interval) do
    Agent.update(__MODULE__, fn config ->
      %{config | scan_interval: interval}
    end)
  end
end
```

### Session Accumulators

Quality DNA state snapshots and session-level metrics accumulators use Agents for simple append-and-read patterns:

```elixir
defmodule PrismaticClaude.SessionMetrics do
  def start_link(_opts) do
    Agent.start_link(fn -> %{commands: 0, files_read: 0, edits: 0} end, name: __MODULE__)
  end

  def increment(metric) do
    Agent.update(__MODULE__, fn metrics ->
      Map.update!(metrics, metric, &(&1 + 1))
    end)
  end

  def snapshot do
    Agent.get(__MODULE__, & &1)
  end
end
```

### Runtime Counters

Agent-based counters track operational metrics that do not require the persistence or query capabilities of a full telemetry system:

```elixir
defmodule Prismatic.RequestCounter do
  def start_link(_) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def count(endpoint) do
    Agent.update(__MODULE__, fn counts ->
      Map.update(counts, endpoint, 1, &(&1 + 1))
    end)
  end

  def get_counts do
    Agent.get(__MODULE__, & &1)
  end
end
```

### Graduation Pattern

The platform follows a deliberate graduation pattern: new stateful components start as Agents and evolve to GenServers when they require message handling, timeouts, or complex initialization:

```
Agent (simple state) --> GenServer (messages + state) --> GenStateMachine (FSM)
```

This progression is documented in the [Elixir best practices policy](@/glossary/elixir.md) and enforced through code review.

## Code Examples

### Basic Agent Lifecycle

```elixir
# Start an Agent with initial state
{:ok, agent} = Agent.start_link(fn -> [] end)

# Add items to the list
Agent.update(agent, fn list -> ["alpha" | list] end)
Agent.update(agent, fn list -> ["beta" | list] end)

# Read current state
Agent.get(agent, fn list -> length(list) end)
# => 2

# Atomic read-and-modify
Agent.get_and_update(agent, fn list ->
  {List.first(list), tl(list)}
end)
# => "beta"

# Stop the Agent
Agent.stop(agent)
```

### Agent with Supervision

```elixir
defmodule MyApp.Application do
  use Application

  def start(_type, _args) do
    children = [
      # Agent as a supervised child
      %{
        id: MyApp.StateHolder,
        start: {Agent, :start_link, [fn -> %{} end, [name: MyApp.StateHolder]]}
      }
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

### Agent with Timeout Protection

```elixir
# Set a 1-second timeout for slow operations
try do
  Agent.get(agent, fn state ->
    # This function runs in the Agent process
    expensive_computation(state)
  end, 1_000)
rescue
  e in RuntimeError ->
    Logger.warning("Agent operation timed out: #{inspect(e)}")
    :timeout
end
```

## Best Practices

1. **Name your Agents** -- Use module names (e.g., `name: __MODULE__`) for Agents that are singletons within a supervision tree. This eliminates the need to pass PIDs around.

2. **Keep state small** -- Since state is copied on read, keep Agent state compact. If your state exceeds a few kilobytes, consider ETS.

3. **Keep functions fast** -- The anonymous function runs inside the Agent process, blocking its mailbox. Extract heavy computation outside the Agent call.

4. **Use `cast` sparingly** -- `Agent.cast/2` provides no backpressure. Prefer synchronous `update/3` unless you have measured that the serialization is a bottleneck.

5. **Supervise production Agents** -- Always use `start_link` and place Agents under a supervisor in production code. Unsupervised Agents are acceptable only in tests and IEx sessions.

6. **Consider the graduation path** -- If you find yourself wanting to handle custom messages, add periodic timers, or implement state machines, graduate to GenServer.

## Common Pitfalls

- **Bottleneck under load**: Because all operations serialize through the mailbox, a single Agent can become a bottleneck under high concurrency. Monitor mailbox length with `Process.info(pid, :message_queue_len)`.

- **Large state copying**: Reading the entire state of a large Agent copies the data structure to the caller's heap. Always project only the fields you need in the `get` function.

- **Blocking the mailbox**: Long-running functions passed to `Agent.get/3` or `Agent.update/3` block all other callers. Offload computation to the caller side when possible.

- **Orphaned Agents**: Agents started with `Agent.start/2` (not `start_link`) are not linked to any process and will not be restarted on crash. They can also leak if the creating process dies.

- **Missing timeout handling**: The default 5-second timeout can cause cascading failures in request-handling code. Set explicit timeouts and handle `:timeout` errors gracefully.

## Related Concepts

- [GenServer](@/glossary/genserver.md) -- Full-featured stateful process behaviour that Agent wraps
- [ETS Table](@/glossary/ets-table.md) -- In-memory storage alternative for shared concurrent read access
- [OTP](@/glossary/otp.md) -- Framework providing Agent and process supervision
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM model ensuring Agent state safety
- [Supervision Tree](@/glossary/supervision-tree.md) -- Process hierarchy managing Agent lifecycles
- [Elixir](@/glossary/elixir.md) -- The language providing the Agent module
- [BEAM](@/glossary/beam.md) -- Virtual machine executing Agent processes

## Further Reading

- [Elixir Agent Documentation](https://hexdocs.pm/elixir/Agent.html) -- Official API reference
- [Elixir in Action](https://www.manning.com/books/elixir-in-action) -- Comprehensive coverage of process-based state management
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications using Agent modules

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)