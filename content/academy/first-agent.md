+++
title = "Building Your First Autonomous Agent"
weight = 2
[extra]
description = "Step-by-step guide to creating an AIAD-compliant agent from scratch"
category = "beginner"
difficulty = "beginner"
duration = "60 min"
prerequisites = ["getting-started"]
glossary_terms = ["aiad", "agent", "agent-registry", "agent-tier", "no-mercy", "quality-dna"]
technologies = ["elixir", "otp", "genserver"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1021
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Building", "Autonomous", "Agent", "Step-by-step", "AIAD-compliant", "academy", "beginner", "Prismatic Platform", "GenServer", "AIAD"]
tags = ["academy", "beginner", "building-your-first-autonomous-agent", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Building Your First Autonomous Agent - Prismatic Platform"
+++

## Overview

Agents are the fundamental unit of autonomous behavior in the Prismatic Platform. Every agent follows the [AIAD standard](@/glossary/aiad.md) -- a specification that defines how agents declare their capabilities, interact with other agents, and comply with platform policies. This tutorial walks you through creating a fully compliant agent from an empty file to a running, tested, registered component.

You will learn:

- The anatomy of an AIAD agent (specification + implementation + tests)
- How to implement a GenServer-backed agent with proper OTP patterns
- How to register your agent in the platform's agent registry
- How to write comprehensive tests following the NO MERCY testing requirements
- How to integrate your agent with the platform's supervision tree

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Familiarity with Elixir modules, functions, and basic OTP concepts
- Local development environment running successfully (`mix compile` passes)

## Core Concepts

### What Is an AIAD Agent?

An AIAD agent consists of three components:

1. **Agent Specification** (`.aiad/agents/my-agent.agent.md`) -- a YAML-enriched markdown file declaring the agent's purpose, classification, capabilities, and enforcement policies
2. **Agent Implementation** (`apps/<app>/lib/<app>/agents/my_agent.ex`) -- an Elixir module implementing the agent's behavior, typically as a GenServer
3. **Agent Tests** (`apps/<app>/test/<app>/agents/my_agent_test.exs`) -- comprehensive tests covering all agent behaviors

### Agent Classification Tiers

Agents are classified into tiers based on their authority level:

| Tier | Authority | Example |
|------|-----------|---------|
| L1 | Specialist | Single-domain task execution |
| L2 | Tactical | Multi-task coordination within a domain |
| L3 | Strategic | Cross-domain decision making |
| L4 | Supreme | Platform-wide orchestration authority |

For your first agent, you will build an L1 Specialist that monitors a specific metric and reports anomalies.

### The Agent Lifecycle

Every agent follows this lifecycle: **Initialize** (start with configuration) then **Monitor** (observe assigned domain) then **Analyze** (process observations) then **Report** (emit findings through telemetry) then **Evolve** (adapt based on feedback).

## Step-by-Step Guide

### Step 1: Write the Agent Specification

Create the AIAD specification file. This is the contract that declares what your agent does:

```bash
touch .aiad/agents/metric-sentinel.agent.md
```

```yaml
---
agent-spec: "1.0"
name: "metric-sentinel"
version: "1.0.0"
classification: L1
domain: monitoring
tier: specialist

description: |
  Monitors a configurable numeric metric and emits alerts
  when the value crosses defined thresholds.

capabilities:
  - metric_monitoring
  - threshold_alerting
  - trend_detection

inputs:
  - metric_name: string
  - threshold_high: float
  - threshold_low: float
  - check_interval_ms: integer

outputs:
  - alert: "{:alert, metric_name, current_value, threshold}"
  - status: "{:ok, %{metric: name, value: current, trend: direction}}"

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
---
```

### Step 2: Implement the Agent Module

Create the Elixir implementation. Every agent is a GenServer with proper typespecs, documentation, and OTP compliance:

```elixir
defmodule PrismaticAgents.MetricSentinel do
  @moduledoc """
  L1 Specialist Agent: Monitors a numeric metric and emits alerts
  when values cross configured thresholds.

  ## Configuration

      config = %{
        metric_name: "cpu_usage",
        threshold_high: 90.0,
        threshold_low: 10.0,
        check_interval_ms: 5_000,
        metric_source: fn -> :rand.uniform(100) end
      }

      {:ok, pid} = MetricSentinel.start_link(config)

  ## Telemetry Events

  Emits `:prismatic_agents, :metric_sentinel, :alert` when thresholds
  are crossed, and `:prismatic_agents, :metric_sentinel, :check` on
  every periodic check.
  """

  use GenServer

  require Logger

  @type config :: %{
          metric_name: String.t(),
          threshold_high: float(),
          threshold_low: float(),
          check_interval_ms: pos_integer(),
          metric_source: (-> number())
        }

  @type state :: %{
          config: config(),
          history: [float()],
          alert_count: non_neg_integer(),
          last_check: DateTime.t() | nil
        }

  # --- Public API ---

  @doc "Starts the MetricSentinel agent with the given configuration."
  @spec start_link(config()) :: GenServer.on_start()
  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: via_name(config.metric_name))
  end

  @doc "Returns the current status of the sentinel."
  @spec status(String.t()) :: {:ok, map()} | {:error, :not_found}
  def status(metric_name) do
    case GenServer.whereis(via_name(metric_name)) do
      nil -> {:error, :not_found}
      pid -> {:ok, GenServer.call(pid, :status)}
    end
  end

  @doc "Returns the alert history for this sentinel."
  @spec history(String.t()) :: {:ok, [float()]} | {:error, :not_found}
  def history(metric_name) do
    case GenServer.whereis(via_name(metric_name)) do
      nil -> {:error, :not_found}
      pid -> {:ok, GenServer.call(pid, :history)}
    end
  end

  # --- GenServer Callbacks ---

  @impl true
  def init(config) do
    state = %{
      config: config,
      history: [],
      alert_count: 0,
      last_check: nil
    }

    schedule_check(config.check_interval_ms)
    {:ok, state}
  end

  @impl true
  def handle_call(:status, _from, state) do
    status = %{
      metric_name: state.config.metric_name,
      alert_count: state.alert_count,
      last_check: state.last_check,
      trend: compute_trend(state.history),
      history_size: length(state.history)
    }

    {:reply, status, state}
  end

  @impl true
  def handle_call(:history, _from, state) do
    {:reply, state.history, state}
  end

  @impl true
  def handle_info(:check_metric, state) do
    value = state.config.metric_source.()
    now = DateTime.utc_now()

    new_history = Enum.take([value | state.history], 100)

    :telemetry.execute(
      [:prismatic_agents, :metric_sentinel, :check],
      %{value: value},
      %{metric_name: state.config.metric_name}
    )

    new_alert_count =
      if value > state.config.threshold_high or value < state.config.threshold_low do
        emit_alert(state.config.metric_name, value, state.config)
        state.alert_count + 1
      else
        state.alert_count
      end

    schedule_check(state.config.check_interval_ms)

    {:noreply, %{state | history: new_history, alert_count: new_alert_count, last_check: now}}
  end

  # --- Private Functions ---

  defp via_name(metric_name) do
    {:via, Registry, {PrismaticAgents.Registry, {:metric_sentinel, metric_name}}}
  end

  defp schedule_check(interval_ms) do
    Process.send_after(self(), :check_metric, interval_ms)
  end

  defp emit_alert(metric_name, value, config) do
    Logger.warning(
      "MetricSentinel alert: #{metric_name} = #{value} " <>
        "(thresholds: #{config.threshold_low}..#{config.threshold_high})"
    )

    :telemetry.execute(
      [:prismatic_agents, :metric_sentinel, :alert],
      %{value: value},
      %{
        metric_name: metric_name,
        threshold_high: config.threshold_high,
        threshold_low: config.threshold_low
      }
    )
  end

  defp compute_trend([]), do: :stable
  defp compute_trend([_single]), do: :stable

  defp compute_trend(history) do
    recent = Enum.take(history, 5)
    avg_recent = Enum.sum(recent) / length(recent)

    older = history |> Enum.drop(5) |> Enum.take(5)

    if older == [] do
      :stable
    else
      avg_older = Enum.sum(older) / length(older)

      cond do
        avg_recent > avg_older * 1.1 -> :rising
        avg_recent < avg_older * 0.9 -> :falling
        true -> :stable
      end
    end
  end
end
```

### Step 3: Write Comprehensive Tests

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires tests for every behavior. No stubs, no mocks, no placeholders:

```elixir
defmodule PrismaticAgents.MetricSentinelTest do
  use ExUnit.Case, async: true

  alias PrismaticAgents.MetricSentinel

  @default_config %{
    metric_name: "test_metric_#{System.unique_integer([:positive])}",
    threshold_high: 80.0,
    threshold_low: 20.0,
    check_interval_ms: 60_000,
    metric_source: fn -> 50.0 end
  }

  describe "start_link/1" do
    test "starts the agent with valid configuration" do
      config = %{@default_config | metric_name: unique_name()}
      assert {:ok, pid} = MetricSentinel.start_link(config)
      assert Process.alive?(pid)
    end
  end

  describe "status/1" do
    test "returns current status for a running sentinel" do
      config = %{@default_config | metric_name: unique_name()}
      {:ok, _pid} = MetricSentinel.start_link(config)

      assert {:ok, status} = MetricSentinel.status(config.metric_name)
      assert status.metric_name == config.metric_name
      assert status.alert_count == 0
      assert status.trend == :stable
    end

    test "returns error for non-existent sentinel" do
      assert {:error, :not_found} = MetricSentinel.status("nonexistent")
    end
  end

  describe "threshold alerting" do
    test "increments alert count when metric exceeds high threshold" do
      name = unique_name()
      config = %{@default_config | metric_name: name, metric_source: fn -> 95.0 end}
      {:ok, _pid} = MetricSentinel.start_link(config)

      # Trigger a manual check
      send(GenServer.whereis(via_name(name)), :check_metric)
      Process.sleep(10)

      assert {:ok, status} = MetricSentinel.status(name)
      assert status.alert_count >= 1
    end

    test "increments alert count when metric falls below low threshold" do
      name = unique_name()
      config = %{@default_config | metric_name: name, metric_source: fn -> 5.0 end}
      {:ok, _pid} = MetricSentinel.start_link(config)

      send(GenServer.whereis(via_name(name)), :check_metric)
      Process.sleep(10)

      assert {:ok, status} = MetricSentinel.status(name)
      assert status.alert_count >= 1
    end

    test "does not alert when metric is within thresholds" do
      name = unique_name()
      config = %{@default_config | metric_name: name, metric_source: fn -> 50.0 end}
      {:ok, _pid} = MetricSentinel.start_link(config)

      send(GenServer.whereis(via_name(name)), :check_metric)
      Process.sleep(10)

      assert {:ok, status} = MetricSentinel.status(name)
      assert status.alert_count == 0
    end
  end

  defp unique_name, do: "test_#{System.unique_integer([:positive])}"

  defp via_name(name) do
    {:via, Registry, {PrismaticAgents.Registry, {:metric_sentinel, name}}}
  end
end
```

### Step 4: Register the Agent

Update the AIAD index so the platform knows about your agent:

```bash
./.aiad/bin/aiad index
```

This scans all `.aiad/agents/*.agent.md` files and rebuilds the registry.

### Step 5: Add to Supervision Tree

Add your agent to the appropriate supervisor so it starts automatically:

```elixir
# In the parent supervisor's init/1
children = [
  # ... existing children ...
  {PrismaticAgents.MetricSentinel, %{
    metric_name: "system_load",
    threshold_high: 90.0,
    threshold_low: 5.0,
    check_interval_ms: 10_000,
    metric_source: &SystemMetrics.cpu_usage/0
  }}
]
```

## Code Examples

### Querying Agent Status at Runtime

```elixir
# In an IEx session
iex> {:ok, status} = PrismaticAgents.MetricSentinel.status("system_load")
iex> IO.inspect(status)
%{
  metric_name: "system_load",
  alert_count: 3,
  last_check: ~U[2026-02-12 10:30:00Z],
  trend: :rising,
  history_size: 47
}
```

### Attaching Telemetry Handlers

```elixir
:telemetry.attach(
  "metric-sentinel-logger",
  [:prismatic_agents, :metric_sentinel, :alert],
  fn event, measurements, metadata, _config ->
    Logger.warning("Alert on #{metadata.metric_name}: #{measurements.value}")
  end,
  nil
)
```

## Common Pitfalls

**Not using `@impl true` on callbacks.** Every GenServer callback must have `@impl true`. The compiler and Credo enforce this, and missing annotations cause build failures.

**Hardcoding process names.** Use the Registry-based `via_name/1` pattern shown above. Hardcoded atom names prevent running multiple instances and make testing difficult.

**Forgetting to schedule the next check.** In `handle_info(:check_metric, state)`, always call `schedule_check/1` before returning. Missing this creates an agent that checks once and then goes silent.

**Testing with real timers.** Set `check_interval_ms` to a large value in tests and trigger checks manually with `send/2`. Relying on actual timers makes tests slow and flaky.

**Unbounded history growth.** Always cap your history list with `Enum.take/2`. Without a cap, the process memory grows indefinitely and will eventually crash the BEAM.

## Exercises

1. **Add a trend alert.** Extend the agent to emit a separate alert when the trend changes from `:stable` to `:rising` or `:falling`. Write tests for all three transitions.

2. **Add a cooldown period.** Modify the agent so it does not emit more than one alert per minute for the same threshold violation. Track the last alert timestamp in state.

3. **Create a second agent.** Build an L1 agent that monitors disk usage instead of a generic metric. Follow the same three-file pattern (spec, implementation, test).

4. **Write property-based tests.** Using StreamData, generate random metric values and verify that the agent always alerts when thresholds are crossed and never alerts when values are within bounds.

## Summary

Building an AIAD-compliant agent requires three artifacts: a specification file, a GenServer implementation, and comprehensive tests. The agent follows OTP patterns with proper supervision, uses the Registry for process discovery, emits telemetry events for observability, and maintains bounded state. The NO MERCY doctrine ensures every agent ships with full test coverage and zero compilation warnings.

Key takeaways:

- Agents are GenServers registered through the OTP Registry
- Every agent needs a `.aiad/agents/*.agent.md` specification
- Tests must cover all behaviors -- no stubs, no mocks, no placeholders
- Use telemetry for observability rather than direct logging
- Bound all state growth (history lists, caches) to prevent memory leaks

## Practical Implementation

### In Prismatic Platform

The agent patterns taught here are implemented across these applications:

- **prismatic_agents** (`apps/prismatic_agents/`) -- The runtime for 400+ agents. Contains `PrismaticAgents.Registry` for process discovery via `{:via, Registry, ...}` tuples, `PrismaticAgents.Orchestrator` for cross-domain coordination, and `PrismaticAgents.HealthMonitor` for agent lifecycle tracking
- **prismatic_safety** (`apps/prismatic_safety/`) -- Houses the Quality Floor Guardian (`PrismaticSafety.QualityFloorGuardian`), an L3 agent that monitors all 13 quality domains autonomously
- **prismatic_claude** (`apps/prismatic_claude/`) -- Session lifecycle management with `PrismaticClaude.SessionLifecycle` GenServer (905 lines) that tracks session hooks and events
- **prismatic_telemetry** (`apps/prismatic_telemetry/`) -- The `:telemetry` event infrastructure all agents use for observability, following the `[:app_name, :agent_name, :event]` naming convention

### Code Examples from the Codebase

Agent specifications are stored in `.aiad/agents/` and indexed via:

```bash
# Rebuild the AIAD agent index
./.aiad/bin/aiad index

# View the agent registry
cat .claude/AGENT_REGISTRY.md
```

The `PrismaticClaude.SessionLifecycle` is a real-world example of the GenServer agent pattern with circuit breaker:

```elixir
# 905-line GenServer with priority-based hooks, enable/disable per hook,
# and automatic circuit breaker (opens after 3 failures, resets after 60s)
PrismaticClaude.SessionLifecycle.trigger(:session_start)
PrismaticClaude.SessionLifecycle.trigger(:pre_command)
```

## See Also

### Related Applications
- [prismatic_agents](@/apps/prismatic-agents.md) -- Agent runtime hosting 400+ agents
- [prismatic_safety](@/apps/prismatic-safety.md) -- Quality Floor Guardian agent implementation
- [prismatic_dark](@/apps/prismatic-dark.md) -- Color team adversarial agents (Gray, Red, Blue, Purple, White, Black)

### Glossary
- [AIAD](@/glossary/aiad.md) -- The standard governing all agent specifications
- [Agent](@/glossary/agent.md) -- Fundamental autonomous unit in the platform
- [Agent Tier](@/glossary/agent-tier.md) -- L1-L4 classification hierarchy
- [Agent Registry](@/glossary/agent-registry.md) -- Process discovery for agents
- [GenServer](@/glossary/behaviour.md) -- OTP behaviour underlying all agents
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session evolutionary state
- [Telemetry](@/glossary/telemetry.md) -- Event infrastructure for agent observability

### Architecture
- [Supervision Trees](@/architecture/supervision-trees.md) -- How agents are supervised for fault tolerance
- [Telemetry](@/architecture/telemetry.md) -- Event naming conventions and handler patterns
- [PubSub](@/architecture/pubsub.md) -- Broadcast communication between agents

### Related Academy Topics
- [Multi-Agent Orchestration](@/academy/agent-orchestration.md) -- Coordinating multiple agents into teams
- [The AIAD Standard](@/academy/aiad-standard.md) -- Formal specification format for agents
- [OTP Design Patterns](@/academy/otp-fundamentals.md) -- GenServer and Supervisor patterns
- [Self-Evolving Agent Ecosystems](@/academy/evolution-patterns.md) -- Darwinian evolution of agents

## Next Steps

- [Multi-Agent Orchestration Patterns](@/academy/agent-orchestration.md) -- coordinate multiple agents
- [The AIAD Standard Explained](@/academy/aiad-standard.md) -- deep dive into specification formats
- [OTP Design Patterns for Prismatic](@/academy/otp-fundamentals.md) -- master supervision strategies
- [Self-Evolving Agent Ecosystems](@/academy/evolution-patterns.md) -- understand how agents evolve over time

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)