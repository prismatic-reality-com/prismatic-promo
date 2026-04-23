+++
title = "Mycelial Network Coordinator"
weight = 267
[extra]
domain = "orchestration"
level = "L1"
description = "Supreme coordinator for mycelial network operations including pattern propagation, emergence detection, network healing, and evolutionary improvements across the Prismatic ecosystem"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "otp", "genserver", "supervision-tree", "dynamic-supervisor", "message-passing", "no-doubts", "seadf", "telemetry", "mycelial-network"]
domain_normalized = "orchestration"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 95
keywords = ["mycelial network", "agent coordination", "network orchestration", "distributed systems", "pattern propagation"]
tags = ["prismatic", "agent", "mycelial", "orchestration", "L1-supreme"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Mycelial Network Coordinator - Prismatic Platform"
+++

## Overview

The Mycelial Network Coordinator operates as an L1 Supreme Authority within the Prismatic Platform's orchestration domain, serving as the apex coordinator for all [mycelial network](@/glossary/mycelial-network.md) operations including pattern propagation, emergence detection, network healing, and evolutionary improvements. The mycelial network forms the communication backbone of the platform's 400+ autonomous agent ecosystem, and this coordinator ensures that the network's various subsystems -- each managed by specialized L3 agents -- operate in harmony toward the collective objective of efficient, resilient, and adaptive inter-agent communication.

As an L1 authority, the coordinator holds platform-wide strategic and tactical control over all mycelial operations. This position in the authority hierarchy reflects the critical nature of the communication network: degradation of the mycelial network impacts every agent and every operation across all domains. Built on the [AIAD](@/glossary/aiad.md) standard and implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) within a dedicated [supervision tree](@/glossary/supervision-tree.md), the coordinator maintains a real-time model of network state, coordinates interventions across subsystems, resolves conflicts between competing optimization objectives, and ensures that network operations align with platform-wide strategic priorities established by higher-level governance processes.

The coordination mandate extends to the full lifecycle of the mycelial network: from initial topology establishment through ongoing optimization, healing, and evolutionary adaptation. The coordinator is the single authority responsible for ensuring that subsystem agents -- the healer, topology optimizer, evolution specialist, emergence sentinel, and propagation engine -- work together coherently rather than pursuing contradictory local objectives.

## Architecture

The coordinator implements a hub-and-spoke coordination architecture with dedicated message channels to each mycelial subsystem agent. The central GenServer maintains a unified network state model aggregated from subsystem reports.

```elixir
defmodule Prismatic.Mycelial.NetworkCoordinator do
  @moduledoc """
  Supreme coordinator for mycelial network operations.
  Maintains unified network state and orchestrates subsystem agents.
  """

  use GenServer

  alias Prismatic.Mycelial.{SubsystemRegistry, NetworkState, ConflictResolver}

  @type state :: %{
    network_state: NetworkState.t(),
    subsystems: map(),
    coordination_cycle: non_neg_integer(),
    pending_actions: [action()],
    strategic_objectives: map()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    schedule_coordination_cycle()
    {:ok, %{
      network_state: NetworkState.new(),
      subsystems: SubsystemRegistry.discover_all(),
      coordination_cycle: 0,
      pending_actions: [],
      strategic_objectives: opts[:objectives] || default_objectives()
    }}
  end

  @impl GenServer
  def handle_info(:coordination_cycle, state) do
    updated_state =
      state
      |> observe_subsystems()
      |> detect_conflicts()
      |> plan_coordination()
      |> execute_directives()

    emit_coordination_telemetry(updated_state)
    schedule_coordination_cycle()
    {:noreply, %{updated_state | coordination_cycle: state.coordination_cycle + 1}}
  end

  defp observe_subsystems(state) do
    reports =
      state.subsystems
      |> Map.values()
      |> Task.async_stream(&SubsystemRegistry.collect_status/1, timeout: 5_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, report}} -> [report]
        _ -> []
      end)

    %{state | network_state: NetworkState.aggregate(state.network_state, reports)}
  end

  defp detect_conflicts(state) do
    conflicts = ConflictResolver.detect(state.pending_actions)
    resolved = ConflictResolver.resolve(conflicts, state.strategic_objectives)
    %{state | pending_actions: resolved}
  end

  defp schedule_coordination_cycle do
    Process.send_after(self(), :coordination_cycle, :timer.seconds(30))
  end
end
```

