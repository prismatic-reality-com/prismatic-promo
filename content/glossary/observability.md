+++
title = "Observability"
weight = 18
[extra]
category = "quality"
description = "Ability to understand a system's internal state from its external outputs and telemetry"
related_terms = ["structured-logging", "distributed-tracing", "metrics", "observability"]
acronym = ""
technical_domain = "Operations & Monitoring"
complexity_level = "Advanced"
platform_relevance = "Critical"
elixir_libraries = ["telemetry", "telemetry_metrics", "telemetry_poller", "logger"]
phoenix_integration = "Full - endpoint telemetry, LiveView instrumentation, Ecto query metrics"
beam_specific = true
prismatic_modules = ["PrismaticSafety.QualityFloorGuardian", "PrismaticClaude.SessionLifecycle"]
quality_domains_monitored = 13
current_qdp = 0
quality_score = "100/100"
maturity_level = "L5 - Self-Healing Observability"
industry_standard = "OpenTelemetry, Prometheus, Grafana"
first_introduced = "Gen 1"
last_updated = "2026-02-22"
tags = ["observability", "telemetry", "monitoring", "metrics", "logging", "tracing", "quality", "operations"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1671
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Observability", "Ability", "glossary", "quality", "Prismatic Platform", "Missing", "BEAM", "Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Observability - Prismatic Platform"
+++

## Definition

Observability is the degree to which a system's internal state can be inferred from its external outputs. Originating from control theory, where Rudolf Kalman formalized the concept in 1960 for linear dynamical systems, the term was adopted by software engineering to describe systems that emit sufficient telemetry data to enable operators to diagnose novel, previously unseen problems without deploying new instrumentation. An observable system does not merely report known failure modes; it provides the raw data necessary to investigate unknown failure modes, performance anomalies, and emergent behaviors that were not anticipated during design. The distinction between observability and monitoring is not one of degree but of kind: monitoring asks known questions about a system ("is CPU above 90%?"), while observability provides the data and tools to ask arbitrary questions that were never predefined.

The three pillars of observability are [metrics](/glossary/metrics/) (numeric measurements aggregated over time), [structured logs](/glossary/structured-logging/) (discrete event records with machine-parseable metadata), and [distributed traces](/glossary/distributed-tracing/) (request flow graphs across services and processes). Each pillar provides a different lens through which to understand system behavior: metrics answer "what is happening at an aggregate level," logs answer "what happened in this specific event," and traces answer "what was the complete path of this specific request." Together, they enable operators to navigate from high-level anomaly detection (metrics alerting on elevated error rates) to specific diagnosis (traces showing which service is slow) to root cause analysis (logs revealing the exact error in the failing component). Modern observability practice increasingly recognizes a fourth dimension -- profiling -- which provides continuous runtime sampling of CPU, memory, and allocation behavior, bridging the gap between aggregate metrics and individual event traces.

In complex distributed systems like the Prismatic Platform, the space of possible failure modes is combinatorially explosive and cannot be enumerated in advance. A platform with 115 umbrella applications, 530 AIAD agents, distributed [BEAM](/glossary/beam/) clustering, multiple storage backends ([ETS](/glossary/ets/), [Ecto](/glossary/ecto/)/PostgreSQL, Meilisearch, KuzuDB), and real-time [LiveView](/glossary/liveview/) dashboards creates an enormous state space where failures can emerge from interactions between components that function correctly in isolation. Observability provides the general-purpose diagnostic capability needed to navigate this complexity without predicting every possible failure scenario.

## The Three Pillars

| Pillar | Data Type | Granularity | Storage Cost | Best For |
|--------|----------|-------------|-------------|---------|
| **[Metrics](/glossary/metrics/)** | Numeric time series (counters, gauges, histograms) | Aggregated | Low | Alerting, dashboards, trend analysis, capacity planning |
| **[Structured Logs](/glossary/structured-logging/)** | Discrete event records (JSON/key-value) | Per-event | Medium | Event investigation, audit trails, debugging specific occurrences |
| **[Distributed Traces](/glossary/distributed-tracing/)** | Span trees with timing and metadata | Per-request | High | Request path analysis, latency debugging, dependency mapping |

### How the Pillars Connect

The true power of observability emerges when the three pillars are correlated. A metric anomaly directs attention, logs provide context for the anomaly, and traces reveal the causal chain across service boundaries:

```
Alert: Error rate spike (METRIC)
    |
    v
Filter: errors in last 5 minutes (LOGS)
    |
    v
Inspect: trace_id from error log entry (TRACE)
    |
    v
Diagnose: slow database span in trace tree
    |
    v
Root Cause: missing index on assets table
```

The correlation mechanism depends on shared identifiers -- a `trace_id` or `request_id` that appears in metrics labels, log entries, and trace spans simultaneously. Without these correlation identifiers, each pillar operates in isolation, dramatically increasing the time required to diagnose cross-cutting issues.

## Elixir Telemetry Foundation

The Elixir ecosystem's observability story is built on the `:telemetry` library, which provides a lightweight, low-overhead event dispatch mechanism. Unlike traditional logging frameworks that impose string formatting costs regardless of whether anyone is listening, `:telemetry` uses an attach-then-emit pattern where events are only processed when handlers are registered, making uninstrumented code paths effectively free:

```elixir
defmodule PrismaticStorage.InstrumentedAdapter do
  @moduledoc """
  Storage adapter wrapper that emits telemetry events for every
  query operation, enabling observability across all storage backends.
  """

  @spec query(module(), map()) :: {:ok, term()} | {:error, term()}
  def query(adapter, query_spec) do
    start_time = System.monotonic_time()
    start_metadata = %{adapter: adapter.name(), query: query_spec.type}

    :telemetry.execute(
      [:prismatic, :storage, :query, :start],
      %{system_time: System.system_time()},
      start_metadata
    )

    result = adapter.execute(query_spec)

    duration = System.monotonic_time() - start_time
    result_status = elem(result, 0)

    :telemetry.execute(
      [:prismatic, :storage, :query, :stop],
      %{duration: duration},
      Map.merge(start_metadata, %{result: result_status})
    )

    result
  end
end
```

The handler attachment side decouples instrumentation from consumption, allowing different environments to route telemetry to different backends:

```elixir
defmodule PrismaticTelemetry.Setup do
  @moduledoc """
  Telemetry handler registration for the Prismatic Platform.
  Configures metric collection, structured logging, and trace propagation.
  """

  @spec setup() :: :ok
  def setup do
    events = [
      [:prismatic, :storage, :query, :stop],
      [:prismatic, :agent, :execute, :stop],
      [:prismatic, :quality, :check, :stop],
      [:prismatic, :api, :dispatch, :stop],
      [:prismatic, :session, :lifecycle, :stop]
    ]

    :telemetry.attach_many(
      "prismatic-observability",
      events,
      &handle_event/4,
      %{metrics_backend: :prometheus, log_level: :info}
    )

    :ok
  end

  defp handle_event(event_name, measurements, metadata, config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    # Route to metrics system
    PrismaticTelemetry.MetricsCollector.record(
      event_name,
      %{duration_ms: duration_ms},
      metadata
    )

    # Route to structured logging with correlation
    Logger.info("Telemetry event",
      event: inspect(event_name),
      duration_ms: duration_ms,
      metadata: metadata,
      trace_id: Logger.metadata()[:trace_id]
    )
  end
end
```

## Telemetry Metrics and Reporters

The `telemetry_metrics` library provides a declarative way to define metrics derived from telemetry events. Rather than manually computing counters and histograms in event handlers, metrics are declared as data structures and consumed by reporter backends:

```elixir
defmodule PrismaticTelemetry.Metrics do
  @moduledoc """
  Declarative metric definitions for the Prismatic Platform.
  Metrics are derived from telemetry events and reported to
  configured backends (Prometheus, StatsD, console).
  """

  import Telemetry.Metrics

  @spec metrics() :: list(Telemetry.Metrics.t())
  def metrics do
    [
      # Counter: total number of storage queries
      counter("prismatic.storage.query.stop.duration",
        tags: [:adapter, :query, :result],
        description: "Total storage queries by adapter and result"
      ),

      # Distribution: query latency histogram
      distribution("prismatic.storage.query.stop.duration",
        unit: {:native, :millisecond},
        tags: [:adapter],
        reporter_options: [buckets: [10, 50, 100, 250, 500, 1000]],
        description: "Storage query latency distribution"
      ),

      # Summary: agent execution time
      summary("prismatic.agent.execute.stop.duration",
        unit: {:native, :millisecond},
        tags: [:agent_type],
        description: "Agent execution time summary"
      ),

      # Last value: current quality score
      last_value("prismatic.quality.check.stop.score",
        description: "Current quality score across all domains"
      ),

      # Counter: API dispatch operations
      counter("prismatic.api.dispatch.stop.duration",
        tags: [:app, :action, :status],
        description: "API dispatch operations by endpoint and status"
      )
    ]
  end
end
```

The `telemetry_poller` library complements event-driven metrics with periodic polling for system-level measurements that do not naturally occur as events:

```elixir
defmodule PrismaticTelemetry.Poller do
  @moduledoc """
  Periodic telemetry measurements for VM and system metrics.
  """

  @spec child_spec(keyword()) :: Supervisor.child_spec()
  def child_spec(opts) do
    :telemetry_poller.child_spec(
      measurements: [
        {:process_info, event: [:prismatic, :vm, :process_info], name: self()},
        {__MODULE__, :measure_quality_score, []},
        {__MODULE__, :measure_agent_pool, []}
      ],
      period: Keyword.get(opts, :period, :timer.seconds(15))
    )
  end

  @spec measure_quality_score() :: :ok
  def measure_quality_score do
    case PrismaticSafety.QualityFloorGuardian.current_score() do
      {:ok, score} ->
        :telemetry.execute(
          [:prismatic, :quality, :score],
          %{value: score},
          %{source: :quality_floor_guardian}
        )

      {:error, _reason} ->
        :ok
    end
  end

  @spec measure_agent_pool() :: :ok
  def measure_agent_pool do
    :telemetry.execute(
      [:prismatic, :agents, :pool],
      %{active: PrismaticAgents.active_count(), total: PrismaticAgents.total_count()},
      %{}
    )
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform achieves deep observability through a multi-layered instrumentation strategy that goes beyond traditional three-pillar observability into self-healing and epistemic dimensions:

- **Telemetry Events**: Every significant operation emits telemetry events under the `[:prismatic_*, ...]` namespace. Agent execution, storage adapter calls, quality gate checks, API dispatch, and session lifecycle hooks all produce telemetry data. The platform registers over 50 distinct telemetry event types across its 115 umbrella applications.

- **Quality Floor Guardian**: An autonomous monitoring system that continuously tracks 13 quality domains (Dialyzer, Credo, compilation, typespecs, memory safety, performance, and more). The Guardian detects quality score degradation and triggers automatic evolution before issues impact the platform. It operates as a GenServer with periodic polling, maintaining historical quality snapshots for trend analysis.

- **Quality DNA**: A cross-session persistence system that stores quality metric snapshots across sessions in `.claude/quality-dna/current-state.json`. This enables trend analysis of compilation warnings, Credo violations, Dialyzer issues, and test pass rates over the platform's complete operational history -- providing observability not just into the current state but into the trajectory of quality over time.

- **13 Quality Domains**: Each domain is a named metric with continuous monitoring:

| Domain | Metric | Current Status |
|--------|--------|---------------|
| Dialyzer | Type violation count | 0 (perfect) |
| Credo | Style/complexity violation count | 0 (perfect) |
| Compilation | Warning count | 0 (perfect) |
| DateTime Precision | Time handling violation count | 0 (perfect) |
| Guard Functions | Missing guard count | 0 (perfect) |
| @impl Coverage | Missing annotation count | 0 (perfect) |
| Memory Safety | Leak risk count | 0 (perfect) |
| Performance | Anti-pattern count | 0 (perfect) |
| Regression Prevention | Missing test count | 0 (perfect) |
| Timing Patterns | Process.sleep count | 0 (perfect) |
| TODO Management | Outstanding TODO count | 0 (perfect) |
| Typespec Coverage | Missing @spec count | 0 (perfect) |
| Unsafe Map Access | map.key usage count | 0 (perfect) |

- **Session Lifecycle Telemetry**: The SessionLifecycle GenServer emits events at `[:prismatic_claude, :session_lifecycle, *]`, providing visibility into session start, hook execution timing, circuit breaker state, and session end operations. This creates observability into the development process itself.

- **[NABLA](/glossary/nabla-infinity/) Epistemic Observability**: The epistemic framework provides observability into the platform's reasoning processes -- [belief graph](/glossary/belief-graph/) state, [confidence scores](/glossary/confidence-scoring/), [Trinity Gate](/glossary/trinity-gate/) verdicts, and axiom compliance. This is a unique dimension of observability that monitors not just system health but reasoning integrity.

## Observability Maturity Model

Organizations progress through observability maturity levels, each building on the capabilities of the previous level:

| Level | Description | Capabilities | Prismatic Status |
|-------|-------------|-------------|-----------------|
| **L0: Unobservable** | No instrumentation, debugging by printf/logs-only | SSH into servers, read log files | N/A |
| **L1: Basic Monitoring** | Health checks, uptime monitoring, basic alerts | Ping checks, uptime dashboards | Exceeded |
| **L2: Metric Alerting** | Threshold-based alerts on key metrics | Grafana dashboards, PagerDuty integration | Exceeded |
| **L3: Structured Observability** | Three pillars implemented, correlation possible | Cross-pillar investigation, trace-log correlation | Current |
| **L4: Predictive Observability** | Anomaly detection, trend-based alerting, SLO tracking | Quality Floor Guardian, trend analysis | Active |
| **L5: Self-Healing Observability** | Automatic remediation based on observed state | Autoheal/Autoevolve, Quality DNA | Active |

The Prismatic Platform operates primarily at L4-L5, where observability data feeds directly into automated remediation systems. The Quality Floor Guardian detects quality regression and triggers [autoheal](/glossary/autoheal/) cycles, while the [autoevolve](/glossary/autoevolve/) system uses quality trend data to drive autonomous platform improvement. This closed-loop approach transforms observability from a passive diagnostic tool into an active quality enforcement mechanism.

## Observability vs. Monitoring

| Aspect | Observability | Monitoring |
|--------|--------------|-----------|
| **Approach** | Explore unknown unknowns | Check known conditions |
| **Data Model** | Rich, high-cardinality telemetry | Predefined metrics and thresholds |
| **Query Pattern** | Ad-hoc investigation | Predefined dashboards and alerts |
| **Failure Modes** | Handles novel, unanticipated failures | Detects anticipated failure modes |
| **Cost** | Higher (more data, more storage) | Lower (focused data collection) |
| **Value** | Diagnose problems never seen before | Detect known problems quickly |
| **Instrumentation** | Built into code from the start | Added after deployment |
| **Cardinality** | High (unique request IDs, user IDs, trace IDs) | Low (predefined label sets) |
| **Time to Diagnosis** | Minutes (with proper tooling) | Varies (depends on alert precision) |

## Distributed Observability in BEAM Clusters

The BEAM virtual machine provides unique observability capabilities that are unavailable in most runtime environments. Because every concurrent unit of execution is a lightweight process with its own mailbox, heap, and garbage collector, the BEAM exposes per-process observability primitives that enable extraordinarily fine-grained diagnosis:

```elixir
defmodule PrismaticObservability.ProcessInspector do
  @moduledoc """
  BEAM-native process observability for diagnosing per-process
  resource consumption, mailbox backlogs, and memory pressure.
  """

  @spec inspect_process(pid()) :: {:ok, map()} | {:error, :not_found}
  def inspect_process(pid) when is_pid(pid) do
    case Process.info(pid, [
      :registered_name, :current_function, :message_queue_len,
      :heap_size, :total_heap_size, :reductions, :status
    ]) do
      nil ->
        {:error, :not_found}

      info ->
        {:ok, %{
          name: Keyword.get(info, :registered_name),
          function: Keyword.get(info, :current_function),
          mailbox_size: Keyword.get(info, :message_queue_len),
          heap_words: Keyword.get(info, :heap_size),
          total_heap_words: Keyword.get(info, :total_heap_size),
          reductions: Keyword.get(info, :reductions),
          status: Keyword.get(info, :status)
        }}
    end
  end

  @spec detect_mailbox_backlogs(non_neg_integer()) :: list(map())
  def detect_mailbox_backlogs(threshold \\ 1000) do
    Process.list()
    |> Enum.filter(fn pid ->
      case Process.info(pid, :message_queue_len) do
        {:message_queue_len, len} -> len > threshold
        nil -> false
      end
    end)
    |> Enum.map(fn pid ->
      {:ok, info} = inspect_process(pid)
      info
    end)
  end
end
```

In a [clustered](/glossary/cluster/) BEAM deployment, observability must span multiple nodes. The Prismatic Platform uses distributed telemetry aggregation where each node emits telemetry events locally, and a centralized collector aggregates metrics across the cluster. The `:pg` process group module enables cluster-wide process discovery, allowing observability tools to query any node's process state from any other node.

## OpenTelemetry Integration

The OpenTelemetry project provides vendor-neutral observability APIs and SDKs. The Elixir ecosystem integrates through the `opentelemetry_api` and `opentelemetry` packages, which map naturally to the `:telemetry` event system:

```elixir
defmodule PrismaticTelemetry.OpenTelemetryBridge do
  @moduledoc """
  Bridges Elixir :telemetry events to OpenTelemetry spans,
  enabling export to any OTel-compatible backend.
  """

  require OpenTelemetry.Tracer, as: Tracer

  @spec handle_query_event(list(), map(), map(), term()) :: :ok
  def handle_query_event(
    [:prismatic, :storage, :query, :stop],
    %{duration: duration},
    %{adapter: adapter, query: query_type, result: result},
    _config
  ) do
    Tracer.with_span "storage.query" do
      Tracer.set_attributes([
        {"db.system", to_string(adapter)},
        {"db.operation", to_string(query_type)},
        {"db.result", to_string(result)},
        {"db.duration_ms", System.convert_time_unit(duration, :native, :millisecond)}
      ])
    end

    :ok
  end
end
```

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Metrics without context** | Alert fires but no way to investigate | Include trace_id in metric labels; link to logs |
| **Logs without correlation** | Cannot reconstruct request flow | Add request_id and trace_id to all log entries |
| **Traces without metrics** | No aggregate view of system health | Derive metrics from trace data (request count, latency) |
| **Alert fatigue** | Too many alerts, real issues ignored | Use multi-signal alerting; suppress noisy alerts |
| **Observability as afterthought** | Instrumentation added only after incidents | Build observability into every new component from day one |
| **High cardinality explosion** | Unbounded label values exhaust storage | Use bounded cardinality for metric labels; move high-cardinality data to logs |
| **Missing baselines** | Cannot distinguish anomaly from normal | Establish baseline metrics before deploying changes |
| **Sampling bias** | Head-based sampling misses rare errors | Use tail-based sampling that preserves error traces |

## Cost Management

Observability data volume grows with system complexity. Effective cost management strategies include:

| Strategy | Mechanism | Trade-off |
|----------|-----------|-----------|
| **Metric aggregation** | Pre-aggregate at source, store summaries | Lose per-event granularity |
| **Log sampling** | Log 1-in-N events for high-volume paths | Miss rare events |
| **Trace sampling** | Sample 1% of traces, keep 100% of errors | Miss non-error rare paths |
| **Retention tiers** | Hot (7d full resolution), warm (30d downsampled), cold (1y aggregated) | Lose resolution over time |
| **Dynamic sampling** | Increase sampling during anomalies | Complexity in sampling logic |

## Related Terms

- [Structured Logging](/glossary/structured-logging/) - Machine-parseable event records forming the logging pillar
- [Distributed Tracing](/glossary/distributed-tracing/) - Request flow tracking forming the tracing pillar
- [Metrics](/glossary/metrics/) - Numeric measurements forming the metrics pillar
- [Autoheal](/glossary/autoheal/) - Self-healing triggered by observability data
- [Autoevolve](/glossary/autoevolve/) - Autonomous evolution driven by quality observability
- [QDP](/glossary/qdp/) - Quality debt metric tracked through observability infrastructure
- [Circuit Breaker](/glossary/circuit-breaker/) - Pattern using observability signals to prevent cascade failures
- [Broadway](/glossary/broadway/) - Pipeline with built-in telemetry for observability
- [Ecto](/glossary/ecto/) - Database layer with query-level telemetry instrumentation
- [Cluster](/glossary/cluster/) - Distributed observability across cluster nodes
- [BEAM](/glossary/beam/) - Virtual machine providing unique per-process observability primitives
- [ETS](/glossary/ets/) - In-memory store used for telemetry handler state and metric caching

## See Also

- [Architecture](/architecture/) - Platform observability architecture
- [Technologies](/technologies/) - Telemetry and monitoring technology stack
- [Capabilities](/capabilities/) - Operational visibility and self-healing capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
