+++
title = "/checkpoint"
weight = 1030
[extra]
category = "Stack Mode"
description = "Create named restore point in conversation"
syntax = "/checkpoint [options]"
authority = "Persistent"
agent = "stack-conversation-manager"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1132
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["checkpoint", "Create", "commands", "Stack Mode", "Prismatic Platform", "Checkpoints"]
tags = ["commands", "stack-mode", "checkpoint", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/checkpoint - Prismatic Platform"
+++

## Overview

**/checkpoint** is a production command in the **Stack Mode** category of the Prismatic Platform that creates named restore points within the stack-based conversation model. Checkpoints provide persistent bookmarks in the conversation stack, enabling operators to return to known-good states after exploratory work, failed experiments, or branching investigations. This mechanism is fundamental to the platform's approach to non-destructive conversation management, where every interaction frame is immutable and context state is controlled through explicit stack operations.

This command operates under the **Persistent** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The persistent authority level means checkpoint data survives session boundaries and is available across multiple interactions with the platform.

The stack-based conversation model treats every assistant response as an immutable frame pushed onto a conversation stack. Unlike traditional chat interfaces where context grows linearly and cannot be unwound, the stack model gives operators precise control over what context is active at any given moment. The `/checkpoint` command is the primary mechanism for marking frames that represent significant milestones, stable states, or decision points worth preserving.

## Architecture

The checkpoint system is implemented as an extension of the `StackConversation` GenServer, which manages the conversation stack as an OTP-compliant stateful process backed by ETS storage with disk persistence.

### Storage Architecture

Checkpoints are stored as named references to specific frame indices within the conversation stack. Each checkpoint record contains the checkpoint name, the target frame index, a timestamp, and optional metadata describing the purpose of the checkpoint.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **GenServer** | OTP Process | State management and concurrency control |
| **ETS Table** | In-memory storage | Fast checkpoint lookup by name |
| **Disk Persistence** | `.claude/stack-conversation/` | Cross-session survival |
| **Telemetry** | `:prismatic_claude` events | Checkpoint creation and usage tracking |

### Frame Immutability Contract

A critical architectural property is that checkpoints reference immutable frames. When a checkpoint is created, the referenced frame can never be modified. This means restoring a checkpoint via [/goto](@/commands/goto.md) always returns to an identical state, regardless of what operations occurred between checkpoint creation and restoration.

```
Frame 0 (init) -> Frame 1 -> Frame 2 -> [CHECKPOINT: "stable"] -> Frame 3 -> Frame 4
                                              ^
                                              |
                                    /goto "stable" returns here
```

### Process Topology

```
PrismaticClaude.Supervisor
  |
  +-- StackConversation (GenServer)
  |     |-- Stack State (frames list)
  |     |-- Checkpoint Registry (name -> frame_id map)
  |     +-- Persistence Worker (async disk writes)
  |
  +-- SessionLifecycle (GenServer)
        |-- Hook Registry
        +-- Circuit Breaker
```

## Usage

```bash
# Create a checkpoint at the current frame
/checkpoint pre-refactor

# Create a checkpoint with descriptive metadata
/checkpoint stable-state --note="All tests passing, quality gates green"

# Create a checkpoint before risky operations
/checkpoint before-experiment

# List all existing checkpoints
/checkpoint --list

# View details of a specific checkpoint
/checkpoint --info=stable-state

# Delete a checkpoint that is no longer needed
/checkpoint --delete=old-checkpoint

# Create a checkpoint and display the current stack
/checkpoint milestone-1 --show-stack
```

### Typical Workflow

```bash
# 1. Reach a stable state after successful work
/checkpoint stable-v1

# 2. Begin experimental exploration
/code --experimental --target=new-feature

# 3. Experiment fails or produces unwanted results
/goto stable-v1  # Restore to checkpoint

# 4. Try a different approach from the same stable point
/code --alternative --target=new-feature

# 5. New approach succeeds, create new checkpoint
/checkpoint stable-v2
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | required | Unique name for the checkpoint (positional argument) |
| `--note` | string | none | Descriptive note explaining the checkpoint purpose |
| `--list` | flag | false | List all existing checkpoints with frame indices |
| `--info` | string | none | Display detailed information about a named checkpoint |
| `--delete` | string | none | Remove a checkpoint by name (does not affect frames) |
| `--show-stack` | flag | false | Display the full stack after creating the checkpoint |
| `--force` | flag | false | Overwrite existing checkpoint with the same name |
| `--format` | string | text | Output format: text, json |

## Execution Flow

The checkpoint creation process follows a precise sequence that ensures atomicity and persistence.

1. **Name Validation**: The checkpoint name is validated for uniqueness (unless `--force` is specified) and format compliance. Names must be alphanumeric with hyphens and underscores, between 1 and 64 characters.

2. **Current Frame Resolution**: The StackConversation GenServer resolves the current top-of-stack frame index. This is the frame that the checkpoint will reference.

3. **Checkpoint Record Creation**: A checkpoint record is constructed containing the name, frame index, creation timestamp, operator identity, and optional note metadata.

4. **ETS Registration**: The checkpoint record is atomically inserted into the ETS-backed checkpoint registry. If `--force` is specified and a checkpoint with the same name exists, it is replaced.

5. **Disk Persistence**: The checkpoint registry is asynchronously persisted to disk at `.claude/stack-conversation/checkpoints.json` to ensure survival across session boundaries.

6. **Telemetry Emission**: A `[:prismatic_claude, :stack_conversation, :checkpoint_created]` telemetry event is emitted with the checkpoint name and frame index.

7. **Confirmation Output**: The operator receives confirmation of the checkpoint creation with the name and frame reference.

```
Name Validation -> Frame Resolution -> Record Creation -> ETS Registration
                                                               |
                                                               v
                                              Disk Persistence (async)
                                                               |
                                                               v
                                              Telemetry Event -> Confirmation
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `stack-conversation-manager` | Agent manages all stack operations |
| [StackConversation GenServer](@/glossary/otp.md) | Core state management | 1,128-line OTP implementation |
| [/goto](@/commands/goto.md) | Checkpoint restoration | Restores stack to checkpointed frame |
| [/stack](@/commands/stack.md) | Stack visualization | Displays checkpoints alongside frames |
| [/pop](@/commands/pop.md) | Destructive stack operation | Checkpoints survive pop operations on later frames |
| [/fork](@/commands/fork.md) | Branch creation | Checkpoints can serve as fork points |
| [Session Lifecycle](@/glossary/session-discipline.md) | Cross-session persistence | Checkpoints persist via disk storage |
| [AIAD Registry](@/glossary/aiad.md) | Command specification | Checkpoint command registered in AIAD |
| [Telemetry](@/glossary/telemetry.md) | Event tracking | All checkpoint operations emit telemetry |

## Best Practices

**Name checkpoints descriptively.** Use names that convey the state they represent, not just sequential numbers. Names like `pre-refactor`, `tests-passing`, or `feature-x-complete` are far more useful than `cp1`, `cp2`, `cp3` when reviewing checkpoint history weeks later.

**Checkpoint before destructive operations.** Always create a checkpoint before running [/pop](@/commands/pop.md), [/fork](@/commands/fork.md), or any experimental work that might produce undesirable results. The cost of creating a checkpoint is negligible compared to the cost of losing a valuable conversation state.

**Clean up stale checkpoints.** Periodically review and delete checkpoints that are no longer relevant. While checkpoints are lightweight, an accumulation of dozens of stale checkpoints makes the `--list` output noisy and reduces the utility of the checkpoint system.

**Use notes for context.** The `--note` option is invaluable for explaining why a checkpoint was created. A note like "All 121 tests passing, Credo clean, ready for architecture change" provides essential context when deciding whether to restore to that checkpoint.

**One checkpoint per decision point.** Create checkpoints at natural decision boundaries rather than at arbitrary intervals. Decision points include: before starting a new approach, after achieving a stable state, or before making irreversible configuration changes.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `checkpoint_name_exists` | Checkpoint name already in use | Use `--force` to overwrite or choose a different name |
| `invalid_checkpoint_name` | Name contains invalid characters | Use alphanumeric characters, hyphens, and underscores only |
| `empty_stack` | No frames exist to checkpoint | Execute at least one interaction before checkpointing |
| `persistence_failure` | Disk write failed | Check filesystem permissions at `.claude/stack-conversation/` |
| `checkpoint_not_found` | Referenced checkpoint does not exist | Use `--list` to view available checkpoints |
| `ets_table_unavailable` | StackConversation process not running | Ensure PrismaticClaude application is started |

When a checkpoint operation fails, the system returns a structured `{:error, reason}` tuple with a descriptive message. The ETS-backed storage ensures that checkpoint operations are atomic; a failed write does not leave the registry in an inconsistent state.

## Advanced Usage

### Checkpoint-Based Workflow Patterns

**Exploration-and-return pattern**: Create a checkpoint, explore multiple approaches, and return to the checkpoint to pursue the best option.

```bash
/checkpoint exploration-base
# Try approach A
/code --approach=A
# Evaluate results, then return
/goto exploration-base
# Try approach B
/code --approach=B
# Evaluate, keep the better approach
```

**Progressive checkpointing**: Create a series of checkpoints as you make incremental progress, providing fine-grained rollback granularity.

```bash
/checkpoint step-1-schema-done
# ... work ...
/checkpoint step-2-queries-done
# ... work ...
/checkpoint step-3-tests-done
```

### Programmatic Checkpoint Access

The StackConversation GenServer exposes checkpoint operations as public API functions for programmatic use within Elixir code.

```elixir
# Create a checkpoint
StackConversation.checkpoint("my-checkpoint", note: "Stable state")

# List all checkpoints
{:ok, checkpoints} = StackConversation.list_checkpoints()

# Restore to a checkpoint
StackConversation.goto("my-checkpoint")

# Delete a checkpoint
StackConversation.delete_checkpoint("my-checkpoint")
```

### Checkpoint Export and Import

Checkpoints can be exported for sharing between sessions or operators.

```bash
# Export checkpoints to file
/checkpoint --export=checkpoints-backup.json

# Import checkpoints from file
/checkpoint --import=checkpoints-backup.json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Checkpoint creation either succeeds atomically or fails entirely with no partial state.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Checkpoint restoration provides identical state every time due to frame immutability guarantees.

## Related Commands

- [/stack](@/commands/stack.md) - Display complete conversation stack with all frames
- [/frame](@/commands/frame.md) - Inspect specific conversation frame by ID
- [/pop](@/commands/pop.md) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](@/commands/fork.md) - Branch conversation from a specific frame
- [/goto](@/commands/goto.md) - Restore conversation to a named checkpoint
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)