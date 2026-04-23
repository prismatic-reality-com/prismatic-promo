+++
title = "Authority Level"
weight = 50
[extra]
tags = ["glossary", "authority-level", "aiad", "agent-hierarchy", "access-control", "rbac", "governance", "agent-tier", "l1-l5", "command-authority", "escalation", "security"]
description = "Hierarchical classification (L1-L5) determining what operations an AIAD agent can perform, what resources it can access, and what decisions it can make autonomously within the Prismatic Platform"
category = "aiad"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "agent-governance"
related_concepts = ["agent-tier", "aiad", "authority-structure", "rbac", "chain-of-command", "decision-making-hierarchy", "l1-operational-units", "l5-supreme-authority"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 5
prerequisites = ["aiad", "agent-tier", "otp", "supervision-tree"]
learning_path = ["aiad", "agent-tier", "authority-level", "authority-structure", "chain-of-command"]
interactive_demos = ["/labs/glossary/authority-level"]
code_examples = ["AIAD.AuthorityLevel", "Agent.Authorization", "EscalationManager"]
external_resources = ["https://en.wikipedia.org/wiki/Principle_of_least_privilege", "https://csrc.nist.gov/glossary/term/least_privilege"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["l1_agent_cannot_access_l3_resources", "l5_agent_overrides_lower_levels", "escalation_requires_approval", "authority_downgrade_on_violation", "cross_level_delegation"]
keywords = ["authority level", "L1", "L2", "L3", "L4", "L5", "agent hierarchy", "AIAD governance", "access classification", "privilege tiers", "agent capabilities", "escalation"]
related_terms = ["agent-tier", "aiad", "authority-structure", "rbac", "chain-of-command", "decision-making-hierarchy", "l1-operational-units", "l2-tactical-specialists", "l3-strategic-commanders", "l5-supreme-authority"]
word_count = 1421
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Authority Level - Prismatic Platform"
+++

## Definition

An authority level is a hierarchical classification within the [AIAD](@/glossary/aiad.md) agent framework that precisely determines the scope of operations an agent can perform, the resources it can access, and the decisions it can make autonomously. The Prismatic Platform defines five authority levels (L1 through L5), each with progressively broader capabilities, stricter accountability requirements, and more rigorous qualification criteria. Authority levels implement the principle of least privilege at the agent architecture level: every agent operates at the minimum authority required for its designated function.

Authority levels are distinct from [agent tiers](@/glossary/agent-tier.md), which classify agents by functional role (specialist, coordinator, commander). An agent's tier describes *what* it does; its authority level describes *what it is permitted to do*. A tactical specialist (tier) might operate at L2 authority (level), while a strategic commander (tier) operates at L3.

## Overview

The authority level system is the backbone of governance in the Prismatic Platform's 530+ agent ecosystem. Without strict authority boundaries, autonomous agents could escalate their own capabilities, access resources beyond their domain, or make decisions that should require human oversight. The authority level hierarchy prevents these failure modes through compile-time enforcement, runtime validation, and audit logging.

The system draws from military command structures, operating system privilege rings, and the principle of least privilege from information security. Each level builds on the capabilities of the previous one:

- **L1**: Can execute tasks within a narrow, well-defined scope
- **L2**: Can coordinate multiple L1 agents and make tactical decisions
- **L3**: Can design strategies, allocate resources, and override lower levels
- **L4**: Can modify platform policies and agent configurations
- **L5**: Supreme authority with unrestricted platform access

This hierarchy ensures that routine operations (L1-L2) proceed without bottlenecks, while high-impact decisions (L4-L5) require appropriate authority and accountability.

## Technical Details

### Authority Level Hierarchy

| Level | Name | Agent Count | Scope | Override Authority | Example Agents |
|-------|------|-------------|-------|-------------------|----------------|
| **L1** | [Operational Units](@/glossary/l1-operational-units.md) | ~300 | Single task execution | None | File analyzers, code formatters, test runners |
| **L2** | [Tactical Specialists](@/glossary/l2-tactical-specialists.md) | ~120 | Multi-task coordination | Can override L1 | Security scanners, quality assessors, deployment agents |
| **L3** | [Strategic Commanders](@/glossary/l3-strategic-commanders.md) | ~80 | Domain-wide strategy | Can override L1-L2 | Architecture commanders, security commanders |
| **L4** | Safety-Critical | ~25 | Platform-wide policy | Can override L1-L3 | Quality guardians, escalation guards, abstraction enforcers |
| **L5** | [Supreme Authority](@/glossary/l5-supreme-authority.md) | ~5 | Unrestricted | Can override all | Archer Supreme, Supreme Coordinator |

### Capability Matrix

Each authority level grants specific capabilities that are enforced at runtime:

| Capability | L1 | L2 | L3 | L4 | L5 |
|-----------|----|----|----|----|-----|
| Execute assigned tasks | Yes | Yes | Yes | Yes | Yes |
| Read own domain data | Yes | Yes | Yes | Yes | Yes |
| Read cross-domain data | No | Limited | Yes | Yes | Yes |
| Write own domain data | Yes | Yes | Yes | Yes | Yes |
| Write cross-domain data | No | No | Limited | Yes | Yes |
| Coordinate other agents | No | L1 only | L1-L2 | L1-L3 | All |
| Override lower agents | No | L1 | L1-L2 | L1-L3 | All |
| Modify agent config | No | No | Own domain | All agents | All |
| Modify platform policy | No | No | No | Yes | Yes |
| Emergency halt | No | No | Own domain | Platform-wide | Platform-wide |
| Create new agents | No | No | Propose only | Yes | Yes |
| Destroy agents | No | No | No | With approval | Yes |

### Authority Level Type System

```elixir
defmodule Prismatic.AIAD.AuthorityLevel do
  @moduledoc """
  Type-safe authority level representation with compile-time
  validation and runtime enforcement. Authority levels form a
  strict total order: L1 < L2 < L3 < L4 < L5.

  Every agent in the AIAD framework is assigned exactly one
  authority level at registration time. Level changes require
  explicit approval from an agent at least two levels above
  the target level.
  """

  @type t :: :l1_operational | :l2_tactical | :l3_strategic | :l4_safety_critical | :l5_supreme

  @levels [:l1_operational, :l2_tactical, :l3_strategic, :l4_safety_critical, :l5_supreme]
  @level_values %{
    l1_operational: 1,
    l2_tactical: 2,
    l3_strategic: 3,
    l4_safety_critical: 4,
    l5_supreme: 5
  }

  @spec valid?(t()) :: boolean()
  def valid?(level), do: level in @levels

  @spec compare(t(), t()) :: :lt | :eq | :gt
  def compare(a, b) when a in @levels and b in @levels do
    val_a = Map.fetch!(@level_values, a)
    val_b = Map.fetch!(@level_values, b)

    cond do
      val_a < val_b -> :lt
      val_a == val_b -> :eq
      val_a > val_b -> :gt
    end
  end

  @spec can_override?(t(), t()) :: boolean()
  def can_override?(requester_level, target_level)
      when requester_level in @levels and target_level in @levels do
    compare(requester_level, target_level) == :gt
  end

  @spec minimum_for_capability(atom()) :: t()
  def minimum_for_capability(:execute_task), do: :l1_operational
  def minimum_for_capability(:coordinate_agents), do: :l2_tactical
  def minimum_for_capability(:cross_domain_read), do: :l3_strategic
  def minimum_for_capability(:modify_policy), do: :l4_safety_critical
  def minimum_for_capability(:emergency_halt_platform), do: :l4_safety_critical
  def minimum_for_capability(:destroy_agent), do: :l5_supreme
  def minimum_for_capability(:unrestricted), do: :l5_supreme

  @spec numeric_value(t()) :: 1..5
  def numeric_value(level) when level in @levels do
    Map.fetch!(@level_values, level)
  end

  @spec from_integer(1..5) :: {:ok, t()} | {:error, :invalid_level}
  def from_integer(1), do: {:ok, :l1_operational}
  def from_integer(2), do: {:ok, :l2_tactical}
  def from_integer(3), do: {:ok, :l3_strategic}
  def from_integer(4), do: {:ok, :l4_safety_critical}
  def from_integer(5), do: {:ok, :l5_supreme}
  def from_integer(_), do: {:error, :invalid_level}

  @spec all_levels() :: [t()]
  def all_levels, do: @levels
end
```

### Runtime Authority Enforcement

```elixir
defmodule Prismatic.AIAD.AuthorityGuard do
  @moduledoc """
  Runtime enforcement of authority level constraints.
  Guards agent operations against unauthorized access attempts.
  All violations are logged to an immutable audit trail.
  """

  alias Prismatic.AIAD.AuthorityLevel
  alias Prismatic.AIAD.AgentRegistry

  @type guard_result :: :authorized | {:unauthorized, String.t()}

  @spec authorize(String.t(), atom(), map()) ::
          {:ok, :authorized} | {:error, :unauthorized, String.t()}
  def authorize(agent_id, capability, context \\ %{}) do
    with {:ok, agent} <- AgentRegistry.get(agent_id),
         required_level = AuthorityLevel.minimum_for_capability(capability),
         true <- AuthorityLevel.can_override?(agent.authority_level, required_level) or
                   agent.authority_level == required_level do
      :telemetry.execute(
        [:prismatic, :aiad, :authority, :granted],
        %{count: 1},
        %{agent_id: agent_id, capability: capability, level: agent.authority_level}
      )
      {:ok, :authorized}
    else
      false ->
        reason = "Agent #{agent_id} lacks authority for #{capability}"
        :telemetry.execute(
          [:prismatic, :aiad, :authority, :denied],
          %{count: 1},
          %{agent_id: agent_id, capability: capability, reason: reason}
        )
        {:error, :unauthorized, reason}

      {:error, :not_found} ->
        {:error, :unauthorized, "Agent #{agent_id} not found in registry"}
    end
  end

  @spec check_override(String.t(), String.t()) ::
          {:ok, :override_permitted} | {:error, :insufficient_authority}
  def check_override(requester_id, target_id) do
    with {:ok, requester} <- AgentRegistry.get(requester_id),
         {:ok, target} <- AgentRegistry.get(target_id),
         true <- AuthorityLevel.can_override?(requester.authority_level, target.authority_level) do
      {:ok, :override_permitted}
    else
      _ -> {:error, :insufficient_authority}
    end
  end
end
```

### Escalation Protocol

When an agent needs to perform an operation above its authority level, it must follow the escalation protocol:

```elixir
defmodule Prismatic.AIAD.EscalationManager do
  @moduledoc """
  Manages authority escalation requests. An agent that needs
  capabilities beyond its assigned level must request escalation
  from an agent at least two levels above the target.

  Escalations are time-bounded, scope-limited, and fully audited.
  """

  @type escalation :: %{
          requester: String.t(),
          target_level: AuthorityLevel.t(),
          scope: [atom()],
          ttl_seconds: pos_integer(),
          approved_by: String.t() | nil,
          status: :pending | :approved | :denied | :expired
        }

  @spec request_escalation(String.t(), AuthorityLevel.t(), [atom()], keyword()) ::
          {:ok, escalation()} | {:error, atom()}
  def request_escalation(agent_id, target_level, capabilities, opts \\ []) do
    ttl = Keyword.get(opts, :ttl_seconds, 300)

    with {:ok, agent} <- AgentRegistry.get(agent_id),
         :ok <- validate_escalation_gap(agent.authority_level, target_level),
         {:ok, approver} <- find_approver(target_level) do
      escalation = %{
        requester: agent_id,
        current_level: agent.authority_level,
        target_level: target_level,
        scope: capabilities,
        ttl_seconds: ttl,
        approved_by: nil,
        status: :pending,
        requested_at: DateTime.utc_now()
      }

      notify_approver(approver, escalation)
      {:ok, escalation}
    end
  end

  @spec validate_escalation_gap(AuthorityLevel.t(), AuthorityLevel.t()) ::
          :ok | {:error, :excessive_escalation}
  defp validate_escalation_gap(current, target) do
    gap = AuthorityLevel.numeric_value(target) - AuthorityLevel.numeric_value(current)

    if gap <= 2 do
      :ok
    else
      {:error, :excessive_escalation}
    end
  end
end
```

### Authority Level Audit Trail

All authority-related events are logged to an immutable audit trail:

| Event | Data Captured | Retention |
|-------|--------------|-----------|
| Agent Registration | Agent ID, assigned level, registrar | Permanent |
| Authority Check (granted) | Agent, capability, context | 90 days |
| Authority Check (denied) | Agent, capability, reason | Permanent |
| Escalation Request | Requester, target level, scope | Permanent |
| Escalation Decision | Approver, decision, rationale | Permanent |
| Level Change | Agent, old level, new level, approver | Permanent |
| Override Executed | Requester, target agent, action | Permanent |

## Implementation in Prismatic Platform

The authority level system is implemented across the AIAD framework with three enforcement layers:

### Compile-Time Enforcement

Agent manifest files (`.aiad/agents/*.agent.md`) declare their authority level. The AIAD indexer validates that declared capabilities are consistent with the stated level:

```yaml
# .aiad/agents/code-formatter.agent.md
agent-spec:
  name: code-formatter
  tier: L4 Specialist
  authority_level: L1
  capabilities:
    - format_code        # L1: allowed
    - read_source_files  # L1: allowed
    # - modify_policy    # Would be rejected: L4 required
```

### Runtime Enforcement

Every agent operation passes through the `AuthorityGuard` module before execution. This is not optional -- the guard is integrated into the agent execution pipeline via [OTP](@/glossary/otp.md) middleware.

### Audit Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine mandates that every authority violation triggers an immediate investigation. Repeated violations result in agent quarantine (temporary authority downgrade to L0, which permits no operations).

## Comparison with Alternatives

| Model | Granularity | Dynamic | Audit | Prismatic Fit |
|-------|-------------|---------|-------|---------------|
| **AIAD L1-L5** | 5 levels + capabilities | Limited (escalation) | Full | Current implementation |
| **Unix Permission Bits** | 3 levels (user/group/other) | Static | Minimal | Too coarse for 530 agents |
| **RBAC** | Role-based, arbitrary roles | Dynamic role assignment | Configurable | Complementary (used for human users) |
| **ABAC** | Attribute-based, very fine | Fully dynamic | Configurable | Future consideration |
| **Capability-Based** | Per-capability tokens | Fully dynamic | Per-token | Inspiration for escalation system |
| **Bell-LaPadula** | Classified levels | Static | Full | Influenced L1-L5 design |

The L1-L5 system was chosen because it balances simplicity (only five levels to reason about) with sufficient granularity for the platform's agent hierarchy. The capability matrix within each level provides fine-grained control without the complexity explosion of pure ABAC.

## Best Practices

1. **Assign the minimum authority level**: Every agent should operate at the lowest level that permits its required operations. Over-privileged agents increase the blast radius of bugs or compromises.

2. **Document escalation justification**: When requesting escalation, agents must provide a clear rationale. "I need L3 because I need cross-domain read access to correlate security signals" is valid; "I need L3 because it is more convenient" is not.

3. **Time-bound all escalations**: Escalated authority should have a strict TTL (default 300 seconds). Permanent escalation should be treated as a level change request requiring formal approval.

4. **Audit all denials**: Authority denials are more informative than grants. A pattern of denials suggests either misconfigured agent authority or an attempted privilege escalation.

5. **Test authority boundaries**: Write explicit tests that verify agents cannot perform operations above their authority level. These are regression tests for the governance model.

6. **Separate authority from identity**: An agent's identity (who it is) is separate from its authority (what it can do). The [authentication](@/glossary/authentication.md) system establishes identity; the authority level system determines capabilities.

## Common Pitfalls

1. **Authority inflation**: Over time, agents tend to accumulate authority as "quick fixes" to access issues. Resist this -- every authority increase should be justified and reviewed.

2. **Conflating tier with level**: An agent's functional tier (specialist, commander) does not dictate its authority level. A specialist performing safety-critical functions might legitimately need L4 authority.

3. **Ignoring escalation patterns**: If an agent frequently escalates, it may be assigned the wrong base level. Investigate the pattern rather than normalizing repeated escalation.

4. **Missing override logging**: Overrides (higher-level agent directing a lower-level agent) must be logged even when authorized. Without audit trails, override abuse is undetectable.

5. **Static authority in dynamic contexts**: Some operations require different authority levels depending on context (e.g., reading production data vs. staging data). The capability matrix should account for contextual variations.

## Use Cases

### Quality Gate Enforcement

The Quality Floor Guardian operates at L4 (Safety-Critical) authority, allowing it to block commits, override agent configurations, and trigger emergency quality responses across the entire platform. Lower-level agents cannot bypass its decisions.

### Agent Coordination in Color Teams

Red Team agents operate at L2 (Tactical), coordinating L1 attack simulation specialists. The Red Commander operates at L3, designing overall adversarial scenarios. The Black Team Theorist Commander also operates at L3 but is isolated -- its authority scope is restricted to the theoretical threat modeling domain.

### Escalation for Cross-Domain Investigation

When a Blue Team drift detector (L2) identifies a pattern that requires reading data from multiple domains, it escalates to L3 temporarily through the [chain of command](@/glossary/chain-of-command.md). The Blue Commander (L3) approves a 5-minute escalation window with read-only scope.

### Emergency Platform Halt

Only L4 and L5 agents can trigger a platform-wide emergency halt. This prevents panicked lower-level agents from shutting down the system in response to false positives. The decision to halt requires either Safety-Critical or Supreme authority.

## Related Concepts

- [Agent Tier](@/glossary/agent-tier.md) -- functional classification (specialist, coordinator, commander)
- [AIAD](@/glossary/aiad.md) -- the agent framework that defines authority levels
- [Authority Structure](@/glossary/authority-structure.md) -- the organizational hierarchy governing authority
- [RBAC](@/glossary/rbac.md) -- role-based access control for human users
- [Chain of Command](@/glossary/chain-of-command.md) -- escalation and reporting paths
- [Decision-Making Hierarchy](@/glossary/decision-making-hierarchy.md) -- how decisions flow through authority levels
- [L1 Operational Units](@/glossary/l1-operational-units.md) -- the foundational agent level
- [L2 Tactical Specialists](@/glossary/l2-tactical-specialists.md) -- mid-level coordination agents
- [L3 Strategic Commanders](@/glossary/l3-strategic-commanders.md) -- domain-wide strategy agents
- [L5 Supreme Authority](@/glossary/l5-supreme-authority.md) -- unrestricted platform authority
- [Authentication](@/glossary/authentication.md) -- identity verification prerequisite to authority checks
- [Authorization](@/glossary/authorization.md) -- permission decisions informed by authority levels

## See Also

- [NIST Least Privilege Principle](https://csrc.nist.gov/glossary/term/least_privilege) -- foundational security concept
- [Bell-LaPadula Model](https://en.wikipedia.org/wiki/Bell%E2%80%93LaPadula_model) -- multilevel security model that influenced the L1-L5 design
- [AIAD Standard Documentation](.aiad/README.md) -- complete AIAD framework specification
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
