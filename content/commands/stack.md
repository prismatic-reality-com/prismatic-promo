+++
title = "/stack"
weight = 990
[extra]
category = "Stack Mode"
description = "Display complete conversation stack with all frames"
syntax = "/stack [options]"
authority = "Universal"
agent = "stack-conversation-manager"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1037
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stack", "Display", "commands", "Stack Mode", "Prismatic Platform", "Show", "DESTRUCTIVE", "Immutable", "State", "Phase"]
tags = ["commands", "stack-mode", "stack", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/stack - Prismatic Platform"
+++

## Overview

**/stack** is a production command in the **Stack Mode** category of the Prismatic Platform. It displays the complete conversation stack showing all frames, their summaries, key decisions, assumptions, and checkpoint markers. The stack is the fundamental data structure for conversation state management on the Prismatic Platform, and this command provides the primary interface for inspecting that state. Every Claude interaction creates an immutable frame, and `/stack` reveals the full history of the current conversation branch.

This command operates under the **Universal** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The Universal authority level means every operator, regardless of privilege level, can inspect the conversation stack. Transparency of conversation state is a foundational principle of the stack-based conversation mode.

Stack-based conversation mode is a P0 absolute enforcement requirement for all Claude interactions on the Prismatic Platform. The stack paradigm replaces traditional linear conversation history with a structured, branching, checkpointed model. Each frame captures the user input summary, assistant output summary, key assumptions, and key decisions. This structure enables precise state management: operators can pop frames to undo decisions, fork branches to explore alternatives, and checkpoint important milestones for later restoration. `/stack` is the window into this system.

## Architecture

The stack display system reads from the StackConversation GenServer and formats the current stack state for human consumption.

### Stack Architecture

```
             /stack
                |
        Stack Renderer
                |
          +-----+-----+
          |     |     |
       Frame  Branch  Checkpoint
       List   Info    Markers
          |     |     |
    +-----+-+ +-+-+ +-+-----+
    |   |   | | | | |   |   |
   ID  Sum  Dec Cur Act Name Mark
       mary ision rent ive  Map  Time
    |   |   | | | | |   |   |
    +---+---+-+-+-+-+---+---+
                |
        Formatted Output
                |
          +-----+-----+
          |     |     |
       Compact Detailed JSON
       View    View    Export
```

### Stack Data Model

| Element | Type | Mutability | Description |
|---------|------|------------|-------------|
| **Frame** | Struct | Immutable | Single conversation turn with metadata |
| **Frame ID** | Integer | Assigned once | Sequential identifier, never reused |
| **User Summary** | String | Immutable | 1-2 line summary of user input |
| **Assistant Summary** | String | Immutable | 1-3 line summary of assistant response |
| **Key Assumptions** | List | Immutable | Assumptions made during the response |
| **Key Decisions** | List | Immutable | Decisions made during the response |
| **Checkpoint** | Named marker | Persistent | Optional named bookmark on a frame |
| **Branch** | Tree node | Append-only | Fork point creating conversation branch |

### Stack Operations Model

| Operation | Command | Effect | Reversibility |
|-----------|---------|--------|---------------|
| **View** | `/stack` | Read-only display | N/A (read-only) |
| **Inspect** | `/frame N` | Show frame details | N/A (read-only) |
| **Remove** | `/pop N` | Remove last N frames | DESTRUCTIVE -- frames lost |
| **Branch** | `/fork N` | Create branch from frame N | DESTRUCTIVE -- new branch |
| **Bookmark** | `/checkpoint name` | Mark current frame | Persistent |
| **Restore** | `/goto name` | Return to checkpoint | State change |

## Usage

```bash
# Display full conversation stack
/stack

# Display stack with detailed frame contents
/stack --verbose

# Display stack in compact format (frame IDs and summaries only)
/stack --compact

# Display stack with checkpoint markers highlighted
/stack --checkpoints

# Display stack with branch information
/stack --branches

# Export stack as JSON
/stack --format json

# Display last N frames only
/stack --last 5

# Display stack with decision trail
/stack --decisions

# Display stack with assumption chain
/stack --assumptions
```

### Practical Examples

```bash
# Quick status check of conversation state
/stack --compact

# Full stack review before making a destructive operation
/stack --verbose --checkpoints

# Review decision chain for the current session
/stack --decisions --verbose

# Export stack for external review or documentation
/stack --format json > ./conversation-stack.json

# Check how deep the current conversation is
/stack --last 3 --verbose

# Display stack with branch tree for complex conversations
/stack --branches --verbose
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | `flag` | false | Show full frame details (summaries, assumptions, decisions) |
| `--compact` | `flag` | false | Minimal display: frame IDs and one-line summaries |
| `--checkpoints` | `flag` | false | Highlight checkpoint markers in the stack |
| `--branches` | `flag` | false | Show branch information and fork points |
| `--decisions` | `flag` | false | Show decision trail across all frames |
| `--assumptions` | `flag` | false | Show assumption chain across all frames |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--last` | `integer` | all | Show only the last N frames |
| `--from` | `integer` | 0 | Display frames starting from frame ID |
| `--to` | `integer` | current | Display frames up to frame ID |

## Execution Flow

### Phase 1: State Retrieval

The command calls `StackConversation.get_stack/0` on the GenServer to retrieve the current stack state. This is a read-only operation that does not modify any state. The GenServer returns the complete frame list, active branch identifier, and checkpoint map.

### Phase 2: Branch Resolution

If the conversation has branches (created by `/fork`), the current active branch is resolved. Only frames on the active branch are included in the default display. With `--branches`, fork points and alternative branches are annotated.

### Phase 3: Checkpoint Annotation

Frames that have associated checkpoints are annotated with their checkpoint names. With `--checkpoints`, these annotations are visually highlighted in the output.

### Phase 4: Content Filtering

Based on display options (`--compact`, `--verbose`, `--decisions`, `--assumptions`), the appropriate content is extracted from each frame. Compact mode shows only frame IDs and user input summaries. Verbose mode shows all frame fields. Decision and assumption modes extract those specific fields into consolidated trails.

### Phase 5: Rendering

The filtered content is rendered in the requested format. Text format uses structured indentation with visual separators between frames. JSON format produces a machine-readable array of frame objects. Markdown format generates a document suitable for external sharing.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/frame](/commands/frame/) | Drill-down | Frame inspection for detailed view of single frame |
| [/pop](/commands/pop/) | State modification | Remove frames from stack (DESTRUCTIVE) |
| [/fork](/commands/fork/) | State modification | Create conversation branch (DESTRUCTIVE) |
| [/checkpoint](/commands/checkpoint/) | State annotation | Mark frames as named checkpoints |
| [/goto](/commands/goto/) | State restoration | Restore to named checkpoint |
| [/stack-utils](/commands/stack-utils/) | Administration | Advanced maintenance and debugging |
| [StackConversation GenServer](/glossary/genserver/) | Runtime | OTP GenServer providing stack infrastructure |
| [Telemetry](/glossary/telemetry/) | Monitoring | Stack display operations tracked |

