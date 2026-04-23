+++
title = "Claude (Anthropic)"
weight = 41
[extra]
category = "ai-ml"
description = "Advanced AI assistant from Anthropic for code generation, analysis, reasoning, and autonomous agent operations"
url = "https://www.anthropic.com"
version = "Opus 4.6"
icon = "claude"
color = "orange"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1053
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Claude", "Anthropic", "Advanced", "technologies", "ai ml", "Prismatic Platform", "Elixir", "Good"]
tags = ["technologies", "ai-ml", "claude-anthropic", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Claude (Anthropic) - Prismatic Platform"
+++

## Overview

Claude is the primary frontier AI model powering the Prismatic Platform's most sophisticated operations. Developed by Anthropic, Claude Opus 4.6 provides the reasoning, code generation, and analysis capabilities that drive the platform's autonomous agent system, quality enforcement, and self-evolution mechanisms. Claude is not merely an API integration -- it is the cognitive engine behind the platform's most ambitious capabilities, from autonomous code generation to epistemic verification.

The Prismatic Platform integrates Claude through its Agent SDK for interactive development sessions, code review and generation, architecture analysis, and complex problem-solving. Claude serves as the "brain" behind the platform's most advanced operations -- from the ARCHER SUPREME tactical commander to the quality DNA evolution system. Every line of platform code written with Claude assistance passes through the same [NO MERCY](/capabilities/no-mercy/) quality gates as manually written code, ensuring AI-generated output meets production standards.

Claude's integration extends beyond simple API calls -- the platform maintains sophisticated session context management, stack-based conversation tracking, and quality-aware prompting that ensures every Claude interaction adheres to the platform's doctrines and standards. The session lifecycle system tracks conversation state, enforces quality gates before and after each interaction, and maintains persistent context across development sessions for continuity.

## Key Features

Claude provides a comprehensive set of AI capabilities that the platform leverages across code generation, analysis, and autonomous agent operations.

- **Advanced Reasoning**: Multi-step logical reasoning for complex architecture decisions and debugging scenarios
- **Code Generation**: Production-quality [Elixir](/technologies/elixir/), TypeScript, SQL, and infrastructure code with type specifications
- **Long Context**: 200K+ token context window enabling analysis of entire application modules and cross-module dependencies
- **Tool Use**: Function calling for structured agent interactions, enabling Claude to invoke platform tools and APIs
- **Vision**: Image and document analysis capabilities for UI review, architecture diagrams, and security screenshot analysis
- **Safety**: Constitutional AI alignment ensuring reliable, consistent outputs aligned with platform values
- **Session Continuity**: Persistent context across development sessions through the stack-based conversation system
- **Quality Awareness**: Integration with platform quality gates ensuring all generated code meets the zero-defect standard

| Capability | Platform Application | Integration Point |
|------------|---------------------|-------------------|
| Code generation | New module creation, refactoring | Claude Agent SDK sessions |
| Architecture analysis | Cross-module dependency review | Long context window |
| Bug diagnosis | Root cause analysis from error traces | Reasoning + tool use |
| Test generation | Comprehensive test suite creation | Code generation + ExUnit patterns |
| Quality enforcement | Credo/Dialyzer compliance | Session lifecycle hooks |
| Documentation | Module and function documentation | Code generation + docstrings |
| Security review | Vulnerability pattern detection | Reasoning + platform knowledge |

## Platform Integration

Claude powers the platform's AI-driven development and analysis workflows through a dedicated OTP application that manages session state, conversation history, and lifecycle hooks.

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  Manages Claude session lifecycle with quality gate enforcement.
  Triggers platform hooks at session start, pre/post-command, and session end.
  """
  use GenServer

  @impl true
  def init(state) do
    hooks = PrismaticClaude.SessionHooks.default_hooks()
    {:ok, Map.put(state, :hooks, hooks)}
  end

  @spec trigger(atom()) :: {:ok, list()}
  def trigger(phase) when phase in [:session_start, :pre_command, :post_command, :session_end] do
    GenServer.call(__MODULE__, {:trigger, phase})
  end

  @impl true
  def handle_call({:trigger, phase}, _from, state) do
    results = execute_hooks(state.hooks, phase)
    {:reply, {:ok, results}, state}
  end

  defp execute_hooks(hooks, phase) do
    hooks
    |> Enum.filter(& &1.phase == phase)
    |> Enum.sort_by(& &1.priority)
    |> Enum.map(&execute_single_hook/1)
  end

  defp execute_single_hook(hook) do
    case hook.function.() do
      {:ok, result} -> {:ok, hook.name, result}
      {:error, reason} -> {:error, hook.name, reason}
    end
  end
end
```

The stack-based conversation system maintains immutable frames that track the evolution of a development session:

```elixir
defmodule PrismaticClaude.StackConversation do
  @moduledoc """
  Stack-based conversation tracking with immutable frames.
  Provides /stack, /frame, /pop, /fork, /checkpoint, /goto commands.
  """
  use GenServer

  @type frame :: %{
    id: non_neg_integer(),
    input_summary: String.t(),
    output_summary: String.t(),
    assumptions: [String.t()],
    decisions: [String.t()],
    timestamp: DateTime.t()
  }

  @spec push_frame(frame()) :: :ok
  def push_frame(frame) do
    GenServer.call(__MODULE__, {:push, frame})
  end

  @spec get_stack() :: [frame()]
  def get_stack do
    GenServer.call(__MODULE__, :get_stack)
  end

  @spec checkpoint(String.t()) :: :ok
  def checkpoint(name) do
    GenServer.call(__MODULE__, {:checkpoint, name})
  end
end
```

## Architecture

Claude integration follows a layered architecture that separates the AI model interface from the platform's business logic and quality enforcement.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Model Interface | Anthropic API Client | HTTP communication, token management, retry logic |
| Session Management | SessionLifecycle GenServer | Lifecycle hooks, phase management, circuit breaker |
| Conversation State | StackConversation GenServer | Immutable frame tracking, checkpoints, branching |
| Quality Gates | SessionHooks | Pre/post-command quality checks, autoheal triggers |
| Context Persistence | Session Context Files | `.claude/session-context/` file management |
| Quality DNA | Quality State Tracking | `.claude/quality-dna/current-state.json` maintenance |
| Agent Integration | PrismaticAgents | Claude-powered autonomous agent behaviors |

The circuit breaker pattern protects the platform from cascading failures when Claude API calls fail, automatically opening after 3 consecutive failures and resetting after 60 seconds. This ensures that transient API issues do not disrupt other platform operations.

## Performance Characteristics

Claude integration performance is optimized for interactive development sessions where response latency directly impacts developer productivity.

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Simple query response | 2-5 seconds | Short code generation, Q&A |
| Complex generation | 10-30 seconds | Full module creation with tests |
| Architecture analysis | 15-45 seconds | Cross-module dependency review |
| Context window utilization | 50-150K tokens | Typical session with codebase context |
| Session hook overhead | < 500ms | Quality gate checks per interaction |
| Conversation frame creation | < 10ms | Local GenServer operation |
| Session context save | < 100ms | File write to disk |

The platform caches Claude responses in [ETS](/technologies/ets/) for repeated queries (e.g., module documentation lookups) to reduce API calls and improve responsiveness during iterative development cycles.

## Configuration

Claude integration is configured through the application environment with model selection, token limits, and session management parameters.

```elixir
config :prismatic_claude,
  model: "claude-opus-4-6",
  max_tokens: 8192,
  session_context_path: ".claude/session-context/",
  stack_conversation_enabled: true,
  quality_dna_path: ".claude/quality-dna/current-state.json",
  circuit_breaker: [
    max_failures: 3,
    reset_timeout: 60_000
  ],
  hooks: [
    session_start: [:autoheal_baseline, :load_session_context],
    pre_command: [:quality_gates_check],
    post_command: [:autoevolve_scan],
    session_end: [:autoheal_cycle, :save_session_context]
  ]
```

## Best Practices

The platform enforces specific practices for Claude integration to ensure AI-assisted development maintains the same quality standards as manual development.

- **Always run quality gates on generated code** -- Claude output passes through the same Credo, [Dialyzer](/technologies/dialyzer/), and compilation checks as manually written code
- **Maintain session context** -- save and load session context files to maintain continuity across development sessions
- **Use the stack conversation system** -- track assumptions and decisions in immutable frames for audit trail and context recovery
- **Never bypass quality hooks** -- the SessionLifecycle hooks enforce quality standards at every interaction point
- **Provide sufficient context** -- leverage the 200K+ token window to include relevant module source, test files, and documentation
- **Review all generated code** -- AI-generated code requires the same review rigor as human-written code before committing
- **Monitor API costs** -- track token usage per session to optimize prompt engineering and reduce unnecessary API calls
- **Use local AI as fallback** -- the platform supports [Ollama](/technologies/ollama/) as a local fallback for non-critical operations

## Comparison

Claude was selected as the platform's primary AI model after evaluating multiple frontier models on Elixir code generation quality, reasoning depth, and tool use reliability. Its understanding of OTP patterns and supervision tree design makes it particularly effective for Elixir-specific architecture recommendations.

| Criterion | Claude (Opus 4.6) | GPT-4 | Gemini | Local (Ollama) |
|-----------|-------------------|-------|--------|----------------|
| Elixir code quality | Excellent | Good | Good | Moderate |
| Long context | 200K tokens | 128K tokens | 1M tokens | 8-32K tokens |
| Tool use reliability | Excellent | Good | Good | Limited |
| Reasoning depth | Excellent | Excellent | Good | Limited |
| API latency | 2-30s | 2-20s | 2-15s | 1-5s |
| Cost per session | Moderate | Moderate | Lower | Free (local) |
| Privacy | Cloud API | Cloud API | Cloud API | Fully local |
| Platform integration | Deep (Agent SDK) | API only | API only | Ollama Coordinator |

## Related Technologies

- [Ollama](/technologies/ollama/) - Local AI alternative for offline development and non-critical operations
- [Elixir](/technologies/elixir/) - Primary language that Claude generates and analyzes
- [BEAM](/technologies/beam/) - Runtime hosting the Claude integration GenServers
- [ETS](/technologies/ets/) - Response caching for repeated queries
- [Credo](/technologies/credo/) - Code quality validation applied to Claude-generated code
- [Dialyzer](/technologies/dialyzer/) - Type safety verification for AI-generated functions

## Related Apps

- [prismatic_claude](/apps/prismatic-claude/) - Claude integration layer with SessionLifecycle and StackConversation
- [prismatic_agents](/apps/prismatic-agents/) - Claude-powered autonomous agent behaviors and decision making
- [prismatic_safety](/apps/prismatic-safety/) - Quality enforcement applied to all Claude-generated output

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)