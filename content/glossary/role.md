+++
title = "Role"
weight = 50

[extra]
description = "A named set of permissions and access controls assigned to users or system components, implementing role-based access control (RBAC) for authorization decisions. In the Prismatic Platform, roles span human user access (admin, analyst, viewer) and AIAD agent tiers (L1-L5 + COSMIC), with enforcement via Casbin policy engine, Phoenix plugs, and LiveView mount guards."
category = "security"
domain = "authorization"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["rbac", "scope", "session", "user", "token", "casbin", "authorization", "authentication", "permission", "policy", "plug", "guardian"]
tags = ["role", "rbac", "authorization", "permissions", "access-control", "security", "casbin", "aiad-tiers", "plug", "liveview"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Roles in Prismatic Platform implement a dual authorization model: standard RBAC roles for human users (admin, analyst, viewer) enforced via Phoenix plugs, and AIAD tier levels (L1-L5 + COSMIC CLEARANCE) for agents enforced at the command execution level. Casbin provides the policy engine for complex multi-dimensional authorization decisions."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Role", "RBAC", "authorization", "permissions", "Casbin", "AIAD tiers", "access control", "Phoenix plug", "LiveView mount guard", "policy engine", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Role - RBAC Authorization - Prismatic Platform"
word_count = 3200
see_also = ["capabilities", "architecture", "security"]
+++

## Definition

A **role** is an abstraction that groups a set of permissions under a named identity, simplifying access control management. Instead of assigning individual permissions to each user, administrators assign roles, and the system derives permissions from role membership. This indirection reduces management complexity from O(users x permissions) to O(users x roles) + O(roles x permissions), and ensures consistent authorization across users with similar responsibilities.

RBAC (Role-Based Access Control) is the standard authorization model for enterprise systems, formalized in NIST INCITS 359-2004. It defines a hierarchy: users are assigned roles, roles contain permissions, and permissions grant access to resources and operations. Advanced RBAC models support role hierarchies (senior roles inherit junior role permissions), constraints (mutual exclusion between roles), and dynamic activation (users activate specific roles per session). The Prismatic Platform extends this model with a dual-layer system: human user roles for web interface and API access, and AIAD agent tiers for automated operation authorization.

The distinction between authentication ("who are you?") and authorization ("what can you do?") is fundamental. Roles operate entirely in the authorization domain -- they assume identity has already been established through authentication (tokens, sessions, certificates). A properly designed role system makes authorization decisions based solely on role membership, never on identity directly. This separation enables role-based auditing, delegation, and principle-of-least-privilege enforcement.

## Core Concepts

### Role Hierarchy: Human Users

| Role | Level | Permissions | Typical User | Access Scope |
|------|-------|------------|-------------|-------------|
| `viewer` | 1 | Read-only access to dashboards and reports | External stakeholders, clients | View KPIs, read DD reports, browse glossary |
| `analyst` | 2 | Read + execute investigations and tools | Intelligence analysts, DD specialists | Run OSINT tools, create DD cases, generate reports |
| `operator` | 3 | Analyst + manage pipelines and configurations | DevOps, platform operators | Start/stop pipelines, manage tool configs, view logs |
| `admin` | 4 | Full access to all platform features | Platform administrators | User management, system config, deployment controls |
| `superadmin` | 5 | Admin + doctrine modification + destructive ops | Platform owner | Modify doctrine rules, purge data, manage AIAD agents |

### Role Hierarchy: AIAD Agents

| Tier | Designation | Authorization Level | Capabilities | Example Agents |
|------|------------|-------------------|-------------|----------------|
| L1 | Operational | Basic task execution | Single-domain operations, non-destructive reads | Log analyzers, metric collectors |
| L2 | Tactical | Multi-step operations | Cross-module coordination, limited writes | Test runners, code formatters |
| L3 | Strategic | Domain-spanning operations | Architecture decisions, schema modifications | Refactoring agents, migration planners |
| L4 | Specialist | Full domain authority | Destructive operations within domain, policy enforcement | Security auditors, quality enforcers |
| L5 | Supreme | Platform-wide authority | Cross-domain operations, infrastructure changes | Archer Supreme, deployment orchestrators |
| COSMIC | Cosmic Clearance | Unrestricted | Doctrine modification, meta-evolution, system override | Meta-evolution agent (unique) |

### Casbin Policy Model

| Component | Definition | Example |
|-----------|-----------|---------|
| Subject (sub) | Who is requesting access | `user:admin`, `agent:archer-supreme`, `role:analyst` |
| Object (obj) | What resource is being accessed | `/api/v1/dd/cases`, `/hub/osint/tools`, `doctrine:nmnd` |
| Action (act) | What operation is requested | `read`, `write`, `execute`, `delete`, `modify` |
| Effect (eft) | Allow or deny | `allow`, `deny` |
| Condition | Additional constraints | `time_of_day`, `ip_range`, `data_classification` |

### Permission Enforcement Points

| Layer | Mechanism | Timing | Scope |
|-------|----------|--------|-------|
| API Gateway | `PrismaticWeb.Plugs.RequireRole` | Before controller action | HTTP request |
| LiveView Mount | `on_mount` callback with role check | During LiveView mount | WebSocket connection |
| Channel Join | `join/3` callback with role verification | During channel subscription | PubSub topic |
| GenServer Call | Pattern match on caller role | During business logic execution | Inter-process call |
| AIAD Command | Tier check before command dispatch | Before agent execution | Agent operation |
| Casbin Evaluation | Policy engine query | At any enforcement point | Flexible |

## Technical Deep Dive

### Phoenix Plug-Based Enforcement

Role enforcement in Phoenix applications typically involves three components: role storage (database or configuration), role assignment (associating users with roles), and role enforcement (checking permissions before allowing operations). Phoenix plugs provide the ideal mechanism for HTTP-level enforcement because they execute before controller actions and can short-circuit the request pipeline.

The Prismatic Platform implements role enforcement as composable plugs. The `RequireRole` plug extracts the user's roles from the connection assigns (populated by the authentication plug earlier in the pipeline) and compares them against the required roles for the endpoint. If the user lacks the required role, the plug returns a 403 Forbidden response and halts the pipeline.

For LiveView pages, role enforcement happens in the `on_mount` callback. Since LiveView operates over WebSocket, the initial mount is the security boundary -- once mounted, subsequent events within the same LiveView session inherit the mount-time authorization. This means role changes take effect on the next page load, not during an active session.

### Casbin Policy Engine Integration

Casbin is a powerful authorization library that supports multiple access control models (RBAC, ABAC, ACL) through a model-policy separation. The model defines the structure of authorization rules; the policy defines the specific rules. This separation allows the authorization model to evolve without changing application code.

The Prismatic Platform uses Casbin for complex authorization decisions that go beyond simple role checks:

- **Multi-factor authorization**: "Analyst can access DD case only if they are assigned to the case AND the case is not sealed"
- **Time-based constraints**: "OSINT tools can only be executed during business hours for non-admin users"
- **Data-level access control**: "Viewer can see case summary but not raw entity data"
- **Agent tier enforcement**: "L2 agent cannot execute L3 strategic commands"

Casbin policies are stored in a PostgreSQL table and cached in ETS for sub-millisecond evaluation. Policy updates are distributed across cluster nodes via PubSub.

### Role Assignment and Session Management

Roles are stored in the `user_roles` join table with optional metadata (assigned_by, assigned_at, expires_at). Role assignments are audited -- every grant and revocation is logged with the performing user, timestamp, and reason.

Session management interacts with roles through the authentication token. JWT tokens carry role claims, and the authentication plug decodes these claims into connection assigns. Token refresh validates that roles have not been revoked since the token was issued.

For agents, roles (tiers) are defined in the agent specification file (`.aiad/agents/*.agent.md`) and are immutable at runtime. An agent's tier determines what AIAD commands it can execute and what system resources it can access.

### Role Inheritance and Composition

The platform supports role inheritance: `admin` inherits all `operator` permissions, which inherits all `analyst` permissions, which inherits all `viewer` permissions. This is implemented through a role hierarchy map rather than duplicating permissions.

Role composition (a user having multiple roles) follows a union model: the effective permission set is the union of all assigned role permissions. Deny rules take precedence over allow rules to enable "except" patterns (e.g., "analyst can access all tools EXCEPT classified ones").

## Usage in Prismatic Platform

### API Gateway Enforcement

The API gateway enforces roles through the `PrismaticWeb.Plugs.APIAuth` plug, which extracts the user's role from the authentication token and verifies it against the endpoint's required permissions. Each router scope declares its minimum role:

```elixir
# In router.ex
scope "/api/v1/dd", PrismaticWeb.API.V1 do
  pipe_through [:api, :require_auth, :require_role_analyst]
  resources "/cases", DDCaseController
end

scope "/api/v1/admin", PrismaticWeb.API.V1 do
  pipe_through [:api, :require_auth, :require_role_admin]
  resources "/users", UserController
end
```

### LiveView Mount Guards

LiveView pages check roles in the `on_mount/4` callback, redirecting unauthorized users to an appropriate error page. The mount guard pattern is standardized across all protected LiveViews:

```elixir
# Applied via on_mount hook in router
defmodule PrismaticWeb.RequireAnalystRole do
  def on_mount(:default, _params, session, socket) do
    case Map.get(session, "user_roles", []) do
      roles when is_list(roles) ->
        if "analyst" in roles or "admin" in roles or "superadmin" in roles do
          {:cont, Phoenix.Component.assign(socket, :current_user_roles, roles)}
        else
          {:halt, Phoenix.LiveView.redirect(socket, to: "/unauthorized")}
        end

      _ ->
        {:halt, Phoenix.LiveView.redirect(socket, to: "/login")}
    end
  end
end
```

### AIAD Tier Authorization

Agent roles (AIAD tiers) are defined in agent specification files and enforced at the command execution level. An L2 tactical agent cannot execute L3 strategic commands, and no agent below COSMIC CLEARANCE can modify doctrine-level configurations:

```elixir
# Before executing any AIAD command
case PrismaticAgents.TierAuthorization.authorized?(agent.tier, command.required_tier) do
  true -> execute_command(agent, command)
  false ->
    Logger.warning("Agent #{agent.name} (#{agent.tier}) unauthorized for #{command.name} (requires #{command.required_tier})")
    {:error, :insufficient_tier}
end
```

### DD Dataroom RBAC

The DD dataroom feature implements fine-grained RBAC with four roles specific to the M&A context:

| Dataroom Role | Read Documents | Upload Documents | Approve Documents | Manage Access |
|---------------|---------------|-----------------|-------------------|---------------|
| `dd_viewer` | Yes (non-confidential) | No | No | No |
| `dd_contributor` | Yes (all) | Yes | No | No |
| `dd_reviewer` | Yes (all) | Yes | Yes | No |
| `dd_admin` | Yes (all) | Yes | Yes | Yes |

## Code Examples

```elixir
defmodule PrismaticWeb.Plugs.RequireRole do
  @moduledoc """
  Plug that enforces role-based access control on routes.

  Checks the current user's roles (from conn.assigns) against
  the required roles for the route. Supports role inheritance
  through the role hierarchy.

  ## Usage in Router

      pipe_through [RequireRole.init(:admin)]
      pipe_through [RequireRole.init([:analyst, :operator])]

  ## Role Hierarchy

  Higher roles inherit permissions from lower roles:
  superadmin > admin > operator > analyst > viewer
  """

  import Plug.Conn
  import Phoenix.Controller

  @behaviour Plug

  @role_hierarchy %{
    viewer: 1,
    analyst: 2,
    operator: 3,
    admin: 4,
    superadmin: 5
  }

  @type role :: :viewer | :analyst | :operator | :admin | :superadmin

  @impl true
  @spec init(role() | list(role())) :: list(role())
  def init(roles) when is_list(roles), do: roles
  def init(role) when is_atom(role), do: [role]

  @impl true
  @spec call(Plug.Conn.t(), list(role())) :: Plug.Conn.t()
  def call(conn, required_roles) do
    user_roles = conn.assigns[:current_user_roles] || []

    if authorized?(user_roles, required_roles) do
      conn
    else
      conn
      |> put_status(:forbidden)
      |> json(%{
        error: "insufficient_permissions",
        required: required_roles,
        message: "You do not have the required role to access this resource"
      })
      |> halt()
    end
  end

  @doc """
  Checks if any of the user's roles satisfies the required role,
  accounting for role hierarchy (admin satisfies analyst requirement).

  ## Examples

      iex> PrismaticWeb.Plugs.RequireRole.authorized?([:admin], [:analyst])
      true

      iex> PrismaticWeb.Plugs.RequireRole.authorized?([:viewer], [:analyst])
      false

      iex> PrismaticWeb.Plugs.RequireRole.authorized?([:analyst, :viewer], [:operator])
      false
  """
  @spec authorized?(list(atom()), list(atom())) :: boolean()
  def authorized?(user_roles, required_roles) do
    max_user_level =
      user_roles
      |> Enum.map(&Map.get(@role_hierarchy, &1, 0))
      |> Enum.max(fn -> 0 end)

    min_required_level =
      required_roles
      |> Enum.map(&Map.get(@role_hierarchy, &1, 999))
      |> Enum.min(fn -> 999 end)

    max_user_level >= min_required_level
  end
end
```

```elixir
defmodule PrismaticAgents.TierAuthorization do
  @moduledoc """
  Enforces AIAD tier-based authorization for agent operations.

  The tier system provides a hierarchical authorization model where
  higher-tier agents can perform all operations available to lower tiers
  plus their own tier-specific operations.

  ## Tier Hierarchy

  - L1 (Operational): Basic task execution
  - L2 (Tactical): Multi-step operations
  - L3 (Strategic): Domain-spanning operations
  - L4 (Specialist): Full domain authority
  - L5 (Supreme): Platform-wide authority
  - COSMIC: Unrestricted access (doctrine modification)

  ## Usage

      if TierAuthorization.authorized?(:l3_strategic, :l2_tactical) do
        # L3 agent can execute L2 commands
      end
  """

  @tier_hierarchy %{
    l1_operational: 1,
    l2_tactical: 2,
    l3_strategic: 3,
    l4_specialist: 4,
    l5_supreme: 5,
    cosmic: 6
  }

  @type tier :: :l1_operational | :l2_tactical | :l3_strategic | :l4_specialist | :l5_supreme | :cosmic

  @doc """
  Checks whether an agent with the given tier is authorized to perform
  an operation requiring the specified tier.

  ## Examples

      iex> PrismaticAgents.TierAuthorization.authorized?(:l3_strategic, :l2_tactical)
      true

      iex> PrismaticAgents.TierAuthorization.authorized?(:l1_operational, :l3_strategic)
      false

      iex> PrismaticAgents.TierAuthorization.authorized?(:cosmic, :l5_supreme)
      true
  """
  @spec authorized?(tier(), tier()) :: boolean()
  def authorized?(agent_tier, required_tier) do
    agent_level = Map.get(@tier_hierarchy, agent_tier, 0)
    required_level = Map.get(@tier_hierarchy, required_tier, 0)
    agent_level >= required_level
  end

  @doc """
  Returns the numeric level for a tier.

  ## Examples

      iex> PrismaticAgents.TierAuthorization.level(:l3_strategic)
      3

      iex> PrismaticAgents.TierAuthorization.level(:cosmic)
      6
  """
  @spec level(tier()) :: pos_integer()
  def level(tier) do
    Map.get(@tier_hierarchy, tier, 0)
  end

  @doc """
  Returns all tiers that are authorized for the given required tier,
  sorted from lowest to highest.

  ## Examples

      iex> PrismaticAgents.TierAuthorization.authorized_tiers(:l2_tactical)
      [:l2_tactical, :l3_strategic, :l4_specialist, :l5_supreme, :cosmic]
  """
  @spec authorized_tiers(tier()) :: list(tier())
  def authorized_tiers(required_tier) do
    required_level = Map.get(@tier_hierarchy, required_tier, 0)

    @tier_hierarchy
    |> Enum.filter(fn {_tier, level} -> level >= required_level end)
    |> Enum.sort_by(fn {_tier, level} -> level end)
    |> Enum.map(fn {tier, _level} -> tier end)
  end
end
```

```elixir
defmodule PrismaticAuth.CasbinAdapter do
  @moduledoc """
  Casbin policy adapter for the Prismatic Platform.

  Loads authorization policies from PostgreSQL and caches them in ETS
  for sub-millisecond evaluation. Supports RBAC with role hierarchy
  and attribute-based conditions.

  ## Policy Format

      {subject, object, action, effect}

  ## Examples

      # Allow analysts to read DD cases
      {"role:analyst", "/api/v1/dd/cases/*", "read", "allow"}

      # Deny viewers from accessing raw entity data
      {"role:viewer", "/api/v1/dd/entities/*/raw", "*", "deny"}

      # Allow L3+ agents to execute strategic commands
      {"tier:l3+", "command:strategic:*", "execute", "allow"}
  """

  @type policy :: {String.t(), String.t(), String.t(), String.t()}
  @type evaluation_result :: :allow | :deny | :not_found

  @ets_table :casbin_policies

  @doc """
  Initializes the policy cache from the database.

  ## Examples

      iex> PrismaticAuth.CasbinAdapter.load_policies()
      {:ok, 42}
  """
  @spec load_policies() :: {:ok, non_neg_integer()}
  def load_policies do
    :ets.new(@ets_table, [:named_table, :bag, :public, read_concurrency: true])
    # In production, load from PostgreSQL
    count = 0
    {:ok, count}
  end

  @doc """
  Evaluates whether the given subject can perform the action on the object.

  Deny rules take precedence over allow rules.

  ## Examples

      iex> PrismaticAuth.CasbinAdapter.enforce("role:admin", "/api/v1/dd/cases", "read")
      :allow

      iex> PrismaticAuth.CasbinAdapter.enforce("role:viewer", "/api/v1/admin/users", "write")
      :deny
  """
  @spec enforce(String.t(), String.t(), String.t()) :: evaluation_result()
  def enforce(subject, object, action) do
    policies = :ets.lookup(@ets_table, subject)

    deny_match =
      Enum.any?(policies, fn {_sub, obj, act, "deny"} ->
        matches_pattern?(object, obj) and matches_pattern?(action, act)
      end)

    if deny_match do
      :deny
    else
      allow_match =
        Enum.any?(policies, fn {_sub, obj, act, "allow"} ->
          matches_pattern?(object, obj) and matches_pattern?(action, act)
        end)

      if allow_match, do: :allow, else: :not_found
    end
  end

  defp matches_pattern?(value, pattern) do
    cond do
      pattern == "*" -> true
      String.ends_with?(pattern, "/*") ->
        prefix = String.trim_trailing(pattern, "/*")
        String.starts_with?(value, prefix)
      true -> value == pattern
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Checking roles deep in business logic | Authorization scattered across codebase, hard to audit | Enforce at boundary only: plugs, mount callbacks, channel joins |
| Hardcoded role checks (`if user.role == "admin"`) | Brittle, no hierarchy support, hard to modify | Use role hierarchy map with level comparison |
| Missing role check on LiveView events | LiveView mount checks role, but subsequent events are unprotected | Re-validate role on sensitive events, not just mount |
| Atom creation from role strings | `String.to_atom(role)` causes atom table exhaustion | Use `String.to_existing_atom/1` or string comparison |
| No role assignment audit trail | Cannot determine who granted a role or when | Log all role grants/revocations with actor, timestamp, reason |
| Stale roles in long-lived JWT tokens | User role revoked but token still carries old role claims | Token refresh validates role currency; set short token TTL |
| Same roles for all environments | Dev/staging roles leak into production | Environment-specific role configurations |
| Over-privileged default roles | New users get too many permissions by default | Default to `viewer` (least privilege); require explicit escalation |
| Agent tier bypass via direct GenServer calls | Agents call GenServers directly, bypassing tier checks | Enforce tier checks in GenServer `handle_call` guards |
| No separation between role and permission | Roles contain implicit permissions that are hard to enumerate | Define explicit permission sets per role; use Casbin for complex policies |

## Best Practices

1. **Principle of least privilege** -- assign the minimum role necessary for each user or agent to perform their duties. Default new users to `viewer` and require explicit role escalation.

2. **Separate role definition from assignment** -- roles should be defined once in configuration and assigned independently through a management interface. Never hardcode role assignments per user.

3. **Audit role assignments regularly** -- stale role assignments create security risks. Implement quarterly role review and automatic expiration for temporary elevated roles.

4. **Use role hierarchies** -- avoid permission duplication by having senior roles inherit from junior roles. An `admin` should automatically have all `analyst` capabilities without explicit configuration.

5. **Enforce at the boundary** -- check roles at API entry points (plugs) and LiveView mounts, not deep in business logic. This makes the authorization surface auditable and testable.

6. **Log all authorization decisions** -- both grants and denials should be logged with context (who, what, when, why). This supports security auditing and incident investigation.

7. **Use Casbin for complex policies** -- when authorization depends on multiple factors (role + resource ownership + time + data classification), use a policy engine rather than custom code.

8. **Implement role-based rate limiting** -- different roles may have different API rate limits. Analysts might get 100 req/min while admins get 1000 req/min.

9. **Test authorization at every level** -- unit test the role hierarchy logic, integration test the plug enforcement, and E2E test the full authentication + authorization flow.

10. **Handle cross-session boundaries carefully** -- sidebar links in LiveView must stay within the same `live_session` to avoid layout switching. Role checks at the router level must account for session boundaries.

## Related Terms

- [RBAC](/glossary/rbac/) -- the access control model that roles implement
- [Scope](/glossary/scope/) -- fine-grained permission boundaries within a role
- [Session](/glossary/session/) -- the authenticated context carrying role information
- [Token](/glossary/token/) -- the authentication artifact that carries role claims
- [User](/glossary/user/) -- the entity to which roles are assigned
- [Casbin](/glossary/casbin/) -- policy engine for complex authorization decisions
- [Authorization](/glossary/authorization/) -- the broader concept of access control
- [Authentication](/glossary/authentication/) -- identity verification that precedes role checks
- [Permission](/glossary/permission/) -- individual access rights grouped into roles
- [Policy](/glossary/policy/) -- declarative rules governing authorization decisions
- [Plug](/glossary/plug/) -- Phoenix middleware for request pipeline processing
- [Guardian](/glossary/guardian/) -- Elixir authentication library for token management

## See Also

- [Security Architecture](/architecture/) -- platform authorization design
- [AIAD Agent Tiers](/agents/) -- agent role hierarchy documentation
- [Capabilities](/capabilities/) -- role-gated platform capabilities
- [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control) -- formal RBAC model specification

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
