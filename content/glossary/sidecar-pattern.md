+++
title = "Sidecar Pattern"
weight = 52
[extra]
category = "architecture"
description = "Auxiliary process co-deployed alongside a primary service for cross-cutting concerns"
related_terms = ["docker", "microservices", "observability", "telemetry", "supervision-tree", "process-isolation", "genserver", "supervisor", "quality-floor-guardian", "circuit-breaker"]
abbreviation = "N/A"
domain = "Architecture Patterns"
complexity = "Intermediate"
beam_specific = true
otp_version = "26+"
elixir_version = "1.15+"
prismatic_usage = "Extensive"
platform_component = "PrismaticSafety, PrismaticSupervisor, PrismaticAgents"
first_introduced = "Gen 4"
current_generation = "Gen 19"
quality_impact = "High"
performance_impact = "Low"
fault_tolerance_impact = "High"
key_modules = ["PrismaticSafety.QualityFloorGuardian", "PrismaticSafety.RiskPatternDetector", "PrismaticSafety.PredictivePreCommit"]
design_pattern_type = "Structural"
alternative_names = ["Ambassador Pattern", "Companion Process", "Auxiliary Process"]
kubernetes_equivalent = "Sidecar Container"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1727
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Sidecar", "Pattern", "Auxiliary", "glossary", "architecture", "Prismatic Platform", "BEAM", "Primary"]
tags = ["glossary", "architecture", "sidecar-pattern", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Sidecar Pattern - Prismatic Platform"
+++

## Definition and Overview

The Sidecar Pattern is a software architecture pattern where an auxiliary process is co-deployed alongside a primary application process to handle cross-cutting concerns such as logging, monitoring, configuration management, networking, security, or health checking. The sidecar shares the same lifecycle, network namespace, and often the same host or container as its parent, providing functionality transparently without requiring modifications to the primary application's code. This pattern enables separation of concerns at the deployment level while maintaining tight operational coupling.

The term "sidecar" originates from the motorcycle sidecar -- an attached compartment that travels alongside the motorcycle, sharing its journey without modifying the motorcycle itself. In software, this metaphor captures the essential property: the sidecar enhances the primary application's capabilities without the primary application needing awareness of the sidecar's existence. The sidecar can be developed, deployed, and updated independently, provided it maintains its interface contract with the primary application.

In container orchestration systems like Kubernetes, sidecars run as secondary containers within the same pod, sharing network and storage volumes. In the BEAM virtual machine ecosystem, the pattern maps naturally to co-supervised processes within OTP [supervision trees](@/glossary/supervision-tree.md) -- a more elegant implementation than container-based sidecars because BEAM processes communicate through message passing with microsecond latency rather than through network protocols with millisecond overhead.

The Prismatic Platform implements the Sidecar Pattern at multiple levels: OTP supervision trees for in-process sidecars, Docker Compose for service-level sidecars, and conceptual sidecar relationships between umbrella applications that provide cross-cutting functionality to the broader platform. The pattern is particularly prevalent in the platform's quality monitoring infrastructure, where the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) operates as a platform-wide sidecar that observes and enforces quality standards without interfering with business logic execution.

## Historical Context and Motivation

The sidecar pattern emerged from the microservices movement of the early 2010s, where organizations decomposing monolithic applications into distributed services discovered that cross-cutting concerns such as service discovery, load balancing, circuit breaking, and observability needed to be implemented consistently across dozens or hundreds of services. Rather than embedding this logic into every service (creating tight coupling and maintenance burden), or centralizing it into a shared library (creating versioning and deployment coupling), the sidecar pattern externalizes cross-cutting logic into a co-deployed process that the primary service interacts with through local communication channels.

Netflix's Prana sidecar, Lyft's Envoy proxy (later adopted as the data plane in service meshes like Istio), and HashiCorp's Consul Connect popularized the pattern in the container orchestration world. In the BEAM ecosystem, however, the sidecar pattern has deeper roots -- the OTP supervision tree has always supported the concept of auxiliary processes co-supervised with primary workers. What the microservices world "discovered" in 2015 was already an established OTP practice since the 1990s.

The key insight is that cross-cutting concerns often have different lifecycle requirements than the primary business logic. A health checker needs to run even when the primary worker is busy. A telemetry reporter needs to flush metrics even when the primary worker is idle. A configuration watcher needs to detect changes independently of the primary worker's request processing cycle. By isolating these concerns into separate processes with their own failure domains, the system gains both separation of concerns and fault isolation.

## Technical Deep Dive

### BEAM-Native Sidecar Implementation

In the BEAM ecosystem, the Sidecar Pattern leverages OTP supervision trees rather than container-level isolation. A sidecar process is simply a child of the same supervisor as the primary process, started after the primary and configured with appropriate restart strategies:

```elixir
defmodule MyApp.PrimarySupervisor do
  @moduledoc """
  Supervision tree with sidecar processes for cross-cutting concerns.
  Sidecars share the supervisor's lifecycle with the primary worker.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # Primary application process
      {MyApp.PrimaryWorker, []},

      # Sidecar: Health check process
      {MyApp.HealthCheckSidecar, [target: MyApp.PrimaryWorker]},

      # Sidecar: Telemetry reporter
      {MyApp.TelemetryReporterSidecar, [source: MyApp.PrimaryWorker]},

      # Sidecar: Configuration watcher
      {MyApp.ConfigWatcherSidecar, [notify: MyApp.PrimaryWorker]}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

The `:rest_for_one` strategy is particularly well-suited for sidecar patterns: if the primary worker crashes, all sidecars restart with it. If a sidecar crashes, only sidecars started after it restart, leaving the primary worker and earlier sidecars undisturbed. This strategy encodes the dependency relationship between primary and sidecar processes directly in the supervision tree structure.

### Health Check Sidecar

A common sidecar implementation provides health checking for the primary process. The health check sidecar periodically queries the primary process and reports its status through [telemetry](@/glossary/telemetry.md) events, enabling external monitoring systems to detect degradation before it becomes visible to users:

```elixir
defmodule MyApp.HealthCheckSidecar do
  @moduledoc """
  Sidecar process that periodically checks the health of a primary
  worker and reports status via Telemetry events. Supports configurable
  check intervals and degradation detection through consecutive failure
  tracking.
  """

  use GenServer

  require Logger

  @check_interval :timer.seconds(30)
  @consecutive_failures_threshold 3

  @type health_status :: :healthy | :degraded | :unhealthy

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    target = Keyword.fetch!(opts, :target)
    GenServer.start_link(__MODULE__, %{target: target}, name: sidecar_name(target))
  end

  @spec current_status(module()) :: {:ok, health_status()} | {:error, :not_found}
  def current_status(target) do
    GenServer.call(sidecar_name(target), :get_status)
  end

  @impl true
  def init(state) do
    schedule_check()
    {:ok, Map.merge(state, %{status: :healthy, consecutive_failures: 0})}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply, {:ok, state.status}, state}
  end

  @impl true
  def handle_info(:check_health, state) do
    status = perform_health_check(state.target)
    consecutive = if status == :healthy, do: 0, else: state.consecutive_failures + 1

    effective_status =
      cond do
        consecutive >= @consecutive_failures_threshold -> :unhealthy
        consecutive > 0 -> :degraded
        true -> :healthy
      end

    if effective_status != state.status do
      :telemetry.execute(
        [:sidecar, :health, :status_change],
        %{consecutive_failures: consecutive},
        %{target: state.target, from: state.status, to: effective_status}
      )
      Logger.info("Health status change: #{state.target} #{state.status} -> #{effective_status}")
    end

    schedule_check()
    {:noreply, %{state | status: effective_status, consecutive_failures: consecutive}}
  end

  defp perform_health_check(target) do
    case GenServer.call(target, :health_check, 5_000) do
      :ok -> :healthy
      {:degraded, _reason} -> :degraded
      _ -> :unhealthy
    end
  rescue
    _ -> :unhealthy
  end

  defp schedule_check, do: Process.send_after(self(), :check_health, @check_interval)
  defp sidecar_name(target), do: Module.concat(target, HealthSidecar)
