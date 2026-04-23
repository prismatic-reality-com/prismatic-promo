+++
title = "Context Preservation Specialist Agent"
weight = 97
[extra]
domain = "authority-level"
level = "L3"
description = "Source: Complete session restoration capability enabling perfect continuity Success Evidence**:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry"]
domain_normalized = "general"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1650
quality_score = 92
keywords = ["context preservation", "session restoration", "quality DNA", "decision provenance", "stack frames", "continuity management"]
tags = ["prismatic", "agent", "context-management", "authority-domain", "session-continuity"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Context Preservation Specialist Agent - Prismatic Platform"
+++

## Overview

The Context Preservation Specialist Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent responsible for complete session restoration and continuity management across the Prismatic Platform. This agent ensures that critical context -- decisions made, files modified, quality states, and strategic directions -- survives session boundaries without information loss. In a platform where autonomous agents operate across extended development cycles, context preservation is the foundation that prevents repeated work and maintains strategic coherence.

Session context in the Prismatic ecosystem includes more than simple file change logs. The Context Preservation Specialist captures decision rationale, quality gate states, evolutionary progress markers, and inter-agent coordination states. This comprehensive context snapshot enables any subsequent session to resume exactly where the previous one ended, with full awareness of what was accomplished, what was decided, and what remains to be done.

## Operational Domain

Context preservation operates at the intersection of session management and knowledge persistence. The agent interfaces with the `.claude/session-context/` directory structure, Quality DNA state files, and [AIAD](/glossary/aiad/) registry snapshots to build complete session representations. It also manages the stack-based conversation mode, ensuring that frame [immutability](/glossary/immutability/) and checkpoint semantics are properly maintained across session boundaries.

## Context Architecture

The Context Preservation Specialist manages a layered context architecture where each layer captures a different aspect of session state.

| Context Layer | Content | Storage | Retention |
|---|---|---|---|
| Session State | Active objectives, progress, blockers | `.claude/session-context/*.md` | Permanent |
| Quality DNA | Quality scores per app, domain compliance | `.claude/quality-dna/current-state.json` | Permanent |
| Decision Log | ADR references, tactical decisions, rationale | Embedded in session context | Permanent |
| File Manifest | Files created, modified, deleted with diffs | Session context appendix | Permanent |
| Stack Frames | Conversation frames with checkpoints | `.claude/stack-conversation/` | Session-scoped |
| Agent State | Inter-agent coordination and delegation state | ETS snapshots | Session-scoped |

## Session Serialization Protocol

The serialization protocol captures session state in a structured format that enables deterministic restoration.

```elixir
defmodule PrismaticClaude.ContextPreservation do
  @moduledoc """
  Manages session context serialization and restoration.
  Ensures zero information loss across session boundaries.
  """

  @type session_context :: %{
    session_id: String.t(),
    started_at: DateTime.t(),
    objectives: [String.t()],
    completed_actions: [action()],
    decisions: [decision()],
    files_modified: [file_change()],
    quality_state: quality_snapshot(),
    next_steps: [String.t()],
    agent_coordination: map()
  }

  @spec save_context(session_context()) :: {:ok, String.t()} | {:error, term()}
  def save_context(context) do
    filename = generate_filename(context)
    content = serialize_to_markdown(context)

    with :ok <- validate_completeness(context),
         :ok <- File.write(context_path(filename), content) do
      {:ok, filename}
    end
  end

  @spec restore_latest() :: {:ok, session_context()} | {:error, :no_context}
  def restore_latest do
    case find_latest_session() do
      nil -> {:error, :no_context}
      path -> parse_session_context(path)
    end
  end

  defp validate_completeness(context) do
    required_fields = [:objectives, :completed_actions, :decisions, :quality_state]

    missing = Enum.filter(required_fields, fn field ->
      is_nil(Map.get(context, field)) or Map.get(context, field) == []
    end)

    case missing do
      [] -> :ok
      fields -> {:error, {:incomplete_context, fields}}
    end
  end
end
```

## Key Capabilities

- **Session state serialization** capturing the complete state of an active session including modified files, decision records, quality [metrics](/glossary/metrics/), and agent coordination state
- **Context restoration** rebuilding session awareness from saved context files, enabling seamless continuation of multi-session development campaigns
- **Quality DNA continuity** preserving and restoring quality state information across sessions to prevent quality regression between development cycles
- **Decision provenance tracking** maintaining traceable records of why specific technical decisions were made, preventing future sessions from revisiting settled questions
- **Stack frame management** supporting the stack-based conversation [protocol](/glossary/protocol/) by preserving frame state, checkpoints, and branch points across session boundaries
- **Automatic context summarization** compressing verbose session logs into concise 200-300 word summaries that capture the essential state for rapid session startup

## Context Restoration Pipeline

When a new session begins, the Context Preservation Specialist executes a restoration pipeline that rebuilds session awareness.

| Restoration Phase | Data Source | Output | Duration |
|---|---|---|---|
| Latest session discovery | `.claude/session-context/` directory | Most recent context file path | < 100ms |
| Context parsing | Session markdown file | Structured session context | < 200ms |
| Quality DNA loading | `current-state.json` per app | Quality baseline snapshot | < 500ms |
| Stack frame restoration | Stack conversation directory | Active frame state | < 100ms |
| Agent state reconstruction | Session context + ETS | Agent coordination map | < 300ms |
| Debrief generation | All restored context | 200-300 word summary | < 1s |

## Cross-Session Continuity

The agent implements a continuity verification system that detects gaps between sessions. When a new session starts, the specialist compares the current codebase state against the last saved context to identify changes that occurred outside of tracked sessions.

```elixir
defmodule PrismaticClaude.ContinuityVerifier do
  @spec verify_continuity(session_context()) :: {:ok, :continuous} | {:ok, :gap_detected, [change()]}
  def verify_continuity(last_context) do
    current_state = capture_current_state()
    external_changes = diff_states(last_context.quality_state, current_state)

    case external_changes do
      [] -> {:ok, :continuous}
      changes -> {:ok, :gap_detected, changes}
    end
  end
end
```

## Integration

| Component | Relationship |
|---|---|
| Stack Conversation [GenServer](/glossary/genserver/) | Frame state persistence and restoration |
| Quality DNA System | Quality score continuity across sessions |
| AIAD Registry | Agent specification state snapshots |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Issue tracking state synchronization |
| Platform [Telemetry](/glossary/telemetry/) | Session duration and restoration metrics |

## Authority Level

**L3** - Strategic Command. Multi-domain coordination and specialized operational command. The Context Preservation Specialist has read access to all platform state required for comprehensive context capture and write access to the session context directory structure.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [context-compression-enforcer-agent](/agents/context-compression-enforcer-agent/) | Compression Partner | Compresses context data for efficient storage while preserving essential information |
| [chatgpt-context-manager](/agents/chatgpt-context-manager/) | External Context | Manages context for ChatGPT integration sessions |
| [session-context-coordinator](/agents/session-context-coordinator/) | Session Partner | Coordinates session context across multiple parallel sessions |
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Debrief Generation | Produces session summaries for rapid context restoration |

## Enforcement

Context preservation operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No session is permitted to end without a context save operation. Incomplete context saves that omit critical state information are treated as L2 violations. The NABLA [Provenance Mandatory](/glossary/provenance-mandatory/) axiom requires all preserved context to include traceable provenance, ensuring that restored sessions can verify the origin and reliability of every piece of preserved state. Context files that fail integrity verification during restoration are flagged and the session starts with explicit acknowledgment of the gap.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)