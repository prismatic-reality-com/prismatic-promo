+++
title = "Authority Structure"
weight = 50
[extra]
tags = ["glossary", "authority-structure", "aiad", "governance", "hierarchy", "chain-of-command", "escalation", "agent-management", "decision-authority", "override-protocol", "organizational-design", "command-hierarchy"]
description = "Organizational hierarchy governing decision-making authority, override capabilities, escalation paths, and accountability chains within the AIAD agent ecosystem of the Prismatic Platform"
category = "aiad"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "agent-governance"
related_concepts = ["authority-level", "chain-of-command", "agent-tier", "decision-making-hierarchy", "aiad", "supervision-tree", "rbac", "no-mercy"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["aiad", "authority-level", "agent-tier", "supervision-tree"]
learning_path = ["aiad", "agent-tier", "authority-level", "authority-structure", "chain-of-command", "decision-making-hierarchy"]
interactive_demos = ["/labs/glossary/authority-structure"]
code_examples = ["AIAD.AuthorityStructure", "DomainAuthority", "EscalationPath", "OverrideProtocol"]
external_resources = ["https://en.wikipedia.org/wiki/Organizational_structure", "https://www.erlang.org/doc/design_principles/sup_princ"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["escalation_follows_chain", "override_requires_authority", "domain_isolation_enforced", "cross_domain_requires_approval", "emergency_bypass_audit", "deadlock_prevention"]
keywords = ["authority structure", "organizational hierarchy", "decision-making", "override", "escalation", "agent governance", "command structure", "domain authority", "accountability", "delegation"]
related_terms = ["authority-level", "chain-of-command", "agent-tier", "decision-making-hierarchy", "aiad", "supervision-tree", "l3-strategic-commanders", "l5-supreme-authority", "no-mercy", "policy"]
word_count = 1343
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Authority Structure - Prismatic Platform"
+++

## Definition

An authority structure is the organizational hierarchy that governs decision-making authority, override capabilities, escalation paths, and accountability chains within an agent ecosystem. In the Prismatic Platform, the authority structure defines how 530+ [AIAD](@/glossary/aiad.md) agents interact across five [authority levels](@/glossary/authority-level.md), six color teams, and sixteen functional domains. It answers questions that no individual agent can answer alone: Who decides when agents disagree? Who can override whom? Where does a blocked operation escalate to? Who is accountable when something fails?

The authority structure is not merely an organizational chart -- it is an executable governance model implemented through OTP [supervision trees](@/glossary/supervision-tree.md), runtime authority checks, and telemetry-driven accountability. Every override, escalation, and delegation is enforced programmatically and logged immutably.

## Overview

The Prismatic Platform's authority structure evolved out of necessity. With 530+ agents operating across 115 umbrella applications, informal coordination fails catastrophically. Agents cannot "figure it out" among themselves when conflicts arise -- they need deterministic rules for who decides, who yields, and who reviews.

The structure draws from three design traditions:

1. **Military command hierarchies**: Clear [chain of command](@/glossary/chain-of-command.md) with defined override authority, escalation paths, and accountability at every level
2. **OTP supervision trees**: Erlang/OTP's proven model of hierarchical process supervision, where supervisors manage worker processes and restart strategies propagate up the tree
3. **Organizational theory**: Span of control, domain decomposition, and the principle that authority must be commensurate with responsibility

The result is a hybrid structure that combines the determinism of military command with the fault tolerance of OTP supervision and the flexibility of domain-based organization.

### Structural Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Single Authority** | Every decision has exactly one authoritative agent | Compile-time domain registration |
| **Clear Escalation** | Every blocked operation has a defined escalation path | Runtime escalation routing |
| **Proportional Override** | Override authority requires strictly higher [authority level](@/glossary/authority-level.md) | Runtime authority checks |
| **Domain Isolation** | Agents cannot exercise authority outside their domain without escalation | Domain boundary enforcement |
| **Accountability Tracing** | Every authority exercise is logged with agent ID, rationale, and outcome | Immutable audit trail |
| **Deadlock Prevention** | No circular authority dependencies; the structure is a DAG | Static analysis at registration |

## Technical Details

### Authority Structure Topology

The platform's authority structure forms a directed acyclic graph (DAG) with the following layers:

```
                    ┌─────────────────────┐
                    │   L5 SUPREME        │
                    │   Archer Supreme    │
                    │   Supreme Coord.    │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐ ┌─────▼──────┐ ┌──────▼────────┐
    │ L4 SAFETY      │ │ L4 SAFETY  │ │ L4 SAFETY     │
    │ Quality Guard  │ │ Escalation │ │ Abstraction   │
    │                │ │ Guards     │ │ Enforcer      │
    └─────────┬──────┘ └─────┬──────┘ └──────┬────────┘
              │              │               │
    ┌─────────┼──────────────┼───────────────┼──────────┐
    │         │              │               │          │
┌───▼───┐ ┌──▼───┐ ┌───────▼┐ ┌───────┐ ┌──▼────┐ ┌──▼───┐
│L3 RED │ │L3 BLU│ │L3 PURPL│ │L3 GRAY│ │L3 WHT │ │L3 BLK│
│Cmdr   │ │Cmdr  │ │Coord   │ │Cmdr   │ │Cmdr   │ │Cmdr  │
└───┬───┘ └──┬───┘ └───┬────┘ └───┬───┘ └──┬────┘ └──┬───┘
    │        │         │          │         │         │
┌───▼───┐ ┌──▼───┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐
│L2/L1  │ │L2/L1 │ │L2/L1  │ │L2/L1  │ │L2/L1  │ │L2/L1  │
│Agents │ │Agents│ │Agents │ │Agents │ │Agents │ │Agents │
└───────┘ └──────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

### Domain Authority Model

The authority structure is organized into domains, each with a designated authority:

| Domain | Authority Agent | Level | Scope | Agent Count |
|--------|----------------|-------|-------|-------------|
| **Security** | `security-commander` | L3 | All security operations | ~45 |
| **Quality** | `quality-floor-guardian` | L4 | Quality gates, debt elimination | ~30 |
| **Architecture** | `architecture-commander` | L3 | Architectural decisions | ~25 |
| **Red Team** | `red-commander` | L3 | Adversarial simulation | 4 |
| **Blue Team** | `blue-commander` | L3 | Epistemic defense | 4 |
| **Purple Team** | `purple-coordinator` | L3 | Red-Blue synthesis | 4 |
| **Gray Team** | `gray-explorer-commander` | L3 | Boundary exploration | 3 |
| **White Team** | `white-verifier-commander` | L3 | Constructive verification | 3 |
| **Black Team** | `black-theorist-commander` | L3 | Threat modeling (isolated) | 2 |
| **Evolution** | `autoevolve-coordinator` | L3 | Platform evolution | ~20 |
| **OSINT** | `osint-commander` | L3 | Intelligence gathering | ~40 |
| **Storage** | `storage-coordinator` | L3 | Data persistence | ~15 |
| **Deployment** | `deployment-commander` | L3 | CI/CD and releases | ~10 |
| **Perimeter** | `perimeter-commander` | L3 | EASM operations | ~15 |
| **Documentation** | `docs-commander` | L3 | Documentation quality | ~10 |
| **Platform** | `supreme-coordinator` | L5 | Cross-domain coordination | ~5 |

### Authority Structure Implementation

```elixir
defmodule Prismatic.AIAD.AuthorityStructure do
  @moduledoc """
  Defines and enforces the organizational hierarchy governing
  decision-making authority, override capabilities, and escalation
  paths across the AIAD agent ecosystem.

  The authority structure is a directed acyclic graph (DAG) where:
  - Nodes are agents or domain authorities
  - Edges represent authority relationships (reports-to, overrides)
  - Cycles are forbidden (enforced at registration time)
  """

  alias Prismatic.AIAD.AuthorityLevel
  alias Prismatic.AIAD.AgentRegistry

  @type domain :: atom()
  @type authority_node :: %{
          agent_id: String.t(),
          domain: domain(),
          level: AuthorityLevel.t(),
          reports_to: String.t() | nil,
          subordinates: [String.t()],
          override_scope: [domain()]
        }

  @type structure :: %{
          domains: %{domain() => authority_node()},
          escalation_paths: %{domain() => [String.t()]},
          override_matrix: %{{domain(), domain()} => boolean()}
        }

  @spec build_structure() :: {:ok, structure()} | {:error, atom()}
  def build_structure do
    with {:ok, agents} <- AgentRegistry.all(),
         {:ok, domains} <- build_domain_map(agents),
         {:ok, escalation} <- build_escalation_paths(domains),
         :ok <- validate_no_cycles(domains, escalation) do
      {:ok, %{
        domains: domains,
        escalation_paths: escalation,
        override_matrix: build_override_matrix(domains)
      }}
    end
  end

  @spec resolve_authority(domain(), atom()) ::
          {:ok, authority_node()} | {:error, :no_authority}
  def resolve_authority(domain, capability) do
    with {:ok, structure} <- get_cached_structure(),
         {:ok, domain_authority} <- Map.fetch(structure.domains, domain),
         min_level = AuthorityLevel.minimum_for_capability(capability),
         true <- AuthorityLevel.compare(domain_authority.level, min_level) in [:eq, :gt] do
      {:ok, domain_authority}
    else
      _ -> {:error, :no_authority}
    end
  end

  @spec escalation_path(domain()) :: {:ok, [String.t()]} | {:error, :no_path}
  def escalation_path(domain) do
    with {:ok, structure} <- get_cached_structure(),
         {:ok, path} <- Map.fetch(structure.escalation_paths, domain) do
      {:ok, path}
    else
      _ -> {:error, :no_path}
    end
  end

  @spec validate_no_cycles(map(), map()) :: :ok | {:error, :cyclic_authority}
  defp validate_no_cycles(domains, escalation_paths) do
    graph = build_directed_graph(domains, escalation_paths)

    if Graph.acyclic?(graph) do
      :ok
    else
      {:error, :cyclic_authority}
    end
  end
end
```

### Override Protocol

```elixir
defmodule Prismatic.AIAD.OverrideProtocol do
  @moduledoc """
  Governs how higher-authority agents override decisions made by
  lower-authority agents. Overrides are the most consequential
  authority action and require full audit documentation.

  Override rules:
  1. Requester must have strictly higher authority level than target
  2. Requester must have authority in the target's domain (or be L4+)
  3. Override rationale must be provided and logged
  4. Target agent is notified of the override
  5. The override is time-bounded and scope-limited
  """

  alias Prismatic.AIAD.{AuthorityLevel, AuthorityStructure, AgentRegistry}

  @type override_request :: %{
          requester_id: String.t(),
          target_id: String.t(),
          target_decision: term(),
          replacement_decision: term(),
          rationale: String.t(),
          scope: [atom()],
          ttl_seconds: pos_integer()
        }

  @type override_result :: %{
          status: :executed | :denied,
          override_id: String.t(),
          timestamp: DateTime.t(),
          audit_ref: String.t()
        }

  @spec execute_override(override_request()) ::
          {:ok, override_result()} | {:error, atom(), String.t()}
  def execute_override(request) do
    with {:ok, requester} <- AgentRegistry.get(request.requester_id),
         {:ok, target} <- AgentRegistry.get(request.target_id),
         :ok <- validate_authority_gap(requester, target),
         :ok <- validate_domain_scope(requester, target),
         :ok <- validate_rationale(request.rationale) do
      override_id = generate_override_id()

      audit_entry = %{
        override_id: override_id,
        requester: request.requester_id,
        requester_level: requester.authority_level,
        target: request.target_id,
        target_level: target.authority_level,
        original_decision: request.target_decision,
        replacement: request.replacement_decision,
        rationale: request.rationale,
        timestamp: DateTime.utc_now()
      }

      log_to_audit_trail(audit_entry)
      notify_target(target, override_id, request)

      {:ok, %{
        status: :executed,
        override_id: override_id,
        timestamp: audit_entry.timestamp,
        audit_ref: "audit://overrides/#{override_id}"
      }}
    end
  end

  @spec validate_authority_gap(map(), map()) :: :ok | {:error, :insufficient_authority, String.t()}
  defp validate_authority_gap(requester, target) do
    if AuthorityLevel.can_override?(requester.authority_level, target.authority_level) do
      :ok
    else
      {:error, :insufficient_authority,
       "#{requester.authority_level} cannot override #{target.authority_level}"}
    end
  end

  @spec validate_domain_scope(map(), map()) :: :ok | {:error, :out_of_scope, String.t()}
  defp validate_domain_scope(requester, target) do
    cond do
      AuthorityLevel.numeric_value(requester.authority_level) >= 4 ->
        :ok

      requester.domain == target.domain ->
        :ok

      target.domain in (requester.override_scope || []) ->
        :ok

      true ->
        {:error, :out_of_scope,
         "#{requester.agent_id} has no authority in #{target.domain} domain"}
    end
  end
end
```

### Escalation Path Resolution

```elixir
defmodule Prismatic.AIAD.EscalationPath do
  @moduledoc """
  Resolves escalation paths when an agent encounters a situation
  beyond its authority. Escalation always moves upward through
  the authority structure, never laterally.
  """

  alias Prismatic.AIAD.{AuthorityStructure, AgentRegistry}

  @type escalation_step :: %{
          agent_id: String.t(),
          level: atom(),
          domain: atom(),
          can_resolve: boolean()
        }

  @spec resolve_path(String.t(), atom()) ::
          {:ok, [escalation_step()]} | {:error, :no_path}
  def resolve_path(agent_id, capability) do
    with {:ok, agent} <- AgentRegistry.get(agent_id),
         {:ok, domain_path} <- AuthorityStructure.escalation_path(agent.domain) do
      path =
        domain_path
        |> Enum.map(fn step_agent_id ->
          {:ok, step_agent} = AgentRegistry.get(step_agent_id)
          min_level = AuthorityLevel.minimum_for_capability(capability)

          %{
            agent_id: step_agent_id,
            level: step_agent.authority_level,
            domain: step_agent.domain,
            can_resolve: AuthorityLevel.compare(step_agent.authority_level, min_level) in [:eq, :gt]
          }
        end)
        |> Enum.filter(& &1.can_resolve)

      case path do
        [] -> {:error, :no_path}
        steps -> {:ok, steps}
      end
    end
  end
end
```

## Implementation in Prismatic Platform

The authority structure is implemented at three levels:

### Static Structure (Compile-Time)

Agent manifest files declare reporting relationships and domain assignments. The AIAD indexer builds the complete authority structure DAG at compile time, validating that no cycles exist and all escalation paths terminate at L4 or L5.

### Dynamic Structure (Runtime)

The `AuthorityStructure` GenServer maintains the current structure in ETS, updated when agents register, deregister, or change authority levels. Runtime checks consult this cached structure for sub-millisecond authority resolution.

### Supervision Alignment

The authority structure is deliberately aligned with the OTP [supervision tree](@/glossary/supervision-tree.md). Domain authority agents are supervisors of their subordinate agents. When an L3 commander restarts, its L1-L2 subordinates are managed according to the supervision strategy. This alignment means authority relationships are not just logical -- they are physically encoded in the process hierarchy.

## Comparison with Alternatives

| Structure Model | Flexibility | Determinism | Fault Tolerance | Complexity | Prismatic Fit |
|----------------|-------------|-------------|-----------------|------------|---------------|
| **AIAD Hierarchy (current)** | Moderate | High | High (OTP-aligned) | Moderate | Production |
| **Flat/Anarchic** | Maximum | None | None | Low | Fails at 530 agents |
| **Pure Hierarchy** | Low | High | Low (single point of failure) | Low | Too rigid |
| **Matrix Organization** | High | Low (dual authority) | Medium | High | Ambiguous authority |
| **Holacracy/Circles** | High | Medium | Medium | Very High | Over-engineered |
| **Market-Based** | Maximum | Low (auction dynamics) | Medium | High | Non-deterministic |

The AIAD hierarchy represents a pragmatic middle ground: strict enough for deterministic authority resolution, flexible enough for domain-based organization, and aligned with OTP for fault tolerance.

## Best Practices

1. **Align authority with supervision**: Domain authority agents should be OTP supervisors of their subordinates. This ensures that authority relationships survive process restarts and are enforced by the runtime.

2. **Limit span of control**: No agent should directly supervise more than 15 subordinates. Wider spans lead to coordination overhead and delayed escalation responses.

3. **Define escalation paths before building agents**: The authority structure should be designed before agents are implemented. Discovering that there is no escalation path for a critical operation during an incident is a governance failure.

4. **Test authority boundaries explicitly**: Write tests that verify agents cannot override outside their domain, that escalation paths resolve correctly, and that cycles cannot be introduced.

5. **Review override frequency**: High override rates indicate either poorly calibrated authority levels or flawed agent logic. Both require investigation.

6. **Document rationale for structural decisions**: Why is the Quality Floor Guardian at L4 instead of L3? Because it must be able to block commits from any L3 domain commander. Document these design rationales.

## Common Pitfalls

1. **Authority without accountability**: Granting override authority without requiring rationale documentation leads to unchecked power. Every override must have a logged justification.

2. **Circular authority dependencies**: Agent A reports to B, B reports to C, C reports to A. This creates deadlocks in escalation. The structure validator catches these at registration time.

3. **Shadow authority**: Agents that influence decisions without formal authority in the structure. If an agent is de facto making decisions, formalize its authority.

4. **Escalation black holes**: Domains where escalation paths do not terminate at a capable authority. Every escalation path must eventually reach an L4 or L5 agent.

5. **Over-centralization at L5**: Routing too many decisions to L5 Supreme creates a bottleneck. Most operational decisions should be resolved at L2-L3.

## Use Cases

### Cross-Domain Conflict Resolution

When the security commander (L3) blocks a deployment that the deployment commander (L3) has approved, neither can override the other (same level). The conflict escalates to an L4 Safety-Critical agent, which evaluates both positions and makes a binding decision. The override is logged with full rationale.

### Emergency Response Coordination

During a security incident, the authority structure enables rapid coordination. The L5 Supreme Coordinator can override all domain commanders, redirect agent resources, and impose platform-wide policies. This emergency authority is time-bounded and fully audited.

### Color Team Signal Flow

The authority structure defines how signals flow between color teams: Gray seeds flow to Red for adversarial analysis, Red findings flow to Purple for synthesis, Purple conclusions flow to Blue for defense. This signal flow follows the authority structure's domain boundaries, ensuring each team processes signals within its authority scope.

### Agent Lifecycle Management

When a new agent is registered, the authority structure determines its placement: domain assignment, reporting relationship, and initial authority level. When an agent is decommissioned, the structure reroutes its subordinates to the next-higher authority and adjusts escalation paths.

## Related Concepts

- [Authority Level](@/glossary/authority-level.md) -- the L1-L5 classification that determines agent capabilities
- [Chain of Command](@/glossary/chain-of-command.md) -- the reporting and escalation paths within the structure
- [Agent Tier](@/glossary/agent-tier.md) -- functional classification complementing the authority hierarchy
- [Decision-Making Hierarchy](@/glossary/decision-making-hierarchy.md) -- how decisions flow through the structure
- [AIAD](@/glossary/aiad.md) -- the agent framework implementing the authority structure
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP pattern aligned with authority relationships
- [L3 Strategic Commanders](@/glossary/l3-strategic-commanders.md) -- domain authority agents within the structure
- [L5 Supreme Authority](@/glossary/l5-supreme-authority.md) -- the apex of the authority hierarchy
- [NO MERCY](@/glossary/no-mercy.md) -- doctrine enforcing strict authority compliance
- [Policy](@/glossary/policy.md) -- governance rules enforced through the authority structure
- [RBAC](@/glossary/rbac.md) -- complementary access control for human users
- [Authentication](@/glossary/authentication.md) -- identity verification prerequisite to authority checks

## See Also

- [Erlang Supervision Principles](https://www.erlang.org/doc/design_principles/sup_princ) -- OTP supervision design that influences the authority structure
- [AIAD Standard Documentation](.aiad/README.md) -- complete AIAD framework specification
- [Color-Team Security Operations](.aiad/agents/) -- agent definitions within the authority structure
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
