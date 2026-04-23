+++
title = "Concurrency"
weight = 50
[extra]
tags = ["glossary", "concurrency", "beam", "otp", "elixir", "performance", "distributed-systems"]
description = "Concurrency is the ability of a system to manage multiple independent computations simultaneously, enabling efficient resource utilization and responsive behavior through lightweight processes, message passing, and preemptive scheduling on the BEAM virtual machine"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "infrastructure"
related_concepts = ["parallelism", "BEAM VM", "OTP", "processes", "message passing", "fault tolerance", "scheduling", "supervision"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = "intermediate"
prerequisites = ["elixir-basics", "functional-programming", "operating-systems-fundamentals"]
learning_path = ["elixir-fundamentals", "process-basics", "genserver-patterns", "supervision-trees", "distributed-systems"]
interactive_demos = ["process-visualizer", "message-flow-simulator", "scheduler-explorer"]
code_examples = true
external_resources = ["https://hexdocs.pm/elixir/processes.html", "https://www.erlang.org/doc/efficiency_guide/processes", "https://learnyousomeerlang.com/the-hitchhikers-guide-to-concurrency"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["process-isolation-test", "message-ordering-test", "scheduler-fairness-test", "backpressure-test", "deadlock-detection-test"]
keywords = ["concurrency", "parallelism", "BEAM", "processes", "message passing", "GenServer", "Task", "Agent", "scheduling", "preemptive"]
related_terms = ["beam-vm", "genserver", "supervision-tree", "message-passing", "fault-tolerance", "process-isolation", "backpressure", "distributed-system", "actor-model", "erlang"]
word_count = 1709
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Concurrency - Prismatic Platform"
+++

## Definition

**Concurrency** is the ability of a system to manage multiple independent computations simultaneously, where the computations may overlap in time but do not necessarily execute at the exact same physical instant. Concurrency is fundamentally about *structure* -- organizing a program as a composition of independently executing processes -- while parallelism is about *execution* -- running multiple computations at the same physical time on multiple CPU cores.

In the Prismatic Platform, concurrency is not an optimization technique bolted on after the fact; it is the foundational architectural principle. Built on the BEAM virtual machine (Erlang's runtime), the platform leverages lightweight processes, preemptive scheduling, and message passing to achieve massive concurrency -- routinely running hundreds of thousands of concurrent processes across its 115 umbrella applications.

## Overview

The distinction between concurrency and parallelism is critical. A concurrent system manages multiple tasks that can make progress independently. A parallel system executes multiple tasks at the same physical time. Concurrency is a design concern; parallelism is a runtime concern. The BEAM VM supports both: concurrent programs are automatically parallelized across available CPU cores by the BEAM scheduler.

### Why Concurrency Matters

Modern software systems face demands that sequential processing cannot satisfy:

- **Responsiveness**: Users expect sub-second responses while background processing continues
- **Throughput**: Systems must handle thousands of simultaneous connections
- **Fault isolation**: A failure in one operation should not crash the entire system
- **Resource efficiency**: CPU cores sit idle when programs block on I/O

The Prismatic Platform, with its 530 autonomous agents, 120 OSINT tools, real-time security monitoring, and LiveView dashboards, requires concurrency at every level. Each agent runs in its own process. Each OSINT query spawns concurrent tasks. Each LiveView connection maintains its own server-side process.

### The BEAM Advantage

The BEAM virtual machine provides concurrency primitives that are qualitatively different from those in most other runtimes:

| Feature | BEAM | OS Threads | Green Threads (Go) | Async/Await (JS/Python) |
|---------|------|-----------|-------------------|------------------------|
| **Memory per unit** | ~2KB | ~1MB | ~8KB | ~1KB (coroutine) |
| **Max concurrent units** | Millions | Thousands | Hundreds of thousands | Limited by event loop |
| **Scheduling** | Preemptive (fair) | Preemptive (OS) | Cooperative (partially) | Cooperative |
| **Isolation** | Full (separate heap) | Shared memory | Shared memory | Shared memory |
| **Failure handling** | Supervision trees | Try/catch | Goroutine crash = panic | Unhandled rejection |
| **GC impact** | Per-process (microseconds) | Stop-the-world | Stop-the-world | Stop-the-world |

The BEAM's preemptive scheduler ensures that no single process can monopolize the CPU. Every process gets a fair share of execution time (measured in reductions, approximately 2000 per time slice). This means that even if one process enters an infinite loop, other processes continue to make progress -- a property that most other concurrency models lack.

## Technical Details

### Process Fundamentals

BEAM processes are not OS threads. They are lightweight, isolated units of execution managed entirely by the BEAM VM:

```elixir
defmodule Prismatic.Concurrency.ProcessDemo do
  @moduledoc """
  Demonstrates fundamental BEAM process characteristics:
  isolation, message passing, and lightweight creation.
  """

  @doc """
  Spawns N processes, each performing independent computation.
  Demonstrates that process creation is near-instantaneous.
  """
  @spec spawn_workers(pos_integer()) :: [pid()]
  def spawn_workers(count) do
    Enum.map(1..count, fn id ->
      spawn(fn ->
        result = perform_computation(id)
        send(self(), {:result, id, result})
      end)
    end)
  end

  @doc """
  Demonstrates process isolation: a crash in one process
  does not affect others.
  """
  @spec demonstrate_isolation() :: :ok
  def demonstrate_isolation do
    stable_pid = spawn(fn ->
      receive do
        :ping -> IO.puts("Stable process still running")
      end
    end)

    _crashing_pid = spawn(fn ->
      raise "This crash is isolated"
    end)

    Process.sleep(100)
    send(stable_pid, :ping)
    :ok
  end

  defp perform_computation(id) do
    :crypto.hash(:sha256, "data_#{id}")
    |> Base.encode16(case: :lower)
  end
end
```

### GenServer: Stateful Concurrent Processes

GenServer is the primary abstraction for stateful concurrent processes in the Prismatic Platform:

```elixir
defmodule Prismatic.Agents.ConcurrentWorker do
  @moduledoc """
  A GenServer demonstrating concurrent state management
  with message passing. Each worker maintains its own
  isolated state and communicates via messages.
  """

  use GenServer

  @type state :: %{
    id: String.t(),
    task_queue: :queue.queue(task()),
    results: [result()],
    status: :idle | :processing | :completed
  }

  @type task :: %{id: String.t(), payload: term()}
  @type result :: %{task_id: String.t(), output: term(), duration_us: non_neg_integer()}

  # Client API

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    id = Keyword.fetch!(opts, :id)
    GenServer.start_link(__MODULE__, opts, name: via_tuple(id))
  end

  @spec submit_task(String.t(), task()) :: :ok
  def submit_task(worker_id, task) do
    GenServer.cast(via_tuple(worker_id), {:submit, task})
  end

  @spec get_results(String.t()) :: [result()]
  def get_results(worker_id) do
    GenServer.call(via_tuple(worker_id), :get_results)
  end

  # Server Callbacks

  @impl GenServer
  def init(opts) do
    state = %{
      id: Keyword.fetch!(opts, :id),
      task_queue: :queue.new(),
      results: [],
      status: :idle
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_cast({:submit, task}, state) do
    new_queue = :queue.in(task, state.task_queue)
    new_state = %{state | task_queue: new_queue}

    case state.status do
      :idle -> {:noreply, process_next(%{new_state | status: :processing})}
      _ -> {:noreply, new_state}
    end
  end

  @impl GenServer
  def handle_call(:get_results, _from, state) do
    {:reply, Enum.reverse(state.results), state}
  end

  @impl GenServer
  def handle_info({:task_complete, result}, state) do
    new_state = %{state | results: [result | state.results]}

    case :queue.is_empty(state.task_queue) do
      true -> {:noreply, %{new_state | status: :completed}}
      false -> {:noreply, process_next(new_state)}
    end
  end

  defp process_next(state) do
    case :queue.out(state.task_queue) do
      {{:value, task}, remaining_queue} ->
        self_pid = self()

        Task.start(fn ->
          start_time = System.monotonic_time(:microsecond)
          output = execute_task(task)
          duration = System.monotonic_time(:microsecond) - start_time

          send(self_pid, {:task_complete, %{
            task_id: task.id,
            output: output,
            duration_us: duration
          }})
        end)

        %{state | task_queue: remaining_queue}

      {:empty, _queue} ->
        %{state | status: :idle}
    end
  end

  defp execute_task(%{payload: payload}) do
    :crypto.hash(:sha256, :erlang.term_to_binary(payload))
  end

  defp via_tuple(id), do: {:via, Registry, {Prismatic.WorkerRegistry, id}}
end
```

### Task: Fire-and-Forget and Awaitable Concurrency

The `Task` module provides higher-level concurrency abstractions for one-off concurrent operations:

```elixir
defmodule Prismatic.OSINT.ConcurrentQuery do
  @moduledoc """
  Demonstrates concurrent OSINT queries using Task.async_stream
  for controlled parallelism with backpressure.
  """

  @type query_result :: {:ok, map()} | {:error, term()}

  @spec query_all_sources(String.t(), [atom()]) :: [query_result()]
  def query_all_sources(entity, sources) do
    sources
    |> Task.async_stream(
      fn source -> query_source(source, entity) end,
      max_concurrency: 10,
      timeout: 30_000,
      on_timeout: :kill_task
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, reason} -> {:error, {:task_crashed, reason}}
    end)
  end

  @spec query_with_retry(atom(), String.t(), pos_integer()) :: query_result()
  def query_with_retry(source, entity, max_retries \\ 3) do
    1..max_retries
    |> Enum.reduce_while({:error, :not_attempted}, fn attempt, _acc ->
      case query_source(source, entity) do
        {:ok, _} = success ->
          {:halt, success}

        {:error, reason} when attempt < max_retries ->
          backoff = :math.pow(2, attempt) |> round() |> :timer.seconds()
          Process.sleep(backoff)
          {:cont, {:error, reason}}

        {:error, _} = error ->
          {:halt, error}
      end
    end)
  end

  defp query_source(source, entity) do
    module = source_module(source)
    module.search(entity)
  end

  defp source_module(:ares), do: Prismatic.OSINT.Czech.ARES
  defp source_module(:shodan), do: Prismatic.OSINT.Global.Shodan
  defp source_module(:censys), do: Prismatic.OSINT.Global.Censys
  defp source_module(source), do: raise("Unknown source: #{source}")
end
```

### Supervision Trees: Fault-Tolerant Concurrency

Concurrency in the BEAM is inseparable from fault tolerance. Supervision trees organize processes hierarchically so that failures are contained and recovered from automatically:

```elixir
defmodule Prismatic.Agents.WorkerSupervisor do
  @moduledoc """
  Supervises concurrent agent workers with fault isolation.
  Each worker runs in its own process; if one crashes,
  only that worker is restarted.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {Registry, keys: :unique, name: Prismatic.WorkerRegistry},
      {DynamicSupervisor,
        name: Prismatic.Agents.DynamicWorkerSupervisor,
        strategy: :one_for_one,
        max_restarts: 100,
        max_seconds: 60}
    ]

    Supervisor.init(children, strategy: :one_for_all)
  end

  @spec start_worker(String.t()) :: DynamicSupervisor.on_start_child()
  def start_worker(worker_id) do
    spec = {Prismatic.Agents.ConcurrentWorker, id: worker_id}
    DynamicSupervisor.start_child(Prismatic.Agents.DynamicWorkerSupervisor, spec)
  end
end
```

### Backpressure and Flow Control

Uncontrolled concurrency leads to resource exhaustion. The platform implements backpressure through Broadway and GenStage:

```elixir
defmodule Prismatic.Pipeline.ConcurrentProcessor do
  @moduledoc """
  Broadway-based concurrent data processor with built-in
  backpressure, batching, and fault tolerance.
  """

  use Broadway

  @impl Broadway
  def handle_message(_processor, message, _context) do
    message
    |> Broadway.Message.update_data(&process_record/1)
  end

  @impl Broadway
  def handle_batch(:default, messages, _batch_info, _context) do
    records = Enum.map(messages, & &1.data)
    :ok = bulk_insert(records)
    messages
  end

  defp process_record(raw_data) do
    raw_data
    |> validate()
    |> transform()
    |> enrich()
  end
end
```

## Implementation in the Prismatic Platform

### Agent Concurrency Model

The 530 autonomous agents in the Prismatic Platform each run as independent BEAM processes. The AIAD framework organizes agents into tiers (L1 through L5), where each tier has different concurrency characteristics:

- **L1 Operational Units**: High concurrency, short-lived tasks, supervised by L2 agents
- **L2 Tactical Specialists**: Medium concurrency, longer-lived operations, orchestrate L1 agents
- **L3 Strategic Commanders**: Low concurrency, long-lived decision processes
- **L5 Supreme Authority**: Single process, highest authority, receives escalations

This hierarchical concurrency model ensures that operational work is highly parallel while strategic decisions are serialized through appropriate authority channels.

### LiveView Real-Time Concurrency

Each Phoenix LiveView connection runs in its own BEAM process. The Prismatic Web dashboard, with its real-time security monitoring, OSINT toolbox, and agent status displays, leverages this process-per-connection model to handle thousands of simultaneous users without shared state complications. Each user's LiveView process receives telemetry events via PubSub and updates its state independently.

### OSINT Concurrent Queries

When investigating an entity, the platform queries up to 120 OSINT sources concurrently. Task.async_stream provides controlled parallelism with configurable concurrency limits, timeouts, and automatic cleanup of timed-out queries. This approach ensures that slow sources do not block the entire investigation.

### Quality Gate Parallel Execution

The 13 quality domains (Dialyzer, Credo, compilation, DateTime precision, guard functions, and others) are evaluated concurrently during the pre-commit hook. Each domain check runs in its own process, and results are aggregated once all checks complete. This parallel execution keeps the pre-commit hook fast despite the breadth of checks performed.

## Comparison with Alternatives

| Model | Isolation | Scheduling | Failure Handling | Memory Overhead | Platform Fit |
|-------|-----------|------------|-----------------|----------------|-------------|
| **BEAM processes** | Full (separate heap) | Preemptive (fair) | Supervision trees | ~2KB per process | Primary model |
| **OS threads** | Shared memory | Preemptive (OS) | Crash = process death | ~1MB per thread | Not used |
| **Go goroutines** | Shared memory | Cooperative (mostly) | Panic propagation | ~8KB per goroutine | Not applicable |
| **Java virtual threads** | Shared memory | Preemptive (JVM) | Exception propagation | ~1KB per thread | Not applicable |
| **JavaScript async/await** | Single-threaded | Cooperative (event loop) | Unhandled rejections | Varies | Not applicable |
| **Rust async** | Ownership model | Cooperative (runtime) | Result types | Varies | Used in garden components |

The BEAM model is uniquely suited to the Prismatic Platform's requirements because it provides full process isolation (a crash in one agent cannot corrupt another's state), preemptive scheduling (no agent can starve others), and integrated fault tolerance (supervision trees automatically restart failed processes).

## Best Practices

1. **Use processes for isolation, not just parallelism** -- Even when parallelism is not needed, separate processes provide fault isolation and independent garbage collection.

2. **Prefer message passing over shared state** -- Processes should communicate through messages, not through shared ETS tables or application environment. This makes the system easier to reason about and test.

3. **Design supervision trees before writing code** -- The supervision tree is the architecture. Define which processes supervise which, what restart strategies apply, and what the maximum restart intensity should be.

4. **Implement backpressure** -- Use GenStage, Broadway, or Task.async_stream with max_concurrency limits to prevent unbounded concurrency from exhausting system resources.

5. **Keep process state small** -- Large process state means large messages when processes communicate and longer garbage collection pauses. Extract large data to ETS when appropriate.

6. **Use Registry for process discovery** -- Instead of naming processes with atoms (which are not garbage collected), use Registry for dynamic process registration and lookup.

7. **Monitor critical processes** -- Use Process.monitor/1 to detect when dependent processes terminate, rather than linking which propagates exit signals.

8. **Test concurrent code with deterministic tools** -- Use ExUnit's async: true for test parallelism but ensure tests do not share state. Use sandbox mode for database access in concurrent tests.

## Common Pitfalls

1. **Shared mutable state via ETS** -- Using ETS as a global mutable store defeats the purpose of process isolation. ETS should be used for read-heavy, write-rare data caching, not for inter-process communication.

2. **Process bottlenecks** -- Routing all messages through a single GenServer creates a bottleneck. Use partitioning, pooling (e.g., :poolboy), or Registry-based routing to distribute load.

3. **Unbounded message queues** -- If a process receives messages faster than it can handle them, its message queue grows without bound, eventually consuming all available memory. Implement backpressure or load shedding.

4. **Synchronous calls in concurrent contexts** -- Using GenServer.call/3 in a loop serializes what should be parallel work. Prefer cast or Task.async when responses are not immediately needed.

5. **Forgetting about process links** -- Spawning processes with spawn_link means the parent crashes if the child crashes (and vice versa). Use spawn or Task.Supervisor when the parent should survive child failures.

6. **Ignoring scheduler count** -- The BEAM runs one scheduler per CPU core by default. Running compute-intensive work in more concurrent processes than schedulers does not improve throughput; it just adds scheduling overhead.

7. **Blocking the scheduler** -- Long-running NIFs or synchronous HTTP calls block the scheduler thread, reducing concurrency for all processes on that scheduler. Use dirty schedulers or async NIFs for blocking operations.

8. **Over-engineering process topology** -- Not every piece of state needs its own GenServer. Simple computations should be plain functions. Reserve processes for truly concurrent, stateful, or fault-tolerant requirements.

## Use Cases

### Real-Time Security Monitoring

The Prismatic Perimeter EASM system monitors attack surfaces in real time. Each monitored domain has its own process that periodically checks certificates, DNS records, and vulnerability databases. Thousands of domains are monitored concurrently, with each process independently scheduling its next check and reporting results via PubSub.

### Concurrent OSINT Investigations

An OSINT investigation against a single entity can require queries to dozens of sources. The platform spawns concurrent tasks for each source, collects results with timeouts, and synthesizes findings. The concurrency model ensures that a slow response from one source (e.g., a throttled API) does not delay the entire investigation.

### Multi-Agent Orchestration

The AIAD agent framework orchestrates 530 agents running as concurrent BEAM processes. Strategic agents dispatch tasks to operational agents, monitor their progress, and handle failures through supervision. The entire agent hierarchy operates as a concurrent system with well-defined communication patterns.

### Parallel Quality Analysis

The quality gate system runs 13 different analysis tools concurrently during pre-commit checks. Each tool (Dialyzer, Credo, compilation warnings, etc.) runs in its own process, and results are collected and evaluated once all checks complete. This concurrent execution keeps the quality gate fast despite its comprehensive scope.

## Related Concepts

- [BEAM VM](/glossary/beam-vm/) -- The virtual machine providing BEAM process concurrency primitives
- [GenServer](/glossary/genserver/) -- The primary abstraction for stateful concurrent processes
- [Supervision Tree](/glossary/supervision-tree/) -- Hierarchical fault-tolerant process organization
- [Message Passing](/glossary/message-passing/) -- The communication mechanism between concurrent processes
- [Fault Tolerance](/glossary/fault-tolerance/) -- Reliability through process isolation and supervision
- [Process Isolation](/glossary/process-isolation/) -- Memory isolation between concurrent processes
- [Backpressure](/glossary/backpressure/) -- Flow control preventing resource exhaustion
- [Actor Model](/glossary/actor-model/) -- The theoretical foundation for BEAM concurrency
- [Distributed System](/glossary/distributed-system/) -- Extending concurrency across multiple nodes
- [Broadway](/glossary/broadway/) -- Data processing pipelines with built-in concurrency

## See Also

- [Erlang](/glossary/erlang/) -- The language that created the BEAM concurrency model
- [Elixir](/glossary/elixir/) -- The language used to implement platform concurrency
- [OTP](/glossary/otp/) -- The framework providing GenServer, Supervisor, and other concurrency tools
- [Concurrent Programming](/glossary/concurrent-programming/) -- The broader field of concurrent software development
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime process creation and supervision
- Glossary Index -- Complete listing of all platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
