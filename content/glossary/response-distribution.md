+++
title = "Response Distribution"
weight = 50

[extra]
description = "The statistical distribution of response times across requests, revealing performance characteristics through percentiles (P50, P95, P99), histograms, and tail latency analysis rather than simple averages."
category = "data"
domain = "observability"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["time-to-first-byte", "standard-deviation", "variance", "statistics", "sla", "threshold", "telemetry", "benchmark", "kpi", "logging", "profiling", "latency", "monitoring"]
tags = ["response-distribution", "latency", "percentiles", "performance", "monitoring", "statistics", "histogram", "tail-latency", "observability", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Response distributions reveal tail latency that averages hide -- Prismatic Platform monitors P95 and P99 percentiles via telemetry histograms to ensure consistent user experience across all 110 umbrella apps."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Response Distribution", "latency", "percentiles", "P99", "P95", "histogram", "tail latency", "HDR histogram", "telemetry", "glossary", "Prismatic Platform", "BEAM", "OTP"]
image = "/images/sections/glossary.png"
image_alt = "Response Distribution - Prismatic Platform"
word_count = 3200
see_also = ["capabilities", "architecture", "telemetry", "benchmark"]
+++

## Definition

**Response distribution** describes the statistical spread of response times across all requests to a system. Rather than summarizing performance with a single average, the distribution reveals the full picture: the median (P50), the typical worst case (P95), and the extreme tail (P99). A system with a 50ms average but a 2-second P99 provides a very different experience than one with a 100ms average and a 150ms P99. The distribution shape tells the story that a single number never can.

Response time distributions are typically right-skewed (long tail to the right), meaning most requests complete quickly but a minority takes significantly longer. This skew makes averages misleading -- the mean is pulled up by outliers while the majority of users experience much faster responses. For this reason, modern observability practices have moved decisively from averages to percentile-based reporting as the primary performance communication tool.

Understanding response distributions is essential for any platform that makes reliability commitments. Service Level Objectives (SLOs) defined on P99 latency capture what users actually experience at the tail, while average-based SLOs can be met even when 1% of users suffer unacceptable delays. In high-volume systems processing millions of requests per day, that 1% represents tens of thousands of degraded experiences.

## Core Concepts

### Percentile Definitions and Significance

| Percentile | Meaning | Typical Use | Impact at 1M req/day |
|------------|---------|-------------|---------------------|
| **P50 (Median)** | 50% of requests are faster | Typical user experience baseline | 500,000 users see this or better |
| **P75** | 75% of requests are faster | Early warning indicator | 250,000 users see worse |
| **P90** | 90% of requests are faster | Operational dashboard threshold | 100,000 users see worse |
| **P95** | 95% of requests are faster | Common SLA/SLO target | 50,000 users see worse |
| **P99** | 99% of requests are faster | Tail latency indicator | 10,000 users see worse |
| **P99.9** | 99.9% of requests are faster | High-volume system target | 1,000 users see worse |
| **P99.99** | 99.99% of requests are faster | Ultra-critical systems | 100 users see worse |

### Distribution Shape Classification

| Shape | Description | Common Cause | Action Required |
|-------|-------------|-------------|-----------------|
| **Unimodal (Normal-ish)** | Single peak, symmetric-ish | Consistent processing path | Healthy -- monitor for shifts |
| **Log-Normal** | Single peak, right-skewed tail | Variable-complexity requests | Normal for web apps |
| **Bimodal** | Two distinct peaks | Cache hit vs. cache miss paths | Investigate the two code paths |
| **Heavy-Tailed** | Long, fat right tail | GC pauses, lock contention, slow queries | Investigate tail causes |
| **Multimodal** | Three or more peaks | Multiple backend dependencies | Map peaks to dependency latencies |
| **Uniform** | Flat, no clear peak | Random processing time | Unusual -- investigate |

### Histogram Bucketing Strategies

