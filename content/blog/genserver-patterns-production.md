+++
title = "GenServer Patterns for Production Systems"
date = 2026-03-10
description = "Battle-tested GenServer patterns covering state management, handle_continue, timeout strategies, Registry usage, and bottleneck avoidance in production Elixir systems."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["elixir", "genserver", "otp", "production", "concurrency"]
reading_time = "12 min"
keywords = ["genserver patterns", "elixir otp", "production genserver", "state management", "registry"]
image = "/images/blog/genserver-patterns-production.png"
word_count = 1450
date_created = "2026-03-10"
date_modified = "2026-03-10"
quality_score = 93
see_also = ["architecture", "developers", "telemetry-driven-development"]
image_alt = "GenServer Patterns for Production - Prismatic Platform"
+++

GenServer is the workhorse of OTP applications. Every stateful process, every background worker, every cache in an Elixir system is likely a GenServer under the hood. But the gap between a tutorial GenServer and a production-grade one is significant. This post covers the patterns we have refined across the Prismatic Platform's 94 umbrella applications.

## The Init Trap

The most common GenServer anti-pattern is doing heavy work in `init/1`. The init callback blocks the supervisor, which blocks the entire application startup if the operation is slow or fails:

```elixir
# BAD: Blocks supervisor during startup
@impl true
def init(opts) do
  data = HttpClient.fetch_large_dataset!()  # Could take 30 seconds
  {:ok, %{data: data}}
end
```

Use `handle_continue/2` to defer initialization:

```elixir
@impl true
def init(opts) do
  {:ok, %{data: nil, status: :initializing}, {:continue, :load_data}}
end

@impl true
def handle_continue(:load_data, state) do
  case load_data() do
    {:ok, data} ->
      {:noreply, %{state | data: data, status: :ready}}

    {:error, reason} ->
      Logger.error("Failed to load data: #{inspect(reason)}")
      Process.send_after(self(), :retry_load, :timer.seconds(5))
      {:noreply, %{state | status: :degraded}}
  end
end
```

The process starts immediately, the supervisor moves on, and data loading happens asynchronously. The `status` field lets callers know whether the process is ready.

## State Design

GenServer state should be a struct, not a bare map. Structs enforce required keys and make the state shape explicit:

```elixir
defmodule Prismatic.OSINT.AdapterWorker do
  use GenServer

  defmodule State do
    @moduledoc false
    @enforce_keys [:adapter_name, :config]
    defstruct [
      :adapter_name,
      :config,
      :last_query_at,
      status: :idle,
      query_count: 0,
      error_count: 0,
      rate_limit_remaining: nil
    ]
  end

  @impl true
  def init(opts) do
    state = %State{
      adapter_name: Keyword.fetch!(opts, :adapter_name),
      config: Keyword.fetch!(opts, :config)
    }

    {:ok, state}
  end
end
```

This immediately catches typos like `%{stauts: :idle}` at compile time and documents exactly what state the process manages.

## Registry vs Named Processes

For singleton processes (one per application), use a simple name:

```elixir
GenServer.start_link(__MODULE__, opts, name: __MODULE__)
```

For dynamic pools of processes (one per entity, per adapter, per connection), use `Registry`:

```elixir
# In application.ex
children = [
  {Registry, keys: :unique, name: Prismatic.OSINT.AdapterRegistry}
]

# Starting a worker
def start_link(adapter_name) do
  GenServer.start_link(
    __MODULE__,
    [adapter_name: adapter_name],
    name: via_tuple(adapter_name)
  )
end

defp via_tuple(adapter_name) do
  {:via, Registry, {Prismatic.OSINT.AdapterRegistry, adapter_name}}
end

# Looking up a worker
def get_worker(adapter_name) do
  case Registry.lookup(Prismatic.OSINT.AdapterRegistry, adapter_name) do
    [{pid, _value}] -> {:ok, pid}
    [] -> {:error, :not_found}
  end
end
```

Registry is preferred over `:global` or `:pg` for node-local process lookups because it is faster and does not involve distributed consensus.

## Timeout Patterns

GenServer supports three timeout mechanisms. Each serves a different purpose:

### Inactivity Timeout

Returned from callbacks, triggers `handle_info(:timeout, state)` after the specified period of inactivity:

```elixir
@impl true
def handle_call(:get_status, _from, state) do
  {:reply, state.status, state, :timer.minutes(5)}
end

@impl true
def handle_info(:timeout, state) do
  # No messages for 5 minutes, clean up
  {:noreply, %{state | cache: %{}}}
end
```

### Periodic Timer

Use `Process.send_after/3` for periodic work:

