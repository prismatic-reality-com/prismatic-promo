+++
title = "System Health"
weight = 50
[extra]
tags = ["glossary", "architecture", "operations", "reliability", "monitoring", "health-checks", "degraded-mode", "observability", "OTP", "BEAM"]
description = "Comprehensive guide to system health monitoring, health check patterns, degraded mode detection, and self-healing mechanisms in distributed Elixir/OTP platforms"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
version = "2.0.0"
last_updated = "2026-02-22"
related_terms = ["health-monitoring", "monitoring", "telemetry", "supervision-tree", "fault-tolerance", "circuit-breaker", "quality-floor-guardian", "autoheal", "beam-vm", "otp", "genserver", "process-isolation", "performance"]
learning_outcomes = ["Understand system health as a multi-dimensional concept beyond simple up/down status", "Design and implement comprehensive health check hierarchies in Elixir/OTP", "Build degraded mode detection and graceful degradation strategies", "Implement self-healing patterns using OTP supervision and custom health monitors", "Integrate health telemetry with external monitoring infrastructure"]
prerequisites = ["Basic understanding of Elixir/OTP supervision trees", "Familiarity with GenServer and process-based architecture", "Knowledge of distributed systems concepts"]
key_concepts = ["Health check hierarchy", "Degraded mode detection", "Self-healing supervision", "Liveness vs readiness probes", "Health aggregation", "Cascade failure prevention"]
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
tldr = "System health encompasses the continuous assessment, monitoring, and self-healing of distributed platform components through layered health checks, degraded mode detection, and OTP-native supervision strategies."
word_count = 1727
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["System", "Health", "Comprehensive", "ElixirOTP", "glossary", "architecture", "Prismatic Platform", "The Prismatic", "Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "System Health - Prismatic Platform"
+++

## Definition

System health refers to the comprehensive, real-time assessment of a distributed software platform's operational status across multiple dimensions: process liveness, resource availability, dependency connectivity, performance characteristics, and functional correctness. Unlike simplistic binary alive/dead checks, modern system health monitoring produces a multi-dimensional health vector that captures the nuanced state of every subsystem, enabling intelligent routing, graceful degradation, and automated self-healing responses.

In the context of Elixir/OTP platforms, system health leverages the BEAM virtual machine's intrinsic process isolation, supervision hierarchies, and message-passing architecture to build health monitoring that is both deeply integrated with the runtime and resilient to the very failures it seeks to detect. The Prismatic Platform implements a 13-domain quality monitoring system that continuously tracks health across compilation, static analysis, runtime performance, memory safety, and regression prevention.

## Historical Context and Evolution

The concept of system health monitoring has evolved significantly from its origins in mainframe era heartbeat checks. Early Unix systems relied on simple process existence checks via `kill -0` and cron-based watchdog scripts. The emergence of distributed systems in the 1990s introduced the need for more sophisticated health assessment, with projects like Nagios and Zabbix providing agent-based monitoring.

The cloud-native revolution brought Kubernetes liveness and readiness probes, establishing the principle that health is not a single boolean but a multi-faceted assessment. A service can be alive (its process exists) but not ready (it has not completed initialization) or degraded (it is functioning but with reduced capacity).

Erlang/OTP pioneered a fundamentally different approach: rather than external monitoring agents polling application state, the runtime itself provides built-in supervision, process linking, and failure detection. The BEAM VM's lightweight process model means that health monitoring processes carry negligible overhead, and the "let it crash" philosophy transforms failure detection from an afterthought into a core architectural principle.

The Prismatic Platform synthesizes these traditions, combining OTP-native health supervision with modern observability patterns, telemetry-driven metrics, and the Quality Floor Guardian autonomous monitoring system.

## Platform Context

Within the Prismatic Platform, system health operates as a critical infrastructure concern spanning all 115 umbrella applications. The platform's health monitoring architecture consists of several interconnected layers.

The **Quality Floor Guardian** (`prismatic_safety/quality_floor_guardian.ex`) serves as the autonomous quality monitoring agent, enforcing health across 13 quality domains with escalation levels from OPTIMAL (100-99%) through WARNING (98-99%), CRITICAL (95-98%), to EMERGENCY (below 95%). This guardian operates continuously, blocking commits and triggering investigations when health degrades.

The **PrismaticSupervisor** provides dependency-aware startup orchestration, ensuring that health checks account for inter-application dependencies. A service is not considered healthy until all its declared dependencies have also passed their health checks, preventing cascade failures during startup.

The **Autoheal system** (`mix autoheal.baseline`, `mix autoheal.cycle`) implements automated self-healing cycles that detect quality degradation and apply corrective measures without human intervention, embodying the platform's "NO MERCY, NO DOUBTS" doctrine of zero tolerance for health violations.

## Health Check Architecture

A robust health check architecture requires multiple layers of assessment, each operating at different granularities and frequencies.

### Liveness, Readiness, and Startup Probes

Following Kubernetes conventions adapted for OTP, the Prismatic Platform distinguishes three probe types:

```elixir
defmodule Prismatic.Health.ProbeServer do
  @moduledoc """
  Multi-probe health check server implementing liveness, readiness, and startup
  probes for Kubernetes-compatible health assessment in OTP applications.

  Liveness probes verify the process is alive and not deadlocked.
  Readiness probes verify the service can accept and process requests.
  Startup probes verify initial bootstrapping has completed.
  """

  use GenServer

  require Logger

  @type probe_type :: :liveness | :readiness | :startup
  @type health_status :: :healthy | :degraded | :unhealthy | :unknown
  @type probe_result :: %{
          status: health_status(),
          probe: probe_type(),
          timestamp: DateTime.t(),
          duration_us: non_neg_integer(),
          details: map()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec check(GenServer.server(), probe_type()) :: probe_result()
  def check(server \\ __MODULE__, probe_type) do
    GenServer.call(server, {:check, probe_type}, :timer.seconds(5))
  end

  @spec check_all(GenServer.server()) :: %{probe_type() => probe_result()}
  def check_all(server \\ __MODULE__) do
    GenServer.call(server, :check_all, :timer.seconds(10))
  end

  @impl true
  def init(opts) do
    checks = Keyword.get(opts, :checks, default_checks())
    schedule_periodic_check()

    state = %{
      checks: checks,
      last_results: %{},
      startup_complete: false,
      started_at: System.monotonic_time(:millisecond)
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:check, probe_type}, _from, state) do
    {result, new_state} = execute_probe(probe_type, state)
    {:reply, result, new_state}
  end

  @impl true
  def handle_call(:check_all, _from, state) do
    results =
      [:liveness, :readiness, :startup]
      |> Enum.map(fn probe_type ->
        {result, _state} = execute_probe(probe_type, state)
        {probe_type, result}
      end)
      |> Map.new()

    {:reply, results, state}
  end

  @impl true
  def handle_info(:periodic_check, state) do
    {_result, new_state} = execute_probe(:liveness, state)
    schedule_periodic_check()
    {:noreply, new_state}
  end

  defp execute_probe(probe_type, state) do
    start_time = System.monotonic_time(:microsecond)
    check_fn = Map.get(state.checks, probe_type, fn -> :healthy end)

    {status, details} =
      try do
        case check_fn.() do
          :healthy -> {:healthy, %{}}
          {:healthy, details} -> {:healthy, details}
          :degraded -> {:degraded, %{}}
          {:degraded, details} -> {:degraded, details}
          :unhealthy -> {:unhealthy, %{}}
          {:unhealthy, details} -> {:unhealthy, details}
        end
      rescue
        error ->
          {:unhealthy, %{error: Exception.message(error)}}
      end

    duration = System.monotonic_time(:microsecond) - start_time

    result = %{
      status: status,
      probe: probe_type,
      timestamp: DateTime.utc_now(),
      duration_us: duration,
      details: details
    }

    :telemetry.execute(
      [:prismatic, :health, :probe],
      %{duration: duration},
      %{probe: probe_type, status: status}
    )

    new_state = put_in(state, [:last_results, probe_type], result)
    {result, new_state}
  end

  defp schedule_periodic_check do
    Process.send_after(self(), :periodic_check, :timer.seconds(30))
  end

  defp default_checks do
    %{
      liveness: &check_liveness/0,
      readiness: &check_readiness/0,
      startup: &check_startup/0
    }
  end

  defp check_liveness do
    case Process.info(self(), :message_queue_len) do
      {:message_queue_len, len} when len < 10_000 -> :healthy
      {:message_queue_len, len} -> {:degraded, %{queue_length: len}}
      nil -> :unhealthy
    end
  end

  defp check_readiness do
    :healthy
  end

  defp check_startup do
    :healthy
  end
end
```

### Hierarchical Health Aggregation

Individual component health checks must be aggregated into a system-wide health assessment. The aggregation follows the supervision tree topology, where a parent node's health is derived from its children's health states.

```elixir
defmodule Prismatic.Health.Aggregator do
  @moduledoc """
  Aggregates health status from multiple components into a hierarchical
  system health assessment. Follows supervision tree topology for
  accurate dependency-aware health reporting.
  """

  @type component_health :: %{
          name: String.t(),
          status: :healthy | :degraded | :unhealthy,
          children: [component_health()],
          weight: float()
        }

  @type aggregate_result :: %{
          overall: :healthy | :degraded | :unhealthy,
          score: float(),
          components: [component_health()],
          timestamp: DateTime.t()
        }

  @spec aggregate([component_health()]) :: aggregate_result()
  def aggregate(components) do
    weighted_scores =
      Enum.map(components, fn component ->
        score = status_to_score(component.status)
        child_score = aggregate_children(component.children)
        combined = score * 0.6 + child_score * 0.4
        {component.name, combined * component.weight}
      end)

    total_weight = components |> Enum.map(& &1.weight) |> Enum.sum()

    overall_score =
      if total_weight > 0 do
        weighted_scores |> Enum.map(&elem(&1, 1)) |> Enum.sum() |> Kernel./(total_weight)
      else
        0.0
      end

    %{
      overall: score_to_status(overall_score),
      score: Float.round(overall_score, 4),
      components: components,
      timestamp: DateTime.utc_now()
    }
  end

  defp aggregate_children([]), do: 1.0

  defp aggregate_children(children) do
    scores = Enum.map(children, &status_to_score(&1.status))
    Enum.sum(scores) / length(scores)
  end

  defp status_to_score(:healthy), do: 1.0
  defp status_to_score(:degraded), do: 0.5
  defp status_to_score(:unhealthy), do: 0.0

  defp score_to_status(score) when score >= 0.8, do: :healthy
  defp score_to_status(score) when score >= 0.4, do: :degraded
  defp score_to_status(_score), do: :unhealthy
end
```

## Degraded Mode Detection

Degraded mode represents a state between fully healthy and fully failed -- the system continues to function but with reduced capabilities, capacity, or reliability. Detecting and responding to degraded mode is critical for maintaining user experience during partial failures.

### Degradation Signals

The Prismatic Platform monitors several categories of degradation signals. **Latency degradation** occurs when response times exceed baseline thresholds but remain below hard failure limits. **Throughput degradation** manifests as reduced request processing capacity. **Error rate elevation** indicates increased failure rates that have not yet triggered circuit breakers. **Resource pressure** reflects memory, CPU, or connection pool exhaustion approaching critical thresholds. **Dependency degradation** propagates when upstream services report degraded status.

### Graceful Degradation Strategies

When degradation is detected, the platform applies graduated response strategies. Feature shedding disables non-essential features to preserve core functionality. Rate limiting reduces incoming traffic to match available capacity. Cache fallback serves stale cached data when upstream sources are degraded. Circuit breaking isolates failing dependencies to prevent cascade failures. Queue buffering absorbs traffic spikes by buffering requests for later processing.

## Self-Healing Patterns

The Prismatic Platform implements automated self-healing through OTP supervision patterns extended with platform-specific recovery logic.

### Supervision-Based Recovery

OTP supervision trees provide the foundation for self-healing. When a process crashes, its supervisor automatically restarts it according to the configured strategy (`:one_for_one`, `:one_for_all`, `:rest_for_one`). The Prismatic Platform extends this with domain-specific supervisors that understand application semantics.

```elixir
defmodule Prismatic.Health.SelfHealing do
  @moduledoc """
  Self-healing coordinator that monitors health signals and triggers
  automated recovery actions based on degradation patterns.

  Implements escalating recovery strategies from simple restarts
  through state reconstruction to full subsystem reinitialization.
  """

  use GenServer

  require Logger

  @type recovery_action :: :restart_process | :clear_cache | :reconnect | :reinitialize
  @type healing_result :: {:ok, recovery_action()} | {:error, term()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec trigger_healing(atom(), map()) :: healing_result()
  def trigger_healing(component, context) do
    GenServer.call(__MODULE__, {:heal, component, context})
  end

  @impl true
  def init(opts) do
    state = %{
      healing_history: [],
      max_heal_attempts: Keyword.get(opts, :max_attempts, 3),
      cooldown_ms: Keyword.get(opts, :cooldown_ms, :timer.seconds(30))
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:heal, component, context}, _from, state) do
    recent_attempts = count_recent_attempts(component, state)

    if recent_attempts >= state.max_heal_attempts do
      Logger.warning("Healing attempts exhausted for #{component}, escalating")

      :telemetry.execute(
        [:prismatic, :health, :healing_exhausted],
        %{attempts: recent_attempts},
        %{component: component}
      )

      {:reply, {:error, :attempts_exhausted}, state}
    else
      action = select_recovery_action(component, context, recent_attempts)
      result = execute_recovery(component, action)

      entry = %{
        component: component,
        action: action,
        result: result,
        timestamp: System.monotonic_time(:millisecond)
      }

      new_state = %{state | healing_history: [entry | state.healing_history]}

      :telemetry.execute(
        [:prismatic, :health, :healing_executed],
        %{attempt: recent_attempts + 1},
        %{component: component, action: action, result: elem(result, 0)}
      )

      {:reply, result, new_state}
    end
  end

  defp count_recent_attempts(component, state) do
    cutoff = System.monotonic_time(:millisecond) - state.cooldown_ms

    state.healing_history
    |> Enum.filter(fn entry ->
      entry.component == component and entry.timestamp > cutoff
    end)
    |> length()
  end

  defp select_recovery_action(_component, _context, 0), do: :restart_process
  defp select_recovery_action(_component, _context, 1), do: :clear_cache
  defp select_recovery_action(_component, _context, _n), do: :reinitialize

  defp execute_recovery(component, :restart_process) do
    Logger.info("Self-healing: restarting process for #{component}")
    {:ok, :restart_process}
  end

  defp execute_recovery(component, :clear_cache) do
    Logger.info("Self-healing: clearing cache for #{component}")
    {:ok, :clear_cache}
  end

  defp execute_recovery(component, :reconnect) do
    Logger.info("Self-healing: reconnecting for #{component}")
    {:ok, :reconnect}
  end

  defp execute_recovery(component, :reinitialize) do
    Logger.info("Self-healing: reinitializing #{component}")
    {:ok, :reinitialize}
  end
end
```

## BEAM VM Health Introspection

The BEAM virtual machine provides rich introspection capabilities that form the foundation of health monitoring in Elixir/OTP systems.

### Process Health Metrics

The BEAM exposes detailed process-level metrics through `:erlang.process_info/2`. Key health indicators include message queue length (a growing queue signals overload), heap size (indicates memory pressure), reductions (measures computational work), and status (running, waiting, suspended). The Prismatic Platform monitors these metrics across all critical processes, alerting when any metric deviates from established baselines.

### Scheduler Health

The BEAM's preemptive scheduler distributes work across available CPU cores. Scheduler utilization can be monitored via `:scheduler.utilization/1`, providing per-scheduler CPU usage data. Consistently high scheduler utilization (above 90%) indicates computational bottleneck, while uneven distribution across schedulers suggests affinity issues or lock contention.

### Memory Subsystem Health

The BEAM manages multiple memory allocators (binary, ETS, process heaps, atom table). Each allocator's usage can be queried via `:erlang.memory/0`. The atom table deserves special attention because atoms are never garbage collected -- unbounded atom creation represents a memory leak that eventually crashes the VM. The Prismatic Platform tracks atom count growth rate and alerts on anomalous increases.

## Health Check Endpoint Design

Production deployments expose health check endpoints for load balancers, orchestrators, and monitoring systems. The endpoint design must balance information richness with security (avoiding information leakage) and performance (health checks must be lightweight).

### HTTP Health Endpoint Pattern

A well-designed health endpoint returns structured JSON with component-level detail, supports depth parameters for controlling response granularity, and includes cache headers to prevent monitoring systems from overwhelming the health check infrastructure.

The response should include an overall status, a list of component statuses with optional details, and metadata such as the application version and uptime. For Kubernetes deployments, separate `/healthz` (liveness), `/readyz` (readiness), and `/startupz` (startup) endpoints allow the orchestrator to make independent decisions about pod lifecycle management.

## Integration with Quality Floor Guardian

The Prismatic Platform's Quality Floor Guardian extends traditional health monitoring into the code quality domain. It continuously monitors 13 quality domains (Dialyzer, Credo, compilation warnings, DateTime precision, guard functions, @impl coverage, memory safety, performance, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access) and enforces health floors.

When any quality domain drops below its health threshold, the Guardian triggers graduated responses: OPTIMAL mode (100-99%) applies monitoring only, WARNING mode (98-99%) triggers alerts and investigation, CRITICAL mode (95-98%) initiates auto-evolution, and EMERGENCY mode (below 95%) blocks all commits and escalates to human review.

This quality-as-health paradigm treats code quality degradation as a system health concern equivalent to runtime failures, ensuring that the platform's health encompasses both operational and developmental dimensions.

## Health Telemetry and Observability

Modern health monitoring integrates with the broader observability stack through structured telemetry events, distributed tracing, and metric aggregation.

### Telemetry Event Design

The Prismatic Platform emits health telemetry events using the `:telemetry` library, following the standard `[application, subsystem, event]` naming convention. Health probe results, healing actions, and aggregation outcomes all produce telemetry events that can be consumed by any attached handler -- whether for Prometheus export, log aggregation, or custom alerting.

### Distributed Health Coordination

In clustered deployments, health status must be coordinated across nodes. The platform uses Erlang distribution and the Horde library for cluster-wide health aggregation, ensuring that load balancers receive accurate health information even when individual nodes experience partial failures.

## Anti-Patterns and Common Pitfalls

Several common mistakes undermine health monitoring effectiveness. **Shallow health checks** that only verify process existence miss functional degradation -- a process can be alive but deadlocked or producing incorrect results. **Synchronous dependency checks** in health endpoints create cascading timeouts when dependencies are slow. **Missing timeout enforcement** allows health checks to hang indefinitely, ironically making the health monitoring system itself unhealthy. **Binary health reporting** (only healthy/unhealthy) loses the nuance of degraded states that enable graceful degradation. **Health check side effects** where the act of checking health modifies system state introduces observer effects that can mask or cause problems.

The Prismatic Platform's health architecture avoids these anti-patterns through asynchronous probe execution, configurable timeouts, multi-state health reporting, and read-only health check implementations.

## Real-World Case Study: Prismatic Platform Health Architecture

The Prismatic Platform's health architecture demonstrates these principles in production. With 115 umbrella applications, the platform faces the challenge of monitoring health across a complex dependency graph.

The PrismaticSupervisor performs dependency-aware startup, building a directed acyclic graph (DAG) of application dependencies and starting applications in topological order. Each application registers its health check functions with the central health aggregator during startup. The aggregator periodically polls all registered checks and computes the hierarchical health assessment.

The Autoheal system monitors the aggregated health score and triggers graduated self-healing responses. For quality degradation, it runs `mix autoheal.cycle` to identify and fix quality violations. For runtime degradation, it triggers process restarts through the supervision tree. For persistent degradation, it escalates to human review through GitLab issue creation.

This architecture has maintained the platform at 100/100 quality score across all 13 domains, demonstrating that comprehensive health monitoring combined with automated self-healing can sustain excellence at scale.

## Related Terms

- [Health Monitoring](@/glossary/health-monitoring.md) -- dedicated monitoring infrastructure for health status tracking
- [Monitoring](@/glossary/monitoring.md) -- broader monitoring concepts including metrics, logs, and traces
- [Telemetry](@/glossary/telemetry.md) -- structured event emission for observability
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP supervision hierarchies that underpin self-healing
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- system resilience to component failures
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- failure isolation pattern for dependency management
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- autonomous quality health monitoring
- [Autoheal](@/glossary/autoheal.md) -- automated self-healing cycle system
- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine providing runtime health introspection
- [Process Isolation](@/glossary/process-isolation.md) -- process-level fault containment
- [GenServer](@/glossary/genserver.md) -- the OTP behaviour used for health check servers
- [Performance](@/glossary/performance.md) -- performance dimension of system health

## Further Reading

- Armstrong, Joe. "Making Reliable Distributed Systems in the Presence of Software Errors." PhD thesis, Royal Institute of Technology, Stockholm, 2003.
- Nygard, Michael T. "Release It! Design and Deploy Production-Ready Software." Pragmatic Bookshelf, 2018.
- Beyer, Betsy, et al. "Site Reliability Engineering: How Google Runs Production Systems." O'Reilly Media, 2016.
- Elixir Telemetry documentation: https://hexdocs.pm/telemetry/
- Kubernetes health check patterns: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
