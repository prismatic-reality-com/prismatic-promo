+++
title = "session-debrief-specialist"
weight = 370
[extra]
domain = "p0-critical"
level = "L3"
description = "Captures, structures, and persists session knowledge artifacts ensuring cross-session development continuity"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2300
quality_score = 87
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-debrief-specialist", "Captures", "agents", "agent", "Prismatic Platform", "Session", "PrismaticClaude", "Automated"]
tags = ["agents", "agent", "session-debrief-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "session-debrief-specialist - Prismatic Platform"
+++

## Overview

The session-debrief-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's P0-critical operational domain, responsible for capturing, structuring, and persisting the knowledge artifacts generated during each Claude development session. Every session produces decisions, code changes, architectural insights, and contextual understanding that would be lost without systematic debriefing. This agent ensures that session intelligence is preserved in structured formats that enable cross-session continuity and prevent knowledge regression.

Governed by the [AIAD](@/glossary/aiad.md) standard and the platform's Mandatory [Session Discipline](@/glossary/session-discipline.md) [Protocol](@/glossary/protocol.md), the session-debrief-specialist enforces the requirement that every session produces a persistent context record stored in `.claude/session-context/`. The [NO MERCY](@/glossary/no-mercy.md) doctrine applies to session documentation: no session ends without a debrief artifact, no debrief is accepted without covering objectives, actions, files modified, decisions made, and recommended next steps.

In a platform with over 430 agents, 90 applications, and 2.8 million lines of code, the cost of knowledge loss between sessions is substantial. A developer returning to a complex investigation without session context may spend hours re-discovering what was already understood, make decisions that contradict previous architectural rationale, or repeat debugging work that was already completed. The session-debrief-specialist eliminates this waste by ensuring that every session's output is captured in a form that enables immediate productive continuation.

## Operational Domain

The P0-critical session management domain covers the complete session lifecycle: context loading at session start, progressive knowledge capture during the session, and structured debrief generation at session end. The agent interacts with the Stack-Based Conversation Mode infrastructure to extract frame-level decision records and the Session Lifecycle [GenServer](@/glossary/genserver.md) (`PrismaticClaude.SessionLifecycle`) to trigger mandatory debriefing workflows. Session context files follow standardized naming (`YYYY-MM-DD-{description}-session.md`) and format conventions that enable automated parsing and indexing.

The domain extends to quality preservation. Session debriefs include quality metric snapshots that enable detection of quality regressions introduced during the session, providing a forensic record that the Quality Floor Guardian can reference when investigating quality changes.

## Key Capabilities

- **Automated context extraction** -- Analyzes session activity to extract key decisions, file modifications, architectural changes, and unresolved questions without requiring manual summarization. Extraction uses structured parsing of conversation frames and git diff analysis
- **Structured debrief generation** -- Produces session debrief documents with standardized sections: objectives, actions taken, files modified, deliverables, key decisions, open questions, and recommended next steps. Each section follows a defined schema
- **Cross-session continuity** -- Loads and integrates previous session contexts to maintain knowledge continuity, preventing redundant investigation and decision reversal across development sessions
- **[Quality DNA](@/glossary/quality-dna.md) updates** -- Propagates session outcomes into the platform's Quality DNA persistence layer at `.claude/quality-dna/current-state.json`, maintaining the canonical record of platform quality state
- **GitLab issue integration** -- Links session debriefs to corresponding GitLab issues per the Mandatory Session Discipline Protocol, ensuring traceability between development sessions and issue tracking
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with triggered debrief workflows at session lifecycle boundaries
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing session lifecycle events under `:prismatic_claude, :session_lifecycle` namespace

## Debrief Document Schema

Every session debrief follows a standardized schema that enables automated processing and cross-session analysis.

| Section | Required | Content | Purpose |
|---------|----------|---------|---------|
| **Session Metadata** | Yes | Date, duration, session ID, agent call sign | Identification and indexing |
| **Objectives** | Yes | What the session aimed to accomplish | Intent tracking |
| **Actions Taken** | Yes | Specific work performed with file references | Activity record |
| **Files Modified** | Yes | Complete list of changed files with change descriptions | Change tracking |
| **Deliverables** | Yes | Concrete outputs produced | Outcome verification |
| **Key Decisions** | Yes | Architectural and design choices with rationale | Decision preservation |
| **Quality Metrics** | Yes | Quality score snapshot before and after session | Quality tracking |
| **Open Questions** | Conditional | Unresolved items requiring future attention | Continuity support |
| **Next Steps** | Yes | Recommended follow-up actions with priority | Work planning |
| **Related Sessions** | Conditional | Links to prerequisite or dependent sessions | Continuity graph |

## Session Lifecycle Integration

The session-debrief-specialist participates in every phase of the session lifecycle through the SessionLifecycle GenServer's hook system.

| Lifecycle Phase | Debrief Action | Priority |
|----------------|---------------|----------|
| **session_start** | Load previous debrief, verify continuity from last session | 10 (high) |
| **pre_command** | Record command intent for activity tracking | 50 (medium) |
| **post_command** | Capture command outcomes and file changes | 50 (medium) |
| **session_end** | Generate full debrief document, persist to context store | 5 (highest) |

## Debrief Quality Standards

Session debriefs must meet quality standards before they are accepted into the context store. These standards ensure that debriefs provide sufficient value for cross-session continuity.

| Standard | Threshold | Enforcement |
|----------|-----------|-------------|
| **Completeness** | All required sections present and non-empty | L2 BLOCK if missing |
| **Specificity** | File paths use full absolute paths, not relative | Automated validation |
| **Decision rationale** | Every key decision includes "why" not just "what" | Manual review flag |
| **Actionability** | Next steps are specific enough to execute | Automated complexity check |
| **Accuracy** | File modification list matches actual git changes | Git diff cross-validation |

## Authority Level

**L3** - Strategic Command - P0-critical authority to enforce mandatory session debriefing and block session termination without proper context persistence. The agent has the authority to delay session conclusion until debrief obligations are satisfied.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/session debrief` | Generate session debrief for the current session | L3+ |
| `/session context` | Load and display the most recent session context | L3+ |
| `/session history` | List available session context files with summaries | L3+ |
| `/session validate` | Verify current session has met all debrief requirements | L2+ |
| `/session save` | Force save current session context to persistence store | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [session-context-coordinator](@/agents/session-context-coordinator.md) | Coordinates context loading using debriefs produced by this agent |
| [session-context-synthesizer](@/agents/session-context-synthesizer.md) | Synthesizes patterns across multiple debriefs |
| [session-compressor-specialist](@/agents/session-compressor-specialist.md) | Compresses older debriefs to manage storage growth |
| [session-pattern-analyzer](@/agents/session-pattern-analyzer.md) | Analyzes debrief content for recurring patterns |
| [code-quality-commander](@/agents/code-quality-commander.md) | Session outcomes inform quality posture updates |
| [Mycelial Genetic Evolver Agent](@/agents/mycelial-genetic-evolver-agent.md) | Session learning feeds into evolutionary adaptation cycles |

## Implementation Architecture

The session-debrief-specialist integrates with the `PrismaticClaude.SessionLifecycle` GenServer (905 lines) and `PrismaticClaude.SessionHooks` (522 lines) for lifecycle event handling. The implementation uses a circuit breaker pattern that auto-opens after 3 failures and auto-resets after 60 seconds, preventing cascading failures from flaky mix tasks during debrief generation.

Session context files are stored as structured Markdown with YAML frontmatter, enabling both human readability and automated parsing. The naming convention `YYYY-MM-DD-{description}-session.md` supports chronological ordering and topic-based discovery.

## Enforcement

Session debriefing is P0 mandatory under the Session Discipline Protocol. The [NO MERCY](@/glossary/no-mercy.md) doctrine enforces that no session concludes without a persisted debrief artifact. Sessions without proper context saves are flagged as L2 violations. All debrief content must include traceable provenance per [NABLA Infinity](@/glossary/nabla-infinity.md) requirements, ensuring that every recorded decision, metric, and recommendation can be traced to its origin within the session.

## Related Agents

Agents in the **P0-critical** domain ensure that the platform's most essential operational requirements are met without exception. The session-debrief-specialist guarantees that development knowledge persists across session boundaries, transforming ephemeral conversation context into durable institutional knowledge that compounds across the platform's entire development history.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)