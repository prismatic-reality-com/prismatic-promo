+++
title = "Real-Time Monitoring"
weight = 11
[extra]
icon = "shield"
color = "emerald"
description = "Continuous event-driven monitoring of platform health, quality metrics, agent operations, and security posture"
category = "observability"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 989
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Real-Time", "Monitoring", "Continuous", "capabilities", "observability", "Prismatic Platform", "PostgreSQL", "Domain"]
tags = ["capabilities", "observability", "real-time-monitoring", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Real-Time Monitoring - Prismatic Platform"
+++

## Overview

Real-Time Monitoring provides continuous observation of platform health, quality metrics, agent operations, and system performance across the entire Prismatic Platform. Built on [Elixir](/technologies/elixir/)/OTP [telemetry](/glossary/telemetry/) and [Phoenix LiveView](/technologies/phoenix-liveview/), it enables immediate detection and response to any deviation from expected behavior. The monitoring infrastructure spans every layer of the platform -- from individual [GenServer](/technologies/genserver/) process health to aggregate quality scores across all 99 umbrella applications.

Unlike traditional monitoring systems that poll at fixed intervals, the Prismatic Platform leverages the [BEAM](/technologies/beam/) virtual machine's built-in observability and the `:telemetry` library to emit events at the point of occurrence. This event-driven architecture means anomalies are detected within milliseconds of occurrence, not at the next polling cycle. The combination of ETS-backed in-memory aggregation and [PostgreSQL](/technologies/postgresql/) time-series storage enables both real-time dashboards and historical trend analysis with zero compromise on either capability.

The monitoring system is not an add-on observability layer but a core platform capability that powers [Autonomous Self-Healing](/capabilities/autonomous-self-healing/), feeds [Quality Gates](/capabilities/quality-gates/) decisions, and enforces the [NO MERCY](/capabilities/no-mercy/) zero-tolerance quality standards in production.

## Monitoring Domains

The platform monitors eight distinct operational domains, each with specialized metrics, collection frequencies, and visualization dashboards:

| Domain | Key Metrics | Collection Frequency | Dashboard |
|--------|------------|---------------------|-----------|
| **Quality Score** | Compilation, [Credo](/technologies/credo/), [Dialyzer](/technologies/dialyzer/), test results | Continuous (per commit) | Quality Floor Guardian |
| **Agent Health** | Operation count, success rate, latency, exceptions | Per-operation | Agent Operations |
| **System Resources** | Memory, CPU, process count, [ETS](/technologies/ets/) tables, schedulers | Every 10 seconds | System Overview |
| **Pipeline Status** | CI/CD stages, deployment health, gate results | Per-commit | Deployment Monitor |
| **Security Posture** | [Color Team](/capabilities/color-teams/) signals, drift detection, threat models | Continuous | Security Dashboard |
| **EASM Surface** | Asset discovery, security ratings, [compliance](/capabilities/compliance/) status | Per-scan cycle | Perimeter Dashboard |
| **OSINT Operations** | Source availability, collection rate, entity freshness | Per-query | Intelligence Overview |
| **Storage Health** | Adapter latency, connection pools, replication lag | Every 5 seconds | Storage Monitor |

## Architecture

### Event-Driven Data Flow

The monitoring architecture follows an event-driven pipeline from source emission through aggregation to visualization:

```
Source Events --> Telemetry Handlers --> ETS Aggregation --> PubSub Broadcast --> LiveView Render
     |                 |                    |                     |                    |
  :telemetry      Handler Module       Time-series           Phoenix.PubSub       Real-time
  .execute()      + ETS Counters       Rollup (1m/5m/1h)    Topic Broadcast      DOM Patch
```

This architecture ensures that monitoring adds negligible overhead to monitored operations. The `:telemetry.execute/3` call is a simple function dispatch with no serialization, no network I/O, and no blocking. Handlers run asynchronously in the calling process, with [ETS](/technologies/ets/) providing lock-free concurrent writes for counter updates.

### Telemetry Event Flow

Every monitored operation emits structured telemetry events through a consistent pipeline:

```elixir
defmodule PrismaticMonitoring.EventPipeline do
  @moduledoc """
  Core monitoring event pipeline.
  Demonstrates the three-stage flow from emission to visualization.
  """

  # Stage 1: Event emission at the source (in the monitored module)
  def emit_agent_operation(agent_name, operation, duration, result) do
    :telemetry.execute(
      [:prismatic, :agent, :execute, :stop],
      %{duration: duration},
      %{agent: agent_name, operation: operation, result: result}
    )
  end

  # Stage 2: Handler aggregation into ETS
  def handle_event(
    [:prismatic, :agent, :execute, :stop],
    %{duration: duration},
    %{agent: agent_name, result: result},
    _config
  ) do
    # Atomic counter update - lock-free, concurrent-safe
    :ets.update_counter(:agent_metrics, {agent_name, :count}, 1)
    :ets.insert(:agent_metrics, {{agent_name, :last_duration}, duration})

    # Track success/failure ratio
    result_key = if result == :ok, do: :success, else: :failure
    :ets.update_counter(:agent_metrics, {agent_name, result_key}, 1)

    # Stage 3: Broadcast to LiveView dashboards
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "monitoring:agents",
      {:agent_metric_updated, agent_name}
    )
  end
end
```

### LiveView Dashboard Infrastructure

The monitoring dashboards are built with [Phoenix LiveView](/technologies/phoenix-liveview/), providing true real-time updates without polling or manual refresh. LiveView's server-rendered approach means dashboard state is always consistent with actual platform state:

```elixir
defmodule PrismaticWeb.MonitoringLive.AgentDashboard do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "monitoring:agents")
    end

    {:ok, assign(socket, agents: fetch_all_agent_stats())}
  end

  @impl true
  def handle_info({:agent_metric_updated, agent_name}, socket) do
    updated_stats = fetch_agent_stats(agent_name)
    agents = Map.put(socket.assigns.agents, agent_name, updated_stats)
    {:noreply, assign(socket, :agents, agents)}
  end

  defp fetch_all_agent_stats do
    :ets.tab2list(:agent_metrics)
    |> Enum.group_by(fn {{agent, _metric}, _val} -> agent end)
    |> Map.new(fn {agent, entries} -> {agent, build_stats(entries)} end)
  end

  defp fetch_agent_stats(agent_name) do
    total = :ets.lookup_element(:agent_metrics, {agent_name, :count}, 2)
    success = :ets.lookup_element(:agent_metrics, {agent_name, :success}, 2)
    last_duration = :ets.lookup_element(:agent_metrics, {agent_name, :last_duration}, 2)

    %{
      total_ops: total,
      success_rate: if(total > 0, do: success / total * 100, else: 0.0),
      last_duration_ms: System.convert_time_unit(last_duration, :native, :millisecond)
    }
  end

  defp build_stats(entries) do
    Enum.into(entries, %{}, fn {{_agent, metric}, value} -> {metric, value} end)
  end
end
```

## Alert Thresholds

The monitoring system defines four severity levels with automated response escalation:

| Level | Condition | Response | Automation |
|-------|-----------|----------|------------|
| **INFO** | Metric within normal range | Log only | Passive observation |
| **WARNING** | Threshold approaching (90% of limit) | Alert + investigation trigger | Blue Team notification |
| **CRITICAL** | Threshold breached (95% of limit) | Auto-healing triggered | Self-healing L1-L3 cycle |
| **EMERGENCY** | System degradation (99% of limit) | Block commits + escalate | Full autoheal + commit block |

### Domain-Specific Thresholds

Each monitoring domain has configurable thresholds calibrated to the platform's operational requirements:

| Domain | Warning | Critical | Emergency |
|--------|---------|----------|-----------|
| **Quality Score** | < 99/100 | < 98/100 | < 95/100 |
| **Agent Success Rate** | < 99% | < 95% | < 90% |
| **Response Latency (p95)** | > 500ms | > 1s | > 5s |
| **Memory Usage** | > 70% of system | > 85% of system | > 95% of system |
| **ETS Table Size** | > 1M entries | > 5M entries | > 10M entries |
| **Process Count** | > 100K processes | > 250K processes | > 500K processes |
| **Scheduler Utilization** | > 70% sustained | > 85% sustained | > 95% sustained |
| **Page Load Time** | > 200ms | > 250ms | > 500ms |

## BEAM Observability Integration

The platform extends standard BEAM virtual machine observability tools with custom instrumentation for deep runtime analysis:

| Tool | Platform Enhancement | Use Case |
|------|---------------------|----------|
| **`:observer`** | Custom panels for agent topology and supervision trees | Development debugging and architecture visualization |
| **`:recon`** | Automated process leak detection with historical trending | Production diagnostics and capacity planning |
| **`:sys.get_state/1`** | GenServer state inspection with immutable audit logging | Incident investigation and state forensics |
| **`:erlang.system_info/1`** | Trend analysis with historical comparison and alerting | Capacity planning and scaling decisions |
| **`:scheduler_wall_time`** | Per-scheduler utilization with load imbalance detection | Performance monitoring and scheduler tuning |
| **`:erlang.memory/0`** | Per-category memory tracking (process, ETS, binary, atom) | Memory leak detection and optimization |

```elixir
defmodule PrismaticMonitoring.SystemProbe do
  @moduledoc """
  Periodic system health probe using BEAM introspection.
  Collects system-level metrics and emits telemetry events.
  """

  use GenServer

  @probe_interval :timer.seconds(10)

  def init(state) do
    :erlang.system_flag(:scheduler_wall_time, true)
    schedule_probe()
    {:ok, state}
  end

  def handle_info(:probe, state) do
    metrics = collect_system_metrics()

    :telemetry.execute(
      [:prismatic, :system, :health],
      metrics,
      %{node: Node.self(), timestamp: System.system_time(:millisecond)}
    )

    schedule_probe()
    {:noreply, %{state | last_metrics: metrics}}
  end

  defp collect_system_metrics do
    memory = :erlang.memory()

    %{
      total_memory: memory[:total],
      process_memory: memory[:processes],
      ets_memory: memory[:ets],
      binary_memory: memory[:binary],
      atom_memory: memory[:atom],
      process_count: :erlang.system_info(:process_count),
      port_count: :erlang.system_info(:port_count),
      run_queue: :erlang.statistics(:run_queue),
      scheduler_count: :erlang.system_info(:schedulers_online),
      ets_table_count: length(:ets.all())
    }
  end

  defp schedule_probe, do: Process.send_after(self(), :probe, @probe_interval)
end
```

## EASM Real-Time Scoring

The [Perimeter](/capabilities/easm/) module's External Attack Surface Management integrates directly with the monitoring infrastructure for continuous security posture assessment:

```
Asset Discovery --> Vulnerability Scan --> Risk Scoring --> Rating Calculation --> Dashboard
      |                  |                    |                  |                   |
   DNS/Cert          CVE Match           Evidence-based      A-F Grade          LiveView
   Enumeration       Port Analysis       NABLA Scoring       300-900 Score      Real-time
```

| EASM Metric | Update Frequency | Visualization |
|-------------|-----------------|---------------|
| **Attack Surface Size** | Per discovery cycle | Asset count timeline with trend |
| **Security Grade** | Per assessment | A-F badge with historical trend |
| **Compliance Status** | Per regulatory check | NIS2/ZKB compliance checklist |
| **Vulnerability Count** | Per scan | Severity distribution chart |
| **Certificate Expiry** | Daily | Countdown timers with alerting |

## Time-Series Aggregation

Raw telemetry events are aggregated into time-series buckets for historical analysis and trend detection. The tiered storage approach balances query performance against retention costs:

| Aggregation Window | Storage Backend | Retention | Primary Use Case |
|-------------------|-----------------|-----------|------------------|
| **Raw events** | [ETS](/technologies/ets/) (in-memory) | 5 minutes | Real-time dashboards, live counters |
| **1-minute rollups** | ETS (in-memory) | 1 hour | Short-term trend detection |
| **5-minute rollups** | [PostgreSQL](/technologies/postgresql/) | 7 days | Daily reporting, shift reviews |
| **1-hour rollups** | PostgreSQL | 90 days | Capacity planning, weekly trends |
| **Daily summaries** | PostgreSQL | 1 year | Long-term trends, quarterly reviews |

```
Raw Events (ETS) --> 1-min Rollup (ETS) --> 5-min Rollup (PG) --> Hourly (PG) --> Daily (PG)
     |                    |                      |                    |              |
  Instant            Counters              Aggregates          Summaries       Long-term
  Access             + Rates               + Percentiles       + Trends        Archives
```

## Structured Logging Integration

All monitoring events emit structured logs in JSON format for correlation with external log aggregation systems:

```elixir
Logger.info("Agent operation completed",
  agent: "blue-drift-detector",
  operation: :drift_scan,
  duration_ms: 142,
  result: :ok,
  findings: 0,
  telemetry_event: [:prismatic, :agent, :execute, :stop]
)

# Output (JSON structured):
# {"level":"info","msg":"Agent operation completed",
#  "agent":"blue-drift-detector","operation":"drift_scan",
#  "duration_ms":142,"result":"ok","findings":0,
#  "telemetry_event":"prismatic.agent.execute.stop",
#  "timestamp":"2026-02-15T10:30:42.123Z"}
```

## Page Load Performance Monitoring

A dedicated monitoring subsystem enforces the platform's strict page load performance standard:

| Metric | Hard Limit | P95 Alert | P99 Alert |
|--------|-----------|-----------|-----------|
| **Total page load** | < 250ms | > 200ms | > 225ms |
| **Server-side render** | < 100ms | > 80ms | > 90ms |
| **LiveView mount** | < 150ms | > 120ms | > 135ms |
| **LiveView handle_event** | < 50ms | > 40ms | > 45ms |
| **Health check** | < 10ms | > 8ms | > 9ms |

Violations at the P99 level trigger automatic investigation. Violations at the hard limit trigger merge blocking in the CI pipeline.

## Integration Points

Real-Time Monitoring connects to every major platform subsystem, serving as the observability backbone:

- Powers [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) detection and response triggers
- Feeds [Quality Gates](/capabilities/quality-gates/) validation with real-time quality metrics
- Monitored by [Color Teams](/capabilities/color-teams/) for security posture and drift assessment
- Built on [Telemetry Integration](/capabilities/telemetry-integration/) event infrastructure
- Enforces [NO MERCY](/capabilities/no-mercy/) zero-tolerance quality standards in production
- Supports [Intelligence Synthesis](/capabilities/intelligence-synthesis/) with operational performance metrics
- Integrates with [AIAD Standard](/capabilities/aiad-standard/) for comprehensive agent health tracking
- Validates [NABLA Axioms](/capabilities/nabla-axioms/) compliance through continuous signal monitoring
- Provides evidence for [Trinity Gate](/capabilities/trinity-gate/) structural consistency validation

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/monitor` | Display current monitoring dashboard | Universal |
| `/monitor agents` | Agent operations dashboard | Universal |
| `/monitor quality` | Quality Floor Guardian status | Universal |
| `/monitor system` | System resource utilization | System |
| `/monitor perimeter` | EASM security posture | Security |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)