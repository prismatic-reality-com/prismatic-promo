+++
title = "Concurrent Programming"
description = "Programming paradigm for executing multiple computations simultaneously with coordination, enabling responsive and scalable software systems."
weight = 40

[extra]
category = "elixir"
tags = ["concurrency", "parallelism", "beam", "erlang", "elixir", "processes", "scheduling", "task", "genstage", "broadway", "flow", "async", "synchronization", "preemptive"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
difficulty = "advanced"
audience = ["developers", "architects", "systems-engineers", "performance-engineers"]
related_terms = ["actor-model", "beam", "process-isolation", "message-passing", "genserver", "otp", "elixir", "erlang", "parallel-computing", "fault-tolerance", "backpressure", "genstage"]
key_concepts = ["concurrency-vs-parallelism", "preemptive-scheduling", "message-passing", "shared-nothing", "backpressure", "supervision", "reduction-counting"]
platforms = ["beam", "erlang", "elixir", "go", "java", "rust"]
prerequisites = ["programming-fundamentals", "operating-system-concepts", "process-and-thread-models"]
use_cases = ["web-servers", "data-pipelines", "real-time-systems", "distributed-computing", "iot", "telecom"]
complexity = "high"
stability = "mature"
pioneer = "Edsger Dijkstra"
year_introduced = "1965"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1636
date_modified = "2026-02-23"
keywords = ["Concurrent", "Programming", "glossary", "elixir", "Prismatic Platform", "BEAM"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Concurrent Programming - Prismatic Platform"
+++

## Definition and Overview

Concurrent programming is a paradigm where multiple computations execute during overlapping time periods, potentially interacting with each other through communication and synchronization mechanisms. Unlike sequential programming where operations execute one after another, concurrent programs can make progress on multiple tasks simultaneously -- either through true parallelism (multiple CPU cores executing different tasks at the same physical time) or through interleaving (a single core rapidly switching between tasks to give the appearance of simultaneous execution).

The distinction between concurrency and parallelism is fundamental and often confused. **Concurrency** is about dealing with many things at once -- it is a structural property of the program that describes how independent activities are organized. **Parallelism** is about doing many things at once -- it is a runtime property of execution that describes how work is distributed across hardware. A concurrent program may run on a single core (using time-slicing) or across many cores (using true parallelism). Rob Pike's formulation captures this distinction precisely: "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once."

The [BEAM](@/glossary/beam.md) virtual machine excels at both: its preemptive scheduler manages millions of lightweight processes across all available CPU cores, providing both structural concurrency (the ability to model independent concerns as separate processes) and true parallelism (those processes executing on multiple cores simultaneously). This combination makes the BEAM uniquely suitable for systems that must handle many simultaneous activities with consistent latency guarantees.

Concurrent programming introduces challenges absent in sequential code: race conditions (outcomes depending on timing), deadlocks (circular waiting for resources), livelocks (processes continuously changing state without progress), starvation (some processes never receiving resources), and priority inversion (high-priority work blocked by low-priority work). Different concurrency models address these challenges in fundamentally different ways, and the choice of model has profound implications for system correctness, performance, and maintainability.

## Concurrency Models

The history of concurrent programming has produced several distinct models, each making different tradeoffs between safety, expressiveness, and performance. Understanding these models is essential for choosing the right approach for a given problem.

| Model | Shared State | Communication | Coordination | Examples |
|-------|-------------|---------------|--------------|----------|
| **Shared Memory** | Yes | Through memory | Locks, mutexes, semaphores | Java threads, C pthreads |
| **Actor Model** | No | Message passing | Mailboxes, selective receive | Erlang/Elixir, Akka |
| **CSP** | No | Channels | Channel operations | Go goroutines, Clojure core.async |
| **STM** | Controlled | Through refs | Transactions | Haskell STM, Clojure refs |
| **Dataflow** | No | Data dependencies | Automatic | Flow-based programming |
| **Async/Await** | Varies | Futures/Promises | Callbacks, coroutines | JavaScript, Rust, Python |

### Shared Memory Model

The oldest and most widely used concurrency model gives threads access to shared memory, with correctness enforced through synchronization primitives like locks, mutexes, and semaphores. While conceptually simple, this model is notoriously difficult to use correctly. Lock ordering problems cause deadlocks, missing locks cause race conditions, and lock contention limits scalability. Most concurrent bugs in production systems stem from incorrect use of shared memory concurrency.

### Actor Model

The [actor model](@/glossary/actor-model.md) eliminates shared state entirely. Each actor maintains private state and communicates exclusively through asynchronous [message passing](@/glossary/message-passing.md). This model is inherently free from races, deadlocks, and lock contention because there are no locks. The BEAM virtual machine provides the most mature implementation, with lightweight processes, preemptive scheduling, and built-in distribution.

### CSP (Communicating Sequential Processes)

CSP, formalized by Tony Hoare in 1978, uses typed channels for communication between sequential processes. Go's goroutines and channels implement CSP principles. The key difference from the actor model is that CSP channels are named entities that processes share, while in the actor model, messages are sent directly to actor addresses.

### Software Transactional Memory (STM)

STM provides transactional semantics for shared memory: transactions that conflict are automatically retried. This eliminates deadlocks and simplifies reasoning about concurrent state updates. However, STM requires careful management of side effects (which cannot be safely retried) and can suffer from livelock under high contention.

## BEAM Concurrency Architecture

The BEAM VM provides a uniquely powerful concurrency model that combines the theoretical elegance of the actor model with practical engineering for production systems.

```elixir
defmodule Prismatic.Concurrency.Scheduler do
  @moduledoc """
  Demonstrates BEAM scheduling concepts and how the runtime
  manages concurrent processes across CPU cores.

  The BEAM runs one scheduler per CPU core, each with its own
  run queue. Processes are distributed across schedulers using
  work-stealing for load balancing.
  """

  @type scheduler_info :: %{
    schedulers: non_neg_integer(),
    online_schedulers: non_neg_integer(),
    process_count: non_neg_integer(),
    run_queue_lengths: list(non_neg_integer())
  }

  @spec scheduler_info() :: {:ok, scheduler_info()}
  def scheduler_info do
    info = %{
      schedulers: :erlang.system_info(:schedulers),
      online_schedulers: :erlang.system_info(:schedulers_online),
      process_count: :erlang.system_info(:process_count),
      run_queue_lengths: Enum.map(
        1..:erlang.system_info(:schedulers),
        fn id -> :erlang.statistics({:run_queue_lengths, id}) end
      )
    }

    {:ok, info}
  end

  @doc """
  Demonstrates spawning millions of lightweight processes.

  Each BEAM process starts at ~2KB and grows as needed.
  This is in contrast to OS threads (~1MB stack) or
  JVM threads (~512KB-1MB stack).
  """
  @spec demonstrate_lightweight_processes(non_neg_integer()) :: {:ok, non_neg_integer()}
  def demonstrate_lightweight_processes(count) when count > 0 do
    parent = self()

    pids =
      for _i <- 1..count do
        spawn(fn ->
          send(parent, {:done, self()})
        end)
      end

    results =
      Enum.map(pids, fn _pid ->
        receive do
          {:done, pid} -> pid
        after
          5_000 -> :timeout
        end
      end)

    completed = Enum.count(results, &is_pid/1)
    {:ok, completed}
  end
end
```

### BEAM Scheduling

| Feature | Description | Impact |
|---------|-------------|--------|
| **Preemptive** | Processes preempted after ~4,000 reductions | No process can starve others |
| **Per-Core Scheduler** | One scheduler thread per CPU core | True parallelism |
| **Work Stealing** | Idle schedulers steal from busy ones | Automatic load balancing |
| **Dirty Schedulers** | Separate schedulers for blocking ops | Main schedulers stay responsive |
| **Reduction Counting** | Function calls counted, not time | Deterministic preemption |

### Per-Process Garbage Collection

One of the BEAM's most significant engineering achievements is per-process garbage collection. Each process has its own heap that is collected independently. This means:

- **No global GC pauses**: When one process's heap is collected, all other processes continue running
- **Predictable latency**: GC pauses are bounded by individual process heap sizes, not total system memory
- **Natural cleanup**: When a process terminates, its entire heap is freed instantly
- **Generational collection**: Young heaps are collected frequently, old heaps rarely

This property is critical for soft real-time systems where consistent latency matters. JVM-based actor systems (Akka) and Go programs suffer from global GC pauses that can introduce unpredictable latency spikes, particularly under memory pressure.

## Common Concurrency Patterns in Elixir

### Task-Based Parallelism

Tasks provide the simplest way to execute concurrent operations in Elixir. They are ideal for independent computations that need to be gathered and combined.

```elixir
defmodule Prismatic.Concurrency.TaskPatterns do
  @moduledoc """
  Common task-based concurrency patterns used throughout
  the Prismatic Platform for parallel data gathering,
  computation, and I/O operations.
  """

  @type fetch_result :: {:ok, map()} | {:error, term()}

  @doc """
  Fetches data from multiple sources in parallel.

  Each source is queried in its own process, and results
  are collected with a timeout. Failed sources return
  error tuples rather than crashing the caller.
  """
  @spec parallel_fetch(list({atom(), String.t()}), timeout()) :: list(fetch_result())
  def parallel_fetch(sources, timeout \\ 10_000) do
    sources
    |> Enum.map(fn {source, query} ->
      Task.async(fn ->
        try do
          fetch_from_source(source, query)
        rescue
          error -> {:error, {source, Exception.message(error)}}
        end
      end)
    end)
    |> Task.await_many(timeout)
  end

  @doc """
  Processes items concurrently with controlled parallelism.

  Uses Task.async_stream to limit the number of concurrent
  operations, preventing resource exhaustion when processing
  large collections.
  """
  @spec process_with_limit(list(term()), (term() -> term()), keyword()) :: list(term())
  def process_with_limit(items, processor, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online() * 2)
    timeout = Keyword.get(opts, :timeout, 30_000)

    items
    |> Task.async_stream(processor,
      max_concurrency: max_concurrency,
      timeout: timeout,
      on_timeout: :kill_task
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, reason} -> {:error, reason}
    end)
  end

  defp fetch_from_source(source, query) do
    {:ok, %{source: source, query: query, data: []}}
  end
end
```

### Pipeline Processing with GenStage

[GenStage](@/glossary/genstage.md) provides [backpressure](@/glossary/backpressure.md)-aware pipeline processing where each stage communicates demand upstream, preventing fast producers from overwhelming slow consumers.

```elixir
defmodule Prismatic.Concurrency.Pipeline do
  @moduledoc """
  Demonstrates a GenStage pipeline with backpressure.

  The pipeline consists of a producer (data source),
  a producer-consumer (transformer), and a consumer
  (side effects). Demand flows upstream, data flows
  downstream, ensuring the system processes data at
  the rate the slowest stage can handle.
  """

  defmodule Producer do
    @moduledoc false
    use GenStage

    @impl GenStage
    def init(initial_state) do
      {:producer, initial_state}
    end

    @impl GenStage
    def handle_demand(demand, state) when demand > 0 do
      events = generate_events(demand, state)
      new_state = update_state(state, length(events))
      {:noreply, events, new_state}
    end

    defp generate_events(count, state) do
      Enum.map(1..count, fn i ->
        %{id: state.offset + i, timestamp: DateTime.utc_now()}
      end)
    end

    defp update_state(state, count) do
      %{state | offset: state.offset + count}
    end
  end

  defmodule Transformer do
    @moduledoc false
    use GenStage

    @impl GenStage
    def init(opts) do
      {:producer_consumer, opts}
    end

    @impl GenStage
    def handle_events(events, _from, state) do
      transformed =
        events
        |> Enum.map(&transform/1)
        |> Enum.filter(&valid?/1)

      {:noreply, transformed, state}
    end

    defp transform(event), do: Map.put(event, :processed, true)
    defp valid?(%{id: id}), do: rem(id, 2) == 0
  end

  defmodule Consumer do
    @moduledoc false
    use GenStage

    @impl GenStage
    def init(opts) do
      {:consumer, opts}
    end

    @impl GenStage
    def handle_events(events, _from, state) do
      Enum.each(events, &persist/1)
      {:noreply, [], state}
    end

    defp persist(_event), do: :ok
  end
end
```

### Supervision Trees

Hierarchical process management ensures fault tolerance through the [supervision tree](@/glossary/supervision-tree.md) pattern:

```
Application
  |-- MainSupervisor (:one_for_one)
       |-- DatabasePool (poolboy - fixed workers)
       |-- CacheServer (GenServer - single process)
       |-- WorkerSupervisor (DynamicSupervisor)
            |-- Worker 1 (on-demand)
            |-- Worker 2 (on-demand)
            |-- Worker N (on-demand)
       |-- TelemetryPipeline (GenStage topology)
            |-- Producer
            |-- Transformer
            |-- Consumer
```

## Concurrency vs Parallelism in Practice

Understanding when concurrency and parallelism apply to real-world scenarios is essential for making correct architectural decisions.

| Scenario | Concurrency | Parallelism | BEAM Approach |
|----------|------------|-------------|---------------|
| Web server handling requests | Each request is a concurrent process | Requests execute on different cores | One process per connection |
| Data pipeline | Stages run concurrently | Independent items processed in parallel | GenStage/Broadway |
| UI + background work | UI and worker are concurrent | May or may not be parallel | Separate processes |
| Map-reduce | Map tasks are concurrent | Executed in parallel across cores | Task.async_stream |
| Real-time chat | Each user session concurrent | Messages routed in parallel | Phoenix Channels |
| OSINT collection | Each source queried concurrently | Sources fetched in parallel | Supervised Task pools |

## Concurrency Challenges and Solutions

### Race Conditions

Race conditions occur when the outcome of a computation depends on the relative timing of concurrent operations. The actor model eliminates most race conditions by design: each actor processes messages sequentially, so there is no concurrent access to actor state. However, race conditions can still occur at the system level when multiple actors coordinate on shared external resources.

```elixir
defmodule Prismatic.Concurrency.RaceAvoidance do
  @moduledoc """
  Demonstrates patterns for avoiding race conditions
  in actor-based concurrent systems.

  While individual actors are race-free by design,
  coordination between actors can still exhibit race
  conditions if not carefully managed.
  """

  use GenServer

  @type reservation :: %{
    resource_id: String.t(),
    holder: pid(),
    expires_at: DateTime.t()
  }

  @doc """
  Atomic check-and-reserve operation.

  By serializing all reservation requests through a single
  GenServer, we eliminate the race condition where two callers
  both check availability and both try to reserve.
  """
  @spec reserve(GenServer.server(), String.t(), pid()) ::
    {:ok, reservation()} | {:error, :already_reserved}
  def reserve(server, resource_id, requester) do
    GenServer.call(server, {:reserve, resource_id, requester})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{reservations: %{}}}
  end

  @impl GenServer
  def handle_call({:reserve, resource_id, requester}, _from, state) do
    case Map.get(state.reservations, resource_id) do
      nil ->
        reservation = %{
          resource_id: resource_id,
          holder: requester,
          expires_at: DateTime.add(DateTime.utc_now(), 300, :second)
        }

        new_state = put_in(state.reservations[resource_id], reservation)
        {:reply, {:ok, reservation}, new_state}

      _existing ->
        {:reply, {:error, :already_reserved}, state}
    end
  end
end
```

### Deadlocks

Deadlocks occur when two or more processes are waiting for each other to release resources, creating a circular dependency. In the actor model, deadlocks manifest as circular synchronous call chains: actor A calls actor B, which calls actor C, which calls actor A. The BEAM mitigates this through timeouts on `GenServer.call/3` (default 5 seconds), but the root solution is to design communication patterns that avoid circular dependencies.

### Backpressure

When a producer generates data faster than a consumer can process it, unbounded queues grow until memory is exhausted. Backpressure mechanisms allow consumers to signal their processing capacity to producers, creating a system that degrades gracefully under load rather than crashing. GenStage and Broadway implement demand-driven backpressure natively.

## Advanced Concurrency Patterns

### Flow for Parallel Data Processing

Flow builds on GenStage to provide a high-level API for parallel data processing, similar to Java streams or Apache Spark but integrated with the BEAM's process model.

```elixir
defmodule Prismatic.Concurrency.ParallelProcessing do
  @moduledoc """
  Demonstrates Flow for parallel data processing with
  automatic partitioning and back-pressure management.
  """

  @spec process_large_dataset(Enumerable.t(), keyword()) :: list(term())
  def process_large_dataset(data, opts \\ []) do
    stages = Keyword.get(opts, :stages, System.schedulers_online())

    data
    |> Flow.from_enumerable(stages: stages)
    |> Flow.filter(&valid_record?/1)
    |> Flow.map(&transform_record/1)
    |> Flow.partition(key: {:key, :category})
    |> Flow.reduce(fn -> %{} end, fn record, acc ->
      Map.update(acc, record.category, [record], &[record | &1])
    end)
    |> Enum.to_list()
  end

  defp valid_record?(%{status: :active}), do: true
  defp valid_record?(_), do: false

  defp transform_record(record) do
    Map.put(record, :processed_at, DateTime.utc_now())
  end
end
```

### Broadway for Event Processing

Broadway provides a multi-stage data ingestion and processing pipeline with built-in support for acknowledging messages, handling failures, and batching. It is used in the Prismatic Platform for processing OSINT intelligence events and telemetry data.

## Prismatic Platform Implementation

The Prismatic Platform leverages concurrent programming extensively across every subsystem.

| Subsystem | Concurrency Pattern | Scale |
|-----------|-------------------|-------|
| **530+ AIAD Agents** | Each agent is an independent concurrent process | 530+ processes |
| **OSINT Collection** | Parallel data gathering with backpressure | 120+ sources |
| **LiveView Sessions** | Each user session is a concurrent process | Per-user |
| **Storage Adapters** | Concurrent access to ETS, PostgreSQL, Meilisearch, KuzuDB | Per-adapter pool |
| **Telemetry Pipeline** | Concurrent event collection and aggregation | High-throughput |
| **Quality Gates** | Parallel execution of compilation, credo, dialyzer | Per-check |
| **API Requests** | Per-request process with timeout supervision | Per-request |
| **Color-Team Security** | Concurrent adversarial and defensive operations | 20 agents |

The platform's quality gate system demonstrates practical concurrent programming: when running `mix quality.gates`, the system spawns parallel processes for compilation checking, Credo analysis, Dialyzer type checking, forbidden pattern scanning, and test execution. Each check runs independently, and results are collected with timeouts to prevent any single check from blocking the pipeline.

## Performance Characteristics

| Metric | BEAM | JVM Threads | Go Goroutines | OS Threads |
|--------|------|-------------|---------------|------------|
| **Creation time** | ~3 microseconds | ~1 millisecond | ~5 microseconds | ~100 microseconds |
| **Memory per unit** | ~2KB | ~512KB-1MB | ~8KB | ~1MB |
| **Max concurrent** | Millions | Thousands | Hundreds of thousands | Hundreds |
| **Scheduling** | Preemptive | OS-scheduled | Cooperative | OS-scheduled |
| **GC impact** | Per-process | Global STW | Global (improving) | Per-thread heap |
| **Context switch** | ~0.1 microseconds | ~1-10 microseconds | ~0.3 microseconds | ~1-10 microseconds |

## Historical Context

| Year | Milestone |
|------|-----------|
| **1965** | Dijkstra introduces the concept of concurrent programming and the semaphore |
| **1971** | Dijkstra publishes "Hierarchical Ordering of Sequential Processes" |
| **1973** | Hewitt proposes the [actor model](@/glossary/actor-model.md) |
| **1974** | Lamport introduces the "happened before" relation for distributed systems |
| **1978** | Hoare publishes CSP (Communicating Sequential Processes) |
| **1986** | Erlang development begins at Ericsson with actor-based concurrency |
| **1995** | Java brings threads to mainstream programming |
| **2005** | Herb Sutter publishes "The Free Lunch Is Over" -- multicore era begins |
| **2009** | Go launches with goroutines and channels (CSP-inspired) |
| **2012** | Elixir brings modern syntax to BEAM concurrency |
| **2015** | Rust introduces ownership-based concurrency safety |
| **2020s** | Structured concurrency emerges (Java Loom, Kotlin, Swift) |

## Related Concepts

- [Actor Model](@/glossary/actor-model.md) -- Concurrency model used by BEAM
- [BEAM](@/glossary/beam.md) -- Virtual machine with built-in concurrency
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM process independence
- [Message Passing](@/glossary/message-passing.md) -- Inter-process communication
- [GenStage](@/glossary/genstage.md) -- Back-pressure aware pipelines
- [GenServer](@/glossary/genserver.md) -- Generic server behavior for concurrent state
- [OTP](@/glossary/otp.md) -- Framework for concurrent applications
- [Supervision Tree](@/glossary/supervision-tree.md) -- Fault tolerance for concurrent processes
- [Backpressure](@/glossary/backpressure.md) -- Flow control in concurrent systems
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- Resilience in concurrent systems

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