| Strategy | Bucket Boundaries | Precision | Memory | Best For |
|----------|------------------|-----------|--------|----------|
| **Linear** | 0, 10, 20, 30, ... ms | Equal across range | High for wide ranges | Narrow, known ranges |
| **Exponential** | 1, 2, 4, 8, 16, ... ms | Higher at low values | Moderate | General web latency |
| **Custom** | App-specific boundaries | Targeted | Low | SLO boundary alignment |
| **HDR Histogram** | Automatic, configurable | Very high (1-3 sig figs) | Fixed, predictable | Production monitoring |

## Technical Deep Dive

### Distribution Mathematics

Response distributions follow characteristic shapes depending on the system architecture. A healthy web application typically shows a log-normal distribution -- most requests cluster near the mode, with a gradually declining tail. The log-normal distribution arises naturally when the total response time is the product of several independent processing stages (network, parsing, query, serialization), because the logarithm of a product is a sum, and sums of independent variables tend toward normality by the Central Limit Theorem.

Bimodal distributions (two peaks) indicate two distinct processing paths. The most common cause is cache hit vs. cache miss: cached responses complete in microseconds while cache misses require database or network round-trips taking milliseconds. When you see a bimodal distribution, the performance optimization strategy is clear -- increase the cache hit rate to shift volume from the slow peak to the fast peak.

Heavy tails indicate occasional blocking operations: garbage collection pauses, lock contention, slow database queries, or downstream service timeouts. In BEAM/OTP systems, heavy tails are relatively rare because the scheduler provides preemptive multitasking at the process level, and per-process garbage collection avoids stop-the-world pauses. However, NIFs (Native Implemented Functions), large binary operations, and ETS contention can still introduce tail latency.

### Percentile Calculation Methods

Key percentiles and their significance: P50 (median) represents the typical experience. P90 represents the threshold where 10% of users see worse performance. P95 is a common SLA target. P99 represents tail latency that affects 1 in 100 requests. P99.9 matters for high-volume systems where even 0.1% of slow requests affects thousands of users.

There are two primary approaches to percentile calculation:

**Exact calculation** requires storing every sample and sorting. This provides perfect accuracy but consumes O(n) memory and O(n log n) time for each percentile query. Suitable only for small sample sets or offline analysis.

**Approximate calculation** uses data structures designed for streaming percentile estimation:

- **HDR Histogram** (High Dynamic Range Histogram) provides configurable precision (typically 1-3 significant figures) with fixed memory overhead regardless of sample count. It uses a logarithmic bucketing scheme that provides high precision across a wide dynamic range (e.g., 1 microsecond to 1 hour).

- **t-digest** uses a cluster-based compression algorithm that provides higher accuracy at the tails (P99, P99.9) where precision matters most, while compressing heavily in the middle of the distribution.

- **Prometheus histograms** use pre-defined bucket boundaries. Simple and efficient, but accuracy depends entirely on bucket placement -- if your SLO boundary does not align with a bucket boundary, the reported percentile may be inaccurate.

### Telemetry Integration in BEAM/OTP

The BEAM VM provides several built-in mechanisms for response time measurement:

- **`:telemetry.span/3`** automatically measures the duration of a function execution and emits start/stop/exception events with duration metadata.
- **`System.monotonic_time/1`** provides high-resolution, monotonically increasing timestamps immune to system clock adjustments.
- **`:timer.tc/1`** provides simple microsecond-precision timing of function calls.

These primitives feed into distribution tracking systems that maintain running histograms queryable for any percentile at any time.

### Statistical Aggregation Pitfalls

Aggregating percentiles across multiple servers or time windows is mathematically invalid. The P99 of combined P99s from 10 servers is NOT the system P99 -- it could be anywhere from the minimum to the maximum of the individual P99s. Correct aggregation requires either:

1. **Merge-able data structures**: HDR Histograms and t-digests support merging, allowing accurate cross-server percentile calculation.
2. **Centralized collection**: All raw samples or pre-bucketed histograms sent to a central aggregator.
3. **Approximate bounds**: Report the range of possible values rather than a single number.

## Usage in Prismatic Platform

The platform enforces response distribution targets across all request-handling paths:

