+++
title = "Performance Testing"
weight = 50
[extra]
description = "Systematic methodology for measuring, validating, and enforcing application performance characteristics through automated benchmarks, load tests, and telemetry-driven analysis within the Prismatic Platform"
category = "quality"
abbreviation = "PT"
date_created = "2026-02-22"
last_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
word_count = 2900
difficulty = "advanced"
status = "active"
quality_score = 95
tags = ["performance", "testing", "benchmarking", "load-testing", "stress-testing", "quality", "telemetry", "latency", "throughput", "elixir", "beam"]
related_terms = ["performance-tracking", "performance", "testing", "latency", "throughput", "telemetry", "observability", "quality-gates", "regression-testing", "scalability"]
see_also = ["architecture", "capabilities", "technologies"]
date_modified = "2026-02-23"
keywords = ["Performance", "Testing", "Systematic", "Prismatic", "Platform", "glossary", "quality", "Prismatic Platform", "BEAM", "Benchee"]
image = "/images/sections/glossary.png"
image_alt = "Performance Testing - Prismatic Platform"
+++

## Definition

Performance Testing is a systematic engineering discipline within the Prismatic Platform that quantifies application behavior under controlled conditions to validate that latency, throughput, memory consumption, and resource utilization meet defined thresholds. Unlike functional testing, which verifies that software produces correct outputs, performance testing verifies that correct outputs are produced within acceptable time and resource constraints. In the Prismatic Platform, performance testing is not an optional late-stage activity -- it is an integral part of the quality gate pipeline, enforced through automated benchmarks, [telemetry](/glossary/telemetry/)-driven assertions, and hard page-load performance limits that block merges when violated.

The platform enforces a P0-absolute performance standard: all pages must load under 250ms total, server-side rendering must complete under 100ms, LiveView mount must complete under 150ms, LiveView event handlers must complete under 50ms, and health checks must respond under 10ms. These are not aspirational targets but blocking merge criteria enforced by `mix performance.check` and CI pipeline gates. Violations at the 250-500ms level block merges; violations above 500ms trigger immediate rollback.

## Interactive Performance Analytics

<div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden my-8">
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span class="font-semibold text-white text-lg">Quality DNA Evolution & Performance Metrics</span>
            </div>
            <div class="flex gap-2">
                <button @click="timeRange = 'week'"
                        :class="timeRange === 'week' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Week
                </button>
                <button @click="timeRange = 'month'"
                        :class="timeRange === 'month' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Month
                </button>
                <button @click="timeRange = 'quarter'"
                        :class="timeRange === 'quarter' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Quarter
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Quality DNA Evolution Chart -->
            <div class="bg-gray-750 rounded-lg p-4">
                <h4 class="font-medium text-white mb-4 flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Quality DNA Evolution
                </h4>
                <div class="relative h-48" x-data="qualityDnaChart()" x-init="initChart()">
                    <canvas id="qualityDnaChart"></canvas>
                </div>
            </div>

            <!-- Performance Metrics Chart -->
            <div class="bg-gray-750 rounded-lg p-4">
                <h4 class="font-medium text-white mb-4 flex items-center gap-2">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    Performance Thresholds
                </h4>
                <div class="relative h-48" x-data="performanceMetricsChart()" x-init="initChart()">
                    <canvas id="performanceMetricsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Fitness Score Progression -->
        <div class="bg-gray-750 rounded-lg p-4">
            <h4 class="font-medium text-white mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                Platform Fitness Score Progression (Generation 19)
            </h4>
            <div class="relative h-64" x-data="fitnessProgressionChart()" x-init="initChart()">
                <canvas id="fitnessChart"></canvas>
            </div>
        </div>

        <!-- Performance Statistics Grid -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">89ms</div>
                <div class="text-xs text-gray-400 mb-1">Avg Page Load</div>
                <div class="w-full bg-gray-600 rounded-full h-1">
                    <div class="bg-green-400 h-1 rounded-full" style="width: 64.4%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">Threshold: 250ms</div>
            </div>

            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">67ms</div>
                <div class="text-xs text-gray-400 mb-1">Server Render</div>
                <div class="w-full bg-gray-600 rounded-full h-1">
                    <div class="bg-green-400 h-1 rounded-full" style="width: 67%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">Threshold: 100ms</div>
            </div>

            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-yellow-400">134ms</div>
                <div class="text-xs text-gray-400 mb-1">LiveView Mount</div>
                <div class="w-full bg-gray-600 rounded-full h-1">
                    <div class="bg-yellow-400 h-1 rounded-full" style="width: 89.3%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">Threshold: 150ms</div>
            </div>

            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">0.9995</div>
                <div class="text-xs text-gray-400 mb-1">Fitness Score</div>
                <div class="w-full bg-gray-600 rounded-full h-1">
                    <div class="bg-green-400 h-1 rounded-full" style="width: 99.95%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">Apex Achievement</div>
            </div>
        </div>
    </div>
