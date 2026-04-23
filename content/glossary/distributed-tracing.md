+++
title = "Distributed Tracing"
weight = 36
[extra]
category = "quality"
description = "Technique tracking request flow across multiple services and processes with correlation IDs"
related_terms = ["observability", "structured-logging", "metrics", "distributed-system", "telemetry", "broadway", "ecto", "rest-api", "process-isolation", "pubsub"]
abbreviation = "N/A"
domain = "Observability and Diagnostics"
complexity = "Advanced"
beam_specific = false
industry_standard = "OpenTelemetry"
elixir_library = ":telemetry"
prismatic_usage = "Extensive"
platform_component = "PrismaticWeb, PrismaticAgents, PrismaticStorage, PrismaticAPI"
first_introduced = "Gen 6"
current_generation = "Gen 19"
quality_impact = "Critical"
performance_impact = "Low-Medium"
observability_pillar = "Tracing"
complementary_pillars = ["Logging", "Metrics"]
key_protocols = ["W3C Trace Context", "OpenTelemetry Protocol (OTLP)"]
sampling_default = "head-based"
span_storage = "In-memory buffer with periodic flush"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1701
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Distributed", "Tracing", "Technique", "glossary", "quality", "Prismatic Platform", "OpenTelemetry", "Elixir", "BEAM", "Trace"]
tags = ["glossary", "quality", "distributed-tracing", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Distributed Tracing - Prismatic Platform"
+++

## Definition

Distributed tracing is an [observability](/glossary/observability/) technique that tracks the flow of a single request as it traverses multiple services, processes, and components in a distributed system. Each discrete operation along the request path is recorded as a **span** -- a named, timed unit of work with metadata. Spans are linked by a shared **trace ID** and organized into parent-child relationships that form a complete request tree (or directed acyclic graph). This tree reveals the full anatomy of a request: which services were called, in what order, how long each operation took, where failures occurred, and how parallelism was exploited.

Without distributed tracing, debugging issues in systems with many concurrent processes is extremely difficult. A single user request to the Prismatic Platform might involve DNS resolution, asset discovery across multiple data sources, security rating calculation, compliance assessment, database persistence, and real-time dashboard updates -- all happening across different OTP processes and potentially different [cluster](/glossary/cluster/) nodes. Traditional logging captures events at individual points but cannot reconstruct the causal chain connecting them. Distributed tracing solves this by threading a trace context through the entire request lifecycle.

The dominant industry standard for distributed tracing is OpenTelemetry, which defines a vendor-neutral API for creating and propagating trace context. In the Elixir ecosystem, the `:telemetry` library provides the instrumentation foundation, with OpenTelemetry libraries building the full distributed tracing story on top of it. The combination of BEAM's lightweight process model and Telemetry's span API makes Elixir an exceptionally well-suited platform for fine-grained distributed tracing with minimal performance overhead.

## Historical Context and Evolution

The intellectual foundations of distributed tracing trace back to Google's Dapper paper (2010), which described how Google tracked requests across its massive distributed infrastructure. Dapper introduced the concepts of traces, spans, and annotations that form the basis of all modern tracing systems. Twitter's Zipkin (2012) was the first major open-source implementation, followed by Uber's Jaeger (2017). These systems were unified under the OpenTelemetry project (2019), which merged OpenTracing and OpenCensus into a single, vendor-neutral standard.

In the Elixir ecosystem, distributed tracing took a different evolutionary path. Rather than adopting Java-centric tracing libraries, the community built on the `:telemetry` library created by the Phoenix team. Telemetry provides a lightweight, composable event emission system that serves as the foundation for both metrics and tracing. The `opentelemetry_api` and `opentelemetry` Hex packages bridge Elixir's telemetry ecosystem with the broader OpenTelemetry standard, enabling Elixir applications to export traces to any OpenTelemetry-compatible backend (Jaeger, Zipkin, Honeycomb, Datadog, Grafana Tempo).

The Prismatic Platform adopted telemetry-based tracing in Generation 6 and has progressively expanded instrumentation coverage across all 115 umbrella applications. The current implementation provides end-to-end trace visibility from HTTP request ingestion through agent execution, storage operations, and real-time dashboard updates.

## Trace, Span, and Context

The three fundamental concepts of distributed tracing form a hierarchy:

| Concept | Definition | Analogy |
|---------|-----------|---------|
| **Trace** | Complete record of a request's journey through the system | A detective's complete case file |
| **Span** | Single named operation within a trace, with start/end time | One step in the investigation |
| **Span Context** | Trace ID + Span ID + flags propagated between operations | The case reference number passed between detectives |

```
Trace: assess_domain("example.com")
|
+-- Span: discover_assets (120ms)
|   +-- Span: dns_resolution (15ms)
|   +-- Span: certificate_fetch (45ms)
|   +-- Span: subdomain_enum (60ms)
|
+-- Span: rate_assets (80ms)
|   +-- Span: vulnerability_scan (50ms)
|   +-- Span: config_analysis (30ms)
|
+-- Span: compliance_check (40ms)
|   +-- Span: nis2_assessment (25ms)
|   +-- Span: zkb_assessment (15ms)
|
+-- Span: store_results (20ms)
    +-- Span: ecto_insert (18ms)
```

Each span captures a discrete unit of work with precise timing. The parent-child relationships between spans reveal the request's execution structure -- which operations are sequential, which are parallel, and which are nested. The trace as a whole provides a complete timeline of the request's journey, enabling developers to identify exactly where time is spent and where failures occur.

## Telemetry-Based Tracing in Elixir

Elixir's `:telemetry` library provides the foundation for tracing through span events. The `telemetry.span/3` function creates a span with automatic start and stop event emission, duration measurement, and metadata propagation:

```elixir
defmodule AssetDiscovery do
  @moduledoc """
  Asset discovery module with comprehensive telemetry instrumentation.
  Every public function emits telemetry spans for distributed tracing.
  """

  @spec discover(String.t()) :: {:ok, list()} | {:error, term()}
  def discover(domain) do
    metadata = %{domain: domain, source: :asset_discovery}

    :telemetry.span(
      [:prismatic, :asset_discovery, :discover],
      metadata,
      fn ->
        case do_discover(domain) do
          {:ok, assets} = result ->
            {result, Map.put(metadata, :asset_count, length(assets))}

          {:error, _} = error ->
            {error, Map.put(metadata, :error, true)}
        end
      end
    )
  end

  @spec discover_with_enrichment(String.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def discover_with_enrichment(domain, opts \\ []) do
    metadata = %{domain: domain, source: :asset_discovery, enrichment: true}

    :telemetry.span(
      [:prismatic, :asset_discovery, :discover_enriched],
      metadata,
      fn ->
        with {:ok, assets} <- do_discover(domain),
             {:ok, enriched} <- enrich_assets(assets, opts) do
          {{:ok, enriched}, Map.put(metadata, :asset_count, length(enriched))}
        else
          {:error, reason} = error ->
            {error, Map.merge(metadata, %{error: true, reason: reason})}
        end
      end
    )
  end
end
```

The telemetry handler captures span events for trace visualization and export:

```elixir
defmodule TraceHandler do
  @moduledoc """
  Telemetry handler that captures span events and formats them
  for trace visualization and export to OpenTelemetry backends.
  """

  require Logger

  @spec attach() :: :ok
  def attach do
    events = [
      [:prismatic, :asset_discovery, :discover, :stop],
      [:prismatic, :asset_discovery, :discover, :exception],
      [:prismatic, :storage, :query, :stop],
      [:prismatic, :agent, :execute, :stop]
    ]

    :telemetry.attach_many("trace-handler", events, &handle_event/4, %{})
  end

  def handle_event(
        [:prismatic, :asset_discovery, :discover, :stop],
        %{duration: duration},
        metadata,
        _config
      ) do
    duration_ms = System.convert_time_unit(duration, :native, :millisecond)

    Logger.info("Asset discovery completed",
      domain: metadata.domain,
      duration_ms: duration_ms,
      asset_count: Map.get(metadata, :asset_count, 0),
      trace_id: metadata[:trace_id]
    )

    emit_to_backend(%{
      name: "asset_discovery.discover",
      duration_ms: duration_ms,
      metadata: metadata,
      status: if(metadata[:error], do: :error, else: :ok)
    })
  end

  def handle_event(
        [:prismatic, :asset_discovery, :discover, :exception],
        %{duration: duration},
        %{kind: kind, reason: reason, stacktrace: stacktrace} = metadata,
        _config
      ) do
    Logger.error("Asset discovery failed",
      domain: metadata[:domain],
      kind: kind,
      reason: inspect(reason),
      duration_ms: System.convert_time_unit(duration, :native, :millisecond)
    )
  end

  defp emit_to_backend(span_data) do
    :telemetry.execute([:trace, :span, :complete], %{}, span_data)
  end
end
```

## Span Attributes and Metadata

Spans carry rich metadata that enables filtering, grouping, and analysis:

| Attribute Category | Examples | Analysis Use |
|-------------------|----------|-------------|
| **Identity** | `trace_id`, `span_id`, `parent_span_id` | Reconstructing request tree |
| **Timing** | `start_time`, `end_time`, `duration` | Latency analysis, SLA monitoring |
| **Status** | `ok`, `error`, `timeout` | Error rate tracking |
| **Source** | `service`, `module`, `function` | Service dependency mapping |
| **Business** | `domain`, `agent_name`, `quality_score` | Domain-specific analysis |
| **Infrastructure** | `node`, `pid`, `scheduler_id` | Resource utilization tracking |
| **Semantic** | `http.method`, `db.statement`, `rpc.method` | OpenTelemetry semantic conventions |

Well-chosen span attributes transform traces from opaque timing records into rich diagnostic artifacts. The Prismatic Platform follows OpenTelemetry semantic conventions for infrastructure attributes while adding domain-specific attributes for security assessment, quality gating, and agent execution contexts.

## Context Propagation

Trace context must be propagated across process boundaries for end-to-end visibility. In BEAM systems, this means propagating through message passing, task spawning, and [GenServer](/glossary/genserver/) calls:

```elixir
defmodule TracedTaskRunner do
  @moduledoc """
  Spawns tasks that inherit the current trace context,
  ensuring child spans link back to the parent trace.
  Supports both async and supervised task execution.
  """

  @spec run_traced((() -> term())) :: Task.t()
  def run_traced(fun) do
    trace_ctx = get_trace_context()

    Task.async(fn ->
      set_trace_context(trace_ctx)
      fun.()
    end)
  end

  @spec run_traced_supervised(Supervisor.supervisor(), (() -> term())) :: DynamicSupervisor.on_start_child()
  def run_traced_supervised(supervisor, fun) do
    trace_ctx = get_trace_context()

    Task.Supervisor.start_child(supervisor, fn ->
      set_trace_context(trace_ctx)
      fun.()
    end)
  end

  @spec run_many_traced([(() -> term())]) :: [term()]
  def run_many_traced(funs) do
    trace_ctx = get_trace_context()

    funs
    |> Enum.map(fn fun ->
      Task.async(fn ->
        set_trace_context(trace_ctx)
        fun.()
      end)
    end)
    |> Task.await_many(30_000)
  end

  defp get_trace_context do
    %{
      trace_id: Logger.metadata()[:trace_id],
      parent_span_id: Logger.metadata()[:span_id],
      request_id: Logger.metadata()[:request_id]
    }
  end

  defp set_trace_context(ctx) do
    Logger.metadata(
      trace_id: ctx.trace_id,
      parent_span_id: ctx.parent_span_id,
      request_id: ctx.request_id
    )
  end
end
```

Context propagation across process boundaries is the single most important implementation detail in BEAM-based distributed tracing. Unlike thread-based systems where thread-local storage carries trace context implicitly, BEAM processes are fully isolated -- each new process starts with an empty process dictionary. Trace context must be explicitly captured before spawning and restored in the new process.

## Cross-Node Context Propagation

In [clustered](/glossary/cluster/) BEAM deployments, trace context must propagate across network boundaries when processes on different nodes communicate:

```elixir
defmodule CrossNodeTracer do
  @moduledoc """
  Handles trace context propagation across BEAM cluster node boundaries.
  Wraps distributed Erlang messages with trace context metadata.
  """

  @spec remote_call(node(), module(), atom(), [term()]) :: term()
  def remote_call(node, module, function, args) do
    trace_ctx = TracedTaskRunner.get_trace_context()
    wrapped_args = [trace_ctx | args]

    :erpc.call(node, __MODULE__, :execute_with_context, [module, function, wrapped_args])
  end

  @spec execute_with_context(module(), atom(), [term()]) :: term()
  def execute_with_context(module, function, [trace_ctx | args]) do
    TracedTaskRunner.set_trace_context(trace_ctx)

    :telemetry.span(
      [:prismatic, :cross_node, :call],
      %{module: module, function: function, remote: true},
      fn ->
        result = apply(module, function, args)
        {result, %{status: :ok}}
      end
    )
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements distributed tracing through Elixir telemetry spans, providing end-to-end visibility across its 115 umbrella applications:

- **Agent Execution Traces**: Each [agent](/glossary/agent/) execution emits telemetry spans under `[:prismatic_agents, :execute, ...]`. Spans include agent name, tier, task type, and duration, enabling per-agent performance analysis.
- **Storage Adapter Traces**: Every storage operation ([Ecto](/glossary/ecto/), ETS, Meilisearch, KuzuDB) emits span events with query details and timing, revealing storage layer performance characteristics.
- **Quality Gate Traces**: Quality checks emit spans for each domain check (Dialyzer, Credo, compilation, typespecs), enabling identification of slow quality gates.
- **API Request Traces**: The [REST API](/glossary/rest-api/) dispatches requests through a traced pipeline: authentication, endpoint resolution, parameter validation, function dispatch, and response formatting each produce spans.
- **SessionLifecycle Hooks**: The SessionLifecycle GenServer propagates session context through hook chains, enabling end-to-end trace reconstruction from API request through agent execution to storage write.
- **[Broadway](/glossary/broadway/) Pipeline Traces**: Data pipeline processing emits spans for each stage (producer, processor, batcher), revealing pipeline throughput and bottleneck locations.
- **Cross-Node Traces**: In [clustered](/glossary/cluster/) deployments, trace context propagates through distributed Erlang messages, maintaining end-to-end visibility across nodes.
- **[LiveView](/glossary/liveview/) Interaction Traces**: User interactions on LiveView dashboards emit spans for mount, handle_event, and handle_info callbacks, revealing UI responsiveness characteristics.

## Tracing vs. Logging vs. Metrics

The three pillars of observability serve complementary purposes:

| Aspect | Distributed Tracing | [Structured Logging](/glossary/structured-logging/) | [Metrics](/glossary/metrics/) |
|--------|-------------------|-------------------|---------|
| **Granularity** | Per-request path | Per-event | Aggregated over time |
| **Cardinality** | High (unique trace per request) | High (event per occurrence) | Low (predefined metric names) |
| **Storage Cost** | High (full span trees) | Medium (text/JSON entries) | Low (numeric time series) |
| **Query Pattern** | "Show me request X's full path" | "Show me errors in module Y" | "What is p99 latency?" |
| **Best For** | Debugging specific requests | Understanding event sequences | Alerting and trend analysis |
| **Retention** | Days to weeks | Days to months | Months to years |
| **Correlation** | trace_id links all spans | trace_id in log entries | Labels reference trace dimensions |

The key insight is that these pillars work together. A metric alert fires when p99 latency exceeds the threshold. The on-call engineer queries the tracing system for slow traces matching the alert's time window. They find a specific trace showing a slow database query. They search structured logs filtered by that trace's trace_id to find the exact query and its parameters. This workflow -- metrics for detection, traces for localization, logs for detail -- is the standard observability playbook.

## Sampling Strategies

In high-traffic systems, tracing every request is prohibitively expensive. Sampling strategies balance visibility with resource consumption:

| Strategy | Description | Use Case | Overhead |
|----------|-------------|----------|----------|
| **Head-based** | Decide at request entry whether to trace | Simple, predictable overhead | Fixed percentage |
| **Tail-based** | Decide after completion (keep errors, slow requests) | Captures interesting requests | Higher (buffer all spans) |
| **Rate-based** | Trace N requests per second | Predictable resource usage | Bounded |
| **Priority-based** | Always trace high-priority operations | Ensures visibility for critical paths | Variable |
| **Debug flag** | Trace when debug header is present | On-demand deep debugging | Zero when not triggered |
| **Adaptive** | Adjust rate based on system load | Balanced visibility and overhead | Self-regulating |

```elixir
defmodule TraceSampler do
  @moduledoc """
  Configurable trace sampling for the Prismatic Platform.
  Supports multiple strategies with composable decision logic.
  """

  @spec should_trace?(map()) :: boolean()
  def should_trace?(request_metadata) do
    cond do
      request_metadata[:debug_trace] == true -> true
      request_metadata[:priority] == :critical -> true
      error_request?(request_metadata) -> true
      true -> rate_sample?(request_metadata)
    end
  end

  defp error_request?(metadata), do: metadata[:status] in [:error, :timeout]

  defp rate_sample?(_metadata) do
    sample_rate = Application.get_env(:prismatic, :trace_sample_rate, 0.1)
    :rand.uniform() < sample_rate
  end
end
```

## Trace Visualization and Analysis

Traces are most useful when visualized. The standard visualization is the Gantt chart (waterfall diagram), where each span is a horizontal bar whose position shows its start time and whose length shows its duration:

```
|-- discover_assets (120ms) --------------------------------------------------|
|  |-- dns_resolution (15ms) ----|                                            |
|  |-- certificate_fetch (45ms) ------------------|                           |
|  |-- subdomain_enum (60ms) -------------------------------|                 |
|-- rate_assets (80ms) ------------------------------------------|            |
|  |-- vulnerability_scan (50ms) ----------------------|         |            |
|  |-- config_analysis (30ms) -------------|                     |            |
|-- compliance_check (40ms) ----------------------|                           |
|  |-- nis2_assessment (25ms) ----------|         |                           |
|  |-- zkb_assessment (15ms) ------|                                          |
|-- store_results (20ms) --------|                                            |
```

This visualization immediately reveals sequential vs. parallel execution, critical path length, and latency distribution across operations.

## Best Practices

**Propagate Context Across Boundaries**: Explicitly propagate trace context through Task spawns, GenServer calls, and message passing. BEAM processes do not inherit trace context automatically.

**Use Tail-Based Sampling**: For production deployments, use tail-based sampling that retains traces for errors and slow requests while sampling normal requests at a configurable rate.

**Include Business Metadata**: Attach domain-specific attributes (agent name, domain, quality score) to spans alongside infrastructure metadata. Business context is essential for diagnosing domain-level issues.

**Correlate with Logs and Metrics**: Include trace_id and span_id in structured log entries so that log searches can link directly to trace visualizations, and vice versa.

**Instrument at Function Boundaries**: Place telemetry spans at the boundaries of public functions in modules that represent distinct operations. Over-instrumenting internal helper functions creates noise without diagnostic value.

**Name Spans Descriptively**: Use hierarchical, descriptive span names that follow the `[:app, :module, :operation]` convention. Consistent naming enables aggregation and comparison across traces.

## Use Cases

- **Latency Debugging**: Identifying which stage of a multi-step operation (asset discovery, enrichment, storage, notification) is causing elevated response times
- **Error Root Cause Analysis**: Tracing a failed API request through endpoint dispatch, parameter validation, function execution, and storage to identify the exact failure point
- **Dependency Mapping**: Visualizing which umbrella applications and external services participate in handling specific request types
- **Performance Optimization**: Identifying parallelization opportunities by analyzing span trees for sequential operations that could execute concurrently
- **Cross-Node Debugging**: Tracking requests that span multiple cluster nodes in distributed deployments
- **SLA Monitoring**: Measuring per-operation latency against defined performance budgets (< 250ms page load, < 100ms server render)
- **Capacity Planning**: Analyzing trace data to understand resource utilization patterns and predict scaling requirements

## Related Concepts

- [Observability](/glossary/observability/) - Tracing is one of the three observability pillars
- [Structured Logging](/glossary/structured-logging/) - Logs enriched with trace IDs for correlation
- [Metrics](/glossary/metrics/) - Complementary numeric measurements for aggregate analysis
- [Distributed System](/glossary/distributed-system/) - Systems where tracing provides cross-node visibility
- [Cluster](/glossary/cluster/) - BEAM clusters where trace context propagates across nodes
- [Broadway](/glossary/broadway/) - Data pipelines with per-stage span instrumentation
- [Ecto](/glossary/ecto/) - Database queries with traced execution spans
- [REST API](/glossary/rest-api/) - API layer where traces originate from incoming requests
- [Process Isolation](/glossary/process-isolation/) - Process boundaries requiring explicit context propagation
- [Telemetry](/glossary/telemetry/) - Event emission library underlying all Elixir tracing
- [PubSub](/glossary/pubsub/) - Event distribution requiring trace context propagation

## See Also

- [Architecture](/architecture/) - Platform tracing and observability architecture
- [Technologies](/technologies/) - Telemetry library and OpenTelemetry integration
- [Capabilities](/capabilities/) - Diagnostic and debugging capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
