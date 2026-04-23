+++
title = "/reload"
weight = 1390
[extra]
category = "Infrastructure"
description = "Hot-reload MCP servers, AIAD registry and platform configuration without restart"
syntax = "/reload [options]"
authority = "L2+"
agent = "aiad-hot-reload-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1217
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["reload", "Hot-reload", "AIAD", "commands", "Infrastructure", "Prismatic Platform", "Step"]
tags = ["commands", "infrastructure", "reload", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/reload - Prismatic Platform"
+++

## Overview

**/reload** is a production command in the **Infrastructure** category of the Prismatic Platform that performs hot-reload operations on MCP servers, the [AIAD](@/glossary/aiad.md) [registry](@/glossary/registry-otp.md), and platform configuration without requiring a full system restart. This command leverages Elixir/OTP's native hot code loading capabilities to apply changes to running systems while maintaining active connections, preserving process state, and ensuring zero downtime during the reload cycle.

Hot reloading is a critical operational capability in a platform that runs continuously and serves multiple concurrent users through LiveView connections. Traditional restart-based deployment disrupts all active sessions, loses in-memory state accumulated in ETS tables and GenServer processes, and requires re-establishing connections to external services like PostgreSQL, Redis, and Meilisearch. The `/reload` command eliminates these disruptions by applying changes surgically to only the modified components while the rest of the system continues operating normally.

The reload coordinator manages the complexity of hot code loading in a multi-application umbrella project. When a single module is reloaded, its dependents must be reloaded in the correct order to prevent runtime errors from version mismatches. The coordinator computes the dependency-ordered reload sequence, applies it transactionally, and verifies that all reloaded modules are functioning correctly before completing the operation.

This command also handles the MCP (Model Context Protocol) server lifecycle, which is critical for the platform's AI integration layer. MCP servers connect Claude and other AI assistants to platform capabilities through a standardized protocol. Reloading MCP servers refreshes their tool registrations, updates their configuration, and re-establishes any dropped connections without losing the context of in-progress AI operations.

This command operates under the **L2+** authority level and is executed by the `aiad-hot-reload-coordinator` agent. It is part of the platform's 216-command slash command registry, built on the AIAD (Autonomous Intelligence Agent Design) standard.

## Architecture

The reload system implements a multi-target architecture that handles different reload targets through specialized handlers while maintaining a unified coordination layer.

```
Reload Request
    |
    v
[Coordinator] --> Determine reload targets
    |
    +---> [Module Reload Handler]
    |     +---> Dependency analysis
    |     +---> Ordered code loading
    |     +---> State migration
    |     +---> Verification
    |
    +---> [MCP Server Reload Handler]
    |     +---> Connection drain
    |     +---> Configuration refresh
    |     +---> Tool re-registration
    |     +---> Connection restoration
    |
    +---> [AIAD Registry Reload Handler]
    |     +---> Filesystem scan
    |     +---> Delta computation
    |     +---> Registry update
    |     +---> Index rebuild
    |
    +---> [Configuration Reload Handler]
          +---> Config file parsing
          +---> Validation
          +---> Application env update
          +---> Dependent process notification
    |
    v
Reload Verification --> Health checks on all reloaded components
    |
    v
Reload Complete
```

The coordination layer ensures that reload operations across different targets are sequenced correctly. Configuration changes must be applied before module reloads (since modules may read config at load time), and AIAD registry updates must follow module reloads (since new modules may register new AIAD components).

## Usage

```bash
# Reload everything (modules, MCP, registry, config)
/reload

# Reload only MCP servers
/reload --mcp

# Reload only AIAD registry
/reload --registry

# Reload only configuration
/reload --config

# Reload a specific module
/reload --module=PrismaticPerimeter.SecurityRating

# Reload a specific application
/reload --app=prismatic_web

# Reload with state preservation verification
/reload --verify-state

# Reload MCP servers with connection drain timeout
/reload --mcp --drain-timeout=30s

# Dry-run to preview reload sequence
/reload --dry-run

# Reload with rollback on failure
/reload --rollback-on-failure
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--mcp` | boolean | false | Reload MCP servers only |
| `--registry` | boolean | false | Reload AIAD registry only |
| `--config` | boolean | false | Reload configuration only |
| `--module` | string | - | Reload a specific module by name |
| `--app` | string | - | Reload a specific umbrella application |
| `--verify-state` | boolean | true | Verify process state preservation after reload |
| `--drain-timeout` | string | 10s | Timeout for draining active connections |
| `--dry-run` | boolean | false | Preview reload sequence without executing |
| `--rollback-on-failure` | boolean | true | Automatically rollback on reload failure |
| `--force` | boolean | false | Force reload even if no changes detected |
| `--verbose` | boolean | false | Show detailed reload progress |
| `--health-check` | boolean | true | Run health checks after reload |
| `--notify` | boolean | true | Send telemetry notifications during reload |

## Execution Flow

The reload command follows a carefully orchestrated execution flow designed to minimize disruption and maximize safety.

**Step 1 - Change Detection**: The coordinator scans for changes since the last reload. For modules, this compares source file timestamps against loaded BEAM file timestamps. For MCP servers, this checks configuration file modifications. For the AIAD registry, this runs the same discovery process as [/registry-sync](@/commands/registry-sync.md).

**Step 2 - Dependency Analysis**: Modified modules are analyzed to determine their dependency graph. The coordinator computes the correct reload order using topological sort on the dependency DAG, ensuring that dependencies are reloaded before dependents.

**Step 3 - Pre-Reload Health Check**: A baseline health check captures the current state of all target components. This baseline is used to verify that the reload does not degrade system health.

**Step 4 - Connection Draining**: For MCP servers and LiveView connections, active connections are gracefully drained. New connections are held in a queue while existing connections complete their current operations up to the drain timeout.

**Step 5 - Atomic Reload**: Changes are applied in the computed order. Module reloads use Erlang's `:code.load_binary/3` for BEAM files compiled from modified sources. Configuration changes update the Application environment. MCP servers restart with new configurations.

**Step 6 - State Migration**: GenServer processes that hold state may need migration if the reloaded module changes the state structure. The reload handler checks for `code_change/3` callbacks and invokes them as needed.

**Step 7 - Post-Reload Verification**: Health checks run against all reloaded components. The results are compared against the pre-reload baseline. If degradation is detected and `--rollback-on-failure` is enabled, the reload is automatically reversed.

**Step 8 - Connection Restoration**: Queued connections are released and directed to the reloaded components. MCP servers re-register their tools with updated capabilities.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `aiad-hot-reload-coordinator` | Specialized in OTP hot code loading |
| MCP Servers | Reload target | 14+ servers with tool registrations |
| [AIAD](@/glossary/aiad.md) Registry | Reload target | Agent and command catalog refresh |
| OTP Application | Module reload | Erlang hot code loading primitives |
| [/registry-sync](@/commands/registry-sync.md) | Registry reload | Shares discovery logic with registry-sync |
| [/connect](@/commands/connect.md) | MCP management | Connect manages MCP lifecycle; reload refreshes it |
| [Telemetry](@/glossary/telemetry.md) | Event tracking | Reload operations emit detailed telemetry events |
| [Quality Gates](@/glossary/quality-gates.md) | Post-reload validation | Quality gates verify reloaded code quality |

## Best Practices

Use targeted reloads (`--module`, `--app`, `--mcp`) rather than full reloads during development. Targeted reloads are faster, less disruptive, and provide clearer feedback about what changed. Full reloads are appropriate after configuration changes that affect multiple components or after pulling a large number of changes from remote.

Always keep `--rollback-on-failure` enabled (it is on by default). A failed reload that leaves the system in an inconsistent state is worse than no reload at all. The automatic rollback ensures that the system always returns to a known-good state if any verification step fails.

Monitor the drain timeout carefully when reloading MCP servers during active AI sessions. If AI operations are in progress, the default 10-second drain timeout may not be sufficient. Extend it with `--drain-timeout=60s` for environments with long-running AI operations.

Use `--verify-state` to confirm that GenServer processes retain their state correctly through the reload. State corruption during hot code loading is a subtle and dangerous failure mode that health checks alone may not detect.

## Error Handling

Reload errors trigger automatic rollback by default, restoring the system to its pre-reload state. Error reports include the specific component that failed, the phase of the reload where the failure occurred, and diagnostic information to guide resolution.

```
RELOAD ERROR REPORT
Target: MCP Server 'prismatic-mcp'
Phase: Connection Restoration (Step 8)
Error: Tool registration failed - missing module PrismaticMCP.NewTool
Root Cause: Module PrismaticMCP.NewTool was added but not compiled
Action: ROLLBACK EXECUTED - system restored to pre-reload state
Suggestion: Run `mix compile` before reload to ensure new modules are compiled
```

Timeout errors during connection draining are handled by forcefully terminating drained connections after the timeout expires, logging the terminated connections for review.

## Advanced Usage

Advanced reload operations support staged rollouts, canary reloads, and integration with deployment pipelines.

```bash
# Staged reload across applications
/reload --staged --order=prismatic_storage_core,prismatic,prismatic_web

# Reload with custom health check endpoint
/reload --health-endpoint=/api/v1/health --health-timeout=5s

# Reload with process state dump before and after
/reload --dump-state=/tmp/reload-state --app=prismatic_agents

# Force BEAM file purge before reload (clear old code)
/reload --purge --module=PrismaticWeb.Router
```

The `--staged` flag enables controlled rollout across applications in a specified order, with health checks between each application's reload. This is the safest approach for large-scale reloads that affect multiple applications with interdependencies.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Reload operations either complete successfully with verified health checks or roll back completely. No partial reloads are left in place, and no health check degradation is tolerated.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The dependency analysis and change detection phases ensure complete understanding of the reload's impact before any changes are applied. Post-reload verification provides evidence that the reload succeeded.

## Related Commands

- [/ollama](@/commands/ollama.md) - Local AI Ollama model management, installation and optimization
- [/gardener](@/commands/gardener.md) - [GARDEN](@/glossary/garden.md) legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers
- [/registry-sync](@/commands/registry-sync.md) - AIAD registry synchronization and indexing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)