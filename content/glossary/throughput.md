+++
title = "Throughput"
weight = 50
[extra]
tags = ["glossary", "performance", "throughput", "beam-vm", "concurrency", "scalability", "requests-per-second", "scheduler", "genserver", "broadway"]
description = "Comprehensive guide to system throughput in the Prismatic Platform, covering BEAM VM scheduler throughput, requests per second measurement, GenStage backpressure, Broadway data pipelines, LiveView connection scaling, performance benchmarking with Benchee, and the platform's 250ms page load performance standard"
category = "performance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["latency", "backpressure", "scalability", "performance", "beam-vm", "concurrency", "broadway", "genstage", "connection-pooling", "load-balancing", "performance-testing", "observability", "telemetry", "circuit-breaker", "stream-processing"]
learning_outcomes = ["Understand throughput as a measure of system capacity in concurrent systems", "Analyze BEAM VM scheduler throughput and its impact on application performance", "Implement throughput measurement using Telemetry and custom metrics", "Apply backpressure patterns with GenStage and Broadway for sustained throughput", "Design systems that maintain throughput under load using OTP patterns", "Configure throughput monitoring with alerting for production systems"]
prerequisites = ["beam-vm", "concurrency", "performance", "telemetry"]
key_concepts = ["requests per second", "scheduler utilization", "reductions", "backpressure", "flow control", "pipeline throughput", "connection multiplexing", "batch processing", "work stealing", "saturation point"]
platform_relevance = "critical"
ecosystem_layer = "performance-infrastructure"
date_created = "2025-07-01"
date_modified = "2026-02-22"
version = "3.0.0"
performance_standard = "P0_ABSOLUTE"
audience = ["platform engineers", "performance engineers", "SRE", "backend developers"]
domain = "performance"
related_patterns = ["backpressure", "demand-driven flow", "work stealing", "connection pooling", "batch processing"]
see_also = ["system-optimization", "system-monitoring", "performance-tracking", "latency"]
acronyms = ["RPS = Requests Per Second", "TPS = Transactions Per Second", "SLO = Service Level Objective"]
standards = ["P0 ABSOLUTE performance standard", "250ms page load", "50ms event handling"]
tools = ["Benchee", "Telemetry", "Broadway", "GenStage", ":scheduler_wall_time"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Fly.io"]
importance = "critical"
word_count = 1568
keywords = ["Throughput", "Comprehensive", "Prismatic", "Platform", "BEAM", "GenStage", "Broadway", "glossary", "performance", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Throughput - Prismatic Platform"
+++

## Definition

Throughput is the measure of how much work a system completes per unit of time. In computing, this is typically expressed as requests per second (RPS), transactions per second (TPS), messages per second, or bytes per second, depending on the context. Throughput is one of the three fundamental performance metrics alongside latency (how long individual operations take) and error rate (how often operations fail). A system with high throughput can handle large volumes of work, but throughput alone does not indicate whether individual requests are served quickly -- that is the domain of latency.

In the Prismatic Platform, throughput is a critical performance characteristic measured across multiple dimensions: HTTP request throughput for the Phoenix web layer, message processing throughput for the GenStage/Broadway data pipelines, query throughput for the storage backends (PostgreSQL, ETS, Meilisearch, KuzuDB), and scheduler throughput for the BEAM VM itself. The platform enforces a P0 ABSOLUTE performance standard that constrains both throughput and latency -- all pages must load under 250ms, server-side render time must be under 100ms, and LiveView event handling must complete within 50ms.

## Historical Context

The study of throughput in computing systems dates to the earliest mainframe computers of the 1950s, where batch processing throughput (jobs per hour) was the primary performance metric. The shift from batch to interactive computing in the 1960s and 1970s introduced latency as a competing concern, and the tension between throughput optimization and latency optimization has defined system design ever since.

The concept was formalized in queueing theory by Agner Krarup Erlang (whose name graces the programming language underlying the BEAM VM). Erlang's work on telephone traffic engineering in the early 1900s established the mathematical foundations for understanding how systems behave under load -- specifically, how throughput degrades as load approaches capacity, and how queueing delays (latency) increase non-linearly near saturation.

Little's Law (1961) provides the fundamental relationship: L = lambda * W, where L is the number of items in a system, lambda is the throughput (arrival rate), and W is the average time an item spends in the system (latency). This law applies universally -- to web servers, message queues, database connections, and BEAM process mailboxes alike. Understanding this relationship is essential for reasoning about throughput in the Prismatic Platform.

The evolution of concurrent computing brought new throughput paradigms. Thread-pool models (common in Java/C# servers) achieve throughput through thread multiplexing but are limited by thread count and context-switching overhead. Event-loop models (Node.js) achieve high throughput for I/O-bound work but struggle with CPU-bound tasks. The BEAM VM's approach -- lightweight processes with preemptive scheduling -- offers a unique combination: high throughput for both I/O and CPU-bound work, with predictable latency even under heavy load.

## BEAM VM Scheduler Throughput

The BEAM VM's throughput characteristics derive from its scheduler architecture. The VM runs one scheduler per CPU core (configurable), and each scheduler maintains a run queue of lightweight processes. Processes are preemptively scheduled based on reduction counts -- each process receives a fixed budget of reductions (approximately 4000 per time slice) before being preempted, ensuring fair scheduling regardless of workload.

```elixir
defmodule Prismatic.Performance.SchedulerThroughput do
  @moduledoc """
  Monitors and reports BEAM VM scheduler throughput metrics.

  The BEAM runs one scheduler per CPU core, each maintaining a
  run queue of lightweight processes. Scheduler utilization measures
  what fraction of time each scheduler is actively executing work
  versus idle. High utilization indicates the system is near its
  throughput capacity.

  Integrates with :scheduler_wall_time to provide accurate
  per-scheduler utilization metrics.
  """

  @type scheduler_metric :: %{
          scheduler_id: pos_integer(),
          utilization: float(),
          active_time: non_neg_integer(),
          total_time: non_neg_integer()
        }

  @spec enable_monitoring() :: :ok
  def enable_monitoring do
    :erlang.system_flag(:scheduler_wall_time, true)
    :ok
  end

  @spec measure_utilization(non_neg_integer()) :: {:ok, [scheduler_metric()]}
  def measure_utilization(interval_ms \\ 1_000) do
    sample_1 = :erlang.statistics(:scheduler_wall_time_all)
    Process.sleep(interval_ms)
    sample_2 = :erlang.statistics(:scheduler_wall_time_all)

    metrics =
      Enum.zip(sample_1, sample_2)
      |> Enum.map(fn {{id, a1, t1}, {^id, a2, t2}} ->
        active = a2 - a1
        total = t2 - t1
        util = if total > 0, do: Float.round(active / total, 4), else: 0.0

        %{
          scheduler_id: id,
          utilization: util,
          active_time: active,
          total_time: total
        }
      end)

    {:ok, metrics}
  end

  @spec average_utilization([scheduler_metric()]) :: float()
  def average_utilization(metrics) do
    if metrics == [] do
      0.0
    else
      total = Enum.sum(Enum.map(metrics, & &1.utilization))
      Float.round(total / length(metrics), 4)
    end
  end

  @spec throughput_headroom([scheduler_metric()]) :: float()
  def throughput_headroom(metrics) do
    avg = average_utilization(metrics)
    Float.round(1.0 - avg, 4)
  end
end
```

Scheduler throughput in the BEAM is fundamentally different from thread-pool throughput in traditional systems. Because BEAM processes are so lightweight (approximately 300 bytes initial memory, microsecond creation time), the system can maintain millions of concurrent processes without significant overhead. The schedulers use work-stealing algorithms to balance load across cores, and the dirty scheduler mechanism handles long-running NIF calls without blocking normal schedulers.

## Request Throughput in Phoenix

Phoenix, the web framework powering the Prismatic Platform's web layer, achieves its throughput characteristics through the combination of BEAM concurrency, Cowboy's efficient HTTP handling, and Phoenix's connection pooling. Each incoming HTTP request is handled by a separate BEAM process, enabling the server to handle thousands of concurrent connections without degradation.

```elixir
defmodule Prismatic.Performance.RequestThroughput do
  @moduledoc """
  Measures and reports HTTP request throughput for the Phoenix
  web layer. Tracks requests per second, response times, and
  throughput distribution across endpoints.

  Integrates with Phoenix.Telemetry for automatic event capture
  and emits custom telemetry events for dashboard consumption.
  """

  use GenServer

  @type throughput_window :: %{
          window_start: integer(),
          window_end: integer(),
          request_count: non_neg_integer(),
          total_duration_us: non_neg_integer(),
          max_duration_us: non_neg_integer(),
          status_counts: %{pos_integer() => non_neg_integer()},
          endpoint_counts: %{String.t() => non_neg_integer()}
        }

  @window_size_ms 1_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_rps() :: {:ok, float()}
  def current_rps do
    GenServer.call(__MODULE__, :current_rps)
  end

  @spec throughput_report(non_neg_integer()) :: {:ok, [throughput_window()]}
  def throughput_report(windows \\ 60) do
    GenServer.call(__MODULE__, {:report, windows})
  end

  @impl true
  def init(_opts) do
    :telemetry.attach(
      "throughput-tracker",
      [:phoenix, :endpoint, :stop],
      &handle_request_event/4,
      nil
    )

    {:ok, %{windows: [], current_window: new_window()}}
  end

  @impl true
  def handle_call(:current_rps, _from, state) do
    elapsed_ms = System.monotonic_time(:millisecond) - state.current_window.window_start
    rps = if elapsed_ms > 0 do
      state.current_window.request_count / (elapsed_ms / 1_000)
    else
      0.0
    end

    {:reply, {:ok, Float.round(rps, 2)}, state}
  end

  @impl true
  def handle_call({:report, count}, _from, state) do
    windows = Enum.take(state.windows, count)
    {:reply, {:ok, windows}, state}
  end

  @impl true
  def handle_info({:request, duration_us, status, endpoint}, state) do
    now = System.monotonic_time(:millisecond)
    window = state.current_window

    if now - window.window_start >= @window_size_ms do
      completed = %{window | window_end: now}
      new_state = %{
        windows: [completed | Enum.take(state.windows, 3599)],
        current_window: record_request(new_window(), duration_us, status, endpoint)
      }
      {:noreply, new_state}
    else
      {:noreply, %{state | current_window: record_request(window, duration_us, status, endpoint)}}
    end
  end

  defp handle_request_event(_event, %{duration: duration}, metadata, _config) do
    status = metadata[:conn].status || 0
    endpoint = metadata[:route] || "unknown"
    send(__MODULE__, {:request, System.convert_time_unit(duration, :native, :microsecond), status, endpoint})
  end

  defp new_window do
    %{
      window_start: System.monotonic_time(:millisecond),
      window_end: 0,
      request_count: 0,
      total_duration_us: 0,
      max_duration_us: 0,
      status_counts: %{},
      endpoint_counts: %{}
    }
  end

  defp record_request(window, duration_us, status, endpoint) do
    %{window |
      request_count: window.request_count + 1,
      total_duration_us: window.total_duration_us + duration_us,
      max_duration_us: max(window.max_duration_us, duration_us),
      status_counts: Map.update(window.status_counts, status, 1, &(&1 + 1)),
      endpoint_counts: Map.update(window.endpoint_counts, endpoint, 1, &(&1 + 1))
    }
  end
end
```

## Pipeline Throughput with GenStage and Broadway

For data processing pipelines, throughput is governed by the GenStage and Broadway libraries. GenStage provides a demand-driven data flow abstraction where consumers request data from producers, creating natural backpressure that prevents overwhelm. Broadway builds on GenStage to provide a production-ready framework for concurrent, multi-stage data processing with batching, rate limiting, and graceful shutdown.

```elixir
defmodule Prismatic.Performance.PipelineThroughput do
  @moduledoc """
  Demonstrates throughput optimization patterns for data processing
  pipelines using GenStage demand-driven flow control.

  The key insight is that throughput in pipeline systems is governed
  by the slowest stage (bottleneck). Optimizing throughput requires
  identifying and widening the bottleneck, either through parallelism
  (more consumer processes) or through batch processing (amortizing
  fixed overhead across multiple items).
  """

  @type pipeline_config :: %{
          producer_concurrency: pos_integer(),
          processor_concurrency: pos_integer(),
          batcher_concurrency: pos_integer(),
          batch_size: pos_integer(),
          batch_timeout_ms: pos_integer()
        }

  @spec optimal_config(atom(), keyword()) :: pipeline_config()
  def optimal_config(workload_type, opts \\ []) do
    schedulers = System.schedulers_online()

    case workload_type do
      :cpu_bound ->
        %{
          producer_concurrency: 1,
          processor_concurrency: schedulers,
          batcher_concurrency: max(div(schedulers, 4), 1),
          batch_size: Keyword.get(opts, :batch_size, 100),
          batch_timeout_ms: Keyword.get(opts, :batch_timeout, 500)
        }

      :io_bound ->
        %{
          producer_concurrency: Keyword.get(opts, :producers, 2),
          processor_concurrency: schedulers * 4,
          batcher_concurrency: schedulers,
          batch_size: Keyword.get(opts, :batch_size, 50),
          batch_timeout_ms: Keyword.get(opts, :batch_timeout, 200)
        }

      :mixed ->
        %{
          producer_concurrency: 2,
          processor_concurrency: schedulers * 2,
          batcher_concurrency: max(div(schedulers, 2), 1),
          batch_size: Keyword.get(opts, :batch_size, 75),
          batch_timeout_ms: Keyword.get(opts, :batch_timeout, 300)
        }
    end
  end

  @spec calculate_theoretical_max(pipeline_config(), non_neg_integer()) :: float()
  def calculate_theoretical_max(config, avg_item_processing_us) do
    # Theoretical max throughput = concurrency / avg_processing_time
    if avg_item_processing_us > 0 do
      items_per_second = config.processor_concurrency * (1_000_000 / avg_item_processing_us)
      Float.round(items_per_second, 2)
    else
      0.0
    end
  end
end
```

The critical insight for pipeline throughput is that the overall throughput is limited by the slowest stage -- the bottleneck. Adding concurrency to non-bottleneck stages does not improve overall throughput; it only adds resource consumption. Identifying the bottleneck requires measurement, not assumption, which is why the platform integrates Benchee-based performance testing and Telemetry-based production monitoring.

## Throughput Under Load: Saturation and Degradation

Every system has a saturation point -- the load level beyond which throughput stops increasing and latency begins rising dramatically. Understanding where this point lies is essential for capacity planning and autoscaling. The relationship between load and throughput follows a characteristic curve: throughput increases linearly with load at low utilization, begins to flatten as utilization increases, and eventually plateaus or even decreases beyond the saturation point due to contention, context-switching overhead, and resource exhaustion.

The BEAM VM's preemptive scheduling and lightweight process model push the saturation point much higher than traditional thread-pool architectures. Where a Java server might saturate at 10,000 concurrent connections (limited by thread pool size and context-switching cost), a BEAM application can sustain hundreds of thousands of concurrent processes with graceful degradation rather than cliff-edge failure.

However, the BEAM is not immune to saturation. Process mailbox overflow, ETS table contention, and IO bottlenecks (database connections, network sockets) can all create throughput ceilings. The platform mitigates these through several mechanisms: GenStage backpressure prevents mailbox overflow, connection pooling (via DBConnection) manages database access, circuit breakers prevent cascade failures when downstream services saturate, and the Quality Floor Guardian monitors throughput metrics with automated alerting.

## LiveView Connection Throughput

Phoenix LiveView introduces a unique throughput dimension: WebSocket connection throughput. Each LiveView connection maintains a persistent WebSocket, and the server must handle both the initial mount (HTTP) and ongoing events (WebSocket messages). The platform's performance standard requires LiveView mount under 150ms and event handling under 50ms.

LiveView throughput is measured in concurrent connections sustained at acceptable latency. The BEAM's process model maps naturally to this pattern -- each LiveView connection is a process, and the schedulers handle the multiplexing. The practical limit is typically memory (each LiveView process maintains state) rather than CPU, making memory-efficient state representation a key throughput optimization.

## Throughput Measurement and Benchmarking

Accurate throughput measurement requires careful methodology. The platform uses Benchee for micro-benchmarks (measuring function-level throughput), Telemetry for production monitoring (measuring real-world throughput), and custom load testing for capacity planning (measuring saturation points).

Benchee provides statistical rigor with warmup phases, multiple iterations, and percentile reporting. A benchmark that reports only average throughput is misleading -- the P99 throughput (throughput achieved 99% of the time) is more operationally relevant because it captures tail latency effects.

## Performance Standard Enforcement

The platform's P0 ABSOLUTE performance standard establishes hard throughput and latency limits. Total page load must be under 250ms. Server-side render must be under 100ms. LiveView mount must be under 150ms. LiveView handle_event must be under 50ms. Health checks must complete under 10ms. These are not targets or aspirations -- they are blocking requirements enforced by `mix performance.check` and the CI/CD pipeline.

Violations at the 250-500ms level (V3) block merge requests. Violations above 500ms (V4) trigger rejection and rollback. This enforcement ensures that throughput optimizations are not eroded over time by feature additions that introduce performance regressions.

## Throughput in Distributed Systems

The Prismatic Platform's deployment on Fly.io introduces distributed system throughput considerations. Requests are routed to the nearest edge region, database queries traverse the network to the primary PostgreSQL instance, and cache invalidation propagates across nodes. Network latency between regions directly impacts end-to-end throughput for operations that require cross-region coordination.

The platform mitigates this through read replicas (serving read-heavy queries from the nearest region), ETS caching (reducing database round trips), and eventual consistency where appropriate (allowing region-local operations to proceed without cross-region synchronization).

## Monitoring and Alerting

Throughput monitoring in the platform operates at three levels. Real-time dashboards (via LiveView and Telemetry) display current RPS, scheduler utilization, and pipeline throughput. Trend analysis tracks throughput over time, identifying gradual degradation that might indicate resource leaks or increasing load. Automated alerting fires when throughput drops below established baselines, with the Quality Floor Guardian triggering at warning (2% drop), critical (5% drop), and emergency (10% drop) thresholds.

## Optimization Strategies

When throughput optimization is needed (identified through measurement, not assumption), the platform follows a disciplined approach. First, identify the bottleneck through profiling (`:fprof`, `:eprof`, or Telemetry analysis). Second, determine if the bottleneck is CPU-bound, IO-bound, or memory-bound. Third, apply the appropriate optimization: parallelism for CPU-bound bottlenecks, async IO and connection pooling for IO-bound bottlenecks, and data structure optimization or caching for memory-bound bottlenecks. Fourth, measure the improvement with Benchee benchmarks. Fifth, verify that the optimization does not introduce latency regression.

## Cross-References

- [Latency](@/glossary/latency.md) -- Complementary performance metric measuring individual operation duration
- [Backpressure](@/glossary/backpressure.md) -- Flow control mechanism for sustaining throughput under load
- [BEAM VM](@/glossary/beam-vm.md) -- Virtual machine architecture enabling high-throughput concurrent systems
- [Broadway](@/glossary/broadway.md) -- Production-ready data pipeline framework built on GenStage
- [Scalability](@/glossary/scalability.md) -- System capacity to increase throughput with additional resources
- [Performance](@/glossary/performance.md) -- Umbrella term for system speed, efficiency, and resource utilization
- [Telemetry](@/glossary/telemetry.md) -- Observability framework for measuring and reporting throughput metrics
- [Connection Pooling](@/glossary/connection-pooling.md) -- Resource management pattern for database and network throughput
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Resilience pattern preventing cascade throughput failures
- [Load Balancing](@/glossary/load-balancing.md) -- Request distribution for aggregate throughput scaling
- [Stream Processing](@/glossary/stream-processing.md) -- Continuous data processing with throughput guarantees
- [GenStage](@/glossary/genstage.md) -- Demand-driven data flow for pipeline throughput management

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
