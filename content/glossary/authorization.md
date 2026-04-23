+++
title = "Authorization"
weight = 50
[extra]
tags = ["glossary", "authorization", "access-control", "rbac", "permissions", "security", "policy-enforcement", "privilege-management", "phoenix", "plug", "agent-authorization", "scope-management"]
description = "Process of determining whether an authenticated entity has permission to perform a specific action or access a resource, implemented through RBAC, policy enforcement, and authority level checks in the Prismatic Platform"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "security-and-access-control"
related_concepts = ["authentication", "rbac", "authority-level", "privilege-escalation", "policy", "security-operations", "plug", "aiad"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["authentication", "plug", "phoenix", "rbac"]
learning_path = ["authentication", "authorization", "rbac", "authority-level", "security-operations"]
interactive_demos = ["/labs/glossary/authorization"]
code_examples = ["Plugs.Authorization", "PolicyEngine", "ScopeResolver", "AgentAuthorization"]
external_resources = ["https://hexdocs.pm/phoenix/security.html", "https://csrc.nist.gov/publications/detail/sp/800-162/final", "https://en.wikipedia.org/wiki/Attribute-based_access_control"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["admin_access_all_resources", "viewer_read_only", "scope_boundary_enforcement", "cross_domain_denied", "privilege_escalation_blocked", "policy_evaluation_caching"]
keywords = ["authorization", "access control", "permissions", "RBAC", "ABAC", "policy enforcement", "scope resolution", "privilege check", "resource access", "action permission"]
related_terms = ["authentication", "rbac", "authority-level", "privilege-escalation", "policy", "security-operations", "plug", "aiad", "agent-tier", "credential-management"]
word_count = 1111
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Authorization - Prismatic Platform"
+++

## Definition

Authorization is the process of determining whether an authenticated entity has permission to perform a specific action on a specific resource. While [authentication](@/glossary/authentication.md) answers "Who are you?", authorization answers "Are you allowed to do this?" It is the second critical gate in the security pipeline: after identity is established, the authorization system evaluates the entity's roles, permissions, scopes, and contextual attributes against the access requirements of the requested operation.

In the Prismatic Platform, authorization operates at two distinct levels: **human authorization** through [RBAC](@/glossary/rbac.md) (role-based access control) for users and API consumers, and **agent authorization** through [authority levels](@/glossary/authority-level.md) for AIAD agents. Both systems share the same architectural principles -- explicit permission checks, deny-by-default, and immutable audit trails -- but differ in their policy evaluation mechanisms.

## Overview

Authorization is the enforcement layer that translates security policy into runtime behavior. A well-designed authorization system ensures that:

- **Principle of least privilege**: Every entity can access only what it needs, nothing more
- **Separation of duties**: Critical operations require multiple authorized parties
- **Deny by default**: Any action not explicitly permitted is denied
- **Auditability**: Every authorization decision is logged with full context

The Prismatic Platform's authorization architecture processes thousands of authorization decisions per second across its 115-application umbrella. Performance is critical: authorization checks must complete in microseconds to meet the platform's 250ms page load target. This is achieved through ETS-cached [policy](@/glossary/policy.md) evaluation, compile-time permission resolution where possible, and scope-based short-circuit evaluation.

### Authorization Decision Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────┐
│ Authenticated│────>│ Extract      │────>│ Evaluate     │────>│ Grant / │
│ Request      │     │ Identity +   │     │ Policy       │     │ Deny    │
│              │     │ Requested    │     │              │     │         │
│              │     │ Action       │     │ - RBAC roles │     │         │
│              │     │              │     │ - Scopes     │     │         │
│              │     │              │     │ - Context    │     │         │
└─────────────┘     └──────────────┘     └──────────────┘     └─────────┘
                                                                    │
                                                              ┌─────▼─────┐
                                                              │ Audit Log │
                                                              └───────────┘
```

## Technical Details

### Authorization Models

The platform supports multiple authorization models, selected based on the granularity and dynamism requirements of each subsystem:

| Model | Description | Granularity | Performance | Prismatic Usage |
|-------|-------------|-------------|-------------|-----------------|
| **RBAC** | Role-based access control | Role-level | Fast (ETS lookup) | Primary for human users |
| **Scope-Based** | OAuth2-style scoped permissions | Action-level | Fast (set membership) | API consumers |
| **Authority Level** | L1-L5 hierarchical capabilities | Level + capability | Very fast (integer comparison) | AIAD agents |
| **Policy-Based** | Rule engine evaluation | Arbitrary | Medium (rule evaluation) | Complex cross-domain decisions |
| **ABAC** | Attribute-based access control | Attribute-level | Slow (attribute evaluation) | Future consideration |

### RBAC Implementation

```elixir
defmodule Prismatic.Authorization.RBAC do
  @moduledoc """
  Role-based access control implementation for the Prismatic Platform.

  Roles define sets of permissions. Users are assigned roles.
  Authorization checks verify that the user's roles include
  the permission required for the requested action.

  Roles are hierarchical: an admin role includes all permissions
  of the viewer role plus additional admin-specific permissions.
  """

  @type role :: :admin | :operator | :analyst | :viewer | :api_consumer
  @type permission :: {atom(), atom()}  # {resource, action}
  @type identity :: %{roles: [role()], scopes: [String.t()]}

  @role_hierarchy %{
    admin: [:operator, :analyst, :viewer],
    operator: [:analyst, :viewer],
    analyst: [:viewer],
    viewer: [],
    api_consumer: []
  }

  @role_permissions %{
    admin: [
      {:users, :create}, {:users, :read}, {:users, :update}, {:users, :delete},
      {:agents, :create}, {:agents, :read}, {:agents, :update}, {:agents, :delete},
      {:config, :read}, {:config, :update},
      {:audit, :read}, {:audit, :export},
      {:perimeter, :read}, {:perimeter, :scan}, {:perimeter, :configure}
    ],
    operator: [
      {:agents, :read}, {:agents, :update},
      {:config, :read},
      {:perimeter, :read}, {:perimeter, :scan},
      {:deployments, :create}, {:deployments, :read}
    ],
    analyst: [
      {:agents, :read},
      {:perimeter, :read},
      {:reports, :create}, {:reports, :read},
      {:osint, :read}, {:osint, :search}
    ],
    viewer: [
      {:agents, :read},
      {:perimeter, :read},
      {:reports, :read},
      {:dashboard, :read}
    ],
    api_consumer: []  # Permissions determined by scopes
  }

  @spec authorize(identity(), atom(), atom()) ::
          {:ok, :authorized} | {:error, :forbidden, String.t()}
  def authorize(identity, resource, action) do
    required = {resource, action}
    effective_permissions = effective_permissions(identity)

    if required in effective_permissions do
      log_authorization(:granted, identity, resource, action)
      {:ok, :authorized}
    else
      reason = "No role grants #{resource}:#{action}"
      log_authorization(:denied, identity, resource, action, reason)
      {:error, :forbidden, reason}
    end
  end

  @spec effective_permissions(identity()) :: MapSet.t(permission())
  def effective_permissions(%{roles: roles, scopes: scopes}) do
    role_perms =
      roles
      |> Enum.flat_map(fn role ->
        direct = Map.get(@role_permissions, role, [])
        inherited = inherited_permissions(role)
        direct ++ inherited
      end)
      |> MapSet.new()

    scope_perms =
      scopes
      |> Enum.flat_map(&scope_to_permissions/1)
      |> MapSet.new()

    MapSet.union(role_perms, scope_perms)
  end

  @spec inherited_permissions(role()) :: [permission()]
  defp inherited_permissions(role) do
    @role_hierarchy
    |> Map.get(role, [])
    |> Enum.flat_map(fn inherited_role ->
      Map.get(@role_permissions, inherited_role, []) ++
        inherited_permissions(inherited_role)
    end)
  end

  @spec scope_to_permissions(String.t()) :: [permission()]
  defp scope_to_permissions("perimeter:read"), do: [{:perimeter, :read}]
  defp scope_to_permissions("perimeter:scan"), do: [{:perimeter, :read}, {:perimeter, :scan}]
  defp scope_to_permissions("osint:search"), do: [{:osint, :read}, {:osint, :search}]
  defp scope_to_permissions("agents:read"), do: [{:agents, :read}]
  defp scope_to_permissions(_scope), do: []
end
```

### Authorization Plug Pipeline

```elixir
defmodule PrismaticWeb.Plugs.Authorization do
  @moduledoc """
  Plug-based authorization enforcement for Phoenix routes.

  Must be placed AFTER the Authentication plug in the pipeline.
  Reads the authenticated identity from conn.assigns and evaluates
  the required permission for the current route.

  ## Usage

      plug PrismaticWeb.Plugs.Authorization,
        resource: :perimeter,
        action: :scan

  ## Scope-Based (API routes)

      plug PrismaticWeb.Plugs.Authorization,
        scope: "perimeter:scan"
  """

  import Plug.Conn

  alias Prismatic.Authorization.RBAC
  alias Prismatic.Authorization.ScopeResolver

  @behaviour Plug

  @spec init(keyword()) :: keyword()
  @impl true
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  @impl true
  def call(conn, opts) do
    identity = conn.assigns[:current_identity]

    case identity do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{error: "authentication_required"})
        |> halt()

      identity ->
        evaluate_authorization(conn, identity, opts)
    end
  end

  @spec evaluate_authorization(Plug.Conn.t(), map(), keyword()) :: Plug.Conn.t()
  defp evaluate_authorization(conn, identity, opts) do
    result =
      cond do
        Keyword.has_key?(opts, :scope) ->
          scope = Keyword.fetch!(opts, :scope)
          ScopeResolver.check_scope(identity, scope)

        Keyword.has_key?(opts, :resource) ->
          resource = Keyword.fetch!(opts, :resource)
          action = Keyword.fetch!(opts, :action)
          RBAC.authorize(identity, resource, action)

        true ->
          {:error, :forbidden, "No authorization requirement specified"}
      end

    case result do
      {:ok, :authorized} ->
        conn

      {:error, :forbidden, reason} ->
        conn
        |> put_status(:forbidden)
        |> Phoenix.Controller.json(%{
          error: "forbidden",
          message: "Insufficient permissions",
          detail: reason
        })
        |> halt()
    end
  end
end
```

### Policy Engine for Complex Authorization

```elixir
defmodule Prismatic.Authorization.PolicyEngine do
  @moduledoc """
  Rule-based policy engine for complex authorization decisions
  that cannot be expressed through simple RBAC or scope checks.

  Policies are defined as Elixir modules implementing the
  `Policy` behaviour. Each policy evaluates a context and
  returns an explicit allow/deny decision with rationale.

  ## Example Policy

      defmodule Prismatic.Policies.CrossDomainAccess do
        @behaviour Prismatic.Authorization.PolicyEngine.Policy

        @impl true
        def evaluate(%{requester_domain: req, target_domain: target}) do
          if req == target do
            {:allow, "Same domain access"}
          else
            {:deny, "Cross-domain access requires L3+ authority"}
          end
        end
      end
  """

  @type decision :: {:allow, String.t()} | {:deny, String.t()}
  @type context :: map()

  @callback evaluate(context()) :: decision()

  @spec evaluate_policies([module()], context()) ::
          {:ok, :authorized, [String.t()]} | {:error, :forbidden, [String.t()]}
  def evaluate_policies(policies, context) do
    results = Enum.map(policies, fn policy -> policy.evaluate(context) end)

    denials = for {:deny, reason} <- results, do: reason

    case denials do
      [] ->
        approvals = for {:allow, reason} <- results, do: reason
        {:ok, :authorized, approvals}

      reasons ->
        {:error, :forbidden, reasons}
    end
  end
end
```

### Agent Authorization

AIAD agents use a distinct authorization mechanism based on [authority levels](@/glossary/authority-level.md):

```elixir
defmodule Prismatic.AIAD.AgentAuthorization do
  @moduledoc """
  Authorization module for AIAD agents. Unlike human RBAC,
  agent authorization is based on authority levels (L1-L5)
  and domain scope assignments.

  Agent authorization checks are ultra-fast (ETS lookup +
  integer comparison) because they execute on every agent
  operation in the 530-agent ecosystem.
  """

  alias Prismatic.AIAD.{AuthorityLevel, AuthorityGuard}

  @type agent_context :: %{
          agent_id: String.t(),
          authority_level: AuthorityLevel.t(),
          domain: atom(),
          requested_capability: atom(),
          target_domain: atom() | nil
        }

  @spec authorize_agent_operation(agent_context()) ::
          {:ok, :authorized} | {:error, :forbidden, String.t()}
  def authorize_agent_operation(context) do
    with :ok <- check_authority_level(context),
         :ok <- check_domain_scope(context),
         :ok <- check_capability(context) do
      {:ok, :authorized}
    else
      {:error, reason} -> {:error, :forbidden, reason}
    end
  end

  @spec check_authority_level(agent_context()) :: :ok | {:error, String.t()}
  defp check_authority_level(%{authority_level: level, requested_capability: cap}) do
    min_level = AuthorityLevel.minimum_for_capability(cap)

    if AuthorityLevel.compare(level, min_level) in [:eq, :gt] do
      :ok
    else
      {:error, "#{level} insufficient for #{cap} (requires #{min_level})"}
    end
  end

  @spec check_domain_scope(agent_context()) :: :ok | {:error, String.t()}
  defp check_domain_scope(%{domain: domain, target_domain: nil}), do: :ok
  defp check_domain_scope(%{domain: domain, target_domain: domain}), do: :ok
  defp check_domain_scope(%{authority_level: level} = ctx) do
    if AuthorityLevel.numeric_value(level) >= 4 do
      :ok
    else
      {:error, "Agent in #{ctx.domain} cannot access #{ctx.target_domain} without L4+ authority"}
    end
  end

  @spec check_capability(agent_context()) :: :ok | {:error, String.t()}
  defp check_capability(%{agent_id: agent_id, requested_capability: cap}) do
    case AuthorityGuard.authorize(agent_id, cap) do
      {:ok, :authorized} -> :ok
      {:error, :unauthorized, reason} -> {:error, reason}
    end
  end
end
```

### Authorization Telemetry

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :authz, :check]` | `%{duration: integer}` | `%{model: atom, result: atom}` |
| `[:prismatic, :authz, :rbac, :granted]` | `%{count: 1}` | `%{role: atom, resource: atom, action: atom}` |
| `[:prismatic, :authz, :rbac, :denied]` | `%{count: 1}` | `%{role: atom, resource: atom, action: atom, reason: string}` |
| `[:prismatic, :authz, :agent, :granted]` | `%{count: 1}` | `%{agent_id: string, capability: atom, level: atom}` |
| `[:prismatic, :authz, :agent, :denied]` | `%{count: 1}` | `%{agent_id: string, capability: atom, reason: string}` |
| `[:prismatic, :authz, :policy, :evaluated]` | `%{duration: integer}` | `%{policies: integer, result: atom}` |

## Implementation in Prismatic Platform

### Router Integration

Authorization plugs are applied at the router scope level, ensuring every route has explicit access requirements:

```elixir
scope "/api/v1/perimeter", PrismaticAPI.Perimeter do
  pipe_through [:api, :api_auth]

  # Read-only endpoints require viewer-level access
  get "/assets", AssetController, :index
  get "/ratings", RatingController, :index

  # Scan operations require operator-level access
  scope "/" do
    pipe_through [PrismaticWeb.Plugs.Authorization, resource: :perimeter, action: :scan]
    post "/scan", ScanController, :create
  end

  # Configuration requires admin access
  scope "/config" do
    pipe_through [PrismaticWeb.Plugs.Authorization, resource: :perimeter, action: :configure]
    put "/", ConfigController, :update
  end
end
```

### LiveView Authorization

LiveView pages enforce authorization in the `mount/3` callback:

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  alias Prismatic.Authorization.RBAC

  @impl true
  def mount(_params, session, socket) do
    identity = session["current_identity"]

    case RBAC.authorize(identity, :perimeter, :read) do
      {:ok, :authorized} ->
        {:ok, assign(socket, :identity, identity)}

      {:error, :forbidden, _reason} ->
        {:ok, socket |> put_flash(:error, "Access denied") |> redirect(to: "/")}
    end
  end
end
```

## Comparison with Alternatives

| Approach | Flexibility | Performance | Auditability | Complexity | When to Use |
|----------|-------------|-------------|--------------|------------|-------------|
| **RBAC (current)** | Moderate | Excellent | Good | Low | Known role structures |
| **ABAC** | Very High | Poor | Excellent | Very High | Complex attribute conditions |
| **ACL** | Low | Excellent | Good | Low | Simple resource lists |
| **ReBAC** | High | Good | Good | High | Relationship-heavy domains |
| **Policy-as-Code (OPA)** | Very High | Good | Excellent | High | Multi-service policies |
| **Capability-Based** | High | Excellent | Moderate | Moderate | Distributed systems |

The Prismatic Platform uses RBAC for human users because roles map naturally to organizational structure. Agent authorization uses the simpler authority level model because agent capabilities are more uniform and hierarchical.

## Best Practices

1. **Deny by default**: Every authorization check must return `:forbidden` unless an explicit allow rule matches. Never implement authorization as a blocklist.

2. **Separate authentication from authorization**: These are distinct concerns with distinct modules. The authentication plug establishes identity; the authorization plug checks permissions. Never conflate them.

3. **Cache permission lookups**: Role-to-permission mappings change infrequently. Cache the effective permission set in ETS after first computation to avoid repeated traversal of role hierarchies.

4. **Test denied cases as thoroughly as allowed cases**: Authorization tests should verify that unauthorized entities receive `:forbidden` responses. Testing only the happy path leaves authorization bypasses undetected.

5. **Log all authorization denials**: Denied authorization attempts are security-relevant events. Log them with full context (identity, resource, action, reason) for incident investigation.

6. **Use the most specific authorization model**: RBAC for role-based decisions, scopes for API consumers, authority levels for agents. Mixing models unnecessarily adds complexity.

7. **Avoid inline authorization checks**: Authorization logic should live in dedicated modules (plugs, policy engines), not scattered across controller actions. Inline checks are easy to forget.

## Common Pitfalls

1. **Authorization bypass via direct database access**: If a service bypasses the authorization layer and queries the database directly, all permission checks are meaningless. Enforce authorization at the service boundary.

2. **Inconsistent authorization across channels**: A resource that requires admin access via the REST API but is unrestricted via LiveView WebSocket is a vulnerability. Apply consistent authorization across all access channels.

3. **[Privilege escalation](@/glossary/privilege-escalation.md) through role assignment**: If a user can assign roles to themselves, they can escalate to admin. Role assignment must itself be an authorized operation requiring higher privilege.

4. **Stale permission cache**: When roles or permissions change, cached effective permissions must be invalidated. Serving stale permissions after a role revocation is a security breach window.

5. **Overly broad scopes**: API scopes like `admin:all` defeat the purpose of scoped authorization. Define narrow, action-specific scopes (`perimeter:read`, `osint:search`).

6. **Missing authorization on mutation operations**: Read operations are often well-protected, but mutation operations (create, update, delete) are sometimes left unguarded. Every state-changing operation needs explicit authorization.

## Use Cases

### API Gateway Authorization

External API consumers receive OAuth2 access tokens with specific scopes. The authorization layer verifies that the token's scopes include the permission required for each endpoint, enabling fine-grained API access control without full RBAC.

### Multi-Tenant Resource Isolation

In multi-tenant deployments, authorization ensures that Tenant A cannot access Tenant B's resources even with valid authentication. The policy engine evaluates tenant membership as an additional authorization constraint beyond role checks.

### AIAD Agent Domain Boundaries

The 530+ AIAD agents are authorized within their assigned domains. A security agent cannot modify deployment configurations; a documentation agent cannot trigger security scans. Domain boundary enforcement prevents capability creep across the agent ecosystem.

### Compliance-Driven Access Control

For NIS2 and ZKB compliance (Prismatic Perimeter), authorization policies enforce that only certified operators can initiate compliance assessments and that assessment results are accessible only to authorized reviewers.

### Graduated Access for New Users

New users start with `viewer` role (read-only dashboard access). As they complete onboarding and verification, their role is upgraded through `analyst` to `operator`, gradually expanding their authorized operations.

## Related Concepts

- [Authentication](@/glossary/authentication.md) -- identity verification that precedes authorization
- [RBAC](@/glossary/rbac.md) -- role-based access control, the primary human authorization model
- [Authority Level](@/glossary/authority-level.md) -- hierarchical agent authorization (L1-L5)
- [Privilege Escalation](@/glossary/privilege-escalation.md) -- unauthorized authority increase
- [Policy](@/glossary/policy.md) -- governance rules evaluated during authorization
- [Security Operations](@/glossary/security-operations.md) -- monitoring authorization events for threats
- [Plug](@/glossary/plug.md) -- composable pipeline where authorization checks are enforced
- [AIAD](@/glossary/aiad.md) -- agent framework with built-in authorization model
- [Agent Tier](@/glossary/agent-tier.md) -- functional classification informing authorization scope
- [Credential Management](@/glossary/credential-management.md) -- managing credentials that carry authorization claims

## See Also

- [NIST SP 800-162: Guide to ABAC](https://csrc.nist.gov/publications/detail/sp/800-162/final) -- attribute-based access control standard
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) -- security best practices
- [Phoenix Security Guide](https://hexdocs.pm/phoenix/security.html) -- framework-level security documentation
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
