+++
title = "GenServer"
weight = 73
[extra]
category = "protocol"
description = "Generic server OTP behaviour for implementing stateful processes with synchronous and asynchronous message handling"
url = "https://hexdocs.pm/elixir/GenServer.html"
version = "OTP"
icon = "genserver"
color = "purple"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1042
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GenServer", "Generic", "technologies", "protocol", "Prismatic Platform"]
tags = ["technologies", "protocol", "genserver", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "GenServer - Prismatic Platform"
+++

## Overview

GenServer is the OTP behaviour that implements the stateful process pattern underpinning virtually every component of the Prismatic Platform. Every agent, registry, cache, coordinator, and service in the platform is a GenServer -- a process that maintains state, handles synchronous calls, asynchronous casts, and system messages in a standardized, fault-tolerant manner. The GenServer abstraction transforms what would otherwise be complex concurrent state management into a simple, predictable callback-based programming model.

The Prismatic Platform has over 400 GenServer-based processes running concurrently, each supervised by an OTP Supervisor. GenServer's standardized callback interface (`init/1`, `handle_call/3`, `handle_cast/2`, `handle_info/2`) provides a consistent programming model that makes every stateful component in the platform structurally identical, simplifying debugging and maintenance. When a developer encounters any stateful module in the platform, they already know the interface: `init/1` sets up state, `handle_call/3` processes synchronous requests, `handle_cast/2` processes asynchronous messages, and `handle_info/2` handles everything else.

GenServer's integration with OTP supervision means that when a process crashes (and the [BEAM](/technologies/beam/)'s "let it crash" philosophy encourages accepting crashes), the Supervisor automatically restarts it with clean state, ensuring system-wide resilience. This crash recovery is transparent to callers -- a GenServer that crashes and restarts appears to simply have a brief delay in responding, with no error propagation to the caller unless explicitly designed.

## Key Features

- **State Management**: Encapsulated mutable state within a process, isolated from all other processes through message passing
- **Synchronous Calls**: Request-response pattern with configurable timeout support via `GenServer.call/3`
- **Asynchronous Casts**: Fire-and-forget message handling for operations where the caller does not need a response
- **System Messages**: Handle monitoring, linking, and process lifecycle events through `handle_info/2`
- **Timeout Handling**: Idle timeout callbacks for cleanup, hibernation, and resource release
- **Hot Code Upgrade**: `code_change/3` callback for live system updates without stopping the process
- **Process Registration**: Named processes via local, global, or custom registries for discoverable services
- **Hibernate Support**: `{:noreply, state, :hibernate}` reduces memory usage for idle processes

## Platform Integration

GenServer is the foundation of every stateful platform component. The following example shows the StackConversation GenServer that tracks Claude interaction frames, demonstrating the typical pattern used across the platform.

```elixir
defmodule PrismaticClaude.StackConversation do
  @moduledoc """
  Stack-based conversation tracking for Claude sessions.
  Each frame is immutable once created. Supports checkpoints,
  forking, and popping for conversation state management.
  """
  use GenServer

  # Client API

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def get_stack, do: GenServer.call(__MODULE__, :get_stack)
  def get_frame(id), do: GenServer.call(__MODULE__, {:get_frame, id})
  def push(frame_data), do: GenServer.call(__MODULE__, {:push, frame_data})
  def pop(n \\ 1), do: GenServer.call(__MODULE__, {:pop, n})
  def checkpoint(name), do: GenServer.call(__MODULE__, {:checkpoint, name})
  def goto(name), do: GenServer.call(__MODULE__, {:goto, name})

  # Server Callbacks

  @impl true
  def init(_opts) do
    table = :ets.new(:stack_frames, [:ordered_set, :protected])
    {:ok, %{table: table, frame_id: 0, checkpoints: %{}}}
  end

  @impl true
  def handle_call(:get_stack, _from, state) do
    frames = :ets.tab2list(state.table)
    {:reply, {:ok, frames}, state}
  end

  @impl true
  def handle_call({:push, frame_data}, _from, state) do
    new_id = state.frame_id + 1
    :ets.insert(state.table, {new_id, frame_data})
    {:reply, {:ok, new_id}, %{state | frame_id: new_id}}
  end

  @impl true
  def handle_call({:checkpoint, name}, _from, state) do
    checkpoints = Map.put(state.checkpoints, name, state.frame_id)
    {:reply, {:ok, name}, %{state | checkpoints: checkpoints}}
  end
end
```

This pattern -- a public client API module wrapping `GenServer.call/2` and `GenServer.cast/2`, with server callbacks below -- is the standard structure used across all 90 applications in the platform.

## Architecture

GenServer processes form the atomic units of computation within the Prismatic Platform's OTP supervision tree. The architectural role of GenServer is to encapsulate state and behavior within isolated, supervised processes.

| Architectural Layer | GenServer Role | Examples |
|--------------------|---------------|----------|
| Coordination | Agent orchestrators, task dispatchers | `PrismaticAgents.Coordinator` |
| Storage | Cache managers, ETS table owners | `PrismaticStorage.ETS.TableManager` |
| Communication | PubSub broadcasters, event emitters | `PrismaticClaude.SessionLifecycle` |
| Monitoring | Health checkers, metric collectors | `PrismaticSafety.QualityFloorGuardian` |
| Integration | API clients, external service adapters | `PrismaticClaude.OllamaProvider` |
| Security | Token managers, rate limiters | `PrismaticWeb.Auth.TokenStore` |

The platform's meta-rule -- "If the same solution could be written identically in Node.js, it's WRONG" -- directly applies to GenServer usage. GenServer processes should leverage OTP-specific capabilities: supervision, process isolation, message passing, and hot code upgrades.

