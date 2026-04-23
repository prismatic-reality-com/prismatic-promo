+++
title = "/stack-config"
weight = 1050
[extra]
category = "Stack Mode"
description = "Advanced Stack Mode configuration and customization commands"
syntax = "/stack-config [options]"
authority = "L2+"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1071
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stack-config", "Advanced", "Stack", "Mode", "commands", "Stack Mode", "Prismatic Platform", "Configuration"]
tags = ["commands", "stack-mode", "stack-config", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/stack-config - Prismatic Platform"
+++

## Overview

**/stack-config** is a production command in the **Stack Mode** category of the Prismatic Platform that provides advanced Stack Mode configuration and customization commands. The Stack-Based Conversation Mode is a foundational protocol governing how all Claude sessions interact with the platform, and the `/stack-config` command serves as the administrative interface for tailoring stack behavior to specific operational requirements.

The Stack-Based Conversation Mode maintains an immutable sequence of frames, where each frame records the user input, assistant output, key assumptions, and key decisions for a single interaction turn. While the core stack operations ([/stack](/commands/stack/), [/frame](/commands/frame/), [/pop](/commands/pop/), [/fork](/commands/fork/)) are fixed by protocol, the configuration layer allows operators to adjust stack persistence behavior, frame metadata requirements, checkpoint policies, and integration settings without modifying the core protocol.

This command operates under the **L2+** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L2+ authority ensures that stack configuration changes require operational-level privileges, preventing accidental misconfiguration that could affect session continuity.

The configuration system is backed by the `PrismaticClaude.StackConversation` GenServer, an OTP-compliant implementation with ETS-backed frame storage and disk persistence. Configuration changes take effect immediately for the current session and can optionally be persisted to disk for cross-session consistency. The system stores its state in `.claude/stack-conversation/` within the project root.

## Architecture

The stack configuration system operates as a configuration layer above the core StackConversation GenServer, modifying its behavior without changing its fundamental protocol.

```
/stack-config Command
       |
       v
  [Configuration Parser]     -- Parse and validate config options
       |
       v
  [Config Registry]          -- ETS-backed configuration store
       |
       v
  [StackConversation GenServer]  -- Apply config to running stack
       |                              |
       v                              v
  [Disk Persistence]         [ETS Frame Storage]
  (.claude/stack-conversation/)
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Configuration Parser** | Validates configuration keys and values against the config schema | `PrismaticClaude.StackConversation.Config` |
| **Config Registry** | Stores active configuration in ETS for fast access | ETS table `:stack_config` |
| **StackConversation GenServer** | The core OTP process managing conversation frames | `PrismaticClaude.StackConversation` (1,128 lines) |
| **Disk Persistence** | Persists configuration to disk for cross-session consistency | JSON files in `.claude/stack-conversation/` |
| **Telemetry Integration** | Emits configuration change events | `:prismatic_claude, :stack_conversation, :config_changed` |

## Usage

### View Current Configuration

```bash
# Display all current stack configuration settings
/stack-config show

# Display a specific configuration key
/stack-config get persistence.mode

# Display configuration with defaults and descriptions
/stack-config show --verbose
```

### Modify Configuration

```bash
# Set persistence mode (memory, disk, or both)
/stack-config set persistence.mode disk

# Set maximum stack depth
/stack-config set stack.max_depth 100

# Set auto-checkpoint interval (frames between auto-checkpoints)
/stack-config set checkpoint.auto_interval 10

# Enable frame compression for large stacks
/stack-config set compression.enabled true

# Set metadata requirements for frames
/stack-config set frame.require_decisions true
```

### Configuration Profiles

```bash
# Apply a predefined configuration profile
/stack-config profile development
/stack-config profile production
/stack-config profile debugging

# Save current configuration as a named profile
/stack-config save-profile my-profile

# List available profiles
/stack-config profiles
```

### Reset and Export

```bash
# Reset all configuration to defaults
/stack-config reset

# Export configuration as JSON
/stack-config export > stack-config.json

# Import configuration from JSON
/stack-config import stack-config.json
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `show` | Action: `show`, `get`, `set`, `reset`, `profile`, `save-profile`, `profiles`, `export`, `import` |
| `key` | string | - | Configuration key (dot-notation, e.g., `persistence.mode`) |
| `value` | string | - | Configuration value for `set` action |
| `--verbose` | flag | false | Show descriptions and defaults for all settings |
| `--persist` | flag | true | Persist changes to disk (disable with `--no-persist`) |

### Configuration Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `persistence.mode` | enum | `both` | Where to store frames: `memory`, `disk`, `both` |
| `persistence.directory` | string | `.claude/stack-conversation/` | Disk persistence directory |
| `stack.max_depth` | integer | `500` | Maximum number of frames in the stack |
| `stack.overflow_policy` | enum | `compress_oldest` | What to do when max depth is reached: `compress_oldest`, `error`, `drop_oldest` |
| `checkpoint.auto_interval` | integer | `0` (disabled) | Auto-checkpoint every N frames |
| `checkpoint.auto_name_format` | string | `auto-{n}` | Naming format for auto-checkpoints |
| `compression.enabled` | boolean | `false` | Enable frame compression for old frames |
| `compression.threshold` | integer | `50` | Compress frames older than N positions from top |
| `frame.require_decisions` | boolean | `false` | Require key decisions in every frame |
| `frame.require_assumptions` | boolean | `false` | Require key assumptions in every frame |
| `frame.max_summary_length` | integer | `500` | Maximum characters for frame summaries |
| `telemetry.enabled` | boolean | `true` | Emit telemetry events for stack operations |
| `telemetry.detail_level` | enum | `standard` | Telemetry detail: `minimal`, `standard`, `verbose` |

## Execution Flow

1. **Action Parsing** -- Parse the command action and arguments. Validate that the action is recognized and required parameters are present.

2. **For `show`/`get` actions** -- Read current configuration from the Config Registry (ETS). If `--verbose`, merge with the default configuration schema to include descriptions and type information.

3. **For `set` action** -- Validate the key against the configuration schema. Validate the value against the key's type constraint. Apply the change to the ETS config registry. Notify the StackConversation GenServer of the configuration change via a `cast`. If `--persist` is enabled (default), write the updated configuration to disk.

4. **For `profile` action** -- Load the named profile from the profiles directory. Validate all configuration values in the profile. Apply all settings atomically (all succeed or all roll back).

5. **For `reset` action** -- Restore all configuration keys to their default values. Clear any persisted configuration. Notify the GenServer to reinitialize with defaults.

6. **For `export`/`import` actions** -- Serialize/deserialize the configuration as JSON. On import, validate all keys and values before applying.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [StackConversation GenServer](/apps/prismatic-claude/) | Configuration Target | Receives config changes and adjusts behavior |
| [/stack](/commands/stack/) | Behavioral Impact | Stack display respects configured summary lengths and compression |
| [/frame](/commands/frame/) | Behavioral Impact | Frame inspection reflects configured metadata requirements |
| [/checkpoint](/commands/checkpoint/) | Behavioral Impact | Auto-checkpoint behavior controlled by config |
| [Session Lifecycle](/apps/prismatic-claude/) | Hook | Config can be auto-loaded at session start |
| [Telemetry](/glossary/telemetry/) | Observability | Configuration changes emitted as telemetry events |

## Best Practices

**Profile-Based Configuration**: Use configuration profiles rather than individual `set` commands. Profiles ensure consistent configuration across team members and prevent half-applied settings.

**Auto-Checkpoint for Long Sessions**: Enable auto-checkpointing (`checkpoint.auto_interval 10`) for sessions expected to span 20+ frames. This provides recovery points without manual intervention.

**Compression for Deep Stacks**: Enable compression for sessions that regularly exceed 50 frames. Compressed frames retain key decisions and summaries but discard verbose intermediate content, keeping the stack navigable.

**Persistence Mode Selection**: Use `both` (default) for normal development. Use `memory` only for disposable exploratory sessions. Use `disk` when debugging persistence issues.

**Telemetry in Production**: Keep telemetry enabled in production. Stack operation metrics help diagnose conversation flow issues and identify patterns in session structure.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Invalid configuration key | Display available keys with `--verbose` | Use valid key from the configuration schema |
| Invalid value for key type | Display expected type and valid values | Provide value matching the expected type |
| Profile not found | List available profiles | Use `profiles` action to discover available profiles |
| Disk persistence failure | Apply in-memory only, warn about persistence | Fix disk permissions or path |
| Import file invalid | Display validation errors, reject import | Fix the JSON file and retry |
| GenServer not running | Start StackConversation if application is running | Verify PrismaticClaude application is started |

## Advanced Usage

### Programmatic Configuration

```elixir
# Configure from Elixir code
PrismaticClaude.StackConversation.configure(%{
  persistence: %{mode: :both},
  stack: %{max_depth: 200},
  checkpoint: %{auto_interval: 10}
})

# Read configuration programmatically
config = PrismaticClaude.StackConversation.get_config()
```

### Environment-Specific Configuration

```bash
# Development: relaxed settings, verbose telemetry
/stack-config profile development

# Production: strict settings, minimal telemetry
/stack-config profile production

# Debugging: maximum verbosity, all metadata required
/stack-config profile debugging
```

### Configuration Audit

```bash
# Show configuration diff from defaults
/stack-config show --diff-defaults

# Show configuration change history
/stack-config history

# Validate current configuration integrity
/stack-config validate
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Stack configuration changes are validated before application. Invalid configurations are rejected, not silently degraded. Configuration profiles must be complete -- partial profiles that could leave the system in an inconsistent state are rejected.
- **NO DOUBTS**: Configuration state is always queryable through `show` and `get`. The current active configuration is deterministic -- it comes from the explicit configuration registry, not from ambient or implicit sources. Every configuration change is logged to telemetry, providing an audit trail.

The Stack-Based Conversation Mode is a P0 ABSOLUTE enforcement protocol. Configuration changes can adjust behavior within the protocol's boundaries but cannot disable core protocol requirements (frame immutability, stack-only context, no cross-branch merging).

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current conversation frame with a named checkpoint
- [/stack-mode](/commands/stack-mode/) - Stack-based conversation mode control for frame management and branching
- [/stack-utils](/commands/stack-utils/) - Advanced Stack Mode utility commands for maintenance and debugging

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)