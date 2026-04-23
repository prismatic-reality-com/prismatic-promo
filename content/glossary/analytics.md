+++
title = "Analytics"
weight = 50

[extra]
description = "The systematic computational analysis of data to discover patterns, derive actionable insights, measure system performance, and support evidence-based decision-making across operational, tactical, and strategic domains"
category = "technology"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "data-engineering"
related_concepts = ["telemetry", "monitoring", "metrics", "data-pipeline", "observability"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 6
prerequisites = ["data-pipeline", "metrics", "statistical-methods"]
learning_path = "data-engineering"
interactive_demos = ["/labs/glossary/analytics"]
code_examples = ["PrismaticAnalytics.aggregate/3", ":telemetry.execute/3", "PrismaticQuality.Metrics.compute/2"]
external_resources = ["Telemetry Library Documentation", "Phoenix LiveDashboard", "Grafana Documentation"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["metric-aggregation-accuracy", "telemetry-event-completeness", "dashboard-latency-compliance", "trend-detection-sensitivity"]
keywords = ["analytics", "data analysis", "telemetry", "metrics", "observability", "dashboards", "insights"]
tags = ["analytics", "telemetry", "monitoring", "metrics", "data", "observability", "dashboards", "quality"]
related_terms = ["telemetry", "monitoring", "metrics", "data-pipeline", "observability", "dashboard", "quality-gates", "performance-tracking"]
word_count = 1725
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Analytics - Prismatic Platform"
+++

## Definition

Analytics is the discipline of systematically collecting, processing, and interpreting data to discover meaningful patterns, quantify system behavior, and derive actionable insights that support evidence-based decision-making. In software engineering contexts, analytics encompasses application telemetry, performance metrics, quality measurements, user behavior analysis, and operational intelligence. Within the Prismatic Platform, analytics operates as a foundational infrastructure layer that feeds data into the 13 quality domains, powers real-time dashboards, drives the autonomous evolution system, and provides the empirical evidence base required by the NABLA Infinity epistemic framework.

## Overview

The origins of analytics as a formal discipline trace back to the early statistical methods of the 18th and 19th centuries, when pioneers like Pierre-Simon Laplace, Carl Friedrich Gauss, and Florence Nightingale demonstrated the power of systematic data analysis to reveal hidden patterns and inform decisions. The term "analytics" in its modern computational sense emerged in the 1960s with the development of decision support systems, and gained widespread adoption in the 2000s with the rise of "big data" and the democratization of data processing tools.

The evolution of analytics in software engineering has progressed through several distinct eras:

| Era | Period | Characteristic | Key Technology |
|-----|--------|---------------|----------------|
| **Log Analysis** | 1970s-1990s | Grep through text logs | syslog, custom log parsers |
| **APM Emergence** | 2000s | Application Performance Monitoring | New Relic, AppDynamics |
| **Big Data Analytics** | 2010-2015 | Distributed processing at scale | Hadoop, Spark, Kafka |
| **Observability** | 2015-2020 | Three pillars: logs, metrics, traces | Prometheus, Grafana, Jaeger |
| **AI-Enhanced Analytics** | 2020-present | Automated anomaly detection, predictive insights | ML-powered observability, AIOps |
| **Epistemic Analytics** | 2024-present | Evidence-based with formal verification | Prismatic NABLA, Trinity Gate |

The distinction between traditional analytics and the Prismatic Platform's approach is foundational. Traditional analytics treats data as neutral information to be processed. The platform's epistemic analytics approach, grounded in NABLA Infinity, treats every data point as evidence that must satisfy provenance requirements, signal plurality checks, and contradiction preservation. This elevates analytics from a reporting function to an epistemological discipline.

Analytics can be classified into four progressive levels of sophistication:

| Level | Type | Question Answered | Technique | Example |
|-------|------|-------------------|-----------|---------|
| **Descriptive** | What happened? | Aggregation, visualization | "Quality score dropped to 98/100" |
| **Diagnostic** | Why did it happen? | Root cause analysis, correlation | "Three modules have new Credo violations" |
| **Predictive** | What will happen? | Trend analysis, forecasting | "At current drift rate, quality will reach 95 in 3 weeks" |
| **Prescriptive** | What should we do? | Optimization, recommendation | "Run autoevolve on prismatic_web to fix the drift" |

The significance of analytics in the Prismatic Platform is elevated by the platform's NO MERCY/NO DOUBTS doctrine, which demands that every quality claim be backed by measured evidence. The 100/100 quality score is not an aspiration but a measured, continuously verified fact produced by the analytics infrastructure.

## Technical Details

### Telemetry Architecture

The BEAM virtual machine and Elixir's `:telemetry` library provide the foundation for the platform's analytics infrastructure. Telemetry events are lightweight, in-process measurements that carry structured data without the overhead of external instrumentation:

```
Telemetry Event Flow:
Source (instrumented code)
  │
  ├─ :telemetry.execute/3  (emits event)
  │
  ├─ Handler 1: Metrics aggregation (ETS counters)
  ├─ Handler 2: LiveDashboard streaming (Phoenix PubSub)
  ├─ Handler 3: Prometheus export (HTTP /metrics endpoint)
  └─ Handler 4: Quality DNA persistence (disk)
```

### Metric Types

The platform collects four fundamental metric types aligned with the Prometheus data model:

| Type | Description | Example | Storage |
|------|-------------|---------|---------|
| **Counter** | Monotonically increasing value | Total HTTP requests served | ETS atomic counter |
| **Gauge** | Point-in-time measurement | Current memory usage in bytes | ETS gauge |
| **Histogram** | Distribution of values | Request latency percentiles | ETS histogram buckets |
| **Summary** | Pre-computed quantiles | P50/P95/P99 response times | Rolling window calculation |

### Analytics Pipeline Stages

Data flows through a structured pipeline from raw event to actionable insight:

```
Stage 1: Collection
├── Application telemetry events
├── BEAM VM metrics (memory, processes, schedulers)
├── OS-level metrics (CPU, disk, network)
├── Business events (agent decisions, quality gate results)
└── External source data (OSINT results, API responses)

Stage 2: Processing
├── Event normalization (consistent schemas)
├── Aggregation (time-windowed rollups)
├── Enrichment (adding context, labels)
├── Correlation (linking related events)
└── Anomaly detection (statistical outlier identification)

Stage 3: Storage
├── Hot storage: ETS tables (real-time, in-memory)
├── Warm storage: PostgreSQL (queryable, indexed)
├── Cold storage: TimescaleDB (time-series, compressed)
└── Graph storage: KuzuDB (relationship analytics)

Stage 4: Presentation
├── LiveView dashboards (real-time streaming)
├── Quality DNA reports (cross-session continuity)
├── Agent intelligence feeds (decision support)
└── API endpoints (programmatic access)
```

### Statistical Methods

The platform employs several statistical methods for analytics processing:

| Method | Purpose | Application |
|--------|---------|-------------|
| **Exponential Moving Average** | Smooth noisy time series | Performance trend detection |
| **Standard Deviation** | Measure variability | Anomaly detection thresholds |
| **Percentile Computation** | Characterize distributions | P50/P95/P99 latency reporting |
| **Linear Regression** | Identify trends | Quality score trajectory prediction |
| **Correlation Analysis** | Discover relationships | Module coupling detection |
| **Change Point Detection** | Identify regime shifts | Deployment impact assessment |

## Implementation in Prismatic Platform

### Telemetry Event System

The platform instruments all critical operations with structured telemetry events:

```elixir
defmodule PrismaticAnalytics.Telemetry do
  @moduledoc """
  Central telemetry configuration for the Prismatic Platform.
  Defines event handlers, metric definitions, and aggregation
  rules for all platform analytics.
  """

  @spec setup() :: :ok
  def setup do
    events = [
      # Quality domain events
      [:prismatic, :quality, :gate, :evaluate],
      [:prismatic, :quality, :score, :compute],
      [:prismatic, :quality, :violation, :detect],

      # Agent events
      [:prismatic, :agent, :invoke, :start],
      [:prismatic, :agent, :invoke, :stop],
      [:prismatic, :agent, :invoke, :exception],

      # OSINT events
      [:prismatic, :osint, :query, :start],
      [:prismatic, :osint, :query, :stop],

      # Web events
      [:prismatic, :web, :request, :start],
      [:prismatic, :web, :request, :stop],
      [:prismatic, :web, :live_view, :mount],
      [:prismatic, :web, :live_view, :handle_event]
    ]

    :telemetry.attach_many(
      "prismatic-analytics",
      events,
      &handle_event/4,
      %{}
    )
  end

  @spec handle_event([atom()], map(), map(), map()) :: :ok
  def handle_event(event, measurements, metadata, _config) do
    PrismaticAnalytics.MetricStore.record(event, measurements, metadata)
    PrismaticAnalytics.StreamProcessor.process(event, measurements, metadata)
    :ok
  end
end
```

### Quality Metrics Computation

The platform's 13 quality domains each produce measurable metrics that feed the analytics system:

```elixir
defmodule PrismaticAnalytics.QualityMetrics do
  @moduledoc """
  Computes and tracks quality metrics across all 13 quality domains.
  Provides real-time quality scoring, trend analysis, and
  regression detection for the platform's 100/100 quality standard.
  """

  @quality_domains [
    :dialyzer, :credo, :compilation, :datetime_precision,
    :guard_functions, :impl_coverage, :memory_safety,
    :performance, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @spec compute_platform_score() :: {:ok, map()} | {:error, term()}
  def compute_platform_score do
    domain_scores =
      @quality_domains
      |> Task.async_stream(fn domain ->
        {domain, evaluate_domain(domain)}
      end, timeout: 60_000)
      |> Enum.map(fn {:ok, result} -> result end)
      |> Map.new()

    total_violations =
      domain_scores
      |> Map.values()
      |> Enum.sum()

    score = if total_violations == 0, do: 100, else: max(0, 100 - total_violations)

    {:ok, %{
      score: score,
      domain_scores: domain_scores,
      total_violations: total_violations,
      timestamp: DateTime.utc_now(),
      domains_passing: Enum.count(domain_scores, fn {_, v} -> v == 0 end),
      domains_total: length(@quality_domains)
    }}
  end

  @spec trend_analysis(integer()) :: {:ok, map()} | {:error, term()}
  def trend_analysis(days \\ 30) do
    with {:ok, history} <- load_score_history(days) do
      {:ok, %{
        current: List.last(history),
        average: compute_average(history),
        trend: compute_trend_direction(history),
        min: Enum.min_by(history, & &1.score),
        max: Enum.max_by(history, & &1.score),
        volatility: compute_volatility(history)
      }}
    end
  end
end
```

### Performance Analytics

The platform enforces strict performance budgets and tracks compliance through analytics:

```elixir
defmodule PrismaticAnalytics.PerformanceTracker do
  @moduledoc """
  Tracks and enforces performance budgets across all platform endpoints.
  Monitors P50/P95/P99 latencies, throughput, and error rates.
  Triggers alerts when performance degrades beyond thresholds.
  """

  @performance_budgets %{
    page_load: 250,          # ms - total page load
    server_render: 100,      # ms - server-side render
    live_view_mount: 150,    # ms - LiveView mount
    live_view_event: 50,     # ms - LiveView handle_event
    health_check: 10,        # ms - health endpoint
    api_response: 200        # ms - API endpoint response
  }

  @spec check_compliance() :: {:ok, map()} | {:error, map()}
  def check_compliance do
    results =
      @performance_budgets
      |> Enum.map(fn {endpoint, budget_ms} ->
        metrics = get_endpoint_metrics(endpoint)
        compliant = metrics.p95 <= budget_ms

        {endpoint, %{
          budget_ms: budget_ms,
          p50: metrics.p50,
          p95: metrics.p95,
          p99: metrics.p99,
          compliant: compliant,
          headroom_pct: Float.round((budget_ms - metrics.p95) / budget_ms * 100, 1)
        }}
      end)
      |> Map.new()

    all_compliant = Enum.all?(results, fn {_, v} -> v.compliant end)

    if all_compliant do
      {:ok, results}
    else
      {:error, results}
    end
  end
end
```

### Agent Analytics

The 530+ AIAD agents generate rich analytics data about their decision-making and performance:

```elixir
defmodule PrismaticAnalytics.AgentMetrics do
  @moduledoc """
  Aggregates and analyzes metrics from the platform's 530+ AIAD agents.
  Tracks invocation counts, success rates, latency distributions,
  and decision quality indicators per agent and across the fleet.
  """

  @spec fleet_summary() :: {:ok, map()}
  def fleet_summary do
    {:ok, %{
      total_agents: 530,
      active_agents: count_active_agents(),
      total_invocations_24h: count_invocations(hours: 24),
      success_rate_24h: compute_success_rate(hours: 24),
      avg_latency_ms: compute_avg_latency(hours: 24),
      top_agents_by_usage: top_agents(limit: 10),
      error_hotspots: identify_error_hotspots(hours: 24),
      domain_distribution: agents_by_domain()
    }}
  end
end
```

## Comparison with Alternatives

| Solution | Real-time | Elixir Native | Quality Integration | Graph Analytics | Cost | Complexity |
|----------|-----------|--------------|--------------------|--------------  |------|------------|
| **Prismatic Analytics** | Yes (LiveView) | Yes (:telemetry) | Deep (13 domains) | Yes (KuzuDB) | Included | Medium |
| **Datadog** | Yes | Plugin | None | Limited | Very high | Low |
| **Grafana + Prometheus** | Yes | Exporter needed | None | No | Free/Paid | Medium |
| **New Relic** | Yes | Agent needed | None | No | High | Low |
| **Splunk** | Yes | Forwarder needed | None | No | Very high | High |
| **ELK Stack** | Near-real-time | Filebeat needed | None | No | Free/Paid | High |
| **Phoenix LiveDashboard** | Yes | Native | Basic | No | Free | Very low |
| **Custom Telemetry** | Yes | Native | Custom | Custom | Free | Very high |

The Prismatic approach integrates analytics deeply with the platform's quality system, epistemic framework, and agent infrastructure. Unlike external analytics tools that observe the system from outside, Prismatic Analytics is woven into the system's operational fabric, enabling analytics-driven decision-making at every layer.

## Best Practices

1. **Instrument at the domain boundary, not inside hot loops**: Place telemetry events at meaningful business and operational boundaries (request start/stop, agent invocation, quality gate evaluation) rather than inside tight loops. Over-instrumentation creates measurement overhead that skews the very metrics being collected.

2. **Define metric semantics before implementation**: Before adding a new metric, document precisely what it measures, its unit, its aggregation method, and how it should be interpreted. Ambiguous metrics lead to incorrect decisions. Use the RED method (Rate, Errors, Duration) for service metrics and USE method (Utilization, Saturation, Errors) for resource metrics.

3. **Use histograms instead of averages for latency**: Averages hide distribution shape and outliers. A service with 50ms average latency might have a P99 of 5 seconds. Always report percentiles (P50, P95, P99) and use histogram metrics that preserve distribution information.

4. **Implement analytics-driven quality gates**: Connect analytics directly to deployment decisions. If P95 latency exceeds the 250ms budget, block the deployment. If quality score drops below 100, block the commit. Analytics without enforcement is merely observational; analytics with enforcement is operational.

5. **Separate collection from analysis**: Design the analytics pipeline so that data collection is independent of data analysis. This enables retroactive analysis of historical data with new analytical methods and prevents analysis failures from disrupting data collection.

6. **Retain raw events alongside aggregates**: Aggregated metrics are efficient for dashboards but insufficient for root cause analysis. Retain raw telemetry events with configurable retention policies (hot: 24 hours, warm: 30 days, cold: 1 year) to enable drill-down investigation.

7. **Correlate metrics across system layers**: A latency spike in the web layer may originate from a database query, an external API call, or resource contention. Cross-layer correlation (using request IDs, trace IDs, or temporal alignment) enables rapid root cause identification across the platform's 115 umbrella apps.

## Common Pitfalls

- **Alert fatigue from poorly tuned thresholds**: Setting alert thresholds too aggressively generates noise that desensitizes operators. Use statistical methods (dynamic baselines, anomaly detection) rather than static thresholds, and ensure every alert has a clear remediation path.

- **Measuring vanity metrics instead of actionable ones**: Tracking total lines of code, number of commits, or raw test counts provides no actionable insight. Focus on metrics that drive decisions: quality score trajectory, P95 latency trends, agent success rates, and violation counts per domain.

- **Ignoring cardinality explosions**: Adding high-cardinality labels to metrics (user IDs, request UUIDs, full URLs) can overwhelm metric storage systems. Design label sets carefully, using bounded enumeration values (status codes, endpoint names, agent types) rather than unbounded identifiers.

- **Treating analytics as a separate concern**: Analytics that are bolted on after development are incomplete and fragile. Instrument analytics during development, include metric assertions in tests, and treat telemetry code as production code with the same quality standards.

- **Confusing correlation with causation**: Analytics reveals correlations between metrics, but correlation does not establish causation. A quality score drop correlated with a deployment does not prove the deployment caused the drop. Use controlled experiments, A/B testing, or causal inference methods to establish causality.

- **Neglecting analytics pipeline reliability**: If the analytics pipeline fails silently, operators lose visibility at exactly the moment they need it most (during incidents). Monitor the monitoring system itself, implement heartbeat checks, and design for graceful degradation when analytics components fail.

## Use Cases

### Quality DNA Cross-Session Continuity

The Quality DNA system uses analytics to maintain quality state across sessions. Each session records the quality score at start and end, violations found and fixed, and the trajectory of quality metrics over time. This creates a continuous quality narrative that persists beyond individual developer sessions, enabling the platform's autonomous evolution system to identify and address quality drift patterns that span multiple sessions.

### Performance Budget Enforcement

Every page in the platform has a strict 250ms total load time budget and 100ms server-side render budget. The analytics system continuously monitors P95 latency for all endpoints, compares against budgets, and blocks deployments that would violate performance constraints. Historical performance data enables trend analysis that predicts future budget violations before they occur, enabling proactive optimization.

### OSINT Intelligence Quality Assessment

The 120 OSINT tools generate intelligence data of varying quality and timeliness. Analytics tracks source reliability metrics (response time, data freshness, error rates), coverage metrics (which entities are covered by which sources), and quality metrics (data completeness, accuracy against ground truth). These analytics inform source selection decisions and highlight when a source's quality degrades below useful thresholds.

### Agent Fleet Health Monitoring

With 530+ agents operating across the platform, fleet-level analytics provides essential visibility into agent ecosystem health. Metrics include invocation frequency distributions (identifying over/under-utilized agents), success rate trends (detecting degrading agents), latency patterns (finding performance bottlenecks), and error clustering (identifying systemic issues affecting multiple agents). The agent fleet dashboard enables the supreme coordinator to make informed orchestration decisions.

## Related Concepts

- [Telemetry](/glossary/telemetry/) - The foundational event-emission system that provides raw data for analytics processing
- [Monitoring](/glossary/monitoring/) - Real-time observation of system health metrics that analytics infrastructure enables
- [Metrics](/glossary/metrics/) - Quantified measurements that serve as the atomic data elements of analytics
- [Data Pipeline](/glossary/data-pipeline/) - Structured data flow architecture that moves analytics data from collection through processing to storage
- [Observability](/glossary/observability/) - The broader discipline of understanding system behavior through external outputs, of which analytics is a core component
- [Dashboard](/glossary/dashboard/) - Visual presentation layer that renders analytics data as interactive real-time displays
- [Quality Gates](/glossary/quality-gates/) - Automated enforcement checkpoints powered by analytics measurements
- [Performance Tracking](/glossary/performance-tracking/) - Specialized analytics focused on system latency, throughput, and resource utilization

## See Also

- [Prismatic Analytics App](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_analytics) - Core analytics infrastructure
- [Prismatic Safety App](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_safety) - Quality floor guardian with analytics-driven monitoring
- [Phoenix LiveDashboard](https://hexdocs.pm/phoenix_live_dashboard) - Real-time BEAM metrics dashboard
- [Telemetry Library](https://hexdocs.pm/telemetry) - Elixir telemetry event system documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
