+++
title = "/stack-utils"
weight = 1070
[extra]
category = "Stack Mode"
description = "Advanced Stack Mode utility commands for maintenance and debugging"
syntax = "/stack-utils [options]"
authority = "L2+"
agent = "stack-conversation-manager"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 959
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stack-utils", "Advanced", "Stack", "Mode", "commands", "Stack Mode", "Prismatic Platform", "GenServer", "Conversation", "Phase"]
tags = ["commands", "stack-mode", "stack-utils", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/stack-utils - Prismatic Platform"
+++

## Overview

**/stack-utils** is a production command in the **Stack Mode** category of the Prismatic Platform. It provides advanced utility operations for the stack-based conversation system, including stack maintenance, debugging, analytics, export, and health monitoring. While the core stack commands ([/stack](/commands/stack/), [/frame](/commands/frame/), [/pop](/commands/pop/), [/fork](/commands/fork/)) handle basic conversation state management, `/stack-utils` addresses operational concerns: diagnosing stack corruption, analyzing conversation patterns, exporting stack histories, and maintaining the underlying ETS-backed storage layer.

This command operates under the **L2+** authority level and is executed by the `stack-conversation-manager` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The stack-conversation-manager agent is implemented as an OTP-compliant GenServer (`PrismaticClaude.StackConversation`) with 1,128 lines of production code, providing the programmatic infrastructure for all stack operations.

The stack-based conversation mode is a P0 absolute enforcement requirement for all Claude interactions on the Prismatic Platform. Every response creates an immutable frame, every branch is tracked, and every checkpoint is persisted. `/stack-utils` ensures this critical infrastructure remains healthy, provides diagnostic tools when issues arise, and enables operators to extract value from conversation history through analytics and export.

## Architecture

The stack-utils system operates as an administrative layer above the core StackConversation GenServer.

### Stack Utils Architecture

```
             /stack-utils
                   |
           Utils Orchestrator
                   |
          +--------+--------+--------+
          |        |        |        |
       Health    Analytics  Export   Maintenance
       Monitor   Engine     System   Toolkit
          |        |        |        |
    +-----+--+ +--+--+ +--+--+ +---+---+
    |    |   | |  |  | |  |  | |   |   |
   ETS  Frame Branch Conv Frame Compact
   Check Valid  Trace  Stats Export Repair
    |    |   | |  |  | |  |  | |   |   |
    +----+---+-+--+--+-+--+--+-+---+---+
                   |
          Stack Status Report
```

### Component Overview

| Component | Purpose | Key Operations |
|-----------|---------|----------------|
| **Health Monitor** | Stack infrastructure health | ETS table status, GenServer liveness, disk persistence |
| **Analytics Engine** | Conversation pattern analysis | Frame statistics, branch frequency, decision tracking |
| **Export System** | Stack data extraction | JSON export, markdown summary, conversation replay |
| **Maintenance Toolkit** | Storage maintenance | Compaction, orphan cleanup, integrity repair |

### Storage Layer

| Layer | Technology | Purpose | Persistence |
|-------|------------|---------|-------------|
| **Primary** | ETS (Erlang Term Storage) | Fast frame read/write | In-memory |
| **Persistence** | Disk files | Session survival | `.claude/stack-conversation/` |
| **Checkpoints** | Named snapshots | State restoration | Persisted to disk |
| **Branches** | Fork records | Conversation tree | ETS + disk |

## Usage

```bash
# Show stack health status
/stack-utils health

# Display stack analytics summary
/stack-utils analytics

# Export current stack to JSON
/stack-utils export --format json --output ./stack-export.json

# Export conversation as readable markdown
/stack-utils export --format markdown --output ./conversation.md

# Run integrity check on stack storage
/stack-utils check --integrity

# Compact stack storage (remove orphaned data)
/stack-utils compact

# Show branch tree visualization
/stack-utils branches --tree

# List all checkpoints with metadata
/stack-utils checkpoints --verbose

# Repair corrupted stack frames
/stack-utils repair --dry-run

# Show frame creation timeline
/stack-utils timeline
```

### Practical Examples

```bash
# Full diagnostic report for debugging stack issues
/stack-utils health --verbose --include-ets-stats

# Analyze conversation patterns over the last 24 hours
/stack-utils analytics --since 24h --format json

# Export specific branch for review
/stack-utils export --branch main --format markdown --output ./branch-review.md

# Find and clean orphaned frames from interrupted sessions
/stack-utils compact --orphans --dry-run

# Validate all frame checksums
/stack-utils check --integrity --checksums

# Replay conversation from checkpoint
/stack-utils replay --from-checkpoint "pre-refactor"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `health` | `subcommand` | -- | Stack infrastructure health check |
| `analytics` | `subcommand` | -- | Conversation pattern analytics |
| `export` | `subcommand` | -- | Export stack data |
| `check` | `subcommand` | -- | Integrity and validation checks |
| `compact` | `subcommand` | -- | Storage compaction and cleanup |
| `branches` | `subcommand` | -- | Branch tree operations |
| `checkpoints` | `subcommand` | -- | Checkpoint management |
| `repair` | `subcommand` | -- | Stack frame repair |
| `timeline` | `subcommand` | -- | Frame creation timeline |
| `replay` | `subcommand` | -- | Conversation replay |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--output` | `path` | none | Export output file path |
| `--verbose` | `flag` | false | Detailed output with internal state |
| `--since` | `duration` | all | Time filter for analytics and export |
| `--branch` | `string` | current | Target branch for operations |
| `--dry-run` | `flag` | false | Show planned action without executing |
| `--include-ets-stats` | `flag` | false | Include ETS table statistics |
| `--checksums` | `flag` | false | Validate frame data checksums |
| `--orphans` | `flag` | false | Target orphaned frames specifically |

## Execution Flow

### Phase 1: GenServer Connection

The utils orchestrator connects to the running `StackConversation` GenServer process. If the GenServer is not running (application not started), utilities that only need disk-persisted data can still operate in offline mode by reading directly from `.claude/stack-conversation/`.

### Phase 2: State Inspection

The current stack state is inspected: total frame count, active branch, checkpoint count, ETS table size, and disk persistence status. This baseline informs all subsequent operations.

### Phase 3: Operation Dispatch

Based on the selected subcommand, the appropriate operation module is invoked. Health checks run non-destructively. Analytics compute derived metrics from frame data. Export serializes stack data. Maintenance operations (compact, repair) require explicit confirmation for destructive actions.

### Phase 4: Integrity Validation

For check and repair operations, each frame is validated against its expected structure: frame ID uniqueness, parent-child relationship consistency, checkpoint reference validity, and optional checksum verification. Violations are categorized by severity.

### Phase 5: Report Generation

Results are formatted according to the requested output format. Health reports include status indicators (green/yellow/red). Analytics include computed metrics with trend indicators. Export produces self-contained documents suitable for external review.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/stack](/commands/stack/) | Core | Display operations use the same GenServer |
| [/frame](/commands/frame/) | Core | Frame inspection shares state infrastructure |
| [/pop](/commands/pop/) | Core | Pop operations tracked by utils analytics |
| [/fork](/commands/fork/) | Core | Fork operations create branch records |
| [StackConversation GenServer](/glossary/genserver/) | Runtime | Direct GenServer interaction |
| [Telemetry](/glossary/telemetry/) | Monitoring | `[:prismatic_claude, :stack_conversation, *]` events |
| [Quality DNA](/glossary/quality-dna/) | State | Conversation patterns inform quality DNA |
| [Session Context](/glossary/session-discipline/) | Persistence | Stack data persists across sessions |