```elixir
@impl true
def init(opts) do
  schedule_health_check()
  {:ok, %State{}}
end

@impl true
def handle_info(:health_check, state) do
  new_state = perform_health_check(state)
  schedule_health_check()
  {:noreply, new_state}
end

defp schedule_health_check do
  Process.send_after(self(), :health_check, :timer.seconds(30))
end
```

### Call Timeout

Protect callers from slow GenServers:

```elixir
# Caller side - default is 5000ms
def get_status(server) do
  GenServer.call(server, :get_status, :timer.seconds(10))
catch
  :exit, {:timeout, _} ->
    {:error, :timeout}
end
```

## Avoiding the Bottleneck

A GenServer processes one message at a time. If every operation goes through a single GenServer, it becomes a bottleneck. Strategies to avoid this:

### Read-Heavy: ETS Table

Store frequently-read data in ETS, update it from the GenServer:

```elixir
@impl true
def init(opts) do
  table = :ets.new(:adapter_cache, [:set, :protected, read_concurrency: true])
  {:ok, %{table: table}, {:continue, :populate}}
end

@impl true
def handle_continue(:populate, state) do
  Enum.each(load_adapters(), fn adapter ->
    :ets.insert(state.table, {adapter.name, adapter})
  end)
  {:noreply, state}
end

# Public read function - bypasses GenServer entirely
def get_adapter(name) do
  case :ets.lookup(:adapter_cache, name) do
    [{^name, adapter}] -> {:ok, adapter}
    [] -> {:error, :not_found}
  end
end
```

Any number of processes can read from ETS concurrently without going through the GenServer.

### Write-Heavy: Sharding

Partition work across multiple GenServers:

```elixir
defmodule Prismatic.Events.ShardedCounter do
  @shard_count 16

  def increment(key) do
    shard = :erlang.phash2(key, @shard_count)
    GenServer.cast(:"counter_shard_#{shard}", {:increment, key})
  end

  def count(key) do
    0..(@shard_count - 1)
    |> Enum.map(fn shard ->
      GenServer.call(:"counter_shard_#{shard}", {:get, key})
    end)
    |> Enum.sum()
  end
end
```

### Compute-Heavy: Offload to Tasks

Do not block the GenServer mailbox with expensive computations:

```elixir
@impl true
def handle_call({:analyze, data}, from, state) do
  Task.start(fn ->
    result = expensive_analysis(data)
    GenServer.reply(from, {:ok, result})
  end)

  {:noreply, state}
end
```

## Telemetry Integration

The OTEL doctrine requires telemetry in GenServers. Emit events for lifecycle and key operations:

```elixir
@impl true
def handle_call({:query, params}, _from, state) do
  start_time = System.monotonic_time()

  {result, new_state} = execute_query(params, state)

  :telemetry.execute(
    [:prismatic, :osint, :adapter, :query],
    %{duration: System.monotonic_time() - start_time},
    %{adapter: state.adapter_name, status: elem(result, 0)}
  )

  {:reply, result, new_state}
end
```

## Graceful Shutdown

Implement `terminate/2` for cleanup, but remember it is not guaranteed to run (e.g., if the process is killed with `:kill`):

```elixir
@impl true
def terminate(reason, state) do
  Logger.info("#{state.adapter_name} shutting down: #{inspect(reason)}")
  flush_pending_writes(state)
  :ok
end
```

For critical cleanup, use `Process.flag(:trap_exit, true)` in `init/1` to ensure `terminate/2` is called on normal shutdowns.

## Process Hibernation

For processes that are mostly idle but hold large state, hibernation reduces memory usage:

```elixir
@impl true
def handle_info(:timeout, state) do
  {:noreply, state, :hibernate}
end
```

The BEAM garbage-collects the process heap and puts it to sleep. The next message wakes it up with a fresh heap. Use this for processes like per-user session servers that may be idle for minutes or hours.

## Summary

| Pattern | Problem | Solution |
|---|---|---|
| `handle_continue` | Slow init blocks supervisor | Defer initialization |
| Struct state | Implicit state shape | Explicit, compile-time checked |
| Registry | Dynamic process pools | `{:via, Registry, ...}` naming |
| ETS for reads | GenServer read bottleneck | Concurrent reads bypass GenServer |
| Sharding | Write bottleneck | Partition across N GenServers |
| Task offload | Compute blocks mailbox | Async computation |
| Telemetry | Invisible operations | Observable GenServer behavior |

These patterns compose: a production GenServer often combines handle_continue initialization, ETS-backed reads, periodic timers, telemetry, and structured state in a single module. The key is knowing which patterns to apply and when.
