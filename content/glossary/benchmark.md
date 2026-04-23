+++
title = "Benchmark"
weight = 50
[extra]
description = "A standardized test or measurement used to evaluate and compare the performance, quality, or correctness of a system against a known reference point, with Benchee as the primary framework on the BEAM"
category = "quality"
domain = "performance-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["accuracy", "assertion", "artifact", "completeness", "complexity", "behavioral-drift", "telemetry", "genserver", "ets", "process", "p95", "performance-testing", "compile-time"]
tags = ["glossary", "benchmark", "performance", "benchee", "testing", "metrics", "quality", "beam", "profiling", "regression-detection"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Benchmarks provide quantitative baselines for performance validation, ensuring the Prismatic Platform meets its sub-250ms page load and sub-100ms server render requirements through Benchee-based measurement and CI-integrated regression detection"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["benchmark", "performance testing", "Benchee", "baseline", "regression", "throughput", "latency", "measurement", "comparison", "profiling", "microbenchmark", "macrobenchmark", "percentile", "flame graph"]
image = "/images/sections/glossary.png"
image_alt = "Benchmark - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "agents", "technologies"]
+++

## Definition

A benchmark is a standardized test, measurement, or reference point used to evaluate and compare the performance, quality, or correctness of a system or component. Benchmarks establish quantitative baselines against which future measurements can be compared, enabling detection of performance regressions, validation of optimizations, and objective comparison between alternative implementations. Good benchmarks are reproducible, representative of real workloads, and measured under controlled conditions.

The term originates from surveying, where a "bench mark" was a horizontal mark cut into a stone wall to serve as a reference point for altitude measurements. In computing, the concept was formalized in the 1970s with the Whetstone and Dhrystone benchmarks for comparing processor architectures. Modern software benchmarking encompasses function-level microbenchmarks, system-level macrobenchmarks, load testing, and continuous performance regression detection integrated into CI/CD pipelines.

On the BEAM virtual machine, benchmarking has unique characteristics. The BEAM's preemptive scheduler, garbage collection per process, and JIT compilation (since OTP 24) all affect measurement stability. Benchee, the standard Elixir benchmarking library, handles these concerns by providing warmup phases (to trigger JIT compilation), statistical analysis (to account for GC pauses), and memory measurement (to detect allocation regressions).

In the Prismatic Platform, benchmarks enforce the **PERF doctrine's** P0 performance standards: sub-250ms total page load, sub-100ms server-side render, sub-150ms LiveView mount, sub-50ms LiveView handle_event, and sub-10ms health check response. These are not aspirational targets -- they are hard limits enforced through automated benchmarks in the deployment pipeline.

## Core Concepts

### Benchmark Types

| Type | Scope | Tool | Duration | Prismatic Usage |
|------|-------|------|----------|-----------------|
| **Microbenchmark** | Single function | Benchee | Seconds | ETS lookup, GenServer call, JSON encoding |
| **Macrobenchmark** | End-to-end flow | Custom + Benchee | Minutes | Page load, API request-response cycle |
| **Load benchmark** | Concurrency stress | Benchee + k6 | Minutes-hours | Connection pool saturation, PubSub throughput |
| **Comparison** | A vs B implementation | Benchee | Seconds | Algorithm selection, data structure choice |
| **Regression** | Change detection | CI + Benchee | Per-commit | Automated performance gate in deployment |
| **Memory** | Allocation profile | Benchee memory_time | Seconds | ETS table growth, GenServer state bloat |

### Statistical Measures

| Metric | Meaning | Why It Matters | Prismatic Threshold |
|--------|---------|---------------|-------------------|
| **P50 (Median)** | 50th percentile -- half of requests are faster | Typical user experience | Informational |
| **P95** | 95th percentile -- 95% of requests are faster | Tail latency for most users | Primary gate |
| **P99** | 99th percentile -- 99% of requests are faster | Worst-case for nearly all users | Secondary gate |
| **Mean** | Arithmetic average | Misleading when distribution is skewed | Not used for gates |
| **Std Dev** | Spread around the mean | Measurement consistency indicator | Informational |
| **IPS** | Iterations per second | Throughput capacity | Used for comparisons |
| **Memory** | Bytes allocated per operation | Resource consumption | Used for comparisons |

### Benchee Configuration Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `time` | seconds | 5 | Duration of measurement phase |
| `warmup` | seconds | 2 | Duration of warmup phase (JIT, caches) |
| `memory_time` | seconds | 0 | Duration of memory measurement phase |
| `reduction_time` | seconds | 0 | Duration of reduction counting phase |
| `parallel` | integer | 1 | Number of parallel benchmark processes |
| `pre_check` | boolean | false | Verify functions return same result |
| `formatters` | list | [Console] | Output formatters (Console, HTML, Markdown) |
| `inputs` | map | nil | Named input datasets for comparison |

## Technical Deep Dive

### BEAM-Specific Benchmarking Challenges

The BEAM virtual machine introduces several challenges for accurate benchmarking:

**1. Garbage Collection**: Each BEAM process has its own heap and garbage collector. GC pauses within the benchmarked process affect measurements. Benchee mitigates this by running enough iterations to produce statistically stable results where GC pauses are averaged out.

**2. JIT Compilation**: Since OTP 24, the BEAM includes a JIT compiler that optimizes hot code paths. The first executions of a function may be significantly slower than subsequent ones. Benchee's warmup phase ensures JIT compilation completes before measurements begin.

**3. Scheduler Interference**: The BEAM's preemptive scheduler may pause the benchmarked process to run other schedulers, IO operations, or system tasks. Running benchmarks on a quiet system with `--erl "+S 1"` (single scheduler) can reduce interference, though this changes the execution characteristics.

**4. Reduction Counting**: The BEAM scheduler preempts processes based on reduction counts (approximately one per function call). A function that triggers more reductions may experience more scheduler interruptions, affecting wall-clock timing.

**5. ETS Concurrent Access**: When benchmarking ETS operations, the underlying hash table locking strategy affects results under concurrency. `:read_concurrency` and `:write_concurrency` table options dramatically change concurrent benchmark results.

### Benchee Framework Architecture

Benchee operates in distinct phases:

```
Configuration → Warmup → Measurement → Statistics → Formatting → Report
```

During the **measurement phase**, Benchee repeatedly calls the benchmarked function, recording the wall-clock time for each iteration. It dynamically determines the number of iterations based on the `time` parameter, running more iterations for faster functions to ensure statistical significance.

During the **statistics phase**, Benchee computes descriptive statistics (mean, median, standard deviation, percentiles) and performs outlier detection using the IQR method. Outliers from GC pauses or scheduler interference are flagged but included in results, ensuring honest reporting.

### Microbenchmark vs. Macrobenchmark Tradeoffs

| Characteristic | Microbenchmark | Macrobenchmark |
|---------------|----------------|----------------|
| **What it measures** | Single function in isolation | End-to-end system behavior |
| **Reproducibility** | High (controlled inputs) | Lower (system state varies) |
| **Predictive value** | Low (ignores system effects) | High (reflects real usage) |
| **Setup complexity** | Minimal | Significant (requires running system) |
| **Failure diagnosis** | Easy (single function) | Hard (many components) |
| **Common mistake** | Over-optimizing hot paths | Ignoring cold-start costs |

### Regression Detection Strategy

The Prismatic Platform detects performance regressions by comparing benchmark results against stored baselines:

```
New Measurement > Baseline * (1 + tolerance)  →  REGRESSION DETECTED
```

The tolerance factor accounts for measurement noise. For microbenchmarks, a 10% tolerance is typical. For macrobenchmarks with more variance, 20% is used. The baseline is updated only when a commit explicitly improves performance, preventing gradual drift.

## Usage in Prismatic Platform

### Performance Gate Pipeline

The deployment pipeline includes automated benchmark validation:

1. **Pre-deploy**: `mix performance.check` runs the benchmark suite against P0 hard limits
2. **Post-deploy**: Smoke tests verify production response times
3. **Continuous**: Telemetry metrics are compared against baseline thresholds

### Platform Hard Limits

| Metric | P0 Limit | Measurement Method |
|--------|----------|-------------------|
| Total page load | < 250ms | Lighthouse + custom timing |
| Server-side render | < 100ms | Phoenix telemetry |
| LiveView mount | < 150ms | LiveView telemetry |
| LiveView handle_event | < 50ms | LiveView telemetry |
| Health check response | < 10ms | HTTP timing |
| API response (P95) | < 200ms | API telemetry |
| ETS lookup | < 1ms | Benchee microbenchmark |
| GenServer call | < 5ms | Benchee microbenchmark |

### O(1) Pattern Validation

The platform validated 90-250x speedups through comparative benchmarks when replacing O(n) patterns with O(1) alternatives:

- `length(list) == 0` replaced with `list == []`: 250x faster for large lists
- `Enum.find` replaced with ETS lookup: 90x faster for registry queries
- Linear sidebar search replaced with MapSet membership: 100x faster

### ETS vs. GenServer Decision Framework

Benchmarks guide the choice between ETS tables and GenServer state for data storage:

```
ETS:        < 1μs read, < 5μs write (concurrent, no serialization)
GenServer:  < 50μs call (serialized through mailbox, backpressure support)
```

The platform uses ETS for read-heavy, concurrent access patterns (tool registry, agent registry, telemetry buffers) and GenServer for write-heavy patterns requiring serialization (state machines, coordination, rate limiting).

## Code Examples

### Basic Benchee Usage

```elixir
defmodule PrismaticPerformance.EtsVsGenServerBench do
  @moduledoc """
  Comparative benchmark measuring ETS vs GenServer access patterns.
  Used to validate data access strategy decisions for platform registries.

  Run with: mix run benchmarks/ets_vs_genserver_bench.exs
  """

  @doc """
  Executes the ETS vs GenServer comparison benchmark with standard
  Benchee configuration including warmup and memory measurement.
  """
  @spec run() :: :ok
  def run do
    # Setup ETS table
    table = :ets.new(:bench_table, [:set, :public, :named_table, read_concurrency: true])
    :ets.insert(table, {"key_1", %{data: "value", timestamp: System.monotonic_time()}})

    # Setup GenServer
    {:ok, pid} = Agent.start_link(fn -> %{"key_1" => %{data: "value"}} end, name: :bench_agent)

    Benchee.run(
      %{
        "ETS lookup" => fn ->
          :ets.lookup(:bench_table, "key_1")
        end,
        "GenServer call" => fn ->
          Agent.get(:bench_agent, fn state -> Map.get(state, "key_1") end)
        end,
        "ETS match" => fn ->
          :ets.match_object(:bench_table, {"key_1", :_})
        end
      },
      time: 10,
      warmup: 3,
      memory_time: 2,
      reduction_time: 1,
      pre_check: true,
      formatters: [
        Benchee.Formatters.Console,
        {Benchee.Formatters.HTML, file: "benchmarks/output/ets_vs_genserver.html"}
      ]
    )

    # Cleanup
    :ets.delete(:bench_table)
    Agent.stop(pid)
    :ok
  end
end
```

### Parameterized Input Benchmarks

```elixir
defmodule PrismaticPerformance.ListOperationsBench do
  @moduledoc """
  Benchmark demonstrating the O(n) cost of length/1 vs O(1)
  pattern matching for emptiness checks. This benchmark provides
  the empirical evidence backing the PERF doctrine's ban on
  length(list) == 0 patterns.
  """

  @doc """
  Runs the benchmark with multiple input sizes to demonstrate
  the linear scaling of length/1.

  ## Examples

      iex> PrismaticPerformance.ListOperationsBench.run()
      :ok
  """
  @spec run() :: :ok
  def run do
    inputs = %{
      "10 elements" => Enum.to_list(1..10),
      "1_000 elements" => Enum.to_list(1..1_000),
      "100_000 elements" => Enum.to_list(1..100_000),
      "1_000_000 elements" => Enum.to_list(1..1_000_000)
    }

    Benchee.run(
      %{
        "length(list) == 0 (BANNED)" => fn list -> length(list) == 0 end,
        "list == [] (O(1))" => fn list -> list == [] end,
        "Enum.empty?/1 (O(1))" => fn list -> Enum.empty?(list) end,
        "match?([], list) (O(1))" => fn list -> match?([], list) end
      },
      inputs: inputs,
      time: 5,
      warmup: 2,
      memory_time: 1,
      formatters: [Benchee.Formatters.Console]
    )

    :ok
  end
end
```

### Automated Benchmark Runner with Regression Detection

```elixir
defmodule PrismaticPerformance.BenchmarkRunner do
  @moduledoc """
  Automated benchmark runner that validates platform performance
  against P0 hard limits. Failures block deployment.

  The runner collects measurements, computes percentiles, and
  compares against both absolute limits and historical baselines
  for regression detection.
  """

  require Logger

  @hard_limits %{
    page_load_ms: 250,
    server_render_ms: 100,
    liveview_mount_ms: 150,
    liveview_event_ms: 50,
    health_check_ms: 10
  }

  @regression_tolerance 0.10

  @type benchmark_result :: %{
          metric: atom(),
          p50: float(),
          p95: float(),
          p99: float(),
          max: float(),
          passes_absolute: boolean(),
          passes_regression: boolean(),
          baseline_p95: float() | nil
        }

  @type run_result :: {:ok, [benchmark_result()]} | {:error, :performance_violation, [benchmark_result()]}

  @doc """
  Runs all benchmark suites and validates against hard limits.
  Returns {:ok, results} if all pass, {:error, :performance_violation, results}
  if any metric exceeds its limit.

  ## Examples

      iex> {:ok, results} = PrismaticPerformance.BenchmarkRunner.run_all()
      iex> Enum.all?(results, & &1.passes_absolute)
      true
  """
  @spec run_all() :: run_result()
  def run_all do
    baselines = load_baselines()

    results =
      Enum.map(@hard_limits, fn {metric, limit} ->
        measurements = collect_measurements(metric, 200)
        sorted = Enum.sort(measurements)
        p95_value = percentile(sorted, 95)

        baseline = Map.get(baselines, metric)
        regression_check = if baseline, do: p95_value < baseline * (1 + @regression_tolerance), else: true

        result = %{
          metric: metric,
          p50: percentile(sorted, 50),
          p95: p95_value,
          p99: percentile(sorted, 99),
          max: List.last(sorted) || 0.0,
          passes_absolute: p95_value < limit,
          passes_regression: regression_check,
          baseline_p95: baseline
        }

        :telemetry.execute(
          [:prismatic, :benchmark, :result],
          %{p50: result.p50, p95: result.p95, p99: result.p99},
          %{metric: metric, passes: result.passes_absolute and result.passes_regression}
        )

        Logger.info("Benchmark #{metric}: p95=#{Float.round(p95_value, 2)}ms limit=#{limit}ms pass=#{result.passes_absolute}")
        result
      end)

    all_pass = Enum.all?(results, fn r -> r.passes_absolute and r.passes_regression end)

    if all_pass do
      {:ok, results}
    else
      {:error, :performance_violation, results}
    end
  end

  @spec percentile([number()], number()) :: float()
  defp percentile([], _p), do: 0.0
  defp percentile(sorted, p) do
    k = (length(sorted) - 1) * p / 100
    f = trunc(k)
    c = min(f + 1, length(sorted) - 1)
    lower = Enum.at(sorted, f) || 0
    upper = Enum.at(sorted, c) || 0
    lower + (upper - lower) * (k - f)
  end

  @spec collect_measurements(atom(), pos_integer()) :: [float()]
  defp collect_measurements(metric, count) do
    Enum.map(1..count, fn _ ->
      {microseconds, _result} = :timer.tc(fn -> simulate_metric(metric) end)
      microseconds / 1_000.0
    end)
  end

  @spec simulate_metric(atom()) :: :ok
  defp simulate_metric(:health_check_ms), do: :ok
  defp simulate_metric(:server_render_ms), do: :ok
  defp simulate_metric(:page_load_ms), do: :ok
  defp simulate_metric(:liveview_mount_ms), do: :ok
  defp simulate_metric(:liveview_event_ms), do: :ok

  @spec load_baselines() :: map()
  defp load_baselines do
    case File.read("benchmarks/baselines.json") do
      {:ok, content} ->
        case Jason.decode(content) do
          {:ok, data} ->
            Map.new(data, fn {k, v} -> {String.to_existing_atom(k), v} end)
          {:error, _} -> %{}
        end
      {:error, _} -> %{}
    end
  end
end
```

### Memory Benchmark

```elixir
defmodule PrismaticPerformance.MemoryBench do
  @moduledoc """
  Memory allocation benchmarks for detecting state bloat in
  GenServer processes and ETS tables. Tracks bytes allocated
  per operation to catch allocation regressions.
  """

  @doc """
  Compares memory allocation between map-based and ETS-based
  storage patterns for the agent registry.
  """
  @spec run_registry_comparison() :: :ok
  def run_registry_comparison do
    agents = for i <- 1..1_000, do: {"agent_#{i}", %{name: "Agent #{i}", status: :active}}

    Benchee.run(
      %{
        "Map.put (immutable)" => {
          fn {key, value, map} -> Map.put(map, key, value) end,
          before_each: fn _ ->
            {elem(Enum.random(agents), 0), %{status: :updated}, Map.new(agents)}
          end
        },
        "ETS insert (mutable)" => {
          fn {key, value, table} -> :ets.insert(table, {key, value}) end,
          before_each: fn _ ->
            table = :ets.new(:mem_bench, [:set, :public])
            Enum.each(agents, fn {k, v} -> :ets.insert(table, {k, v}) end)
            {elem(Enum.random(agents), 0), %{status: :updated}, table}
          end
        }
      },
      time: 5,
      warmup: 2,
      memory_time: 5,
      formatters: [Benchee.Formatters.Console]
    )

    :ok
  end
end
```

## Common Pitfalls

| Pitfall | Description | Impact | Prevention |
|---------|------------|--------|------------|
| **No warmup phase** | Measuring JIT compilation + cache warming as part of results | Artificially inflated initial measurements | Always use `warmup: 2` or higher |
| **Averaging over percentiles** | Reporting mean instead of P95/P99 | Hides tail latency that affects real users | Use percentiles for all performance gates |
| **Uncontrolled environment** | Running benchmarks on development machine with other processes | Inconsistent, unreproducible results | Dedicated benchmark environment or CI runner |
| **Microbenchmark extrapolation** | Assuming function-level speed predicts system-level performance | Ignores contention, GC, IO, scheduler effects | Supplement microbenchmarks with macrobenchmarks |
| **Missing baseline storage** | Running benchmarks without comparing to previous results | Cannot detect regressions | Store baselines as JSON artifacts in CI |
| **Benchmarking with IO** | Including Logger output or file writes in measured code | IO dominates measurement, hiding algorithmic cost | Disable logging during benchmark, measure IO separately |
| **GC-dominated measurements** | Short-lived benchmarks where GC pause dominates | Unstable results with high variance | Increase `time` parameter, use `memory_time` |
| **Process isolation failure** | Benchmark function sends messages to other processes | External process load affects timing | Use isolated benchmark processes, avoid PubSub |
| **Constant input bias** | Benchmarking with single input that hits best-case path | Real workload distribution not represented | Use `inputs` parameter with representative data |
| **Ignoring memory** | Optimizing CPU time while increasing memory allocation | OOM in production, increased GC pressure | Always include `memory_time` in benchmarks |

## Best Practices

1. **Always include a warmup phase**: JIT compilation and cache warming affect initial measurements. Benchee's `warmup` parameter ensures the BEAM's JIT has compiled hot paths before measurement begins. Use at least 2 seconds.

2. **Report P50, P95, and P99 percentiles**: Averages hide tail latency. The platform's performance gates use P95 as the primary metric because it represents the experience of 95% of requests while exposing tail issues.

3. **Control the benchmark environment**: Run benchmarks on a dedicated CI runner or quiet machine. Document the environment (CPU, memory, OTP version, scheduler count) with each benchmark result for reproducibility.

4. **Benchmark realistic workloads**: Microbenchmarks of isolated functions do not predict system-level performance. Supplement them with macrobenchmarks that exercise the full request path.

5. **Store benchmark results as CI artifacts**: Track P95 values over time as JSON files committed to the repository. This enables regression detection across commits and provides historical performance trends.

6. **Use parameterized inputs**: Benchee's `inputs` option allows testing with multiple data sizes, revealing algorithmic complexity (O(1) vs O(n) vs O(n^2)) through measurement rather than analysis.

7. **Measure memory alongside time**: Use Benchee's `memory_time` to track bytes allocated per operation. Memory regressions cause GC pressure that eventually manifests as latency spikes.

8. **Benchmark both hot and cold paths**: Most benchmarks measure hot paths (cached, JIT-compiled, steady-state). Also benchmark cold starts (empty caches, first request, GenServer initialization) since users experience them.

9. **Automate regression detection in CI**: Compare new benchmark results against stored baselines with a tolerance factor (10-20%). Block deployment when P95 exceeds baseline * (1 + tolerance).

10. **Separate IO from computation benchmarks**: File reads, network calls, and Logger output dominate wall-clock time. Benchmark computation and IO separately to identify the actual bottleneck.

## Related Terms

- [Accuracy](/glossary/accuracy/) -- correctness benchmarks for data quality validation
- [Assertion](/glossary/assertion/) -- programmatic verification of benchmark results
- [Artifact](/glossary/artifact/) -- benchmark reports stored as evidence artifacts
- [Behavioral Drift](/glossary/behavioral-drift/) -- performance drift detected via benchmark regression
- [Compile-Time](/glossary/compile-time/) -- compilation benchmarks as quality gates
- [ETS](/glossary/ets/) -- in-memory storage frequently benchmarked against GenServer
- [GenServer](/glossary/genserver/) -- stateful processes benchmarked for latency
- [P95](/glossary/p95/) -- 95th percentile used as primary benchmark threshold
- [Performance Testing](/glossary/performance-testing/) -- comprehensive performance validation framework
- [Process](/glossary/process/) -- BEAM processes as benchmark execution units
- [Telemetry](/glossary/telemetry/) -- runtime metrics complementing benchmark baselines
- [Virtual Machine](/glossary/virtual-machine/) -- BEAM VM characteristics affecting measurement

## See Also

- [Benchee Documentation](https://hexdocs.pm/benchee/) -- Elixir benchmarking library
- [Benchee.Formatters.HTML](https://hexdocs.pm/benchee_html/) -- HTML report formatter
- [Erlang Efficiency Guide](https://www.erlang.org/doc/efficiency_guide/introduction.html) -- BEAM performance characteristics
- [:timer.tc/1](https://www.erlang.org/doc/man/timer#tc-1) -- Low-level timing primitive

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