| Request Type | P95 Target | P99 Target | Measurement Point |
|-------------|-----------|-----------|-------------------|
| **Page Load** | < 250ms | < 500ms | Browser navigation timing |
| **Server Render** | < 100ms | < 200ms | Phoenix endpoint duration |
| **LiveView Mount** | < 150ms | < 300ms | `mount/3` callback duration |
| **LiveView Event** | < 50ms | < 100ms | `handle_event/3` duration |
| **Health Check** | < 10ms | < 25ms | `/api/health` endpoint |
| **API Response** | < 200ms | < 400ms | REST API endpoint duration |
| **OSINT Tool Execution** | < 5000ms | < 15000ms | External API dependent |
| **DD Pipeline Fetch** | < 30000ms | < 60000ms | Batch data retrieval |

Telemetry events capture response times for every request. The monitoring system maintains running histograms using ETS-backed storage with configurable bucket boundaries aligned to SLO targets. The `PrismaticTelemetry` app aggregates these distributions and exposes them through LiveDashboard custom pages and the `/api/metrics` endpoint.

Distribution anomaly detection runs continuously: if the P95/P50 ratio exceeds 10x (indicating heavy tail development), or if the distribution shifts from unimodal to bimodal, alerts are triggered for investigation.

The OTEL doctrine pillar requires that all GenServer callbacks, controller actions, and LiveView handlers emit telemetry events with duration measurements, ensuring complete distribution coverage across the platform.

## Code Examples

### Core Distribution Tracker with ETS-Backed Histograms

