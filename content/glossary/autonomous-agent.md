+++
title = "Autonomous Agent"
weight = 50
[extra]
tags = ["glossary", "agents", "ai", "aiad", "autonomy", "orchestration", "multi-agent", "authority"]
description = "A software entity operating independently within defined authority bounds, capable of perceiving its environment, making decisions, and executing actions without human intervention -- the fundamental unit of intelligence in the Prismatic Platform's 530+ agent ecosystem"
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "AI Agents and Multi-Agent Systems"
related_concepts = ["agent", "aiad", "ai-agent", "agent-tier", "multi-agent-system", "orchestration", "authority-level", "agent-registry"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 8
prerequisites = ["agent", "aiad", "genserver", "supervision-tree", "authority-level"]
learning_path = ["agent", "agent-tier", "aiad", "autonomous-agent", "multi-agent-system", "orchestration"]
interactive_demos = ["/labs/glossary/autonomous-agent"]
code_examples = ["Agent behaviour definition", "Authority-bounded agent", "Agent lifecycle GenServer"]
external_resources = ["https://en.wikipedia.org/wiki/Intelligent_agent", "https://www.cs.cmu.edu/~softagents/multi.html"]
version_introduced = "Generation 3"
stability_level = "stable"
testing_scenarios = ["authority boundary enforcement", "agent lifecycle management", "inter-agent communication", "escalation protocols", "failure recovery"]
keywords = ["agent", "autonomous", "aiad", "authority", "intelligence", "orchestration", "multi-agent", "delegation", "perception", "decision", "action"]
related_terms = ["agent", "aiad", "ai-agent", "agent-tier", "multi-agent-system", "orchestration", "authority-level", "agent-registry", "agent-module", "archer-supreme"]
word_count = 1956
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Autonomous Agent - Prismatic Platform"
+++

## Definition

An autonomous agent is a software entity that operates independently within defined authority bounds, capable of perceiving its environment, reasoning about its observations, making decisions, and executing actions -- all without requiring human intervention at the point of action. The word "autonomous" does not mean "unconstrained." It means the agent possesses the internal decision-making capability to operate without moment-to-moment human direction, while remaining within a governance framework that defines what it is authorized to do.

Formally, an autonomous agent is a tuple `A = (P, D, E, Auth, State)` where:
- `P: Environment -> Percepts` is the perception function
- `D: Percepts x State x Auth -> Action` is the decision function
- `E: Action -> Environment'` is the execution function
- `Auth: AuthorityLevel` bounds the agent's decision space
- `State: map()` maintains the agent's internal knowledge

The critical distinction between an autonomous agent and a simple automation script is the decision function. A script executes a predetermined sequence. An agent evaluates its situation and chooses its response.

## Overview

The history of autonomous agents in computing traces from early AI research in the 1950s (Newell and Simon's General Problem Solver) through expert systems in the 1980s, software agents in the 1990s (Wooldridge and Jennings), and modern large language model (LLM) based agents in the 2020s. Each generation expanded the class of problems that agents could handle autonomously, while simultaneously revealing the importance of governance -- unbounded autonomy in software is not a feature, it is a liability.

Three properties define an autonomous agent:

1. **Autonomy**: The agent operates without direct human control. It receives goals, not step-by-step instructions.
2. **Reactivity**: The agent perceives its environment and responds to changes in a timely manner.
3. **Proactivity**: The agent does not simply react -- it takes initiative toward its goals, anticipating needs rather than waiting for explicit requests.

A fourth property, **social ability**, becomes important in multi-agent systems: the capacity to communicate and coordinate with other agents to achieve collective goals that no single agent could accomplish alone.

The Prismatic Platform hosts over 530 autonomous agents organized into a hierarchical authority structure with five levels (L1 through L5), spanning 16 operational domains from code quality enforcement to security operations to platform evolution. This is not a theoretical framework -- these agents execute daily, making thousands of decisions that shape the platform's development, quality, and evolution.

The design philosophy behind Prismatic's agent architecture is borrowed from military command structures: **centralized intent, decentralized execution**. Strategic direction comes from high-authority agents (L3-L5); tactical execution is delegated to specialists (L1-L2) who have the autonomy to determine how to accomplish their assigned tasks within their authority bounds.

## Technical Details

### Agent Architecture

Every autonomous agent in the Prismatic Platform is defined as an AIAD (Artificial Intelligence Agent Definition) specification:

| Component | Purpose | Example |
|-----------|---------|---------|
| **Identity** | Unique identifier and metadata | `red-commander`, L3 Strategic |
| **Authority** | What the agent is permitted to do | L1-L5 with category restrictions |
| **Capabilities** | What the agent can do | Code analysis, security scanning |
| **Triggers** | When the agent activates | Event-driven, scheduled, commanded |
| **Protocols** | How the agent communicates | Direct call, message passing, escalation |
| **Constraints** | What the agent must not do | Safety boundaries, forbidden operations |

### Agent Behaviour Definition

The Prismatic Platform defines a behaviour (Elixir callback interface) that all autonomous agents must implement:

```elixir
defmodule Prismatic.Agent.Behaviour do
  @moduledoc """
  Defines the contract that all autonomous agents must implement.
  This behaviour ensures consistent lifecycle management, authority
  enforcement, and observability across all 530+ platform agents.
  """

  @type percept :: %{
    source: atom(),
    data: term(),
    timestamp: DateTime.t(),
    reliability: float()
  }

  @type action :: %{
    type: atom(),
    parameters: map(),
    authority_required: authority_level(),
    reversible: boolean()
  }

  @type authority_level :: :l1_operational | :l2_tactical | :l3_strategic | :l4_supreme | :l5_cosmic

  @type agent_state :: %{
    id: atom(),
    authority: authority_level(),
    domain: atom(),
    active_task: term() | nil,
    knowledge: map(),
    metrics: map()
  }

  @doc "Initialize agent with configuration and authority assignment."
  @callback init(config :: map()) :: {:ok, agent_state()} | {:error, String.t()}

  @doc "Process incoming percepts and update internal state."
  @callback perceive([percept()], agent_state()) :: {:ok, agent_state()}

  @doc "Evaluate current state and decide on next action."
  @callback decide(agent_state()) :: {:action, action()} | {:wait, pos_integer()} | :idle

  @doc "Execute the decided action within authority bounds."
  @callback execute(action(), agent_state()) ::
    {:ok, result :: term(), agent_state()}
    | {:error, reason :: String.t(), agent_state()}
    | {:escalate, action(), target :: atom()}

  @doc "Report current status for monitoring and coordination."
  @callback status(agent_state()) :: map()

  @doc "Gracefully shut down, releasing all resources."
  @callback terminate(reason :: term(), agent_state()) :: :ok
end
```

### Authority-Bounded Agent Implementation

A concrete agent implementation demonstrates how authority bounds are enforced:

```elixir
defmodule Prismatic.Agent.QualityEnforcer do
  @moduledoc """
  L2 Tactical agent responsible for code quality enforcement.
  Perceives code changes, evaluates quality metrics, and decides
  whether to approve or reject changes based on quality gates.
  Cannot modify quality gate configuration (L3+ authority required).
  """

  @behaviour Prismatic.Agent.Behaviour

  @authority :l2_tactical
  @domain :quality
  @permitted_actions [:analyze_code, :report_violation, :suggest_fix, :block_commit]
  @forbidden_actions [:modify_quality_config, :override_gate, :change_authority]

  @impl Prismatic.Agent.Behaviour
  @spec init(map()) :: {:ok, Prismatic.Agent.Behaviour.agent_state()} | {:error, String.t()}
  def init(config) do
    state = %{
      id: :quality_enforcer,
      authority: @authority,
      domain: @domain,
      active_task: nil,
      knowledge: %{
        quality_domains: config[:domains] || default_domains(),
        violation_history: [],
        current_score: 100
      },
      metrics: %{
        decisions_made: 0,
        violations_found: 0,
        false_positives: 0
      }
    }

    {:ok, state}
  end

  @impl Prismatic.Agent.Behaviour
  @spec perceive([Prismatic.Agent.Behaviour.percept()], Prismatic.Agent.Behaviour.agent_state()) ::
    {:ok, Prismatic.Agent.Behaviour.agent_state()}
  def perceive(percepts, state) do
    relevant_percepts =
      percepts
      |> Enum.filter(fn p -> p.source in [:git_hook, :ci_pipeline, :quality_scan] end)
      |> Enum.filter(fn p -> p.reliability >= 0.8 end)

    updated_knowledge =
      Enum.reduce(relevant_percepts, state.knowledge, fn percept, knowledge ->
        integrate_percept(percept, knowledge)
      end)

    {:ok, %{state | knowledge: updated_knowledge}}
  end

  @impl Prismatic.Agent.Behaviour
  @spec decide(Prismatic.Agent.Behaviour.agent_state()) ::
    {:action, Prismatic.Agent.Behaviour.action()} | {:wait, pos_integer()} | :idle
  def decide(state) do
    case analyze_current_state(state.knowledge) do
      {:violations_found, violations} ->
        {:action, %{
          type: :report_violation,
          parameters: %{violations: violations, severity: max_severity(violations)},
          authority_required: @authority,
          reversible: true
        }}

      {:commit_pending, changes} ->
        action_type = if quality_passes?(changes, state.knowledge), do: :approve, else: :block_commit
        {:action, %{
          type: action_type,
          parameters: %{changes: changes},
          authority_required: @authority,
          reversible: true
        }}

      :no_pending_work ->
        :idle
    end
  end

  @impl Prismatic.Agent.Behaviour
  @spec execute(Prismatic.Agent.Behaviour.action(), Prismatic.Agent.Behaviour.agent_state()) ::
    {:ok, term(), Prismatic.Agent.Behaviour.agent_state()}
    | {:error, String.t(), Prismatic.Agent.Behaviour.agent_state()}
    | {:escalate, Prismatic.Agent.Behaviour.action(), atom()}
  def execute(action, state) do
    cond do
      action.type in @forbidden_actions ->
        {:escalate, action, :quality_commander}

      action.authority_required not in achievable_authorities(@authority) ->
        {:escalate, action, :quality_commander}

      true ->
        result = perform_action(action)
        updated_metrics = %{state.metrics | decisions_made: state.metrics.decisions_made + 1}
        {:ok, result, %{state | metrics: updated_metrics}}
    end
  end

  @impl Prismatic.Agent.Behaviour
  @spec status(Prismatic.Agent.Behaviour.agent_state()) :: map()
  def status(state) do
    %{
      id: state.id,
      authority: state.authority,
      domain: state.domain,
      active: state.active_task != nil,
      quality_score: state.knowledge.current_score,
      decisions_made: state.metrics.decisions_made,
      violations_found: state.metrics.violations_found
    }
  end

  @impl Prismatic.Agent.Behaviour
  @spec terminate(term(), Prismatic.Agent.Behaviour.agent_state()) :: :ok
  def terminate(_reason, _state), do: :ok

  defp default_domains, do: [:compilation, :credo, :dialyzer, :test_coverage]
  defp integrate_percept(_percept, knowledge), do: knowledge
  defp analyze_current_state(_knowledge), do: :no_pending_work
  defp max_severity(_violations), do: :medium
  defp quality_passes?(_changes, _knowledge), do: true
  defp achievable_authorities(:l1_operational), do: [:l1_operational]
  defp achievable_authorities(:l2_tactical), do: [:l1_operational, :l2_tactical]
  defp achievable_authorities(:l3_strategic), do: [:l1_operational, :l2_tactical, :l3_strategic]
  defp achievable_authorities(_), do: [:l1_operational, :l2_tactical, :l3_strategic, :l4_supreme]
  defp perform_action(_action), do: :ok
end
```

### Authority Hierarchy

The five authority levels define the agent's decision scope:

| Level | Name | Decision Scope | Agent Count | Example Agents |
|-------|------|---------------|-------------|----------------|
| **L1** | Operational | Execute predefined tasks | ~300 | Code formatters, report generators |
| **L2** | Tactical | Choose approach within task | ~150 | Quality enforcers, security scanners |
| **L3** | Strategic | Set team/domain direction | ~60 | Team commanders, domain architects |
| **L4** | Supreme | Platform-wide decisions | ~15 | Archer Supreme, Supreme Coordinator |
| **L5** | Cosmic | Doctrine-level decisions | ~5 | Reserved for fundamental principles |

### Inter-Agent Communication

Agents communicate through three mechanisms:

1. **Direct delegation**: A higher-authority agent assigns a task to a lower-authority agent. The delegation includes the task specification, authority bounds, and reporting requirements.

2. **Event broadcasting**: An agent emits an event via the telemetry system. Other agents that have subscribed to that event type receive it and may react. This is the primary mechanism for loose coupling between agents in different domains.

3. **Escalation**: When an agent encounters a situation that exceeds its authority, it escalates to a specific higher-authority agent. The escalation includes the full context of the situation and the agent's recommendation.

### Agent Lifecycle

```
DEFINED (in .aiad/agents/*.agent.md)
    |
    v
REGISTERED (in Agent Registry)
    |
    v
INITIALIZED (state loaded, authority assigned)
    |
    v
ACTIVE (perception-decision-execution loop)
    |         |
    |         v
    |    SUSPENDED (temporary deactivation)
    |         |
    |         v
    |    RESUMED -> ACTIVE
    |
    v
TERMINATED (graceful shutdown, state persisted)
```

## Implementation in Prismatic Platform

### AIAD Standard

The [AIAD](/glossary/aiad/) (Artificial Intelligence Agent Definition) standard governs all agent definitions on the platform. Each agent is specified in a YAML-formatted Markdown file (`.aiad/agents/*.agent.md`) that defines identity, authority, capabilities, triggers, protocols, and constraints. The standard ensures consistency across all 530+ agents.

### Agent Registry

The [Agent Registry](/glossary/agent-registry/) maintains the authoritative catalog of all registered agents. It provides lookup by ID, domain, authority level, and capability. The registry is indexed by the AIAD tooling (`./aiad/bin/aiad index`) and serves as the source of truth for agent discovery.

### Color Teams

The platform organizes specialized agents into [Color Teams](/glossary/color-teams/) for security operations:

- **Gray Team** (3 agents): Boundary exploration, specification gap identification
- **Red Team** (4 agents): Adversarial simulation, epistemic attack scenarios
- **Blue Team** (4 agents): Defensive posture, signal aggregation, drift detection
- **Purple Team** (4 agents): Red-Blue synthesis, closure analysis, regression guarding
- **White Team** (3 agents): Formal verification, contract validation, invariant proofs
- **Black Team** (2 agents): Theoretical threat modeling (maximum isolation)

Each team operates as a coordinated multi-agent system with a commander agent (L3) directing specialist agents (L2/L4).

### Archer Supreme

[Archer Supreme](/glossary/archer-supreme/) is the platform's highest-authority operational agent (L4 Supreme). It orchestrates cross-domain operations, resolves inter-agent conflicts, and makes platform-wide decisions when no other agent has sufficient authority. It is invoked via `/archer-supreme` for crisis intervention and strategic direction.

### Agent Authority Delegation

The [Agent Tier](/glossary/agent-tier/) system ensures that delegation follows the authority hierarchy. An L2 agent can delegate to L1 agents in its domain. An L3 commander can delegate to L2 specialists. Authority cannot be delegated upward -- an agent cannot grant more authority than it possesses.

### Multi-Agent Orchestration

The [Orchestration](/glossary/orchestration/) system coordinates multiple agents working on related tasks. When a complex operation requires capabilities spanning multiple domains (for example, a security assessment that requires OSINT scanning, vulnerability analysis, and compliance checking), the orchestrator decomposes the task, assigns subtasks to appropriate agents, and assembles results.

## Comparison with Alternatives

| Approach | Autonomy | Coordination | Governance | Scalability | Complexity |
|----------|----------|--------------|------------|-------------|------------|
| **Monolithic script** | None | N/A | Implicit | Poor | Low |
| **Microservices** | Limited | API calls | Service contracts | Good | Medium |
| **LLM-based agents** | High | Prompt chaining | Prompt engineering | Medium | High |
| **BDI agents** | High | Message passing | Belief-desire-intention | Good | High |
| **AIAD agents (Prismatic)** | High | Multi-mechanism | Authority hierarchy | Excellent | High |

The Prismatic approach differs from pure LLM-based agents in that authority bounds are enforced structurally, not through prompt instructions. An L2 agent cannot escalate to L4 operations because the code prevents it, not because a prompt tells it not to. This provides stronger safety guarantees than prompt-based governance.

Compared to traditional BDI (Belief-Desire-Intention) agent architectures, the Prismatic model adds explicit authority levels, the NABLA Infinity epistemic framework for decision quality, and the AIAD specification standard for consistent agent definition. The trade-off is higher upfront design cost in exchange for stronger governance and auditability.

## Best Practices

1. **Define authority before capabilities**: An agent's authority bounds should be designed before its capabilities. This ensures that capability development is guided by governance requirements, not the reverse.

2. **Implement the escalation path**: Every agent must have a defined escalation target for situations that exceed its authority. An agent that cannot escalate is an agent that will either fail silently or exceed its bounds.

3. **Make decisions observable**: Every decision an agent makes should emit a telemetry event that includes the inputs considered, the decision logic applied, and the output chosen. This enables audit, debugging, and performance optimization.

4. **Test authority boundaries**: Write tests that verify an agent correctly refuses to execute actions that exceed its authority. These boundary tests are as important as functional tests.

5. **Design for graceful degradation**: When an agent's dependencies are unavailable, it should degrade to a safe state (reduced functionality, not failure). An agent that crashes when its database is slow cascades the problem.

6. **Keep agent state minimal**: An agent's internal state should contain only what it needs for its current decision cycle. Persistent state should be externalized to storage systems. This enables agent restart without state loss.

7. **Separate perception from decision from execution**: These three functions have different testing requirements, failure modes, and performance characteristics. Mixing them produces agents that are difficult to test, debug, and optimize.

## Common Pitfalls

1. **Authority inflation**: Over time, agents accumulate capabilities beyond their original authority level. Each new capability should be evaluated against the agent's authority bounds, and capabilities that exceed bounds should trigger an authority review.

2. **God agent**: Creating a single agent that handles everything in a domain, rather than decomposing into specialized agents with clear responsibilities. God agents are difficult to test, reason about, and evolve.

3. **Implicit coordination**: Agents that coordinate through shared mutable state rather than explicit communication. This creates hidden dependencies that are invisible to the governance framework and impossible to audit.

4. **Ignoring the perception phase**: Agents that act on stale or unreliable information. The perception function must filter for signal quality and recency before feeding data to the decision function.

5. **Synchronous everything**: Making all inter-agent communication synchronous creates bottlenecks and cascading timeouts. Use asynchronous communication for non-blocking coordination and synchronous calls only when the caller genuinely cannot proceed without the result.

6. **Testing in isolation only**: Testing an agent's behavior in isolation misses interaction effects. Multi-agent integration tests that exercise real coordination paths are essential for a functioning agent system.

7. **Conflating autonomy with intelligence**: An autonomous agent does not need to be intelligent. Many effective agents implement simple rules within well-defined authority bounds. Complexity should be proportional to the problem, not the technology.

## Use Cases

### Quality Enforcement
Quality enforcer agents (L2) continuously monitor code quality across 13 domains. When a developer commits code, these agents perceive the change, evaluate it against quality gates, and decide whether to approve or block the commit. This happens in seconds, providing rapid feedback without human reviewer bottleneck.

### Security Operations
Color team agents conduct continuous security assessment. Red team agents simulate adversarial scenarios; blue team agents detect and defend against threats; purple team agents synthesize findings into actionable security posture improvements. This multi-agent approach provides comprehensive security coverage that no single agent could achieve.

### Platform Evolution
The [Autoevolve](/glossary/autoevolve/) agent system identifies optimization opportunities and applies improvements autonomously. Higher-authority evolution agents (L3) set strategic direction; lower-authority specialists (L1-L2) execute specific improvements within their domains. The collective result is continuous platform evolution.

### OSINT Intelligence Gathering
Over 120 OSINT adapters operate as specialized agents that gather intelligence from public sources (ARES, Shodan, VirusTotal, etc.). Each adapter agent has narrow authority (query a specific source, return structured results) and feeds into aggregation agents that correlate findings across sources.

### Crisis Resolution
When a critical issue is detected (quality emergency, security incident, production failure), the Archer Supreme agent coordinates the response. It perceives the crisis, evaluates available resources, delegates investigation tasks to specialist agents, assembles findings, and recommends (or executes) remediation -- all within its L4 authority bounds.

## Related Concepts

- [Agent](/glossary/agent/) -- the general concept of a software agent
- [AIAD](/glossary/aiad/) -- the standard for defining agents on the Prismatic Platform
- [AI Agent](/glossary/ai-agent/) -- agents powered by artificial intelligence models
- [Agent Tier](/glossary/agent-tier/) -- the authority hierarchy system (L1-L5)
- [Multi-Agent System](/glossary/multi-agent-system/) -- systems of cooperating autonomous agents
- [Orchestration](/glossary/orchestration/) -- coordination of multiple agents for complex tasks
- [Authority Level](/glossary/authority-level/) -- the permission framework governing agent actions
- [Agent Registry](/glossary/agent-registry/) -- the catalog of all registered platform agents
- [Archer Supreme](/glossary/archer-supreme/) -- the highest-authority operational agent
- [Color Teams](/glossary/color-teams/) -- specialized agent teams for security operations
- [Agent Module](/glossary/agent-module/) -- the Elixir module structure for agent implementation

## See Also

- [AIAD](/glossary/aiad/) for the agent definition standard
- [Agent Registry](/glossary/agent-registry/) for the complete agent catalog
- [Automated Decision Making](/glossary/automated-decision-making/) for decision systems within agents
- [Supervision Tree](/glossary/supervision-tree/) for OTP process management of agent processes
- [GenServer](/glossary/genserver/) for the OTP pattern used to implement agent processes

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
