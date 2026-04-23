+++
title = "RBAC"
weight = 36
[extra]
category = "security"
description = "Role-Based Access Control - authorization model that assigns permissions to roles rather than individual users, simplifying access management and enforcing least-privilege principles"
acronym = "RBAC"
full_name = "Role-Based Access Control"
status = "active"
priority = "critical"
difficulty = "intermediate"
audience = ["security-engineers", "backend-engineers", "architects", "devops", "compliance-officers"]
tags = ["authorization", "access-control", "security", "permissions", "roles", "least-privilege", "separation-of-duties"]
related_terms = ["jwt", "oauth2", "plug", "api-gateway", "encryption-at-rest", "color-teams", "agent-tier", "rate-limiting", "tls", "observability"]
platforms = ["beam", "elixir", "phoenix"]
standards = ["nist-rbac", "ansi-incits-359", "iso-27001"]
use_cases = ["web-authorization", "api-security", "agent-authority", "compliance", "audit"]
tools = ["guardian", "phoenix", "plug", "ecto"]
models = ["rbac0-core", "rbac1-hierarchical", "rbac2-constrained", "rbac3-symmetric"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
license = "GHL"
author = "Tomáš Korcak"
reading_time = "9 min"
word_count = 1871
date_modified = "2026-02-23"
keywords = ["RBAC", "Role-Based", "Access", "Control", "glossary", "security", "Prismatic Platform", "Role", "Operator", "Analyst"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "RBAC - Prismatic Platform"
+++

## Definition

Role-Based Access Control (RBAC) is an authorization model that restricts system access based on roles assigned to users rather than granting permissions directly to individual accounts. First formalized by David Ferraiolo and Richard Kuhn at NIST in 1992, RBAC introduces a layer of indirection between users and permissions: users are assigned one or more roles, and each role carries a defined set of permissions. This indirection dramatically simplifies access management in systems with many users and fine-grained permissions, because administrators manage a relatively small number of role definitions rather than per-user permission matrices.

RBAC follows the principle of least privilege by default -- users receive only the permissions their assigned roles require and nothing more. The model supports role hierarchies, where senior roles inherit permissions from junior roles; separation of duties, which prevents a single user from accumulating conflicting privileges; and permission inheritance, which enables DRY role composition. These properties make RBAC suitable for both simple applications with a handful of roles and complex enterprise systems requiring hundreds of permission combinations.

In the context of modern web applications built with frameworks like [Phoenix](@/glossary/phoenix.md), RBAC is typically enforced at the request-handling layer through middleware or plugs that inspect the authenticated user's role before granting access to protected resources. When combined with token-based authentication such as [JWT](@/glossary/jwt.md), RBAC claims can be embedded directly in the authentication token, enabling stateless authorization decisions without database lookups on every request.

## Core RBAC Model

The NIST RBAC standard (ANSI/INCITS 359-2004) defines four progressive models that build upon each other, providing increasing levels of access control sophistication.

| Model | Name | Description |
|-------|------|-------------|
| **RBAC0** | Core RBAC | Users, roles, permissions, sessions. Minimum viable RBAC. |
| **RBAC1** | Hierarchical RBAC | Adds role hierarchies (general and limited). Senior roles inherit junior permissions. |
| **RBAC2** | Constrained RBAC | Adds separation of duty constraints (static and dynamic). |
| **RBAC3** | Symmetric RBAC | Combines RBAC1 + RBAC2. Full hierarchies with full constraints. |

The fundamental relationships in RBAC form a directed graph where permissions flow from roles to users through explicit assignment.

```
Users ---[assignment]---> Roles ---[grant]---> Permissions ---[target]---> Resources
  |                         |
  |                    [hierarchy]
  |                         |
  v                         v
Sessions              Parent Roles
```

A user activates a subset of their assigned roles within a session. Permissions are never assigned directly to users; they flow exclusively through role membership. This constraint is what distinguishes RBAC from discretionary access control (DAC) and provides its administrative scalability.

## Role Hierarchy and Inheritance

Role hierarchies model organizational structures where senior positions inherit the capabilities of junior positions. In a security platform like Prismatic, the hierarchy reflects the operational authority structure.

| Role | Inherits From | Unique Permissions |
|------|---------------|-------------------|
| **Admin** | Operator, Analyst, Viewer | System configuration, user management, role assignment |
| **Operator** | Analyst, Viewer | OSINT scan execution, asset modification, compliance actions |
| **Analyst** | Viewer | Report generation, risk assessment, alert triage |
| **Viewer** | (none) | Read-only access to dashboards, assets, reports |

Hierarchical inheritance is transitive: if Admin inherits from Operator and Operator inherits from Analyst, then Admin automatically holds all Analyst permissions without explicit assignment. This transitivity reduces administrative burden but requires careful design to prevent unintended privilege accumulation.

Two forms of hierarchy exist in the NIST model:

- **General hierarchy**: Supports multiple inheritance. A role can inherit from many parent roles, forming a directed acyclic graph (DAG). More flexible but harder to reason about.
- **Limited hierarchy**: Restricts inheritance to a single parent, forming a tree. Simpler to reason about but less flexible for complex organizational structures.

## Permission Model

Permissions in RBAC are defined as operations on resources. A permission typically consists of three components that together specify exactly what action is allowed on which entity within what scope.

| Component | Description | Example |
|-----------|-------------|---------|
| **Resource** | The protected entity | `assets`, `reports`, `scans`, `users` |
| **Operation** | The action being performed | `read`, `create`, `update`, `delete`, `execute` |
| **Scope** | Optional constraint on which instances | `own`, `team`, `organization`, `all` |

A complete permission might be expressed as `assets:read:all` (read any asset) or `scans:execute:team` (execute scans within the user's team scope). This three-part structure enables fine-grained access control without combinatorial explosion.

```elixir
defmodule PrismaticWeb.Permissions do
  @moduledoc """
  Permission resolution engine for RBAC authorization.
  Resolves user permissions through role hierarchy traversal,
  supporting the three-part permission model (resource:operation:scope).
  """

  @type resource :: :assets | :reports | :scans | :users | :compliance | :agents
  @type operation :: :read | :create | :update | :delete | :execute
  @type scope :: :own | :team | :organization | :all

  @type permission :: {resource(), operation(), scope()}

  @spec has_permission?(User.t(), permission()) :: boolean()
  def has_permission?(%User{roles: roles}, permission) do
    roles
    |> Enum.flat_map(&resolve_permissions/1)
    |> Enum.any?(&permission_matches?(&1, permission))
  end

  @spec resolve_permissions(Role.t()) :: list(permission())
  defp resolve_permissions(role) do
    role
    |> expand_hierarchy()
    |> Enum.flat_map(& &1.permissions)
    |> Enum.uniq()
  end

  @spec permission_matches?(permission(), permission()) :: boolean()
  defp permission_matches?({r, o, :all}, {r, o, _scope}), do: true
  defp permission_matches?({r, o, s}, {r, o, s}), do: true
  defp permission_matches?(_granted, _required), do: false

  defp expand_hierarchy(role) do
    [role | Enum.flat_map(role.parents || [], &expand_hierarchy/1)]
  end
end
```

## Separation of Duties

Separation of duties (SoD) is a critical RBAC constraint that prevents conflicts of interest by ensuring that no single user can complete a sensitive workflow alone. RBAC2 and RBAC3 support two forms of separation.

**Static Separation of Duties (SSoD)**: Enforced at role assignment time. A user cannot be assigned to mutually exclusive roles. For example, a user cannot simultaneously hold both "Auditor" and "Operator" roles, because an operator should not audit their own actions.

**Dynamic Separation of Duties (DSoD)**: Enforced at session activation time. A user may hold conflicting roles but cannot activate them in the same session. This is more flexible than SSoD, allowing users to switch contexts while maintaining separation.

| SoD Type | Enforcement Point | Example | Prismatic Application |
|----------|-------------------|---------|----------------------|
| **Static** | Role assignment | Auditor and Operator mutually exclusive | Red Team and Blue Team role separation |
| **Dynamic** | Session activation | Cannot activate Admin and Viewer simultaneously | Cannot run OSINT scan and approve compliance in same session |

```elixir
defmodule PrismaticWeb.SeparationOfDuties do
  @moduledoc """
  Enforces static and dynamic separation of duty constraints.
  Prevents conflicting role assignments and simultaneous activation
  of mutually exclusive roles within a single session.
  """

  @mutually_exclusive_roles [
    {:auditor, :operator},
    {:red_team, :blue_team},
    {:compliance_approver, :compliance_submitter}
  ]

  @spec validate_assignment(User.t(), atom()) :: :ok | {:error, :sod_violation}
  def validate_assignment(%User{roles: current_roles}, new_role) do
    conflicting =
      @mutually_exclusive_roles
      |> Enum.filter(fn {a, b} ->
        (a == new_role and b in current_roles) or
        (b == new_role and a in current_roles)
      end)

    case conflicting do
      [] -> :ok
      [{a, b} | _] -> {:error, {:sod_violation, :static, a, b}}
    end
  end

  @spec validate_session_activation(list(atom()), atom()) :: :ok | {:error, :sod_violation}
  def validate_session_activation(active_roles, role_to_activate) do
    conflicting =
      @mutually_exclusive_roles
      |> Enum.filter(fn {a, b} ->
        (a == role_to_activate and b in active_roles) or
        (b == role_to_activate and a in active_roles)
      end)

    case conflicting do
      [] -> :ok
      [{a, b} | _] -> {:error, {:sod_violation, :dynamic, a, b}}
    end
  end
end
```

## Plug-Based RBAC Enforcement

The Prismatic Platform implements RBAC enforcement in the Phoenix request pipeline using [Plug](@/glossary/plug.md) middleware. This ensures that authorization checks occur before any controller logic executes.

```elixir
defmodule PrismaticWeb.Plugs.RequireRole do
  @moduledoc """
  Plug that enforces role-based access control on HTTP requests.
  Checks the authenticated user's roles against the required role
  for the endpoint, supporting hierarchical role inheritance.
  """

  import Plug.Conn

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, required_role: role) do
    case conn.assigns[:current_user] do
      %{roles: roles} when is_list(roles) ->
        if role_satisfied?(roles, role) do
          conn
        else
          conn
          |> put_status(:forbidden)
          |> Phoenix.Controller.json(%{error: "Insufficient permissions", required_role: role})
          |> halt()
        end

      _ ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{error: "Authentication required"})
        |> halt()
    end
  end

  @spec role_satisfied?(list(atom()), atom()) :: boolean()
  defp role_satisfied?(user_roles, required_role) do
    Enum.any?(user_roles, fn role ->
      role == required_role or inherits_from?(role, required_role)
    end)
  end

  @spec inherits_from?(atom(), atom()) :: boolean()
  defp inherits_from?(:admin, _role), do: true
  defp inherits_from?(:operator, role) when role in [:analyst, :viewer], do: true
  defp inherits_from?(:analyst, :viewer), do: true
  defp inherits_from?(_role, _required), do: false
end
```

## Guardian and JWT Integration

The Prismatic Platform uses the Guardian library for [JWT](@/glossary/jwt.md)-based authentication with RBAC claims embedded in tokens. When a user authenticates, their role assignments are serialized into the JWT payload alongside standard claims, enabling stateless authorization decisions.

| JWT Claim | Purpose | Example Value |
|-----------|---------|---------------|
| `sub` | Subject (user identifier) | `"user:42"` |
| `roles` | Assigned role list | `["analyst", "viewer"]` |
| `permissions` | Explicit permission overrides | `["assets:read:all"]` |
| `team` | Team membership for scoping | `"blue-team"` |
| `exp` | Token expiration timestamp | `1706745600` |

Token refresh preserves role information, and role changes take effect at next token issuance. For immediate role revocation (security incidents), the platform maintains a token revocation list checked at the Gateway level, trading pure statelessness for security responsiveness.

## Agent Authority System

Beyond traditional user RBAC, the [AIAD](@/glossary/agent-tier.md) agent level system (L1 through L5) functions as a parallel RBAC hierarchy for autonomous agents. This dual RBAC model -- one for human users, one for AI agents -- is a distinguishing architectural feature of the Prismatic Platform.

| Agent Level | Authority | Equivalent User Role | Capabilities |
|------------|-----------|---------------------|--------------|
| **L1** | Strategic Supreme | Admin | Full platform authority, cross-domain operations |
| **L2** | Tactical | Operator | Domain-specific operations, resource allocation |
| **L3** | Strategic Commander | Operator | Team coordination, multi-agent orchestration |
| **L4** | Operational Specialist | Analyst | Specialized analysis, focused operations |
| **L5** | Worker | Viewer | Data collection, basic processing |

Higher-level agents possess broader operational authority: an L3 Strategic Commander can override decisions made by L4 Operational Specialists within their domain. The agent authority system enforces the same principles as user RBAC -- least privilege, separation of duties, audit logging -- but adapted for autonomous operation.

## Color Team RBAC

The [Color Teams](@/glossary/color-teams.md) security framework leverages RBAC principles to enforce operational boundaries between adversarial and defensive teams.

| Team | Permission Set | Restrictions |
|------|---------------|-------------|
| **Red Team** | Adversarial simulation, synthetic attack generation | No production data access, sandboxed execution only |
| **Blue Team** | Defensive monitoring, signal aggregation | Read-only monitoring, no offensive operations |
| **Purple Team** | Cross-team visibility, synthesis | Cannot directly execute adversarial operations |
| **White Team** | Formal verification, proof construction | Read-only analysis, no system modification |
| **Black Team** | Abstract threat modeling | Maximum isolation, no executable output |
| **Gray Team** | Boundary exploration, edge case discovery | Read-only, zero state changes |

This team-based RBAC ensures that the Red Team cannot accidentally (or intentionally) access production systems, while the Blue Team cannot interfere with adversarial simulations. The Purple Team coordinator has cross-team visibility but cannot directly execute operations in either domain, enforcing separation of duties at the organizational level.

## RBAC vs. Alternative Models

| Model | Approach | Strengths | Weaknesses | Prismatic Usage |
|-------|----------|-----------|------------|-----------------|
| **RBAC** | Role-based | Scalable, auditable, separation of duties | Can become complex with many roles | Primary authorization model |
| **ABAC** | Attribute-based | Context-aware, fine-grained | Complex policy management | Supplementary for OSINT scoping |
| **DAC** | Owner-based | Simple, flexible | No central control, privilege creep | Not used |
| **MAC** | Label-based | Strong isolation, military-grade | Inflexible, high admin overhead | Black Team isolation |
| **ACL** | Per-resource lists | Intuitive, per-object | Does not scale, no hierarchy | File-level permissions only |
| **ReBAC** | Relationship-based | Models real-world relationships | Complex graph evaluation | Under evaluation for KuzuDB |

Prismatic uses RBAC as the primary model, supplemented by attribute-based checks for context-sensitive decisions like OSINT data access scoping (e.g., "Analysts can only view assets within their assigned geographical region").

## Audit and Compliance

RBAC provides strong auditability properties that support compliance with regulations like [GDPR](@/glossary/gdpr.md), [NIS2](@/glossary/nis2.md), and [ISO 27001](@/glossary/iso-27001.md). Every authorization decision can be traced through the role hierarchy to the specific permission grant.

```elixir
defmodule PrismaticWeb.AuthorizationAudit do
  @moduledoc """
  Immutable audit logging for all authorization decisions.
  Captures the full context of each access decision including
  user, role, permission, resource, and outcome.
  """

  require Logger

  @spec log_decision(map()) :: :ok
  def log_decision(%{user_id: user_id, roles: roles, permission: permission,
                     resource: resource, outcome: outcome}) do
    Logger.info("Authorization decision",
      user_id: user_id,
      roles: inspect(roles),
      permission: inspect(permission),
      resource: resource,
      outcome: outcome,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    )
  end
end
```

## Common Anti-Patterns

| Anti-Pattern | Problem | Mitigation |
|-------------|---------|------------|
| **Role explosion** | Creating a unique role for every permission combination | Use permission composition and hierarchy instead |
| **God role** | A single "admin" role with all permissions | Define granular admin sub-roles |
| **Permission creep** | Accumulating roles over time without review | Implement periodic access reviews |
| **Hardcoded roles** | Embedding role names in application logic | Use permission checks, not role name checks |
| **Missing audit** | No logging of role changes or access decisions | Log all authorization events with context |
| **Role-permission coupling** | Defining roles and permissions in the same module | Separate permission definitions from role assignments |
| **Implicit deny failure** | Failing to enforce deny-by-default | Always deny unless explicitly permitted |

## Security Considerations

RBAC implementation requires attention to several security concerns that go beyond the authorization model itself.

- **Least privilege enforcement**: Roles should be defined with minimum necessary permissions. Regular audits should identify and remove unused permission grants.
- **Role assignment governance**: Role assignment should require approval workflows, especially for privileged roles. The Prismatic Platform logs all role changes with immutable audit trails.
- **Token-based RBAC caveats**: When roles are embedded in JWTs, changes do not take effect until token refresh. Critical role revocations need a server-side revocation mechanism.
- **Cross-system consistency**: In distributed systems, RBAC policies must be consistent across all services. The Prismatic [API Gateway](@/glossary/api-gateway.md) serves as the single enforcement point, preventing policy drift.
- **[Encryption at rest](@/glossary/encryption-at-rest.md)**: Role definitions and user-role mappings stored in [PostgreSQL](@/glossary/postgresql.md) should be protected by encryption at rest to prevent unauthorized access to authorization metadata.
- **Session management**: Token expiration and refresh cycles must balance security (short-lived tokens) with usability (not requiring frequent re-authentication).

## Best Practices

**Use permission checks, not role checks**: Application code should check whether the user has a specific permission (e.g., `has_permission?(user, {:assets, :read, :all})`) rather than checking for a specific role name (e.g., `user.role == :admin`). This decouples business logic from role definitions and makes role restructuring safe.

**Define roles around job functions**: Roles should correspond to organizational job functions (Analyst, Operator, Admin) rather than technical capabilities. This makes role assignment intuitive and reduces the need for per-user permission overrides.

**Implement periodic access reviews**: Schedule quarterly or semi-annual reviews of role assignments to identify and remove stale permissions. Users who change positions or leave the organization should have their roles updated promptly.

**Enforce deny-by-default**: Every access check should default to denial. Access is granted only when an explicit permission match is found through the role hierarchy. This prevents accidental access from missing role definitions.

**Log all authorization decisions**: Every access decision -- both grants and denials -- should be logged with full context (user, role, permission, resource, timestamp). These logs are essential for incident investigation and compliance auditing.

## Related Terms

- [JWT](@/glossary/jwt.md) - Token format carrying RBAC claims for stateless authorization
- [OAuth2](@/glossary/oauth2.md) - Authorization framework mapping scopes to RBAC roles
- [API Gateway](@/glossary/api-gateway.md) - Centralized enforcement point for RBAC policies
- [Plug](@/glossary/plug.md) - Elixir middleware implementing RBAC checks in the request pipeline
- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Protects stored role and permission data
- [Agent Tier](@/glossary/agent-tier.md) - AIAD agent authority levels functioning as agent RBAC
- [Color Teams](@/glossary/color-teams.md) - Security teams with role-based operational authority
- [Rate Limiting](@/glossary/rate-limiting.md) - Per-role rate limit policies at the API gateway
- [TLS](@/glossary/tls.md) - Transport encryption protecting RBAC token exchange
- [Observability](@/glossary/observability.md) - Monitoring and auditing authorization decisions
- [GDPR](@/glossary/gdpr.md) - Regulation requiring access control for personal data

## See Also

- [Architecture](@/architecture/_index.md) - Platform security architecture
- [Apps](@/apps/_index.md) - Prismatic API and Web applications
- [OSINT](@/osint/_index.md) - OSINT access control and data scoping

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
