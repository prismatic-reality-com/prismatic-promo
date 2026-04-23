+++
title = "Self-Healing"
weight = 8
[extra]
category = "architecture"
description = "Autonomous fault recovery system that detects, diagnoses, and corrects system issues without human intervention across five escalating healing levels"
abbreviation = "SH"
related_terms = ["seadf", "cascade", "quality-floor-guardian", "supervisor", "chaos-engineering", "autoheal", "autoevolve", "fault-tolerance", "let-it-crash", "circuit-breaker", "observability", "telemetry", "genserver"]
domain = "resilience"
complexity = "advanced"
platform_adoption = "universal"
healing_levels = 5
healing_model = "SEADF Enhanced Healing"
otp_foundation = true
cascade_patterns = ["Type Mismatch", "Dead Code", "Empty Check", "Timer Replacement", "Nuclear Cache"]
quality_floor_thresholds = ["100-99 OPTIMAL", "98-99 WARNING", "95-98 CRITICAL", "<95 EMERGENCY"]
circuit_breaker_threshold = 3
circuit_breaker_reset_seconds = 60
autoheal_command = "mix autoheal.cycle"
autoevolve_command = "mix autoevolve.mega"
supervision_strategies = ["one_for_one", "rest_for_one", "one_for_all"]
max_restarts_default = 5
max_seconds_default = 30
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2093
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Self-Healing", "Autonomous", "glossary", "architecture", "Prismatic Platform", "Self", "CASCADE"]
tags = ["glossary", "architecture", "self-healing", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Self-Healing - Prismatic Platform"
+++

## Definition and Overview

Self-Healing in the Prismatic Platform refers to autonomous systems that detect degradation or failure, diagnose root causes, and apply corrective actions without human intervention. This extends far beyond OTP's basic supervisor restart strategy to encompass application-level healing: automatic quality debt elimination, configuration drift correction, dependency update resolution, performance optimization, and ecosystem-wide recovery patterns.

The concept draws from biological systems, where organisms repair wounds, fight infections, and adapt to environmental stressors without conscious direction. The immune system does not wait for external instruction to attack a pathogen -- it detects, classifies, and responds autonomously. Similarly, Prismatic's self-healing infrastructure detects degradation through [observability](@/glossary/observability.md) signals, classifies the issue through diagnostic agents, and applies corrective patterns without human intervention.

Self-healing operates at three distinct levels: **process-level** (OTP restarts via [supervisors](@/glossary/supervisor.md)), **application-level** (auto-evolution through [SEADF](@/glossary/seadf.md)), and **platform-level** (ecosystem healing across all 115 umbrella applications). Each level handles progressively larger-scope failures, and they compose hierarchically -- a process-level restart that fails escalates to application-level recovery, which in turn can trigger platform-level healing if the application-level intervention is insufficient.

The philosophical foundation of self-healing in the Prismatic Platform rests on the [let-it-crash](@/glossary/let-it-crash.md) philosophy extended to its logical conclusion: not only should individual processes crash and restart cleanly, but entire subsystems should be able to detect their own degradation and apply corrective measures autonomously. This eliminates the dependency on human operators for routine recovery, allowing human attention to focus on genuinely novel problems that the system has not previously encountered.

## Historical Context and Motivation

The need for self-healing systems became apparent during the platform's growth from a handful of applications to over 100 umbrella apps. Manual quality maintenance was unsustainable -- a single developer cannot monitor quality across 2.8 million lines of code. Quality drift accumulated silently: a compilation warning here, a Credo issue there, a Dialyzer type mismatch in a rarely-modified module. Individually, each issue was minor. Collectively, they degraded the platform's reliability and developer confidence.

The first self-healing capability was simple: OTP supervisors restarting crashed processes. But this addressed only the most basic failure mode -- process crashes. It did not address quality regression, configuration drift, performance degradation, or dependency conflicts. The [SEADF](@/glossary/seadf.md) Enhanced Healing subsystem was developed to fill this gap, providing a structured five-level healing model that addresses progressively more complex failure modes.

The introduction of [CASCADE](@/glossary/cascade.md) patterns marked a turning point. These are proven, automated transformations that eliminate specific quality debt categories. Where manual quality fixes required understanding each individual issue, CASCADE patterns encode the fix knowledge once and apply it automatically across the entire codebase. The combination of CASCADE patterns with the autoheal cycle created a system that could detect, classify, and fix quality regressions without human intervention.

## The 5-Level Healing Model

The SEADF Enhanced Healing subsystem defines five discrete healing levels, each representing an escalating intervention strategy. The levels are ordered by both scope of intervention and risk of side effects -- lower levels are attempted first, with escalation to higher levels only when simpler interventions fail.

| Level | Name | Scope | Intervention | Recovery Time | Risk |
|-------|------|-------|--------------|---------------|------|
| **L1** | Restart | Single process | Supervisor restarts crashed process with clean state | Milliseconds | Minimal |
| **L2** | Reconnect | Connection/session | Re-establish failed connections to external services | Seconds | Low |
| **L3** | Reconfigure | Application config | Adjust configuration parameters to adapt to current conditions | Seconds | Medium |
| **L4** | Rebuild | Application state | Reconstruct application state from persistent storage | Minutes | Medium-High |
| **L5** | Escalate | Cross-application | Coordinate recovery across multiple applications with dependency awareness | Minutes | High |

The healing levels map to progressively deeper system understanding. L1 requires no diagnosis -- a crashed process is simply restarted. L2 requires connection-level diagnosis -- which connection failed and how to re-establish it. L3 requires configuration analysis -- what parameter change would prevent the recurrence. L4 requires state reconstruction -- rebuilding an application's in-memory state from durable storage. L5 requires ecosystem understanding -- which applications depend on the failing component and how to coordinate their recovery.

## OTP Supervision Tree Foundation

All self-healing in the Prismatic Platform builds on the foundation of OTP [supervision trees](@/glossary/supervisor.md). The supervisor hierarchy provides the L1 healing layer automatically: when a [GenServer](@/glossary/genserver.md) crashes, its supervisor restarts it according to the configured strategy.

```elixir
defmodule PrismaticAgents.AgentPoolSupervisor do
  @moduledoc """
  Supervises a pool of agent processes with self-healing restart strategy.
  Uses rest_for_one to ensure dependent agents restart in correct order.
  Escalates to parent supervisor if restart rate exceeds threshold.
  """

  use Supervisor

  @max_restarts 5
  @max_seconds 30

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {PrismaticAgents.AgentRegistry, []},
      {PrismaticAgents.AgentScheduler, [registry: PrismaticAgents.AgentRegistry]},
      {PrismaticAgents.AgentExecutor, [scheduler: PrismaticAgents.AgentScheduler]}
    ]

    Supervisor.init(children,
      strategy: :rest_for_one,
      max_restarts: @max_restarts,
      max_seconds: @max_seconds
    )
  end
end
```

The three restart strategies serve different self-healing needs:

- **one_for_one**: Independent processes. A cache process crashing does not affect unrelated worker processes. Each is restarted individually.
- **rest_for_one**: Ordered dependencies. If the AgentRegistry crashes above, both the AgentScheduler and AgentExecutor (which depend on it) are restarted as well.
- **one_for_all**: Tightly coupled processes. If any process in a coordinated group fails, all are restarted to ensure consistent state.

The `max_restarts` / `max_seconds` configuration acts as an escalation trigger. If a process crashes more than 5 times in 30 seconds, the supervisor itself crashes, propagating the failure upward to the next supervision level. This escalation is intentional: rapid repeated crashes indicate a systemic issue that simple restart cannot resolve, triggering higher-level healing.

## The Autoheal System

The [autoheal](@/glossary/autoheal.md) system provides the L2-L4 healing capabilities through the `mix autoheal.cycle` command. A healing cycle performs a structured sequence of operations:

1. **Baseline Capture**: Record current platform state including quality metrics, test results, compilation warnings, and [Dialyzer](@/glossary/dialyzer.md) findings. This baseline enables before/after comparison.

2. **Degradation Detection**: Compare current state against the quality floor (maintained by the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md)). Identify specific regressions: new compilation warnings, new Dialyzer violations, Credo regressions, test failures.

