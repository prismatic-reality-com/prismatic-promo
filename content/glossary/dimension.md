+++
title = "Dimension"
description = "An independent axis of measurement or classification within a data model, enabling multi-dimensional analysis through faceted filtering, aggregation, and cross-tabulation across OSINT findings, security ratings, and quality metrics."
weight = 50

[extra]
domain = "data"
category = "data"
related_terms = ["faceted-search", "data-quality", "data-pipeline", "analytics", "duckdb", "distribution", "olap", "star-schema", "ets", "meilisearch", "aggregation", "quality-dimension", "telemetry"]
tags = ["glossary", "dimension", "analytics", "data-model", "faceted", "classification", "olap", "star-schema", "aggregation", "quality"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
complexity = "medium"
stability = "mature"
beam_related = true
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Dimensions in the Prismatic Platform provide classification axes for OSINT findings, security ratings, and quality metrics, enabling multi-dimensional analysis through faceted search, aggregation, and cross-tabulation with ETS-backed performance."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Dimension", "analytics", "data model", "faceted", "glossary", "Prismatic Platform", "classification", "OLAP", "star schema", "quality dimensions"]
image = "/images/sections/glossary.png"
image_alt = "Dimension - Prismatic Platform"
word_count = 3400
key_concepts = ["categorical-dimension", "temporal-dimension", "hierarchical-dimension", "degenerate-dimension", "slowly-changing-dimension", "star-schema", "fact-table", "slice-dice-drill", "quality-dimension", "pre-aggregation"]
audience = ["developers", "data-engineers", "analysts", "architects"]
prerequisites = ["data-modeling-basics", "sql-fundamentals", "analytics-concepts"]
use_cases = ["osint-analysis", "security-rating-decomposition", "quality-metric-tracking", "faceted-search", "dashboard-aggregation", "trend-analysis"]
see_also = ["capabilities", "architecture", "technologies", "faceted-search", "data-quality", "duckdb"]
+++

## Definition and Overview

In data modeling and analytics, a dimension is an independent axis of measurement or classification that provides context for quantitative facts. Dimensions answer the "who, what, where, when, why" questions about data, enabling multi-dimensional analysis through slicing (selecting a single dimension value), dicing (selecting multiple dimension values), drilling down (moving to finer granularity), and rolling up (aggregating to coarser granularity). In star schema design, dimension tables surround a central fact table, providing the descriptive attributes that make raw measures meaningful.

Beyond traditional data warehousing, the concept of dimensionality applies to any system where data must be classified, filtered, or aggregated along multiple independent axes -- including OSINT intelligence analysis, security rating assessment, and quality metric tracking. In the Prismatic Platform, dimensions serve as the structural backbone for all analytical views: OSINT findings are classified by source, severity, geography, and time; security ratings decompose into technical, organizational, and compliance dimensions; quality metrics track across code, documentation, testing, and performance dimensions.

The power of dimensional modeling lies in its query flexibility. A well-designed dimensional model allows analysts to answer questions that were not anticipated when the model was designed. By defining orthogonal dimensions, any combination of slicing and aggregation becomes possible without schema changes. This flexibility is critical for intelligence analysis, where the questions evolve as investigation progresses and new patterns emerge.

## Core Concepts

| Concept | Description | Example in Prismatic |
|---------|-------------|---------------------|
| **Dimension** | Independent classification axis | Tool category, severity, geography |
| **Fact** | Quantitative measurement at dimension intersection | Finding count, risk score, response time |
| **Measure** | Aggregatable numeric value in a fact | Sum, average, count, max, min |
| **Star Schema** | Fact table surrounded by dimension tables | OSINT findings fact + source/severity/time dims |
| **Snowflake Schema** | Normalized dimensions with sub-tables | Geography: country -> region -> city |
| **Slice** | Filter on a single dimension value | "Show only Critical severity" |
| **Dice** | Filter on multiple dimension values | "Critical + High severity in EU" |
| **Drill Down** | Move to finer granularity within dimension | Year -> Quarter -> Month -> Day |
| **Roll Up** | Aggregate to coarser granularity | Day -> Month -> Quarter -> Year |
| **Pivot** | Rotate dimensions between rows and columns | Swap time and geography axes |
| **Cardinality** | Number of distinct values in a dimension | Low (severity: 4) vs High (IP: millions) |
| **Grain** | Finest level of detail in the fact table | One row per finding per source per day |

