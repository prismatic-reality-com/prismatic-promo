+++
title = "Command"
weight = 50
[extra]
description = "A user-invocable operation defined in the AIAD standard as a .cmd.md specification, providing structured interaction with platform capabilities"
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "aiad-framework"
related_concepts = ["aiad", "agent", "slash-command", "orchestration", "agent-registry", "mix-task", "pipeline"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 5
prerequisites = ["aiad", "agent", "elixir"]
learning_path = ["aiad", "command", "agent", "orchestration", "agent-registry"]
interactive_demos = ["/labs/glossary/command"]
code_examples = ["Elixir", "YAML", "Shell"]
external_resources = ["https://hexdocs.pm/mix/Mix.Task.html", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["command-dispatch", "argument-parsing", "authorization-check", "pipeline-execution"]
keywords = ["command", "AIAD command", "slash command", "mix task", "CLI", "invocation", "dispatch", "orchestration"]
tags = ["glossary", "agents", "aiad", "commands", "orchestration"]
related_terms = ["aiad", "slash-command", "agent", "orchestration", "agent-registry", "mix-task", "pipeline", "agent-tier", "authority-level", "agent-module", "mix", "genserver"]
word_count = 1431
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Command - Prismatic Platform"
+++

## Definition

A command in the Prismatic Platform is a user-invocable operation defined according to the AIAD (AI Agent Definition) standard as a `.cmd.md` specification file. Commands serve as the primary interface between human operators and the platform's agent ecosystem, providing structured, documented, and enforceable entry points for invoking complex operations. Each command specifies its name, purpose, arguments, authorization requirements, execution flow, and expected outputs. The Prismatic Platform currently maintains 225+ commands across all operational domains, from development workflows and quality enforcement to intelligence gathering and security operations.

## Overview

Commands represent the action layer of the AIAD standard -- while [agents](/glossary/agent/) define autonomous entities with capabilities and behaviors, commands define the specific operations those agents can perform when invoked by users or other systems. The relationship between agents and commands mirrors the relationship between objects and methods in object-oriented programming, or between modules and functions in functional programming: agents encapsulate capabilities, and commands expose those capabilities through well-defined interfaces.

The command concept in Prismatic operates at multiple levels simultaneously. At the user interface level, commands appear as slash commands (e.g., `/orchestrate`, `/investigate`, `/fix`) that can be invoked during Claude sessions. At the build system level, commands manifest as Mix tasks (e.g., `mix quality.gates`, `mix autoheal.cycle`) that execute within the Elixir compilation and runtime environment. At the automation level, commands serve as pipeline steps that can be composed into complex workflows with conditional logic, parallel execution, and error handling.

This multi-level nature is intentional. The AIAD standard recognizes that the same conceptual operation may need to be invoked through different mechanisms depending on context -- a developer at a terminal uses slash commands, a CI/CD pipeline uses mix tasks, and an orchestration agent uses programmatic APIs. The `.cmd.md` specification captures the operation's semantics independently of its invocation mechanism, enabling consistent behavior across all contexts.

The design of the command system reflects several key principles from distributed systems and [OTP](/glossary/elixir/) design: commands are stateless (each invocation is independent), idempotent where possible (repeated invocations produce the same result), composable (commands can invoke other commands), and observable (every command execution produces structured telemetry).

## Technical Details

### Command Specification Format

Every command in the AIAD standard is defined through a `.cmd.md` file with a structured frontmatter specification:

```yaml
---
command-spec:
  name: "quality-gates"
  version: "2.0.0"
  description: "Run comprehensive quality gate checks across the platform"
  category: "quality"
  authority: "platform-wide"

  invocation:
    slash: "/quality-gates"
    mix: "mix quality.gates"
    api: "POST /api/v1/quality/gates"

  arguments:
    - name: "scope"
      type: "string"
      required: false
      default: "all"
      description: "Scope of quality check: all, app, file"
      valid_values: ["all", "app", "file"]
    - name: "strict"
      type: "boolean"
      required: false
      default: true
      description: "Enable strict mode (no warnings tolerated)"

  authorization:
    minimum_tier: "L4"
    required_clearance: "standard"
    audit_logging: true

  execution:
    timeout_ms: 300000
    retries: 0
    idempotent: true
    side_effects: ["filesystem_read", "compilation"]

  output:
    format: "structured"
    fields:
      - name: "status"
        type: "pass | fail"
      - name: "violations"
        type: "list(violation)"
      - name: "duration_ms"
        type: "integer"

  dependencies:
    agents: ["quality-floor-guardian", "elixir-architect"]
    commands: ["compile", "credo", "dialyzer"]

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
---
```

### Command Lifecycle

A command passes through several phases during execution:

| Phase | Description | Enforcement |
|-------|-------------|-------------|
| **Parse** | Arguments validated against specification | Type checking, required fields, valid values |
| **Authorize** | Caller's tier and clearance verified | Minimum tier, required clearance, audit log |
| **Resolve** | Dependencies identified and prepared | Agent availability, prerequisite commands |
| **Execute** | Core operation performed | Timeout enforcement, error handling |
| **Validate** | Output checked against specification | Format compliance, completeness |
| **Report** | Results emitted through telemetry | Structured logging, metrics, audit trail |

### Command Dispatch Implementation

```elixir
defmodule Prismatic.AIAD.CommandDispatcher do
  @moduledoc """
  Dispatches AIAD commands to their implementing agents, handling
  argument parsing, authorization, execution, and result validation.

  Commands are resolved from .cmd.md specifications loaded at boot time
  and cached in ETS for O(1) lookup.
  """

  @type command_name :: String.t()
  @type command_args :: map()
  @type command_context :: %{
          caller: String.t(),
          tier: atom(),
          clearance: atom(),
          session_id: String.t()
        }

  @type dispatch_result ::
          {:ok, map()}
          | {:error, :not_found}
          | {:error, :unauthorized}
          | {:error, :validation_failed, list(String.t())}
          | {:error, :execution_failed, term()}
          | {:error, :timeout}

  @spec dispatch(command_name(), command_args(), command_context()) :: dispatch_result()
  def dispatch(command_name, args, context) do
    with {:ok, spec} <- resolve_command(command_name),
         :ok <- authorize(spec, context),
         {:ok, validated_args} <- validate_args(spec, args),
         {:ok, result} <- execute(spec, validated_args, context),
         {:ok, validated_result} <- validate_output(spec, result) do
      emit_telemetry(:success, command_name, context)
      {:ok, validated_result}
    else
      {:error, reason} = error ->
        emit_telemetry(:failure, command_name, context, reason)
        error
    end
  end

  @spec resolve_command(command_name()) :: {:ok, map()} | {:error, :not_found}
  defp resolve_command(name) do
    case :ets.lookup(:aiad_commands, name) do
      [{^name, spec}] -> {:ok, spec}
      [] -> {:error, :not_found}
    end
  end

  @spec authorize(map(), command_context()) :: :ok | {:error, :unauthorized}
  defp authorize(spec, context) do
    required_tier = get_in(spec, [:authorization, :minimum_tier])
    caller_tier = context.tier

    if tier_sufficient?(caller_tier, required_tier) do
      log_audit(spec, context)
      :ok
    else
      {:error, :unauthorized}
    end
  end

  @spec validate_args(map(), command_args()) ::
          {:ok, command_args()} | {:error, :validation_failed, list(String.t())}
  defp validate_args(spec, args) do
    errors =
      spec
      |> Map.get(:arguments, [])
      |> Enum.flat_map(fn arg_spec ->
        validate_single_arg(arg_spec, Map.get(args, arg_spec.name))
      end)

    case errors do
      [] -> {:ok, apply_defaults(spec, args)}
      errors -> {:error, :validation_failed, errors}
    end
  end

  @spec execute(map(), command_args(), command_context()) ::
          {:ok, map()} | {:error, :execution_failed, term()} | {:error, :timeout}
  defp execute(spec, args, context) do
    timeout = get_in(spec, [:execution, :timeout_ms]) || 120_000

    task =
      Task.async(fn ->
        agent = resolve_agent(spec)
        agent.execute(args, context)
      end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, {:ok, result}} -> {:ok, result}
      {:ok, {:error, reason}} -> {:error, :execution_failed, reason}
      nil -> {:error, :timeout}
    end
  end

  @spec validate_output(map(), map()) :: {:ok, map()} | {:error, :validation_failed, list(String.t())}
  defp validate_output(spec, result) do
    required_fields = get_in(spec, [:output, :fields]) || []

    missing =
      required_fields
      |> Enum.filter(fn field -> not Map.has_key?(result, field.name) end)
      |> Enum.map(fn field -> "Missing output field: #{field.name}" end)

    case missing do
      [] -> {:ok, result}
      errors -> {:error, :validation_failed, errors}
    end
  end

  defp tier_sufficient?(_caller, _required), do: true
  defp log_audit(_spec, _context), do: :ok
  defp resolve_agent(_spec), do: Prismatic.AIAD.DefaultAgent
  defp validate_single_arg(_spec, _value), do: []
  defp apply_defaults(_spec, args), do: args
  defp emit_telemetry(_status, _name, _context, _reason \\ nil), do: :ok
end
```

### Command Categories

The 225+ commands in the Prismatic Platform are organized across operational domains:

| Category | Count | Examples | Domain |
|----------|-------|---------|--------|
| **Development** | 35+ | `/code`, `/fix`, `/refactor`, `/test` | Core development workflow |
| **Quality** | 28+ | `/quality-gates`, `/credo`, `/dialyzer`, `/forbidden-patterns` | Quality enforcement |
| **Evolution** | 22+ | `/autoheal`, `/autoevolve`, `/seadf` | Platform self-improvement |
| **Intelligence** | 40+ | `/investigate`, `/email-osint`, `/google-hacking` | OSINT operations |
| **Security** | 25+ | `/perimeter`, `/red-team`, `/blue-team`, `/color-team` | Security operations |
| **Orchestration** | 18+ | `/orchestrate`, `/archer-supreme`, `/supreme-coordinator` | Multi-agent coordination |
| **Infrastructure** | 15+ | `/deploy`, `/monitor`, `/health-check` | Infrastructure management |
| **Promo** | 10+ | `/promo-enhance`, `/promo-build` | Content management |
| **Ollama** | 8+ | `/ollama status`, `/ollama config`, `/ollama optimize` | Local AI integration |
| **Navigation** | 12+ | `/git-trees`, `/garden-explore`, `/garden-extract` | Codebase navigation |

### Command Composition and Pipelines

Commands can be composed into pipelines for complex multi-step operations:

```elixir
defmodule Prismatic.AIAD.Pipeline do
  @moduledoc """
  Enables composition of AIAD commands into sequential, parallel,
  or conditional execution pipelines.
  """

  @type step :: %{
          command: String.t(),
          args: map(),
          condition: (map() -> boolean()) | nil,
          on_failure: :halt | :continue | :retry
        }

  @type pipeline_result :: {:ok, list(map())} | {:error, String.t(), term()}

  @spec execute_sequential(list(step()), map()) :: pipeline_result()
  def execute_sequential(steps, context) do
    Enum.reduce_while(steps, {:ok, []}, fn step, {:ok, results} ->
      if step.condition == nil or step.condition.(List.last(results) || %{}) do
        case Prismatic.AIAD.CommandDispatcher.dispatch(step.command, step.args, context) do
          {:ok, result} ->
            {:cont, {:ok, results ++ [result]}}

          {:error, reason} when step.on_failure == :continue ->
            {:cont, {:ok, results ++ [%{error: reason}]}}

          {:error, reason} ->
            {:halt, {:error, step.command, reason}}
        end
      else
        {:cont, {:ok, results ++ [%{skipped: true}]}}
      end
    end)
  end

  @spec execute_parallel(list(step()), map()) :: pipeline_result()
  def execute_parallel(steps, context) do
    tasks =
      Enum.map(steps, fn step ->
        Task.async(fn ->
          Prismatic.AIAD.CommandDispatcher.dispatch(step.command, step.args, context)
        end)
      end)

    results = Task.await_many(tasks, 300_000)
    {:ok, results}
  end
end
```

### Mix Task Integration

AIAD commands that interact with the build system are implemented as Mix tasks:

```bash
# Quality commands
mix quality.gates              # Run all quality gate checks
mix quality.forbidden_patterns # Scan for forbidden patterns
mix quality.enforce_standard   # Check universal quality standard

# Evolution commands
mix autoheal.baseline          # Establish quality baseline
mix autoheal.cycle             # Run healing cycle
mix autoevolve.status          # Check evolution status
mix autoevolve.mega            # Full evolution pass

# Navigation commands
mix git_trees                  # Repository statistics
mix git_trees find "regex"     # Find files by pattern
mix git_trees apps             # List umbrella applications

# Promo commands
mix promo.enhance              # Analyze promo content quality
```

## Implementation in Prismatic Platform

### Command Registry

All 225+ commands are indexed in the AIAD Command Registry (`.claude/COMMAND_REGISTRY.md`), which provides a centralized catalog with invocation syntax, descriptions, categories, and authority requirements. The registry is automatically regenerated by the `./.aiad/bin/aiad index` command whenever command specifications change.

### Slash Command Processing

During Claude sessions, slash commands are processed through the Stack-Based Conversation Mode system. When a user types `/orchestrate`, the system:

1. Recognizes the slash prefix as a command invocation
2. Looks up the command specification in the AIAD registry
3. Validates the caller's authorization level
4. Dispatches to the appropriate agent(s)
5. Records the invocation as a frame in the conversation stack
6. Returns structured results to the user

### Hardcoded Evolution Commands

Certain commands are designated as hardcoded -- they execute automatically during every session lifecycle regardless of explicit invocation:

| Phase | Commands | Authority |
|-------|----------|-----------|
| **Session Start** | `mix autoheal.baseline`, `mix autoevolve status` | Mandatory |
| **Pre-Command** | `mix quality.gates.check --fast` | Blocking |
| **Post-Command** | `mix autoevolve.scan --quick` | Automatic |
| **Session End** | `mix autoheal.cycle`, `mix autoevolve.mega` | Mandatory |

These hardcoded commands ensure continuous platform improvement regardless of the session's primary purpose.

### Command Telemetry

Every command execution emits telemetry events through the `:prismatic_claude` telemetry namespace:

```elixir
:telemetry.execute(
  [:prismatic_claude, :command, :dispatch],
  %{duration: duration_ms},
  %{command: command_name, status: :success, caller: context.caller}
)
```

These events feed into the platform's monitoring infrastructure, enabling tracking of command usage patterns, performance metrics, and failure rates.

## Comparison with Alternatives

| Approach | Discoverability | Composability | Authorization | Documentation |
|----------|----------------|---------------|---------------|---------------|
| **AIAD Commands** | Registry + slash syntax | Pipeline composition | Tier-based RBAC | Inline in .cmd.md |
| **Mix Tasks** | `mix help` | Manual scripting | None built-in | @moduledoc |
| **Shell Scripts** | Directory listing | Pipe composition | File permissions | Comments/README |
| **REST API Endpoints** | OpenAPI spec | HTTP orchestration | Token/RBAC | OpenAPI docs |
| **CLI Frameworks (Click/Thor)** | `--help` flags | Subcommands | OS-level | Argparse docs |

The AIAD command system provides the highest-level abstraction, combining the discoverability of CLI tools with the authorization of API systems, the composability of pipeline tools, and the documentation of specification-driven approaches.

## Best Practices

1. **One command, one purpose**: Each command should do exactly one thing well. Complex operations should be composed from simpler commands via pipelines.

2. **Specify all arguments explicitly**: Use the AIAD specification format to document every argument with type, default, description, and valid values. Never rely on implicit behavior.

3. **Make commands idempotent**: Where possible, running the same command twice with the same arguments should produce the same result. This enables safe retries and pipeline composition.

4. **Enforce authorization at the specification level**: Define minimum tier and clearance requirements in the `.cmd.md` file, not in the implementation code. This centralizes security policy.

5. **Include enforcement block**: Every command specification must include the NM/ND enforcement block to ensure doctrine compliance.

6. **Emit structured telemetry**: Every command should produce telemetry events that enable monitoring, debugging, and usage analysis.

7. **Document dependencies**: If a command depends on other commands or agents, declare those dependencies explicitly in the specification.

8. **Test command boundaries**: Write tests that verify argument validation, authorization checks, and error handling, not just the happy path.

## Common Pitfalls

1. **God commands**: Creating a single command that tries to do too much. This makes the command hard to test, document, and compose.

2. **Missing error handling**: Commands that assume success and fail opaquely when inputs are invalid or dependencies are unavailable.

3. **Implicit state dependencies**: Commands that depend on global state (environment variables, file system contents) without declaring those dependencies.

4. **Ignoring timeouts**: Long-running commands without timeout enforcement can block the entire session lifecycle.

5. **Skipping authorization**: Treating authorization as optional because "we trust our users." The NM/ND doctrine requires enforcement regardless of trust level.

6. **Stale specifications**: Keeping `.cmd.md` files that no longer match the actual implementation. The specification IS the documentation, and it must be accurate.

7. **Non-composable outputs**: Commands that produce human-readable text instead of structured data, making it impossible to pipe results into other commands.

8. **Missing audit logging**: Commands that modify state without recording who invoked them, when, and with what arguments.

## Use Cases

### Developer Workflow Automation

A typical development session invokes multiple commands in sequence: `/code` to implement a feature, `/test` to verify correctness, `/quality-gates` to check compliance, and `/fix` to address any violations. This workflow is partially automated through the session lifecycle hooks.

### Intelligence Operations

OSINT commands like `/investigate`, `/email-osint`, and `/google-hacking` provide structured interfaces to the platform's 120 intelligence tools. Each command wraps complex multi-source intelligence gathering into a simple invocation with documented arguments and structured output.

### Platform Self-Improvement

Evolution commands (`/autoheal`, `/autoevolve`) enable the platform to continuously improve itself. These commands scan the codebase for quality issues, suggest improvements, and apply fixes -- all through the same command dispatch infrastructure.

### Security Assessment

The Color Team commands (`/red-team scenario`, `/blue-team posture`, `/purple-team closure`) invoke specialized security agents for adversarial simulation, defensive assessment, and synthesis operations. Each command is scoped with appropriate authorization to prevent misuse.

### Pipeline Orchestration

The `/orchestrate` command demonstrates command composition at its most powerful: it analyzes the user's request, decomposes it into a sequence of component commands, executes them in the optimal order (with parallelism where possible), and synthesizes the results into a coherent response.

## Related Concepts

- [AIAD](/glossary/aiad/) -- The AI Agent Definition standard governing command specifications
- [Slash Command](/glossary/slash-command/) -- User-facing invocation syntax for commands
- [Agent](/glossary/agent/) -- Autonomous entities that implement command logic
- [Orchestration](/glossary/orchestration/) -- Coordination of multiple agents and commands
- [Agent Registry](/glossary/agent-registry/) -- Centralized catalog of available agents and commands
- [Mix Task](/glossary/mix-task/) -- Elixir build tool tasks that implement many commands
- [Agent Tier](/glossary/agent-tier/) -- Authorization hierarchy for agent and command access
- [Authority Level](/glossary/authority-level/) -- Clearance requirements for command invocation
- [Pipeline](/glossary/pipeline/) -- Composition mechanism for multi-step command workflows
- [GenServer](/glossary/genserver/) -- OTP behavior underlying command dispatch

## See Also

- Glossary Index -- Complete glossary of Prismatic Platform terminology
- [Agent Module](/glossary/agent-module/) -- Module-level agent implementation
- [Mix](/glossary/mix/) -- Elixir's build tool for task execution

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
