+++
title = "mcp-service-controller"
weight = 251
[extra]
domain = "infrastructure"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
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
keywords = ["mcp-service-controller", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Server", "Restart", "GitHub"]
tags = ["agents", "agent", "mcp-service-controller", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "mcp-service-controller - Prismatic Platform"
+++

## Overview

The MCP Service Controller operates as an L3 strategic command agent within the Infrastructure domain of the Prismatic Platform. This agent manages the lifecycle, health monitoring, and configuration of Model Context Protocol (MCP) servers that provide tool integration capabilities for AI-assisted development operations. With 14+ MCP servers delivering over 70 tools across different integration domains, the controller ensures reliable service availability, handles failure recovery, and coordinates server updates without disrupting active sessions.

The Model Context Protocol enables standardized communication between AI assistants and external tools. Each MCP server exposes a set of typed tools that AI agents can invoke for specific operations -- file system access, database queries, GitHub operations, search indexing, and native Prismatic platform tools. The MCP Service Controller manages this server fleet as a unified service layer, abstracting the complexity of multi-server coordination from consuming agents.

## Operational Domain

The Infrastructure domain handles all operational concerns for the Prismatic Platform. The MCP Service Controller specifically manages the MCP server infrastructure, ensuring that tool-providing servers are available, healthy, and properly configured for the platform's AI integration requirements.

## Server Fleet Management

The controller manages a fleet of MCP servers organized by priority tier.

| Server | Priority | Tools | Function | Process Type |
|---|---|---|---|---|
| prismatic-mcp | P1 | 27 | Native Prismatic platform operations | Long-running |
| context7 | P2 | 5 | Context management and session state | Long-running |
| filesystem | P2 | 8 | File system operations | On-demand |
| github | P2 | 15 | GitHub repository operations | Long-running |
| postgres | P2 | 6 | Database operations | Long-running |
| memory | P3 | 4 | Persistent knowledge storage | Long-running |
| [meilisearch](/glossary/meilisearch/) | P3 | 5 | Full-text search operations | Long-running |

```elixir
defmodule PrismaticAgents.MCPServiceController do
  @moduledoc """
  MCP server fleet lifecycle management and health monitoring.
  Coordinates server startup, health checks, and failure recovery.
  """

  use GenServer

  @health_check_interval_ms :timer.seconds(30)
  @restart_backoff_ms :timer.seconds(5)
  @max_restart_attempts 3

  @type server_state :: %{
    name: String.t(),
    priority: :p1 | :p2 | :p3,
    status: :starting | :healthy | :degraded | :failed | :stopped,
    pid: pid() | nil,
    tool_count: non_neg_integer(),
    last_health_check: DateTime.t() | nil,
    restart_count: non_neg_integer(),
    error_log: [error_entry()]
  }

  @spec start_server(String.t()) :: {:ok, pid()} | {:error, term()}
  def start_server(server_name) do
    GenServer.call(__MODULE__, {:start, server_name}, :timer.minutes(1))
  end

  @spec stop_server(String.t()) :: :ok | {:error, term()}
  def stop_server(server_name) do
    GenServer.call(__MODULE__, {:stop, server_name})
  end

  @spec fleet_status() :: {:ok, [server_state()]}
  def fleet_status do
    GenServer.call(__MODULE__, :fleet_status)
  end

  @impl true
  def handle_call({:start, name}, _from, state) do
    with {:ok, config} <- load_server_config(name),
         {:ok, pid} <- launch_server(config),
         {:ok, :healthy} <- wait_for_health(pid, config) do
      server_state = %{name: name, status: :healthy, pid: pid, priority: config.priority}
      {:reply, {:ok, pid}, register_server(state, server_state)}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, log_failure(state, name, reason)}
    end
  end

  @impl true
  def handle_info(:health_check, state) do
    updated_servers = Enum.map(state.servers, fn {name, server} ->
      {name, perform_health_check(server)}
    end) |> Map.new()

    failed = Enum.filter(updated_servers, fn {_name, s} -> s.status == :failed end)
    Enum.each(failed, fn {name, _} -> attempt_restart(name) end)

    schedule_health_check()
    {:noreply, %{state | servers: updated_servers}}
  end
end
```

## Health Monitoring

The controller performs continuous health checks on all MCP servers with tier-appropriate urgency.

| Priority | Check Interval | Response Time Threshold | Failure Action |
|---|---|---|---|
| P1 | Every 15 seconds | < 500ms | Immediate restart |
| P2 | Every 30 seconds | < 1s | Restart with backoff |
| P3 | Every 60 seconds | < 2s | Restart with extended backoff |

### Health Check Protocol

```elixir
defmodule PrismaticAgents.MCPServiceController.HealthCheck do
  @spec check(server_state()) :: {:ok, :healthy} | {:error, :degraded | :failed}
  def check(server) do
    start = System.monotonic_time(:millisecond)

    case send_health_probe(server.pid) do
      {:ok, :pong} ->
        latency = System.monotonic_time(:millisecond) - start
        if latency > threshold_for_priority(server.priority) do
          {:error, :degraded}
        else
          {:ok, :healthy}
        end

      {:error, :timeout} -> {:error, :failed}
      {:error, _reason} -> {:error, :failed}
    end
  end
end
```

## Failure Recovery

The controller implements a progressive failure recovery strategy with exponential backoff.

| Recovery Stage | Attempt | Backoff | Action |
|---|---|---|---|
| Quick Restart | 1st failure | 5 seconds | Restart server process |
| Delayed Restart | 2nd failure | 30 seconds | Restart with config reload |
| Full Reset | 3rd failure | 2 minutes | Full teardown and rebuild |
| Escalation | 4th+ failure | Manual | Alert + degraded mode |

## Tool Discovery and Registration

The controller maintains a registry of all tools provided by MCP servers, enabling consuming agents to discover available capabilities.

| Discovery Method | Description | Update Trigger |
|---|---|---|
| Startup scan | Query all servers for tool lists at startup | Server start |
| Health check piggyback | Verify tool availability during health checks | Each health check |
| Hot reload | Detect new tools after server updates | Configuration change |
| Manual refresh | Force tool registry refresh on demand | Operator command |

## Key Capabilities

- **Server fleet lifecycle management** handling startup, shutdown, configuration, and updates for all MCP servers with priority-aware scheduling
- **Continuous health monitoring** performing tier-appropriate health checks with configurable thresholds and automatic degradation detection
- **Progressive failure recovery** implementing exponential backoff restart strategies with escalation to manual intervention after repeated failures
- **Tool registry maintenance** maintaining a discoverable registry of all available MCP tools across the server fleet for consuming agent reference
- **Configuration management** coordinating MCP server configuration including connection parameters, authentication, and tool-specific settings
- **Priority-based resource allocation** ensuring P1 servers receive preferential startup ordering, monitoring frequency, and recovery urgency

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination with authority to manage all MCP server operations, restart failed servers, and modify server configurations within established policy bounds.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [mcp-coordination-specialist](/agents/mcp-coordination-specialist/) | MCP Operations | Assists with MCP-specific protocol handling and tool invocation |
| [infrastructure-as-code-specialist](/agents/infrastructure-as-code-specialist/) | IaC Partner | Manages infrastructure definitions for MCP server deployments |
| [health-monitoring-specialist](/agents/health-monitoring-specialist/) | Health Integration | Correlates MCP server health with platform-wide health metrics |
| [alert-management-specialist](/agents/alert-management-specialist/) | Alerting | Routes MCP server failure alerts to appropriate channels |

## Integration

| Component | Relationship |
|---|---|
| [OTP](/glossary/otp/) [Supervision Tree](/glossary/supervision-tree/) | MCP servers managed under platform supervision hierarchy |
| [Circuit Breaker](/glossary/circuit-breaker/) | Per-server circuit breakers for failure isolation |
| [ETS](/glossary/ets/) | Tool registry and server state caching |
| Platform [Telemetry](/glossary/telemetry/) | Server health metrics and tool invocation tracking |

## Enforcement

The MCP Service Controller operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. P1 servers must maintain 99.9% uptime. Health check failures trigger immediate recovery action with no manual delay. Server configurations are version-controlled and reproducible. All server lifecycle events are recorded in the [audit trail](/glossary/audit-trail/) including startup parameters, health check results, failure details, and recovery actions. No MCP server modification proceeds without configuration review.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)