+++
title = "Execution Time"
description = "The elapsed duration of a query, function call, or operation from invocation to completion, measured in microseconds to milliseconds for performance monitoring and optimization."
weight = 50

[extra]
domain = "performance"
category = "performance"
tags = ["execution-time", "performance", "latency", "profiling", "telemetry", "benchee", "timing", "optimization", "p95", "p99", "timer-tc", "monotonic-time", "instrumentation", "beam-scheduling"]
date_created = "2026-02-23"
date_updated = "2026-04-02"
difficulty = "intermediate"
audience = ["developers", "sre", "performance-engineers", "architects"]
related_terms = ["latency", "throughput", "profiling", "telemetry", "benchee", "flame-graph", "percentile", "genserver", "ets", "otel", "health-check", "scheduler", "garbage-collection"]
key_concepts = ["wall-clock-time", "cpu-time", "percentile-reporting", "tail-latency", "instrumentation", "scheduler-time", "reduction-counting", "gc-pauses"]
platforms = ["beam", "elixir", "telemetry", "benchee"]
prerequisites = ["performance-basics", "telemetry-fundamentals", "statistics"]
use_cases = ["performance-monitoring", "sla-compliance", "bottleneck-detection", "regression-testing", "capacity-planning", "budget-enforcement"]
complexity = "medium"
stability = "mature"
beam_related = true
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
word_count = 3400
date_modified = "2026-04-02"
keywords = ["Execution Time", "performance", "latency", "glossary", "Prismatic Platform", "timer.tc", "Benchee", "telemetry", "BEAM scheduling", "tail latency"]
quality_score = 95
see_also = ["capabilities", "architecture", "telemetry", "profiling", "latency"]
image = "/images/sections/glossary.png"
image_alt = "Execution Time - Prismatic Platform"
+++

## Definition and Overview

Execution time is the measured duration between the start and completion of a computational operation, encompassing all processing, I/O waits, and scheduling delays experienced by the operation. In performance engineering, execution time is the primary metric for understanding system responsiveness and identifying optimization opportunities. It is typically measured in microseconds (for in-memory operations) to milliseconds (for I/O-bound operations) and reported as distributions rather than single values to capture the full range of performance behavior. For the BEAM virtual machine, execution time measurement carries additional nuance because the scheduler may preempt a process after a fixed number of reductions, meaning wall-clock time includes time the process spent in the run queue waiting for a scheduler thread.

The distinction between wall-clock time and CPU time is critical for accurate performance analysis. Wall-clock time measures the total elapsed duration including time the process spent waiting (for I/O, locks, scheduling, or network responses). CPU time measures only the time the CPU was actively executing instructions for the operation. A database query might have 2ms of CPU time but 50ms of wall-clock time if it spent 48ms waiting for disk I/O. Understanding which type of execution time is being measured determines the appropriate optimization strategy. On the BEAM, a third category exists: scheduler time, which measures how long a process occupied a scheduler thread. The distinction matters because a process performing a long NIF call blocks the scheduler without consuming reductions, distorting both wall-clock and reduction-based measurements.

Execution time measurements are inherently statistical. A single measurement is unreliable due to system noise (garbage collection, scheduling jitter, cache effects, background load). Production performance monitoring uses percentile distributions -- P50 (median), P95 (95th percentile), P99 (99th percentile), and P99.9 -- to characterize both typical and tail-end performance. Optimizing the median improves the common case, while optimizing tail latency (P99, P99.9) improves worst-case user experience. The BEAM's per-process garbage collection model means GC pauses affect individual request latencies rather than creating global stop-the-world pauses, making tail latency analysis especially important for identifying processes with large heaps.

## Core Concepts

