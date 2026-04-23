+++
title = "/session-compress"
weight = 1520
[extra]
category = "Session"
description = "Advanced session context compression with multi-session pattern detection"
syntax = "/session-compress [options]"
authority = "P0"
agent = "session-compressor-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1307
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-compress", "Advanced", "commands", "Session", "Prismatic Platform", "PrismaticClaude", "SessionCompressor", "Pattern"]
tags = ["commands", "session", "session-compress", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/session-compress - Prismatic Platform"
+++

## Overview

**/session-compress** is a production command in the **Session** category of the Prismatic Platform that performs advanced session context compression with multi-session pattern detection. As sessions accumulate across the platform's development lifecycle, raw context data can grow to tens of thousands of lines, creating both storage overhead and retrieval latency when loading prior session state. The `/session-compress` command addresses this by intelligently distilling session records down to their essential decisions, actions, and outcomes while preserving the semantic fidelity required for accurate context reconstruction.

The compression engine operates across multiple dimensions simultaneously. At the syntactic level, it removes redundant phrasing, normalizes formatting, and deduplicates repeated instructions. At the semantic level, it identifies the core intent behind each session frame, extracts key decisions and their rationale, and collapses multi-step reasoning chains into concise summaries. At the strategic level, it detects cross-session patterns -- recurring objectives, repeated code modifications to the same modules, and cyclical quality issues -- surfacing these as persistent themes rather than isolated events.

This command operates under the **P0** authority level and is executed by the `session-compressor-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The P0 authority classification reflects the critical nature of session context management: without reliable compression, the platform's ability to maintain continuity across sessions degrades, directly impacting development velocity and decision quality.

The command integrates tightly with the [Stack-Based Conversation Mode](/glossary/session-discipline/) system, understanding frame boundaries, checkpoint markers, and fork points. Compression respects these structural elements, ensuring that compressed output maintains valid stack topology even after significant size reduction. A typical compression run achieves 60-80% size reduction while preserving 95%+ of actionable information content.

## Architecture

The session compression system is built on a multi-stage pipeline architecture that processes raw session data through progressively more aggressive compression layers.

```
Raw Session Context
       |
       v
  [Tokenization Layer]      -- Parse into structured segments
       |
       v
  [Deduplication Engine]    -- Remove exact and near-duplicate content
       |
       v
  [Semantic Distillation]   -- Extract core decisions and actions
       |
       v
  [Pattern Detector]        -- Identify cross-session recurring themes
       |
       v
  [Reconstruction Validator] -- Verify compressed output preserves meaning
       |
       v
  Compressed Session Context
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Tokenization Layer** | Parses raw session markdown into structured segments (frames, decisions, code blocks) | `PrismaticClaude.SessionCompressor.Tokenizer` |
| **Deduplication Engine** | Identifies and removes exact and near-duplicate content using fuzzy matching | `PrismaticClaude.SessionCompressor.Deduplicator` |
| **Semantic Distillation** | Extracts core intent, decisions, and outcomes from verbose session narratives | `PrismaticClaude.SessionCompressor.Distiller` |
| **Pattern Detector** | Analyzes multiple sessions to surface recurring themes and persistent objectives | `PrismaticClaude.SessionCompressor.PatternDetector` |
| **Reconstruction Validator** | Verifies that compressed output preserves sufficient information for context recovery | `PrismaticClaude.SessionCompressor.Validator` |

The architecture leverages ETS tables for high-speed pattern matching across session histories, with disk persistence for pattern databases that survive application restarts.

## Usage

### Basic Compression

```bash
# Compress the current session context
/session-compress

# Compress with verbose output showing compression statistics
/session-compress --verbose

# Compress a specific session file
/session-compress --file .claude/session-context/2026-02-15-feature-development-session.md
```

### Multi-Session Compression

```bash
# Compress all sessions from the last 7 days
/session-compress --range 7d

# Compress all sessions matching a pattern
/session-compress --pattern "perimeter-*"

# Compress and merge related sessions into a unified context
/session-compress --merge --pattern "hawkeye-*"
```

### Advanced Operations

```bash
# Dry run showing what would be compressed without modifying files
/session-compress --dry-run

# Compress with custom retention threshold (default: 0.7)
/session-compress --retention 0.85

# Generate compression report without modifying files
/session-compress --report-only

# Compress with pattern detection across all historical sessions
/session-compress --detect-patterns --depth all
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--file` | string | current session | Path to specific session file to compress |
| `--range` | duration | `7d` | Time range for multi-session compression (e.g., `1d`, `7d`, `30d`) |
| `--pattern` | string | `*` | Glob pattern for selecting sessions by name |
| `--retention` | float | `0.7` | Semantic retention threshold (0.0-1.0, higher preserves more detail) |
| `--merge` | flag | false | Merge related sessions into unified compressed output |
| `--dry-run` | flag | false | Preview compression without writing changes |
| `--verbose` | flag | false | Show detailed compression statistics |
| `--report-only` | flag | false | Generate report without any file modifications |
| `--detect-patterns` | flag | false | Enable cross-session pattern detection |
| `--depth` | string | `recent` | Pattern detection depth: `recent` (last 10), `month`, `all` |
| `--format` | string | `markdown` | Output format: `markdown`, `json`, `summary` |
| `--backup` | flag | true | Create backup before compression (disable with `--no-backup`) |

## Execution Flow

The command follows a deterministic execution sequence with validation gates at each stage.

1. **Context Loading** -- Load target session file(s) from `.claude/session-context/` directory. Validate file integrity and parse frontmatter metadata.

2. **Pre-Compression Backup** -- Unless `--no-backup` is specified, create timestamped backup copies of all files that will be modified. Backups are stored in `.claude/session-context/backups/`.

3. **Tokenization** -- Parse raw session content into structured segments: frames, decisions, code modifications, test results, quality gate outcomes, and narrative text.

4. **Deduplication Pass** -- Remove exact duplicates and identify near-duplicates using Levenshtein distance with a configurable similarity threshold. Near-duplicates are collapsed into representative entries with occurrence counts.

5. **Semantic Distillation** -- For each segment, extract the core actionable information: what was decided, what was changed, what was the outcome. Verbose explanations are condensed to their essential points.

6. **Cross-Session Pattern Detection** -- When `--detect-patterns` is enabled, scan historical sessions for recurring themes. Patterns are classified as: persistent objectives (goals that span multiple sessions), recurring modifications (same files modified repeatedly), cyclical issues (problems that reappear), and evolution markers (progressive improvement trajectories).

7. **Reconstruction Validation** -- Verify that the compressed output passes the reconstruction test: can a new session load this compressed context and accurately understand the development state? This validation uses a scoring rubric that checks for presence of key decisions, file modification records, and quality state.

8. **Output Generation** -- Write compressed session context, compression report, and pattern analysis to their respective output locations.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Stack Conversation](/glossary/session-discipline/) | Structural | Respects frame boundaries, checkpoints, and fork points during compression |
| [Session Lifecycle](/apps/prismatic-claude/) | Trigger | Auto-triggered at session end as part of the `SessionLifecycle.trigger(:session_end)` hook |
| [Quality DNA](/glossary/quality-dna/) | Preservation | Quality state snapshots are preserved at full fidelity regardless of compression level |
| [GitLab Integration](/glossary/gitlab-ci/) | Metadata | Issue references and milestone associations are never compressed away |
| [Telemetry](/glossary/telemetry/) | Observability | Emits `[:prismatic_claude, :session_compress, :start | :stop | :exception]` events |
| [AIAD Registry](/glossary/aiad/) | Discovery | Registered as `session-compress.cmd.md` in the command registry |

