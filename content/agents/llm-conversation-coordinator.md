+++
title = "llm-conversation-coordinator"
weight = 223
[extra]
domain = "aiad-enhanced"
level = "L3"
description = "Multi-turn conversation management with context preservation, memory integration, and session continuity across LLM interactions"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-conversation-coordinator", "Multi-turn", "agents", "agent", "Prismatic Platform", "AIAD", "Context"]
tags = ["agents", "agent", "llm-conversation-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-conversation-coordinator - Prismatic Platform"
+++

## Overview

The llm-conversation-coordinator is an L3 [Strategic Command](/glossary/strategic-command/) agent operating within the [AIAD](/glossary/aiad/)-enhanced domain of the Prismatic Platform. This agent manages multi-turn conversations with large language models, ensuring context preservation across conversation turns, integrating platform memory systems for long-term continuity, and maintaining session state that enables coherent extended interactions. While individual LLM requests are stateless, many platform operations require multi-step interactions where later turns depend on the context established in earlier turns. The conversation coordinator provides the state management infrastructure that makes these extended interactions reliable and coherent.

Built on the [AIAD](/glossary/aiad/) standard, the llm-conversation-coordinator implements the platform's stack-based conversation mode, where each interaction frame is immutable and the active conversation state is defined solely by the current stack. This model provides deterministic conversation behavior, enables fork/checkpoint/rollback operations for experimental dialogue branches, and prevents the context contamination that occurs when conversation history is silently modified.

## Conversation Management Architecture

The conversation management architecture consists of three core subsystems: the conversation state machine, the memory integration layer, and the context composition engine.

The conversation state machine tracks the lifecycle of multi-turn conversations from initiation through completion. Each conversation maintains an ordered stack of interaction frames, where each frame captures the user input, assistant output, key assumptions, key decisions, and any context mutations that occurred during that turn. The state machine enforces frame immutability -- once a frame is committed to the stack, it cannot be modified, only supplemented by new frames or removed through explicit pop operations.

The memory integration layer connects conversations to the platform's persistent memory systems. Short-term memory (maintained within the conversation stack) provides immediate context from recent turns. Medium-term memory (maintained in session context files) provides continuity across conversations within a development session. Long-term memory (maintained in the platform's knowledge base and quality DNA) provides institutional knowledge that persists across sessions. The memory integration layer determines which memory sources to consult for each conversation turn and how to integrate retrieved memories into the active context.

The context composition engine assembles the complete context for each LLM request by combining the conversation history (from the stack), relevant memories (from the integration layer), platform state (from telemetry and configuration), and task-specific context (from the [llm-context-optimizer](/agents/llm-context-optimizer/)). The composition engine manages the trade-off between context comprehensiveness and token budget, using conversation-aware prioritization that weights recent turns more heavily than distant turns and active decisions more heavily than settled questions.

## Key Capabilities

- **Stack-based conversation tracking** -- Maintains immutable conversation frames in an ordered stack, providing deterministic conversation state management with fork, checkpoint, and rollback capabilities
- **Context preservation** -- Preserves essential context across conversation turns, preventing information loss that would require users to repeat earlier context
- **Memory integration** -- Connects conversations to short-term, medium-term, and long-term memory systems for continuity across turns, sessions, and extended time periods
- **Session continuity** -- Saves and restores conversation state across session boundaries, enabling users to resume interrupted conversations with full context
- **Conversation branching** -- Supports fork operations that create parallel conversation branches from a common ancestor frame, enabling exploration of alternative approaches without losing the original conversation path
- **Summary generation** -- Produces concise conversation summaries that capture key decisions, outcomes, and open questions for efficient context loading in future sessions
- **[GenServer](/glossary/genserver/)-based state management** -- Implements conversation state as an [OTP](/glossary/otp/) GenServer with crash recovery and state persistence
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with automatic session context saving and recovery
- **[Telemetry integration](/capabilities/telemetry-integration/)** for conversation quality metrics and context utilization tracking

## Stack Operations

The conversation stack supports several operations that provide precise control over conversation state.

**Push** adds a new frame to the top of the stack, representing a completed interaction turn. Each pushed frame is immutable once committed.

**Pop** removes the most recent N frames from the stack, effectively "undoing" recent conversation turns. Popped frames are archived but no longer contribute to the active conversation context.

**Fork** creates a new conversation branch from a specified frame, copying the stack up to that point and allowing divergent exploration. The original branch is preserved and can be returned to.

**Checkpoint** marks the current frame with a named label, enabling direct navigation to a known conversation state. Checkpoints serve as bookmarks for significant conversation milestones.

**Goto** restores the conversation stack to a checkpointed state, replacing the current stack with the stack as it existed at the checkpoint. This enables non-linear conversation navigation.

## Session Persistence

Conversation state persists across session boundaries through the platform's session context system. At session end, the coordinator serializes the active conversation stack, memory references, and configuration state to a session context file in the `.claude/session-context/` directory. At session start, the coordinator checks for existing session context and offers to resume the previous conversation with full context restoration.

The persistence format captures not just the raw conversation content but also the structural metadata: frame identifiers, checkpoint labels, fork points, and memory integration state. This metadata enables the full stack operation vocabulary to function correctly across session boundaries.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the coordinator to access platform state across all domains for context composition, manage conversation state that spans multiple agent interactions, and coordinate with memory systems for long-term continuity.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| [GenServer](/glossary/genserver/) | OTP-based conversation state management with crash recovery |
| Session Context | Persistent storage for conversation state across sessions |
| Quality DNA | Long-term platform memory integration |
| Prismatic Telemetry | Conversation quality [metrics](/glossary/metrics/) and context utilization tracking |
| [SEADF](/glossary/seadf/) | Autonomous evolution of conversation management strategies |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/stack` | Display all frames in the current conversation stack | Universal |
| `/frame N` | Show detailed contents of frame N | Universal |
| `/pop N` | Remove the last N frames from the stack | L2+ |
| `/fork N` | Branch conversation from frame N | L2+ |
| `/checkpoint <name>` | Mark the current frame with a named checkpoint | L2+ |
| `/goto <name>` | Restore the conversation to a named checkpoint | L2+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-context-optimizer**](/agents/llm-context-optimizer/) (L4) | Optimizes context composition for each conversation turn within token budget |
| [**llm-prompt-engineer**](/agents/llm-prompt-engineer/) (L3) | Provides turn-specific prompt optimization within the conversation context |
| [**llm-cost-manager**](/agents/llm-cost-manager/) (L4) | Monitors cumulative conversation cost and enforces budget limits |
| [**llm-performance-optimizer**](/agents/llm-performance-optimizer/) (L3) | Optimizes conversation round-trip latency |

## Conversation Quality Metrics

The coordinator tracks several conversation quality metrics. Context utilization measures the percentage of provided context that the LLM actually references in its response. Turn coherence measures whether each response is logically consistent with the conversation history. Task completion rate measures the percentage of multi-step tasks that reach successful completion within a single conversation. Context overflow frequency measures how often conversations exceed the available context window, requiring context trimming that may lose relevant history.

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that conversation state is reliably persisted and recoverable. No conversation data is lost due to process crashes, session termination, or system restarts. The [NO DOUBTS](/glossary/no-doubts/) principle requires that context trimming decisions (when conversation history exceeds the context window) are explicit and documented, with trimmed content accessible through the session context archive rather than permanently discarded.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)