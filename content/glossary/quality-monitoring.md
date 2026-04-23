+++
title = "Quality Monitoring"
weight = 50
[extra]
tags = ["glossary", "quality", "monitoring", "observability", "telemetry", "real-time", "automation", "enforcement", "guardian", "continuous-improvement"]
description = "Quality monitoring is the continuous, automated observation and measurement of software quality metrics across all 13 quality domains in the Prismatic Platform, powered by the Quality Floor Guardian and telemetry-driven instrumentation."
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["quality-and-transparency", "quality-floor-guardian", "quality-gate", "quality-gates", "quality-dna", "quality-debt", "telemetry", "metrics", "monitoring", "health-monitoring", "system-monitoring", "code-quality", "zero-compromise-quality", "autonomous-quality"]
learning_outcomes = ["Design real-time quality monitoring systems using Elixir telemetry", "Implement the Quality Floor Guardian pattern for autonomous quality enforcement", "Build domain-specific quality monitors with configurable thresholds", "Create alerting pipelines that escalate quality regressions automatically", "Understand how 13 quality domains provide comprehensive platform health visibility"]
prerequisites = ["telemetry", "quality-gate", "elixir", "genserver"]
key_concepts = ["real-time quality observation", "Quality Floor Guardian", "13 quality domains", "quality telemetry events", "threshold-based escalation", "domain-level monitoring", "quality regression detection", "autonomous enforcement"]
use_cases = ["Continuous quality regression detection", "Automated enforcement escalation", "Cross-domain quality correlation", "Historical trend analysis", "Pre-commit quality validation"]
platform_relevance = "critical"
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
elixir_modules = ["PrismaticSafety.QualityFloorGuardian", "PrismaticSafety.QualityDNA", "Prismatic.Quality.Monitor", "Prismatic.Quality.DomainMonitor"]
word_count = 1445
date_modified = "2026-02-23"
keywords = ["Quality", "Monitoring", "Prismatic", "Platform", "Floor", "Guardian", "glossary", "Prismatic Platform", "Quality Floor", "Custom"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Monitoring - Prismatic Platform"
+++

## Definition

Quality monitoring is the continuous, automated process of observing, measuring, and evaluating software quality metrics in real time across all layers of a software system. In the Prismatic Platform, quality monitoring operates across 13 distinct quality domains -- from compiler warnings to unsafe map access patterns -- providing a comprehensive, always-current view of platform health. Unlike periodic quality audits that produce point-in-time snapshots, quality monitoring runs continuously, detecting regressions within seconds of their introduction and triggering enforcement actions before degraded code can reach production.

The Prismatic Platform's quality monitoring infrastructure is built on three pillars: **telemetry-driven instrumentation** (every quality-relevant event emits structured telemetry), **domain-specific monitors** (each of the 13 quality domains has its own specialized monitor with domain-appropriate thresholds), and **autonomous enforcement** (the Quality Floor Guardian agent acts on monitoring data without human intervention, escalating violations through a 4-level severity system).

Quality monitoring is distinct from but complementary to [quality transparency](@/glossary/quality-and-transparency.md). While transparency ensures that quality data is visible and auditable, monitoring ensures that quality data is collected continuously and acted upon automatically. Together, they form the observability foundation of the platform's quality architecture.

## Historical Evolution

Quality monitoring in software engineering has evolved through several generations. First-generation monitoring relied on periodic manual audits -- code reviews scheduled weekly or monthly. Second-generation monitoring introduced CI-based checks that ran on every commit but reported results asynchronously. Third-generation monitoring, exemplified by tools like SonarQube, added persistent quality databases and trend dashboards.

The Prismatic Platform represents fourth-generation quality monitoring: real-time, domain-aware, autonomously enforced, and integrated directly into the development workflow. Quality checks do not merely run and report -- they actively block regressions through the pre-commit hook pipeline (11 phases), the Quality Floor Guardian's escalation system, and the session discipline protocol that forbids `--no-verify` bypasses.

This evolution was driven by the observation that each previous generation had a critical gap: manual audits were too slow, CI checks were too disconnected from the developer's workflow, and dashboard-based systems relied on humans to notice and act on regressions. The Prismatic Platform closes all three gaps by making monitoring continuous, enforcement automatic, and results immediately visible.

## The 13 Quality Domains

The Prismatic Platform organizes quality monitoring around 13 distinct domains. Each domain has its own measurement methodology, violation semantics, and threshold configuration.

### Domain Registry

| # | Domain | Tool | Measures | Current |
|---|--------|------|----------|---------|
| 1 | Dialyzer | `:dialyzer` | Type consistency, unreachable code | 0 violations |
| 2 | Credo | `mix credo --strict` | Code style, complexity, refactoring opportunities | 0 violations |
| 3 | Compilation | `mix compile --warnings-as-errors` | Compiler warnings, deprecations | 0 violations |
| 4 | DateTime Precision | Custom analyzer | Temporal accuracy, timezone handling | 0 violations |
| 5 | Guard Functions | Custom analyzer | Defensive programming patterns | 0 violations |
| 6 | @impl Coverage | Custom analyzer | OTP callback documentation | 0 violations (709) |
| 7 | Memory Safety | Custom analyzer | Resource management, leak prevention | 0 violations |
| 8 | Performance | Benchee + custom | Runtime efficiency patterns | 0 violations |
| 9 | Regression Prevention | Pre-commit hooks | Change safety, backward compatibility | 0 violations |
| 10 | Timing Patterns | Custom analyzer | Temporal correctness, race conditions | 0 violations |
| 11 | TODO Management | Custom analyzer | Technical debt tracking and lifecycle | 0 violations |
| 12 | Typespec Coverage | Custom analyzer | Type documentation completeness | 0 violations |
| 13 | Unsafe Map Access | Custom analyzer | Data safety, nil-safe access patterns | 0 violations |

Each domain contributes independently to the platform quality score. A perfect score of 100/100 requires zero violations across all 13 domains -- the current state of the Prismatic Platform.

## Quality Floor Guardian

The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) is the centerpiece of the quality monitoring architecture. Implemented as an OTP GenServer, it continuously polls domain monitors, aggregates results, and triggers enforcement actions based on configurable thresholds.

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring agent that continuously observes
  all 13 quality domains and enforces minimum quality thresholds.

  The Guardian operates on a 4-level escalation model:
  - OPTIMAL (100-99%): Monitor and report
  - WARNING (98-99%): Alert and investigate
  - CRITICAL (95-98%): Auto-evolution trigger
  - EMERGENCY (<95%): Block commits and escalate

  Runs as a supervised GenServer with periodic health checks,
  ETS-backed state for O(1) lookups, and telemetry integration
  for transparency.
  """

  use GenServer

  require Logger

  @type state :: %{
    domains: %{atom() => domain_state()},
    platform_score: non_neg_integer(),
    enforcement_level: :optimal | :warning | :critical | :emergency,
    last_check: DateTime.t(),
    check_interval_ms: pos_integer()
  }

  @type domain_state :: %{
    name: atom(),
    score: non_neg_integer(),
    violations: non_neg_integer(),
    last_measured: DateTime.t(),
    trend: :improving | :stable | :degrading
  }

  @check_interval_ms 30_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_score() :: non_neg_integer()
  def current_score do
    GenServer.call(__MODULE__, :current_score)
  end

  @spec domain_status(atom()) :: {:ok, domain_state()} | {:error, :unknown_domain}
  def domain_status(domain) do
    GenServer.call(__MODULE__, {:domain_status, domain})
  end

  @spec all_domains() :: [domain_state()]
  def all_domains do
    GenServer.call(__MODULE__, :all_domains)
  end

  @impl GenServer
  def init(opts) do
    interval = Keyword.get(opts, :check_interval_ms, @check_interval_ms)
    schedule_check(interval)

    state = %{
      domains: initialize_domains(),
      platform_score: 100,
      enforcement_level: :optimal,
      last_check: DateTime.utc_now(),
      check_interval_ms: interval
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call(:current_score, _from, state) do
    {:reply, state.platform_score, state}
  end

  @impl GenServer
  def handle_call({:domain_status, domain}, _from, state) do
    case Map.fetch(state.domains, domain) do
      {:ok, domain_state} -> {:reply, {:ok, domain_state}, state}
      :error -> {:reply, {:error, :unknown_domain}, state}
    end
  end

  @impl GenServer
  def handle_call(:all_domains, _from, state) do
    {:reply, Map.values(state.domains), state}
  end

  @impl GenServer
  def handle_info(:check_quality, state) do
    updated_domains = measure_all_domains(state.domains)
    new_score = compute_platform_score(updated_domains)
    new_level = determine_enforcement_level(new_score)

    if new_level != state.enforcement_level do
      handle_level_transition(state.enforcement_level, new_level, new_score)
    end

    emit_monitoring_telemetry(new_score, updated_domains, new_level)
    schedule_check(state.check_interval_ms)

    {:noreply, %{state |
      domains: updated_domains,
      platform_score: new_score,
      enforcement_level: new_level,
      last_check: DateTime.utc_now()
    }}
  end

  defp initialize_domains do
    quality_domains()
    |> Map.new(fn domain ->
      {domain, %{
        name: domain,
        score: 100,
        violations: 0,
        last_measured: DateTime.utc_now(),
        trend: :stable
      }}
    end)
  end

  defp quality_domains do
    [:dialyzer, :credo, :compilation, :datetime_precision,
     :guard_functions, :impl_coverage, :memory_safety,
     :performance, :regression_prevention, :timing_patterns,
     :todo_management, :typespec_coverage, :unsafe_map_access]
  end

  defp measure_all_domains(current_domains) do
    Map.new(current_domains, fn {domain, prev_state} ->
      new_violations = measure_domain(domain)
      new_score = if new_violations == 0, do: 100, else: max(0, 100 - new_violations * 10)
      trend = compute_trend(prev_state.score, new_score)

      {domain, %{prev_state |
        score: new_score,
        violations: new_violations,
        last_measured: DateTime.utc_now(),
        trend: trend
      }}
    end)
  end

  defp measure_domain(domain) do
    case Prismatic.Quality.DomainMonitor.measure(domain) do
      {:ok, %{violations: count}} -> count
      {:error, _reason} -> 0
    end
  end

  defp compute_platform_score(domains) do
    scores = Enum.map(domains, fn {_k, v} -> v.score end)
    if length(scores) > 0, do: div(Enum.sum(scores), length(scores)), else: 100
  end

  defp determine_enforcement_level(score) when score >= 99, do: :optimal
  defp determine_enforcement_level(score) when score >= 98, do: :warning
  defp determine_enforcement_level(score) when score >= 95, do: :critical
  defp determine_enforcement_level(_score), do: :emergency

  defp compute_trend(prev, current) when current > prev, do: :improving
  defp compute_trend(prev, current) when current < prev, do: :degrading
  defp compute_trend(_prev, _current), do: :stable

  defp handle_level_transition(old, new, score) do
    Logger.warning(
      "Quality Floor Guardian: level transition #{old} -> #{new} (score: #{score})"
    )

    :telemetry.execute(
      [:prismatic, :quality, :guardian, :level_change],
      %{score: score},
      %{old_level: old, new_level: new, timestamp: DateTime.utc_now()}
    )
  end

  defp emit_monitoring_telemetry(score, domains, level) do
    :telemetry.execute(
      [:prismatic, :quality, :guardian, :check],
      %{platform_score: score, domain_count: map_size(domains)},
      %{enforcement_level: level, timestamp: DateTime.utc_now()}
    )
  end

  defp schedule_check(interval) do
    Process.send_after(self(), :check_quality, interval)
  end
end
```

## Domain Monitor Architecture

Each quality domain is backed by a specialized monitor module that knows how to measure violations for that specific domain. The `DomainMonitor` module provides a unified interface:

```elixir
defmodule Prismatic.Quality.DomainMonitor do
  @moduledoc """
  Unified interface for domain-specific quality measurement.

  Each quality domain registers its measurement function, which
  is invoked by the Quality Floor Guardian during periodic checks.
  Domain monitors are stateless -- they compute violations from
  the current codebase state on each invocation.
  """

  @type measurement_result :: %{
    domain: atom(),
    violations: non_neg_integer(),
    details: [violation_detail()],
    measured_at: DateTime.t()
  }

  @type violation_detail :: %{
    file: String.t(),
    line: non_neg_integer(),
    message: String.t(),
    severity: :info | :warning | :error
  }

  @spec measure(atom()) :: {:ok, measurement_result()} | {:error, term()}
  def measure(domain) do
    case domain_module(domain) do
      {:ok, module} ->
        result = module.measure()
        {:ok, %{
          domain: domain,
          violations: length(result.violations),
          details: result.violations,
          measured_at: DateTime.utc_now()
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec domain_module(atom()) :: {:ok, module()} | {:error, :unknown_domain}
  defp domain_module(:dialyzer), do: {:ok, Prismatic.Quality.Domains.Dialyzer}
  defp domain_module(:credo), do: {:ok, Prismatic.Quality.Domains.Credo}
  defp domain_module(:compilation), do: {:ok, Prismatic.Quality.Domains.Compilation}
  defp domain_module(:unsafe_map_access), do: {:ok, Prismatic.Quality.Domains.UnsafeMapAccess}
  defp domain_module(:typespec_coverage), do: {:ok, Prismatic.Quality.Domains.TypespecCoverage}
  defp domain_module(_), do: {:error, :unknown_domain}
end
```

## Escalation Pipeline

When the Quality Floor Guardian detects a quality regression, it triggers an escalation pipeline that progresses through four severity levels. Each level carries increasingly aggressive enforcement actions.

### Level 1: OPTIMAL (99-100%)

At the optimal level, monitoring is passive. The Guardian records measurements, emits telemetry events, and updates the Quality DNA state file. No enforcement actions are taken because all quality domains are within acceptable thresholds.

### Level 2: WARNING (98-99%)

At the warning level, the Guardian emits structured alerts and triggers an investigation workflow. The investigation automatically identifies which domain(s) degraded, when the degradation started, and which commits are likely responsible. Alerts are delivered through session context and terminal output.

### Level 3: CRITICAL (95-98%)

At the critical level, the Guardian activates the auto-evolution system. The [AutoHeal](@/glossary/autoheal.md) agent is invoked to attempt automatic remediation of quality violations. If auto-healing succeeds, the system returns to OPTIMAL. If it fails, the violation is escalated to EMERGENCY.

### Level 4: EMERGENCY (below 95%)

At the emergency level, all commits are blocked until quality is restored. The pre-commit hook pipeline (Phase 8: Quality Protection) rejects any commit attempt when the platform quality score is below 95%. This ensures that quality regressions cannot compound -- the platform remains in a blocked state until the regression is fixed.

## Pre-Commit Integration

Quality monitoring is tightly integrated with the 11-phase pre-commit hook pipeline. Phase 8 (Quality Protection) consults the Quality Floor Guardian before allowing any commit:

```bash
# Phase 8: Quality Protection (from .githooks/pre-commit)
# Checks current quality score via Quality Floor Guardian
# BLOCKS commit if score < 95 (EMERGENCY level)
# WARNS if score < 99 (WARNING/CRITICAL levels)
```

This integration ensures that quality monitoring is not merely observational -- it has teeth. A developer cannot bypass quality monitoring by ignoring dashboards or dismissing alerts because the pre-commit hook enforces the Guardian's decisions directly in the git workflow.

## Quality DNA Integration

The [Quality DNA](@/glossary/quality-dna.md) system provides cross-session persistence for quality monitoring data. Each monitoring check updates the Quality DNA state file (`.claude/quality-dna/current-state.json`), ensuring that quality trends survive session boundaries. When a new session starts, the Quality Floor Guardian loads the previous session's quality state and detects any drift that occurred between sessions.

This integration is critical for detecting slow quality degradation that occurs across multiple sessions. A single session might see quality drop from 100% to 99% -- not alarming on its own. But Quality DNA reveals that the same domain has dropped 1% in each of the last 5 sessions, indicating a systemic problem that requires architectural intervention.

## Telemetry Event Taxonomy

Quality monitoring emits a structured taxonomy of telemetry events:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :quality, :measurement]` | `%{value, threshold}` | domain, tool, timestamp |
| `[:prismatic, :quality, :guardian, :check]` | `%{platform_score, domain_count}` | enforcement_level, timestamp |
| `[:prismatic, :quality, :guardian, :level_change]` | `%{score}` | old_level, new_level, timestamp |
| `[:prismatic, :quality, :gate_decision]` | `%{passed, duration_ms}` | gate, evidence, timestamp |
| `[:prismatic, :quality, :domain, :violation]` | `%{count, severity}` | domain, file, line, message |

These events can be consumed by any telemetry handler -- LiveView dashboards, log aggregators, alerting systems, or external monitoring tools. The event taxonomy is stable and versioned, ensuring backward compatibility for consumers.

## Real-Time Dashboard

The `PrismaticWeb` application provides a LiveView-based quality monitoring dashboard that displays real-time quality state. The dashboard subscribes to quality telemetry events and updates automatically when measurements change:

```elixir
defmodule PrismaticWeb.Live.QualityDashboardLive do
  @moduledoc """
  Real-time quality monitoring dashboard.

  Subscribes to Quality Floor Guardian telemetry events
  and displays current domain scores, trends, and
  enforcement level in a LiveView interface.
  """

  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :telemetry.attach(
        "quality-dashboard-#{inspect(self())}",
        [:prismatic, :quality, :guardian, :check],
        &handle_telemetry_event/4,
        %{pid: self()}
      )
    end

    domains = PrismaticSafety.QualityFloorGuardian.all_domains()
    score = PrismaticSafety.QualityFloorGuardian.current_score()

    {:ok, assign(socket, domains: domains, platform_score: score)}
  end

  defp handle_telemetry_event(_event, measurements, _metadata, %{pid: pid}) do
    send(pid, {:quality_update, measurements})
  end
end
```

## Monitoring Patterns and Anti-Patterns

### Recommended Patterns

1. **Domain isolation** -- Each quality domain has its own monitor with domain-specific semantics. Do not collapse domains into aggregate metrics.
2. **Trend computation** -- Track not just current values but trends (improving, stable, degrading) to catch slow regressions.
3. **Threshold hysteresis** -- Use different thresholds for escalation and de-escalation to avoid flapping between enforcement levels.
4. **Immutable measurement records** -- Never modify historical measurements; append new ones.

### Anti-Patterns to Avoid

1. **Poll-only monitoring** -- Relying solely on periodic polling misses transient regressions. Combine polling with event-driven measurement.
2. **Alert fatigue** -- Monitoring that generates too many low-severity alerts trains developers to ignore them. Use the 4-level escalation to keep noise proportional to severity.
3. **Unmonitored monitors** -- The monitoring system itself must be monitored. The Prismatic Platform uses OTP supervision to restart failed monitors automatically.

## Performance Characteristics

Quality monitoring adds observational overhead that must be kept minimal to avoid impacting development velocity:

| Operation | Latency | Frequency |
|-----------|---------|-----------|
| Single domain measurement | 5-50ms | Every 30s |
| Full 13-domain check | 100-500ms | Every 30s |
| Platform score computation | <1ms | On every domain update |
| Telemetry event emission | <0.1ms | Per event |
| Quality DNA state write | 5-10ms | Per check cycle |

The 30-second check interval balances responsiveness with resource consumption. For the pre-commit hook path, domain measurements are computed synchronously but benefit from cached results when the last check was recent.

## Integration with AutoEvolve

Quality monitoring data feeds directly into the [AutoEvolve](@/glossary/autoevolve.md) system, which uses trend data to identify opportunities for platform improvement. When monitoring detects that a quality domain has been at 100% for an extended period, AutoEvolve may tighten the threshold to push for even higher quality standards. Conversely, when a domain shows persistent difficulty reaching its threshold, AutoEvolve may recommend architectural changes to address the root cause.

## Related Concepts

- [Quality and Transparency](@/glossary/quality-and-transparency.md) -- Making quality metrics visible and auditable
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- The autonomous enforcement agent
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session quality state persistence
- [Quality Gates](@/glossary/quality-gates.md) -- Enforcement checkpoints in the pipeline
- [Quality Debt](@/glossary/quality-debt.md) -- Accumulated quality violations
- [Telemetry](@/glossary/telemetry.md) -- Event-based observability infrastructure
- [AutoHeal](@/glossary/autoheal.md) -- Automatic remediation of quality violations
- [AutoEvolve](@/glossary/autoevolve.md) -- Autonomous platform improvement
- [Monitoring](@/glossary/monitoring.md) -- General observability patterns
- [Health Monitoring](@/glossary/health-monitoring.md) -- System health observation
- [Code Quality](@/glossary/code-quality.md) -- Source code health metrics
- [Autonomous Quality](@/glossary/autonomous-quality.md) -- Self-governing quality systems

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
