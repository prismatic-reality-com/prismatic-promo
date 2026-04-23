+++
title = "mcp-coordination-specialist"
weight = 249
[extra]
domain = "primary-producer"
level = "L2"
description = "Specialized coordinator for MCP server management and multi-server coordination"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mcp-coordination-specialist", "Specialized", "agents", "agent", "Prismatic Platform", "Phase", "Server"]
tags = ["agents", "agent", "mcp-coordination-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "mcp-coordination-specialist - Prismatic Platform"
+++

## Overview

The mcp-coordination-specialist agent operates as an L2 Tactical Operations authority within the Prismatic Platform's primary-producer domain, serving as the specialized coordinator for Model Context Protocol (MCP) server management and multi-server coordination. The MCP ecosystem within the Prismatic Platform comprises 14+ servers providing diverse tooling capabilities -- from filesystem access and database queries to GitHub integration and memory management. This agent ensures that MCP servers operate reliably, respond within acceptable latency bounds, and coordinate effectively when multiple servers must contribute to complex operations.

Built on the [AIAD](/glossary/aiad/) standard and operating within the [mycelial network](/glossary/mycelial-network/), the mcp-coordination-specialist applies the [NO MERCY, NO DOUBTS](/glossary/no-mercy/) doctrine to MCP operations management. Server availability is non-negotiable -- degraded MCP services directly impair the platform's agent capabilities. The agent monitors server health, manages server lifecycle operations (start, stop, restart, configure), orchestrates multi-server tool invocations, and provides failover coordination when primary servers become unavailable.

The MCP coordination challenge is particularly important in the Prismatic Platform because the 434-agent ecosystem depends on MCP server tools for external interactions. A single MCP server failure can cascade through agent dependencies, degrading capabilities across multiple operational domains. The coordination specialist prevents these cascading failures through proactive health monitoring, automatic failover, and coordinated recovery procedures.

## Architecture

The mcp-coordination-specialist implements a hub-and-spoke management architecture with the coordinator as the central hub managing the lifecycle of all MCP server spokes.

```
MCP Server Fleet                Coordinator Hub                 Operations Interface
+------------------+          +--------------------+           +------------------+
| prismatic-mcp    |---+      | Health Monitor     |           | Server Status    |
| (P1, 27 tools)   |   |      | (Continuous)       |---+       | Dashboard        |
+------------------+   |  +-->+--------------------+   |   +-->+------------------+
| context7         |---+->|   | Lifecycle Manager  |   |   |   | Tool Router      |
+------------------+   |  |   | (Start/Stop/Reset) |---+---+   | (Multi-Server)   |
| filesystem       |---+  +-->+--------------------+   |   |   +------------------+
+------------------+   |      | Failover Engine    |   |   |   | Configuration    |
| github           |---+      | (Auto-Recovery)    |---+   +-->| Manager          |
+------------------+   |      +--------------------+   |       +------------------+
| postgres         |---+      | Tool Dispatcher    |   |
+------------------+          | (Multi-Server Ops) |---+
| memory           |---+      +--------------------+
+------------------+
```

The coordinator maintains a real-time health map of all MCP servers, with each server reporting health metrics through periodic heartbeats. The failover engine automatically detects server failures and initiates recovery procedures. The tool dispatcher routes tool invocations to the appropriate server, handling multi-server operations that require coordinated tool calls across different servers.

## Core Capabilities

The mcp-coordination-specialist provides comprehensive MCP ecosystem management through several specialized capability domains.

**Server Health Monitoring** continuously monitors all MCP servers through heartbeat checks, response latency measurements, error rate tracking, and resource utilization monitoring. Health status is maintained in an [ETS](/glossary/ets/)-backed registry that provides sub-millisecond lookup for routing decisions. Degraded servers trigger automatic investigation; unresponsive servers trigger failover procedures.

**Lifecycle Management** controls the complete lifecycle of MCP servers including startup sequencing (respecting inter-server dependencies), graceful shutdown (draining active requests before termination), restart with configuration updates, and hot reconfiguration (applying configuration changes without restart where supported).

**Failover Coordination** implements automatic failover for critical MCP servers. When a primary server becomes unresponsive, the failover engine activates backup servers or reroutes requests to alternative servers that provide equivalent capabilities. Failover decisions are made based on configurable policies that balance availability, latency, and capability coverage.

**Multi-Server Tool Dispatch** coordinates operations that require tools from multiple MCP servers. The dispatcher manages request routing, response aggregation, and error handling for cross-server operations. Transactional semantics are provided where possible, with compensating actions for partial failures.

**Configuration Management** maintains and distributes MCP server configurations, ensuring consistency across the server fleet. Configuration changes are validated before application, with rollback capability for failed configuration updates.

**Capacity Planning** tracks resource utilization trends across the MCP server fleet, identifying servers approaching capacity limits and recommending scaling actions before service degradation occurs.

## Implementation

```elixir
defmodule Prismatic.MCP.CoordinationSpecialist do
  @moduledoc """
  L2 Tactical Operations agent for MCP server coordination.
  Manages lifecycle, health, and multi-server coordination for 14+ MCP servers.
  """

  use GenServer
  require Logger

  alias Prismatic.MCP.{HealthMonitor, LifecycleManager, FailoverEngine, ToolDispatcher}

  @health_check_interval_ms 30_000
  @failover_threshold_ms 5_000

  defstruct [:server_registry, :health_map, :failover_state, :config_cache]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec server_status() :: {:ok, map()}
  def server_status do
    GenServer.call(__MODULE__, :status, 5_000)
  end

  @spec dispatch_tool(String.t(), String.t(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch_tool(server, tool, params) do
    GenServer.call(__MODULE__, {:dispatch, server, tool, params}, 30_000)
  end

  @impl true
  def handle_call(:status, _from, state) do
    status = %{
      servers: Map.keys(state.server_registry),
      healthy: HealthMonitor.healthy_count(state.health_map),
      degraded: HealthMonitor.degraded_count(state.health_map),
      total_tools: count_total_tools(state.server_registry),
      last_health_check: state.health_map.last_check
    }
    {:reply, {:ok, status}, state}
  end

  @impl true
  def handle_call({:dispatch, server, tool, params}, _from, state) do
    :telemetry.execute(
      [:prismatic, :mcp, :dispatch],
      %{timestamp: System.monotonic_time()},
      %{server: server, tool: tool}
    )

    case HealthMonitor.check(state.health_map, server) do
      :healthy ->
        result = ToolDispatcher.invoke(server, tool, params)
        {:reply, result, state}
      :degraded ->
        case FailoverEngine.find_alternative(server, tool, state) do
          {:ok, alt_server} -> {:reply, ToolDispatcher.invoke(alt_server, tool, params), state}
          :none -> {:reply, {:error, :server_degraded}, state}
        end
    end
  end

  @impl true
  def handle_info(:health_check, state) do
    new_health = HealthMonitor.check_all(state.server_registry)
    Process.send_after(self(), :health_check, @health_check_interval_ms)
    {:noreply, %{state | health_map: new_health}}
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [mcp-service-controller](/agents/mcp-service-controller/) | Infrastructure-level service control and deployment | Bidirectional |
| [Prismatic Agents](/glossary/prismatic-agents/) | All agents consume MCP tools through this coordinator | Service |
| Prismatic Telemetry | Server health [metrics](/glossary/metrics/) and dispatch latency tracking | Outbound |
| AIAD [Registry](/glossary/registry-otp/) | Agent and server specification discovery | Infrastructure |
| [SEADF](/glossary/seadf/) | Self-healing triggers for MCP server failures | Bidirectional |

## Operational Workflow

**Phase 1 -- Server Discovery**: On startup, discover all configured MCP servers and initialize health monitoring for each.

**Phase 2 -- Health Monitoring**: Continuous health checks at configurable intervals. Track latency trends, error rates, and resource utilization.

**Phase 3 -- Tool Routing**: Route incoming tool requests to appropriate servers. Apply failover logic for degraded servers.

**Phase 4 -- Lifecycle Operations**: Execute server lifecycle operations (start, stop, restart) as needed, respecting dependency ordering and draining active requests.

**Phase 5 -- Failure Recovery**: Detect server failures through health monitoring. Initiate automatic failover and recovery procedures. Notify dependent agents of capability changes.

## NABLA Compliance

| Axiom | MCP Coordination Application |
|-------|------------------------------|
| Signal Plurality | Server health requires multiple health check methods (heartbeat + latency + errors) |
| Contradiction Preservation | Conflicting health signals are investigated rather than averaged |
| Absence Informative | Missing heartbeats are treated as failure indicators |
| Time Decay | Health assessments expire; stale checks trigger immediate re-evaluation |
| Unknown Valid | Unknown server states trigger investigation before routing decisions |
| Source Independence | Independent health check methods provide non-correlated signals |
| Provenance Mandatory | Every failover decision carries full health check evidence |

## Configuration

```elixir
config :prismatic_mcp, Prismatic.MCP.CoordinationSpecialist,
  health_check_interval_ms: 30_000,
  failover_threshold_ms: 5_000,
  max_dispatch_timeout_ms: 30_000,
  server_configs: %{
    "prismatic-mcp" => %{priority: 1, tools: 27},
    "context7" => %{priority: 2},
    "filesystem" => %{priority: 2},
    "github" => %{priority: 2},
    "postgres" => %{priority: 2},
    "memory" => %{priority: 2}
  },
  telemetry_prefix: [:prismatic, :mcp]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Health check cycle | < 5s | 1.8s (P95) |
| Tool dispatch latency | < 100ms | 35ms (P95) |
| Failover detection | < 10s | 5.2s (P95) |
| Failover execution | < 5s | 2.1s (P95) |
| Concurrent dispatches | 50+ | 80 tested |
| Server fleet capacity | 20+ | 14 active |

## Related Resources

- [mcp-service-controller](/agents/mcp-service-controller/) -- Infrastructure-level MCP management
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [Mycelial Network](/glossary/mycelial-network/) -- Inter-agent communication infrastructure
- [OTP](/glossary/otp/) -- Supervision hierarchy for server processes
- [SEADF](/glossary/seadf/) -- Self-healing for server recovery
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for health monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)