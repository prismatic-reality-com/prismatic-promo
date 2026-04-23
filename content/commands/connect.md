+++
title = "/connect"
weight = 880
[extra]
category = "Operations"
description = "MCP server connection management across 14+ servers"
syntax = "/connect [options]"
authority = "L2+"
agent = "mcp-server-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 821
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["connect", "server", "connection", "management", "across", "servers", "commands", "Operations", "Prismatic Platform", "Model Context"]
tags = ["commands", "operations", "connect", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/connect - Prismatic Platform"
+++

## Overview

The **/connect** command provides comprehensive management of Model Context Protocol (MCP) server connections across the Prismatic Platform's distributed infrastructure. With over 14 MCP servers forming the backbone of multi-instance coordination, this command serves as the primary interface for establishing, monitoring, and managing the communication fabric that enables parallel development operations, shared state management, and real-time synchronization between Claude Code instances.

MCP (Model Context Protocol) enables structured communication between autonomous agents and external tools. Within the Prismatic Platform, MCP servers expose specialized capabilities -- from filesystem operations and database queries to GitHub integration and memory persistence. The `/connect` command abstracts the complexity of managing these server lifecycles, providing operators with a unified control plane for the entire coordination network.

The command operates under the **L2+** authority level and is executed by the `mcp-server-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Connection management is foundational to all multi-agent workflows, making this command a critical operational dependency for orchestration, parallel execution, and distributed intelligence gathering.

Beyond simple connectivity, `/connect` implements role-based coordination with three distinct operational modes: coordinator (central authority for task distribution), worker (execution node receiving and processing tasks), and observer (read-only monitoring of coordination state). This architecture mirrors OTP supervision patterns, ensuring fault-tolerant coordination even when individual instances fail or become temporarily unreachable.

## Architecture

The connection management system follows a hub-and-spoke architecture with a shared blackboard for state coordination.

```
MCP COORDINATION NETWORK
========================

Coordinator Instance (Hub)
    |
    +-- Blackboard (Shared State via ETS/Horde)
    |   |
    |   +-- Active Tasks Registry
    |   +-- Instance Registry (heartbeat-based)
    |   +-- Sync State (vector clocks)
    |   +-- Message Queue (ordered delivery)
    |
    +-- Worker Instance 1 (Spoke)
    |   +-- Local State Cache
    |   +-- Task Queue (priority-ordered)
    |   +-- Health Reporter
    |
    +-- Worker Instance 2 (Spoke)
    |   +-- Local State Cache
    |   +-- Task Queue (priority-ordered)
    |   +-- Health Reporter
    |
    +-- Observer Instance (Read-Only)
        +-- State Mirror (eventual consistency)
        +-- Metrics Collector
```

### Server Categories

| Category | Servers | Purpose |
|----------|---------|---------|
| **Core Platform** | prismatic-mcp (27 tools) | Platform-native operations |
| **Filesystem** | filesystem-server | File read/write/search |
| **Version Control** | github-server | Repository operations |
| **Database** | postgres-server | Database queries and management |
| **Search** | [meilisearch](@/glossary/meilisearch.md)-server | Full-text search operations |
| **Memory** | memory-server | Persistent knowledge storage |
| **Context** | context7-server | Documentation context retrieval |
| **Monitoring** | telemetry-server | Metrics and event tracking |

## Usage

### Basic Operations

```bash
# Check coordination status across all servers
/connect status

# List all active instances with health information
/connect list

# Join coordination network as a worker
/connect join --role worker

# Join as the coordinator (only one per network)
/connect join --role coordinator

# Join as read-only observer
/connect join --role observer

# Broadcast a message to all connected instances
/connect broadcast "Starting integration phase"

# Synchronize state with all instances
/connect sync
```

### Advanced Operations

```bash
# Leave coordination network gracefully
/connect leave

# Force reconnection to specific server
/connect reconnect prismatic-mcp

# Check health of specific server
/connect health postgres-server

# Restart all MCP server connections
/connect restart-all

# Show detailed connection metrics
/connect status --verbose
```

## Options & Parameters

| Parameter | Position/Flag | Required | Type | Default | Description |
|-----------|---------------|----------|------|---------|-------------|
| **action** | $1 | No | string | `status` | Connection action: status, list, join, leave, broadcast, sync |
| **instance_id** | $2 | No | string | -- | Target instance ID for directed operations |
| **--role** | flag | No | enum | `worker` | Role in coordination: coordinator, worker, observer |
| **--timeout** | flag | No | integer | 5000 | Connection timeout in milliseconds |
| **--retry** | flag | No | integer | 3 | Number of connection retry attempts |
| **--verbose** | flag | No | boolean | false | Show detailed connection diagnostics |

## Execution Flow

```
/connect [action] [options]
    |
    v
PHASE 1: VALIDATION (< 100ms)
    +-- Verify action parameter
    +-- Check authority level (L2+)
    +-- Validate instance_id if provided
    +-- Load server configuration
    |
    v
PHASE 2: DISCOVERY (< 500ms)
    +-- Enumerate configured MCP servers
    +-- Probe server availability (parallel health checks)
    +-- Build connection topology map
    +-- Identify coordinator instance
    |
    v
PHASE 3: EXECUTION (< 2s)
    +-- Execute requested action
    +-- Update blackboard state
    +-- Propagate state changes to peers
    +-- Confirm action completion
    |
    v
PHASE 4: REPORTING
    +-- Display action result
    +-- Show updated connection status
    +-- Log telemetry events
    +-- Update instance registry
```

### Status Output Example

```
MULTI-INSTANCE COORDINATION STATUS
==================================

This Instance:
  ID: claude-instance-a7b3
  Role: worker
  Status: connected
  Uptime: 2h 14m

Connected Instances: 3
  - claude-instance-f2c1 (coordinator) [active]
  - claude-instance-a7b3 (worker) [active] <- YOU
  - claude-instance-e9d4 (worker) [active]

MCP Servers: 14/14 healthy
  - prismatic-mcp .......... [OK] 27 tools
  - filesystem ............. [OK] 8 tools
  - github ................. [OK] 12 tools
  - postgres ............... [OK] 6 tools
  - memory ................. [OK] 4 tools
  - context7 ............... [OK] 3 tools

Blackboard:
  Active Tasks: 5
  Pending Sync: 0
  Last Sync: 2 seconds ago

Health: EXCELLENT
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `mcp-server-coordinator` agent | Agent manages server lifecycle and health monitoring |
| [AIAD](@/glossary/aiad.md) Registry | Command specification and discovery | Registered as coordination-category command |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation | Connection health is a quality gate prerequisite |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Connection events emitted as telemetry spans |
| Prismatic Supervisor | Process supervision | MCP server processes supervised via OTP |
| Blackboard System | Shared state coordination | ETS-backed shared state for multi-instance workflows |

### MCP Server Setup

The platform provides an automated setup script for all MCP servers:

```bash
# Initialize all MCP servers
./scripts/setup-mcp-servers.sh

# Verify server configuration
/connect status --verbose
```

Configuration is managed through `.claude/mcp-servers.json` with environment-specific overrides.

## Best Practices

1. **Always check status before operations** -- Run `/connect status` at session start to verify all servers are healthy before beginning multi-agent workflows.

2. **Use coordinator role sparingly** -- Only one instance should serve as coordinator. Multiple coordinators create split-brain scenarios.

3. **Prefer observer for monitoring** -- When you only need to watch coordination state, join as observer to avoid consuming worker slots.

4. **Broadcast before major operations** -- Notify all instances before starting operations that may affect shared state, such as database migrations or deployment activities.

5. **Handle disconnections gracefully** -- The system implements automatic reconnection with exponential backoff. Do not force-restart servers unless automatic recovery has failed.

6. **Monitor sync lag** -- A `Pending Sync` count above zero for extended periods indicates network issues or an overloaded coordinator.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `CONNECTION_REFUSED` | MCP server not running | Start server via `./scripts/setup-mcp-servers.sh` |
| `COORDINATOR_CONFLICT` | Multiple coordinators detected | Leave one coordinator, demote to worker |
| `SYNC_TIMEOUT` | State sync exceeded timeout | Increase `--timeout` or check network connectivity |
| `BLACKBOARD_FULL` | Shared state exceeded capacity | Run `/connect sync` to flush pending state |
| `AUTH_FAILURE` | Invalid credentials for server | Verify API keys in environment configuration |
| `INSTANCE_NOT_FOUND` | Target instance ID unknown | Run `/connect list` to find valid instance IDs |

### Recovery Procedures

```bash
# If a server becomes unresponsive
/connect reconnect <server-name>

# If coordination state is corrupted
/connect sync --force

# If all servers need restart
/connect restart-all --staggered
```

## Advanced Usage

### Multi-Instance Development Workflow

```bash
# Terminal 1: Launch as coordinator
./scripts/dev/launch-multi-claude.sh
/connect join --role coordinator

# Terminal 2: Launch as worker
/connect join --role worker

# Terminal 3: Launch as observer for monitoring
/connect join --role observer

# Coordinator distributes tasks
/connect broadcast "Phase 1: Parallel test execution"
```

### Programmatic Connection Management

```elixir
# Check connection status programmatically
{:ok, status} = PrismaticClaude.MCP.connection_status()

# Register a new MCP server at runtime
:ok = PrismaticClaude.MCP.register_server(%{
  name: "custom-server",
  url: "http://localhost:8080",
  tools: ["custom_tool_1", "custom_tool_2"]
})

# Monitor connection health via telemetry
:telemetry.attach("mcp-monitor",
  [:prismatic_claude, :mcp, :connection],
  &handle_connection_event/4,
  nil
)
```

### Custom Server Configuration

```json
{
  "prismatic-mcp": {
    "command": "node",
    "args": ["dist/index.js"],
    "env": {
      "PRISMATIC_API_KEY": "${PRISMATIC_API_KEY}"
    },
    "priority": 1,
    "health_check_interval": 30000,
    "restart_policy": "always"
  }
}
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for unhealthy server connections. All 14+ servers must report healthy status before multi-agent operations proceed. No degraded-mode operation is acceptable for production workflows.
- **NO DOUBTS**: Full server health verification before reporting status. Connection state is validated through active probing, not cached state. Evidence-based health reporting with measurable metrics.

The command enforces NABLA signal plurality by requiring health confirmation from multiple independent probes before declaring a server operational.

## Related Commands

- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/livebook](@/commands/livebook.md) - Livebook integration for interactive [Elixir](@/glossary/elixir.md) notebooks
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/deploy-unified](@/commands/deploy-unified.md) - Safe validated traceable deployment for all environments
- [/orchestrate](@/commands/orchestrate.md) - Multi-agent orchestration with 10x efficiency
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)