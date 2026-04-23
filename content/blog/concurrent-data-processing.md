+++
title = "Concurrent Data Processing with Task, Flow, and async_stream"
date = 2026-03-22
description = "Practical patterns for concurrent data processing in Elixir using Task, Flow, and Task.async_stream for OSINT adapter queries, timeout management, and error isolation."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["elixir", "concurrency", "task", "flow", "async"]
reading_time = "10 min"
keywords = ["elixir concurrent processing", "task async stream", "flow elixir", "parallel processing", "error isolation"]
image = "/images/blog/concurrent-data-processing.png"
word_count = 1350
date_created = "2026-03-22"
date_modified = "2026-03-22"
quality_score = 90
see_also = ["concurrency", "broadway", "genstage", "backpressure", "task-module"]
image_alt = "Concurrent Data Processing in Elixir - Prismatic Platform"
+++

Elixir makes concurrent programming accessible through lightweight processes. But choosing the right concurrency primitive for each situation is critical. This post covers the three main tools -- `Task`, `Flow`, and `Task.async_stream` -- and when to use each.

## Task: Fire-and-Forget and Await

`Task` is the simplest concurrency primitive. It spawns a process to execute a function and optionally returns the result.

### Fire-and-Forget

When you do not need the result:

```elixir
Task.start(fn ->
  Prismatic.Events.DDPipeline.broadcast_case_created(case_id)
end)
```

This is useful for side effects like notifications, logging, or cache warming. The calling process continues immediately.

### Await Pattern

When you need the result:

```elixir
task = Task.async(fn ->
  Prismatic.OSINT.Shodan.search(query)
end)

# Do other work while Shodan query runs...
other_result = compute_something()

# Now get the Shodan result (blocks until ready, 5s timeout)
shodan_result = Task.await(task, :timer.seconds(5))
```

### Parallel Fan-Out

Query multiple OSINT adapters simultaneously:

```elixir
@spec query_all_adapters(String.t(), keyword()) :: [adapter_result()]
def query_all_adapters(target, opts \\ []) do
  timeout = Keyword.get(opts, :timeout, :timer.seconds(30))

  adapters = [
    {Prismatic.OSINT.Shodan, :search},
    {Prismatic.OSINT.VirusTotal, :lookup},
    {Prismatic.OSINT.CertTransparency, :search},
    {Prismatic.OSINT.WHOIS, :lookup}
  ]

  adapters
  |> Enum.map(fn {module, function} ->
    Task.async(fn ->
      try do
        {module, apply(module, function, [target])}
      rescue
        e in [HTTPoison.Error, Jason.DecodeError] ->
          {module, {:error, Exception.message(e)}}
      end
    end)
  end)
  |> Task.await_many(timeout)
end
```

`Task.await_many/2` waits for all tasks to complete within the timeout. If any task exceeds the timeout, the calling process exits.

## Task.async_stream: Bounded Concurrency

When processing a list of items concurrently, `Task.async_stream` provides bounded parallelism:

```elixir
@spec enrich_entities([Entity.t()], keyword()) :: [enrichment_result()]
def enrich_entities(entities, opts \\ []) do
  max_concurrency = Keyword.get(opts, :max_concurrency, 10)
  timeout = Keyword.get(opts, :timeout, :timer.seconds(15))

  entities
  |> Task.async_stream(
    fn entity -> enrich_single(entity) end,
    max_concurrency: max_concurrency,
    timeout: timeout,
    on_timeout: :kill_task,
    ordered: false
  )
  |> Enum.reduce([], fn
    {:ok, {:ok, result}}, acc -> [result | acc]
    {:ok, {:error, reason}}, acc ->
      Logger.warning("Entity enrichment failed: #{inspect(reason)}")
      acc
    {:exit, reason}, acc ->
      Logger.warning("Entity enrichment crashed: #{inspect(reason)}")
      acc
  end)
  |> Enum.reverse()
end
```

Key options:

| Option | Default | Purpose |
|---|---|---|
| `max_concurrency` | `System.schedulers_online/0` | Max simultaneous tasks |
| `timeout` | `5000` | Per-task timeout in ms |
| `on_timeout` | `:exit` | `:kill_task` to silently kill, `:exit` to crash caller |
| `ordered` | `true` | `false` for better throughput when order doesn't matter |
| `zip_input_on_exit` | `false` | Include original input in exit tuples |

### Error Isolation

The `on_timeout: :kill_task` option is critical for OSINT operations. A single slow adapter should not block the entire pipeline:

```elixir
defmodule Prismatic.OSINT.ParallelSearch do
  @spec search(String.t(), [module()]) :: %{atom() => term()}
  def search(query, adapters) do
    adapters
    |> Task.async_stream(
      fn adapter ->
        {adapter, adapter.search(query)}
      end,
      max_concurrency: length(adapters),
      timeout: :timer.seconds(10),
      on_timeout: :kill_task
    )
    |> Enum.reduce(%{}, fn
      {:ok, {adapter, result}}, acc ->
        Map.put(acc, adapter, result)

      {:exit, _reason}, acc ->
        acc
    end)
  end
end
```