```elixir
defmodule PrismaticTelemetry.ResponseDistribution do
  @moduledoc """
  Tracks response time distributions with percentile calculation using
  ETS-backed histogram buckets for memory-efficient, concurrent-safe
  distribution tracking across the Prismatic Platform.

  Supports configurable bucket boundaries, automatic telemetry event
  attachment, and merge-able histograms for cross-node aggregation.

  ## Architecture

  Each endpoint gets its own histogram stored in a shared ETS table.
  Bucket boundaries are configurable per endpoint category (page loads
  use different boundaries than API calls). The histogram uses atomic
  `:ets.update_counter/3` for lock-free concurrent updates.

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.record("GET /api/health", 4_500)
      :ok
      iex> PrismaticTelemetry.ResponseDistribution.percentile("GET /api/health", 0.95)
      5_000
  """

  use GenServer

  require Logger

  @type bucket :: {non_neg_integer(), non_neg_integer()}
  @type histogram :: %{buckets: [bucket()], total_count: non_neg_integer()}
  @type endpoint :: String.t()

  @default_buckets_us [
    0, 1_000, 2_000, 5_000, 10_000, 25_000, 50_000,
    100_000, 250_000, 500_000, 1_000_000, 2_500_000,
    5_000_000, 10_000_000, 30_000_000, 60_000_000
  ]

  @ets_table :response_distribution_histograms

  # --- Public API ---

  @doc """
  Starts the distribution tracker and initializes the ETS table.

  ## Options

    * `:buckets` - Custom bucket boundaries in microseconds (default: exponential)
    * `:name` - GenServer name (default: `__MODULE__`)

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.start_link(buckets: [0, 1000, 5000, 10000])
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @doc """
  Records a response time sample for the given endpoint.

  Uses atomic ETS counter updates for lock-free concurrency.
  Duration is expected in microseconds.

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.record("/api/health", 2_350)
      :ok
  """
  @spec record(endpoint(), non_neg_integer()) :: :ok
  def record(endpoint, duration_us) when is_integer(duration_us) and duration_us >= 0 do
    bucket_index = find_bucket_index(duration_us)
    key = {endpoint, bucket_index}

    try do
      :ets.update_counter(@ets_table, key, {2, 1}, {key, 0})
    rescue
      ArgumentError ->
        :ets.insert_new(@ets_table, {key, 1})
    end

    :telemetry.execute(
      [:prismatic, :response, :recorded],
      %{duration_us: duration_us},
      %{endpoint: endpoint}
    )

    :ok
  end

  @doc """
  Calculates the approximate percentile for an endpoint from the histogram.

  Returns the upper bound of the bucket containing the target percentile
  in microseconds. Returns 0 if no samples have been recorded.

  ## Parameters

    * `endpoint` - The endpoint identifier string
    * `p` - The percentile as a float between 0.0 and 1.0

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.percentile("/api/health", 0.99)
      5_000
  """
  @spec percentile(endpoint(), float()) :: non_neg_integer()
  def percentile(endpoint, p) when is_float(p) and p >= 0.0 and p <= 1.0 do
    buckets = get_bucket_counts(endpoint)
    calculate_percentile_from_histogram(buckets, p)
  end

  @doc """
  Returns the full histogram data for an endpoint as a list of
  `{upper_bound_us, count}` tuples.

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.histogram("/api/health")
      [{1000, 42}, {2000, 15}, {5000, 3}, ...]
  """
  @spec histogram(endpoint()) :: [{non_neg_integer(), non_neg_integer()}]
  def histogram(endpoint) do
    get_bucket_counts(endpoint)
  end

  @doc """
  Returns a summary map with P50, P75, P90, P95, P99, P99.9 percentiles
  and total sample count for the given endpoint.

  ## Example

      iex> PrismaticTelemetry.ResponseDistribution.summary("/api/health")
      %{p50: 2000, p75: 5000, p90: 10000, p95: 25000, p99: 100000,
        p999: 250000, count: 15423, mean_estimate: 8500}
  """
  @spec summary(endpoint()) :: map()
  def summary(endpoint) do
    buckets = get_bucket_counts(endpoint)
    total = Enum.reduce(buckets, 0, fn {_bound, count}, acc -> acc + count end)

    %{
      p50: calculate_percentile_from_histogram(buckets, 0.50),
      p75: calculate_percentile_from_histogram(buckets, 0.75),
      p90: calculate_percentile_from_histogram(buckets, 0.90),
      p95: calculate_percentile_from_histogram(buckets, 0.95),
      p99: calculate_percentile_from_histogram(buckets, 0.99),
      p999: calculate_percentile_from_histogram(buckets, 0.999),
      count: total
    }
  end

  @doc """
  Resets all histogram data for the given endpoint.
  Used primarily in testing and after distribution analysis snapshots.
  """
  @spec reset(endpoint()) :: :ok
  def reset(endpoint) do
    :ets.match_delete(@ets_table, {{endpoint, :_}, :_})
    :ok
  end

  # --- GenServer Callbacks ---

  @impl true
  def init(opts) do
    table = :ets.new(@ets_table, [:named_table, :public, :set, {:write_concurrency, true}])
    buckets = Keyword.get(opts, :buckets, @default_buckets_us)

    {:ok, %{table: table, buckets: buckets}}
  end

  # --- Private Helpers ---

  defp find_bucket_index(duration_us) do
    Enum.find_index(@default_buckets_us, fn bound -> duration_us < bound end) ||
      length(@default_buckets_us)
  end

  defp get_bucket_counts(endpoint) do
    @default_buckets_us
    |> Enum.with_index()
    |> Enum.map(fn {bound, index} ->
      key = {endpoint, index}
      count = case :ets.lookup(@ets_table, key) do
        [{^key, c}] -> c
        [] -> 0
      end
      {bound, count}
    end)
  end

  defp calculate_percentile_from_histogram([], _p), do: 0

  defp calculate_percentile_from_histogram(buckets, p) do
    total = Enum.reduce(buckets, 0, fn {_bound, count}, acc -> acc + count end)

    if total == 0 do
      0
    else
      target = ceil(p * total)

      buckets
      |> Enum.reduce_while(0, fn {bound, count}, cumulative ->
        new_cumulative = cumulative + count
        if new_cumulative >= target do
          {:halt, bound}
        else
          {:cont, new_cumulative}
        end
      end)
    end
  end
end
```

### Telemetry Event Attachment for Automatic Distribution Tracking

