+++
title = "/context-preserve"
weight = 1240
[extra]
category = "Documentation"
description = "Real-time session context preservation with forensic integrity"
syntax = "/context-preserve [options]"
authority = "MANDATORY"
agent = "context-preservation-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 878
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["context-preserve", "Real-time", "commands", "Documentation", "Prismatic Platform", "MANDATORY", "Every", "Context", "Wave"]
tags = ["commands", "documentation", "context-preserve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/context-preserve - Prismatic Platform"
+++

## Overview

The **/context-preserve** command implements real-time session context preservation with forensic-grade integrity for the Prismatic Platform. Every development session generates critical knowledge -- decisions made, files modified, problems solved, patterns discovered -- and without systematic preservation, this knowledge evaporates between sessions. Context preservation transforms ephemeral session state into persistent, queryable, and restorable institutional memory.

This command evolved from the Wave 3 documentation excellence initiative, which produced 60KB of forensic-grade session documentation across four specialized squads. That experience demonstrated that comprehensive context preservation achieves 100% session restoration capability, enabling any future session to resume exactly where a previous session ended. The pattern has since been elevated to MANDATORY authority level, making context preservation non-optional for all platform operations.

The command operates under **MANDATORY** authority and is executed by the `context-preservation-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. Unlike most commands that operate on request, context preservation runs continuously through automatic triggers -- session start, periodic auto-save, phase completion, agent handoff, and session end.

The forensic integrity model ensures that every preserved context is cryptographically sealed, timestamped, and cross-referenced. This creates an immutable audit trail that satisfies both operational continuity requirements and the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, which demands evidence-based decision-making with full provenance tracking.

## Architecture

### Context Preservation Pipeline

```
Session Start
    |
    v
LOAD LATEST CONTEXT
    +-- Scan .claude/session-context/
    +-- Identify most recent session file
    +-- Parse restoration instructions
    +-- Validate context integrity
    |
    v
ACTIVE SESSION MONITORING
    +-- Track file modifications
    +-- Record decisions and rationale
    +-- Capture agent handoffs
    +-- Monitor quality gate results
    |
    v
TRIGGER-BASED PRESERVATION
    +-- Auto-save (configurable interval)
    +-- Phase completion snapshots
    +-- Agent handoff transfers
    +-- Error/termination emergency saves
    |
    v
FORENSIC SEALING
    +-- Content hash generation
    +-- Timestamp embedding
    +-- Cross-reference validation
    +-- Integrity verification
    |
    v
PERSISTENT STORAGE
    +-- .claude/session-context/{dated-file}.md
    +-- LATEST_SESSION.md symlink update
```

### Documentation Quality Levels

| Format | Size | Use Case | Detail Level |
|--------|------|----------|-------------|
| **Minimal** | ~1KB | Emergency saves, quick checkpoints | Essential mission state only |
| **Standard** | ~5KB | Regular auto-saves | Actions, files, decisions |
| **Comprehensive** | ~15KB | Phase completions, session ends | Full context with rationale |
| **Forensic** | ~30KB+ | Critical sessions, agent handoffs | Complete audit trail with evidence |

## Usage

### Automatic Preservation (Default)

```bash
# Auto-save with default settings (30-minute interval, comprehensive format)
/context-preserve

# Configure auto-save interval to 15 minutes
/context-preserve auto --interval 15

# Set minimal format for high-frequency saves
/context-preserve auto --interval 5 --format minimal
```

### Manual Preservation

```bash
# Manual comprehensive save at current point
/context-preserve manual --format comprehensive

# Forensic-grade save with full audit trail
/context-preserve manual --format forensic

# Quick checkpoint save with label
/context-preserve manual --format standard --label "pre-refactoring"
```

### Phase and Handoff Preservation

```bash
# Save at phase completion
/context-preserve phase-complete --audit-trail true

# Agent handoff with full context transfer
/context-preserve agent-handoff --coordination true

# Emergency save on error detection
/context-preserve error --format comprehensive
```

## Options & Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **trigger** | string | No | `auto` | Trigger type: auto, manual, phase-complete, agent-handoff, error |
| **--format** | enum | No | `comprehensive` | Detail level: minimal, standard, comprehensive, forensic |
| **--interval** | integer | No | 30 | Auto-save interval in minutes (5-60) |
| **--coordination** | boolean | No | true | Enable cross-agent context coordination |
| **--audit-trail** | boolean | No | true | Include forensic audit trail |
| **--label** | string | No | -- | Optional label for checkpoint identification |

## Execution Flow

```
/context-preserve [trigger] [options]
    |
    v
PHASE 1: TRIGGER DETECTION (< 50ms)
    +-- Identify preservation trigger type
    +-- Validate authority (MANDATORY level)
    +-- Load current session metadata
    +-- Determine format requirements
    |
    v
PHASE 2: STATE CAPTURE (< 500ms)
    +-- Snapshot current session state
    +-- Collect file modification log
    +-- Record pending decisions and actions
    +-- Gather quality gate results
    +-- Capture agent coordination state
    |
    v
PHASE 3: CONTEXT ASSEMBLY (< 1s)
    +-- Structure content per format template
    +-- Generate restoration instructions
    +-- Build cross-reference links
    +-- Compile deliverables inventory
    +-- Produce next-steps guidance
    |
    v
PHASE 4: FORENSIC SEALING (< 200ms)
    +-- Compute content hash (SHA-256)
    +-- Embed creation timestamp
    +-- Validate cross-references
    +-- Verify content integrity
    |
    v
PHASE 5: PERSISTENCE (< 300ms)
    +-- Write to .claude/session-context/
    +-- Update LATEST_SESSION.md symlink
    +-- Log telemetry event
    +-- Confirm preservation success
```

### Context Content Structure

```yaml
mandatory_content:
  mission_description: "Complete objectives and scope"
  actions_timeline: "All actions with timestamps"
  files_modified: "Every file changed with purpose"
  deliverables: "All outputs created"
  decisions_made: "Key decisions with rationale"
  verification_results: "All validation outcomes"
  next_steps: "Clear continuation instructions"
  restoration_guide: "Step-by-step restoration"

optional_content:
  quality_metrics: "Quality gate results and scores"
  agent_coordination: "Multi-agent handoff state"
  error_log: "Errors encountered and resolutions"
  performance_data: "Timing and resource usage"
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `context-preservation-specialist` | Agent manages all preservation triggers and formatting |
| [AIAD](/glossary/aiad/) Registry | Command specification and discovery | MANDATORY authority ensures universal execution |
| Session Lifecycle | Automatic trigger integration | Hooks into `SessionLifecycle` GenServer events |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation | Quality results captured in every context save |
| [Telemetry](/glossary/telemetry/) | Event tracking | `[:prismatic_claude, :context_preserve, *]` events |
| Stack Conversation | Frame state coordination | Preserves stack frame state for session continuity |
| Multi-Agent Orchestration | Cross-agent context sharing | Handoff protocol for seamless agent transitions |

### Cross-Agent Context Coordination

```elixir
context_coordination = %{
  shared_state: %{
    mission_objectives: :shared,
    platform_state: :shared,
    quality_metrics: :shared,
    deliverables: :coordinated
  },
  handoff_protocol: %{
    current_agent: "source-agent-id",
    next_agent: "target-agent-id",
    context_transfer: "seamless",
    state_validation: "verified"
  },
  coordination_topics: [
    "mcp:context",
    "mcp:session-state",
    "mcp:agent-handoff"
  ]
}
```

### File System Integration

```
.claude/session-context/
+-- 2026-01-31-perimeter-mvp-completion-session.md
+-- 2026-01-28-archer-supreme-strategic-analysis-session.md
+-- 2026-01-25-quality-floor-guardian-session.md
+-- LATEST_SESSION.md -> (symlink to most recent)
```

**Naming Convention**: `YYYY-MM-DD-{agent-or-mission-name}-{unique-identifier}-session.md`

## Best Practices

1. **Never skip session-end saves** -- The MANDATORY authority level exists because lost session context directly impacts platform productivity. Every session must produce a final comprehensive context file.

2. **Use forensic format for critical sessions** -- Any session involving production deployments, security operations, or architectural decisions warrants forensic-grade documentation.

3. **Keep auto-save interval proportional to risk** -- High-risk operations (data migrations, security fixes) warrant 5-minute intervals. Standard development work is well-served by 30-minute intervals.

4. **Label checkpoints meaningfully** -- When using manual checkpoints, include descriptive labels like "pre-database-migration" or "post-security-audit" for rapid identification during restoration.

5. **Validate restoration instructions** -- Before ending a session, mentally walk through the restoration guide to ensure a future session can resume without ambiguity.

6. **Coordinate handoffs explicitly** -- When transferring work between agents, always trigger an `agent-handoff` preservation to capture both the outgoing context and the incoming agent's requirements.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `WRITE_PERMISSION_DENIED` | Cannot write to session-context directory | Check filesystem permissions on `.claude/session-context/` |
| `CONTEXT_CORRUPTION` | Hash verification failed on load | Fall back to previous context file, report corruption |
| `SYMLINK_FAILURE` | Cannot update LATEST_SESSION.md | Manually update symlink, check filesystem state |
| `INTERVAL_TOO_SHORT` | Auto-save interval below minimum (5 min) | Set interval to at least 5 minutes |
| `COLLISION_DETECTED` | Parallel sessions writing simultaneously | Session collision detection triggers unique naming |
| `FORMAT_INVALID` | Unknown format specified | Use one of: minimal, standard, comprehensive, forensic |

### Emergency Preservation

When errors or unexpected termination occur, the system automatically triggers an emergency save:

```bash
# Emergency save is automatic, but can be triggered manually
/context-preserve error --format comprehensive

# Recovery from corrupted context
/context-preserve manual --format forensic --label "recovery-after-corruption"
```

## Advanced Usage

### Programmatic Context Access

```elixir
# Access context preservation via GenServer
{:ok, context} = PrismaticClaude.ContextPreservation.save(%{
  trigger: :manual,
  format: :comprehensive,
  label: "api-integration-complete"
})

# Load most recent context
{:ok, latest} = PrismaticClaude.ContextPreservation.load_latest()

# Query context history
{:ok, history} = PrismaticClaude.ContextPreservation.list_contexts(
  since: ~D[2026-01-01],
  format: :forensic
)
```

### Custom Trigger Registration

```elixir
# Register custom preservation trigger
PrismaticClaude.SessionLifecycle.register_hook(%{
  phase: :post_command,
  priority: 50,
  handler: fn event ->
    if event.command in [:deploy, :migrate] do
      PrismaticClaude.ContextPreservation.save(%{
        trigger: :phase_complete,
        format: :forensic
      })
    end
  end
})
```

### Context Quality Metrics

The Wave 3 documentation excellence established measurable quality benchmarks:

| Metric | Target | Wave 3 Actual |
|--------|--------|---------------|
| Session restoration capability | 100% | 100% |
| Documentation volume | 15KB+ per session | 15KB average |
| Forensic audit trail coverage | Complete | Complete |
| Startup time acceleration | 20%+ faster | 20-30% faster |
| Cross-reference accuracy | 100% | 100% |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete context preservation. Every session must produce restorable context. No session ends without a final save. No agent handoff occurs without context transfer. MANDATORY authority means no exceptions.
- **NO DOUBTS**: Full session state investigation before preservation. Context integrity is cryptographically verified. Restoration instructions are validated for completeness. Evidence-based provenance tracking for every decision recorded.

Context preservation directly implements the NABLA axiom of **Provenance Mandatory** -- all beliefs, decisions, and actions must be traceable to their origin through preserved session context.

## Related Commands

- [/chronic](/commands/chronic/) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](/commands/find-lowfruit/) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](/commands/scan-mycelium/) - Mycelial pattern scanning across documentation and code
- [/doc](/commands/doc/) - Technical documentation and API reference generation
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/optimize](/commands/optimize/) - Performance optimization with measurement validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)