+++
title = "/mcp-autoboot"
weight = 1370
[extra]
category = "Infrastructure"
description = "Start MCP infrastructure with full orchestration"
syntax = "/mcp-autoboot [options]"
authority = "L2+"
agent = "mcp-evolution-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1352
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mcp-autoboot", "Start", "commands", "Infrastructure", "Prismatic Platform", "Flag", "Server", "Boot"]
tags = ["commands", "infrastructure", "mcp-autoboot", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mcp-autoboot - Prismatic Platform"
+++

## Overview

**/mcp-autoboot** is a production command in the **Infrastructure** category of the Prismatic Platform. It automates the complete startup sequence of the Model Context Protocol (MCP) infrastructure, orchestrating the initialization, health verification, and connection establishment of all configured MCP servers in the correct dependency order. Rather than requiring operators to manually start, configure, and verify each MCP server individually, this command handles the entire bootstrap process as a single atomic operation.

The Prismatic Platform integrates with 14 or more MCP servers, each providing specialized capabilities: filesystem access, GitHub integration, PostgreSQL connectivity, semantic memory, context management, and more. These servers have interdependencies -- some must be available before others can initialize. The `/mcp-autoboot` command encodes these dependency relationships and executes the startup sequence in topologically sorted order, ensuring that each server finds its dependencies already available when it starts.

This command operates under the **L2+** authority level and is executed by the `mcp-evolution-coordinator` agent, the same agent responsible for the broader MCP lifecycle management across the platform. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command is typically invoked at session start or after infrastructure recovery events, making reliability and idempotency critical design properties.

Beyond simple startup, the autoboot process includes comprehensive health verification for each server, connection validation with retry logic, capability negotiation, and registration of available tools in the platform's tool registry. If any server fails to start or pass health checks, the command provides detailed diagnostics and can optionally proceed with degraded mode, making available only the servers that successfully initialized.

## Architecture

The MCP autoboot system is organized as a multi-phase orchestration pipeline with supervision and health monitoring at each stage.

```
+---------------------+     +----------------------+     +--------------------+
|  Dependency Graph   |---->|  Startup Sequencer   |---->|  Health Verifier   |
|  (Topological Sort) |     |  (Ordered Launch)    |     |  (Per-Server)      |
+---------------------+     +----------------------+     +--------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +----------------------+     +--------------------+
|  Server Registry    |     |  Connection Pool     |     |  Tool Registration |
|  (Config + State)   |     |  (Managed Channels)  |     |  (Capability Map)  |
+---------------------+     +----------------------+     +--------------------+
```

The **Dependency Graph** is constructed from server configuration files and encodes both hard dependencies (server B cannot start without server A) and soft dependencies (server C benefits from server D but can operate without it). The graph is topologically sorted to produce an optimal startup order.

The **Startup Sequencer** executes the sorted startup plan, launching each server as a supervised OTP process. It supports configurable parallelism for independent servers at the same dependency level, reducing total boot time. Each launch includes a configurable timeout and retry policy.

The **Health Verifier** performs post-startup validation for each server, checking process liveness, TCP/stdio connectivity, protocol handshake completion, and capability advertisement. Servers that fail health checks are flagged with diagnostic details and optionally retried.

The **Tool Registration** phase enumerates the tools exposed by each successfully started MCP server and registers them in the platform's unified tool registry, making them available to all agents and commands.

## Usage

### Standard Autoboot

```bash
# Full MCP infrastructure autoboot with default settings
/mcp-autoboot

# Autoboot with verbose output showing each server's startup progress
/mcp-autoboot --verbose

# Autoboot with a specific configuration profile
/mcp-autoboot --profile=development
```

### Selective Boot

```bash
# Boot only specific MCP servers
/mcp-autoboot --servers=prismatic-mcp,github,filesystem

# Boot all servers except specified ones
/mcp-autoboot --exclude=postgres,memory

# Boot only P1 (priority 1) servers
/mcp-autoboot --priority=1
```

### Recovery and Diagnostics

```bash
# Reboot failed servers from a previous autoboot attempt
/mcp-autoboot --retry-failed

# Force restart all servers (even if already running)
/mcp-autoboot --force

# Dry run showing the startup plan without executing
/mcp-autoboot --dry-run

# Generate diagnostic report for current MCP infrastructure state
/mcp-autoboot --diagnostics
```

### Health Monitoring

```bash
# Verify health of all running MCP servers
/mcp-autoboot --health-check

# Continuous health monitoring with alerting
/mcp-autoboot --monitor --interval=30s
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--profile` | String | default | Configuration profile (development, staging, production) |
| `--servers` | String | all | Comma-separated list of specific servers to boot |
| `--exclude` | String | none | Comma-separated list of servers to exclude from boot |
| `--priority` | Integer | all | Boot only servers at or above specified priority level |
| `--force` | Flag | false | Force restart servers even if already running |
| `--retry-failed` | Flag | false | Retry only servers that failed in the previous boot attempt |
| `--dry-run` | Flag | false | Display startup plan without executing |
| `--timeout` | Duration | 30s | Per-server startup timeout |
| `--retries` | Integer | 3 | Maximum retry attempts per server |
| `--parallel` | Integer | 4 | Maximum parallel server launches for independent servers |
| `--degraded` | Flag | true | Allow degraded mode (continue if some servers fail) |
| `--health-check` | Flag | false | Run health checks only (no startup) |
| `--monitor` | Flag | false | Enable continuous health monitoring after boot |
| `--interval` | Duration | 60s | Health monitoring interval |
| `--diagnostics` | Flag | false | Generate diagnostic report |
| `--verbose` | Flag | false | Show detailed startup progress for each server |

## Execution Flow

1. **Configuration Loading** -- The system loads MCP server configurations from the platform's configuration files, resolving any environment-specific overrides based on the selected profile. Server definitions include process type (stdio/TCP), connection parameters, dependency declarations, and health check specifications.

2. **Dependency Resolution** -- The dependency graph is constructed and topologically sorted. Circular dependencies are detected and reported as fatal errors. The sorted order is presented in verbose mode for operator review.

3. **Pre-flight Checks** -- System prerequisites are verified: required binaries exist, ports are available, environment variables are set, and file paths are accessible. Any pre-flight failures are reported with resolution guidance.

4. **Sequential/Parallel Launch** -- Servers are launched in dependency order. Servers at the same dependency level with no mutual dependencies are launched in parallel (up to the configured parallelism limit). Each launch is supervised with timeout and retry policies.

5. **Health Verification** -- Each launched server undergoes health verification: process liveness check, protocol handshake, capability advertisement, and a test tool invocation. Health check results are recorded for diagnostic purposes.

6. **Tool Registration** -- Successfully booted servers have their exposed tools enumerated and registered in the platform's tool registry. Tool metadata including descriptions, parameter schemas, and server affinity are recorded.

7. **Status Report** -- A summary report is generated showing boot results for each server: started, failed (with reason), skipped, or already running. The report includes total boot time, server count, and degraded mode indicators if applicable.

8. **Telemetry Emission** -- Comprehensive telemetry events are emitted covering boot duration, per-server timing, failure rates, and retry counts. These feed into the platform's observability infrastructure for historical analysis.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by the `mcp-evolution-coordinator` agent |
| MCP Protocol | Core Protocol | Manages the full MCP server lifecycle |
| [Prismatic MCP](@/apps/prismatic-mcp.md) | Primary Server | The platform's own MCP server with 27+ tools |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Post-boot quality gate verification |
| [Telemetry](@/glossary/telemetry.md) | Observability | Boot timing, health, and failure metrics |
| Session Lifecycle | Auto-trigger | Can be triggered automatically at session start |
| [Supervision Trees](@/glossary/supervision-tree.md) | Process Management | All MCP servers run under OTP supervision |

## Best Practices

**Use Profiles for Environment Consistency**: Define separate configuration profiles for development, staging, and production to ensure consistent server sets and connection parameters across environments.

**Pre-flight Dry Runs**: Before first boot in a new environment, run `/mcp-autoboot --dry-run` to verify the dependency graph and startup plan without side effects.

**Monitor After Boot**: Enable post-boot monitoring with `--monitor` for production environments to detect server failures promptly and trigger automated recovery.

**Selective Boot for Development**: During development, use `--servers` to boot only the MCP servers needed for the current task, reducing startup time and resource consumption.

**Review Diagnostics on Failure**: When autoboot reports failures, use `--diagnostics` to generate a comprehensive report before attempting manual intervention. The diagnostic report often reveals the root cause directly.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Circular dependency detected | Fatal error with cycle details | Resolve dependency cycle in server configuration |
| Server binary not found | Pre-flight failure with missing binary path | Install missing server binary or update configuration path |
| Port already in use | Server startup failure with port conflict details | Stop conflicting process or reconfigure server port |
| Health check timeout | Server marked as failed; retried per retry policy | Check server logs; increase timeout if startup is slow |
| All retries exhausted | Server marked as permanently failed in this boot | Manual investigation required; check server-specific logs |
| Degraded mode active | Warning with list of unavailable servers and tools | Boot missing servers individually once issues are resolved |

## Advanced Usage

### Automated Session Integration

Configure MCP autoboot to trigger automatically at the start of every platform session:

```bash
# In session lifecycle hooks configuration
/mcp-autoboot --profile=auto --degraded --timeout=15s
```

### Custom Health Check Extensions

Extend the default health checks with domain-specific validation:

```bash
# Boot with extended health checks
/mcp-autoboot --health-check-extended --validate-tools

# Verify specific tool availability after boot
/mcp-autoboot --verify-tool=prismatic-mcp:search_code
```

### Infrastructure Recovery

After a system-wide failure, use autoboot for structured recovery:

```bash
# Force restart everything with extended timeouts
/mcp-autoboot --force --timeout=60s --retries=5 --verbose
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for partially booted infrastructure. Every configured MCP server must either pass health checks or be explicitly flagged as failed with diagnostic details. Silent failures are not permitted -- every server's status is accounted for in the boot report.
- **NO DOUBTS**: Full dependency verification before launch sequencing. The startup order is deterministically computed from the dependency graph, with cycle detection and topological validation ensuring correctness. Health checks provide evidence-based confirmation of server readiness rather than relying on process startup alone.

## Related Commands

- [/mcp](@/commands/mcp.md) - Complete Model Context Protocol operations and management
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