+++
title = "Command Registry"
weight = 2
template = "registry/commands.html"
date = "2026-02-15"

[extra]
description = "Complete catalog of 216 slash commands organized across 16 operational categories, providing the primary operator interface to the Prismatic Platform AIAD ecosystem"
icon = "terminal"
color = "emerald"
category = "registry"
status = "active"
reading_time = "11 min"
word_count = 2100
difficulty = "intermediate"
last_updated = "2026-02-15"
total_commands = 216
total_categories = 16
parameter_types = 6
author = "Tomas Korcak (korczis)"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Command", "Registry", "Complete", "Prismatic", "Platform", "AIAD", "Prismatic Platform", "Development", "Commands", "Operations"]
tags = ["registry", "command-registry", "prismatic"]
quality_score = 90
see_also = ["agents", "commands", "glossary"]
image = "/images/sections/registry.png"
image_alt = "Command Registry - Prismatic Platform"

+++

The Prismatic Platform Command Registry is the authoritative catalog of all slash commands available within the AIAD ecosystem. With 216 commands organized across 16 operational categories, the registry provides the structured interface through which operators and automated systems invoke platform capabilities. Every command is defined by a machine-readable `command-spec` YAML specification that captures its parameters, authority requirements, output formats, and enforcement policies.

## Overview

Slash commands are the primary operator interface to the Prismatic Platform. While agents provide the execution capability, commands provide the invocation mechanism -- the structured entry points through which operators trigger agent deployment, system operations, and platform management tasks. When an operator types `/orchestrate` or `/investigate` or `/evolve`, they are invoking a command that resolves to one or more agents through the registry's dispatch pipeline.

The distinction between commands and agents is architectural. Agents are autonomous execution units with their own state, coordination graphs, and lifecycle. Commands are stateless invocation contracts that define how operators interact with the platform. A single command may trigger multiple agents (the `/orchestrate` command selects and deploys entire agent teams), and a single agent may be invocable through multiple commands (the `archer-supreme` agent responds to both `/archer-supreme` and `/emergency` commands depending on context).

The Command Registry maintains the full specification of every command: its name, parameters with types and validation rules, required authority level, output format, category classification, and the mandatory enforcement block that connects it to the platform's [NO MERCY](/capabilities/no-mercy/) [NO DOUBTS](/capabilities/no-doubts/) doctrine. This specification-first approach ensures that every command is documented, validated, and discoverable before it can be deployed.

## Command Categories

Commands are organized into 16 functional categories that reflect the platform's operational domains. Each category groups related commands by their primary purpose.

| Category | Commands | Description | Key Commands |
|----------|----------|-------------|--------------|
| **Development (DX)** | 22 | Code generation, testing, refactoring, profiling, quality | `/code`, `/test`, `/fix`, `/refactor`, `/optimize`, `/orchestrate` |
| **Intelligence (OSINT)** | 11 | Investigation, email analysis, domain reconnaissance | `/investigate`, `/email-osint`, `/ghost-recon`, `/navy-seal` |
| **Evolution** | 8 | Genetic evolution, mycelial propagation, ecosystem improvement | `/evolve`, `/mycelialize`, `/darwinize`, `/mendelize` |
| **Architecture** | 6 | System analysis, review, migration, integration | `/analyze`, `/architect`, `/integrate` |
| **Operations** | 9 | Deployment, health monitoring, agent management | `/deploy`, `/health`, `/agents` |
| **Crisis** | 3 | Emergency response, structural crisis detection | `/emergency`, `/archer-supreme`, `/dark-ops` |
| **Stack Mode** | 6 | Conversation state management | `/stack`, `/frame`, `/pop`, `/fork`, `/checkpoint`, `/goto` |
| **M&A Operations** | 5 | Due diligence deal lifecycle management | `/ma-create`, `/ma-analyze`, `/ma-report` |
| **Documentation** | 5 | Hygiene, pattern scanning, context preservation | `/chronic`, `/find-lowfruit`, `/context-preserve` |
| **Defensive Security** | 4 | Manipulation detection and defense | `/manipulation detect`, `/manipulation protect` |
| **Color-Team Security** | 4 | Adversarial-defensive team operations | `/color-team status`, `/red-team scenario`, `/blue-team posture` |
| **Quality Enforcement** | 8 | Static analysis, quality gates, compliance verification | `/quality.gates`, `/credo`, `/dialyzer` |
| **Perimeter (EASM)** | 4 | External attack surface management | `/perimeter`, `/perimeter/assets`, `/perimeter/compliance` |
| **Local AI** | 6 | Ollama model management and inference | `/ollama status`, `/ollama models`, `/ollama install` |
| **Doctrine Enforcement** | 3 | Compliance verification and reporting | `/nmnd-status`, `/doctrine check` |
| **Session Management** | 4 | Context loading, saving, lifecycle tracking | `/session start`, `/session save`, `/session status` |

