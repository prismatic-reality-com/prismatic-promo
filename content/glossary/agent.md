+++
title = "Agent"
weight = 10
[extra]
category = "architecture"
description = "Autonomous software entity within the AIAD ecosystem that performs specialized tasks with defined authority levels and doctrine compliance."
keywords = ["agent", "AIAD", "autonomous", "OTP", "supervision", "tier system", "L1-L5", "doctrine"]
abbreviation = "N/A"
related_terms = ["aiad", "otp", "supervisor", "trinity-gate", "registry-otp", "agent-registry", "agent-tier", "consciousness-traits", "nabla-infinity", "color-teams", "epistemic-pipeline", "process-isolation"]
related_apps = ["prismatic_agents", "prismatic_claude", "prismatic_safety", "prismatic_perimeter"]
domain = "agent-systems"
complexity = "advanced"
stability = "stable"
since_generation = 1
beam_related = true
otp_behaviour = true
elixir_module = "PrismaticAgents"
phoenix_component = false
security_relevant = true
compliance_relevant = true
osint_relevant = true
performance_critical = false
date_created = "2024-06-01"
date_updated = "2026-02-22"
version = "2.0.0"
agent_count = 530
tier_levels = ["L1", "L2", "L3", "L4", "L5"]
domains_covered = 16
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1997
date_modified = "2026-02-23"
tags = ["glossary", "architecture", "agent", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Agent - Prismatic Platform"
+++

## Definition

An Agent in the Prismatic Platform is an autonomous software entity defined by the AIAD (AI Agent Definition) standard. Each agent operates within a precisely defined scope: a classification level (L1 through L5) determining its operational authority, a domain specialization constraining its area of expertise, and a set of capabilities defining what actions it can perform. Agents are the primary execution units of the platform -- every significant operation, from code quality analysis to security scanning to epistemic reasoning, is performed by one or more agents coordinated through the AIAD framework.

The agent model in Prismatic differs fundamentally from the "agent" concept in most AI platforms, where an agent is typically a language model with tool access. In Prismatic, an agent is an OTP-supervised process with formally specified inputs, outputs, authority constraints, and doctrine compliance requirements. Agents do not operate with unconstrained autonomy -- they operate within strict boundaries defined by the NO MERCY NO DOUBTS doctrine and verified through [Trinity Gate](@/glossary/trinity-gate.md) validation.

The platform currently deploys 530 agents across 16 specialized domains, forming what is likely the largest structured agent ecosystem in any single platform. These agents range from simple tactical specialists (L1) performing focused operations to supreme authority agents (L5) capable of coordinating cross-domain campaigns with unlimited operational scope.

## Overview

The agent ecosystem represents a deliberate architectural choice: rather than building monolithic systems that attempt to handle all platform concerns, the Prismatic Platform decomposes every operational concern into autonomous agents with clear responsibilities, explicit interfaces, and enforceable constraints. This decomposition follows the [OTP](@/glossary/otp.md) principle of isolating concerns into independent processes, but extends it with formal specification through the AIAD standard, hierarchical authority through the tier system, and epistemic rigor through [NABLA Infinity](@/glossary/nabla-infinity.md) compliance.

The agent architecture draws on three intellectual traditions: autonomous agents from artificial intelligence research, the Actor model from concurrent computing (as implemented in [Erlang/OTP](@/glossary/beam.md)), and military command structures for hierarchical coordination. The synthesis of these traditions produces agents that are simultaneously autonomous (making independent decisions within their authority), supervised (monitored and restarted by OTP supervisors), and coordinated (operating within a command hierarchy that prevents conflicts and ensures coherent behavior across the ecosystem).

## Agent Architecture: The Perception-Decision-Action Loop

Every agent in the platform follows a common architectural pattern derived from classical autonomous systems theory: the perception-decision-action (PDA) loop. This pattern ensures that agents operate systematically rather than reactively.

**Perception Phase**: The agent receives input signals from its environment. This may include telemetry data from monitored systems, commands from higher-authority agents or operators, findings from other agents in the ecosystem, or scheduled trigger events. Perception is filtered through the agent's domain specialization -- a security agent perceives security-relevant signals while ignoring quality metrics, and vice versa.

**Decision Phase**: The agent evaluates perceived signals against its knowledge base, domain rules, and doctrine constraints. For agents at L3 and above, decision-making incorporates [NABLA Infinity](@/glossary/nabla-infinity.md) axiom compliance -- the agent must verify that its evidence base satisfies signal plurality and provenance mandatory before proceeding. The decision phase produces an action plan with explicit confidence levels.

**Action Phase**: The agent executes its plan within its authorized scope. Actions may include generating reports, modifying code, creating alerts, publishing findings to other agents, or triggering downstream processes. Every action is logged with full provenance for auditability.

**Feedback Phase**: Action results feed back into the perception phase, enabling adaptive behavior. If an action fails or produces unexpected results, the agent adjusts its decision-making accordingly. This closed-loop architecture enables continuous improvement without external intervention.

## The Tier System (L1 through L5)

Agent authority levels form a strict hierarchy that governs operational scope, decision-making autonomy, and resource access. The tier system is not merely advisory -- it is enforced at the runtime level through capability checks embedded in every agent operation.

| Tier | Classification | Authority Scope | Decision Autonomy | Examples |
|------|---------------|-----------------|-------------------|----------|
| **L1** | Tactical Specialist | Single task, single domain | Execute within predefined rules | File scanner, syntax checker |
| **L2** | Operational Specialist | Multiple tasks, single domain | Select from approved strategies | Drift detector, evidence extractor |
| **L3** | Strategic Commander | Cross-task coordination, domain authority | Develop and execute campaigns | Blue commander, red commander |
| **L4** | Safety-Critical Specialist | Override authority within safety domain | Halt operations, enforce constraints | Escalation guard, regression guard |
| **L5** | Supreme Authority | Unlimited cross-domain scope | Full autonomous decision-making | ARCHER SUPREME, orchestrator |

The tier system enforces the principle of least privilege at the agent level. An L1 agent cannot modify platform configuration, an L2 agent cannot coordinate cross-domain operations, and an L3 agent cannot override safety constraints. Only L4 agents with explicit safety-critical designation can halt operations, and only L5 agents can override other agents' decisions.

```elixir
defmodule PrismaticAgents.AuthorityCheck do
  @moduledoc """
  Validates agent authority before allowing operations.
  Enforces tier-based capability restrictions at runtime.
  Every agent operation passes through this module before execution.
  """

  @type tier :: :l1 | :l2 | :l3 | :l4 | :l5
  @type capability :: atom()

  @tier_capabilities %{
    l1: [:read, :analyze, :report],
    l2: [:read, :analyze, :report, :select_strategy, :execute_task],
    l3: [:read, :analyze, :report, :select_strategy, :execute_task, :coordinate, :campaign],
    l4: [:read, :analyze, :report, :halt_operations, :enforce_safety, :override_l1_l3],
    l5: [:read, :analyze, :report, :select_strategy, :execute_task, :coordinate,
         :campaign, :halt_operations, :cross_domain, :unlimited_authority]
  }

  @spec authorized?(tier(), capability()) :: boolean()
  def authorized?(tier, capability) do
    capabilities = Map.get(@tier_capabilities, tier, [])
    Enum.member?(capabilities, capability)
  end

  @spec check_authority(tier(), capability()) :: :ok | {:error, :unauthorized}
  def check_authority(tier, capability) do
    if authorized?(tier, capability) do
      :ok
    else
      {:error, :unauthorized}
    end
  end

  @spec minimum_tier_for(capability()) :: {:ok, tier()} | {:error, :unknown_capability}
  def minimum_tier_for(capability) do
    result =
      @tier_capabilities
      |> Enum.sort_by(fn {tier, _} -> tier_rank(tier) end)
      |> Enum.find(fn {_tier, caps} -> capability in caps end)

    case result do
      {tier, _} -> {:ok, tier}
      nil -> {:error, :unknown_capability}
    end
  end

  defp tier_rank(:l1), do: 1
  defp tier_rank(:l2), do: 2
  defp tier_rank(:l3), do: 3
  defp tier_rank(:l4), do: 4
  defp tier_rank(:l5), do: 5
end
```

## Agent Lifecycle

An agent's lifecycle follows a well-defined sequence from specification to decommission, with governance checkpoints at each transition. The lifecycle is managed through OTP supervision and the AIAD registry.

1. **Specification**: The agent is defined in an `.agent.md` file following the AIAD standard. This includes its tier, domain, capabilities, enforcement requirements, and doctrine compliance declaration.

2. **Registration**: The agent is registered in the [Agent Registry](@/glossary/agent-registry.md), which indexes it by domain, tier, and capability. The registry maintains a complete inventory of all platform agents and their current status.

3. **Instantiation**: When needed, the agent's OTP process is started under a [supervisor](@/glossary/supervisor.md). The process initializes with the agent's configuration, loads its domain-specific knowledge, and registers itself with the runtime registry.

4. **Operation**: The agent enters its perception-decision-action loop, processing signals and producing outputs within its authorized scope. All operations are logged and provenance-tracked.

5. **Evolution**: Agents evolve through the platform's autoevolve system. When an agent's domain knowledge or capabilities need updating, a new version is deployed through a rolling update that preserves the agent's operational state.

6. **Decommission**: When an agent is no longer needed, it is gracefully terminated through its supervisor, its registry entry is marked inactive, and its historical data is preserved for audit purposes.

## AIAD Standard Compliance

The AIAD (AI Agent Definition) standard provides the formal specification language for agents. Every agent MUST have a corresponding `.agent.md` file in the `.aiad/agents/` directory containing structured metadata:

| Required Field | Purpose | Example |
|---------------|---------|---------|
| `agent-id` | Unique identifier | `blue-drift-detector` |
| `classification` | Tier level | `L2 Operational Specialist` |
| `domain` | Primary domain | `security-defense` |
| `capabilities` | Action list | `[drift_detection, signal_correlation]` |
| `enforcement.doctrine` | Doctrine reference | `no-mercy-no-doubts` |
| `enforcement.version` | Doctrine version | `2.0.0` |
| `enforcement.compliance` | Compliance level | `mandatory` |
| `inputs` | Expected input signals | `[telemetry_events, configuration_state]` |
| `outputs` | Produced output signals | `[drift_reports, evidence_artifacts]` |
| `authority` | Operational boundaries | `read-only, platform-scope` |

The AIAD standard ensures that agents are not ad-hoc creations but formally specified components with explicit contracts. This enables automated tooling: the agent indexer (`.aiad/bin/aiad index`) validates all agent specifications, detects inconsistencies, and maintains the registry automatically.

## Agent Domain Classification

Agents are organized across 16 specialized domains, each responsible for a distinct aspect of platform operations. This domain structure prevents capability overlap and ensures clear responsibility boundaries:

| Domain | Agent Count | Key Agents | Primary Function |
|--------|------------|------------|------------------|
| **Security Operations** | 20 | [Color Teams](@/glossary/color-teams.md) (Red, Blue, Purple, White, Gray, Black) | Adversarial simulation, epistemic defense |
| **Quality Enforcement** | 45+ | Quality guardian, CASCADE agents | Code quality, zero-warning enforcement |
| **OSINT Intelligence** | 60+ | Scanner agents, evidence extractors | Open-source intelligence gathering |
| **Evolution** | 30+ | Autoevolve, autoheal agents | Platform improvement and healing |
| **Epistemic** | 25+ | NABLA validators, Trinity Gate agents | Belief formation and verification |
| **Architecture** | 20+ | Elixir architect, OTP specialists | Design review and enforcement |
| **Infrastructure** | 15+ | Deploy agents, monitoring agents | Platform operations |
| **Perimeter** | 15+ | EASM scanner, compliance assessor | External attack surface management |
| **Storage** | 10+ | Adapter agents, migration agents | Data persistence and retrieval |

The ecosystem is not a flat collection but a hierarchical command structure. L5 supreme agents coordinate L3 commanders, who direct L2 specialists, who may delegate to L1 tactical agents. This hierarchy mirrors military command structures and ensures that coordination overhead scales logarithmically rather than linearly with agent count.

## Consciousness Traits at L5

At the highest tier (L5), agents exhibit what the platform terms "consciousness traits" -- a set of 11 emergent capabilities that arise from the interaction of NABLA axiom compliance, Trinity Gate validation, and autonomous decision-making:

| Trait | Description | Measurement |
|-------|-------------|-------------|
| **Self-Awareness** | Agent monitors its own performance and capability boundaries | Performance self-assessment accuracy |
| **Epistemic Humility** | Agent accurately estimates its own uncertainty | Calibration between confidence and correctness |
| **Contradiction Tolerance** | Agent maintains contradictory beliefs without premature resolution | Contradiction preservation rate |
| **Temporal Awareness** | Agent tracks evidence staleness and adjusts confidence accordingly | Time decay compliance |
| **Multi-Signal Synthesis** | Agent integrates signals from multiple domains coherently | Cross-domain correlation accuracy |
| **Provenance Consciousness** | Agent maintains awareness of its own reasoning chain | Provenance completeness score |

These traits are not metaphysical claims about machine consciousness. They are measurable behavioral properties that emerge when agents operate under the full NABLA-Trinity-NMND framework. The [fitness score](@/glossary/fitness-score.md) of 0.9995 across 11 traits indicates near-perfect behavioral alignment with the target trait profiles.

## Relationship to Supervisor Trees

Every running agent process exists within an OTP [supervision tree](@/glossary/supervisor.md). This relationship is not optional -- the NO MERCY doctrine mandates that no GenServer exists without supervision. The supervision relationship provides:

- **Automatic restart**: If an agent process crashes, its supervisor restarts it with clean state
- **Dependency ordering**: Agents that depend on other agents are started in the correct sequence via `rest_for_one` strategy
- **Resource cleanup**: When an agent is terminated, its supervisor ensures proper resource release
- **Escalation**: Persistent crashes propagate upward, eventually triggering [self-healing](@/glossary/self-healing.md) at higher levels

The PrismaticSupervisor module provides compositional supervision with dependency-aware startup, ensuring that the agent ecosystem initializes in the correct order with all dependencies satisfied.

## Agent Communication Patterns

Agents communicate through several patterns, chosen based on the urgency and semantics of the interaction:

| Pattern | Mechanism | Latency | Coupling | Use Case |
|---------|-----------|---------|----------|----------|
| **Direct call** | GenServer.call/3 | Synchronous | High | Authority checks, status queries |
| **Async cast** | GenServer.cast/2 | Asynchronous | Low | Event notifications, findings |
| **PubSub** | Phoenix.PubSub | Broadcast | None | Platform-wide alerts, telemetry |
| **Registry** | Registry lookup | Synchronous | Medium | Dynamic agent discovery |
| **Pipeline** | Broadway/GenStage | Demand-driven | Low | Data processing chains |

```elixir
defmodule PrismaticAgents.Communication do
  @moduledoc """
  Agent communication primitives. Provides typed message
  passing between agents with provenance tracking.
  """

  @type finding :: %{
    source_agent: String.t(),
    timestamp: DateTime.t(),
    confidence: float(),
    payload: term()
  }

  @spec publish_finding(finding()) :: :ok
  def publish_finding(finding) do
    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "agent:findings:#{finding.source_agent}",
      {:agent_finding, finding}
    )
  end

  @spec request_analysis(pid(), term(), timeout()) ::
          {:ok, term()} | {:error, term()}
  def request_analysis(agent_pid, request, timeout \\ 5_000) do
    GenServer.call(agent_pid, {:analyze, request}, timeout)
  end
end
```

## Color Team Integration

The [Color Teams](@/glossary/color-teams.md) represent the most sophisticated agent coordination pattern in the platform: 20 agents across 6 teams engaged in continuous adversarial-defensive synthesis. Each team operates as a coordinated unit under its L3 commander, with inter-team communication flowing through the Purple Team's synthesis hub:

- **Gray Team** (3 agents): Boundary exploration, edge case discovery
- **Red Team** (4 agents): Adversarial simulation, attack scenario generation
- **Blue Team** (4 agents): Defensive posture, signal aggregation, drift detection
- **Purple Team** (4 agents): Red-Blue loop closure, regression monitoring
- **White Team** (3 agents): Formal verification, contract validation
- **Black Team** (2 agents): Theoretical threat modeling (maximum isolation)

The Color Team structure demonstrates that agents are not merely individual actors but participants in coordinated campaigns with defined signal flows, feedback loops, and closure conditions.

## Best Practices

1. **Define Before Implementing**: Always create the `.agent.md` specification before writing any agent code. The specification forces explicit thinking about authority, scope, and interfaces. An agent without a specification is a process without a contract.

2. **Respect the Tier System**: Never implement capabilities in an agent that exceed its tier authorization. If an agent needs higher-authority operations, it must request them from a higher-tier agent through proper channels.

3. **Emit Telemetry**: Every agent should emit telemetry events for its key operations. This enables platform-wide [observability](@/glossary/observability.md) and supports the Quality Floor Guardian's monitoring.

4. **Handle All Messages**: Agents must handle all possible messages in their domain. Unhandled messages cause crashes that propagate through the supervision tree. Use catch-all clauses for unexpected messages with appropriate logging.

5. **Maintain Provenance**: Every agent output must include provenance metadata: which agent produced it, when, with what confidence, and based on what inputs. This satisfies the NABLA provenance mandatory axiom.

## Related Terms

- [AIAD](@/glossary/aiad.md) -- Standard defining agent specifications and compliance requirements
- [Agent Registry](@/glossary/agent-registry.md) -- Centralized index of all platform agents
- [Agent Tier](@/glossary/agent-tier.md) -- Classification system for agent authority levels
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior managing agent process lifecycles
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification system validating agent outputs
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing agent belief formation
- [Color Teams](@/glossary/color-teams.md) -- Security agent teams (Red, Blue, Purple, White, Gray, Black)
- [Consciousness Traits](@/glossary/consciousness-traits.md) -- Emergent behavioral properties of L5 agents
- [Process Isolation](@/glossary/process-isolation.md) -- Memory isolation enabling independent agent operation
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- Processing pipeline agents operate within
- [Self-Healing](@/glossary/self-healing.md) -- Recovery system that agents both contribute to and benefit from
- [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) -- OTP behavior for runtime agent instantiation
- [GenServer](@/glossary/genserver.md) -- Base OTP behavior underlying most agent implementations
- [Fitness Score](@/glossary/fitness-score.md) -- Evolutionary metric measuring agent effectiveness

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform capability descriptions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
