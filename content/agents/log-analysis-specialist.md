+++
title = "log-analysis-specialist"
weight = 234
[extra]
domain = "infrastructure"
level = "L3"
description = "Intelligent log aggregation, parsing, and pattern detection"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["log-analysis-specialist", "Intelligent", "agents", "agent", "Prismatic Platform", "BEAM", "Alert", "Medium"]
tags = ["agents", "agent", "log-analysis-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "log-analysis-specialist - Prismatic Platform"
+++

## Overview

The Log Analysis Specialist operates as an L3 strategic command agent within the Infrastructure domain of the Prismatic Platform. This agent provides intelligent log aggregation, parsing, and pattern detection across the platform's 90 [umbrella application](@/glossary/umbrella-application.md)s, identifying anomalies, error patterns, and performance degradation signals from structured and unstructured log data. By applying pattern recognition to the continuous stream of operational logs, the specialist detects issues before they escalate to user-visible incidents.

Log analysis in a [BEAM](@/glossary/beam.md)-based distributed system presents unique challenges. Elixir applications generate structured logs through Logger with metadata, OTP supervision trees produce crash reports with process genealogy, and [Phoenix](@/glossary/phoenix.md) request logs contain timing information for every connection. The Log Analysis Specialist normalizes these heterogeneous log formats into a unified analysis pipeline, correlates events across processes and applications, and extracts actionable intelligence from the log stream.

## Operational Domain

The Infrastructure domain handles all operational concerns including log management, monitoring, and alerting. The Log Analysis Specialist serves as the intelligence layer above raw log collection, transforming operational data into situational awareness for platform operators and automated systems.

## Log Processing Pipeline

The specialist processes logs through a multi-stage pipeline that transforms raw log entries into actionable intelligence.

| Stage | Function | Input | Output |
|---|---|---|---|
| Collection | Aggregate logs from all sources | Raw log entries | Normalized log records |
| Parsing | Extract structured fields | Normalized records | Parsed log events |
| Enrichment | Add context and correlation IDs | Parsed events | Enriched events |
| Pattern Detection | Match against known patterns | Enriched events | Classified events |
| Anomaly Detection | Identify unusual patterns | Event stream | Anomaly alerts |
| Reporting | Generate analysis reports | Classified + anomaly events | Analysis reports |

```elixir
defmodule PrismaticAgents.LogAnalysis do
  @moduledoc """
  Log analysis engine that processes platform logs through
  pattern detection and anomaly identification pipelines.
  """

  use GenServer

  @type log_event :: %{
    timestamp: DateTime.t(),
    level: :debug | :info | :warning | :error,
    source: String.t(),
    message: String.t(),
    metadata: map(),
    correlation_id: String.t() | nil
  }

  @type pattern_match :: %{
    pattern_id: String.t(),
    severity: :low | :medium | :high | :critical,
    events: [log_event()],
    recommendation: String.t()
  }

  @spec analyze_window(DateTime.t(), DateTime.t()) :: {:ok, [pattern_match()]}
  def analyze_window(from, to) do
    GenServer.call(__MODULE__, {:analyze, from, to}, :timer.minutes(5))
  end

  @impl true
  def handle_call({:analyze, from, to}, _from, state) do
    with {:ok, events} <- fetch_log_events(from, to),
         {:ok, parsed} <- parse_and_enrich(events),
         {:ok, patterns} <- detect_patterns(parsed, state.known_patterns),
         {:ok, anomalies} <- detect_anomalies(parsed, state.baselines) do
      results = merge_findings(patterns, anomalies)
      {:reply, {:ok, results}, update_baselines(state, parsed)}
    end
  end
end
```

## Pattern Detection Library

The specialist maintains a library of known log patterns that indicate specific operational conditions.

| Pattern | Log Indicators | Severity | Response |
|---|---|---|---|
| OTP Crash Cascade | Multiple supervisor restarts within 5s | Critical | Alert + investigation |
| Memory Pressure | GC frequency increase + heap growth | High | Alert + memory profile |
| Connection Pool Exhaustion | Checkout timeout errors > threshold | High | Alert + pool resize |
| Query Performance Degradation | DB query times > 2x baseline | Medium | Alert + EXPLAIN |
| Certificate Expiration | TLS warning within 7 days | Medium | Alert + renewal ticket |
| Dependency Timeout | External API timeouts > threshold | Medium | Circuit breaker review |

## Anomaly Detection

The specialist uses statistical methods to detect anomalous log patterns that deviate from established baselines.

```elixir
defmodule PrismaticAgents.LogAnalysis.AnomalyDetector do
  @z_score_threshold 3.0

  @spec detect(log_event_stream(), baseline()) :: {:ok, [anomaly()]}
  def detect(events, baseline) do
    metrics = calculate_window_metrics(events)

    anomalies = Enum.flat_map(metrics, fn {metric, value} ->
      z_score = (value - baseline[metric].mean) / baseline[metric].stddev

      if abs(z_score) > @z_score_threshold do
        [%{metric: metric, value: value, z_score: z_score, severity: classify_severity(z_score)}]
      else
        []
      end
    end)

    {:ok, anomalies}
  end
end
```

## BEAM-Specific Log Analysis

The specialist provides specialized analysis for BEAM/OTP-specific log patterns that general-purpose log tools miss.

| BEAM Pattern | Detection Method | Significance |
|---|---|---|
| Supervision tree restart | Process exit + supervisor report | System resilience event |
| Message queue buildup | Process info polling | Backpressure needed |
| ETS table size growth | Periodic ETS info check | Memory management needed |
| Scheduler utilization | :scheduler_wall_time | CPU bottleneck detection |
| Port driver errors | Port error log events | External integration issues |
| Hot code reload events | Code change notifications | Deployment tracking |

## Key Capabilities

- **Multi-source log aggregation** collecting and normalizing logs from all 90 umbrella applications, OTP supervision trees, and external service integrations into a unified analysis pipeline
- **Pattern-based detection** matching log events against a maintained library of known operational patterns for rapid identification of common issues
- **Statistical anomaly detection** applying z-score analysis and time-series decomposition to identify unusual log patterns that deviate from established baselines
- **BEAM-specific analysis** providing specialized detection for OTP supervision events, BEAM scheduler utilization, [ETS](@/glossary/ets.md) table growth, and process queue buildup
- **Cross-application correlation** linking log events across applications using correlation IDs to trace the complete path of operations through the distributed system
- **Automated baseline management** continuously updating statistical baselines from observed log patterns to maintain accurate anomaly detection as the system evolves

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md). Multi-domain coordination with authority to analyze logs across all applications and trigger investigation workflows when critical patterns are detected.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [health-monitoring-specialist](@/agents/health-monitoring-specialist.md) | Health Partner | Correlates log patterns with system health metrics |
| [alert-management-specialist](@/agents/alert-management-specialist.md) | Alerting | Routes critical log findings to appropriate alert channels |
| [incident-response-specialist](@/agents/incident-response-specialist.md) | Incident Response | Provides log evidence for incident investigation |
| [performance-monitoring-specialist](@/agents/performance-monitoring-specialist.md) | Performance | Correlates performance metrics with log-detected anomalies |

## Integration

| Component | Relationship |
|---|---|
| Platform [Telemetry](@/glossary/telemetry.md) | Primary log and metric source |
| [ETS](@/glossary/ets.md) | Baseline storage and real-time event buffering |
| [PostgreSQL](@/glossary/postgresql.md) | Historical log storage and query analysis |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | CI pipeline log analysis for build failure detection |

## Enforcement

The Log Analysis Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Critical log patterns trigger immediate alerts with no suppression or batching. Anomaly detection runs continuously without gaps. All detected patterns are recorded with full evidence including the triggering log events, detection confidence, and recommended actions. Log analysis baselines are maintained and version-controlled for audit trail purposes. No runtime warnings or error patterns are ignored -- every signal is evaluated against the pattern library.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)