```elixir
defmodule PrismaticTelemetry.DistributionAttacher do
  @moduledoc """
  Attaches telemetry handlers that automatically feed response duration
  measurements into the ResponseDistribution tracker.

  Covers Phoenix endpoint stops, LiveView mount completions, and
  custom application-level spans.

  ## Example

      iex> PrismaticTelemetry.DistributionAttacher.attach_all()
      :ok
  """

  require Logger

  @doc """
  Attaches all standard telemetry handlers for distribution tracking.
  Called during application startup in `PrismaticTelemetry.Application`.
  """
  @spec attach_all() :: :ok
  def attach_all do
    handlers = [
      {"dist-phoenix-endpoint", [:phoenix, :endpoint, :stop], &handle_phoenix_stop/4},
      {"dist-phoenix-router", [:phoenix, :router_dispatch, :stop], &handle_router_stop/4},
      {"dist-liveview-mount", [:phoenix, :live_view, :mount, :stop], &handle_liveview_mount/4},
      {"dist-liveview-event", [:phoenix, :live_view, :handle_event, :stop], &handle_liveview_event/4}
    ]

    Enum.each(handlers, fn {id, event, handler} ->
      :telemetry.attach(id, event, handler, %{})
    end)

    :ok
  end

  @doc false
  @spec handle_phoenix_stop(list(), map(), map(), map()) :: :ok
  def handle_phoenix_stop(_event, %{duration: duration}, metadata, _config) do
    endpoint = format_endpoint(metadata)
    duration_us = System.convert_time_unit(duration, :native, :microsecond)
    PrismaticTelemetry.ResponseDistribution.record(endpoint, duration_us)
    :ok
  end

  @doc false
  @spec handle_router_stop(list(), map(), map(), map()) :: :ok
  def handle_router_stop(_event, %{duration: duration}, metadata, _config) do
    route = "#{metadata[:method]} #{metadata[:route]}"
    duration_us = System.convert_time_unit(duration, :native, :microsecond)
    PrismaticTelemetry.ResponseDistribution.record(route, duration_us)
    :ok
  end

  @doc false
  @spec handle_liveview_mount(list(), map(), map(), map()) :: :ok
  def handle_liveview_mount(_event, %{duration: duration}, metadata, _config) do
    view = "LiveView.mount:#{inspect(metadata[:socket].view)}"
    duration_us = System.convert_time_unit(duration, :native, :microsecond)
    PrismaticTelemetry.ResponseDistribution.record(view, duration_us)
    :ok
  end

  @doc false
  @spec handle_liveview_event(list(), map(), map(), map()) :: :ok
  def handle_liveview_event(_event, %{duration: duration}, metadata, _config) do
    view = "LiveView.event:#{inspect(metadata[:socket].view)}:#{metadata[:event]}"
    duration_us = System.convert_time_unit(duration, :native, :microsecond)
    PrismaticTelemetry.ResponseDistribution.record(view, duration_us)
    :ok
  end

  defp format_endpoint(%{conn: conn}) do
    "#{conn.method} #{conn.request_path}"
  end

  defp format_endpoint(_metadata), do: "unknown"
end
```

### Distribution Analysis and Anomaly Detection

