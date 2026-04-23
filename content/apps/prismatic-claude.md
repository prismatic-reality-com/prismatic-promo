+++
title = "Prismatic Claude"
weight = 9
[extra]
icon = "brain"
color = "violet"
description = "Claude AI integration with stack-based conversation management and session lifecycle"
category = "AI"
files = "680"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 869
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Claude", "apps", "Prismatic Platform", "PrismaticClaude", "GenServer"]
tags = ["apps", "ai", "prismatic-claude", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Claude - Prismatic Platform"
+++

## Overview

Prismatic Claude provides the deep integration layer between the Prismatic Platform and Anthropic's Claude AI models, implementing stack-based conversation management, session lifecycle hooks, and the infrastructure for AI-assisted development, quality enforcement, and autonomous platform evolution. The StackConversation [GenServer](/glossary/genserver/) implements a frame-based conversation model where every interaction is tracked as an immutable frame on a stack, supporting operations including checkpoint creation, conversation forking, frame popping, and checkpoint restoration.

AI-assisted development requires structured conversation management that preserves context across interactions, enforces quality gates at session boundaries, and enables exploration of alternative approaches through conversation branching. Without structured conversation tracking, context is lost between sessions, quality checks are skipped, and the relationship between AI interactions and code changes becomes untraceable. Prismatic Claude solves this by providing an [OTP](/glossary/otp/)-compliant infrastructure for conversation state management, session lifecycle automation, and [quality DNA](/glossary/quality-dna/) persistence across sessions.

The SessionLifecycle GenServer manages hooks that execute at four session boundaries (session_start, pre_command, post_command, session_end), ensuring [quality gates](/glossary/quality-gates/), evolution triggers, and context preservation happen automatically. A [circuit breaker](/glossary/circuit-breaker/) pattern protects against cascading failures from flaky [mix task](/glossary/mix-task/)s, auto-opening after three consecutive failures and auto-resetting after 60 seconds. The application manages bidirectional communication between human operators and the 404+ agent ecosystem through [Prismatic Agents](/apps/prismatic-agents/).

## Architecture

The architecture centers on two core GenServers -- StackConversation for frame management and SessionLifecycle for hook execution -- supported by quality DNA persistence and telemetry event emission.

```
User Input
       |
  StackConversation (Frame Creation)
  (immutable frame with input/output summary)
       |
  SessionLifecycle (Hook Execution)
  (pre_command quality gates, post_command evolution)
       |
  Agent Dispatch --> [404+ Agents]
       |
  Quality DNA Update --> Telemetry Events
       |
  Frame Completion --> Stack Update
       |
  ETS + Disk Persistence
  (.claude/stack-conversation/)
```

The process topology uses a one-for-one supervisor with the two primary GenServers and telemetry setup:

```
PrismaticClaude.Application (Supervisor, :one_for_one)
+-- PrismaticClaude.StackConversation (GenServer, 1128 lines)
|     ETS-backed frame storage with disk persistence
|     Commands: get_stack, get_frame, pop, fork, checkpoint, goto
+-- PrismaticClaude.SessionLifecycle (GenServer, 905 lines)
|     Hook registration, execution, circuit breaker
|     Phases: session_start, pre_command, post_command, session_end
+-- PrismaticClaude.Telemetry (setup)
      Event handler registration
```

User input triggers frame creation in StackConversation. The frame records input summary, assumptions, and decisions. SessionLifecycle executes registered hooks for the current phase. Hooks run mix tasks in isolated processes with timeout protection. The circuit breaker prevents cascading failures. After agent dispatch and response generation, the frame is completed with output summary and persisted to [ETS](/glossary/ets/) and disk.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticClaude.StackConversation` | GenServer: frame-based conversation tracking with ETS and disk persistence |
| `PrismaticClaude.SessionLifecycle` | GenServer: hook execution at session boundaries with circuit breaker |
| `PrismaticClaude.SessionHooks` | Default hook implementations for quality gates and evolution triggers |
| `PrismaticClaude.QualityDna` | Cross-session quality state persistence in JSON format |
| `PrismaticClaude.Telemetry` | [Telemetry](/glossary/telemetry/) event setup for conversation and session [metrics](/glossary/metrics/) |

Frame [immutability](/glossary/immutability/) is a core design principle. Once a frame is created and completed, it cannot be modified. The `pop` operation removes frames from the stack but does not alter them. The `fork` operation creates a new branch starting from a specified frame, preserving the original stack.

The circuit breaker tracks consecutive failures per hook. After three failures, the circuit opens, bypassing the hook for 60 seconds. After the reset timeout, the circuit enters half-open state, allowing one test execution. Success closes the circuit; failure reopens it.

```elixir
defmodule PrismaticClaude.StackConversation do
  use GenServer

  @type frame :: %{
    id: pos_integer(),
    input_summary: String.t(),
    output_summary: String.t(),
    assumptions: [String.t()],
    decisions: [String.t()],
    timestamp: DateTime.t(),
    checkpoint: String.t() | nil
  }
end
```

## Configuration

```elixir
config :prismatic_claude,
  stack_persistence_path: ".claude/stack-conversation/",
  quality_dna_path: ".claude/quality-dna/current-state.json",
  session_context_path: ".claude/session-context/",
  circuit_breaker: %{
    failure_threshold: 3,
    reset_timeout: 60_000,
    half_open_max: 1
  },
  default_hooks: [:autoheal_baseline, :quality_gates, :autoevolve_scan, :session_save]
```

The stack persistence path controls where frame data is written to disk for cross-session continuity. Quality DNA path specifies the JSON file maintaining quality state across sessions. The circuit breaker configuration controls failure thresholds and reset timing. Default hooks define which session lifecycle hooks are registered on application startup.

## API Reference

```elixir
# Stack operations
@spec get_stack() :: {:ok, [frame()]}
PrismaticClaude.StackConversation.get_stack()

@spec get_frame(pos_integer()) :: {:ok, frame()} | {:error, :not_found}
PrismaticClaude.StackConversation.get_frame(5)

@spec pop(pos_integer()) :: {:ok, [frame()]}
PrismaticClaude.StackConversation.pop(2)

@spec fork(pos_integer(), String.t()) :: {:ok, [frame()]}
PrismaticClaude.StackConversation.fork(3, "alternative-approach")

@spec checkpoint(String.t()) :: :ok
PrismaticClaude.StackConversation.checkpoint("before-refactor")

@spec goto(String.t()) :: :ok | {:error, :not_found}
PrismaticClaude.StackConversation.goto("before-refactor")

# Session lifecycle triggers
@spec trigger(atom()) :: :ok
PrismaticClaude.SessionLifecycle.trigger(:session_start)
PrismaticClaude.SessionLifecycle.trigger(:pre_command)
PrismaticClaude.SessionLifecycle.trigger(:post_command)
PrismaticClaude.SessionLifecycle.trigger(:session_end)

# Hook registration
@spec register_hook(map()) :: :ok
PrismaticClaude.SessionLifecycle.register_hook(%{
  name: "custom-quality-check",
  phase: :pre_command,
  priority: 50,
  callback: &MyModule.quality_check/1,
  enabled: true
})
```

## Testing

StackConversation tests verify frame creation, immutability, pop, fork, checkpoint, and goto operations. Circuit breaker tests verify state transitions through closed, open, and half-open states. Full session lifecycle tests exercise hook registration, execution, and circuit breaker behavior with simulated mix task failures.

Property-based tests use StreamData generators to produce random frame sequences, verifying that stack operations maintain consistency and that checkpoint/goto operations are reversible. Telemetry event emission is verified for all significant operations.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Agents](/apps/prismatic-agents/) | Agent dispatch and execution for 404+ agents |
| [Prismatic Safety](/apps/prismatic-safety/) | Quality gates and floor guardian enforcement |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Event emission and metrics collection |
| [Prismatic Storage](/apps/prismatic-storage/) | Stack and session persistence through storage adapters |
| [Prismatic Web](/apps/prismatic-web/) | Development workflow dashboard integration |
| [Prismatic Annihilation](/apps/prismatic-annihilation/) | Auto-evolution trigger integration |

External integrations include Anthropic Claude API for AI model interaction, [Ollama](/glossary/ollama/) for local AI model execution, and the Mix build system for quality gate tasks.

## NABLA Compliance

| NABLA Axiom | Claude Enforcement | Implementation |
|-------------|-------------------|----------------|
| Provenance Mandatory | Every frame carries timestamp, input/output summary, decisions | Frame immutability ensures provenance chain integrity |
| Signal Plurality | Session hooks aggregate signals from multiple quality checks | Multiple independent quality gates at each session boundary |
| Contradiction Preservation | Fork operations preserve alternative approaches | Original stack preserved when branching |
| Time Decay | Session context includes temporal metadata | Quality DNA tracks state evolution over time |
| Unknown Valid | Circuit breaker acknowledges system uncertainty | Hook failures explicitly tracked rather than silently swallowed |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Frame creation | < 1ms | ETS write + async disk persist |
| Stack retrieval | < 100 microseconds | ETS read |
| Checkpoint creation | < 1ms | ETS metadata update |
| Hook execution | 100ms-30s | Depends on mix task duration |
| Circuit breaker check | < 1 microsecond | State comparison |

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 256 MB |
| Disk | 50 MB | 200 MB (session history) |

Telemetry events: `[:prismatic_claude, :stack_conversation, :frame_created]`, `[:prismatic_claude, :session_lifecycle, :hook_executed]`, `[:prismatic_claude, :session_lifecycle, :circuit_opened]`.

## Related Resources

- [Prismatic Agents](/apps/prismatic-agents/) -- Agent runtime
- [Prismatic Safety](/apps/prismatic-safety/) -- Quality enforcement
- [Anthropic Claude](https://claude.ai/) -- AI model provider
- [Ollama](https://ollama.ai/) -- Local AI model runtime
- [ChatGPT Analyze](/agents/chatgpt-analyze/) -- Multi-model intelligence workflows
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Autonomous platform evolution through session lifecycle hooks
- [DX Brutalist Analyst](/agents/dx-brutalist-analyst/) -- Developer experience evaluation of the Claude integration layer
- [AIAD Standard](/capabilities/aiad-standard/) -- Interface between Claude AI sessions and the agent ecosystem
- [Session Discipline](/capabilities/session-discipline/) -- Mandatory session lifecycle requirements enforcement
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Epistemic framework for AI-generated claims

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)