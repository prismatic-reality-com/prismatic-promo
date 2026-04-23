+++
title = "Latency"
weight = 50
[extra]
description = "Time delay between a request and its response, with P0 platform requirements of less than 250ms page load, less than 100ms server render, and less than 50ms LiveView handle_event"
category = "performance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "Performance Engineering"
related_concepts = ["response time", "throughput optimization", "performance budgets", "tail latency", "queuing theory"]
implementation_status = "production"
authority_level = "standard"
difficulty_rating = 7
prerequisites = ["performance", "phoenix", "liveview", "telemetry", "otp"]
learning_path = ["performance", "throughput", "latency", "caching", "load-balancing"]
interactive_demos = ["/labs/glossary/latency"]
code_examples = ["Elixir Telemetry", "Phoenix Plug", "LiveView Optimization"]
external_resources = ["https://hexdocs.pm/telemetry/readme.html", "https://hexdocs.pm/phoenix/performance.html", "https://www.brendangregg.com/usemethod.html"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["page load under 250ms", "server render under 100ms", "handle_event under 50ms", "health check under 10ms", "P95 tail latency monitoring", "load test with concurrent users"]
keywords = ["latency", "response time", "page load", "server render", "handle_event", "P95", "P99", "tail latency", "performance budget", "TTFB"]
tags = ["glossary", "performance", "latency", "optimization", "monitoring", "telemetry"]
related_terms = ["performance", "throughput", "load-balancing", "caching", "connection-pooling", "telemetry", "observability", "monitoring", "circuit-breaker", "ets", "genserver", "phoenix", "liveview", "distributed-system", "websocket", "beam"]
word_count = 1848
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Latency - Prismatic Platform"
+++

## Definition

Latency is the time elapsed between initiating a request and receiving the first meaningful response. In computing systems, it is the fundamental measure of responsiveness -- the delay that users and systems experience when waiting for an operation to complete. Latency is distinct from [throughput](@/glossary/throughput.md), which measures how many operations complete per unit time. A system can have high throughput but also high latency (batch processing), or low latency with modest throughput (single-threaded request handling).

In the Prismatic Platform, latency is a P0 (absolute priority) concern with hard enforcement limits. Every page must load in under 250ms. Server-side rendering must complete in under 100ms. [LiveView](@/glossary/liveview.md) `handle_event` callbacks must respond in under 50ms. Health check endpoints must respond in under 10ms. These are not aspirational targets -- they are enforced through [quality gates](@/glossary/quality-gate.md), pre-commit hooks, CI/CD pipeline checks, and production [telemetry](@/glossary/telemetry.md) alerts. Violating these limits blocks merges and triggers rollbacks.

## Overview

Latency affects every layer of a software system, from network transport to application logic to data retrieval. Understanding where latency accumulates and how to reduce it requires a systematic approach that considers the entire request path. The traditional model decomposes total latency into components:

**Total Latency = Network Latency + Server Processing + Data Access + Serialization + Client Rendering**

Each component has its own optimization strategies, measurement techniques, and failure modes. Network latency is bounded by physics (speed of light in fiber) and topology (number of hops). Server processing is bounded by algorithm complexity and available compute. Data access is bounded by storage medium (memory vs. disk vs. network) and query complexity. Serialization depends on payload size and format efficiency. Client rendering depends on browser capabilities and page complexity.

In distributed systems like the Prismatic Platform's 115-application umbrella, latency becomes particularly complex because requests often traverse multiple services. A single page load might involve the [Phoenix](@/glossary/phoenix.md) router, authentication middleware, one or more GenServer calls, [ETS](@/glossary/ets.md) lookups, database queries, and template rendering. Each step contributes its own latency, and these contributions can compound unpredictably under load.

Tail latency (P95, P99, P99.9) is often more important than average latency. A system with 10ms average latency but 2-second P99 latency delivers a poor experience to 1% of users -- which at scale means thousands of frustrated interactions. The Prismatic Platform monitors P95 latency in production and alerts when it exceeds 200ms, providing early warning before the hard 250ms limit is breached.

The [BEAM](@/glossary/beam.md) virtual machine provides several latency advantages that the platform exploits: lightweight process scheduling with soft real-time guarantees, per-process garbage collection that avoids stop-the-world pauses, and preemptive scheduling that prevents any single process from monopolizing a CPU core. These properties make [Elixir](@/glossary/elixir.md)/[Erlang](@/glossary/erlang.md) particularly well-suited for low-latency concurrent systems.

## Technical Details

### Latency Measurement Points

The Prismatic Platform measures latency at multiple points along the request path:

| Measurement Point | Target | Method | Alert Threshold |
|------------------|--------|--------|----------------|
| **Total Page Load** | < 250ms | Browser Navigation Timing API | P95 > 200ms |
| **Server Render (TTFB)** | < 100ms | Phoenix Telemetry | P95 > 80ms |
| **LiveView Mount** | < 150ms | LiveView Telemetry | P95 > 120ms |
| **LiveView handle_event** | < 50ms | LiveView Telemetry | P95 > 40ms |
| **Health Check** | < 10ms | Plug Telemetry | P95 > 8ms |
| **Database Query** | < 20ms | Ecto Telemetry | P95 > 15ms |
| **ETS Lookup** | < 1ms | Custom Telemetry | P95 > 0.5ms |
| **GenServer Call** | < 5ms | GenServer Telemetry | P95 > 3ms |

### Latency Distribution Analysis

Average latency hides important information. The platform tracks full latency distributions using histograms:

- **P50 (Median)**: The typical user experience. Should be well below targets.
- **P90**: 90% of requests faster than this. Early warning indicator.
- **P95**: The enforcement threshold for alerts. Must stay below target limits.
- **P99**: Tail latency. Reveals worst-case behavior and capacity limits.
- **P99.9**: Extreme outliers. Often caused by GC pauses, network retransmissions, or cold cache misses.

### Queuing Theory Fundamentals

Latency in concurrent systems is governed by queuing theory. The key insight is that latency increases nonlinearly as utilization approaches 100%. For an M/M/1 queue:

```
Average Wait Time = Service Time / (1 - Utilization)
```

At 50% utilization, average wait = 2x service time. At 80%, it is 5x. At 95%, it is 20x. This explains why systems that perform well under moderate load can suddenly become unusable as load increases. The Prismatic Platform targets 60-70% CPU utilization in production to maintain latency headroom.

### BEAM Latency Properties

The BEAM virtual machine provides latency characteristics that are uncommon in garbage-collected runtimes:

- **Per-Process GC**: Each BEAM process has its own heap and garbage collector. A GC pause in one process does not affect others. This eliminates the stop-the-world GC pauses that plague JVM and V8 runtimes.
- **Preemptive Scheduling**: The BEAM scheduler uses reduction counting to preempt long-running processes, ensuring fair scheduling with soft real-time guarantees. No single process can monopolize a core.
- **Lightweight Processes**: BEAM processes are ~2KB each, enabling millions of concurrent processes without the memory overhead and context-switching costs of OS threads.
- **Binary Heap Optimization**: Large binaries (>64 bytes) are reference-counted on a shared heap, avoiding copying costs for message passing.

## Implementation in Prismatic Platform

### Telemetry-Based Latency Tracking

The platform uses the Erlang/Elixir telemetry library for structured latency measurement at every critical path:

```elixir
defmodule PrismaticWeb.Telemetry.LatencyTracker do
  @moduledoc """
  Tracks request latency across all platform endpoints.
  Emits telemetry events and enforces P0 latency budgets.
  Integrates with quality gates for merge blocking.
  """

  require Logger

  @type latency_ms :: non_neg_integer()
  @type endpoint :: String.t()
  @type latency_budget :: %{
    page_load: latency_ms(),
    server_render: latency_ms(),
    liveview_mount: latency_ms(),
    handle_event: latency_ms(),
    health_check: latency_ms()
  }

  @budgets %{
    page_load: 250,
    server_render: 100,
    liveview_mount: 150,
    handle_event: 50,
    health_check: 10
  }

  @alert_ratio 0.80

  @spec budgets() :: latency_budget()
  def budgets, do: @budgets

  @spec attach_handlers() :: :ok
  def attach_handlers do
    handlers = [
      {"web-request-latency", [:phoenix, :endpoint, :stop], &handle_endpoint_stop/4},
      {"liveview-mount-latency", [:phoenix, :live_view, :mount, :stop], &handle_mount_stop/4},
      {"liveview-event-latency", [:phoenix, :live_view, :handle_event, :stop], &handle_event_stop/4},
      {"ecto-query-latency", [:prismatic, :repo, :query], &handle_query/4}
    ]

    Enum.each(handlers, fn {id, event, handler} ->
      :telemetry.attach(id, event, handler, %{})
    end)

    :ok
  end

  @spec handle_endpoint_stop(atom(), map(), map(), map()) :: :ok
  def handle_endpoint_stop(_event, %{duration: duration}, metadata, _config) do
    latency_ms = System.convert_time_unit(duration, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :latency, :endpoint],
      %{duration_ms: latency_ms},
      %{route: metadata[:route], method: metadata[:method]}
    )

    check_budget(:server_render, latency_ms, metadata)
  end

  @spec handle_mount_stop(atom(), map(), map(), map()) :: :ok
  def handle_mount_stop(_event, %{duration: duration}, metadata, _config) do
    latency_ms = System.convert_time_unit(duration, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :latency, :liveview_mount],
      %{duration_ms: latency_ms},
      %{view: metadata[:socket].view}
    )

    check_budget(:liveview_mount, latency_ms, metadata)
  end

  @spec handle_event_stop(atom(), map(), map(), map()) :: :ok
  def handle_event_stop(_event, %{duration: duration}, metadata, _config) do
    latency_ms = System.convert_time_unit(duration, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :latency, :handle_event],
      %{duration_ms: latency_ms},
      %{event: metadata[:event]}
    )

    check_budget(:handle_event, latency_ms, metadata)
  end

  @spec handle_query(atom(), map(), map(), map()) :: :ok
  def handle_query(_event, %{total_time: total_time}, metadata, _config) do
    latency_ms = System.convert_time_unit(total_time, :native, :millisecond)

    :telemetry.execute(
      [:prismatic, :latency, :database],
      %{duration_ms: latency_ms},
      %{source: metadata[:source], query: metadata[:query]}
    )

    :ok
  end

  @spec check_budget(atom(), latency_ms(), map()) :: :ok
  defp check_budget(category, latency_ms, metadata) do
    budget = Map.fetch!(@budgets, category)
    alert_threshold = trunc(budget * @alert_ratio)

    cond do
      latency_ms > budget ->
        Logger.warning(
          "LATENCY VIOLATION: #{category} took #{latency_ms}ms (budget: #{budget}ms)",
          metadata: metadata
        )

        :telemetry.execute(
          [:prismatic, :latency, :violation],
          %{duration_ms: latency_ms, budget_ms: budget},
          %{category: category}
        )

      latency_ms > alert_threshold ->
        Logger.info(
          "LATENCY WARNING: #{category} at #{latency_ms}ms (#{alert_threshold}ms alert threshold)",
          metadata: metadata
        )

      true ->
        :ok
    end

    :ok
  end
end
```

### Connection Pooling for Database Latency

Database queries are a major latency contributor. The platform uses [connection pooling](@/glossary/connection-pooling.md) via DBConnection to maintain warm connections:

```elixir
defmodule Prismatic.Repo do
  use Ecto.Repo,
    otp_app: :prismatic,
    adapter: Ecto.Adapters.Postgres

  @doc """
  Pool configuration tuned for low latency:
  - pool_size: 20 connections to avoid queuing under normal load
  - queue_target: 50ms - if queries queue longer, pool expands
  - queue_interval: 1000ms - check interval for pool adjustment
  """
  @spec pool_config() :: keyword()
  def pool_config do
    [
      pool_size: 20,
      queue_target: 50,
      queue_interval: 1_000,
      timeout: 15_000
    ]
  end
end
```

### ETS-Based Caching for Sub-Millisecond Reads

For data that must be read in under 1ms, the platform uses [ETS](@/glossary/ets.md) (Erlang Term Storage) as an in-memory cache:

```elixir
defmodule Prismatic.Cache.LatencyOptimized do
  @moduledoc """
  ETS-backed cache for latency-critical lookups.
  Provides sub-millisecond read access with TTL-based
  expiration and write-behind persistence.
  """

  use GenServer

  @table_name :latency_optimized_cache
  @default_ttl_ms 60_000

  @type cache_key :: term()
  @type cache_value :: term()
  @type ttl_ms :: pos_integer()

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get(cache_key()) :: {:ok, cache_value()} | :miss
  def get(key) do
    case :ets.lookup(@table_name, key) do
      [{^key, value, expires_at}] ->
        if System.monotonic_time(:millisecond) < expires_at do
          {:ok, value}
        else
          :ets.delete(@table_name, key)
          :miss
        end

      [] ->
        :miss
    end
  end

  @spec put(cache_key(), cache_value(), ttl_ms()) :: :ok
  def put(key, value, ttl_ms \\ @default_ttl_ms) do
    expires_at = System.monotonic_time(:millisecond) + ttl_ms
    :ets.insert(@table_name, {key, value, expires_at})
    :ok
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table_name, [:named_table, :set, :public, read_concurrency: true])
    schedule_cleanup()
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    now = System.monotonic_time(:millisecond)

    :ets.select_delete(@table_name, [
      {{:_, :_, :"$1"}, [{:<, :"$1", now}], [true]}
    ])

    schedule_cleanup()
    {:noreply, state}
  end

  @spec schedule_cleanup() :: reference()
  defp schedule_cleanup, do: Process.send_after(self(), :cleanup, 30_000)
end
```

## Comparison with Alternatives

### Latency vs. Throughput Optimization

| Aspect | Latency Optimization | Throughput Optimization |
|--------|---------------------|----------------------|
| **Goal** | Minimize individual request time | Maximize requests per second |
| **Strategy** | Reduce critical path, cache, precompute | Batch, parallelize, pipeline |
| **Trade-off** | May reduce throughput (caching overhead) | May increase latency (batching delay) |
| **Measurement** | Percentiles (P50, P95, P99) | Requests/second, operations/second |
| **User Impact** | Perceived responsiveness | System capacity |
| **Platform Priority** | P0 (hard limits enforced) | P1 (monitored, not blocking) |

### BEAM vs. JVM Latency Profile

The BEAM excels at consistent low latency due to per-process GC and preemptive scheduling. The JVM excels at peak throughput due to JIT compilation and aggressive optimization. For the Prismatic Platform's use case -- concurrent [WebSocket](@/glossary/websocket.md) connections with real-time updates -- the BEAM's latency profile is superior because stop-the-world GC pauses in the JVM would cause visible UI stutter across all connected clients.

### ETS vs. Redis for Low-Latency Caching

[ETS](@/glossary/ets.md) provides sub-microsecond reads within the BEAM VM with zero serialization overhead. Redis provides single-digit millisecond reads over the network with serialization costs. For latency-critical lookups that do not require distribution across nodes, ETS is the correct choice. Redis is appropriate for shared cache across multiple nodes in a [distributed system](@/glossary/distributed-system.md) where network latency is acceptable.

## Best Practices

1. **Measure Before Optimizing**: Profile the actual request path before making changes. The bottleneck is often not where intuition suggests. Use `:telemetry` events and `Benchee` to identify real latency contributors.

2. **Set Explicit Budgets**: Define latency budgets per component (router: 2ms, auth: 5ms, query: 20ms, render: 50ms) that sum to less than the total budget. Track each component independently.

3. **Optimize the Critical Path**: Focus on the code that executes for every request. A 1ms improvement on the critical path saves more cumulative time than a 100ms improvement on a rarely-executed branch.

4. **Cache Aggressively, Invalidate Carefully**: [Caching](@/glossary/caching.md) is the most effective latency reduction strategy. But stale caches cause subtle bugs. Use TTL-based expiration and event-driven invalidation.

5. **Avoid Synchronous External Calls**: External HTTP calls add 50-500ms of unpredictable latency. Use async patterns, background jobs, or cached responses for external dependencies.

6. **Monitor Tail Latency**: P95 and P99 latency reveal problems that averages hide. A 10ms average with a 5-second P99 means 1% of users experience unacceptable delays.

7. **Load Test Continuously**: Latency characteristics change under load. A system that responds in 5ms at 10 requests/second may respond in 500ms at 1000 requests/second. Use the platform's [laboratory](@/glossary/laboratory.md) for load experiments.

## Common Pitfalls

1. **Premature Optimization**: Optimizing latency before measuring it. Adding caching layers, connection pools, and precomputation to code that already meets the budget wastes complexity.

2. **Average-Only Monitoring**: Tracking only average latency and missing tail latency spikes. The platform enforces P95 monitoring specifically to catch this.

3. **N+1 Query Patterns**: Loading a list of N items and then making N additional database queries for related data. Each query adds 1-5ms, turning a 20ms page into a 500ms page. Use `Ecto.Query.preload/3` or batch loading.

4. **Synchronous GenServer Bottlenecks**: Routing all requests through a single [GenServer](@/glossary/genserver.md) creates a serialization point where requests queue. Use ETS for reads and partition writes across multiple processes.

5. **Ignoring Serialization Costs**: JSON encoding/decoding adds 1-10ms for large payloads. Use binary protocols or reduce payload size for latency-critical paths.

6. **Cold Start Latency**: The first request after deployment or restart incurs compilation, connection establishment, and cache warming costs. Use readiness probes and warm-up procedures to avoid exposing cold-start latency to users.

7. **Uncontrolled Fan-Out**: A request that spawns multiple parallel sub-requests amplifies tail latency. If 10 parallel calls each have 99% chance of completing in 5ms, there is a 10% chance at least one takes longer.

## Use Cases

### Real-Time LiveView Dashboards

The Prismatic Platform's [LiveView](@/glossary/liveview.md) dashboards for OSINT toolbox, Perimeter EASM, and laboratory management require handle_event latency under 50ms to maintain interactive responsiveness. Users clicking buttons, filtering data, and navigating tabs expect immediate visual feedback. The 50ms budget ensures that server processing completes within one frame of animation (16ms at 60fps) plus network round-trip time.

### API Gateway Response Time

The Prismatic API (port 4004) serves REST endpoints with automatic discovery and dispatch. API consumers expect sub-100ms responses for synchronous operations. The generic dispatch controller resolves `{app, action}` to `module.function(args)` through ETS-cached lookup tables, keeping dispatch overhead under 1ms.

### Health Check Monitoring

Load balancers and orchestration platforms poll health check endpoints every few seconds. If a health check takes more than 10ms, the monitoring system may interpret the delay as unhealthiness and trigger unnecessary failovers. The platform's health check endpoint performs only in-memory state validation with zero I/O.

### OSINT Query Orchestration

OSINT queries often involve multiple external data sources with variable latency (10ms to 5s). The platform uses async orchestration with timeout-bounded [circuit breakers](@/glossary/circuit-breaker.md) to prevent slow external sources from degrading the overall response time. Fast sources return immediately while slow sources are handled asynchronously with streaming updates via [WebSocket](@/glossary/websocket.md).

### Perimeter Security Rating Computation

Computing a security rating for a domain involves aggregating data from asset discovery, vulnerability assessment, and compliance checks. Each component has its own latency profile. The platform caches intermediate results in ETS and recomputes only changed components, keeping the dashboard refresh under the 250ms page load budget.

## Related Concepts

- [Performance](@/glossary/performance.md) -- The broader category encompassing latency, throughput, and resource efficiency
- [Throughput](@/glossary/throughput.md) -- Operations per unit time, the complementary metric to latency
- [Load Balancing](@/glossary/load-balancing.md) -- Distributing requests across servers to reduce per-server latency
- [Caching](@/glossary/caching.md) -- Storing precomputed results to eliminate repeated computation latency
- [Connection Pooling](@/glossary/connection-pooling.md) -- Maintaining warm database connections to avoid connection establishment latency
- [Telemetry](@/glossary/telemetry.md) -- The instrumentation system measuring latency at every platform layer
- [Observability](@/glossary/observability.md) -- Platform-wide visibility into latency distributions and anomalies
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Protection pattern preventing cascading latency from slow dependencies
- [ETS](@/glossary/ets.md) -- In-memory storage providing sub-millisecond read latency
- [GenServer](@/glossary/genserver.md) -- OTP abstraction whose call semantics directly affect request latency
- [LiveView](@/glossary/liveview.md) -- Real-time UI framework with strict latency requirements
- [WebSocket](@/glossary/websocket.md) -- Persistent connection protocol enabling low-latency server push
- [BEAM](@/glossary/beam.md) -- Virtual machine providing soft real-time latency guarantees
- [Distributed System](@/glossary/distributed-system.md) -- Architecture where network latency is a fundamental constraint

## See Also

- [Monitoring](@/glossary/monitoring.md) -- Real-time latency tracking and alerting
- [Phoenix](@/glossary/phoenix.md) -- Web framework with built-in telemetry for latency measurement
- [Quality Gate](@/glossary/quality-gate.md) -- Enforcement mechanism that blocks merges when latency budgets are exceeded
- [Laboratory](@/glossary/laboratory.md) -- Experimentation environment for latency profiling and load testing

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