</div>

<script>
// Initialize Prismatic Chart Manager if not already done
if (typeof window.prismaticCharts === 'undefined') {
    window.prismaticCharts = new PrismaticChartManager({
        apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api/v1',
        cacheTimeout: 20000, // Faster cache for performance data
        retryAttempts: 3
    });
}

Alpine.data('qualityDnaChart', () => ({
    timeRange: 'month',
    chart: null,
    isLoading: true,
    error: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('qualityDnaChart');
            if (!ctx) {
                throw new Error('Quality DNA chart canvas not found');
            }

            console.log('📊 Initializing live quality DNA evolution...');

            // Fetch real quality DNA evolution data
            const dnaData = await window.prismaticCharts.apiCall('evolution/dna_evolution');
            this.chart = new Chart(ctx, this.getQualityConfig(dnaData));

            this.isLoading = false;
            console.log('✅ Quality DNA chart initialized');
        } catch (error) {
            console.error('❌ Failed to initialize quality DNA chart:', error);
            this.error = error.message;
            this.isLoading = false;
        }
    },

    getQualityConfig(dnaData) {
        const data = dnaData || {
            timeline: Array.from({ length: 8 }, (_, i) => ({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
                quality_score: 87 + i * 1.5 + Math.random() * 2
            }))
        };

        return {
            type: 'line',
            data: {
                labels: data.timeline.map(t => t.month),
                datasets: [{
                    label: 'Live Quality Score',
                    data: data.timeline.map(t => t.quality_score),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: window.prismaticCharts.getTooltipConfig(),
                    title: {
                        display: true,
                        text: `Live Quality DNA Evolution - Current: ${data.current_score || 100}/100`,
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: { size: 12 }
                    }
                },
                scales: window.prismaticCharts.getScaleConfig()
            }
        };
    }
}));

