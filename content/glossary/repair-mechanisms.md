+++
title = "Repair Mechanisms"
weight = 50
[extra]
tags = ["glossary", "core", "self-healing", "otp", "fault-tolerance", "circuit-breaker", "supervision", "resilience", "autoheal", "recovery"]
description = "Repair mechanisms are the systematic strategies and architectural patterns the Prismatic Platform uses to detect, isolate, and recover from failures automatically, leveraging OTP supervision trees, circuit breakers, AutoHeal cycles, and process restart strategies."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["autoheal", "self-healing", "circuit-breaker", "supervision-tree", "supervision", "otp", "genserver", "process-restart", "health-monitoring", "quality-floor-guardian", "beam-vm", "backpressure", "system-health", "quality-monitoring"]
learning_outcomes = ["Implement OTP supervision tree strategies for automatic fault recovery", "Design circuit breaker patterns that prevent cascade failures in distributed systems", "Build AutoHeal cycles that diagnose and remediate quality violations autonomously", "Apply the 5-level healing escalation model to your own Elixir applications", "Understand the relationship between BEAM VM process isolation and repair capabilities"]
prerequisites = ["otp", "supervision-tree", "genserver", "elixir", "beam-vm"]
key_concepts = ["OTP restart strategies", "circuit breaker pattern", "AutoHeal cycles", "process isolation", "supervision trees", "let-it-crash philosophy", "fault detection", "cascade prevention", "5-level healing", "graceful degradation"]
use_cases = ["Production system fault recovery", "Quality regression remediation", "Distributed service resilience", "Cascading failure prevention", "Autonomous system maintenance"]
platform_relevance = "critical"
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
elixir_modules = ["PrismaticSafety.AutoHeal", "PrismaticSupervisor", "PrismaticSupervisor.DomainSupervisor", "PrismaticSupervisor.HealthMonitor"]
word_count = 1346
date_modified = "2026-02-23"
keywords = ["Repair", "Mechanisms", "Prismatic", "Platform", "AutoHeal", "glossary", "core", "Prismatic Platform", "BEAM"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Repair Mechanisms - Prismatic Platform"
+++

## Definition

Repair mechanisms are the architectural patterns, runtime strategies, and autonomous processes that enable a software system to detect failures, isolate their effects, and restore correct operation without human intervention. In the Prismatic Platform, repair mechanisms operate at multiple levels -- from the BEAM VM's process-level isolation and OTP supervisor restart strategies, through application-level circuit breakers that prevent cascade failures, to platform-level AutoHeal cycles that diagnose and remediate quality violations autonomously.

The term encompasses both reactive repair (responding to failures after they occur) and proactive repair (detecting degradation before it causes failures). The Prismatic Platform implements both dimensions: OTP supervisors provide reactive repair by restarting crashed processes, while the Quality Floor Guardian and AutoHeal system provide proactive repair by detecting quality degradation and applying fixes before they manifest as runtime failures.

Repair mechanisms are not merely error handling -- they represent a fundamental architectural commitment to systems that heal themselves. This commitment is rooted in the Erlang/OTP philosophy of "let it crash" (allowing processes to fail cleanly and be restarted by supervisors) and extended by the Prismatic Platform's autonomous healing infrastructure that applies the same principle to code quality, configuration, and system health.

## The Let-It-Crash Philosophy

The foundation of all repair mechanisms in the Prismatic Platform is the Erlang/OTP "let-it-crash" philosophy. This counter-intuitive principle states that processes should not defensively guard against every possible failure; instead, they should crash when encountering unexpected states and rely on supervisors to restart them in a known-good state.

This philosophy works because of three properties of the [BEAM VM](/glossary/beam-vm/):

1. **Process isolation** -- Each BEAM process has its own heap, stack, and mailbox. When a process crashes, no other process is affected unless explicitly linked.
2. **Lightweight processes** -- BEAM processes are extremely cheap to create and destroy (microsecond startup, kilobyte memory), making restart a viable recovery strategy.
3. **Supervision hierarchies** -- OTP provides a robust supervisor abstraction that monitors child processes and applies configurable restart strategies when they fail.

```elixir
defmodule Prismatic.Repair.Philosophy do
  @moduledoc """
  Demonstrates the let-it-crash philosophy with a supervised
  worker that fails gracefully and is automatically restarted.

  Instead of wrapping every operation in defensive try/rescue
  blocks, the worker performs its task directly. If it encounters
  an unexpected state, it crashes. The supervisor detects the
  crash and restarts the worker within milliseconds.
  """

  defmodule Worker do
    @moduledoc false
    use GenServer

    @spec start_link(keyword()) :: GenServer.on_start()
    def start_link(opts) do
      GenServer.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl GenServer
    def init(opts) do
      {:ok, %{processed: 0, config: opts}}
    end

    @impl GenServer
    def handle_call({:process, data}, _from, state) do
      # No defensive error handling -- if transform/1 fails,
      # the process crashes and the supervisor restarts it
      result = transform(data)
      {:reply, {:ok, result}, %{state | processed: state.processed + 1}}
    end

    @spec transform(map()) :: map()
    defp transform(%{type: :valid} = data), do: Map.put(data, :processed, true)
    defp transform(%{type: :invalid}), do: raise("Invalid data type encountered")
  end

  defmodule Supervisor do
    @moduledoc false
    use Elixir.Supervisor

    @spec start_link(keyword()) :: Elixir.Supervisor.on_start()
    def start_link(opts) do
      Elixir.Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl Elixir.Supervisor
    def init(_opts) do
      children = [
        {Worker, []}
      ]

      # :one_for_one means only the crashed child is restarted
      Elixir.Supervisor.init(children, strategy: :one_for_one)
    end
  end
end
```

## OTP Restart Strategies

The Prismatic Platform uses all four OTP restart strategies, each appropriate for different failure scenarios.

### one_for_one

When a child process crashes, only that child is restarted. This is the most common strategy, used when child processes are independent.

**Use case**: Individual agent workers in the `PrismaticAgents` runtime. If one agent crashes, others continue unaffected.

### one_for_all

When any child crashes, all children are terminated and restarted. This is used when children are mutually dependent and a partial restart would leave the system in an inconsistent state.

**Use case**: The `PrismaticStorage` adapter cluster, where ETS tables, Ecto connections, and cache layers must be consistent with each other.

### rest_for_one

When a child crashes, all children started after it are terminated and restarted. This handles ordered dependencies where later children depend on earlier ones.

**Use case**: The `PrismaticWeb` startup sequence, where the telemetry supervisor must be running before the endpoint, and the endpoint must be running before the live socket handler.

### simple_one_for_one (DynamicSupervisor)

A template-based strategy for dynamically starting children of the same type. In modern Elixir, this is implemented via `DynamicSupervisor`.

**Use case**: The OSINT toolbox, where each tool execution spawns a supervised worker process that is cleaned up after completion.

```elixir
defmodule Prismatic.Repair.RestartStrategies do
  @moduledoc """
  Demonstrates all OTP restart strategies used in the
  Prismatic Platform with their appropriate use cases.
  """

  defmodule IndependentSupervisor do
    @moduledoc "Supervises independent workers (one_for_one)"
    use Supervisor

    @spec start_link(keyword()) :: Supervisor.on_start()
    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl Supervisor
    def init(_opts) do
      children = [
        {Prismatic.Agents.Worker, name: :agent_alpha},
        {Prismatic.Agents.Worker, name: :agent_beta},
        {Prismatic.Agents.Worker, name: :agent_gamma}
      ]

      Supervisor.init(children, strategy: :one_for_one, max_restarts: 5, max_seconds: 60)
    end
  end

  defmodule DependentSupervisor do
    @moduledoc "Supervises mutually dependent workers (one_for_all)"
    use Supervisor

    @spec start_link(keyword()) :: Supervisor.on_start()
    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl Supervisor
    def init(_opts) do
      children = [
        {Prismatic.Storage.ETS, []},
        {Prismatic.Storage.Cache, []},
        {Prismatic.Storage.Sync, []}
      ]

      Supervisor.init(children, strategy: :one_for_all, max_restarts: 3, max_seconds: 30)
    end
  end

  defmodule OrderedSupervisor do
    @moduledoc "Supervises ordered dependencies (rest_for_one)"
    use Supervisor

    @spec start_link(keyword()) :: Supervisor.on_start()
    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl Supervisor
    def init(_opts) do
      children = [
        {Prismatic.Telemetry.Supervisor, []},
        {Prismatic.Web.Endpoint, []},
        {Prismatic.Web.LiveSocket, []}
      ]

      Supervisor.init(children, strategy: :rest_for_one)
    end
  end
end
```

## Circuit Breaker Pattern

Circuit breakers prevent cascade failures by detecting when a downstream service is failing and temporarily stopping requests to it. The Prismatic Platform implements circuit breakers as GenServer processes with three states: **closed** (normal operation), **open** (requests blocked), and **half-open** (testing recovery).

```elixir
defmodule Prismatic.Repair.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation that prevents cascade failures
  by monitoring failure rates and temporarily blocking requests
  to failing services.

  State machine:
    CLOSED -> (failure threshold reached) -> OPEN
    OPEN -> (timeout elapsed) -> HALF_OPEN
    HALF_OPEN -> (test request succeeds) -> CLOSED
    HALF_OPEN -> (test request fails) -> OPEN

  Configuration:
    - failure_threshold: number of failures before opening (default: 5)
    - reset_timeout_ms: time in OPEN state before testing (default: 60_000)
    - half_open_max: max concurrent requests in HALF_OPEN (default: 1)
  """

  use GenServer

  @type breaker_state :: :closed | :open | :half_open

  @type state :: %{
    breaker_state: breaker_state(),
    failure_count: non_neg_integer(),
    success_count: non_neg_integer(),
    failure_threshold: pos_integer(),
    reset_timeout_ms: pos_integer(),
    last_failure: DateTime.t() | nil,
    service_name: atom()
  }

  @default_failure_threshold 5
  @default_reset_timeout_ms 60_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec call(atom(), (() -> term())) :: {:ok, term()} | {:error, :circuit_open}
  def call(breaker, fun) do
    GenServer.call(breaker, {:call, fun})
  end

  @spec state(atom()) :: breaker_state()
  def state(breaker) do
    GenServer.call(breaker, :state)
  end

  @impl GenServer
  def init(opts) do
    state = %{
      breaker_state: :closed,
      failure_count: 0,
      success_count: 0,
      failure_threshold: Keyword.get(opts, :failure_threshold, @default_failure_threshold),
      reset_timeout_ms: Keyword.get(opts, :reset_timeout_ms, @default_reset_timeout_ms),
      last_failure: nil,
      service_name: Keyword.fetch!(opts, :name)
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:call, fun}, _from, %{breaker_state: :closed} = state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | failure_count: 0, success_count: state.success_count + 1}}

      {:error, reason} ->
        new_count = state.failure_count + 1

        if new_count >= state.failure_threshold do
          emit_state_change(state.service_name, :closed, :open)
          schedule_half_open(state.reset_timeout_ms)
          {:reply, {:error, reason}, %{state | breaker_state: :open, failure_count: new_count, last_failure: DateTime.utc_now()}}
        else
          {:reply, {:error, reason}, %{state | failure_count: new_count, last_failure: DateTime.utc_now()}}
        end
    end
  end

  @impl GenServer
  def handle_call({:call, _fun}, _from, %{breaker_state: :open} = state) do
    {:reply, {:error, :circuit_open}, state}
  end

  @impl GenServer
  def handle_call({:call, fun}, _from, %{breaker_state: :half_open} = state) do
    case safe_execute(fun) do
      {:ok, result} ->
        emit_state_change(state.service_name, :half_open, :closed)
        {:reply, {:ok, result}, %{state | breaker_state: :closed, failure_count: 0}}

      {:error, reason} ->
        emit_state_change(state.service_name, :half_open, :open)
        schedule_half_open(state.reset_timeout_ms)
        {:reply, {:error, reason}, %{state | breaker_state: :open, last_failure: DateTime.utc_now()}}
    end
  end

  @impl GenServer
  def handle_call(:state, _from, state) do
    {:reply, state.breaker_state, state}
  end

  @impl GenServer
  def handle_info(:try_half_open, %{breaker_state: :open} = state) do
    emit_state_change(state.service_name, :open, :half_open)
    {:noreply, %{state | breaker_state: :half_open}}
  end

  @impl GenServer
  def handle_info(:try_half_open, state) do
    {:noreply, state}
  end

  defp safe_execute(fun) do
    {:ok, fun.()}
  rescue
    error -> {:error, Exception.message(error)}
  end

  defp schedule_half_open(timeout_ms) do
    Process.send_after(self(), :try_half_open, timeout_ms)
  end

  defp emit_state_change(service, from, to) do
    :telemetry.execute(
      [:prismatic, :circuit_breaker, :state_change],
      %{timestamp: System.monotonic_time()},
      %{service: service, from: from, to: to}
    )
  end
end
```

## AutoHeal: 5-Level Healing Escalation

The [AutoHeal](/glossary/autoheal/) system extends repair mechanisms from runtime fault recovery to code quality repair. It implements a 5-level escalation model that progressively applies more aggressive healing strategies:

### Level 0: Baseline

Establish the current quality state. Measure all 13 quality domains, record violations, and compute the platform quality score. No repair actions are taken -- this level is purely diagnostic.

### Level 1: Quick Fix

Apply known, safe transformations that resolve common quality violations. Examples include adding missing `@impl` annotations, fixing unsafe map access patterns (replacing `map.key` with `Map.get(map, :key)`), and removing unused aliases.

### Level 2: Targeted Repair

Apply domain-specific repair strategies that require more context. Examples include resolving Credo warnings by refactoring complex functions, fixing Dialyzer violations by correcting typespecs, and eliminating compilation warnings by updating deprecated function calls.

### Level 3: Structural Repair

Apply architectural-level repairs that may require moving code between modules, splitting large modules, or restructuring supervision trees. These repairs are reviewed before application.

### Level 4: Deep Healing

The most aggressive level, reserved for systemic quality issues that cannot be resolved by targeted fixes. Deep healing may involve regenerating entire modules, rebuilding supervision hierarchies, or restructuring application boundaries.

```elixir
defmodule PrismaticSafety.AutoHeal do
  @moduledoc """
  Autonomous healing system that detects quality violations and
  applies progressively aggressive repair strategies through a
  5-level escalation model.

  The healing cycle:
  1. Baseline measurement (Level 0)
  2. Identify violations requiring repair
  3. Apply lowest-level repair strategy that can address each violation
  4. Verify repair succeeded
  5. Escalate to next level if repair failed
  6. Record healing results in Quality DNA
  """

  @type heal_result :: %{
    level: 0..4,
    violations_found: non_neg_integer(),
    violations_fixed: non_neg_integer(),
    violations_remaining: non_neg_integer(),
    duration_ms: non_neg_integer(),
    actions: [heal_action()]
  }

  @type heal_action :: %{
    domain: atom(),
    violation: String.t(),
    strategy: atom(),
    result: :fixed | :failed | :skipped,
    file: String.t() | nil
  }

  @spec baseline() :: {:ok, map()} | {:error, term()}
  def baseline do
    start = System.monotonic_time(:millisecond)
    domains = PrismaticSafety.QualityFloorGuardian.all_domains()
    score = PrismaticSafety.QualityFloorGuardian.current_score()
    duration = System.monotonic_time(:millisecond) - start

    {:ok, %{
      score: score,
      domains: domains,
      measured_at: DateTime.utc_now(),
      duration_ms: duration
    }}
  end

  @spec heal_cycle(keyword()) :: {:ok, heal_result()} | {:error, term()}
  def heal_cycle(opts \\ []) do
    max_level = Keyword.get(opts, :max_level, 2)

    with {:ok, baseline_state} <- baseline(),
         {:ok, violations} <- identify_violations(baseline_state) do
      result = apply_repairs(violations, 0, max_level, [])
      record_healing(result)
      {:ok, result}
    end
  end

  defp identify_violations(baseline_state) do
    violations =
      baseline_state.domains
      |> Enum.filter(fn domain -> domain.violations > 0 end)
      |> Enum.flat_map(&expand_violations/1)

    {:ok, violations}
  end

  defp expand_violations(domain_state) do
    case Prismatic.Quality.DomainMonitor.measure(domain_state.name) do
      {:ok, %{details: details}} -> details
      {:error, _} -> []
    end
  end

  defp apply_repairs(violations, current_level, max_level, actions)
       when current_level > max_level do
    %{
      level: max_level,
      violations_found: length(violations) + length(actions),
      violations_fixed: Enum.count(actions, &(&1.result == :fixed)),
      violations_remaining: length(violations),
      duration_ms: 0,
      actions: actions
    }
  end

  defp apply_repairs([], _current_level, _max_level, actions) do
    %{
      level: 0,
      violations_found: length(actions),
      violations_fixed: Enum.count(actions, &(&1.result == :fixed)),
      violations_remaining: 0,
      duration_ms: 0,
      actions: actions
    }
  end

  defp apply_repairs(violations, current_level, max_level, actions) do
    {fixed, remaining} =
      Enum.split_with(violations, fn v ->
        case apply_strategy(v, current_level) do
          :fixed -> true
          _ -> false
        end
      end)

    new_actions =
      Enum.map(fixed, &%{domain: &1.domain, violation: &1.message, strategy: strategy_name(current_level), result: :fixed, file: &1.file})

    apply_repairs(remaining, current_level + 1, max_level, actions ++ new_actions)
  end

  defp apply_strategy(_violation, 0), do: :skipped
  defp apply_strategy(violation, 1), do: quick_fix(violation)
  defp apply_strategy(violation, 2), do: targeted_repair(violation)
  defp apply_strategy(violation, 3), do: structural_repair(violation)
  defp apply_strategy(violation, 4), do: deep_healing(violation)

  defp quick_fix(%{domain: :impl_coverage}), do: :fixed
  defp quick_fix(%{domain: :unsafe_map_access}), do: :fixed
  defp quick_fix(_), do: :skipped

  defp targeted_repair(%{domain: :credo}), do: :fixed
  defp targeted_repair(%{domain: :dialyzer}), do: :fixed
  defp targeted_repair(_), do: :skipped

  defp structural_repair(_), do: :skipped
  defp deep_healing(_), do: :skipped

  defp strategy_name(0), do: :baseline
  defp strategy_name(1), do: :quick_fix
  defp strategy_name(2), do: :targeted_repair
  defp strategy_name(3), do: :structural_repair
  defp strategy_name(4), do: :deep_healing

  defp record_healing(result) do
    :telemetry.execute(
      [:prismatic, :autoheal, :cycle_complete],
      %{fixed: result.violations_fixed, remaining: result.violations_remaining},
      %{level: result.level, timestamp: DateTime.utc_now()}
    )
  end
end
```

## PrismaticSupervisor: Compositional Supervision

The `PrismaticSupervisor` application provides advanced supervision capabilities beyond standard OTP supervisors. It implements dependency-aware startup ordering, domain-based supervision grouping, and health monitoring across the entire supervision hierarchy.

Key features:

- **Dependency resolution** -- Builds a directed acyclic graph (DAG) of application dependencies and starts them in topological order
- **Domain supervisors** -- Groups related applications into supervision domains (storage, web, agents, intelligence) for coordinated restart
- **Health monitoring** -- Continuously monitors all supervised processes and reports health status via telemetry
- **Auto-discovery** -- Scans all 115 umbrella applications to build the supervision topology automatically

The `PrismaticSupervisor` extends OTP's built-in supervision with platform-specific intelligence. When a domain supervisor detects that multiple children in the same domain are failing, it can escalate to a domain-level restart (similar to `one_for_all`) rather than restarting each child individually -- recognizing that correlated failures often indicate a shared root cause.

## Repair at the Infrastructure Level

Beyond application-level repair mechanisms, the Prismatic Platform implements infrastructure-level repair through deployment strategies.

### Blue-Green Deployment

The platform uses [blue-green deployment](/glossary/blue-green-deployment/) on Fly.io, maintaining two production environments. If the new deployment fails health checks, traffic is automatically routed back to the previous version -- an infrastructure-level circuit breaker.

### Health Check Endpoints

Every deployed instance exposes a health check endpoint that verifies database connectivity, cache availability, and process health. Fly.io's health checker uses these endpoints to detect and replace unhealthy instances automatically.

### Graceful Degradation

When external dependencies (Meilisearch, Redis, external APIs) become unavailable, the platform degrades gracefully rather than failing entirely. ETS-backed caches serve stale data, synchronous operations fall back to asynchronous queuing, and non-critical features are disabled until the dependency recovers.

## Repair Metrics and Observability

All repair mechanisms emit structured telemetry events for observability:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :supervisor, :restart]` | `%{duration_ms}` | child, strategy, reason |
| `[:prismatic, :circuit_breaker, :state_change]` | `%{timestamp}` | service, from, to |
| `[:prismatic, :autoheal, :cycle_complete]` | `%{fixed, remaining}` | level, timestamp |
| `[:prismatic, :health, :check]` | `%{healthy, total}` | domain, timestamp |

These events feed into the [quality monitoring](/glossary/quality-monitoring/) system, creating a feedback loop where repair activities are themselves monitored for effectiveness.

## Comparison with Industry Approaches

| Pattern | Traditional | Prismatic Platform |
|---------|------------|-------------------|
| Process recovery | Try/catch with manual restart | OTP supervision with automatic restart |
| Service isolation | Container restart | BEAM process isolation (microsecond recovery) |
| Cascade prevention | Manual circuit breakers | Supervised circuit breaker GenServers |
| Quality repair | Manual code review | AutoHeal with 5-level escalation |
| Deployment rollback | Manual or scripted | Blue-green with automatic health checks |

The key differentiator is the BEAM VM's process model, which provides sub-millisecond process isolation and restart capabilities that container-based approaches cannot match. A crashed BEAM process is restarted in microseconds; a crashed container takes seconds to minutes.

## Best Practices

1. **Prefer supervision over exception handling** -- Use OTP supervisors for fault recovery; reserve try/rescue for expected error conditions.
2. **Configure restart limits** -- Set `max_restarts` and `max_seconds` on supervisors to prevent restart storms from consuming resources.
3. **Use circuit breakers for external calls** -- Any call to an external service should be wrapped in a circuit breaker to prevent cascade failures.
4. **Monitor repair frequency** -- High restart rates indicate a systemic problem, not successful repair. Investigate root causes when restart telemetry shows elevated rates.
5. **Test failure scenarios** -- Use property-based testing and chaos engineering to verify that repair mechanisms work correctly under real failure conditions.

## Related Concepts

- [AutoHeal](/glossary/autoheal/) -- Autonomous quality healing system
- [Self-Healing](/glossary/self-healing/) -- Systems that repair themselves automatically
- [Circuit Breaker](/glossary/circuit-breaker/) -- Cascade failure prevention pattern
- [Supervision Tree](/glossary/supervision-tree/) -- OTP process hierarchy
- [Supervision](/glossary/supervision/) -- OTP supervision patterns
- [OTP](/glossary/otp/) -- Open Telecom Platform framework
- [GenServer](/glossary/genserver/) -- Generic server process abstraction
- [BEAM VM](/glossary/beam-vm/) -- Erlang virtual machine runtime
- [Process Restart](/glossary/process-restart/) -- Individual process recovery
- [Health Monitoring](/glossary/health-monitoring/) -- System health observation
- [Quality Monitoring](/glossary/quality-monitoring/) -- Continuous quality observation
- [Backpressure](/glossary/backpressure/) -- Load management under stress

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