| Concept | Description | BEAM Relevance |
|---------|-------------|----------------|
| **Wall-Clock Time** | Total elapsed real time from start to finish | Includes run-queue wait, GC, I/O |
| **CPU Time** | Time CPU actively executed instructions | Excludes I/O wait, scheduling delays |
| **Scheduler Time** | Time a process occupied a scheduler thread | Relevant for NIF calls and busy-waiting |
| **Reductions** | BEAM work unit count (approx. function calls) | Process preempted every ~4000 reductions |
| **Monotonic Time** | Strictly increasing clock, immune to NTP adjustments | `System.monotonic_time/1` for intervals |
| **System Time** | Wall-clock time subject to NTP corrections | `System.system_time/1` for timestamps |
| **GC Pause** | Per-process garbage collection interruption | Affects individual request, not global |
| **Tail Latency** | P99/P99.9 worst-case response times | Often caused by GC, scheduling, or I/O |
| **Percentile** | Statistical rank in a distribution | P50=median, P95/P99 for SLA boundaries |
| **Budget** | Maximum allowed execution time for an operation | Enforced via telemetry handlers |
| **Instrumentation** | Code that measures and reports timing | Telemetry spans, `:timer.tc`, manual |
| **Warm-up** | Initial slow runs before JIT/cache effects stabilize | Critical for accurate benchmarking |

## Technical Deep Dive

### Measurement Methods

| Method | Precision | Overhead | Use Case | BEAM-Specific Notes |
|--------|-----------|----------|----------|---------------------|
| `:timer.tc/1` | Microseconds | Very low | Function-level timing | Uses `erlang:monotonic_time`, safe for intervals |
| `System.monotonic_time/1` | Nanoseconds | Minimal | High-precision intervals | Immune to NTP drift, preferred for deltas |
| `System.system_time/1` | Nanoseconds | Minimal | Absolute timestamps | Subject to NTP adjustments, not for intervals |
| `:telemetry.span/3` | Configurable | Low | Structured instrumentation | Standard for Phoenix/Ecto/LiveView events |
| Benchee | Statistical | High (benchmark mode) | Micro-benchmarks | Handles warm-up, statistical analysis, GC tracking |
| `:fprof` | Call-level | High | Profiling investigations | Traces every function call, generates flame graphs |
| `:eprof` | Call-level | Moderate | Time distribution | Shows time per function, less overhead than fprof |
| `:cprof` | Call count | Low | Hot path detection | Counts calls, no timing, very low overhead |
| `:msacc` | Scheduler | Low | Scheduler utilization | Shows time in schedulers, GC, I/O, aux threads |
| `recon_trace` | Runtime | Low-moderate | Production tracing | Safe for production, rate-limited, match specs |

### Percentile Reporting

| Percentile | Meaning | Typical SLA | Monitoring Action |
|-----------|---------|-------------|-------------------|
| **P50** (Median) | Half of requests faster | Informational | Dashboard baseline |
| **P75** | 75% of requests faster | Internal target | Early warning indicator |
| **P90** | 90% of requests faster | Warning threshold | Alert on sustained breach |
| **P95** | 95% of requests faster | Alerting threshold | Page on-call if sustained |
| **P99** | 99% of requests faster | SLA boundary | Hard SLA violation trigger |
| **P99.9** | 99.9% of requests faster | Critical alert | Immediate investigation |
| **Max** | Absolute worst case | Diagnostic only | Never use for SLA (single outlier) |

### Common Execution Time Budgets

| Operation | Target | Hard Limit | Category | Measurement Point |
|-----------|--------|-----------|----------|-------------------|
| ETS lookup | < 1 us | < 10 us | In-memory | `:timer.tc` around `:ets.lookup` |
| GenServer call (local) | < 100 us | < 1 ms | Inter-process | Telemetry span on `handle_call` |
| GenServer call (distributed) | < 5 ms | < 50 ms | Network | Includes serialization + network |
| PostgreSQL simple query | < 5 ms | < 50 ms | Database | Ecto telemetry `[:repo, :query]` |
| PostgreSQL complex join | < 20 ms | < 200 ms | Database | Query plan analysis required |
| Meilisearch search | < 10 ms | < 100 ms | Search | HTTP client telemetry |
| HTTP API response | < 50 ms | < 250 ms | Network | Phoenix endpoint telemetry |
| LiveView mount | < 100 ms | < 150 ms | UI | `[:phoenix, :live_view, :mount]` |
| LiveView handle_event | < 50 ms | < 100 ms | UI | `[:phoenix, :live_view, :handle_event]` |
| Page render (full) | < 150 ms | < 250 ms | UI | End-to-end browser measurement |
| Health check | < 5 ms | < 10 ms | System | `/api/health` endpoint timing |
| OSINT tool execution | < 5s | < 30s | External API | Per-adapter telemetry |
| DD pipeline phase | < 10s | < 60s | Pipeline | PubSub event timestamps |

