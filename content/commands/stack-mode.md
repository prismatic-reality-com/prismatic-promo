+++
title = "/stack-mode"
weight = 1060
[extra]
category = "Stack Mode"
description = "Stack-based conversation mode control for frame management and branching"
syntax = "/stack-mode [options]"
authority = "L2+"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1126
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stack-mode", "Stack-based", "commands", "Stack Mode", "Prismatic Platform", "Stack", "Create"]
tags = ["commands", "stack-mode", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/stack-mode - Prismatic Platform"
+++

## Overview

**/stack-mode** is a production command in the **Stack Mode** category of the Prismatic Platform that controls the stack-based conversation mode for frame management and branching. This command serves as the master control interface for the Stack-Based Conversation Mode protocol, allowing operators to enable, disable, inspect, and modify the fundamental behavior of how conversation state is tracked across interactions.

The Stack-Based Conversation Mode is one of the platform's most distinctive architectural features. Rather than treating conversation history as a flat sequence of messages, it models interactions as a stack data structure where each frame represents a complete interaction unit (user input, assistant output, decisions, assumptions). This structure enables powerful operations: reverting to a previous state by popping frames, exploring alternative paths by forking from a specific frame, and marking important states with named checkpoints for later recall.

This command operates under the **L2+** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The protocol is classified as P0 ABSOLUTE enforcement, meaning it governs all Claude sessions without exception. The `/stack-mode` command provides the operational controls for working within this protocol.

The underlying implementation is a full OTP-compliant GenServer (`PrismaticClaude.StackConversation`, 1,128 lines) backed by ETS for high-performance frame storage and disk persistence in `.claude/stack-conversation/` for cross-session recovery. The system emits telemetry events at `:prismatic_claude, :stack_conversation, *` for observability, and supports the complete set of six stack control commands: `/stack`, `/frame N`, `/pop N`, `/fork N`, `/checkpoint <name>`, and `/goto <name>`.

## Architecture

The stack mode system implements a complete conversation state machine with support for linear progression, branching, and state restoration.

```
                    [Checkpoint: "feature-start"]
                           |
   Frame 0 --> Frame 1 --> Frame 2 --> Frame 3 --> Frame 4 (HEAD)
                              |
                              +---> Frame 2a --> Frame 2b (BRANCH)
                                    [Fork from Frame 2]
```

| Concept | Description | Operations |
|---------|-------------|------------|
| **Frame** | Immutable record of a single interaction turn | Create (automatic), Read (`/frame N`) |
| **Stack** | Ordered sequence of frames representing conversation state | View (`/stack`), Modify (`/pop`, `/fork`) |
| **Checkpoint** | Named marker on a specific frame for later recall | Create (`/checkpoint`), Restore (`/goto`) |
| **Branch** | Alternative conversation path forked from a specific frame | Create (`/fork`), tracked independently |
| **HEAD** | The topmost frame in the current stack | Always the most recent interaction |

### State Machine

```
             INITIALIZED
                 |
                 v
    +------> ACTIVE <--------+
    |            |            |
    |    [push frame]         |
    |            |       [/goto name]
    |            v            |
    |      FRAME_ADDED -------+
    |            |
    |     [/pop N]  [/fork N]
    |       |           |
    |       v           v
    |   POPPED      FORKED
    |       |           |
    +-------+-----------+
```

## Usage

### Mode Control

```bash
# Display current stack mode status
/stack-mode status

# Enable stack mode (usually enabled by default)
/stack-mode enable

# Disable stack mode for current session (not recommended)
/stack-mode disable

# Reset stack mode to initial state (clears all frames)
/stack-mode reset
```

### Frame Management

```bash
# Display the current frame (HEAD)
/stack-mode current

# Display frame count and stack depth
/stack-mode depth

# List all checkpoints in the current stack
/stack-mode checkpoints

# List all branches from the current stack
/stack-mode branches
```

### Branching Operations

```bash
# Create a named branch from frame 5
/stack-mode branch create "experiment" --from 5

# Switch to a named branch
/stack-mode branch switch "experiment"

# List all branches
/stack-mode branch list

# Delete a branch (DESTRUCTIVE)
/stack-mode branch delete "experiment"
```

### State Inspection

```bash
# Show stack mode configuration
/stack-mode config

# Show stack statistics (frame count, branch count, checkpoint count)
/stack-mode stats

# Verify stack integrity (check for corruption)
/stack-mode verify

# Export current stack as JSON
/stack-mode export > stack-state.json
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `status` | Action: `status`, `enable`, `disable`, `reset`, `current`, `depth`, `checkpoints`, `branches`, `branch`, `config`, `stats`, `verify`, `export` |
| `--from` | integer | HEAD | Frame ID for branch creation |
| `--force` | flag | false | Force destructive operations without confirmation |
| `--verbose` | flag | false | Show detailed information including frame contents |
| `--format` | string | `text` | Output format: `text`, `json`, `markdown` |
| `--include-compressed` | flag | false | Include compressed frames in output |

## Execution Flow

1. **Mode Status Check** -- Verify the StackConversation GenServer is running and responsive. If not running, provide diagnostic information about how to start the PrismaticClaude application.

2. **Action Dispatch** -- Route to the appropriate handler based on the specified action.

3. **For `status`** -- Query the GenServer for current state: enabled/disabled, frame count, current HEAD frame ID, active checkpoints, active branches. Display formatted summary.

4. **For `enable`/`disable`** -- Toggle the stack mode flag in the GenServer state. When disabling, warn that frames will not be created for subsequent interactions (not recommended in production). When enabling, initialize Frame 0 if no frames exist.

5. **For `reset`** -- Clear all frames, checkpoints, and branches from the current stack. This is a destructive operation that requires confirmation unless `--force` is specified. Create a backup of the current state before resetting.

6. **For `branch` operations** -- Manage named branches. Creating a branch copies the stack up to the specified frame and creates a new independent stack. Switching branches saves the current stack and loads the target branch. Branch operations are logged to telemetry for audit purposes.

7. **For `verify`** -- Check stack integrity by validating frame ordering, checkpoint references, and branch consistency. Report any inconsistencies found.

8. **For `export`** -- Serialize the complete stack state (frames, checkpoints, branches, configuration) as JSON for external analysis or backup.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [StackConversation GenServer](/apps/prismatic-claude/) | Core | Direct GenServer interaction for all operations |
| [/stack](/commands/stack/) | Display | Displays the stack managed by this mode |
| [/frame](/commands/frame/) | Inspection | Inspects individual frames in the managed stack |
| [/pop](/commands/pop/) | Modification | Pops frames from the managed stack |
| [/fork](/commands/fork/) | Branching | Creates forks in the managed stack |
| [/checkpoint](/commands/checkpoint/) | Checkpointing | Creates checkpoints on the managed stack |
| [/goto](/commands/goto/) | Restoration | Restores stack to a checkpoint state |
| [/stack-config](/commands/stack-config/) | Configuration | Configures behavior of the managed stack |
| [/stack-utils](/commands/stack-utils/) | Maintenance | Utility operations on the managed stack |
| [Session Lifecycle](/apps/prismatic-claude/) | Lifecycle | Stack mode initializes on session start, persists on session end |

## Best Practices

**Always Verify After Destructive Operations**: After `reset`, `pop`, or `fork` operations, use `/stack-mode verify` to confirm stack integrity. These operations modify the fundamental conversation state and any inconsistency can propagate to subsequent interactions.

**Named Branches for Experiments**: When exploring alternative approaches (different architectural designs, alternative implementations), create a named branch rather than working inline. This preserves the ability to return to the original path if the experiment does not succeed.

**Regular Checkpoints**: Create checkpoints at meaningful milestones: after completing a feature, before starting a risky operation, or when the conversation reaches a stable state worth preserving. Checkpoints cost almost nothing but provide valuable recovery points.

**Monitor Stack Depth**: Very deep stacks (100+ frames) can become difficult to navigate and may indicate that the session should be compressed or split. Use `/stack-mode depth` periodically to monitor stack growth.

**Export Before Major Changes**: Before running `reset` or deleting branches, export the current state with `/stack-mode export`. This provides a recoverable backup independent of the stack system itself.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| GenServer not running | Display diagnostic information and startup instructions | Start PrismaticClaude application |
| Stack corruption detected | Report corruption details, suggest export and reset | Export what is recoverable, then reset |
| Branch name collision | Reject branch creation, list existing branches | Choose a different branch name |
| Frame ID out of range | Report valid frame range, reject operation | Use `/stack-mode depth` to find valid range |
| Disk persistence failure | Continue with in-memory state, warn about persistence | Fix disk permissions, retry persistence |
| Concurrent modification | Use GenServer serialization to prevent race conditions | Retry the operation |

## Advanced Usage

### Stack Visualization

```bash
# Generate ASCII visualization of stack and branches
/stack-mode visualize

# Example output:
# Frame 0 [init]
# |
# Frame 1
# |
# Frame 2 [checkpoint: "baseline"]
# |\
# | Frame 2a [branch: "experiment"]
# | |
# | Frame 2b
# |
# Frame 3
# |
# Frame 4 [HEAD]
```

### Stack Diffing

```bash
# Compare two frames
/stack-mode diff 3 7

# Compare current HEAD with a checkpoint
/stack-mode diff checkpoint:baseline HEAD

# Compare two branches
/stack-mode diff branch:main branch:experiment
```

### Programmatic Access

```elixir
# Access stack mode from Elixir code
{:ok, status} = PrismaticClaude.StackConversation.status()
{:ok, frame} = PrismaticClaude.StackConversation.get_frame(5)
{:ok, stack} = PrismaticClaude.StackConversation.get_stack()
:ok = PrismaticClaude.StackConversation.checkpoint("milestone-1")
{:ok, _} = PrismaticClaude.StackConversation.fork(3, "experiment")
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Stack mode enforcement is P0 ABSOLUTE. The behavioral rules are non-negotiable: frame immutability (once created, frames cannot be modified), stack-only context (active state defined only by current stack), no cross-branch merging (never merge knowledge across branches), and explicit state dependencies (if a request depends on a popped frame, explicitly state that the information is no longer available).
- **NO DOUBTS**: Stack state is always deterministic and inspectable. The `status`, `verify`, and `stats` actions provide complete visibility into the current conversation state. Export capability ensures that stack state can be independently verified. Telemetry events provide audit trails for all state-modifying operations.

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current conversation frame with a named checkpoint
- [/goto](/commands/goto/) - Restore conversation to a named checkpoint
- [/stack-config](/commands/stack-config/) - Advanced Stack Mode configuration and customization commands
- [/stack-utils](/commands/stack-utils/) - Advanced Stack Mode utility commands for maintenance and debugging

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)