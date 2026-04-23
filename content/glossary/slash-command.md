+++
title = "Slash Command"
weight = 50
[extra]
category = "agents"
description = "A structured command interface prefixed with a forward slash that triggers specific agent behaviors, platform operations, or workflow automations within the Prismatic Platform's AIAD command system"
related_terms = ["command", "aiad", "agent", "agent-orchestration", "workflow", "mix-task", "archer-supreme", "autoevolve", "autoheal", "doctrine"]
keywords = ["slash command interface", "AIAD command system", "agent slash commands", "platform command interface", "CLI command triggers", "slash command pattern", "command registration system", "agent invocation", "workflow automation commands", "platform operations CLI"]
tags = ["agents", "commands", "aiad", "cli", "automation"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
word_count = 1031
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Slash Command - Prismatic Platform"
+++

## Definition and Overview

A Slash Command is a structured command interface, prefixed with a forward slash (`/`), that triggers specific agent behaviors, platform operations, or workflow automations within the Prismatic Platform. Slash commands provide a uniform, discoverable interface for interacting with the platform's 530+ [AIAD agents](@/glossary/aiad.md), 225 registered commands, and numerous automated workflows. They serve as the primary human-to-platform interaction layer, translating high-level intent (e.g., `/orchestrate`, `/fix`, `/investigate`) into coordinated multi-agent operations.

The slash command pattern originates from IRC (Internet Relay Chat) in the late 1980s, where commands prefixed with `/` were distinguished from regular chat messages. The pattern was subsequently adopted by Slack, Discord, and numerous other platforms due to its intuitive affordance: the `/` prefix unambiguously signals "this is a command, not content." The Prismatic Platform adopts this proven interaction pattern and extends it with a type-safe, schema-validated, agent-backed execution model that goes far beyond simple command dispatch.

In the platform's architecture, a slash command is not merely a string that triggers a function call. Each command is a first-class entity defined by an [AIAD command specification](@/glossary/aiad.md) (`.aiad/commands/*.cmd.md`) that declares its name, description, parameters, required authority level, associated agents, pre-conditions, post-conditions, and expected outputs. This specification-driven approach enables automated documentation generation, permission enforcement, parameter validation, and audit logging -- transforming what would otherwise be ad-hoc script invocations into a governed, observable command infrastructure.

## Command Architecture

### AIAD Command Specification

Every slash command in the platform is backed by a formal AIAD command specification:

```yaml
# .aiad/commands/orchestrate.cmd.md
---
command-spec:
  name: orchestrate
  version: "2.0.0"
  description: "Supreme orchestration command for multi-agent coordination"
  category: development
  authority_level: L3
  aliases: ["/o", "/orch"]

  parameters:
    - name: task
      type: string
      required: true
      description: "The task to orchestrate"
    - name: agents
      type: list
      required: false
      description: "Specific agents to involve"
    - name: priority
      type: enum
      values: [low, medium, high, critical]
      default: medium

  preconditions:
    - "Session context loaded"
    - "Quality gates passing"

  postconditions:
    - "Task completed or error reported"
    - "Session context updated"
    - "Telemetry emitted"

  agents:
    primary: supreme-coordinator
    supporting: [archer-supreme, code-architect, test-engineer]

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
---
```

### Command Registry

The platform maintains a centralized command registry that indexes all available slash commands:

```elixir
defmodule PrismaticAIAD.CommandRegistry do
  @moduledoc """
  Central registry for all AIAD slash commands. Provides discovery,
  validation, and dispatch for the platform's 225 registered commands.
  Backed by ETS for O(1) lookup performance.
  """

  use GenServer

  @registry_table :aiad_command_registry

  @type command_entry :: %{
    name: String.t(),
    aliases: [String.t()],
    category: atom(),
    authority_level: atom(),
    parameters: [parameter_spec()],
    agents: agent_spec(),
    handler: module()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec lookup(String.t()) :: {:ok, command_entry()} | {:error, :not_found}
  def lookup(command_name) do
    normalized = normalize_command_name(command_name)

    case :ets.lookup(@registry_table, normalized) do
      [{^normalized, entry}] -> {:ok, entry}
      [] -> lookup_by_alias(normalized)
    end
  end

  @spec list_by_category(atom()) :: [command_entry()]
  def list_by_category(category) do
    :ets.match_object(@registry_table, {:_, %{category: category}})
    |> Enum.map(fn {_name, entry} -> entry end)
    |> Enum.sort_by(& &1.name)
  end

  @spec register(command_entry()) :: :ok | {:error, :already_registered}
  def register(entry) do
    GenServer.call(__MODULE__, {:register, entry})
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@registry_table, [:set, :protected, :named_table, read_concurrency: true])
    commands = load_commands_from_aiad_specs()

    Enum.each(commands, fn cmd ->
      :ets.insert(table, {cmd.name, cmd})
      Enum.each(cmd.aliases, fn alias_name ->
        :ets.insert(table, {alias_name, cmd})
      end)
    end)

    {:ok, %{table: table, command_count: length(commands)}}
  end

  @impl GenServer
  def handle_call({:register, entry}, _from, state) do
    case :ets.lookup(@registry_table, entry.name) do
      [] ->
        :ets.insert(@registry_table, {entry.name, entry})
        {:reply, :ok, %{state | command_count: state.command_count + 1}}

      [_existing] ->
        {:reply, {:error, :already_registered}, state}
    end
  end

  defp normalize_command_name("/" <> name), do: name
  defp normalize_command_name(name), do: name
end
```

### Command Dispatch

When a slash command is invoked, the platform follows a structured dispatch pipeline:

```
User Input: "/orchestrate build authentication module"
    |
    v
1. Parse: Extract command name + arguments
    |
    v
2. Lookup: Find command in registry (O(1) ETS)
    |
    v
3. Authorize: Verify caller has required authority level
    |
    v
4. Validate: Check parameters against schema
    |
    v
5. Pre-conditions: Verify all preconditions are met
    |
    v
6. Dispatch: Route to primary agent
    |
    v
7. Execute: Agent executes with supporting agents
    |
    v
8. Post-conditions: Verify postconditions are satisfied
    |
    v
9. Telemetry: Emit execution metrics
    |
    v
10. Result: Return to caller
```

```elixir
defmodule PrismaticAIAD.CommandDispatcher do
  @moduledoc """
  Dispatches slash commands through the validation, authorization,
  and execution pipeline. Ensures all commands follow the AIAD
  standard with full telemetry and audit logging.
  """

  alias PrismaticAIAD.{CommandRegistry, AuthorizationChecker, ParameterValidator}

  @spec dispatch(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch(raw_input, context) do
    start_time = System.monotonic_time()

    with {:ok, {command_name, args}} <- parse_input(raw_input),
         {:ok, command} <- CommandRegistry.lookup(command_name),
         :ok <- AuthorizationChecker.check(context.authority, command.authority_level),
         {:ok, validated_args} <- ParameterValidator.validate(args, command.parameters),
         :ok <- check_preconditions(command.preconditions, context),
         {:ok, result} <- execute_command(command, validated_args, context),
         :ok <- check_postconditions(command.postconditions, result) do
      emit_telemetry(:success, command_name, start_time)
      {:ok, result}
    else
      {:error, reason} = error ->
        emit_telemetry(:failure, raw_input, start_time, reason)
        error
    end
  end

  defp parse_input("/" <> rest) do
    case String.split(rest, " ", parts: 2) do
      [command] -> {:ok, {command, %{}}}
      [command, args_string] -> {:ok, {command, parse_args(args_string)}}
    end
  end

  defp parse_input(_), do: {:error, :not_a_command}

  defp execute_command(command, args, context) do
    primary_agent = command.agents.primary
    supporting = command.agents[:supporting] || []

    PrismaticAgents.execute(primary_agent, %{
      command: command.name,
      arguments: args,
      context: context,
      supporting_agents: supporting
    })
  end

  defp emit_telemetry(status, command, start_time, reason \\ nil) do
    duration = System.monotonic_time() - start_time

    :telemetry.execute(
      [:prismatic, :aiad, :command, status],
      %{duration: duration},
      %{command: command, reason: reason}
    )
  end
end
```

## Command Categories

The platform's 225 slash commands are organized into functional categories:

### Development Commands

| Command | Description | Authority | Primary Agent |
|---------|-------------|-----------|---------------|
| `/orchestrate` | Supreme multi-agent orchestration | L3 | supreme-coordinator |
| `/code` | Code generation and implementation | L2 | code-architect |
| `/fix` | Bug diagnosis and repair | L2 | debug-specialist |
| `/test` | Test generation and execution | L2 | test-engineer |
| `/refactor` | Code restructuring | L2 | refactor-specialist |
| `/optimize` | Performance optimization | L2 | performance-analyst |

### Evolution Commands

| Command | Description | Authority | Enforcement |
|---------|-------------|-----------|-------------|
| `/autoheal.baseline` | Establish quality baseline | L2 | HARDCODED - session start |
| `/autoheal.cycle` | Execute healing cycle | L2 | HARDCODED - session end |
| `/autoevolve.status` | Check evolution status | L1 | HARDCODED - session start |
| `/autoevolve.mega` | Full evolution sweep | L3 | HARDCODED - session end |
| `/quality.gates.check` | Verify quality gates | L2 | HARDCODED - pre-command |

### Intelligence Commands

| Command | Description | Authority | Domain |
|---------|-------------|-----------|--------|
| `/investigate` | Multi-source investigation | L2 | OSINT |
| `/email-osint` | Email intelligence gathering | L2 | OSINT |
| `/google-hacking` | Google dorking queries | L2 | OSINT |
| `/ghost-recon` | Stealthy reconnaissance | L3 | OSINT |
| `/delta-force` | Aggressive data collection | L3 | OSINT |
| `/navy-seal` | Precision targeted operation | L3 | OSINT |

### Security Commands

| Command | Description | Authority | Team |
|---------|-------------|-----------|------|
| `/color-team status` | All team status overview | L2 | All |
| `/red-team scenario` | Generate adversarial scenario | L3 | Red |
| `/blue-team posture` | Defensive posture assessment | L2 | Blue |
| `/purple-team closure` | Synthesis and closure report | L3 | Purple |
| `/white-verify` | Formal verification campaign | L3 | White |

### Crisis Commands

| Command | Description | Authority | Escalation |
|---------|-------------|-----------|------------|
| `/emergency` | Emergency response protocol | L4 | Immediate |
| `/archer-supreme` | Supreme authority override | L5 | Maximum |

## Technical Deep Dive

### Authority Levels

Slash commands enforce a hierarchical authority model that prevents unauthorized access to sensitive operations:

```elixir
defmodule PrismaticAIAD.AuthorizationChecker do
  @moduledoc """
  Enforces authority level requirements for slash command execution.
  Commands declare their minimum authority level, and the checker
  validates the caller has sufficient privileges.
  """

  @authority_hierarchy %{
    L1: 1,   # Universal - any session
    L2: 2,   # Operational - standard development
    L3: 3,   # Strategic - multi-agent orchestration
    L4: 4,   # Supreme - emergency operations
    L5: 5    # Cosmic - absolute authority
  }

  @spec check(atom(), atom()) :: :ok | {:error, :insufficient_authority}
  def check(caller_level, required_level) do
    caller_rank = Map.get(@authority_hierarchy, caller_level, 0)
    required_rank = Map.get(@authority_hierarchy, required_level, 999)

    if caller_rank >= required_rank do
      :ok
    else
      {:error, :insufficient_authority}
    end
  end
end
```

### Parameter Validation

Each command's parameters are validated against their declared schema before execution:

```elixir
defmodule PrismaticAIAD.ParameterValidator do
  @moduledoc """
  Validates slash command arguments against the parameter schema
  declared in the AIAD command specification.
  """

  @spec validate(map(), [parameter_spec()]) :: {:ok, map()} | {:error, [String.t()]}
  def validate(args, specs) do
    results =
      specs
      |> Enum.map(fn spec ->
        value = Map.get(args, spec.name) || Map.get(args, String.to_atom(spec.name))
        validate_parameter(spec, value)
      end)

    errors = Enum.filter(results, &match?({:error, _}, &1))

    if Enum.empty?(errors) do
      validated =
        results
        |> Enum.map(fn {:ok, name, value} -> {name, value} end)
        |> Map.new()

      {:ok, validated}
    else
      {:error, Enum.map(errors, fn {:error, msg} -> msg end)}
    end
  end

  defp validate_parameter(%{required: true} = spec, nil) do
    {:error, "Parameter '#{spec.name}' is required"}
  end

  defp validate_parameter(spec, nil) do
    {:ok, spec.name, spec[:default]}
  end

  defp validate_parameter(%{type: :string} = spec, value) when is_binary(value) do
    {:ok, spec.name, value}
  end

  defp validate_parameter(%{type: :enum, values: allowed} = spec, value) do
    normalized = if is_binary(value), do: String.to_atom(value), else: value

    if normalized in allowed do
      {:ok, spec.name, normalized}
    else
      {:error, "Parameter '#{spec.name}' must be one of: #{inspect(allowed)}"}
    end
  end

  defp validate_parameter(%{type: :integer} = spec, value) when is_integer(value) do
    {:ok, spec.name, value}
  end
end
```

### Hardcoded Evolution Commands

Certain slash commands are hardcoded into the session lifecycle and execute automatically without explicit user invocation:

```elixir
defmodule PrismaticClaude.SessionHooks do
  @moduledoc """
  Default session hooks implementing the Universal Autonomous Evolution
  Protocol. These commands execute automatically at session boundaries.
  """

  @session_start_commands [
    {"autoheal.baseline", "Establish quality baseline"},
    {"autoevolve.status", "Check evolution status"}
  ]

  @pre_command_commands [
    {"quality.gates.check --fast", "Quick quality gate verification"}
  ]

  @post_command_commands [
    {"autoevolve.scan --quick", "Quick evolution scan"}
  ]

  @session_end_commands [
    {"autoheal.cycle", "Execute healing cycle"},
    {"autoevolve.mega", "Full evolution sweep"}
  ]

  @spec session_start_hooks() :: [{String.t(), String.t()}]
  def session_start_hooks, do: @session_start_commands

  @spec session_end_hooks() :: [{String.t(), String.t()}]
  def session_end_hooks, do: @session_end_commands

  @spec execute_hook(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def execute_hook(command, context) do
    PrismaticAIAD.CommandDispatcher.dispatch("/" <> command, context)
  end
end
```

## Usage in Prismatic Platform

### Session Workflow

A typical development session demonstrates slash command usage throughout the lifecycle:

```
Session Start (automatic):
  /autoheal.baseline          -- Establish quality baseline
  /autoevolve.status           -- Check current evolution state

User-Initiated Work:
  /orchestrate build auth      -- Multi-agent task orchestration
  /code generate endpoint      -- Code generation
  /test security properties    -- Test generation and execution
  /fix compilation warning     -- Bug fix with regression test

Pre-Command (automatic):
  /quality.gates.check --fast  -- Quick quality verification

Post-Command (automatic):
  /autoevolve.scan --quick     -- Quick evolution scan

Session End (automatic):
  /autoheal.cycle              -- Execute healing cycle
  /autoevolve.mega             -- Full evolution sweep
```

### Mix Task Integration

Many slash commands delegate to [Mix tasks](@/glossary/mix-task.md) for their underlying implementation:

| Slash Command | Mix Task | Purpose |
|---------------|----------|---------|
| `/quality.gates.check` | `mix quality.gates` | Quality gate verification |
| `/autoheal.baseline` | `mix autoheal.baseline` | Quality baseline |
| `/autoevolve.status` | `mix autoevolve status` | Evolution status |
| `/autoevolve.mega` | `mix autoevolve.mega` | Full evolution |

The slash command layer adds authorization, parameter validation, telemetry, and agent coordination on top of the raw Mix task execution.

### Agent Coordination

Complex slash commands orchestrate multiple agents working together:

```elixir
defmodule PrismaticAIAD.Orchestrator do
  @moduledoc """
  Orchestrates multi-agent execution for complex slash commands.
  Coordinates primary and supporting agents with dependency-aware
  task scheduling and result aggregation.
  """

  @spec orchestrate(map()) :: {:ok, orchestration_result()} | {:error, term()}
  def orchestrate(%{command: command, arguments: args, supporting_agents: agents} = request) do
    # Phase 1: Primary agent analyzes the task
    {:ok, plan} = PrismaticAgents.analyze(request.primary_agent, args)

    # Phase 2: Distribute sub-tasks to supporting agents
    results =
      plan.sub_tasks
      |> Enum.map(fn sub_task ->
        agent = select_agent(sub_task, agents)
        Task.async(fn -> PrismaticAgents.execute(agent, sub_task) end)
      end)
      |> Task.await_many(30_000)

    # Phase 3: Primary agent synthesizes results
    {:ok, synthesis} = PrismaticAgents.synthesize(request.primary_agent, results)

    {:ok, %{
      command: command,
      plan: plan,
      results: results,
      synthesis: synthesis,
      agents_involved: [request.primary_agent | agents],
      completed_at: DateTime.utc_now()
    }}
  end
end
```

## Creating Custom Slash Commands

### Step 1: Define the AIAD Specification

Create a new file in `.aiad/commands/` following the command-spec schema:

```yaml
# .aiad/commands/my-command.cmd.md
---
command-spec:
  name: my-command
  version: "1.0.0"
  description: "Description of what the command does"
  category: development
  authority_level: L2

  parameters:
    - name: target
      type: string
      required: true
      description: "The target to operate on"

  agents:
    primary: my-agent

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
---
```

### Step 2: Implement the Handler

```elixir
defmodule PrismaticAIAD.Commands.MyCommand do
  @moduledoc """
  Handler for the /my-command slash command.
  """

  @behaviour PrismaticAIAD.CommandHandler

  @impl true
  @spec execute(map(), map()) :: {:ok, term()} | {:error, term()}
  def execute(args, context) do
    target = args.target

    with {:ok, result} <- perform_operation(target, context) do
      {:ok, %{
        command: "my-command",
        target: target,
        result: result,
        executed_at: DateTime.utc_now()
      }}
    end
  end
end
```

### Step 3: Register and Index

Run the AIAD indexer to register the new command:

```bash
./.aiad/bin/aiad index
```

The command is now discoverable, documented, and executable through the slash command interface.

## Best Practices

**Keep commands focused and composable.** Each slash command should do one thing well. Complex workflows should be built by composing simple commands, not by creating monolithic commands that try to do everything.

**Declare authority levels accurately.** Over-permissive authority levels create security risks; over-restrictive levels create friction. Match the authority level to the actual impact of the command.

**Validate parameters strictly.** Use the AIAD parameter schema to validate all inputs before execution. Never pass raw user input to underlying systems without validation.

**Emit telemetry for every command.** Command execution metrics (duration, success/failure, parameters) are essential for understanding platform usage patterns and diagnosing issues.

**Document pre-conditions and post-conditions.** Clear pre/post-conditions make commands predictable and debuggable. If a command fails, the pre-conditions tell you what state was expected; the post-conditions tell you what should have been achieved.

**Use aliases for frequently used commands.** Common commands like `/orchestrate` benefit from short aliases (`/o`) to reduce typing. Declare aliases in the command specification.

## Common Pitfalls

**Undocumented commands.** A slash command without an AIAD specification is an undiscoverable, unauditable shortcut. Every command must have a formal specification, no exceptions.

**God commands.** A single command that does too many things is hard to understand, test, and maintain. If a command description requires multiple sentences, it probably should be split into multiple commands.

**Missing error handling.** Commands must handle all failure modes gracefully and return meaningful error messages. A command that fails silently or with an opaque error is worse than useless.

**Bypassing the dispatch pipeline.** Invoking command handlers directly (bypassing authorization, validation, and telemetry) creates security and observability gaps. Always route through the dispatcher.

**Inconsistent naming.** Command names should follow a consistent convention: verb-noun for actions (`/generate-test`), noun for status queries (`/quality.gates`). Inconsistent naming makes commands harder to discover and remember.

## Related Concepts

- [Command](@/glossary/command.md) -- Generic command concept in the platform
- [AIAD](@/glossary/aiad.md) -- The agent and command standard framework
- [Agent](@/glossary/agent.md) -- Autonomous entities that execute slash commands
- [Agent Orchestration](@/glossary/agent-orchestration.md) -- Multi-agent coordination triggered by commands
- [Workflow](@/glossary/workflow.md) -- Structured processes composed from commands
- [Mix Task](@/glossary/mix-task.md) -- Underlying task infrastructure for many commands
- [Archer Supreme](@/glossary/archer-supreme.md) -- Supreme authority slash command
- [Autoevolve](@/glossary/autoevolve.md) -- Autonomous evolution commands
- [Autoheal](@/glossary/autoheal.md) -- Autonomous healing commands
- [Doctrine](@/glossary/doctrine.md) -- Governance framework enforced by commands
- [Agent Registry](@/glossary/agent-registry.md) -- Registry of agents backing commands

## See Also

- [AIAD Standard](@/glossary/aiad.md) -- Full specification for commands and agents
- [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) -- Doctrine enforced by command execution
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Commands Section](@/commands/_index.md) -- Full command catalog

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