### BEAM-Specific Timing Considerations

The BEAM virtual machine introduces several factors that affect execution time measurement accuracy:

**Reduction-Based Preemption**: The BEAM scheduler preempts processes after approximately 4000 reductions (roughly equivalent to function calls). This means a process measuring its own execution time may include time spent in the run queue between scheduler slices. For latency-sensitive measurements, this effect is negligible for short operations but can add milliseconds under high scheduler contention.

**Per-Process Garbage Collection**: Unlike JVM stop-the-world GC, BEAM garbage-collects each process independently. A process with a large heap (e.g., one accumulating results from a long Enum.reduce) will experience longer GC pauses, visible as spikes in its execution time. The `fullsweep_after` process flag controls how aggressively the GC reclaims memory.

**Dirty Schedulers**: Long-running NIFs and BIFs execute on dirty schedulers to avoid blocking normal schedulers. Operations dispatched to dirty schedulers may experience additional latency from dirty scheduler availability. CPU-bound NIFs use dirty CPU schedulers (equal to CPU cores), while I/O-bound NIFs use dirty I/O schedulers (default 10).

**Timer Wheel Resolution**: The BEAM's timer wheel has a resolution of approximately 1ms. Operations using `Process.send_after/3` or `:timer.send_after/2` cannot achieve sub-millisecond precision. For high-precision timing, always use `System.monotonic_time/1` directly.

### Statistical Analysis for Benchmarking

Accurate benchmarking requires statistical rigor beyond simple averaging:

| Technique | Purpose | Implementation |
|-----------|---------|----------------|
| **Warm-up runs** | Eliminate cold-start effects (cache, JIT) | Benchee default: 2 seconds warm-up |
| **Multiple iterations** | Reduce measurement noise | Minimum 1000 iterations for microsecond ops |
| **Standard deviation** | Quantify measurement spread | Benchee reports automatically |
| **IQR filtering** | Remove outliers (GC spikes) | Filter beyond 1.5x interquartile range |
| **Memory measurement** | Correlate time with allocation | Benchee `:memory` option |
| **GC tracking** | Identify GC-dominated measurements | `:erlang.statistics(:garbage_collection)` |
| **Comparison** | Relative performance between implementations | Benchee comparison reports |

## Architecture and Implementation

Execution time monitoring in production systems follows a layered architecture. The instrumentation layer embeds timing measurements at strategic points in the code. The collection layer aggregates raw measurements into statistical summaries using reservoir sampling or histogram data structures. The reporting layer publishes metrics to monitoring dashboards and triggers alerts when thresholds are exceeded.

The instrumentation strategy must balance comprehensiveness against overhead. Instrumenting every function call would provide complete visibility but introduce unacceptable overhead. The recommended approach is to instrument at service boundaries (API endpoints, database queries, external HTTP calls, GenServer calls) where execution time directly impacts user experience, and use profiling tools for deeper investigation when monitoring identifies hotspots.

BEAM's built-in Telemetry library provides the standard instrumentation mechanism for Elixir applications. Telemetry uses a publish-subscribe model where instrumented code emits events with timing measurements, and handlers aggregate and report these measurements without coupling the instrumented code to specific monitoring tools.

The three-tier monitoring architecture works as follows:

1. **Instrumentation Tier**: Code emits telemetry events at boundaries. Phoenix, Ecto, and LiveView emit events automatically. Custom code uses `:telemetry.span/3` for consistent measurement.

