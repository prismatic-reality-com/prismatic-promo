+++
title = "/mcp"
weight = 1360
[extra]
category = "Infrastructure"
description = "Complete Model Context Protocol operations and management"
syntax = "/mcp [options]"
authority = "L2+"
agent = "mcp-evolution-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1206
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mcp", "Complete", "Model", "Context", "Protocol", "commands", "Infrastructure", "Prismatic Platform", "Subcommand", "Error"]
tags = ["commands", "infrastructure", "mcp", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mcp - Prismatic Platform"
+++

## Overview

**/mcp** is a production command in the **Infrastructure** category of the Prismatic Platform. It provides complete Model Context [Protocol](@/glossary/protocol.md) operations and management, serving as the unified control interface for all MCP-related activities across the platform. The Model Context Protocol is the standard communication layer that enables AI agents to interact with external tools, data sources, and services through a structured, capability-negotiated interface.

The Prismatic Platform's MCP infrastructure encompasses 14 or more MCP servers, collectively providing over 100 tools spanning file system operations, version control, database queries, semantic search, memory management, and platform-specific capabilities. The `/mcp` command provides a single point of control for this entire infrastructure: server management, connection monitoring, tool discovery, capability enumeration, performance analysis, and configuration management.

This command operates under the **L2+** authority level and is executed by the `mcp-evolution-coordinator` agent, the platform's primary MCP lifecycle manager. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The medium usage frequency reflects its role as both a routine operational tool (status checks, connection management) and an occasional administrative tool (configuration changes, server management).

The command's design follows the principle of progressive disclosure: simple subcommands for common operations (status, connect, disconnect) and more detailed subcommands for administrative tasks (configure, diagnose, benchmark). This layered interface ensures that routine operations remain quick and accessible while advanced functionality is available when needed.

## Architecture

The `/mcp` command acts as a facade over the platform's MCP management infrastructure, coordinating multiple subsystems through a unified command interface.

```
+---------------------+     +----------------------+     +-------------------+
|  Command Router     |---->|  Server Manager      |---->|  Connection Pool  |
|  (Subcommand Parse) |     |  (Lifecycle Ctrl)    |     |  (Channel Mgmt)   |
+---------------------+     +----------------------+     +-------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +----------------------+     +-------------------+
|  Tool Registry      |     |  Config Manager      |     |  Health Monitor   |
|  (Capability Map)   |     |  (Server Profiles)   |     |  (Liveness Check) |
+---------------------+     +----------------------+     +-------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +----------------------+     +-------------------+
|  Performance Tracker|     |  Diagnostics Engine   |     |  Telemetry Sink   |
|  (Latency/Throughput)     |  (Error Analysis)    |     |  (Event Stream)   |
+---------------------+     +----------------------+     +-------------------+
```

The **Server Manager** controls the lifecycle of individual MCP servers: startup, shutdown, restart, and health monitoring. It maintains a registry of all configured servers with their current state, connection parameters, and capability advertisements.

The **Connection Pool** manages active communication channels between the platform and MCP servers. Each channel is a supervised OTP process that handles message serialization, deserialization, timeout management, and automatic reconnection. Channels support both stdio-based and TCP-based transport depending on the server configuration.

The **Tool Registry** maintains a unified index of all tools exposed by all connected MCP servers. Each tool entry includes its name, description, parameter schema, server affinity, and usage statistics. This registry enables the platform's agents to discover and invoke tools without needing to know which specific MCP server hosts them.

The **Performance Tracker** records latency, throughput, and error rates for every tool invocation, enabling operators to identify performance bottlenecks and degraded servers. Historical performance data supports trend analysis and capacity planning.

## Usage

### Status and Discovery

```bash
# Show overview of all MCP servers and their status
/mcp status

# List all available tools across all connected servers
/mcp tools

# Show detailed information about a specific tool
/mcp tool-info prismatic-mcp:search_code

# Discover tools matching a pattern
/mcp tools --search="file"
```

### Connection Management

```bash
# Connect to a specific MCP server
/mcp connect prismatic-mcp

# Disconnect from a server
/mcp disconnect memory

# Reconnect a server (disconnect + connect)
/mcp reconnect github

# Connect to all configured servers
/mcp connect --all
```

### Server Management

```bash
# Start a specific MCP server
/mcp start prismatic-mcp

# Stop a running server
/mcp stop memory

# Restart a server
/mcp restart github

# Start all configured servers
/mcp start --all
```

### Performance and Diagnostics

```bash
# Show performance metrics for all servers
/mcp performance

# Run diagnostic health checks
/mcp diagnose

# Benchmark a specific tool
/mcp benchmark prismatic-mcp:search_code --iterations=100

# Show error analysis for a server
/mcp errors github --period=1h
```

### Configuration

```bash
# Show current MCP configuration
/mcp config

# Update server configuration
/mcp config set prismatic-mcp.timeout 30s

# Export configuration for backup
/mcp config export --output=mcp-config.json

# Import configuration
/mcp config import mcp-config.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | Subcommand | -- | Show MCP infrastructure overview |
| `tools` | Subcommand | -- | List all available tools |
| `tool-info` | Subcommand | -- | Show detailed tool information |
| `connect` | Subcommand | -- | Connect to an MCP server |
| `disconnect` | Subcommand | -- | Disconnect from an MCP server |
| `reconnect` | Subcommand | -- | Reconnect to an MCP server |
| `start` | Subcommand | -- | Start an MCP server process |
| `stop` | Subcommand | -- | Stop an MCP server process |
| `restart` | Subcommand | -- | Restart an MCP server |
| `performance` | Subcommand | -- | Show performance metrics |
| `diagnose` | Subcommand | -- | Run diagnostic checks |
| `benchmark` | Subcommand | -- | Benchmark a specific tool |
| `config` | Subcommand | -- | Configuration management |
| `errors` | Subcommand | -- | Error analysis |
| `--all` | Flag | false | Apply operation to all servers |
| `--search` | String | none | Filter tools by name pattern |
| `--format` | String | table | Output format (table, json, markdown) |
| `--period` | Duration | 24h | Time period for metrics and error analysis |
| `--iterations` | Integer | 10 | Number of iterations for benchmarks |
| `--verbose` | Flag | false | Show detailed output |

## Execution Flow

1. **Subcommand Parsing** -- The command router identifies the requested operation from the first positional argument and routes to the appropriate handler. Unknown subcommands receive a help message listing valid operations.

2. **Server Resolution** -- For operations targeting specific servers, the server name is resolved against the server registry. Unrecognized server names produce an error listing available servers.

3. **Pre-condition Validation** -- Operation-specific pre-conditions are checked. For example, `connect` verifies the server is started but not already connected; `stop` verifies the server is currently running.

4. **Operation Execution** -- The requested operation is performed through the appropriate subsystem (Server Manager, Connection Pool, Config Manager, etc.). Each operation is atomic with rollback on failure.

5. **Result Verification** -- Post-operation state is checked to confirm the operation achieved the desired effect. For lifecycle operations, this includes process state verification and health checks.

6. **Output Rendering** -- Results are formatted according to the `--format` parameter. The default table format provides a concise, aligned view suitable for terminal display.

7. **Telemetry Recording** -- All operations are recorded in the telemetry stream for audit trail and operational visibility.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by the `mcp-evolution-coordinator` agent |
| MCP Protocol | Core Protocol | Central management interface for all MCP operations |
| [Prismatic MCP](@/apps/prismatic-mcp.md) | Primary Server | Platform's primary MCP server with 27+ native tools |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post validation | Quality checks on configuration and operational state |
| [Telemetry](@/glossary/telemetry.md) | Observability | All operations emit structured telemetry events |
| [Prismatic API](@/apps/prismatic-api.md) | REST Exposure | MCP status and tool information available via REST API |
| [Session Lifecycle](@/glossary/session-discipline.md) | Auto-integration | MCP status verified during session initialization |

## Best Practices

**Regular Status Checks**: Run `/mcp status` at the beginning of each working session to verify all expected MCP servers are connected and healthy. Address any degraded servers before starting dependent work.

**Tool Discovery Before Use**: Use `/mcp tools --search=<pattern>` to discover available tools before writing automation that depends on specific tool capabilities. Tool availability may vary by environment.

**Performance Monitoring**: Periodically review `/mcp performance` to identify servers with degraded latency or elevated error rates. Address performance issues before they impact agent operations.

**Configuration Version Control**: Export MCP configuration (`/mcp config export`) and maintain it in version control alongside other platform configuration. This enables reproducible environments and configuration rollback.

**Graceful Shutdown**: Always use `/mcp stop` rather than killing MCP server processes directly. Graceful shutdown ensures in-flight requests complete and resources are properly released.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Server not found | Error listing available servers | Check server name spelling; verify configuration |
| Connection refused | Error with server address and port | Verify server is running; check network/firewall |
| Tool not found | Error listing similar tools | Use `/mcp tools` to discover available tools |
| Config validation failure | Detailed validation errors | Correct configuration values per error messages |
| Benchmark timeout | Partial results with timeout indicator | Increase timeout or reduce iteration count |
| Permission denied | Authority level requirement shown | Escalate to L2+ authority |

## Advanced Usage

### Tool Invocation Testing

Test tool invocations directly through the MCP command for debugging and validation:

```bash
# Invoke a specific tool with test parameters
/mcp invoke prismatic-mcp:search_code --params='{"query":"GenServer","limit":5}'

# Test tool with timing
/mcp invoke --timed filesystem:read_file --params='{"path":"/tmp/test.txt"}'
```

### Server Discovery

Discover MCP servers available in the environment but not yet configured:

```bash
# Scan for available MCP servers
/mcp discover

# Auto-configure discovered servers
/mcp discover --auto-configure
```

### Bulk Operations

Execute operations across multiple servers efficiently:

```bash
# Restart all servers in a specific category
/mcp restart --category=development

# Health check with timeout override
/mcp diagnose --all --timeout=5s
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for unreported failures. Every MCP operation must produce a clear success or failure outcome with actionable details. Connection drops, tool invocation failures, and configuration errors are all surfaced immediately with diagnostic context.
- **NO DOUBTS**: Full state verification for all lifecycle operations. The command never assumes operational success based on the absence of errors -- it actively verifies post-operation state through health probes and state queries. Performance metrics provide evidence-based assessment of system health.

## Related Commands

- [/mcp-autoboot](@/commands/mcp-autoboot.md) - Start MCP infrastructure with full orchestration
- [/mcp-service](@/commands/mcp-service.md) - Manage Prismatic MCP server as macOS service for persistent operation
- [/ollama](@/commands/ollama.md) - Local AI Ollama model management, installation and optimization
- [/gardener](@/commands/gardener.md) - [GARDEN](@/glossary/garden.md) legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)