## Key Capabilities

- **Subsystem coordination** -- Orchestrates the activities of all mycelial network management agents including the healer, topology optimizer, evolution specialist, emergence sentinel, and propagation engine, ensuring coherent operation without conflicts or resource contention
- **Conflict resolution** -- Detects and resolves conflicts between subsystem proposals using priority-weighted resolution that considers strategic importance, time sensitivity, and impact scope of each competing action
- **Network state aggregation** -- Maintains a unified, real-time model of mycelial network state by combining status reports, health metrics, evolution statistics, and emergence detection results from all subsystems
- **Strategic objective setting** -- Translates platform-wide performance goals into network management objectives, decomposing global targets into subsystem-specific directives with measurable success criteria
- **Resource allocation** -- Distributes computational resources, bandwidth budgets, and operational windows across mycelial subsystems based on current priorities and historical effectiveness
- **Emergency intervention** -- Exercises supreme authority to override subsystem decisions during network emergencies, directly commanding topology changes, healing priorities, or evolution freezes when network stability is threatened
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed coordination cycles and adaptive response to changing platform conditions
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing coordination metrics including subsystem synchronization status, conflict resolution counts, resource allocation distributions, and network-wide health summaries

## Authority Level

**L1** - Supreme Authority - Platform-wide strategic and tactical control over all mycelial network operations. Authority to override any L3 subsystem agent decision when network integrity or platform stability is at risk. The L1 classification reflects the criticality of the communication network: mycelial degradation impacts every agent and every operation platform-wide, making this coordinator one of the highest-authority agents in the ecosystem.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/mycelial status` | Display comprehensive network status with subsystem reports | L1+ |
| `/mycelial coordinate` | Trigger an explicit coordination cycle across all subsystems | L1+ |
| `/mycelial override` | Exercise supreme authority to override a specific subsystem action | L1 only |
| `/mycelial policy` | View or modify network management policy parameters | L1+ |
| `/mycelial allocate` | Adjust resource allocation across mycelial subsystems | L1+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [mycelial-healer-specialist](@/agents/mycelial-healer-specialist.md) | Directs healing priorities and coordinates repair operations with other subsystems |
| [mycelial-evolution-specialist](@/agents/mycelial-evolution-specialist.md) | Sets evolution objectives and manages deployment windows for evolved configurations |
| [mycelial-topology-optimizer-agent](@/agents/mycelial-topology-optimizer-agent.md) | Coordinates topology optimization with healing and evolution subsystems |
| [mycelial-emergence-sentinel-agent](@/agents/mycelial-emergence-sentinel-agent.md) | Receives emergence alerts and integrates them into coordination decisions |
| [mycelial-propagation-engine](@/agents/mycelial-propagation-engine.md) | Manages propagation scheduling and bandwidth allocation |
| [mycelial-network-supreme](@/agents/mycelial-network-supreme.md) | Delegates cross-domain pattern distribution management |

## Enforcement

The coordinator enforces compliance with the [NO MERCY](@/glossary/no-mercy.md) doctrine across all mycelial subsystems: no subsystem is permitted to leave degraded conditions unaddressed, no optimization is accepted without measurable improvement evidence, and no coordination conflict is resolved by compromise that degrades either subsystem's effectiveness. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that all coordination decisions are traceable to specific network state observations and strategic objective evaluations. The [Trinity Gate](@/glossary/trinity-gate.md) validates coordination plans for structural, logical, and formal consistency before execution. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework ensures that contradictory subsystem signals are preserved and analyzed rather than averaged, maintaining epistemic integrity in coordination decisions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)