+++
title = "Prismatic Agents"
weight = 46
[extra]
category = "agents"
description = "Runtime engine application managing 530 AIAD-compliant agents across 16 operational domains with OTP-supervised lifecycle, O(1) ETS-backed registry, and telemetry integration"
related_terms = ["aiad", "agent", "agent-registry", "agent-tier", "supervision-tree", "genserver", "ets", "telemetry"]
keywords = ["Prismatic Agents runtime", "AIAD agent engine", "OTP agent management", "ETS agent registry", "agent supervision tree", "multi-agent coordination", "agent dispatch", "fault-tolerant agents"]
tags = ["agents", "runtime", "otp", "aiad"]
difficulty = "advanced"
audience = ["ai-architects", "platform-engineers", "agent-developers"]
domain = "agents"
stability = "stable"
since_version = "2.0.0"
agent_count = 530
domain_count = 16
registry_backend = "ETS"
lookup_complexity = "O(1)"
supervision_strategy = "one_for_one"
tier_levels = "L1-L5"
telemetry_namespace = "prismatic_agents"
see_also = ["architecture", "technologies", "apps"]
prerequisites = ["genserver", "supervision-tree", "ets", "aiad"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1384
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Prismatic Agents - Prismatic Platform"
+++

## Definition and Overview

Prismatic Agents (`prismatic_agents`) is the runtime engine application within the Prismatic Platform's [umbrella application](@/glossary/umbrella-application.md) that manages the complete lifecycle, coordination, dispatch, and monitoring of 530 AIAD-compliant agents across 16 operational domains. The application provides agent registration, discovery by capability or domain, message routing, telemetry emission, and graceful degradation through [OTP](@/glossary/otp.md)-supervised processes. Each agent is defined by an AIAD specification file that declares its tier level (L1-L5), operational domain, capability set, authority scope, and behavioral constraints, creating a uniform runtime contract that the engine enforces.

Prismatic Agents represents the convergence of AI agent orchestration with Erlang/OTP's battle-tested process management model. Rather than treating agents as stateless functions invoked on demand, the platform models each agent as a supervised process with its own state, mailbox, and lifecycle -- enabling persistent context, autonomous behavior, inter-agent communication, and fault-tolerant operation that survives individual agent failures without cascading to the broader system. This approach leverages the [BEAM](@/glossary/beam.md) virtual machine's fundamental strengths: lightweight processes, preemptive scheduling, per-process garbage collection, and message-passing isolation.

The 530 agents span 16 operational domains: security (Color-Team agents), intelligence (OSINT agents), quality (guardian and gate agents), evolution (autoevolve and autoheal agents), tactical (ARCHER, Supreme Commander, Delta Force), infrastructure ([supervisor](@/glossary/supervisor.md), storage, API agents), content (promo enhancer, documentation agents), analysis (epistemic pipeline, NABLA agents), compliance (NIS2, ZKB, OWASP agents), development (code generation, refactoring agents), testing (regression, property-based, integration agents), monitoring (telemetry, health, performance agents), deployment (release, CI/CD, Docker agents), research (GARDEN, knowledge extraction agents), ecosystem (OSS package, developer portal agents), and coordination (orchestration, dispatch, routing agents).

## Historical Context and Motivation

The agent runtime engine emerged from the recognition that managing hundreds of AI agents requires the same reliability guarantees that telecommunications systems demand for managing millions of concurrent connections. Early agent systems in the platform used ad-hoc process management -- spawning agents as needed and hoping they would remain healthy. This approach failed predictably: agent crashes went undetected, crashed agents were not restarted, and there was no way to discover which agents were available for a given task.

The transition to OTP-based agent management was inspired by Ericsson's experience with the AXD 301 ATM switch, which achieved nine nines (99.9999999%) uptime by modeling every connection as a supervised [Erlang](@/glossary/elixir.md) process. The same principle applies to agents: each agent is a supervised [GenServer](@/glossary/genserver.md) process, and the [supervision tree](@/glossary/supervision-tree.md) ensures that failed agents are automatically restarted according to configurable strategies.

The AIAD (AI Agent Integration and Definition) standard was introduced to bring uniformity to agent definitions. Before AIAD, each agent had its own ad-hoc configuration format, making automated discovery and validation impossible. AIAD provides a standardized YAML/Markdown format that declares an agent's tier, domain, capabilities, authority scope, and behavioral constraints, enabling the registry to validate and index agents at boot time.

## Technical Deep Dive

### Agent Registry Architecture

The Agent Registry provides O(1) lookup of agent definitions using [ETS](@/glossary/ets.md) (Erlang Term Storage) as the backing store, with secondary indexes for domain, tier, and capability queries:

```elixir
defmodule PrismaticAgents.Registry do
  @moduledoc """
  ETS-backed agent registry providing O(1) lookup by name,
  domain, tier, and capability. Registry is populated at
  boot time from AIAD agent definition files located in
  .aiad/agents/*.agent.md.
  """
  use GenServer

  @type agent_definition :: %{
    name: String.t(),
    tier: 1..5,
    domain: atom(),
    capabilities: [atom()],
    authority: atom(),
    status: :registered | :active | :suspended
  }

  @table_name :agent_registry
  @index_table :agent_index

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@table_name, [:named_table, :set, :public, read_concurrency: true])
    :ets.new(@index_table, [:named_table, :bag, :public, read_concurrency: true])

    agent_count = load_agent_definitions()

    :telemetry.execute(
      [:prismatic_agents, :registry_loaded],
      %{agent_count: agent_count},
      %{loaded_at: DateTime.utc_now()}
    )

    {:ok, %{agent_count: agent_count, loaded_at: DateTime.utc_now()}}
  end

  @spec lookup(String.t()) :: {:ok, agent_definition()} | {:error, :not_found}
  def lookup(agent_name) do
    case :ets.lookup(@table_name, agent_name) do
      [{^agent_name, definition}] -> {:ok, definition}
      [] -> {:error, :not_found}
    end
  end

  @spec by_domain(atom()) :: {:ok, [agent_definition()]}
  def by_domain(domain) do
    agents =
      :ets.lookup(@index_table, {:domain, domain})
      |> Enum.map(fn {_key, agent_name} ->
        {:ok, definition} = lookup(agent_name)
        definition
      end)

    {:ok, agents}
  end

  @spec by_tier(1..5) :: {:ok, [agent_definition()]}
  def by_tier(tier) when tier in 1..5 do
    agents =
      :ets.lookup(@index_table, {:tier, tier})
      |> Enum.map(fn {_key, agent_name} ->
        {:ok, definition} = lookup(agent_name)
        definition
      end)

    {:ok, agents}
  end

  @spec by_capability(atom()) :: {:ok, [agent_definition()]}
  def by_capability(capability) do
    agents =
      :ets.lookup(@index_table, {:capability, capability})
      |> Enum.map(fn {_key, agent_name} ->
        {:ok, definition} = lookup(agent_name)
        definition
      end)

    {:ok, agents}
  end

  @spec count() :: {:ok, non_neg_integer()}
  def count do
    {:ok, :ets.info(@table_name, :size)}
  end

  defp load_agent_definitions do
    definitions =
      Path.wildcard(".aiad/agents/*.agent.md")
      |> Enum.map(&parse_agent_definition/1)
      |> Enum.filter(&valid_definition?/1)

    Enum.each(definitions, fn definition ->
      :ets.insert(@table_name, {definition.name, definition})
      :ets.insert(@index_table, {{:domain, definition.domain}, definition.name})
      :ets.insert(@index_table, {{:tier, definition.tier}, definition.name})

      Enum.each(definition.capabilities, fn cap ->
        :ets.insert(@index_table, {{:capability, cap}, definition.name})
      end)
    end)

    length(definitions)
  end

  defp parse_agent_definition(path) do
    # Parse AIAD frontmatter from .agent.md files
    PrismaticAgents.AIADParser.parse(path)
  end

  defp valid_definition?(%{name: name, tier: tier, domain: domain})
       when is_binary(name) and tier in 1..5 and is_atom(domain),
       do: true

  defp valid_definition?(_), do: false
end
```

### Agent Supervision Tree

Agents are organized under a [supervision tree](@/glossary/supervision-tree.md) that mirrors the domain hierarchy, providing fault isolation at the domain level:

```
PrismaticAgents.Supervisor (one_for_one)
  |
  |-- PrismaticAgents.Registry (GenServer)
  |
  |-- PrismaticAgents.DomainSupervisor.Security (one_for_one)
  |     |-- red-commander (Agent GenServer)
  |     |-- red-epistemic-attacker (Agent GenServer)
  |     |-- blue-commander (Agent GenServer)
  |     |-- purple-coordinator (Agent GenServer)
  |     |-- ... (20 security agents total)
  |
  |-- PrismaticAgents.DomainSupervisor.Intelligence (one_for_one)
  |     |-- osint-coordinator (Agent GenServer)
  |     |-- email-osint (Agent GenServer)
  |     |-- ... (OSINT agents)
  |
  |-- PrismaticAgents.DomainSupervisor.Quality (one_for_one)
  |     |-- quality-floor-guardian (Agent GenServer)
  |     |-- ... (quality agents)
  |
  |-- PrismaticAgents.DomainSupervisor.Evolution (one_for_one)
  |     |-- autoevolve-coordinator (Agent GenServer)
  |     |-- autoheal-baseline (Agent GenServer)
  |     |-- ... (evolution agents)
  |
  |-- PrismaticAgents.DomainSupervisor.Ecosystem (one_for_one)
  |     |-- oss-package-coordinator (Agent GenServer)
  |     |-- developer-portal-agent (Agent GenServer)
  |     |-- ... (ecosystem agents)
  |
  |-- PrismaticAgents.Dispatcher (GenServer)
  |-- PrismaticAgents.Monitor (GenServer)
  |-- PrismaticAgents.Telemetry (GenServer)
```

This hierarchical structure provides several benefits. A crash in a security agent does not affect intelligence agents. A failure in the registry triggers restart of only the registry process (under `one_for_one`), leaving all agent processes intact with their accumulated state. The domain supervisors create natural boundaries for monitoring and management.

### Agent Lifecycle and Process Model

Each agent runs as a supervised GenServer with its own state, message queue, and telemetry emission:

```elixir
defmodule PrismaticAgents.AgentProcess do
  @moduledoc """
  Generic agent process implementing the AIAD agent lifecycle.
  Each agent runs as a supervised GenServer with its own state,
  message queue, and telemetry emission. Supports graceful
  degradation when error thresholds are exceeded.
  """
  use GenServer, restart: :transient

  require Logger

  @type status :: :initializing | :active | :degraded | :suspended | :terminated

  @type state :: %{
    name: String.t(),
    tier: 1..5,
    domain: atom(),
    status: status(),
    context: map(),
    message_count: non_neg_integer(),
    error_count: non_neg_integer(),
    started_at: DateTime.t(),
    last_activity: DateTime.t() | nil
  }

  @degradation_threshold 10
  @suspension_threshold 50

  @spec start_link(map()) :: GenServer.on_start()
  def start_link(definition) do
    GenServer.start_link(__MODULE__, definition, name: via_tuple(definition.name))
  end

  @impl GenServer
  def init(definition) do
    emit_telemetry(:agent_started, definition)

    {:ok,
     %{
       name: definition.name,
       tier: definition.tier,
       domain: definition.domain,
       status: :active,
       context: %{},
       message_count: 0,
       error_count: 0,
       started_at: DateTime.utc_now(),
       last_activity: nil
     }}
  end

  @impl GenServer
  def handle_call({:dispatch, message}, _from, state) do
    case execute_agent_logic(state, message) do
      {:ok, result} ->
        new_state = %{
          state
          | message_count: state.message_count + 1,
            last_activity: DateTime.utc_now()
        }

        emit_telemetry(:message_processed, new_state)
        {:reply, {:ok, result}, new_state}

      {:error, reason} ->
        new_state = %{state | error_count: state.error_count + 1}
        emit_telemetry(:message_error, new_state, %{reason: reason})
        {:reply, {:error, reason}, apply_health_policy(new_state)}
    end
  end

  @impl GenServer
  def handle_call(:status, _from, state) do
    {:reply, {:ok, Map.take(state, [:name, :status, :message_count, :error_count])}, state}
  end

  @spec apply_health_policy(state()) :: state()
  defp apply_health_policy(%{error_count: count} = state) when count > @suspension_threshold do
    Logger.warning("Agent #{state.name} suspended: #{count} errors exceeded suspension threshold")
    emit_telemetry(:agent_suspended, state)
    %{state | status: :suspended}
  end

  defp apply_health_policy(%{error_count: count} = state) when count > @degradation_threshold do
    Logger.warning("Agent #{state.name} degraded: #{count} errors exceeded degradation threshold")
    emit_telemetry(:agent_degraded, state)
    %{state | status: :degraded}
  end

  defp apply_health_policy(state), do: state

  defp via_tuple(name), do: {:via, Registry, {PrismaticAgents.ProcessRegistry, name}}

  defp emit_telemetry(event, state, metadata \\ %{}) do
    :telemetry.execute(
      [:prismatic_agents, event],
      %{timestamp: System.monotonic_time()},
      Map.merge(%{agent: state.name, domain: state.domain, tier: state.tier}, metadata)
    )
  end

  defp execute_agent_logic(state, message) do
    # Delegate to domain-specific agent logic module
    module = PrismaticAgents.LogicResolver.resolve(state.domain, state.name)
    module.handle(message, state.context)
  end
end
```

### Agent Dispatcher

The dispatcher resolves incoming requests to the appropriate agent based on capability matching, tier authority, and domain routing:

```elixir
defmodule PrismaticAgents.Dispatcher do
  @moduledoc """
  Routes incoming requests to appropriate agents based on
  capability matching, tier authority, and domain routing.
  Supports fan-out for multi-agent operations and aggregation
  for results collection.
  """
  use GenServer

  @spec dispatch(atom(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch(capability, message) do
    case PrismaticAgents.Registry.by_capability(capability) do
      {:ok, []} ->
        {:error, :no_agent_available}

      {:ok, agents} ->
        agent = select_best_agent(agents)
        dispatch_to_agent(agent.name, message)
    end
  end

  @spec dispatch_to_agent(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def dispatch_to_agent(agent_name, message) do
    via = {:via, Registry, {PrismaticAgents.ProcessRegistry, agent_name}}

    case GenServer.call(via, {:dispatch, message}, :timer.seconds(30)) do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, reason}
    end
  rescue
    e ->
      {:error, {:dispatch_failed, Exception.message(e)}}
  end

  @spec fan_out(atom(), map()) :: {:ok, [term()]} | {:error, term()}
  def fan_out(capability, message) do
    case PrismaticAgents.Registry.by_capability(capability) do
      {:ok, []} ->
        {:error, :no_agents_available}

      {:ok, agents} ->
        results =
          agents
          |> Task.async_stream(
            fn agent -> dispatch_to_agent(agent.name, message) end,
            max_concurrency: System.schedulers_online(),
            timeout: :timer.seconds(30)
          )
          |> Enum.map(fn
            {:ok, {:ok, result}} -> result
            {:ok, {:error, reason}} -> {:error, reason}
            {:exit, reason} -> {:error, {:exit, reason}}
          end)

        {:ok, results}
    end
  end

  defp select_best_agent(agents) do
    # Prefer active agents over degraded, higher tier over lower
    agents
    |> Enum.sort_by(fn agent ->
      {status_priority(agent.status), -agent.tier}
    end)
    |> List.first()
  end

  defp status_priority(:active), do: 0
  defp status_priority(:degraded), do: 1
  defp status_priority(_), do: 2
end
```

## Domain Distribution and Agent Categories

The 530 agents are distributed across 16 operational domains, each serving a distinct purpose within the platform:

| Domain | Agent Count | Key Agents | Responsibility |
|--------|------------|------------|----------------|
| Security | 20 | Red/Blue/Purple Commanders | Adversarial simulation, defense, synthesis |
| Intelligence | 45+ | OSINT Coordinator, Email OSINT | Open-source intelligence gathering |
| Quality | 30+ | Quality Floor Guardian | Quality monitoring and enforcement |
| Evolution | 25+ | AutoEvolve, AutoHeal | Autonomous platform improvement |
| Tactical | 15+ | ARCHER Supreme, Delta Force | Complex multi-step operations |
| Infrastructure | 20+ | Supervisor Architect | Platform infrastructure management |
| Content | 15+ | Promo Enhancer | Content generation and enhancement |
| Analysis | 20+ | Epistemic Pipeline, NABLA | Data analysis and epistemic reasoning |
| Compliance | 15+ | NIS2, ZKB, OWASP | Regulatory compliance assessment |
| Development | 25+ | Code Generator, Refactorer | Code generation and quality improvement |
| Testing | 20+ | Regression Guard | Test generation and execution |
| Monitoring | 15+ | Health Monitor, Performance | System observability |
| Deployment | 15+ | Release Manager, CI/CD | Deployment pipeline management |
| Research | 20+ | GARDEN, Knowledge Extractor | Knowledge management and extraction |
| Ecosystem | 10+ | OSS Coordinator, Portal | Open-source package management |
| Coordination | 15+ | Orchestrator, Dispatch | Cross-domain coordination |

## AIAD Compliance and Agent Definition

All agents follow the AIAD (AI Agent Integration and Definition) standard, which provides a uniform contract for agent specification:

```yaml
# Example AIAD agent definition (.aiad/agents/red-commander.agent.md)
agent-spec:
  name: red-commander
  tier: L3
  domain: security
  designation: "Red Team Commander"
  capabilities:
    - adversarial-simulation
    - epistemic-attacks
    - scenario-generation
  authority:
    scope: security-domain
    level: strategic
  constraints:
    - sandbox-only
    - synthetic-data-only
    - no-network-access
  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
```

## Comparison with Alternative Agent Frameworks

| Framework | Agent Model | Coordination | Fault Tolerance | Scale | Language |
|-----------|------------|--------------|-----------------|-------|---------|
| **Prismatic Agents** | OTP GenServer per agent | Message passing + PubSub | Supervisor restart | 530 agents, ETS registry | Elixir |
| **LangChain** | Stateless function chains | Sequential chain execution | Try/catch per step | Unlimited chains | Python/JS |
| **AutoGen** | Conversational agents | Multi-agent chat | Retry with fallback | 2-10 agents typical | Python |
| **CrewAI** | Role-based agents | Task delegation | Retry mechanism | 3-15 agents typical | Python |
| **Semantic Kernel** | Plugin-based | Planner orchestration | Plugin retry | Plugin count limited | C#/Python |
| **Custom Actor System** | Actor per agent | Akka/Proto.Actor | Supervision hierarchy | Cluster-wide | JVM/Go |

Prismatic Agents' primary differentiator is its foundation on OTP, which provides battle-tested process supervision, fault isolation, and hot code reloading. The tradeoff is the requirement that agents run within the [BEAM](@/glossary/beam.md) ecosystem. However, this tradeoff is overwhelmingly positive for a platform that already uses [Elixir](@/glossary/elixir.md) as its primary language.

## Telemetry and Monitoring

Every agent lifecycle event emits [telemetry](@/glossary/telemetry.md) events under the `[:prismatic_agents, *]` namespace:

| Event | Measurements | Metadata | Purpose |
|-------|-------------|----------|---------|
| `agent_started` | timestamp | agent, domain, tier | Lifecycle tracking |
| `message_processed` | timestamp | agent, domain, tier | Throughput monitoring |
| `message_error` | timestamp | agent, domain, tier, reason | Error rate tracking |
| `agent_degraded` | timestamp | agent, domain, error_count | Health monitoring |
| `agent_suspended` | timestamp | agent, domain, error_count | Critical alerting |
| `registry_loaded` | agent_count | loaded_at | Boot verification |

## Best Practices

**Domain Isolation**: Group agents by operational domain and enforce isolation boundaries. A security agent should not directly access quality agent state. All cross-domain communication should flow through the dispatcher.

**Tier Authority**: Respect the tier hierarchy (L1-L5) in agent interactions. Lower-tier agents should not override decisions made by higher-tier agents. The tier system prevents authority conflicts in multi-agent workflows.

**Graceful Degradation**: Design agents to degrade gracefully rather than crash hard. An agent experiencing transient errors should enter degraded status with reduced capabilities rather than crashing and restarting with lost context.

**Telemetry Coverage**: Emit telemetry events for all significant agent actions, not just errors. Comprehensive telemetry enables proactive monitoring and trend analysis by the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md).

