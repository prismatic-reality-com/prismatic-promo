+++
title = "Profiling"
weight = 50
[extra]
description = "Performance measurement technique that identifies computational bottlenecks through execution time and resource analysis"
category = "performance"
related_terms = ["process", "scheduler", "run-queue", "percentile", "runtime", "telemetry"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["profiling", "performance", "bottleneck", "flame graph", "fprof", "eprof", "glossary", "Prismatic Platform"]
tags = ["glossary", "performance", "tooling", "optimization"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Profiling - Prismatic Platform"
+++

## Definition & Overview

Profiling is the systematic measurement of program execution characteristics to identify performance bottlenecks, resource consumption patterns, and optimization opportunities. Unlike benchmarking (which measures overall throughput or latency), profiling provides granular, function-level visibility into where time and resources are spent. Effective profiling answers the question "which specific functions consume the most time?" rather than the aggregate question "how fast is the system overall?"

The BEAM virtual machine provides several built-in profiling tools: `fprof` for detailed call-graph analysis with accurate time measurement, `eprof` for lighter-weight time profiling suitable for production sampling, `cprof` for function call counting, and `:recon` for live production introspection. Each tool makes different trade-offs between measurement overhead and detail granularity. Modern Elixir development also leverages `Benchee` for comparative benchmarking and `:telemetry`-based profiling for continuous production monitoring.

The Prismatic Platform's sub-250ms page load and sub-100ms server-render requirements demand continuous profiling awareness. Every new LiveView page must include Benchee-based performance tests that verify render times under load. The platform uses `:telemetry.span/3` throughout its codebase to enable low-overhead production profiling without code changes, and the Performance Monitoring livebook domain provides interactive flame graph analysis for deep-dive investigations.

## Technical Deep Dive

Profiling in Elixir typically proceeds through three phases: instrumentation (adding measurement points), collection (gathering execution data), and analysis (interpreting results to identify bottlenecks). The Prismatic Platform uses `:telemetry` for instrumentation, ETS-backed aggregators for collection, and LiveView dashboards for analysis.

```elixir
defmodule PrismaticPerformance.Profiler do
  @moduledoc """
  Production-safe profiling utilities that wrap BEAM profiling tools
  with timeout protection and result formatting.
  """

  @type profile_result :: %{
    total_time_us: non_neg_integer(),
    function_times: [{mfa(), non_neg_integer()}],
    call_counts: [{mfa(), non_neg_integer()}],
    hot_paths: [mfa()]
  }

  @type mfa :: {module(), atom(), non_neg_integer()}

  @spec profile_function((() -> term()), keyword()) :: {:ok, profile_result()} | {:error, term()}
  def profile_function(fun, opts \\ []) do
    tool = Keyword.get(opts, :tool, :eprof)
    timeout = Keyword.get(opts, :timeout, 30_000)

    task = Task.async(fn ->
      case tool do
        :eprof -> profile_with_eprof(fun)
        :fprof -> profile_with_fprof(fun)
        :cprof -> profile_with_cprof(fun)
      end
    end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> result
      nil -> {:error, :profiling_timeout}
    end
  end

  defp profile_with_eprof(fun) do
    :eprof.start()
    :eprof.start_profiling([self()])

    result = fun.()

    :eprof.stop_profiling()
    :eprof.analyze(:total)
    :eprof.stop()

    {:ok, %{result: result, tool: :eprof}}
  end

  defp profile_with_fprof(fun) do
    {:ok, tracer} = :fprof.start()

    :fprof.apply(fun, [], [{:tracer, tracer}])
    :fprof.profile()
    :fprof.analyse(dest: :io, sort: :own)
    :fprof.stop()

    {:ok, %{tool: :fprof}}
  end

  defp profile_with_cprof(fun) do
    :cprof.start()
    result = fun.()
    total = :cprof.pause()
    analysis = :cprof.analyse()
    :cprof.stop()

    {:ok, %{result: result, total_calls: total, analysis: analysis, tool: :cprof}}
  end
end
```

For continuous production profiling, the platform uses telemetry-based measurement that adds negligible overhead to normal operations. The key insight is that `:telemetry.span/3` calls have single-digit microsecond overhead when no handlers are attached, making them safe for production code paths.

```elixir
defmodule PrismaticPerformance.TelemetryProfiler do
  @moduledoc """
  Telemetry-based continuous profiler that aggregates function
  execution times into statistical summaries without significant
  production overhead.
  """

  use GenServer

  @flush_interval 30_000

  defstruct [:measurements, :started_at]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    attach_handlers()
    schedule_flush()
    {:ok, %__MODULE__{measurements: %{}, started_at: System.monotonic_time()}}
  end

  defp attach_handlers do
    events = [
      [:phoenix, :endpoint, :stop],
      [:phoenix, :live_view, :mount, :stop],
      [:phoenix, :live_view, :handle_event, :stop],
      [:prismatic, :storage, :get],
      [:prismatic, :osint, :tool, :stop],
      [:prismatic, :dd, :pipeline, :stop]
    ]

    :telemetry.attach_many(
      "performance-profiler",
      events,
      &handle_event/4,
      nil
    )
  end

  defp handle_event(event, measurements, _metadata, _config) do
    duration_us = System.convert_time_unit(measurements.duration, :native, :microsecond)
    key = Enum.join(event, ".")
    GenServer.cast(__MODULE__, {:record, key, duration_us})
  end

  @impl true
  def handle_cast({:record, key, duration_us}, state) do
    measurements =
      Map.update(state.measurements, key, [duration_us], fn existing ->
        [duration_us | Enum.take(existing, 999)]
      end)

    {:noreply, %{state | measurements: measurements}}
  end

  @impl true
  def handle_info(:flush, state) do
    summaries =
      Map.new(state.measurements, fn {key, values} ->
        sorted = Enum.sort(values)
        n = length(sorted)

        summary = %{
          count: n,
          min: List.first(sorted),
          max: List.last(sorted),
          mean: Enum.sum(sorted) / max(n, 1),
          p50: Enum.at(sorted, div(n, 2)),
          p95: Enum.at(sorted, round(n * 0.95)),
          p99: Enum.at(sorted, round(n * 0.99))
        }

        {key, summary}
      end)

    :telemetry.execute(
      [:prismatic, :profiler, :summary],
      %{summaries: summaries},
      %{window_ms: @flush_interval}
    )

    schedule_flush()
    {:noreply, %{state | measurements: %{}}}
  end

  defp schedule_flush, do: Process.send_after(self(), :flush, @flush_interval)
end
```

## Architecture & Implementation

The profiling architecture integrates with the platform's monitoring and alerting subsystems. Profiling data flows through three stages: collection (telemetry handlers recording per-event timing), aggregation (GenServer computing statistical summaries over sliding windows), and visualization (LiveView dashboards rendering real-time performance views).

The platform enforces mandatory Benchee performance tests for all new LiveView pages. These tests verify that mount times, render times, and event handler response times meet the P0 performance standards. Profiling data from these tests is stored alongside the code, enabling regression detection across commits.

Memory profiling complements execution time profiling. The platform monitors per-process memory consumption through periodic `Process.info/2` calls, alerting on processes that exceed configured thresholds. This prevents memory leaks from silently degrading system performance.

## Usage in Prismatic Platform

Developers use profiling during optimization work and performance investigation. The mix tasks and livebook integration provide both command-line and interactive profiling experiences.

```elixir
defmodule PrismaticPerformance.BencheeRunner do
  @moduledoc """
  Standardized Benchee configuration for platform performance tests.
  All LiveView pages must have corresponding Benchee benchmarks.
  """

  @spec benchmark_liveview(module(), map()) :: :ok
  def benchmark_liveview(live_module, params \\ %{}) do
    Benchee.run(%{
      "mount" => fn ->
        {:ok, _socket} = live_module.mount(params, %{}, %Phoenix.LiveView.Socket{})
      end,
      "handle_params" => fn ->
        socket = %Phoenix.LiveView.Socket{assigns: %{__changed__: %{}}}
        live_module.handle_params(params, "", socket)
      end
    },
    time: 5,
    warmup: 2,
    memory_time: 2,
    formatters: [
      Benchee.Formatters.Console,
      {Benchee.Formatters.HTML, file: "benchmarks/#{inspect(live_module)}.html"}
    ])
  end
end
```

## Cross-References

- [Process](/glossary/process/) - BEAM execution unit that profiling measures
- **Scheduler** - BEAM scheduler whose behavior profiling reveals
- **Run Queue** - Scheduler queue depth indicating process contention
- [Percentile](/glossary/percentile/) - Statistical measure used to summarize profiling results
- **Runtime** - Execution environment providing profiling infrastructure

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
