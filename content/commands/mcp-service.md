+++
title = "/mcp-service"
weight = 1380
[extra]
category = "Infrastructure"
description = "Manage Prismatic MCP server as macOS service for persistent operation"
syntax = "/mcp-service [options]"
authority = "L2+"
agent = "mcp-service-controller"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1292
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mcp-service", "Manage", "Prismatic", "commands", "Infrastructure", "Prismatic Platform", "Subcommand", "Service"]
tags = ["commands", "infrastructure", "mcp-service", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mcp-service - Prismatic Platform"
+++

## Overview

**/mcp-service** is a production command in the **Infrastructure** category of the Prismatic Platform. It manages the Prismatic MCP server as a persistent macOS service using `launchd`, the native macOS service management daemon. This command abstracts the complexity of `launchd` plist configuration, service lifecycle management, and log monitoring into a simple command interface that ensures the MCP server remains running across system restarts, user logouts, and crash recovery scenarios.

Running the MCP server as a persistent service is essential for production and development environments where continuous availability is required. Without service management, the MCP server would need to be manually started at every system boot or session start, creating a gap in tool availability that could disrupt automated workflows, scheduled tasks, and background intelligence operations that depend on MCP connectivity.

This command operates under the **L2+** authority level and is executed by the `mcp-service-controller` agent, a specialized infrastructure agent responsible for macOS service lifecycle operations. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command handles the full service lifecycle: installation (plist generation and loading), start/stop/restart operations, status monitoring, log access, and uninstallation (service unloading and plist removal).

The service management approach provides several advantages over manual process management. The `launchd` integration ensures automatic restart on crash (with configurable restart throttling), proper signal handling for graceful shutdown, environment variable isolation, log redirection, and resource limit configuration. These properties are critical for maintaining the reliability expectations of a production MCP infrastructure serving 27 or more tools to the platform's 400+ agents.

## Architecture

The `/mcp-service` command interfaces with macOS `launchd` through a structured abstraction layer that separates configuration management from service control operations.

```
+---------------------+     +----------------------+     +-------------------+
|  Service Controller |---->|  Plist Manager       |---->|  launchd Interface|
|  (Command Handler)  |     |  (Config Generation) |     |  (launchctl CLI)  |
+---------------------+     +----------------------+     +-------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +----------------------+     +-------------------+
|  Health Monitor     |     |  Log Manager         |     |  Process Tracker  |
|  (Liveness Probes)  |     |  (stdout/stderr)     |     |  (PID Management) |
+---------------------+     +----------------------+     +-------------------+
```

The **Service Controller** processes command invocations and routes them to the appropriate subsystem. It maintains an internal state model of the service's expected state versus actual state, enabling detection of drift conditions where the service is in an unexpected state.

The **Plist Manager** generates and maintains the `launchd` property list (plist) file that defines the service. The plist includes executable path, arguments, environment variables, working directory, log file paths, keep-alive configuration, and resource limits. Configuration is generated from platform defaults with support for operator overrides.

The **launchd Interface** wraps `launchctl` CLI operations with proper error handling, output parsing, and state verification. Each operation (load, unload, start, stop, bootstrap, bootout) is executed with appropriate authority and verified for success.

The **Health Monitor** provides continuous liveness checking beyond `launchd`'s built-in keep-alive mechanism. It performs application-level health probes (MCP protocol handshake, tool enumeration) rather than relying solely on process liveness.

## Usage

### Service Installation and Setup

```bash
# Install and start the MCP server as a persistent macOS service
/mcp-service install

# Install with custom configuration
/mcp-service install --port=8080 --log-dir=/var/log/prismatic-mcp

# Install without auto-starting
/mcp-service install --no-start
```

### Service Lifecycle Management

```bash
# Start the MCP service
/mcp-service start

# Stop the MCP service gracefully
/mcp-service stop

# Restart the MCP service (stop + start)
/mcp-service restart

# Reload service configuration without full restart
/mcp-service reload
```

### Status and Monitoring

```bash
# Show current service status
/mcp-service status

# Show detailed service information including PID, uptime, resource usage
/mcp-service status --detailed

# Show recent service logs
/mcp-service logs

# Follow service logs in real time
/mcp-service logs --follow

# Show only error logs
/mcp-service logs --level=error
```

### Service Removal

```bash
# Stop and uninstall the MCP service
/mcp-service uninstall

# Uninstall and remove all associated logs
/mcp-service uninstall --clean
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `install` | Subcommand | -- | Install and configure the MCP server as a launchd service |
| `uninstall` | Subcommand | -- | Stop and remove the service configuration |
| `start` | Subcommand | -- | Start the installed service |
| `stop` | Subcommand | -- | Stop the running service gracefully |
| `restart` | Subcommand | -- | Stop and start the service |
| `reload` | Subcommand | -- | Reload configuration without full restart |
| `status` | Subcommand | -- | Display service status |
| `logs` | Subcommand | -- | Display service logs |
| `--port` | Integer | 4100 | MCP server port for TCP mode |
| `--log-dir` | String | ~/Library/Logs/PrismaticMCP | Directory for service log files |
| `--no-start` | Flag | false | Install without auto-starting |
| `--clean` | Flag | false | Remove logs and data on uninstall |
| `--detailed` | Flag | false | Show extended status information |
| `--follow` | Flag | false | Follow logs in real time (tail -f behavior) |
| `--level` | String | all | Log level filter (debug, info, warn, error) |
| `--lines` | Integer | 50 | Number of log lines to display |
| `--keep-alive` | Boolean | true | Configure launchd keep-alive (auto-restart on crash) |
| `--throttle` | Integer | 10 | Minimum seconds between automatic restarts |

## Execution Flow

1. **Authority Verification** -- The system confirms L2+ authority for the requesting operator. Service management operations require elevated authority due to their system-level impact.

2. **Subcommand Routing** -- The specified subcommand (install, start, stop, etc.) is routed to the appropriate handler. Each handler implements pre-condition validation before executing the operation.

3. **State Assessment** -- Before executing the requested operation, the current service state is assessed: is the plist installed? Is the service loaded? Is the process running? Is it healthy? This state assessment prevents invalid operations (e.g., starting an already-running service).

4. **Operation Execution** -- The requested operation is performed through the launchd interface. For install operations, this includes plist generation, file placement in `~/Library/LaunchAgents/`, and service loading. For lifecycle operations, the appropriate `launchctl` commands are issued.

5. **State Verification** -- After execution, the service state is re-assessed to verify the operation achieved the desired result. If the post-operation state does not match expectations, diagnostic information is collected and reported.

6. **Health Verification** -- For start and restart operations, application-level health checks are performed after the process is confirmed running. This ensures the MCP server is not just alive but functionally operational.

7. **Telemetry Emission** -- Service lifecycle events are recorded in the platform's telemetry system for operational visibility and historical analysis.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by the `mcp-service-controller` agent |
| MCP Protocol | Core Protocol | Manages the persistent MCP server process |
| [Prismatic MCP](/apps/prismatic-mcp/) | Target Server | The MCP server being managed as a service |
| macOS launchd | System Service | Native macOS service management integration |
| [Telemetry](/glossary/telemetry/) | Observability | Service lifecycle events and health metrics |
| [Quality Gates](/glossary/quality-gates/) | Validation | Service health as quality gate pre-condition |
| Session Lifecycle | Dependency | Session start can depend on MCP service availability |

## Best Practices

**Install Once, Run Always**: Use `/mcp-service install` once per environment setup. The keep-alive configuration ensures the service survives reboots and crashes without further intervention.

**Monitor Logs After Install**: After initial installation, follow logs for 60 seconds (`/mcp-service logs --follow`) to verify stable operation before relying on the service for production workloads.

**Use Reload for Config Changes**: When MCP server configuration changes (new tools, connection parameters), prefer `/mcp-service reload` over full restart to minimize service interruption.

**Clean Uninstall Before Reinstall**: If reconfiguring the service (different port, different log directory), always run `/mcp-service uninstall --clean` before reinstalling to prevent configuration conflicts.

**Review Throttle Settings**: The default 10-second throttle between restarts prevents crash loops from consuming system resources. Increase this value if the MCP server has a slow startup time that might cause premature restart attempts.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| launchd not available | Fatal error (non-macOS system) | Use alternative service management for the current platform |
| Plist write permission denied | Error with file path and permission details | Verify write access to ~/Library/LaunchAgents/ |
| Service already installed | Warning with current installation details | Uninstall first, or use restart/reload for existing service |
| Port conflict on start | Service fails to start with port-in-use diagnostic | Identify and stop conflicting process, or reconfigure port |
| Repeated crash (throttle exceeded) | Service disabled by launchd with crash count in logs | Investigate crash root cause in service logs before re-enabling |
| Health check failure after start | Warning with diagnostic details and retry schedule | Check MCP server logs for initialization errors |

## Advanced Usage

### Custom Plist Configuration

For advanced scenarios requiring non-standard launchd configuration:

```bash
# Install with custom environment variables
/mcp-service install --env="MCP_LOG_LEVEL=debug,MCP_TOOLS_DIR=/custom/tools"

# Install with resource limits
/mcp-service install --max-memory=512m --max-files=1024

# Export the generated plist for manual review
/mcp-service export-plist --output=com.prismatic.mcp.plist
```

### Multi-Instance Management

When running multiple MCP server instances for different purposes:

```bash
# Install a secondary instance with a distinct label
/mcp-service install --instance=dev --port=4101

# Manage specific instances
/mcp-service status --instance=dev
/mcp-service restart --instance=dev
```

### Integration with System Monitoring

Connect MCP service health to platform-wide monitoring infrastructure:

```bash
# Enable prometheus-compatible health endpoint
/mcp-service install --health-endpoint=:9090/metrics

# Configure alerting thresholds
/mcp-service configure --alert-on-restart --alert-on-crash
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for silently failed services. Every service management operation must produce a verified outcome -- the service is confirmed running and healthy, or the failure is fully diagnosed and reported. Partial success states (process running but unhealthy) are treated as failures requiring immediate attention.
- **NO DOUBTS**: Full state verification before and after every operation. The command never assumes the service is in a particular state based on a previous operation's success; it always queries the actual system state through `launchctl` and application-level health probes.

## Related Commands

- [/mcp](/commands/mcp/) - Complete Model Context Protocol operations and management
- [/mcp-autoboot](/commands/mcp-autoboot/) - Start MCP infrastructure with full orchestration
- [/ollama](/commands/ollama/) - Local AI Ollama model management, installation and optimization
- [/gardener](/commands/gardener/) - [GARDEN](/glossary/garden/) legacy knowledge repository management across 116 repos
- [/garden-explore](/commands/garden-explore/) - Explore GARDEN repositories for patterns and knowledge
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)