Category membership reflects primary purpose. Some commands participate in multiple workflows -- for example, `/quality.gates` is categorized under Quality Enforcement but is invoked as part of Development, Evolution, and Operations workflows.

## Command Architecture

### Specification Schema

Every command in the registry is defined by a `command-spec` YAML block embedded in its `.cmd.md` file. The schema captures identity, parameters, authority requirements, output formats, and enforcement policies.

```yaml
command-spec:
  name: "evolve"
  description: "Self-evolving AIAD ecosystem intelligence"
  authority: "supreme"
  version: "5.1.0"
  classification:
    - "meta-evolution"
    - "self-recursive"
    - "living-intelligence"

  parameters:
    - name: "mode"
      type: "enum"
      required: false
      default: "intelligent"
      values: ["intelligent", "self-evolve", "meta-analyze", "recursive", "full"]
      description: "Evolution mode with AI-powered intelligence selection"

    - name: "scope"
      type: "array"
      required: false
      default: ["intelligent-auto"]
      values: ["intelligent-auto", "self", "aiad", "ecosystem", "all"]
      description: "Intelligent scope selection"

    - name: "meta-level"
      type: "integer"
      required: false
      default: 1
      min: 1
      max: 5
      description: "Meta-evolution recursion depth"

  outputs:
    - type: "meta_analysis_report"
      format: "structured_intelligence"
      description: "AI-powered meta-analysis of evolution effectiveness"

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
```

The specification enforces several invariants. Every command must declare a unique `name`, a valid authority level, at least one output type, and the mandatory enforcement block referencing the [NO MERCY](/capabilities/no-mercy/) doctrine. Parameters must declare their type, and enum/array types must provide the complete set of valid values.

### Parameter Type System

Command parameters support six types with validation rules:

| Type | Description | Validation | Example |
|------|-------------|------------|---------|
| `string` | Free-form text input | Optional regex pattern | `--target "compilation"` |
| `enum` | One value from a fixed set | Must match declared values | `--mode intelligent` |
| `array` | Multiple values from a fixed set | Each element must match declared values | `--scope aiad,ecosystem` |
| `integer` | Numeric value | Optional min/max bounds | `--meta-level 3` |
| `boolean` | True/false flag | Strict boolean | `--intelligence-amplification true` |
| `path` | Filesystem path | Validated for existence | `--config ./custom.yml` |

All parameters support `required` (boolean), `default` (type-appropriate value), and `description` (human-readable documentation) attributes. Required parameters without defaults cause the dispatch engine to prompt the operator for input before execution.

### Authority Levels

Commands declare an authority level that determines which operators can invoke them and what system resources the command can access:

| Authority | Description | Access Scope |
|-----------|-------------|-------------|
| `universal` | Available to all operators | Read-only platform queries |
| `standard` | Available to authenticated operators | Standard development operations |
| `elevated` | Requires elevated privileges | System modification, deployment |
| `supreme` | Requires supreme authority | Crisis intervention, evolution, doctrine override |
| `cosmic` | Platform-level authority only | NABLA axiom enforcement, Trinity Gate operations |

Authority enforcement is non-bypassable. A command invoked without sufficient authority returns an authorization error with no fallback or escalation path available to the operator. Authority delegation must be configured through the platform's RBAC system before invocation.

## Execution Engine

The command execution engine translates operator input into agent deployment through a multi-stage dispatch pipeline.

### Dispatch Pipeline

When an operator invokes a command, the execution engine processes it through five stages:

1. **Parsing**: The command string is parsed into a command name and parameter map. Parameter types are validated against the command specification.

2. **Authorization**: The operator's authority level is checked against the command's declared authority requirement. Insufficient authority halts execution.

3. **Resolution**: The command specification is used to determine which agent or agents should handle the execution. Simple commands map directly to a single agent. Complex commands like `/orchestrate` use the Agent Registry to select an optimal agent team based on the parsed parameters and current platform state.

