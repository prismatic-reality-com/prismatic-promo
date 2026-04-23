+++
title = "/goto"
weight = 1040
[extra]
category = "Stack Mode"
description = "Restore conversation to named checkpoint"
syntax = "/goto [options]"
authority = "State Control"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1242
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["goto", "Restore", "commands", "Stack Mode", "Prismatic Platform", "Confirmation", "StackConversation GenServer"]
tags = ["commands", "stack-mode", "goto", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/goto - Prismatic Platform"
+++

## Overview

**/goto** is a production command in the **Stack Mode** category of the Prismatic Platform that restores the conversation state to a previously saved named checkpoint. The command is a critical component of the platform's stack-based conversation management system, enabling precise state navigation by allowing users to jump to any previously checkpointed frame in the conversation stack, effectively rewinding or branching the conversation to a known good state.

This command operates under the **State Control** authority level and is executed by the `stack-conversation-manager` agent. The State Control authority is a specialized permission tier that grants the ability to modify conversation state -- a capability that requires careful handling since state transitions affect the entire active context of the conversation. Unlike read-only commands that inspect state, `/goto` actively modifies the conversation stack by truncating frames above the target checkpoint and restoring the context that was active when the checkpoint was created. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The stack-based conversation model treats each conversation exchange as an immutable frame pushed onto a stack data structure. Frames capture the user input, assistant response, key assumptions, key decisions, and any state changes that occurred during that exchange. Checkpoints are named markers attached to specific frames, serving as bookmarks that enable rapid navigation to significant conversation states. The `/goto` command uses these checkpoints as navigation targets, providing a mechanism analogous to `git checkout` for conversation state.

This command is particularly valuable in long, complex development sessions where multiple exploration paths are attempted before settling on a final approach. By checkpointing before major decisions or experimental changes, developers can quickly revert to a known state without losing the ability to reference the exploration that occurred. The command enforces the platform's frame immutability principle -- frames that existed when the checkpoint was created remain unchanged; only frames added after the checkpoint target are affected.

## Architecture

```
/goto Command
    |
    +-- Checkpoint Resolver
    |       +-- Name Lookup (ETS-backed)
    |       +-- Frame ID Mapper
    |       +-- Ambiguity Detector
    |       +-- Validity Checker
    |
    +-- State Transition Engine
    |       +-- Frame Stack Manager
    |       +-- Context Restorer
    |       +-- Active State Calculator
    |       +-- Immutability Enforcer
    |
    +-- Safety Controller
    |       +-- Pre-transition Validation
    |       +-- Data Loss Warning Generator
    |       +-- Undo Buffer Manager
    |       +-- Audit Logger
    |
    +-- OTP Integration
            +-- StackConversation GenServer
            +-- ETS Table Manager
            +-- Disk Persistence Handler
            +-- Telemetry Emitter
```

The architecture is centered around the `StackConversation` GenServer (`apps/prismatic_claude/lib/prismatic_claude/stack_conversation.ex`), which maintains the authoritative state of the conversation stack. The GenServer provides atomic state transitions through OTP's message passing guarantees, ensuring that no concurrent operations can corrupt the stack during a goto operation. The ETS-backed checkpoint resolver provides O(1) lookup by checkpoint name, while the disk persistence handler ensures checkpoint data survives process restarts.

## Usage

### Basic Navigation

```bash
# Restore to a named checkpoint
/goto pre-refactor

# Restore to a checkpoint with spaces in the name
/goto "before database migration"

# List available checkpoints before navigating
/checkpoint --list
/goto my-checkpoint
```

### Navigation with Confirmation

```bash
# Navigate with explicit confirmation of frame loss
/goto pre-experiment --confirm

# Preview what frames would be lost
/goto pre-experiment --preview

# Navigate and log the transition reason
/goto pre-experiment --reason="Reverting experimental approach"
```

### Checkpoint Discovery

```bash
# List all available checkpoints with frame details
/goto --list

# Show checkpoint details without navigating
/goto --info=pre-refactor

# Find checkpoints matching a pattern
/goto --search="database"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `<name>` | string | required | Name of the checkpoint to navigate to |
| `--confirm` | flag | false | Skip confirmation prompt for frame loss |
| `--preview` | flag | false | Show frames that would be affected without navigating |
| `--reason` | string | none | Log reason for the state transition |
| `--list` | flag | false | List all available checkpoints |
| `--info` | string | none | Show details for a specific checkpoint without navigating |
| `--search` | string | none | Search checkpoints by name pattern |
| `--keep-history` | flag | false | Preserve popped frames in a separate branch for reference |
| `--force` | flag | false | Navigate even if target checkpoint has integrity warnings |

## Execution Flow

1. **Checkpoint Resolution**: Look up the specified checkpoint name in the ETS-backed checkpoint registry. Verify the checkpoint exists and is valid. If the name is ambiguous (multiple matches), prompt for clarification.

2. **Frame Identification**: Map the checkpoint to its corresponding frame ID in the conversation stack. Verify the frame still exists in the current stack (it may have been popped by a previous operation).

3. **Impact Assessment**: Calculate which frames would be affected by the goto operation. Count frames that would be removed from the active stack. Identify any decisions, assumptions, or state changes in those frames that would be lost.

4. **Data Loss Warning**: If frames would be removed, generate a warning describing the potential data loss. Include summaries of affected frame decisions and assumptions. In non-interactive mode, require `--confirm` flag to proceed.

5. **State Transition**: Execute the goto operation atomically through the StackConversation GenServer. Truncate the stack to the checkpoint frame. Restore the conversation context to the state that was active at the checkpoint. If `--keep-history` is set, save removed frames to a separate branch.

6. **Context Restoration**: Recalculate the active conversation context from the remaining stack frames. Update the session's working assumptions, active decisions, and state dependencies based on the restored stack.

7. **Audit Logging**: Log the state transition with the transition reason, affected frames, and resulting stack state. Emit [telemetry](/glossary/telemetry/) events for conversation state tracking.

8. **Confirmation**: Display the restored checkpoint information, new stack depth, and any context changes to the user.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `stack-conversation-manager` agent |
| StackConversation GenServer | State Management | Atomic state transitions via OTP GenServer calls |
| ETS Tables | Checkpoint Storage | O(1) checkpoint name lookup and frame data |
| Disk Persistence | Durability | Checkpoint data persisted to `.claude/stack-conversation/` |
| [Telemetry](/glossary/telemetry/) | Event Tracking | State transition events: `[:prismatic_claude, :stack_conversation, :goto]` |
| [/checkpoint](/commands/checkpoint/) | Checkpoint Creation | Creates the named checkpoints that `/goto` navigates to |
| [/stack](/commands/stack/) | Stack Inspection | Displays the full stack for context before navigation |
| [/frame](/commands/frame/) | Frame Inspection | Examines specific frames before deciding to navigate |
| [/pop](/commands/pop/) | Frame Removal | Alternative destructive operation for removing frames |
| [/fork](/commands/fork/) | Branch Creation | Creates new branches from specific frames |

## Best Practices

**Checkpoint Before Experiments**: Always create a checkpoint (`/checkpoint experiment-start`) before beginning experimental or exploratory work. This ensures a clean return point if the experiment does not produce desired results.

**Descriptive Names**: Use descriptive checkpoint names that capture the conversation state at the time of creation. Names like `pre-database-migration` or `after-api-design-complete` are more navigable than generic names like `checkpoint-1`.

**Preview Before Navigating**: Use `--preview` before executing a goto to understand the impact. This follows the NO DOUBTS principle of full investigation before action, ensuring you understand what context will be lost.

**Document Transition Reasons**: Always provide a `--reason` when navigating to a checkpoint. This creates an audit trail that explains why state was restored, which is valuable for understanding conversation history during reviews.

**Keep History for Complex Sessions**: Use `--keep-history` during complex development sessions to preserve popped frames in a separate branch. This allows you to reference previous exploration paths without polluting the active stack.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Checkpoint not found` | No checkpoint with the specified name | Use `/goto --list` to see available checkpoints |
| `Frame no longer in stack` | Target frame was previously popped | The checkpoint is orphaned; create a new checkpoint from current state |
| `Ambiguous checkpoint name` | Multiple checkpoints match | Provide the full checkpoint name or use `--info` to identify the correct one |
| `Stack integrity violation` | Corrupted frame data detected | Use `--force` to navigate despite integrity warnings |
| `Active operation in progress` | Another state-modifying command is running | Wait for the current operation to complete |
| `Confirmation required` | Frames would be lost without `--confirm` | Add `--confirm` flag or respond to the interactive prompt |

## Advanced Usage

### Branch-Based Navigation

```bash
# Navigate to checkpoint and keep removed frames as a branch
/goto pre-experiment --keep-history

# Later, review what was in the removed frames
/fork --list-branches

# Compare current state with the preserved branch
/goto --compare=pre-experiment
```

### Programmatic Integration

The `/goto` command's functionality is available programmatically through the StackConversation GenServer.

```elixir
# Programmatic goto via GenServer
{:ok, result} = PrismaticClaude.StackConversation.goto("pre-refactor")
# => {:ok, %{frame_id: 5, frames_removed: 3, checkpoint: "pre-refactor"}}

# List available checkpoints
{:ok, checkpoints} = PrismaticClaude.StackConversation.list_checkpoints()
# => {:ok, [%{name: "pre-refactor", frame_id: 5, created_at: ~U[...]}]}
```

### State Recovery Patterns

```bash
# Recovery pattern: checkpoint -> experiment -> evaluate -> goto if failed
/checkpoint before-optimization
# ... attempt optimization ...
# If optimization fails:
/goto before-optimization --reason="Optimization introduced regression"
```

## Doctrine Compliance

All state navigation operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: State transitions are atomic -- they either complete fully or not at all. There is no partial state restoration. The command enforces frame immutability: restored frames are identical to their state when originally created.
- **NO DOUBTS**: Every goto operation produces a clear audit trail including the source state, target state, affected frames, and transition reason. The `--preview` option enables full investigation before action. No state modification occurs without explicit user intent.

The command enforces the Stack-Based Conversation Mode Protocol's behavioral rules: frame immutability (frames cannot be modified), stack-only context (active state defined only by current stack), and explicit state dependencies (dependencies on popped frames are explicitly noted).

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch from frame N (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current frame with a named checkpoint
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)