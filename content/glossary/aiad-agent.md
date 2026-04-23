+++
title = "AIAD Agent"
weight = 50
[extra]
description = "An autonomous intelligent agent defined by the AIAD standard, operating within the Prismatic Platform's hierarchical authority structure with declared capabilities, constraints, and doctrine compliance"
category = "platform"
related_terms = ["agent-profile", "agent", "agent-orchestration", "command-registry", "doctrine", "auto-discovery", "collaboration"]
tags = ["glossary", "aiad-agent", "aiad", "autonomous-agent", "authority-level", "platform", "otp", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
difficulty = "intermediate"
quality_score = 88
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "AIAD agents are the 530+ autonomous operational units of the Prismatic Platform, each governed by declared profiles, authority levels, and the NO MERCY NO DOUBTS doctrine"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["AIAD agent", "autonomous agent", "agent framework", "authority level", "agent hierarchy", "platform agent", "agent standard", "agent capabilities", "NO MERCY NO DOUBTS"]
image = "/images/sections/glossary.png"
image_alt = "AIAD Agent - Prismatic Platform"
word_count = 1050
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An AIAD (AI-Assisted Development) agent is an autonomous operational unit within the Prismatic Platform, defined by a structured profile document that declares its identity, capabilities, constraints, authority level, and doctrine compliance. Unlike simple scripts or functions, AIAD agents operate within a hierarchical authority structure (L0-L4), can coordinate with other agents through orchestration patterns, and are subject to the NO MERCY, NO DOUBTS doctrine's quality and completeness requirements.

The Prismatic Platform hosts 530+ AIAD agents across 16 domains, ranging from L0 informational observers to L4 supreme coordinators, all registered in the AIAD Agent Registry and discoverable through the platform's auto-indexing system.

## Technical Deep Dive

### Agent Anatomy

Every AIAD agent consists of three layers:

| Layer | Content | Location |
|-------|---------|----------|
| **Profile** | Identity, capabilities, constraints, authority | `.aiad/agents/*.agent.md` |
| **Runtime** | OTP process, message handling, state | `apps/prismatic_agents/` |
| **Commands** | User-facing invocations mapped to agent | `.aiad/commands/*.cmd.md` |

### Authority Level Distribution (530+ agents)

| Level | Count | Role | Examples |
|-------|-------|------|----------|
| **L4 Supreme** | ~5 | Platform-wide authority | archer-supreme, supreme-coordinator |
| **L3 Strategic** | ~30 | Domain orchestrators | osint-coordinator, red-commander |
| **L2 Tactical** | ~100 | Task specialists | red-epistemic-attacker, blue-drift-detector |
| **L1 Operational** | ~200 | Single-operation workers | code-reviewer, test-runner |
| **L0 Informational** | ~195 | Read-only observers | log-monitor, metric-collector |

### Domain Distribution

| Domain | Agents | Key Agents |
|--------|--------|------------|
| Security | 60+ | Color team agents (Red, Blue, Purple, White, Black, Gray) |
| Quality | 40+ | Quality guardian, credo enforcer, dialyzer agent |
| OSINT | 30+ | OSINT coordinator, tool-specific adapters |
| Development | 50+ | Code reviewer, refactorer, test generator |
| Infrastructure | 25+ | Deploy agent, health monitor, performance profiler |
| Academy | 15+ | Topic curator, quiz generator, progress tracker |

## Architecture and Implementation

### Agent Runtime

```elixir
defmodule PrismaticAgents.AgentRuntime do
  @moduledoc """
  OTP-based runtime for AIAD agents. Each agent runs as a supervised
  GenServer process with its profile loaded as initial state.
  Authority checks are enforced before every operation dispatch.
  """

  use GenServer

  alias Prismatic.AIAD.AuthorityGuard

  @type state :: %{
          profile: map(),
          status: :idle | :executing | :suspended,
          execution_count: non_neg_integer(),
          last_execution: DateTime.t() | nil
        }

  @spec start_link(map()) :: GenServer.on_start()
  def start_link(profile) do
    GenServer.start_link(__MODULE__, profile,
      name: {:via, Registry, {PrismaticAgents.Registry, profile.name}})
  end

  @impl GenServer
  def init(profile) do
    state = %{
      profile: profile,
      status: :idle,
      execution_count: 0,
      last_execution: nil
    }

    :telemetry.execute(
      [:prismatic, :agent, :started],
      %{count: 1},
      %{name: profile.name, level: profile.level}
    )

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:execute, operation, params}, _from, state) do
    required_level = operation_authority_level(operation)

    case AuthorityGuard.authorize_operation(state.profile.level, required_level) do
      :ok ->
        result = execute_operation(state.profile, operation, params)
        new_state = %{state |
          status: :idle,
          execution_count: state.execution_count + 1,
          last_execution: DateTime.utc_now()
        }
        {:reply, {:ok, result}, new_state}

      {:error, :insufficient_authority} ->
        {:reply, {:error, :insufficient_authority}, state}
    end
  end

  @spec execute_operation(map(), atom(), map()) :: term()
  defp execute_operation(profile, operation, params) do
    :telemetry.execute(
      [:prismatic, :agent, :operation],
      %{count: 1},
      %{agent: profile.name, operation: operation}
    )

    apply(operation_module(operation), :execute, [profile, params])
  end
end
```

## Usage in Prismatic Platform

AIAD agents are the operational backbone of the platform:

- **Development Workflow**: Agents handle code review, testing, refactoring, and quality gate enforcement
- **OSINT Intelligence**: Specialized agents coordinate the 127 OSINT tool adapters
- **Security Operations**: 20 Color Team agents across 6 teams perform adversarial simulation and defense
- **Quality Assurance**: Agents enforce zero-warning compilation, Credo strictness, and coverage requirements
- **Platform Evolution**: Auto-evolution agents continuously improve the codebase across sessions
- **Academy**: Topic agents curate learning content and track student progress

## Code Examples

### Agent Invocation via Command

```elixir
defmodule PrismaticAgents.CommandDispatcher do
  @moduledoc """
  Dispatches user commands to the appropriate AIAD agent.
  Maps command slugs to agent names via the command registry.
  """

  @spec dispatch(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch(command_slug, params) do
    with {:ok, agent_name} <- lookup_agent(command_slug),
         {:ok, pid} <- find_agent_process(agent_name),
         {:ok, result} <- GenServer.call(pid, {:execute, :handle_command, params}) do
      {:ok, result}
    end
  end

  @spec lookup_agent(String.t()) :: {:ok, String.t()} | {:error, :unknown_command}
  defp lookup_agent(command_slug) do
    case PrismaticAgents.CommandRegistry.get_command(command_slug) do
      {:ok, %{agent: agent_name}} -> {:ok, agent_name}
      {:error, :not_found} -> {:error, :unknown_command}
    end
  end

  @spec find_agent_process(String.t()) :: {:ok, pid()} | {:error, :agent_not_running}
  defp find_agent_process(agent_name) do
    case Registry.lookup(PrismaticAgents.Registry, agent_name) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, :agent_not_running}
    end
  end
end
```

## Best Practices

1. **Follow the authority principle**: Never assign a higher authority level than necessary. Most agents should be L1-L2.

2. **Declare constraints explicitly**: Capabilities without constraints are dangerous. Every agent must declare what it cannot do.

3. **Mandate doctrine compliance**: Every AIAD agent must include the NO MERCY, NO DOUBTS enforcement block in its profile.

4. **Use the AIAD indexer**: Run `./.aiad/bin/aiad index` after creating or modifying agent profiles.

5. **Test agent behavior**: Every agent operation must have corresponding tests verifying both success and authority rejection paths.

6. **Monitor agent health**: Use telemetry events to track agent execution counts, latency, and error rates.

## Related Terms

- [Agent Profile](@/glossary/agent-profile.md) -- the declarative identity document for each agent
- **Command Registry** -- maps user commands to agents
- [Auto-Discovery](@/glossary/auto-discovery.md) -- automatic agent detection and registration
- **Collaboration** -- multi-agent coordination patterns
- [Access Control](@/glossary/access-control.md) -- authority enforcement on agent operations

## See Also

- [AIAD Standard](@/glossary/aiad.md) -- the framework specification
- [Agent Registry](.claude/AGENT_REGISTRY.md) -- complete listing of all agents
- [Color Teams](@/glossary/color-teams.md) -- security-focused agent teams

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
