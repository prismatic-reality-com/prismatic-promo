+++
title = "/fork"
weight = 1020
[extra]
category = "Stack Mode"
description = "Branch conversation from specific frame (DESTRUCTIVE)"
syntax = "/fork [options]"
authority = "DESTRUCTIVE"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1188
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["fork", "Branch", "DESTRUCTIVE", "commands", "Stack Mode", "Prismatic Platform", "NABLA"]
tags = ["commands", "stack-mode", "fork", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/fork - Prismatic Platform"
+++

## Overview

**/fork** is a production command in the **Stack Mode** category of the Prismatic Platform that branches a conversation from a specific frame, creating a new conversational timeline. This is a **DESTRUCTIVE** operation: all frames above the fork point are removed from the active stack, and the conversation continues from the forked frame as its new base. The original frames are not recoverable through normal stack operations once the fork is executed.

The command operates under the **DESTRUCTIVE** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The DESTRUCTIVE classification means that `/fork` requires explicit confirmation before execution and is logged to the immutable audit trail for accountability.

Stack-based conversation mode is a foundational protocol in the Prismatic Platform that treats every Claude interaction as a sequence of immutable frames. Each frame captures user input, assistant output, key assumptions, and key decisions. The `/fork` command enables operators to explore alternative decision paths without losing the ability to reason about what was tried and why. When a conversation reaches a dead end or an incorrect assumption is discovered mid-session, `/fork` allows the operator to rewind to a known-good state and proceed with corrected context.

This capability is particularly valuable in complex debugging sessions, architectural exploration, and multi-hypothesis investigations where the [NABLA](@/glossary/nabla-infinity.md) framework's signal plurality axiom demands that multiple approaches be considered before converging on a solution. By forking from an earlier frame, the operator preserves the epistemic integrity of each exploration branch.

## Architecture

The `/fork` command operates on the Stack Conversation GenServer, an OTP-compliant process that manages conversational state through ETS-backed storage with disk persistence.

```
Active Stack: [Frame 0] -> [Frame 1] -> [Frame 2] -> [Frame 3] -> [Frame 4]
                                |
                           /fork 1
                                |
                                v
New Stack:    [Frame 0] -> [Frame 1] -> [Frame 5 (new)]
Orphaned:                               [Frame 2] [Frame 3] [Frame 4]
```

### Internal Components

| Component | Module | Responsibility |
|-----------|--------|---------------|
| **Stack GenServer** | `PrismaticClaude.StackConversation` | State management, frame storage, fork execution |
| **Frame Storage** | ETS + disk persistence | Immutable frame records in `.claude/stack-conversation/` |
| **Audit Logger** | `PrismaticClaude.AuditLogger` | Records all destructive operations with timestamps |
| **Telemetry Emitter** | `:prismatic_claude` | Emits `[:prismatic_claude, :stack_conversation, :fork]` events |

The GenServer maintains a list of frame IDs representing the active stack. When `/fork N` is invoked, the GenServer truncates the list to frames 0 through N, creates a new frame N+1 as the fork point, and archives the orphaned frames to disk. The new frame includes metadata indicating it was created by a fork operation, including the original frame count and the fork source.

## Usage

### Basic Usage

```bash
# Fork from frame 3 (removes frames 4, 5, ... from active stack)
/fork 3

# Fork from the very first frame (restart conversation with original context)
/fork 0

# Fork from the most recent checkpoint
/fork checkpoint:architecture-decision
```

### Fork with Context

```bash
# Fork and provide new direction
/fork 2 "Let's try a different approach to the storage layer"

# Fork with explicit hypothesis labeling
/fork 1 --hypothesis "Performance bottleneck is in the query layer, not the cache"

# Fork and immediately apply a different strategy
/fork 3 --strategy "top-down instead of bottom-up"
```

### Checkpoint-Based Forking

```bash
# Create a checkpoint before risky exploration
/checkpoint pre-refactor

# ... explore risky path ...

# Fork back to checkpoint if the path fails
/fork checkpoint:pre-refactor
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `N` | integer | required | Frame number to fork from (0-indexed) |
| `--message` | string | none | Optional message describing why the fork was created |
| `--hypothesis` | string | none | Label the fork with a hypothesis for NABLA tracking |
| `--strategy` | string | none | Describe the new strategy being explored |
| `--confirm` | boolean | false | Skip confirmation prompt (use with caution) |
| `--archive` | boolean | true | Archive orphaned frames to disk before removal |
| `--dry-run` | boolean | false | Show what would be forked without executing |
| `checkpoint:NAME` | string | none | Fork from a named checkpoint instead of frame number |

## Execution Flow

1. **Validation**: The GenServer validates that the target frame number exists in the current stack. If frame N does not exist, the operation is rejected with `{:error, :frame_not_found}`.

2. **Confirmation**: Unless `--confirm` is specified, the command displays the frames that will be orphaned and requests explicit confirmation from the operator. This safeguard prevents accidental data loss.

3. **Archival**: If `--archive` is true (default), all frames above N are serialized to disk at `.claude/stack-conversation/archives/fork-{timestamp}/`. This provides a recovery mechanism outside the normal stack operations.

4. **Truncation**: The active stack is truncated to frames 0 through N. The GenServer updates its internal state atomically.

5. **New Frame Creation**: A new frame N+1 is created with fork metadata, including the fork message, hypothesis, and strategy if provided. This frame becomes the active tip of the stack.

6. **Telemetry Emission**: The GenServer emits `[:prismatic_claude, :stack_conversation, :fork]` with metadata including the fork point, number of orphaned frames, and the fork reason.

7. **Audit Logging**: The destructive operation is recorded in the immutable audit trail with the operator identity, timestamp, fork point, and orphaned frame IDs.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| Stack GenServer | Core | Direct GenServer call to `StackConversation.fork/2` |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Managed by `stack-conversation-manager` agent |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Epistemic | Fork metadata supports signal plurality and hypothesis tracking |
| [Telemetry](@/glossary/telemetry.md) | Observability | Fork events tracked for session analysis |
| Session Context | Persistence | Fork operations are recorded in session context for cross-session continuity |
| [Quality DNA](@/glossary/quality-dna.md) | Continuity | Fork decisions contribute to quality DNA evolution tracking |

## Best Practices

**Always create a checkpoint before exploratory work.** Use [/checkpoint](@/commands/checkpoint.md) to mark known-good states before venturing into risky territory. This makes fork operations more precise and reduces the risk of losing valuable context.

**Use hypothesis labels for NABLA compliance.** When forking to explore an alternative approach, label the fork with a clear hypothesis using `--hypothesis`. This supports the NABLA framework's requirement for traceable reasoning and makes it possible to evaluate which exploration path yielded the most productive results.

**Prefer fork over starting a new session.** When a conversation goes off track, `/fork` is preferable to starting a new session because it preserves the foundational context (frames 0 through N) that was established at the beginning of the conversation. Starting fresh loses this context entirely.

**Review the dry-run output before executing.** For conversations with many frames, use `--dry-run` first to understand exactly what will be orphaned. This is especially important when frames contain key decisions or assumptions that may be needed later.

**Do not fork in automated pipelines.** The `/fork` command is designed for interactive use. Automated pipelines should use deterministic branching strategies rather than conversation forking.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :frame_not_found}` | Target frame N does not exist in the active stack | Use [/stack](@/commands/stack.md) to view available frames |
| `{:error, :fork_at_tip}` | Attempting to fork from the current tip (no frames to remove) | Fork from an earlier frame or use [/pop](@/commands/pop.md) instead |
| `{:error, :confirmation_declined}` | Operator declined the confirmation prompt | Re-run with correct frame number or use `--dry-run` to preview |
| `{:error, :archive_failed}` | Unable to write orphaned frames to disk | Check disk space and permissions on `.claude/stack-conversation/archives/` |
| `{:error, :genserver_unavailable}` | Stack GenServer is not running | Ensure PrismaticClaude application is started |

All errors follow the `{:ok, result} | {:error, reason}` tuple pattern. Destructive operations are atomic: if any step fails, the entire fork is rolled back and the original stack remains intact.

## Advanced Usage

### Multi-Hypothesis Exploration

The `/fork` command supports structured hypothesis testing as part of the NABLA epistemic framework:

```bash
# Establish baseline
/checkpoint baseline-investigation

# Explore hypothesis A
# ... work on hypothesis A ...
/checkpoint hypothesis-a-result

# Fork back to baseline and try hypothesis B
/fork checkpoint:baseline-investigation
# ... work on hypothesis B ...
/checkpoint hypothesis-b-result

# Compare results across hypotheses
/frame checkpoint:hypothesis-a-result
/frame checkpoint:hypothesis-b-result
```

### Recovery from Archived Forks

While orphaned frames are removed from the active stack, archived frames can be inspected manually:

```bash
# List archived fork points
ls .claude/stack-conversation/archives/

# Inspect specific archived frame
cat .claude/stack-conversation/archives/fork-2026-02-15T10-30-00/frame-4.json
```

### Fork Telemetry Analysis

Fork patterns across sessions can reveal insights about decision-making quality:

```elixir
# Query fork telemetry events
PrismaticClaude.Telemetry.query(
  event: [:prismatic_claude, :stack_conversation, :fork],
  since: ~U[2026-02-01 00:00:00Z]
)
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Fork operations are atomic -- they either complete fully or roll back entirely. No partial state corruption is permitted.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The confirmation prompt and `--dry-run` option ensure that operators understand the consequences before executing a destructive operation.

The DESTRUCTIVE authority classification is the highest enforcement level for stack operations, reflecting the irreversible nature of frame removal from the active stack. The audit trail ensures full accountability for every fork operation.

## Related Commands

- [/stack](@/commands/stack.md) - Display complete conversation stack with all frames
- [/frame](@/commands/frame.md) - Inspect specific conversation frame by ID
- [/pop](@/commands/pop.md) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/checkpoint](@/commands/checkpoint.md) - Mark current frame with a named checkpoint for later reference
- [/goto](@/commands/goto.md) - Restore conversation to a named checkpoint
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)