3. **Root Cause Analysis**: For each detected degradation, analyze the most likely cause. Is it a new dependency introducing warnings? A configuration drift? A code change that introduced a regression?

4. **Pattern Application**: Apply [CASCADE](@/glossary/cascade.md) patterns to address identified issues. CASCADE patterns are proven, automated transformations that eliminate specific quality debt categories (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache).

5. **Validation**: After pattern application, re-run the [quality gates](@/glossary/quality-gates.md) to verify that the healing was effective. If the intervention introduced new issues, it is rolled back.

6. **Report**: Generate a healing report documenting what was detected, what was attempted, and what was achieved. This report feeds into the platform's structured logging for trend analysis.

```elixir
defmodule PrismaticSafety.AutohealCycle do
  @moduledoc """
  Implements the autoheal cycle: baseline capture, degradation detection,
  pattern application, validation, and reporting. Each step produces
  structured results that feed into the next step.
  """

  @type cycle_result :: {:ok, heal_report()} | {:error, term()}
  @type heal_report :: %{
    baseline: map(),
    degradations: [map()],
    patterns_applied: [map()],
    validation: :pass | :fail,
    rollback: boolean()
  }

  @spec run_cycle(keyword()) :: cycle_result()
  def run_cycle(opts \\ []) do
    with {:ok, baseline} <- capture_baseline(opts),
         {:ok, degradations} <- detect_degradations(baseline),
         {:ok, applied} <- apply_patterns(degradations),
         {:ok, validation} <- validate_healing(baseline, applied) do
      report = %{
        baseline: baseline,
        degradations: degradations,
        patterns_applied: applied,
        validation: validation,
        rollback: false
      }

      {:ok, report}
    else
      {:error, :validation_failed, applied} ->
        rollback_changes(applied)
        {:ok, %{validation: :fail, rollback: true, patterns_applied: applied}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec capture_baseline(keyword()) :: {:ok, map()} | {:error, term()}
  defp capture_baseline(_opts) do
    {:ok, %{
      quality_score: PrismaticSafety.QualityFloorGuardian.current_score(),
      warnings: count_compilation_warnings(),
      dialyzer_violations: count_dialyzer_violations(),
      credo_issues: count_credo_issues(),
      timestamp: DateTime.utc_now()
    }}
  end

  defp detect_degradations(baseline) do
    floor = PrismaticSafety.QualityFloorGuardian.quality_floor()

    degradations =
      Enum.filter([
        check_warnings(baseline, floor),
        check_dialyzer(baseline, floor),
        check_credo(baseline, floor)
      ], & &1)

    {:ok, degradations}
  end

  defp apply_patterns(degradations) do
    results = Enum.map(degradations, &PrismaticSafety.CascadePatterns.apply/1)
    {:ok, results}
  end

  defp validate_healing(_baseline, _applied), do: {:ok, :pass}
  defp rollback_changes(_applied), do: :ok
  defp count_compilation_warnings, do: 0
  defp count_dialyzer_violations, do: 0
  defp count_credo_issues, do: 0
  defp check_warnings(_baseline, _floor), do: nil
  defp check_dialyzer(_baseline, _floor), do: nil
  defp check_credo(_baseline, _floor), do: nil
end
```

