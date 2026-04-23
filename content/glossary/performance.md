+++
title = "Performance"
weight = 50
[extra]
tags = ["glossary", "performance", "optimization", "latency", "throughput", "benchmarking", "telemetry", "beam", "elixir"]
description = "Measurable characteristics of system speed, throughput, resource usage, and responsiveness under load, with P0 enforcement of sub-250ms page loads and O(1) pattern detection in Prismatic Platform"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "systems-engineering"
related_concepts = ["latency", "throughput", "scalability", "observability", "telemetry", "caching", "backpressure"]
implementation_status = "production"
authority_level = "P0-absolute"
difficulty_rating = 7
prerequisites = ["elixir", "beam", "telemetry", "genserver"]
learning_path = "fundamentals -> profiling -> optimization -> production-monitoring"
interactive_demos = ["/labs/glossary/performance"]
code_examples = ["performance_tracker", "benchee_suite", "telemetry_handler", "ets_optimization"]
external_resources = ["https://hexdocs.pm/telemetry", "https://hexdocs.pm/benchee", "https://www.erlang.org/doc/efficiency_guide/users_guide.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["load_testing", "benchmark_regression", "memory_profiling", "latency_percentile_validation"]
keywords = ["performance", "optimization", "latency", "throughput", "benchmarking", "profiling", "p95", "p99", "response-time", "resource-utilization"]
related_terms = ["latency", "throughput", "scalability", "caching", "telemetry", "backpressure", "load-balancing", "observability", "beam", "ets"]
word_count = 1786
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Performance - Prismatic Platform"
+++

## Definition

Performance, in the context of software systems engineering, refers to the measurable characteristics that describe how efficiently a system executes its intended functions under specified conditions. These characteristics encompass response time (latency), data processing capacity (throughput), computational resource consumption (CPU, memory, I/O), and the system's ability to maintain acceptable behavior under varying load conditions. Performance is not a single metric but a multidimensional quality attribute that must be defined, measured, and enforced through quantitative standards.

In the Prismatic Platform, performance is elevated to a P0 (absolute priority) requirement. Every page must load in under 250 milliseconds, server-side rendering must complete within 100 milliseconds, and [LiveView](/glossary/liveview/) event handlers must respond in under 50 milliseconds. These are not aspirational targets but hard enforcement gates that block merges and trigger rollbacks when violated.

## Overview

Performance engineering spans the entire software development lifecycle, from architectural design decisions through implementation, testing, deployment, and production monitoring. Unlike functional correctness, which asks "does this produce the right answer?", performance asks "does this produce the right answer fast enough, with acceptable resource usage, under realistic load conditions?"

The discipline requires a systematic approach that begins with establishing clear, quantitative performance budgets, instrumenting systems to measure actual behavior, profiling to identify bottlenecks, optimizing critical paths, and continuously monitoring production systems to detect regressions. Performance is fundamentally an empirical discipline: intuition about what is slow or fast is frequently wrong, and only measurement provides reliable guidance.

Modern distributed systems face performance challenges at every layer of the stack. Network latency between services, database query execution time, serialization and deserialization overhead, garbage collection pauses, lock contention in concurrent systems, and cache hit ratios all contribute to end-user perceived performance. The [BEAM](/glossary/beam/) virtual machine provides unique advantages in this landscape through its process isolation model, preemptive scheduling, and soft real-time guarantees that prevent individual slow operations from degrading overall system responsiveness.

### Key Performance Metrics

Performance measurement centers on several fundamental metrics, each providing a different view of system behavior:

- **Latency**: The time elapsed between a request being issued and the response being received. Typically measured at p50 (median), p95, and p99 percentiles, since averages can mask tail latency problems.
- **Throughput**: The number of operations a system can process per unit of time, measured in requests per second (RPS), transactions per second (TPS), or messages per second.
- **Resource Utilization**: CPU usage, memory consumption, I/O bandwidth, and network bandwidth as percentages of available capacity.
- **Saturation**: How close a resource is to its maximum capacity, indicating when additional load will cause degradation.
- **Error Rate**: The percentage of operations that fail under load, which often increases as systems approach their capacity limits.

## Technical Details

### Latency Distribution and Percentiles

Performance analysis must focus on latency distributions rather than simple averages. A system with 10ms average latency might have a p99 of 500ms, meaning 1% of users experience 50x worse performance than the median. In high-traffic systems handling millions of requests daily, that 1% represents thousands of degraded user experiences.

The mathematical foundation uses cumulative distribution functions (CDFs) to describe latency behavior:

```
P(X <= t) = F(t)

Where:
  X = observed latency
  t = threshold value
  F(t) = proportion of requests completing within time t
```

For Prismatic Platform, the enforced thresholds are:

| Metric | Hard Limit | Percentile |
|--------|-----------|------------|
| Total page load | < 250ms | p95 |
| Server-side render | < 100ms | p95 |
| LiveView mount | < 150ms | p95 |
| LiveView handle_event | < 50ms | p95 |
| Health check | < 10ms | p99 |

### Algorithmic Complexity and O(1) Pattern Detection

The Prismatic Platform achieved a breakthrough in [quality gate](/glossary/quality-gate/) performance through O(1) pattern detection, providing 90-250x speedup over previous O(n) scanning approaches. This was accomplished by replacing linear file-by-file scanning with ETS-backed pattern indexes that enable constant-time lookups.

The theoretical basis for this optimization derives from hash table properties:

```
Linear scan:    T(n) = O(n) * k, where k = per-file pattern check cost
Indexed lookup: T(n) = O(1) * k, where k = hash table lookup cost

For n = 35,000 files:
  Linear:  ~500ms (14.3 microseconds per file)
  Indexed: ~2ms   (single hash lookup)
  Speedup: ~250x
```

### BEAM VM Performance Characteristics

The [BEAM](/glossary/beam/) virtual machine provides several performance properties that distinguish Erlang/[Elixir](/glossary/elixir/) systems from those built on conventional runtimes:

1. **Preemptive Scheduling**: Each process receives a fixed reduction budget (approximately 4000 reductions) before being preempted, ensuring no single process can monopolize a scheduler thread. This provides soft real-time guarantees without requiring cooperative yielding.

2. **Per-Process Garbage Collection**: Unlike stop-the-world collectors, BEAM performs garbage collection independently per process. A process with 100 bytes of heap generates microsecond GC pauses, while a process with 100MB of heap does not affect other processes.

3. **Process Isolation**: Each BEAM process has its own heap, stack, and mailbox. Memory allocation and deallocation for one process cannot cause latency spikes in another.

4. **Scheduler Binding**: BEAM schedulers can be bound to specific CPU cores, reducing context switch overhead and improving cache locality.

## Implementation in Prismatic Platform

### Performance Enforcement Architecture

The platform implements a multi-layer performance enforcement system that operates at build time, deploy time, and runtime:

```elixir
defmodule PrismaticPerformance.EnforcementGate do
  @moduledoc """
  P0 performance enforcement gate that blocks merges and triggers
  rollbacks when performance thresholds are violated.
  """

  @type metric :: :page_load | :server_render | :liveview_mount | :handle_event | :health_check
  @type threshold :: %{limit_ms: pos_integer(), percentile: float()}

  @thresholds %{
    page_load: %{limit_ms: 250, percentile: 0.95},
    server_render: %{limit_ms: 100, percentile: 0.95},
    liveview_mount: %{limit_ms: 150, percentile: 0.95},
    handle_event: %{limit_ms: 50, percentile: 0.95},
    health_check: %{limit_ms: 10, percentile: 0.99}
  }

  @spec check_threshold(metric(), [number()]) :: :ok | {:violation, map()}
  def check_threshold(metric, latencies) when is_list(latencies) do
    threshold = Map.fetch!(@thresholds, metric)
    observed = percentile(latencies, threshold.percentile)

    case observed <= threshold.limit_ms do
      true -> :ok
      false ->
        {:violation, %{
          metric: metric,
          observed_ms: observed,
          limit_ms: threshold.limit_ms,
          percentile: threshold.percentile,
          severity: classify_severity(observed, threshold.limit_ms)
        }}
    end
  end

  @spec percentile([number()], float()) :: number()
  defp percentile(latencies, p) do
    sorted = Enum.sort(latencies)
    index = ceil(length(sorted) * p) - 1
    Enum.at(sorted, max(index, 0))
  end

  @spec classify_severity(number(), pos_integer()) :: :v3_block | :v4_reject_rollback
  defp classify_severity(observed, limit) when observed <= limit * 2, do: :v3_block
  defp classify_severity(_observed, _limit), do: :v4_reject_rollback
end
```

### Telemetry Integration

The platform uses Erlang's [telemetry](/glossary/telemetry/) library for zero-overhead instrumentation of all performance-critical paths:

```elixir
defmodule PrismaticPerformance.TelemetryHandler do
  @moduledoc """
  Attaches to Phoenix and LiveView telemetry events to collect
  performance metrics for enforcement gate evaluation.
  """

  @spec attach_handlers() :: :ok
  def attach_handlers do
    events = [
      [:phoenix, :endpoint, :stop],
      [:phoenix, :live_view, :mount, :stop],
      [:phoenix, :live_view, :handle_event, :stop],
      [:phoenix, :router_dispatch, :stop]
    ]

    :telemetry.attach_many(
      "prismatic-performance-handler",
      events,
      &handle_event/4,
      %{}
    )
  end

  @spec handle_event(list(), map(), map(), map()) :: :ok
  def handle_event([:phoenix, :endpoint, :stop], measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :performance, :page_load],
      %{duration_ms: duration_ms},
      %{path: metadata.conn.request_path, method: metadata.conn.method}
    )
  end

  def handle_event([:phoenix, :live_view, :mount, :stop], measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :performance, :liveview_mount],
      %{duration_ms: duration_ms},
      %{view: inspect(metadata.socket.view)}
    )
  end

  def handle_event(_event, _measurements, _metadata, _config), do: :ok
end
```

### Git Tree Optimization

The [Git Trees](/glossary/git-trees/) system achieved approximately 100x performance improvement for codebase exploration by replacing filesystem traversal with `git ls-tree` operations:

```elixir
defmodule PrismaticGitTrees.FastLookup do
  @moduledoc """
  O(1) file lookup using git ls-tree with ETS caching.
  Replaces traditional find/ls -R operations.
  """

  @spec build_index(String.t()) :: {:ok, :ets.tid()} | {:error, term()}
  def build_index(repo_path) do
    table = :ets.new(:git_tree_index, [:set, :public, read_concurrency: true])

    case System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"], cd: repo_path) do
      {output, 0} ->
        output
        |> String.split("\n", trim: true)
        |> Enum.each(fn path ->
          ext = Path.extname(path)
          dir = Path.dirname(path)
          :ets.insert(table, {path, %{extension: ext, directory: dir}})
        end)

        {:ok, table}

      {error, code} ->
        {:error, {code, error}}
    end
  end

  @spec lookup(atom(), String.t()) :: {:ok, map()} | :not_found
  def lookup(table, path) do
    case :ets.lookup(table, path) do
      [{^path, metadata}] -> {:ok, metadata}
      [] -> :not_found
    end
  end
end
```

### Benchee Integration for Regression Testing

Every new [LiveView](/glossary/liveview/) page requires Benchee performance tests to prevent regressions:

```elixir
defmodule PrismaticPerformance.BencheeSuite do
  @moduledoc """
  Benchee-based performance regression test suite.
  Runs as part of CI pipeline to catch performance degradation.
  """

  @spec run_page_load_benchmark(String.t(), keyword()) :: Benchee.Suite.t()
  def run_page_load_benchmark(path, opts \\ []) do
    warmup = Keyword.get(opts, :warmup, 2)
    time = Keyword.get(opts, :time, 5)

    Benchee.run(
      %{
        "page_load_#{path}" => fn ->
          {:ok, conn} = simulate_request(path)
          assert conn.status == 200
        end
      },
      warmup: warmup,
      time: time,
      formatters: [
        {Benchee.Formatters.Console, extended_statistics: true},
        {Benchee.Formatters.HTML, file: "benchmarks/#{sanitize(path)}.html"}
      ],
      after_each: fn _ ->
        :ok
      end
    )
  end

  @spec simulate_request(String.t()) :: {:ok, Plug.Conn.t()} | {:error, term()}
  defp simulate_request(path) do
    conn = Phoenix.ConnTest.build_conn()
    {:ok, Phoenix.ConnTest.get(conn, path)}
  end

  @spec sanitize(String.t()) :: String.t()
  defp sanitize(path), do: String.replace(path, ~r/[^a-zA-Z0-9]/, "_")
end
```

## Comparison with Alternatives

### BEAM vs JVM Performance Model

| Characteristic | BEAM (Elixir/Erlang) | JVM (Java/Scala) |
|---------------|---------------------|-------------------|
| GC Model | Per-process, microsecond pauses | Stop-the-world (G1/ZGC mitigates) |
| Scheduling | Preemptive, reduction-based | OS threads, cooperative within executors |
| Tail Latency | Consistently low p99 | Can spike during GC pauses |
| Throughput | Moderate per-core | Higher per-core for CPU-bound work |
| Memory Overhead | ~300 bytes per process | ~1MB per thread |
| Concurrency Model | Actor-based message passing | Shared memory with locks/STM |
| Hot Code Reload | Built-in, zero downtime | Complex, often requires restart |

The BEAM excels at consistent, predictable [latency](/glossary/latency/) under concurrent load, while the JVM typically achieves higher raw throughput for CPU-intensive computation. For web applications and real-time systems where tail latency matters more than peak throughput, the BEAM provides superior characteristics.

### BEAM vs Go Performance Model

Go's goroutine model shares similarities with BEAM processes in terms of lightweight concurrency, but with critical differences. Go uses a shared memory model with channels for communication, while BEAM enforces complete process isolation with message passing. This means Go can achieve lower latency for in-process data sharing but is susceptible to contention-related performance degradation that BEAM avoids by design.

### Static vs Runtime Optimization

The Prismatic Platform combines both approaches. [Dialyzer](/glossary/dialyzer/) and [Credo](/glossary/credo/) catch performance anti-patterns at compile time (such as `length(list) > 0` instead of `list != []`), while [telemetry](/glossary/telemetry/) and Benchee provide runtime measurement. This dual approach catches both algorithmic inefficiencies and environmental performance issues.

## Best Practices

### 1. Measure Before Optimizing

Never optimize based on intuition. Use `:timer.tc/1`, Benchee, or [telemetry](/glossary/telemetry/) to establish baseline measurements before making changes. Profile with `:fprof`, `:eprof`, or `:cprof` to identify actual bottlenecks.

```elixir
# Correct: measure first
{time_us, result} = :timer.tc(fn -> expensive_operation(data) end)
Logger.info("Operation completed in #{time_us}us")

# Then optimize based on data, not assumptions
```

### 2. Design for Consistent Latency Over Peak Throughput

In user-facing systems, p99 latency matters more than average throughput. Design systems that maintain consistent response times even under load spikes, using [backpressure](/glossary/backpressure/) mechanisms and [circuit breakers](/glossary/circuit-breaker/) to gracefully degrade rather than collapse.

### 3. Use ETS for Read-Heavy Workloads

[ETS](/glossary/ets/) tables provide constant-time lookups with concurrent read access. For data that is read frequently but written rarely, ETS eliminates the overhead of [GenServer](/glossary/genserver/) message passing.

### 4. Avoid Unnecessary Data Copying

BEAM processes communicate through message passing, which copies data between process heaps. For large data structures, consider using ETS (which stores data outside process heaps) or binary references (which are reference-counted and shared).

### 5. Set Performance Budgets Early

Define quantitative performance requirements at the beginning of development, not after performance problems surface. The Prismatic Platform's P0 thresholds (250ms page load, 100ms server render) are established architectural constraints, not afterthoughts.

### 6. Monitor in Production

Development benchmarks do not predict production behavior. Use [observability](/glossary/observability/) tools to track actual performance in production, including percentile distributions, not just averages.

## Common Pitfalls

### Premature Optimization

Optimizing code before profiling wastes development time and often introduces complexity without measurable improvement. The classic sequence -- make it work, make it right, make it fast -- exists because correctness and clarity enable effective optimization.

### Averaging Latency

Reporting average latency hides tail latency problems. A system with 5ms average and 2-second p99 looks healthy by averages but is broken for 1% of users. Always report percentiles (p50, p95, p99, p99.9).

### Ignoring GC Pressure

Creating many short-lived large data structures increases garbage collection frequency. In BEAM, this is less catastrophic than in JVM (per-process GC), but it still consumes CPU time. Prefer streaming and lazy evaluation for large datasets.

### Blocking the Scheduler

Long-running CPU-bound operations in BEAM processes can block scheduler threads, increasing latency for all other processes on that scheduler. Use `Task.async/1` with dedicated process pools, or yield periodically with `Process.sleep(0)` for CPU-intensive work.

### N+1 Query Patterns

Loading a list of items and then querying related data for each item individually creates O(n) database round-trips instead of O(1) batch queries. Use [Ecto](/glossary/ecto/) preloading or explicit batch queries to eliminate this pattern.

### Micro-Benchmarking Without Context

Benchmarking a function in isolation may not reflect its performance in production where GC pressure, cache contention, and concurrent load alter behavior. Use realistic data sizes and concurrent load in benchmarks.

## Use Cases

### Real-Time Dashboard Performance

The Prismatic Platform's [LiveView](/glossary/liveview/) dashboards (including the [Perimeter EASM](/glossary/easm/) dashboard at `/perimeter`) maintain sub-150ms mount times and sub-50ms event handling through ETS-backed state, differential rendering, and careful avoidance of blocking database queries during event handling.

### High-Throughput OSINT Data Processing

The [OSINT](/glossary/osint/) toolbox processes data from 120+ intelligence sources. Performance is maintained through [Broadway](/glossary/broadway/)-based concurrent processing pipelines with configurable concurrency limits and [backpressure](/glossary/backpressure/) to prevent resource exhaustion.

### Quality Gate Execution

The platform's 11-phase pre-commit hook must complete in reasonable time to avoid disrupting developer workflow. O(1) pattern detection ensures that quality gates scale with pattern complexity, not codebase size.

### API Gateway Response Time

The [Prismatic API](/glossary/prismatic-api/) gateway at port 4004 uses ETS-cached endpoint discovery to avoid runtime module introspection on each request, maintaining sub-10ms dispatch overhead for the auto-introspecting REST API.

### Production Deployment

Fly.io deployments use health check endpoints that must respond within 10ms. The platform's health check implementation returns pre-computed status from [ETS](/glossary/ets/) rather than performing live system checks on each request.

## Related Concepts

- [Latency](/glossary/latency/): The time dimension of performance, measuring delay between request and response
- [Throughput](/glossary/throughput/): The capacity dimension of performance, measuring operations per unit time
- [Scalability](/glossary/scalability/): The ability to maintain performance characteristics as load increases
- [Caching](/glossary/caching/): Technique for reducing latency by storing precomputed or frequently accessed data
- [Telemetry](/glossary/telemetry/): The instrumentation framework for collecting performance measurements
- [Backpressure](/glossary/backpressure/): Flow control mechanism preventing performance degradation under overload
- [Load Balancing](/glossary/load-balancing/): Distribution of work across resources to optimize performance
- [Observability](/glossary/observability/): The ability to understand system performance from external outputs
- [BEAM](/glossary/beam/): The virtual machine providing Prismatic's performance characteristics
- [ETS](/glossary/ets/): In-memory storage providing O(1) lookup performance
- [Circuit Breaker](/glossary/circuit-breaker/): Pattern preventing cascading performance failures
- [Quality Gate](/glossary/quality-gate/): Enforcement mechanism including performance thresholds

## See Also

- [Performance Testing](/glossary/performance-testing/) for benchmark and load testing methodologies
- [Performance Tracking](/glossary/performance-tracking/) for continuous monitoring approaches
- [Git Trees](/glossary/git-trees/) for the ~100x filesystem optimization
- [Clean Run](/glossary/clean-run/) for the zero-warning compilation standard
- [Dialyzer](/glossary/dialyzer/) for static analysis that catches performance anti-patterns
- [Broadway](/glossary/broadway/) for high-throughput data processing pipelines
- [Connection Pooling](/glossary/connection-pooling/) for database performance optimization
- [LiveView](/glossary/liveview/) for real-time UI performance patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