## Technical Deep Dive

### Dimension Type Classification

| Dimension Type | Characteristics | Example in Prismatic | Storage Strategy |
|---------------|----------------|---------------------|-----------------|
| **Categorical** | Discrete, finite values, no ordering | Tool category (Czech, Global, Sanctions) | Atoms or constrained strings |
| **Ordinal** | Discrete values with natural ordering | Risk level (Critical > High > Medium > Low) | Integer ranking + label map |
| **Temporal** | Time-based hierarchy with drill-down | Discovery date (year/month/day/hour) | DateTime with timezone |
| **Geographic** | Location-based with spatial hierarchy | IP geolocation (country/region/city) | Struct with hierarchy fields |
| **Hierarchical** | Parent-child relationships, variable depth | Organization > Department > Team | Nested map or tree struct |
| **Degenerate** | Fact-embedded dimension (no separate table) | Transaction ID, finding hash | Field on fact record |
| **Junk** | Combined low-cardinality flags | {is_verified, is_automated, is_public} | Composite key or bitfield |
| **Role-Playing** | Same dimension used in different contexts | Date dimension as "discovered_date" and "resolved_date" | Aliased joins |
| **Slowly Changing (SCD)** | Values that change over time | Organization risk rating history | Type 2: new row per change |
| **Rapidly Changing** | Frequently updated values | Real-time threat score | Separate mini-dimension |
| **Conformed** | Shared dimension across multiple fact tables | Time dimension shared by OSINT/DD/Quality facts | Single authoritative definition |

### OLAP Operations Matrix

| Operation | Input | Output | SQL Equivalent | Use Case |
|-----------|-------|--------|---------------|----------|
| **Slice** | N-dimensional cube, 1 filter | (N-1)-dimensional cube | `WHERE severity = 'critical'` | Focus on one category |
| **Dice** | N-dimensional cube, M filters | Sub-cube | `WHERE severity IN ('critical', 'high')` | Multi-filter analysis |
| **Drill Down** | Aggregated view | Detailed view | `GROUP BY day` instead of `GROUP BY month` | Investigate anomaly |
| **Roll Up** | Detailed view | Aggregated view | `GROUP BY month` instead of `GROUP BY day` | Executive summary |
| **Pivot** | Row dimensions | Column dimensions | Conditional aggregation | Alternative perspective |
| **Drill Across** | Fact table A | Linked fact table B | JOIN on conformed dimension | Cross-domain analysis |

### Quality Dimensions in Software Engineering

Beyond data analytics, the Prismatic Platform tracks quality along multiple independent dimensions:

| Quality Dimension | What It Measures | Metric Examples | Doctrine |
|------------------|-----------------|-----------------|----------|
| **Code Quality** | Source code characteristics | Credo score, complexity, duplication | NMND |
| **Test Coverage** | Testing completeness | File coverage, assertion density | TACH |
| **Documentation** | Documentation completeness | @moduledoc, @doc, @spec coverage | DOCS |
| **Performance** | Runtime efficiency | P95 latency, memory usage, throughput | PERF |
| **Security** | Vulnerability exposure | SEAL violations, dependency CVEs | SEAL |
| **Observability** | Monitoring completeness | Telemetry coverage, log quality | OTEL |
| **Dependency Health** | External dependency quality | Version currency, vulnerability count | DEPS |
| **Architecture** | Structural integrity | Coupling metrics, boundary violations | NWB |

### Dimensional Modeling Patterns

Three patterns dominate dimensional analysis in the Prismatic Platform:

**Pattern 1: Star Schema for OSINT Findings**
The central fact table records one row per OSINT finding. Dimension tables provide classification axes. This enables arbitrary slicing: "Show all Critical findings from Czech sources discovered in the last 7 days."

**Pattern 2: Slowly Changing Dimensions for Security Ratings**
Security ratings change over time as vulnerabilities are discovered and remediated. SCD Type 2 (new row per change) preserves the complete rating history, enabling trend analysis: "How has the organization's risk posture changed over the last quarter?"