4. **Dispatch**: The resolved agent(s) are deployed with the parsed parameters as input context. For multi-agent commands, the orchestration layer manages coordination and sequencing.

5. **Collection**: Agent outputs are collected, formatted according to the command's declared output specification, and returned to the operator.

### Implementation in Elixir

The dispatch pipeline is implemented as a series of [Elixir](/technologies/elixir/) modules within the `prismatic_claude` application:

```elixir
defmodule PrismaticClaude.CommandDispatch do
  @moduledoc """
  Resolves slash commands to agent deployments through
  the AIAD command specification registry.
  """

  @spec dispatch(String.t(), map()) :: {:ok, CommandResult.t()} | {:error, term()}
  def dispatch(command_name, params) do
    with {:ok, spec} <- Registry.get_command(command_name),
         {:ok, validated} <- validate_params(spec, params),
         {:ok, _auth} <- check_authority(spec.authority),
         {:ok, agents} <- resolve_agents(spec, validated),
         {:ok, result} <- execute_agents(agents, validated) do
      {:ok, format_output(spec.outputs, result)}
    end
  end

  defp resolve_agents(spec, params) do
    case spec.resolution_strategy do
      :direct -> {:ok, [spec.primary_agent]}
      :orchestrated -> Orchestrator.select_team(spec, params)
      :dynamic -> DynamicResolver.resolve(spec, params)
    end
  end
end
```

The dispatch module uses the `with` construct for clean error propagation through the pipeline stages. Each stage returns `{:ok, value}` on success or `{:error, reason}` on failure, following [Elixir](/technologies/elixir/) conventions for result tuples.

### Error Handling

Command execution errors are categorized and reported with structured context:

| Error Category | Description | Operator Response |
|----------------|-------------|-------------------|
| `parameter_validation` | Invalid parameter type or value | Error message with valid options |
| `authorization_failure` | Insufficient authority level | Required authority level shown |
| `agent_resolution` | No suitable agent found | Suggested alternative commands |
| `execution_failure` | Agent execution failed | Error context with retry guidance |
| `timeout` | Execution exceeded time limit | Partial results if available |

## Command Lifecycle

Commands follow a structured lifecycle from initial specification through deployment and eventual retirement.

### Creation

New commands are created by adding a `command-spec` YAML block to a new `.cmd.md` file in the `.aiad/commands/` directory. The specification must include all required fields: name, description, authority, version, at least one parameter or explicit declaration of parameterless invocation, output specification, and the mandatory enforcement block.

After creation, the `.aiad/bin/aiad index` command regenerates the Command Registry, and `.aiad/bin/aiad-doctor` validates that no specification violations exist. The pre-commit hook ensures that invalid command specifications cannot be committed to the repository.

### Testing

Every command must be testable through the platform's validation framework. Testing occurs at three levels:

1. **Specification validation**: The `command-spec` YAML is checked for schema compliance, type consistency, and cross-reference integrity.

2. **Parameter validation**: Each parameter type is tested with valid values, boundary values, and invalid values to verify the validation rules behave correctly.

3. **Integration testing**: The full dispatch pipeline is exercised with real agent resolution and execution to verify end-to-end behavior. Integration tests use the platform's test infrastructure built on [ExUnit](/technologies/exunit/).

```elixir
defmodule PrismaticClaude.CommandDispatchTest do
  use ExUnit.Case, async: true

  describe "dispatch/2" do
    test "validates enum parameters against declared values" do
      assert {:error, {:parameter_validation, _}} =
        CommandDispatch.dispatch("evolve", %{mode: "invalid_mode"})
    end

    test "rejects commands with insufficient authority" do
      assert {:error, {:authorization_failure, _}} =
        CommandDispatch.dispatch("emergency", %{},
          authority: :standard)
    end

    test "resolves orchestrated commands to agent teams" do
      assert {:ok, result} =
        CommandDispatch.dispatch("orchestrate", %{
          task: "fix compilation warnings"
        })
      assert length(result.agents_deployed) >= 1
    end
  end
end
```

### Versioning

Command specifications follow semantic versioning. Major version bumps indicate breaking changes to parameters or output formats. Minor version bumps indicate new optional parameters or additional output fields. Patch version bumps indicate documentation corrections or internal implementation changes that do not affect the operator interface.

