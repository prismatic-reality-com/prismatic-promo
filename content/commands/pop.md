+++
title = "/pop"
weight = 1010
[extra]
category = "Stack Mode"
description = "Remove last N frames from conversation stack (DESTRUCTIVE)"
syntax = "/pop [options]"
authority = "DESTRUCTIVE"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1331
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pop", "Remove", "DESTRUCTIVE", "commands", "Stack Mode", "Prismatic Platform", "Phase", "Error"]
tags = ["commands", "stack-mode", "pop", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pop - Prismatic Platform"
+++

## Overview

**/pop** is a production command in the **Stack Mode** category of the Prismatic Platform that removes the last N frames from the active conversation stack. This is a **DESTRUCTIVE** operation -- once frames are popped, the context, decisions, and assumptions they contained are permanently removed from the active stack and cannot be referenced by subsequent interactions. The command is essential for managing conversation state in long-running sessions where earlier context has become irrelevant, incorrect, or counterproductive.

The Stack-Based Conversation Mode is a foundational protocol of the Prismatic Platform, enforced at P0 (absolute) level across all Claude interactions. Every response creates an immutable frame containing the user input summary, assistant output summary, key assumptions, and key decisions. The `/pop` command provides controlled regression within this stack, allowing operators to discard frames that represent dead-end explorations, incorrect assumptions, or superseded decisions without contaminating subsequent analysis.

This command operates under the **DESTRUCTIVE** authority level, the highest caution classification in the platform's authority hierarchy. It is executed by the `stack-conversation-manager` agent. The DESTRUCTIVE classification means that the command permanently alters conversation state in ways that cannot be undone through normal operations. This is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

Understanding when and how to use `/pop` is critical for effective conversation management. The command is not merely a convenience feature -- it is a fundamental tool for maintaining epistemic hygiene within the [NABLA](/glossary/nabla-infinity/) framework. Popping frames that contain flawed assumptions prevents those assumptions from propagating through subsequent reasoning, which is precisely the kind of "contradiction burial" that the NABLA axioms are designed to prevent. Used correctly, `/pop` strengthens the conversation's epistemic foundation by removing contaminated context.

## Architecture

The `/pop` command interfaces with the StackConversation GenServer, an OTP-compliant process that manages the immutable frame storage with ETS backing and disk persistence.

```
/pop N Command
      │
      v
StackConversation GenServer
      │
      ├── Frame Validation ──> Verify N frames exist
      │
      ├── Pre-Pop Snapshot ──> Archive popped frames
      │         │                  (disk persistence)
      │         v
      │    .claude/stack-conversation/
      │    archive/popped-{timestamp}.json
      │
      ├── Stack Mutation ────> Remove top N frames
      │         │
      │         v
      │    ETS Table Update
      │    (atomic operation)
      │
      ├── State Recalculation ──> Update active context
      │
      └── Telemetry Emission ──> [:prismatic_claude, :stack_conversation, :pop]
              │
              v
        Updated Stack State
        (new top frame becomes active context)
```

The GenServer implements the pop operation as an atomic transaction: either all N frames are removed or none are. This atomicity prevents partial stack corruption that could result from interrupted operations. Before frames are removed from the active stack, they are archived to disk persistence, providing a safety net for cases where frames were popped accidentally. However, archived frames are not automatically restored and require manual intervention to recover.

The ETS-backed storage provides O(1) frame access and O(N) pop operations where N is the number of frames being removed. The stack is implemented as a list with the most recent frame at the head, making pop operations efficient at the top of the stack.

## Usage

### Basic Pop Operations

```bash
# Remove the last frame from the stack
/pop 1

# Remove the last 3 frames
/pop 3

# Remove all frames except the initial frame
/pop all

# Preview what would be popped without executing
/pop 2 --dry-run
```

### Pop with Context Preservation

```bash
# Pop frames but save a summary of what was removed
/pop 3 --summarize

# Pop frames and create a checkpoint before popping
/pop 5 --checkpoint "before-refactor-revert"

# Pop and immediately fork from the new top
/pop 2 --then-fork
```

### Conditional Pop

```bash
# Pop frames that match a specific pattern
/pop --until-checkpoint "stable-state"

# Pop frames newer than a specific frame ID
/pop --after-frame 7

# Pop frames and verify the resulting stack state
/pop 3 --verify
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| (positional) | integer/all | 1 | Number of frames to pop, or "all" |
| `--dry-run` | flag | false | Preview pop without executing |
| `--summarize` | flag | false | Generate summary of popped content |
| `--checkpoint` | string | none | Create named checkpoint before pop |
| `--then-fork` | flag | false | Fork from new top after pop |
| `--until-checkpoint` | string | none | Pop until named checkpoint is reached |
| `--after-frame` | integer | none | Pop all frames after specified ID |
| `--verify` | flag | false | Verify stack integrity after pop |
| `--force` | flag | false | Skip confirmation for large pops (> 5 frames) |
| `--archive` | flag | true | Archive popped frames to disk |
| `--quiet` | flag | false | Suppress output except errors |

## Execution Flow

The pop operation follows a carefully sequenced pipeline to ensure data integrity and operator awareness.

**Phase 1 -- Validation** (< 10ms): The command validates that the requested number of frames exists on the stack. If the request exceeds the available frames (excluding Frame 0, which cannot be popped), an error is returned with the current stack depth. For `--until-checkpoint`, the checkpoint name is verified to exist in the stack.

**Phase 2 -- Confirmation** (interactive): For large pop operations (removing more than 5 frames), the command displays the frames that will be removed and requests explicit confirmation. This safety measure prevents accidental loss of significant conversation context. The `--force` flag bypasses this confirmation for automated workflows.

**Phase 3 -- Pre-Pop Archive** (< 100ms): Unless `--archive false` is specified, the frames to be removed are serialized to JSON and written to the disk persistence layer at `.claude/stack-conversation/archive/`. Each archive entry includes the full frame data, the timestamp of the pop operation, and the operator who initiated it.

**Phase 4 -- Atomic Stack Mutation** (< 10ms): The ETS table is updated in a single atomic operation that removes the specified frames. The GenServer handles this as a synchronous call to ensure consistency. No other stack operations can interleave with the pop.

**Phase 5 -- State Recalculation** (< 10ms): After the frames are removed, the active conversation context is recalculated based on the new top frame. This includes updating the active assumptions, decisions, and any accumulated context that downstream operations depend on.

**Phase 6 -- Telemetry and Reporting** (< 10ms): A telemetry event is emitted recording the pop operation details. The new stack state is displayed to the operator, showing the current top frame and the total remaining frame count.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| StackConversation GenServer | Direct API | `StackConversation.pop/1` function call |
| [/stack](/commands/stack/) | Complementary | View stack state before/after pop |
| [/frame](/commands/frame/) | Complementary | Inspect specific frames before popping |
| [/fork](/commands/fork/) | Complementary | Branch from specific frame as alternative to pop |
| [/checkpoint](/commands/checkpoint/) | Safety Net | Create named checkpoints before destructive ops |
| [/goto](/commands/goto/) | Alternative | Restore to checkpoint instead of popping |
| [Telemetry](/glossary/telemetry/) | Observability | Pop operation tracking and audit |
| [Prismatic Claude](/apps/prismatic-claude/) | Parent App | StackConversation supervision and lifecycle |

## Best Practices

**Always Preview Before Large Pops**: Use `/pop N --dry-run` before executing pops of more than 2-3 frames. This shows exactly what context will be lost and allows informed decision-making.

**Create Checkpoints Before Destructive Operations**: Before popping frames that represent significant work, use [/checkpoint](/commands/checkpoint/) to create a named restore point. While popped frames are archived, checkpoints provide a more accessible recovery mechanism.

**Pop Incrementally**: Rather than popping many frames at once, consider popping one or two at a time and verifying the resulting context. This incremental approach reduces the risk of accidentally removing valuable context.

**Use `/fork` Instead When Exploring Alternatives**: If the goal is to explore a different approach while preserving the current context, [/fork](/commands/fork/) is often more appropriate than `/pop`. Forking creates a new branch without destroying the original context.

**Pop to Clean Up Dead-End Explorations**: The most common and appropriate use of `/pop` is removing frames that represent explorations that proved unproductive. Leaving dead-end frames on the stack pollutes the active context with irrelevant or misleading information.

**Understand the Reconstruction Limits**: After popping, the platform cannot reconstruct the removed context. If a subsequent request depends on information from a popped frame, the platform will respond with "That information is no longer in the active stack" -- this is by design, not a bug.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Pop count exceeds stack depth | Error with current depth | Reduce pop count |
| Attempt to pop Frame 0 | Error (Frame 0 is immutable) | Pop fewer frames |
| Checkpoint not found | Error with available checkpoints | Use `/stack` to find correct name |
| Archive write failure | Warning, pop proceeds | Popped frames may not be recoverable |
| Concurrent stack modification | GenServer serialization prevents | Operations are atomic |
| ETS table unavailable | Error with diagnostic | Restart StackConversation GenServer |

## Advanced Usage

### Surgical Context Management

```bash
# Pop to a known good state, then re-investigate
/pop --until-checkpoint "initial-analysis"
/investigate --fresh-context

# Pop and replace with corrected context
/pop 2
# (next interaction creates new frame with corrected approach)
```

### Automated Stack Hygiene

```bash
# Pop stale frames older than session threshold
/pop --stale --threshold 2h

# Pop frames with low-confidence decisions
/pop --filter "confidence < 0.5"
```

### Audit Trail Access

```bash
# List archived (previously popped) frames
/pop --list-archive

# Inspect specific archived pop operation
/pop --archive-detail 2026-02-15T14:30:00Z
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Pop operations are atomic -- they either fully complete or fully roll back. No partial stack corruption is possible. The archive mechanism ensures that even destructive operations maintain a full audit trail.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The `--dry-run` option supports informed decision-making by showing exactly what will be removed. Large pop operations require explicit confirmation to prevent accidental context loss.

Within the [NABLA](/glossary/nabla-infinity/) framework, `/pop` serves the Contradiction Preservation axiom by providing a mechanism to remove frames where contradictions were introduced through flawed analysis. Rather than burying contradictions by continuing to build on bad foundations, the operator can pop back to a clean state and re-analyze with corrected assumptions.

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Create named checkpoint for stack state
- [/goto](/commands/goto/) - Restore conversation to named checkpoint
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)