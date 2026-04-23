+++
title = "Median"
weight = 50

[extra]
description = "The median is the middle value in a sorted dataset, dividing the distribution into two equal halves, providing an outlier-resistant measure of central tendency that accurately represents typical experience in skewed distributions like response latency"
category = "data"
domain = "statistics"
complexity = "beginner-intermediate"
stability = "stable"
beam_related = true
related_terms = ["mean", "percentile", "p95", "p99", "outlier", "kpi", "latency-percentile", "latency", "profiling", "memory-profiling", "accuracy", "analytics"]
tags = ["glossary", "median", "statistics", "central-tendency", "robust-statistics", "percentile-50", "data-analysis", "quickselect", "streaming-median", "t-digest", "latency-monitoring", "dd-scoring", "trimmed-mean"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "beginner"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The median (P50) provides the most accurate single-number summary of typical user experience because it is immune to the outlier distortion that makes mean latency misleading"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["median", "middle value", "P50", "central tendency", "robust statistic", "outlier resistant", "descriptive statistics", "quickselect", "streaming median", "t-digest"]
image = "/images/sections/glossary.png"
image_alt = "Median - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "performance-testing", "analytics"]
+++

## Definition

The median is the value separating the higher half from the lower half of a dataset when arranged in ascending order. For an odd number of observations, the median is the middle value. For an even number, it is the average of the two middle values. Equivalently, the median is the 50th percentile (P50) -- the value below which 50% of observations fall.

The median's fundamental property is robustness to outliers. Unlike the mean, which is pulled toward extreme values, the median remains stable regardless of how extreme the endpoints become. Replacing the largest value in a dataset with infinity changes the mean dramatically but leaves the median unchanged. This robustness makes the median the preferred single-number summary for skewed distributions such as response latency, income, file sizes, and session durations.

In the Prismatic Platform, median serves as the primary "typical experience" metric across multiple domains: API response latency monitoring, DD (Due Diligence) entity risk scoring, OSINT tool execution timing, and quality DNA score aggregation. Understanding when to use median versus mean -- and how to compute median efficiently at scale -- is fundamental to platform operations.

## Core Concepts

### Median vs Mean: When Each Applies

| Property | Median | Mean |
|----------|--------|------|
| Sensitivity to outliers | Immune | Highly sensitive |
| Mathematical tractability | Limited | Rich (algebra of expectations) |
| Uniqueness | Always unique for continuous data | Always unique |
| Sample size requirements | Moderate | Small (CLT applies quickly) |
| Breakdown point | 50% (maximally robust) | 0% (single outlier distorts) |
| Best for | Skewed distributions | Symmetric distributions |
| Prismatic usage | Latency P50, DD risk scores | Throughput averages |

### Central Tendency Measures Compared

| Measure | Formula (informal) | Robustness | Use Case |
|---------|-------------------|------------|----------|
| **Mean** | Sum / Count | None | Symmetric data, financial totals |
| **Median** | Middle value | 50% breakdown | Skewed data, latency, scores |
| **Mode** | Most frequent value | High | Categorical data, discrete counts |
| **Trimmed Mean** | Mean after removing k% extremes | Tunable | Compromise: some robustness + tractability |
| **Winsorized Mean** | Mean with extremes clamped | Tunable | Like trimmed mean, preserves sample size |
| **Geometric Mean** | nth root of product | Moderate | Multiplicative data, growth rates |

### Breakdown Point

The breakdown point is the proportion of data that must be corrupted before the statistic gives an arbitrarily misleading result. The median has the maximum possible breakdown point of 50% -- you must corrupt more than half the data before the median becomes unreliable. The mean has a breakdown point of 0% -- a single extreme value can distort it arbitrarily.

## Technical Deep Dive

### Computation Algorithms

Computing the exact median requires finding the kth-order statistic where k = n/2. Several algorithms exist with different time/space trade-offs:

#### Sorting-Based (Naive)

Sort the data, then index the middle element. Time complexity: O(n log n). Space: O(n) for a copy, or O(1) if in-place sort is acceptable. Simple and correct, but unnecessarily expensive for just finding the middle element.

#### Quickselect (Hoare's Algorithm)

A selection algorithm based on quicksort's partitioning. Average case: O(n). Worst case: O(n^2) with pathological pivot choices. The randomized variant (random pivot) achieves expected O(n) regardless of input distribution.

**How it works:**
1. Pick a random pivot element
2. Partition the array into elements less than, equal to, and greater than the pivot
3. If k falls in the "less than" partition, recurse there
4. If k falls in the "equal" partition, the pivot is the answer
5. Otherwise, recurse into the "greater than" partition with adjusted k

#### Median of Medians (BFPRT)

Guarantees O(n) worst-case by choosing a pivot that ensures balanced partitions. Divides data into groups of 5, finds each group's median, then recursively finds the median of those medians. The resulting pivot guarantees at least 30% of elements on each side, giving O(n) worst-case. In practice, the constant factor is ~5x higher than randomized quickselect, making it slower for typical inputs.

#### Comparison of Exact Algorithms

| Algorithm | Average Case | Worst Case | Space | Practical Speed |
|-----------|-------------|------------|-------|-----------------|
| Sort + index | O(n log n) | O(n log n) | O(n) | Fast for small n |
| Quickselect (random) | O(n) | O(n^2) | O(1) | Fastest in practice |
| Median of medians | O(n) | O(n) | O(1) | ~5x slower constant |
| Introselect | O(n) | O(n) | O(1) | Best hybrid approach |

### Streaming Median Algorithms

For high-volume metrics where storing all values is impractical, approximate streaming algorithms trade accuracy for bounded memory:

#### Two-Heap Approach (Exact Streaming)

Maintain two heaps: a max-heap for the lower half and a min-heap for the upper half. The median is always available from the heap tops. Insertion: O(log n). Query: O(1). Space: O(n) -- still stores all values, but provides O(1) median access at any time.

#### T-Digest Algorithm

Maintains a compressed representation of the distribution using centroids (weighted mean, count pairs). Centroids near the median are small and precise; centroids near the tails are large and approximate. Provides accurate percentile estimates (including median) with constant memory and O(1) amortized insertion. Widely used in monitoring systems (Elasticsearch, Prometheus).

#### P-Square Algorithm

Estimates specific percentiles using five markers updated with each observation. Requires only O(1) memory and O(1) per-observation update. Less flexible than t-digest (must specify target percentiles upfront) but extremely lightweight.

#### GK Algorithm (Greenwald-Khanna)

Provides epsilon-approximate quantiles with O(1/epsilon * log(epsilon * n)) memory. Guarantees that the returned value is within epsilon * n ranks of the true quantile. Good when a known accuracy bound is needed.

| Algorithm | Memory | Insertion | Query | Accuracy |
|-----------|--------|-----------|-------|----------|
| Two-heap | O(n) | O(log n) | O(1) | Exact |
| T-digest | O(delta) | O(1) amortized | O(1) | ~0.1% at median |
| P-square | O(1) | O(1) | O(1) | ~1-5% |
| GK | O(1/eps * log n) | O(1/eps) | O(log(1/eps)) | epsilon-bounded |

### Weighted Median

When data points have different weights (importance), the weighted median is the value where the cumulative weight on each side is at least half the total weight. This is relevant in DD scoring where different evidence sources have different reliability weights.

### Median Absolute Deviation (MAD)

MAD is a robust measure of spread, defined as the median of absolute deviations from the median:

```
MAD = median(|x_i - median(x)|)
```

MAD is to the median what standard deviation is to the mean -- but with the same robustness properties. For normal distributions, MAD * 1.4826 estimates the standard deviation. In Prismatic Platform, MAD detects when latency variability increases even if the median stays stable.

## Advanced Topics

### Trimmed and Winsorized Means

When you want some outlier resistance but also need the algebraic properties of the mean, trimmed and Winsorized means provide a middle ground:

- **Trimmed mean (k%)**: Remove the lowest k% and highest k% of values, then compute the mean of the remaining. At k=0%, it is the mean; at k=50%, it approaches the median.
- **Winsorized mean (k%)**: Replace the lowest k% with the (k+1)th percentile value and the highest k% with the (100-k)th percentile value, then compute the mean. Preserves sample size, which is important for variance estimation.

| Trimming Level | Robustness | Efficiency (Normal data) | Use Case |
|---------------|------------|--------------------------|----------|
| 0% (mean) | None | 100% | Symmetric, no outliers |
| 5% | Low | ~99% | Mild contamination |
| 10% | Moderate | ~96% | Moderate contamination |
| 25% | High | ~88% | Heavy contamination |
| 50% (median) | Maximum | ~64% | Extreme contamination |

### Multivariate Median

For multi-dimensional data (e.g., an entity with both risk score and confidence), the geometric median (L1 median) minimizes the sum of Euclidean distances to all points. Unlike the coordinate-wise median (take median of each dimension independently), the geometric median considers the joint distribution.

### Median in Hypothesis Testing

The sign test and Wilcoxon signed-rank test are median-based alternatives to the t-test that do not assume normality. These are relevant when comparing system performance before and after a change with small sample sizes or skewed distributions.

## Usage in Prismatic Platform

The Prismatic Platform uses median as the primary "typical experience" metric across multiple domains:

**Latency Monitoring**: While the Page Load Performance Standard sets hard limits at P95, the median provides the baseline comparison point. If P50 is 40ms and P95 is 200ms, the 5x ratio indicates moderate tail latency. If P50 is 40ms and P95 is 2000ms, the 50x ratio signals a severe bimodal distribution requiring investigation.

**Quality DNA Reports**: Quality DNA reports include median quality scores across app groups, providing a robust summary unaffected by outlier apps that may temporarily score exceptionally high or low.

**OSINT Tool Timing**: OSINT tool execution time monitoring uses median response times per tool to establish baselines for rate limiting and timeout configuration. A tool with P50=200ms and P95=5s has occasional slow responses (likely network-dependent); a tool with P50=3s is consistently slow.

**DD Risk Scoring**: When multiple OSINT sources provide risk signals for an entity, the median score provides a robust composite that is not distorted by a single source returning an extreme value. The DD ScoringEngine uses weighted median when source reliability varies.

**Health Score Computation**: The platform's `mix health.score` computation uses median-based aggregation for per-pillar scores to prevent a single failing check from distorting the overall health picture.

## Code Examples

```elixir
defmodule PrismaticSafety.Statistics.Median do
  @moduledoc """
  Median computation with exact and approximate methods.

  Provides multiple algorithms for computing the median,
  optimized for different use cases:

  - `exact/1` - Sort-based, O(n log n), for small datasets
  - `quickselect/1` - O(n) average, for large in-memory datasets
  - `streaming_state/0` and `streaming_insert/2` - Two-heap streaming median
  - `weighted/2` - Weighted median for DD scoring with source reliability

  ## Examples

      iex> PrismaticSafety.Statistics.Median.exact([3, 1, 4, 1, 5])
      3

      iex> PrismaticSafety.Statistics.Median.exact([1, 2, 3, 4])
      2.5

      iex> PrismaticSafety.Statistics.Median.exact([])
      nil
  """

  @doc """
  Compute the exact median by sorting.

  For small to medium datasets (< 100,000 elements). For larger
  datasets, use `quickselect/1` for better average performance.
  """
  @spec exact(list(number())) :: number() | nil
  def exact([]), do: nil
  def exact(values) do
    sorted = Enum.sort(values)
    count = length(sorted)
    mid = div(count, 2)

    if rem(count, 2) == 0 do
      (Enum.at(sorted, mid - 1) + Enum.at(sorted, mid)) / 2
    else
      Enum.at(sorted, mid)
    end
  end

  @doc """
  Quickselect for O(n) average-case median finding.

  Uses randomized pivot selection for expected O(n) performance
  regardless of input distribution. Preferred for large datasets.

  ## Examples

      iex> PrismaticSafety.Statistics.Median.quickselect([7, 2, 9, 1, 5])
      5

      iex> PrismaticSafety.Statistics.Median.quickselect([])
      nil
  """
  @spec quickselect(list(number())) :: number() | nil
  def quickselect([]), do: nil
  def quickselect(values) do
    count = length(values)
    k = div(count, 2)

    if rem(count, 2) == 0 do
      lower = select_kth(values, k - 1)
      upper = select_kth(values, k)
      (lower + upper) / 2
    else
      select_kth(values, k)
    end
  end

  @doc """
  Compute the weighted median.

  Used in DD scoring where different OSINT sources have different
  reliability weights. The weighted median is the value where
  cumulative weight on each side is at least half the total.

  ## Parameters

    - `values` - List of `{value, weight}` tuples
    - `opts` - Options (currently unused, reserved for normalization)

  ## Examples

      iex> PrismaticSafety.Statistics.Median.weighted([{10, 1}, {20, 3}, {30, 1}])
      20

      iex> PrismaticSafety.Statistics.Median.weighted([])
      nil
  """
  @spec weighted([{number(), number()}], keyword()) :: number() | nil
  def weighted([], _opts \\ []), do: nil
  def weighted(weighted_values, _opts) do
    sorted = Enum.sort_by(weighted_values, fn {value, _weight} -> value end)
    total_weight = Enum.reduce(sorted, 0, fn {_v, w}, acc -> acc + w end)
    half_weight = total_weight / 2

    {result, _} =
      Enum.reduce_while(sorted, {nil, 0}, fn {value, weight}, {_current, cumulative} ->
        new_cumulative = cumulative + weight
        if new_cumulative >= half_weight do
          {:halt, {value, new_cumulative}}
        else
          {:cont, {value, new_cumulative}}
        end
      end)

    result
  end

  @doc """
  Compute the Median Absolute Deviation (MAD).

  MAD is a robust measure of statistical dispersion:
  MAD = median(|x_i - median(x)|)

  For normal distributions, MAD * 1.4826 approximates
  the standard deviation.

  ## Examples

      iex> PrismaticSafety.Statistics.Median.mad([1, 2, 3, 4, 5])
      1
  """
  @spec mad(list(number())) :: number() | nil
  def mad([]), do: nil
  def mad(values) do
    med = exact(values)
    deviations = Enum.map(values, fn v -> abs(v - med) end)
    exact(deviations)
  end

  @doc """
  Compute a trimmed mean with configurable trim percentage.

  At trim=0.0, returns the mean. At trim=0.5, approaches the median.

  ## Examples

      iex> PrismaticSafety.Statistics.Median.trimmed_mean([1, 2, 3, 4, 100], 0.2)
      3.0
  """
  @spec trimmed_mean(list(number()), float()) :: float() | nil
  def trimmed_mean([], _trim), do: nil
  def trimmed_mean(values, trim) when trim >= 0.0 and trim < 0.5 do
    sorted = Enum.sort(values)
    count = length(sorted)
    trim_count = trunc(count * trim)

    trimmed = sorted |> Enum.drop(trim_count) |> Enum.take(count - 2 * trim_count)
    Enum.sum(trimmed) / length(trimmed)
  end

  # -- Private helpers --

  defp select_kth([pivot], _k), do: pivot
  defp select_kth(values, k) do
    pivot = Enum.random(values)
    {lower, equal, upper} = partition(values, pivot)

    lower_len = length(lower)
    equal_len = length(equal)

    cond do
      k < lower_len -> select_kth(lower, k)
      k < lower_len + equal_len -> pivot
      true -> select_kth(upper, k - lower_len - equal_len)
    end
  end

  defp partition(values, pivot) do
    Enum.reduce(values, {[], [], []}, fn v, {lo, eq, hi} ->
      cond do
        v < pivot -> {[v | lo], eq, hi}
        v == pivot -> {lo, [v | eq], hi}
        true -> {lo, eq, [v | hi]}
      end
    end)
  end
end
```

```elixir
defmodule PrismaticSafety.Statistics.StreamingMedian do
  @moduledoc """
  Streaming median using the two-heap approach.

  Maintains a max-heap for the lower half and a min-heap for
  the upper half. The median is always available from the heap
  tops in O(1) time. Insertion is O(log n).

  Used for real-time latency monitoring where values arrive
  continuously and the current median must be queryable at any time.

  ## Usage

      state = StreamingMedian.new()
      state = StreamingMedian.insert(state, 42)
      state = StreamingMedian.insert(state, 17)
      state = StreamingMedian.insert(state, 88)
      StreamingMedian.current(state)  # => 42
  """

  defstruct lower: nil, upper: nil, count: 0

  @type t :: %__MODULE__{
    lower: :gb_sets.set() | nil,
    upper: :gb_sets.set() | nil,
    count: non_neg_integer()
  }

  @doc "Create a new empty streaming median state."
  @spec new() :: t()
  def new do
    %__MODULE__{lower: :gb_sets.empty(), upper: :gb_sets.empty(), count: 0}
  end

  @doc "Insert a value into the streaming median."
  @spec insert(t(), number()) :: t()
  def insert(%__MODULE__{count: 0} = state, value) do
    %{state | lower: :gb_sets.singleton({value, make_ref()}), count: 1}
  end

  def insert(%__MODULE__{} = state, value) do
    {lower_max, _} = :gb_sets.largest(state.lower)

    state =
      if value <= lower_max do
        %{state | lower: :gb_sets.add({value, make_ref()}, state.lower)}
      else
        %{state | upper: :gb_sets.add({value, make_ref()}, state.upper)}
      end

    state = rebalance(state)
    %{state | count: state.count + 1}
  end

  @doc "Get the current median value."
  @spec current(t()) :: number() | nil
  def current(%__MODULE__{count: 0}), do: nil
  def current(%__MODULE__{} = state) do
    lower_size = :gb_sets.size(state.lower)
    upper_size = :gb_sets.size(state.upper)

    cond do
      lower_size > upper_size ->
        {value, _ref} = :gb_sets.largest(state.lower)
        value

      upper_size > lower_size ->
        {value, _ref} = :gb_sets.smallest(state.upper)
        value

      true ->
        {lower_max, _} = :gb_sets.largest(state.lower)
        {upper_min, _} = :gb_sets.smallest(state.upper)
        (lower_max + upper_min) / 2
    end
  end

  defp rebalance(state) do
    lower_size = :gb_sets.size(state.lower)
    upper_size = :gb_sets.size(state.upper)

    cond do
      lower_size - upper_size > 1 ->
        {largest, new_lower} = :gb_sets.take_largest(state.lower)
        %{state | lower: new_lower, upper: :gb_sets.add(largest, state.upper)}

      upper_size - lower_size > 1 ->
        {smallest, new_upper} = :gb_sets.take_smallest(state.upper)
        %{state | upper: new_upper, lower: :gb_sets.add(smallest, state.lower)}

      true ->
        state
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using mean for latency reporting | Single slow request skews the average, hiding typical experience | Report median (P50) as the primary metric, mean as secondary |
| Sorting entire dataset just for median | O(n log n) when O(n) is possible | Use quickselect for large datasets |
| Storing all values for streaming median | Unbounded memory growth in monitoring systems | Use t-digest or P-square for approximate streaming |
| Ignoring even/odd distinction | Off-by-one errors in median computation | Handle even count (average of two middle values) explicitly |
| Median of medians confusion | Computing median of group medians is not the global median | Use proper weighted combination or concatenation |
| Using `length/1` in quickselect | O(n) list traversal at each recursion level | Pre-compute length or use arrays for random access |
| Comparing medians without MAD | Two systems with same median but different spread look identical | Report MAD or IQR alongside median for spread context |
| Weighted median with zero weights | Division by zero or meaningless results | Filter out zero-weight entries before computation |

## Best Practices

1. **Report median alongside mean** to reveal distribution skewness -- when median and mean diverge significantly, the distribution is skewed and mean is unreliable.
2. **Use streaming approximate algorithms** (t-digest) for high-volume real-time median computation rather than sorting all values.
3. **Set alerting thresholds on median changes** rather than absolute values to detect relative degradation independent of baseline.
4. **Use MAD as a robust spread measure** alongside the median, replacing mean and standard deviation for skewed data.
5. **When comparing two systems**, compare median and P95 separately -- a system with better median but worse P95 serves most users better but penalizes worst-case users more.
6. **Choose the right algorithm for the data volume**: sort for < 10K elements, quickselect for 10K-10M, streaming for continuous unbounded data.
7. **Use weighted median for composite scores** when combining signals with different reliability levels (e.g., DD multi-source scoring).
8. **Consider trimmed mean as a compromise** when you need some outlier resistance but also need algebraic properties (e.g., computing confidence intervals).
9. **Validate median computations with known distributions** -- for uniform[0, 1], median should be close to 0.5; for exponential(lambda), median should be ln(2)/lambda.
10. **Monitor the P95/P50 ratio** as a tail-heaviness indicator -- ratios above 10x warrant investigation into bimodal distributions.

## Related Terms

- [Mean](/glossary/mean/) -- outlier-sensitive central tendency measure, complements median
- [Percentile](/glossary/percentile/) -- generalized quantile framework including median as P50
- [P95](/glossary/p95/) -- 95th percentile, the standard tail-latency metric
- [P99](/glossary/p99/) -- 99th percentile for extreme tail analysis
- [Outlier](/glossary/outlier/) -- extreme values that median resists but mean does not
- [Latency Percentile](/glossary/latency-percentile/) -- percentile-based latency monitoring
- [KPI](/glossary/kpi/) -- key performance indicators where median is often the best summary
- [Latency](/glossary/latency/) -- primary domain where median-based reporting is essential
- [Accuracy](/glossary/accuracy/) -- measurement quality affecting median reliability
- [Analytics](/glossary/analytics/) -- data analysis pipelines that compute median metrics
- [Profiling](/glossary/profiling/) -- performance profiling where median identifies typical behavior
- [Memory Profiling](/glossary/memory-profiling/) -- memory metrics where median heap size is informative

## See Also

- [Capabilities](/capabilities/) -- statistical analysis capabilities
- [Architecture](/architecture/) -- metrics and monitoring architecture
- [Performance Standards](/architecture/) -- P50/P95 latency targets
- [DD Scoring](/hub/dd) -- median-based entity risk aggregation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