The registry tracks version history and flags breaking changes for review. Operators can query the registry for version-specific documentation when migrating between command versions.

### Deprecation and Retirement

When a command is superseded or its functionality is absorbed by another command, it follows the platform's standard deprecation process:

1. The command specification is updated with a `deprecated: true` flag and a `successor` field pointing to the replacement command.
2. Invocations of the deprecated command emit a warning with migration guidance.
3. After two evolution cycles, the command is removed from the active registry.
4. The specification is preserved in git history for audit purposes.

## Quality Standards

Every command in the registry must meet the platform's zero-tolerance quality requirements, enforced by the [Quality Gates](/capabilities/quality-gates/) pipeline and the [NO MERCY](/capabilities/no-mercy/) doctrine.

### Mandatory Requirements

- **Complete specification**: All required fields present and valid in the `command-spec` block
- **Enforcement block**: Must include `doctrine: "no-mercy-no-doubts"` with version `2.0.0`
- **Parameter documentation**: Every parameter must have a human-readable `description` field
- **Output specification**: At least one output type with format and description
- **Authority declaration**: Explicit authority level appropriate for the command's scope
- **Version compliance**: Specification version must follow semantic versioning
- **Cross-reference integrity**: All agent references must resolve to existing agents in the Agent Registry

### Validation Pipeline

Quality enforcement mirrors the agent validation pipeline:

1. **Pre-commit hook**: Schema validation on every commit modifying `.cmd.md` files
2. **Auto-indexing**: Validation during registry regeneration via `.aiad/bin/aiad index`
3. **Runtime loading**: Specification validation during application startup
4. **Continuous monitoring**: The `registry-syncer` agent detects drift between filesystem and registry

No bypass flags are permitted. The `--no-verify` git option is forbidden platform-wide, ensuring that no invalid command specification can enter the codebase.

## Integration with Agents

Commands and agents exist in a symbiotic relationship within the AIAD ecosystem. Understanding this relationship is essential for effective platform operation.

### Resolution Strategies

Commands use three resolution strategies to connect operator invocations to agent deployments:

| Strategy | Description | Example Commands |
|----------|-------------|-----------------|
| **Direct** | Maps 1:1 to a specific agent | `/archer-supreme`, `/navy-seal`, `/ghost-recon` |
| **Orchestrated** | Selects agent team dynamically | `/orchestrate`, `/emergency`, `/evolve` |
| **Dynamic** | Resolves based on runtime context | `/fix`, `/optimize`, `/investigate` |

Direct resolution is the simplest: the command specification names a specific agent, and the dispatch engine deploys that agent with the parsed parameters. Orchestrated resolution uses the Agent Registry's query interface to assemble an optimal agent team based on the task requirements. Dynamic resolution evaluates runtime context -- current platform state, active operations, resource availability -- to select the most appropriate agent.

### Coordination Patterns

Complex commands may deploy multiple agents that must coordinate during execution. The platform supports several coordination patterns:

- **Sequential**: Agents execute in defined order, each receiving the output of the previous agent as input. Used by `/evolve` which runs analysis, mutation, and validation agents in sequence.

- **Parallel**: Independent agents execute simultaneously. Used by `/orchestrate` when deploying specialists that operate on different aspects of a task.

- **Pipeline**: Agents form a processing pipeline where partial results flow through stages. Used by `/investigate` which passes raw intelligence through collection, analysis, and reporting agents.

- **Supervisory**: An L2 commander agent oversees the execution of multiple L3/L4 specialists, making real-time adjustments. Used by `/emergency` which deploys `archer-supreme` as the supervisory agent.

### The Orchestration Loop

The `/orchestrate` command demonstrates the full integration between the Command and Agent registries:

```elixir
defmodule PrismaticClaude.Orchestrator do
  @moduledoc """
  Implements the orchestration loop that connects
  command invocations to optimal agent team deployment.
  """

  @spec orchestrate(map()) :: {:ok, OrchestrateResult.t()} | {:error, term()}
  def orchestrate(params) do
    with {:ok, analysis} <- analyze_task(params),
         {:ok, candidates} <- query_agent_registry(analysis),
         {:ok, team} <- rank_and_select(candidates, analysis),
         {:ok, plan} <- build_execution_plan(team, params),
         {:ok, result} <- execute_plan(plan) do
      {:ok, %OrchestrateResult{
        task: analysis.task_type,
        agents_deployed: team,
        execution_plan: plan,
        result: result,
        fitness_feedback: compute_fitness(result)
      }}
    end
  end
end
```