2. **Aggregation Tier**: Telemetry handlers receive events and update in-memory data structures (histograms, counters, gauges). ETS tables provide fast, concurrent-safe storage for aggregated metrics. The aggregation window is typically 10-60 seconds.

3. **Reporting Tier**: Aggregated metrics are exported to external monitoring systems (Prometheus, StatsD, Datadog) or displayed on internal dashboards. Alerting rules trigger when percentile thresholds are breached over sustained periods.

### Budget Enforcement Architecture

Budget enforcement transforms passive monitoring into active prevention. When an operation exceeds its time budget, the system can take corrective action: logging a warning, incrementing a counter, or (in extreme cases) terminating the operation. The budget enforcement pipeline:

1. Operation starts, monotonic timestamp captured
2. Operation completes, duration calculated
3. Duration compared against operation-specific budget
4. If over budget: telemetry event emitted with `over_budget: true` metadata
5. Alert handler evaluates frequency of over-budget events
6. Sustained violations trigger alerts and investigation

## Usage in Prismatic Platform

The Prismatic Platform instruments all critical code paths with Telemetry-based execution time tracking, enforcing hard limits defined in the page load performance policy. The PERF doctrine mandates that no unbounded queries, N+1 patterns, or blocking async operations are permitted, and execution time monitoring is the primary mechanism for detecting violations at runtime.