## Best Practices

### Frequent Stack Inspection

Run `/stack --compact` regularly during complex sessions to maintain awareness of conversation state. Deep stacks without checkpoints risk context confusion, and frequent inspection helps identify when a checkpoint is overdue.

### Pre-Destructive Operation Review

Always run `/stack --verbose --checkpoints` before any `/pop` or `/fork` operation. Understanding the full stack state prevents accidental loss of important frames. Export the stack with `/stack --format json` as a backup before destructive operations.

### Decision Trail Review

Use `/stack --decisions` at session milestones to review the chain of decisions made. This provides a structured audit trail that is useful for documenting architectural choices, debugging unexpected outcomes, and communicating session progress to stakeholders.

### Checkpoint Discipline

When `/stack` shows more than 10 frames without a checkpoint, create one immediately with `/checkpoint`. Long uncheckpointed sequences are fragile: any accidental `/pop` loses all intermediate work without a restoration point.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `STACK_EMPTY` | No frames in the current stack | Create first frame through interaction |
| `GENSERVER_DOWN` | StackConversation GenServer not running | Start application; stack mode requires running GenServer |
| `BRANCH_NOT_FOUND` | Requested branch does not exist | Check available branches with `/stack --branches` |
| `FRAME_RANGE_INVALID` | `--from`/`--to` range contains no frames | Adjust range to valid frame IDs |
| `FORMAT_ERROR` | Cannot serialize stack to requested format | Check for non-serializable frame content |

## Advanced Usage

### Stack Diffing

Compare current stack against a checkpoint to see what changed:

```bash
/stack --diff-from "checkpoint-name"
```

### Stack Search

Search frame contents for specific keywords:

```bash
/stack --search "refactor" --verbose
```

### Stack Metrics

Display quantitative metrics about the conversation:

```bash
/stack --metrics
# Output: Depth: 47 frames, Branches: 3, Checkpoints: 5, Decisions: 23, Duration: 2h 15m
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Stack display is always accurate and complete; no frames are hidden or summarized without explicit request.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Stack state is read directly from the authoritative GenServer, never from stale caches or approximations.

## Related Commands

- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current frame as named checkpoint
- [/goto](/commands/goto/) - Restore conversation to named checkpoint
- [/stack-utils](/commands/stack-utils/) - Advanced Stack Mode utility commands for maintenance and debugging
- [/ramon-mode](/commands/ramon-mode/) - Ramon mode guardian for specialized help and assistance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)