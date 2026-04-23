+++
title = "Run Queue"
weight = 50
[extra]
description = "BEAM scheduler work queue holding processes ready for execution on a specific CPU core"
category = "elixir"
related_terms = ["scheduler", "process", "runtime", "profiling", "percentile"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["run queue", "BEAM", "scheduler", "concurrency", "CPU", "load balancing", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir", "otp", "performance"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Run Queue - Prismatic Platform"
+++

## Definition & Overview

A run queue is a per-scheduler queue in the BEAM virtual machine that holds processes ready for execution. Each BEAM scheduler (typically one per CPU core) maintains its own run queue, and processes in the queue are executed in a preemptive round-robin fashion based on reduction counts. When a process exhausts its reduction budget (approximately 4000 reductions per time slice), it is preempted and placed back in the run queue, allowing other processes to execute.

Run queue depth is the primary indicator of system load in BEAM applications. A consistently empty run queue means the system has spare capacity. A growing run queue indicates that processes are waiting for CPU time, which manifests as increased latency. The BEAM's built-in load balancing (work stealing and migration) attempts to keep run queue depths balanced across all schedulers, but imbalanced workloads can cause some queues to grow while others are idle.

The Prismatic Platform monitors run queue depths as part of its performance telemetry. Sustained run queue depths above a configurable threshold trigger alerts that indicate the system is approaching CPU saturation. This early warning enables proactive scaling decisions before latency SLAs are violated. The platform's sub-250ms page load guarantee depends on maintaining low run queue depths, as elevated queues directly translate to increased response times.

## Technical Deep Dive

BEAM exposes run queue statistics through `:erlang.statistics/1` and the `:scheduler` instrumentation. The platform samples these metrics at regular intervals and feeds them into the telemetry aggregation pipeline.

```elixir
defmodule PrismaticPerformance.RunQueueMonitor do
  @moduledoc """
  Monitors BEAM scheduler run queue depths and emits
  telemetry events for performance dashboards and alerting.
  """

  use GenServer

  @sample_interval 1_000
  @alert_threshold 50
  @critical_threshold 200

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_sample()
    {:ok, %{history: [], alerts: 0}}
  end

  @impl true
  def handle_info(:sample, state) do
    run_queue_lengths = :erlang.statistics(:run_queue_lengths_all)
    total_run_queue = :erlang.statistics(:total_run_queue_lengths)

    scheduler_count = :erlang.system_info(:schedulers_online)
    avg_depth = total_run_queue / max(scheduler_count, 1)

    max_depth = Enum.max(Tuple.to_list(run_queue_lengths))

    :telemetry.execute(
      [:prismatic, :beam, :run_queue],
      %{
        total: total_run_queue,
        average: avg_depth,
        max: max_depth,
        scheduler_count: scheduler_count,
        per_scheduler: Tuple.to_list(run_queue_lengths)
      },
      %{timestamp: System.system_time(:millisecond)}
    )

    state = check_thresholds(state, total_run_queue, max_depth)

    schedule_sample()
    {:noreply, state}
  end

  defp check_thresholds(state, total, max_depth) do
    cond do
      total > @critical_threshold ->
        :telemetry.execute(
          [:prismatic, :beam, :run_queue, :critical],
          %{total: total, max_depth: max_depth},
          %{action: :scale_up_required}
        )
        %{state | alerts: state.alerts + 1}

      total > @alert_threshold ->
        :telemetry.execute(
          [:prismatic, :beam, :run_queue, :warning],
          %{total: total, max_depth: max_depth},
          %{action: :investigate}
        )
        state

      true ->
        state
    end
  end

  @spec get_snapshot() :: map()
  def get_snapshot do
    run_queue_lengths = :erlang.statistics(:run_queue_lengths_all)
    total = :erlang.statistics(:total_run_queue_lengths)
    schedulers = :erlang.system_info(:schedulers_online)

    %{
      total: total,
      average: total / max(schedulers, 1),
      per_scheduler: Tuple.to_list(run_queue_lengths),
      schedulers_online: schedulers,
      timestamp: DateTime.utc_now()
    }
  end

  defp schedule_sample, do: Process.send_after(self(), :sample, @sample_interval)
end
```

Run queue imbalance detection identifies situations where some schedulers are overloaded while others are idle. The BEAM's work-stealing algorithm should prevent this, but certain workload patterns (such as a single process performing a long computation) can cause temporary imbalances.

```elixir
defmodule PrismaticPerformance.RunQueueAnalyzer do
  @moduledoc """
  Analyzes run queue depth patterns to identify scheduling
  imbalances, contention points, and capacity constraints.
  """

  @spec analyze_balance(list(non_neg_integer())) :: map()
  def analyze_balance(per_scheduler_depths) do
    n = length(per_scheduler_depths)
    total = Enum.sum(per_scheduler_depths)
    mean = total / max(n, 1)
    variance = Enum.reduce(per_scheduler_depths, 0, fn d, acc ->
      acc + :math.pow(d - mean, 2)
    end) / max(n, 1)
    std_dev = :math.sqrt(variance)

    coefficient_of_variation = if mean > 0, do: std_dev / mean, else: 0.0

    %{
      scheduler_count: n,
      total_depth: total,
      mean_depth: mean,
      std_deviation: std_dev,
      coefficient_of_variation: coefficient_of_variation,
      max_depth: Enum.max(per_scheduler_depths, fn -> 0 end),
      min_depth: Enum.min(per_scheduler_depths, fn -> 0 end),
      balanced: coefficient_of_variation < 0.5,
      assessment: assess(total, coefficient_of_variation)
    }
  end

  defp assess(total, cv) do
    cond do
      total == 0 -> :idle
      total < 10 and cv < 0.3 -> :healthy
      total < 50 and cv < 0.5 -> :moderate_load
      cv >= 0.5 -> :imbalanced
      true -> :high_load
    end
  end
end
```

## Architecture & Implementation

Run queue monitoring integrates with the platform's broader performance monitoring architecture. The RunQueueMonitor GenServer samples at 1-second intervals, feeding data into the TelemetryProfiler for aggregation and the LiveView dashboard for real-time visualization. Historical run queue data is retained for trend analysis and capacity planning.

The BEAM provides configuration options that affect run queue behavior: `+S` (scheduler count), `+sbt` (scheduler bind type), and `+swt` (scheduler wakeup threshold). The platform configures these based on the deployment environment -- production uses all available cores with medium wakeup threshold, while development uses a conservative configuration to leave resources for other tools.

## Usage in Prismatic Platform

Run queue metrics are displayed on the platform's monitoring dashboard and integrated into the health check endpoint. The `/api/v1/health` endpoint includes run queue depth in its response, enabling external monitoring systems to track BEAM scheduler health.

```elixir
defmodule PrismaticApi.HealthController do
  use PrismaticApi, :controller

  @spec health(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def health(conn, _params) do
    run_queue = PrismaticPerformance.RunQueueMonitor.get_snapshot()

    health = %{
      status: if(run_queue.total < 50, do: "healthy", else: "degraded"),
      beam: %{
        run_queue_total: run_queue.total,
        run_queue_average: Float.round(run_queue.average, 2),
        schedulers_online: run_queue.schedulers_online
      },
      timestamp: DateTime.utc_now()
    }

    json(conn, health)
  end
end
```

## Cross-References

- **Scheduler** - BEAM scheduler that maintains and drains run queues
- [Process](@/glossary/process.md) - BEAM processes that populate run queues
- [Runtime](@/glossary/runtime.md) - BEAM runtime configuration affecting run queue behavior
- [Profiling](@/glossary/profiling.md) - Performance measurement revealing run queue contention
- [Percentile](@/glossary/percentile.md) - Statistical measure for run queue depth distributions

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
