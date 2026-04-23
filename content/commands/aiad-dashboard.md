+++
title = "/aiad-dashboard"
weight = 2160
[extra]
category = "Operations"
description = "AIAD dashboard for intelligence and domain monitoring"
syntax = "/aiad-dashboard [options]"
authority = "L2+"
agent = "aiad-dashboard-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1167
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["aiad-dashboard", "AIAD", "commands", "Operations", "Prismatic Platform", "Real", "Strategic Intelligence"]
tags = ["commands", "operations", "aiad-dashboard", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/aiad-dashboard - Prismatic Platform"
+++

## Overview

The **/aiad-dashboard** command provides a real-time intelligence dashboard for the entire [AIAD](/glossary/aiad/) ecosystem, delivering live metrics on agent performance, command execution statistics, workflow health, and cross-domain coordination efficiency. In a platform with 400+ agents, 210+ commands, and dozens of active workflows, centralized visibility into ecosystem health is not a luxury -- it is an operational necessity. The dashboard consolidates disparate telemetry streams into a unified operational picture that enables data-driven decision making and proactive issue identification.

The dashboard operates across four analytical dimensions. The **Ecosystem Overview** provides live aggregate metrics including agent success rates, command execution frequency, workflow throughput, and [mycelial network](/glossary/mycelial-network/) health scores. The **Real-Time Intelligence Feed** surfaces active operations, performance alerts, evolution tracking, and resource utilization across all AIAD processes. The **Strategic Intelligence** layer identifies capability gaps, successful coordination patterns, evolution opportunities, and compliance status. The **Predictive Analytics** module projects performance trends, capacity requirements, failure predictions, and AI-powered optimization recommendations.

This command is classified as Strategic Intelligence and is executed by the `aiad-dashboard-commander` agent. The dashboard runs in an isolated process pool to ensure zero performance impact on the monitored systems. Metric collection completes in under 100 milliseconds, and dashboard refresh occurs in under 500 milliseconds, providing near-real-time visibility without degrading platform performance. The command supports domain-specific views, enabling operators to focus on agents, commands, or workflows independently, as well as a comprehensive all-domain view for holistic ecosystem monitoring.

## Usage

```bash
/aiad-dashboard [--domain <domain>] [--detailed] [--realtime]
```

### Full Ecosystem Intelligence Dashboard

```bash
/aiad-dashboard
```

### Agent Performance Domain View

```bash
/aiad-dashboard --domain agents --detailed
```

### Real-Time Monitoring with Custom Refresh Interval

```bash
/aiad-dashboard --realtime --refresh-interval 3
```

### Command Usage Statistics

```bash
/aiad-dashboard --domain commands --detailed
```

### Workflow Execution and Bottleneck Analysis

```bash
/aiad-dashboard --domain workflows --detailed
```

## Options and Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--domain` | enum | `all` | Domain to display: `agents`, `commands`, `workflows`, `all` |
| `--detailed` | boolean | `false` | Show detailed metrics with per-entity breakdowns |
| `--realtime` | boolean | `false` | Enable real-time refresh mode |
| `--refresh-interval` | integer | `5` | Refresh interval in seconds (requires `--realtime`) |
| `--performance` | boolean | `false` | Show performance-focused metrics |
| `--trends` | boolean | `false` | Include 7-day and 30-day performance trends |
| `--health` | boolean | `false` | Deep health analysis with recommendations |
| `--alerts` | boolean | `false` | Show active performance and health alerts |
| `--severity` | string | `all` | Alert severity filter: `critical`, `warning`, `info`, `all` |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Operational and above) |
| **Executing Agent** | `aiad-dashboard-commander` |
| **Status** | Production |
| **Usage Frequency** | Medium (daily operational monitoring) |
| **Category** | Operations / Strategic Intelligence |
| **Classification** | Strategic Command |
| **Process Isolation** | Runs in isolated process pool |
| **Metric Collection** | < 100ms |
| **Dashboard Refresh** | < 500ms |

## Technical Implementation

The dashboard is implemented as a GenServer-based metric collection system that aggregates telemetry data from across the AIAD ecosystem. The `AIAD.IntelligenceDashboard` module maintains an in-memory cache of the latest metrics, refreshed on configurable intervals via timer-based message passing. The architecture ensures that metric collection does not interfere with production operations through process isolation and bounded collection timeouts.

```elixir
defmodule AIAD.IntelligenceDashboard do
  @moduledoc """
  Real-time intelligence dashboard GenServer for AIAD ecosystem monitoring.
  Collects live metrics from agents, commands, workflows, and mycelial networks
  with zero performance impact through process isolation.
  """

  use GenServer

  @default_refresh_interval 5_000
  @collection_timeout 100

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(opts) do
    interval = Keyword.get(opts, :refresh_interval, @default_refresh_interval)
    :timer.send_interval(interval, self(), :collect_metrics)

    {:ok, %{
      metrics: collect_ecosystem_metrics(),
      last_collected: DateTime.utc_now(),
      refresh_interval: interval
    }}
  end

  @spec collect_ecosystem_metrics() :: map()
  def collect_ecosystem_metrics do
    tasks = [
      Task.async(fn -> {:agents, collect_agent_metrics()} end),
      Task.async(fn -> {:commands, collect_command_metrics()} end),
      Task.async(fn -> {:workflows, collect_workflow_metrics()} end),
      Task.async(fn -> {:mycelial, collect_mycelial_metrics()} end)
    ]

    tasks
    |> Task.await_many(@collection_timeout)
    |> Map.new()
  end

  def handle_info(:collect_metrics, state) do
    metrics = collect_ecosystem_metrics()
    {:noreply, %{state | metrics: metrics, last_collected: DateTime.utc_now()}}
  end

  def handle_call(:get_metrics, _from, state) do
    {:reply, {:ok, state.metrics}, state}
  end
end
```

