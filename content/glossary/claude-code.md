+++
title = "Claude Code"
weight = 50
[extra]
description = "Anthropic's official CLI tool for Claude AI, providing terminal-based access to Claude's capabilities with tool use, file editing, code generation, and agentic workflows for software development"
category = "development-tools"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "AI-Assisted Development"
related_concepts = ["large-language-models", "agentic-workflows", "tool-use", "model-context-protocol", "developer-experience"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 5
prerequisites = ["terminal-usage", "git-basics", "understanding-of-llms"]
learning_path = ["llm", "claude-ai", "claude-code", "mcp", "aiad"]
interactive_demos = ["/labs/glossary/claude-code"]
code_examples = ["elixir", "bash", "yaml"]
external_resources = ["https://docs.anthropic.com/en/docs/claude-code", "https://github.com/anthropics/claude-code"]
version_introduced = "gen-15"
stability_level = "stable"
testing_scenarios = ["session-lifecycle", "hook-integration", "mcp-server-connectivity", "quality-gate-enforcement"]
keywords = ["claude-code", "cli", "anthropic", "ai-development", "agentic", "tool-use", "mcp", "code-generation", "terminal"]
tags = ["glossary", "development-tools", "ai", "cli"]
related_terms = ["claude-ai", "llm", "development-workflow", "mcp", "slash-command", "aiad", "agent", "code-generation", "quality-gate", "pre-commit-hooks", "session-discipline", "autoevolve"]
word_count = 1641
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Claude Code - Prismatic Platform"
+++

## Definition

Claude Code is Anthropic's official command-line interface (CLI) for interacting with Claude, the large language model. Unlike browser-based chat interfaces, Claude Code operates directly in the developer's terminal, providing Claude with the ability to read and edit files, execute shell commands, search codebases, interact with version control systems, and orchestrate multi-step development workflows. It transforms Claude from a conversational assistant into an agentic coding partner capable of navigating, understanding, and modifying real codebases.

## Overview

The emergence of Claude Code represents a paradigm shift in how developers interact with AI systems. Traditional AI coding assistants operate through copy-paste workflows or IDE plugins that provide suggestions in isolation. Claude Code eliminates this friction by embedding the AI directly into the developer's primary workspace -- the terminal. The tool maintains persistent context across a session, understands the structure of the project it operates within, and can chain together multiple operations (reading files, running tests, making edits, committing changes) into coherent workflows.

Claude Code's architecture centers on a tool-use model where the [LLM](/glossary/llm/) receives a set of available tools -- file reading, file writing, shell execution, web search, and others -- and decides which tools to invoke based on the developer's natural-language instructions. This approach allows Claude to handle tasks ranging from simple one-line fixes to complex multi-file refactoring operations that span hundreds of files. The tool supports extended thinking for complex reasoning, maintains conversation history within sessions, and can be configured with project-specific instructions through `CLAUDE.md` files at repository, directory, and user levels.

Key architectural characteristics include stateless shell execution (each command runs in a fresh shell context), persistent file system access, sandboxed execution with permission controls, and integration with the Model Context Protocol (MCP) for extending Claude's capabilities through external tool servers.

## Technical Details

### Core Architecture

Claude Code operates as a Node.js application that mediates between the developer and the Claude API. Its architecture consists of several interconnected layers:

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Interface** | Terminal UI | Renders conversation, handles input, displays tool outputs |
| **Orchestration** | Agent Loop | Manages tool selection, execution, and result processing |
| **Tools** | Built-in Tools | Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch |
| **Context** | CLAUDE.md System | Hierarchical project instructions (global, project, directory) |
| **Extension** | MCP Integration | External tool servers for specialized capabilities |
| **Safety** | Permission System | Controls which operations require user approval |

### Tool System

The built-in tool set provides comprehensive development capabilities:

```bash
# File operations
Read     - Read files with line numbers, PDF support, image viewing
Write    - Create or overwrite files
Edit     - Exact string replacement in existing files
Glob     - Fast file pattern matching (e.g., "**/*.ex")
Grep     - Ripgrep-powered content search with regex support

# Execution
Bash     - Shell command execution with timeout control

# Web
WebFetch - Fetch and process web content
WebSearch - Search the web for current information

# Specialized
NotebookEdit - Edit Jupyter notebook cells
Skill        - Invoke registered skills (slash commands)
```

### CLAUDE.md Configuration Hierarchy

Claude Code reads instructions from a hierarchical configuration system:

```
~/.claude/CLAUDE.md                          # Global user instructions
~/project/CLAUDE.md                          # Project-level instructions
~/project/AGENTS.md                          # Multi-agent instructions
~/project/subdir/CLAUDE.md                   # Directory-specific instructions
~/project/.claude/CLAUDE.md                  # Alternative project location
```

Each level can define coding standards, architectural guidelines, forbidden patterns, testing requirements, and workflow protocols. Lower-level files override higher-level ones for their scope, creating a composable instruction system.

### Session Lifecycle

A Claude Code session follows a defined lifecycle:

```
1. Initialization
   ├── Load CLAUDE.md hierarchy
   ├── Detect git repository context
   ├── Initialize MCP servers
   └── Establish API connection

2. Conversation Loop
   ├── Receive user message
   ├── Process with Claude API (with tools)
   ├── Execute tool calls (with permissions)
   ├── Return results to Claude
   └── Present response to user

3. Termination
   ├── Save session state (optional)
   └── Clean up MCP connections
```

### Model Context Protocol (MCP) Integration

[MCP](/glossary/mcp/) extends Claude Code's capabilities beyond its built-in tools by connecting to external servers that expose additional functionality:

```json
{
  "mcpServers": {
    "prismatic-mcp": {
      "command": "npx",
      "args": ["-y", "prismatic-mcp-server"],
      "env": { "API_KEY": "..." }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "..." }
    }
  }
}
```

MCP servers can provide tools (functions Claude can call), resources (data Claude can read), and prompts (templated instructions). The Prismatic Platform configures 14+ MCP servers providing 27+ specialized tools.

### Slash Commands and Skills

Claude Code supports skills -- specialized capabilities invoked via slash commands:

| Command | Purpose | Example |
|---------|---------|---------|
| `/commit` | Create git commits | Analyzes changes, drafts message, commits |
| `/review-pr` | Review pull requests | Reads PR diff, provides structured feedback |
| `/init` | Initialize CLAUDE.md | Creates project configuration |
| `/worktree` | Isolated development | Creates git worktree for parallel work |

Skills are extensible through the skill system, allowing projects to register custom slash commands that encode domain-specific workflows.

## Implementation in Prismatic Platform

### Primary Development Interface

Claude Code serves as the primary development interface for the Prismatic Platform. Every feature, bug fix, refactoring operation, and documentation change flows through Claude Code sessions. The platform's `CLAUDE.md` file (8,000+ words) encodes the complete development protocol:

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  Manages Claude Code session lifecycle within the Prismatic Platform.
  Provides OTP-compliant GenServer for tracking session state,
  executing mandatory hooks, and enforcing session discipline.
  """

  use GenServer

  @type session_phase :: :initialization | :active | :termination
  @type hook_priority :: 0..100

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec trigger(atom()) :: {:ok, map()} | {:error, term()}
  def trigger(phase) when phase in [:session_start, :pre_command, :post_command, :session_end] do
    GenServer.call(__MODULE__, {:trigger, phase}, :timer.seconds(30))
  end

  @impl true
  def init(opts) do
    state = %{
      hooks: load_hooks(opts),
      circuit_breaker: %{failures: 0, state: :closed, last_failure: nil},
      session_id: generate_session_id(),
      started_at: DateTime.utc_now()
    }
    {:ok, state}
  end

  @impl true
  def handle_call({:trigger, phase}, _from, state) do
    case execute_hooks(phase, state) do
      {:ok, results} -> {:reply, {:ok, results}, state}
      {:error, reason} -> {:reply, {:error, reason}, update_circuit_breaker(state)}
    end
  end

  defp execute_hooks(phase, %{hooks: hooks, circuit_breaker: cb}) do
    if cb.state == :open, do: {:error, :circuit_breaker_open}
    else
      hooks
      |> Enum.filter(&(&1.phase == phase && &1.enabled))
      |> Enum.sort_by(& &1.priority)
      |> Enum.reduce_while({:ok, []}, fn hook, {:ok, acc} ->
        case hook.execute.() do
          {:ok, result} -> {:cont, {:ok, [result | acc]}}
          {:error, reason} -> {:halt, {:error, reason}}
        end
      end)
    end
  end
end
```

### Stack-Based Conversation Mode

The platform implements a stack-based conversation tracking system that operates within Claude Code sessions. Every response creates an immutable frame containing the input summary, output summary, key assumptions, and decisions:

```elixir
defmodule PrismaticClaude.StackConversation do
  @moduledoc """
  Stack-based conversation tracking for Claude Code sessions.
  Maintains immutable frames with ETS-backed persistence
  and disk serialization for cross-session recovery.
  """

  use GenServer

  @spec get_stack() :: {:ok, [map()]}
  def get_stack, do: GenServer.call(__MODULE__, :get_stack)

  @spec get_frame(non_neg_integer()) :: {:ok, map()} | {:error, :not_found}
  def get_frame(n), do: GenServer.call(__MODULE__, {:get_frame, n})

  @spec checkpoint(String.t()) :: {:ok, non_neg_integer()}
  def checkpoint(name), do: GenServer.call(__MODULE__, {:checkpoint, name})

  @spec fork(non_neg_integer(), String.t()) :: {:ok, String.t()}
  def fork(frame_n, branch_name), do: GenServer.call(__MODULE__, {:fork, frame_n, branch_name})
end
```

### Mandatory Session Hooks

Every Claude Code session on the Prismatic Platform triggers mandatory operations:

| Phase | Hook | Mix Task | Purpose |
|-------|------|----------|---------|
| Start | Baseline | `mix autoheal.baseline` | Capture quality snapshot |
| Start | Context | Load `.claude/session-context/` | Resume from last session |
| Pre-Command | Gates | `mix quality.gates.check --fast` | Verify quality floor |
| Post-Command | Scan | `mix autoevolve.scan --quick` | Detect improvement opportunities |
| End | Heal | `mix autoheal.cycle` | Autonomous quality repair |
| End | Evolve | `mix autoevolve.mega` | Trigger platform evolution |
| End | Save | Write `.claude/session-context/` | Persist session state |

### AIAD Agent Integration

Claude Code sessions can invoke any of the platform's 530+ [AIAD](/glossary/aiad/) agents through slash commands and skill invocations. The [Agent Registry](/glossary/agent-registry/) maps command names to agent specifications:

```bash
# Invoke specialized agents from Claude Code
/orchestrate          # Supreme coordinator (10x efficiency)
/archer-supreme       # Strategic analysis agent
/investigate          # OSINT investigation agent
/color-team status    # Security team status
/autoevolve.mega      # Platform evolution trigger
```

## Comparison with Alternatives

| Feature | Claude Code | GitHub Copilot CLI | Cursor | Aider | Continue |
|---------|------------|-------------------|--------|-------|----------|
| **Interface** | Terminal (native) | Terminal (plugin) | IDE (fork of VS Code) | Terminal | IDE (plugin) |
| **File Editing** | Direct read/write/edit | Suggestions only | Direct editing | Direct editing | Suggestions |
| **Shell Execution** | Full bash access | Limited | Integrated terminal | Git operations | Limited |
| **Multi-file** | Unlimited context | Limited | Large context | Git-aware | Limited |
| **MCP Support** | Native | No | No | No | Partial |
| **Custom Instructions** | CLAUDE.md hierarchy | Limited config | Rules files | Convention files | Config |
| **Agentic Mode** | Full tool loop | No | Composer agent | Yes | No |
| **Extended Thinking** | Supported | No | No | No | No |
| **Web Search** | Built-in | No | No | No | No |
| **Permission System** | Granular | N/A | Workspace trust | Auto-approve option | N/A |
| **Git Integration** | Native (commit, PR, diff) | Basic | Basic | Deep | Basic |
| **Worktrees** | Built-in | No | No | No | No |

### Key Differentiators

Claude Code's primary advantage is its agentic architecture -- the model decides which tools to use, in what order, and iterates on results. This enables complex multi-step workflows (read code, understand architecture, write implementation, run tests, fix failures, commit) that other tools require manual orchestration for. The CLAUDE.md configuration system allows encoding entire development protocols that the AI follows autonomously.

## Best Practices

### Effective CLAUDE.md Configuration

Structure project instructions to maximize Claude Code's effectiveness:

1. **Be specific about conventions**: Include naming patterns, file organization rules, testing requirements, and code style preferences explicitly rather than relying on implicit understanding
2. **Encode forbidden patterns**: List anti-patterns and their alternatives so Claude avoids them proactively
3. **Define workflows**: Document the expected sequence of operations for common tasks (feature development, bug fixing, refactoring)
4. **Set quality gates**: Specify which checks must pass and the commands to run them
5. **Layer instructions**: Use directory-level CLAUDE.md files for app-specific conventions in monorepos

### Session Management

```bash
# Start with context loading
# Claude Code automatically reads CLAUDE.md and recent session context

# Use worktrees for isolated work
/worktree feature-name

# Commit frequently with conventional format
/commit

# Save session context at natural breakpoints
# The platform auto-saves to .claude/session-context/
```

### Tool Usage Patterns

- Prefer `Glob` and `Grep` over `Bash` with `find`/`grep` for file search operations
- Use `Read` before `Edit` to ensure exact string matching
- Chain independent operations in parallel tool calls for speed
- Use `WebSearch` for current information beyond the knowledge cutoff

## Common Pitfalls

### Over-Broad File Staging

Using `git add -A` or `git add .` can accidentally include sensitive files (`.env`, credentials, large binaries). Always stage specific files by name or use targeted patterns.

### Shell State Assumptions

Claude Code resets shell state between Bash tool calls. Environment variables, directory changes, and shell functions do not persist. Use absolute paths and set environment variables within each command.

### Ignoring Permission Prompts

The permission system exists to prevent unintended destructive operations. Granting blanket permissions bypasses safety controls. Review each permission request, especially for write operations and shell commands that modify state.

### Instruction Overload

Extremely long CLAUDE.md files (10,000+ words) can dilute the most important instructions. Prioritize critical rules at the top and use hierarchical organization so the most relevant instructions are closest to the working context.

### Missing MCP Server Configuration

MCP servers must be explicitly configured in `.claude/settings.json` or project-level settings. Without proper configuration, Claude Code cannot access specialized tools like database queries, custom APIs, or project-specific operations.

## Use Cases

### Codebase Exploration and Understanding

Claude Code excels at navigating unfamiliar codebases. A developer can ask "How does the authentication flow work?" and Claude will search for relevant files, read them, trace the execution path, and provide a comprehensive explanation with file references and code snippets.

### Multi-File Refactoring

Renaming a module, changing an API contract, or migrating a pattern across dozens of files becomes a single natural-language instruction. Claude reads all affected files, plans the changes, applies them consistently, and verifies the result compiles and tests pass.

### Bug Investigation and Fixing

Given a bug report or failing test, Claude Code can reproduce the issue, identify the root cause through code analysis, implement the fix, add regression tests, and verify everything passes -- following the platform's mandatory regression test protocol.

### Code Review and Quality Analysis

Claude Code can review pull requests by reading diffs, analyzing changes for correctness, security vulnerabilities, performance issues, and adherence to project conventions. It provides structured feedback with specific file references and suggested improvements.

### Documentation Generation

By reading actual code, Claude Code generates documentation that is grounded in the implementation rather than based on assumptions. It can produce API documentation, architecture overviews, and inline comments that accurately reflect what the code does.

### CI/CD Pipeline Debugging

When CI pipelines fail, developers can paste the error output and Claude Code will analyze the failure, identify the root cause, and suggest fixes -- often implementing the fix directly if it involves code changes.

## Related Concepts

- [Claude AI](/glossary/claude-ai/) -- the underlying large language model that powers Claude Code
- [LLM](/glossary/llm/) -- the class of AI models that enable natural-language programming interfaces
- [Development Workflow](/glossary/development-workflow/) -- the broader process that Claude Code integrates into
- [MCP](/glossary/mcp/) -- Model Context Protocol for extending Claude Code's tool capabilities
- [Slash Command](/glossary/slash-command/) -- the invocation mechanism for Claude Code skills and AIAD commands
- [AIAD](/glossary/aiad/) -- the AI-Agent-Driven standard that structures agents invoked from Claude Code
- [Code Generation](/glossary/code-generation/) -- one of the primary capabilities Claude Code provides
- [Quality Gate](/glossary/quality-gate/) -- automated checks that Claude Code executes during development
- [Pre-commit Hooks](/glossary/pre-commit-hooks/) -- the hook system that validates changes before commits
- [Session Discipline](/glossary/session-discipline/) -- the mandatory protocol governing Claude Code sessions
- [Autoevolve](/glossary/autoevolve/) -- platform evolution triggered at session boundaries
- [Agent](/glossary/agent/) -- the autonomous entities orchestrated through Claude Code

## See Also

- [Agent Registry](/glossary/agent-registry/) -- catalog of all agents accessible from Claude Code
- [Clean Run](/glossary/clean-run/) -- the zero-warning compilation standard enforced in sessions
- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- the doctrine governing Claude Code session behavior
- [Git Trees](/glossary/git-trees/) -- optimized codebase exploration used within sessions
- [Static Analysis](/glossary/static-analysis/) -- quality checks executed by Claude Code workflows
- [Continuous Integration](/glossary/continuous-integration/) -- the CI pipeline that validates Claude Code outputs

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