## Best Practices

**Compression Frequency**: Run `/session-compress` at natural boundaries -- end of feature development, after milestone completion, or when accumulated session files exceed 50KB total. Avoid compressing mid-session, as incomplete context may lose important decision threads.

**Retention Threshold Selection**: The default retention of 0.7 works well for routine development sessions. Increase to 0.85+ for sessions involving architectural decisions, security audits, or complex debugging where nuance matters. Lower to 0.5 for purely mechanical sessions (bulk file modifications, formatting passes).

**Pattern Detection Usage**: Enable `--detect-patterns` periodically (weekly or at milestone boundaries) rather than on every compression run. Pattern detection across all historical sessions can be computationally intensive and is most valuable when you have accumulated enough session history for meaningful patterns to emerge.

**Backup Discipline**: Always keep backups enabled (the default) unless you are operating in a storage-constrained environment. Compressed sessions cannot be fully reconstructed once the originals are deleted.

**Merge Strategy**: Use `--merge` judiciously. Merging is ideal for sessions that represent different aspects of the same feature (e.g., implementation, testing, deployment). Avoid merging sessions from unrelated work streams, as the resulting context can become confusing.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Session file not found | Exit with clear error message listing available sessions | Use `--pattern` to discover available sessions |
| Corrupt session file (invalid markdown) | Skip corrupt file, log warning, continue with remaining files | Manually inspect and repair the corrupt file |
| Retention threshold produces empty output | Abort compression, warn that threshold is too aggressive | Lower `--retention` value or use `--dry-run` to preview |
| Backup directory not writable | Abort compression before modifying any files | Fix directory permissions or specify alternate backup location |
| Pattern detection timeout | Continue compression without patterns, log warning | Reduce `--depth` or limit `--range` for pattern detection |
| Reconstruction validation failure | Abort compression, preserve original file, report validation details | Increase `--retention` threshold and retry |