## Best Practices

### Regular Health Checks

Run `/stack-utils health` at the beginning of each session, especially after unexpected session terminations. Stack corruption from interrupted persistence operations can cause subtle issues that compound over time.

### Periodic Compaction

Execute `/stack-utils compact` weekly to clean up orphaned frames from popped branches, interrupted forks, and abandoned checkpoints. Without compaction, the ETS table grows monotonically and may impact performance in long-running sessions.

### Export Before Destructive Operations

Before using `/pop` or `/fork` (both marked DESTRUCTIVE), export the current stack state with `/stack-utils export`. This provides a recovery point if the destructive operation produces unexpected results.

### Analytics for Conversation Optimization

Use `/stack-utils analytics` to identify conversation patterns: excessive branching (indicates unclear requirements), deep stacks without checkpoints (risk of context loss), and frequent pops (indicates exploration without commitment). These patterns guide conversation strategy improvements.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `GENSERVER_DOWN` | StackConversation GenServer not running | Start application or use offline mode |
| `ETS_TABLE_MISSING` | ETS table not found | GenServer restart required |
| `FRAME_CORRUPTED` | Frame data fails integrity check | Run `/stack-utils repair` |
| `CHECKPOINT_ORPHANED` | Checkpoint references non-existent frame | Run `/stack-utils compact --orphans` |
| `BRANCH_INCONSISTENT` | Branch tree has inconsistent parent-child links | Run `/stack-utils repair --branch-tree` |
| `DISK_PERSISTENCE_STALE` | Disk state older than ETS state | Force persistence with `/stack-utils sync` |
| `EXPORT_WRITE_FAILURE` | Cannot write export file | Check filesystem permissions |

## Advanced Usage

### Conversation Replay

Replay a conversation from a specific checkpoint for review:

```bash
/stack-utils replay --from-checkpoint "feature-start" --to-checkpoint "feature-complete" --format markdown
```

### Branch Comparison

Compare two branches to understand divergence:

```bash
/stack-utils branches --compare main feature-exploration --format json
```

### Automated Maintenance Schedule

Set up periodic maintenance hooks:

```bash
# Add to session lifecycle hooks
/stack-utils maintenance --schedule session-end --operations "compact,check"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Stack integrity is maintained absolutely; corrupted frames are never silently ignored.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every repair operation provides evidence of corruption before and verification of repair after.

## Related Commands

- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/frame](/commands/frame/) - Inspect specific conversation frame by ID
- [/pop](/commands/pop/) - Remove last N frames from conversation stack (DESTRUCTIVE)
- [/fork](/commands/fork/) - Branch conversation from specific frame (DESTRUCTIVE)
- [/checkpoint](/commands/checkpoint/) - Mark current frame as named checkpoint
- [/goto](/commands/goto/) - Restore conversation to named checkpoint
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)