+++
title = "Mean"
weight = 50
[extra]
description = "The arithmetic mean is the sum of all values divided by the count of values, providing a measure of central tendency that is sensitive to outliers and commonly used for normally distributed metrics but misleading for skewed distributions like latency"
category = "data"
subcategory = "statistics"
difficulty = "beginner"
technology_type = "statistical_measure"
platform_component = "metrics_analysis"
paradigm = "descriptive_statistics"
prerequisite_concepts = ["numbers", "summation", "distribution", "central_tendency"]
use_cases = ["throughput_monitoring", "batch_statistics", "quality_scoring", "benchmark_comparison", "trend_analysis"]
benefits = ["simple_computation", "mathematically_tractable", "additive_decomposition", "well_understood"]
implementation_patterns = ["online_algorithm", "weighted_average", "exponential_smoothing", "compensated_summation"]
quality_metrics = ["numerical_stability", "outlier_sensitivity", "convergence_rate"]
integration_points = ["telemetry", "quality_dna", "benchee", "prometheus", "grafana"]
related_disciplines = ["statistics", "data_science", "signal_processing", "quality_engineering"]
related_terms = ["median", "percentile", "p95", "p99", "outlier", "moving-average", "kpi", "standard-deviation", "variance", "histogram", "distribution", "telemetry", "benchee", "monitoring"]
tags = ["glossary", "mean", "average", "statistics", "central-tendency", "metrics", "data-analysis"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
quality_score = 92
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "While mean provides a useful central tendency measure for normally distributed data, the Prismatic Platform prefers percentiles for latency monitoring because means hide tail behavior"
date_created = "2026-02-24"
date_modified = "2026-04-08"
keywords = ["mean", "arithmetic mean", "average", "central tendency", "statistical average", "descriptive statistics", "mean calculation", "Welford algorithm", "EWMA", "Kahan summation", "geometric mean", "harmonic mean"]
image = "/images/sections/glossary.png"
image_alt = "Mean - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "architecture", "performance-testing"]
+++

## Definition

The arithmetic mean (commonly called "average") is the sum of all observed values divided by the number of observations: mean = (sum of xi) / n. As a measure of central tendency, the mean represents the "center of mass" of a [distribution](/glossary/distribution/) -- the value around which data points are balanced. For symmetric, normally distributed data (CPU utilization, throughput rates), the mean accurately summarizes the typical value. For skewed distributions (response latency, file sizes, income), the mean can be misleading because extreme values pull it away from where most observations cluster.

This sensitivity to outliers is the mean's defining characteristic. A single 10-second timeout in 1000 requests with otherwise 50ms latency changes the mean from 50ms to 60ms -- a 20% increase from a single data point affecting 0.1% of users. This is why the software industry has shifted to percentile-based [monitoring](/glossary/monitoring/): the [median](/glossary/median/) (P50) and P95/P99 are resistant to outlier distortion and better represent user experience.

## Overview

The mean is the most widely used and most misused statistical measure in software engineering. Its mathematical simplicity -- anyone can compute an average -- masks subtle properties that lead to incorrect conclusions when applied to the wrong type of data. Understanding when the mean is appropriate and when it misleads is fundamental to building reliable [telemetry](/glossary/telemetry/) and monitoring systems.

### Types of Means

There are three classical Pythagorean means, each appropriate for different kinds of data:

| Mean Type | Formula | Use Case | Example |
|-----------|---------|----------|---------|
| **Arithmetic** | sum(x) / n | Additive quantities | Throughput, counts, scores |
| **Geometric** | (product(x))^(1/n) | Multiplicative quantities, ratios | Growth rates, benchmark ratios |
| **Harmonic** | n / sum(1/x) | Rates with fixed denominator | Averaging speeds, F1 score |

Using the wrong type of mean produces systematically biased results. For example, if a car travels 60 km at 30 km/h and 60 km at 60 km/h, the arithmetic mean speed is 45 km/h, but the actual average speed is the harmonic mean: 40 km/h (120 km in 3 hours).

### The Outlier Problem in Detail

Consider monitoring response times for an [API](/glossary/api/) endpoint:

```
Normal requests (999):  48ms, 52ms, 49ms, 51ms, 50ms, ...  (mean ≈ 50ms)
One timeout (1):        10,000ms

Arithmetic mean:  50ms * 999/1000 + 10000ms * 1/1000 = 59.95ms
Median (P50):     50ms  (unchanged)
P99:              50ms  (unchanged, need >10 outliers to shift)
P99.9:            10,000ms (captures the outlier)
```

The mean increased 20% from a single outlier, yet 99.9% of users experienced no change. This is why the Prismatic Platform's performance standards (PERF doctrine) define limits in terms of P95 and P99, not averages.

### When the Mean Is Appropriate

The mean excels when:
- Data is normally distributed (symmetric, bell-shaped)
- Outliers are rare and represent genuine signal (not noise)
- You need mathematical decomposability (means of subgroups combine)
- You're computing aggregate throughput (total work / total time)
- You need a quantity that's differentiable (for optimization)

The mean is inappropriate when:
- Data is skewed (latency, file sizes, income distributions)
- Outliers are common or extreme
- You need to represent "typical" user experience
- You're comparing distributions with different shapes
- Small samples make outlier sensitivity dangerous

## Technical Deep Dive

### Numerical Stability

Computing the mean seems trivial, but production implementations face several challenges. Naive summation of floating-point values accumulates rounding errors that grow with dataset size. Consider summing a million values near 1.0: the sum grows to ~1,000,000, and subsequent additions of ~1.0 lose precision because the floating-point representation cannot distinguish 1,000,000.0 from 1,000,001.0 at float64 precision.

**Kahan compensated summation** tracks the rounding error from each addition and compensates on the next step, maintaining full precision regardless of dataset size:

```
Naive sum error:  O(n * epsilon)    -- grows linearly with n
Kahan sum error:  O(epsilon)        -- constant regardless of n
```

### Streaming Computation (Welford's Algorithm)

For unbounded data streams (production metrics, log analysis), storing all values to compute the mean is impractical. Welford's online algorithm (1962) maintains a running mean with O(1) memory and O(1) per-update cost:

```
Initialize: count = 0, mean = 0

For each new value x:
  count += 1
  delta = x - mean
  mean += delta / count
```

This algorithm is numerically stable -- unlike the naive approach of tracking a running sum and dividing by count, which loses precision as the sum grows large. Welford's algorithm also naturally extends to compute running variance and standard deviation.

### Exponentially Weighted Moving Average (EWMA)

EWMA gives recent observations exponentially higher weight than older ones, making it ideal for tracking trends in [time-series](/glossary/time-series/) metrics. The smoothing factor alpha (0 < alpha <= 1) controls responsiveness:

```
EWMA_t = alpha * x_t + (1 - alpha) * EWMA_{t-1}
```

| Alpha | Behavior | Half-life | Use Case |
|-------|----------|-----------|----------|
| 0.01 | Very smooth, slow response | ~69 samples | Long-term trend detection |
| 0.1 | Moderate smoothing | ~7 samples | Dashboard metrics |
| 0.3 | Responsive, some smoothing | ~2 samples | Anomaly detection |
| 0.5 | Highly responsive | ~1 sample | Real-time alerting |

The BEAM's `:counters` module provides atomic increment operations suitable for maintaining running sums across concurrent [processes](/glossary/process/) without locks, making it ideal for high-throughput mean computation in [GenServer](/glossary/genserver/)-based metric collectors.

### Trimmed and Winsorized Means

When you want the simplicity of a mean but need outlier resistance, two variants help:

- **Trimmed mean**: Remove the top and bottom k% of values, then compute the arithmetic mean. A 5% trimmed mean discards the most extreme 10% of data.
- **Winsorized mean**: Replace the top and bottom k% of values with the nearest non-extreme value, then compute the mean. Preserves sample size for variance estimation.

Both approaches are used in benchmark analysis where occasional system hiccups (GC pauses, context switches) produce outlier measurements that shouldn't be discarded entirely but shouldn't dominate the summary statistic.

## Usage in Prismatic Platform

### Throughput Monitoring

The Prismatic Platform uses arithmetic mean selectively: for throughput metrics (requests per second, events processed per minute) and batch operation statistics (average entity count per DD [pipeline](/glossary/pipeline/) run). Throughput is inherently additive -- total work divided by total time -- making the arithmetic mean appropriate.

```elixir
# Telemetry handler for throughput mean computation
:telemetry.attach(
  "api-throughput-mean",
  [:prismatic_api, :request, :stop],
  fn _event, measurements, _metadata, state ->
    {new_count, new_mean} = PrismaticSafety.Statistics.streaming_mean(
      measurements.duration,
      state.count,
      state.mean
    )
    %{state | count: new_count, mean: new_mean}
  end,
  %{count: 0, mean: 0.0}
)
```

### Quality DNA Scoring

Quality DNA tracks mean quality scores across domains as a summary statistic, but the Quality Floor Guardian evaluates each domain individually rather than relying on the mean. This prevents a scenario where one domain at 100% compensates for another at 80% -- the mean would show 90% (passing), but the individual floor would correctly flag the 80% domain.

This illustrates a general principle: **means hide variation**. A system where all components perform at 90% is fundamentally different from one where half perform at 100% and half at 80%, even though both have the same mean. The Prismatic Platform reports both mean and min/max/percentiles for all quality metrics.

### Latency Monitoring (Where Mean Fails)

For latency monitoring, the platform explicitly avoids mean in favor of [percentiles](/glossary/percentile/) -- the Page Load [Performance](/glossary/performance-testing/) Standard defines limits in terms of P95, not average response time:

```elixir
# PERF doctrine: limits defined as percentiles, not means
%{
  page_load_p95: 250,      # ms
  server_render_p95: 100,  # ms
  liveview_mount_p95: 150, # ms
  health_check_p95: 10     # ms
}
# NOT: %{page_load_mean: 200}  -- hides tail latency
```

### Benchee Integration

The [Benchee](/glossary/benchee/) benchmarking library reports mean alongside other statistics, but the platform's benchmark analysis prioritizes median and P99:

```elixir
Benchee.run(%{
  "json_encode" => fn -> Jason.encode!(large_map) end,
  "json_decode" => fn -> Jason.decode!(json_string) end
}, formatters: [
  {Benchee.Formatters.Console, extended_statistics: true}
  # Reports: mean, median, std_dev, P99, min, max
])
```

## Code Examples

### Core Statistical Functions

```elixir
defmodule PrismaticSafety.Statistics do
  @moduledoc """
  Statistical functions for platform metrics analysis.

  Provides numerically stable implementations of common
  statistical measures used across telemetry, quality DNA,
  and performance monitoring subsystems.
  """

  @spec mean(list(number())) :: float() | nil
  def mean([]), do: nil
  def mean(values) when is_list(values) do
    count = length(values)
    kahan_sum(values) / count
  end

  @doc """
  Welford's online algorithm for streaming mean computation.

  Maintains a running mean with O(1) memory and numerically
  stable updates. Returns {new_count, new_mean}.

  ## Examples

      iex> PrismaticSafety.Statistics.streaming_mean(10.0, 0, 0.0)
      {1, 10.0}

      iex> PrismaticSafety.Statistics.streaming_mean(20.0, 1, 10.0)
      {2, 15.0}
  """
  @spec streaming_mean(number(), non_neg_integer(), float()) :: {non_neg_integer(), float()}
  def streaming_mean(new_value, count, current_mean) do
    new_count = count + 1
    delta = new_value - current_mean
    new_mean = current_mean + delta / new_count
    {new_count, new_mean}
  end

  @doc """
  Welford's online algorithm with variance tracking.

  Returns {count, mean, m2} where variance = m2 / count
  and sample_variance = m2 / (count - 1).
  """
  @spec streaming_mean_variance(number(), non_neg_integer(), float(), float()) ::
          {non_neg_integer(), float(), float()}
  def streaming_mean_variance(new_value, count, current_mean, m2) do
    new_count = count + 1
    delta = new_value - current_mean
    new_mean = current_mean + delta / new_count
    delta2 = new_value - new_mean
    new_m2 = m2 + delta * delta2
    {new_count, new_mean, new_m2}
  end

  @doc """
  Exponentially weighted moving average.

  Alpha controls responsiveness: higher alpha = more responsive
  to recent values, lower alpha = smoother trend line.

  ## Examples

      iex> PrismaticSafety.Statistics.ewma(100.0, 50.0, 0.1)
      55.0

      iex> PrismaticSafety.Statistics.ewma(100.0, 50.0, 0.5)
      75.0
  """
  @spec ewma(number(), float(), float()) :: float()
  def ewma(new_value, previous_ewma, alpha \\ 0.1) when alpha > 0 and alpha <= 1 do
    alpha * new_value + (1 - alpha) * previous_ewma
  end

  @doc """
  Kahan compensated summation for numerical stability.

  Maintains a compensation term to correct for floating-point
  rounding errors during accumulation. Error is O(epsilon)
  regardless of dataset size, vs O(n * epsilon) for naive sum.
  """
  @spec kahan_sum(list(float())) :: float()
  def kahan_sum(values) when is_list(values) do
    {sum, _compensation} =
      Enum.reduce(values, {0.0, 0.0}, fn value, {sum, comp} ->
        y = value - comp
        t = sum + y
        {t, t - sum - y}
      end)

    sum
  end

  @doc """
  Numerically stable mean using Kahan summation.
  """
  @spec stable_mean(list(float())) :: float() | nil
  def stable_mean([]), do: nil
  def stable_mean(values), do: kahan_sum(values) / length(values)

  @doc """
  Geometric mean for multiplicative quantities (ratios, growth rates).

  Computed via log-space to avoid overflow: exp(mean(log(values))).
  All values must be positive.
  """
  @spec geometric_mean(list(number())) :: float() | nil
  def geometric_mean([]), do: nil
  def geometric_mean(values) when is_list(values) do
    if Enum.all?(values, &(&1 > 0)) do
      log_mean = values |> Enum.map(&:math.log/1) |> mean()
      :math.exp(log_mean)
    else
      nil
    end
  end

  @doc """
  Harmonic mean for averaging rates with fixed denominators.

  Used for averaging speeds, F1 scores, and similar ratio metrics.
  All values must be positive and non-zero.
  """
  @spec harmonic_mean(list(number())) :: float() | nil
  def harmonic_mean([]), do: nil
  def harmonic_mean(values) when is_list(values) do
    if Enum.all?(values, &(&1 > 0)) do
      n = length(values)
      reciprocal_sum = values |> Enum.map(&(1.0 / &1)) |> kahan_sum()
      n / reciprocal_sum
    else
      nil
    end
  end

  @doc """
  Trimmed mean: removes top and bottom trim_percent of values.

  Provides outlier resistance while maintaining the mean's
  mathematical properties for the central portion of data.

  ## Examples

      iex> PrismaticSafety.Statistics.trimmed_mean([1, 2, 3, 4, 100], 0.2)
      3.0
  """
  @spec trimmed_mean(list(number()), float()) :: float() | nil
  def trimmed_mean([], _trim_percent), do: nil
  def trimmed_mean(values, trim_percent) when trim_percent >= 0 and trim_percent < 0.5 do
    sorted = Enum.sort(values)
    n = length(sorted)
    trim_count = round(n * trim_percent)
    trimmed = sorted |> Enum.drop(trim_count) |> Enum.take(n - 2 * trim_count)
    mean(trimmed)
  end
end
```

### GenServer-Based Metric Collector

```elixir
defmodule PrismaticTelemetry.MeanCollector do
  @moduledoc """
  GenServer that maintains streaming mean statistics for
  multiple named metrics using Welford's algorithm.

  Supports concurrent updates via cast for non-blocking
  metric recording from hot paths.
  """
  use GenServer

  require Logger

  @type metric_state :: %{count: non_neg_integer(), mean: float(), m2: float()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec record(atom(), number()) :: :ok
  def record(metric_name, value) do
    GenServer.cast(__MODULE__, {:record, metric_name, value})
  end

  @spec get_stats(atom()) :: {:ok, map()} | {:error, :not_found}
  def get_stats(metric_name) do
    GenServer.call(__MODULE__, {:get_stats, metric_name})
  end

  @impl true
  def init(_opts) do
    {:ok, %{metrics: %{}}}
  end

  @impl true
  def handle_cast({:record, metric_name, value}, state) do
    metrics = Map.update(
      state.metrics,
      metric_name,
      %{count: 1, mean: value * 1.0, m2: 0.0},
      fn %{count: count, mean: mean, m2: m2} ->
        {new_count, new_mean, new_m2} =
          PrismaticSafety.Statistics.streaming_mean_variance(value, count, mean, m2)
        %{count: new_count, mean: new_mean, m2: new_m2}
      end
    )

    :telemetry.execute(
      [:prismatic, :metrics, :mean_updated],
      %{value: value},
      %{metric: metric_name}
    )

    {:noreply, %{state | metrics: metrics}}
  end

  @impl true
  def handle_call({:get_stats, metric_name}, _from, state) do
    case Map.get(state.metrics, metric_name) do
      nil ->
        {:reply, {:error, :not_found}, state}

      %{count: count, mean: mean, m2: m2} ->
        variance = if count > 1, do: m2 / (count - 1), else: 0.0
        std_dev = :math.sqrt(variance)

        {:reply, {:ok, %{
          count: count,
          mean: mean,
          variance: variance,
          std_dev: std_dev
        }}, state}
    end
  end
end
```

## Mathematical Properties

Understanding the mean's mathematical properties helps identify when it's the right tool:

### Decomposability

The mean of a combined dataset can be computed from the means and sizes of subgroups:

```
combined_mean = (n1 * mean1 + n2 * mean2) / (n1 + n2)
```

This property is valuable in distributed systems where different nodes compute local means that must be aggregated. [ETS](/glossary/ets/) counters tracking sum and count enable distributed mean computation without centralizing raw data.

### Minimizes Squared Error

The arithmetic mean minimizes the sum of squared deviations from any point. This makes it the optimal "single number summary" when your loss function penalizes large errors quadratically -- which is why least-squares regression produces means (expected values) as predictions.

### Additivity

The mean of a sum equals the sum of means: E[X + Y] = E[X] + E[Y]. This holds even for dependent random variables, making the mean uniquely useful for decomposing aggregate metrics into components.

### Law of Large Numbers

As sample size grows, the sample mean converges to the true population mean. The rate of convergence depends on variance: high-variance metrics need more samples for a reliable mean. For a metric with standard deviation sigma, the standard error of the mean is sigma / sqrt(n).

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|-----------------|
| Averaging averages | Unequal group sizes bias the result | Weighted average by group size |
| Mean of percentages | Percentages have different denominators | Weight by denominator size |
| Mean latency for SLAs | Hides tail behavior | Use P95/P99 percentiles |
| Mean of ratios | Not the same as ratio of means | Depends on what you're measuring |
| Comparing means without variance | Equal means can have very different distributions | Report std_dev alongside mean |
| Mean over short time windows | Insufficient samples for stability | Use EWMA or longer windows |

## Best Practices

Never use mean alone for latency monitoring -- always pair with [median](/glossary/median/) and P95/P99 to capture distribution shape. Use Welford's online algorithm for streaming mean computation to avoid storing all values. Apply Kahan summation when computing means over large floating-point datasets to prevent numerical drift. Report standard deviation alongside mean to indicate spread -- a mean of 100ms with std dev 5ms tells a different story than mean 100ms with std dev 200ms.

Use geometric mean for comparing performance ratios across benchmarks (SPECint convention). Use harmonic mean for averaging rates where the denominator is constant (F1 score, average speed). Clearly label whether you report arithmetic, geometric, or harmonic mean -- the term "average" is ambiguous.

When computing means across distributed nodes, track both sum and count rather than computing local means then averaging them -- averaging averages with unequal counts produces incorrect results.

For dashboard displays, prefer EWMA over raw mean for time-series data. EWMA provides natural smoothing that tracks trends without the jumpiness of raw means, and the smoothing factor can be tuned to the time scale of interest.

## Related Terms

- [Median](/glossary/median/) -- outlier-resistant central tendency measure, preferred for skewed data
- [Percentile](/glossary/percentile/) -- distribution description immune to outlier distortion
- [Standard Deviation](/glossary/standard-deviation/) -- spread measure that quantifies variation around the mean
- [Variance](/glossary/variance/) -- squared average deviation, decomposable across subgroups
- [Histogram](/glossary/histogram/) -- visual distribution representation that reveals what means hide
- [Distribution](/glossary/distribution/) -- the full shape of data that a single mean summarizes
- [Moving Average](/glossary/moving-average/) -- time-weighted mean for trend detection
- [Outlier](/glossary/outlier/) -- extreme values that distort the arithmetic mean
- [KPI](/glossary/kpi/) -- key performance indicators where mean selection matters
- [Telemetry](/glossary/telemetry/) -- the BEAM telemetry system that feeds metric collectors
- [Monitoring](/glossary/monitoring/) -- observability systems that consume mean statistics
- [Benchee](/glossary/benchee/) -- Elixir benchmarking library that reports multiple mean types
- [Performance Testing](/glossary/performance-testing/) -- testing discipline where mean vs percentile choice matters

## See Also

- [Capabilities](/capabilities/) -- analytics and monitoring capabilities
- [Architecture](/architecture/) -- metrics and telemetry architecture
- [Performance Standards](/performance/) -- PERF doctrine percentile-based limits

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