**Pattern 3: Conformed Dimensions for Cross-Domain Analysis**
The time dimension is shared across OSINT findings, DD pipeline events, and quality metrics. This enables drill-across queries: "Correlate OSINT finding spikes with DD pipeline load and quality metric changes."

## Architecture and Implementation

The Prismatic Platform implements dimensional analysis using a combination of PostgreSQL (for persistent storage and complex queries), ETS (for high-performance in-memory aggregation), and Meilisearch (for faceted search with dimension-based filtering).

## Usage in Prismatic Platform

The Prismatic Platform's OSINT and Perimeter modules use dimensional analysis for multi-faceted intelligence classification and security rating decomposition.

```elixir
defmodule Prismatic.Analytics.DimensionEngine do
  @moduledoc """
  Multi-dimensional analysis engine for OSINT findings,
  security ratings, and quality metrics.

  Supports slicing, dicing, drill-down, and roll-up operations
  across arbitrary dimension combinations. Uses ETS for
  pre-aggregated dimension summaries and PostgreSQL for
  ad-hoc analytical queries.

  ## Supported Dimensions

  - `:category` - Tool/source category (Czech, Global, Sanctions)
  - `:severity` - Risk level (Critical, High, Medium, Low)
  - `:source` - Intelligence source identifier
  - `:time` - Temporal dimension with year/month/day/hour hierarchy
  - `:geography` - Geographic dimension with country/region/city hierarchy
  - `:asset_type` - Asset classification (domain, IP, email, person, org)

  ## Supported Measures

  - `:count` - Number of items
  - `:avg_score` - Average of a score field
  - `:max_severity` - Maximum severity value
  - `:sum_risk` - Sum of risk scores

  ## Examples

      iex> findings = [
      ...>   %{category: :czech, severity: :high, score: 85, risk_score: 7},
      ...>   %{category: :czech, severity: :critical, score: 95, risk_score: 9},
      ...>   %{category: :global, severity: :medium, score: 60, risk_score: 4}
      ...> ]
      iex> query = %{
      ...>   dimensions: [:category],
      ...>   measures: [:count, :avg_score],
      ...>   filters: %{},
      ...>   time_range: nil
      ...> }
      iex> {:ok, results} = Prismatic.Analytics.DimensionEngine.analyze(findings, query)
      iex> length(results) == 2
      true
  """

  require Logger

  @type dimension :: :category | :severity | :source | :time | :geography | :asset_type
  @type measure :: :count | :avg_score | :max_severity | :sum_risk

  @type query :: %{
    dimensions: list(dimension()),
    measures: list(measure()),
    filters: map(),
    time_range: {DateTime.t(), DateTime.t()} | nil
  }

  @type result_row :: %{
    dimensions: list(term()),
    measures: map()
  }

  @doc """
  Analyzes a collection of findings along specified dimensions.

  Applies filters, groups by dimensions, and computes measures
  for each group. Returns a list of result rows where each row
  contains the dimension values and computed measure values.

  ## Parameters

  - `findings` - List of maps containing dimension and measure fields
  - `query` - Query specification with dimensions, measures, filters, and time range

  ## Examples

      iex> findings = [%{category: :a, score: 10, risk_score: 1}]
      iex> query = %{dimensions: [:category], measures: [:count], filters: %{}, time_range: nil}
      iex> {:ok, [result]} = Prismatic.Analytics.DimensionEngine.analyze(findings, query)
      iex> result.measures[:count]
      1
  """
  @spec analyze(list(map()), query()) :: {:ok, list(result_row())}
  def analyze(findings, query) when is_list(findings) do
    :telemetry.span([:prismatic, :analytics, :dimension_query], %{}, fn ->
      results =
        findings
        |> apply_filters(query.filters)
        |> apply_time_range(query.time_range)
        |> group_by_dimensions(query.dimensions)
        |> compute_measures(query.measures)

      Logger.debug(
        "Dimension query: #{inspect(query.dimensions)} -> #{length(results)} groups " <>
          "from #{length(findings)} findings"
      )

      {{:ok, results}, %{result_count: length(results), input_count: length(findings)}}
    end)
  end

  @doc """
  Performs a drill-down operation on a result set.

  Takes a slice of the data (filtered by current dimension values)
  and re-analyzes with additional dimensions for finer granularity.

  ## Parameters

  - `findings` - Original finding list
  - `current_filters` - Current dimension value selections
  - `drill_dimension` - New dimension to add for drill-down
  - `measures` - Measures to compute

  ## Examples

      iex> findings = [
      ...>   %{category: :czech, severity: :high, source: :ares},
      ...>   %{category: :czech, severity: :low, source: :justice}
      ...> ]
      iex> {:ok, results} = Prismatic.Analytics.DimensionEngine.drill_down(
      ...>   findings,
      ...>   %{category: :czech},
      ...>   :severity,
      ...>   [:count]
      ...> )
      iex> length(results) == 2
      true
  """
  @spec drill_down(list(map()), map(), dimension(), list(measure())) :: {:ok, list(result_row())}
  def drill_down(findings, current_filters, drill_dimension, measures) do
    query = %{
      dimensions: [drill_dimension],
      measures: measures,
      filters: current_filters,
      time_range: nil
    }

    analyze(findings, query)
  end

  @doc """
  Computes a roll-up (aggregation) across a dimension hierarchy.

  For temporal dimensions, rolls up from day -> month -> quarter -> year.
  For geographic dimensions, rolls up from city -> region -> country.

  ## Parameters

  - `results` - List of result rows at current granularity
  - `dimension` - Dimension to roll up
  - `hierarchy_fn` - Function mapping fine values to coarse values

  ## Examples

      iex> results = [
      ...>   %{dimensions: [~D[2026-03-01]], measures: %{count: 10}},
      ...>   %{dimensions: [~D[2026-03-15]], measures: %{count: 20}}
      ...> ]
      iex> rolled = Prismatic.Analytics.DimensionEngine.roll_up(
      ...>   results,
      ...>   :time,
      ...>   fn date -> %{year: date.year, month: date.month} end
      ...> )
      iex> length(rolled) == 1
      true
  """
  @spec roll_up(list(result_row()), dimension(), (term() -> term())) :: list(result_row())
  def roll_up(results, _dimension, hierarchy_fn) do
    results
    |> Enum.group_by(fn %{dimensions: [val | _rest]} -> hierarchy_fn.(val) end)
    |> Enum.map(fn {coarse_key, rows} ->
      merged_count = rows |> Enum.map(& &1.measures[:count]) |> Enum.sum()

      %{
        dimensions: [coarse_key],
        measures: %{count: merged_count}
      }
    end)
  end

  # Private implementation

  defp apply_filters(findings, filters) when map_size(filters) == 0, do: findings

  defp apply_filters(findings, filters) do
    Enum.filter(findings, fn finding ->
      Enum.all?(filters, fn {dim, value} ->
        Map.get(finding, dim) == value
      end)
    end)
  end

  defp apply_time_range(findings, nil), do: findings

  defp apply_time_range(findings, {from, to}) do
    Enum.filter(findings, fn f ->
      case Map.get(f, :discovered_at) do
        nil ->
          true

        discovered_at ->
          DateTime.compare(discovered_at, from) != :lt and
            DateTime.compare(discovered_at, to) != :gt
      end
    end)
  end

  defp group_by_dimensions(findings, dimensions) do
    Enum.group_by(findings, fn finding ->
      Enum.map(dimensions, &Map.get(finding, &1))
    end)
  end

  defp compute_measures(grouped, measures) do
    Enum.map(grouped, fn {key, items} ->
      computed =
        Enum.map(measures, fn
          :count -> {:count, length(items)}
          :avg_score -> {:avg_score, safe_avg(items, :score)}
          :max_severity -> {:max_severity, safe_max(items, :severity)}
          :sum_risk -> {:sum_risk, safe_sum(items, :risk_score)}
        end)

      %{dimensions: key, measures: Map.new(computed)}
    end)
  end

  defp safe_avg(items, field) do
    values = Enum.map(items, &Map.get(&1, field, 0))

    case values do
      [] -> 0.0
      vals -> Enum.sum(vals) / length(vals)
    end
  end

  defp safe_max(items, field) do
    items
    |> Enum.map(&Map.get(&1, field, 0))
    |> Enum.max(fn -> 0 end)
  end

  defp safe_sum(items, field) do
    items
    |> Enum.map(&Map.get(&1, field, 0))
    |> Enum.sum()
  end
end
```

