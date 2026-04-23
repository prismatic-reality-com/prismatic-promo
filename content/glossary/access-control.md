+++
title = "Access Control"
weight = 50
[extra]
description = "Mechanisms and policies that regulate who or what can view, use, or modify resources within a system, enforced through authentication, authorization, and role-based permission structures"
category = "security"
related_terms = ["authentication", "authorization", "rbac", "credential", "compliance", "consent", "aiad-agent", "plug", "encryption", "tls"]
tags = ["glossary", "access-control", "security", "authorization", "rbac", "permissions", "phoenix", "plug", "otp", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
difficulty = "intermediate"
quality_score = 88
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Access control is the foundational security mechanism that governs resource access through layered policies, enforced via Plug pipelines and AIAD authority levels in the Prismatic Platform"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["access control", "RBAC", "ABAC", "permission management", "Plug pipeline", "authority levels", "security policy", "resource protection", "Phoenix authorization", "AIAD access"]
image = "/images/sections/glossary.png"
image_alt = "Access Control - Prismatic Platform"
word_count = 1050
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

Access control is the set of mechanisms, policies, and technologies that determine which entities -- users, services, agents, or processes -- are permitted to interact with specific resources and in what manner. It operates as the enforcement layer between identity verification ([authentication](@/glossary/authentication.md)) and resource consumption, answering the question: "Now that we know who you are, what are you allowed to do?"

In the Prismatic Platform, access control operates at multiple layers: HTTP request authorization via [Plug](@/glossary/plug.md) pipelines, AIAD agent authority levels governing operational scope, LiveView socket-level permission checks, and inter-service access policies between the 115 umbrella applications.

## Technical Deep Dive

Access control models fall into several categories, each with distinct enforcement characteristics:

| Model | Description | Prismatic Usage | Granularity |
|-------|-------------|-----------------|-------------|
| **DAC** (Discretionary) | Resource owner controls access | File-level permissions | Coarse |
| **MAC** (Mandatory) | System-enforced labels | Agent authority levels | Fine |
| **RBAC** (Role-Based) | Permissions assigned to roles | User roles in web dashboard | Medium |
| **ABAC** (Attribute-Based) | Policies based on attributes | Context-aware API authorization | Very Fine |
| **ReBAC** (Relationship-Based) | Graph-based relationships | Entity relationship access in DD pipeline | Fine |

### Access Control Lists (ACLs) vs. Capabilities

Traditional ACLs attach permission lists to resources ("this file allows users A, B, C"). Capability-based systems invert the model: entities hold unforgeable tokens granting specific access. The Prismatic Platform uses a hybrid approach -- RBAC for web dashboard users and capability-based tokens (JWT with scoped claims) for API consumers and AIAD agents.

### Policy Decision and Enforcement Points

```
Request → [PEP: Plug Pipeline] → [PDP: Policy Engine] → [PIP: Role/Attribute Store]
                    ↓                       ↓
              Deny (403)              Allow (proceed)
```

The Policy Enforcement Point (PEP) intercepts every request. The Policy Decision Point (PDP) evaluates the request against stored policies. The Policy Information Point (PIP) provides the attribute and role data needed for the decision.

## Architecture and Implementation

### Plug-Based Access Control Pipeline

The Prismatic Platform enforces access control through composable Plug pipelines that run after authentication:

```elixir
defmodule PrismaticWeb.Plugs.AccessControl do
  @moduledoc """
  Role-based access control plug for Phoenix pipelines.
  Checks the authenticated identity's roles against the
  required roles for the current route scope.
  """

  import Plug.Conn

  @behaviour Plug

  @type opts :: [required_roles: [atom()], any_of: boolean()]

  @spec init(opts()) :: opts()
  @impl true
  def init(opts) do
    required_roles = Keyword.fetch!(opts, :required_roles)
    any_of = Keyword.get(opts, :any_of, false)
    [required_roles: required_roles, any_of: any_of]
  end

  @spec call(Plug.Conn.t(), opts()) :: Plug.Conn.t()
  @impl true
  def call(conn, opts) do
    identity = conn.assigns[:current_identity]
    required = Keyword.fetch!(opts, :required_roles)
    any_of = Keyword.fetch!(opts, :any_of)

    if authorized?(identity, required, any_of) do
      conn
    else
      conn
      |> put_status(:forbidden)
      |> Phoenix.Controller.json(%{error: "insufficient_permissions"})
      |> halt()
    end
  end

  @spec authorized?(map() | nil, [atom()], boolean()) :: boolean()
  defp authorized?(nil, _required, _any_of), do: false

  defp authorized?(%{roles: roles}, required, true) do
    Enum.any?(required, &(&1 in roles))
  end

  defp authorized?(%{roles: roles}, required, false) do
    Enum.all?(required, &(&1 in roles))
  end
end
```

### AIAD Agent Authority Levels

The AIAD framework implements a hierarchical access control model where each agent operates within a defined authority level:

```elixir
defmodule Prismatic.AIAD.AuthorityGuard do
  @moduledoc """
  Enforces AIAD authority level constraints on agent operations.
  Authority levels form a strict hierarchy: L0 < L1 < L2 < L3 < L4.
  An agent can only invoke operations at or below its authority level.
  """

  @authority_levels [:l0_informational, :l1_operational, :l2_tactical, :l3_strategic, :l4_supreme]

  @spec authorize_operation(atom(), atom()) :: :ok | {:error, :insufficient_authority}
  def authorize_operation(agent_authority, required_authority) do
    agent_index = Enum.find_index(@authority_levels, &(&1 == agent_authority))
    required_index = Enum.find_index(@authority_levels, &(&1 == required_authority))

    if agent_index >= required_index do
      :ok
    else
      {:error, :insufficient_authority}
    end
  end
end
```

## Usage in Prismatic Platform

Access control permeates every layer of the Prismatic Platform:

- **Web Dashboard**: RBAC through Plug pipelines, scoped by route groups (admin, operator, viewer)
- **REST API**: JWT claim-based authorization with scoped permissions per endpoint
- **AIAD Agents**: Authority level hierarchy (L0-L4) controlling operational scope
- **OSINT Tools**: Per-tool access policies governing which users can execute intelligence queries
- **DD Pipeline**: Entity-level access controls on due diligence data
- **Color Teams**: Isolation boundaries preventing cross-team data access (especially Black Team containment)

## Code Examples

### Router-Level Access Control

```elixir
defmodule PrismaticWeb.Router do
  use PrismaticWeb, :router

  pipeline :admin_only do
    plug PrismaticWeb.Plugs.AccessControl,
      required_roles: [:admin],
      any_of: false
  end

  pipeline :operator_access do
    plug PrismaticWeb.Plugs.AccessControl,
      required_roles: [:admin, :operator],
      any_of: true
  end

  scope "/admin", PrismaticWeb.Admin do
    pipe_through [:browser, :browser_auth, :admin_only]
    live "/dashboard", DashboardLive
  end

  scope "/osint", PrismaticWeb do
    pipe_through [:browser, :browser_auth, :operator_access]
    live "/toolbox", OSINT.ToolboxLive
  end
end
```

## Best Practices

1. **Principle of least privilege**: Grant the minimum permissions necessary for each role or agent to perform its function. Over-permissioning creates unnecessary attack surface.

2. **Defense in depth**: Apply access controls at every layer -- network, transport, application, and data. A single enforcement point is a single point of failure.

3. **Fail closed**: When the access control system encounters an error or ambiguity, deny access by default. Never fail open.

4. **Audit all access decisions**: Log both grants and denials with full context (who, what, when, why) for forensic analysis and compliance reporting.

5. **Separate authentication from authorization**: Identity verification and permission evaluation are distinct concerns. Keep them in separate modules with clear interfaces.

6. **Use declarative policies**: Express access control rules as data (role definitions, permission matrices) rather than scattered conditional logic throughout the codebase.

7. **Regular access reviews**: Periodically audit role assignments and permission grants to detect privilege creep and remove stale access.

## Related Terms

- [Authentication](@/glossary/authentication.md) -- identity verification preceding access control decisions
- **Credential** -- proof of identity used in access control flows
- **Compliance** -- regulatory frameworks mandating access control policies
- **Consent** -- data subject approval linked to access control decisions
- [AIAD Agent](@/glossary/aiad-agent.md) -- autonomous agents governed by authority-level access control
- **Containment** -- isolation mechanisms supporting access control boundaries
- **Confidence Score** -- trust metrics informing adaptive access decisions
- **Configuration** -- access control policy configuration management

## See Also

- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) -- industry best practices
- [NIST SP 800-162: ABAC Guide](https://csrc.nist.gov/publications/detail/sp/800-162/final) -- attribute-based access control standard
- [Phoenix Authorization Guide](https://hexdocs.pm/phoenix/authentication.html) -- Phoenix framework authorization patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