The orchestration loop queries the Agent Registry based on task analysis, ranks candidates by fitness and coordination efficiency, builds an execution plan, and deploys the selected team. Fitness feedback from execution results feeds back into the evolution system, continuously improving agent selection over time.

## Statistics and Metrics

The Command Registry maintains comprehensive statistics reflecting the platform's operational scope.

### Current State

| Metric | Value |
|--------|-------|
| **Total commands** | 216 (211 static + 5 runtime) |
| **Operational categories** | 16 |
| **Parameter types** | 6 (string, enum, array, integer, boolean, path) |
| **Authority levels** | 5 (universal, standard, elevated, supreme, cosmic) |
| **AIAD compliance** | 100% (all commands include enforcement block) |
| **Average parameters per command** | 3.4 |
| **Commands with default values** | 189 (87.5%) |
| **Resolution strategies** | 3 (direct, orchestrated, dynamic) |
| **Quality gate pass rate** | 100% (zero violations) |

### Category Distribution

| Category | Count | Percentage |
|----------|-------|------------|
| Development (DX) | 22 | 10.2% |
| Intelligence (OSINT) | 11 | 5.1% |
| Operations | 9 | 4.2% |
| Evolution | 8 | 3.7% |
| Quality Enforcement | 8 | 3.7% |
| Architecture | 6 | 2.8% |
| Stack Mode | 6 | 2.8% |
| Local AI | 6 | 2.8% |
| M&A Operations | 5 | 2.3% |
| Documentation | 5 | 2.3% |
| Defensive Security | 4 | 1.9% |
| Color-Team Security | 4 | 1.9% |
| Perimeter (EASM) | 4 | 1.9% |
| Session Management | 4 | 1.9% |
| Crisis | 3 | 1.4% |
| Doctrine Enforcement | 3 | 1.4% |
| **Other / Uncategorized** | 108 | 50.0% |

The "Other / Uncategorized" group represents specialized commands that serve narrow operational needs -- individual agent invocations, utility functions, and domain-specific tools that do not cleanly fit the 16 primary categories.

### Usage Patterns

The most frequently invoked commands across platform operations:

| Rank | Command | Category | Typical Use |
|------|---------|----------|-------------|
| 1 | `/orchestrate` | Development | General-purpose task delegation |
| 2 | `/code` | Development | Code generation and implementation |
| 3 | `/fix` | Development | Bug fixing and error resolution |
| 4 | `/test` | Development | Test generation and execution |
| 5 | `/evolve` | Evolution | Ecosystem self-improvement |
| 6 | `/investigate` | Intelligence | OSINT data collection and analysis |
| 7 | `/quality.gates` | Quality | Quality validation and enforcement |
| 8 | `/refactor` | Development | Code restructuring and improvement |
| 9 | `/agents` | Operations | Agent discovery and browsing |
| 10 | `/stack` | Stack Mode | Conversation state inspection |

## Cross-References

The Command Registry integrates with and is referenced by numerous platform components:

- **[AIAD Standard](/capabilities/aiad-standard/)** -- The specification framework defining command schemas
- **[NO MERCY](/capabilities/no-mercy/)** -- The execution doctrine enforced by every command's enforcement block
- **[NO DOUBTS](/capabilities/no-doubts/)** -- The investigation doctrine requiring evidence-based action
- **[Quality Gates](/capabilities/quality-gates/)** -- The quality pipeline validating command specifications
- **[Trinity Gate](/capabilities/trinity-gate/)** -- The formal verification gate for command output validation
- **[Session Discipline](/capabilities/session-discipline/)** -- The session management protocol governing command execution context
- **[Regression Tests](/capabilities/regression-tests/)** -- The testing protocol ensuring command behavior stability
- **[Elixir](/technologies/elixir/)** -- The implementation language for the command dispatch engine
- **[Phoenix LiveView](/technologies/phoenix-liveview/)** -- The web framework powering interactive command interfaces
- **[ETS](/technologies/ets/)** -- The in-memory storage backend for runtime command resolution
- **[Mix](/technologies/mix/)** -- The build tool providing mix task command implementations
- **[Agent Registry](/registry/agents/)** -- The companion catalog of agents invoked by commands

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)