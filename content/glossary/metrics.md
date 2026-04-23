+++
title = "Metrics"
weight = 37
[extra]
category = "quality"
description = "Numeric measurements collected over time to quantify system behavior and performance"
related_terms = ["observability", "structured-logging", "distributed-tracing", "timescaledb", "metrics"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 938
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Metrics", "Numeric", "glossary", "quality", "Prismatic Platform", "Example", "Telemetry", "Always"]
tags = ["glossary", "quality", "metrics", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Metrics - Prismatic Platform"
+++

## Definition

Metrics are numeric measurements collected at regular intervals or on specific events to quantify system behavior, performance, and health. Unlike [logs](@/glossary/structured-logging.md) which record discrete events or [traces](@/glossary/distributed-tracing.md) which track individual request paths, metrics capture aggregate system state as time series data -- sequences of numeric values indexed by timestamp. This aggregation makes metrics the most storage-efficient [observability](@/glossary/observability.md) pillar and the primary tool for long-term trend analysis, alerting, capacity planning, and real-time dashboards.

Metrics operate at a fundamentally different level of abstraction than logs or traces. A log entry says "this specific request failed with this error." A trace shows "this specific request took this path through the system." A metric says "in the last minute, 5% of all requests failed" or "p99 latency is 250ms." This aggregate perspective makes metrics indispensable for understanding system-wide behavior, detecting gradual degradation, and forecasting resource needs. Metrics are typically the first signal that something is wrong (alerting) and the last data consulted when capacity planning months ahead.

The standard metric types -- counters, gauges, histograms, and summaries -- cover virtually all measurement needs. Counters track monotonically increasing values (total requests served). Gauges track point-in-time values that can go up or down (current memory usage). Histograms track the distribution of values (request latency percentiles). The choice of metric type determines what questions can be answered and what aggregations are valid.

## Metric Types

| Type | Behavior | Example | Valid Aggregations |
|------|----------|---------|-------------------|
| **Counter** | Monotonically increasing value; only increments | Total requests, total errors, bytes transferred | Rate (requests/sec), delta (increase over period) |
| **Gauge** | Point-in-time value; increases and decreases | Memory usage, active connections, queue depth | Average, min, max, current value |
| **Histogram** | Distribution of observed values in configurable buckets | Request latency, response size, batch processing time | Percentiles (p50, p95, p99), average, count |
| **Summary** | Client-side calculated percentiles | Similar to histogram but computed at emission | Pre-calculated percentiles (cannot be re-aggregated) |

### Understanding Histograms

Histograms are the most powerful metric type for performance analysis. They record each observation in pre-defined buckets, enabling percentile calculations at query time. The bucket boundaries determine the precision of percentile estimates:

```elixir
# Histogram bucket configuration for request latency
buckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

# Each observation increments the appropriate bucket counter:
# 45ms request -> increments buckets: 50, 100, 250, 500, 1000, 2500, 5000
# 300ms request -> increments buckets: 500, 1000, 2500, 5000

# At query time, percentiles are calculated from bucket distribution:
# p50 = median latency (50% of requests faster than this)
# p95 = 95th percentile (5% of requests slower than this)
# p99 = 99th percentile (1% of requests slower than this)
```

The distinction between p50 and p99 is critical for production systems. A service with p50=10ms and p99=500ms has a 50x tail latency problem -- half the requests are fast, but 1 in 100 requests is 50 times slower. Only histogram metrics reveal this distribution; averages mask it entirely.

## Telemetry.Metrics in Elixir

Elixir's `Telemetry.Metrics` library provides a declarative way to define metrics from telemetry events:

```elixir
defmodule PrismaticMetrics do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    children = [
      {TelemetryMetricsPrometheus, metrics: metrics()}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  defp metrics do
    [
      # Counter: total agent executions
      Telemetry.Metrics.counter(
        "prismatic.agent.execute.count",
        tags: [:agent_name, :tier, :status]
      ),

      # Distribution: agent execution duration
      Telemetry.Metrics.distribution(
        "prismatic.agent.execute.duration",
        unit: {:native, :millisecond},
        tags: [:agent_name, :tier],
        reporter_options: [buckets: [10, 50, 100, 250, 500, 1000, 5000]]
      ),

      # Last value: current active agent count
      Telemetry.Metrics.last_value(
        "prismatic.agents.active.count",
        tags: [:tier]
      ),

      # Sum: total quality violations found
      Telemetry.Metrics.sum(
        "prismatic.quality.violations.total",
        tags: [:domain, :severity]
      ),

      # Distribution: storage query latency
      Telemetry.Metrics.distribution(
        "prismatic.storage.query.duration",
        unit: {:native, :millisecond},
        tags: [:adapter, :operation]
      )
    ]
  end
end
```

## Emitting Custom Metrics

The `:telemetry` library provides the low-level event emission that feeds into Telemetry.Metrics:

```elixir
defmodule PrismaticPerimeter.SecurityScanner do
  @spec scan_domain(String.t()) :: {:ok, map()} | {:error, term()}
  def scan_domain(domain) do
    start_time = System.monotonic_time()

    result = perform_scan(domain)

    :telemetry.execute(
      [:prismatic, :perimeter, :scan],
      %{
        duration: System.monotonic_time() - start_time,
        asset_count: count_assets(result),
        vulnerability_count: count_vulnerabilities(result)
      },
      %{
        domain: domain,
        scan_type: :full,
        status: elem(result, 0)
      }
    )

    result
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform tracks metrics across 13 quality domains, maintaining a perfect 100/100 quality score. The metrics infrastructure serves multiple purposes:

- **13 Quality Domain Metrics**: Each quality domain is tracked as a metric with continuous monitoring. The current state is 0 violations across all domains -- Dialyzer, Credo, compilation, DateTime precision, guard functions, @impl coverage, memory safety, performance, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access.
- **Quality DNA Persistence**: The Quality DNA system persists metric snapshots across sessions using JSON files at `.claude/quality-dna/current-state.json`. This enables trend analysis of quality scores over the platform's complete operational history.
- **Quality Floor Guardian**: An autonomous system that continuously monitors quality metrics and triggers automatic actions based on threshold violations:

| Quality Score | Level | Response |
|--------------|-------|----------|
| 100-99% | OPTIMAL | Monitor only |
| 98-99% | WARNING | Alert + investigation |
| 95-98% | CRITICAL | Auto-evolution trigger |
| <95% | EMERGENCY | Block commits + escalate |

- **Agent Performance Metrics**: Each of the 434 AIAD [agents](@/glossary/agent.md) emits execution metrics including duration, success rate, and resource consumption. These metrics power per-agent performance dashboards.
- **Storage Layer Metrics**: Every storage adapter ([Ecto](@/glossary/ecto.md), ETS, Meilisearch, KuzuDB) emits query duration and result count metrics, enabling storage performance monitoring and optimization.
- **Security Rating Metrics**: The [Perimeter](@/glossary/easm.md) module tracks security scores over time using [TimescaleDB](@/glossary/timescaledb.md) for time-series storage, enabling trend analysis and regression detection.
- **[Broadway](@/glossary/broadway.md) Pipeline Metrics**: Data pipeline throughput, processing latency, and batch sizes are tracked as metrics for pipeline capacity planning.
- **[QDP](@/glossary/qdp.md) Tracking**: Quality Debt Points are tracked as a key platform metric, with the elimination of 905 QDP through [CASCADE](@/glossary/cascade-pattern.md) patterns being a signature achievement.

## Metric Naming Conventions

Consistent metric naming enables cross-system querying and dashboard creation:

| Convention | Pattern | Example |
|-----------|---------|---------|
| **Namespace** | `prismatic.<subsystem>.<operation>.<measurement>` | `prismatic.agent.execute.duration` |
| **Tags** | Dimensional labels for filtering/grouping | `agent_name: "scanner"`, `tier: "L2"` |
| **Units** | Always specify measurement unit | `unit: {:native, :millisecond}` |
| **Cardinality** | Limit tag value combinations | Avoid per-user or per-request tags |

## Metric Collection Architecture

```
Application Code
    |
    v
:telemetry.execute() events
    |
    v
Telemetry.Metrics definitions
    |
    v
Reporter (Prometheus, StatsD, Console)
    |
    +----> Prometheus endpoint (/metrics)
    |          |
    |          v
    |      Prometheus server (scraping)
    |          |
    |          v
    |      Grafana dashboards
    |
    +----> TimescaleDB (time-series storage)
    |          |
    |          v
    |      Quality DNA trend analysis
    |
    +----> Quality Floor Guardian
               |
               v
           Auto-healing triggers
```

## Dimensional Analysis and Tag Design

Tags (also called labels or dimensions) transform flat metric names into multi-dimensional data that can be sliced, diced, and aggregated along any dimension. Proper tag design is critical for useful metrics:

```elixir
# Good: low-cardinality tags that enable useful grouping
:telemetry.execute(
  [:prismatic, :storage, :query],
  %{duration: duration},
  %{adapter: :ecto, operation: :select, table: :security_ratings}
)

# Bad: high-cardinality tags that explode storage
:telemetry.execute(
  [:prismatic, :storage, :query],
  %{duration: duration},
  %{user_id: user.id, query_text: query}  # DO NOT use per-user or per-query tags
)
```

| Tag Design Principle | Description | Example |
|---------------------|-------------|---------|
| **Low cardinality** | Limited number of distinct tag values | `adapter: [:ecto, :ets, :meilisearch]` (3 values) |
| **Stable values** | Tag values do not change frequently | `tier: [:L1, :L2, :L3, :L4]` (4 values) |
| **Actionable grouping** | Tags enable useful aggregation | `status: [:ok, :error]` for success rate |
| **No PII** | Never include user identifiers in tags | Use logs for per-user data |

## Alerting on Metrics

Effective alerting requires careful threshold selection and multi-signal correlation:

| Alert Type | Signal | Example | Response |
|-----------|--------|---------|----------|
| **Threshold** | Metric crosses fixed value | Error rate > 5% | Investigate immediately |
| **Trend** | Metric rate of change abnormal | Latency increasing 10%/hour | Investigate before critical |
| **Absence** | Expected metric stops arriving | Agent heartbeat missing | Check agent health |
| **Composite** | Multiple metrics indicate problem | High latency AND high error rate | Priority investigation |
| **Quality Floor** | Quality score below baseline | Quality drops from 100 to 98 | Auto-evolution trigger |

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **High-cardinality tags** | Per-user or per-request tags explode storage | Use logs/traces for per-entity data; keep metrics aggregate |
| **Averages without percentiles** | Average hides outliers (p99 problems invisible) | Always track histograms with percentile buckets |
| **Missing units** | "Duration: 250" -- milliseconds? seconds? | Always include unit in metric definition |
| **Counter without rate** | "Total errors: 50,000" is meaningless without time context | Always compute rate (errors/second) |
| **Stale metrics** | Metrics from stopped processes linger | Use gauge with expiration; clean up on process termination |

## Best Practices

**Use Histograms for Latency**: Never track latency with a gauge (last value) or counter (average). Histograms capture the full distribution, revealing tail latency problems that averages and medians hide. Configure bucket boundaries to cover the expected range with sufficient resolution.

**Separate Read and Write Metrics**: Track read operations and write operations separately, even for the same storage adapter. Read and write latency have different performance characteristics and optimization strategies.

**Include Error Dimensions**: Every operation metric should include a status tag (`:ok` or `:error`) enabling automatic error rate calculation. Error rate is one of the most critical signals for system health.

**Set Meaningful Alert Thresholds**: Base alert thresholds on historical baselines, not arbitrary values. A p99 latency threshold of 500ms is meaningless if normal p99 is 490ms -- it will fire constantly. Use trend-based alerting to detect abnormal changes from the baseline.

## Related Terms

- [Observability](@/glossary/observability.md) - Metrics are one of the three observability pillars
- [Structured Logging](@/glossary/structured-logging.md) - Complementary per-event records alongside aggregate metrics
- [Distributed Tracing](@/glossary/distributed-tracing.md) - Per-request path analysis complementing aggregate metrics
- [TimescaleDB](@/glossary/timescaledb.md) - Time-series database for metric storage and analysis
- [QDP](@/glossary/qdp.md) - Quality debt tracked as a key platform metric
- [Autoheal](@/glossary/autoheal.md) - Healing operations triggered by metric anomalies
- [Autoevolve](@/glossary/autoevolve.md) - Evolution triggered by quality metric trends
- [Broadway](@/glossary/broadway.md) - Pipeline with built-in throughput and latency metrics
- [PostgreSQL](@/glossary/postgresql.md) - Database with query performance metrics via Ecto telemetry
- [Cluster](@/glossary/cluster.md) - Per-node metrics in distributed BEAM deployments

## See Also

- [Architecture](@/architecture/_index.md) - Platform metrics and monitoring architecture
- [Technologies](@/technologies/_index.md) - Telemetry.Metrics and Prometheus integration
- [Capabilities](@/capabilities/_index.md) - Quality monitoring and self-healing capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)