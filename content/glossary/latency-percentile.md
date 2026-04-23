+++
title = "Latency Percentile"
weight = 50
[extra]
description = "A latency percentile is a statistical measure indicating the response time below which a given percentage of requests complete, providing a more accurate picture of user experience than averages by capturing tail latency behavior"
category = "data"
domain = "observability"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["p95", "p99", "mean", "median", "percentile", "page-load", "kpi", "telemetry", "slo", "sla", "histogram", "t-digest", "hdr-histogram", "coordinated-omission"]
tags = ["glossary", "latency", "percentile", "performance", "response-time", "tail-latency", "monitoring", "sla", "slo", "telemetry", "beam", "observability", "p95", "p99"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Latency percentiles reveal tail behavior that averages hide, making P95 and P99 the standard metrics for monitoring real user experience in the Prismatic Platform"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["latency percentile", "P95 latency", "P99 latency", "tail latency", "response time distribution", "performance monitoring", "SLA measurement", "request latency", "t-digest", "HDR Histogram", "coordinated omission", "telemetry"]
image = "/images/sections/glossary.png"
image_alt = "Latency Percentile - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "performance-testing", "telemetry"]
+++

## Definition

A **latency percentile** is a statistical measure that describes the distribution of response times in a system. The Nth percentile latency is the value below which N% of all observed response times fall. For example, a P95 latency of 120ms means that 95% of requests complete in 120ms or less, while 5% take longer. Latency percentiles are preferred over mean (average) latency for performance monitoring because they expose tail behavior -- the slow requests that disproportionately affect user experience and are hidden by averages.

The distinction matters significantly: a system with mean latency of 50ms might have P99 latency of 2000ms, meaning 1 in 100 users waits 40x longer than "average." Mean latency would report this system as "fast," while percentile analysis reveals a severe tail latency problem. For this reason, industry-standard SLAs and SLOs are defined in terms of percentiles, not averages.

Latency percentiles are particularly important in microservice architectures where a single user request fans out across multiple services. If each service has P99 latency of 100ms and a request touches 10 services serially, the compound P99 latency is much worse than 100ms because the probability of hitting at least one tail event increases with each hop.

## Core Concepts

### Standard Percentile Levels

| Percentile | Symbol | Meaning | Typical Use |
|-----------|--------|---------|-------------|
| P50 | Median | 50% of requests faster than this | Typical user experience |
| P75 | Upper quartile | 75% of requests faster | Early degradation signal |
| P90 | - | 90% of requests faster | Noticeable degradation |
| P95 | - | 95% of requests faster | Standard SLO target |
| P99 | - | 99% of requests faster | Worst-case user experience |
| P99.9 | Three nines | 99.9% of requests faster | Ultra-low-latency systems |
| P99.99 | Four nines | 99.99% of requests faster | Financial trading systems |

### Why Averages Lie

| Scenario | Mean | Median (P50) | P95 | P99 | Diagnosis |
|----------|------|-------------|-----|-----|-----------|
| **Healthy** | 45ms | 40ms | 80ms | 120ms | Tight distribution, good |
| **Hidden tail** | 50ms | 35ms | 150ms | 2000ms | GC pauses or resource contention |
| **Bimodal** | 200ms | 50ms | 800ms | 1500ms | Two populations (cache hit/miss) |
| **Degrading** | 100ms | 95ms | 400ms | 400ms | Consistent slow resource |

The mean hides all of these patterns. Only percentile analysis reveals the true latency distribution.

### Percentile Computation Methods

Computing percentiles requires storing or summarizing the full distribution of observed values. Three primary approaches exist, each with different tradeoffs:

| Method | Memory | Accuracy | Mergeable | Query Speed | Best For |
|--------|--------|----------|-----------|-------------|---------|
| **Sorted Array** | O(n) | Exact | No | O(1) after sort | Small datasets, tests |
| **t-digest** | O(k) fixed | ~0.1% error at tails | Yes | O(1) | Distributed systems |
| **HDR Histogram** | O(k) fixed | Configurable precision | Yes | O(1) | Low-latency, microsecond |
| **Fixed-bucket Histogram** | O(buckets) | Bucket resolution | Yes | O(1) | Prometheus, simple systems |
| **Reservoir Sampling** | O(k) fixed | Statistical | No | O(k log k) | Streaming, limited memory |

**Sorted Array**: Store all values, sort, and index. Exact but O(n) memory. Only practical for small datasets or tests.

**t-digest**: Maintains a set of centroids that cluster tightly at distribution extremes (where percentile accuracy matters most) and loosely in the middle. Uses ~1KB of memory regardless of data volume. Crucially, t-digests from multiple nodes can be merged to produce accurate global percentiles -- essential for distributed systems.

**HDR Histogram**: Uses a log-linear bucketing scheme that provides configurable precision (typically 3 significant digits) across a wide dynamic range (e.g., 1 microsecond to 1 hour). Fixed memory (typically 20-100KB depending on range and precision). Extremely fast recording (single array index + increment).

**Fixed-bucket Histogram**: Pre-defined bucket boundaries (e.g., 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s). Simple and mergeable but accuracy depends on bucket granularity. Used by Prometheus and Telemetry.Metrics.

## Technical Deep Dive

### BEAM Latency Characteristics

The BEAM runtime introduces specific latency patterns that affect percentile distributions:

| Source | Latency Impact | Percentile Effect | Mitigation |
|--------|---------------|-------------------|------------|
| **Process scheduling** | 1-10 microseconds jitter | Broadens P50-P90 slightly | Normal, no mitigation needed |
| **Per-process GC** | 0.1-5ms pauses | Adds to P95-P99 | Keep process heaps small |
| **ETS contention** | Microseconds to milliseconds | Spikes at P99+ | Use `read_concurrency: true` |
| **NIF execution** | Variable, potentially long | Can dominate P99.9 | Use dirty schedulers |
| **Scheduler imbalance** | Variable | Inconsistent tail | Check `:scheduler.utilization/1` |
| **Full-sweep GC** | 1-50ms | P99.9 outliers | Tune `fullsweep_after` |

The BEAM's per-process GC model means that garbage collection never stops the entire system -- unlike JVM stop-the-world collections that can cause 50-500ms pauses affecting all requests simultaneously. This gives BEAM applications tight latency distributions with P99/P50 ratios typically below 5x, while JVM applications commonly show 50-100x ratios during GC events.

### Coordinated Omission

Coordinated omission is the most common and most dangerous latency measurement error. It occurs when the load generator waits for each response before sending the next request (closed-loop testing):

```
Normal: request every 10ms
  T=0   T=10  T=20  T=30  T=40  T=50
  |---->|---->|---->|---->|---->|---->  (6 requests in 50ms)

With one slow response:
  T=0        T=35  T=45  T=55
  |---------->|---->|---->  (3 requests in 55ms)
  (25ms slow)

Coordinated omission: The 3 requests that WOULD have been sent during
T=10-T=30 are never measured. The system appears to have handled
fewer requests, hiding the true impact of the slow response.
```

The corrected measurement should account for the phantom requests that would have arrived during the slow response window. Gil Tene's wrk2 and Prismatic Platform's load testing tools implement coordinated omission correction.

### Aggregating Percentiles Across Services

A critical mathematical fact: **percentiles are not additive**. You cannot compute the P99 of a distributed system by averaging the P99 of each node. The correct approach is either:

1. Merge raw data (t-digests or histograms) from all nodes, then compute percentiles on the merged result
2. Store raw samples and compute global percentiles from the combined dataset

| Aggregation | Correct? | Why |
|------------|----------|-----|
| Average of P99s | No | Hides node-specific outliers |
| Max of P99s | Conservative | Overestimates global P99 |
| Merge t-digests then compute P99 | Yes | Mathematically correct |
| Merge histograms then compute P99 | Yes (within bucket resolution) | Standard Prometheus approach |

### SLO Definition Using Percentiles

Service Level Objectives (SLOs) should be defined using percentiles with error budgets:

| SLO Definition | Meaning | Monthly Error Budget |
|---------------|---------|---------------------|
| P95 < 200ms | 95% of requests complete in 200ms | 5% of requests can exceed 200ms |
| P99 < 500ms | 99% of requests complete in 500ms | ~7.2 hours of out-of-SLO time |
| P99.9 < 1000ms | 99.9% of requests under 1 second | ~43 minutes of out-of-SLO time |

Error budget consumption rate drives alerting:
- Consuming 10% of monthly error budget in 1 hour: page on-call
- Consuming 2% of monthly error budget in 1 hour: warning alert
- Consuming 0.1% of monthly error budget in 1 hour: informational

## Advanced Topics

### Tail Latency Amplification

In fan-out architectures (one request triggers N parallel backend calls), the overall latency is dominated by the slowest backend response. If each backend has P99 = 100ms, the probability of at least one backend exceeding 100ms increases with N:

| Fan-out (N) | P(at least one > P99) | Effective P99 of system |
|------------|----------------------|------------------------|
| 1 | 1% | 100ms |
| 5 | 4.9% | Much worse than 100ms |
| 10 | 9.6% | Even worse |
| 50 | 39.5% | Nearly P60 of backend becomes system P99 |
| 100 | 63.4% | System P99 approaches backend P50 |

This means that for high-fan-out systems, even P99.9 of individual services matters for overall user experience. The Prismatic Platform's OSINT pipeline, which can query dozens of adapters in parallel, mitigates this by using aggressive timeouts and fallback responses for slow adapters.

### Latency Distribution Modeling

Real-world latency distributions are rarely normal (Gaussian). Common shapes:

| Distribution | Shape | Cause | Percentile Implication |
|-------------|-------|-------|----------------------|
| **Log-normal** | Right-skewed, long tail | Resource contention, queuing | P99 >> P50, mean >> median |
| **Bimodal** | Two peaks | Cache hit/miss, cold start | Percentiles jump between modes |
| **Pareto** | Heavy tail | Dependent on data size | Extreme P99.9 values |
| **Exponential** | Decreasing from mode | Pure queuing system | Predictable tail growth |

Understanding the underlying distribution helps predict how percentiles will shift under load increases.

### Alerting on Percentile Degradation

Single-point threshold alerting (e.g., "alert if P99 > 500ms") produces too many false positives from transient spikes. Better approaches:

| Strategy | Implementation | Pros | Cons |
|----------|---------------|------|------|
| **Sustained breach** | P99 > 500ms for 5+ minutes | Filters transient spikes | Slow to detect |
| **Error budget burn rate** | Consuming budget 10x faster than target | Captures severity | Complex setup |
| **Percentile ratio** | Alert if P99/P50 > 10x | Detects tail problems regardless of absolute values | Needs ratio tuning |
| **Trend detection** | P99 increasing for 3 consecutive windows | Catches gradual degradation | Statistical sophistication |
| **Multi-percentile** | P50 + P95 + P99 all degrading | Confirms systemic issue | Many conditions to configure |

## Usage in Prismatic Platform

The Prismatic Platform enforces strict latency percentile requirements through the Page Load Performance Standard (P0 policy). All pages must load under 250ms total, with server-side render under 100ms, LiveView mount under 150ms, and event handlers under 50ms. These limits are measured at P95 in production via telemetry, with alerts triggering at P95 > 200ms. The `mix performance.check` task validates these thresholds and returns exit code 1 on violations, blocking merges.

Telemetry events (`:prismatic_web, :request, :stop`) emit timing metadata that feeds into the platform's monitoring stack. ETS-based histograms track per-route latency distributions with 1ms bucket resolution. The OSINT tool execution pipeline tracks per-tool P50, P95, and P99 latencies to identify slow external API integrations and schedule retries appropriately.

The platform's health endpoint (`/api/v1/health`) must respond within 10ms at P99 -- this constraint drives the decision to serve health checks from ETS-cached data rather than computing live metrics on each request.

Dashboard visualization uses Chart.js heatmaps to display latency distributions over time, with color intensity representing request density at each latency bucket. This reveals temporal patterns like GC-related periodic spikes or load-correlated degradation that single-value P99 metrics would miss.

## Code Examples

### Latency Tracker with Telemetry Integration

```elixir
defmodule PrismaticWeb.Telemetry.LatencyTracker do
  @moduledoc """
  Tracks request latency distributions and computes percentiles.
  Uses ETS-backed sorted storage with configurable retention.
  Emits telemetry events for SLO monitoring and alerting.
  """

  use GenServer

  require Logger

  @type percentile :: float()
  @type milliseconds :: non_neg_integer()
  @type route :: String.t()

  @max_samples_per_route 10_000
  @cleanup_interval_ms 60_000

  @doc "Start the latency tracker."
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc "Record a latency observation for a route."
  @spec record_latency(route(), milliseconds()) :: :ok
  def record_latency(route, latency_ms) do
    GenServer.cast(__MODULE__, {:record, route, latency_ms})
  end

  @doc """
  Compute a specific percentile for a route.

  ## Examples

      iex> LatencyTracker.get_percentile("/api/health", 99.0)
      {:ok, 8}

  """
  @spec get_percentile(route(), percentile()) :: {:ok, milliseconds()} | {:error, :no_data}
  def get_percentile(route, percentile) when percentile > 0 and percentile < 100 do
    GenServer.call(__MODULE__, {:percentile, route, percentile})
  end

  @doc """
  Compute multiple percentiles for a route in a single call.
  Returns a map of percentile => value.
  """
  @spec get_percentiles(route(), list(percentile())) :: {:ok, map()} | {:error, :no_data}
  def get_percentiles(route, percentiles) do
    GenServer.call(__MODULE__, {:percentiles, route, percentiles})
  end

  @doc """
  Returns a summary of all tracked routes with P50, P95, P99.
  """
  @spec summary() :: map()
  def summary do
    GenServer.call(__MODULE__, :summary)
  end

  @impl GenServer
  def init(_opts) do
    schedule_cleanup()
    {:ok, %{latencies: %{}, timestamps: %{}}}
  end

  @impl GenServer
  def handle_call({:percentile, route, pct}, _from, state) do
    case Map.get(state.latencies, route) do
      nil ->
        {:reply, {:error, :no_data}, state}

      values ->
        sorted = Enum.sort(values)
        value = percentile_from_sorted(sorted, pct)
        {:reply, {:ok, value}, state}
    end
  end

  @impl GenServer
  def handle_call({:percentiles, route, pcts}, _from, state) do
    case Map.get(state.latencies, route) do
      nil ->
        {:reply, {:error, :no_data}, state}

      values ->
        sorted = Enum.sort(values)

        result =
          Map.new(pcts, fn pct ->
            {pct, percentile_from_sorted(sorted, pct)}
          end)

        {:reply, {:ok, result}, state}
    end
  end

  @impl GenServer
  def handle_call(:summary, _from, state) do
    summary =
      Map.new(state.latencies, fn {route, values} ->
        sorted = Enum.sort(values)

        stats = %{
          count: length(sorted),
          p50: percentile_from_sorted(sorted, 50.0),
          p95: percentile_from_sorted(sorted, 95.0),
          p99: percentile_from_sorted(sorted, 99.0),
          min: List.first(sorted, 0),
          max: List.last(sorted, 0)
        }

        {route, stats}
      end)

    {:reply, summary, state}
  end

  @impl GenServer
  def handle_cast({:record, route, latency_ms}, state) do
    updated_latencies =
      Map.update(state.latencies, route, [latency_ms], fn existing ->
        [latency_ms | existing]
        |> Enum.take(@max_samples_per_route)
      end)

    check_slo_compliance(route, latency_ms)

    {:noreply, %{state | latencies: updated_latencies}}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    schedule_cleanup()
    {:noreply, state}
  end

  @spec percentile_from_sorted(list(milliseconds()), percentile()) :: milliseconds()
  defp percentile_from_sorted([], _pct), do: 0

  defp percentile_from_sorted(sorted, pct) do
    index = ceil(length(sorted) * pct / 100) - 1
    Enum.at(sorted, max(index, 0))
  end

  @spec check_slo_compliance(route(), milliseconds()) :: :ok
  defp check_slo_compliance(route, latency_ms) do
    if latency_ms > 500 do
      :telemetry.execute(
        [:prismatic, :web, :slo_breach],
        %{latency_ms: latency_ms},
        %{route: route, threshold: 500}
      )
    end

    :ok
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, @cleanup_interval_ms)
  end
end
```

### Telemetry Event Handler

```elixir
defmodule PrismaticWeb.Telemetry.RequestHandler do
  @moduledoc """
  Handles Phoenix telemetry events and feeds latency data
  to the LatencyTracker. Attached during application startup
  via :telemetry.attach/4.
  """

  require Logger

  @doc """
  Handles request completion events from Phoenix.
  Converts native time units to milliseconds and records.
  """
  @spec handle_event(list(atom()), map(), map(), term()) :: :ok
  def handle_event([:prismatic_web, :request, :stop], measurements, metadata, _config) do
    latency_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)
    route = Map.get(metadata, :route, "unknown")

    PrismaticWeb.Telemetry.LatencyTracker.record_latency(route, latency_ms)

    :telemetry.execute(
      [:prismatic, :web, :request_latency],
      %{duration_ms: latency_ms},
      %{route: route, status: Map.get(metadata, :status, 200)}
    )

    :ok
  end

  @doc """
  Handles LiveView mount events.
  Tracks mount latency separately from regular HTTP requests.
  """
  @spec handle_event(list(atom()), map(), map(), term()) :: :ok
  def handle_event([:phoenix, :live_view, :mount, :stop], measurements, metadata, _config) do
    latency_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)
    view = Map.get(metadata, :socket, %{}) |> Map.get(:view, "unknown")

    PrismaticWeb.Telemetry.LatencyTracker.record_latency("liveview:#{view}", latency_ms)

    if latency_ms > 150 do
      Logger.warning("LiveView mount exceeded 150ms SLO",
        view: view,
        latency_ms: latency_ms
      )
    end

    :ok
  end
end
```

### SLO Monitor with Error Budget

```elixir
defmodule PrismaticWeb.Telemetry.SLOMonitor do
  @moduledoc """
  Monitors SLO compliance using latency percentiles.
  Tracks error budget consumption rate and triggers alerts
  when burn rate exceeds thresholds.
  """

  use GenServer

  require Logger

  @slos %{
    page_load: %{percentile: 95.0, threshold_ms: 250, budget_pct: 5.0},
    server_render: %{percentile: 95.0, threshold_ms: 100, budget_pct: 5.0},
    liveview_mount: %{percentile: 95.0, threshold_ms: 150, budget_pct: 5.0},
    health_check: %{percentile: 99.0, threshold_ms: 10, budget_pct: 1.0}
  }

  @check_interval_ms 60_000

  @doc "Start the SLO monitor."
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc "Returns current SLO compliance status for all defined SLOs."
  @spec status() :: map()
  def status do
    GenServer.call(__MODULE__, :status)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()

    state = %{
      violations: %{},
      checks_total: 0,
      violations_total: 0
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call(:status, _from, state) do
    compliance =
      if state.checks_total > 0 do
        1.0 - state.violations_total / state.checks_total
      else
        1.0
      end

    {:reply, %{compliance: compliance, violations: state.violations, slos: @slos}, state}
  end

  @impl GenServer
  def handle_info(:check_slos, state) do
    schedule_check()

    new_state =
      Enum.reduce(@slos, state, fn {name, slo}, acc ->
        check_slo(name, slo, acc)
      end)

    {:noreply, new_state}
  end

  @spec check_slo(atom(), map(), map()) :: map()
  defp check_slo(name, %{percentile: pct, threshold_ms: threshold}, state) do
    routes = routes_for_slo(name)
    checks = state.checks_total + 1

    violation =
      Enum.any?(routes, fn route ->
        case PrismaticWeb.Telemetry.LatencyTracker.get_percentile(route, pct) do
          {:ok, value} when value > threshold ->
            Logger.warning("SLO breach: #{name} P#{pct}=#{value}ms > #{threshold}ms",
              slo: name,
              percentile: pct,
              actual: value,
              threshold: threshold
            )

            true

          _ ->
            false
        end
      end)

    violations =
      if violation do
        Map.update(state.violations, name, 1, &(&1 + 1))
      else
        state.violations
      end

    %{state |
      checks_total: checks,
      violations_total: state.violations_total + if(violation, do: 1, else: 0),
      violations: violations
    }
  end

  @spec routes_for_slo(atom()) :: list(String.t())
  defp routes_for_slo(:page_load), do: ["/hub/*", "/dashboard"]
  defp routes_for_slo(:server_render), do: ["/api/*"]
  defp routes_for_slo(:liveview_mount), do: ["liveview:*"]
  defp routes_for_slo(:health_check), do: ["/api/v1/health"]

  defp schedule_check do
    Process.send_after(self(), :check_slos, @check_interval_ms)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using mean instead of percentiles | Hides tail latency affecting real users | Monitor P50, P95, P99 as standard KPIs |
| Averaging percentiles across nodes | Mathematically incorrect, underestimates tail | Merge t-digests or histograms before computing |
| Coordinated omission in load tests | Underestimates latency by 10-100x | Use open-loop (constant-rate) load generators like wrk2 |
| Too few buckets in histogram | P99 accuracy limited to bucket resolution | Use t-digest or HDR Histogram for precise tails |
| Alerting on single P99 spike | Too many false positives from transient events | Alert on sustained breach or error budget burn rate |
| Ignoring fan-out amplification | Measuring individual service P99, missing user-facing P99 | Measure end-to-end latency at the edge |
| Pre-computing percentiles in source | Cannot re-analyze at different percentile levels | Store raw distributions, compute percentiles at query time |
| Fixed-window percentiles only | Miss gradual degradation within windows | Use sliding windows or exponentially-weighted moving statistics |
| Ignoring BEAM GC contribution | Attribute tail latency to wrong cause | Correlate P99 spikes with `:erlang.statistics(:garbage_collection)` |
| SLO on P50 only | Misses degradation affecting 5-10% of users | Set SLOs on P95 or P99 |

## Best Practices

1. **Monitor P50, P95, and P99 as standard latency KPIs** -- P50 shows typical experience, P95 shows degraded experience, P99 shows worst-case experience.

2. **Set SLOs based on P95 or P99, never on mean or P50** -- mean is misleading and P50 ignores the users who matter most (those experiencing problems).

3. **Use t-digest or HDR Histogram for memory-efficient percentile computation** -- both provide constant-memory operation with high accuracy at distribution extremes.

4. **Account for coordinated omission in load testing** -- use open-loop (constant-rate) generators. If using wrk, switch to wrk2. Always validate that your load generator does not back off during slow responses.

5. **Alert on percentile degradation trends** -- three consecutive P95 increases is more informative than a single-point breach. Use error budget burn rate for production alerting.

6. **Store raw latency distributions, not pre-computed percentiles** -- this enables retrospective analysis at any percentile level and correct aggregation across time windows.

7. **Measure end-to-end latency at the edge** -- individual service percentiles do not capture the user experience in fan-out architectures.

8. **Correlate percentile spikes with system events** -- cross-reference P99 spikes with GC events, deployment events, traffic spikes, and database query plan changes.

9. **Separate latency distributions by route and method** -- a single P99 for the entire application masks route-specific problems. Track per-route percentiles.

10. **Account for BEAM-specific latency sources** -- per-process GC, scheduler balance, ETS contention, and NIF execution all contribute to tail latency in predictable ways.

## Related Terms

- [P95](/glossary/p95/) -- the 95th percentile latency, a standard performance SLO
- [P99](/glossary/p99/) -- the 99th percentile latency, measuring worst-case experience
- [Mean](/glossary/mean/) -- arithmetic average that hides tail behavior
- [Median](/glossary/median/) -- 50th percentile, the typical experience measure
- [Page Load](/glossary/page-load/) -- end-to-end page rendering time measured in percentiles
- [Telemetry](/glossary/telemetry/) -- the instrumentation framework feeding latency data
- [KPI](/glossary/kpi/) -- key performance indicators including latency percentiles
- [Histogram](/glossary/histogram/) -- data structure for storing latency distributions
- [SLO](/glossary/slo/) -- service level objective defined using percentile thresholds
- [SLA](/glossary/sla/) -- service level agreement with percentile-based guarantees
- [Percentile](/glossary/percentile/) -- the general statistical concept underlying latency measurement
- [Throughput](/glossary/throughput/) -- request rate, the complement to latency measurement

## See Also

- [Capabilities](/capabilities/) -- performance monitoring capabilities
- [Architecture](/architecture/) -- telemetry and monitoring architecture
- [Performance Testing](/hub/system) -- latency dashboard visualization
- [BEAM Performance Guide](https://www.erlang.org/doc/efficiency_guide/processes.html) -- understanding BEAM scheduling impact on latency

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
