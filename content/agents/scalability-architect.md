+++
title = "scalability-architect"
weight = 359
[extra]
domain = "architecture"
level = "L3"
description = "Horizontal and vertical scaling strategies, load balancing, and capacity planning"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 139
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["scalability-architect", "Horizontal", "agents", "agent", "Prismatic Platform", "Scalability Architect", "Automatic", "BEAM", "Multi"]
tags = ["agents", "agent", "scalability-architect", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "scalability-architect - Prismatic Platform"
+++

## Overview

The Scalability Architect is an L3 agent operating in the **architecture** domain of the Prismatic Platform. This agent specializes in designing and enforcing horizontal and vertical scaling strategies, [load balancing](@/glossary/load-balancing.md) configurations, and capacity planning models that ensure the platform can handle increasing workloads without degradation in performance or reliability.

Built on the [BEAM](@/glossary/beam.md) virtual machine's inherent concurrency capabilities, the Scalability Architect leverages [OTP](@/glossary/otp.md) design patterns to create systems that scale naturally through process multiplication rather than requiring fundamental architectural changes. The agent continuously monitors resource utilization patterns, identifies bottlenecks before they impact users, and recommends or autonomously applies scaling adjustments within its authority boundaries.

As part of the platform's 434-strong autonomous agent ecosystem, the Scalability Architect contributes to the self-evolving infrastructure by ensuring that architectural decisions made today do not become tomorrow's scalability constraints. Every scaling recommendation passes through the [Trinity Gate](@/glossary/trinity-gate.md) verification framework before implementation, guaranteeing that improvements are evidence-based and formally validated.

## Scaling Strategy Framework

The Scalability Architect operates with a comprehensive framework that addresses scaling at multiple levels of the system architecture.

| Strategy | Type | Mechanism | Use Case |
|----------|------|-----------|----------|
| **Process Multiplication** | Horizontal | Spawn additional worker processes | CPU-bound workloads |
| **Node Distribution** | Horizontal | Distribute across BEAM nodes | Geographic scaling |
| **ETS Partitioning** | Horizontal | Shard [ETS](@/glossary/ets.md) tables across processes | Read-heavy data |
| **Connection Pooling** | Vertical | Optimize [connection pools](@/glossary/connection-pooling.md) | Database connections |
| **GenStage Backpressure** | Vertical | Apply [backpressure](@/glossary/backpressure.md) to pipelines | Stream processing |
| **Cache Tiering** | Hybrid | Multi-level caching with eviction | Latency-sensitive paths |
| **Supervision Partitioning** | Horizontal | Split [supervision trees](@/glossary/supervision-tree.md) | Fault isolation |

## Horizontal Scaling Architecture

The platform's umbrella application architecture naturally supports horizontal scaling because each application within the umbrella can be deployed independently or co-located based on resource requirements.

```elixir
defmodule PrismaticAgents.ScalabilityArchitect do
  @moduledoc """
  L3 Scalability Architect agent.
  Designs and enforces horizontal/vertical scaling strategies.
  """

  use GenServer
  require Logger

  @analysis_interval_ms :timer.minutes(5)

  defstruct [
    :cluster_topology,
    :resource_snapshot,
    :scaling_recommendations,
    :last_analysis_at,
    status: :monitoring
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_analysis()
    {:ok, %__MODULE__{cluster_topology: discover_topology()}}
  end

  @impl true
  def handle_info(:analyze, state) do
    snapshot = capture_resource_snapshot()
    recommendations = analyze_scaling_needs(snapshot, state.cluster_topology)

    :telemetry.execute(
      [:prismatic, :agents, :scalability, :analysis_complete],
      %{recommendation_count: length(recommendations)},
      %{topology: state.cluster_topology}
    )

    schedule_analysis()

    {:noreply, %{state |
      resource_snapshot: snapshot,
      scaling_recommendations: recommendations,
      last_analysis_at: DateTime.utc_now()
    }}
  end

  defp discover_topology do
    %{
      nodes: Node.list([:this, :visible]),
      schedulers: System.schedulers_online(),
      memory_mb: :erlang.memory(:total) |> div(1_048_576)
    }
  end

  defp capture_resource_snapshot do
    %{
      process_count: :erlang.system_info(:process_count),
      run_queue: :erlang.statistics(:run_queue),
      memory: :erlang.memory(),
      io: :erlang.statistics(:io),
      scheduler_utilization: :scheduler.utilization(1)
    }
  end
end
```

## Vertical Scaling Optimization

Vertical scaling within the BEAM involves optimizing resource usage within a single node. The Scalability Architect monitors several key metrics to identify vertical scaling opportunities.

### Memory Optimization Targets

| Component | Optimization | Expected Impact |
|-----------|-------------|----------------|
| **ETS tables** | Compress large tables, tune read/write concurrency | 20-40% memory reduction |
| **Process heaps** | Identify processes with oversized heaps | 15-30% memory reduction |
| **Binary references** | Detect binary reference leaks | Prevents OOM crashes |
| **Atom table** | Monitor atom creation rate | Prevents atom table exhaustion |
| **Mailbox sizes** | Alert on growing mailboxes | Prevents process starvation |

### Scheduler Utilization

The BEAM scheduler is the foundation of the platform's concurrency model. The Scalability Architect continuously monitors scheduler utilization to detect imbalances that indicate suboptimal workload distribution.

```elixir
defmodule PrismaticAgents.ScalabilityArchitect.SchedulerAnalysis do
  @moduledoc """
  Scheduler utilization analysis for vertical scaling decisions.
  """

  @spec analyze_scheduler_balance(list()) :: {:balanced | :imbalanced, map()}
  def analyze_scheduler_balance(utilization_samples) do
    avg = Enum.map(utilization_samples, & &1.utilization) |> mean()
    std_dev = Enum.map(utilization_samples, & &1.utilization) |> standard_deviation()

    status = if std_dev / max(avg, 0.01) < 0.15, do: :balanced, else: :imbalanced

    {status, %{
      average_utilization: avg,
      standard_deviation: std_dev,
      coefficient_of_variation: std_dev / max(avg, 0.01),
      recommendation: recommend_action(status, avg)
    }}
  end

  defp recommend_action(:balanced, avg) when avg > 0.85, do: :add_schedulers
  defp recommend_action(:balanced, avg) when avg < 0.20, do: :reduce_schedulers
  defp recommend_action(:imbalanced, _avg), do: :rebalance_workload
  defp recommend_action(:balanced, _avg), do: :no_action
end
```

## Capacity Planning Model

The Scalability Architect maintains a capacity planning model that projects resource requirements based on historical growth patterns and anticipated feature additions.

| Planning Horizon | Data Source | Confidence Level | Update Frequency |
|-----------------|-------------|------------------|------------------|
| **1 week** | Real-time [telemetry](@/glossary/telemetry.md) | High (>0.95) | Continuous |
| **1 month** | Aggregated metrics | Medium (>0.80) | Daily |
| **3 months** | Trend analysis | Medium (>0.70) | Weekly |
| **6 months** | Growth modeling | Low-Medium (>0.60) | Bi-weekly |
| **1 year** | Strategic projections | Low (>0.50) | Monthly |

## Load Balancing Configuration

The agent manages load balancing at multiple layers of the architecture. Each layer uses a strategy optimized for its specific traffic characteristics and reliability requirements.

| Layer | Strategy | Implementation | Failover |
|-------|----------|----------------|----------|
| **HTTP** | Round-robin with health checks | Fly.io edge routing | Automatic region failover |
| **WebSocket** | Sticky sessions for LiveView | [Phoenix](@/glossary/phoenix.md) PubSub affinity | Session migration |
| **Database** | Read replicas with write routing | [Ecto](@/glossary/ecto.md) multi-repo | Automatic promotion |
| **Background Jobs** | Work stealing across nodes | GenStage demand-driven | Re-queue on failure |
| **Agent Tasks** | Capability-based routing | [AIAD](@/glossary/aiad.md) agent registry | Agent pool failover |

## Cluster Topology Management

The Scalability Architect manages the platform's cluster topology, determining how BEAM nodes are organized, connected, and scaled across the deployment infrastructure. In production, the platform runs on Fly.io with automatic geographic distribution capabilities.

```elixir
defmodule PrismaticAgents.ScalabilityArchitect.ClusterManager do
  @moduledoc """
  Cluster topology management for multi-node BEAM deployments.
  Monitors node health and manages cluster membership.
  """

  @spec assess_cluster_health() :: {:ok, map()}
  def assess_cluster_health do
    nodes = [Node.self() | Node.list()]

    health = Enum.map(nodes, fn node ->
      {node, %{
        connected: Node.ping(node) == :pong,
        process_count: :rpc.call(node, :erlang, :system_info, [:process_count]),
        memory_mb: div(:rpc.call(node, :erlang, :memory, [:total]), 1_048_576),
        uptime_hours: div(:rpc.call(node, :erlang, :statistics, [:wall_clock]) |> elem(0), 3_600_000)
      }}
    end)

    {:ok, %{
      node_count: length(nodes),
      all_connected: Enum.all?(health, fn {_, h} -> h.connected end),
      total_processes: Enum.sum(Enum.map(health, fn {_, h} -> h.process_count end)),
      total_memory_mb: Enum.sum(Enum.map(health, fn {_, h} -> h.memory_mb end)),
      per_node: Map.new(health)
    }}
  end
end
```

| Topology Aspect | Development | Staging | Production |
|----------------|-------------|---------|------------|
| **Node Count** | 1 | 2 | 3-6 |
| **Distribution** | Local only | Single region | Multi-region |
| **Node Discovery** | Manual | DNS-based | libcluster (Fly.io) |
| **State Replication** | None | Horde (2 replicas) | Horde (3 replicas) |
| **Failover** | Supervisor restart | Automatic node restart | Automatic + geographic failover |

## Scaling Decision Framework

The Scalability Architect does not apply scaling changes arbitrarily. Every scaling decision follows a rigorous framework that requires evidence-based justification and formal verification through the [Trinity Gate](@/glossary/trinity-gate.md).

| Decision Criteria | Threshold | Action | Verification |
|------------------|-----------|--------|-------------|
| **CPU Saturation** | Scheduler utilization > 85% sustained 5 min | Add schedulers or nodes | Performance benchmark |
| **Memory Pressure** | Total memory > 80% of available | Add memory or optimize | Memory profiling report |
| **Process Count** | > 500,000 processes per node | Distribute across nodes | Process audit |
| **Mailbox Growth** | Any process mailbox > 10,000 messages | Investigate bottleneck | Targeted profiling |
| **Request Latency** | P95 > 200ms for 5 minutes | Scale horizontally | Load test verification |
| **Database Pool** | Pool utilization > 90% | Increase pool or add replica | Connection audit |

## Integration Points

The Scalability Architect integrates with the broader platform infrastructure to ensure scaling decisions are coordinated and consistent.

- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Resource utilization metrics feed scaling analysis
- [**Quality Gates**](@/capabilities/quality-gates.md) -- Performance benchmarks gate deployments
- [**Real-time Monitoring**](@/capabilities/real-time-monitoring.md) -- Live dashboards display cluster topology and resource usage
- [**Autonomous Self-Healing**](@/capabilities/autonomous-self-healing.md) -- Automatic scaling responses to resource pressure

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 15 rules defined |
| Telemetry integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [Property-based testing](@/glossary/property-based-testing.md) | 38 properties verified |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

Agents in the **architecture** domain collaborate to ensure the platform's technical foundations remain sound under growing demands.

- [**Strangler Pattern Specialist**](@/agents/strangler-pattern-specialist.md) -- Coordinates legacy system migration without scaling regression
- [**UI Flowbite Specialist**](@/agents/ui-flowbite-specialist.md) -- Ensures frontend performance scales with backend capacity
- [**Unified Orchestrator**](@/agents/unified-orchestrator.md) -- Routes tasks to appropriately scaled agent pools

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to recommend and enforce scaling policies across umbrella applications.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)