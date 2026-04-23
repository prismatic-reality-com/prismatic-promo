+++
title = "Task Module"
weight = 39
[extra]
category = "technology"
description = "Elixir abstraction for spawning and awaiting asynchronous computations"
related_terms = ["genserver", "otp", "supervision-tree", "process-isolation", "beam", "supervisor"]
complexity_level = "intermediate"
elixir_module = true
async_computation = true
process_based = true
fault_tolerant = true
supervision_aware = true
backpressure_support = true
timeout_configurable = true
memory_isolated = true
crash_isolation = true
patterns = ["async_await", "async_stream", "fire_and_forget", "supervised_execution"]
concurrency_primitive = true
short_lived_processes = true
no_persistent_state = true
parallel_execution = true
platform_integration = "core"
umbrella_apps = ["prismatic_agents", "prismatic_perimeter", "prismatic_safety", "prismatic_web"]
task_supervisors = 4
max_concurrency_supported = true
ordered_unordered_results = true
yield_await_distinction = true
timeout_handling = "configurable"
crash_propagation = "controllable"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 870
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Task", "Module", "Elixir", "glossary", "technology", "Prismatic Platform", "Supervisor", "Tasks", "GenServer"]
tags = ["glossary", "technology", "task-module", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Task Module - Prismatic Platform"
+++

## Definition and Overview

The Task module in Elixir provides a structured abstraction for executing code asynchronously within supervised or unsupervised processes. Tasks are short-lived processes designed for one-off computations that produce a result, contrasting with GenServer processes that maintain long-running state. The module offers two primary patterns: `Task.async/1` paired with `Task.await/1` for structured concurrency with timeout protection, and `Task.Supervisor` for integrating asynchronous work into OTP supervision trees with automatic cleanup on failure.

The fundamental insight behind the Task module is that many computational problems benefit from concurrent execution but do not require the persistent state management that GenServer provides. Fetching data from multiple external APIs, running parallel analysis checks, computing independent transformations on a dataset -- these operations need concurrency but not statefulness. Tasks fill this niche by providing lightweight, supervised processes that execute a function and return a result, then terminate cleanly.

Tasks in Elixir are built on BEAM processes, inheriting all the benefits of BEAM's process model: complete memory isolation between tasks, preemptive scheduling that prevents any single task from monopolizing CPU, and crash isolation that ensures a failing task does not corrupt other tasks or the calling process. A crashing task is detected through process linking or monitoring, and its supervisor handles cleanup without affecting sibling tasks.

The `Task.async_stream/3` function deserves special attention because it combines parallel execution with backpressure -- a critical capability for processing large collections without overwhelming system resources. Unlike naive parallel mapping, `async_stream` limits concurrent execution to a configurable `max_concurrency`, ensuring that the system processes work at a sustainable rate regardless of input size.

Within the Prismatic Platform, the Task module is the primary mechanism for parallelizing independent operations across all 106 umbrella applications. From EASM asset discovery to quality gate execution to agent coordination, Tasks provide the concurrency primitive that enables the platform to process complex multi-step operations efficiently while maintaining OTP supervision guarantees.

## Technical Deep Dive

### Task.async/await Pattern

The basic async/await pattern creates a linked process that executes a function and returns the result:

```elixir
defmodule PrismaticPerimeter.AssetDiscovery do
  @moduledoc """
  Concurrent asset discovery using Task.async/await.
  Parallelizes independent discovery operations.
  """

  @type discovery_result :: %{
    dns_records: [map()],
    certificates: [map()],
    subdomains: [String.t()],
    cloud_resources: [map()]
  }

  @spec discover(String.t()) :: {:ok, discovery_result()} | {:error, term()}
  def discover(domain) do
    # Launch all discovery tasks concurrently
    dns_task = Task.async(fn -> discover_dns(domain) end)
    cert_task = Task.async(fn -> discover_certificates(domain) end)
    subdomain_task = Task.async(fn -> discover_subdomains(domain) end)
    cloud_task = Task.async(fn -> discover_cloud_resources(domain) end)

    # Await all results with timeout
    result = %{
      dns_records: Task.await(dns_task, 30_000),
      certificates: Task.await(cert_task, 30_000),
      subdomains: Task.await(subdomain_task, 60_000),
      cloud_resources: Task.await(cloud_task, 45_000)
    }

    {:ok, result}
  rescue
    e in [Task.Error] ->
      {:error, {:discovery_failed, Exception.message(e)}}
  end

  defp discover_dns(domain) do
    # DNS lookup implementation
    # If this crashes, the linked Task process crashes,
    # which propagates to the caller via Task.await
    PrismaticPerimeter.DNS.lookup(domain, [:a, :aaaa, :mx, :txt, :cname])
  end
end
```

### Task.Supervisor for Fault-Tolerant Execution

`Task.Supervisor` provides supervised task execution where crashes are isolated:

```elixir
defmodule PrismaticAgents.TaskCoordinator do
  @moduledoc """
  Coordinates parallel agent tasks using Task.Supervisor.
  Provides fault-tolerant execution with crash isolation.
  """

  @task_supervisor PrismaticAgents.TaskSupervisor

  @spec fan_out([{module(), map()}]) :: [result()]
  def fan_out(agent_tasks) do
    agent_tasks
    |> Enum.map(fn {agent, params} ->
      Task.Supervisor.async_nolink(@task_supervisor, fn ->
        agent.execute(params)
      end)
    end)
    |> Enum.map(fn task ->
      case Task.yield(task, 30_000) || Task.shutdown(task) do
        {:ok, result} -> {:ok, result}
        {:exit, reason} -> {:error, {:task_crashed, reason}}
        nil -> {:error, :timeout}
      end
    end)
  end

  @spec fire_and_forget(module(), map()) :: {:ok, pid()}
  def fire_and_forget(agent, params) do
    Task.Supervisor.start_child(@task_supervisor, fn ->
      agent.execute(params)
    end)
  end
end
```

### Task.async_stream for Bounded Parallelism

`async_stream` provides backpressure-controlled parallel processing:

```elixir
defmodule PrismaticPerimeter.BulkScanner do
  @moduledoc """
  Bulk scanning using Task.async_stream for bounded parallelism.
  Processes large domain lists without overwhelming resources.
  """

  @type scan_result :: %{
    domain: String.t(),
    status: :scanned | :error | :timeout,
    findings: [map()],
    duration_ms: non_neg_integer()
  }

  @spec scan_domains([String.t()], keyword()) :: [scan_result()]
  def scan_domains(domains, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 10)
    timeout = Keyword.get(opts, :timeout, 60_000)

    domains
    |> Task.async_stream(
      fn domain ->
        start = System.monotonic_time(:millisecond)
        result = scan_single_domain(domain)
        duration = System.monotonic_time(:millisecond) - start

        %{
          domain: domain,
          status: elem(result, 0),
          findings: extract_findings(result),
          duration_ms: duration
        }
      end,
      max_concurrency: max_concurrency,
      timeout: timeout,
      on_timeout: :kill_task,
      ordered: false
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, reason} -> %{domain: "unknown", status: :error, findings: [], duration_ms: 0}
    end)
  end

  defp scan_single_domain(domain) do
    with {:ok, dns} <- PrismaticPerimeter.DNS.lookup(domain),
         {:ok, ports} <- PrismaticPerimeter.PortScanner.scan(domain),
         {:ok, tls} <- PrismaticPerimeter.TLS.check(domain) do
      {:scanned, %{dns: dns, ports: ports, tls: tls}}
    else
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### Task.yield vs Task.await

The distinction between `yield` and `await` is important for fault tolerance:

```elixir
defmodule Prismatic.TaskPatterns do
  @moduledoc """
  Demonstrates yield vs await patterns for different
  fault tolerance requirements.
  """

  @doc """
  await: Crashes the caller if the task crashes or times out.
  Use when the result is mandatory and failure should propagate.
  """
  @spec mandatory_result(fun()) :: term()
  def mandatory_result(fun) do
    task = Task.async(fun)
    Task.await(task, 10_000)
    # If task crashes -> caller crashes
    # If timeout -> caller raises Task.Error
  end

  @doc """
  yield + shutdown: Returns nil on timeout, allows graceful handling.
  Use when the result is optional or fallback behavior exists.
  """
  @spec optional_result(fun(), term()) :: term()
  def optional_result(fun, default) do
    task = Task.async(fun)

    case Task.yield(task, 5_000) do
      {:ok, result} -> result
      {:exit, _reason} -> default
      nil ->
        Task.shutdown(task, :brutal_kill)
        default
    end
  end

  @doc """
  async_nolink: Task crash does not propagate to caller.
  Use under Task.Supervisor for isolated execution.
  """
  @spec isolated_result(fun()) :: {:ok, term()} | {:error, term()}
  def isolated_result(fun) do
    task = Task.Supervisor.async_nolink(Prismatic.TaskSupervisor, fun)

    case Task.yield(task, 10_000) || Task.shutdown(task) do
      {:ok, result} -> {:ok, result}
      {:exit, reason} -> {:error, {:task_failed, reason}}
      nil -> {:error, :timeout}
    end
  end
end
```

## Architecture and Implementation

### Task Supervision in the Platform

The Prismatic Platform maintains dedicated Task.Supervisors for different operational domains:

```
PrismaticSupervisor (root)
    |
    +-- PrismaticAgents.TaskSupervisor
    |       +-- Agent coordination tasks
    |       +-- Cross-agent communication
    |
    +-- PrismaticPerimeter.TaskSupervisor
    |       +-- Asset discovery tasks
    |       +-- Bulk scanning tasks
    |       +-- Rating calculation tasks
    |
    +-- PrismaticSafety.TaskSupervisor
    |       +-- Quality gate checks
    |       +-- Static analysis tasks
    |       +-- Regression detection tasks
    |
    +-- PrismaticWeb.TaskSupervisor
            +-- Background data loading
            +-- LiveView async operations
```

### Task vs GenServer Selection Guide

| Criterion | Task | GenServer |
|-----------|------|-----------|
| Lifetime | Short (seconds to minutes) | Long (application lifetime) |
| State | No persistent state | Maintains state across calls |
| Result | Returns a value | Responds to messages |
| Restart | Typically `:temporary` | Typically `:permanent` |
| Concurrency | One-shot parallel execution | Serialized message processing |
| Use case | Parallel computation, fan-out | State management, coordination |

### Quality Gate Parallel Execution

The quality gates system demonstrates a real-world Task pattern:

```elixir
defmodule PrismaticSafety.QualityGates.ParallelRunner do
  @moduledoc """
  Runs quality gate checks in parallel using Task.async_stream.
  Independent checks execute concurrently for faster feedback.
  """

  @gates [
    {:compilation, PrismaticSafety.Gates.Compilation, 30_000},
    {:credo, PrismaticSafety.Gates.Credo, 60_000},
    {:dialyzer, PrismaticSafety.Gates.Dialyzer, 120_000},
    {:tests, PrismaticSafety.Gates.Tests, 300_000},
    {:typespec, PrismaticSafety.Gates.TypespecCoverage, 30_000}
  ]

  @spec run_all() :: %{atom() => gate_result()}
  def run_all do
    @gates
    |> Task.async_stream(
      fn {name, module, timeout} ->
        start = System.monotonic_time(:millisecond)
        result = module.check()
        duration = System.monotonic_time(:millisecond) - start

        :telemetry.execute(
          [:prismatic, :quality_gates, :check],
          %{duration_ms: duration},
          %{gate: name, result: result.status}
        )

        {name, Map.put(result, :duration_ms, duration)}
      end,
      max_concurrency: System.schedulers_online(),
      timeout: 300_000,
      ordered: false
    )
    |> Enum.reduce(%{}, fn {:ok, {name, result}}, acc ->
      Map.put(acc, name, result)
    end)
  end
end
```

## Usage in Prismatic Platform

### Common Task Patterns

```elixir
# Parallel data fetching
tasks = Enum.map(urls, fn url ->
  Task.async(fn -> HTTPClient.get(url) end)
end)
results = Task.await_many(tasks, 30_000)

# Supervised fire-and-forget
Task.Supervisor.start_child(PrismaticAgents.TaskSupervisor, fn ->
  PrismaticAgents.EventProcessor.process(event)
end)

# Bounded parallel processing
domains
|> Task.async_stream(&scan/1, max_concurrency: 10, timeout: 60_000)
|> Stream.filter(fn {:ok, result} -> result.status == :vulnerable end)
|> Enum.to_list()
```

### Supervision Tree Configuration

```elixir
defmodule MyApp.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Named Task.Supervisor for the application
      {Task.Supervisor, name: MyApp.TaskSupervisor},
      # Other children that may use the supervisor
      MyApp.Coordinator
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

## Best Practices

1. **Always use Task.Supervisor for production code**. Bare `Task.async` links the task to the caller, meaning task crashes propagate to the caller. `Task.Supervisor.async_nolink` isolates crashes, enabling graceful error handling.

2. **Set explicit timeouts on all Task.await calls**. The default timeout is 5 seconds, which is appropriate for fast operations but will cause unexpected failures for longer-running tasks. Always specify the timeout explicitly based on expected operation duration.

3. **Use Task.async_stream for collection processing**. Processing a list of items in parallel should use `async_stream` with `max_concurrency` rather than spawning unbounded tasks with `Enum.map + Task.async`. Unbounded parallelism can exhaust system resources.

4. **Prefer yield/shutdown over await for optional results**. When a task result is nice-to-have but not essential, use `Task.yield` with a fallback rather than `Task.await` which crashes on timeout.

5. **Use ordered: false when result order does not matter**. `Task.async_stream` defaults to ordered results, which adds latency as fast tasks wait for slow ones. Setting `ordered: false` returns results as they complete.

## Common Pitfalls

- **Spawning tasks without supervision**: `Task.start/1` spawns unsupervised processes that can become orphans on caller crash. Always use `Task.Supervisor` for production code.

- **Ignoring timeout configuration**: The default 5-second timeout catches many developers off guard. External API calls, database queries, and file operations often exceed 5 seconds.

- **Unbounded parallelism with Task.async**: Spawning thousands of tasks with `Enum.map(&Task.async/1)` can exhaust BEAM schedulers and memory. Use `async_stream` with `max_concurrency` for large collections.

- **Using Task for long-lived processes**: Tasks are designed for short-lived computations. Processes that run indefinitely should use GenServer with proper supervision and state management.

- **Not handling the {:exit, reason} case in yield**: `Task.yield` can return `{:exit, reason}` if the task crashes. Ignoring this case leads to unhandled crashes and confusing error messages.

## Advanced Task Patterns

Beyond basic async/await patterns, the Task module enables sophisticated concurrency patterns essential for high-performance applications.

### Producer-Consumer Pattern with Task.async_stream

```elixir
defmodule PrismaticOSINT.StreamingEnrichment do
  @moduledoc """
  Streaming OSINT enrichment using Task.async_stream for
  producer-consumer pattern with backpressure control.
  """

  @spec enrich_stream(Enumerable.t(), keyword()) :: Enumerable.t()
  def enrich_stream(indicator_stream, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 20)
    timeout = Keyword.get(opts, :timeout, 30_000)

    indicator_stream
    |> Task.async_stream(
      &enrich_single_indicator/1,
      max_concurrency: max_concurrency,
      timeout: timeout,
      on_timeout: :kill_task,
      ordered: false
    )
    |> Stream.filter(fn {:ok, result} -> result.status == :enriched end)
    |> Stream.map(fn {:ok, result} -> result.data end)
  end

  defp enrich_single_indicator(indicator) do
    with {:ok, reputation} <- fetch_reputation(indicator),
         {:ok, geolocation} <- fetch_geolocation(indicator),
         {:ok, threat_intel} <- fetch_threat_intel(indicator) do

      enriched_data = %{
        indicator: indicator,
        reputation: reputation,
        geolocation: geolocation,
        threat_intel: threat_intel,
        enriched_at: DateTime.utc_now()
      }

      %{status: :enriched, data: enriched_data}
    else
      error -> %{status: :failed, indicator: indicator, error: error}
    end
  end
end
```

### Circuit Breaker with Task Supervision

```elixir
defmodule PrismaticPerimeter.CircuitBreakerTasks do
  @moduledoc """
  Task execution with circuit breaker pattern for fault-tolerant
  external service integration.
  """

  use GenServer

  defstruct [
    :name,
    :failure_threshold,
    :success_threshold,
    :timeout,
    state: :closed,
    failure_count: 0,
    success_count: 0,
    last_failure_time: nil
  ]

  @spec call_with_breaker(atom(), fun(), pos_integer()) ::
    {:ok, term()} | {:error, term()} | {:circuit_open, term()}
  def call_with_breaker(breaker_name, fun, timeout \\ 5000) do
    case get_breaker_state(breaker_name) do
      :closed ->
        execute_task_with_monitoring(breaker_name, fun, timeout)

      :half_open ->
        case execute_task_with_monitoring(breaker_name, fun, timeout) do
          {:ok, result} ->
            record_success(breaker_name)
            {:ok, result}

          {:error, reason} ->
            record_failure(breaker_name)
            {:error, reason}
        end

      :open ->
        {:circuit_open, :service_unavailable}
    end
  end

  defp execute_task_with_monitoring(breaker_name, fun, timeout) do
    task = Task.Supervisor.async_nolink(
      PrismaticPerimeter.TaskSupervisor,
      fun
    )

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} ->
        record_success(breaker_name)
        {:ok, result}

      {:exit, reason} ->
        record_failure(breaker_name)
        {:error, {:task_crashed, reason}}

      nil ->
        record_failure(breaker_name)
        {:error, :timeout}
    end
  end

  defp get_breaker_state(name) do
    GenServer.call(__MODULE__, {:get_state, name})
  end

  defp record_success(name) do
    GenServer.cast(__MODULE__, {:record_success, name})
  end

  defp record_failure(name) do
    GenServer.cast(__MODULE__, {:record_failure, name})
  end
end
```

### Task Pooling for Resource Management

```elixir
defmodule PrismaticAgents.TaskPool do
  @moduledoc """
  Task pooling implementation for managing expensive resources
  like database connections or external API clients.
  """

  use GenServer

  defstruct [
    :pool_name,
    :pool_size,
    :supervisor_pid,
    available_workers: [],
    busy_workers: %{},
    waiting_clients: :queue.new(),
    worker_module: nil
  ]

  @spec checkout(atom(), pos_integer()) :: {:ok, pid()} | {:error, term()}
  def checkout(pool_name, timeout \\ 5000) do
    GenServer.call(pool_name, :checkout, timeout)
  end

  @spec checkin(atom(), pid()) :: :ok
  def checkin(pool_name, worker_pid) do
    GenServer.cast(pool_name, {:checkin, worker_pid})
  end

  @spec execute(atom(), fun(), pos_integer()) :: {:ok, term()} | {:error, term()}
  def execute(pool_name, fun, timeout \\ 30_000) do
    case checkout(pool_name, timeout) do
      {:ok, worker_pid} ->
        task = Task.Supervisor.async_nolink(
          PrismaticAgents.TaskSupervisor,
          fn ->
            try do
              fun.(worker_pid)
            after
              checkin(pool_name, worker_pid)
            end
          end
        )

        case Task.yield(task, timeout) || Task.shutdown(task) do
          {:ok, result} -> {:ok, result}
          {:exit, reason} -> {:error, {:worker_crashed, reason}}
          nil -> {:error, :execution_timeout}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def init({pool_name, pool_size, worker_module, supervisor_pid}) do
    # Initialize worker pool
    workers = Enum.map(1..pool_size, fn _i ->
      {:ok, pid} = worker_module.start_link()
      Process.monitor(pid)
      pid
    end)

    state = %__MODULE__{
      pool_name: pool_name,
      pool_size: pool_size,
      supervisor_pid: supervisor_pid,
      available_workers: workers,
      worker_module: worker_module
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:checkout, from, state) do
    case state.available_workers do
      [worker | rest] ->
        new_state = %{state |
          available_workers: rest,
          busy_workers: Map.put(state.busy_workers, worker, from)
        }
        {:reply, {:ok, worker}, new_state}

      [] ->
        waiting_clients = :queue.in(from, state.waiting_clients)
        new_state = %{state | waiting_clients: waiting_clients}
        {:noreply, new_state}
    end
  end
end
```

## Performance Optimization Strategies

### Task Scheduling and Resource Management

```elixir
defmodule PrismaticPerformance.TaskScheduler do
  @moduledoc """
  Advanced task scheduling with resource awareness and
  performance optimization strategies.
  """

  @spec schedule_with_priority([task_spec()], keyword()) :: [result()]
  def schedule_with_priority(task_specs, opts \\ []) do
    # Sort tasks by priority and resource requirements
    prioritized_tasks = sort_by_priority(task_specs)

    # Determine optimal concurrency based on system resources
    optimal_concurrency = calculate_optimal_concurrency(task_specs, opts)

    # Execute with adaptive batching
    execute_with_batching(prioritized_tasks, optimal_concurrency)
  end

  defp calculate_optimal_concurrency(task_specs, opts) do
    base_concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online())

    # Adjust based on task characteristics
    memory_intensive_count = Enum.count(task_specs, &(&1.type == :memory_intensive))
    io_intensive_count = Enum.count(task_specs, &(&1.type == :io_intensive))
    cpu_intensive_count = Enum.count(task_specs, &(&1.type == :cpu_intensive))

    cond do
      memory_intensive_count > base_concurrency / 2 ->
        max(1, div(base_concurrency, 4))  # Reduce for memory pressure

      io_intensive_count > cpu_intensive_count * 2 ->
        base_concurrency * 2  # Increase for IO-bound tasks

      true ->
        base_concurrency
    end
  end

  defp execute_with_batching(task_specs, concurrency) do
    task_specs
    |> Enum.chunk_every(concurrency * 2)  # Process in batches
    |> Enum.flat_map(fn batch ->
      batch
      |> Task.async_stream(
        &execute_task_with_telemetry/1,
        max_concurrency: concurrency,
        timeout: 60_000,
        on_timeout: :kill_task
      )
      |> Enum.map(fn
        {:ok, result} -> result
        {:exit, reason} -> %{status: :failed, reason: reason}
      end)
    end)
  end

  defp execute_task_with_telemetry(task_spec) do
    start_time = System.monotonic_time(:millisecond)

    result = task_spec.function.()

    duration = System.monotonic_time(:millisecond) - start_time

    :telemetry.execute(
      [:prismatic, :task, :execution],
      %{duration_ms: duration},
      %{
        task_type: task_spec.type,
        priority: task_spec.priority,
        status: :completed
      }
    )

    %{
      task_id: task_spec.id,
      status: :completed,
      result: result,
      duration_ms: duration
    }
  end
end
```

### Memory-Efficient Streaming

```elixir
defmodule PrismaticData.StreamingProcessor do
  @moduledoc """
  Memory-efficient streaming data processing using Task.async_stream
  with adaptive batching and garbage collection management.
  """

  @spec process_large_dataset(Enumerable.t(), keyword()) :: Enumerable.t()
  def process_large_dataset(data_stream, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 1000)
    max_concurrency = Keyword.get(opts, :max_concurrency, 10)

    data_stream
    |> Stream.chunk_every(batch_size)
    |> Task.async_stream(
      &process_batch_with_gc/1,
      max_concurrency: max_concurrency,
      timeout: :infinity,
      ordered: false
    )
    |> Stream.flat_map(fn
      {:ok, batch_results} -> batch_results
      {:exit, _reason} -> []  # Skip failed batches
    end)
  end

  defp process_batch_with_gc(batch) do
    # Process batch items
    results = Enum.map(batch, &process_single_item/1)

    # Force garbage collection after processing batch
    # to prevent memory buildup in long-running streams
    :erlang.garbage_collect()

    results
  end

  defp process_single_item(item) do
    # Simulate complex processing that might accumulate memory
    case heavy_computation(item) do
      {:ok, result} ->
        %{status: :processed, data: result, item_id: item.id}

      {:error, reason} ->
        %{status: :failed, error: reason, item_id: item.id}
    end
  end

  defp heavy_computation(item) do
    # Placeholder for actual computation
    Process.sleep(10)  # Simulate work
    {:ok, %{processed_at: DateTime.utc_now(), original: item}}
  end
end
```

## Integration with Prismatic Platform Components

### AIAD Agent Task Coordination

```elixir
defmodule PrismaticAgents.TaskCoordination do
  @moduledoc """
  Coordinates task execution across multiple AIAD agents
  with load balancing and failure recovery.
  """

  @spec coordinate_multi_agent_task(String.t(), [String.t()], map()) ::
    {:ok, [result()]} | {:error, term()}
  def coordinate_multi_agent_task(task_id, agent_ids, parameters) do
    # Validate agents are available
    available_agents = filter_available_agents(agent_ids)

    if length(available_agents) < length(agent_ids) / 2 do
      {:error, :insufficient_agents}
    else
      execute_coordinated_task(task_id, available_agents, parameters)
    end
  end

  defp execute_coordinated_task(task_id, agent_ids, parameters) do
    # Create task for each agent with shared context
    agent_tasks = Enum.map(agent_ids, fn agent_id ->
      Task.Supervisor.async(
        PrismaticAgents.TaskSupervisor,
        PrismaticAgents.Registry,
        :execute_agent_task,
        [agent_id, task_id, parameters]
      )
    end)

    # Wait for all tasks with timeout
    timeout = Map.get(parameters, :timeout, 60_000)

    results = Enum.map(agent_tasks, fn task ->
      case Task.yield(task, timeout) || Task.shutdown(task, :brutal_kill) do
        {:ok, result} -> result
        {:exit, reason} -> {:error, {:agent_failed, reason}}
        nil -> {:error, :timeout}
      end
    end)

    # Analyze results for success/failure patterns
    {successes, failures} = Enum.split_with(results, fn
      {:ok, _} -> true
      _ -> false
    end)

    if length(successes) >= length(agent_ids) / 2 do
      {:ok, Enum.map(successes, fn {:ok, result} -> result end)}
    else
      {:error, {:coordination_failed, failures}}
    end
  end

  defp filter_available_agents(agent_ids) do
    Enum.filter(agent_ids, fn agent_id ->
      case PrismaticAgents.Registry.get_agent_health(agent_id) do
        {:ok, :healthy} -> true
        _ -> false
      end
    end)
  end
end
```

### Quality Gate Task Orchestration

```elixir
defmodule PrismaticSafety.QualityGates.TaskOrchestrator do
  @moduledoc """
  Orchestrates quality gate execution with dependency management
  and parallel execution optimization.
  """

  @type gate_spec :: %{
    name: atom(),
    module: module(),
    dependencies: [atom()],
    timeout: pos_integer(),
    parallel: boolean()
  }

  @spec execute_gates_with_dependencies([gate_spec()]) ::
    {:ok, %{atom() => result()}} | {:error, term()}
  def execute_gates_with_dependencies(gate_specs) do
    dependency_graph = build_dependency_graph(gate_specs)
    execution_plan = create_execution_plan(dependency_graph)

    execute_plan(execution_plan, gate_specs)
  end

  defp build_dependency_graph(gate_specs) do
    Enum.reduce(gate_specs, %{}, fn spec, graph ->
      Map.put(graph, spec.name, spec.dependencies)
    end)
  end

  defp create_execution_plan(dependency_graph) do
    # Topological sort to determine execution order
    sorted = topological_sort(dependency_graph)

    # Group gates that can run in parallel
    Enum.reduce(sorted, [], fn gate_name, acc ->
      case find_parallel_group(acc, gate_name, dependency_graph) do
        nil -> acc ++ [[gate_name]]
        group_index ->
          List.update_at(acc, group_index, &(&1 ++ [gate_name]))
      end
    end)
  end

  defp execute_plan(execution_plan, gate_specs) do
    gate_map = Map.new(gate_specs, fn spec -> {spec.name, spec} end)

    Enum.reduce_while(execution_plan, {:ok, %{}}, fn parallel_group, {:ok, results} ->
      case execute_parallel_group(parallel_group, gate_map, results) do
        {:ok, group_results} ->
          {:cont, {:ok, Map.merge(results, group_results)}}

        {:error, reason} ->
          {:halt, {:error, reason}}
      end
    end)
  end

  defp execute_parallel_group(gate_names, gate_map, previous_results) do
    tasks = Enum.map(gate_names, fn gate_name ->
      gate_spec = Map.fetch!(gate_map, gate_name)

      Task.Supervisor.async(
        PrismaticSafety.TaskSupervisor,
        fn ->
          # Pass previous results as context
          context = Map.take(previous_results, gate_spec.dependencies)
          execute_single_gate(gate_spec, context)
        end
      )
    end)

    # Wait for all parallel tasks
    task_results = Task.await_many(tasks, 300_000)

    # Build results map
    gate_results =
      gate_names
      |> Enum.zip(task_results)
      |> Map.new()

    {:ok, gate_results}
  rescue
    e in Task.Error ->
      {:error, {:parallel_execution_failed, Exception.message(e)}}
  end

  defp execute_single_gate(gate_spec, context) do
    start_time = System.monotonic_time(:millisecond)

    result = gate_spec.module.check(context)

    duration = System.monotonic_time(:millisecond) - start_time

    :telemetry.execute(
      [:prismatic, :quality_gates, :gate_executed],
      %{duration_ms: duration},
      %{gate: gate_spec.name, status: result.status}
    )

    Map.put(result, :duration_ms, duration)
  end
end
```

## Task Monitoring and Observability

### Comprehensive Task Telemetry

```elixir
defmodule PrismaticObservability.TaskTelemetry do
  @moduledoc """
  Comprehensive telemetry system for Task monitoring and observability.
  """

  @spec setup_task_telemetry() :: :ok
  def setup_task_telemetry do
    # Attach telemetry handlers for task lifecycle events
    :telemetry.attach_many(
      "task-telemetry",
      [
        [:task, :start],
        [:task, :stop],
        [:task, :error],
        [:task_supervisor, :start_child],
        [:task_supervisor, :terminate_child]
      ],
      &handle_task_event/4,
      %{}
    )
  end

  defp handle_task_event(event, measurements, metadata, _config) do
    case event do
      [:task, :start] ->
        track_task_start(measurements, metadata)

      [:task, :stop] ->
        track_task_completion(measurements, metadata)

      [:task, :error] ->
        track_task_failure(measurements, metadata)

      [:task_supervisor, :start_child] ->
        track_supervisor_spawn(measurements, metadata)

      [:task_supervisor, :terminate_child] ->
        track_supervisor_termination(measurements, metadata)
    end
  end

  defp track_task_start(measurements, metadata) do
    PrismaticMetrics.increment_counter(
      "prismatic.tasks.started.total",
      %{
        supervisor: metadata[:supervisor] || "unknown",
        task_type: metadata[:task_type] || "unknown"
      }
    )
  end

  defp track_task_completion(measurements, metadata) do
    duration_ms = measurements[:duration_ms] || 0

    PrismaticMetrics.record_histogram(
      "prismatic.tasks.duration_ms",
      duration_ms,
      %{
        supervisor: metadata[:supervisor] || "unknown",
        task_type: metadata[:task_type] || "unknown",
        status: "completed"
      }
    )
  end

  defp track_task_failure(measurements, metadata) do
    PrismaticMetrics.increment_counter(
      "prismatic.tasks.failed.total",
      %{
        supervisor: metadata[:supervisor] || "unknown",
        task_type: metadata[:task_type] || "unknown",
        reason: metadata[:reason] || "unknown"
      }
    )
  end
end
```

### Task Health Monitoring

```elixir
defmodule PrismaticHealth.TaskMonitor do
  @moduledoc """
  Health monitoring for Task supervisors and execution patterns.
  """

  use GenServer

  defstruct [
    supervisor_stats: %{},
    task_patterns: %{},
    anomaly_detector: nil,
    alert_thresholds: %{}
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_supervisor_health(atom()) :: %{atom() => term()}
  def get_supervisor_health(supervisor_name) do
    GenServer.call(__MODULE__, {:get_health, supervisor_name})
  end

  @impl true
  def init(opts) do
    # Setup periodic health checks
    :timer.send_interval(30_000, :collect_stats)

    # Setup anomaly detection
    anomaly_detector = initialize_anomaly_detector(opts)

    state = %__MODULE__{
      anomaly_detector: anomaly_detector,
      alert_thresholds: %{
        max_failure_rate: 0.1,  # 10% failure rate threshold
        max_avg_duration_ms: 30_000,  # 30 second average duration
        min_throughput_per_min: 1  # Minimum 1 task per minute
      }
    }

    {:ok, state}
  end

  @impl true
  def handle_info(:collect_stats, state) do
    # Collect stats from all known Task supervisors
    supervisors = [
      PrismaticAgents.TaskSupervisor,
      PrismaticPerimeter.TaskSupervisor,
      PrismaticSafety.TaskSupervisor,
      PrismaticWeb.TaskSupervisor
    ]

    new_stats = Enum.reduce(supervisors, %{}, fn supervisor, acc ->
      stats = collect_supervisor_stats(supervisor)
      Map.put(acc, supervisor, stats)
    end)

    # Detect anomalies and send alerts if necessary
    anomalies = detect_anomalies(new_stats, state.alert_thresholds)
    if not Enum.empty?(anomalies) do
      send_health_alerts(anomalies)
    end

    new_state = %{state | supervisor_stats: new_stats}
    {:noreply, new_state}
  end

  defp collect_supervisor_stats(supervisor) do
    try do
      children = Supervisor.which_children(supervisor)
      active_count = length(children)

      %{
        active_tasks: active_count,
        collected_at: DateTime.utc_now(),
        supervisor_status: :healthy
      }
    rescue
      _ -> %{
        active_tasks: 0,
        collected_at: DateTime.utc_now(),
        supervisor_status: :unhealthy
      }
    end
  end

  defp detect_anomalies(stats, thresholds) do
    Enum.flat_map(stats, fn {supervisor, supervisor_stats} ->
      check_supervisor_health(supervisor, supervisor_stats, thresholds)
    end)
  end
end
```

## Error Recovery and Resilience Patterns

### Exponential Backoff with Tasks

```elixir
defmodule PrismaticResilience.RetryableTask do
  @moduledoc """
  Retryable task execution with exponential backoff and circuit breaking.
  """

  @spec execute_with_retry(fun(), keyword()) :: {:ok, term()} | {:error, term()}
  def execute_with_retry(fun, opts \\ []) do
    max_retries = Keyword.get(opts, :max_retries, 3)
    base_delay_ms = Keyword.get(opts, :base_delay_ms, 1000)
    max_delay_ms = Keyword.get(opts, :max_delay_ms, 30_000)

    execute_with_backoff(fun, 0, max_retries, base_delay_ms, max_delay_ms)
  end

  defp execute_with_backoff(fun, attempt, max_retries, base_delay, max_delay) do
    task = Task.Supervisor.async_nolink(
      PrismaticResilience.TaskSupervisor,
      fun
    )

    case Task.yield(task, 30_000) || Task.shutdown(task) do
      {:ok, result} ->
        {:ok, result}

      {:exit, reason} when attempt < max_retries ->
        # Calculate exponential backoff delay
        delay = min(base_delay * :math.pow(2, attempt), max_delay)

        :telemetry.execute(
          [:prismatic, :task, :retry],
          %{attempt: attempt, delay_ms: delay},
          %{reason: reason}
        )

        Process.sleep(trunc(delay))
        execute_with_backoff(fun, attempt + 1, max_retries, base_delay, max_delay)

      {:exit, reason} ->
        {:error, {:max_retries_exceeded, reason}}

      nil ->
        {:error, :timeout}
    end
  end
end
```

## Related Concepts

- [GenServer](/glossary/genserver/) -- Long-running stateful process, complementary to short-lived tasks
- [OTP](/glossary/otp/) -- Framework providing Task and supervision infrastructure
- [Supervision Tree](/glossary/supervision-tree/) -- Process hierarchy managing task lifecycles
- [Process Isolation](/glossary/process-isolation/) -- BEAM isolation model underlying task safety
- [BEAM](/glossary/beam/) -- Virtual machine providing lightweight process primitives
- [Supervisor](/glossary/supervisor/) -- Parent process managing task process lifecycles
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime process management for on-demand tasks

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)