```elixir
defmodule Prismatic.Performance.ExecutionTimer do
  @moduledoc """
  Execution time measurement and reporting utilities.

  Integrates with Telemetry for structured monitoring and enforces
  platform performance standards defined in the PERF doctrine.
  Provides both synchronous measurement (for inline timing) and
  Telemetry-based instrumentation (for production monitoring).

  ## Budget Categories

  The platform defines execution time budgets for all critical operations:

  - `:ets_lookup` - < 10 us hard limit
  - `:genserver_call` - < 1 ms hard limit
  - `:db_query` - < 50 ms hard limit
  - `:page_render` - < 250 ms hard limit
  - `:liveview_mount` - < 150 ms hard limit
  - `:api_response` - < 250 ms hard limit
  - `:health_check` - < 10 ms hard limit

  ## Examples

      iex> {elapsed, result} = Prismatic.Performance.ExecutionTimer.measure(:db_query, fn ->
      ...>   Repo.all(from u in User, limit: 10)
      ...> end)
      iex> is_integer(elapsed) and elapsed >= 0
      true

      iex> Prismatic.Performance.ExecutionTimer.within_budget?(500, :ets_lookup)
      true

      iex> Prismatic.Performance.ExecutionTimer.within_budget?(20_000, :ets_lookup)
      false
  """

  require Logger

  @type operation ::
          :ets_lookup
          | :genserver_call
          | :db_query
          | :search_query
          | :page_render
          | :liveview_mount
          | :liveview_handle_event
          | :api_response
          | :health_check
          | :osint_tool
          | :dd_pipeline_phase

  @type budget_us :: non_neg_integer()

  @budgets %{
    ets_lookup: 10,
    genserver_call: 1_000,
    db_query: 50_000,
    search_query: 100_000,
    page_render: 250_000,
    liveview_mount: 150_000,
    liveview_handle_event: 100_000,
    api_response: 250_000,
    health_check: 10_000,
    osint_tool: 30_000_000,
    dd_pipeline_phase: 60_000_000
  }

  @doc """
  Measures execution time of a function and emits a telemetry event.

  Returns a tuple of `{elapsed_microseconds, function_result}`.
  The telemetry event is emitted under `[:prismatic, :execution_time]`
  with the duration and operation name as metadata.

  ## Parameters

  - `operation_name` - Atom identifying the operation category
  - `fun` - Zero-arity function to measure

  ## Examples

      iex> {us, val} = Prismatic.Performance.ExecutionTimer.measure(:db_query, fn -> 42 end)
      iex> is_integer(us) and val == 42
      true
  """
  @spec measure(operation(), (-> result)) :: {non_neg_integer(), result} when result: var
  def measure(operation_name, fun) do
    start = System.monotonic_time(:microsecond)
    result = fun.()
    elapsed = System.monotonic_time(:microsecond) - start

    :telemetry.execute(
      [:prismatic, :execution_time],
      %{duration_us: elapsed},
      %{operation: operation_name, over_budget: not within_budget?(elapsed, operation_name)}
    )

    unless within_budget?(elapsed, operation_name) do
      Logger.warning(
        "Execution time over budget: #{operation_name} took #{elapsed}us " <>
          "(budget: #{Map.get(@budgets, operation_name, :unlimited)}us)"
      )
    end

    {elapsed, result}
  end

  @doc """
  Wraps an Ecto query with execution time measurement.

  Executes the query through the specified Repo and measures the
  total time including query planning, execution, and result decoding.

  ## Parameters

  - `query` - An Ecto queryable (schema, query, or fragment)
  - `opts` - Keyword list with `:repo` and `:label` options

  ## Examples

      iex> {us, results} = Prismatic.Performance.ExecutionTimer.timed_query(
      ...>   from(u in "users", limit: 5),
      ...>   repo: MyApp.Repo,
      ...>   label: :user_listing
      ...> )
  """
  @spec timed_query(Ecto.Queryable.t(), keyword()) :: {non_neg_integer(), list()}
  def timed_query(query, opts \\ []) do
    repo = Keyword.get(opts, :repo, Prismatic.Repo)
    label = Keyword.get(opts, :label, :unnamed_query)

    measure(label, fn -> repo.all(query) end)
  end

  @doc """
  Checks whether a duration falls within the budget for an operation.

  Returns `true` if the duration is within the hard limit for the
  given operation category, or `true` for unknown operations (no budget).

  ## Parameters

  - `duration_us` - Measured duration in microseconds
  - `operation` - Operation category atom

  ## Examples

      iex> Prismatic.Performance.ExecutionTimer.within_budget?(5, :ets_lookup)
      true

      iex> Prismatic.Performance.ExecutionTimer.within_budget?(500_000, :health_check)
      false

      iex> Prismatic.Performance.ExecutionTimer.within_budget?(999, :unknown_op)
      true
  """
  @spec within_budget?(non_neg_integer(), operation() | atom()) :: boolean()
  def within_budget?(duration_us, operation) do
    case Map.fetch(@budgets, operation) do
      {:ok, budget} -> duration_us < budget
      :error -> true
    end
  end

  @doc """
  Returns the budget in microseconds for an operation category.

  Returns `:unlimited` for operations without a defined budget.

  ## Examples

      iex> Prismatic.Performance.ExecutionTimer.budget_for(:db_query)
      50_000

      iex> Prismatic.Performance.ExecutionTimer.budget_for(:unknown)
      :unlimited
  """
  @spec budget_for(operation() | atom()) :: budget_us() | :unlimited
  def budget_for(operation) do
    Map.get(@budgets, operation, :unlimited)
  end

  @doc """
  Returns all defined operation budgets as a map.

  ## Examples

      iex> budgets = Prismatic.Performance.ExecutionTimer.all_budgets()
      iex> is_map(budgets) and map_size(budgets) > 0
      true
  """
  @spec all_budgets() :: %{operation() => budget_us()}
  def all_budgets, do: @budgets
end
```

### Benchmarking with Benchee

The platform uses Benchee for micro-benchmarking performance-critical code paths. Every new LiveView page must include a benchmark demonstrating that mount time and initial render time fall within the PERF performance standard (< 150ms mount, < 250ms total load).

