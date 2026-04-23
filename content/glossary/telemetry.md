+++
title = "Telemetry"
weight = 44
[extra]
category = "elixir"
description = "Lightweight metrics and instrumentation library for BEAM applications providing dynamic event dispatch, handler registration, and standardized observability across the Prismatic Platform"
abbreviation = "Telemetry"
related_terms = ["genserver", "otp", "quality-floor-guardian", "seadf", "timescaledb", "pubsub", "observability", "beam", "telemetry-metrics", "phoenix"]
domain = "observability"
complexity = "intermediate"
platform_adoption = "universal"
elixir_package = "telemetry"
hex_url = "https://hex.pm/packages/telemetry"
github_url = "https://github.com/beam-telemetry/telemetry"
erlang_compatible = true
otp_version = "21+"
elixir_version = "1.5+"
event_model = "synchronous-dispatch"
storage_backend = "ETS"
handler_limit = "unlimited"
dispatch_overhead_us = "1-2"
zero_overhead_when_unhandled = true
prismatic_event_count = "50+"
integration_points = ["pre-commit", "ci-pipeline", "live-dashboard", "quality-guardian"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1531
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Telemetry", "Lightweight", "BEAM", "Prismatic", "Platform", "glossary", "elixir", "Prismatic Platform"]
tags = ["glossary", "elixir", "telemetry", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Telemetry - Prismatic Platform"
+++

## Definition and Overview

Telemetry is a dynamic dispatching library for metrics and instrumentation in Elixir and Erlang applications. It provides a standardized mechanism for emitting events from library and application code, which can be consumed by any number of handlers for logging, metrics collection, monitoring, alerting, or custom processing. Events consist of a named path (a list of atoms), measurements (a map of numeric values), and metadata (a map of contextual information), enabling zero-overhead instrumentation that imposes negligible cost when no handlers are attached.

The library emerged from the Elixir community's need for a unified instrumentation standard. Before Telemetry, each library implemented its own metrics approach -- Phoenix had its own instrumentation, Ecto had separate logging, and application code used ad-hoc logging patterns. This fragmentation made it difficult to build consistent observability across an application. Telemetry solved this by establishing a single event emission mechanism that any library can adopt, and any monitoring system can consume.

The key architectural insight of Telemetry is the separation between event emission and event handling. Library authors emit events at significant points in their code (request received, query executed, cache hit/miss), and application operators attach handlers that process those events however they choose (send to StatsD, log to file, trigger alerts). This separation means that library authors do not need to know about monitoring infrastructure, and monitoring infrastructure does not need to know about library internals.

Telemetry events are dispatched synchronously in the emitting process, which means handlers execute in the context of the process that emitted the event. This design choice provides causal ordering (events from a single process are always in order) and simplicity (no message passing overhead), but requires that handlers execute quickly to avoid blocking the emitting process. Long-running event processing should dispatch to separate processes.

Within the Prismatic Platform, Telemetry is the universal observability layer across all 115 umbrella applications. Every significant operation -- from agent lifecycle transitions to [quality gate](/glossary/quality-gates/) executions to security rating calculations -- emits Telemetry events. The [Quality Floor Guardian](/glossary/quality-floor-guardian/) monitors these events for anomaly detection, [SEADF](/glossary/seadf/) subsystems use them for ecosystem health metrics, and the platform's CI/CD pipeline tracks performance regression through Telemetry-based benchmarks.

## Historical Context and Evolution

The Telemetry project was initiated in 2018 by the Erlang Ecosystem Foundation as a response to the growing need for standardized instrumentation across the BEAM ecosystem. Prior to Telemetry, the Elixir and Erlang communities relied on fragmented approaches -- each library or framework defined its own instrumentation conventions, making it impossible to build unified observability tooling. The Phoenix framework used its own `Instrumenter` behaviour, Ecto had built-in logging with no structured event model, and application developers resorted to ad-hoc Logger calls scattered throughout their code.

The Telemetry library drew inspiration from the OpenTelemetry initiative in the broader software industry, but was specifically designed for the BEAM's unique process-based concurrency model. Where OpenTelemetry assumes thread-based concurrency with shared memory, Telemetry leverages the BEAM's ETS (Erlang Term Storage) tables for handler registry and leverages the process-local execution model for zero-contention event dispatch. This architectural alignment with the BEAM's strengths gives Telemetry performance characteristics that generic observability frameworks cannot match when running on the BEAM.

By 2020, Telemetry had been adopted by virtually every major Elixir library: Phoenix, Ecto, Broadway, Oban, Finch, and many others. The standardization created a positive feedback loop -- once libraries emitted Telemetry events, it became trivial to build monitoring tools that consumed them, which in turn encouraged more libraries to adopt the standard. Today, the Telemetry ecosystem includes `telemetry_metrics` for metric type definitions, `telemetry_poller` for periodic measurements, and numerous reporter libraries that bridge Telemetry events to external monitoring systems.

## Technical Deep Dive

### Event Emission

Telemetry events are emitted using `:telemetry.execute/3`:

```elixir
defmodule PrismaticPerimeter.Rating.Engine do
  @moduledoc """
  Security rating engine with comprehensive Telemetry instrumentation.
  Emits events at each stage of the rating calculation pipeline.
  """

  @spec calculate_rating(String.t()) :: {:ok, rating()} | {:error, term()}
  def calculate_rating(domain) do
    start_time = System.monotonic_time()

    :telemetry.execute(
      [:prismatic, :perimeter, :rating, :start],
      %{system_time: System.system_time()},
      %{domain: domain}
    )

    result = do_calculate(domain)

    duration = System.monotonic_time() - start_time

    :telemetry.execute(
      [:prismatic, :perimeter, :rating, :stop],
      %{duration: duration, system_time: System.system_time()},
      %{domain: domain, result: elem(result, 0)}
    )

    result
  end

  @spec do_calculate(String.t()) :: {:ok, rating()} | {:error, term()}
  defp do_calculate(domain) do
    with {:ok, evidence} <- collect_evidence(domain),
         {:ok, scores} <- calculate_dimension_scores(evidence),
         {:ok, grade} <- compute_grade(scores) do
      :telemetry.execute(
        [:prismatic, :perimeter, :rating, :computed],
        %{score: grade.score, dimensions: map_size(scores)},
        %{domain: domain, grade: grade.letter}
      )

      {:ok, grade}
    end
  end
end
```

### Event Handlers

Handlers are attached to event names and execute when those events are emitted:

```elixir
defmodule PrismaticTelemetry.Handlers do
  @moduledoc """
  Telemetry event handlers for the Prismatic Platform.
  Attached at application startup, processes events from all subsystems.
  """

  require Logger

  @spec attach_all() :: :ok
  def attach_all do
    handlers = [
      {"perimeter-rating-handler", [:prismatic, :perimeter, :rating, :stop],
        &handle_rating_complete/4, %{}},

      {"agent-lifecycle-handler", [:prismatic, :agents, :lifecycle],
        &handle_agent_lifecycle/4, %{}},

      {"quality-gate-handler", [:prismatic, :quality_gates, :check],
        &handle_quality_gate/4, %{}},

      {"supreme-commander-handler", [:prismatic, :supreme_commander, :orchestration_complete],
        &handle_orchestration/4, %{}}
    ]

    Enum.each(handlers, fn {id, event, handler, config} ->
      :telemetry.attach(id, event, handler, config)
    end)
  end

  @spec handle_rating_complete(
    [:prismatic, :perimeter, :rating, :stop],
    measurements :: map(),
    metadata :: map(),
    config :: map()
  ) :: :ok
  def handle_rating_complete(_event, measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    Logger.info(
      "Rating calculated",
      domain: metadata.domain,
      duration_ms: duration_ms,
      result: metadata.result
    )

    :telemetry.execute(
      [:prismatic, :metrics, :histogram],
      %{value: duration_ms},
      %{metric: "perimeter.rating.duration_ms", tags: %{domain: metadata.domain}}
    )
  end

  @spec handle_agent_lifecycle(list(atom()), map(), map(), map()) :: :ok
  def handle_agent_lifecycle(_event, measurements, metadata, _config) do
    Logger.info(
      "Agent lifecycle event",
      agent: metadata.agent,
      transition: metadata.transition,
      duration_ms: Map.get(measurements, :duration_ms, 0)
    )
  end

  @spec handle_quality_gate(list(atom()), map(), map(), map()) :: :ok
  def handle_quality_gate(_event, measurements, metadata, _config) do
    if measurements.duration_ms > 60_000 do
      Logger.warning(
        "Quality gate exceeded 60s threshold",
        gate: metadata.gate,
        duration_ms: measurements.duration_ms
      )
    end
  end
end
```

### Telemetry.Metrics for Aggregation

`Telemetry.Metrics` defines metric types that reporters aggregate from raw events:

```elixir
defmodule PrismaticTelemetry.Metrics do
  @moduledoc """
  Defines platform-wide Telemetry metrics.
  Consumed by reporters (StatsD, Prometheus, console).
  """

  import Telemetry.Metrics

  @spec metrics() :: [Telemetry.Metrics.t()]
  def metrics do
    [
      counter("prismatic.perimeter.rating.stop.duration",
        tags: [:domain],
        description: "Number of rating calculations completed"
      ),

      distribution("prismatic.perimeter.rating.stop.duration",
        unit: {:native, :millisecond},
        tags: [:domain],
        description: "Rating calculation duration distribution",
        reporter_options: [buckets: [100, 250, 500, 1000, 2500, 5000]]
      ),

      summary("prismatic.quality_gates.check.duration_ms",
        tags: [:gate],
        description: "Quality gate check duration"
      ),

      last_value("prismatic.agents.pool.size",
        description: "Current agent pool size"
      ),

      sum("prismatic.perimeter.scan.findings",
        tags: [:severity],
        description: "Total findings by severity"
      )
    ]
  end
end
```

### Span Events for Duration Tracking

Telemetry provides `span/3` for measuring operation duration with automatic start/stop events:

```elixir
defmodule PrismaticAgents.CommandDispatcher do
  @moduledoc """
  Dispatches commands to agents with automatic Telemetry span tracking.
  """

  @spec dispatch(atom(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch(command, params) do
    :telemetry.span(
      [:prismatic, :agents, :command],
      %{command: command, params_count: map_size(params)},
      fn ->
        result = execute_command(command, params)

        measurements = %{
          result_size: estimate_size(result)
        }

        metadata = %{
          command: command,
          status: if(match?({:ok, _}, result), do: :success, else: :failure)
        }

        {result, Map.merge(measurements, metadata)}
      end
    )
  end
end
```

## Architecture and Implementation

### Platform Telemetry Event Catalog

The Prismatic Platform defines a comprehensive event catalog spanning all 115 umbrella applications:

| Event Path | Measurements | Metadata | Source |
|------------|-------------|----------|--------|
| `[:prismatic, :perimeter, :rating, :*]` | duration, score | domain, grade | Rating Engine |
| `[:prismatic, :agents, :lifecycle]` | duration_ms | agent, transition | Agent Pool |
| `[:prismatic, :agents, :l2, :*]` | confidence, duration_ms | agent, team, severity | L2 Agents |
| `[:prismatic, :quality_gates, :check]` | duration_ms | gate, result | Quality Gates |
| `[:prismatic, :supreme_commander, :*]` | duration_ms, efficiency | objective, status | Supreme Commander |
| `[:prismatic_claude, :stack_conversation, :*]` | frame_count | operation | Stack Conversation |
| `[:prismatic_claude, :session_lifecycle, :*]` | hook_count | phase, status | Session Lifecycle |
| `[:prismatic, :compliance, :soc2, :*]` | control_count | criterion, status | SOC 2 Assessment |
| `[:prismatic, :inference, :complete]` | latency_ms, tokens | provider, model | Inference Coordinator |
| `[:prismatic, :osint, :search, :*]` | result_count, duration_ms | source, query_type | OSINT Adapters |

### Handler Architecture

```
Application Code (emitters)
    |
    | :telemetry.execute/3
    |
    v
Telemetry Dispatch (ETS-backed handler registry)
    |
    +-- PrismaticTelemetry.Handlers (logging, structured output)
    |
    +-- PrismaticTelemetry.MetricsReporter (StatsD/Prometheus)
    |
    +-- PrismaticSafety.QualityFloorGuardian (anomaly detection)
    |
    +-- PrismaticSafety.PerformanceMonitor (latency tracking)
    |
    +-- Phoenix.LiveDashboard (real-time visualization)
```

### Cross-Application Event Flow

Telemetry events flow seamlessly across umbrella application boundaries because all applications share the same BEAM node:

```elixir
defmodule PrismaticTelemetry.CrossAppHandler do
  @moduledoc """
  Handles Telemetry events that cross application boundaries.
  Correlates events from different subsystems using shared
  request IDs and causal ordering within individual processes.
  """

  @spec attach_cross_app_handlers() :: :ok
  def attach_cross_app_handlers do
    :telemetry.attach(
      "cross-app-perimeter-to-safety",
      [:prismatic, :perimeter, :scan, :complete],
      &forward_to_quality_guardian/4,
      %{}
    )

    :telemetry.attach(
      "cross-app-agents-to-web",
      [:prismatic, :agents, :command, :stop],
      &update_live_dashboard/4,
      %{}
    )

    :telemetry.attach(
      "cross-app-inference-to-metrics",
      [:prismatic, :inference, :complete],
      &track_inference_metrics/4,
      %{}
    )

    :ok
  end

  defp forward_to_quality_guardian(_event, measurements, metadata, _config) do
    PrismaticSafety.QualityFloorGuardian.process_event(%{
      source: :perimeter,
      measurements: measurements,
      metadata: metadata,
      timestamp: DateTime.utc_now()
    })
  end

  defp update_live_dashboard(_event, measurements, metadata, _config) do
    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "agent_events",
      {:agent_command_completed, measurements, metadata}
    )
  end

  defp track_inference_metrics(_event, measurements, metadata, _config) do
    PrismaticTelemetry.InferenceTracker.record(measurements, metadata)
  end
end
```

## Performance Characteristics

| Aspect | Characteristic | Impact |
|--------|---------------|--------|
| Dispatch mechanism | ETS lookup + function call | ~1-2 microseconds per event |
| No handlers attached | ETS lookup only | ~0.5 microseconds (negligible) |
| Multiple handlers | Sequential execution in emitter process | Handlers must be fast |
| Handler crash | Detached automatically, event logged | Self-healing, no cascading failure |
| Memory overhead | Minimal (event data is caller's stack) | No allocation for unhandled events |
| Handler registration | ETS insert | Constant time, concurrent-safe |
| Event name matching | Exact match on atom list | O(1) ETS lookup |

The performance profile of Telemetry makes it safe to instrument hot paths without measurable impact on application throughput. In the Prismatic Platform, even the most performance-critical paths -- such as [inference](/glossary/inference/) request routing and security rating calculations -- are fully instrumented with Telemetry events. The ~1-2 microsecond overhead per event is insignificant compared to the millisecond-scale operations being measured.

## Telemetry Poller for Periodic Measurements

The `telemetry_poller` library complements event-driven Telemetry with periodic measurements. Where `:telemetry.execute/3` emits events at specific code points, `telemetry_poller` emits events on a timer, capturing system state at regular intervals:

```elixir
defmodule PrismaticTelemetry.Poller do
  @moduledoc """
  Periodic system measurements emitted via Telemetry poller.
  Captures BEAM VM metrics and platform-specific gauges.
  """

  @spec child_spec(keyword()) :: Supervisor.child_spec()
  def child_spec(opts) do
    measurements = [
      {:process_info, event: [:prismatic, :vm, :process_info], name: :total},
      {__MODULE__, :measure_agent_pool_size, []},
      {__MODULE__, :measure_quality_score, []},
      {__MODULE__, :measure_ets_memory, []}
    ]

    :telemetry_poller.child_spec(
      measurements: measurements,
      period: Keyword.get(opts, :period, :timer.seconds(15)),
      name: __MODULE__
    )
  end

  @spec measure_agent_pool_size() :: :ok
  def measure_agent_pool_size do
    count = PrismaticAgents.Registry.count_active()

    :telemetry.execute(
      [:prismatic, :agents, :pool, :size],
      %{count: count},
      %{source: :poller}
    )
  end

  @spec measure_quality_score() :: :ok
  def measure_quality_score do
    score = PrismaticSafety.QualityFloorGuardian.current_score()

    :telemetry.execute(
      [:prismatic, :quality, :score],
      %{score: score},
      %{source: :poller}
    )
  end

  @spec measure_ets_memory() :: :ok
  def measure_ets_memory do
    memory = :ets.info(:telemetry_handler_table, :memory)

    :telemetry.execute(
      [:prismatic, :ets, :memory],
      %{bytes: memory * :erlang.system_info(:wordsize)},
      %{table: :telemetry_handler_table, source: :poller}
    )
  end
end
```

## Usage in Prismatic Platform

### Application Startup

```elixir
defmodule PrismaticWeb.Application do
  @moduledoc """
  OTP Application for PrismaticWeb. Attaches Telemetry handlers
  before starting supervised processes to ensure no events are missed.
  """

  use Application

  @impl true
  def start(_type, _args) do
    PrismaticTelemetry.Handlers.attach_all()
    PrismaticTelemetry.CrossAppHandler.attach_cross_app_handlers()

    children = [
      PrismaticTelemetry.Poller,
      PrismaticWeb.Telemetry,
      PrismaticWeb.Endpoint
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

### LiveView Telemetry Integration

```elixir
defmodule PrismaticWeb.PerimeterLive.Dashboard do
  @moduledoc """
  Real-time Perimeter dashboard receiving Telemetry events
  via PubSub broadcast from cross-app handlers.
  """

  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter_events")
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "agent_events")
    end

    {:ok, assign(socket, ratings: [], scan_count: 0, agent_events: [])}
  end

  @impl true
  def handle_info({:rating_completed, measurements, metadata}, socket) do
    {:noreply, update(socket, :ratings, fn ratings ->
      [%{domain: metadata.domain, score: measurements.score} | Enum.take(ratings, 99)]
    end)}
  end

  @impl true
  def handle_info({:agent_command_completed, measurements, metadata}, socket) do
    {:noreply, update(socket, :agent_events, fn events ->
      [%{command: metadata.command, latency: measurements.duration_ms} | Enum.take(events, 49)]
    end)}
  end
end
```

### Phoenix LiveDashboard Integration

Telemetry metrics integrate directly with Phoenix LiveDashboard, providing real-time visualization of all platform metrics without external monitoring infrastructure:

```elixir
defmodule PrismaticWeb.Telemetry do
  @moduledoc """
  Telemetry supervisor defining metrics for LiveDashboard display.
  """

  use Supervisor
  import Telemetry.Metrics

  @impl true
  def init(_arg) do
    children = [
      {:telemetry_poller, measurements: periodic_measurements(), period: 10_000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec metrics() :: [Telemetry.Metrics.t()]
  def metrics do
    [
      summary("phoenix.endpoint.start.system_time",
        unit: {:native, :millisecond}
      ),
      summary("phoenix.endpoint.stop.duration",
        unit: {:native, :millisecond}
      ),
      summary("phoenix.router_dispatch.stop.duration",
        tags: [:route],
        unit: {:native, :millisecond}
      ),
      distribution("prismatic.inference.complete.latency_ms",
        tags: [:provider],
        reporter_options: [buckets: [100, 500, 1000, 3000, 5000, 10_000]]
      ),
      counter("prismatic.agents.lifecycle.duration",
        tags: [:transition]
      )
    ]
  end

  defp periodic_measurements do
    [
      {__MODULE__, :measure_vm_stats, []}
    ]
  end

  @spec measure_vm_stats() :: :ok
  def measure_vm_stats do
    :telemetry.execute(
      [:prismatic, :vm, :stats],
      %{
        process_count: length(Process.list()),
        memory_total: :erlang.memory(:total),
        atom_count: :erlang.system_info(:atom_count)
      },
      %{}
    )
  end
end
```

## Best Practices

1. **Emit events at meaningful boundaries**. Instrument the start and end of operations, not every internal step. Too many events create noise; too few leave blind spots. Focus on request boundaries, external calls, and state transitions.

2. **Keep handlers fast**. Handlers execute synchronously in the emitting process. Long-running handlers block the emitter. If processing takes more than a few microseconds, dispatch to a separate process via `GenServer.cast` or `send`.

3. **Use :telemetry.span for duration tracking**. The `span/3` function automatically handles start/stop events and exception reporting, reducing boilerplate and ensuring consistent duration measurement.

4. **Attach handlers at application startup**. Handler attachment should happen in `Application.start/2`, before any supervised processes begin emitting events. Late attachment means missed events during startup.

5. **Define a consistent event naming convention**. Use hierarchical atom lists that follow `[:app, :subsystem, :operation, :phase]`. Consistent naming enables pattern-based handler attachment and simplifies event discovery.

6. **Use telemetry_poller for gauges**. Event-driven Telemetry captures point-in-time occurrences. For system state that changes continuously (memory usage, process count, pool sizes), use `telemetry_poller` to emit periodic measurements.

7. **Document your event catalog**. Maintain a central catalog of all Telemetry events emitted by your system, including event names, measurement keys, and metadata keys. This catalog is essential for building handlers and dashboards.

## Common Pitfalls

- **Blocking handlers**: A handler that makes an HTTP request or runs a database query blocks the emitting process. This is the most common Telemetry performance issue. Always delegate slow work to separate processes.

- **Handler crashes detaching silently**: When a handler crashes, Telemetry detaches it automatically and logs a warning. If handlers are not monitored, detachment can go unnoticed, creating observability blind spots. Monitor handler health by periodically checking `:telemetry.list_handlers/1`.

- **Inconsistent event naming**: Events named ad-hoc without convention become difficult to discover and handle systematically. Establish naming conventions early and document the event catalog.

- **Emitting events in hot loops**: While individual events are cheap (~1-2 microseconds), emitting millions of events per second in a tight loop creates measurable overhead. Use sampling for high-frequency operations.

- **Not using Telemetry.Metrics**: Raw events are difficult to aggregate manually. `Telemetry.Metrics` provides counter, distribution, summary, and last_value abstractions that reporters can process efficiently.

- **Forgetting handler configuration**: The fourth argument to `:telemetry.attach/4` is handler configuration, passed to the handler on every invocation. Use it for runtime configuration rather than module attributes, allowing handlers to be reconfigured without reattachment.

## Comparison with Alternatives

| Feature | Telemetry (BEAM) | OpenTelemetry | Micrometer (JVM) | StatsD |
|---------|-------------------|---------------|-------------------|--------|
| **Dispatch model** | Synchronous, process-local | Context propagation | Thread-local | UDP fire-and-forget |
| **Overhead** | ~1-2 us | ~5-10 us | ~2-5 us | ~10 us (network) |
| **Crash isolation** | Auto-detach handler | Exception propagation | Exception propagation | N/A (external) |
| **BEAM integration** | Native | Adapter required | N/A | N/A |
| **Distributed tracing** | Via opentelemetry_api | Built-in | Built-in | Not supported |
| **Handler model** | Function callbacks | Exporters/Processors | Registries/Meters | External daemon |

## Related Concepts

- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Consumes Telemetry events for quality monitoring
- [SEADF](/glossary/seadf/) -- Ecosystem monitoring powered by Telemetry data
- [GenServer](/glossary/genserver/) -- Processes emitting and handling Telemetry events
- [OTP](/glossary/otp/) -- Framework providing Telemetry integration
- [PubSub](/glossary/pubsub/) -- Complementary broadcast mechanism for LiveView updates
- [TimescaleDB](/glossary/timescaledb/) -- Time-series storage for Telemetry metric persistence
- [Observability](/glossary/observability/) -- Broader monitoring discipline built on Telemetry
- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline emitting Telemetry events at each stage
- [Inference](/glossary/inference/) -- AI inference pipeline instrumented with Telemetry
- [BEAM](/glossary/beam/) -- Virtual machine providing the process model that Telemetry leverages

## See Also

- [prismatic_telemetry](../../../apps/prismatic_telemetry/README.md) -- Platform telemetry infrastructure
- [prismatic_safety](../../../apps/prismatic_safety/README.md) -- Quality Floor Guardian consuming telemetry events
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent lifecycle telemetry events
- [prismatic_web](../../../apps/prismatic_web/README.md) -- LiveView performance telemetry
- [prismatic_api](../../../apps/prismatic_api/README.md) -- API dispatch latency telemetry
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Application directory with per-app Telemetry instrumentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