## Telemetry-Driven Detection

Self-healing requires continuous monitoring to detect issues before they become catastrophic. The platform uses [Telemetry](@/glossary/telemetry.md) infrastructure combined with custom health metrics to maintain awareness of system state.

| Signal Category | Metrics Monitored | Detection Threshold | Healing Response |
|----------------|-------------------|---------------------|------------------|
| **Process Health** | Restart count, message queue depth, memory usage | >3 restarts/min, >1000 messages, >100MB | L1-L2 intervention |
| **Quality Metrics** | Compilation warnings, Dialyzer violations, Credo issues | Any increase from baseline | L3-L4 CASCADE patterns |
| **Performance** | Response latency, throughput, error rate | >2x baseline latency, >1% error rate | L2-L3 reconfiguration |
| **Resource Usage** | CPU, memory, disk, connection pool | >80% utilization sustained | L3 reconfiguration |
| **Dependencies** | External API response time, database query latency | >5s response, connection failures | L2 reconnect with [circuit breaker](@/glossary/circuit-breaker.md) |

The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) continuously monitors quality metrics and triggers healing at specific thresholds:

- **100-99%** quality score: OPTIMAL. Monitor only. No intervention needed.
- **98-99%**: WARNING. Alert generated. Investigation triggered. Preventive healing considered.
- **95-98%**: CRITICAL. Auto-evolution trigger. Healing cycle initiated automatically.
- **Below 95%**: EMERGENCY. Commits blocked. Immediate healing required. Escalation to L5.