```elixir
defmodule Prismatic.Benchmarks.ExecutionTimeBenchmarks do
  @moduledoc """
  Benchee benchmark suite for execution time measurement overhead
  and critical path performance validation.

  Run with: `mix run benchmarks/execution_time_benchmarks.exs`
  """

  @doc """
  Runs the complete benchmark suite comparing measurement methods.

  ## Examples

      iex> Prismatic.Benchmarks.ExecutionTimeBenchmarks.run()
      :ok
  """
  @spec run() :: :ok
  def run do
    Benchee.run(
      %{
        "timer.tc" => fn ->
          :timer.tc(fn -> Enum.sum(1..1000) end)
        end,
        "monotonic_time" => fn ->
          start = System.monotonic_time(:microsecond)
          Enum.sum(1..1000)
          System.monotonic_time(:microsecond) - start
        end,
        "telemetry.span" => fn ->
          :telemetry.span([:benchmark, :sum], %{}, fn ->
            result = Enum.sum(1..1000)
            {result, %{}}
          end)
        end
      },
      warmup: 2,
      time: 10,
      memory_time: 2,
      reduction_time: 2,
      print: [benchmarking: true, configuration: true]
    )

    :ok
  end
end
```

### Telemetry Handler Setup

```elixir
defmodule Prismatic.Telemetry.ExecutionTimeHandler do
  @moduledoc """
  Telemetry handler that aggregates execution time measurements
  and exposes them for Prometheus scraping and dashboard display.

  Attaches to `[:prismatic, :execution_time]` events and maintains
  per-operation histograms in ETS for efficient concurrent access.
  """

  require Logger

  @table :execution_time_histograms

  @doc """
  Attaches the execution time handler to telemetry events.

  Should be called once during application startup, typically
  from the application supervision tree.

  ## Examples

      iex> Prismatic.Telemetry.ExecutionTimeHandler.attach()
      :ok
  """
  @spec attach() :: :ok
  def attach do
    :telemetry.attach(
      "prismatic-execution-time-handler",
      [:prismatic, :execution_time],
      &handle_event/4,
      %{}
    )

    :ok
  end

  @doc false
  @spec handle_event(list(atom()), map(), map(), map()) :: :ok
  def handle_event(
        [:prismatic, :execution_time],
        %{duration_us: duration},
        %{operation: operation} = metadata,
        _config
      ) do
    if Map.get(metadata, :over_budget, false) do
      Logger.warning("Over-budget execution: #{operation} = #{duration}us")
    end

    update_histogram(operation, duration)
    :ok
  end

  defp update_histogram(operation, duration) do
    try do
      :ets.update_counter(@table, {operation, :count}, 1, {{operation, :count}, 0})
      :ets.update_counter(@table, {operation, :total_us}, duration, {{operation, :total_us}, 0})
    rescue
      ArgumentError ->
        :ets.new(@table, [:named_table, :public, :set])
        update_histogram(operation, duration)
    end
  end
end
```

The telemetry pipeline captures execution times for all OSINT tool runs, DD pipeline phases, and API endpoint responses, publishing them to monitoring dashboards for real-time visibility. The OTEL doctrine requires that all GenServer handlers, controller actions, and API calls emit telemetry events including execution time measurements.

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using `DateTime.utc_now()` for intervals | Subject to NTP adjustments, can go backward | Use `System.monotonic_time/1` for all interval measurements |
| Single-sample benchmarks | System noise dominates; result is meaningless | Use Benchee with statistical analysis (1000+ iterations) |
| Measuring in test environment | Test config differs from production (sandbox, mocks) | Benchmark against production-like configuration |
| Ignoring GC in benchmarks | GC pauses inflate measurements unpredictably | Use Benchee's `memory_time` option to correlate |
| Averaging instead of percentiles | Average hides tail latency problems | Always report P50, P95, P99 distributions |
| Timing across `await` boundaries | Includes unrelated scheduling/wait time | Measure the operation itself, not the await wrapper |
| Forgetting warm-up | First runs include cache misses, module loading | Benchee handles automatically; manual benchmarks need explicit warm-up |
| Timing NIFs on normal schedulers | NIF blocks scheduler, distorts other measurements | Use dirty schedulers for NIFs > 1ms |
| Using `Process.sleep` in timing code | Adds artificial delay, blocks scheduler | Never sleep inside measurement boundaries |
| Ignoring scheduler contention | High load inflates wall-clock time | Monitor scheduler utilization with `:msacc` alongside timing |
| String interpolation in telemetry metadata | Creates unnecessary garbage, inflates GC | Use atoms or pre-computed values in metadata maps |
| Measuring compilation time as runtime | Module compilation on first call adds latency | Ensure modules are compiled before measurement |

