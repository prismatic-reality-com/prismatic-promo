+++
title = "/frame"
weight = 1000
[extra]
category = "Stack Mode"
description = "Inspect specific conversation frame by ID"
syntax = "/frame [options]"
authority = "Universal"
agent = "stack-conversation-manager"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1217
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["frame", "Inspect", "commands", "Stack Mode", "Prismatic Platform", "GenServer"]
tags = ["commands", "stack-mode", "frame", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/frame - Prismatic Platform"
+++

## Overview

**/frame** is a production command in the **Stack Mode** category of the Prismatic Platform that inspects a specific conversation frame by its ID. Frames are the fundamental units of the stack-based conversation protocol -- each frame captures a single interaction cycle including user input, assistant output, key assumptions made, and key decisions taken. The `/frame` command provides read-only access to any frame in the active stack, enabling operators to review past context, verify assumptions, and trace the reasoning chain that led to the current conversational state.

The command operates under the **Universal** authority level, meaning it is available to all operators without restriction. It is executed by the `stack-conversation-manager` agent and is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The Universal authority reflects the non-destructive, read-only nature of frame inspection -- viewing a frame never modifies the conversational state.

Stack-based conversation mode is a P0 absolute enforcement protocol in the Prismatic Platform. Every Claude interaction creates an immutable frame that records what was discussed, what was decided, and what assumptions underlie those decisions. The `/frame` command is the primary tool for accessing this historical record. Without it, operators would need to mentally reconstruct past context from memory -- a practice that violates the [NABLA](/glossary/nabla-infinity/) framework's provenance axiom, which requires all reasoning to be traceable.

In practice, `/frame` is used most frequently during complex multi-step operations where decisions made in earlier frames influence later actions. Before making a significant decision, reviewing the relevant frame ensures that the current action is consistent with previously established assumptions and does not contradict earlier conclusions.

## Architecture

The `/frame` command interfaces directly with the Stack Conversation GenServer, which maintains the complete state of the active conversation stack.

```
/frame N --> GenServer.call(:get_frame, N) --> ETS Lookup --> Frame Struct
                                                    |
                                               Disk Backup
                                          (.claude/stack-conversation/)
```

### Frame Data Structure

Each frame is stored as an immutable struct with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Zero-indexed frame identifier |
| `timestamp` | DateTime | UTC timestamp of frame creation |
| `user_input_summary` | string | 1-2 line summary of the user's input |
| `assistant_output_summary` | string | 1-3 line summary of the assistant's output |
| `key_assumptions` | list(string) | Assumptions made during this frame |
| `key_decisions` | list(string) | Decisions taken during this frame |
| `metadata` | map | Additional metadata (fork source, checkpoint name, etc.) |
| `parent_id` | integer | ID of the previous frame (nil for frame 0) |

### Storage Architecture

Frames are stored in two locations for reliability:

1. **ETS Table**: Primary storage for fast in-memory access. The table is owned by the Stack Conversation GenServer and uses `read_concurrency: true` for safe concurrent reads.

2. **Disk Persistence**: Each frame is serialized to JSON at `.claude/stack-conversation/frame-{id}.json`. This provides durability across GenServer restarts and enables post-session analysis.

The dual-storage architecture ensures that frame data survives both process crashes (via disk persistence) and disk failures (via ETS in-memory access during the session).

## Usage

### Basic Usage

```bash
# Inspect frame 0 (the initial frame)
/frame 0

# Inspect the most recent frame
/frame latest

# Inspect a specific frame by ID
/frame 5

# Inspect a named checkpoint frame
/frame checkpoint:pre-refactor
```

### Detailed Inspection

```bash
# Show full frame details including metadata
/frame 3 --verbose

# Show only assumptions from a specific frame
/frame 2 --field assumptions

# Show only decisions from a specific frame
/frame 4 --field decisions

# Show frame with its relationship to adjacent frames
/frame 3 --context
```

### Multi-Frame Inspection

```bash
# Inspect a range of frames
/frame 2..5

# Compare assumptions between two frames
/frame diff 2 5 --field assumptions

# Show all frames that contain a specific decision keyword
/frame search "database migration"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `N` | integer | required | Frame ID to inspect (0-indexed) |
| `latest` | keyword | none | Shorthand for the most recent frame |
| `checkpoint:NAME` | string | none | Resolve a named checkpoint to its frame ID |
| `--verbose` | boolean | false | Include full metadata and raw frame data |
| `--field` | string | all | Show only a specific field (assumptions, decisions, input, output) |
| `--context` | boolean | false | Show the inspected frame alongside its parent and child |
| `--format` | string | table | Output format: table, json, markdown |
| `N..M` | range | none | Inspect all frames from N to M inclusive |
| `diff N M` | subcommand | none | Compare two frames side by side |
| `search TERM` | subcommand | none | Search all frames for a keyword in any field |

## Execution Flow

1. **Argument Parsing**: Parse the frame identifier, which may be a numeric ID, `latest`, a `checkpoint:NAME` reference, or a range.

2. **Resolution**: Resolve the identifier to one or more concrete frame IDs. For checkpoints, the GenServer looks up the checkpoint registry to find the associated frame ID.

3. **Validation**: Verify that the requested frame(s) exist in the active stack. Frames that have been orphaned by [/fork](/commands/fork/) or removed by [/pop](/commands/pop/) are not accessible through normal `/frame` operations.

4. **Retrieval**: Fetch the frame data from ETS. If ETS is unavailable (process restart scenario), fall back to disk persistence.

5. **Filtering**: If `--field` is specified, extract only the requested field from the frame struct.

6. **Formatting**: Render the frame data in the requested format (table, json, or markdown).

7. **Display**: Output the formatted frame data. For `--context` mode, also retrieve and display the parent and child frames.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| Stack GenServer | Core | Direct GenServer call to `StackConversation.get_frame/1` |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Managed by `stack-conversation-manager` agent |
| [NABLA Framework](/glossary/nabla-infinity/) | Epistemic | Frame inspection supports provenance tracing |
| [Telemetry](/glossary/telemetry/) | Observability | Frame access events tracked for session analysis |
| Session Context | Persistence | Frames contribute to session context for cross-session continuity |
| [/stack](/commands/stack/) | Navigation | Stack overview provides the list of available frame IDs |
| [/fork](/commands/fork/) | Branching | Fork operations create new frames with fork metadata |
| [/checkpoint](/commands/checkpoint/) | Naming | Checkpoints assign human-readable names to frame IDs |

## Best Practices

**Review assumptions before critical decisions.** Before committing to a significant architectural change or irreversible operation, use `/frame` to review the assumptions established in earlier frames. Assumptions that were valid at frame 2 may no longer hold at frame 8 due to new information discovered in the intervening frames.

**Use checkpoint names for frequently referenced frames.** Rather than remembering numeric frame IDs, use [/checkpoint](/commands/checkpoint/) to assign meaningful names like `pre-refactor` or `architecture-decision`. Then use `/frame checkpoint:pre-refactor` for quick access.

**Inspect frame 0 to verify session initialization.** Frame 0 captures the initial session context, including loaded configuration, baseline state, and starting assumptions. Reviewing frame 0 periodically ensures that the conversation has not drifted from its original objectives.

**Use diff mode for assumption tracking.** When assumptions change across frames, use `/frame diff N M --field assumptions` to see exactly what changed and when. This supports the NABLA framework's time decay axiom by making temporal changes in beliefs explicit.

**Export frames for documentation.** Use `--format markdown` to export frame contents for inclusion in session reports and documentation. This creates a traceable record of the reasoning process for future reference.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :frame_not_found}` | Requested frame ID does not exist in the active stack | Use [/stack](/commands/stack/) to view available frame IDs |
| `{:error, :checkpoint_not_found}` | Named checkpoint does not exist | Use [/stack](/commands/stack/) to list available checkpoints |
| `{:error, :invalid_frame_id}` | Frame ID is not a valid non-negative integer | Provide a valid numeric ID, `latest`, or `checkpoint:NAME` |
| `{:error, :field_not_found}` | Specified `--field` value is not a valid frame field | Valid fields: assumptions, decisions, input, output, metadata |
| `{:error, :genserver_unavailable}` | Stack GenServer is not running | Ensure PrismaticClaude application is started |
| `{:error, :range_invalid}` | Range start exceeds range end or exceeds stack size | Verify range boundaries against available frame count |

## Advanced Usage

### Programmatic Frame Access

The Stack Conversation GenServer exposes a public API for programmatic frame access:

```elixir
# Get a specific frame
{:ok, frame} = PrismaticClaude.StackConversation.get_frame(3)

# Get the full stack
{:ok, stack} = PrismaticClaude.StackConversation.get_stack()

# Get frame count
{:ok, count} = PrismaticClaude.StackConversation.frame_count()
```

### Frame Analysis Patterns

```bash
# Trace the decision chain from frame 0 to current
/frame 0..latest --field decisions

# Find the frame where a specific assumption was introduced
/frame search "PostgreSQL connection pool" --field assumptions

# Review all fork points in the current session
/frame search "fork_source" --field metadata
```

### Session Reconstruction

When resuming a session from saved context, frames provide the complete reconstruction path:

```bash
# Review the full session narrative
/frame 0..latest --format markdown > session-narrative.md

# Identify the key turning points
/frame 0..latest --field decisions --format json | jq '.[] | select(.key_decisions | length > 0)'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Frame data is always complete -- every frame must include all mandatory fields (input summary, output summary, assumptions, decisions).
- **NO DOUBTS**: Full investigation before action, evidence-based results. The `/frame` command is itself an instrument of the NO DOUBTS principle: it enables operators to verify assumptions and trace reasoning before acting.

Frame immutability is a non-negotiable behavioral rule: once created, frames cannot be modified. This ensures that the historical record is trustworthy and that provenance chains remain intact across the entire session lifecycle.

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current frame with a named checkpoint
- [/goto](/commands/goto/) - Restore conversation to a named checkpoint
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)