## Advanced Usage

### Integration with Session Lifecycle Hooks

The session compression command can be registered as a session lifecycle hook for automatic execution.

```elixir
# In session lifecycle configuration
PrismaticClaude.SessionLifecycle.register_hook(:session_end, %{
  name: "auto_compress",
  priority: 90,
  handler: fn _event ->
    PrismaticClaude.SessionCompressor.compress(
      retention: 0.7,
      detect_patterns: false,
      backup: true
    )
  end
})
```

### Custom Compression Pipelines

```bash
# Two-pass compression: first compress individual sessions, then detect patterns
/session-compress --range 30d --retention 0.8
/session-compress --detect-patterns --depth all --report-only

# Export compressed context as JSON for external tooling
/session-compress --format json --file latest > session-export.json
```

### Pattern Analysis Deep Dive

```bash
# Identify files that appear in 5+ sessions (hotspot analysis)
/session-compress --detect-patterns --depth all --report-only --verbose

# The pattern report includes:
# - Persistent objectives: Goals spanning 3+ sessions
# - File hotspots: Files modified in 5+ sessions
# - Recurring issues: Problems that reappear after being fixed
# - Evolution trajectory: Quality score progression over time
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Compression must be lossless for critical information. Quality gate results, architectural decisions, and security findings are never compressed away. If compression would result in information loss below the reconstruction validation threshold, the command aborts rather than producing inadequate output.
- **NO DOUBTS**: Every compression operation is validated against a reconstruction rubric before the compressed output replaces the original. Evidence of successful compression (statistics, validation scores) is logged to telemetry. No unvalidated compression is ever committed.

The command also respects the **[NABLA Infinity](/glossary/nabla-infinity/)** axioms, particularly Signal Plurality (preserving multiple perspectives from a session) and Provenance Mandatory (maintaining traceability from compressed output back to original session frames).

## Related Commands

- [/debrief](/commands/debrief/) - Comprehensive session debrief with platform state analysis and changelog detection
- [/rebrief](/commands/rebrief/) - Retrospective analysis of development activity across multiple sessions
- [/session-track](/commands/session-track/) - Session tracking actions for GitLab integration and progress monitoring
- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/checkpoint](/commands/checkpoint/) - Mark current conversation frame with a named checkpoint
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)