## Best Practices

1. **Always use monotonic time for intervals** -- `System.monotonic_time/1` is immune to NTP adjustments and clock skew. Never use `DateTime.utc_now()` or `System.system_time/1` for measuring durations.

2. **Report percentile distributions, not averages** -- P50, P95, P99, and P99.9 capture both typical and worst-case behavior. Averages hide tail latency issues that affect user experience.

3. **Instrument at service boundaries** -- Measure execution time at API endpoints, database queries, external HTTP calls, GenServer calls, and LiveView lifecycle callbacks. These are the points that directly impact user-visible latency.

4. **Use Telemetry spans for structured instrumentation** -- `:telemetry.span/3` provides consistent start/stop events with automatic duration calculation and exception handling. Phoenix, Ecto, and LiveView use this pattern natively.

5. **Benchmark with statistical rigor** -- Use Benchee with adequate warm-up (2+ seconds), sufficient iterations (1000+), and memory tracking. Compare implementations side-by-side rather than measuring in isolation.

6. **Define and enforce execution time budgets** -- Every operation category should have a documented hard limit. Budget violations should emit telemetry events that trigger alerts.

7. **Monitor GC impact on latency** -- Use `:erlang.statistics(:garbage_collection)` or Benchee's memory analysis to correlate execution time spikes with GC activity. Consider `fullsweep_after` tuning for long-lived processes.

8. **Profile before optimizing** -- Use `:fprof` or `:eprof` to identify actual bottlenecks before optimizing. Premature optimization based on assumptions wastes effort and can worsen performance.

9. **Test performance regressions in CI** -- Include Benchee benchmarks in the test suite with threshold assertions. Catch performance regressions before they reach production.

10. **Separate measurement from alerting** -- Instrumentation code should only measure and emit events. Alerting logic belongs in telemetry handlers, keeping instrumented code clean and low-overhead.

## Related Terms

- [Latency](/glossary/latency/) -- End-to-end delay from request to response, of which execution time is one component
- [Throughput](/glossary/throughput/) -- Operations completed per unit time, inversely related to execution time under load
- [Telemetry](/glossary/telemetry/) -- BEAM metric collection framework used for execution time instrumentation
- [Profiling](/glossary/profiling/) -- Detailed execution analysis to identify time-consuming code paths
- [Benchee](/glossary/benchee/) -- Elixir micro-benchmarking library with statistical analysis
- [GenServer](/glossary/genserver/) -- OTP server abstraction where call/cast timing is critical
- [ETS](/glossary/ets/) -- Erlang Term Storage providing sub-microsecond lookups
- [OTEL](/glossary/otel/) -- Observability enforcement doctrine requiring telemetry instrumentation
- [Health Check](/glossary/health-check/) -- Service health verification with execution time budgets
- [Scheduler](/glossary/scheduler/) -- BEAM scheduler that preempts processes based on reductions
- [Garbage Collection](/glossary/garbage-collection/) -- Per-process GC that causes execution time spikes
- [Flame Graph](/glossary/flame-graph/) -- Visualization of call stack timing for bottleneck identification

## See Also

- [Capabilities](/capabilities/) -- Platform performance monitoring capabilities
- [Architecture](/architecture/) -- Performance architecture and monitoring infrastructure
- [OSINT Tools](/osint/) -- OSINT tool execution with per-adapter timing
- **Livebooks**: `performance_monitoring/` notebooks include profiling and timing analysis
- **Academy**: Performance-related topics reference execution time standards
- **PERF Doctrine**: Platform performance gates enforcing execution time budgets
- **OTEL Doctrine**: Observability requirements for telemetry instrumentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