### Pre-Aggregation with ETS

For frequently queried dimension combinations, the platform pre-aggregates results into ETS tables:

```elixir
defmodule Prismatic.Analytics.DimensionCache do
  @moduledoc """
  ETS-backed cache for pre-aggregated dimension summaries.

  Maintains materialized aggregations for common dimension
  combinations (e.g., severity x category, severity x time).
  Updated on a configurable interval or triggered by new data
  arriving via PubSub.

  Pre-aggregation eliminates repeated computation for dashboard
  views that display the same dimensional breakdowns. Cache
  entries are keyed by a hash of the query specification and
  expire after a configurable TTL.

  ## Examples

      iex> Prismatic.Analytics.DimensionCache.get({[:severity], [:count]})
      {:ok, [%{dimensions: [:critical], measures: %{count: 42}}, ...]}

      iex> Prismatic.Analytics.DimensionCache.get({[:unknown], [:count]})
      :miss
  """

  @table :dimension_cache
  @default_ttl_ms 60_000

  @doc """
  Initializes the dimension cache ETS table.

  Should be called once during application startup.

  ## Examples

      iex> Prismatic.Analytics.DimensionCache.init()
      :ok
  """
  @spec init() :: :ok
  def init do
    :ets.new(@table, [:named_table, :public, :set, read_concurrency: true])
    :ok
  end

  @doc """
  Retrieves a cached aggregation result.

  Returns `{:ok, results}` if cached and not expired, or `:miss`.

  ## Parameters

  - `cache_key` - Tuple of `{dimensions, measures}` identifying the query

  ## Examples

      iex> Prismatic.Analytics.DimensionCache.get({[:severity], [:count]})
      :miss
  """
  @spec get(term()) :: {:ok, list(map())} | :miss
  def get(cache_key) do
    case :ets.lookup(@table, cache_key) do
      [{^cache_key, results, inserted_at}] ->
        if System.monotonic_time(:millisecond) - inserted_at < @default_ttl_ms do
          {:ok, results}
        else
          :ets.delete(@table, cache_key)
          :miss
        end

      [] ->
        :miss
    end
  end

  @doc """
  Stores an aggregation result in the cache.

  ## Parameters

  - `cache_key` - Tuple of `{dimensions, measures}` identifying the query
  - `results` - List of result rows to cache

  ## Examples

      iex> Prismatic.Analytics.DimensionCache.put({[:severity], [:count]}, [%{count: 42}])
      :ok
  """
  @spec put(term(), list(map())) :: :ok
  def put(cache_key, results) do
    :ets.insert(@table, {cache_key, results, System.monotonic_time(:millisecond)})
    :ok
  end

  @doc """
  Invalidates all cached entries.

  Called when underlying data changes significantly (e.g., bulk import).

  ## Examples

      iex> Prismatic.Analytics.DimensionCache.invalidate_all()
      :ok
  """
  @spec invalidate_all() :: :ok
  def invalidate_all do
    :ets.delete_all_objects(@table)
    :ok
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Too many dimensions | Sparse data, meaningless aggregations | Limit to 6-8 core dimensions per fact table |
| High-cardinality dimensions in GROUP BY | Slow queries, memory exhaustion | Use ranges/buckets for continuous values |
| Missing time dimension | Cannot analyze trends or detect anomalies | Always include temporal dimension with hierarchy |
| Mixing facts and dimensions | Unclear model, aggregation errors | Separate quantitative facts from descriptive dimensions |
| No pre-aggregation | Dashboard queries recompute from raw data | Cache common dimension combinations in ETS |
| Ignoring NULL dimension values | Findings excluded from aggregations silently | Explicit "Unknown" category for missing dimension values |
| Using `length/1` for count measure | O(n) traversal for each group | Use `Enum.count/1` or track count during grouping |
| Dimension value drift | Inconsistent spelling/casing across sources | Normalize dimension values at ingestion time |
| Unbounded drill-down | Querying to finest grain on large datasets | Apply limits at each drill level |
| Stale cache after data changes | Dashboard shows outdated aggregations | PubSub-triggered cache invalidation on data writes |
| Confusing ordinal with categorical | Incorrect sorting and comparison operations | Explicit dimension type metadata |
| No conformed dimensions | Cannot join across fact tables | Define shared dimensions once, reference everywhere |

## Best Practices

1. **Define dimensions based on analytical questions** -- Dimensions should reflect how users need to slice and explore data. Interview analysts about their investigation patterns before designing the dimensional model.

2. **Use enumerated types for categorical dimensions** -- Atoms or constrained strings prevent dimension value drift. Define valid values as Ecto enums or atom allowlists to catch invalid values at ingestion time.

3. **Implement hierarchical dimensions for drill-down** -- Geography (country > region > city) and time (year > quarter > month > day > hour) dimensions benefit from explicit parent-child hierarchies enabling smooth drill-down/roll-up operations.

4. **Index dimension columns** -- Faceted filtering requires efficient dimension value lookups. Create PostgreSQL indexes on all dimension columns used in WHERE clauses and GROUP BY operations.

5. **Pre-aggregate common dimension combinations** -- Materialized views or ETS caches eliminate repeated computation. Identify the top 10 most-queried dimension combinations from dashboard usage and pre-aggregate them.

6. **Define conformed dimensions shared across domains** -- Time, geography, and severity dimensions should be defined once and shared across OSINT, DD, and quality fact tables. This enables cross-domain drill-across queries.

7. **Normalize dimension values at ingestion** -- Clean, standardize, and validate dimension values when data enters the system, not at query time. This prevents "Czech Republic" vs "CZ" vs "Czechia" proliferation.

8. **Track dimension cardinality** -- Monitor the distinct value count of each dimension. High-cardinality dimensions (e.g., individual IPs) need different indexing strategies than low-cardinality dimensions (e.g., severity levels).

9. **Use PubSub for cache invalidation** -- When new data arrives, broadcast invalidation events rather than using TTL-only cache expiration. This ensures dashboards reflect recent data without polling.

10. **Document dimension semantics** -- Each dimension should have a clear definition, valid values, hierarchy (if any), and update frequency. This prevents misinterpretation in analytical queries.

## Related Terms

- [Faceted Search](@/glossary/faceted-search.md) -- Search refinement using dimensional filters
- [Distribution](@/glossary/distribution.md) -- Statistical distribution of values within a dimension
- [Data Quality](@/glossary/data-quality.md) -- Quality dimensions measuring software and data attributes
- [DuckDB](@/glossary/duckdb.md) -- Analytical database optimized for multi-dimensional queries
- [ETS](@/glossary/ets.md) -- In-memory storage for pre-aggregated dimension caches
- [Meilisearch](@/glossary/meilisearch.md) -- Full-text search with faceted filtering on dimensions
- [Star Schema](/glossary/star-schema/) -- Dimensional modeling pattern with central fact table
- [OLAP](/glossary/olap/) -- Online Analytical Processing for multi-dimensional queries
- [Aggregation](@/glossary/aggregation.md) -- Computing summary measures across dimension groups
- [Telemetry](@/glossary/telemetry.md) -- Metric collection with dimensional metadata
- [Data Pipeline](@/glossary/data-pipeline.md) -- Data flow with dimensional enrichment at each stage
- [Analytics](@/glossary/analytics.md) -- Intelligence analysis leveraging dimensional classification

## See Also

- [Capabilities](@/capabilities/_index.md) -- Analytics and intelligence capabilities
- [Architecture](@/architecture/_index.md) -- Data model architecture and dimensional design
- [Technologies](@/technologies/_index.md) -- Database technologies supporting dimensional analysis
- **OSINT Toolbox** -- OSINT tools classified along categorical dimensions
- **Prismatic Perimeter** -- Security ratings decomposed across quality dimensions
- **Health Score** -- Platform health computed across multiple quality dimensions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