## Callback Reference

The GenServer behaviour defines six callbacks, all of which are used in the Prismatic Platform.

| Callback | Invocation | Return Types | Platform Usage |
|----------|-----------|--------------|----------------|
| `init/1` | `start_link/1` | `{:ok, state}`, `{:stop, reason}` | Initialize ETS tables, load configuration, establish connections |
| `handle_call/3` | `GenServer.call/2` | `{:reply, reply, state}`, `{:noreply, state}` | Synchronous queries, state mutations with acknowledgment |
| `handle_cast/2` | `GenServer.cast/2` | `{:noreply, state}` | Fire-and-forget updates, event broadcasting |
| `handle_info/2` | `send/2`, monitors | `{:noreply, state}` | Timer ticks, process DOWN messages, external events |
| `handle_continue/2` | `{:ok, state, {:continue, term}}` | `{:noreply, state}` | Post-init setup, deferred initialization |
| `terminate/2` | Process shutdown | `:ok` | Cleanup ETS tables, flush pending writes |

## Performance Characteristics

GenServer processes on the [BEAM](/technologies/beam/) VM are extremely lightweight, enabling the platform to run hundreds concurrently without resource concerns.

| Metric | Value | Context |
|--------|-------|---------|
| Process memory overhead | ~2.6 KB | Per GenServer process (empty state) |
| Message send latency | < 1 microsecond | Between processes on the same node |
| Process spawn time | < 5 microseconds | Creating a new GenServer |
| Mailbox throughput | ~1M messages/sec | Single process, sequential processing |
| Max concurrent processes | ~134M (theoretical) | BEAM VM limit per node |
| Platform active processes | ~400+ | GenServer instances at runtime |
| Hibernate memory savings | ~50-80% | For idle processes with large state |

The platform uses `:hibernate` for GenServer processes that are expected to be idle for extended periods, such as agent coordination processes that are only active during specific operations. Hibernation forces a full garbage collection and reduces the process heap to the minimum required for its current state.

## Configuration

GenServer start options control process registration, timeouts, and memory management behavior.

```elixir
# Standard GenServer start options used across the platform
GenServer.start_link(__MODULE__, initial_state,
  name: __MODULE__,                    # Local process registration
  timeout: 30_000,                     # Init timeout (30 seconds)
  hibernate_after: 15_000,             # Hibernate after 15s idle
  spawn_opt: [fullsweep_after: 20]     # GC tuning
)

# Via-tuple registration for dynamic processes
GenServer.start_link(__MODULE__, agent_config,
  name: {:via, Registry, {PrismaticAgents.Registry, agent_id}},
  hibernate_after: 60_000
)
```

The `hibernate_after` option is particularly important for the platform's agent processes. With 400+ GenServer processes, memory efficiency is critical, and automatic hibernation ensures idle processes do not waste heap memory.

## Best Practices

The platform enforces strict GenServer usage patterns aligned with OTP conventions and the [NO MERCY](/capabilities/no-mercy/) quality doctrine.

- **Always define a client API** -- never call `GenServer.call/2` directly from outside the module; wrap all calls in descriptive public functions
- **Use `@impl true`** on all callbacks -- this ensures the compiler catches missing or incorrect callback implementations
- **Prefer `handle_call/3`** over `handle_cast/2` for operations that modify state -- synchronous calls provide backpressure and error feedback
- **Set `hibernate_after`** on all GenServer processes -- idle processes should not consume heap memory
- **Handle `:DOWN` messages** in `handle_info/2` when monitoring other processes -- unhandled messages cause mailbox growth
- **Use `handle_continue/2`** for expensive initialization -- return `{:ok, state, {:continue, :init}}` from `init/1` to avoid blocking the supervisor during startup
- **Keep state minimal** -- store large datasets in [ETS](/technologies/ets/) and reference them from GenServer state by table name
- **Never block in callbacks** -- long-running operations should be delegated to `Task.async/1` to avoid blocking the GenServer mailbox

## Comparison with Alternatives

| Feature | GenServer | Agent | Task | Registry |
|---------|-----------|-------|------|----------|
| Stateful | Yes | Yes (simple) | No | Yes (metadata) |
| Synchronous calls | Yes | Yes | Yes (await) | No |
| Custom callbacks | Yes (6) | No | No | No |
| Supervision | Full OTP | Full OTP | Full OTP | Full OTP |
| Complexity | Medium | Low | Low | Low |
| Use Case | Complex state + behavior | Simple key-value state | One-off async work | Process discovery |
| Platform Usage | Primary pattern | Rare | Background jobs | Agent/service discovery |

GenServer is the default choice for any stateful process in the Prismatic Platform. Agent is used only for trivially simple state holders (rare in the platform), while Task is used for one-off asynchronous operations that do not maintain state.

## Related Technologies

- [Erlang/OTP](/technologies/erlang-otp/) - The OTP framework that defines the GenServer behaviour
- [BEAM](/technologies/beam/) - The virtual machine providing lightweight process execution
- [ETS](/technologies/ets/) - In-memory storage frequently paired with GenServer processes as table owners
- [Elixir](/technologies/elixir/) - The language providing the GenServer macro and module system
- [Phoenix](/technologies/phoenix/) - Web framework built on GenServer-based channels and endpoints

## Related Apps

- [prismatic_claude](/apps/prismatic-claude/) - StackConversation and SessionLifecycle GenServers
- [prismatic_agents](/apps/prismatic-agents/) - Agent coordination and registry GenServers
- [prismatic_safety](/apps/prismatic-safety/) - Quality Floor Guardian GenServer
- All 90 Prismatic Platform applications use GenServer extensively as the primary stateful process abstraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)