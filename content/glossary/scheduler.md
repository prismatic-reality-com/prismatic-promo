+++
title = "Scheduler"
weight = 50
[extra]
description = "BEAM virtual machine component that manages preemptive process execution across CPU cores via reduction-based time slicing"
category = "elixir"
related_terms = ["process", "run-queue", "runtime", "profiling", "percentile"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["scheduler", "BEAM", "preemptive", "reduction", "time slice", "concurrency", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir", "otp", "concurrency"]
quality_score = 79
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Scheduler - Prismatic Platform"
+++

## Definition & Overview

The BEAM scheduler is the component of the Erlang virtual machine responsible for executing processes across available CPU cores. Unlike cooperative scheduling (where processes voluntarily yield control) or OS-level preemptive scheduling (which interrupts at arbitrary points), the BEAM uses reduction-based preemptive scheduling. Each process receives a budget of approximately 4,000 reductions (where one reduction roughly corresponds to one function call), and when that budget is exhausted, the process is preempted and the next process in the run queue is executed.

The BEAM creates one scheduler per CPU core by default (configurable via the `+S` flag). Each scheduler maintains its own run queue and operates as an OS thread. When a scheduler's run queue is empty, it can steal work from other schedulers' queues (work stealing), and periodically processes are migrated between schedulers to balance load (migration). This architecture provides excellent multicore utilization without requiring explicit parallelism from application code.

The scheduler's reduction-based preemption is the key to BEAM's soft real-time guarantees. Because no process can monopolize a scheduler for more than approximately 4,000 reductions, the system maintains consistent responsiveness even under heavy load. This property is critical for the Prismatic Platform's latency requirements: even if an OSINT tool execution is performing a computationally intensive operation, it cannot block the scheduler from serving LiveView page loads or API requests.

## Technical Deep Dive

Scheduler behavior can be observed through BEAM instrumentation. The `scheduler_wall_time` statistics provide utilization data showing what percentage of time each scheduler spends actively executing processes versus idling.

```elixir
defmodule PrismaticPerformance.SchedulerMonitor do
  @moduledoc """
  Monitors BEAM scheduler utilization using wall-time statistics.
  Provides per-scheduler utilization percentages and identifies
  overloaded or underutilized schedulers.
  """

  use GenServer

  @sample_interval 5_000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :erlang.system_flag(:scheduler_wall_time, true)
    sample = :erlang.statistics(:scheduler_wall_time)
    schedule_sample()
    {:ok, %{previous_sample: sample}}
  end

  @impl true
  def handle_info(:sample, %{previous_sample: prev} = state) do
    current = :erlang.statistics(:scheduler_wall_time)

    utilization =
      Enum.zip(Enum.sort(prev), Enum.sort(current))
      |> Enum.map(fn {{id, active0, total0}, {^id, active1, total1}} ->
        active_diff = active1 - active0
        total_diff = total1 - total0

        util = if total_diff > 0, do: active_diff / total_diff * 100, else: 0.0

        %{scheduler_id: id, utilization: Float.round(util, 2)}
      end)

    avg_utilization =
      utilization
      |> Enum.map(& &1.utilization)
      |> then(fn utils ->
        if length(utils) > 0, do: Enum.sum(utils) / length(utils), else: 0.0
      end)
      |> Float.round(2)

    :telemetry.execute(
      [:prismatic, :beam, :scheduler, :utilization],
      %{
        average: avg_utilization,
        per_scheduler: utilization,
        max: Enum.max_by(utilization, & &1.utilization) |> Map.get(:utilization),
        min: Enum.min_by(utilization, & &1.utilization) |> Map.get(:utilization)
      },
      %{scheduler_count: length(utilization)}
    )

    schedule_sample()
    {:noreply, %{state | previous_sample: current}}
  end

  @spec get_utilization() :: map()
  def get_utilization do
    GenServer.call(__MODULE__, :get_utilization)
  end

  @impl true
  def handle_call(:get_utilization, _from, state) do
    {:reply, state, state}
  end

  defp schedule_sample, do: Process.send_after(self(), :sample, @sample_interval)
end
```

Dirty schedulers handle operations that cannot be preempted at reduction boundaries, such as NIFs (Native Implemented Functions) that call into C code, and long-running I/O operations. The BEAM maintains separate pools of dirty CPU schedulers and dirty I/O schedulers to prevent these operations from blocking normal process scheduling.

```elixir
defmodule PrismaticPerformance.DirtySchedulerInfo do
  @moduledoc """
  Reports dirty scheduler configuration and utilization.
  Dirty schedulers handle NIFs and I/O that cannot be
  preempted at reduction boundaries.
  """

  @spec info() :: map()
  def info do
    %{
      normal_schedulers: :erlang.system_info(:schedulers_online),
      dirty_cpu_schedulers: :erlang.system_info(:dirty_cpu_schedulers_online),
      dirty_io_schedulers: :erlang.system_info(:dirty_io_schedulers),
      total_threads: :erlang.system_info(:schedulers_online) +
                     :erlang.system_info(:dirty_cpu_schedulers_online) +
                     :erlang.system_info(:dirty_io_schedulers)
    }
  end
end
```

## Architecture & Implementation

The Prismatic Platform configures schedulers based on the deployment environment. Production instances on Fly.io receive dedicated CPU cores, and the BEAM is configured with one scheduler per core. The `+sbwt` (scheduler busy wait threshold) is tuned for the expected workload pattern: lower values for I/O-heavy workloads (reduced CPU usage during idle periods) and higher values for latency-sensitive workloads (faster process wakeup at the cost of CPU spinning).

Scheduler-related metrics are integrated into the platform's health monitoring pipeline. Sustained high scheduler utilization (above 85%) triggers capacity alerts, while scheduler imbalance (high variance in per-scheduler utilization) suggests workload distribution issues that may require architectural attention.

The platform avoids scheduler-blocking operations by design. All I/O (HTTP requests, database queries, file operations) is performed through BEAM's async I/O subsystem or dirty schedulers. Computationally intensive operations (such as bulk entity matching or graph traversal) are chunked to yield at regular intervals, preserving scheduler responsiveness.

## Usage in Prismatic Platform

Scheduler monitoring is exposed through the platform's monitoring dashboard and the health check API. The dashboard displays real-time per-scheduler utilization bars, and the API reports aggregate scheduler health metrics.

```elixir
defmodule PrismaticWeb.Monitoring.SchedulerLive do
  use PrismaticWeb, :live_view

  @refresh_interval 2_000

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Process.send_after(self(), :refresh, @refresh_interval)
    end

    info = PrismaticPerformance.DirtySchedulerInfo.info()
    {:ok, assign(socket, :scheduler_info, info)}
  end

  @impl true
  def handle_info(:refresh, socket) do
    Process.send_after(self(), :refresh, @refresh_interval)
    info = PrismaticPerformance.DirtySchedulerInfo.info()
    {:noreply, assign(socket, :scheduler_info, info)}
  end
end
```

## Cross-References

- [Process](@/glossary/process.md) - BEAM execution units managed by the scheduler
- [Run Queue](@/glossary/run-queue.md) - Per-scheduler queue of processes awaiting execution
- [Runtime](@/glossary/runtime.md) - BEAM runtime environment configuring scheduler behavior
- [Profiling](@/glossary/profiling.md) - Performance measurement revealing scheduler utilization
- [Percentile](@/glossary/percentile.md) - Statistical measure for scheduler utilization distributions

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
