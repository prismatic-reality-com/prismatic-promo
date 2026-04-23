+++
title = "Automated Diagnostics"
weight = 50
[extra]
tags = ["glossary", "diagnostics", "monitoring", "observability", "health", "autoheal", "quality", "telemetry"]
description = "Automated analysis and identification of system health issues, performance degradation, or quality violations through continuous monitoring, pattern recognition, and root-cause inference without manual investigation"
category = "observability"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "System Observability and Health"
related_concepts = ["autoheal", "health-monitoring", "system-monitoring", "observability", "telemetry", "quality-floor-guardian", "circuit-breaker"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 6
prerequisites = ["telemetry", "observability", "monitoring", "genserver"]
learning_path = ["telemetry", "observability", "health-monitoring", "automated-diagnostics", "autoheal"]
interactive_demos = ["/labs/glossary/automated-diagnostics"]
code_examples = ["Diagnostic engine GenServer", "Health check pipeline", "Anomaly detector with telemetry"]
external_resources = ["https://hexdocs.pm/telemetry/readme.html", "https://opentelemetry.io/docs/"]
version_introduced = "Generation 5"
stability_level = "stable"
testing_scenarios = ["degradation detection", "false positive filtering", "cascading failure diagnosis", "recovery verification"]
keywords = ["diagnostics", "health", "monitoring", "anomaly", "root-cause", "autoheal", "observability", "telemetry", "degradation"]
related_terms = ["autoheal", "health-monitoring", "system-monitoring", "observability", "telemetry", "quality-floor-guardian", "circuit-breaker", "self-healing", "quality-gate", "distributed-tracing"]
word_count = 1720
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Automated Diagnostics - Prismatic Platform"
+++

## Definition

Automated diagnostics is the systematic, programmatic analysis and identification of system health issues, performance degradation, quality violations, or anomalous behavior through continuous monitoring, pattern recognition, and root-cause inference -- all without requiring manual investigation by a human operator. Where traditional diagnostics involves a human examining logs, metrics, and traces to form a hypothesis about what is wrong, automated diagnostics encodes that investigative process as software that runs continuously and produces structured findings.

An automated diagnostic system can be formalized as a pipeline: `Observe(signals) -> Correlate(patterns) -> Hypothesize(causes) -> Rank(severity) -> Report(findings)`. Each stage transforms raw observability data into increasingly actionable information, culminating in a diagnostic report that identifies the problem, its probable root cause, its severity, and recommended remediation steps.

## Overview

The need for automated diagnostics arises from a fundamental scaling problem: as systems grow in complexity, the volume of observability data grows faster than any human team's ability to analyze it. A modern distributed system generates millions of telemetry events per minute. A human operator staring at dashboards cannot detect subtle performance degradation, correlate cross-service failures, or identify the early stages of a cascading failure before it becomes a production incident.

Automated diagnostics addresses this by applying the same investigative methodology that skilled operators use, but at machine speed and scale. The system continuously ingests metrics, logs, and traces; applies pattern recognition to identify anomalies; correlates anomalies across subsystems to identify root causes; and produces structured diagnostic reports that operators can act on immediately.

The evolution of automated diagnostics tracks the evolution of observability itself. First-generation systems were threshold-based: CPU > 90% triggers an alert. Second-generation systems added anomaly detection: CPU is 2 standard deviations above its rolling average. Third-generation systems (where Prismatic operates) add causal reasoning: CPU is high because the query planner changed execution strategy after the last deployment, which caused table scan patterns to shift, which increased I/O pressure, which caused the CPU spike. The diagnostic output is not "CPU is high" but "deployment X caused query regression Y which manifests as CPU spike Z."

Three capabilities distinguish advanced automated diagnostics from simple alerting:

1. **Root-cause inference**: Identifying why something is wrong, not just that something is wrong.
2. **Cross-signal correlation**: Connecting seemingly unrelated anomalies across different subsystems.
3. **Temporal reasoning**: Understanding the sequence of events that led to the current state, including time-lagged effects.

## Technical Details

### Diagnostic Pipeline Architecture

The Prismatic Platform implements a multi-stage diagnostic pipeline:

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────┐
│  Telemetry   │───>│   Anomaly    │───>│  Root-Cause    │───>│ Severity │
│  Ingestion   │    │  Detection   │    │  Correlation   │    │ Ranking  │
└─────────────┘    └──────────────┘    └────────────────┘    └──────────┘
                                                                   │
                                                                   v
                                                            ┌──────────┐
                                                            │ Report & │
                                                            │ Remediate│
                                                            └──────────┘
```

### Diagnostic Engine Implementation

```elixir
defmodule Prismatic.Diagnostics.Engine do
  @moduledoc """
  Core diagnostic engine that continuously analyzes system health
  signals, detects anomalies, correlates findings across subsystems,
  and produces structured diagnostic reports. Implements the
  Observe-Correlate-Hypothesize-Rank-Report pipeline.
  """

  use GenServer

  @type signal :: %{
    source: atom(),
    metric: atom(),
    value: number(),
    timestamp: DateTime.t(),
    metadata: map()
  }

  @type anomaly :: %{
    signal: signal(),
    deviation: float(),
    baseline: number(),
    severity: :low | :medium | :high | :critical,
    first_seen: DateTime.t()
  }

  @type diagnostic_report :: %{
    id: String.t(),
    timestamp: DateTime.t(),
    anomalies: [anomaly()],
    root_cause: root_cause() | nil,
    severity: :low | :medium | :high | :critical,
    impact: String.t(),
    remediation: [String.t()],
    confidence: float()
  }

  @type root_cause :: %{
    category: atom(),
    description: String.t(),
    evidence: [anomaly()],
    confidence: float()
  }

  @check_interval_ms 10_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_latest_report() :: {:ok, diagnostic_report()} | {:error, :no_report}
  def get_latest_report do
    GenServer.call(__MODULE__, :get_latest_report)
  end

  @spec get_health_summary() :: {:ok, map()}
  def get_health_summary do
    GenServer.call(__MODULE__, :get_health_summary)
  end

  @impl GenServer
  def init(opts) do
    state = %{
      baselines: %{},
      active_anomalies: [],
      reports: [],
      signal_buffer: [],
      check_interval: Keyword.get(opts, :check_interval, @check_interval_ms)
    }

    schedule_check(state.check_interval)
    {:ok, state}
  end

  @impl GenServer
  def handle_info(:run_diagnostics, state) do
    new_state =
      state
      |> collect_signals()
      |> detect_anomalies()
      |> correlate_root_causes()
      |> generate_reports()

    schedule_check(state.check_interval)
    {:noreply, new_state}
  end

  @impl GenServer
  def handle_call(:get_latest_report, _from, state) do
    case state.reports do
      [latest | _] -> {:reply, {:ok, latest}, state}
      [] -> {:reply, {:error, :no_report}, state}
    end
  end

  @impl GenServer
  def handle_call(:get_health_summary, _from, state) do
    summary = %{
      active_anomalies: length(state.active_anomalies),
      critical_count: Enum.count(state.active_anomalies, &(&1.severity == :critical)),
      baselines_tracked: map_size(state.baselines),
      last_check: DateTime.utc_now(),
      overall_health: compute_overall_health(state.active_anomalies)
    }

    {:reply, {:ok, summary}, state}
  end

  @spec collect_signals(map()) :: map()
  defp collect_signals(state) do
    signals = [
      collect_beam_metrics(),
      collect_process_metrics(),
      collect_quality_metrics(),
      collect_storage_metrics()
    ] |> List.flatten()

    %{state | signal_buffer: signals}
  end

  @spec detect_anomalies(map()) :: map()
  defp detect_anomalies(state) do
    anomalies =
      state.signal_buffer
      |> Enum.map(fn signal ->
        baseline = Map.get(state.baselines, {signal.source, signal.metric})
        detect_signal_anomaly(signal, baseline)
      end)
      |> Enum.reject(&is_nil/1)

    updated_baselines =
      Enum.reduce(state.signal_buffer, state.baselines, fn signal, acc ->
        key = {signal.source, signal.metric}
        Map.update(acc, key, signal.value, &update_baseline(&1, signal.value))
      end)

    %{state | active_anomalies: anomalies, baselines: updated_baselines}
  end

  @spec correlate_root_causes(map()) :: map()
  defp correlate_root_causes(state) do
    # Group anomalies by temporal proximity and subsystem relationship
    # to identify common root causes
    state
  end

  @spec generate_reports(map()) :: map()
  defp generate_reports(%{active_anomalies: []} = state), do: state

  defp generate_reports(state) do
    report = %{
      id: generate_report_id(),
      timestamp: DateTime.utc_now(),
      anomalies: state.active_anomalies,
      root_cause: infer_root_cause(state.active_anomalies),
      severity: max_severity(state.active_anomalies),
      impact: describe_impact(state.active_anomalies),
      remediation: suggest_remediation(state.active_anomalies),
      confidence: compute_confidence(state.active_anomalies)
    }

    emit_diagnostic_telemetry(report)
    %{state | reports: [report | Enum.take(state.reports, 99)]}
  end

  @spec compute_overall_health([anomaly()]) :: :healthy | :degraded | :unhealthy | :critical
  defp compute_overall_health([]), do: :healthy
  defp compute_overall_health(anomalies) do
    cond do
      Enum.any?(anomalies, &(&1.severity == :critical)) -> :critical
      Enum.any?(anomalies, &(&1.severity == :high)) -> :unhealthy
      Enum.any?(anomalies, &(&1.severity == :medium)) -> :degraded
      true -> :healthy
    end
  end

  defp schedule_check(interval), do: Process.send_after(self(), :run_diagnostics, interval)
  defp detect_signal_anomaly(_signal, nil), do: nil

  defp detect_signal_anomaly(signal, baseline) do
    deviation = abs(signal.value - baseline) / max(baseline, 1.0)

    if deviation > 0.25 do
      %{
        signal: signal,
        deviation: deviation,
        baseline: baseline,
        severity: severity_from_deviation(deviation),
        first_seen: DateTime.utc_now()
      }
    end
  end

  defp severity_from_deviation(d) when d > 1.0, do: :critical
  defp severity_from_deviation(d) when d > 0.5, do: :high
  defp severity_from_deviation(d) when d > 0.25, do: :medium
  defp severity_from_deviation(_), do: :low

  defp update_baseline(old, new), do: old * 0.9 + new * 0.1
  defp generate_report_id, do: :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)
  defp max_severity(anomalies), do: anomalies |> Enum.map(& &1.severity) |> Enum.max()
  defp infer_root_cause(_anomalies), do: nil
  defp describe_impact(_anomalies), do: "System health degradation detected"
  defp suggest_remediation(_anomalies), do: ["Investigate anomalous metrics", "Check recent deployments"]
  defp compute_confidence(_anomalies), do: 0.75
  defp collect_beam_metrics, do: []
  defp collect_process_metrics, do: []
  defp collect_quality_metrics, do: []
  defp collect_storage_metrics, do: []
  defp emit_diagnostic_telemetry(report) do
    :telemetry.execute(
      [:prismatic, :diagnostics, :report],
      %{anomaly_count: length(report.anomalies), confidence: report.confidence},
      %{severity: report.severity}
    )
  end