**Stateless Where Possible**: Minimize per-agent state. Agents that rely heavily on accumulated state are harder to restart and more vulnerable to state corruption. Persist critical state to storage backends and reload on restart.

**AIAD Compliance**: Always define agents through AIAD specification files. Ad-hoc agents that bypass the specification system cannot be discovered, monitored, or managed by the runtime engine.

## Common Pitfalls

**Cross-domain state sharing**: Agents in different domains should not share state directly through ETS or process state. This creates hidden coupling that undermines the domain isolation benefits of the supervision tree.

**Ignoring degradation signals**: When an agent enters degraded status, it indicates a systemic issue that should be investigated. Continuing to dispatch work to degraded agents produces unreliable results.

**Overloading individual agents**: Dispatching all requests for a capability to a single agent creates a bottleneck. Use fan-out patterns or agent pools for high-throughput capabilities.

**Missing AIAD definitions**: Agents without AIAD specification files are invisible to the registry. They cannot be discovered by capability, monitored by the telemetry system, or managed by the supervision tree.

## Related Concepts

- [AIAD](@/glossary/aiad.md) -- Agent integration standard governing agent specification and lifecycle
- [Agent](@/glossary/agent.md) -- Individual AI agent unit managed by the runtime engine
- [Agent Registry](@/glossary/agent-registry.md) -- Registration system for agent discovery and lookup
- [Agent Tier](@/glossary/agent-tier.md) -- Authority level classification for runtime agents
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP hierarchy managing agent process lifecycles
- [GenServer](@/glossary/genserver.md) -- Process abstraction backing each agent instance
- [ETS](@/glossary/ets.md) -- In-memory storage backing the agent registry
- [Telemetry](@/glossary/telemetry.md) -- Event system for agent monitoring and observability
- [Elixir](@/glossary/elixir.md) -- Programming language implementing the agent runtime
- [BEAM](@/glossary/beam.md) -- Virtual machine providing process isolation for agents

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Agents](@/agents/_index.md) -- AIAD agent catalog

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