end
```

### Telemetry Reporter Sidecar

Another common sidecar pattern collects and reports telemetry from the primary process. The reporter buffers events and flushes them periodically to external systems, decoupling the primary process from the latency and failure modes of external telemetry backends:

```elixir
defmodule MyApp.TelemetryReporterSidecar do
  @moduledoc """
  Sidecar process that attaches to the primary worker's Telemetry
  events and aggregates metrics for external reporting. Buffers events
  in memory and flushes at configurable intervals to minimize external
  I/O impact on the primary worker.
  """

  use GenServer

  @flush_interval :timer.seconds(60)
  @max_buffer_size 10_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    source = Keyword.fetch!(opts, :source)
    GenServer.start_link(__MODULE__, %{source: source, buffer: [], buffer_size: 0})
  end

  @impl true
  def init(state) do
    attach_telemetry_handlers(state.source)
    schedule_flush()
    {:ok, state}
  end

  @impl true
  def handle_info({:telemetry_event, event, measurements, metadata}, state) do
    entry = %{
      event: event,
      measurements: measurements,
      metadata: metadata,
      timestamp: DateTime.utc_now()
    }

    new_state = %{state | buffer: [entry | state.buffer], buffer_size: state.buffer_size + 1}

    if new_state.buffer_size >= @max_buffer_size do
      flush_buffer(new_state)
    else
      {:noreply, new_state}
    end
  end

  @impl true
  def handle_info(:flush, state) do
    flush_buffer(state)
  end

  defp flush_buffer(state) do
    unless state.buffer_size == 0 do
      flush_to_external(Enum.reverse(state.buffer))
    end
    schedule_flush()
    {:noreply, %{state | buffer: [], buffer_size: 0}}
  end

  defp schedule_flush, do: Process.send_after(self(), :flush, @flush_interval)

  defp attach_telemetry_handlers(source) do
    :telemetry.attach_many(
      "#{__MODULE__}-#{source}",
      [
        [:prismatic, source, :request, :stop],
        [:prismatic, source, :error],
        [:prismatic, source, :health_check]
      ],
      &__MODULE__.handle_telemetry_event/4,
      %{reporter_pid: self()}
    )
  end

  def handle_telemetry_event(event, measurements, metadata, %{reporter_pid: pid}) do
    send(pid, {:telemetry_event, event, measurements, metadata})
  end

  defp flush_to_external(events) do
    :telemetry.execute(
      [:sidecar, :reporter, :flush],
      %{event_count: length(events)},
      %{events: events}
    )
  end
