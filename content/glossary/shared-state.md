+++
title = "Shared State"
weight = 50
[extra]
description = "Multi-process data sharing mechanisms in concurrent systems using ETS, GenServer, or distributed stores for coordinated access"
category = "concurrency"
related_terms = ["ets", "genserver", "process", "agent", "concurrency", "otp", "beam", "distributed-systems"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["shared state", "concurrency", "multi-process", "ETS", "glossary", "Prismatic Platform"]
tags = ["glossary", "concurrency", "otp"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Shared State - Prismatic Platform"
+++

## Definition & Overview

Shared state refers to data that is accessible and potentially modifiable by multiple concurrent processes. In traditional multi-threaded programming, shared state is the primary source of race conditions, deadlocks, and data corruption. The BEAM virtual machine takes a fundamentally different approach: processes share nothing by default, communicating exclusively through message passing. When shared state is genuinely needed, Elixir provides controlled mechanisms -- ETS tables, GenServers, Agents, and distributed stores -- that make concurrent access explicit, auditable, and safe.

The distinction between accidental and intentional shared state is critical. Accidental shared state (global variables, mutable singletons) creates hidden coupling and unpredictable behavior. Intentional shared state, mediated through well-defined OTP abstractions, provides the coordination primitives that distributed systems require. The Prismatic Platform embraces this distinction rigorously: every piece of shared state is owned by a specific process or ETS table with documented access patterns and concurrency guarantees.

In the platform's architecture, shared state appears in three primary forms: ETS tables for high-throughput read-heavy workloads (tool registries, session stores, configuration caches), GenServers for stateful coordination with serialized writes (schedulers, health monitors, progress trackers), and distributed stores (Redis, PostgreSQL) for state that must survive node restarts or span cluster boundaries.

## Technical Deep Dive

### ETS: Lock-Free Concurrent Reads

ETS (Erlang Term Storage) provides the highest-performance shared state mechanism on the BEAM. With `read_concurrency: true`, multiple processes can read from the same ETS table simultaneously without any locking overhead:

```elixir
defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  ETS-backed registry providing sub-microsecond lookups
  for 127 self-registered OSINT tools.
  """

  use GenServer

  @table :osint_tool_registry

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table, [
      :named_table,
      :set,
      :public,
      read_concurrency: true,
      write_concurrency: false
    ])
    {:ok, %{table: table}}
  end

  @spec lookup(String.t()) :: {:ok, map()} | {:error, :not_found}
  def lookup(slug) do
    case :ets.lookup(@table, slug) do
      [{^slug, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  @spec register(map()) :: :ok
  def register(tool_config) do
    GenServer.call(__MODULE__, {:register, tool_config})
  end

  @impl true
  def handle_call({:register, config}, _from, state) do
    :ets.insert(@table, {config.slug, config})
    {:reply, :ok, state}
  end
end
```

This pattern -- GenServer owns the table, writes are serialized through GenServer calls, reads bypass the GenServer entirely -- is the canonical shared state pattern on the BEAM. It achieves microsecond read latencies under heavy concurrent load because readers never contend with each other or with the writer.

### GenServer: Serialized State Management

When shared state requires coordinated mutations (read-modify-write cycles), GenServer serialization provides correctness guarantees:

```elixir
defmodule PrismaticDd.Scheduler do
  @moduledoc """
  Manages shared scheduling state for DD pipeline sources.
  All state mutations are serialized through GenServer calls.
  """

  use GenServer

  defstruct sources: %{}, paused: false, last_run: %{}

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def trigger(group) do
    GenServer.call(__MODULE__, {:trigger, group})
  end

  def pause do
    GenServer.call(__MODULE__, :pause)
  end

  def status do
    GenServer.call(__MODULE__, :status)
  end

  @impl true
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end

  @impl true
  def handle_call({:trigger, group}, _from, %{paused: true} = state) do
    {:reply, {:error, :paused}, state}
  end

  def handle_call({:trigger, group}, _from, state) do
    now = DateTime.utc_now()
    new_state = put_in(state.last_run[group], now)
    {:reply, {:ok, now}, new_state}
  end

  def handle_call(:pause, _from, state) do
    {:reply, :ok, %{state | paused: true}}
  end

  def handle_call(:status, _from, state) do
    {:reply, {:ok, Map.from_struct(state)}, state}
  end
end
```

### Process Dictionary: Per-Process Private State

The process dictionary provides per-process state that is never shared. It is useful for storing context that should flow through a call stack without being passed as function arguments:

```elixir
defmodule PrismaticWeb.RequestContext do
  @moduledoc """
  Stores request-scoped context in the process dictionary.
  This is NOT shared state -- each request process has its own copy.
  """

  def put_current_user(user) do
    Process.put(:current_user, user)
  end

  def current_user do
    Process.get(:current_user)
  end
end
```

## Architecture & Implementation

The Prismatic Platform enforces a strict hierarchy for shared state decisions. The rule is: use the simplest mechanism that satisfies the concurrency requirements.

| Mechanism | Concurrency Model | Best For | Latency |
|-----------|------------------|----------|---------|
| Process dictionary | No sharing (private) | Request context | Nanoseconds |
| Agent | Simple get/update | Counters, flags | Microseconds |
| GenServer | Serialized read/write | Coordinated mutations | Microseconds |
| ETS (public) | Concurrent reads, serialized writes | Registries, caches | Sub-microsecond |
| ETS (protected) | Concurrent reads, owner writes | Configuration | Sub-microsecond |
| Redis | Cross-node, persistent | Distributed locks, pub/sub | Milliseconds |
| PostgreSQL | ACID transactions | Durable state, audit trails | Milliseconds |

The platform's supervision tree ensures that every shared state holder is supervised. If an ETS-owning GenServer crashes, its supervisor restarts it, and the `@after_compile` hooks in tools, topics, and sources automatically re-register their data. This self-healing property means that shared state loss from process crashes is always recoverable.

A critical anti-pattern the platform avoids is the "God GenServer" -- a single process that holds too much state and becomes a serialization bottleneck. Instead, state is partitioned across domain-specific GenServers (ToolRegistry, TopicRegistry, SourceRegistry), each managing only its own domain.

## Usage in Prismatic Platform

The platform uses shared state extensively across its three self-registering subsystems (OSINT, Academy, DD). Each uses the same pattern: a GenServer owns an ETS table, modules register themselves via `@after_compile` hooks, and runtime lookups bypass the GenServer for maximum throughput.

```elixir
defmodule PrismaticAcademy.TopicRegistry do
  @moduledoc """
  Shared state for 4 self-registered academy topics.
  Three ETS tables: topics, interconnections, search_index.
  """

  use GenServer

  @topics_table :academy_topics
  @interconnections_table :academy_interconnections
  @search_table :academy_search_index

  def all_topics do
    :ets.tab2list(@topics_table)
    |> Enum.map(fn {_slug, config} -> config end)
  end

  def search(query) do
    pattern = String.downcase(query)
    :ets.foldl(fn {term, data}, acc ->
      if String.contains?(String.downcase(term), pattern) do
        [data | acc]
      else
        acc
      end
    end, [], @search_table)
  end
end
```

The platform's health monitoring also relies on shared state. The `QualityFloorGuardian` GenServer maintains quality metrics that are read by the pre-commit hook system and the LiveView dashboard simultaneously, with ETS providing the read path for dashboard rendering.

## Cross-References

- [ETS](/glossary/ets/) - Primary shared state mechanism for read-heavy workloads
- [GenServer](/glossary/genserver/) - OTP abstraction for serialized state management
- [Concurrency](/glossary/concurrency/) - Broader context for multi-process coordination
- **Process** - BEAM lightweight process that owns state
- [Distributed Systems](/glossary/distributed-systems/) - Cross-node shared state challenges

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