## Circuit Breakers and Cascade Prevention

[Circuit breakers](@/glossary/circuit-breaker.md) are the self-healing system's first line of defense against cascade failures. When an external dependency begins failing, the circuit breaker opens to prevent the failure from propagating through the system. This is a form of self-healing through isolation -- the system heals itself by cutting off the source of damage.

The SessionLifecycle GenServer demonstrates this pattern. Its circuit breaker opens after 3 consecutive hook failures and auto-resets after 60 seconds. During the open period, hook execution is skipped entirely rather than repeatedly failing and consuming resources. After 60 seconds, the half-open state allows a single test execution to determine if the dependency has recovered.

```elixir
defmodule PrismaticSafety.CircuitBreaker do
  @moduledoc """
  Circuit breaker implementation for self-healing external dependency
  management. Tracks failure counts and transitions between closed,
  open, and half-open states automatically.
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @type breaker_state :: %{
    state: state(),
    failure_count: non_neg_integer(),
    last_failure: DateTime.t() | nil,
    reset_timeout_ms: pos_integer(),
    failure_threshold: pos_integer()
  }

  @spec call(pid(), (-> result)) :: {:ok, result} | {:error, :circuit_open} when result: term()
  def call(breaker, fun) do
    GenServer.call(breaker, {:execute, fun})
  end

  @impl GenServer
  def handle_call({:execute, fun}, _from, %{state: :open} = state) do
    if time_since_last_failure(state) > state.reset_timeout_ms do
      {:reply, try_half_open(fun, state), %{state | state: :half_open}}
    else
      {:reply, {:error, :circuit_open}, state}
    end
  end

  def handle_call({:execute, fun}, _from, %{state: :closed} = state) do
    case safe_execute(fun) do
      {:ok, result} ->
        {:reply, {:ok, result}, %{state | failure_count: 0}}

      {:error, reason} ->
        new_count = state.failure_count + 1
        new_state = if new_count >= state.failure_threshold do
          %{state | state: :open, failure_count: new_count, last_failure: DateTime.utc_now()}
        else
          %{state | failure_count: new_count, last_failure: DateTime.utc_now()}
        end
        {:reply, {:error, reason}, new_state}
    end
  end

  defp safe_execute(fun) do
    {:ok, fun.()}
  rescue
    error -> {:error, error}
  end

  defp try_half_open(fun, _state) do
    case safe_execute(fun) do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, reason}
    end
  end

  defp time_since_last_failure(%{last_failure: nil}), do: :infinity
  defp time_since_last_failure(%{last_failure: last}) do
    DateTime.diff(DateTime.utc_now(), last, :millisecond)
  end
end
```

Circuit breakers compose with supervision trees to create multi-layered self-healing. A circuit breaker protects against slow external failures (timeouts, degraded responses), while the supervision tree protects against fast internal failures (crashes, exceptions). Together, they cover the full spectrum of failure modes.

## Relationship to Let-It-Crash Philosophy

Self-healing and the [let-it-crash](@/glossary/let-it-crash.md) philosophy are complementary rather than contradictory. Let-it-crash says: "Do not defensively guard against every possible error. Let processes crash and let supervisors handle recovery." Self-healing extends this to: "Beyond simple process restarts, apply intelligent recovery strategies based on failure patterns."

The key insight is that let-it-crash handles **individual process failures** (a GenServer crashes due to unexpected input), while self-healing handles **systemic degradation** (quality metrics declining across multiple applications, configuration drift accumulating over time, external dependencies degrading gradually). Let-it-crash is a binary response (crash or not), while self-healing is a graduated response (5 levels of increasing intervention).

In practice, the platform's self-healing system relies on let-it-crash as its foundation. Process-level crashes are the most common failure mode and are handled by OTP supervision without any custom logic. Self-healing logic activates only for failures that supervision alone cannot resolve: quality regressions that are not caused by crashes, configuration drift that accumulates slowly, and performance degradation that does not trigger process crashes.

## SEADF Integration

The [SEADF](@/glossary/seadf.md) (Self-Evolving Autonomous Discovery Framework) provides the coordination layer for self-healing across the platform. SEADF's Enhanced Healing subsystem is one of seven SEADF subsystems, and it interacts with the others to provide holistic platform health management:

