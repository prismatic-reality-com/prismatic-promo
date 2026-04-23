+++
title = "Decision Making Hierarchy"
weight = 50
[extra]
tags = ["glossary", "governance", "aiad", "authority", "agent-system", "escalation", "organizational", "doctrine"]
description = "Structured levels of authority determining which agents can make which decisions, with L1-L5 tiers defining clear escalation paths, approval requirements, and scope boundaries across the Prismatic Platform's 530+ agent ecosystem"
category = "governance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Agent Governance & Authority Framework"
related_concepts = ["authority-level", "authority-structure", "agent-tier", "aiad", "chain-of-command", "no-mercy-no-doubts", "trinity-gate"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 7
prerequisites = ["aiad", "agent", "agent-tier", "authority-level", "no-mercy-no-doubts"]
learning_path = ["agent", "agent-tier", "authority-level", "decision-making-hierarchy", "chain-of-command", "authority-structure", "archer-supreme"]
interactive_demos = ["/labs/glossary/decision-making-hierarchy"]
code_examples = ["Authority level validation GenServer", "Escalation protocol implementation", "Decision gate middleware"]
external_resources = ["https://hexdocs.pm/elixir/GenServer.html", "https://en.wikipedia.org/wiki/Decision-making", "https://www.scaledagileframework.com/lean-governance/"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["authority boundary enforcement", "cross-tier escalation validation", "decision audit completeness", "unauthorized action prevention"]
keywords = ["decision hierarchy", "authority levels", "agent governance", "escalation protocol", "L1-L5 tiers", "AIAD authority", "chain of command", "decision gates"]
related_terms = ["authority-level", "authority-structure", "chain-of-command", "agent-tier", "aiad", "archer-supreme", "no-mercy-no-doubts", "trinity-gate", "l5-supreme-authority", "color-teams"]
word_count = 1836
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Decision Making Hierarchy - Prismatic Platform"
+++

## Definition

A decision-making hierarchy is a structured framework of authority levels that determines which entities (human operators, software agents, or automated processes) are authorized to make which types of decisions, under what conditions, and with what oversight. It defines clear escalation paths for decisions that exceed an entity's authority, approval requirements for high-impact actions, and audit mechanisms to ensure accountability.

In the Prismatic Platform, the decision-making hierarchy is implemented through the [AIAD](@/glossary/aiad.md) (AI-Assisted Development) standard's five-tier authority model (L1 through L5). Each of the platform's 530+ agents operates at a specific tier, with defined capabilities, constraints, and escalation obligations. This hierarchy ensures that routine operations execute autonomously at lower tiers while consequential decisions receive appropriate scrutiny at higher tiers, all governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine.

## Overview

Decision-making hierarchies solve a fundamental problem in complex multi-agent systems: how to balance autonomy with accountability. Too much centralization creates bottlenecks; too much decentralization creates chaos. The hierarchy provides a structured middle ground where authority is distributed according to decision impact, reversibility, and domain expertise.

In traditional organizations, decision-making hierarchies map to organizational charts: individual contributors handle routine decisions, managers handle team-level decisions, directors handle departmental decisions, and executives handle strategic decisions. The Prismatic Platform applies the same principle to its AI agent ecosystem, where hundreds of specialized agents must coordinate their actions without stepping on each other's authority or making decisions beyond their competence.

The platform's hierarchy is distinctive in several ways. First, it is enforced programmatically, not just by policy. An L2 agent cannot execute an L4 action because the authorization system will reject it, not merely because a document says it should not. Second, the hierarchy integrates with the [Trinity Gate](@/glossary/trinity-gate.md) verification system, meaning that higher-tier decisions require not just authorization but epistemic validation. Third, escalation is automatic and audited: when an agent encounters a decision that exceeds its tier, it escalates to the appropriate authority without human intervention (except at L5, which requires human confirmation for destructive actions).

The hierarchy is not static. Agents can be granted temporary authority elevation for specific tasks through scoped tokens, and the [Archer Supreme](@/glossary/archer-supreme.md) can dynamically reconfigure authority boundaries in crisis situations. But the default state enforces strict tier boundaries.

## Technical Details

### The Five-Tier Authority Model

The Prismatic Platform defines five authority tiers, each with increasing scope and decreasing frequency of use:

**L1 -- Operational (Autonomous):** The most numerous tier, comprising approximately 60% of all agents. L1 agents execute predefined tasks within narrow parameters. They can read data, perform computations, emit telemetry events, and produce reports. They cannot modify system state, alter configurations, or communicate with external systems without supervision. Examples include data normalization agents, metric collectors, and formatting processors.

**L2 -- Tactical (Supervised):** Approximately 25% of agents operate at L2. They can modify data within their domain, initiate workflows, and communicate with external APIs within rate-limited boundaries. L2 agents require pre-approved action templates and must log all state-changing operations for audit review. Examples include OSINT adapter agents, storage coordinators, and quality check executors.

**L3 -- Strategic (Coordinating):** Approximately 10% of agents operate at L3. They can orchestrate multi-agent workflows, make cross-domain decisions, allocate resources, and escalate to L4/L5 when needed. L3 agents serve as team commanders within the [Color Teams](@/glossary/color-teams.md) framework and domain supervisors. They must justify decisions with evidence meeting [NABLA](@/glossary/nabla-infinity.md) axiom requirements.

**L4 -- Critical (Safety-Gated):** A small number of agents (~4%) operate at L4. They can modify system-wide configurations, approve or reject deployments, and override lower-tier decisions. L4 actions require Trinity Gate passage and are subject to the full [NO MERCY](@/glossary/no-mercy.md) enforcement protocol. Examples include the quality floor guardian, security gate enforcers, and escalation guards.

**L5 -- Supreme (Human-Confirmed):** The highest tier, reserved for the platform orchestrator (Archer Supreme) and requiring human confirmation for destructive or irreversible actions. L5 can override any lower-tier decision, reconfigure authority boundaries, and invoke emergency protocols. L5 actions are always audited and require full provenance documentation.

### Escalation Protocol

When an agent encounters a decision that exceeds its authority tier, the escalation protocol activates:

1. The agent identifies the decision category and required authority level
2. It packages the decision context (evidence, options, recommendation) into an escalation request
3. The request is routed to the nearest appropriate authority in the [chain of command](@/glossary/chain-of-command.md)
4. The receiving authority evaluates, decides, and returns the result
5. The original agent executes the decision under delegated authority
6. The entire exchange is logged in the audit trail

## Implementation in Prismatic Platform

### Authority Validator

The core authority validation module enforces tier boundaries at the function call level:

```elixir
defmodule Prismatic.Authority.Validator do
  @moduledoc """
  Validates agent authority levels against required decision tiers.

  Enforces the L1-L5 decision-making hierarchy by checking
  that the requesting agent has sufficient authority for the
  requested operation. Non-bypassable enforcement.
  """

  @type tier :: :l1 | :l2 | :l3 | :l4 | :l5
  @type agent_id :: String.t()
  @type operation :: atom()

  @type validation_result ::
          {:authorized, tier()}
          | {:escalation_required, tier(), tier()}
          | {:denied, String.t()}

  @tier_values %{l1: 1, l2: 2, l3: 3, l4: 4, l5: 5}

  @spec validate(agent_id(), operation(), keyword()) :: validation_result()
  def validate(agent_id, operation, opts \\ []) do
    agent_tier = get_agent_tier(agent_id)
    required_tier = get_required_tier(operation)

    cond do
      tier_value(agent_tier) >= tier_value(required_tier) ->
        emit_telemetry(:authorized, agent_id, operation, agent_tier)
        {:authorized, agent_tier}

      Keyword.get(opts, :allow_escalation, true) ->
        emit_telemetry(:escalation_required, agent_id, operation, agent_tier)
        {:escalation_required, agent_tier, required_tier}

      true ->
        emit_telemetry(:denied, agent_id, operation, agent_tier)
        {:denied, "Agent #{agent_id} at #{agent_tier} lacks authority for #{operation} (requires #{required_tier})"}
    end
  end

  @spec authorize!(agent_id(), operation()) :: :ok | no_return()
  def authorize!(agent_id, operation) do
    case validate(agent_id, operation, allow_escalation: false) do
      {:authorized, _tier} ->
        :ok

      {:denied, reason} ->
        raise Prismatic.Authority.UnauthorizedError,
          agent_id: agent_id,
          operation: operation,
          message: reason
    end
  end

  @spec get_agent_tier(agent_id()) :: tier()
  defp get_agent_tier(agent_id) do
    case :ets.lookup(:agent_registry, agent_id) do
      [{^agent_id, %{tier: tier}}] -> tier
      [] -> :l1
    end
  end

  @spec get_required_tier(operation()) :: tier()
  defp get_required_tier(operation) do
    case :ets.lookup(:operation_tiers, operation) do
      [{^operation, tier}] -> tier
      [] -> :l2
    end
  end

  @spec tier_value(tier()) :: 1..5
  defp tier_value(tier), do: Map.fetch!(@tier_values, tier)

  defp emit_telemetry(result, agent_id, operation, tier) do
    :telemetry.execute(
      [:prismatic, :authority, :validation, result],
      %{count: 1},
      %{agent_id: agent_id, operation: operation, tier: tier}
    )
  end
end
```

### Escalation Protocol Implementation

The escalation system routes decisions to appropriate authority levels:

```elixir
defmodule Prismatic.Authority.Escalation do
  @moduledoc """
  Implements the escalation protocol for the decision-making hierarchy.

  When an agent encounters a decision exceeding its authority tier,
  this module routes the escalation request through the chain of
  command to the nearest appropriate authority.
  """

  alias Prismatic.Authority.{Validator, AuditLog}

  @type escalation_request :: %{
    requesting_agent: String.t(),
    operation: atom(),
    context: map(),
    evidence: [map()],
    recommendation: term(),
    requested_at: DateTime.t()
  }

  @type escalation_result ::
          {:approved, term(), String.t()}
          | {:denied, String.t(), String.t()}
          | {:deferred, String.t()}

  @spec escalate(escalation_request()) :: escalation_result()
  def escalate(%{requesting_agent: agent_id, operation: operation} = request) do
    case Validator.validate(agent_id, operation) do
      {:authorized, _tier} ->
        {:approved, request.recommendation, agent_id}

      {:escalation_required, current_tier, required_tier} ->
        authority = find_nearest_authority(current_tier, required_tier, operation)
        result = submit_to_authority(authority, request)

        AuditLog.record_escalation(%{
          from: agent_id,
          to: authority,
          operation: operation,
          from_tier: current_tier,
          to_tier: required_tier,
          result: result,
          timestamp: DateTime.utc_now()
        })

        result

      {:denied, reason} ->
        AuditLog.record_denial(%{
          agent: agent_id,
          operation: operation,
          reason: reason,
          timestamp: DateTime.utc_now()
        })

        {:denied, reason, agent_id}
    end
  end

  @spec find_nearest_authority(Validator.tier(), Validator.tier(), atom()) :: String.t()
  defp find_nearest_authority(_current_tier, required_tier, operation) do
    domain = classify_operation_domain(operation)

    case :ets.match(:agent_registry, {:"$1", %{tier: required_tier, domain: domain}}) do
      [[authority_id] | _] -> authority_id
      [] -> find_fallback_authority(required_tier)
    end
  end

  @spec submit_to_authority(String.t(), escalation_request()) :: escalation_result()
  defp submit_to_authority(authority_id, request) do
    case GenServer.call(
           {:via, Registry, {Prismatic.AgentRegistry, authority_id}},
           {:evaluate_escalation, request},
           :timer.seconds(30)
         ) do
      {:approve, decision} -> {:approved, decision, authority_id}
      {:deny, reason} -> {:denied, reason, authority_id}
      {:defer, reason} -> {:deferred, reason}
    end
  end

  defp classify_operation_domain(operation) do
    cond do
      operation in [:deploy, :rollback, :config_change] -> :infrastructure
      operation in [:scan, :assess, :rate] -> :security
      operation in [:create_agent, :modify_tier, :revoke] -> :governance
      operation in [:write_data, :delete_data, :migrate] -> :data
      true -> :general
    end
  end

  defp find_fallback_authority(required_tier) do
    case required_tier do
      :l5 -> "archer-supreme"
      :l4 -> "supreme-coordinator"
      _ -> "domain-supervisor"
    end
  end
end
```

### Decision Gate Middleware

Every significant action passes through a decision gate that checks authority, evidence, and compliance:

```elixir
defmodule Prismatic.Authority.DecisionGate do
  @moduledoc """
  Decision gate middleware that enforces the complete
  decision-making hierarchy for all gated operations.

  Checks: authority tier, evidence quality (NABLA), and
  Trinity Gate passage for L3+ decisions.
  """

  alias Prismatic.Authority.{Validator, Escalation}
  alias Prismatic.Nabla.TrinityGate

  @type decision_context :: %{
    agent_id: String.t(),
    operation: atom(),
    evidence: [map()],
    confidence: float()
  }

  @type gate_result :: {:pass, map()} | {:block, String.t()} | {:escalate, map()}

  @spec evaluate(decision_context()) :: gate_result()
  def evaluate(%{agent_id: agent_id, operation: operation} = context) do
    with {:ok, tier} <- check_authority(agent_id, operation),
         :ok <- check_evidence(context, tier),
         :ok <- check_trinity_gate(context, tier) do
      {:pass, %{authorized_tier: tier, operation: operation, agent: agent_id}}
    end
  end

  @spec check_authority(String.t(), atom()) :: {:ok, Validator.tier()} | {:escalate, map()}
  defp check_authority(agent_id, operation) do
    case Validator.validate(agent_id, operation) do
      {:authorized, tier} -> {:ok, tier}
      {:escalation_required, from, to} -> {:escalate, %{from_tier: from, required_tier: to}}
      {:denied, reason} -> {:block, reason}
    end
  end

  @spec check_evidence(decision_context(), Validator.tier()) :: :ok | {:block, String.t()}
  defp check_evidence(%{evidence: evidence, confidence: confidence}, tier) do
    min_confidence = case tier do
      :l1 -> 0.50
      :l2 -> 0.60
      :l3 -> 0.80
      :l4 -> 0.95
      :l5 -> 0.99
    end

    if confidence >= min_confidence and length(evidence) > 0 do
      :ok
    else
      {:block, "Insufficient evidence: confidence #{confidence} < required #{min_confidence}"}
    end
  end

  @spec check_trinity_gate(decision_context(), Validator.tier()) :: :ok | {:block, String.t()}
  defp check_trinity_gate(context, tier) when tier in [:l3, :l4, :l5] do
    case TrinityGate.evaluate(context.evidence) do
      {:pass, _details} -> :ok
      {:fail, reason} -> {:block, "Trinity Gate failed: #{reason}"}
    end
  end

  defp check_trinity_gate(_context, _tier), do: :ok
end
```

## Comparison with Alternatives

### Flat Authority vs. Hierarchical Authority

In flat authority models, all agents have equal decision-making power and coordinate through consensus. This works for small systems but does not scale: with 530+ agents, consensus becomes impossible, and conflicting decisions create deadlocks. The hierarchical model ensures clear authority boundaries and fast resolution of conflicts through escalation to higher tiers.

### Role-Based Access Control (RBAC) vs. Tier-Based Authority

Traditional RBAC assigns permissions to roles, and users assume roles. The Prismatic Platform's tier-based authority extends RBAC by adding decision-impact assessment and automatic escalation. An L2 agent does not just lack permission for an L4 action; it actively escalates the decision to an L4 authority with full context, evidence, and a recommendation. RBAC denies; the hierarchy redirects.

### Consensus-Based (Raft/Paxos) vs. Hierarchical Decisions

Distributed consensus algorithms (Raft, Paxos) ensure agreement among peers. They are appropriate for data consistency decisions but inappropriate for operational decisions where speed matters. The Prismatic Platform uses consensus for data replication and hierarchy for operational decisions: different tools for different problems.

### Centralized (Single Orchestrator) vs. Distributed Hierarchy

A single orchestrator avoids coordination complexity but creates a bottleneck and single point of failure. The Prismatic Platform's multi-tier hierarchy distributes authority so that 85% of decisions (L1-L2) execute without any coordination overhead, while only 15% require cross-tier communication. The [Archer Supreme](@/glossary/archer-supreme.md) serves as the ultimate authority but is invoked only for L5 decisions.

## Best Practices

**Define operation tiers explicitly.** Every operation in the system must have a documented authority tier requirement. Do not leave tier assignment to guesswork; encode it in the operation registry. When in doubt, assign a higher tier and relax later based on operational experience.

**Audit all escalations.** Every escalation event must be recorded with full context: who escalated, why, to whom, what decision was made, and what evidence supported it. This audit trail is essential for identifying authority misconfigurations and optimizing tier assignments.

**Minimize L4-L5 decisions.** The hierarchy should be pyramid-shaped: the vast majority of decisions at L1-L2, a moderate number at L3, and very few at L4-L5. If L4-L5 decisions are frequent, it indicates that either the tier assignments are too conservative or the agents at lower tiers lack sufficient capability.

**Test escalation paths.** Regularly exercise escalation paths to ensure they function correctly under load. A broken escalation path means L2 agents are stuck when they encounter L3+ decisions, potentially blocking critical operations.

**Implement temporary elevation carefully.** When an agent needs temporary authority elevation for a specific task, use scoped tokens with expiration times and operation restrictions. Never grant blanket tier elevation. Log all elevations and review them periodically.

**Separate authority from capability.** An agent may be technically capable of performing an action but not authorized to do so. Authority is a governance constraint, not a technical one. Enforce authority checks even when the agent has the technical means to bypass them.

## Common Pitfalls

**Authority creep.** Over time, agents accumulate authority beyond their intended tier as developers grant exceptions for convenience. Regular authority audits are necessary to detect and correct tier inflation. The platform runs weekly authority compliance checks.

**Escalation storms.** When a systemic issue causes many L2 agents to escalate simultaneously, L3+ authorities can be overwhelmed. Implement rate limiting on escalation requests and circuit breakers that batch similar escalations into single decisions.

**Missing escalation handlers.** If the authority agent for a required tier is unavailable (process crashed, not started), escalation requests hang or fail silently. Ensure escalation targets are supervised processes with restart policies, and implement timeout-based fallback to higher tiers.

**Over-centralization at L5.** Routing too many decisions to L5 defeats the purpose of the hierarchy. If the Archer Supreme is making L3-level decisions, the hierarchy is misconfigured. Push authority down to the lowest appropriate tier.

**Ignoring the evidence requirement.** Authority alone is not sufficient for decisions at L3+. The [NABLA](@/glossary/nabla-infinity.md) evidence requirements and [Trinity Gate](@/glossary/trinity-gate.md) passage exist to prevent authorized but poorly-informed decisions. Never bypass evidence requirements for expediency.

## Use Cases

### OSINT Adapter Deployment

An L2 OSINT adapter agent can scan and collect intelligence from approved sources. When it discovers a new source that requires configuration changes, it escalates to L3 (domain supervisor) for approval. If the source requires modifying security boundaries, L3 escalates to L4 (security gate). The decision flows up the hierarchy until it reaches an authority with sufficient scope.

### Color Team Security Operations

Within the [Color Teams](@/glossary/color-teams.md) framework, each team has a commander at L3 who coordinates specialists at L2. The [Blue Team](@/glossary/blue-team.md) commander can order defensive posture changes (L3), but decommissioning a service requires L4 approval from the security gate. Red Team simulations operate under strict L2 authority with automatic L4 escalation for any operation that could affect production systems.

### Emergency Response

During a security incident, the [Archer Supreme](@/glossary/archer-supreme.md) at L5 can override the normal hierarchy to execute emergency protocols: isolating systems, revoking access, and deploying patches. These L5 actions require human confirmation (the platform operator) and generate comprehensive audit records for post-incident review.

### Quality Gate Enforcement

The Quality Floor Guardian operates at L4, with authority to block commits, reject merges, and trigger automatic remediation. When it detects a quality violation, it does not escalate -- it acts directly within its L4 authority. Only a countermand from L5 can override a quality gate block.

## Related Concepts

- [Authority Level](@/glossary/authority-level.md) -- The specific L1-L5 classification assigned to each agent and operation
- [Authority Structure](@/glossary/authority-structure.md) -- The organizational framework within which the hierarchy operates
- [Chain of Command](@/glossary/chain-of-command.md) -- The directed escalation paths connecting agents across tiers
- [Agent Tier](@/glossary/agent-tier.md) -- The capability classification system aligned with authority levels
- [AIAD](@/glossary/aiad.md) -- The AI-Assisted Development standard that defines the authority model
- [Archer Supreme](@/glossary/archer-supreme.md) -- The L5 Supreme authority orchestrator for the entire platform
- [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) -- The doctrine enforced across all tiers of the hierarchy
- [Trinity Gate](@/glossary/trinity-gate.md) -- The verification system required for L3+ decision validation
- [L5 Supreme Authority](@/glossary/l5-supreme-authority.md) -- The highest authority tier requiring human confirmation
- [Color Teams](@/glossary/color-teams.md) -- The security team structure that maps to the decision-making hierarchy

## See Also

- [Agent Registry](@/glossary/agent-registry.md) -- Where agent tier assignments are stored and queried
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- The evidence quality requirements at each tier
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework that governs evidence requirements for decisions
- [Decisive Action](@/glossary/decisive-action.md) -- The NO DOUBTS principle of executing once the hierarchy has approved
- [Audit Trail](@/glossary/audit-trail.md) -- The logging system that records all escalation and decision events

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