end
```

### Configuration Watcher Sidecar

The configuration watcher sidecar monitors external configuration sources and notifies the primary process of changes without requiring the primary to implement polling logic:

```elixir
defmodule MyApp.ConfigWatcherSidecar do
  @moduledoc """
  Sidecar that watches for configuration changes from external sources
  (environment variables, config files, remote config services) and
  notifies the primary worker when relevant configuration changes.
  """

  use GenServer

  @poll_interval :timer.seconds(30)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    notify_target = Keyword.fetch!(opts, :notify)
    GenServer.start_link(__MODULE__, %{notify: notify_target, current_config: %{}})
  end

  @impl true
  def init(state) do
    config = load_current_config()
    schedule_poll()
    {:ok, %{state | current_config: config}}
  end

  @impl true
  def handle_info(:poll_config, state) do
    new_config = load_current_config()

    if new_config != state.current_config do
      changes = diff_configs(state.current_config, new_config)
      GenServer.cast(state.notify, {:config_changed, changes})

      :telemetry.execute(
        [:sidecar, :config, :change_detected],
        %{change_count: map_size(changes)},
        %{target: state.notify}
      )
    end

    schedule_poll()
    {:noreply, %{state | current_config: new_config}}
  end

  defp load_current_config do
    Application.get_all_env(:my_app)
    |> Enum.into(%{})
  end

  defp diff_configs(old, new) do
    Map.merge(
      Map.take(new, Map.keys(new) -- Map.keys(old)),
      Map.filter(new, fn {k, v} -> Map.get(old, k) != v end)
    )
  end

  defp schedule_poll, do: Process.send_after(self(), :poll_config, @poll_interval)
