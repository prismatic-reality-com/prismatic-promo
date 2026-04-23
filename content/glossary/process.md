+++
title = "Process"
weight = 50
[extra]
description = "BEAM virtual machine lightweight execution unit providing isolated concurrent computation with message passing"
category = "elixir"
related_terms = ["scheduler", "run-queue", "runtime", "profiling", "property-test", "actor-model"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["process", "BEAM", "OTP", "concurrency", "message passing", "lightweight", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir", "otp", "concurrency"]
quality_score = 79
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Process - Prismatic Platform"
+++

## Definition & Overview

A BEAM process is a lightweight, isolated execution unit managed by the Erlang virtual machine's scheduler. Unlike operating system threads (which typically consume megabytes of stack space), BEAM processes start with approximately 2KB of memory including their stack, heap, and process control block. This extreme lightweightness enables applications to spawn millions of concurrent processes on a single machine, making processes the fundamental unit of concurrency, fault isolation, and state management in Elixir and Erlang systems.

BEAM processes communicate exclusively through asynchronous message passing. Each process has a mailbox -- a FIFO queue of received messages -- and uses `receive` blocks (or GenServer callbacks in Elixir) to process messages selectively. There is no shared memory between processes; all data passed in messages is copied between process heaps. This isolation guarantee means that a crash in one process cannot corrupt the memory of another process, providing the foundation for Erlang's "let it crash" fault tolerance philosophy.

The Prismatic Platform leverages BEAM processes extensively: each OSINT tool execution runs in a dedicated process, each DD pipeline stage operates as an independent process, the OSINT ToolRegistry and Academy TopicRegistry are GenServer processes backed by ETS tables, and the supervision tree spans hundreds of processes organized into domain supervisors. The platform's 115 umbrella applications collectively manage thousands of concurrent processes during normal operation.

## Technical Deep Dive

Process lifecycle in the BEAM follows a well-defined sequence: spawn, execute, terminate. Processes are spawned with `spawn/1`, `spawn_link/1`, `Task.async/1`, or through supervisors via `Supervisor.start_child/2`. Each process executes its function independently and terminates when the function returns or when an unhandled exception occurs. Links and monitors enable other processes to detect termination and respond appropriately.

```elixir
defmodule PrismaticOsint.ToolExecutor do
  @moduledoc """
  Executes OSINT tools in isolated processes with supervision,
  timeout protection, and result streaming via PubSub.
  """

  @type execution_result :: {:ok, map()} | {:error, term()}

  @spec execute(String.t(), map(), keyword()) :: execution_result()
  def execute(tool_slug, params, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    caller = self()

    task =
      Task.Supervisor.async_nolink(
        PrismaticOsint.TaskSupervisor,
        fn ->
          Process.flag(:trap_exit, true)

          tool = PrismaticOsintCore.ToolRegistry.get_by_slug(tool_slug)

          result =
            try do
              tool.module.run(params)
            rescue
              error -> {:error, Exception.message(error)}
            end

          send(caller, {:tool_result, tool_slug, result})
          result
        end
      )

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} ->
        result

      {:exit, reason} ->
        {:error, {:process_crashed, reason}}

      nil ->
        {:error, :timeout}
    end
  end

  @spec execute_parallel([{String.t(), map()}], keyword()) :: [{String.t(), execution_result()}]
  def execute_parallel(tool_params_list, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online() * 2)
    timeout = Keyword.get(opts, :timeout, 60_000)

    tool_params_list
    |> Task.async_stream(
      fn {slug, params} ->
        {slug, execute(slug, params, opts)}
      end,
      max_concurrency: max_concurrency,
      timeout: timeout,
      ordered: false
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, reason} -> {"unknown", {:error, {:process_crashed, reason}}}
    end)
  end
end
```

Process isolation is critical for the platform's fault tolerance. When an OSINT tool crashes (due to a malformed API response, network timeout, or unexpected data format), only the executing process terminates. The supervisor detects the termination and can restart the tool or report the failure, without affecting other concurrent tool executions.

```elixir
defmodule PrismaticOsint.ExecutionSupervisor do
  @moduledoc """
  Supervises OSINT tool execution processes with configurable
  restart strategies based on tool criticality.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {Task.Supervisor, name: PrismaticOsint.TaskSupervisor},
      {Registry, keys: :unique, name: PrismaticOsint.ExecutionRegistry},
      {DynamicSupervisor,
        name: PrismaticOsint.DynamicExecutor,
        strategy: :one_for_one,
        max_restarts: 100,
        max_seconds: 60}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

Process memory management uses per-process garbage collection. Each process has its own heap that is independently garbage-collected, meaning GC pauses affect only the individual process, not the entire system. This is a fundamental advantage over shared-heap garbage collectors (like JVM's) for latency-sensitive applications. The Prismatic Platform's sub-250ms page load guarantee benefits directly from this per-process GC architecture.

## Architecture & Implementation

The Prismatic Platform organizes processes into a hierarchical supervision tree managed by PrismaticSupervisor. Domain supervisors group related processes (OSINT processes under OsintSupervisor, DD processes under DdSupervisor, etc.), enabling domain-level restart strategies without affecting other domains.

Process monitoring provides the health observability layer. Each significant process reports its state to the HealthMonitor GenServer, which aggregates process-level health into domain-level and system-level health indicators.

```elixir
defmodule PrismaticSupervisor.HealthMonitor do
  @moduledoc """
  Monitors process health across the supervision tree,
  aggregating per-process metrics into domain health indicators.
  """

  use GenServer

  @check_interval 10_000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{process_stats: %{}}}
  end

  @impl true
  def handle_info(:check, state) do
    stats =
      Process.list()
      |> Enum.map(fn pid ->
        info = Process.info(pid, [:memory, :message_queue_len, :reductions, :registered_name])
        {pid, info}
      end)
      |> Enum.reject(fn {_, info} -> is_nil(info) end)
      |> Map.new()

    oversized = Enum.filter(stats, fn {_, info} ->
      info[:memory] > 50_000_000
    end)

    backlogged = Enum.filter(stats, fn {_, info} ->
      info[:message_queue_len] > 1000
    end)

    if length(oversized) > 0 or length(backlogged) > 0 do
      :telemetry.execute(
        [:prismatic, :process, :health_warning],
        %{oversized: length(oversized), backlogged: length(backlogged)},
        %{oversized_pids: Enum.map(oversized, &elem(&1, 0)),
          backlogged_pids: Enum.map(backlogged, &elem(&1, 0))}
      )
    end

    schedule_check()
    {:noreply, %{state | process_stats: stats}}
  end

  defp schedule_check, do: Process.send_after(self(), :check, @check_interval)
end
```

## Usage in Prismatic Platform

Every stateful entity in the platform has its own process, following the OTP-first principle. The ToolRegistry, TopicRegistry, SourceRegistry, ProgressTracker, SessionManager, and all storage adapters are implemented as GenServer processes with well-defined supervision strategies.

```elixir
defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  ETS-backed GenServer maintaining the registry of all
  self-registered OSINT tools. Each tool's configuration
  is stored in an ETS table for sub-millisecond lookups.
  """

  use GenServer

  @ets_table :osint_tool_registry

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :set, :public, read_concurrency: true])
    {:ok, %{tool_count: 0}}
  end

  @spec register(map()) :: :ok
  def register(tool_config) do
    GenServer.call(__MODULE__, {:register, tool_config})
  end

  @impl true
  def handle_call({:register, config}, _from, state) do
    :ets.insert(@ets_table, {config.slug, config})
    {:reply, :ok, %{state | tool_count: state.tool_count + 1}}
  end
end
```

## Cross-References

- **Scheduler** - BEAM scheduler that manages process execution across CPU cores
- [Run Queue](@/glossary/run-queue.md) - Queue where processes wait for scheduler allocation
- **Runtime** - BEAM runtime environment hosting process execution
- [Profiling](@/glossary/profiling.md) - Performance measurement techniques for process behavior
- **Self-Registration** - Metaprogramming pattern using GenServer processes for registries

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