If Shodan takes 15 seconds, it gets killed after 10, and the results from VirusTotal, WHOIS, and others are still returned.

## Flow: Data-Parallel Processing

`Flow` (built on GenStage) is for CPU-bound parallel processing of large collections. It partitions data across stages and processes items in parallel:

```elixir
defmodule Prismatic.DD.BulkAnalyzer do
  @spec analyze_entities([Entity.t()]) :: [AnalysisResult.t()]
  def analyze_entities(entities) when length(entities) > 100 do
    entities
    |> Flow.from_enumerable(max_demand: 50, stages: System.schedulers_online())
    |> Flow.partition(key: {:key, :entity_type})
    |> Flow.map(&score_entity/1)
    |> Flow.filter(fn {_entity, score} -> score > 0.3 end)
    |> Flow.map(fn {entity, score} ->
      %AnalysisResult{
        entity_id: entity.id,
        score: score,
        analyzed_at: DateTime.utc_now()
      }
    end)
    |> Flow.reduce(fn -> [] end, fn result, acc -> [result | acc] end)
    |> Enum.to_list()
    |> List.flatten()
  end

  def analyze_entities(entities) do
    # For small collections, Flow overhead is not worth it
    Enum.map(entities, fn entity ->
      {_entity, score} = score_entity(entity)
      %AnalysisResult{entity_id: entity.id, score: score, analyzed_at: DateTime.utc_now()}
    end)
  end
end
```

### When to Use Flow vs Task.async_stream

| Criterion | Task.async_stream | Flow |
|---|---|---|
| Collection size | Small to medium (< 1000) | Large (> 1000) |
| Operation type | I/O-bound (HTTP, DB) | CPU-bound (parsing, scoring) |
| Memory model | All results in memory | Streaming, bounded memory |
| Partitioning | None (round-robin) | Key-based partitioning |
| Backpressure | Via max_concurrency | Built-in GenStage backpressure |
| Complexity | Simple | More setup |

## Timeout Management

Timeouts are the most important aspect of concurrent processing. Every external call must have a timeout:

```elixir
defmodule Prismatic.OSINT.TimeoutWrapper do
  @moduledoc """
  Wraps adapter calls with consistent timeout handling.
  """

  @default_timeout :timer.seconds(15)

  @spec with_timeout((() -> term()), pos_integer()) :: {:ok, term()} | {:error, :timeout}
  def with_timeout(fun, timeout \\ @default_timeout) do
    task = Task.async(fun)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> {:ok, result}
      nil -> {:error, :timeout}
    end
  end
end
```

The `Task.yield/2` + `Task.shutdown/1` pattern is more graceful than `Task.await/2`. It gives the task a chance to complete, then shuts it down cleanly if it does not.

### Cascading Timeouts

For multi-step operations, use decreasing timeouts:

```elixir
def investigate(target) do
  overall_deadline = System.monotonic_time(:millisecond) + 60_000

  with {:ok, dns} <- query_with_deadline(:dns, target, overall_deadline),
       {:ok, whois} <- query_with_deadline(:whois, target, overall_deadline),
       {:ok, certs} <- query_with_deadline(:certs, target, overall_deadline) do
    {:ok, %{dns: dns, whois: whois, certs: certs}}
  end
end

defp query_with_deadline(source, target, deadline) do
  remaining = deadline - System.monotonic_time(:millisecond)

  if remaining > 0 do
    TimeoutWrapper.with_timeout(
      fn -> query_source(source, target) end,
      min(remaining, :timer.seconds(15))
    )
  else
    {:error, :deadline_exceeded}
  end
end
```

Each subsequent step gets less time, ensuring the overall operation completes within the deadline.

## Supervised Tasks

For tasks that must be monitored and restarted on failure, use `Task.Supervisor`:

```elixir
# In application.ex
children = [
  {Task.Supervisor, name: Prismatic.OSINT.TaskSupervisor}
]

# Starting a supervised task
Task.Supervisor.async(
  Prismatic.OSINT.TaskSupervisor,
  fn -> long_running_investigation(params) end
)
```

This ensures that if the task crashes, the supervisor handles cleanup. For fire-and-forget supervised tasks:

```elixir
Task.Supervisor.start_child(
  Prismatic.OSINT.TaskSupervisor,
  fn -> send_notification(event) end,
  restart: :transient
)
```

## Summary

| Tool | Best For | Concurrency Control | Error Handling |
|---|---|---|---|
| `Task.async/await` | 1-10 parallel operations | Manual | Caller crashes on timeout |
| `Task.async_stream` | Processing lists concurrently | `max_concurrency` | Configurable per-task |
| `Flow` | Large dataset parallel processing | Stages + demand | GenStage backpressure |
| `Task.Supervisor` | Long-running supervised work | Supervisor strategy | Restart policies |

Choose the simplest tool that meets your needs. Most OSINT adapter queries use `Task.async_stream`. Bulk entity analysis uses `Flow`. Individual background operations use supervised tasks. The key is always setting explicit timeouts and handling failures gracefully.