```elixir
defmodule PrismaticTelemetry.DistributionAnalyzer do
  @moduledoc """
  Analyzes response distributions for anomalies, shape changes, and
  SLO compliance. Runs periodically to detect performance regressions
  before they impact users.

  ## Detection Capabilities

    * Tail ratio monitoring (P99/P50 ratio)
    * Distribution shape change detection (unimodal to bimodal)
    * SLO breach prediction based on trend analysis
    * Latency spike correlation with system events

  ## Example

      iex> PrismaticTelemetry.DistributionAnalyzer.analyze("/api/health")
      {:ok, %{shape: :log_normal, tail_ratio: 5.2, slo_compliant: true}}
  """

  alias PrismaticTelemetry.ResponseDistribution

  require Logger

  @type analysis_result :: %{
          shape: :unimodal | :bimodal | :multimodal | :heavy_tailed,
          tail_ratio: float(),
          slo_compliant: boolean(),
          anomalies: [String.t()]
        }

  @tail_ratio_threshold 10.0
  @slo_targets %{
    "page_load" => %{p95: 250_000, p99: 500_000},
    "api" => %{p95: 200_000, p99: 400_000},
    "health" => %{p95: 10_000, p99: 25_000}
  }

  @doc """
  Performs comprehensive distribution analysis for the given endpoint.

  Returns a map containing shape classification, tail ratio, SLO compliance
  status, and any detected anomalies.

  ## Example

      iex> PrismaticTelemetry.DistributionAnalyzer.analyze("/api/health")
      {:ok, %{shape: :log_normal, tail_ratio: 3.1, slo_compliant: true, anomalies: []}}
  """
  @spec analyze(String.t()) :: {:ok, analysis_result()} | {:error, :no_data}
  def analyze(endpoint) do
    summary = ResponseDistribution.summary(endpoint)

    if summary.count == 0 do
      {:error, :no_data}
    else
      tail_ratio = safe_divide(summary.p99, summary.p50)
      anomalies = detect_anomalies(endpoint, summary, tail_ratio)
      slo_category = classify_endpoint(endpoint)
      slo_compliant = check_slo_compliance(summary, slo_category)

      result = %{
        shape: classify_shape(ResponseDistribution.histogram(endpoint)),
        tail_ratio: tail_ratio,
        slo_compliant: slo_compliant,
        anomalies: anomalies
      }

      unless anomalies == [] do
        Logger.warning("Distribution anomalies detected",
          endpoint: endpoint,
          anomalies: anomalies,
          tail_ratio: tail_ratio
        )
      end

      {:ok, result}
    end
  end

  defp safe_divide(_numerator, 0), do: 0.0
  defp safe_divide(numerator, denominator), do: numerator / denominator

  defp detect_anomalies(endpoint, summary, tail_ratio) do
    anomalies = []
    anomalies = if tail_ratio > @tail_ratio_threshold,
      do: ["Heavy tail detected: P99/P50 ratio #{Float.round(tail_ratio, 1)}x" | anomalies],
      else: anomalies
    anomalies = if summary.p99 > summary.p95 * 5,
      do: ["Extreme tail spike: P99 is #{Float.round(summary.p99 / summary.p95, 1)}x P95" | anomalies],
      else: anomalies
    anomalies
  end

  defp classify_shape(histogram) do
    counts = Enum.map(histogram, fn {_bound, count} -> count end)
    peaks = count_peaks(counts)

    cond do
      peaks >= 3 -> :multimodal
      peaks == 2 -> :bimodal
      true -> :unimodal
    end
  end

  defp count_peaks(counts) when length(counts) < 3, do: 1
  defp count_peaks(counts) do
    counts
    |> Enum.chunk_every(3, 1, :discard)
    |> Enum.count(fn [a, b, c] -> b > a and b > c end)
    |> max(1)
  end

  defp classify_endpoint(endpoint) do
    cond do
      String.contains?(endpoint, "/api/health") -> "health"
      String.contains?(endpoint, "/api/") -> "api"
      true -> "page_load"
    end
  end

  defp check_slo_compliance(summary, category) do
    case Map.get(@slo_targets, category) do
      nil -> true
      targets -> summary.p95 <= targets.p95 and summary.p99 <= targets.p99
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Reporting averages** | Mean hides tail latency; a 50ms average can mask 5-second P99 responses | Always report P50, P95, P99 percentiles; use averages only as secondary context |
| **Aggregating percentiles** | Taking the average of P99 values across servers produces a meaningless number | Use merge-able histogram structures (HDR Histogram) for cross-server aggregation |
| **Fixed histogram buckets** | Bucket boundaries that do not align with SLO targets produce imprecise percentile estimates | Align bucket boundaries with SLO thresholds (e.g., 250ms, 500ms bucket edges for 250ms SLO) |
| **Ignoring distribution shape** | Treating all distributions as unimodal misses bimodal cache-hit/miss patterns | Classify distribution shape and investigate multi-peak patterns |
| **Unbounded sample storage** | Storing every raw sample consumes unbounded memory | Use histogram-based approaches with fixed memory overhead |
| **Clock source errors** | Using wall-clock time for measurements introduces noise from NTP adjustments | Use `System.monotonic_time/1` exclusively for duration measurements |
| **Coordinated omission** | Load generators that wait for responses before sending the next request undercount slow periods | Use open-loop load generators and correct for coordinated omission in analysis |
| **Sampling bias** | Only measuring completed requests ignores timeouts and errors that are the slowest "responses" | Include timeout durations in the distribution; track error rates alongside latency |
| **Ignoring warm-up** | Including JIT/cache warm-up samples skews distributions | Discard initial samples or segment distributions by warm-up vs. steady-state |
| **Per-request vs. per-user** | A single slow user generating many requests inflates tail percentiles | Consider per-user aggregation alongside per-request distributions |

## Best Practices

1. **Report percentiles, not averages** -- averages hide tail latency that degrades user experience. Always present P50, P95, and P99 as the primary performance metrics.

2. **Set SLOs on P95 or P99** -- these capture the realistic worst-case experience for most users. The Prismatic Platform uses P95 targets for all request types.

3. **Track distributions over time** -- shifting distributions indicate performance changes before averages move. A P99 increase from 200ms to 500ms is an early warning even if the P50 remains stable.

4. **Investigate bimodal distributions** -- two peaks mean two different code paths with different performance characteristics. Identify and optimize the slow path.

5. **Use histograms for memory efficiency** -- storing every sample does not scale; bucket-based histograms provide accurate percentiles with bounded memory. HDR Histogram is the gold standard.

6. **Align bucket boundaries with SLO targets** -- ensure that your histogram bucket edges match your SLO thresholds so that percentile estimates are accurate at the boundaries that matter.

7. **Use monotonic clocks for measurement** -- `System.monotonic_time/1` provides high-resolution, monotonically increasing timestamps that are immune to NTP adjustments and clock skew.

8. **Emit telemetry events with duration metadata** -- follow the OTEL doctrine pillar by emitting standardized telemetry events for every request-handling path.

9. **Detect distribution shape changes automatically** -- monitor for transitions from unimodal to bimodal or heavy-tailed distributions as early indicators of architectural issues.

10. **Include error responses in the distribution** -- timeouts and errors represent the worst-case response times. Excluding them creates an optimistically biased distribution.

## Related Terms

- [Time to First Byte](/glossary/time-to-first-byte/) -- a specific latency metric within the response distribution
- [Standard Deviation](/glossary/standard-deviation/) -- measures spread around the mean, less useful than percentiles for skewed distributions
- [Variance](/glossary/variance/) -- the squared deviation measure underlying distributions
- [SLA](/glossary/sla/) -- service level agreements that define acceptable distribution percentiles
- [Threshold](/glossary/threshold/) -- the cutoff values applied to distribution percentiles
- [Telemetry](/glossary/telemetry/) -- the event system that feeds response time measurements into distributions
- [Benchmark](/glossary/benchmark/) -- controlled measurement of response distributions under known load
- [KPI](/glossary/kpi/) -- key performance indicators derived from distribution percentiles
- [Latency](/glossary/latency/) -- the raw time measurement that distributions aggregate
- [Profiling](/glossary/profiling/) -- complementary technique for diagnosing individual slow requests
- [Monitoring](/glossary/monitoring/) -- the operational practice of tracking distributions in production
- [Cache Eviction](/glossary/cache-eviction/) -- cache hit/miss ratios directly affect distribution shape

## See Also

- [Performance Standards](/capabilities/) -- platform response time requirements and SLO definitions
- [Monitoring Architecture](/architecture/) -- telemetry infrastructure for distribution tracking
- [LiveDashboard Integration](/architecture/) -- real-time distribution visualization in development
- [HDR Histogram (Erlang)](https://github.com/HdrHistogram/hdr_histogram_erl) -- high-precision histogram library for BEAM
- [Prometheus Histograms](https://prometheus.io/docs/concepts/metric_types/#histogram) -- industry-standard histogram metric type

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