The dashboard presents four distinct analytical layers. The Ecosystem Overview aggregates total agent count, active agent count, average response time, success rate, and coordination efficiency into a single summary view. The Command Usage section tracks execution frequency, success rates, average execution time, and identifies optimization opportunities. The Workflow Health module monitors active pipelines, completion rates, bottleneck counts, and throughput metrics. The Mycelial Network section reports network health scores, active propagation counts, cross-domain success rates, and emergence detection events.

When the LiveView-based web dashboard is active, metrics are pushed via Phoenix PubSub for real-time browser updates. The dashboard subscribes to the `"aiad_dashboard"` topic and renders updates using server-sent events through the LiveView socket, providing a smooth, real-time monitoring experience without polling overhead.

## Workflow Integration

The `/aiad-dashboard` command serves as the operational nerve center for platform administration. At the beginning of each development session, operators invoke the dashboard to establish a baseline understanding of ecosystem health. This initial check reveals any agents that have degraded, commands that are experiencing elevated failure rates, or workflows with emerging bottlenecks.

During active development, the real-time mode (`--realtime`) provides continuous monitoring that surfaces issues as they occur. This is particularly valuable during deployment windows, evolution cycles, and multi-agent orchestration operations where rapid feedback on system health is critical. The alert system surfaces performance degradation warnings and optimization opportunities proactively, enabling intervention before issues impact downstream operations.

The dashboard also serves a strategic planning function. The trend analysis (`--trends`) reveals performance trajectories over 7-day and 30-day windows, supporting capacity planning and resource allocation decisions. The health analysis (`--health`) provides deep diagnostic information with specific improvement recommendations, bridging the gap between observation and action.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Monitors all 400+ agents with performance and health metrics |
| AIAD Registry | Command and agent specification source for dashboard entities |
| [Quality Gates](/glossary/quality-gates/) | Quality gate compliance status displayed in dashboard |
| [Telemetry](/glossary/telemetry/) | Primary data source for all dashboard [metrics](/glossary/metrics/) |
| [Mycelial Network](/glossary/mycelial-network/) | Network health, propagation success, and emergence tracking |
| Phoenix PubSub | Real-time metric delivery to LiveView dashboard |
| [/agents](/commands/agents/) | Agent discovery data feeds dashboard agent metrics |
| [/aiad-auto-evolution](/commands/aiad-auto-evolution/) | Evolution progress and safety metrics displayed |
| [Session Context](/glossary/session-discipline/) | Dashboard state persisted for cross-session continuity |

## Doctrine Compliance

All dashboard operations are governed by the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: The dashboard reports honest, unfiltered metrics. Degraded agents are shown as degraded, not hidden or minimized. Failed commands are counted accurately. Bottlenecks are identified by name. There is no metric whitewashing, no optimistic rounding, and no suppression of inconvenient data points. The dashboard presents reality as measured, not reality as desired.
- **NO DOUBTS**: All metrics are derived from verified telemetry data with timestamps and provenance. The dashboard does not present estimates where measurements are available. When data is stale (beyond the expected refresh interval), staleness is explicitly indicated. Predictive analytics are clearly labeled as predictions with confidence intervals, never presented as established facts.

The dashboard enforces the NABLA axiom of Time Decay by displaying timestamps on all metrics and visually indicating when data freshness falls below acceptable thresholds. Stale data is flagged rather than silently presented as current.

## Best Practices

1. **Start each session with a dashboard check**: Run `/aiad-dashboard` at the beginning of every development session to establish a health baseline. This 30-second investment prevents hours of debugging issues that could have been caught early.

2. **Use domain-specific views for focused work**: When working within a specific domain (e.g., storage optimization), use `--domain workflows` or `--domain agents` to reduce noise and focus on relevant metrics.

3. **Enable real-time mode during deployments**: During deployment windows and evolution cycles, switch to `--realtime --refresh-interval 3` for maximum visibility into system behavior during critical operations.

4. **Leverage trend analysis for planning**: Regularly review `--trends` data to identify performance trajectories. Declining trends in agent success rates or increasing command execution times indicate emerging issues before they become critical.

5. **Act on health recommendations**: The `--health` mode provides specific, actionable recommendations. These are derived from actual telemetry analysis, not generic suggestions. Treat them as high-priority improvement items.

6. **Monitor mycelial network health**: The mycelial network section is often the earliest indicator of ecosystem-wide issues. A declining network health score typically precedes visible degradation in agent performance and command success rates.

## Related Commands

- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/aiad-auto-evolution](/commands/aiad-auto-evolution/) - Self-evolving command specification with meta-evolution capabilities
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers
- [/code](/commands/code/) - Core coding implementation and feature development
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)