end
```

### Container-Level Sidecars

For services that run outside the BEAM, Docker Compose provides sidecar deployment:

```yaml
# docker-compose.yml - Service-level sidecar pattern
services:
  prismatic:
    build: .
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - ollama

  # Ollama runs as a sidecar for AI inference
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          memory: 8G

  # Meilisearch runs as a sidecar for full-text search
  meilisearch:
    image: getmeili/meilisearch:latest
    ports:
      - "7700:7700"
    volumes:
      - meili_data:/meili_data
```

## Architecture and Implementation

### Sidecar Pattern in Prismatic Platform

The Prismatic Platform uses sidecars at three architectural levels:

| Level | Example | Communication | Lifecycle |
|-------|---------|--------------|-----------|
| Process-level | Quality Floor Guardian alongside app supervisors | Message passing | OTP supervision |
| Application-level | `prismatic_safety` alongside `prismatic_web` | Function calls | Umbrella start order |
| Service-level | Ollama alongside Prismatic release | HTTP/REST | Docker Compose |

### Quality Floor Guardian as Platform Sidecar

The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) is the most significant sidecar in the Prismatic Platform. It operates as a platform-wide sidecar that monitors quality metrics across all umbrella applications:

```elixir
defmodule PrismaticSafety.Application do
  @moduledoc """
  Application supervision tree for the PrismaticSafety umbrella app.
  All children operate as platform-wide sidecars providing quality
  monitoring, risk detection, and predictive prevention.
  """

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Quality Floor Guardian - platform-wide quality sidecar
      PrismaticSafety.QualityFloorGuardian,

      # Risk pattern detector - scanning sidecar
      PrismaticSafety.RiskPatternDetector,

      # Predictive pre-commit - prevention sidecar
      PrismaticSafety.PredictivePreCommit
    ]

    opts = [strategy: :one_for_one, name: PrismaticSafety.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

## Sidecar vs. Library Pattern

An important architectural distinction is when to use a sidecar versus a library:

| Criterion | Sidecar | Library |
|-----------|---------|---------|
| Lifecycle | Independent process with own failure domain | Runs in caller's process |
| State | Maintains own state across calls | Stateless or borrows caller's state |
| Communication | Asynchronous messages | Synchronous function calls |
| Failure isolation | Crashes independently | Crashes caller's process |
| Resource usage | Own memory allocation | Shares caller's memory |
| Concurrency | Runs concurrently with primary | Blocks primary during execution |
| Deployment | Can be updated independently | Updated with primary |
| Observability | Separately monitorable in [Observer](@/glossary/observer.md) | Invisible as separate entity |
| Use when | Cross-cutting concern needs own lifecycle | Utility function without state |

The general rule is: if the auxiliary functionality needs its own state, its own lifecycle, or its own failure domain, use a sidecar process. If it is a stateless transformation or utility, use a library module. In the Prismatic Platform, health checking, telemetry reporting, and configuration watching are sidecars because they maintain state and operate on their own schedules. JSON encoding, string manipulation, and data validation are libraries because they are stateless transformations.

## Sidecar Communication Patterns

Sidecars communicate with their primary processes through several patterns, each suited to different coupling requirements:

| Pattern | Direction | Coupling | Example |
|---------|-----------|----------|---------|
| **Telemetry Events** | Primary -> Sidecar | Loose (event-based) | Sidecar attaches to telemetry events |
| **Direct Message** | Sidecar -> Primary | Medium (message passing) | Config change notification |
| **Shared ETS** | Bidirectional | Loose (shared state) | Sidecar writes metrics, primary reads |
| **Registry Lookup** | Sidecar -> Primary | Loose (name-based) | Sidecar discovers primary via Registry |
| **Process Monitor** | Sidecar -> Primary | Medium (lifecycle awareness) | Sidecar monitors primary's liveness |

The lowest-coupling approach uses [telemetry](@/glossary/telemetry.md) events: the primary process emits telemetry events as part of its normal operation, and the sidecar attaches handlers to observe those events. The primary process does not know or care that a sidecar is listening. This is the preferred pattern in the Prismatic Platform for observability sidecars.

## Usage in Prismatic Platform

### Implementing a Custom Sidecar

```elixir
defmodule MyApp.CustomSidecar do
  @moduledoc """
  Template for implementing a sidecar process in the Prismatic Platform.
  Sidecars must follow OTP conventions and emit Telemetry events.
  Implements periodic health reporting and graceful shutdown.
  """

  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    primary = Keyword.fetch!(opts, :primary)
    GenServer.start_link(__MODULE__, %{primary: primary, metrics: %{}})
  end

  @impl true
  def init(state) do
    Process.monitor(state.primary)

    :telemetry.attach(
      "#{__MODULE__}-handler",
      [:prismatic, state.primary, :event],
      &handle_telemetry/4,
      %{sidecar_pid: self()}
    )

    {:ok, state}
  end

  @impl true
  def handle_info({:DOWN, _ref, :process, pid, reason}, %{primary: pid} = state) do
    Logger.warning("Primary process #{inspect(pid)} terminated: #{inspect(reason)}")
    {:stop, :primary_terminated, state}
  end

  @impl true
  def terminate(_reason, state) do
    :telemetry.detach("#{__MODULE__}-handler")
    :ok
  end

  defp handle_telemetry(_event, measurements, metadata, %{sidecar_pid: pid}) do
    send(pid, {:telemetry, measurements, metadata})
  end
end
```

### Ollama AI Sidecar Configuration

```elixir
# config/config.exs - Ollama sidecar configuration
config :prismatic_agents, :ollama,
  base_url: System.get_env("OLLAMA_BASE_URL", "http://localhost:11434"),
  models: ["qwen3-coder", "gpt-oss:20b", "deepseek-coder"],
  timeout: :timer.seconds(30),
  retry_count: 3,
  health_check_interval: :timer.seconds(60)
```

## Sidecar Anti-Patterns

Understanding what a sidecar should NOT do is as important as understanding what it should do:

| Anti-Pattern | Problem | Correct Approach |
|-------------|---------|-----------------|
| **Sidecar modifying primary's state** | Breaks encapsulation, creates race conditions | Sidecar sends messages; primary decides action |
| **Primary depending on sidecar** | Primary fails when sidecar is unavailable | Primary works degraded without sidecar |
| **Sidecar with business logic** | Violates separation of concerns | Sidecars handle cross-cutting concerns only |
| **Too many sidecars** | Process overhead, complexity | Consolidate related concerns into one sidecar |
| **Synchronous sidecar calls** | Sidecar latency blocks primary | Use async messages or telemetry events |

## Best Practices

1. **Use `:rest_for_one` supervision for sidecar trees**. This ensures sidecars restart when their primary crashes while allowing independent sidecar recovery.

2. **Keep sidecars stateless when possible**. Stateless sidecars are easier to restart and do not require state recovery logic.

3. **Emit Telemetry events from sidecars**. Other systems can observe sidecar behavior without coupling to sidecar internals.

4. **Design for independent deployment**. Sidecars should be upgradeable without modifying the primary application.

5. **Set appropriate timeouts for sidecar health checks**. A sidecar checking a slow service should not block indefinitely.

6. **Monitor the primary process from the sidecar**. Use `Process.monitor/1` so the sidecar can react when the primary terminates.

7. **Implement graceful shutdown**. Sidecars should flush pending work (metrics, logs) in their `terminate/2` callback.

8. **Avoid sidecar-to-sidecar communication**. Each sidecar should interact only with its primary process and external systems. Sidecar-to-sidecar communication creates hidden coupling.

## Common Pitfalls

- **Creating sidecars for simple utility functions**: If the concern does not need its own lifecycle, state, or failure domain, a library module is simpler and more appropriate than a sidecar process.

- **Tight coupling between sidecar and primary**: The sidecar should depend on the primary's interface, not its implementation. Reaching into the primary's internal state violates the pattern.

- **Ignoring sidecar resource consumption**: Each sidecar process consumes memory and CPU. In a platform with 115 applications, adding a sidecar to each creates 115 additional processes.

- **Not handling sidecar failures gracefully**: The primary application should function (possibly with degraded capability) even when its sidecars are temporarily unavailable.

- **Circular dependencies between sidecar and primary**: If the primary process needs the sidecar to function, and the sidecar needs the primary to function, the system cannot start. Design the startup sequence so the primary can operate in degraded mode until the sidecar is ready.

## Testing Sidecars

Testing sidecar processes requires verifying both the sidecar's behavior in isolation and its interaction with the primary process:

```elixir
defmodule MyApp.HealthCheckSidecarTest do
  use ExUnit.Case, async: true

  test "reports healthy when primary responds with :ok" do
    {:ok, primary} = MockPrimary.start_link(health_response: :ok)
    {:ok, sidecar} = MyApp.HealthCheckSidecar.start_link(target: primary)

    send(sidecar, :check_health)
    Process.sleep(50)

    assert {:ok, :healthy} = MyApp.HealthCheckSidecar.current_status(primary)
  end

  test "transitions to unhealthy after consecutive failures" do
    {:ok, primary} = MockPrimary.start_link(health_response: :error)
    {:ok, sidecar} = MyApp.HealthCheckSidecar.start_link(target: primary)

    for _ <- 1..3 do
      send(sidecar, :check_health)
      Process.sleep(50)
    end

    assert {:ok, :unhealthy} = MyApp.HealthCheckSidecar.current_status(primary)
  end
end
```

## Performance Considerations

The BEAM-native sidecar pattern has significant performance advantages over container-based sidecars:

| Metric | BEAM Sidecar | Container Sidecar |
|--------|-------------|------------------|
| **Communication latency** | ~1-10 microseconds (message passing) | ~100-1000 microseconds (loopback network) |
| **Memory overhead** | ~2-5 KB per process | ~10-50 MB per container |
| **Startup time** | ~microseconds | ~seconds |
| **Failure detection** | ~microseconds (monitor/link) | ~seconds (health check polling) |
| **Resource isolation** | Process-level (BEAM scheduler) | OS-level (cgroups/namespaces) |

For the Prismatic Platform with hundreds of sidecars, the BEAM-native approach saves gigabytes of memory and milliseconds of latency compared to container-based alternatives.

## Related Concepts

- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP hierarchy naturally modeling sidecar relationships
- [Docker](@/glossary/docker.md) -- Container runtime where sidecars run as secondary containers
- [Telemetry](@/glossary/telemetry.md) -- Metrics collection often implemented as a sidecar
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM isolation ensuring sidecar fault containment
- [Observability](@/glossary/observability.md) -- Cross-cutting concern commonly delegated to sidecars
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Platform-wide quality monitoring sidecar
- [GenServer](@/glossary/genserver.md) -- Process behaviour underlying sidecar implementations
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern protecting sidecars from cascade failures
- [Observer](@/glossary/observer.md) -- Tool for inspecting sidecar process state at runtime

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