- **Scanner Subsystem**: Detects new patterns and anomalies that may require healing
- **Pipeline Subsystem**: Processes healing candidates through validation stages
- **Quality Guardian**: Maintains quality floor and triggers healing when thresholds are breached
- **Knowledge Sync**: Shares healing patterns across sessions for continuous improvement
- **Cross-Domain Innovator**: Applies healing patterns from one domain to similar issues in other domains
- **Autonomous Reporter**: Generates healing reports for trend analysis and human review
- **Enhanced Healing**: Coordinates the 5-level healing model described above

The `mix autoheal.cycle` command invokes the Enhanced Healing subsystem directly, but healing can also be triggered automatically by the Quality Guardian when thresholds are breached, by the Scanner when anomalies are detected, or by the Cross-Domain Innovator when a pattern match suggests preventive healing would be beneficial.

## Autoevolve and Continuous Improvement

Self-healing addresses current failures, while [autoevolve](@/glossary/autoevolve.md) addresses future resilience. The two systems work in tandem: autoheal fixes what is broken, autoevolve improves the platform to prevent similar breakages in the future.

The `mix autoevolve.mega` command performs a comprehensive evolution scan that goes beyond healing:

1. Identifies patterns that could be extracted into reusable abstractions
2. Detects code that could benefit from OTP patterns not currently applied
3. Suggests [typespec](@/glossary/typespec.md) additions for functions lacking type documentation
4. Recommends test coverage improvements for under-tested modules
5. Proposes architectural improvements based on usage patterns

Autoevolve is the platform's immune memory -- where autoheal fights the current infection, autoevolve develops antibodies for future infections.

## Best Practices

1. **Design for Restartability**: Every process should be able to restart from scratch and reconstruct its state from persistent storage or configuration. This is the foundation of L1-L4 healing.

2. **Separate State from Logic**: Keep state reconstruction logic separate from business logic. When a process restarts, it should rebuild its state deterministically without re-executing business operations.

3. **Monitor Healing Effectiveness**: Track healing cycle outcomes via [Telemetry](@/glossary/telemetry.md). If healing cycles are running frequently or failing, the root cause may be deeper than the healing system can address.

4. **Use Circuit Breakers at All External Boundaries**: Every call to an external service, database, or third-party API should pass through a circuit breaker to prevent cascade failures.

5. **Escalate Gradually**: Always attempt the least invasive healing level first. L1 restart is preferable to L4 rebuild, and L4 rebuild is preferable to L5 escalation.

## Common Pitfalls

- **Healing Loops**: A healing action that inadvertently triggers the condition it was trying to fix, creating an infinite loop. Break healing loops with attempt counters and cooldown periods.

- **Over-Aggressive Restart**: Restarting too quickly without allowing transient conditions to resolve. Use exponential backoff for restart timing.

- **Ignoring Root Causes**: Healing symptoms without addressing root causes leads to chronic healing cycles. Monitor healing frequency -- high-frequency healing is a signal to investigate deeper.

- **State Loss on Restart**: Processes that lose critical state on restart because their state was not persisted. Design processes to persist state at meaningful checkpoints.

## Related Terms

- [SEADF](@/glossary/seadf.md) -- Framework containing the Enhanced Healing subsystem
- [CASCADE](@/glossary/cascade.md) -- Automated patterns applied during healing cycles
- [Autoheal](@/glossary/autoheal.md) -- Mix task triggering healing cycles
- [Autoevolve](@/glossary/autoevolve.md) -- Companion system for continuous improvement
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior providing L1 process restart healing
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System property that self-healing maintains
- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy that self-healing extends beyond process restarts
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern preventing cascade failures during healing
- [Observability](@/glossary/observability.md) -- Monitoring infrastructure enabling degradation detection
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Testing methodology that validates self-healing effectiveness
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Guardian triggering healing at quality thresholds
- [Telemetry](@/glossary/telemetry.md) -- Event system powering healing detection signals

## See Also

- [Architecture](@/architecture/_index.md) -- Platform resilience architecture
- [Technologies](@/technologies/_index.md) -- BEAM VM and OTP self-healing capabilities
- [Capabilities](@/capabilities/_index.md) -- Platform autonomous operation capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
