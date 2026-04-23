+++
title = "Zero Trust"
weight = 50
[extra]
description = "Security architecture paradigm founded on 'never trust, always verify' requiring continuous authentication, authorization, and validation for every access request regardless of network location"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "security-architecture"
related_concepts = ["rbac", "authentication", "authorization", "micro-segmentation", "least-privilege"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 8
prerequisites = ["authentication", "authorization", "rbac", "encryption", "tls"]
learning_path = ["authentication", "authorization", "rbac", "zero-trust", "security-operations"]
interactive_demos = ["/labs/glossary/zero-trust"]
code_examples = ["PrismaticWeb.Plugs.ZeroTrustAuth", "PrismaticWeb.Authorization.RBAC", "PrismaticWeb.LiveView.ZeroTrustHooks"]
external_resources = ["https://www.nist.gov/publications/zero-trust-architecture", "https://cloud.google.com/beyondcorp"]
version_introduced = "0.8.0"
stability_level = "stable"
testing_scenarios = ["token-validation", "device-posture-check", "anomaly-detection", "step-up-auth", "role-enforcement"]
keywords = ["zero trust", "never trust always verify", "continuous verification", "micro-segmentation", "least privilege", "assume breach", "NIST 800-207", "BeyondCorp"]
tags = ["glossary", "security", "architecture", "zero-trust", "authentication", "authorization"]
related_terms = ["rbac", "tls", "oauth2", "penetration-testing", "easm", "attack-surface", "authentication", "authorization", "encryption", "security-operations", "zero-tolerance", "nis2"]
abbreviation = "ZTA"
word_count = 1979
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Zero Trust - Prismatic Platform"
+++

## Definition

Zero Trust is a security architecture paradigm founded on the principle of "never trust, always verify." It eliminates the concept of a trusted internal network, instead requiring continuous authentication, authorization, and validation for every access request regardless of the requester's network location, device posture, or prior authentication status. Every user, device, application, and network flow is treated as potentially hostile until proven otherwise through explicit verification against policy.

In the context of distributed systems and modern cloud-native platforms, Zero Trust represents a fundamental shift from perimeter-centric security to identity-centric and data-centric protection. Rather than drawing boundaries around networks and trusting everything inside, Zero Trust treats every connection, every request, and every session as if it originates from an untrusted network. This paradigm has become essential as organizations adopt cloud services, remote work, microservice architectures, and API-driven integrations that dissolve traditional network perimeters.

## Overview

The Zero Trust model emerged as a direct response to the failures of traditional perimeter-based security. In the legacy model, organizations deployed firewalls at the network boundary and treated everything inside the perimeter as trusted. This architecture failed catastrophically when attackers breached the perimeter -- through phishing, compromised credentials, supply chain attacks, or insider threats -- and found unrestricted lateral movement within the "trusted" internal network. The 2013 Target breach, the 2020 SolarWinds compromise, and countless other incidents demonstrated that perimeter trust is a fundamentally flawed assumption.

The term "Zero Trust" was coined by John Kindervag at Forrester Research in 2010, though the underlying principles -- least privilege, micro-segmentation, and continuous verification -- predate the formal naming. The model gained significant momentum with Google's BeyondCorp initiative (2014), which demonstrated that a large enterprise could operate without a traditional VPN by authenticating every request based on device state and user identity rather than network location. NIST Special Publication 800-207 (2020) formalized Zero Trust Architecture (ZTA) principles for government and enterprise adoption.

Zero Trust is not a single product or technology but an architectural philosophy implemented through the coordinated deployment of multiple security controls:

| Pillar | Purpose | Implementation |
|--------|---------|---------------|
| **Identity** | Verify who is requesting access | MFA, SSO, identity federation, behavioral biometrics |
| **Device** | Verify the device's security posture | Device health attestation, MDM compliance, endpoint detection |
| **Network** | Segment and encrypt all communications | Micro-segmentation, [TLS](@/glossary/tls.md) everywhere, software-defined perimeter |
| **Application** | Authorize access at the application layer | [RBAC](@/glossary/rbac.md), ABAC, just-in-time access, API gateways |
| **Data** | Protect data regardless of location | [Encryption](@/glossary/encryption.md) at rest/in transit, classification, DLP, tokenization |
| **Visibility** | Monitor all access continuously | SIEM, behavioral analytics, audit logging, anomaly detection |

## Technical Details

### Core Principles

**Principle 1: Verify Explicitly** -- Every access request must be authenticated and authorized based on all available data points: user identity, device health, location, service or workload, data classification, and anomaly detection. [Authentication](@/glossary/authentication.md) is not a one-time event; it is continuous throughout the session.

**Principle 2: Least Privilege Access** -- Users and services receive the minimum permissions necessary for their current task, for the minimum duration required. This is implemented through just-in-time (JIT) and just-enough-access (JEA) policies. Standing privileges are eliminated wherever possible.

**Principle 3: Assume Breach** -- The architecture is designed assuming that attackers are already present in the environment. This drives micro-segmentation (limiting blast radius), end-to-end encryption (preventing eavesdropping), continuous monitoring (detecting anomalous behavior), and automated response (containing incidents in real time).

### Architecture Patterns

Zero Trust implementation follows several established architecture patterns:

**Identity-Centric** places identity verification at the center of all access decisions. Every request carries a cryptographically verifiable identity token (JWT, SAML, mTLS certificate) that is validated by the Policy Enforcement Point (PEP) before granting access. This pattern is well-suited for cloud-native applications and API-driven architectures.

**Network-Centric** implements Zero Trust through network-level controls: micro-segmentation using software-defined networking, encrypted tunnels between segments, and network access control lists that default to deny-all. This pattern is common in hybrid environments with legacy infrastructure that cannot be easily modified.

**Data-Centric** focuses on protecting data assets rather than network boundaries or application layers. Data is classified, encrypted, and access-controlled regardless of where it resides. This pattern is essential for organizations handling sensitive data across multiple environments (on-premises, cloud, SaaS).

### Policy Decision Architecture

The Zero Trust policy decision architecture consists of three components:

```
Access Request
    |
    v
[Policy Enforcement Point (PEP)]
    |
    |--- Identity token
    |--- Device posture
    |--- Context (time, location, behavior)
    |
    v
[Policy Decision Point (PDP)]
    |
    |--- Policy rules (RBAC, ABAC, risk-based)
    |--- Threat intelligence
    |--- Historical behavior
    |
    v
[Policy Administration Point (PAP)]
    |
    |--- Policy definition
    |--- Policy updates
    |--- Audit logging
    |
    v
Access Granted / Denied / Step-Up Required
```

### NIST 800-207 Reference Architecture

The NIST Zero Trust Architecture specification defines seven tenets:

1. All data sources and computing services are considered resources
2. All communication is secured regardless of network location
3. Access to individual enterprise resources is granted on a per-session basis
4. Access to resources is determined by dynamic policy
5. The enterprise monitors and measures the integrity and security posture of all owned and associated assets
6. All resource authentication and [authorization](@/glossary/authorization.md) are dynamic and strictly enforced before access is allowed
7. The enterprise collects as much information as possible about the current state of assets, network infrastructure, and communications and uses it to improve its security posture

## Implementation in Prismatic Platform

### Zero Trust Authentication Plug

The Prismatic Platform implements Zero Trust principles across multiple architectural layers:

```elixir
defmodule PrismaticWeb.Plugs.ZeroTrustAuth do
  @moduledoc """
  Zero Trust authentication plug implementing continuous
  verification for every request. No request is trusted
  based on network origin alone.
  """

  import Plug.Conn

  @behaviour Plug

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, opts) do
    conn
    |> verify_identity()
    |> verify_device_posture()
    |> verify_request_context()
    |> enforce_least_privilege(opts)
    |> log_access_decision()
  end

  @spec verify_identity(Plug.Conn.t()) :: Plug.Conn.t()
  defp verify_identity(conn) do
    case extract_and_validate_token(conn) do
      {:ok, claims} ->
        conn
        |> assign(:current_user, claims.sub)
        |> assign(:roles, claims.roles)
        |> assign(:auth_time, claims.iat)

      {:error, :expired} ->
        conn
        |> send_resp(401, "Token expired - reauthentication required")
        |> halt()

      {:error, :invalid} ->
        conn
        |> send_resp(401, "Invalid authentication token")
        |> halt()
    end
  end

  @spec verify_device_posture(Plug.Conn.t()) :: Plug.Conn.t()
  defp verify_device_posture(conn) do
    device_id = get_req_header(conn, "x-device-id") |> List.first()
    device_health = get_req_header(conn, "x-device-health") |> List.first()

    case DevicePosture.evaluate(device_id, device_health) do
      :compliant -> assign(conn, :device_trust, :verified)
      :non_compliant -> assign(conn, :device_trust, :degraded)
      :unknown -> assign(conn, :device_trust, :untrusted)
    end
  end

  @spec verify_request_context(Plug.Conn.t()) :: Plug.Conn.t()
  defp verify_request_context(conn) do
    context = %{
      source_ip: conn.remote_ip |> :inet.ntoa() |> to_string(),
      timestamp: DateTime.utc_now(),
      user_agent: get_req_header(conn, "user-agent") |> List.first(),
      path: conn.request_path,
      method: conn.method
    }

    anomaly_score = BehavioralAnalytics.score(conn.assigns.current_user, context)

    conn
    |> assign(:request_context, context)
    |> assign(:anomaly_score, anomaly_score)
    |> maybe_require_step_up(anomaly_score)
  end

  @spec enforce_least_privilege(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  defp enforce_least_privilege(conn, opts) do
    required_role = Keyword.get(opts, :role)
    required_permission = Keyword.get(opts, :permission)

    user_roles = conn.assigns[:roles] || []

    authorized =
      (is_nil(required_role) or required_role in user_roles) and
      (is_nil(required_permission) or
        RBAC.has_permission?(conn.assigns.current_user, required_permission))

    if authorized do
      conn
    else
      conn
      |> send_resp(403, "Insufficient privileges for requested resource")
      |> halt()
    end
  end

  @spec maybe_require_step_up(Plug.Conn.t(), float()) :: Plug.Conn.t()
  defp maybe_require_step_up(conn, anomaly_score) when anomaly_score > 0.7 do
    conn
    |> send_resp(401, "Step-up authentication required due to anomalous context")
    |> halt()
  end

  defp maybe_require_step_up(conn, _score), do: conn
end
```

### RBAC Integration

The Prismatic Platform's [RBAC](@/glossary/rbac.md) system implements the "Least Privilege Access" pillar of Zero Trust:

```elixir
defmodule PrismaticWeb.Authorization.RBAC do
  @moduledoc """
  Role-Based Access Control implementing Zero Trust
  least privilege principle. Permissions are checked
  on every request, never cached or assumed.
  """

  @type role :: :admin | :analyst | :viewer | :api_consumer
  @type permission :: atom()

  @role_permissions %{
    admin: [:read, :write, :delete, :configure, :manage_users],
    analyst: [:read, :write, :run_assessments, :generate_reports],
    viewer: [:read, :view_dashboards],
    api_consumer: [:read, :api_access]
  }

  @spec has_permission?(String.t(), permission()) :: boolean()
  def has_permission?(user_id, permission) do
    user_id
    |> get_current_roles()
    |> Enum.any?(fn role ->
      permission in Map.get(@role_permissions, role, [])
    end)
  end

  @spec get_current_roles(String.t()) :: list(role())
  def get_current_roles(user_id) do
    # Always query current roles - never cache
    # This ensures revoked roles take immediate effect
    UserStore.get_active_roles(user_id)
  end
end
```

### Micro-Segmentation via Router Pipelines

The platform applies micro-segmentation principles to its umbrella application architecture:

```elixir
defmodule PrismaticWeb.Router do
  use PrismaticWeb, :router

  # Each route pipeline applies Zero Trust verification
  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug PrismaticWeb.Plugs.ZeroTrustAuth
    plug PrismaticWeb.Plugs.CSRFProtection
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RateLimiter
  end

  # Segment 1: Public routes (no authentication)
  scope "/", PrismaticWeb do
    pipe_through :browser
    get "/health", HealthController, :check
  end

  # Segment 2: Authenticated routes (identity verification)
  scope "/dashboard", PrismaticWeb do
    pipe_through [:browser, :require_auth]
    live "/", DashboardLive
  end

  # Segment 3: Admin routes (elevated privileges)
  scope "/admin", PrismaticWeb do
    pipe_through [:browser, :require_auth, :require_admin]
    live "/users", Admin.UsersLive
  end

  # Segment 4: API routes (token-based, rate-limited)
  scope "/api/v1", PrismaticAPI do
    pipe_through :api
    resources "/endpoints", EndpointController, only: [:index, :show]
  end
end
```

### Continuous Session Verification in LiveView

```elixir
defmodule PrismaticWeb.LiveView.ZeroTrustHooks do
  @moduledoc """
  LiveView hooks implementing continuous Zero Trust
  verification throughout the session lifecycle.
  """

  import Phoenix.LiveView

  @spec on_mount(atom(), map(), map(), Phoenix.LiveView.Socket.t()) ::
          {:cont, Phoenix.LiveView.Socket.t()} | {:halt, Phoenix.LiveView.Socket.t()}
  def on_mount(:verify_session, _params, session, socket) do
    case verify_session_token(session["user_token"]) do
      {:ok, user} ->
        socket =
          socket
          |> assign(:current_user, user)
          |> attach_hook(:continuous_verify, :handle_event, &verify_on_event/3)

        {:cont, socket}

      {:error, _reason} ->
        {:halt, redirect(socket, to: "/login")}
    end
  end

  @spec verify_on_event(String.t(), map(), Phoenix.LiveView.Socket.t()) ::
          {:cont, Phoenix.LiveView.Socket.t()} | {:halt, Phoenix.LiveView.Socket.t()}
  defp verify_on_event(_event, _params, socket) do
    # Re-verify on every user interaction
    case revalidate_session(socket.assigns.current_user) do
      :valid -> {:cont, socket}
      :expired -> {:halt, redirect(socket, to: "/login?reason=session_expired")}
      :revoked -> {:halt, redirect(socket, to: "/login?reason=access_revoked")}
    end
  end
end
```

### Multi-Layer Implementation

Zero Trust principles are applied across the entire Prismatic Platform stack:

**Application Layer**: Every LiveView route and API endpoint requires explicit [authentication](@/glossary/authentication.md) and [authorization](@/glossary/authorization.md). The `PrismaticWeb.Plugs.APIAuth` plug validates JWT tokens on every request. Session tokens have configurable expiration and are not refreshed automatically -- users must re-authenticate.

**Service Layer**: Inter-service communication between umbrella applications uses authenticated function calls rather than open network protocols. The Prismatic API validates caller identity before dispatching to facade functions.

**Data Layer**: Database access is mediated through [Ecto](@/glossary/ecto.md) contexts with built-in authorization checks. Direct database queries bypassing the context layer are prohibited by platform policy.

**Infrastructure Layer**: Production deployment on Fly.io uses private networking between application instances. External access is restricted to defined entry points with [TLS](@/glossary/tls.md) termination.

### Color Team Zero Trust Modeling

The Color Teams model adversarial scenarios against the platform's Zero Trust implementation:

- **Red Team**: Simulates credential compromise, token theft, privilege escalation, and lateral movement scenarios assuming Zero Trust controls are in place
- **[Blue Team](@/glossary/blue-team.md)**: Monitors for anomalous access patterns indicating Zero Trust bypass attempts
- **White Team**: Verifies that Zero Trust properties (continuous verification, least privilege) hold formally through [property-based testing](@/glossary/property-based-testing.md)

### EASM Zero Trust Assessment

[EASM](@/glossary/easm.md) evaluates external assets against Zero Trust compliance criteria as part of [security rating](@/glossary/security-rating.md) calculations. Assets exposing services without authentication, using weak encryption, or allowing unauthenticated access paths receive lower security ratings.

## Comparison with Alternatives

| Model | Trust Basis | Verification | Lateral Movement | Scope |
|-------|------------|-------------|-----------------|-------|
| **Zero Trust** | None (verify explicitly) | Continuous, per-request | Blocked by micro-segmentation | All layers |
| **Perimeter Security** | Network location | One-time at boundary | Unrestricted inside perimeter | Network boundary |
| **Defense in Depth** | Layered trust zones | At each layer boundary | Restricted between layers | Multiple layers |
| **Castle-and-Moat** | Inside/outside binary | At drawbridge (VPN) | Free inside the castle | Network perimeter |
| **Software-Defined Perimeter (SDP)** | Identity + context | Per-connection | Limited to authorized services | Network + identity |

Zero Trust subsumes and extends Defense in Depth by adding continuous verification and removing trust assumptions at every layer. SDP implementations (e.g., ZTNA products) are components of a Zero Trust architecture but do not constitute a complete implementation alone. Perimeter and castle-and-moat models are considered legacy approaches that Zero Trust explicitly replaces.

## Best Practices

1. **Start with identity**: Identity verification is the foundation of Zero Trust. Implement strong authentication (MFA, certificate-based) before adding other pillars. Without reliable identity, authorization decisions are meaningless.

2. **Default deny everything**: Every access policy should start from "deny all" and explicitly grant specific permissions. This inverts the traditional "allow by default, block known threats" approach and ensures that new resources are protected from creation.

3. **Eliminate standing privileges**: Replace permanent role assignments with just-in-time access grants that expire automatically. Standing admin privileges are a prime target for attackers and insider threats.

4. **Encrypt everything**: [TLS](@/glossary/tls.md) everywhere is not optional in Zero Trust. All communication -- internal and external -- must be encrypted. Mutual TLS (mTLS) between services provides both [encryption](@/glossary/encryption.md) and service identity verification.

5. **Log and monitor all access**: Every access decision (grant and deny) must be logged with full context. Behavioral analytics on access logs detect anomalous patterns that indicate compromised credentials or insider threats.

6. **Segment aggressively**: Micro-segmentation limits the blast radius of any compromise. An attacker who compromises one service should not gain access to other services. Each application component should authenticate independently.

7. **Treat machine identities equally**: Service accounts, API keys, and certificates require the same Zero Trust controls as human identities. Machine-to-machine communication must be authenticated and authorized on every request.

8. **Implement risk-adaptive policies**: Static policies are a starting point. Mature implementations use risk-based policies that adjust requirements based on device posture, location, behavior, and threat intelligence.

## Common Pitfalls

- **Treating Zero Trust as a product**: Zero Trust is an architecture paradigm, not a product you can buy. Vendors selling "Zero Trust solutions" are selling components (identity providers, SASE, ZTNA) that contribute to a Zero Trust architecture but do not constitute one alone.

- **Implementing only at the perimeter**: Replacing VPN with ZTNA (Zero Trust Network Access) is a step, but true Zero Trust extends to every layer: identity, device, network, application, and data. Perimeter-only implementation leaves internal trust assumptions intact.

- **Neglecting user experience**: Overly aggressive verification can drive users to find workarounds that bypass security controls. Balance security with usability through risk-adaptive authentication that applies friction proportional to risk.

- **Ignoring service-to-service communication**: Many Zero Trust implementations focus on user-to-application access but neglect service-to-service communication. Machine identities (service accounts, API keys, certificates) require the same Zero Trust controls as human identities.

- **Static policies**: Zero Trust policies must adapt to changing conditions. A static "require MFA for admin access" policy is a starting point. Mature implementations use risk-based policies that adjust requirements based on device posture, location, behavior, and threat intelligence.

- **Boiling the ocean**: Attempting to implement Zero Trust across the entire organization simultaneously leads to failure. Start with high-value assets and expand incrementally, measuring effectiveness at each stage.

## Use Cases

**Enterprise Cloud Migration**: Organizations moving workloads from on-premises data centers to cloud platforms dissolve the traditional network perimeter. Zero Trust provides security independent of network topology, protecting resources whether they reside on-premises, in public cloud, or in SaaS applications.

**Remote Workforce**: With employees accessing corporate resources from personal devices on home networks, VPN-based perimeter security becomes impractical. Zero Trust verifies identity and device posture regardless of network location, enabling secure remote access without VPN infrastructure.

**Microservice Architectures**: In systems with hundreds of services communicating over networks (like the Prismatic Platform's 115-app umbrella), each service must authenticate to peers. Zero Trust's per-request verification and micro-segmentation prevent compromised services from accessing unauthorized resources.

**Regulatory Compliance**: Frameworks including [NIS2](@/glossary/nis2.md), [ZKB](@/glossary/zkb.md), and SOC 2 increasingly recommend or require Zero Trust controls. Implementing Zero Trust addresses multiple compliance requirements simultaneously.

**Supply Chain Security**: After incidents like SolarWinds, organizations apply Zero Trust principles to vendor access, requiring continuous verification for third-party connections and limiting vendor access to the minimum necessary scope.

## Related Concepts

- [RBAC](@/glossary/rbac.md) -- Role-based access control implementing Zero Trust authorization
- [Authentication](@/glossary/authentication.md) -- Identity verification foundation for Zero Trust
- [Authorization](@/glossary/authorization.md) -- Access decision enforcement in Zero Trust
- [TLS](@/glossary/tls.md) -- Transport encryption ensuring data confidentiality in Zero Trust
- [OAuth2](@/glossary/oauth2.md) -- Authentication protocol enabling Zero Trust identity verification
- [EASM](@/glossary/easm.md) -- External attack surface management monitoring Zero Trust compliance
- [Penetration Testing](@/glossary/penetration-testing.md) -- Validation of Zero Trust implementation effectiveness
- [Attack Surface](@/glossary/attack-surface.md) -- Exposure area managed through Zero Trust controls
- [Encryption](@/glossary/encryption.md) -- Data protection pillar of Zero Trust architecture
- [NIS2](@/glossary/nis2.md) -- EU directive encouraging Zero Trust adoption
- [Security Rating](@/glossary/security-rating.md) -- Rating incorporating Zero Trust compliance assessment
- [Zero Tolerance](@/glossary/zero-tolerance.md) -- Quality enforcement complementing Zero Trust security

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application ecosystem implementing Zero Trust
- [Agents](@/agents/_index.md) -- Security agents enforcing Zero Trust policies
- [Security Operations](@/glossary/security-operations.md) -- Operational security practices
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Formal verification of Zero Trust properties

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