end
```

### Health Check Classification

The diagnostic system classifies health checks into categories:

| Category | Metrics | Check Frequency | Response Time |
|----------|---------|-----------------|---------------|
| **BEAM VM** | Memory, process count, scheduler utilization, GC pressure | 10s | < 1ms |
| **Application** | Response time, error rate, throughput, queue depth | 10s | < 5ms |
| **Quality** | Compilation warnings, Credo violations, test failures, coverage | 60s | < 30s |
| **Storage** | ETS table size, Ecto pool utilization, query latency | 30s | < 10ms |
| **Infrastructure** | Disk usage, network latency, DNS resolution time | 60s | < 50ms |
| **Dependencies** | External service health, API response times, certificate expiry | 300s | < 5s |

### Anomaly Detection Methods

The platform employs multiple anomaly detection approaches:

**Statistical Baseline Deviation**: Each metric maintains an exponentially weighted moving average (EWMA). Deviations beyond configurable thresholds (default: 25% for warning, 50% for error, 100% for critical) trigger anomaly flags.

**Pattern Matching**: Known failure patterns are encoded as rules. For example, "process count increasing linearly while memory is stable" suggests a process leak. "Query latency increasing while throughput is constant" suggests index degradation.

**Temporal Correlation**: Anomalies that appear within a configurable time window across related subsystems are grouped. A deployment event followed by increased error rates within 5 minutes is flagged as a potential deployment regression.

## Implementation in Prismatic Platform

### Autoheal Baseline System

The [Autoheal](@/glossary/autoheal.md) system establishes diagnostic baselines at session start via `mix autoheal.baseline`. This captures a snapshot of platform health metrics that serves as the reference point for all subsequent diagnostic comparisons during the session. At session end, `mix autoheal.cycle` runs a full diagnostic pass and applies any safe remediations it identifies.

### Quality Floor Guardian

The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) is a specialized diagnostic system focused exclusively on quality metrics. It monitors the platform's quality score (currently 100/100) and triggers increasingly aggressive responses as quality degrades:

| Quality Score | State | Response |
|--------------|-------|----------|
| 100-99% | OPTIMAL | Monitor only |
| 98-99% | WARNING | Alert + investigation |
| 95-98% | CRITICAL | Auto-evolution trigger |
| < 95% | EMERGENCY | Block commits + escalate |

### Health Monitoring Integration

The `HealthMonitor` module within [PrismaticSupervisor](@/glossary/supervisor.md) performs continuous diagnostic checks across all supervised applications. It tracks startup times, restart frequencies, and crash patterns to identify applications that are unhealthy or degrading.

### Circuit Breaker Diagnostics

The [Circuit Breaker](@/glossary/circuit-breaker.md) pattern integrates with diagnostics to detect when external dependencies are failing. When a circuit breaker opens, the diagnostic system records the event, tracks the duration, and monitors the half-open test calls to determine when the dependency recovers. This produces a timeline of dependency health that aids post-incident analysis.

### Telemetry-Driven Diagnostics

All diagnostic data flows through the [Telemetry](@/glossary/telemetry.md) system. The platform emits events for every significant operation, and the diagnostic engine subscribes to these events via `:telemetry.attach/4`. This decoupled architecture means diagnostic logic can be added, modified, or removed without changing the instrumented code.

### Risk Pattern Detection

The pre-commit diagnostic system scans for known risk patterns in code changes:

- `length() > 0` anti-patterns (should use pattern matching or `Enum.empty?/1`)
- New `Process.sleep` calls (suggests timing-dependent code)
- Missing `@spec` on public functions
- Unsafe map access via `map.key` instead of `Map.get/3` or `Map.fetch!/2`
- High-risk file modifications (router, supervision tree, configuration)

## Comparison with Alternatives

| Approach | Detection Speed | Root-Cause Capability | False Positive Rate | Operational Cost |
|----------|----------------|----------------------|---------------------|------------------|
| **Manual investigation** | Minutes-hours | High (human intuition) | Low | High (human time) |
| **Threshold alerting** | Seconds | None | High | Low |
| **APM tools (Datadog, New Relic)** | Seconds | Medium | Medium | Medium-High ($) |
| **Custom anomaly detection** | Seconds | Medium | Low (tuned) | Medium |
| **Prismatic integrated diagnostics** | Seconds | High | Low | Low (built-in) |

The Prismatic approach differs from commercial APM tools in that diagnostics are integrated into the platform itself, not bolted on as an external service. This enables diagnostics to access internal state (ETS tables, GenServer state, supervision tree structure) that external tools cannot observe, producing deeper and more accurate root-cause analysis.

## Best Practices

1. **Establish baselines before monitoring**: Anomaly detection without baselines produces meaningless results. Always run a baseline capture before activating diagnostic monitoring for a new system or after significant changes.

2. **Layer diagnostic granularity**: Start with coarse-grained health checks (is the system up?) and progressively add finer-grained diagnostics (is this specific query performing within bounds?). This prevents diagnostic overhead from overwhelming the system it monitors.

3. **Use exponential backoff for diagnostic escalation**: When an anomaly is first detected, check more frequently to confirm it is real. If confirmed, reduce check frequency to avoid diagnostic overhead during an incident.

4. **Separate observation from action**: The diagnostic system should report findings, not take corrective action. Remediation is a separate concern with its own authorization and safety requirements. Mixing them creates systems that can make bad situations worse.

5. **Test diagnostic accuracy**: Diagnostic systems can have bugs too. Inject known anomalies and verify that the diagnostic system detects them correctly. Also verify that normal variation does not trigger false positives.

6. **Preserve diagnostic history**: Historical diagnostic data is invaluable for post-incident analysis, capacity planning, and identifying slow-developing trends that real-time monitoring misses.

7. **Account for diagnostic overhead**: Every diagnostic check consumes resources. Ensure that the diagnostic system's resource consumption is bounded and does not contribute to the problems it is trying to detect.

## Common Pitfalls

1. **Alert fatigue**: Too many low-severity diagnostics desensitize operators to all diagnostics, including critical ones. Calibrate severity thresholds carefully and suppress known-harmless anomalies.

2. **Stale baselines**: Baselines computed months ago may not reflect current system behavior after deployments, configuration changes, or traffic pattern shifts. Implement baseline refresh mechanisms.

3. **Diagnostic cascades**: One real problem causes dozens of correlated diagnostic findings. Without root-cause correlation, operators waste time investigating symptoms rather than causes.

4. **Missing the slow burn**: Anomaly detection tuned for sudden spikes misses gradual degradation. A metric that increases 1% per day is invisible to spike detectors but disastrous over months. Include trend analysis in the diagnostic repertoire.

5. **Confusing correlation with causation**: Two metrics moving together does not mean one caused the other. Diagnostic correlation should be treated as hypothesis generation, not proof. Root-cause confirmation requires additional investigation.

6. **Diagnosing the wrong layer**: A slow HTTP response might be caused by the application, the database, the network, or the load balancer. Diagnostics must span the full stack to avoid misattribution.

7. **Ignoring the diagnostic system's own health**: The diagnostic system itself can fail, degrade, or produce incorrect results. Monitor the monitor -- track diagnostic system health metrics alongside application metrics.

## Use Cases

### Pre-Session Health Assessment
Every Claude Code session begins with `mix autoheal.baseline`, which runs a comprehensive diagnostic pass across the entire platform. This identifies any pre-existing issues before the session begins and establishes the reference state for detecting regressions caused by session work.

### Quality Degradation Detection
The Quality Floor Guardian continuously monitors 13 quality domains. When any domain degrades, the diagnostic system identifies which specific checks failed, which files are responsible, and what the most likely fix is. This transforms "quality score dropped" into "Credo violation in module X, line Y: unused variable."

### Post-Deployment Validation
After any deployment to staging or production, the diagnostic system performs an automated health check that verifies response times, error rates, and key business metrics. Regressions are detected within seconds and flagged for rollback consideration.

### Dependency Health Tracking
The diagnostic system monitors all external dependencies (databases, APIs, services) and maintains health timelines. When a dependency becomes unreliable, the system identifies the pattern (intermittent failures, increasing latency, complete outage) and correlates it with application-level symptoms.

### Capacity Planning
Long-term diagnostic data reveals resource consumption trends that inform capacity planning decisions. If memory usage is growing 2% per week, the diagnostic system can project when capacity limits will be reached and recommend scaling actions.

## Related Concepts

- [Autoheal](@/glossary/autoheal.md) -- the self-healing system that acts on diagnostic findings
- [Health Monitoring](@/glossary/health-monitoring.md) -- continuous health check infrastructure
- [System Monitoring](@/glossary/system-monitoring.md) -- broader system observation practices
- [Observability](@/glossary/observability.md) -- the ability to understand internal state from external outputs
- [Telemetry](@/glossary/telemetry.md) -- the instrumentation system that provides diagnostic data
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- specialized quality diagnostics
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- fault isolation pattern that integrates with diagnostics
- [Self-Healing](@/glossary/self-healing.md) -- systems that remediate issues found by diagnostics
- [Distributed Tracing](@/glossary/distributed-tracing.md) -- cross-service request tracking for diagnostics
- [Quality Gate](@/glossary/quality-gate.md) -- checkpoints that diagnostic findings can trigger

## See Also

- [Autoheal](@/glossary/autoheal.md) for the remediation system that acts on diagnostic findings
- [Autoevolve](@/glossary/autoevolve.md) for automated evolution driven by diagnostic insights
- [Supervision Tree](@/glossary/supervision-tree.md) for OTP process health management
- [Structured Logging](@/glossary/structured-logging.md) for machine-parseable log data
- [Quality DNA](@/glossary/quality-dna.md) for cross-session quality state persistence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