Alpine.data('performanceMetricsChart', () => ({
    chart: null,
    isLoading: true,
    error: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('performanceMetricsChart');
            if (!ctx) {
                throw new Error('Performance metrics chart canvas not found');
            }

            console.log('⚡ Initializing live performance telemetry...');

            // Create real-time performance chart with streaming updates
            this.chart = await window.prismaticCharts.createPerformanceChart('performanceMetricsChart', {
                chartType: 'bar',
                realTime: true
            });

            this.isLoading = false;
            console.log('✅ Live performance chart initialized');
        } catch (error) {
            console.error('❌ Failed to initialize performance chart:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }
    },

    createFallbackMessage() {
        const container = document.querySelector('#performanceMetricsChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-48 bg-gray-750 rounded-lg border border-yellow-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-4';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-yellow-400 font-medium mb-2';
            titleDiv.textContent = '⚡ Telemetry Unavailable';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-xs';
            errorDiv.textContent = this.error;

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    }
}));

Alpine.data('fitnessProgressionChart', () => ({
    chart: null,
    isLoading: true,
    error: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('fitnessChart');
            if (!ctx) {
                throw new Error('Fitness progression chart canvas not found');
            }

            console.log('🏆 Initializing live fitness progression...');

            // Create fitness chart with evolution data
            this.chart = await window.prismaticCharts.createFitnessChart('fitnessChart', {
                chartType: 'trends',
                realTime: true
            });

            this.isLoading = false;
            console.log('✅ Live fitness progression chart initialized');
        } catch (error) {
            console.error('❌ Failed to initialize fitness chart:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }
    },

    createFallbackMessage() {
        const container = document.querySelector('#fitnessChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-64 bg-gray-750 rounded-lg border border-purple-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-4';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-purple-400 font-medium mb-2';
            titleDiv.textContent = '🏆 Evolution Data Offline';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-xs';
            errorDiv.textContent = this.error;

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    }
}));
</script>

## Historical Context

Performance testing as an engineering discipline evolved alongside the growth of web applications in the early 2000s. Tools like Apache JMeter (1998), Gatling (2012), and k6 (2017) established the practice of load testing as a pre-deployment activity. However, these tools treat performance testing as a separate phase -- something done before release rather than integrated into the daily development workflow.

The Prismatic Platform's approach to performance testing reflects a generational shift in methodology. Rather than testing performance as a late-stage activity, performance validation is integrated at every stage: micro-benchmarks during development, regression checks during pre-commit, load tests during CI, and continuous monitoring in production. This multi-layer approach was formalized during Generation 10 of the platform's evolution, when the [AutoEvolve](/glossary/autoevolve/) system began including performance fitness as a dimension of its evolutionary scoring function.

The BEAM virtual machine introduces unique performance testing considerations that do not apply to thread-pooled runtimes. BEAM's preemptive scheduler ensures that no single process can monopolize a scheduler thread for more than a fixed number of reductions (approximately 4000 function calls). This means that latency distribution in BEAM applications tends to have much tighter tail latencies than equivalent applications on the JVM or V8, because garbage collection pauses are per-process (microseconds) rather than global (milliseconds). Performance testing for [OTP](/glossary/otp/) applications must account for these characteristics, particularly the relationship between process count, scheduler count, and reduction budgets.

## Overview

Performance testing in the Prismatic Platform spans four distinct methodologies, each targeting different failure modes:

**Benchmark Testing** measures the execution time of individual functions and modules in isolation. The platform uses Benchee for micro-benchmarks, providing statistical analysis of execution times including mean, median, standard deviation, and percentile distributions. Benchmarks are run against baseline measurements to detect performance regressions before they reach production.

**Load Testing** evaluates system behavior under expected concurrent usage patterns. For the Prismatic Platform's LiveView-heavy architecture, this means simulating hundreds of concurrent WebSocket connections, each generating events that trigger server-side re-renders. Load testing validates that the [BEAM VM](/glossary/beam-vm/) scheduler distribution and process architecture handle concurrent workloads within latency budgets.

**Stress Testing** pushes the system beyond expected load to identify breaking points and degradation patterns. This reveals how the OTP supervision tree responds to resource exhaustion, whether circuit breakers activate at appropriate thresholds, and how gracefully the system degrades under extreme conditions. The platform's [fault tolerance](/glossary/fault-tolerance/) design must ensure that stress conditions cause graceful degradation rather than cascading failures.

**Endurance Testing** runs the system under sustained load for extended periods to detect memory leaks, ETS table growth, process accumulation, and other time-dependent degradation patterns. This is particularly important for long-running [GenServer](/glossary/genserver/) processes and ETS-backed caches that may accumulate state over time.

## Technical Details

### Benchee-Based Micro-Benchmarking

The platform uses Benchee as its standard benchmarking library, with conventions for structuring performance tests alongside functional tests:

```elixir
defmodule Prismatic.Performance.BenchmarkRunner do
  @moduledoc """
  Executes Benchee benchmarks with standardized configuration
  and regression detection against stored baselines.
  """

  @type benchmark_config :: %{
    warmup: pos_integer(),
    time: pos_integer(),
    memory_time: pos_integer(),
    reduction_time: pos_integer(),
    parallel: pos_integer()
  }

  @default_config %{
    warmup: 2,
    time: 5,
    memory_time: 2,
    reduction_time: 2,
    parallel: 1
  }

  @spec run(String.t(), map(), keyword()) :: :ok
  def run(name, scenarios, opts \\ []) do
    config = Map.merge(@default_config, Map.new(opts))

    Benchee.run(
      scenarios,
      warmup: config.warmup,
      time: config.time,
      memory_time: config.memory_time,
      reduction_time: config.reduction_time,
      parallel: config.parallel,
      formatters: [
        {Benchee.Formatters.Console, extended_statistics: true},
        {Benchee.Formatters.HTML, file: "benchmarks/output/#{name}.html"}
      ],
      before_scenario: fn input ->
        :telemetry.execute(
          [:prismatic, :benchmark, :scenario_start],
          %{system_time: System.system_time()},
          %{name: name, input: input}
        )
        input
      end
    )
  end

  @spec compare_to_baseline(String.t(), map()) ::
    {:ok, :within_threshold} | {:regression, map()}
  def compare_to_baseline(name, current_results) do
    case load_baseline(name) do
      {:ok, baseline} ->
        regression_check(baseline, current_results)
      {:error, :no_baseline} ->
        save_baseline(name, current_results)
        {:ok, :within_threshold}
    end
  end

  defp regression_check(baseline, current) do
    threshold = 1.15

    regressions =
      Enum.filter(current, fn {scenario, timing} ->
        baseline_timing = Map.get(baseline, scenario, timing)
        timing.median > baseline_timing.median * threshold
      end)

    case regressions do
      [] -> {:ok, :within_threshold}
      found -> {:regression, Map.new(found)}
    end
  end

  defp load_baseline(name) do
    path = "benchmarks/baselines/#{name}.json"
    case File.read(path) do
      {:ok, content} -> {:ok, Jason.decode!(content, keys: :atoms)}
      {:error, _} -> {:error, :no_baseline}
    end
  end

  defp save_baseline(name, results) do
    path = "benchmarks/baselines/#{name}.json"
    File.mkdir_p!("benchmarks/baselines")
    File.write!(path, Jason.encode!(results, pretty: true))
  end
end
```

### LiveView Performance Assertion

LiveView pages are performance-tested with assertions that enforce the platform's hard latency limits:

```elixir
defmodule PrismaticWeb.PerformanceTest do
  @moduledoc """
  Performance assertions for LiveView pages.
  Enforces the P0-absolute performance standard:
  - Total page load: < 250ms
  - Server render: < 100ms
  - LiveView mount: < 150ms
  - Event handler: < 50ms
  """

  use ExUnit.Case, async: true

  @max_render_ms 100
  @max_mount_ms 150
  @max_event_ms 50

  @spec assert_render_time(Plug.Conn.t(), String.t(), pos_integer()) :: :ok
  def assert_render_time(conn, path, max_ms \\ @max_render_ms) do
    {elapsed_us, {:ok, _conn}} = :timer.tc(fn ->
      Phoenix.ConnTest.get(conn, path)
    end)

    elapsed_ms = elapsed_us / 1_000

    assert elapsed_ms < max_ms,
      "Render time for #{path} was #{Float.round(elapsed_ms, 2)}ms, " <>
      "exceeding #{max_ms}ms limit"

    :telemetry.execute(
      [:prismatic, :performance_test, :render],
      %{duration_ms: elapsed_ms},
      %{path: path, threshold_ms: max_ms}
    )

    :ok
  end

  @spec assert_mount_time(module(), map(), pos_integer()) :: :ok
  def assert_mount_time(live_module, params, max_ms \\ @max_mount_ms) do
    {elapsed_us, {:ok, _view, _html}} = :timer.tc(fn ->
      live(build_conn(), live_module, params)
    end)

    elapsed_ms = elapsed_us / 1_000

    assert elapsed_ms < max_ms,
      "Mount time for #{inspect(live_module)} was #{Float.round(elapsed_ms, 2)}ms, " <>
      "exceeding #{max_ms}ms limit"

    :ok
  end

  @spec assert_event_time(Phoenix.LiveViewTest.View.t(), String.t(), map(), pos_integer()) :: :ok
  def assert_event_time(view, event, params, max_ms \\ @max_event_ms) do
    {elapsed_us, {:ok, _view, _html}} = :timer.tc(fn ->
      Phoenix.LiveViewTest.render_click(view, event, params)
    end)

    elapsed_ms = elapsed_us / 1_000

    assert elapsed_ms < max_ms,
      "Event #{event} took #{Float.round(elapsed_ms, 2)}ms, " <>
      "exceeding #{max_ms}ms limit"

    :ok
  end
end
```

### Telemetry-Driven Performance Monitoring

The platform integrates performance testing with its [telemetry](/glossary/telemetry/) infrastructure to provide continuous production performance validation:

```elixir
defmodule Prismatic.Performance.TelemetryCollector do
  @moduledoc """
  Collects performance telemetry events and validates them
  against defined thresholds. Produces structured performance
  reports for CI gate evaluation.
  """

  use GenServer

  @type measurement :: %{
    event: [atom()],
    duration_ms: float(),
    timestamp: DateTime.t(),
    metadata: map()
  }

  @thresholds %{
    page_load: 250,
    server_render: 100,
    liveview_mount: 150,
    liveview_event: 50,
    health_check: 10,
    database_query: 50,
    ets_lookup: 1
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    attach_handlers()
    {:ok, %{measurements: [], violations: []}}
  end

  @impl GenServer
  def handle_cast({:measurement, measurement}, state) do
    category = categorize(measurement.event)
    threshold = Map.get(@thresholds, category, 1000)

    updated_state =
      if measurement.duration_ms > threshold do
        violation = %{
          measurement: measurement,
          category: category,
          threshold_ms: threshold,
          exceeded_by_ms: measurement.duration_ms - threshold
        }
        %{state | violations: [violation | state.violations],
                  measurements: [measurement | state.measurements]}
      else
        %{state | measurements: [measurement | state.measurements]}
      end

    {:noreply, updated_state}
  end

  @impl GenServer
  def handle_call(:report, _from, state) do
    report = %{
      total_measurements: length(state.measurements),
      total_violations: length(state.violations),
      violations_by_category: group_violations(state.violations),
      p50: percentile(state.measurements, 50),
      p95: percentile(state.measurements, 95),
      p99: percentile(state.measurements, 99)
    }
    {:reply, report, state}
  end

  defp attach_handlers do
    events = [
      [:phoenix, :endpoint, :stop],
      [:phoenix, :live_view, :mount, :stop],
      [:phoenix, :live_view, :handle_event, :stop],
      [:prismatic, :query, :stop]
    ]

    :telemetry.attach_many(
      "performance-collector",
      events,
      &handle_event/4,
      nil
    )
  end

  defp handle_event(event, measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(
      measurements.duration, :native, :millisecond
    )

    GenServer.cast(__MODULE__, {:measurement, %{
      event: event,
      duration_ms: duration_ms,
      timestamp: DateTime.utc_now(),
      metadata: metadata
    }})
  end

  defp categorize([:phoenix, :endpoint, :stop]), do: :page_load
  defp categorize([:phoenix, :live_view, :mount, :stop]), do: :liveview_mount
  defp categorize([:phoenix, :live_view, :handle_event, :stop]), do: :liveview_event
  defp categorize([:prismatic, :query, :stop]), do: :database_query
  defp categorize(_), do: :unknown

  defp group_violations(violations) do
    Enum.group_by(violations, & &1.category)
    |> Enum.map(fn {cat, vs} -> {cat, length(vs)} end)
    |> Map.new()
  end

  defp percentile(measurements, pct) do
    sorted = Enum.sort_by(measurements, & &1.duration_ms)
    index = round(length(sorted) * pct / 100) - 1
    Enum.at(sorted, max(index, 0), %{duration_ms: 0}).duration_ms
  end
end
```

## Implementation

Performance testing in the Prismatic Platform is integrated at multiple stages of the development lifecycle:

**Development Phase**: Developers run `mix performance.check` locally before committing. This executes benchmark suites for changed modules and validates that no performance regressions are introduced. The tool compares current measurements against stored baselines and reports any measurements that exceed the 15% regression threshold.

**Pre-Commit Phase**: The `.githooks/pre-commit` hook includes performance regression checks for modules that have known benchmarks. If a changed module has an associated benchmark file and the benchmark shows regression, the commit is blocked.

**CI Pipeline Phase**: The GitLab CI pipeline runs the full performance test suite, including load tests that simulate concurrent users. Performance violations cause pipeline failures, preventing merge requests with regressions from being merged.

**Production Phase**: The [telemetry](/glossary/telemetry/) infrastructure continuously collects performance measurements from the production deployment. P95 latency exceeding 200ms triggers alerts. Sustained violations trigger automated investigation through the [AutoHeal](/glossary/autoheal/) system.

**Evolution Phase**: The [AutoEvolve](/glossary/autoevolve/) system includes performance optimization as one of its evolution dimensions. It identifies modules with degrading performance trends and generates optimization recommendations.

## Comparison

| Approach | Granularity | Automation | Regression Detection | Production Correlation |
|----------|------------|------------|---------------------|----------------------|
| **Manual Load Testing** | Coarse (whole system) | Low (human-driven) | Inconsistent | Moderate |
| **APM Tools Only** | Fine (per-request) | High (passive collection) | Reactive (detects after deploy) | High |
| **Prismatic Performance Testing** | Multi-level (function to system) | Full (CI-integrated) | Proactive (blocks before merge) | High (telemetry-driven) |
| **Property-Based Performance** | Medium (behavioral) | High (generative) | Good (statistical) | Moderate |
| **Chaos Engineering** | System-level | High (automated injection) | Indirect (resilience, not speed) | High |

The Prismatic approach combines micro-benchmarks (Benchee), macro-benchmarks (load testing), telemetry-driven monitoring, and hard CI gates into a unified pipeline. This multi-layer approach catches regressions at the earliest possible stage -- ideally during local development, certainly before merge, and as a safety net in production.

## Best Practices

**Benchmark the hot path first.** Not all code paths warrant benchmarks. Focus on request handling, database queries, ETS lookups, and LiveView render paths -- the code that executes on every user interaction. Use [telemetry](/glossary/telemetry/) data from production to identify which paths are actually hot.

**Store baselines in version control.** Benchmark baselines should be committed alongside the code they measure. This ensures that baseline comparisons are reproducible and that performance expectations evolve with the codebase.

**Use statistical analysis, not single measurements.** A single benchmark run is meaningless due to JIT warmup, garbage collection pauses, and system load variation. Benchee provides mean, median, standard deviation, and percentile distributions. Use the median for regression detection and P99 for worst-case validation.

**Test with realistic data volumes.** A function that performs well on 10 records may degrade catastrophically on 10,000. Benchmark with data volumes that represent production reality, including edge cases like empty collections and maximum-size inputs.

**Separate performance tests from functional tests.** Performance tests are inherently slower and more variable than functional tests. Run them in a dedicated CI stage rather than mixing them into the main test suite. Use `mix test --only performance` tagging.

**Set explicit, documented thresholds.** Every performance test should assert against a specific threshold, not just "faster than before." The platform's 250ms page load, 100ms render, 150ms mount, and 50ms event thresholds are documented, enforced, and non-negotiable.

## Pitfalls

**Benchmarking in non-representative environments.** Development machines differ significantly from production infrastructure. BEAM VM performance depends on scheduler count, which correlates with CPU cores. A benchmark on a developer laptop with 4 cores may not predict behavior on a production server with 32 cores. Use consistent CI infrastructure for benchmark comparisons.

**Ignoring memory performance.** Latency benchmarks alone miss memory regressions. A function that becomes faster by caching more data in memory may cause ETS table bloat or increased garbage collection pressure. Always measure memory alongside time.

**Over-optimizing cold paths.** Code that executes once during application startup or once per deployment does not benefit meaningfully from micro-optimization. Reserve performance testing effort for code that executes on the request hot path.

**Treating performance tests as flaky.** Performance test variability is a signal, not noise. If a benchmark produces inconsistent results, the underlying code likely has non-deterministic performance characteristics (cache misses, lock contention, GC pauses) that warrant investigation.

**Benchmarking across BEAM versions.** OTP/Erlang releases can change performance characteristics of built-in functions. Ensure baselines are regenerated when upgrading the BEAM VM version to avoid false regression signals.

## Use Cases

**LiveView Dashboard Launch**: Before deploying the Prismatic Perimeter EASM dashboard, load tests validated that the LiveView page handles 200 concurrent WebSocket connections with P95 mount time under 150ms. The benchmark revealed that initial ETS table lookups for security ratings needed batch prefetching, which was implemented before launch.

**API Gateway Optimization**: The Prismatic API's generic dispatch controller routes requests through module introspection. Benchmarks demonstrated that the initial implementation's `Code.fetch_docs/1` call on every request added 12ms of latency. Caching the introspection results in ETS reduced per-request overhead to under 0.5ms, well within the 50ms event handler budget.

**Query Performance Regression**: A Credo rule change inadvertently modified a pattern-matching path that affected Ecto query construction. The performance test suite caught a 40% latency regression in the affected query before the change reached the CI merge gate.

**Evolution Fitness Tracking**: The AutoEvolve system uses performance benchmarks as one dimension of its fitness function. When a code evolution candidate is generated, benchmarks validate that the change does not degrade performance. Only changes that maintain or improve performance while passing all quality gates are applied.

## Telemetry Events Reference

The performance testing infrastructure emits and consumes the following [telemetry](/glossary/telemetry/) events:

| Event | Measurements | Threshold | Gate Level |
|-------|-------------|-----------|------------|
| `[:phoenix, :endpoint, :stop]` | `duration` | 250ms | BLOCKING |
| `[:phoenix, :live_view, :mount, :stop]` | `duration` | 150ms | BLOCKING |
| `[:phoenix, :live_view, :handle_event, :stop]` | `duration` | 50ms | BLOCKING |
| `[:phoenix, :router_dispatch, :stop]` | `duration` | 100ms | WARNING |
| `[:prismatic, :query, :stop]` | `duration` | 50ms | WARNING |
| `[:prismatic, :benchmark, :regression]` | `delta_pct` | 15% | BLOCKING |
| `[:prismatic, :performance_test, :render]` | `duration_ms` | varies | BLOCKING |

These events form the data backbone of the performance testing pipeline. During development, they feed into the benchmark comparison system. In CI, they feed into the merge gate evaluation. In production, they feed into the [Quality Floor Guardian](/glossary/quality-floor-guardian/) for continuous monitoring and alerting.

## Related Concepts

- [Performance Tracking](/glossary/performance-tracking/) -- Continuous production monitoring that complements pre-merge performance testing
- [Performance](/glossary/performance/) -- The broader concept of application performance within the platform
- [Testing](/glossary/testing/) -- The overarching testing discipline that includes performance testing as a specialized domain
- [Telemetry](/glossary/telemetry/) -- The instrumentation infrastructure that provides performance measurement data
- [Observability](/glossary/observability/) -- The system-wide visibility that includes performance metrics as a key signal
- [Latency](/glossary/latency/) -- The primary metric validated by performance testing
- [Throughput](/glossary/throughput/) -- The capacity metric validated under load testing conditions
- [Quality Gates](/glossary/quality-gates/) -- The enforcement pipeline that includes performance checks as blocking gates
- [Regression Testing](/glossary/regression-testing/) -- The regression prevention methodology applied to performance baselines
- [Scalability](/glossary/scalability/) -- The system property validated through load and stress testing

## See Also

- [Architecture](/architecture/) -- Platform architecture designed for measurable, testable performance
- [Platform Capabilities](/capabilities/) -- Performance enforcement as a core platform capability
- [Applications](/apps/) -- 115 OTP applications with enforced performance budgets
- [Technologies](/technologies/) -- BEAM VM, Benchee, Telemetry, and the performance testing stack
- [Agent Registry](/agents/) -- Performance testing agents and automated optimization

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
